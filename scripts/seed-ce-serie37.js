'use strict';
/**
 * seed-ce-serie37.js
 * Peuple la série CE 37 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie37.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyok9m000x0wxlqlnrviuo';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes hebdomadaires pour Q22
   Commentaire : « Les ventes de ce commerce atteignent leur maximum le samedi,
   avec un niveau presque deux fois supérieur aux jours de semaine. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [100, 105, 102, 108, 120, 200, 180], color: '#003087' },  // CORRECT — pic samedi
    { label: 'Graphique 2', data: [200, 180, 150, 120, 90, 80, 70], color: '#E30613' },     // déclin semaine
    { label: 'Graphique 3', data: [100, 100, 100, 100, 100, 100, 100], color: '#E30613' },  // stable
    { label: 'Graphique 4', data: [80, 100, 120, 140, 160, 140, 120], color: '#E30613' },   // pic vendredi
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const maxVal = 220;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const n = g.data.length;
    const sx = i => (plotX + (i / (n - 1)) * plotW).toFixed(1);
    const sy = v => (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
    const pts = g.data.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
    const gridLines = [0, 55, 110, 165, 220].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');
    const xlab = days.map((d, i) =>
      `<text x="${sx(i)}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${d}</text>`
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
`JOURNÉE DE SOLIDARITÉ INTERGÉNÉRATIONNELLE
Samedi 22 mars — Centre socioculturel de la Bastide

Programme :
• 9 h : Ateliers mixtes (couture, cuisine, informatique, jardinage) — groupes de 6 pers. max
• 12 h 30 : Repas partagé — apportez un plat ou une boisson à partager
• 14 h 30 : Jeux de société grands groupes, quiz sur l'histoire locale
• 16 h : Présentation des œuvres réalisées le matin

Appel aux bénévoles : nous recherchons 20 bénévoles pour l'organisation et l'animation.
Inscription : solidarity@centrebastide.fr | Entrée libre`,
    question: "Que doivent apporter les participants au repas partagé ?",
    optionA: "Une pièce d'identité.",
    optionB: "Un plat ou une boisson.",
    optionC: "Leur repas personnel emballé.",
    optionD: "Un don pour l'association.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`CLUB D'ÉCHECS DE MONTPELLIER — RÈGLEMENT GÉNÉRAL

Adhésion : 40 €/an — Ouverts à tous, débutants bienvenus (cours hebdomadaire inclus)
Tournois internes : tous les premiers dimanches du mois — participation gratuite pour les membres

Classement Elo : les tournois homologués permettent d'obtenir ou d'améliorer son classement Elo national.
Débutants : les séances d'initiation ont lieu chaque mercredi de 18 h à 20 h. Matériel fourni.

Invités : tout membre peut inviter un tiers deux fois par an à titre gratuit. Au-delà, la participation à une séance est de 5 €.`,
    question: "Comment les débutants peuvent-ils apprendre à jouer ?",
    optionA: "En regardant les parties des membres avancés.",
    optionB: "Lors des séances d'initiation du mercredi.",
    optionC: "Uniquement lors des tournois mensuels.",
    optionD: "Par correspondance avec le président du club.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`MARCHÉ ARTISANAL DE NOËL — PLACE DU CAPITOLE

Du 6 au 24 décembre — Vendredi 16 h – 22 h / Samedi-Dimanche 10 h – 22 h

Plus de 80 créateurs locaux : bijoux, céramique, maroquinerie, décorations, cosmétiques naturels

Animations : concerts acoustiques chaque soir à 18 h
Espace restauration : vin chaud, tartiflette, churros

Entrée gratuite — Stationnement conseillé : parking Wilson (20 min à pied)`,
    question: "À quelle heure démarrent les concerts du marché ?",
    optionA: "16 h.",
    optionB: "18 h.",
    optionC: "20 h.",
    optionD: "22 h.",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`BOUCHERIE-TRAITEUR MAISON PELLETIER

VIANDES : bœuf charolais, agneau fermier, veau de lait, volailles Label Rouge
PLATS CUISINÉS : bourguignon maison, blanquette de veau, poule au pot, terrine du chef

Commandes spéciales (repas de famille, événements) : à passer 72 h à l'avance
Prix : à partir de 12 €/personne pour les plats cuisinés

Livraison à domicile : mardi et vendredi matin (rayon 15 km)
Horaires : mardi-samedi 8 h – 13 h | 16 h – 19 h`,
    question: "Quel délai faut-il respecter pour passer une commande spéciale ?",
    optionA: "24 heures.",
    optionB: "48 heures.",
    optionC: "72 heures.",
    optionD: "1 semaine.",
    correctAnswer: 'C',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`GRILLE-PAIN MULTIFONCTION TOASTPRO 4 TRANCHES

Réglages : 6 niveaux de dorage (molette graduée)
Fonctions : pain toast, baguette, bagel, réchauffage, décongélation
Accessoires inclus : ramasse-miettes extractible, pince bois, prise pour panini (vendu séparément)
Entretien : vider le plateau ramasse-miettes après chaque utilisation. Corps inox : essuyer avec un chiffon humide.
Sécurité : coupure automatique si l'élément chauffe. Ne jamais introduire d'ustensile métallique.

Garantie : 2 ans pièces et main-d'œuvre`,
    question: "Que faut-il faire après chaque utilisation pour entretenir cet appareil ?",
    optionA: "Laver le corps à l'eau.",
    optionB: "Vider le plateau ramasse-miettes.",
    optionC: "Huiler les résistances.",
    optionD: "Démonter les éléments chauffants.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`CENTRE CULTUREL MUNICIPAL — PROGRAMME OCTOBRE

EXPOSITIONS :
• « Mémoires de pierre » — photographies de l'architecte J. Maret — jusqu'au 15 nov. — gratuit

MÉDIATHÈQUE : ouverte mardi-samedi 10 h – 18 h | prêt de livres, BD, DVD, jeux vidéo

ATELIERS : poterie (jeudi 19 h), aquarelle (samedi 10 h), écriture créative (mardi 20 h)
Inscription ateliers : 15 €/séance ou abonnement mensuel 45 €

CINÉMA : projection chaque vendredi à 20 h — 6 € / réduit 4 €`,
    question: "Quel est le prix réduit pour la projection du vendredi soir ?",
    optionA: "2 €.",
    optionB: "4 €.",
    optionC: "6 €.",
    optionD: "8 €.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`Madame la Directrice des archives,

Par la présente, je me permets de solliciter la communication des actes d'état civil suivants :
- Extrait d'acte de naissance (avec filiation) pour M. Édouard Bastien, né le 12 mars 1978
- Copie intégrale du mariage contracté le 4 juin 2005

Ces documents me sont nécessaires dans le cadre d'une procédure de succession.

Je vous prie de bien vouloir me faire parvenir ces documents par voie postale à l'adresse indiquée ci-dessous dans les meilleurs délais.

Dans l'attente de votre réponse favorable, veuillez agréer mes salutations distinguées.

M. Pierre-Alix Rousseau`,
    question: "Pourquoi M. Rousseau demande-t-il ces documents ?",
    optionA: "Pour une demande de passeport.",
    optionB: "Pour une procédure de succession.",
    optionC: "Pour un dossier d'inscription universitaire.",
    optionD: "Pour une démarche de naturalisation.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 ──────────────────────────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les deux équipes ont finalement ___ un match nul après une rencontre très disputée.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "joué",
    optionB: "perdu",
    optionC: "obtenu",
    optionD: "préparé",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce roman a été ___ en plus de vingt langues depuis sa publication en 2018.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "lu",
    optionB: "traduit",
    optionC: "vendu",
    optionD: "adapté",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour bénéficier de la remise, il est indispensable de ___ le code promo lors du paiement.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "oublier",
    optionB: "signaler",
    optionC: "saisir",
    optionD: "imprimer",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La réunion a dû être ___ en raison de l'absence de plusieurs membres clés du comité.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "annulée",
    optionB: "reportée",
    optionC: "tenue",
    optionD: "commencée",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les nouvelles recrues devront ___ une formation obligatoire de deux jours avant leur prise de poste.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refuser",
    optionB: "suivre",
    optionC: "préparer",
    optionD: "évaluer",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le musée est ___ tous les lundis et les jours fériés ; veuillez vérifier les horaires en ligne.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "ouvert",
    optionB: "réservé",
    optionC: "fermé",
    optionD: "déplacé",
    correctAnswer: 'C',
  }));

  /* ── Q14-17 ──────────────────────────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "Le vélo électrique connaît un succès [14] dans les villes françaises. De plus en plus de navetteurs l'adoptent pour leurs trajets domicile-travail, attirés par son côté pratique et sa capacité à [15] les embouteillages tout en réduisant leur empreinte carbone.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le vélo électrique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "limité",
    optionB: "croissant",
    optionC: "inattendu",
    optionD: "récent",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le vélo électrique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "créer",
    optionB: "provoquer",
    optionC: "éviter",
    optionD: "traverser",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La [16] des forêts tropicales est l'une des principales causes de la perte de biodiversité mondiale. Chaque année, des millions d'hectares disparaissent sous les coups des exploitations agricoles et minières, menaçant des [17] entiers d'extinction.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Déforestation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "préservation",
    optionB: "destruction",
    optionC: "déforestation",
    optionD: "plantation",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Déforestation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "territoires",
    optionB: "continents",
    optionC: "espèces",
    optionD: "humains",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Hébergement A', content: "Gîte rural 6 personnes — Ferme en activité avec élevage de chevaux. Activités à la ferme proposées : traite des vaches, collecte des œufs, balades à cheval. Location semaine : 800 €." },
    { title: 'Hébergement B', content: "Chambre d'hôte familiale — 2 chambres, 4 personnes. Petit-déjeuner inclus. Pas d'activités agricoles sur place. À 10 km du centre-ville. Tarif nuit : 85 €." },
    { title: 'Hébergement C', content: "Mas provençal — 8 personnes. Piscine privée, jardin. Location semaine en juillet-août : 2 200 €. Pas d'activités spécifiques proposées." },
    { title: 'Hébergement D', content: "Cabane dans les vignes — 2 personnes. Vue panoramique sur le vignoble. Dégustation de vins du domaine incluse. Tarif nuit : 150 €. Enfants non acceptés." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle maison propose des activités à la ferme ?",
    optionA: "Hébergement A",
    optionB: "Hébergement B",
    optionC: "Hébergement C",
    optionD: "Hébergement D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Activité A', content: "Escalade en falaise naturelle — Site des Calanques, Marseille. Tous niveaux. Guide certifié. Matériel fourni. Tarif journée : 65 €/pers." },
    { title: 'Activité B', content: "Escalade en salle climatisée — Centre Vertical, Lyon. Niveaux débutant à expert. Moniteur disponible. Accès libre ou cours encadré. Tarif entrée : 12 €." },
    { title: 'Activité C', content: "Via ferrata en montagne — Alpes, niveau intermédiaire. Encadrement guide. Départ de Chamonix. Équipement fourni. Tarif : 85 €/pers." },
    { title: 'Activité D', content: "Escalade nocturne en forêt — Parcours spécialement éclairé. Accès famille. Sortie tous les vendredis soirs. Tarif : 20 €/pers." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle activité se déroule en salle climatisée ?",
    optionA: "Activité A",
    optionB: "Activité B",
    optionC: "Activité C",
    optionD: "Activité D",
    correctAnswer: 'B',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Poste 1', content: "Infirmier(ère) en service de chirurgie — CHU de Bordeaux. Temps plein. Expérience 2 ans minimum. Astreintes de nuit obligatoires. Salaire selon grille FPH." },
    { title: 'Poste 2', content: "Aide-soignant(e) — EHPAD Les Mimosas. Poste de jour uniquement. Pas d'astreinte de nuit. Temps partiel possible. Salaire : 1 900 €/mois brut." },
    { title: 'Poste 3', content: "Masseur-kinésithérapeute libéral — Cabinet en association. Patientèle déjà constituée. Pas d'astreinte. Honoraires libres." },
    { title: 'Poste 4', content: "Médecin urgentiste — Centre Hospitalier de Gap. Garde de nuit 24 h/24. Rémunération attractive. Logement de fonction disponible." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste inclut des astreintes de nuit ?",
    optionA: "Poste 1",
    optionB: "Poste 2",
    optionC: "Poste 3",
    optionD: "Poste 4",
    correctAnswer: 'A',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Abonnement A', content: "SportStream 4K — Tous sports en direct, Liga, Ligue 1, Roland Garros, JO. Résolution 4K disponible sur Smart TV et PC. Prix : 24,99 €/mois." },
    { title: 'Abonnement B', content: "SportPass HD — Football et tennis en direct. Résolution HD uniquement. 3 écrans simultanés. Prix : 14,99 €/mois." },
    { title: 'Abonnement C', content: "Canal Sport — Football uniquement. Pas de 4K. 1 écran à la fois. Accès highlights. Prix : 8,99 €/mois." },
    { title: 'Abonnement D', content: "MultiSport — Rugby, basket, handball, athlétisme. HD. Pas de 4K. Replay illimité 7 jours. Prix : 12,99 €/mois." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel abonnement propose la diffusion en 4K ?",
    optionA: "Abonnement A",
    optionB: "Abonnement B",
    optionC: "Abonnement C",
    optionD: "Abonnement D",
    correctAnswer: 'A',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Les ventes de ce commerce atteignent leur maximum le samedi, avec un niveau presque deux fois supérieur aux jours de semaine.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_COOPTATION =
`RÈGLEMENT — PROGRAMME DE COOPTATION

Notre entreprise encourage ses collaborateurs à recommander des candidats pour les postes ouverts.

Prime : en cas d'embauche définitive du candidat recommandé, le coopteur reçoit une prime brute de 1 000 €. Elle est versée après la période d'essai validée du nouveau salarié.
Conditions : la recommandation doit être formalisée avant toute candidature officielle. Le coopteur ne peut pas être le manager direct du poste concerné.
Délai : la prime est versée le mois suivant la validation de la période d'essai.
Validation : toute cooptation doit être validée par le service RH. Un retour est systématiquement donné au coopteur sur les suites données.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Programme de cooptation",
    longText: DOC_COOPTATION,
    question: "Quand la prime de cooptation est-elle versée ?",
    optionA: "À la signature du contrat du nouveau salarié.",
    optionB: "Après validation de la période d'essai.",
    optionC: "Immédiatement après recommandation acceptée.",
    optionD: "À la fin de l'année civile.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Programme de cooptation",
    longText: DOC_COOPTATION,
    question: "Qui ne peut pas coopter pour un poste donné ?",
    optionA: "Un salarié en CDD.",
    optionB: "Un salarié du même service.",
    optionC: "Le manager direct du poste.",
    optionD: "Un salarié ayant moins de 6 mois d'ancienneté.",
    correctAnswer: 'C',
  }));

  const DOC_BUDGET_PART =
`NOTE — BUDGET PARTICIPATIF EMPLOYÉS

Objet : Lancement du budget participatif interne

Pour la première fois, tous les salariés sont invités à proposer des projets d'amélioration de l'environnement de travail.

Montant alloué : 30 000 € pour l'ensemble des projets sélectionnés.
Projets éligibles : améliorations du cadre de vie au bureau (espaces de repos, végétalisation, équipements sportifs, salle multimédia…). Les projets à caractère purement personnel ne sont pas éligibles.
Vote : tous les salariés participent au vote. Chaque employé dispose de 3 votes à répartir entre différents projets.
Réalisation : les projets retenus seront réalisés au cours du troisième trimestre.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Budget participatif employés",
    longText: DOC_BUDGET_PART,
    question: "Quel est le montant total alloué au budget participatif ?",
    optionA: "10 000 €.",
    optionB: "20 000 €.",
    optionC: "30 000 €.",
    optionD: "50 000 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Budget participatif employés",
    longText: DOC_BUDGET_PART,
    question: "Combien de votes chaque employé possède-t-il ?",
    optionA: "1.",
    optionB: "2.",
    optionC: "3.",
    optionD: "5.",
    correctAnswer: 'C',
  }));

  const DOC_CHARTE_ECO =
`CHARTE DE TRANSITION ÉCOLOGIQUE — Groupe Avenir

Notre groupe s'engage dans une démarche de réduction de son empreinte environnementale.

Réduction CO2 : objectif de réduction de 40 % des émissions de CO2 d'ici 2030, par rapport au niveau de 2022.
Reporting : un bilan carbone annuel est publié et accessible à tous les collaborateurs. Les objectifs intermédiaires sont suivis trimestriellement.
Fournisseurs : une clause environnementale est intégrée dans tous les nouveaux contrats fournisseurs. Les partenaires doivent fournir leur bilan carbone annuel.
Formation : tous les salariés suivront une formation « écogestes » de 4 heures d'ici fin 2025.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de transition écologique — Groupe Avenir",
    longText: DOC_CHARTE_ECO,
    question: "De combien l'entreprise vise-t-elle à réduire ses émissions de CO2 d'ici 2030 ?",
    optionA: "20 %.",
    optionB: "30 %.",
    optionC: "40 %.",
    optionD: "50 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de transition écologique — Groupe Avenir",
    longText: DOC_CHARTE_ECO,
    question: "Que doivent fournir les partenaires commerciaux selon cette charte ?",
    optionA: "Un plan d'action social.",
    optionB: "Une certification ISO 14001.",
    optionC: "Leur bilan carbone annuel.",
    optionD: "Un audit de leurs pratiques RH.",
    correctAnswer: 'C',
  }));

  const DOC_HANDICAP =
`GUIDE — EMPLOI DES TRAVAILLEURS EN SITUATION DE HANDICAP

L'AGEFIPH (Association de gestion du fonds pour l'insertion professionnelle des personnes handicapées) soutient les entreprises qui recrutent des travailleurs handicapés.

Aménagements : les employeurs peuvent obtenir des financements pour adapter les postes de travail (matériel spécifique, logiciels, aménagement de bureaux).
Accompagnement : un référent handicap est nommé dans toute entreprise de plus de 250 salariés. Il est l'interlocuteur privilégié des salariés concernés.
Quota légal : toute entreprise de plus de 20 salariés doit compter au moins 6 % de travailleurs handicapés dans ses effectifs, sous peine de contribution financière.
Reconnaissance : les démarches de Reconnaissance de la Qualité de Travailleur Handicapé (RQTH) sont gratuites et confidentielles.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide — Emploi des travailleurs en situation de handicap",
    longText: DOC_HANDICAP,
    question: "Quel est le quota légal de travailleurs handicapés dans les entreprises de plus de 20 salariés ?",
    optionA: "3 %.",
    optionB: "4 %.",
    optionC: "5 %.",
    optionD: "6 %.",
    correctAnswer: 'D',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide — Emploi des travailleurs en situation de handicap",
    longText: DOC_HANDICAP,
    question: "À partir de quel seuil d'effectifs un référent handicap doit-il être nommé ?",
    optionA: "50 salariés.",
    optionB: "100 salariés.",
    optionC: "250 salariés.",
    optionD: "500 salariés.",
    correctAnswer: 'C',
  }));

  const DOC_PRET_SALARIE =
`CONVENTION DE PRÊT DE SALARIÉ INTER-ENTREPRISES

Le prêt de salarié permet à une entreprise de mettre temporairement un de ses employés à disposition d'une autre entreprise.

Conditions : le salarié doit donner son accord exprès. La mise à disposition est formalisée par un avenant au contrat de travail et une convention entre les deux entreprises.
Durée : le prêt est conclu pour une durée maximale de 12 mois, renouvelable une fois.
Maintien des droits : pendant le prêt, le salarié conserve tous ses droits dans l'entreprise d'origine (ancienneté, mutuelle, participation, épargne salariale).
Retour : à l'issue du prêt, le salarié retrouve automatiquement son poste d'origine ou un poste équivalent.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Convention de prêt de salarié inter-entreprises",
    longText: DOC_PRET_SALARIE,
    question: "Quelle est la durée maximale d'un prêt de salarié ?",
    optionA: "6 mois.",
    optionB: "12 mois.",
    optionC: "18 mois.",
    optionD: "24 mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Convention de prêt de salarié inter-entreprises",
    longText: DOC_PRET_SALARIE,
    question: "Que se passe-t-il à la fin du prêt pour le salarié ?",
    optionA: "Il reste dans l'entreprise d'accueil.",
    optionB: "Il est licencié avec indemnités.",
    optionC: "Il retrouve son poste d'origine ou équivalent.",
    optionD: "Il doit renégocier son contrat.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 ──────────────────────────────────────────────────────────── */

  const ART_MUSEES =
`La question des restitutions d'œuvres d'art africaines aux musées occidentaux fait l'objet d'un débat de plus en plus vif. En France, la loi de 2020 a permis la restitution de 26 œuvres au Bénin, une première dans l'histoire du patrimoine culturel français.

Ces objets, pour la plupart collectés lors de la colonisation, avaient été intégrés dans les collections du musée du Quai Branly. Leur retour au Bénin a été célébré comme un acte de réparation symbolique et de reconnaissance d'une injustice historique.

Pour autant, le débat reste ouvert. Les opposants aux restitutions font valoir que ces œuvres seraient mieux conservées dans les musées occidentaux, dotés de moyens techniques supérieurs. Ils craignent également un effet domino qui viderait les grandes collections européennes.

Les partisans, eux, défendent que ces objets appartiennent aux peuples qui les ont créés et que leur retour est une condition nécessaire à la réconciliation mémorielle. Plusieurs pays africains ont renforcé leurs capacités muséales pour accueillir ces œuvres dans les meilleures conditions.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Restitutions d'œuvres d'art : un débat qui divise les musées occidentaux",
    longText: ART_MUSEES,
    question: "Combien d'œuvres la France a-t-elle restituées au Bénin en 2020 ?",
    optionA: "10.",
    optionB: "26.",
    optionC: "50.",
    optionD: "100.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Restitutions d'œuvres d'art : un débat qui divise les musées occidentaux",
    longText: ART_MUSEES,
    question: "Quel argument avancent les opposants aux restitutions ?",
    optionA: "Ces œuvres n'ont pas de valeur historique.",
    optionB: "Les musées africains n'existent pas encore.",
    optionC: "Les musées occidentaux assurent une meilleure conservation.",
    optionD: "Les restitutions coûtent trop cher à l'État.",
    correctAnswer: 'C',
  }));

  const ART_AVATARS =
`Les mondes virtuels et le métavers transforment radicalement notre rapport à l'identité. Dans ces espaces numériques, chaque utilisateur peut se construire un avatar — représentation graphique qui peut être radicalement différente de sa personne réelle : autre genre, autre ethnie, autre apparence physique, voire représentation non humaine.

Des chercheurs en psychologie sociale observent que ces avatars influencent le comportement réel des utilisateurs. Le phénomène dit « Proteus effect » montre que les individus adoptent inconsciemment des comportements conformes à leur avatar : un avatar grand et imposant rend plus assertif, un avatar séduisant augmente la confiance en soi.

La frontière entre vie réelle et vie numérique devient de plus en plus poreuse. Des plateformes comme Roblox ou Fortnite voient leurs utilisateurs y passer plusieurs heures par jour, y créer des relations sociales et y développer des compétences transférables.

Des questions éthiques émergent : que se passe-t-il quand quelqu'un investit plus dans son identité numérique que dans sa vie réelle ? La multiplicité des avatars favorise-t-elle l'exploration de soi ou, au contraire, la fragmentation identitaire ?`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Mondes virtuels et identité numérique : qui sommes-nous en ligne ?",
    longText: ART_AVATARS,
    question: "Qu'est-ce que le « Proteus effect » décrit dans cet article ?",
    optionA: "La dépendance aux jeux vidéo.",
    optionB: "L'influence de l'avatar sur le comportement réel.",
    optionC: "La capacité à créer plusieurs identités en ligne.",
    optionD: "Le phénomène de cyberharcèlement.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Mondes virtuels et identité numérique : qui sommes-nous en ligne ?",
    longText: ART_AVATARS,
    question: "Quelle question éthique l'article soulève-t-il en conclusion ?",
    optionA: "Faut-il interdire les mondes virtuels aux mineurs ?",
    optionB: "La fragmentation identitaire liée aux multiples avatars.",
    optionC: "Le coût financier des plateformes pour les familles.",
    optionD: "Le risque de piratage des données personnelles.",
    correctAnswer: 'B',
  }));

  const ART_PHISHING =
`L'ingénierie sociale désigne l'ensemble des techniques de manipulation psychologique utilisées par les cybercriminels pour obtenir des informations confidentielles ou accéder à des systèmes informatiques. Contrairement au piratage technique, elle exploite les failles humaines plutôt que les failles logicielles.

Le phishing reste la technique la plus répandue : un email frauduleux imite un expéditeur de confiance (banque, administration, collègue) pour inciter la victime à cliquer sur un lien malveillant ou à divulguer ses identifiants. En 2024, les attaques de phishing ont augmenté de 38 % en France, touchant particulièrement les PME et les administrations.

Les victimes les plus fréquentes sont les personnes âgées, peu habituées aux nouvelles technologies, et paradoxalement les cadres dirigeants, souvent ciblés par des attaques sophistiquées dites « whaling ».

La prévention repose sur trois piliers : la formation régulière des équipes, la mise en place de protocoles de vérification pour les demandes sensibles (virement bancaire, transmission de mots de passe), et la culture de la méfiance systématique face aux sollicitations inattendues.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Ingénierie sociale : les arnaques qui exploitent la confiance humaine",
    longText: ART_PHISHING,
    question: "Qu'est-ce qui distingue l'ingénierie sociale du piratage classique ?",
    optionA: "Elle utilise des virus informatiques.",
    optionB: "Elle exploite les failles humaines plutôt que techniques.",
    optionC: "Elle ne vise que les grandes entreprises.",
    optionD: "Elle nécessite des compétences en programmation.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Ingénierie sociale : les arnaques qui exploitent la confiance humaine",
    longText: ART_PHISHING,
    question: "De combien les attaques de phishing ont-elles augmenté en France en 2024 ?",
    optionA: "15 %.",
    optionB: "25 %.",
    optionC: "38 %.",
    optionD: "50 %.",
    correctAnswer: 'C',
  }));

  const ART_JARDINS =
`Les jardins partagés se multiplient dans les villes françaises depuis une décennie, transformant des espaces urbains délaissés en lieux de vie et de lien social. On en compte aujourd'hui plus de 600 dans Paris intramuros, et des milliers à l'échelle nationale.

Ces espaces remplissent plusieurs fonctions : production alimentaire locale, sensibilisation à l'écologie, mais surtout création de liens entre voisins qui ne se connaissaient pas. Des études menées à Lyon et à Rennes montrent une réduction de 20 % du sentiment d'isolement chez les riverains qui participent régulièrement à la vie d'un jardin partagé.

L'organisation est généralement associative : un règlement fixe les droits d'usage des parcelles, les périodes d'arrosage, la répartition des récoltes et les obligations d'entretien collectif. La gouvernance est horizontale, reposant sur le consensus.

Des tensions émergent parfois autour de la répartition des tâches ou des désaccords sur les pratiques culturales (usage ou non de pesticides, biodiversité végétale). Mais pour la grande majorité des membres, ces conflits sont l'occasion d'apprendre à vivre ensemble.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Jardins partagés : quand la terre relie les voisins",
    longText: ART_JARDINS,
    question: "Combien de jardins partagés compte Paris intramuros selon cet article ?",
    optionA: "Plus de 100.",
    optionB: "Plus de 300.",
    optionC: "Plus de 600.",
    optionD: "Plus de 1 000.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Jardins partagés : quand la terre relie les voisins",
    longText: ART_JARDINS,
    question: "Quel bénéfice social principal les études mentionnées ont-elles mesuré ?",
    optionA: "Une hausse des revenus des participants.",
    optionB: "Une réduction du sentiment d'isolement.",
    optionC: "Une amélioration de la qualité de l'air.",
    optionD: "Une réduction de la délinquance.",
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

    console.log(`\n✅ ${inserted} questions créées pour CE 37.`);

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
