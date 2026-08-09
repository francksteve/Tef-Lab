'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import InactivityWarning from '@/components/ui/InactivityWarning'
import NotificationBell from '@/components/ui/NotificationBell'

const navItems = [
  {
    href: '/admin', label: 'Tableau de bord', exact: true,
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    href: '/admin/commandes', label: 'Commandes',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    href: '/admin/utilisateurs', label: 'Utilisateurs',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    href: '/admin/packs', label: 'Packs',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  },
  {
    href: '/admin/series', label: 'Séries',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    href: '/admin/questions', label: 'Questions',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/admin/series-passees', label: 'Séries passées',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    href: '/admin/parametres', label: 'Paramètres',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { showWarning, remainingSeconds, stayConnected } = useInactivityTimeout()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/connexion')
    }
  }, [session, status, router])

  if (status === 'loading') return null

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const mustChange = session?.user?.mustChangePassword

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/connexion' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showWarning && (
        <InactivityWarning
          remainingSeconds={remainingSeconds}
          onStayConnected={stayConnected}
        />
      )}
      {/* Force password change banner */}
      {mustChange && pathname !== '/admin/changer-mot-de-passe' && (
        <div className="bg-red-600 text-white px-4 py-3 text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-3">
          ⚠️ Vous utilisez le mot de passe par défaut. Veuillez le modifier immédiatement pour sécuriser votre compte.
          <Link href="/admin/changer-mot-de-passe" className="underline font-bold hover:text-red-100">
            Modifier maintenant →
          </Link>
        </div>
      )}

      {/* Mobile header */}
      <header className="md:hidden bg-tef-blue text-white px-4 h-14 flex items-center justify-between flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="TEF-LAB" className="h-9 w-auto object-contain rounded-xl" />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-wide text-white leading-none">
              TEF<span className="text-red-400">-</span>LAB
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-300 mt-0.5">
              Admin
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell dark />
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-tef-blue text-white flex flex-col py-3 px-4 gap-1 border-t border-white/20">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/20 mt-2 pt-2 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> Mon espace abonné
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop only */}
        <aside className="w-56 bg-tef-blue text-white hidden md:flex flex-col flex-shrink-0">
          <div className="px-5 py-6 flex items-start justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="TEF-LAB" className="h-9 w-auto object-contain rounded-xl" />
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-base tracking-wide text-white leading-none">
                    TEF<span className="text-red-400">-</span>LAB
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-300 mt-0.5">
                    Administration
                  </span>
                </div>
              </Link>
            </div>
            <NotificationBell dark />
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Separator */}
            <div className="border-t border-white/20 my-3" />

            {/* Subscriber space link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/dashboard')
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              Mon espace abonné
            </Link>
          </nav>

          {/* Bottom: user info + logout */}
          <div className="px-5 py-4 border-t border-white/20 space-y-2">
            <p className="text-xs text-blue-300 truncate">{session?.user?.email}</p>
            <Link
              href="/admin/changer-mot-de-passe"
              className="text-xs text-blue-300 hover:text-white transition-colors block"
            >
              Changer mot de passe
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 text-xs text-blue-300 hover:text-red-300 transition-colors disabled:opacity-50 mt-1"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 bg-background overflow-auto admin-selectable">{children}</main>

          {/* Footer */}
          <footer className="bg-tef-blue text-white py-3 text-center text-xs flex-shrink-0">
            <p className="text-blue-300">© {new Date().getFullYear()} TEF-LAB — Administration</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
