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

interface TaskScore {
  wordCount: number
  score: number
  cecrlLevel: string
  feedback: string
  strengths: string[]
  improvements: string[]
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

export default function EEPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const seriesId = params.id as string

  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [phase, setPhase] = useState<PagePhase>('task1')
  const [task1Text, setTask1Text] = useState('')
  const [task2Text, setTask2Text] = useState('')
  const [result, setResult] = useState<EEResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/connexion')
      return
    }
    fetch(`/api/series/${seriesId}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (data && typeof data === 'object' && 'id' in data) {
          setSeries(data as Series)
        } else {
          setError('Série introuvable.')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement.')
        setLoading(false)
      })
  }, [seriesId, session, status, router])

  const handleTask1TimeUp = useCallback(() => {
    setPhase('task2')
  }, [])

  const handleTask2TimeUp = useCallback(() => {
    handleFinalSubmit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task1Text, task2Text])

  const handleFinalSubmit = useCallback(async () => {
    if (phase === 'submitting' || phase === 'results') return
    setPhase('submitting')
    setAiError(null)

    try {
      const [scoringRes] = await Promise.all([
        fetch('/api/scoring/ee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task1Text, task2Text, seriesId }),
        }),
      ])

      if (scoringRes.ok) {
        const scoringData = (await scoringRes.json()) as EEResult
        setResult(scoringData)

        // Save attempt
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seriesId,
            moduleCode: 'EE',
            answers: {},
            writtenTask1: task1Text,
            writtenTask2: task2Text,
            aiScore: scoringData.globalScore,
            cecrlLevel: scoringData.globalCecrlLevel,
          }),
        }).catch(() => {})
      } else {
        setAiError('La correction par IA a échoué. Veuillez réessayer.')
        // Still save attempt without scoring
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seriesId,
            moduleCode: 'EE',
            answers: {},
            writtenTask1: task1Text,
            writtenTask2: task2Text,
          }),
        }).catch(() => {})
      }
    } catch {
      setAiError('Erreur lors de la soumission. Vérifiez votre connexion.')
    } finally {
      setPhase('results')
    }
  }, [phase, task1Text, task2Text, seriesId])

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

  // Results view
  if (phase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Résultats — Expression Écrite
            </h1>
            <p className="text-gray-500 text-sm mt-1">{series?.title}</p>
          </div>

          {aiError && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
              {aiError}
            </div>
          )}

          {result && (
            <>
              {/* Score global */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-5xl font-black text-tef-blue mb-2">
                  {result.globalScore}
                  <span className="text-2xl text-gray-400">/100</span>
                </p>
                <p className="text-2xl font-bold text-tef-red">{result.globalCecrlLevel}</p>
                <p className="text-sm text-gray-500 mt-1">Score global / Niveau CECRL</p>
              </div>

              {/* Tâche 1 */}
              <TaskResultCard
                taskNumber={1}
                label="Suite d'article"
                score={result.task1}
              />

              {/* Tâche 2 */}
              <TaskResultCard
                taskNumber={2}
                label="Lettre au journal"
                score={result.task2}
              />
            </>
          )}

          {!result && !aiError && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              <p>Vos réponses ont été enregistrées.</p>
            </div>
          )}

          <div className="flex justify-center">
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

  // Submitting
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">Correction par IA en cours…</p>
        <p className="text-gray-400 text-sm">Cela peut prendre quelques secondes.</p>
      </div>
    )
  }

  // Task 1
  if (phase === 'task1') {
    const task1Count = countWords(task1Text)
    const task1OK = task1Count >= TASK1_MIN
    return (
      <div className="min-h-screen bg-gray-50">
        <Timer durationSeconds={25 * 60} onTimeUp={handleTask1TimeUp} />
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 space-y-6">
          <div>
            <span className="inline-block px-3 py-1 bg-tef-blue text-white text-xs font-semibold rounded-full mb-3">
              Tâche 1 / 2 — Suite d’article
            </span>
            <h1 className="text-xl font-bold text-gray-900">{series?.title}</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-1">Consigne</p>
            <p className="text-gray-600 text-sm leading-relaxed">{TASK1_CONSIGNE}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre texte (suite de l’article)
            </label>
            <textarea
              value={task1Text}
              onChange={(e) => setTask1Text(e.target.value)}
              rows={12}
              placeholder="Rédigez ici la suite de l'article…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue leading-relaxed"
            />
            <WordCounter text={task1Text} minimum={TASK1_MIN} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setPhase('task2')}
              disabled={!task1OK}
              className="px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Passer à la Tâche 2 →
            </button>
          </div>
          {!task1OK && (
            <p className="text-sm text-red-600 text-right">
              Minimum {TASK1_MIN} mots requis avant de continuer.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Task 2
  const task2Count = countWords(task2Text)
  const task2OK = task2Count >= TASK2_MIN

  return (
    <div className="min-h-screen bg-gray-50">
      <Timer durationSeconds={35 * 60} onTimeUp={handleTask2TimeUp} />
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 space-y-6">
        <div>
          <span className="inline-block px-3 py-1 bg-tef-red text-white text-xs font-semibold rounded-full mb-3">
            Tâche 2 / 2 — Lettre au journal
          </span>
          <h1 className="text-xl font-bold text-gray-900">{series?.title}</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-700 mb-1">Consigne</p>
          <p className="text-gray-600 text-sm leading-relaxed">{TASK2_CONSIGNE}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre lettre au journal
          </label>
          <textarea
            value={task2Text}
            onChange={(e) => setTask2Text(e.target.value)}
            rows={14}
            placeholder="Rédigez ici votre lettre au journal…"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue leading-relaxed"
          />
          <WordCounter text={task2Text} minimum={TASK2_MIN} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setPhase('task1')}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Revoir Tâche 1
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleFinalSubmit}
              disabled={!task2OK}
              className="px-6 py-3 bg-tef-red text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Soumettre pour correction IA
            </button>
            {!task2OK && (
              <p className="text-sm text-red-600">
                Minimum {TASK2_MIN} mots requis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskResultCard({
  taskNumber,
  label,
  score,
}: {
  taskNumber: number
  label: string
  score: TaskScore
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">
          Tâche {taskNumber} — {label}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-tef-blue">{score.score}/100</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-tef-blue/10 text-tef-blue">
            {score.cecrlLevel}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500">{score.wordCount} mots rédigés</p>
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
          <p className="text-xs font-semibold text-orange-700 mb-1">Axes d’amélioration</p>
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
