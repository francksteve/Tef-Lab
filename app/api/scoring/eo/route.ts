import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { EO_SCORING_PROMPT } from '@/lib/scoring'
import { config } from '@/lib/config'

const eoScoringSchema = z.object({
  transcriptionA: z.string().min(1, 'La transcription de la section A est requise'),
  transcriptionB: z.string().min(1, 'La transcription de la section B est requise'),
  announcementA: z.string().min(1, "L'annonce de la section A est requise"),
  announcementB: z.string().min(1, "L'annonce de la section B est requise"),
})

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const data = eoScoringSchema.parse(body)

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
    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const result = JSON.parse(jsonText)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/scoring/eo', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
