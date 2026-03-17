import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendAccountActivatedEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { pack: true },
    })

    if (!order || order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Commande introuvable ou déjà traitée' },
        { status: 404 }
      )
    }

    const tempPassword = nanoid(8)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const activatedAt = new Date()
    const expiresAt = new Date(
      activatedAt.getTime() + order.pack.durationDays * 86400000
    )

    const user = await prisma.user.upsert({
      where: { email: order.visitorEmail },
      update: {},
      create: {
        name: order.visitorName,
        email: order.visitorEmail,
        password: hashedPassword,
        role: 'SUBSCRIBER',
        mustChangePassword: true,
      },
    })

    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'VALIDATED',
        userId: user.id,
        activatedAt,
        expiresAt,
      },
    })

    sendAccountActivatedEmail({
      visitorName: order.visitorName,
      visitorEmail: order.visitorEmail,
      packName: order.pack.name,
      tempPassword,
      activatedAt,
      expiresAt,
      modules: ['Compréhension Écrite (CE)', 'Compréhension Orale (CO)', 'Expression Écrite (EE)', 'Expression Orale (EO)'],
    }).catch(console.error)

    // In-app notification (fire-and-forget)
    createNotification({
      userId: user.id,
      type: 'PAYMENT_CONFIRMED',
      title: '✅ Votre compte est activé !',
      message: `Accès au pack ${order.pack.name} jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
      actionUrl: '/dashboard',
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API_ERROR] PATCH /api/orders/[id]/validate', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
