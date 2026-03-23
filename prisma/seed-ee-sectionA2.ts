/**
 * seed-ee-sectionA2.ts
 *
 * Ajoute les Section A aux séries EE 58–60 (existantes, Section B déjà en place)
 * et crée les séries EE 61–80 avec Section A uniquement.
 *
 * Note : le sujet « Un chômeur belge de 31 ans… » est un doublon de EE 15 → ignoré.
 *
 * Corrections appliquées :
 *   « avec un mot "bonne chance !" » → « avec un mot : « Bonne chance ! » »
 *   majuscule sur noms propres, ponctuation normalisée
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

const CONSIGNE_A =
  'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.'

// ─────────────────────────────────────────────────────────────────────────────
// Topic 1 ignoré (doublon avec EE 15).
// Topics 2–24 → EE 58, 59, 60 puis EE 61–80 (20 nouvelles séries).
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_A_DATA: { series: string; longText: string; createIfMissing: boolean }[] = [
  // ── EE 58-60 : existantes, Section B déjà présente ───────────────────────
  {
    series: 'EE 58',
    longText:
      'Une dispute éclate entre un client et un commerçant au sujet de saucissons prétendument capables de guérir la grippe et vendus 50 dollars. L\'affaire se termine mal pour le client.',
    createIfMissing: false,
  },
  {
    series: 'EE 59',
    longText:
      'Des clientes d\'une crêperie de Brest se plaignent d\'une addition de 50 euros pour une crêpe et un verre d\'eau. Scandalisées, elles appellent la police.',
    createIfMissing: false,
  },
  {
    series: 'EE 60',
    longText:
      'Un jeune homme de 26 ans, au plus bas de sa vie, devient millionnaire en gagnant 5 millions d\'euros à la loterie le 1er janvier 2019.',
    createIfMissing: false,
  },

  // ── EE 61–80 : nouvelles séries (Section A seulement) ────────────────────
  {
    series: 'EE 61',
    longText:
      'Une touriste américaine de 24 ans traverse le Canada de Montréal à Vancouver en trottinette électrique en 5 mois.',
    createIfMissing: true,
  },
  {
    series: 'EE 62',
    longText:
      'Deux pilotes s\'endorment en plein vol après avoir bu accidentellement un somnifère, retardant l\'atterrissage de 35 minutes.',
    createIfMissing: true,
  },
  {
    series: 'EE 63',
    longText:
      'Une ancienne conductrice de taxi australienne décide de faire le tour du monde à pied pour collecter des fonds au profit des orphelins.',
    createIfMissing: true,
  },
  {
    series: 'EE 64',
    longText:
      'Une coupure d\'électricité dans un supermarché parisien provoque la panique parmi les clients.',
    createIfMissing: true,
  },
  {
    series: 'EE 65',
    longText:
      'Un chirurgien découvre des centaines de parasites dans l\'estomac d\'un patient de retour d\'un voyage en Inde.',
    createIfMissing: true,
  },
  {
    series: 'EE 66',
    longText:
      'Une femme découvre un légume étrange et périmé dans un supermarché et exige une explication du responsable.',
    createIfMissing: true,
  },
  {
    series: 'EE 67',
    longText:
      'Un jeune Britannique endormi sur un banc est réveillé par un renard, déclenchant une série d\'événements qui se terminent dans un fleuve.',
    createIfMissing: true,
  },
  {
    series: 'EE 68',
    longText:
      'Un couple de retour de vacances réalise, à une station-service, qu\'il a oublié sa fille de 13 ans à Paris.',
    createIfMissing: true,
  },
  {
    series: 'EE 69',
    longText:
      'Un enfant prodige, né dans des circonstances extraordinaires, crée sa propre entreprise à 13 ans et fait la une des journaux.',
    createIfMissing: true,
  },
  {
    series: 'EE 70',
    longText:
      'Une fillette de 8 ans est retrouvée évanouie dans un parc de Montréal par un policier qui l\'aide à reprendre confiance en elle.',
    createIfMissing: true,
  },
  {
    series: 'EE 71',
    longText:
      'Un enfant se réveille au zoo pour découvrir que tous les animaux ont été libérés par un activiste ayant désactivé le système de sécurité.',
    createIfMissing: true,
  },
  {
    series: 'EE 72',
    longText:
      'Une femme rentrant d\'une promenade découvre qu\'un petit chien a remplacé son bébé dans la poussette.',
    createIfMissing: true,
  },
  {
    series: 'EE 73',
    longText:
      'Des automobilistes croisent une femme en robe de mariage qui fait de l\'autostop au bord de la route après une panne de voiture.',
    createIfMissing: true,
  },
  {
    series: 'EE 74',
    longText:
      'Une navigatrice de 23 ans en détresse en mer est escortée jusqu\'à la côte grecque par un groupe de dauphins.',
    createIfMissing: true,
  },
  {
    series: 'EE 75',
    longText:
      'Une infirmière retrouve un inconnu chez elle, confortablement installé devant la télévision. Il s\'avère être son oncle qu\'elle n\'avait jamais rencontré.',
    createIfMissing: true,
  },
  {
    series: 'EE 76',
    longText:
      'Des souris envahissent un opéra et provoquent la panique dans la salle, dissimulant en réalité la présence d\'un vrai danger.',
    createIfMissing: true,
  },
  {
    series: 'EE 77',
    longText:
      'Une dame de 80 ans surprend deux jeunes en train de voler sa voiture et les fait fuir en menaçant d\'appeler leurs mères.',
    createIfMissing: true,
  },
  {
    series: 'EE 78',
    longText:
      'M. Briand se rend chez un concessionnaire pour acheter une voiture à sa femme et apprend que son véhicule actuel présente un défaut de fabrication.',
    createIfMissing: true,
  },
  {
    series: 'EE 79',
    longText:
      'Le fils disparu depuis dix ans de la famille Laurent revient à l\'improviste lors de l\'anniversaire de sa grand-mère, accompagné de sa fiancée.',
    createIfMissing: true,
  },
  {
    series: 'EE 80',
    longText:
      'Une touriste québécoise sauve une petite fille de la noyade dans la Seine en sautant dans l\'eau malgré le froid et le courant.',
    createIfMissing: true,
  },
]

async function main() {
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })
  console.log(`✅ Module EE : ${eeModule.id}`)
  console.log(`ℹ️  Sujet 1 (chômeur belge) ignoré — doublon avec EE 15\n`)

  let created = 0
  let added = 0
  let skipped = 0

  for (const entry of SECTION_A_DATA) {
    let series: SeriesWithQuestions | null = await prisma.series.findFirst({
      where: { moduleId: eeModule.id, title: entry.series },
      include: { questions: true },
    })

    if (!series) {
      if (!entry.createIfMissing) {
        console.warn(`⚠️  Série "${entry.series}" introuvable — ignorée`)
        skipped++
        continue
      }
      series = await prisma.series.create({
        data: { title: entry.series, moduleId: eeModule.id, isFree: false },
        include: { questions: true },
      })
      console.log(`📁 Série "${entry.series}" créée`)
      created++
    }

    const existingA = series.questions.find((q) => q.category === 'SECTION_A')

    if (existingA) {
      if (existingA.longText !== entry.longText || existingA.question !== CONSIGNE_A) {
        await prisma.question.update({
          where: { id: existingA.id },
          data: { longText: entry.longText, question: CONSIGNE_A },
        })
        console.log(`🔄 Section A mise à jour dans "${entry.series}"`)
        added++
      } else {
        console.log(`   ✓  "${entry.series}" Section A déjà correcte`)
        skipped++
      }
    } else {
      // If Section B exists at order 1, bump it to order 2
      const existingB = series.questions.find((q) => q.category === 'SECTION_B')
      if (existingB && existingB.questionOrder === 1) {
        await prisma.question.update({
          where: { id: existingB.id },
          data: { questionOrder: 2 },
        })
      }
      await prisma.question.create({
        data: {
          moduleId: eeModule.id,
          seriesId: series.id,
          questionOrder: 1,
          category: 'SECTION_A',
          longText: entry.longText,
          question: CONSIGNE_A,
        },
      })
      console.log(`✅ Section A ajoutée à "${entry.series}"`)
      added++
    }
  }

  console.log(`\n🎉 Terminé !`)
  console.log(`   📁 Séries créées             : ${created}`)
  console.log(`   ✅ Sections A ajoutées/màj   : ${added}`)
  console.log(`   ✓  Déjà à jour / ignorées    : ${skipped}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
