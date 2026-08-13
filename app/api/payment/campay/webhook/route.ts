import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmedEmail, sendAdminPaymentNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[CAMPAY_WEBHOOK]', JSON.stringify(body))

    const { status, external_reference, reference } = body

    if (!external_reference) {
      return NextResponse.json({ received: true })
    }

    const order = await prisma.order.findFirst({
      where: { reference: external_reference },
      include: { pack: true },
    })

    if (!order) {
      console.warn('[CAMPAY_WEBHOOK] Order not found:', external_reference)
      return NextResponse.json({ received: true })
    }

    // Idempotent
    if (order.status === 'VALIDATED') {
      return NextResponse.json({ received: true })
    }

    if (status === 'SUCCESSFUL') {
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + order.pack.durationDays)

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'VALIDATED',
          activatedAt: now,
          expiresAt,
          paymentReference: reference ?? order.paymentReference,
        },
      })

      console.log(`[CAMPAY_WEBHOOK] ✅ Order ${external_reference} activated until ${expiresAt.toISOString()}`)

      if (order.userId) {
        createNotification({
          userId: order.userId,
          type: 'PAYMENT_CONFIRMED',
          title: '✅ Paiement confirmé !',
          message: `Votre pack ${order.pack.name} est actif jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
          actionUrl: '/dashboard',
        }).catch(console.error)
      }

      sendPaymentConfirmedEmail({
        clientName: order.visitorName,
        clientEmail: order.visitorEmail,
        packName: order.pack.name,
        price: order.pack.price,
        reference: order.reference,
        activatedAt: now,
        expiresAt,
        moduleAccess: order.pack.moduleAccess,
      }).catch(console.error)

      sendAdminPaymentNotification({
        clientName: order.visitorName,
        clientEmail: order.visitorEmail,
        packName: order.pack.name,
        price: order.pack.price,
        reference: order.reference,
        paymentMethod: 'Campay',
        activatedAt: now,
        expiresAt,
      }).catch(console.error)
    } else if (status === 'FAILED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'REJECTED' },
      })
      console.log(`[CAMPAY_WEBHOOK] ❌ Order ${external_reference} rejected`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[API_ERROR] POST /api/payment/campay/webhook', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
