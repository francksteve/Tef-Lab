import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/co-generate-audio
 *
 * Admin-only. Takes a seriesId, reads all CO questions that have longText
 * (transcript) but no audioUrl, generates TTS audio via Inworld, uploads
 * to Supabase Storage, and saves the audioUrl on each question.
 *
 * For dialogue transcripts, the text is split by speaker markers
 * (e.g. "Homme :" / "Femme :") and alternating voices are used.
 */

const INWORLD_TTS_URL = 'https://api.inworld.ai/tts/v1/text:synthesize'

// Voice assignment per CO category
const VOICE_MAP: Record<string, string[]> = {
  'Q1-4':   ['Alain', 'Hélène'],     // Conversations: alternating M/F
  'Q5-8':   ['Alain'],                // Annonces publiques: formal male
  'Q9-14':  ['Hélène'],               // Répondeur téléphonique: female
  'Q15-20': ['Alain', 'Hélène', 'Mathieu', 'Étienne'], // Micro-trottoirs: multiple
  'Q21-22': ['Mathieu'],              // Chroniques audio: male reporter
  'Q23-28': ['Alain', 'Hélène'],      // Interviews: interviewer + guest
  'Q29-30': ['Étienne'],              // Reportages RFI: male reporter
  'Q31-40': ['Alain', 'Hélène'],      // Documents divers: alternating
}

// Speaker markers that indicate dialogue
const SPEAKER_PATTERN = /^((?:Homme|Femme|Présentateur|Présentatrice|Journaliste|Invité|Intervieweur|Client|Vendeur|Médecin|Patient|Professeur|Étudiant|Animateur|Animatrice|Locuteur|Locutrice)\s*\d?\s*:)/im

function getCOCategory(questionOrder: number): string {
  if (questionOrder <= 4) return 'Q1-4'
  if (questionOrder <= 8) return 'Q5-8'
  if (questionOrder <= 14) return 'Q9-14'
  if (questionOrder <= 20) return 'Q15-20'
  if (questionOrder <= 22) return 'Q21-22'
  if (questionOrder <= 28) return 'Q23-28'
  if (questionOrder <= 30) return 'Q29-30'
  return 'Q31-40'
}

interface SpeechSegment {
  text: string
  voice: string
}

/**
 * Split a transcript into segments by speaker, assigning alternating voices.
 */
function splitBySpeaker(text: string, voices: string[]): SpeechSegment[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const segments: SpeechSegment[] = []
  let currentVoiceIdx = 0
  const speakerVoiceMap = new Map<string, string>()

  for (const line of lines) {
    const match = line.match(SPEAKER_PATTERN)
    if (match) {
      const speaker = match[1].replace(/\s*:\s*$/, '').trim()
      if (!speakerVoiceMap.has(speaker)) {
        speakerVoiceMap.set(speaker, voices[currentVoiceIdx % voices.length])
        currentVoiceIdx++
      }
      const content = line.slice(match[0].length).trim()
      if (content) {
        segments.push({ text: content, voice: speakerVoiceMap.get(speaker)! })
      }
    } else {
      // No speaker marker — use default voice
      const voice = voices[0]
      segments.push({ text: line.trim(), voice })
    }
  }

  // If no segments were created from speaker parsing, treat as single block
  if (segments.length === 0 && text.trim()) {
    segments.push({ text: text.trim(), voice: voices[0] })
  }

  return segments
}

/**
 * Call Inworld TTS and return raw MP3 buffer.
 */
async function synthesize(text: string, voice: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(INWORLD_TTS_URL, {
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

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Inworld TTS error ${res.status}: ${errText}`)
  }

  const contentType = res.headers.get('content-type') ?? ''

  // Binary audio response
  if (contentType.includes('audio/') || contentType.includes('octet-stream')) {
    return Buffer.from(await res.arrayBuffer())
  }

  // JSON response with base64
  const data = await res.json()
  const b64: string = data?.audio_content ?? data?.audioContent ?? ''
  if (!b64) throw new Error('No audio_content in TTS response')
  return Buffer.from(b64, 'base64')
}

/**
 * Upload a buffer to Supabase Storage and return public URL.
 */
async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<string> {
  const path = `audio/${filename}`

  const res = await fetch(`${supabaseUrl}/storage/v1/object/tef-lab-media/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: new Uint8Array(buffer),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Supabase upload error ${res.status}: ${errText}`)
  }

  return `${supabaseUrl}/storage/v1/object/public/tef-lab-media/${path}`
}

/**
 * Concatenate MP3 buffers by simply appending (works for CBR MP3).
 */
function concatMp3Buffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers)
}

/**
 * Add ~500ms of silence between dialogue segments (a minimal silent MP3 frame).
 */
function silentMp3Pause(): Buffer {
  // Minimal valid MP3 frame for ~26ms silence at 128kbps, repeated 20x ≈ 520ms
  const frame = Buffer.from(
    'fffbe0000000000000000000000000000000000000000000000000000000000000000000',
    'hex'
  )
  const frames: Buffer[] = []
  for (let i = 0; i < 20; i++) frames.push(frame)
  return Buffer.concat(frames)
}

// ── Request schema ───────────────────────────────────────────
const requestSchema = z.object({
  seriesId: z.string().min(1),
  questionId: z.string().optional(), // if provided, generate for this single question only
  overwrite: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.issues }, { status: 400 })
    }

    const { seriesId, questionId, overwrite } = parsed.data
    const apiKey = config.inworldApiKey
    if (!apiKey) {
      return NextResponse.json({ error: 'INWORLD_API_KEY non configuré' }, { status: 503 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase Storage non configuré' }, { status: 500 })
    }

    // Verify series is CO
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: { module: true },
    })
    if (!series) {
      return NextResponse.json({ error: 'Série introuvable' }, { status: 404 })
    }
    if (series.module.code !== 'CO') {
      return NextResponse.json({ error: 'Cette série n\'est pas une série CO' }, { status: 400 })
    }

    // Get questions with transcripts — optionally filtered to a single question
    const questions = await prisma.question.findMany({
      where: {
        seriesId,
        ...(questionId ? { id: questionId } : {}),
        ...(overwrite || questionId ? {} : { OR: [{ audioUrl: null }, { audioUrl: '' }] }),
        NOT: [{ longText: null }, { longText: '' }],
      },
      orderBy: { questionOrder: 'asc' },
    })

    if (questions.length === 0) {
      return NextResponse.json({
        message: 'Aucune question à traiter (toutes ont déjà un audio ou n\'ont pas de transcription)',
        generated: 0,
      })
    }

    const results: { questionOrder: number; audioUrl: string; sizeKo: number }[] = []
    const errors: { questionOrder: number; error: string }[] = []

    for (const q of questions) {
      try {
        const transcript = q.longText!.trim()
        const catKey = getCOCategory(q.questionOrder)
        const voices = VOICE_MAP[catKey] ?? ['Alain']

        // Check if transcript has speaker markers (dialogue)
        const hasDialogue = SPEAKER_PATTERN.test(transcript)

        let audioBuffer: Buffer

        if (hasDialogue && voices.length > 1) {
          // Multi-speaker: split by speaker, synthesize each, concatenate
          const segments = splitBySpeaker(transcript, voices)
          const audioChunks: Buffer[] = []

          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i]
            const chunk = await synthesize(seg.text, seg.voice, apiKey)
            audioChunks.push(chunk)
            // Add pause between segments (not after last)
            if (i < segments.length - 1) {
              audioChunks.push(silentMp3Pause())
            }
          }

          audioBuffer = concatMp3Buffers(audioChunks)
        } else {
          // Single speaker
          audioBuffer = await synthesize(transcript, voices[0], apiKey)
        }

        // Upload to Supabase
        const timestamp = Date.now()
        const random = Math.random().toString(36).slice(2, 8)
        const filename = `co-${seriesId.slice(0, 8)}-q${q.questionOrder}-${timestamp}-${random}.mp3`

        const audioUrl = await uploadToSupabase(audioBuffer, filename, supabaseUrl, serviceKey)

        // Update question in DB
        await prisma.question.update({
          where: { id: q.id },
          data: { audioUrl },
        })

        results.push({
          questionOrder: q.questionOrder,
          audioUrl,
          sizeKo: Math.round(audioBuffer.length / 1024),
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[CO_AUDIO] Error Q${q.questionOrder}:`, message)
        errors.push({ questionOrder: q.questionOrder, error: message })
      }
    }

    return NextResponse.json({
      message: `${results.length} audio(s) généré(s), ${errors.length} erreur(s)`,
      generated: results.length,
      results,
      errors,
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/co-generate-audio', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
