import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const rawUrl = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tef_lab_dev'
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify')
const pool = new Pool({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

// ── Section A énoncés for EE 2–15 ──────────────────────────────────────────
const EE_SERIES: { title: string; sectionA: string }[] = [
  {
    title: 'EE 2',
    sectionA: 'Un chauffeur conduisait sa moto avec une seule main a été arrêté par la police, vous devinez que ce qu\'il cachait dans l\'autre main ?',
  },
  {
    title: 'EE 3',
    sectionA: 'Une dame qui a trouvé un tableau dans une poubelle, elle s\'est rendu compte qu\'elle a gagné le gros lot.',
  },
  {
    title: 'EE 4',
    sectionA: 'David découvre un passager inattendu dans sa voiture en allant au boulot.',
  },
  {
    title: 'EE 5',
    sectionA: 'Un canadien a raté son train pour aller assister au mariage de son cousin, il a trouvé un moyen de transport original.',
  },
  {
    title: 'EE 6',
    sectionA: 'Un garçon de 2 ans s\'est échappé d\'un jardin d\'enfant.',
  },
  {
    title: 'EE 7',
    sectionA: '2 agents de la marine tentent de sauver une femme de la noyade, sa réaction les a surpris.',
  },
  {
    title: 'EE 8',
    sectionA: 'Ils ont décidé de passer une nuit de rêve dans un hôtel. Un couple de touristes japonais n\'a pas pu fermer les yeux à cause d\'une visite animalière.',
  },
  {
    title: 'EE 9',
    sectionA: 'Katawaga, Japon. Une enquête a été ouverte après avoir trouvé 2400 lettres au domicile d\'un agent de la poste.',
  },
  {
    title: 'EE 10',
    sectionA: 'Un enfant déçu par le cadeau de la fête de Noël appelle les policiers.',
  },
  {
    title: 'EE 11',
    sectionA: 'Tokyo- Japon : un agent de sécurité a vu sur la caméra de surveillance, un dinosaure à taille humaine tirer sa valise et déterminé à embarquer.',
  },
  {
    title: 'EE 12',
    sectionA: 'Un chef d\'entreprise agacé par ces employés qui passent leur temps sur les réseaux sociaux, il a imaginé une solution efficace.',
  },
  {
    title: 'EE 13',
    sectionA: 'Un couple est allé dîner en bordure de mer et les conditions climatiques ont fait défaut.',
  },
  {
    title: 'EE 14',
    sectionA: 'Une femme parisienne se trouve au Québec au lieu de Paris après son vol.',
  },
  {
    title: 'EE 15',
    sectionA: 'En Belgique, un chômeur de 31 ans a découvert dans sa boîte aux lettres une enveloppe avec plus de 6000 euros et un mot indiquant : « Bonne chance ! ».',
  },
]

const SECTION_A_CONSIGNE = 'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.'

// ── Section B for EE 1 ─────────────────────────────────────────────────────
const EE1_SECTION_B_LONGTEXT =
  'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Donner des cours d\'informatique aux personnes âgées n\'est pas utile ».'
const EE1_SECTION_B_CONSIGNE =
  'Écrivez une lettre au journal pour dire ce que vous pensez (200 mots environ). Développez au moins 3 arguments pour défendre votre point de vue.'

async function main() {
  // ── 1. Get EE module ──────────────────────────────────────────────────────
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })
  console.log(`✅ Module EE trouvé : ${eeModule.id}`)

  // ── 2. Add Section B to EE 1 ──────────────────────────────────────────────
  const ee1 = await prisma.series.findFirst({
    where: { moduleId: eeModule.id, title: 'EE 1' },
    include: { questions: true },
  })
  if (!ee1) {
    console.warn('⚠️  Série EE 1 introuvable — Section B ignorée')
  } else {
    const alreadyHasB = ee1.questions.some((q) => q.category === 'SECTION_B')
    if (alreadyHasB) {
      console.log('ℹ️  EE 1 a déjà une Section B — ignorée')
    } else {
      await prisma.question.create({
        data: {
          moduleId: eeModule.id,
          seriesId: ee1.id,
          questionOrder: 2,
          category: 'SECTION_B',
          longText: EE1_SECTION_B_LONGTEXT,
          question: EE1_SECTION_B_CONSIGNE,
        },
      })
      console.log('✅ Section B ajoutée à EE 1')
    }
  }

  // ── 3. Create EE 2–15 series + Section A ──────────────────────────────────
  for (const entry of EE_SERIES) {
    // Check if series already exists
    const existing = await prisma.series.findFirst({
      where: { moduleId: eeModule.id, title: entry.title },
    })

    let seriesId: string

    if (existing) {
      seriesId = existing.id
      console.log(`ℹ️  Série "${entry.title}" existe déjà (id=${seriesId})`)
    } else {
      const created = await prisma.series.create({
        data: {
          title: entry.title,
          moduleId: eeModule.id,
          isFree: false,
        },
      })
      seriesId = created.id
      console.log(`✅ Série "${entry.title}" créée (id=${seriesId})`)
    }

    // Add Section A if not already present
    const existingA = await prisma.question.findFirst({
      where: { seriesId, category: 'SECTION_A' },
    })

    if (existingA) {
      console.log(`   ℹ️  Section A déjà présente dans "${entry.title}" — ignorée`)
    } else {
      await prisma.question.create({
        data: {
          moduleId: eeModule.id,
          seriesId,
          questionOrder: 1,
          category: 'SECTION_A',
          longText: entry.sectionA,
          question: SECTION_A_CONSIGNE,
        },
      })
      console.log(`   ✅ Section A ajoutée à "${entry.title}"`)
    }
  }

  console.log('\n🎉 Terminé ! 14 séries EE créées avec Section A.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
