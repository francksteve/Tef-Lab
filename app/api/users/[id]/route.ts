import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendAccountActivatedEmail } from '@/lib/email'

const updateUserSchema = z.object({
  accountStatus: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  role: z.enum(['VISITOR', 'SUBSCRIBER', 'ADMIN']).optional(),
  resetPassword: z.boolean().optional(),
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
    const data = updateUserSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          where: { status: 'VALIDATED' },
          include: { pack: true },
          orderBy: { activatedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (data.accountStatus !== undefined) {
      updateData.accountStatus = data.accountStatus
    }
    if (data.role !== undefined) {
      updateData.role = data.role
    }

    if (data.resetPassword) {
      const tempPassword = nanoid(8)
      const hashedPassword = await bcrypt.hash(tempPassword, 12)
      updateData.password = hashedPassword
      updateData.mustChangePassword = true

      const activeOrder = user.orders[0]
      const now = new Date()
      const expiresAt = activeOrder?.expiresAt ?? new Date(now.getTime() + 30 * 86400000)

      sendAccountActivatedEmail({
        visitorName: user.name,
        visitorEmail: user.email,
        packName: activeOrder?.pack?.name ?? 'Votre pack',
        tempPassword,
        activatedAt: activeOrder?.activatedAt ?? now,
        expiresAt,
        modules: ['Compréhension Écrite (CE)', 'Compréhension Orale (CO)', 'Expression Écrite (EE)', 'Expression Orale (EO)'],
      }).catch(console.error)
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        mustChangePassword: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] PATCH /api/users/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
