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

const CONSIGNE = 'Écrivez une lettre au journal pour dire ce que vous pensez (200 mots environ). Développez au moins 3 arguments pour défendre votre point de vue.'

const SECTION_B_DATA: { series: string; longText: string }[] = [
  {
    series: 'EE 2',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Il faut apprendre le chinois aux enfants en bas âge ».',
  },
  {
    series: 'EE 3',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Il faut apprendre le chinois aux enfants en bas âge ».',
  },
  {
    series: 'EE 4',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Dans un monde de compétition, les gens sont devenus plutôt égoïstes et manifestent peu de solidarité ».',
  },
  {
    series: 'EE 5',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Les ONG sont les mieux placées pour combattre la pauvreté dans le monde ».',
  },
  {
    series: 'EE 6',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Les jeunes de 25-30 ans habitent chez leurs parents pour des raisons de facilité et de confort ».',
  },
  {
    series: 'EE 7',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« L\'histoire ne devrait pas être enseignée à l\'école ».',
  },
  {
    series: 'EE 8',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Les jeux d\'argent et de hasard devraient-ils être interdits ».',
  },
  {
    series: 'EE 9',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Les tâches ménagères concernent seulement les femmes ».',
  },
  {
    series: 'EE 10',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« La lecture des romans est une perte de temps, il vaut mieux lire les journaux ».',
  },
  {
    series: 'EE 11',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« 0 % déchets 0 % gaspillage : c\'est le moment d\'encadrer les consommateurs ».',
  },
  {
    series: 'EE 12',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« La recherche spatiale aboutira un jour à des découvertes importantes pour l\'humanité. Il faut continuer à investir dans ce domaine ! ».',
  },
  {
    series: 'EE 13',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« Il est mauvais pour les enfants de lire les bandes dessinées ».',
  },
  {
    series: 'EE 14',
    longText: 'Vous avez lu l\'affirmation suivante dans un article de journal :\n« À cause du tourisme, tous les pays se ressemblent ».',
  },
]

async function main() {
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })

  for (const entry of SECTION_B_DATA) {
    const series = await prisma.series.findFirst({
      where: { moduleId: eeModule.id, title: entry.series },
      include: { questions: true },
    })

    if (!series) {
      console.warn(`⚠️  Série "${entry.series}" introuvable — ignorée`)
      continue
    }

    const alreadyHasB = series.questions.some((q) => q.category === 'SECTION_B')
    if (alreadyHasB) {
      // Update existing Section B with correct content
      const existing = series.questions.find((q) => q.category === 'SECTION_B')!
      await prisma.question.update({
        where: { id: existing.id },
        data: { longText: entry.longText, question: CONSIGNE },
      })
      console.log(`🔄 Section B mise à jour dans "${entry.series}"`)
    } else {
      const nextOrder = series.questions.length + 1
      await prisma.question.create({
        data: {
          moduleId: eeModule.id,
          seriesId: series.id,
          questionOrder: nextOrder,
          category: 'SECTION_B',
          longText: entry.longText,
          question: CONSIGNE,
        },
      })
      console.log(`✅ Section B ajoutée à "${entry.series}"`)
    }
  }

  console.log('\n🎉 Terminé ! Section B configurée pour EE 2–14.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
