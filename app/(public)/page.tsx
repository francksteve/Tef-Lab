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

  const finalPrice = (price: number) => Math.round(price * (1 - settings.discountRate / 100))
  const usdPrice = (price: number) => (finalPrice(price) * settings.usdExchangeRate).toFixed(2)
  const openPayment = (pack: Pack) => { setSelectedPack(pack); setPayModalOpen(true) }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#001344]">
        {/* Bande tricolore verticale décorative */}
        <div className="absolute left-0 top-0 bottom-0 flex w-1.5">
          <div className="flex-1 bg-[#003087]" />
          <div className="flex-1 bg-white/20" />
          <div className="flex-1 bg-[#E30613]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-14 sm:py-20">
          {/* Deux colonnes : texte à gauche, modules à droite */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Colonne gauche — texte */}
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Test d&apos;Évaluation de Français · Reconnu IRCC
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
                Préparez votre<br />
                <span className="text-tef-red">TEF Canada</span><br />
                avec méthode.
              </h1>
              <p className="mt-4 text-white/60 text-sm leading-relaxed">
                Entraînement sur les 4 modules officiels, conditions réelles d&apos;examen,
                et correction par IA avec score NCLC instantané.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center px-7 py-3 bg-tef-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Commencer gratuitement
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#packs"
                  className="inline-flex items-center justify-center px-7 py-3 border border-white/20 text-white/80 hover:border-white/40 hover:text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Voir les tarifs
                </a>
              </div>
              <div className="mt-7 flex gap-8">
                {[
                  { n: '4', label: 'modules officiels' },
                  { n: '15+', label: 'séries CO' },
                  { n: 'NCLC', label: 'score IA instantané' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white leading-none">{s.n}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite — aperçu des 4 modules */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {[
                { code: 'CE', name: 'Compréhension Écrite',  meta: '60 min · 40 QCM',      color: 'bg-tef-blue' },
                { code: 'CO', name: 'Compréhension Orale',   meta: '40 min · 40 QCM',      color: 'bg-tef-blue' },
                { code: 'EE', name: 'Expression Écrite',     meta: '60 min · 2 tâches',    color: 'bg-tef-red' },
                { code: 'EO', name: 'Expression Orale',      meta: '15 min · 2 sections',  color: 'bg-tef-red' },
              ].map(m => (
                <div key={m.code} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                  <div className={`w-9 h-9 ${m.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>
                    {m.code}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-tight">{m.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{m.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Structure de l&apos;examen</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Les 4 modules du TEF Canada</h2>
            <p className="text-gray-500 mt-3 max-w-xl text-sm leading-relaxed">
              Chaque module est chronométré et reproduit les conditions réelles de l&apos;examen officiel.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                code: 'CE', label: 'Compréhension Écrite', color: 'bg-tef-blue', border: 'border-tef-blue',
                meta: '60 min · 40 questions',
                desc: 'Documents du quotidien, textes lacunaires, graphiques et articles de presse.',
                tag: 'Compréhension',
              },
              {
                code: 'CO', label: 'Compréhension Orale', color: 'bg-tef-blue', border: 'border-tef-blue',
                meta: '40 min · 40 questions',
                desc: 'Annonces, répondeurs, interviews. Chaque audio ne se joue qu\'une seule fois.',
                tag: 'Compréhension',
              },
              {
                code: 'EE', label: 'Expression Écrite', color: 'bg-tef-red', border: 'border-tef-red',
                meta: '60 min · 2 tâches · /450 pts',
                desc: 'Suite d\'article (80 mots min.) et lettre au journal (200 mots min.) avec score NCLC.',
                tag: 'Expression',
              },
              {
                code: 'EO', label: 'Expression Orale', color: 'bg-tef-red', border: 'border-tef-red',
                meta: '15 min · 2 sections · /450 pts',
                desc: 'Dialogue formel (obtenir des informations) et présentation informelle pour convaincre.',
                tag: 'Expression',
              },
            ].map(m => (
              <div key={m.code} className={`flex gap-5 p-5 rounded-xl border-l-4 ${m.border} border border-gray-100 hover:shadow-sm transition-shadow`}>
                <div className={`flex-shrink-0 w-12 h-12 ${m.color} rounded-xl flex items-center justify-center text-white text-xs font-black tracking-tight`}>
                  {m.code}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.code === 'CE' || m.code === 'CO' ? 'bg-tef-blue/10 text-tef-blue' : 'bg-red-50 text-tef-red'}`}>
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1.5">{m.meta}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LE TEF CANADA ── */}
      <section className="py-10 px-4 sm:px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Reconnu par l\'IRCC',
                desc: 'Test de langue officiel obligatoire pour Entrée Express, le PVP et le regroupement familial.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                  </svg>
                ),
              },
              {
                title: 'Résultats valables 2 ans',
                desc: 'Votre score TEF Canada est valide 2 ans pour accompagner votre demande d\'immigration.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
              },
              {
                title: 'Objectif NCLC 7',
                desc: 'Visez B2 minimum (NCLC 7) pour maximiser vos points CRS dans le système Entrée Express.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 bg-tef-blue text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Démarrage</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Trois étapes pour commencer</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Créez votre compte',
                desc: 'Inscription gratuite en 30 secondes. Accès immédiat aux séries CE et CO. Aucune carte bancaire.',
              },
              {
                n: '02',
                title: 'Passez une série',
                desc: 'Conditions réelles : minuterie, audio unique pour CO, compteur de mots pour EE. 40 questions par module.',
              },
              {
                n: '03',
                title: 'Lisez votre score',
                desc: 'Niveau CECRL et NCLC instantané. Pour EE et EO, feedback IA détaillé avec texte corrigé et axes d\'amélioration.',
              },
            ].map(step => (
              <div key={step.n} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full border-2 border-tef-blue text-tef-blue flex items-center justify-center text-xs font-black">
                    {step.n}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-tef-blue hover:bg-[#001F60] text-white font-bold rounded-lg transition-colors text-sm"
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
      <section id="packs" className="py-12 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Tarifs</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Packs de préparation</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-xl">
              Orange Money, MTN MoMo ou carte bancaire. Accès activé instantanément.
            </p>
          </div>

          {settings.discountRate > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-tef-blue/10 border border-tef-blue/20 text-tef-blue rounded-lg text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
              </svg>
              Remise de {settings.discountRate}% sur tous les packs
            </div>
          )}

          {packs.length === 0 ? (
            <p className="text-gray-400 text-sm">Packs disponibles prochainement.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map(pack => {
                const discounted = finalPrice(pack.price)
                const hasDiscount = discounted < pack.price
                return (
                  <div
                    key={pack.id}
                    className={`relative bg-white flex flex-col rounded-xl border transition-all ${
                      pack.isRecommended
                        ? 'border-tef-blue shadow-lg shadow-tef-blue/10 ring-1 ring-tef-blue/10'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {pack.isRecommended && (
                      <div className="absolute -top-3 left-4">
                        <span className="bg-tef-blue text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          Recommandé
                        </span>
                      </div>
                    )}

                    <div className={`px-5 pb-4 ${pack.isRecommended ? 'pt-7' : 'pt-5'} border-b border-gray-50`}>
                      <p className="font-black text-gray-900 text-base">{pack.name}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">{pack.description}</p>
                      <div className="flex items-baseline gap-1.5 mt-4">
                        <span className="text-3xl font-black text-tef-blue tracking-tight">{discounted.toLocaleString('fr-FR')}</span>
                        <span className="text-sm text-gray-400 font-medium">FCFA</span>
                        {hasDiscount && <span className="text-sm line-through text-gray-300">{pack.price.toLocaleString('fr-FR')}</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">≈ {usdPrice(pack.price)} USD</p>
                    </div>

                    <div className="px-5 py-4 flex-1 space-y-2">
                      {[
                        moduleLabels[pack.moduleAccess] ?? pack.moduleAccess,
                        `${pack.maxSessions} session${pack.maxSessions > 1 ? 's' : ''} simultanée${pack.maxSessions > 1 ? 's' : ''}`,
                        `${pack.aiUsagePerDay} correction${pack.aiUsagePerDay > 1 ? 's' : ''} IA / jour`,
                        `${pack.durationDays} jours d'accès`,
                      ].map(feature => (
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
                            ? 'bg-tef-blue hover:bg-[#001F60] text-white'
                            : 'bg-gray-900 hover:bg-gray-700 text-white'
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

          <p className="mt-8 text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Paiement sécurisé · Orange Money · MTN MoMo · Visa · Mastercard
          </p>
        </div>
      </section>

      {/* ── ENGAGEMENTS ── */}
      <section className="py-12 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Nos engagements</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Pourquoi TEF-Lab ?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-7 border-t border-gray-100 pt-7">
            {[
              {
                title: 'Structure authentique',
                desc: 'Nos séries reproduisent fidèlement les 8 parties du TEF Canada : types de documents, durées, audio unique CO, format des tâches EE et EO.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                ),
              },
              {
                title: 'Score NCLC immédiat',
                desc: 'Vos productions EE et EO sont évaluées par IA sur 450 pts avec niveau CECRL et NCLC — les indicateurs exacts utilisés par l\'IRCC pour Entrée Express.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                title: 'Conçu pour le Cameroun',
                desc: 'Paiement via Orange Money et MTN MoMo. Interface mobile-first optimisée pour les connexions variables. Support WhatsApp disponible.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3M6.75 21h10.5" />
                  </svg>
                ),
              },
            ].map(item => (
              <div key={item.title}>
                <div className="w-10 h-10 bg-tef-blue text-white rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-10 px-4 sm:px-6 bg-[#001344]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Accès gratuit, sans carte bancaire.
            </h2>
            <p className="text-white/50 text-sm mt-2">
              Séries CE et CO incluses dès l&apos;inscription. Passez à un pack payant quand vous êtes prêt.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-tef-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Créer mon compte
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-8 px-4 sm:px-6 bg-[#001344] border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">Une question ? Notre équipe est disponible.</p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 font-semibold rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +237 683 008 287
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-semibold rounded-lg transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      <PaymentModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} pack={selectedPack} />
    </div>
  )
}
