'use strict';
/**
 * seed-ce-serie6.js
 * Peuple la série CE 6 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie6.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoef600020wxljgwikpv9';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : bar-chart — pic net au T2 ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [40, 90, 48, 45], color: '#003087' }, // CORRECT — pic T2
    { label: 'Graphique 2', data: [90, 75, 55, 35], color: '#E30613' }, // déclin
    { label: 'Graphique 3', data: [40, 55, 70, 88], color: '#E30613' }, // croissance
    { label: 'Graphique 4', data: [60, 58, 62, 60], color: '#E30613' }, // stable
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['T1', 'T2', 'T3', 'T4'];
  const maxVal = 100;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${labels[i]}</text>`;
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

/* ── Helper ── */
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

/* ── Textes Q18-21 ── */
const TEXTS_Q18 = JSON.stringify([
  { title: 'Forfait 1', content: "Forfait Essentiel — 9,99 €/mois. Données : 20 Go en 4G. Appels et SMS illimités en France métropolitaine. Sans engagement. Roaming Europe inclus. Option 5G non disponible." },
  { title: 'Forfait 2', content: "Forfait Confort — 19,99 €/mois. Données : 60 Go en 5G. Appels, SMS et MMS illimités. Roaming Europe et DOM-TOM. Option décodeur TV incluse. Engagement 12 mois." },
  { title: 'Forfait 3', content: "Forfait Premium — 29,99 €/mois. Données : 100 Go en 5G. Appels, SMS, MMS illimités en France et vers l'international (50 pays). Hotspot Wi-Fi inclus. Roaming monde. Engagement 24 mois." },
  { title: 'Forfait 4', content: "Forfait Zen — 6,99 €/mois. Données : 10 Go en 4G. Appels et SMS illimités en France. Sans engagement. Idéal pour les petits consommateurs de données. Pas de roaming international inclus." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Produit 1', content: "Smartphone XS Ultra — Écran 6,7 pouces AMOLED, 256 Go de stockage, 5G. Appareil photo 200 Mpx. Batterie 5 000 mAh. Prix : 899 €. Disponible en noir, blanc et bleu. Garantie 2 ans constructeur." },
  { title: 'Produit 2', content: "Tablette Tab Pro 12 — Écran 12,4 pouces, processeur octa-core, 128 Go. Stylet inclus. Idéale pour les créatifs et professionnels. Clavier vendu séparément. Prix : 649 €. Garantie 2 ans constructeur." },
  { title: 'Produit 3', content: "Montre connectée FitTrack Pro — Suivi santé complet (ECG, SpO2, sommeil). Autonomie 7 jours. Compatible iOS et Android. Résistante à l'eau (50 m). Prix : 189 €. Bracelet interchangeable." },
  { title: 'Produit 4', content: "Casque audio BeatSound 300 — Son haute fidélité, réduction de bruit active, Bluetooth 5.2. Autonomie 30 h. Pliable, léger (220 g). Compatible toutes plateformes. Prix : 29 €. Câble USB-C fourni." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Clinique 1', content: "Cabinet dentaire Dr Morel — Consultations sans rendez-vous acceptées du lundi au vendredi de 8 h à 12 h. Spécialités : soins généraux, extraction, détartrage. Secteur 1, remboursement Sécurité Sociale. Tél. : 04 72 00 11 22." },
  { title: 'Clinique 2', content: "Centre dentaire Sorriso — Spécialités : implantologie, prothèses, orthodontie adulte. Rendez-vous obligatoire. Consultations le samedi sur rendez-vous. Secteur 2. Devis gratuit. Tél. : 04 78 33 44 55." },
  { title: 'Clinique 3', content: "Polyclinique du Sourire — Spécialités : pédodontie, orthodontie enfants et adultes. Accueil du lundi au samedi sur rendez-vous. Secteur 1 et 2 selon praticien. Parking gratuit à proximité. Tél. : 04 77 00 66 77." },
  { title: 'Clinique 4', content: "Cabinet dentaire de garde — Service d'urgences dentaires 7j/7, de 9 h à 19 h. Soins conservateurs d'urgence, gestion de la douleur. Rendez-vous obligatoire par téléphone. Secteur 2. Tél. urgences : 04 72 99 00 11." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Espace 1', content: "Cowork Factory — Abonnement mensuel à partir de 180 €/mois. Accès illimité aux bureaux partagés, salles de réunion (2 h/semaine incluses), café et imprimante. Pas de formule à la journée. Engagement mensuel sans préavis." },
  { title: 'Espace 2', content: "OpenDesk — Accès à la journée sans abonnement : 25 €/jour. Abonnement mensuel disponible à 150 €. Tout compris : wifi haut débit, café, casiers sécurisés. Idéal pour les freelances et visiteurs occasionnels." },
  { title: 'Espace 3', content: "Hub Créatif Lyon — Abonnement uniquement : à partir de 220 €/mois pour un poste dédié. Salles de réunion, cabines téléphoniques, cuisine équipée. Communauté de 200 membres actifs. Événements de networking mensuels." },
  { title: 'Espace 4', content: "TechSpace Confluence — Bureau privatif à partir de 450 €/mois. Accès 24h/24. Domiciliation commerciale possible. Salle de conférence équipée. Service de conciergerie. Pas de poste partagé disponible." },
]);

/* ── Documents Q23-32 ── */
const DOC_SECURITE_INCENDIE =
`FICHE DE SÉCURITÉ INCENDIE — PROCÉDURES D'ÉVACUATION

En cas d'alarme incendie :
1. Ne pas utiliser les ascenseurs. Emprunter uniquement les escaliers de secours balisés.
2. Quitter les locaux calmement, sans courir, en laissant vos affaires personnelles.
3. Rejoindre le point de rassemblement situé sur le parking extérieur côté nord.
4. Ne pas rentrer dans le bâtiment avant autorisation donnée par le responsable de sécurité ou les pompiers.

Responsables d'évacuation par étage :
• Rez-de-chaussée : M. Lepic
• 1er étage : Mme Duval
• 2e étage : M. Bensaid

En cas de blessé : appeler le 15 (SAMU) ou le 18 (Pompiers) depuis un téléphone extérieur.`;

const DOC_BOURSE_RECHERCHE =
`APPEL À CANDIDATURES — BOURSE DE RECHERCHE 2025-2026

La Fondation pour la Recherche Scientifique lance son appel à candidatures annuel pour l'attribution de bourses de recherche destinées aux jeunes chercheurs de moins de 35 ans.

Critères d'éligibilité :
• Être titulaire d'un doctorat obtenu depuis moins de 5 ans.
• Présenter un projet de recherche original dans les domaines des sciences humaines ou naturelles.
• Ne pas bénéficier d'un autre financement principal.

Dossier de candidature : CV détaillé, projet de recherche (10 pages maximum), deux lettres de recommandation de directeurs de recherche reconnus.

Date limite de dépôt des dossiers : 31 octobre 2025.
Résultats communiqués en janvier 2026.`;

const DOC_REGLEMENT_COPRO =
`RÈGLEMENT DE COPROPRIÉTÉ — RÉSIDENCE LES CERISIERS

Les charges de copropriété comprennent l'entretien des parties communes, les assurances de l'immeuble et les honoraires du syndic. Elles sont réparties entre les copropriétaires selon les tantièmes définis dans le règlement.

Les travaux affectant les parties communes doivent être votés en assemblée générale à la majorité absolue des copropriétaires. Les travaux urgents peuvent être décidés par le syndic sans vote préalable, sous réserve de ratification lors de la prochaine assemblée.

L'assemblée générale ordinaire se tient chaque année au cours du premier semestre. Chaque copropriétaire peut se faire représenter par un mandataire de son choix.`;

const DOC_NOTE_REORG =
`NOTE D'INFORMATION — RÉORGANISATION DES SERVICES

Suite à la fusion de nos deux entités, la direction générale procède à une réorganisation des équipes commerciales et administratives.

Calendrier prévisionnel :
• Janvier-février : réunions d'information par service
• Mars : affectation définitive des postes
• Avril : mise en place effective de la nouvelle organisation

Les postes actuellement occupés sont maintenus dans leur intégralité. Aucun licenciement économique n'est prévu. Des mobilités internes volontaires seront proposées. Pour toute question, vous pouvez contacter la DRH à l'adresse : rh-reorg@entreprise.fr.`;

const DOC_CHARTE_DEONTO =
`CHARTE DÉONTOLOGIQUE — CABINET DE CONSEIL STRATEGY & PARTNERS

Notre cabinet s'engage à respecter les principes fondamentaux suivants dans l'exercice de ses missions :

Indépendance : nos consultants ne détiennent aucune participation dans les entreprises clientes et ne peuvent accepter d'avantages susceptibles de compromettre l'objectivité de leurs analyses.

Prévention des conflits d'intérêts : toute situation de conflit d'intérêts potentiel doit être signalée à la direction avant le début d'une mission. La mission sera refusée si le conflit ne peut être levé.

Discrétion professionnelle : toutes les informations communiquées par les clients dans le cadre de nos missions sont strictement confidentielles et ne peuvent être divulguées à des tiers.`;

/* ── Articles de presse Q33-40 ── */
const ART_TOURISME_DURABLE =
`LE TOURISME DURABLE : ENTRE ASPIRATIONS ÉCOLOGIQUES ET RÉALITÉS ÉCONOMIQUES

Le secteur du tourisme représente environ 8 % des émissions mondiales de gaz à effet de serre. Les voyages en avion en constituent la part la plus importante, mais l'hébergement, les transports terrestres et les activités touristiques contribuent également de manière significative. Face à ce constat, le concept de tourisme durable s'est imposé dans les discours officiels et les brochures des agences de voyage. Mais la réalité des pratiques est souvent bien différente.

Le « greenwashing » touristique est devenu une préoccupation croissante. Des hôtels affichent des labels environnementaux sans modifier leurs pratiques en profondeur ; des compagnies aériennes proposent des offsets carbone dont l'efficacité est contestée par les scientifiques. Les consommateurs, de plus en plus sensibles aux enjeux environnementaux, peinent à distinguer les offres véritablement responsables des arguments marketing.

Pourtant, des initiatives authentiques existent. Des territoires ruraux développent des offres d'écotourisme créant de l'emploi local tout en préservant les écosystèmes. Des voyageurs adoptent le train et les séjours longue durée pour réduire leur empreinte. Des certifications sérieuses comme le label « Rainforest Alliance » permettent d'identifier des acteurs réellement engagés.

Le défi du tourisme durable est fondamentalement économique : voyager moins loin et moins souvent coûte moins cher à la planète mais génère moins de revenus pour un secteur qui représente des millions d'emplois dans le monde. Trouver un équilibre viable entre croissance économique et responsabilité environnementale reste le principal enjeu des années à venir.`;

const ART_LANGUE_NUMERIQUE =
`L'ÉVOLUTION DE LA LANGUE FRANÇAISE À L'ÈRE DU NUMÉRIQUE ET DES ANGLICISMES

La langue française, l'une des plus parlées dans le monde avec environ 300 millions de locuteurs, est en constante évolution. Ses défenseurs s'inquiètent depuis plusieurs décennies de l'influence croissante de l'anglais, notamment dans les domaines technologique, économique et culturel. Des termes comme « startup », « cloud », « streaming » ou « webinaire » se sont imposés dans l'usage courant sans que leurs équivalents français ne s'y substituent véritablement.

L'Académie française et la Commission d'enrichissement de la langue française travaillent à proposer des termes alternatifs : « entreprise innovante » pour « startup », « infonuagique » pour « cloud », « diffusion en continu » pour « streaming ». Ces néologismes peinent cependant à s'imposer face à des anglicismes déjà installés dans les pratiques.

Paradoxalement, le numérique contribue aussi à diffuser et à revitaliser la langue française. Les réseaux sociaux, les podcasts et les plateformes de streaming francophones touchent des publics jeunes qui auraient peut-être autrement délaissé le français. La diversité des français parlés dans le monde — québécois, belge, suisse, africain — s'exprime librement en ligne, enrichissant la langue de ses variantes régionales.

L'enjeu n'est donc pas tant de protéger le français contre l'anglais que de maintenir sa vitalité et sa capacité d'innovation lexicale. Une langue vivante emprunte, adapte et crée — c'est précisément ce dynamisme qui garantit sa pérennité.`;

const ART_STARTUP =
`LA CULTURE STARTUP : MYTHE DE LA RÉUSSITE RAPIDE VS RÉALITÉ DU TRAVAIL ACHARNÉ

La « startup nation » est devenue un modèle culturel et économique dominant. Dans l'imaginaire collectif, une startup c'est une poignée de jeunes brillants dans un garage qui, en quelques années, créent une application et deviennent milliardaires. Les médias entretiennent ce mythe en mettant en lumière les success-stories spectaculaires : Uber, Airbnb, BlaBlaCar en France.

La réalité statistique est bien plus sévère. Selon les études menées en Europe, 90 % des startups disparaissent avant leur cinquième année d'existence. Parmi celles qui survivent, une minorité atteint la rentabilité. Les investisseurs en capital-risque, qui financent cet écosystème, savent pertinemment que sur dix paris, un seul sera gagnant — les neuf autres servant à financer ce dixième succès.

Derrière les discours sur la liberté entrepreneuriale et l'innovation se cache souvent une réalité bien différente : des fondateurs qui travaillent 70 ou 80 heures par semaine, souvent sans salaire les premières années, sous pression constante des investisseurs qui attendent une croissance rapide. La santé mentale des entrepreneurs est une préoccupation croissante dans l'écosystème, avec des taux de burn-out alarmants.

Ce n'est pas pour autant que l'esprit entrepreneurial doit être découragé. Les startups jouent un rôle réel dans l'innovation et la création d'emplois. Mais il convient de démythifier la figure du jeune génie et de reconnaître que la réussite entrepreneuriale est avant tout le fruit d'un travail acharné, d'une résilience exceptionnelle et d'une bonne dose de chance.`;

const ART_DESINFORMATION =
`LA DÉSINFORMATION EN LIGNE : MÉCANISMES, AMPLIFICATION ET SOLUTIONS CITOYENNES

La désinformation n'est pas un phénomène nouveau. La propagande, les rumeurs et les théories du complot ont toujours existé. Ce qui a radicalement changé avec l'avènement des réseaux sociaux, c'est la vitesse et l'échelle à laquelle les fausses informations se propagent. Une étude du MIT publiée en 2018 a montré que les fausses nouvelles se diffusent six fois plus vite sur Twitter que les informations vérifiées.

Les mécanismes psychologiques qui expliquent ce phénomène sont bien documentés. Les informations qui suscitent des émotions fortes — colère, peur, indignation — sont plus susceptibles d'être partagées sans vérification préalable. Les biais de confirmation poussent les individus à diffuser des informations qui confortent leurs croyances existantes, même lorsqu'elles sont fausses. Les algorithmes des plateformes, optimisés pour maximiser l'engagement, amplifient mécaniquement les contenus les plus émotionnellement chargés.

Les solutions émergent progressivement. Le fact-checking professionnel, assuré par des organisations comme AFP Factuel ou Les Décodeurs du Monde, permet de corriger les informations fausses après leur diffusion. Des programmes d'éducation aux médias dans les écoles enseignent aux jeunes à vérifier leurs sources. Les plateformes elles-mêmes testent des mécanismes de ralentissement de la diffusion de contenus non vérifiés.

Ces initiatives restent insuffisantes face à l'ampleur du phénomène. La solution ultime est probablement culturelle : développer un rapport critique et exigeant à l'information, qui ne peut s'acquérir que par l'éducation et la pratique quotidienne.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Carte de fidélité sport
  qs.push(q(1, 'Q1-7', null, {
    longText:
`DÉCATHLON FIDÉLITÉ — Carte Membre

Points gagnés : 1 point pour chaque euro dépensé en magasin ou en ligne.
Récompenses : bon d'achat de 5 € dès 500 points, 10 € dès 1 000 points.
Conditions : les points expirent 12 mois après leur acquisition.
Avantage exclusif : accès aux ventes privées réservées aux membres.

Cette carte est nominative et non transférable.
Service client : fidelite@decathlon.fr`,
    question: "Ce document présente…",
    optionA: "un programme de remboursement de produits défectueux.",
    optionB: "un programme de fidélité avec points et récompenses.",
    optionC: "un abonnement annuel à un club de sport.",
    optionD: "une carte de paiement différé dans les magasins.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme festival de musique
  qs.push(q(2, 'Q1-7', null, {
    longText:
`FESTIVAL DES SONS D'ÉTÉ — 15e édition

Du 18 au 20 juillet — Parc de la Rivière, Toulouse

Vendredi 18 : Nuit Électro — Dj Solar, Voltage Crew | 21 h – 3 h
Samedi 19 : Pop & Rock — Les Satellites, Nina K. | 19 h – 2 h
Dimanche 20 : Acoustic Sunday — trio Mafine, Sylvie Vento | 17 h – 23 h

Tarifs : Pass 3 jours 65 € | Billet journée 28 €
Réservation et programme complet : festival-sons-ete.fr`,
    question: "Ce document est…",
    optionA: "un article de presse sur un festival.",
    optionB: "un programme de festival de musique.",
    optionC: "une publicité pour une salle de concert.",
    optionD: "une critique musicale.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement piscine municipale
  qs.push(q(3, 'Q1-7', null, {
    longText:
`PISCINE MUNICIPALE NEPTUNE — Règlement intérieur

Accès : toute personne doit présenter son titre d'accès (billet ou abonnement) validé.
Équipements obligatoires : bonnet de bain et maillot de bain non-short pour les hommes.
Interdictions : plonger depuis les bords du bassin, courir sur les plages, amener de la nourriture ou des boissons.
Vestiaires : les objets de valeur sont sous la responsabilité de leur propriétaire. Des casiers à pièces sont disponibles.

Numéro d'urgence : 04 68 00 55 44`,
    question: "Ce document présente principalement…",
    optionA: "les horaires d'ouverture de la piscine.",
    optionB: "les tarifs d'accès à la piscine.",
    optionC: "les règles d'utilisation de la piscine.",
    optionD: "le programme des activités aquatiques.",
    correctAnswer: 'C',
  }));

  // Q4 — Affiche campagne prévention routière
  qs.push(q(4, 'Q1-7', null, {
    longText:
`SÉCURITÉ ROUTIÈRE — Campagne nationale

« 1 verre, c'est déjà trop au volant »

En France, l'alcool est impliqué dans 30 % des accidents mortels sur la route.
La limite légale est de 0,5 g/L dans le sang (0,2 g/L pour les jeunes conducteurs).

Ne conduisez jamais après avoir bu, même un seul verre.
Désignez un conducteur sobre ou prenez un taxi.

www.securite-routiere.gouv.fr | Numéro d'appel : 3000`,
    question: "Ce document est principalement…",
    optionA: "un article scientifique sur l'alcoolisme.",
    optionB: "une affiche de prévention routière.",
    optionC: "une information légale sur le code de la route.",
    optionD: "une publicité pour les transports en commun.",
    correctAnswer: 'B',
  }));

  // Q5 — Extrait guide touristique Lyon
  qs.push(q(5, 'Q1-7', null, {
    longText:
`LYON — LES INCONTOURNABLES

Vieux-Lyon : quartier Renaissance classé à l'UNESCO. À voir : cathédrale Saint-Jean, traboules (passages couverts typiquement lyonnais). Conseil : visite tôt le matin pour éviter la foule.

Fourvière : colline dominante avec vue panoramique sur la ville. La basilique Notre-Dame de Fourvière vaut le détour. Accès en funiculaire depuis le Vieux-Lyon.

Les Halles Paul Bocuse : temple de la gastronomie lyonnaise. 65 commerçants spécialisés. Ouvert tous les jours sauf lundi matin.`,
    question: "Ce document est extrait…",
    optionA: "d'un article de presse sur l'histoire de Lyon.",
    optionB: "d'un guide touristique sur Lyon.",
    optionC: "d'une brochure immobilière lyonnaise.",
    optionD: "d'un programme scolaire sur le patrimoine.",
    correctAnswer: 'B',
  }));

  // Q6 — Avis de convocation assemblée générale
  qs.push(q(6, 'Q1-7', null, {
    longText:
`RÉSIDENCE LES ÉRABLES — AVIS DE CONVOCATION

Assemblée Générale Ordinaire des copropriétaires

Date : Mardi 18 mars 2025 à 19 h 30
Lieu : Salle des fêtes du quartier, 45 rue des Lilas, Nantes

Ordre du jour :
1. Approbation des comptes de l'exercice 2024
2. Vote des travaux de ravalement de façade
3. Questions diverses

Les copropriétaires ne pouvant assister peuvent se faire représenter par procuration.
Contacter le syndic : syndic-erables@cabinet-gestion.fr`,
    question: "Ce document est…",
    optionA: "un contrat de location d'une salle de fêtes.",
    optionB: "une convocation à une assemblée de copropriétaires.",
    optionC: "un procès-verbal de réunion de copropriété.",
    optionD: "une facture de syndic de copropriété.",
    correctAnswer: 'B',
  }));

  // Q7 — Bon de commande professionnel
  qs.push(q(7, 'Q1-7', null, {
    longText:
`BON DE COMMANDE N° 2025-0482

Émetteur : Société DUPONT & Fils, 12 rue de l'Industrie, 69002 Lyon
Fournisseur : MATERIAUX PRO, 8 avenue des Forges, 42000 Saint-Étienne

Référence produit : MP-440-INOX
Désignation : Plaques inox 304L, épaisseur 2 mm, format 1000×2000 mm
Quantité commandée : 50 unités
Délai de livraison souhaité : sous 10 jours ouvrés
Conditions de paiement : 30 jours fin de mois

Signature et tampon de l'acheteur`,
    question: "Ce document est…",
    optionA: "une facture d'achat de matériaux.",
    optionB: "un devis d'un fournisseur de matériaux.",
    optionC: "un bon de commande professionnel.",
    optionD: "un contrat de fourniture de services.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'entreprise s'engage à livrer les marchandises dans les délais ___ dans le contrat.",
    question: PHRASE_Q,
    optionA: "imaginés",
    optionB: "prévus",
    optionC: "changés",
    optionD: "évités",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les étudiants doivent ___ leur inscription avant le 15 septembre pour être pris en compte.",
    question: PHRASE_Q,
    optionA: "annuler",
    optionB: "oublier",
    optionC: "confirmer",
    optionD: "reporter",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Veuillez ___ vos coordonnées complètes sur le formulaire avant de le remettre à l'accueil.",
    question: PHRASE_Q,
    optionA: "effacer",
    optionB: "ignorer",
    optionC: "renseigner",
    optionD: "cacher",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Suite à des difficultés techniques, le site internet de la mairie sera ___ de 18 h à 20 h ce soir.",
    question: PHRASE_Q,
    optionA: "ouvert",
    optionB: "inaccessible",
    optionC: "rénové",
    optionD: "étendu",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce produit pharmaceutique doit être ___ hors de portée des enfants et à l'abri de la lumière.",
    question: PHRASE_Q,
    optionA: "consommé",
    optionB: "jeté",
    optionC: "conservé",
    optionD: "acheté",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour réduire votre ___ carbone, il est recommandé de privilégier les transports en commun.",
    question: PHRASE_Q,
    optionA: "énergie",
    optionB: "poids",
    optionC: "budget",
    optionD: "empreinte",
    correctAnswer: 'D',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "L'alimentation équilibrée est la [14] d'une bonne santé. Les experts conseillent de consommer quotidiennement des fruits et légumes variés, des protéines et des glucides complexes. L'eau reste la meilleure [15] pour s'hydrater tout au long de la journée.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'alimentation équilibrée",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "conséquence",
    optionB: "base",
    optionC: "limite",
    optionD: "cause",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'alimentation équilibrée",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "nourriture",
    optionB: "boisson",
    optionC: "médecine",
    optionD: "activité",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "Le covoiturage est une [16] de transport de plus en plus populaire en France. Il permet de réduire les coûts de déplacement tout en limitant l'impact [17] de la voiture individuelle sur l'environnement.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le covoiturage',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "interdiction",
    optionB: "limite",
    optionC: "alternative",
    optionD: "obligation",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le covoiturage',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "positif",
    optionB: "culturel",
    optionC: "économique",
    optionD: "environnemental",
    correctAnswer: 'D',
  }));

  // Q18-21
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel forfait propose le plus grand volume de données mobiles ?",
    optionA: "Forfait 1",
    optionB: "Forfait 2",
    optionC: "Forfait 3",
    optionD: "Forfait 4",
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel produit est proposé au prix le moins élevé ?",
    optionA: "Produit 1",
    optionB: "Produit 2",
    optionC: "Produit 3",
    optionD: "Produit 4",
    correctAnswer: 'D',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle clinique accepte les patients sans rendez-vous préalable ?",
    optionA: "Clinique 1",
    optionB: "Clinique 2",
    optionC: "Clinique 3",
    optionD: "Clinique 4",
    correctAnswer: 'A',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel espace de coworking propose une offre à la journée sans abonnement ?",
    optionA: "Espace 1",
    optionB: "Espace 2",
    optionC: "Espace 3",
    optionD: "Espace 4",
    correctAnswer: 'B',
  }));

  // Q22
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Cette entreprise réalise plus de la moitié de son chiffre d'affaires annuel au deuxième trimestre. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Fiche de sécurité incendie — Procédures d'évacuation",
    longText: DOC_SECURITE_INCENDIE,
    question: "Ce document présente principalement…",
    optionA: "les équipements de protection incendie disponibles.",
    optionB: "les procédures d'évacuation en cas d'alarme incendie.",
    optionC: "le programme de formation à la sécurité des salariés.",
    optionD: "les coordonnées des services de secours locaux.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Fiche de sécurité incendie — Procédures d'évacuation",
    longText: DOC_SECURITE_INCENDIE,
    question: "Selon ce document, en cas d'alarme incendie, il faut…",
    optionA: "utiliser l'ascenseur pour évacuer rapidement.",
    optionB: "emporter ses affaires personnelles avant de sortir.",
    optionC: "rejoindre le point de rassemblement côté nord.",
    optionD: "appeler les pompiers depuis l'intérieur du bâtiment.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Appel à candidatures — Bourse de recherche 2025-2026",
    longText: DOC_BOURSE_RECHERCHE,
    question: "Ce document s'adresse principalement à…",
    optionA: "des étudiants en licence souhaitant financer leurs études.",
    optionB: "des jeunes chercheurs titulaires d'un doctorat.",
    optionC: "des directeurs de laboratoire cherchant des financements.",
    optionD: "des entreprises souhaitant sponsoriser la recherche.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Appel à candidatures — Bourse de recherche 2025-2026",
    longText: DOC_BOURSE_RECHERCHE,
    question: "Pour candidater à cette bourse, il faut notamment fournir…",
    optionA: "un relevé de notes et une attestation d'inscription.",
    optionB: "un CV, un projet de recherche et deux lettres de recommandation.",
    optionC: "un plan de financement détaillé sur cinq ans.",
    optionD: "une liste de publications scientifiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Les Cerisiers",
    longText: DOC_REGLEMENT_COPRO,
    question: "Ce document traite principalement des…",
    optionA: "travaux de rénovation urgents décidés par les copropriétaires.",
    optionB: "règles de gestion et de fonctionnement de la copropriété.",
    optionC: "prix de vente des appartements de la résidence.",
    optionD: "conditions d'accès aux parties communes de la résidence.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Les Cerisiers",
    longText: DOC_REGLEMENT_COPRO,
    question: "Selon ce document, les travaux portant sur les parties communes doivent…",
    optionA: "être décidés uniquement par le syndic.",
    optionB: "être votés en assemblée générale à la majorité absolue.",
    optionC: "être financés intégralement par le syndic.",
    optionD: "recevoir l'accord du maire de la commune.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Note d'information — Réorganisation des services",
    longText: DOC_NOTE_REORG,
    question: "Cette note annonce principalement…",
    optionA: "la fermeture de l'un des sites de l'entreprise.",
    optionB: "une réorganisation des équipes suite à une fusion.",
    optionC: "un plan de licenciements économiques.",
    optionD: "le déménagement du siège social de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Note d'information — Réorganisation des services",
    longText: DOC_NOTE_REORG,
    question: "Selon cette note, les postes actuellement occupés sont…",
    optionA: "tous supprimés au profit de nouvelles fonctions.",
    optionB: "maintenus, sans licenciement économique prévu.",
    optionC: "soumis à une évaluation avant confirmation.",
    optionD: "proposés uniquement aux cadres de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Charte déontologique — Cabinet de conseil Strategy & Partners",
    longText: DOC_CHARTE_DEONTO,
    question: "Ce document décrit principalement…",
    optionA: "les tarifs et conditions commerciales du cabinet.",
    optionB: "les engagements éthiques du cabinet envers ses clients.",
    optionC: "la liste des missions et secteurs d'intervention du cabinet.",
    optionD: "les qualifications requises pour travailler dans ce cabinet.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Charte déontologique — Cabinet de conseil Strategy & Partners",
    longText: DOC_CHARTE_DEONTO,
    question: "Selon cette charte, en cas de conflit d'intérêts potentiel, le consultant doit…",
    optionA: "demander une augmentation de salaire pour compenser.",
    optionB: "le signaler à la direction avant de débuter la mission.",
    optionC: "continuer la mission en toute discrétion.",
    optionD: "en informer le client directement.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Le tourisme durable : entre aspirations écologiques et réalités économiques",
    longText: ART_TOURISME_DURABLE,
    question: "Selon cet article, quel est le principal reproche fait au « tourisme vert » tel qu'il est pratiqué aujourd'hui ?",
    optionA: "Il est trop coûteux pour la majorité des voyageurs.",
    optionB: "Il est souvent utilisé comme argument marketing sans réelle pratique responsable.",
    optionC: "Il ne bénéficie qu'aux pays les plus développés.",
    optionD: "Il interdit les voyages en avion pour tous les touristes.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Le tourisme durable : entre aspirations écologiques et réalités économiques",
    longText: ART_TOURISME_DURABLE,
    question: "L'auteur souligne que le défi principal du tourisme durable est…",
    optionA: "de convaincre les touristes de rester dans leur pays.",
    optionB: "de concilier responsabilité environnementale et viabilité économique.",
    optionC: "de trouver des sources de financement pour les projets écotouristiques.",
    optionD: "d'imposer des normes internationales aux agences de voyage.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'évolution de la langue française à l'ère du numérique et des anglicismes",
    longText: ART_LANGUE_NUMERIQUE,
    question: "Selon cet article, quels termes l'Académie française propose-t-elle à la place d'anglicismes courants ?",
    optionA: "Des termes latins issus du patrimoine classique.",
    optionB: "Des équivalents français comme « entreprise innovante » pour « startup ».",
    optionC: "Des emprunts à d'autres langues latines comme l'espagnol.",
    optionD: "Des sigles français remplaçant les acronymes anglais.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'évolution de la langue française à l'ère du numérique et des anglicismes",
    longText: ART_LANGUE_NUMERIQUE,
    question: "L'auteur affirme paradoxalement que le numérique…",
    optionA: "accélère la mort du français au profit de l'anglais.",
    optionB: "contribue aussi à diffuser et à revitaliser la langue française.",
    optionC: "uniformise toutes les langues du monde vers un standard unique.",
    optionD: "remplace définitivement l'écrit par l'image et la vidéo.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La culture startup : mythe de la réussite rapide vs réalité du travail acharné",
    longText: ART_STARTUP,
    question: "Selon les statistiques citées dans l'article, quel pourcentage des startups disparaît avant leur cinquième année ?",
    optionA: "50 %",
    optionB: "70 %",
    optionC: "80 %",
    optionD: "90 %",
    correctAnswer: 'D',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La culture startup : mythe de la réussite rapide vs réalité du travail acharné",
    longText: ART_STARTUP,
    question: "Quelle réalité cache souvent la culture startup selon l'auteur ?",
    optionA: "Des fondateurs qui profitent rapidement des investissements.",
    optionB: "Un travail acharné, des horaires excessifs et une pression constante.",
    optionC: "Une absence totale de risques grâce au financement des investisseurs.",
    optionD: "Une liberté totale sans contraintes ni obligations envers les actionnaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La désinformation en ligne : mécanismes, amplification et solutions citoyennes",
    longText: ART_DESINFORMATION,
    question: "Selon l'étude du MIT citée dans l'article, les fausses nouvelles se diffusent…",
    optionA: "deux fois plus lentement que les informations vérifiées.",
    optionB: "à la même vitesse que les informations vérifiées.",
    optionC: "six fois plus vite que les informations vérifiées.",
    optionD: "dix fois plus rapidement sur Facebook que sur Twitter.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La désinformation en ligne : mécanismes, amplification et solutions citoyennes",
    longText: ART_DESINFORMATION,
    question: "L'auteur conclut que la solution ultime contre la désinformation est probablement…",
    optionA: "la suppression des réseaux sociaux les plus utilisés.",
    optionB: "la création d'une agence gouvernementale de vérification des faits.",
    optionC: "une réglementation stricte imposée aux plateformes technologiques.",
    optionD: "culturelle, fondée sur l'éducation à l'esprit critique.",
    correctAnswer: 'D',
  }));

  return qs;
}

/* ── Main ── */
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
    console.log(`\n✅ ${created} questions créées pour CE 6.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
