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
    a: 'TEF-LAB vous propose des séries d\'exercices calquées sur la structure officielle du TEF Canada : 40 QCM en CE et CO, 2 tâches rédactionnelles en EE, et 2 sections orales en EO. Les modules sont chronométrés pour reproduire les conditions réelles de l\'examen. Les modules EE et EO bénéficient en plus d\'une correction détaillée par intelligence artificielle avec feedback, niveau CECRL estimé et suggestions d\'amélioration.',
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
  const [form, setForm] = useState({ name: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Bonjour TEF-LAB,\n\nMon nom : ${form.name}\n\n${form.message}`
    window.open(`https://wa.me/237683008287?text=${encodeURIComponent(text)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-tef-night text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.15em] mb-3">Support</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Contact</h1>
          <p className="text-white/75 text-sm">Nous sommes là pour vous aider dans votre préparation au TEF Canada.</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">

          {/* Coordonnées */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Nos coordonnées</h2>
            <div className="space-y-5">

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-tef-blue/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-tef-blue" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                  <a href="https://wa.me/237683008287" target="_blank" rel="noopener noreferrer"
                    className="text-tef-blue hover:underline text-sm">
                    +237 683 008 287
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">Disponible 7j/7, réponse rapide</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-tef-blue/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-tef-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <a href="mailto:tifuzzied@gmail.com" className="text-tef-blue hover:underline text-sm">
                    tifuzzied@gmail.com
                  </a>
                </div>
              </div>

              {/* Paiement */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-tef-blue/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-tef-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Paiement</p>
                  <p className="text-sm text-gray-600">Orange Money &amp; MTN MoMo</p>
                  <p className="text-xs text-gray-400 mt-0.5">+237 683 008 287</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/237683008287"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tef-blue hover:bg-tef-night text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Écrire sur WhatsApp
            </a>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-tef-blue/10 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-tef-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">Message envoyé</h3>
                <p className="text-sm text-gray-500">
                  Votre message a été pré-rempli sur WhatsApp. Nous vous répondrons rapidement.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-sm text-tef-blue hover:underline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-gray-900">Envoyer un message</h2>
                  <p className="text-xs text-gray-400 mt-1">Votre message sera pré-rempli sur WhatsApp pour une réponse rapide.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre prénom</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Marie"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue focus:border-transparent resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-tef-blue hover:bg-tef-night text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Envoyer sur WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Questions fréquentes</h2>
            <p className="text-gray-500 text-sm mt-2">Tout ce que vous devez savoir sur le TEF Canada et TEF-LAB.</p>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-3 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Vous ne trouvez pas la réponse ?{' '}
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
