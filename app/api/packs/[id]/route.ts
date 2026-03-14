import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updatePackSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  description: z.string().min(1).optional(),
  nbModules: z.number().int().positive().optional(),
  nbSeriesPerModule: z.number().int().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  seriesIds: z.array(z.string()).optional(),
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
    const data = updatePackSchema.parse(body)

    const { seriesIds, ...packFields } = data

    if (seriesIds !== undefined) {
      await prisma.packSeries.deleteMany({ where: { packId: params.id } })
    }

    const pack = await prisma.pack.update({
      where: { id: params.id },
      data: {
        ...packFields,
        ...(seriesIds !== undefined && seriesIds.length > 0
          ? {
              series: {
                create: seriesIds.map((sid) => ({ seriesId: sid })),
              },
            }
          : {}),
      },
      include: {
        series: {
          include: { series: true },
        },
      },
    })

    return NextResponse.json(pack)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] PATCH /api/packs/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await prisma.packSeries.deleteMany({ where: { packId: params.id } })
    await prisma.pack.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API_ERROR] DELETE /api/packs/[id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
