'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const cs = (process.env.DATABASE_URL||'').replace('sslmode=require','sslmode=no-verify').replace(':6543/',':5432/');
const pool = new Pool({ connectionString: cs });
async function main() {
  const r = await pool.query(`SELECT s.title, COUNT(q.id) as qcount FROM "Series" s LEFT JOIN "Question" q ON q."seriesId" = s.id JOIN "Module" m ON m.id = s."moduleId" WHERE m.code = 'CE' GROUP BY s.id, s.title ORDER BY s.title`);
  let total = 0, complete = 0, empty = 0;
  r.rows.forEach(row => {
    const c = parseInt(row.qcount);
    total += c;
    if (c === 40) complete++;
    if (c === 0) empty++;
    const status = c === 40 ? '✅' : c === 0 ? '⬜' : '⚠️ ';
    console.log(`${status} ${row.title}: ${c}/40`);
  });
  console.log(`\nSéries: ${r.rows.length} | Complètes: ${complete} | Vides: ${empty} | Total questions: ${total}`);
}
main().finally(() => pool.end());
