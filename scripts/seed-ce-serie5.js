'use strict';
/**
 * seed-ce-serie5.js
 * Peuple la série CE 5 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie5.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoe5l00010wxlpe6447kz';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : courbe de températures mensuelles (J–D) ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [-15,-12,-6,0,5,9,11,10,4,-1,-8,-13], minY: -18, maxY: 14, color: '#003087' }, // CORRECT
    { label: 'Graphique 2', data: [5,6,10,14,18,22,25,24,20,14,8,5],    minY: 0,   maxY: 28, color: '#E30613' },
    { label: 'Graphique 3', data: [25,26,27,28,29,30,29,28,27,26,25,24], minY: 22,  maxY: 33, color: '#E30613' },
    { label: 'Graphique 4', data: [9,11,14,18,22,27,31,30,25,18,12,9],  minY: 5,   maxY: 34, color: '#E30613' },
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
  { title: 'Recette 1', content: "Bœuf bourguignon — Temps de préparation : 30 min. Cuisson : 2 h 30. Niveau : intermédiaire. Plat principal pour 6 personnes. Ingrédients : bœuf, vin rouge de Bourgogne, carottes, oignons, bouquet garni, lardons." },
  { title: 'Recette 2', content: "Soupe de tomates fraîches — Temps de préparation : 10 min. Cuisson : 20 min. Niveau : facile. Entrée pour 4 personnes. Ingrédients : tomates, basilic, crème, ail, huile d'olive. Servir froide ou chaude." },
  { title: 'Recette 3', content: "Omelette aux herbes — Temps de préparation : 5 min. Cuisson : 10 min. Niveau : débutant. Plat principal rapide pour 2 personnes. Ingrédients : œufs, ciboulette, persil, beurre, sel, poivre. Idéal pour un repas express." },
  { title: 'Recette 4', content: "Cassoulet traditionnel — Temps de préparation : 45 min. Cuisson : 3 h. Niveau : avancé. Plat principal pour 8 personnes. Ingrédients : haricots blancs, confit de canard, saucisse de Toulouse, couenne, tomates, ail." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Voiture 1', content: "Renault Clio — Année : 2019 — Kilométrage : 48 000 km — Carburant : Essence — Boîte : Automatique — Prix : 9 500 €. Première main, carnet d'entretien complet. Contrôle technique valide. Contact : 06 11 22 33 44." },
  { title: 'Voiture 2', content: "Peugeot 308 — Année : 2021 — Kilométrage : 32 000 km — Carburant : Diesel — Boîte : Manuelle — Prix : 14 200 €. Garantie constructeur 12 mois restants. Climatisation, GPS intégré. Contact : agence AutoPrime." },
  { title: 'Voiture 3', content: "Citroën C3 — Année : 2018 — Kilométrage : 61 000 km — Carburant : Essence — Boîte : Manuelle — Prix : 8 900 €. Deux propriétaires précédents. Pneus récents. Petite rayure sur portière gauche. Contact : 07 44 55 66 77." },
  { title: 'Voiture 4', content: "Volkswagen Golf — Année : 2022 — Kilométrage : 18 000 km — Carburant : Hybride — Boîte : Automatique — Prix : 21 500 €. Garantie 24 mois. Toit ouvrant panoramique, sièges chauffants. Disponible immédiatement. Contact : garage VW Lyon." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Destination 1', content: "Séjour à Québec en janvier — Ville historique et festive. Températures hivernales entre -15 °C et -5 °C. Activités : patinage sur le Château Frontenac, Carnaval de Québec. Équipements chauds indispensables. Vol direct depuis Paris." },
  { title: 'Destination 2', content: "Séjour en Islande en décembre — Pays des aurores boréales et des geysers. Températures de -5 °C à 3 °C. Activités : randonnée sur glacier, bain dans le lagon bleu. Prévoir vêtements imperméables et chauds." },
  { title: 'Destination 3', content: "Séjour à Barcelone en décembre — Ville dynamique et ensoleillée. Températures douces : 10 à 17 °C. Activités : Sagrada Familia, marché de Noël de la Plaça de Catalunya, gastronomie catalane. Idéal pour les familles." },
  { title: 'Destination 4', content: "Séjour à l'île Maurice en janvier — Paradis tropical de l'océan Indien. Températures : 27 à 32 °C toute l'année. Activités : plongée, plages de sable blanc, randonnée dans le parc national. Soleil garanti en hiver." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Formation 1', content: "Formation en gestion de projet — Durée : 5 jours en présentiel, Paris. Niveau : intermédiaire. Certification PMI préparée. Financement OPCO possible. Date : 15-19 septembre. Tarif : 1 800 €. Inscription sur formationpro.fr." },
  { title: 'Formation 2', content: "Formation langue française niveau B2 — Durée : 120 heures entièrement à distance (e-learning). Accès 24h/24. Financement CPF éligible. Certification DELF préparée. Tarif : 950 €. Inscription en ligne tout au long de l'année." },
  { title: 'Formation 3', content: "Formation comptabilité analytique — Durée : 3 jours en alternance (1 jour/semaine). Paris ou Lyon. Niveau confirmé requis. Financement OPCO selon secteur. Tarif : 900 €. Prochaine session : 10 octobre. Places limitées." },
  { title: 'Formation 4', content: "Formation management d'équipe — Durée : 2 jours en présentiel + 4 classes virtuelles. Niveau cadre. Certification interne délivrée. Intra-entreprise possible sur demande. Tarif : 1 400 €. Contact : formations@leadership-plus.fr." },
]);

/* ── Documents Q23-32 ── */
const DOC_FORMATION_CONTINUE =
`PROGRAMME DE FORMATION PROFESSIONNELLE CONTINUE

Notre organisme de formation propose un cycle de développement des compétences managériales, ouvert à tout salarié justifiant d'au moins un an d'ancienneté dans son poste.

Objectifs : maîtriser les outils de pilotage d'équipe, développer ses compétences en communication professionnelle, et acquérir des méthodes de résolution de conflits.

Durée : 3 jours consécutifs (21 heures). Lieu : nos locaux à Paris, Lyon ou Bordeaux.

Cette formation est éligible au financement par le CPF (Compte Personnel de Formation) et peut être prise en charge par les OPCO selon le secteur d'activité de l'entreprise. Tarif individuel : 1 200 € HT.

Inscriptions et renseignements : contact@formpro.fr ou au 01 44 00 55 66.`;

const DOC_CONTRAT_PRESTATION =
`CONTRAT DE PRESTATION DE SERVICES INFORMATIQUES

Entre la société DIGITAL SOLUTIONS (prestataire) et la société LEMAIRE & ASSOCIÉS (client), il est convenu ce qui suit :

Le prestataire s'engage à fournir une maintenance corrective et évolutive du système d'information du client pendant une durée de douze mois, renouvelable par tacite reconduction.

Les interventions seront réalisées dans un délai de 4 heures ouvrées pour les incidents critiques et de 48 heures pour les demandes standard. Tout dépassement de délai entraîne une pénalité de 5 % du montant mensuel par jour de retard.

Le client s'engage à mettre à disposition les accès et ressources nécessaires et à désigner un interlocuteur technique unique.`;

const DOC_REGLEMENT_PME =
`RÈGLEMENT INTÉRIEUR — SOCIÉTÉ MARTIN INDUSTRIE

Horaires de travail : du lundi au vendredi, de 8 h 30 à 17 h 30, avec une pause déjeuner de 45 minutes. Toute absence doit être signalée avant 9 h 00 au responsable direct.

Tenue vestimentaire : une tenue correcte et adaptée au contexte professionnel est exigée en toutes circonstances. Le port de vêtements de protection est obligatoire dans les zones de production.

Confidentialité : les salariés sont tenus à une obligation de discrétion absolue sur les informations commerciales, techniques et financières de l'entreprise, y compris après la cessation de leur contrat.

Tout manquement au présent règlement peut faire l'objet d'une procédure disciplinaire.`;

const DOC_CHARTE_ISO =
`CHARTE QUALITÉ — CERTIFICATION ISO 9001

Notre entreprise s'engage à fournir des produits et services conformes aux exigences de nos clients et aux réglementations applicables.

Nos engagements principaux :
• Placer la satisfaction du client au cœur de chaque décision.
• Améliorer continuellement nos processus grâce à des audits internes annuels.
• Former l'ensemble de notre personnel aux exigences qualité.
• Mesurer nos performances par des indicateurs précis et publier des rapports trimestriels.

La direction s'engage à mettre à disposition les ressources humaines et matérielles nécessaires à l'atteinte de ces objectifs. La certification ISO 9001 est renouvelée tous les trois ans par un organisme extérieur accrédité.`;

const DOC_NOTE_CONGES =
`NOTE D'INFORMATION — Congés annuels et jours fériés légaux

En application du Code du travail français, tout salarié acquiert 2,5 jours ouvrables de congés payés par mois de travail effectif, soit 30 jours ouvrables (5 semaines) par an.

La période légale de prise des congés principaux (au moins 12 jours ouvrables consécutifs) s'étend du 1er mai au 31 octobre. La date de départ effectif en congé doit être validée par le responsable hiérarchique au moins un mois à l'avance.

Les jours fériés légaux (au nombre de 11 en France métropolitaine) ne sont pas déductibles des congés payés lorsqu'ils tombent un jour normalement travaillé.

Pour toute demande de congé, merci d'utiliser le formulaire disponible sur l'intranet RH.`;

/* ── Articles de presse Q33-40 ── */
const ART_CLIMAT_AFRIQUE =
`LE CHANGEMENT CLIMATIQUE ET L'AGRICULTURE AFRICAINE : SÉCHERESSES, SOLUTIONS ET AIDE INTERNATIONALE

L'Afrique subsaharienne est l'une des régions du monde les plus vulnérables aux effets du changement climatique, alors qu'elle est paradoxalement l'une des moins responsables des émissions de gaz à effet de serre. Les agriculteurs, qui représentent une large part de la population active de nombreux pays du continent, font face à des défis croissants : sécheresses prolongées, inondations imprévues, irrégularité des saisons des pluies et appauvrissement des sols.

Au Sahel, la désertification progresse à un rythme alarmant. Des études menées par la FAO indiquent qu'en l'absence d'actions correctives, jusqu'à 250 millions de personnes pourraient être déplacées d'ici 2050 en raison de la dégradation des terres agricoles. Les petits agriculteurs, qui n'ont ni les ressources pour investir dans l'irrigation ni l'accès aux semences améliorées, sont les premières victimes.

Pourtant, des solutions locales existent et font leurs preuves. La technique de régénération naturelle assistée (RNA), développée au Niger, permet de restaurer des terres dégradées à moindre coût en protégeant la repousse naturelle des arbres. Des projets d'agriculture de conservation, combinant couverture végétale permanente et travail minimal du sol, permettent de préserver l'humidité et d'améliorer les rendements même en période de faible pluviométrie.

L'aide internationale joue un rôle indispensable, mais elle doit évoluer : passer de l'aide d'urgence à des investissements structurels à long terme, en associant les communautés locales à la conception des projets pour garantir leur pertinence et leur pérennité.`;

const ART_ECO_CIRCULAIRE =
`L'ÉCONOMIE CIRCULAIRE COMME ALTERNATIVE À LA SOCIÉTÉ DE CONSOMMATION JETABLE

Depuis la révolution industrielle, le modèle économique dominant repose sur un principe simple : extraire des ressources naturelles, fabriquer des produits, les vendre et les jeter. Ce modèle linéaire a permis une croissance économique sans précédent, mais il génère des quantités colossales de déchets, épuise les ressources naturelles et aggrave la crise climatique.

Face à ces constats, l'économie circulaire propose un changement de paradigme radical. Son principe fondateur : rien ne se perd, tout se transforme. Plutôt que de concevoir des produits dont la durée de vie est volontairement limitée — ce que l'on appelle l'obsolescence programmée —, l'économie circulaire encourage la durabilité, la réparabilité et le réemploi. Les entreprises sont invitées à penser dès la conception de leurs produits la façon dont les matériaux pourront être récupérés et recyclés.

Des secteurs entiers commencent à adopter ces principes. Dans l'industrie textile, des marques proposent des vêtements fabriqués à partir de matières recyclées et reprennent les vêtements usagés pour leur donner une seconde vie. Dans le bâtiment, des projets de construction utilisent des matériaux de déconstruction.

La transition vers une économie circulaire ne se fera pas sans efforts. Elle nécessite des investissements dans la recherche et le développement, une réglementation adaptée et surtout une évolution des comportements des consommateurs, qui doivent être prêts à acheter moins mais mieux.`;

const ART_DIVERSITE =
`LA DIVERSITÉ EN ENTREPRISE : OBLIGATION LÉGALE VERSUS AVANTAGE COMPÉTITIF RÉEL

La question de la diversité dans le monde du travail est devenue incontournable. En France, depuis la loi Rixain de 2021, les grandes entreprises sont obligées de se doter d'un index mesurant la représentation des femmes et des hommes dans leurs instances dirigeantes, sous peine de sanctions financières. D'autres pays ont adopté des dispositions similaires concernant les minorités ethniques et les personnes en situation de handicap.

Ces obligations légales ont le mérite de mettre le sujet à l'agenda des directions générales. Mais elles suscitent aussi un débat : la diversité imposée est-elle réellement efficace, ou ne génère-t-elle qu'une conformité de façade, sans transformation culturelle profonde ?

Des recherches menées par McKinsey et d'autres cabinets de conseil indiquent que les entreprises dont les équipes dirigeantes sont plus diversifiées obtiennent de meilleures performances financières. La diversité des profils favorise la créativité, réduit les biais cognitifs dans la prise de décision et améliore la compréhension des marchés-cibles. Mais ces bénéfices ne se manifestent que dans des organisations où la diversité est accompagnée d'une culture réelle d'inclusion.

En pratique, la diversité sans inclusion peut même être contre-productive : les collaborateurs issus de groupes minoritaires qui se sentent marginalisés ou discriminés sont moins performants et plus susceptibles de quitter l'entreprise. La véritable transformation passe donc par la formation des managers, la refonte des processus de recrutement et la création d'espaces de dialogue sécurisés.`;

const ART_LOGEMENT =
`LA CRISE DU LOGEMENT SOCIAL DANS LES GRANDES MÉTROPOLES FRANÇAISES

La France fait face à une crise du logement social d'une ampleur inédite. En 2024, plus de 2,4 millions de ménages sont en attente d'un logement social, pour un délai d'attente moyen qui dépasse 6 ans dans les grandes métropoles comme Paris, Lyon ou Marseille. Le parc de logements sociaux, qui compte environ 5,5 millions de logements, est saturé et ne suffit plus à répondre à une demande en constante progression.

Les causes de cette crise sont multiples. La construction de nouveaux logements sociaux est freinée par le manque de foncier disponible dans les zones urbaines denses, le coût élevé du bâtiment et les résistances des élus locaux à accueillir davantage de logements sociaux sur leur territoire. Par ailleurs, les locataires en place quittent rarement leurs logements même lorsque leur situation financière s'améliore, faute d'alternatives abordables sur le marché privé.

Des solutions ont été proposées et parfois expérimentées : densification urbaine dans les zones bien desservies par les transports en commun, transformation de bureaux vacants en logements, mobilisation du foncier public disponible. Ces pistes restent insuffisamment exploitées.

La crise du logement social a des conséquences directes sur la cohésion sociale et l'économie : des travailleurs essentiels — soignants, enseignants, agents de sécurité — peinent à se loger à proximité de leur lieu de travail dans les grandes villes, au risque de provoquer une pénurie de main-d'œuvre dans des secteurs indispensables.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Étiquette confiture artisanale
  qs.push(q(1, 'Q1-7', null, {
    longText:
`CONFITURE ARTISANALE — FRAISES DES BOIS ET BASILIC

Ingrédients : fraises des bois (55 %), sucre de canne, basilic frais (3 %), jus de citron bio, pectine de fruits.

Fabriqué en Ardèche par la Maison Sauvignat.
Teneur en fruits : 55 g pour 100 g de confiture finie.
À conserver dans un endroit frais et sec. Après ouverture, réfrigérer et consommer sous 4 semaines.`,
    question: "Ce document est…",
    optionA: "une recette de cuisine artisanale.",
    optionB: "une publicité pour un producteur de fruits.",
    optionC: "une étiquette de produit alimentaire.",
    optionD: "un certificat d'origine contrôlée.",
    correctAnswer: 'C',
  }));

  // Q2 — Courriel professionnel DRH
  qs.push(q(2, 'Q1-7', null, {
    longText:
`De : m.fontaine@rh.agritech.fr
À : Toute l'équipe — 47 destinataires

Objet : Message de la Direction

Chers collègues,

Malgré un contexte économique tendu, la Direction confirme le maintien de l'ensemble de nos objectifs pour cette année et réaffirme son engagement envers chaque membre de l'équipe. Aucune suppression de poste n'est envisagée.

Merci pour votre engagement et votre professionnalisme quotidien.

Mireille Fontaine
Directrice des Ressources Humaines`,
    question: "L'auteure de ce courriel cherche principalement à…",
    optionA: "annoncer une restructuration à venir.",
    optionB: "rassurer les salariés sur l'avenir de l'entreprise.",
    optionC: "proposer une réunion d'équipe.",
    optionD: "signaler des suppressions de postes.",
    correctAnswer: 'B',
  }));

  // Q3 — Journée portes ouvertes au zoo
  qs.push(q(3, 'Q1-7', null, {
    longText:
`ZOO MUNICIPAL DE BELLERIVE — JOURNÉE PORTES OUVERTES

Samedi 12 avril — de 9 h à 18 h

Venez découvrir nos 300 animaux de 80 espèces différentes !
Animations : spectacle des oiseaux (11 h et 15 h), rencontre avec les soigneurs (14 h).

Entrée gratuite pour tous les enfants de moins de 12 ans accompagnés d'un adulte.
Tarif adulte : 8 € | Tarif réduit : 5 €
Accès : tramway ligne 3, arrêt Zoo Municipal`,
    question: "Ce document est…",
    optionA: "un règlement intérieur de zoo.",
    optionB: "une affiche d'événement public.",
    optionC: "un programme de formation animalière.",
    optionD: "un bon de réduction pour familles.",
    correctAnswer: 'B',
  }));

  // Q4 — Programme visite guidée musée
  qs.push(q(4, 'Q1-7', null, {
    longText:
`MUSÉE D'HISTOIRE NATURELLE — VISITES GUIDÉES THÉMATIQUES

Programme du mois d'avril :

• Dinosaures et préhistoire — samedi 5 avril à 14 h | Durée : 1 h | Tarif : 6 €
• Minéraux et volcans — samedi 12 avril à 15 h | Durée : 1 h 15 | Tarif : 6 €
• Les insectes : un monde méconnu — dimanche 20 avril à 10 h | Durée : 45 min | Tarif : 5 €

Réservation obligatoire : reservation@museum-hn.fr
Gratuit pour les enfants de moins de 6 ans`,
    question: "Ce document présente principalement…",
    optionA: "les horaires d'ouverture du musée.",
    optionB: "le programme des visites guidées du musée.",
    optionC: "les tarifs annuels d'abonnement au musée.",
    optionD: "la collection permanente du musée.",
    correctAnswer: 'B',
  }));

  // Q5 — Horaires TER régional
  qs.push(q(5, 'Q1-7', null, {
    longText:
`TER RÉGIONAL — Ligne Nantes – Le Mans

Départ Nantes : 07 h 14 | Arrivée Le Mans : 08 h 47 — Du lundi au vendredi (hors jours fériés)
Départ Nantes : 08 h 02 | Arrivée Le Mans : 09 h 38 — Tous les jours
Départ Nantes : 12 h 30 | Arrivée Le Mans : 14 h 05 — Tous les jours
Départ Nantes : 17 h 45 | Arrivée Le Mans : 19 h 22 — Du lundi au vendredi

Tarif plein : 24,50 € | Carte Avantage : -30 %
Achat en ligne : ter.sncf.com`,
    question: "Ce document est…",
    optionA: "une facture de transport ferroviaire.",
    optionB: "une publicité pour le covoiturage.",
    optionC: "un horaire de train régional.",
    optionD: "un règlement de voyage en train.",
    correctAnswer: 'C',
  }));

  // Q6 — Annonce poste vendeur librairie
  qs.push(q(6, 'Q1-7', null, {
    longText:
`LA LIBRAIRIE DU PASSAGE — Recrutement

Nous recherchons un(e) vendeur(se) en librairie — CDI, temps plein

Profil : amoureux(se) de la lecture, à l'aise avec le conseil clientèle et la gestion de stock. Maîtrise de la caisse et des commandes fournisseurs souhaitée. Expérience en librairie ou en vente culturelle appréciée.

Avantages : prime annuelle, réduction de 30 % sur les achats en boutique, horaires fixes.

Candidature (CV + lettre de motivation) à envoyer à contact@librairie-passage.fr avant le 15 mai.`,
    question: "Ce document est principalement…",
    optionA: "une annonce de vente de livres d'occasion.",
    optionB: "une offre d'emploi dans une librairie.",
    optionC: "une publicité pour une promotion librairie.",
    optionD: "un programme de formation à la vente.",
    correctAnswer: 'B',
  }));

  // Q7 — Formulaire inscription association randonnée
  qs.push(q(7, 'Q1-7', null, {
    longText:
`ASSOCIATION RANDONNEURS DES CRÊTES — Bulletin d'inscription 2025-2026

Nom : _______________________ Prénom : _______________________
Date de naissance : ___/___/_____ Téléphone : _______________________
Email : _______________________ Niveau : ☐ Débutant ☐ Intermédiaire ☐ Confirmé

Cotisation annuelle : 35 € | Certificat médical de non contre-indication requis

À retourner avant le 30 septembre à : association.randonneurs@cretes.fr
ou en main propre lors de la réunion de rentrée (date communiquée par email)`,
    question: "Ce document est…",
    optionA: "un règlement intérieur d'association.",
    optionB: "une liste des randonnées prévues.",
    optionC: "un formulaire d'inscription à une association.",
    optionD: "un bon de commande de matériel de randonnée.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce formulaire doit être ___ au bureau de l'administration avant la fermeture des guichets.",
    question: PHRASE_Q,
    optionA: "présenté",
    optionB: "déposé",
    optionC: "consulté",
    optionD: "réclamé",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour accéder à la salle de réunion, veuillez vous ___ auprès de la réceptionniste.",
    question: PHRASE_Q,
    optionA: "inscrire",
    optionB: "identifier",
    optionC: "présenter",
    optionD: "diriger",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les travaux de rénovation de la route nationale ___ la circulation pendant trois semaines.",
    question: PHRASE_Q,
    optionA: "faciliteront",
    optionB: "provoqueront",
    optionC: "perturberont",
    optionD: "amélioreront",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le magasin sera exceptionnellement ___ ce dimanche à l'occasion de la fête des mères.",
    question: PHRASE_Q,
    optionA: "fermé",
    optionB: "complet",
    optionC: "ouvert",
    optionD: "déplacé",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour participer au concours, les candidats doivent ___ une œuvre originale avant le 31 mars.",
    question: PHRASE_Q,
    optionA: "vendre",
    optionB: "soumettre",
    optionC: "acheter",
    optionD: "corriger",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin a recommandé à son patient de ___ une activité physique régulière pour améliorer sa santé.",
    question: PHRASE_Q,
    optionA: "refuser",
    optionB: "éviter",
    optionC: "pratiquer",
    optionD: "interrompre",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La lecture est une activité essentielle pour le [14] intellectuel. Elle permet d'enrichir son vocabulaire, de développer sa capacité d'analyse et d'accéder à des [15] variées sur tous les sujets. Les experts recommandent de consacrer au moins trente minutes par jour à cette pratique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Les bienfaits de la lecture',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "repos",
    optionB: "développement",
    optionC: "divertissement",
    optionD: "isolement",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Les bienfaits de la lecture',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "erreurs",
    optionB: "connaissances",
    optionC: "dépenses",
    optionD: "contraintes",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La ville de Montréal est [16] pour son bilinguisme et sa diversité culturelle. Chaque année, des festivals internationaux de jazz, de cinéma et de comédie [17] des millions de visiteurs du monde entier dans ses rues animées.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Montréal, ville cosmopolite',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "critiquée",
    optionB: "oubliée",
    optionC: "reconnue",
    optionD: "éloignée",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Montréal, ville cosmopolite',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "effrayent",
    optionB: "accueillent",
    optionC: "oublient",
    optionD: "repoussent",
    correctAnswer: 'B',
  }));

  // Q18-21
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle recette est la plus rapide à préparer et à cuire ?",
    optionA: "Recette 1",
    optionB: "Recette 2",
    optionC: "Recette 3",
    optionD: "Recette 4",
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel véhicule est proposé au prix le moins élevé ?",
    optionA: "Voiture 1",
    optionB: "Voiture 2",
    optionC: "Voiture 3",
    optionD: "Voiture 4",
    correctAnswer: 'A',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle destination offre les températures les plus élevées en hiver ?",
    optionA: "Destination 1",
    optionB: "Destination 2",
    optionC: "Destination 3",
    optionD: "Destination 4",
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle formation se déroule entièrement à distance ?",
    optionA: "Formation 1",
    optionB: "Formation 2",
    optionC: "Formation 3",
    optionD: "Formation 4",
    correctAnswer: 'B',
  }));

  // Q22
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les températures de cette ville ne dépassent jamais onze degrés Celsius, même en plein été. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Programme de formation professionnelle continue",
    longText: DOC_FORMATION_CONTINUE,
    question: "Ce document présente principalement…",
    optionA: "une offre d'emploi dans un cabinet de conseil.",
    optionB: "un programme de formation pour les managers.",
    optionC: "une brochure de services informatiques.",
    optionD: "un règlement intérieur d'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Programme de formation professionnelle continue",
    longText: DOC_FORMATION_CONTINUE,
    question: "Selon ce document, cette formation peut être financée par…",
    optionA: "la sécurité sociale uniquement.",
    optionB: "le CPF ou les OPCO selon le secteur.",
    optionC: "une bourse gouvernementale spéciale.",
    optionD: "l'employeur obligatoirement.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Contrat de prestation de services informatiques",
    longText: DOC_CONTRAT_PRESTATION,
    question: "Ce document est principalement…",
    optionA: "une offre commerciale pour des logiciels.",
    optionB: "un contrat de prestation entre deux sociétés.",
    optionC: "un guide d'utilisation d'un système informatique.",
    optionD: "un règlement de litige entre partenaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Contrat de prestation de services informatiques",
    longText: DOC_CONTRAT_PRESTATION,
    question: "Selon ce contrat, en cas d'incident critique, l'intervention doit avoir lieu dans un délai de…",
    optionA: "une heure.",
    optionB: "4 heures ouvrées.",
    optionC: "48 heures.",
    optionD: "5 jours ouvrés.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Société Martin Industrie",
    longText: DOC_REGLEMENT_PME,
    question: "Ce document traite principalement des…",
    optionA: "avantages accordés aux salariés de l'entreprise.",
    optionB: "règles de comportement et d'organisation au travail.",
    optionC: "procédures de recrutement de nouveaux employés.",
    optionD: "conditions de départ à la retraite.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Société Martin Industrie",
    longText: DOC_REGLEMENT_PME,
    question: "Selon ce règlement, l'obligation de confidentialité s'applique…",
    optionA: "uniquement aux cadres de l'entreprise.",
    optionB: "seulement pendant la durée du contrat de travail.",
    optionC: "y compris après la fin du contrat de travail.",
    optionD: "exclusivement aux informations commerciales.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte qualité — Certification ISO 9001",
    longText: DOC_CHARTE_ISO,
    question: "L'objectif principal de cette charte est de…",
    optionA: "présenter les tarifs et offres commerciales de l'entreprise.",
    optionB: "décrire les engagements de l'entreprise en matière de qualité.",
    optionC: "définir les conditions d'embauche des salariés.",
    optionD: "informer les fournisseurs des exigences de livraison.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte qualité — Certification ISO 9001",
    longText: DOC_CHARTE_ISO,
    question: "Selon ce document, la certification ISO 9001 est renouvelée…",
    optionA: "chaque année par un organisme interne.",
    optionB: "tous les deux ans par la direction.",
    optionC: "tous les trois ans par un organisme extérieur accrédité.",
    optionD: "tous les cinq ans par le ministère de l'Industrie.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note d'information — Congés annuels et jours fériés légaux",
    longText: DOC_NOTE_CONGES,
    question: "Ce document informe principalement sur…",
    optionA: "les primes accordées aux salariés en cas d'heures supplémentaires.",
    optionB: "les droits des salariés en matière de congés payés.",
    optionC: "les procédures de licenciement en France.",
    optionD: "les conditions d'attribution des congés pour raison médicale.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note d'information — Congés annuels et jours fériés légaux",
    longText: DOC_NOTE_CONGES,
    question: "Selon ce document, combien de jours ouvrables de congés un salarié acquiert-il par mois ?",
    optionA: "2 jours",
    optionB: "2,5 jours",
    optionC: "3 jours",
    optionD: "5 jours",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Le changement climatique et l'agriculture africaine",
    longText: ART_CLIMAT_AFRIQUE,
    question: "Selon cet article, l'agriculture africaine est particulièrement menacée par…",
    optionA: "la surpopulation des zones rurales.",
    optionB: "les sécheresses, inondations et irrégularités des saisons des pluies.",
    optionC: "le manque de semences importées d'Europe.",
    optionD: "l'absence de politiques agricoles continentales.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Le changement climatique et l'agriculture africaine",
    longText: ART_CLIMAT_AFRIQUE,
    question: "L'auteur de l'article estime que l'aide internationale devrait évoluer vers…",
    optionA: "une aide d'urgence plus efficace et mieux coordonnée.",
    optionB: "des investissements structurels à long terme associant les communautés locales.",
    optionC: "un programme de transfert de technologies agricoles européennes.",
    optionD: "la suppression des barrières douanières sur les produits alimentaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'économie circulaire comme alternative à la société de consommation jetable",
    longText: ART_ECO_CIRCULAIRE,
    question: "Selon cet article, le modèle économique linéaire est caractérisé par…",
    optionA: "la transformation des déchets en ressources nouvelles.",
    optionB: "l'extraction, la fabrication, la vente et le rejet des produits.",
    optionC: "la réparation et le réemploi systématiques des produits.",
    optionD: "la réduction volontaire de la production industrielle.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'économie circulaire comme alternative à la société de consommation jetable",
    longText: ART_ECO_CIRCULAIRE,
    question: "D'après l'auteur, la transition vers l'économie circulaire nécessite notamment…",
    optionA: "une interdiction immédiate des produits à usage unique.",
    optionB: "une évolution des comportements des consommateurs.",
    optionC: "la fermeture des industries polluantes.",
    optionD: "une taxe internationale sur les déchets industriels.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La diversité en entreprise : obligation légale versus avantage compétitif réel",
    longText: ART_DIVERSITE,
    question: "Selon les recherches citées dans l'article, la diversité en entreprise…",
    optionA: "nuit à la cohésion des équipes de direction.",
    optionB: "améliore les performances financières des organisations.",
    optionC: "est uniquement bénéfique pour les grandes entreprises.",
    optionD: "remplace efficacement les formations professionnelles.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La diversité en entreprise : obligation légale versus avantage compétitif réel",
    longText: ART_DIVERSITE,
    question: "L'auteur souligne que la diversité sans inclusion peut être…",
    optionA: "suffisante pour améliorer les résultats financiers.",
    optionB: "contre-productive et mener au départ des collaborateurs minoritaires.",
    optionC: "une solution efficace contre la discrimination.",
    optionD: "la première étape vers une véritable transformation culturelle.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La crise du logement social dans les grandes métropoles françaises",
    longText: ART_LOGEMENT,
    question: "Selon cet article, quelle est la principale cause de la crise du logement social en France ?",
    optionA: "Le vieillissement du parc de logements sociaux existants.",
    optionB: "La demande croissante non satisfaite face à un parc saturé.",
    optionC: "La politique de loyers trop bas qui décourage les investisseurs.",
    optionD: "L'absence de lois encadrant les délais d'attribution.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La crise du logement social dans les grandes métropoles françaises",
    longText: ART_LOGEMENT,
    question: "L'auteur mentionne comme conséquence concrète de la crise du logement…",
    optionA: "une augmentation des prix de l'immobilier privé.",
    optionB: "une pénurie de main-d'œuvre dans des secteurs essentiels.",
    optionC: "un dépeuplement progressif des grandes villes.",
    optionD: "une hausse du taux de chômage dans les banlieues.",
    correctAnswer: 'B',
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
    console.log(`\n✅ ${created} questions créées pour CE 5.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
