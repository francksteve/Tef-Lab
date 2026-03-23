'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const connectionString = (process.env.DATABASE_URL||'').replace('sslmode=require','sslmode=no-verify');
const pool = new Pool({ connectionString });
async function main() {
  const SERIES_ID = 'cmmvz3pr4000bnsxlnewdu99g';
  const qs = await pool.query(
    `SELECT "questionOrder", category, "subCategory", "taskTitle", "longText", question, "optionA","optionB","optionC","optionD","correctAnswer"
     FROM "Question" WHERE "seriesId"=$1 ORDER BY "questionOrder"`,
    [SERIES_ID]
  );
  qs.rows.forEach(r => {
    console.log(`\n=== Q${r.questionOrder} [${r.category}] ===`);
    if (r.taskTitle) console.log('Title:', r.taskTitle);
    if (r.longText) console.log('LongText:', r.longText.substring(0, 300));
    console.log('Q:', r.question);
    console.log('A:', r.optionA);
    console.log('B:', r.optionB);
    console.log('C:', r.optionC);
    console.log('D:', r.optionD);
    console.log('Correct:', r.correctAnswer);
  });
}
main().finally(() => pool.end());
