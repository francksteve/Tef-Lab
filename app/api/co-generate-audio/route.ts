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
 * For dialogue questions (Q1-4 conversations, Q23-28 interviews):
 *   → Uses Inworld Router (OpenAI-compatible LLM) with audio=true + stream=true
 *     to generate natural multi-speaker dialogue audio in one call.
 *
 * For all other question types:
 *   → Uses Inworld TTS API (split by speaker, concatenate MP3 buffers).
 */

const INWORLD_TTS_URL = 'https://api.inworld.ai/tts/v1/voice'
const INWORLD_TTS_MODEL = 'inworld-tts-1.5-max'
const INWORLD_ROUTER_URL = 'https://api.inworld.ai/v1/chat/completions'

/** Question orders that use the Router for multi-speaker audio (conversations, interviews, reportage RFI) */
const DIALOGUE_QUESTION_ORDERS = new Set([1, 2, 3, 4, 23, 24, 25, 26, 27, 28, 29, 30])

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
const SPEAKER_PATTERN = /^((?:Homme|Femme|Présentateur|Présentatrice|Journaliste|Invité|Invitée|Intervieweur|Client|Vendeur|Médecin|Patient|Professeur|Étudiant|Animateur|Animatrice|Locuteur|Locutrice|Personne\s*\d?)\s*:)/im

// Dash-based dialogue pattern (e.g. "– Bonjour..." or "- Bonjour...")
const DASH_DIALOGUE_PATTERN = /^[–—-]\s+/

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
 * Supports both named speakers ("Journaliste :") and dash-based dialogues ("– Bonjour...").
 */
function splitBySpeaker(text: string, voices: string[]): SpeechSegment[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const segments: SpeechSegment[] = []
  let currentVoiceIdx = 0
  const speakerVoiceMap = new Map<string, string>()

  // Detect if this is a dash-based dialogue
  const dashLines = lines.filter((l) => DASH_DIALOGUE_PATTERN.test(l.trim()))
  const isDashDialogue = dashLines.length >= 2

  for (const line of lines) {
    const trimmed = line.trim()

    // Named speaker pattern (e.g. "Journaliste :")
    const match = trimmed.match(SPEAKER_PATTERN)
    if (match) {
      const speaker = match[1].replace(/\s*:\s*$/, '').trim()
      if (!speakerVoiceMap.has(speaker)) {
        speakerVoiceMap.set(speaker, voices[currentVoiceIdx % voices.length])
        currentVoiceIdx++
      }
      const content = trimmed.slice(match[0].length).trim()
      if (content) {
        segments.push({ text: content, voice: speakerVoiceMap.get(speaker)! })
      }
    } else if (isDashDialogue && DASH_DIALOGUE_PATTERN.test(trimmed)) {
      // Dash-based dialogue — alternate voices for each dash line
      const content = trimmed.replace(DASH_DIALOGUE_PATTERN, '').trim()
      if (content) {
        const voice = voices[currentVoiceIdx % voices.length]
        segments.push({ text: content, voice })
        currentVoiceIdx++
      }
    } else if (trimmed) {
      // Narrative / no marker — use default voice
      // Skip metadata lines like "[Question du micro-trottoir : ...]"
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) continue
      // Skip "Personne N :" lines that are just labels
      if (/^Personne\s+\d+\s*:?\s*$/i.test(trimmed)) continue
      segments.push({ text: trimmed, voice: voices[0] })
    }
  }

  // If no segments were created from speaker parsing, treat as single block
  if (segments.length === 0 && text.trim()) {
    // Clean metadata from single-block text too
    const cleaned = text.replace(/\[.*?\]/g, '').trim()
    if (cleaned) {
      segments.push({ text: cleaned, voice: voices[0] })
    }
  }

  return segments
}

/**
 * Generate dialogue audio using Inworld Router (OpenAI-compatible LLM).
 * Sends the full dialogue transcript as a user message with audio=true + stream=true.
 * The Router handles speaker turns and produces a natural-sounding conversation.
 *
 * Endpoint: POST https://api.inworld.ai/v1/chat/completions
 * Body: { model, messages, audio: true, stream: true }
 * Response: SSE stream — events contain { choices[0].delta.audio.data: "<base64 chunk>" }
 *
 * Falls back to null if Router is not configured or returns no audio.
 */
async function generateDialogueAudio(
  transcript: string,
  routerId: string,
  apiKey: string
): Promise<Buffer | null> {
  if (!routerId) return null

  const res = await fetch(INWORLD_ROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `inworld/${routerId}`,
      messages: [{ role: 'user', content: transcript }],
      audio: true,
      stream: true,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Inworld Router error ${res.status}: ${errText}`)
  }

  if (!res.body) throw new Error('No response body from Inworld Router')

  // Read SSE stream and collect base64 audio chunks
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const audioChunks: Buffer[] = []
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    // Process complete SSE lines
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') break
      try {
        const json = JSON.parse(data)
        const audioDelta: string | undefined =
          json?.choices?.[0]?.delta?.audio?.data
        if (audioDelta) {
          audioChunks.push(Buffer.from(audioDelta, 'base64'))
        }
      } catch {
        // ignore malformed SSE lines
      }
    }
  }

  if (audioChunks.length === 0) return null
  return Buffer.concat(audioChunks)
}

/**
 * Call Inworld TTS API and return raw MP3 buffer.
 * Endpoint: POST https://api.inworld.ai/tts/v1/voice
 * Body: { text, voiceId, modelId }
 * Response: { audioContent: "<base64 MP3>" }
 */
async function synthesize(text: string, voice: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(INWORLD_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voiceId: voice,
      modelId: INWORLD_TTS_MODEL,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Inworld TTS error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const b64: string = data?.audioContent ?? ''
  if (!b64) throw new Error('No audioContent in TTS response')
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
      return NextResponse.json({ error: 'INWORLD_API_KEY non configuré. Ajoutez cette variable dans Vercel > Settings > Environment Variables.' }, { status: 503 })
    }
    const routerId = config.inworldRouterId
    console.log(`[CO_AUDIO] API key present (length: ${apiKey.length}), routerId: ${routerId || 'non configuré'}, processing series ${seriesId}${questionId ? ` question ${questionId}` : ''}`)

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

        // Dialogue questions (Q1-4 conversations, Q23-28 interviews):
        // Try Inworld Router with audio streaming for natural multi-speaker output.
        // Fall back to split TTS if Router is not configured or returns no audio.
        const isDialogue = DIALOGUE_QUESTION_ORDERS.has(q.questionOrder)

        let audioBuffer: Buffer | null = null

        if (isDialogue && routerId) {
          console.log(`[CO_AUDIO] Q${q.questionOrder}: using Router for dialogue audio`)
          audioBuffer = await generateDialogueAudio(transcript, routerId, apiKey)
          if (!audioBuffer) {
            console.warn(`[CO_AUDIO] Q${q.questionOrder}: Router returned no audio, falling back to TTS`)
          }
        }

        if (!audioBuffer) {
          // TTS path: split by speaker for dialogues, single voice otherwise
          const hasDialogue = SPEAKER_PATTERN.test(transcript) ||
            transcript.split('\n').filter(l => DASH_DIALOGUE_PATTERN.test(l.trim())).length >= 2

          if (hasDialogue && voices.length > 1) {
            const segments = splitBySpeaker(transcript, voices)
            const audioChunks: Buffer[] = []

            for (let i = 0; i < segments.length; i++) {
              const seg = segments[i]
              const chunk = await synthesize(seg.text, seg.voice, apiKey)
              audioChunks.push(chunk)
              if (i < segments.length - 1) audioChunks.push(silentMp3Pause())
            }

            audioBuffer = concatMp3Buffers(audioChunks)
          } else {
            audioBuffer = await synthesize(transcript, voices[0], apiKey)
          }
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
      message: `${results.length} audio(s) généré(s)${errors.length ? `, ${errors.length} erreur(s)` : ''}`,
      generated: results.length,
      results,
      errors,
      // Include first error detail for easier debugging
      ...(errors.length > 0 && { firstError: errors[0].error }),
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/co-generate-audio', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
