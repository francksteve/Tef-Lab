'use strict';
/**
 * seed-ce-serie40.js
 * Peuple la série CE 40 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie40.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyokz800100wxllrp6xo34';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire : « Cette entreprise réalise l'essentiel de son activité annuelle
   dès le premier trimestre, les autres étant très faibles. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [90, 25, 22, 28], color: '#003087' },  // CORRECT — quasi tout en Q1
    { label: 'Graphique 2', data: [40, 55, 72, 90], color: '#E30613' },  // croissance
    { label: 'Graphique 3', data: [50, 50, 50, 50], color: '#E30613' },  // stable
    { label: 'Graphique 4', data: [40, 90, 45, 42], color: '#E30613' },  // pic Q2
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const quarters = ['T1', 'T2', 'T3', 'T4'];
  const maxVal   = 100;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW  = 50;
    const gap   = (plotW - 4 * barW) / 5;

    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx  = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh  = Math.max(((v / maxVal) * plotH), 2).toFixed(1);
      const by  = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx  = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${quarters[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Ventes (unités)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawBarChart(g, positions[i].cx, positions[i].cy)).join('') +
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
`ATELIER AQUARELLE « COULEURS D'EAU »

Animé par Isabelle Trévoux, artiste plasticienne

Niveaux : débutant (mardi 14 h) | intermédiaire (jeudi 14 h) | avancé (samedi 10 h)
Matériel inclus : papier aquarelle, pinceaux de base, palette. Pigments professionnels fournis.

Expositions collectives : participation à deux expositions annuelles (mai et décembre)
Tarif mensuel : 65 € (2 séances/semaine) | 40 € (1 séance/semaine)

Inscription : isabelletrevoux.art | Essai gratuit possible sur demande`,
    question: "Quel avantage est mentionné pour les participants à l'atelier ?",
    optionA: "Un voyage artistique annuel.",
    optionB: "Un cours privé mensuel.",
    optionC: "Participation à des expositions collectives.",
    optionD: "Un certificat d'arts plastiques.",
    correctAnswer: 'C',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`COVOITURAGE ENTREPRISE — RÈGLEMENT DU PROGRAMME

Inscription : via l'application mobile interne CovoitPro (téléchargeable sur l'intranet)
Trajets proposés : domicile-travail uniquement, dans un rayon de 50 km du site

Fonctionnement : chaque trajet accompli génère des crédits covoiturage convertibles en bons d'achat (1 crédit = 1 €)
Conducteurs et passagers accumulent des crédits à chaque trajet.
Parking sécurisé réservé : 10 places dédiées aux covoitureurs identifiés.

Charte d'utilisation : respect des horaires convenus, courtoisie, interdiction de fumer dans le véhicule.`,
    question: "Comment les crédits covoiturage peuvent-ils être utilisés ?",
    optionA: "En réduction sur les transports en commun.",
    optionB: "En bons d'achat (1 crédit = 1 €).",
    optionC: "En jours de congé supplémentaires.",
    optionD: "En remboursement de carburant.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`CONCERT D'ORGUE EN CATHÉDRALE — PROGRAMME

Vendredi 7 juin — 20 h 30
Cathédrale Saint-Étienne, Metz

Programme :
• J.S. Bach — Toccata et Fugue en ré mineur BWV 565
• C. Franck — Choral n° 3 en la mineur
• O. Messiaen — La Nativité du Seigneur (extraits)
• L. Vierne — Carillon de Westminster

Interprète : Nicolas Claessens, titulaire des grandes orgues

Entrée libre — Dons pour la restauration de l'orgue bienvenus
Programme complet : cathedrale-metz.fr`,
    question: "Comment peut-on entrer à ce concert ?",
    optionA: "Sur réservation obligatoire.",
    optionB: "Sur présentation d'un billet payant.",
    optionC: "Librement, entrée gratuite.",
    optionD: "Sur invitation uniquement.",
    correctAnswer: 'C',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`GLACIER ARTISANAL « DOLCE VITA »

Parfums du moment (en boules) :
Stracciatella, pistache de Sicile, fraise gariguette, citron de Menton, vanille bourbon Madagascar, caramel beurre salé, chocolat noir 72 %

Coupes spéciales :
• Coupe « Méditerranée » — 3 boules, fruits frais, coulis citron — 7,50 €
• Coupe « Dolce » — 2 boules, chantilly, praliné, tuile — 6 €
Sorbets : mangue, passion, cassis, pêche de vigne
Boissons chaudes : café, thé, chocolat viennois

Ouvert tous les jours de 10 h à 21 h 30 (fermeture novembre-mars)`,
    question: "Quel est le prix de la coupe « Méditerranée » ?",
    optionA: "5 €.",
    optionB: "6 €.",
    optionC: "7,50 €.",
    optionD: "9 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`TRAMPOLINE DE JARDIN FUNBOUNCE 3,05 M — GUIDE D'INSTALLATION ET D'ENTRETIEN

Montage : 2 adultes minimum requis. Temps estimé : 3 h. Outillage fourni dans la boîte.
Emplacement : installer sur pelouse plane, à au moins 2 m de tout obstacle (mur, clôture, arbres).
Sécurité : le filet de sécurité doit être installé avant toute utilisation. Poids max par saut : 150 kg.
Entretien : vérifier l'état des ressorts et des sangles avant chaque saison. Ranger le trampoline ou le couvrir en cas de gel.
Utilisation enfants : enfants de moins de 6 ans interdits. Jamais plusieurs enfants en même temps.`,
    question: "Quelle précaution doit-on prendre avant l'hiver ?",
    optionA: "Démonter complètement le trampoline.",
    optionB: "Le ranger ou le couvrir en cas de gel.",
    optionC: "Graisser les ressorts avec de l'huile.",
    optionD: "Entourer le trampoline d'une bâche imperméable.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`MAISON DES ARTS ET MÉTIERS — PROGRAMME OCTOBRE-NOVEMBRE

EXPOSITIONS :
• « Patrimoine de demain » — photos de chantiers de restauration (jusqu'au 10 nov., gratuit)
• « Design industriel » — objets du XXe siècle (entrée : 5 €)

ATELIERS (inscription obligatoire) :
• Vitrail initiation — 3 samedis consécutifs — 45 €
• Ébénisterie découverte — 1 weekend — 90 €
BIBLIOTHÈQUE spécialisée : ouverte mardi et jeudi de 14 h à 18 h
BILLETTERIE : en ligne ou sur place (espèces et CB acceptés)`,
    question: "Quelle exposition est gratuite ?",
    optionA: "« Design industriel ».",
    optionB: "« Patrimoine de demain ».",
    optionC: "Les deux expositions.",
    optionD: "Aucune des deux.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`Chers habitants du quartier des Peupliers,

L'association de quartier « Vivre Ensemble » vous invite à participer à l'organisation de la fête de fin d'année qui se tiendra le samedi 20 décembre à partir de 17 h dans le gymnase municipal.

Au programme : repas partagé (chaque famille apporte un plat), animations pour les enfants, tombola solidaire dont les bénéfices seront reversés à une famille dans le besoin.

Pour aider à l'organisation, venez nombreux à notre réunion préparatoire le mercredi 5 décembre à 19 h à la salle des fêtes. Votre aide sera précieuse !

L'équipe de Vivre Ensemble`,
    question: "Quel est le but de la tombola solidaire ?",
    optionA: "Financer de nouveaux équipements pour le gymnase.",
    optionB: "Rémunérer les bénévoles de l'association.",
    optionC: "Reverser les bénéfices à une famille dans le besoin.",
    optionD: "Acheter des cadeaux pour les enfants.",
    correctAnswer: 'C',
  }));

  /* ── Q8-13 ──────────────────────────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La réunion a débuté avec un ___ de 15 minutes en raison d'un problème technique avec le projecteur.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "repos",
    optionB: "retard",
    optionC: "résumé",
    optionD: "rapport",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour obtenir ce poste, vous devez être ___ en anglais, en espagnol et idéalement en mandarin.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "traduit",
    optionB: "formé",
    optionC: "compétent",
    optionD: "courant",
    correctAnswer: 'D',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La direction a décidé de ___ les horaires d'ouverture du restaurant d'entreprise jusqu'à 19 h.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "réduire",
    optionB: "prolonger",
    optionC: "fermer",
    optionD: "améliorer",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce projet innovant a ___ l'intérêt de nombreux investisseurs lors du salon technologique.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "perdu",
    optionB: "oublié",
    optionC: "suscité",
    optionD: "refusé",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les résidents de ce quartier se plaignent régulièrement des ___ sonores provenant du bar voisin.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "problèmes",
    optionB: "nuisances",
    optionC: "dommages",
    optionD: "troubles",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La conférence a réuni plus de 500 participants venus de 30 pays différents pour ___ des solutions au réchauffement climatique.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "ignorer",
    optionB: "débattre de",
    optionC: "éviter",
    optionD: "exporter",
    correctAnswer: 'B',
  }));

  /* ── Q14-17 ──────────────────────────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "L'intelligence émotionnelle est la capacité à [14] et à gérer ses propres émotions, mais aussi à [15] celles des autres. Cette compétence est aujourd'hui considérée comme aussi importante que le quotient intellectuel dans le milieu professionnel.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'intelligence émotionnelle",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "cacher",
    optionB: "reconnaître",
    optionC: "ignorer",
    optionD: "partager",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'intelligence émotionnelle",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "transmettre",
    optionB: "négliger",
    optionC: "comprendre",
    optionD: "provoquer",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le vieillissement de la population pose de nouveaux défis aux systèmes de [16] dans les pays développés. Pour [17] l'équilibre financier des régimes de retraite, de nombreux gouvernements envisagent de repousser l'âge légal de départ.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Les retraites',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "transport",
    optionB: "retraite",
    optionC: "logement",
    optionD: "formation",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Les retraites',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "briser",
    optionB: "menacer",
    optionC: "préserver",
    optionD: "ignorer",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Appartement A', content: "Studio meublé 28 m² — Paris 11e. Kitchenette simple, wifi. Pas d'espace de travail dédié. Idéal pour week-ends. Tarif nuit : 95 €." },
    { title: 'Appartement B', content: "T1 35 m² — Lyon Part-Dieu. Accès wifi ultra-rapide, imprimante disponible. Pas de bureau séparé. Kitchenette équipée. Tarif nuit : 85 €." },
    { title: 'Appartement C', content: "Studio affaires 32 m² — Bordeaux centre. Coin cuisine, wifi fibre. Pas d'espace dédié au travail. Proche transports. Tarif nuit : 80 €." },
    { title: 'Appartement D', content: "Appartement affaires 50 m² — Toulouse. Bureau séparé avec écran externe, imprimante, webcam HD. Cuisine équipée, machine à café. Wifi 1 Gbps. Idéal pour séjours d'affaires prolongés. Tarif nuit : 130 €." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel appartement inclut un espace de travail dédié ?",
    optionA: "Appartement A",
    optionB: "Appartement B",
    optionC: "Appartement C",
    optionD: "Appartement D",
    correctAnswer: 'D',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Activité A', content: "Voile initiation — Lac de l'Eau d'Heure. Licence de la Fédération Française de Voile requise. Matériel fourni. Sessions week-ends. Tarif : 55 €/pers." },
    { title: 'Activité B', content: "Pêche en lac — accès libre aux rives publiques. Carte de pêche et hameçon fournis. Pas de licence sportive nécessaire. Tarif journée : 15 €." },
    { title: 'Activité C', content: "Kayak de mer — Côte Atlantique. Pas de licence requise. Gilets et pagaies fournis. Niveau débutant accepté. Tarif : 35 €/pers." },
    { title: 'Activité D', content: "Planche à voile initiation — lac. Matériel fourni. Moniteur diplômé. Pas de licence sportive exigée. Tarif : 45 €." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle activité nécessite une licence sportive ?",
    optionA: "Activité A",
    optionB: "Activité B",
    optionC: "Activité C",
    optionD: "Activité D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Poste 1', content: "Analyste investissements — Banque Privée Atlantis. Gestion de portefeuilles clients. Bonus annuel garanti : 10 % du salaire. Télétravail 2j/semaine. Salaire : 65 000 €." },
    { title: 'Poste 2', content: "Gestionnaire sinistres — Assurance Generali. Traitement des déclarations, expertise terrain. Pas de bonus annuel fixe. Voiture de service. Salaire : 42 000 €." },
    { title: 'Poste 3', content: "Responsable conformité — Cabinet de gestion d'actifs. Bonus annuel supérieur à 20 % du salaire fixe selon performance. Télétravail 3j/semaine. Salaire : 78 000 €." },
    { title: 'Poste 4', content: "Conseiller patrimonial — Réseau bancaire régional. Commission sur ventes, pas de bonus annuel garanti. Voiture de fonction. Salaire fixe : 38 000 €." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste propose un bonus supérieur à 20% du salaire ?",
    optionA: "Poste 1",
    optionB: "Poste 2",
    optionC: "Poste 3",
    optionD: "Poste 4",
    correctAnswer: 'C',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Produit A', content: "Diffuseur ultrasonique 300 mL — Minuterie 1h/3h. Compatible huiles essentielles. Veilleuse LED 7 couleurs. Certifié CE. Huiles essentielles non incluses. Prix : 29 €." },
    { title: 'Produit B', content: "Bougies parfumées naturelles — Lot de 3 bougies cire de soja. Certifiées huiles essentielles 100% pures. Aucun parfum de synthèse. Mèche coton naturel. Prix : 24 €." },
    { title: 'Produit C', content: "Brumisateur visage — Eau thermale 50 mL. Pratique voyage. Pas de certification HE. Plusieurs senteurs disponibles. Prix : 12 €." },
    { title: 'Produit D', content: "Coffret bien-être — 5 huiles essentielles non certifiées + diffuseur. Idéal cadeau. Prix : 45 €." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel produit est certifié huiles essentielles 100% pures ?",
    optionA: "Produit A",
    optionB: "Produit B",
    optionC: "Produit C",
    optionD: "Produit D",
    correctAnswer: 'B',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Cette entreprise réalise l'essentiel de son activité annuelle dès le premier trimestre, les autres étant très faibles.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_FORMATION =
`RÈGLEMENT — CONGÉ DE FORMATION SALARIÉ (CPF/CIF)

Les salariés peuvent bénéficier d'un congé pour suivre une formation professionnelle qualifiante.

CPF (Compte Personnel de Formation) : chaque salarié dispose d'un compte CPF crédité en euros chaque année. Les formations éligibles sont listées sur le site officiel moncompteformation.gouv.fr.
Durée : la formation peut durer de quelques heures à plusieurs années selon la qualification visée.
Rémunération : le salarié est rémunéré pendant la formation (à hauteur de 90 % du salaire de référence).
Retour au poste : le salarié retrouve son poste ou un poste équivalent à l'issue de la formation.
Délai de demande : la demande doit être soumise au moins 60 jours avant le début de la formation (120 jours pour les formations de plus de 6 mois).`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Congé de formation salarié",
    longText: DOC_FORMATION,
    question: "À quel pourcentage de son salaire le salarié est-il rémunéré pendant la formation ?",
    optionA: "70 %.",
    optionB: "80 %.",
    optionC: "90 %.",
    optionD: "100 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Congé de formation salarié",
    longText: DOC_FORMATION,
    question: "Quel délai minimum de demande s'applique aux formations de plus de 6 mois ?",
    optionA: "30 jours.",
    optionB: "60 jours.",
    optionC: "90 jours.",
    optionD: "120 jours.",
    correctAnswer: 'D',
  }));

  const DOC_360 =
`NOTE — ÉVALUATION 360 DEGRÉS

L'évaluation 360 degrés permet d'obtenir un retour complet sur les compétences et les comportements professionnels d'un collaborateur.

Participants : le collaborateur évalué, son manager, ses pairs (collègues de même niveau), ses collaborateurs directs et éventuellement des clients internes.
Grille : un questionnaire de 40 items couvrant les compétences relationnelles, managériales, techniques et organisationnelles.
Anonymat : toutes les réponses (sauf celle du manager) sont anonymes et agrégées. Les résultats individuels ne sont pas communiqués.
Feedback : un entretien de restitution est organisé entre le collaborateur et son manager pour construire un plan de développement.
Fréquence : tous les deux ans pour tous les cadres.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Évaluation 360 degrés",
    longText: DOC_360,
    question: "Dont les réponses ne sont PAS anonymes dans l'évaluation 360 ?",
    optionA: "Les pairs.",
    optionB: "Les collaborateurs directs.",
    optionC: "Le manager.",
    optionD: "Les clients internes.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Évaluation 360 degrés",
    longText: DOC_360,
    question: "À quelle fréquence l'évaluation 360 est-elle réalisée pour les cadres ?",
    optionA: "Chaque année.",
    optionB: "Tous les deux ans.",
    optionC: "Tous les trois ans.",
    optionD: "À la demande.",
    correctAnswer: 'B',
  }));

  const DOC_COOPERATION =
`CHARTE DE COOPÉRATION TERRITORIALE

Cette charte engage les acteurs économiques, sociaux et institutionnels du territoire dans un projet commun de développement durable.

Partenaires signataires : collectivités locales, chambres de commerce, associations, entreprises et établissements d'enseignement.
Gouvernance : un comité de pilotage se réunit trimestriellement pour évaluer les avancées. Chaque partenaire y dispose d'une voix.
Ressources : un fonds commun de 200 000 € est constitué annuellement par les contributions des signataires. Sa gestion est confiée à un tiers de confiance.
Évaluation : un bilan annuel est présenté à l'assemblée plénière des partenaires. Les objectifs non atteints font l'objet d'un plan correctif.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de coopération territoriale",
    longText: DOC_COOPERATION,
    question: "À quelle fréquence le comité de pilotage se réunit-il ?",
    optionA: "Mensuellement.",
    optionB: "Trimestriellement.",
    optionC: "Semestriellement.",
    optionD: "Annuellement.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de coopération territoriale",
    longText: DOC_COOPERATION,
    question: "Quel est le montant du fonds commun constitué chaque année ?",
    optionA: "100 000 €.",
    optionB: "150 000 €.",
    optionC: "200 000 €.",
    optionD: "500 000 €.",
    correctAnswer: 'C',
  }));

  const DOC_CUMUL =
`GUIDE — CUMUL D'EMPLOIS : CONDITIONS ET AUTORISATIONS

Un salarié peut exercer plusieurs activités professionnelles simultanément, sous certaines conditions.

Conditions générales : ne pas dépasser la durée légale maximale de travail (48 h/semaine ou 44 h en moyenne sur 12 semaines). Respecter les obligations de repos quotidien (11 h) et hebdomadaire (35 h).
Déclarations : le salarié doit informer chaque employeur de l'existence de ses autres activités. La dissimulation est assimilée à une faute.
Déontologie : certaines professions réglementées (fonctionnaires, professions médicales) ont des règles spécifiques sur le cumul.
Limites : la concurrence déloyale avec l'employeur principal est interdite et peut entraîner licenciement pour faute grave.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide — Cumul d'emplois : conditions et autorisations",
    longText: DOC_CUMUL,
    question: "Quelle est la durée maximale de travail hebdomadaire autorisée en cas de cumul d'emplois ?",
    optionA: "35 heures.",
    optionB: "40 heures.",
    optionC: "44 heures.",
    optionD: "48 heures.",
    correctAnswer: 'D',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide — Cumul d'emplois : conditions et autorisations",
    longText: DOC_CUMUL,
    question: "Que risque un salarié qui cache ses autres activités à son employeur ?",
    optionA: "Une réduction de salaire.",
    optionB: "Une mise à pied.",
    optionC: "C'est assimilé à une faute.",
    optionD: "Un avertissement oral.",
    correctAnswer: 'C',
  }));

  const DOC_FICHE_POSTE =
`PROCÉDURE — RÉVISION DES FICHES DE POSTE

Les fiches de poste doivent être maintenues à jour pour refléter fidèlement les missions réelles des salariés.

Déclencheurs de révision : réorganisation de service, nouvelles missions confiées, changement de rattachement hiérarchique, évolution technologique majeure.
Processus : le manager initie la révision et propose un nouveau texte en concertation avec le salarié. Le document est ensuite validé par le DRH.
Délai de validation : 15 jours ouvrables après soumission.
Communication : la fiche révisée est remise en main propre au salarié et archivée dans le dossier RH. Le salarié signe pour réception.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Procédure — Révision des fiches de poste",
    longText: DOC_FICHE_POSTE,
    question: "Qui initie la révision de la fiche de poste ?",
    optionA: "Le salarié.",
    optionB: "Le manager.",
    optionC: "Le DRH.",
    optionD: "Le comité social et économique.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Procédure — Révision des fiches de poste",
    longText: DOC_FICHE_POSTE,
    question: "Quel est le délai de validation d'une fiche de poste révisée ?",
    optionA: "5 jours ouvrables.",
    optionB: "10 jours ouvrables.",
    optionC: "15 jours ouvrables.",
    optionD: "30 jours ouvrables.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 ──────────────────────────────────────────────────────────── */

  const ART_SOLAIRE =
`La démocratisation des panneaux solaires photovoltaïques s'accélère en France. Le coût d'installation d'une centrale de 3 kWc (kilowatts-crête), suffisante pour une maison individuelle, est passé de 15 000 € en 2010 à environ 6 500 € en 2024, grâce aux progrès technologiques et à l'effet d'échelle industrielle.

Les aides publiques facilitent l'investissement : la prime à l'autoconsommation, le crédit d'impôt et les offres des collectivités locales permettent dans certains cas de réduire la facture de 30 à 50 %. La durée de retour sur investissement est estimée à 8 à 12 ans selon l'ensoleillement et les habitudes de consommation.

L'installation doit être réalisée par un professionnel certifié RGE (Reconnu Garant de l'Environnement). Sans cette certification, les aides ne sont pas accessibles.

Des options comme le stockage par batterie domestique ou la revente du surplus à EDF OA permettent d'optimiser encore davantage la rentabilité. Mais le stockage reste coûteux : une batterie de 5 kWh représente un investissement supplémentaire de 3 000 à 5 000 €.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Panneaux solaires : rentabilité et aides pour les particuliers",
    longText: ART_SOLAIRE,
    question: "Quelle était le coût moyen d'une centrale solaire de 3 kWc en 2024 ?",
    optionA: "3 500 €.",
    optionB: "6 500 €.",
    optionC: "10 000 €.",
    optionD: "15 000 €.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Panneaux solaires : rentabilité et aides pour les particuliers",
    longText: ART_SOLAIRE,
    question: "Quelle certification est obligatoire pour accéder aux aides publiques ?",
    optionA: "ISO 9001.",
    optionB: "Certifié photovoltaïque nationale.",
    optionC: "RGE (Reconnu Garant de l'Environnement).",
    optionD: "Label Qualibat.",
    correctAnswer: 'C',
  }));

  const ART_MEDIAS =
`La survie économique des médias indépendants est devenue une question centrale dans le débat démocratique. Face à la concentration des groupes de presse dans les mains de quelques milliardaires, les titres indépendants cherchent des modèles économiques viables pour continuer à exercer leur mission d'information.

Le financement par les lecteurs — abonnements numériques, dons, financement participatif — s'est développé avec succès pour des titres comme Mediapart ou Le Média. Cette approche garantit une indépendance éditoriale totale vis-à-vis des actionnaires et des annonceurs.

La presse en ligne connaît néanmoins une crise structurelle : la publicité numérique est captée à 70 % par Google et Meta, laissant les éditeurs indépendants avec des ressources publicitaires dérisoires. Les abonnements sont une alternative, mais le lectorat reste sensible au prix.

Des soutiens publics — aides à la presse, fonds de développement — existent mais sont souvent jugés insuffisants et conditionnés à des critères qui favorisent les titres déjà établis.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Médias indépendants : les nouveaux modèles de survie économique",
    longText: ART_MEDIAS,
    question: "Quel pourcentage de la publicité numérique est capté par Google et Meta ?",
    optionA: "40 %.",
    optionB: "50 %.",
    optionC: "60 %.",
    optionD: "70 %.",
    correctAnswer: 'D',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Médias indépendants : les nouveaux modèles de survie économique",
    longText: ART_MEDIAS,
    question: "Quel principal avantage le financement par les lecteurs procure-t-il aux médias ?",
    optionA: "Une couverture nationale plus large.",
    optionB: "Une indépendance éditoriale totale.",
    optionC: "Une réduction des coûts de production.",
    optionD: "Un accès facilité aux sources officielles.",
    correctAnswer: 'B',
  }));

  const ART_DROGUES =
`Le Portugal a dépénalisé la détention et l'usage personnel de toutes les drogues en 2001. Cette réforme radicale, unique en Europe, a transformé le problème de la drogue d'une question pénale en une question de santé publique. Vingt ans après, les résultats sont salués par de nombreux experts internationaux.

Le nombre de nouveaux cas d'infection au VIH liés à l'usage de drogues injectées est passé de 52 % des nouveaux cas en 2000 à moins de 10 % en 2019. Les décès liés aux surdoses ont fortement diminué, et le nombre de détenus pour délit de consommation est quasi nul.

Ce modèle suscite un intérêt croissant en France, où le débat sur la dépénalisation du cannabis s'intensifie. Les partisans avancent que la répression coûte cher, est inefficace et stigmatise les usagers sans réduire la consommation. Les opposants craignent un signal permissif et une augmentation de la consommation, notamment chez les jeunes.

La légalisation du cannabis récréatif, adoptée dans plusieurs États américains et au Canada, constitue un autre modèle, plus radical, qui permet de réguler et de taxer le marché.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Drogues et dépénalisation : le modèle portugais en débat",
    longText: ART_DROGUES,
    question: "En quelle année le Portugal a-t-il dépénalisé l'usage personnel de toutes les drogues ?",
    optionA: "1995.",
    optionB: "1998.",
    optionC: "2001.",
    optionD: "2005.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Drogues et dépénalisation : le modèle portugais en débat",
    longText: ART_DROGUES,
    question: "Quel argument avancent les partisans de la dépénalisation en France ?",
    optionA: "La répression est coûteuse et inefficace.",
    optionB: "La consommation diminuerait avec la légalisation.",
    optionC: "Les recettes fiscales couvriraient les coûts sanitaires.",
    optionD: "Les jeunes seraient moins tentés par l'interdit.",
    correctAnswer: 'A',
  }));

  const ART_VILLES_PORTS =
`Les grandes villes portuaires européennes vivent une mutation économique et urbaine profonde. Longtemps cœurs industriels et logistiques, ces cités font face à la désindustrialisation de leurs quais, transformant des espaces autrefois ouvriers en projets urbains mixtes mêlant culture, tourisme et nouveaux services.

Hambourg, Barcelone et Marseille illustrent ces trajectoires différenciées. À Hambourg, la reconversion du quartier HafenCity a attiré des sièges sociaux et des musées de classe mondiale. À Barcelone, le Vieux Port est devenu un pôle touristique et de loisirs de premier plan. À Marseille, Euroméditerranée combine logements, bureaux et espaces culturels.

Mais ces transformations suscitent des tensions. La montée des loyers dans les quartiers réhabilités chasse les anciens habitants et les activités artisanales. La gentrification des fronts de mer est critiquée par des associations de défense du patrimoine ouvrier.

La logistique portuaire, de son côté, continue d'évoluer vers l'automatisation et l'agrandissement des terminaux, repoussant les activités industrielles toujours plus loin des centres-villes et modifiant durablement l'économie locale.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Villes portuaires : entre désindustrialisation et renaissance culturelle",
    longText: ART_VILLES_PORTS,
    question: "Qu'est devenu le quartier HafenCity à Hambourg ?",
    optionA: "Un quartier résidentiel populaire.",
    optionB: "Un pôle de sièges sociaux et musées de classe mondiale.",
    optionC: "Un parc naturel maritime.",
    optionD: "Un centre logistique automatisé.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Villes portuaires : entre désindustrialisation et renaissance culturelle",
    longText: ART_VILLES_PORTS,
    question: "Quelle critique principale est faite à ces transformations urbaines ?",
    optionA: "Le manque d'investissements culturels.",
    optionB: "La gentrification qui chasse les anciens habitants.",
    optionC: "L'absence de transports en commun adaptés.",
    optionD: "La pollution liée aux activités portuaires.",
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

    console.log(`\n✅ ${inserted} questions créées pour CE 40.`);

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
