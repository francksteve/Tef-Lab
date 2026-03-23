'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import InactivityWarning from '@/components/ui/InactivityWarning'
import NotificationBell from '@/components/ui/NotificationBell'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊', exact: true },
  { href: '/admin/commandes', label: 'Commandes', icon: '🛒' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { href: '/admin/packs', label: 'Packs', icon: '📦' },
  { href: '/admin/series', label: 'Séries', icon: '📚' },
  { href: '/admin/questions', label: 'Questions', icon: '❓' },
  { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
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
        <div className="md:hidden bg-tef-blue text-white flex flex-col py-3 px-4 gap-1 border-t border-blue-700">
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
          <div className="border-t border-blue-700 mt-2 pt-2 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>🎓</span> Mon espace abonné
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <span>🚪</span> {signingOut ? 'Déconnexion…' : 'Déconnexion'}
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
            <div className="border-t border-blue-700 my-3" />

            {/* Subscriber space link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/dashboard')
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🎓</span>
              Mon espace abonné
            </Link>
          </nav>

          {/* Bottom: user info + logout */}
          <div className="px-5 py-4 border-t border-blue-700 space-y-2">
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
              <span>🚪</span>
              {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>

          {/* Footer */}
          <footer className="bg-tef-blue text-white py-3 text-center text-xs flex-shrink-0">
            <p className="text-blue-300">© {new Date().getFullYear()} TEF-LAB — Administration</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
