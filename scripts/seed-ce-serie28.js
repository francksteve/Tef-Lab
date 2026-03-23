'use strict';
/**
 * seed-ce-serie28.js
 * Peuple la série CE 28 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie28.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoior000o0wxll1139r2e';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART (revenus industrie jeux vidéo par région) correctAnswer='A' ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [87, 52, 28, 18], color: '#003087' }, // CORRECT — Asie-Pacifique 87G$
    { label: 'Graphique 2', data: [45, 62, 33, 22], color: '#E30613' },
    { label: 'Graphique 3', data: [30, 48, 55, 35], color: '#E30613' },
    { label: 'Graphique 4', data: [40, 35, 70, 42], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Asie-Pacif.', 'Amérique N.', 'Europe', 'Reste monde'];
  const maxVal = 100;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}G$</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Revenus (milliards $)</text>`;
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
  { title: 'Institution 1', content: "La Commission européenne est l'organe exécutif de l'Union européenne. Elle est composée de 27 commissaires (un par État membre) nommés par les gouvernements nationaux et approuvés par le Parlement. Elle propose les législations européennes, veille à l'application des traités, gère le budget et représente l'UE dans les négociations commerciales internationales. Son siège est à Bruxelles." },
  { title: 'Institution 2', content: "Le Parlement européen est la seule institution de l'Union européenne élue directement par les citoyens européens au suffrage universel. Ses 705 membres (eurodéputés) sont élus tous les 5 ans dans l'ensemble des États membres. Il partage le pouvoir législatif avec le Conseil de l'UE, adopte le budget européen et contrôle la Commission. Il siège à Strasbourg pour les sessions plénières et à Bruxelles pour les commissions." },
  { title: 'Institution 3', content: "La Cour de Justice de l'Union européenne (CJUE) est la juridiction suprême de l'UE. Elle garantit l'application uniforme du droit communautaire dans tous les États membres. Elle est compétente pour trancher les litiges entre États membres, entre États et institutions européennes, et pour interpréter les traités. Ses arrêts s'imposent aux juridictions nationales. Elle siège à Luxembourg." },
  { title: 'Institution 4', content: "La Banque Centrale Européenne (BCE) est l'institution monétaire de la zone euro. Elle définit et met en œuvre la politique monétaire pour les 20 États membres ayant adopté l'euro. Son objectif principal est de maintenir la stabilité des prix avec un objectif d'inflation de 2% à moyen terme. Elle siège à Francfort et est dirigée par un président nommé pour 8 ans non renouvelables. Son indépendance vis-à-vis des gouvernements est garantie par les traités." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Restaurant 1', content: "El Bulli, situé sur la Costa Brava en Espagne et dirigé par Ferran Adrià jusqu'en 2011, est considéré comme le restaurant le plus influent du XXIe siècle. Il a inventé la cuisine moléculaire mainstream en appliquant les techniques scientifiques à la gastronomie : sphérification, émulsions, gels, mousses. Élu meilleur restaurant du monde 5 fois entre 2002 et 2009, il a formé des dizaines de chefs devenus eux-mêmes des références mondiales." },
  { title: 'Restaurant 2', content: "Le Noma à Copenhague, fondé par le chef René Redzepi en 2003, a redéfini la cuisine nordique en proposant une approche radicalement locale et saisonnière : fermentation d'ingrédients sauvages (baies, mousses, insectes), valorisation des produits nordiques méconnus, connexion profonde avec l'écosystème scandinave. Élu meilleur restaurant du monde 4 fois par le palmarès 50 Best, il a inspiré une génération de chefs du monde entier vers des cuisines locales et durables." },
  { title: 'Restaurant 3', content: "Osteria Francescana à Modène (Italie), dirigée par Massimo Bottura, est l'un des restaurants les plus célèbres du monde. Proposant une relecture contemporaine et poétique de la cuisine italienne traditionnelle, ses plats sont devenus des œuvres d'art conceptuelles. Élu meilleur restaurant du monde en 2016 et 2018, il est triplement étoilé au Michelin. Bottura est également connu pour son engagement social contre le gaspillage alimentaire." },
  { title: 'Restaurant 4', content: "Le French Laundry à Yountville (Californie), dirigé par Thomas Keller, est la référence absolue de la haute gastronomie américaine. Proposant un menu dégustation de 9 plats renouvelé quotidiennement avec les produits locaux de saison, il a contribué à imposer la cuisine américaine comme grande cuisine mondiale. Doublement étoilé Michelin, il maintient le même niveau d'excellence depuis son ouverture en 1994 et a formé de nombreux grands chefs américains." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Jeu 1', content: "Le jeu de stratégie en temps réel (RTS) est un genre où le joueur gère en direct des ressources, construit des bases et dirige des armées pour affronter des adversaires humains ou contrôlés par ordinateur. Des titres comme StarCraft, Age of Empires et Warcraft ont défini le genre. La gestion simultanée des ressources, des unités et des constructions requiert une vitesse de décision et une planification stratégique élevées." },
  { title: 'Jeu 2', content: "Le jeu de rôle massivement multijoueur en ligne (MMORPG) est un genre de jeu vidéo dans lequel des milliers de joueurs simultanés évoluent dans un monde virtuel persistant. Des titres comme World of Warcraft, Final Fantasy XIV et Guild Wars 2 en sont les représentants emblématiques. Les joueurs créent des personnages, progressent dans des niveaux et s'associent pour accomplir des quêtes coopératives. Ces mondes virtuels évoluent en permanence, même lorsque le joueur est déconnecté." },
  { title: 'Jeu 3', content: "Le battle royale est un genre émergent dans lequel 100 joueurs sont parachutés sur une île et s'affrontent jusqu'à ce qu'il n'en reste qu'un seul. La zone de jeu se rétrécit progressivement pour forcer les confrontations. Des titres comme Fortnite, PUBG et Apex Legends ont popularisé ce format. Sa nature brève (environ 30 minutes par partie) et spectaculaire en a fait le genre le plus streamé sur Twitch et YouTube." },
  { title: 'Jeu 4', content: "Le jeu de simulation sportive recrée virtuellement des sports réels avec une précision croissante : footballeurs aux statistiques réelles, physique de balle simulée, stades modélisés. Des séries comme FIFA/EA Sports FC, NBA 2K et F1 proposent des expériences très proches des sports authentiques. Ces jeux bénéficient de licences officielles des ligues professionnelles qui renforcent leur authenticité. Ils constituent un marché considérable avec des mises à jour annuelles très attendues." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Danse 1', content: "Le ballet classique est une forme de danse scénique codifiée développée en Europe à partir du XVe siècle. Ses techniques précises (positions des pieds et des bras, sauts et pirouettes codifiés), ses tutus et pointes, et ses grandes œuvres du répertoire (Lac des Cygnes, Casse-Noisette, Giselle) en font l'une des formes artistiques les plus exigeantes physiquement. Les grandes compagnies mondiales comme le Ballet de l'Opéra de Paris ou le Royal Ballet sont les gardiennes de ce répertoire." },
  { title: 'Danse 2', content: "La danse hip-hop est née dans les années 1970 dans les communautés afro-américaines et latinos des quartiers défavorisés de New York, notamment dans le Bronx. Elle englobe plusieurs styles : breakdance (b-boying), popping, locking et krump. De forme spontanée et contestataire à ses origines dans les battles de rue, elle est devenue une discipline artistique mondiale enseignée dans les conservatoires et présente dans les émissions télévisées. Elle fera son entrée aux Jeux Olympiques de Paris 2024." },
  { title: 'Danse 3', content: "Le flamenco est une expression artistique complexe née en Andalousie (Espagne) au XVIIIe siècle, associant chant (cante), danse (baile) et guitare (toque). Il reflète les influences des cultures gitane, arabe, juive et africaine présentes dans la péninsule ibérique. Reconnu au patrimoine culturel immatériel de l'UNESCO en 2010, le flamenco est un langage expressif intense qui met en scène des émotions profondes : amour, douleur, fierté. Des artistes comme Carmen Amaya ou Paco de Lucía en ont transcendé les limites." },
  { title: 'Danse 4', content: "La danse contemporaine est une forme d'expression scénique qui a émergé au XXe siècle comme rupture avec les codes rigides du ballet classique. Elle valorise la liberté du mouvement, l'expressivité individuelle et l'exploration des thèmes sociétaux. Des chorégraphes comme Pina Bausch, William Forsythe et Maguy Marin ont redéfini les frontières entre danse et théâtre. Elle se caractérise par l'absence de technique codifiée unique et la primauté de l'intention artistique sur la forme." },
]);

/* ── Documents Q23-32 ── */
const DOC_CPF_FORMATION =
`FORMATION PROFESSIONNELLE — GUIDE CPF (Compte Personnel de Formation)

DROITS ET ALIMENTATION :
• Salarié à temps plein : 500 €/an, plafonné à 5 000 €
• Salarié peu qualifié (sans Bac) : 800 €/an, plafonné à 8 000 €
• Travailleur indépendant : 500 €/an via le Fonds d'Assurance Formation

FORMATIONS ÉLIGIBLES :
• Certifications inscrites au RNCP
• Permis de conduire B
• Bilan de compétences
• VAE (Validation des Acquis de l'Expérience)

UTILISATION :
Vous choisissez librement votre formation. Si le coût dépasse vos droits, vous pouvez solliciter un abondement de votre employeur ou financer le reste à votre charge.

PROCÉDURE : Connexion sur moncompteformation.gouv.fr avec votre numéro de Sécurité Sociale.`;

const DOC_OFFRE_JEU_VIDEO =
`OFFRE D'EMPLOI — DÉVELOPPEUR JEU VIDÉO — UNITY/UNREAL ENGINE
Studio Pixel Dreams — Paris

Notre studio de jeux indépendants recherche un développeur passionné pour rejoindre une équipe de 15 personnes.

MISSIONS :
Développement et optimisation du moteur de jeu, création des systèmes de gameplay (physique, IA, interfaces), intégration des assets graphiques et sonores, débogage et tests de performance.

PROFIL :
Bac+3 à Bac+5 en informatique ou développement jeu vidéo, maîtrise de C# et/ou C++, expérience avec Unity ou Unreal Engine (portfolio de projets requis), passion pour le jeu vidéo indispensable.

CONTRAT : CDI, 35h. Salaire : 36 000 à 48 000 € selon profil.
Avantages : télétravail 2j/semaine, bibliothèque de jeux, locaux modernes, soirées gaming mensuelles.
Portfolio et CV : jobs@pixeldreams.fr`;

const DOC_CONVENTION_MEDIA =
`CONVENTION DE PARTENARIAT — MÉDIAS INDÉPENDANTS ET LIBERTÉ DE LA PRESSE

Entre le Syndicat National de la Presse Indépendante (SNPI) et la Fondation pour le Journalisme de Qualité (FJQ), il est conclu la présente convention pour soutenir les médias indépendants face à la concentration des groupes de presse.

OBJECTIFS :
Renforcer l'indépendance éditoriale des médias associatifs et coopératifs, soutenir la formation continue des journalistes, développer la culture de la vérification des faits (fact-checking).

ENGAGEMENTS DE LA FJQ :
• Financement de 50 bourses de journalisme d'investigation par an (5 000 € chacune)
• Formation de 200 journalistes par an aux méthodes de fact-checking
• Mise à disposition d'outils numériques de veille et d'archivage

DURÉE : 3 ans renouvelables.`;

const DOC_CAHIER_ECO_QUARTIER =
`CAHIER DES CHARGES — ÉCO-QUARTIER NOUVELLE GÉNÉRATION
Appel à projets — Agence Nationale de l'Habitat (ANAH)

L'ANAH lance un appel à projets pour la création de nouveaux éco-quartiers répondant aux standards environnementaux les plus exigeants.

CRITÈRES OBLIGATOIRES :
• Utilisation de matériaux biosourcés (bois, paille, chanvre) pour au moins 40% de la construction
• Performance énergétique : empreinte carbone inférieure de 70% aux constructions conventionnelles
• Mobilité douce : voies cyclables, stationnements vélos, accès transports en commun à moins de 500m

CRITÈRES VALORISANTS :
Biodiversité intégrée (toitures végétales, corridors écologiques), production d'énergie renouvelable, gestion collective de l'eau de pluie, espaces d'agriculture urbaine.`;

const DOC_CONTRAT_DANSE =
`CONTRAT DE RÉSIDENCE ARTISTIQUE
Compagnie Mouvements Libres — Centre Chorégraphique National de Lyon

La Compagnie Mouvements Libres (artiste en résidence) et le CCN de Lyon (structure d'accueil) conviennent de la présente résidence de création pour la période de septembre à décembre 2025.

PRESTATIONS DU CCN :
• Mise à disposition de 3 studios de répétition (250h réparties sur 4 mois)
• Appui technique (son, lumière, plateau) pour 2 semaines de filages
• Prise en charge des frais de déplacement des 8 artistes
• Communication et billetterie pour la première

PRESTATIONS DE LA COMPAGNIE :
• Création et présentation d'une nouvelle pièce d'au moins 50 minutes
• Organisation d'ateliers de médiation (3 sessions au minimum) avec le public
• Présentation d'une maquette au CCN avant le 15 octobre 2025`;

/* ── Articles Q33-40 ── */
const ART_EUROPE =
`HARMONISATION JURIDIQUE EN EUROPE ET SOUVERAINETÉ NATIONALE : UN ÉQUILIBRE DÉLICAT

L'Union européenne repose sur un paradoxe fondateur : des États souverains qui acceptent de transférer une partie de leur souveraineté législative à des institutions supranationales au nom d'intérêts communs. Depuis les traités fondateurs, ce processus d'intégration juridique a connu une accélération remarquable, couvrant aujourd'hui des domaines aussi divers que le droit de la concurrence, la protection des données personnelles, la réglementation financière et les droits des travailleurs.

Le règlement RGPD (Règlement Général sur la Protection des Données), entré en vigueur en 2018, illustre parfaitement ce processus d'harmonisation. En imposant les mêmes règles à tous les acteurs opérant sur le territoire européen, il a transformé la protection de la vie privée en standard mondial. Des entreprises américaines comme Google et Meta ont dû adapter leurs pratiques mondiales sous peine d'amendes considérables.

Mais l'harmonisation juridique suscite également des résistances. Des États membres comme la Hongrie ou la Pologne ont mis en œuvre des réformes judiciaires que la Commission européenne a jugées contraires aux valeurs fondamentales de l'UE, entraînant des procédures d'infraction et le gel de fonds structurels. Cette tension entre vision fédéraliste et vision intergouvernementale de l'Europe reste l'un des clivages les plus profonds au sein de l'Union.

La question de la subsidiarité est au cœur du débat. Ce principe fondateur stipule que l'UE ne doit agir que lorsqu'une action au niveau national est insuffisante pour atteindre les objectifs visés. Son application pratique reste cependant contestée : la frontière entre compétence nationale et européenne est souvent floue et sujette à interprétation politique.`;

const ART_NOMA =
`GASTRONOMIE NORDIQUE ET ÉCONOMIE LOCALE : LE MODÈLE NOMA

Le restaurant Noma à Copenhague a représenté bien plus qu'un établissement gastronomique étoilé. En proposant une cuisine entièrement fondée sur les ingrédients locaux et saisonniers de l'écosystème nordique, il a redéfini ce que pouvait signifier « manger local » et inspiré un mouvement mondial vers des gastronomies enracinées dans leur territoire.

L'impact économique de la « Nouvelle Cuisine Nordique » va bien au-delà de la table. En valorisant des produits autrefois négligés ou méconnus — les herbes sauvages des forêts danoises, les baies arctiques, les algues des fjords norvégiens, les fermentations inspirées des traditions scandinaves — le mouvement a créé de nouveaux marchés pour des producteurs locaux et revitalisé des filières en déclin. Des agriculteurs biologiques, des cueilleurs professionnels et des artisans fromagers ont vu leur activité transformée par la demande des restaurants étoilés.

Le modèle a ses limites. Le Noma lui-même a fermé ses portes en janvier 2024, son fondateur René Redzepi évoquant l'épuisement et les conditions de travail insoutenables d'une cuisine qui exige une perfection permanente. Les scandales sur les horaires excessifs dans les cuisines étoilées ont révélé l'envers du décor d'une industrie qui glorifie le résultat sans questionner les conditions de production.

La question reste posée : peut-on construire un modèle gastronomique durable qui valorise la qualité et l'authenticité des produits locaux sans reposer sur l'épuisement humain de ceux qui les transforment ? La fermeture du Noma a relancé ce débat crucial dans le monde de la haute gastronomie.`;

const ART_JEUX_VIOLENCE =
`JEUX VIDÉO ET VIOLENCE : UN LIEN QUI RÉSISTE À LA SCIENCE

La question du lien entre jeux vidéo violents et comportements agressifs dans la réalité passionne chercheurs, politiques et parents depuis les années 1990. Chaque fois qu'un drame impliquant de jeunes auteurs survient, les jeux vidéo se retrouvent dans le banc des accusés. Mais que dit réellement la science ?

Les études menées sur le sujet donnent des résultats contradictoires. Certaines recherches, notamment celles du psychologue Craig Anderson, établissent des corrélations entre l'exposition à des jeux violents et des indicateurs d'agressivité à court terme en laboratoire. Mais ces effets de laboratoire se généralisent-ils à la violence réelle ? C'est là que le consensus scientifique fait défaut.

Une méta-analyse de l'American Psychological Association publiée en 2020, portant sur plus de 300 études, a conclu à l'absence de lien probant entre jeux vidéo violents et comportements violents réels. Plus significatif encore : les pays avec les taux de pénétration de jeux vidéo les plus élevés (Japon, Corée du Sud, Europe du Nord) présentent certains des taux de violence les plus bas au monde.

Les psychologues insistent davantage sur d'autres facteurs de risque : environnement familial défavorable, isolement social, troubles psychologiques préexistants, accès aux armes. Les jeux vidéo peuvent constituer un facteur contextuel pour des individus déjà fragilisés, mais ne peuvent pas être tenus pour responsables de la violence sociale dans son ensemble. Cette conclusion nuancée satisfait moins les politiques que la dénonciation simple, mais elle est celle de la majorité des experts.`;

const ART_VILLES_DURABLES =
`VILLES DURABLES ET QUALITÉ DE VIE : LA RÉVOLUTION SILENCIEUSE DE L'URBANISME

Les villes concentrent aujourd'hui plus de 55% de la population mondiale et génèrent 70% des émissions mondiales de gaz à effet de serre. Leur transformation vers des modèles plus durables constitue donc un enjeu climatique majeur. Mais comment construire des villes qui soient à la fois plus écologiques et plus agréables à vivre ?

Des exemples pionniers montrent la voie. Fribourg-en-Brisgau en Allemagne a construit le quartier Vauban, un éco-quartier de 5 500 habitants entièrement conçu sans parking individuel, avec des maisons passives et une production solaire qui couvre les besoins énergétiques. Les transports en commun et les vélos y sont les modes de déplacement dominants. La qualité de vie y est unanimement reconnue comme excellente par ses habitants.

Copenhague ambitionne de devenir la première ville carbone-neutre en 2025. Son réseau cyclable de 400 km, son chauffage urbain alimenté à 65% par des énergies renouvelables et sa politique de réduction des déchets font d'elle un modèle mondial de ville durable. Cette ambition n'a pas nui à son attractivité économique bien au contraire : la capitale danoise figure régulièrement dans les palmarès des villes les plus attractives pour les entreprises et les talents.

En France, la démarche ÉcoQuartier labellisée par le gouvernement a permis de développer plus de 800 projets à travers le territoire, intégrant mixité sociale, performances énergétiques, mobilité douce et biodiversité. Ces expériences démontrent que durabilité et qualité de vie ne sont pas contradictoires mais, au contraire, mutuellement renforcées.`;

function buildQuestions() {
  const qs = [];

  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL DE DANSE CONTEMPORAINE — ONDES CHORÉGRAPHIQUES
Théâtre de la Ville, Paris — 5ème édition

DU 3 AU 21 MARS 2026

PROGRAMME SÉLECTIONNÉ :
• PINA BAUSCH TANZTHEATER WUPPERTAL : Kontakthof (reprise 2026) — 3-5 mars
• COMPAGNIE MOUVEMENTS LIBRES : Abysses (création mondiale) — 8-10 mars
• BATSHEVA DANCE COMPANY (Israël) : Venezuela — 14-16 mars
• ALVIN AILEY AMERICAN DANCE THEATER : Revelations — 19-21 mars

TARIFS : 28 € / 18 € réduit / 10 € jeune (-26 ans)
Abonnement 4 spectacles : 80 € | Pass Famille : 60 €
Réservations : theatre-de-la-ville.com ou 01 42 74 22 77`,
    question: "D'après ce programme, quel spectacle est une création mondiale ?",
    optionA: "Kontakthof",
    optionB: "Abysses",
    optionC: "Venezuela",
    optionD: "Revelations",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`SALON PARIS GAME WEEK 2025
Paris Expo Porte de Versailles — Halls 2, 4 et 6
Du 28 octobre au 2 novembre 2025

Plus grand événement du jeu vidéo en France
• 300 exposants | 250 000 visiteurs attendus
• Zone Compétitions : tournois FIFA, League of Legends, Rocket League
• Zone Réalité Virtuelle & Augmentée : 50 expériences disponibles
• Espace Indépendants : 80 studios présentent leurs créations
• Conférences et master classes par les créateurs des jeux

TARIFS D'ENTRÉE :
Journée standard : 22 € | Pass 3 jours : 49 €
Enfant -12 ans : 12 € | Étudiant : 18 €
Billets en vente sur parisgameweek.fr`,
    question: "D'après ce document, combien de studios indépendants exposent leurs créations ?",
    optionA: "50 studios.",
    optionB: "80 studios.",
    optionC: "250 studios.",
    optionD: "300 studios.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT — FORMATION CONTINUE ET CERTIFICATION CPF

Le présent règlement s'applique à toutes les formations éligibles au Compte Personnel de Formation dispensées par notre organisme certifié Qualiopi.

CONDITIONS D'ADMISSION :
Toute personne titulaire d'un CPF peut financer sa formation. En cas de droits insuffisants, un financement complémentaire peut être accordé par l'OPCO de branche ou sur fonds propres.

ASSIDUITÉ ET VALIDATION :
La présence à 80% minimum des heures de formation est requise pour la validation. Tout abandon en cours de formation sans motif légitime entraîne le remboursement du financement CPF utilisé.

CERTIFICATION :
Une évaluation finale détermine l'obtention de la certification visée. En cas d'échec, un rattrapage est possible dans les 3 mois.`,
    question: "Selon ce règlement, quel est le taux de présence minimum requis pour valider une formation ?",
    optionA: "70%",
    optionB: "80%",
    optionC: "90%",
    optionD: "100%",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — Console de jeux à vendre
PlayStation 5 Slim (disque) — État excellent, achetée en décembre 2024
Utilisée environ 3 mois — Garantie Sony restante jusqu'en décembre 2025

INCLUS DANS LA VENTE :
2 manettes DualSense, câbles HDMI et alimentation, station de charge pour les 2 manettes, 3 jeux en boîte : God of War Ragnarök, Spider-Man 2, Horizon Forbidden West.

RAISON DE LA VENTE : Passage au PC gaming.

PRIX : 450 € (ferme, prix neuf console seule : 450 €, jeux valent 150 € en tout)
Remise en main propre Lyon uniquement. Pas d'envoi.
WhatsApp : 06 XX XX XX XX`,
    question: "D'après cette annonce, pourquoi le vendeur se sépare-t-il de sa console ?",
    optionA: "La console est défectueuse.",
    optionB: "Il passe au PC gaming.",
    optionC: "Il achète une Xbox.",
    optionD: "Il a besoin d'argent urgent.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`KIT CUISINE NORDIQUE SAVEURS DU NORD — GUIDE D'UTILISATION
Préparation du saumon gravlax maison

INGRÉDIENTS (pour 6 personnes) :
800 g de filet de saumon très frais (qualité sashimi), 60 g de sel fin, 60 g de sucre, 1 c.s. de poivre blanc concassé, 1 bouquet d'aneth frais, zeste d'1 citron

PRÉPARATION :
1. Mélangez sel, sucre, poivre et zeste de citron
2. Étalez la moitié du mélange dans un plat, posez le saumon côté peau
3. Recouvrez d'aneth haché puis du reste du mélange salé
4. Filmez et laissez mariner 48h au réfrigérateur en retournant toutes les 12h
5. Rincez, séchez et tranchez finement avant de servir`,
    question: "D'après ce guide, combien de temps faut-il laisser mariner le saumon ?",
    optionA: "12 heures.",
    optionB: "24 heures.",
    optionC: "48 heures.",
    optionD: "72 heures.",
    correctAnswer: 'C',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — COLLECTIF POUR UN URBANISME DURABLE (CUD)

Le Collectif pour un Urbanisme Durable lance aujourd'hui sa campagne nationale pour accélérer la création d'éco-quartiers en France.

Alors que la France s'est engagée à atteindre la neutralité carbone en 2050, les villes représentent 72% des émissions nationales de gaz à effet de serre. La transformation des quartiers existants et la création de nouveaux quartiers durables constituent un levier essentiel de la transition écologique.

NOS DEMANDES :
• Multiplication par 3 du budget national dédié aux éco-quartiers d'ici 2027
• Obligation d'intégrer des critères de durabilité dans tout nouveau projet de construction de plus de 50 logements
• Formation obligatoire de tous les architectes et urbanistes aux normes environnementales

Contact presse : communication@cud-france.org`,
    question: "Ce communiqué vise principalement à…",
    optionA: "Présenter les réalisations récentes en matière d'urbanisme.",
    optionB: "Promouvoir des demandes pour accélérer la création d'éco-quartiers.",
    optionC: "Critiquer le gouvernement pour son inaction climatique.",
    optionD: "Recruter de nouveaux membres pour le collectif.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`FORUM DES MÉDIAS INDÉPENDANTS — Paris 2026

L'Association Reporters Sans Frontières et le Syndicat de la Presse Indépendante organisent la 4ème édition du Forum des Médias Indépendants.

DATE : Vendredi 20 et Samedi 21 février 2026
LIEU : La Gaîté Lyrique, Paris 3e

PROGRAMME :
• Tables rondes : financement participatif, modèles coopératifs de presse
• Ateliers : fact-checking, journalisme de données, protection des sources
• Keynotes : directeurs de Mediapart, Le Media, Arrêt sur Images
• Prix du Journalisme Indépendant (remise le samedi soir)

TARIF : Entrée libre sur inscription — forummedias2026.fr`,
    question: "Ce document est…",
    optionA: "Une publicité pour s'abonner à des journaux indépendants.",
    optionB: "Une invitation à un forum professionnel sur les médias indépendants.",
    optionC: "Un article sur la liberté de la presse en France.",
    optionD: "Un communiqué officiel du gouvernement sur la presse.",
    correctAnswer: 'B',
  }));

  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le règlement européen doit être ___ dans le droit national dans un délai de deux ans après son adoption par le Parlement et le Conseil.",
    question: PHRASE_Q,
    optionA: "publié",
    optionB: "transposé",
    optionC: "appliqué",
    optionD: "voté",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le chef scandinave utilise la ___ des baies sauvages pour créer des condiments au goût complexe et acidulé caractéristiques de la nouvelle cuisine nordique.",
    question: PHRASE_Q,
    optionA: "cuisson",
    optionB: "fermentation",
    optionC: "congélation",
    optionD: "déshydratation",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le jeu de rôle en ligne est apprécié pour la qualité de son ___ utilisateur qui guide intuitivement le joueur dans la navigation de menus complexes.",
    question: PHRASE_Q,
    optionA: "scénario",
    optionB: "gameplay",
    optionC: "interface",
    optionD: "graphisme",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le plan d'urbanisme prévoit la rénovation des bâtiments de cet ___ résidentiel pour améliorer la performance énergétique du quartier.",
    question: PHRASE_Q,
    optionA: "bloc",
    optionB: "ilôt",
    optionC: "zone",
    optionD: "secteur",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ éditoriale de ce journal est clairement engagée à gauche, ce qui influence le traitement de l'actualité politique.",
    question: PHRASE_Q,
    optionA: "position",
    optionB: "ligne",
    optionC: "direction",
    optionD: "rédaction",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ a créé un spectacle mêlant danse, théâtre et musique live pour explorer les thèmes de l'exil et de l'identité culturelle.",
    question: PHRASE_Q,
    optionA: "troupe",
    optionB: "chorégraphie",
    optionC: "compagnie",
    optionD: "scène",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_1 =
    "La construction de l'éco-quartier privilégie l'utilisation de [14] biosourcés comme le bois, la paille et le chanvre, qui ont une [15] carbone bien inférieure aux matériaux conventionnels comme le béton et l'acier.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La construction d'éco-quartiers",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "matériaux biosourcés",
    optionB: "techniques",
    optionC: "procédés",
    optionD: "équipements",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La construction d'éco-quartiers",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "empreinte",
    optionB: "quantité",
    optionC: "consommation",
    optionD: "production",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "L'industrie du jeu vidéo fait face à des critiques croissantes concernant les [16], des achats internes aux jeux permettant d'obtenir des avantages ou des contenus supplémentaires. Ces pratiques commerciales auraient des effets sur les [17] d'achat des joueurs, notamment chez les mineurs.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'industrie du jeu vidéo",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "micro-transactions",
    optionB: "abonnements",
    optionC: "téléchargements",
    optionD: "mises à jour",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'industrie du jeu vidéo",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "comportements",
    optionB: "horaires",
    optionC: "habitudes",
    optionD: "résultats",
    correctAnswer: 'A',
  }));

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle institution européenne est la seule élue directement par les citoyens ?",
    optionA: "Institution 1",
    optionB: "Institution 2",
    optionC: "Institution 3",
    optionD: "Institution 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel restaurant a redéfini la cuisine nordique avec fermentation et ingrédients locaux sauvages ?",
    optionA: "Restaurant 1",
    optionB: "Restaurant 2",
    optionC: "Restaurant 3",
    optionD: "Restaurant 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel genre de jeu vidéo est un jeu en ligne persistant avec des milliers de joueurs simultanés ?",
    optionA: "Jeu 1",
    optionB: "Jeu 2",
    optionC: "Jeu 3",
    optionD: "Jeu 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle danse urbaine est née dans les années 1970 aux États-Unis dans les communautés afro-américaines ?",
    optionA: "Danse 1",
    optionB: "Danse 2",
    optionC: "Danse 3",
    optionD: "Danse 4",
    correctAnswer: 'B',
  }));

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « L'Asie-Pacifique génère les revenus les plus élevés dans l'industrie du jeu vidéo avec 87 milliards de dollars, soit 47% du marché mondial. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Formation professionnelle — Guide CPF",
    longText: DOC_CPF_FORMATION,
    question: "Ce document présente principalement…",
    optionA: "Les conditions de licenciement pour refus de formation.",
    optionB: "Le fonctionnement du Compte Personnel de Formation.",
    optionC: "La liste des organismes de formation agréés.",
    optionD: "Les droits aux congés de formation des salariés.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Formation professionnelle — Guide CPF",
    longText: DOC_CPF_FORMATION,
    question: "Selon ce document, quel montant annuel un salarié à temps plein acquiert-il en droits CPF ?",
    optionA: "300 €",
    optionB: "500 €",
    optionC: "800 €",
    optionD: "1 000 €",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Développeur jeu vidéo",
    longText: DOC_OFFRE_JEU_VIDEO,
    question: "Cette offre d'emploi recherche un développeur maîtrisant…",
    optionA: "Python et Java uniquement.",
    optionB: "C# et/ou C++ avec expérience Unity ou Unreal Engine.",
    optionC: "HTML et CSS pour le développement web de jeux.",
    optionD: "Exclusivement les langages de programmation de jeux mobiles.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Développeur jeu vidéo",
    longText: DOC_OFFRE_JEU_VIDEO,
    question: "Parmi les avantages du poste, on trouve…",
    optionA: "Un logement de fonction à Paris.",
    optionB: "Le télétravail 2 jours par semaine et une bibliothèque de jeux.",
    optionC: "Un abonnement illimité à toutes les plateformes de jeux.",
    optionD: "Des primes trimestrielles basées sur les ventes du studio.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Médias indépendants",
    longText: DOC_CONVENTION_MEDIA,
    question: "Cette convention de partenariat a été conclue entre…",
    optionA: "Le Ministère de la Culture et les journaux indépendants.",
    optionB: "Le SNPI et la Fondation pour le Journalisme de Qualité.",
    optionC: "L'État français et les agences de presse internationales.",
    optionD: "Les blogueurs indépendants et les chaînes de télévision.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Médias indépendants",
    longText: DOC_CONVENTION_MEDIA,
    question: "Selon la convention, combien de journalistes seront formés au fact-checking chaque année ?",
    optionA: "50 journalistes.",
    optionB: "200 journalistes.",
    optionC: "500 journalistes.",
    optionD: "1 000 journalistes.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Éco-quartier nouvelle génération",
    longText: DOC_CAHIER_ECO_QUARTIER,
    question: "Ce document est un…",
    optionA: "Guide d'utilisation d'un quartier écologique.",
    optionB: "Appel à projets pour la création d'éco-quartiers.",
    optionC: "Bilan des éco-quartiers existants en France.",
    optionD: "Règlement intérieur d'un éco-quartier.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Éco-quartier nouvelle génération",
    longText: DOC_CAHIER_ECO_QUARTIER,
    question: "Selon ce cahier des charges, quel pourcentage de la construction doit utiliser des matériaux biosourcés ?",
    optionA: "Au moins 20%.",
    optionB: "Au moins 40%.",
    optionC: "Au moins 60%.",
    optionD: "100%.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Contrat de résidence artistique — Compagnie Mouvements Libres",
    longText: DOC_CONTRAT_DANSE,
    question: "Ce contrat concerne…",
    optionA: "L'achat de droits d'auteur d'une pièce chorégraphique.",
    optionB: "Une résidence de création d'une compagnie de danse au CCN de Lyon.",
    optionC: "La formation de danseurs professionnels au CCN.",
    optionD: "La tournée d'une compagnie dans plusieurs villes françaises.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Contrat de résidence artistique — Compagnie Mouvements Libres",
    longText: DOC_CONTRAT_DANSE,
    question: "Selon ce contrat, quelle est la durée minimale de la pièce que la compagnie doit créer ?",
    optionA: "30 minutes.",
    optionB: "50 minutes.",
    optionC: "60 minutes.",
    optionD: "90 minutes.",
    correctAnswer: 'B',
  }));

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Harmonisation juridique en Europe et souveraineté nationale",
    longText: ART_EUROPE,
    question: "Selon cet article, quel règlement européen illustre le mieux le processus d'harmonisation juridique ?",
    optionA: "Le traité de Maastricht de 1992.",
    optionB: "Le RGPD entré en vigueur en 2018.",
    optionC: "La directive sur les travailleurs détachés.",
    optionD: "Le traité de Lisbonne de 2007.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Harmonisation juridique en Europe et souveraineté nationale",
    longText: ART_EUROPE,
    question: "D'après l'auteur, quel est le clivage le plus profond au sein de l'UE ?",
    optionA: "La question de l'immigration et des frontières.",
    optionB: "La tension entre vision fédéraliste et vision intergouvernementale de l'Europe.",
    optionC: "Le débat entre États fondateurs et nouveaux membres.",
    optionD: "Les différences de niveau de développement économique.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Gastronomie nordique et économie locale : le modèle Noma",
    longText: ART_NOMA,
    question: "Selon cet article, quand le restaurant Noma a-t-il fermé ses portes ?",
    optionA: "En décembre 2022.",
    optionB: "En janvier 2024.",
    optionC: "En mars 2023.",
    optionD: "En juin 2025.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Gastronomie nordique et économie locale : le modèle Noma",
    longText: ART_NOMA,
    question: "D'après l'auteur, quel est le vrai défi du modèle gastronomique nordique ?",
    optionA: "Trouver des ingrédients locaux en quantité suffisante.",
    optionB: "Construire un modèle valorisant la qualité sans reposer sur l'épuisement humain.",
    optionC: "Convaincre les touristes étrangers de venir dans les restaurants nordiques.",
    optionD: "Obtenir des étoiles Michelin pour les restaurants de toute la région.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Jeux vidéo et violence : un lien qui résiste à la science",
    longText: ART_JEUX_VIOLENCE,
    question: "Selon la méta-analyse de l'American Psychological Association, quel est le résultat principal concernant jeux vidéo et violence ?",
    optionA: "Les jeux violents rendent les adolescents agressifs dans la vie réelle.",
    optionB: "Il n'y a pas de lien probant entre jeux vidéo violents et violence réelle.",
    optionC: "Les jeux de guerre sont la principale cause de la violence sociale.",
    optionD: "Les filles sont plus affectées que les garçons par les jeux violents.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Jeux vidéo et violence : un lien qui résiste à la science",
    longText: ART_JEUX_VIOLENCE,
    question: "D'après l'article, quels pays présentent les taux de violence les plus bas malgré une forte pénétration des jeux vidéo ?",
    optionA: "La France, l'Espagne et l'Italie.",
    optionB: "Le Japon, la Corée du Sud et l'Europe du Nord.",
    optionC: "Les États-Unis, le Canada et l'Australie.",
    optionD: "L'Allemagne, les Pays-Bas et la Belgique.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Villes durables et qualité de vie",
    longText: ART_VILLES_DURABLES,
    question: "Selon cet article, quelle proportion des émissions mondiales de CO₂ les villes génèrent-elles ?",
    optionA: "40%",
    optionB: "55%",
    optionC: "70%",
    optionD: "85%",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Villes durables et qualité de vie",
    longText: ART_VILLES_DURABLES,
    question: "D'après l'article, à quelle année Copenhague ambitionne-t-elle d'atteindre la neutralité carbone ?",
    optionA: "2023",
    optionB: "2025",
    optionC: "2030",
    optionD: "2040",
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
    console.log(`\n✅ ${created} questions créées pour CE 28.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
