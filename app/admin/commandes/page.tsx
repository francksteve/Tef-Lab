'use client'
import { useEffect, useState, useCallback } from 'react'

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

const PAGE_SIZE = 10

const statusLabel: Record<string, string> = { PENDING: 'En attente', VALIDATED: 'Validée', REJECTED: 'Rejetée' }
const statusBg: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  VALIDATED: 'bg-blue-100 text-tef-blue',
  REJECTED: 'bg-red-100 text-tef-red',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function waPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function buildWaMessage(type: 'validate' | 'reject' | 'contact', order: Order) {
  const firstName = order.visitorName.split(' ')[0]
  if (type === 'validate') {
    return `Bonjour ${firstName}, votre paiement pour la commande TEF-LAB (réf. ${order.reference}) a été confirmé. Votre accès au pack ${order.pack.name} est maintenant actif. Connectez-vous sur votre espace et commencez votre préparation !`
  }
  if (type === 'reject') {
    return `Bonjour ${firstName}, nous n'avons pas pu confirmer votre paiement pour la commande TEF-LAB (réf. ${order.reference}). Contactez-nous pour régulariser votre situation.`
  }
  return `Bonjour ${firstName}, concernant votre commande TEF-LAB (réf. ${order.reference}) — pack ${order.pack.name}.`
}

function buildWaUrl(phone: string, message: string) {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(message)}`
}

const WaIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'validate' | 'reject'; order: Order } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; waUrl?: string } | null>(null)
  const [page, setPage] = useState(1)

  const loadOrders = useCallback(() => {
    setLoading(true)
    const url = filter === 'ALL' ? '/api/orders' : `/api/orders?status=${filter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  const deleteOrder = async (order: Order) => {
    setConfirmDelete(null)
    setActionLoading(order.id + '-delete')
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' })
      if (res.ok) {
        setToast({ type: 'success', message: `Commande ${order.reference} supprimée.` })
        loadOrders()
      } else {
        setToast({ type: 'error', message: 'Échec de la suppression. Veuillez réessayer.' })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau. Vérifiez votre connexion et réessayez.' })
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => { loadOrders(); setPage(1) }, [loadOrders])

  // Auto-dismiss toast after 10s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 10000)
    return () => clearTimeout(t)
  }, [toast])

  const executeAction = async (id: string, type: 'validate' | 'reject', order: Order) => {
    setConfirmAction(null)
    setActionLoading(id + '-' + type)
    try {
      const endpoint = type === 'validate' ? 'validate' : 'reject'
      const res = await fetch(`/api/orders/${id}/${endpoint}`, { method: 'PATCH' })
      if (res.ok) {
        setToast({
          type: 'success',
          message: type === 'validate'
            ? `Pack ${order.pack.name} activé pour ${order.visitorName}.`
            : `Commande rejetée — email envoyé à ${order.visitorName}.`,
          waUrl: buildWaUrl(order.visitorPhone, buildWaMessage(type, order)),
        })
        loadOrders()
      } else {
        setToast({
          type: 'error',
          message: `Échec de l${type === 'validate' ? 'a validation' : 'u rejet'}. Veuillez réessayer.`,
        })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau. Vérifiez votre connexion et réessayez.' })
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
          toast.type === 'success'
            ? 'bg-blue-50 border-blue-200 text-tef-blue'
            : 'bg-red-50 border-red-200 text-tef-red'
        }`}>
          <span className="flex-shrink-0 mt-0.5 text-base">
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          <div className="flex-1">
            <p className="font-semibold">{toast.message}</p>
            {toast.waUrl && (
              <a
                href={toast.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#1aab52] transition-colors"
              >
                <WaIcon />
                Contacter le client sur WhatsApp
              </a>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          Commandes
          {pendingCount > 0 && filter === 'ALL' && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-tef-red text-white text-xs rounded-full">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les commandes et activations</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucune commande trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-tef-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase hidden sm:table-cell">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Pack</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b border-blue-100 transition-colors hover:bg-blue-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 hidden sm:table-cell">
                      {order.reference}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 leading-tight">{order.visitorName}</p>
                      <p className="text-xs text-gray-500">{order.visitorEmail}</p>
                      <a
                        href={buildWaUrl(order.visitorPhone, buildWaMessage('contact', order))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#25D366] hover:underline mt-0.5"
                      >
                        <WaIcon className="w-3 h-3" />
                        {order.visitorPhone}
                      </a>
                      {order.visitorMessage && (
                        <p
                          className="text-xs text-gray-400 mt-0.5 italic line-clamp-1 cursor-help"
                          title={order.visitorMessage}
                        >
                          💬 {order.visitorMessage}
                        </p>
                      )}
                    </td>

                    {/* Pack */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.pack.name}</p>
                      <p className="text-xs text-gray-500">{order.pack.price.toLocaleString('fr-FR')} FCFA</p>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBg[order.status]}`}>
                          {statusLabel[order.status]}
                        </span>
                        {order.status === 'VALIDATED' && order.expiresAt && (
                          <p className="text-[10px] text-gray-400">
                            Expire {formatDate(order.expiresAt)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                      {order.status === 'VALIDATED' && order.activatedAt && (
                        <p className="text-[10px] text-blue-500 mt-0.5">
                          Activé {formatDate(order.activatedAt)}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {order.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setConfirmAction({ type: 'validate', order })}
                              disabled={!!actionLoading}
                              className="px-3 py-1.5 bg-tef-blue text-white text-xs font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === order.id + '-validate' ? '…' : 'Valider'}
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'reject', order })}
                              disabled={!!actionLoading}
                              className="px-3 py-1.5 bg-white border border-red-200 text-tef-red text-xs font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === order.id + '-reject' ? '…' : 'Rejeter'}
                            </button>
                          </>
                        ) : (
                          <a
                            href={buildWaUrl(order.visitorPhone, buildWaMessage('contact', order))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-[#25D366] border border-[#25D366]/30 rounded-lg hover:bg-[#25D366]/8 transition-colors"
                          >
                            <WaIcon className="w-3 h-3" />
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => setConfirmDelete(order)}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-tef-red disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === order.id + '-delete' ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100">
            <p className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} sur {orders.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Préc.
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
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
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">Supprimer la commande</h2>
            <p className="text-sm text-gray-600">
              Confirmez-vous la suppression de la commande{' '}
              <span className="font-mono font-semibold text-gray-900">{confirmDelete.reference}</span>{' '}
              de <span className="font-semibold">{confirmDelete.visitorName}</span> ?
            </p>
            <p className="text-xs text-red-700 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteOrder(confirmDelete)}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                {confirmAction.type === 'validate' ? 'Valider la commande' : 'Rejeter la commande'}
              </h2>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{confirmAction.order.reference}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 flex-shrink-0">Client</span>
                <span className="font-semibold text-gray-900 text-right">{confirmAction.order.visitorName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 flex-shrink-0">Email</span>
                <span className="text-gray-700 text-xs text-right break-all">{confirmAction.order.visitorEmail}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 flex-shrink-0">Pack</span>
                <span className="font-semibold text-gray-900">{confirmAction.order.pack.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 flex-shrink-0">Montant</span>
                <span className="font-semibold text-gray-900">{confirmAction.order.pack.price.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {confirmAction.order.visitorMessage && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">Message du client :</p>
                  <p className="text-xs text-gray-700 italic bg-white rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
                    &ldquo;{confirmAction.order.visitorMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {confirmAction.type === 'validate' ? (
              <p className="text-sm text-tef-blue bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100">
                L&apos;abonnement sera activé immédiatement et un email de confirmation envoyé au client.
              </p>
            ) : (
              <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                La commande sera marquée comme rejetée et un email de refus envoyé au client.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => executeAction(confirmAction.order.id, confirmAction.type, confirmAction.order)}
                disabled={!!actionLoading}
                className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 ${
                  confirmAction.type === 'validate'
                    ? 'bg-tef-blue hover:bg-tef-blue-hover'
                    : 'bg-tef-red hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'validate' ? 'Confirmer la validation' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
