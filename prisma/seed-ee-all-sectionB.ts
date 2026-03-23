/**
 * seed-ee-all-sectionB.ts
 *
 * Logique :
 *  - 60 sujets Section B uniques
 *  - 13 déjà en place dans EE 1-14 (préservés)
 *  - EE 3 avait le même sujet que EE 2 → remplacé par sujet #5
 *  - EE 15 existante (Section A déjà là, pas de Section B) → sujet #8
 *  - EE 16-60 créées (Section B seulement — Section A à ajouter via admin)
 *  Corrections orthographiques appliquées :
 *    « Il audrait interdire… » → « Il faudrait interdire… »
 *    « être la mode »         → « être à la mode »
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

const CONSIGNE =
  'Écrivez une lettre au journal pour dire ce que vous pensez (200 mots environ). Développez au moins 3 arguments pour défendre votre point de vue.'

// ─────────────────────────────────────────────────────────────────────────────
// 60 sujets uniques, chacun affecté à une série précise
// ─────────────────────────────────────────────────────────────────────────────
const ASSIGNMENTS: { series: string; longText: string; createIfMissing: boolean }[] = [
  // ── EE 1-14 : sujets déjà en place (vérification + mise à jour si besoin) ──
  {
    series: 'EE 1',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Donner des cours d'informatique aux personnes âgées n'est pas utile ».",
    createIfMissing: false,
  },
  {
    series: 'EE 2',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut apprendre le chinois aux enfants en bas âge ».",
    createIfMissing: false,
  },
  // EE 3 : doublon corrigé → sujet #5
  {
    series: 'EE 3',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les voyages organisés sont incompatibles avec la découverte réelle du pays ».",
    createIfMissing: false,
  },
  {
    series: 'EE 4',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Dans un monde de compétition, les gens sont devenus plutôt égoïstes et manifestent peu de solidarité ».",
    createIfMissing: false,
  },
  {
    series: 'EE 5',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les ONG sont les mieux placées pour combattre la pauvreté dans le monde ».",
    createIfMissing: false,
  },
  {
    series: 'EE 6',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les jeunes de 25-30 ans habitent chez leurs parents pour des raisons de facilité et de confort ».",
    createIfMissing: false,
  },
  {
    series: 'EE 7',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'histoire ne devrait pas être enseignée à l'école ».",
    createIfMissing: false,
  },
  {
    series: 'EE 8',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les jeux d'argent et de hasard devraient-ils être interdits ? ».",
    createIfMissing: false,
  },
  {
    series: 'EE 9',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les tâches ménagères concernent seulement les femmes ».",
    createIfMissing: false,
  },
  {
    series: 'EE 10',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« La lecture des romans est une perte de temps, il vaut mieux lire les journaux ».",
    createIfMissing: false,
  },
  {
    series: 'EE 11',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« 0 % déchets 0 % gaspillage : c'est le moment d'encadrer les consommateurs ».",
    createIfMissing: false,
  },
  {
    series: 'EE 12',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« La recherche spatiale aboutira un jour à des découvertes importantes pour l'humanité. Il faut continuer à investir dans ce domaine ! ».",
    createIfMissing: false,
  },
  {
    series: 'EE 13',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il est mauvais pour les enfants de lire les bandes dessinées ».",
    createIfMissing: false,
  },
  {
    series: 'EE 14',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« À cause du tourisme, tous les pays se ressemblent ».",
    createIfMissing: false,
  },

  // ── EE 15 : existante, Section B manquante → sujet #8 ───────────────────
  {
    series: 'EE 15',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les courses ne se font que via les grandes marques ».",
    createIfMissing: false,
  },

  // ── EE 16-60 : nouvelles séries (Section B seulement) ───────────────────
  {
    series: 'EE 16',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les voyages organisés ne contribuent pas à la découverte culturelle des pays ».",
    createIfMissing: true,
  },
  {
    series: 'EE 17',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut interdire aux enfants de moins de 10 ans de regarder la télé ».",
    createIfMissing: true,
  },
  {
    series: 'EE 18',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il est temps que les parents arrêtent de décider à la place de leurs jeunes enfants ».",
    createIfMissing: true,
  },
  {
    series: 'EE 19',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les nouvelles technologies présentent d'énormes avantages pour tout le monde ».",
    createIfMissing: true,
  },
  {
    series: 'EE 20',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le travail est essentiel pour vivre heureux ».",
    createIfMissing: true,
  },
  {
    series: 'EE 21',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« La vie rurale est meilleure que la vie urbaine ».",
    createIfMissing: true,
  },
  {
    series: 'EE 22',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le travail est aussi important que la famille ».",
    createIfMissing: true,
  },
  {
    series: 'EE 23',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut apprendre les langues étrangères le plus tôt possible ».",
    createIfMissing: true,
  },
  {
    series: 'EE 24',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les milliers d'applications pour smartphones nous rendent complètement assistés et en perte d'autonomie ».",
    createIfMissing: true,
  },
  {
    series: 'EE 25',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le smartphone est un mouchard qui servira bientôt à la répression ».",
    createIfMissing: true,
  },
  {
    series: 'EE 26',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faudrait interdire toutes sortes de loteries ».",
    createIfMissing: true,
  },
  // Correction : « Il audrait » → « Il faudrait »
  {
    series: 'EE 27',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faudrait interdire toutes sortes de censure ».",
    createIfMissing: true,
  },
  {
    series: 'EE 28',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faudrait interdire de fumer partout sauf à la maison ».",
    createIfMissing: true,
  },
  {
    series: 'EE 29',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut laisser de la liberté aux adolescents ».",
    createIfMissing: true,
  },
  {
    series: 'EE 30',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'éducation des enfants doit être stricte ».",
    createIfMissing: true,
  },
  {
    series: 'EE 31',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'ordinateur vous isole du monde ».",
    createIfMissing: true,
  },
  {
    series: 'EE 32',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les œuvres d'art et les trésors architecturaux devraient retourner dans leur pays d'origine respectif ».",
    createIfMissing: true,
  },
  {
    series: 'EE 33',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les jeunes ne pensent qu'à l'argent ».",
    createIfMissing: true,
  },
  {
    series: 'EE 34',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les vraies vacances sont des vacances où on ne fait rien ».",
    createIfMissing: true,
  },
  {
    series: 'EE 35',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les amis comptent autant que la famille ».",
    createIfMissing: true,
  },
  // Correction : « être la mode » → « être à la mode »
  {
    series: 'EE 36',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« C'est important d'être à la mode ».",
    createIfMissing: true,
  },
  {
    series: 'EE 37',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« On apprend plus de choses sur Internet que dans les livres ».",
    createIfMissing: true,
  },
  {
    series: 'EE 38',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Un adolescent doit avoir de l'argent de poche et pouvoir l'utiliser comme il veut ».",
    createIfMissing: true,
  },
  {
    series: 'EE 39',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les jeunes de 18 ans sont libres de prendre leurs propres décisions ».",
    createIfMissing: true,
  },
  {
    series: 'EE 40',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Certains disent que l'informatique et les nouvelles technologies vont tuer le livre ».",
    createIfMissing: true,
  },
  {
    series: 'EE 41',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le mensonge est parfois nécessaire ».",
    createIfMissing: true,
  },
  {
    series: 'EE 42',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'écologie, c'est un problème individuel plus que collectif ».",
    createIfMissing: true,
  },
  {
    series: 'EE 43',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le thème de l'argent est de plus en plus présent dans nos conversations ».",
    createIfMissing: true,
  },
  {
    series: 'EE 44',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le plus important dans la vie, c'est de réussir sa vie professionnelle ».",
    createIfMissing: true,
  },
  {
    series: 'EE 45',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« De nos jours, les gens travaillent plus qu'autrefois ».",
    createIfMissing: true,
  },
  {
    series: 'EE 46',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« On aura bientôt la possibilité de faire des clones humains ».",
    createIfMissing: true,
  },
  {
    series: 'EE 47',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il vaut mieux être célibataire que marié ».",
    createIfMissing: true,
  },
  {
    series: 'EE 48',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Émigrer est une bonne idée pour améliorer sa condition de vie ».",
    createIfMissing: true,
  },
  {
    series: 'EE 49',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Aujourd'hui, les gens cherchent la perfection physique et la chirurgie esthétique est une solution ».",
    createIfMissing: true,
  },
  {
    series: 'EE 50',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'argent ne fait pas le bonheur ».",
    createIfMissing: true,
  },
  {
    series: 'EE 51',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les sportifs professionnels gagnent énormément d'argent et ce n'est pas justifié ».",
    createIfMissing: true,
  },
  {
    series: 'EE 52',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Nous prenons presque tous des médicaments sans demander l'avis du médecin et ce n'est pas un problème ».",
    createIfMissing: true,
  },
  {
    series: 'EE 53',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Avoir un enfant à plus de 40 ans, ça n'a rien d'anormal ».",
    createIfMissing: true,
  },
  {
    series: 'EE 54',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Aujourd'hui, on ne peut plus se passer des réseaux sociaux ».",
    createIfMissing: true,
  },
  {
    series: 'EE 55',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le régime alimentaire végan est dangereux pour la santé ».",
    createIfMissing: true,
  },
  {
    series: 'EE 56',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« L'intolérance au gluten n'est pas une vraie maladie ».",
    createIfMissing: true,
  },
  {
    series: 'EE 57',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faut censurer certaines œuvres d'art, par exemple les représentations de corps nus ».",
    createIfMissing: true,
  },
  {
    series: 'EE 58',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Le télétravail, c'est la fin de la productivité ».",
    createIfMissing: true,
  },
  {
    series: 'EE 59',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Les élections présidentielles sont inutiles et ne changent rien à la vie des citoyens ».",
    createIfMissing: true,
  },
  {
    series: 'EE 60',
    longText:
      "Vous avez lu l'affirmation suivante dans un article de journal :\n« Il faudrait obliger les personnes âgées à repasser leur permis de conduire ».",
    createIfMissing: true,
  },
]

async function main() {
  const eeModule = await prisma.module.findUniqueOrThrow({ where: { code: 'EE' } })
  console.log(`✅ Module EE : ${eeModule.id}\n`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const entry of ASSIGNMENTS) {
    // ── Ensure series exists ─────────────────────────────────────────────
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

    // ── Upsert Section B ─────────────────────────────────────────────────
    const existingB = series.questions.find((q) => q.category === 'SECTION_B')

    if (existingB) {
      // Update only if content differs
      if (existingB.longText !== entry.longText || existingB.question !== CONSIGNE) {
        await prisma.question.update({
          where: { id: existingB.id },
          data: { longText: entry.longText, question: CONSIGNE },
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
          question: CONSIGNE,
        },
      })
      console.log(`✅ Section B ajoutée à "${entry.series}"`)
      updated++
    }
  }

  console.log(`\n🎉 Terminé !`)
  console.log(`   📁 Séries créées  : ${created}`)
  console.log(`   🔄 Sections B ajoutées/mises à jour : ${updated}`)
  console.log(`   ✓  Déjà à jour   : ${skipped}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
