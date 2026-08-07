'use client'
import { useEffect, useState, useCallback } from 'react'

interface UserOrder {
  pack: { name: string } | null
  expiresAt?: string | null
}

interface User {
  id: string
  name: string
  email: string
  role: 'VISITOR' | 'SUBSCRIBER' | 'ADMIN'
  accountStatus: 'ACTIVE' | 'SUSPENDED'
  mustChangePassword: boolean
  createdAt: string
  orders: UserOrder[]
}

interface ApiResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
  pageSize: number
}

type FilterType = 'Tous' | 'Abonnés' | 'Admins'
type SortKey = 'name' | 'status' | 'pack' | 'createdAt'
type SortDir = 'asc' | 'desc'

function getActivePack(user: User): { name: string; daysLeft: number } | null {
  const order = user.orders[0]
  if (!order?.pack || !order.expiresAt) return null
  const daysLeft = Math.ceil((new Date(order.expiresAt).getTime() - Date.now()) / 86400000)
  if (daysLeft <= 0) return null
  return { name: order.pack.name, daysLeft }
}

interface SortHeaderProps {
  label: string
  col: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (col: SortKey) => void
  className?: string
}

function SortHeader({ label, col, sortKey, sortDir, onSort, className = '' }: SortHeaderProps) {
  const active = sortKey === col
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none hover:bg-tef-blue-hover transition-colors ${className}`}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${active ? 'text-blue-200' : 'text-blue-300'}`}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  )
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('Tous')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mailStatus, setMailStatus] = useState<Record<string, 'sending' | 'sent' | 'error'>>({})

  const loadUsers = useCallback(() => {
    setLoading(true)
    setError(null)
    // pack sort is client-side only — send createdAt to API as fallback
    const apiSort = sortKey === 'pack' ? 'createdAt' : sortKey
    const params = new URLSearchParams({
      page: String(page),
      filter,
      sort: apiSort,
      dir: sortDir,
      ...(search && { search }),
    })
    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((data: ApiResponse) => {
        if (data && Array.isArray(data.users)) {
          setUsers(data.users)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        } else {
          setError('Erreur lors du chargement des utilisateurs.')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement des utilisateurs.')
        setLoading(false)
      })
  }, [page, filter, search, sortKey, sortDir])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Reset to page 1 when filter/search/sort changes
  useEffect(() => {
    setPage(1)
  }, [filter, search, sortKey, sortDir])

  const handleSort = (col: SortKey) => {
    if (col === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  // Client-side sort for pack column (within the current page)
  const sorted =
    sortKey === 'pack'
      ? [...users].sort((a, b) => {
          const pa = getActivePack(a)?.name ?? ''
          const pb = getActivePack(b)?.name ?? ''
          const cmp = pa.localeCompare(pb, 'fr')
          return sortDir === 'asc' ? cmp : -cmp
        })
      : users

  const sendReminder = async (user: User) => {
    setMailStatus((prev) => ({ ...prev, [user.id]: 'sending' }))
    try {
      const res = await fetch(`/api/users/${user.id}/send-reminder`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMailStatus((prev) => ({ ...prev, [user.id]: 'sent' }))
        setTimeout(() => setMailStatus((prev) => { const n = { ...prev }; delete n[user.id]; return n }), 4000)
      } else {
        setMailStatus((prev) => ({ ...prev, [user.id]: 'error' }))
        setError(data?.error ?? "Erreur lors de l'envoi de l'email.")
        setTimeout(() => setMailStatus((prev) => { const n = { ...prev }; delete n[user.id]; return n }), 4000)
      }
    } catch {
      setMailStatus((prev) => ({ ...prev, [user.id]: 'error' }))
      setTimeout(() => setMailStatus((prev) => { const n = { ...prev }; delete n[user.id]; return n }), 4000)
    }
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`Supprimer définitivement le compte de ${user.name} (${user.email}) ?\n\nCette action est irréversible. Toutes ses données seront supprimées.`)) return
    setActionLoading(user.id + '_delete')
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        loadUsers()
      } else {
        const data = await res.json()
        setError(data?.error ?? 'Erreur lors de la suppression.')
      }
    } catch {
      setError('Erreur lors de la suppression.')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleStatus = async (user: User) => {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    const action = newStatus === 'SUSPENDED' ? 'suspendre' : 'réactiver'
    if (!confirm(`Voulez-vous ${action} le compte de ${user.name} ?`)) return
    setActionLoading(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountStatus: newStatus }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, accountStatus: newStatus } : u))
        )
      } else {
        setError('Erreur lors de la mise à jour du statut.')
      }
    } catch {
      setError('Erreur lors de la mise à jour du statut.')
    } finally {
      setActionLoading(null)
    }
  }

  const filters: FilterType[] = ['Tous', 'Abonnés', 'Admins']

  const pageStart = total === 0 ? 0 : (page - 1) * 25 + 1
  const pageEnd = Math.min(page * 25, total)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les comptes abonnés et administrateurs</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
        </div>
      )}

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom ou email…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors flex-shrink-0"
          >
            Chercher
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput('') }}
              className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          )}
        </form>

        <div className="flex gap-2 flex-shrink-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-tef-blue text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-tef-blue'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur */}
      {!loading && (
        <p className="text-sm text-gray-400">
          {total === 0
            ? 'Aucun utilisateur trouvé'
            : `${pageStart}–${pageEnd} sur ${total} utilisateur${total !== 1 ? 's' : ''}`}
          {search && <span className="ml-1 text-tef-blue font-medium">· Recherche : « {search} »</span>}
        </p>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-tef-blue text-white">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10">N°</th>
                  <SortHeader label="Nom"           col="name"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Statut"         col="status"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Pack en cours"  col="pack"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortHeader label="Créé le"        col="createdAt" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Mailing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((user, index) => {
                  const activePack = getActivePack(user)
                  const rowNum = (page - 1) * 25 + index + 1
                  const isEven = index % 2 === 0
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-blue-100 transition-colors hover:bg-blue-100 ${
                        isEven ? 'bg-white' : 'bg-blue-50'
                      }`}
                    >
                      <td className="px-3 py-3 text-xs font-semibold text-tef-blue text-center">
                        {rowNum}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        {user.mustChangePassword && (
                          <p className="text-xs text-red-500">Doit changer son mdp</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.accountStatus === 'ACTIVE'
                            ? 'bg-blue-100 text-tef-blue'
                            : 'bg-red-100 text-tef-red'
                        }`}>
                          {user.accountStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        {activePack ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-800 text-xs">{activePack.name}</span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              activePack.daysLeft > 6 ? 'text-tef-blue' : 'text-tef-red'
                            }`}>
                              <span className={`inline-block w-2 h-2 rounded-full ${activePack.daysLeft > 6 ? 'bg-green-500' : 'bg-tef-red'}`} />
                              {activePack.daysLeft}j restants
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="px-4 py-3 hidden sm:table-cell">
                        {user.role === 'SUBSCRIBER' ? (
                          <button
                            onClick={() => sendReminder(user)}
                            disabled={mailStatus[user.id] === 'sending' || actionLoading === user.id + '_delete'}
                            title={`Envoyer un email de rappel à ${user.name}`}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1 ${
                              mailStatus[user.id] === 'sent'
                                ? 'bg-blue-100 text-tef-blue'
                                : mailStatus[user.id] === 'error'
                                ? 'bg-red-100 text-tef-red'
                                : 'bg-blue-50 text-tef-blue hover:bg-blue-100'
                            }`}
                          >
                            {mailStatus[user.id] === 'sending'
                              ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Envoi…</>
                              : mailStatus[user.id] === 'sent'
                              ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Envoyé</>
                              : mailStatus[user.id] === 'error'
                              ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Erreur</>
                              : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Rappel</>}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => toggleStatus(user)}
                            disabled={actionLoading === user.id || actionLoading === user.id + '_delete'}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                              user.accountStatus === 'ACTIVE'
                                ? 'bg-red-100 text-tef-red hover:bg-red-200'
                                : 'bg-blue-100 text-tef-blue hover:bg-blue-200'
                            }`}
                          >
                            {actionLoading === user.id
                              ? '…'
                              : user.accountStatus === 'ACTIVE'
                              ? 'Suspendre'
                              : 'Réactiver'}
                          </button>

                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => deleteUser(user)}
                              disabled={actionLoading === user.id || actionLoading === user.id + '_delete'}
                              title="Supprimer ce compte"
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user.id + '_delete' ? '…' : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-tef-blue hover:text-tef-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '…')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    disabled={loading}
                    className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
                      p === page
                        ? 'bg-tef-blue text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-tef-blue hover:text-tef-blue'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-tef-blue hover:text-tef-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
