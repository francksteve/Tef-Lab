'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import OrderModal from '@/components/ui/OrderModal'

interface Pack {
  id: string
  name: string
  price: number
  description: string
  nbModules: number
  durationDays: number
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
  },
  {
    code: 'CO',
    name: 'Compréhension Orale',
    icon: '🎧',
    duration: '40 min',
    questions: '40 questions',
    desc: 'Annonces, répondeurs, interviews, chroniques radio. Audio unique.',
    color: 'border-purple-400',
  },
  {
    code: 'EE',
    name: 'Expression Écrite',
    icon: '✍️',
    duration: '60 min',
    questions: '2 tâches',
    desc: 'Suite d\'article (80 mots min.) et lettre au journal (200 mots min.).',
    color: 'border-green-400',
  },
  {
    code: 'EO',
    name: 'Expression Orale',
    icon: '🎤',
    duration: '15 min',
    questions: '2 sections',
    desc: 'Obtenir des informations (formel) et présenter pour convaincre (informel).',
    color: 'border-orange-400',
  },
]

export default function HomePage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/packs')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPacks(data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-tef-blue to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium">
            🍁 Certifié IRCC — Reconnu pour l'immigration au Canada
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Prépare ton <span className="text-yellow-300">TEF Canada</span><br />
            et réussis ton immigration 🇨🇦
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            La première plateforme de préparation au TEF Canada dédiée aux Camerounais.
            Entraîne-toi sur les 4 modules avec des séries réalistes et une correction par IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/packs"
              className="px-8 py-3.5 bg-tef-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-base"
            >
              Voir les packs →
            </Link>
            <Link
              href="/entrainement-gratuit"
              className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Essai gratuit
            </Link>
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
              <div key={mod.code} className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${mod.color} hover:shadow-md transition-shadow`}>
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{mod.name}</h3>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{mod.duration}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{mod.questions}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PACKS ─── */}
      <section id="packs" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Nos packs de préparation
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Choisis le pack qui correspond à ton niveau et à tes objectifs.
          </p>
          {packs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>Les packs seront disponibles prochainement.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs.map((pack) => (
                <div key={pack.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{pack.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex-1">{pack.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <span>📚 {pack.nbModules} module{pack.nbModules > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>⏳ {pack.durationDays} jours d'accès</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-tef-blue">
                      {pack.price.toLocaleString('fr-FR')} <span className="text-sm font-medium">FCFA</span>
                    </span>
                    <button
                      onClick={() => { setSelectedPack(pack); setModalOpen(true) }}
                      className="px-5 py-2 bg-tef-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Commander
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── FREE TRAINING ─── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-5xl">🎁</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Commence gratuitement
          </h2>
          <p className="text-gray-500">
            Accède à 3 séries gratuites par module pour évaluer ton niveau avant d'acheter un pack.
          </p>
          <Link
            href="/entrainement-gratuit"
            className="inline-block px-8 py-3.5 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors"
          >
            Accéder à l'entraînement gratuit →
          </Link>
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
            <a
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              ✉️ Nous contacter
            </a>
          </div>
        </div>
      </section>

      <OrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pack={selectedPack}
      />
    </div>
  )
}
