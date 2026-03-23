'use strict';
/**
 * seed-ce-serie33.js
 * Peuple la série CE 33 avec 40 questions TEF Canada officielles.
 * Thèmes : neurosciences, opéra, droit social européen, permaculture,
 *          IA générative, escalade, musées virtuels
 * Usage : node scripts/seed-ce-serie33.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyojmw000t0wxlxjqby0oq';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART — activité cérébrale expériences neurosciences ── */
function generateQ22SVG() {
  // Groupe B : pic 85% en mars = CORRECT
  const dataseries = [
    { label: 'Graphique 1 — Groupe A', points: [40, 45, 50, 48, 52, 55], color: '#E30613' },
    { label: 'Graphique 2 — Groupe B', points: [30, 50, 85, 70, 60, 55], color: '#003087' }, // CORRECT
    { label: 'Graphique 3 — Groupe C', points: [60, 58, 55, 53, 50, 48], color: '#E30613' },
    { label: 'Graphique 4 — Groupe D', points: [70, 72, 68, 65, 62, 60], color: '#E30613' },
  ];
  const months = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mars'];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 100;

  function drawLineChart(ds, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const step = plotW / (months.length - 1);
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');
    const pts = ds.points.map((v, i) => {
      const px = (plotX + i * step).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return { px, py };
    });
    const polyline = pts.map(p => `${p.px},${p.py}`).join(' ');
    const dots = pts.map(p =>
      `<circle cx="${p.px}" cy="${p.py}" r="4" fill="${ds.color}"/>`
    ).join('');
    const xlabels = months.map((m, i) => {
      const px = (plotX + i * step).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${m}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${ds.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines +
           `<polyline points="${polyline}" fill="none" stroke="${ds.color}" stroke-width="2.5"/>` +
           dots + xlabels +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Activation (%)</text>`;
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
  { title: 'Texte 1', content: "L'opera seria est un genre lyrique sérieux développé en Italie au XVIIIe siècle, centré sur des sujets mythologiques ou historiques. Ses personnages nobles expriment des passions épurées selon les règles strictes du bon goût baroque. Haendel et Vivaldi en sont les représentants les plus illustres." },
  { title: 'Texte 2', content: "L'opera buffa est un opéra comique italien né au XVIIIe siècle, mettant en scène des personnages populaires dans des intrigues légères et souvent satiriques. Il constitue une réaction au formalisme de l'opera seria. Mozart avec Les Noces de Figaro et Rossini avec Le Barbier de Séville en ont porté le genre à son apogée." },
  { title: 'Texte 3', content: "Le Singspiel est un genre lyrique germanique mêlant parties chantées et dialogues parlés, ancêtre de l'opérette et de la comédie musicale. La Flûte enchantée de Mozart en est l'exemple le plus célèbre. Il se distingue de l'opéra classique par son accessibilité et son public populaire." },
  { title: 'Texte 4', content: "Le grand opéra français du XIXe siècle se caractérise par ses dimensions spectaculaires : durée de 4 à 5 actes, grands chœurs, ballets intégrés, décors somptueux et sujets historiques. L'opéra de Paris et Meyerbeer en ont été les symboles. Berlioz et Saint-Saëns en ont enrichi le répertoire." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "L'alpinisme est la pratique de l'ascension des grandes montagnes, en particulier les sommets au-dessus de 4000 mètres. Il requiert une technique avancée, une condition physique exceptionnelle et une maîtrise de la neige et de la glace. L'ascension de l'Everest en 1953 par Hillary et Norgay reste son accomplissement symbolique le plus célèbre." },
  { title: 'Texte 2', content: "L'escalade de bloc, ou bouldering, consiste à grimper sur des rochers ou des blocs artificiels de faible hauteur, sans corde ni baudrier, avec des matelas de réception (crash pads) pour amortir les chutes. La difficulté est concentrée sur des mouvements très techniques appelés « problems ». Elle est entrée au programme olympique en 2020." },
  { title: 'Texte 3', content: "L'escalade sportive en salle consiste à grimper sur des murs artificiels équipés de prises colorées représentant des voies de difficultés variées. Elle se pratique avec une corde assurée par un partenaire (encordement) ou un système d'auto-assurage. C'est la forme la plus accessible et la plus pratiquée de l'escalade moderne." },
  { title: 'Texte 4', content: "L'escalade de grande voie consiste à enchaîner de nombreux longueurs de corde sur des falaises naturelles de plusieurs centaines de mètres. Elle nécessite une maîtrise technique avancée, des compétences en bivouac et une gestion rigoureuse du matériel. El Capitan à Yosemite et les Dolomites sont des sites emblématiques de cette pratique." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "La directive européenne sur le temps de travail fixe la durée maximale hebdomadaire à 48 heures en moyenne, incluant les heures supplémentaires. Elle garantit un repos journalier minimum de 11 heures consécutives et 4 semaines de congés payés annuels. Les États membres peuvent autoriser des dérogations dans certains secteurs avec l'accord des travailleurs." },
  { title: 'Texte 2', content: "Le droit de grève est un droit fondamental reconnu dans tous les États membres de l'Union européenne, bien que sa réglementation varie selon les pays. La Charte des droits fondamentaux de l'UE garantit ce droit. Certains services essentiels comme les pompiers ou les contrôleurs aériens font l'objet de restrictions spécifiques." },
  { title: 'Texte 3', content: "L'accord collectif européen est un accord conclu entre des organisations représentatives des employeurs et des travailleurs au niveau européen. Il a force juridique contraignante dans les États membres signataires. Des accords européens ont notamment porté sur le télétravail, le congé parental et le stress au travail." },
  { title: 'Texte 4', content: "La libre circulation des travailleurs est l'un des quatre piliers du marché unique européen. Tout citoyen de l'UE peut travailler dans n'importe quel État membre sans avoir besoin d'un permis de travail. Cette liberté fondamentale est protégée par le Traité sur le fonctionnement de l'Union européenne (TFUE)." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "Le musée numérique est une institution culturelle dont les collections sont accessibles en ligne, via un site web ou une application mobile. Il peut être la version virtuelle d'un musée physique existant ou exister exclusivement en ligne. Le Louvre, le Metropolitan Museum et le British Museum proposent des collections numériques étendues." },
  { title: 'Texte 2', content: "Le musée en réalité augmentée enrichit la visite physique avec des contenus numériques superposés sur l'environnement réel via un smartphone ou des lunettes AR. En pointant son téléphone sur un tableau, le visiteur peut voir une reconstitution en 3D de la scène, des animations ou des explications contextuelles. Cette technologie transforme l'expérience muséale traditionnelle." },
  { title: 'Texte 3', content: "Le musée en réalité virtuelle (VR) propose une expérience totalement immersive, transportant le visiteur dans un environnement numérique recréé : une ville antique, une fouille archéologique, ou une reproduction exacte d'un musée détruit. Il est accessible via un casque de réalité virtuelle depuis chez soi ou dans des espaces dédiés." },
  { title: 'Texte 4', content: "Le musée participatif est une institution culturelle qui associe activement les visiteurs à la création et à la médiation de ses contenus. Les collections peuvent être enrichies par des contributions citoyennes : témoignages, photographies, transcriptions de documents. Cette approche horizontale remet en question le modèle traditionnel du musée comme institution d'autorité." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_ESCALADE =
`RÈGLEMENT DE LA SALLE D'ESCALADE VERTICAL'UP

Accès et formation :
• Toute première visite nécessite une formation de sécurité obligatoire (30 minutes, gratuite) dispensée par un moniteur habilité.
• Les mineurs de moins de 14 ans doivent être accompagnés d'un adulte porteur d'une certification de la Fédération Française d'Escalade.
• L'accès à la zone de grande voie (murs > 15 m) est réservé aux grimpeurs titulaires de la qualification TOP CORDE délivrée par la salle.

Équipements :
• Le port du baudrier et d'une corde homologuée est obligatoire pour l'escalade en salle (sauf bloc).
• Les chaussons de grimpe sont obligatoires — chaussures de sport interdites sur les murs.`;

const DOC_OFFRE_NEURO =
`OFFRE D'EMPLOI — CHERCHEUR(SE) EN NEUROSCIENCES COGNITIVES

L'Institut National des Sciences du Cerveau (INSC) recrute un(e) chercheur(se) postdoctoral(e) dans le cadre du projet NEUROCREATE sur les bases neurales de la créativité.

Profil : Doctorat en neurosciences, psychologie cognitive ou disciplines connexes. Maîtrise des techniques d'imagerie cérébrale (IRMf, EEG). Expérience en analyse statistique de données neuroimagerie (FSL, SPM ou FreeSurfer).

Missions : conception et conduite d'expériences, analyse de données d'imagerie, rédaction d'articles scientifiques, participation aux séminaires du laboratoire.

Contrat : CDD 24 mois renouvelable. Début : 1er septembre. Rémunération selon grille CNRS chercheur postdoctoral.`;

const DOC_CONTRAT_OPERA =
`CONTRAT DE SAISON ARTISTIQUE — Compagnie Lyrique de l'Ouest

Entre : La Compagnie Lyrique de l'Ouest (ci-après « la Compagnie ») et M./Mme ___, chanteur(se) lyrique.

Article 1 — Objet : La Compagnie engage l'Artiste pour la saison 2025-2026 dans le cadre de la programmation de l'Opéra de Nantes.

Article 2 — Productions concernées : L'Artiste s'engage à participer à 3 productions : Traviata (soprano/ténor), Carmen (mezzo/baryton) et Les Noces de Figaro (baryton/mezzo). Les répétitions débutent 6 semaines avant chaque première.

Article 3 — Rémunération : Cachet par représentation selon la convention collective du spectacle vivant. Déplacements et hébergement pris en charge par la Compagnie.`;

const DOC_ACCORD_SOCIAL_EU =
`ACCORD-CADRE EUROPÉEN SUR LE TRAVAIL À TEMPS PARTIEL
Clause 4 — Principe de non-discrimination

Les travailleurs à temps partiel ne doivent pas être traités d'une manière moins favorable que les travailleurs à temps plein comparables au seul motif qu'ils travaillent à temps partiel, à moins qu'un traitement différent ne soit justifié par des raisons objectives.

Lorsque c'est approprié, le principe pro rata temporis s'applique. Ainsi, les avantages accordés aux travailleurs à temps plein (congés, primes, formations) sont calculés proportionnellement au temps de travail du salarié à temps partiel.

Les États membres et/ou les partenaires sociaux peuvent maintenir ou introduire des dispositions plus favorables que celles prévues dans le présent accord.`;

const DOC_GUIDE_PERMA =
`GUIDE DE CERTIFICATION EN PERMACULTURE
Réseau Permaculture France — Niveau Praticien

La certification Praticien en Permaculture atteste de la maîtrise des 12 principes de permaculture et de leur application concrète dans la conception de systèmes durables.

Pour obtenir la certification, le candidat doit :
• Avoir suivi un cours de conception en permaculture (CCP) certifié de 72 heures minimum
• Réaliser un projet de design permacole documenté (jardin, ferme ou espace urbain)
• Présenter ce projet devant un jury de praticiens certifiés
• Démontrer une pratique active depuis au moins 2 ans

La certification est valable 5 ans et renouvelable par validation des acquis et de l'expérience.`;

/* ── Articles de presse Q33-40 ── */
const ART_NEURO_APPRENTISSAGE =
`NEUROSCIENCES ET APPRENTISSAGE : CE QUE LE CERVEAU NOUS APPREND SUR L'ÉCOLE

Les neurosciences cognitives ont révolutionné notre compréhension des mécanismes d'apprentissage au cours des deux dernières décennies. En observant l'activité cérébrale de personnes en train d'apprendre, les chercheurs ont pu identifier les conditions qui favorisent la mémorisation durable et celles qui la sabotent.

Un résultat contre-intuitif s'est imposé : la difficulté est bénéfique pour l'apprentissage. S'efforcer de récupérer une information en mémoire, même avec des erreurs, renforce bien plus solidement les traces mnésiques qu'une relecture passive. Ce phénomène, appelé « effet de test » ou « pratique de récupération », a des implications considérables pour les méthodes pédagogiques.

La plasticité cérébrale — la capacité du cerveau à former de nouvelles connexions synaptiques en réponse aux expériences — est un autre pilier des neurosciences éducatives. Contrairement à l'idée longtemps répandue que l'intelligence serait fixée à la naissance, le cerveau reste plastique tout au long de la vie, même si cette plasticité diminue avec l'âge.

Les émotions jouent également un rôle crucial : le stress chronique détériore les capacités d'apprentissage et de mémorisation, tandis qu'un état émotionnel positif les favorise. Des environnements scolaires bienveillants, qui minimisent le stress et valorisent l'erreur comme étape normale de l'apprentissage, sont donc neuroscienti­fiquement recommandés.`;

const ART_OPERA_DEMOCRATISATION =
`L'OPÉRA À L'HEURE DE LA DÉMOCRATISATION CULTURELLE

Longtemps considéré comme l'art des élites, l'opéra cherche depuis plusieurs décennies à élargir son public en multipliant les initiatives de démocratisation. Les retransmissions en direct dans les cinémas — initiées par le Metropolitan Opera de New York en 2006 avec ses « Met Live in HD » — ont radicalement changé la donne en permettant à des millions de personnes dans des dizaines de pays d'assister à des productions de référence pour une fraction du prix d'une place en salle.

En France, les opéras nationaux proposent désormais des tarifs réduits pour les moins de 28 ans et les demandeurs d'emploi, des classes ouvertes aux scolaires et des répétitions publiques gratuites. Certaines maisons d'opéra organisent des représentations en plein air retransmises sur grand écran devant parfois plusieurs milliers de spectateurs.

Ces efforts portent des fruits : la fréquentation des opéras français a augmenté significativement ces dernières années, avec une rajeunissement notable du public. Des enquêtes montrent que les nouveaux spectateurs, souvent initiés via les retransmissions cinéma ou les concerts en plein air, finissent par franchir la porte des salles.

Certains directeurs artistiques poussent plus loin en commandant des opéras en langue française sur des sujets contemporains — immigration, environnement, réseaux sociaux — pour toucher des publics qui ne s'identifient pas aux récits mythologiques du répertoire classique. Cette tension entre héritage et innovation est au cœur des débats sur l'avenir de l'art lyrique.`;

const ART_IA_CREATIVITE =
`INTELLIGENCE ARTIFICIELLE GÉNÉRATIVE ET CRÉATIVITÉ HUMAINE : MENACE OU OPPORTUNITÉ ?

L'émergence des systèmes d'intelligence artificielle générative — capables de produire du texte, des images, de la musique et du code à partir de simples instructions textuelles — a déclenché un débat passionné sur l'avenir de la créativité humaine. Les positions sont tranchées : d'un côté, des créateurs qui voient dans l'IA une menace existentielle à leur métier ; de l'autre, des enthousiastes qui y voient un outil de démultiplication des capacités créatives.

La question des droits d'auteur est au cœur du conflit. Ces systèmes ont été entraînés sur des milliards d'œuvres humaines souvent sans autorisation ni rémunération des créateurs. Des procédures judiciaires ont été engagées aux États-Unis et en Europe par des artistes, illustrateurs et auteurs estimant que leur travail a servi à former des modèles qui les concurrencent désormais.

Au-delà de la question juridique se pose une question philosophique plus profonde : qu'est-ce que la créativité ? Si une machine peut produire une image esthétiquement belle, un texte grammaticalement correct et stylistiquement cohérent, cela invalide-t-il la valeur de la création humaine ? Certains philosophes argumentent que la valeur de l'art réside précisément dans le fait qu'il est l'expression d'une subjectivité humaine — avec ses limites, ses doutes et son ancrage dans une expérience vécue.

Pour les créateurs qui ont choisi d'intégrer l'IA dans leur processus créatif, elle représente avant tout un outil d'exploration et d'accélération : un moyen de tester rapidement des idées, de surmonter le syndrome de la page blanche ou de s'aventurer dans des formes artistiques inédites. La frontière entre outil et auteur reste à définir.`;

const ART_PERMACULTURE =
`LA PERMACULTURE ET L'AGRICULTURE EXTENSIVE : DEUX VISIONS DE L'ALIMENTATION DURABLE

La permaculture, concept développé dans les années 1970 par l'Australien Bill Mollison, propose une vision radicalement différente de l'agriculture conventionnelle. En observant et imitant les écosystèmes naturels, elle cherche à concevoir des systèmes alimentaires qui se maintiennent sans intrants extérieurs — ni engrais chimiques, ni pesticides, ni irrigation intensive. L'objectif est la résilience et l'autosuffisance à petite échelle.

Cette philosophie a séduit un nombre croissant de personnes, des jardiniers amateurs aux agriculteurs professionnels, en passant par les concepteurs de quartiers durables. Des formations certifiantes se multiplient à travers le monde, et des fermes-pilotes de permaculture font école en montrant qu'il est possible de produire une alimentation saine et diversifiée sur de petites surfaces.

Ses tenants s'opposent philosophiquement à l'agriculture extensive, qui cherche à maximiser la production sur de grandes surfaces par mécanisation intensive et utilisation d'intrants chimiques. Ce modèle, dominant dans l'agriculture mondiale, est critiqué pour son impact environnemental : érosion des sols, pollution des nappes phréatiques, perte de biodiversité et contribution au changement climatique.

Le débat n'est pourtant pas simple. Les partisans de l'agriculture extensive soulignent que seule une production à grande échelle peut nourrir les 8 milliards d'humains actuels. La permaculture, conçue pour la subsistance locale, peine à s'adapter aux défis de l'alimentation mondiale. La recherche d'un modèle agricole durable qui combine productivité et respect de l'environnement reste l'un des défis les plus urgents de notre siècle.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche opéra
  qs.push(q(1, 'Q1-7', null, {
    longText:
`OPÉRA DE BORDEAUX — Saison 2025-2026

CARMEN de Georges Bizet
Opéra en quatre actes | Livret de Meilhac et Halévy

REPRÉSENTATIONS :
• Vendredi 7 novembre — 20 h
• Dimanche 9 novembre — 15 h (matinée)
• Mardi 11 novembre — 20 h
• Samedi 15 novembre — 20 h

Direction musicale : Maestro Alberto Ferrara
Mise en scène : Isabelle Chen
Carmen : Valentina Morosini (mezzo-soprano)
Don José : Marco Bellini (ténor)

Tarifs : de 15 € à 120 € selon catégorie
Réservations : operabordeaux.fr | Tél. 05 56 00 78 90`,
    question: "D'après cette affiche, combien de représentations de Carmen sont prévues ?",
    optionA: "2 représentations.",
    optionB: "3 représentations.",
    optionC: "4 représentations.",
    optionD: "5 représentations.",
    correctAnswer: 'C',
  }));

  // Q2 — Règlement salle d'escalade
  qs.push(q(2, 'Q1-7', null, {
    longText:
`SALLE D'ESCALADE VERTICAL'UP — Tarifs et horaires

Horaires : lundi-vendredi 10 h – 22 h | samedi-dimanche 9 h – 20 h

Tarifs adulte :
• Entrée journée : 12 €
• Abonnement mensuel : 45 €
• Abonnement annuel : 420 €

Tarifs enfant (- 14 ans) :
• Entrée journée : 8 €
• Abonnement mensuel : 30 €

Location matériel : chaussons 3 € | baudrier 2 € | longe 1 €
Cours initiation (1 h 30) : 20 € par personne (groupes de 6 max)

La salle est fermée le 1er janvier, le 1er mai et le 25 décembre.`,
    question: "D'après ce document, combien coûte la location d'un baudrier ?",
    optionA: "1 €",
    optionB: "2 €",
    optionC: "3 €",
    optionD: "4 €",
    correctAnswer: 'B',
  }));

  // Q3 — Petite annonce visite guidée musée virtuel
  qs.push(q(3, 'Q1-7', null, {
    longText:
`VISITE GUIDÉE — MUSÉE VIRTUEL DE LA RÉSISTANCE

Explorez l'histoire de la Résistance française en réalité virtuelle !

Notre guide spécialisé vous accompagne dans une expérience immersive de 90 minutes dans les archives et lieux secrets de la Résistance.

Groupes de 5 à 12 personnes | Casques VR fournis
Tarif : 18 €/adulte | 10 €/étudiant | Gratuit -12 ans
Disponible en français, anglais et espagnol

Créneaux : tous les samedis à 10 h, 14 h et 16 h
Réservation obligatoire : museevr-resistance.fr
Adresse : 14 rue de la Libération (accessible PMR)`,
    question: "D'après cette annonce, la visite guidée est accessible aux personnes à mobilité réduite (PMR). Elle dure…",
    optionA: "60 minutes.",
    optionB: "75 minutes.",
    optionC: "90 minutes.",
    optionD: "120 minutes.",
    correctAnswer: 'C',
  }));

  // Q4 — Programme conférence neurosciences
  qs.push(q(4, 'Q1-7', null, {
    longText:
`SYMPOSIUM INTERNATIONAL DE NEUROSCIENCES COGNITIVES
Université Pierre-et-Marie-Curie — 18-20 mars

PROGRAMME — JEUDI 18 MARS
• 9 h – 9 h 30 : Ouverture officielle — Pr. Leconte, Doyen
• 9 h 30 – 11 h : Conférence plénière : « Plasticité synaptique et mémoire » — Pr. Suzuki (Tokyo)
• 11 h 30 – 13 h : Session A (en parallèle) : Neurosciences du sommeil
• 14 h – 16 h : Ateliers pratiques — imagerie cérébrale IRMf
• 16 h 30 – 18 h 30 : Session poster — jeunes chercheurs

Inscription : symposium-neuro2025.fr | Tarifs : académique 120 € | étudiant 40 €`,
    question: "D'après ce programme, quel est le thème de la conférence plénière du jeudi matin ?",
    optionA: "Les neurosciences du sommeil.",
    optionB: "La plasticité synaptique et la mémoire.",
    optionC: "L'imagerie cérébrale par IRMf.",
    optionD: "La créativité et les réseaux neuronaux.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi outil permaculture
  qs.push(q(5, 'Q1-7', null, {
    longText:
`GRELINETTE PERMACOLE 5 DENTS — MODE D'EMPLOI

La grelinette est un outil d'ameublissement du sol sans retournement, respectant la vie microbienne et la structure du sol.

Utilisation :
1. Plantez verticalement les 5 dents dans le sol en appuyant avec le pied
2. Basculez le manche vers vous pour soulever et aérer la terre sans la retourner
3. Répétez l'opération tous les 30 à 40 cm en avançant sur la planche de culture
4. Terminez par un léger binage de surface pour briser les mottes

Entretien : nettoyez les dents après chaque utilisation. Huilez le manche en bois une fois par saison.
⚠ Ne pas utiliser sur sol gelé ou excessivement humide.`,
    question: "Ce document est…",
    optionA: "un guide de jardinage biologique général.",
    optionB: "un mode d'emploi d'un outil de jardinage permacole.",
    optionC: "une publicité pour des outils de jardin.",
    optionD: "un manuel de formation en permaculture.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué association IA responsable
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — Association IA & Société

L'association IA & Société publie aujourd'hui son rapport annuel sur l'impact des intelligences artificielles génératives sur les professionnels de la création.

Principaux résultats :
• 68 % des illustrateurs professionnels ont constaté une baisse de leurs commandes depuis 2023
• 45 % des auteurs interrogés déclarent utiliser l'IA comme outil d'aide à l'écriture
• 82 % des répondants estiment que des régulations juridiques urgentes sont nécessaires

L'association appelle les pouvoirs publics à :
— Instaurer un droit à rémunération pour les créateurs dont les œuvres ont servi à entraîner les modèles d'IA
— Créer un label « IA-free » pour les œuvres créées sans assistance artificielle
— Financer des recherches indépendantes sur l'impact économique de l'IA générative`,
    question: "Ce communiqué présente principalement…",
    optionA: "un rapport sur les technologies d'IA en entreprise.",
    optionB: "une demande de financement pour la recherche en IA.",
    optionC: "un rapport sur l'impact de l'IA générative sur les créateurs.",
    optionD: "des recommandations pour utiliser l'IA dans l'éducation.",
    correctAnswer: 'C',
  }));

  // Q7 — Invitation inauguration jardin permacole
  qs.push(q(7, 'Q1-7', null, {
    longText:
`L'association RACINES VIVANTES vous invite à l'inauguration de

NOTRE JARDIN PERMACOLE COLLECTIF

Samedi 5 avril de 11 h à 18 h
Terrain communal — rue des Jardins Partagés

Au programme :
• Visite commentée du jardin (conception, plantes associées, compostage)
• Atelier bouturage et échanges de plants
• Déjeuner champêtre partagé (apportez un plat à partager !)
• Initiation à la permaculture pour les enfants (14 h – 16 h)

Entrée libre | Accessible à tous
Contact : racinesvivantes@mail.fr`,
    question: "D'après cette invitation, que doivent apporter les participants qui souhaitent déjeuner ?",
    optionA: "Leur pique-nique individuel.",
    optionB: "Un plat à partager avec les autres.",
    optionC: "Une contribution financière.",
    optionD: "Leur propre assiette et couverts.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ neuronale désigne la capacité du cerveau à modifier ses connexions en réponse aux apprentissages et aux expériences tout au long de la vie.",
    question: PHRASE_Q,
    optionA: "synapse",
    optionB: "plasticité",
    optionC: "mémoire",
    optionD: "cognition",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans un opéra, le ___ est le texte mis en musique, rédigé par le librettiste en collaboration avec le compositeur.",
    question: PHRASE_Q,
    optionA: "scénario",
    optionB: "programme",
    optionC: "livret",
    optionD: "partition",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ parental, garanti par le droit social européen, permet à chaque parent de suspendre son activité professionnelle pour s'occuper d'un enfant en bas âge.",
    question: PHRASE_Q,
    optionA: "repos",
    optionB: "congé",
    optionC: "arrêt",
    optionD: "temps",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La permaculture valorise la ___ des espèces végétales et animales dans les jardins pour créer des écosystèmes stables et résilients face aux perturbations extérieures.",
    question: PHRASE_Q,
    optionA: "monoculture",
    optionB: "biodiversité",
    optionC: "production",
    optionD: "sélection",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Un système d'IA générative produit du contenu à partir d'un ___ textuel décrivant ce que l'utilisateur souhaite obtenir comme résultat.",
    question: PHRASE_Q,
    optionA: "algorithme",
    optionB: "modèle",
    optionC: "prompt",
    optionD: "fichier",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En escalade, une ___ est un itinéraire tracé sur un mur ou une falaise, identifié par sa couleur et sa cotation de difficulté.",
    question: PHRASE_Q,
    optionA: "montée",
    optionB: "traverse",
    optionC: "voie",
    optionD: "prise",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Les systèmes d'IA générative soulèvent des questions complexes de droits d'auteur car ils ont été entraînés sur des milliards d'œuvres humaines. Chaque [14] de langage ou d'image a nécessité l'ingestion de quantités considérables de [15] d'entraînement dont les auteurs n'ont pas consenti à cette utilisation.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'IA générative et droits d'auteur",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "logiciel",
    optionB: "modèle",
    optionC: "algorithme",
    optionD: "fichier",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'IA générative et droits d'auteur",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "technologies",
    optionB: "matériels",
    optionC: "données",
    optionD: "ressources",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La permaculture vise l'[16] alimentaire en concevant des jardins et des fermes qui produisent suffisamment pour les besoins locaux sans dépendre des importations. Cette approche cherche à créer des [17] alimentaires stables et diversifiés en s'inspirant des systèmes naturels.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Permaculture et souveraineté alimentaire",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "indépendance",
    optionB: "autosuffisance",
    optionC: "production",
    optionD: "alimentation",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Permaculture et souveraineté alimentaire",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "marchés",
    optionB: "réseaux",
    optionC: "écosystèmes",
    optionD: "projets",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit un opéra comique italien né au XVIIIe siècle avec personnages populaires et intrigues légères ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit l'escalade sur blocs de faible hauteur sans corde ni baudrier avec des matelas de réception ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit un accord entre partenaires sociaux au niveau européen ayant force juridique contraignante ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit un musée enrichissant la visite physique avec des contenus numériques superposés via smartphone ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  // Q22 : Line chart
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le groupe B a montré une activité neuronale préfrontale significativement plus élevée lors des tâches créatives, atteignant un pic à 85% d'activation en mars. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de la salle d'escalade VERTICAL'UP",
    longText: DOC_REGLEMENT_ESCALADE,
    question: "Selon ce règlement, quelle formation est obligatoire lors d'une première visite ?",
    optionA: "Un cours d'escalade de 2 heures avec moniteur.",
    optionB: "Une formation de sécurité de 30 minutes dispensée par un moniteur habilité.",
    optionC: "Un test de niveau sur le mur de bloc.",
    optionD: "Un stage d'initiation de 3 heures.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de la salle d'escalade VERTICAL'UP",
    longText: DOC_REGLEMENT_ESCALADE,
    question: "Pour accéder à la zone de grande voie (murs > 15 m), il faut…",
    optionA: "avoir au moins 18 ans.",
    optionB: "être accompagné d'un moniteur.",
    optionC: "être titulaire de la qualification TOP CORDE délivrée par la salle.",
    optionD: "avoir un abonnement annuel.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chercheur(se) en neurosciences cognitives",
    longText: DOC_OFFRE_NEURO,
    question: "Sur quel projet porte ce recrutement ?",
    optionA: "Sur les neurosciences du sommeil.",
    optionB: "Sur les bases neurales de la créativité (projet NEUROCREATE).",
    optionC: "Sur les mécanismes de la mémoire à long terme.",
    optionD: "Sur les effets du stress sur l'apprentissage.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chercheur(se) en neurosciences cognitives",
    longText: DOC_OFFRE_NEURO,
    question: "Quelle durée de contrat est proposée pour ce poste ?",
    optionA: "CDD 12 mois.",
    optionB: "CDD 18 mois.",
    optionC: "CDD 24 mois renouvelable.",
    optionD: "CDI dès l'embauche.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de saison artistique — Compagnie Lyrique de l'Ouest",
    longText: DOC_CONTRAT_OPERA,
    question: "Ce contrat engage l'artiste lyrique pour participer à…",
    optionA: "une seule production d'opéra.",
    optionB: "deux productions de la saison.",
    optionC: "trois productions : Traviata, Carmen et Les Noces de Figaro.",
    optionD: "toutes les productions de la saison 2025-2026.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de saison artistique — Compagnie Lyrique de l'Ouest",
    longText: DOC_CONTRAT_OPERA,
    question: "Combien de semaines avant chaque première débutent les répétitions ?",
    optionA: "2 semaines.",
    optionB: "4 semaines.",
    optionC: "6 semaines.",
    optionD: "8 semaines.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Accord-cadre européen sur le travail à temps partiel",
    longText: DOC_ACCORD_SOCIAL_EU,
    question: "Selon ce document, le principe pro rata temporis signifie que…",
    optionA: "les travailleurs à temps partiel ne peuvent pas bénéficier des primes.",
    optionB: "les avantages sont calculés proportionnellement au temps de travail.",
    optionC: "les travailleurs à temps partiel travaillent un minimum de 20 heures.",
    optionD: "les contrats à temps partiel doivent être validés par un accord collectif.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Accord-cadre européen sur le travail à temps partiel",
    longText: DOC_ACCORD_SOCIAL_EU,
    question: "Selon ce document, les États membres peuvent-ils adopter des dispositions plus favorables ?",
    optionA: "Non, ils doivent appliquer exactement les dispositions de l'accord.",
    optionB: "Oui, ils peuvent maintenir ou introduire des dispositions plus favorables.",
    optionC: "Oui, mais uniquement avec l'accord de la Commission européenne.",
    optionD: "Non, toute dérogation est interdite par le Traité européen.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide de certification en permaculture",
    longText: DOC_GUIDE_PERMA,
    question: "Combien d'heures minimum doit durer le cours de conception en permaculture (CCP) requis pour la certification ?",
    optionA: "36 heures.",
    optionB: "48 heures.",
    optionC: "60 heures.",
    optionD: "72 heures.",
    correctAnswer: 'D',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide de certification en permaculture",
    longText: DOC_GUIDE_PERMA,
    question: "Quelle est la durée de validité de la certification Praticien en Permaculture ?",
    optionA: "2 ans.",
    optionB: "3 ans.",
    optionC: "5 ans.",
    optionD: "10 ans.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Neurosciences et apprentissage : ce que le cerveau nous apprend sur l'école",
    longText: ART_NEURO_APPRENTISSAGE,
    question: "Qu'est-ce que l'« effet de test » décrit dans cet article ?",
    optionA: "L'anxiété provoquée par les examens scolaires.",
    optionB: "Le fait que s'efforcer de récupérer une information renforce la mémorisation.",
    optionC: "L'amélioration des résultats scolaires par la pratique sportive.",
    optionD: "L'impact positif des évaluations fréquentes sur la motivation.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Neurosciences et apprentissage : ce que le cerveau nous apprend sur l'école",
    longText: ART_NEURO_APPRENTISSAGE,
    question: "Selon l'article, quel facteur émotionnel nuit aux capacités d'apprentissage ?",
    optionA: "L'enthousiasme excessif.",
    optionB: "L'état d'ennui chronique.",
    optionC: "Le stress chronique.",
    optionD: "La fatigue passagère.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'opéra à l'heure de la démocratisation culturelle",
    longText: ART_OPERA_DEMOCRATISATION,
    question: "Quelle initiative du Metropolitan Opera est citée comme ayant révolutionné l'accès à l'opéra ?",
    optionA: "Les représentations gratuites en plein air.",
    optionB: "Les retransmissions en direct dans les cinémas (Met Live in HD) depuis 2006.",
    optionC: "La diffusion sur internet en streaming.",
    optionD: "Les tournées dans les villes secondaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'opéra à l'heure de la démocratisation culturelle",
    longText: ART_OPERA_DEMOCRATISATION,
    question: "Selon l'article, quel type d'opéras commande-t-on pour toucher de nouveaux publics ?",
    optionA: "Des reprises de grands classiques du répertoire.",
    optionB: "Des opéras en langue étrangère avec surtitrage.",
    optionC: "Des opéras en français sur des sujets contemporains.",
    optionD: "Des opéras de courte durée pour les jeunes enfants.",
    correctAnswer: 'C',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Intelligence artificielle générative et créativité humaine",
    longText: ART_IA_CREATIVITE,
    question: "Selon l'article, pourquoi des procédures judiciaires ont-elles été engagées contre les systèmes d'IA générative ?",
    optionA: "Pour violation de la réglementation sur la protection des données.",
    optionB: "Parce que les œuvres humaines ont servi sans autorisation à entraîner les modèles.",
    optionC: "En raison de plagiats manifestes de publications scientifiques.",
    optionD: "Pour concurrence déloyale envers les éditeurs traditionnels.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Intelligence artificielle générative et créativité humaine",
    longText: ART_IA_CREATIVITE,
    question: "Comment les créateurs qui intègrent l'IA dans leur processus créatif la décrivent-ils principalement ?",
    optionA: "Comme un concurrent direct qui menace leur activité.",
    optionB: "Comme un outil d'exploration et d'accélération créative.",
    optionC: "Comme une source d'inspiration pour de nouvelles techniques.",
    optionD: "Comme un système de validation de leurs créations.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La permaculture et l'agriculture extensive : deux visions de l'alimentation durable",
    longText: ART_PERMACULTURE,
    question: "Qui a développé le concept de permaculture dans les années 1970 selon cet article ?",
    optionA: "Un Français nommé Pierre Rabhi.",
    optionB: "L'Australien Bill Mollison.",
    optionC: "Le Japonais Masanobu Fukuoka.",
    optionD: "L'Américain Wes Jackson.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La permaculture et l'agriculture extensive : deux visions de l'alimentation durable",
    longText: ART_PERMACULTURE,
    question: "Quel argument les partisans de l'agriculture extensive avancent-ils selon l'article ?",
    optionA: "Elle respecte mieux l'environnement que la permaculture.",
    optionB: "Elle seule peut nourrir les 8 milliards d'humains actuels.",
    optionC: "Elle produit des aliments de meilleure qualité nutritionnelle.",
    optionD: "Elle crée plus d'emplois ruraux que la permaculture.",
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
    console.log(`\n✅ ${created} questions créées pour CE 33.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
