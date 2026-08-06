'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import InactivityWarning from '@/components/ui/InactivityWarning'
import NotificationBell from '@/components/ui/NotificationBell'

function getOrCreateDeviceToken(): string {
  try {
    let token = localStorage.getItem('tef_device_token')
    if (!token) {
      token = crypto.randomUUID()
      localStorage.setItem('tef_device_token', token)
    }
    return token
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [signingOut, setSigningOut] = useState(false)
  const { showWarning, remainingSeconds, stayConnected } = useInactivityTimeout()
  const [sessionBlocked, setSessionBlocked] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ activeCount: number; maxSessions: number } | null>(null)

  const sendHeartbeat = useCallback(async () => {
    if (!session?.user) return
    const deviceToken = getOrCreateDeviceToken()
    try {
      const res = await fetch('/api/session/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceToken }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.maxSessions > 0 && !data.allowed) {
        setSessionBlocked(true)
        setSessionInfo({ activeCount: data.activeCount, maxSessions: data.maxSessions })
      } else {
        setSessionBlocked(false)
      }
    } catch { /* fail silently */ }
  }, [session])

  useEffect(() => {
    if (!session?.user) return
    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [session, sendHeartbeat])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/connexion' })
  }

  const navLinks = [
    { href: '/dashboard', label: 'Mon espace', exact: true },
    { href: '/dashboard/performance', label: 'Performance', exact: false },
  ]

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Session limit modal */}
      {sessionBlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto text-2xl">🔒</div>
            <h2 className="text-lg font-extrabold text-gray-900">Nombre de sessions atteint</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre pack autorise{' '}
              <strong>{sessionInfo?.maxSessions} session{sessionInfo?.maxSessions !== 1 ? 's' : ''} simultanée{sessionInfo?.maxSessions !== 1 ? 's' : ''}</strong>.{' '}
              {sessionInfo?.activeCount} appareil{sessionInfo?.activeCount !== 1 ? 's sont' : ' est'} actuellement connecté{sessionInfo?.activeCount !== 1 ? 's' : ''} avec votre compte.
              Déconnectez-vous sur un autre appareil ou passez à un pack supérieur.
            </p>
            <div className="flex gap-3 justify-center pt-1">
              <Link
                href="/packs"
                className="px-4 py-2 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors"
              >
                Voir les packs
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/connexion' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <InactivityWarning
          remainingSeconds={remainingSeconds}
          onStayConnected={stayConnected}
        />
      )}

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href={isAdmin ? '/admin' : '/dashboard'}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <img src="/logo.png" alt="TEF-LAB" className="h-8 w-auto object-contain rounded-lg" />
            <span className="font-extrabold text-sm text-tef-blue tracking-tight group-hover:text-blue-700 transition-colors">
              TEF-LAB
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 text-sm font-medium flex-1 justify-center">
            {navLinks.map(({ href, label, exact }) => {
              const active = isActive(href, exact)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                    active
                      ? 'bg-tef-blue/10 text-tef-blue font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-tef-blue hover:bg-tef-blue/10 transition-colors"
              >
                Admin →
              </Link>
            )}
          </nav>

          {/* Right: notifications + logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
            >
              {signingOut ? (
                <>
                  <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  Déconnexion…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-tef-night py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/packs" className="hover:text-white transition-colors">Packs</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          </p>
          <p className="text-white/30">© 2025 TEF-LAB</p>
        </div>
      </footer>
    </div>
  )
}
