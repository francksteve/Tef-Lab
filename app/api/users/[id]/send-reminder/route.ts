import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDailyPracticeReminder, sendDailyUpgradeReminder } from '@/lib/email'

/**
 * POST /api/users/[id]/send-reminder
 * Admin uniquement — envoie manuellement l'email de rappel à un utilisateur.
 * - Abonné actif  → email "Pratique quotidienne"
 * - Compte gratuit / expiré → email "Invitation à s'abonner"
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, accountStatus: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }
  if (user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Impossible d\'envoyer un rappel à un admin' }, { status: 400 })
  }
  if (user.accountStatus !== 'ACTIVE') {
    return NextResponse.json({ error: 'Compte suspendu — email non envoyé' }, { status: 400 })
  }

  // Chercher un abonnement actif
  const activeOrder = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: 'VALIDATED',
      expiresAt: { gt: new Date() },
    },
    include: { pack: true },
    orderBy: { expiresAt: 'desc' },
  })

  if (activeOrder) {
    const daysLeft = Math.ceil(
      (activeOrder.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    await sendDailyPracticeReminder({
      clientName: user.name,
      clientEmail: user.email,
      packName: activeOrder.pack.name,
      moduleAccess: activeOrder.pack.moduleAccess as 'FREE' | 'EE_EO' | 'ALL',
      daysLeft,
    })
    return NextResponse.json({ sent: 'practice', to: user.email })
  } else {
    await sendDailyUpgradeReminder({
      clientName: user.name,
      clientEmail: user.email,
    })
    return NextResponse.json({ sent: 'upgrade', to: user.email })
  }
}
