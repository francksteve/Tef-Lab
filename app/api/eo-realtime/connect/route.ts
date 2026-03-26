import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'

const INWORLD_REALTIME_URL = 'https://api.inworld.ai/v1/realtime/calls'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    const apiKey = config.inworldApiKey
    if (!apiKey) {
      console.error('[EO_REALTIME] INWORLD_API_KEY not configured')
      return new NextResponse('Service non configuré', { status: 503 })
    }

    // Read raw SDP offer — browser sends Content-Type: application/sdp
    const sdpOffer = await req.text()
    if (!sdpOffer || !sdpOffer.startsWith('v=0')) {
      return new NextResponse('SDP invalide', { status: 400 })
    }

    // Forward to Inworld Realtime API (API key never leaves the server)
    const inworldRes = await fetch(INWORLD_REALTIME_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/sdp',
      },
      body: sdpOffer,
    })

    if (!inworldRes.ok) {
      const errText = await inworldRes.text().catch(() => '')
      console.error(`[EO_REALTIME] Inworld error ${inworldRes.status}: ${errText}`)
      return new NextResponse('Erreur Inworld Realtime', {
        status: inworldRes.status >= 500 ? 502 : inworldRes.status,
      })
    }

    // Return raw SDP answer — browser needs plain text
    const sdpAnswer = await inworldRes.text()
    return new NextResponse(sdpAnswer, {
      status: 200,
      headers: {
        'Content-Type': 'application/sdp',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/eo-realtime/connect', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
