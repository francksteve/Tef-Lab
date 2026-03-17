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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/orders?status=PENDING').then((r) => r.json()),
      fetch('/api/attempts').then((r) => r.json()),
    ]).then(([users, orders, pending, attempts]) => {
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        pendingOrders: Array.isArray(pending) ? pending.length : 0,
        totalAttempts: Array.isArray(attempts) ? attempts.length : 0,
      })
      setPendingOrders(Array.isArray(pending) ? pending.slice(0, 5) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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

    </div>
  )
}
