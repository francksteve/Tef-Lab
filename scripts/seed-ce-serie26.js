'use strict';
/**
 * seed-ce-serie26.js
 * Peuple la série CE 26 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie26.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoiaj000m0wxln1eoarnm';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART (budget programmes spatiaux par agence) correctAnswer='B' ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [55, 18, 12, 8], color: '#E30613' },
    { label: 'Graphique 2', data: [15, 22, 10, 7], color: '#003087' }, // CORRECT — agence B = 22 milliards
    { label: 'Graphique 3', data: [20, 14, 18, 11], color: '#E30613' },
    { label: 'Graphique 4', data: [12, 16, 9, 6], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Agence A', 'Agence B', 'Agence C', 'Agence D'];
  const maxVal = 60;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 15, 30, 45, 60].map(v => {
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
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Budget (milliards $)</text>`;
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
  { title: 'Programme 1', content: "Le programme Apollo, mené par la NASA entre 1961 et 1972, a accompli le premier atterrissage humain sur la Lune le 20 juillet 1969 avec les astronautes Neil Armstrong et Buzz Aldrin. Ce programme emblématique de la guerre froide a nécessité l'effort de plus de 400 000 ingénieurs et techniciens. Il reste l'un des exploits technologiques les plus remarquables de l'histoire humaine." },
  { title: 'Programme 2', content: "La Station Spatiale Internationale (ISS) est une station en orbite terrestre basse habitée en permanence depuis le 2 novembre 2000. Fruit d'une coopération entre 15 nations (NASA, ESA, Roscosmos, JAXA, CSA), elle orbite à 400 km d'altitude à une vitesse de 28 000 km/h, effectuant 16 révolutions par jour. Elle sert de laboratoire de recherche scientifique en microgravité et est visible à l'œil nu depuis la Terre." },
  { title: 'Programme 3', content: "Le programme Artemis de la NASA vise à envoyer des astronautes sur la Lune dans les années 2020, incluant la première femme et la première personne de couleur à y poser le pied. Ce programme prépare également une mission habitée vers Mars. Il mobilise des partenaires internationaux et des entreprises privées comme SpaceX et Blue Origin pour développer les véhicules de transport et les habitats lunaires." },
  { title: 'Programme 4', content: "Le programme Galileo est le système européen de navigation par satellite (GNSS) développé par l'ESA et l'Union européenne comme alternative civile et indépendante au GPS américain. Pleinement opérationnel depuis 2016 avec 30 satellites en orbite, Galileo offre une précision de positionnement inférieure au mètre pour les utilisateurs civils. Il équipe aujourd'hui la quasi-totalité des smartphones vendus en Europe." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Animation 1', content: "L'animation 2D traditionnelle est la technique historique du cinéma d'animation, qui consiste à dessiner à la main chaque image (frame) d'un film. Pour donner l'illusion du mouvement, il faut au minimum 12 à 24 images par seconde. Cette technique, portée à son excellence par les studios Disney dans les années 1930-40, reste utilisée pour des effets artistiques particuliers, bien que supplanée dans la production commerciale par l'animation numérique." },
  { title: 'Animation 2', content: "Le stop-motion est une technique d'animation qui consiste à photographier des objets physiques réels, figurines, marionnettes ou personnages en pâte à modeler, position par position. Entre chaque prise de vue, l'objet est légèrement déplacé. La projection successive des images crée l'illusion du mouvement. Cette technique artisanale exigeante produit des animations à la texture unique, comme en témoignent les films du studio Aardman (Wallace et Gromit)." },
  { title: 'Animation 3', content: "L'animation 3D par ordinateur (CGI) est la technique dominante de l'animation contemporaine. Elle consiste à créer des personnages et environnements tridimensionnels dans un logiciel, puis à les animer par manipulation d'un squelette numérique. Des studios comme Pixar, DreamWorks et Illumination ont popularisé cette esthétique. La puissance de calcul nécessaire est considérable : certains plans de films Pixar prennent des semaines à calculer." },
  { title: 'Animation 4', content: "La motion capture (mocap) est une technique hybride qui enregistre les mouvements d'acteurs réels équipés de capteurs pour les transférer sur des personnages numériques. Utilisée d'abord dans les jeux vidéo, elle est entrée dans le cinéma d'animation avec des films comme Le Pôle Express de Robert Zemeckis. Elle permet des animations très réalistes mais souffre parfois d'un effet de vallée de l'étrange quand les personnages sont trop proches de l'apparence humaine." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Structure 1', content: "L'association loi 1901 est la forme juridique la plus répandue pour les organisations à but non lucratif en France. Elle regroupe au minimum deux personnes autour d'un projet commun sans objectif de profit. Ses dirigeants bénévoles ne peuvent pas percevoir de rémunération pour leur mandat. L'association peut cependant employer des salariés pour ses activités. Elle est financée par les cotisations de ses membres, les subventions publiques et les dons." },
  { title: 'Structure 2', content: "La SCOP (Société Coopérative et Participative) est une société dont les salariés sont les associés majoritaires. Ils détiennent au moins 51% du capital et 65% des droits de vote. Chaque salarié associé dispose d'une voix lors des assemblées générales, quel que soit le montant de sa participation au capital. Les bénéfices sont partagés entre les salariés, le capital et les réserves de l'entreprise. La SCOP incarne le modèle de l'économie sociale et solidaire." },
  { title: 'Structure 3', content: "La mutuelle est une société de personnes à but non lucratif qui fonctionne selon le principe de solidarité entre ses membres. Elle propose des garanties de protection sociale complémentaires à la Sécurité sociale dans les domaines de la santé, la prévoyance et la retraite. Les excédents réalisés sont réinvestis dans l'amélioration des garanties ou la réduction des cotisations. Les mutuelles sont régies par le Code de la Mutualité." },
  { title: 'Structure 4', content: "Le GIE (Groupement d'Intérêt Économique) permet à des entreprises existantes de mettre en commun certaines activités pour améliorer leurs résultats sans fusionner. Il peut réaliser des bénéfices mais son but est d'agir pour ses membres plutôt que de générer des profits propres. Le GIE est un outil de coopération économique flexible utilisé notamment par les cabinets d'avocats et de conseil pour partager des ressources ou prospecter des marchés communs." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Espace vert 1', content: "Le parc urbain est un espace vert public de grande superficie aménagé en milieu urbain pour le loisir et la détente des habitants. Il comprend généralement des allées, des pelouses, des aires de jeux pour enfants, des espaces sportifs et parfois des plans d'eau. Le Bois de Boulogne à Paris et le Parc de la Tête d'Or à Lyon sont des exemples emblématiques. Ces parcs jouent un rôle crucial dans la régulation thermique urbaine et le bien-être des citadins." },
  { title: 'Espace vert 2', content: "Le jardin thérapeutique est un espace vert spécialement conçu et aménagé pour favoriser le bien-être physique et psychologique des patients en milieu médical ou médico-social. Il intègre des parcours adaptés aux personnes à mobilité réduite, des plantations sensorielles (parfums, textures, couleurs) et des zones de jardinage participatif. Ces jardins sont implantés dans les hôpitaux, les EHPAD et les établissements psychiatriques comme outil complémentaire de soin." },
  { title: 'Espace vert 3', content: "Le jardin partagé est un espace collectif géré par un groupe de citadins qui cultivent ensemble des légumes, des fleurs et des plantes aromatiques sur des parcelles individuelles ou collectives. Ces jardins favorisent le lien social entre voisins, l'apprentissage de l'horticulture et l'accès à une alimentation locale. Le mouvement des jardins partagés s'est développé rapidement dans les villes françaises depuis les années 2000 en réponse au manque d'espaces verts privatifs." },
  { title: 'Espace vert 4', content: "La forêt urbaine désigne des plantations arborées denses en milieu urbain, dépassant le simple alignement d'arbres. Implantées sur des friches industrielles ou des terrains délaissés, ces micro-forêts selon la méthode Miyawaki permettent de créer en quelques années un écosystème boisé autoentretenu. Elles réduisent les îlots de chaleur, absorbent le CO₂ et favorisent la biodiversité animale et végétale au cœur des villes." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_COOP =
`RÈGLEMENT INTÉRIEUR — COOPÉRATIVE AGRICOLE TERRA BIO

MEMBRES ET COTISATIONS :
Tout producteur agricole certifié agriculture biologique peut adhérer à la coopérative en acquérant au minimum une part sociale de 500 €. La cotisation annuelle de fonctionnement est de 150 €.

OBLIGATIONS DES MEMBRES :
• Livrer au moins 70% de la production à la coopérative aux conditions tarifaires négociées collectivement
• Respecter les standards de qualité et de traçabilité définis dans le cahier des charges interne
• Participer aux assemblées générales (au moins une par an obligatoirement)

DROITS DES MEMBRES :
• Accès aux services collectifs : stockage, transformation, transport, commercialisation
• Partage des bénéfices proportionnel aux apports
• Vote lors des décisions importantes à raison d'une voix par membre`;

const DOC_OFFRE_INGENIEUR =
`OFFRE D'EMPLOI — INGÉNIEUR AÉROSPATIAL
Centre Spatial Guyanais — Kourou

L'Agence Spatiale Européenne (ESA) recherche un ingénieur aérospatial pour intégrer son équipe de lancement à Kourou, Guyane.

MISSIONS :
Participation aux opérations de préparation et de lancement des lanceurs Ariane 6, analyse des données de télémétrie, résolution des anomalies techniques, collaboration avec les équipes internationales.

PROFIL :
Diplôme d'ingénieur en aérospatiale, mécanique des fluides ou électronique (Bac+5 minimum), expérience de 2 ans en environnement technique exigeant, maîtrise de l'anglais et du français, mobilité Guyane exigée.

CONTRAT : CDD 3 ans renouvelable. Avantages expatriation : indemnité de vie chère, logement de fonction, billet annuel pour la métropole.`;

const DOC_CONTRAT_SCENE =
`CONTRAT D'ENGAGEMENT — SCÉNOGRAPHE DE THÉÂTRE

Entre le Théâtre National de Strasbourg (TNS) et Mme Amara Diallo (scénographe), il est convenu :

OBJET : Conception et réalisation de la scénographie de la pièce "Les Âmes Errantes" mise en scène par Marc Lebreton pour la saison 2025-2026.

PRESTATIONS :
Création des décors, des accessoires et de la lumière, suivi de la fabrication avec les ateliers, présence aux répétitions techniques, accompagnement des représentations jusqu'à la première officielle.

CALENDRIER :
• Remise des esquisses : 15 octobre 2025
• Début des répétitions scénographiques : 3 novembre 2025
• Première officielle : 5 décembre 2025

RÉMUNÉRATION : 12 000 € net en trois versements.`;

const DOC_CHARTE_JARDIN =
`CHARTE DU JARDIN COLLECTIF LES BELLES POUSSES
Quartier de la Croix-Rousse, Lyon

DROITS DES JARDINIERS :
• Accès au jardin tous les jours de 8h à 20h
• Attribution d'une parcelle de 9 m² par foyer, renouvelable chaque année
• Utilisation des outils et du matériel commun (brouette, arrosoirs, bêches)
• Récolter exclusivement les fruits de sa propre parcelle

DEVOIRS DES JARDINIERS :
• Entretenir sa parcelle régulièrement et la laisser propre
• Ne pas utiliser de pesticides ou d'engrais chimiques de synthèse
• Participer aux journées collectives de travail (minimum 2 par an)
• Respecter le calme et la tranquillité du lieu`;

const DOC_CONVENTION_ANIM =
`CONVENTION COLLECTIVE NATIONALE
Secteur de l'Animation Culturelle et Jeunesse

La présente convention régit les conditions d'emploi des salariés permanents et intermittents du secteur de l'animation socioculturelle.

TEMPS DE TRAVAIL :
La durée hebdomadaire est de 35 heures pour les permanents. Les animateurs intermittents relèvent du statut d'intermittent du spectacle avec une comptabilisation en cachets.

RÉMUNÉRATION MINIMALE :
Animateur débutant : 1 900 € brut/mois | Animateur confirmé (3 ans exp.) : 2 200 € | Coordinateur : 2 600 €

CONGÉS ET FORMATION :
5 semaines de congés payés + 5 jours de congés conventionnels supplémentaires. Droit à la formation : 35 heures par an pris en charge à 100% par l'employeur.`;

/* ── Articles Q33-40 ── */
const ART_MARS =
`COLONISATION DE MARS : QUAND L'AMBITION SPATIALE INTERROGE L'ÉTHIQUE

L'idée d'envoyer des humains sur Mars, longtemps cantonnée à la science-fiction, est devenue un objectif sérieux pour plusieurs agences spatiales et entrepreneurs milliardaires. SpaceX, avec son fondateur Elon Musk, a annoncé son intention d'établir une colonie d'un million de personnes sur la Planète Rouge d'ici 2050. La NASA et l'ESA développent leurs propres feuilles de route pour une mission habitée martienne d'ici les années 2030.

Les défis techniques sont colossaux. Le voyage dure entre 6 et 9 mois, exposant les astronautes à des doses de radiation bien supérieures aux normes terrestres. L'atmosphère martienne, composée à 95% de CO₂ avec une pression 100 fois inférieure à la Terre, est irrespirable. Les températures varient de -125°C la nuit à +20°C le jour en été équatorial. Produire de l'eau, de l'oxygène et de la nourriture in situ représente des défis d'ingénierie considérables.

Mais c'est la dimension éthique qui suscite les débats les plus profonds. A-t-on le droit de contaminer biologiquement une planète potentiellement abritant des formes de vie microbienne ? Qui gouvernerait une colonie martienne ? Serait-elle soumise aux lois terrestres ou développerait-elle son propre système politique ? Le Traité sur l'espace de 1967 interdit l'appropriation nationale des corps célestes, mais reste silencieux sur la colonisation privée.

La question de l'équité est également posée. Dans un monde où des milliards de personnes manquent d'eau potable et d'accès aux soins, est-il éthiquement défendable de dépenser des centaines de milliards pour envoyer une poignée de privilégiés sur une autre planète ? Pour ses défenseurs, la diversification de l'humanité sur plusieurs planètes constitue une assurance contre l'extinction.`;

const ART_ANIMATION =
`LE CINÉMA D'ANIMATION FRANÇAIS ET LA MONDIALISATION : ENTRE IDENTITÉ ET COMPÉTITION

La France possède une tradition riche d'animation d'auteur, de la Linea d'Osvaldo Cavandoli aux créations contemporaines de Michel Ocelot (Kirikou, Azur et Asmar) ou des studios Folimage. Cette animation française se distingue par une approche artistique exigeante, des narrations complexes et une esthétique souvent très éloignée des codes hollywoodiens. Elle bénéficie du soutien du CNC (Centre National du Cinéma) qui finance un tiers de sa production.

Cependant, la concurrence mondiale s'est considérablement intensifiée. Les studios américains Pixar, DreamWorks et Walt Disney continuent de dominer le marché avec des budgets colossaux et une distribution planétaire. Les studios japonais (Ghibli, Makoto Shinkai) bénéficient d'une aura artistique mondiale croissante. La Corée du Sud et la Chine investissent massivement dans l'animation de grande qualité.

Pour s'adapter, les studios français ont développé des stratégies de coproduction internationale, associant financement européen, talent artistique français et distribution mondiale. Des succès comme "Le Voyage du Prince" ou "La Prophétie des grenouilles" ont démontré que l'animation française pouvait conquérir des publics internationaux sans renoncer à son identité artistique.

Les plateformes de streaming représentent à la fois une menace et une opportunité. Netflix, Amazon Prime et Disney+ exigent des contenus en quantité qui profitent aux studios français capables de produire rapidement. Mais les conditions contractuelles imposées peuvent limiter la liberté artistique et réduire les créateurs à de simples sous-traitants d'une vision éditoriale standardisée et mondialisée.`;

const ART_ECOSOLIDAIRE =
`ÉCONOMIE SOLIDAIRE ET TRANSITIONS SOCIALES : UN MODÈLE EN EXPANSION

L'économie sociale et solidaire (ESS) représente aujourd'hui en France plus de 10% du PIB et emploie 2,4 millions de personnes dans des structures coopératives, mutualistes, associatives et fondations. Ce secteur, longtemps cantonné aux marges de l'économie conventionnelle, connaît un essor remarquable porté par la prise de conscience des limites du capitalisme traditionnel et une demande croissante de sens dans les choix professionnels et de consommation.

Les coopératives constituent l'un des moteurs de cette économie alternative. En agriculture, les SCOP maraîchères permettent à des jeunes agriculteurs sans capital de s'installer collectivement. Dans l'industrie, des entreprises en difficulté ont été reprises par leurs salariés sous forme de SCOP, sauvant des centaines d'emplois menacés par la liquidation. Dans les services, des coopératives d'activité permettent à des entrepreneurs de tester leur projet sans risque individuel.

L'émergence des monnaies locales complémentaires illustre une autre facette de l'ESS. Des outils comme l'Eusko au Pays Basque, le Sol Violette à Toulouse ou la Gonette à Lyon permettent de favoriser les circuits économiques courts et de maintenir la richesse dans les territoires en évitant sa fuite vers les multinationales.

Les limites du modèle restent cependant réelles. Les structures ESS, soumises aux mêmes contraintes que les entreprises conventionnelles (rentabilité, concurrence, fiscalité), peinent parfois à conserver leurs valeurs fondatrices face aux impératifs économiques. La tension entre idéal solidaire et réalité du marché constitue le défi permanent de ce secteur.`;

const ART_JARDINS =
`JARDINS URBAINS ET LIEN SOCIAL : LA NATURE COMME CIMENT DE LA COMMUNAUTÉ

Le mouvement des jardins urbains collectifs connaît une expansion remarquable dans les métropoles françaises. À Paris, Lyon, Bordeaux et dans des villes moyennes, des terrains vagues se transforment en potagers partagés, en vergers collectifs ou en jardins pédagogiques. Ce phénomène dépasse la simple tendance horticole : il révèle un désir profond de reconnexion avec la nature et de création de liens sociaux dans des espaces urbains souvent déshumanisés.

Des études sociologiques menées dans plusieurs villes confirment que les jardins collectifs renforcent significativement la cohésion sociale des quartiers. Ils créent des occasions régulières de rencontres entre voisins qui, sans ce prétexte végétal, ne se croiseraient jamais. Les échanges de savoirs et de semences, les repas collectifs et les journées de travail partagé tissent des liens qui vont bien au-delà du jardinage.

Ces espaces jouent également un rôle éducatif majeur, particulièrement pour les enfants et les populations urbaines coupées de toute expérience agricole. Toucher la terre, comprendre les cycles des saisons, observer la transformation d'une graine en légume constituent des expériences fondamentales que l'environnement urbain ne permet pas spontanément.

Sur le plan environnemental, les jardins collectifs contribuent à la perméabilité des sols, à la biodiversité locale, à la réduction des îlots de chaleur et à une alimentation moins carbonée. Ils incarnent à petite échelle les principes de l'agroécologie urbaine : produire local, composting, récupération d'eau de pluie, semences paysannes. Ces micro-expériences citoyennes nourrissent également une culture politique de la transition écologique.`;

function buildQuestions() {
  const qs = [];

  qs.push(q(1, 'Q1-7', null, {
    longText:
`THÉÂTRE DU NOUVEAU MONDE — Strasbourg
Saison 2025-2026

LES ÂMES ERRANTES
Création contemporaine de Marc Lebreton
Scénographie : Amara Diallo | Avec la troupe du TNS

Dates : du 5 au 20 décembre 2025
Du mardi au samedi à 20h30 — Dimanche 16h

TRAVERSÉE DU DÉSERT
Danse-théâtre | Compagnie Horizons
Dates : 8 et 9 janvier 2026 — 20h

Tarifs : Plein 22 € | Réduit 14 € | Jeune -26 ans : 8 €
Réservations : billetterie@tnstrasbourg.fr`,
    question: "Ce document est…",
    optionA: "une critique des pièces jouées au théâtre.",
    optionB: "un programme de spectacles avec dates et tarifs.",
    optionC: "une publicité pour des cours de théâtre.",
    optionD: "un contrat entre acteurs et directeur de théâtre.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`SALON DU JEU VIDÉO ET DES TECHNOLOGIES NUMÉRIQUES
GameFest Paris 2025 — Parc des Expositions, Porte de Versailles
Du 12 au 15 novembre 2025

PROGRAMME :
• Avant-premières des jeux les plus attendus de 2026
• Compétitions e-sport : League of Legends, FIFA, Call of Duty (dotation 50 000 €)
• Conférences des grandes studios mondiaux : Ubisoft, Blizzard, Sony
• Village Indie : 80 studios indépendants présentent leurs créations
• Espace Réalité Virtuelle et Métavers

TARIFS :
Journée : 25 € | Pass 4 jours : 75 € | Enfant -12 ans : 12 €
Billet coupe-file : +10 € sur tous les tarifs
Billets sur gamefestparis.fr`,
    question: "D'après ce document, quelle est la dotation totale des compétitions e-sport ?",
    optionA: "25 000 euros.",
    optionB: "50 000 euros.",
    optionC: "75 000 euros.",
    optionD: "100 000 euros.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT DE LA FORMATION PROFESSIONNELLE — CPF (Compte Personnel de Formation)

Le Compte Personnel de Formation permet à tout actif d'accéder à des formations qualifiantes tout au long de sa vie professionnelle, de manière autonome et à ses propres initiatives.

ALIMENTATION :
Chaque salarié à temps plein acquiert 500 € de droits formation par an, plafonné à 5 000 €. Les salariés peu qualifiés (sans qualification niveau Bac) bénéficient de 800 € par an, plafonné à 8 000 €.

UTILISATION :
Le titulaire choisit librement sa formation parmi les formations éligibles au CPF. Si le coût excède les droits disponibles, il peut compléter avec un abondement de son employeur ou financer le reste à sa charge.

FORMATIONS ÉLIGIBLES : certifications inscrites au RNCP, permis de conduire, bilan de compétences, validation des acquis de l'expérience (VAE).`,
    question: "Ce document explique principalement…",
    optionA: "Les conditions de licenciement en cas de refus de formation.",
    optionB: "Le fonctionnement et l'utilisation du Compte Personnel de Formation.",
    optionC: "Les obligations légales de l'employeur en matière de formation.",
    optionD: "Les tarifs des organismes de formation agréés.",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — Équipement EPS (Éducation Physique et Sportive)

Association sportive Collège Jules Michelet — vend matériel EPS d'occasion en bon état.

LOT 1 : 30 tapis de gymnastique (2m x 1m, épaisseur 5 cm) — 15 €/pièce ou 350 € le lot
LOT 2 : 20 ballons de basket T7 — 8 €/pièce ou 140 € le lot
LOT 3 : 15 sets haies d'athlétisme aluminium 76 cm — 12 €/pièce
LOT 4 : Cage de foot aluminium 5m x 2m avec filet — 180 €

Remise en main propre sur site (10h-16h semaine scolaire) ou expédition possible (frais à la charge de l'acheteur).
Contact : association.sport.michelet@educ.fr`,
    question: "Ce document est…",
    optionA: "une liste de matériel à acheter pour une école.",
    optionB: "une petite annonce de vente de matériel sportif d'occasion.",
    optionC: "un catalogue de matériel neuf pour associations sportives.",
    optionD: "un appel d'offres pour équiper un gymnase municipal.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`SERRE DE JARDIN MODULAIRE NATURE+ — GUIDE D'INSTALLATION

AVANT DE COMMENCER :
Choisissez un emplacement bien exposé (minimum 6h de soleil/jour), à l'abri du vent dominant, et accessible à l'eau. Préparez une surface plane et drainée.

ASSEMBLAGE (environ 2h pour 2 personnes) :
1. Assemblez les montants latéraux en aluminium avec les boulons fournis (clé 12)
2. Installez les panneaux polycarbonate double paroi en commençant par le fond
3. Fixez les deux panneaux de façade avec la porte coulissante
4. Ajustez la ventilation de faîtage pour éviter la surchauffe estivale

ENTRETIEN :
Nettoyez les panneaux au printemps avec de l'eau savonneuse. Vérifiez les joints d'étanchéité chaque automne.`,
    question: "Ce document est…",
    optionA: "un catalogue de modèles de serres disponibles.",
    optionB: "un guide d'installation d'une serre de jardin.",
    optionC: "une liste de végétaux adaptés à la culture sous serre.",
    optionD: "un contrat de garantie pour serre de jardin.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — COOPÉRATIVE BIO SOLIDARITÉ VERTE

La Coopérative Bio Solidarité Verte lance sa campagne annuelle d'adhésion pour la saison 2025-2026.

Notre coopérative regroupe 45 producteurs biologiques certifiés de la région Auvergne-Rhône-Alpes. En rejoignant notre coopérative en tant que consommateur associé, vous bénéficiez d'un panier hebdomadaire de légumes et fruits biologiques à tarif préférentiel, tout en soutenant directement les producteurs locaux.

FORMULES DISPONIBLES :
• Panier solo (2-3 pers.) : 25 €/semaine
• Panier famille (4-6 pers.) : 38 €/semaine
• Part sociale d'entrée : 60 € (une seule fois, remboursable)

Réunion d'information : mercredi 15 octobre à 19h — Salle des Fêtes de Bourg-en-Bresse
Plus d'informations : www.bioverte.coop`,
    question: "Ce communiqué vise principalement à…",
    optionA: "Présenter les prix des produits biologiques en supermarché.",
    optionB: "Recruter de nouveaux adhérents pour une coopérative bio.",
    optionC: "Informer sur les subventions pour l'agriculture biologique.",
    optionD: "Annoncer l'ouverture d'une nouvelle boutique bio.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — ATELIER DÉCOUVERTE ASTRONOMIE
Observatoire de Lyon — Service de médiation scientifique

Dans le cadre de la Nuit des Étoiles, l'Observatoire de Lyon organise des ateliers de découverte du ciel nocturne pour le grand public.

DATE : Vendredi 8 août 2025, de 21h à 1h du matin
LIEU : Parc de l'Observatoire, 69005 Lyon

AU PROGRAMME :
Observation guidée avec télescopes professionnels, conférences de 20 min sur les planètes et étoiles, ateliers photo astronomique pour débutants.
Entrée gratuite, sans réservation — prévoir vêtements chauds et lampe de poche.

Événement familial et accessible à tous dès 8 ans.
Renseignements : 04 72 00 25 25 | obs-lyon.fr`,
    question: "Ce document est…",
    optionA: "Un programme de cours d'astronomie pour adultes.",
    optionB: "Une invitation à un atelier public de découverte de l'astronomie.",
    optionC: "Un article sur l'histoire de l'Observatoire de Lyon.",
    optionD: "Une publicité pour des télescopes de loisir.",
    correctAnswer: 'B',
  }));

  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le satellite météorologique en ___ géostationnaire observe en permanence la même zone de la surface terrestre depuis l'altitude de 36 000 km.",
    question: PHRASE_Q,
    optionA: "position",
    optionB: "orbite",
    optionC: "trajectoire",
    optionD: "altitude",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le réalisateur a décrit chaque séquence du film dans un ___ détaillé avant de commencer le tournage en studio.",
    question: PHRASE_Q,
    optionA: "synopsis",
    optionB: "scénario",
    optionC: "storyboard",
    optionD: "découpage",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le syndicat a négocié un ___ à la convention collective pour améliorer les conditions de travail des salariés en horaires décalés.",
    question: PHRASE_Q,
    optionA: "accord",
    optionB: "avenant",
    optionC: "protocole",
    optionD: "règlement",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le maraîcher ajoute régulièrement du ___ dans ses planches pour améliorer la structure de son sol argileux et nourrir ses légumes.",
    question: PHRASE_Q,
    optionA: "terreau",
    optionB: "sable",
    optionC: "compost",
    optionD: "fumier",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Chaque ___ de la SCOP dispose d'une voix lors des assemblées générales, qu'il possède une ou cent parts sociales.",
    question: PHRASE_Q,
    optionA: "directeur",
    optionB: "actionnaire",
    optionC: "sociétaire",
    optionD: "membre",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le spectacle a bénéficié d'une ___ remarquable signée par un scénographe primé, transformant la scène en espace poétique immersif.",
    question: PHRASE_Q,
    optionA: "décoration",
    optionB: "composition",
    optionC: "mise en scène",
    optionD: "dramaturgie",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_1 =
    "La mission Mars 2030 enverra un [14] équipé de 17 instruments scientifiques pour analyser le sol et l'[15] de la planète rouge avant tout envoi d'équipage humain.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'exploration de Mars",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "satellite",
    optionB: "rover",
    optionC: "astronaute",
    optionD: "module",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'exploration de Mars",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "surface",
    optionB: "atmosphère",
    optionC: "température",
    optionD: "gravité",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "L'agriculture urbaine se développe rapidement dans les grandes villes grâce à la création de [16] sur les toits, les balcons et les terrains délaissés. Ces initiatives améliorent le [17] des cultures en apportant des légumes frais produits à quelques mètres des consommateurs, réduisant ainsi les émissions liées au transport.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'agriculture urbaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "serres",
    optionB: "potagers",
    optionC: "jardins",
    optionD: "cultures",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'agriculture urbaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "rendement",
    optionB: "prix",
    optionC: "volume",
    optionD: "coût",
    correctAnswer: 'A',
  }));

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel programme spatial est la station habitée en permanence depuis l'an 2000 ?",
    optionA: "Programme 1",
    optionB: "Programme 2",
    optionC: "Programme 3",
    optionD: "Programme 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle technique d'animation consiste à photographier des objets physiques réels position par position ?",
    optionA: "Animation 1",
    optionB: "Animation 2",
    optionC: "Animation 3",
    optionD: "Animation 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle structure économique est une société dont les salariés sont les associés majoritaires ?",
    optionA: "Structure 1",
    optionB: "Structure 2",
    optionC: "Structure 3",
    optionD: "Structure 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel espace vert est spécialement conçu pour le bien-être des patients en milieu hospitalier ?",
    optionA: "Espace vert 1",
    optionB: "Espace vert 2",
    optionC: "Espace vert 3",
    optionD: "Espace vert 4",
    correctAnswer: 'B',
  }));

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « L'agence B dispose du budget spatial le plus élevé avec 22 milliards de dollars, représentant 40% du budget spatial mondial. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Coopérative agricole Terra Bio",
    longText: DOC_REGLEMENT_COOP,
    question: "Ce document présente principalement…",
    optionA: "Les prix des produits vendus par la coopérative.",
    optionB: "Les droits et obligations des membres de la coopérative.",
    optionC: "Les conditions d'obtention du label AB.",
    optionD: "Les tarifs de stockage des récoltes.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Coopérative agricole Terra Bio",
    longText: DOC_REGLEMENT_COOP,
    question: "Selon ce règlement, quelle obligation de livraison les membres doivent-ils respecter ?",
    optionA: "Livrer 100% de leur production à la coopérative.",
    optionB: "Livrer au moins 70% de leur production à la coopérative.",
    optionC: "Livrer un minimum de 500 kg par an.",
    optionD: "Livrer uniquement les produits invendus sur leur marché local.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Ingénieur aérospatial ESA",
    longText: DOC_OFFRE_INGENIEUR,
    question: "Ce poste d'ingénieur aérospatial est proposé pour…",
    optionA: "Le centre spatial de Toulouse en métropole.",
    optionB: "Le Centre Spatial Guyanais à Kourou.",
    optionC: "Le siège de l'ESA à Noordwijk aux Pays-Bas.",
    optionD: "La base de lancement de Vandenberg aux États-Unis.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Ingénieur aérospatial ESA",
    longText: DOC_OFFRE_INGENIEUR,
    question: "Parmi les avantages proposés dans cette offre, on trouve…",
    optionA: "Un appartement à Paris fourni par l'ESA.",
    optionB: "Un logement de fonction et un billet annuel pour la métropole.",
    optionC: "Une prime d'expatriation versée uniquement à la fin du contrat.",
    optionD: "Un véhicule de service pour les déplacements en Guyane.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat d'engagement — Scénographe de théâtre",
    longText: DOC_CONTRAT_SCENE,
    question: "Ce contrat est conclu pour…",
    optionA: "Recruter un acteur pour la pièce Les Âmes Errantes.",
    optionB: "Engager une scénographe pour la conception des décors d'une pièce.",
    optionC: "Louer la salle du Théâtre National de Strasbourg.",
    optionD: "Former des étudiants en scénographie théâtrale.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat d'engagement — Scénographe de théâtre",
    longText: DOC_CONTRAT_SCENE,
    question: "Selon ce contrat, quelle est la rémunération totale de la scénographe ?",
    optionA: "8 000 € net.",
    optionB: "12 000 € net en trois versements.",
    optionC: "15 000 € brut en un seul versement.",
    optionD: "2 000 € par semaine de répétitions.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte du jardin collectif Les Belles Pousses",
    longText: DOC_CHARTE_JARDIN,
    question: "Ce document présente principalement…",
    optionA: "Les variétés de légumes cultivées au jardin.",
    optionB: "Les droits et devoirs des jardiniers du jardin collectif.",
    optionC: "Les conditions d'attribution des parcelles par la mairie.",
    optionD: "Le budget annuel de gestion du jardin.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte du jardin collectif Les Belles Pousses",
    longText: DOC_CHARTE_JARDIN,
    question: "Selon la charte, à combien de journées collectives de travail chaque jardinier doit-il participer au minimum par an ?",
    optionA: "1 journée.",
    optionB: "2 journées.",
    optionC: "4 journées.",
    optionD: "6 journées.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Convention collective nationale — Secteur animation",
    longText: DOC_CONVENTION_ANIM,
    question: "Cette convention collective concerne principalement…",
    optionA: "Les salariés du cinéma d'animation.",
    optionB: "Les salariés de l'animation socioculturelle et jeunesse.",
    optionC: "Les enseignants des conservatoires de musique.",
    optionD: "Les travailleurs du secteur du sport et des loisirs.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Convention collective nationale — Secteur animation",
    longText: DOC_CONVENTION_ANIM,
    question: "Selon cette convention, quel est le salaire brut mensuel minimum d'un animateur confirmé avec 3 ans d'expérience ?",
    optionA: "1 900 €",
    optionB: "2 200 €",
    optionC: "2 600 €",
    optionD: "3 000 €",
    correctAnswer: 'B',
  }));

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Colonisation de Mars : quand l'ambition spatiale interroge l'éthique",
    longText: ART_MARS,
    question: "Selon cet article, quelle est la durée approximative du voyage vers Mars ?",
    optionA: "1 à 2 mois.",
    optionB: "6 à 9 mois.",
    optionC: "1 à 2 ans.",
    optionD: "3 à 4 mois.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Colonisation de Mars : quand l'ambition spatiale interroge l'éthique",
    longText: ART_MARS,
    question: "D'après l'article, quel est l'un des principaux arguments des défenseurs de la colonisation de Mars ?",
    optionA: "Exploiter les ressources minières de Mars pour la Terre.",
    optionB: "Diversifier l'humanité sur plusieurs planètes comme assurance contre l'extinction.",
    optionC: "Résoudre le surpeuplement terrestre en envoyant des millions de personnes.",
    optionD: "Démontrer la supériorité technologique des pays développés.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le cinéma d'animation français et la mondialisation",
    longText: ART_ANIMATION,
    question: "Selon cet article, quel organisme finance un tiers de la production d'animation française ?",
    optionA: "L'Union Européenne.",
    optionB: "Le CNC (Centre National du Cinéma).",
    optionC: "Le Ministère de la Culture.",
    optionD: "Les plateformes de streaming.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le cinéma d'animation français et la mondialisation",
    longText: ART_ANIMATION,
    question: "D'après l'auteur, les plateformes de streaming représentent pour les studios français…",
    optionA: "Uniquement une menace à éviter absolument.",
    optionB: "À la fois une menace et une opportunité.",
    optionC: "La solution idéale pour financer librement leurs créations.",
    optionD: "Un partenaire qui respecte toujours la liberté artistique.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Économie solidaire et transitions sociales",
    longText: ART_ECOSOLIDAIRE,
    question: "Selon cet article, quelle part du PIB français l'économie sociale et solidaire représente-t-elle ?",
    optionA: "5%",
    optionB: "10%",
    optionC: "15%",
    optionD: "20%",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Économie solidaire et transitions sociales",
    longText: ART_ECOSOLIDAIRE,
    question: "Selon l'article, quel est l'un des défis permanents des structures de l'ESS ?",
    optionA: "Trouver suffisamment de bénévoles pour fonctionner.",
    optionB: "La tension entre idéal solidaire et réalité économique du marché.",
    optionC: "Obtenir des subventions publiques suffisantes.",
    optionD: "Rivaliser avec les prix des multinationales.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Jardins urbains et lien social",
    longText: ART_JARDINS,
    question: "Selon cet article, que démontrent les études sociologiques sur les jardins collectifs ?",
    optionA: "Qu'ils augmentent la valeur immobilière des quartiers.",
    optionB: "Qu'ils renforcent significativement la cohésion sociale des quartiers.",
    optionC: "Qu'ils permettent aux villes de réduire leurs budgets d'espaces verts.",
    optionD: "Qu'ils attirent principalement les personnes âgées et les retraités.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Jardins urbains et lien social",
    longText: ART_JARDINS,
    question: "D'après l'auteur, que permettent notamment les jardins collectifs sur le plan éducatif ?",
    optionA: "D'enseigner la biologie végétale aux futurs agriculteurs.",
    optionB: "De comprendre les cycles des saisons et la transformation d'une graine en légume.",
    optionC: "De former des jardiniers professionnels pour les espaces publics.",
    optionD: "D'apprendre aux enfants les techniques d'agriculture intensive.",
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
    console.log(`\n✅ ${created} questions créées pour CE 26.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
