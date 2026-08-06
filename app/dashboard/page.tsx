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

const moduleGradients: Record<string, string> = {
  CE: 'from-tef-blue to-tef-night',
  CO: 'from-tef-blue to-tef-night',
  EE: 'from-tef-blue to-tef-night',
  EO: 'from-tef-blue to-tef-night',
}

const moduleAccent: Record<string, { ring: string; pillBg: string; pillText: string; chipHover: string }> = {
  CE: { ring: 'ring-blue-100', pillBg: 'bg-tef-blue/10', pillText: 'text-tef-blue', chipHover: 'hover:border-tef-blue hover:text-tef-blue' },
  CO: { ring: 'ring-blue-100', pillBg: 'bg-tef-blue/10', pillText: 'text-tef-blue', chipHover: 'hover:border-tef-blue hover:text-tef-blue' },
  EE: { ring: 'ring-blue-100', pillBg: 'bg-tef-blue/10', pillText: 'text-tef-blue', chipHover: 'hover:border-tef-blue hover:text-tef-blue' },
  EO: { ring: 'ring-blue-100', pillBg: 'bg-tef-blue/10', pillText: 'text-tef-blue', chipHover: 'hover:border-tef-blue hover:text-tef-blue' },
}

const moduleDescriptions: Record<string, string> = {
  CE: '40 questions · 60 min · Documents, textes lacunaires, articles',
  CO: '40 questions · 40 min · Annonces, répondeurs, chroniques, interviews',
  EE: '2 tâches · 60 min · Article (80 mots) + Lettre (200 mots)',
  EO: '2 sections · 15 min · Dialogue formel + Présentation informelle',
}

const CECRL_COLORS: Record<string, string> = {
  A1: 'bg-red-100 text-red-700',
  A2: 'bg-red-100 text-red-600',
  B1: 'bg-blue-100 text-blue-600',
  B2: 'bg-blue-200 text-blue-800',
  C1: 'bg-tef-blue/20 text-tef-blue',
  C2: 'bg-blue-900 text-white',
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
      return { label: 'Accès complet', color: 'bg-white/20 text-white border border-white/30' }
    case 'EE_EO':
      return { label: 'Pack Special', color: 'bg-white/20 text-white border border-white/30' }
    default:
      return { label: 'Compte gratuit', color: 'bg-white/15 text-white/80 border border-white/20' }
  }
}

const moduleOrder = ['CE', 'CO', 'EE', 'EO']
const SERIES_PAGE_SIZE = 10
const HISTORY_PAGE_SIZE = 10

function LockIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

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
  const [historyPage, setHistoryPage] = useState(0)

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

  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const totalHistoryPages = Math.ceil(sortedAttempts.length / HISTORY_PAGE_SIZE)
  const pagedAttempts = sortedAttempts.slice(
    historyPage * HISTORY_PAGE_SIZE,
    (historyPage + 1) * HISTORY_PAGE_SIZE
  )
  const attemptedSeriesTitles = new Set(attempts.map((a) => a.series.title))

  const totalAttempts = attempts.length
  const bestLevel = (() => {
    const levels = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']
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
      {/* ─── Banners paiement ─── */}
      {paymentBanner === 'pending' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">Confirmation du paiement en cours…</p>
          </div>
        </div>
      )}
      {paymentBanner === 'success' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 font-semibold">
                Paiement confirmé — votre abonnement est maintenant actif. Bonne préparation !
              </p>
            </div>
            <button onClick={() => setPaymentBanner(null)} className="text-green-400 hover:text-green-600 text-xl leading-none flex-shrink-0">×</button>
          </div>
        </div>
      )}

      {/* ─── Hero ─── */}
      <div className="bg-tef-night text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.15em] mb-1">Mon espace TEF</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bonjour, {firstName}</h1>
              <p className="text-white/75 text-sm mt-1.5">
                Continuez votre préparation au TEF Canada — chaque série compte.
              </p>
            </div>
            {!isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
                  {badge.label}
                </span>
                {daysLeft !== null && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    daysLeft > 6 ? 'bg-white/10 text-white/80 border border-white/20' : 'bg-red-500/25 text-red-100 border border-red-400/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${daysLeft > 6 ? 'bg-white/60' : 'bg-red-300'}`} />
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

        {/* Stats strip */}
        {!isAdmin && (
          <div className="border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-3 divide-x divide-white/10">
              {[
                { label: 'Séries passées', value: totalAttempts > 0 ? String(totalAttempts) : '—' },
                { label: 'Meilleur niveau', value: bestLevel ?? '—' },
                { label: 'Pack actif', value: packName ?? 'Gratuit' },
              ].map((stat) => (
                <div key={stat.label} className="py-3 px-3 sm:px-5 text-center">
                  <div className="text-base font-black text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] text-white/60 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ─── Alerte expiration ─── */}
        {!isAdmin && daysLeft !== null && daysLeft <= 5 && packName && (
          <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
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
            <h2 className="text-lg font-bold text-gray-900">Les 4 modules TEF Canada</h2>
            <Link href="/dashboard/performance" className="text-xs text-tef-blue hover:underline font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Mes stats
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moduleOrder.map((code) => {
              const moduleSeries = sortSeriesByOrder(seriesByModule[code] ?? [])
              const sampleModule = moduleSeries[0]?.module
              const acc = moduleAccent[code] ?? moduleAccent.CE
              const gradient = moduleGradients[code] ?? 'from-gray-600 to-gray-700'
              const lockedCount = moduleSeries.filter((s) => isSeriesLocked(s, accessLevel)).length
              const unlockedCount = moduleSeries.length - lockedCount
              const isExpanded = expandedModules[code] ?? false
              const visibleSeries = isExpanded ? moduleSeries : moduleSeries.slice(0, SERIES_PAGE_SIZE)
              const hiddenCount = moduleSeries.length - SERIES_PAGE_SIZE
              const passedCount = moduleSeries.filter((s) => attemptedSeriesTitles.has(s.title)).length

              return (
                <div
                  key={code}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ring-1 ${acc.ring} hover:shadow-md transition-shadow`}
                >
                  {/* En-tête gradient */}
                  <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm leading-tight">{sampleModule?.name ?? code}</h3>
                      <p className="text-white/70 text-[11px] mt-0.5 leading-snug">{moduleDescriptions[code]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-black text-lg leading-none">{passedCount}</div>
                      <div className="text-white/60 text-[10px]">/{moduleSeries.length} faites</div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  {moduleSeries.length > 0 && (
                    <div className="h-1 bg-gray-100">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} transition-all`}
                        style={{ width: `${(passedCount / moduleSeries.length) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Chips séries */}
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
                                  <LockIcon className="w-3 h-3" />
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
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : `bg-white border-gray-200 text-gray-700 ${acc.chipHover}`
                                }`}
                              >
                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
                                  attempted ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
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

                  {/* Footer stats */}
                  <div className="px-4 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${acc.pillBg} ${acc.pillText}`}>
                        {unlockedCount} accessible{unlockedCount !== 1 ? 's' : ''}
                      </span>
                      {lockedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                          <LockIcon className="w-2.5 h-2.5" />
                          {lockedCount}
                        </span>
                      )}
                      {passedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {passedCount}
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

        {/* ─── CTA upgrade ─── */}
        {accessLevel !== 'ALL' && !isAdmin && (
          <section className="relative overflow-hidden bg-tef-night rounded-xl p-6 text-white">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-base font-bold mb-1">
                  {accessLevel === 'FREE' ? 'Accédez aux 4 modules TEF Canada' : 'Ajoutez CE et CO à votre préparation'}
                </p>
                <p className="text-white/70 text-sm">
                  {accessLevel === 'FREE'
                    ? 'Débloquez CE, CO, EE et EO avec corrections IA personnalisées.'
                    : 'Complétez votre préparation avec Compréhension Écrite et Orale.'}
                </p>
              </div>
              <button
                onClick={() => openUpgrade('Choisissez le pack qui correspond à votre préparation.')}
                className="flex-shrink-0 px-6 py-2.5 bg-tef-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Voir les packs →
              </button>
            </div>
          </section>
        )}

        {/* ─── Historique ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historique de vos passages</h2>
              {sortedAttempts.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {sortedAttempts.length} passage{sortedAttempts.length > 1 ? 's' : ''} au total · du plus récent au plus ancien
                </p>
              )}
            </div>
            {sortedAttempts.length > 0 && (
              <Link href="/dashboard/performance" className="text-xs text-tef-blue hover:underline font-medium">
                Mes stats →
              </Link>
            )}
          </div>

          {sortedAttempts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="font-bold text-gray-700">Aucune série passée pour l&apos;instant</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">Lancez-vous sur une série gratuite et commencez à voir vos résultats ici.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Mobile */}
              <div className="divide-y divide-gray-50 sm:hidden">
                {pagedAttempts.map((attempt) => {
                  const acc = moduleAccent[attempt.moduleCode] ?? moduleAccent.CE
                  const cecrlColor = CECRL_COLORS[attempt.cecrlLevel ?? ''] ?? 'bg-gray-100 text-gray-600'
                  return (
                    <div key={attempt.id} className="px-4 py-3.5 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0 bg-gradient-to-br ${moduleGradients[attempt.moduleCode] ?? 'from-gray-500 to-gray-600'}`}>
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
                          <span className={`text-xs font-bold ${acc.pillText}`}>{attempt.score}/40</span>
                        )}
                        {attempt.aiScore != null && attempt.score == null && (
                          <span className="text-xs font-bold text-blue-700">{Math.round(attempt.aiScore)}/100</span>
                        )}
                        {attempt.cecrlLevel && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cecrlColor}`}>{attempt.cecrlLevel}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop */}
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
                    {pagedAttempts.map((attempt) => {
                      const acc = moduleAccent[attempt.moduleCode] ?? moduleAccent.CE
                      const cecrlColor = CECRL_COLORS[attempt.cecrlLevel ?? ''] ?? 'bg-gray-100 text-gray-600'
                      return (
                        <tr key={attempt.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${acc.pillBg} ${acc.pillText}`}>
                              {attempt.moduleCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{attempt.series.title}</td>
                          <td className="px-4 py-3">
                            {attempt.score != null ? (
                              <span className={`font-bold ${acc.pillText}`}>{attempt.score}/40</span>
                            ) : attempt.aiScore != null ? (
                              <span className="font-bold text-blue-600">{Math.round(attempt.aiScore)}/100</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {attempt.cecrlLevel ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cecrlColor}`}>
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

              {/* Pagination */}
              {totalHistoryPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
                  <button
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Précédent
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalHistoryPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHistoryPage(i)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          i === historyPage
                            ? 'bg-tef-blue text-white'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={historyPage >= totalHistoryPages - 1}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}
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
