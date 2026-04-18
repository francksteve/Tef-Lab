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

const moduleGradients: Record<string, string> = {
  CE: 'from-blue-600 to-blue-500',
  CO: 'from-purple-600 to-purple-500',
  EE: 'from-emerald-600 to-emerald-500',
  EO: 'from-orange-500 to-amber-500',
}

const moduleAccentColors: Record<string, { ring: string; chip: string; chipText: string; chipHover: string; doneChip: string; doneText: string; iconBg: string; pillBg: string; pillText: string }> = {
  CE: { ring: 'ring-blue-200', chip: 'border-gray-200 hover:border-blue-400 hover:text-blue-700', chipText: 'text-gray-700', chipHover: '', doneChip: 'bg-blue-50 border-blue-300 text-blue-800', doneText: 'text-blue-800', iconBg: 'bg-blue-600', pillBg: 'bg-blue-100', pillText: 'text-blue-700' },
  CO: { ring: 'ring-purple-200', chip: 'border-gray-200 hover:border-purple-400 hover:text-purple-700', chipText: 'text-gray-700', chipHover: '', doneChip: 'bg-purple-50 border-purple-300 text-purple-800', doneText: 'text-purple-800', iconBg: 'bg-purple-600', pillBg: 'bg-purple-100', pillText: 'text-purple-700' },
  EE: { ring: 'ring-emerald-200', chip: 'border-gray-200 hover:border-emerald-400 hover:text-emerald-700', chipText: 'text-gray-700', chipHover: '', doneChip: 'bg-emerald-50 border-emerald-300 text-emerald-800', doneText: 'text-emerald-800', iconBg: 'bg-emerald-600', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700' },
  EO: { ring: 'ring-orange-200', chip: 'border-gray-200 hover:border-orange-400 hover:text-orange-700', chipText: 'text-gray-700', chipHover: '', doneChip: 'bg-orange-50 border-orange-300 text-orange-800', doneText: 'text-orange-800', iconBg: 'bg-orange-500', pillBg: 'bg-orange-100', pillText: 'text-orange-700' },
}

const moduleDescriptions: Record<string, string> = {
  CE: '40 questions · 60 min · Documents, textes lacunaires, articles',
  CO: '40 questions · 40 min · Annonces, répondeurs, chroniques, interviews',
  EE: '2 tâches · 60 min · Article (80 mots) + Lettre (200 mots)',
  EO: '2 sections · 15 min · Dialogue formel + Présentation informelle',
}

const CECRL_COLORS: Record<string, string> = {
  A1: 'bg-red-100 text-red-700',
  A2: 'bg-orange-100 text-orange-700',
  B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-green-100 text-green-700',
  C1: 'bg-blue-100 text-blue-700',
  C2: 'bg-purple-100 text-purple-700',
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
      return { label: '✦ Accès complet', color: 'bg-white/20 text-white border border-white/30' }
    case 'EE_EO':
      return { label: '⚡ Pack Special', color: 'bg-white/20 text-white border border-white/30' }
    default:
      return { label: '🆓 Compte gratuit', color: 'bg-white/15 text-blue-100 border border-white/20' }
  }
}

const moduleOrder = ['CE', 'CO', 'EE', 'EO']
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

  const isPaymentReturn = useRef(searchParams.get('payment') === 'success')
  const loadedAccessLevel = useRef<AccessLevel>('FREE')
  const paymentHandled = useRef(false)

  useEffect(() => {
    if (!isPaymentReturn.current) return
    setPaymentBanner('pending')
    router.replace('/dashboard', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/connexion'); return }
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

  useEffect(() => {
    if (loading) return
    if (!isPaymentReturn.current) return
    if (paymentHandled.current) return
    paymentHandled.current = true

    if (loadedAccessLevel.current !== 'FREE') {
      setPaymentBanner('success')
      const t = setTimeout(() => setPaymentBanner(null), 7000)
      return () => clearTimeout(t)
    }

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
            setAccessLevel(data.accessLevel)
            setPaymentBanner('success')
            setTimeout(() => { if (!cancelled) setPaymentBanner(null) }, 7000)
          } else if (count < 8) {
            setTimeout(poll, 1000)
          } else {
            setPaymentBanner('success')
            setTimeout(() => { if (!cancelled) setPaymentBanner(null) }, 10000)
          }
        })
        .catch(() => { if (!cancelled && count < 8) setTimeout(poll, 1000) })
    }
    setTimeout(poll, 800)
    return () => { cancelled = true }
  }, [loading])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-tef-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    )
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Candidat'
  const badge = getAccessBadge(accessLevel)
  const isAdmin = session?.user?.role === 'ADMIN'

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
  const attemptedSeriesTitles = new Set(attempts.map((a) => a.series.title))

  // Quick stats derived from attempts
  const totalAttempts = attempts.length
  const bestLevel = (() => {
    const levels = ['C2','C1','B2','B1','A2','A1']
    for (const l of levels) {
      if (attempts.some((a) => a.cecrlLevel === l)) return l
    }
    return null
  })()

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
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">Confirmation du paiement en cours…</p>
          </div>
        </div>
      )}
      {paymentBanner === 'success' && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg flex-shrink-0">✅</span>
              <p className="text-sm text-emerald-800 font-semibold">
                Paiement confirmé ! Votre abonnement est maintenant actif. Bonne préparation 🎯
              </p>
            </div>
            <button onClick={() => setPaymentBanner(null)} className="text-emerald-400 hover:text-emerald-600 text-xl leading-none flex-shrink-0">×</button>
          </div>
        </div>
      )}

      {/* ─── Hero header ─── */}
      <div className="bg-gradient-to-br from-tef-blue via-blue-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: greeting */}
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Mon espace TEF</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Bonjour, {firstName} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-1.5">
                Continuez votre préparation au TEF Canada — chaque série compte !
              </p>
            </div>
            {/* Right: badges */}
            {!isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
                  {badge.label}
                </span>
                {daysLeft !== null && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    daysLeft > 6 ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/40' : 'bg-red-500/25 text-red-100 border border-red-400/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${daysLeft > 6 ? 'bg-emerald-300' : 'bg-red-300'}`} />
                    {daysLeft}j restants
                  </span>
                )}
                {accessLevel !== 'ALL' && (
                  <button
                    onClick={() => openUpgrade('Accédez à plus de séries et de corrections IA.')}
                    className="px-4 py-1.5 bg-white text-tef-blue font-bold rounded-full text-xs hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    Mettre à niveau →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick stats strip ── */}
        {!isAdmin && (
          <div className="border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-3 sm:grid-cols-3 divide-x divide-white/10">
              {[
                { icon: '📝', label: 'Séries passées', value: totalAttempts > 0 ? String(totalAttempts) : '—' },
                { icon: '🏆', label: 'Meilleur niveau', value: bestLevel ?? '—' },
                { icon: packName ? '⚡' : '🆓', label: 'Pack actif', value: packName ?? 'Gratuit' },
              ].map((stat) => (
                <div key={stat.label} className="py-3 px-3 sm:px-5 text-center">
                  <div className="text-base font-extrabold text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] text-blue-300 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ─── Subscription alert ─── */}
        {!isAdmin && daysLeft !== null && daysLeft <= 5 && packName && (
          <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">Pack <span className="text-red-600">{packName}</span> — expire bientôt</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expire le {new Date(expiresAt!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {daysLeft}j restants
                </p>
              </div>
            </div>
            <button
              onClick={() => openUpgrade('Renouvelez votre pack pour continuer votre préparation.')}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Renouveler →
            </button>
          </div>
        )}

        {/* ─── Modules ─── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-gray-900">Les 4 modules TEF Canada</h2>
            <Link href="/dashboard/performance" className="text-xs text-tef-blue hover:underline font-medium flex items-center gap-1">
              📊 Voir mes stats
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moduleOrder.map((code) => {
              const moduleSeries = sortSeriesByOrder(seriesByModule[code] ?? [])
              const sampleModule = moduleSeries[0]?.module
              const acc = moduleAccentColors[code] ?? moduleAccentColors.CE
              const gradient = moduleGradients[code] ?? 'from-gray-600 to-gray-500'
              const lockedCount = moduleSeries.filter((s) => isSeriesLocked(s, accessLevel)).length
              const unlockedCount = moduleSeries.length - lockedCount
              const isExpanded = expandedModules[code] ?? false
              const visibleSeries = isExpanded ? moduleSeries : moduleSeries.slice(0, SERIES_PAGE_SIZE)
              const hiddenCount = moduleSeries.length - SERIES_PAGE_SIZE
              const passedCount = moduleSeries.filter((s) => attemptedSeriesTitles.has(s.title)).length

              return (
                <div
                  key={code}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ring-1 ${acc.ring} hover:shadow-md transition-shadow`}
                >
                  {/* ── Gradient header ── */}
                  <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}>
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      {moduleIcons[code]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-white text-base leading-tight">{sampleModule?.name ?? code}</h3>
                      <p className="text-white/70 text-[11px] mt-0.5 leading-snug">{moduleDescriptions[code]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-extrabold text-lg leading-none">{passedCount}</div>
                      <div className="text-white/60 text-[10px]">/{moduleSeries.length} faites</div>
                    </div>
                  </div>

                  {/* ── Progress bar ── */}
                  {moduleSeries.length > 0 && (
                    <div className="h-1 bg-gray-100">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} transition-all`}
                        style={{ width: `${(passedCount / moduleSeries.length) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* ── Series chips ── */}
                  <div className="px-4 py-3 flex-1">
                    {moduleSeries.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-1">Aucune série disponible</p>
                    ) : (
                      <>
                        <div className="flex flex-row flex-wrap gap-1.5">
                          {visibleSeries.map((s, i) => {
                            const locked = isSeriesLocked(s, accessLevel)
                            const shortLabel = `${code} ${i + 1}`
                            if (locked) {
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => openUpgrade(`La série "${s.title}" nécessite un abonnement.`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <span className="font-semibold">{shortLabel}</span>
                                  <span className="text-[10px]">🔒</span>
                                </button>
                              )
                            }
                            const attempted = attemptedSeriesTitles.has(s.title)
                            return (
                              <Link
                                key={s.id}
                                href={getSeriesLink(s)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all font-medium group ${
                                  attempted
                                    ? `${acc.doneChip} border-current/30`
                                    : `bg-white ${acc.chip} text-gray-700`
                                }`}
                              >
                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
                                  attempted ? acc.iconBg + ' text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {attempted ? '✓' : i + 1}
                                </span>
                                <span>{shortLabel}</span>
                                {s.isFree && !attempted && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${acc.pillBg} ${acc.pillText} font-semibold`}>
                                    Gratuit
                                  </span>
                                )}
                              </Link>
                            )
                          })}
                        </div>

                        {/* Voir plus/moins */}
                        {hiddenCount > 0 && (
                          <button
                            onClick={() => setExpandedModules((prev) => ({ ...prev, [code]: !isExpanded }))}
                            className={`mt-2 text-xs font-medium ${acc.pillText} hover:underline`}
                          >
                            {isExpanded ? '▲ Voir moins' : `▼ +${hiddenCount} série${hiddenCount > 1 ? 's' : ''}`}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* ── Stat footer ── */}
                  <div className="px-4 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${acc.pillBg} ${acc.pillText}`}>
                        {unlockedCount} accessible{unlockedCount !== 1 ? 's' : ''}
                      </span>
                      {lockedCount > 0 && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          🔒 {lockedCount}
                        </span>
                      )}
                    </div>
                    {lockedCount > 0 && (
                      <button
                        onClick={() => openUpgrade(`Accédez à toutes les séries ${sampleModule?.name ?? code} avec un abonnement.`)}
                        className={`text-[11px] font-bold ${acc.pillText} hover:underline`}
                      >
                        Débloquer →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Upgrade CTA ─── */}
        {accessLevel !== 'ALL' && !isAdmin && (
          <section className="relative overflow-hidden bg-gradient-to-r from-tef-blue via-blue-700 to-blue-800 rounded-2xl p-6 text-white">
            {/* decorative circles */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-base font-extrabold mb-1">
                  {accessLevel === 'FREE' ? '🚀 Accédez aux 4 modules TEF Canada' : '📖🎧 Ajoutez CE et CO à votre préparation'}
                </p>
                <p className="text-blue-200 text-sm">
                  {accessLevel === 'FREE'
                    ? 'Débloquez CE, CO, EE et EO avec corrections IA personnalisées.'
                    : 'Complétez votre préparation avec Compréhension Écrite et Orale.'}
                </p>
              </div>
              <button
                onClick={() => openUpgrade('Choisissez le pack qui correspond à votre préparation.')}
                className="flex-shrink-0 px-6 py-2.5 bg-white text-tef-blue font-extrabold rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm"
              >
                Voir les packs →
              </button>
            </div>
          </section>
        )}

        {/* ─── Recent attempts ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">Historique de vos passages</h2>
            {recentAttempts.length > 0 && (
              <Link href="/dashboard/performance" className="text-xs text-tef-blue hover:underline font-medium">
                Voir tout →
              </Link>
            )}
          </div>

          {recentAttempts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">📝</div>
              <p className="font-bold text-gray-700">Aucune série passée pour l&apos;instant</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">Lancez-vous sur une série gratuite et commencez à voir vos résultats ici !</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Mobile cards */}
              <div className="divide-y divide-gray-50 sm:hidden">
                {recentAttempts.map((attempt) => {
                  const acc = moduleAccentColors[attempt.moduleCode] ?? moduleAccentColors.CE
                  const cecrlColor = CECRL_COLORS[attempt.cecrlLevel ?? ''] ?? 'bg-gray-100 text-gray-600'
                  return (
                    <div key={attempt.id} className="px-4 py-3.5 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 bg-gradient-to-br ${moduleGradients[attempt.moduleCode] ?? 'from-gray-500 to-gray-600'}`}>
                        {attempt.moduleCode}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{attempt.series.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {attempt.timeTaken ? formatTime(attempt.timeTaken) : ''} · {new Date(attempt.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {attempt.score != null && (
                          <span className={`text-xs font-extrabold ${acc.pillText}`}>{attempt.score}/40</span>
                        )}
                        {attempt.aiScore != null && attempt.score == null && (
                          <span className="text-xs font-extrabold text-emerald-700">{Math.round(attempt.aiScore)}/100</span>
                        )}
                        {attempt.cecrlLevel && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cecrlColor}`}>{attempt.cecrlLevel}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Module', 'Série', 'Score', 'Niveau', 'Temps', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentAttempts.map((attempt) => {
                      const acc = moduleAccentColors[attempt.moduleCode] ?? moduleAccentColors.CE
                      const cecrlColor = CECRL_COLORS[attempt.cecrlLevel ?? ''] ?? 'bg-gray-100 text-gray-600'
                      return (
                        <tr key={attempt.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${acc.pillBg}`}>
                              <span className="text-sm">{moduleIcons[attempt.moduleCode] ?? '📝'}</span>
                              <span className={`text-xs font-extrabold ${acc.pillText}`}>{attempt.moduleCode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{attempt.series.title}</td>
                          <td className="px-4 py-3">
                            {attempt.score != null ? (
                              <span className={`font-extrabold ${acc.pillText}`}>{attempt.score}/40</span>
                            ) : attempt.aiScore != null ? (
                              <span className="font-extrabold text-emerald-600">{Math.round(attempt.aiScore)}/100</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {attempt.cecrlLevel ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${cecrlColor}`}>
                                {attempt.cecrlLevel}
                              </span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs font-medium">
                            {attempt.timeTaken ? formatTime(attempt.timeTaken) : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs font-medium">
                            {new Date(attempt.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-tef-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Chargement…</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
