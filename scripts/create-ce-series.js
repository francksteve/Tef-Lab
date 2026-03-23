'use strict';
/**
 * Crée les séries CE 4 à CE 53 dans la table Series.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht'; // Module CE

async function main() {
  const connectionString = (process.env.DATABASE_URL || '')
    .replace('sslmode=require', 'sslmode=no-verify')
    .replace(':6543/', ':5432/');
  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  try {
    // Récupérer les séries CE existantes
    const existing = await prisma.series.findMany({ where: { moduleId: MODULE_ID } });
    const existingTitles = new Set(existing.map(s => s.title));
    console.log('Séries CE existantes :', existing.map(s => s.title).join(', '));

    const created = [];
    for (let n = 4; n <= 53; n++) {
      const title = `CE ${n}`;
      if (existingTitles.has(title)) {
        console.log(`  ⏭  ${title} existe déjà`);
        const s = existing.find(x => x.title === title);
        created.push({ title, id: s.id });
        continue;
      }
      const serie = await prisma.series.create({
        data: { title, moduleId: MODULE_ID, isFree: false },
      });
      created.push({ title, id: serie.id });
      console.log(`  ✔ ${title} → ${serie.id}`);
    }

    console.log('\n=== IDs pour les agents ===');
    created.forEach(s => console.log(`${s.title}: ${s.id}`));

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
