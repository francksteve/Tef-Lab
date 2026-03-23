'use strict';
/**
 * seed-ce-serie35.js
 * Peuple la série CE 35 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie35.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyojy9000v0wxld7khtcbj';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de températures mensuelles pour Q22
   Commentaire : « Le thermomètre descend régulièrement sous moins vingt degrés
   en hiver dans cette ville aux hivers extrêmes. »
   Graphique correct : Graphique 1 → réponse A
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [-30,-28,-20,-8,2,10,15,12,5,-5,-18,-25], minY: -35, maxY: 20, color: '#003087' },   // CORRECT — grand froid hivernal arctique
    { label: 'Graphique 2', data: [5,6,9,13,17,21,24,23,18,13,8,5], minY: 0, maxY: 30, color: '#E30613' },             // océanique
    { label: 'Graphique 3', data: [25,25,26,27,28,29,30,30,29,28,26,25], minY: 22, maxY: 33, color: '#E30613' },       // tropical
    { label: 'Graphique 4', data: [-3,0,5,10,16,21,24,22,16,9,2,-2], minY: -5, maxY: 28, color: '#E30613' },           // continental modéré
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 52, plotY = cy + 35, plotW = 310, plotH = 110;
    const sx = i => (plotX + (i / 11) * plotW).toFixed(1);
    const sy = t => (plotY + plotH - ((t - g.minY) / (g.maxY - g.minY)) * plotH).toFixed(1);
    const pts = g.data.map((t, i) => `${sx(i)},${sy(t)}`).join(' ');
    const grid = [0, 1, 2, 3].map(i => {
      const t = g.minY + i * (g.maxY - g.minY) / 3;
      const yv = parseFloat(sy(t));
      return `<line x1="${plotX}" y1="${yv.toFixed(1)}" x2="${plotX + plotW}" y2="${yv.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(yv + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${t.toFixed(0)}°</text>`;
    }).join('');
    const xlab = months.map((m, i) =>
      `<text x="${sx(i)}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${m}</text>`
    ).join('');
    const dots = g.data.map((t, i) =>
      `<circle cx="${sx(i)}" cy="${sy(t)}" r="3" fill="${g.color}"/>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
      `<text x="${cx + 195}" y="${cy + 23}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
      `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      grid + xlab +
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

function buildQuestions() {
  const qs = [];

  /* ── Q1-7 ──────────────────────────────────────────────────────────────── */

  qs.push(q(1, 'Q1-7', null, {
    longText:
`STUDIO NATURE & YOGA — Séances en plein air

Lieu : Parc de la Feyssine, entrée principale (métro Vaulx-en-Velin)
Sessions : mardi et jeudi 7 h 30, samedi 9 h 00

Niveaux : débutant, intermédiaire, avancé (groupes séparés)
Tapis fournis pour les séances du samedi uniquement
Apportez votre tapis pour les séances en semaine.

Tarif : 12 € la séance / Carte 10 séances : 100 €
Inscription en ligne : studioyoganature.fr`,
    question: "Lors de quelle séance les tapis sont-ils fournis ?",
    optionA: "Les séances du mardi.",
    optionB: "Les séances du samedi.",
    optionC: "Les séances du jeudi.",
    optionD: "Toutes les séances.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`AUBERGE DE JEUNESSE LES VOYAGEURS — Règlement intérieur

• Check-in : 15 h — Check-out : 11 h (dépassement facturé)
• Couvre-feu : 23 h 30 (entrée avec code confidentiel remis à l'arrivée)
• Ménage des dortoirs : chaque résident nettoie son espace après usage
• Animaux domestiques : strictement interdits dans l'établissement
• Bruit : silence absolu entre 23 h et 7 h dans les dortoirs

Lockers sécurisés disponibles — Caution 5 €`,
    question: "Que doit-on faire pour rentrer après le couvre-feu ?",
    optionA: "Sonner à l'interphone.",
    optionB: "Utiliser un code confidentiel.",
    optionC: "Appeler le veilleur de nuit.",
    optionD: "Présenter sa pièce d'identité.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`GALERIE CONTEMPORAINE MAISON ROUGE

EXPOSITION : « FRAGMENTÉS »
Artiste : Léa Kaminski — Sculptures et installations

Du 12 avril au 3 juin — Mardi au dimanche, 10 h – 19 h

Vernissage : vendredi 11 avril à 19 h 30
Présence de l'artiste + présentation de la démarche

Accès : 8 € / réduit 5 € (étudiants, demandeurs d'emploi, -18 ans)
Atelier enfant samedi 10 h 30 (sur inscription)`,
    question: "Quel événement a lieu le vendredi 11 avril ?",
    optionA: "Un atelier pour enfants.",
    optionB: "La clôture de l'exposition.",
    optionC: "Le vernissage avec l'artiste.",
    optionD: "Une visite guidée gratuite.",
    correctAnswer: 'C',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`ROOFTOP PANORAMIQUE — RESTAURANT LE CIEL DE PARIS

Cuisine fusion franco-asiatique — Vue 360° sur la ville

Formule déjeuner : entrée + plat + boisson — 28 €
Carte : wok de légumes, tartare de thon, gyoza maison, brioches vapeur
Cocktails signature : Lychee Sunrise, Yuzu Sour, Sakura Fizz — 14 €
Mocktails disponibles

⚠ Réservation OBLIGATOIRE — Tenue correcte exigée
reservation@lecielddeparis.fr | 01 40 70 11 00`,
    question: "Quel type de cuisine propose ce restaurant ?",
    optionA: "Cuisine française traditionnelle.",
    optionB: "Cuisine fusion franco-asiatique.",
    optionC: "Cuisine méditerranéenne.",
    optionD: "Cuisine végétarienne exclusive.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`BATTERIE PORTABLE NOMADE POWERMAX 26 000 mAh

Compatibilité : tous smartphones et tablettes (câble USB-C inclus, adaptateurs micro-USB et Lightning en option)
Charge : 2,5 h pour charge complète via USB-C PD 65W
Indicateur LED : 4 niveaux de batterie restante
Sorties : 2 × USB-A + 1 × USB-C
Sécurité : protection contre surcharge, surchauffe et court-circuit

⚠ Ne pas exposer à une température supérieure à 45 °C
⚠ Transport en avion : déclaration obligatoire en soute`,
    question: "Combien de temps faut-il pour charger complètement cette batterie ?",
    optionA: "1 heure.",
    optionB: "1,5 heure.",
    optionC: "2,5 heures.",
    optionD: "4 heures.",
    correctAnswer: 'C',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`BIBLIO'BUS — BIBLIOTHÈQUE ITINÉRANTE DU CONSEIL DÉPARTEMENTAL

Circuit nord — Arrêts hebdomadaires :
• Lundi : village de Sézanne (place de l'Église) 9 h – 11 h
• Mercredi : hameau de Courgivaux 14 h – 16 h
• Vendredi : village de Corfélix 10 h – 12 h

Catalogue : 4 000 ouvrages disponibles. Commandes spéciales possibles.
Carte de lecteur : gratuite sur présentation d'un justificatif de domicile
Livraison à domicile pour personnes à mobilité réduite (sur inscription)`,
    question: "Que faut-il présenter pour obtenir une carte de lecteur gratuite ?",
    optionA: "Une pièce d'identité.",
    optionB: "Un justificatif de domicile.",
    optionC: "Une attestation scolaire.",
    optionD: "Un coupon de réduction.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`ASSOCIATION SPORTIVE MUNICIPAL DE FLEURY
Bulletin mensuel — Mars

RÉSULTATS : Notre équipe de football a terminé 2e du tournoi régional. Bravo à tous !

PROCHAINS ÉVÉNEMENTS :
• Tournoi de tennis : 5 et 6 avril
• Journée portes ouvertes : dimanche 20 avril (toutes sections)

COTISATION : Rappel — les cotisations 2025 doivent être réglées avant le 31 mars. Tarif unique : 60 €/an. Paiement en ligne sur notre site ou à l'accueil les mardi et jeudi soirs.`,
    question: "Quelle est la date limite pour payer la cotisation annuelle ?",
    optionA: "Le 5 avril.",
    optionB: "Le 20 avril.",
    optionC: "Le 31 mars.",
    optionD: "Le 31 décembre.",
    correctAnswer: 'C',
  }));

  /* ── Q8-13 : Phrases lacunaires ──────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour éviter tout ___ lors de la réunion, veuillez confirmer votre présence par email avant vendredi.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "retard",
    optionB: "malentendu",
    optionC: "problème",
    optionD: "oubli",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Cette offre est ___ jusqu'au 30 juin et ne peut pas être prolongée au-delà de cette date.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refusée",
    optionB: "annulée",
    optionC: "valable",
    optionD: "modifiée",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les participants doivent ___ leurs documents d'identité le jour de l'épreuve sans exception.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "oublier",
    optionB: "présenter",
    optionC: "copier",
    optionD: "photocopier",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En raison des travaux sur l'autoroute, nous vous conseillons d'emprunter l'itinéraire ___.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "principal",
    optionB: "interdit",
    optionC: "habituel",
    optionD: "bis",
    correctAnswer: 'D',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le dossier doit être ___ complet dès le premier envoi, sans pièces manquantes.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "partiellement",
    optionB: "approximativement",
    optionC: "absolument",
    optionD: "provisoirement",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce type de contrat ___ les deux parties à respecter les délais fixés dans l'annexe.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "invite",
    optionB: "propose",
    optionC: "oblige",
    optionD: "suggère",
    correctAnswer: 'C',
  }));

  /* ── Q14-17 : Textes lacunaires ─────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "Le commerce équitable cherche à garantir une [14] juste aux producteurs des pays du Sud. En achetant ces produits, les consommateurs contribuent directement à l'amélioration des [15] de vie des agriculteurs et de leurs familles.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le commerce équitable',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "punition",
    optionB: "rémunération",
    optionC: "pension",
    optionD: "dette",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le commerce équitable',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "méthodes",
    optionB: "niveaux",
    optionC: "conditions",
    optionD: "droits",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Les jeux vidéo font l'objet de nombreux [16] scientifiques sur leurs effets cognitifs. Si certaines études montrent des bénéfices sur la coordination et la [17] spatiale, d'autres soulignent les risques liés à une pratique excessive.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Les jeux vidéo',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "débats",
    optionB: "travaux",
    optionC: "concours",
    optionD: "projets",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Les jeux vidéo',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "mémoire",
    optionB: "perception",
    optionC: "rapidité",
    optionD: "orientation",
    correctAnswer: 'D',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Chalet A', content: "Chalet 6 personnes en montagne, à 5 km des pistes. Ski bus disponible matin et soir. Équipements : sauna, lave-linge, terrasse. Prix semaine haute saison : 1 200 €." },
    { title: 'Chalet B', content: "Chalet ski-in ski-out, accès direct aux pistes depuis la porte d'entrée. 8 personnes. Jacuzzi, cheminée. Prix semaine : 2 400 €. Navette non nécessaire." },
    { title: 'Chalet C', content: "Chalet familial en forêt, calme absolu. Raquettes et sentiers de randonnée au départ. Pas de ski alpin à proximité. 4 personnes. Prix semaine : 700 €." },
    { title: 'Chalet D', content: "Appartement chalet en résidence, 4 personnes. À 800 m des remontées mécaniques. Parking couvert, cave à skis. Prix semaine : 950 €." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel chalet est situé directement sur les pistes ?",
    optionA: "Chalet A",
    optionB: "Chalet B",
    optionC: "Chalet C",
    optionD: "Chalet D",
    correctAnswer: 'B',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Cours A', content: "Stage ski adultes débutants — 6 jours. Forfait remontées mécaniques inclus dans le prix. Moniteur ESF. Matériel à louer en option. Prix : 380 €." },
    { title: 'Cours B', content: "Cours de ski perfectionnement — 3 jours. Forfait non inclus, à acheter séparément. Accent sur la technique et le hors-piste. Prix : 210 €." },
    { title: 'Cours C', content: "Stage ski de fond — 4 jours. Piste nordique balisée. Pas de remontées mécaniques. Chaussures et skis fournis. Prix : 290 €." },
    { title: 'Cours D', content: "Initiation ski alpin enfants 5-8 ans — 5 matinées. Moniteur dédié. Forfait remontées non inclus. Casque obligatoire (location possible). Prix : 160 €." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel cours inclut le forfait remontées mécaniques ?",
    optionA: "Cours A",
    optionB: "Cours B",
    optionC: "Cours C",
    optionD: "Cours D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Offre 1', content: "Auditeur interne — Cabinet Ernst & Young. Missions : contrôle des comptes, certification légale, déplacements France uniquement. Expérience : 3 ans. Salaire : 55 000 €." },
    { title: 'Offre 2', content: "Contrôleur de gestion — Groupe industriel. Suivi budgétaire, reporting mensuel, interface avec les filiales européennes. 2 ans d'expérience. Salaire : 48 000 €." },
    { title: 'Offre 3', content: "Auditeur financier international — Cabinet KPMG. Missions d'audit dans 15 pays. Déplacements internationaux intensifs (180 j/an). Maîtrise anglais + espagnol. Salaire : 72 000 €." },
    { title: 'Offre 4', content: "Analyste risques financiers — Banque Crédit Ouest. Modélisation des risques de crédit, stress tests réglementaires. Télétravail possible 3j/semaine. Salaire : 58 000 €." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste inclut des déplacements internationaux ?",
    optionA: "Offre 1",
    optionB: "Offre 2",
    optionC: "Offre 3",
    optionD: "Offre 4",
    correctAnswer: 'C',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Produit A', content: "Montre connectée GPS Sport — Suivi activités, cardiofréquencemètre, cartographie. Étanche jusqu'à 100 m. Autonomie 14 jours. Prix : 299 €." },
    { title: 'Produit B', content: "Tracker GPS portable — Localisation en temps réel, alertes zones. Étanche 30 m. Autonomie 7 jours. Idéal pour enfants et personnes âgées. Prix : 89 €." },
    { title: 'Produit C', content: "Cardiofréquencemètre de poitrine — Précision clinique, compatible Garmin/Polar. Résistant à la transpiration (IPX4). Autonomie 12 h. Prix : 59 €." },
    { title: 'Produit D', content: "Sac à dos trail running 15 L — Poche hydratation 2 L incluse, ceinture stabilisatrice, réfléchissant. Lavable en machine. Prix : 75 €." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel produit est étanche jusqu'à 100 mètres ?",
    optionA: "Produit A",
    optionB: "Produit B",
    optionC: "Produit C",
    optionD: "Produit D",
    correctAnswer: 'A',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Le thermomètre descend régulièrement sous moins vingt degrés en hiver dans cette ville aux hivers extrêmes.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_DETENTE =
`RÈGLEMENT — ESPACE DÉTENTE ET REPOS

L'espace détente est accessible à tous les salariés de l'entreprise pendant les heures de travail.

Accès : sur présentation du badge professionnel. Ouvert de 8 h à 19 h du lundi au vendredi.
Horaires de silence : de 12 h à 14 h, le silence est requis pour permettre le repos.
Règles de vie : interdiction de téléphoner, de manger des plats chauds ou de travailler sur ordinateur dans l'espace zen.
Réservation : les espaces cosy (box individuels) peuvent être réservés par tranche de 30 min via l'application interne.

Tout manquement au règlement peut entraîner la restriction d'accès temporaire.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Espace détente et repos",
    longText: DOC_DETENTE,
    question: "Quels sont les horaires de silence dans cet espace ?",
    optionA: "De 8 h à 10 h.",
    optionB: "De 12 h à 14 h.",
    optionC: "De 17 h à 19 h.",
    optionD: "En permanence.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Espace détente et repos",
    longText: DOC_DETENTE,
    question: "Quel élément permet d'accéder à cet espace ?",
    optionA: "Un mot de passe.",
    optionB: "Une autorisation de la direction.",
    optionC: "Le badge professionnel.",
    optionD: "Une réservation préalable.",
    correctAnswer: 'C',
  }));

  const DOC_MOBILITE =
`NOTE DE SERVICE — Plan de mobilité douce

Objet : Encouragement aux modes de transport alternatifs

À compter du 1er mai, l'entreprise met en place un plan de mobilité douce pour réduire son empreinte carbone.

Mesures :
• Prime vélo : 0,35 €/km pour tout trajet domicile-travail à vélo (plafond mensuel : 70 €)
• Parking sécurisé : un local vélo fermé et sécurisé (caméras, ventilation) est aménagé au sous-sol
• Trottinettes électriques : 10 trottinettes de service sont disponibles à la réservation pour les déplacements professionnels
• Abonnement transport : prise en charge à 75 % de l'abonnement de transport en commun

Les demandes de remboursement vélo doivent être soumises avant le 5 du mois suivant.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note de service — Plan de mobilité douce",
    longText: DOC_MOBILITE,
    question: "Quel est le plafond mensuel de la prime vélo ?",
    optionA: "35 €.",
    optionB: "50 €.",
    optionC: "70 €.",
    optionD: "100 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note de service — Plan de mobilité douce",
    longText: DOC_MOBILITE,
    question: "À quel pourcentage l'abonnement de transport est-il pris en charge ?",
    optionA: "50 %.",
    optionB: "60 %.",
    optionC: "75 %.",
    optionD: "100 %.",
    correctAnswer: 'C',
  }));

  const DOC_VIE_PRIVEE =
`CHARTE DE RESPECT DE LA VIE PRIVÉE DES SALARIÉS

L'employeur s'engage à respecter la vie privée de ses salariés dans le cadre professionnel.

Surveillance : la mise en place de tout système de surveillance (vidéo, badge, logiciel de monitoring) doit être déclarée au CSE et communiquée aux salariés concernés.
Messagerie professionnelle : le salarié a droit à un espace de confidentialité. L'employeur ne peut pas accéder aux messageries personnelles ni aux dossiers marqués « PRIVÉ ».
Fouille : la fouille des effets personnels n'est possible qu'en présence du salarié, avec son accord ou celui d'un représentant légal.
Droit à l'image : toute photographie ou vidéo d'un salarié dans le cadre professionnel exige son consentement écrit préalable.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte de respect de la vie privée des salariés",
    longText: DOC_VIE_PRIVEE,
    question: "Que doit faire l'employeur avant d'installer un système de surveillance ?",
    optionA: "Obtenir l'accord individuel de chaque salarié.",
    optionB: "En informer le CSE et les salariés concernés.",
    optionC: "Soumettre une demande à l'inspection du travail.",
    optionD: "Attendre un délai légal de 30 jours.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte de respect de la vie privée des salariés",
    longText: DOC_VIE_PRIVEE,
    question: "Qu'est-il nécessaire pour photographier un salarié dans le cadre professionnel ?",
    optionA: "L'accord verbal du responsable.",
    optionB: "Une décision du comité de direction.",
    optionC: "Le consentement écrit préalable du salarié.",
    optionD: "Une autorisation de la CNIL.",
    correctAnswer: 'C',
  }));

  const DOC_STAGE =
`GUIDE D'ACCUEIL — STAGE DE DÉCOUVERTE (3e)

Bienvenue dans notre entreprise ! Ce guide vous accompagnera tout au long de votre stage.

Accueil : le premier jour, présentez-vous à l'accueil à 8 h 45 avec votre convention de stage signée.
Programme : vous découvrirez différents services selon un planning défini avec votre tuteur.
Tuteur : votre tuteur référent est disponible pour répondre à toutes vos questions et signer votre livret de stage.
Attestation : une attestation de stage vous sera remise le dernier jour, après évaluation de votre tuteur.

Règles : respecter la confidentialité des informations, être ponctuel, porter votre badge visiteur en permanence.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide d'accueil — Stage de découverte (3e)",
    longText: DOC_STAGE,
    question: "Que doit apporter le stagiaire le premier jour ?",
    optionA: "Un curriculum vitae.",
    optionB: "Sa convention de stage signée.",
    optionC: "Une lettre de motivation.",
    optionD: "Un carnet de notes.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide d'accueil — Stage de découverte (3e)",
    longText: DOC_STAGE,
    question: "Quand l'attestation de stage est-elle remise au stagiaire ?",
    optionA: "Le premier jour.",
    optionB: "À mi-parcours.",
    optionC: "Le dernier jour, après évaluation.",
    optionD: "Par courrier après le stage.",
    correctAnswer: 'C',
  }));

  const DOC_CONTRAT_PRO =
`INFORMATION — CONTRAT DE PROFESSIONNALISATION ET APPRENTISSAGE

Le contrat de professionnalisation est un contrat en alternance qui permet d'acquérir une qualification reconnue tout en travaillant.

Rémunération : elle varie selon l'âge et le niveau de diplôme préparé. Elle est exprimée en pourcentage du SMIC, entre 55 % et 100 %.
Alternance : le salarié partage son temps entre l'entreprise (3 semaines sur 4 en moyenne) et le centre de formation (CFA).
Diplôme visé : le contrat doit viser l'obtention d'un titre ou diplôme reconnu par l'État (CAP, BTS, licence professionnelle, etc.).
Durée : de 6 à 12 mois, prolongeable en cas d'échec aux examens.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Information — Contrat de professionnalisation",
    longText: DOC_CONTRAT_PRO,
    question: "Quelle est la durée minimale d'un contrat de professionnalisation ?",
    optionA: "3 mois.",
    optionB: "6 mois.",
    optionC: "12 mois.",
    optionD: "24 mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Information — Contrat de professionnalisation",
    longText: DOC_CONTRAT_PRO,
    question: "En moyenne, combien de temps le salarié passe-t-il en entreprise ?",
    optionA: "1 semaine sur 2.",
    optionB: "1 semaine sur 4.",
    optionC: "3 semaines sur 4.",
    optionD: "4 semaines sur 4.",
    correctAnswer: 'C',
  }));

  /* ── Q33-40 : Articles de presse ─────────────────────────────────────── */

  const ART_RETRAITE =
`La retraite n'est plus synonyme de repos total. De plus en plus de seniors actifs choisissent de continuer à s'engager professionnellement ou bénévolement bien après l'âge légal de départ. Ce phénomène, que les sociologues appellent « retraite active », recouvre des réalités très diverses : reprise d'une activité partielle, lancement d'une micro-entreprise, engagement associatif ou formation continue.

Les motivations sont multiples : maintien du lien social, sentiment d'utilité, complément de revenus, ou simplement désir de continuer à apprendre et à évoluer. Selon une enquête récente, 38 % des retraités français s'impliquent dans au moins une association, et 12 % exercent une activité rémunérée.

Les employeurs, confrontés à des pénuries de main-d'œuvre dans certains secteurs, s'intéressent de plus en plus à ces profils expérimentés. Des dispositifs comme le cumul emploi-retraite ou le mécénat de compétences facilitent cette réinsertion.

Pourtant, des obstacles subsistent : la perception sociale de la vieillesse, les enjeux de santé et les rigidités administratives freinent encore trop souvent l'envie d'engagement des seniors.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Retraite active : de nouvelles formes d'engagement",
    longText: ART_RETRAITE,
    question: "Selon cet article, qu'est-ce que la « retraite active » ?",
    optionA: "Partir à la retraite plus tôt grâce à une carrière sportive.",
    optionB: "Continuer à s'engager professionnellement ou bénévolement après la retraite.",
    optionC: "Bénéficier d'une pension majorée pour activité prolongée.",
    optionD: "Reprendre des études après 60 ans.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Retraite active : de nouvelles formes d'engagement",
    longText: ART_RETRAITE,
    question: "Quel obstacle à l'engagement des seniors est mentionné dans l'article ?",
    optionA: "Le manque de formations adaptées.",
    optionB: "La perception sociale de la vieillesse.",
    optionC: "L'absence de dispositifs légaux.",
    optionD: "Le désintérêt des seniors eux-mêmes.",
    correctAnswer: 'B',
  }));

  const ART_FRICHES =
`Les friches industrielles, longtemps stigmates d'une désindustrialisation douloureuse, connaissent une seconde vie dans de nombreuses villes françaises. Ces espaces abandonnés sont progressivement reconvertis en lieux culturels, parcs urbains, logements ou zones d'activité économique innovante.

La friche de l'ancienne filature de Roubaix est aujourd'hui un campus numérique accueillant plus de 200 start-ups. À Nantes, les chantiers navals de l'île de Nantes abritent désormais des théâtres, des ateliers d'artistes et des espaces de coworking. Ces transformations associent souvent la mémoire industrielle du lieu à un projet culturel contemporain.

Des artistes et collectifs interviennent régulièrement sur ces sites pour intégrer l'histoire ouvrière dans leur démarche créative, notamment à travers le street art ou des installations éphémères qui racontent le passé du lieu.

Ces réhabilitations ne font pas l'unanimité : certains habitants regrettent la perte des traces industrielles et s'interrogent sur la gentrification qui peut en découler. L'enjeu est de concilier mémoire, mixité sociale et innovation.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Réhabilitation des friches : mémoire industrielle et renouveau urbain",
    longText: ART_FRICHES,
    question: "Qu'est devenue l'ancienne filature de Roubaix ?",
    optionA: "Un musée de l'industrie.",
    optionB: "Un parc naturel urbain.",
    optionC: "Un campus numérique pour start-ups.",
    optionD: "Un quartier résidentiel.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Réhabilitation des friches : mémoire industrielle et renouveau urbain",
    longText: ART_FRICHES,
    question: "Quelle critique est formulée par certains habitants face à ces réhabilitations ?",
    optionA: "Le coût trop élevé des projets.",
    optionB: "La gentrification et la perte des traces industrielles.",
    optionC: "L'absence de consultation des résidents.",
    optionD: "La mauvaise qualité architecturale des nouvelles constructions.",
    correctAnswer: 'B',
  }));

  const ART_ALIMENTATION_EMOLLE =
`L'alimentation émotionnelle désigne la tendance à manger en réponse à des émotions — stress, ennui, tristesse ou même joie — plutôt qu'à une faim physique réelle. Ce mécanisme, présent chez la plupart des individus de façon occasionnelle, peut devenir problématique lorsqu'il est systématique et incontrôlable.

Les aliments privilégiés lors de ces épisodes sont généralement riches en sucres et en graisses, ce que les neurosciences expliquent par l'activation du système de récompense du cerveau. Manger procure une sensation de plaisir immédiat qui atténue temporairement le mal-être.

À long terme, ce comportement peut conduire à des troubles du comportement alimentaire, à la prise de poids ou à des carences nutritionnelles. Les thérapies cognitivo-comportementales (TCC) et la pleine conscience se montrent efficaces pour identifier et modifier ces schémas.

La prévention passe par l'éducation émotionnelle dès l'enfance : apprendre à nommer ses émotions, à les gérer autrement que par la nourriture, est une compétence qui s'enseigne et qui protège durablement la santé mentale et physique.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Alimentation émotionnelle : quand les émotions dictent nos repas",
    longText: ART_ALIMENTATION_EMOLLE,
    question: "Pourquoi mange-t-on des aliments sucrés et gras lors d'épisodes émotionnels ?",
    optionA: "Par habitude culturelle.",
    optionB: "Pour satisfaire des carences nutritionnelles.",
    optionC: "En raison de l'activation du système de récompense du cerveau.",
    optionD: "Par manque de choix alimentaires disponibles.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Alimentation émotionnelle : quand les émotions dictent nos repas",
    longText: ART_ALIMENTATION_EMOLLE,
    question: "Quelle thérapie est mentionnée comme efficace contre ce comportement ?",
    optionA: "La psychanalyse.",
    optionB: "L'hypnose thérapeutique.",
    optionC: "La thérapie cognitivo-comportementale.",
    optionD: "La sophrologie.",
    correctAnswer: 'C',
  }));

  const ART_CHOIX =
`Le paradoxe du choix est un concept popularisé par le psychologue américain Barry Schwartz : à partir d'un certain seuil, l'abondance des options ne rend pas plus heureux, elle génère au contraire de l'anxiété et de l'insatisfaction. Lorsqu'une personne doit choisir entre vingt-quatre variétés de confiture plutôt que six, elle est non seulement plus paralysée, mais aussi moins satisfaite de son choix final.

Dans notre société de consommation, ce phénomène s'applique à tous les domaines : plateformes de streaming, e-commerce, offres téléphoniques ou choix de carrière. La surabondance d'options crée une charge cognitive élevée et peut conduire à la procrastination ou au regret.

Des études montrent que les individus qui maximisent leurs choix — les « maximisateurs » — sont généralement moins heureux que ceux qui se contentent d'une option « suffisamment bonne » — les « satisfaisants ». Accepter l'imperfection et limiter volontairement les options disponibles seraient donc des stratégies de bien-être.

Les applications de recommandation et les curations éditoriales des plateformes tentent de répondre à ce problème, mais introduisent en contrepartie des biais de personnalisation qui réduisent la diversité des expériences proposées.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le paradoxe du choix : trop d'options nuit au bien-être",
    longText: ART_CHOIX,
    question: "Qu'est-ce que le « paradoxe du choix » selon cet article ?",
    optionA: "L'impossibilité de choisir en l'absence d'options.",
    optionB: "L'anxiété et l'insatisfaction générées par trop d'options.",
    optionC: "La difficulté à comparer des produits de même qualité.",
    optionD: "Le refus de consommer face à des prix trop élevés.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le paradoxe du choix : trop d'options nuit au bien-être",
    longText: ART_CHOIX,
    question: "Selon les études, qui est généralement le plus heureux ?",
    optionA: "Celui qui maximise toutes ses options.",
    optionB: "Celui qui se contente d'une option suffisamment bonne.",
    optionC: "Celui qui délègue ses choix à des applications.",
    optionD: "Celui qui évite toute décision complexe.",
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

    console.log(`\n✅ ${inserted} questions créées pour CE 35.`);

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
