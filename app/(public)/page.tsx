'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [waNum, setWaNum] = useState('237683008287')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s?.whatsappNumber) setWaNum(s.whatsappNumber)
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-tef-night">
        {/* Bande tricolore verticale décorative */}
        <div className="absolute left-0 top-0 bottom-0 flex w-1.5">
          <div className="flex-1 bg-[#003087]" />
          <div className="flex-1 bg-white/20" />
          <div className="flex-1 bg-[#E30613]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10 sm:py-14">
          {/* Deux colonnes : texte à gauche, modules à droite */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Colonne gauche — texte */}
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Simulation · 4 modules · Score NCLC
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
                Réussissez le<br />
                <span className="text-tef-red">TEF Canada</span><br />
                du premier coup.
              </h1>
              <p className="mt-4 text-white/75 text-sm leading-relaxed">
                Simulation des 4 modules dans les conditions réelles de l&apos;examen.
                Score NCLC instantané. Sans mauvaises surprises le jour J.
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
                <Link
                  href="/packs"
                  className="inline-flex items-center justify-center px-7 py-3 border border-white/20 text-white/80 hover:border-white/40 hover:text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Voir les tarifs
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
                {[
                  { n: '4', label: 'modules officiels' },
                  { n: '15+', label: 'séries CO' },
                  { n: 'NCLC', label: 'score IA instantané' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white leading-none">{s.n}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 pl-6 border-l border-white/20">
                  <div className="w-8 h-8 rounded-lg bg-tef-red/20 border border-tef-red/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-tef-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none">2 / mois</p>
                    <p className="text-white/60 text-xs mt-0.5">corrections IA offertes</p>
                  </div>
                </div>
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
                    <p className="text-white/60 text-xs mt-0.5">{m.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="py-9 px-4 sm:px-6 bg-background">
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
      <section className="py-7 px-4 sm:px-6 bg-background border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'L\'examen de référence en immigration',
                desc: 'Le TEF Canada est l\'un des tests de langue acceptés pour Entrée Express, le PVP et le regroupement familial.',
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
                desc: 'Visez B2 minimum (NCLC 7) pour maximiser vos points CRS dans Entrée Express.',
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
      <section className="py-10 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          <div className="mb-7">
            <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              De l&apos;inscription à votre score NCLC
            </h2>
            <p className="text-gray-500 mt-3 text-sm max-w-lg leading-relaxed">
              Trois étapes. Le premier résultat arrive en moins de 15 minutes.
            </p>
          </div>

          {/* Progression visible sur desktop */}
          <div className="hidden sm:flex items-center mb-8">
            <div className="w-10 h-10 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">01</div>
            <div className="flex-1 flex items-center mx-2">
              <div className="flex-1 h-px bg-gray-200" />
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">02</div>
            <div className="flex-1 flex items-center mx-2">
              <div className="flex-1 h-px bg-gray-200" />
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">03</div>
          </div>

          {/* Cartes */}
          <div className="grid sm:grid-cols-3 gap-5">

            {/* Étape 01 */}
            <div className="bg-background border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-tef-blue/30 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 sm:hidden">
                <div className="w-8 h-8 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0">01</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">Créez votre compte</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Inscription gratuite en 30 secondes. Pas de carte bancaire. Accès aux 4 modules, dont 2 corrections IA offertes/mois sur EE et EO.
                </p>
              </div>
              {/* Preview : modules débloqués */}
              <div className="mt-auto bg-white border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Accès inclus avec un compte gratuit</p>
                <div className="space-y-1.5">
                  {[
                    { code: 'CE', label: 'Compréhension Écrite', badge: null as string | null },
                    { code: 'CO', label: 'Compréhension Orale', badge: null as string | null },
                    { code: 'EE', label: 'Expression Écrite', badge: '2 IA/mois' },
                    { code: 'EO', label: 'Expression Orale', badge: '2 IA/mois' },
                  ].map(m => (
                    <div key={m.code} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${m.badge ? 'bg-red-50 text-tef-red' : 'bg-tef-blue/8 text-tef-blue'}`}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="font-bold">{m.code}</span>
                      <span className="text-[11px]">{m.label}</span>
                      {m.badge && <span className="ml-auto text-[10px] font-bold">{m.badge}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Étape 02 */}
            <div className="bg-background border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-tef-blue/30 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 sm:hidden">
                <div className="w-8 h-8 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0">02</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">Passez une série</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Conditions réelles : minuterie active, audio unique en CO, compteur de mots en EE. 40 questions par module.
                </p>
              </div>
              {/* Preview : interface quiz */}
              <div className="mt-auto bg-white border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-tef-blue bg-tef-blue/8 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-tef-blue" />
                    CE · Série 1
                  </span>
                  <span className="font-mono text-xs font-black text-tef-red bg-red-50 px-2 py-0.5 rounded-md">47:23</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Question 12 / 40</span>
                    <span className="text-[10px] text-gray-400">11 répondues</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-tef-blue rounded-full transition-all" style={{ width: '28%' }} />
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 flex-1 rounded-sm ${i < 11 ? 'bg-tef-blue/60' : i === 11 ? 'bg-tef-blue ring-1 ring-tef-blue ring-offset-1' : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Étape 03 */}
            <div className="bg-background border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-tef-blue/30 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 sm:hidden">
                <div className="w-8 h-8 rounded-full bg-tef-blue text-white flex items-center justify-center text-xs font-black flex-shrink-0">03</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">Consultez votre score</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Niveau CECRL et équivalent NCLC instantané. Pour EE et EO, feedback IA avec texte corrigé et axes d&apos;amélioration.
                </p>
              </div>
              {/* Preview : résultat */}
              <div className="mt-auto bg-white border border-gray-100 rounded-xl p-3.5 space-y-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Résultat · EE Expression Écrite</p>
                <div className="flex items-center gap-3">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-black text-tef-blue leading-none">B2</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wide">CECRL</div>
                  </div>
                  <div className="h-8 w-px bg-gray-100" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-black text-tef-blue leading-none">7</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wide">NCLC</div>
                  </div>
                  <div className="h-8 w-px bg-gray-100" />
                  <div className="text-center flex-1">
                    <div className="text-lg font-black text-gray-800 leading-none">312</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wide">/ 450 pts</div>
                  </div>
                </div>
                <div className="bg-tef-blue/5 border border-tef-blue/10 rounded-lg px-3 py-2 text-[11px] text-gray-600 leading-snug italic">
                  &ldquo;Registre formel maîtrisé. Enrichissez le lexique pour atteindre C1.&rdquo;
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
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
      <section className="py-9 px-4 sm:px-6 bg-background border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-tef-red text-xs font-bold uppercase tracking-[0.15em] mb-2">Tarifs</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Packs de préparation</h2>
              <p className="text-gray-500 mt-2 text-sm">
                À partir de <span className="font-bold text-tef-blue">5 000 FCFA</span> · 30 jours d&apos;accès · Activation immédiate
              </p>
            </div>
            <Link
              href="/packs"
              className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-tef-blue hover:bg-tef-night text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Voir tous les packs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3M6.75 21h10.5', label: 'Orange Money · MTN MoMo · Visa · Mastercard' },
              { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z', label: 'Paiement sécurisé, accès activé instantanément' },
              { icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', label: 'Correction IA incluse selon le pack choisi' },
            ].map(item => (
              <div key={item.label} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-tef-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENTS ── */}
      <section className="py-9 px-4 sm:px-6 bg-white border-t border-gray-100">
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
                desc: 'Vos productions EE et EO sont évaluées par IA sur 450 pts avec niveau CECRL et NCLC — les indicateurs du TEF Canada.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                title: 'Accessible partout',
                desc: 'Paiement via Orange Money, MTN MoMo, Visa et Mastercard. Interface mobile-first optimisée pour les connexions variables. Support WhatsApp disponible.',
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
      <section className="py-8 px-4 sm:px-6 bg-tef-night">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Accès gratuit, sans carte bancaire.
            </h2>
            <p className="text-white/50 text-sm mt-2">
              Séries CE et CO + 2 corrections IA gratuites/mois sur EE et EO. Passez à un pack payant quand vous êtes prêt.
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
      <section className="py-5 px-4 sm:px-6 bg-tef-night border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">Une question ? Notre équipe est disponible.</p>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 font-semibold rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +{waNum}
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

    </div>
  )
}
