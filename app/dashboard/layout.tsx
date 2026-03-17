'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import InactivityWarning from '@/components/ui/InactivityWarning'
import NotificationBell from '@/components/ui/NotificationBell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [signingOut, setSigningOut] = useState(false)
  const { showWarning, remainingSeconds, stayConnected } = useInactivityTimeout()

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/connexion' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showWarning && (
        <InactivityWarning
          remainingSeconds={remainingSeconds}
          onStayConnected={stayConnected}
        />
      )}
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href={isAdmin ? '/admin' : '/'}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img src="/logo.png" alt="TEF-LAB" className="h-4 w-auto object-contain" />
            <span className="font-bold text-base text-tef-blue">TEF-LAB</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-5 text-sm font-medium flex-1 justify-center">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-tef-blue transition-colors"
            >
              Mon espace
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-tef-blue hover:underline font-semibold"
              >
                Administration →
              </Link>
            )}
          </nav>

          {/* Notifications + Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
            >
              {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-tef-blue text-white py-5 text-center text-xs">
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-blue-200">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/packs" className="hover:text-white transition-colors">Packs</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
        </p>
        <p className="text-blue-300 mt-2">© 2025 TEF-LAB. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
