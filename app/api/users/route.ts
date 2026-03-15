import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        mustChangePassword: true,
        createdAt: true,
        orders: {
          where: { status: 'VALIDATED' },
          include: { pack: true },
          orderBy: { activatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('[API_ERROR] GET /api/users', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
