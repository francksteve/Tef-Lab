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
          <div className="inline-flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white/70 text-left max-w-sm mx-auto">
            <svg className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p>
              Expression Écrite et Orale disponibles avec un pack.{' '}
              <Link href="/packs" className="text-white font-semibold hover:text-white/80 transition-colors">
                Voir les tarifs →
              </Link>
            </p>
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

          {/* ── Modules verrouillés ── */}
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {[
              {
                code: 'EE',
                name: 'Expression Écrite',
                desc: '2 tâches de rédaction chronométrées avec correction par IA et score NCLC instantané.',
              },
              {
                code: 'EO',
                name: 'Expression Orale',
                desc: '2 sections d\'enregistrement (formel + informel) avec évaluation et feedback IA.',
              },
            ].map(({ code, name, desc }) => (
              <div
                key={code}
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 flex flex-col items-center text-center gap-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-black">
                    {code}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 text-sm mb-1">{name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                  Disponible avec un pack
                </span>
                <Link
                  href="/packs"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-tef-blue text-white text-xs font-bold rounded-lg hover:bg-tef-night transition-colors"
                >
                  Voir les packs
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ))}
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
