import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { calculateCecrlLevel } from '@/lib/scoring'

const createAttemptSchema = z.object({
  seriesId: z.string().min(1, 'La série est requise'),
  moduleCode: z.string().min(1, 'Le code module est requis'),
  answers: z.unknown(),
  writtenTask1: z.string().optional(),
  writtenTask2: z.string().optional(),
  audioTask1: z.string().optional(),
  audioTask2: z.string().optional(),
  score: z.number().int().optional(),
  aiScore: z.number().optional(),
  cecrlLevel: z.string().optional(),
  timeTaken: z.number().int().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const data = createAttemptSchema.parse(body)

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        seriesId: data.seriesId,
        moduleCode: data.moduleCode,
        answers: data.answers as Parameters<typeof prisma.attempt.create>[0]['data']['answers'],
        writtenTask1: data.writtenTask1,
        writtenTask2: data.writtenTask2,
        audioTask1: data.audioTask1,
        audioTask2: data.audioTask2,
        score: data.score,
        aiScore: data.aiScore,
        cecrlLevel: data.cecrlLevel,
        timeTaken: data.timeTaken,
      },
      include: {
        series: {
          include: { module: true },
        },
      },
    })

    if (data.score !== undefined) {
      const allAttempts = await prisma.attempt.findMany({
        where: {
          userId,
          moduleCode: data.moduleCode,
          score: { not: null },
        },
      })

      const avgScore =
        allAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) /
        allAttempts.length
      const avgCecrl = calculateCecrlLevel(Math.round(avgScore))

      await prisma.result.upsert({
        where: {
          userId_moduleCode: {
            userId,
            moduleCode: data.moduleCode,
          },
        },
        update: { avgScore, cecrlLevel: avgCecrl },
        create: {
          userId,
          moduleCode: data.moduleCode,
          avgScore,
          cecrlLevel: avgCecrl,
        },
      })
    }

    return NextResponse.json(attempt, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/attempts', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        series: {
          include: { module: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('[API_ERROR] GET /api/attempts', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
