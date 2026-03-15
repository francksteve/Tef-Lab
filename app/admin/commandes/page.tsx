'use client'
import { useEffect, useState } from 'react'

interface Order {
  id: string
  reference: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorMessage?: string
  status: 'PENDING' | 'VALIDATED' | 'REJECTED'
  createdAt: string
  activatedAt?: string
  expiresAt?: string
  pack: { name: string; price: number }
  user?: { email: string }
}

type Filter = 'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'

const statusLabel: Record<string, string> = { PENDING: '⏳ En attente', VALIDATED: '✅ Validée', REJECTED: '❌ Rejetée' }
const statusBg: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  VALIDATED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadOrders = () => {
    setLoading(true)
    const url = filter === 'ALL' ? '/api/orders' : `/api/orders?status=${filter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => { Array.isArray(data) && setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidate = async (id: string) => {
    if (!confirm('Valider cette commande et créer le compte abonné ?')) return
    setActionLoading(id + '-validate')
    await fetch(`/api/orders/${id}/validate`, { method: 'PATCH' })
    setActionLoading(null)
    loadOrders()
  }

  const handleReject = async (id: string) => {
    if (!confirm('Rejeter cette commande ? Un email sera envoyé au client.')) return
    setActionLoading(id + '-reject')
    await fetch(`/api/orders/${id}/reject`, { method: 'PATCH' })
    setActionLoading(null)
    loadOrders()
  }

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            Commandes
            {pendingCount > 0 && filter === 'ALL' && (
              <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les commandes et activations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'VALIDATED', 'REJECTED'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-tef-blue text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-tef-blue'
            }`}
          >
            {f === 'ALL' ? 'Toutes' : statusLabel[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucune commande trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Référence', 'Client', 'Pack', 'Statut', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.visitorName}</p>
                      <p className="text-xs text-gray-500">{order.visitorEmail}</p>
                      <a
                        href={`https://wa.me/${order.visitorPhone.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        {order.visitorPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.pack.name}</p>
                      <p className="text-xs text-gray-500">{order.pack.price.toLocaleString('fr-FR')} FCFA</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBg[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValidate(order.id)}
                            disabled={actionLoading === order.id + '-validate'}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === order.id + '-validate' ? '…' : 'Valider'}
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            disabled={actionLoading === order.id + '-reject'}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === order.id + '-reject' ? '…' : 'Rejeter'}
                          </button>
                        </div>
                      )}
                      {order.status !== 'PENDING' && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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
