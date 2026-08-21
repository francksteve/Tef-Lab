'use client'
import { useState, useEffect } from 'react'

export default function AdminEmailsPage() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [userCount, setUserCount] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetch('/api/admin/broadcast-email')
      .then((r) => r.json())
      .then((d) => setUserCount(d.count ?? null))
      .catch(() => null)
  }, [])

  const bodyHtml = body
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  const handleSend = async () => {
    setSending(true)
    setError(null)
    setResult(null)
    setShowConfirm(false)

    try {
      const res = await fetch('/api/admin/broadcast-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'envoi')
      } else {
        setResult(data)
        if (data.sent === data.total) {
          setSubject('')
          setBody('')
        }
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setSending(false)
    }
  }

  const canSend = subject.trim().length >= 3 && body.trim().length >= 10

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Envoyer un email groupé</h1>
        <p className="text-sm text-gray-500 mt-1">
          Le message sera envoyé à tous les comptes actifs de la plateforme.
          {userCount !== null && (
            <span className="ml-1 font-medium text-tef-blue">{userCount} destinataire{userCount !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {result && (
        <div className={`mb-5 rounded-lg px-5 py-4 text-sm font-medium ${result.failed === 0 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          {result.failed === 0
            ? `✓ Email envoyé avec succès à ${result.sent} destinataire${result.sent !== 1 ? 's' : ''}.`
            : `Email envoyé à ${result.sent} destinataire${result.sent !== 1 ? 's' : ''} — ${result.failed} échec${result.failed !== 1 ? 's' : ''}.`}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg px-5 py-4 text-sm font-medium bg-red-50 border border-red-200 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Composer</span>
          <button
            onClick={() => setPreview((v) => !v)}
            className="text-xs text-tef-blue hover:underline"
          >
            {preview ? '← Retour à la rédaction' : 'Aperçu →'}
          </button>
        </div>

        {!preview ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Objet</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex : Mise à jour de la plateforme TEF-LAB"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue/30 focus:border-tef-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
                <span className="ml-2 font-normal text-gray-400 text-xs">Laissez une ligne vide entre les paragraphes</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder={`Bonjour,\n\nNous vous écrivons pour vous informer...\n\nCordialement,\nL'équipe TEF-LAB`}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue/30 focus:border-tef-blue resize-y font-mono"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">{body.length} caractère{body.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-tef-blue px-6 py-5">
                <p className="text-white font-black text-lg m-0">TEF-LAB</p>
                <p className="text-blue-200 text-xs mt-1 m-0">Préparation au TEF Canada</p>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-700 text-sm mb-4">Bonjour [Prénom],</p>
                {body.trim() ? (
                  <div
                    className="text-gray-700 text-sm leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                ) : (
                  <p className="text-gray-400 italic text-sm">Le corps du message s'affichera ici…</p>
                )}
              </div>
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
                <p className="text-gray-400 text-xs">
                  © {new Date().getFullYear()} TEF-LAB · Préparation au TEF Canada
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-400">
            {userCount !== null ? `${userCount} destinataire${userCount !== 1 ? 's' : ''}` : 'Chargement…'}
          </p>
          <button
            disabled={!canSend || sending}
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-[#0055B3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? 'Envoi en cours…' : 'Envoyer'}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-2">Confirmer l'envoi</h2>
            <p className="text-sm text-gray-600 mb-1">
              Vous êtes sur le point d'envoyer l'email
              <span className="font-medium text-gray-900"> « {subject} »</span>
            </p>
            <p className="text-sm text-gray-600 mb-5">
              à <span className="font-medium text-tef-blue">{userCount ?? '…'} destinataire{(userCount ?? 0) !== 1 ? 's' : ''}</span>.
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="flex-1 px-4 py-2 bg-tef-blue text-white text-sm font-semibold rounded-lg hover:bg-[#0055B3] transition-colors"
              >
                Confirmer l'envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
