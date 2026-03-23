/**
 * seed-ee-sectionB2.ts
 *
 * Ajoute 18 sujets Section B (lettre au journal) aux séries EE 61–78.
 * EE 79–80 resteront sans Section B jusqu'à réception de nouveaux sujets.
 *
 * Note : les sujets fournis par l'utilisateur étaient étiquetés « section A »
 * mais leur format (« Vous avez lu l'affirmation… ») correspond à la Section B.
 * Ils sont donc correctement insérés en SECTION_B.
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

type SeriesWithQuestions = Prisma.SeriesGetPayload<{ include: { questions: true } }>

const rawUrl = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tef_lab_dev'
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify')
const pool = new Pool({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const CONSIGNE_B =
  'Écrivez une lettre au journal pour dire ce que vous pensez (200 mots environ). Développez au moins 3 arguments pour défendre votre point de vue.'

const SECTION_B_DATA: { series: string; longText: string }[] = [
  {
    series: 'EE 61',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il est inutile de réglementer l'accès des réseaux sociaux aux adolescents. »",
  },
  {
    series: 'EE 62',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il est nécessaire de consommer différemment pour l'avenir de notre planète. »",
  },
  {
    series: 'EE 63',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il est inutile d'être bilingue, c'est une perte de temps. »",
  },
  {
    series: 'EE 64',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Y a-t-il une différence entre les jeunes d'aujourd'hui et la génération précédente ? »",
  },
  {
    series: 'EE 65',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Avec l'ordinateur, on n'a plus besoin d'apprendre l'écriture manuscrite aux enfants. »",
  },
  {
    series: 'EE 66',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faudrait réintroduire les véhicules à traction animale (chevaux, bœufs…). »",
  },
  {
    series: 'EE 67',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le remplacement des humains par les machines représente un danger pour l'humanité. »",
  },
  {
    series: 'EE 68',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le gouvernement devrait imposer la gratuité des transports en commun. »",
  },
  {
    series: 'EE 69',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les voyages ne sont plus réservés uniquement aux personnes aisées. »",
  },
  {
    series: 'EE 70',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« C'est à vingt ans que l'on est le plus heureux. »",
  },
  {
    series: 'EE 71',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut arrêter l'exploitation des forêts africaines. »",
  },
  {
    series: 'EE 72',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Films et séries vont remplacer les livres. »",
  },
  {
    series: 'EE 73',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut arrêter d'imposer la lecture de romans aux enfants à l'école. »",
  },
  {
    series: 'EE 74',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les réseaux sociaux représentent un danger permanent pour les enfants. »",
  },
  {
    series: 'EE 75',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le diplôme ne garantit pas l'accès à l'emploi. »",
  },
  {
    series: 'EE 76',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Mettre des caméras partout ne permet pas de lutter efficacement contre la criminalité. »",
  },
  {
    series: 'EE 77',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les robots devraient remplacer les êtres humains au travail. »",
  },
  {
    series: 'EE 78',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le tourisme de masse est une menace pour les traditions locales. »",
  },
]

async function main() {
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })
  console.log(`✅ Module EE : ${eeModule.id}\n`)

  let added = 0
  let updated = 0
  let skipped = 0

  for (const entry of SECTION_B_DATA) {
    const series: SeriesWithQuestions | null = await prisma.series.findFirst({
      where: { moduleId: eeModule.id, title: entry.series },
      include: { questions: true },
    })

    if (!series) {
      console.warn(`⚠️  Série "${entry.series}" introuvable — ignorée`)
      skipped++
      continue
    }

    const existingB = series.questions.find((q) => q.category === 'SECTION_B')

    if (existingB) {
      if (existingB.longText !== entry.longText || existingB.question !== CONSIGNE_B) {
        await prisma.question.update({
          where: { id: existingB.id },
          data: { longText: entry.longText, question: CONSIGNE_B },
        })
        console.log(`🔄 Section B mise à jour dans "${entry.series}"`)
        updated++
      } else {
        console.log(`   ✓  "${entry.series}" Section B déjà correcte`)
        skipped++
      }
    } else {
      const nextOrder = series.questions.length + 1
      await prisma.question.create({
        data: {
          moduleId: eeModule.id,
          seriesId: series.id,
          questionOrder: nextOrder,
          category: 'SECTION_B',
          longText: entry.longText,
          question: CONSIGNE_B,
        },
      })
      console.log(`✅ Section B ajoutée à "${entry.series}"`)
      added++
    }
  }

  console.log(`\n🎉 Terminé !`)
  console.log(`   ✅ Sections B ajoutées   : ${added}`)
  console.log(`   🔄 Sections B mises à jour : ${updated}`)
  console.log(`   ✓  Déjà à jour / ignorées  : ${skipped}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
