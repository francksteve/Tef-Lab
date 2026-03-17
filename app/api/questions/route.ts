import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createQuestionSchema = z.object({
  moduleId: z.string().min(1, 'Le module est requis'),
  seriesId: z.string().min(1, 'La série est requise'),
  questionOrder: z.number().int().nonnegative(),
  taskTitle: z.string().optional(),
  category: z.string().optional(),
  longText: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  audioUrl: z.string().url().optional().or(z.literal('')),
  question: z.string().min(1, "L'énoncé / la consigne est requise"),
  // Optional for EE/EO tasks which don't use QCM
  optionA: z.string().min(1).optional(),
  optionB: z.string().min(1).optional(),
  optionC: z.string().min(1).optional(),
  optionD: z.string().min(1).optional(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).optional(),
  explanation: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const data = createQuestionSchema.parse(body)

    const question = await prisma.question.create({
      data: {
        moduleId: data.moduleId,
        seriesId: data.seriesId,
        questionOrder: data.questionOrder,
        taskTitle: data.taskTitle,
        category: data.category,
        longText: data.longText,
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/questions', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
