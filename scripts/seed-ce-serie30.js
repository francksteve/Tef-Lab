'use strict';
/**
 * seed-ce-serie30.js
 * Peuple la série CE 30 avec 40 questions TEF Canada officielles.
 * Thèmes : climatologie, arts plastiques, droit pénal international,
 *          cuisine mexicaine, blockchain, sport paralympique, bibliothéconomie
 * Usage : node scripts/seed-ce-serie30.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoj2g000q0wxlmh9j3ov6';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts — médailles paralympiques par délégation ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [12, 18, 9, 15], color: '#E30613' },
    { label: 'Graphique 2', data: [15, 10, 18, 8],  color: '#E30613' },
    { label: 'Graphique 3', data: [10, 14, 22, 9],  color: '#E30613' },
    { label: 'Graphique 4', data: [8, 11, 14, 18],  color: '#003087' }, // CORRECT — délégation D, 18 médailles
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Délég. A', 'Délég. B', 'Délég. C', 'Délég. D'];
  const maxVal = 25;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 5, 10, 15, 20, 25].map(v => {
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Médailles</text>`;
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
  { title: 'Texte 1', content: "La Niña est un phénomène climatique caractérisé par un refroidissement anormal des eaux de surface du Pacifique tropical est. Elle entraîne des sécheresses en Amérique du Sud et des précipitations abondantes en Australie. Son occurrence alterne avec El Niño selon un cycle irrégulier de 2 à 7 ans." },
  { title: 'Texte 2', content: "El Niño est un phénomène climatique océanique qui réchauffe anormalement les eaux du Pacifique tropical, perturbant le climat mondial. Il provoque des pluies diluviennes sur les côtes d'Amérique du Sud, des sécheresses en Asie du Sud-Est et des ouragans plus intenses en Atlantique. L'OMM suit ce phénomène de très près." },
  { title: 'Texte 3', content: "La mousson est un régime de vents saisonniers qui apporte des pluies abondantes à l'Asie du Sud chaque été. Elle résulte de la différence de pression thermique entre l'océan et le continent. Les populations agricoles de la région en dépendent entièrement pour leurs récoltes de riz." },
  { title: 'Texte 4', content: "L'effet de serre est un phénomène naturel amplifié par les activités humaines. Les gaz comme le CO2 et le méthane piègent la chaleur solaire dans l'atmosphère terrestre, provoquant un réchauffement progressif de la planète. Le GIEC publie régulièrement des rapports d'évaluation sur son évolution." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "Le cécifoot est un sport paralympique pratiqué par des joueurs déficients visuels portant des bandeaux occultants. Il se joue à cinq contre cinq sur un terrain délimité par des bandes latérales, avec un ballon sonore. Le gardien de but est voyant et guide ses coéquipiers depuis les buts." },
  { title: 'Texte 2', content: "Le boccia est un sport de précision paralympique dérivé du jeu de boules, spécialement adapté aux personnes présentant une mobilité réduite sévère affectant les quatre membres. Les participants lancent ou font rouler des balles de cuir colorées pour les rapprocher d'une balle blanche cible appelée jack. Il se pratique en individuel, en paires ou en équipes." },
  { title: 'Texte 3', content: "Le para-triathlon est une adaptation du triathlon olympique pour athlètes en situation de handicap. Il comprend la natation, le cyclisme adapté et la course en fauteuil roulant ou à pied selon la catégorie. Les athlètes sont répartis en plusieurs classes fonctionnelles selon la nature de leur handicap." },
  { title: 'Texte 4', content: "Le tir à l'arc paralympique est une discipline ouverte aux archers présentant des déficiences physiques. Les concurrents tirent sur des cibles à différentes distances selon la catégorie. Certains archers en fauteuil roulant utilisent des adaptations spéciales pour tenir l'arc ou déclencher le tir." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "La cuisine tex-mex est une fusion née au Texas, mélangeant traditions culinaires texanes et mexicaines. Elle est célèbre pour ses burritos, nachos et chili con carne. Contrairement à la cuisine mexicaine authentique, elle utilise abondamment le fromage râpé et la crème sure." },
  { title: 'Texte 2', content: "La cuisine caribéenne se caractérise par l'utilisation des épices tropicales, du poisson, des fruits de mer et des légumes-racines comme le manioc et l'igname. Les influences africaines, amérindiennes et européennes se mêlent dans des plats comme le poulet jerk jamaïcain et le riz et pois." },
  { title: 'Texte 3', content: "La cuisine mexicaine pré-hispanique a été inscrite par l'UNESCO au patrimoine culturel immatériel de l'humanité en 2010. Elle repose sur la triade maïs-haricots-courge, les piments, les tomates et le chocolat. Le mole, sauce complexe aux dizaines d'ingrédients, en est l'un des symboles les plus emblématiques." },
  { title: 'Texte 4', content: "La gastronomie péruvienne est l'une des plus reconnues d'Amérique latine, avec Lima classée parmi les meilleures destinations gastronomiques mondiales. Le ceviche, plat de poisson cru mariné au citron vert et au piment, en est l'emblème national. Elle intègre des influences amérindiennes, espagnoles, japonaises et chinoises." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "Le Bitcoin est la première cryptomonnaie décentralisée, créée en 2009 par un individu ou groupe connu sous le pseudonyme Satoshi Nakamoto. Il repose sur la technologie blockchain et permet des transactions entre pairs sans intermédiaire bancaire. Son offre est limitée à 21 millions d'unités, ce qui en fait une ressource rare." },
  { title: 'Texte 2', content: "Ethereum est une plateforme blockchain open-source permettant l'exécution de contrats intelligents décentralisés et d'applications décentralisées (dApps). Sa cryptomonnaie native est l'Ether (ETH). Contrairement au Bitcoin, Ethereum a été conçu comme une plateforme de programmation et non uniquement comme une monnaie." },
  { title: 'Texte 3', content: "Ripple (XRP) est une cryptomonnaie conçue spécifiquement pour faciliter les transactions bancaires internationales rapides et peu coûteuses. Contrairement au Bitcoin, Ripple est centralisé et travaille en partenariat avec de grandes institutions financières. Son réseau peut traiter des milliers de transactions par seconde." },
  { title: 'Texte 4', content: "Le stablecoin USDT (Tether) est une cryptomonnaie dont la valeur est indexée sur le dollar américain pour éviter la volatilité des autres cryptomonnaies. Il est largement utilisé pour les échanges entre cryptomonnaies sans passer par les devises traditionnelles. Sa capitalisation boursière est parmi les plus élevées du marché." },
]);

/* ── Documents Q23-32 ── */
const DOC_TPI =
`RÈGLEMENT DE PROCÉDURE DU TRIBUNAL PÉNAL INTERNATIONAL
Article 61 — Confirmation des charges

Avant le renvoi en jugement, la Chambre préliminaire tient une audience aux fins de confirmer les charges. L'accusé a le droit d'être présent et d'être représenté par un conseil.

La Chambre peut confirmer les charges, refuser de les confirmer ou ajourner l'audience pour demander au Procureur de fournir des éléments de preuve supplémentaires. Toute décision est motivée et peut faire l'objet d'un appel dans un délai de trente jours.

La procédure d'extradition vers le Tribunal est régie par les accords entre les États parties et le Statut de Rome.`;

const DOC_OFFRE_BIBLIO =
`OFFRE D'EMPLOI — BIBLIOTHÉCAIRE NUMÉRIQUE

La Médiathèque Départementale recrute un(e) bibliothécaire spécialisé(e) en ressources numériques pour son pôle innovation.

Missions : gestion et enrichissement du catalogue de ressources numériques, formation des usagers aux outils de recherche en ligne, indexation et catalogage selon les normes internationales (MARC21, Dublin Core), veille documentaire.

Profil : Diplôme national de bibliothécaire (DNB) ou master information-documentation. Maîtrise des systèmes de gestion de bibliothèques (SIGB). Expérience souhaitée de 2 ans dans un environnement numérique.

Conditions : CDI catégorie B de la fonction publique territoriale. Rémunération indiciaire + régime indemnitaire. Télétravail partiel possible.`;

const DOC_CONTRAT_ARTISTE =
`CONTRAT DE RÉSIDENCE ARTISTIQUE

Entre : Le Centre d'art contemporain (ci-après « le Centre ») et M./Mme ___, artiste plasticien(ne) (ci-après « l'Artiste »).

Article 1 — Objet : Le Centre accueille l'Artiste en résidence de création pour une durée de trois mois consécutifs, du 1er mars au 31 mai.

Article 2 — Conditions matérielles : Le Centre met à disposition un atelier équipé de 45 m², un logement de fonction, et une bourse de création de 4 500 €.

Article 3 — Contreparties : L'Artiste s'engage à présenter une exposition de fin de résidence, à participer à deux ateliers pédagogiques avec les scolaires, et à céder au Centre le droit de reproduire les œuvres créées pendant la résidence à des fins non commerciales.`;

const DOC_CHARTE_CLIMA =
`CHARTE DE LA CLIMATOLOGIE PARTICIPATIVE
Réseau CitizenClima — Observatoire Météo National

La climatologie participative associe les citoyens à la collecte de données météorologiques locales. En rejoignant notre réseau, vous contribuez à enrichir les bases de données scientifiques utilisées pour les modèles climatiques.

Engagements des membres :
• Effectuer des relevés quotidiens à heures fixes (7h, 13h, 19h)
• Saisir les données sur la plateforme sécurisée dans les 24 heures
• Maintenir en bon état le matériel de mesure fourni
• Signaler toute anomalie dans les 48 heures

En contrepartie, le réseau fournit le matériel homologué, un accès aux données nationales agrégées, et délivre une attestation annuelle de participation.`;

const DOC_GUIDE_BLOCKCHAIN =
`GUIDE UTILISATEUR — PORTEFEUILLE BLOCKCHAIN CRYPTOSAFE

Votre portefeuille CryptoSafe est un dispositif matériel sécurisé (hardware wallet) permettant de stocker vos cryptomonnaies hors ligne, à l'abri des cyberattaques.

Première utilisation :
1. Connectez l'appareil via le câble USB fourni
2. Installez le logiciel CryptoSafe Desktop sur votre ordinateur
3. Créez votre phrase de récupération de 24 mots — conservez-la dans un endroit sûr hors ligne
4. Définissez votre code PIN à 6 chiffres

⚠ IMPORTANT : Ne communiquez jamais votre phrase de récupération. CryptoSafe ne vous demandera jamais cette information par email ou téléphone. En cas de perte du dispositif, votre phrase de récupération est le seul moyen de récupérer vos fonds.`;

/* ── Articles de presse Q33-40 ── */
const ART_CLIMA_REFUGIES =
`CHANGEMENT CLIMATIQUE ET RÉFUGIÉS : UNE CRISE HUMANITAIRE EN DEVENIR

Le changement climatique s'impose progressivement comme l'un des principaux moteurs des migrations forcées à l'échelle mondiale. Les événements météorologiques extrêmes — cyclones, inondations, sécheresses prolongées — détruisent les moyens de subsistance de populations entières, les contraignant à quitter leurs terres ancestrales. Selon le Haut-Commissariat des Nations Unies pour les réfugiés, des dizaines de millions de personnes pourraient être déplacées d'ici 2050 en raison de facteurs climatiques.

Pourtant, le droit international reste en retard sur cette réalité. La Convention de Genève de 1951, qui définit le statut de réfugié, ne reconnaît pas les personnes déplacées par des catastrophes environnementales. Ces « réfugiés climatiques » se trouvent donc dans un vide juridique qui les prive de toute protection formelle.

Des États insulaires du Pacifique, comme Tuvalu ou Kiribati, menacés de disparition sous les eaux, plaident activement pour une réforme du droit international. Ils demandent la création d'un statut spécifique qui garantirait aux populations déplacées par la montée des eaux des droits équivalents à ceux des réfugiés politiques.

La communauté internationale peine à trouver un consensus, tiraillée entre les obligations humanitaires et les résistances politiques à l'accueil de nouvelles populations migrantes. L'urgence climatique impose pourtant que des réponses juridiques et politiques soient apportées sans délai.`;

const ART_ART_MARCHE =
`ART CONTEMPORAIN ET MARCHÉ DE L'ART : ENTRE CRÉATION ET SPÉCULATION

Le marché de l'art contemporain a connu ces deux dernières décennies une expansion spectaculaire. Des œuvres d'artistes vivants s'échangent désormais à des montants qui dépassent l'entendement — des dizaines, voire des centaines de millions de dollars pour certaines pièces emblématiques. Cette envolée des prix soulève des questions fondamentales sur la nature même de l'art et sa relation à la valeur économique.

Pour les galeries et les collectionneurs institutionnels, le marché de l'art est une classe d'actifs à part entière, avec ses mécanismes de spéculation, ses effets de mode et ses stratégies de valorisation. Les grandes maisons de ventes aux enchères — Sotheby's, Christie's, Phillips — organisent des ventes événementielles qui font l'objet d'une couverture médiatique mondiale.

Les artistes, eux, ont un rapport ambivalent à ce marché qui peut les propulser au firmament comme les condamner à l'oubli. Certains dénoncent une financiarisation de la création qui transforme l'œuvre en produit de placement, détournant l'art de sa vocation première. D'autres voient dans le succès commercial la reconnaissance légitime d'un travail et d'une vision.

Ce débat n'est pas nouveau — il traverse l'histoire de l'art depuis les mécènes de la Renaissance. Mais la mondialisation et la dématérialisation des échanges lui donnent une dimension inédite, questionnant les frontières entre culture, économie et identité.`;

const ART_BLOCKCHAIN_LOGISTIQUE =
`LA BLOCKCHAIN DANS LA CHAÎNE LOGISTIQUE : TRAÇABILITÉ ET CONFIANCE

La technologie blockchain, popularisée par les cryptomonnaies, trouve des applications concrètes et prometteuses dans la gestion de la chaîne logistique mondiale. Son principe fondamental — un registre distribué, immuable et transparent — répond à un besoin crucial des entreprises : garantir l'authenticité et la traçabilité des produits de leur origine jusqu'au consommateur final.

Dans l'industrie alimentaire, des expérimentations menées par de grandes enseignes de distribution ont démontré que la blockchain réduit de plusieurs semaines à quelques secondes le temps nécessaire pour retracer l'origine d'un produit suspect lors d'une crise sanitaire. Les données de production, de transport, de stockage et de distribution sont enregistrées à chaque étape sur des blocs liés entre eux de manière cryptographique, rendant toute falsification pratiquement impossible.

Le secteur pharmaceutique s'intéresse également à cette technologie pour lutter contre la contrefaçon de médicaments, un fléau qui coûte des milliards d'euros chaque année et met des vies en danger. Des pilotes sont menés en collaboration avec les autorités sanitaires de plusieurs pays.

Les défis restent néanmoins importants : l'interopérabilité entre les différents systèmes blockchain utilisés par les partenaires commerciaux, la consommation énergétique des réseaux distribués, et la nécessaire formation des acteurs de la chaîne logistique constituent autant de freins à un déploiement massif.`;

const ART_SPORT_PARA =
`LE SPORT PARALYMPIQUE : OUTIL D'INCLUSION ET DE TRANSFORMATION SOCIALE

Les Jeux Paralympiques, qui se tiennent depuis 1960, ont progressivement gagné en visibilité et en légitimité sur la scène sportive internationale. Ce qui était perçu comme une compétition de second rang est devenu un événement mondial suivi par des centaines de millions de téléspectateurs, avec des athlètes dont les performances défient les limites physiologiques imaginées.

Au-delà du spectacle sportif, les Jeux Paralympiques portent un message puissant sur l'inclusion des personnes en situation de handicap dans la société. Ils contribuent à déconstruire les représentations négatives du handicap, en montrant des individus déterminés, performants et capables de dépassement. Plusieurs études sociologiques ont montré que les grandes compétitions paralympiques améliorent durablement les attitudes de la population envers les personnes handicapées.

En France, le label « Terrain d'accès au sport paralympique » a été créé pour encourager les clubs sportifs à accueillir des pratiquants en situation de handicap. Mais les inégalités persistent : les équipements sportifs adaptés restent insuffisants, les financements déséquilibrés, et la médiatisation bien en deçà de celle accordée aux sports olympiques.

La question des prothèses high-tech soulève également des débats éthiques : certains athlètes amputés courent plus vite que leurs homologues valides, posant la question de la frontière entre performance humaine et performance technologique. Ces controverses, loin d'être résolues, illustrent la richesse et la complexité d'un mouvement sportif en pleine évolution.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche atelier arts plastiques
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ATELIER ARTS PLASTIQUES — Centre culturel La Palette

STAGE INTENSIF D'ÉTÉ — Du 14 au 25 juillet
« Peinture, sculpture et arts mixtes »

Techniques enseignées : aquarelle, huile sur toile, modelage argile, collage
Matériaux fournis : pinceaux, pigments, toiles 30×40 cm, argile naturelle
Niveau : tous niveaux, débutants bienvenus

Horaires : 9 h – 12 h et 14 h – 17 h | Tarif : 280 € les 2 semaines
Inscriptions : atelierlapalette@gmail.com | Tél. : 04 67 00 11 22`,
    question: "Ce document est principalement…",
    optionA: "un catalogue de galerie d'art.",
    optionB: "une annonce de stage d'arts plastiques.",
    optionC: "un règlement intérieur de centre culturel.",
    optionD: "une invitation à un vernissage.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme Jeux Paralympiques
  qs.push(q(2, 'Q1-7', null, {
    longText:
`JEUX PARALYMPIQUES — Programme officiel

SEMAINE 1 — Disciplines de force et précision
• Lundi 2 sept. : Halterophilie paralympique (10 h – 18 h) — Stade couvert
• Mardi 3 sept. : Tir à l'arc (9 h – 17 h) — Champ de tir extérieur
• Mercredi 4 sept. : Boccia — Éliminatoires (10 h – 16 h) — Salle B

SEMAINE 2 — Sports collectifs et aquatiques
• Lundi 9 sept. : Cécifoot — Demi-finales (15 h – 20 h) — Stade A
• Mardi 10 sept. : Para-natation — Finales (9 h – 13 h) — Piscine olympique

Billetterie : paralympics2025.org`,
    question: "D'après ce document, le boccia se déroule…",
    optionA: "à la piscine olympique.",
    optionB: "au stade couvert.",
    optionC: "dans la salle B.",
    optionD: "sur le champ de tir extérieur.",
    correctAnswer: 'C',
  }));

  // Q3 — Règlement bibliothèque scolaire
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT DE LA BIBLIOTHÈQUE SCOLAIRE — Collège Victor Hugo

Conditions d'emprunt :
• Tout élève inscrit peut emprunter jusqu'à 3 ouvrages simultanément.
• La durée du prêt est de 15 jours, renouvelable une fois en personne.
• Les bandes dessinées et magazines ne sont pas empruntables ; consultation sur place uniquement.

Retours :
• Les documents doivent être rendus en bon état avant la date de retour indiquée.
• En cas de retard, l'accès aux nouveaux emprunts est suspendu jusqu'à régularisation.
• Tout document perdu ou détérioré doit être remboursé au prix de remplacement.`,
    question: "Selon ce règlement, les magazines sont…",
    optionA: "empruntables pour une semaine.",
    optionB: "disponibles uniquement en consultation sur place.",
    optionC: "accessibles avec une carte spéciale.",
    optionD: "réservés aux professeurs.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce cours de peinture
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE PEINTURE — Particulier donne cours

Peintre amateur passionné propose cours individuels ou en petits groupes (max 4 personnes) tous niveaux.

Techniques proposées : aquarelle, acrylique, pastels secs
Durée : 2 h par séance | Prix : 35 €/séance ou forfait 10 séances à 300 €
Matériel fourni pour les 3 premières séances
Disponibilités : mercredi après-midi et samedi matin
Contact : paintingpro@mail.fr | 06 12 34 56 78`,
    question: "Cette annonce indique que le matériel est fourni…",
    optionA: "pour toutes les séances sans exception.",
    optionB: "uniquement pour les 3 premières séances.",
    optionC: "si on achète le forfait de 10 séances.",
    optionD: "seulement pour l'aquarelle.",
    correctAnswer: 'B',
  }));

  // Q5 — Menu restaurant mexicain
  qs.push(q(5, 'Q1-7', null, {
    longText:
`RESTAURANTE EL SOMBRERO — Menu déjeuner
Cuisine mexicaine authentique

Entrées :
• Guacamole maison avec tortillas chips
• Soupe de tortilla (caldo tlalpeño)

Plats :
• Tacos al pastor (porc mariné, ananas, coriandre) — 3 pièces
• Enchiladas vertes au poulet et sauce tomatillo
• Mole negro de Oaxaca avec riz et haricots noirs

Desserts : Flan de cajeta | Churros avec chocolat chaud

Menu complet (entrée + plat + dessert) : 22 €
Boisson non incluse • Tip non obligatoire`,
    question: "D'après ce menu, le mole negro est accompagné de…",
    optionA: "tortillas chips et guacamole.",
    optionB: "riz et haricots noirs.",
    optionC: "ananas et coriandre.",
    optionD: "flan et churros.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi capteur météo connecté
  qs.push(q(6, 'Q1-7', null, {
    longText:
`CAPTEUR MÉTÉO CONNECTÉ SKYMONITOR PRO — Guide de démarrage rapide

1. Fixez le capteur à l'extérieur, à l'abri du soleil direct et des précipitations (sous un auvent de préférence).
2. Insérez 3 piles AA (non fournies) dans le compartiment situé à l'arrière.
3. Téléchargez l'application SkyMonitor sur votre smartphone (iOS 14+ / Android 10+).
4. Activez le Bluetooth de votre téléphone et appuyez sur le bouton PAIR pendant 3 secondes.
5. Suivez les instructions de l'application pour finaliser la connexion.

⚠ Ne pas exposer à des températures inférieures à -20 °C. Remplacer les piles tous les 6 mois.`,
    question: "Ce document est…",
    optionA: "une publicité pour une application météo.",
    optionB: "un guide de démarrage d'un capteur météo.",
    optionC: "un rapport climatologique officiel.",
    optionD: "une fiche technique de laboratoire.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation exposition arts et handicap
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Vous êtes cordialement invité(e) à l'inauguration de l'exposition

« REGARDS CROISÉS »
Arts et handicap : créations d'artistes en situation de handicap

Vendredi 18 octobre à 18 h 30
Galerie Lumières — 12, rue de la République

Vernissage en présence des artistes exposants
Vin d'honneur offert | Entrée libre

L'exposition reste ouverte jusqu'au 15 novembre
Du mardi au dimanche, 10 h – 19 h

RSVP avant le 14 octobre : galerie.lumieres@art-culture.fr`,
    question: "Ce document est…",
    optionA: "une affiche de spectacle de rue.",
    optionB: "un catalogue d'exposition.",
    optionC: "une invitation à un vernissage.",
    optionD: "une brochure d'association culturelle.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires thématiques
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ thermique entre les pôles et l'équateur est l'un des moteurs principaux de la circulation atmosphérique mondiale.",
    question: PHRASE_Q,
    optionA: "transfert",
    optionB: "gradient",
    optionC: "isotherme",
    optionD: "bilan",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour obtenir une couleur spécifique, l'artiste mélange plusieurs ___ minéraux ou organiques avec son médium de dilution.",
    question: PHRASE_Q,
    optionA: "vernis",
    optionB: "solvants",
    optionC: "pigments",
    optionD: "laques",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La procédure d'___ permet à un État de remettre un suspect à un autre État ou à un tribunal international pour qu'il y soit jugé.",
    question: PHRASE_Q,
    optionA: "expulsion",
    optionB: "extradition",
    optionC: "amnistie",
    optionD: "grâce",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ est une galette de maïs ou de blé qui sert de base à de nombreux plats mexicains comme les tacos ou les quesadillas.",
    question: PHRASE_Q,
    optionA: "tortilla",
    optionB: "focaccia",
    optionC: "crêpe",
    optionD: "galette",
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Chaque ___ dans une chaîne blockchain contient un ensemble de données et un lien cryptographique vers le bloc précédent, assurant l'intégrité de l'ensemble.",
    question: PHRASE_Q,
    optionA: "nœud",
    optionB: "fichier",
    optionC: "bloc",
    optionD: "protocole",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En sport paralympique, la ___ fonctionnelle détermine dans quelle catégorie de compétition un athlète peut concourir selon la nature et le degré de son handicap.",
    question: PHRASE_Q,
    optionA: "qualification",
    optionB: "classification",
    optionC: "notation",
    optionD: "sélection",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La blockchain révolutionne la traçabilité alimentaire. Chaque maillon de la [14] d'approvisionnement peut désormais être enregistré de façon immuable, depuis la ferme jusqu'au consommateur. Cette [15] totale réduit les fraudes et permet des rappels de produits en quelques secondes au lieu de plusieurs semaines.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La blockchain et la traçabilité alimentaire',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "chaîne",
    optionB: "réseau",
    optionC: "ligne",
    optionD: "série",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La blockchain et la traçabilité alimentaire',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "sécurité",
    optionB: "transparence",
    optionC: "rapidité",
    optionD: "complexité",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "L'art contemporain cherche de nouvelles formes d'[16] pour toucher des publics éloignés des musées traditionnels. Des dispositifs innovants permettent aux personnes en situation de handicap de vivre une expérience culturelle enrichissante. Cette démarche d'[17] transforme les institutions culturelles en espaces ouverts à tous.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Art contemporain et handicap',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "accessibilité",
    optionB: "modernité",
    optionC: "rentabilité",
    optionD: "spécialisation",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Art contemporain et handicap',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "sélection",
    optionB: "communication",
    optionC: "inclusion",
    optionD: "promotion",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide / graphiques
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit un phénomène climatique océanique qui réchauffe les eaux du Pacifique tropical et perturbe le climat mondial ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit un sport de précision paralympique dérivé du jeu de boules, adapté aux personnes à mobilité réduite sévère ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte mentionne une cuisine dont l'UNESCO a inscrit la tradition au patrimoine culturel immatériel de l'humanité ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit une cryptomonnaie permettant l'exécution de contrats intelligents décentralisés ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphique
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La délégation D a remporté le plus grand nombre de médailles en sports adaptés nautiques avec 18 médailles dont 7 en or. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de procédure du Tribunal Pénal International",
    longText: DOC_TPI,
    question: "Ce document présente principalement…",
    optionA: "les règles de conduite pour les avocats de la défense.",
    optionB: "la procédure de confirmation des charges devant le TPI.",
    optionC: "les modalités d'appel des décisions civiles internationales.",
    optionD: "les critères d'attribution du statut de prisonnier de guerre.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de procédure du Tribunal Pénal International",
    longText: DOC_TPI,
    question: "Selon ce document, dans quel délai une décision de la Chambre préliminaire peut-elle faire l'objet d'un appel ?",
    optionA: "15 jours.",
    optionB: "21 jours.",
    optionC: "30 jours.",
    optionD: "60 jours.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Bibliothécaire numérique",
    longText: DOC_OFFRE_BIBLIO,
    question: "Ce poste de bibliothécaire numérique requiert principalement…",
    optionA: "une formation en informatique et développement web.",
    optionB: "un diplôme en bibliothéconomie et une maîtrise des outils numériques documentaires.",
    optionC: "une expérience en communication digitale et réseaux sociaux.",
    optionD: "un master en histoire et archivistique.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Bibliothécaire numérique",
    longText: DOC_OFFRE_BIBLIO,
    question: "Parmi les conditions de travail mentionnées dans cette offre, on trouve…",
    optionA: "un logement de fonction.",
    optionB: "une prime d'ancienneté.",
    optionC: "la possibilité de télétravail partiel.",
    optionD: "un véhicule de service.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de résidence artistique",
    longText: DOC_CONTRAT_ARTISTE,
    question: "Ce contrat de résidence artistique engage l'artiste à…",
    optionA: "vendre ses œuvres exclusivement au Centre.",
    optionB: "présenter une exposition et animer des ateliers scolaires.",
    optionC: "résider dans la ville pendant toute une année.",
    optionD: "enseigner les arts plastiques à temps plein.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de résidence artistique",
    longText: DOC_CONTRAT_ARTISTE,
    question: "Selon ce contrat, le Centre d'art met à disposition de l'artiste…",
    optionA: "un budget de communication de 4 500 €.",
    optionB: "un atelier et un logement de fonction.",
    optionC: "un assistant technique et un atelier de 45 m².",
    optionD: "du matériel de sculpture et une bourse de voyage.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte de la climatologie participative",
    longText: DOC_CHARTE_CLIMA,
    question: "Selon cette charte, les membres du réseau CitizenClima s'engagent à…",
    optionA: "publier leurs relevés sur les réseaux sociaux.",
    optionB: "effectuer des relevés météorologiques quotidiens à heures fixes.",
    optionC: "acheter leur propre matériel de mesure certifié.",
    optionD: "assister à deux formations annuelles.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte de la climatologie participative",
    longText: DOC_CHARTE_CLIMA,
    question: "En contrepartie de leur participation, les membres reçoivent notamment…",
    optionA: "une rémunération mensuelle.",
    optionB: "un accès gratuit aux données météorologiques locales.",
    optionC: "le matériel homologué et une attestation annuelle.",
    optionD: "une réduction sur les abonnements scientifiques.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide utilisateur — Portefeuille blockchain CryptoSafe",
    longText: DOC_GUIDE_BLOCKCHAIN,
    question: "Ce document décrit principalement…",
    optionA: "comment acheter des cryptomonnaies en ligne.",
    optionB: "les procédures d'utilisation d'un portefeuille matériel de cryptomonnaies.",
    optionC: "le fonctionnement de la technologie blockchain.",
    optionD: "les réglementations fiscales sur les cryptomonnaies.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide utilisateur — Portefeuille blockchain CryptoSafe",
    longText: DOC_GUIDE_BLOCKCHAIN,
    question: "Selon ce guide, la phrase de récupération de 24 mots doit être…",
    optionA: "mémorisée et jamais écrite.",
    optionB: "enregistrée dans l'application CryptoSafe.",
    optionC: "conservée dans un endroit sûr hors ligne.",
    optionD: "partagée avec le service client en cas de perte.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Changement climatique et réfugiés : une crise humanitaire en devenir",
    longText: ART_CLIMA_REFUGIES,
    question: "Selon cet article, quel est le principal problème juridique concernant les réfugiés climatiques ?",
    optionA: "Ils sont trop nombreux pour être accueillis en Europe.",
    optionB: "La Convention de Genève de 1951 ne les reconnaît pas comme réfugiés.",
    optionC: "Les États refusent de signer des accords internationaux.",
    optionD: "Les catastrophes naturelles ne sont pas liées au changement climatique.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Changement climatique et réfugiés : une crise humanitaire en devenir",
    longText: ART_CLIMA_REFUGIES,
    question: "Quels États sont cités comme menacés de disparition sous les eaux ?",
    optionA: "Le Bangladesh et les Maldives.",
    optionB: "Tuvalu et Kiribati.",
    optionC: "Les Philippines et l'Indonésie.",
    optionD: "Haïti et Cuba.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Art contemporain et marché de l'art : entre création et spéculation",
    longText: ART_ART_MARCHE,
    question: "Selon cet article, les grandes maisons de ventes aux enchères comme Sotheby's et Christie's…",
    optionA: "vendent uniquement des œuvres d'artistes décédés.",
    optionB: "organisent des ventes événementielles à couverture médiatique mondiale.",
    optionC: "sont contrôlées par les gouvernements nationaux.",
    optionD: "ne vendent que des œuvres certifiées non spéculatives.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Art contemporain et marché de l'art : entre création et spéculation",
    longText: ART_ART_MARCHE,
    question: "L'auteur conclut que le débat sur la commercialisation de l'art…",
    optionA: "est récent et propre au XXIe siècle.",
    optionB: "traverse l'histoire de l'art depuis les mécènes de la Renaissance.",
    optionC: "concerne uniquement les artistes contemporains célèbres.",
    optionD: "sera résolu par la dématérialisation des œuvres.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La blockchain dans la chaîne logistique : traçabilité et confiance",
    longText: ART_BLOCKCHAIN_LOGISTIQUE,
    question: "Selon cet article, l'un des principaux avantages de la blockchain dans l'industrie alimentaire est de…",
    optionA: "réduire les coûts de production agricole.",
    optionB: "permettre de retracer l'origine d'un produit en quelques secondes.",
    optionC: "remplacer les inspecteurs sanitaires sur le terrain.",
    optionD: "garantir des prix stables sur les marchés.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La blockchain dans la chaîne logistique : traçabilité et confiance",
    longText: ART_BLOCKCHAIN_LOGISTIQUE,
    question: "Quel secteur est également mentionné comme intéressé par la blockchain pour lutter contre la contrefaçon ?",
    optionA: "Le secteur automobile.",
    optionB: "L'industrie du luxe.",
    optionC: "Le secteur pharmaceutique.",
    optionD: "L'industrie textile.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le sport paralympique : outil d'inclusion et de transformation sociale",
    longText: ART_SPORT_PARA,
    question: "Selon cet article, des études sociologiques montrent que les Jeux Paralympiques…",
    optionA: "génèrent des revenus importants pour les athlètes handicapés.",
    optionB: "améliorent durablement les attitudes de la population envers les personnes handicapées.",
    optionC: "sont regardés par plus de téléspectateurs que les Jeux Olympiques.",
    optionD: "permettent aux athlètes handisport d'obtenir des contrats publicitaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le sport paralympique : outil d'inclusion et de transformation sociale",
    longText: ART_SPORT_PARA,
    question: "Quel débat éthique est soulevé dans cet article concernant le sport paralympique ?",
    optionA: "Le dopage dans les compétitions handisport.",
    optionB: "La question du financement public des Jeux Paralympiques.",
    optionC: "La frontière entre performance humaine et performance technologique des prothèses.",
    optionD: "L'organisation des Jeux dans des pays à faibles revenus.",
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
    console.log(`\n✅ ${created} questions créées pour CE 30.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
