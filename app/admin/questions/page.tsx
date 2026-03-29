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
  subCategory?: string | null
  longText?: string | null
  consigne?: string | null
  comment?: string | null
  description?: string | null
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
  subCategory: string
  longText: string
  consigne: string
  comment: string
  description: string
  imageUrl: string
  audioUrl: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D' | ''
  explanation: string
  // For Q18-21: 4 texts with titles
  text1Title: string
  text1Content: string
  text2Title: string
  text2Content: string
  text3Title: string
  text3Content: string
  text4Title: string
  text4Content: string
}

const emptyForm: QuestionFormData = {
  questionOrder: '1',
  taskTitle: '',
  category: '',
  subCategory: '',
  longText: '',
  consigne: '',
  comment: '',
  description: '',
  imageUrl: '',
  audioUrl: '',
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  text1Title: '',
  text1Content: '',
  text2Title: '',
  text2Content: '',
  text3Title: '',
  text3Content: '',
  text4Title: '',
  text4Content: '',
}

const CE_CATEGORIES = [
  { value: 'Q1-7',   label: 'Q1–7 : Documents de la vie quotidienne' },
  { value: 'Q8-17',  label: 'Q8–17 : Phrases et textes lacunaires' },
  { value: 'Q18-21', label: 'Q18–21 : Lecture rapide de textes' },
  { value: 'Q22',    label: 'Q22 : Lecture rapide de graphiques' },
  { value: 'Q23-32', label: 'Q23–32 : Documents administratifs et professionnels' },
  { value: 'Q33-40', label: 'Q33–40 : Articles de presse' },
]

const CO_CATEGORIES = [
  { value: 'Q1-4',   label: 'Q1–4 : Conversations avec dessins',          consigne: 'Vous allez entendre des conversations entre deux personnes. Indiquez à quel dessin correspond chaque conversation.' },
  { value: 'Q5-8',   label: 'Q5–8 : Annonces publiques',                  consigne: 'Écoutez l\'annonce et répondez à la question.' },
  { value: 'Q9-14',  label: 'Q9–14 : Messages sur répondeur téléphonique', consigne: 'Écoutez le message et répondez à la question.' },
  { value: 'Q15-20', label: 'Q15–20 : Micro-trottoirs',                    consigne: 'Écoutez attentivement.' },
  { value: 'Q21-22', label: 'Q21–22 : Chroniques audio',                   consigne: 'Écoutez la chronique et répondez à la question.' },
  { value: 'Q23-28', label: 'Q23–28 : Interviews',                         consigne: 'Écoutez l\'interview et répondez aux deux questions.' },
  { value: 'Q29-30', label: 'Q29–30 : Reportages RFI',                     consigne: 'Écoutez le reportage et répondez aux deux questions.' },
  { value: 'Q31-40', label: 'Q31–40 : Documents audio divers',             consigne: 'Écoutez le document audio et répondez à la question.' },
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
  const [moduleFilter, setModuleFilter] = useState<string>('')
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(null)
  const [audioGenResult, setAudioGenResult] = useState<string | null>(null)

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

    // Parse Q18-21 JSON texts if present
    let text1Title = '', text1Content = '', text2Title = '', text2Content = ''
    let text3Title = '', text3Content = '', text4Title = '', text4Content = ''
    if (q.category === 'Q18-21' && q.longText) {
      try {
        const texts = JSON.parse(q.longText) as Array<{ title: string; content: string }>
        text1Title = texts[0]?.title ?? ''
        text1Content = texts[0]?.content ?? ''
        text2Title = texts[1]?.title ?? ''
        text2Content = texts[1]?.content ?? ''
        text3Title = texts[2]?.title ?? ''
        text3Content = texts[2]?.content ?? ''
        text4Title = texts[3]?.title ?? ''
        text4Content = texts[3]?.content ?? ''
      } catch { /* not JSON, skip */ }
    }

    setForm({
      questionOrder: String(q.questionOrder),
      taskTitle: q.taskTitle ?? '',
      category: q.category ?? '',
      subCategory: q.subCategory ?? '',
      longText: q.category === 'Q18-21' ? '' : (q.longText ?? ''),
      consigne: q.consigne ?? '',
      comment: q.comment ?? '',
      description: q.description ?? '',
      imageUrl: q.imageUrl ?? '',
      audioUrl: q.audioUrl ?? '',
      question: q.question,
      optionA: q.optionA ?? '',
      optionB: q.optionB ?? '',
      optionC: q.optionC ?? '',
      optionD: q.optionD ?? '',
      correctAnswer: (q.correctAnswer as 'A' | 'B' | 'C' | 'D') ?? 'A',
      explanation: q.explanation ?? '',
      text1Title, text1Content,
      text2Title, text2Content,
      text3Title, text3Content,
      text4Title, text4Content,
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

    // Build longText for Q18-21 as JSON
    let longTextValue: string | undefined
    if (form.category === 'Q18-21') {
      const texts = [
        { title: form.text1Title, content: form.text1Content },
        { title: form.text2Title, content: form.text2Content },
        { title: form.text3Title, content: form.text3Content },
        { title: form.text4Title, content: form.text4Content },
      ]
      longTextValue = JSON.stringify(texts)
    } else {
      longTextValue = form.longText || undefined
    }

    const payload: Record<string, unknown> = {
      moduleId: selectedSeries.moduleId,
      seriesId: selectedSeriesId,
      questionOrder: parseInt(form.questionOrder, 10),
      taskTitle: form.taskTitle || undefined,
      category: form.category || undefined,
      subCategory: form.subCategory || undefined,
      longText: longTextValue,
      consigne: form.consigne || undefined,
      comment: form.comment || undefined,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      audioUrl: form.audioUrl || undefined,
      question: form.question,
      explanation: form.explanation || undefined,
    }
    if (isQCM) {
      // Only send non-empty strings — empty strings fail z.string().min(1)
      if (form.optionA) payload.optionA = form.optionA
      if (form.optionB) payload.optionB = form.optionB
      if (form.optionC) payload.optionC = form.optionC
      if (form.optionD) payload.optionD = form.optionD
      if (form.correctAnswer) payload.correctAnswer = form.correctAnswer
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

  // ─── Common CE/CO fields ─────────────────────────────────────────────────────
  const orderField = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
      <input type="number" min={1} value={form.questionOrder} onChange={(e) => set('questionOrder', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required />
    </div>
  )

  // For CO: options are not HTML-required (some questions may have partial data)
  const answerFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => inputField(`Option ${opt}`, `option${opt}` as keyof QuestionFormData, moduleCode === 'CE'))}
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
    </>
  )

  // ─── CE form: category-specific ──────────────────────────────────────────────
  const renderCEForm = () => {
    const cat = form.category

    const categorySelector = (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
        <select value={form.category} onChange={(e) => set('category', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue" required>
          <option value="">-- Sélectionner --</option>
          {CE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
    )

    // No category yet — show selector + hint
    if (!cat) {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            Sélectionnez une catégorie pour afficher les champs appropriés.
          </div>
        </div>
      )
    }

    // ── Q1-7 : Documents de la vie quotidienne ──
    // Admin: Image (optionnel) → Texte du document (optionnel) → Question → Réponses
    if (cat === 'Q1-7') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            💡 Fournissez soit une image, soit un texte (ou les deux). L&apos;image est affichée en priorité si les deux sont présents.
          </div>
          <FileUpload type="image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} label="Image du document (annonce, affiche, lettre…)" />
          {inputField('Texte du document', 'longText', false, true, 'Saisissez le contenu textuel du document si vous n\'avez pas d\'image (annonce, affiche, publicité, lettre…)')}
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {answerFields}
        </div>
      )
    }

    // ── Q8-17 : Phrases et textes lacunaires ──
    // Admin: SubCatégorie → Phrase ou Texte(+titre) → Question → Réponses
    if (cat === 'Q8-17') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          {/* SubCategory selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type <span className="text-red-500">*</span></label>
            <div className="flex gap-6">
              {(['Phrases', 'Textes'] as const).map((sc) => (
                <label key={sc} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="subCategory" value={sc} checked={form.subCategory === sc}
                    onChange={() => set('subCategory', sc)} className="accent-tef-blue" required={!form.subCategory} />
                  <span className="text-sm text-gray-700 font-medium">{sc}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Phrases : Q8–13 · Textes : Q14–17</p>
          </div>
          {/* Title — only for Textes */}
          {form.subCategory === 'Textes' && inputField('Titre du texte', 'taskTitle', false, false, 'Ex : La pollution dans les villes…')}
          {/* Phrase or Text */}
          {inputField(
            form.subCategory === 'Textes' ? 'Texte lacunaire' : 'Phrase lacunaire',
            'longText', true, true,
            form.subCategory === 'Textes'
              ? 'Saisissez le texte avec les espaces vides (ex : … est arrivé ____ à 8h)…'
              : 'Saisissez la phrase avec le(s) trou(s) (ex : Il ____ parti hier)…'
          )}
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {answerFields}
        </div>
      )
    }

    // ── Q18-21 : Lecture rapide de textes ──
    // Admin: 4 Textes(+titres) → Question → Réponses
    if (cat === 'Q18-21') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            📖 Saisissez les 4 textes courts qui seront affichés en grille 2×2 pour le candidat.
          </p>
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">Texte {n}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du texte {n} <span className="text-red-500">*</span></label>
                <input type="text"
                  value={form[`text${n}Title` as keyof QuestionFormData] as string}
                  onChange={(e) => set(`text${n}Title` as keyof QuestionFormData, e.target.value)}
                  placeholder={`Ex : Document ${n}…`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue bg-white"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu du texte {n} <span className="text-red-500">*</span></label>
                <textarea
                  value={form[`text${n}Content` as keyof QuestionFormData] as string}
                  onChange={(e) => set(`text${n}Content` as keyof QuestionFormData, e.target.value)}
                  rows={4}
                  placeholder={`Saisissez le contenu du texte ${n}…`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue bg-white"
                  required />
              </div>
            </div>
          ))}
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {answerFields}
        </div>
      )
    }

    // ── Q22 : Lecture rapide de graphiques ──
    // Admin: Consigne → Image → Question → Commentaire(opt) → Réponses
    if (cat === 'Q22') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          {inputField('Consigne', 'consigne', true, true, 'Ex : Observez ce graphique et répondez aux questions…')}
          <FileUpload type="image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} label="Image du graphique" />
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {inputField('Commentaire', 'comment', false, true, 'Commentaire ou note optionnelle sous la question…')}
          {answerFields}
        </div>
      )
    }

    // ── Q23-32 : Documents administratifs et professionnels ──
    // Admin: Consigne → Image → Texte complémentaire(opt,+titre) → Question → Réponses
    if (cat === 'Q23-32') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          {inputField('Consigne', 'consigne', true, true, 'Ex : Lisez ce document et répondez aux questions…')}
          <FileUpload type="image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} label="Image du document" />
          {inputField('Titre du texte complémentaire', 'taskTitle', false, false, 'Titre du texte additionnel (si nécessaire)…')}
          {inputField('Texte complémentaire', 'longText', false, true, 'Texte additionnel accompagnant le document (optionnel)…')}
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {answerFields}
        </div>
      )
    }

    // ── Q33-40 : Articles de presse ──
    // Admin: Consigne → Texte(+titre) → Question → Réponses
    if (cat === 'Q33-40') {
      return (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
          {inputField('Consigne', 'consigne', true, true, 'Ex : Lisez cet article et répondez aux questions…')}
          {inputField('Titre de l\'article', 'taskTitle', true, false, 'Ex : La crise du logement en France…')}
          {inputField('Texte de l\'article', 'longText', true, true, 'Saisissez le texte complet de l\'article…')}
          {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
          {answerFields}
        </div>
      )
    }

    // Fallback (unknown category)
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">{orderField}{categorySelector}</div>
        {inputField('Énoncé de la question', 'question', true, true)}
        {answerFields}
      </div>
    )
  }

  // ─── CO form ──────────────────────────────────────────────────────────────────
  const renderCOForm = () => {
    const selectedCat = CO_CATEGORIES.find((c) => c.value === form.category)
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {orderField}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue">
              <option value="">-- Sélectionner --</option>
              {CO_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Consigne preview — auto-displayed from category in quiz */}
        {selectedCat && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            <span className="font-semibold">Consigne affichée au candidat : </span>{selectedCat.consigne}
          </div>
        )}

        {/* Transcription audio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transcription du document audio{' '}
            <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={form.longText}
            onChange={(e) => set('longText', e.target.value)}
            rows={5}
            placeholder="Saisissez ici la transcription complète du document audio (dialogue, annonce, répondeur…). Utilisée pour générer l'audio TTS via le bouton «🎙️ Générer audios CO»."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
          />
          <p className="text-xs text-gray-400 mt-1">
            ⚠️ Cette transcription est <strong>réservée à l&apos;admin</strong> pour générer l&apos;audio TTS. Elle n&apos;est <strong>pas affichée</strong> au candidat pendant l&apos;examen.
          </p>
        </div>

        {/* Question posée — Micro-trottoirs uniquement (Q15-20) */}
        {form.category === 'Q15-20' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question posée{' '}
              <span className="text-gray-400 font-normal">(Micro-trottoir)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Ex : Que pensez-vous de l'usage des réseaux sociaux par les jeunes ?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            <p className="text-xs text-gray-400 mt-1">
              La question posée par l&apos;interviewer sera affichée avant l&apos;énoncé de la question pendant l&apos;examen.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <FileUpload type="image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} label="Image (Q1–4 avec dessins)" />
          <FileUpload type="audio" value={form.audioUrl} onChange={(url) => set('audioUrl', url)} label="Fichier audio (lecture unique)" required />
        </div>

        {inputField('Énoncé de la question', 'question', true, true, 'Saisissez la question posée au candidat…')}
        {answerFields}
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
              Titre de l&apos;article <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.taskTitle}
              onChange={(e) => set('taskTitle', e.target.value)}
              placeholder="Ex : Mariages au sommet, Un lion sème la panique…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            <p className="text-xs text-gray-400 mt-1">Affiché en gras avant le début de l&apos;article pendant le test.</p>
          </div>
        )}

        {/* Titre de l'annonce (EO only) — affiché avant le texte */}
        {moduleCode === 'EO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l&apos;annonce / publicité <span className="text-gray-400 font-normal">(optionnel si image)</span>
            </label>
            <input
              type="text"
              value={form.taskTitle}
              onChange={(e) => set('taskTitle', e.target.value)}
              placeholder="Ex : Offre d'emploi — Assistant(e) commercial(e), Festival de Jazz 2025…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affiché en gras centré au-dessus du texte de l&apos;annonce. Obligatoire quand aucune image n&apos;est fournie.
            </p>
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
              Uploadez une image de l&apos;annonce réelle (scan ou capture d&apos;une publicité, offre d&apos;emploi, etc.).
              Si les deux sont fournis, l&apos;image est affichée en priorité.
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

  // ─── CO audio generation ─────────────────────────────────────────────────────
  const handleGenerateAudio = async (overwrite = false) => {
    if (!selectedSeriesId || moduleCode !== 'CO') return
    const msg = overwrite
      ? 'Régénérer TOUS les audios (même ceux existants) ?'
      : 'Générer les audios manquants à partir des transcriptions ?'
    if (!window.confirm(msg)) return

    setGeneratingAudio(true)
    setAudioGenResult(null)
    try {
      const res = await fetch('/api/co-generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId: selectedSeriesId, overwrite }),
      })
      const data = await res.json()
      if (res.ok) {
        setAudioGenResult(`✅ ${data.generated} audio(s) généré(s)${data.errors?.length ? ` — ${data.errors.length} erreur(s)` : ''}`)
        loadQuestions(selectedSeriesId) // refresh to show new audioUrls
      } else {
        setAudioGenResult(`❌ ${data.error || 'Erreur inconnue'}`)
      }
    } catch {
      setAudioGenResult('❌ Erreur réseau')
    } finally {
      setGeneratingAudio(false)
    }
  }

  // ─── CO audio generation — single question ───────────────────────────────────
  const handleGenerateSingleAudio = async (q: Question) => {
    if (!selectedSeriesId || moduleCode !== 'CO' || !q.longText) return
    setGeneratingAudioId(q.id)
    setAudioGenResult(null)
    try {
      const res = await fetch('/api/co-generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId: selectedSeriesId, questionId: q.id, overwrite: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setAudioGenResult(`✅ Q${q.questionOrder} : audio généré (${data.results?.[0]?.sizeKo ?? '?'} Ko)`)
        loadQuestions(selectedSeriesId)
      } else {
        setAudioGenResult(`❌ Q${q.questionOrder} : ${data.error || 'Erreur inconnue'}`)
      }
    } catch {
      setAudioGenResult(`❌ Q${q.questionOrder} : erreur réseau`)
    } finally {
      setGeneratingAudioId(null)
    }
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
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedSeriesId} onChange={(e) => handleSeriesChange(e.target.value)}
            className="flex-1 min-w-0 sm:max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue">
            <option value="">-- Choisir une série --</option>
            {(['CE', 'CO', 'EE', 'EO'] as const).map((code) => {
              if (moduleFilter && moduleFilter !== code) return null
              const group = series.filter((s) => s.module.code === code)
              if (!group.length) return null
              return (
                <optgroup key={code} label={`Module ${code}`}>
                  {group.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </optgroup>
              )
            })}
          </select>

          {/* Module filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['', 'CE', 'CO', 'EE', 'EO'] as const).map((code) => (
              <button
                key={code || 'all'}
                onClick={() => setModuleFilter(code)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  moduleFilter === code
                    ? 'bg-tef-blue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {code || 'Tous'}
              </button>
            ))}
          </div>
        </div>
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
            <div className="flex items-center gap-2">
              {moduleCode === 'CO' && questions.length > 0 && (
                <button
                  onClick={() => handleGenerateAudio(false)}
                  disabled={generatingAudio}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {generatingAudio ? '⏳ Génération…' : '🎙️ Générer audios CO'}
                </button>
              )}
              {(!isTask || questions.length < 2) && (
                <button onClick={openNew}
                  className="px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-tef-blue-hover transition-colors">
                  {isTask ? '+ Ajouter une section' : '+ Nouvelle question'}
                </button>
              )}
            </div>
          </div>
          {audioGenResult && (
            <p className={`text-sm font-medium ${audioGenResult.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {audioGenResult}
            </p>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {editingId ? (isTask ? 'Modifier la section' : 'Modifier la question') : (isTask ? 'Nouvelle section' : 'Nouvelle question')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isTask ? renderTaskForm() : moduleCode === 'CE' ? renderCEForm() : renderCOForm()}
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
                          {moduleCode === 'EO' && q.taskTitle && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">Titre de l&apos;annonce</p>
                              <p className="text-sm text-gray-800 font-semibold">{q.taskTitle}</p>
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
                          {q.subCategory && <span className="text-xs text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">{q.subCategory}</span>}
                          {q.audioUrl && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">🎵 Audio</span>}
                          {q.imageUrl && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🖼 Image</span>}
                          {q.consigne && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📋 Consigne</span>}
                        </div>
                        {q.consigne && <p className="text-xs text-yellow-700 italic line-clamp-1">{q.consigne}</p>}
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
                      <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                        {moduleCode === 'CO' && q.longText && (
                          <button
                            onClick={() => handleGenerateSingleAudio(q)}
                            disabled={generatingAudioId === q.id || generatingAudio}
                            title="Générer l'audio TTS pour cette question"
                            className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {generatingAudioId === q.id ? '⏳' : '🎙️'}
                          </button>
                        )}
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
