'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CECRL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

interface UserProfile {
  examDate: string | null
  targetCE: string | null
  targetCO: string | null
  targetEE: string | null
  targetEO: string | null
}

type Subscription = {
  pack: { name: string; moduleAccess: string }
  expiresAt: string
} | null

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription>(null)
  const [form, setForm] = useState({ examDate: '', targetCE: '', targetCO: '', targetEE: '', targetEO: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/connexion'); return }
    Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch('/api/subscription').then((r) => r.json()),
    ]).then(([prof, sub]) => {
      if (prof && !prof.error) {
        setProfile(prof)
        setForm({
          examDate: prof.examDate ? prof.examDate.split('T')[0] : '',
          targetCE: prof.targetCE ?? '',
          targetCO: prof.targetCO ?? '',
          targetEE: prof.targetEE ?? '',
          targetEO: prof.targetEO ?? '',
        })
      }
      if (sub?.subscription) setSubscription(sub.subscription)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session, status, router])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: form.examDate || null,
          targetCE: form.targetCE || null,
          targetCO: form.targetCO || null,
          targetEE: form.targetEE || null,
          targetEO: form.targetEO || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-tef-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const name = session?.user?.name ?? ''
  const email = session?.user?.email ?? ''
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const examDaysLeft = form.examDate
    ? Math.ceil((new Date(form.examDate).getTime() - Date.now()) / 86400000)
    : null

  const accessLabel = subscription
    ? subscription.pack.moduleAccess === 'ALL'
      ? 'Tous modules (CE · CO · EE · EO)'
      : 'EE · EO uniquement'
    : 'Accès gratuit (CE · CO séries gratuites)'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Mon espace
      </Link>

      <h1 className="text-2xl font-black text-gray-900">Mon profil TEF</h1>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-tef-blue flex items-center justify-center text-white text-xl font-black flex-shrink-0">
          {initials || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{name}</p>
          <p className="text-sm text-gray-500 truncate">{email}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-tef-blue bg-tef-blue/10 px-2.5 py-0.5 rounded-full">
              {subscription ? subscription.pack.name : 'Compte gratuit'}
            </span>
            {subscription?.expiresAt && (
              <span className="text-xs text-gray-400">
                expire le {formatDate(subscription.expiresAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accès modules */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-sm text-gray-600">{accessLabel}</p>
        {!subscription && (
          <Link href="/packs" className="ml-auto text-xs font-bold text-tef-blue hover:underline flex-shrink-0">
            Voir les packs →
          </Link>
        )}
      </div>

      {/* Objectifs TEF */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-base font-bold text-gray-900">Objectifs TEF Canada</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Votre date d&apos;examen et vos niveaux cibles personnalisent votre suivi.
          </p>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Date examen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Date de l&apos;examen
            </label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
              className="w-full sm:w-60 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            {examDaysLeft !== null && (
              <p className={`mt-1.5 text-xs font-medium ${examDaysLeft < 0 ? 'text-gray-400' : examDaysLeft <= 7 ? 'text-red-500' : 'text-tef-blue'}`}>
                {examDaysLeft < 0
                  ? 'Examen passé'
                  : examDaysLeft === 0
                  ? 'Examen aujourd\'hui !'
                  : `Dans ${examDaysLeft} jour${examDaysLeft > 1 ? 's' : ''}`}
              </p>
            )}
          </div>

          {/* Niveaux cibles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Niveau cible par module
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['CE', 'CO', 'EE', 'EO'] as const).map((code) => {
                const key = `target${code}` as keyof typeof form
                const moduleNames: Record<string, string> = {
                  CE: 'Compréhension Écrite',
                  CO: 'Compréhension Orale',
                  EE: 'Expression Écrite',
                  EO: 'Expression Orale',
                }
                return (
                  <div key={code}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{code}</p>
                    <p className="text-[10px] text-gray-400 mb-2 leading-tight">{moduleNames[code]}</p>
                    <select
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-2 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tef-blue bg-white"
                    >
                      <option value="">—</option>
                      {CECRL_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-tef-blue text-white text-sm font-bold rounded-xl hover:bg-tef-blue-hover transition-colors disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Enregistré
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
