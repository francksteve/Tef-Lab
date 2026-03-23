'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModuleStat {
  code: string
  name: string
  attempts: number
  avgScore: number | null
  bestCecrl: string
}

interface WeekPoint {
  date: string
  ce: number | null
  co: number | null
  ee: number | null
  eo: number | null
}

interface CecrlBucket {
  level: string
  count: number
}

interface RecentAttempt {
  id: string
  moduleCode: string
  moduleName: string
  seriesTitle: string
  score: number | null
  cecrlLevel: string | null
  completedAt: string
}

interface Subscription {
  packName: string
  expiresAt: string
  daysLeft: number
  moduleAccess: string
}

interface Stats {
  summary: {
    totalAttempts: number
    avgScorePercent: number
    topLevel: string
    totalMinutes: number
  }
  moduleStats: ModuleStat[]
  scoreEvolution: WeekPoint[]
  cecrlDistribution: CecrlBucket[]
  recentAttempts: RecentAttempt[]
  subscription: Subscription | null
}

// ─── Colour constants ─────────────────────────────────────────────────────────
const MODULE_COLORS: Record<string, string> = {
  CE: '#003087',
  CO: '#0055B3',
  EE: '#E30613',
  EO: '#f97316',
}

const CECRL_COLORS: Record<string, string> = {
  A1: '#ef4444', A2: '#f97316',
  B1: '#eab308', B2: '#22c55e',
  C1: '#0055B3', C2: '#003087',
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function ScoreBar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-gray-400 text-sm">—</span>
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{value}%</span>
    </div>
  )
}

function CecrlBadge({ level }: { level: string }) {
  if (!level || level === '—')
    return <span className="text-xs text-gray-400">—</span>
  const bg = CECRL_COLORS[level] ?? '#6b7280'
  return (
    <span
      className="inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white"
      style={{ background: bg }}
    >
      {level}
    </span>
  )
}

function ModuleIcon({ code }: { code: string }) {
  const icons: Record<string, string> = { CE: '📖', CO: '🎧', EE: '✏️', EO: '🎤' }
  return <span>{icons[code] ?? '📘'}</span>
}

// Custom Recharts tooltip
function CustomLineTooltip({ active, payload, label }: {
  active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">Semaine du {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name.toUpperCase()} :</span>
          <span className="font-bold">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stats/subscriber')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setStats(data)
      })
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-tef-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de vos statistiques…</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 font-medium">{error || 'Impossible de charger les statistiques.'}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-tef-blue underline text-sm">
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  const { summary, moduleStats, scoreEvolution, cecrlDistribution, recentAttempts, subscription } = stats

  // Radar data — modules with ≥1 attempt
  const radarData = moduleStats
    .filter((m) => m.avgScore != null)
    .map((m) => ({ module: m.code, score: m.avgScore ?? 0, fullMark: 100 }))

  // Bar data for attempts
  const barData = moduleStats.map((m) => ({
    module: m.code,
    tentatives: m.attempts,
    fill: MODULE_COLORS[m.code] ?? '#6b7280',
  }))

  // Pie data — only non-zero levels
  const pieData = cecrlDistribution.filter((d) => d.count > 0)

  const hasAnyData = summary.totalAttempts > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord Performance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Suivi de votre progression sur tous les modules TEF</p>
        </div>
        {subscription && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
            subscription.daysLeft <= 3
              ? 'bg-red-50 border-red-200 text-red-700'
              : subscription.daysLeft <= 7
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <span>{subscription.daysLeft <= 7 ? '⚠️' : '✅'}</span>
            <span>
              Pack <strong>{subscription.packName}</strong> — {subscription.daysLeft}j restant{subscription.daysLeft > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {!subscription && (
          <Link
            href="/packs"
            className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-xl hover:bg-tef-blue-hover transition-colors"
          >
            Activer un pack →
          </Link>
        )}
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: '📝',
            label: 'Séries complétées',
            value: summary.totalAttempts.toString(),
            sub: 'tous modules',
            color: 'from-blue-50 to-blue-100 border-blue-200',
            textColor: 'text-tef-blue',
          },
          {
            icon: '🎯',
            label: 'Score moyen',
            value: summary.totalAttempts > 0 ? `${summary.avgScorePercent}%` : '—',
            sub: 'toutes séries',
            color: 'from-green-50 to-green-100 border-green-200',
            textColor: 'text-green-700',
          },
          {
            icon: '🏆',
            label: 'Meilleur niveau',
            value: summary.topLevel,
            sub: 'CECRL atteint',
            color: 'from-purple-50 to-purple-100 border-purple-200',
            textColor: 'text-purple-700',
          },
          {
            icon: '⏱️',
            label: 'Temps pratiqué',
            value: summary.totalMinutes >= 60
              ? `${Math.floor(summary.totalMinutes / 60)}h${summary.totalMinutes % 60 > 0 ? String(summary.totalMinutes % 60).padStart(2, '0') : ''}`
              : `${summary.totalMinutes}min`,
            sub: 'total cumulé',
            color: 'from-orange-50 to-orange-100 border-orange-200',
            textColor: 'text-orange-600',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border rounded-2xl p-4 space-y-1`}
          >
            <div className="text-2xl">{card.icon}</div>
            <div className={`text-2xl font-extrabold ${card.textColor}`}>{card.value}</div>
            <div className="text-xs font-semibold text-gray-700">{card.label}</div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </div>
        ))}
      </div>

      {!hasAnyData && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center space-y-3">
          <div className="text-4xl">🚀</div>
          <h3 className="font-extrabold text-gray-800 text-lg">Commencez votre préparation !</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Passez votre première série pour voir vos statistiques de performance apparaître ici.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-tef-blue text-white font-semibold text-sm rounded-xl hover:bg-tef-blue-hover transition-colors"
          >
            Voir les séries →
          </Link>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* ── Module performance table + radar ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-extrabold text-gray-900">Performance par module</h2>
                <p className="text-xs text-gray-400 mt-0.5">Score moyen normalisé sur 100</p>
              </div>
              <div className="divide-y divide-gray-50">
                {moduleStats.map((m) => (
                  <div key={m.code} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ModuleIcon code={m.code} />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.attempts} tentative{m.attempts > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <CecrlBadge level={m.bestCecrl} />
                    </div>
                    <ScoreBar value={m.avgScore} />
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Radar de compétences</h2>
              <p className="text-xs text-gray-400 mb-4">Vue synthétique des 4 modules</p>
              {radarData.length >= 1 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="module"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Score moyen"
                      dataKey="score"
                      stroke="#003087"
                      fill="#003087"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                    <Tooltip
                      formatter={(v: unknown) => [`${v ?? 0}%`, 'Score moyen']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
                  Pas encore de données radar
                </div>
              )}
            </div>
          </div>

          {/* ── Score evolution line chart ────────────────────────────── */}
          {scoreEvolution.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Évolution des scores</h2>
              <p className="text-xs text-gray-400 mb-4">Score moyen par semaine (90 derniers jours)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scoreEvolution} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(d: string) => {
                      const date = new Date(d)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(v: number) => `${v}%`}
                    width={40}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend
                    formatter={(value: string) => value.toUpperCase()}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  {(['ce', 'co', 'ee', 'eo'] as const).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={MODULE_COLORS[key.toUpperCase()]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Attempts by module + CECRL distribution ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Bar chart — attempts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Activité par module</h2>
              <p className="text-xs text-gray-400 mb-4">Nombre de séries passées</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="module" tick={{ fontSize: 13, fontWeight: 700, fill: '#374151' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} width={28} />
                  <Tooltip
                    formatter={(v: unknown) => [String(v ?? 0), 'Tentatives']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                  />
                  <Bar dataKey="tentatives" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie — CECRL distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Distribution CECRL</h2>
              <p className="text-xs text-gray-400 mb-4">Répartition des niveaux obtenus</p>
              {pieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="count"
                        nameKey="level"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={CECRL_COLORS[entry.level] ?? '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: unknown, n: unknown) => [String(v ?? 0), `Niveau ${String(n)}`]}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1">
                    {pieData.map((d) => (
                      <div key={d.level} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: CECRL_COLORS[d.level] ?? '#6b7280' }}
                        />
                        <span className="font-bold text-gray-700">{d.level}</span>
                        <span className="text-gray-400 ml-auto">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Aucun niveau enregistré
                </div>
              )}
            </div>
          </div>

          {/* ── Recent activity ───────────────────────────────────────── */}
          {recentAttempts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-gray-900">Activité récente</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Vos 8 dernières séries</p>
                </div>
                <Link
                  href="/dashboard"
                  className="text-xs text-tef-blue hover:underline font-medium"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAttempts.map((a) => {
                  const dateStr = new Date(a.completedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })
                  return (
                    <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                        style={{ background: MODULE_COLORS[a.moduleCode] ?? '#6b7280' }}
                      >
                        {a.moduleCode}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.seriesTitle}</p>
                        <p className="text-xs text-gray-400">{a.moduleName} · {dateStr}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {a.score != null && (
                          <span className="text-sm font-bold text-gray-700">{a.score}%</span>
                        )}
                        {a.cecrlLevel && <CecrlBadge level={a.cecrlLevel} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
