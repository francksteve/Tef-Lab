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

function NavItem({
  href,
  label,
  exact = false,
  icon,
  onClick,
}: {
  href: string
  label: string
  exact?: boolean
  icon: React.ReactNode
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-tef-blue/10 text-tef-blue font-semibold'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className={`flex-shrink-0 ${active ? 'text-tef-blue' : 'text-gray-400'}`}>{icon}</span>
      {label}
    </Link>
  )
}

const IconHome = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconChart = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const IconUser = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconLogout = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const IconAdmin = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const IconMenu = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const IconClose = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [signingOut, setSigningOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { showWarning, remainingSeconds, stayConnected } = useInactivityTimeout()
  const [sessionBlocked, setSessionBlocked] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ activeCount: number; maxSessions: number } | null>(null)

  const firstName = session?.user?.name?.split(' ')[0] ?? ''
  const fullName = session?.user?.name ?? ''
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

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

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background">

      {/* ── Session limit modal ── */}
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
              <Link href="/packs" className="px-4 py-2 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors">
                Voir les packs
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/connexion' })} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <InactivityWarning remainingSeconds={remainingSeconds} onStayConnected={stayConnected} />
      )}

      <div className="flex min-h-screen">

        {/* ── Sidebar backdrop (mobile) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-white border-r border-gray-100
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-0 md:flex-shrink-0
          `}
        >
          {/* Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
            <Link
              href={isAdmin ? '/admin' : '/dashboard'}
              className="flex items-center gap-2 group"
              onClick={closeSidebar}
            >
              <img src="/logo.png" alt="TEF-LAB" className="h-8 w-auto object-contain rounded-lg" />
              <span className="font-extrabold text-sm text-tef-blue tracking-tight group-hover:text-blue-700 transition-colors">
                TEF-LAB
              </span>
            </Link>
            <button className="md:hidden text-gray-400 hover:text-gray-700 transition-colors" onClick={closeSidebar}>
              {IconClose}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <NavItem href="/dashboard" label="Mon espace" icon={IconHome} exact onClick={closeSidebar} />
            <NavItem href="/dashboard/performance" label="Performance" icon={IconChart} onClick={closeSidebar} />

            {/* Separator */}
            <div className="pt-5 pb-1.5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Compte</p>
            </div>

            {/* Mon profil TEF */}
            <Link
              href="/dashboard/profil"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                typeof window !== 'undefined' && window.location.pathname === '/dashboard/profil'
                  ? 'bg-tef-blue/10 text-tef-blue'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-tef-blue flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {initials || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{firstName || 'Mon profil'}</p>
                <p className="text-[11px] text-gray-400 font-medium">Mon profil TEF</p>
              </div>
            </Link>
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-gray-100 px-3 py-3 space-y-1 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="text-gray-400"><NotificationBell /></span>
            </div>

            {isAdmin && (
              <NavItem href="/admin" label="Admin →" icon={IconAdmin} onClick={closeSidebar} />
            )}

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <span className="flex-shrink-0">{IconLogout}</span>
              {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </aside>

        {/* ── Right side: mobile header + content + footer ── */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">

          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {IconMenu}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="TEF-LAB" className="h-7 w-auto object-contain rounded-md" />
              <span className="font-extrabold text-sm text-tef-blue">TEF-LAB</span>
            </Link>
            <NotificationBell />
          </header>

          {/* Page content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-tef-night py-4 flex-shrink-0">
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
      </div>
    </div>
  )
}
