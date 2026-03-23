'use strict';
/**
 * seed-ce-serie52.js
 * Peuple la série CE 52 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie52.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyonff001c0wxlqmowylf7';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts évolution du nombre de visiteurs par musée ── */
function generateQ22SVG() {
  const years = ['2019','2020','2021','2022','2023'];
  const graphs = [
    { label: 'Graphique 1', data: [500, 200, 250, 400, 480], color: '#E30613' },
    { label: 'Graphique 2', data: [300, 100, 120, 200, 250], color: '#E30613' },
    { label: 'Graphique 3', data: [800, 300, 350, 600, 850], color: '#003087' }, // CORRECT : rebond 2023 dépassant 2019
    { label: 'Graphique 4', data: [400, 150, 200, 280, 320], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 900;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const stepX = plotW / (years.length - 1);

    const gridLines = [0, 300, 600, 900].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v/1000}k</text>`;
    }).join('');

    const pointsStr = g.data.map((v, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `${px},${py}`;
    }).join(' ');

    const xLabels = years.map((yr, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${yr}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + xLabels +
           `<polyline points="${pointsStr}" fill="none" stroke="${g.color}" stroke-width="2"/>` +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Visiteurs (milliers)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawLineChart(g, positions[i].cx, positions[i].cy)).join('') +
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
  { title: 'Transport 1', content: "Le train à grande vitesse (TGV) est un train électrique circulant sur des lignes dédiées à des vitesses pouvant dépasser 320 km/h. La France a inauguré son premier TGV en 1981 sur la ligne Paris-Lyon. Le réseau à grande vitesse français est aujourd'hui l'un des plus étendus d'Europe avec plus de 2 700 km de lignes LGV." },
  { title: 'Transport 2', content: "Le tramway est un moyen de transport urbain sur rails intégrés à la chaussée ou sur des emprises propres. Il offre une grande capacité de transport (150 à 300 personnes par rame) et une faible empreinte environnementale (électrique). Après une éclipse de plusieurs décennies, il connaît un fort renouveau dans les villes françaises depuis les années 1990." },
  { title: 'Transport 3', content: "Le covoiturage consiste à partager un véhicule personnel entre conducteur et passagers pour un trajet commun. Il réduit les coûts pour les participants, diminue les émissions de CO2 et contribue à la fluidification du trafic. Des plateformes numériques (BlaBlaCar) ont transformé cette pratique en marché de masse." },
  { title: 'Transport 4', content: "La trottinette électrique en libre-service est un moyen de mobilité urbaine apparu dans les grandes villes à partir de 2018. Déverrouillée via une application, elle est déposée partout dans la ville. Malgré sa popularité initiale, elle soulève des problèmes d'encombrement des trottoirs et de sécurité des usagers." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Art 1', content: "L'impressionnisme est un mouvement pictural né en France dans les années 1860-1870. Il se caractérise par des touches de peinture vives et fragmentées, la représentation de la lumière naturelle changeante et des scènes de la vie moderne. Monet, Renoir, Pissarro et Degas en sont les figures emblématiques. Le nom vient du tableau de Monet « Impression, Soleil Levant » (1872)." },
  { title: 'Art 2', content: "Le cubisme est un mouvement artistique fondé au début du XXe siècle par Pablo Picasso et Georges Braque. Il déconstruit les objets en formes géométriques et les représente simultanément sous plusieurs angles. Le cubisme a profondément influencé l'architecture moderne, le design et même la publicité." },
  { title: 'Art 3', content: "Le surréalisme est un mouvement culturel et artistique fondé par André Breton en 1924. Il cherche à libérer l'inconscient à travers le rêve, le hasard et l'automatisme. Salvador Dalí, René Magritte et Max Ernst en sont les représentants les plus célèbres. La technique de l'écriture automatique en est l'expression littéraire." },
  { title: 'Art 4', content: "L'art contemporain désigne la production artistique depuis les années 1970 jusqu'à nos jours. Il se caractérise par son éclatement des formes et des disciplines : installations, performances, art numérique, street art, art conceptuel. Il questionne souvent les frontières entre l'art et le quotidien, et la définition même de l'œuvre d'art." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Science 1', content: "L'astronomie est la science qui étudie les corps célestes (étoiles, planètes, galaxies, nébuleuses) et les phénomènes de l'Univers. Elle est l'une des plus anciennes sciences humaines. Les télescopes spatiaux comme Hubble et James Webb ont révolutionné notre compréhension de la structure et de l'âge de l'Univers." },
  { title: 'Science 2', content: "La génétique est la science qui étudie les gènes, l'hérédité et la variation des organismes vivants. Elle a connu une révolution avec la découverte de la structure de l'ADN par Watson et Crick en 1953. Le séquençage du génome humain complet, achevé en 2003, ouvre la voie à la médecine génomique personnalisée." },
  { title: 'Science 3', content: "La robotique est la discipline scientifique qui conçoit, fabrique et programme des robots. Les robots sont utilisés dans l'industrie (assemblage automobile), la médecine (chirurgie assistée), l'exploration spatiale (rovers martiens) et de plus en plus dans les services (soins aux personnes âgées, distribution)." },
  { title: 'Science 4', content: "La météorologie est la science de l'atmosphère qui étudie et prévoit les phénomènes climatiques à court terme. Elle utilise des réseaux de stations d'observation, des ballons-sondes, des satellites et des modèles numériques de prévision. La précision des prévisions à 10 jours a considérablement progressé en 30 ans." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Cinéma 1', content: "Le cinéma documentaire représente une forme de cinéma qui se propose de filmer la réalité. Il peut adopter des formes très variées : film d'observation (fly on the wall), documentaire participatif, docu-fiction. Des réalisateurs comme Michael Moore, Nicolas Philibert ou les frères Dardenne ont renouvelé le genre." },
  { title: 'Cinéma 2', content: "Le film d'animation est une technique cinématographique consistant à créer l'illusion du mouvement à partir d'images fixes successives. Les techniques incluent le dessin animé traditionnel, l'animation en images de synthèse (3D), le stop-motion et l'animation de marionnettes. Les studios Pixar, Studio Ghibli et Disney en sont les leaders mondiaux." },
  { title: 'Cinéma 3', content: "Le film noir est un genre cinématographique américain des années 1940-1950, caractérisé par son atmosphère sombre, ses intrigues policières complexes, ses personnages moralement ambigus et son esthétique visuelle contrastée (ombres, lumières dures). Il est souvent considéré comme un reflet des angoisses de l'après-guerre." },
  { title: 'Cinéma 4', content: "La comédie romantique (ou rom-com) est un genre cinématographique mêlant humour et histoire d'amour. Elle suit généralement une structure narrative prévisible (rencontre, obstacles, réconciliation) mais son efficacité repose sur la chimie entre acteurs et les répliques. Bridget Jones, Notting Hill ou Amélie Poulain en sont des exemples emblématiques." },
]);

/* ── Documents Q23-32 ── */
const DOC_CHARTE_MUSEE =
`RÈGLEMENT DE VISITE — MUSÉE DES BEAUX-ARTS DE LYON

CONDITIONS DE VISITE
1. La visite est soumise à l'achat d'un billet (ou présentation d'un abonnement valide) en caisse ou en ligne.
2. Les grandes poussettes et les sacs à dos volumineux doivent être déposés en consigne à l'entrée (gratuite).
3. La photographie sans flash est autorisée pour usage personnel uniquement. La photographie professionnelle nécessite une autorisation préalable.
4. Il est formellement interdit de toucher les œuvres, de manger, de boire et de téléphoner dans les galeries.
5. Les animaux ne sont pas admis dans le musée (sauf chiens guides d'aveugles).

MÉDIATION CULTURELLE
Des visites guidées thématiques sont proposées chaque week-end à 14h30 (durée : 1h30, tarif : 3 € en sus du billet). Réservation en ligne recommandée.

Numéro d'information : 04 72 XX XX XX`;

const DOC_APPEL_CANDIDATURE =
`APPEL À CANDIDATURES — RÉSIDENCE D'ARTISTE 2026
Fondation Culturelle du Grand Ouest

La Fondation Culturelle du Grand Ouest ouvre un appel à candidatures pour l'accueil de 4 artistes en résidence pour l'année 2026 (janvier à juin, puis juillet à décembre).

PROFIL RECHERCHÉ : Artistes professionnels (plasticiens, photographes, vidéastes) ayant une pratique artistique établie (au moins 3 expositions significatives). Pas de restriction géographique.

CONDITIONS DE LA RÉSIDENCE :
- Mise à disposition d'un atelier de 80 m² avec matériel de base
- Bourse mensuelle de 1 200 € net
- Logement non fourni (liste de partenaires disponible sur demande)
- En contrepartie : une exposition en fin de résidence et 2 ateliers pédagogiques pour les scolaires

DOSSIER : CV artistique + portfolio (20 visuels max en PDF) + lettre de motivation + projet de résidence (1 page)
À envoyer avant le 15 janvier 2026 : residence@fcgo.fr`;

const DOC_CONTRAT_ASSURANCE =
`CONTRAT D'ASSURANCE — EXTRAIT — GARANTIE ŒUVRES D'ART

ASSURÉ : Galerie LUMIÈRE, représentée par M. FONTAINE Pierre
OBJET : Collection de 45 œuvres d'art contemporain (valeur déclarée : 280 000 €)

GARANTIES SOUSCRITES :
- Dommages accidentels (choc, chute, manipulation maladroite) : couverture totale
- Vol avec effraction : couverture totale (alarme certifiée obligatoire)
- Incendie et dégât des eaux : couverture totale
- Transport pour expositions temporaires : couverture pendant les expositions déclarées

EXCLUSIONS :
- Usure normale et vétusté
- Dommages causés intentionnellement par l'assuré ou ses préposés
- Œuvres exposées non déclarées préalablement à la compagnie

FRANCHISE : 500 € par sinistre
PRIME ANNUELLE : 2 850 € TTC`;

const DOC_BILLET_CONCERT =
`BILLET — PHILHARMONIE DE PARIS
Concert exceptionnel : Orchestre National de France

Programme :
• DEBUSSY — La Mer (suite symphonique)
• RAVEL — Boléro
• SAINT-SAËNS — Symphonie n°3 avec orgue (Grande salle avec orgue Cavaillé-Coll)

Direction : Maestro Paulo FERRARA
Soliste : Hélène GRIMAUD (piano)

Date : Vendredi 7 mars 2026 à 20h00
Salle : Grande Salle Pierre Boulez
Placement : Balcon — Rang 2 — Siège 14 — Catégorie B
Tarif : 45 € (billet non remboursable, non échangeable sauf mention légale)

Ouverture des portes : 19h15 — Retardataires : placement différé à l'entracte
Vestiaire : gratuit, niveau -1`;

const DOC_GUIDE_EXPO =
`GUIDE DU VISITEUR — EXPOSITION « LUMIÈRES D'AFRIQUE »
Musée du Quai Branly — Jacques Chirac

PRÉSENTATION
Cette exposition réunit 180 œuvres et objets témoignant de la richesse des cultures visuelles africaines du XXe siècle : sculptures, photographies, textiles, céramiques et installations vidéo d'artistes contemporains.

PARCOURS EN 5 SECTIONS :
Section 1 — Mémoires et identités (entrée, salle 1-3)
Section 2 — Corps et rituels (salle 4-7)
Section 3 — Modernité et création (salle 8-11)
Section 4 — Diaspora et échanges mondiaux (salle 12-15)
Section 5 — Horizons contemporains (grande salle finale)

DURÉE RECOMMANDÉE : 2 heures minimum
ACCESSIBILITÉ : Audio-guides disponibles en français, anglais, arabe et swahili (5 €). Visites en langue des signes française (LSF) les 1ers dimanches du mois.
CATALOGUE D'EXPOSITION : 35 €`;

/* ── Articles de presse Q33-40 ── */
const ART_MUSIQUE_STREAMING =
`LE STREAMING MUSICAL : UN MODÈLE ÉCONOMIQUE QUI PROFITE PEU AUX ARTISTES

Le streaming musical a sauvé l'industrie musicale de l'effondrement provoqué par le téléchargement illégal des années 2000. Spotify, Apple Music, Deezer et leurs concurrents génèrent aujourd'hui des revenus de plus de 20 milliards de dollars par an. Pour les majors et les labels, c'est une manne : la musique enregistrée est de nouveau un secteur rentable.

Mais pour les artistes, et plus particulièrement les artistes indépendants, le modèle du streaming soulève des questions de justice économique fondamentales. Le taux de rémunération moyen par stream est de 0,003 à 0,005 dollar, ce qui signifie qu'un artiste doit accumuler 200 000 à 300 000 écoutes pour toucher l'équivalent du SMIC mensuel français.

Ce modèle favorise massivement les artistes déjà populaires qui génèrent des volumes d'écoutes considérables, au détriment des artistes émergents ou de niche. La concentration de l'écoute est extrême : les 0,1 % d'artistes les plus streamés captent la majorité des revenus distribués. Les algorithmes des plateformes renforcent cette dynamique en promouvant les artistes déjà établis.

Des mouvements de réforme réclament une redistribution plus équitable des revenus du streaming. Certains proposent de passer du modèle pro-rata (chaque stream vaut la même fraction du pot commun) au modèle user-centric (les abonnements de chaque utilisateur sont distribués aux artistes qu'il écoute effectivement). Ce changement bénéficierait considérablement aux artistes de niche.`;

const ART_CINEMA_PLATFORMES =
`CINÉMA ET PLATEFORMES : LA FIN D'UN MODÈLE OU UNE COEXISTENCE INÉVITABLE ?

La pandémie de Covid-19 a servi de catalyseur à une transformation que l'industrie cinématographique redoutait depuis des années : l'accélération de la consommation de films sur les plateformes de streaming, au détriment des sorties en salles. Netflix, Amazon Prime, Disney+, Apple TV+ ont investi des milliards pour produire leurs propres contenus et sortir certains films directement en streaming, contournant totalement le circuit traditionnel.

Les données de fréquentation des salles oscines post-pandémie sont préoccupantes. La reprise n'a pas retrouvé les niveaux de 2019, et le public des moins de 35 ans — vital pour l'avenir des salles — s'est le plus durablement éloigné. Pour cette génération, regarder un film sur un écran 75 pouces dans un salon confortable, sans contrainte horaire ni déplacement, est devenu l'option par défaut.

Pourtant, la salle de cinéma résiste mieux que prévu. Les blockbusters qui nécessitent le grand écran et la sonorisation professionnelle (films Marvel, sagas d'aventure) continuent d'attirer des millions de spectateurs qui jugent l'expérience salle irremplaçable pour ce type de contenu. Et les films d'auteur, art et essai ou films de festival, trouvent toujours leur public en salles.

La coexistence entre salles et plateformes semble donc inévitable et peut-être bénéfique : les plateformes financent des productions audacieuses qui ne trouveraient pas de financement traditionnel, tandis que les salles se repositionnent comme lieux d'expérience et de découverte artistique. La question des fenêtres de diffusion — combien de temps un film doit rester en exclusivité en salles avant d'être disponible en streaming — reste un enjeu politique crucial.`;

const ART_TRANSPORT_FUTUR =
`LA MOBILITÉ DU FUTUR : ENTRE PROMESSES TECHNOLOGIQUES ET RÉALITÉS SOCIALES

Les annonces sur la mobilité du futur se succèdent à un rythme soutenu : voiture autonome, hyperloop, avion électrique, livraison par drones. Ces technologies promettent des déplacements plus rapides, moins polluants et plus accessibles. Mais entre la promesse technologique et la réalité de déploiement, les obstacles sont nombreux.

La voiture autonome en est l'exemple le plus emblématique. Annoncée imminente depuis plus de dix ans par des entreprises comme Tesla, Waymo ou Uber, elle fait face à des défis techniques, réglementaires et psychologiques considérables. Les accidents impliquant des véhicules autonomes ont montré que la fiabilité dans tous les scénarios de conduite réelle est loin d'être atteinte. Les questions d'assurance, de responsabilité juridique et d'acceptation sociale compliquent encore davantage le déploiement.

L'hyperloop — concept de tube sous vide où des capsules passagers circulent à plus de 1 000 km/h — fascine mais peine à sortir des stades expérimentaux. Les coûts d'infrastructure considérables, les problèmes de sécurité et les difficultés d'intégration dans des réseaux de transport existants freinent son développement. Aucun réseau commercial n'est opérationnel à ce jour.

Les solutions qui connaissent le plus fort développement réel sont en fait les plus « simples » : vélo électrique, covoiturage longue distance, train à grande vitesse, transport en commun en site propre. Ces mobilités moins spectaculaires mais éprouvées constituent la réalité de la transition des transports.`;

const ART_URBANISME_DURABLE =
`L'URBANISME DURABLE : REPENSER LA VILLE POUR LE XXIE SIÈCLE

La ville du XXe siècle a été conçue autour de l'automobile : étalement urbain, zones monofunctionnelles (quartiers résidentiels séparés des zones commerciales et des pôles d'emploi), parkings omniprésents, voiries dimensionnées pour le trafic automobile maximal. Ce modèle, aujourd'hui reconnu comme insoutenable, est en cours de profonde remise en question.

La ville du quart d'heure, concept popularisé par le chercheur Carlos Moreno, propose de repenser l'urbanisme pour que les habitants puissent accéder à pied ou à vélo, en moins de 15 minutes, à tous les services essentiels de leur vie quotidienne : travail, commerces, santé, éducation, loisirs. Paris, Melbourne et Ottawa ont adopté ce principe comme guide de leur politique d'aménagement.

La renaturation des villes constitue un autre axe majeur de l'urbanisme durable. Face au phénomène d'îlot de chaleur urbain (les villes sont en moyenne 2 à 3°C plus chaudes que leurs périphéries rurales), la végétalisation des rues, des toitures et des façades, la création de corridors verts et le désimperméabilisation des sols deviennent des outils de résilience climatique essentiels.

La réhabilitation des friches industrielles et commerciales (anciens centres commerciaux, zones industrielles désaffectées) offre une alternative à l'étalement urbain. Ces espaces, souvent bien desservis et situés en zone urbanisée, peuvent être reconvertis en quartiers mixtes combinant logements, commerces, bureaux et espaces verts. Cette stratégie de densification choisie est préférable à la construction sur des terres agricoles.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_R =
`L'art contemporain se [14] par sa grande diversité de formes et d'expressions. Contrairement aux mouvements artistiques du passé qui suivaient des règles strictes, les artistes d'aujourd'hui sont libres de [15] les frontières entre les disciplines. Cette liberté peut dérouter le grand public, mais elle reflète la complexité et les [16] de notre époque.`;

const TEXTE_LACUNAIRE_S =
`Le cinéma est un art qui [17] la technique et la créativité humaine. Depuis son invention par les frères Lumière en 1895, il a considérablement évolué grâce aux progrès numériques. Aujourd'hui, les effets spéciaux permettent de [17b] des univers visuels qui auraient été inimaginables pour les pionniers du septième art.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `AFFICHE — MUSÉE D'ART MODERNE DE PARIS (MAM)

NOUVELLE ACQUISITION
« Composition abstraite N°7 »
Pierre SOULAGES — 1962 — Huile sur toile, 195 × 130 cm

Le Musée d'Art Moderne de Paris est heureux d'annoncer l'acquisition exceptionnelle d'une toile majeure du maître de l'outrenoir, Pierre Soulages (1919-2022). Cette œuvre emblématique, issue d'une collection privée suisse, rejoindra de façon permanente les collections du musée à partir du 15 février 2026.

Conférence de presse et présentation au public : jeudi 19 février, 18h30 (sur invitation)
Découverte grand public : à partir du samedi 21 février

Musée d'Art Moderne de Paris — 11 avenue du Président Wilson, Paris 16e
Ouvert du mardi au dimanche, 10h00-18h00 (nocturne le jeudi jusqu'à 21h30)`,
    question: 'Ce document est…',
    optionA: 'Un catalogue de vente aux enchères d\'œuvres de Soulages',
    optionB: 'Une affiche annonçant l\'acquisition d\'une œuvre par un musée',
    optionC: 'Un article de presse sur la mort du peintre Pierre Soulages',
    optionD: 'Le programme d\'une rétrospective consacrée à Pierre Soulages',
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `MODE D'EMPLOI — LECTEUR MULTIMÉDIA STREAMING NOVO

INSTALLATION (5 minutes)
1. Branchez le câble HDMI sur votre TV et sur le port HDMI du NOVO.
2. Insérez le câble USB-C d'alimentation.
3. Allumez votre TV et sélectionnez l'entrée HDMI correspondante.
4. Suivez les instructions à l'écran pour la première configuration (langue, Wi-Fi).

UTILISATION QUOTIDIENNE
• Navigation : utilisez la télécommande (touches directionnelles + OK).
• Accès rapide : appuyez sur le bouton accueil (⌂) pour le menu principal.
• Assistant vocal : maintenez le bouton microphone et parlez.

RÉSOLUTION DES PROBLÈMES
• Pas d'image → Vérifier la connexion HDMI et l'entrée sélectionnée sur la TV.
• Pas de son → Vérifier le volume TV et les paramètres audio du NOVO.
• Wi-Fi lent → Rapprochez le NOVO de votre routeur ou utilisez un câble Ethernet.`,
    question: 'Ce document est un…',
    optionA: 'Contrat d\'abonnement à un service de streaming',
    optionB: 'Mode d\'emploi d\'un lecteur multimédia',
    optionC: 'Catalogue de produits électroniques',
    optionD: 'Guide d\'installation d\'une box internet',
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `COURRIER ADMINISTRATIF

Préfecture du Rhône — Service des Étrangers
22 rue du Président Carnot — 69002 Lyon

Lyon, le 3 novembre 2025

Objet : Convocation pour instruction de votre dossier de titre de séjour

Madame MENGUELE Alvine,

Vous êtes convoquée à un rendez-vous pour l'instruction de votre demande de titre de séjour (carte de résident) le :

Mercredi 26 novembre 2025 à 9h15
Préfecture du Rhône — Bureau 14 (rez-de-chaussée)

Vous devrez impérativement vous présenter muni(e) des documents suivants :
- Votre passeport en cours de validité (original + photocopie)
- Votre titre de séjour actuel (original + photocopie)
- Les justificatifs de résidence des 12 derniers mois
- Tout autre document mentionné dans votre accusé de réception de dossier

En cas d'impossibilité de vous présenter, contactez le 04 XX XX XX XX.`,
    question: 'Ce document est…',
    optionA: 'Une lettre de refus de titre de séjour',
    optionB: 'Une convocation préfectorale pour instruction d\'un dossier',
    optionC: 'Un formulaire de demande de naturalisation',
    optionD: 'Un guide des démarches administratives pour étrangers',
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `PETITE ANNONCE — COURS PARTICULIERS

Étudiante en master d'histoire de l'art, titulaire d'une licence avec mention très bien, propose des cours particuliers de :
• Histoire de l'art (tous niveaux, collège à licence)
• Préparation aux concours d'entrée aux écoles d'art (DNSEP, BTS Design)
• Aide à la constitution de dossier artistique

Méthode : cours personnalisés selon les objectifs de l'élève (acquisition des fondamentaux / préparation à des examens spécifiques).

TARIF : 25 €/h (possibilité de cours en duo : 35 €/h partagés)
LIEU : À votre domicile (Lyon 1er-7e) ou en bibliothèque
DISPONIBILITÉ : Weekends et mercredi après-midi

Contact : amelie.arthistoire@mail.com | WhatsApp 07 XX XX XX XX`,
    question: 'Ce document est…',
    optionA: 'Une offre d\'emploi pour un poste d\'enseignant en histoire de l\'art',
    optionB: 'Une petite annonce proposant des cours particuliers en histoire de l\'art',
    optionC: 'Le programme d\'une formation en design graphique',
    optionD: 'Une invitation à une exposition d\'art contemporain',
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `ARTICLE DE PRESSE — Technologie

TRANSPORTS : PREMIER TEST RÉUSSI POUR L'HYPERLOOP FRANÇAIS

La société HyperFrance a annoncé lundi le succès de son premier test à grande vitesse sur le tronçon expérimental de 3 kilomètres installé près de Toulouse. La capsule passager prototype a atteint une vitesse de 450 km/h dans le tube à basse pression lors d'un trajet sans passagers.

« C'est une étape historique pour notre projet », a déclaré la PDG Mme Delacroix. « Nous visons une vitesse commerciale de 900 km/h d'ici 2030 sur le corridor Paris-Bordeaux ».

Les experts restent cependant prudents : le passage d'un test de 3 km à une infrastructure commerciale de 500 km est un défi ingénierique, financier et réglementaire colossal. Le coût estimé de la ligne Paris-Bordeaux dépasse 25 milliards d'euros.`,
    question: 'Ce document est…',
    optionA: 'Un communiqué de presse d\'une entreprise de transport',
    optionB: 'Un article de presse sur le premier test réussi d\'un hyperloop français',
    optionC: 'Une étude technique sur les technologies de transport du futur',
    optionD: 'Un appel d\'offres pour un projet d\'infrastructure de transport',
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `MENU — RESTAURANT GASTRONOMIQUE LA TABLE DU CHÂTEAU
Déjeuner du dimanche — 3 services — 68 € par personne

MISE EN BOUCHE
Velouté de potiron à l'huile de truffe et chips de jambon ibérique

ENTRÉE (au choix)
• Carpaccio de Saint-Jacques, émulsion de citron vert, caviar d'Aquitaine
• Terrine de foie gras maison, brioche dorée et chutney de figues

PLAT PRINCIPAL (au choix)
• Filet de bœuf Angus, jus corsé, purée truffée et légumes rôtis
• Homard breton rôti au beurre demi-sel, risotto à l'encre de seiche
• Suprême de pintade fermière, champignons des bois et gnocchis de ricotta

DESSERT (au choix)
• Soufflé chaud au Grand Marnier (commander à l'entrée)
• Mille-feuille vanille bourbon, crème légère
• Assortiment de fromages affinés

Accord mets et vins disponible sur demande (+35 €)
Enfants de moins de 12 ans : menu simplifié à 28 €`,
    question: 'Ce document est un…',
    optionA: 'Menu d\'un restaurant gastronomique pour le déjeuner du dimanche',
    optionB: 'Programme d\'un banquet de mariage',
    optionC: 'Guide des restaurants gastronomiques de la région',
    optionD: 'Catalogue de services de traiteur pour événements',
    correctAnswer: 'A',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `EXTRAIT DU SITE — ÉCOLE NATIONALE DES BEAUX-ARTS DE PARIS (ENSBA)

MASTER ARTS ET CRÉATION — Spécialité Pratiques Plastiques et Théoriques

PRÉSENTATION : Ce master forme des artistes plasticiens à haut niveau de compétences à la fois pratiques et théoriques. Il combine ateliers de création, séminaires d'histoire de l'art, stages professionnels et participation à des projets d'exposition.

CONDITIONS D'ADMISSION : Diplôme de niveau Bac+3 dans un domaine artistique. Sélection sur dossier (portfolio + projet artistique de 3 pages) et entretien. Environ 20 places par promotion.

DÉBOUCHÉS : Artiste plasticien, commissaire d'exposition, critique d'art, intervenant en école d'art, responsable de structures culturelles.

CANDIDATURES : Du 1er mars au 30 avril sur le portail d'admission de l'ENSBA.
Renseignements : master-arts@ensba.fr`,
    question: 'Ce document est…',
    optionA: 'Un appel à candidatures pour une résidence d\'artiste',
    optionB: 'La présentation d\'un master arts sur le site d\'une école des beaux-arts',
    optionC: 'Un règlement d\'une école de dessin pour débutants',
    optionD: 'Une offre d\'emploi pour un poste d\'enseignant en arts',
    correctAnswer: 'B',
  }));

  // ── Q8-13 ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le musicien a composé une symphonie ___ en combinant des instruments traditionnels africains et un orchestre classique occidental.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'originale',
    optionB: 'ancienne',
    optionC: 'simple',
    optionD: 'ennuyeuse',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le film a été tourné entièrement en ___ afin de respecter l\'authenticité historique de la période représentée.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'décors naturels',
    optionB: 'studio fermé',
    optionC: 'images de synthèse',
    optionD: 'noir et blanc',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les travaux d\'urbanisme ont profondément ___ le paysage de ce quartier autrefois industriel, désormais transformé en espace résidentiel et culturel.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'transformé',
    optionB: 'ignoré',
    optionC: 'détérioré',
    optionD: 'compliqué',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La mise en œuvre de cette politique de transport ___ les déplacements en voiture et favorise l\'utilisation des transports en commun.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'décourage',
    optionB: 'facilite',
    optionC: 'encourage',
    optionD: 'amplifie',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'L\'artiste a réalisé une installation ___ de 500 miroirs reflétant la lumière naturelle pour créer un effet de forêt lumineuse.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'composée',
    optionB: 'privée',
    optionC: 'ancienne',
    optionD: 'unique',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La plateforme de streaming a réduit sa production originale afin de ___ ses coûts face à la concurrence accrue du marché.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'maîtriser',
    optionB: 'augmenter',
    optionC: 'ignorer',
    optionD: 'calculer',
    correctAnswer: 'A',
  }));

  // ── Q14-17 ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — L\'art contemporain',
    longText: TEXTE_LACUNAIRE_R,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'caractérise',
    optionB: 'limite',
    optionC: 'déçoit',
    optionD: 'ignore',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — L\'art contemporain',
    longText: TEXTE_LACUNAIRE_R,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'dépasser',
    optionB: 'respecter',
    optionC: 'effacer',
    optionD: 'copier',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — L\'art contemporain',
    longText: TEXTE_LACUNAIRE_R,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'contradictions',
    optionB: 'certitudes',
    optionC: 'traditions',
    optionD: 'simplifications',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le cinéma',
    longText: TEXTE_LACUNAIRE_S,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'mêle',
    optionB: 'sépare',
    optionC: 'élimine',
    optionD: 'imite',
    correctAnswer: 'A',
  }));

  // ── Q18-21 ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quel transport a connu une forte renaissance dans les villes françaises depuis les années 1990 ?',
    optionA: 'Transport 1',
    optionB: 'Transport 2',
    optionC: 'Transport 3',
    optionD: 'Transport 4',
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quel mouvement artistique a déconstruit les objets en formes géométriques représentés sous plusieurs angles ?',
    optionA: 'Art 1',
    optionB: 'Art 2',
    optionC: 'Art 3',
    optionD: 'Art 4',
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quelle science utilise des rovers pour explorer d\'autres planètes ?',
    optionA: 'Science 1',
    optionB: 'Science 2',
    optionC: 'Science 3',
    optionD: 'Science 4',
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quel genre cinématographique est caractérisé par des personnages moralement ambigus et une esthétique de contrastes d\'ombres et lumières ?',
    optionA: 'Cinéma 1',
    optionB: 'Cinéma 2',
    optionC: 'Cinéma 3',
    optionD: 'Cinéma 4',
    correctAnswer: 'C',
  }));

  // ── Q22 ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « La fréquentation 2023 dépasse le niveau d\'avant-Covid 2019 après un creux marqué en 2020 » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'C',
  }));

  // ── Q23-32 ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Règlement — Musée des Beaux-Arts de Lyon',
    longText: DOC_CHARTE_MUSEE,
    question: 'Selon ce règlement, quelle activité est autorisée dans les galeries ?',
    optionA: 'Manger et boire discrètement',
    optionB: 'Prendre des photos sans flash pour usage personnel',
    optionC: 'Téléphoner à voix basse',
    optionD: 'Toucher les œuvres avec des gants',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Règlement — Musée des Beaux-Arts de Lyon',
    longText: DOC_CHARTE_MUSEE,
    question: 'Selon ce règlement, quand ont lieu les visites guidées thématiques ?',
    optionA: 'Tous les jours à 11h00',
    optionB: 'Chaque week-end à 14h30',
    optionC: 'Uniquement pendant les expositions temporaires',
    optionD: 'Sur réservation à tout moment de la semaine',
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Appel à candidatures — Résidence d\'artiste 2026',
    longText: DOC_APPEL_CANDIDATURE,
    question: 'Ce document est…',
    optionA: 'Une offre d\'emploi pour un directeur de fondation culturelle',
    optionB: 'Un appel à candidatures pour une résidence d\'artiste',
    optionC: 'Un règlement intérieur d\'un musée accueillant des artistes',
    optionD: 'Une invitation à une exposition de fin de résidence',
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Appel à candidatures — Résidence d\'artiste 2026',
    longText: DOC_APPEL_CANDIDATURE,
    question: 'Quelle est la contrepartie demandée aux artistes sélectionnés ?',
    optionA: 'Céder 10 % des œuvres produites à la fondation',
    optionB: 'Réaliser une exposition finale et 2 ateliers pédagogiques pour scolaires',
    optionC: 'Enseigner 10 heures par semaine dans une école d\'art',
    optionD: 'Publier un article dans la revue de la fondation',
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Contrat d\'assurance — Œuvres d\'art de la Galerie Lumière',
    longText: DOC_CONTRAT_ASSURANCE,
    question: 'Selon ce contrat d\'assurance, quel sinistre est EXCLU des garanties ?',
    optionA: 'Le vol avec effraction',
    optionB: 'Les dommages accidentels lors de la manipulation',
    optionC: 'L\'usure normale et la vétusté',
    optionD: 'Les dégâts des eaux',
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Contrat d\'assurance — Œuvres d\'art de la Galerie Lumière',
    longText: DOC_CONTRAT_ASSURANCE,
    question: 'Selon ce contrat, pour être couverte contre le vol, quelle condition l\'assuré doit-il remplir ?',
    optionA: 'Faire appel à un gardien de sécurité 24h/24',
    optionB: 'Disposer d\'une alarme certifiée',
    optionC: 'Installer des caméras de surveillance agréées',
    optionD: 'Conserver toutes les œuvres dans un coffre-fort',
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Billet de concert — Philharmonie de Paris',
    longText: DOC_BILLET_CONCERT,
    question: 'Ce document est…',
    optionA: 'Un programme de concert de musique classique',
    optionB: 'Un billet nominatif pour un concert à la Philharmonie de Paris',
    optionC: 'Une invitation presse pour une première musicale',
    optionD: 'Un abonnement annuel à la Philharmonie de Paris',
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Billet de concert — Philharmonie de Paris',
    longText: DOC_BILLET_CONCERT,
    question: 'Selon ce billet, que se passe-t-il pour les retardataires ?',
    optionA: 'Ils ne peuvent pas entrer dans la salle',
    optionB: 'Ils sont placés de façon différée à l\'entracte',
    optionC: 'Ils peuvent entrer librement à tout moment',
    optionD: 'Ils sont remboursés intégralement',
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Guide du visiteur — Exposition Lumières d\'Afrique',
    longText: DOC_GUIDE_EXPO,
    question: 'Ce document est…',
    optionA: 'Le catalogue d\'une vente aux enchères d\'art africain',
    optionB: 'Le guide du visiteur d\'une exposition sur les cultures visuelles africaines',
    optionC: 'Le règlement intérieur du musée du Quai Branly',
    optionD: 'Un programme de conférence sur l\'art africain contemporain',
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Guide du visiteur — Exposition Lumières d\'Afrique',
    longText: DOC_GUIDE_EXPO,
    question: 'Selon ce guide, en quelle(s) langue(s) les visites en langue des signes sont-elles proposées ?',
    optionA: 'En anglais et en espagnol',
    optionB: 'En langue des signes française (LSF)',
    optionC: 'En arabe et en swahili',
    optionD: 'Dans toutes les langues de l\'audio-guide',
    correctAnswer: 'B',
  }));

  // ── Q33-40 ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — Le streaming musical et la rémunération des artistes',
    longText: ART_MUSIQUE_STREAMING,
    question: 'Selon cet article, combien d\'écoutes un artiste doit-il accumuler pour gagner l\'équivalent d\'un SMIC mensuel ?',
    optionA: 'Entre 5 000 et 10 000 écoutes',
    optionB: 'Entre 50 000 et 100 000 écoutes',
    optionC: 'Entre 200 000 et 300 000 écoutes',
    optionD: 'Plus d\'un million d\'écoutes',
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — Le streaming musical et la rémunération des artistes',
    longText: ART_MUSIQUE_STREAMING,
    question: 'L\'auteur présente le modèle « user-centric » comme une réforme qui bénéficierait principalement…',
    optionA: 'Aux grandes majors de l\'industrie musicale',
    optionB: 'Aux artistes de niche (peu streamés mais avec un public fidèle)',
    optionC: 'Aux artistes déjà très populaires avec de nombreuses écoutes',
    optionD: 'Aux plateformes de streaming qui réduiraient leurs coûts',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — Cinéma et plateformes de streaming',
    longText: ART_CINEMA_PLATFORMES,
    question: 'Selon cet article, quelle catégorie de films continue d\'attirer massivement le public en salle ?',
    optionA: 'Les films d\'auteur et art et essai',
    optionB: 'Les blockbusters nécessitant grand écran et sonorisation professionnelle',
    optionC: 'Les films documentaires et les reportages',
    optionD: 'Les comédies romantiques et les films pour enfants',
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — Cinéma et plateformes de streaming',
    longText: ART_CINEMA_PLATFORMES,
    question: 'L\'auteur présente la coexistence salles / plateformes comme…',
    optionA: 'Un risque fatal pour l\'industrie cinématographique',
    optionB: 'Inévitable et potentiellement bénéfique pour les deux secteurs',
    optionC: 'Un modèle temporaire avant la disparition totale des salles',
    optionD: 'Une menace exclusive pour les films d\'auteur et d\'art et essai',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — La mobilité du futur entre promesses et réalités',
    longText: ART_TRANSPORT_FUTUR,
    question: 'Selon cet article, quelles mobilités connaissent le développement réel le plus important ?',
    optionA: 'La voiture autonome et l\'hyperloop',
    optionB: 'Les transports simples et éprouvés : vélo électrique, TGV, bus en site propre',
    optionC: 'Les avions électriques et les drones de livraison',
    optionD: 'Les navires à propulsion magnétique et les capsules sous-marines',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — La mobilité du futur entre promesses et réalités',
    longText: ART_TRANSPORT_FUTUR,
    question: 'Selon l\'article, l\'hyperloop fait face à quel obstacle majeur pour son déploiement commercial ?',
    optionA: 'Le rejet de la population riveraine des tracés',
    optionB: 'Des coûts d\'infrastructure colossaux et des défis techniques non résolus',
    optionC: 'L\'opposition des compagnies ferroviaires traditionnelles',
    optionD: 'Le manque d\'investisseurs privés dans le projet',
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — L\'urbanisme durable pour le XXIe siècle',
    longText: ART_URBANISME_DURABLE,
    question: 'Selon cet article, en quoi consiste le concept de « ville du quart d\'heure » ?',
    optionA: 'Réduire la vitesse de circulation à 15 km/h dans les centres-villes',
    optionB: 'Permettre d\'accéder à pied ou à vélo à tous les services essentiels en moins de 15 minutes',
    optionC: 'Construire des logements à moins de 15 minutes des gares TGV',
    optionD: 'Organiser les livraisons urbaines en moins de 15 minutes',
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — L\'urbanisme durable pour le XXIe siècle',
    longText: ART_URBANISME_DURABLE,
    question: 'L\'auteur présente la réhabilitation des friches industrielles comme préférable à…',
    optionA: 'La construction de nouveaux bâtiments écologiques en centre-ville',
    optionB: 'La construction sur des terres agricoles (étalement urbain)',
    optionC: 'La transformation de parcs urbains en zones d\'habitation',
    optionD: 'La démolition de quartiers historiques pour les reconstruire',
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
    console.log(`\n✅ 40 questions créées pour CE 52.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
