import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const patchAttemptSchema = z.object({
  aiScore: z.number().optional(),
  cecrlLevel: z.string().optional(),
  scoringData: z.unknown().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id
    const body = await req.json()
    const data = patchAttemptSchema.parse(body)

    const existing = await prisma.attempt.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Tentative introuvable' }, { status: 404 })
    }

    const updated = await prisma.attempt.update({
      where: { id },
      data: {
        ...(data.aiScore !== undefined ? { aiScore: data.aiScore } : {}),
        ...(data.cecrlLevel !== undefined ? { cecrlLevel: data.cecrlLevel } : {}),
        ...(data.scoringData !== undefined
          ? { scoringData: data.scoringData as Parameters<typeof prisma.attempt.update>[0]['data']['scoringData'] }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] PATCH /api/attempts/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
