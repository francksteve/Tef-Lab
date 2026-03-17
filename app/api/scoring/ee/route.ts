import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { EE_SCORING_PROMPT } from '@/lib/scoring'
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

    const body = await req.json()
    const data = eeScoringSchema.parse(body)

    // Verify series exists
    const series = await prisma.series.findUnique({
      where: { id: data.seriesId },
    })

    if (!series) {
      return NextResponse.json({ error: 'Série introuvable' }, { status: 404 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: EE_SCORING_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Tâche 1:\n${data.task1Text}\n\nTâche 2:\n${data.task2Text}`,
        },
      ],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text
    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const result = JSON.parse(jsonText)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/scoring/ee', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
