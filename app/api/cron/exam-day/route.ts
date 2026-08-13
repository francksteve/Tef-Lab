import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendExamDayEmail } from '@/lib/email'

/**
 * GET /api/cron/exam-day
 *
 * Envoi quotidien à 5h00 UTC (configuré dans vercel.json).
 * Sécurisé par le header Authorization: Bearer CRON_SECRET.
 *
 * Envoie un email de conseils de dernière minute à tous les utilisateurs
 * dont la date d'examen (examDate) est aujourd'hui.
 */
export const maxDuration = 120

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  try {
    const users = await prisma.user.findMany({
      where: {
        examDate: { gte: today, lt: tomorrow },
        accountStatus: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        targetCE: true,
        targetCO: true,
        targetEE: true,
        targetEO: true,
      },
    })

    let sent = 0
    let errors = 0

    for (const user of users) {
      try {
        await sendExamDayEmail({
          clientName: user.name,
          clientEmail: user.email,
          targets: {
            CE: user.targetCE,
            CO: user.targetCO,
            EE: user.targetEE,
            EO: user.targetEO,
          },
        })
        sent++
      } catch (err) {
        console.error(`[CRON] exam-day email failed for ${user.email}:`, err)
        errors++
      }
    }

    console.log(`[CRON] exam-day: ${sent} emails sent, ${errors} errors (${today.toISOString().slice(0, 10)})`)
    return NextResponse.json({ sent, errors, date: today.toISOString().slice(0, 10) })
  } catch (error) {
    console.error('[CRON] exam-day error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
