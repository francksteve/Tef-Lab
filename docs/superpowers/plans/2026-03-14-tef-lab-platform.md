# Tef-Lab Platform Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete fullstack Next.js 14 web platform for TEF Canada exam preparation targeting Cameroonian candidates, with manual order/payment management, 4 practice modules (CE, CO, EE, EO), AI scoring via Anthropic Claude, and a full admin dashboard.

**Architecture:** Next.js 14 App Router with TypeScript; Prisma ORM + PostgreSQL for data; NextAuth for JWT-based auth with role guards (VISITOR / SUBSCRIBER / ADMIN); API Routes for all backend logic; Nodemailer for transactional emails; wa.me links for WhatsApp notifications; Anthropic Claude API for AI scoring of written/oral expression modules.

**Tech Stack:** Next.js 14, TypeScript, TailwindCSS, Prisma, PostgreSQL (Supabase), NextAuth.js, bcryptjs, Nodemailer, nanoid, Zod, Anthropic SDK, Supabase Storage (audio/images)

---

## Scope Note

This is a single large project but logically divided into 7 independent subsystems that build on top of the foundation. Tasks 1-3 are strictly sequential. Tasks 4-7 can be parallelized after Task 3 completes.

---

## File Map

```
C:\Users\E7490\Desktop\Tef-Lab\
├── .env.example
├── .env                          # NOT committed
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── lib/
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── email.ts                  # Nodemailer + 3 templates
│   ├── whatsapp.ts               # wa.me link generator
│   ├── scoring.ts                # CE/CO scoring + AI prompts
│   └── config.ts                 # Env var access
├── app/
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   ├── (public)/
│   │   ├── page.tsx              # Home
│   │   ├── packs/page.tsx
│   │   ├── entrainement-gratuit/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/
│   │   └── connexion/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── serie/[id]/
│   │       ├── page.tsx          # CE / CO QCM
│   │       ├── ee/page.tsx       # Expression Écrite
│   │       └── eo/page.tsx       # Expression Orale
│   └── admin/
│       ├── page.tsx
│       ├── changer-mot-de-passe/page.tsx
│       ├── utilisateurs/page.tsx
│       ├── packs/page.tsx
│       ├── series/page.tsx
│       ├── questions/page.tsx
│       └── commandes/page.tsx
├── app/api/
│   ├── auth/[...nextauth]/route.ts
│   ├── auth/change-password/route.ts
│   ├── users/route.ts
│   ├── users/[id]/route.ts
│   ├── modules/route.ts
│   ├── modules/[code]/series/route.ts
│   ├── packs/route.ts
│   ├── packs/[id]/route.ts
│   ├── series/route.ts
│   ├── series/[id]/route.ts
│   ├── series/[id]/questions/route.ts
│   ├── questions/route.ts
│   ├── questions/[id]/route.ts
│   ├── orders/route.ts
│   ├── orders/[id]/validate/route.ts
│   ├── orders/[id]/reject/route.ts
│   ├── attempts/route.ts
│   ├── scoring/ee/route.ts
│   └── scoring/eo/route.ts
└── components/
    ├── layout/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   └── WhatsAppButton.tsx
    ├── ui/
    │   ├── Timer.tsx
    │   ├── AudioPlayer.tsx
    │   ├── WordCounter.tsx
    │   ├── AudioRecorder.tsx
    │   └── OrderModal.tsx
    └── admin/
        └── StatsCard.tsx
```

---

## Chunk 1: Foundation — Project Init, Schema, Auth

### Task 1: Initialize Next.js 14 Project

**Files:**
- Create: `package.json` (via npx)
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Initialize Next.js 14 with TypeScript + TailwindCSS + ESLint**

```bash
cd /c/Users/E7490/Desktop/Tef-Lab
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```
Expected: Next.js project scaffolded in current directory.

- [ ] **Step 2: Install all project dependencies**

```bash
npm install prisma @prisma/client next-auth bcryptjs nodemailer nanoid zod @anthropic-ai/sdk
npm install --save-dev @types/nodemailer @types/bcryptjs
```

- [ ] **Step 3: Create `.env.example`**

```env
DATABASE_URL=postgresql://user:password@host:5432/tef_lab
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tifuzzied@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Tef-Lab <tifuzzied@gmail.com>"

ADMIN_EMAIL=tifuzzied@gmail.com
ADMIN_WHATSAPP=237683008287

ANTHROPIC_API_KEY=your-anthropic-api-key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Copy .env.example to .env and fill in values**

```bash
cp .env.example .env
```
Note: User must fill in DATABASE_URL, NEXTAUTH_SECRET, SMTP credentials, and ANTHROPIC_API_KEY.

- [ ] **Step 5: Create `lib/config.ts` for centralized env access**

```typescript
// lib/config.ts
export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  nextauthSecret: process.env.NEXTAUTH_SECRET!,
  nextauthUrl: process.env.NEXTAUTH_URL!,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  },
  adminEmail: process.env.ADMIN_EMAIL!,
  adminWhatsapp: process.env.ADMIN_WHATSAPP!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
}
```

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "feat: initialize Next.js 14 project with dependencies"
```

---

### Task 2: Prisma Schema + Seed

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  VISITOR
  SUBSCRIBER
  ADMIN
}

enum Status {
  ACTIVE
  SUSPENDED
}

enum OrderStatus {
  PENDING
  VALIDATED
  REJECTED
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(SUBSCRIBER)
  accountStatus Status    @default(ACTIVE)
  mustChangePassword Boolean @default(false)
  createdAt     DateTime  @default(now())
  orders        Order[]
  attempts      Attempt[]
  results       Result[]
}

model Pack {
  id                String       @id @default(cuid())
  name              String
  price             Int
  description       String
  nbModules         Int
  nbSeriesPerModule Int
  durationDays      Int
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  orders            Order[]
  series            PackSeries[]
}

model Order {
  id             String      @id @default(cuid())
  reference      String      @unique
  visitorName    String
  visitorEmail   String
  visitorPhone   String
  visitorMessage String?
  userId         String?
  packId         String
  status         OrderStatus @default(PENDING)
  activatedAt    DateTime?
  expiresAt      DateTime?
  createdAt      DateTime    @default(now())
  user           User?       @relation(fields: [userId], references: [id])
  pack           Pack        @relation(fields: [packId], references: [id])
}

model Module {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  description String
  duration    Int
  nbQuestions Int
  series      Series[]
}

model Series {
  id         String       @id @default(cuid())
  title      String
  moduleId   String
  difficulty String
  isFree     Boolean      @default(false)
  createdAt  DateTime     @default(now())
  module     Module       @relation(fields: [moduleId], references: [id])
  questions  Question[]
  packs      PackSeries[]
  attempts   Attempt[]
}

model PackSeries {
  packId   String
  seriesId String
  pack     Pack   @relation(fields: [packId], references: [id])
  series   Series @relation(fields: [seriesId], references: [id])

  @@id([packId, seriesId])
}

model Question {
  id            String  @id @default(cuid())
  moduleId      String
  seriesId      String
  questionOrder Int
  category      String?
  longText      String?
  imageUrl      String?
  audioUrl      String?
  question      String
  optionA       String
  optionB       String
  optionC       String
  optionD       String
  correctAnswer String
  explanation   String?
  series        Series  @relation(fields: [seriesId], references: [id])
}

model Attempt {
  id           String   @id @default(cuid())
  userId       String
  seriesId     String
  moduleCode   String
  answers      Json
  writtenTask1 String?
  writtenTask2 String?
  audioTask1   String?
  audioTask2   String?
  score        Int?
  aiScore      Float?
  cecrlLevel   String?
  timeTaken    Int?
  completedAt  DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id])
  series       Series   @relation(fields: [seriesId], references: [id])
}

model Result {
  id         String   @id @default(cuid())
  userId     String
  moduleCode String
  avgScore   Float
  cecrlLevel String
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 3: Write `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create 4 modules
  const modules = [
    { name: 'Compréhension Écrite', code: 'CE', description: 'Comprenez des documents écrits variés', duration: 60, nbQuestions: 40 },
    { name: 'Compréhension Orale', code: 'CO', description: 'Comprenez des documents audio variés', duration: 40, nbQuestions: 40 },
    { name: 'Expression Écrite', code: 'EE', description: 'Produisez des textes écrits structurés', duration: 60, nbQuestions: 2 },
    { name: 'Expression Orale', code: 'EO', description: 'Exprimez-vous à l\'oral avec aisance', duration: 15, nbQuestions: 2 },
  ]
  for (const mod of modules) {
    await prisma.module.upsert({ where: { code: mod.code }, update: mod, create: mod })
  }

  // Create admin account
  const hashedPassword = await bcrypt.hash('admin@tef-lab', 12)
  await prisma.user.upsert({
    where: { email: 'tifuzzied@gmail.com' },
    update: {},
    create: {
      name: 'Administrateur',
      email: 'tifuzzied@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  })

  console.log('Seed completed successfully')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Add seed script to `package.json`**

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Also install ts-node:
```bash
npm install --save-dev ts-node
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema with all models and seed script"
```

---

### Task 3: NextAuth + Middleware + Lib Files

**Files:**
- Create: `lib/prisma.ts`
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Create `lib/auth.ts`**

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        if (user.accountStatus === 'SUSPENDED') return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.mustChangePassword = (user as any).mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).mustChangePassword = token.mustChangePassword
      }
      return session
    },
  },
  pages: {
    signIn: '/connexion',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
```

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 4: Create `middleware.ts`**

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/connexion', req.url))
      }
    }

    // Dashboard routes
    if (path.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/connexion', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
```

- [ ] **Step 5: Create `lib/email.ts`**

```typescript
import nodemailer from 'nodemailer'
import { config } from './config'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
})

export async function sendNewOrderEmail(order: {
  reference: string; packName: string; price: number;
  visitorName: string; visitorEmail: string; visitorPhone: string; visitorMessage?: string | null;
  createdAt: Date;
}) {
  const whatsappLink = `https://wa.me/${order.visitorPhone.replace('+', '')}?text=${encodeURIComponent(
    `Bonjour ${order.visitorName.split(' ')[0]}, nous avons bien reçu votre commande pour le pack ${order.packName} sur Tef-Lab. Veuillez nous envoyer la preuve de paiement de ${order.price} FCFA. Merci !`
  )}`

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `🆕 Nouvelle commande Tef-Lab — ${order.packName} — ${order.visitorName}`,
    html: `
      <h2>Nouvelle commande Tef-Lab</h2>
      <h3>📋 DÉTAILS DE LA COMMANDE</h3>
      <p><strong>Référence :</strong> ${order.reference}</p>
      <p><strong>Pack :</strong> ${order.packName}</p>
      <p><strong>Prix :</strong> ${order.price} FCFA</p>
      <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleString('fr-FR')}</p>
      <h3>👤 INFORMATIONS CLIENT</h3>
      <p><strong>Nom :</strong> ${order.visitorName}</p>
      <p><strong>Email :</strong> ${order.visitorEmail}</p>
      <p><strong>WhatsApp :</strong> ${order.visitorPhone}</p>
      ${order.visitorMessage ? `<p><strong>Message :</strong> ${order.visitorMessage}</p>` : ''}
      <h3>📲 PROCHAINES ÉTAPES</h3>
      <ol>
        <li>Contactez le client sur WhatsApp pour recevoir la preuve de paiement</li>
        <li>Une fois le paiement confirmé, validez la commande dans le <a href="${config.siteUrl}/admin/commandes">dashboard admin</a></li>
      </ol>
      <p><a href="${whatsappLink}" style="background:#25D366;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">💬 Contacter le client sur WhatsApp</a></p>
    `,
  })
}

export async function sendAccountActivatedEmail(data: {
  visitorName: string; visitorEmail: string; packName: string;
  tempPassword: string; activatedAt: Date; expiresAt: Date; modules: string[];
}) {
  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: '🎉 Votre compte Tef-Lab est activé !',
    html: `
      <h2>Bonjour ${data.visitorName.split(' ')[0]},</h2>
      <p>Votre paiement a été confirmé et votre compte Tef-Lab est maintenant actif !</p>
      <h3>🔑 VOS IDENTIFIANTS DE CONNEXION</h3>
      <p><strong>Email :</strong> ${data.visitorEmail}</p>
      <p><strong>Mot de passe :</strong> ${data.tempPassword}</p>
      <p><a href="${config.siteUrl}/connexion" style="background:#003087;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">🔗 Se connecter</a></p>
      <h3>📦 VOTRE PACK</h3>
      <p><strong>Pack :</strong> ${data.packName}</p>
      <p><strong>Validité :</strong> ${new Date(data.activatedAt).toLocaleDateString('fr-FR')} → ${new Date(data.expiresAt).toLocaleDateString('fr-FR')}</p>
      <p><strong>Modules :</strong> ${data.modules.join(', ')}</p>
      <p><em>⚠️ Pour votre sécurité, pensez à changer votre mot de passe après connexion.</em></p>
      <p>Bonne préparation ! 💪<br>L'équipe Tef-Lab</p>
    `,
  })
}

export async function sendOrderRejectedEmail(data: {
  visitorName: string; visitorEmail: string; packName: string; reference: string;
}) {
  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: 'Votre commande Tef-Lab n\'a pas pu être confirmée',
    html: `
      <h2>Bonjour ${data.visitorName.split(' ')[0]},</h2>
      <p>Nous sommes désolés, votre commande <strong>${data.reference}</strong> pour le pack <strong>${data.packName}</strong> n'a pas pu être confirmée.</p>
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter :</p>
      <ul>
        <li>WhatsApp : <a href="https://wa.me/237683008287">+237 683 008 287</a></li>
        <li>Email : tifuzzied@gmail.com</li>
      </ul>
      <p>L'équipe Tef-Lab</p>
    `,
  })
}
```

- [ ] **Step 6: Create `lib/whatsapp.ts`**

```typescript
export function generateVisitorToAdminLink(data: {
  packName: string; visitorName: string; visitorEmail: string; reference: string; price: number;
}): string {
  const message = `Bonjour, je souhaite commander le pack ${data.packName} sur Tef-Lab. Mon nom est ${data.visitorName}, mon email est ${data.visitorEmail}. Référence commande : ${data.reference}. Montant : ${data.price} FCFA.`
  return `https://wa.me/237683008287?text=${encodeURIComponent(message)}`
}

export function generateAdminToClientLink(data: {
  clientPhone: string; clientFirstName: string; packName: string; price: number;
}): string {
  const phone = data.clientPhone.replace('+', '').replace(/\s/g, '')
  const message = `Bonjour ${data.clientFirstName}, nous avons bien reçu votre commande pour le pack ${data.packName} sur Tef-Lab. Veuillez nous envoyer la preuve de paiement de ${data.price} FCFA. Merci !`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
```

- [ ] **Step 7: Create `lib/scoring.ts`**

```typescript
export function calculateCecrlLevel(score: number, total: number = 40): string {
  const correct = score
  if (correct <= 6) return 'A1'
  if (correct <= 15) return 'A2'
  if (correct <= 21) return 'B1'
  if (correct <= 28) return 'B2'
  if (correct <= 34) return 'C1'
  return 'C2'
}

export const EE_SCORING_PROMPT = `Tu es un correcteur certifié du TEF Canada (Test d'Évaluation de Français), expert en didactique des langues. Tu évalues les productions écrites selon la grille officielle du CECRL.

Évalue les deux textes soumis selon ces critères :

TÂCHE 1 (suite d'article, minimum 80 mots) :
- Respect de la consigne (suite cohérente de l'amorce)
- Organisation et paragraphes
- Clarté et cohérence du récit
- Richesse lexicale
- Maîtrise syntaxique
- Orthographe

TÂCHE 2 (lettre au journal, minimum 200 mots) :
- Respect de la consigne (format lettre, point de vue exprimé)
- 3 arguments minimum développés
- Organisation et structure
- Clarté de l'argumentation
- Richesse lexicale
- Maîtrise syntaxique
- Orthographe

Retourne UNIQUEMENT un JSON valide avec ce format :
{
  "task1": {
    "wordCount": 0,
    "score": 0,
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "feedback": "commentaire détaillé en français",
    "strengths": ["point fort 1"],
    "improvements": ["axe d'amélioration 1"]
  },
  "task2": {
    "wordCount": 0,
    "score": 0,
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "feedback": "commentaire détaillé en français",
    "strengths": ["point fort 1"],
    "improvements": ["axe d'amélioration 1"]
  },
  "globalCecrlLevel": "A1|A2|B1|B2|C1|C2",
  "globalScore": 0
}`

export const EO_SCORING_PROMPT = `Tu es un correcteur certifié du TEF Canada, spécialisé en expression orale. Évalue la transcription selon la grille officielle CECRL.

Retourne UNIQUEMENT ce JSON :
{
  "sectionA": {
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "score": 0,
    "feedback": "commentaire en français",
    "nbQuestionsDetectees": 0,
    "registreAdapte": true,
    "strengths": [],
    "improvements": []
  },
  "sectionB": {
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "score": 0,
    "feedback": "commentaire en français",
    "argumentsDetectes": 0,
    "registreAdapte": true,
    "strengths": [],
    "improvements": []
  },
  "globalCecrlLevel": "A1|A2|B1|B2|C1|C2",
  "globalScore": 0,
  "pronunciation": "commentaire sur la prononciation",
  "lexique": "commentaire sur le vocabulaire utilisé"
}`
```

- [ ] **Step 8: Commit foundation**

```bash
git add -A
git commit -m "feat: add NextAuth, middleware, lib services (email, whatsapp, scoring)"
```

---

## Chunk 2: API Routes

### Task 4: Orders API (Core Business Logic)

**Files:**
- Create: `app/api/orders/route.ts`
- Create: `app/api/orders/[id]/validate/route.ts`
- Create: `app/api/orders/[id]/reject/route.ts`

- [ ] **Step 1: Create `app/api/orders/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendNewOrderEmail } from '@/lib/email'
import { generateVisitorToAdminLink } from '@/lib/whatsapp'

const createOrderSchema = z.object({
  packId: z.string().min(1),
  visitorName: z.string().min(2),
  visitorEmail: z.string().email(),
  visitorPhone: z.string().regex(/^\+237[0-9]{9}$/, 'Format: +237XXXXXXXXX'),
  visitorMessage: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createOrderSchema.parse(body)

    const pack = await prisma.pack.findUnique({ where: { id: data.packId } })
    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 })
    }

    const reference = `TEFLAB-${Date.now()}`
    const order = await prisma.order.create({
      data: {
        reference,
        packId: data.packId,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone,
        visitorMessage: data.visitorMessage,
        status: 'PENDING',
      },
    })

    // Send email to admin (non-blocking)
    sendNewOrderEmail({
      reference,
      packName: pack.name,
      price: pack.price,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      visitorPhone: data.visitorPhone,
      visitorMessage: data.visitorMessage,
      createdAt: order.createdAt,
    }).catch(console.error)

    const whatsappLink = generateVisitorToAdminLink({
      packName: pack.name,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      reference,
      price: pack.price,
    })

    return NextResponse.json({ reference, whatsappLink }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      include: { pack: true, user: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/orders/[id]/validate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendAccountActivatedEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { pack: true },
    })
    if (!order || order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Commande introuvable ou déjà traitée' }, { status: 404 })
    }

    const tempPassword = nanoid(8)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)
    const activatedAt = new Date()
    const expiresAt = new Date(activatedAt.getTime() + order.pack.durationDays * 24 * 60 * 60 * 1000)

    // Create or find user
    let user = await prisma.user.findUnique({ where: { email: order.visitorEmail } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: order.visitorName,
          email: order.visitorEmail,
          password: hashedPassword,
          role: 'SUBSCRIBER',
          mustChangePassword: true,
        },
      })
    }

    // Update order
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'VALIDATED',
        userId: user.id,
        activatedAt,
        expiresAt,
      },
    })

    // Send activation email
    sendAccountActivatedEmail({
      visitorName: order.visitorName,
      visitorEmail: order.visitorEmail,
      packName: order.pack.name,
      tempPassword,
      activatedAt,
      expiresAt,
      modules: ['CE', 'CO', 'EE', 'EO'].slice(0, order.pack.nbModules),
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create `app/api/orders/[id]/reject/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendOrderRejectedEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { pack: true },
    })
    if (!order || order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Commande introuvable ou déjà traitée' }, { status: 404 })
    }

    await prisma.order.update({ where: { id: params.id }, data: { status: 'REJECTED' } })

    sendOrderRejectedEmail({
      visitorName: order.visitorName,
      visitorEmail: order.visitorEmail,
      packName: order.pack.name,
      reference: order.reference,
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create remaining API routes (packs, series, questions, modules, users, attempts, scoring)**

These are standard CRUD routes following the same pattern. See Tasks 5-6 below.

- [ ] **Step 5: Commit orders API**

```bash
git add -A
git commit -m "feat: add orders API with validation, rejection, email and WhatsApp notifications"
```

---

### Task 5: CRUD API Routes

**Files:**
- Create: `app/api/packs/route.ts` + `app/api/packs/[id]/route.ts`
- Create: `app/api/series/route.ts` + `app/api/series/[id]/route.ts` + `app/api/series/[id]/questions/route.ts`
- Create: `app/api/questions/route.ts` + `app/api/questions/[id]/route.ts`
- Create: `app/api/modules/route.ts` + `app/api/modules/[code]/series/route.ts`
- Create: `app/api/users/route.ts` + `app/api/users/[id]/route.ts`
- Create: `app/api/attempts/route.ts`
- Create: `app/api/auth/change-password/route.ts`
- Create: `app/api/scoring/ee/route.ts` + `app/api/scoring/eo/route.ts`

All routes follow the admin guard pattern:
- Public GET for packs/modules/series (isFree)
- Admin-only POST/PATCH/DELETE
- User-authenticated POST for attempts and scoring

- [ ] **Step 1: Create `app/api/packs/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const packSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  description: z.string().min(1),
  nbModules: z.number().int().min(1).max(4),
  nbSeriesPerModule: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
  seriesIds: z.array(z.string()).optional(),
})

export async function GET() {
  const packs = await prisma.pack.findMany({
    where: { isActive: true },
    include: { series: { include: { series: { include: { module: true } } } } },
    orderBy: { price: 'asc' },
  })
  return NextResponse.json(packs)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const body = await req.json()
    const { seriesIds, ...data } = packSchema.parse(body)
    const pack = await prisma.pack.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        ...(seriesIds && {
          series: { create: seriesIds.map((sid) => ({ seriesId: sid })) },
        }),
      },
    })
    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/packs/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  description: z.string().min(1).optional(),
  nbModules: z.number().int().min(1).max(4).optional(),
  nbSeriesPerModule: z.number().int().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  seriesIds: z.array(z.string()).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const { seriesIds, ...data } = updateSchema.parse(await req.json())
    const pack = await prisma.pack.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(seriesIds !== undefined && {
          series: {
            deleteMany: {},
            create: seriesIds.map((sid) => ({ seriesId: sid })),
          },
        }),
      },
    })
    return NextResponse.json(pack)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    await prisma.pack.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create series, questions, modules, users, attempts, auth/change-password, scoring/ee and scoring/eo route files**
(Full code in execution — same pattern as above, guarded by session role check)

- [ ] **Step 4: Commit all API routes**

```bash
git add -A
git commit -m "feat: add all CRUD API routes (packs, series, questions, modules, users, attempts, scoring)"
```

---

## Chunk 3: UI Components + Layout

### Task 6: Base Layout + Reusable Components

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/WhatsAppButton.tsx`
- Create: `components/ui/Timer.tsx`
- Create: `components/ui/AudioPlayer.tsx`
- Create: `components/ui/WordCounter.tsx`
- Create: `components/ui/AudioRecorder.tsx`
- Create: `components/ui/OrderModal.tsx`
- Create: `components/admin/StatsCard.tsx`

- [ ] **Step 1: Set up `app/globals.css` with color variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --blue-primary: #003087;
  --blue-hover: #0055B3;
  --red-primary: #E30613;
  --white: #FFFFFF;
  --gray-bg: #F5F5F5;
}
```

- [ ] **Step 2: Update `tailwind.config.ts` with brand colors**

```typescript
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'tef-blue': '#003087',
        'tef-blue-hover': '#0055B3',
        'tef-red': '#E30613',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tef-Lab — Prépare ton TEF Canada',
  description: 'La première plateforme de préparation au TEF Canada dédiée aux Camerounais.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create `app/providers.tsx` (NextAuth SessionProvider)**

```tsx
'use client'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 5: Create `components/layout/Navbar.tsx`**

Full responsive navbar with:
- Logo: "TEF CAN" (blue) + "237" (red)
- Links: Accueil, Packs, Entraînement Gratuit, Contact
- Right: Connexion button (or user menu if logged in)
- Mobile hamburger menu

- [ ] **Step 6: Create `components/layout/Footer.tsx`**

Footer with links: Accueil · Packs · Contact · Mentions légales · © 2025 Tef-Lab

- [ ] **Step 7: Create `components/layout/WhatsAppButton.tsx`**

```tsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/237683008287"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors"
      aria-label="Contacter sur WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.527 5.859L.057 23.857c-.09.319.001.659.244.884.176.162.405.247.641.247.085 0 .17-.011.252-.033l6.24-1.607C8.869 24.435 10.404 25 12 25c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    </a>
  )
}
```

- [ ] **Step 8: Create `components/ui/Timer.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'

interface TimerProps {
  durationSeconds: number
  onTimeUp: () => void
}

export default function Timer({ durationSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return }
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { onTimeUp(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining, onTimeUp])

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const isUrgent = remaining < 300

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 text-center py-2 font-bold text-lg ${isUrgent ? 'bg-red-600 text-white' : 'bg-tef-blue text-white'}`}>
      ⏱️ {mins}:{secs}
    </div>
  )
}
```

- [ ] **Step 9: Create `components/ui/AudioPlayer.tsx`** (play-once for CO module)

- [ ] **Step 10: Create `components/ui/WordCounter.tsx`** (real-time word count for EE)

- [ ] **Step 11: Create `components/ui/AudioRecorder.tsx`** (MediaRecorder for EO)

- [ ] **Step 12: Create `components/ui/OrderModal.tsx`** (full order form modal)

- [ ] **Step 13: Create `components/admin/StatsCard.tsx`**

- [ ] **Step 14: Commit all components**

```bash
git add -A
git commit -m "feat: add layout and UI components (Navbar, Footer, WhatsApp, Timer, AudioPlayer, OrderModal)"
```

---

## Chunk 4: Public Pages

### Task 7: Home Page

**Files:**
- Create: `app/(public)/page.tsx`

- [ ] **Step 1: Build home page with all 6 sections**

Sections in order:
1. Hero: "Prépare ton TEF Canada et réussis ton immigration au Canada 🍁" + CTAs
2. TEF Canada presentation (recognition, 4 modules, 2 years validity, NCLC 7 requirement)
3. 4 module cards (CE, CO, EE, EO with icons, duration, nb questions)
4. Packs section (fetched from /api/packs, cards with "Commander" → OrderModal)
5. Free training section (3 free series per module)
6. Contact section (email, WhatsApp, contact form)

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add home page with all sections"
```

---

### Task 8: Other Public Pages

**Files:**
- Create: `app/(public)/packs/page.tsx`
- Create: `app/(public)/entrainement-gratuit/page.tsx`
- Create: `app/(public)/contact/page.tsx`
- Create: `app/(auth)/connexion/page.tsx`

- [ ] **Step 1: Build packs page** (full pack details with OrderModal)
- [ ] **Step 2: Build entrainement-gratuit page** (3 free series per module, accessible without login)
- [ ] **Step 3: Build contact page** (form + email + WhatsApp info)
- [ ] **Step 4: Build connexion page** (NextAuth signIn form)
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add public pages (packs, free training, contact, login)"
```

---

## Chunk 5: Admin Pages

### Task 9: Admin Dashboard + Orders Management

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/commandes/page.tsx`
- Create: `app/admin/changer-mot-de-passe/page.tsx`

- [ ] **Step 1: Build admin dashboard** (stats: users count, tests passed, avg scores, packs sold, pending orders count)
- [ ] **Step 2: Build commandes page** (table with PENDING/VALIDATED/REJECTED filter, Valider/Rejeter/WhatsApp actions, red badge on PENDING)
- [ ] **Step 3: Build changer-mot-de-passe page** (force password change for admin default password)
- [ ] **Step 4: Add red banner logic** in admin layout if mustChangePassword is true
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard and orders management page"
```

---

### Task 10: Admin CRUD Pages

**Files:**
- Create: `app/admin/utilisateurs/page.tsx`
- Create: `app/admin/packs/page.tsx`
- Create: `app/admin/series/page.tsx`
- Create: `app/admin/questions/page.tsx`

- [ ] **Step 1: Build utilisateurs page** (list with status toggle, password reset, view results)
- [ ] **Step 2: Build packs page** (full CRUD with series multi-select)
- [ ] **Step 3: Build series page** (CRUD + free series selector: max 3 per module with visual limiter)
- [ ] **Step 4: Build questions page** (CRUD with module-specific forms: CE image/text, CO audio, EE tasks, EO sections A+B with all fields)
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin CRUD pages (utilisateurs, packs, series, questions)"
```

---

## Chunk 6: Subscriber Pages

### Task 11: Dashboard + CE/CO Quiz

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/serie/[id]/page.tsx`

- [ ] **Step 1: Build subscriber dashboard** (available modules by pack, accessible series, remaining free attempts, results history table)
- [ ] **Step 2: Build CE/CO quiz page** with:
  - Non-bypassable timer (fixed top bar)
  - Question-by-question navigation
  - "Passer" button
  - Audio play-once for CO (grayed after play)
  - Auto-submit at 0:00
  - Results page: score, CECRL level, detailed correction
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add subscriber dashboard and CE/CO quiz with timer and scoring"
```

---

### Task 12: EE + EO Pages

**Files:**
- Create: `app/dashboard/serie/[id]/ee/page.tsx`
- Create: `app/dashboard/serie/[id]/eo/page.tsx`

- [ ] **Step 1: Build EE page** with:
  - Task 1 (25 min): amorce text + textarea + real-time word counter (min 80, red→green)
  - Task 2 (35 min): affirmation + textarea + counter (min 200)
  - Submit blocked if under minimum
  - AI correction results display (score, CECRL, feedback, strengths, improvements)

- [ ] **Step 2: Build EO page** with full flow:
  - Intro screen (2 sections overview)
  - Section A: annonce display + 30s prep countdown + 5min recording + audio waveform indicator + stop/verify
  - 10s pause between sections
  - Section B: new annonce + 60s prep + 10min recording + stop/verify
  - Results page: audio playback for A and B + auto-evaluation checklist + optional AI scoring

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add EE writing and EO oral expression pages with AI scoring"
```

---

## Chunk 7: Final Integration + Verification

### Task 13: Final Polish + Verification

- [ ] **Step 1: Verify `npm run dev` starts without errors**

```bash
npm run dev
```
Expected: Server running on http://localhost:3000 without TypeScript errors.

- [ ] **Step 2: Push schema to database and seed**

```bash
npx prisma db push
npx prisma db seed
```
Expected: 4 modules created + admin account created.

- [ ] **Step 3: Verify admin login flow**

Navigate to /connexion, login with tifuzzied@gmail.com / admin@tef-lab.
Expected: Redirect to /admin/changer-mot-de-passe with red warning banner.

- [ ] **Step 4: Verify order flow end-to-end**

- Navigate to home, click "Commander" on a pack
- Fill form, submit
- Check admin receives email notification
- In /admin/commandes, validate the order
- Check client receives activation email with temp password

- [ ] **Step 5: Verify middleware protection**

- Try accessing /admin without login → redirect to /connexion
- Try accessing /dashboard without login → redirect to /connexion

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Tef-Lab platform - all pages, API routes, and services"
```

---

## Key Notes for Implementation

1. **Admin password change** — `mustChangePassword: true` is set in seed. After login, middleware in admin layout checks this flag and redirects to `/admin/changer-mot-de-passe`. Red banner: "⚠️ Vous utilisez le mot de passe par défaut. Veuillez le modifier immédiatement pour sécuriser votre compte."

2. **CO audio play-once** — Store played state in `useRef` (not state to avoid re-renders). After play, disable the audio element and show "Audio déjà écouté" message.

3. **EO recording** — Use `MediaRecorder` API with `audio/webm` MIME type. Convert to blob and upload to Supabase Storage via fetch with authorization header.

4. **Session type extension** — Create `types/next-auth.d.ts` to extend Session with `id`, `role`, and `mustChangePassword` fields.

5. **Mobile-first** — All pages designed with `sm:`, `md:`, `lg:` breakpoints. Primary target is mobile users in Cameroon.

6. **nanoid import** — Use `import { nanoid } from 'nanoid'` (ESM). For CommonJS environments in API routes, use dynamic import or configure properly.
