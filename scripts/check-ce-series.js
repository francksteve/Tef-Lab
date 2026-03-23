'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const connectionString = (process.env.DATABASE_URL||'').replace('sslmode=require','sslmode=no-verify');
const pool = new Pool({ connectionString });
async function main() {
  const series = await pool.query(`
    SELECT s.id, s.title, COUNT(q.id) as qcount
    FROM "Series" s
    LEFT JOIN "Question" q ON q."seriesId" = s.id
    JOIN "Module" m ON m.id = s."moduleId"
    WHERE m.code = 'CE'
    GROUP BY s.id, s.title
    ORDER BY s.title
  `);
  console.log('CE Series:');
  series.rows.forEach(r => console.log(` ${r.title} | id=${r.id} | questions=${r.qcount}`));

  const s2 = series.rows.find(r => r.title.includes('2'));
  if (s2) {
    const qs = await pool.query(
      `SELECT "questionOrder", category, "subCategory", question FROM "Question" WHERE "seriesId"=$1 ORDER BY "questionOrder"`,
      [s2.id]
    );
    console.log(`\nExisting questions in ${s2.title}:`);
    qs.rows.forEach(r => console.log(`  Q${r.questionOrder} [${r.category}/${r.subCategory||'-'}] ${(r.question||'').substring(0,70)}`));
  }
}
main().finally(() => pool.end());
