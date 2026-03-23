/**
 * POST /api/notifications/expiry
 *
 * Cron job endpoint — call this daily (e.g. via Vercel cron or external scheduler).
 * Secured with CRON_SECRET env var.
 *
 * What it does:
 *  1. Find orders that expired TODAY → send expiry email + in-app notification
 *  2. Find orders expiring in exactly 3 days → send warning email + in-app notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPackExpiredEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function endOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(23, 59, 59, 999)
  return r
}

export async function POST(req: NextRequest) {
  // Protect with CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const today = new Date()
  const in3Days = new Date(today)
  in3Days.setDate(in3Days.getDate() + 3)

  let expiredCount = 0
  let warningCount = 0

  try {
    // ── 1. Orders expired TODAY ──────────────────────────────────────────────
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'VALIDATED',
        expiresAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      include: { pack: true, user: true },
    })

    for (const order of expiredOrders) {
      // Send expiry email
      sendPackExpiredEmail({
        clientName: order.visitorName,
        clientEmail: order.visitorEmail,
        packName: order.pack.name,
      }).catch((err) => console.error('[EXPIRY] email failed:', err))

      // In-app notification (only if linked user)
      if (order.userId) {
        createNotification({
          userId: order.userId,
          type: 'SUBSCRIPTION_EXPIRED',
          title: '⏰ Votre pack a expiré',
          message: `Votre pack ${order.pack.name} est arrivé à expiration. Renouvelez pour continuer votre formation.`,
          actionUrl: '/packs',
        }).catch((err) => console.error('[EXPIRY] notification failed:', err))
      }

      expiredCount++
    }

    // ── 2. Orders expiring in 3 days ─────────────────────────────────────────
    const expiringOrders = await prisma.order.findMany({
      where: {
        status: 'VALIDATED',
        expiresAt: {
          gte: startOfDay(in3Days),
          lte: endOfDay(in3Days),
        },
      },
      include: { pack: true, user: true },
    })

    for (const order of expiringOrders) {
      // In-app warning notification
      if (order.userId) {
        const expiresLabel = new Date(order.expiresAt!).toLocaleDateString('fr-FR', {
          timeZone: 'Africa/Douala',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        createNotification({
          userId: order.userId,
          type: 'SUBSCRIPTION_EXPIRING',
          title: '⚠️ Votre pack expire bientôt',
          message: `Votre pack ${order.pack.name} expire le ${expiresLabel}. Renouvelez-le maintenant pour ne pas perdre votre accès.`,
          actionUrl: '/packs',
        }).catch((err) => console.error('[EXPIRY WARNING] notification failed:', err))
      }

      warningCount++
    }

    return NextResponse.json({
      ok: true,
      expiredProcessed: expiredCount,
      warningsProcessed: warningCount,
      date: today.toISOString(),
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/notifications/expiry', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
