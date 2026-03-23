import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { EO_SCORING_PROMPT } from '@/lib/scoring'
import { canAccessSeries, checkAndIncrementAIUsage } from '@/lib/access'
import { config } from '@/lib/config'

const eoScoringSchema = z.object({
  transcriptionA: z.string().min(1, 'La transcription de la section A est requise'),
  transcriptionB: z.string().min(1, 'La transcription de la section B est requise'),
  announcementA: z.string().min(1, "L'annonce de la section A est requise"),
  announcementB: z.string().min(1, "L'annonce de la section B est requise"),
  seriesId: z.string().optional(), // used for access control
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
    const data = eoScoringSchema.parse(body)

    // ── 1. Verify series access when seriesId is provided
    if (data.seriesId) {
      const hasAccess = await canAccessSeries(userId, data.seriesId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Accès non autorisé à cette série. Abonnez-vous pour accéder à la correction IA.' },
          { status: 403 }
        )
      }
    }

    // ── 2. Check and consume AI quota
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

    // ── 3. Call Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: EO_SCORING_PROMPT,
      messages: [
        {
          role: 'user',
          content: `SECTION A:\nAnnonce: ${data.announcementA}\nTranscription: ${data.transcriptionA}\n\nSECTION B:\nAnnonce: ${data.announcementB}\nTranscription: ${data.transcriptionB}`,
        },
      ],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    // ── 4. Safe JSON parse
    let result: unknown
    try {
      result = JSON.parse(jsonText)
    } catch {
      console.error('[API_ERROR] POST /api/scoring/eo — JSON parse failed:', rawText.slice(0, 200))
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
    console.error('[API_ERROR] POST /api/scoring/eo', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
