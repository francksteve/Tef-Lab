import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBroadcastEmail } from '@/lib/email'

const schema = z.object({
  subject: z.string().min(3, 'Objet requis (min 3 caractères)').max(200),
  body: z.string().min(10, 'Message requis (min 10 caractères)').max(10000),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = schema.parse(await req.json())

    // Fetch all active SUBSCRIBER accounts
    const users = await prisma.user.findMany({
      where: { accountStatus: 'ACTIVE' },
      select: { id: true, name: true, email: true },
      orderBy: { createdAt: 'asc' },
    })

    if (users.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total: 0 })
    }

    // Convert plain-text body to paragraphs for HTML rendering
    const htmlBody = data.body
      .split(/\n\n+/)
      .map((para) => `<p style="margin:0 0 16px;">${para.replace(/\n/g, '<br>')}</p>`)
      .join('')

    let sent = 0
    let failed = 0

    // Send sequentially to avoid SMTP rate limits
    for (const user of users) {
      try {
        await sendBroadcastEmail({
          clientName: user.name,
          clientEmail: user.email,
          subject: data.subject,
          htmlBody,
        })
        sent++
      } catch (err) {
        console.error(`[BROADCAST] Failed to send to ${user.email}:`, err)
        failed++
      }
    }

    return NextResponse.json({ sent, failed, total: users.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/admin/broadcast-email', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const count = await prisma.user.count({ where: { accountStatus: 'ACTIVE' } })
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
