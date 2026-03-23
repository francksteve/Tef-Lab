'use strict';
/**
 * seed-ce-serie16.js
 * Peuple la série CE 16 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie16.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyogjm000c0wxlxu4f57ey';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts fréquentation bibliothèque par semestre ── */
function generateQ22SVG() {
  // Graphique correct = D (2e semestre = 4200 visites)
  const graphs = [
    { label: 'Graphique 1', data: [1800, 2100, 1600, 1900], color: '#E30613' },
    { label: 'Graphique 2', data: [2500, 2200, 2800, 3100], color: '#E30613' },
    { label: 'Graphique 3', data: [3200, 2800, 3500, 3000], color: '#E30613' },
    { label: 'Graphique 4', data: [2800, 4200, 3100, 3600], color: '#003087' }, // CORRECT: S2=4200
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['S1', 'S2', 'S3', 'S4'];
  const maxVal = 5000;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 1000, 2000, 3000, 4000, 5000].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v/1000}k</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Visites/semaine</text>`;
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
  { title: 'Période 1', content: "Le Moyen Âge s'étend approximativement du Ve au XVe siècle. Cette période est marquée par la féodalité, l'essor des cathédrales gothiques, les Croisades et la domination de l'Église catholique sur la vie politique et culturelle de l'Europe occidentale." },
  { title: 'Période 2', content: "La Renaissance désigne un mouvement de renouveau culturel, artistique et intellectuel qui a pris naissance en Italie aux XVe et XVIe siècles avant de se répandre en Europe. Elle se caractérise par le retour aux idéaux de l'Antiquité gréco-romaine, l'humanisme et l'essor des arts et des sciences." },
  { title: 'Période 3', content: "Les Lumières (XVIIIe siècle) sont un mouvement philosophique et intellectuel fondé sur la raison, le progrès et la liberté individuelle. Ce courant a préparé les révolutions américaine et française et a profondément influencé les démocraties modernes." },
  { title: 'Période 4', content: "La révolution industrielle (XIXe siècle) marque le passage d'une économie agricole et artisanale à une économie industrielle et capitaliste, portée par la machine à vapeur, le charbon et le développement du réseau ferroviaire en Europe et en Amérique du Nord." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Hébergement 1', content: "L'hôtel est un établissement commercial proposant des chambres à la nuit avec services associés (réception, ménage, parfois restauration). Les catégories vont de 1 à 5 étoiles selon les équipements et services. Le petit-déjeuner est généralement en option." },
  { title: 'Hébergement 2', content: "La chambre d'hôtes est un logement proposé chez l'habitant, généralement dans une maison particulière ou une propriété rurale. Le propriétaire partage son domicile et le petit-déjeuner est presque toujours inclus dans le prix. L'accueil est personnalisé." },
  { title: 'Hébergement 3', content: "L'auberge de jeunesse est un hébergement collectif et économique destiné principalement aux voyageurs jeunes et aux backpackers. Les dormoirs partagés sont la norme, bien que des chambres privées existent. Les espaces communs (cuisine, salon) favorisent les rencontres." },
  { title: 'Hébergement 4', content: "Le camping propose des emplacements pour tentes, caravanes ou mobil-homes dans un cadre naturel. Les services varient selon la catégorie (toilettes communes, sanitaires, piscine, restaurant). Il est particulièrement prisé en famille pour son aspect économique et en plein air." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Cuisine 1', content: "La cuisine italienne est reconnue pour l'utilisation de pâtes fraîches ou sèches, de sauces à base de tomate ou de crème, de fromages (parmesan, mozzarella) et d'huile d'olive. Chaque région possède ses spécialités : risotto milanais, pizza napolitaine, carbonara romaine." },
  { title: 'Cuisine 2', content: "La cuisine indienne se distingue par l'utilisation abondante d'épices (curcuma, cumin, cardamome, curry) et d'herbes aromatiques. Elle propose de nombreux plats végétariens issus de traditions religieuses hindoues. Le pain naan et les chutneys accompagnent généralement les plats." },
  { title: 'Cuisine 3', content: "La cuisine marocaine est riche en saveurs mêlant épices douces (cannelle, safran, gingembre) et ingrédients locaux (pruneaux, amandes, olives). Le tajine, le couscous et les pastillas sont ses plats emblématiques. Les repas sont traditionnellement partagés en famille." },
  { title: 'Cuisine 4', content: "La cuisine japonaise valorise la fraîcheur absolue des ingrédients, l'équilibre des saveurs et la présentation esthétique. Elle inclut de nombreux plats à base de poisson cru (sashimi, sushi), de riz et de bouillons (ramen, miso). La cuisson est souvent minimale pour préserver les saveurs naturelles." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Logiciel 1', content: "Un logiciel propriétaire est développé par une entreprise qui en détient les droits exclusifs. Le code source n'est pas accessible aux utilisateurs. L'utilisation, la copie et la modification sont soumises à une licence payante. Microsoft Office et Adobe Photoshop en sont des exemples." },
  { title: 'Logiciel 2', content: "Un logiciel libre (ou open source) est un programme dont le code source est publié et peut être étudié, modifié et redistribué librement par quiconque. Il peut être gratuit ou payant. Linux, Firefox et LibreOffice sont des exemples de logiciels libres reconnus." },
  { title: 'Logiciel 3', content: "Un logiciel SaaS (Software as a Service) est une application hébergée sur des serveurs distants et accessible via internet sans installation locale. L'utilisateur s'y abonne mensuellemment. Google Workspace et Salesforce fonctionnent sur ce modèle." },
  { title: 'Logiciel 4', content: "Un logiciel freeware est un programme distribué gratuitement, mais dont le code source reste propriété de l'éditeur. L'utilisateur peut l'utiliser sans payer de licence, mais ne peut pas le modifier. Il se distingue du logiciel libre par l'inaccessibilité du code source." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_INTERNAT =
`RÈGLEMENT INTÉRIEUR — INTERNAT DU LYCÉE VICTOR-HUGO

L'internat accueille les élèves inscrits dans l'établissement de la 2nde à la Terminale.

HORAIRES : Réveil 6 h 30 | Petit-déjeuner 7 h 00-7 h 45 | Études du soir 18 h 00-20 h 00 | Extinction des lumières 22 h 00.

COMPORTEMENT : Le téléphone portable doit être déposé à l'accueil à 22 h et récupéré le matin. Toute sortie non autorisée après 22 h est sanctionnée. Les élèves sont responsables de la propreté de leur chambre.

SORTIES : Les sorties du week-end sont autorisées de vendredi 17 h à dimanche 20 h sur présentation d'une autorisation parentale signée. Les élèves mineurs ne peuvent sortir qu'avec un adulte responsable désigné.`;

const DOC_OFFRE_EMPLOI_JURID =
`OFFRE D'EMPLOI — CONSEILLER(ÈRE) JURIDIQUE (H/F)

Cabinet de conseil juridique d'entreprise recherche un(e) conseiller(ère) pour son département droit des sociétés.

MISSIONS : Accompagnement des clients dans leurs opérations juridiques (création de sociétés, fusion-acquisition, baux commerciaux), rédaction d'actes et de contrats, veille législative et réglementaire.

PROFIL : Master 2 en droit des affaires ou droit des sociétés, 2-3 ans d'expérience en cabinet ou en entreprise. Excellentes capacités rédactionnelles. Discrétion professionnelle absolue.

CONDITIONS : CDI à temps plein. Rémunération : 3 200-3 800 €/mois selon expérience. Tickets restaurant, mutuelle, 50 % Pass Navigo. Télétravail 1 jour/semaine.`;

const DOC_CONTRAT_MAINTENANCE =
`CONTRAT DE MAINTENANCE INFORMATIQUE — TechSupport Pro

CLIENT : Entreprise ABC Solutions, 28 avenue du Commerce, 75015 Paris
PRESTATAIRE : TechSupport Pro SARL

PRESTATIONS INCLUSES :
• Maintenance préventive : 1 visite trimestrielle sur site
• Assistance téléphonique : lundi-vendredi 8h-18h (délai de réponse : 4h)
• Intervention sur site urgente : délai maximal 24h ouvrées
• Mises à jour logicielles et antivirus incluses
• Sauvegarde des données : quotidienne automatique sur serveur sécurisé

DURÉE : Contrat annuel renouvelable tacitement — résiliation avec préavis de 3 mois.
TARIF : 450 €/mois HT.`;

const DOC_NOTE_RECRUTEMENT =
`NOTE DE PROCÉDURE — Direction des Ressources Humaines
Objet : Nouvelle procédure de recrutement interne

À compter du 1er septembre, tout recrutement doit suivre les étapes suivantes :

1. VALIDATION : La demande de recrutement doit être validée par le directeur de département et la DRH avant toute publication d'offre.
2. PUBLICATION : L'offre est diffusée en interne pendant 5 jours ouvrables avant toute diffusion externe.
3. PRÉSÉLECTION : Les CV sont examinés par le responsable RH et le manager concerné. Maximum 5 candidats retenus pour entretien.
4. ENTRETIEN : Deux entretiens obligatoires (manager + DRH). Décision dans les 10 jours après le dernier entretien.
5. INTÉGRATION : Un parcours d'intégration de 2 semaines est obligatoire pour tout nouveau collaborateur.`;

const DOC_GUIDE_LOCATION =
`GUIDE PRATIQUE DE LA LOCATION IMMOBILIÈRE — Agence Immo Conseil

AVANT DE SIGNER :
Vérifiez que le bail comporte : identité du propriétaire et du locataire, description précise du logement, montant du loyer et des charges, durée du bail (généralement 3 ans pour un logement vide, 1 an meublé).

L'ÉTAT DES LIEUX : Document obligatoire à l'entrée et à la sortie. Tout désaccord doit être signalé par écrit dans les 3 jours suivant la remise des clés.

LA CAUTION : Limitée à 1 mois de loyer hors charges pour un logement vide, 2 mois pour un logement meublé. Elle doit être restituée dans les 2 mois suivant la restitution des clés, déductions faites des éventuels dégâts.

RÉSILIATION : Le locataire peut partir à tout moment avec un préavis de 3 mois (réduit à 1 mois dans certaines zones tendues).`;

/* ── Articles de presse Q33-40 ── */
const ART_REFORME_BAC =
`LA RÉFORME DU BACCALAURÉAT : BILAN D'UNE TRANSFORMATION MAJEURE

La réforme du baccalauréat français, entrée en vigueur à partir de 2021, a profondément modifié un examen qui n'avait pas connu de changement structurel majeur depuis des décennies. La suppression des filières classiques (L, ES, S) au profit d'un système de spécialités à la carte, l'introduction du contrôle continu pour 40 % de la note finale et la création du Grand Oral constituent les piliers de cette transformation.

Les partisans de la réforme soulignent que le nouveau système permet aux élèves de construire un parcours individualisé adapté à leurs aspirations, plutôt que d'être enfermés dans des filières figées. Le Grand Oral, en particulier, est présenté comme une réponse aux besoins du marché du travail, qui valorise de plus en plus les compétences en communication et en argumentation.

Les critiques sont nombreuses. Le contrôle continu a engendré des inégalités entre établissements : les lycées qui notent généreusement avantagent leurs élèves par rapport à ceux qui appliquent des critères plus stricts. La multiplication des spécialités a compliqué l'organisation des emplois du temps et alourdi la charge de travail des élèves en terminale, confrontés à des programmes exigeants dans leurs deux spécialités plus le tronc commun.

Plusieurs années après son introduction, le débat reste vif. La réforme a certes modernisé le baccalauréat, mais ses effets sur la préparation aux études supérieures et sur les inégalités scolaires demeurent en question.`;

const ART_TOURISME_MEMORIEL =
`LE TOURISME MÉMORIEL : QUAND L'HISTOIRE DEVIENT DESTINATION

Le tourisme mémoriel, aussi appelé dark tourism, désigne les voyages vers des lieux associés à des événements tragiques de l'histoire : champs de bataille, camps de concentration, sites de génocides, villes détruites par des catastrophes. Ce phénomène connaît une croissance significative depuis une vingtaine d'années, alimentée par la quête de sens des voyageurs modernes et par le devoir de mémoire collectif.

Auschwitz, en Pologne, reçoit chaque année plus d'un million de visiteurs du monde entier. Le mémorial du génocide rwandais attire des pèlerinages de survivants et de descendants. Les plages du débarquement en Normandie sont parmi les sites touristiques les plus visités de France. Ces lieux sont devenus des espaces de transmission, d'émotion et de réflexion sur les pages sombres de l'humanité.

Mais ce tourisme soulève des questions éthiques importantes. Comment respecter la dignité des victimes et de leurs familles tout en ouvrant ces espaces à des millions de touristes ? Où se situe la frontière entre commémoration respectueuse et voyeurisme morbide ? La marchandisation de la mémoire, avec ses boutiques de souvenirs et ses selfies devant les fosses communes, heurte de nombreuses sensibilités.

Les gestionnaires de ces sites naviguent dans un équilibre délicat entre accessibilité éducative et préservation du caractère sacré des lieux. Des chartes éthiques, des formations des guides et des règles de comportement strictes tentent d'encadrer ce tourisme singulier sans l'interdire, car sa fonction mémorielle et éducative reste irremplaçable.`;

const ART_LOGEMENT_ETUDIANT =
`LA CRISE DU LOGEMENT ÉTUDIANT : UN PROBLÈME STRUCTUREL SANS SOLUTION RAPIDE

Chaque rentrée universitaire en France est marquée par la même scène : des milliers d'étudiants à la recherche désespérée d'un logement dans les grandes villes universitaires. La demande de logements étudiants dépasse très largement l'offre disponible, notamment dans les métropoles comme Paris, Lyon, Bordeaux et Montpellier. Les conséquences sont graves : abandon des études, surmenage, et précarité alimentaire liée aux loyers excessifs.

Les résidences universitaires gérées par le CROUS ne couvrent qu'environ 7 % des étudiants français, un taux parmi les plus bas d'Europe. Le parc privé, dominé par des studios et des chambres meublées, pratique des loyers qui absorbent parfois plus de 50 % du budget mensuel d'un étudiant. Le développement des plateformes de location touristique a accentué cette tension en soustrayant des milliers de petits logements au marché résidentiel.

Les pouvoirs publics ont annoncé des plans ambitieux de construction de nouvelles résidences universitaires, mais les délais de construction et les contraintes budgétaires freinent leur réalisation. Certaines villes ont expérimenté des solutions alternatives : logements intergénérationnels (hébergement d'étudiants chez des personnes âgées isolées), réquisition de logements vacants, aide à la location dans le parc privé.

La crise du logement étudiant est révélatrice d'un problème plus large : la déconnexion croissante entre les revenus des ménages modestes et le coût réel du logement dans les zones à forte demande. Sans investissement massif et politique foncière cohérente, cette fracture ne peut que s'approfondir.`;

const ART_IA_DROIT =
`L'INTELLIGENCE ARTIFICIELLE EN DROIT : RÉVOLUTION PROMETTEUSE ET RISQUES ÉTHIQUES

L'intelligence artificielle s'introduit progressivement dans le monde juridique, transformant les pratiques des avocats, des magistrats et des entreprises. Les applications sont variées et potentiellement révolutionnaires : analyse prédictive des décisions de justice pour évaluer les chances de succès d'un litige, automatisation de la rédaction de contrats standardisés, détection des clauses abusives dans les documents contractuels, traduction juridique assistée par IA.

Ces outils promettent un gain de temps considérable pour les professionnels du droit, permettant à des avocats de traiter davantage de dossiers et à des justiciables de bénéficier d'une justice plus rapide et moins coûteuse. Des startups juridiques proposent déjà des consultations juridiques automatisées accessibles à tous pour quelques euros, démocratisant l'accès au droit pour des populations qui ne pouvaient pas se permettre les honoraires d'un avocat.

Les risques sont cependant réels et préoccupants. Les algorithmes de prédiction judiciaire entraînés sur des données historiques peuvent reproduire et amplifier les biais systémiques existants dans le système judiciaire. Une justice prédictive risque de figer la jurisprudence et de décourager l'innovation juridique. Par ailleurs, la responsabilité en cas d'erreur algorithmique dans une décision juridique reste un vide juridique que peu de législations ont commencé à combler.

La profession juridique fait face à un choix stratégique : s'approprier ces outils pour les maîtriser ou risquer d'être partiellement supplantée par des acteurs technologiques qui n'ont pas les mêmes obligations déontologiques.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Règlement école primaire
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ÉCOLE PRIMAIRE JULES-FERRY — RÈGLEMENT INTÉRIEUR (extrait)

TENUES : Les tenues vestimentaires doivent être propres et adaptées à l'activité scolaire. Les couvre-chefs sont interdits dans les locaux. Les bijoux et accessoires de valeur sont déconseillés.

COMPORTEMENT : Le respect de tous les membres de la communauté scolaire est obligatoire. Toute forme d'agressivité verbale ou physique est sanctionnée. Les téléphones portables sont interdits dans l'enceinte de l'école.

ABSENCES : Toute absence doit être signalée à la direction avant 8 h 30. Un justificatif médical est requis pour toute absence de plus de 3 jours.`,
    question: "Selon ce règlement, les téléphones portables sont…",
    optionA: "autorisés avec l'accord des parents.",
    optionB: "déposés à l'accueil le matin.",
    optionC: "interdits dans l'enceinte de l'école.",
    optionD: "tolérés uniquement à la récréation.",
    correctAnswer: 'C',
  }));

  // Q2 — Carte menu restaurant gastronomique
  qs.push(q(2, 'Q1-7', null, {
    longText:
`BRASSERIE LE GRAND MIROIR — Carte du soir

ENTRÉES :
Carpaccio de Saint-Jacques aux agrumes — 18 €
Foie gras maison, toast brioché et chutney — 22 €
Velouté de potimarron, crème fraîche et noisettes — 12 €

PLATS :
Filet de sole beurre blanc, riz pilaf — 28 €
Magret de canard, sauce au poivre vert et gratin — 32 €
Risotto aux cèpes et parmesan (V) — 24 €

DESSERTS :
Crème brûlée à la vanille — 9 €
Fondant au chocolat noir, glace caramel — 11 €
Sélection de fromages affinés — 14 €

(V) = végétarien — Service non compris`,
    question: "D'après la carte, quel plat convient à un client végétarien ?",
    optionA: "Le filet de sole beurre blanc.",
    optionB: "Le magret de canard.",
    optionC: "Le risotto aux cèpes et parmesan.",
    optionD: "Le foie gras maison.",
    correctAnswer: 'C',
  }));

  // Q3 — Petite annonce location appartement meublé
  qs.push(q(3, 'Q1-7', null, {
    longText:
`À LOUER — Appartement meublé — Bordeaux Centre

T2 entièrement meublé et équipé — 48 m² — 2e étage avec ascenseur
Séjour lumineux, chambre séparée, cuisine ouverte équipée, salle de bains refaite
Double vitrage, interphone, cave incluse
Loyer : 920 €/mois charges comprises (eau, chauffage collectif)
Caution : 1 mois de loyer hors charges
Disponible : 1er octobre — Bail 1 an renouvelable
Agence Bordeaux Premium — Frais d'agence : 1 mois de loyer TTC`,
    question: "Cette annonce est pour…",
    optionA: "la vente d'un appartement en centre-ville.",
    optionB: "la location d'un appartement meublé.",
    optionC: "la colocation dans un grand appartement.",
    optionD: "la sous-location d'un logement social.",
    correctAnswer: 'B',
  }));

  // Q4 — Affiche visite château historique
  qs.push(q(4, 'Q1-7', null, {
    longText:
`CHÂTEAU DE VAUX-LE-VICOMTE — INFORMATIONS VISITEURS

Construit au XVIIe siècle pour Nicolas Fouquet, le château de Vaux-le-Vicomte est considéré comme le précurseur de Versailles.

OUVERTURE : Du 1er avril au 31 octobre, tous les jours de 10 h à 18 h.
TARIFS : Adulte 22 € | Enfant (6-16 ans) 14 € | Gratuit – 6 ans
Pack famille (2 adultes + 2 enfants) : 58 €

VISITE GUIDÉE : Tous les samedis à 14 h 30 (durée 1 h 30) — en supplément : +5 €
ILLUMINATIONS AUX CHANDELLES : Les samedis soir de mai à octobre, 20 h-24 h.`,
    question: "D'après ce document, les enfants de moins de 6 ans…",
    optionA: "paient le tarif enfant de 14 €.",
    optionB: "entrent gratuitement.",
    optionC: "bénéficient du pack famille.",
    optionD: "ne sont pas admis dans le château.",
    correctAnswer: 'B',
  }));

  // Q5 — Programme voyage scolaire
  qs.push(q(5, 'Q1-7', null, {
    longText:
`VOYAGE SCOLAIRE — ROME — Classe de 3e B — M. LECLERC

PROGRAMME (4 jours — 3 nuits)
Jeudi 20 mars : Départ Gare de Lyon 7 h 00 — Arrivée Rome 16 h 30. Visite du Colisée et du Forum.
Vendredi 21 : Musées du Vatican (Chapelle Sixtine), Place Saint-Pierre. Cité du Vatican.
Samedi 22 : Fontaine de Trevi, Panthéon, Piazza Navona. Temps libre l'après-midi.
Dimanche 23 : Musée de la Villa Borghèse. Départ 15 h 00 — Arrivée Paris 23 h 30.

PARTICIPATION : 480 € tout compris (transport, hébergement, repas, entrées)
Réunion d'information : lundi 10 mars à 18 h — Salle polyvalente`,
    question: "Ce document est…",
    optionA: "une brochure touristique sur la ville de Rome.",
    optionB: "le programme d'un voyage scolaire avec les détails pratiques.",
    optionC: "un rapport de voyage rédigé après la visite.",
    optionD: "une offre commerciale d'une agence de voyage.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi tablette numérique
  qs.push(q(6, 'Q1-7', null, {
    longText:
`TABLETTE NUMÉRITECH PRO 10 — DÉMARRAGE RAPIDE

1. Chargez la tablette pendant 2 heures avant la première utilisation.
2. Appuyez sur le bouton d'alimentation latéral pendant 3 secondes pour allumer.
3. Suivez l'assistant de configuration : langue, Wi-Fi, compte utilisateur.
4. Activez la mise à jour automatique dans Paramètres > Système > Mises à jour.

GESTES DE BASE :
• Appuyer une fois : ouvrir une application
• Glisser de bas en haut : accueil
• Maintenir 2 secondes : options contextuelles

⚠ Ne pas exposer à l'humidité. Utiliser uniquement le chargeur fourni.`,
    question: "Ce document est…",
    optionA: "un contrat de garantie pour la tablette.",
    optionB: "une comparaison technique de tablettes numériques.",
    optionC: "un guide de démarrage rapide d'une tablette.",
    optionD: "une publicité pour un magasin d'électronique.",
    correctAnswer: 'C',
  }));

  // Q7 — Invitation cérémonie diplômation
  qs.push(q(7, 'Q1-7', null, {
    longText:
`UNIVERSITÉ PARIS-EST — CÉRÉMONIE DE REMISE DES DIPLÔMES

Le Président de l'Université a l'honneur de vous inviter à la

CÉRÉMONIE DE REMISE DES DIPLÔMES
Promotion 2024-2025

Le vendredi 27 juin à 18 h 00
Grand Amphithéâtre — Campus Principal

En présence des familles et des proches des diplômés

RSVP obligatoire avant le 15 juin sur : ceremonies.univ-parisest.fr
Nombre de places limité : 2 invités maximum par diplômé
Tenue correcte exigée — Accueil dès 17 h 30`,
    question: "Selon ce document, combien d'invités chaque diplômé peut-il amener ?",
    optionA: "Un invité maximum.",
    optionB: "Deux invités maximum.",
    optionC: "Trois invités maximum.",
    optionD: "Autant qu'il le souhaite.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les méthodes pédagogiques modernes privilégient l'___ actif de l'élève dans la construction de ses connaissances plutôt que la mémorisation passive.",
    question: PHRASE_Q,
    optionA: "apprentissage",
    optionB: "évaluation",
    optionC: "enseignement",
    optionD: "encadrement",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les équipes d'___ ont mis au jour des vestiges d'une cité romaine lors de travaux de construction dans le centre historique de la ville.",
    question: PHRASE_Q,
    optionA: "archéologues",
    optionB: "démolition",
    optionC: "archéologie",
    optionD: "restauration",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour préparer votre voyage, vous trouverez dans ce guide un ___ détaillé de la région avec les sites incontournables et les meilleurs restaurants.",
    question: PHRASE_Q,
    optionA: "billet",
    optionB: "programme",
    optionC: "itinéraire",
    optionD: "résumé",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le maître d'hôtel a confirmé notre ___ pour une table de quatre personnes en terrasse pour le dîner du samedi soir.",
    question: PHRASE_Q,
    optionA: "commande",
    optionB: "réservation",
    optionC: "invitation",
    optionD: "facture",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant de signer un contrat de location, il est conseillé de vérifier toutes les clauses du ___ pour connaître vos droits et obligations en tant que locataire.",
    question: PHRASE_Q,
    optionA: "devis",
    optionB: "reçu",
    optionC: "bail",
    optionD: "cadastre",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ a été déposée au tribunal par la victime qui demande réparation pour les préjudices subis lors de l'accident de la circulation.",
    question: PHRASE_Q,
    optionA: "plainte",
    optionB: "requête",
    optionC: "déclaration",
    optionD: "ordonnance",
    correctAnswer: 'A',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La révolution ___ dans l'éducation transforme profondément les pratiques pédagogiques. Les élèves utilisent désormais des outils [14] pour accéder aux cours, collaborer à distance et développer des [15] adaptées aux besoins du marché du travail du XXIe siècle.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La révolution numérique dans l'éducation",
    longText: "La révolution numérique dans l'éducation transforme profondément les pratiques pédagogiques. Les élèves utilisent désormais des outils [14] pour accéder aux cours, collaborer à distance et développer des [15] adaptées aux besoins du marché du travail du XXIe siècle.",
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "scolaires",
    optionB: "numériques",
    optionC: "pédagogiques",
    optionD: "manuels",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La révolution numérique dans l'éducation",
    longText: "La révolution numérique dans l'éducation transforme profondément les pratiques pédagogiques. Les élèves utilisent désormais des outils [14] pour accéder aux cours, collaborer à distance et développer des [15] adaptées aux besoins du marché du travail du XXIe siècle.",
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "notes",
    optionB: "connaissances",
    optionC: "compétences",
    optionD: "habitudes",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le tourisme responsable vise à préserver le [16] naturel et culturel des destinations visitées. Pour cela, il impose de limiter les activités pouvant entraîner une [17] irréversible des sites historiques ou des écosystèmes fragiles.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le tourisme responsable",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "paysage",
    optionB: "patrimoine",
    optionC: "environnement",
    optionD: "attrait",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le tourisme responsable",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "rénovation",
    optionB: "transformation",
    optionC: "dégradation",
    optionD: "exploitation",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle période historique est caractérisée par un renouveau artistique et intellectuel en Europe aux XVe-XVIe siècles ?",
    optionA: "Période 1",
    optionB: "Période 2",
    optionC: "Période 3",
    optionD: "Période 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel type d'hébergement propose un logement chez l'habitant avec le petit-déjeuner inclus ?",
    optionA: "Hébergement 1",
    optionB: "Hébergement 2",
    optionC: "Hébergement 3",
    optionD: "Hébergement 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle cuisine valorise la fraîcheur des produits et inclut des plats à base de poisson cru ?",
    optionA: "Cuisine 1",
    optionB: "Cuisine 2",
    optionC: "Cuisine 3",
    optionD: "Cuisine 4",
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel logiciel a son code source accessible et modifiable librement ?",
    optionA: "Logiciel 1",
    optionB: "Logiciel 2",
    optionC: "Logiciel 3",
    optionD: "Logiciel 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La bibliothèque universitaire connaît sa plus forte fréquentation au second semestre avec 4 200 visites hebdomadaires. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Internat du lycée Victor-Hugo",
    longText: DOC_REGLEMENT_INTERNAT,
    question: "Selon le règlement, le téléphone portable des internes doit être…",
    optionA: "éteint toute la journée de cours.",
    optionB: "déposé à l'accueil à 22 h et récupéré le matin.",
    optionC: "conservé par les parents pendant la semaine.",
    optionD: "rangé dans la chambre pendant les études.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Internat du lycée Victor-Hugo",
    longText: DOC_REGLEMENT_INTERNAT,
    question: "Selon ce règlement, les sorties du week-end nécessitent…",
    optionA: "uniquement l'accord du directeur.",
    optionB: "une autorisation parentale signée.",
    optionC: "une demande écrite 48h à l'avance.",
    optionD: "un justificatif médical ou familial.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Conseiller juridique",
    longText: DOC_OFFRE_EMPLOI_JURID,
    question: "Ce poste est dans quel domaine du droit ?",
    optionA: "Le droit pénal.",
    optionB: "Le droit des sociétés.",
    optionC: "Le droit de la famille.",
    optionD: "Le droit administratif.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Conseiller juridique",
    longText: DOC_OFFRE_EMPLOI_JURID,
    question: "Parmi les avantages proposés dans cette offre, on trouve…",
    optionA: "Un véhicule de fonction.",
    optionB: "Une prise en charge à 50 % du Pass Navigo.",
    optionC: "Des congés payés supplémentaires.",
    optionD: "Un logement de fonction.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de maintenance informatique — TechSupport Pro",
    longText: DOC_CONTRAT_MAINTENANCE,
    question: "Selon ce contrat, l'assistance téléphonique est disponible…",
    optionA: "24h/24, 7j/7 sans interruption.",
    optionB: "Du lundi au vendredi de 8h à 18h.",
    optionC: "Uniquement pour les urgences critiques.",
    optionD: "Du lundi au samedi de 9h à 20h.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de maintenance informatique — TechSupport Pro",
    longText: DOC_CONTRAT_MAINTENANCE,
    question: "Quel est le délai d'intervention sur site en cas d'urgence ?",
    optionA: "4 heures maximum.",
    optionB: "12 heures ouvrées.",
    optionC: "24 heures ouvrées.",
    optionD: "48 heures.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Note de procédure — Nouveau processus de recrutement",
    longText: DOC_NOTE_RECRUTEMENT,
    question: "Selon cette note, l'offre d'emploi est diffusée en interne pendant combien de jours avant la diffusion externe ?",
    optionA: "2 jours ouvrables.",
    optionB: "5 jours ouvrables.",
    optionC: "10 jours ouvrables.",
    optionD: "15 jours ouvrables.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Note de procédure — Nouveau processus de recrutement",
    longText: DOC_NOTE_RECRUTEMENT,
    question: "Selon la note, combien d'entretiens sont obligatoires pour un recrutement ?",
    optionA: "Un seul entretien avec le manager.",
    optionB: "Deux entretiens (manager + DRH).",
    optionC: "Trois entretiens selon le niveau de poste.",
    optionD: "Autant que nécessaire selon les candidats.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide pratique de la location immobilière",
    longText: DOC_GUIDE_LOCATION,
    question: "Selon ce guide, le montant de la caution pour un logement meublé est limité à…",
    optionA: "1 mois de loyer hors charges.",
    optionB: "2 mois de loyer hors charges.",
    optionC: "3 mois de loyer hors charges.",
    optionD: "Le loyer du premier mois charges comprises.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide pratique de la location immobilière",
    longText: DOC_GUIDE_LOCATION,
    question: "D'après le guide, dans combien de jours le locataire doit-il signaler un désaccord sur l'état des lieux ?",
    optionA: "24 heures.",
    optionB: "3 jours suivant la remise des clés.",
    optionC: "7 jours ouvrables.",
    optionD: "Un mois.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La réforme du baccalauréat : bilan d'une transformation majeure",
    longText: ART_REFORME_BAC,
    question: "Selon cet article, quelle part de la note finale du baccalauréat est attribuée par contrôle continu ?",
    optionA: "20 %.",
    optionB: "30 %.",
    optionC: "40 %.",
    optionD: "50 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La réforme du baccalauréat : bilan d'une transformation majeure",
    longText: ART_REFORME_BAC,
    question: "Quelle critique est formulée contre le contrôle continu dans l'article ?",
    optionA: "Il favorise les élèves qui travaillent bien tout au long de l'année.",
    optionB: "Il a engendré des inégalités entre établissements qui notent différemment.",
    optionC: "Il a remplacé les épreuves terminales jugées trop difficiles.",
    optionD: "Il n'est pas reconnu par les universités étrangères.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le tourisme mémoriel : quand l'histoire devient destination",
    longText: ART_TOURISME_MEMORIEL,
    question: "Selon cet article, combien de visiteurs Auschwitz reçoit-il environ par an ?",
    optionA: "Plus de 500 000.",
    optionB: "Plus d'un million.",
    optionC: "Environ 5 millions.",
    optionD: "Plus de 10 millions.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le tourisme mémoriel : quand l'histoire devient destination",
    longText: ART_TOURISME_MEMORIEL,
    question: "L'article mentionne comme question éthique principale du tourisme mémoriel…",
    optionA: "Le coût trop élevé de l'entretien des sites mémoriaux.",
    optionB: "La frontière entre commémoration respectueuse et voyeurisme morbide.",
    optionC: "La difficulté à attirer des visiteurs internationaux.",
    optionD: "La concurrence entre sites mémoriaux et musées classiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La crise du logement étudiant",
    longText: ART_LOGEMENT_ETUDIANT,
    question: "Selon cet article, les résidences CROUS couvrent environ quel pourcentage des étudiants français ?",
    optionA: "Environ 20 %.",
    optionB: "Environ 15 %.",
    optionC: "Environ 10 %.",
    optionD: "Environ 7 %.",
    correctAnswer: 'D',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La crise du logement étudiant",
    longText: ART_LOGEMENT_ETUDIANT,
    question: "Parmi les solutions alternatives citées dans l'article, on trouve…",
    optionA: "La construction de cités universitaires en zone rurale.",
    optionB: "Les logements intergénérationnels (étudiants chez des personnes âgées).",
    optionC: "La limitation du nombre d'inscriptions dans les universités surpeuplées.",
    optionD: "La transformation des hôtels en résidences étudiantes.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'intelligence artificielle en droit",
    longText: ART_IA_DROIT,
    question: "Selon cet article, quelle application de l'IA en droit permet de démocratiser l'accès au conseil juridique ?",
    optionA: "L'analyse prédictive des décisions de justice.",
    optionB: "La traduction juridique assistée.",
    optionC: "Les consultations juridiques automatisées accessibles pour quelques euros.",
    optionD: "La détection des clauses abusives dans les contrats.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'intelligence artificielle en droit",
    longText: ART_IA_DROIT,
    question: "D'après l'article, quel risque lié aux algorithmes de prédiction judiciaire est mentionné ?",
    optionA: "Leur coût prohibitif pour les petits cabinets d'avocats.",
    optionB: "La reproduction et l'amplification des biais systémiques.",
    optionC: "Leur incapacité à traiter les affaires complexes.",
    optionD: "L'opposition des magistrats à leur utilisation.",
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
    console.log(`\n✅ ${created} questions créées pour CE 16.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
