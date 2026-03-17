'use client'
import { useState } from 'react'

const faqs = [
  {
    q: 'Qu\'est-ce que le TEF Canada et pourquoi est-il obligatoire ?',
    a: 'Le Test d\'Évaluation de Français Canada (TEF Canada) est un examen linguistique officiel reconnu par Immigration, Réfugiés et Citoyenneté Canada (IRCC). Il est requis dans le cadre de la plupart des programmes d\'immigration francophones, notamment Entrée Express, le Programme des travailleurs qualifiés et le regroupement familial. Il permet à l\'IRCC d\'évaluer votre niveau de français selon le référentiel des Niveaux de compétence linguistique canadiens (NCLC).',
  },
  {
    q: 'Quel score dois-je viser pour maximiser mes points CRS en Entrée Express ?',
    a: 'Pour obtenir un maximum de points CRS dans Entrée Express, vous devez viser le niveau CLB/NCLC 9 ou plus dans les quatre modules (CE, CO, EE, EO). Atteindre le niveau NCLC 7 (B2) est le minimum recommandé pour être compétitif. Plus votre score est élevé, plus vous accumulez de points, ce qui augmente vos chances de recevoir une invitation à présenter une demande.',
  },
  {
    q: 'Combien de temps le certificat TEF Canada est-il valide ?',
    a: 'Les résultats du TEF Canada sont valables deux ans à compter de la date de passation de l\'examen. Passé ce délai, vous devrez repasser l\'examen si votre dossier d\'immigration n\'a pas encore été soumis ou n\'est pas encore traité.',
  },
  {
    q: 'Puis-je repasser l\'examen si je ne suis pas satisfait de mes résultats ?',
    a: 'Oui, il est possible de repasser le TEF Canada. Cependant, un délai minimum de 30 jours doit être respecté entre deux tentatives. Il n\'y a pas de limite au nombre de fois que vous pouvez passer l\'examen, mais chaque inscription est payante.',
  },
  {
    q: 'Quelle est la différence entre le TEF Canada et le TEF pour la France ?',
    a: 'Ces deux tests sont développés par la CCI Paris Île-de-France, mais ils ne sont pas interchangeables. Le TEF Canada est spécifiquement conçu pour les dossiers d\'immigration au Canada et reconnu par l\'IRCC. Ses résultats sont convertis en Niveaux de compétence linguistique canadiens (NCLC). Le TEF pour la France, lui, est utilisé pour des démarches en France (nationalité, travail) et les scores ne peuvent pas être utilisés pour une demande d\'immigration au Canada.',
  },
  {
    q: 'Comment TEF-LAB m\'aide-t-il à préparer l\'examen officiel ?',
    a: 'TEF-LAB vous propose des séries d\'exercices calquées sur la structure officielle du TEF Canada : 40 QCM en CE et CO, 2 tâches rédactionnelles en EE, et 2 sections orales en EO. Les modules sont chronométrés pour reproduire les conditions réelles de l\'examen. Les modules EE et EO bénéficient en plus d\'une correction détaillée par intelligence artificielle (IA) avec feedback, niveau CECRL estimé et suggestions d\'amélioration.',
  },
  {
    q: 'Quel pack choisir pour commencer ma préparation ?',
    a: 'Si vous préparez tous les modules, le pack Silver est notre recommandation : il offre un accès complet aux 4 modules, 4 sessions simultanées et 10 corrections IA par jour pour 25 000 FCFA. Pour commencer avec un budget limité, le pack Essai (5 000 FCFA, 30 jours) permet de tester la plateforme avec 2 corrections IA par jour. Si vous souhaitez vous concentrer uniquement sur l\'EE et l\'EO, le pack Special est dédié à ces deux modules.',
  },
  {
    q: 'Les séries gratuites suffisent-elles pour se préparer ?',
    a: 'Les séries gratuites (CE et CO) sont un excellent point de départ pour évaluer votre niveau et vous familiariser avec le format de l\'examen. Cependant, pour une préparation complète, notamment les modules d\'Expression Écrite et Orale avec correction IA, il est recommandé de souscrire à un pack payant. Les candidats les mieux préparés sont ceux qui travaillent régulièrement sur les quatre modules.',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Bonjour TEF-LAB,\n\nMon nom : ${form.name}\nEmail : ${form.email}\n\n${form.message}`
    window.open(`https://wa.me/237683008287?text=${encodeURIComponent(text)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="bg-tef-blue text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact</h1>
          <p className="text-blue-200">Nous sommes là pour t&apos;aider dans ta préparation au TEF Canada.</p>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Nos coordonnées</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <a href="https://wa.me/237683008287" target="_blank" rel="noopener noreferrer"
                    className="text-tef-blue hover:underline">
                    +237 683 008 287
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Disponible 7j/7, réponse rapide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:tifuzzied@gmail.com" className="text-tef-blue hover:underline">
                    tifuzzied@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold text-gray-900">Paiement</p>
                  <p className="text-sm text-gray-600">Orange Money &amp; MTN MoMo</p>
                  <p className="text-sm text-gray-600">+237 683 008 287</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors w-fit"
            >
              💬 Écrire sur WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-5xl">✅</div>
                <h3 className="text-lg font-bold text-gray-900">Message envoyé !</h3>
                <p className="text-sm text-gray-500">
                  Ton message a été pré-rempli sur WhatsApp. Nous te répondrons rapidement.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-sm text-tef-blue hover:underline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Envoyer un message</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Comment pouvons-nous t'aider ?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-tef-blue text-white font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
                >
                  Envoyer via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            Questions fréquentes
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            Tout ce que vous devez savoir sur le TEF Canada et la préparation avec TEF-LAB.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 text-tef-blue text-xl font-bold transition-transform duration-200 ${
                      openFaq === i ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            Vous ne trouvez pas la réponse à votre question ?{' '}
            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tef-blue hover:underline font-medium"
            >
              Contactez-nous sur WhatsApp →
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
