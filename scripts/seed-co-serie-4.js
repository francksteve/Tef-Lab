// Script to seed CO Série 4 into the database
// Run: node scripts/seed-co-serie-4.js

const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  // Load env
  require('dotenv').config()

  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    console.error('❌ DATABASE_URL not set')
    process.exit(1)
  }

  const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify')
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // 1. Find CO module
    const coModule = await prisma.module.findFirst({ where: { code: 'CO' } })
    if (!coModule) {
      console.error('❌ Module CO not found. Run seed first.')
      process.exit(1)
    }
    console.log(`✅ Module CO found: ${coModule.id}`)

    // 2. Check if CO Série 4 already exists
    const existing = await prisma.series.findFirst({
      where: { title: 'CO Série 4', moduleId: coModule.id }
    })
    if (existing) {
      console.log(`⚠️  CO Série 4 already exists (id: ${existing.id}). Deleting questions and recreating...`)
      await prisma.question.deleteMany({ where: { seriesId: existing.id } })
      await prisma.series.delete({ where: { id: existing.id } })
      console.log('🗑️  Old series deleted.')
    }

    // 3. Create series
    const series = await prisma.series.create({
      data: {
        title: 'CO Série 4',
        moduleId: coModule.id,
        isFree: false,
      }
    })
    console.log(`✅ Series created: ${series.id}`)

    // 4. Load questions from JSON
    const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'content', 'co-serie-4.json'), 'utf-8')
    )

    // 5. Insert questions
    let count = 0
    for (const q of data.questions) {
      await prisma.question.create({
        data: {
          moduleId: coModule.id,
          seriesId: series.id,
          questionOrder: q.questionOrder,
          taskTitle: q.taskTitle || null,
          category: q.category || null,
          longText: q.longText || null,
          question: q.question,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          correctAnswer: q.correctAnswer || null,
          explanation: q.explanation || null,
        }
      })
      count++
    }

    console.log(`✅ ${count} questions inserted for CO Série 4`)
    console.log('🎉 Done!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
