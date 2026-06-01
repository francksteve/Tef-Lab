'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import NotificationBell from '@/components/ui/NotificationBell'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/packs', label: 'Packs' },
  { href: '/entrainement-gratuit', label: 'Entraînement Gratuit' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/70 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="TEF-Lab" className="h-9 w-auto object-contain rounded-lg" />
            <div className="leading-none">
              <span className="font-extrabold text-base tracking-tight text-gray-900">
                TEF<span className="text-tef-red">-</span><span className="text-tef-blue">Lab</span>
              </span>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Prépa TEF Canada</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-tef-blue bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="text-sm font-medium text-gray-600 hover:text-tef-blue transition-colors px-3 py-2"
                >
                  {session.user.name?.split(' ')[0]}
                </Link>
                <NotificationBell />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:border-red-300 hover:text-tef-red transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-semibold px-4 py-2 text-gray-700 hover:text-tef-blue transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="text-sm font-semibold px-4 py-2 bg-tef-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-tef-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.href === '/' && ''}
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-1 space-y-1">
              {session ? (
                <>
                  <Link
                    href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Mon espace ({session.user.name?.split(' ')[0]})
                  </Link>
                  <div className="px-3 py-1">
                    <NotificationBell />
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-tef-red hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <Link
                    href="/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center py-2.5 bg-tef-blue text-white rounded-lg text-sm font-semibold"
                  >
                    S&apos;inscrire gratuitement
                  </Link>
                  <Link
                    href="/connexion"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
