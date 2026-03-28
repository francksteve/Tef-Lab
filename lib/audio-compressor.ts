/**
 * Client-side audio compression using lamejs (pure JS MP3 encoder).
 * Converts any audio file to mono MP3 at 22050 Hz / 64 kbps.
 * ~480 KB per minute of speech — ideal for TEF CO audio.
 *
 * Usage:
 *   const compressedFile = await compressAudio(originalFile)
 */

const TARGET_SAMPLE_RATE = 22050
const TARGET_KBPS = 64

/**
 * Compress an audio File to a mono MP3 at 22050 Hz / 64 kbps.
 * Returns a new File object ready for upload.
 */
export async function compressAudio(file: File): Promise<File> {
  // Dynamically import lamejs (client-side only)
  const lamejs = await import('lamejs')

  // 1. Decode original audio via Web Audio API
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new AudioContext()
  const decoded = await audioCtx.decodeAudioData(arrayBuffer)
  audioCtx.close()

  // 2. Downsample to target sample rate via OfflineAudioContext
  const duration = decoded.duration
  const offlineLength = Math.ceil(duration * TARGET_SAMPLE_RATE)
  const offline = new OfflineAudioContext(1, offlineLength, TARGET_SAMPLE_RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start(0)
  const rendered = await offline.startRendering()

  // 3. Convert Float32 → Int16 PCM
  const float32 = rendered.getChannelData(0)
  const pcm16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  // 4. Encode to MP3 with lamejs
  const encoder = new lamejs.Mp3Encoder(1, TARGET_SAMPLE_RATE, TARGET_KBPS)
  const mp3Chunks: Int8Array[] = []
  const BLOCK = 1152 // standard MP3 frame size

  for (let i = 0; i < pcm16.length; i += BLOCK) {
    const chunk = pcm16.subarray(i, i + BLOCK)
    const encoded = encoder.encodeBuffer(chunk)
    if (encoded.length > 0) mp3Chunks.push(encoded)
  }

  const flushed = encoder.flush()
  if (flushed.length > 0) mp3Chunks.push(flushed)

  // 5. Build Blob → File
  const totalLength = mp3Chunks.reduce((acc, c) => acc + c.length, 0)
  const mp3Data = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of mp3Chunks) {
    mp3Data.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset)
    offset += chunk.length
  }

  const blob = new Blob([mp3Data], { type: 'audio/mpeg' })
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.mp3`, { type: 'audio/mpeg' })
}

/**
 * Get a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
