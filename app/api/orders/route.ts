import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendNewOrderEmail } from '@/lib/email'
import { generateVisitorToAdminLink } from '@/lib/whatsapp'
import { createNotification } from '@/lib/notifications'

const createOrderSchema = z.object({
  packId: z.string(),
  visitorName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  visitorEmail: z.string().email('Email invalide'),
  visitorPhone: z
    .string()
    .regex(/^\+237[0-9]{9}$/, 'Format: +237XXXXXXXXX'),
  visitorMessage: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createOrderSchema.parse(body)

    const pack = await prisma.pack.findUnique({
      where: { id: data.packId },
    })

    if (!pack || !pack.isActive) {
      return NextResponse.json(
        { error: 'Pack introuvable ou inactif' },
        { status: 404 }
      )
    }

    const reference = `TEFLAB-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        reference,
        packId: data.packId,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone,
        visitorMessage: data.visitorMessage,
        status: 'PENDING',
      },
    })

    sendNewOrderEmail({
      reference,
      packName: pack.name,
      price: pack.price,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      visitorPhone: data.visitorPhone,
      visitorMessage: data.visitorMessage,
      createdAt: order.createdAt,
    }).catch(console.error)

    // In-app notification for all admin accounts (fire-and-forget)
    prisma.user
      .findMany({ where: { role: 'ADMIN' } })
      .then((admins) => {
        for (const admin of admins) {
          createNotification({
            userId: admin.id,
            type: 'NEW_ORDER',
            title: '🛒 Nouvelle commande manuelle',
            message: `${data.visitorName} a commandé le pack ${pack.name} (${reference}).`,
            actionUrl: '/admin/commandes',
          }).catch(console.error)
        }
      })
      .catch(console.error)

    const whatsappLink = generateVisitorToAdminLink({
      packName: pack.name,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      reference,
      price: pack.price,
    })

    return NextResponse.json({ reference, whatsappLink }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/orders', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')

    const whereClause: Record<string, unknown> = {}
    if (statusParam && ['PENDING', 'VALIDATED', 'REJECTED'].includes(statusParam)) {
      whereClause.status = statusParam
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        pack: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            accountStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('[API_ERROR] GET /api/orders', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
