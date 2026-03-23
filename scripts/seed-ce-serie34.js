'use strict';
/**
 * seed-ce-serie34.js
 * Peuple la série CE 34 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie34.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyojso000u0wxljlyouhwe';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire : « Les ventes de cette entreprise atteignent leur maximum au
   premier et au troisième trimestre, avec un ralentissement notable entre les deux. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [88, 45, 85, 40], color: '#003087' },  // CORRECT — deux pics Q1 et Q3
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

  // Q1 — Programme de randonnée nordique
  qs.push(q(1, 'Q1-7', null, {
    longText:
`CLUB NORDIQUE DES ALPES — RANDONNÉE HIVERNALE

Samedi 18 janvier — Départ : 8 h 30

Parcours : 14 km | Dénivelé : 650 m | Durée estimée : 6 h
Niveau requis : intermédiaire (bonne condition physique)

Équipement obligatoire :
• Raquettes ou skis de fond (location possible sur place)
• Bâtons télescopiques, guêtres, couches thermiques
• Déjeuner et 2 L d'eau minimum

Inscription avant le 15 janvier — Places limitées à 20 participants
Tarif : 25 € (adhérents) / 35 € (non-adhérents)`,
    question: "Quel niveau physique est requis pour cette randonnée ?",
    optionA: "Débutant.",
    optionB: "Intermédiaire.",
    optionC: "Expert uniquement.",
    optionD: "Aucun prérequis.",
    correctAnswer: 'B',
  }));

  // Q2 — Règlement karting adultes
  qs.push(q(2, 'Q1-7', null, {
    longText:
`PISTE DE KARTING VITESSE MAX — RÈGLEMENT ADULTES

Âge minimum : 16 ans révolus
Tenue obligatoire : combinaison ignifugée (fournie), casque intégral (fourni), sous-cagoule (achat possible à l'accueil)

Briefing de sécurité : obligatoire avant chaque session, durée 10 min
Sessions disponibles : 10 min / 20 min / Formule Grand Prix 30 min
Tarifs : 15 € / 25 € / 45 €

⚠ Alcool interdit — Toute infraction entraîne l'exclusion immédiate sans remboursement`,
    question: "Quel équipement les pilotes doivent-ils obligatoirement apporter eux-mêmes ?",
    optionA: "Un casque intégral.",
    optionB: "Une combinaison ignifugée.",
    optionC: "Une sous-cagoule.",
    optionD: "Rien, tout est fourni.",
    correctAnswer: 'C',
  }));

  // Q3 — Affiche projection documentaire
  qs.push(q(3, 'Q1-7', null, {
    longText:
`CINÉ-CLUB ENGAGÉ
Projection — Mardi 4 mars — 19 h 00

« TERRES BRÛLÉES »
Documentaire sur les déserts qui avancent — 90 min

Thème : déforestation, désertification et migrations climatiques en Afrique subsaharienne

Suivi d'un débat avec Pr. Aïssa Kaboré, géographe et chercheur au CNRS

Entrée libre et gratuite — Salle Jean Vilar, Maison des Arts
Réservation conseillée : cineclub@maisondesarts.fr`,
    question: "Que se passe-t-il après la projection de ce documentaire ?",
    optionA: "Une visite guidée.",
    optionB: "Un débat avec un expert.",
    optionC: "Une exposition photo.",
    optionD: "Une signature de livre.",
    correctAnswer: 'B',
  }));

  // Q4 — Menu restaurant mexicain
  qs.push(q(4, 'Q1-7', null, {
    longText:
`EL RANCHO — RESTAURANT MEXICAIN AUTHENTIQUE

TACOS (3 pièces) : poulet grillé, bœuf épicé ou légumes rôtis — 12 €
BURRITOS : garnitures au choix, riz, haricots noirs — 14 €
GUACAMOLE maison + nachos — 7 €

VINS ROUGES importés : Tempranillo d'Espagne (27 €), Malbec d'Argentine (32 €)
COCKTAILS SANS ALCOOL : agua fresca, limonada mexicana — 5 €

Menu enfant disponible sur demande
Réservation : 04 72 88 11 45`,
    question: "Quelle boisson sans alcool figure sur la carte ?",
    optionA: "Un thé glacé.",
    optionB: "Un jus d'orange.",
    optionC: "Une limonada mexicana.",
    optionD: "Un café frappé.",
    correctAnswer: 'C',
  }));

  // Q5 — Mode d'emploi drone civil
  qs.push(q(5, 'Q1-7', null, {
    longText:
`DRONE PHOTOVISION X4 — GUIDE D'UTILISATION RAPIDE

Réglementation : vol interdit à moins de 50 m des personnes, au-dessus des zones habitées sans autorisation préfectorale et à plus de 150 m d'altitude.

Mise en vol : vérifier la charge de la batterie (autonomie 22 min), calibrer la boussole à l'extérieur, activer le mode GPS avant le décollage.

Caméra intégrée 4K : activation par l'application mobile dédiée. Stockage sur carte microSD (max 64 Go).

Batterie : recharge complète en 90 min. Ne jamais recharger une batterie gonflée.`,
    question: "Quelle est l'altitude maximale de vol autorisée selon ce document ?",
    optionA: "50 mètres.",
    optionB: "100 mètres.",
    optionC: "150 mètres.",
    optionD: "200 mètres.",
    correctAnswer: 'C',
  }));

  // Q6 — Horaires boulangerie artisanale
  qs.push(q(6, 'Q1-7', null, {
    longText:
`BOULANGERIE ARTISANALE « AU BON GRAIN »

Ouverture : mardi au samedi de 7 h à 13 h 30 et de 16 h à 19 h 30
Dimanche : 7 h à 13 h — Fermé lundi

Spécialités : pain au levain, croissants au beurre AOP, kouglof alsacien

Commandes spéciales (gâteaux, pièces montées) : 72 h à l'avance minimum

Livraison à domicile disponible le mercredi et vendredi matin
Renseignements : 03 68 42 17 09`,
    question: "Quel jour la boulangerie est-elle fermée ?",
    optionA: "Dimanche.",
    optionB: "Samedi.",
    optionC: "Lundi.",
    optionD: "Mardi.",
    correctAnswer: 'C',
  }));

  // Q7 — Lettre copropriétaire au syndic
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Madame, Monsieur,

Je me permets de vous contacter au sujet d'une gouttière défaillante située à l'angle nord-ouest de notre immeuble. Depuis plusieurs semaines, des infiltrations d'eau apparaissent sur le mur de ma chambre (lot n° 14, 3e étage).

Je vous demande de bien vouloir mandater une entreprise qualifiée pour effectuer les réparations nécessaires dans les plus brefs délais. Compte tenu des risques de détérioration de la structure, cette intervention me semble urgente.

Dans l'attente de votre réponse, veuillez agréer mes salutations distinguées.

M. Patrick Lorrain`,
    question: "Pourquoi M. Lorrain écrit-il au syndic ?",
    optionA: "Pour signaler un voisin bruyant.",
    optionB: "Pour demander une réparation urgente.",
    optionC: "Pour contester une décision de copropriété.",
    optionD: "Pour réclamer le remboursement de frais.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 : Phrases lacunaires ──────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin lui a ___ de se reposer plusieurs jours après l'opération.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "autorisé",
    optionB: "prescrit",
    optionC: "demandé",
    optionD: "conseillé",
    correctAnswer: 'D',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant de signer ce contrat, veuillez lire attentivement toutes les ___ en bas de page.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "images",
    optionB: "clauses",
    optionC: "pages",
    optionD: "titres",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce produit est ___ uniquement aux personnes majeures, sur présentation d'une pièce d'identité.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "offert",
    optionB: "vendu",
    optionC: "remis",
    optionD: "réservé",
    correctAnswer: 'D',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Suite à une forte demande, les inscriptions pour cette formation sont désormais ___.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "ouvertes",
    optionB: "clôturées",
    optionC: "annulées",
    optionD: "reportées",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'association a décidé de ___ ses activités dans un nouveau local plus spacieux.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "fermer",
    optionB: "vendre",
    optionC: "déménager",
    optionD: "réduire",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les résultats de l'examen seront ___ par voie électronique dans un délai de deux semaines.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "communiqués",
    optionB: "perdus",
    optionC: "imprimés",
    optionD: "vérifiés",
    correctAnswer: 'A',
  }));

  /* ── Q14-17 : Textes lacunaires ─────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "Le tourisme durable cherche à [14] l'impact négatif des voyages sur l'environnement. De nombreux voyageurs choisissent désormais des hébergements écologiques et des transports moins [15] en carbone pour préserver les sites naturels qu'ils visitent.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le tourisme durable',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "augmenter",
    optionB: "ignorer",
    optionC: "réduire",
    optionD: "mesurer",
    correctAnswer: 'C',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le tourisme durable',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "riches",
    optionB: "polluants",
    optionC: "coûteux",
    optionD: "chargés",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La méditation est une pratique ancestrale qui permet de [16] son attention sur le moment présent. Des études scientifiques récentes ont démontré qu'une pratique régulière diminue le [17] et améliore la qualité du sommeil.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La méditation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "disperser",
    optionB: "focaliser",
    optionC: "perdre",
    optionD: "éviter",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La méditation',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "bonheur",
    optionB: "travail",
    optionC: "stress",
    optionD: "bruit",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 : Lecture rapide / Listes d'annonces ─────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Appartement A', content: "Studio avec vue mer partielle, 2e étage, 28 m², balcon 4 m². Loyer 750 €/mois. Disponible juillet. Résidence calme, parking souterrain inclus." },
    { title: 'Appartement B', content: "T2 côté montagne, 45 m², terrasse 10 m². Loyer 850 €/mois, charges comprises. Disponible immédiatement. Pas de vue mer directe." },
    { title: 'Appartement C', content: "T3 en étage supérieur, 60 m², grande terrasse avec vue panoramique sur l'océan à 180°. Loyer 1 200 €/mois. Résidence gardée, piscine commune." },
    { title: 'Appartement D', content: "Studio rez-de-chaussée, 22 m², jardin privatif 20 m². Loyer 620 €/mois. Pas d'ascenseur, vue sur cour intérieure. Idéal pour animaux." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel appartement dispose d'une vue panoramique sur l'océan ?",
    optionA: "Appartement A",
    optionB: "Appartement B",
    optionC: "Appartement C",
    optionD: "Appartement D",
    correctAnswer: 'C',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Cours A', content: "Stage golf débutants — 3 jours. Matériel de golf fourni (clubs, balles, gants). Accès au putting green inclus. Prix : 180 €. Encadrement par un pro certifié PGA." },
    { title: 'Cours B', content: "Perfectionnement golf — 2 jours. Amenez votre propre matériel. Forfait green fee non inclus. Travail sur le swing et le jeu court. Prix : 220 €." },
    { title: 'Cours C', content: "Golf business — 1 journée. Initiation pour cadres. Tenue de golf requise. Matériel personnel conseillé. Déjeuner au club-house inclus. Prix : 150 €." },
    { title: 'Cours D', content: "Stage junior 8-14 ans — 5 jours. Matériel non fourni (location possible). Pédagogie ludique et progressive. Prix : 290 €. Forfait semaine complet." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel cours inclut le matériel de golf ?",
    optionA: "Cours A",
    optionB: "Cours B",
    optionC: "Cours C",
    optionD: "Cours D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Offre 1', content: "Juriste en droit des affaires nationales — Cabinet Dumont & Associés. Profil : 3 ans d'expérience minimum. Rémunération : 55 000 €/an. Poste basé à Lyon." },
    { title: 'Offre 2', content: "Avocat(e) en droit social — Cabinet RH Conseil. Missions : contentieux prud'homal, négociations collectives. Expérience requise : 5 ans. Salaire : selon profil." },
    { title: 'Offre 3', content: "Juriste droit immobilier — Promoteur national. Rédaction de promesses, baux commerciaux. 2 ans d'expérience. Salaire : 42 000 € + variable. Paris 15e." },
    { title: 'Offre 4', content: "Juriste en droit des affaires internationales — Firme internationale Lex Global. Maîtrise de l'anglais et de l'espagnol exigée. Déplacements fréquents. Expérience : 4 ans minimum. Salaire compétitif." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste est en droit des affaires internationales ?",
    optionA: "Offre 1",
    optionB: "Offre 2",
    optionC: "Offre 3",
    optionD: "Offre 4",
    correctAnswer: 'D',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Abonnement A', content: "GamePass Basic — Catalogue de 200 jeux à télécharger. Multijoueurs en ligne inclus. Pas de cloud gaming. Prix : 8 €/mois." },
    { title: 'Abonnement B', content: "GamePass Cloud — Jouez sans télécharger depuis n'importe quel appareil (smartphone, tablette, TV). Catalogue de 400 jeux. Multi-joueurs inclus. Prix : 15 €/mois." },
    { title: 'Abonnement C', content: "GamePass Family — Jusqu'à 5 comptes familiaux. Catalogue de 300 jeux à télécharger. Pas de cloud gaming. Prix : 22 €/mois." },
    { title: 'Abonnement D', content: "GamePass Pro — Catalogue premium 600 jeux, téléchargement uniquement. Accès anticipé aux sorties exclusives. Pas de streaming. Prix : 20 €/mois." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel abonnement permet de jouer sans télécharger ?",
    optionA: "Abonnement A",
    optionB: "Abonnement B",
    optionC: "Abonnement C",
    optionD: "Abonnement D",
    correctAnswer: 'B',
  }));

  /* ── Q22 : Graphiques ────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Les ventes de cette entreprise atteignent leur maximum au premier et au troisième trimestre, avec un ralentissement notable entre les deux.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 : Documents administratifs et professionnels ──────────────── */

  const DOC_ARCHIVES =
`RÈGLEMENT DE GESTION DES ARCHIVES — Entreprise Vectis SA

1. Durée de conservation
Les documents comptables sont conservés 10 ans. Les contrats de travail sont archivés 5 ans après la rupture du contrat. Les courriers commerciaux sont conservés 3 ans.

2. Destruction
Tout document arrivé en fin de période légale doit être détruit par broyage sécurisé. Un registre de destruction est tenu à jour par le responsable archives.

3. RGPD
Les données personnelles collectées ne peuvent être conservées au-delà de la durée nécessaire à leur traitement. Le délégué à la protection des données (DPO) veille au respect de ces obligations.

4. Responsable
Le responsable archives est désigné par la direction générale. Il est le seul habilité à autoriser l'accès aux archives historiques.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de gestion des archives — Vectis SA",
    longText: DOC_ARCHIVES,
    question: "Quelle est la durée de conservation des contrats de travail après leur rupture ?",
    optionA: "3 ans.",
    optionB: "5 ans.",
    optionC: "10 ans.",
    optionD: "Illimitée.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de gestion des archives — Vectis SA",
    longText: DOC_ARCHIVES,
    question: "Qui est habilité à donner l'accès aux archives historiques ?",
    optionA: "Le DPO.",
    optionB: "Tout salarié habilité.",
    optionC: "Le responsable archives.",
    optionD: "Le directeur commercial.",
    correctAnswer: 'C',
  }));

  const DOC_DONS =
`NOTE DE SERVICE — Politique de dons solidaires

Objet : Encadrement des dons d'entreprise aux associations

Notre entreprise s'engage à soutenir des causes d'intérêt général. Les dons peuvent être accordés à des associations reconnues d'utilité publique œuvrant dans les domaines suivants : éducation, santé, environnement et insertion professionnelle.

Budget annuel alloué : 15 000 €. Les demandes dépassant 3 000 € doivent être validées par le comité de direction.

Avantage fiscal : les dons ouvrent droit à une déduction fiscale de 60 % du montant versé dans la limite de 0,5 % du chiffre d'affaires.

Communication : tout don accordé fait l'objet d'une communication interne valorisant l'engagement solidaire de l'entreprise.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Politique de dons solidaires",
    longText: DOC_DONS,
    question: "Dans quel domaine les dons ne sont-ils PAS mentionnés ?",
    optionA: "Éducation.",
    optionB: "Culture.",
    optionC: "Santé.",
    optionD: "Environnement.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Politique de dons solidaires",
    longText: DOC_DONS,
    question: "À quel niveau de déduction fiscale les dons donnent-ils droit ?",
    optionA: "40 %.",
    optionB: "50 %.",
    optionC: "60 %.",
    optionD: "80 %.",
    correctAnswer: 'C',
  }));

  const DOC_ACHAT =
`CHARTE D'ACHAT RESPONSABLE — Groupe Solaris

Notre politique d'achat vise à intégrer des critères environnementaux, sociaux et éthiques dans le choix de nos fournisseurs.

Critères fournisseurs : priorité aux entreprises locales (dans un rayon de 200 km), proposant des produits bio ou labellisés, et respectant les conventions collectives de leur secteur.

Produits alimentaires : au moins 50 % des denrées achetées doivent être d'origine locale ou bio.

Éthique : tout fournisseur doit signer notre charte anti-corruption et prouver l'absence de travail forcé dans sa chaîne d'approvisionnement.

Révision annuelle de cette charte lors du comité achats responsables.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte d'achat responsable — Groupe Solaris",
    longText: DOC_ACHAT,
    question: "Quelle est la contrainte géographique pour les fournisseurs prioritaires ?",
    optionA: "Dans un rayon de 50 km.",
    optionB: "Dans un rayon de 100 km.",
    optionC: "Dans un rayon de 200 km.",
    optionD: "Sans contrainte géographique.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte d'achat responsable — Groupe Solaris",
    longText: DOC_ACHAT,
    question: "Qu'est-ce que tout fournisseur doit obligatoirement signer ?",
    optionA: "Un contrat de performance.",
    optionB: "Une charte anti-corruption.",
    optionC: "Un accord de livraison.",
    optionD: "Une convention de partenariat.",
    correctAnswer: 'B',
  }));

  const DOC_REINTEGRATION =
`GUIDE DE RÉINTÉGRATION APRÈS LONGUE ABSENCE

Ce guide s'adresse aux salariés reprenant le travail après un congé maternité, un arrêt maladie prolongé (plus de 3 mois) ou un congé parental.

Étapes de retour :
1. Entretien de retour avec le manager dans les 8 premiers jours
2. Visite médicale de reprise obligatoire (médecin du travail)
3. Bilan de compétences proposé si souhaité par le salarié
4. Programme de remise à niveau sur les outils et procédures mis à jour

Accompagnement : un référent de retour est nommé pour chaque salarié concerné. Il assure un suivi mensuel pendant les 3 premiers mois.

Contact RH : accompagnement@entreprise.fr`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide de réintégration après longue absence",
    longText: DOC_REINTEGRATION,
    question: "Quelle est la première étape du retour après une longue absence ?",
    optionA: "La visite médicale.",
    optionB: "Le bilan de compétences.",
    optionC: "L'entretien avec le manager.",
    optionD: "La formation aux nouveaux outils.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide de réintégration après longue absence",
    longText: DOC_REINTEGRATION,
    question: "Combien de temps dure le suivi mensuel du référent de retour ?",
    optionA: "1 mois.",
    optionB: "2 mois.",
    optionC: "3 mois.",
    optionD: "6 mois.",
    correctAnswer: 'C',
  }));

  const DOC_AUDIT =
`PROCÉDURE D'AUDIT INTERNE — Fréquence et organisation

Périmètre : tous les services de l'entreprise sont concernés par les audits internes annuels. Les unités présentant des risques identifiés peuvent faire l'objet d'audits supplémentaires.

Fréquence : au minimum une fois par an par service. Les audits de conformité RGPD ont lieu tous les semestres.

Équipe d'audit : composée de 2 à 4 auditeurs internes certifiés, indépendants des services audités.

Rapport : les conclusions sont transmises au comité de direction dans les 15 jours suivant l'audit. Un plan d'actions correctives doit être soumis dans les 30 jours.

Suites : les plans d'actions sont suivis trimestriellement par le responsable qualité.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Procédure d'audit interne",
    longText: DOC_AUDIT,
    question: "Dans quel délai les conclusions d'audit sont-elles transmises à la direction ?",
    optionA: "Dans les 7 jours.",
    optionB: "Dans les 15 jours.",
    optionC: "Dans les 30 jours.",
    optionD: "Dans les 60 jours.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Procédure d'audit interne",
    longText: DOC_AUDIT,
    question: "À quelle fréquence les plans d'actions correctives sont-ils suivis ?",
    optionA: "Mensuellement.",
    optionB: "Semestriellement.",
    optionC: "Annuellement.",
    optionD: "Trimestriellement.",
    correctAnswer: 'D',
  }));

  /* ── Q33-40 : Articles de presse ─────────────────────────────────────── */

  const ART_MEMOIRE =
`La transmission de la mémoire intergénérationnelle est au cœur d'un projet pilote lancé dans plusieurs écoles primaires françaises. Des personnes âgées de plus de 75 ans sont invitées à venir témoigner de leur vécu historique devant des classes de CM1 et CM2.

Ces rencontres, encadrées par les enseignants, s'appuient sur des archives photographiques et sonores numérisées. L'objectif est double : offrir aux aînés un espace d'expression et transmettre aux enfants une connaissance vivante de l'histoire récente.

Les premières évaluations montrent un impact positif sur la motivation scolaire et le développement de l'empathie chez les élèves. Les enseignants soulignent également que les témoignages personnels rendent les événements historiques plus concrets et plus mémorables que les seuls manuels scolaires.

Ce dispositif pourrait être étendu au collège dès la rentrée prochaine, en partenariat avec des associations locales de mémoire et des bibliothèques municipales.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Mémoire intergénérationnelle : transmettre pour ne pas oublier",
    longText: ART_MEMOIRE,
    question: "Quel est l'objectif principal de ce projet dans les écoles ?",
    optionA: "Former les élèves à la recherche historique.",
    optionB: "Transmettre la mémoire vivante aux enfants.",
    optionC: "Numériser des archives familiales.",
    optionD: "Créer des liens entre parents et enseignants.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Mémoire intergénérationnelle : transmettre pour ne pas oublier",
    longText: ART_MEMOIRE,
    question: "Selon les premières évaluations, quel effet ce dispositif a-t-il sur les élèves ?",
    optionA: "Il améliore leurs résultats en mathématiques.",
    optionB: "Il développe leur empathie et leur motivation.",
    optionC: "Il réduit l'absentéisme scolaire.",
    optionD: "Il renforce leur intérêt pour les arts.",
    correctAnswer: 'B',
  }));

  const ART_EDUCATION_FINANCIERE =
`Une étude récente révèle que plus de 60 % des jeunes de 18 à 25 ans en France ne savent pas calculer des intérêts composés et ignorent les principes de base de l'investissement. Face à ce constat alarmant, des associations militent pour l'introduction obligatoire de l'éducation financière dans les programmes scolaires.

Les lacunes identifiées concernent principalement trois domaines : la gestion de l'épargne, la compréhension du crédit à la consommation et les rudiments de l'investissement. Des jeunes signent des crédits revolving sans comprendre les taux réels appliqués, ou s'endettent pour des achats impulsifs sans anticiper les conséquences à long terme.

Plusieurs pays nordiques ont intégré ces notions dès le primaire avec des résultats probants. En Suède, les élèves de 10 ans apprennent à gérer un budget fictif, et des études montrent que ces compétences sont maintenues à l'âge adulte.

En France, certaines initiatives privées commencent à combler ce vide, comme des ateliers animés par des bénévoles dans des lycées défavorisés, mais l'absence de cadre national limite leur portée.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Éducation financière des jeunes : un retard à combler",
    longText: ART_EDUCATION_FINANCIERE,
    question: "Quelle est la principale lacune financière identifiée chez les jeunes ?",
    optionA: "La gestion des impôts.",
    optionB: "La compréhension des marchés boursiers.",
    optionC: "La gestion de l'épargne et du crédit.",
    optionD: "Les démarches administratives bancaires.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Éducation financière des jeunes : un retard à combler",
    longText: ART_EDUCATION_FINANCIERE,
    question: "Quel exemple étranger est cité comme modèle dans cet article ?",
    optionA: "Le Canada.",
    optionB: "L'Allemagne.",
    optionC: "La Suède.",
    optionD: "Les Pays-Bas.",
    correctAnswer: 'C',
  }));

  const ART_SURMENAGE =
`Le surmenage parental touche aujourd'hui des millions de familles en France. Entre une carrière professionnelle de plus en plus exigeante, les responsabilités domestiques et les activités extrascolaires des enfants, les parents se retrouvent épuisés et souvent envahis par un sentiment de culpabilité : celui de ne jamais en faire assez.

Les psychologues parlent de « double journée », un phénomène particulièrement répandu chez les mères, qui cumulent travail salarié et charge mentale du foyer. Cette pression constante génère du stress chronique, des troubles du sommeil et peut conduire au burn-out parental.

Des solutions existent pourtant : déléguer certaines tâches, dire non aux sollicitations superflues, et accepter l'imperfection. Des thérapies brèves comme la pleine conscience ou la thérapie cognitivo-comportementale montrent des résultats encourageants pour retrouver un équilibre.

Les entreprises ont aussi un rôle à jouer : congés flexibles, télétravail et crèches d'entreprise peuvent alléger considérablement la pression quotidienne des parents salariés.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Surmenage des parents modernes : la double journée épuise",
    longText: ART_SURMENAGE,
    question: "Qu'est-ce que la « double journée » selon cet article ?",
    optionA: "Travailler deux emplois à temps plein.",
    optionB: "Cumuler travail salarié et charge du foyer.",
    optionC: "Consacrer deux fois plus de temps aux enfants.",
    optionD: "Effectuer des heures supplémentaires au bureau.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Surmenage des parents modernes : la double journée épuise",
    longText: ART_SURMENAGE,
    question: "Quelle solution l'article ne mentionne-t-il PAS ?",
    optionA: "Déléguer certaines tâches.",
    optionB: "Pratiquer la pleine conscience.",
    optionC: "Réduire les activités extrascolaires des enfants.",
    optionD: "Bénéficier de congés flexibles.",
    correctAnswer: 'C',
  }));

  const ART_CONFORMISME =
`La pression du conformisme social s'exerce à tous les âges, mais elle est particulièrement forte à l'adolescence et à l'entrée dans la vie adulte. Porter les mêmes vêtements que ses pairs, adopter les mêmes opinions sur les réseaux sociaux ou fréquenter les mêmes lieux que son groupe d'appartenance : autant de comportements qui témoignent d'une aspiration profonde à être accepté.

Les sociologues soulignent que ce conformisme n'est pas en soi pathologique. Il remplit une fonction sociale essentielle, celle de cohésion et de sentiment d'appartenance. Mais lorsqu'il pousse à renoncer à ses propres convictions ou à ses goûts authentiques, il peut devenir une source d'anxiété et de perte d'identité.

La résistance au conformisme demande une forte estime de soi et une capacité à tolérer le regard différent ou critique des autres. Des pratiques comme l'écriture réflexive, la méditation ou la fréquentation de milieux diversifiés peuvent aider à renforcer cette résistance.

Les réseaux sociaux amplifient le phénomène : les algorithmes favorisent la viralité des contenus conformes aux attentes collectives, rendant plus difficile l'expression de voix dissonantes.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le poids du conformisme social : entre appartenance et liberté",
    longText: ART_CONFORMISME,
    question: "Selon les sociologues, le conformisme social a une fonction positive, laquelle ?",
    optionA: "Il favorise la créativité.",
    optionB: "Il développe l'autonomie.",
    optionC: "Il assure cohésion et sentiment d'appartenance.",
    optionD: "Il renforce les convictions personnelles.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le poids du conformisme social : entre appartenance et liberté",
    longText: ART_CONFORMISME,
    question: "Comment les réseaux sociaux influencent-ils le conformisme selon cet article ?",
    optionA: "Ils encouragent les opinions originales.",
    optionB: "Ils réduisent la pression des pairs.",
    optionC: "Ils amplifient le phénomène par leurs algorithmes.",
    optionD: "Ils permettent d'exprimer librement ses convictions.",
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

    let inserted = 0;
    for (const data of questions) {
      await prisma.question.create({ data });
      process.stdout.write(`\r   ✓ Q${data.questionOrder} insérée`);
      inserted++;
    }

    console.log(`\n✅ ${inserted} questions créées pour CE 34.`);

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
