'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Pack {
  id: string
  name: string
  price: number
  description?: string
  durationDays?: number
  moduleAccess?: string
}

interface Settings {
  usdExchangeRate: number
  discountRate: number
  orangeMoneyNumber?: string
  mtnMomoNumber?: string
  whatsappNumber?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  pack: Pack | null
}

type PayMethod = 'notchpay' | 'paypal' | 'orange_money' | 'mtn_momo'
type Step = 'choose' | 'campay_waiting' | 'manual_form' | 'manual_success'
type CampayStatus = 'pending' | 'success' | 'failed'

const methodConfig: Record<PayMethod, { label: string; sub: string; icon: string; color: string; borderColor: string }> = {
  notchpay: {
    label: 'Paiement automatique',
    sub: 'Orange Money · MTN MoMo · Visa · Mastercard',
    icon: '⚡',
    color: 'bg-tef-blue text-white',
    borderColor: 'border-tef-blue',
  },
  paypal: {
    label: 'PayPal',
    sub: 'Carte bancaire · Compte PayPal (USD)',
    icon: '🌐',
    color: 'bg-[#003087] text-white',
    borderColor: 'border-[#003087]',
  },
  orange_money: {
    label: 'Orange Money',
    sub: 'Paiement automatique via Campay',
    icon: '🟠',
    color: 'bg-white text-gray-900',
    borderColor: 'border-orange-400',
  },
  mtn_momo: {
    label: 'MTN MoMo',
    sub: 'Paiement automatique via Campay',
    icon: '🟡',
    color: 'bg-white text-gray-900',
    borderColor: 'border-yellow-400',
  },
}

export default function PaymentModal({ isOpen, onClose, pack }: Props) {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings>({ usdExchangeRate: 0.00165, discountRate: 0 })
  const [step, setStep] = useState<Step>('choose')
  const [selectedMethod, setSelectedMethod] = useState<PayMethod | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '+237' })
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({})
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')

  // Campay state
  const [campayRef, setCampayRef] = useState('')
  const [campayStatus, setCampayStatus] = useState<CampayStatus>('pending')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s?.usdExchangeRate) setSettings(s)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (session?.user) {
      setContactForm(prev => ({
        ...prev,
        name: prev.name && prev.name !== '' ? prev.name : (session.user.name ?? ''),
        email: prev.email && prev.email !== '' ? prev.email : (session.user.email ?? ''),
      }))
    }
  }, [session])

  // Reset on close/open
  useEffect(() => {
    if (isOpen) {
      setStep('choose')
      setSelectedMethod(null)
      setPayError('')
      setOrderRef('')
      setWhatsappLink('')
      setContactErrors({})
      setCampayRef('')
      setCampayStatus('pending')
    }
  }, [isOpen])

  // Poll order status while waiting for Campay confirmation
  useEffect(() => {
    if (step !== 'campay_waiting' || !campayRef) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/campay/status?ref=${campayRef}`)
        const data = await res.json()
        if (data.status === 'VALIDATED') {
          setCampayStatus('success')
          setTimeout(() => { window.location.href = '/dashboard?payment=success' }, 2500)
        } else if (data.status === 'REJECTED') {
          setCampayStatus('failed')
        }
      } catch {}
    }

    const interval = setInterval(poll, 3000)
    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      setCampayStatus('failed')
    }, 5 * 60 * 1000)

    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [step, campayRef])

  if (!isOpen || !pack) return null

  const finalPrice = Math.round(pack.price * (1 - settings.discountRate / 100))
  const hasDiscount = finalPrice < pack.price
  const usd = (finalPrice * settings.usdExchangeRate).toFixed(2)

  const validateContact = () => {
    const errors: Record<string, string> = {}
    if (contactForm.name.trim().length < 2) errors.name = 'Nom requis (2 caractères min.)'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) errors.email = 'Email invalide'
    if (!/^\+237[0-9]{9}$/.test(contactForm.phone)) errors.phone = 'Format : +237XXXXXXXXX'
    setContactErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCampay = async (method: 'orange_money' | 'mtn_momo') => {
    setPayError('')
    if (!validateContact()) return
    setSelectedMethod(method)
    setPaying(true)
    try {
      const res = await fetch('/api/payment/campay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.id,
          phone: contactForm.phone,
          paymentMethod: method,
          customerName: contactForm.name,
          customerEmail: contactForm.email,
        }),
      })
      const data = await res.json()
      if (res.ok && data.reference) {
        setCampayRef(data.reference)
        setCampayStatus('pending')
        setStep('campay_waiting')
      } else {
        setPayError(data?.error ?? 'Erreur lors de l\'initiation du paiement.')
        setSelectedMethod(null)
      }
    } catch {
      setPayError('Erreur réseau. Réessayez.')
      setSelectedMethod(null)
    } finally {
      setPaying(false)
    }
  }

  const handleManualOrder = async () => {
    setPayError('')
    if (!validateContact()) return
    setPaying(true)
    const payMethod = selectedMethod === 'orange_money' ? 'ORANGE_MONEY' : 'MTN_MOMO'
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: contactForm.name,
          visitorEmail: contactForm.email,
          visitorPhone: contactForm.phone,
          packId: pack.id,
          paymentMethod: payMethod,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrderRef(data.reference ?? '')
        setWhatsappLink(data.whatsappLink ?? `https://wa.me/${settings.whatsappNumber ?? '237683008287'}`)
        setStep('manual_success')
      } else {
        setPayError(data?.error ?? 'Erreur lors de la commande.')
      }
    } catch {
      setPayError('Erreur réseau. Réessayez.')
    } finally {
      setPaying(false)
    }
  }

  const phoneNumber = selectedMethod === 'mtn_momo'
    ? (settings.mtnMomoNumber ?? '237683008287')
    : (settings.orangeMoneyNumber ?? '237683008287')

  const resetToChoose = () => {
    setStep('choose')
    setPayError('')
    setCampayRef('')
    setCampayStatus('pending')
    setSelectedMethod(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              {step === 'manual_success' ? 'Commande enregistrée ✅'
                : step === 'campay_waiting' && campayStatus === 'success' ? 'Paiement confirmé ✅'
                : 'Finaliser votre abonnement'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {pack.name} —&nbsp;
              <span className="font-bold text-tef-blue">{finalPrice.toLocaleString('fr-FR')} FCFA</span>
              {hasDiscount && (
                <span className="line-through text-gray-400 ml-1">{pack.price.toLocaleString('fr-FR')}</span>
              )}
              &nbsp;≈ ${usd} USD
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">×</button>
        </div>

        <div className="p-5 space-y-5">

          {/* ── NOT LOGGED IN ── */}
          {!session && (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">🔐</div>
              <div>
                <p className="font-bold text-gray-900 text-base">Créez un compte gratuit pour continuer</p>
                <p className="text-sm text-gray-500 mt-1">
                  L'inscription est gratuite et vous donne accès immédiat aux séries CE et CO.
                  Finalisez votre abonnement après inscription.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`/inscription?pack=${pack.id}`}
                  className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl text-sm text-center hover:bg-tef-blue-hover transition-colors"
                >
                  Créer mon compte gratuit →
                </a>
                <a
                  href="/connexion"
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm text-center hover:bg-gray-200 transition-colors"
                >
                  J'ai déjà un compte — Se connecter
                </a>
              </div>
            </div>
          )}

          {/* ── LOGGED IN — CHOOSE METHOD ── */}
          {session && step === 'choose' && (
            <>
              {/* Contact form */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Vos coordonnées</p>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {contactErrors.name && <p className="text-xs text-red-500 mt-0.5">{contactErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {contactErrors.email && <p className="text-xs text-red-500 mt-0.5">{contactErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="+237600000000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {contactErrors.phone && <p className="text-xs text-red-500 mt-0.5">{contactErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Discount badge */}
              {settings.discountRate > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">
                  🎉 Remise de {settings.discountRate}% appliquée
                </div>
              )}

              {payError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠️ {payError}</p>}

              {/* Payment methods */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Méthode de paiement</p>

                <div className="rounded-xl border-2 border-tef-blue overflow-hidden">
                  <div className="bg-tef-blue px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-extrabold text-white">Paiement mobile</span>
                    </div>
                    <span className="text-xs font-semibold text-green-300 bg-green-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                      ✓ Activation immédiate
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-2 gap-2">
                    {/* Orange Money */}
                    <button
                      onClick={() => handleCampay('orange_money')}
                      disabled={paying}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 border-orange-300 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                    >
                      <span className="text-2xl">🟠</span>
                      <span className="text-xs font-bold text-gray-900">Orange Money</span>
                      <span className="text-xs text-gray-500">{finalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </button>

                    {/* MTN MoMo */}
                    <button
                      onClick={() => handleCampay('mtn_momo')}
                      disabled={paying}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50 transition-colors"
                    >
                      <span className="text-2xl">🟡</span>
                      <span className="text-xs font-bold text-gray-900">MTN MoMo</span>
                      <span className="text-xs text-gray-500">{finalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Paiement manuel — accès direct sans passer par Campay */}
              <div className="pt-1 border-t border-gray-100 mt-1">
                <p className="text-xs text-gray-400 text-center mb-2">Problème avec le paiement automatique ?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('orange_money'); setStep('manual_form') }}
                    className="text-xs py-2 px-3 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Orange Money manuel
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('mtn_momo'); setStep('manual_form') }}
                    className="text-xs py-2 px-3 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
                  >
                    MTN MoMo manuel
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── CAMPAY WAITING ── */}
          {session && step === 'campay_waiting' && (
            <div className="text-center space-y-4 py-2">

              {campayStatus === 'pending' && (
                <>
                  <div className="flex justify-center">
                    <div className="w-14 h-14 border-4 border-tef-blue/20 border-t-tef-blue rounded-full animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Vérifiez votre téléphone</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Un message {selectedMethod === 'orange_money' ? 'Orange Money' : 'MTN MoMo'} a été envoyé
                      au <strong className="text-gray-800">{contactForm.phone}</strong>.
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Entrez votre PIN pour confirmer le paiement.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 text-left space-y-1">
                    <p className="font-semibold">Cette page se met à jour automatiquement.</p>
                    <p>Ne fermez pas cette fenêtre — votre abonnement s'activera dès confirmation.</p>
                  </div>
                  <button
                    onClick={resetToChoose}
                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                  >
                    Annuler
                  </button>
                </>
              )}

              {campayStatus === 'success' && (
                <>
                  <div className="text-6xl">✅</div>
                  <h3 className="text-lg font-bold text-gray-900">Paiement confirmé !</h3>
                  <p className="text-sm text-gray-500">Votre abonnement est actif. Redirection en cours…</p>
                  <div className="w-6 h-6 border-2 border-tef-blue/20 border-t-tef-blue rounded-full animate-spin mx-auto" />
                </>
              )}

              {campayStatus === 'failed' && (
                <>
                  <div className="text-5xl">❌</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Paiement non confirmé</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Le paiement n'a pas été approuvé dans le délai imparti.
                    </p>
                  </div>
                  <button
                    onClick={resetToChoose}
                    className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={() => { setStep('manual_form') }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Payer manuellement à la place
                  </button>
                </>
              )}

            </div>
          )}

          {/* ── MANUAL FORM (fallback) ── */}
          {session && step === 'manual_form' && selectedMethod && (
            <div className="space-y-4">
              <button
                onClick={resetToChoose}
                className="flex items-center gap-1 text-sm text-tef-blue hover:underline"
              >
                ← Retour
              </button>

              <div className={`rounded-xl border-2 ${methodConfig[selectedMethod].borderColor} p-4 space-y-2`}>
                <div>
                  <p className="font-bold text-gray-900">{methodConfig[selectedMethod].label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Paiement manuel — activation sous 5-10 min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Envoyez <strong className="text-gray-900">{finalPrice.toLocaleString('fr-FR')} FCFA</strong> au numéro{' '}
                    <strong className="text-gray-900">+{phoneNumber}</strong> par {methodConfig[selectedMethod].label},
                    puis validez ci-dessous. Nous activerons votre compte en 5-10 min.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {contactErrors.name && <p className="text-xs text-red-500 mt-0.5">{contactErrors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Adresse email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {contactErrors.email && <p className="text-xs text-red-500 mt-0.5">{contactErrors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="+237600000000"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue ${contactErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {contactErrors.phone && <p className="text-xs text-red-500 mt-0.5">{contactErrors.phone}</p>}
                </div>
              </div>

              {payError && <p className="text-xs text-red-600">⚠️ {payError}</p>}

              <button
                onClick={handleManualOrder}
                disabled={paying}
                className="w-full py-3 bg-[#001344] text-white font-bold rounded-xl text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {paying ? 'Enregistrement…' : 'Confirmer ma commande'}
              </button>
            </div>
          )}

          {/* ── SUCCESS — MANUAL ORDER ── */}
          {step === 'manual_success' && (
            <div className="text-center space-y-4 py-2">
              <div className="text-5xl">✅</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Commande enregistrée !</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Envoyez le paiement puis cliquez sur le bouton WhatsApp ci-dessous pour nous le confirmer.
                </p>
              </div>
              {orderRef && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-gray-500 text-xs">Référence de commande :</p>
                  <p className="font-mono font-bold text-tef-blue text-base">{orderRef}</p>
                </div>
              )}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-colors"
              >
                💬 Confirmer le paiement sur WhatsApp
              </a>
              <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
