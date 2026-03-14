import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createPackSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  price: z.number().int().positive('Le prix doit être positif'),
  description: z.string().min(1, 'La description est requise'),
  nbModules: z.number().int().positive(),
  nbSeriesPerModule: z.number().int().positive(),
  durationDays: z.number().int().positive('La durée doit être positive'),
  isActive: z.boolean().optional(),
  seriesIds: z.array(z.string()).optional(),
})

export async function GET() {
  try {
    const packs = await prisma.pack.findMany({
      where: { isActive: true },
      include: {
        series: {
          include: {
            series: {
              include: {
                module: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
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
    const data = createPackSchema.parse(body)

    const pack = await prisma.pack.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        nbModules: data.nbModules,
        nbSeriesPerModule: data.nbSeriesPerModule,
        durationDays: data.durationDays,
        isActive: data.isActive ?? true,
        ...(data.seriesIds && data.seriesIds.length > 0
          ? {
              series: {
                create: data.seriesIds.map((sid) => ({ seriesId: sid })),
              },
            }
          : {}),
      },
      include: {
        series: {
          include: { series: true },
        },
      },
    })

    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/packs', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
