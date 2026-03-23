'use strict';
/**
 * seed-ce-serie42.js
 * Peuple la série CE 42 avec 40 questions TEF Canada officielles.
 * Thèmes : anthropologie, cuisine fusion franco-asiatique, droit de la famille
 *          internationale, handisport, énergies fossiles transition,
 *          librairie indépendante, jeux traditionnels
 * Usage : node scripts/seed-ce-serie42.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoldi00120wxlox8857fc';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART — emplois créés secteurs reconversion ── */
function generateQ22SVG() {
  // Services écologiques : croissance 12k -> 67k = CORRECT
  const dataseries = [
    { label: 'Graphique 1 — Industrie mécanique', points: [45, 48, 50, 52, 55, 58, 60, 62], color: '#E30613' },
    { label: 'Graphique 2 — Tourisme industriel', points: [5, 8, 12, 15, 18, 20, 22, 25],  color: '#E30613' },
    { label: 'Graphique 3 — Logistique verte', points: [20, 25, 28, 30, 35, 38, 40, 45],   color: '#E30613' },
    { label: 'Graphique 4 — Services écologiques', points: [12, 18, 26, 35, 45, 54, 62, 67], color: '#003087' }, // CORRECT
  ];
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2023'];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 80;

  function drawLineChart(ds, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const step = plotW / (years.length - 1);
    const gridLines = [0, 20, 40, 60, 80].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}k</text>`;
    }).join('');
    const pts = ds.points.map((v, i) => {
      const px = (plotX + i * step).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return { px, py };
    });
    const polyline = pts.map(p => `${p.px},${p.py}`).join(' ');
    const dots = pts.map(p =>
      `<circle cx="${p.px}" cy="${p.py}" r="3" fill="${ds.color}"/>`
    ).join('');
    const xlabels = years.filter((_, i) => i % 2 === 0).map((y, i) => {
      const px = (plotX + i * 2 * step).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${y}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">${ds.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines +
           `<polyline points="${polyline}" fill="none" stroke="${ds.color}" stroke-width="2.5"/>` +
           dots + xlabels +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Emplois (milliers)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    dataseries.map((ds, i) => drawLineChart(ds, positions[i].cx, positions[i].cy)).join('') +
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
  { title: 'Texte 1', content: "Le jeu de go (wéiqí en chinois) est un jeu de stratégie abstrait né en Chine il y a environ 3 000 ans. Il se joue sur un damier de 19×19 intersections avec des pierres noires et blanches. Sa profondeur combinatoire est telle que les super-ordinateurs n'ont pu battre les meilleurs joueurs humains qu'en 2016 avec AlphaGo de DeepMind." },
  { title: 'Texte 2', content: "Le mancala est une famille de jeux africains parmi les plus anciens au monde, datant d'au moins 5 000 à 7 000 ans selon certaines hypothèses archéologiques. Il se joue avec des graines ou des cailloux que l'on déplace dans des trous creusés dans une planche ou le sol. Awélé, Oware et Bao en sont des variantes régionales." },
  { title: 'Texte 3', content: "Les jeux de toupies traditionnels existent dans presque toutes les cultures humaines et constituent l'un des jouets les plus anciens de l'humanité. Au Japon, la toupie kendama combine habilité et précision. En Amérique latine, le trompo est utilisé dans des compétitions régionales. Ces jeux de dextérité traversent les siècles avec une remarquable vitalité." },
  { title: 'Texte 4', content: "Le jeu de billes est un jeu traditionnel universel pratiqué dans de nombreuses cultures depuis l'Antiquité. En France, il a connu son âge d'or entre les années 1950 et 1970 dans les cours d'école. Les techniques et les règles varient selon les régions : agates, calots, billes en verre ou en céramique ont leurs partisans et leurs circuits de compétition." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "La boccia (ou bocce) est un sport de précision pour athlètes valides originaire d'Italie, ancêtre du pétanque français. Elle se joue en lançant des balles vers un cochonnet sur terrain plat. Ne pas confondre avec le boccia paralympique, qui est un jeu différent adapté aux personnes présentant une mobilité réduite sévère." },
  { title: 'Texte 2', content: "Le goalball est un sport paralympique créé pour les athlètes déficients visuels après la Seconde Guerre mondiale pour réhabiliter les soldats blessés. Il se joue en salle par deux équipes de trois joueurs qui lancent un ballon sonore vers le but adverse tout en étant entièrement aveugles (bandeaux oculaires obligatoires). Le public doit faire silence pendant le jeu." },
  { title: 'Texte 3', content: "Le fauteuil rugby, aussi appelé murderball, est un sport paralympique de contact pour athlètes présentant des atteintes des quatre membres. Il se joue en fauteuil électrique sur un terrain de basket, avec un ballon ovale que l'on transporte pour marquer dans la zone adverse. Les chocs entre fauteuils sont autorisés et font partie du jeu." },
  { title: 'Texte 4', content: "La para-natation est la déclinaison paralympique de la natation, ouverte à des athlètes présentant des handicaps physiques, visuels ou intellectuels. Les compétiteurs sont répartis en classes fonctionnelles selon la nature et l'étendue de leur handicap. Certains athlètes en para-natation battent des records approchant ceux des nageurs valides." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "La cuisine japonaise kaiseki est une cuisine de haute gastronomie structurée en une succession de petits plats qui mettent en valeur les produits de saison. Elle tire ses origines des repas de la cérémonie du thé au XVIe siècle. La précision des techniques, la beauté de la présentation et l'harmonie des saveurs en font l'équivalent japonais de la grande cuisine française." },
  { title: 'Texte 2', content: "La cuisine franco-maghrébine est née dans les banlieues françaises à partir des années 1970 avec l'installation de communautés issues du Maghreb. Elle mêle techniques culinaires françaises et saveurs nord-africaines dans des plats comme le couscous royal à la française ou les merguez-frites. Cette cuisine est un vecteur d'identité hybride pour les générations nées en France." },
  { title: 'Texte 3', content: "La cuisine tex-mex est une fusion née dans les États du sud des États-Unis, notamment le Texas, combinant des traditions culinaires texanes et mexicaines. Elle est célèbre pour ses enchiladas, chili con carne, nachos et burritos géants. Elle se distingue de la cuisine mexicaine authentique par l'utilisation massive de fromage râpé, de crème sure et de chili powder." },
  { title: 'Texte 4', content: "La cuisine sino-péruvienne, dite chifa, est née à Lima au XIXe siècle avec l'arrivée de travailleurs chinois (Hakka) au Pérou. Elle a donné naissance à une fusion unique entre techniques chinoises (wok, sauces soja, vapeur) et ingrédients péruviens (piments aji, pommes de terre, poisson). Lima compte plus de restaurants chifa que n'importe quelle autre ville hors de Chine." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "Le charbon de terre (houille) est une roche combustible fossile formée par la décomposition et la compaction de végétaux depuis plusieurs millions d'années. Il est classé selon sa teneur en carbone, du lignite à l'anthracite. Encore très utilisé pour la production d'électricité en Asie, il est considéré comme le combustible fossile le plus émetteur de CO2 par unité d'énergie produite." },
  { title: 'Texte 2', content: "La région de la Ruhr, en Allemagne, a été pendant plus d'un siècle le cœur industriel de l'Europe, avec ses mines de charbon et ses aciéries. Depuis les années 1970, elle a opéré une transition post-industrielle exemplaire, transformant ses sites miniers en musées industriels, ses friches en parcs culturels et en universités. Elle est citée comme modèle mondial de reconversion économique." },
  { title: 'Texte 3', content: "Le pays de Galles du Sud, autrefois région minière parmi les plus importantes du Royaume-Uni, a vécu la fermeture de ses dernières mines de charbon dans les années 1990. La reconversion économique a été douloureuse et inégale : si Cardiff a connu un renouveau économique, les vallées minières du nord souffrent encore de chômage élevé et de problèmes sociaux persistants." },
  { title: 'Texte 4', content: "Le bassin minier du Nord-Pas-de-Calais en France a été inscrit au patrimoine mondial de l'UNESCO en 2012 comme paysage culturel évolutif. Ses terrils (collines de déchets miniers), ses cités ouvrières et ses chevalements témoignent d'une histoire industrielle et humaine de 300 ans. La région cherche aujourd'hui à valoriser ce patrimoine tout en se réinventant économiquement." },
]);

/* ── Documents Q23-32 ── */
const DOC_ACCORD_ADOPTION =
`CONVENTION DE LA HAYE SUR L'ADOPTION INTERNATIONALE
Procédure simplifiée — Guide pratique

L'adoption internationale entre États parties à la Convention de La Haye (1993) suit une procédure rigoureuse visant à garantir l'intérêt supérieur de l'enfant et à prévenir les trafics.

Étapes principales :
1. Agrément dans le pays d'accueil : les futurs parents adoptants obtiennent l'autorisation de leur autorité centrale nationale
2. Proposition d'enfant par le pays d'origine : le dossier de l'enfant est transmis aux parents agréés
3. Délai de réflexion : les parents disposent de 2 mois pour accepter ou refuser la proposition
4. Procédure judiciaire dans le pays d'origine : un tribunal prononce l'adoption ou le placement en vue d'adoption
5. Délivrance du visa par le pays d'accueil : entrée de l'enfant sur le territoire

Durée moyenne de la procédure : 2 à 5 ans selon les pays.`;

const DOC_OFFRE_COACH =
`OFFRE D'EMPLOI — COACH HANDISPORT (H/F)

Le Comité Départemental Handisport recrute un(e) coach sportif(ve) spécialisé(e) dans l'accompagnement d'athlètes en situation de handicap.

Profil requis :
• Brevet d'État ou BPJEPS Activités Physiques Adaptées (APA)
• Formation spécifique handisport (stage FFHF ou équivalent)
• Expérience de 2 ans minimum auprès de sportifs handicapés
• Permis B obligatoire (déplacements fréquents)

Missions : entraînement d'athlètes handisport dans les disciplines boccia, fauteuil tennis, para-natation. Organisation de stages. Accompagnement lors des compétitions régionales et nationales.

CDI 35 h/semaine. Rémunération selon convention collective du sport.`;

const DOC_CONTRAT_LIBRAIRIE =
`CONDITIONS GÉNÉRALES DE RÉFÉRENCEMENT — LIBRAIRIE INDÉPENDANTE LE MARQUE-PAGE

Les éditeurs souhaitant référencer leurs ouvrages dans notre catalogue s'engagent à :

• Fournir les notices bibliographiques complètes (ISBN, auteur, résumé, format, prix)
• Respecter le prix unique du livre fixé par la loi Lang (1981)
• Accorder une remise commerciale de 30 % minimum sur le prix de vente public
• Garantir un délai de livraison de 5 jours ouvrés maximum sur les titres en stock

En contrepartie, la librairie s'engage à :
• Mettre en avant les nouveautés dans l'espace "Coups de cœur" pour 1 mois
• Organiser des rencontres d'auteurs pour les titres sélectionnés
• Intégrer les ouvrages dans notre programme de clubs de lecture`;

const DOC_PLAN_RECONV =
`PLAN DE REVITALISATION DU BASSIN MINIER DE LA SOMME
2025-2030 — Résumé exécutif

Face au déclin économique consécutif à la fermeture des dernières mines en 2018, la communauté de communes du bassin minier de la Somme engage un plan ambitieux de revitalisation sur 5 ans.

Axes stratégiques :
1. Reconversion économique : création d'une zone d'activité dédiée aux énergies renouvelables et à l'économie circulaire sur le site de l'ancienne mine principale
2. Patrimoine et tourisme : valorisation des infrastructures minières comme musée vivant ouvert à l'année
3. Formation et emploi : création d'un centre de formation professionnelle spécialisé dans les métiers de la transition énergétique
4. Logement et cadre de vie : réhabilitation de 500 logements ouvriers du parc social existant

Budget total : 45 millions d'euros (État 40 % | Région 30 % | Europe 30 %).`;

const DOC_GUIDE_FUSION =
`GUIDE CULINAIRE FUSION — Techniques et recettes franco-asiatiques

Introduction à la cuisine fusion
La cuisine fusion franco-asiatique maîtrise l'art de combiner les techniques culinaires françaises (sauces, cuissons lentes, émulsions) avec les saveurs et les ingrédients asiatiques (citronnelle, lait de coco, sauce soja, gingembre).

Techniques fondamentales :
• Le beurre blanc à la citronnelle : base française émulsifiée aux saveurs thaïes
• La cuisson basse température du canard laqué : précision française, technique chinoise
• L'émulsion wasabi-crème fraîche : accord franco-japonais

Recette emblématique : Velouté de courge butternut au lait de coco
Ingrédients : 1 courge butternut · 400 ml lait de coco · 1 tige de citronnelle · 4 feuilles kaffir · sel · huile de sésame
Cuisson : 30 min | Personnes : 4`;

/* ── Articles de presse Q33-40 ── */
const ART_JEUX_TRAD =
`LES JEUX TRADITIONNELS ET LA PRÉSERVATION CULTURELLE : DES PATRIMOINES IMMATÉRIELS VIVANTS

Les jeux traditionnels — du mancala africain au go asiatique, en passant par le jeu de billes européen et les jeux de toupies amérindiens — constituent un patrimoine culturel immatériel d'une richesse extraordinaire. Ils sont bien plus que de simples passe-temps : ils transmettent des valeurs, des façons de penser et de résoudre des problèmes, des modes de socialisation qui reflètent les cultures qui les ont générés.

Avec la mondialisation des loisirs numériques, de nombreux jeux traditionnels sont menacés de disparition. Les jeunes générations, attirées par les jeux vidéo et les réseaux sociaux, s'éloignent progressivement des pratiques ludiques de leurs aînés. Des communautés entières voient se perdre des savoir-faire ludiques accumulés sur des siècles.

Des initiatives de préservation émergent à travers le monde. L'UNESCO a inscrit plusieurs jeux traditionnels au patrimoine culturel immatériel de l'humanité. Des associations organisent des tournois et des festivals qui attirent des joueurs de toutes générations. Des chercheurs documentent les règles, les variantes et les contextes culturels de jeux menacés d'oubli.

Ces démarches soulèvent une tension inhérente : comment préserver des pratiques culturelles vivantes sans les figer dans une muséification qui les vide de leur sens ? Un jeu traditionnel qui n'est plus joué spontanément dans les cours d'école ou les places de village a-t-il encore une réalité culturelle, même s'il est scrupuleusement documenté et exposé ? La réponse est dans la transmission vivante, pas dans l'archivage.`;

const ART_HANDISPORT_MEDIA =
`LE HANDISPORT ET SA REPRÉSENTATION MÉDIATIQUE : DES PROGRÈS RÉELS, DES INÉGALITÉS PERSISTANTES

La couverture médiatique du sport handisport a connu des progrès indéniables depuis les Jeux Paralympiques de Barcelone en 1992. Diffusés en direct sur les grandes chaînes publiques dans de nombreux pays, les Jeux Paralympiques atteignent désormais des audiences significatives. En France, les Jeux de Paris 2024 ont enregistré des records d'audience pour des compétitions handisport, avec plusieurs millions de téléspectateurs pour certaines épreuves.

Pourtant, ces avancées ne doivent pas occulter les persistantes inégalités. Hors des Jeux Paralympiques, la couverture du handisport reste marginale dans les médias traditionnels. Les compétitions ordinaires — championnats nationaux, tournois régionaux — bénéficient d'une visibilité quasi inexistante. Les athlètes handisport ont encore du mal à trouver des sponsors, les contrats publicitaires restant l'apanage des sportifs valides les plus médiatisés.

La question de la narrativité est également importante. Lorsqu'ils sont couverts, les athlètes handisport sont souvent présentés à travers le prisme de leur handicap et de leur courage surmonté plutôt que pour leurs performances techniques et leur palmarès sportif. Cette représentation, bien qu'intentionnellement valorisante, peut paradoxalement maintenir une distance entre le public et la réalité sportive de haut niveau.

Des sports comme le fauteuil roulant rugby, le goalball ou la para-escalade commencent à trouver des communautés de fans passionnés qui les suivent pour leur valeur sportive intrinsèque, pas uniquement pour leur dimension symbolique. C'est peut-être là que se joue la vraie normalisation du handisport dans notre culture médiatique.`;

const ART_TRANSITION_MINIERE =
`LA RECONVERSION POST-MINIÈRE : ENTRE SUCCÈS INSPIRANTS ET CICATRICES SOCIALES

La fermeture des mines de charbon, entamée en Europe occidentale dans les années 1960-1970 et achevée dans les décennies suivantes, a laissé des traces profondes dans le tissu social de régions entières. Des millions de travailleurs et leurs familles ont vu leur monde s'effondrer avec les chevalement, confrontés à un chômage massif et à la dévalorisation de savoir-faire chèrement acquis.

Les récits de reconversion réussie existent — la Ruhr allemande est souvent citée comme modèle — mais ils ne doivent pas masquer la réalité de nombreuses régions qui peinent encore des décennies après la fermeture des mines. Le taux de chômage, les problèmes de santé liés à l'exposition aux poussières de charbon, les déserts médicaux et l'isolement social persistent dans de nombreuses vallées autrefois minières.

La transition énergétique ouvre de nouvelles perspectives. Les sites miniers offrent souvent des infrastructures réutilisables pour la production d'énergie renouvelable : les terrils peuvent accueillir des panneaux solaires, les galeries souterraines des pompes à chaleur géothermiques, les voies ferrées des corridors de mobilité douce. Des projets pilotes à travers l'Europe montrent que la reconversion des anciens bassins miniers vers les énergies propres est techniquement possible.

Mais la dimension humaine reste centrale. La reconversion économique ne peut réussir sans des investissements massifs et durables dans la formation professionnelle des travailleurs déplacés, dans les services de santé mentale pour des communautés traumatisées, et dans l'éducation des jeunes générations qui doivent avoir la liberté de se projeter dans autre chose que le modèle économique de leurs parents.`;

const ART_CUISINE_FUSION =
`LA GASTRONOMIE FUSION ET L'IDENTITÉ NATIONALE : ENTRE CRÉATIVITÉ ET TENSIONS CULTURELLES

La cuisine fusion — ce mariage calculé de traditions culinaires issues de cultures différentes — est devenue l'une des tendances gastronomiques les plus influentes des dernières décennies. Dans les grandes villes cosmopolites, des chefs issus de doubles cultures créent des plats qui n'appartiennent à aucune tradition culinaire établie mais puisent dans plusieurs, créant un langage gastronomique nouveau.

Cette tendance soulève des questions sur l'identité nationale et l'appartenance culturelle. En France, pays profondément attaché à sa tradition gastronomique reconnue par l'UNESCO, l'émergence d'une cuisine franco-asiatique, franco-africaine ou franco-caribéenne est parfois perçue comme une menace pour l'intégrité d'un patrimoine culinaire national. D'autres y voient l'expression naturelle d'une société devenue plurielle et diverse.

La question de l'authenticité est au cœur du débat. Qui est légitime pour mélanger des traditions culinaires ? Un chef d'origine vietnamienne né à Paris qui cuisine un canard laqué au jus de Périgord est-il l'inventeur d'une nouvelle cuisine ou le trahisseur simultané de deux patrimoines ? Cette question, impossible à trancher de manière absolue, révèle les tensions entre appartenance, identité et liberté créative.

Ce qui est certain, c'est que les cuisines fusion les plus durables ne sont pas nées de la curiosité intellectuelle d'un chef ou d'une mode éphémère, mais de rencontres humaines réelles — migrations, métissages, cohabitations — qui ont mêlé durablement des pratiques culinaires dans des sociétés vivant ensemble. La chifa péruvienne, le tex-mex ou la cuisine créole en sont des exemples authentiques.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche festival jeux traditionnels
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL INTERNATIONAL DES JEUX TRADITIONNELS DU MONDE
2e édition — Jardin Ethnobotanique — 5 au 8 septembre

Découvrez les jeux traditionnels de plus de 40 pays !

ESPACES THÉMATIQUES :
• Village africain : awélé, mancala, karés
• Espace asiatique : go, shogi, mahjong, diabolo
• Espace européen : jeu de boules, billes, toupies, osselets
• Amériques : jeu de bâton, pochoir, tlachtli (jeu de balle mésoaméricain)

Initiations gratuites toute la journée avec les champions du monde
Tournoi ouvert au public samedi et dimanche
Entrée : 6 € | Gratuit – 10 ans`,
    question: "D'après cette affiche, les initiations aux jeux traditionnels sont…",
    optionA: "disponibles uniquement le week-end.",
    optionB: "gratuites toute la journée avec des champions.",
    optionC: "payantes pour les adultes.",
    optionD: "réservées aux enfants de moins de 10 ans.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme handisport compétitions locales
  qs.push(q(2, 'Q1-7', null, {
    longText:
`CALENDRIER HANDISPORT — COMITÉ DÉPARTEMENTAL
Premier semestre 2025

JANVIER
• 18 jan. : Tournoi régional boccia — Gymnase municipal (9 h – 17 h)

FÉVRIER
• 8 fév. : Open départemental fauteuil tennis — Centre sportif (10 h – 18 h)
• 22 fév. : Compétition para-natation (distances courtes) — Piscine olympique (8 h – 13 h)

MARS
• 15 mars : Journée portes ouvertes handisport (tous sports) — CREPS régional
• 29 mars : Tournoi goalball — Salle omnisports (14 h – 20 h)

Inscription obligatoire pour tous les tournois : handisport-dept.fr
Contact : 05 56 00 12 34`,
    question: "D'après ce calendrier, quelle compétition a lieu à la piscine olympique ?",
    optionA: "Le tournoi régional boccia.",
    optionB: "L'open fauteuil tennis.",
    optionC: "La compétition de para-natation.",
    optionD: "Le tournoi goalball.",
    correctAnswer: 'C',
  }));

  // Q3 — Règlement librairie indépendante
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT — LIBRAIRIE LE MARQUE-PAGE
Conditions de commande et de retour

Commandes :
• Les commandes passées avant 14 h sont expédiées le jour même (jours ouvrés).
• Livraison standard : 3 à 5 jours ouvrés. Livraison express (72 h) : supplément 4 €.
• Les ouvrages épuisés chez l'éditeur ne peuvent être commandés ; une alternative est proposée.

Retours :
• Les livres en bon état peuvent être retournés dans un délai de 15 jours après réception.
• Les livres numériques (ebooks) ne sont pas remboursables après téléchargement.
• Le remboursement est effectué sous forme d'avoir valable 1 an, ou par virement sur demande.`,
    question: "D'après ce règlement, les livres numériques téléchargés sont…",
    optionA: "remboursables dans un délai de 15 jours.",
    optionB: "remboursables sous forme d'avoir uniquement.",
    optionC: "non remboursables après téléchargement.",
    optionD: "remboursables si défectueux.",
    correctAnswer: 'C',
  }));

  // Q4 — Petite annonce cours de cuisine fusion
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE CUISINE FUSION FRANCO-ASIATIQUE

Chef de restaurant étoilé propose masterclasses de cuisine fusion (formation professionnelle ou plaisir personnel).

Thèmes disponibles :
• Session 1 : Techniques de base — sauces franco-asiatiques (3 h)
• Session 2 : Poissons et fruits de mer — fusion Japon-Bretagne (4 h)
• Session 3 : Desserts fusion — pâtisserie française aux parfums d'Asie (3 h)
• Session 4 : Menu complet 5 plats fusion (6 h — journée entière)

Groupes de 6 à 10 personnes | Matières premières incluses
Tarifs : Sessions 1-2-3 : 120 €/pers | Session 4 : 220 €/pers
Contact : mastercuisine.fusion@pro-chef.fr`,
    question: "D'après cette annonce, quelle session dure le plus longtemps ?",
    optionA: "La session 1.",
    optionB: "La session 2.",
    optionC: "La session 3.",
    optionD: "La session 4.",
    correctAnswer: 'D',
  }));

  // Q5 — Mode d'emploi extracteur de jus
  qs.push(q(5, 'Q1-7', null, {
    longText:
`EXTRACTEUR DE JUS À FROID VITAPRESS PRO — MODE D'EMPLOI

Préparation :
1. Lavez soigneusement les fruits et légumes. Retirez les noyaux, pépins et peaux épaisses.
2. Découpez les aliments en morceaux de 3 à 5 cm maximum.
3. Insérez les morceaux progressivement dans le tube d'alimentation. Ne forcez jamais.

Nettoyage (après chaque utilisation) :
1. Démontez les pièces amovibles selon le schéma au verso.
2. Rincez immédiatement à l'eau froide — ne jamais utiliser d'eau bouillante.
3. Brossez la passoire avec la brosse fournie.
4. Laissez sécher à l'air libre avant remontage.

⚠ La lame extractrice est tranchante — manipuler avec précaution.`,
    question: "Selon ce mode d'emploi, comment faut-il nettoyer les pièces amovibles ?",
    optionA: "Au lave-vaisselle à haute température.",
    optionB: "À l'eau bouillante pour une désinfection optimale.",
    optionC: "En les rinçant immédiatement à l'eau froide.",
    optionD: "Avec un chiffon sec sans eau.",
    correctAnswer: 'C',
  }));

  // Q6 — Communiqué anthropologique découverte archéologique
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — Laboratoire d'Anthropologie Préhistorique (LAP)

Des fouilles menées dans la région de Dordogne ont mis au jour un site exceptionnel datant d'environ 40 000 ans (Paléolithique supérieur). Les archéologues ont découvert :
• 23 outils en silex taillé de haute facture
• Des fragments d'os portant des incisions régulières (possibles entailles de comptage)
• Des restes d'un repas rituel (ossements de cervidés avec traces de cuisson)
• Une perle en ivoire de mammouth — le plus ancien ornement corporel retrouvé en France

Le site confirme la présence d'Homo sapiens dans la région bien avant les dates précédemment admises et apporte un éclairage nouveau sur les capacités cognitives et symboliques des premiers humains modernes en Europe.`,
    question: "Ce communiqué présente principalement…",
    optionA: "l'identification d'une nouvelle espèce d'hominidé.",
    optionB: "les résultats d'une fouille archéologique exceptionnelle.",
    optionC: "une théorie sur la disparition des Néandertaliens.",
    optionD: "la découverte d'un site funéraire préhistorique.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation atelier jeux traditionnels africains
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Association AFRIQUE EN JEUX

Vous invite à son

ATELIER DES JEUX TRADITIONNELS AFRICAINS

Dimanche 16 mars — 14 h à 18 h
Centre culturel Amkoullel — 8, rue Jouffroy d'Abbans, Paris 17e

Au programme :
• Initiation à l'awélé (jeu de la famille mancala — Nigeria, Ghana)
• Découverte du karés (jeu de stratégie éthiopien)
• Atelier fabrication d'un plateau de jeu en bois
• Contes et histoires sur l'origine des jeux en Afrique

Tout public à partir de 8 ans | Entrée libre
Goûter africain offert en fin de séance`,
    question: "D'après cette invitation, un goûter africain est offert…",
    optionA: "à l'arrivée pour accueillir les participants.",
    optionB: "en milieu d'atelier.",
    optionC: "en fin de séance.",
    optionD: "uniquement aux enfants participants.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "En anthropologie, un ___ d'initiation est une cérémonie qui marque le passage d'un individu d'un statut social à un autre, notamment de l'enfance à l'âge adulte.",
    question: PHRASE_Q,
    optionA: "mythe",
    optionB: "rite",
    optionC: "culte",
    optionD: "symbole",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "En cuisine fusion, un ___ réussi entre deux cultures culinaires repose sur la compréhension profonde des deux traditions et non sur leur simple superposition.",
    question: PHRASE_Q,
    optionA: "mariage",
    optionB: "accord",
    optionC: "mélange",
    optionD: "assemblage",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "En droit international de la famille, le ___ d'un ressortissant étranger à la nationalité du pays d'accueil peut intervenir après une période légale de résidence.",
    question: PHRASE_Q,
    optionA: "rattachement",
    optionB: "intégration",
    optionC: "accès",
    optionD: "transfert",
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En handisport, une ___ biomécanique de haute technologie permet à un athlète amputé d'atteindre des performances comparables à celles des athlètes valides.",
    question: PHRASE_Q,
    optionA: "aide",
    optionB: "prothèse",
    optionC: "orthèse",
    optionD: "adaptation",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La reconversion du ___ houiller de la Ruhr est citée comme exemple mondial de transition post-industrielle réussie, combinant tourisme industriel et nouvelles économies.",
    question: PHRASE_Q,
    optionA: "site",
    optionB: "district",
    optionC: "bassin",
    optionD: "territoire",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En librairie, le ___ d'une maison d'édition désigne l'ensemble des titres qu'elle a publiés et qu'elle maintient disponibles à la commande.",
    question: PHRASE_Q,
    optionA: "catalogue",
    optionB: "fonds",
    optionC: "stock",
    optionD: "assortiment",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La reconversion des régions minières est un défi considérable. Chaque ancien [14] charbonnier doit réinventer son tissu économique pour surmonter le chômage et la désindustrialisation. La [15] de ces territoires nécessite des investissements massifs et une vision à long terme de la part des pouvoirs publics.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Transition des régions minières",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "bassin",
    optionB: "village",
    optionC: "district",
    optionD: "site",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Transition des régions minières",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "transition",
    optionB: "réhabilitation",
    optionC: "revitalisation",
    optionD: "reconstruction",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "L'adoption internationale crée une nouvelle famille légale mais soulève aussi des questions d'identité culturelle. L'enfant adopté bénéficie d'un [16] juridique à sa nouvelle famille mais conserve des liens affectifs et identitaires avec sa culture d'origine. Ce [17] entre deux cultures est au cœur des réflexions contemporaines sur l'adoption transnationale.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Adoption internationale et identité culturelle",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "appartenance",
    optionB: "rattachement",
    optionC: "lien",
    optionD: "accès",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Adoption internationale et identité culturelle",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "conflit",
    optionB: "choix",
    optionC: "biculturalisme",
    optionD: "partage",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit un jeu africain parmi les plus anciens au monde utilisant des graines et des trous dans une planche ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit un sport paralympique pour déficients visuels utilisant un ballon sonore ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit une fusion de cuisine texane et mexicaine populaire aux États-Unis avec enchiladas et chili con carne ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit une ancienne région minière allemande devenue symbole de transition post-industrielle vers les services ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  // Q22 : Line chart
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le secteur des services écologiques a créé le plus d'emplois dans les anciens bassins miniers en reconversion, passant de 12 000 à 67 000 emplois entre 2015 et 2023. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Convention de La Haye sur l'adoption internationale",
    longText: DOC_ACCORD_ADOPTION,
    question: "Selon ce guide, combien de temps les futurs parents ont-ils pour accepter ou refuser la proposition d'un enfant ?",
    optionA: "1 mois.",
    optionB: "2 mois.",
    optionC: "3 mois.",
    optionD: "6 mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Convention de La Haye sur l'adoption internationale",
    longText: DOC_ACCORD_ADOPTION,
    question: "Quelle est la durée moyenne d'une procédure d'adoption internationale selon ce guide ?",
    optionA: "6 mois à 1 an.",
    optionB: "1 à 2 ans.",
    optionC: "2 à 5 ans.",
    optionD: "5 à 10 ans.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Coach handisport",
    longText: DOC_OFFRE_COACH,
    question: "Quel diplôme spécialisé est requis pour ce poste de coach handisport ?",
    optionA: "Un master en sciences du sport.",
    optionB: "Un BPJEPS Activités Physiques Adaptées.",
    optionC: "Un doctorat en kinésithérapie.",
    optionD: "Un DU en médecine du sport.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Coach handisport",
    longText: DOC_OFFRE_COACH,
    question: "Pourquoi le permis de conduire est-il obligatoire pour ce poste ?",
    optionA: "Pour transporter le matériel sportif.",
    optionB: "En raison des déplacements fréquents pour les compétitions.",
    optionC: "Pour conduire le bus des athlètes.",
    optionD: "Pour les visites à domicile des athlètes.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Conditions générales de référencement — Librairie Le Marque-Page",
    longText: DOC_CONTRAT_LIBRAIRIE,
    question: "Quelle remise commerciale minimum les éditeurs doivent-ils accorder à la librairie ?",
    optionA: "20 %.",
    optionB: "25 %.",
    optionC: "30 %.",
    optionD: "35 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Conditions générales de référencement — Librairie Le Marque-Page",
    longText: DOC_CONTRAT_LIBRAIRIE,
    question: "Quel délai de livraison maximum les éditeurs doivent-ils garantir sur les titres en stock ?",
    optionA: "2 jours ouvrés.",
    optionB: "3 jours ouvrés.",
    optionC: "5 jours ouvrés.",
    optionD: "7 jours ouvrés.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Plan de revitalisation du bassin minier de la Somme",
    longText: DOC_PLAN_RECONV,
    question: "Quelle activité est prévue sur le site de l'ancienne mine principale ?",
    optionA: "Un parc de loisirs aquatique.",
    optionB: "Un centre commercial régional.",
    optionC: "Une zone dédiée aux énergies renouvelables et à l'économie circulaire.",
    optionD: "Un musée régional de l'histoire minière.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Plan de revitalisation du bassin minier de la Somme",
    longText: DOC_PLAN_RECONV,
    question: "Quelle part du financement total provient de l'Union européenne ?",
    optionA: "10 %.",
    optionB: "20 %.",
    optionC: "30 %.",
    optionD: "40 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide culinaire fusion franco-asiatique",
    longText: DOC_GUIDE_FUSION,
    question: "Ce guide présente principalement…",
    optionA: "des recettes de cuisine asiatique traditionnelle.",
    optionB: "des techniques de cuisine franco-asiatique et des recettes fusion.",
    optionC: "l'histoire de la gastronomie française.",
    optionD: "un cours de cuisine professionnelle certifiante.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide culinaire fusion franco-asiatique",
    longText: DOC_GUIDE_FUSION,
    question: "Combien de portions permet la recette de velouté de courge butternut au lait de coco ?",
    optionA: "2 personnes.",
    optionB: "4 personnes.",
    optionC: "6 personnes.",
    optionD: "8 personnes.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Les jeux traditionnels et la préservation culturelle",
    longText: ART_JEUX_TRAD,
    question: "Selon l'article, que transmettent les jeux traditionnels au-delà du simple divertissement ?",
    optionA: "Des compétences sportives et physiques.",
    optionB: "Des valeurs, des modes de pensée et de socialisation propres aux cultures.",
    optionC: "Des techniques artisanales ancestrales.",
    optionD: "Des connaissances mathématiques et géométriques.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Les jeux traditionnels et la préservation culturelle",
    longText: ART_JEUX_TRAD,
    question: "Quelle tension fondamentale est évoquée dans la démarche de préservation des jeux traditionnels ?",
    optionA: "La concurrence entre jeux de différentes cultures.",
    optionB: "Le risque de muséification qui viderait les jeux de leur sens vivant.",
    optionC: "Le manque de financement pour les associations culturelles.",
    optionD: "La difficulté à transcrire les règles dans plusieurs langues.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le handisport et sa représentation médiatique",
    longText: ART_HANDISPORT_MEDIA,
    question: "Selon l'article, quelle forme de couverture du handisport reste marginale hors des Jeux Paralympiques ?",
    optionA: "Les grands tournois nationaux.",
    optionB: "Les compétitions ordinaires comme les championnats et tournois régionaux.",
    optionC: "Les retransmissions en direct sur internet.",
    optionD: "Les documentaires sur les athlètes handisport.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le handisport et sa représentation médiatique",
    longText: ART_HANDISPORT_MEDIA,
    question: "Quel problème de représentation des athlètes handisport est soulevé dans l'article ?",
    optionA: "Ils sont trop peu filmés lors des compétitions.",
    optionB: "Ils sont présentés principalement à travers leur handicap plutôt que leurs performances.",
    optionC: "Ils sont souvent confondus avec des athlètes valides.",
    optionD: "Leurs résultats ne sont pas comparés à ceux des athlètes valides.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La reconversion post-minière : entre succès inspirants et cicatrices sociales",
    longText: ART_TRANSITION_MINIERE,
    question: "Quel exemple de reconversion minière est souvent cité comme modèle selon l'article ?",
    optionA: "Le pays de Galles du Sud.",
    optionB: "Le bassin minier du Nord-Pas-de-Calais.",
    optionC: "La Ruhr allemande.",
    optionD: "Les Appalaches américaines.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La reconversion post-minière : entre succès inspirants et cicatrices sociales",
    longText: ART_TRANSITION_MINIERE,
    question: "Quelle utilisation des anciens sites miniers est citée dans l'article pour la transition énergétique ?",
    optionA: "La construction de nouvelles centrales nucléaires.",
    optionB: "L'installation de panneaux solaires sur les terrils et de pompes géothermiques dans les galeries.",
    optionC: "La création de parcs éoliens sur les anciennes mines à ciel ouvert.",
    optionD: "La conversion en usines de production de batteries.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La gastronomie fusion et l'identité nationale",
    longText: ART_CUISINE_FUSION,
    question: "Selon l'article, quelles cuisines fusion sont citées comme examples authentiques nées de rencontres humaines réelles ?",
    optionA: "La cuisine franco-japonaise, le tex-mex et la cuisine créole.",
    optionB: "La chifa péruvienne, le tex-mex et la cuisine créole.",
    optionC: "La cuisine franco-maghrébine, la cuisine créole et le mole mexicain.",
    optionD: "La cuisine sino-française, le tex-mex et la cuisine afro-américaine.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La gastronomie fusion et l'identité nationale",
    longText: ART_CUISINE_FUSION,
    question: "En France, comment la cuisine franco-asiatique ou franco-africaine est-elle parfois perçue selon l'article ?",
    optionA: "Comme une preuve de la vitalité de la gastronomie française.",
    optionB: "Comme une menace pour l'intégrité du patrimoine culinaire national.",
    optionC: "Comme une source d'inspiration reconnue par l'UNESCO.",
    optionD: "Comme une tendance commerciale sans valeur gastronomique.",
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
    console.log(`\n✅ ${created} questions créées pour CE 42.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
