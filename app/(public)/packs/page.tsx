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
  isActive: boolean
}

interface Settings {
  usdExchangeRate: number
  discountRate: number
}

const moduleLabels: Record<string, string> = {
  EE_EO: 'Expression Écrite & Orale uniquement',
  ALL: 'Tous les modules (CE, CO, EE, EO)',
}

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [settings, setSettings] = useState<Settings>({ usdExchangeRate: 0.00165, discountRate: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/packs').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([p, s]) => {
        if (Array.isArray(p)) setPacks(p)
        if (s?.usdExchangeRate) setSettings(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const finalPrice = (price: number) =>
    Math.round(price * (1 - settings.discountRate / 100))

  const usdPrice = (price: number) =>
    (finalPrice(price) * settings.usdExchangeRate).toFixed(2)

  const openPayment = (pack: Pack) => {
    setSelectedPack(pack)
    setPayModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-tef-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Nos packs de préparation TEF Canada
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto text-base leading-relaxed">
            Paiement sécurisé via NotchPay · Orange Money · MTN MoMo · Visa · Mastercard.
            Accès activé instantanément après confirmation du paiement.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">📦</p>
              <p>Chargement des packs…</p>
            </div>
          ) : (
            <>
              {/* Discount banner */}
              {settings.discountRate > 0 && (
                <div className="mb-8 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-50 border border-green-300 rounded-2xl text-sm font-bold text-green-700 max-w-md mx-auto shadow-sm">
                  🎉 Remise de {settings.discountRate}% appliquée sur tous les packs !
                </div>
              )}

              {/* Packs grid */}
              {packs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-4">📦</p>
                  <p>Aucun pack disponible pour le moment. Revenez bientôt !</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {packs.map((pack) => {
                    const discounted = finalPrice(pack.price)
                    const hasDiscount = discounted < pack.price
                    return (
                      <div
                        key={pack.id}
                        className={`relative rounded-2xl border-2 flex flex-col transition-all ${
                          pack.isRecommended
                            ? 'border-tef-blue shadow-xl shadow-tef-blue/10'
                            : 'border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {pack.isRecommended && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <span className="bg-tef-blue text-white text-xs font-bold px-4 py-1.5 rounded-full shadow whitespace-nowrap">
                              ⭐ Recommandé
                            </span>
                          </div>
                        )}

                        {/* Pack header */}
                        <div
                          className={`px-5 pt-7 pb-4 rounded-t-2xl ${
                            pack.isRecommended ? 'bg-tef-blue text-white' : 'bg-gray-50'
                          }`}
                        >
                          <h3
                            className={`font-extrabold text-lg ${
                              pack.isRecommended ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {pack.name}
                          </h3>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span
                              className={`text-3xl font-black ${
                                pack.isRecommended ? 'text-white' : 'text-tef-blue'
                              }`}
                            >
                              {discounted.toLocaleString('fr-FR')}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                pack.isRecommended ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              FCFA
                            </span>
                            {hasDiscount && (
                              <span className="text-sm line-through text-red-300 ml-1">
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

                        {/* Pack features */}
                        <div className="px-5 py-4 flex-1 space-y-2">
                          <p className="text-xs text-gray-500 leading-relaxed mb-3">
                            {pack.description}
                          </p>
                          <div className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                            <span>{moduleLabels[pack.moduleAccess]}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                            <span>
                              {pack.maxSessions} session{pack.maxSessions > 1 ? 's' : ''} simultanée{pack.maxSessions > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                            <span>
                              {pack.aiUsagePerDay} correction{pack.aiUsagePerDay > 1 ? 's' : ''} IA par jour
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                            <span>{pack.durationDays} jours d'accès</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="px-5 pb-5">
                          <button
                            onClick={() => openPayment(pack)}
                            className={`w-full py-3 font-bold rounded-xl text-sm transition-colors ${
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
              )}

              <p className="text-center text-xs text-gray-400 mt-10">
                🔒 Paiement sécurisé · Orange Money · MTN MoMo · Visa · Mastercard
              </p>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Comment fonctionne le paiement ?',
                a: 'Clique sur "S\'abonner →" pour choisir ta méthode de paiement : NotchPay (Orange Money, MTN MoMo, Visa, Mastercard) pour un accès immédiat, ou un virement manuel. Ton accès est activé automatiquement après confirmation.',
              },
              {
                q: 'Quand mon compte est-il activé ?',
                a: 'Instantanément si tu paies via NotchPay ! Pour les paiements manuels (Orange Money direct, MTN MoMo direct), ton compte est activé dans les 24h après validation par notre équipe.',
              },
              {
                q: 'Puis-je tester avant d\'acheter ?',
                a: 'Oui ! Crée un compte gratuit pour accéder aux séries gratuites de Compréhension Écrite (CE) et Compréhension Orale (CO). Aucune carte bancaire requise.',
              },
              {
                q: 'Quelle est la différence entre les packs ?',
                a: 'Le pack Special donne accès aux modules Expression Écrite et Orale uniquement. Les autres packs donnent accès à tous les modules. La différence porte sur le nombre de corrections IA par jour, de sessions simultanées et la durée d\'accès.',
              },
            ].map(({ q, a }, i) => (
              <div key={q} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm leading-snug">{q}</span>
                  <span className={`flex-shrink-0 text-tef-blue text-sm transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        pack={selectedPack}
      />
    </div>
  )
}
