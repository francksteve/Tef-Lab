'use client'
import { useEffect, useState } from 'react'

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
  CE: 'bg-blue-100 text-tef-blue',
  CO: 'bg-blue-100 text-tef-blue',
  EE: 'bg-blue-100 text-tef-blue',
  EO: 'bg-blue-100 text-tef-blue',
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

export default function SeriesPasseesPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [filterModule, setFilterModule] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch('/api/admin/attempts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAttempts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Séries passées</h1>
        <p className="text-gray-500 text-sm mt-1">Historique des séries passées par les utilisateurs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-medium text-gray-700">
            {loading ? 'Chargement…' : `${filtered.length} série${filtered.length !== 1 ? 's' : ''}`}
          </p>
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

        {loading ? (
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
                      <tr
                        key={a.id}
                        className={`border-b border-blue-100 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}`}
                      >
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
                          {score != null ? (
                            a.moduleCode === 'CE' || a.moduleCode === 'CO' ? (
                              `${score} / 40`
                            ) : (
                              <span>
                                {Math.round(score * 4.5)}<span className="text-gray-400"> / 450</span>
                                <span className="ml-1.5 text-xs text-gray-400">({score}&nbsp;%)</span>
                              </span>
                            )
                          ) : '—'}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100">
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
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-tef-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
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
