'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import InactivityWarning from '@/components/ui/InactivityWarning'
import NotificationBell from '@/components/ui/NotificationBell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [signingOut, setSigningOut] = useState(false)
  const { showWarning, remainingSeconds, stayConnected } = useInactivityTimeout()

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/connexion' })
  }

  const navLinks = [
    { href: '/dashboard', label: 'Mon espace', exact: true },
    { href: '/dashboard/performance', label: '📊 Performance', exact: false },
  ]

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/" className="hover:text-tef-blue transition-colors">Accueil</Link>
            <Link href="/packs" className="hover:text-tef-blue transition-colors">Packs</Link>
            <Link href="/contact" className="hover:text-tef-blue transition-colors">Contact</Link>
            <Link href="/mentions-legales" className="hover:text-tef-blue transition-colors">Mentions légales</Link>
          </p>
          <p className="text-gray-300">© 2025 TEF-LAB</p>
        </div>
      </footer>
    </div>
  )
}
