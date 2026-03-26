import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const apiKey = config.inworldApiKey
    if (!apiKey) {
      return NextResponse.json(
        { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      )
    }

    const res = await fetch('https://api.inworld.ai/v1/realtime/ice-servers', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (res.ok) {
      const data = await res.json() as { ice_servers?: RTCIceServer[] }
      return NextResponse.json({ iceServers: data.ice_servers ?? [] })
    }

    // Fallback to Google STUN if Inworld endpoint fails
    return NextResponse.json({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  } catch {
    return NextResponse.json({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  }
}
