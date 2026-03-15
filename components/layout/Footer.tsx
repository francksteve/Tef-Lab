import Link from 'next/link'

const footerLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/packs', label: 'Packs' },
  { href: '/entrainement-gratuit', label: 'Entraînement Gratuit' },
  { href: '/contact', label: 'Contact' },
  { href: '/mentions-legales', label: 'Mentions légales' },
]

export default function Footer() {
  return (
    <footer className="bg-tef-blue text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div>
            <span className="font-bold text-white text-xl">TEF CAN</span>
            <span className="font-bold text-tef-red text-xl">237</span>
            <p className="text-blue-200 text-sm mt-1">Prépare ton TEF Canada avec confiance</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-6 text-center text-sm text-blue-300">
          © 2025 Tef-Lab. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
