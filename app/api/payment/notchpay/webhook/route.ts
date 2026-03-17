import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmedEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

/**
 * GET handler — NotchPay redirects the user's browser here after payment
 * (NotchPay uses the `callback` URL for both server notifications and browser redirect).
 * We simply redirect the user to /dashboard with a payment status flag.
 */
export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const ref = searchParams.get('trxref') ?? searchParams.get('reference') ?? ''

  if (status === 'complete' || status === 'success') {
    return NextResponse.redirect(`${siteUrl}/dashboard?payment=success&ref=${ref}`)
  }
  return NextResponse.redirect(`${siteUrl}/packs?payment=cancelled`)
}

/** Verify NotchPay webhook signature */
function verifySignature(payload: string, signature: string, hashKey: string): boolean {
  const computed = crypto
    .createHmac('sha256', hashKey)
    .update(payload)
    .digest('hex')
  return computed === signature
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-notch-signature') ?? ''
    const hashKey = process.env.NOTCHPAY_HASH ?? ''

    // Verify signature only if hash key is configured
    if (hashKey && signature) {
      if (!verifySignature(rawBody, signature, hashKey)) {
        console.warn('[NOTCHPAY WEBHOOK] Invalid signature')
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    const status: string = event?.data?.status ?? event?.transaction?.status ?? ''
    // Prefer merchant_reference / trxref (our internal TEFLAB-NP-... reference)
    // fallback to NotchPay trx.xxx reference for backward compat
    const reference: string =
      event?.data?.merchant_reference ??
      event?.data?.trxref ??
      event?.transaction?.merchant_reference ??
      event?.transaction?.trxref ??
      event?.data?.reference ??
      event?.transaction?.reference ?? ''

    if (!reference) {
      return NextResponse.json({ received: true })
    }

    // Only process successful payments
    if (status !== 'complete' && status !== 'success') {
      console.log(`[NOTCHPAY WEBHOOK] Payment not complete (${status}) for ${reference}`)
      return NextResponse.json({ received: true })
    }

    const order = await prisma.order.findUnique({
      where: { reference },
      include: { pack: true },
    })

    if (!order) {
      console.error(`[NOTCHPAY WEBHOOK] Order not found: ${reference}`)
      return NextResponse.json({ received: true })
    }

    if (order.status === 'VALIDATED') {
      // Already processed (idempotent)
      return NextResponse.json({ received: true })
    }

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + order.pack.durationDays)

    // Activate the order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'VALIDATED',
        activatedAt: now,
        expiresAt,
        paymentReference: reference,
      },
    })

    console.log(`[NOTCHPAY WEBHOOK] ✅ Order ${reference} activated until ${expiresAt.toISOString()}`)

    // In-app notification (fire-and-forget)
    if (order.userId) {
      createNotification({
        userId: order.userId,
        type: 'PAYMENT_CONFIRMED',
        title: '✅ Paiement confirmé !',
        message: `Votre pack ${order.pack.name} est actif jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
        actionUrl: '/dashboard',
      }).catch((err) => {
        console.error('[NOTCHPAY WEBHOOK] Failed to create notification:', err)
      })
    }

    // Send confirmation email to client (fire-and-forget — don't block response)
    sendPaymentConfirmedEmail({
      clientName: order.visitorName,
      clientEmail: order.visitorEmail,
      packName: order.pack.name,
      reference: order.reference,
      activatedAt: now,
      expiresAt,
      moduleAccess: order.pack.moduleAccess,
    }).catch((err) => {
      console.error('[NOTCHPAY WEBHOOK] Failed to send confirmation email:', err)
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[API_ERROR] POST /api/payment/notchpay/webhook', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
