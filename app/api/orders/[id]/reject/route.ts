import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendOrderRejectedEmail } from '@/lib/email'

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

    await prisma.order.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
    })

    sendOrderRejectedEmail({
      visitorName: order.visitorName,
      visitorEmail: order.visitorEmail,
      packName: order.pack.name,
      reference: order.reference,
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API_ERROR] PATCH /api/orders/[id]/reject', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
