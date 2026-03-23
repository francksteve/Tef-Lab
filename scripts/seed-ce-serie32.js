'use strict';
/**
 * seed-ce-serie32.js
 * Peuple la série CE 32 avec 40 questions TEF Canada officielles.
 * Thèmes : géologie, théâtre de rue, droit fiscal, cuisine africaine,
 *          robotique médicale, sport féminin, bibliothèque numérique
 * Usage : node scripts/seed-ce-serie32.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyojh7000s0wxlextd9k74';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART — médailles d'or athlétisme féminin ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [12, 8, 15, 10], color: '#E30613' },
    { label: 'Graphique 2', data: [9, 14, 11, 18],  color: '#E30613' },
    { label: 'Graphique 3', data: [23, 15, 10, 8],  color: '#003087' }, // CORRECT — athlétisme féminin 23 titres
    { label: 'Graphique 4', data: [8, 18, 14, 12],  color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Athlét.', 'Natation', 'Judo', 'Cyclisme'];
  const maxVal = 30;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 10, 20, 30].map(v => {
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
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Médailles d'or</text>`;
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
  { title: 'Texte 1', content: "Le granite est une roche magmatique plutonique, formée par le refroidissement lent du magma en profondeur. Sa texture grenue, visible à l'œil nu, révèle de grands cristaux de quartz, de feldspath et de mica. Il constitue l'essentiel des socles continentaux anciens et est largement utilisé en construction." },
  { title: 'Texte 2', content: "L'obsidienne est une roche volcanique vitreuse noire formée par le refroidissement très rapide de la lave en surface. Sa cassure conchoïdale produit des arêtes extrêmement tranchantes, ce qui en a fait un matériau de choix pour la fabrication d'outils tranchants depuis la préhistoire. On la trouve près des volcans actifs ou éteints." },
  { title: 'Texte 3', content: "Le calcaire est une roche sédimentaire constituée principalement de carbonate de calcium, souvent d'origine marine. Il se forme par accumulation de coquilles et squelettes d'organismes marins au fond des océans. Les paysages karstiques, avec leurs grottes et leurs lapiaz, résultent de la dissolution progressive du calcaire par les eaux de pluie acidulées." },
  { title: 'Texte 4', content: "Le basalte est une roche volcanique effusive sombre, formée par le refroidissement rapide de la lave en surface ou sous l'eau. Il constitue l'essentiel des fonds océaniques et des îles volcaniques comme Hawaï ou la Réunion. Sa structure en colonnes prismatiques hexagonales, comme la Chaussée des Géants en Irlande, est spectaculaire." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "La cuisine marocaine est reconnue pour ses tajines, couscous et pastillas. Elle mêle influences berbères, arabes, andalouses et sub-sahariennes. La harira, soupe traditionnelle à base de tomates et lentilles, est incontournable pendant le Ramadan. L'utilisation du ras el hanout, mélange d'une vingtaine d'épices, lui donne sa complexité aromatique." },
  { title: 'Texte 2', content: "La cuisine éthiopienne se caractérise par le service sur injera, un pain plat fermenté de teff servant à la fois de couvert et de couvert comestible. Les convives déposent directement sur l'injera les différents ragoûts épicés (wats) et les accompagnements végétariens (ayibes). Cette tradition de partage du repas autour d'un seul plat est au cœur de la culture de l'hospitalité éthiopienne." },
  { title: 'Texte 3', content: "La cuisine sénégalaise est dominée par le thiéboudiène, riz au poisson considéré comme le plat national. Elle utilise abondamment le poisson frais et séché, les arachides et le gombo. La sauce yassa, à base d'oignons et de citron, accompagne volailles et poissons. Les influences guinéennes et mauritaniennes enrichissent cette cuisine côtière." },
  { title: 'Texte 4', content: "La cuisine camerounaise est l'une des plus diversifiées d'Afrique subsaharienne, reflet des quelque 280 groupes ethniques du pays. Le ndolé, plat à base de feuilles amères et de crevettes ou de viande, est l'emblème national. Le poulet DG (Directeur Général), les brochettes de bœuf et le koki de haricots constituent d'autres spécialités très appréciées." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "L'impôt forfaitaire est un système où tous les contribuables paient le même montant, indépendamment de leurs revenus. Simple à administrer, il est jugé inéquitable par ses détracteurs car il représente une part plus importante des revenus des plus modestes. Certains pays à bas revenus l'utilisent pour des taxes locales spécifiques." },
  { title: 'Texte 2', content: "L'impôt proportionnel, ou flat tax, applique le même taux à tous les revenus, quelle que soit leur hauteur. Si le montant absolu payé augmente avec les revenus, le taux reste constant. Ce système est défendu pour sa simplicité et son effet neutre sur les incitations économiques, mais critiqué pour son manque de progressivité." },
  { title: 'Texte 3', content: "L'impôt progressif est un système fiscal dans lequel le taux d'imposition augmente par paliers avec le niveau de revenu. Plus on gagne, plus le taux marginal appliqué à la tranche supérieure est élevé. Ce système vise à réduire les inégalités économiques et est utilisé dans la majorité des pays développés pour l'impôt sur le revenu." },
  { title: 'Texte 4', content: "La taxe à la valeur ajoutée (TVA) est un impôt indirect prélevé à chaque étape de la chaîne de production et de distribution. Le consommateur final supporte la totalité de la TVA, tandis que les entreprises ne font que la collecter pour le compte de l'État. Son taux varie selon les pays et les catégories de produits." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "La bibliothèque universitaire est un établissement documentaire au service des étudiants, des enseignants et des chercheurs d'une université. Elle met à disposition des ouvrages, revues scientifiques, bases de données en ligne et espaces de travail. Son accès est généralement réservé à la communauté universitaire, parfois élargi au grand public." },
  { title: 'Texte 2', content: "La bibliothèque de dépôt légal est une institution légalement chargée de recevoir obligatoirement un exemplaire de toute publication nationale, qu'il s'agisse de livres, journaux, revues, cartes, affiches ou documents numériques. En France, la Bibliothèque nationale de France (BnF) est l'organisme principal chargé de cette mission de conservation du patrimoine éditorial national." },
  { title: 'Texte 3', content: "La bibliothèque de rue est une initiative citoyenne consistant à installer des boîtes à livres ou des meubles de partage de livres dans l'espace public. Les livres y sont déposés librement par les habitants et empruntés sans formalité. Ce mouvement, né dans les pays nordiques, s'est largement répandu en France sous l'impulsion d'associations locales." },
  { title: 'Texte 4', content: "La bibliothèque spécialisée se concentre sur un domaine particulier du savoir : médecine, droit, architecture, musique, gastronomie. Elle sert principalement des professionnels et des chercheurs spécialisés. Ses collections approfondies incluent souvent des documents rares, des archives professionnelles et des revues spécialisées non disponibles dans les bibliothèques généralistes." },
]);

/* ── Documents Q23-32 ── */
const DOC_FESTIVAL_ARTS_RUE =
`RÈGLEMENT DU FESTIVAL DES ARTS DE LA RUE — ÉTÉ EN SCÈNE

Article 3 — Conditions de participation
Les compagnies souhaitant participer au festival doivent soumettre leur dossier de candidature avant le 15 mars. Chaque compagnie peut proposer un à deux spectacles d'une durée maximale de 45 minutes chacun. La participation est ouverte aux compagnies professionnelles de théâtre de rue, de cirque, de danse et d'arts de feu.

Article 7 — Sécurité
Toute représentation pyrotechnique ou utilisant du feu doit faire l'objet d'une déclaration préalable auprès du service de sécurité du festival au moins 72 heures avant la représentation. Le respect des périmètres de sécurité est obligatoire.`;

const DOC_OFFRE_CHIRURGIEN =
`OFFRE D'EMPLOI — CHIRURGIEN(NE) EN ROBOTIQUE MÉDICALE

Centre Hospitalier Universitaire de Lyon recherche un(e) chirurgien(ne) spécialisé(e) en chirurgie robotique.

Profil recherché :
• Diplôme de Docteur en médecine + spécialisation chirurgie (urologie, gynécologie ou viscérale)
• Formation et certification da Vinci Surgical System obligatoire
• Minimum 200 procédures assistées par robot documentées
• Connaissance du protocole de simulation chirurgicale

Missions : interventions chirurgicales assistées par robot, formation des internes et assistants, participation à la recherche clinique en robotique.

Contrat : CDI statut praticien hospitalier. Rémunération selon grille PH.`;

const DOC_NOTICE_IMPOT =
`GUIDE DU CONTRIBUABLE — DÉCLARATION DE REVENUS

Comment déclarer vos revenus locatifs :

Les revenus locatifs (loyers perçus) sont à déclarer dans la case 4BE (régime micro-foncier) si votre revenu brut annuel est inférieur à 15 000 €. Au-delà de ce seuil, vous devez opter pour le régime réel (formulaire 2044).

Le régime micro-foncier permet un abattement forfaitaire de 30 % sur vos revenus bruts, sans justificatifs. Le régime réel vous permet de déduire les charges réelles (travaux, intérêts d'emprunt, frais de gestion).

En cas de déficit foncier, celui-ci est imputable sur votre revenu global dans la limite de 10 700 € par an.`;

const DOC_CONTRAT_BIBLIO_NUM =
`CONTRAT DE LICENCE — BIBLIOTHÈQUE NUMÉRIQUE SCHOLARIS

La Bibliothèque Numérique SCHOLARIS (ci-après « le Prestataire ») accorde à l'établissement scolaire (ci-après « l'Établissement ») une licence non exclusive d'accès à sa plateforme documentaire.

Article 2 — Droits accordés
L'Établissement est autorisé à permettre à ses élèves et enseignants d'accéder aux ressources numériques dans un cadre strictement pédagogique. Toute reproduction, diffusion ou commercialisation des contenus est strictement interdite.

Article 5 — Durée et renouvellement
La licence est accordée pour une durée d'un an, renouvelable par tacite reconduction sauf résiliation avec préavis de 60 jours avant échéance.`;

const DOC_CHARTE_ATHLETISME =
`CHARTE POUR L'ÉQUITÉ DANS L'ATHLÉTISME FÉMININ
Fédération Nationale d'Athlétisme

La Fédération s'engage à :
• Garantir une dotation financière égale entre les épreuves féminines et masculines lors des championnats nationaux
• Assurer une diffusion télévisée équivalente des compétitions féminines et masculines
• Financer des programmes de détection et de formation spécifiquement dédiés aux jeunes athlètes féminines
• Publier annuellement un rapport de transparence sur la répartition des budgets par genre

Les clubs affiliés qui ne respectent pas les principes d'équité définis dans cette charte pourront se voir suspendre leurs subventions fédérales.`;

/* ── Articles de presse Q33-40 ── */
const ART_ARTS_RUE =
`LES ARTS DE LA RUE ET L'ESPACE PUBLIC : UNE CONQUÊTE PERMANENTE

Les arts de la rue — théâtre, cirque, danse, installations éphémères — entretiennent avec l'espace public une relation singulière, faite de tension et de complicité. En investissant places, parcs, friches industrielles et rues commerçantes, les artistes de rue questionnent les normes sociales, redéfinissent les usages de la ville et créent des rencontres improbables entre des publics qui ne franchiraient jamais la porte d'un théâtre.

La démocratisation culturelle constitue l'un des arguments les plus puissants en faveur des arts de la rue. En se présentant là où les gens vivent plutôt que de les attendre dans des institutions spécialisées, ces disciplines touchent des personnes éloignées des circuits culturels traditionnels. Un spectacle de rue capte le passant fortuit, lui propose une expérience esthétique inattendue qui peut transformer sa relation à l'art.

Pourtant, cette liberté n'est pas sans contraintes. Les artistes de rue doivent négocier leurs espaces de représentation avec les mairies, les commerçants, les associations de riverains. Les questions de sécurité, de bruit, d'occupation temporaire des voies publiques génèrent des tensions récurrentes. La professionnalisation du secteur, avec l'émergence de grands festivals comme Aurillac ou Chalon dans la Rue, a contribué à structurer ces négociations.

La question de la place des arts de la rue dans le paysage culturel institutionnel reste ouverte : entre désir de reconnaissance et crainte de domestication, les artistes naviguent dans un espace de liberté précieux qu'ils cherchent à préserver.`;

const ART_ROBOT_ETHIQUE =
`ROBOTIQUE CHIRURGICALE ET ÉTHIQUE : LES DÉFIS D'UNE MÉDECINE AUGMENTÉE

L'essor de la chirurgie robotique, symbolisé par le système da Vinci utilisé dans des milliers d'hôpitaux à travers le monde, soulève des questions éthiques qui dépassent les seuls enjeux techniques. Lorsque la main du chirurgien est remplacée — ou guidée — par des bras mécaniques pilotés depuis une console, qui est véritablement responsable en cas d'accident ?

La question de la responsabilité médicale est centrale. Dans le droit actuel, la responsabilité demeure entière du côté du chirurgien, qui reste maître de la machine. Mais à mesure que les systèmes robotiques intègrent des fonctions d'intelligence artificielle capables de prendre certaines décisions en temps réel, cette clarté juridique pourrait s'estomper. Des juristes spécialisés en droit médical plaident pour une adaptation urgente des cadres légaux.

La formation constitue un autre enjeu crucial. La maîtrise d'un robot chirurgical requiert un apprentissage spécifique, distinct de la chirurgie classique. Des simulateurs sophistiqués permettent aux internes de s'entraîner sans risque pour les patients, mais la courbe d'apprentissage reste longue. Des études montrent que les complications sont plus fréquentes lors des premières centaines d'interventions d'un chirurgien qui se forme sur robot.

Enfin, l'accessibilité économique pose problème : le coût d'acquisition d'un robot chirurgical dépasse souvent le million d'euros, sans compter les consommables et la maintenance. Cette concentration des équipements dans les grands centres hospitaliers universitaires crée une inégalité géographique dans l'accès aux technologies chirurgicales de pointe.`;

const ART_FRAUDE_FISCALE =
`LA FRAUDE FISCALE INTERNATIONALE : UN DÉFI POUR LES ÉTATS À L'ÈRE DU NUMÉRIQUE

La fraude fiscale internationale coûte aux États plusieurs centaines de milliards de dollars par an, selon les estimations du FMI et de l'OCDE. L'économie numérique a exacerbé ce phénomène en permettant aux entreprises multinationales de localiser leurs profits dans des juridictions à faible imposition, même lorsque leur activité réelle se déroule dans des pays à fiscalité plus élevée.

Les grandes plateformes numériques ont été au cœur des débats. En déclarant leurs revenus publicitaires ou leurs redevances de propriété intellectuelle dans des pays comme l'Irlande ou le Luxembourg, elles réduisent considérablement leur charge fiscale effective dans les pays où elles génèrent réellement leurs profits. Ce mécanisme, parfaitement légal mais moralement contesté, est désigné sous le terme d'optimisation fiscale agressive.

L'OCDE a lancé en 2021 une réforme historique avec l'accord sur un impôt minimum mondial de 15 % sur les bénéfices des multinationales. Plus de 140 pays ont signé cet accord, mais sa mise en œuvre se heurte à des résistances politiques dans plusieurs pays, notamment ceux qui tirent un avantage compétitif de leurs régimes fiscaux attractifs.

La coopération internationale en matière d'échange automatique d'informations fiscales a néanmoins progressé. Des accords comme le Common Reporting Standard (CRS) de l'OCDE permettent aux États de partager les données bancaires de leurs ressortissants résidant à l'étranger, rendant les paradis fiscaux moins opaques qu'auparavant.`;

const ART_CUISINES_AFRICAINES =
`LES CUISINES AFRICAINES ET L'IDENTITÉ CULTURELLE : UN PATRIMOINE À VALORISER

La diversité des cuisines africaines est à l'image de la diversité du continent lui-même : foisonnante, nuancée, enracinée dans des histoires et des géographies singulières. Des injeras éthiopiennes aux tagines marocains, du thiéboudiène sénégalais au ndolé camerounais, chaque région d'Afrique a développé des traditions culinaires qui sont autant d'expressions d'identités collectives.

Longtemps réduites à des stéréotypes dans les représentations occidentales, les cuisines africaines connaissent depuis une décennie une reconnaissance internationale croissante. Des chefs africains figurent désormais dans les palmarès gastronomiques mondiaux. Des restaurants proposant une cuisine africaine contemporaine et créative s'ouvrent à Paris, Londres et New York. La cuisine africaine entre dans l'ère de la fine dining, sans pour autant renier ses racines populaires.

Cette reconnaissance soulève néanmoins des questions d'appropriation culturelle et d'authenticité. Lorsque des chefs non africains s'approprient des recettes traditionnelles en les présentant comme des créations personnelles, ils effacent la mémoire des communautés qui ont élaboré ces savoirs sur des générations. La question de la propriété intellectuelle des patrimoines culinaires est complexe et les instruments juridiques internationaux restent insuffisants.

Des initiatives de préservation émergent partout sur le continent : cartographies des plantes et techniques culinaires locales, programmes de transmission aux jeunes générations, candidatures à l'UNESCO pour le patrimoine immatériel. Car une cuisine, c'est bien plus qu'un ensemble de recettes : c'est une mémoire vivante, un lien entre les générations, un récit identitaire que l'on transmet en se passant les plats.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme théâtre de rue
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL THÉÂTRE DE RUE — ÉTÉ EN SCÈNE
5e édition — Vieux-Port de Marseille

SAMEDI 12 JUILLET
• 10 h : « Les Équilibristes » — Cie Altitude (cirque contemporain)
• 14 h : « Le Roi des Fous » — Cie Masques (théâtre clownesque)
• 17 h : « Mémoire de pluie » — Cie Aqua (danse et eau)
• 21 h : Grand spectacle de feu pyrotechnique — Cie Flammes Vives

DIMANCHE 13 JUILLET
• 11 h : Parade de rue — Toutes compagnies
• 15 h : Spectacle jeune public — Cie Lutins

Entrée libre — Chapeau à la sortie`,
    question: "D'après ce programme, quel spectacle a lieu à 21 h le samedi ?",
    optionA: "Un spectacle de cirque contemporain.",
    optionB: "Un grand spectacle de feu pyrotechnique.",
    optionC: "Une parade de toutes les compagnies.",
    optionD: "Un spectacle de danse et d'eau.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche bibliothèque numérique
  qs.push(q(2, 'Q1-7', null, {
    longText:
`BIBLIOTHÈQUE NUMÉRIQUE SCHOLARIS — Vos ressources en ligne

Accédez à plus de 50 000 ressources pédagogiques numériques :
• Manuels scolaires interactifs (niveaux 6e à terminale)
• Encyclopédies et dictionnaires spécialisés
• Vidéos éducatives et documentaires
• Exercices interactifs avec correction automatique

Comment accéder ?
1. Connectez-vous sur scholaris.edu avec vos identifiants établissement
2. Choisissez votre niveau et votre discipline
3. Accédez immédiatement à toutes les ressources disponibles

Disponible 24h/24 — 7j/7 — Sur ordinateur, tablette et mobile`,
    question: "Cette affiche présente principalement…",
    optionA: "un logiciel de gestion scolaire.",
    optionB: "une plateforme de ressources pédagogiques numériques.",
    optionC: "un catalogue de livres à commander en ligne.",
    optionD: "un service de tutorat en ligne.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement compétition féminine athlétisme
  qs.push(q(3, 'Q1-7', null, {
    longText:
`CHAMPIONNAT NATIONAL D'ATHLÉTISME FÉMININ
Règlement de participation — Épreuves de piste

Conditions d'inscription :
• Être licenciée à la Fédération Nationale d'Athlétisme (FNA) pour la saison en cours
• Avoir réalisé les minima de qualification dans les 12 mois précédant la compétition
• Présenter un certificat médical de moins de 3 mois

Règles de compétition :
• Deux tentatives de faux départ entraînent la disqualification immédiate
• Les dossards doivent être visibles de face et de dos
• Tout comportement antisportif peut entraîner une exclusion de la compétition

Dopage : contrôles aléatoires et ciblés. Tolérance zéro.`,
    question: "Selon ce règlement, combien de faux départs entraînent une disqualification ?",
    optionA: "Un seul faux départ.",
    optionB: "Deux faux départs.",
    optionC: "Trois faux départs.",
    optionD: "Les faux départs sont tolérés.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce livre cuisine africaine
  qs.push(q(4, 'Q1-7', null, {
    longText:
`À VENDRE — Livre de cuisine africaine

Vends livre « Les Saveurs d'Afrique — 200 recettes du continent » de l'auteure Adjoua Traoré, édition 2023, état neuf (jamais utilisé). Cadeau non souhaité.

Prix : 25 € (prix neuf 38 €)
Inclus : carnet de notes vierge offert avec le livre

Contenu : Afrique de l'Ouest (Ghana, Sénégal, Côte d'Ivoire, Cameroun), Afrique du Nord (Maroc, Algérie, Tunisie), Afrique de l'Est (Éthiopie, Kenya)

Remise en main propre sur Paris 11e ou envoi possible (+5 € frais de port)
Contact : 07 45 67 89 01`,
    question: "D'après cette annonce, le livre est vendu à…",
    optionA: "38 €, prix neuf.",
    optionB: "25 €, car jamais utilisé.",
    optionC: "20 €, avec remise spéciale.",
    optionD: "30 € avec les frais de port.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi bras robotique médical
  qs.push(q(5, 'Q1-7', null, {
    longText:
`SYSTÈME CHIRURGICAL DA VINCI — PROCÉDURE DE DÉMARRAGE

IMPORTANT : Ce document est réservé au personnel médical habilité.

1. Vérifier que le système est en mode maintenance (voyant orange allumé)
2. Procéder à l'auto-calibration des 4 bras robotiques (durée : 8 minutes)
3. Installer les instruments stériles à usage unique sur chaque bras
4. Tester la mobilité de chaque instrument : rotation, préhension, coagulation
5. Positionner le patient et le chariot patient selon le protocole chirurgical établi
6. Basculer en mode opératoire depuis la console chirurgien — voyant vert obligatoire avant incision

⚠ Ne jamais démarrer une intervention si le voyant vert n'est pas allumé.`,
    question: "Ce document est destiné…",
    optionA: "aux patients souhaitant en savoir plus sur la chirurgie robotique.",
    optionB: "au personnel médical habilité à utiliser ce système.",
    optionC: "aux techniciens chargés de la maintenance du robot.",
    optionD: "aux administrateurs de l'hôpital pour la gestion des équipements.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué festival géologie
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE

Le Musée des Sciences Naturelles de Lyon est heureux d'annoncer la 12e édition du
FESTIVAL DE GÉOLOGIE ET DES SCIENCES DE LA TERRE
Du 8 au 12 novembre au Musée et dans les parcs de la ville

Au programme : conférences de géologues, ateliers de reconnaissance des roches et minéraux, expositions de cristaux et fossiles, sorties terrain guidées, concours de photographie géologique.

Nouveauté 2025 : une reconstitution à l'échelle 1:1 d'une carrière de granite pour le jeune public.

Entrée libre pour toutes les conférences. Ateliers et sorties terrain : inscription préalable requise sur festgeo-lyon.fr`,
    question: "Ce communiqué annonce…",
    optionA: "l'ouverture d'une nouvelle carrière de granite.",
    optionB: "un festival de sciences de la terre avec diverses activités.",
    optionC: "une exposition permanente sur les minéraux.",
    optionD: "un concours national de géologie pour lycéens.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation atelier poterie géologique
  qs.push(q(7, 'Q1-7', null, {
    longText:
`L'association ARGILE VIVE vous invite à son

ATELIER POTERIE ET GÉOLOGIE DE L'ARGILE

Samedi 22 mars de 10 h à 17 h
Salle artisanale du Moulin — 4, chemin des Potiers

Au programme :
• Matin : présentation géologique de l'argile (formation, types, propriétés)
• Après-midi : atelier pratique de modelage et tournage de l'argile

Matériel fourni. Repas de midi inclus dans la participation.
Tarif : 35 € par adulte | 15 € enfant (8-15 ans)

Inscriptions avant le 18 mars : argilevive@atelier-poterie.fr`,
    question: "D'après cette invitation, le repas de midi est…",
    optionA: "disponible en option payante.",
    optionB: "à apporter soi-même.",
    optionC: "inclus dans le tarif de participation.",
    optionD: "servi uniquement pour les adultes.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les couches de ___ accumulées au fond des mers pendant des millions d'années forment les roches sédimentaires que nous observons aujourd'hui à l'affleurement.",
    question: PHRASE_Q,
    optionA: "granit",
    optionB: "laves",
    optionC: "sédiments",
    optionD: "minéraux",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans un spectacle de théâtre de rue, les artistes investissent l'espace public et transforment chaque carrefour en véritable lieu de ___ artistique.",
    question: PHRASE_Q,
    optionA: "répétition",
    optionB: "déambulation",
    optionC: "résidence",
    optionD: "formation",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ fiscale est calculée en appliquant le taux d'imposition approprié au revenu imposable après déduction des abattements légaux.",
    question: PHRASE_Q,
    optionA: "cotisation",
    optionB: "imposition",
    optionC: "déclaration",
    optionD: "contribution",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'injera, pain plat fermenté à base de farine de teff, sert à la fois de couvert et d'___ comestible dans la tradition culinaire éthiopienne.",
    question: PHRASE_Q,
    optionA: "assiette",
    optionB: "fermentation",
    optionC: "couvert",
    optionD: "pain",
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le robot chirurgical permet une ___ millimétrique des gestes du chirurgien, réduisant les tremblements et permettant d'opérer dans des zones inaccessibles à la main humaine.",
    question: PHRASE_Q,
    optionA: "automatisation",
    optionB: "précision",
    optionC: "robotisation",
    optionD: "simulation",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le catalogage des ressources numériques nécessite une ___ précise de chaque document selon des normes internationales pour faciliter la recherche documentaire.",
    question: PHRASE_Q,
    optionA: "numérisation",
    optionB: "indexation",
    optionC: "publication",
    optionD: "reproduction",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La chirurgie robotique révolutionne la formation médicale grâce à des outils de [14] qui permettent aux futurs chirurgiens de s'entraîner sur des cas virtuels sans risque pour les patients. La [15] des gestes simulés atteint un niveau tel que les erreurs commises lors des entraînements reproduisent fidèlement celles qui surviennent en salle d'opération réelle.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Robotique chirurgicale et formation médicale",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "simulation",
    optionB: "notation",
    optionC: "reproduction",
    optionD: "certification",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Robotique chirurgicale et formation médicale",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "complexité",
    optionB: "rapidité",
    optionC: "précision",
    optionD: "durée",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "De nombreuses multinationales localisent leurs profits dans des [16] fiscaux pour réduire leur charge fiscale. Cette pratique d'optimisation fiscale agressive prive les États de ressources importantes. La lutte contre cette [17] nécessite une coopération internationale renforcée entre les administrations fiscales.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Optimisation fiscale et évasion",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "paradis",
    optionB: "marchés",
    optionC: "États",
    optionD: "centres",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Optimisation fiscale et évasion",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "concurrence",
    optionB: "fraude",
    optionC: "réforme",
    optionD: "déclaration",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit une roche volcanique vitreuse noire utilisée depuis la préhistoire pour fabriquer des outils tranchants ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit une cuisine servie sur injera, pain plat fermenté servant de couvert comestible ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit un système fiscal où le taux d'imposition augmente avec le niveau de revenu ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit une institution recevant obligatoirement un exemplaire de toute publication nationale ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphique
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « L'athlétisme féminin a remporté le plus grand nombre de médailles d'or nationales avec 23 titres mondiaux, devançant tous les autres sports. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement du festival des arts de la rue",
    longText: DOC_FESTIVAL_ARTS_RUE,
    question: "Selon ce règlement, qui peut participer au festival ?",
    optionA: "Uniquement les compagnies de théâtre.",
    optionB: "Les compagnies professionnelles de théâtre, cirque, danse et arts de feu.",
    optionC: "Toutes les compagnies amateurs et professionnelles.",
    optionD: "Les compagnies internationales uniquement.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement du festival des arts de la rue",
    longText: DOC_FESTIVAL_ARTS_RUE,
    question: "Combien de temps avant une représentation pyrotechnique doit-on faire une déclaration ?",
    optionA: "24 heures.",
    optionB: "48 heures.",
    optionC: "72 heures.",
    optionD: "Une semaine.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chirurgien(ne) en robotique médicale",
    longText: DOC_OFFRE_CHIRURGIEN,
    question: "Quelle certification spécifique est obligatoire pour ce poste ?",
    optionA: "Une certification en intelligence artificielle médicale.",
    optionB: "La certification da Vinci Surgical System.",
    optionC: "Un diplôme de bio-ingénierie.",
    optionD: "Une habilitation en anesthésie-réanimation.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chirurgien(ne) en robotique médicale",
    longText: DOC_OFFRE_CHIRURGIEN,
    question: "Combien de procédures assistées par robot doit avoir effectuées le candidat ?",
    optionA: "Au moins 50 procédures.",
    optionB: "Au moins 100 procédures.",
    optionC: "Au moins 200 procédures.",
    optionD: "Au moins 500 procédures.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Guide du contribuable — Déclaration de revenus locatifs",
    longText: DOC_NOTICE_IMPOT,
    question: "Ce document explique principalement…",
    optionA: "comment déclarer des revenus d'activité professionnelle.",
    optionB: "comment déclarer des revenus locatifs selon le régime fiscal applicable.",
    optionC: "comment réclamer un remboursement d'impôt trop perçu.",
    optionD: "comment s'exonérer légalement de l'impôt foncier.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Guide du contribuable — Déclaration de revenus locatifs",
    longText: DOC_NOTICE_IMPOT,
    question: "Quel abattement forfaitaire le régime micro-foncier permet-il ?",
    optionA: "10 % sur les revenus bruts.",
    optionB: "20 % sur les revenus bruts.",
    optionC: "30 % sur les revenus bruts.",
    optionD: "50 % sur les revenus bruts.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Contrat de licence — Bibliothèque numérique SCHOLARIS",
    longText: DOC_CONTRAT_BIBLIO_NUM,
    question: "Selon ce contrat, qui est autorisé à accéder aux ressources de SCHOLARIS ?",
    optionA: "Le grand public et les collectivités.",
    optionB: "Les élèves et enseignants de l'établissement dans un cadre pédagogique.",
    optionC: "Uniquement les enseignants titulaires.",
    optionD: "Tous les abonnés ayant payé une licence personnelle.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Contrat de licence — Bibliothèque numérique SCHOLARIS",
    longText: DOC_CONTRAT_BIBLIO_NUM,
    question: "Combien de jours avant l'échéance faut-il envoyer un préavis de résiliation ?",
    optionA: "30 jours.",
    optionB: "45 jours.",
    optionC: "60 jours.",
    optionD: "90 jours.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Charte pour l'équité dans l'athlétisme féminin",
    longText: DOC_CHARTE_ATHLETISME,
    question: "Cette charte engage principalement la Fédération à…",
    optionA: "augmenter le nombre de compétitions féminines.",
    optionB: "garantir une équité financière et médiatique entre l'athlétisme féminin et masculin.",
    optionC: "recruter davantage d'arbitres féminines.",
    optionD: "créer des compétitions exclusivement féminines.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Charte pour l'équité dans l'athlétisme féminin",
    longText: DOC_CHARTE_ATHLETISME,
    question: "Quelle sanction peut être appliquée aux clubs ne respectant pas la charte ?",
    optionA: "Une amende financière proportionnelle à leur budget.",
    optionB: "L'exclusion définitive de la fédération.",
    optionC: "La suspension de leurs subventions fédérales.",
    optionD: "L'interdiction de participer aux championnats nationaux.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Les arts de la rue et l'espace public : une conquête permanente",
    longText: ART_ARTS_RUE,
    question: "Selon l'auteur, quel est l'un des principaux arguments en faveur des arts de la rue ?",
    optionA: "Ils permettent aux artistes de gagner plus d'argent qu'en salle.",
    optionB: "Ils touchent des personnes éloignées des circuits culturels traditionnels.",
    optionC: "Ils nécessitent moins de répétitions que le théâtre en salle.",
    optionD: "Ils attirent davantage les touristes étrangers.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Les arts de la rue et l'espace public : une conquête permanente",
    longText: ART_ARTS_RUE,
    question: "Quels festivals sont cités dans l'article comme exemples de la professionnalisation du secteur ?",
    optionA: "Avignon et Cannes.",
    optionB: "Aurillac et Chalon dans la Rue.",
    optionC: "Angoulême et Anglet.",
    optionD: "Paris et Lyon.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Robotique chirurgicale et éthique : les défis d'une médecine augmentée",
    longText: ART_ROBOT_ETHIQUE,
    question: "Selon l'article, qui est actuellement responsable en cas d'accident lors d'une chirurgie robotique ?",
    optionA: "Le fabricant du robot.",
    optionB: "L'hôpital où a lieu l'opération.",
    optionC: "Le chirurgien qui opère.",
    optionD: "L'assurance médicale de l'établissement.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Robotique chirurgicale et éthique : les défis d'une médecine augmentée",
    longText: ART_ROBOT_ETHIQUE,
    question: "Selon l'article, quel est le coût d'acquisition d'un robot chirurgical ?",
    optionA: "Moins de 500 000 euros.",
    optionB: "Souvent supérieur à un million d'euros.",
    optionC: "Entre 2 et 5 millions d'euros.",
    optionD: "Pris en charge intégralement par la Sécurité sociale.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La fraude fiscale internationale : un défi pour les États",
    longText: ART_FRAUDE_FISCALE,
    question: "Quel accord historique l'OCDE a-t-elle lancé en 2021 ?",
    optionA: "La suppression des paradis fiscaux dans l'Union européenne.",
    optionB: "Un impôt minimum mondial de 15 % sur les bénéfices des multinationales.",
    optionC: "La création d'un registre mondial des actifs financiers.",
    optionD: "L'harmonisation des taux de TVA entre les pays membres.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La fraude fiscale internationale : un défi pour les États",
    longText: ART_FRAUDE_FISCALE,
    question: "Qu'est-ce que le Common Reporting Standard (CRS) permet selon l'article ?",
    optionA: "La suppression des comptes bancaires dans les paradis fiscaux.",
    optionB: "Le partage automatique de données bancaires entre États.",
    optionC: "Le contrôle des transactions en cryptomonnaies.",
    optionD: "La création d'un impôt européen commun sur les sociétés.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Les cuisines africaines et l'identité culturelle : un patrimoine à valoriser",
    longText: ART_CUISINES_AFRICAINES,
    question: "Selon l'article, les cuisines africaines sont de plus en plus reconnues à l'international grâce notamment à…",
    optionA: "l'exportation massives de produits alimentaires africains.",
    optionB: "des chefs africains figurant dans les palmarès gastronomiques mondiaux.",
    optionC: "des émissions culinaires télévisées dédiées à l'Afrique.",
    optionD: "des programmes touristiques gastronomiques en Afrique.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Les cuisines africaines et l'identité culturelle : un patrimoine à valoriser",
    longText: ART_CUISINES_AFRICAINES,
    question: "Quel problème est soulevé dans l'article lorsque des chefs non africains s'approprient des recettes africaines ?",
    optionA: "Une violation du droit de la propriété industrielle.",
    optionB: "Une dilution de la qualité des plats originaux.",
    optionC: "Une forme d'appropriation culturelle effaçant la mémoire des communautés.",
    optionD: "Une concurrence déloyale pour les restaurants africains.",
    correctAnswer: 'C',
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
    console.log(`\n✅ ${created} questions créées pour CE 32.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
