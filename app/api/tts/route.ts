import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'

// French voices available on Inworld TTS 1.5 Mini
// Section A (formal / vouvoiement) → Hélène or Alain
// Section B (informal / tutoiement) → Mathieu or Étienne

const ttsSchema = z.object({
  text: z.string().min(1).max(500),
  voice: z.string().min(1),
})

const INWORLD_TTS_URL = 'https://api.inworld.ai/tts/v1/text:synthesize'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = ttsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { text, voice } = parsed.data
    const apiKey = config.inworldApiKey

    if (!apiKey) {
      console.error('[TTS] INWORLD_API_KEY not configured')
      return NextResponse.json({ error: 'TTS non configuré' }, { status: 503 })
    }

    const inworldRes = await fetch(INWORLD_TTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { voice_id: voice },
        output: { encoding: 'MP3' },
      }),
    })

    if (!inworldRes.ok) {
      const errText = await inworldRes.text().catch(() => '')
      console.error(`[TTS] Inworld error ${inworldRes.status}: ${errText}`)
      return NextResponse.json(
        { error: 'Erreur TTS Inworld' },
        { status: inworldRes.status >= 500 ? 502 : inworldRes.status }
      )
    }

    const contentType = inworldRes.headers.get('content-type') ?? ''

    // Binary audio response (audio/mpeg, audio/wav, etc.)
    if (contentType.includes('audio/') || contentType.includes('octet-stream')) {
      const audioBuffer = await inworldRes.arrayBuffer()
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType.includes('audio/') ? contentType : 'audio/mpeg',
          'Cache-Control': 'no-store',
        },
      })
    }

    // JSON response with base64 audio_content
    const data = await inworldRes.json()
    const audioBase64: string = data?.audio_content ?? data?.audioContent ?? ''
    if (!audioBase64) {
      console.error('[TTS] No audio content in Inworld response', JSON.stringify(data).slice(0, 200))
      return NextResponse.json({ error: 'Réponse TTS invalide' }, { status: 502 })
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64')
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/tts', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
