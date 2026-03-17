import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isAuthenticated = !!session?.user

    const whereClause: Record<string, unknown> = {
      module: { code: params.code },
    }

    if (!isAuthenticated) {
      whereClause.isFree = true
    }

    const series = await prisma.series.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ title: 'asc' }],
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('[API_ERROR] GET /api/modules/[code]/series', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
