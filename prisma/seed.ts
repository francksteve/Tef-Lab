import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const rawUrl = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tef_lab_dev'
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify')
const pool = new Pool({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── 4 Modules ──────────────────────────────────────────────────────────────
  const modules = [
    { name: 'Compréhension Écrite', code: 'CE', description: 'Comprenez des documents écrits variés : articles de presse, documents administratifs, textes lacunaires.', duration: 60, nbQuestions: 40 },
    { name: 'Compréhension Orale',  code: 'CO', description: 'Comprenez des documents audio variés : annonces, interviews, chroniques radio.', duration: 40, nbQuestions: 40 },
    { name: 'Expression Écrite',    code: 'EE', description: 'Produisez des textes écrits structurés : suite d\'article et lettre au journal.', duration: 60, nbQuestions: 2 },
    { name: 'Expression Orale',     code: 'EO', description: 'Exprimez-vous à l\'oral : obtenez des informations et présentez/convainquez.', duration: 15, nbQuestions: 2 },
  ]
  for (const mod of modules) {
    await prisma.module.upsert({ where: { code: mod.code }, update: mod, create: mod })
  }
  console.log('✅ 4 modules créés')

  // ── Admin account ───────────────────────────────────────────────────────────
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
  console.log('✅ Compte admin créé : tifuzzied@gmail.com')

  // ── 8 Packs ─────────────────────────────────────────────────────────────────
  const packs = [
    {
      name: 'Special',
      price: 5000,
      description: 'Accès à tous les exercices d\'Expression Écrite et Expression Orale pour perfectionner vos compétences de production.',
      moduleAccess: 'EE_EO' as const,
      maxSessions: 1,
      aiUsagePerDay: 10,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Essai',
      price: 5000,
      description: 'Découvrez l\'intégralité de la plateforme avec accès à tous les modules. Idéal pour tester avant de s\'engager.',
      moduleAccess: 'ALL' as const,
      maxSessions: 1,
      aiUsagePerDay: 2,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Bronze',
      price: 10000,
      description: 'Accès complet à tous les modules avec plus de flexibilité. Parfait pour une préparation sérieuse.',
      moduleAccess: 'ALL' as const,
      maxSessions: 2,
      aiUsagePerDay: 3,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Silver',
      price: 25000,
      description: 'L\'offre idéale pour une préparation optimale au TEF Canada. Accès illimité et corrections IA quotidiennes.',
      moduleAccess: 'ALL' as const,
      maxSessions: 4,
      aiUsagePerDay: 10,
      durationDays: 30,
      isActive: true,
      isRecommended: true,
    },
    {
      name: 'Gold',
      price: 35000,
      description: 'Préparez-vous intensément avec un accès étendu et plus de corrections IA pour progresser rapidement.',
      moduleAccess: 'ALL' as const,
      maxSessions: 6,
      aiUsagePerDay: 15,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Gold Plus',
      price: 65000,
      description: 'La formule premium pour les candidats exigeants. Profitez d\'un maximum de sessions et de corrections IA.',
      moduleAccess: 'ALL' as const,
      maxSessions: 6,
      aiUsagePerDay: 25,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Partenaire',
      price: 100000,
      description: 'Conçu pour les groupes et formations. Jusqu\'à 10 sessions simultanées et 30 corrections IA par jour.',
      moduleAccess: 'ALL' as const,
      maxSessions: 10,
      aiUsagePerDay: 30,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
    {
      name: 'Entreprise',
      price: 250000,
      description: 'Solution sur mesure pour les entreprises et centres de formation. Capacité maximale avec support prioritaire.',
      moduleAccess: 'ALL' as const,
      maxSessions: 10,
      aiUsagePerDay: 25,
      durationDays: 30,
      isActive: true,
      isRecommended: false,
    },
  ]

  for (const pack of packs) {
    const existing = await prisma.pack.findFirst({ where: { name: pack.name } })
    if (!existing) {
      await prisma.pack.create({ data: pack })
      console.log(`  ✅ Pack créé : ${pack.name}`)
    } else {
      await prisma.pack.update({ where: { id: existing.id }, data: pack })
      console.log(`  🔄 Pack mis à jour : ${pack.name}`)
    }
  }
  console.log('✅ 8 packs configurés')

  // ── Default PlatformSettings ────────────────────────────────────────────────
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'TEF-LAB',
      adminEmail: 'tifuzzied@gmail.com',
      whatsappNumber: '237683008287',
      orangeMoneyNumber: '237683008287',
      mtnMomoNumber: '237683008287',
      usdExchangeRate: 0.00165,
      discountRate: 0,
    },
  })
  console.log('✅ Paramètres plateforme initialisés')
  console.log('\n🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
