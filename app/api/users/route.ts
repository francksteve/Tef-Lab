import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const search = searchParams.get('search')?.trim() ?? ''
    const filter = searchParams.get('filter') ?? 'Tous'
    const sortKey = searchParams.get('sort') ?? 'createdAt'
    const sortDir = (searchParams.get('dir') ?? 'desc') === 'asc' ? 'asc' : 'desc'

    const where: Prisma.UserWhereInput = {
      ...(filter === 'Abonnés' && { role: 'SUBSCRIBER' }),
      ...(filter === 'Admins' && { role: 'ADMIN' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    // pack column requires a relation join — fall back to createdAt server-side
    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortKey === 'name'
        ? { name: sortDir }
        : sortKey === 'status'
        ? { accountStatus: sortDir }
        : { createdAt: sortDir }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      pageSize: PAGE_SIZE,
    })
  } catch (error) {
    console.error('[API_ERROR] GET /api/users', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
