'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    cityOfResidence: '',
    referenceCode: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    setError('')
  }

  // Real-time password strength indicators
  const pwdHas8 = form.password.length >= 8
  const pwdHasNum = /[0-9]/.test(form.password)
  const pwdHasSpecial = /[^a-zA-Z0-9]/.test(form.password)
  const pwdMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!pwdHas8 || !pwdHasNum || !pwdHasSpecial) {
      setError('Le mot de passe ne respecte pas les critères de sécurité.')
      return
    }
    if (!pwdMatch) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        // Auto sign-in then redirect to packs so the user can pick a subscription
        const result = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })
        if (result?.ok) {
          router.push('/packs?nouveau=1')
        } else {
          // Auto-login failed (unlikely) — fall back to login page
          setTimeout(() => router.push('/connexion?inscrit=1'), 1500)
        }
      } else {
        setError(data?.error ?? 'Une erreur est survenue.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-extrabold text-gray-900">Compte créé avec succès !</h2>
          <p className="text-gray-600 text-sm">
            Bienvenue sur TEF-LAB. Connexion en cours, redirection vers les packs…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <img src="/logo.png" alt="TEF-LAB" className="h-6 w-auto object-contain" />
            <span className="font-extrabold text-xl text-tef-blue">TEF-LAB</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-4">Créer un compte gratuit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accédez immédiatement aux séries gratuites CE et CO
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Marie Dupont"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville de résidence *</label>
            <input
              type="text"
              value={form.cityOfResidence}
              onChange={(e) => set('cityOfResidence', e.target.value)}
              placeholder="Douala"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
          </div>

          {/* Code parrainage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code de parrainage <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.referenceCode}
              onChange={(e) => set('referenceCode', e.target.value)}
              placeholder="REF-XXXXX"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="marie@email.com"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            {form.password.length > 0 && (
              <div className="mt-2 space-y-1">
                {[
                  { ok: pwdHas8, label: '8 caractères minimum' },
                  { ok: pwdHasNum, label: 'Au moins un chiffre' },
                  { ok: pwdHasSpecial, label: 'Au moins un caractère spécial (!@#$…)' },
                ].map(({ ok, label }) => (
                  <p key={label} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{ok ? '✓' : '○'}</span> {label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${
                form.confirmPassword.length > 0
                  ? pwdMatch ? 'border-green-400' : 'border-red-400'
                  : 'border-gray-300'
              }`}
            />
            {form.confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${pwdMatch ? 'text-green-600' : 'text-red-500'}`}>
                {pwdMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? 'Création en cours…' : 'Créer mon compte gratuit'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-tef-blue font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-xs text-center text-gray-400 leading-relaxed">
          En créant un compte, vous acceptez nos{' '}
          <Link href="/mentions-legales" className="underline hover:text-gray-600">conditions d'utilisation</Link>.
          <br />Le compte gratuit donne accès aux séries CE et CO marquées « Gratuite ».
        </p>
      </div>
    </div>
  )
}
