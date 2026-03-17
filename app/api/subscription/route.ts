import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getActiveSubscription, getUserAccessLevel } from '@/lib/access'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

/** GET /api/subscription — returns the active subscription for the logged-in user */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ subscription: null, accessLevel: 'FREE' })
    }

    const subscription = await getActiveSubscription(session.user.id)
    const accessLevel = await getUserAccessLevel(session.user.id)

    // ── Expiry notifications (fire-and-forget) ────────────────────────────
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 86400000)

    if (subscription?.expiresAt) {
      const daysLeft = Math.ceil(
        (subscription.expiresAt.getTime() - now.getTime()) / 86400000
      )
      if (daysLeft <= 7 && daysLeft > 0) {
        // Warn once per 24h at most
        prisma.notification
          .findFirst({
            where: {
              userId: session.user.id,
              type: 'SUBSCRIPTION_EXPIRING',
              createdAt: { gte: oneDayAgo },
            },
          })
          .then((exists) => {
            if (!exists) {
              createNotification({
                userId: session.user.id,
                type: 'SUBSCRIPTION_EXPIRING',
                title: '⚠️ Abonnement bientôt expiré',
                message: `Votre pack ${subscription.pack.name} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Renouvelez pour conserver votre accès.`,
                actionUrl: '/packs',
              }).catch(console.error)
            }
          })
          .catch(console.error)
      }
    } else {
      // Check for a recently expired subscription (last 30 days)
      prisma.order
        .findFirst({
          where: {
            userId: session.user.id,
            status: 'VALIDATED',
            expiresAt: {
              lt: now,
              gte: new Date(now.getTime() - 30 * 86400000),
            },
          },
          include: { pack: true },
          orderBy: { expiresAt: 'desc' },
        })
        .then((expired) => {
          if (!expired) return
          prisma.notification
            .findFirst({
              where: {
                userId: session.user.id,
                type: 'SUBSCRIPTION_EXPIRED',
                createdAt: { gte: oneDayAgo },
              },
            })
            .then((exists) => {
              if (!exists) {
                createNotification({
                  userId: session.user.id,
                  type: 'SUBSCRIPTION_EXPIRED',
                  title: '⏰ Abonnement expiré',
                  message: `Votre pack ${expired.pack.name} a expiré. Renouvelez pour reprendre votre préparation.`,
                  actionUrl: '/packs',
                }).catch(console.error)
              }
            })
            .catch(console.error)
        })
        .catch(console.error)
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({ subscription, accessLevel })
  } catch (error) {
    console.error('[API_ERROR] GET /api/subscription', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
