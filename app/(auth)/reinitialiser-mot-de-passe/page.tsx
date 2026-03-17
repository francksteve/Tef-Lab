'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) setError('Lien invalide ou manquant. Veuillez refaire une demande.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/connexion'), 3000)
      } else {
        setError(data?.error ?? 'Une erreur est survenue.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {success ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-lg font-bold text-gray-900">Mot de passe modifié !</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès.
            Vous allez être redirigé vers la page de connexion…
          </p>
          <Link
            href="/connexion"
            className="inline-block mt-2 text-sm text-tef-blue font-semibold hover:underline"
          >
            Se connecter →
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              {!token && (
                <Link href="/mot-de-passe-oublie" className="block mt-2 text-tef-blue hover:underline font-medium">
                  Faire une nouvelle demande →
                </Link>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors disabled:opacity-60 text-base"
            >
              {loading ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
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
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="TEF-LAB" className="h-6 w-auto object-contain" />
            <span className="font-bold text-xl text-tef-blue">TEF-LAB</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Réinitialiser le mot de passe</h1>
          <p className="text-gray-500 text-sm mt-1">Choisissez un nouveau mot de passe sécurisé</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">Chargement…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
