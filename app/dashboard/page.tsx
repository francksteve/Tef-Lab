'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Module {
  id: string
  name: string
  code: string
  description: string
  duration: number
}

interface Series {
  id: string
  title: string
  moduleId: string
  difficulty: string
  isFree: boolean
  module: Module
  _count: { questions: number }
}

interface AttemptSeries {
  title: string
  module: { code: string; name: string }
}

interface Attempt {
  id: string
  moduleCode: string
  score?: number | null
  cecrlLevel?: string | null
  timeTaken?: number | null
  completedAt: string
  series: AttemptSeries
}

const moduleIcons: Record<string, string> = {
  CE: '📖',
  CO: '🎧',
  EE: '✍️',
  EO: '🎤',
}

const moduleColors: Record<string, string> = {
  CE: 'bg-blue-50 border-blue-200 hover:border-tef-blue',
  CO: 'bg-purple-50 border-purple-200 hover:border-purple-500',
  EE: 'bg-green-50 border-green-200 hover:border-green-500',
  EO: 'bg-orange-50 border-orange-200 hover:border-orange-500',
}


function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min${s > 0 ? ` ${s}s` : ''}`
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [series, setSeries] = useState<Series[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/connexion')
      return
    }
    Promise.all([
      fetch('/api/series').then((r) => r.json()),
      fetch('/api/attempts').then((r) => r.json()),
    ])
      .then(([s, a]) => {
        if (Array.isArray(s)) setSeries(s)
        if (Array.isArray(a)) setAttempts(a)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Candidat'
  const isSubscriber = session?.user?.role === 'SUBSCRIBER' || session?.user?.role === 'ADMIN'

  // Group series by module
  const seriesByModule: Record<string, Series[]> = {}
  series.forEach((s) => {
    const code = s.module.code
    if (!seriesByModule[code]) seriesByModule[code] = []
    seriesByModule[code].push(s)
  })

  const moduleOrder = ['CE', 'CO', 'EE', 'EO']

  const recentAttempts = attempts.slice(0, 10)

  const getSeriesLink = (s: Series) => {
    const code = s.module.code
    if (code === 'EE') return `/dashboard/serie/${s.id}/ee`
    if (code === 'EO') return `/dashboard/serie/${s.id}/eo`
    return `/dashboard/serie/${s.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-tef-blue text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold">
            Bonjour {firstName} 👋
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {isSubscriber
              ? 'Accédez à vos séries d\'entraînement TEF Canada'
              : 'Découvrez nos séries gratuites pour commencer votre préparation'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Modules */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Les 4 modules TEF Canada</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleOrder.map((code) => {
              const moduleSeries = seriesByModule[code] ?? []
              const availableSeries = isSubscriber
                ? moduleSeries
                : moduleSeries.filter((s) => s.isFree)
              const sampleModule = moduleSeries[0]?.module

              return (
                <div
                  key={code}
                  className={`bg-white rounded-xl border-2 ${moduleColors[code] ?? 'border-gray-200'} p-5 transition-all`}
                >
                  <div className="text-3xl mb-2">{moduleIcons[code]}</div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {sampleModule?.name ?? code}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {availableSeries.length} série{availableSeries.length !== 1 ? 's' : ''} disponible{availableSeries.length !== 1 ? 's' : ''}
                  </p>
                  {availableSeries.length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      {availableSeries.slice(0, 3).map((s) => (
                        <Link
                          key={s.id}
                          href={getSeriesLink(s)}
                          className="flex items-center gap-1 text-xs text-tef-blue hover:underline font-medium"
                        >
                          <span>→</span>
                          <span className="truncate">{s.title}</span>
                          {s.isFree && (
                            <span className="ml-auto text-green-600 font-semibold flex-shrink-0">Gratuite</span>
                          )}
                        </Link>
                      ))}
                      {availableSeries.length > 3 && (
                        <p className="text-xs text-gray-400">+{availableSeries.length - 3} autres</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400 italic">
                      {isSubscriber ? 'Aucune série disponible' : 'Abonnez-vous pour accéder'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA si non abonné */}
        {!isSubscriber && (
          <section className="bg-tef-blue/5 border border-tef-blue/20 rounded-xl p-6 text-center">
            <p className="text-lg font-bold text-tef-blue mb-2">
              Accédez à toutes les séries avec un pack d'abonnement
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Préparez efficacement vos 4 modules avec nos séries d'entraînement complètes.
            </p>
            <Link
              href="/packs"
              className="inline-block px-6 py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
            >
              Voir les packs
            </Link>
          </section>
        )}

        {/* Historique des tentatives */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Historique de vos passages</h2>
          {recentAttempts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📝</p>
              <p>Vous n'avez encore passé aucune série.</p>
              <p className="text-sm mt-1">Commencez par une série gratuite ci-dessus !</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Module', 'Série', 'Score', 'Niveau CECRL', 'Temps', 'Date'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            {moduleIcons[attempt.moduleCode] ?? '📝'}
                            {attempt.moduleCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{attempt.series.title}</td>
                        <td className="px-4 py-3">
                          {attempt.score !== null && attempt.score !== undefined ? (
                            <span className="font-semibold text-tef-blue">{attempt.score}/40</span>
                          ) : attempt.cecrlLevel ? (
                            <span className="text-green-600 font-semibold">IA</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {attempt.cecrlLevel ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-tef-blue/10 text-tef-blue">
                              {attempt.cecrlLevel}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {attempt.timeTaken ? formatTime(attempt.timeTaken) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(attempt.completedAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10 py-6 text-center text-xs text-gray-400">
        <p>
          <Link href="/" className="hover:text-tef-blue">Accueil</Link>
          {' · '}
          <Link href="/packs" className="hover:text-tef-blue">Packs</Link>
          {' · '}
          <Link href="/contact" className="hover:text-tef-blue">Contact</Link>
          {' · '}
          © 2025 Tef-Lab
        </p>
      </footer>
    </div>
  )
}
