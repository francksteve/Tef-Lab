import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const CAMPAY_BASE =
  process.env.CAMPAY_ENV === 'production'
    ? 'https://www.campay.net/api'
    : 'https://demo.campay.net/api'

async function getCampayToken(): Promise<string> {
  const res = await fetch(`${CAMPAY_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.CAMPAY_USERNAME,
      password: process.env.CAMPAY_PASSWORD,
    }),
  })
  const data = await res.json()
  if (!data.token) throw new Error(`Campay token unavailable: ${JSON.stringify(data)}`)
  return data.token
}

const schema = z.object({
  packId: z.string().min(1),
  phone: z.string().regex(/^\+?237[0-9]{9}$/, 'Format téléphone invalide (+237XXXXXXXXX)'),
  paymentMethod: z.enum(['orange_money', 'mtn_momo']),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
        { status: 400 }
      )
    }

    const { packId, phone, paymentMethod, customerName, customerEmail } = parsed.data

    const pack = await prisma.pack.findUnique({ where: { id: packId } })
    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: 'Pack introuvable.' }, { status: 404 })
    }

    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } })
    const discountRate = settings?.discountRate ?? 0
    const finalPrice = Math.round(pack.price * (1 - discountRate / 100))

    const reference = `TEFLAB-CP-${Date.now()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Campay expects full number without +, e.g. 237675000000
    const campayPhone = phone.replace(/^\+/, '')

    const token = await getCampayToken()

    const collectRes = await fetch(`${CAMPAY_BASE}/collect/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        amount: finalPrice.toString(),
        currency: 'XAF',
        from: campayPhone,
        description: `TEF-LAB — Pack ${pack.name}`,
        external_reference: reference,
        webhook: `${siteUrl}/api/payment/campay/webhook`,
      }),
    })

    const collectData = await collectRes.json()
    console.log('[CAMPAY] collect response', collectData)

    if (!collectRes.ok) {
      return NextResponse.json(
        { error: collectData?.message ?? 'Impossible d\'initier le paiement. Vérifiez votre numéro.' },
        { status: 502 }
      )
    }

    // Create PENDING order
    await prisma.order.create({
      data: {
        reference,
        visitorName: customerName,
        visitorEmail: customerEmail,
        visitorPhone: phone,
        packId,
        userId: session.user.id,
        status: 'PENDING',
        paymentMethod: paymentMethod === 'orange_money' ? 'ORANGE_MONEY' : 'MTN_MOMO',
        paymentReference: collectData.reference ?? reference,
      },
    })

    return NextResponse.json({ reference, campayRef: collectData.reference })
  } catch (error) {
    console.error('[API_ERROR] POST /api/payment/campay', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
