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

  // FREE: only isFree series in CE or CO
  return (
    series.isFree &&
    (series.module.code === 'CE' || series.module.code === 'CO')
  )
}

/**
 * Checks if a user has remaining AI quota for today.
 * If allowed, increments the counter and returns remaining count.
 */
export async function checkAndIncrementAIUsage(
  userId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const subscription = await getActiveSubscription(userId)
  const limit = subscription?.pack.aiUsagePerDay ?? 0

  if (limit === 0) return { allowed: false, remaining: 0, limit: 0 }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const existing = await prisma.aIUsageLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  const currentCount = existing?.count ?? 0
  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, limit }
  }

  await prisma.aIUsageLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  })

  return { allowed: true, remaining: limit - currentCount - 1, limit }
}

/** Returns today's AI usage count and limit for a user. */
export async function getAIUsageToday(
  userId: string
): Promise<{ used: number; limit: number; remaining: number }> {
  const subscription = await getActiveSubscription(userId)
  const limit = subscription?.pack.aiUsagePerDay ?? 0
  const today = new Date().toISOString().split('T')[0]

  const log = await prisma.aIUsageLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  const used = log?.count ?? 0
  return { used, limit, remaining: Math.max(0, limit - used) }
}
