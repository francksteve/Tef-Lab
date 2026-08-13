import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')
    if (!ref) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { reference: ref, userId: session.user.id },
      select: { status: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    return NextResponse.json({ status: order.status })
  } catch (error) {
    console.error('[API_ERROR] GET /api/payment/campay/status', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
