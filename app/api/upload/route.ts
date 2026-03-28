import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { optimizeImage } from '@/lib/image-optimizer'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase Storage non configuré (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants)' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) ?? 'media'

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Max size: 20 MB for audio, 5 MB for images (before optimization)
    const maxBytes = type === 'audio' ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / 1024 / 1024)
      return NextResponse.json({ error: `Fichier trop volumineux (max ${mb} Mo)` }, { status: 400 })
    }

    const originalSize = file.size
    let uploadBuffer: ArrayBuffer | Buffer = await file.arrayBuffer()
    let contentType = file.type || 'application/octet-stream'
    let ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'

    // ── Image optimization: resize + WebP ────────────────────
    if (type === 'image') {
      try {
        const optimized = await optimizeImage(uploadBuffer)
        uploadBuffer = optimized.buffer
        contentType = optimized.contentType
        ext = optimized.extension
        const saved = originalSize - optimized.buffer.length
        const pct = Math.round((saved / originalSize) * 100)
        console.log(`[UPLOAD] Image optimized: ${(originalSize / 1024).toFixed(0)}Ko → ${(optimized.buffer.length / 1024).toFixed(0)}Ko (-${pct}%)`)
      } catch (err) {
        console.warn('[UPLOAD] Image optimization failed, uploading original:', err)
        // Continue with original
      }
    }

    // ── Audio: client already compressed via lamejs ──────────
    // (client-side compression happens in FileUpload before upload)
    // Log the audio size for monitoring
    if (type === 'audio') {
      console.log(`[UPLOAD] Audio: ${(originalSize / 1024).toFixed(0)}Ko`)
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const path = `${type}/${timestamp}-${random}.${ext}`

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/tef-lab-media/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: Buffer.isBuffer(uploadBuffer) ? new Uint8Array(uploadBuffer) : uploadBuffer,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('[UPLOAD_ERROR]', errText)
      return NextResponse.json(
        { error: `Erreur Supabase Storage: ${uploadRes.status}` },
        { status: 500 }
      )
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/tef-lab-media/${path}`
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('[API_ERROR] POST /api/upload', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
