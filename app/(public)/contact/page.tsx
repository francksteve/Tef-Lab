'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Opens a WhatsApp link with the message pre-filled
    const text = `Bonjour Tef-Lab,\n\nMon nom : ${form.name}\nEmail : ${form.email}\n\n${form.message}`
    window.open(`https://wa.me/237683008287?text=${encodeURIComponent(text)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      <section className="bg-tef-blue text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact</h1>
          <p className="text-blue-200">Nous sommes là pour t'aider dans ta préparation au TEF Canada.</p>
        </div>
      </section>

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
                  <p className="text-sm text-gray-600">Orange Money & MTN MoMo</p>
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
    </div>
  )
}
