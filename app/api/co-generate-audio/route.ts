import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'
import { prisma } from '@/lib/prisma'

// Allow up to 5 minutes on Vercel (reportage with 12 segments takes ~30-40s sequentially,
// ~4s with parallel synthesis but we keep a generous margin for full-series generation)
export const maxDuration = 300

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

// Router generates NEW dialogue — it cannot read a pre-written script.
// All question types use TTS split-by-speaker instead.
const DIALOGUE_QUESTION_ORDERS = new Set<number>([])

// Categories that always require multi-voice TTS regardless of transcript markers.
// These are dialogue-heavy by nature: conversations, interviews, RFI reportages.
const MULTI_VOICE_CATEGORIES = new Set(['Q1-4', 'Q23-28', 'Q29-30'])

// Voice assignment per CO category
const VOICE_MAP: Record<string, string[]> = {
  'Q1-4':   ['Alain', 'Hélène'],                                  // Conversations: M/F alternating
  'Q5-8':   ['Alain'],                                             // Annonces publiques: formal male
  'Q9-14':  ['Hélène', 'Ashley'],                                  // Répondeur téléphonique: female (vary)
  'Q15-20': ['Alain', 'Hélène', 'Mathieu', 'Étienne', 'Ashley'],  // Micro-trottoirs: all voices
  'Q21-22': ['Mathieu'],                                           // Chroniques audio: male reporter
  'Q23-28': ['Alain', 'Hélène', 'Mathieu', 'Ashley'],             // Interviews: up to 4 speakers
  'Q29-30': ['Étienne', 'Alain', 'Hélène', 'Mathieu', 'Ashley'], // Reportages RFI: reporter + interviewés
  'Q31-40': ['Alain', 'Hélène', 'Ashley'],                        // Documents divers: alternating
}

// Gender-classified voice pools — used for gender-aware assignment
const MALE_VOICES = ['Alain', 'Mathieu', 'Étienne']
const FEMALE_VOICES = ['Hélène', 'Ashley']

/**
 * Extract [H] or [F] gender tag from a speaker label string.
 * e.g. "Journaliste [F]" → 'F', "Mahamadou Coulibaly [H]" → 'H', "Invité" → null
 */
function extractGender(text: string): 'H' | 'F' | null {
  const m = text.match(/\[([HF])\]/i)
  return m ? (m[1].toUpperCase() as 'H' | 'F') : null
}

/**
 * Pick the most appropriate voice for a speaker based on gender and available voices.
 * Falls back to positional assignment when no matching gendered voice is found.
 *
 * @param gender    'H' | 'F' | null — speaker gender from [H]/[F] tag
 * @param voices    available voices for this CO category
 * @param counters  mutable counters for each gender + fallback cycle
 */
function pickGenderedVoice(
  gender: 'H' | 'F' | null,
  voices: string[],
  counters: { male: number; female: number; fallback: number }
): string {
  if (gender === 'H') {
    const pool = voices.filter(v => MALE_VOICES.includes(v))
    if (pool.length) return pool[counters.male++ % pool.length]
  }
  if (gender === 'F') {
    const pool = voices.filter(v => FEMALE_VOICES.includes(v))
    if (pool.length) return pool[counters.female++ % pool.length]
  }
  // No tag or no matching voice → positional fallback
  return voices[counters.fallback++ % voices.length]
}

// Named speaker markers in transcripts (role labels + optional [H]/[F] gender tag before colon)
const SPEAKER_PATTERN = /^((?:Homme|Femme|Présentateur|Présentatrice|Journaliste|Correspondant|Correspondante|Invité|Invitée|Intervieweur|Intervieweuse|Témoin|Habitant|Habitante|Passant|Passante|Expert|Experte|Chercheur|Chercheuse|Responsable|Directeur|Directrice|Représentant|Représentante|Client|Vendeur|Vendeure|Médecin|Patient|Patiente|Professeur|Étudiant|Étudiante|Animateur|Animatrice|Locuteur|Locutrice|Personne\s*\d?)\s*(?:\[[HF]\])?\s*:)/im

// Dash-based dialogue pattern (e.g. "– Bonjour..." or "–Bonjour..." or "- Bonjour...")
const DASH_DIALOGUE_PATTERN = /^[–—-]\s*/

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
  const speakerVoiceMap = new Map<string, string>()
  // Gender-aware counters: male/female cycle independently, fallback is positional
  const counters = { male: 0, female: 0, fallback: 0 }

  // Detect if this is a dash-based dialogue
  const dashLines = lines.filter((l) => DASH_DIALOGUE_PATTERN.test(l.trim()))
  const isDashDialogue = dashLines.length >= 2
  let dashVoiceIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()

    // Named speaker / role label (e.g. "Journaliste [F] :" or "Invité [H] :")
    const match = trimmed.match(SPEAKER_PATTERN)
    if (match) {
      const speakerRaw = match[1].replace(/\s*:\s*$/, '').trim()
      // Strip gender tag from map key so "Invité [H]" and "Invité" map to same speaker
      const speaker = speakerRaw.replace(/\s*\[[HF]\]\s*/i, '').trim()
      if (!speakerVoiceMap.has(speaker)) {
        const gender = extractGender(speakerRaw)
        speakerVoiceMap.set(speaker, pickGenderedVoice(gender, voices, counters))
      }
      const content = trimmed.slice(match[0].length).trim()
      if (content) {
        segments.push({ text: content, voice: speakerVoiceMap.get(speaker)! })
      }
    } else if (isDashDialogue && DASH_DIALOGUE_PATTERN.test(trimmed)) {
      // Dash-based dialogue — alternate voices for each dash line
      const content = trimmed.replace(DASH_DIALOGUE_PATTERN, '').trim()
      if (content) {
        segments.push({ text: content, voice: voices[dashVoiceIdx++ % voices.length] })
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
    // Strip gender tags from single-block text (they're metadata, not speech)
    const cleaned = text.replace(/\s*\[[HF]\]/gi, '').replace(/\[.*?\]/g, '').trim()
    if (cleaned) {
      segments.push({ text: cleaned, voice: voices[0] })
    }
  }

  return segments
}

/**
 * Split an RFI-style reportage transcript into TTS segments.
 *
 * Format handled:
 *   - Reporter narration (regular paragraphs) → voices[0] (Étienne)
 *   - Interviewee intro line ending with ":" → reporter reads it, sets pendingVoice
 *     e.g. "Patrick Essomba est le président de la coopérative :"
 *   - Quote in « guillemets » → interviewee voice (Alain / Hélène / Mathieu in order)
 *   - Anonymous opening quote (no prior intro) → voices[1] (Alain) without advancing counter
 *   - End credit "Name, City, RFI." → reporter voice
 *
 * Blank lines flush the narrative buffer so each paragraph becomes its own TTS chunk.
 */
function splitRFIReportage(text: string, voices: string[]): SpeechSegment[] {
  const reporterVoice = voices[0] ?? 'Étienne'
  const intervieweeVoices = voices.length > 1 ? voices.slice(1) : ['Alain']

  const segments: SpeechSegment[] = []
  const speakerVoiceMap = new Map<string, string>()
  // Gender-aware counters for interviewees — male/female cycle independently
  const counters = { male: 0, female: 0, fallback: 0 }
  let pendingVoice: string | null = null
  const narrativeBuffer: string[] = []

  const flushNarrative = () => {
    const t = narrativeBuffer.join(' ').trim()
    if (t) segments.push({ text: t, voice: reporterVoice })
    narrativeBuffer.length = 0
  }

  // Intro line: starts with uppercase letter, has ≥5 chars before terminal ":"
  // Supports optional gender tag: "Marie Traoré [F], restauratrice :"
  //                                "Mahamadou Coulibaly [H], maçon :"
  const INTRO_LINE = /^[A-ZÀÉÈÊËÎÏÔÙÛÜ].{5,}:\s*$/

  let inQuote = false
  let quoteLines: string[] = []
  let quoteVoice = intervieweeVoices[0]

  for (const raw of text.split('\n')) {
    const line = raw.trim()

    // Blank line → flush narrative buffer (one TTS chunk per paragraph)
    if (!line) {
      flushNarrative()
      continue
    }

    // Inside a multi-line « ... » block
    if (inQuote) {
      quoteLines.push(line)
      if (line.includes('»')) {
        inQuote = false
        const quoteText = quoteLines.join(' ').replace(/^«\s*/, '').replace(/\s*».*$/, '').trim()
        if (quoteText) segments.push({ text: quoteText, voice: quoteVoice })
        quoteLines = []
      }
      continue
    }

    // Quote starting with «
    if (line.startsWith('«')) {
      flushNarrative()
      quoteVoice = pendingVoice !== null
        ? pendingVoice
        : intervieweeVoices[0] // anonymous quote → first interviewee voice
      pendingVoice = null

      if (line.includes('»')) {
        // Single-line quote
        const quoteText = line.replace(/^«\s*/, '').replace(/\s*».*$/, '').trim()
        if (quoteText) segments.push({ text: quoteText, voice: quoteVoice })
      } else {
        inQuote = true
        quoteLines = [line]
      }
      continue
    }

    // Single-line combined intro + quote: "Name [H], rôle : « text »"
    // Fallback for transcripts where intro and quote are on the same line.
    const inlineQuoteMatch = line.match(/^([A-ZÀÉÈÊËÎÏÔÙÛÜ].{5,}):\s*«(.+?)»\s*$/)
    if (inlineQuoteMatch) {
      const introText = inlineQuoteMatch[1].trim()
      const quoteText = inlineQuoteMatch[2].trim()
      // Reporter reads the intro (stripped of gender tag)
      narrativeBuffer.push(introText.replace(/\s*\[[HF]\]\s*/i, ' ').replace(/\s+/g, ' ').trim() + '.')
      flushNarrative()
      // Assign voice to the speaker
      const nameMatch = introText.match(/^([A-ZÀÉÈÊËÎÏÔÙÛÜ][a-zàáâãäåæçèéêëìíîïñòóôõöùúûü]+(?:\s+[A-ZÀÉÈÊËÎÏÔÙÛÜ][a-zàáâãäåæçèéêëìíîïñòóôõöùúûü]+)*)/)
      const name = nameMatch?.[1] ?? `speaker_${counters.male + counters.female + counters.fallback}`
      const gender = extractGender(introText)
      if (!speakerVoiceMap.has(name)) {
        const voice = pickGenderedVoice(gender, intervieweeVoices, counters)
        speakerVoiceMap.set(name, voice)
        console.log(`[CO_AUDIO] RFI inline-quote speaker "${name}" gender=${gender ?? 'unknown'} → voice=${voice}`)
      }
      if (quoteText) segments.push({ text: quoteText, voice: speakerVoiceMap.get(name)! })
      continue
    }

    // Interviewee introduction line ending with ":"
    if (INTRO_LINE.test(line)) {
      // Reporter reads the intro — strip gender tag from spoken text
      narrativeBuffer.push(line.replace(/\s*\[[HF]\]\s*/i, ' ').replace(/:\s*$/, '.').trim())

      // Extract speaker name (up to first comma or gender tag)
      const nameMatch = line.match(/^([A-ZÀÉÈÊËÎÏÔÙÛÜ][a-zàáâãäåæçèéêëìíîïñòóôõöùúûü]+(?:\s+[A-ZÀÉÈÊËÎÏÔÙÛÜ][a-zàáâãäåæçèéêëìíîïñòóôõöùúûü]+)*)/)
      const name = nameMatch?.[1] ?? `speaker_${counters.male + counters.female + counters.fallback}`

      if (!speakerVoiceMap.has(name)) {
        // Gender-aware voice assignment: [H] → male pool, [F] → female pool
        const gender = extractGender(line)
        const voice = pickGenderedVoice(gender, intervieweeVoices, counters)
        speakerVoiceMap.set(name, voice)
        console.log(`[CO_AUDIO] RFI speaker "${name}" gender=${gender ?? 'unknown'} → voice=${voice}`)
      }
      pendingVoice = speakerVoiceMap.get(name)!
      continue
    }

    // End credit line: "FirstName [H], City, RFI." or "Étienne Martin, Bamako, RFI."
    if (/,\s*RFI\.?\s*$/.test(line)) {
      flushNarrative()
      // Strip gender tag from spoken end credit
      const creditText = line.replace(/\s*\[[HF]\]\s*/i, ' ').replace(/\s+/g, ' ').trim()
      segments.push({ text: creditText, voice: reporterVoice })
      continue
    }

    // Regular narrative line
    narrativeBuffer.push(line)
  }

  flushNarrative()

  return segments.length > 0 ? segments : [{ text: text.trim(), voice: reporterVoice }]
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
async function synthesize(text: string, voice: string, apiKey: string, retries = 2): Promise<Buffer> {
  // Inworld TTS rejects very long texts — split at 500 chars on sentence boundary if needed
  const MAX_CHARS = 500
  if (text.length > MAX_CHARS) {
    // Split on '. ' or '! ' or '? ' boundaries
    const mid = text.lastIndexOf('. ', MAX_CHARS) ?? text.lastIndexOf('! ', MAX_CHARS) ?? text.lastIndexOf('? ', MAX_CHARS)
    if (mid > 0) {
      const part1 = text.slice(0, mid + 1).trim()
      const part2 = text.slice(mid + 1).trim()
      console.log(`[CO_AUDIO] synthesize: text too long (${text.length}), split into ${part1.length}+${part2.length}`)
      const [buf1, buf2] = await Promise.all([
        synthesize(part1, voice, apiKey, retries),
        synthesize(part2, voice, apiKey, retries),
      ])
      return concatMp3Buffers([buf1, stripMp3Metadata(buf2)])
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt < retries) {
        console.warn(`[CO_AUDIO] synthesize attempt ${attempt + 1} failed (${msg}), retrying…`)
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      } else {
        throw err
      }
    }
  }
  throw new Error('synthesize: unreachable')
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
  const sizeKb = Math.round(buffer.length / 1024)
  console.log(`[CO_AUDIO] uploadToSupabase: ${filename} (${sizeKb} Ko, ${buffer.length} bytes)`)

  // Use Blob instead of Uint8Array — Node.js undici fetch handles large Blobs correctly
  // Copy to a plain ArrayBuffer to satisfy TS (Buffer.buffer may be SharedArrayBuffer)
  const arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  const blob = new Blob([arrayBuf], { type: 'audio/mpeg' })

  const res = await fetch(`${supabaseUrl}/storage/v1/object/tef-lab-media/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: blob,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '(no response body)')
    throw new Error(`Supabase upload error ${res.status}: ${errText}`)
  }

  console.log(`[CO_AUDIO] upload OK: ${filename}`)
  return `${supabaseUrl}/storage/v1/object/public/tef-lab-media/${path}`
}

/**
 * Strip ID3v2 header from an MP3 buffer if present.
 * ID3v2 starts with "ID3" (0x49 0x44 0x33).
 */
function stripId3Header(buf: Buffer): Buffer {
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size =
      ((buf[6] & 0x7f) << 21) |
      ((buf[7] & 0x7f) << 14) |
      ((buf[8] & 0x7f) << 7) |
      (buf[9] & 0x7f)
    const headerEnd = 10 + size
    if (headerEnd < buf.length) {
      return buf.slice(headerEnd)
    }
  }
  return buf
}

/**
 * Compute the byte size of an MP3 frame starting at buf[offset].
 * Returns 0 if the frame header is invalid.
 */
function getMp3FrameSize(buf: Buffer, offset = 0): number {
  if (buf.length < offset + 4) return 0
  if (buf[offset] !== 0xFF || (buf[offset + 1] & 0xE0) !== 0xE0) return 0

  const byte1 = buf[offset + 1]
  const byte2 = buf[offset + 2]
  const mpegVersion = (byte1 >> 3) & 0x3   // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
  const layerDesc   = (byte1 >> 1) & 0x3   // 1=Layer3
  const bitrateIdx  = (byte2 >> 4) & 0xF
  const srIdx       = (byte2 >> 2) & 0x3
  const padding     = (byte2 >> 1) & 0x1

  if (layerDesc !== 1) return 0  // Layer3 only

  const bitratesMPEG1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
  const bitratesMPEG2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
  const srMPEG1 = [44100,48000,32000,0]
  const srMPEG2 = [22050,24000,16000,0]
  const srMPEG25= [11025,12000,8000,0]

  const bitrate = (mpegVersion === 3 ? bitratesMPEG1 : bitratesMPEG2)[bitrateIdx] * 1000
  const sr      = (mpegVersion === 3 ? srMPEG1 : mpegVersion === 2 ? srMPEG2 : srMPEG25)[srIdx]

  if (!bitrate || !sr) return 0
  return Math.floor(144 * bitrate / sr) + padding
}

/**
 * Strip Xing/Info VBR header frame from an MP3 buffer if present.
 * This frame encodes "total frames = N" — if left in a concatenated stream,
 * decoders stop after N frames and ignore the rest of the audio.
 */
function stripXingFrame(buf: Buffer): Buffer {
  if (buf.length < 40) return buf
  if (buf[0] !== 0xFF || (buf[1] & 0xE0) !== 0xE0) return buf

  const mpegVersion = (buf[1] >> 3) & 0x3
  const channelMode = (buf[3] >> 6) & 0x3  // 3=mono
  const isMono = channelMode === 3
  // Side info size: MPEG1 stereo=32, MPEG1 mono=17, MPEG2 stereo=17, MPEG2 mono=9
  const sideInfoSize = mpegVersion === 3 ? (isMono ? 17 : 32) : (isMono ? 9 : 17)
  const xingOffset = 4 + sideInfoSize

  if (buf.length >= xingOffset + 4) {
    const tag = buf.toString('ascii', xingOffset, xingOffset + 4)
    if (tag === 'Xing' || tag === 'Info') {
      const frameSize = getMp3FrameSize(buf, 0)
      if (frameSize > 0 && frameSize < buf.length) {
        console.log(`[CO_AUDIO] stripped Xing/Info frame (${frameSize} bytes, tag=${tag})`)
        return buf.slice(frameSize)
      }
    }
  }
  return buf
}

/**
 * Strip all MP3 metadata headers (ID3v2 + Xing/Info frame) from a buffer.
 * Applied to chunks 2+ before concatenation so decoders don't stop early.
 */
function stripMp3Metadata(buf: Buffer): Buffer {
  return stripXingFrame(stripId3Header(buf))
}

/**
 * Concatenate MP3 buffers: keep the first chunk intact, strip ID3+Xing from the rest.
 */
function concatMp3Buffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0)
  const processed = buffers.map((buf, i) => (i === 0 ? buf : stripMp3Metadata(buf)))
  return Buffer.concat(processed)
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
          // TTS path: split by speaker for dialogues, single voice otherwise.
          // Categories Q1-4, Q23-28, Q29-30 always use multi-voice even if transcript
          // markers are absent or ambiguous.
          const transcriptLines = transcript.split('\n').filter(l => l.trim())
          const dashLineCount = transcriptLines.filter(l => DASH_DIALOGUE_PATTERN.test(l.trim())).length
          const hasNamedSpeaker = SPEAKER_PATTERN.test(transcript)
          const detectedDialogue = hasNamedSpeaker || dashLineCount >= 2
          const forceMultiVoice = MULTI_VOICE_CATEGORIES.has(catKey)
          const useMultiVoice = (detectedDialogue || forceMultiVoice) && voices.length > 1

          const firstCharHex = transcript.charCodeAt(0).toString(16)
          console.log(`[CO_AUDIO] Q${q.questionOrder} [${catKey}]: lines=${transcriptLines.length} dashLines=${dashLineCount} namedSpeaker=${hasNamedSpeaker} detected=${detectedDialogue} forced=${forceMultiVoice} multiVoice=${useMultiVoice} firstChar=U+${firstCharHex}`)

          if (useMultiVoice) {
            // Q29-30 use dedicated RFI reportage parser (reporter narration + « guillemet » quotes)
            const segments = catKey === 'Q29-30'
              ? splitRFIReportage(transcript, voices)
              : splitBySpeaker(transcript, voices)
            console.log(`[CO_AUDIO] Q${q.questionOrder}: ${segments.length} segment(s) — ${segments.map(s => `${s.voice}:"${s.text.slice(0, 30)}"`).join(' | ')}`)

            // Synthesize segments with limited concurrency (max 4 at a time).
            // Full parallel causes rate-limit errors on Inworld; sequential causes timeout.
            const audioChunks: Buffer[] = []
            const CONCURRENCY = 4
            for (let i = 0; i < segments.length; i += CONCURRENCY) {
              const batch = segments.slice(i, i + CONCURRENCY)
              const batchResults = await Promise.all(
                batch.map(seg => synthesize(seg.text, seg.voice, apiKey))
              )
              audioChunks.push(...batchResults)
            }

            audioBuffer = concatMp3Buffers(audioChunks)
          } else {
            console.log(`[CO_AUDIO] Q${q.questionOrder}: single voice synthesis`)
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
