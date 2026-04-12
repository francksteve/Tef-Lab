'use client'
import { useEffect, useState } from 'react'

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
      className={`px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none hover:bg-blue-700 transition-colors ${className}`}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${active ? 'text-yellow-300' : 'text-blue-300'}`}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  )
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('Tous')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mailStatus, setMailStatus] = useState<Record<string, 'sending' | 'sent' | 'error'>>({})

  const loadUsers = () => {
    setLoading(true)
    setError(null)
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          setError('Erreur lors du chargement des utilisateurs.')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement des utilisateurs.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSort = (col: SortKey) => {
    if (col === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const sendReminder = async (user: User) => {
    setMailStatus((prev) => ({ ...prev, [user.id]: 'sending' }))
    try {
      const res = await fetch(`/api/users/${user.id}/send-reminder`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMailStatus((prev) => ({ ...prev, [user.id]: 'sent' }))
        // Réinitialiser après 4s
        setTimeout(() => setMailStatus((prev) => { const n = { ...prev }; delete n[user.id]; return n }), 4000)
      } else {
        setMailStatus((prev) => ({ ...prev, [user.id]: 'error' }))
        setError(data?.error ?? 'Erreur lors de l\'envoi de l\'email.')
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
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
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

  const filtered = users.filter((u) => {
    if (filter === 'Abonnés') return u.role === 'SUBSCRIBER'
    if (filter === 'Admins') return u.role === 'ADMIN'
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'name':
        cmp = a.name.localeCompare(b.name, 'fr')
        break
      case 'status':
        cmp = a.accountStatus.localeCompare(b.accountStatus)
        break
      case 'pack': {
        const pa = getActivePack(a)?.name ?? ''
        const pb = getActivePack(b)?.name ?? ''
        cmp = pa.localeCompare(pb, 'fr')
        break
      }
      case 'createdAt':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const filters: FilterType[] = ['Tous', 'Abonnés', 'Admins']

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les comptes abonnés et administrateurs</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
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
        <span className="ml-auto text-sm text-gray-400 self-center">
          {sorted.length} utilisateur{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((user, index) => {
                  const activePack = getActivePack(user)
                  const isEven = index % 2 === 0
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-blue-100 transition-colors hover:bg-blue-100 ${
                        isEven ? 'bg-white' : 'bg-blue-50'
                      }`}
                    >
                      {/* N° */}
                      <td className="px-3 py-3 text-xs font-semibold text-tef-blue text-center">
                        {index + 1}
                      </td>

                      {/* Nom */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {user.mustChangePassword && (
                          <p className="text-xs text-orange-500">Doit changer son mdp</p>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.accountStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.accountStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      {/* Pack en cours */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {activePack ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-800 text-xs">{activePack.name}</span>
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                              activePack.daysLeft > 6 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <span>{activePack.daysLeft > 6 ? '🟢' : '🔴'}</span>
                              {activePack.daysLeft}j restants
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Créé le */}
                      <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => toggleStatus(user)}
                            disabled={actionLoading === user.id || actionLoading === user.id + '_delete'}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                              user.accountStatus === 'ACTIVE'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {actionLoading === user.id
                              ? '…'
                              : user.accountStatus === 'ACTIVE'
                              ? 'Suspendre'
                              : 'Réactiver'}
                          </button>

                          {/* Bouton rappel email — uniquement pour les abonnés */}
                          {user.role === 'SUBSCRIBER' && (
                            <button
                              onClick={() => sendReminder(user)}
                              disabled={mailStatus[user.id] === 'sending' || actionLoading === user.id + '_delete'}
                              title={`Envoyer un email de rappel à ${user.name}`}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1 ${
                                mailStatus[user.id] === 'sent'
                                  ? 'bg-green-100 text-green-700'
                                  : mailStatus[user.id] === 'error'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-50 text-tef-blue hover:bg-blue-100'
                              }`}
                            >
                              {mailStatus[user.id] === 'sending'
                                ? <><span className="animate-spin">⏳</span> Envoi…</>
                                : mailStatus[user.id] === 'sent'
                                ? <>✅ Envoyé</>
                                : mailStatus[user.id] === 'error'
                                ? <>❌ Erreur</>
                                : <>📧 Rappel</>}
                            </button>
                          )}

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
    </div>
  )
}
