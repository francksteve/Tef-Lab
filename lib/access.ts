import { prisma } from './prisma'

export type AccessLevel = 'FREE' | 'EE_EO' | 'ALL'

/** Returns the highest access level for a user based on their active subscription. */
export async function getUserAccessLevel(userId: string): Promise<AccessLevel> {
  const activeOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: 'VALIDATED',
      expiresAt: { gt: new Date() },
    },
    include: { pack: true },
    orderBy: { expiresAt: 'desc' },
  })

  if (!activeOrder) return 'FREE'
  if (activeOrder.pack.moduleAccess === 'EE_EO') return 'EE_EO'
  return 'ALL'
}

/** Returns the active subscription order (with pack) or null. */
export async function getActiveSubscription(userId: string) {
  return prisma.order.findFirst({
    where: {
      userId,
      status: 'VALIDATED',
      expiresAt: { gt: new Date() },
    },
    include: { pack: true },
    orderBy: { expiresAt: 'desc' },
  })
}

/** Returns true if userId can access seriesId based on their subscription. */
export async function canAccessSeries(
  userId: string,
  seriesId: string
): Promise<boolean> {
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: { module: true },
  })
  if (!series) return false

  const level = await getUserAccessLevel(userId)

  if (level === 'ALL') return true

  if (level === 'EE_EO') {
    return series.module.code === 'EE' || series.module.code === 'EO'
  }

  // FREE: séries isFree en CE/CO + toutes les séries EE et EO (quota IA limité à 2/mois)
  return series.isFree || series.module.code === 'EE' || series.module.code === 'EO'
}

async function getFreeAiLimit(): Promise<number> {
  const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } })
  return settings?.freeAiUsagePerDay ?? 0
}

/**
 * Checks if a user has remaining AI quota and increments the counter.
 * Both free and paid users use a daily quota (YYYY-MM-DD).
 * Free limit is configured in PlatformSettings.freeAiUsagePerDay.
 */
export async function checkAndIncrementAIUsage(
  userId: string
): Promise<{ allowed: boolean; remaining: number; limit: number; isMonthly: boolean }> {
  const subscription = await getActiveSubscription(userId)
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const limit = subscription ? subscription.pack.aiUsagePerDay : await getFreeAiLimit()
  if (limit === 0) return { allowed: false, remaining: 0, limit: 0, isMonthly: false }

  const existing = await prisma.aIUsageLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  const currentCount = existing?.count ?? 0
  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, limit, isMonthly: false }
  }
  await prisma.aIUsageLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  })
  return { allowed: true, remaining: limit - currentCount - 1, limit, isMonthly: false }
}

const DEVICE_TTL_MS = 15 * 60 * 1000 // 15 min — slot freed if no heartbeat

/**
 * Registers (or refreshes) a device for a user and checks if they are within
 * their pack's maxSessions limit.
 *
 * FREE users (no active subscription) are never blocked.
 * Fails open: if Prisma throws (e.g. table not yet migrated), returns allowed.
 */
export async function checkAndRegisterDevice(
  userId: string,
  deviceToken: string
): Promise<{ allowed: boolean; activeCount: number; maxSessions: number }> {
  try {
    const subscription = await getActiveSubscription(userId)

    // No paid subscription → unlimited sessions
    if (!subscription) {
      await prisma.userDevice.upsert({
        where: { userId_deviceToken: { userId, deviceToken } },
        update: { lastSeenAt: new Date() },
        create: { userId, deviceToken },
      })
      return { allowed: true, activeCount: 1, maxSessions: 0 }
    }

    const maxSessions = subscription.pack.maxSessions

    // Refresh this device first
    await prisma.userDevice.upsert({
      where: { userId_deviceToken: { userId, deviceToken } },
      update: { lastSeenAt: new Date() },
      create: { userId, deviceToken },
    })

    // Count active devices (lastSeenAt within TTL)
    const cutoff = new Date(Date.now() - DEVICE_TTL_MS)
    const activeCount = await prisma.userDevice.count({
      where: { userId, lastSeenAt: { gt: cutoff } },
    })

    // Opportunistic cleanup of stale records (~5 % of calls)
    if (Math.random() < 0.05) {
      prisma.userDevice
        .deleteMany({ where: { lastSeenAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } } })
        .catch(() => {})
    }

    return { allowed: activeCount <= maxSessions, activeCount, maxSessions }
  } catch {
    // Table not yet migrated or transient DB error — fail open
    return { allowed: true, activeCount: 1, maxSessions: 0 }
  }
}

/** Returns the current AI usage count and limit for a user (read-only, no increment). */
export async function getAIUsageToday(
  userId: string
): Promise<{ used: number; limit: number; remaining: number; isMonthly: boolean }> {
  const subscription = await getActiveSubscription(userId)
  const limit = subscription ? subscription.pack.aiUsagePerDay : await getFreeAiLimit()
  const today = new Date().toISOString().split('T')[0]
  const log = await prisma.aIUsageLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  const used = log?.count ?? 0
  return { used, limit, remaining: Math.max(0, limit - used), isMonthly: false }
}
