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
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="TEF-LAB" className="h-10 w-auto object-contain rounded-xl" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-lg tracking-wide text-tef-blue leading-none">
                TEF<span className="text-tef-red">-</span>LAB
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-0.5">
                Prépa TEF Canada
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-tef-blue ${
                  isActive(link.href)
                    ? 'text-tef-blue border-b-2 border-tef-blue pb-0.5'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="text-sm font-medium text-gray-700 hover:text-tef-blue transition-colors"
                >
                  {session.user.name?.split(' ')[0]}
                </Link>
                <NotificationBell />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium px-4 py-1.5 border border-gray-300 rounded-lg hover:border-tef-red hover:text-tef-red transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/inscription"
                  className="text-sm font-semibold px-5 py-2 border border-tef-blue text-tef-blue rounded-lg hover:bg-tef-blue hover:text-white transition-colors"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/connexion"
                  className="text-sm font-semibold px-5 py-2 bg-tef-blue text-white rounded-lg hover:bg-tef-blue-hover transition-colors"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-tef-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-tef-blue'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {session ? (
                <>
                  <Link
                    href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    Mon espace ({session.user.name?.split(' ')[0]})
                  </Link>
                  <div className="px-3 py-1">
                    <NotificationBell />
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-tef-red"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="block mx-3 mt-1 text-center py-2 border border-tef-blue text-tef-blue rounded-lg text-sm font-semibold"
                  >
                    S&apos;inscrire gratuitement
                  </Link>
                  <Link
                    href="/connexion"
                    onClick={() => setMenuOpen(false)}
                    className="block mx-3 mt-1 text-center py-2 bg-tef-blue text-white rounded-lg text-sm font-semibold"
                  >
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
