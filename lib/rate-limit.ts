/**
 * Simple in-memory IP-based rate limiter.
 * Designed for Next.js API routes — no external dependency required.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })
 *   const { allowed, retryAfter } = limiter.check(ip)
 *   if (!allowed) return NextResponse.json({ error: '...' }, { status: 429 })
 */

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests allowed per window */
  max: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets (only set when not allowed) */
  retryAfter?: number
}

export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>()

  // Periodically clean up expired entries to avoid unbounded memory growth
  const cleanup = () => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now >= entry.resetAt) store.delete(key)
    })
  }
  // Cleanup every 5 minutes in production; skip in test environments
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 5 * 60_000)
  }

  return {
    check(ip: string): RateLimitResult {
      const now = Date.now()
      const existing = store.get(ip)

      if (!existing || now >= existing.resetAt) {
        // First request in window or window expired
        store.set(ip, { count: 1, resetAt: now + options.windowMs })
        return { allowed: true }
      }

      if (existing.count >= options.max) {
        return {
          allowed: false,
          retryAfter: Math.ceil((existing.resetAt - now) / 1000),
        }
      }

      existing.count += 1
      return { allowed: true }
    },
  }
}
