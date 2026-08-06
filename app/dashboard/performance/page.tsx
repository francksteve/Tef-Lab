'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
  BarChart, Bar, Cell,
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

// ─── Constantes palette BVR ───────────────────────────────────────────────────
const MODULE_COLORS: Record<string, string> = {
  CE: '#003087',  // bleu marine
  CO: '#2563eb',  // bleu vif
  EE: '#E30613',  // rouge
  EO: '#ef4444',  // rouge clair
}

const MODULE_LABELS: Record<string, string> = {
  CE: 'Compréhension Écrite',
  CO: 'Compréhension Orale',
  EE: 'Expression Écrite',
  EO: 'Expression Orale',
}

const CECRL_COLORS: Record<string, string> = {
  A1: '#E30613', A2: '#ef4444',
  B1: '#60a5fa', B2: '#2563eb',
  C1: '#003087', C2: '#001344',
}

// Seuil NCLC 7 sur l'échelle 0-100 normalisée (310/450 ≈ 69)
const NCLC7_TARGET = 69

// ─── Composants utilitaires ───────────────────────────────────────────────────

function CecrlBadge({ level }: { level: string }) {
  if (!level || level === '—') return <span className="text-xs text-gray-400">—</span>
  const bg = CECRL_COLORS[level] ?? '#6b7280'
  return (
    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: bg }}>
      {level}
    </span>
  )
}

/** Barre de score avec indicateur de cible NCLC 7 */
function ScoreBar({ value, showTarget = false }: { value: number | null; showTarget?: boolean }) {
  if (value == null) return <span className="text-gray-400 text-sm">—</span>
  const pct = Math.min(value, 100)
  const reachedTarget = value >= NCLC7_TARGET
  return (
    <div className="space-y-1">
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-visible">
        {/* Score fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: reachedTarget ? '#003087' : '#0055B3' }}
        />
        {/* NCLC 7 target marker */}
        {showTarget && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-300 rounded-full"
            style={{ left: `${NCLC7_TARGET}%` }}
            title="Objectif NCLC 7"
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-tef-blue">{value}%</span>
        {showTarget && (
          <span className="text-gray-400">
            {reachedTarget ? '✓ Objectif NCLC 7 atteint' : `${NCLC7_TARGET - value}% avant NCLC 7`}
          </span>
        )}
      </div>
    </div>
  )
}

/** Tooltip personnalisé pour le graphe d'évolution */
function EvolutionTooltip({ active, payload, label, moduleName }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  moduleName: string
}) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const date = label ? new Date(label).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
  return (
    <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-3 text-sm">
      <p className="text-gray-500 mb-1">{date}</p>
      <p className="font-bold text-tef-blue">{moduleName} : {val ?? 0}%</p>
      {val != null && val >= NCLC7_TARGET && (
        <p className="text-tef-blue text-xs mt-0.5">✓ Objectif NCLC 7</p>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeModule, setActiveModule] = useState<'CE' | 'CO' | 'EE' | 'EO'>('CE')

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

  const hasAnyData = summary.totalAttempts > 0

  // Données du module actif pour l'évolution
  const activeKey = activeModule.toLowerCase() as 'ce' | 'co' | 'ee' | 'eo'
  const evolutionData = scoreEvolution
    .filter((p) => p[activeKey] != null)
    .map((p) => ({ date: p.date, score: p[activeKey] as number }))

  // CECRL distribution — total
  const totalCecrl = cecrlDistribution.reduce((s, d) => s + d.count, 0)
  const cecrlLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  // Activité bar chart (tentatives par module)
  const activityData = moduleStats.map((m) => ({
    module: m.code,
    tentatives: m.attempts,
    fill: MODULE_COLORS[m.code] ?? '#6b7280',
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mes performances</h1>
          <p className="text-gray-500 text-sm mt-0.5">Suivi de progression · Objectif NCLC 7</p>
        </div>
        {subscription ? (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
            subscription.daysLeft <= 7
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {subscription.daysLeft <= 7 && (
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            <span>Pack <strong>{subscription.packName}</strong> — {subscription.daysLeft}j restants</span>
          </div>
        ) : (
          <Link href="/packs" className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-xl hover:bg-tef-night transition-colors">
            Activer un pack →
          </Link>
        )}
      </div>

      {/* ── Cartes résumé ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Séries complétées', value: summary.totalAttempts.toString(), sub: 'tous modules', color: 'border-blue-200 bg-blue-50', text: 'text-tef-blue' },
          { label: 'Score moyen', value: summary.totalAttempts > 0 ? `${summary.avgScorePercent}%` : '—', sub: 'toutes séries', color: 'border-blue-200 bg-blue-50', text: 'text-tef-blue' },
          { label: 'Meilleur niveau', value: summary.topLevel || '—', sub: 'CECRL atteint', color: 'border-blue-200 bg-blue-50', text: 'text-tef-blue' },
          {
            label: 'Temps pratiqué',
            value: summary.totalMinutes >= 60
              ? `${Math.floor(summary.totalMinutes / 60)}h${summary.totalMinutes % 60 > 0 ? String(summary.totalMinutes % 60).padStart(2, '0') : ''}`
              : `${summary.totalMinutes}min`,
            sub: 'total cumulé',
            color: 'border-blue-200 bg-blue-50',
            text: 'text-tef-blue',
          },
        ].map((card) => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-4 space-y-1`}>
            <div className={`text-2xl font-extrabold ${card.text}`}>{card.value}</div>
            <div className="text-xs font-semibold text-gray-700">{card.label}</div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Pas encore de données ───────────────────────────────────────────── */}
      {!hasAnyData && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10 text-center space-y-4">
          <h3 className="font-extrabold text-gray-800 text-lg">Commencez votre préparation</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Passez votre première série pour voir vos statistiques et votre progression apparaître ici.
          </p>
          <Link href="/dashboard" className="inline-block px-5 py-2.5 bg-tef-blue text-white font-semibold text-sm rounded-xl hover:bg-tef-night transition-colors">
            Voir les séries →
          </Link>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* ── Performance par module ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-gray-900">Performance par module</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  La barre bleue indique l&apos;objectif NCLC 7 (69%)
                </p>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-4 rounded-sm bg-blue-200 inline-block" />
                Seuil NCLC 7
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {moduleStats.map((m) => (
                <div key={m.code} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                        style={{ background: MODULE_COLORS[m.code] ?? '#6b7280' }}
                      >
                        {m.code}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400">
                          {m.attempts > 0
                            ? `${m.attempts} série${m.attempts > 1 ? 's' : ''} passée${m.attempts > 1 ? 's' : ''}`
                            : 'Aucune série passée'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CecrlBadge level={m.bestCecrl} />
                    </div>
                  </div>
                  {m.avgScore != null ? (
                    <ScoreBar value={m.avgScore} showTarget />
                  ) : (
                    <p className="text-xs text-gray-400 italic">Pas encore de score pour ce module</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Évolution des scores ──────────────────────────────────────────── */}
          {scoreEvolution.length > 0 && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-extrabold text-gray-900">Évolution du score</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Choisissez un module · La ligne pointillée représente l&apos;objectif NCLC 7 (69%)
                  </p>
                </div>
                {/* Sélecteur de module */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start">
                  {(['CE', 'CO', 'EE', 'EO'] as const).map((code) => {
                    const hasData = scoreEvolution.some((p) => p[code.toLowerCase() as keyof WeekPoint] != null)
                    return (
                      <button
                        key={code}
                        onClick={() => setActiveModule(code)}
                        disabled={!hasData}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          activeModule === code
                            ? 'bg-white text-tef-blue shadow-sm'
                            : hasData
                            ? 'text-gray-500 hover:text-gray-700'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {code}
                      </button>
                    )
                  })}
                </div>
              </div>

              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={evolutionData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(d: string) => {
                        const dt = new Date(d)
                        return `${dt.getDate()}/${dt.getMonth() + 1}`
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: number) => `${v}%`}
                      width={38}
                    />
                    {/* Ligne cible NCLC 7 */}
                    <ReferenceLine
                      y={NCLC7_TARGET}
                      stroke="#2563eb"
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'NCLC 7',
                        position: 'right',
                        fill: '#2563eb',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Tooltip content={(props) => (
                      <EvolutionTooltip
                        active={props.active}
                        payload={props.payload as unknown as { value: number }[] | undefined}
                        label={props.label as string | undefined}
                        moduleName={MODULE_LABELS[activeModule] ?? activeModule}
                      />
                    )} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={MODULE_COLORS[activeModule]}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: MODULE_COLORS[activeModule], strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Aucune donnée pour le module {activeModule} pour l&apos;instant.
                </div>
              )}
            </div>
          )}

          {/* ── Distribution CECRL + Activité ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Distribution CECRL — barre horizontale lisible */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Niveaux CECRL obtenus</h2>
              <p className="text-xs text-gray-400 mb-5">Répartition sur l&apos;ensemble de vos séries</p>

              {totalCecrl > 0 ? (
                <div className="space-y-3">
                  {/* Barre empilée visuelle */}
                  <div className="flex h-5 rounded-full overflow-hidden gap-px">
                    {cecrlLevels.map((lvl) => {
                      const bucket = cecrlDistribution.find((d) => d.level === lvl)
                      const count = bucket?.count ?? 0
                      if (count === 0) return null
                      const pct = (count / totalCecrl) * 100
                      return (
                        <div
                          key={lvl}
                          className="flex items-center justify-center text-white text-[10px] font-extrabold"
                          style={{ width: `${pct}%`, background: CECRL_COLORS[lvl] ?? '#6b7280', minWidth: pct > 5 ? undefined : 0 }}
                          title={`${lvl} : ${count} série${count > 1 ? 's' : ''}`}
                        >
                          {pct > 8 ? lvl : ''}
                        </div>
                      )
                    })}
                  </div>

                  {/* Légende détaillée */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {cecrlLevels.map((lvl) => {
                      const bucket = cecrlDistribution.find((d) => d.level === lvl)
                      const count = bucket?.count ?? 0
                      return (
                        <div key={lvl} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ background: CECRL_COLORS[lvl] ?? '#e5e7eb' }}
                          />
                          <span className="text-xs font-bold text-gray-700">{lvl}</span>
                          <span className="text-xs text-gray-400 ml-auto">{count > 0 ? count : '—'}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Message objectif */}
                  <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                    {cecrlDistribution.some((d) => ['B2', 'C1', 'C2'].includes(d.level) && d.count > 0) ? (
                      <span className="text-tef-blue font-semibold">Vous avez atteint le niveau cible NCLC 7 (B2) sur au moins un module.</span>
                    ) : (
                      <span>Objectif : atteindre <strong className="text-tef-blue">B2</strong> (NCLC 7) sur chaque module.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                  Aucun niveau enregistré pour l&apos;instant.
                </div>
              )}
            </div>

            {/* Activité par module — barres */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-1">Activité par module</h2>
              <p className="text-xs text-gray-400 mb-4">Nombre de séries complétées</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="module"
                    tick={{ fontSize: 13, fontWeight: 700, fill: '#374151' }}
                    tickFormatter={(code: string) => code}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} width={24} />
                  <Tooltip
                    formatter={(v: unknown) => [String(v ?? 0), 'Séries']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                  />
                  <Bar dataKey="tentatives" radius={[6, 6, 0, 0]}>
                    {activityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50">
                {moduleStats.map((m) => (
                  <div key={m.code} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: MODULE_COLORS[m.code] }} />
                    <span className="text-gray-500">{m.code} — {m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Activité récente ──────────────────────────────────────────────── */}
          {recentAttempts.length > 0 && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-gray-900">Historique récent</h2>
                </div>
                <Link href="/dashboard" className="text-xs text-tef-blue hover:underline font-medium">
                  Voir tout →
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAttempts.map((a) => {
                  const dateStr = new Date(a.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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
