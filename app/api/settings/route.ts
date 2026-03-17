import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const SETTINGS_ID = 'default'

const updateSchema = z.object({
  siteName: z.string().min(1, 'Le nom du site est requis').max(100),
  adminEmail: z.string().email("L'adresse email est invalide"),
  whatsappNumber: z.string().min(8).regex(/^\d+$/, 'Chiffres uniquement'),
  orangeMoneyNumber: z.string().min(8).regex(/^\d+$/, 'Chiffres uniquement'),
  mtnMomoNumber: z.string().min(8).regex(/^\d+$/, 'Chiffres uniquement'),
  usdExchangeRate: z.number().positive('Le taux doit être positif'),
  discountRate: z.number().min(0).max(100, 'La remise doit être entre 0 et 100'),
})

export async function GET() {
  try {
    const settings = await prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[API_ERROR] GET /api/settings', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
        { status: 400 }
      )
    }
    const settings = await prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: parsed.data,
      create: { id: SETTINGS_ID, ...parsed.data },
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[API_ERROR] PATCH /api/settings', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
