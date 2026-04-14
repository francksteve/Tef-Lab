'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'

interface Stats {
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  totalAttempts: number
}

interface Order {
  id: string
  reference: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  status: string
  createdAt: string
  pack: { name: string; price: number }
}

interface Attempt {
  id: string
  completedAt: string
  moduleCode: string
  score: number | null
  aiScore: number | null
  cecrlLevel: string | null
  timeTaken: number | null
  user: { id: string; name: string; email: string }
  series: { title: string; module: { code: string; name: string } }
}

const PAGE_SIZE = 10
const MODULE_COLORS: Record<string, string> = {
  CE: 'bg-blue-100 text-blue-700',
  CO: 'bg-purple-100 text-purple-700',
  EE: 'bg-orange-100 text-orange-700',
  EO: 'bg-green-100 text-green-700',
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m${s > 0 ? ` ${s}s` : ''}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [attemptsLoading, setAttemptsLoading] = useState(true)
  const [filterModule, setFilterModule] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/orders?status=PENDING').then((r) => r.json()),
    ]).then(([users, orders, pending]) => {
      setPendingOrders(Array.isArray(pending) ? pending.slice(0, 5) : [])
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        pendingOrders: Array.isArray(pending) ? pending.length : 0,
        totalAttempts: 0,
      })
      setLoading(false)
    }).catch(() => setLoading(false))

    fetch('/api/admin/attempts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAttempts(data)
          setStats((prev) => prev ? { ...prev, totalAttempts: data.length } : null)
        }
        setAttemptsLoading(false)
      })
      .catch(() => setAttemptsLoading(false))
  }, [])

  const modules = ['CE', 'CO', 'EE', 'EO']

  const filtered = attempts.filter((a) => !filterModule || a.moduleCode === filterModule)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (mod: string) => {
    setFilterModule(mod)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme TEF-LAB</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Abonnés" value={stats?.totalUsers ?? '…'} icon="👥" color="blue" />
        <StatsCard title="Commandes" value={stats?.totalOrders ?? '…'} icon="🛒" color="green" />
        <StatsCard
          title="En attente"
          value={stats?.pendingOrders ?? '…'}
          icon="⏳"
          color={stats?.pendingOrders ? 'orange' : 'green'}
          subtitle={stats?.pendingOrders ? 'Nécessitent validation' : 'Aucune en attente'}
        />
        <StatsCard title="Séries passées" value={stats?.totalAttempts ?? '…'} icon="📝" color="blue" />
      </div>

      {/* Pending orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900">
            Commandes en attente
            {stats?.pendingOrders ? (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                {stats.pendingOrders}
              </span>
            ) : null}
          </h2>
          <Link href="/admin/commandes" className="text-sm text-tef-blue hover:underline font-medium">
            Voir toutes →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement…</div>
        ) : pendingOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">✅</p>
            <p>Aucune commande en attente</p>
          </div>
        ) : (
          <div className="divide-y">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.visitorName}</p>
                  <p className="text-xs text-gray-500">{order.pack.name} — {order.pack.price.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-gray-400 font-mono">{order.reference}</p>
                </div>
                <Link
                  href="/admin/commandes"
                  className="px-3 py-1.5 bg-tef-blue text-white text-xs font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
                >
                  Traiter
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All series attempts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-gray-900">
            Séries passées par les utilisateurs
            {!attemptsLoading && (
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            )}
          </h2>
          {/* Module filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange('')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterModule === '' ? 'bg-tef-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tous
            </button>
            {modules.map((mod) => {
              const count = attempts.filter((a) => a.moduleCode === mod).length
              return (
                <button
                  key={mod}
                  onClick={() => handleFilterChange(mod)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterModule === mod ? 'bg-tef-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {mod} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {attemptsLoading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucune série passée</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-tef-blue text-white">
                  <tr>
                    {['Utilisateur', 'Série', 'Module', 'Score', 'Niveau', 'Durée', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a, i) => {
                    const score = a.score ?? a.aiScore
                    const level = a.cecrlLevel
                    return (
                      <tr key={a.id} className={`border-b border-blue-100 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 leading-tight">{a.user.name}</p>
                          <p className="text-xs text-gray-400">{a.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{a.series.title}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${MODULE_COLORS[a.moduleCode] ?? 'bg-gray-100 text-gray-600'}`}>
                            {a.moduleCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {score != null ? `${score} / 100` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {level ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-tef-blue/10 text-tef-blue">
                              {level}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDuration(a.timeTaken)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(a.completedAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Préc.
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-tef-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Suiv. →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
