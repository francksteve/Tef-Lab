'use client'
import { useState, useEffect } from 'react'

interface Pack {
  id: string
  name: string
  price: number
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  pack: Pack | null
}

interface FormData {
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorMessage: string
}

type ModalState = 'form' | 'success' | 'error'

export default function OrderModal({ isOpen, onClose, pack }: OrderModalProps) {
  const [form, setForm] = useState<FormData>({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '+237',
    visitorMessage: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [modalState, setModalState] = useState<ModalState>('form')
  const [reference, setReference] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setForm({ visitorName: '', visitorEmail: '', visitorPhone: '+237', visitorMessage: '' })
      setErrors({})
      setModalState('form')
      setReference('')
    }
  }, [isOpen])

  if (!isOpen || !pack) return null

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (form.visitorName.trim().length < 2)
      newErrors.visitorName = 'Le nom doit contenir au moins 2 caractères'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.visitorEmail))
      newErrors.visitorEmail = 'Email invalide'
    if (!/^\+237[0-9]{9}$/.test(form.visitorPhone))
      newErrors.visitorPhone = 'Format requis : +237XXXXXXXXX (9 chiffres)'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, packId: pack.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande')
      setReference(data.reference)
      setWhatsappLink(data.whatsappLink)
      setModalState('success')
    } catch {
      setModalState('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Commander</h2>
            <p className="text-sm text-gray-500">{pack.name} — {pack.price.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {modalState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Remplis ce formulaire. Nous te contacterons pour confirmer le paiement via Orange Money ou MTN MoMo.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  placeholder="Ex : Jean-Baptiste Fouda"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${errors.visitorName ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.visitorName && <p className="text-xs text-red-500 mt-1">{errors.visitorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.visitorEmail}
                  onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })}
                  placeholder="jean@exemple.com"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${errors.visitorEmail ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.visitorEmail && <p className="text-xs text-red-500 mt-1">{errors.visitorEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  value={form.visitorPhone}
                  onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                  placeholder="+237690000000"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${errors.visitorPhone ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.visitorPhone && <p className="text-xs text-red-500 mt-1">{errors.visitorPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                <textarea
                  value={form.visitorMessage}
                  onChange={(e) => setForm({ ...form, visitorMessage: e.target.value })}
                  placeholder="Une question ou précision..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue resize-none"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs text-tef-blue">
                💳 Paiement accepté : <strong>Orange Money</strong> et <strong>MTN MoMo</strong> au +237 683 008 287
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-tef-blue text-white rounded-lg font-semibold hover:bg-tef-blue-hover transition-colors disabled:opacity-60"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma commande'}
              </button>
            </form>
          )}

          {modalState === 'success' && (
            <div className="text-center space-y-4 py-2">
              <div className="text-5xl">✅</div>
              <h3 className="text-lg font-bold text-gray-900">Commande envoyée !</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-600">Référence :</p>
                <p className="font-mono font-bold text-tef-blue text-base">{reference}</p>
              </div>
              <p className="text-sm text-gray-600">
                Clique sur le bouton ci-dessous pour nous envoyer ton paiement sur WhatsApp. Ton compte sera activé après confirmation.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                💬 Continuer sur WhatsApp
              </a>
              <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
                Fermer
              </button>
            </div>
          )}

          {modalState === 'error' && (
            <div className="text-center space-y-4 py-2">
              <div className="text-5xl">❌</div>
              <h3 className="text-lg font-bold text-gray-900">Une erreur est survenue</h3>
              <p className="text-sm text-gray-600">
                Impossible de traiter ta commande. Contacte-nous directement sur WhatsApp.
              </p>
              <a
                href="https://wa.me/237683008287"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-semibold"
              >
                💬 Contacter sur WhatsApp
              </a>
              <button
                onClick={() => setModalState('form')}
                className="text-sm text-tef-blue hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
