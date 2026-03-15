'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/commandes', label: 'Commandes', icon: '🛒' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { href: '/admin/packs', label: 'Packs', icon: '📦' },
  { href: '/admin/series', label: 'Séries', icon: '📚' },
  { href: '/admin/questions', label: 'Questions', icon: '❓' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Force password change banner */}
      {mustChange && pathname !== '/admin/changer-mot-de-passe' && (
        <div className="bg-red-600 text-white px-4 py-3 text-sm font-medium text-center flex items-center justify-center gap-3">
          ⚠️ Vous utilisez le mot de passe par défaut. Veuillez le modifier immédiatement pour sécuriser votre compte.
          <Link href="/admin/changer-mot-de-passe" className="underline font-bold hover:text-red-100">
            Modifier maintenant →
          </Link>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-tef-blue text-white hidden md:flex flex-col py-6">
          <div className="px-5 mb-6">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-bold text-white text-lg">TEF CAN</span>
              <span className="font-bold text-tef-red text-lg">237</span>
            </Link>
            <p className="text-blue-300 text-xs mt-1">Administration</p>
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
          </nav>
          <div className="px-5 pt-4 border-t border-blue-700 mt-4">
            <p className="text-xs text-blue-300">{session?.user?.email}</p>
            <Link href="/admin/changer-mot-de-passe" className="text-xs text-blue-300 hover:text-white mt-1 block">
              Changer mot de passe
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
