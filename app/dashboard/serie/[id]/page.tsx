'use client'
import { useEffect, useState, useCallback } from 'react'
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
  longText?: string | null
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
  const [startTime] = useState<number>(Date.now())
  const [timerExpired, setTimerExpired] = useState(false)
  /** Tracks which audioUrls have been played — persists across question navigation */
  const [playedAudios, setPlayedAudios] = useState<Record<string, boolean>>({})
  /** CO auto-advance countdown in seconds (null = inactive) */
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null)

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

  /** Tick the auto-advance countdown down every second; advance when it hits 0 */
  useEffect(() => {
    if (autoAdvanceCountdown === null) return
    if (autoAdvanceCountdown === 0) {
      // Only started when not on last question, so advancing is always valid
      setCurrentIndex((i) => i + 1)
      setAutoAdvanceCountdown(null)
      return
    }
    const timer = setTimeout(() => {
      setAutoAdvanceCountdown((c) => (c !== null ? c - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [autoAdvanceCountdown])

  /** Cancel auto-advance (called on any manual navigation) */
  const cancelAutoAdvance = () => setAutoAdvanceCountdown(null)

  const moduleCode = series?.module?.code ?? 'CE'
  const isCO = moduleCode === 'CO'

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
      {/* Timer */}
      {!submitted && (
        <Timer durationSeconds={durationSeconds} onTimeUp={handleTimeUp} />
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{series?.title ?? 'Série'}</h1>
            <p className="text-xs text-gray-500">
              {moduleCode} — {answeredCount}/{questions.length} réponse{answeredCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-500">
            Q{currentIndex + 1}/{questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-tef-blue h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

          {isCO ? (
            // ── CO layout: context → audio (autoplay) → image → question → options ──
            <>
              {/* 1. Document / context */}
              {currentQuestion.longText && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border-l-4 border-tef-blue">
                  <p className="text-xs font-semibold text-tef-blue mb-2 uppercase tracking-wide">
                    Document / Contexte
                  </p>
                  {currentQuestion.longText}
                </div>
              )}

              {/* 2. Audio — autoplays on first encounter of this audioUrl */}
              {currentQuestion.audioUrl && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-tef-blue mb-1 uppercase tracking-wide">
                    Document audio
                  </p>
                  <p className="text-xs text-gray-500 mb-2 italic">
                    Écoutez attentivement — cet audio ne peut être joué qu&apos;une seule fois.
                  </p>
                  <AudioPlayer
                    key={currentQuestion.audioUrl}
                    src={currentQuestion.audioUrl}
                    label="Lancer l'audio"
                    autoPlay={!playedAudios[currentQuestion.audioUrl]}
                    initialPlayed={playedAudios[currentQuestion.audioUrl] ?? false}
                    onPlayed={() => {
                      setPlayedAudios((prev) => ({
                        ...prev,
                        [currentQuestion.audioUrl!]: true,
                      }))
                      // Start 10s auto-advance after audio ends (not on last question)
                      if (currentIndex < questions.length - 1) {
                        setAutoAdvanceCountdown(10)
                      }
                    }}
                  />
                </div>
              )}

              {/* Auto-advance countdown banner */}
              {autoAdvanceCountdown !== null && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-xl">⏭</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-700">
                      Question suivante dans{' '}
                      <span className="font-black text-tef-blue text-base">
                        {autoAdvanceCountdown}s
                      </span>
                    </p>
                    <div className="mt-1.5 w-full bg-blue-200 rounded-full h-1.5">
                      <div
                        className="bg-tef-blue h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(autoAdvanceCountdown / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={cancelAutoAdvance}
                    className="text-xs text-blue-500 hover:text-blue-700 font-semibold underline shrink-0"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* 3. Image */}
              {currentQuestion.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQuestion.imageUrl}
                  alt="Document visuel"
                  className="max-w-full rounded-lg border border-gray-200"
                />
              )}

              {/* 4. Question */}
              {currentQuestion.category && (
                <p className="text-xs text-gray-400 italic">{currentQuestion.category}</p>
              )}
              <p className="font-semibold text-gray-900">{currentQuestion.question}</p>

              {/* 5. Options */}
              <div className="space-y-2">
                {optionLabels.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left text-sm transition-all ${
                        selected
                          ? 'border-tef-blue bg-tef-blue/5 font-semibold text-tef-blue'
                          : 'border-gray-200 hover:border-tef-blue hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 font-bold text-xs flex-shrink-0 ${
                          selected
                            ? 'border-tef-blue bg-tef-blue text-white'
                            : 'border-gray-300 text-gray-500'
                        }`}
                      >
                        {opt}
                      </span>
                      {getOption(currentQuestion, opt)}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            // ── CE layout: context → image → question → options ──
            <>
              {currentQuestion.longText && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border-l-4 border-tef-blue">
                  {currentQuestion.longText}
                </div>
              )}

              {currentQuestion.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQuestion.imageUrl}
                  alt="Document visuel"
                  className="max-w-full rounded-lg border border-gray-200"
                />
              )}

              {currentQuestion.category && (
                <p className="text-xs text-gray-400 italic">{currentQuestion.category}</p>
              )}

              <p className="font-semibold text-gray-900">{currentQuestion.question}</p>

              <div className="space-y-2">
                {optionLabels.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left text-sm transition-all ${
                        selected
                          ? 'border-tef-blue bg-tef-blue/5 font-semibold text-tef-blue'
                          : 'border-gray-200 hover:border-tef-blue hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 font-bold text-xs flex-shrink-0 ${
                          selected
                            ? 'border-tef-blue bg-tef-blue text-white'
                            : 'border-gray-300 text-gray-500'
                        }`}
                      >
                        {opt}
                      </span>
                      {getOption(currentQuestion, opt)}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => { cancelAutoAdvance(); setCurrentIndex((i) => Math.max(0, i - 1)) }}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>

          <button
            onClick={() => {
              cancelAutoAdvance()
              setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }))
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((i) => i + 1)
              }
            }}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Passer
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => { cancelAutoAdvance(); setCurrentIndex((i) => i + 1) }}
              className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-5 py-2 bg-tef-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Correction…' : 'Soumettre'}
            </button>
          )}
        </div>

        {/* Question overview grid */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => { cancelAutoAdvance(); setCurrentIndex(i) }}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                i === currentIndex
                  ? 'bg-tef-blue text-white ring-2 ring-tef-blue ring-offset-1'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white border border-gray-200 text-gray-400 hover:border-tef-blue'
              }`}
            >
              {i + 1}
            </button>
          ))}
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
    </div>
  )
}
