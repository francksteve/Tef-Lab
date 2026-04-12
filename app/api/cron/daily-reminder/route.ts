import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendDailyPracticeReminder,
  sendDailyUpgradeReminder,
} from '@/lib/email'

/**
 * GET /api/cron/daily-reminder
 *
 * Envoi quotidien à 6h00 GMT (configuré dans vercel.json).
 * Sécurisé par le header Authorization: Bearer CRON_SECRET.
 *
 * - Utilisateurs avec abonnement actif  → email "Pratique quotidienne"
 * - Utilisateurs en mode gratuit        → email "Invitation à s'abonner"
 *
 * Vercel Cron envoie automatiquement le header Authorization avec CRON_SECRET.
 */
export const maxDuration = 300 // 5 min max pour traiter tous les utilisateurs

export async function GET(req: NextRequest) {
  // ── Sécurisation : vérifier le secret cron ──────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[CRON] Tentative non autorisée')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const startedAt = Date.now()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  console.log(`[CRON] daily-reminder démarré — ${today}`)

  // ── Récupérer tous les utilisateurs actifs (hors ADMIN) ─────────────────
  const users = await prisma.user.findMany({
    where: {
      accountStatus: 'ACTIVE',
      role: 'SUBSCRIBER',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  console.log(`[CRON] ${users.length} utilisateurs à traiter`)

  // ── Pour chaque utilisateur, vérifier s'il a un abonnement actif ─────────
  const now = new Date()
  let sentPractice = 0
  let sentUpgrade = 0
  let errors = 0

  for (const user of users) {
    try {
      // Chercher un abonnement VALIDATED non expiré
      const activeOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          status: 'VALIDATED',
          expiresAt: { gt: now },
        },
        include: { pack: true },
        orderBy: { expiresAt: 'desc' },
      })

      if (activeOrder) {
        // ── Abonné actif → email pratique ──────────────────────────────────
        const daysLeft = Math.ceil(
          (activeOrder.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        await sendDailyPracticeReminder({
          clientName: user.name,
          clientEmail: user.email,
          packName: activeOrder.pack.name,
          moduleAccess: activeOrder.pack.moduleAccess as 'FREE' | 'EE_EO' | 'ALL',
          daysLeft,
        })
        sentPractice++
      } else {
        // ── Compte gratuit → email upgrade ────────────────────────────────
        await sendDailyUpgradeReminder({
          clientName: user.name,
          clientEmail: user.email,
        })
        sentUpgrade++
      }

      // Petite pause pour ne pas saturer le serveur SMTP (max ~14 emails/s)
      await new Promise((r) => setTimeout(r, 70))
    } catch (err) {
      errors++
      console.error(`[CRON] Erreur utilisateur ${user.email}:`, err instanceof Error ? err.message : err)
    }
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  const summary = {
    date: today,
    total: users.length,
    sentPractice,
    sentUpgrade,
    errors,
    elapsedSeconds: elapsed,
  }

  console.log('[CRON] daily-reminder terminé :', summary)
  return NextResponse.json(summary)
}
