/**
 * GET /api/stats/subscriber
 * Returns performance metrics for the currently authenticated subscriber.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CECRL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function normScore(score: number | null | undefined, moduleCode: string): number | null {
  if (score == null) return null
  if (moduleCode === 'CE' || moduleCode === 'CO') return Math.round((score / 40) * 100)
  return Math.round(score) // EE/EO already 0-100
}

function bestLevel(levels: (string | null | undefined)[]): string {
  let best = -1
  for (const l of levels) {
    const idx = CECRL_ORDER.indexOf(l ?? '')
    if (idx > best) best = idx
  }
  return best >= 0 ? CECRL_ORDER[best] : '—'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    // ── Fetch all attempts ──────────────────────────────────────────────────
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { series: { include: { module: true } } },
      orderBy: { completedAt: 'asc' },
    })

    // ── Active subscription ─────────────────────────────────────────────────
    const activeOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'VALIDATED',
        expiresAt: { gt: new Date() },
      },
      include: { pack: true },
      orderBy: { expiresAt: 'desc' },
    })

    // ── Summary ─────────────────────────────────────────────────────────────
    const totalAttempts = attempts.length
    const scoredAttempts = attempts.filter((a) => {
      const norm = normScore(
        a.moduleCode === 'CE' || a.moduleCode === 'CO' ? a.score : a.aiScore,
        a.moduleCode
      )
      return norm != null
    })

    const avgScorePercent =
      scoredAttempts.length > 0
        ? Math.round(
            scoredAttempts.reduce((sum, a) => {
              const raw = a.moduleCode === 'CE' || a.moduleCode === 'CO' ? a.score : a.aiScore
              return sum + (normScore(raw, a.moduleCode) ?? 0)
            }, 0) / scoredAttempts.length
          )
        : 0

    const totalMinutes = Math.round(
      attempts.reduce((sum, a) => sum + (a.timeTaken ?? 0), 0) / 60
    )

    const allLevels = attempts.map((a) => a.cecrlLevel)
    const topLevel = bestLevel(allLevels)

    // ── Per-module stats ────────────────────────────────────────────────────
    const moduleCodes = ['CE', 'CO', 'EE', 'EO']
    const moduleNames: Record<string, string> = {
      CE: 'Compréhension Écrite',
      CO: 'Compréhension Orale',
      EE: 'Expression Écrite',
      EO: 'Expression Orale',
    }

    const moduleStats = moduleCodes.map((code) => {
      const mAttempts = attempts.filter((a) => a.moduleCode === code)
      const scored = mAttempts.filter((a) => {
        const raw = code === 'CE' || code === 'CO' ? a.score : a.aiScore
        return normScore(raw, code) != null
      })
      const avg =
        scored.length > 0
          ? Math.round(
              scored.reduce((s, a) => {
                const raw = code === 'CE' || code === 'CO' ? a.score : a.aiScore
                return s + (normScore(raw, code) ?? 0)
              }, 0) / scored.length
            )
          : null
      return {
        code,
        name: moduleNames[code],
        attempts: mAttempts.length,
        avgScore: avg,
        bestCecrl: bestLevel(mAttempts.map((a) => a.cecrlLevel)),
      }
    })

    // ── Score evolution (last 90 days, grouped by week) ──────────────────────
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 90)

    const recentAttempts = attempts.filter((a) => new Date(a.completedAt) >= cutoff)

    // Build weekly buckets
    const weekMap = new Map<
      string,
      { ce: number[]; co: number[]; ee: number[]; eo: number[] }
    >()
    for (const a of recentAttempts) {
      const d = new Date(a.completedAt)
      // ISO week key: YYYY-WW
      const startOfW = new Date(d)
      startOfW.setDate(d.getDate() - d.getDay() + 1) // Monday
      const key = startOfW.toISOString().slice(0, 10)
      if (!weekMap.has(key)) weekMap.set(key, { ce: [], co: [], ee: [], eo: [] })
      const bucket = weekMap.get(key)!
      const raw = a.moduleCode === 'CE' || a.moduleCode === 'CO' ? a.score : a.aiScore
      const norm = normScore(raw, a.moduleCode)
      if (norm != null) {
        const k = a.moduleCode.toLowerCase() as 'ce' | 'co' | 'ee' | 'eo'
        if (k in bucket) bucket[k].push(norm)
      }
    }

    const scoreEvolution = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, b]) => ({
        date,
        ce: b.ce.length ? Math.round(b.ce.reduce((s, v) => s + v, 0) / b.ce.length) : null,
        co: b.co.length ? Math.round(b.co.reduce((s, v) => s + v, 0) / b.co.length) : null,
        ee: b.ee.length ? Math.round(b.ee.reduce((s, v) => s + v, 0) / b.ee.length) : null,
        eo: b.eo.length ? Math.round(b.eo.reduce((s, v) => s + v, 0) / b.eo.length) : null,
      }))

    // ── CECRL distribution ───────────────────────────────────────────────────
    const cecrlDistribution = CECRL_ORDER.map((level) => ({
      level,
      count: attempts.filter((a) => a.cecrlLevel === level).length,
    }))

    // ── Recent attempts (last 8) ────────────────────────────────────────────
    const recent = [...attempts]
      .reverse()
      .slice(0, 8)
      .map((a) => {
        const raw = a.moduleCode === 'CE' || a.moduleCode === 'CO' ? a.score : a.aiScore
        return {
          id: a.id,
          moduleCode: a.moduleCode,
          moduleName: a.series.module.name,
          seriesTitle: a.series.title,
          score: normScore(raw, a.moduleCode),
          cecrlLevel: a.cecrlLevel,
          completedAt: a.completedAt,
        }
      })

    return NextResponse.json({
      summary: {
        totalAttempts,
        avgScorePercent,
        topLevel,
        totalMinutes,
      },
      moduleStats,
      scoreEvolution,
      cecrlDistribution,
      recentAttempts: recent,
      subscription: activeOrder
        ? {
            packName: activeOrder.pack.name,
            expiresAt: activeOrder.expiresAt,
            daysLeft: Math.max(
              0,
              Math.ceil(
                (new Date(activeOrder.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
            ),
            moduleAccess: activeOrder.pack.moduleAccess,
          }
        : null,
    })
  } catch (error) {
    console.error('[API_ERROR] GET /api/stats/subscriber', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
