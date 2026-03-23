'use strict';
/**
 * seed-ce-serie48.js
 * Peuple la série CE 48 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie48.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyomjg00180wxlvdv7ykge';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART, demandes de brevets par domaine ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [80, 45, 30, 55], color: '#E30613' },
    { label: 'Graphique 2', data: [60, 45, 35, 42], color: '#003087' }, // CORRECT
    { label: 'Graphique 3', data: [50, 65, 40, 30], color: '#E30613' },
    { label: 'Graphique 4', data: [35, 50, 75, 60], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Info', 'BioTech', 'Énergie', 'Chimie'];
  const maxVal = 100;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 25, 50, 75, 100].map(v => {
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
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Brevets (milliers)</text>`;
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
  { title: 'Type 1', content: "Centre botanique de démonstration agricole : espace dédié à l'expérimentation de cultures vivrières et maraîchères dans un contexte pédagogique. Accueille des stagiaires en formation agricole. Pas de collection de ligneux à des fins scientifiques. Ouvert du lundi au vendredi aux groupes sur réservation." },
  { title: 'Type 2', content: "Arboretum de la Côte d'Améthyste : collection de 400 espèces ligneuses — arbres et arbustes — d'origines boréales, tempérées et méditerranéennes, maintenues à des fins scientifiques et patrimoniales. Partenariats avec 12 universités pour la recherche dendrologique. Accès chercheurs sur accréditation institutionnelle." },
  { title: 'Type 3', content: "Jardin des herbes médicinales de l'Abbaye : collection de plantes médicinales cultivées selon les méthodes traditionnelles monastiques. Ateliers de phytothérapie et de tisanerie pour le public. Boutique de produits à base de plantes. Ouvert d'avril à octobre, tarif adulte 6 €." },
  { title: 'Type 4', content: "Parc paysager du Château de Montferrand : jardin à la française avec parterres de broderie, allées de buis et bassins ornementaux. Labellisé « Jardin remarquable ». Visites guidées architecturales. Pas de collection scientifique. Idéal pour photographies et mariages." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Type 1', content: "Bunraku : théâtre de marionnettes japonais traditionnel nécessitant trois manipulateurs par poupée. Les personnages représentent des scènes du monde des samouraïs ou des commerçants d'Edo. Inscrit au patrimoine UNESCO en 2003. Spectacles à l'Opéra National de Bunraku d'Osaka." },
  { title: 'Type 2', content: "Wayang kulit : marionnette-ombre javanaise et balinaise en cuir ajouré, animée par un dalang (maître de marionnettes) derrière un écran rétroéclairé. Répertoire basé sur les épopées indiennes Ramayana et Mahabharata. Inscrit au patrimoine mondial UNESCO en 2003 par l'Indonésie." },
  { title: 'Type 3', content: "Punch and Judy : spectacle traditionnel britannique de marionnettes à gaine en plein air, mettant en scène Mr Punch et sa femme Judy dans des situations comiques et burlesques. Tradition remontant au XVIIe siècle, importée d'Italie. Très populaire dans les fêtes d'été et sur les bords de mer." },
  { title: 'Type 4', content: "Marionnettes à fils (marionnettes à la planchette) : technique européenne ancienne utilisant des fils attachés à une planche de contrôle pour animer des personnages articulés. Tradition vivace en Belgique (marionnettes de Liège) et en République Tchèque. Spectacles familiaux humoristiques et féeriques." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Type 1', content: "Cuisine thaïlandaise : cuisine d'Asie du Sud-Est caractérisée par l'équilibre des saveurs sucrées, salées, acides et épicées. Plats emblématiques : pad thaï (nouilles sautées), soupe tom yum, curry vert au lait de coco. Utilisation extensive de citronnelle, galanga et feuilles de kaffir." },
  { title: 'Type 2', content: "Cuisine philippine : cuisine influencée par les traditions malaises, chinoises et espagnoles. Plat national : adobo (viande marinée au vinaigre et à la sauce soja). Spécialités : kare-kare (ragoût à la sauce aux arachides), sinigang (soupe acidulée au tamarin), lechon (cochon rôti à la broche)." },
  { title: 'Type 3', content: "Cuisine vietnamienne : cuisine légère et équilibrée utilisant abondamment les herbes fraîches (menthe, coriandre, basilic thaï), la sauce de poisson fermentée (nuoc-mam) et le pho comme plat emblématique. Rouleau de printemps frais, bun bo hue (soupe épicée) et bánh mì sont aussi emblématiques." },
  { title: 'Type 4', content: "Cuisine indonésienne : archipel de 270 millions d'habitants aux cuisines régionales très diverses. Plat national : nasi goreng (riz frit aux épices). Spécialités : rendang (bœuf aux épices caramélisé), gado-gado (salade sauce aux cacahuètes), satay (brochettes). Très épicé avec beaucoup de piment et de lait de coco." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Type 1', content: "Sprint triathlon : format court de triathlon comprenant 750 m de natation, 20 km de vélo et 5 km de course à pied. Accessible aux débutants et pratiqué lors des compétitions jeunes. Durée totale entre 50 minutes et 2 heures selon le niveau du participant. Format introductif au monde du triathlon compétitif." },
  { title: 'Type 2', content: "Triathlon olympique : format standard des Jeux Olympiques avec 1,5 km de natation, 40 km de vélo et 10 km de course à pied. Premier triathlon olympique à Sydney en 2000. Les meilleurs athlètes le terminent en moins de 2 heures. Discipline de l'équipe de France très médaillée aux JO." },
  { title: 'Type 3', content: "Half Ironman (70.3) : format intermédiaire exigeant du triathlon avec 1,9 km de natation, 90 km de vélo et 21,1 km de course. Le chiffre 70.3 représente la distance totale en miles. Nécessite 4 à 8 heures selon le niveau. Tremplin idéal avant l'Ironman complet pour les athlètes ambitieux." },
  { title: 'Type 4', content: "Ironman : format le plus exigeant du triathlon avec 3,86 km de natation en eau libre, 180 km de vélo et 42,2 km de course à pied. Limite horaire : 17 heures. Inventé à Hawaï en 1978, la course mondiale phare reste l'Ironman World Championship de Kona. Finir un Ironman est considéré comme un exploit personnel majeur." },
]);

/* ── Documents Q23-32 ── */
const DOC_LICENCE_BREVET =
`CONTRAT DE LICENCE DE BREVET EXCLUSIF

Entre le Concédant : Institut de Recherche en Biotechnologie Appliquée (IRBA)
Et le Licencié : BioPharm Solutions SAS

Article 1 — Objet
L'IRBA concède à BioPharm Solutions, à titre exclusif, le droit d'exploitation du brevet EP 3 245 789 B1 portant sur un procédé de fermentation enzymatique accélérée, pour une utilisation dans le secteur pharmaceutique et cosmétique uniquement.

Article 2 — Territoire
La licence couvre l'ensemble du territoire de l'Union Européenne et du Royaume-Uni.

Article 3 — Redevances
BioPharm Solutions versera à l'IRBA :
- Un droit d'entrée de 150 000 € à la signature du présent contrat
- Une redevance annuelle de 4 % du chiffre d'affaires généré par les produits exploitant le brevet
- Un minimum garanti annuel de 30 000 €, indépendamment du chiffre d'affaires réalisé

Article 4 — Durée
Le présent contrat prend effet à la date de signature et expire à la date d'expiration du brevet (15 ans).`;

const DOC_BIOCHIMISTE =
`OFFRE D'EMPLOI — BIOCHIMISTE CHERCHEUR(SE) R&D
NutriLab Sciences — Département Innovation

Rejoignez notre équipe R&D en qualité de biochimiste pour participer au développement de nouvelles formulations alimentaires enrichies.

Missions principales :
- Conception et réalisation d'expériences sur les enzymes digestives et les probiotiques
- Analyse des propriétés fonctionnelles des protéines végétales
- Interprétation des résultats et rédaction de rapports scientifiques
- Collaboration avec les équipes réglementaires pour les dossiers d'autorisation de mise sur le marché
- Veille scientifique dans les domaines de la nutrition et des biotechnologies alimentaires

Profil : Bac+5 en biochimie, biologie moléculaire ou sciences alimentaires ; expérience de 3 ans minimum en laboratoire R&D ; maîtrise des techniques d'électrophorèse, HPLC et PCR ; anglais scientifique courant.

Contrat : CDI, statut cadre. Intéressement et participation aux résultats. Laboratoires certifiés ISO 9001.`;

const DOC_FESTIVAL_MARIONNETTES =
`RÈGLEMENT DU FESTIVAL INTERNATIONAL DES MARIONNETTES
Section : Conditions de participation des compagnies artistiques

Article 1 — Éligibilité
Le festival est ouvert aux compagnies professionnelles de marionnettes du monde entier. Les compagnies amateurs peuvent participer au programme « Découverte » réservé aux jeunes talents (moins de 5 ans d'existence).

Article 2 — Dossier de candidature
Les dossiers complets doivent être soumis avant le 31 mars. Ils comprennent : présentation de la compagnie, fiche technique du spectacle, vidéo de 10 minutes minimum, références et tournées antérieures.

Article 3 — Sécurité
Toutes les installations scéniques doivent être conformes aux normes de sécurité électrique et incendie en vigueur. Un contrôle par l'organisme agréé du festival est obligatoire avant la première représentation.

Article 4 — Droits et rémunération
Les compagnies sélectionnées bénéficient d'un cachet minimum garanti, du remboursement des frais de transport et d'hébergement en chambre double, et d'une captation vidéo offerte.`;

const DOC_CONVENTION_INTERCULTURELLE =
`PROTOCOLE D'INTÉGRATION INTERCULTURELLE
Groupe InternationalTech — Direction des Ressources Humaines Mondiales

Ce protocole définit les pratiques de communication interculturelle applicables à l'ensemble des collaborateurs du Groupe InternationalTech opérant dans ses 45 filiales réparties dans 28 pays.

1. Prise de décision : les équipes doivent tenir compte des cultures à forte hiérarchie (Japon, Corée, certains pays d'Afrique) où les décisions remontent toujours à la direction, et des cultures à faible distance hiérarchique (Pays-Bas, Scandinavie) où le consensus est valorisé.

2. Communication : les cultures à communication directe (États-Unis, Allemagne) s'expriment explicitement, tandis que les cultures indirectes (Japon, Chine) communiquent souvent de manière implicite. Les malentendus naissent fréquemment de ces différences de style.

3. Temps et ponctualité : les cultures monochroniques (Europe du Nord, Amérique du Nord) perçoivent le temps de manière linéaire et rigide. Les cultures polychroniques (Méditerranée, Amérique Latine) ont une relation plus flexible avec les horaires.

4. Formation obligatoire : tous les managers exerçant des responsabilités transculturelles doivent suivre la formation « Intelligence culturelle » de 3 jours dans les 6 mois suivant leur prise de poste.`;

const DOC_JARDIN_JAPONAIS =
`GUIDE D'ENTRETIEN — JARDIN JAPONAIS DU PARC CULTUREL SAKURA

Ce guide est destiné aux visiteurs souhaitant comprendre les principes qui guident l'entretien de notre jardin japonais, réalisé en collaboration avec des maîtres jardiniers de Kyoto.

Taille des bonsaïs : effectuée deux fois par an (mars et septembre) en suivant la technique de taille de formation (nebari) pour révéler les racines superficielles. Chaque arbre fait l'objet d'une fiche individuelle de suivi.

Entretien des pierres et graviers : le rastrillage des graviers de granit blanc est réalisé chaque matin pour maintenir les motifs symbolisant les vagues ou les nuages. Technique spécifique selon la zone (karesansui ou roji).

Gestion de l'eau : la cascade et l'étang de carpes koï sont nettoyés mensuellement. Le niveau de l'eau est contrôlé quotidiennement. Les koï sont nourris deux fois par jour, jamais les jours de forte chaleur.

Comportement des visiteurs : respecter le silence dans les zones méditatives, ne pas toucher les pierres lanterne, ne pas nourrir les carpes sans autorisation du personnel.`;

/* ── Articles de presse Q33-40 ── */
const ART_BIOTECH_BREVETS =
`BIOTECHNOLOGIES ET BREVETS SUR LE VIVANT : UNE FRONTIÈRE ÉTHIQUE EN CONSTANTE ÉVOLUTION

La question de la brevetabilité du vivant constitue l'un des débats les plus complexes à l'intersection du droit, de l'éthique et de l'économie. Depuis l'arrêt Diamond v. Chakrabarty de la Cour Suprême américaine en 1980, qui a ouvert la voie à la brevetabilité des organismes génétiquement modifiés, le droit des brevets s'est progressivement étendu à des domaines autrefois considérés comme non brevetables : séquences génétiques, procédés enzymatiques, cellules souches.

En Europe, la Directive 98/44/CE encadre la brevetabilité du matériel biologique : les inventions utilisant du matériel biologique sont brevetables si elles impliquent un processus créatif humain ajoutant une plus-value technique. En revanche, les races animales, les variétés végétales et les procédés biologiques essentiellement naturels sont exclus de la brevetabilité.

Les tensions sont particulièrement vives dans le secteur pharmaceutique et agricole. Les grandes entreprises de semences arguent que les brevets sont indispensables pour amortir les investissements colossaux en recherche. Leurs opposants dénoncent une privatisation du vivant qui menace la biodiversité agricole et l'autonomie alimentaire des pays en développement.

Des alternatives émergent : les licences ouvertes, les pools de brevets dans le domaine médical ou les systèmes de protection des variétés végétales qui garantissent un droit d'obtenteur sans interdire le réensemencement traditionnel. L'équilibre entre incitation à l'innovation et accès aux ressources biologiques communes reste le défi central d'un droit en permanente construction.`;

const ART_MARIONNETTES_THERAPIE =
`LES MARIONNETTES AU SERVICE DE LA THÉRAPIE : UNE APPROCHE DOUCE POUR EXPRIMER L'INDICIBLE

L'utilisation des marionnettes dans un contexte thérapeutique connaît un essor remarquable depuis deux décennies. Cette approche, développée notamment par des psychologues américains et français, repose sur une propriété fondamentale de la marionnette : elle permet une distanciation psychologique entre le patient et son vécu douloureux.

En thérapie pour enfants, la marionnette offre un support d'expression privilégié pour des sujets difficiles — violence familiale, deuil, abus. L'enfant qui ne peut pas encore verbaliser ses émotions ou qui refuse de parler directement à l'adulte peut « prêter » ses ressentis à la marionnette, créant ainsi un espace intermédiaire sécurisé. Les psychologues spécialisés parlent d'un « tiers médiateur » qui facilite l'émergence du discours intérieur.

Avec les adultes, en particulier dans les groupes thérapeutiques pour personnes souffrant de troubles anxieux ou de phobies sociales, la marionnette permet de rejouer des situations traumatisantes à distance, en les « dédramatisant » progressivement. Certains thérapeutes utilisent également les marionnettes en remédiation cognitive pour des patients cérébrolésés, les invitant à manipuler des personnages comme exercice de coordination et de planification motrice.

Des formations universitaires en marionnettothérapie se développent, et plusieurs hôpitaux pédiatriques en France et en Belgique ont intégré des ateliers de marionnettes dans leurs programmes de soins. Cette reconnaissance institutionnelle marque une étape importante dans la légitimation d'une pratique longtemps considérée comme marginale.`;

const ART_INTERCULTUREL =
`COMMUNICATION INTERCULTURELLE ET MONDIALISATION : LES DÉFIS DE LA DIVERSITÉ EN ENTREPRISE

Dans un monde où les entreprises opèrent simultanément sur des dizaines de marchés et avec des équipes réparties aux quatre coins du globe, la compétence interculturelle est devenue un avantage compétitif décisif. Les recherches de Geert Hofstede, qui a analysé les valeurs culturelles de salariés dans plus de 50 pays, ont démontré que les différences culturelles structurent profondément les comportements au travail : rapport à l'autorité, gestion de l'incertitude, individualisme versus collectivisme, orientation temporelle.

Ces différences génèrent des incompréhensions fréquentes dans les environnements multiculturels. Un manager japonais qui hoche la tête pendant une réunion ne dit pas nécessairement « oui » — il signifie qu'il écoute. Un négociateur américain qui parle fort et coupe la parole est perçu comme agressif par ses homologues asiatiques. Ces malentendus culturels peuvent avoir des conséquences économiques considérables : contrats perdus, démotivation des équipes, tensions chroniques.

Les entreprises les plus performantes dans la gestion de la diversité culturelle sont celles qui ont développé une troisième culture organisationnelle — ni la culture du siège social, ni les cultures locales, mais un espace hybride intégrant des éléments de toutes les cultures présentes. Cette approche, théorisée par le chercheur Milton Bennett sous le terme de « développement de la sensibilité interculturelle », privilégie l'empathie culturelle et la flexibilité comportementale sur l'uniformisation.

La formation à l'intelligence culturelle est désormais intégrée dans les programmes des grandes écoles de management, et les entreprises du CAC 40 consacrent en moyenne 8 % de leur budget formation aux compétences interculturelles. Un investissement dont les bénéfices se mesurent en termes de rétention des talents étrangers et de réussite des projets internationaux.`;

const ART_TRIATHLON =
`TRIATHLON ET PRÉPARATION MENTALE : L'ENDURANCE AU-DELÀ DU PHYSIQUE

Le triathlon, en particulier dans ses formats longue distance, est souvent décrit comme un sport autant mental que physique. Les athlètes qui parviennent à franchir la ligne d'arrivée d'un Ironman ne sont pas nécessairement les mieux préparés physiquement — ils sont souvent ceux qui ont développé les ressources psychologiques les plus solides pour gérer la douleur, la fatigue et le doute pendant des heures d'effort intense.

Les recherches en psychologie du sport appliquée au triathlon identifient plusieurs compétences mentales déterminantes. La gestion du discours intérieur — apprendre à transformer les pensées négatives en affirmations positives — joue un rôle crucial, particulièrement lors des phases de difficulté intense. La segmentation de l'épreuve en micro-objectifs (atteindre la prochaine bouée, la prochaine côte, le prochain ravitaillement) permet de rendre gérable ce qui semblerait insurmontable si envisagé dans son ensemble.

La visualisation est un autre outil privilégié par les triathlètes de haut niveau. S'imaginer dérouler chaque transition avec fluidité, anticiper mentalement les difficultés potentielles et se représenter l'arrivée crée des « traces neurales » qui facilitent l'exécution le jour de la course. Des études menées sur des groupes de triathlètes montrent que ceux qui intègrent des séances régulières de visualisation améliorent leurs performances en transition de 8 à 15 %.

L'un des paradoxes du triathlon est que l'épreuve la plus longue — la course à pied — est aussi celle où l'état mental est le plus fragile, le corps ayant déjà fourni un effort colossal en natation et en vélo. C'est précisément dans cette dernière discipline que se jouent souvent les victoires et les abandons.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme festival marionnettes
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL INTERNATIONAL DES ARTS DE LA MARIONNETTE
18e édition — du 12 au 20 juillet 2025

PROGRAMME DE LA SEMAINE :
• Spectacles en salle (70 places) : réservation obligatoire sur festival-marionnettes.fr
• Spectacles de rue gratuits : place centrale, chaque soir à 21 h
• Pays invités d'honneur : Japon, Indonésie, République Tchèque
• Exposition : « 5 000 ans de marionnettes dans le monde » — Musée des Arts (entrée libre)
• Ateliers de fabrication pour enfants : tous les matins de 10 h à 12 h (5–12 ans, gratuit)
• Conférences d'ethnologues : amphithéâtre universitaire, entrée libre sur inscription

Inauguration officielle : vendredi 12 juillet à 19 h — Parvis de la Mairie`,
    question: "D'après ce document, les spectacles de rue ont lieu…",
    optionA: "uniquement le week-end, en matinée.",
    optionB: "chaque soir à 21 h sur la place centrale, gratuitement.",
    optionC: "dans des salles fermées sur réservation préalable.",
    optionD: "uniquement pour les pays invités d'honneur.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche triathlon
  qs.push(q(2, 'Q1-7', null, {
    longText:
`TRIATHLON DES LACS BLEUS — 7e édition
Dimanche 14 septembre 2025 — Lac de Montrichard

ÉPREUVES ET DISTANCES :
• Triathlon Sprint : 750 m nage / 20 km vélo / 5 km course
• Triathlon Olympique : 1 500 m nage / 40 km vélo / 10 km course
• Duathlon (pas de nage) : 5 km course / 30 km vélo / 5 km course

Départs échelonnés à partir de 8 h 00
Remise des récompenses : 14 h 30

Inscriptions : triathlonlacbleu.fr (clôture le 1er septembre)
Tarifs : Sprint 35 € | Olympique 45 € | Duathlon 30 €
Restauration sur place · Parking gratuit · Vestiaires et douches`,
    question: "Ce document est…",
    optionA: "un article de presse sur un triathlon régional.",
    optionB: "une affiche de compétition sportive présentant les épreuves et les tarifs.",
    optionC: "un règlement officiel de la Fédération de Triathlon.",
    optionD: "une publicité pour un équipement de triathlon.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement jardin japonais
  qs.push(q(3, 'Q1-7', null, {
    longText:
`JARDIN JAPONAIS DU PARC SAKURA — RÈGLEMENT DE VISITE

Pour préserver le caractère contemplatif et serein de cet espace, les visiteurs sont priés de respecter les règles suivantes :

• Silence obligatoire dans les zones méditatives (indiquées par panneaux)
• Il est interdit de toucher les pierres lanterne, les bonsaïs et les structures en bambou
• Les pique-niques et consommations alimentaires sont autorisés uniquement sur la terrasse du pavillon
• Animaux de compagnie non admis (zone protégée pour la faune locale)
• La photographie personnelle est autorisée ; les prises de vue commerciales nécessitent une autorisation écrite
• Enfants de moins de 8 ans : accompagnement parental obligatoire en permanence

Horaires : ouvert tous les jours de 9 h à 19 h (avril–octobre) et de 10 h à 17 h (novembre–mars)
Tarif : 6 € adulte | 3 € enfant | Gratuit moins de 6 ans`,
    question: "Selon ce document, que doit faire un photographe professionnel souhaitant prendre des photos dans le jardin ?",
    optionA: "Payer un droit de photographie supplémentaire à l'entrée.",
    optionB: "Se limiter aux zones non méditatives du jardin.",
    optionC: "Obtenir une autorisation écrite au préalable.",
    optionD: "Venir uniquement en dehors des horaires d'ouverture au public.",
    correctAnswer: 'C',
  }));

  // Q4 — Petite annonce cours cuisine vietnamienne
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE CUISINE VIETNAMIENNE AUTHENTIQUE
avec Madame Linh Nguyen — cuisinière originaire de Hanoï

Apprenez les secrets de la cuisine vietnamienne légère et parfumée !

Ateliers proposés (3 heures) :
• Pho bœuf maison (bouillon mijotage 6 h)
• Rouleaux de printemps frais et sauce nuoc-mam
• Bánh mì fait maison (baguette vietnamienne garnie)
• Bun bo hue (soupe épicée de Hué)
• Che ba mau (dessert aux haricots colorés)

Groupes de 4 à 8 personnes — Tous niveaux bienvenus
Samedis 14 h à 17 h ou mercredis 19 h à 22 h
Prix : 55 €/personne (repas partagé inclus)

Renseignements et réservations : linhcooks@cuisine-viet.fr`,
    question: "Ce document est…",
    optionA: "un menu de restaurant vietnamien.",
    optionB: "une petite annonce proposant des cours de cuisine vietnamienne.",
    optionC: "un article sur la gastronomie du Vietnam.",
    optionD: "une recette de pho bœuf maison.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi chronomètre sportif
  qs.push(q(5, 'Q1-7', null, {
    longText:
`CHRONOMÈTRE SPORTIF TRIMAX PRO — GUIDE RAPIDE

FONCTIONS PRINCIPALES :
• Chronomètre : touche START/STOP pour lancer/arrêter. Touche SPLIT pour enregistrer un temps intermédiaire (jusqu'à 99 splits).
• Compte à rebours : maintenez MODE 3 secondes → réglez durée avec les flèches → START pour lancer.
• Fréquence cardiaque (via ceinture cardio incluse) : touche HEART pour afficher BPM en temps réel.

SYNCHRONISATION :
Connectez via Bluetooth à l'application TriMax sur smartphone (iOS/Android) pour synchroniser vos chronos et générer des statistiques de performance.

AUTONOMIE : 12 mois en usage normal (pile CR2032 non rechargeable).

ÉTANCHÉITÉ : 50 m (WR 5 ATM) — adapté à la natation.

⚠ Ne pas utiliser en plongée. Remplacer la pile chez un horloger agréé.`,
    question: "D'après ce document, comment enregistrer un temps intermédiaire pendant une session ?",
    optionA: "En appuyant simultanément sur START et STOP.",
    optionB: "En appuyant sur la touche SPLIT.",
    optionC: "En synchronisant avec l'application smartphone.",
    optionD: "En maintenant la touche MODE 3 secondes.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué OPI (brevets/inventions)
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — Office de la Propriété Industrielle (OPI)

L'OPI publie son rapport annuel sur l'état de la propriété industrielle en France.

CHIFFRES CLÉS 2024 :
• 17 200 demandes de brevets déposées (+ 3,2 % par rapport à 2023)
• Secteurs les plus actifs : technologies numériques (32 %), biotechnologies (26 %), énergie propre (18 %)
• Délai moyen d'instruction : 28 mois
• Taux de délivrance : 68 % des demandes aboutissent à un brevet

L'OPI rappelle que le brevet confère à son titulaire un monopole d'exploitation de 20 ans sur le territoire national et international (selon les extensions demandées), en échange d'une divulgation publique complète de l'invention.

Les PME représentent désormais 41 % des demandeurs (+ 5 points en 5 ans).

Consulter le rapport intégral sur opi-france.fr`,
    question: "Ce communiqué informe principalement…",
    optionA: "des nouvelles lois sur la protection des inventions adoptées en 2024.",
    optionB: "des statistiques annuelles sur les dépôts de brevets en France.",
    optionC: "des résultats financiers de l'Office de la Propriété Industrielle.",
    optionD: "d'un scandale de contrefaçon industrielle majeur.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation atelier communication interculturelle
  qs.push(q(7, 'Q1-7', null, {
    longText:
`ATELIER PROFESSIONNEL — COMMUNICATION INTERCULTURELLE EN CONTEXTE INTERNATIONAL

Mardi 18 novembre 2025 — 9 h à 17 h
Espace de coworking InnoCenter — Salle Monde — 12e étage

Thèmes abordés :
• Les dimensions culturelles selon Hofstede et Hall
• Styles de communication directs vs indirects
• Négociation interculturelle : pièges et stratégies
• Cas pratiques : erreurs interculturelles célèbres en entreprise
• Simulation de réunion internationale multiculturelle

Formateur : Pr. Antoine Leclerc, docteur en anthropologie des organisations (Université de Paris)
Certification : attestation de participation officielle délivrée en fin de journée

Tarif : 350 € HT par participant (déjeuner et documents inclus)
Nombre de places limité à 15 — inscription avant le 5 novembre obligatoire.
Renseignements : formation@innocenter.fr`,
    question: "Quel est le but principal de ce document ?",
    optionA: "Promouvoir un livre sur la communication interculturelle.",
    optionB: "Annoncer une conférence académique sur l'anthropologie.",
    optionC: "Inviter des professionnels à un atelier sur la communication interculturelle.",
    optionD: "Informer les entreprises d'une nouvelle réglementation européenne.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "En biochimie, l'___ catalyse une réaction chimique spécifique en se liant à son ___ selon le principe de la clé et de la serrure.",
    question: PHRASE_Q,
    optionA: "hormone → récepteur",
    optionB: "enzyme → substrat",
    optionC: "anticorps → antigène",
    optionD: "protéine → acide aminé",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ de marionnettes doit maîtriser à la fois la technique de ___ et l'art de la voix pour donner vie aux personnages de manière convaincante.",
    question: PHRASE_Q,
    optionA: "sculpteur → fabrication",
    optionB: "marionnettiste → manipulation",
    optionC: "comédien → improvisation",
    optionD: "régisseur → mise en scène",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour exploiter commercialement un ___ appartenant à un tiers, une entreprise doit obtenir une ___ qui définit les droits d'utilisation et les redevances dues.",
    question: PHRASE_Q,
    optionA: "brevet → licence",
    optionB: "logo → franchise",
    optionC: "design → autorisation",
    optionD: "secret → concession",
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ est une soupe vietnamienne emblématique à base de ___ de bœuf ou de poulet, garnie de nouilles de riz, d'herbes fraîches et de condiments.",
    question: PHRASE_Q,
    optionA: "ramen → miso",
    optionB: "laksa → lait de coco",
    optionC: "pho → bouillon",
    optionD: "tom yum → citronelle",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "En triathlon, la zone de ___ désignée T2 marque le passage de la discipline vélo à la course à pied, où l'athlète change d'équipement dans un temps minimal.",
    question: PHRASE_Q,
    optionA: "ravitaillement",
    optionB: "transition",
    optionC: "repos",
    optionD: "chronométrage",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Un jardin ___ japonais est conçu comme un espace de méditation et de ___ où la disposition des pierres, de l'eau et des végétaux exprime une vision philosophique du monde.",
    question: PHRASE_Q,
    optionA: "médiéval → prière",
    optionB: "zen → contemplation",
    optionC: "baroque → spectacle",
    optionD: "formel → représentation",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Les biotechnologies alimentaires reposent largement sur le phénomène de [14], processus biochimique utilisé depuis des millénaires pour la fabrication du pain, du vin et du fromage. Aujourd'hui, les enzymes industrielles optimisent ce processus, jouant le rôle de biocatalyseurs qui accélèrent la [15] des réactions chimiques sans être elles-mêmes consommées.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Les enzymes et biotechnologies alimentaires',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "photosynthèse",
    optionB: "fermentation",
    optionC: "distillation",
    optionD: "oxydation",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Les enzymes et biotechnologies alimentaires',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "couleur",
    optionB: "température",
    optionC: "catalyse",
    optionD: "dissolution",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La communication interculturelle en entreprise mondiale nécessite une attention particulière aux [16] culturels inconscients qui faussent notre perception de l'autre. Une formation efficace développe la capacité d'[17] culturelle, c'est-à-dire la faculté de comprendre et d'intégrer les codes de communication d'une autre culture sans y perdre son identité propre.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Communication interculturelle en entreprise mondiale',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "avantages",
    optionB: "stéréotypes",
    optionC: "protocoles",
    optionD: "méthodes",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Communication interculturelle en entreprise mondiale',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "domination",
    optionB: "imitation",
    optionC: "adaptation",
    optionD: "résistance",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel établissement est principalement dédié à une collection scientifique de ligneux (arbres et arbustes) de diverses origines ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle marionnette est une ombre javanaise inscrite au patrimoine mondial UNESCO, animée par un dalang ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle cuisine utilise abondamment les herbes fraîches, la sauce de poisson fermentée et le pho comme plat emblématique ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel format de triathlon comprend 3,86 km de natation, 180 km de vélo et 42,2 km de course à pied ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'D',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le domaine de la biotechnologie est le second secteur le plus actif en dépôts de brevets avec 45 000 demandes annuelles, dont 60 % concernent des applications médicales. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Contrat de licence de brevet exclusif — IRBA / BioPharm Solutions",
    longText: DOC_LICENCE_BREVET,
    question: "Ce contrat porte principalement sur…",
    optionA: "la vente du brevet de l'IRBA à BioPharm Solutions.",
    optionB: "la concession du droit exclusif d'exploitation d'un brevet biotechnologique.",
    optionC: "le financement d'un projet de recherche en commun.",
    optionD: "la protection d'une marque commerciale dans l'Union Européenne.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Contrat de licence de brevet exclusif — IRBA / BioPharm Solutions",
    longText: DOC_LICENCE_BREVET,
    question: "Quel est le minimum garanti annuel que BioPharm Solutions doit verser à l'IRBA ?",
    optionA: "4 % du chiffre d'affaires sans minimum fixe.",
    optionB: "150 000 € chaque année pendant toute la durée du contrat.",
    optionC: "30 000 € annuels, indépendamment du chiffre d'affaires réalisé.",
    optionD: "Un montant variable selon les performances de vente.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Biochimiste chercheur(se) R&D",
    longText: DOC_BIOCHIMISTE,
    question: "NutriLab Sciences recherche un biochimiste pour…",
    optionA: "contrôler la conformité réglementaire des produits en vente.",
    optionB: "développer de nouvelles formulations alimentaires enrichies.",
    optionC: "gérer la production industrielle des compléments alimentaires.",
    optionD: "former les équipes commerciales aux arguments scientifiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Biochimiste chercheur(se) R&D",
    longText: DOC_BIOCHIMISTE,
    question: "Quelle condition linguistique est exigée dans cette offre d'emploi ?",
    optionA: "Maîtrise du japonais scientifique pour accéder aux publications asiatiques.",
    optionB: "Anglais scientifique courant.",
    optionC: "Bilinguisme français-allemand pour les collaborations européennes.",
    optionD: "Aucune exigence linguistique particulière n'est mentionnée.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement du Festival International des Marionnettes",
    longText: DOC_FESTIVAL_MARIONNETTES,
    question: "Ce document présente principalement…",
    optionA: "le programme artistique du festival pour les spectateurs.",
    optionB: "les conditions de participation des compagnies au festival.",
    optionC: "les tarifs d'entrée et les réductions disponibles.",
    optionD: "l'historique du festival depuis sa création.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement du Festival International des Marionnettes",
    longText: DOC_FESTIVAL_MARIONNETTES,
    question: "Que comprend la rémunération des compagnies sélectionnées ?",
    optionA: "Un cachet minimum garanti uniquement, sans autres avantages.",
    optionB: "Un cachet, le remboursement du transport et hébergement, et une captation vidéo.",
    optionC: "Un pourcentage des recettes de billetterie des représentations.",
    optionD: "Une subvention fixe de l'État pour couvrir les frais artistiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Protocole d'intégration interculturelle — Groupe InternationalTech",
    longText: DOC_CONVENTION_INTERCULTURELLE,
    question: "Ce protocole s'applique à…",
    optionA: "uniquement les cadres dirigeants du siège social du Groupe.",
    optionB: "l'ensemble des collaborateurs du Groupe dans ses 45 filiales mondiales.",
    optionC: "les seuls collaborateurs étrangers travaillant en France.",
    optionD: "les équipes commerciales intervenant dans des pays émergents.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Protocole d'intégration interculturelle — Groupe InternationalTech",
    longText: DOC_CONVENTION_INTERCULTURELLE,
    question: "Selon ce protocole, quelle obligation concerne les managers exerçant des responsabilités transculturelles ?",
    optionA: "Maîtriser au moins deux langues étrangères en plus du français.",
    optionB: "Vivre au moins 6 mois dans chaque pays de leur périmètre.",
    optionC: "Suivre la formation « Intelligence culturelle » dans les 6 mois suivant leur prise de poste.",
    optionD: "Rédiger un rapport annuel sur les incidents interculturels rencontrés.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide d'entretien — Jardin japonais du Parc Sakura",
    longText: DOC_JARDIN_JAPONAIS,
    question: "Ce document présente principalement…",
    optionA: "l'histoire et la philosophie des jardins japonais.",
    optionB: "les techniques d'entretien spécifiques du jardin japonais.",
    optionC: "les règles de comportement pour les visiteurs du jardin.",
    optionD: "le programme des visites guidées et animations du jardin.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide d'entretien — Jardin japonais du Parc Sakura",
    longText: DOC_JARDIN_JAPONAIS,
    question: "À quelle fréquence les graviers du jardin sont-ils rastrillés selon ce guide ?",
    optionA: "Une fois par semaine, le lundi matin.",
    optionB: "Chaque matin, pour maintenir les motifs symboliques.",
    optionC: "Deux fois par mois, en même temps que le nettoyage de l'étang.",
    optionD: "Uniquement en automne, avant la fermeture hivernale.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Biotechnologies et brevets sur le vivant : une frontière éthique en constante évolution",
    longText: ART_BIOTECH_BREVETS,
    question: "Selon cet article, quelle décision judiciaire a ouvert la voie à la brevetabilité des organismes génétiquement modifiés ?",
    optionA: "La directive européenne 98/44/CE sur la brevetabilité du matériel biologique.",
    optionB: "L'arrêt Diamond v. Chakrabarty de la Cour Suprême américaine en 1980.",
    optionC: "Un traité international de l'Organisation Mondiale de la Propriété Intellectuelle.",
    optionD: "Une décision de la Cour de Justice de l'Union Européenne en 2001.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Biotechnologies et brevets sur le vivant : une frontière éthique en constante évolution",
    longText: ART_BIOTECH_BREVETS,
    question: "L'auteur présente comme une alternative aux brevets classiques…",
    optionA: "L'interdiction totale de breveter tout matériel biologique.",
    optionB: "La nationalisation des entreprises biotechnologiques stratégiques.",
    optionC: "Les licences ouvertes, les pools de brevets et les droits d'obtenteur.",
    optionD: "Le financement public exclusif de toute la recherche biotechnologique.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Les marionnettes au service de la thérapie : une approche douce pour exprimer l'indicible",
    longText: ART_MARIONNETTES_THERAPIE,
    question: "Selon cet article, pourquoi la marionnette est-elle particulièrement utile en thérapie pour enfants ?",
    optionA: "Parce qu'elle permet à l'enfant de développer ses capacités artistiques.",
    optionB: "Parce qu'elle crée une distanciation entre l'enfant et son vécu douloureux.",
    optionC: "Parce qu'elle remplace efficacement les médicaments dans les traitements.",
    optionD: "Parce qu'elle occupe l'enfant pendant les attentes en consultation.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Les marionnettes au service de la thérapie : une approche douce pour exprimer l'indicible",
    longText: ART_MARIONNETTES_THERAPIE,
    question: "Quel signe de reconnaissance institutionnelle de la marionnettothérapie est mentionné dans l'article ?",
    optionA: "Son remboursement par la Sécurité Sociale française depuis 2020.",
    optionB: "L'intégration d'ateliers marionnettes dans des hôpitaux pédiatriques.",
    optionC: "La création d'un ordre professionnel des marionnettothérapeutes.",
    optionD: "L'adoption d'une loi européenne sur la médiation artistique.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Communication interculturelle et mondialisation : les défis de la diversité en entreprise",
    longText: ART_INTERCULTUREL,
    question: "Selon cet article, quelle recherche a démontré que les différences culturelles structurent les comportements au travail ?",
    optionA: "Les travaux de Milton Bennett sur le développement de la sensibilité interculturelle.",
    optionB: "Les recherches de Geert Hofstede sur les valeurs culturelles dans 50 pays.",
    optionC: "Les études d'Edward Hall sur la proxémie et le rapport au temps.",
    optionD: "Les analyses de Richard Lewis sur les cultures réactives et multiactives.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Communication interculturelle et mondialisation : les défis de la diversité en entreprise",
    longText: ART_INTERCULTUREL,
    question: "Que signifie le fait qu'un manager japonais hoche la tête pendant une réunion, selon l'article ?",
    optionA: "Qu'il approuve pleinement la proposition qui vient d'être faite.",
    optionB: "Qu'il n'écoute pas et attend que la réunion se termine.",
    optionC: "Qu'il signifie qu'il écoute, non pas qu'il est d'accord.",
    optionD: "Qu'il souhaite prendre la parole pour exprimer son opinion.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Triathlon et préparation mentale : l'endurance au-delà du physique",
    longText: ART_TRIATHLON,
    question: "Selon cet article, quelle technique mentale consiste à se diviser l'épreuve en petits objectifs successifs ?",
    optionA: "La visualisation de la ligne d'arrivée.",
    optionB: "La transformation des pensées négatives en affirmations positives.",
    optionC: "La segmentation de l'épreuve en micro-objectifs.",
    optionD: "La méditation de pleine conscience pendant l'effort.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Triathlon et préparation mentale : l'endurance au-delà du physique",
    longText: ART_TRIATHLON,
    question: "Selon l'article, les athlètes qui intègrent des séances de visualisation améliorent leurs performances en transition de…",
    optionA: "2 à 5 %.",
    optionB: "8 à 15 %.",
    optionC: "20 à 30 %.",
    optionD: "5 à 10 %.",
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
    console.log(`\n✅ ${created} questions créées pour CE 48.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
