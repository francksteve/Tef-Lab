'use strict';
/**
 * seed-ce-serie45.js
 * Peuple la série CE 45 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie45.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyom0800150wxlq2enujg7';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts consommation d'eau par secteur ── */
function generateQ22SVG() {
  const sectors = ['Agri','Indus','Dom','Autre'];
  const graphs = [
    { label: 'Graphique 1', data: [40, 30, 20, 10], color: '#E30613' },
    { label: 'Graphique 2', data: [20, 40, 30, 10], color: '#E30613' },
    { label: 'Graphique 3', data: [70, 15, 10, 5], color: '#003087' }, // CORRECT : agriculture très majoritaire
    { label: 'Graphique 4', data: [25, 25, 25, 25], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 80;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 55;

    const gridLines = [0, 20, 40, 60, 80].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}%</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx = (plotX + i * 78 + 3).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (plotX + i * 78 + 3 + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" opacity="0.8"/>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${sectors[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Part de consommation</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawBarChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/* ── Helper ── */
const q = (order, cat, sub, data) => ({
  moduleId: MODULE_ID, seriesId: SERIES_ID, questionOrder: order,
  category: cat, subCategory: sub ?? null,
  taskTitle: data.taskTitle ?? null, longText: data.longText ?? null,
  consigne: data.consigne ?? null, comment: data.comment ?? null,
  imageUrl: data.imageUrl ?? null, audioUrl: null,
  question: data.question,
  optionA: data.optionA, optionB: data.optionB,
  optionC: data.optionC, optionD: data.optionD,
  correctAnswer: data.correctAnswer, explanation: data.explanation ?? null,
});

/* ── Textes Q18-21 ── */
const TEXTS_Q18 = JSON.stringify([
  { title: 'Médecine 1', content: "La chirurgie robotique permet au chirurgien d'opérer avec une précision millimétrique grâce à des bras robotisés contrôlés à distance. Elle réduit les incisions, les pertes sanguines et les durées d'hospitalisation. Elle est utilisée notamment en urologie, gynécologie et chirurgie cardiaque." },
  { title: 'Médecine 2', content: "La médecine préventive vise à éviter l'apparition des maladies plutôt que de les traiter. Elle passe par la vaccination, le dépistage précoce, les campagnes d'information sur les comportements à risque (tabac, sédentarité, alimentation) et la surveillance épidémiologique des populations." },
  { title: 'Médecine 3', content: "La télémédecine permet des consultations médicales à distance via des outils numériques (vidéo, messagerie sécurisée). Elle facilite l'accès aux soins dans les zones rurales ou pour les personnes à mobilité réduite. Elle comprend la téléconsultation, la téléexpertise et la téléassistance médicale." },
  { title: 'Médecine 4', content: "La médecine personnalisée adapte les traitements aux caractéristiques génétiques de chaque patient. En oncologie, elle permet d'identifier les mutations génétiques des tumeurs pour prescrire les thérapies ciblées les plus efficaces. Elle s'appuie sur le séquençage génomique et la bioinformatique." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Science 1', content: "La biologie moléculaire étudie les mécanismes moléculaires qui régissent les fonctions cellulaires : réplication de l'ADN, transcription en ARN, traduction en protéines. Elle est à la base des biotechnologies, du génie génétique et des thérapies géniques qui révolutionnent la médecine moderne." },
  { title: 'Science 2', content: "La physique des particules étudie les composants fondamentaux de la matière et leurs interactions. Le Grand Collisionneur de Hadrons (LHC) du CERN est l'outil principal de cette discipline. La découverte du boson de Higgs en 2012 a confirmé le modèle standard de la physique des particules." },
  { title: 'Science 3', content: "L'océanographie est la science qui étudie les océans sous tous leurs aspects : physique (courants, température), chimique (acidification), biologique (biodiversité marine) et géologique (relief des fonds marins). Elle est essentielle pour comprendre le rôle des océans dans la régulation du climat terrestre." },
  { title: 'Science 4', content: "La neurologie est la spécialité médicale qui étudie et traite les maladies du système nerveux central et périphérique. Parmi ses domaines d'étude : les accidents vasculaires cérébraux (AVC), les épilepsies, la maladie de Parkinson et d'Alzheimer, les sclérose en plaques et les neuropathies." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Chimie 1', content: "La chimie verte vise à concevoir des procédés chimiques qui réduisent ou éliminent l'utilisation et la production de substances dangereuses. Elle s'appuie sur 12 principes fondateurs : prévention des déchets, économie d'atomes, solvants moins dangereux, efficacité énergétique et catalyse." },
  { title: 'Chimie 2', content: "La polymérisation est une réaction chimique par laquelle de petites molécules (monomères) s'assemblent pour former de grandes chaînes moléculaires (polymères). Le plastique, le caoutchouc, les fibres synthétiques et les colles sont des exemples de polymères fabriqués industriellement." },
  { title: 'Chimie 3', content: "La chromatographie est une technique d'analyse chimique qui permet de séparer et d'identifier les composants d'un mélange. Elle est utilisée en pharmacologie, en contrôle alimentaire, en médecine légale et en sciences environnementales pour détecter des traces de polluants ou de médicaments." },
  { title: 'Chimie 4', content: "La catalyse est le phénomène par lequel une substance (le catalyseur) accélère une réaction chimique sans être consommée. Elle est fondamentale dans l'industrie chimique (production d'ammoniac, raffinage pétrolier) et dans les pots catalytiques des voitures qui réduisent les émissions polluantes." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Mode 1', content: "La haute couture désigne la confection de vêtements sur mesure, réalisés entièrement à la main par des artisans qualifiés. En France, ce titre est réglementé et ne peut être revendiqué que par des maisons agréées par la Chambre Syndicale de la Haute Couture. Chanel, Dior et Givenchy en sont les figures emblématiques." },
  { title: 'Mode 2', content: "La fast fashion désigne un modèle économique de la mode fondé sur une production rapide et bon marché de grandes quantités de vêtements, renouvelés très fréquemment (parfois chaque semaine). Ce modèle est fortement critiqué pour son impact environnemental (pollution textile, déchets) et ses conditions de travail dans les pays producteurs." },
  { title: 'Mode 3', content: "La mode durable (ou slow fashion) cherche à s'opposer à la fast fashion en promouvant des vêtements fabriqués de façon éthique, dans des matières respectueuses de l'environnement, conçus pour durer. Elle valorise l'achat de seconde main, la réparation et le recyclage des textiles." },
  { title: 'Mode 4', content: "Le prêt-à-porter est la confection industrielle de vêtements fabriqués en série selon des tailles standardisées, à des prix accessibles. Il se distingue de la haute couture par son mode de production et son accessibilité. Les grandes enseignes internationales (Zara, H&M, Uniqlo) dominent ce marché mondial." },
]);

/* ── Documents Q23-32 ── */
const DOC_BROCHURE_SANTE =
`BROCHURE D'INFORMATION — DÉPISTAGE DU DIABÈTE DE TYPE 2
Caisse Primaire d'Assurance Maladie (CPAM)

LE DIABÈTE DE TYPE 2 : CE QU'IL FAUT SAVOIR

Le diabète de type 2 touche environ 4 millions de personnes en France. Il se développe lentement et peut rester longtemps sans symptômes. Un dépistage précoce permet d'éviter les complications graves (maladies cardiovasculaires, troubles rénaux, problèmes visuels).

QUI EST CONCERNÉ PAR LE DÉPISTAGE ?
- Toute personne de plus de 45 ans
- Les personnes en surpoids (IMC > 25)
- Les personnes ayant des antécédents familiaux de diabète
- Les femmes ayant eu un diabète gestationnel

COMMENT SE FAIRE DÉPISTER ?
Une simple prise de sang (glycémie à jeun) prescrite par votre médecin traitant. Cet examen est pris en charge à 100 % dans le cadre du programme national de dépistage.

Pour plus d'informations : ameli.fr ou contactez votre médecin.`;

const DOC_OFFRE_EMPLOI_CHIMIE =
`OFFRE D'EMPLOI — INGÉNIEUR PROCÉDÉS CHIMIQUES (H/F)

Groupe industriel spécialisé dans la production de matériaux composites recrute pour son site de production de Lyon.

MISSIONS :
- Optimisation et amélioration des procédés de fabrication existants
- Participation à la mise en place de nouveaux procédés
- Suivi des indicateurs de performance (rendement, qualité, sécurité)
- Coordination avec les équipes de production et les fournisseurs

PROFIL :
Diplôme d'ingénieur en génie chimique ou chimie industrielle. 3 à 5 ans d'expérience en milieu industriel. Maîtrise des logiciels de simulation de procédés (ASPEN, ProSim). Rigueur, autonomie et esprit d'équipe.

CONDITIONS : CDI, statut cadre. Salaire : 45 000 à 55 000 €/an. Participation, intéressement, mutuelle d'entreprise.`;

const DOC_CONTRAT_ALTERNANCE =
`CONTRAT D'APPRENTISSAGE — EXTRAIT

EMPLOYEUR : Institut Technique de Lyon (ITL)
APPRENTI(E) : Mme BAMBA Fatou, née le 03/08/2003
FORMATION : Bachelor Responsable Qualité — CESI School, Lyon
DURÉE : 24 mois (1er septembre 2025 – 31 août 2027)

RÉPARTITION : 3 semaines en entreprise / 1 semaine en école par mois

RÉMUNÉRATION :
- 1ère année : 54 % du SMIC
- 2ème année : 61 % du SMIC

AVANTAGES : Tickets restaurant, remboursement à 50 % du titre de transport.
Les frais de formation sont intégralement pris en charge par l'OPCO.

MAÎTRE D'APPRENTISSAGE : M. RENARD Sylvain, Responsable Qualité.`;

const DOC_ANNONCE_CONFERENCE =
`INVITATION — CONFÉRENCE INTERNATIONALE
« CHIMIE VERTE ET INDUSTRIE DURABLE »

Organisée par la Société Française de Chimie (SFC)
Vendredi 28 mars 2026 — 9h00 à 18h00
Palais des Congrès de Paris — Salle Bordeaux

PROGRAMME :
09h00 – Ouverture par le Président de la SFC
09h30 – Conférence plénière : « Les 12 principes de la chimie verte : bilan 30 ans après »
11h00 – Table ronde : Industriels et chercheurs face aux défis de la décarbonation
14h00 – Sessions parallèles : solvants verts / biocatalyse / recyclage des plastiques
17h00 – Remise des Prix de la Chimie Verte 2026
18h00 – Cocktail de clôture

Inscription obligatoire avant le 15 mars : sfc-chimie.fr/conference2026
Tarif : 80 € (gratuit pour les doctorants et étudiants sur justificatif)`;

const DOC_GUIDE_NATATION =
`GUIDE PRATIQUE — COMMENCER LA NATATION EN PISCINE

NIVEAU DÉBUTANT : PREMIERS PAS DANS L'EAU

1. MATÉRIEL INDISPENSABLE : maillot de bain adapté (non absorbant), lunettes de natation (protègent les yeux du chlore), bonnet de bain (obligatoire dans de nombreuses piscines), tongs (prévention des mycoses).

2. POSTURE DE BASE : En crawl (nage la plus efficace), le corps doit être horizontal et tendu, le visage dans l'eau, la respiration en rotation de la tête sur le côté.

3. PROGRAMME DÉBUTANT (8 SEMAINES) :
Semaines 1-2 : 20 longueurs non stop à allure confortable
Semaines 3-4 : 30 longueurs avec alternance crawl/dos
Semaines 5-8 : Introduction des exercices de technique et d'endurance

4. CONSEILS SANTÉ : Consulter un médecin avant de commencer si vous avez des problèmes cardiaques, respiratoires ou articulaires. Boire de l'eau avant et après la séance même si vous ne ressentez pas la soif.`;

/* ── Articles de presse Q33-40 ── */
const ART_MEDECINE_IA =
`INTELLIGENCE ARTIFICIELLE EN MÉDECINE : LA PROMESSE D'UN DIAGNOSTIC PLUS PRÉCIS

L'intégration de l'intelligence artificielle dans la pratique médicale connaît une accélération sans précédent. Des algorithmes capables d'analyser des milliers d'images médicales (radiographies, IRM, scanners) avec une précision comparable — voire supérieure — à celle des radiologues expérimentés sont désormais déployés dans des hôpitaux du monde entier. En dermatologie, des IA identifient les mélanomes avec un taux de réussite supérieur à 90 %.

Ces performances suscitent un enthousiasme considérable mais aussi des questions légitimes. La première est celle de la responsabilité médicale : en cas d'erreur diagnostic liée à un algorithme, qui est responsable ? Le médecin qui a suivi la recommandation de l'IA, l'entreprise qui a développé l'outil, ou l'hôpital qui l'a acheté ? Les cadres juridiques actuels n'apportent pas de réponse claire à cette question.

La deuxième préoccupation concerne les biais algorithmiques. La plupart des IA médicales ont été entraînées sur des données de populations principalement blanches et occidentales. Leur performance est donc souvent inférieure lorsqu'elles sont appliquées à des patients d'autres origines ethniques, reproduisant et amplifiant des inégalités de santé existantes.

Malgré ces limites, la médecine augmentée par l'IA représente une transformation inéluctable. La clé est de développer des outils transparents, auditables et entraînés sur des données représentatives, et de former les médecins à les utiliser de façon critique plutôt que de s'y soumettre aveuglément.`;

const ART_EAU_MONDE =
`LA CRISE MONDIALE DE L'EAU : UN DÉFI DU XXIE SIÈCLE

L'eau douce ne représente que 2,5 % de l'eau présente sur Terre, et seulement 0,3 % de cette eau douce est directement accessible (le reste étant piégé dans les glaces polaires ou les nappes souterraines profondes). Or, avec la croissance démographique, le développement agricole et industriel, et les effets du changement climatique, la pression sur cette ressource rare n'a jamais été aussi forte.

L'agriculture est de loin le premier consommateur d'eau douce mondial, représentant environ 70 % des prélèvements. L'irrigation intensive des cultures a permis la révolution agricole du XXe siècle, mais à un coût environnemental considérable : épuisement des nappes phréatiques (mer d'Aral, aquifère d'Ogallala aux États-Unis), salinisation des sols, destruction des zones humides.

Les conflits pour l'accès à l'eau sont déjà une réalité dans plusieurs régions du monde. Le bassin du Nil fait l'objet d'une tension permanente entre l'Éthiopie, le Soudan et l'Égypte depuis la construction du Grand Barrage de la Renaissance éthiopien. En Asie centrale, la disparition de la mer d'Aral a engendré des crises humanitaires et politiques durables.

Les solutions existent : dessalement de l'eau de mer (coûteux en énergie), traitement et réutilisation des eaux usées, irrigation goutte-à-goutte, tarification progressive de l'eau pour décourager le gaspillage. Mais leur déploiement à l'échelle mondiale nécessite une coopération internationale que les tensions géopolitiques rendent difficile.`;

const ART_CHIMIE_PLASTIQUE =
`LA RÉVOLUTION DU PLASTIQUE BIO-SOURCÉ : RÉALITÉ OU ILLUSION ?

Face à la pollution plastique mondiale — 8 millions de tonnes de plastiques déversées chaque année dans les océans — les industriels et les gouvernements se tournent vers les bioplastiques comme solution d'avenir. Mais la réalité est plus complexe que le terme « bio » ne le laisse entendre.

Les bioplastiques peuvent être bio-sourcés (fabriqués à partir de matières végétales : amidon de maïs, canne à sucre, cellulose) ou biodégradables (se décomposant dans certaines conditions). Mais ces deux propriétés sont indépendantes : un plastique peut être bio-sourcé sans être biodégradable (comme certains PET végétaux), ou biodégradable sans être bio-sourcé (certains polyuréthanes synthétiques). La confusion dans le marketing est répandue et trompeuse.

La biodégradabilité elle-même est une notion à préciser. La plupart des bioplastiques ne se dégradent que dans des conditions industrielles très précises (compostage industriel à haute température), et pas dans les environnements naturels où se retrouvent les déchets plastiques réels (rivières, océans, sols).

La vraie solution à la crise du plastique ne réside donc pas dans un simple changement de matière mais dans une refonte du modèle économique : réduction à la source, réutilisation, recyclage effectif et conception pour la durabilité. Les bioplastiques peuvent jouer un rôle dans certaines applications spécifiques, mais ils ne constituent pas une alternative systémique au plastique conventionnel.`;

const ART_ARCHITECTURE_SANTE =
`L'HÔPITAL DU FUTUR : QUAND L'ARCHITECTURE AU SERVICE DU SOIN

L'architecture hospitalière a longtemps privilégié la fonctionnalité technique au détriment du bien-être des patients. Des couloirs interminables, des chambres exiguës, une lumière artificielle omniprésente : ces caractéristiques de l'hôpital du XXe siècle sont aujourd'hui reconnues comme des obstacles à la guérison et des facteurs de stress pour les soignants.

Des études rigoureuses ont démontré l'impact de l'environnement architectural sur les résultats de santé. L'exposition à la lumière naturelle réduit la durée d'hospitalisation, améliore la qualité du sommeil et diminue la consommation d'antalgiques. Les espaces verts et jardins thérapeutiques accessibles aux patients chroniques améliorent leur état psychologique et leur coopération aux soins.

Les nouveaux hôpitaux intègrent ces données dès leur conception : chambres individuelles avec fenêtres larges, espaces familiaux pour favoriser l'accompagnement des proches, signalétique intuitive réduisant l'anxiété des déplacements, zones de décompression pour le personnel soignant.

Au-delà du cadre bâti, les hôpitaux du futur sont conçus comme des systèmes adaptatifs. La modularité architecturale permet de reconfigurer rapidement des services en cas de crise sanitaire — leçon tirée de la pandémie de Covid-19. Les infrastructures numériques intégrées (capteurs de données, domotique médicale, robotique de logistique) libèrent du temps soignant pour les actes à haute valeur humaine.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_X =
`La médecine personnalisée représente une [14] majeure dans la prise en charge des maladies graves. Grâce au séquençage du génome humain, les médecins peuvent désormais [15] le traitement de chaque patient en fonction de ses caractéristiques génétiques particulières. Cette approche est particulièrement [16] en oncologie, où elle permet d'identifier avec précision les thérapies ciblées les plus efficaces pour chaque type de tumeur.`;

const TEXTE_LACUNAIRE_Y =
`La chimie verte cherche à [17] les procédés industriels pour réduire leur impact environnemental. Elle repose sur des principes simples mais ambitieux : éviter la production de déchets plutôt que de les traiter après coup, utiliser des matières premières [17b] et concevoir des procédés plus efficaces en termes d'énergie consommée.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `EMBALLAGE PRODUIT — SIROP ANTI-TOUX ADULTES PECTORAL PLUS

COMPOSITION : Extrait sec de lierre (150 mg), miel de thym (200 mg), vitamine C (80 mg) par cuillerée à soupe.

INDICATIONS : Apaise la toux sèche et irritative chez l'adulte (+ 15 ans).

POSOLOGIE : 3 cuillerées à soupe par jour (matin, midi, soir), de préférence après les repas. Ne pas dépasser 4 cuillerées par jour. Durée de traitement recommandée : 7 jours.

PRÉCAUTIONS : Ne pas utiliser en cas d'allergie au miel ou au lierre. Déconseillé aux femmes enceintes sans avis médical. Contient des sucres : à surveiller chez les diabétiques.

CONSERVATION : À l'abri de la chaleur et de la lumière. Après ouverture, consommer dans les 6 semaines.
Fabricant : PHARMA NATURA — 200 ml — À conserver hors de portée des enfants`,
    question: 'Ce document est…',
    optionA: 'Une ordonnance médicale',
    optionB: 'L\'emballage d\'un médicament contre la toux',
    optionC: 'Un guide de traitement médical',
    optionD: 'Une publicité pour un produit pharmaceutique',
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `INVITATION

Les Laboratoires CHIMIVERDE ont le plaisir de vous convier à la cérémonie de remise du

PRIX DE L'INNOVATION DURABLE 2025
Jeudi 4 décembre 2025 à 19h30
Grand Amphithéâtre de l'École Nationale de Chimie
75005 Paris

Cette soirée récompensera les projets les plus innovants de l'année en matière de chimie verte et de matériaux biosourcés.

Au programme : cocktail dînatoire, remise des prix dans 5 catégories, présentation des lauréats.

Tenue de soirée recommandée.
RSVP avant le 20 novembre : prix@chimiverde.fr
Nombre de places limité`,
    question: 'Ce document est…',
    optionA: 'Un programme de conférence scientifique',
    optionB: 'Une invitation à une cérémonie de remise de prix',
    optionC: 'Un communiqué de presse sur l\'innovation chimique',
    optionD: 'Un bulletin d\'inscription à une association',
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `PETITE ANNONCE — COLOCATION

Cherche colocataire pour grand appartement (120 m², 4 pièces) en centre-ville de Toulouse (métro Jean-Jaurès, 5 min à pied).

DESCRIPTION : Appartement lumineux au 3e étage (sans ascenseur), entièrement rénové en 2024. 4 chambres dont 1 disponible (14 m², dressing, bureau). Cuisine équipée partagée (lave-vaisselle, plaque induction). Salle de bain + WC séparés. Cave privative.

CONDITIONS :
• Loyer chambre : 480 €/mois (charges comprises : eau, électricité, internet)
• Caution : 480 € (un mois de loyer)
• Appartement non-fumeur, chat ou chien accepté

PROFIL RECHERCHÉ : Étudiant(e) ou jeune professionnel(le) calme, respectueux/se, présent(e) le soir et les week-ends.

Contact : thomas.coloc31@mail.com ou SMS au 06 XX XX XX XX`,
    question: 'Ce document est…',
    optionA: 'Un contrat de bail pour une colocation',
    optionB: 'Une petite annonce de recherche de colocataire',
    optionC: 'Une offre de location d\'appartement meublé entier',
    optionD: 'Un règlement de copropriété pour une résidence',
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `MODE D'EMPLOI — TENSIOMÈTRE ÉLECTRONIQUE OMRON M3

MESURE DE LA TENSION ARTÉRIELLE

1. Installez-vous confortablement, assis, le dos droit, pieds à plat sur le sol. Restez au repos au moins 5 minutes avant la mesure.

2. Passez le brassard autour du bras gauche, à environ 2 cm au-dessus du pli du coude. Le tuyau doit se trouver du côté intérieur du bras.

3. Vérifiez que le brassard est bien ajusté (vous devez pouvoir passer deux doigts dessous).

4. Appuyez sur le bouton START/STOP. Ne bougez pas pendant la mesure.

5. Les résultats s'affichent automatiquement. Notez les valeurs et la date dans votre carnet de suivi.

VALEURS NORMALES : Systolique < 130 mmHg | Diastolique < 85 mmHg.
En cas de résultats anormaux répétés, consultez votre médecin.`,
    question: 'Ce document est un…',
    optionA: 'Mode d\'emploi d\'un tensiomètre électronique',
    optionB: 'Guide médical sur les maladies cardiovasculaires',
    optionC: 'Notice d\'un médicament antihypertenseur',
    optionD: 'Brochure d\'information sur la tension artérielle',
    correctAnswer: 'A',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `ARTICLE DE PRESSE — Santé

NOUVELLE DÉCOUVERTE SUR LA MÉMOIRE

Des chercheurs de l'Université de Lyon ont identifié un mécanisme cellulaire qui permettrait d'expliquer pourquoi certains souvenirs sont stockés à long terme tandis que d'autres s'effacent rapidement. Leurs travaux, publiés dans la revue Nature Neuroscience, montrent qu'une protéine spécifique — la kinase CAMKII — joue un rôle central dans la consolidation des souvenirs émotionnellement forts.

Cette découverte pourrait ouvrir la voie à de nouveaux traitements contre les troubles de la mémoire, notamment dans le cas de la maladie d'Alzheimer, qui touche 900 000 personnes en France. Les chercheurs espèrent développer des molécules capables d'activer ou d'inhiber cette protéine selon les besoins thérapeutiques.`,
    question: 'Ce document est…',
    optionA: 'Un communiqué pharmaceutique sur un nouveau médicament',
    optionB: 'Un article de presse sur une découverte scientifique',
    optionC: 'Une brochure d\'information sur la maladie d\'Alzheimer',
    optionD: 'Un extrait de revue médicale spécialisée',
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `AFFICHE — PROGRAMME D'INFORMATION

SEMAINE NATIONALE DE LA CHIMIE
Du 7 au 12 octobre 2025

Au programme près de chez vous :
• Portes ouvertes dans les laboratoires universitaires (entrée libre)
• Expériences chimiques interactives pour les scolaires (sur inscription)
• Conférence grand public : « La chimie dans votre cuisine »
  Mercredi 9 octobre, 18h30 — Bibliothèque universitaire centrale
• Visite guidée d'une usine chimique (adultes, sur inscription)
  Vendredi 11 octobre, 9h00 – 11h30

Tout savoir sur les programmes : semaine-chimie.fr
Organisé par la Société Française de Chimie
Renseignements : 01 40 46 71 60`,
    question: 'Ce document est…',
    optionA: 'Une affiche présentant le programme de la Semaine Nationale de la Chimie',
    optionB: 'Un catalogue d\'inscriptions pour des cours de chimie',
    optionC: 'Un programme d\'examens pour des étudiants en chimie',
    optionD: 'Un règlement intérieur d\'un laboratoire universitaire',
    correctAnswer: 'A',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `COURRIER PERSONNEL

Chère Amina,

Je profite de quelques jours de vacances pour t'écrire enfin cette lettre que je te dois depuis si longtemps. Je ne sais pas si tu reçois encore du courrier à cette adresse, mais j'espère que oui.

Comment vas-tu ? J'ai appris par Nadia que tu t'étais installée à Montréal depuis un an maintenant. C'est courageux de ta part de recommencer de zéro dans un nouveau pays, mais tu as toujours eu cette force-là.

De mon côté, je finis ma dernière année de médecine. Les stages à l'hôpital sont épuisants mais passionnants. Je me spécialise en pédiatrie, comme tu le sais peut-être. J'ai même commencé à donner des cours aux externes le vendredi soir.

J'espère qu'on aura l'occasion de se voir cet été. Donne-moi de tes nouvelles dès que tu peux.

Affectueusement,
Leila`,
    question: 'Ce document est…',
    optionA: 'Un courrier officiel de l\'université',
    optionB: 'Un courrier personnel entre amies',
    optionC: 'Un email professionnel d\'une étudiante en médecine',
    optionD: 'Une lettre de motivation pour un poste médical',
    correctAnswer: 'B',
  }));

  // ── Q8-13 : Phrases lacunaires ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le médecin a prescrit un traitement ___ pour soulager les douleurs chroniques du patient sans effets secondaires importants.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'adapté',
    optionB: 'ancien',
    optionC: 'dangereux',
    optionD: 'expérimental',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La réaction chimique a produit un ___ inattendu qui a nécessité l\'intervention immédiate de l\'équipe de sécurité.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'dégagement',
    optionB: 'silence',
    optionC: 'résultat',
    optionD: 'rapport',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La styliste a présenté une collection entièrement confectionnée à partir de matières ___ comme le coton biologique et le lin.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'naturelles',
    optionB: 'synthétiques',
    optionC: 'colorées',
    optionD: 'légères',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La pénurie d\'eau dans cette région aride est principalement due à une ___ excessive des nappes phréatiques.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'exploitation',
    optionB: 'protection',
    optionC: 'observation',
    optionD: 'analyse',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les chercheurs ont développé un nouveau ___ biodégradable destiné à remplacer les emballages plastiques traditionnels.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'polymère',
    optionB: 'solvant',
    optionC: 'colorant',
    optionD: 'catalyseur',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'L\'algorithme d\'IA a détecté la tumeur avec une ___ remarquable lors des tests cliniques.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'précision',
    optionB: 'lenteur',
    optionC: 'difficulté',
    optionD: 'simplicité',
    correctAnswer: 'A',
  }));

  // ── Q14-17 : Textes lacunaires ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La médecine personnalisée',
    longText: TEXTE_LACUNAIRE_X,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'révolution',
    optionB: 'régression',
    optionC: 'complication',
    optionD: 'tradition',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La médecine personnalisée',
    longText: TEXTE_LACUNAIRE_X,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'personnaliser',
    optionB: 'standardiser',
    optionC: 'simplifier',
    optionD: 'remplacer',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La médecine personnalisée',
    longText: TEXTE_LACUNAIRE_X,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'prometteuse',
    optionB: 'décevante',
    optionC: 'dangereuse',
    optionD: 'controversée',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La chimie verte',
    longText: TEXTE_LACUNAIRE_Y,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'réformer',
    optionB: 'détruire',
    optionC: 'ignorer',
    optionD: 'copier',
    correctAnswer: 'A',
  }));

  // ── Q18-21 : Lecture rapide ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quelle approche médicale permet des consultations à distance pour les zones rurales ?',
    optionA: 'Médecine 1',
    optionB: 'Médecine 2',
    optionC: 'Médecine 3',
    optionD: 'Médecine 4',
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quelle science étudie les courants océaniques et l\'acidification des océans ?',
    optionA: 'Science 1',
    optionB: 'Science 2',
    optionC: 'Science 3',
    optionD: 'Science 4',
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quelle technique chimique est utilisée en médecine légale pour détecter des substances ?',
    optionA: 'Chimie 1',
    optionB: 'Chimie 2',
    optionC: 'Chimie 3',
    optionD: 'Chimie 4',
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quel modèle de mode valorise l\'achat de seconde main et la réparation des vêtements ?',
    optionA: 'Mode 1',
    optionB: 'Mode 2',
    optionC: 'Mode 3',
    optionD: 'Mode 4',
    correctAnswer: 'C',
  }));

  // ── Q22 : Graphique ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « L\'agriculture représente à elle seule plus des deux tiers de la consommation d\'eau » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'C',
  }));

  // ── Q23-32 ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Brochure — Dépistage du diabète de type 2',
    longText: DOC_BROCHURE_SANTE,
    question: 'Ce document a pour objectif principal de…',
    optionA: 'Prescrire un traitement contre le diabète',
    optionB: 'Informer le public sur le dépistage du diabète de type 2',
    optionC: 'Vendre un médicament antidiabétique',
    optionD: 'Former des médecins au dépistage',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Brochure — Dépistage du diabète de type 2',
    longText: DOC_BROCHURE_SANTE,
    question: 'Selon cette brochure, comment se déroule le dépistage du diabète de type 2 ?',
    optionA: 'Par une IRM cérébrale remboursée par la Sécurité sociale',
    optionB: 'Par une prise de sang (glycémie à jeun) prise en charge à 100 %',
    optionC: 'Par un test urinaire en pharmacie sans ordonnance',
    optionD: 'Par une consultation chez un spécialiste endocrinologue',
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Offre d\'emploi — Ingénieur procédés chimiques',
    longText: DOC_OFFRE_EMPLOI_CHIMIE,
    question: 'Ce poste d\'ingénieur est proposé dans quel secteur industriel ?',
    optionA: 'Le secteur pharmaceutique',
    optionB: 'Le secteur de la production de matériaux composites',
    optionC: 'Le secteur de l\'énergie nucléaire',
    optionD: 'Le secteur de la cosmétique',
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Offre d\'emploi — Ingénieur procédés chimiques',
    longText: DOC_OFFRE_EMPLOI_CHIMIE,
    question: 'Parmi les compétences requises, on trouve la maîtrise de…',
    optionA: 'Logiciels de simulation de procédés chimiques (ASPEN, ProSim)',
    optionB: 'Langages de programmation informatique (Python, Java)',
    optionC: 'Techniques de vente et de négociation commerciale',
    optionD: 'Logiciels de conception assistée par ordinateur (CAO)',
    correctAnswer: 'A',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Contrat d\'apprentissage — Bachelor Responsable Qualité',
    longText: DOC_CONTRAT_ALTERNANCE,
    question: 'Selon ce contrat, quelle est la durée totale de la formation en apprentissage ?',
    optionA: '12 mois',
    optionB: '18 mois',
    optionC: '24 mois',
    optionD: '36 mois',
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Contrat d\'apprentissage — Bachelor Responsable Qualité',
    longText: DOC_CONTRAT_ALTERNANCE,
    question: 'Selon ce contrat, qui prend en charge les frais de formation ?',
    optionA: 'L\'apprenti(e) sur son propre salaire',
    optionB: 'L\'Institut Technique de Lyon (employeur)',
    optionC: 'L\'OPCO (Opérateur de Compétences)',
    optionD: 'La Région Auvergne-Rhône-Alpes',
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Programme — Conférence Chimie Verte 2026',
    longText: DOC_ANNONCE_CONFERENCE,
    question: 'Ce document est…',
    optionA: 'Un article de presse sur la chimie verte',
    optionB: 'Un programme d\'inscription à un cursus universitaire en chimie',
    optionC: 'Une invitation à une conférence internationale sur la chimie verte',
    optionD: 'Un règlement intérieur d\'une société chimique',
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Programme — Conférence Chimie Verte 2026',
    longText: DOC_ANNONCE_CONFERENCE,
    question: 'Selon ce programme, qui peut assister gratuitement à la conférence ?',
    optionA: 'Les membres de la Société Française de Chimie',
    optionB: 'Les doctorants et étudiants sur justificatif',
    optionC: 'Les industriels inscrits avant le 1er mars',
    optionD: 'Tous les participants sans exception',
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Guide — Commencer la natation en piscine',
    longText: DOC_GUIDE_NATATION,
    question: 'Ce document est destiné à…',
    optionA: 'Des nageurs compétiteurs voulant améliorer leurs performances',
    optionB: 'Des personnes qui souhaitent commencer la natation',
    optionC: 'Des maîtres-nageurs en formation',
    optionD: 'Des médecins prescrivant de la natation thérapeutique',
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Guide — Commencer la natation en piscine',
    longText: DOC_GUIDE_NATATION,
    question: 'Selon ce guide, combien de longueurs un débutant doit-il nager lors des deux premières semaines ?',
    optionA: '10 longueurs',
    optionB: '20 longueurs',
    optionC: '30 longueurs',
    optionD: '50 longueurs',
    correctAnswer: 'B',
  }));

  // ── Q33-40 : Articles de presse ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — L\'IA en médecine : diagnostic plus précis',
    longText: ART_MEDECINE_IA,
    question: 'Selon cet article, quelle est la première question juridique soulevée par l\'IA médicale ?',
    optionA: 'Le coût trop élevé des algorithmes pour les hôpitaux publics',
    optionB: 'La question de la responsabilité en cas d\'erreur diagnostique liée à une IA',
    optionC: 'Le risque de piratage des données médicales des patients',
    optionD: 'L\'opposition des médecins au changement technologique',
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — L\'IA en médecine : diagnostic plus précis',
    longText: ART_MEDECINE_IA,
    question: 'L\'auteur identifie un biais algorithmique important lié au fait que…',
    optionA: 'Les IA médicales consomment trop d\'énergie',
    optionB: 'Les données d\'entraînement sont principalement issues de populations blanches et occidentales',
    optionC: 'Les IA médicales ne fonctionnent pas sans connexion internet',
    optionD: 'Les médecins refusent d\'utiliser les outils d\'IA',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — La crise mondiale de l\'eau',
    longText: ART_EAU_MONDE,
    question: 'Selon cet article, quel secteur représente environ 70 % des prélèvements d\'eau douce mondiaux ?',
    optionA: 'L\'industrie',
    optionB: 'L\'agriculture',
    optionC: 'Les usages domestiques',
    optionD: 'La production d\'énergie hydroélectrique',
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — La crise mondiale de l\'eau',
    longText: ART_EAU_MONDE,
    question: 'D\'après l\'article, quel obstacle rend difficile le déploiement mondial des solutions à la crise de l\'eau ?',
    optionA: 'L\'absence de technologies disponibles',
    optionB: 'Les tensions géopolitiques qui compliquent la coopération internationale',
    optionC: 'Le manque d\'intérêt des populations pour la question de l\'eau',
    optionD: 'Le coût trop élevé des travaux de dessalement',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — La révolution du plastique biosourcé',
    longText: ART_CHIMIE_PLASTIQUE,
    question: 'Selon cet article, quelle confusion est fréquente dans le marketing des bioplastiques ?',
    optionA: 'La confusion entre bioplastique et plastique recyclé',
    optionB: 'La confusion entre bio-sourcé et biodégradable, qui sont deux propriétés indépendantes',
    optionC: 'La confusion entre bioplastique et plastique végane',
    optionD: 'La confusion entre bioplastique industriel et bioplastique artisanal',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — La révolution du plastique biosourcé',
    longText: ART_CHIMIE_PLASTIQUE,
    question: 'L\'auteur conclut que la vraie solution à la crise du plastique réside dans…',
    optionA: 'Le remplacement systématique du plastique conventionnel par des bioplastiques',
    optionB: 'Une refonte du modèle économique : réduction à la source, réutilisation et recyclage',
    optionC: 'L\'interdiction totale du plastique dans les emballages alimentaires',
    optionD: 'Le développement de nouveaux types de plastiques plus solides',
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — L\'hôpital du futur et l\'architecture',
    longText: ART_ARCHITECTURE_SANTE,
    question: 'Selon cet article, quel impact a l\'exposition à la lumière naturelle sur les patients hospitalisés ?',
    optionA: 'Elle augmente le risque d\'infections nosocomiales',
    optionB: 'Elle réduit la durée d\'hospitalisation et la consommation d\'antalgiques',
    optionC: 'Elle perturbe les rythmes de sommeil des patients',
    optionD: 'Elle n\'a aucun impact clinique prouvé',
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — L\'hôpital du futur et l\'architecture',
    longText: ART_ARCHITECTURE_SANTE,
    question: 'L\'article mentionne la modularité architecturale comme leçon tirée de…',
    optionA: 'La révolution numérique dans les soins',
    optionB: 'La pandémie de Covid-19',
    optionC: 'La crise de financement des hôpitaux publics',
    optionD: 'L\'augmentation du nombre de patients âgés',
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
    console.log('📝 Insertion de 40 questions…');
    const questions = buildQuestions();
    for (const data of questions) {
      await prisma.question.create({ data });
      console.log(`   ✓ Q${data.questionOrder} insérée`);
    }
    console.log(`\n✅ 40 questions créées pour CE 45.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
