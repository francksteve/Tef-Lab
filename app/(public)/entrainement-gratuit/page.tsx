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

const moduleDetails: Record<string, { questions: number; duration: number; hoverBorder: string; hoverText: string; pillBg: string; pillText: string; iconCircle: string }> = {
  CE: {
    questions: 40,
    duration: 60,
    hoverBorder: 'hover:border-blue-500',
    hoverText: 'group-hover:text-blue-700',
    pillBg: 'bg-blue-100',
    pillText: 'text-blue-700',
    iconCircle: 'bg-blue-100',
  },
  CO: {
    questions: 40,
    duration: 40,
    hoverBorder: 'hover:border-purple-500',
    hoverText: 'group-hover:text-purple-700',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-700',
    iconCircle: 'bg-purple-100',
  },
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
          <p className="text-blue-200 mb-4">
            Teste-toi sur les modules de compréhension du TEF Canada sans créer de compte.
            Des séries gratuites disponibles pour commencer dès maintenant.
          </p>
          {/* Free badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/40 rounded-full px-4 py-1.5 text-sm text-green-200 font-medium mb-5">
            <span>🆓</span>
            <span>Aucune carte bancaire requise</span>
          </div>
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
                const det = moduleDetails[code]
                return (
                  <div key={code}>
                    {/* Module header */}
                    <div className={`flex items-center gap-3 mb-5 pb-3 border-b-2 ${cfg.borderColor}`}>
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${det.iconCircle} text-xl`}>
                        {cfg.icon}
                      </span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${det.pillBg} ${det.pillText}`}>
                        {code}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">{moduleName}</h2>
                      <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${det.pillBg} ${det.pillText}`}>
                        {moduleSeries.length} série{moduleSeries.length > 1 ? 's' : ''} gratuite{moduleSeries.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* 3 series cards in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {moduleSeries.map((s, i) => (
                        <Link
                          key={s.id}
                          href={`/dashboard/serie/${s.id}`}
                          className={`block bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${det.hoverBorder} hover:shadow-lg transition-all group`}
                        >
                          {/* Icon circle + badges row */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${det.iconCircle} flex items-center justify-center text-xl`}>
                              {cfg.icon}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bgColor} ${det.pillText}`}>
                                Série {i + 1}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                🎁 Gratuite
                              </span>
                            </div>
                          </div>

                          {/* Stats badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                              {det.questions} questions
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                              {det.duration} min
                            </span>
                          </div>

                          {/* Title + arrow */}
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-bold text-gray-900 ${det.hoverText} transition-colors text-base leading-snug`}>
                              {s.title}
                            </h3>
                            <span className="text-gray-400 group-hover:text-current transition-all group-hover:translate-x-1 transform flex-shrink-0 text-base">
                              →
                            </span>
                          </div>
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
              {
                code: 'EE',
                icon: '✍️',
                name: 'Expression Écrite',
                border: 'border-green-200',
                bg: 'bg-green-50',
                lockCircle: 'bg-gray-200',
                desc: '2 tâches de rédaction (lettre + article) avec correction par intelligence artificielle.',
              },
              {
                code: 'EO',
                icon: '🎤',
                name: 'Expression Orale',
                border: 'border-orange-200',
                bg: 'bg-orange-50',
                lockCircle: 'bg-gray-200',
                desc: '2 sections d\'enregistrement (formel + informel) avec évaluation et feedback IA.',
              },
            ].map(({ code, icon, name, border, bg, lockCircle, desc }) => (
              <div
                key={code}
                className={`rounded-xl border-2 ${border} ${bg} p-6 flex flex-col items-center text-center gap-3`}
              >
                {/* Lock icon circle */}
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full ${lockCircle} flex items-center justify-center text-3xl opacity-60`}>
                    {icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                    🔒
                  </div>
                </div>

                {/* Badge */}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-600 uppercase tracking-wide">
                  Disponible avec un pack
                </span>

                <div>
                  <h3 className="font-bold text-gray-700 mb-1 text-base">{name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{desc}</p>
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
          <div className="mt-10 text-center bg-gradient-to-r from-tef-blue to-blue-700 rounded-2xl p-8 space-y-3">
            <h3 className="text-xl font-bold text-white">Tu veux accéder à plus de séries ?</h3>
            <p className="text-blue-200 text-sm">
              Nos packs donnent accès à des dizaines de séries supplémentaires avec correction par IA.
            </p>
            <Link
              href="/packs"
              className="inline-block px-8 py-3 bg-white text-tef-blue font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Voir les packs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
