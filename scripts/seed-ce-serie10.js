'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyofag00060wxlx614h94p';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', values: [60, 58, 62, 60], color: '#E30613' },
    { label: 'Graphique 2', values: [55, 55, 58, 90], color: '#003087' },
    { label: 'Graphique 3', values: [85, 70, 55, 40], color: '#E30613' },
    { label: 'Graphique 4', values: [40, 88, 48, 45], color: '#E30613' },
  ];

  const W = 800, H = 420, cols = 4, rows = 1;
  const gW = W / cols, gH = H / rows;
  const pad = 30, barW = 22;
  const labels = ['T1', 'T2', 'T3', 'T4'];

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>`;

  graphs.forEach((g, gi) => {
    const col = gi % cols;
    const row = Math.floor(gi / cols);
    const ox = col * gW;
    const oy = row * gH;
    const chartW = gW - pad * 2;
    const chartH = gH - pad * 2 - 30;
    const maxVal = 100;

    svgContent += `\n  <text x="${ox + gW / 2}" y="${oy + 16}" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#333">${g.label}</text>`;

    g.values.forEach((v, i) => {
      const bh = (v / maxVal) * chartH;
      const bx = ox + pad + i * (barW + 8);
      const by = oy + pad + 20 + (chartH - bh);
      svgContent += `\n  <rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="2"/>`;
      svgContent += `\n  <text x="${bx + barW / 2}" y="${by - 3}" text-anchor="middle" font-size="9" font-family="Arial" fill="#333">${v}</text>`;
      svgContent += `\n  <text x="${bx + barW / 2}" y="${oy + pad + 20 + chartH + 12}" text-anchor="middle" font-size="9" font-family="Arial" fill="#555">${labels[i]}</text>`;
    });

    svgContent += `\n  <line x1="${ox + pad - 4}" y1="${oy + pad + 20}" x2="${ox + pad - 4}" y2="${oy + pad + 20 + chartH}" stroke="#999" stroke-width="1"/>`;
    svgContent += `\n  <line x1="${ox + pad - 4}" y1="${oy + pad + 20 + chartH}" x2="${ox + pad + 4 * (barW + 8) + 4}" y2="${oy + pad + 20 + chartH}" stroke="#999" stroke-width="1"/>`;
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
    taskTitle: 'Panneau d\'information en gare',
    longText: 'GARE CENTRALE — SERVICE GRANDES LIGNES\nDépart Paris-Lyon : 14h32 — Voie 7 — Retard prévu : 15 min\nDépart Paris-Marseille : 15h00 — Voie 12 — À l\'heure\nDépart Paris-Bordeaux : 15h45 — Voie 3 — Supprimé\nDépart Paris-Lille : 16h10 — Voie 9 — À l\'heure\nInformation voyageurs : Le train Paris-Bordeaux est supprimé en raison d\'une grève locale. Les voyageurs peuvent se reporter sur le train du lendemain ou demander le remboursement intégral de leur billet en guichet.',
    question: 'Que s\'est-il passé avec le train Paris-Bordeaux ?',
    optionA: 'Il a du retard.',
    optionB: 'Il est parti de la voie 3.',
    optionC: 'Il a été supprimé.',
    optionD: 'Il est à l\'heure.',
    correctAnswer: 'C',
    explanation: 'Le panneau indique clairement "Supprimé" pour le train Paris-Bordeaux.',
  }));

  questions.push(q(2, 'Q1-7', null, {
    taskTitle: 'Affiche dans une pharmacie',
    longText: 'PHARMACIE DES FLEURS\nHoraires d\'ouverture :\nLundi – Vendredi : 8h30 – 19h30\nSamedi : 9h00 – 18h00\nDimanche et jours fériés : FERMÉ\nPharmacien de garde les dimanches et jours fériés : Pharmacie du Centre, 12 rue de la République — Tél. 04 72 11 22 33\nNous proposons : Ordonnances, vaccinations, analyses rapides, location matériel médical, conseils nutritionnels.',
    question: 'Que se passe-t-il le dimanche à la Pharmacie des Fleurs ?',
    optionA: 'Elle ouvre à 9h00.',
    optionB: 'Elle est fermée.',
    optionC: 'Elle ferme à 18h00.',
    optionD: 'Elle propose des vaccinations uniquement.',
    correctAnswer: 'B',
    explanation: 'L\'affiche précise "Dimanche et jours fériés : FERMÉ".',
  }));

  questions.push(q(3, 'Q1-7', null, {
    taskTitle: 'Courriel de convocation',
    longText: 'De : rh@entreprisedelta.fr\nÀ : marc.fontaine@email.fr\nObjet : Convocation entretien annuel\n\nMonsieur Fontaine,\n\nNous vous convoquons à votre entretien annuel d\'évaluation le mardi 15 mars à 10h00 dans la salle Confiance (bâtiment B, 2e étage).\n\nMerci de vous munir de votre bilan de l\'année écoulée et de vos objectifs pour l\'année à venir. L\'entretien durera environ 45 minutes.\n\nEn cas d\'indisponibilité, contactez-nous au plus tard 48h avant pour convenir d\'une autre date.\n\nCordialement,\nService Ressources Humaines',
    question: 'Que doit apporter Marc Fontaine à cet entretien ?',
    optionA: 'Son contrat de travail.',
    optionB: 'Sa demande de congé.',
    optionC: 'Son bilan annuel et ses objectifs.',
    optionD: 'Sa carte d\'identité.',
    correctAnswer: 'C',
    explanation: 'Le courriel précise "Merci de vous munir de votre bilan de l\'année écoulée et de vos objectifs pour l\'année à venir."',
  }));

  questions.push(q(4, 'Q1-7', null, {
    taskTitle: 'Affiche de concert',
    longText: 'GRAND THÉÂTRE DE LYON\nPRÉSENTE\n🎵 NUIT DE L\'OPÉRA 🎵\nVendredi 22 avril — 20h30\nOuverture des portes : 19h45\nProgramme : Extraits de La Traviata, Carmen, Don Giovanni\nOrchestre Philharmonique du Rhône\nChef d\'orchestre : Miguel Santos\nTarifs : Catégorie A : 75€ | Catégorie B : 50€ | Catégorie C : 30€\nRéservations : www.grandtheatre-lyon.fr ou billetterie sur place\nRemarque : Les retardataires ne seront admis qu\'à l\'entracte.',
    question: 'Que se passera-t-il pour les personnes arrivant en retard ?',
    optionA: 'Elles ne pourront pas entrer.',
    optionB: 'Elles seront admises à l\'entracte seulement.',
    optionC: 'Elles paieront un supplément.',
    optionD: 'Elles seront placées en catégorie C.',
    correctAnswer: 'B',
    explanation: 'L\'affiche indique "Les retardataires ne seront admis qu\'à l\'entracte."',
  }));

  questions.push(q(5, 'Q1-7', null, {
    taskTitle: 'Avis de la copropriété',
    longText: 'SYNDIC IMMOBILIER LÉVÊQUE\nAVIS AUX RÉSIDENTS — IMMEUBLE LES ÉRABLES\n\nTravaux de rénovation des parties communes\n\nNous vous informons que des travaux de peinture et de pose de revêtement de sol auront lieu dans les couloirs et l\'entrée de l\'immeuble du lundi 4 au vendredi 8 avril inclus.\n\nDurant cette période :\n• L\'ascenseur sera hors service\n• Le hall sera accessible uniquement par l\'entrée latérale (rue des Acacias)\n• Les livraisons volumineuses sont déconseillées\n\nNous vous remercions de votre compréhension.\nLe Syndic',
    question: 'Qu\'est-ce qui sera hors service pendant les travaux ?',
    optionA: 'Le parking.',
    optionB: 'L\'entrée principale.',
    optionC: 'L\'ascenseur.',
    optionD: 'La boîte aux lettres.',
    correctAnswer: 'C',
    explanation: 'L\'avis précise "L\'ascenseur sera hors service" pendant les travaux.',
  }));

  questions.push(q(6, 'Q1-7', null, {
    taskTitle: 'Message vocal retranscrit',
    longText: '"Bonjour, ici le cabinet dentaire Beaumont. Nous vous appelons pour vous rappeler que vous avez un rendez-vous le jeudi 7 avril à 14h15 avec le Dr Leroux. Merci de confirmer votre présence en rappelant le 04 91 55 66 77 avant le mercredi 6 avril à midi. En cas d\'annulation, merci de prévenir 24 heures à l\'avance afin que nous puissions proposer ce créneau à un autre patient. Bonne journée."',
    question: 'Avant quand le patient doit-il confirmer son rendez-vous ?',
    optionA: 'Le jeudi 7 avril à 14h15.',
    optionB: 'Le mercredi 6 avril à midi.',
    optionC: 'Le vendredi 8 avril.',
    optionD: 'Le lundi 4 avril.',
    correctAnswer: 'B',
    explanation: 'Le message précise de rappeler "avant le mercredi 6 avril à midi".',
  }));

  questions.push(q(7, 'Q1-7', null, {
    taskTitle: 'Règlement intérieur d\'une bibliothèque universitaire',
    longText: 'BIBLIOTHÈQUE UNIVERSITAIRE SAINT-EXUPÉRY\nRÈGLEMENT INTÉRIEUR\n\nAccès : Ouvert aux étudiants, enseignants et personnels de l\'université sur présentation de la carte universitaire. Les personnes extérieures peuvent accéder à la bibliothèque en s\'enregistrant à l\'accueil.\n\nEmprunts : 5 ouvrages maximum pour 3 semaines. Renouvellement en ligne ou à l\'accueil possible une fois.\n\nConduite : Silence obligatoire dans toutes les salles. Les communications téléphoniques sont interdites. Les boissons sont autorisées uniquement si elles sont dans des contenants hermétiques.\n\nSanctions : Tout retard de retour entraîne une suspension d\'emprunt d\'une semaine par ouvrage en retard.',
    question: 'Combien de livres un étudiant peut-il emprunter au maximum ?',
    optionA: 'Trois.',
    optionB: 'Dix.',
    optionC: 'Cinq.',
    optionD: 'Deux.',
    correctAnswer: 'C',
    explanation: 'Le règlement précise "5 ouvrages maximum pour 3 semaines".',
  }));

  // Q8-13: Phrases lacunaires
  const phrasesLacunairesQ8to13 = [
    {
      q: 'Le directeur a décidé de ______ une réunion extraordinaire pour aborder la crise financière.',
      a: 'démissionner', b: 'convoquer', c: 'éviter', d: 'reporter',
      correct: 'B',
      exp: '"Convoquer une réunion" signifie l\'organiser et y inviter les participants.',
    },
    {
      q: 'Pour ______ à cet appel d\'offres, les entreprises doivent fournir un dossier complet avant le 30 mars.',
      a: 'répondre', b: 'refuser', c: 'rédiger', d: 'ignorer',
      correct: 'A',
      exp: '"Répondre à un appel d\'offres" est l\'expression correcte pour participer à une procédure d\'appel d\'offres.',
    },
    {
      q: 'Le projet a été ______ en raison du manque de financements disponibles cette année.',
      a: 'lancé', b: 'évalué', c: 'suspendu', d: 'approuvé',
      correct: 'C',
      exp: '"Suspendu" signifie mis en pause ou arrêté temporairement.',
    },
    {
      q: 'La mairie ______ les habitants à participer à la consultation publique sur le plan d\'urbanisme.',
      a: 'interdit', b: 'dissuade', c: 'invite', d: 'empêche',
      correct: 'C',
      exp: '"Inviter les habitants à participer" est l\'expression appropriée pour une consultation publique.',
    },
    {
      q: 'Les salariés bénéficient d\'une ______ de transport prise en charge à 50 % par l\'employeur.',
      a: 'amende', b: 'prime', c: 'dette', d: 'pénalité',
      correct: 'B',
      exp: '"Prime de transport" est le terme correct pour désigner l\'aide au transport versée par l\'employeur.',
    },
    {
      q: 'Afin de ______ les délais, l\'équipe a travaillé en heures supplémentaires toute la semaine.',
      a: 'allonger', b: 'respecter', c: 'ignorer', d: 'dépasser',
      correct: 'B',
      exp: '"Respecter les délais" signifie honorer les échéances fixées.',
    },
  ];

  phrasesLacunairesQ8to13.forEach((item, i) => {
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

  // Q14-17: Textes lacunaires (2 textes × 2 questions)
  const texte1 = `La formation professionnelle continue est aujourd\'hui un enjeu majeur pour les entreprises. Elle permet aux salariés de [14] leurs compétences et de s\'adapter aux évolutions du marché. Les employeurs ont l\'obligation légale de [15] à leurs salariés un accès à la formation. Pour financer ces dispositifs, les entreprises versent une contribution obligatoire à un organisme collecteur. Les salariés peuvent également utiliser leur Compte Personnel de Formation (CPF) pour suivre des formations de leur choix, sous réserve que celles-ci soient [16] par France Compétences. En cas de refus d\'une demande de formation par l\'employeur, le salarié peut saisir le Conseil de Prud\'hommes si ce refus est jugé [17].`;

  questions.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur la formation professionnelle',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'perdre', optionB: 'développer', optionC: 'oublier', optionD: 'éviter',
    correctAnswer: 'B',
    explanation: 'On "développe" ses compétences grâce à la formation professionnelle.',
  }));

  questions.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur la formation professionnelle',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'refuser', optionB: 'interdire', optionC: 'garantir', optionD: 'limiter',
    correctAnswer: 'C',
    explanation: 'Les employeurs ont l\'obligation de "garantir" l\'accès à la formation.',
  }));

  questions.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur la formation professionnelle',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'rejetées', optionB: 'éligibles', optionC: 'interdites', optionD: 'ignorées',
    correctAnswer: 'B',
    explanation: 'Les formations doivent être "éligibles" (reconnues) par France Compétences.',
  }));

  questions.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte sur la formation professionnelle',
    longText: texte1,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'justifié', optionB: 'compréhensible', optionC: 'abusif', optionD: 'légal',
    correctAnswer: 'C',
    explanation: 'Un refus "abusif" est injustifié et peut être contesté devant les Prud\'hommes.',
  }));

  // Q18-21: Tableaux comparatifs
  const hotelsLongText = JSON.stringify([
    {
      title: 'Hôtel Le Panorama ★★★',
      content: 'Chambre double : 89€/nuit. Petit-déjeuner inclus. Parking gratuit. Wi-Fi inclus. Piscine extérieure (saison estivale). Navette centre-ville : 8€/pers. Pas de navette aéroport.',
    },
    {
      title: 'Hôtel des Voyageurs ★★★',
      content: 'Chambre double : 75€/nuit. Petit-déjeuner : 12€/pers. Parking : 15€/nuit. Wi-Fi inclus. Navette aéroport gratuite (réservation requise). Restaurant sur place.',
    },
    {
      title: 'Résidence Bellevue ★★',
      content: 'Appartement studio : 65€/nuit. Cuisine équipée. Linge de maison fourni. Wi-Fi inclus. Parking : 10€/nuit. Pas de navette. Idéal pour séjours longue durée.',
    },
    {
      title: 'Grand Hôtel Central ★★★★',
      content: 'Chambre double : 145€/nuit. Petit-déjeuner buffet inclus. Parking souterrain gratuit. Spa et fitness. Wi-Fi premium. Navette aéroport : 20€/pers. Service de conciergerie.',
    },
  ]);

  questions.push(q(18, 'Q18-21', null, {
    taskTitle: 'Comparatif d\'hôtels',
    longText: hotelsLongText,
    question: 'Quel hôtel propose une navette aéroport gratuite ?',
    optionA: 'Hôtel Le Panorama.',
    optionB: 'Résidence Bellevue.',
    optionC: 'Grand Hôtel Central.',
    optionD: 'Hôtel des Voyageurs.',
    correctAnswer: 'D',
    explanation: 'L\'Hôtel des Voyageurs propose une "navette aéroport gratuite (réservation requise)".',
  }));

  const compagniesLongText = JSON.stringify([
    {
      title: 'AirConnect',
      content: 'Destination : Paris–Dakar. Fréquence : 14 vols par semaine (2/jour). Tarif économique à partir de 320€. Bagages cabine inclus. 1 bagage soute 23 kg inclus. Repas à bord inclus.',
    },
    {
      title: 'SkyLine Airlines',
      content: 'Destination : Paris–Dakar. Fréquence : 7 vols par semaine (1/jour). Tarif économique à partir de 280€. Bagages cabine inclus. Bagage soute en supplément (35€/valise). Repas payants.',
    },
    {
      title: 'TransAtlantique',
      content: 'Destination : Paris–Dakar. Fréquence : 3 vols par semaine. Tarif économique à partir de 410€. Bagages cabine inclus. 2 bagages soute inclus. Service premium inclus.',
    },
    {
      title: 'EuroAfric',
      content: 'Destination : Paris–Dakar. Fréquence : 5 vols par semaine. Tarif économique à partir de 350€. Bagages cabine inclus. 1 bagage soute inclus. Repas végétariens sur demande.',
    },
  ]);

  questions.push(q(19, 'Q18-21', null, {
    taskTitle: 'Comparatif de compagnies aériennes',
    longText: compagniesLongText,
    question: 'Quelle compagnie propose le plus grand nombre de vols par semaine sur Paris-Dakar ?',
    optionA: 'AirConnect.',
    optionB: 'SkyLine Airlines.',
    optionC: 'TransAtlantique.',
    optionD: 'EuroAfric.',
    correctAnswer: 'A',
    explanation: 'AirConnect propose 14 vols par semaine (2 par jour), ce qui est le maximum parmi les compagnies présentées.',
  }));

  const epargneLongText = JSON.stringify([
    {
      title: 'Plan Épargne Retraite LIBERTÉ',
      content: 'Rendement moyen : 3,2 % /an. Versements libres ou programmés. Sortie en rente viagère uniquement. Avantage fiscal : déduction des versements du revenu imposable. Frais de gestion : 0,6 %/an.',
    },
    {
      title: 'Plan Épargne Retraite HORIZON',
      content: 'Rendement moyen : 2,8 % /an. Versements libres. Sortie en capital possible à tout moment avant la retraite sous conditions. Avantage fiscal identique. Frais de gestion : 0,5 %/an.',
    },
    {
      title: 'Plan Épargne Retraite SÉRÉNITÉ',
      content: 'Rendement moyen : 3,8 % /an. Versements programmés obligatoires (100€/mois min). Sortie mixte capital + rente. Avantage fiscal renforcé. Frais de gestion : 0,8 %/an.',
    },
    {
      title: 'Plan Épargne Retraite ÉQUILIBRE',
      content: 'Rendement moyen : 3,0 % /an. Versements libres ou programmés. Sortie en rente viagère uniquement. Avantage fiscal standard. Frais de gestion : 0,55 %/an. Conseil personnalisé inclus.',
    },
  ]);

  questions.push(q(20, 'Q18-21', null, {
    taskTitle: 'Comparatif de plans épargne retraite',
    longText: epargneLongText,
    question: 'Quel plan épargne retraite permet une sortie en capital avant la retraite ?',
    optionA: 'Plan Épargne Retraite LIBERTÉ.',
    optionB: 'Plan Épargne Retraite HORIZON.',
    optionC: 'Plan Épargne Retraite SÉRÉNITÉ.',
    optionD: 'Plan Épargne Retraite ÉQUILIBRE.',
    correctAnswer: 'B',
    explanation: 'Le plan HORIZON mentionne "Sortie en capital possible à tout moment avant la retraite sous conditions".',
  }));

  const coursLangesLongText = JSON.stringify([
    {
      title: 'LinguaFlex — Anglais en ligne',
      content: 'Niveaux A1 à C2. Cours particuliers via visioconférence. Professeurs natifs. Tarif : 35€/heure. Abonnement mensuel : 150€/mois (5h incluses). Pas d\'accès illimité. Certificat de fin de niveau inclus.',
    },
    {
      title: 'SpeedLingo — Espagnol en ligne',
      content: 'Niveaux débutant à avancé. Cours en groupe (5 pers. max) ou particuliers. Tarif : 20€/heure (groupe), 40€/heure (particulier). Pas d\'engagement mensuel. Accès limité à 10h/mois.',
    },
    {
      title: 'GlobalLearn — Multi-langues',
      content: 'Plus de 20 langues disponibles. Accès illimité sans engagement mensuel. Tarif unique : 29€/mois. Cours enregistrés + sessions en direct hebdomadaires. Application mobile incluse.',
    },
    {
      title: 'ProFrançais — Français des affaires',
      content: 'Destiné aux professionnels. Cours en présentiel ou en ligne. Tarif : 60€/heure. Abonnement trimestriel : 400€. Contenu axé vocabulaire professionnel et communication écrite.',
    },
  ]);

  questions.push(q(21, 'Q18-21', null, {
    taskTitle: 'Comparatif de cours de langue en ligne',
    longText: coursLangesLongText,
    question: 'Quel service de cours de langue propose un accès illimité sans engagement ?',
    optionA: 'LinguaFlex.',
    optionB: 'SpeedLingo.',
    optionC: 'GlobalLearn.',
    optionD: 'ProFrançais.',
    correctAnswer: 'C',
    explanation: 'GlobalLearn propose "Accès illimité sans engagement mensuel" pour 29€/mois.',
  }));

  // Q22: Graphique
  questions.push(q(22, 'Q22', null, {
    taskTitle: 'Évolution trimestrielle des ventes',
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique illustre des ventes stables pendant trois trimestres puis une forte hausse au dernier trimestre ?',
    optionA: 'Graphique 1.',
    optionB: 'Graphique 2.',
    optionC: 'Graphique 3.',
    optionD: 'Graphique 4.',
    correctAnswer: 'B',
    comment: 'Les ventes de cette entreprise restent stables pendant trois trimestres avant de bondir fortement au dernier.',
    explanation: 'Le Graphique 2 montre des valeurs quasi-stables (55, 55, 58) puis un bond à 90 au T4.',
  }));

  // Q23-32: Documents administratifs et professionnels (5 docs × 2 questions)
  const doc1Title = 'Programme d\'intégration des nouvelles recrues';
  const doc1Text = `SOCIÉTÉ DURAND & ASSOCIÉS\nPROGRAMME D\'INTÉGRATION — NOUVELLES RECRUES\n\nBienvenue dans notre entreprise ! Votre intégration se déroulera en trois phases :\n\nPhase 1 — Semaine 1 : Accueil administratif (remise des outils, badges, accès informatique), visite des locaux, présentation des équipes.\n\nPhase 2 — Semaines 2 et 3 : Formation aux outils internes (logiciels, procédures), binôme avec un collègue référent désigné par votre responsable.\n\nPhase 3 — Mois 2 : Prise de poste autonome avec suivi hebdomadaire, entretien de bilan à la fin du 2e mois.\n\nDocuments à fournir impérativement le premier jour : RIB, copie de pièce d\'identité, justificatif de domicile, diplômes originaux.\n\nContact RH : integration@durand-associes.fr`;

  questions.push(q(23, 'Q23-32', null, {
    taskTitle: doc1Title,
    longText: doc1Text,
    question: 'Combien de phases comporte le programme d\'intégration ?',
    optionA: 'Deux.',
    optionB: 'Cinq.',
    optionC: 'Quatre.',
    optionD: 'Trois.',
    correctAnswer: 'D',
    explanation: 'Le programme comporte trois phases : semaine 1, semaines 2-3, et mois 2.',
  }));

  questions.push(q(24, 'Q23-32', null, {
    taskTitle: doc1Title,
    longText: doc1Text,
    question: 'Que se passe-t-il à la fin du deuxième mois d\'intégration ?',
    optionA: 'Le salarié reçoit une augmentation.',
    optionB: 'Le salarié passe un entretien de bilan.',
    optionC: 'Le salarié change de département.',
    optionD: 'Le salarié rencontre le directeur général.',
    correctAnswer: 'B',
    explanation: 'Le document précise "entretien de bilan à la fin du 2e mois".',
  }));

  const doc2Title = 'Note de service — Avancement du projet Omega';
  const doc2Text = `NOTE DE SERVICE\nDate : 14 mars 2026\nDe : Direction de Projet\nÀ : Équipe projet Omega\nObjet : Point d\'avancement — Phase 2\n\nNous souhaitons faire le point sur l\'avancement de la phase 2 du projet Omega, dont la livraison est prévue le 30 avril.\n\nPoints positifs : La conception graphique est finalisée. Le module de paiement a passé les tests avec succès. L\'intégration backend est à 80 % de réalisation.\n\nPoints de vigilance : Des retards ont été constatés sur le module de reporting (3 jours de retard). Deux développeurs sont en arrêt maladie cette semaine.\n\nActions requises :\n• Réaffectation de ressources sur le module de reporting dès lundi\n• Réunion de suivi obligatoire chaque vendredi à 9h00\n• Rapport d\'avancement individuel à envoyer au chef de projet chaque jeudi\n\nMerci de votre engagement.`;

  questions.push(q(25, 'Q23-32', null, {
    taskTitle: doc2Title,
    longText: doc2Text,
    question: 'Quel module a pris du retard dans le projet Omega ?',
    optionA: 'Le module de paiement.',
    optionB: 'L\'intégration backend.',
    optionC: 'Le module de reporting.',
    optionD: 'La conception graphique.',
    correctAnswer: 'C',
    explanation: 'La note mentionne "des retards ont été constatés sur le module de reporting (3 jours de retard)".',
  }));

  questions.push(q(26, 'Q23-32', null, {
    taskTitle: doc2Title,
    longText: doc2Text,
    question: 'À quelle fréquence les réunions de suivi sont-elles organisées ?',
    optionA: 'Tous les jours.',
    optionB: 'Une fois par mois.',
    optionC: 'Deux fois par semaine.',
    optionD: 'Une fois par semaine.',
    correctAnswer: 'D',
    explanation: 'La note précise "Réunion de suivi obligatoire chaque vendredi", soit une fois par semaine.',
  }));

  const doc3Title = 'Règlement intérieur — Stagiaires';
  const doc3Text = `RÈGLEMENT INTÉRIEUR — STAGIAIRES\nSOCIÉTÉ NEXTECH\n\nArt. 1 — Accès aux locaux\nLes stagiaires accèdent aux locaux du lundi au vendredi de 8h00 à 19h00. Tout accès en dehors de ces horaires doit être expressément autorisé par le maître de stage.\n\nArt. 2 — Confidentialité\nLes stagiaires s\'engagent à respecter la confidentialité de toutes les informations auxquelles ils ont accès. Toute divulgation est passible de poursuites.\n\nArt. 3 — Tenue professionnelle\nLe port d\'une tenue professionnelle est requis en toutes circonstances, sauf indication contraire du responsable.\n\nArt. 4 — Matériel informatique\nL\'utilisation du matériel informatique de l\'entreprise est strictement limitée aux tâches professionnelles. L\'installation de logiciels personnels est interdite.\n\nArt. 5 — Absences\nToute absence doit être signalée au maître de stage avant 9h00 le jour même. Un justificatif devra être remis dans les 48h.`;

  questions.push(q(27, 'Q23-32', null, {
    taskTitle: doc3Title,
    longText: doc3Text,
    question: 'Jusqu\'à quelle heure les stagiaires peuvent-ils accéder aux locaux sans autorisation spéciale ?',
    optionA: 'Jusqu\'à 17h00.',
    optionB: 'Jusqu\'à 20h00.',
    optionC: 'Jusqu\'à 19h00.',
    optionD: 'Jusqu\'à 18h00.',
    correctAnswer: 'C',
    explanation: 'Le règlement précise que l\'accès est possible "du lundi au vendredi de 8h00 à 19h00".',
  }));

  questions.push(q(28, 'Q23-32', null, {
    taskTitle: doc3Title,
    longText: doc3Text,
    question: 'Dans quel délai le justificatif d\'absence doit-il être remis ?',
    optionA: 'Dans les 24 heures.',
    optionB: 'Dans les 48 heures.',
    optionC: 'Dans la semaine.',
    optionD: 'Dès le retour.',
    correctAnswer: 'B',
    explanation: 'L\'article 5 précise "Un justificatif devra être remis dans les 48h".',
  }));

  const doc4Title = 'Guide de mobilité interne';
  const doc4Text = `GUIDE DE LA MOBILITÉ INTERNE\nGROUPE MERCATOR\n\nLa mobilité interne est un levier essentiel de développement professionnel au sein de notre groupe. Elle peut prendre deux formes :\n\n1. Mobilité fonctionnelle : changement de poste au sein du même service ou d\'un service différent, sans déménagement géographique.\n\n2. Mobilité géographique : changement de site ou de pays, accompagné d\'une prime de mobilité dont le montant varie selon la distance.\n\nConditions d\'éligibilité :\n• Avoir complété au moins 2 ans dans son poste actuel\n• Avoir reçu une évaluation satisfaisante ou excellente lors du dernier entretien annuel\n• Ne pas être en période d\'essai ou sous mesure disciplinaire\n\nProcédure : Soumettre sa candidature via l\'intranet RH rubrique "Offres internes". Les candidatures sont examinées dans un délai de 3 semaines. Un entretien de motivation sera organisé pour les candidats présélectionnés.`;

  questions.push(q(29, 'Q23-32', null, {
    taskTitle: doc4Title,
    longText: doc4Text,
    question: 'Combien d\'années dans son poste actuel faut-il avoir pour être éligible à la mobilité interne ?',
    optionA: 'Un an.',
    optionB: 'Trois ans.',
    optionC: 'Cinq ans.',
    optionD: 'Deux ans.',
    correctAnswer: 'D',
    explanation: 'Le guide précise "Avoir complété au moins 2 ans dans son poste actuel".',
  }));

  questions.push(q(30, 'Q23-32', null, {
    taskTitle: doc4Title,
    longText: doc4Text,
    question: 'Où le salarié doit-il soumettre sa candidature à un poste en mobilité interne ?',
    optionA: 'Directement à son responsable.',
    optionB: 'Via l\'intranet RH.',
    optionC: 'Par courrier postal.',
    optionD: 'En remplissant un formulaire papier.',
    correctAnswer: 'B',
    explanation: 'La procédure indique de "soumettre sa candidature via l\'intranet RH rubrique Offres internes".',
  }));

  const doc5Title = 'Note de remboursement des frais professionnels';
  const doc5Text = `NOTE INTERNE\nObjet : Procédure de remboursement des frais professionnels\nDate d\'application : 1er janvier 2026\n\nAfin d\'harmoniser les pratiques, la procédure de remboursement des frais professionnels est mise à jour comme suit :\n\nFrais couverts : déplacements professionnels (train, avion, voiture), hébergement, restauration lors de missions, frais de représentation sur présentation de justificatifs.\n\nPlafonds applicables :\n- Repas : 25€ maximum par repas\n- Hébergement : 120€ maximum par nuit (sauf Paris et grandes métropoles : 150€)\n- Kilométrage véhicule personnel : 0,35€/km\n\nDélai de soumission : Les demandes de remboursement doivent être soumises dans un délai de 30 jours suivant la dépense via le logiciel Notilus. Passé ce délai, le remboursement ne sera plus possible.\n\nJustificatifs : Tout remboursement doit être accompagné d\'une facture originale ou d\'un reçu nominatif.`;

  questions.push(q(31, 'Q23-32', null, {
    taskTitle: doc5Title,
    longText: doc5Text,
    question: 'Quel est le plafond de remboursement pour un repas ?',
    optionA: '20€.',
    optionB: '30€.',
    optionC: '15€.',
    optionD: '25€.',
    correctAnswer: 'D',
    explanation: 'La note précise "Repas : 25€ maximum par repas".',
  }));

  questions.push(q(32, 'Q23-32', null, {
    taskTitle: doc5Title,
    longText: doc5Text,
    question: 'Dans quel délai maximum les demandes de remboursement doivent-elles être soumises ?',
    optionA: '15 jours.',
    optionB: '60 jours.',
    optionC: '30 jours.',
    optionD: '45 jours.',
    correctAnswer: 'C',
    explanation: 'La note précise "dans un délai de 30 jours suivant la dépense".',
  }));

  // Q33-40: Articles de presse (4 articles × 2 questions)
  const article1Title = 'Le dopage sportif : un fléau persistant malgré les contrôles renforcés';
  const article1Text = `Malgré les progrès considérables réalisés dans la détection du dopage, ce phénomène reste une réalité préoccupante dans le sport de haut niveau. Les agences antidopage nationales et internationales multiplient les contrôles inopinés et perfectionnent leurs méthodes analytiques, mais les sportifs qui trichent font preuve d\'une ingéniosité constante pour déjouer ces dispositifs.\n\nSelon le dernier rapport de l\'Agence Mondiale Antidopage (AMA), le nombre de violations a légèrement diminué entre 2022 et 2024, mais certaines disciplines restent particulièrement exposées, notamment le cyclisme, l\'haltérophilie et l\'athlétisme. L\'ère de la biologie moléculaire a introduit de nouveaux défis : le dopage génétique, encore difficile à détecter, représente désormais une menace sérieuse.\n\nLes conséquences pour les sportifs pris en faute sont lourdes : suspensions de deux à quatre ans, annulation des résultats, remboursement des primes. Pourtant, la pression des sponsors, les enjeux financiers colossaux et la quête de la gloire poussent certains athlètes à prendre ces risques. Des experts plaident pour une approche davantage centrée sur l\'éducation et la prévention, plutôt que sur la seule répression.`;

  questions.push(q(33, 'Q33-40', null, {
    taskTitle: article1Title,
    longText: article1Text,
    question: 'Quelle nouvelle forme de dopage est évoquée comme difficile à détecter ?',
    optionA: 'Le dopage par transfusion sanguine.',
    optionB: 'Le dopage chimique.',
    optionC: 'Le dopage génétique.',
    optionD: 'Le dopage hormonal.',
    correctAnswer: 'C',
    explanation: 'L\'article mentionne "le dopage génétique, encore difficile à détecter, représente désormais une menace sérieuse".',
  }));

  questions.push(q(34, 'Q33-40', null, {
    taskTitle: article1Title,
    longText: article1Text,
    question: 'Quelle solution est suggérée en plus de la répression pour lutter contre le dopage ?',
    optionA: 'Augmenter les suspensions.',
    optionB: 'Interdire certains sports.',
    optionC: 'Réduire les contrôles.',
    optionD: 'Miser sur l\'éducation et la prévention.',
    correctAnswer: 'D',
    explanation: 'Des experts "plaident pour une approche davantage centrée sur l\'éducation et la prévention".',
  }));

  const article2Title = 'L\'alimentation biologique : un marché en pleine expansion';
  const article2Text = `Le marché des produits biologiques a connu une croissance remarquable ces dernières années. En France, la consommation de produits bio a augmenté de 65 % entre 2015 et 2024, selon les données de l\'Agence Bio. Cette tendance reflète une prise de conscience croissante des consommateurs quant aux enjeux environnementaux et sanitaires liés à l\'alimentation.\n\nCependant, le secteur traverse une période de turbulences. Après l\'euphorie des années 2020-2021 liée à la pandémie, les ventes ont marqué le pas en 2022-2023 en raison de l\'inflation. Certains consommateurs, contraints de faire des arbitrages budgétaires, ont réduit leurs achats bio. Les producteurs, eux, font face à des coûts de production plus élevés et à des marges réduites.\n\nMalgré ces difficultés, les experts restent optimistes à moyen terme. La part des surfaces agricoles certifiées bio en France atteint désormais 14 %, et les nouvelles générations de consommateurs semblent particulièrement attachées aux labels environnementaux. La grande distribution intensifie également ses investissements dans les rayons bio, signe d\'une confiance renouvelée dans la durabilité du secteur.`;

  questions.push(q(35, 'Q33-40', null, {
    taskTitle: article2Title,
    longText: article2Text,
    question: 'Qu\'est-ce qui a freiné les ventes de produits bio en 2022-2023 ?',
    optionA: 'La mauvaise qualité des produits.',
    optionB: 'Un manque de communication.',
    optionC: 'L\'inflation.',
    optionD: 'La réduction des surfaces agricoles.',
    correctAnswer: 'C',
    explanation: 'L\'article cite "l\'inflation" comme facteur ayant amené les consommateurs à réduire leurs achats bio.',
  }));

  questions.push(q(36, 'Q33-40', null, {
    taskTitle: article2Title,
    longText: article2Text,
    question: 'Quel pourcentage des surfaces agricoles françaises est certifié bio selon l\'article ?',
    optionA: '7 %.',
    optionB: '20 %.',
    optionC: '14 %.',
    optionD: '25 %.',
    correctAnswer: 'C',
    explanation: 'L\'article indique "La part des surfaces agricoles certifiées bio en France atteint désormais 14 %".',
  }));

  const article3Title = 'L\'intelligence collective au cœur des organisations modernes';
  const article3Text = `Dans un monde professionnel de plus en plus complexe, les entreprises prennent conscience que les décisions les meilleures ne viennent pas toujours du sommet de la hiérarchie. L\'intelligence collective — cette capacité d\'un groupe à résoudre des problèmes plus efficacement que ne pourrait le faire chaque individu seul — devient un avantage concurrentiel majeur.\n\nDes outils numériques facilitent désormais la cocréation à grande échelle : plateformes de brainstorming collaboratif, logiciels de gestion de projets partagés, espaces de coworking virtuels. Des entreprises comme Michelin ou Renault ont mis en place des "labs d\'innovation ouverte" où salariés, clients et partenaires co-construisent de nouveaux produits.\n\nToutefois, mobiliser l\'intelligence collective ne s\'improvise pas. Cela nécessite une culture d\'entreprise fondée sur la confiance, la transparence et le droit à l\'erreur. Les managers doivent apprendre à faciliter plutôt qu\'à diriger. Des formations spécifiques se développent pour accompagner cette transition, et certaines écoles de management intègrent désormais ces approches dans leur curriculum.`;

  questions.push(q(37, 'Q33-40', null, {
    taskTitle: article3Title,
    longText: article3Text,
    question: 'Quelles entreprises sont citées comme exemples de mise en place de "labs d\'innovation ouverte" ?',
    optionA: 'Apple et Google.',
    optionB: 'Michelin et Renault.',
    optionC: 'Airbus et Total.',
    optionD: 'LVMH et Hermès.',
    correctAnswer: 'B',
    explanation: 'L\'article cite "des entreprises comme Michelin ou Renault" qui ont mis en place ces labs.',
  }));

  questions.push(q(38, 'Q33-40', null, {
    taskTitle: article3Title,
    longText: article3Text,
    question: 'Quel changement de rôle est attendu des managers pour favoriser l\'intelligence collective ?',
    optionA: 'Prendre davantage de décisions seuls.',
    optionB: 'Renforcer leur autorité hiérarchique.',
    optionC: 'Apprendre à faciliter plutôt qu\'à diriger.',
    optionD: 'Réduire les interactions avec leurs équipes.',
    correctAnswer: 'C',
    explanation: 'L\'article précise que "les managers doivent apprendre à faciliter plutôt qu\'à diriger".',
  }));

  const article4Title = 'La solitude moderne : un enjeu de santé publique sous-estimé';
  const article4Text = `La solitude n\'est plus seulement une expérience intime et personnelle : elle est désormais reconnue par les autorités sanitaires comme un véritable problème de santé publique. En France, une enquête récente révèle que près de 6 millions de personnes se déclarent en situation d\'isolement relationnel sévère, un chiffre en hausse depuis la pandémie.\n\nLes conséquences sur la santé sont comparables à celles du tabagisme : risque accru de maladies cardiovasculaires, de dépression, de déclin cognitif précoce. Les personnes âgées sont les plus touchées, mais les jeunes adultes de 18-25 ans constituent désormais un groupe à risque identifié, notamment en raison de l\'usage intensif des réseaux sociaux qui crée paradoxalement un sentiment de déconnexion affective.\n\nFace à ce constat, des initiatives émergent. Certaines communes créent des "cafés de la rencontre", espaces conviviaux et gratuits ouverts à tous. Des entreprises intègrent des programmes de lutte contre l\'isolement dans leur politique RSE. Mais les experts s\'accordent à dire que seule une réponse globale, combinant action sociale, urbanisme favorisant les liens et soutien psychologique, permettra de réduire durablement ce phénomène.`;

  questions.push(q(39, 'Q33-40', null, {
    taskTitle: article4Title,
    longText: article4Text,
    question: 'Selon l\'article, quel groupe inattendu est identifié comme particulièrement vulnérable à la solitude ?',
    optionA: 'Les retraités.',
    optionB: 'Les personnes âgées.',
    optionC: 'Les adolescents.',
    optionD: 'Les jeunes adultes de 18-25 ans.',
    correctAnswer: 'D',
    explanation: 'L\'article identifie "les jeunes adultes de 18-25 ans" comme "un groupe à risque identifié", ce qui peut surprendre.',
  }));

  questions.push(q(40, 'Q33-40', null, {
    taskTitle: article4Title,
    longText: article4Text,
    question: 'À quoi les effets de la solitude sont-ils comparés dans l\'article ?',
    optionA: 'À l\'alcoolisme.',
    optionB: 'Au tabagisme.',
    optionC: 'À la sédentarité.',
    optionD: 'Au diabète.',
    correctAnswer: 'B',
    explanation: 'L\'article indique "Les conséquences sur la santé sont comparables à celles du tabagisme".',
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
