import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAndIncrementAIUsage, getAIUsageToday } from '@/lib/access'

/** GET /api/ai-usage — returns today's AI usage without incrementing */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ used: 0, limit: 0, remaining: 0 })
    }
    const usage = await getAIUsageToday(session.user.id)
    return NextResponse.json(usage)
  } catch (error) {
    console.error('[API_ERROR] GET /api/ai-usage', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** POST /api/ai-usage — check quota and increment; returns { allowed, remaining, limit } */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const result = await checkAndIncrementAIUsage(session.user.id)
    if (!result.allowed) {
      return NextResponse.json(
        { error: `Quota IA journalier atteint (${result.limit}/jour).`, ...result },
        { status: 429 }
      )
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API_ERROR] POST /api/ai-usage', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
