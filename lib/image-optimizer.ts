/**
 * Server-side image optimization using sharp (built into Next.js).
 * Converts images to WebP, max 800px width, quality 75.
 * Typically reduces PNG/JPEG by 60-80%.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp')

const MAX_WIDTH = 800
const WEBP_QUALITY = 75

/**
 * Optimize an image buffer: resize to max width, convert to WebP.
 * Returns { buffer, contentType, extension }.
 */
export async function optimizeImage(
  input: Buffer | ArrayBuffer
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)

  const image = sharp(buf)
  const metadata = await image.metadata()

  // Only resize if wider than MAX_WIDTH
  if (metadata.width && metadata.width > MAX_WIDTH) {
    image.resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
  }

  const optimized = await image.webp({ quality: WEBP_QUALITY }).toBuffer()

  return {
    buffer: optimized,
    contentType: 'image/webp',
    extension: 'webp',
  }
}
