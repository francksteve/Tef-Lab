import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const INACTIVE_DAYS = 90

// ── GET — appelé par Vercel Cron (Authorization: Bearer CRON_SECRET)
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return runCleanup(false)
}

// ── POST — déclenché par le bouton admin (?dryRun=true pour prévisualiser)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const dryRun = new URL(req.url).searchParams.get('dryRun') === 'true'
  return runCleanup(dryRun)
}

async function runCleanup(dryRun: boolean) {
  const now = new Date()
  const cutoff = new Date(now.getTime() - INACTIVE_DAYS * 24 * 60 * 60 * 1000)

  // Trouve les abonnés inactifs :
  // - rôle SUBSCRIBER
  // - compte créé il y a plus de 90 jours
  // - aucun abonnement actif (Order VALIDATED avec expiresAt dans le futur)
  // - aucun passage de série dans les 90 derniers jours
  const targets = await prisma.user.findMany({
    where: {
      role: 'SUBSCRIBER',
      createdAt: { lt: cutoff },
      orders: {
        none: {
          status: 'VALIDATED',
          expiresAt: { gt: now },
        },
      },
      attempts: {
        none: {
          completedAt: { gt: cutoff },
        },
      },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      wouldDelete: targets.length,
      users: targets.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      })),
    })
  }

  if (targets.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'Aucun abonné inactif trouvé.' })
  }

  const ids = targets.map((u) => u.id)
  const emails = targets.map((u) => u.email)

  // Supprime PasswordResetToken par email (pas de userId foreign key)
  await prisma.passwordResetToken.deleteMany({ where: { email: { in: emails } } })

  // Supprime les utilisateurs — cascade : Attempt, Result, AIUsageLog,
  // UserDevice, Notification. Order.userId → SetNull (commandes conservées).
  const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } })

  console.log(`[CRON] cleanup-inactive: ${count} abonné(s) supprimé(s)`)

  return NextResponse.json({
    deleted: count,
    users: targets.map((u) => ({ name: u.name, email: u.email })),
  })
}
