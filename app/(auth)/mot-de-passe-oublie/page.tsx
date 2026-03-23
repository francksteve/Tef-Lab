'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? 'Une erreur est survenue. Réessayez.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="TEF-LAB" className="h-12 w-auto object-contain rounded-xl" />
            <span className="font-bold text-xl text-tef-blue">TEF-LAB</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm mt-1">
            Renseignez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <h2 className="text-lg font-bold text-gray-900">Email envoyé !</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Si l&apos;adresse <strong>{email}</strong> est associée à un compte,
                vous recevrez un lien de réinitialisation dans quelques minutes.
                Pensez à vérifier vos spams.
              </p>
              <p className="text-xs text-gray-400">Le lien expire dans 1 heure.</p>
              <Link
                href="/connexion"
                className="inline-block mt-4 text-sm text-tef-blue font-semibold hover:underline"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors disabled:opacity-60 text-base"
                >
                  {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-400 mt-6">
                <Link href="/connexion" className="text-tef-blue hover:underline font-medium">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
