/**
 * seed-ee-sectionA.ts
 *
 * Ajoute les Section A aux séries EE 16–57 (42 sujets fournis).
 * EE 1–15 ont déjà leur Section A.
 * EE 58–60 resteront sans Section A jusqu'à réception de nouveaux sujets.
 *
 * Corrections appliquées :
 *   « c'est endormi »     → « s'est endormi »
 *   « il décidé »         → « il a décidé »
 *   « l'atlantique »      → « l'Atlantique »
 *   « paye les dégâts.. » → « paye les dégâts. »
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

const CONSIGNE_A = 'Terminez cet article en ajoutant un texte de 80 mots minimum, en plusieurs paragraphes.'

// 42 sujets → EE 16 à EE 57
const SECTION_A_DATA: { series: string; longText: string }[] = [
  {
    series: 'EE 16',
    longText: 'Un jeune homme essayait une voiture de sport sur l\'autoroute. Surprise : l\'enveloppe qui contenait l\'argent pour acheter la voiture s\'est envolée par la fenêtre.',
  },
  {
    series: 'EE 17',
    longText: 'Un singe entre dans un supermarché. Très vite repéré.',
  },
  {
    series: 'EE 18',
    longText: 'Un jeune homme vole un téléphone portable dans un restaurant ; un moment après, ce téléphone sonne.',
  },
  {
    series: 'EE 19',
    longText: 'Un couple voulait célébrer leur mariage au marathon de Montréal, mais les organisateurs ne voulaient pas que les coureurs soutiennent le couple.',
  },
  {
    series: 'EE 20',
    longText: 'Un homme disparu lors d\'un match dans un stade de foot est réapparu après 11 ans.',
  },
  {
    series: 'EE 21',
    longText: 'Sophie attendait son amie pour prendre un thé. Elle a été surprise par des journalistes avec des caméras qui croyaient qu\'ils sonnaient à la porte d\'une nouvelle star de la télé.',
  },
  {
    // Correction : « c'est endormi » → « s'est endormi »
    series: 'EE 22',
    longText: 'Mauvaise blague : Tom, 25 ans, s\'est endormi sur son bureau. Ses collègues en ont profité pour s\'amuser et ont pris des photos avec lui qu\'ils ont mises sur Internet.',
  },
  {
    series: 'EE 23',
    longText: 'Une biche poursuivie par des chasseurs a trouvé refuge dans un centre commercial. Les clients ont décidé de la protéger.',
  },
  {
    series: 'EE 24',
    longText: 'Un groupe d\'alpinistes retrouve un sac contenant une demande en mariage qui date de 40 ans.',
  },
  {
    // Correction : « il décidé » → « il a décidé »
    series: 'EE 25',
    longText: 'Un homme suisse de 95 ans regarde son émission préférée à la télévision et il a décidé d\'appeler l\'animateur pour lui dire qu\'il vit tout seul. Très touché, l\'animateur décide de lui faire une surprise.',
  },
  {
    series: 'EE 26',
    longText: 'Une pièce d\'avion tombe et traverse le toit d\'une maison.',
  },
  {
    series: 'EE 27',
    longText: 'En voulant ouvrir sa portière de voiture, elle découvre une araignée géante nichée dans la poignée.',
  },
  {
    series: 'EE 28',
    longText: 'Un hôpital recrute un chien pour détendre et réconforter les soignants.',
  },
  {
    series: 'EE 29',
    longText: 'Un cerf se réfugie dans le jardin d\'une maison pour échapper à une montée des eaux.',
  },
  {
    series: 'EE 30',
    longText: 'Ils découvrent 66 bouteilles de whisky vieilles d\'un siècle dans les murs de leur nouvelle maison.',
  },
  {
    series: 'EE 31',
    longText: 'Quatre ans après l\'avoir volé à Rome, une touriste restitue un fragment de marbre ancien.',
  },
  {
    series: 'EE 32',
    longText: 'Un chasseur se fait voler son fusil par un cerf.',
  },
  {
    series: 'EE 33',
    longText: 'À 91 ans, il survit à un accident de parachutisme.',
  },
  {
    series: 'EE 34',
    longText: 'Perdu par un pigeon voyageur il y a 110 ans, un message militaire allemand refait surface.',
  },
  {
    series: 'EE 35',
    longText: 'Son perroquet crie son nom et le sauve de l\'incendie de sa maison.',
  },
  {
    series: 'EE 36',
    longText: 'Une bouteille à 1 690 € servie par erreur dans un restaurant.',
  },
  {
    series: 'EE 37',
    longText: 'Deux hommes retrouvés endormis dans la maison qu\'ils venaient de cambrioler.',
  },
  {
    series: 'EE 38',
    longText: 'Elle rembourse le gérant d\'un restaurant dix ans après avoir mangé sans payer.',
  },
  {
    series: 'EE 39',
    longText: 'Ils sauvent un homme suspendu au balcon du 8e étage.',
  },
  {
    series: 'EE 40',
    longText: 'Une femme reçoit une lettre de sa sœur… postée 54 ans plus tôt.',
  },
  {
    series: 'EE 41',
    longText: 'Un fruit à l\'odeur pestilentielle provoque l\'évacuation d\'une poste : six personnes hospitalisées.',
  },
  {
    series: 'EE 42',
    longText: 'À cause d\'un bug informatique, il achète 27 voitures au lieu d\'une seule.',
  },
  {
    series: 'EE 43',
    longText: 'Elle valide le mauvais ticket et doit payer 519 € pour sortir du parking.',
  },
  {
    // Correction : double point ".." → "."
    series: 'EE 44',
    longText: 'Il vole la caisse d\'un bar puis, pris de remords, il ramène son butin et paye les dégâts.',
  },
  {
    series: 'EE 45',
    longText: 'Depuis 9 ans, il reçoit des pizzas sans les avoir commandées.',
  },
  {
    series: 'EE 46',
    longText: 'Il tente de voler le banc de leur premier baiser pour l\'offrir à son amoureuse.',
  },
  {
    series: 'EE 47',
    longText: 'Un livreur découvre deux tortues vivantes dans un colis censé contenir des parfums.',
  },
  {
    series: 'EE 48',
    longText: 'Incroyable mais vrai : leur train en panne, ils finissent leur voyage en tracteur.',
  },
  {
    series: 'EE 49',
    longText: 'Une pluie de billets de banque sur l\'autoroute provoque de nombreux carambolages.',
  },
  {
    series: 'EE 50',
    longText: 'Un avion forcé à atterrir à cause d\'un oiseau !',
  },
  {
    series: 'EE 51',
    longText: 'Australie : une jurée virée du procès pour s\'être endormie.',
  },
  {
    series: 'EE 52',
    longText: 'Une mère et ses 3 enfants ont survécu 34 jours dans la jungle.',
  },
  {
    series: 'EE 53',
    longText: 'Quand une alarme à incendie interrompt le match Paris-Marseille.',
  },
  {
    // Correction : « l'atlantique » → « l'Atlantique »
    series: 'EE 54',
    longText: 'Il retrouve une lettre dans une bouteille qui a traversé l\'Atlantique.',
  },
  {
    series: 'EE 55',
    longText: 'La mère supérieure tombe amoureuse, le couvent doit fermer.',
  },
  {
    series: 'EE 56',
    longText: 'Dans cet hôtel japonais, la nuit est à moins d\'un euro… à une seule condition.',
  },
  {
    series: 'EE 57',
    longText: 'Un couple de retraités a été invité par le Premier ministre pour un dîner. À cette occasion, ils lui offrent un cadeau.',
  },
]

async function main() {
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })
  console.log(`✅ Module EE : ${eeModule.id}\n`)

  let added = 0
  let skipped = 0

  for (const entry of SECTION_A_DATA) {
    const series: SeriesWithQuestions | null = await prisma.series.findFirst({
      where: { moduleId: eeModule.id, title: entry.series },
      include: { questions: true },
    })

    if (!series) {
      console.warn(`⚠️  Série "${entry.series}" introuvable — ignorée`)
      skipped++
      continue
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
      // Section A gets questionOrder 1; bump existing questions up if needed
      // In practice EE 16-57 were created with Section B (order=1), so we insert A at order 1
      // and update B to order 2 to keep the right sequence
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
  console.log(`   ✅ Sections A ajoutées/mises à jour : ${added}`)
  console.log(`   ✓  Déjà à jour / ignorées         : ${skipped}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
