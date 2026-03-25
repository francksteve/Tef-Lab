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
type Step = 'choose' | 'manual_form' | 'manual_success'

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
    sub: 'Paiement manuel — activation sous 5-10 min',
    icon: '🟠',
    color: 'bg-white text-gray-900',
    borderColor: 'border-orange-400',
  },
  mtn_momo: {
    label: 'MTN MoMo',
    sub: 'Paiement manuel — activation sous 5-10 min',
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
    }
  }, [isOpen])

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

  const handleNotchPay = async () => {
    setPayError('')
    if (!validateContact()) return
    setSelectedMethod('notchpay')
    setPaying(true)
    try {
      const res = await fetch('/api/payment/notchpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.id,
          customerName: contactForm.name,
          customerEmail: contactForm.email,
          customerPhone: contactForm.phone,
        }),
      })
      const data = await res.json()
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setPayError(data?.error ?? 'Erreur lors de l\'initialisation du paiement.')
      }
    } catch {
      setPayError('Erreur réseau. Réessayez.')
    } finally {
      setPaying(false)
    }
  }

  const handlePayPal = async () => {
    setPayError('')
    const errors: Record<string, string> = {}
    if (contactForm.name.trim().length < 2) errors.name = 'Nom requis (2 caractères min.)'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) errors.email = 'Email invalide'
    setContactErrors(errors)
    if (Object.keys(errors).length > 0) return
    setSelectedMethod('paypal')
    setPaying(true)
    try {
      const res = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack!.id,
          customerName: contactForm.name,
          customerEmail: contactForm.email,
        }),
      })
      const data = await res.json()
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setPayError(data?.error ?? 'Erreur lors de l\'initialisation PayPal.')
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
              {step === 'manual_success' ? 'Commande enregistrée ✅' : 'Finaliser votre abonnement'}
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
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700">
                  🎉 Remise de {settings.discountRate}% appliquée
                </div>
              )}

              {/* Payment methods */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Choisissez une méthode de paiement</p>

                {/* NotchPay — Primary */}
                <div className="rounded-xl border-2 border-tef-blue overflow-hidden mb-3">
                  <div className="bg-tef-blue/5 px-4 py-3 flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚡</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">Paiement automatique</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Orange Money · MTN MoMo
                      </p>
                      <span className="inline-flex items-center mt-1 gap-1 text-xs font-semibold text-green-600">
                        ✓ Accès activé immédiatement
                      </span>
                    </div>
                  </div>
                  {payError && (
                    <div className="px-4 py-2 bg-red-50 text-xs text-red-600">⚠️ {payError}</div>
                  )}
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={handleNotchPay}
                      disabled={paying}
                      className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl text-sm hover:bg-tef-blue-hover disabled:opacity-50 transition-colors"
                    >
                      {paying && selectedMethod === 'notchpay'
                        ? 'Redirection en cours…'
                        : `Payer ${finalPrice.toLocaleString('fr-FR')} FCFA`}
                    </button>
                  </div>
                </div>

                {/* PayPal */}
                <div className="rounded-xl border-2 border-[#003087] overflow-hidden mb-3">
                  <div className="bg-[#003087]/5 px-4 py-3 flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🌐</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">PayPal</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Carte bancaire internationale · Compte PayPal
                      </p>
                      <span className="inline-flex items-center mt-1 gap-1 text-xs font-semibold text-green-600">
                        ✓ Accès activé immédiatement
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={handlePayPal}
                      disabled={paying}
                      className="w-full py-3 bg-[#003087] text-white font-bold rounded-xl text-sm hover:bg-[#002060] disabled:opacity-50 transition-colors"
                    >
                      {paying && selectedMethod === 'paypal'
                        ? 'Redirection en cours…'
                        : `Payer avec PayPal — $${usd} USD`}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ou paiement manuel</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Orange Money */}
                <div className="rounded-xl border-2 border-orange-400 overflow-hidden mb-3">
                  <div className="bg-orange-50 px-4 py-3 flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🟠</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">Orange Money</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Envoi direct sur notre numéro Orange
                      </p>
                      <span className="inline-flex items-center mt-1 gap-1 text-xs font-semibold text-orange-600">
                        ⏱ Activation en 5-10 min
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => { setSelectedMethod('orange_money'); setStep('manual_form') }}
                      disabled={paying}
                      className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      Payer {finalPrice.toLocaleString('fr-FR')} FCFA — Orange Money
                    </button>
                  </div>
                </div>

                {/* MTN MoMo */}
                <div className="rounded-xl border-2 border-yellow-400 overflow-hidden mb-3">
                  <div className="bg-yellow-50 px-4 py-3 flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🟡</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">MTN MoMo</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Envoi direct sur notre numéro MTN
                      </p>
                      <span className="inline-flex items-center mt-1 gap-1 text-xs font-semibold text-yellow-600">
                        ⏱ Activation en 5-10 min
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => { setSelectedMethod('mtn_momo'); setStep('manual_form') }}
                      disabled={paying}
                      className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                    >
                      Payer {finalPrice.toLocaleString('fr-FR')} FCFA — MTN MoMo
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── LOGGED IN — MANUAL FORM ── */}
          {session && step === 'manual_form' && selectedMethod && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep('choose'); setPayError('') }}
                className="flex items-center gap-1 text-sm text-tef-blue hover:underline"
              >
                ← Retour
              </button>

              {/* Instructions */}
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

              {/* Contact form (pre-filled) */}
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
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
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
