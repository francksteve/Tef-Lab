'use client'
import { useState, useEffect } from 'react'
import OrderModal from '@/components/ui/OrderModal'

interface Pack {
  id: string
  name: string
  price: number
  description: string
  nbModules: number
  nbSeriesPerModule: number
  durationDays: number
}

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/packs')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPacks(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const modules = ['CE', 'CO', 'EE', 'EO']
  const moduleNames: Record<string, string> = {
    CE: 'Compréhension Écrite',
    CO: 'Compréhension Orale',
    EE: 'Expression Écrite',
    EO: 'Expression Orale',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-tef-blue text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Nos packs de préparation</h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Tous les packs incluent un accès complet aux séries d'entraînement et à la correction par IA.
          </p>
        </div>
      </section>

      {/* Packs grid */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Chargement des packs…</div>
          ) : packs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p>Aucun pack disponible pour le moment. Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {packs.map((pack) => (
                <div key={pack.id} className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
                  <div className="bg-tef-blue p-5 text-white">
                    <h2 className="text-xl font-bold">{pack.name}</h2>
                    <p className="text-3xl font-extrabold mt-2">
                      {pack.price.toLocaleString('fr-FR')} <span className="text-base font-medium">FCFA</span>
                    </p>
                  </div>
                  <div className="p-5 flex-1 space-y-4">
                    <p className="text-sm text-gray-600">{pack.description}</p>
                    <ul className="space-y-2">
                      {modules.slice(0, pack.nbModules).map((code) => (
                        <li key={code} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500 font-bold">✓</span>
                          {moduleNames[code]}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span>
                        {pack.nbSeriesPerModule} séries par module
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span>
                        {pack.durationDays} jours d'accès
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span>
                        Correction par IA (EE & EO)
                      </li>
                    </ul>
                  </div>
                  <div className="p-5 border-t">
                    <button
                      onClick={() => { setSelectedPack(pack); setModalOpen(true) }}
                      className="w-full py-3 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Commander ce pack
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Paiement via Orange Money / MTN MoMo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Questions fréquentes</h2>
          {[
            { q: 'Comment fonctionne le paiement ?', a: 'Tu commandes en ligne, puis tu envoies ton paiement par Orange Money ou MTN MoMo au +237 683 008 287. Ton compte est activé après confirmation.' },
            { q: 'Quand mon compte est-il activé ?', a: 'Dans les heures qui suivent la confirmation de ton paiement. Tu reçois tes identifiants par email.' },
            { q: 'Puis-je tester avant d\'acheter ?', a: 'Oui ! 3 séries gratuites par module sont disponibles sans inscription.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <OrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} pack={selectedPack} />
    </div>
  )
}
