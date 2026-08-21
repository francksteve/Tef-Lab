import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { EO_SCORING_PROMPT } from '@/lib/scoring'
import { canAccessSeries, checkAndIncrementAIUsage } from '@/lib/access'
import { config } from '@/lib/config'
import { sendAIResultEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

const eoScoringSchema = z.object({
  transcriptionA: z.string().min(1, 'La transcription de la section A est requise'),
  transcriptionB: z.string().min(1, 'La transcription de la section B est requise'),
  announcementA: z.string().min(1, "L'annonce de la section A est requise"),
  announcementB: z.string().min(1, "L'annonce de la section B est requise"),
  seriesId: z.string().optional(),
  quotaAlreadyConsumed: z.boolean().optional(), // true = quota debited at exam start, skip recheck
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

    // ── 2. Check and consume AI quota (skip if already consumed at exam start)
    let quota: { allowed: boolean; remaining: number; limit: number; isMonthly?: boolean }
    if (data.quotaAlreadyConsumed) {
      // Quota was debited when user clicked "Commencer l'épreuve" — just read current state
      const { getAIUsageToday } = await import('@/lib/access')
      const usage = await getAIUsageToday(userId)
      quota = { allowed: true, remaining: usage.remaining, limit: usage.limit }
    } else {
      quota = await checkAndIncrementAIUsage(userId)
      if (!quota.allowed) {
        const msg = quota.isMonthly
          ? `Quota de corrections IA mensuel atteint (${quota.limit}/mois). Passez à un pack payant pour plus de corrections.`
          : `Quota de corrections IA atteint pour aujourd'hui (${quota.limit}/jour). Revenez demain ou passez à un pack supérieur.`
        return NextResponse.json({ error: msg, remaining: 0, limit: quota.limit }, { status: 429 })
      }
    }

    // ── 3. Call Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
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

    // ── 5. Send motivational email if user has a target for EO (fire-and-forget)
    const parsed = result as { globalCecrlLevel?: string }
    if (parsed.globalCecrlLevel) {
      const CECRL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, targetEO: true },
      })
      if (user?.targetEO && CECRL_ORDER.includes(parsed.globalCecrlLevel) && CECRL_ORDER.includes(user.targetEO)) {
        const metTarget = CECRL_ORDER.indexOf(parsed.globalCecrlLevel) >= CECRL_ORDER.indexOf(user.targetEO)
        sendAIResultEmail({
          clientName: user.name,
          clientEmail: user.email,
          moduleCode: 'EO',
          moduleName: 'Expression Orale',
          cecrlLevel: parsed.globalCecrlLevel,
          targetLevel: user.targetEO,
          metTarget,
          seriesTitle: data.seriesId ?? 'Expression Orale',
        }).catch((err) => console.error('[EMAIL] sendAIResultEmail EO failed:', err))
      }
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
