'use strict';
/**
 * seed-ce-serie36.js
 * Peuple la série CE 36 avec 40 questions TEF Canada.
 * Usage : node scripts/seed-ce-serie36.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyok3h000w0wxl91iny7ly';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire : « Après une chute brutale au deuxième trimestre, les ventes de
   cette entreprise rebondissent fortement dès le trimestre suivant. »
   Graphique correct : Graphique 2 → réponse B
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [80, 82, 78, 80], color: '#E30613' },  // stable élevé
    { label: 'Graphique 2', data: [80, 30, 35, 82], color: '#003087' },  // CORRECT — chute Q2 puis reprise
    { label: 'Graphique 3', data: [40, 55, 70, 88], color: '#E30613' },  // croissance
    { label: 'Graphique 4', data: [80, 75, 70, 65], color: '#E30613' },  // légère baisse
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const quarters = ['T1', 'T2', 'T3', 'T4'];
  const maxVal = 100;

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
`CONCOURS DE PÂTISSERIE AMATEUR — ÉDITION 2025

Thème imposé : « Saveurs d'Asie »

Inscriptions : du 1er au 20 mars en ligne sur patisserie-amateur.fr
Jury : 3 chefs pâtissiers professionnels étoilés

Lots : 1er prix — Week-end gastronomique (valeur 800 €)
       2e prix — Robot pâtissier KitchenAid
       3e prix — Cours chez un chef (valeur 250 €)

Règlement complet sur demande. Toute participation implique l'accord de publication des recettes.`,
    question: "Quel est le thème imposé de ce concours ?",
    optionA: "Saveurs de France.",
    optionB: "Pâtisseries traditionnelles.",
    optionC: "Saveurs d'Asie.",
    optionD: "Desserts de Noël.",
    correctAnswer: 'C',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`CABANE DANS LES ARBRES — RÈGLEMENT DE SÉCURITÉ

⚠ Poids maximum par cabane : 300 kg (adultes + enfants + bagages)
Âge minimum : 5 ans accompagné d'un adulte
Interdiction absolue de fumer dans les cabanes et sur les plateformes

Météo : en cas de vents supérieurs à 60 km/h ou d'orage, l'accès est immédiatement fermé.

Réservation : obligatoire 48 h à l'avance. Annulation gratuite jusqu'à 24 h avant. Aucun remboursement pour annulation le jour même.`,
    question: "Quel est le poids maximum autorisé par cabane ?",
    optionA: "100 kg.",
    optionB: "200 kg.",
    optionC: "300 kg.",
    optionD: "400 kg.",
    correctAnswer: 'C',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`FESTIVAL INTERNATIONAL DE DANSE CONTEMPORAINE — PROGRAMME

Compagnies invitées : 12 compagnies de 8 pays
Dates : 14 au 22 juin
Lieux : Opéra de Lyon, Théâtre des Célestins, Halle Tony Garnier

Tarifs : Opéra 35 € / Théâtre 22 € / Halle (soirées gratuites les vendredis)

Billetterie en ligne ouverte dès maintenant. Places limitées, réservation conseillée.
Programme complet : festivaldanse.lyon.fr`,
    question: "Quel lieu propose des soirées gratuites ?",
    optionA: "L'Opéra de Lyon.",
    optionB: "Le Théâtre des Célestins.",
    optionC: "La Halle Tony Garnier.",
    optionD: "Tous les lieux le dernier soir.",
    correctAnswer: 'C',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`SALADERIE VERTE & BIO — Carte printemps

Formule grande salade : base au choix (roquette, épinards, mix), 3 ingrédients locaux au choix, 1 protéine, 1 vinaigrette maison — 12,50 €

Ingrédients locaux du moment : tomates cerises Drôme, chèvre Ardèche, noix du Périgord, carottes Isère, herbes fraîches du jardin

Protéines : saumon fumé, poulet grillé, pois chiches rôtis (végé)

Boissons : infusions glacées maison — 3,50 €
Dessert : sorbet du jour — 4 €`,
    question: "Quel type de protéine est proposé pour les végétariens ?",
    optionA: "Tofu mariné.",
    optionB: "Saumon fumé.",
    optionC: "Pois chiches rôtis.",
    optionD: "Œufs mollets.",
    correctAnswer: 'C',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`MIXEUR PLONGEANT TURBO 1200 — GUIDE RAPIDE

Programmes : Turbo (pulse), Lisse (continu), Glace (rythme rapide)
Vitesses : 5 réglages progressifs (molette rotative)
Accessoires fournis : pied mixeur inox, fouet, hachoir 500 mL, verre doseur

Nettoyage : pied mixeur lavable au lave-vaisselle (lave-vaisselle compatible). Corps principal : essuyage humide uniquement, jamais sous l'eau.

⚠ Toujours débrancher avant de changer les accessoires.`,
    question: "Quelle partie du mixeur est lavable au lave-vaisselle ?",
    optionA: "Le corps principal.",
    optionB: "Le fouet uniquement.",
    optionC: "Le pied mixeur en inox.",
    optionD: "Tous les accessoires sauf le verre doseur.",
    correctAnswer: 'C',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`ESPACE BIEN-ÊTRE MUNICIPAL « HARMONIE »

Soins proposés : massages (relaxant, sportif, pierres chaudes), soins du visage, balnéothérapie
Réservation : en ligne ou par téléphone au 04 75 23 11 08 — 48 h à l'avance

Tarifs : massage 1 h — 55 € | soin visage — 45 € | balnéo 30 min — 30 €
Abonnements : 10 soins au choix — 10 % de réduction | Abonnement annuel — 20 % de réduction

Horaires : lundi-samedi 9 h – 20 h | dimanche 10 h – 18 h`,
    question: "Quelle réduction offre l'abonnement annuel ?",
    optionA: "5 %.",
    optionB: "10 %.",
    optionC: "15 %.",
    optionD: "20 %.",
    correctAnswer: 'D',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`Madame, Messieurs les collaborateurs,

Je souhaitais vous partager ma vision pour nos trois prochaines années. Face à l'évolution rapide de notre secteur, nous devons accélérer notre transformation numérique et renforcer notre présence sur les marchés africains.

Nos objectifs : doubler notre chiffre d'affaires d'ici 2027, réduire notre empreinte carbone de 30 % et développer deux nouvelles gammes de produits.

Pour y parvenir, j'ai besoin de votre engagement et de vos idées. Une consultation interne sera lancée le mois prochain — vos contributions seront précieuses.

Cordialement,
Directrice Générale`,
    question: "Que prévoit cette note de la directrice générale ?",
    optionA: "Des licenciements pour réduire les coûts.",
    optionB: "Une consultation interne pour recueillir des idées.",
    optionC: "La fermeture de sites en Afrique.",
    optionD: "Une fusion avec un concurrent.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 ──────────────────────────────────────────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Après plusieurs semaines de négociations, les deux entreprises ont enfin ___ un accord commercial.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "rompu",
    optionB: "signé",
    optionC: "refusé",
    optionD: "préparé",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce médicament peut provoquer de la somnolence ; il est déconseillé de conduire après son ___.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "vente",
    optionB: "achat",
    optionC: "ingestion",
    optionD: "stockage",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le comité de sélection a ___ trois candidats pour le deuxième tour de l'entretien.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "éliminé",
    optionB: "retenu",
    optionC: "convoqué",
    optionD: "ignoré",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'entreprise a décidé d'___ une nouvelle politique de télétravail à compter du mois prochain.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "abolir",
    optionB: "instaurer",
    optionC: "suspendre",
    optionD: "ignorer",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le rapport doit être ___ au plus tard le vendredi 14 h, sans aucune exception.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "imprimé",
    optionB: "modifié",
    optionC: "remis",
    optionD: "archivé",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Toute demande de congés doit être ___ par le responsable hiérarchique avant d'être définitive.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "refusée",
    optionB: "validée",
    optionC: "oubliée",
    optionD: "annulée",
    correctAnswer: 'B',
  }));

  /* ── Q14-17 ──────────────────────────────────────────────────────────── */

  const TEXTE_LAC_1 =
    "La permaculture est une approche de l'agriculture qui s'inspire des [14] naturels pour créer des systèmes agricoles durables. Ses principes visent à produire de la nourriture en harmonie avec l'environnement, en minimisant les [15] et en favorisant la biodiversité.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La permaculture',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "marchés",
    optionB: "cycles",
    optionC: "défauts",
    optionD: "produits",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La permaculture',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "profits",
    optionB: "rendements",
    optionC: "déchets",
    optionD: "coûts",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "L'intelligence artificielle transforme en profondeur le secteur de la [16]. Les algorithmes sont désormais capables d'analyser des millions de données pour détecter des maladies avec une précision [17] à celle des spécialistes humains.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Intelligence artificielle et santé',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "finance",
    optionB: "construction",
    optionC: "santé",
    optionD: "mode",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Intelligence artificielle et santé',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "inférieure",
    optionB: "comparable",
    optionC: "douteuse",
    optionD: "excessive",
    correctAnswer: 'B',
  }));

  /* ── Q18-21 ──────────────────────────────────────────────────────────── */

  const TEXTS_Q18 = JSON.stringify([
    { title: 'Espace A', content: "Coliving « Le Hub » — 20 logements meublés. Espaces communs : cuisine partagée, salle de travail, jardin. Abonnement salle de sport inclus dans le loyer. Contrat 1 à 12 mois. Prix à partir de 850 €/mois." },
    { title: 'Espace B', content: "Coliving « Nomad House » — 15 studios. Petit-déjeuner quotidien inclus, ménage hebdomadaire. Pas de salle de sport. Terrasse commune. Contrat minimum 1 semaine. Prix : 1 100 €/mois." },
    { title: 'Espace C', content: "Coliving « Cosy Village » — 30 chambres. Cuisine équipée partagée, bibliothèque, cinéma privé. Salle de sport disponible en option (+60 €/mois). Contrat 3 mois minimum. Prix : 780 €/mois." },
    { title: 'Espace D', content: "Coliving « Urban Loft » — 10 appartements. Toit-terrasse, espace co-working. Pas de sport. Animaux acceptés. Contrat 6 mois minimum. Prix : 950 €/mois." },
  ]);

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel espace coliving inclut un abonnement salle de sport ?",
    optionA: "Espace A",
    optionB: "Espace B",
    optionC: "Espace C",
    optionD: "Espace D",
    correctAnswer: 'A',
  }));

  const TEXTS_Q19 = JSON.stringify([
    { title: 'Cours A', content: "Danse hip-hop — Tous niveaux. Cours 1 h/semaine. Pas de spectacle prévu. Prix : 55 €/mois." },
    { title: 'Cours B', content: "Danse classique adultes — Niveau intermédiaire. 2 cours/semaine. Prix : 85 €/mois." },
    { title: 'Cours C', content: "Danse contemporaine — Tous niveaux. 1 cours/semaine + atelier mensuel. Spectacle de fin d'année au Théâtre Municipal en juin. Prix : 70 €/mois." },
    { title: 'Cours D', content: "Danse salsa en couple — Débutants et avancés. 1 cours/semaine. Soirée mensuelle dansante incluse. Prix : 60 €/mois par personne." },
  ]);

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel cours propose un spectacle de fin d'année ?",
    optionA: "Cours A",
    optionB: "Cours B",
    optionC: "Cours C",
    optionD: "Cours D",
    correctAnswer: 'C',
  }));

  const TEXTS_Q20 = JSON.stringify([
    { title: 'Poste 1', content: "Chargé(e) RH — PME industrielle. Gestion recrutement, paie, formation. 3 ans d'expérience minimum. Pas ouvert aux reconversions. Salaire : 38 000 €." },
    { title: 'Poste 2', content: "Assistant(e) RH — Start-up tech. Missions variées, formation interne prévue. Poste ouvert aux profils en reconversion professionnelle, motivation valorisée. Salaire : 32 000 €." },
    { title: 'Poste 3', content: "Responsable formation — Grand groupe. 5 ans d'expérience en SIRH exigée. Secteur bancaire uniquement. Salaire : 55 000 €." },
    { title: 'Poste 4', content: "DRH adjoint(e) — Association loi 1901. 8 ans d'expérience obligatoires. Connaissances en droit social approfondies. Salaire selon convention collective." },
  ]);

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel poste est ouvert aux profils en reconversion ?",
    optionA: "Poste 1",
    optionB: "Poste 2",
    optionC: "Poste 3",
    optionD: "Poste 4",
    correctAnswer: 'B',
  }));

  const TEXTS_Q21 = JSON.stringify([
    { title: 'Service A', content: "Coiffure à domicile — Coupe femme à partir de 45 €. Déplacement inclus (rayon 20 km). Brushing en option (+15 €). Réservation 48 h à l'avance." },
    { title: 'Service B', content: "Coiffure à domicile — Coupe + couleur + brushing INCLUS dans le tarif. Prix forfait complet femme : 95 €. Déplacement offert. Disponible 7j/7." },
    { title: 'Service C', content: "Salon de coiffure — Coupe + brushing femme : 55 €. Coloration : à partir de 40 €. Pas de déplacement à domicile. Rendez-vous en ligne." },
    { title: 'Service D', content: "Coiffure événementielle — Mariages, soirées, shooting. Coiffure + maquillage forfait : 120 €. Déplacement inclus. Brushing non proposé séparément." },
  ]);

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel service inclut le brushing sans surcoût ?",
    optionA: "Service A",
    optionB: "Service B",
    optionC: "Service C",
    optionD: "Service D",
    correctAnswer: 'B',
  }));

  /* ── Q22 ─────────────────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    comment: "Après une chute brutale au deuxième trimestre, les ventes de cette entreprise rebondissent fortement dès le trimestre suivant.",
    question: "Quel graphique correspond au commentaire ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  /* ── Q23-32 ──────────────────────────────────────────────────────────── */

  const DOC_LOGEMENT_SERVICE =
`RÈGLEMENT — LOGEMENT DE SERVICE GRATUIT

Les logements de service sont attribués à titre gratuit aux agents dont la présence permanente est indispensable à l'exercice de leurs fonctions (ex. : gardiens, directeurs d'établissements).

Conditions d'occupation : le logement est strictement réservé à l'agent et à sa famille directe. Toute sous-location est interdite.
Charges : l'agent prend en charge l'électricité, le gaz et les charges téléphoniques. Les charges de copropriété restent à la charge de l'employeur.
Mutations : en cas de mutation ou de fin de fonctions, le logement doit être libéré dans un délai de trois mois.
Fin du droit : le droit au logement cesse dès la cessation des fonctions justifiant l'attribution.`;

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement — Logement de service gratuit",
    longText: DOC_LOGEMENT_SERVICE,
    question: "Qui peut bénéficier d'un logement de service ?",
    optionA: "Tout salarié de l'entreprise.",
    optionB: "Les agents dont la présence permanente est indispensable.",
    optionC: "Les salariés ayant plus de 10 ans d'ancienneté.",
    optionD: "Les cadres dirigeants uniquement.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement — Logement de service gratuit",
    longText: DOC_LOGEMENT_SERVICE,
    question: "Quel délai est accordé pour libérer le logement en cas de mutation ?",
    optionA: "1 mois.",
    optionB: "2 mois.",
    optionC: "3 mois.",
    optionD: "6 mois.",
    correctAnswer: 'C',
  }));

  const DOC_SANTE_TRAVAIL =
`NOTE — PROGRAMME SANTÉ AU TRAVAIL 2025

L'entreprise renforce son engagement pour la santé et le bien-être de ses collaborateurs.

Ergonomie : audit des postes de travail réalisé en mars par un ergonome certifié. Des réglages de sièges et d'écrans seront proposés à chaque salarié.
Examens médicaux : tous les salariés bénéficieront d'une visite médicale annuelle avec bilan sanguin complet pris en charge à 100 % par l'entreprise.
Risques psychosociaux : un psychologue du travail intervient deux demi-journées par mois en consultation confidentielle. Un numéro d'écoute anonyme est également disponible 24 h/24.

Ces mesures complètent le Document Unique de Prévention mis à jour chaque année.`;

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note — Programme santé au travail 2025",
    longText: DOC_SANTE_TRAVAIL,
    question: "Qui réalise l'audit des postes de travail ?",
    optionA: "Le médecin du travail.",
    optionB: "Le responsable RH.",
    optionC: "Un ergonome certifié.",
    optionD: "Le chef de service.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note — Programme santé au travail 2025",
    longText: DOC_SANTE_TRAVAIL,
    question: "À quelle fréquence le psychologue du travail intervient-il ?",
    optionA: "Chaque semaine.",
    optionB: "Deux demi-journées par mois.",
    optionC: "Une journée par trimestre.",
    optionD: "À la demande uniquement.",
    correctAnswer: 'B',
  }));

  const DOC_HARCELEMENT =
`CHARTE — LUTTE CONTRE LE HARCÈLEMENT MORAL ET SEXUEL

L'entreprise s'engage à prévenir et sanctionner tout acte de harcèlement moral ou sexuel.

Définitions : le harcèlement moral recouvre des agissements répétés qui dégradent les conditions de travail. Le harcèlement sexuel inclut tout propos ou comportement à connotation sexuelle non désiré.
Signalement : tout salarié témoin ou victime peut signaler les faits au référent harcèlement, au CSE ou directement à la DRH. Le signalement peut être anonyme.
Procédure : une enquête est ouverte dans les 10 jours suivant le signalement. Le plaignant est protégé contre toute mesure de rétorsion.
Sanctions : selon la gravité des faits, les sanctions peuvent aller de l'avertissement au licenciement pour faute grave.`;

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Charte — Lutte contre le harcèlement moral et sexuel",
    longText: DOC_HARCELEMENT,
    question: "Le signalement de harcèlement peut-il être anonyme ?",
    optionA: "Non, l'identité est obligatoire.",
    optionB: "Oui, le signalement peut être anonyme.",
    optionC: "Seulement pour les cas de harcèlement sexuel.",
    optionD: "Seulement si approuvé par la DRH.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Charte — Lutte contre le harcèlement moral et sexuel",
    longText: DOC_HARCELEMENT,
    question: "Dans quel délai l'enquête est-elle ouverte après un signalement ?",
    optionA: "Dans les 5 jours.",
    optionB: "Dans les 10 jours.",
    optionC: "Dans les 15 jours.",
    optionD: "Dans les 30 jours.",
    correctAnswer: 'B',
  }));

  const DOC_DECONNEXION =
`GUIDE — DROIT À LA DÉCONNEXION

Le droit à la déconnexion est inscrit dans le Code du travail depuis 2017. Il garantit aux salariés le droit de ne pas être contactés hors des heures de travail.

Plages horaires : les heures de disponibilité sont définies dans la charte de déconnexion de l'entreprise. En dehors de ces plages, aucune réponse aux emails ou appels n'est exigée.
Charte : l'entreprise a adopté une charte de déconnexion, affichée dans chaque espace de travail et accessible sur l'intranet.
Outils : des fonctions de programmation d'envoi d'emails sont disponibles sur tous les postes pour éviter d'envoyer des messages hors horaires.
Formation managers : tous les managers ont suivi une formation de 4 h sur le respect de la déconnexion de leurs équipes.`;

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide — Droit à la déconnexion",
    longText: DOC_DECONNEXION,
    question: "Depuis quelle année le droit à la déconnexion est-il inscrit dans le Code du travail ?",
    optionA: "2010.",
    optionB: "2015.",
    optionC: "2017.",
    optionD: "2020.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide — Droit à la déconnexion",
    longText: DOC_DECONNEXION,
    question: "Quelle formation ont reçue les managers concernant la déconnexion ?",
    optionA: "Une journée complète.",
    optionB: "Une formation de 4 heures.",
    optionC: "Un module e-learning de 2 heures.",
    optionD: "Aucune formation spécifique.",
    correctAnswer: 'B',
  }));

  const DOC_RECOURS_DISCIPLINAIRE =
`PROCÉDURE DE RECOURS DISCIPLINAIRE — Droits du salarié

Tout salarié convoqué à un entretien disciplinaire dispose des droits suivants :

Convocation : elle doit être remise en main propre ou par lettre recommandée, avec un délai minimum de 5 jours ouvrables avant l'entretien.
Représentation : le salarié a le droit d'être assisté par un représentant du personnel ou un conseiller extérieur à l'entreprise.
Délais : la sanction ne peut être prononcée moins de 2 jours ni plus d'un mois après l'entretien.
Niveaux de sanctions : avertissement écrit, mise à pied conservatoire, mutation disciplinaire, rétrogradation, licenciement pour faute.

Tout salarié peut contester la sanction devant le Conseil de prud'hommes.`;

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Procédure de recours disciplinaire",
    longText: DOC_RECOURS_DISCIPLINAIRE,
    question: "Quel délai minimum est requis entre la convocation et l'entretien ?",
    optionA: "2 jours ouvrables.",
    optionB: "3 jours ouvrables.",
    optionC: "5 jours ouvrables.",
    optionD: "7 jours ouvrables.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Procédure de recours disciplinaire",
    longText: DOC_RECOURS_DISCIPLINAIRE,
    question: "Devant quelle instance un salarié peut-il contester une sanction ?",
    optionA: "Le tribunal administratif.",
    optionB: "Le Conseil de prud'hommes.",
    optionC: "La chambre sociale de la Cour d'appel.",
    optionD: "La Commission nationale du travail.",
    correctAnswer: 'B',
  }));

  /* ── Q33-40 ──────────────────────────────────────────────────────────── */

  const ART_URGENTISTES =
`Le burnout des médecins urgentistes est devenu un phénomène alarmant en France. Selon une étude publiée par la Société Française de Médecine d'Urgence, plus de 40 % des urgentistes présentent des signes de détresse professionnelle sévère, contre 25 % il y a dix ans.

Les causes sont multiples et bien identifiées : surcharge de travail chronique, manque de personnel, nuits et week-ends à répétition, confrontation quotidienne à la souffrance et à la mort, et sentiment de dévalorisation face à un système hospitalier sous pression constante.

Les conséquences sont graves : absentéisme en hausse, démissions en masse, et désertification progressive des services d'urgence dans les zones rurales. Certains hôpitaux de province peinent à maintenir une garde 24 h/24.

Des solutions émergent : nouvelles organisations du travail, coaching professionnel, groupes de parole entre pairs, et révision des protocoles d'affectation. Mais pour nombre de soignants, ces mesures arrivent trop tard.`;

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Épuisement des médecins urgentistes : un mal qui s'aggrave",
    longText: ART_URGENTISTES,
    question: "Quel pourcentage d'urgentistes présente des signes de détresse professionnelle sévère ?",
    optionA: "25 %.",
    optionB: "30 %.",
    optionC: "40 %.",
    optionD: "55 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Épuisement des médecins urgentistes : un mal qui s'aggrave",
    longText: ART_URGENTISTES,
    question: "Quelle conséquence l'article mentionne-t-il pour les zones rurales ?",
    optionA: "La fermeture des hôpitaux généraux.",
    optionB: "La désertification des services d'urgence.",
    optionC: "L'augmentation des accidents médicaux.",
    optionD: "Le transfert des patients vers l'étranger.",
    correctAnswer: 'B',
  }));

  const ART_RESILIENCE =
`La notion de résilience territoriale est au cœur des réflexions sur la gestion post-catastrophe. Après les désastres de Fukushima en 2011 et de la Nouvelle-Orléans en 2005, des leçons essentielles ont été tirées sur la capacité des sociétés à se reconstruire durablement.

À Fukushima, la reconstruction a mis en lumière les tensions entre impératifs économiques — la relance du tourisme et de l'agriculture — et la nécessité de maintenir des protocoles de sécurité stricts. Dix ans après l'accident, certaines zones restent inhabitables, mais d'autres ont été réhabilitées grâce à des technologies de décontamination innovantes.

La Nouvelle-Orléans offre un autre exemple : la reconstruction post-Katrina a été l'occasion de repenser l'urbanisme de la ville, mais elle a aussi amplifié les inégalités sociales, certains quartiers défavorisés n'ayant jamais retrouvé leur population d'avant la catastrophe.

Ces deux cas montrent que la résilience n'est pas seulement technique : elle est aussi sociale, politique et culturelle.`;

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Résilience territoriale après crise : leçons de Fukushima et Katrina",
    longText: ART_RESILIENCE,
    question: "Quelle tension est mentionnée dans la reconstruction de Fukushima ?",
    optionA: "Entre tourisme et sécurité nucléaire.",
    optionB: "Entre intérêts économiques et protocoles de sécurité.",
    optionC: "Entre les autorités locales et le gouvernement national.",
    optionD: "Entre les habitants et les entreprises de décontamination.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Résilience territoriale après crise : leçons de Fukushima et Katrina",
    longText: ART_RESILIENCE,
    question: "Quel problème la reconstruction post-Katrina a-t-elle amplifié ?",
    optionA: "La corruption des élus locaux.",
    optionB: "Les inégalités sociales.",
    optionC: "La montée des eaux.",
    optionD: "La criminalité urbaine.",
    correctAnswer: 'B',
  }));

  const ART_CULTURE_VIOL =
`La notion de « culture du viol » désigne l'ensemble des attitudes et croyances qui normalisent ou banalisent les agressions sexuelles dans une société. Ce concept, longtemps controversé, est aujourd'hui reconnu par les instances internationales comme un problème structurel, et non comme une pathologie individuelle.

En France, les campagnes de sensibilisation au consentement se multiplient depuis le mouvement #MeToo. Des programmes d'éducation sexuelle sont intégrés progressivement dans les établissements scolaires dès le collège, avec pour objectif d'apprendre aux jeunes à identifier et à exprimer leurs limites.

Les chiffres restent alarmants : selon le ministère de l'Intérieur, une femme sur six déclare avoir subi une agression sexuelle au cours de sa vie. Le chiffre noir — les cas non déclarés — est estimé à dix fois plus élevé.

Des politiques publiques renforcées, une justice plus accessible pour les victimes et une formation des forces de l'ordre aux spécificités du traumatisme sexuel sont présentées comme les trois piliers d'une réponse efficace.`;

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Culture du viol : vers une prise de conscience des jeunes",
    longText: ART_CULTURE_VIOL,
    question: "Que désigne le « chiffre noir » mentionné dans cet article ?",
    optionA: "Le nombre de condamnations pour agressions sexuelles.",
    optionB: "Les cas d'agressions non déclarés.",
    optionC: "Le budget alloué à la lutte contre les violences sexuelles.",
    optionD: "Le nombre d'agresseurs récidivistes.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Culture du viol : vers une prise de conscience des jeunes",
    longText: ART_CULTURE_VIOL,
    question: "Quels sont les trois piliers d'une réponse efficace selon l'article ?",
    optionA: "Éducation, prévention et répression.",
    optionB: "Politiques publiques, justice accessible et formation des forces de l'ordre.",
    optionC: "Campagnes médiatiques, psychologie et législation.",
    optionD: "Réseaux sociaux, école et famille.",
    correctAnswer: 'B',
  }));

  const ART_LECTURE =
`La lecture affecte profondément le cerveau, bien au-delà de la simple acquisition de connaissances. Des études en neurosciences montrent que la lecture d'un roman active les zones cérébrales liées à l'empathie et à la simulation mentale des expériences vécues par les personnages.

Des recherches de l'Université d'Emory ont démontré que des étudiants ayant lu un roman pendant neuf nuits présentaient une connectivité neuronale accrue dans les zones sensorielles et motrices — effets mesurables jusqu'à cinq jours après la fin de la lecture.

La lecture améliore également la concentration : en entraînant le cerveau à maintenir une attention soutenue sur un texte, elle constitue un exercice cognitif qui contraste fortement avec la consultation de contenus numériques courts et fragmentés. L'usage intensif des smartphones est souvent cité comme facteur d'altération de la capacité à lire des textes longs.

Face à ces constats, certains enseignants expérimentent des « zones de lecture silencieuse » en classe, sans écrans, pour préserver et développer ces capacités chez les jeunes.`;

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La lecture et le cerveau : ce que disent les neurosciences",
    longText: ART_LECTURE,
    question: "Selon l'étude de l'Université d'Emory, combien de temps durent les effets de la lecture après sa fin ?",
    optionA: "1 jour.",
    optionB: "5 jours.",
    optionC: "2 semaines.",
    optionD: "1 mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La lecture et le cerveau : ce que disent les neurosciences",
    longText: ART_LECTURE,
    question: "Qu'est-ce qui est souvent cité comme facteur d'altération de la capacité à lire des textes longs ?",
    optionA: "Le manque de pratique scolaire.",
    optionB: "L'usage intensif des smartphones.",
    optionC: "La mauvaise qualité des livres disponibles.",
    optionD: "Le niveau de bruit en classe.",
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

    console.log(`\n✅ ${inserted} questions créées pour CE 36.`);

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
