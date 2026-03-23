'use strict';
/**
 * seed-ce-serie39.js
 * Peuple la série CE 39 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie39.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyokqp000z0wxlcvu8gb63';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques mensuels pour Q22
   Commentaire : « Ce phénomène connaît deux périodes de forte activité : au
   printemps entre mars et mai, et à l'automne en octobre. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [40,65,90,85,60,30,20,25,55,90,80,45], minY:0, maxY:100, color: '#003087' },  // CORRECT — deux pics printemps et automne
    { label: 'Graphique 2', data: [90,85,80,70,60,50,40,50,60,70,80,90], minY:0, maxY:100, color: '#E30613' },  // en U
    { label: 'Graphique 3', data: [40,50,60,70,80,90,90,80,70,60,50,40], minY:0, maxY:100, color: '#E30613' },  // plateau estival
    { label: 'Graphique 4', data: [50,50,50,50,50,50,50,50,50,50,50,50], minY:0, maxY:100, color: '#E30613' },  // stable
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const n = g.data.length;
    const sx = i => (plotX + (i / (n - 1)) * plotW).toFixed(1);
    const sy = v => (plotY + plotH - ((v - g.minY) / (g.maxY - g.minY)) * plotH).toFixed(1);
    const pts = g.data.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
    const gridVals = [g.minY, g.minY + (g.maxY-g.minY)/4, g.minY + (g.maxY-g.minY)/2, g.minY + 3*(g.maxY-g.minY)/4, g.maxY];
    const gridLines = gridVals.map(v => {
      const yv = parseFloat(sy(v));
      return `<line x1="${plotX}" y1="${yv.toFixed(1)}" x2="${plotX + plotW}" y2="${yv.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(yv + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');
    const xlab = months.map((m, i) =>
      `<text x="${sx(i)}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${m}</text>`
    ).join('');
    const dots = g.data.map((v, i) =>
      `<circle cx="${sx(i)}" cy="${sy(v)}" r="3" fill="${g.color}"/>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
      `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
      `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      gridLines + xlab +
      `<polyline points="${pts}" fill="none" stroke="${g.color}" stroke-width="2.5" stroke-linejoin="round"/>` +
      dots;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawLineChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const q = (order, cat, sub, data) => ({
  moduleId: MODULE_ID, seriesId: SERIES_ID, questionOrder: order, category: cat,
  subCategory: sub ?? null, taskTitle: data.taskTitle ?? null, longText: data.longText ?? null,
  consigne: data.consigne ?? null, comment: data.comment ?? null, imageUrl: data.imageUrl ?? null,
  audioUrl: null, question: data.question,
  optionA: data.optionA, optionB: data.optionB, optionC: data.optionC, optionD: data.optionD,
  correctAnswer: data.correctAnswer, explanation: data.explanation ?? null,
});

function buildQuestions() {
  const qs = [];

  /* ── Q1-7 ──────────────────────────────────────────────────────────────── */

  qs.push(q(1, 'Q1-7', null, {
    longText:
`SEMAINE DU LIVRE ET DE LA LITTÉRATURE JEUNESSE
Du 10 au 16 mai — Médiathèque centrale et écoles partenaires

Programme :
• Rencontres avec des auteurs jeunesse (séances de dédicaces incluses)
• Ateliers d'illustration pour enfants de 6 à 12 ans
• Concours de nouvelles « Mon héros imaginaire » — 10 à 16 ans
• Exposition de planches originales de bandes dessinées

Inscription aux ateliers : obligatoire avant le 5 mai — places limitées
Entrée libre pour les expositions et rencontres
Remise des prix du concours : samedi 16 mai à 15 h`,
    question: "Quel est l'âge requis pour participer au concours de nouvelles ?",
    optionA: "6 à 12 ans.",
    optionB: "8 à 14 ans.",
    optionC: "10 à 16 ans.",
    optionD: "Tous âges.",
    correctAnswer: 'C',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`POTAGER URBAIN PARTAGÉ « LES JARDINS DU CANAL »

Organisation : 30 parcelles individuelles de 10 m² + zone commune de compostage
Attribution des parcelles : par tirage au sort chaque novembre pour l'année suivante

Règles de culture : interdiction de pesticides et d'engrais chimiques — méthodes biologiques uniquement
Arrosage : obligation de participer à l'arrosage collectif 1 fois par semaine (rotation organisée)
Récolte : chaque jardinier cueille uniquement sa parcelle. La zone commune est partagée équitablement.

Cotisation annuelle : 25 €
Inscriptions : jardinsducanal@mairie-bordeaux.fr`,
    question: "Comment les parcelles sont-elles attribuées ?",
    optionA: "Au premier arrivé, premier servi.",
    optionB: "Selon l'ancienneté dans le quartier.",
    optionC: "Par tirage au sort chaque novembre.",
    optionD: "Sur décision du comité de jardinage.",
    correctAnswer: 'C',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`FÊTE DE LA MUSIQUE — 21 JUIN

Programme scène principale — Place de la République :
18 h : Orchestre de jazz « Les Brasseurs »
19 h 30 : DJ électro « Nightwave »
21 h : Concert rock « Les Fracas »
23 h : Clôture

Accès libre et gratuit pour tous — Buvette et restauration sur place
En cas de pluie intense : report à la Halle des Sports (même programme)
Stationnement conseillé : parking Victoire (navette gratuite toutes les 20 min)`,
    question: "Où se déroule le concert en cas de pluie intense ?",
    optionA: "À la médiathèque municipale.",
    optionB: "Sur la Place du Marché.",
    optionC: "À la Halle des Sports.",
    optionD: "Il est annulé.",
    correctAnswer: 'C',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`RÔTISSERIE ARTISANALE « LE FEU DE BOIS »

Volailles rôties : poulet fermier, pintade, canard confit
Accompagnements : pommes de terre sarladaises, gratin dauphinois, haricots verts
Sauces maison : jus de rôti, sauce champignons des bois, miel-moutarde

Prix à emporter :
• Demi-poulet + accompagnement : 11,50 €
• Poulet entier : 18 €
• Pintade entière : 22 €

Commandes pour les fêtes : 10 pièces minimum, 48 h à l'avance
Horaires vente : vendredi soir et samedi-dimanche uniquement`,
    question: "Quel délai faut-il respecter pour une commande de fête ?",
    optionA: "24 heures.",
    optionB: "48 heures.",
    optionC: "72 heures.",
    optionD: "Une semaine.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`FER À REPASSER VAPEUR AQUAPRO 2800 W

Réglages tissus : sélecteur rotatif de 1 (synthétiques délicats) à 6 (lin, coton épais)
Vapeur : active à partir du réglage 3 — pression max : 45 g/min

Détartrage : voyant lumineux rouge = détartrage nécessaire. Utiliser les sachets anticalcaire fournis (2 dans la boîte).
Semelle en inox : ne jamais utiliser de chiffon abrasif. Essuyer avec un chiffon humide froid.
Cordon : ne pas plier à angle vif. Ranger en l'enroulant loosement.

⚠ Ne jamais laisser le fer à plat sur du tissu lorsqu'il est chaud.`,
    question: "Quel signal indique que le détartrage est nécessaire ?",
    optionA: "Un signal sonore.",
    optionB: "Un voyant lumineux rouge.",
    optionC: "Une odeur de calcaire.",
    optionD: "Une diminution de la vapeur.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`ESPACE BIEN-ÊTRE & SPA « L'INSTANT ZEN »

Soins proposés : massages (californien, suédois, aux pierres chaudes, ayurvédique), soins du visage, gommages corps, balnéothérapie, hammam

Réservation : obligatoire au 05 61 33 44 55 ou en ligne — 24 h à l'avance minimum
Bon cadeau : disponibles pour toutes les prestations, valables 12 mois

Parking : gratuit dans le parking souterrain voisin sur présentation de la facture du spa.

Horaires : lundi-samedi 9 h – 20 h | dimanche 10 h – 18 h`,
    question: "Combien de temps les bons cadeaux sont-ils valables ?",
    optionA: "3 mois.",
    optionB: "6 mois.",
    optionC: "12 mois.",
    optionD: "24 mois.",
    correctAnswer: 'C',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`Mesdames, Messieurs les copropriétaires,

Par la présente, nous vous informons que le tribunal judiciaire de Paris a rendu le 15 mars dernier un jugement concernant le litige opposant le syndicat des copropriétaires à l'entreprise de rénovation Batipro.

Le tribunal a donné raison au syndicat et condamné ladite entreprise à rembourser la somme de 42 500 € correspondant aux malfaçons constatées sur la façade nord de l'immeuble.

Les fonds seront versés dans les 60 jours au compte de la copropriété. Une assemblée générale extraordinaire sera convoquée pour décider de leur affectation.

Bien cordialement,
Le Syndic — Cabinet Gestaim`,
    question: "Pourquoi le syndic écrit-il aux copropriétaires ?",
    optionA: "Pour annoncer des travaux de rénovation.",
    optionB: "Pour informer d'une décision de justice favorable.",
    optionC: "Pour demander une contribution financière urgente.",
    optionD: "Pour convoquer l'assemblée générale annuelle.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 ──────────────────────────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour accéder à la salle de réunion, veuillez vous ___ auprès de la secrétaire à l'accueil.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "présenter",
    optionB: "inscrire",
    optionC: "justifier",
    optionD: "signaler",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Cette association ___ des activités sportives et culturelles pour les personnes âgées du quartier.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "interdit",
    optionB: "réduit",
    optionC: "propose",
    optionD: "coûte",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le rapport sera ___ à l'ensemble des actionnaires lors de l'assemblée générale du mois prochain.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "caché",
    optionB: "présenté",
    optionC: "oublié",
    optionD: "modifié",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Il est recommandé de ___ régulièrement ses mots de passe pour sécuriser ses comptes en ligne.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "partager",
    optionB: "noter",
    optionC: "modifier",
    optionD: "supprimer",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les participants ont été ___ de remplir un questionnaire d'évaluation à l'issue de la formation.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "empêchés",
    optionB: "invités",
    optionC: "contraints",
    optionD: "félicités",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce traitement médical est uniquement disponible dans les hôpitaux ___ par le ministère de la Santé.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refusés",
    optionB: "critiqués",
    optionC: "autorisés",
    optionD: "fermés",
    correctAnswer: 'C',
  }));

  /* ── Q14-17 ──────────────────────────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "Le numérique a profondément [14] nos habitudes de communication. Si les échanges sont devenus plus rapides et plus fréquents, certains spécialistes s'interrogent sur la qualité de ces [15] et leur impact sur les liens humains à long terme.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le numérique et la communication',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "préservé",
    optionB: "transformé",
    optionC: "inventé",
    optionD: "ignoré",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le numérique et la communication',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "prix",
    optionB: "images",
    optionC: "interactions",
    optionD: "réseaux",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La reforestation est l'une des stratégies les plus [16] pour lutter contre le réchauffement climatique. Planter des arbres permet de [17] du carbone atmosphérique tout en restaurant des écosystèmes détruits.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La reforestation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "coûteuses",
    optionB: "prometteuses",
    optionC: "récentes",
    optionD: "désuètes",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La reforestation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "produire",
    optionB: "émettre",
    optionC: "capter",
    optionD: "libérer",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Lodge A', content: "Eco-lodge Simien — Éthiopie. Safaris quotidiens inclus (matin et soir). Gélopattes et babouins gelada observables. Guides locaux certifiés. Tout compris 7 nuits : 1 850 €." },
    { title: 'Lodge B', content: "Lodge des Lacs — Éthiopie centrale. Pêche et randonnée. Pas de safaris. Confort moderne, vue sur le lac. 7 nuits demi-pension : 950 €." },
    { title: 'Lodge C', content: "Camp Rift Valley — Éthiopie. Excursions culturelles villages locaux. Safaris optionnels (supplément). 7 nuits : 1 100 €." },
    { title: 'Lodge D', content: "Hauts Plateaux Retreat — Éthiopie. Trekking intensif, flore alpine. Pas de safaris animaliers. 7 nuits tout compris : 1 400 €." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel lodge inclut des safaris quotidiens ?",
    optionA: "Lodge A",
    optionB: "Lodge B",
    optionC: "Lodge C",
    optionD: "Lodge D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Cours A', content: "Poterie initiation — 6 séances de 2 h. Tours électriques. Argile fournie. Cuisson des pièces incluse (four du studio). Livraison de vos créations à domicile après cuisson. Prix : 180 €." },
    { title: 'Cours B', content: "Poterie façonnage à la main — 4 séances. Argile fournie. Cuisson non incluse (four en option : +30 €). Pas de livraison. Prix : 120 €." },
    { title: 'Cours C', content: "Raku japonais — 1 journée intensive. Cuisson spectaculaire incluse sur place. Argile et équipements fournis. Pas de livraison. Prix : 95 €." },
    { title: 'Cours D', content: "Poterie avancée — 8 séances. Tournassage, décoration, glaçages. Cuisson four gaz incluse. Pas de livraison, retrait sur place uniquement. Prix : 290 €." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel cours inclut la livraison de vos créations ?",
    optionA: "Cours A",
    optionB: "Cours B",
    optionC: "Cours C",
    optionD: "Cours D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Poste 1', content: "Chercheur en physique des matériaux — Laboratoire CNRS Toulouse. Contrat post-doctorat 2 ans. Financement Agence nationale de la recherche. Pas de financement européen. Salaire : 2 400 €/mois." },
    { title: 'Poste 2', content: "Chercheuse en biologie marine — IFREMER Brest. CDI chercheur. Missions en mer. Financement national. Salaire selon grille EPST." },
    { title: 'Poste 3', content: "Doctorant(e) en climatologie — Université Paris-Saclay. Contrat doctoral 3 ans financé par l'Union européenne (programme Horizon Europe). Mobilité internationale requise. Salaire : 1 900 €/mois." },
    { title: 'Poste 4', content: "Ingénieur de recherche en IA — Inria Nancy. CDI. Développement d'algorithmes. Financement ANR et industriels. Pas de financement UE. Salaire : 3 200 €/mois." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste est financé par l'Union européenne ?",
    optionA: "Poste 1",
    optionB: "Poste 2",
    optionC: "Poste 3",
    optionD: "Poste 4",
    correctAnswer: 'C',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Abonnement A', content: "CaféBox Hebdo — Livraison chaque semaine. 250 g de café moulu ou en grains. 2 origines différentes par mois. Prix : 18 €/semaine (abonnement mensuel)." },
    { title: 'Abonnement B', content: "CaféBox Premium — Livraison toutes les 2 semaines. 500 g par envoi. Café de spécialité, score supérieur à 85. Prix : 29 €/livraison." },
    { title: 'Abonnement C', content: "CaféBox Découverte — Livraison mensuelle. Coffret 4 × 100 g de 4 origines différentes. Notes de dégustation incluses. Prix : 35 €/mois." },
    { title: 'Abonnement D', content: "CaféBox Pro — Livraison mensuelle. 1 kg par envoi. Pour professionnels et cafés. Mouture personnalisée. Prix : 45 €/mois." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel abonnement livre chaque semaine ?",
    optionA: "Abonnement A",
    optionB: "Abonnement B",
    optionC: "Abonnement C",
    optionD: "Abonnement D",
    correctAnswer: 'A',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Ce phénomène connaît deux périodes de forte activité : au printemps entre mars et mai, et à l'automne en octobre.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_HORAIRES =
`RÈGLEMENT — HORAIRES FLEXIBLES AMÉNAGÉS

L'entreprise propose un système d'horaires flexibles à tous les salariés non soumis à des contraintes opérationnelles fixes.

Plages fixes obligatoires : présence requise de 9 h 30 à 11 h 30 et de 14 h à 16 h (lundi au vendredi).
Plages variables : les heures restantes peuvent être accomplies entre 7 h et 9 h 30 ou entre 16 h et 19 h.
Compteur d'heures : un compteur individuel est tenu chaque mois. Les heures excédentaires peuvent être reportées sur le mois suivant (plafond : 10 h).
Contrôle : les badgeages sont enregistrés automatiquement. Tout dépassement du déficit mensuel autorisé (4 h) est signalé au manager.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Horaires flexibles aménagés",
    longText: DOC_HORAIRES,
    question: "Quelle est la plage fixe du matin selon ce règlement ?",
    optionA: "De 8 h à 10 h.",
    optionB: "De 9 h 30 à 11 h 30.",
    optionC: "De 9 h à 12 h.",
    optionD: "De 10 h à 12 h.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Horaires flexibles aménagés",
    longText: DOC_HORAIRES,
    question: "Quel est le plafond mensuel d'heures excédentaires reportables ?",
    optionA: "5 heures.",
    optionB: "8 heures.",
    optionC: "10 heures.",
    optionD: "15 heures.",
    correctAnswer: 'C',
  }));

  const DOC_PRIMES =
`NOTE — CALCUL DES PRIMES DE RÉSULTATS

Les primes de résultats sont versées semestriellement en fonction de l'atteinte des objectifs individuels et collectifs.

Formule : prime = salaire mensuel brut × taux d'atteinte × coefficient de performance collective.
Seuils : aucune prime versée en dessous de 70 % d'atteinte. Prime complète à partir de 100 %. Bonus de 20 % au-delà de 120 % d'atteinte.
Cap : la prime ne peut dépasser 3 mois de salaire brut par semestre.
Versement : dans les 30 jours suivant la clôture semestrielle.
Prorata : en cas de départ en cours de semestre, la prime est calculée au prorata des mois travaillés.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Calcul des primes de résultats",
    longText: DOC_PRIMES,
    question: "À partir de quel taux d'atteinte des objectifs une prime complète est-elle versée ?",
    optionA: "70 %.",
    optionB: "80 %.",
    optionC: "90 %.",
    optionD: "100 %.",
    correctAnswer: 'D',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Calcul des primes de résultats",
    longText: DOC_PRIMES,
    question: "Quel est le plafond de la prime par semestre ?",
    optionA: "1 mois de salaire.",
    optionB: "2 mois de salaire.",
    optionC: "3 mois de salaire.",
    optionD: "6 mois de salaire.",
    correctAnswer: 'C',
  }));

  const DOC_PARTAGE =
`CHARTE DE PARTAGE DE LA RÉUSSITE

Notre entreprise croit que la réussite collective doit être partagée avec ceux qui y contribuent.

Intéressement : en cas de bénéfice net supérieur à 5 % du chiffre d'affaires, 10 % de ce surplus est reversé aux salariés au prorata de leur ancienneté.
Communication : les résultats annuels sont présentés à l'ensemble des collaborateurs en assemblée générale interne avant publication externe.
Célébration : chaque franchissement d'un objectif stratégique donne lieu à un événement de team-building financé par l'entreprise.
Valeurs : la transparence, l'équité et la reconnaissance sont les piliers de notre politique de rémunération globale.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de partage de la réussite",
    longText: DOC_PARTAGE,
    question: "À partir de quel niveau de bénéfice net l'intéressement est-il déclenché ?",
    optionA: "3 % du chiffre d'affaires.",
    optionB: "5 % du chiffre d'affaires.",
    optionC: "10 % du chiffre d'affaires.",
    optionD: "15 % du chiffre d'affaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de partage de la réussite",
    longText: DOC_PARTAGE,
    question: "Selon quels critères l'intéressement est-il réparti entre les salariés ?",
    optionA: "Au prorata du salaire.",
    optionB: "Au prorata de l'ancienneté.",
    optionC: "Également entre tous les salariés.",
    optionD: "Selon la performance individuelle.",
    correctAnswer: 'B',
  }));

  const DOC_GREVE =
`GUIDE — DROIT DE GRÈVE DANS LE SECTEUR PRIVÉ

Le droit de grève est un droit constitutionnel garantissant aux salariés du secteur privé de cesser le travail collectivement pour défendre leurs intérêts professionnels.

Préavis : aucun préavis légalement obligatoire dans le secteur privé (contrairement au secteur public). La grève peut être déclenchée sans délai.
Service minimum : aucune obligation légale de service minimum dans le secteur privé, sauf accord de branche spécifique.
Retenue sur salaire : l'employeur peut effectuer une retenue sur le salaire proportionnelle aux heures non travaillées. Aucune retenue supplémentaire n'est autorisée.
Représailles interdites : tout licenciement pour fait de grève est nul et de plein droit, sauf faute lourde du salarié gréviste.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide — Droit de grève dans le secteur privé",
    longText: DOC_GREVE,
    question: "Un préavis est-il légalement obligatoire avant une grève dans le secteur privé ?",
    optionA: "Oui, 5 jours ouvrables.",
    optionB: "Oui, 48 heures.",
    optionC: "Non, aucun préavis n'est obligatoire.",
    optionD: "Oui, mais uniquement pour les grandes entreprises.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide — Droit de grève dans le secteur privé",
    longText: DOC_GREVE,
    question: "Que risque un employeur qui licencie un salarié pour fait de grève ?",
    optionA: "Une amende administrative.",
    optionB: "La nullité du licenciement.",
    optionC: "Une inspection du travail obligatoire.",
    optionD: "Une suspension de son activité.",
    correctAnswer: 'B',
  }));

  const DOC_TEMPS_CHOISI =
`CONVENTION — TEMPS CHOISI (RÉDUCTION DU TEMPS DE TRAVAIL)

Cette convention permet aux salariés qui le souhaitent de réduire leur temps de travail de façon temporaire.

Initiative : la demande est à l'initiative exclusive du salarié. Elle ne peut être imposée par l'employeur.
Conditions : le salarié doit avoir au moins 2 ans d'ancienneté et un poste compatible avec un exercice à temps partiel.
Priorité de retour : le salarié bénéficie d'une priorité absolue pour retrouver un poste à temps plein dans son service dès qu'un poste se libère.
Salaire : calculé au prorata du temps de travail effectif, sans aucun abattement supplémentaire.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Convention — Temps choisi (réduction du temps de travail)",
    longText: DOC_TEMPS_CHOISI,
    question: "Qui peut prendre l'initiative de la demande de temps choisi ?",
    optionA: "L'employeur uniquement.",
    optionB: "Le salarié uniquement.",
    optionC: "L'employeur ou le salarié.",
    optionD: "Le comité d'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Convention — Temps choisi (réduction du temps de travail)",
    longText: DOC_TEMPS_CHOISI,
    question: "Quelle ancienneté minimale est requise pour accéder au temps choisi ?",
    optionA: "6 mois.",
    optionB: "1 an.",
    optionC: "2 ans.",
    optionD: "5 ans.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 ──────────────────────────────────────────────────────────── */

  const ART_APPRENTISSAGE =
`Les neurosciences de l'éducation apportent un éclairage nouveau sur les conditions optimales d'apprentissage chez les enfants. Contrairement aux idées reçues, le cerveau des enfants n'est pas une éponge passive qui absorbe toutes les informations indifféremment : il est sélectif, et sa capacité d'attention profonde est limitée dans le temps.

Des recherches récentes montrent que des périodes de concentration intense de 20 à 25 minutes, suivies de courtes pauses actives, optimisent la mémorisation à long terme. Le phénomène dit d' « encodage espacé » — réviser régulièrement plutôt qu'en une seule fois — est nettement supérieur à l'apprentissage massif (le fameux « bachotage »).

Les jeux de construction, les activités artistiques et les jeux de rôle sont également reconnus comme vecteurs d'apprentissage profond, car ils mobilisent simultanément des compétences cognitives, sociales et motrices.

La pratique de la méditation de pleine conscience en classe, expérimentée dans plusieurs écoles pilotes, montre des résultats prometteurs sur la réduction de l'agitation et l'amélioration de la concentration, particulièrement chez les enfants souffrant de troubles de l'attention.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Apprentissage profond chez les enfants : ce que nous apprennent les neurosciences",
    longText: ART_APPRENTISSAGE,
    question: "Quelle durée de concentration intense est recommandée pour optimiser la mémorisation ?",
    optionA: "5 à 10 minutes.",
    optionB: "15 à 20 minutes.",
    optionC: "20 à 25 minutes.",
    optionD: "30 à 45 minutes.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Apprentissage profond chez les enfants : ce que nous apprennent les neurosciences",
    longText: ART_APPRENTISSAGE,
    question: "Qu'est-ce que l'« encodage espacé » selon cet article ?",
    optionA: "Apprendre en utilisant des espaces physiques différents.",
    optionB: "Réviser régulièrement plutôt qu'en une seule fois.",
    optionC: "Utiliser des supports visuels pour mémoriser.",
    optionD: "Combiner apprentissage oral et écrit.",
    correctAnswer: 'B',
  }));

  const ART_DETTE_ECO =
`La dette écologique est un concept qui vise à mesurer ce que l'humanité « doit » à la nature en raison des dommages causés à l'environnement. Au-delà des émissions de carbone, ce concept englobe des dimensions moins visibles mais tout aussi critiques : la dette en eau, la dette de biodiversité et les externalités sociales non comptabilisées dans les bilans d'entreprises.

Le Jour du dépassement de la Terre — la date à partir de laquelle l'humanité a consommé plus de ressources naturelles que la planète ne peut en régénérer en un an — tombe de plus en plus tôt. En 2024, cette date était le 1er août, contre le 19 novembre en 1987.

Des entreprises pionnières ont commencé à intégrer ces dimensions dans leur reporting extra-financier, en calculant leur empreinte eau et biodiversité à côté de leur bilan carbone. Ces pratiques restent minoritaires mais témoignent d'une évolution des mentalités.

Certains économistes proposent d'instaurer une taxe sur la destruction de biodiversité, similaire à la taxe carbone, pour internaliser ces coûts dans les prix de marché. Un débat qui progresse lentement face aux résistances des lobbies industriels.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Comptabilité de la dette écologique : au-delà du carbone",
    longText: ART_DETTE_ECO,
    question: "Quelle était la date du Jour du dépassement en 2024 ?",
    optionA: "15 juin.",
    optionB: "1er août.",
    optionC: "15 septembre.",
    optionD: "19 novembre.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Comptabilité de la dette écologique : au-delà du carbone",
    longText: ART_DETTE_ECO,
    question: "Que proposent certains économistes pour internaliser la destruction de biodiversité ?",
    optionA: "Interdire les activités destructrices.",
    optionB: "Instaurer une taxe sur la destruction de biodiversité.",
    optionC: "Subventionner les entreprises respectueuses de l'environnement.",
    optionD: "Créer des réserves naturelles obligatoires.",
    correctAnswer: 'B',
  }));

  const ART_PORNO =
`La facilité d'accès à la pornographie sur internet constitue un défi majeur de santé publique pour les adolescents. Des études récentes montrent qu'en France, l'âge moyen de première exposition est désormais de 11 ans, et que 90 % des garçons et 60 % des filles de 14 ans y ont déjà été exposés.

Ces expositions précoces peuvent fausser la représentation de la sexualité, alimenter des représentations stéréotypées et parfois violentes, et contribuer à des difficultés relationnelles et sexuelles à l'âge adulte.

Face à ce constat, la loi française de 2023 sur la majorité numérique a renforcé les obligations des plateformes : elles doivent désormais mettre en place des systèmes de vérification de l'âge efficaces, sous peine d'amendes pouvant atteindre 4 % de leur chiffre d'affaires mondial.

Les experts s'accordent à dire que la solution ne peut être uniquement technique : une éducation à la sexualité complète et précoce, abordant le consentement, les émotions et les relations saines, reste la réponse la plus efficace et la plus durable.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Pornographie en ligne et adolescents : l'enjeu de l'éducation",
    longText: ART_PORNO,
    question: "Quel est l'âge moyen de première exposition à la pornographie en France selon ces études ?",
    optionA: "8 ans.",
    optionB: "11 ans.",
    optionC: "13 ans.",
    optionD: "15 ans.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Pornographie en ligne et adolescents : l'enjeu de l'éducation",
    longText: ART_PORNO,
    question: "Quelle sanction risquent les plateformes qui ne respectent pas les obligations de vérification d'âge ?",
    optionA: "Une interdiction temporaire de fonctionnement.",
    optionB: "Une amende pouvant atteindre 4 % de leur chiffre d'affaires mondial.",
    optionC: "Un avertissement public.",
    optionD: "Une obligation de fermeture dans les pays européens.",
    correctAnswer: 'B',
  }));

  const ART_PARENTALITE =
`La parentalité positive, née dans les années 1970 avec les travaux du psychologue Thomas Gordon, connaît un regain d'intérêt significatif en France. Cette approche prône l'établissement de limites claires accompagnées de bienveillance, en évitant à la fois la punition physique et la permissivité totale.

Des études longitudinales menées sur plusieurs décennies montrent des résultats robustes : les enfants élevés selon ces principes présentent davantage de confiance en eux, de meilleures compétences sociales et moins de comportements agressifs à l'adolescence. Leur réussite scolaire est également supérieure à la moyenne.

Pourtant, la parentalité positive est parfois mal comprise. Certains parents confondent bienveillance et absence de limites, ce qui peut conduire à des effets inverses. Les experts insistent sur le fait que la clé est la cohérence : des règles claires, expliquées et appliquées de façon constante.

Des formations gratuites aux techniques de parentalité positive sont proposées par de nombreuses associations et certaines caisses d'allocations familiales, avec des résultats encourageants sur la réduction des conflits familiaux.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Parentalité positive : des résultats validés par la science",
    longText: ART_PARENTALITE,
    question: "Quand la parentalité positive a-t-elle été théorisée ?",
    optionA: "Dans les années 1950.",
    optionB: "Dans les années 1970.",
    optionC: "Dans les années 1990.",
    optionD: "Dans les années 2000.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Parentalité positive : des résultats validés par la science",
    longText: ART_PARENTALITE,
    question: "Selon les experts, quelle est la clé de la parentalité positive ?",
    optionA: "L'absence totale de règles.",
    optionB: "La cohérence dans l'application de règles claires.",
    optionC: "La permissivité accompagnée d'amour.",
    optionD: "La punition appliquée sans explication.",
    correctAnswer: 'B',
  }));

  return qs;
}

async function main() {
  const connectionString = (process.env.DATABASE_URL || '')
    .replace('sslmode=require', 'sslmode=no-verify')
    .replace(':6543/', ':5432/');

  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  try {
    const deleted = await prisma.question.deleteMany({ where: { seriesId: SERIES_ID } });
    console.log(`🗑  ${deleted.count} question(s) supprimée(s).`);

    const questions = buildQuestions();
    console.log(`📝 Insertion de ${questions.length} questions…`);

    let inserted = 0;
    for (const data of questions) {
      await prisma.question.create({ data });
      process.stdout.write(`\r   ✓ Q${data.questionOrder} insérée`);
      inserted++;
    }

    console.log(`\n✅ ${inserted} questions créées pour CE 39.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
