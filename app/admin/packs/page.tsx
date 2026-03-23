'use client'
import { useEffect, useState } from 'react'

interface Pack {
  id: string
  name: string
  price: number
  description: string
  moduleAccess: 'EE_EO' | 'ALL'
  maxSessions: number
  aiUsagePerDay: number
  durationDays: number
  isActive: boolean
  isRecommended: boolean
  createdAt: string
}

interface PackFormData {
  name: string
  price: string
  description: string
  moduleAccess: 'EE_EO' | 'ALL'
  maxSessions: string
  aiUsagePerDay: string
  durationDays: string
  isActive: boolean
  isRecommended: boolean
}

const emptyForm: PackFormData = {
  name: '',
  price: '',
  description: '',
  moduleAccess: 'ALL',
  maxSessions: '1',
  aiUsagePerDay: '5',
  durationDays: '30',
  isActive: true,
  isRecommended: false,
}

const moduleAccessLabels: Record<string, string> = {
  EE_EO: 'Expression Écrite & Orale uniquement',
  ALL: 'Tous les modules (CE, CO, EE, EO)',
}

export default function PacksAdminPage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PackFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPacks = () => {
    setLoading(true)
    fetch('/api/packs?all=1')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPacks(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadPacks()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError(null)
  }

  const openEdit = (pack: Pack) => {
    setEditingId(pack.id)
    setForm({
      name: pack.name,
      price: String(pack.price),
      description: pack.description,
      moduleAccess: pack.moduleAccess,
      maxSessions: String(pack.maxSessions),
      aiUsagePerDay: String(pack.aiUsagePerDay),
      durationDays: String(pack.durationDays),
      isActive: pack.isActive,
      isRecommended: pack.isRecommended,
    })
    setShowForm(true)
    setError(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      price: parseInt(form.price, 10),
      description: form.description.trim(),
      moduleAccess: form.moduleAccess,
      maxSessions: parseInt(form.maxSessions, 10),
      aiUsagePerDay: parseInt(form.aiUsagePerDay, 10),
      durationDays: parseInt(form.durationDays, 10),
      isActive: form.isActive,
      isRecommended: form.isRecommended,
    }

    try {
      const url = editingId ? `/api/packs/${editingId}` : '/api/packs'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        handleCancel()
        loadPacks()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ? JSON.stringify(data.error) : 'Erreur lors de la sauvegarde.')
      }
    } catch {
      setError('Erreur lors de la sauvegarde.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (pack: Pack) => {
    if (!confirm(`Supprimer le pack "${pack.name}" ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/packs/${pack.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPacks((prev) => prev.filter((p) => p.id !== pack.id))
      } else {
        setError('Erreur lors de la suppression.')
      }
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  const inp = (
    label: string,
    key: keyof PackFormData,
    type: string = 'text',
    extraProps: Record<string, unknown> = {}
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
        required
        {...extraProps}
      />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Packs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les offres d'abonnement</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
        >
          + Nouveau pack
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            {editingId ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: name + price */}
            <div className="grid sm:grid-cols-2 gap-4">
              {inp('Nom du pack', 'name')}
              {inp('Prix (FCFA)', 'price', 'number', { min: 0 })}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                required
              />
            </div>

            {/* Module access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accès aux modules
              </label>
              <select
                value={form.moduleAccess}
                onChange={(e) =>
                  setForm((f) => ({ ...f, moduleAccess: e.target.value as 'EE_EO' | 'ALL' }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue bg-white"
                required
              >
                <option value="ALL">ALL — Tous les modules (CE, CO, EE, EO)</option>
                <option value="EE_EO">EE_EO — Expression Écrite &amp; Orale uniquement</option>
              </select>
            </div>

            {/* Numeric fields */}
            <div className="grid sm:grid-cols-3 gap-4">
              {inp('Sessions simultanées max', 'maxSessions', 'number', { min: 1 })}
              {inp('Corrections IA / jour', 'aiUsagePerDay', 'number', { min: 0 })}
              {inp("Durée d'accès (jours)", 'durationDays', 'number', { min: 1 })}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-tef-blue"
                />
                Pack actif (visible sur le site)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRecommended}
                  onChange={(e) => setForm((f) => ({ ...f, isRecommended: e.target.checked }))}
                  className="w-4 h-4 accent-tef-blue"
                />
                ⭐ Pack recommandé (badge affiché)
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer le pack'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : packs.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucun pack trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-tef-blue text-white">
                <tr>
                  {['Nom / Description', 'Prix', 'Accès', 'IA/j', 'Sessions', 'Durée', 'Statut', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {packs.map((pack, index) => (
                  <tr key={pack.id} className={`border-b border-blue-100 transition-colors hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {pack.name}
                            {pack.isRecommended && (
                              <span className="ml-2 text-xs bg-tef-blue/10 text-tef-blue px-2 py-0.5 rounded-full font-bold">
                                ⭐ Recommandé
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[180px]">
                            {pack.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {pack.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          pack.moduleAccess === 'ALL'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {pack.moduleAccess}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5 hidden xl:block">
                        {moduleAccessLabels[pack.moduleAccess]}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-center font-medium">
                      {pack.aiUsagePerDay}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-center font-medium">
                      {pack.maxSessions}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {pack.durationDays} j
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          pack.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {pack.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(pack)}
                          className="px-3 py-1 bg-blue-100 text-tef-blue text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(pack)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
