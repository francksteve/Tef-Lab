'use client'
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Timer from '@/components/ui/Timer'
import AudioPlayer from '@/components/ui/AudioPlayer'

interface Module {
  id: string
  name: string
  code: string
  duration: number
}

interface Series {
  id: string
  title: string
  module: Module
}

interface Question {
  id: string
  questionOrder: number
  category?: string | null
  subCategory?: string | null
  taskTitle?: string | null
  longText?: string | null
  consigne?: string | null
  comment?: string | null
  description?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string | null
}

type AnswerMap = Record<string, 'A' | 'B' | 'C' | 'D' | null>

interface CorrectionItem {
  question: Question
  userAnswer: 'A' | 'B' | 'C' | 'D' | null
  isCorrect: boolean
}

interface ScoreResult {
  score: number
  cecrlLevel: string
  timeTaken: number
  corrections: CorrectionItem[]
}

const optionLabels = ['A', 'B', 'C', 'D'] as const
type OptionLabel = typeof optionLabels[number]

function getOption(q: Question, opt: OptionLabel): string {
  const map: Record<OptionLabel, string> = {
    A: q.optionA,
    B: q.optionB,
    C: q.optionC,
    D: q.optionD,
  }
  return map[opt]
}

// ── CE category label map ────────────────────────────────────────────────────
const CE_CATEGORY_LABELS: Record<string, string> = {
  'Q1-7':   'Documents de la vie quotidienne',
  'Q8-17':  'Phrases et textes lacunaires',
  'Q18-21': 'Lecture rapide de textes',
  'Q22':    'Lecture rapide de graphiques',
  'Q23-32': 'Documents administratifs et professionnels',
  'Q33-40': 'Articles de presse',
}

// ── CO audio sequencer: pre/post delay (seconds) per category ────────────────
const CO_TIMING: Record<string, { pre: number; post: number }> = {
  'Q1-4':   { pre: 5,  post: 10 },
  'Q5-8':   { pre: 10, post: 10 },
  'Q9-14':  { pre: 10, post: 10 },
  'Q15-20': { pre: 5,  post: 15 },
  'Q21-22': { pre: 10, post: 15 },
  'Q23-28': { pre: 10, post: 15 },
  'Q29-30': { pre: 10, post: 15 },
  'Q31-40': { pre: 10, post: 15 },
}

interface AudioPage {
  startQIdx: number
  audioUrl: string | null
  catKey: string
  preDelay: number
  postDelay: number
}

// ── CO category map (label + consigne per question-order range) ───────────────
const CO_CATEGORIES: Record<string, { label: string; consigne: string }> = {
  'Q1-4':   { label: 'Conversations avec dessins',          consigne: 'Vous allez entendre des conversations entre deux personnes. Indiquez à quel dessin correspond chaque conversation.' },
  'Q5-8':   { label: 'Annonces publiques',                  consigne: 'Écoutez l\'annonce et répondez à la question.' },
  'Q9-14':  { label: 'Messages sur répondeur téléphonique', consigne: 'Écoutez le message et répondez à la question.' },
  'Q15-20': { label: 'Micro-trottoirs',                     consigne: 'Écoutez attentivement.' },
  'Q21-22': { label: 'Chroniques audio',                    consigne: 'Écoutez la chronique et répondez à la question.' },
  'Q23-28': { label: 'Interviews',                          consigne: 'Écoutez l\'interview et répondez aux deux questions.' },
  'Q29-30': { label: 'Reportages RFI',                      consigne: 'Écoutez le reportage et répondez aux deux questions.' },
  'Q31-40': { label: 'Documents audio divers',              consigne: 'Écoutez le document audio et répondez à la question.' },
}

function getCOCategory(order: number): string {
  if (order >= 1  && order <= 4)  return 'Q1-4'
  if (order >= 5  && order <= 8)  return 'Q5-8'
  if (order >= 9  && order <= 14) return 'Q9-14'
  if (order >= 15 && order <= 20) return 'Q15-20'
  if (order >= 21 && order <= 22) return 'Q21-22'
  if (order >= 23 && order <= 28) return 'Q23-28'
  if (order >= 29 && order <= 30) return 'Q29-30'
  return 'Q31-40'
}

/** Q22, Q24, Q26, Q28, Q30 — second question of a 2-per-page pair */
function isCOPairedSecond(order: number): boolean {
  return order === 22 || order === 24 || order === 26 || order === 28 || order === 30
}
/** Q21, Q23, Q25, Q27, Q29 — first question of a 2-per-page pair */
function isCOPairedStart(order: number): boolean {
  return order === 21 || order === 23 || order === 25 || order === 27 || order === 29
}
/** Next page start index for CO (skips by 2 for paired pages) */
function getCONextIdx(qs: Question[], idx: number): number {
  const q = qs[idx]
  if (q && isCOPairedStart(q.questionOrder) && idx + 1 < qs.length) return idx + 2
  return idx + 1
}
/** Prev page start index for CO (skips back by 2 when coming after a paired page) */
function getCOPrevIdx(qs: Question[], idx: number): number {
  if (idx <= 0) return 0
  const prev = qs[idx - 1]
  if (prev && isCOPairedSecond(prev.questionOrder)) return idx - 2
  return idx - 1
}
/** Snap to the page-start index (for overview grid clicks on paired-second questions) */
function getCOSnapIdx(qs: Question[], idx: number): number {
  const q = qs[idx]
  if (q && isCOPairedSecond(q.questionOrder)) return idx - 1
  return idx
}

// ── Shared answer options renderer ────────────────────────────────────────────
function AnswerOptions({
  question,
  answers,
  setAnswers,
}: {
  question: Question
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, 'A' | 'B' | 'C' | 'D' | null>>>
}) {
  return (
    <div className="space-y-2">
      {optionLabels.map((opt) => {
        const selected = answers[question.id] === opt
        return (
          <button
            key={opt}
            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: opt }))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left text-sm transition-all ${
              selected
                ? 'border-tef-blue bg-tef-blue/5 font-semibold text-tef-blue'
                : 'border-gray-200 hover:border-tef-blue hover:bg-gray-50'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 font-bold text-xs flex-shrink-0 ${
              selected ? 'border-tef-blue bg-tef-blue text-white' : 'border-gray-300 text-gray-500'
            }`}>
              {opt}
            </span>
            {getOption(question, opt)}
          </button>
        )
      })}
    </div>
  )
}

// ── Category header pill ──────────────────────────────────────────────────────
function CategoryHeader({ category, subCategory }: { category?: string | null; subCategory?: string | null }) {
  const label = CE_CATEGORY_LABELS[category ?? ''] ?? category
  if (!label) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-tef-blue/10 text-tef-blue uppercase tracking-wide">
        {label}
      </span>
      {subCategory && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {subCategory}
        </span>
      )}
    </div>
  )
}

// ── Navigation buttons (rendered inside CE card) ─────────────────────────────
interface NavButtonsProps {
  canGoPrev: boolean
  isLast: boolean
  submitting: boolean
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  onSubmit: () => void
}
function NavigationButtons({ canGoPrev, isLast, submitting, onPrev, onNext, onSkip, onSubmit }: NavButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-gray-100">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Préc.
      </button>
      <button
        onClick={onSkip}
        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-colors"
      >
        Passer
      </button>
      {isLast ? (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-4 py-1.5 bg-tef-red text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Correction…' : 'Soumettre'}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-4 py-1.5 bg-tef-blue text-white text-xs font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
        >
          Suivant →
        </button>
      )}
    </div>
  )
}

// ── CE category-specific question renderer — 2-column card ───────────────────
function CEQuestion({
  question,
  questionNumber,
  answers,
  setAnswers,
  canGoPrev,
  isLast,
  submitting,
  onPrev,
  onNext,
  onSkip,
  onSubmit,
}: {
  question: Question
  questionNumber: number
  answers: AnswerMap
  setAnswers: React.Dispatch<React.SetStateAction<AnswerMap>>
  canGoPrev: boolean
  isLast: boolean
  submitting: boolean
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  onSubmit: () => void
}) {
  const cat = question.category
  const navProps = { canGoPrev, isLast, submitting, onPrev, onNext, onSkip, onSubmit }

  // ── Shared right column: number + question + (optional comment) + answers + nav ──
  const rightCol = (
    <div className="space-y-3">
      <p className="font-semibold text-gray-900 text-sm leading-snug">
        <span className="text-tef-blue font-black mr-1.5">{questionNumber}.</span>
        {question.question}
      </p>
      {question.comment && (
        <p className="text-xs text-gray-500 italic leading-relaxed">{question.comment}</p>
      )}
      <AnswerOptions question={question} answers={answers} setAnswers={setAnswers} />
      <NavigationButtons {...navProps} />
    </div>
  )

  // ── Card: optional consigne banner (full-width) → optional 2-col grid ────────
  // Category is already shown in the sticky sub-header — not repeated here.
  const wrap = (left: React.ReactNode | null, consigne?: string | null) => (
    <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden">
      {consigne && (
        <div className="w-full px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed">
          {consigne}
        </div>
      )}
      <div className={left ? 'grid grid-cols-1 md:grid-cols-[3fr_2fr] md:divide-x divide-gray-100' : ''}>
        {left && (
          <div className="px-4 pt-0 pb-4 overflow-y-auto max-h-[35vh] md:max-h-[65vh] border-b md:border-b-0 border-gray-100">
            {left}
          </div>
        )}
        <div className="px-4 pt-0 pb-4">
          {rightCol}
        </div>
      </div>
    </div>
  )

  // ── Q1-7 : Documents de la vie quotidienne — image ou texte centré en carte ──
  if (cat === 'Q1-7') {
    const left = (question.imageUrl || question.longText) ? (
      <div className="space-y-3 h-full flex flex-col justify-center">
        {question.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={question.imageUrl} alt="Document" className="max-w-full rounded-lg border border-gray-200" />
        ) : (
          /* Texte centré dans une carte style image */
          <div className="flex items-center justify-center min-h-[180px] bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed text-center whitespace-pre-wrap font-medium">
              {question.longText}
            </p>
          </div>
        )}
        {/* Si image ET texte : texte en complément sous l'image */}
        {question.imageUrl && question.longText && (
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-tef-blue">
            <p className="text-sm text-gray-700 leading-relaxed">{question.longText}</p>
          </div>
        )}
      </div>
    ) : null
    return wrap(left)
  }

  // ── Q8-17 : Phrases et textes lacunaires — text block left ──
  if (cat === 'Q8-17') {
    const left = (question.taskTitle || question.longText) ? (
      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-tef-blue space-y-2">
        {question.taskTitle && (
          <p className="text-sm font-bold text-gray-900 text-center">{question.taskTitle}</p>
        )}
        {question.longText && (
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{question.longText}</p>
        )}
      </div>
    ) : null
    return wrap(left)
  }

  // ── Q18-21 : Lecture rapide de textes — 2×2 grid left ──
  if (cat === 'Q18-21') {
    let texts: Array<{ title: string; content: string }> = []
    if (question.longText) {
      try { texts = JSON.parse(question.longText) } catch { /* not JSON */ }
    }
    const left = texts.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {texts.map((t, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-1">
            <p className="text-xs font-bold text-gray-900 text-center">{t.title}</p>
            <p className="text-xs text-gray-700 leading-relaxed text-justify">{t.content}</p>
          </div>
        ))}
      </div>
    ) : null
    return wrap(left)
  }

  // ── Q22 : Lecture rapide de graphiques — consigne full-width, image left ──
  if (cat === 'Q22') {
    const left = question.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={question.imageUrl} alt="Graphique" className="max-w-full rounded-lg border border-gray-200" />
    ) : null
    return wrap(left, question.consigne)
  }

  // ── Q23-32 : Documents administratifs — consigne + image + text left ──
  if (cat === 'Q23-32') {
    const left = (question.consigne || question.imageUrl || question.taskTitle || question.longText) ? (
      <div className="space-y-3">
        {question.consigne && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800 leading-relaxed border border-blue-200">
            {question.consigne}
          </div>
        )}
        {question.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={question.imageUrl} alt="Document" className="max-w-full rounded-lg border border-gray-200" />
        )}
        {(question.taskTitle || question.longText) && (
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300 space-y-2">
            {question.taskTitle && (
              <p className="text-sm font-bold text-gray-900 text-center">{question.taskTitle}</p>
            )}
            {question.longText && (
              <p className="text-sm text-gray-700 leading-relaxed text-justify">{question.longText}</p>
            )}
          </div>
        )}
      </div>
    ) : null
    return wrap(left)
  }

  // ── Q33-40 : Articles de presse — consigne + text left ──
  if (cat === 'Q33-40') {
    const left = (question.consigne || question.taskTitle || question.longText) ? (
      <div className="space-y-3">
        {question.consigne && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800 leading-relaxed border border-blue-200">
            {question.consigne}
          </div>
        )}
        {(question.taskTitle || question.longText) && (
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-400 space-y-2">
            {question.taskTitle && (
              <p className="text-sm font-bold text-gray-900 text-center">{question.taskTitle}</p>
            )}
            {question.longText && (
              <p className="text-sm text-gray-700 leading-relaxed text-justify">{question.longText}</p>
            )}
          </div>
        )}
      </div>
    ) : null
    return wrap(left)
  }

  // ── Fallback ──
  const left = (question.consigne || question.imageUrl || question.taskTitle || question.longText) ? (
    <div className="space-y-3">
      {question.consigne && (
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800 leading-relaxed border border-blue-200">
          {question.consigne}
        </div>
      )}
      {question.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={question.imageUrl} alt="Document visuel" className="max-w-full rounded-lg border border-gray-200" />
      )}
      {(question.taskTitle || question.longText) && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border-l-4 border-tef-blue space-y-1">
          {question.taskTitle && <p className="font-bold text-center text-gray-900">{question.taskTitle}</p>}
          {question.longText && <p className="text-justify">{question.longText}</p>}
        </div>
      )}
    </div>
  ) : null
  return wrap(left)
}

function calculateCecrlLevel(correct: number): string {
  if (correct <= 6) return 'A1'
  if (correct <= 15) return 'A2'
  if (correct <= 21) return 'B1'
  if (correct <= 28) return 'B2'
  if (correct <= 34) return 'C1'
  return 'C2'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const seriesId = params.id as string

  const [series, setSeries] = useState<Series | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [startTime] = useState<number>(Date.now())
  const [timerExpired, setTimerExpired] = useState(false)
  /** Tracks which audioUrls have been played — persists across question navigation */
  const [playedAudios, setPlayedAudios] = useState<Record<string, boolean>>({})
  /** CO audio sequencer — runs independently from view navigation */
  const [audioSeqIdx, setAudioSeqIdx] = useState(0)
  const [audioPhase, setAudioPhase] = useState<'idle' | 'pre' | 'playing' | 'post' | 'done'>('idle')
  const [audioCountdown, setAudioCountdown] = useState(0)
  const audioInitializedRef = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/connexion')
      return
    }
    fetch(`/api/series/${seriesId}/questions`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setQuestions(data as Question[])
        } else {
          setError('Impossible de charger les questions.')
        }
      })
      .catch(() => setError('Erreur lors du chargement.'))

    fetch(`/api/series/${seriesId}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (data && typeof data === 'object' && 'id' in data) {
          setSeries(data as Series)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [seriesId, session, status, router])

  const moduleCode = series?.module?.code ?? 'CE'
  const isCO = moduleCode === 'CO'

  /** Precomputed audio page sequence (one entry per visual page) */
  const audioPages = useMemo<AudioPage[]>(() => {
    if (series?.module?.code !== 'CO' || questions.length === 0) return []
    const pages: AudioPage[] = []
    let i = 0
    while (i < questions.length) {
      const q = questions[i]
      const catKey = getCOCategory(q.questionOrder)
      const timing = CO_TIMING[catKey] ?? { pre: 10, post: 10 }
      pages.push({ startQIdx: i, audioUrl: q.audioUrl ?? null, catKey, preDelay: timing.pre, postDelay: timing.post })
      if (isCOPairedStart(q.questionOrder) && i + 1 < questions.length) i += 2
      else i += 1
    }
    return pages
  }, [series, questions])

  /** Initialize audio sequencer once audio pages are ready */
  useEffect(() => {
    if (!isCO || audioPages.length === 0 || audioInitializedRef.current) return
    audioInitializedRef.current = true
    setAudioPhase('pre')
    setAudioCountdown(audioPages[0].preDelay)
  }, [isCO, audioPages])

  /** Tick pre/post countdown; transition phases and advance sequencer */
  useEffect(() => {
    if (!isCO || audioPhase === 'idle' || audioPhase === 'playing' || audioPhase === 'done') return
    if (audioCountdown > 0) {
      const t = setTimeout(() => setAudioCountdown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
    // Countdown reached 0 — transition
    if (audioPhase === 'pre') {
      const page = audioPages[audioSeqIdx]
      if (page?.audioUrl) {
        setAudioPhase('playing')
      } else {
        // No audio for this page — skip to post
        setAudioPhase('post')
        setAudioCountdown(page?.postDelay ?? 10)
      }
    } else if (audioPhase === 'post') {
      const next = audioSeqIdx + 1
      if (next >= audioPages.length) {
        setAudioPhase('done')
      } else {
        setAudioSeqIdx(next)
        setAudioPhase('pre')
        setAudioCountdown(audioPages[next].preDelay)
        setCurrentIndex(audioPages[next].startQIdx) // sync view to audio
      }
    }
  }, [isCO, audioPhase, audioCountdown, audioSeqIdx, audioPages])

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitted || submitting) return
      if (
        !autoSubmit &&
        !confirm('Soumettre votre copie ? Vous ne pourrez plus modifier vos réponses.')
      )
        return

      setSubmitting(true)
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const correct = questions.filter(
        (q) => answers[q.id] && answers[q.id] === q.correctAnswer
      ).length
      const score = correct
      const cecrlLevel = calculateCecrlLevel(score)

      const corrections: CorrectionItem[] = questions.map((q) => ({
        question: q,
        userAnswer: answers[q.id] ?? null,
        isCorrect: answers[q.id] === q.correctAnswer,
      }))

      setResult({ score, cecrlLevel, timeTaken, corrections })
      setSubmitted(true)

      if (series) {
        try {
          await fetch('/api/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              seriesId,
              moduleCode: series.module.code,
              answers,
              score,
              cecrlLevel,
              timeTaken,
            }),
          })
        } catch {
          // Non-blocking error
        }
      }
      setSubmitting(false)
    },
    [submitted, submitting, answers, questions, series, seriesId, startTime]
  )

  const handleTimeUp = useCallback(() => {
    if (!submitted && !timerExpired) {
      setTimerExpired(true)
      handleSubmit(true)
    }
  }, [submitted, timerExpired, handleSubmit])

  // Prevent accidental tab/window close during exam
  useEffect(() => {
    if (submitted) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [submitted])

  /** Called by AudioPlayer when audio finishes — transition to post-delay */
  const handleAudioPlayed = useCallback(() => {
    const page = audioPages[audioSeqIdx]
    if (page?.audioUrl) {
      setPlayedAudios((prev) => ({ ...prev, [page.audioUrl!]: true }))
    }
    setAudioPhase('post')
    setAudioCountdown(page?.postDelay ?? 10)
  }, [audioPages, audioSeqIdx])

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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Cette série ne contient pas encore de questions.</p>
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

  // ── Results view ────────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* Score card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              {series?.title ?? 'Résultats'}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-5xl font-black text-tef-blue">
                  {result.score}
                  <span className="text-2xl text-gray-400">/40</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Score</p>
              </div>
              <div className="w-px h-16 bg-gray-200 hidden sm:block" />
              <div className="text-center">
                <p className="text-5xl font-black text-tef-red">{result.cecrlLevel}</p>
                <p className="text-sm text-gray-500 mt-1">Niveau CECRL</p>
              </div>
              <div className="w-px h-16 bg-gray-200 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-gray-700">{formatTime(result.timeTaken)}</p>
                <p className="text-sm text-gray-500 mt-1">Temps utilisé</p>
              </div>
            </div>
          </div>

          {/* Correction détaillée */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Correction détaillée</h2>
            <div className="space-y-4">
              {result.corrections.map((item, idx) => (
                <div
                  key={item.question.id}
                  className={`bg-white rounded-xl border p-5 ${
                    item.isCorrect ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold flex-shrink-0 ${
                        item.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {item.question.longText && (
                        <p className="text-xs text-gray-500 italic mb-2 leading-relaxed line-clamp-3">
                          {item.question.longText}
                        </p>
                      )}
                      <p className="font-medium text-gray-900 text-sm mb-3">
                        {item.question.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {optionLabels.map((opt) => {
                          const isCorrectAnswer = opt === item.question.correctAnswer
                          const isUserAnswer = opt === item.userAnswer
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? 'bg-green-100 text-green-800 font-semibold'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              <span className="font-bold w-4 flex-shrink-0">{opt}.</span>
                              <span className="flex-1">{getOption(item.question, opt)}</span>
                              {isCorrectAnswer && <span>✓</span>}
                              {isUserAnswer && !isCorrectAnswer && <span>✗</span>}
                            </div>
                          )
                        })}
                      </div>
                      {!item.userAnswer && (
                        <p className="text-xs text-orange-600 mt-2 italic">Sans réponse</p>
                      )}
                      {item.question.explanation && (
                        <p className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded-lg leading-relaxed">
                          {item.question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz view ───────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const durationSeconds = isCO ? 40 * 60 : 60 * 60
  const answeredCount = Object.values(answers).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Timer — fixed top-0, h-[40px] */}
      {!submitted && (
        <Timer durationSeconds={durationSeconds} onTimeUp={handleTimeUp} />
      )}

      {/* Sticky sub-header — fixed at top-[40px]; progress bar flush at bottom */}
      {!submitted && (
        <div className="fixed top-[40px] left-0 right-0 z-40 bg-white border-b border-gray-200">
          {/* Info row — h-[30px] + font sizes +3 Tailwind units vs original */}
          <div className="h-[30px] max-w-[95%] mx-auto px-4 flex items-center justify-between gap-2">
            {/* Left: title + answered count */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base font-bold text-gray-800 truncate">
                {series?.title ?? 'Série'}
              </span>
              <span className="text-sm text-gray-400 whitespace-nowrap flex-shrink-0 hidden sm:inline">
                · {moduleCode} · {answeredCount}/{questions.length} rép.
              </span>
            </div>
            {/* Centre: category badge */}
            {currentQuestion && (() => {
              const label = isCO
                ? CO_CATEGORIES[getCOCategory(currentQuestion.questionOrder)]?.label
                : (CE_CATEGORY_LABELS[currentQuestion.category ?? ''] ?? currentQuestion.category)
              return label ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-tef-blue/10 text-tef-blue uppercase tracking-wide whitespace-nowrap flex-shrink-0">
                  {label}
                </span>
              ) : null
            })()}
            {/* Quit button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              ✕
            </button>
            {/* Right: Q number (range for CO paired pages) */}
            <span className="text-base font-black text-tef-blue whitespace-nowrap flex-shrink-0 ml-2">
              {isCO && currentQuestion && isCOPairedStart(currentQuestion.questionOrder)
                ? `Q${currentQuestion.questionOrder}-${questions[currentIndex + 1]?.questionOrder ?? currentQuestion.questionOrder + 1}`
                : `Q${currentQuestion?.questionOrder ?? currentIndex + 1}`}
              <span className="text-gray-300 font-normal text-sm">/{questions.length}</span>
            </span>
          </div>
          {/* Progress bar — no gap: flush at bottom of sub-header, full viewport width */}
          <div className="w-full h-[3px] bg-gray-200">
            <div
              className="bg-tef-blue h-[3px] transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content — 73px (fixed bars) minus dashboard navbar h-14 (3.5rem) = flush below sub-header */}
      <div className="max-w-[95%] mx-auto px-4 pt-[calc(73px_-_3.5rem)] pb-8 space-y-4">

        {/* CO audio sequencer banner — stays mounted through navigation, drives audio independently */}
        {isCO && !submitted && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            {audioPhase === 'idle' && (
              <p className="text-xs text-gray-400 text-center italic">Chargement des documents audio…</p>
            )}
            {audioPhase === 'pre' && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-tef-blue flex items-center justify-center font-black text-tef-blue text-sm flex-shrink-0">
                  {audioCountdown}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-tef-blue">
                    Document audio en préparation… ({audioCountdown}s)
                  </p>
                  <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-tef-blue h-1 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, ((audioPages[audioSeqIdx]?.preDelay ?? 10) - audioCountdown) / (audioPages[audioSeqIdx]?.preDelay ?? 10) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {audioPhase === 'playing' && audioPages[audioSeqIdx]?.audioUrl && (
              <div>
                <p className="text-xs font-semibold text-tef-blue mb-1 uppercase tracking-wide">
                  Document audio
                </p>
                <p className="text-xs text-gray-500 mb-2 italic">
                  Écoutez attentivement — cet audio ne peut être joué qu&apos;une seule fois.
                </p>
                <AudioPlayer
                  key={audioSeqIdx}
                  src={audioPages[audioSeqIdx].audioUrl!}
                  label="Lancer l'audio"
                  autoPlay
                  initialPlayed={playedAudios[audioPages[audioSeqIdx].audioUrl!] ?? false}
                  onPlayed={handleAudioPlayed}
                />
              </div>
            )}
            {audioPhase === 'post' && (
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">⏭</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-700">
                    Prochaine question dans{' '}
                    <span className="font-black text-tef-blue">{audioCountdown}s</span>
                  </p>
                  <div className="mt-1 w-full bg-blue-200 rounded-full h-1">
                    <div
                      className="bg-tef-blue h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${(audioCountdown / (audioPages[audioSeqIdx]?.postDelay ?? 10)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {audioPhase === 'done' && (
              <p className="text-xs text-gray-500 text-center py-0.5">
                ✓ Tous les documents audio ont été lus — répondez aux questions restantes puis soumettez.
              </p>
            )}
          </div>
        )}

        {/* Question card — CE: 2-col card with nav inside; CO: 2-col card (audio managed by sequencer above) */}
        {isCO ? (() => {
          // ── CO layout: consigne banner + 2-col card; Q21-22, Q23-28, Q29-30 are paired pages ──
          const firstQ     = currentQuestion
          const catKey     = getCOCategory(firstQ.questionOrder)
          const catInfo    = CO_CATEGORIES[catKey]
          const secondQ    = isCOPairedStart(firstQ.questionOrder) && currentIndex + 1 < questions.length
                               ? questions[currentIndex + 1] : null
          const nextIdx    = getCONextIdx(questions, currentIndex)
          const prevIdx    = getCOPrevIdx(questions, currentIndex)
          const isLastPage = nextIdx >= questions.length

          // Nav buttons only change the view — audio sequencer is independent
          const navBlock = (
            <NavigationButtons
              canGoPrev={currentIndex > 0}
              isLast={isLastPage}
              submitting={submitting}
              onPrev={() => setCurrentIndex(prevIdx)}
              onNext={() => setCurrentIndex(nextIdx)}
              onSkip={() => {
                setAnswers((prev) => {
                  const updated = { ...prev }
                  if (secondQ) { updated[firstQ.id] = null; updated[secondQ.id] = null }
                  else { updated[firstQ.id] = null }
                  return updated
                })
                if (!isLastPage) setCurrentIndex(nextIdx)
              }}
              onSubmit={() => handleSubmit(false)}
            />
          )

          return (
            <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden">
              {/* Consigne — full width, derived from CO category */}
              {catInfo?.consigne && (
                <div className="w-full px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed">
                  {catInfo.consigne}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] md:divide-x divide-gray-100">
                {secondQ ? (
                  <>
                    {/* Paired page (Q21-22 / Q23-28 / Q29-30): left col has firstQ, right col has secondQ */}
                    <div className="px-4 pt-0 pb-4 overflow-y-auto max-h-[35vh] md:max-h-[65vh] border-b md:border-b-0 border-gray-100 space-y-3">
                      {firstQ.longText && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border-l-4 border-tef-blue">
                          {firstQ.longText}
                        </div>
                      )}
                      <div className="space-y-3">
                        {firstQ.description && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 leading-relaxed">
                            <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Question posée</span>
                            {firstQ.description}
                          </div>
                        )}
                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                          <span className="text-tef-blue font-black mr-1.5">{firstQ.questionOrder}.</span>
                          {firstQ.question}
                        </p>
                        <AnswerOptions question={firstQ} answers={answers} setAnswers={setAnswers} />
                      </div>
                    </div>
                    <div className="px-4 pt-0 pb-4 space-y-3">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        <span className="text-tef-blue font-black mr-1.5">{secondQ.questionOrder}.</span>
                        {secondQ.question}
                      </p>
                      <AnswerOptions question={secondQ} answers={answers} setAnswers={setAnswers} />
                      {navBlock}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Single question page */}
                    <div className="px-4 pt-0 pb-4 overflow-y-auto max-h-[35vh] md:max-h-[65vh] border-b md:border-b-0 border-gray-100 space-y-3">
                      {firstQ.longText && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border-l-4 border-tef-blue">
                          {firstQ.longText}
                        </div>
                      )}
                      {firstQ.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstQ.imageUrl} alt="Document visuel" className="max-w-full rounded-lg border border-gray-200" />
                      )}
                    </div>
                    <div className="px-4 pt-0 pb-4 space-y-3">
                      {firstQ.description && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Question posée</span>
                          {firstQ.description}
                        </div>
                      )}
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        <span className="text-tef-blue font-black mr-1.5">{firstQ.questionOrder}.</span>
                        {firstQ.question}
                      </p>
                      <AnswerOptions question={firstQ} answers={answers} setAnswers={setAnswers} />
                      {navBlock}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })() : (
          // ── CE layout: 2-col card with nav inside ──
          <CEQuestion
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            answers={answers}
            setAnswers={setAnswers}
            canGoPrev={currentIndex > 0}
            isLast={currentIndex === questions.length - 1}
            submitting={submitting}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => i + 1)}
            onSkip={() => {
              setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }))
              if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1)
            }}
            onSubmit={() => handleSubmit(false)}
          />
        )}

        {/* Question overview grid */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const snapIdx = isCO ? getCOSnapIdx(questions, i) : i
            const isActive = snapIdx === currentIndex
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(snapIdx)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-tef-blue text-white ring-2 ring-tef-blue ring-offset-1'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white border border-gray-200 text-gray-400 hover:border-tef-blue'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {/* Submit button at bottom */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-6 py-3 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Correction en cours…' : 'Terminer et soumettre'}
          </button>
        </div>
      </div>

      {/* Exit confirmation modal */}
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
    </div>
  )
}
