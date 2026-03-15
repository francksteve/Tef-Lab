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

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  SUBSCRIBER: 'Abonné',
  VISITOR: 'Visiteur',
}

const roleBg: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUBSCRIBER: 'bg-blue-100 text-blue-700',
  VISITOR: 'bg-gray-100 text-gray-600',
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('Tous')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const filters: FilterType[] = ['Tous', 'Abonnés', 'Admins']

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
          {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Nom', 'Email', 'Rôle', 'Statut', 'Créé le', 'Actions'].map((h) => (
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
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.mustChangePassword && (
                        <p className="text-xs text-orange-500">Doit changer son mdp</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBg[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.accountStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.accountStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(user)}
                        disabled={actionLoading === user.id}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
