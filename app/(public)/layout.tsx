import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { prisma } from '@/lib/prisma'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } }).catch(() => null)
  const whatsappNumber = settings?.whatsappNumber ?? '237683008287'

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer whatsappNumber={whatsappNumber} />
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </>
  )
}
