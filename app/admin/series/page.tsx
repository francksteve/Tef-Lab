'use client'
import { useEffect, useState } from 'react'

interface Module {
  id: string
  name: string
  code: string
}

interface Series {
  id: string
  title: string
  moduleId: string
  isFree: boolean
  createdAt: string
  module: Module
  _count: { questions: number }
}

interface SeriesFormData {
  title: string
  moduleId: string
  isFree: boolean
}

const emptyForm: SeriesFormData = {
  title: '',
  moduleId: '',
  isFree: false,
}

export default function SeriesAdminPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SeriesFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/series').then((r) => r.json()),
      fetch('/api/modules').then((r) => r.json()),
    ])
      .then(([s, m]) => {
        if (Array.isArray(s)) setSeries(s)
        if (Array.isArray(m)) setModules(m)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const freeCountPerModule = (moduleId: string) =>
    series.filter((s) => s.moduleId === moduleId && s.isFree).length

  const openNew = () => {
    setEditingId(null)
    setForm({ ...emptyForm, moduleId: modules[0]?.id ?? '' })
    setShowForm(true)
    setError(null)
  }

  const openEdit = (s: Series) => {
    setEditingId(s.id)
    setForm({
      title: s.title,
      moduleId: s.moduleId,
      isFree: s.isFree,
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
    setError(null)

    // Free series limit check
    if (form.isFree) {
      const currentFree = freeCountPerModule(form.moduleId)
      const isCurrentlyFree = editingId
        ? series.find((s) => s.id === editingId)?.isFree ?? false
        : false
      if (!isCurrentlyFree && currentFree >= 3) {
        setError(
          "Ce module a déjà 3 séries gratuites. Désactivez la gratuité d'une autre série d'abord."
        )
        return
      }
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/series/${editingId}` : '/api/series'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        handleCancel()
        loadData()
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

  const handleDelete = async (s: Series) => {
    if (!confirm(`Supprimer la série "${s.title}" ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/series/${s.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSeries((prev) => prev.filter((x) => x.id !== s.id))
      } else {
        setError('Erreur lors de la suppression.')
      }
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  const selectedModuleFreeCount = freeCountPerModule(form.moduleId)
  const isEditingCurrentlyFree = editingId
    ? series.find((s) => s.id === editingId)?.isFree ?? false
    : false

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Séries</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les séries d'exercices</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
        >
          + Nouvelle série
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
            {editingId ? 'Modifier la série' : 'Nouvelle série'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={form.moduleId}
                  onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
                  className="w-4 h-4 accent-tef-blue"
                />
                Série gratuite
              </label>
              {form.moduleId && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedModuleFreeCount} / 3 série{selectedModuleFreeCount !== 1 ? 's' : ''} gratuite{selectedModuleFreeCount !== 1 ? 's' : ''} pour ce module
                  {selectedModuleFreeCount >= 3 && !isEditingCurrentlyFree && (
                    <span className="text-orange-600 font-medium"> — limite atteinte</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer la série'}
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
        ) : series.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucune série trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Titre', 'Module', 'Questions', 'Gratuite', 'Actions'].map((h) => (
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
                {series.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.title}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-tef-blue/10 text-tef-blue">
                        {s.module.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s._count.questions}</td>
                    <td className="px-4 py-3">
                      {s.isFree ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Gratuite
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="px-3 py-1 bg-blue-100 text-tef-blue text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
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
