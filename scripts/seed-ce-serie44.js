'use strict';
/**
 * seed-ce-serie44.js
 * Peuple la série CE 44 avec 40 questions officielles TEF Canada.
 * Usage : node scripts/seed-ce-serie44.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyolrs00140wxlv39l3n7l';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Graphique correct : Graphique 1 → réponse A
   Les barres T2 et T3 sont égales et plus hautes (plateau milieu d'année)
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [40, 75, 76, 40], color: '#003087' },  // CORRECT: plateau milieu d'année
    { label: 'Graphique 2', data: [40, 55, 72, 90], color: '#E30613' },  // croissance
    { label: 'Graphique 3', data: [90, 70, 50, 30], color: '#E30613' },  // déclin
    { label: 'Graphique 4', data: [60, 60, 60, 60], color: '#E30613' },  // stable
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
      const bh  = ((v / maxVal) * plotH).toFixed(1);
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

/* ─────────────────────────────────────────────────────────────────────────────
   Helper
───────────────────────────────────────────────────────────────────────────── */
const q = (order, cat, sub, data) => ({
  moduleId:      MODULE_ID,
  seriesId:      SERIES_ID,
  questionOrder: order,
  category:      cat,
  subCategory:   sub ?? null,
  taskTitle:     data.taskTitle  ?? null,
  longText:      data.longText   ?? null,
  consigne:      data.consigne   ?? null,
  comment:       data.comment    ?? null,
  imageUrl:      data.imageUrl   ?? null,
  audioUrl:      null,
  question:      data.question,
  optionA:       data.optionA,
  optionB:       data.optionB,
  optionC:       data.optionC,
  optionD:       data.optionD,
  correctAnswer: data.correctAnswer,
  explanation:   data.explanation ?? null,
});

/* ─────────────────────────────────────────────────────────────────────────────
   Construction des 40 questions
───────────────────────────────────────────────────────────────────────────── */
function buildQuestions() {
  const qs = [];

  /* ── Q1-7 : Documents de la vie quotidienne ──────────────────────────── */

  // Q1 — Programme championnat de natation
  qs.push(q(1, 'Q1-7', null, {
    longText:
`CHAMPIONNAT RÉGIONAL DE NATATION
Samedi 15 juin — Piscine olympique de Bordeaux

Épreuves : 50 m, 100 m, 200 m nage libre, dos, brasse, papillon
Catégories : Minimes (11-12 ans), Cadets (13-14 ans), Juniors (15-17 ans)
Podium : remise des médailles à 17 h 30

Inscriptions avant le 1er juin : natation-bordeaux@sport.fr
Places limitées : 8 nageurs par épreuve`,
    question: "D'après ce document, le nombre de participants par épreuve est…",
    optionA: 'illimité.',
    optionB: 'fixé à 8 nageurs maximum.',
    optionC: 'réservé aux juniors uniquement.',
    optionD: 'déterminé le jour de la compétition.',
    correctAnswer: 'B',
  }));

  // Q2 — Règlement pépinière de plantes en libre-service
  qs.push(q(2, 'Q1-7', null, {
    longText:
`PÉPINIÈRE PARTICIPATIVE DU QUARTIER VERDURE
Règlement des emprunts de plantes

• Chaque habitant peut emprunter jusqu'à 3 plantes à la fois.
• Durée d'emprunt : 4 semaines maximum.
• Les plantes doivent être retournées en bon état, dans leur pot d'origine.
• Espèces disponibles : aromatiques, fleurs de saison, arbustes.
• Signalement obligatoire à l'accueil en cas de dépérissement.
Contact : pepiniere.verdure@mairie.fr`,
    question: "Selon ce règlement, que doit faire l'emprunteur si une plante est abîmée ?",
    optionA: "La remplacer à ses frais.",
    optionB: "La signaler à l'accueil.",
    optionC: "La garder jusqu'à guérison.",
    optionD: "Contacter un spécialiste horticole.",
    correctAnswer: 'B',
  }));

  // Q3 — Affiche spectacle de magie familial
  qs.push(q(3, 'Q1-7', null, {
    longText:
`GRAND SPECTACLE DE MAGIE
avec MARCO L'ILLUSIONNISTE

Dimanche 23 mars — 15 h 00
Salle des fêtes de Montfaucon

À partir de 6 ans — Durée : 1 h 15
Tarifs : Adultes 12 € | Enfants (6-12 ans) 7 €
Réservation : 05 56 34 12 78 ou en ligne sur spectacles-montfaucon.fr`,
    question: "Ce spectacle est ouvert…",
    optionA: 'aux enfants de moins de 6 ans.',
    optionB: 'aux adultes uniquement.',
    optionC: "à partir de 6 ans.",
    optionD: 'exclusivement aux familles membres du club.',
    correctAnswer: 'C',
  }));

  // Q4 — Menu d'un plateau fromages et charcuteries
  qs.push(q(4, 'Q1-7', null, {
    longText:
`PLATEAU DÉGUSTATION TERROIR
Sélection régionale — 2 personnes

Fromages : Comté 18 mois, Brie de Meaux, Chèvre cendré du Berry
Charcuteries : Saucisson sec du Jura, Jambon cru des Ardennes, Rosette de Lyon
Accompagnements : pain de campagne, pain aux noix, confiture de figue
Vins conseillés : Côtes du Rhône rouge ou Sancerre blanc

Prix : 34 € pour 2 personnes
Commande possible jusqu'à 20 h la veille`,
    question: "D'après ce document, le plateau est prévu pour…",
    optionA: 'une personne.',
    optionB: 'deux personnes.',
    optionC: 'quatre personnes.',
    optionD: 'un groupe de huit personnes minimum.',
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi station météo connectée domestique
  qs.push(q(5, 'Q1-7', null, {
    longText:
`STATION MÉTÉO CONNECTÉE — MISE EN SERVICE

1. Installez les capteurs extérieurs à l'ombre, à 1,5 m du sol minimum.
2. Téléchargez l'application WeatherHome sur votre smartphone.
3. Associez la station via Bluetooth dans les paramètres.
4. Configurez vos alertes personnalisées (gel, vent fort, pluie).
5. Calibrez les capteurs d'humidité chaque trimestre.

⚠ Évitez toute exposition directe au soleil des capteurs intérieurs.`,
    question: "Selon ce mode d'emploi, à quelle fréquence faut-il calibrer les capteurs d'humidité ?",
    optionA: 'Chaque semaine.',
    optionB: 'Chaque mois.',
    optionC: 'Chaque trimestre.',
    optionD: 'Une fois par an.',
    correctAnswer: 'C',
  }));

  // Q6 — Horaires laboratoire d'analyses biologiques
  qs.push(q(6, 'Q1-7', null, {
    longText:
`LABORATOIRE BIOANALYSES SANTÉ
Horaires et informations pratiques

Prélèvements sur rendez-vous :
• Lundi – Vendredi : 7 h 30 – 11 h 00
• Samedi : 7 h 30 – 10 h 00 (urgences uniquement)

Jeûn requis : 12 h avant tout bilan lipidique ou glycémie à jeun.
Délai de résultats : 24 à 48 h (résultats disponibles en ligne).
Urgences biologiques 24 h/24 : 05 61 23 45 67`,
    question: "Selon ce document, les résultats d'analyses sont disponibles…",
    optionA: 'immédiatement après le prélèvement.',
    optionB: 'dans un délai de 24 à 48 heures.',
    optionC: 'uniquement sur rendez-vous médical.',
    optionD: 'exclusivement par courrier postal.',
    correctAnswer: 'B',
  }));

  // Q7 — Note directrice crèche sur nouveau protocole hygiène
  qs.push(q(7, 'Q1-7', null, {
    longText:
`NOTE D'INFORMATION — CRÈCHE LES PETITS LUTINS
Objet : Nouveau protocole d'hygiène

Chers parents,
À compter du 3 septembre, nous mettons en place un nouveau protocole :
• Lavage des mains obligatoire à l'entrée pour tous (adultes et enfants).
• Désinfection quotidienne des jouets partagés.
• En cas de maladie contagieuse (gastro, varicelle…), l'enfant doit rester à domicile et un signalement écrit est requis.
• Tout symptôme constaté en crèche sera immédiatement signalé aux parents.

Merci de votre coopération.
La directrice, Mme Fontaine`,
    question: "Selon cette note, que doivent faire les parents si leur enfant est malade ?",
    optionA: "L'amener à la crèche en informant le personnel.",
    optionB: "Le garder à domicile et envoyer un signalement écrit.",
    optionC: "Appeler le médecin de la crèche.",
    optionD: "Consulter la directrice en personne.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 : Phrases lacunaires (vocabulaire) ───────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin a prescrit un ___ antibiotique à prendre pendant dix jours consécutifs.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "traitement",
    optionB: "remède",
    optionC: "symptôme",
    optionD: "diagnostic",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour rejoindre le club sportif, les nouveaux membres doivent s'___ auprès du secrétariat avant la fin du mois.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "inscrire",
    optionB: "absenter",
    optionC: "exclure",
    optionD: "identifier",
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Cette association ___ des bénévoles pour assurer l'accueil lors de la journée portes ouvertes.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refuse",
    optionB: "recherche",
    optionC: "surveille",
    optionD: "empêche",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les travaux de rénovation de la bibliothèque seront ___ à partir du 1er juillet pour une durée de deux mois.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "annulés",
    optionB: "ouverts",
    optionC: "entamés",
    optionD: "reportés",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Merci de bien vouloir ___ votre réponse par écrit à notre service avant la date limite du 30 avril.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "diffuser",
    optionB: "transmettre",
    optionC: "supprimer",
    optionD: "inventer",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le loyer de cet appartement est ___ aux revenus du locataire dans le cadre du programme de logement social.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "supérieur",
    optionB: "proposé",
    optionC: "proportionnel",
    optionD: "indépendant",
    correctAnswer: 'C',
  }));

  /* ── Q14-17 : Textes lacunaires (2 textes × 2 questions) ────────────── */

  const TEXTE_LAC_1 =
    "La rénovation énergétique des bâtiments anciens constitue un [14] majeur pour réduire la consommation d'énergie en France. Des aides publiques permettent aux propriétaires de financer une partie des travaux d'isolation, mais ces dispositifs restent souvent [15] pour les foyers les plus modestes.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La rénovation énergétique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "risque",
    optionB: "enjeu",
    optionC: "défaut",
    optionD: "résultat",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La rénovation énergétique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "accessibles",
    optionB: "populaires",
    optionC: "insuffisants",
    optionD: "complexes",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le covoiturage connaît une forte [16] depuis quelques années, notamment grâce aux applications mobiles qui facilitent la mise en relation entre conducteurs et passagers. Cette pratique permet non seulement de réduire les [17] de transport, mais aussi de limiter les émissions de gaz à effet de serre.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le covoiturage',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "chute",
    optionB: "croissance",
    optionC: "rupture",
    optionD: "légèreté",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le covoiturage',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "plaisirs",
    optionB: "coûts",
    optionC: "horaires",
    optionD: "risques",
    correctAnswer: 'B',
  }));

  /* ── Q18-21 : Lecture rapide de textes (4 séries) ──────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Appartement 1', content: "T3 haussmannien entièrement rénové, 72 m², 2e étage avec ascenseur. Parquet en chêne massif, moulures d'origine. Hauteur sous plafond : 2,80 m. Loyer : 1 150 €/mois charges comprises. Disponible dès septembre." },
    { title: 'Appartement 2', content: "T2 atypique, 45 m², ancien atelier d'artiste. Parquet peint, verrière zénithale. Hauteur sous plafond : 4,20 m. Charges locatives modérées. Loyer : 950 €/mois. Quartier animé, idéal professions créatives." },
    { title: 'Appartement 3', content: "T4 familial, 96 m², résidence sécurisée avec gardien. Hauteur sous plafond : 2,55 m. Double vitrage, cuisine équipée, deux salles de bains. Loyer : 1 450 €/mois hors charges. Libre immédiatement." },
    { title: 'Appartement 4', content: "Studio de standing, 28 m², immeuble ancien restauré. Parquet point de Hongrie, hauteur sous plafond : 3,10 m. Kitchenette équipée, salle d'eau rénovée. Loyer tout compris : 750 €/mois." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel appartement a les plus hauts plafonds ?",
    optionA: "Appartement 1",
    optionB: "Appartement 2",
    optionC: "Appartement 3",
    optionD: "Appartement 4",
    correctAnswer: 'B',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Cours 1', content: "Broderie au ruban — niveau débutant. Style romantique floral. Matériel fourni : ruban de soie, aiguilles, tambour. 8 séances de 2 h. Diplôme de l'École nationale de broderie remis à la fin du cycle. Tarif : 180 €." },
    { title: 'Cours 2', content: "Dentelle aux fuseaux — initiation. Méthode traditionnelle normande. Matériel non fourni (liste remise à l'inscription). 6 séances d'1 h 30. Animé par une artisane d'art. Tarif : 90 €. Aucun certificat délivré." },
    { title: 'Cours 3', content: "Broderie au crochet de Lunéville — tous niveaux. Matériel fourni lors des deux premières séances. Atelier hebdomadaire le samedi matin. Tarif mensuel : 45 €. Progression libre, pas d'examen final." },
    { title: 'Cours 4', content: "Point de croix contemporain — adultes. Matériel fourni : grille, fil, cadre. Thèmes : paysages, portraits, animaux. 4 séances de 2 h. Tarif : 60 €. Exposition des œuvres en fin de session, pas de diplôme." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel cours propose un diplôme à la fin ?",
    optionA: "Cours 1",
    optionB: "Cours 2",
    optionC: "Cours 3",
    optionD: "Cours 4",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Offre 1', content: "Développeur front-end React.js — CDI. Stack : React, TypeScript, Tailwind. Télétravail 3 j/semaine. Salaire : 42 000 – 50 000 €/an. Expérience 3 ans minimum. Localisation : Lyon." },
    { title: 'Offre 2', content: "Ingénieur back-end Node.js — CDI. Stack : Node, PostgreSQL, Docker. Télétravail possible. Salaire : 45 000 – 55 000 €/an. 5 ans d'expérience requis. Localisation : Nantes." },
    { title: 'Offre 3', content: "Développeur mobile Flutter — CDD 12 mois. Stack : Flutter, Dart, Firebase. Pas de télétravail. Salaire : 38 000 €/an. 2 ans d'expérience. Localisation : Bordeaux." },
    { title: 'Offre 4', content: "Développeur full-stack JavaScript — CDI. Stack : React + Node.js, MongoDB, GraphQL. Full télétravail possible. Salaire : 48 000 – 60 000 €/an. 4 ans d'expérience. Localisation : Paris ou remote." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste est en full-stack JavaScript ?",
    optionA: "Offre 1",
    optionB: "Offre 2",
    optionC: "Offre 3",
    optionD: "Offre 4",
    correctAnswer: 'D',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Abonnement 1', content: "Lecture numérique Standard — 5 000 titres disponibles (romans, BD, magazines). Format ePub uniquement. Lecture en ligne uniquement, pas de téléchargement. Prix : 9,99 €/mois." },
    { title: 'Abonnement 2', content: "Lecture numérique Plus — 12 000 titres dont 500 en accès anticipé. Formats ePub et PDF. Téléchargement hors ligne de 20 titres maximum simultanément. Prix : 14,99 €/mois." },
    { title: 'Abonnement 3', content: "Lecture numérique Famille — jusqu'à 4 profils. 8 000 titres. Lecture en ligne et offline. Contrôle parental intégré. Prix : 17,99 €/mois. Téléchargement possible sur 2 appareils par profil." },
    { title: 'Abonnement 4', content: "Lecture numérique Étudiant — accès à 3 000 titres académiques et parascolaires. Lecture en ligne exclusivement. Pas de téléchargement. Justificatif scolarité requis. Prix : 5,99 €/mois." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel abonnement permet la lecture hors connexion ?",
    optionA: "Abonnement 1",
    optionB: "Abonnement 2",
    optionC: "Abonnement 3",
    optionD: "Abonnement 4",
    correctAnswer: 'B',
  }));

  /* ── Q22 : Lecture rapide de graphiques ─────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Cette entreprise enregistre ses meilleures performances aux deuxième et troisième trimestres, avec des résultats similaires.",
    question:
      "Quel graphique correspond au commentaire suivant : « Cette entreprise enregistre ses meilleures performances aux deuxième et troisième trimestres, avec des résultats similaires. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 : Documents administratifs et professionnels ────────────── */

  const DOC_RSE =
`RÈGLEMENT DU COMITÉ RSE
Entreprise Fabricom SA — version approuvée

Article 1 – Composition
Le comité RSE est composé de 7 membres : 3 représentants de la direction, 3 représentants élus du personnel et 1 expert externe indépendant.

Article 2 – Missions
Le comité est chargé de définir la politique de responsabilité sociale, d'évaluer les actions menées et de proposer des axes d'amélioration en matière sociale, environnementale et de gouvernance.

Article 3 – Rapport annuel
Un rapport annuel sur les actions RSE est rédigé par le comité et présenté à l'assemblée générale des actionnaires chaque année en juin.

Article 4 – Budget
Le comité dispose d'un budget annuel de 150 000 € pour financer ses projets. Toute dépense supérieure à 20 000 € doit être validée par la direction générale.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement du comité RSE — Fabricom SA",
    longText: DOC_RSE,
    question: "Ce document précise que le rapport annuel RSE est présenté…",
    optionA: "au comité d'entreprise chaque trimestre.",
    optionB: "aux actionnaires chaque année en juin.",
    optionC: "aux salariés lors de la journée portes ouvertes.",
    optionD: "au conseil d'administration en début d'année.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement du comité RSE — Fabricom SA",
    longText: DOC_RSE,
    question: "Selon ce règlement, une dépense de 25 000 € doit être…",
    optionA: "refusée car supérieure au budget autorisé.",
    optionB: "validée par le comité RSE seul.",
    optionC: "approuvée par la direction générale.",
    optionD: "soumise au vote des salariés.",
    correctAnswer: 'C',
  }));

  const DOC_INCLUSION =
`NOTE DE STRATÉGIE — INCLUSION DES PERSONNES EN SITUATION DE HANDICAP

Objectifs 2025 :
• Porter le taux d'emploi direct des travailleurs handicapés (OETH) à 6 %.
• Rendre 100 % des locaux accessibles d'ici décembre 2025.
• Former l'ensemble des managers aux situations de handicap au travail.

Actions prioritaires :
— Partenariat avec les ESAT pour la sous-traitance de certains services.
— Révision des procédures de recrutement pour éliminer les biais.
— Adaptation des postes de travail sur demande, avec budget dédié.

Indicateurs de suivi : rapport semestriel au CODIR.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note de stratégie — Inclusion du handicap",
    longText: DOC_INCLUSION,
    question: "Selon cette note, quel est l'objectif d'accessibilité des locaux ?",
    optionA: "50 % des locaux accessibles dès 2024.",
    optionB: "Accessibilité totale des locaux d'ici décembre 2025.",
    optionC: "Accessibilité réservée aux nouveaux bâtiments.",
    optionD: "Accessibilité des locaux selon le budget disponible.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note de stratégie — Inclusion du handicap",
    longText: DOC_INCLUSION,
    question: "Le suivi des indicateurs de cette stratégie est effectué…",
    optionA: "annuellement lors de l'assemblée générale.",
    optionB: "mensuellement par les managers de proximité.",
    optionC: "tous les six mois, rapporté au CODIR.",
    optionD: "uniquement en cas d'incident déclaré.",
    correctAnswer: 'C',
  }));

  const DOC_INTEGRITE =
`CHARTE D'INTÉGRITÉ PROFESSIONNELLE

La présente charte s'applique à l'ensemble des collaborateurs de la société.

Conflits d'intérêts : Tout collaborateur doit déclarer toute situation pouvant créer un conflit entre ses intérêts personnels et ceux de l'entreprise.

Cadeaux et avantages : Il est interdit d'accepter ou d'offrir des cadeaux d'une valeur supérieure à 50 €. Tout cadeau reçu doit être déclaré dans les 48 heures.

Confidentialité : Les informations stratégiques, commerciales ou personnelles ne peuvent être divulguées sans autorisation préalable de la direction.

Sanctions : Tout manquement à cette charte peut entraîner des mesures disciplinaires pouvant aller jusqu'au licenciement pour faute grave.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte d'intégrité professionnelle",
    longText: DOC_INTEGRITE,
    question: "Selon cette charte, qu'est-il obligatoire de faire si l'on reçoit un cadeau de 60 € ?",
    optionA: "Le refuser immédiatement.",
    optionB: "Le déclarer dans les 48 heures.",
    optionC: "Le remettre à la direction.",
    optionD: "En informer ses collègues.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte d'intégrité professionnelle",
    longText: DOC_INTEGRITE,
    question: "En cas de non-respect de cette charte, un collaborateur risque…",
    optionA: "uniquement un avertissement écrit.",
    optionB: "une retenue sur salaire.",
    optionC: "des mesures pouvant aller jusqu'au licenciement pour faute grave.",
    optionD: "une mutation disciplinaire obligatoire.",
    correctAnswer: 'C',
  }));

  const DOC_CONGE_AIDANT =
`GUIDE DU CONGÉ DE PROCHE AIDANT

Conditions d'éligibilité :
Tout salarié justifiant d'une ancienneté d'au moins un an peut demander un congé de proche aidant pour accompagner un membre de sa famille ou une personne âgée en perte d'autonomie.

Durée :
Le congé est de 3 mois maximum, renouvelable. La durée totale ne peut excéder 1 an sur l'ensemble de la carrière.

Rémunération :
Le congé de proche aidant n'est pas rémunéré par l'employeur. Toutefois, une allocation journalière (AJPA) peut être versée par la CAF sous conditions de ressources.

Retour au poste :
À l'issue du congé, le salarié retrouve son poste ou un poste équivalent avec maintien de sa rémunération.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide du congé de proche aidant",
    longText: DOC_CONGE_AIDANT,
    question: "Selon ce guide, combien d'années d'ancienneté faut-il pour bénéficier de ce congé ?",
    optionA: "Aucune ancienneté n'est requise.",
    optionB: "Au moins six mois.",
    optionC: "Au moins un an.",
    optionD: "Au moins trois ans.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide du congé de proche aidant",
    longText: DOC_CONGE_AIDANT,
    question: "Ce congé est-il rémunéré par l'employeur ?",
    optionA: "Oui, à 100 % du salaire.",
    optionB: "Oui, à 50 % du salaire.",
    optionC: "Non, mais une aide de la CAF peut être versée.",
    optionD: "Non, et aucune aide publique n'existe.",
    correctAnswer: 'C',
  }));

  const DOC_TALENTS =
`PROCÉDURE GESTION DES TALENTS HIGH-POTENTIALS

Identification :
Chaque année, les managers identifient les collaborateurs « high-potentials » selon des critères de performance, leadership et capacité d'adaptation. Cette liste est validée par le CODIR.

Parcours accéléré :
Les collaborateurs identifiés bénéficient d'un programme de 18 mois incluant formations certifiantes, mentorat exécutif et projets transverses.

Mobilité interne :
Une mobilité vers un poste de niveau supérieur est proposée à l'issue du programme. Le refus de mobilité n'entraîne pas de sanction.

Rétention :
Un bonus de rétention de 10 % du salaire annuel est versé à la fin du programme si le collaborateur reste dans l'entreprise.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Procédure gestion des talents high-potentials",
    longText: DOC_TALENTS,
    question: "Selon ce document, comment sont identifiés les collaborateurs 'high-potentials' ?",
    optionA: "Par auto-évaluation annuelle.",
    optionB: "Par les managers, selon des critères définis, puis validés par le CODIR.",
    optionC: "Par un cabinet de recrutement externe.",
    optionD: "Par les représentants du personnel.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Procédure gestion des talents high-potentials",
    longText: DOC_TALENTS,
    question: "Le bonus de rétention est versé à condition que…",
    optionA: "le collaborateur accepte une mobilité internationale.",
    optionB: "le collaborateur reste dans l'entreprise à l'issue du programme.",
    optionC: "le collaborateur obtienne une promotion avant la fin du programme.",
    optionD: "le collaborateur forme d'autres collaborateurs.",
    correctAnswer: 'B',
  }));

  /* ── Q33-40 : Articles de presse ──────────────────────────────────────── */

  const ART_OBESITE =
`L'obésité infantile représente un défi de santé publique croissant en France. Selon les dernières données de l'INSERM, près d'un enfant sur cinq présente un surpoids à l'entrée en CE2. Face à cette réalité, plusieurs leviers d'action sont envisagés.

Du côté des cantines scolaires, des municipalités expérimentent des menus élaborés par des diététiciens, favorisant les légumes de saison et réduisant les portions de féculents. Les premiers résultats sont encourageants : une baisse de 8 % de l'indice de masse corporelle moyen chez les enfants concernés.

La question du sport scolaire reste épineuse. Si les programmes officiels prévoient trois heures hebdomadaires d'éducation physique, la réalité dans les établissements sous-équipés est bien différente. Des associations militent pour au moins cinq heures de sport par semaine.

Enfin, la publicité alimentaire ciblant les enfants fait l'objet de débats intenses. L'Union européenne envisage de renforcer les restrictions sur les publicités pour les produits trop sucrés ou trop gras diffusées avant 21 heures.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Surpoids et obésité : la prévention chez les enfants",
    longText: ART_OBESITE,
    question: "D'après cet article, quelle proportion d'enfants présente un surpoids à l'entrée en CE2 ?",
    optionA: "Un enfant sur dix.",
    optionB: "Un enfant sur cinq.",
    optionC: "Un enfant sur trois.",
    optionD: "La moitié des enfants.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Surpoids et obésité : la prévention chez les enfants",
    longText: ART_OBESITE,
    question: "Concernant la publicité alimentaire, l'Union européenne envisage…",
    optionA: "d'interdire totalement la publicité pour les enfants.",
    optionB: "de renforcer les restrictions sur les publicités pour produits trop gras ou sucrés avant 21 h.",
    optionC: "d'imposer des étiquetages nutritionnels dans les publicités.",
    optionD: "de financer des campagnes de sensibilisation dans les écoles.",
    correctAnswer: 'B',
  }));

  const ART_FONCIER =
`La pression foncière sur les terres agricoles atteint des niveaux inédits en France. Entre 2010 et 2023, la valeur moyenne d'un hectare de terre cultivable a augmenté de 45 %, rendant l'installation des jeunes agriculteurs de plus en plus difficile.

Des fonds d'investissement étrangers et des sociétés foncières nationales rachètent massivement des exploitations, parfois sur des milliers d'hectares. Cette concentration inquiète les syndicats agricoles, qui dénoncent une « financiarisation » de l'agriculture menaçant le modèle paysan traditionnel.

Face à ce constat, les pouvoirs publics semblent hésitants. Le plafonnement des surfaces rachetables par une même entité, réclamé depuis des années par les organisations paysannes, tarde à se concrétiser dans la loi. Quelques régions expérimentent des dispositifs de préemption permettant aux collectivités de racheter des terres avant toute transaction privée.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Économie foncière rurale : la tension sur les terres agricoles",
    longText: ART_FONCIER,
    question: "De combien la valeur des terres cultivables a-t-elle augmenté entre 2010 et 2023 ?",
    optionA: "De 20 %.",
    optionB: "De 35 %.",
    optionC: "De 45 %.",
    optionD: "De 60 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Économie foncière rurale : la tension sur les terres agricoles",
    longText: ART_FONCIER,
    question: "Selon cet article, que réclament les organisations paysannes depuis des années ?",
    optionA: "Une subvention directe pour l'installation des jeunes agriculteurs.",
    optionB: "Un plafonnement des surfaces rachetables par une même entité.",
    optionC: "L'interdiction totale des investisseurs étrangers dans l'agriculture.",
    optionD: "La nationalisation des terres agricoles inoccupées.",
    correctAnswer: 'B',
  }));

  const ART_TRAVAIL_NUIT =
`Travailler la nuit perturbe profondément les rythmes biologiques humains. Les chercheurs s'accordent sur le fait que les travailleurs de nuit sont davantage exposés aux maladies cardiovasculaires, au diabète et aux troubles dépressifs que leurs homologues travaillant en journée.

Ces effets s'expliquent par la désynchronisation des rythmes circadiens, ces horloges biologiques internes qui régulent le sommeil, la digestion et la sécrétion hormonale. Travailler la nuit impose un mode de vie en contradiction permanente avec ces cycles naturels.

Pour compenser ces risques, la législation française impose des contreparties spécifiques : rémunération majorée (au minimum 25 %), surveillance médicale renforcée et possibilité de retour en travail de jour sous certaines conditions. Toutefois, ces dispositions sont souvent jugées insuffisantes par les médecins du travail, qui plaident pour une limitation plus stricte du travail nocturne répété.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Travail de nuit : impact sur la santé des travailleurs",
    longText: ART_TRAVAIL_NUIT,
    question: "D'après cet article, quelle majoration de salaire est imposée au minimum pour le travail de nuit ?",
    optionA: "10 %.",
    optionB: "15 %.",
    optionC: "25 %.",
    optionD: "35 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Travail de nuit : impact sur la santé des travailleurs",
    longText: ART_TRAVAIL_NUIT,
    question: "Selon les médecins du travail cités dans cet article, les dispositions légales actuelles sont…",
    optionA: "suffisantes et bien appliquées.",
    optionB: "jugées insuffisantes ; ils plaident pour plus de restrictions.",
    optionC: "trop contraignantes pour les entreprises.",
    optionD: "adaptées uniquement aux secteurs industriels.",
    correctAnswer: 'B',
  }));

  const ART_SPORT_PAIX =
`Le sport comme vecteur de paix et de développement : une idée ancienne qui retrouve une nouvelle actualité. De nombreuses ONG utilisent aujourd'hui des programmes sportifs pour favoriser la cohésion sociale dans des zones de conflit ou de pauvreté.

En Côte d'Ivoire, l'ONG Foot pour la Paix a rassemblé depuis 2012 plus de 15 000 jeunes de communautés rivales autour du football. Les résultats mesurés par des équipes universitaires montrent une réduction de 30 % des incidents intercommunautaires dans les zones d'intervention.

En Afghanistan, des programmes d'athlétisme mixtes ont permis à des jeunes filles d'accéder à un espace public sécurisé et de développer leur autonomie, malgré les pressions sociales. Ces initiatives restent fragiles et dépendent largement de financements internationaux souvent incertains.

La limite principale de ces approches réside dans leur échelle : les projets à fort impact restent locaux et peinent à se déployer au niveau national ou régional sans soutien institutionnel pérenne.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le sport comme outil de paix et de développement",
    longText: ART_SPORT_PAIX,
    question: "Selon cet article, quel résultat l'ONG Foot pour la Paix a-t-elle obtenu en Côte d'Ivoire ?",
    optionA: "La création de 15 000 emplois dans le secteur sportif.",
    optionB: "Une réduction de 30 % des incidents intercommunautaires.",
    optionC: "La construction de 15 000 terrains de football.",
    optionD: "Une augmentation de 30 % de la pratique sportive chez les jeunes.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le sport comme outil de paix et de développement",
    longText: ART_SPORT_PAIX,
    question: "Quelle est la limite principale des programmes sportifs pour la paix, selon cet article ?",
    optionA: "Le manque d'intérêt des jeunes pour le sport.",
    optionB: "L'opposition des gouvernements locaux.",
    optionC: "Leur échelle réduite et la difficulté à se déployer sans soutien institutionnel.",
    optionD: "L'absence de résultats mesurables sur le long terme.",
    correctAnswer: 'C',
  }));

  return qs;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function main() {
  const rawUrl = process.env.DATABASE_URL ?? '';
  const connectionString = rawUrl
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

    let created = 0;
    for (const data of questions) {
      await prisma.question.create({ data });
      process.stdout.write(`\r   ✓ Q${data.questionOrder} insérée`);
      created++;
    }
    console.log(`\n✅ ${created} questions créées pour CE 44.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
