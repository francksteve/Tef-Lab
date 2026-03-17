'use client'
import { useState, useEffect } from 'react'

interface FormState {
  siteName: string
  adminEmail: string
  whatsappNumber: string
  orangeMoneyNumber: string
  mtnMomoNumber: string
  usdExchangeRate: string
  discountRate: string
}

const defaultForm: FormState = {
  siteName: '',
  adminEmail: '',
  whatsappNumber: '',
  orangeMoneyNumber: '',
  mtnMomoNumber: '',
  usdExchangeRate: '0.00165',
  discountRate: '0',
}

export default function ParametresPage() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setForm({
          siteName: data.siteName ?? '',
          adminEmail: data.adminEmail ?? '',
          whatsappNumber: data.whatsappNumber ?? '',
          orangeMoneyNumber: data.orangeMoneyNumber ?? '',
          mtnMomoNumber: data.mtnMomoNumber ?? '',
          usdExchangeRate: String(data.usdExchangeRate ?? 0.00165),
          discountRate: String(data.discountRate ?? 0),
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Impossible de charger les paramètres.')
        setLoading(false)
      })
  }, [])

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    const usdRate = parseFloat(form.usdExchangeRate)
    const discount = parseFloat(form.discountRate)

    if (isNaN(usdRate) || usdRate <= 0) {
      setError('Le taux USD doit être un nombre positif.')
      setSaving(false)
      return
    }
    if (isNaN(discount) || discount < 0 || discount > 100) {
      setError('La remise doit être comprise entre 0 et 100.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: form.siteName,
          adminEmail: form.adminEmail,
          whatsappNumber: form.whatsappNumber,
          orangeMoneyNumber: form.orangeMoneyNumber,
          mtnMomoNumber: form.mtnMomoNumber,
          usdExchangeRate: usdRate,
          discountRate: discount,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        setError(data?.error ?? 'Une erreur est survenue.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Paramètres de la plateforme</h1>
        <p className="text-gray-500 text-sm mt-1">
          Modifiez les informations générales, de contact, de paiement et de tarification.
        </p>
      </div>

      {/* Feedback banners */}
      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          <span className="text-lg">✅</span>
          Paramètres enregistrés avec succès.
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1 — Général */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="text-2xl">🌐</span>
            <div>
              <h2 className="font-bold text-gray-900">Informations générales</h2>
              <p className="text-xs text-gray-500">Nom affiché sur le site et dans les emails</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du site
            </label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="ex: TEF-LAB"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              Utilisé dans les emails envoyés aux clients et dans la navigation.
            </p>
          </div>
        </section>

        {/* Section 2 — Contact */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="text-2xl">📬</span>
            <div>
              <h2 className="font-bold text-gray-900">Contact</h2>
              <p className="text-xs text-gray-500">Email et WhatsApp de l&apos;administrateur</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse email admin
            </label>
            <input
              type="email"
              value={form.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              placeholder="ex: contact@tef-lab.com"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              Reçoit les notifications de nouvelles commandes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro WhatsApp
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+</span>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="237683008287"
                required
                className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Chiffres uniquement, sans le + (ex: 237683008287). Utilisé pour le bouton WhatsApp flottant et les liens de commande.
            </p>
          </div>
        </section>

        {/* Section 3 — Paiements mobiles */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="text-2xl">💳</span>
            <div>
              <h2 className="font-bold text-gray-900">Paiements mobiles (fallback manuel)</h2>
              <p className="text-xs text-gray-500">Numéros communiqués aux clients pour le paiement manuel</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
                Numéro Orange Money
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+</span>
              <input
                type="tel"
                value={form.orangeMoneyNumber}
                onChange={(e) => handleChange('orangeMoneyNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="237683008287"
                required
                className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" />
                Numéro MTN MoMo
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+</span>
              <input
                type="tel"
                value={form.mtnMomoNumber}
                onChange={(e) => handleChange('mtnMomoNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="237683008287"
                required
                className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Section 4 — Tarification */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="text-2xl">💱</span>
            <div>
              <h2 className="font-bold text-gray-900">Tarification</h2>
              <p className="text-xs text-gray-500">Taux de change et remise globale sur les packs</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Taux de change FCFA → USD
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                1 FCFA =
              </span>
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={form.usdExchangeRate}
                onChange={(e) => handleChange('usdExchangeRate', e.target.value)}
                required
                className="w-full pl-20 pr-14 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                USD
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ex : 0.00165 signifie 1 FCFA = 0.00165 USD (1 USD ≈ 606 FCFA).
              Les prix USD sont calculés dynamiquement sur la page des packs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remise globale sur tous les packs
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.discountRate}
                onChange={(e) => handleChange('discountRate', e.target.value)}
                required
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                %
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Mettre 0 pour désactiver toute remise. Ex : 20 applique une remise de 20% sur tous les packs.
              Un bandeau promotionnel s&apos;affiche automatiquement sur la page des packs.
            </p>
            {parseFloat(form.discountRate) > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
                🎉 Remise de {form.discountRate}% active — les prix affichés seront réduits
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Les modifications sont appliquées immédiatement.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors disabled:opacity-60 text-sm"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  )
}
