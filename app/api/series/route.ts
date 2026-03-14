import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createSeriesSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  moduleId: z.string().min(1, 'Le module est requis'),
  difficulty: z.string().min(1, 'La difficulté est requise'),
  isFree: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const freeParam = searchParams.get('free')

    const whereClause: Record<string, unknown> = {}
    if (freeParam === 'true') {
      whereClause.isFree = true
    }

    const series = await prisma.series.findMany({
      where: whereClause,
      include: {
        module: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ module: { code: 'asc' } }, { difficulty: 'asc' }, { title: 'asc' }],
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('[API_ERROR] GET /api/series', error)
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
    const data = createSeriesSchema.parse(body)

    const series = await prisma.series.create({
      data: {
        title: data.title,
        moduleId: data.moduleId,
        difficulty: data.difficulty,
        isFree: data.isFree ?? false,
      },
      include: {
        module: true,
        _count: {
          select: { questions: true },
        },
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/series', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
