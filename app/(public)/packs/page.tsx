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

const faqs = [
  {
    q: 'Comment fonctionne le paiement ?',
    a: 'Cliquez sur le bouton du pack pour choisir votre méthode de paiement : NotchPay (Orange Money, MTN MoMo, Visa, Mastercard) pour un accès instantané, ou un virement manuel validé par notre équipe sous 5 à 10 minutes.',
  },
  {
    q: 'Puis-je tester avant d\'acheter ?',
    a: 'Oui. Créez un compte gratuit et accédez immédiatement aux séries CE et CO gratuites. Aucune carte bancaire requise.',
  },
  {
    q: 'Quelle est la différence entre les packs ?',
    a: 'Le pack Special donne accès aux modules EE et EO uniquement. Tous les autres packs couvrent les 4 modules. Les différences portent sur le nombre de corrections IA par jour, les sessions simultanées et la durée d\'accès.',
  },
  {
    q: 'Que se passe-t-il à l\'expiration du pack ?',
    a: 'À expiration, votre compte passe en accès gratuit (CE et CO gratuits uniquement). Vos historiques de résultats sont conservés. Vous pouvez renouveler à tout moment.',
  },
]

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
      <section className="bg-tef-night text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-3">Tarifs</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Packs de préparation TEF Canada
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xl mx-auto">
            Accès activé instantanément après paiement. Orange Money, MTN MoMo, Visa et Mastercard acceptés.
          </p>
        </div>
      </section>

      {/* Packs */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Chargement des packs…</div>
          ) : (
            <>
              {settings.discountRate > 0 && (
                <div className="mb-10 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 max-w-sm mx-auto">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                  </svg>
                  Remise de {settings.discountRate}% sur tous les packs
                </div>
              )}

              {packs.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-sm">
                  Aucun pack disponible pour le moment.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {packs.map((pack) => {
                    const discounted = finalPrice(pack.price)
                    const hasDiscount = discounted < pack.price
                    return (
                      <div
                        key={pack.id}
                        className={`relative flex flex-col bg-white rounded-xl transition-all ${
                          pack.isRecommended
                            ? 'border-2 border-tef-blue shadow-lg shadow-tef-blue/10 ring-1 ring-tef-blue/10'
                            : 'border border-gray-200 shadow-sm hover:border-gray-300'
                        }`}
                      >
                        {pack.isRecommended && (
                          <div className="absolute -top-3 left-4">
                            <span className="bg-tef-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                              Recommandé
                            </span>
                          </div>
                        )}

                        {/* Header */}
                        <div className={`px-5 pb-4 ${pack.isRecommended ? 'pt-7' : 'pt-5'}`}>
                          <h3 className="font-extrabold text-gray-900 text-base leading-tight">{pack.name}</h3>
                          <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{pack.description}</p>
                          <div className="flex items-baseline gap-1.5 mt-4">
                            <span className="text-3xl font-black text-tef-blue tracking-tight">
                              {discounted.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-sm text-gray-400">FCFA</span>
                            {hasDiscount && (
                              <span className="text-sm line-through text-gray-300 ml-1">
                                {pack.price.toLocaleString('fr-FR')}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">≈ {usdPrice(pack.price)} USD</p>
                        </div>

                        {/* Features */}
                        <div className="px-5 py-3 flex-1 space-y-2 border-t border-gray-50">
                          {[
                            moduleLabels[pack.moduleAccess] ?? pack.moduleAccess,
                            `${pack.maxSessions} session${pack.maxSessions > 1 ? 's' : ''} simultanée${pack.maxSessions > 1 ? 's' : ''}`,
                            `${pack.aiUsagePerDay} correction${pack.aiUsagePerDay > 1 ? 's' : ''} IA / jour`,
                            `${pack.durationDays} jours d'accès`,
                          ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                              <svg className="w-3.5 h-3.5 text-tef-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="px-5 pb-5 pt-3">
                          <button
                            onClick={() => openPayment(pack)}
                            className={`w-full py-2.5 font-bold rounded-lg text-sm transition-colors ${
                              pack.isRecommended
                                ? 'bg-tef-blue text-white hover:bg-tef-night'
                                : 'border border-tef-blue/20 hover:border-tef-blue text-tef-blue hover:bg-tef-blue/5'
                            }`}
                          >
                            Souscrire
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Paiement sécurisé · Orange Money · MTN MoMo · Visa · Mastercard
              </p>
            </>
          )}
        </div>
      </section>

      {/* Bannière free */}
      <section className="py-12 px-4 bg-background border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Pas encore prêt à vous abonner ?</h2>
          <p className="text-sm text-gray-500 mb-5">
            Créez un compte gratuit et accédez aux séries CE et CO sans aucun engagement.
          </p>
          <a
            href="/inscription"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-night transition-colors text-sm"
          >
            Essayer gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Questions fréquentes</h2>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
            {faqs.map(({ q, a }, i) => (
              <div key={q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm">{q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                    <div className="pt-3">{a}</div>
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

