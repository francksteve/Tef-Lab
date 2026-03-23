'use strict';
/**
 * seed-ce-serie53.js
 * Peuple la série CE 53 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie53.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyonkz001d0wxllrblh54d';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts budget d'une association par poste ── */
function generateQ22SVG() {
  const postes = ['Loc.','Sal.','Comm.','Div.'];
  const graphs = [
    { label: 'Graphique 1', data: [30, 30, 20, 20], color: '#E30613' },
    { label: 'Graphique 2', data: [20, 50, 15, 15], color: '#E30613' },
    { label: 'Graphique 3', data: [25, 40, 25, 10], color: '#E30613' },
    { label: 'Graphique 4', data: [15, 60, 15, 10], color: '#003087' }, // CORRECT : salaires = 60 %, poste dominant
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 70;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 58;

    const gridLines = [0, 20, 40, 60].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}%</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx = (plotX + i * 78 + 2).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (plotX + i * 78 + 2 + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" opacity="0.8"/>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${postes[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Part du budget</text>`;
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
  { title: 'Immigration 1', content: "Le programme d'Entrée Express (Express Entry) est le système de gestion des demandes de résidence permanente au Canada pour les travailleurs qualifiés. Il classe les candidats selon un Score global de facteurs humains (SGFH) qui prend en compte l'âge, le niveau d'études, l'expérience de travail et la maîtrise des langues officielles." },
  { title: 'Immigration 2', content: "Le Programme des travailleurs étrangers temporaires (PTET) permet aux employeurs canadiens d'embaucher des travailleurs étrangers lorsqu'ils ne trouvent pas de Canadiens ou de résidents permanents qualifiés pour le poste. Les travailleurs obtiennent un permis de travail temporaire lié à l'employeur qui les a recrutés." },
  { title: 'Immigration 3', content: "La citoyenneté canadienne peut être demandée après 3 ans de résidence permanente sur 5 ans. Elle confère le droit de vote, le droit à un passeport canadien et la protection diplomatique à l'étranger. Les candidats doivent passer un test de connaissance du Canada et démontrer leur maîtrise du français ou de l'anglais." },
  { title: 'Immigration 4', content: "Le regroupement familial permet aux résidents permanents et aux citoyens canadiens de parrainer certains membres de leur famille pour qu'ils immigrent au Canada. Le parrain s'engage à subvenir aux besoins financiers de la personne parrainée pendant une période déterminée, généralement 3 ans." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Communication 1', content: "La communication non verbale englobe tous les signaux qui ne passent pas par les mots : expressions faciales, gestes, posture, distance interpersonnelle (proxémique), contact visuel et ton de la voix. Des études estiment qu'elle représente 60 à 80 % de la communication humaine dans les interactions en face-à-face." },
  { title: 'Communication 2', content: "Le journalisme d'investigation est une forme de journalisme qui consiste à mener des enquêtes approfondies sur des sujets d'intérêt public (corruption, scandales politiques, crimes économiques). Il implique des recherches longues, des sources confidentielles et souvent des risques professionnels pour les journalistes." },
  { title: 'Communication 3', content: "La publicité programmatique est un système d'achat et de diffusion automatisée d'espaces publicitaires numériques. Des algorithmes analysent en temps réel le profil des internautes et diffusent les publicités les plus pertinentes à l'audience visée. Elle représente aujourd'hui la majorité des dépenses publicitaires numériques mondiales." },
  { title: 'Communication 4', content: "La rhétorique est l'art de persuader par le discours. Elle comprend trois modes de persuasion définis par Aristote : l'ethos (crédibilité de l'orateur), le logos (argumentation logique) et le pathos (appel aux émotions). Elle est étudiée depuis l'Antiquité grecque et reste un outil fondamental en droit, en politique et en marketing." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Biologie 1', content: "La photosynthèse est le processus par lequel les plantes vertes, les algues et certaines bactéries convertissent l'énergie lumineuse en énergie chimique. En présence de lumière, elles transforment le dioxyde de carbone (CO2) et l'eau (H2O) en glucose et en oxygène. Ce processus est à la base de quasiment toute la chaîne alimentaire terrestre." },
  { title: 'Biologie 2', content: "La mitose est le processus de division cellulaire qui permet à une cellule mère de se diviser en deux cellules filles génétiquement identiques. Elle est à la base de la croissance, de la réparation des tissus et de la reproduction asexuée. Contrairement à la méiose, elle ne produit pas de cellules sexuelles (gamètes)." },
  { title: 'Biologie 3', content: "L'immunologie étudie le système immunitaire, ses mécanismes de défense contre les agents pathogènes (bactéries, virus, parasites) et les dysfonctionnements qui mènent aux maladies auto-immunes et aux allergies. La vaccination exploite la mémoire immunitaire pour protéger l'organisme sans exposition à la maladie." },
  { title: 'Biologie 4', content: "L'écologie est la science qui étudie les relations entre les êtres vivants et leur environnement. Elle analyse les écosystèmes (forêts, océans, prairies), les chaînes et réseaux trophiques, les flux d'énergie et de matière, et l'impact des activités humaines sur la biodiversité et les équilibres naturels." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Diplomatique 1', content: "L'ONU (Organisation des Nations Unies) a été fondée en 1945 après la Seconde Guerre mondiale pour maintenir la paix internationale, développer des relations amicales entre nations et favoriser la coopération internationale. Son siège est à New York. Elle regroupe 193 États membres et dispose de 6 organes principaux dont le Conseil de Sécurité." },
  { title: 'Diplomatique 2', content: "L'Union Européenne (UE) est une organisation politique et économique de 27 États membres européens. Elle est caractérisée par un marché unique, une libre circulation des personnes, des biens, des services et des capitaux. La zone euro regroupe 20 États membres qui partagent la monnaie unique, l'euro, gérée par la Banque Centrale Européenne." },
  { title: 'Diplomatique 3', content: "Le G20 est un forum international réunissant les 19 pays les plus riches du monde plus l'Union Européenne. Il représente environ 85 % du PIB mondial et 80 % du commerce international. Ses sommets annuels abordent les grands défis économiques mondiaux : crises financières, climat, développement, régulation fiscale." },
  { title: 'Diplomatique 4', content: "La Francophonie institutionnelle est incarnée par l'Organisation Internationale de la Francophonie (OIF), qui regroupe 88 États et gouvernements ayant le français en partage. Elle promeut la langue française, la diversité culturelle et linguistique, et la démocratie dans ses États membres. Son secrétariat général est basé à Paris." },
]);

/* ── Documents Q23-32 ── */
const DOC_GUIDE_IMMIGRATION =
`GUIDE — PERMIS D'ÉTUDES AU CANADA

À QUI S'ADRESSE CE GUIDE ?
Aux personnes souhaitant poursuivre des études dans un établissement d'enseignement désigné (EED) au Canada pour une durée supérieure à 6 mois.

DOCUMENTS REQUIS :
- Lettre d'acceptation d'un EED au Canada
- Passeport valide pour toute la durée des études
- Preuve de ressources financières (frais de scolarité + 10 000 CAD pour la 1ère année de séjour)
- Photos d'identité conformes
- Preuve de liens avec le pays d'origine (famille, emploi, biens immobiliers)
- Certificat médical si exigé selon le pays de résidence

PROCÉDURE : La demande se fait en ligne sur le portail IRCC (Immigration, Réfugiés et Citoyenneté Canada). Le délai de traitement est de 4 à 12 semaines.

DROITS : Les étudiants étrangers peuvent travailler jusqu'à 20 heures par semaine hors campus pendant les sessions et à temps plein pendant les congés officiels.`;

const DOC_LETTRE_MOTIVATION =
`LETTRE DE MOTIVATION

Madame, Monsieur le Directeur,

Suite à la publication de votre offre d'emploi pour un poste de Chargé de Communication Digitale, je me permets de vous adresser ma candidature avec enthousiasme.

Titulaire d'un Master en Communication et Marketing Digital obtenu à l'Université Lumière Lyon 2 avec mention bien, j'ai acquis au cours de mes deux années d'expérience professionnelle une solide expertise en gestion des réseaux sociaux, création de contenus, référencement naturel (SEO) et analyse des données (Google Analytics, Meta Business Suite).

Mon passage au sein de l'agence WEBCOM (2 ans, stage puis CDI) m'a permis de piloter des campagnes pour des clients issus de secteurs variés : santé, immobilier, culture. J'ai notamment mené une campagne LinkedIn qui a multiplié par 3 l'engagement organique d'un client institutionnel en 6 mois.

Convaincu(e) que mes compétences et mon dynamisme correspondraient parfaitement aux besoins de votre équipe, je reste disponible pour un entretien à votre convenance.

Dans l'attente de votre retour, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

BELLA-NGANGA Joséphine`;

const DOC_STATUTS_ASSOCIATION =
`STATUTS DE L'ASSOCIATION — EXTRAITS

ARTICLE 1 — DÉNOMINATION : L'association « Francophonie Acteurs du Monde » (FAM), régie par la loi du 1er juillet 1901, a pour objet de promouvoir la langue française et les cultures francophones à l'international.

ARTICLE 4 — COMPOSITION : L'association se compose de membres fondateurs, de membres actifs (à jour de leur cotisation annuelle) et de membres bienfaiteurs (cotisation libre supérieure à 200 €).

ARTICLE 6 — RESSOURCES : Les ressources de l'association comprennent les cotisations, les subventions publiques, les dons et les produits des activités organisées.

ARTICLE 8 — ADMINISTRATION : L'association est administrée par un Bureau composé d'un Président, d'un Vice-Président, d'un Secrétaire Général et d'un Trésorier, élus pour 2 ans par l'Assemblée Générale.

ARTICLE 12 — DISSOLUTION : En cas de dissolution, l'actif net est attribué à une association poursuivant un objet similaire, désignée par l'Assemblée Générale.`;

const DOC_CONVENTION_PARTENARIAT =
`CONVENTION DE PARTENARIAT PÉDAGOGIQUE

ENTRE : L'Université Jean Moulin Lyon 3 (ci-après « l'Université »)
ET : L'Institut Français de Yaoundé (ci-après « l'Institut »)

OBJET : La présente convention a pour objet de définir les modalités de coopération pédagogique entre les deux établissements dans le cadre de la promotion de la langue française et de la formation linguistique.

ENGAGEMENTS DE L'UNIVERSITÉ :
- Mise à disposition de ressources pédagogiques numériques (cours en ligne, bibliothèque numérique)
- Accueil de 5 enseignants de l'Institut en formation continue chaque année
- Participation aux jurys d'examen du DELF/DALF organisés par l'Institut

ENGAGEMENTS DE L'INSTITUT :
- Promotion des formations de l'Université auprès de ses apprenants
- Organisation d'un événement culturel franco-camerounais annuel
- Diffusion des publications de l'Université dans son réseau

DURÉE : 3 ans renouvelables à compter de la signature.`;

const DOC_NOTE_COMMUNICATION =
`NOTE INTERNE — DIRECTION DE LA COMMUNICATION

À : Tous les services
De : Direction de la Communication
Objet : Nouvelles directives de communication externe

Dans le cadre de la refonte de notre stratégie de communication pour 2026, les règles suivantes entrent en vigueur dès le 1er janvier 2026 :

1. PORTE-PAROLE UNIQUE : Tout contact avec les médias (presse, radio, télévision, digital) doit impérativement passer par la Direction de la Communication. Aucun collaborateur n'est autorisé à s'exprimer au nom de l'établissement sans validation préalable.

2. RÉSEAUX SOCIAUX PROFESSIONNELS : Les comptes professionnels de l'établissement sont gérés exclusivement par l'équipe Communication. Il est rappelé que les publications personnelles des collaborateurs ne doivent pas mentionner l'établissement sans leur accord.

3. GESTION DE CRISE : En cas d'incident médiatique, les collaborateurs doivent immédiatement contacter le Directeur de Communication via la ligne dédiée (extension 1200).

Pour toute question : direction.com@etablissement.fr`;

/* ── Articles de presse Q33-40 ── */
const ART_FRANCOPHONIE =
`LA FRANCOPHONIE AU XXIe SIÈCLE : UN ESPACE EN RECOMPOSITION

Le français est aujourd'hui la cinquième langue la plus parlée au monde, avec environ 320 millions de locuteurs natifs et plus de 300 millions de locuteurs secondaires. Mais sa démographie est radicalement en train de se transformer : alors que le nombre de francophones stagne ou décline en Europe occidentale, il explose en Afrique subsaharienne, qui comptera les deux tiers des francophones mondiaux d'ici 2050 selon les projections de l'Organisation Internationale de la Francophonie.

Cette africanisation de la francophonie est à la fois une opportunité formidable et un défi politique complexe. Les pays africains francophones représentent des marchés en forte croissance, une population jeune et dynamique, et une créativité culturelle — musique, littérature, mode, cinéma — d'une richesse inégalée. La bande dessinée africaine, le hip-hop francophone africain ou la littérature camerounaise, sénégalaise et congolaise rayonnent bien au-delà des frontières du continent.

Mais la francophonie héritée de la colonisation porte encore le poids des inégalités et des ambiguïtés historiques. Pour de nombreux Africains, le français reste associé à l'élite éduquée, au système scolaire colonial, à une distanciation d'avec les langues maternelles. Le débat sur la place des langues africaines dans les systèmes éducatifs nationaux est plus vif que jamais.

La francophonie du XXIe siècle devra se construire sur une base plus équitable, reconnaissant la contribution des pays africains non plus comme simples récepteurs d'une culture française mais comme acteurs à part entière d'un espace linguistique partagé.`;

const ART_DIPLOMATIE_NUMERIQUE =
`LA DIPLOMATIE À L'ÈRE DES RÉSEAUX SOCIAUX : OPPORTUNITÉS ET RISQUES

La diplomatie numérique — ou twiplomatie — est devenue une réalité incontournable des relations internationales. Des présidents et ministres des affaires étrangères tweetent directement des annonces diplomatiques, interpellent publiquement leurs homologues étrangers et mobilisent des opinions publiques mondiales en temps réel. Cette évolution bouleverse les codes et les protocoles d'une diplomatie traditionnellement confidentielle.

Les avantages sont réels. Les réseaux sociaux permettent une communication directe avec les citoyens, contournant les filtres médiatiques traditionnels. Ils accélèrent la réaction aux crises et augmentent la pression sur les gouvernements récalcitrants face à l'opinion internationale. La mobilisation mondiale après certaines catastrophes humanitaires doit beaucoup aux campagnes sur les réseaux sociaux.

Mais les risques sont tout aussi importants. Un tweet maladroit peut déclencher une crise diplomatique en quelques minutes. La diplomatie numérique favorise les déclarations spectaculaires au détriment de la négociation patiente et discrète que requièrent les dossiers complexes. Elle nourrit également la désinformation : de faux comptes, des contenus fabriqués et des campagnes d'influence étrangère ont déjà perturbé des élections et des négociations diplomatiques.

Les chancelleries du monde entier s'adaptent en créant des équipes spécialisées en communication numérique et en cyberdiplomatie. Les protocoles de vérification des informations avant publication et la formation des diplomates à la communication digitale deviennent des enjeux stratégiques majeurs.`;

const ART_BIOLOGIE_MARINE =
`LES FONDS MARINS : UNE FRONTIÈRE ENCORE PRESQUE INCONNUE

Si l'humanité a exploré presque toute la surface terrestre, cartographié les sommets de l'Himalaya et envoyé des sondes au-delà du système solaire, elle n'a observé directement que 20 % des fonds marins. L'immensité et la profondeur des océans — le point le plus profond, la fosse des Mariannes, atteint 11 034 mètres — rendent leur exploration extrêmement difficile et coûteuse.

Pourtant, les fonds marins recèlent des trésors insoupçonnés. Les sources hydrothermales, découvertes en 1977, hébergent des écosystèmes extraordinaires qui vivent sans lumière solaire, basés sur la chimiosynthèse plutôt que la photosynthèse. Ces communautés de vers tubicoles géants, crevettes et bactéries ont bouleversé notre conception des conditions nécessaires à la vie, ouvrant de nouvelles perspectives sur l'origine de la vie terrestre et la possibilité de vie extraterrestre.

Les ressources minérales des fonds marins font l'objet d'une convoitise croissante. Les nodules polymétalliques (riches en manganèse, cobalt, nickel, cuivre) qui jonchent les plaines abyssales, les sulfures hydrothermaux et les encroûtements cobaltifères contiennent des métaux indispensables aux technologies vertes (batteries, éoliennes, panneaux solaires). Des entreprises et des États s'intéressent à leur exploitation, suscitant des inquiétudes légitimes chez les scientifiques sur l'impact environnemental d'une telle activité dans des écosystèmes extrêmement fragiles et peu résilients.

La gouvernance des fonds marins internationaux relève de l'Autorité Internationale des Fonds Marins (AIFM), dont les règles d'exploitation minière sont en cours de finalisation. L'enjeu est de définir un cadre permettant un développement éventuellement responsable de ces ressources sans détruire des écosystèmes millénaires encore largement inconnus.`;

const ART_CANADA_IMMIGRATION =
`LE CANADA ET L'IMMIGRATION : UN MODÈLE À L'ÉPREUVE DES RÉALITÉS

Le Canada est longtemps apparu comme le modèle mondial de l'immigration réussie. Sa politique de points (Entrée Express), son multiculturalisme institutionnel et son discours d'ouverture ont attiré des centaines de milliers d'immigrants qualifiés chaque année, lui permettant de compenser son faible taux de natalité et d'alimenter sa croissance économique.

Mais depuis 2022-2023, les tensions liées à l'immigration sont devenues une réalité politique majeure. L'objectif gouvernemental d'accueillir 500 000 nouveaux résidents permanents par an a coïncidé avec une crise aiguë du logement : les loyers ont augmenté de 20 à 40 % dans les grandes villes, Toronto et Vancouver en tête. Des segments de l'opinion publique canadienne, y compris au sein des communautés immigrées établies, expriment une inquiétude croissante face au rythme d'arrivée.

La réalité économique nuance aussi le discours officiel. Si l'immigration apporte indéniablement des compétences et une démographie active, l'intégration des nouveaux arrivants reste un défi. Le taux de sous-emploi des immigrants qualifiés — médecins, ingénieurs, professeurs dont les diplômes ne sont pas reconnus — est un problème structurel persistant. La vitesse d'intégration varie considérablement selon les origines, les langues et les réseaux d'entraide.

Le Canada est donc contraint de revisiter son modèle : non pas en fermant ses portes, mais en améliorant son infrastructure d'accueil (logements, services publics, reconnaissance des diplômes étrangers) pour que l'immigration reste une réussite collective et pas seulement une solution démographique abstraite.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_T =
`La diplomatie bilatérale repose sur des relations directes entre deux pays souverains. Elle se [14] par des traités, des accords commerciaux et des échanges réguliers entre chefs d'État. Lorsqu'un [15] survient entre deux nations, ce sont généralement les canaux diplomatiques bilatéraux qui sont activés en premier pour tenter de trouver une solution [16] avant d'en appeler aux instances internationales.`;

const TEXTE_LACUNAIRE_U =
`La biologie marine est une discipline scientifique qui [17] les organismes vivants dans les milieux aquatiques salés. Elle est intimement liée à l'océanographie et à l'écologie. Face aux menaces que font peser la pollution, la surpêche et le changement climatique sur les [17b] marins, cette discipline est devenue essentielle pour comprendre et préserver ces milieux fragiles.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `PROGRAMME — JOURNÉE PORTE OUVERTE
UNIVERSITÉ LAVAL — QUÉBEC

Samedi 18 janvier 2026 — 9h00 à 16h00
Campus principal, pavillon Maurice-Pollack

AU PROGRAMME :
• 9h00 : Mot de bienvenue du recteur — Amphithéâtre Hydro-Québec
• 9h30 – 12h00 : Visites guidées des facultés (sur inscription)
• 10h00 – 16h00 : Stands d'information des 17 facultés et écoles (hall principal)
• 11h00 : Conférence « Études au Canada : parcours d'immigration » (salle 1280)
• 13h30 : Table ronde des étudiants internationaux — témoignages
• 15h00 : Présentation des bourses d'excellence pour étudiants étrangers

Accès libre et gratuit — Stationnement gratuit le week-end
Renseignements : porteouverte@ulaval.ca | 1-418-XXX-XXXX`,
    question: 'Ce document est…',
    optionA: 'Un programme d\'une journée portes ouvertes universitaire',
    optionB: 'Un catalogue des formations offertes par l\'Université Laval',
    optionC: 'Une convocation pour un entretien de sélection universitaire',
    optionD: 'Un guide touristique de la ville de Québec',
    correctAnswer: 'A',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `RÈGLEMENT D'UTILISATION — BIBLIOTHÈQUE NATIONALE DU CANADA
Section Canadiana — Salle de lecture

ACCÈS :
La Salle de lecture est réservée aux chercheurs accrédités munis d'une carte de lecteur valide. L'accréditation est accordée sur présentation d'une pièce d'identité officielle et d'une lettre justifiant l'objet de la recherche (institution académique, projet de publication, recherche généalogique).

MATÉRIEL AUTORISÉ :
Ordinateurs portables, tablettes, appareils photo sans flash (pour usage personnel de recherche uniquement). Les stylos à bille sont strictement interdits (crayons fournis à l'accueil).

MATÉRIEL DE CONSERVATION :
Les documents originaux (manuscrits, archives, cartes) doivent être manipulés avec les gants de coton fournis. Il est interdit de plier, annoter ou photocopier soi-même les documents originaux.

COMMANDE DE DOCUMENTS : En ligne ou en salle, 24h à l'avance pour les fonds spéciaux.`,
    question: 'Ce document est…',
    optionA: 'Un guide des collections de la Bibliothèque Nationale du Canada',
    optionB: 'Le règlement d\'utilisation d\'une salle de lecture pour chercheurs',
    optionC: 'Une brochure touristique sur la Bibliothèque Nationale',
    optionD: 'Un formulaire d\'inscription à la bibliothèque',
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `COMMUNIQUÉ DE PRESSE

L'Ambassade de France au Cameroun annonce l'ouverture des inscriptions pour la 12e édition du Concours de Plaidoirie Francophone, organisé en partenariat avec le Barreau de Paris.

Ce concours est ouvert aux étudiants en droit et aux jeunes avocats de moins de 30 ans, ressortissants des pays membres de l'Organisation Internationale de la Francophonie.

Les candidats doivent soumettre un plaidoyer écrit de 10 pages sur le thème : « Le droit international face aux défis climatiques ».

Calendrier :
- Dépôt des candidatures : avant le 28 février 2026
- Sélection nationale : mars 2026
- Finale internationale à Paris : 12-14 mai 2026

Informations et dossier de candidature : ambafrance-cm.org/plaidoirie2026`,
    question: 'Ce document est…',
    optionA: 'Une affiche présentant une conférence sur le droit international',
    optionB: 'Un communiqué annonçant l\'ouverture d\'un concours de plaidoirie',
    optionC: 'Un règlement intérieur d\'un concours d\'éloquence universitaire',
    optionD: 'Un programme d\'une cérémonie de remise de prix juridiques',
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `PETITE ANNONCE — RECHERCHE DE COLOCATAIRE

Appartement T4 (90 m²) — Montréal, quartier Plateau-Mont-Royal
Cherche colocataire pour chambre disponible dès le 1er mars 2026

DESCRIPTION :
Grand appartement lumineux au 2e étage, entièrement meublé. Salon commun avec canapé, télévision et wifi. Cuisine équipée (lave-vaisselle, four, micro-ondes). Salle de bain + salle d'eau séparées. Balcon avec vue sur rue animée.

CONDITIONS :
• Loyer : 900 CAD/mois tout inclus (chauffage, eau chaude, internet, TV)
• 1 mois de caution
• Minimum 6 mois d'engagement

PROFIL RECHERCHÉ :
Étudiant(e) ou professionnel(le) francophone, calme, propre, respectueux/se. Non-fumeur dans l'appartement. Chat présent dans l'appartement.

Contact : coloc.plateau.montreal@gmail.com`,
    question: 'Ce document est…',
    optionA: 'Une annonce de location d\'appartement entier à Montréal',
    optionB: 'Une petite annonce de recherche de colocataire à Montréal',
    optionC: 'Un contrat de bail de colocation au Québec',
    optionD: 'Un guide du logement étudiant à Montréal',
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `MODE D'EMPLOI — APPLICATION MOBILE TRADUC-PLUS

PREMIÈRE UTILISATION
1. Téléchargez l'application sur l'App Store ou Google Play (gratuite).
2. Créez un compte avec votre adresse e-mail.
3. Sélectionnez votre langue de départ et votre langue d'arrivée.

TRADUCTION VOCALE (TEMPS RÉEL)
• Appuyez sur le microphone et parlez clairement dans votre langue.
• La traduction s'affiche et se prononce automatiquement dans la langue cible.
• Fonctionne hors ligne pour 12 langues (télécharger les packs de langues dans Paramètres).

TRADUCTION DE TEXTE PHOTO
• Appuyez sur l'icône Appareil Photo.
• Pointez votre caméra sur le texte à traduire.
• La traduction apparaît en surimpression dans l'image.

ABONNEMENT PREMIUM (4,99 €/mois) :
Traductions illimitées, 45 langues hors ligne, traduction de documents PDF.`,
    question: 'Ce document est un…',
    optionA: 'Mode d\'emploi d\'une application mobile de traduction',
    optionB: 'Catalogue de services d\'une agence de traduction',
    optionC: 'Guide d\'apprentissage des langues étrangères',
    optionD: 'Notice d\'un dictionnaire électronique bilingue',
    correctAnswer: 'A',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `BIOGRAPHIE

Michaëlle JEAN (née en 1957)

Journaliste, diplomate et femme politique haïtiano-canadienne, Michaëlle Jean est l'une des personnalités les plus emblématiques du monde francophone. Réfugiée en France puis au Canada avec sa famille lors de la dictature duvaliériste en Haïti, elle a fait carrière à Radio-Canada comme journaliste et animatrice de renom.

Nommée Gouverneure Générale du Canada (2005-2010), représentante de la Reine au Canada, elle est la première femme noire à occuper ce poste. Elle a ensuite été élue Secrétaire Générale de l'Organisation Internationale de la Francophonie (2014-2019), plateforme depuis laquelle elle a défendu la promotion du français en Afrique et la diplomatie culturelle.`,
    question: 'Ce document est…',
    optionA: 'Un article de presse sur la politique canadienne',
    optionB: 'La biographie d\'une personnalité franco-haïtiano-canadienne',
    optionC: 'Un extrait du site de l\'Organisation Internationale de la Francophonie',
    optionD: 'Un curriculum vitae officiel de diplomate',
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `INVITATION

Le Cercle des Diplomates Francophones a le plaisir de vous convier à

UN DÎNER-DÉBAT
« La place de la langue française dans la diplomatie internationale »

Jeudi 5 mars 2026 à 19h30
Résidence de l'Ambassadeur de France
1 rue du Faubourg Saint-Honoré, Paris 8e

Intervenants :
• S.E.M. Jean-Baptiste FOUCHET, Ambassadeur de France au Sénégal
• Mme Amina DIALLO, experte en politique linguistique à l'UNESCO
• M. Patrick LÉVESQUE, délégué général du Québec à Paris

Dress code : tenue de soirée
RSVP avant le 20 février : secretariat@cdf-paris.org
Places limitées`,
    question: 'Ce document est…',
    optionA: 'Un programme de conférence internationale sur la diplomatie',
    optionB: 'Une invitation à un dîner-débat sur la place du français en diplomatie',
    optionC: 'Un communiqué de presse de l\'Ambassade de France',
    optionD: 'Un règlement intérieur d\'un cercle diplomatique',
    correctAnswer: 'B',
  }));

  // ── Q8-13 ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le gouvernement a annoncé un plan d\'accueil ___ pour intégrer les nouveaux arrivants dans le marché du travail.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'ambitieux',
    optionB: 'modeste',
    optionC: 'ancien',
    optionD: 'controversé',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La découverte de nouvelles espèces marines a ___ les chercheurs sur la richesse insoupçonnée des fonds océaniques.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'informé',
    optionB: 'découragé',
    optionC: 'trompé',
    optionD: 'isolé',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La convention diplomatique signée entre les deux pays a permis de ___ les tensions qui persistaient depuis plusieurs années.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'apaiser',
    optionB: 'aggraver',
    optionC: 'ignorer',
    optionD: 'provoquer',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'L\'association francophone a obtenu une ___ publique pour financer son programme d\'alphabétisation.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'subvention',
    optionB: 'dette',
    optionC: 'taxe',
    optionD: 'amende',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le candidat à l\'immigration a dû fournir de nombreux ___ pour prouver ses ressources financières.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'justificatifs',
    optionB: 'contrats',
    optionC: 'formulaires',
    optionD: 'diplômes',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La chercheure a ___ une nouvelle théorie sur l\'origine de la vie dans les sources hydrothermales des fonds marins.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'proposé',
    optionB: 'refusé',
    optionC: 'caché',
    optionD: 'copié',
    correctAnswer: 'A',
  }));

  // ── Q14-17 ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La diplomatie bilatérale',
    longText: TEXTE_LACUNAIRE_T,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'matérialise',
    optionB: 'détruit',
    optionC: 'ignore',
    optionD: 'remplace',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La diplomatie bilatérale',
    longText: TEXTE_LACUNAIRE_T,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'différend',
    optionB: 'accord',
    optionC: 'traité',
    optionD: 'partenariat',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La diplomatie bilatérale',
    longText: TEXTE_LACUNAIRE_T,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'négociée',
    optionB: 'imposée',
    optionC: 'refusée',
    optionD: 'ignorée',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La biologie marine',
    longText: TEXTE_LACUNAIRE_U,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'étudie',
    optionB: 'détruit',
    optionC: 'ignore',
    optionD: 'remplace',
    correctAnswer: 'A',
  }));

  // ── Q18-21 ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quel programme canadien classe les candidats à l\'immigration selon un Score global de facteurs humains (SGFH) ?',
    optionA: 'Immigration 1',
    optionB: 'Immigration 2',
    optionC: 'Immigration 3',
    optionD: 'Immigration 4',
    correctAnswer: 'A',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quelle technique de communication utilise des algorithmes pour diffuser des publicités ciblées en temps réel ?',
    optionA: 'Communication 1',
    optionB: 'Communication 2',
    optionC: 'Communication 3',
    optionD: 'Communication 4',
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quel processus biologique produit de l\'oxygène à partir du CO2 et de la lumière ?',
    optionA: 'Biologie 1',
    optionB: 'Biologie 2',
    optionC: 'Biologie 3',
    optionD: 'Biologie 4',
    correctAnswer: 'A',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quelle organisation internationale regroupe 88 États et gouvernements ayant le français en partage ?',
    optionA: 'Diplomatique 1',
    optionB: 'Diplomatique 2',
    optionC: 'Diplomatique 3',
    optionD: 'Diplomatique 4',
    correctAnswer: 'D',
  }));

  // ── Q22 ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « Les salaires représentent 60 % du budget, soit de loin le poste le plus important » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'D',
  }));

  // ── Q23-32 ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Guide — Permis d\'études au Canada',
    longText: DOC_GUIDE_IMMIGRATION,
    question: 'Ce guide s\'adresse aux personnes souhaitant…',
    optionA: 'Obtenir la résidence permanente canadienne via Entrée Express',
    optionB: 'Poursuivre des études dans un établissement désigné au Canada',
    optionC: 'Travailler temporairement au Canada via le PTET',
    optionD: 'Parrainer un membre de leur famille pour immigrer au Canada',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Guide — Permis d\'études au Canada',
    longText: DOC_GUIDE_IMMIGRATION,
    question: 'Selon ce guide, combien d\'heures par semaine un étudiant étranger peut-il travailler pendant les sessions ?',
    optionA: '10 heures par semaine',
    optionB: '20 heures par semaine',
    optionC: '30 heures par semaine',
    optionD: 'À temps plein sans restriction',
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Lettre de motivation — Chargé de Communication Digitale',
    longText: DOC_LETTRE_MOTIVATION,
    question: 'Ce document est…',
    optionA: 'Un curriculum vitae d\'un expert en communication',
    optionB: 'Une lettre de motivation pour un poste en communication digitale',
    optionC: 'Un rapport d\'activité d\'une agence de communication',
    optionD: 'Une lettre de recommandation professionnelle',
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Lettre de motivation — Chargé de Communication Digitale',
    longText: DOC_LETTRE_MOTIVATION,
    question: 'Selon cette lettre, quel résultat concret le/la candidat(e) a-t-il/elle obtenu pour un client ?',
    optionA: 'Il/elle a triplé le chiffre d\'affaires d\'un client e-commerce',
    optionB: 'Il/elle a multiplié par 3 l\'engagement organique d\'un client sur LinkedIn',
    optionC: 'Il/elle a lancé une campagne TV nationale pour un client immobilier',
    optionD: 'Il/elle a créé le site web d\'une association culturelle',
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Statuts de l\'association FAM',
    longText: DOC_STATUTS_ASSOCIATION,
    question: 'Selon ces statuts, quel est l\'objet de l\'association FAM ?',
    optionA: 'Former des diplomates francophones',
    optionB: 'Promouvoir la langue française et les cultures francophones à l\'international',
    optionC: 'Organiser des échanges universitaires entre pays francophones',
    optionD: 'Défendre les droits des travailleurs migrants francophones',
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Statuts de l\'association FAM',
    longText: DOC_STATUTS_ASSOCIATION,
    question: 'Selon ces statuts, pour quelle durée les membres du Bureau sont-ils élus ?',
    optionA: '1 an',
    optionB: '2 ans',
    optionC: '4 ans',
    optionD: '5 ans',
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Convention de partenariat pédagogique — Lyon 3 / Institut Français Yaoundé',
    longText: DOC_CONVENTION_PARTENARIAT,
    question: 'Selon cette convention, quel est l\'objet de la coopération entre Lyon 3 et l\'Institut Français de Yaoundé ?',
    optionA: 'La recherche scientifique en biologie et en chimie',
    optionB: 'La promotion de la langue française et la formation linguistique',
    optionC: 'L\'échange d\'étudiants en droit international',
    optionD: 'Le développement de formations à distance payantes',
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Convention de partenariat pédagogique — Lyon 3 / Institut Français Yaoundé',
    longText: DOC_CONVENTION_PARTENARIAT,
    question: 'Selon cette convention, combien d\'enseignants de l\'Institut sont accueillis chaque année en formation à Lyon ?',
    optionA: '2 enseignants',
    optionB: '5 enseignants',
    optionC: '10 enseignants',
    optionD: 'La convention ne précise pas de nombre',
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Note interne — Nouvelles directives de communication externe',
    longText: DOC_NOTE_COMMUNICATION,
    question: 'Selon cette note, qui est autorisé à s\'exprimer au nom de l\'établissement auprès des médias ?',
    optionA: 'Tous les collaborateurs à condition de prévenir leur chef de service',
    optionB: 'Uniquement la Direction de la Communication, après validation',
    optionC: 'Les directeurs de service et le président uniquement',
    optionD: 'Tout collaborateur formé à la communication publique',
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Note interne — Nouvelles directives de communication externe',
    longText: DOC_NOTE_COMMUNICATION,
    question: 'Selon cette note, en cas d\'incident médiatique, les collaborateurs doivent…',
    optionA: 'Informer immédiatement les journalistes pour éviter la désinformation',
    optionB: 'Contacter immédiatement le Directeur de Communication via la ligne dédiée',
    optionC: 'Rédiger un communiqué de presse interne dans les 24h',
    optionD: 'Appeler directement le président de l\'établissement',
    correctAnswer: 'B',
  }));

  // ── Q33-40 ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — La Francophonie au XXIe siècle',
    longText: ART_FRANCOPHONIE,
    question: 'Selon cet article, quelle région du monde comptera les deux tiers des francophones mondiaux d\'ici 2050 ?',
    optionA: 'L\'Europe occidentale',
    optionB: 'L\'Afrique subsaharienne',
    optionC: 'L\'Amérique du Nord et le Québec',
    optionD: 'Le Maghreb et le Moyen-Orient',
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — La Francophonie au XXIe siècle',
    longText: ART_FRANCOPHONIE,
    question: 'L\'auteur suggère que la francophonie du XXIe siècle devra…',
    optionA: 'Renforcer le rôle dominant de la France dans l\'espace linguistique francophone',
    optionB: 'Reconnaître les pays africains comme acteurs à part entière de l\'espace francophone',
    optionC: 'Abandonner les langues africaines au profit du français standardisé',
    optionD: 'Fusionner l\'OIF avec l\'UNESCO pour plus d\'efficacité',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — La diplomatie à l\'ère des réseaux sociaux',
    longText: ART_DIPLOMATIE_NUMERIQUE,
    question: 'Selon cet article, quel est le principal risque de la diplomatie numérique (twiplomatie) ?',
    optionA: 'L\'exclusion des populations peu connectées du débat international',
    optionB: 'Les déclarations impulsives qui peuvent déclencher des crises diplomatiques',
    optionC: 'Le coût trop élevé de la gestion des équipes de communication numérique',
    optionD: 'La domination des grandes puissances technologiques sur les échanges diplomatiques',
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — La diplomatie à l\'ère des réseaux sociaux',
    longText: ART_DIPLOMATIE_NUMERIQUE,
    question: 'L\'auteur présente la twiplomatie comme favorisant…',
    optionA: 'La négociation patiente et discrète des dossiers complexes',
    optionB: 'Les déclarations spectaculaires au détriment de la négociation de fond',
    optionC: 'La transparence totale de toutes les négociations diplomatiques',
    optionD: 'L\'élimination de la désinformation dans les relations internationales',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — Les fonds marins, frontière inconnue',
    longText: ART_BIOLOGIE_MARINE,
    question: 'Selon cet article, quelle découverte scientifique a bouleversé la conception des conditions nécessaires à la vie ?',
    optionA: 'La découverte de nouvelles espèces de poissons dans les eaux polaires',
    optionB: 'Les sources hydrothermales et leurs écosystèmes sans lumière solaire basés sur la chimiosynthèse',
    optionC: 'La cartographie complète du plancher océanique par satellite',
    optionD: 'La découverte de plastiques dans les zones les plus profondes des océans',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — Les fonds marins, frontière inconnue',
    longText: ART_BIOLOGIE_MARINE,
    question: 'L\'article présente les ressources minérales des fonds marins comme suscitant…',
    optionA: 'Un désintérêt total des entreprises et des États',
    optionB: 'Une convoitise croissante et des inquiétudes sur l\'impact environnemental',
    optionC: 'Un accord international unanime pour leur protection totale',
    optionD: 'Une exploitation déjà bien avancée dans plusieurs zones du Pacifique',
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — Le Canada et l\'immigration face aux réalités',
    longText: ART_CANADA_IMMIGRATION,
    question: 'Selon cet article, quelle tension majeure est apparue au Canada depuis 2022-2023 liée à l\'immigration ?',
    optionA: 'Une augmentation du chômage due à la concurrence des immigrants',
    optionB: 'Une crise du logement avec des loyers en forte hausse dans les grandes villes',
    optionC: 'Des problèmes d\'intégration linguistique dans les provinces anglophones',
    optionD: 'Une augmentation de la criminalité dans les zones d\'accueil des immigrants',
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — Le Canada et l\'immigration face aux réalités',
    longText: ART_CANADA_IMMIGRATION,
    question: 'L\'auteur conclut que le Canada doit réviser son modèle en…',
    optionA: 'Réduisant drastiquement le nombre d\'immigrants admis chaque année',
    optionB: 'Améliorant son infrastructure d\'accueil et la reconnaissance des diplômes étrangers',
    optionC: 'Sélectionnant uniquement des immigrants anglophones pour faciliter l\'intégration',
    optionD: 'Concentrant l\'immigration dans les provinces moins peuplées',
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
    console.log(`\n✅ 40 questions créées pour CE 53.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
