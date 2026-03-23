'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  isFree: boolean
  module: { name: string; code: string }
}

const moduleConfig: Record<string, { icon: string; borderColor: string; bgColor: string }> = {
  CE: { icon: '📖', borderColor: 'border-blue-400',   bgColor: 'bg-blue-50'   },
  CO: { icon: '🎧', borderColor: 'border-purple-400', bgColor: 'bg-purple-50' },
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

      {/* ─── HERO ─── */}
      <section className="bg-tef-blue text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Entraînement Gratuit</h1>
          <p className="text-blue-200 mb-5">
            Teste-toi sur les modules de compréhension du TEF Canada sans créer de compte.
            Des séries gratuites disponibles pour commencer dès maintenant.
          </p>
          <div className="inline-flex items-start gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-sm text-blue-100 text-left max-w-md mx-auto">
            <span className="text-lg shrink-0">✍️🎤</span>
            <p>
              Pour accéder aux simulateurs d&apos;Expression Écrite et Orale,{' '}
              <Link
                href="/packs"
                className="text-white font-semibold underline underline-offset-2 hover:text-yellow-300 transition-colors"
              >
                découvrez nos packs →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FREE SERIES ─── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Chargement des séries…</div>
          ) : series.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-4">🔜</p>
              <p>Les séries gratuites seront disponibles prochainement.</p>
              <Link href="/connexion" className="inline-block mt-4 text-tef-blue hover:underline font-medium">
                Connecte-toi pour accéder aux séries payantes →
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {(['CE', 'CO'] as const).map((code) => {
                const moduleSeries = byModule[code] || []
                if (moduleSeries.length === 0) return null
                const moduleName = moduleSeries[0]?.module.name
                const cfg = moduleConfig[code]
                return (
                  <div key={code}>
                    {/* Module header */}
                    <div className={`flex items-center gap-3 mb-5 pb-3 border-b-2 ${cfg.borderColor}`}>
                      <span className="text-2xl">{cfg.icon}</span>
                      <h2 className="text-xl font-bold text-gray-900">{moduleName}</h2>
                      <span className="ml-auto text-xs text-gray-400 font-medium">
                        {moduleSeries.length} série{moduleSeries.length > 1 ? 's' : ''} gratuite{moduleSeries.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* 3 series cards in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {moduleSeries.map((s, i) => (
                        <Link
                          key={s.id}
                          href={`/dashboard/serie/${s.id}`}
                          className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-tef-blue hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bgColor} text-gray-500`}>
                              Série {i + 1}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                              🎁 Gratuite
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-tef-blue transition-colors text-sm leading-snug">
                            {s.title}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── Locked EE / EO ─── */}
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {[
              { code: 'EE', icon: '✍️', name: 'Expression Écrite',  border: 'border-green-300'  },
              { code: 'EO', icon: '🎤', name: 'Expression Orale',   border: 'border-orange-300' },
            ].map(({ code, icon, name, border }) => (
              <div
                key={code}
                className={`rounded-xl border-2 ${border} bg-gray-50 p-6 flex flex-col items-center text-center gap-3`}
              >
                <div className="text-3xl">{icon}</div>
                <div>
                  <h3 className="font-bold text-gray-700 mb-1">{name}</h3>
                  <p className="text-xs text-gray-500">Module réservé aux abonnés</p>
                </div>
                <Link
                  href="/packs"
                  className="inline-block px-5 py-2 bg-tef-blue text-white text-xs font-bold rounded-lg hover:bg-tef-blue-hover transition-colors"
                >
                  🔓 Débloquer avec un pack →
                </Link>
              </div>
            ))}
          </div>

          {/* ─── CTA ─── */}
          <div className="mt-10 text-center bg-blue-50 rounded-2xl p-8 space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Tu veux accéder à plus de séries ?</h3>
            <p className="text-gray-600 text-sm">
              Nos packs donnent accès à des dizaines de séries supplémentaires avec correction par IA.
            </p>
            <Link
              href="/packs"
              className="inline-block px-8 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors"
            >
              Voir les packs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
