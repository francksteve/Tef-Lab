import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const attempts = await prisma.attempt.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        series: { include: { module: { select: { code: true, name: true } } } },
      },
      orderBy: { completedAt: 'desc' },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('[API_ERROR] GET /api/admin/attempts', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
