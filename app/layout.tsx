import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tef-Lab — Prépare ton TEF Canada',
  description:
    'Plateforme de préparation au TEF Canada pour les candidats camerounais. Entraîne-toi sur les 4 modules : Compréhension Écrite, Compréhension Orale, Expression Écrite et Expression Orale.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
