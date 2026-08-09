'use client'
import { useEffect, useState, useCallback } from 'react'

interface UserOrder {
  pack: { name: string } | null
  expiresAt?: string | null
  visitorPhone?: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'VISITOR' | 'SUBSCRIBER' | 'ADMIN'
  accountStatus: 'ACTIVE' | 'SUSPENDED'
  mustChangePassword: boolean
  cityOfResidence?: string | null
  referenceCode?: string | null
  phone?: string | null
  createdAt: string
  orders: UserOrder[]
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('237') ? digits
    : digits.length === 9 ? '237' + digits
    : digits
  return `https://wa.me/${normalized}`
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
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)

  const copyPhone = (userId: string, phone: string) => {
    navigator.clipboard.writeText(phone).catch(() => {
      const el = document.createElement('textarea')
      el.value = phone
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopiedPhone(userId)
    setTimeout(() => setCopiedPhone(null), 2000)
  }

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

  const pageStart = total === 0 ? 0 : (page - 1) * 10 + 1
  const pageEnd = Math.min(page * 10, total)

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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((user, index) => {
                  const activePack = getActivePack(user)
                  const rowNum = (page - 1) * 25 + index + 1
                  const isEven = index % 2 === 0
                  const phone = user.phone ?? user.orders[0]?.visitorPhone ?? null
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
                        <a
                          href={`mailto:${user.email}`}
                          className="text-xs text-gray-400 hover:text-tef-blue transition-colors"
                        >
                          {user.email}
                        </a>
                        {(user.cityOfResidence || user.referenceCode) && (
                          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {user.cityOfResidence && <span>{user.cityOfResidence}</span>}
                            {user.cityOfResidence && user.referenceCode && <span className="text-gray-300">·</span>}
                            {user.referenceCode && (
                              <span className="font-mono bg-gray-100 text-gray-500 px-1 rounded text-[10px]">
                                {user.referenceCode}
                              </span>
                            )}
                          </p>
                        )}
                        {phone && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <a
                              href={whatsappLink(phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.25a.75.75 0 00.916.916l5.388-1.478A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.73 9.73 0 016.66 20.1l-.386-.23-4.003 1.098 1.097-4.003-.23-.386A9.732 9.732 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                              </svg>
                              {phone}
                            </a>
                            <button
                              onClick={() => copyPhone(user.id, phone)}
                              title="Copier le numéro"
                              className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                            >
                              {copiedPhone === user.id ? (
                                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                        {user.mustChangePassword && (
                          <p className="text-xs text-red-500 mt-0.5">Doit changer son mdp</p>
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
                        <div className="flex flex-col gap-1.5">
                          {user.role === 'SUBSCRIBER' && (
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
                                : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Mail</>}
                            </button>
                          )}
                          {phone ? (
                            <a
                              href={whatsappLink(phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`WhatsApp : ${phone}`}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors inline-flex items-center gap-1"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.25a.75.75 0 00.916.916l5.388-1.478A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.73 9.73 0 016.66 20.1l-.386-.23-4.003 1.098 1.097-4.003-.23-.386A9.732 9.732 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                              </svg>
                              WhatsApp
                            </a>
                          ) : (
                            user.role !== 'SUBSCRIBER' && <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
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
