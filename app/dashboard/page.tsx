'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import UpgradeModal from '@/components/ui/UpgradeModal'

type AccessLevel = 'FREE' | 'EE_EO' | 'ALL'

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
  CE: 'border-blue-200 hover:border-tef-blue',
  CO: 'border-purple-200 hover:border-purple-500',
  EE: 'border-green-200 hover:border-green-500',
  EO: 'border-orange-200 hover:border-orange-500',
}

const moduleHeaderColors: Record<string, string> = {
  CE: 'bg-blue-50',
  CO: 'bg-purple-50',
  EE: 'bg-green-50',
  EO: 'bg-orange-50',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min${s > 0 ? ` ${s}s` : ''}`
}

function isSeriesLocked(series: Series, accessLevel: AccessLevel): boolean {
  if (accessLevel === 'ALL') return false
  if (accessLevel === 'EE_EO') {
    return series.module.code !== 'EE' && series.module.code !== 'EO'
  }
  return !(series.isFree && (series.module.code === 'CE' || series.module.code === 'CO'))
}

function getAccessBadge(accessLevel: AccessLevel): { label: string; color: string } {
  switch (accessLevel) {
    case 'ALL':
      return { label: 'Accès complet', color: 'bg-tef-blue/10 text-tef-blue' }
    case 'EE_EO':
      return { label: 'Pack Special (EE + EO)', color: 'bg-purple-100 text-purple-700' }
    default:
      return { label: 'Compte gratuit', color: 'bg-gray-100 text-gray-600' }
  }
}

const moduleOrder = ['CE', 'CO', 'EE', 'EO']

// ─── Inner component (needs useSearchParams → wrapped in Suspense) ──────────

const SERIES_PAGE_SIZE = 10

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [series, setSeries] = useState<Series[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('FREE')
  const [loading, setLoading] = useState(true)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [paymentBanner, setPaymentBanner] = useState<'pending' | 'success' | null>(null)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  // Capture payment=success from URL exactly once on mount
  const isPaymentReturn = useRef(searchParams.get('payment') === 'success')
  // Captured subscription level after initial data load (avoids stale closure issues)
  const loadedAccessLevel = useRef<AccessLevel>('FREE')
  // Ensures payment polling only starts once even if effects re-run
  const paymentHandled = useRef(false)

  // ── Effect 1: Immediate URL cleanup + pending banner (runs once on mount) ──
  useEffect(() => {
    if (!isPaymentReturn.current) return
    setPaymentBanner('pending')
    router.replace('/dashboard', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — must only run once on mount

  // ── Effect 2: Main data load ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/connexion')
      return
    }
    Promise.all([
      fetch('/api/series').then((r) => r.json()),
      fetch('/api/attempts').then((r) => r.json()),
      fetch('/api/subscription').then((r) => r.json()),
    ])
      .then(([s, a, sub]) => {
        if (Array.isArray(s)) setSeries(s)
        if (Array.isArray(a)) setAttempts(a)
        const level: AccessLevel = sub?.accessLevel ?? 'FREE'
        loadedAccessLevel.current = level
        setAccessLevel(level)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status, router])

  // ── Effect 3: After data loads, confirm payment or poll for webhook ───────
  useEffect(() => {
    if (loading) return
    if (!isPaymentReturn.current) return
    if (paymentHandled.current) return
    paymentHandled.current = true

    // If subscription is already active (webhook processed before page load)
    if (loadedAccessLevel.current !== 'FREE') {
      setPaymentBanner('success')
      const t = setTimeout(() => setPaymentBanner(null), 7000)
      return () => clearTimeout(t)
    }

    // Webhook hasn't processed yet — poll /api/subscription until it does
    let cancelled = false
    let count = 0

    const poll = () => {
      if (cancelled) return
      count++
      fetch('/api/subscription')
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return
          if (data?.accessLevel && data.accessLevel !== 'FREE') {
            // Subscription activated — update UI and show success banner
            setAccessLevel(data.accessLevel)
            setPaymentBanner('success')
            setTimeout(() => {
              if (!cancelled) setPaymentBanner(null)
            }, 7000)
          } else if (count < 8) {
            setTimeout(poll, 1000)
          } else {
            // Max retries reached — payment was made, activation may be slightly delayed
            setPaymentBanner('success')
            setTimeout(() => {
              if (!cancelled) setPaymentBanner(null)
            }, 10000)
          }
        })
        .catch(() => {
          if (!cancelled && count < 8) setTimeout(poll, 1000)
        })
    }

    setTimeout(poll, 800) // initial delay to allow webhook to process

    return () => {
      cancelled = true
    }
  }, [loading]) // runs exactly once when loading flips to false

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Candidat'
  const badge = getAccessBadge(accessLevel)

  const seriesByModule: Record<string, Series[]> = {}
  series.forEach((s) => {
    const code = s.module.code
    if (!seriesByModule[code]) seriesByModule[code] = []
    seriesByModule[code].push(s)
  })

  const recentAttempts = attempts.slice(0, 10)

  const getSeriesLink = (s: Series) => {
    const code = s.module.code
    if (code === 'EE') return `/dashboard/serie/${s.id}/ee`
    if (code === 'EO') return `/dashboard/serie/${s.id}/eo`
    return `/dashboard/serie/${s.id}`
  }

  const openUpgrade = (reason: string) => {
    setUpgradeReason(reason)
    setUpgradeOpen(true)
  }

  return (
    <div>
      {/* ─── Payment banners ─── */}
      {paymentBanner === 'pending' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">
              Confirmation du paiement en cours…
            </p>
          </div>
        </div>
      )}

      {paymentBanner === 'success' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg flex-shrink-0">✅</span>
              <p className="text-sm text-green-800 font-semibold">
                Paiement confirmé ! Votre abonnement est maintenant actif. Bonne préparation 🎯
              </p>
            </div>
            <button
              onClick={() => setPaymentBanner(null)}
              className="text-green-400 hover:text-green-600 text-xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="bg-tef-blue text-white px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Bonjour {firstName} 👋</h1>
            <p className="text-blue-200 text-sm mt-1">
              Préparez le TEF Canada avec vos séries d'entraînement personnalisées.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
              {badge.label}
            </span>
            {accessLevel !== 'ALL' && (
              <button
                onClick={() => openUpgrade('Accédez à plus de séries et de corrections IA.')}
                className="text-xs text-blue-200 hover:text-white underline transition-colors"
              >
                Mettre à niveau →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Modules */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Les 4 modules TEF Canada</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {moduleOrder.map((code) => {
              const moduleSeries = seriesByModule[code] ?? []
              const sampleModule = moduleSeries[0]?.module
              const lockedCount = moduleSeries.filter((s) => isSeriesLocked(s, accessLevel)).length
              const unlockedCount = moduleSeries.length - lockedCount
              const isExpanded = expandedModules[code] ?? false
              const visibleSeries = isExpanded ? moduleSeries : moduleSeries.slice(0, SERIES_PAGE_SIZE)
              const hiddenCount = moduleSeries.length - SERIES_PAGE_SIZE

              return (
                <div
                  key={code}
                  className={`bg-white rounded-xl border-2 ${moduleColors[code] ?? 'border-gray-200'} flex flex-col transition-all overflow-hidden`}
                >
                  {/* ── Module header ── */}
                  <div className={`${moduleHeaderColors[code] ?? 'bg-gray-50'} px-5 pt-4 pb-4 flex items-start gap-3`}>
                    <span className="text-3xl leading-none mt-0.5">{moduleIcons[code]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {sampleModule?.name ?? code}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700">
                          ✅ {unlockedCount} série{unlockedCount !== 1 ? 's' : ''} accessible{unlockedCount !== 1 ? 's' : ''}
                        </span>
                        {lockedCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-400">
                            🔒 {lockedCount} verrouillée{lockedCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Series list ── */}
                  <div className="px-5 py-3 flex-1 divide-y divide-gray-50">
                    {moduleSeries.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Aucune série disponible</p>
                    ) : (
                      visibleSeries.map((s, i) => {
                        const locked = isSeriesLocked(s, accessLevel)
                        if (locked) {
                          return (
                            <button
                              key={s.id}
                              onClick={() =>
                                openUpgrade(
                                  `La série "${s.title}" nécessite un abonnement pour y accéder.`
                                )
                              }
                              className="w-full flex items-center gap-2.5 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors text-left group"
                            >
                              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                                {i + 1}
                              </span>
                              <span className="flex-1 truncate">{s.title}</span>
                              <span className="shrink-0 text-base">🔒</span>
                            </button>
                          )
                        }
                        return (
                          <Link
                            key={s.id}
                            href={getSeriesLink(s)}
                            className="flex items-center gap-2.5 py-2.5 text-sm text-gray-800 hover:text-tef-blue transition-colors group"
                          >
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-tef-blue/10 text-xs font-bold text-tef-blue">
                              {i + 1}
                            </span>
                            <span className="flex-1 truncate group-hover:underline">{s.title}</span>
                            {s.isFree && (
                              <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                Gratuite
                              </span>
                            )}
                            <span className="shrink-0 text-tef-blue opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </Link>
                        )
                      })
                    )}
                  </div>

                  {/* ── Voir plus / Voir moins ── */}
                  {hiddenCount > 0 && (
                    <div className="px-5 pb-3 pt-1 border-t border-gray-100">
                      <button
                        onClick={() =>
                          setExpandedModules((prev) => ({ ...prev, [code]: !isExpanded }))
                        }
                        className="text-xs text-tef-blue hover:underline font-medium"
                      >
                        {isExpanded
                          ? '▲ Voir moins'
                          : `▼ Voir plus (${hiddenCount} série${hiddenCount > 1 ? 's' : ''})`}
                      </button>
                    </div>
                  )}

                  {/* ── Unlock CTA ── */}
                  {lockedCount > 0 && (
                    <div className="px-5 pb-4 pt-2">
                      <button
                        onClick={() =>
                          openUpgrade(
                            `Accédez à toutes les séries du module ${sampleModule?.name ?? code} avec un abonnement.`
                          )
                        }
                        className="w-full text-xs py-2 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-tef-blue hover:text-tef-blue transition-colors"
                      >
                        🔓 Débloquer {lockedCount} série{lockedCount > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Upgrade CTA for non-ALL users */}
        {accessLevel !== 'ALL' && (
          <section className="bg-gradient-to-r from-tef-blue to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">
                  {accessLevel === 'FREE'
                    ? 'Accédez à tous les modules TEF Canada'
                    : 'Accédez aux modules CE et CO'}
                </p>
                <p className="text-blue-200 text-sm">
                  {accessLevel === 'FREE'
                    ? 'Débloquez les 4 modules CE, CO, EE et EO avec corrections par IA illimitées.'
                    : 'Complétez votre préparation avec Compréhension Écrite et Orale.'}
                </p>
              </div>
              <button
                onClick={() =>
                  openUpgrade('Choisissez le pack qui correspond à votre préparation.')
                }
                className="flex-shrink-0 px-6 py-3 bg-white text-tef-blue font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Voir les packs
              </button>
            </div>
          </section>
        )}

        {/* Recent attempts */}
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
                            <span className="font-semibold text-tef-blue">
                              {attempt.score}/40
                            </span>
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

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />
    </div>
  )
}

// ─── Default export wrapped in Suspense (required for useSearchParams) ───────

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-400">Chargement…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
