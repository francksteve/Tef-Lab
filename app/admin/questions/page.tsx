'use client'
import { useEffect, useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'

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
  taskTitle?: string | null
  category?: string | null
  longText?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  question: string
  optionA?: string | null
  optionB?: string | null
  optionC?: string | null
  optionD?: string | null
  correctAnswer?: string | null
  explanation?: string | null
}

interface QuestionFormData {
  questionOrder: string
  taskTitle: string
  category: string
  longText: string
  imageUrl: string
  audioUrl: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D' | ''
  explanation: string
}

const emptyForm: QuestionFormData = {
  questionOrder: '1',
  taskTitle: '',
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

const CE_CATEGORIES = [
  { value: 'Q1-7', label: 'Q1–7 : Documents de la vie quotidienne' },
  { value: 'Q8-17', label: 'Q8–17 : Phrases et textes lacunaires' },
  { value: 'Q18-22', label: 'Q18–22 : Lecture rapide / Graphiques' },
  { value: 'Q23-32', label: 'Q23–32 : Documents administratifs et professionnels' },
  { value: 'Q33-40', label: 'Q33–40 : Articles de presse' },
]

const CO_CATEGORIES = [
  { value: 'Q1-4', label: 'Q1–4 : Conversations avec dessins' },
  { value: 'Q5-20', label: 'Q5–20 : Annonces / Répondeurs / Micros-trottoirs' },
  { value: 'Q21-30', label: 'Q21–30 : Chroniques radio / Interviews' },
  { value: 'Q31-40', label: 'Q31–40 : Documents audio divers' },
]

const EE_SECTIONS = [
  {
    value: 'SECTION_A',
    label: 'Section A — Suite d\'article (80 mots min, 25 min)',
    docLabel: 'Début de l\'article (faits-divers)',
    docPlaceholder: 'Saisissez ici les premières phrases de l\'article de presse que le candidat devra continuer…',
    consigneDefault: 'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.',
    info: 'Type de document : début d\'article de presse (faits-divers) · Objectif : écrire la suite · 80 mots minimum · Durée 25 min',
  },
  {
    value: 'SECTION_B',
    label: 'Section B — Lettre au journal (200 mots min, 35 min)',
    docLabel: 'Phrase extraite du journal',
    docPlaceholder: 'Saisissez ici la phrase ou le titre sur lequel le candidat va donner son point de vue…',
    consigneDefault: 'Écrivez une lettre au journal pour réagir à cet article. Exprimez votre point de vue et défendez-le avec au moins 3 arguments (200 mots minimum).',
    info: 'Type de document : phrase extraite d\'un journal · Objectif : exprimer son point de vue avec arguments · 200 mots minimum · Durée 35 min',
  },
]

const EO_SECTIONS = [
  {
    value: 'SECTION_A',
    label: 'Section A — Obtenir des informations (5 min)',
    docLabel: 'Annonce / Publicité',
    docPlaceholder: 'Saisissez ici le texte de l\'annonce ou publicité que le candidat va étudier…',
    consigneDefault: 'Vous téléphonez pour avoir plus d\'informations sur ce document. Posez une dizaine de questions pertinentes (registre formel, vouvoiement).',
    info: 'Registre formel (vouvoiement) · Préparation 30s · Enregistrement 5 min max',
  },
  {
    value: 'SECTION_B',
    label: 'Section B — Présenter et convaincre (10 min)',
    docLabel: 'Annonce / Publicité',
    docPlaceholder: 'Saisissez ici le texte de la deuxième annonce ou publicité…',
    consigneDefault: 'Vous parlez de ce document à un(e) ami(e). Présentez-le et essayez de le/la convaincre (registre informel, tutoiement).',
    info: 'Registre informel (tutoiement) · Préparation 60s · Enregistrement 10 min max',
  },
]

const sectionBadge = (category: string | null | undefined) => {
  if (!category) return null
  const isA = category === 'SECTION_A'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isA ? 'bg-tef-blue/10 text-tef-blue' : 'bg-purple-100 text-purple-700'}`}>
      {isA ? 'Section A' : category === 'SECTION_B' ? 'Section B' : category}
    </span>
  )
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

  const selectedSeries = series.find((s) => s.id === selectedSeriesId)
  const moduleCode = selectedSeries?.module?.code ?? ''
  const isQCM = moduleCode === 'CE' || moduleCode === 'CO'
  const isTask = moduleCode === 'EE' || moduleCode === 'EO'
  const taskSections = moduleCode === 'EE' ? EE_SECTIONS : EO_SECTIONS

  const loadQuestions = (seriesId: string) => {
    if (!seriesId) return
    setLoading(true)
    setQuestions([])
    fetch(`/api/series/${seriesId}/questions`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setQuestions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const handleSeriesChange = (id: string) => {
    setSelectedSeriesId(id)
    setShowForm(false)
    setEditingId(null)
    setError(null)
    loadQuestions(id)
  }

  const openNew = () => {
    const nextOrder = questions.length + 1
    let defaultCategory = ''
    let defaultConsigne = ''
    if (isTask) {
      const hasA = questions.some((q) => q.category === 'SECTION_A')
      defaultCategory = hasA ? 'SECTION_B' : 'SECTION_A'
      defaultConsigne = taskSections.find((s) => s.value === defaultCategory)?.consigneDefault ?? ''
    }
    setEditingId(null)
    setForm({ ...emptyForm, questionOrder: String(nextOrder), category: defaultCategory, question: defaultConsigne, correctAnswer: 'A' })
    setShowForm(true)
    setError(null)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm({
      questionOrder: String(q.questionOrder),
      taskTitle: q.taskTitle ?? '',
      category: q.category ?? '',
      longText: q.longText ?? '',
      imageUrl: q.imageUrl ?? '',
      audioUrl: q.audioUrl ?? '',
      question: q.question,
      optionA: q.optionA ?? '',
      optionB: q.optionB ?? '',
      optionC: q.optionC ?? '',
      optionD: q.optionD ?? '',
      correctAnswer: (q.correctAnswer as 'A' | 'B' | 'C' | 'D') ?? 'A',
      explanation: q.explanation ?? '',
    })
    setShowForm(true)
    setError(null)
  }

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(null) }
  const set = (key: keyof QuestionFormData, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeries) return
    setSubmitting(true)
    setError(null)

    const payload: Record<string, unknown> = {
      moduleId: selectedSeries.moduleId,
      seriesId: selectedSeriesId,
      questionOrder: parseInt(form.questionOrder, 10),
      taskTitle: form.taskTitle || undefined,
      category: form.category || undefined,
      longText: form.longText || undefined,
      imageUrl: form.imageUrl || undefined,
      audioUrl: form.audioUrl || undefined,
      question: form.question,
      explanation: form.explanation || undefined,
    }
    if (isQCM) {
      payload.optionA = form.optionA
      payload.optionB = form.optionB
      payload.optionC = form.optionC
      payload.optionD = form.optionD
      payload.correctAnswer = form.correctAnswer
    }

    try {
      const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) { handleCancel(); loadQuestions(selectedSeriesId) }
      else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ? JSON.stringify(data.error) : 'Erreur lors de la sauvegarde.')
      }
    } catch { setError('Erreur lors de la sauvegarde.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (q: Question) => {
    const label = isTask ? `la ${q.category === 'SECTION_A' ? 'Section A' : 'Section B'}` : `la question #${q.questionOrder}`
    if (!confirm(`Supprimer ${label} ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/questions/${q.id}`, { method: 'DELETE' })
      if (res.ok) setQuestions((prev) => prev.filter((x) => x.id !== q.id))
      else setError('Erreur lors de la suppression.')
    } catch { setError('Erreur lors de la suppression.') }
  }

  const inputField = (label: string, key: keyof QuestionFormData, required = false, multiline = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{!required && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
      </label>
      {multiline ? (
        <textarea value={form[key] as string} onChange={(e) => set(key, e.target.value)} rows={4} placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required={required} />
      ) : (
        <input type="text" value={form[key] as string} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required={required} />
      )}
    </div>
  )

  // ─── CE / CO form ────────────────────────────────────────────────────────────
  const renderQCMForm = () => {
    const categories = moduleCode === 'CE' ? CE_CATEGORIES : CO_CATEGORIES
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
            <input type="number" min={1} value={form.questionOrder} onChange={(e) => set('questionOrder', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue">
              <option value="">-- Sélectionner --</option>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {inputField(
          moduleCode === 'CE' ? 'Texte support (passage à lire)' : 'Transcription / Contexte',
          'longText', false, true,
          moduleCode === 'CE' ? 'Copiez ici le texte à lire avant les questions…' : 'Transcription optionnelle du document audio…'
        )}

        <div className={`grid gap-4 ${moduleCode === 'CO' ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
          <FileUpload type="image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)}
            label={moduleCode === 'CO' ? 'Image (Q1–4 avec dessins)' : 'Image'} />
          {moduleCode === 'CO' && (
            <FileUpload type="audio" value={form.audioUrl} onChange={(url) => set('audioUrl', url)}
              label="Fichier audio (lecture unique)" required />
          )}
        </div>

        {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}

        <div className="grid sm:grid-cols-2 gap-4">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => inputField(`Option ${opt}`, `option${opt}` as keyof QuestionFormData, true))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bonne réponse</label>
          <div className="flex gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="correctAnswer" value={opt} checked={form.correctAnswer === opt}
                  onChange={() => set('correctAnswer', opt)} className="accent-tef-blue" />
                <span className="text-sm text-gray-700">Option {opt}</span>
              </label>
            ))}
          </div>
        </div>

        {inputField('Explication de la réponse', 'explanation', false, true)}
      </div>
    )
  }

  // ─── EE / EO form ────────────────────────────────────────────────────────────
  const renderTaskForm = () => {
    const currentSection = taskSections.find((s) => s.value === form.category) ?? taskSections[0]
    return (
      <div className="space-y-5">
        {/* Section selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {taskSections.map((s) => (
              <label key={s.value} className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                form.category === s.value ? 'border-tef-blue bg-tef-blue/5' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input type="radio" name="section" value={s.value} checked={form.category === s.value}
                  onChange={() => setForm((f) => ({ ...f, category: s.value, question: f.question || s.consigneDefault }))}
                  className="hidden" />
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Titre (EE Section A only) */}
        {moduleCode === 'EE' && form.category === 'SECTION_A' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'article <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.taskTitle}
              onChange={(e) => set('taskTitle', e.target.value)}
              placeholder="Ex : Mariages au sommet, Un lion sème la panique…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            <p className="text-xs text-gray-400 mt-1">Affiché en gras avant le début de l'article pendant le test.</p>
          </div>
        )}

        {/* Document support — text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {currentSection.docLabel} — <span className="text-gray-500 font-normal">texte du document support</span>
            <span className="text-gray-400 font-normal ml-1">(optionnel si image)</span>
          </label>
          <textarea value={form.longText} onChange={(e) => set('longText', e.target.value)} rows={6}
            placeholder={currentSection.docPlaceholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" />
        </div>

        {/* Image du document support (EO only) */}
        {moduleCode === 'EO' && (
          <div>
            <FileUpload
              type="image"
              value={form.imageUrl}
              onChange={(url) => set('imageUrl', url)}
              label="Image de l'annonce / publicité (optionnel)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Uploadez une image de l'annonce réelle (scan ou capture d'une publicité, offre d'emploi, etc.).
              Si les deux sont fournis, l'image est affichée en priorité.
            </p>
          </div>
        )}

        {/* Consigne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consigne donnée au candidat
          </label>
          <textarea value={form.question} onChange={(e) => set('question', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required />
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          {moduleCode === 'EE' ? '📝' : '🎤'} <strong>{currentSection.label.split('—')[0].trim()} :</strong> {currentSection.info}
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Questions</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les questions et tâches par série</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Series selector grouped by module */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une série</label>
        <select value={selectedSeriesId} onChange={(e) => handleSeriesChange(e.target.value)}
          className="w-full sm:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue">
          <option value="">-- Choisir une série --</option>
          {(['CE', 'CO', 'EE', 'EO'] as const).map((code) => {
            const group = series.filter((s) => s.module.code === code)
            if (!group.length) return null
            return (
              <optgroup key={code} label={`Module ${code}`}>
                {group.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </optgroup>
            )
          })}
        </select>
      </div>

      {selectedSeriesId && selectedSeries && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{selectedSeries.title}</span>
                {' — '}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isTask ? 'bg-purple-100 text-purple-700' : 'bg-tef-blue/10 text-tef-blue'
                }`}>Module {moduleCode}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTask
                  ? `${questions.length} / 2 section${questions.length !== 1 ? 's' : ''} configurée${questions.length !== 1 ? 's' : ''}`
                  : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {(!isTask || questions.length < 2) && (
              <button onClick={openNew}
                className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors">
                {isTask ? '+ Ajouter une section' : '+ Nouvelle question'}
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {editingId ? (isTask ? 'Modifier la section' : 'Modifier la question') : (isTask ? 'Nouvelle section' : 'Nouvelle question')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isQCM ? renderQCMForm() : renderTaskForm()}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover disabled:opacity-50 transition-colors">
                    {submitting ? 'Enregistrement…' : editingId ? 'Mettre à jour' : (isTask ? 'Créer la section' : 'Créer la question')}
                  </button>
                  <button type="button" onClick={handleCancel}
                    className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-400">Chargement…</div>
            ) : questions.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                {isTask ? 'Aucune section configurée pour cette série' : 'Aucune question pour cette série'}
              </div>
            ) : isTask ? (
              // EE / EO list
              <div className="divide-y">
                {questions.slice().sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '')).map((q) => {
                  const sectionDef = taskSections.find((s) => s.value === q.category)
                  return (
                    <div key={q.id} className="p-5 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sectionBadge(q.category)}
                            {sectionDef && <span className="text-xs text-gray-500">{sectionDef.label}</span>}
                          </div>
                          {q.taskTitle && q.category === 'SECTION_A' && (
                            <p className="text-sm font-bold text-gray-900">📰 {q.taskTitle}</p>
                          )}
                          {(q.imageUrl || q.longText) && (
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <p className="text-xs font-medium text-gray-500">{sectionDef?.docLabel ?? 'Document support'}</p>
                              {q.imageUrl && (
                                <div className="flex items-center gap-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={q.imageUrl} alt="Annonce" className="h-20 w-auto rounded border border-gray-200 object-contain bg-white" />
                                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">🖼 Image</span>
                                </div>
                              )}
                              {q.longText && (
                                <p className="text-sm text-gray-700 line-clamp-3">{q.longText}</p>
                              )}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Consigne</p>
                            <p className="text-sm text-gray-900">{q.question}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => openEdit(q)} className="px-3 py-1 bg-blue-100 text-tef-blue text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors">Modifier</button>
                          <button onClick={() => handleDelete(q)} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // CE / CO list
              <div className="divide-y">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-tef-blue text-white text-xs font-bold rounded-full flex-shrink-0">{q.questionOrder}</span>
                          {q.category && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{q.category}</span>}
                          {q.audioUrl && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">🎵 Audio</span>}
                          {q.imageUrl && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🖼 Image</span>}
                        </div>
                        {q.longText && <p className="text-xs text-gray-400 italic line-clamp-1">{q.longText}</p>}
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">{q.question}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs text-gray-500">
                          {q.optionA && <span>A: {q.optionA}</span>}
                          {q.optionB && <span>B: {q.optionB}</span>}
                          {q.optionC && <span>C: {q.optionC}</span>}
                          {q.optionD && <span>D: {q.optionD}</span>}
                        </div>
                        {q.correctAnswer && <p className="text-xs font-semibold text-green-600">✓ Réponse : Option {q.correctAnswer}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(q)} className="px-3 py-1 bg-blue-100 text-tef-blue text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors">Modifier</button>
                        <button onClick={() => handleDelete(q)} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors">Supprimer</button>
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
