'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  isFree: boolean
  module: { name: string; code: string }
}

const MODULE_META: Record<string, { questions: number; duration: number; desc: string }> = {
  CE: { questions: 40, duration: 60, desc: 'Documents, textes lacunaires, articles de presse' },
  CO: { questions: 40, duration: 40, desc: 'Annonces, dialogues et interviews audio' },
}

export default function EntrainementGratuitPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/series?free=true')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSeries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const byModule = series.reduce<Record<string, Series[]>>((acc, s) => {
    const code = s.module.code
    if (!acc[code]) acc[code] = []
    acc[code].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-tef-night text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.15em] mb-3">Accès gratuit</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Entraînement gratuit</h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-xl mx-auto mb-5">
            Testez les modules de compréhension du TEF Canada sans créer de compte.
            Accès immédiat, aucune carte bancaire requise.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto">
            <div className="flex-1 inline-flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 text-left">
              <svg className="w-4 h-4 text-tef-red flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p>
                <span className="text-white font-semibold">Compte gratuit</span> : EE et EO accessibles avec{' '}
                <span className="text-tef-red font-semibold">2 corrections IA offertes / mois</span>.
              </p>
            </div>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-tef-red hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              Créer un compte
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SÉRIES GRATUITES ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Chargement des séries…</div>
          ) : series.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm mb-4">Les séries gratuites seront disponibles prochainement.</p>
              <Link href="/connexion" className="text-tef-blue hover:underline text-sm font-medium">
                Se connecter pour accéder aux séries payantes →
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {(['CE', 'CO'] as const).map((code) => {
                const moduleSeries = byModule[code] || []
                if (moduleSeries.length === 0) return null
                const moduleName = moduleSeries[0]?.module.name
                const meta = MODULE_META[code]
                return (
                  <div key={code}>
                    {/* En-tête module */}
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                      <div className="w-9 h-9 bg-tef-blue rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {code}
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-base leading-tight">{moduleName}</h2>
                        <p className="text-xs text-gray-400">{meta.desc}</p>
                      </div>
                      <span className="ml-auto text-xs font-semibold text-tef-blue bg-tef-blue/10 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {moduleSeries.length} série{moduleSeries.length > 1 ? 's' : ''} gratuite{moduleSeries.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Cartes séries */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {moduleSeries.map((s, i) => (
                        <Link
                          key={s.id}
                          href={`/dashboard/serie/${s.id}`}
                          className="block bg-white rounded-xl p-5 border border-gray-100 hover:border-tef-blue/30 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-tef-blue text-white rounded">
                              Série {i + 1}
                            </span>
                            <span className="text-[10px] font-semibold text-tef-blue bg-tef-blue/10 px-2 py-0.5 rounded border border-tef-blue/20">
                              Gratuite
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-tef-blue transition-colors">
                              {s.title}
                            </h3>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-tef-blue group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-400">
                            <span>{meta.questions} questions</span>
                            <span className="text-gray-200">·</span>
                            <span>{meta.duration} min</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── EE / EO — accessibles avec un compte gratuit ── */}
          <div className="mt-12">

            {/* Banner IA */}
            <div className="mb-5 bg-tef-night rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 bg-tef-red/20 border border-tef-red/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-tef-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">2 corrections IA offertes par mois — avec un compte gratuit</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Créez un compte en 30 secondes pour accéder aux modules Expression Écrite et Expression Orale,
                  et recevez chaque mois 2 évaluations IA avec score NCLC, feedback détaillé et texte amélioré.
                </p>
              </div>
              <Link
                href="/inscription"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-tef-red hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                Créer mon compte gratuit
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  code: 'EE',
                  name: 'Expression Écrite',
                  meta: '60 min · 2 tâches',
                  desc: 'Suite d\'article (80 mots min.) et lettre au journal (200 mots min.) évaluées par IA sur 450 pts.',
                  features: ['Score NCLC instantané', 'Feedback personnalisé', 'Texte corrigé au niveau supérieur'],
                },
                {
                  code: 'EO',
                  name: 'Expression Orale',
                  meta: '15 min · 2 sections',
                  desc: 'Section formelle et informelle enregistrées via le navigateur, avec évaluation et axes de progression.',
                  features: ['Évaluation IA optionnelle', 'Score CECRL + NCLC', 'Grille d\'auto-évaluation'],
                },
              ].map(({ code, name, meta, desc, features }) => (
                <div
                  key={code}
                  className="rounded-xl border border-tef-blue/15 bg-white p-6 flex flex-col gap-4 hover:border-tef-blue/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-tef-red flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {code}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{meta}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-tef-red bg-red-50 border border-red-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      Correction IA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  <ul className="space-y-1.5">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3 h-3 text-tef-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-50">
                    <Link
                      href="/inscription"
                      className="flex-1 text-center py-2 bg-tef-blue hover:bg-tef-night text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Créer un compte gratuit
                    </Link>
                    <Link
                      href="/packs"
                      className="px-3 py-2 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:border-gray-300 transition-colors"
                    >
                      Packs
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="mt-10 bg-tef-night rounded-xl px-8 py-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Accédez à plus de séries</h3>
            <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Nos packs donnent accès à toutes les séries CE, CO, EE et EO avec correction par IA.
            </p>
            <Link
              href="/packs"
              className="inline-flex items-center gap-2 px-7 py-3 bg-tef-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Voir les packs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
