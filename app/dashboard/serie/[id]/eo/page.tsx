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
  nclcLevel?: number   // 0–12
  score: number        // sur 225
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
  globalNclcLevel?: number  // 0–12
  globalScore: number       // sur 450
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

  const consigneBg = 'bg-blue-50 text-blue-800'
  const annonceBorder = 'border-blue-200 bg-blue-50'
  const annonceTitleColor = 'text-tef-blue'

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
              <hr className="w-full mb-4 border-blue-300" />
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
  const isA = label.includes('Section A') || label.includes('informations')
  const accentBg = 'bg-blue-50 border-blue-100'
  const accentText = 'text-tef-blue'
  const accentIcon = isA ? '🎙️' : '💬'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${accentBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{accentIcon}</span>
          <p className={`font-extrabold text-xs ${accentText}`}>{label}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xl font-black ${accentText}`}>{score.score}<span className="text-sm text-gray-300">/225</span></span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-tef-blue text-white">{score.cecrlLevel}</span>
            {score.nclcLevel !== undefined && (
              <span className="text-[10px] font-bold text-blue-400">NCLC {score.nclcLevel}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {extraInfo && (
          <p className={`text-xs font-semibold ${accentText} flex items-center gap-1`}>
            <span>📊</span> {extraInfo}
          </p>
        )}
        {score.registreAdapte !== undefined && (
          <p className={`text-xs font-semibold flex items-center gap-1 ${
            score.registreAdapte ? 'text-emerald-600' : 'text-orange-600'
          }`}>
            {score.registreAdapte ? '✅ Registre adapté' : '⚠️ Registre à ajuster'}
          </p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{score.feedback}</p>

        {score.strengths.length > 0 && (
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p className="text-xs font-extrabold text-emerald-700 mb-2 flex items-center gap-1">
              <span>✅</span> Points forts
            </p>
            <ul className="space-y-1">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-emerald-800">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {score.improvements.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-xs font-extrabold text-orange-700 mb-2 flex items-center gap-1">
              <span>💡</span> À améliorer
            </p>
            <ul className="space-y-1">
              {score.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-orange-800">
                  <span className="text-orange-500 mt-0.5 flex-shrink-0">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
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
  // openingInstructionRef removed — opening messages sent directly in dc.onopen
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const iceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rtcStateRef = useRef<RtcState>('idle')

  // Pick one voice per section and keep it stable for the whole session
  // Female voices: Hélène, Ashley — Male voices: Alain, Mathieu, Étienne
  const voice = useRef<string>(
    section === 'A'
      ? (['Hélène', 'Ashley', 'Alain'][Math.floor(Math.random() * 3)])
      : (['Mathieu', 'Étienne', 'Ashley'][Math.floor(Math.random() * 3)])
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
        remoteAudioRef.current.remove()
        remoteAudioRef.current = null
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
        // Session confirmed — just log it (opening messages already sent in dc.onopen)
        case 'session.updated':
        case 'session.created':
          console.debug('[EO_REALTIME] session configured')
          break

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

        // Streaming text delta from assistant (per Inworld WebRTC docs)
        case 'response.output_text.delta':
        case 'response.text.delta':
          setAiTyping(true)
          break

        case 'response.output_text.done':
        case 'response.text.done': {
          const text = (event.text as string) ?? ''
          if (text.trim()) {
            appendTurn({ role: 'assistant', content: text.trim(), timestamp: Date.now() })
          }
          setAiTyping(false)
          break
        }

        case 'error':
          console.error('[EO_REALTIME] event error:', event.message, JSON.stringify(event))
          break

        default:
          // Log unknown events during development
          console.debug('[EO_REALTIME] event:', event.type, event)
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
      remoteAudioRef.current.remove()
      remoteAudioRef.current = null
    }
    sessionConfiguredRef.current = false
    setRtcState('error')
    setInputMode('text')
    setAiTyping(false)
    sendToAI('[DÉBUT DE LA CONVERSATION]', [])
  }, [sendToAI])

  // ── WebRTC: Session.update with exact Inworld format ────────
  const sendSessionUpdate = useCallback(
    (dc: RTCDataChannel) => {
      const documentContext = sectionData.longText
        ? `\n\nANNONCE :\n${sectionData.longText}`
        : ''

      const instructions =
        section === 'A'
          ? `LANGUE : Tu parles UNIQUEMENT en français. Jamais un mot en anglais.

TON RÔLE : Tu es la PERSONNE QUI A PUBLIÉ l'annonce ci-dessous. Tu travailles dans l'organisme ou l'entreprise qui a créé cette annonce. Tu es un(e) employé(e) compétent(e) qui connaît bien l'activité, le service ou l'événement présenté.

SITUATION : Un candidat (l'utilisateur) te téléphone pour obtenir des renseignements. Tu décroches et réponds poliment. Il peut poser des questions sur ce qui est dans l'annonce, mais aussi sur des détails pratiques que l'annonce ne mentionne pas.

COMPORTEMENT :
- Tu VOUVOIES le candidat (registre formel, professionnel).
- Tu réponds de façon courte et précise (1 à 2 phrases maximum par réponse).
- Pour les informations présentes dans l'annonce, tu les donnes fidèlement.
- Pour les questions dont la réponse N'EST PAS dans l'annonce (ex : accès en transport, restauration, hébergement, tenue requise, matériel à apporter, politique d'annulation, accessibilité PMR, parking, etc.), tu IMPROVISES une réponse cohérente et réaliste, comme le ferait un vrai employé bien informé. Ne dis JAMAIS "je n'ai pas cette information" — donne toujours une réponse plausible et utile.
- Exemples d'improvisation : si on te demande comment venir en transport → cite les lignes les plus proches ; si on demande s'il faut apporter quelque chose → donne un conseil logique ; si on demande la politique d'annulation → réponds avec une politique standard.
- Tu es serviable, chaleureux(se) et professionnel(le).
${documentContext}`
          : `LANGUE : Tu parles UNIQUEMENT en français. Jamais un mot en anglais.

TON RÔLE : Tu es l'AMI(E) PROCHE de l'utilisateur. Tu t'appelles ${['Mathieu', 'Étienne', 'Alain'].includes(voice) ? 'Marc' : 'Sophie'}. Vous vous connaissez depuis longtemps.

SITUATION : Ton ami(e) (l'utilisateur) vient te voir pour te parler d'une activité ou d'un événement décrit dans une annonce. Il/elle veut te CONVAINCRE d'y participer avec lui/elle. Toi, tu n'es PAS du tout enthousiaste au départ.

COMPORTEMENT :
- Tu TUTOIES ton ami(e) (registre informel, amical).
- Tu es SCEPTIQUE et DUBITATIF(VE) au début. Tu poses des questions, tu exprimes des doutes.
- Exemples de réactions : "Bof, je sais pas…" / "C'est cher non ?" / "J'ai pas trop envie…" / "T'es sûr(e) que c'est bien ?" / "Ça m'emballe pas trop…"
- Tu ne cèdes QUE progressivement, après 3 ou 4 arguments solides de ton ami(e).
- Réponses courtes : 1 à 2 phrases maximum.
- Quand tu commences à être convaincu(e), montre-le graduellement : "Bon, c'est vrai que…" / "Hmm, dit comme ça…" / "Ok, pourquoi pas, tu me convaincs !"
${documentContext}`

      const openingCue =
        section === 'A'
          ? 'Commence maintenant. Dis : "Bonjour, comment puis-je vous aider ?"'
          : `Commence maintenant. Dis : "Salut ${userName || 'toi'} ! Comment vas-tu aujourd'hui mon ami(e) ?"`

      // Send all three messages immediately in dc.onopen (official quickstart pattern)
      dc.send(JSON.stringify({
        type: 'session.update',
        session: {
          type: 'realtime',
          model: 'google-ai-studio/gemini-2.5-flash',
          instructions,
          output_modalities: ['audio', 'text'],
          audio: {
            input: {
              turn_detection: {
                type: 'semantic_vad',
                eagerness: 'low',
                create_response: true,
                interrupt_response: true,
              },
            },
            output: {
              model: 'inworld-tts-1.5-max',
              voice: voice,
            },
          },
        },
      }))
      dc.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: openingCue }],
        },
      }))
      dc.send(JSON.stringify({ type: 'response.create' }))
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
          audio: { echoCancellation: true, noiseSuppression: true },
        })
      } catch {
        handleWebRTCFailure(); return
      }

      // Fetch Inworld ICE servers (STUN/TURN) from our proxy
      let iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
      try {
        const iceRes = await fetch('/api/eo-realtime/ice-servers')
        if (iceRes.ok) {
          const iceData = await iceRes.json() as { iceServers?: RTCIceServer[] }
          if (iceData.iceServers?.length) iceServers = iceData.iceServers
        }
      } catch { /* use fallback */ }

      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc

      micStream.getAudioTracks().forEach((t) => pc.addTrack(t, micStream))

      // Incoming audio from Inworld → create MediaStream from track (official pattern)
      pc.ontrack = (e) => {
        if (e.track.kind === 'audio') {
          const audio = document.createElement('audio')
          audio.autoplay = true
          audio.srcObject = new MediaStream([e.track])
          document.body.appendChild(audio)
          remoteAudioRef.current = audio
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

      // Wait for ICE gathering — official debounce pattern:
      // resolve 500ms after the last candidate, or on 'complete', or after 3s hard timeout
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') { resolve(); return }
        let debounce: ReturnType<typeof setTimeout> | null = null
        const done = () => { clearTimeout(debounce!); clearTimeout(hard); resolve() }
        const hard = setTimeout(done, 3000)
        iceTimeoutRef.current = hard
        pc.onicecandidate = (e) => {
          if (e.candidate) { if (debounce) clearTimeout(debounce); debounce = setTimeout(done, 500) }
        }
        pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') done() }
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
      remoteAudioRef.current.remove()
      remoteAudioRef.current = null
    }
    if (timerRef.current) clearInterval(timerRef.current)
    onComplete(historyRef.current)
  }, [onComplete])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const isLow = timeLeft <= 60
  const sectionLabel =
    section === 'A' ? 'Section A — Obtenir des informations' : 'Section B — Présenter et convaincre'
  const accentBg = 'bg-tef-blue'

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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
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
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                {sectionData.taskTitle && (
                  <>
                    <h2 className="text-center font-bold text-lg lg:text-xl mb-3 text-tef-blue">
                      {sectionData.taskTitle}
                    </h2>
                    <hr className="w-full mb-4 border-blue-300" />
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
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
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
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs animate-pulse bg-blue-50 border border-blue-200 text-tef-blue">
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
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-blue-50 border border-blue-200 text-tef-blue">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-tef-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Chargement de la série…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center max-w-sm w-full space-y-4">
          <div className="text-4xl">❌</div>
          <p className="font-bold text-gray-800">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors"
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full space-y-5">
          <div className="w-16 h-16 bg-tef-blue/10 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="font-extrabold text-gray-800 text-lg">Correction en cours…</p>
            <p className="text-gray-400 text-sm mt-1">L&apos;IA analyse vos deux sections.</p>
          </div>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-tef-blue animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ─── Results ─── */

  if (step === 'results') {
    const buildTranscript = (h: DialogueTurn[]) =>
      h.map((t) => `${t.role === 'user' ? 'Vous' : 'Interlocuteur'}: ${t.content}`).join('\n')

    const CECRL_GRADIENT: Record<string, string> = {
      A1: 'from-red-500 to-red-600', A2: 'from-orange-500 to-orange-600',
      B1: 'from-yellow-500 to-amber-500', B2: 'from-green-500 to-emerald-500',
      C1: 'from-blue-600 to-tef-blue', C2: 'from-purple-600 to-purple-700',
    }
    const cecrlGrad = result ? (CECRL_GRADIENT[result.globalCecrlLevel] ?? 'from-blue-600 to-tef-blue') : 'from-gray-400 to-gray-500'

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Results hero */}
        <div className={`bg-gradient-to-br ${cecrlGrad} text-white`}>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Expression Orale</p>
                <h1 className="text-2xl font-extrabold">{series?.title}</h1>
                <p className="text-white/70 text-sm mt-1">Correction par intelligence artificielle</p>
              </div>
              {result && (
                <div className="text-center bg-white/15 rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-5xl font-black text-white leading-none">
                    {result.globalScore}<span className="text-xl text-white/60">/450</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">{result.globalCecrlLevel}</div>
                  {result.globalNclcLevel !== undefined && (
                    <div className="mt-1 inline-block bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      NCLC {result.globalNclcLevel}
                    </div>
                  )}
                  <div className="text-white/60 text-xs mt-1">Score global · Niveau CECRL</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {aiError && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="text-lg flex-shrink-0">⚠️</span>
              {aiError}
            </div>
          )}

          {result && (
            <>
              {/* Section score summary */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Section A', sub: 'Obtenir des informations', score: result.sectionA, color: 'from-blue-600 to-tef-blue' },
                  { label: 'Section B', sub: 'Présenter et convaincre', score: result.sectionB, color: 'from-blue-600 to-blue-700' },
                ].map(({ label, sub, score, color }) => (
                  <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white`}>
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">{label}</p>
                    <p className="font-bold text-sm mt-0.5 leading-tight">{sub}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-black leading-none">{score.score}</span>
                      <span className="text-white/60 text-sm mb-0.5">/225</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-white/80 text-xs font-bold">{score.cecrlLevel}</span>
                      {score.nclcLevel !== undefined && (
                        <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NCLC {score.nclcLevel}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <EOSectionCard
                  label="Section A — Obtenir des informations"
                  score={result.sectionA}
                  extraInfo={result.sectionA.nbQuestionsDetectees !== undefined
                    ? `${result.sectionA.nbQuestionsDetectees} question(s) détectée(s)` : undefined}
                />
                <EOSectionCard
                  label="Section B — Présenter et convaincre"
                  score={result.sectionB}
                  extraInfo={result.sectionB.argumentsDetectes !== undefined
                    ? `${result.sectionB.argumentsDetectes} argument(s) détecté(s)` : undefined}
                />
              </div>

              {(result.pronunciation || result.lexique) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <h3 className="font-extrabold text-gray-900">Commentaires généraux</h3>
                  {result.pronunciation && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs font-extrabold text-blue-700 mb-1">🗣️ Prononciation & Fluidité</p>
                      <p className="text-sm text-gray-700">{result.pronunciation}</p>
                    </div>
                  )}
                  {result.lexique && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-xs font-extrabold text-purple-700 mb-1">📚 Lexique & Grammaire</p>
                      <p className="text-sm text-gray-700">{result.lexique}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Transcripts */}
          {(historyA.length > 0 || historyB.length > 0) && (
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-gray-900">📄 Transcriptions</h2>
              {historyA.length > 0 && (
                <details className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <summary className="px-5 py-4 font-semibold text-gray-800 cursor-pointer text-sm hover:bg-gray-50 rounded-xl transition-colors">
                    Section A — Obtenir des informations ({historyA.length} répliques)
                  </summary>
                  <pre className="px-5 pb-4 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans border-t border-gray-50 pt-3">
                    {buildTranscript(historyA)}
                  </pre>
                </details>
              )}
              {historyB.length > 0 && (
                <details className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <summary className="px-5 py-4 font-semibold text-gray-800 cursor-pointer text-sm hover:bg-gray-50 rounded-xl transition-colors">
                    Section B — Présenter et convaincre ({historyB.length} répliques)
                  </summary>
                  <pre className="px-5 pb-4 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans border-t border-gray-50 pt-3">
                    {buildTranscript(historyB)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors shadow-sm"
            >
              Retour au tableau de bord →
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
        {/* Header */}
        <div className="bg-gradient-to-br from-tef-blue via-blue-700 to-blue-600 text-white">
          <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🎤</div>
            <h1 className="text-2xl font-extrabold">Expression Orale</h1>
            <p className="text-white/80 text-sm mt-1">{series?.title} · 15 minutes · 2 sections</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Sections */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-tef-blue px-4 py-3">
                <p className="text-white font-extrabold text-sm">Section A</p>
                <p className="text-white/70 text-xs">Obtenir des informations</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-tef-blue flex items-center justify-center font-bold text-[10px] flex-shrink-0">A</span>
                  Préparez votre appel téléphonique (30 s)
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-tef-blue flex items-center justify-center font-bold text-[10px] flex-shrink-0">5'</span>
                  Dialogue en direct avec l&apos;interlocuteur IA
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  🎩 Registre formel · vouvoiement · ~10 questions
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <p className="text-white font-extrabold text-sm">Section B</p>
                <p className="text-white/70 text-xs">Présenter et convaincre</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">B</span>
                  Lisez l&apos;annonce et préparez-vous (60 s)
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">10'</span>
                  Présentez et convainquez un(e) ami(e) IA
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  👕 Registre informel · tutoiement · 3+ arguments
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-extrabold text-amber-800 mb-2">Avant de commencer :</p>
            {[
              '🎙️ Activez votre microphone — la voix est recommandée',
              '🌐 Utilisez Chrome ou Edge pour la reconnaissance vocale',
              '🔇 Placez-vous dans un endroit calme pour de meilleurs résultats',
            ].map((tip) => (
              <p key={tip} className="text-xs text-amber-800">{tip}</p>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep('prepA')}
              className="px-8 py-3 bg-gradient-to-r from-tef-blue to-blue-600 text-white font-extrabold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Commencer l&apos;épreuve →
            </button>
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
                <span className="inline-block px-3 py-1 bg-tef-blue text-white text-xs font-semibold rounded-full mb-3">
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
                  consigneColor="blue"
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
