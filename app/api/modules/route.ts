import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(modules)
  } catch (error) {
    console.error('[API_ERROR] GET /api/modules', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
