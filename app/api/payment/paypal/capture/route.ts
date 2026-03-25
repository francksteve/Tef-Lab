import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'
import { sendPaymentConfirmedEmail, sendAdminPaymentNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

/**
 * GET — PayPal redirects the user's browser here after approval.
 * Query params: ?token=PAYPAL_ORDER_ID&ref=TEFLAB-PP-xxx
 */
export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') // PayPal order ID
  const ref = searchParams.get('ref')     // Our internal reference

  if (!token || !ref) {
    return NextResponse.redirect(`${siteUrl}/packs?payment=cancelled`)
  }

  try {
    const order = await prisma.order.findUnique({
      where: { reference: ref },
      include: { pack: true },
    })

    if (!order) {
      console.error(`[PAYPAL CAPTURE] Order not found: ${ref}`)
      return NextResponse.redirect(`${siteUrl}/packs?payment=cancelled`)
    }

    // Idempotent — already activated
    if (order.status === 'VALIDATED') {
      return NextResponse.redirect(`${siteUrl}/dashboard?payment=success&ref=${ref}`)
    }

    // Capture the payment with PayPal
    let captureStatus: string
    let captureId: string
    try {
      const result = await capturePayPalOrder(token)
      captureStatus = result.status
      captureId = result.captureId
    } catch (err) {
      console.error(`[PAYPAL CAPTURE] Capture failed for ${ref}:`, err)
      return NextResponse.redirect(`${siteUrl}/packs?payment=failed`)
    }

    if (captureStatus !== 'COMPLETED') {
      console.warn(`[PAYPAL CAPTURE] Payment not completed (${captureStatus}) for ${ref}`)
      return NextResponse.redirect(`${siteUrl}/packs?payment=failed`)
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
        paymentReference: captureId,
      },
    })

    console.log(`[PAYPAL CAPTURE] ✅ Order ${ref} activated until ${expiresAt.toISOString()}`)

    // In-app notification (fire-and-forget)
    if (order.userId) {
      createNotification({
        userId: order.userId,
        type: 'PAYMENT_CONFIRMED',
        title: '✅ Paiement confirmé !',
        message: `Votre pack ${order.pack.name} est actif jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
        actionUrl: '/dashboard',
      }).catch((err) => console.error('[PAYPAL CAPTURE] Notification error:', err))
    }

    // Email to client (fire-and-forget)
    sendPaymentConfirmedEmail({
      clientName: order.visitorName,
      clientEmail: order.visitorEmail,
      packName: order.pack.name,
      price: order.pack.price,
      reference: order.reference,
      activatedAt: now,
      expiresAt,
      moduleAccess: order.pack.moduleAccess,
    }).catch((err) => console.error('[PAYPAL CAPTURE] Email error:', err))

    // Notify admin (fire-and-forget)
    sendAdminPaymentNotification({
      clientName: order.visitorName,
      clientEmail: order.visitorEmail,
      packName: order.pack.name,
      price: order.pack.price,
      reference: order.reference,
      paymentMethod: 'PayPal',
      activatedAt: now,
      expiresAt,
    }).catch((err) => console.error('[PAYPAL CAPTURE] Admin email error:', err))

    return NextResponse.redirect(`${siteUrl}/dashboard?payment=success&ref=${ref}`)
  } catch (error) {
    console.error('[API_ERROR] GET /api/payment/paypal/capture', error)
    return NextResponse.redirect(`${siteUrl}/packs?payment=failed`)
  }
}
