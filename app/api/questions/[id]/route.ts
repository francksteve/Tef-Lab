import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateQuestionSchema = z.object({
  moduleId: z.string().min(1).optional(),
  seriesId: z.string().min(1).optional(),
  questionOrder: z.number().int().nonnegative().optional(),
  category: z.string().optional(),
  longText: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  question: z.string().min(1).optional(),
  optionA: z.string().min(1).optional(),
  optionB: z.string().min(1).optional(),
  optionC: z.string().min(1).optional(),
  optionD: z.string().min(1).optional(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).optional(),
  explanation: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const data = updateQuestionSchema.parse(body)

    const question = await prisma.question.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(question)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] PATCH /api/questions/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await prisma.question.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API_ERROR] DELETE /api/questions/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
