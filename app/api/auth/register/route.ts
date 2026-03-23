import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createRateLimiter } from '@/lib/rate-limit'

// 5 registration attempts per IP per 15 minutes
const registerLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 5 })

const registerSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
    cityOfResidence: z.string().min(2, 'La ville est requise').max(100),
    referenceCode: z.string().max(50).optional().or(z.literal('')),
    email: z.string().email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
      .regex(
        /[^a-zA-Z0-9]/,
        'Le mot de passe doit contenir au moins un caractère spécial'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 attempts per IP per 15 min
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const rl = registerLimiter.check(ip)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${rl.retryAfter} seconde(s).` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json({ error: first?.message ?? 'Données invalides' }, { status: 400 })
    }

    const { name, cityOfResidence, referenceCode, email, password } = parsed.data

    // Check email not already taken
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cityOfResidence,
        referenceCode: referenceCode || null,
        role: 'SUBSCRIBER',
        accountStatus: 'ACTIVE',
        mustChangePassword: false,
      },
    })

    return NextResponse.json(
      { message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API_ERROR] POST /api/auth/register', error)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez plus tard.' }, { status: 500 })
  }
}
