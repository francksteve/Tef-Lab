import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const packSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  price: z.number().int().positive('Le prix doit être positif'),
  description: z.string().min(1, 'La description est requise'),
  moduleAccess: z.enum(['EE_EO', 'ALL']),
  maxSessions: z.number().int().min(1),
  aiUsagePerDay: z.number().int().min(0),
  durationDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === '1'

    // `?all=1` is reserved for admin — require ADMIN session
    if (showAll) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const packs = await prisma.pack.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { price: 'asc' },
    })
    return NextResponse.json(packs)
  } catch (error) {
    console.error('[API_ERROR] GET /api/packs', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const body = await req.json()
    const parsed = packSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }
    const pack = await prisma.pack.create({ data: { ...parsed.data, isActive: parsed.data.isActive ?? true, isRecommended: parsed.data.isRecommended ?? false } })
    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    console.error('[API_ERROR] POST /api/packs', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
