import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { config } from '@/lib/config'
import { createRateLimiter } from '@/lib/rate-limit'

// 3 password-reset requests per IP per 15 minutes
const forgotPasswordLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 3 })

const schema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 attempts per IP per 15 min
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const rl = forgotPasswordLimiter.check(ip)
    if (!rl.allowed) {
      // Return same-shape 200 response to avoid enumeration via error differences
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = parsed.data

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Invalidate any existing unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email, used: false },
        data: { used: true },
      })

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      })

      const resetUrl = `${config.siteUrl}/reinitialiser-mot-de-passe?token=${token}`
      // Fire-and-forget — token is saved regardless of email delivery
      sendPasswordResetEmail({ name: user.name, email, resetUrl }).catch((err) => {
        console.error('[FORGOT-PASSWORD] Email send failed:', err)
      })
    }

    // Always return same message (security: don't reveal if email exists)
    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    })
  } catch (error) {
    console.error('[API_ERROR] POST /api/auth/forgot-password', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
