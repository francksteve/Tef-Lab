'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Timer from '@/components/ui/Timer'
import WordCounter, { countWords } from '@/components/ui/WordCounter'

interface Module {
  code: string
  name: string
}

interface Series {
  id: string
  title: string
  module: Module
}

interface EEQuestion {
  id: string
  category: string | null
  taskTitle: string | null
  longText: string | null
  question: string
}

interface TaskScore {
  wordCount: number
  score: number
  cecrlLevel: string
  feedback: string
  strengths: string[]
  improvements: string[]
  annotatedText: string | null
  improvedText?: string | null
}

interface EEResult {
  task1: TaskScore
  task2: TaskScore
  globalCecrlLevel: string
  globalScore: number
}

type PagePhase = 'task1' | 'task2' | 'submitting' | 'results'

const TASK1_CONSIGNE =
  'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.'
const TASK2_CONSIGNE =
  'Écrivez une lettre au journal (200 mots minimum) avec au moins 3 arguments.'

const TASK1_MIN = 80
const TASK2_MIN = 200

const CECRL_GRADIENT: Record<string, string> = {
  A1: 'from-red-500 to-red-600',
  A2: 'from-orange-500 to-orange-600',
  B1: 'from-yellow-500 to-amber-500',
  B2: 'from-green-500 to-emerald-500',
  C1: 'from-blue-600 to-tef-blue',
  C2: 'from-purple-600 to-purple-700',
}

/* ─── Progress stepper ─── */
function ProgressStepper({ phase }: { phase: PagePhase }) {
  const steps = [
    { key: 'task1', label: 'Tâche 1', sub: '25 min' },
    { key: 'task2', label: 'Tâche 2', sub: '35 min' },
    { key: 'results', label: 'Résultats', sub: 'IA' },
  ]
  const activeIdx = phase === 'task1' ? 0 : phase === 'task2' ? 1 : 2
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                done ? 'bg-emerald-500 border-emerald-500 text-white' :
                active ? 'bg-tef-blue border-tef-blue text-white shadow-md' :
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <div className={`text-[10px] font-semibold mt-0.5 ${active ? 'text-tef-blue' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 mx-1 ${i < activeIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function EEPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const seriesId = params.id as string

  const [series, setSeries] = useState<Series | null>(null)
  const [task1Q, setTask1Q] = useState<EEQuestion | null>(null)
  const [task2Q, setTask2Q] = useState<EEQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [phase, setPhase] = useState<PagePhase>('task1')
  const [task1Text, setTask1Text] = useState('')
  const [task2Text, setTask2Text] = useState('')
  const [result, setResult] = useState<EEResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/connexion'); return }
    Promise.all([
      fetch(`/api/series/${seriesId}`).then((r) => r.json()),
      fetch(`/api/series/${seriesId}/questions`).then((r) => r.json()),
    ])
      .then(([seriesData, questionsData]: [unknown, unknown]) => {
        if (seriesData && typeof seriesData === 'object' && 'id' in seriesData) {
          setSeries(seriesData as Series)
        } else {
          setError('Série introuvable.')
        }
        if (Array.isArray(questionsData)) {
          const qs = questionsData as EEQuestion[]
          setTask1Q(qs.find((q) => q.category === 'SECTION_A') ?? null)
          setTask2Q(qs.find((q) => q.category === 'SECTION_B') ?? null)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement.')
        setLoading(false)
      })
  }, [seriesId, session, status, router])

  useEffect(() => {
    if (phase === 'results' || phase === 'submitting') return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  const handleTask1TimeUp = useCallback(() => { setPhase('task2') }, [])
  const handleTask2TimeUp = useCallback(() => {
    handleFinalSubmit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task1Text, task2Text])

  const handleFinalSubmit = useCallback(async () => {
    if (phase === 'submitting' || phase === 'results') return
    setPhase('submitting')
    setAiError(null)
    try {
      const scoringRes = await fetch('/api/scoring/ee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task1Text, task2Text, seriesId }),
      })
      if (scoringRes.ok) {
        const scoringData = (await scoringRes.json()) as EEResult
        setResult(scoringData)
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seriesId, moduleCode: 'EE', answers: {},
            writtenTask1: task1Text, writtenTask2: task2Text,
            aiScore: scoringData.globalScore, cecrlLevel: scoringData.globalCecrlLevel,
          }),
        }).catch(() => {})
      } else {
        setAiError('La correction par IA a échoué. Veuillez réessayer.')
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seriesId, moduleCode: 'EE', answers: {}, writtenTask1: task1Text, writtenTask2: task2Text }),
        }).catch(() => {})
      }
    } catch {
      setAiError('Erreur lors de la soumission. Vérifiez votre connexion.')
    } finally {
      setPhase('results')
    }
  }, [phase, task1Text, task2Text, seriesId])

  // ── Loading ──
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

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center max-w-sm w-full space-y-4">
          <div className="text-4xl">❌</div>
          <p className="font-bold text-gray-800">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  // ── Submitting ──
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full space-y-5">
          <div className="w-16 h-16 bg-tef-blue/10 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="font-extrabold text-gray-800 text-lg">Correction en cours…</p>
            <p className="text-gray-400 text-sm mt-1">L&apos;IA analyse vos deux tâches.</p>
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

  // ── Results ──
  if (phase === 'results') {
    const cecrlGrad = result ? (CECRL_GRADIENT[result.globalCecrlLevel] ?? 'from-tef-blue to-blue-700') : 'from-gray-400 to-gray-500'
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Results hero */}
        <div className={`bg-gradient-to-br ${cecrlGrad} text-white`}>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Expression Écrite</p>
                <h1 className="text-2xl font-extrabold">{series?.title}</h1>
                <p className="text-white/70 text-sm mt-1">Correction par intelligence artificielle</p>
              </div>
              {result && (
                <div className="text-center bg-white/15 rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-5xl font-black text-white leading-none">
                    {result.globalScore}<span className="text-xl text-white/60">/100</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">{result.globalCecrlLevel}</div>
                  <div className="text-white/60 text-xs mt-0.5">Score global · Niveau CECRL</div>
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

          {result ? (
            <>
              {/* Task score summary bar */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: 1, label: "Suite d'article", score: result.task1 },
                  { num: 2, label: 'Lettre au journal', score: result.task2 },
                ].map(({ num, label, score }) => {
                  const grad = CECRL_GRADIENT[score.cecrlLevel] ?? 'from-gray-400 to-gray-500'
                  return (
                    <div key={num} className={`bg-gradient-to-br ${grad} rounded-xl p-4 text-white`}>
                      <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Tâche {num}</p>
                      <p className="font-bold text-sm mt-0.5 leading-tight">{label}</p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-black leading-none">{score.score}</span>
                        <span className="text-white/60 text-sm mb-0.5">/100 · {score.cecrlLevel}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <TaskResultCard taskNumber={1} label="Suite d'article" score={result.task1} />
              <TaskResultCard taskNumber={2} label="Lettre au journal" score={result.task2} />
            </>
          ) : !aiError ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              <p>Vos réponses ont été enregistrées.</p>
            </div>
          ) : null}

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

  // ── Exit confirm modal ──
  const ExitModal = () => !showExitConfirm ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">⚠️</div>
          <h2 className="text-lg font-extrabold text-gray-900">Quitter le test ?</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Vos réponses ne seront pas enregistrées et votre progression sera perdue.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
            Quitter sans soumettre
          </button>
          <button onClick={() => setShowExitConfirm(false)}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Continuer le test
          </button>
        </div>
      </div>
    </div>
  )

  // ── Task 1 ──
  if (phase === 'task1') {
    const task1Count = countWords(task1Text)
    const task1OK = task1Count >= TASK1_MIN
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Timer durationSeconds={25 * 60} onTimeUp={handleTask1TimeUp} />
          <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 space-y-5">

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tef-blue rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">✍️</div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">{series?.title}</p>
                  <p className="text-gray-400 text-xs">Expression Écrite · Tâche 1 sur 2</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ProgressStepper phase={phase} />
                <button onClick={() => setShowExitConfirm(true)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100">
                  ✕
                </button>
              </div>
            </div>

            {/* Task badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tef-blue text-white text-xs font-bold rounded-full shadow-sm">
                📝 Tâche 1 — Suite d&apos;article
              </span>
              <span className="text-xs text-gray-400">25 minutes · 80 mots minimum</span>
            </div>

            {/* Document support */}
            {(task1Q?.taskTitle || task1Q?.longText) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📄 Document support — Début de l'article</p>
                </div>
                <div className="p-4 space-y-2">
                  {task1Q?.taskTitle && <p className="font-bold text-gray-900 text-base">{task1Q.taskTitle}</p>}
                  {task1Q?.longText && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task1Q.longText}</p>}
                </div>
              </div>
            )}

            {/* Consigne */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-3">
              <span className="text-blue-500 text-lg flex-shrink-0">💡</span>
              <p className="text-sm text-blue-800 leading-relaxed">{task1Q?.question ?? TASK1_CONSIGNE}</p>
            </div>

            {/* Textarea */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">✏️ Votre texte</p>
                <WordCounter text={task1Text} minimum={TASK1_MIN} />
              </div>
              <textarea
                value={task1Text}
                onChange={(e) => setTask1Text(e.target.value)}
                rows={12}
                placeholder="Rédigez ici la suite de l'article…"
                className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4">
              <p className={`text-xs font-medium transition-colors ${task1OK ? 'text-emerald-600' : 'text-red-500'}`}>
                {task1Count}/{TASK1_MIN} mots minimum
              </p>
              <button
                onClick={() => setPhase('task2')}
                disabled={!task1OK}
                className="px-7 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Passer à la Tâche 2 →
              </button>
            </div>
          </div>
        </div>
        <ExitModal />
      </>
    )
  }

  // ── Task 2 ──
  const task2Count = countWords(task2Text)
  const task2OK = task2Count >= TASK2_MIN

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Timer durationSeconds={35 * 60} onTimeUp={handleTask2TimeUp} />
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 space-y-5">

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tef-red rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">✉️</div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">{series?.title}</p>
                <p className="text-gray-400 text-xs">Expression Écrite · Tâche 2 sur 2</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProgressStepper phase={phase} />
              <button onClick={() => setShowExitConfirm(true)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100">
                ✕
              </button>
            </div>
          </div>

          {/* Task badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tef-red text-white text-xs font-bold rounded-full shadow-sm">
              ✉️ Tâche 2 — Lettre au journal
            </span>
            <span className="text-xs text-gray-400">35 minutes · 200 mots minimum</span>
          </div>

          {/* Document support */}
          {task2Q?.longText && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📰 Extrait de journal</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-gray-300 pl-4">
                  {task2Q.longText}
                </p>
              </div>
            </div>
          )}

          {/* Consigne */}
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex gap-3">
            <span className="text-red-500 text-lg flex-shrink-0">💡</span>
            <p className="text-sm text-red-800 leading-relaxed">{task2Q?.question ?? TASK2_CONSIGNE}</p>
          </div>

          {/* Textarea */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">✏️ Votre lettre</p>
              <WordCounter text={task2Text} minimum={TASK2_MIN} />
            </div>
            <textarea
              value={task2Text}
              onChange={(e) => setTask2Text(e.target.value)}
              rows={14}
              placeholder="Rédigez ici votre lettre au journal…"
              className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setPhase('task1')}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Tâche 1
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleFinalSubmit}
                disabled={!task2OK}
                className="px-7 py-3 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                🤖 Soumettre pour correction IA
              </button>
              {!task2OK && (
                <p className="text-xs text-red-500 font-medium">{task2Count}/{TASK2_MIN} mots minimum</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ExitModal />
    </>
  )
}

const NEXT_CECRL: Record<string, string> = {
  A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2',
}

function renderAnnotatedText(text: string): React.ReactNode {
  const parts = text.split(/(<del>[\s\S]*?<\/del>|<ins>[\s\S]*?<\/ins>)/g)
  return parts.map((part, i) => {
    if (part.startsWith('<del>')) {
      const content = part.replace(/^<del>/, '').replace(/<\/del>$/, '')
      return <span key={i} className="line-through text-red-600 bg-red-50 px-0.5 rounded">{content}</span>
    }
    if (part.startsWith('<ins>')) {
      const content = part.replace(/^<ins>/, '').replace(/<\/ins>$/, '')
      return <span key={i} className="text-green-700 bg-green-50 px-0.5 rounded underline decoration-green-600">{content}</span>
    }
    return <span key={i}>{part}</span>
  })
}

function renderImprovedText(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, lineIdx) => {
    if (line.trim() === '') return <div key={lineIdx} className="h-2" />
    const isHeader = /^[0-9]e[r]?\w*\s+paragraphe\s*\(/i.test(line.trim())
    if (isHeader) return <p key={lineIdx} className="font-bold text-indigo-700 mt-3 mb-0.5 text-sm">{line}</p>
    const parts = line.split(/(\[[^\]]+\])/g)
    return (
      <p key={lineIdx} className="text-sm text-gray-800 leading-relaxed">
        {parts.map((part, i) =>
          /^\[.+\]$/.test(part) ? (
            <span key={i} className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1 rounded mx-0.5 leading-none py-0.5 align-middle">
              {part}
            </span>
          ) : <span key={i}>{part}</span>
        )}
      </p>
    )
  })
}

function TaskResultCard({ taskNumber, label, score }: { taskNumber: number; label: string; score: TaskScore }) {
  const [showImproved, setShowImproved] = useState(false)
  const [showImprovedFull, setShowImprovedFull] = useState(false)
  const nextLevel = NEXT_CECRL[score.cecrlLevel]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-tef-blue/10 flex items-center justify-center text-base">
            {taskNumber === 1 ? '📝' : '✉️'}
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">Tâche {taskNumber} — {label}</p>
            <p className="text-xs text-gray-400">{score.wordCount} mots rédigés</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-tef-blue">{score.score}<span className="text-base text-gray-300">/100</span></span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
            CECRL_GRADIENT[score.cecrlLevel]
              ? `bg-gradient-to-r ${CECRL_GRADIENT[score.cecrlLevel]} text-white`
              : 'bg-tef-blue/10 text-tef-blue'
          }`}>
            {score.cecrlLevel}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Feedback */}
        <p className="text-sm text-gray-700 leading-relaxed">{score.feedback}</p>

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-4">
          {score.strengths.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs font-extrabold text-emerald-700 mb-2 flex items-center gap-1">
                <span>✅</span> Points forts
              </p>
              <ul className="space-y-1.5">
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
              <ul className="space-y-1.5">
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

        {/* Annotated corrections */}
        {score.annotatedText && nextLevel && (
          <div className="border-t border-gray-50 pt-3">
            <button onClick={() => setShowImproved((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
              <span>✏️</span>
              {showImproved ? 'Masquer les corrections' : 'Voir les corrections de ton texte'}
              <span className={`transition-transform duration-200 ${showImproved ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {showImproved && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-800 font-semibold pb-2 border-b border-amber-200">
                  <span>Corrections pour atteindre le niveau {nextLevel} :</span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="line-through text-red-600 bg-red-50 px-1 rounded">erreur</span>
                    <span className="text-gray-500">= à corriger</span>
                  </span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="text-green-700 bg-green-50 px-1 rounded underline decoration-green-600">correction</span>
                    <span className="text-gray-500">= texte corrigé</span>
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{renderAnnotatedText(score.annotatedText)}</p>
              </div>
            )}
          </div>
        )}

        {/* Improved text (Task 1 only) */}
        {taskNumber === 1 && score.improvedText && nextLevel && (
          <div className="border-t border-gray-50 pt-3">
            <button onClick={() => setShowImprovedFull((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              <span>📝</span>
              {showImprovedFull ? 'Masquer la production corrigée' : `Production corrigée — structure 4 paragraphes (niveau ${nextLevel})`}
              <span className={`transition-transform duration-200 ${showImprovedFull ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {showImprovedFull && (
              <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-800 font-semibold pb-2 border-b border-indigo-200 mb-3">
                  <span>Réécriture au niveau {nextLevel} :</span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="text-[10px] font-semibold text-indigo-600 bg-white border border-indigo-200 px-1 rounded">[procédé]</span>
                    <span className="text-gray-500">= technique utilisée</span>
                  </span>
                </div>
                <div className="space-y-0.5">{renderImprovedText(score.improvedText)}</div>
              </div>
            )}
          </div>
        )}

        {score.cecrlLevel === 'C2' && (
          <div className="border-t border-gray-50 pt-3">
            <p className="text-sm text-gray-400 italic">🏆 Niveau maximum C2 atteint — félicitations !</p>
          </div>
        )}
      </div>
    </div>
  )
}
