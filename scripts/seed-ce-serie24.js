'use strict';
/**
 * seed-ce-serie24.js
 * Peuple la série CE 24 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie24.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyohz7000k0wxlntty44gv';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire : « Les ventes bondissent dès le second trimestre puis se stabilisent à un niveau élevé jusqu'à la fin de l'année. »
   Graphique correct : Graphique 1 → réponse A (croissance avec plateau)
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [40, 70, 72, 75], color: '#003087' },  // CORRECT: croissance puis plateau
    { label: 'Graphique 2', data: [90, 70, 50, 30], color: '#E30613' },  // déclin
    { label: 'Graphique 3', data: [50, 90, 52, 50], color: '#E30613' },  // pic Q2
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

  // Q1 — Affiche salon du livre
  qs.push(q(1, 'Q1-7', null, {
    longText:
`SALON DU LIVRE DE LA VILLE — 15e ÉDITION
Du 14 au 16 novembre — Palais des congrès

Auteurs invités :
• Amélie Nothomb (roman) — dédicaces samedi 10 h – 12 h
• Alain Mabanckou (littérature africaine) — dédicaces dimanche 14 h – 16 h
• Sophie Divry (fiction) — rencontre vendredi 18 h

Entrée : 5 € / réduit 3 € (étudiants, -16 ans)
Dédicaces incluses dans le prix d'entrée`,
    question: "D'après cette affiche, les dédicaces sont…",
    optionA: "payantes en sus du billet d'entrée.",
    optionB: "comprises dans le prix d'entrée.",
    optionC: "réservées aux abonnés du salon.",
    optionD: "organisées uniquement le dimanche.",
    correctAnswer: 'B',
  }));

  // Q2 — Menu restaurant africain
  qs.push(q(2, 'Q1-7', null, {
    longText:
`RESTAURANT CHEZ MAMA — Cuisine africaine authentique

Plats du jour (servis avec riz ou attiéké) :
• Poulet yassa — 12 €
• Tilapia braisé — 14 €
• Thiéboudienne (plat national sénégalais) — 13 €

Boissons : jus de bissap 3 € | eau minérale 2 €
Dessert : beignets maison 4 €

Service continu 12 h – 22 h — Fermé le lundi`,
    question: "Quel plat est présenté comme un plat national ?",
    optionA: "Le poulet yassa.",
    optionB: "Le tilapia braisé.",
    optionC: "Le thiéboudienne.",
    optionD: "Les beignets maison.",
    correctAnswer: 'C',
  }));

  // Q3 — Programme randonnée nordique
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RANDONNÉE NORDIQUE — MASSIF DES VOSGES
Samedi 8 février — Départ 8 h 30, gare de Munster

Parcours : 18 km — Difficulté : intermédiaire
Dénivelé : +450 m / -450 m

Équipement obligatoire :
• Skis de fond ou raquettes (location sur place : 10 €)
• Vêtements chauds, imperméables, gants, bonnet
• Sac à dos avec pique-nique

Inscription avant le 5 février : randovosges@email.fr`,
    question: "Ce document indique que la location de matériel…",
    optionA: "est incluse dans le prix de l'inscription.",
    optionB: "doit être réservée à l'avance en ligne.",
    optionC: "est disponible sur place pour 10 euros.",
    optionD: "n'est pas possible sur ce parcours.",
    correctAnswer: 'C',
  }));

  // Q4 — Règlement club de vélo
  qs.push(q(4, 'Q1-7', null, {
    longText:
`VÉLO CLUB DES DEUX RIVES — Règlement intérieur

Adhésion annuelle : 45 € (adultes) / 20 € (moins de 18 ans)
Comprend : licence fédérale, assurance, accès sorties hebdomadaires

Sécurité : casque obligatoire, gilet réfléchissant recommandé le soir
Prêt de matériel : 2 vélos disponibles (réservation 48 h à l'avance)

Comportement : respecter le code de la route, rouler en file indienne
Exclusion possible en cas de non-respect répété du règlement`,
    question: "D'après ce règlement, le port du casque est…",
    optionA: "recommandé mais facultatif.",
    optionB: "obligatoire pour tous les membres.",
    optionC: "exigé uniquement pour les moins de 18 ans.",
    optionD: "obligatoire seulement en compétition.",
    correctAnswer: 'B',
  }));

  // Q5 — Horaires navette aéroport
  qs.push(q(5, 'Q1-7', null, {
    longText:
`NAVETTE AÉROPORT EXPRESS — Ligne Centre-Ville ↔ Aéroport

Départs depuis la gare centrale : 5 h 00, 6 h 30, 8 h 00 puis toutes les 45 min jusqu'à 22 h 00
Terminus aéroport : Terminaux 1, 2 et 3

Tarifs : aller simple 12 € | aller-retour 20 € | abonnement mensuel 80 €
Durée du trajet : 35 minutes environ

Réservation non obligatoire — Paiement à bord ou en ligne`,
    question: "Quelle est la durée approximative du trajet ?",
    optionA: "20 minutes.",
    optionB: "45 minutes.",
    optionC: "35 minutes.",
    optionD: "1 heure.",
    correctAnswer: 'C',
  }));

  // Q6 — Annonce service traiteur événementiel
  qs.push(q(6, 'Q1-7', null, {
    longText:
`TRAITEUR PRESTIGE EVENTS — Votre événement, notre passion

Prestations proposées :
• Cocktails dinatoires (50 à 500 personnes)
• Buffets thématiques (cuisine française, asiatique, fusion)
• Service à table pour dîners de gala
• Location vaisselle et nappage incluse

Devis gratuit sous 48 h — Contact : 01 42 00 55 66
email : contact@prestige-events.fr`,
    question: "Ce document présente un service qui propose…",
    optionA: "uniquement des repas pour les entreprises.",
    optionB: "des prestations culinaires pour divers événements.",
    optionC: "la livraison de plateaux repas à domicile.",
    optionD: "la formation de cuisiniers professionnels.",
    correctAnswer: 'B',
  }));

  // Q7 — Note copropriété travaux ravalement
  qs.push(q(7, 'Q1-7', null, {
    longText:
`SYNDICAT DE COPROPRIÉTÉ — 14 rue des Lilas

Objet : Travaux de ravalement de façade

Les travaux de ravalement votés en assemblée générale auront lieu du 3 mars au 28 avril.
Une échafaudage sera installée sur la façade est, entraînant la fermeture partielle du trottoir.

Perturbations à prévoir : accès principal condamné du 3 au 10 mars (utiliser l'entrée de service).
Coût global : 85 000 € — Quote-part selon tantièmes (voir tableau joint).

Merci de votre compréhension. — Le syndic`,
    question: "Ce document informe les résidents que…",
    optionA: "les charges de copropriété vont augmenter définitivement.",
    optionB: "l'accès principal sera temporairement fermé.",
    optionC: "les travaux dureront toute l'année.",
    optionD: "la façade ouest sera rénovée en priorité.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 : Phrases lacunaires ──────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour obtenir ce poste, il faut ___ trois ans d'expérience minimum dans le domaine de la gestion.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "posséder",
    optionB: "vouloir",
    optionC: "trouver",
    optionD: "lire",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La conférence a été ___ en raison d'une grève des transports qui a empêché la venue des intervenants.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "organisée",
    optionB: "reportée",
    optionC: "prolongée",
    optionD: "diffusée",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les participants sont invités à ___ leur badge d'entrée visible pendant toute la durée de l'événement.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "garder",
    optionB: "perdre",
    optionC: "cacher",
    optionD: "fabriquer",
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce médicament doit être ___ à l'abri de la lumière et de l'humidité pour conserver ses propriétés.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "vendu",
    optionB: "prescrit",
    optionC: "conservé",
    optionD: "chauffé",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La mairie ___ tous les habitants à participer à la réunion publique sur le plan d'urbanisme.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refuse",
    optionB: "convie",
    optionC: "interdit",
    optionD: "surveille",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant de signer, le locataire doit ___ l'état des lieux avec le propriétaire pour éviter tout litige.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "oublier",
    optionB: "effacer",
    optionC: "contester",
    optionD: "établir",
    correctAnswer: 'D',
  }));

  /* ── Q14-17 : Textes lacunaires ──────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "La transition énergétique est devenue un [14] majeur pour les gouvernements du monde entier. Réduire la consommation de [15] fossiles tout en développant les énergies renouvelables représente un défi considérable sur les plans économique, social et technologique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La transition énergétique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "risque",
    optionB: "loisir",
    optionC: "enjeu",
    optionD: "retard",
    correctAnswer: 'C',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La transition énergétique',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "minéraux",
    optionB: "combustibles",
    optionC: "légumes",
    optionD: "matériaux",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "Le télétravail s'est [16] dans de nombreuses entreprises depuis la crise sanitaire de 2020. Ce mode d'organisation offre une plus grande [17] aux salariés, mais peut aussi engendrer un sentiment d'isolement et brouiller la frontière entre vie professionnelle et personnelle.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le télétravail',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "effondré",
    optionB: "généralisé",
    optionC: "interdit",
    optionD: "oublié",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le télétravail',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "contrainte",
    optionB: "autorité",
    optionC: "flexibilité",
    optionD: "surveillance",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 : Lecture rapide de textes ──────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Club vélo 1', content: "Le Pédaleurs du Dimanche est un club convivial qui organise des sorties tous les dimanches matin à 9 h. Niveau intermédiaire. Cotisation annuelle : 35 €. Parcours de 40 à 60 km. Ouvert à tous les cyclistes dès 16 ans." },
    { title: 'Club vélo 2', content: "Les Roues Libres proposent des entraînements intensifs le mardi et jeudi soir pour cyclistes confirmés. Pas de sortie le week-end. Cotisation : 60 €/an. Préparation aux compétitions régionales. Licence FFC requise." },
    { title: 'Club vélo 3', content: "Vélo Loisir Famille organise des balades accessibles à toute la famille les samedis après-midi. Vélos électriques acceptés. Cotisation : 25 €/an. Parcours plats de 20 km maximum. Ouvert aux enfants dès 8 ans." },
    { title: 'Club vélo 4', content: "Sport Cyclisme Pro s'adresse aux athlètes de haut niveau. Entraînements quotidiens, stages intensifs. Cotisation : 120 €/an. Sorties compétition uniquement. Sélection sur dossier. Aucune sortie récréative proposée." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel club organise des sorties le dimanche ?",
    optionA: "Club vélo 1.",
    optionB: "Club vélo 2.",
    optionC: "Club vélo 3.",
    optionD: "Club vélo 4.",
    correctAnswer: 'A',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Offre ingénieur 1', content: "Ingénieur logiciel — CDI — Entreprise Techinova. Salaire : 38 000 € bruts/an. Expérience requise : 2 ans minimum. Télétravail partiel possible. Localisation : Lyon. Avantages : tickets restaurant, mutuelle, prime." },
    { title: 'Offre ingénieur 2', content: "Ingénieur data science — CDI — Groupe Analytix. Salaire : 52 000 € bruts/an. Expérience : 3 à 5 ans. Full remote possible. Localisation : Paris ou remote. Avantages : BSPCE, intéressement, 50 j RTT." },
    { title: 'Offre ingénieur 3', content: "Ingénieur mécanique — CDD 12 mois — Industrie AutoMeca. Salaire : 34 000 € bruts/an. Débutants acceptés. Localisation : Nantes. Avantages : 13e mois, chèques vacances, restaurant d'entreprise." },
    { title: 'Offre ingénieur 4', content: "Ingénieur projets civil — CDI — Bureau d'études BTP Construct. Salaire : 44 000 € bruts/an. Expérience : 5 ans requis. Déplacements fréquents. Avantages : voiture de fonction, prime chantier, formation continue." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle offre propose le salaire le plus élevé ?",
    optionA: "Offre ingénieur 1.",
    optionB: "Offre ingénieur 2.",
    optionC: "Offre ingénieur 3.",
    optionD: "Offre ingénieur 4.",
    correctAnswer: 'B',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Séjour bien-être A', content: "Escapade Nature — 3 jours / 2 nuits en chalet. Soins inclus : bain thermal, enveloppement aux algues, massage relaxant. Consultation médicale initiale obligatoire pour adapter les soins. Prix : 380 € par personne." },
    { title: 'Séjour bien-être B', content: "Week-end Yoga & Méditation — 2 jours en centre bouddhiste. Programme : séances de yoga matinales, méditation guidée, repas végétariens. Aucun soin corporel prévu. Prix : 220 € par personne." },
    { title: 'Séjour bien-être C', content: "Cure Detox Intensif — 5 jours en thalasso. Soins : enveloppements, drainage, bains de boue. Régime alimentaire strict fourni. Pas de suivi médical. Prix : 650 € par personne." },
    { title: 'Séjour bien-être D', content: "Retraite Zen — 4 jours en montagne. Activités : randonnées douces, atelier sophrologie, spa. Pas de consultation médicale. Prix : 490 € par personne. Repas gastronomiques inclus." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel séjour inclut une consultation médicale ?",
    optionA: "Séjour bien-être A.",
    optionB: "Séjour bien-être B.",
    optionC: "Séjour bien-être C.",
    optionD: "Séjour bien-être D.",
    correctAnswer: 'A',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Appareil A', content: "Réfrigérateur combiné — marque FreshCool — 350 litres. Classe énergétique : A++. Congélateur 80 L intégré. Couleur inox. Bruit : 38 dB. Prix : 699 €. Livraison gratuite. Garantie 2 ans." },
    { title: 'Appareil B', content: "Lave-linge — marque WashPro — 8 kg. Classe énergétique : A+++. Essorage 1400 tr/min. Technologie à vapeur anti-faux plis. Bruit : 72 dB lavage. Prix : 549 €. Garantie 3 ans." },
    { title: 'Appareil C', content: "Aspirateur robot — marque CleanBot. Classe énergétique : A++. Autonomie 120 min, charge automatique. Cartographie laser. Compatible assistant vocal. Prix : 349 €. Garantie 2 ans." },
    { title: 'Appareil D', content: "Four encastrable — marque BakeMaster — 65 litres. Classe énergétique : A+. Pyrolyse, air pulsé, 12 fonctions. Couleur noir mat. Bruit : très silencieux. Prix : 429 €. Garantie 2 ans." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel appareil est classé A+++ en énergie ?",
    optionA: "Appareil A.",
    optionB: "Appareil B.",
    optionC: "Appareil C.",
    optionD: "Appareil D.",
    correctAnswer: 'B',
  }));

  /* ── Q22 : Graphique ─────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "« Les ventes bondissent dès le second trimestre puis se stabilisent à un niveau élevé jusqu'à la fin de l'année. »",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1.",
    optionB: "Graphique 2.",
    optionC: "Graphique 3.",
    optionD: "Graphique 4.",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 : Documents administratifs et professionnels ────────────── */

  const DOC_FIDELITE =
`PROGRAMME DE FIDÉLITÉ — CLUB AVANTAGES

Notre programme récompense votre fidélité dès le premier achat. Pour chaque euro dépensé, vous cumulez 1 point. À partir de 100 points, vous bénéficiez d'une remise de 5 € sur votre prochaine commande.

Avantages exclusifs membres :
• Accès aux ventes privées 48 h avant les autres clients
• Livraison offerte dès 50 € d'achat (contre 80 € pour les non-membres)
• Invitation aux événements VIP et lancements de produits

Les points sont valables 12 mois à compter de leur acquisition. Inscription gratuite sur notre site ou en caisse.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Programme de fidélité — Club Avantages",
    longText: DOC_FIDELITE,
    question: "Ce document présente principalement…",
    optionA: "une carte de crédit réservée aux bons clients.",
    optionB: "un système de récompenses pour les achats réguliers.",
    optionC: "les conditions de remboursement d'un produit défectueux.",
    optionD: "un abonnement mensuel payant à des avantages exclusifs.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Programme de fidélité — Club Avantages",
    longText: DOC_FIDELITE,
    question: "D'après ce document, les points de fidélité…",
    optionA: "peuvent être transmis à un membre de la famille.",
    optionB: "sont valables sans limite de durée.",
    optionC: "expirent au bout d'un an.",
    optionD: "donnent accès à une livraison gratuite systématique.",
    correctAnswer: 'C',
  }));

  const DOC_COMM_INTERNE =
`NOTE — Plan de communication interne 2025

Objet : améliorer la circulation de l'information au sein de l'entreprise

Canaux retenus :
• Intranet : mises à jour hebdomadaires publiées chaque lundi matin
• Newsletter mensuelle envoyée par email à tous les salariés
• Réunions d'équipe bimensuelles (1re et 3e semaine du mois)
• Affichage papier dans les espaces communs pour les informations urgentes

Responsables : Direction de la Communication, en lien avec les managers.
Tout contenu publié doit être validé par le responsable de service avant diffusion.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Plan de communication interne 2025",
    longText: DOC_COMM_INTERNE,
    question: "Ce document décrit…",
    optionA: "une campagne de publicité à destination du grand public.",
    optionB: "les outils et rythmes de communication au sein de l'entreprise.",
    optionC: "les règles d'utilisation des réseaux sociaux par les salariés.",
    optionD: "un plan de formation à la communication professionnelle.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Plan de communication interne 2025",
    longText: DOC_COMM_INTERNE,
    question: "Selon ce plan, tout contenu publié doit…",
    optionA: "être approuvé par le directeur général.",
    optionB: "être rédigé par un professionnel de la communication.",
    optionC: "être validé par le responsable de service avant diffusion.",
    optionD: "être traduit en plusieurs langues pour tous les salariés.",
    correctAnswer: 'C',
  }));

  const DOC_TELETRAVAIL_TRANSFRONTALIER =
`CHARTE DE TÉLÉTRAVAIL TRANSFRONTALIER

La présente charte s'applique aux salariés résidant dans un pays frontalier et souhaitant exercer leur activité depuis leur domicile.

Conditions :
• Maximum 3 jours de télétravail par semaine
• Présence physique obligatoire au siège le jeudi
• Équipement informatique fourni par l'entreprise

Sécurité :
• Connexion obligatoire via le VPN de l'entreprise
• Interdiction de travailler depuis des réseaux Wi-Fi publics non sécurisés
• Chiffrement des données sur tout support mobile

La violation de ces règles peut entraîner la suspension du télétravail transfrontalier.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de télétravail transfrontalier",
    longText: DOC_TELETRAVAIL_TRANSFRONTALIER,
    question: "Cette charte s'adresse aux salariés qui…",
    optionA: "travaillent exclusivement depuis l'étranger.",
    optionB: "habitent dans un pays voisin et veulent télétravailler.",
    optionC: "souhaitent changer de pays pour leur emploi.",
    optionD: "voyagent fréquemment pour leur travail.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de télétravail transfrontalier",
    longText: DOC_TELETRAVAIL_TRANSFRONTALIER,
    question: "Concernant la sécurité informatique, la charte interdit de…",
    optionA: "se connecter depuis son domicile.",
    optionB: "utiliser un ordinateur fourni par l'entreprise.",
    optionC: "travailler via des réseaux Wi-Fi publics non sécurisés.",
    optionD: "stocker des fichiers sur le serveur de l'entreprise.",
    correctAnswer: 'C',
  }));

  const DOC_APPRENTI =
`GUIDE D'ACCUEIL DE L'APPRENTI(E)

Bienvenue dans notre entreprise ! Ce guide vous accompagnera tout au long de votre contrat d'apprentissage.

Votre tuteur/tutrice :
Désigné dès le premier jour, il ou elle est votre référent(e) principal(e). N'hésitez pas à lui poser vos questions.

Planning d'intégration :
• Semaine 1 : découverte des locaux, rencontre des équipes
• Semaine 2 : formation aux outils et procédures internes
• À partir du mois 2 : missions en autonomie progressive

Évaluation :
Un bilan intermédiaire est réalisé à mi-parcours (M+3), un bilan final à M+6 en lien avec le centre de formation.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide d'accueil de l'apprenti(e)",
    longText: DOC_APPRENTI,
    question: "D'après ce guide, le tuteur ou la tutrice est…",
    optionA: "évalué(e) par l'apprenti(e) à la fin du contrat.",
    optionB: "le ou la référent(e) principal(e) de l'apprenti(e).",
    optionC: "désigné(e) après la première semaine de travail.",
    optionD: "responsable de la paie de l'apprenti(e).",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide d'accueil de l'apprenti(e)",
    longText: DOC_APPRENTI,
    question: "Selon ce document, quand a lieu le bilan intermédiaire ?",
    optionA: "À la fin de la première semaine.",
    optionB: "Après 6 mois de contrat.",
    optionC: "À mi-parcours, soit 3 mois après le début.",
    optionD: "Au moment de la signature du contrat.",
    correctAnswer: 'C',
  }));

  const DOC_MISE_DISPOSITION =
`CONVENTION DE MISE À DISPOSITION DE SALARIÉ

La présente convention est conclue entre l'entreprise prêteuse (ci-après « le prêteur ») et l'entreprise utilisatrice (ci-après « l'utilisateur »).

Objet : mise à disposition du salarié M. Durant, technicien supérieur, pour une mission d'assistance technique.

Durée : du 1er mars au 31 août — renouvelable une fois sur accord des parties.

Conditions :
• Le salarié reste sous contrat avec le prêteur pendant toute la durée
• Le coût salarial (salaire + charges) est refacturé à l'utilisateur sans marge
• Le salarié conserve ses droits acquis (ancienneté, congés, formation)

En cas de litige, compétence du tribunal de Paris.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Convention de mise à disposition de salarié",
    longText: DOC_MISE_DISPOSITION,
    question: "Cette convention organise…",
    optionA: "le licenciement d'un salarié pour motif économique.",
    optionB: "le recrutement définitif d'un nouveau salarié.",
    optionC: "le prêt temporaire d'un salarié à une autre entreprise.",
    optionD: "la sous-traitance d'une prestation de service.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Convention de mise à disposition de salarié",
    longText: DOC_MISE_DISPOSITION,
    question: "Pendant la mise à disposition, le salarié…",
    optionA: "signe un nouveau contrat avec l'entreprise utilisatrice.",
    optionB: "perd ses droits à l'ancienneté accumulés.",
    optionC: "reste sous contrat avec son employeur d'origine.",
    optionD: "est rémunéré directement par l'entreprise utilisatrice.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 : Articles de presse ─────────────────────────────────────── */

  const ART_REVENU_UNIVERSEL =
`Le revenu universel de base fait l'objet de vifs débats dans de nombreux pays. Ses partisans soutiennent qu'il permettrait de réduire la pauvreté, de libérer les individus des emplois dégradants et d'accompagner les mutations du marché du travail liées à l'automatisation. Des expériences ont été menées en Finlande, au Kenya ou encore en Catalogne, avec des résultats encourageants sur le bien-être et l'employabilité des bénéficiaires.

Ses adversaires, en revanche, craignent un effet désincitatif sur le travail, un coût budgétaire insoutenable et une remise en cause des protections sociales existantes. Pour les syndicats, un tel dispositif risquerait de servir de prétexte à démanteler les acquis sociaux négociés de haute lutte.

La question de son financement reste centrale : impôt sur les robots, flat tax, TVA sociale ou redistribution depuis les aides sociales existantes — chaque modèle implique des choix de société radicaux.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Le revenu universel : utopie ou nécessité ?",
    longText: ART_REVENU_UNIVERSEL,
    question: "Selon cet article, les partisans du revenu universel font valoir que…",
    optionA: "il permettrait d'éliminer totalement le chômage.",
    optionB: "il accompagnerait les transformations du travail dues à l'automatisation.",
    optionC: "il réduirait les inégalités entre pays riches et pays pauvres.",
    optionD: "il serait financé uniquement par les grandes entreprises.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Le revenu universel : utopie ou nécessité ?",
    longText: ART_REVENU_UNIVERSEL,
    question: "D'après cet article, les syndicats s'opposent au revenu universel car ils craignent…",
    optionA: "une augmentation incontrôlée des dépenses publiques.",
    optionB: "une remise en cause des acquis sociaux.",
    optionC: "une dépréciation des salaires dans le secteur privé.",
    optionD: "une généralisation du travail précaire.",
    correctAnswer: 'B',
  }));

  const ART_PERMACULTURE =
`La permaculture, née dans les années 1970, propose de concevoir des systèmes agricoles inspirés des écosystèmes naturels. En associant plantes, animaux et micro-organismes de façon synergique, cette approche vise à produire des aliments de qualité tout en régénérant les sols et en réduisant les intrants chimiques.

Des expériences menées dans plusieurs pays montrent des résultats prometteurs : diversification des cultures, résilience face aux aléas climatiques, réduction de la consommation d'eau. Certaines fermes en permaculture atteignent des rendements comparables à l'agriculture conventionnelle après une phase de transition de trois à cinq ans.

Cependant, des limites subsistent. La permaculture reste exigeante en main-d'œuvre, difficile à mécaniser à grande échelle et peu adaptée aux monocultures intensives qui alimentent les marchés mondiaux. Elle représente une alternative crédible pour les circuits courts et l'autonomie alimentaire locale, mais ne peut à elle seule nourrir une population mondiale de huit milliards de personnes.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "La permaculture : une agriculture durable ?",
    longText: ART_PERMACULTURE,
    question: "Selon cet article, la permaculture vise principalement à…",
    optionA: "maximiser les rendements par l'utilisation d'engrais modernes.",
    optionB: "imiter les écosystèmes naturels pour produire durablement.",
    optionC: "remplacer tous les types d'agriculture conventionnelle.",
    optionD: "développer des semences génétiquement modifiées.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "La permaculture : une agriculture durable ?",
    longText: ART_PERMACULTURE,
    question: "D'après cet article, quelle est la principale limite de la permaculture ?",
    optionA: "Elle produit des aliments de mauvaise qualité nutritionnelle.",
    optionB: "Elle est inadaptée aux pays tropicaux.",
    optionC: "Elle est difficile à déployer à grande échelle industrielle.",
    optionD: "Elle est trop coûteuse pour les petits agriculteurs.",
    correctAnswer: 'C',
  }));

  const ART_HANDISPORT =
`Les Jeux paralympiques de Paris 2024 ont marqué un tournant dans la reconnaissance du sport handisport en France. Pour la première fois, les épreuves paralympiques ont bénéficié d'une couverture médiatique comparable aux Jeux olympiques, attirant des millions de téléspectateurs et remplissant les stades.

Cette visibilité inédite a mis en lumière les performances exceptionnelles des athlètes en situation de handicap, longtemps cantonnés à une couverture médiatique marginale. Des champions comme Alexis Hanquinquant ou Nantenin Keïta sont devenus de véritables icônes populaires.

Pourtant, de nombreux obstacles subsistent : l'accessibilité insuffisante des équipements sportifs, le manque de financement des clubs handisport et les préjugés persistants dans la société. Des associations appellent à profiter de l'élan médiatique pour imposer des réformes structurelles durables, au-delà de l'effet d'aubaine lié aux Jeux.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Handisport : l'élan des Jeux de Paris 2024",
    longText: ART_HANDISPORT,
    question: "D'après cet article, quelle nouveauté ont apporté les Jeux de Paris 2024 pour le handisport ?",
    optionA: "La création de nouvelles disciplines paralympiques.",
    optionB: "Une couverture médiatique comparable aux Jeux olympiques.",
    optionC: "L'augmentation significative des budgets alloués aux clubs.",
    optionD: "L'accueil de nouveaux pays dans les compétitions.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Handisport : l'élan des Jeux de Paris 2024",
    longText: ART_HANDISPORT,
    question: "Selon cet article, quels défis restent à relever pour le handisport ?",
    optionA: "Améliorer le niveau sportif des athlètes paralympiques.",
    optionB: "Organiser des compétitions handisport dans le monde entier.",
    optionC: "Assurer un financement pérenne et améliorer l'accessibilité.",
    optionD: "Créer une fédération internationale indépendante.",
    correctAnswer: 'C',
  }));

  const ART_DIASPORA =
`La question de l'identité pour les membres de la diaspora africaine nés ou grandis en Europe est complexe et souvent douloureuse. Se définir comme Français et Camerounais, comme Belge et Congolais, implique de naviguer en permanence entre deux cultures, deux langues, deux visions du monde.

Les chercheurs en sciences sociales parlent d'identité biculturelle ou transnationale : une appartenance double, ni totalement intégrée dans le pays d'accueil ni entièrement connectée au pays d'origine. Cette double appartenance peut être vécue comme une richesse — une capacité à naviguer entre plusieurs mondes — mais aussi comme une source de souffrance, un sentiment d'être « entre deux chaises ».

Les deuxième et troisième générations de la diaspora développent des stratégies d'intégration variées : certains s'efforcent de s'assimiler pleinement à la culture du pays d'accueil, d'autres revendiquent fièrement leur double héritage, d'autres encore se construisent une identité métisse originale, nourrie par les deux cultures.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Identité et diaspora africaine en Europe",
    longText: ART_DIASPORA,
    question: "Selon cet article, l'identité biculturelle est décrite comme…",
    optionA: "une source de problèmes administratifs pour les migrants.",
    optionB: "une expérience qui peut être à la fois enrichissante et difficile.",
    optionC: "un obstacle à l'intégration dans le pays d'accueil.",
    optionD: "un phénomène uniquement propre à la première génération.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Identité et diaspora africaine en Europe",
    longText: ART_DIASPORA,
    question: "D'après cet article, comment les nouvelles générations de la diaspora gèrent-elles leur double héritage ?",
    optionA: "Elles rejettent systématiquement la culture du pays d'accueil.",
    optionB: "Elles abandonnent leur culture d'origine pour s'intégrer.",
    optionC: "Elles adoptent des stratégies variées face à cette double appartenance.",
    optionD: "Elles retournent toutes dans leur pays d'origine à l'âge adulte.",
    correctAnswer: 'C',
  }));

  return qs;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
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

    let created = 0;
    for (const data of questions) {
      await prisma.question.create({ data });
      process.stdout.write(`\r   ✓ Q${data.questionOrder} insérée`);
      created++;
    }
    console.log(`\n✅ ${created} questions créées pour CE 24.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
