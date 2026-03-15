'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  difficulty: string
  module: { name: string; code: string }
}

const moduleIcons: Record<string, string> = { CE: '📖', CO: '🎧', EE: '✍️', EO: '🎤' }
const difficultyColor: Record<string, string> = {
  facile: 'bg-green-100 text-green-700',
  moyen: 'bg-yellow-100 text-yellow-700',
  difficile: 'bg-red-100 text-red-700',
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
      <section className="bg-tef-blue text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Entraînement Gratuit</h1>
          <p className="text-blue-200">
            Teste-toi sur les 4 modules du TEF Canada sans créer de compte.
            3 séries disponibles par module.
          </p>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
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
              {['CE', 'CO', 'EE', 'EO'].map((code) => {
                const moduleSeries = byModule[code] || []
                if (moduleSeries.length === 0) return null
                const moduleName = moduleSeries[0]?.module.name
                return (
                  <div key={code}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      {moduleIcons[code]} {moduleName}
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {moduleSeries.map((s) => (
                        <Link
                          key={s.id}
                          href={
                            code === 'EE'
                              ? `/dashboard/serie/${s.id}/ee`
                              : code === 'EO'
                              ? `/dashboard/serie/${s.id}/eo`
                              : `/dashboard/serie/${s.id}`
                          }
                          className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-tef-blue hover:shadow-md transition-all group"
                        >
                          <h3 className="font-semibold text-gray-900 group-hover:text-tef-blue transition-colors mb-2 text-sm">
                            {s.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[s.difficulty.toLowerCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                            {s.difficulty}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-14 text-center bg-blue-50 rounded-2xl p-8 space-y-3">
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
