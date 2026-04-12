const fs = require('fs')
const path = require('path')

// ─── Helper ───────────────────────────────────────────────────────────────────
function buildIntroLongText(topic, optA, optB, optC, optD, personneNum, gender, responseText) {
  const genderTag = gender === 'H' ? '[H]' : '[F]'
  return (
    `Vous allez entendre trois personnes répondre à la question suivante : « ${topic} »\n\n` +
    `Pour chaque personne, dites si elle est :\n` +
    `A. ${optA}\n` +
    `B. ${optB}\n` +
    `C. ${optC}\n` +
    `D. ${optD}\n\n` +
    `Personne ${personneNum} ${genderTag} :\n` +
    responseText
  )
}

function buildContinuationLongText(personneNum, gender, responseText) {
  const genderTag = gender === 'H' ? '[H]' : '[F]'
  return `Personne ${personneNum} ${genderTag} :\n${responseText}`
}

function buildQuestion(personneNum, topic) {
  return `Personne ${personneNum} - ${topic} La personne interrogée est…`
}

// ─── CO4 ──────────────────────────────────────────────────────────────────────
const co4Path = path.join(__dirname, '..', 'content', 'co-serie-4.json')
const co4 = JSON.parse(fs.readFileSync(co4Path, 'utf8'))

// Micro-trottoir 1 (Q15-17): Réseaux sociaux interdits aux moins de 16 ans
const mt1Topic4 = 'Pensez-vous que les réseaux sociaux devraient être interdits aux moins de 16 ans ?'
const mt1OptA4 = 'tout à fait favorable à l\'interdiction.'
const mt1OptB4 = 'favorable sous certaines conditions.'
const mt1OptC4 = 'totalement opposée à l\'interdiction.'
const mt1OptD4 = 'sans opinion sur la question.'

const mt1P1Text4 = 'Écoutez, moi j\'ai deux adolescents à la maison, et je vois bien les dégâts : ils ne dorment plus, ils sont scotchés à leur téléphone. Donc oui, je suis complètement pour une interdiction. Il faut protéger nos enfants, point final.'
const mt1P2Text4 = 'Interdire complètement, je ne suis pas sûre que ce soit la solution. Par contre, un encadrement plus strict avec un contrôle parental obligatoire et des limites de temps, ça oui, ce serait une bonne mesure. Tout dépend de la maturité de l\'enfant aussi.'
const mt1P3Text4 = 'Franchement, on ne peut pas empêcher les jeunes d\'accéder à la technologie, c\'est leur monde. Moi je pense qu\'il vaut mieux les éduquer à bien utiliser ces outils plutôt que de tout leur interdire. L\'interdiction, ça n\'a jamais fonctionné.'

// Micro-trottoir 2 (Q18-20): Télétravail devrait-il devenir la norme
const mt2Topic4 = 'Selon vous, le télétravail devrait-il devenir la norme ?'
const mt2OptA4 = 'devrait remplacer totalement le présentiel.'
const mt2OptB4 = 'fonctionne bien en alternance avec le présentiel.'
const mt2OptC4 = 'est une mauvaise idée en général.'
const mt2OptD4 = 'ne la concerne pas personnellement.'

const mt2P1Text4 = 'Alors moi, depuis la pandémie, je travaille de chez moi trois jours par semaine et c\'est le rythme parfait. Je ne voudrais pas que ce soit tous les jours non plus, parce que voir les collègues, c\'est important. Un mélange des deux, c\'est l\'idéal.'
const mt2P2Text4 = 'Le télétravail, moi j\'adore ! Plus de trajet, plus de bouchons, je suis chez moi, tranquille. Je suis beaucoup plus productif. Si on me demandait de retourner au bureau tous les jours, je changerais d\'emploi, c\'est aussi simple que ça.'
const mt2P3Text4 = 'Honnêtement, je ne vois pas comment on peut bien travailler chez soi avec les enfants, le bruit, les distractions. Au bureau, au moins, on a un cadre professionnel. Et puis les réunions en visioconférence, c\'est quand même beaucoup moins efficace qu\'en personne.'

for (const q of co4.questions) {
  if (q.questionOrder === 15) {
    q.category = 'Micro-trottoir 1 - Personne 1'
    q.longText = buildIntroLongText(mt1Topic4, mt1OptA4, mt1OptB4, mt1OptC4, mt1OptD4, 1, 'H', mt1P1Text4)
    q.question = buildQuestion(1, mt1Topic4)
    q.optionA = mt1OptA4; q.optionB = mt1OptB4; q.optionC = mt1OptC4; q.optionD = mt1OptD4
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 16) {
    q.category = 'Micro-trottoir 1 - Personne 2'
    q.longText = buildContinuationLongText(2, 'F', mt1P2Text4)
    q.question = buildQuestion(2, mt1Topic4)
    q.optionA = mt1OptA4; q.optionB = mt1OptB4; q.optionC = mt1OptC4; q.optionD = mt1OptD4
    q.correctAnswer = 'B'
  } else if (q.questionOrder === 17) {
    q.category = 'Micro-trottoir 1 - Personne 3'
    q.longText = buildContinuationLongText(3, 'H', mt1P3Text4)
    q.question = buildQuestion(3, mt1Topic4)
    q.optionA = mt1OptA4; q.optionB = mt1OptB4; q.optionC = mt1OptC4; q.optionD = mt1OptD4
    q.correctAnswer = 'C'
  } else if (q.questionOrder === 18) {
    q.category = 'Micro-trottoir 2 - Personne 1'
    q.longText = buildIntroLongText(mt2Topic4, mt2OptA4, mt2OptB4, mt2OptC4, mt2OptD4, 1, 'F', mt2P1Text4)
    q.question = buildQuestion(1, mt2Topic4)
    q.optionA = mt2OptA4; q.optionB = mt2OptB4; q.optionC = mt2OptC4; q.optionD = mt2OptD4
    q.correctAnswer = 'B'
  } else if (q.questionOrder === 19) {
    q.category = 'Micro-trottoir 2 - Personne 2'
    q.longText = buildContinuationLongText(2, 'H', mt2P2Text4)
    q.question = buildQuestion(2, mt2Topic4)
    q.optionA = mt2OptA4; q.optionB = mt2OptB4; q.optionC = mt2OptC4; q.optionD = mt2OptD4
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 20) {
    q.category = 'Micro-trottoir 2 - Personne 3'
    q.longText = buildContinuationLongText(3, 'H', mt2P3Text4)
    q.question = buildQuestion(3, mt2Topic4)
    q.optionA = mt2OptA4; q.optionB = mt2OptB4; q.optionC = mt2OptC4; q.optionD = mt2OptD4
    q.correctAnswer = 'C'
  }
}
fs.writeFileSync(co4Path, JSON.stringify(co4, null, 2), 'utf8')
console.log('✅ co-serie-4.json updated')

// ─── CO5 ──────────────────────────────────────────────────────────────────────
const co5Path = path.join(__dirname, '..', 'content', 'co-serie-5.json')
const co5 = JSON.parse(fs.readFileSync(co5Path, 'utf8'))

// Micro-trottoir 1 (Q15-17): Réseaux sociaux bénéfiques pour les adolescents
const mt1Topic5 = 'Pensez-vous que les réseaux sociaux sont bénéfiques pour les adolescents ?'
const mt1OptA5 = 'tout à fait favorable.'
const mt1OptB5 = 'favorable dans certains cas.'
const mt1OptC5 = 'totalement défavorable.'
const mt1OptD5 = 'sans opinion sur la question.'

const mt1P1Text5 = 'Absolument ! Mes enfants y ont trouvé des amis, des passions communes, des ressources scolaires. C\'est un outil formidable quand c\'est bien encadré.'
const mt1P2Text5 = 'Bénéfiques ? Peut-être pour certains usages précis, comme les groupes d\'entraide scolaire. Mais pour la plupart, c\'est une perte de temps et une source d\'anxiété.'
const mt1P3Text5 = 'Non, sans hésitation. On voit les effets : les jeunes ne dorment plus, ne se concentrent plus. C\'est une catastrophe pour leur développement.'

// Micro-trottoir 2 (Q18-20): Semaine de travail de 4 jours
const mt2Topic5 = 'Êtes-vous favorable à la semaine de travail de 4 jours ?'
const mt2OptA5 = 'tout à fait favorable.'
const mt2OptB5 = 'favorable dans certains cas.'
const mt2OptC5 = 'totalement défavorable.'
const mt2OptD5 = 'sans opinion sur la question.'

const mt2P1Text5 = 'Je ne sais pas vraiment. Ça dépend tellement des secteurs et des entreprises. Je n\'ai pas d\'avis tranché là-dessus.'
const mt2P2Text5 = 'Oui, complètement ! J\'ai testé ça dans mon entreprise et la productivité a augmenté. Les gens sont plus reposés, plus motivés. C\'est l\'avenir du travail.'
const mt2P3Text5 = 'Pour moi, c\'est inapplicable dans mon domaine. Infirmière, on ne peut pas laisser les patients sans soins. Il faut rester réaliste.'

for (const q of co5.questions) {
  if (q.questionOrder === 15) {
    q.category = 'Micro-trottoir 1 - Personne 1'
    q.longText = buildIntroLongText(mt1Topic5, mt1OptA5, mt1OptB5, mt1OptC5, mt1OptD5, 1, 'F', mt1P1Text5)
    q.question = buildQuestion(1, mt1Topic5)
    q.optionA = mt1OptA5; q.optionB = mt1OptB5; q.optionC = mt1OptC5; q.optionD = mt1OptD5
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 16) {
    q.category = 'Micro-trottoir 1 - Personne 2'
    q.longText = buildContinuationLongText(2, 'H', mt1P2Text5)
    q.question = buildQuestion(2, mt1Topic5)
    q.optionA = mt1OptA5; q.optionB = mt1OptB5; q.optionC = mt1OptC5; q.optionD = mt1OptD5
    q.correctAnswer = 'B'
  } else if (q.questionOrder === 17) {
    q.category = 'Micro-trottoir 1 - Personne 3'
    q.longText = buildContinuationLongText(3, 'H', mt1P3Text5)
    q.question = buildQuestion(3, mt1Topic5)
    q.optionA = mt1OptA5; q.optionB = mt1OptB5; q.optionC = mt1OptC5; q.optionD = mt1OptD5
    q.correctAnswer = 'C'
  } else if (q.questionOrder === 18) {
    q.category = 'Micro-trottoir 2 - Personne 1'
    q.longText = buildIntroLongText(mt2Topic5, mt2OptA5, mt2OptB5, mt2OptC5, mt2OptD5, 1, 'H', mt2P1Text5)
    q.question = buildQuestion(1, mt2Topic5)
    q.optionA = mt2OptA5; q.optionB = mt2OptB5; q.optionC = mt2OptC5; q.optionD = mt2OptD5
    q.correctAnswer = 'D'
  } else if (q.questionOrder === 19) {
    q.category = 'Micro-trottoir 2 - Personne 2'
    q.longText = buildContinuationLongText(2, 'H', mt2P2Text5)
    q.question = buildQuestion(2, mt2Topic5)
    q.optionA = mt2OptA5; q.optionB = mt2OptB5; q.optionC = mt2OptC5; q.optionD = mt2OptD5
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 20) {
    q.category = 'Micro-trottoir 2 - Personne 3'
    q.longText = buildContinuationLongText(3, 'F', mt2P3Text5)
    q.question = buildQuestion(3, mt2Topic5)
    q.optionA = mt2OptA5; q.optionB = mt2OptB5; q.optionC = mt2OptC5; q.optionD = mt2OptD5
    q.correctAnswer = 'C'
  }
}
fs.writeFileSync(co5Path, JSON.stringify(co5, null, 2), 'utf8')
console.log('✅ co-serie-5.json updated')

// ─── CO6 ──────────────────────────────────────────────────────────────────────
const co6Path = path.join(__dirname, '..', 'content', 'co-serie-6.json')
const co6 = JSON.parse(fs.readFileSync(co6Path, 'utf8'))

// Micro-trottoir 1 (Q15-17): Protection du français au Québec
const mt1Topic6 = 'Pensez-vous que le Québec fait assez pour protéger la langue française ?'
const mt1OptA6 = 'pense que des efforts supplémentaires sont nécessaires.'
const mt1OptB6 = 'pense que les mesures actuelles sont suffisantes.'
const mt1OptC6 = 'pense que les mesures vont trop loin.'
const mt1OptD6 = 'sans opinion sur la question.'

const mt1P1Text6 = 'Franchement non. On voit bien que l\'anglais prend de plus en plus de place à Montréal. Il faudrait des mesures encore plus fortes, surtout dans les entreprises. La loi 96 est un bon début, mais c\'est insuffisant.'
const mt1P2Text6 = 'Moi je pense qu\'on fait ce qu\'il faut. Le français est vivant, les jeunes l\'utilisent, les immigrants l\'apprennent. On n\'a pas besoin d\'en faire plus, sinon ça devient de l\'intégration forcée.'
const mt1P3Text6 = 'Je trouve qu\'on va trop loin. À force de vouloir protéger le français, on brime les libertés individuelles. Les anglophones ont leurs droits aussi, et les immigrants devraient pouvoir choisir leur langue d\'intégration.'

// Micro-trottoir 2 (Q18-20): Extension du réseau cyclable à Montréal
const mt2Topic6 = 'Seriez-vous favorable à ce que le réseau de pistes cyclables soit étendu au détriment des voies automobiles à Montréal ?'
const mt2OptA6 = 'tout à fait favorable à l\'extension des pistes cyclables.'
const mt2OptB6 = 'favorable seulement dans certains quartiers.'
const mt2OptC6 = 'défavorable à cause des impacts sur les commerces.'
const mt2OptD6 = 'sans opinion sur la question.'

const mt2P1Text6 = 'Absolument oui. Les voitures polluent et congèrent la ville. On doit encourager le vélo et les transports en commun coûte que coûte. C\'est l\'avenir.'
const mt2P2Text6 = 'Ça dépend des quartiers. Dans le centre-ville, oui. Mais en banlieue où il n\'y a pas d\'autre option que la voiture, c\'est plus compliqué. Il faut trouver un équilibre.'
const mt2P3Text6 = 'Non, c\'est une mauvaise idée. On crée des embouteillages et on pénalise les commerçants dont les clients arrivent en voiture. Il faut penser à l\'économie locale.'

for (const q of co6.questions) {
  if (q.questionOrder === 15) {
    q.category = 'Micro-trottoir 1 - Personne 1'
    q.longText = buildIntroLongText(mt1Topic6, mt1OptA6, mt1OptB6, mt1OptC6, mt1OptD6, 1, 'H', mt1P1Text6)
    q.question = buildQuestion(1, mt1Topic6)
    q.optionA = mt1OptA6; q.optionB = mt1OptB6; q.optionC = mt1OptC6; q.optionD = mt1OptD6
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 16) {
    q.category = 'Micro-trottoir 1 - Personne 2'
    q.longText = buildContinuationLongText(2, 'F', mt1P2Text6)
    q.question = buildQuestion(2, mt1Topic6)
    q.optionA = mt1OptA6; q.optionB = mt1OptB6; q.optionC = mt1OptC6; q.optionD = mt1OptD6
    q.correctAnswer = 'B'
  } else if (q.questionOrder === 17) {
    q.category = 'Micro-trottoir 1 - Personne 3'
    q.longText = buildContinuationLongText(3, 'H', mt1P3Text6)
    q.question = buildQuestion(3, mt1Topic6)
    q.optionA = mt1OptA6; q.optionB = mt1OptB6; q.optionC = mt1OptC6; q.optionD = mt1OptD6
    q.correctAnswer = 'C'
  } else if (q.questionOrder === 18) {
    q.category = 'Micro-trottoir 2 - Personne 1'
    q.longText = buildIntroLongText(mt2Topic6, mt2OptA6, mt2OptB6, mt2OptC6, mt2OptD6, 1, 'F', mt2P1Text6)
    q.question = buildQuestion(1, mt2Topic6)
    q.optionA = mt2OptA6; q.optionB = mt2OptB6; q.optionC = mt2OptC6; q.optionD = mt2OptD6
    q.correctAnswer = 'A'
  } else if (q.questionOrder === 19) {
    q.category = 'Micro-trottoir 2 - Personne 2'
    q.longText = buildContinuationLongText(2, 'H', mt2P2Text6)
    q.question = buildQuestion(2, mt2Topic6)
    q.optionA = mt2OptA6; q.optionB = mt2OptB6; q.optionC = mt2OptC6; q.optionD = mt2OptD6
    q.correctAnswer = 'B'
  } else if (q.questionOrder === 20) {
    q.category = 'Micro-trottoir 2 - Personne 3'
    q.longText = buildContinuationLongText(3, 'H', mt2P3Text6)
    q.question = buildQuestion(3, mt2Topic6)
    q.optionA = mt2OptA6; q.optionB = mt2OptB6; q.optionC = mt2OptC6; q.optionD = mt2OptD6
    q.correctAnswer = 'C'
  }
}
fs.writeFileSync(co6Path, JSON.stringify(co6, null, 2), 'utf8')
console.log('✅ co-serie-6.json updated')

console.log('\n🎉 All 3 files updated successfully.')
