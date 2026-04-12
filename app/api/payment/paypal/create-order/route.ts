import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'
import { sendNewOrderEmail } from '@/lib/email'

const schema = z.object({
  packId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
        { status: 400 }
      )
    }

    const { packId, customerName, customerEmail } = parsed.data

    const pack = await prisma.pack.findUnique({ where: { id: packId } })
    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: 'Pack introuvable.' }, { status: 404 })
    }

    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } })
    const discountRate = settings?.discountRate ?? 0
    const usdExchangeRate = settings?.usdExchangeRate ?? 0.00165

    const finalPriceFcfa = Math.round(pack.price * (1 - discountRate / 100))
    const finalPriceUsd = (finalPriceFcfa * usdExchangeRate).toFixed(2)

    // Ensure minimum $0.01 USD
    const amountUsd = Math.max(parseFloat(finalPriceUsd), 0.01).toFixed(2)

    const reference = `TEFLAB-PP-${Date.now()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Create internal order as PENDING before calling PayPal
    const order = await prisma.order.create({
      data: {
        reference,
        visitorName: customerName,
        visitorEmail: customerEmail,
        visitorPhone: '',
        packId,
        userId: session?.user?.id ?? null,
        status: 'PENDING',
        paymentMethod: 'PAYPAL',
      },
    })

    // Notify admin of new automated order (fire-and-forget)
    sendNewOrderEmail({
      reference,
      packName: pack.name,
      price: finalPriceFcfa,
      visitorName: customerName,
      visitorEmail: customerEmail,
      visitorPhone: '—',
      createdAt: order.createdAt,
    }).catch(console.error)

    let approvalUrl: string
    try {
      const result = await createPayPalOrder({
        amountUsd,
        internalRef: reference,
        description: `TEF-LAB — Pack ${pack.name}`,
        returnUrl: `${siteUrl}/api/payment/paypal/capture?ref=${reference}`,
        cancelUrl: `${siteUrl}/packs?payment=cancelled`,
      })
      approvalUrl = result.approvalUrl
    } catch (err) {
      console.error('[PAYPAL] Create order error', err)
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json(
        { error: 'Impossible d\'initialiser le paiement PayPal. Réessayez.' },
        { status: 502 }
      )
    }

    if (!approvalUrl) {
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json({ error: 'Réponse PayPal invalide.' }, { status: 502 })
    }

    return NextResponse.json({ paymentUrl: approvalUrl, reference })
  } catch (error) {
    console.error('[API_ERROR] POST /api/payment/paypal/create-order', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
