import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const CECRL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

const patchSchema = z.object({
  examDate: z.string().nullable().optional(),
  targetCE: z.enum(CECRL_LEVELS).nullable().optional(),
  targetCO: z.enum(CECRL_LEVELS).nullable().optional(),
  targetEE: z.enum(CECRL_LEVELS).nullable().optional(),
  targetEO: z.enum(CECRL_LEVELS).nullable().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { examDate: true, targetCE: true, targetCO: true, targetEE: true, targetEO: true },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('[API_ERROR] GET /api/profile', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const body = await req.json()
    const data = patchSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        examDate: data.examDate ? new Date(data.examDate) : data.examDate === null ? null : undefined,
        targetCE: data.targetCE !== undefined ? data.targetCE : undefined,
        targetCO: data.targetCO !== undefined ? data.targetCO : undefined,
        targetEE: data.targetEE !== undefined ? data.targetEE : undefined,
        targetEO: data.targetEO !== undefined ? data.targetEO : undefined,
      },
      select: { examDate: true, targetCE: true, targetCO: true, targetEE: true, targetEO: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 })
    }
    console.error('[API_ERROR] PATCH /api/profile', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
