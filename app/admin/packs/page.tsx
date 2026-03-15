'use client'
import { useEffect, useState } from 'react'

interface Pack {
  id: string
  name: string
  price: number
  description: string
  nbModules: number
  nbSeriesPerModule: number
  durationDays: number
  isActive: boolean
  createdAt: string
}

interface PackFormData {
  name: string
  price: string
  description: string
  nbModules: string
  nbSeriesPerModule: string
  durationDays: string
  isActive: boolean
}

const emptyForm: PackFormData = {
  name: '',
  price: '',
  description: '',
  nbModules: '4',
  nbSeriesPerModule: '5',
  durationDays: '30',
  isActive: true,
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
    // Fetch all packs including inactive — admin-only endpoint shows all
    fetch('/api/packs')
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
      nbModules: String(pack.nbModules),
      nbSeriesPerModule: String(pack.nbSeriesPerModule),
      durationDays: String(pack.durationDays),
      isActive: pack.isActive,
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
      nbModules: parseInt(form.nbModules, 10),
      nbSeriesPerModule: parseInt(form.nbSeriesPerModule, 10),
      durationDays: parseInt(form.durationDays, 10),
      isActive: form.isActive,
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

  const field = (
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

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {field('Nom du pack', 'name')}
              {field('Prix (FCFA)', 'price', 'number', { min: 0 })}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                required
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nb modules (1-4)</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={form.nbModules}
                  onChange={(e) => setForm((f) => ({ ...f, nbModules: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Séries / module</label>
                <input
                  type="number"
                  min={1}
                  value={form.nbSeriesPerModule}
                  onChange={(e) => setForm((f) => ({ ...f, nbSeriesPerModule: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                <input
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-tef-blue"
              />
              Pack actif (visible sur le site)
            </label>
            <div className="flex gap-3 pt-2">
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

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement…</div>
        ) : packs.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucun pack trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Nom', 'Prix', 'Modules', 'Durée', 'Statut', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {packs.map((pack) => (
                  <tr key={pack.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{pack.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{pack.description}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {pack.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pack.nbModules} mod. × {pack.nbSeriesPerModule} séries
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pack.durationDays} jours</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          pack.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
