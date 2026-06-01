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
    duration: '60 min',
    questions: '40 questions',
    desc: 'Documents du quotidien, textes lacunaires, articles de presse et graphiques.',
    accent: 'border-tef-blue',
    codeBg: 'bg-tef-blue text-white',
  },
  {
    code: 'CO',
    name: 'Compréhension Orale',
    duration: '40 min',
    questions: '40 questions',
    desc: 'Annonces, répondeurs, interviews radio. Chaque audio ne se joue qu\'une seule fois.',
    accent: 'border-purple-600',
    codeBg: 'bg-purple-600 text-white',
  },
  {
    code: 'EE',
    name: 'Expression Écrite',
    duration: '60 min',
    questions: '2 tâches',
    desc: 'Suite d\'article (80 mots min.) et lettre au journal (200 mots min.) avec correction IA.',
    accent: 'border-emerald-600',
    codeBg: 'bg-emerald-600 text-white',
  },
  {
    code: 'EO',
    name: 'Expression Orale',
    duration: '15 min',
    questions: '2 sections',
    desc: 'Obtenir des informations (registre formel) et présenter pour convaincre (registre informel).',
    accent: 'border-blue-500',
    codeBg: 'bg-blue-500 text-white',
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

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-tef-blue via-blue-800 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
              Reconnu par l&apos;IRCC · Programme Entrée Express
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Préparez votre TEF Canada.<br />
              <span className="text-tef-red">Atteignez votre niveau NCLC.</span>
            </h1>
            <p className="mt-6 text-blue-100 text-lg leading-relaxed max-w-2xl">
              La plateforme de préparation structurée sur les 4 modules officiels du TEF Canada,
              avec correction par intelligence artificielle et feedback CECRL/NCLC instantané.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-tef-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-base"
              >
                Commencer gratuitement
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="#packs"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-base"
              >
                Voir les packs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRE DE CRÉDIBILITÉ ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { value: '4', label: 'modules officiels TEF' },
              { value: '15+', label: 'séries CO disponibles' },
              { value: 'NCLC', label: 'Scoring IA certifié' },
              { value: '30s', label: "Inscription sans CB" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <p className="text-2xl font-extrabold text-tef-blue tracking-tight">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LE TEF CANADA ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-tef-red text-center mb-3">L&apos;examen</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Qu&apos;est-ce que le TEF Canada ?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                  </svg>
                ),
                title: 'Reconnu par l\'IRCC',
                desc: 'Test officiel obligatoire pour Entrée Express, le PVP et le regroupement familial au Canada.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
                title: 'Résultats valables 2 ans',
                desc: 'Votre score TEF Canada reste valide 2 ans pour accompagner votre demande d\'immigration.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: 'Objectif NCLC 7 minimum',
                desc: 'Visez au moins B2 (NCLC 7) pour maximiser vos points CRS dans le système Entrée Express.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="w-11 h-11 bg-tef-blue/10 text-tef-blue rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LES 4 MODULES ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-tef-red text-center mb-3">Structure</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Les 4 modules du TEF Canada
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.code}
                className={`bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 ${mod.accent} p-5 flex gap-4`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${mod.codeBg} flex items-center justify-center text-xs font-extrabold tracking-tight`}>
                  {mod.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{mod.name}</h3>
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{mod.duration}</span>
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{mod.questions}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-tef-blue via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 text-center mb-3">Démarrage</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">
            Commencez en 3 étapes
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Créez votre compte',
                desc: 'Inscription en 30 secondes. Accès immédiat aux séries gratuites CE et CO. Aucune carte bancaire requise.',
              },
              {
                step: '02',
                title: 'Passez une série',
                desc: 'Conditions réelles : chronomètre, audio unique pour CO, compteur de mots pour EE. 40 questions par module.',
              },
              {
                step: '03',
                title: 'Obtenez votre score',
                desc: 'Résultat CECRL et NCLC instantané. Pour EE et EO, feedback IA détaillé avec texte corrigé et pistes d\'amélioration.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <p className="text-5xl font-black text-white/10 leading-none mb-3">{item.step}</p>
                <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-tef-blue font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Créer mon compte gratuitement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PACKS ── */}
      <section id="packs" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-tef-red text-center mb-3">Tarifs</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            Packs de préparation
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10 max-w-xl mx-auto">
            Choisissez le pack adapté à vos objectifs. Paiement via Orange Money, MTN MoMo ou carte bancaire.
          </p>

          {settings.discountRate > 0 && (
            <div className="flex items-center justify-center gap-2 mb-8 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700 max-w-sm mx-auto">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
              </svg>
              Remise de {settings.discountRate}% appliquée sur tous les packs
            </div>
          )}

          {packs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Packs disponibles prochainement.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => {
                const discounted = finalPrice(pack.price)
                const hasDiscount = discounted < pack.price
                return (
                  <div
                    key={pack.id}
                    className={`relative bg-white rounded-xl flex flex-col transition-all ${
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

                    <div className={`px-5 pt-6 pb-4 ${pack.isRecommended ? 'pt-7' : ''}`}>
                      <h3 className="font-extrabold text-gray-900 text-base">{pack.name}</h3>
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

                    <div className="px-5 py-3 flex-1 space-y-2 border-t border-gray-50">
                      {[
                        moduleLabels[pack.moduleAccess] ?? pack.moduleAccess,
                        `${pack.maxSessions} session${pack.maxSessions > 1 ? 's' : ''} simultanée${pack.maxSessions > 1 ? 's' : ''}`,
                        `${pack.aiUsagePerDay} correction${pack.aiUsagePerDay > 1 ? 's' : ''} IA / jour`,
                        `${pack.durationDays} jours d'accès`,
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 text-tef-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="px-5 pb-5 pt-3">
                      <button
                        onClick={() => openPayment(pack)}
                        className={`w-full py-2.5 font-bold rounded-lg text-sm transition-colors ${
                          pack.isRecommended
                            ? 'bg-tef-blue text-white hover:bg-blue-800'
                            : 'bg-gray-900 text-white hover:bg-gray-700'
                        }`}
                      >
                        S&apos;abonner
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
        </div>
      </section>

      {/* ── POURQUOI TEF-LAB ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-tef-red text-center mb-3">Nos engagements</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi TEF-Lab ?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                ),
                title: 'Structure authentique',
                desc: 'Nos séries reproduisent fidèlement les 8 parties du TEF Canada : types de documents, durées, audio unique pour le CO, structure des tâches EE et EO.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'Correction IA et score NCLC',
                desc: 'Vos productions écrites et orales sont évaluées par IA avec un score sur 450 pts, un niveau CECRL et un niveau NCLC — les indicateurs exacts utilisés par l\'IRCC.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3M6.75 21h10.5" />
                  </svg>
                ),
                title: 'Conçu pour les candidats camerounais',
                desc: 'Paiement via Orange Money et MTN MoMo. Interface mobile optimisée pour les connexions variables. Support WhatsApp disponible 7j/7.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <div className="w-11 h-11 bg-tef-blue/10 text-tef-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Accès gratuit, sans carte bancaire
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Créez votre compte et accédez immédiatement aux séries de Compréhension Écrite et Orale.
            Passez à un pack payant quand vous êtes prêt.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
            {['Séries CE et CO incluses', 'Score CECRL instantané', 'Sans carte bancaire'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-tef-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {benefit}
              </div>
            ))}
          </div>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-tef-blue text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
          >
            Créer mon compte
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-tef-blue hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-16 px-4 bg-tef-blue">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Une question sur votre préparation ?</h2>
          <p className="text-blue-200 text-sm mb-7">
            Notre équipe est disponible pour vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +237 683 008 287
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Formulaire de contact
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
