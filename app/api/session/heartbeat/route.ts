import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { checkAndRegisterDevice } from '@/lib/access'

const schema = z.object({ deviceToken: z.string().min(1).max(128) })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ allowed: true, activeCount: 1, maxSessions: 0 })
    }

    const body = await req.json()
    const { deviceToken } = schema.parse(body)

    const result = await checkAndRegisterDevice(session.user.id, deviceToken)
    return NextResponse.json(result)
  } catch {
    // Fail open — never block users due to session-tracking errors
    return NextResponse.json({ allowed: true, activeCount: 1, maxSessions: 0 })
  }
}
