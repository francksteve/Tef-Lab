import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendNewOrderEmail } from '@/lib/email'

const schema = z.object({
  packId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
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

    const { packId, customerName, customerEmail, customerPhone } = parsed.data

    const pack = await prisma.pack.findUnique({ where: { id: packId } })
    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: 'Pack introuvable.' }, { status: 404 })
    }

    // Apply global discount from PlatformSettings
    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } })
    const discountRate = settings?.discountRate ?? 0
    const finalPrice = Math.round(pack.price * (1 - discountRate / 100))

    const reference = `TEFLAB-NP-${Date.now()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Create Order as PENDING before calling NotchPay
    const order = await prisma.order.create({
      data: {
        reference,
        visitorName: customerName,
        visitorEmail: customerEmail,
        visitorPhone: customerPhone,
        packId,
        userId: session?.user?.id ?? null,
        status: 'PENDING',
        paymentMethod: 'NOTCHPAY',
      },
    })

    // Notify admin of new automated order (fire-and-forget)
    sendNewOrderEmail({
      reference,
      packName: pack.name,
      price: finalPrice,
      visitorName: customerName,
      visitorEmail: customerEmail,
      visitorPhone: customerPhone,
      createdAt: order.createdAt,
    }).catch(console.error)

    // Normalize phone: NotchPay expects 9-digit local format (e.g. 675000000)
    // Strip leading + and Cameroon country code 237 if present
    const notchPayPhone = customerPhone.replace(/^\+?237/, '').replace(/\D/g, '')

    // Initialize payment with NotchPay
    const notchPayRes = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCHPAY_PUBLIC_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalPrice,
        currency: 'XAF',
        email: customerEmail,
        phone: notchPayPhone,
        name: customerName,
        description: `TEF-LAB — Pack ${pack.name}`,
        reference,
        callback: `${siteUrl}/api/payment/notchpay/webhook`,
        return_url: `${siteUrl}/dashboard?payment=success&ref=${reference}`,
      }),
    })

    if (!notchPayRes.ok) {
      const err = await notchPayRes.json().catch(() => ({}))
      console.error('[NOTCHPAY] Init error', err)
      // Delete the pending order since payment init failed
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json(
        { error: 'Impossible d\'initialiser le paiement. Réessayez.' },
        { status: 502 }
      )
    }

    const data = await notchPayRes.json()
    const authorizationUrl: string =
      data?.authorization_url ?? data?.transaction?.authorization_url

    if (!authorizationUrl) {
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json(
        { error: 'Réponse NotchPay invalide.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ paymentUrl: authorizationUrl, reference })
  } catch (error) {
    console.error('[API_ERROR] POST /api/payment/notchpay', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
