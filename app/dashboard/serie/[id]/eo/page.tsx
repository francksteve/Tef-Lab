'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AudioRecorder from '@/components/ui/AudioRecorder'

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
  | 'recordA'
  | 'pause'
  | 'prepB'
  | 'recordB'
  | 'results'
  | 'scoring'

// Placeholder announcement texts (would come from series data in a full implementation)
const ANNONCE_A = `OFFRE D'EMPLOI — AIDE À DOMICILE
Nous recherchons une personne dynamique et bienveillante pour accompagner une personne âgée dans ses tâches quotidiennes.
- Expérience souhaitée
- Permis B requis
- Poste à temps partiel — 20h/semaine
- Rémunération : selon convention collective

Contactez-nous pour plus d'informations.`

const ANNONCE_B = `CIRCUIT QUÉBEC — 8 JOURS / 7 NUITS
Découvrez le Québec en toute sérénité avec notre circuit complet.
- Villes : Montréal, Québec, Saguenay
- Hébergement 3* inclus
- Guide francophone tout au long du séjour
- Départ tous les samedis
- À partir de 1 490 € par personne

Une expérience inoubliable vous attend !`

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

export default function EOPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const seriesId = params.id as string

  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<EoStep>('intro')
  const [audioA, setAudioA] = useState<Blob | null>(null)
  const [audioB, setAudioB] = useState<Blob | null>(null)
  const [audioAUrl, setAudioAUrl] = useState<string | null>(null)
  const [audioBUrl, setAudioBUrl] = useState<string | null>(null)
  const [result, setResult] = useState<EOResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Self-evaluation checklist state
  const [checklistA, setChecklistA] = useState<boolean[]>(new Array(5).fill(false))
  const [checklistB, setChecklistB] = useState<boolean[]>(new Array(5).fill(false))

  const checklistAItems = [
    "J'ai posé environ 10 questions",
    "J'ai utilisé le vouvoiement (registre formel)",
    "J'ai couvert les informations principales de l'annonce",
    'Ma prononciation était claire et compréhensible',
    "J'ai évité les longues pauses et les hésitations excessives",
  ]

  const checklistBItems = [
    "J'ai présenté les informations clés du document",
    "J'ai utilisé le tutoiement (registre informel)",
    "J'ai avancé au moins 3 arguments convaincants",
    "Mon ton était naturel et enthousiaste",
    "J'ai utilisé un vocabulaire varié et approprié",
  ]

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

  const handleRecordAComplete = useCallback((blob: Blob) => {
    setAudioA(blob)
    const url = URL.createObjectURL(blob)
    setAudioAUrl(url)
  }, [])

  const handleRecordBComplete = useCallback((blob: Blob) => {
    setAudioB(blob)
    const url = URL.createObjectURL(blob)
    setAudioBUrl(url)
  }, [])

  const proceedToResults = useCallback(async () => {
    setStep('results')
    // Save attempt
    await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesId,
        moduleCode: 'EO',
        answers: {},
      }),
    }).catch(() => {})
  }, [seriesId])

  const handleAIScoring = useCallback(async () => {
    setStep('scoring')
    setAiError(null)
    try {
      const res = await fetch('/api/scoring/eo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptionA: '[Transcription audio non disponible — évaluation basée sur auto-évaluation]',
          transcriptionB: '[Transcription audio non disponible — évaluation basée sur auto-évaluation]',
          announcementA: ANNONCE_A,
          announcementB: ANNONCE_B,
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as EOResult
        setResult(data)
      } else {
        setAiError('La correction par IA a échoué. Veuillez réessayer.')
      }
    } catch {
      setAiError('Erreur réseau lors de la correction IA.')
    } finally {
      setStep('results')
    }
  }, [])

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

  // Scoring in progress
  if (step === 'scoring') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">Correction par IA en cours…</p>
        <p className="text-gray-400 text-sm">Cela peut prendre quelques secondes.</p>
      </div>
    )
  }

  // Results view
  if (step === 'results') {
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

          {/* Audio playback */}
          <div className="grid sm:grid-cols-2 gap-4">
            {audioAUrl && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Section A — Réécoute
                </p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={audioAUrl} className="w-full" />
              </div>
            )}
            {audioBUrl && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Section B — Réécoute
                </p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={audioBUrl} className="w-full" />
              </div>
            )}
          </div>

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
                      <p className="text-xs font-semibold text-gray-500 mb-1">Prononciation</p>
                      <p className="text-sm text-gray-700">{result.pronunciation}</p>
                    </div>
                  )}
                  {result.lexique && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Lexique</p>
                      <p className="text-sm text-gray-700">{result.lexique}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Self-evaluation checklists */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Grille d’auto-évaluation</h2>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Section A — Obtenir des informations
              </h3>
              <div className="space-y-2">
                {checklistAItems.map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checklistA[i]}
                      onChange={(e) => {
                        const updated = [...checklistA]
                        updated[i] = e.target.checked
                        setChecklistA(updated)
                      }}
                      className="mt-0.5 w-4 h-4 accent-tef-blue"
                    />
                    <span
                      className={`text-sm ${
                        checklistA[i] ? 'text-green-700 line-through' : 'text-gray-700'
                      } group-hover:text-gray-900 transition-colors`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {checklistA.filter(Boolean).length}/{checklistAItems.length} critères atteints
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Section B — Présenter et convaincre
              </h3>
              <div className="space-y-2">
                {checklistBItems.map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checklistB[i]}
                      onChange={(e) => {
                        const updated = [...checklistB]
                        updated[i] = e.target.checked
                        setChecklistB(updated)
                      }}
                      className="mt-0.5 w-4 h-4 accent-tef-blue"
                    />
                    <span
                      className={`text-sm ${
                        checklistB[i] ? 'text-green-700 line-through' : 'text-gray-700'
                      } group-hover:text-gray-900 transition-colors`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {checklistB.filter(Boolean).length}/{checklistBItems.length} critères atteints
              </p>
            </div>
          </div>

          {/* AI scoring button (if not yet done) */}
          {!result && !aiError && (
            <div className="bg-tef-blue/5 border border-tef-blue/20 rounded-xl p-6 text-center">
              <p className="font-semibold text-tef-blue mb-2">
                Obtenir une correction détaillée par IA
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Soumettez vos enregistrements pour une analyse automatique de votre niveau CECRL.
              </p>
              <button
                onClick={handleAIScoring}
                className="px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
              >
                Demander la correction IA
              </button>
            </div>
          )}

          {aiError && (
            <div className="text-center">
              <button
                onClick={handleAIScoring}
                className="px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
              >
                Réessayer la correction IA
              </button>
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

  // Introduction step
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
              Présentation de l’épreuve
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-xl">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-semibold text-tef-blue text-sm">Section A — Obtenir des informations</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous lirez une annonce, puis poserez une dizaine de questions pour vous informer.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Préparation : 30 secondes · Enregistrement : 5 minutes max · Registre formel
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-orange-50 rounded-xl">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-orange-700 text-sm">Section B — Présenter et convaincre</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous lirez une nouvelle annonce, puis la présenterez et essaierez de convaincre un ami.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Préparation : 60 secondes · Enregistrement : 10 minutes max · Registre informel
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              Assurez-vous que votre microphone est activé et que vous êtes dans un endroit calme avant de commencer.
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('prepA')}
                className="px-8 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
              >
                Commencer l’épreuve →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prep A
  if (step === 'prepA') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-tef-blue text-white text-xs font-semibold rounded-full mb-3">
              Section A — Préparation
            </span>
            <h1 className="text-xl font-bold text-gray-900">Lisez l’annonce suivante</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500 mb-3">Document support</p>
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {ANNONCE_A}
            </pre>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 text-sm text-blue-800">
            <p className="font-semibold mb-1">Consigne</p>
            <p>Vous téléphonez pour avoir plus d’informations sur cette annonce. Posez une dizaine de questions à votre interlocuteur(trice). Utilisez le vouvoiement.</p>
          </div>

          <Countdown
            seconds={30}
            onDone={() => setStep('recordA')}
            label="Temps de préparation"
          />
        </div>
      </div>
    )
  }

  // Record A
  if (step === 'recordA') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-tef-red text-white text-xs font-semibold rounded-full mb-3">
              Section A — Enregistrement
            </span>
            <h1 className="text-xl font-bold text-gray-900">Posez vos questions</h1>
            <p className="text-sm text-gray-500 mt-1">Durée maximum : 5 minutes</p>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">{ANNONCE_A}</pre>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <AudioRecorder
              onRecordingComplete={handleRecordAComplete}
              maxDurationSeconds={300}
              label="Démarrer l'enregistrement (Section A)"
            />
          </div>

          {audioA && (
            <div className="flex justify-end">
              <button
                onClick={() => setStep('pause')}
                className="px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
              >
                Terminer la Section A →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Pause between sections
  if (step === 'pause') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center space-y-6 p-8">
          <div className="text-5xl">⏸</div>
          <h2 className="text-xl font-bold text-gray-900">Pause entre les sections</h2>
          <p className="text-sm text-gray-500">
            La Section B commence dans quelques instants. Préparez-vous.
          </p>
          <Countdown
            seconds={10}
            onDone={() => setStep('prepB')}
            label="Pause"
          />
        </div>
      </div>
    )
  }

  // Prep B
  if (step === 'prepB') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-3">
              Section B — Préparation
            </span>
            <h1 className="text-xl font-bold text-gray-900">Lisez l’annonce suivante</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500 mb-3">Document support</p>
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {ANNONCE_B}
            </pre>
          </div>

          <div className="bg-orange-50 rounded-xl p-5 text-sm text-orange-800">
            <p className="font-semibold mb-1">Consigne</p>
            <p>Vous en parlez à un(e) ami(e). Présentez ce document et essayez de le / la convaincre d’y participer. Utilisez le tutoiement.</p>
          </div>

          <Countdown
            seconds={60}
            onDone={() => setStep('recordB')}
            label="Temps de préparation"
          />
        </div>
      </div>
    )
  }

  // Record B
  if (step === 'recordB') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-tef-red text-white text-xs font-semibold rounded-full mb-3">
              Section B — Enregistrement
            </span>
            <h1 className="text-xl font-bold text-gray-900">Présentez et convainquez</h1>
            <p className="text-sm text-gray-500 mt-1">Durée maximum : 10 minutes</p>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">{ANNONCE_B}</pre>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <AudioRecorder
              onRecordingComplete={handleRecordBComplete}
              maxDurationSeconds={600}
              label="Démarrer l'enregistrement (Section B)"
            />
          </div>

          {audioB && (
            <div className="flex justify-end">
              <button
                onClick={proceedToResults}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Terminer l’épreuve →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

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
      {extraInfo && (
        <p className="text-xs text-gray-500 italic">{extraInfo}</p>
      )}
      {score.registreAdapte !== undefined && (
        <p className={`text-xs font-medium ${score.registreAdapte ? 'text-green-600' : 'text-orange-600'}`}>
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
