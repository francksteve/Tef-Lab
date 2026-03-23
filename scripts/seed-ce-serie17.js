'use strict';
/**
 * seed-ce-serie17.js
 * Peuple la série CE 17 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie17.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyogpe000d0wxljrqhav1e';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts émissions CO2 par secteur ── */
function generateQ22SVG() {
  const years = ['2015','2016','2017','2018','2019','2020','2021','2022'];
  // Graphique correct = B (secteur transports réduit de 18% entre 2015 et 2022)
  const graphs = [
    { label: 'Graphique 1', dataA: [100,105,108,112,115,110,118,122], dataB: [80,82,85,88,90,87,92,95], colorA: '#E30613', colorB: '#6b7280' },
    { label: 'Graphique 2', dataA: [95,93,90,87,85,82,80,78], dataB: [70,68,65,63,61,59,57,55], colorA: '#003087', colorB: '#E30613' }, // CORRECT: transport -18%
    { label: 'Graphique 3', dataA: [60,62,65,68,70,72,75,78], dataB: [50,52,55,58,60,63,66,70], colorA: '#E30613', colorB: '#6b7280' },
    { label: 'Graphique 4', dataA: [110,108,105,102,100,98,96,94], dataB: [90,88,85,83,81,79,77,76], colorA: '#E30613', colorB: '#6b7280' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 130;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const stepX = plotW / (years.length - 1);

    const gridLines = [0, 40, 80, 120].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const makePoints = (data) => data.map((v, i) => {
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
           `<polyline points="${makePoints(g.dataA)}" fill="none" stroke="${g.colorA}" stroke-width="2"/>` +
           `<polyline points="${makePoints(g.dataB)}" fill="none" stroke="${g.colorB}" stroke-width="2"/>` +
           `<text x="${cx + 100}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorA}">— Transports</text>` +
           `<text x="${cx + 250}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorB}">— Industrie</text>`;
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
  { title: 'Énergie 1', content: "L'énergie solaire photovoltaïque capte les rayons du soleil grâce à des panneaux installés sur les toits ou au sol. Elle est la plus répandue des énergies renouvelables en zone urbaine. Son principal inconvénient est l'intermittence liée aux conditions météorologiques." },
  { title: 'Énergie 2', content: "L'éolien offshore désigne les turbines à vent installées en mer, à des distances variables des côtes. Les vents marins sont plus réguliers et plus forts que les vents terrestres, ce qui permet une production d'énergie plus stable et plus puissante que l'éolien terrestre." },
  { title: 'Énergie 3', content: "L'énergie hydraulique exploite la force des cours d'eau via des barrages et des turbines. C'est la principale source d'énergie renouvelable en France. Elle permet un stockage important par pompage-turbinage mais nécessite des conditions géographiques spécifiques." },
  { title: 'Énergie 4', content: "La géothermie exploite la chaleur naturelle de la Terre. Des sondes ou des forages permettent de capter cette énergie pour le chauffage ou la production d'électricité. Elle est particulièrement développée dans les zones volcaniques comme l'Islande." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Média 1', content: "Le journal télévisé est une émission d'information diffusée à des horaires réguliers sur les chaînes de télévision. Il présente les principales actualités du jour de façon chronologique, avec des reportages, des interviews et des analyses de journalistes spécialisés." },
  { title: 'Média 2', content: "Le podcast est une émission audio produite en série et disponible sur des plateformes numériques. Les auditeurs peuvent télécharger ou écouter en streaming chaque épisode à la demande, à l'heure qui leur convient. Le format peut durer de quelques minutes à plusieurs heures." },
  { title: 'Média 3', content: "Le webzine (ou magazine en ligne) est une publication numérique disponible sur internet, proposant des articles, des dossiers et des reportages sur des thèmes spécifiques. Contrairement au podcast, il est consultable visuellement et peut inclure photos et vidéos." },
  { title: 'Média 4', content: "La radio est un média audio diffusé en temps réel sur des fréquences hertziennes ou via internet. Elle propose de la musique, des émissions d'information, des débats et des programmes de divertissement. L'écoute se fait en direct, sans possibilité de réécoute différée." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Sport 1', content: "Le football est le sport collectif le plus pratiqué dans le monde. Il oppose deux équipes de 11 joueurs qui s'affrontent sur un terrain rectangulaire avec pour but d'envoyer un ballon rond dans le filet adverse. La durée réglementaire est de 90 minutes." },
  { title: 'Sport 2', content: "Le volleyball se joue à deux équipes de 6 joueurs séparées par un filet. L'objectif est d'envoyer le ballon dans le camp adverse sans qu'il touche le sol de son propre camp. Les échanges s'effectuent uniquement en frappant le ballon avec les bras ou les mains." },
  { title: 'Sport 3', content: "Le handball se joue en salle avec deux équipes de 7 joueurs (6 joueurs de champ + 1 gardien). Les joueurs se déplacent avec le ballon en le dribblant ou en se le passant et tentent de le mettre dans le but adverse gardé par le gardien." },
  { title: 'Sport 4', content: "Le rugby à XV est un sport collectif qui oppose deux équipes de 15 joueurs. L'objectif est de marquer des points en posant le ballon ovale dans en-but adverse (essai) ou en le faisant passer entre les poteaux (transformation, pénalité). Le jeu de corps à corps est autorisé." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Mode 1', content: "La fast fashion désigne un mode de consommation vestimentaire basé sur des collections très fréquentes (parfois hebdomadaires), des prix bas et un renouvellement rapide des tendances. Elle est critiquée pour son impact environnemental (déchets textiles, pollution de l'eau, émissions CO2)." },
  { title: 'Mode 2', content: "La mode durable (ou slow fashion) encourage l'achat de vêtements de qualité, fabriqués dans des conditions éthiques et avec des matières respectueuses de l'environnement. Elle prône le choix de pièces intemporelles, la réparation plutôt que le remplacement et la seconde main." },
  { title: 'Mode 3', content: "La consommation collaborative dans le secteur de la mode repose sur le partage ou la location de vêtements entre particuliers, via des plateformes numériques. Elle permet de réduire les dépenses et l'impact environnemental tout en accédant à des pièces variées sans les posséder." },
  { title: 'Mode 4', content: "Le upcycling consiste à transformer des vêtements ou des tissus usagés en nouvelles créations à valeur ajoutée. Cette pratique créative repose sur la réutilisation de matières existantes pour créer des pièces uniques, réduisant ainsi les déchets textiles." },
]);

/* ── Documents Q23-32 ── */
const DOC_CHARTE_DEV_DURABLE =
`CHARTE DÉVELOPPEMENT DURABLE — GROUPE INDUSTRIA

Le Groupe Industria s'engage à intégrer les principes du développement durable dans l'ensemble de ses activités industrielles et commerciales.

ENVIRONNEMENT : Réduire de 40 % nos émissions de gaz à effet de serre d'ici 2030 (base 2020). Atteindre 100 % d'énergies renouvelables dans nos usines d'ici 2027. Éliminer les rejets de polluants chimiques dans les cours d'eau avant 2025.

SOCIAL : Garantir un salaire supérieur de 15 % au SMIC pour tous nos employés. Former 100 % du personnel aux gestes écologiques d'ici fin 2024.

GOUVERNANCE : Publier un rapport RSE annuel vérifié par un organisme indépendant. Intégrer des critères environnementaux dans les décisions d'investissement.`;

const DOC_OFFRE_EMPLOI_RSE =
`OFFRE D'EMPLOI — COORDINATEUR(TRICE) RSE (H/F)

Groupe industriel engagé dans la transition écologique recrute un(e) coordinateur(trice) RSE pour son siège.

MISSIONS : Pilotage du plan RSE du groupe, suivi des indicateurs environnementaux et sociaux, relation avec les parties prenantes (salariés, actionnaires, ONG, collectivités), rédaction du rapport annuel RSE, veille réglementaire (taxonomie verte, CSRD).

PROFIL : Master en développement durable, RSE ou management environnemental. 3-5 ans d'expérience en RSE ou développement durable en entreprise. Maîtrise des référentiels GRI, ISO 14001, B Corp. Excellentes compétences rédactionnelles.

CONDITIONS : CDI, cadre. Rémunération : 3 500-4 200 €/mois. Voiture de fonction, intéressement.`;

const DOC_CONVENTION_PARTENARIAT =
`CONVENTION DE PARTENARIAT
Entre : Association Forêts Vivantes (ci-après « l'Association »)
Et : Entreprise VerteTech (ci-après « l'Entreprise »)

OBJET : L'Entreprise s'engage à financer les actions de reboisement menées par l'Association dans le cadre du programme « 10 000 arbres pour demain ».

ENGAGEMENTS DE L'ENTREPRISE : Versement annuel de 50 000 € pour une durée de 3 ans. Mise à disposition de bénévoles (10 jours/an). Communication sur le partenariat avec mention de l'Association.

ENGAGEMENTS DE L'ASSOCIATION : Rapport trimestriel d'avancement des plantations. Certification du nombre d'arbres plantés par un organisme agréé. Mention de l'Entreprise dans ses communications.

DURÉE : 3 ans à compter du 1er janvier — renouvelable par accord des parties.`;

const DOC_NOTE_TELETRAVAIL =
`NOTE DE SERVICE — Direction Générale
Objet : Nouvelles modalités de télétravail — Accord d'entreprise

Suite à la signature de l'accord d'entreprise le 15 novembre, les nouvelles règles de télétravail entrent en vigueur le 1er décembre :

• ÉLIGIBILITÉ : Tous les salariés en CDI après leur période d'essai, dont le poste est compatible avec le télétravail (évaluation par le manager direct).
• JOURS : Maximum 3 jours de télétravail par semaine. Minimum 2 jours de présence au bureau obligatoires.
• ÉQUIPEMENTS : L'entreprise fournit un ordinateur portable et rembourse les frais de connexion à hauteur de 25 €/mois.
• INDEMNITÉ : Indemnité forfaitaire de 2,50 € par jour télétravaillé, exonérée de charges sociales.`;

const DOC_REGLEMENT_TOURNOI =
`RÈGLEMENT OFFICIEL — TOURNOI RÉGIONAL DE TENNIS AMATEUR

CATÉGORIES : Simple Messieurs | Simple Dames | Double Mixte

INSCRIPTION : Ouverte jusqu'au 15 août. Frais d'inscription : 25 € par joueur (35 € pour le double mixte par équipe). Licences FFT valides obligatoires.

FORMAT : Tour préliminaire en poules (3 matchs garantis). Phase finale en élimination directe. Match en 2 sets gagnants (tie-break à 6/6). Super tie-break décisif à la place du 3e set.

PRIX : 1er : Coupe + 300 € | 2e : Médaille + 150 € | 3e-4e : Médaille + 75 €

Les décisions de l'arbitre sont définitives. Tout comportement irrespectueux entraîne la disqualification immédiate.`;

/* ── Articles de presse Q33-40 ── */
const ART_TRANSITION_ENERGETIQUE =
`LA TRANSITION ÉNERGÉTIQUE INDUSTRIELLE : UN DÉFI TECHNOLOGIQUE ET FINANCIER

L'industrie est responsable d'environ 25 % des émissions mondiales de CO2. Sa décarbonation représente donc un enjeu central dans la lutte contre le changement climatique, mais aussi l'un des défis techniques et économiques les plus complexes à relever. Contrairement au secteur de l'électricité, où la transition vers les renouvelables est bien amorcée, l'industrie lourde (acier, ciment, chimie, aluminium) utilise des procédés à très haute température difficiles à électrifier.

Plusieurs voies technologiques sont explorées. L'hydrogène vert, produit par électrolyse de l'eau à partir d'électricité renouvelable, est considéré comme l'une des solutions les plus prometteuses pour décarboner les hauts fourneaux et les fours industriels. La capture et le stockage du carbone (CSC) permettrait de capter les émissions résiduelles et de les enfouir dans des formations géologiques profondes. L'électrification des procédés à haute température, encore en développement, ouvre également des perspectives.

Le financement de cette transition pose des défis considérables. Les investissements nécessaires se chiffrent en centaines de milliards d'euros à l'échelle mondiale. Les industries européennes subissent de plus la concurrence de pays moins exigeants sur le plan environnemental, ce qui crée un risque de fuite carbone — la délocalisation des productions polluantes hors d'Europe.

Le mécanisme d'ajustement carbone aux frontières de l'Union européenne, entré en vigueur progressivement depuis 2023, vise précisément à créer des conditions équitables en taxant les importations selon leur empreinte carbone. Cette mesure audacieuse est regardée de près par les partenaires commerciaux de l'UE.`;

const ART_DESERTIFICATION_MEDIATIQUE =
`LA DÉSERTIFICATION MÉDIATIQUE RÉGIONALE : QUAND L'INFORMATION LOCALE DISPARAÎT

La presse locale et régionale est en crise profonde dans la plupart des pays développés. La chute des revenus publicitaires, accélérée par la migration vers les plateformes numériques mondiales, a provoqué la fermeture de centaines de journaux locaux en France, au Royaume-Uni et en Amérique du Nord au cours de la dernière décennie. Ce phénomène crée des déserts médiatiques — des territoires où il n'existe plus aucun média local pour couvrir la vie politique, économique et sociale des collectivités.

Les conséquences sont multiples et préoccupantes. En l'absence de journalistes locaux, la corruption, les décisions d'urbanisme contestées et les scandales de gestion municipale passent inaperçus. Des études menées aux États-Unis montrent une corrélation significative entre la disparition des journaux locaux et l'augmentation des dépenses publiques communales, faute de contrôle démocratique.

Des solutions émergent timidement. Des fondations philanthropiques financent des médias d'information locale à but non lucratif. Des coopératives de journalistes reprennent des titres en faillite. Des collectivités locales subventionnent des médias communautaires, soulevant parfois des questions d'indépendance éditoriale.

L'information locale n'est pas un luxe : c'est un pilier de la démocratie locale, qui permet aux citoyens de contrôler leurs élus, de débattre des projets qui les concernent et de maintenir un lien social dans leurs territoires. Sa disparition silencieuse est un symptôme alarmant d'une fragilité démocratique que nos sociétés tardent à reconnaître.`;

const ART_SPORT_PROFESSIONNEL =
`L'ÉCONOMIE DU SPORT PROFESSIONNEL : ENTRE PASSION ET INDUSTRIE MILLIARDAIRE

Le sport professionnel est devenu une industrie à part entière, pesant plusieurs centaines de milliards de dollars à l'échelle mondiale. Les droits télévisés, les sponsors, les transferts de joueurs et les revenus des stades constituent les piliers d'un écosystème économique complexe où les passions populaires côtoient les logiques financières les plus sophistiquées.

Les clubs de football européens les plus riches — Real Madrid, Manchester City, Paris Saint-Germain — affichent des revenus annuels dépassant 700 millions d'euros. Les droits de retransmission de la Premier League anglaise s'élèvent à plusieurs milliards de livres par cycle de trois ans. Dans ce contexte, les transferts de joueurs ont atteint des sommets vertigineux : plus d'un milliard de dollars dépensés par certains clubs en une seule saison.

Cette financiarisation du sport soulève des questions fondamentales. Le sport professionnel est-il encore accessible aux classes populaires qui l'ont inventé ? Les prix des billets d'entrée, l'abonnement à des chaînes payantes multiples, la transformation des stades en temples de la consommation éloignent progressivement les supporteurs les moins aisés. La compétition sportive elle-même est faussée par les inégalités financières entre clubs.

Pourtant, le sport reste un vecteur puissant d'identité collective, d'émotions partagées et de cohésion sociale. Sa capacité à mobiliser des millions de personnes, à transcender les frontières et à produire des récits épiques en fait un phénomène culturel irréductible à sa seule dimension économique.`;

const ART_BIODIVERSITE_URBAINE =
`LA BIODIVERSITÉ URBAINE : LA NATURE REPREND SES DROITS EN VILLE

Les villes, longtemps perçues comme des déserts écologiques imperméables au vivant, sont en réalité des milieux bien plus riches qu'on ne l'imaginait. Pigeons et moineaux sont désormais rejoints par des renards, des hérissons, des faucons pèlerins nichant sur les tours et, dans certaines villes, des cerfs aux portes des suburbs. La nature urbaine s'adapte, colonise les interstices et réinvente ses niches écologiques à une vitesse surprenante.

Cette biodiversité ne relève pas seulement de l'anecdote. Elle joue des fonctions écosystémiques réelles : régulation des températures par les arbres et la végétation, filtre naturel des eaux pluviales par les sols perméables, pollinisation des jardins et des espaces verts par les insectes, réduction des îlots de chaleur urbains. Plusieurs études montrent que les habitants de quartiers verdoyants ont une meilleure santé mentale et physique.

Les villes réagissent en repensant leurs aménagements. Paris a planté 170 000 arbres depuis 2015 et développe ses coulées vertes. Singapour intègre systématiquement des jardins suspendus dans ses gratte-ciels. Berlin a transformé ses anciens espaces ferroviaires en corridors écologiques. La notion de nature en ville a évolué d'une option esthétique à une nécessité sanitaire et climatique.

Les défis restent nombreux : artificialisation des sols, pollution lumineuse nocturne qui désoriente les oiseaux migrateurs, fragments de milieux naturels isolés qui ne permettent pas une véritable circulation de la faune. La biodiversité urbaine a besoin de continuités, de corridors verts reliant les parcs entre eux et avec la campagne environnante.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Règlement parc naturel
  qs.push(q(1, 'Q1-7', null, {
    longText:
`PARC NATUREL RÉGIONAL DE LA FORÊT BLEUE — CHARTE DES VISITEURS

SENTIERS BALISÉS :
• Restez sur les sentiers balisés — la faune sauvage doit être protégée de tout dérangement.
• Emportez vos déchets — aucune poubelle dans le parc.
• Les feux sont strictement interdits toute l'année.

FAUNE :
• Il est interdit de nourrir les animaux sauvages.
• Les chiens doivent être tenus en laisse en toutes circonstances.
• La chasse n'est pas autorisée dans le parc.

ACCÈS : Ouvert toute l'année, 24 h/24. Parking gratuit à l'entrée principale.`,
    question: "Selon ce règlement, les chiens dans le parc doivent…",
    optionA: "être laissés à l'extérieur du parc.",
    optionB: "être tenus en laisse en toutes circonstances.",
    optionC: "être admis uniquement le week-end.",
    optionD: "être muselés dans les zones de faune sauvage.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme conférence professionnelle
  qs.push(q(2, 'Q1-7', null, {
    longText:
`FORUM PROFESSIONNEL — RSE ET TRANSITION ÉCOLOGIQUE
Mardi 9 avril — Centre des Congrès Horizon

8 h 30 — Accueil et café de bienvenue
9 h 00 — Ouverture : « L'entreprise face aux défis climatiques » — Dr. Ahmed SALL
10 h 00 — Table ronde : « Comment financer la transition verte ? »
11 h 30 — Ateliers parallèles (au choix) :
  A. Bilan carbone et compensation | B. Économie circulaire | C. Finance durable
13 h 00 — Déjeuner réseau
14 h 30 — Conférence : « Réglementation européenne CSRD — Obligations et opportunités »
16 h 00 — Synthèse et clôture
Inscription obligatoire : forum-rse.fr | Tarif : 150 € HT (gratuit pour les membres)`,
    question: "Selon ce programme, les membres inscrits paient…",
    optionA: "un tarif réduit de 75 €.",
    optionB: "le tarif standard de 150 € HT.",
    optionC: "rien, l'inscription est gratuite pour eux.",
    optionD: "un forfait déjeuner en sus.",
    correctAnswer: 'C',
  }));

  // Q3 — Invitation mariage
  qs.push(q(3, 'Q1-7', null, {
    longText:
`Manon & Thomas
ont le bonheur de vous annoncer leur mariage
et vous invitent à les rejoindre pour célébrer cet événement

Le samedi 12 juillet
Cérémonie civile à 14 h 00 — Mairie de Saint-Rémy-lès-Chevreuse
Vin d'honneur à 16 h 00 — Domaine de la Roseraie, 12 km du village
Dîner et soirée dansante à partir de 19 h 30

Tenue de soirée souhaitée — Code couleur : blanc et doré

Merci de confirmer votre présence avant le 15 juin
Manon : 06 11 22 33 44 | Thomas : 06 55 66 77 88`,
    question: "D'après cette invitation, la cérémonie civile aura lieu…",
    optionA: "à la Roseraie à 14 h 00.",
    optionB: "à la mairie à 14 h 00.",
    optionC: "à l'église à 16 h 00.",
    optionD: "au domaine à 19 h 30.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce matériel jardinage
  qs.push(q(4, 'Q1-7', null, {
    longText:
`VENTE MATÉRIEL DE JARDINAGE — Cause déménagement

Tondeuse à gazon électrique — 1 800 W, coupe 42 cm — état neuf
Prix : 95 € (valeur 220 €)

Taille-haie thermique — professionnel, peu utilisé
Prix : 110 €

Composteur 300 L avec bac de compost mûr inclus
Prix : 45 €

Outils à main : fourches, pelles, râteaux, binettes — lot complet
Prix : 30 €

Contact : Mme Beaumont — 06 33 44 55 66
Visites et enlèvements uniquement le samedi de 9 h à 12 h`,
    question: "Ce document est…",
    optionA: "une publicité pour un magasin de jardinage.",
    optionB: "un catalogue de location d'outils de jardin.",
    optionC: "une annonce de vente de matériel de jardinage d'occasion.",
    optionD: "un programme d'entretien de jardin.",
    correctAnswer: 'C',
  }));

  // Q5 — Communiqué association écologie
  qs.push(q(5, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — ASSOCIATION PLANÈTE VERTE

À l'occasion de la Journée Mondiale de l'Environnement (5 juin), l'association Planète Verte organise une grande journée de nettoyage des berges de la rivière.

DATE : Samedi 7 juin — 9 h à 13 h
LIEU : Parking de la Base Nautique — départ depuis le ponton Est

PROGRAMME : Collecte des déchets sur 3 km de berges, tri sélectif sur place, pesée et transmission des données à l'observatoire régional des déchets sauvages.

PARTICIPATION LIBRE ET GRATUITE — Équipement fourni (gants, sacs, gilets)
Inscription souhaitée : contact@planeteverte.fr pour estimation des participants.`,
    question: "Ce communiqué annonce…",
    optionA: "un congrès scientifique sur la pollution des rivières.",
    optionB: "une journée de nettoyage des berges d'une rivière.",
    optionC: "une campagne de sensibilisation dans les écoles.",
    optionD: "un projet de construction d'une station de traitement des eaux.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi composteur
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMPOSTEUR DE JARDIN ECOBAC — MODE D'EMPLOI

DÉMARRAGE : Posez le composteur directement sur la terre (jamais sur du béton ou du carrelage) pour permettre aux vers de venir y habiter.

MATIÈRES À AJOUTER :
✓ Épluchures de légumes et fruits, marc de café, sachets de thé
✓ Tonte de gazon, feuilles mortes, petites branches broyées
✗ Viande, poisson, produits laitiers, plantes malades

ENTRETIEN : Aérez le compost une fois par semaine avec une fourche. Maintenez une humidité homogène (comme une éponge essorée). Mélangez les matières vertes (humides) et les matières brunes (sèches) en proportions égales.

RÉCOLTE : Le compost est mûr en 3 à 6 mois selon les saisons.`,
    question: "Selon ce mode d'emploi, le composteur doit être posé…",
    optionA: "sur une surface bétonnée pour la stabilité.",
    optionB: "directement sur la terre pour les vers.",
    optionC: "à l'intérieur du garage à l'abri du froid.",
    optionD: "dans un endroit ombragé loin des plantes.",
    correctAnswer: 'B',
  }));

  // Q7 — Affiche tournoi sportif
  qs.push(q(7, 'Q1-7', null, {
    longText:
`3e TOURNOI INTERCOMMUNAL DE PÉTANQUE — JUILLET

ORGANISATION : Club de Pétanque La Boule d'Or

CATÉGORIES :
• Triplettes (équipes de 3) — toutes catégories confondues
• Doublettes vétérans (60 ans et plus)

DATE : Dimanche 20 juillet — 8 h 30 (accueil) — 9 h 00 (début des parties)
LIEU : Boulodrome municipal — Allée des Platanes

INSCRIPTION : 12 € par joueur avant le 15 juillet
(Licence FFPJP ou certificat médical de non contre-indication au sport requis)

Buvette et restauration sur place toute la journée
Remise des récompenses à 18 h`,
    question: "Selon cette affiche, pour s'inscrire, les joueurs doivent…",
    optionA: "Être membres du club organisateur.",
    optionB: "Présenter une licence FFPJP ou un certificat médical.",
    optionC: "Avoir plus de 60 ans pour la catégorie principale.",
    optionD: "Payer 12 € le jour du tournoi.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La perte de ___ liée à la destruction des habitats naturels représente une menace grave pour les équilibres écologiques de la planète.",
    question: PHRASE_Q,
    optionA: "ressources",
    optionB: "forêts",
    optionC: "biodiversité",
    optionD: "superficie",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ d'investigation a passé plusieurs mois à rassembler des preuves avant de publier son enquête sur la corruption dans les marchés publics.",
    question: PHRASE_Q,
    optionA: "avocat",
    optionB: "journaliste",
    optionC: "policier",
    optionD: "politique",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'économie circulaire vise à transformer les déchets industriels en ___ première pour de nouveaux cycles de production, réduisant ainsi l'extraction de ressources naturelles.",
    question: PHRASE_Q,
    optionA: "matière",
    optionB: "énergie",
    optionC: "produit",
    optionD: "combustible",
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En football, l'___ est le seul joueur autorisé à utiliser ses mains pour attraper le ballon dans la surface de réparation.",
    question: PHRASE_Q,
    optionA: "capitaine",
    optionB: "défenseur",
    optionC: "arbitre",
    optionD: "gardien",
    correctAnswer: 'D',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ annuel de la société révèle une progression significative du chiffre d'affaires mais également une augmentation des charges d'exploitation.",
    question: PHRASE_Q,
    optionA: "budget",
    optionB: "bilan",
    optionC: "devis",
    optionD: "relevé",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ d'un mariage dans une grande salle nécessite une organisation minutieuse incluant les invitations, le traiteur et la décoration.",
    question: PHRASE_Q,
    optionA: "réception",
    optionB: "cérémonie",
    optionC: "célébration",
    optionD: "réunion",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La transformation numérique de la presse écrite est inévitable. De plus en plus de lecteurs préfèrent un [14] numérique annuel à l'achat quotidien du journal papier. Cette évolution contraint les éditeurs à renouveler leur modèle économique pour fidéliser leurs [15] sur les plateformes en ligne.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La presse numérique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "abonnement",
    optionB: "forfait",
    optionC: "contrat",
    optionD: "pass",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La presse numérique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "rédacteurs",
    optionB: "lecteurs",
    optionC: "abonnés",
    optionD: "clients",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "L'économie de partage bouleverse les modèles commerciaux traditionnels. Les [16] numériques permettent à des particuliers de louer leur voiture, leur logement ou leurs outils sans passer par des intermédiaires professionnels. Ces services sont utilisés par des millions d'[17] qui recherchent des alternatives plus économiques et plus flexibles.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'économie de partage",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "plateformes",
    optionB: "marchés",
    optionC: "agences",
    optionD: "réseaux",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'économie de partage",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "consommateurs",
    optionB: "utilisateurs",
    optionC: "propriétaires",
    optionD: "locataires",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle énergie renouvelable utilise des turbines installées en mer ?",
    optionA: "Énergie 1",
    optionB: "Énergie 2",
    optionC: "Énergie 3",
    optionD: "Énergie 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel média est une émission audio disponible en téléchargement à la demande ?",
    optionA: "Média 1",
    optionB: "Média 2",
    optionC: "Média 3",
    optionD: "Média 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel sport collectif se joue avec les mains et oppose 2 équipes de 7 joueurs ?",
    optionA: "Sport 1",
    optionB: "Sport 2",
    optionC: "Sport 3",
    optionD: "Sport 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel mode de consommation repose sur le partage ou la location entre particuliers ?",
    optionA: "Mode 1",
    optionB: "Mode 2",
    optionC: "Mode 3",
    optionD: "Mode 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le secteur des transports a réduit ses émissions de CO2 de 18 % entre 2015 et 2022. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Charte développement durable — Groupe Industria",
    longText: DOC_CHARTE_DEV_DURABLE,
    question: "Selon cette charte, quel est l'objectif de réduction des émissions de gaz à effet de serre d'ici 2030 ?",
    optionA: "20 %.",
    optionB: "30 %.",
    optionC: "40 %.",
    optionD: "50 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Charte développement durable — Groupe Industria",
    longText: DOC_CHARTE_DEV_DURABLE,
    question: "Selon la charte, la publication du rapport RSE annuel doit être…",
    optionA: "rédigée par le PDG de l'entreprise.",
    optionB: "vérifiée par un organisme indépendant.",
    optionC: "soumise aux actionnaires uniquement.",
    optionD: "envoyée aux seuls salariés de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Coordinateur RSE",
    longText: DOC_OFFRE_EMPLOI_RSE,
    question: "Ce poste de coordinateur RSE inclut notamment…",
    optionA: "La gestion du service comptabilité de l'entreprise.",
    optionB: "La rédaction du rapport annuel RSE.",
    optionC: "Le recrutement des équipes de production.",
    optionD: "La supervision des chantiers de construction écologique.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Coordinateur RSE",
    longText: DOC_OFFRE_EMPLOI_RSE,
    question: "Parmi les référentiels exigés pour ce poste, on trouve…",
    optionA: "ISO 9001 (management de la qualité).",
    optionB: "GRI et ISO 14001.",
    optionC: "HACCP (sécurité alimentaire).",
    optionD: "ITIL (gestion des services informatiques).",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Forêts Vivantes / VerteTech",
    longText: DOC_CONVENTION_PARTENARIAT,
    question: "Selon cette convention, quel est le montant annuel versé par l'entreprise à l'association ?",
    optionA: "10 000 €.",
    optionB: "25 000 €.",
    optionC: "50 000 €.",
    optionD: "100 000 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Forêts Vivantes / VerteTech",
    longText: DOC_CONVENTION_PARTENARIAT,
    question: "Parmi les obligations de l'association, on trouve…",
    optionA: "La formation des bénévoles de l'entreprise.",
    optionB: "La publication d'un rapport trimestriel d'avancement.",
    optionC: "Le financement de la communication de l'entreprise.",
    optionD: "L'organisation d'une conférence annuelle sur l'environnement.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Note de service — Nouvelles modalités de télétravail",
    longText: DOC_NOTE_TELETRAVAIL,
    question: "Selon la note, quel est le nombre maximum de jours de télétravail par semaine ?",
    optionA: "1 jour.",
    optionB: "2 jours.",
    optionC: "3 jours.",
    optionD: "4 jours.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Note de service — Nouvelles modalités de télétravail",
    longText: DOC_NOTE_TELETRAVAIL,
    question: "Selon la note, quel est le montant de l'indemnité forfaitaire par jour télétravaillé ?",
    optionA: "1,50 €.",
    optionB: "2,50 €.",
    optionC: "5,00 €.",
    optionD: "25 €.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Règlement officiel — Tournoi régional de tennis amateur",
    longText: DOC_REGLEMENT_TOURNOI,
    question: "Selon le règlement, combien de matchs sont garantis lors du tour préliminaire ?",
    optionA: "1 match garanti.",
    optionB: "2 matchs garantis.",
    optionC: "3 matchs garantis.",
    optionD: "4 matchs garantis.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Règlement officiel — Tournoi régional de tennis amateur",
    longText: DOC_REGLEMENT_TOURNOI,
    question: "Selon le règlement, un comportement irrespectueux entraîne…",
    optionA: "Un avertissement officiel inscrit au dossier.",
    optionB: "La perte du set en cours.",
    optionC: "La disqualification immédiate.",
    optionD: "Une amende de 50 €.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La transition énergétique industrielle",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "Selon cet article, quelle part des émissions mondiales de CO2 l'industrie représente-t-elle ?",
    optionA: "Environ 10 %.",
    optionB: "Environ 15 %.",
    optionC: "Environ 25 %.",
    optionD: "Environ 40 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La transition énergétique industrielle",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "Selon l'article, quel est l'objectif du mécanisme d'ajustement carbone aux frontières de l'UE ?",
    optionA: "Financer la transition énergétique des pays en développement.",
    optionB: "Taxer les importations selon leur empreinte carbone pour des conditions équitables.",
    optionC: "Interdire les importations de produits polluants.",
    optionD: "Subventionner les industries européennes vertes.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "La désertification médiatique régionale",
    longText: ART_DESERTIFICATION_MEDIATIQUE,
    question: "Selon l'article, des études américaines montrent une corrélation entre la disparition des journaux locaux et…",
    optionA: "Une baisse de la participation électorale.",
    optionB: "Une augmentation des dépenses publiques communales.",
    optionC: "Une augmentation de la criminalité locale.",
    optionD: "Une baisse de la fréquentation des bibliothèques.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "La désertification médiatique régionale",
    longText: ART_DESERTIFICATION_MEDIATIQUE,
    question: "L'auteur considère que l'information locale est…",
    optionA: "Un service commercial secondaire.",
    optionB: "Un pilier de la démocratie locale.",
    optionC: "Une responsabilité exclusive des collectivités.",
    optionD: "Un secteur que le numérique peut entièrement remplacer.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "L'économie du sport professionnel",
    longText: ART_SPORT_PROFESSIONNEL,
    question: "Selon l'article, quel est le chiffre d'affaires annuel des clubs de football européens les plus riches ?",
    optionA: "Plus de 100 millions d'euros.",
    optionB: "Plus de 300 millions d'euros.",
    optionC: "Dépassant 700 millions d'euros.",
    optionD: "Environ 1 milliard d'euros.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "L'économie du sport professionnel",
    longText: ART_SPORT_PROFESSIONNEL,
    question: "L'auteur conclut que le sport reste un phénomène culturel irréductible en raison de…",
    optionA: "Sa rentabilité économique pour les investisseurs.",
    optionB: "Sa capacité à générer de la cohésion sociale et des émotions partagées.",
    optionC: "L'augmentation constante des droits télévisés.",
    optionD: "La fidélité des supporteurs aux clubs historiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La biodiversité urbaine",
    longText: ART_BIODIVERSITE_URBAINE,
    question: "Selon cet article, Paris a planté combien d'arbres depuis 2015 ?",
    optionA: "50 000 arbres.",
    optionB: "100 000 arbres.",
    optionC: "170 000 arbres.",
    optionD: "250 000 arbres.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La biodiversité urbaine",
    longText: ART_BIODIVERSITE_URBAINE,
    question: "L'auteur identifie comme défi principal pour la biodiversité urbaine…",
    optionA: "Le manque de financement des espaces verts.",
    optionB: "Le besoin de corridors verts reliant les espaces naturels entre eux.",
    optionC: "La résistance des habitants aux espaces verts dans leur quartier.",
    optionD: "L'invasion des espèces exotiques envahissantes.",
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
    console.log(`\n✅ ${created} questions créées pour CE 17.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
