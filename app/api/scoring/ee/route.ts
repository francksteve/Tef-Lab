import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { EE_SCORING_PROMPT } from '@/lib/scoring'
import { canAccessSeries, checkAndIncrementAIUsage } from '@/lib/access'
import { config } from '@/lib/config'

const eeScoringSchema = z.object({
  task1Text: z.string().min(1, 'Le texte de la tâche 1 est requis'),
  task2Text: z.string().min(1, 'Le texte de la tâche 2 est requis'),
  seriesId: z.string().min(1, 'La série est requise'),
})

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const data = eeScoringSchema.parse(body)

    // ── 1. Verify series exists
    const series = await prisma.series.findUnique({ where: { id: data.seriesId } })
    if (!series) {
      return NextResponse.json({ error: 'Série introuvable' }, { status: 404 })
    }

    // ── 2. Verify user has access to this series
    const hasAccess = await canAccessSeries(userId, data.seriesId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette série. Abonnez-vous pour accéder à la correction IA.' },
        { status: 403 }
      )
    }

    // ── 3. Check and consume AI quota
    const quota = await checkAndIncrementAIUsage(userId)
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Quota de corrections IA atteint pour aujourd'hui (${quota.limit}/jour). Revenez demain ou passez à un pack supérieur.`,
          remaining: 0,
          limit: quota.limit,
        },
        { status: 429 }
      )
    }

    // ── 4. Call Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: EE_SCORING_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Tâche 1:\n${data.task1Text}\n\nTâche 2:\n${data.task2Text}`,
        },
      ],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text
    // Strip markdown fencing and extract JSON object
    let jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    // Fallback: extract first { ... } block if still not valid JSON
    if (!jsonText.startsWith('{')) {
      const start = jsonText.indexOf('{')
      const end = jsonText.lastIndexOf('}')
      if (start !== -1 && end > start) {
        jsonText = jsonText.slice(start, end + 1)
      }
    }

    // ── 5. Safe JSON parse
    let result: unknown
    try {
      result = JSON.parse(jsonText)
    } catch {
      console.error('[API_ERROR] POST /api/scoring/ee — JSON parse failed:', rawText.slice(0, 200))
      return NextResponse.json(
        { error: 'La correction IA a renvoyé une réponse invalide. Veuillez réessayer.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ...result as object, aiQuotaRemaining: quota.remaining })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/scoring/ee', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
