'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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

const modules = [
  {
    code: 'CE',
    name: 'Compréhension Écrite',
    icon: '📖',
    duration: '60 min',
    questions: '40 questions',
    desc: 'Documents du quotidien, textes lacunaires, articles de presse, graphiques.',
    color: 'border-blue-400',
    pdf: '/tef-exemples-ce.pdf',
  },
  {
    code: 'CO',
    name: 'Compréhension Orale',
    icon: '🎧',
    duration: '40 min',
    questions: '40 questions',
    desc: 'Annonces, répondeurs, interviews, chroniques radio. Audio unique.',
    color: 'border-purple-400',
    pdf: '/tef-exemples-co.pdf',
  },
  {
    code: 'EE',
    name: 'Expression Écrite',
    icon: '✍️',
    duration: '60 min',
    questions: '2 tâches',
    desc: 'Suite d\'article (80 mots min.) et lettre au journal (200 mots min.).',
    color: 'border-green-400',
    pdf: '/tef-exemples-epreuve-ee.pdf',
  },
  {
    code: 'EO',
    name: 'Expression Orale',
    icon: '🎤',
    duration: '15 min',
    questions: '2 sections',
    desc: 'Obtenir des informations (formel) et présenter pour convaincre (informel).',
    color: 'border-orange-400',
    pdf: '/tef-exemples-epreuve-eo.pdf',
  },
]

const moduleLabels: Record<string, string> = {
  EE_EO: 'EE + EO uniquement',
  ALL: 'CE · CO · EE · EO',
}

export default function HomePage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [settings, setSettings] = useState<Settings>({ usdExchangeRate: 0.00165, discountRate: 0 })
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [payModalOpen, setPayModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/packs').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([p, s]) => {
      if (Array.isArray(p)) setPacks(p)
      if (s?.usdExchangeRate) setSettings(s)
    }).catch(() => {})
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

      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-tef-blue to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium">
            🍁 Certifié IRCC — Reconnu pour l'immigration au Canada
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Réussis ton <span className="text-yellow-300">TEF Canada</span><br />
            et concrétise ton projet d&apos;immigration 🇨🇦
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Votre projet d&apos;immigration au Canada commence par une étape clé : un bon score au TEF Canada.
            Préparez chaque module avec des séries réalistes et une correction personnalisée par IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="px-8 py-3.5 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-base"
            >
              Démarrer gratuitement →
            </Link>
            <a
              href="#packs"
              className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Voir les packs
            </a>
          </div>
        </div>
      </section>

      {/* ─── TEF CANADA INFO ─── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Qu'est-ce que le TEF Canada ?
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Le Test d'Évaluation de Français (TEF Canada) est le test de langue officiel reconnu par l'IRCC pour les demandes d'immigration.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🏛️', title: 'Reconnu par l\'IRCC', desc: 'Obligatoire pour Entrée Express, PVP et regroupement familial.' },
              { icon: '📅', title: 'Validité 2 ans', desc: 'Tes résultats sont valables 2 ans pour ta demande d\'immigration.' },
              { icon: '🎯', title: 'Niveau NCLC 7', desc: 'Vise un score B2 minimum pour maximiser tes points CRS.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm text-center border border-gray-100">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4 MODULES ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Les 4 modules du TEF Canada
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Entraîne-toi sur chaque module avec des séries réalistes calibrées sur l'examen officiel.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <div
                key={mod.code}
                className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${mod.color} hover:shadow-md transition-shadow`}
              >
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{mod.name}</h3>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{mod.duration}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{mod.questions}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
                <a
                  href={mod.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-tef-blue hover:underline font-medium mt-3"
                >
                  📄 En savoir plus →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PACKS ─── */}
      <section id="packs" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            Nos packs de préparation
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Choisis le pack qui correspond à ton niveau et à tes objectifs.
          </p>

          {settings.discountRate > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 px-5 py-3 bg-green-50 border border-green-300 rounded-2xl text-sm font-bold text-green-700 max-w-md mx-auto">
              🎉 Remise de {settings.discountRate}% sur tous les packs !
            </div>
          )}

          {packs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>Les packs seront disponibles prochainement.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {packs.map((pack) => {
                const discounted = finalPrice(pack.price)
                const hasDiscount = discounted < pack.price
                return (
                  <div
                    key={pack.id}
                    className={`relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all ${
                      pack.isRecommended
                        ? 'border-2 border-tef-blue shadow-xl shadow-tef-blue/10'
                        : 'border border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {pack.isRecommended && (
                      <div className="absolute top-0 right-0 bg-tef-blue text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl">
                        ⭐ Recommandé
                      </div>
                    )}

                    <div className={`px-5 pt-5 pb-4 ${pack.isRecommended ? 'bg-tef-blue/5' : ''}`}>
                      <h3 className="font-extrabold text-gray-900 text-lg pr-20 leading-tight">{pack.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{pack.description}</p>
                      <div className="flex items-baseline gap-1 mt-3">
                        <span className="text-3xl font-black text-tef-blue">
                          {discounted.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">FCFA</span>
                        {hasDiscount && (
                          <span className="text-sm line-through text-gray-400 ml-1">
                            {pack.price.toLocaleString('fr-FR')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">≈ ${usdPrice(pack.price)} USD</p>
                    </div>

                    <div className="px-5 py-3 flex-1 space-y-1.5 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{moduleLabels[pack.moduleAccess] ?? pack.moduleAccess}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>
                          {pack.maxSessions} session{pack.maxSessions > 1 ? 's' : ''} simultanée{pack.maxSessions > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{pack.aiUsagePerDay} correction{pack.aiUsagePerDay > 1 ? 's' : ''} IA / jour</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{pack.durationDays} jours d'accès</span>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3">
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

          <p className="text-center text-xs text-gray-400 mt-8">
            🔒 Paiement sécurisé · Orange Money · MTN MoMo · Visa · Mastercard
          </p>
        </div>
      </section>

      {/* ─── FREE START ─── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-5xl">🎁</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Commence gratuitement
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Crée ton compte gratuit et accède immédiatement aux séries de Compréhension Écrite et Orale.
            Aucune carte bancaire requise.
          </p>
          <Link
            href="/inscription"
            className="inline-block px-8 py-3.5 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors"
          >
            Démarrer gratuitement →
          </Link>
          <p className="text-xs text-gray-400">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-tef-blue hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="py-16 px-4 bg-tef-blue text-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Une question ?</h2>
          <p className="text-blue-200">
            Notre équipe est disponible pour t'accompagner dans ta préparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
            >
              💬 WhatsApp : +237 683 008 287
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              ✉️ Nous contacter
            </Link>
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
