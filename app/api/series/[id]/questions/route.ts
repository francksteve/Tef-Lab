import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questions = await prisma.question.findMany({
      where: { seriesId: params.id },
      orderBy: { questionOrder: 'asc' },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('[API_ERROR] GET /api/series/[id]/questions', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
