'use strict';
/**
 * seed-ce-serie38.js
 * Peuple la série CE 38 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie38.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoki6000y0wxl08orms6e';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire : « Un incident majeur au troisième trimestre a provoqué une
   chute des ventes à un niveau quasi nul avant un fort rebond. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [75, 80, 5, 82], color: '#003087' },   // CORRECT — effondrement Q3
    { label: 'Graphique 2', data: [40, 55, 72, 90], color: '#E30613' },  // croissance
    { label: 'Graphique 3', data: [90, 75, 55, 35], color: '#E30613' },  // déclin
    { label: 'Graphique 4', data: [60, 62, 58, 60], color: '#E30613' },  // stable
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
`CENTRE NAUTIQUE DE RONCE-LES-BAINS — INITIATION PLONGÉE

Niveaux : baptême (30 min, -5 m) / niveau 1 (4 séances, -12 m) / niveau 2 (6 séances, -20 m)
Équipement : combinaison, palmes, masque, détendeur fournis par le centre

Sites de plongée : épave de La Grisette, récifs de Cordouan, fonds de sable herbiers
Tarifs : baptême 45 € | niveau 1 : 180 € | niveau 2 : 280 €

Inscriptions ouvertes d'avril à septembre. Groupes de 6 personnes max.
⚠ Certificat médical de non-contre-indication obligatoire`,
    question: "Quel document est obligatoire pour participer aux plongées ?",
    optionA: "Un passeport à jour.",
    optionB: "Une attestation d'assurance.",
    optionC: "Un certificat médical de non-contre-indication.",
    optionD: "Un brevet de natation.",
    correctAnswer: 'C',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`ESPACES VERTS MUNICIPAUX — RÈGLEMENT D'USAGE

Pour le bien-être de tous, merci de respecter les règles suivantes :

• Chiens : tenus en laisse en permanence. Déjections ramassées obligatoirement.
• Barbecue : strictement interdit dans tous les espaces verts de la ville.
• Déchets : utiliser les corbeilles prévues à cet effet. Dépôts sauvages passibles d'amende.
• Accès : les espaces de jeux pour enfants sont réservés aux moins de 12 ans.
• Heures de tranquillité : de 21 h à 7 h, nuisances sonores interdites.`,
    question: "Que risque-t-on en cas de dépôt sauvage de déchets ?",
    optionA: "Une exclusion temporaire du parc.",
    optionB: "Une amende.",
    optionC: "Une mise en garde écrite.",
    optionD: "Rien, ce n'est pas précisé.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`CINÉMA LA LANTERNE — ÉVÉNEMENT SPÉCIAL

Vendredi 14 novembre à 20 h 30

CONCERT-PROJECTION : « NOSFERATU » (1922)
Film muet de F.W. Murnau avec accompagnement musical live

Orchestre de chambre « Les Voix de la Nuit » — 8 musiciens
Compositions originales créées spécialement pour cette projection

Tarifs : 22 € / réduit 16 €
Réservation obligatoire : billetterie@cinelanterne.fr
⚠ Salle à jauge réduite — 80 places uniquement`,
    question: "Quelle est la particularité de cette projection ?",
    optionA: "Le film est en couleur et restauré.",
    optionB: "Un orchestre joue en direct pendant la projection.",
    optionC: "Le film est sous-titré en plusieurs langues.",
    optionD: "L'entrée est gratuite pour les étudiants.",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`BAR À SOUPES DU MONDE — MENU DU JOUR

Soupes du moment :
• Pho vietnamien (bouillon de bœuf, nouilles de riz, herbes fraîches) — 9,50 €
• Gaspacho andalou froid (tomate, concombre, poivron) — 7,50 €
• Minestrone italien (légumes de saison, parmesan) — 8 €
• Soupe miso japonaise (tofu, algues, champignons shiitaké) — 7 €

Accompagnements : pain artisanal tranché ou focaccia (+1,50 €)
Boissons : eau infusée maison, thé du monde — 2,50 €

Formule soupe + pain + boisson : réduction 10 %`,
    question: "Quelle réduction offre la formule complète ?",
    optionA: "5 %.",
    optionB: "8 %.",
    optionC: "10 %.",
    optionD: "15 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`HUMIDIFICATEUR ULTRASONIQUE AQUAZEN 3L

Réglage du taux d'humidité : molette de 40 % à 80 % (idéal : 50-60 %)
Eau : utiliser exclusivement de l'eau distillée ou déminéralisée pour éviter les dépôts calcaires.
Diffusion d'huiles essentielles : verser 5 à 10 gouttes dans le réservoir (compatibles uniquement avec les HE certifiées).
Nettoyage : vider et rincer le réservoir toutes les 48 h. Nettoyer la membrane ultrasonique avec un coton-tige chaque semaine.

⚠ Ne pas utiliser d'eau du robinet — risque de dépôt blanc sur les meubles.
Autonomie : environ 12 h en continu.`,
    question: "Quel type d'eau doit-on utiliser dans cet humidificateur ?",
    optionA: "De l'eau du robinet.",
    optionB: "De l'eau de source.",
    optionC: "De l'eau distillée ou déminéralisée.",
    optionD: "De l'eau filtrée.",
    correctAnswer: 'C',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`PÔLE EMPLOI AGENCE DE SAINT-MARTIN — ACCUEIL

Horaires d'accueil sans rendez-vous : lundi, mercredi, vendredi de 9 h à 12 h
Rendez-vous personnalisés : sur demande par téléphone ou sur le site pole-emploi.fr

Téléphone : 3949 (service gratuit, appel depuis fixe ou mobile)

Documents à apporter pour l'inscription : pièce d'identité + justificatif de domicile + relevé d'identité bancaire + attestation Pôle Emploi de l'employeur

Attention : aucun dossier incomplet ne sera traité le jour même.`,
    question: "Que risque-t-on si son dossier est incomplet le jour de la visite ?",
    optionA: "Un rendez-vous annulé sans indemnité.",
    optionB: "Un traitement différé à une date ultérieure.",
    optionC: "Un dossier non traité le jour même.",
    optionD: "Une pénalité financière.",
    correctAnswer: 'C',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`ASSOCIATION SOLIDARITÉ VERTE — NOTE INTERNE

Objet : Bilan financier et cadre de gestion

À l'attention de tous les membres bénévoles,

Suite à la vérification comptable effectuée en septembre, le conseil d'administration rappelle les règles de base :

1. Tout achat dépassant 150 € doit être préalablement validé par le trésorier.
2. Les remboursements de frais doivent être accompagnés de justificatifs originaux.
3. Un rapport financier trimestriel sera désormais communiqué à tous les membres.
4. La prochaine assemblée générale examinera le budget prévisionnel 2025.

Merci de votre coopération.`,
    question: "À partir de quel montant un achat doit-il être validé par le trésorier ?",
    optionA: "50 €.",
    optionB: "100 €.",
    optionC: "150 €.",
    optionD: "200 €.",
    correctAnswer: 'C',
  }));

  /* ── Q8-13 ──────────────────────────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le directeur a ___ une réunion extraordinaire pour lundi matin afin de discuter du plan de restructuration.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "annulé",
    optionB: "convoqué",
    optionC: "refusé",
    optionD: "préparé",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Cette solution technique est ___ par la majorité des experts du secteur comme la plus fiable.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refusée",
    optionB: "ignorée",
    optionC: "reconnue",
    optionD: "proposée",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Il est ___ de ne pas divulguer les informations confidentielles discutées lors de cette réunion.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "conseillé",
    optionB: "interdit",
    optionC: "inutile",
    optionD: "obligatoire",
    correctAnswer: 'D',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les travaux de rénovation ont été ___ en raison du mauvais temps persistant cette semaine.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "accélérés",
    optionB: "achevés",
    optionC: "suspendus",
    optionD: "planifiés",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le comité a ___ de reporter la décision finale à la prochaine session ordinaire.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "décidé",
    optionB: "oublié",
    optionC: "contesté",
    optionD: "interdit",
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour faciliter l'___ des visiteurs, un système de badges électroniques a été installé à l'entrée.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "identification",
    optionB: "surveillance",
    optionC: "exclusion",
    optionD: "formation",
    correctAnswer: 'A',
  }));

  /* ── Q14-17 ──────────────────────────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "Le sport de haut niveau exige des [14] considérables en termes de temps et d'énergie. Les athlètes professionnels doivent concilier entraînements intensifs et vie personnelle, ce qui peut parfois conduire à des [15] physiques et psychologiques sévères.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le sport de haut niveau',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "résultats",
    optionB: "sacrifices",
    optionC: "gains",
    optionD: "plaisirs",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le sport de haut niveau',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "progrès",
    optionB: "performances",
    optionC: "épuisements",
    optionD: "victoires",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La ville de demain se veut [16] et connectée. Les urbanistes misent sur le développement des transports en commun, la multiplication des espaces verts et la [17] des îlots de chaleur pour améliorer la qualité de vie des citadins.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La ville de demain',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "polluée",
    optionB: "durable",
    optionC: "ancienne",
    optionD: "compacte",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La ville de demain',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "création",
    optionB: "réduction",
    optionC: "augmentation",
    optionD: "mesure",
    correctAnswer: 'B',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Bien A', content: "Studio 22 m² — Centre-ville. Rendement locatif brut estimé : 7,2 %/an. Loyer actuel : 550 €/mois. Charges de copropriété faibles. Prix : 91 000 €." },
    { title: 'Bien B', content: "T2 45 m² — Quartier étudiant. Loyer 720 €/mois. Rendement 5,8 %. Toujours loué depuis 3 ans. Travaux de peinture à prévoir. Prix : 148 000 €." },
    { title: 'Bien C', content: "Maison 90 m² avec garage — Banlieue. Loyer potentiel estimé 950 €. Rendement estimé à 4,5 %. Grands travaux de rénovation nécessaires. Prix : 252 000 €." },
    { title: 'Bien D', content: "T3 65 m² — Résidence sécurisée. Loyer 1 100 €/mois. Charges élevées (gardien, piscine). Rendement 4,2 %. Facilité de revente. Prix : 314 000 €." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel appartement offre le meilleur rendement locatif ?",
    optionA: "Bien A",
    optionB: "Bien B",
    optionC: "Bien C",
    optionD: "Bien D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Stage A', content: "Stage surf débutants — 1 semaine, côte basque. Hébergement en surf camp inclus (dortoir 8 personnes). Matériel fourni. Prix : 550 € tout compris." },
    { title: 'Stage B', content: "Stage surf perfectionnement — 5 jours. Sans hébergement. Moniteur pro. Location de planche incluse. Prix : 320 €." },
    { title: 'Stage C', content: "Séjour surf familial — 2 semaines. Villa privatisée pour 4 personnes. Cours 3h/jour. Prix : 2 400 € la villa." },
    { title: 'Stage D', content: "Stage surf et yoga — 1 semaine. Hôtel 3 étoiles individuel. Surf le matin, yoga le soir. Prix : 890 €/pers." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel stage propose un hébergement en surf camp ?",
    optionA: "Stage A",
    optionB: "Stage B",
    optionC: "Stage C",
    optionD: "Stage D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Poste 1', content: "Architecte — Agence Forme & Espace. Projets résidentiels haut de gamme. Maîtrise d'AutoCAD requise. Connaissance BIM/Revit indispensable. 5 ans d'expérience. Salaire : 52 000 €." },
    { title: 'Poste 2', content: "Dessinateur projeteur — Bureau d'études techniques. Plans 2D sur AutoCAD. BIM non requis. 3 ans d'expérience. Salaire : 36 000 €." },
    { title: 'Poste 3', content: "Chef de projet architecture — Grand groupe de promotion. Coordination des équipes, relation client. AutoCAD ou Revit. 8 ans d'expérience minimum. Salaire : 70 000 €." },
    { title: 'Poste 4', content: "Architecte décorateur intérieur — Studio Maison. Logiciel 3D libre. Portfolio exigé. Pas de BIM requis. 2 ans minimum. Salaire : 34 000 €." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste requiert la maîtrise de BIM/Revit ?",
    optionA: "Poste 1",
    optionB: "Poste 2",
    optionC: "Poste 3",
    optionD: "Poste 4",
    correctAnswer: 'A',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Produit A', content: "Peinture intérieure acrylique — Blanc pur. Couverture en 1 seule couche sur murs préparés. Séchage 2 h. 10 L. Garantie 5 ans. Prix : 45 €." },
    { title: 'Produit B', content: "Primaire d'accrochage universel — Pour murs friables ou ancienne peinture. Deux couches obligatoires avant peinture de finition. Séchage 4 h/couche. 5 L. Prix : 28 €." },
    { title: 'Produit C', content: "Enduit de rebouchage rapide — Séchage 30 min, ponçable. Pour fissures et trous jusqu'à 10 mm. 1 kg. Prix : 12 €." },
    { title: 'Produit D', content: "Vernis parquet à l'eau — 3 couches recommandées. Résistant au trafic intense. Séchage entre couches 3 h. 2,5 L. Garantie 10 ans. Prix : 35 €." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel produit nécessite deux couches d'application ?",
    optionA: "Produit A",
    optionB: "Produit B",
    optionC: "Produit C",
    optionD: "Produit D",
    correctAnswer: 'B',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Un incident majeur au troisième trimestre a provoqué une chute des ventes à un niveau quasi nul avant un fort rebond.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_ALUMNI =
`RÈGLEMENT — RÉSEAU ALUMNI DE L'ENTREPRISE

Le réseau alumni réunit les anciens collaborateurs de l'entreprise souhaitant maintenir des liens professionnels.

Adhésion : gratuite pour les anciens salariés ayant quitté l'entreprise depuis moins de 10 ans. Au-delà, une contribution annuelle de 30 € est demandée.
Événements : le réseau organise deux événements annuels (printemps et automne) auxquels les membres actifs sont invités en priorité.
Annuaire : un annuaire en ligne sécurisé permet aux membres de se retrouver et de se mettre en contact.
Mentorat : les membres expérimentés peuvent proposer leur accompagnement à de jeunes anciens salariés via le programme de mentorat.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Réseau alumni de l'entreprise",
    longText: DOC_ALUMNI,
    question: "À partir de quand une contribution financière est-elle demandée ?",
    optionA: "Dès la sortie de l'entreprise.",
    optionB: "Après 5 ans de départ.",
    optionC: "Après 10 ans de départ.",
    optionD: "Jamais, l'adhésion est toujours gratuite.",
    correctAnswer: 'C',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Réseau alumni de l'entreprise",
    longText: DOC_ALUMNI,
    question: "Combien d'événements le réseau alumni organise-t-il par an ?",
    optionA: "1.",
    optionB: "2.",
    optionC: "3.",
    optionD: "4.",
    correctAnswer: 'B',
  }));

  const DOC_BONUS =
`NOTE — POLITIQUE DE BONUS EXCEPTIONNELS

Les bonus exceptionnels peuvent être accordés aux collaborateurs en reconnaissance de performances individuelles ou collectives remarquables.

Critères : atteinte d'un objectif exceptionnel non planifié, gestion réussie d'une crise majeure, apport d'une innovation à fort impact.
Plafond : le bonus exceptionnel ne peut dépasser 20 % du salaire annuel brut du bénéficiaire.
Fiscalité : soumis aux charges sociales et à l'impôt sur le revenu dans les conditions habituelles.
Versement : au cours du trimestre suivant la validation par la direction générale.
Proposition : toute proposition de bonus doit être formulée par écrit par le manager N+1 et approuvée par le DRH.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Politique de bonus exceptionnels",
    longText: DOC_BONUS,
    question: "Quel est le plafond d'un bonus exceptionnel ?",
    optionA: "10 % du salaire annuel.",
    optionB: "15 % du salaire annuel.",
    optionC: "20 % du salaire annuel.",
    optionD: "30 % du salaire annuel.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Politique de bonus exceptionnels",
    longText: DOC_BONUS,
    question: "Qui doit formuler la proposition de bonus exceptionnel par écrit ?",
    optionA: "Le collaborateur lui-même.",
    optionB: "Le manager N+1.",
    optionC: "Le directeur général.",
    optionD: "Le comité d'entreprise.",
    correctAnswer: 'B',
  }));

  const DOC_SOBRIETE =
`CHARTE DE SOBRIÉTÉ MATÉRIELLE — Nos bureaux en 2025

Face aux impératifs environnementaux, notre entreprise adopte une charte de sobriété matérielle.

Matériel reconditionné : dès 2025, 60 % des achats informatiques seront des appareils reconditionnés certifiés Grade A.
Partage d'équipements : les imprimantes seront mutualisées (1 pour 15 personnes), les vidéoprojecteurs réservés via un système commun.
Impression : objectif de réduction de 50 % du volume de papier imprimé. L'impression recto-verso est activée par défaut.
Déchets : chaque bureau disposera d'un bac de tri spécifique pour les cartouches, câbles et équipements électroniques usagés.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de sobriété matérielle — Bureaux 2025",
    longText: DOC_SOBRIETE,
    question: "Quelle proportion d'achats informatiques sera reconditionnée dès 2025 ?",
    optionA: "30 %.",
    optionB: "40 %.",
    optionC: "60 %.",
    optionD: "80 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de sobriété matérielle — Bureaux 2025",
    longText: DOC_SOBRIETE,
    question: "Quel est l'objectif de réduction du volume de papier imprimé ?",
    optionA: "25 %.",
    optionB: "30 %.",
    optionC: "40 %.",
    optionD: "50 %.",
    correctAnswer: 'D',
  }));

  const DOC_CDI_INTERIMAIRE =
`INFORMATION — CDI INTÉRIMAIRE : NOUVELLES RÈGLES

Le CDI intérimaire permet à une agence d'emploi de proposer un contrat à durée indéterminée à un travailleur intérimaire qualifié.

Conditions : le CDI intérimaire est réservé aux travailleurs ayant effectué au moins 450 heures de mission via l'agence.
Avantages : salaire garanti entre les missions (salaire mensuel minimum garanti = 80 % du dernier salaire), accès facilité aux crédits immobiliers.
Transition : les travailleurs intérimaires éligibles doivent faire une demande formelle. L'agence dispose de 15 jours pour répondre.
DPAE : la déclaration préalable à l'embauche (DPAE) est obligatoire avant toute prise de poste.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Information — CDI intérimaire : nouvelles règles",
    longText: DOC_CDI_INTERIMAIRE,
    question: "Combien d'heures de mission faut-il avoir effectuées pour être éligible au CDI intérimaire ?",
    optionA: "200 heures.",
    optionB: "350 heures.",
    optionC: "450 heures.",
    optionD: "600 heures.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Information — CDI intérimaire : nouvelles règles",
    longText: DOC_CDI_INTERIMAIRE,
    question: "À quel pourcentage du dernier salaire est garanti le salaire minimum mensuel entre les missions ?",
    optionA: "60 %.",
    optionB: "70 %.",
    optionC: "80 %.",
    optionD: "100 %.",
    correctAnswer: 'C',
  }));

  const DOC_CONFIDENTIELS =
`PROCÉDURE — ACCÈS AUX DOCUMENTS CONFIDENTIELS

Les documents classifiés confidentiels ne peuvent être consultés qu'après habilitation spécifique.

Niveaux d'habilitation : niveau 1 (confidentiel interne), niveau 2 (confidentiel restreint), niveau 3 (secret d'entreprise).
Demande : toute demande d'habilitation doit être soumise au responsable sécurité et approuvée par la direction générale. Délai de traitement : 10 jours ouvrables.
Registre : un registre numérique enregistre toutes les consultations (identifiant, date, heure, document). Ce registre est audité trimestriellement.
Destruction : les documents en fin de vie classifiés doivent être détruits par broyage, en présence de deux témoins, et consignés dans le registre.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Procédure — Accès aux documents confidentiels",
    longText: DOC_CONFIDENTIELS,
    question: "Quel est le délai de traitement d'une demande d'habilitation ?",
    optionA: "5 jours ouvrables.",
    optionB: "10 jours ouvrables.",
    optionC: "15 jours ouvrables.",
    optionD: "30 jours ouvrables.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Procédure — Accès aux documents confidentiels",
    longText: DOC_CONFIDENTIELS,
    question: "À quelle fréquence le registre de consultation est-il audité ?",
    optionA: "Mensuellement.",
    optionB: "Semestriellement.",
    optionC: "Trimestriellement.",
    optionD: "Annuellement.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 ──────────────────────────────────────────────────────────── */

  const ART_PRISON =
`En France, le taux de récidive des anciens détenus est estimé à 63 % dans les cinq ans suivant la libération, selon les dernières statistiques du ministère de la Justice. Ce chiffre alarmant relance régulièrement le débat sur l'efficacité du système carcéral comme outil de réhabilitation sociale.

Des expériences innovantes tentent de briser ce cycle. Dans plusieurs établissements, des programmes de formation professionnelle en partenariat avec des entreprises permettent aux détenus d'acquérir des compétences monnayables à la sortie : cuisiniers, informaticiens, jardiniers, couturières. Des résultats encourageants sont observés : le taux de récidive des participants à ces programmes est inférieur de 30 points à la moyenne nationale.

Le financement reste le principal obstacle : ces programmes coûteux peinent à être généralisés, faute de volonté politique et de budgets dédiés.

Des associations de réinsertion, comme Fondavenir, jouent un rôle crucial en assurant l'accompagnement à la sortie : logement, emploi, suivi psychologique. Mais elles soulignent l'insuffisance des moyens alloués par les pouvoirs publics.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Prison et réinsertion : briser le cycle de la récidive",
    longText: ART_PRISON,
    question: "Quel est le taux de récidive des anciens détenus dans les 5 ans selon cet article ?",
    optionA: "35 %.",
    optionB: "50 %.",
    optionC: "63 %.",
    optionD: "78 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Prison et réinsertion : briser le cycle de la récidive",
    longText: ART_PRISON,
    question: "Quel est le principal obstacle à la généralisation des programmes de formation en prison ?",
    optionA: "Le refus des entreprises de s'engager.",
    optionB: "Le financement insuffisant.",
    optionC: "Le manque d'intérêt des détenus.",
    optionD: "L'opposition des gardiens de prison.",
    correctAnswer: 'B',
  }));

  const ART_DESERT =
`La désertification médicale, longtemps cantonnée aux zones rurales, touche désormais aussi des villes moyennes et des banlieues. Selon la DREES, plus de 8 millions de Français vivent dans un désert médical, sans accès à un médecin généraliste à moins de 30 minutes.

Des solutions innovantes émergent pour pallier ce manque. La télémédecine, accélérée par la crise sanitaire de 2020, permet désormais une consultation à distance pour des actes non urgents. En 2023, plus de 20 millions de téléconsultations ont été réalisées en France, remboursées par l'Assurance maladie au même titre que les consultations physiques.

Les Maisons de Santé Pluriprofessionnelles (MSP) regroupant plusieurs professionnels de santé sous un même toit constituent une autre réponse. Plus de 2 000 MSP sont en activité en France, dans des zones autrefois délaissées.

Des incitations financières à l'installation en zones sous-dotées — exonérations fiscales, primes, logements de fonction — commencent à porter leurs fruits, mais les résultats restent hétérogènes selon les régions.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Déserts médicaux : des solutions innovantes pour un accès aux soins équitable",
    longText: ART_DESERT,
    question: "Combien de Français vivent dans un désert médical selon la DREES ?",
    optionA: "2 millions.",
    optionB: "5 millions.",
    optionC: "8 millions.",
    optionD: "12 millions.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Déserts médicaux : des solutions innovantes pour un accès aux soins équitable",
    longText: ART_DESERT,
    question: "Qu'est-ce qu'une MSP selon cet article ?",
    optionA: "Un hôpital de proximité.",
    optionB: "Un service de télémédecine.",
    optionC: "Un regroupement de plusieurs professionnels de santé en un lieu.",
    optionD: "Un programme de formation des médecins en zones rurales.",
    correctAnswer: 'C',
  }));

  const ART_IA_RADIO =
`L'intelligence artificielle révolutionne la radiologie oncologique. Des algorithmes d'apprentissage profond sont désormais capables de détecter des nodules pulmonaires de moins de 5 mm sur des scanners thoraciques, avec une sensibilité comparable ou supérieure à celle des radiologues expérimentés.

Une étude menée par l'Institut Curie sur 10 000 mammographies a montré que l'IA détectait 30 % de cancers supplémentaires par rapport à une lecture unique humaine. Ces résultats ont conduit à l'expérimentation d'une double lecture IA/radiologue dans plusieurs centres hospitaliers français.

Pour autant, la validation clinique reste indispensable. Les algorithmes performants sur un jeu de données peuvent échouer sur des populations différentes. La question de la responsabilité médicale en cas d'erreur de diagnostic assisté par IA reste également non résolue par le cadre légal actuel.

L'enjeu éthique est majeur : si l'IA améliore les diagnostics, elle soulève aussi des questions sur la réduction des postes de radiologues et sur la confidentialité des données de santé utilisées pour entraîner les modèles.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "IA et radiologie : révolution diagnostique et questions éthiques",
    longText: ART_IA_RADIO,
    question: "Quel résultat l'étude de l'Institut Curie a-t-elle mis en évidence ?",
    optionA: "L'IA est moins précise que les radiologues humains.",
    optionB: "L'IA détecte 30 % de cancers supplémentaires par rapport à une lecture unique.",
    optionC: "L'IA réduit les coûts de diagnostic de 50 %.",
    optionD: "L'IA peut remplacer complètement les radiologues.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "IA et radiologie : révolution diagnostique et questions éthiques",
    longText: ART_IA_RADIO,
    question: "Quelle question légale reste non résolue selon cet article ?",
    optionA: "Le financement des algorithmes d'IA.",
    optionB: "La responsabilité médicale en cas d'erreur de diagnostic assisté.",
    optionC: "La formation des radiologues aux outils numériques.",
    optionD: "Le remboursement des diagnostics par l'Assurance maladie.",
    correctAnswer: 'B',
  }));

  const ART_GENRE_ESPACE =
`L'urbanisme sensible au genre est une discipline émergente qui cherche à concevoir les espaces publics en tenant compte des expériences différenciées des femmes et des hommes dans la ville. Il part du constat que les femmes utilisent l'espace urbain différemment : elles ont des trajets plus complexes (travail, courses, école, crèche), se déplacent plus à pied et le soir, et ressentent davantage l'insécurité dans certains espaces.

Vienne, pionnière dans ce domaine depuis les années 1990, a reconfiguré plusieurs quartiers en consultant des groupes de femmes. Les résultats sont concrets : éclairage renforcé dans les passages souterrains, élargissement des trottoirs pour les poussettes, création d'espaces de jeux mixtes, signalétique inclusive.

En France, plusieurs villes expérimentent des démarches similaires, souvent dans le cadre de projets de rénovation urbaine. Les diagnostics en marchant permettent aux habitantes de signaler directement les zones d'inconfort ou de danger.

Des résultats mesurables sont observés : à Bordeaux, des améliorations de l'éclairage ont conduit à une hausse de 40 % de la fréquentation nocturne féminine dans certains quartiers.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Urbanisme sensible au genre : repenser la ville pour toutes et tous",
    longText: ART_GENRE_ESPACE,
    question: "Quelle ville est pionnière en urbanisme sensible au genre depuis les années 1990 ?",
    optionA: "Paris.",
    optionB: "Amsterdam.",
    optionC: "Vienne.",
    optionD: "Barcelone.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Urbanisme sensible au genre : repenser la ville pour toutes et tous",
    longText: ART_GENRE_ESPACE,
    question: "Quel résultat mesurable a été observé à Bordeaux suite aux améliorations de l'éclairage ?",
    optionA: "Une réduction de 40 % des incivilités.",
    optionB: "Une hausse de 40 % de la fréquentation nocturne féminine.",
    optionC: "Une réduction de 40 % des accidents.",
    optionD: "Une hausse de 40 % de la satisfaction des résidents.",
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

    console.log(`\n✅ ${inserted} questions créées pour CE 38.`);

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
