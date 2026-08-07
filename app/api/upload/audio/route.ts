import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase Storage non configuré' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Max 30 MB — EO section B peut durer 10 min (webm/opus ~1–3 MB/min)
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 30 Mo)' }, { status: 400 })
    }

    const uploadBuffer = await file.arrayBuffer()
    const random = Math.random().toString(36).slice(2, 8)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'webm'
    const path = `eo-audio/${session.user.id}/${Date.now()}-${random}.${ext}`

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/tef-lab-media/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': file.type || 'audio/webm',
          'x-upsert': 'true',
        },
        body: uploadBuffer,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('[UPLOAD_AUDIO_ERROR]', errText)
      return NextResponse.json({ error: `Erreur Supabase Storage: ${uploadRes.status}` }, { status: 500 })
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/tef-lab-media/${path}`
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('[API_ERROR] POST /api/upload/audio', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
