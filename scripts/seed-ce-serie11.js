'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyofj000070wxlmztyphw2';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

function generateQ22SVG() {
  // Line chart: monthly visitor counts (J-D), correct = Graphique 1 (peak in June-July)
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const graphs = [
    { label: 'Graphique 1', values: [120,180,220,280,350,420,390,300,200,140,130,115], color: '#003087' },
    { label: 'Graphique 2', values: [400,380,350,300,280,250,220,230,270,310,360,390], color: '#E30613' },
    { label: 'Graphique 3', values: [200,200,210,210,220,215,220,210,205,210,200,200], color: '#E30613' },
    { label: 'Graphique 4', values: [100,150,200,300,280,260,240,270,300,200,150,100], color: '#E30613' },
  ];

  const W = 800, H = 460;
  const cols = 2, rows = 2;
  const gW = W / cols, gH = H / rows;
  const padL = 35, padR = 10, padT = 30, padB = 30;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>`;

  graphs.forEach((g, gi) => {
    const col = gi % cols;
    const row = Math.floor(gi / cols);
    const ox = col * gW;
    const oy = row * gH;
    const chartW = gW - padL - padR;
    const chartH = gH - padT - padB;
    const maxVal = Math.max(...g.values) * 1.1;
    const step = chartW / (months.length - 1);

    svgContent += `\n  <text x="${ox + gW / 2}" y="${oy + 14}" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#333">${g.label}</text>`;

    // Axes
    svgContent += `\n  <line x1="${ox + padL}" y1="${oy + padT}" x2="${ox + padL}" y2="${oy + padT + chartH}" stroke="#ccc" stroke-width="1"/>`;
    svgContent += `\n  <line x1="${ox + padL}" y1="${oy + padT + chartH}" x2="${ox + padL + chartW}" y2="${oy + padT + chartH}" stroke="#ccc" stroke-width="1"/>`;

    // Points and lines
    const pts = g.values.map((v, i) => {
      const x = ox + padL + i * step;
      const y = oy + padT + chartH - (v / maxVal) * chartH;
      return { x, y };
    });

    for (let i = 0; i < pts.length - 1; i++) {
      svgContent += `\n  <line x1="${pts[i].x.toFixed(1)}" y1="${pts[i].y.toFixed(1)}" x2="${pts[i+1].x.toFixed(1)}" y2="${pts[i+1].y.toFixed(1)}" stroke="${g.color}" stroke-width="2"/>`;
    }

    pts.forEach((p, i) => {
      svgContent += `\n  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${g.color}"/>`;
      svgContent += `\n  <text x="${p.x.toFixed(1)}" y="${oy + padT + chartH + 12}" text-anchor="middle" font-size="8" font-family="Arial" fill="#555">${months[i]}</text>`;
    });
  });

  svgContent += `\n</svg>`;
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

const q = (order, cat, sub, data) => ({
  moduleId: MODULE_ID,
  seriesId: SERIES_ID,
  questionOrder: order,
  category: cat,
  subCategory: sub ?? null,
  taskTitle: data.taskTitle ?? null,
  longText: data.longText ?? null,
  consigne: data.consigne ?? null,
  comment: data.comment ?? null,
  imageUrl: data.imageUrl ?? null,
  audioUrl: null,
  question: data.question,
  optionA: data.optionA,
  optionB: data.optionB,
  optionC: data.optionC,
  optionD: data.optionD,
  correctAnswer: data.correctAnswer,
  explanation: data.explanation ?? null,
});

function buildQuestions() {
  const questions = [];

  // Q1-7: Documents de la vie quotidienne
  questions.push(q(1, 'Q1-7', null, {
    taskTitle: 'Affiche d\'un marché de producteurs',
    longText: 'MARCHÉ DES PRODUCTEURS LOCAUX\nTous les samedis de 8h00 à 13h00\nPlace de la République — Saint-Genis-Laval\n\nVous trouverez : Fruits et légumes bio, fromages artisanaux, pain au levain, miel et confitures, œufs fermiers, viandes et charcuteries.\n\nCe mois-ci : Atelier cuisine gratuit le 1er samedi du mois à 10h30 — inscription obligatoire.\nAnimation musicale : 11h00 – 12h30.\n\nStationnement gratuit place du Général-de-Gaulle (200 places).',
    question: 'À quelle fréquence a lieu le marché ?',
    optionA: 'Tous les dimanches.',
    optionB: 'Tous les samedis.',
    optionC: 'Deux fois par semaine.',
    optionD: 'Une fois par mois.',
    correctAnswer: 'B',
    explanation: 'L\'affiche précise "Tous les samedis de 8h00 à 13h00".',
  }));

  questions.push(q(2, 'Q1-7', null, {
    taskTitle: 'Courriel de bienvenue — Résidence étudiante',
    longText: 'De : accueil@residence-bellevue.fr\nÀ : sophie.martin@univ-lyon.fr\nObjet : Bienvenue à la Résidence Bellevue\n\nChère Sophie,\n\nNous sommes heureux de vous accueillir à la Résidence Bellevue à partir du 1er septembre.\n\nVotre studio (n°214, 2e étage) est disponible dès 14h le jour de votre arrivée. Les clés vous seront remises à l\'accueil sur présentation d\'une pièce d\'identité et du règlement de la caution (300€ en chèque).\n\nÉquipements disponibles : cuisine commune (RDC), salle de sport (sous-sol, accès par badge), Wi-Fi inclus dans les charges, local vélos sécurisé.\n\nSi vous avez des questions, contactez-nous au 04 72 55 44 33.\nL\'équipe de la Résidence Bellevue',
    question: 'Que doit présenter Sophie pour récupérer ses clés ?',
    optionA: 'Son contrat de location uniquement.',
    optionB: 'Sa carte étudiante.',
    optionC: 'Une pièce d\'identité et le paiement de la caution.',
    optionD: 'Une attestation d\'assurance.',
    correctAnswer: 'C',
    explanation: 'Le courriel précise "sur présentation d\'une pièce d\'identité et du règlement de la caution (300€ en chèque)".',
  }));

  questions.push(q(3, 'Q1-7', null, {
    taskTitle: 'Notice d\'un médicament',
    longText: 'DOLIPRANE 1000 mg — Comprimés\nPRINCIPE ACTIF : Paracétamol\nINDICATIONS : Traitement des douleurs légères à modérées et de la fièvre.\nPOSOLOGIE ADULTE : 1 comprimé toutes les 6 heures. Ne pas dépasser 3 comprimés par 24 heures sans avis médical.\nCONTRE-INDICATIONS : Insuffisance hépatique, hypersensibilité au paracétamol.\nPRÉCAUTIONS : Ne pas consommer d\'alcool pendant le traitement. Ne pas associer à d\'autres médicaments contenant du paracétamol.\nCONSERVATION : Conserver à température ambiante, à l\'abri de l\'humidité. Tenir hors de portée des enfants.',
    question: 'Combien de comprimés maximum peut-on prendre par 24 heures sans avis médical ?',
    optionA: 'Deux.',
    optionB: 'Quatre.',
    optionC: 'Trois.',
    optionD: 'Un.',
    correctAnswer: 'C',
    explanation: 'La notice précise "Ne pas dépasser 3 comprimés par 24 heures sans avis médical".',
  }));

  questions.push(q(4, 'Q1-7', null, {
    taskTitle: 'Annonce de recrutement bénévoles',
    longText: 'ASSOCIATION SOLIDARITÉ SENIORS\nRECRUTEMENT DE BÉNÉVOLES\n\nNous recherchons des bénévoles motivés pour accompagner nos actions auprès des personnes âgées isolées dans les Bouches-du-Rhône.\n\nMissions proposées :\n• Visite à domicile (1h/semaine minimum)\n• Aide aux courses et démarches administratives\n• Animation d\'ateliers numériques\n• Accompagnement aux rendez-vous médicaux\n\nProfil recherché : Toute personne majeure, empathique, disponible et véhiculée (pour certaines missions). Aucune compétence particulière requise, juste de la bonne volonté !\n\nContact : benevolat@solidarite-seniors.org\nRéunion d\'information : 1er lundi du mois à 18h30, 45 rue de la Paix, Marseille.',
    question: 'Quel profil est demandé pour les bénévoles ?',
    optionA: 'Avoir une formation médicale.',
    optionB: 'Être disponible au moins 10h/semaine.',
    optionC: 'Être majeur, empathique et disponible.',
    optionD: 'Avoir plus de 30 ans.',
    correctAnswer: 'C',
    explanation: 'L\'annonce précise "Toute personne majeure, empathique, disponible et véhiculée".',
  }));

  questions.push(q(5, 'Q1-7', null, {
    taskTitle: 'Note d\'information — Entreprise',
    longText: 'NOTE D\'INFORMATION\nÀ tous les salariés\nObjet : Fermeture exceptionnelle — Pont du 8 mai\n\nNous vous informons que l\'entreprise sera fermée les vendredi 9 mai et lundi 12 mai afin de créer un pont de 4 jours consécutifs autour du 8 mai (jeudi férié).\n\nCes deux journées seront décomptées du solde de congés payés de chaque salarié.\n\nLes salariés souhaitant travailler ces jours-là peuvent en faire la demande auprès de leur responsable avant le 25 avril. Une compensation sera accordée sous forme de repos.\n\nMerci de noter ces dates dans vos agendas.\nLa Direction',
    question: 'Comment seront traitées les journées du 9 et 12 mai pour les salariés ?',
    optionA: 'Comme des jours fériés payés.',
    optionB: 'Comme des heures supplémentaires.',
    optionC: 'Comme des jours de congés payés.',
    optionD: 'Comme des jours de récupération.',
    correctAnswer: 'C',
    explanation: 'La note précise que "ces deux journées seront décomptées du solde de congés payés".',
  }));

  questions.push(q(6, 'Q1-7', null, {
    taskTitle: 'Panneau dans un parc public',
    longText: 'PARC MUNICIPAL DES SOURCES\nRÈGLEMENT\n\n✓ Ouvert tous les jours de 7h00 à 21h00 (22h00 en été)\n✓ Les chiens sont admis tenus en laisse\n✓ Les jeux pour enfants sont accessibles aux moins de 12 ans\n✓ Les vélos sont autorisés sur les allées principales uniquement\n\n✗ Interdit : Barbecues et feux de toute nature\n✗ Interdit : Consommation d\'alcool\n✗ Interdit : Musique amplifiée\n✗ Interdit : Déchets hors des poubelles prévues\n\nEn cas de trouble à l\'ordre public, la Police Municipale peut être appelée au 17.',
    question: 'Que peut-on faire avec un chien dans ce parc ?',
    optionA: 'Le laisser courir librement.',
    optionB: 'Le tenir en laisse.',
    optionC: 'L\'attacher à un banc.',
    optionD: 'Les chiens sont interdits.',
    correctAnswer: 'B',
    explanation: 'Le règlement indique "Les chiens sont admis tenus en laisse".',
  }));

  questions.push(q(7, 'Q1-7', null, {
    taskTitle: 'Courriel de candidature',
    longText: 'De : paul.dumont@email.com\nÀ : recrutement@agence-creative.fr\nObjet : Candidature au poste de Chargé de Communication\n\nMadame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de Chargé de Communication publié sur votre site le 10 mars.\n\nTitulaire d\'une licence en Communication et fort de 3 ans d\'expérience en agence de publicité, je maîtrise la rédaction de contenus, la gestion des réseaux sociaux et la création de supports visuels. Je suis également à l\'aise avec les outils Adobe Creative Suite.\n\nJe suis disponible immédiatement et serais heureux de vous rencontrer pour un entretien.\n\nVous trouverez en pièce jointe mon CV et une lettre de motivation détaillée.\n\nCordialement,\nPaul Dumont — 06 78 90 12 34',
    question: 'Combien d\'années d\'expérience Paul Dumont a-t-il en agence de publicité ?',
    optionA: 'Cinq ans.',
    optionB: 'Un an.',
    optionC: 'Deux ans.',
    optionD: 'Trois ans.',
    correctAnswer: 'D',
    explanation: 'Paul Dumont mentionne "3 ans d\'expérience en agence de publicité".',
  }));

  // Q8-13: Phrases lacunaires
  const phrasesLacunaires = [
    {
      q: 'Le conseil municipal a voté à l\'unanimité en faveur de la ______ du budget pour les travaux de voirie.',
      a: 'réduction', b: 'suppression', c: 'révision', d: 'augmentation',
      correct: 'D',
      exp: '"Voter en faveur de l\'augmentation du budget" signifie décider d\'en allouer davantage.',
    },
    {
      q: 'La société doit ______ aux nouvelles normes environnementales avant la fin de l\'année fiscale.',
      a: 'résister', b: 'se conformer', c: 's\'opposer', d: 'renoncer',
      correct: 'B',
      exp: '"Se conformer aux normes" signifie les respecter et les appliquer.',
    },
    {
      q: 'Les candidats doivent ______ leur dossier complet au secrétariat avant le vendredi 28 mars.',
      a: 'retirer', b: 'perdre', c: 'déposer', d: 'refuser',
      correct: 'C',
      exp: '"Déposer un dossier" signifie le remettre à l\'autorité compétente.',
    },
    {
      q: 'L\'entreprise a décidé de ______ ses activités à l\'international pour conquérir de nouveaux marchés.',
      a: 'limiter', b: 'réduire', c: 'étendre', d: 'fermer',
      correct: 'C',
      exp: '"Étendre ses activités" signifie les développer et les élargir.',
    },
    {
      q: 'Afin de ______ les tensions entre les deux départements, la direction a nommé un médiateur.',
      a: 'aggraver', b: 'créer', c: 'ignorer', d: 'apaiser',
      correct: 'D',
      exp: '"Apaiser les tensions" signifie les réduire et rétablir un climat serein.',
    },
    {
      q: 'Le rapport annuel doit être ______ par le conseil d\'administration avant publication.',
      a: 'imprimé', b: 'traduit', c: 'approuvé', d: 'distribué',
      correct: 'C',
      exp: '"Approuvé par le conseil d\'administration" signifie officiellement validé avant diffusion.',
    },
  ];

  phrasesLacunaires.forEach((item, i) => {
    questions.push(q(8 + i, 'Q8-17', 'Phrases lacunaires', {
      question: item.q,
      optionA: item.a,
      optionB: item.b,
      optionC: item.c,
      optionD: item.d,
      correctAnswer: item.correct,
      explanation: item.exp,
    }));
  });

  // Q14-17: Textes lacunaires
  const texte1 = `L\'entrepreneuriat social connaît un essor remarquable en France depuis une décennie. Ces entreprises, appelées aussi "entreprises à impact", cherchent à [14] des problèmes sociaux ou environnementaux tout en étant économiquement viables. Contrairement aux associations, elles génèrent des bénéfices, mais ceux-ci sont en grande partie [15] dans l\'entreprise ou redistribués à des fins sociales. Le statut de Société coopérative d\'intérêt collectif (SCIC) est particulièrement adapté à ce modèle, car il permet d\'associer différentes [16] : salariés, clients, bénévoles et collectivités. Pour financer leur développement, ces entreprises font appel à des investisseurs [17], qui acceptent un rendement financier moindre en échange d\'un impact social mesurable.`;

  questions.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur l\'entrepreneuriat social',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'ignorer', optionB: 'créer', optionC: 'résoudre', optionD: 'éviter',
    correctAnswer: 'C',
    explanation: 'Les entreprises sociales cherchent à "résoudre" des problèmes sociaux ou environnementaux.',
  }));

  questions.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur l\'entrepreneuriat social',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'distribués aux actionnaires', optionB: 'réinvestis', optionC: 'perdus', optionD: 'dépensés en publicité',
    correctAnswer: 'B',
    explanation: 'Les bénéfices sont "réinvestis" dans l\'entreprise ou redistribués à des fins sociales.',
  }));

  questions.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur l\'entrepreneuriat social',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'parties prenantes', optionB: 'concurrents', optionC: 'administrations', optionD: 'actionnaires majoritaires',
    correctAnswer: 'A',
    explanation: 'Le statut SCIC permet d\'associer différentes "parties prenantes" : salariés, clients, bénévoles, collectivités.',
  }));

  questions.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur l\'entrepreneuriat social',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'spéculatifs', optionB: 'prudents', optionC: 'patients', optionD: 'étrangers',
    correctAnswer: 'C',
    explanation: 'Les investisseurs "patients" acceptent un rendement financier moindre en échange d\'un impact social.',
  }));

  // Q18-21: Tableaux comparatifs
  const logementsLongText = JSON.stringify([
    {
      title: 'Résidence Universitaire Jean-Moulin',
      content: 'Type : Studio 18m². Loyer : 380€/mois charges incluses. Caution : 1 mois. Disponible : dès octobre. Wi-Fi inclus. Restaurant universitaire à 50m. Proche BU et amphithéâtres.',
    },
    {
      title: 'Foyer Étudiant Sainte-Marie',
      content: 'Type : Chambre simple 12m². Pension complète (repas inclus). Loyer : 620€/mois. Pas de cuisine individuelle. Horaires d\'accueil stricts (22h max). Mixité autorisée.',
    },
    {
      title: 'Colocation Les Érables',
      content: 'Type : Chambre dans appartement 4 colocataires. Loyer : 290€/mois + charges (env. 60€). Wi-Fi partagé. Cuisine et salon communs. Animaux acceptés. Disponible dès septembre.',
    },
    {
      title: 'Studio meublé privé — Résidence Lumière',
      content: 'Type : Studio 22m² entièrement meublé. Loyer : 550€/mois hors charges. Caution : 2 mois. Disponible immédiatement. Gardien sur place 24h/24. Parking vélo sécurisé.',
    },
  ]);

  questions.push(q(18, 'Q18-21', null, {
    taskTitle: 'Comparatif de logements étudiants',
    longText: logementsLongText,
    question: 'Quel logement est disponible immédiatement et dispose d\'un gardien présent en permanence ?',
    optionA: 'Résidence Universitaire Jean-Moulin.',
    optionB: 'Foyer Étudiant Sainte-Marie.',
    optionC: 'Studio meublé privé — Résidence Lumière.',
    optionD: 'Colocation Les Érables.',
    correctAnswer: 'C',
    explanation: 'La Résidence Lumière est "disponible immédiatement" et dispose d\'un "gardien sur place 24h/24".',
  }));

  const activitesSeniorsLongText = JSON.stringify([
    {
      title: 'Club Seniors Évasion',
      content: 'Activités : sorties culturelles, voyages organisés, ateliers mémoire. Cotisation : 80€/an. Réunions hebdomadaires le mardi matin. Uniquement en présentiel. Adhésion sur liste d\'attente actuellement.',
    },
    {
      title: 'Association Bien Vieillir',
      content: 'Activités : gymnastique douce, yoga, relaxation. En salle ou en ligne. Tarif : 15€/séance ou 120€/trimestre. Cours animés par kinésithérapeutes certifiés. Pas de déplacement requis pour les cours en ligne.',
    },
    {
      title: 'Service d\'aide à domicile SeniorConfort',
      content: 'Prestations : aide aux repas, entretien du logement, courses, accompagnement sorties médicales. Intervention à domicile. Tarif : 22€/heure (APA déductible). Disponible 7j/7.',
    },
    {
      title: 'Université du Temps Libre',
      content: 'Cours : histoire de l\'art, littérature, langues, informatique. En présentiel uniquement. Tarif : 250€/an (accès illimité). Inscriptions en septembre et janvier.',
    },
  ]);

  questions.push(q(19, 'Q18-21', null, {
    taskTitle: 'Comparatif d\'activités pour seniors',
    longText: activitesSeniorsLongText,
    question: 'Quel service peut intervenir directement au domicile de la personne ?',
    optionA: 'Club Seniors Évasion.',
    optionB: 'Association Bien Vieillir.',
    optionC: 'Université du Temps Libre.',
    optionD: 'Service SeniorConfort.',
    correctAnswer: 'D',
    explanation: 'SeniorConfort propose des "prestations à domicile" disponibles 7j/7.',
  }));

  const offresCadresLongText = JSON.stringify([
    {
      title: 'Directeur Financier — Groupe Alstom',
      content: 'Poste : CDI. Salaire : 85 000€ brut/an. Expérience requise : 10 ans minimum. Lieu : Paris La Défense. Avantages : voiture de fonction, intéressement, 12 RTT. Management d\'une équipe de 15 personnes.',
    },
    {
      title: 'Responsable Marketing Digital — StartUp FinTech',
      content: 'Poste : CDI. Salaire : 55 000€ brut/an + variable. Expérience requise : 5 ans. Lieu : Lyon (télétravail partiel). Avantages : stock-options, mutuelle premium, 3 semaines de congés supplémentaires.',
    },
    {
      title: 'Directeur des Ressources Humaines — PME Industrielle',
      content: 'Poste : CDI. Salaire : 75 000€ brut/an. Expérience requise : 8 ans en RH. Lieu : Grenoble. Avantages : intéressement, participation, RTT, flexibilité horaire.',
    },
    {
      title: 'Responsable Juridique — Cabinet d\'avocats',
      content: 'Poste : CDI. Salaire : 65 000€ brut/an. Expérience requise : 6 ans. Lieu : Bordeaux. Avantages : prime annuelle, formation continue financée.',
    },
  ]);

  questions.push(q(20, 'Q18-21', null, {
    taskTitle: 'Comparatif d\'offres d\'emploi cadres',
    longText: offresCadresLongText,
    question: 'Quelle offre d\'emploi propose le salaire annuel le plus élevé ?',
    optionA: 'Directeur Financier — Groupe Alstom.',
    optionB: 'Directeur des Ressources Humaines.',
    optionC: 'Responsable Juridique.',
    optionD: 'Responsable Marketing Digital.',
    correctAnswer: 'A',
    explanation: 'Le poste de Directeur Financier chez Alstom propose 85 000€ brut/an, le salaire le plus élevé.',
  }));

  const streamingLongText = JSON.stringify([
    {
      title: 'StreamVid Plus',
      content: 'Contenu : Films, séries, documentaires. Abonnement : 13,99€/mois. Téléchargement hors ligne inclus. Pas de musique. 4K disponible en offre Premium (17,99€). Sans engagement.',
    },
    {
      title: 'SoundMax',
      content: 'Contenu : Musique illimitée (100 millions de titres), podcasts, livres audio. Abonnement : 9,99€/mois. Sans engagement. Écoute hors ligne incluse. Pas de vidéos.',
    },
    {
      title: 'TotalPlay',
      content: 'Contenu : Vidéo + musique + jeux mobiles. Abonnement : 19,99€/mois. Engagement 12 mois. Contenu familial. 6 profils inclus. Téléchargement limité à 25 titres/mois.',
    },
    {
      title: 'SportStream',
      content: 'Contenu : Sport en direct uniquement (foot, tennis, basketball, F1). Abonnement : 29,99€/mois. Sans engagement. Accès mobile et TV. Pas de replay au-delà de 48h.',
    },
  ]);

  questions.push(q(21, 'Q18-21', null, {
    taskTitle: 'Comparatif de services de streaming',
    longText: streamingLongText,
    question: 'Quel service de streaming propose l\'accès à de la musique illimitée ?',
    optionA: 'TotalPlay.',
    optionB: 'SoundMax.',
    optionC: 'StreamVid Plus.',
    optionD: 'SportStream.',
    correctAnswer: 'B',
    explanation: 'SoundMax propose "Musique illimitée (100 millions de titres)" comme contenu principal.',
  }));

  // Q22: Graphique
  questions.push(q(22, 'Q22', null, {
    taskTitle: 'Fréquentation mensuelle d\'un site touristique',
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique illustre une fréquentation qui culmine en juin-juillet avant de décliner progressivement ?',
    optionA: 'Graphique 1.',
    optionB: 'Graphique 2.',
    optionC: 'Graphique 3.',
    optionD: 'Graphique 4.',
    correctAnswer: 'A',
    comment: 'Ce site touristique attire le plus de visiteurs en été, avec un pic en juin et juillet, typique des destinations balnéaires.',
    explanation: 'Le Graphique 1 montre une montée progressive jusqu\'en juin (420) et juillet (390) puis un déclin.',
  }));

  // Q23-32: Documents administratifs et professionnels
  const doc1Title = 'Programme d\'intégration des nouvelles recrues — Cabinet comptable';
  const doc1Text = `CABINET MARCHAND & ASSOCIÉS\nPROGRAMME D\'INTÉGRATION RECRUES\n\nVotre arrivée dans notre cabinet est organisée en quatre étapes :\n\nÉtape 1 (Jour 1) : Remise du matériel professionnel (ordinateur, téléphone, badge). Rencontre avec l\'ensemble de l\'équipe lors d\'un déjeuner convivial.\n\nÉtape 2 (Jours 2-5) : Immersion dans les dossiers clients en binôme avec un collaborateur senior. Formation aux logiciels comptables internes.\n\nÉtape 3 (Semaines 2-4) : Prise en charge progressive de dossiers sous supervision. Réunion de suivi chaque vendredi.\n\nÉtape 4 (Fin du 1er mois) : Premier entretien de suivi avec votre responsable. Définition des objectifs des 3 prochains mois.\n\nToute question peut être adressée à votre mentor désigné ou à la direction.`;

  questions.push(q(23, 'Q23-32', null, {
    taskTitle: doc1Title,
    longText: doc1Text,
    question: 'Que se passe-t-il lors de l\'étape 1 du programme d\'intégration ?',
    optionA: 'Formation aux logiciels.',
    optionB: 'Remise du matériel et rencontre de l\'équipe.',
    optionC: 'Premier entretien de suivi.',
    optionD: 'Prise en charge de dossiers.',
    correctAnswer: 'B',
    explanation: 'L\'étape 1 comprend la "Remise du matériel" et la "Rencontre avec l\'ensemble de l\'équipe lors d\'un déjeuner".',
  }));

  questions.push(q(24, 'Q23-32', null, {
    taskTitle: doc1Title,
    longText: doc1Text,
    question: 'Quand a lieu le premier entretien de suivi avec le responsable ?',
    optionA: 'Le premier jour.',
    optionB: 'À la fin de la première semaine.',
    optionC: 'À la fin du premier mois.',
    optionD: 'Au bout de trois mois.',
    correctAnswer: 'C',
    explanation: 'L\'étape 4 précise "Fin du 1er mois : Premier entretien de suivi avec votre responsable".',
  }));

  const doc2Title = 'Note de service — Réorganisation des équipes';
  const doc2Text = `NOTE DE SERVICE\nDate : 3 février 2026\nÀ : Tous les salariés\nDe : Direction Générale\nObjet : Réorganisation des équipes commerciales\n\nAfin de renforcer notre présence sur le marché régional, nous procédons à une réorganisation de nos équipes commerciales à compter du 1er mars 2026.\n\nPrincipaux changements :\n• Création d\'une nouvelle équipe "Grands Comptes" dédiée aux clients générant plus de 500 000€ de CA annuel\n• L\'équipe Nord-Ouest intégrera désormais les départements bretons précédemment rattachés à l\'équipe Ouest\n• Le poste de Directeur Commercial Régional sera supprimé ; ses attributions seront réparties entre les chefs d\'équipe\n\nDes réunions d\'information par équipe seront organisées dans la semaine du 10 février pour répondre à vos questions.\n\nNous comptons sur votre engagement dans cette transition.\nLa Direction`;

  questions.push(q(25, 'Q23-32', null, {
    taskTitle: doc2Title,
    longText: doc2Text,
    question: 'Quel poste est supprimé dans le cadre de la réorganisation ?',
    optionA: 'Chef d\'équipe Nord-Ouest.',
    optionB: 'Responsable Grands Comptes.',
    optionC: 'Directeur Commercial Régional.',
    optionD: 'Directeur Général.',
    correctAnswer: 'C',
    explanation: 'La note précise "Le poste de Directeur Commercial Régional sera supprimé".',
  }));

  questions.push(q(26, 'Q23-32', null, {
    taskTitle: doc2Title,
    longText: doc2Text,
    question: 'À partir de quelle date la réorganisation prend-elle effet ?',
    optionA: 'Le 3 février 2026.',
    optionB: 'Le 10 février 2026.',
    optionC: 'Le 1er janvier 2026.',
    optionD: 'Le 1er mars 2026.',
    correctAnswer: 'D',
    explanation: 'La note précise "à compter du 1er mars 2026".',
  }));

  const doc3Title = 'Règlement intérieur — Club de sport en entreprise';
  const doc3Text = `RÈGLEMENT INTÉRIEUR\nCLUB DE SPORT DE L\'ENTREPRISE VEOLIA\n\nArt. 1 — Adhésion\nTout salarié peut adhérer au club sportif de l\'entreprise. La cotisation annuelle est de 50€. Les membres de la famille directe (conjoint, enfants mineurs) bénéficient d\'un tarif réduit de 30€.\n\nArt. 2 — Activités proposées\nTennis, badminton, football, yoga, course à pied, natation. Le programme des activités est actualisé chaque trimestre.\n\nArt. 3 — Réservation\nLes installations sportives doivent être réservées via l\'application interne "MyClub" au moins 24 heures à l\'avance. Les réservations non honorées sans annulation préalable entraînent un avertissement.\n\nArt. 4 — Tenue\nLe port de chaussures de sport adaptées est obligatoire dans toutes les installations. Les tenues de ville sont interdites dans les salles.\n\nArt. 5 — Responsabilité\nLe club décline toute responsabilité en cas d\'accident survenant en dehors des activités encadrées.`;

  questions.push(q(27, 'Q23-32', null, {
    taskTitle: doc3Title,
    longText: doc3Text,
    question: 'Quel est le montant de la cotisation annuelle standard pour un salarié ?',
    optionA: '30€.',
    optionB: '80€.',
    optionC: '50€.',
    optionD: '100€.',
    correctAnswer: 'C',
    explanation: 'Le règlement précise "La cotisation annuelle est de 50€".',
  }));

  questions.push(q(28, 'Q23-32', null, {
    taskTitle: doc3Title,
    longText: doc3Text,
    question: 'Combien de temps à l\'avance faut-il réserver les installations sportives ?',
    optionA: '48 heures.',
    optionB: '24 heures.',
    optionC: '72 heures.',
    optionD: 'Une semaine.',
    correctAnswer: 'B',
    explanation: 'L\'article 3 précise "au moins 24 heures à l\'avance".',
  }));

  const doc4Title = 'Charte éthique des achats';
  const doc4Text = `CHARTE ÉTHIQUE DES ACHATS\nSOCIÉTÉ BOUYGUES\n\nNous nous engageons à adopter une politique d\'achats responsable fondée sur les principes suivants :\n\n1. Transparence : Tous nos appels d\'offres sont ouverts à la concurrence sur une base équitable. Aucun fournisseur ne bénéfice de conditions préférentielles non justifiées.\n\n2. Responsabilité sociale : Nous privilégions les fournisseurs qui respectent les droits fondamentaux des travailleurs, notamment l\'interdiction du travail des enfants et des conditions de travail décentes.\n\n3. Environnement : Nous intégrons des critères environnementaux dans l\'évaluation de nos fournisseurs (empreinte carbone, gestion des déchets, certification ISO 14001).\n\n4. Anti-corruption : Tout acheteur doit signaler sans délai toute tentative de corruption ou de conflit d\'intérêts à la Direction Juridique.\n\n5. Confidentialité : Les informations transmises par les fournisseurs dans le cadre des appels d\'offres sont strictement confidentielles.`;

  questions.push(q(29, 'Q23-32', null, {
    taskTitle: doc4Title,
    longText: doc4Text,
    question: 'Quel critère est mentionné dans l\'évaluation environnementale des fournisseurs ?',
    optionA: 'Le chiffre d\'affaires.',
    optionB: 'Le nombre d\'employés.',
    optionC: 'L\'empreinte carbone.',
    optionD: 'Le pays d\'origine.',
    correctAnswer: 'C',
    explanation: 'La charte mentionne comme critère environnemental "l\'empreinte carbone, gestion des déchets, certification ISO 14001".',
  }));

  questions.push(q(30, 'Q23-32', null, {
    taskTitle: doc4Title,
    longText: doc4Text,
    question: 'À qui l\'acheteur doit-il signaler une tentative de corruption ?',
    optionA: 'Au responsable des ressources humaines.',
    optionB: 'À la Direction Juridique.',
    optionC: 'Au directeur commercial.',
    optionD: 'Aux autorités policières.',
    correctAnswer: 'B',
    explanation: 'La charte précise de signaler "à la Direction Juridique" toute tentative de corruption.',
  }));

  const doc5Title = 'Convention de stage';
  const doc5Text = `CONVENTION DE STAGE\nEntre : L\'établissement d\'enseignement (École de Commerce de Lyon)\nEt : L\'entreprise d\'accueil (Société Prisma Éditions)\n\nArticle 1 — Objet\nLa présente convention a pour objet de définir les conditions dans lesquelles Mme Lucie Benoît, étudiante en Master 1 Marketing, effectuera un stage de 6 mois au sein de la Société Prisma Éditions.\n\nArticle 2 — Durée\nLe stage débutera le 1er avril 2026 et prendra fin le 30 septembre 2026.\n\nArticle 3 — Gratification\nLa stagiaire percevra une gratification mensuelle de 650€, conformément à la réglementation en vigueur.\n\nArticle 4 — Encadrement\nUn maître de stage, M. François Dupont, sera désigné pour accompagner la stagiaire tout au long de sa mission.\n\nArticle 5 — Confidentialité\nLa stagiaire s\'engage à respecter la confidentialité des informations auxquelles elle a accès pendant et après le stage.`;

  questions.push(q(31, 'Q23-32', null, {
    taskTitle: doc5Title,
    longText: doc5Text,
    question: 'Quelle est la durée du stage mentionné dans la convention ?',
    optionA: 'Trois mois.',
    optionB: 'Un an.',
    optionC: 'Quatre mois.',
    optionD: 'Six mois.',
    correctAnswer: 'D',
    explanation: 'La convention précise un "stage de 6 mois" (du 1er avril au 30 septembre 2026).',
  }));

  questions.push(q(32, 'Q23-32', null, {
    taskTitle: doc5Title,
    longText: doc5Text,
    question: 'Quel est le montant mensuel de la gratification de la stagiaire ?',
    optionA: '500€.',
    optionB: '750€.',
    optionC: '650€.',
    optionD: '800€.',
    correctAnswer: 'C',
    explanation: 'L\'article 3 précise "une gratification mensuelle de 650€".',
  }));

  // Q33-40: Articles de presse
  const article1Title = 'L\'IA dans la création artistique : révolution ou menace pour les créateurs ?';
  const article1Text = `L\'intelligence artificielle générative bouleverse les secteurs de la création. Des systèmes comme DALL-E, Midjourney ou Sora peuvent produire en quelques secondes des images, des textes ou des vidéos d\'une qualité autrefois réservée aux professionnels. Pour beaucoup, c\'est une révolution qui démocratise la création. Pour d\'autres, c\'est une menace existentielle pour les métiers artistiques.\n\nEn France, des milliers d\'illustrateurs, de graphistes et de photographes s\'inquiètent de voir leur travail reproduit sans consentement pour entraîner ces modèles. Des procès ont été intentés aux États-Unis par des artistes contre des entreprises d\'IA, avec des résultats encore mitigés. Le droit d\'auteur, conçu pour un monde pré-numérique, peine à s\'adapter.\n\nParallèlement, certains créateurs voient dans l\'IA un outil puissant qui, bien maîtrisé, peut amplifier leur créativité plutôt que la remplacer. Des agences de publicité utilisent déjà l\'IA pour générer des variations rapides de concepts, laissant aux humains la direction artistique et le sens critique. La question n\'est peut-être pas "l\'IA remplacera-t-elle les artistes ?" mais "comment les artistes s\'approprieront-ils l\'IA ?"`;

  questions.push(q(33, 'Q33-40', null, {
    taskTitle: article1Title,
    longText: article1Text,
    question: 'Quel problème juridique est mentionné concernant l\'IA et la création artistique ?',
    optionA: 'Les brevets sur les logiciels d\'IA.',
    optionB: 'L\'inadaptation du droit d\'auteur au monde numérique.',
    optionC: 'La taxation des entreprises d\'IA.',
    optionD: 'L\'absence de loi sur la cybercriminalité.',
    correctAnswer: 'B',
    explanation: 'L\'article indique que "le droit d\'auteur, conçu pour un monde pré-numérique, peine à s\'adapter".',
  }));

  questions.push(q(34, 'Q33-40', null, {
    taskTitle: article1Title,
    longText: article1Text,
    question: 'Comment certaines agences de publicité utilisent-elles l\'IA selon l\'article ?',
    optionA: 'Pour remplacer totalement leurs équipes créatives.',
    optionB: 'Pour générer des variations rapides de concepts.',
    optionC: 'Pour réduire leurs budgets de communication.',
    optionD: 'Pour gérer leurs campagnes sur les réseaux sociaux.',
    correctAnswer: 'B',
    explanation: 'L\'article précise que ces agences "utilisent l\'IA pour générer des variations rapides de concepts".',
  }));

  const article2Title = 'La dette publique française : comprendre les enjeux d\'un débat complexe';
  const article2Text = `La dette publique française a franchi la barre des 3 000 milliards d\'euros en 2024, représentant environ 112 % du PIB. Ce chiffre alarmant nourrit des débats intenses entre économistes et politiques. D\'un côté, des voix libérales appellent à une réduction drastique des dépenses publiques pour restaurer la confiance des marchés financiers. De l\'autre, des économistes keynésiens soutiennent qu\'une austérité excessive freinerait la croissance et aggraverait à terme le ratio dette/PIB.\n\nLa France paie désormais plus de 50 milliards d\'euros par an en intérêts sur sa dette, un montant comparable au budget de l\'Éducation nationale. Cette charge financière limite la marge de manœuvre du gouvernement pour investir dans les infrastructures, la transition écologique ou l\'innovation.\n\nLes agences de notation surveillent de près la trajectoire budgétaire française. En 2023, Fitch a dégradé la note de la France d\'un cran, signal d\'une inquiétude croissante. Toutefois, la Banque Centrale Européenne et le mécanisme de stabilité européen constituent des filets de sécurité qui distinguent la situation française de celles de pays comme la Grèce ou l\'Argentine.`;

  questions.push(q(35, 'Q33-40', null, {
    taskTitle: article2Title,
    longText: article2Text,
    question: 'À combien s\'élevaient les intérêts annuels de la dette française selon l\'article ?',
    optionA: 'Plus de 100 milliards d\'euros.',
    optionB: 'Plus de 50 milliards d\'euros.',
    optionC: 'Moins de 20 milliards d\'euros.',
    optionD: 'Environ 30 milliards d\'euros.',
    correctAnswer: 'B',
    explanation: 'L\'article précise "La France paie désormais plus de 50 milliards d\'euros par an en intérêts".',
  }));

  questions.push(q(36, 'Q33-40', null, {
    taskTitle: article2Title,
    longText: article2Text,
    question: 'Quelle mesure une agence de notation a-t-elle prise vis-à-vis de la France en 2023 ?',
    optionA: 'S\'P a amélioré la note de la France.',
    optionB: 'Moody\'s a maintenu la note de la France.',
    optionC: 'Fitch a dégradé la note de la France d\'un cran.',
    optionD: 'Fitch a suspendu la note de la France.',
    correctAnswer: 'C',
    explanation: 'L\'article mentionne "En 2023, Fitch a dégradé la note de la France d\'un cran".',
  }));

  const article3Title = 'Les smart cities : vers des villes intelligentes et durables';
  const article3Text = `Les "villes intelligentes" ou smart cities intègrent les technologies numériques dans la gestion urbaine pour améliorer la qualité de vie des habitants, optimiser les ressources et réduire l\'empreinte écologique. Des capteurs connectés mesurent en temps réel la qualité de l\'air, la circulation, la consommation d\'eau et d\'énergie. Ces données permettent une gestion proactive des ressources urbaines.\n\nSingapour, Barcelone et Amsterdam figurent parmi les pionnières de ce mouvement. En France, des villes comme Dijon ou Angers expérimentent des systèmes de gestion centralisée qui pilotent l\'éclairage public, les feux de circulation et les transports en commun depuis une salle de contrôle unique.\n\nToutefois, le modèle n\'est pas sans critiques. Les données collectées soulèvent des questions de vie privée et de surveillance. Qui contrôle ces systèmes ? Qui en a accès ? Des voix s\'élèvent pour demander une gouvernance citoyenne de ces outils, afin que la technologie serve réellement l\'intérêt public et non les intérêts privés des entreprises technologiques qui les fournissent.`;

  questions.push(q(37, 'Q33-40', null, {
    taskTitle: article3Title,
    longText: article3Text,
    question: 'Quelles villes françaises sont citées comme expérimentant des systèmes de gestion intelligente ?',
    optionA: 'Paris et Lyon.',
    optionB: 'Dijon et Angers.',
    optionC: 'Bordeaux et Nantes.',
    optionD: 'Marseille et Toulouse.',
    correctAnswer: 'B',
    explanation: 'L\'article cite "des villes comme Dijon ou Angers" qui expérimentent la gestion centralisée.',
  }));

  questions.push(q(38, 'Q33-40', null, {
    taskTitle: article3Title,
    longText: article3Text,
    question: 'Quelle préoccupation est soulevée par les critiques des smart cities ?',
    optionA: 'Le coût élevé des technologies.',
    optionB: 'Le manque de données disponibles.',
    optionC: 'La vie privée et la surveillance.',
    optionD: 'L\'inefficacité des systèmes.',
    correctAnswer: 'C',
    explanation: 'L\'article mentionne que "les données collectées soulèvent des questions de vie privée et de surveillance".',
  }));

  const article4Title = 'Le métavers : entre désillusion et nouvelles opportunités';
  const article4Text = `Il y a trois ans, le métavers était présenté comme la prochaine révolution d\'internet. Meta (anciennement Facebook) y a investi plus de 40 milliards de dollars, rebaptisant son entreprise pour symboliser ce pivot stratégique. Pourtant, la réalité d\'aujourd\'hui est loin des ambitions initiales. Les mondes virtuels peinent à attirer les utilisateurs au-delà de quelques millions, bien loin des milliards espérés.\n\nLes freins sont nombreux : le matériel (casques de réalité virtuelle) reste coûteux et peu pratique pour un usage quotidien, les expériences proposées manquent encore de contenu suffisamment attrayant, et la nausée virtuelle affecte encore certains utilisateurs.\n\nPourtant, le concept ne disparaît pas. Dans l\'industrie, des applications concrètes émergent : formation de chirurgiens, simulation d\'architecte, visites virtuelles immobilières, entraînement militaire. Ces usages professionnels, moins spectaculaires mais pragmatiques, pourraient constituer le véritable avenir du métavers, loin des fantasmes grand public initiaux.`;

  questions.push(q(39, 'Q33-40', null, {
    taskTitle: article4Title,
    longText: article4Text,
    question: 'Combien Meta a-t-il investi dans le développement du métavers selon l\'article ?',
    optionA: 'Plus de 100 milliards de dollars.',
    optionB: 'Environ 10 milliards de dollars.',
    optionC: 'Plus de 40 milliards de dollars.',
    optionD: 'Moins de 5 milliards de dollars.',
    correctAnswer: 'C',
    explanation: 'L\'article précise que Meta "y a investi plus de 40 milliards de dollars".',
  }));

  questions.push(q(40, 'Q33-40', null, {
    taskTitle: article4Title,
    longText: article4Text,
    question: 'Dans quel secteur le métavers trouve-t-il des applications concrètes selon l\'article ?',
    optionA: 'Le tourisme de masse.',
    optionB: 'Les jeux vidéo grand public.',
    optionC: 'La formation professionnelle et l\'industrie.',
    optionD: 'Le commerce de détail.',
    correctAnswer: 'C',
    explanation: 'L\'article cite "formation de chirurgiens, simulation d\'architecte, visites virtuelles immobilières, entraînement militaire" comme applications concrètes.',
  }));

  return questions;
}

async function main() {
  const connectionString = (process.env.DATABASE_URL || '')
    .replace('sslmode=require', 'sslmode=no-verify')
    .replace(':6543/', ':5432/');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.question.deleteMany({ where: { seriesId: SERIES_ID } });
    const questions = buildQuestions();
    for (const data of questions) {
      await prisma.question.create({ data });
    }
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
