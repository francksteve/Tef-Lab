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
  aiScore?: number | null
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
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [packName, setPackName] = useState<string | null>(null)
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
        setExpiresAt(sub?.subscription?.expiresAt ?? null)
        setPackName(sub?.subscription?.pack?.name ?? null)
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

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
    : null

  const seriesByModule: Record<string, Series[]> = {}
  series.forEach((s) => {
    const code = s.module.code
    if (!seriesByModule[code]) seriesByModule[code] = []
    seriesByModule[code].push(s)
  })

  const recentAttempts = attempts.slice(0, 10)

  // Set of series titles the user has already passed (for highlighting)
  const attemptedSeriesTitles = new Set(attempts.map((a) => a.series.title))

  // Sort series by the trailing number in their title (CE Série 1 → 1, CE Série 12 → 12)
  const sortSeriesByOrder = (arr: Series[]): Series[] =>
    [...arr].sort((a, b) => {
      const numA = parseInt(a.title.match(/(\d+)\s*$/)?.[1] ?? '0')
      const numB = parseInt(b.title.match(/(\d+)\s*$/)?.[1] ?? '0')
      return numA - numB
    })

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
      <div className="bg-tef-blue text-white px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Greeting */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">Bonjour {firstName} 👋</h1>
            <p className="text-blue-200 text-sm mt-1">
              Prépare le TEF Canada avec tes séries d&apos;entraînement personnalisées.
            </p>
          </div>

          {/* Status badges + CTA — uniform row on mobile */}
          {session?.user?.role !== 'ADMIN' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
                {badge.label}
              </span>
              {daysLeft !== null && (
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    daysLeft > 6
                      ? 'bg-green-500/20 text-green-100 ring-1 ring-green-400/40'
                      : 'bg-red-500/20 text-red-100 ring-1 ring-red-400/40'
                  }`}
                >
                  <span>{daysLeft > 6 ? '🟢' : '🔴'}</span>
                  {daysLeft}j restants
                </span>
              )}
              {accessLevel !== 'ALL' && (
                <button
                  onClick={() => openUpgrade('Accédez à plus de séries et de corrections IA.')}
                  className="px-4 py-1.5 bg-white text-tef-blue font-bold rounded-full text-xs hover:bg-blue-50 transition-colors"
                >
                  Mettre à niveau →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ─── Subscription status card ─── */}
        {session?.user?.role !== 'ADMIN' && daysLeft !== null && packName && expiresAt && (
          <div className={`rounded-xl px-4 py-3 border flex flex-wrap items-center justify-between gap-3 ${
            daysLeft > 6
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{daysLeft > 6 ? '✅' : '⚠️'}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">Pack <span className="text-tef-blue">{packName}</span> actif</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expire le {new Date(expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              daysLeft > 6
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {daysLeft}j restants
            </span>
          </div>
        )}

        {/* Modules */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Les 4 modules TEF Canada</h2>
          <div className="grid grid-cols-1 gap-4">
            {moduleOrder.map((code) => {
              const moduleSeries = sortSeriesByOrder(seriesByModule[code] ?? [])
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
                  <div className={`${moduleHeaderColors[code] ?? 'bg-gray-50'} px-4 sm:px-5 pt-3 pb-3 flex items-center gap-3`}>
                    <span className="text-2xl sm:text-3xl leading-none">{moduleIcons[code]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                        {sampleModule?.name ?? code}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">
                          {unlockedCount} accessible{unlockedCount !== 1 ? 's' : ''}
                        </span>
                        {lockedCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-400">
                            🔒 {lockedCount} verrouillée{lockedCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Series list — compact chips ── */}
                  <div className="px-4 sm:px-5 py-3 flex-1">
                    {moduleSeries.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Aucune série disponible</p>
                    ) : (
                      <div className="flex flex-row flex-wrap gap-1.5 sm:gap-2">
                        {visibleSeries.map((s, i) => {
                          const locked = isSeriesLocked(s, accessLevel)
                          // Extract short label: "CE 1", "CO 12", etc.
                          const shortLabel = `${code} ${i + 1}`
                          if (locked) {
                            return (
                              <button
                                key={s.id}
                                onClick={() =>
                                  openUpgrade(
                                    `La série "${s.title}" nécessite un abonnement pour y accéder.`
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="font-semibold">{shortLabel}</span>
                                <span className="text-[10px] flex-shrink-0">🔒</span>
                              </button>
                            )
                          }
                          const attempted = attemptedSeriesTitles.has(s.title)
                          return (
                            <Link
                              key={s.id}
                              href={getSeriesLink(s)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors group ${
                                attempted
                                  ? 'text-green-800 bg-green-50 border border-green-300 hover:border-green-500 hover:bg-green-100 font-semibold'
                                  : 'text-gray-800 bg-white border border-gray-200 hover:border-tef-blue hover:text-tef-blue font-medium'
                              }`}
                            >
                              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
                                attempted ? 'bg-green-500 text-white' : 'bg-tef-blue text-white'
                              }`}>
                                {i + 1}
                              </span>
                              <span>{shortLabel}</span>
                              {attempted && (
                                <span className="text-green-600 flex-shrink-0 text-[10px] font-bold">✓</span>
                              )}
                              {s.isFree && !attempted && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                                  Gratuite
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Voir plus / Voir moins ── */}
                  {hiddenCount > 0 && (
                    <div className="px-4 sm:px-5 pb-2 pt-1 border-t border-gray-100">
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
                    <div className="px-4 sm:px-5 pb-3 pt-1">
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

        {/* Upgrade CTA for non-ALL users (not shown for admin) */}
        {accessLevel !== 'ALL' && session?.user?.role !== 'ADMIN' && (
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
                            // CE / CO — score entier /40
                            <span className="font-semibold text-tef-blue">
                              {attempt.score}/40
                            </span>
                          ) : attempt.aiScore !== null && attempt.aiScore !== undefined ? (
                            // EE / EO — score IA /100
                            <span className="font-semibold text-green-600">
                              {Math.round(attempt.aiScore)}/100
                            </span>
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
