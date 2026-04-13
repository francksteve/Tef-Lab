/**
 * Fix micro-trottoir intro block in CO4, CO5, CO6.
 *
 * Issues introduced by the previous fix-microtrottoirs.js script:
 *   1. "Pour chaque personne, dites si elle est :"  → "Indiquez si la personne interrogée est…"
 *   2. Uppercase  A. / B. / C. / D.                 → lowercase  a. / b. / c. / d.
 *   3. Question on same line as «                   → «  on its own line after \n
 *
 * Only Q15 and Q18 are affected (they carry the intro block).
 */

const fs = require('fs')
const path = require('path')

const FILES = ['co-serie-4.json', 'co-serie-5.json', 'co-serie-6.json']

for (const filename of FILES) {
  const filePath = path.join(__dirname, '..', 'content', filename)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  let changed = 0
  for (const q of data.questions) {
    if (q.questionOrder !== 15 && q.questionOrder !== 18) continue
    if (!q.longText) continue

    let text = q.longText

    // 1. Move « onto its own line if it's on the same line as the sentence
    //    "répondre à la question suivante : « ..."  →  "répondre à la question suivante :\n« ..."
    text = text.replace(
      /(répondre à la question suivante)\s*:\s*«/,
      '$1 :\n«'
    )

    // 2. Replace the old instruction line with the TEF-official wording
    text = text.replace(
      /Pour chaque personne, dites si elle est\s*:/,
      'Indiquez si la personne interrogée est…'
    )

    // 3. Uppercase option letters → lowercase  (A. → a.  B. → b.  C. → c.  D. → d.)
    text = text.replace(/\n([ABCD])\. /g, (_, letter) => `\n${letter.toLowerCase()}. `)

    if (text !== q.longText) {
      q.longText = text
      changed++
      console.log(`  ✔ ${filename} Q${q.questionOrder} — intro corrigée`)
    } else {
      console.log(`  ○ ${filename} Q${q.questionOrder} — déjà correct, aucune modification`)
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✅ ${filename} — ${changed} question(s) modifiée(s)\n`)
}

console.log('🎉 Correction terminée.')
