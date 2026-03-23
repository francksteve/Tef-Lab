'use strict';
/**
 * seed-ce-serie19.js
 * Peuple la série CE 19 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie19.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoh10000f0wxlm6g0d1g0';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts ventes immobilières mensuelles ── */
function generateQ22SVG() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  // Graphique correct = A (pic en mars avec 2847 ventes, +34% vs janvier)
  const graphs = [
    { label: 'Graphique 1', data: [2120, 2380, 2847, 2650, 2540, 2430, 2280, 2100, 2300, 2450, 2200, 2050], color: '#003087' }, // CORRECT
    { label: 'Graphique 2', data: [1800, 1950, 2100, 2280, 2450, 2600, 2720, 2680, 2500, 2350, 2150, 1950], color: '#E30613' },
    { label: 'Graphique 3', data: [2500, 2450, 2400, 2350, 2300, 2200, 2100, 2000, 2100, 2200, 2300, 2400], color: '#E30613' },
    { label: 'Graphique 4', data: [1500, 1600, 1700, 1850, 2000, 2200, 2350, 2450, 2300, 2150, 1950, 1750], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 3000;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const stepX = plotW / (months.length - 1);

    const gridLines = [0, 1000, 2000, 3000].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v/1000}k</text>`;
    }).join('');

    const pointsStr = g.data.map((v, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `${px},${py}`;
    }).join(' ');

    const xLabels = months.map((m, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${m}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + xLabels +
           `<polyline points="${pointsStr}" fill="none" stroke="${g.color}" stroke-width="2"/>` +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Transactions/mois</text>`;
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
  { title: 'Contrat 1', content: "Le CDI (Contrat à Durée Indéterminée) est la forme normale du contrat de travail, sans date de fin fixée à l'avance. Il offre la plus grande stabilité à l'employé et peut être rompu à tout moment par l'une ou l'autre des parties, sous réserve de respecter le préavis légal ou conventionnel." },
  { title: 'Contrat 2', content: "Le contrat de professionnalisation est un contrat de travail en alternance destiné aux adultes en reconversion professionnelle (26 ans et plus). Il alterne périodes de travail en entreprise et formations qualifiantes. Sa durée est de 6 à 12 mois, parfois 24 mois selon la qualification visée." },
  { title: 'Contrat 3', content: "Le contrat saisonnier est un CDD conclu pour des emplois dont les tâches se répètent chaque année à des périodes déterminées (agriculture, tourisme, sports d'hiver). Sa durée est limitée à la saison concernée. Il peut être renouvelé chaque année avec le même employeur." },
  { title: 'Contrat 4', content: "Le contrat d'apprentissage est un contrat de formation en alternance destiné aux jeunes de 16 à 29 ans. Il associe formation pratique en entreprise et enseignement théorique dans un Centre de Formation d'Apprentis (CFA). Sa durée varie de 1 à 3 ans selon la qualification préparée." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Animal 1', content: "Le gorille est le plus grand primate vivant. Herbivore, il se nourrit principalement de feuilles, de tiges et de fruits. Il vit en groupes familiaux dans les forêts tropicales d'Afrique centrale. C'est une espèce en danger critique d'extinction due à la déforestation et au braconnage." },
  { title: 'Animal 2', content: "Le panda géant est un mammifère emblématique de Chine, classé espèce vulnérable. Son régime alimentaire est composé à 99 % de bambou, bien qu'il soit physiologiquement un carnivore. Sa reproduction en captivité est très difficile, ce qui en fait l'une des espèces les plus délicates à conserver en zoo." },
  { title: 'Animal 3', content: "Le lion est un grand félin sociable qui vit en groupes familiaux (troupes) dans les savanes africaines. Carnivore, il chasse en groupe. Son statut est classé vulnérable. En zoo, il nécessite de vastes enclos et une alimentation carnée diversifiée pour maintenir sa santé." },
  { title: 'Animal 4', content: "Le koala est un marsupial australien qui se nourrit exclusivement de feuilles d'eucalyptus, très toxiques pour la plupart des autres espèces. Il dort jusqu'à 20 heures par jour pour digérer cet aliment pauvre en nutriments. Son maintien en zoo hors d'Australie est très difficile." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Logement 1', content: "La maison individuelle est une habitation détachée sur sa propre parcelle de terrain. Elle offre jardin privatif, garage et une grande autonomie vis-à-vis des voisins. Elle représente le mode d'habitation préféré des Français mais est coûteuse à l'achat et consommatrice d'espace." },
  { title: 'Logement 2', content: "L'appartement est un logement situé dans un immeuble collectif, occupant tout ou partie d'un niveau. Il varie du studio (une seule pièce) au grand appartement familial. La copropriété implique des charges communes pour l'entretien des parties partagées." },
  { title: 'Logement 3', content: "Le loft est un grand espace industriel (entrepôt, usine, atelier) reconverti en habitation. Il se caractérise par de grandes hauteurs sous plafond, de larges fenêtres, des espaces ouverts et une décoration volontairement industrielle. Très prisé dans les quartiers urbains en reconversion." },
  { title: 'Logement 4', content: "La résidence étudiante est un ensemble de logements meublés et équipés destinés aux étudiants, géré par un opérateur public (CROUS) ou privé. Elle propose des services collectifs (laverie, salle commune, WiFi) et des loyers généralement inférieurs au marché privé." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Procédé 1', content: "La cuisson à la vapeur consiste à cuire les aliments dans la vapeur d'eau bouillante, sans contact direct avec le liquide. Elle préserve les vitamines et minéraux, réduit les matières grasses et maintient la texture et les couleurs des légumes. Méthode saine et simple." },
  { title: 'Procédé 2', content: "La salaison est une technique de conservation alimentaire ancienne qui consiste à exposer des aliments (viandes, poissons, fromages) à du sel. Le sel déshydrate les cellules bactériennes et inhibe la prolifération microbienne, permettant une conservation prolongée." },
  { title: 'Procédé 3', content: "La fermentation est un processus de transformation alimentaire dans lequel des micro-organismes (bactéries, levures, moisissures) transforment les sucres et protéines en acides organiques, alcool ou gaz. Pain, fromage, yaourt, vin et choucroute en sont des exemples courants." },
  { title: 'Procédé 4', content: "La pasteurisation est un traitement thermique modéré qui consiste à chauffer un aliment à une température déterminée pour détruire les micro-organismes pathogènes sans altérer ses qualités nutritionnelles. Elle est utilisée pour le lait, les jus de fruits et certaines bières." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_COPRO =
`RÈGLEMENT DE COPROPRIÉTÉ — RÉSIDENCE BELLE-VUE

ARTICLE 1 : Les parties communes (entrées, couloirs, ascenseurs, parkings visiteurs) sont à l'usage de tous les résidents et visiteurs. Leur utilisation doit rester dans les limites de leur destination normale.

ARTICLE 2 : Les travaux dans les parties privatives susceptibles de toucher les parties communes ou la structure du bâtiment nécessitent une autorisation préalable du syndic, obtenue par demande écrite 3 semaines avant le début des travaux.

ARTICLE 3 : Les ordures ménagères doivent être déposées dans les containers désignés dans les horaires définis (18 h-22 h les jours ouvrables). Les encombrants sont à réserver via le service municipal au moins 48 h à l'avance.

ARTICLE 4 : Les animaux domestiques sont tolérés à condition de ne pas causer de nuisances. Les propriétaires sont responsables des dommages causés par leurs animaux dans les parties communes.`;

const DOC_OFFRE_EMPLOI_IMMO =
`OFFRE D'EMPLOI — GESTIONNAIRE IMMOBILIER (H/F)

Cabinet de gestion immobilière, gérant un parc de 2 500 logements, recrute un(e) gestionnaire pour son agence principale.

MISSIONS : Gestion administrative et technique des biens (rédaction des baux, états des lieux, suivi des travaux, gestion des sinistres), relation avec les propriétaires et les locataires, suivi des impayés et des procédures contentieuses, reporting mensuel.

PROFIL : BTS Professions Immobilières ou licence professionnelle en gestion immobilière. 2 ans d'expérience minimum. Maîtrise du logiciel ICS. Qualités relationnelles, rigueur et autonomie.

CONDITIONS : CDI, temps plein. Rémunération : 2 200-2 600 €/mois. Prime de performance trimestrielle.`;

const DOC_CONTRAT_CDI =
`EXTRAIT DE CONTRAT DE TRAVAIL — CDI

Entre : Société TECHPRO SOLUTIONS (l'Employeur)
Et : M. Jean-Baptiste NGUESSO (le Salarié)

POSTE : Développeur informatique senior
STATUT : Cadre
DATE DE DÉBUT : 1er septembre 2025
PÉRIODE D'ESSAI : 3 mois renouvelable une fois

RÉMUNÉRATION : 3 800 € bruts/mois
HORAIRES : 39 heures/semaine, flexibles entre 8 h et 19 h

AVANTAGES : Mutuelle santé prise en charge à 60 % par l'employeur. Titres-restaurant 9 €/jour (60 % employeur). Participation et intéressement selon accord d'entreprise. RTT : 18 jours/an.`;

const DOC_CHARTE_ZOO =
`CHARTE DU BIEN-ÊTRE ANIMAL — PARC ZOOLOGIQUE ANIMALIA

Le Parc Zoologique Animalia s'engage à respecter et promouvoir le bien-être de l'ensemble des animaux sous sa garde, conformément aux cinq libertés fondamentales du bien-être animal.

ENGAGEMENT 1 : Alimentation adaptée à chaque espèce, reproduisant au maximum le régime naturel. Supervision vétérinaire quotidienne.

ENGAGEMENT 2 : Environnements enrichis reproduisant les comportements naturels (nidification, fouissage, grimper, nager). Surface minimale des enclos définie par espèce.

ENGAGEMENT 3 : Zéro contention inutile. Soins vétérinaires réalisés avec le minimum de stress pour l'animal, par du personnel formé au handling.

ENGAGEMENT 4 : Programme de conservation — participation à 12 programmes européens de reproduction (EEP) d'espèces menacées.`;

const DOC_GUIDE_NUTRITION =
`GUIDE DE NUTRITION ÉQUILIBRÉE — Institut de Diététique Française

LES 5 CLÉS D'UNE ALIMENTATION ÉQUILIBRÉE :

1. DIVERSITÉ : Consommez chaque jour des aliments de tous les groupes (fruits et légumes, céréales, protéines, produits laitiers, matières grasses).

2. PROPORTIONS : La moitié de votre assiette en légumes et fruits, un quart en féculents, un quart en protéines.

3. HYDRATATION : 1,5 à 2 L d'eau par jour minimum. Les boissons sucrées et l'alcool ne remplacent pas l'eau.

4. MODÉRATION : Limiter le sel (< 6 g/jour), les sucres ajoutés (< 50 g/jour) et les graisses saturées.

5. RÉGULARITÉ : 3 repas par jour, en évitant le grignotage. Le petit-déjeuner reste important pour les enfants et les personnes actives.`;

/* ── Articles de presse Q33-40 ── */
const ART_LOGEMENT_NEUF =
`LA CRISE DU LOGEMENT ET LA CONSTRUCTION NEUVE : QUAND LE REMÈDE TARDE À AGIR

Face à la pénurie de logements qui frappe la plupart des grandes agglomérations françaises, la construction neuve est présentée comme la réponse structurelle incontournable. Pourtant, les chiffres de mises en chantier sont en recul depuis plusieurs années, signant l'incapacité du système actuel à produire suffisamment de logements pour répondre à la demande.

Les obstacles sont nombreux. La hausse des taux d'intérêt depuis 2022 a lourdement pesé sur la solvabilité des acheteurs et réduit les marges des promoteurs immobiliers. Le coût des matériaux de construction a augmenté de 20 à 30 % entre 2020 et 2023, alourdi les prix et réduit la rentabilité des opérations. Les procédures d'urbanisme restent longues et complexes, allongeant les délais entre le dépôt d'un permis de construire et la livraison d'un logement.

Paradoxalement, la France dispose de ressources foncières importantes dans ses villes moyennes et ses couronnes périurbaines. Le défi n'est pas tant la disponibilité du foncier que sa mobilisation effective, qui nécessite une volonté politique locale souvent absente. De nombreuses communes refusent les constructions de logements sociaux ou denses par crainte de modifier leur profil socio-démographique.

Le débat sur la densification et le renouvellement urbain s'est imposé comme une nécessité : plutôt que d'étaler les villes sur des terres agricoles (artificialisation des sols), il faut construire sur les friches industrielles, surélever les immeubles existants et transformer les bureaux vacants en logements. Ces solutions, moins consensuelles politiquement, sont pourtant celles que les experts préconisent.`;

const ART_DROITS_TRAVAILLEURS =
`DROITS DES TRAVAILLEURS ET FLEXIBILITÉ : UNE TENSION PERMANENTE

Le droit du travail est un champ de tension permanent entre deux logiques contradictoires : la protection des salariés face aux aléas du marché et la flexibilité que réclament les employeurs pour s'adapter aux mutations économiques. Cette tension, présente dans toutes les économies de marché, s'est accentuée avec la mondialisation, la montée de l'économie des plateformes et les crises économiques successives.

Les partisans d'une flexibilisation du droit du travail avancent que des régulations trop rigides freinent les embauches, découragent les investissements et réduisent la compétitivité des entreprises face à des concurrents opérant dans des cadres réglementaires moins contraignants. Des études économiques montrent que certains pays avec des marchés du travail plus flexibles présentent des taux de chômage plus faibles.

Les défenseurs des protections sociales soulignent que la flexibilité se traduit dans les faits par une précarisation croissante : multiplication des CDD et des contrats à temps partiel imposés, développement du travail indépendant sans filet de sécurité sociale, transfert des risques économiques des entreprises vers les travailleurs. La sécurité au travail, les congés payés, la protection contre le licenciement abusif sont des conquêtes sociales qu'il serait illusoire de considérer comme des acquis intouchables.

La solution pourrait résider dans le modèle de flexisécurité développé par les pays nordiques : des contrats flexibles combinés à une forte protection chômage et à des politiques actives de formation et de réinsertion. Ce modèle suppose des investissements publics importants et un dialogue social de qualité, deux conditions difficiles à réunir dans des contextes de contrainte budgétaire.`;

const ART_CONSERVATION_ESPECES =
`LA CONSERVATION DES ESPÈCES EN CAPTIVITÉ : UN RÔLE AMBIVALENT POUR LES ZOOS

Les zoos modernes se présentent comme des arches de Noé pour les espèces menacées. Derrière leur image de divertissement, de nombreux établissements participent à des programmes de reproduction en captivité qui ont sauvé des espèces de l'extinction. Le condor de Californie, réduit à 27 individus en 1987, compte aujourd'hui plus de 500 spécimens grâce à ces programmes. Le cheval de Przewalski a lui aussi été réintroduit dans son habitat naturel après des décennies d'élevage exclusif en captivité.

Ces succès sont réels mais restent marginaux par rapport à l'ampleur de la crise d'extinction en cours. Le Groupe de spécialistes des ressources animales de l'UICN estime que les zoos du monde entier ne peuvent accueillir que quelques milliers d'espèces, sur les millions d'espèces animales existantes. La conservation ex situ (en dehors du milieu naturel) ne peut donc pas se substituer à la conservation in situ (dans l'habitat naturel), qui reste la priorité absolue.

Les critiques des zoos soulèvent des questions éthiques fondamentales. Le maintien d'animaux sauvages dans des espaces confinés, aussi bien conçus soient-ils, répond-il à leurs besoins physiologiques et psychologiques ? Les éléphants, les grands cétacés et les grands singes, aux besoins spatiaux et sociaux immenses, sont particulièrement mal adaptés à la captivité.

Les zoos du XXIe siècle cherchent à répondre à ces critiques en réduisant les collections aux espèces pour lesquelles ils peuvent garantir un bien-être satisfaisant et une utilité pour la conservation. La tendance est à la spécialisation plutôt qu'à l'exhaustivité, et au renforcement des partenariats avec les pays d'origine des espèces.`;

const ART_DIVERTISSEMENT_NUMERIQUE =
`L'INDUSTRIE DU DIVERTISSEMENT NUMÉRIQUE : UNE CROISSANCE SANS LIMITE EN VUE ?

L'industrie du divertissement numérique est l'une des plus dynamiques de l'économie mondiale. Jeux vidéo, streaming vidéo et musical, podcasts, esports, réalité virtuelle et augmentée : le secteur pèse plusieurs centaines de milliards de dollars et continue de croître à un rythme soutenu, porté par la démocratisation des smartphones et l'amélioration des connexions internet.

Le jeu vidéo est devenu en quelques décennies la première industrie culturelle mondiale en termes de chiffre d'affaires, dépassant le cinéma et la musique réunis. Les jeux mobiles, accessibles sur tout smartphone, ont ouvert le marché à des milliards de joueurs dans les pays émergents. Les modèles économiques se sont diversifiés : vente traditionnelle, abonnements, free-to-play avec achats intégrés, NFT dans les jeux blockchain.

Les préoccupations sociétales se multiplient. La dépendance aux jeux vidéo et aux réseaux sociaux est reconnue comme un problème de santé publique par l'Organisation Mondiale de la Santé. Les mécanismes de monétisation (loot boxes, pass saisonniers) sont assimilés par certains régulateurs à des jeux d'argent et font l'objet de régulations croissantes. La protection des mineurs dans ces environnements numériques reste un défi non résolu.

L'avenir du divertissement numérique s'oriente vers des expériences toujours plus immersives et personnalisées. Le métavers, la réalité virtuelle sociale et l'IA générative dans les jeux promettent des mondes virtuels dynamiques et adaptatifs. Mais ces innovations posent aussi des questions inédites sur l'identité numérique, le temps d'écran et les frontières entre le réel et le virtuel.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche zoo
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ZOO SAFARI PARC — BIENVENUE DANS L'AVENTURE ANIMALE !

ANIMAUX PHARES : Girafes, lions, éléphants, hippopotames, rhinocéros, chimpanzés, pingouins.

HORAIRES : 9 h – 19 h (avril – octobre) | 9 h – 17 h 30 (novembre – mars)

TARIFS : Adulte 24 € | Enfant (3-11 ans) 16 € | Gratuit – 3 ans
Pass famille (2 adultes + 2 enfants) : 68 €

RÈGLES DE VISITE :
• Ne pas nourrir les animaux — stictement interdit
• Ne pas crier ni taper sur les vitres des enclos
• Suivre les consignes des soigneurs
• Animaux domestiques interdits

Safari en jeep : 10 € supplémentaires — Réservation à l'accueil`,
    question: "Selon l'affiche, comment peut-on faire le safari en jeep ?",
    optionA: "C'est compris dans le prix d'entrée.",
    optionB: "Il faut payer 10 € supplémentaires et réserver à l'accueil.",
    optionC: "Il faut réserver en ligne avant la visite.",
    optionD: "Il est gratuit pour les enfants de moins de 3 ans.",
    correctAnswer: 'B',
  }));

  // Q2 — Petite annonce achat appartement
  qs.push(q(2, 'Q1-7', null, {
    longText:
`RECHERCHE — Appartement à acheter — Nantes

Famille de 4 personnes cherche appartement dans Nantes intra-muros ou première couronne.

CRITÈRES SOUHAITÉS :
• Surface : 90 m² minimum
• Nombre de pièces : 4 (3 chambres + séjour)
• Parking ou garage indispensable
• Proximité transport en commun (bus, tram)
• Budget maximum : 320 000 € FAI

PAS INTÉRESSÉ(E) par : rez-de-chaussée, logement avec travaux lourds, syndic défaillant.
Contact : M. et Mme Delacroix — delacroix.achat@gmail.com — réponse garantie sous 24 h`,
    question: "Cette annonce cherche…",
    optionA: "un appartement à louer en urgence.",
    optionB: "un appartement à acheter selon des critères précis.",
    optionC: "un terrain constructible pour construire une maison.",
    optionD: "une maison individuelle avec grand jardin.",
    correctAnswer: 'B',
  }));

  // Q3 — Extrait contrat travail
  qs.push(q(3, 'Q1-7', null, {
    longText:
`EXTRAIT DE CONTRAT DE TRAVAIL — CLAUSES PRINCIPALES

DURÉE : Le présent contrat est conclu pour une durée indéterminée. Il prend effet à la date d'entrée en fonction convenue entre les parties.

CLAUSE DE NON-CONCURRENCE : À la rupture du contrat, quelle qu'en soit la cause, le salarié s'engage à ne pas exercer d'activité similaire pour un concurrent direct pendant une durée de 12 mois. En contrepartie, l'employeur versera une indemnité mensuelle de 30 % du salaire brut moyen.

CLAUSE DE CONFIDENTIALITÉ : Le salarié s'engage à maintenir strictement confidentiels tous les renseignements d'ordre technique, commercial ou stratégique de l'entreprise, pendant et après l'exécution du contrat.`,
    question: "Ce document est…",
    optionA: "Un règlement intérieur d'entreprise.",
    optionB: "Un extrait de contrat de travail avec des clauses spécifiques.",
    optionC: "Une convention collective de branche.",
    optionD: "Un accord d'entreprise sur le temps de travail.",
    correctAnswer: 'B',
  }));

  // Q4 — Programme spectacle divertissement
  qs.push(q(4, 'Q1-7', null, {
    longText:
`CIRQUE NATIONAL FANTASTIA — Programme de la soirée

SAMEDI 15 NOVEMBRE — Chapiteau du Champ-de-Mars

20 h 00 : Accueil et installation du public
20 h 30 : PREMIÈRE PARTIE
  • Acrobates aériens — Duo des frères Volkov (Russie)
  • Jongleur de feu — Carlos Mendez (Espagne)
  • Clown interlude — Professor Bubbles (France)
21 h 30 : Entracte (20 minutes)
21 h 50 : DEUXIÈME PARTIE
  • Dressage équestre — Les Amazones de Budapest
  • Grand final : Pyramide humaine — Compagnie internationale (30 artistes)

Durée totale : 2 h 30 avec entracte
Tarifs : Orchestre 45 € | Gradins 25 €`,
    question: "Selon ce programme, l'entracte a lieu à…",
    optionA: "20 h 30.",
    optionB: "21 h 00.",
    optionC: "21 h 30.",
    optionD: "21 h 50.",
    correctAnswer: 'C',
  }));

  // Q5 — Mode d'emploi balance culinaire
  qs.push(q(5, 'Q1-7', null, {
    longText:
`BALANCE CULINAIRE PRÉCISION PLUS — GUIDE RAPIDE

MISE EN MARCHE : Appuyez sur ON/OFF. La balance s'éteint automatiquement après 3 minutes d'inactivité.

TARE : Posez un récipient vide sur le plateau, puis appuyez sur TARE pour remettre à zéro. Vous pouvez alors peser votre ingrédient net.

UNITÉS : Appuyez sur UNIT pour changer l'unité de mesure : grammes (g), onces (oz), millilitres (ml pour liquides).

CAPACITÉ : 5 kg maximum — précision 1 g.

⚠ Ne pas peser d'aliments chauds directement sur le plateau. Nettoyer avec un chiffon humide uniquement.`,
    question: "Selon ce guide, la fonction TARE sert à…",
    optionA: "convertir les grammes en onces.",
    optionB: "remettre la balance à zéro avec un récipient posé dessus.",
    optionC: "mettre en marche la balance.",
    optionD: "afficher la température de l'aliment.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué recherche scientifique
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — INSTITUT NATIONAL DE RECHERCHE MÉDICALE (INRM)

AVANCÉE SIGNIFICATIVE EN ONCOLOGIE

Les équipes du laboratoire de biologie cellulaire de l'INRM annoncent une avancée prometteuse dans le traitement du cancer du poumon non à petites cellules.

Les chercheurs ont identifié une cible thérapeutique jusqu'ici inconnue : la protéine MYC-7. Des essais précliniques sur modèles murins montrent une réduction de 67 % des tumeurs après 8 semaines de traitement avec le composé expérimental LY-42.

La phase 1 des essais cliniques chez l'humain débutera au premier trimestre 2026 dans 5 centres hospitaliers partenaires.

Ces résultats ont été publiés dans la revue Nature Medicine.`,
    question: "Ce communiqué annonce…",
    optionA: "La commercialisation imminente d'un nouveau médicament contre le cancer.",
    optionB: "Une avancée de recherche préclinique en oncologie.",
    optionC: "La guérison définitive d'un type de cancer du poumon.",
    optionD: "Le lancement d'une campagne de dépistage du cancer.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation fête de quartier
  qs.push(q(7, 'Q1-7', null, {
    longText:
`ASSOCIATION LES VOISINS EN FÊTE
vous invite chaleureusement à la

FÊTE DE QUARTIER — 12e ÉDITION
Samedi 21 juin — À partir de 17 h 00
Esplanade des Lilas — Rue de la Paix

Au programme :
• Jeux pour enfants (17 h-20 h)
• Concert de musiques du monde (20 h 30)
• Repas partagé — chacun apporte un plat de son choix (19 h 00)
• Tombola avec lots offerts par les commerçants locaux

GRATUIT — Ouvert à tous les habitants du quartier
Inscription souhaitée pour le repas : contact@voisinsenfete.fr`,
    question: "Selon cette invitation, pour le repas partagé, les participants doivent…",
    optionA: "Payer 10 € par personne.",
    optionB: "Apporter un plat de leur choix.",
    optionC: "S'inscrire et payer à l'avance.",
    optionD: "Commander auprès du traiteur de l'association.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'agent immobilier a évalué la ___ totale de l'appartement à 87 m², incluant le balcon comptabilisé à moitié.",
    question: PHRASE_Q,
    optionA: "superficie",
    optionB: "longueur",
    optionC: "dimension",
    optionD: "capacité",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le nouveau ___ de travail prévoit une augmentation de 5 % du salaire brut mensuel à partir du 1er janvier.",
    question: PHRASE_Q,
    optionA: "règlement",
    optionB: "avenant",
    optionC: "contrat",
    optionD: "bulletin",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les scientifiques ont mené une ___ sur plusieurs années pour comprendre l'impact du réchauffement climatique sur les coraux.",
    question: PHRASE_Q,
    optionA: "campagne",
    optionB: "observation",
    optionC: "expérience",
    optionD: "démonstration",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ de base de ce plat régional comprend de la farine, des œufs, du beurre et du lait entier, proportions équilibrées pour une texture parfaite.",
    question: PHRASE_Q,
    optionA: "préparation",
    optionB: "recette",
    optionC: "liste d'ingrédients",
    optionD: "composition",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le zoo a aménagé un nouvel ___ naturel pour ses pandas géants, reproduisant les forêts de bambous de leur région d'origine.",
    question: PHRASE_Q,
    optionA: "habitat",
    optionB: "parc",
    optionC: "territoire",
    optionD: "espace",
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La troupe théâtrale donnera sa première ___ en avant-première pour les abonnés avant l'ouverture officielle au grand public.",
    question: PHRASE_Q,
    optionA: "présentation",
    optionB: "représentation",
    optionC: "séance",
    optionD: "performance",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La génétique moderne a bouleversé notre compréhension du vivant. Le [14] est l'unité fondamentale de l'hérédité, porteur de l'information qui détermine nos caractéristiques biologiques. Une [15] de ce code génétique peut provoquer des maladies ou, au contraire, conférer un avantage adaptatif à l'individu.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La génétique moderne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "chromosome",
    optionB: "gène",
    optionC: "ADN",
    optionD: "cellule",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La génétique moderne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "duplication",
    optionB: "erreur",
    optionC: "mutation",
    optionD: "variation",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le marché immobilier français est soumis à une forte tension entre [16] et [17]. Dans les grandes métropoles, le nombre d'appartements disponibles ne suffit pas à satisfaire les besoins des acheteurs et des locataires, ce qui entraîne une hausse continue des prix depuis plusieurs années.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le marché immobilier en tension",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "acheteurs",
    optionB: "offre",
    optionC: "prix",
    optionD: "construction",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le marché immobilier en tension",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "budget",
    optionB: "investissement",
    optionC: "demande",
    optionD: "réglementation",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel contrat de travail associe formation pratique en entreprise et enseignement en CFA pour les jeunes ?",
    optionA: "Contrat 1",
    optionB: "Contrat 2",
    optionC: "Contrat 3",
    optionD: "Contrat 4",
    correctAnswer: 'D',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel animal de zoo a un régime alimentaire composé à 99 % de bambou et est en danger critique ?",
    optionA: "Animal 1",
    optionB: "Animal 2",
    optionC: "Animal 3",
    optionD: "Animal 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel type de logement est un grand espace industriel reconverti en habitation ?",
    optionA: "Logement 1",
    optionB: "Logement 2",
    optionC: "Logement 3",
    optionD: "Logement 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel procédé culinaire utilise des micro-organismes pour transformer les aliments ?",
    optionA: "Procédé 1",
    optionB: "Procédé 2",
    optionC: "Procédé 3",
    optionD: "Procédé 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le marché immobilier de la région capitale a atteint son pic de transactions en mars avec 2 847 ventes, soit 34 % de plus qu'en janvier. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Belle-Vue",
    longText: DOC_REGLEMENT_COPRO,
    question: "Selon le règlement, pour effectuer des travaux touchant les parties communes, il faut…",
    optionA: "Informer les voisins directs par écrit.",
    optionB: "Obtenir une autorisation du syndic 3 semaines à l'avance.",
    optionC: "Voter la décision lors de l'assemblée générale.",
    optionD: "Déposer une déclaration en mairie.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Belle-Vue",
    longText: DOC_REGLEMENT_COPRO,
    question: "D'après le règlement, la dépose des ordures est autorisée…",
    optionA: "À toute heure dans les containers désignés.",
    optionB: "Uniquement de 18 h à 22 h les jours ouvrables.",
    optionC: "Avant 9 h le matin pour le ramassage.",
    optionD: "Le samedi uniquement pour les déchets lourds.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Gestionnaire immobilier",
    longText: DOC_OFFRE_EMPLOI_IMMO,
    question: "Ce poste inclut notamment la gestion de…",
    optionA: "La construction de nouveaux programmes immobiliers.",
    optionB: "La relation avec les propriétaires et locataires et le suivi des impayés.",
    optionC: "La prospection de nouveaux clients investisseurs.",
    optionD: "La promotion des biens immobiliers sur internet.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Gestionnaire immobilier",
    longText: DOC_OFFRE_EMPLOI_IMMO,
    question: "Parmi les conditions proposées dans cette offre, on trouve…",
    optionA: "Un véhicule de fonction.",
    optionB: "Une prime de performance trimestrielle.",
    optionC: "Des tickets restaurant.",
    optionD: "Un 13e mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Extrait de contrat de travail CDI — TechPro Solutions",
    longText: DOC_CONTRAT_CDI,
    question: "Selon ce contrat, quelle est la durée de la période d'essai ?",
    optionA: "1 mois renouvelable une fois.",
    optionB: "3 mois renouvelables une fois.",
    optionC: "6 mois non renouvelables.",
    optionD: "2 semaines pour un cadre.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Extrait de contrat de travail CDI — TechPro Solutions",
    longText: DOC_CONTRAT_CDI,
    question: "Selon ce contrat, combien de RTT le salarié bénéficie-t-il par an ?",
    optionA: "10 jours.",
    optionB: "15 jours.",
    optionC: "18 jours.",
    optionD: "25 jours.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte du bien-être animal — Zoo Animalia",
    longText: DOC_CHARTE_ZOO,
    question: "Selon la charte, à combien de programmes européens de reproduction le zoo participe-t-il ?",
    optionA: "5 programmes EEP.",
    optionB: "8 programmes EEP.",
    optionC: "12 programmes EEP.",
    optionD: "20 programmes EEP.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte du bien-être animal — Zoo Animalia",
    longText: DOC_CHARTE_ZOO,
    question: "Selon la charte, concernant les soins vétérinaires, le zoo s'engage à…",
    optionA: "Réaliser tous les soins sous anesthésie générale.",
    optionB: "Les effectuer avec le minimum de stress pour l'animal.",
    optionC: "Faire appel à des vétérinaires extérieurs uniquement.",
    optionD: "Refuser toute contention pour les espèces protégées.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide de nutrition équilibrée — Institut de Diététique Française",
    longText: DOC_GUIDE_NUTRITION,
    question: "Selon ce guide, quelle proportion de l'assiette doit être consacrée aux légumes et fruits ?",
    optionA: "Un quart de l'assiette.",
    optionB: "Un tiers de l'assiette.",
    optionC: "La moitié de l'assiette.",
    optionD: "Les trois quarts de l'assiette.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide de nutrition équilibrée — Institut de Diététique Française",
    longText: DOC_GUIDE_NUTRITION,
    question: "Selon le guide, la consommation quotidienne de sel recommandée est…",
    optionA: "Moins de 3 g par jour.",
    optionB: "Moins de 6 g par jour.",
    optionC: "Entre 5 et 10 g par jour.",
    optionD: "Moins de 15 g par jour.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La crise du logement et la construction neuve",
    longText: ART_LOGEMENT_NEUF,
    question: "Selon l'article, de combien le coût des matériaux de construction a-t-il augmenté entre 2020 et 2023 ?",
    optionA: "De 5 à 10 %.",
    optionB: "De 10 à 15 %.",
    optionC: "De 20 à 30 %.",
    optionD: "De 40 à 50 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La crise du logement et la construction neuve",
    longText: ART_LOGEMENT_NEUF,
    question: "Quelle solution les experts recommandent-ils pour répondre à la crise du logement ?",
    optionA: "L'extension des villes sur les terres agricoles.",
    optionB: "La construction sur les friches industrielles et la densification urbaine.",
    optionC: "La baisse des normes de construction pour réduire les coûts.",
    optionD: "La limitation du nombre d'habitants dans les grandes métropoles.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Droits des travailleurs et flexibilité",
    longText: ART_DROITS_TRAVAILLEURS,
    question: "Quel modèle l'article présente comme une piste de solution équilibrée ?",
    optionA: "Le modèle américain de flexibilité totale.",
    optionB: "Le modèle de flexisécurité des pays nordiques.",
    optionC: "Le modèle français de protection maximale.",
    optionD: "Le modèle asiatique de gestion collective.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Droits des travailleurs et flexibilité",
    longText: ART_DROITS_TRAVAILLEURS,
    question: "Selon l'article, à quoi la flexibilisation du droit du travail conduit-elle en pratique ?",
    optionA: "À une augmentation des salaires dans les secteurs concurrentiels.",
    optionB: "À une précarisation croissante des travailleurs.",
    optionC: "À une réduction significative du chômage.",
    optionD: "À une meilleure compétitivité de toutes les entreprises.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La conservation des espèces en captivité",
    longText: ART_CONSERVATION_ESPECES,
    question: "Selon l'article, combien de condors de Californie restait-il en 1987 ?",
    optionA: "10 individus.",
    optionB: "27 individus.",
    optionC: "50 individus.",
    optionD: "100 individus.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La conservation des espèces en captivité",
    longText: ART_CONSERVATION_ESPECES,
    question: "L'article conclut que la tendance des zoos du XXIe siècle est à…",
    optionA: "L'augmentation du nombre d'espèces conservées.",
    optionB: "La spécialisation plutôt qu'à l'exhaustivité.",
    optionC: "La suppression des zoos au profit des réserves naturelles.",
    optionD: "L'ouverture de mégazoos accueillant toutes les espèces menacées.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'industrie du divertissement numérique",
    longText: ART_DIVERTISSEMENT_NUMERIQUE,
    question: "Selon l'article, le jeu vidéo est devenu la première industrie culturelle mondiale en dépassant…",
    optionA: "Le cinéma seul.",
    optionB: "La musique seule.",
    optionC: "Le cinéma et la musique réunis.",
    optionD: "La télévision et la presse réunies.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'industrie du divertissement numérique",
    longText: ART_DIVERTISSEMENT_NUMERIQUE,
    question: "L'OMS a reconnu comme problème de santé publique…",
    optionA: "La surexposition aux écrans en général.",
    optionB: "La dépendance aux jeux vidéo et aux réseaux sociaux.",
    optionC: "Les troubles visuels liés aux smartphones.",
    optionD: "La sédentarité liée au divertissement numérique.",
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
    console.log(`\n✅ ${created} questions créées pour CE 19.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
