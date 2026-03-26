'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/* ─────────────────────── Types ─────────────────────── */

interface Module {
  code: string
  name: string
}

interface Series {
  id: string
  title: string
  module: Module
}

interface SectionScore {
  cecrlLevel: string
  score: number
  feedback: string
  nbQuestionsDetectees?: number
  argumentsDetectes?: number
  registreAdapte?: boolean
  strengths: string[]
  improvements: string[]
}

interface EOResult {
  sectionA: SectionScore
  sectionB: SectionScore
  globalCecrlLevel: string
  globalScore: number
  pronunciation?: string
  lexique?: string
}

type EoStep =
  | 'intro'
  | 'prepA'
  | 'dialogueA'
  | 'pause'
  | 'prepB'
  | 'dialogueB'
  | 'scoring'
  | 'results'

interface SectionData {
  longText: string | null
  imageUrl: string | null
  consigne: string
  taskTitle: string | null
}

interface DialogueTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

/* ─────────────────────── Countdown ─────────────────── */

function Countdown({
  seconds,
  onDone,
  label,
}: {
  seconds: number
  onDone: () => void
  label: string
}) {
  const [remaining, setRemaining] = useState(seconds)
  const doneCalledRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true
        onDone()
      }
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onDone])

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#003087"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-tef-blue">
          {remaining}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────── SectionDocument ───────────────── */

function SectionDocument({
  section,
  compact = false,
  consigne,
  consigneColor = 'blue',
}: {
  section: SectionData
  compact?: boolean
  consigne?: string
  consigneColor?: 'blue' | 'orange'
}) {
  const hasContent = section.imageUrl || section.longText
  if (!hasContent && !consigne) return null

  const consigneBg =
    consigneColor === 'orange'
      ? 'bg-orange-50 text-orange-800'
      : 'bg-blue-50 text-blue-800'

  const annonceBorder =
    consigneColor === 'orange'
      ? 'border-orange-200 bg-orange-50'
      : 'border-blue-200 bg-blue-50'

  const annonceTitleColor =
    consigneColor === 'orange' ? 'text-orange-700' : 'text-tef-blue'

  return (
    <div className="space-y-4">
      {/* Image takes priority — shown when available */}
      {section.imageUrl && (
        <div
          className={`bg-white rounded-xl border border-gray-200 ${compact ? 'p-3' : 'p-6'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.imageUrl}
            alt="Annonce"
            className={`w-full object-contain rounded-lg border border-gray-100 bg-gray-50 ${
              compact ? 'max-h-48' : 'max-h-96'
            }`}
          />
        </div>
      )}

      {/* Annonce text card — shown when no image */}
      {!section.imageUrl && section.longText && (
        <div
          className={`rounded-xl border-2 ${annonceBorder} ${compact ? 'p-3' : 'p-6'} flex flex-col items-center`}
        >
          {!compact && section.taskTitle && (
            <>
              <p className={`text-center font-bold text-xl mb-3 ${annonceTitleColor}`}>
                {section.taskTitle}
              </p>
              <hr
                className={`w-full mb-4 ${
                  consigneColor === 'orange' ? 'border-orange-300' : 'border-blue-300'
                }`}
              />
            </>
          )}
          {compact && section.taskTitle && (
            <p className={`text-center font-semibold text-xs mb-2 ${annonceTitleColor}`}>
              {section.taskTitle}
            </p>
          )}
          <pre
            className={`whitespace-pre-wrap font-sans leading-normal text-center w-full ${
              compact ? 'text-xs text-gray-600' : 'text-sm text-gray-800'
            }`}
          >
            {section.longText}
          </pre>
        </div>
      )}

      {!compact && consigne && (
        <div className={`rounded-xl p-5 text-sm ${consigneBg}`}>
          <p className="font-semibold mb-1">Consigne</p>
          <p>{consigne}</p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── EOSectionCard ─────────────────── */

function EOSectionCard({
  label,
  score,
  extraInfo,
}: {
  label: string
  score: SectionScore
  extraInfo?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-tef-blue">{score.score}/100</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-tef-blue/10 text-tef-blue">
            {score.cecrlLevel}
          </span>
        </div>
      </div>
      {extraInfo && <p className="text-xs text-gray-500 italic">{extraInfo}</p>}
      {score.registreAdapte !== undefined && (
        <p
          className={`text-xs font-medium ${
            score.registreAdapte ? 'text-green-600' : 'text-orange-600'
          }`}
        >
          {score.registreAdapte ? '✓ Registre adapté' : '⚠ Registre à ajuster'}
        </p>
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{score.feedback}</p>
      {score.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">Points forts</p>
          <ul className="space-y-1">
            {score.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {score.improvements.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-orange-700 mb-1">Axes d&apos;amélioration</p>
          <ul className="space-y-1">
            {score.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-orange-500 mt-0.5">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── DialogueSection ───────────────── */

type RtcState = 'idle' | 'connecting' | 'connected' | 'user_speaking' | 'ai_speaking' | 'error'

function DialogueSection({
  section,
  sectionData,
  durationSeconds,
  onComplete,
  userName = '',
  onRequestExit,
}: {
  section: 'A' | 'B'
  sectionData: SectionData
  durationSeconds: number
  onComplete: (history: DialogueTurn[]) => void
  userName?: string
  onRequestExit?: () => void
}) {
  const [history, setHistory] = useState<DialogueTurn[]>([])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [rtcState, setRtcState] = useState<RtcState>('idle')
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [aiTyping, setAiTyping] = useState(false)
  const [ended, setEnded] = useState(false)
  const [textInputValue, setTextInputValue] = useState('')
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<DialogueTurn[]>([])
  const endedRef = useRef(false)
  const urgencyTriggeredRef = useRef(false)
  const hasStartedRef = useRef(false)
  const sessionConfiguredRef = useRef(false)
  const openingInstructionRef = useRef('')
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const iceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rtcStateRef = useRef<RtcState>('idle')

  // Pick one voice per section and keep it stable for the whole session
  const voice = useRef<string>(
    section === 'A'
      ? (Math.random() > 0.5 ? 'Hélène' : 'Alain')
      : (Math.random() > 0.5 ? 'Mathieu' : 'Étienne')
  ).current

  // Derived counters — count user turns only
  const questionCount = history.filter(
    (t) => t.role === 'user' && t.content.includes('?')
  ).length
  const argCount = history.filter((t) => t.role === 'user').length

  // Keep rtcStateRef in sync for callbacks
  useEffect(() => { rtcStateRef.current = rtcState }, [rtcState])

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleEndSection()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, aiTyping, liveTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iceTimeoutRef.current) clearTimeout(iceTimeoutRef.current)
      if (dcRef.current) { try { dcRef.current.close() } catch {} dcRef.current = null }
      if (pcRef.current) { try { pcRef.current.close() } catch {} pcRef.current = null }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.pause()
        remoteAudioRef.current.srcObject = null
      }
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const appendTurn = useCallback((turn: DialogueTurn) => {
    setHistory((prev) => {
      // Deduplicate: prevent same content arriving from two event paths
      const isDupe = prev.some(
        (t) =>
          t.role === turn.role &&
          t.content === turn.content &&
          Math.abs(t.timestamp - turn.timestamp) < 2000
      )
      if (isDupe) return prev
      const updated = [...prev, turn]
      historyRef.current = updated
      return updated
    })
  }, [])

  // ── Text fallback: Claude via /api/eo/ai-reply ───────────
  const sendToAI = useCallback(
    async (userMessage: string, currentHistory: DialogueTurn[]) => {
      if (endedRef.current) return
      setAiTyping(true)
      try {
        const res = await fetch('/api/eo/ai-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section,
            document: sectionData.longText ?? '',
            history: currentHistory.map((t) => ({ role: t.role, content: t.content })),
            userMessage,
            userName,
          }),
        })
        if (!res.ok) throw new Error('API error')
        const data = (await res.json()) as { reply: string }
        appendTurn({ role: 'assistant', content: data.reply, timestamp: Date.now() })
      } catch {
        // silently ignore
      } finally {
        setAiTyping(false)
      }
    },
    [section, sectionData.longText, appendTurn, userName]
  )

  // ── WebRTC: DataChannel event handler ────────────────────
  const handleDataChannelMessage = useCallback(
    (raw: string) => {
      let event: Record<string, unknown>
      try { event = JSON.parse(raw) } catch { return }

      switch (event.type as string) {
        // Session confirmed ready — NOW safe to trigger the opening message
        case 'session.updated':
        case 'session.created': {
          const dc = dcRef.current
          if (dc?.readyState === 'open' && openingInstructionRef.current) {
            dc.send(JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['audio', 'text'],
                instructions: openingInstructionRef.current,
              },
            }))
            openingInstructionRef.current = '' // send only once
          }
          break
        }

        case 'input_audio_buffer.speech_started':
          setRtcState('user_speaking')
          setLiveTranscript('…')
          break

        case 'input_audio_buffer.speech_stopped':
          setRtcState('connected')
          setLiveTranscript('')
          break

        case 'response.output_audio.started':
        case 'response.audio.started':
          setRtcState('ai_speaking')
          setAiTyping(true)
          break

        case 'response.done':
        case 'response.audio.done':
          setRtcState('connected')
          setAiTyping(false)
          break

        // User transcript from Inworld STT
        case 'input_audio_transcription.completed':
        case 'conversation.item.input_audio_transcription.completed': {
          const transcript = (event.transcript as string) ?? ''
          if (transcript.trim() && !endedRef.current) {
            setLiveTranscript('')
            appendTurn({ role: 'user', content: transcript.trim(), timestamp: Date.now() })
          }
          break
        }

        // Assistant turn text
        case 'conversation.item.added':
        case 'conversation.item.created': {
          const item = event.item as Record<string, unknown> | undefined
          if (!item || (item.role as string) !== 'assistant') break
          const content = item.content as Array<Record<string, unknown>> | undefined
          if (!content) break
          const textPart = content.find((c) => c.type === 'text' || c.type === 'audio')
          const text = (textPart?.text as string) || (textPart?.transcript as string) || ''
          if (text.trim()) {
            appendTurn({ role: 'assistant', content: text.trim(), timestamp: Date.now() })
          }
          break
        }

        case 'error':
          console.error('[EO_REALTIME] event error:', event.message)
          break
      }
    },
    [appendTurn]
  )

  // ── WebRTC: Tear down + fall back to text mode ───────────
  const handleWebRTCFailure = useCallback(() => {
    if (iceTimeoutRef.current) clearTimeout(iceTimeoutRef.current)
    if (dcRef.current) { try { dcRef.current.close() } catch {} dcRef.current = null }
    if (pcRef.current) { try { pcRef.current.close() } catch {} pcRef.current = null }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause()
      remoteAudioRef.current.srcObject = null
      remoteAudioRef.current = null
    }
    sessionConfiguredRef.current = false
    setRtcState('error')
    setInputMode('text')
    setAiTyping(false)
    sendToAI('[DÉBUT DE LA CONVERSATION]', [])
  }, [sendToAI])

  // ── WebRTC: Session.update + opening message ─────────────
  const sendSessionUpdate = useCallback(
    (dc: RTCDataChannel) => {
      const documentContext = sectionData.longText
        ? `\n\nANNONCE :\n${sectionData.longText}`
        : ''

      const instructions =
        section === 'A'
          ? `Tu es l'interlocuteur(trice) d'un candidat au TEF Canada pour la Section A (Obtenir des informations).
Le candidat te téléphone au sujet de l'annonce fournie et va te poser des questions.
Tes règles ABSOLUES :
1. Réponds en MAXIMUM 15 mots. Jamais plus de 15 mots.
2. Utilise le vouvoiement (registre formel).
3. Réponds uniquement à ce qui concerne l'annonce.
4. Tes réponses doivent être naturelles, courtes et directes.
5. LANGUE : français exclusivement.${documentContext}`
          : `Tu es l'ami(e) SCEPTIQUE et DUBITATIF(VE) d'un candidat au TEF Canada pour la Section B.
Le candidat va te présenter une annonce et tenter de te convaincre d'y participer.
Tu es RÉSISTANT(E) : tu doutes, tu questionnes, tu exprimes des réserves.
Tes règles ABSOLUES :
1. Réponds en MAXIMUM 15 mots. Jamais plus de 15 mots.
2. Utilise le tutoiement (registre informel).
3. Sois dubitatif : "Bof, je ne sais pas…" / "C'est cher non ?" / "Tu es sûr(e) ?"
4. Ne montre de l'enthousiasme qu'après plusieurs arguments solides.
5. LANGUE : français exclusivement.${documentContext}`

      // Store opening instruction — sent only after session.updated confirms AI has the prompt
      openingInstructionRef.current =
        section === 'A'
          ? 'Dis exactement : "Bonjour, comment puis-je vous aider ?"'
          : `Dis exactement : "Salut ${userName || 'toi'} ! Comment vas-tu aujourd'hui mon ami(e) ?"`

      dc.send(JSON.stringify({
        type: 'session.update',
        session: {
          model: 'google-ai-studio/gemini-2.5-flash',
          modalities: ['audio', 'text'],
          instructions,
          voice: voice,                              // plain string, e.g. "Hélène"
          output_audio_format: 'pcm16',
          input_audio_format: 'pcm16',
          input_audio_transcription: { model: 'inworld-stt' },
          turn_detection: {
            type: 'semantic_vad',
            eagerness: 'medium',
            interrupt_response: true,
          },
        },
      }))
    },
    [section, sectionData.longText, voice, userName]
  )

  // ── WebRTC: Main connection setup ────────────────────────
  const startWebRTCSession = useCallback(async () => {
    if (endedRef.current) return
    setRtcState('connecting')

    const hasWebRTC =
      typeof window !== 'undefined' &&
      typeof RTCPeerConnection !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function'

    if (!hasWebRTC) { handleWebRTCFailure(); return }

    try {
      let micStream: MediaStream
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
      } catch {
        handleWebRTCFailure(); return
      }

      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
      pcRef.current = pc

      micStream.getAudioTracks().forEach((t) => pc.addTrack(t, micStream))

      // Incoming audio from Inworld → play via Audio element
      pc.ontrack = (e) => {
        if (e.track.kind === 'audio') {
          const audio = new Audio()
          audio.srcObject = e.streams[0]
          audio.autoplay = true
          remoteAudioRef.current = audio
          audio.play().catch(() => {})
        }
      }

      // DataChannel for session config + transcript events
      const dc = pc.createDataChannel('oai-events', { ordered: true })
      dcRef.current = dc

      dc.onopen = () => {
        if (sessionConfiguredRef.current) return
        sessionConfiguredRef.current = true
        setRtcState('connected')
        sendSessionUpdate(dc)
      }
      dc.onmessage = (e) => handleDataChannelMessage(e.data)

      pc.onconnectionstatechange = () => {
        if (
          (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') &&
          !endedRef.current
        ) { handleWebRTCFailure() }
      }

      // Create SDP offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering (5s timeout)
      await new Promise<void>((resolve, reject) => {
        if (pc.iceGatheringState === 'complete') { resolve(); return }
        const timeout = setTimeout(() => reject(new Error('ICE timeout')), 5000)
        iceTimeoutRef.current = timeout
        pc.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') {
            clearTimeout(timeout)
            iceTimeoutRef.current = null
            resolve()
          }
        })
      })

      if (!pc.localDescription?.sdp) throw new Error('No local SDP')

      // Exchange SDP via our server proxy (keeps API key server-side)
      const res = await fetch('/api/eo-realtime/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription.sdp,
      })
      if (!res.ok) throw new Error(`SDP proxy error: ${res.status}`)

      const sdpAnswer = await res.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer })

    } catch (err) {
      console.error('[EO_REALTIME] WebRTC setup failed', err)
      if (!endedRef.current) handleWebRTCFailure()
    }
  }, [sendSessionUpdate, handleDataChannelMessage, handleWebRTCFailure])

  // Mount: start WebRTC session
  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    startWebRTCSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Urgency message at 20s remaining
  useEffect(() => {
    if (timeLeft <= 20 && timeLeft > 0 && !urgencyTriggeredRef.current && !endedRef.current) {
      urgencyTriggeredRef.current = true
      const urgencyText =
        section === 'A'
          ? "Excusez-moi, j'ai un appel entrant urgent. Je dois vous laisser. Au revoir !"
          : "Désolé(e), j'ai une urgence, je dois te laisser ! On se reparle bientôt !"
      appendTurn({ role: 'assistant', content: urgencyText, timestamp: Date.now() })
      if (dcRef.current?.readyState === 'open') {
        dcRef.current.send(JSON.stringify({ type: 'response.cancel' }))
        dcRef.current.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text'],
            instructions: `Dis exactement ceci : "${urgencyText}"`,
          },
        }))
      }
    }
  }, [timeLeft, section, appendTurn])

  const handleEndSection = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    setEnded(true)
    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify({ type: 'response.cancel' }))
    }
    if (iceTimeoutRef.current) clearTimeout(iceTimeoutRef.current)
    if (dcRef.current) { try { dcRef.current.close() } catch {} dcRef.current = null }
    if (pcRef.current) { try { pcRef.current.close() } catch {} pcRef.current = null }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause()
      remoteAudioRef.current.srcObject = null
    }
    if (timerRef.current) clearInterval(timerRef.current)
    onComplete(historyRef.current)
  }, [onComplete])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const isLow = timeLeft <= 60
  const sectionLabel =
    section === 'A' ? 'Section A — Obtenir des informations' : 'Section B — Présenter et convaincre'
  const accentBg = section === 'A' ? 'bg-tef-blue' : 'bg-orange-500'

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header — pleine largeur */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-block px-3 py-1 ${accentBg} text-white text-xs font-semibold rounded-full`}
          >
            {sectionLabel}
          </span>
          {/* Counter badge */}
          {section === 'A' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-tef-blue text-xs font-semibold rounded-full">
              ❓ {questionCount}/10
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              💬 {argCount} arg.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-lg font-black tabular-nums ${
              isLow ? 'text-red-600 animate-pulse' : 'text-gray-700'
            }`}
          >
            {mm}:{ss}
          </span>
          {onRequestExit && (
            <button
              onClick={onRequestExit}
              className="px-2 py-0.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Corps — 2 colonnes (lg+) ou empilé (mobile) */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ── Colonne gauche : Annonce + Image (70%) — toujours visible ── */}
        <div className="h-[38vh] flex-shrink-0 lg:h-auto lg:flex-shrink-0 lg:w-[70%] w-full flex flex-col items-center justify-center overflow-hidden p-4 lg:p-8 gap-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">

          {/* Image — affichée si disponible */}
          {sectionData.imageUrl && (
            <div className="w-full max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sectionData.imageUrl}
                alt="Document support"
                className="w-full object-contain rounded-xl border border-gray-200 bg-gray-50 max-h-[28vh] lg:max-h-[68vh]"
              />
            </div>
          )}

          {/* Annonce / Publicité — carte formatée affichée quand pas d'image */}
          {!sectionData.imageUrl && sectionData.longText && (
            <div className="w-full max-w-xl">
              <div
                className={`rounded-xl border-2 p-4 lg:p-6 shadow-sm flex flex-col items-center ${
                  section === 'A'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                {sectionData.taskTitle && (
                  <>
                    <h2
                      className={`text-center font-bold text-lg lg:text-xl mb-3 ${
                        section === 'A' ? 'text-tef-blue' : 'text-orange-700'
                      }`}
                    >
                      {sectionData.taskTitle}
                    </h2>
                    <hr
                      className={`w-full mb-4 ${
                        section === 'A' ? 'border-blue-300' : 'border-orange-300'
                      }`}
                    />
                  </>
                )}
                <p className="text-gray-800 text-sm leading-normal whitespace-pre-wrap text-center w-full">
                  {sectionData.longText}
                </p>
              </div>
            </div>
          )}

          {/* Aucun document support */}
          {!sectionData.imageUrl && !sectionData.longText && (
            <div className="w-full max-w-xl text-center py-8">
              <p className="text-gray-400 text-sm italic">
                Aucun document support pour cette section.
              </p>
            </div>
          )}

          {/* Consigne — toujours visible sous le document */}
          {sectionData.consigne && (
            <div
              className={`w-full max-w-xl rounded-lg px-3 py-2 text-xs ${
                section === 'A'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-orange-50 text-orange-800 border border-orange-200'
              }`}
            >
              <span className="font-semibold">Consigne : </span>
              {sectionData.consigne}
            </div>
          )}

        </div>

        {/* ── Colonne droite : Chat + Contrôles (30%) ── */}
        <div className="flex-1 lg:flex-none lg:w-[30%] flex flex-col bg-gray-50 min-h-0">

          {/* Bulles de chat */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
            {history.length === 0 && !aiTyping && (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-xs text-gray-400 italic text-center">
                  La conversation va commencer…
                </p>
              </div>
            )}

            {history.map((turn, i) => (
              <div
                key={i}
                className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    turn.role === 'user'
                      ? `${accentBg} text-white rounded-br-sm`
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <span className="block text-[10px] opacity-60 mb-0.5">
                    {turn.role === 'user' ? 'Vous' : 'Interlocuteur'}
                  </span>
                  {turn.content}
                </div>
              </div>
            ))}

            {/* Indicateur IA en train d'écrire */}
            {aiTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-3 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Bulle transcript en direct */}
            {rtcState === 'user_speaking' && liveTranscript && (
              <div className="flex justify-end">
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs ${accentBg} text-white opacity-70 rounded-br-sm italic`}
                >
                  {liveTranscript}…
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Contrôles voix / texte */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
            {!ended ? (
              rtcState !== 'error' && inputMode === 'voice' ? (
                /* ── WebRTC voice mode — VAD handles turn-taking automatically ── */
                <div className="flex flex-col items-center gap-2 py-1">
                  {rtcState === 'connecting' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500 animate-pulse">
                      <span className="w-2 h-2 bg-gray-400 rounded-full inline-block" />
                      Connexion à l&apos;interlocuteur…
                    </div>
                  )}
                  {(rtcState === 'connected' || rtcState === 'idle') && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs text-green-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                      En écoute — parlez naturellement
                    </div>
                  )}
                  {rtcState === 'user_speaking' && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs animate-pulse ${
                      section === 'A'
                        ? 'bg-blue-50 border border-blue-200 text-tef-blue'
                        : 'bg-orange-50 border border-orange-200 text-orange-700'
                    }`}>
                      <span className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 rounded bg-current" style={{ height: '50%' }} />
                        <span className="w-0.5 rounded bg-current" style={{ height: '100%' }} />
                        <span className="w-0.5 rounded bg-current" style={{ height: '70%' }} />
                        <span className="w-0.5 rounded bg-current" style={{ height: '40%' }} />
                      </span>
                      Vous parlez…
                    </div>
                  )}
                  {rtcState === 'ai_speaking' && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                      section === 'A'
                        ? 'bg-blue-50 border border-blue-200 text-tef-blue'
                        : 'bg-orange-50 border border-orange-200 text-orange-700'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current inline-block animate-bounce" />
                      Interlocuteur répond…
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 text-center leading-tight">
                    Détection automatique de la parole active
                  </p>
                  <button
                    onClick={() => {
                      if (dcRef.current?.readyState === 'open') {
                        dcRef.current.send(JSON.stringify({ type: 'response.cancel' }))
                      }
                      setRtcState('error')
                      setInputMode('text')
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ✏️ Passer en mode texte
                  </button>
                  <button
                    onClick={handleEndSection}
                    className="w-full px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Terminer cette section →
                  </button>
                </div>
              ) : (
                /* ── Mode texte (fallback WebRTC échoué ou préférence) ── */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">
                      {rtcState === 'error' ? '⚠️ Mode texte (vocal indisponible)' : '✏️ Mode texte'}
                    </p>
                    {rtcState !== 'error' && (
                      <button
                        onClick={() => setInputMode('voice')}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        🎤 Vocal
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={textInputValue}
                      onChange={(e) => setTextInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          const text = textInputValue.trim()
                          if (!text || aiTyping) return
                          setTextInputValue('')
                          const userTurn: DialogueTurn = { role: 'user', content: text, timestamp: Date.now() }
                          appendTurn(userTurn)
                          const updatedHistory = [...historyRef.current, userTurn]
                          historyRef.current = updatedHistory
                          sendToAI(text, updatedHistory)
                        }
                      }}
                      disabled={aiTyping}
                      rows={2}
                      placeholder="Écrivez votre réponse… (Entrée pour envoyer)"
                      className="flex-1 resize-none border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                      onClick={() => {
                        const text = textInputValue.trim()
                        if (!text || aiTyping) return
                        setTextInputValue('')
                        const userTurn: DialogueTurn = { role: 'user', content: text, timestamp: Date.now() }
                        appendTurn(userTurn)
                        const updatedHistory = [...historyRef.current, userTurn]
                        historyRef.current = updatedHistory
                        sendToAI(text, updatedHistory)
                      }}
                      disabled={!textInputValue.trim() || aiTyping}
                      className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors ${
                        textInputValue.trim() && !aiTyping
                          ? `${accentBg} hover:opacity-90`
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Envoyer
                    </button>
                  </div>
                  <button
                    onClick={handleEndSection}
                    className="w-full px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Terminer cette section →
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-2">
                <p className="text-green-700 font-semibold text-xs">✅ Section terminée…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── Main Page ─────────────────── */

export default function EOPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const seriesId = params.id as string
  const userFirstName = session?.user?.name?.split(' ')[0] ?? ''

  const [series, setSeries] = useState<Series | null>(null)
  const [sectionA, setSectionA] = useState<SectionData>({
    longText: null,
    imageUrl: null,
    consigne:
      "Vous téléphonez pour avoir plus d'informations sur cette annonce. Posez une dizaine de questions à votre interlocuteur(trice). Utilisez le vouvoiement.",
    taskTitle: null,
  })
  const [sectionB, setSectionB] = useState<SectionData>({
    longText: null,
    imageUrl: null,
    consigne:
      "Vous en parlez à un(e) ami(e). Présentez ce document et essayez de le / la convaincre d'y participer. Utilisez le tutoiement.",
    taskTitle: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<EoStep>('intro')
  const [historyA, setHistoryA] = useState<DialogueTurn[]>([])
  const [historyB, setHistoryB] = useState<DialogueTurn[]>([])
  const [result, setResult] = useState<EOResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/connexion')
      return
    }
    Promise.all([
      fetch(`/api/series/${seriesId}`).then((r) => r.json()),
      fetch(`/api/series/${seriesId}/questions`).then((r) => r.json()),
    ])
      .then(([seriesData, questionsData]) => {
        if (seriesData && typeof seriesData === 'object' && 'id' in seriesData) {
          setSeries(seriesData as Series)
        } else {
          setError('Série introuvable.')
          setLoading(false)
          return
        }
        if (Array.isArray(questionsData)) {
          const qA = questionsData.find(
            (q: { category?: string }) => q.category === 'SECTION_A'
          )
          const qB = questionsData.find(
            (q: { category?: string }) => q.category === 'SECTION_B'
          )
          if (qA) {
            setSectionA({
              longText: qA.longText ?? null,
              imageUrl: qA.imageUrl ?? null,
              consigne:
                qA.question ||
                "Vous téléphonez pour avoir plus d'informations sur cette annonce. Posez une dizaine de questions à votre interlocuteur(trice). Utilisez le vouvoiement.",
              taskTitle: qA.taskTitle ?? null,
            })
          }
          if (qB) {
            setSectionB({
              longText: qB.longText ?? null,
              imageUrl: qB.imageUrl ?? null,
              consigne:
                qB.question ||
                "Vous en parlez à un(e) ami(e). Présentez ce document et essayez de le / la convaincre d'y participer. Utilisez le tutoiement.",
              taskTitle: qB.taskTitle ?? null,
            })
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement.')
        setLoading(false)
      })
  }, [seriesId, session, status, router])

  // Prevent accidental tab/window close during active exam
  useEffect(() => {
    if (step === 'results' || step === 'scoring' || step === 'intro') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [step])

  const handleDialogueAComplete = useCallback((hist: DialogueTurn[]) => {
    setHistoryA(hist)
    setStep('pause')
  }, [])

  const handleDialogueBComplete = useCallback(
    async (hist: DialogueTurn[]) => {
      setHistoryB(hist)
      setStep('scoring')
      setAiError(null)

      // Build transcripts from dialogue history
      const buildTranscript = (h: DialogueTurn[]) =>
        h
          .map(
            (t) =>
              `${t.role === 'user' ? 'Candidat' : 'Interlocuteur'}: ${t.content}`
          )
          .join('\n')

      const transcriptA = buildTranscript(historyA)
      const transcriptB = buildTranscript(hist)

      // AI scoring first — then save attempt with the result
      let eoResult: EOResult | null = null
      try {
        const res = await fetch('/api/scoring/eo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcriptionA:
              transcriptA || '[Aucune réplique enregistrée pour la Section A]',
            transcriptionB:
              transcriptB || '[Aucune réplique enregistrée pour la Section B]',
            announcementA: sectionA.longText ?? '[Document non disponible]',
            announcementB: sectionB.longText ?? '[Document non disponible]',
          }),
        })
        if (res.ok) {
          eoResult = (await res.json()) as EOResult
          setResult(eoResult)
        } else {
          setAiError('La correction par IA a échoué.')
        }
      } catch {
        setAiError('Erreur réseau lors de la correction IA.')
      }

      // Save attempt — includes AI score and CECRL level if scoring succeeded
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId,
          moduleCode: 'EO',
          answers: {},
          ...(eoResult && {
            aiScore: eoResult.globalScore,
            cecrlLevel: eoResult.globalCecrlLevel,
          }),
        }),
      }).catch(() => {})

      setStep('results')
    },
    [historyA, seriesId, sectionA.longText, sectionB.longText]
  )

  /* ─── Loading / Error ─── */

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-tef-blue text-white rounded-lg text-sm"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  /* ─── Scoring spinner ─── */

  if (step === 'scoring') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">Correction par IA en cours…</p>
        <p className="text-gray-400 text-sm">Cela peut prendre quelques secondes.</p>
      </div>
    )
  }

  /* ─── Results ─── */

  if (step === 'results') {
    const buildTranscript = (h: DialogueTurn[]) =>
      h
        .map(
          (t) =>
            `${t.role === 'user' ? 'Vous' : 'Interlocuteur'}: ${t.content}`
        )
        .join('\n')

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Résultats — Expression Orale
            </h1>
            <p className="text-gray-500 text-sm mt-1">{series?.title}</p>
          </div>

          {aiError && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
              {aiError}
            </div>
          )}

          {/* AI results */}
          {result && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-5xl font-black text-tef-blue mb-2">
                  {result.globalScore}
                  <span className="text-2xl text-gray-400">/100</span>
                </p>
                <p className="text-2xl font-bold text-tef-red">{result.globalCecrlLevel}</p>
                <p className="text-sm text-gray-500 mt-1">Score global / Niveau CECRL</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <EOSectionCard
                  label="Section A — Obtenir des informations"
                  score={result.sectionA}
                  extraInfo={
                    result.sectionA.nbQuestionsDetectees !== undefined
                      ? `${result.sectionA.nbQuestionsDetectees} question(s) détectée(s)`
                      : undefined
                  }
                />
                <EOSectionCard
                  label="Section B — Présenter et convaincre"
                  score={result.sectionB}
                  extraInfo={
                    result.sectionB.argumentsDetectes !== undefined
                      ? `${result.sectionB.argumentsDetectes} argument(s) détecté(s)`
                      : undefined
                  }
                />
              </div>

              {(result.pronunciation || result.lexique) && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <h3 className="font-semibold text-gray-900">Commentaires généraux</h3>
                  {result.pronunciation && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Prononciation & Fluidité</p>
                      <p className="text-sm text-gray-700">{result.pronunciation}</p>
                    </div>
                  )}
                  {result.lexique && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Lexique & Grammaire</p>
                      <p className="text-sm text-gray-700">{result.lexique}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Conversation transcripts */}
          {(historyA.length > 0 || historyB.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Transcriptions de dialogue</h2>

              {historyA.length > 0 && (
                <details className="bg-white rounded-xl border border-gray-100 p-5">
                  <summary className="font-semibold text-gray-800 cursor-pointer">
                    Section A — Obtenir des informations
                  </summary>
                  <pre className="mt-3 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
                    {buildTranscript(historyA)}
                  </pre>
                </details>
              )}

              {historyB.length > 0 && (
                <details className="bg-white rounded-xl border border-gray-100 p-5">
                  <summary className="font-semibold text-gray-800 cursor-pointer">
                    Section B — Présenter et convaincre
                  </summary>
                  <pre className="mt-3 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
                    {buildTranscript(historyB)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Intro ─── */

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">Expression Orale</h1>
            <p className="text-gray-500 text-sm mt-1">{series?.title}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 text-center">
              Présentation de l&apos;épreuve
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-xl">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-semibold text-tef-blue text-sm">
                    Section A — Obtenir des informations
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous lisez une annonce, puis échangez en direct avec un interlocuteur IA.
                    Posez une dizaine de questions pour obtenir des informations.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Préparation : 30 s · Dialogue : 5 min · Registre formel (vouvoiement)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-orange-50 rounded-xl">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-orange-700 text-sm">
                    Section B — Présenter et convaincre
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous lisez une nouvelle annonce, puis la présentez à un(e) ami(e) IA
                    et essayez de le / la convaincre d&apos;y participer.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Préparation : 60 s · Dialogue : 10 min · Registre informel (tutoiement)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 space-y-1">
              <p>🎙️ Activez votre microphone avant de commencer.</p>
              <p>🌐 La reconnaissance vocale fonctionne sur Chrome et Edge.</p>
              <p>🔇 Placez-vous dans un endroit calme pour de meilleurs résultats.</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('prepA')}
                className="px-8 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
              >
                Commencer l&apos;épreuve →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Prep A ─── */

  if (step === 'prepA') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-tef-blue text-white text-xs font-semibold rounded-full mb-3">
                  Section A — Préparation
                </span>
                <h1 className="text-xl font-bold text-gray-900">Lisez l&apos;annonce suivante</h1>
              </div>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                ✕ Abandonner
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <SectionDocument
                  section={sectionA}
                  consigne={sectionA.consigne}
                  consigneColor="blue"
                />
              </div>
              <div className="flex-shrink-0 flex flex-col items-center justify-center lg:pt-4">
                <Countdown seconds={30} onDone={() => setStep('dialogueA')} label="Temps de préparation" />
              </div>
            </div>
          </div>
        </div>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Quitter le test ?</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Vos réponses ne seront pas enregistrées et votre progression sera perdue.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quitter sans soumettre
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  /* ─── Dialogue A ─── */

  if (step === 'dialogueA') {
    return (
      <>
        <DialogueSection
          section="A"
          sectionData={sectionA}
          durationSeconds={300}
          onComplete={handleDialogueAComplete}
          userName={userFirstName}
          onRequestExit={() => setShowExitConfirm(true)}
        />
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Quitter le test ?</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Vos réponses ne seront pas enregistrées et votre progression sera perdue.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quitter sans soumettre
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  /* ─── Pause ─── */

  if (step === 'pause') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-sm mx-auto text-center space-y-6 p-8">
            <div className="text-5xl">⏸</div>
            <h2 className="text-xl font-bold text-gray-900">Pause entre les sections</h2>
            <p className="text-sm text-gray-500">
              La Section B commence dans quelques instants. Préparez-vous.
            </p>
            <Countdown seconds={10} onDone={() => setStep('prepB')} label="Pause" />
            <button
              onClick={() => setShowExitConfirm(true)}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              ✕ Abandonner le test
            </button>
          </div>
        </div>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Quitter le test ?</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Vos réponses ne seront pas enregistrées et votre progression sera perdue.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quitter sans soumettre
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  /* ─── Prep B ─── */

  if (step === 'prepB') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-3">
                  Section B — Préparation
                </span>
                <h1 className="text-xl font-bold text-gray-900">Lisez l&apos;annonce suivante</h1>
              </div>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                ✕ Abandonner
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <SectionDocument
                  section={sectionB}
                  consigne={sectionB.consigne}
                  consigneColor="orange"
                />
              </div>
              <div className="flex-shrink-0 flex flex-col items-center justify-center lg:pt-4">
                <Countdown seconds={60} onDone={() => setStep('dialogueB')} label="Temps de préparation" />
              </div>
            </div>
          </div>
        </div>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Quitter le test ?</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Vos réponses ne seront pas enregistrées et votre progression sera perdue.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quitter sans soumettre
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  /* ─── Dialogue B ─── */

  if (step === 'dialogueB') {
    return (
      <>
        <DialogueSection
          section="B"
          sectionData={sectionB}
          durationSeconds={600}
          onComplete={handleDialogueBComplete}
          userName={userFirstName}
          onRequestExit={() => setShowExitConfirm(true)}
        />
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Quitter le test ?</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Vos réponses ne seront pas enregistrées et votre progression sera perdue.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quitter sans soumettre
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}
