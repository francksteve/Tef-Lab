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
  module: Module
}

interface Question {
  id: string
  moduleId: string
  seriesId: string
  questionOrder: number
  category?: string | null
  longText?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string | null
}

interface QuestionFormData {
  questionOrder: string
  category: string
  longText: string
  imageUrl: string
  audioUrl: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

const emptyForm: QuestionFormData = {
  questionOrder: '1',
  category: '',
  longText: '',
  imageUrl: '',
  audioUrl: '',
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
}

export default function QuestionsAdminPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<QuestionFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/series')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSeries(data) })
      .catch(() => {})
  }, [])

  const loadQuestions = (seriesId: string) => {
    if (!seriesId) return
    setLoading(true)
    setQuestions([])
    fetch(`/api/series/${seriesId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const handleSeriesChange = (id: string) => {
    setSelectedSeriesId(id)
    setShowForm(false)
    setEditingId(null)
    setError(null)
    loadQuestions(id)
  }

  const selectedSeries = series.find((s) => s.id === selectedSeriesId)

  const openNew = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      questionOrder: String(questions.length + 1),
    })
    setShowForm(true)
    setError(null)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm({
      questionOrder: String(q.questionOrder),
      category: q.category ?? '',
      longText: q.longText ?? '',
      imageUrl: q.imageUrl ?? '',
      audioUrl: q.audioUrl ?? '',
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation ?? '',
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
    if (!selectedSeries) return
    setSubmitting(true)
    setError(null)

    const payload = {
      moduleId: selectedSeries.moduleId,
      seriesId: selectedSeriesId,
      questionOrder: parseInt(form.questionOrder, 10),
      category: form.category || undefined,
      longText: form.longText || undefined,
      imageUrl: form.imageUrl || undefined,
      audioUrl: form.audioUrl || undefined,
      question: form.question,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation || undefined,
    }

    try {
      const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        handleCancel()
        loadQuestions(selectedSeriesId)
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

  const handleDelete = async (q: Question) => {
    if (!confirm(`Supprimer la question #${q.questionOrder} ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/questions/${q.id}`, { method: 'DELETE' })
      if (res.ok) {
        setQuestions((prev) => prev.filter((x) => x.id !== q.id))
      } else {
        setError('Erreur lors de la suppression.')
      }
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  const textField = (
    label: string,
    key: keyof QuestionFormData,
    required = false,
    multiline = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
      </label>
      {multiline ? (
        <textarea
          value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
          required={required}
        />
      ) : (
        <input
          type="text"
          value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
          required={required}
        />
      )}
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Questions</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les questions par série</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Sélection de série */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une série
        </label>
        <select
          value={selectedSeriesId}
          onChange={(e) => handleSeriesChange(e.target.value)}
          className="w-full sm:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
        >
          <option value="">-- Choisir une série --</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              [{s.module.code}] {s.title}
            </option>
          ))}
        </select>
      </div>

      {selectedSeriesId && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{selectedSeries?.title}</span> —{' '}
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={openNew}
              className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors"
            >
              + Nouvelle question
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Modifier la question' : 'Nouvelle question'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                    <input
                      type="number"
                      min={0}
                      value={form.questionOrder}
                      onChange={(e) => setForm((f) => ({ ...f, questionOrder: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                      required
                    />
                  </div>
                  {textField('Catégorie', 'category')}
                </div>

                {textField('Texte long', 'longText', false, true)}

                <div className="grid sm:grid-cols-2 gap-4">
                  {textField('URL image', 'imageUrl')}
                  {textField('URL audio', 'audioUrl')}
                </div>

                {textField('Énoncé de la question', 'question', true, true)}

                <div className="grid sm:grid-cols-2 gap-4">
                  {textField('Option A', 'optionA', true)}
                  {textField('Option B', 'optionB', true)}
                  {textField('Option C', 'optionC', true)}
                  {textField('Option D', 'optionD', true)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonne réponse
                  </label>
                  <select
                    value={form.correctAnswer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D' }))
                    }
                    className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
                  >
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <option key={opt} value={opt}>
                        Option {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {textField('Explication', 'explanation', false, true)}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-50 transition-colors"
                  >
                    {submitting
                      ? 'Enregistrement…'
                      : editingId
                      ? 'Mettre à jour'
                      : 'Créer la question'}
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

          {/* Liste des questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-400">Chargement…</div>
            ) : questions.length === 0 ? (
              <div className="p-10 text-center text-gray-400">Aucune question pour cette série</div>
            ) : (
              <div className="divide-y">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-tef-blue text-white text-xs font-bold rounded-full flex-shrink-0">
                            {q.questionOrder}
                          </span>
                          {q.category && (
                            <span className="text-xs text-gray-500 italic">{q.category}</span>
                          )}
                          {q.audioUrl && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Audio</span>
                          )}
                          {q.imageUrl && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Image</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">{q.question}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>A: {q.optionA}</span>
                          <span>B: {q.optionB}</span>
                          <span>C: {q.optionC}</span>
                          <span>D: {q.optionD}</span>
                        </div>
                        <p className="text-xs font-semibold text-green-600 mt-1">
                          Réponse : {q.correctAnswer}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEdit(q)}
                          className="px-3 py-1 bg-blue-100 text-tef-blue text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(q)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
