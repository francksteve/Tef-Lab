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
  score: number        // sur 225
  nclcLevel?: number   // 0â€“12
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
  globalNclcLevel?: number  // 0â€“12
  globalScore: number       // sur 450
}

type PagePhase = 'task1' | 'task2' | 'submitting' | 'results'

const TASK1_CONSIGNE =
  'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.'
const TASK2_CONSIGNE =
  'Ã‰crivez une lettre au journal (200 mots minimum) avec au moins 3 arguments.'

const TASK1_MIN = 80
const TASK2_MIN = 200

const CECRL_GRADIENT: Record<string, string> = {
  A1: 'from-tef-red to-red-700',
  A2: 'from-red-500 to-red-600',
  B1: 'from-blue-400 to-blue-500',
  B2: 'from-blue-600 to-blue-700',
  C1: 'from-tef-blue to-blue-800',
  C2: 'from-blue-900 to-[#001344]',
}

/* â”€â”€â”€ Scoring progressif (item 05) â”€â”€â”€ */
function ScoringScreen() {
  const [current, setCurrent] = useState(0)
  const steps = ['Lecture de vos productionsâ€¦', 'Ã‰valuation grammaticale et lexicaleâ€¦', 'GÃ©nÃ©ration des corrections personnalisÃ©esâ€¦']
  const delays = [3500, 6000]

  useEffect(() => {
    if (current >= steps.length - 1) return
    const t = setTimeout(() => setCurrent((s) => s + 1), delays[current] ?? 5000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full space-y-6">
        <div className="w-14 h-14 bg-tef-blue/10 rounded-2xl flex items-center justify-center mx-auto">
          <div className="w-7 h-7 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-extrabold text-gray-800 text-lg text-center">Correction en coursâ€¦</p>
        <div className="space-y-3">
          {steps.map((label, i) => {
            const done = i < current
            const active = i === current
            return (
              <div key={i} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${done ? 'text-tef-blue' : active ? 'text-gray-700' : 'text-gray-300'}`}>
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors ${done ? 'border-tef-blue bg-tef-blue text-white' : active ? 'border-tef-blue text-tef-blue' : 'border-gray-200 text-gray-300'}`}>
                  {done ? 'âœ“' : i + 1}
                </span>
                <span className={active ? 'font-semibold' : ''}>{label}</span>
                {active && <div className="w-3 h-3 border-2 border-tef-blue border-t-transparent rounded-full animate-spin ml-auto flex-shrink-0" />}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 text-center">Ã‰tape {current + 1}/{steps.length}</p>
      </div>
    </div>
  )
}

/* â”€â”€â”€ Progress stepper â”€â”€â”€ */
function ProgressStepper({ phase }: { phase: PagePhase }) {
  const steps = [
    { key: 'task1', label: 'TÃ¢che 1' },
    { key: 'task2', label: 'TÃ¢che 2' },
    { key: 'results', label: 'RÃ©sultats' },
  ]
  const activeIdx = phase === 'task1' ? 0 : phase === 'task2' ? 1 : 2
  return (
    <div className="flex items-center flex-shrink-0">
      {steps.map((step, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 transition-all ${
                done ? 'bg-tef-blue border-tef-blue text-white' :
                active ? 'bg-tef-blue border-tef-blue text-white' :
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? 'âœ“' : i + 1}
              </div>
              <span className={`text-[9px] font-semibold mt-0.5 leading-none whitespace-nowrap ${
                active ? 'text-tef-blue' : done ? 'text-tef-blue/60' : 'text-gray-300'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mb-3 mx-1 ${i < activeIdx ? 'bg-tef-blue/40' : 'bg-gray-200'}`} />
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
  const [canRetry, setCanRetry] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [aiQuota, setAiQuota] = useState<{ used: number; limit: number; remaining: number; isMonthly?: boolean } | null>(null)
  const [draftBanner, setDraftBanner] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/connexion'); return }
    Promise.all([
      fetch(`/api/series/${seriesId}`).then((r) => r.json()),
      fetch(`/api/series/${seriesId}/questions`).then((r) => r.json()),
      fetch('/api/ai-usage').then((r) => r.json()),
    ])
      .then(([seriesData, questionsData, quotaData]: [unknown, unknown, unknown]) => {
        if (quotaData && typeof quotaData === 'object' && 'remaining' in quotaData) {
          setAiQuota(quotaData as { used: number; limit: number; remaining: number })
        }
        if (seriesData && typeof seriesData === 'object' && 'id' in seriesData) {
          setSeries(seriesData as Series)
        } else {
          setError('SÃ©rie introuvable.')
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

  // item 02 â€” restaurer le brouillon au chargement
  useEffect(() => {
    if (loading || !seriesId) return
    try {
      const saved = localStorage.getItem(`ee-draft-${seriesId}`)
      if (saved) {
        const { t1, t2 } = JSON.parse(saved) as { t1?: string; t2?: string }
        if (t1) { setTask1Text(t1); setDraftBanner(true) }
        if (t2) setTask2Text(t2)
      }
    } catch { /* ignore */ }
  }, [loading, seriesId])

  // item 02 â€” sauvegarde automatique toutes les 30s
  useEffect(() => {
    if (phase === 'submitting' || phase === 'results') return
    const id = setInterval(() => {
      try { localStorage.setItem(`ee-draft-${seriesId}`, JSON.stringify({ t1: task1Text, t2: task2Text })) } catch { /* ignore */ }
    }, 30_000)
    return () => clearInterval(id)
  }, [seriesId, task1Text, task2Text, phase])

  const handleTask1TimeUp = useCallback(() => { setPhase('task2') }, [])
  const handleTask2TimeUp = useCallback(() => {
    handleFinalSubmit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task1Text, task2Text])

  const saveAttempt = useCallback((extra: Record<string, unknown> = {}) =>
    fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesId, moduleCode: 'EE', answers: {},
        writtenTask1: task1Text, writtenTask2: task2Text,
        ...extra,
      }),
    }).catch(() => {}),
  [seriesId, task1Text, task2Text])

  const handleFinalSubmit = useCallback(async () => {
    if (phase === 'submitting' || phase === 'results') return
    try { localStorage.removeItem(`ee-draft-${seriesId}`) } catch { /* ignore */ }
    setPhase('submitting')
    setAiError(null)
    setCanRetry(false)
    try {
      const scoringRes = await fetch('/api/scoring/ee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task1Text, task2Text, seriesId }),
      })
      if (scoringRes.ok) {
        const scoringData = (await scoringRes.json()) as EEResult
        setResult(scoringData)
        await saveAttempt({ aiScore: scoringData.globalScore, cecrlLevel: scoringData.globalCecrlLevel })
      } else {
        const isQuota = scoringRes.status === 403
        setAiError(
          isQuota
            ? 'Vous avez atteint votre quota de corrections IA pour aujourd\'hui. Vos textes ont Ã©tÃ© enregistrÃ©s â€” revenez demain ou passez Ã  un pack supÃ©rieur.'
            : 'La correction par IA a Ã©chouÃ©. Vos textes ont Ã©tÃ© enregistrÃ©s â€” vous pouvez rÃ©essayer ci-dessous.'
        )
        setCanRetry(!isQuota)
        await saveAttempt()
      }
    } catch {
      // Erreur rÃ©seau : on sauvegarde quand mÃªme les textes
      setAiError('Erreur de connexion. Vos textes ont Ã©tÃ© enregistrÃ©s â€” relancez la correction dÃ¨s que votre rÃ©seau est disponible.')
      setCanRetry(true)
      await saveAttempt()
    } finally {
      setPhase('results')
    }
  }, [phase, task1Text, task2Text, seriesId, saveAttempt])

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    setAiError(null)
    setPhase('submitting')
    try {
      const scoringRes = await fetch('/api/scoring/ee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task1Text, task2Text, seriesId }),
      })
      if (scoringRes.ok) {
        const scoringData = (await scoringRes.json()) as EEResult
        setResult(scoringData)
        setCanRetry(false)
        await saveAttempt({ aiScore: scoringData.globalScore, cecrlLevel: scoringData.globalCecrlLevel })
      } else {
        const isQuota = scoringRes.status === 403
        setAiError(
          isQuota
            ? 'Quota IA atteint. Revenez demain ou changez de pack.'
            : 'La correction a de nouveau Ã©chouÃ©. RÃ©essayez plus tard.'
        )
        setCanRetry(!isQuota)
      }
    } catch {
      setAiError('Erreur de connexion. RÃ©essayez quand votre rÃ©seau est disponible.')
      setCanRetry(true)
    } finally {
      setPhase('results')
      setIsRetrying(false)
    }
  }, [task1Text, task2Text, seriesId, saveAttempt])

  // â”€â”€ Loading â”€â”€
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-tef-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Chargement de la sÃ©rieâ€¦</p>
        </div>
      </div>
    )
  }

  // â”€â”€ Error â”€â”€
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center max-w-sm w-full space-y-4">
          <div className="text-4xl">âŒ</div>
          <p className="font-bold text-gray-800">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  // â”€â”€ Submitting â”€â”€
  if (phase === 'submitting') return <ScoringScreen />

  // â”€â”€ Results â”€â”€
  if (phase === 'results') {
    const cecrlGrad = result ? (CECRL_GRADIENT[result.globalCecrlLevel] ?? 'from-tef-blue to-blue-700') : 'from-gray-400 to-gray-500'
    return (
      <div className="min-h-screen bg-background">
        {/* Results hero */}
        <div className={`bg-gradient-to-br ${cecrlGrad} text-white`}>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Expression Ã‰crite</p>
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
                  <div className="text-white/60 text-xs mt-1">Score global Â· Niveau CECRL</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* BanniÃ¨re erreur IA â€” enrichie avec RÃ©essayer et textes soumis */}
          {aiError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
              <div className="px-4 py-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="flex-1">
                  <p className="font-bold text-amber-800 text-sm">Correction IA non disponible</p>
                  <p className="text-amber-700 text-sm mt-1 leading-relaxed">{aiError}</p>
                </div>
              </div>
              {canRetry && (
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {isRetrying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Relance en coursâ€¦
                      </>
                    ) : (
                      'RÃ©essayer la correction IA'
                    )}
                  </button>
                  <a
                    href="/packs"
                    className="inline-flex items-center px-4 py-2 border border-amber-300 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Voir les packs
                  </a>
                </div>
              )}
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
                      <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">TÃ¢che {num}</p>
                      <p className="font-bold text-sm mt-0.5 leading-tight">{label}</p>
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
                  )
                })}
              </div>

              <TaskResultCard taskNumber={1} label="Suite d'article" score={result.task1} />
              <TaskResultCard taskNumber={2} label="Lettre au journal" score={result.task2} />
            </>
          ) : (
            /* Fallback : afficher les textes soumis pour que l'abonnÃ© puisse les copier */
            <div className="space-y-4">
              {[
                { num: 1, label: "TÃ¢che 1 â€” Suite d'article", text: task1Text },
                { num: 2, label: 'TÃ¢che 2 â€” Lettre au journal', text: task2Text },
              ].map(({ num, label, text }) => (
                <div key={num} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                    <span className="text-sm">{num === 1 ? 'ðŸ“' : 'âœ‰ï¸'}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                    <span className="ml-auto text-xs text-gray-400">{countWords(text)} mots</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text || 'â€”'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors shadow-sm"
            >
              Retour au tableau de bord â†’
            </button>
          </div>
        </div>
      </div>
    )
  }

  // â”€â”€ Exit confirm modal â”€â”€
  const ExitModal = () => !showExitConfirm ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">âš ï¸</div>
          <h2 className="text-lg font-extrabold text-gray-900">Quitter le test ?</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Vos rÃ©ponses ne seront pas enregistrÃ©es et votre progression sera perdue.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2.5 bg-tef-red text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
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

  // â”€â”€ Task 1 â”€â”€
  if (phase === 'task1') {
    const task1Count = countWords(task1Text)
    const task1OK = task1Count >= TASK1_MIN
    const wordPct = Math.min(100, (task1Count / TASK1_MIN) * 100)
    return (
      <>
        <div className="min-h-screen bg-background">
          <Timer durationSeconds={25 * 60} onTimeUp={handleTask1TimeUp} />

          {/* Sous-header sticky */}
          <div className="fixed top-[40px] left-0 right-0 z-40 bg-white border-b border-gray-200">
            <div className="h-[46px] max-w-3xl mx-auto px-4 flex items-center gap-3">
              {/* Gauche : module Â· titre + stepper */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Expr. Ã‰crite</span>
                  <span className="text-gray-300 text-xs hidden sm:block">Â·</span>
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[90px]">{series?.title}</span>
                </div>
                <ProgressStepper phase={phase} />
              </div>
              {/* Droite : compteur + âœ• */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold tabular-nums ${task1OK ? 'text-green-600' : 'text-gray-400'}`}>
                  {task1Count}<span className="text-gray-300">/{TASK1_MIN}</span>
                </span>
                <button onClick={() => setShowExitConfirm(true)}
                  className="px-2 py-0.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  âœ•
                </button>
              </div>
            </div>
            <div className="w-full h-[3px] bg-gray-200">
              <div className={`h-[3px] transition-all ${task1OK ? 'bg-green-500' : 'bg-tef-blue'}`} style={{ width: `${wordPct}%` }} />
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 pt-[calc(89px_-_3.5rem)] pb-10 space-y-5">

            {/* BanniÃ¨re brouillon restaurÃ© (item 02) */}
            {draftBanner && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
                <span className="flex-shrink-0 text-base">ðŸ’¾</span>
                <p className="flex-1 text-blue-800 font-medium">Brouillon restaurÃ© â€” vos textes prÃ©cÃ©dents ont Ã©tÃ© rechargÃ©s.</p>
                <button onClick={() => setDraftBanner(false)} className="text-blue-400 hover:text-blue-600 flex-shrink-0 text-lg leading-none">âœ•</button>
              </div>
            )}

            {/* Quota IA */}
            {aiQuota && (
              aiQuota.limit === 0 || aiQuota.remaining === 0 ? (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                  <span className="flex-shrink-0 text-base mt-0.5">âš ï¸</span>
                  <div>
                    <p className="font-semibold text-amber-800">
                      {aiQuota.limit === 0
                        ? 'Correction IA non incluse dans votre pack'
                        : `Quota IA Ã©puisÃ© (${aiQuota.used}/${aiQuota.limit} ${aiQuota.isMonthly ? 'ce mois' : "aujourd'hui"})`}
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {aiQuota.limit === 0
                        ? 'Vos textes seront enregistrÃ©s sans correction automatique. Passez Ã  un pack supÃ©rieur pour accÃ©der aux corrections IA.'
                        : aiQuota.isMonthly
                          ? 'Vos textes seront enregistrÃ©s mais ne seront pas corrigÃ©s. Passez Ã  un pack payant pour plus de corrections IA.'
                          : "Vos textes seront enregistrÃ©s mais ne seront pas corrigÃ©s par l'IA. Revenez demain ou passez Ã  un pack supÃ©rieur."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-semibold self-start">
                  ðŸ¤– {aiQuota.remaining} correction{aiQuota.remaining > 1 ? 's' : ''} IA disponible{aiQuota.remaining > 1 ? 's' : ''} {aiQuota.isMonthly ? 'ce mois' : "aujourd'hui"}
                </div>
              )
            )}

            {/* Task badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tef-blue text-white text-xs font-bold rounded-full shadow-sm">
                ðŸ“ TÃ¢che 1 â€” Suite d&apos;article
              </span>
              <span className="text-xs text-gray-400">25 min Â· 80 mots min.</span>
            </div>

            {/* Consigne â€” avant le document (ordre pÃ©dagogique) */}
            <div className="bg-tef-blue/5 border border-tef-blue/20 rounded-xl px-4 py-3 flex gap-3">
              <span className="text-tef-blue text-lg flex-shrink-0">ðŸ’¡</span>
              <p className="text-sm text-tef-blue/90 leading-relaxed font-medium">{task1Q?.question ?? TASK1_CONSIGNE}</p>
            </div>

            {/* Document support â€” dÃ©but de l'article Ã  complÃ©ter */}
            {(task1Q?.taskTitle || task1Q?.longText) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ðŸ“„ DÃ©but de l&apos;article</span>
                  <span className="text-[10px] text-gray-400 italic">â€” Ã  complÃ©ter ci-dessous</span>
                </div>
                <div className="p-4 space-y-2">
                  {task1Q?.taskTitle && <p className="font-bold text-gray-900 text-base">{task1Q.taskTitle}</p>}
                  {task1Q?.longText && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task1Q.longText}</p>}
                </div>
              </div>
            )}

            {/* Textarea */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">âœï¸ Votre suite</p>
                <WordCounter text={task1Text} minimum={TASK1_MIN} />
              </div>
              <textarea
                value={task1Text}
                onChange={(e) => setTask1Text(e.target.value)}
                rows={12}
                placeholder="RÃ©digez ici la suite de l'articleâ€¦"
                className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pb-2">
              <button
                onClick={() => setPhase('task2')}
                disabled={!task1OK}
                className="px-7 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Passer Ã  la TÃ¢che 2 â†’
              </button>
            </div>
          </div>
        </div>
        <ExitModal />
      </>
    )
  }

  // â”€â”€ Task 2 â”€â”€
  const task2Count = countWords(task2Text)
  const task2OK = task2Count >= TASK2_MIN
  const word2Pct = Math.min(100, (task2Count / TASK2_MIN) * 100)

  return (
    <>
      <div className="min-h-screen bg-background">
        <Timer durationSeconds={35 * 60} onTimeUp={handleTask2TimeUp} />

        {/* Sous-header sticky */}
        <div className="fixed top-[40px] left-0 right-0 z-40 bg-white border-b border-gray-200">
          <div className="h-[46px] max-w-3xl mx-auto px-4 flex items-center gap-3">
            {/* Gauche : module Â· titre + stepper */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Expr. Ã‰crite</span>
                <span className="text-gray-300 text-xs hidden sm:block">Â·</span>
                <span className="text-xs font-bold text-gray-700 truncate max-w-[90px]">{series?.title}</span>
              </div>
              <ProgressStepper phase={phase} />
            </div>
            {/* Droite : compteur + âœ• */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold tabular-nums ${task2OK ? 'text-green-600' : 'text-gray-400'}`}>
                {task2Count}<span className="text-gray-300">/{TASK2_MIN}</span>
              </span>
              <button onClick={() => setShowExitConfirm(true)}
                className="px-2 py-0.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors">
                âœ•
              </button>
            </div>
          </div>
          <div className="w-full h-[3px] bg-gray-200">
            <div className={`h-[3px] transition-all ${task2OK ? 'bg-green-500' : 'bg-tef-blue'}`} style={{ width: `${word2Pct}%` }} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-[calc(89px_-_3.5rem)] pb-10 space-y-5">

          {/* Quota IA */}
          {aiQuota && (
            aiQuota.limit === 0 || aiQuota.remaining === 0 ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                <span className="flex-shrink-0 text-base mt-0.5">âš ï¸</span>
                <div>
                  <p className="font-semibold text-amber-800">
                    {aiQuota.limit === 0
                      ? 'Correction IA non incluse dans votre pack'
                      : `Quota IA Ã©puisÃ© pour aujourd'hui (${aiQuota.used}/${aiQuota.limit} utilisÃ©)`}
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    {aiQuota.limit === 0
                      ? 'Vos textes seront enregistrÃ©s sans correction automatique.'
                      : 'Vos textes seront enregistrÃ©s mais ne seront pas corrigÃ©s par l\'IA.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-semibold self-start">
                ðŸ¤– {aiQuota.remaining} correction{aiQuota.remaining > 1 ? 's' : ''} IA disponible{aiQuota.remaining > 1 ? 's' : ''} {aiQuota.isMonthly ? 'ce mois' : "aujourd'hui"}
              </div>
            )
          )}

          {/* Task badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tef-blue text-white text-xs font-bold rounded-full shadow-sm">
              âœ‰ï¸ TÃ¢che 2 â€” Lettre au journal
            </span>
            <span className="text-xs text-gray-400">35 min Â· 200 mots min.</span>
          </div>

          {/* Consigne â€” avant le document (ordre pÃ©dagogique) */}
          <div className="bg-tef-blue/5 border border-tef-blue/20 rounded-xl px-4 py-3 flex gap-3">
            <span className="text-tef-blue text-lg flex-shrink-0">ðŸ’¡</span>
            <p className="text-sm text-tef-blue/90 leading-relaxed font-medium">{task2Q?.question ?? TASK2_CONSIGNE}</p>
          </div>

          {/* Document support â€” extrait de journal Ã  rÃ©agir */}
          {task2Q?.longText && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ðŸ“° Extrait de journal</span>
                <span className="text-[10px] text-gray-400 italic">â€” rÃ©agissez par une lettre</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-tef-blue/30 pl-4">
                  {task2Q.longText}
                </p>
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">âœï¸ Votre lettre</p>
              <WordCounter text={task2Text} minimum={TASK2_MIN} />
            </div>
            <textarea
              value={task2Text}
              onChange={(e) => setTask2Text(e.target.value)}
              rows={14}
              placeholder="RÃ©digez ici votre lettre au journalâ€¦"
              className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <button
              onClick={() => setPhase('task1')}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              â† TÃ¢che 1
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleFinalSubmit}
                disabled={!task2OK}
                className="px-7 py-3 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                ðŸ¤– Soumettre pour correction IA
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
      return <span key={i} className="text-blue-700 bg-blue-50 px-0.5 rounded underline decoration-blue-600">{content}</span>
    }
    return <span key={i}>{part}</span>
  })
}

function renderImprovedText(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, lineIdx) => {
    if (line.trim() === '') return <div key={lineIdx} className="h-2" />
    const isHeader = /^[0-9]e[r]?\w*\s+paragraphe\s*\(/i.test(line.trim())
    if (isHeader) return <p key={lineIdx} className="font-bold text-blue-700 mt-3 mb-0.5 text-sm">{line}</p>
    const parts = line.split(/(\[[^\]]+\])/g)
    return (
      <p key={lineIdx} className="text-sm text-gray-800 leading-relaxed">
        {parts.map((part, i) =>
          /^\[.+\]$/.test(part) ? (
            <span key={i} className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1 rounded mx-0.5 leading-none py-0.5 align-middle">
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
            {taskNumber === 1 ? 'ðŸ“' : 'âœ‰ï¸'}
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">TÃ¢che {taskNumber} â€” {label}</p>
            <p className="text-xs text-gray-400">{score.wordCount} mots rÃ©digÃ©s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-tef-blue">{score.score}<span className="text-base text-gray-300">/225</span></span>
          <div className="flex flex-col items-end gap-0.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              CECRL_GRADIENT[score.cecrlLevel]
                ? `bg-gradient-to-r ${CECRL_GRADIENT[score.cecrlLevel]} text-white`
                : 'bg-tef-blue/10 text-tef-blue'
            }`}>
              {score.cecrlLevel}
            </span>
            {score.nclcLevel !== undefined && (
              <span className="text-[10px] font-bold text-gray-400">NCLC {score.nclcLevel}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Feedback */}
        <p className="text-sm text-gray-700 leading-relaxed">{score.feedback}</p>

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-4">
          {score.strengths.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-extrabold text-blue-700 mb-2 flex items-center gap-1">
                <span>âœ…</span> Points forts
              </p>
              <ul className="space-y-1.5">
                {score.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">â€¢</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {score.improvements.length > 0 && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <p className="text-xs font-extrabold text-red-700 mb-2 flex items-center gap-1">
                <span>ðŸ’¡</span> Ã€ amÃ©liorer
              </p>
              <ul className="space-y-1.5">
                {score.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-800">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">â†’</span>
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
              className="flex items-center gap-2 text-sm font-semibold text-tef-red hover:text-red-700 transition-colors">
              <span>âœï¸</span>
              {showImproved ? 'Masquer les corrections' : 'Voir les corrections de ton texte'}
              <span className={`transition-transform duration-200 ${showImproved ? 'rotate-180' : ''}`}>â–¾</span>
            </button>
            {showImproved && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-red-800 font-semibold pb-2 border-b border-red-200">
                  <span>Corrections pour atteindre le niveau {nextLevel} :</span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="line-through text-red-600 bg-red-50 px-1 rounded">erreur</span>
                    <span className="text-gray-500">= Ã  corriger</span>
                  </span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="text-blue-700 bg-blue-50 px-1 rounded underline decoration-blue-600">correction</span>
                    <span className="text-gray-500">= texte corrigÃ©</span>
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
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              <span>ðŸ“</span>
              {showImprovedFull ? 'Masquer la production corrigÃ©e' : `Production corrigÃ©e â€” structure 4 paragraphes (niveau ${nextLevel})`}
              <span className={`transition-transform duration-200 ${showImprovedFull ? 'rotate-180' : ''}`}>â–¾</span>
            </button>
            {showImprovedFull && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-800 font-semibold pb-2 border-b border-blue-200 mb-3">
                  <span>RÃ©Ã©criture au niveau {nextLevel} :</span>
                  <span className="flex items-center gap-1 font-normal">
                    <span className="text-[10px] font-semibold text-blue-600 bg-white border border-blue-200 px-1 rounded">[procÃ©dÃ©]</span>
                    <span className="text-gray-500">= technique utilisÃ©e</span>
                  </span>
                </div>
                <div className="space-y-0.5">{renderImprovedText(score.improvedText)}</div>
              </div>
            )}
          </div>
        )}

        {score.cecrlLevel === 'C2' && (
          <div className="border-t border-gray-50 pt-3">
            <p className="text-sm text-gray-400 italic">ðŸ† Niveau maximum C2 atteint â€” fÃ©licitations !</p>
          </div>
        )}
      </div>
    </div>
  )
}
