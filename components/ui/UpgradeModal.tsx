'use client'
import { useState, useEffect } from 'react'
import PaymentModal from '@/components/ui/PaymentModal'

interface Pack {
  id: string
  name: string
  price: number
  description: string
  moduleAccess: 'EE_EO' | 'ALL'
  maxSessions: number
  aiUsagePerDay: number
  durationDays: number
  isRecommended: boolean
}

interface Settings {
  usdExchangeRate: number
  discountRate: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  reason?: string
}

const moduleLabels: Record<string, string> = {
  EE_EO: 'Expression Écrite & Orale uniquement',
  ALL: 'Tous les modules (CE, CO, EE, EO)',
}

export default function UpgradeModal({ isOpen, onClose, reason }: Props) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [settings, setSettings] = useState<Settings>({ usdExchangeRate: 0.00165, discountRate: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [payModalOpen, setPayModalOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    Promise.all([
      fetch('/api/packs').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]).then(([p, s]) => {
      if (Array.isArray(p)) setPacks(p)
      if (s?.usdExchangeRate) setSettings(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const finalPrice = (price: number) =>
    Math.round(price * (1 - settings.discountRate / 100))

  const usdPrice = (price: number) =>
    (finalPrice(price) * settings.usdExchangeRate).toFixed(2)

  const openPayment = (pack: Pack) => {
    setSelectedPack(pack)
    setPayModalOpen(true)
  }

  const handlePayModalClose = () => {
    setPayModalOpen(false)
    setSelectedPack(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Mettre à niveau mon accès</h2>
              {reason && <p className="text-sm text-gray-500 mt-0.5">{reason}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <p className="text-gray-400">Chargement des packs…</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Discount banner */}
              {settings.discountRate > 0 && (
                <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
                  🎉 Remise de {settings.discountRate}% appliquée sur tous les packs !
                </div>
              )}

              {/* Packs grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map((pack) => {
                  const discounted = finalPrice(pack.price)
                  const hasDiscount = discounted < pack.price
                  return (
                    <div
                      key={pack.id}
                      className={`relative rounded-xl border-2 flex flex-col transition-all ${
                        pack.isRecommended
                          ? 'border-tef-blue shadow-lg shadow-tef-blue/10'
                          : 'border-gray-200'
                      }`}
                    >
                      {pack.isRecommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-tef-blue text-white text-xs font-bold px-3 py-1 rounded-full">
                            ⭐ Recommandé
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-4 pt-5 pb-3 rounded-t-xl ${
                          pack.isRecommended ? 'bg-tef-blue text-white' : 'bg-gray-50'
                        }`}
                      >
                        <h3
                          className={`font-bold text-base ${
                            pack.isRecommended ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {pack.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span
                            className={`text-2xl font-black ${
                              pack.isRecommended ? 'text-white' : 'text-tef-blue'
                            }`}
                          >
                            {discounted.toLocaleString('fr-FR')}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              pack.isRecommended ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            FCFA
                          </span>
                          {hasDiscount && (
                            <span className="text-xs line-through text-red-300 ml-1">
                              {pack.price.toLocaleString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            pack.isRecommended ? 'text-blue-200' : 'text-gray-400'
                          }`}
                        >
                          ≈ ${usdPrice(pack.price)} USD
                        </p>
                      </div>

                      <div className="px-4 py-3 flex-1 space-y-1.5 text-xs text-gray-600">
                        <p>📚 {moduleLabels[pack.moduleAccess]}</p>
                        <p>
                          📱 {pack.maxSessions} session{pack.maxSessions > 1 ? 's' : ''}{' '}
                          simultanée{pack.maxSessions > 1 ? 's' : ''}
                        </p>
                        <p>
                          🤖 {pack.aiUsagePerDay} correction{pack.aiUsagePerDay > 1 ? 's' : ''}{' '}
                          IA/jour
                        </p>
                        <p>⏱ {pack.durationDays} jours d'accès</p>
                      </div>

                      <div className="px-4 pb-4">
                        <button
                          onClick={() => openPayment(pack)}
                          className={`w-full py-2.5 font-bold rounded-lg text-sm transition-colors ${
                            pack.isRecommended
                              ? 'bg-tef-blue text-white hover:bg-tef-blue-hover'
                              : 'bg-gray-900 text-white hover:bg-gray-700'
                          }`}
                        >
                          Payer →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                🔒 Paiement sécurisé · Orange Money · MTN MoMo · Visa · Mastercard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment modal — opens on top of this modal */}
      <PaymentModal
        isOpen={payModalOpen}
        onClose={handlePayModalClose}
        pack={selectedPack}
      />
    </>
  )
}
