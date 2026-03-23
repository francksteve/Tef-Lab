'use strict';
/**
 * seed-ce-serie31.js
 * Peuple la série CE 31 avec 40 questions TEF Canada officielles.
 * Thèmes : sociologie, cuisine indienne, aviation civile, droit de l'eau,
 *          énergies marines, photovoltaïque, slam et poésie
 * Usage : node scripts/seed-ce-serie31.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyojbm000r0wxlt7kt0i82';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART — production solaire en GWh ── */
function generateQ22SVG() {
  // Région A : croissance spectaculaire ×4.5 = CORRECT
  const dataseries = [
    { label: 'Graphique 1 — Région A', points: [20, 35, 55, 70, 90], color: '#003087' }, // CORRECT
    { label: 'Graphique 2 — Région B', points: [50, 60, 65, 70, 75], color: '#E30613' },
    { label: 'Graphique 3 — Région C', points: [80, 75, 70, 65, 60], color: '#E30613' },
    { label: 'Graphique 4 — Région D', points: [30, 35, 32, 38, 40], color: '#E30613' },
  ];
  const years = ['2019', '2020', '2021', '2022', '2023'];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 100;

  function drawLineChart(ds, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const step = plotW / (years.length - 1);
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
    const xlabels = years.map((y, i) => {
      const px = (plotX + i * step).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${y}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${ds.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines +
           `<polyline points="${polyline}" fill="none" stroke="${ds.color}" stroke-width="2.5"/>` +
           dots + xlabels +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Production (GWh)</text>`;
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
  { title: 'Texte 1', content: "L'énergie marémotrice exploite la différence de hauteur d'eau entre la marée haute et la marée basse pour faire tourner des turbines. La centrale de la Rance, en Bretagne, est l'une des premières et des plus grandes au monde. Elle fonctionne dans les deux sens, à la montée et à la descente des marées." },
  { title: 'Texte 2', content: "L'énergie houlomotrice est extraite du mouvement des vagues en surface des océans. Contrairement aux marées qui dépendent des cycles lunaires, les vagues sont générées par le vent et offrent un potentiel énergétique quasi continu sur certaines côtes. Des systèmes flottants captent l'énergie mécanique des vagues pour la convertir en électricité." },
  { title: 'Texte 3', content: "L'énergie thermique des mers (ETM) exploite la différence de température entre les eaux chaudes de surface et les eaux froides des profondeurs. Un fluide frigorigène absorbe la chaleur de surface, se vaporise et entraîne une turbine. Cette technologie est particulièrement prometteuse dans les zones tropicales." },
  { title: 'Texte 4', content: "L'énergie hydrolienne est produite par des turbines sous-marines entraînées par les courants marins. Comme les éoliennes terrestres mais immergées, ces hydroliennes captent l'énergie cinétique des flux d'eau. Les estuaires à forts courants et les détroits représentent les sites les plus propices à leur installation." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "La cuisine punjabi du nord de l'Inde est célèbre pour ses plats riches en beurre clarifié (ghee) et ses pains comme le naan et le paratha. Le poulet tikka masala et le beurre de poulet (butter chicken) sont ses ambassadeurs mondiaux. Les épices comme le cumin, la coriandre et le garam masala y sont omniprésentes." },
  { title: 'Texte 2', content: "La cuisine tamoul du sud de l'Inde est essentiellement végétarienne et très épicée. Elle repose sur le riz, la noix de coco, les lentilles et les piments. Le dosa, fine crêpe fermentée de riz et lentilles, le sambar, soupe aux légumes épicée, et les chutneys coconut en sont des spécialités emblématiques." },
  { title: 'Texte 3', content: "La cuisine bengali, originaire du Bengale occidental et du Bangladesh, est réputée pour son utilisation généreuse du poisson et des fruits de mer. La moutarde et les graines de nigelle dominent sa palette aromatique. Le poisson hilsa cuisiné à la moutarde est considéré comme le plat national du Bangladesh." },
  { title: 'Texte 4', content: "La cuisine rajasthani du Rajasthan, région désertique du nord-ouest de l'Inde, se caractérise par des préparations adaptées à la rareté de l'eau et à la chaleur. Les lentilles et les haricots secs dominent, avec le dal baati churma comme plat emblématique : des boules de pâte cuites dans des braises accompagnées de lentilles." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "La classe ouvrière désigne les travailleurs manuels salariés employés principalement dans l'industrie et les services peu qualifiés. Sa définition marxiste la relie à son rapport aux moyens de production. Sa part dans la population active des pays développés a diminué avec la désindustrialisation et la tertiarisation de l'économie." },
  { title: 'Texte 2', content: "Les classes populaires regroupent l'ensemble des catégories sociales aux revenus modestes, incluant les ouvriers, les employés peu qualifiés et les petits commerçants. Leur mode de vie se distingue par une plus grande insécurité économique et un moindre accès aux biens culturels légitimes selon Pierre Bourdieu." },
  { title: 'Texte 3', content: "La classe moyenne supérieure se distingue par un niveau de revenus et de patrimoine significatif sans toutefois appartenir à l'élite des ultra-riches. Elle inclut les professions libérales, les cadres supérieurs, les ingénieurs et les gestionnaires. Sa reproduction sociale passe essentiellement par l'investissement dans le capital éducatif des enfants." },
  { title: 'Texte 4', content: "L'aristocratie financière désigne la fraction la plus aisée de la classe dominante, dont la fortune provient principalement des revenus du capital : dividendes, intérêts, loyers et plus-values. Elle se distingue de la bourgeoisie d'entreprise par son rapport passif au travail et son mode de vie ostentatoire." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "Le sonnet est une forme poétique fixe d'origine italienne, composée de 14 vers répartis en deux quatrains et deux tercets. Popularisé en France par Ronsard et Du Bellay au XVIe siècle, il obéit à des règles strictes de versification. Shakespeare en a fait une forme emblématique en anglais avec ses 154 sonnets célèbres." },
  { title: 'Texte 2', content: "Le haïku est un poème japonais de 3 vers de 5-7-5 syllabes, évoquant un instant fugace de nature ou de quotidien. Né au XVIIe siècle avec Matsuo Bashō, il privilégie la suggestion plutôt que l'explication. Le kigo, terme de saison, est souvent présent pour ancrer le poème dans un moment précis." },
  { title: 'Texte 3', content: "Le slam est une forme de poésie orale et performative née dans les bars américains des années 1980. Il valorise la parole vivante, le rythme et l'engagement émotionnel plutôt que les règles formelles. Les slam contests ou battles opposent des poètes devant un public qui note leurs performances." },
  { title: 'Texte 4', content: "La villanelle est une forme poétique de 19 vers répartis en cinq tercets et un quatrain final, avec deux refrains qui alternent. Rendue célèbre en langue anglaise par Dylan Thomas avec son poème « Do not go gentle into that good night », elle est appréciée pour sa musicalité répétitive et hypnotique." },
]);

/* ── Documents Q23-32 ── */
const DOC_CONTRAT_EAU =
`RÈGLEMENT DU SERVICE PUBLIC DE L'EAU POTABLE
Agence Régionale de l'Eau — Article 12

Tout abonné au service de l'eau potable s'engage à régler les factures bimestrielles dans un délai de trente jours à compter de la date d'émission. En cas de retard de paiement, une pénalité de 1,5 % par mois sera appliquée sur le montant dû.

La consommation est mesurée par le compteur individuel dont l'entretien relève de la responsabilité de l'agence. Toute fuite constatée en aval du compteur est à la charge de l'abonné.

En cas de non-paiement persistent après mise en demeure, l'agence se réserve le droit de procéder à la coupure de l'alimentation en eau, sous réserve du respect des délais légaux et des dispositions protégeant les ménages en situation de précarité.`;

const DOC_OFFRE_PILOTE =
`OFFRE D'EMPLOI — PILOTE DE LIGNE (OPL)

Compagnie AéroConnect recherche des officiers pilotes de ligne pour ses liaisons court et moyen-courriers.

Conditions requises :
• Licence ATPL (Airline Transport Pilot Licence) en état de validité
• Qualification de type sur Airbus A320 souhaitée (formation possible)
• Minimum 1 500 heures de vol dont 500 en tant que commandant de bord
• Certificat médical de classe 1 en cours de validité
• Maîtrise de l'anglais aéronautique niveau 5 minimum (OACI)
• Absence de tout antécédent judiciaire

Avantages : salaire selon convention collective du transport aérien, indemnités de déplacement, mutuelle haut de gamme, plan épargne retraite.

Candidatures en ligne sur aeroconnect-jobs.fr`;

const DOC_CONVENTION_POETE =
`CONVENTION DE POÈTE EN RÉSIDENCE

La Ville de Saint-Rémi et l'association Mots Vivants s'engagent à accueillir un(e) poète en résidence dans le cadre de son programme culturel annuel.

Durée : 4 semaines du 1er au 28 février
Lieu : Maison de la poésie, 3 rue des Arts

Obligations du poète résident :
• Animer 3 ateliers d'écriture ouverts au public (lycéens et adultes)
• Participer à 2 lectures publiques au théâtre municipal
• Rédiger un carnet de résidence de 10 pages minimum à remettre à la fin

Contreparties : bourse de 2 000 €, hébergement gratuit, remboursement des frais de déplacement.`;

const DOC_REGLEMENT_SOLAIRE =
`RÈGLEMENT D'ACCÈS AU SITE DE LA CENTRALE SOLAIRE LUMEX

La centrale solaire LUMEX est une installation électrique classée. L'accès au site est strictement réservé au personnel habilité et aux visiteurs munis d'un badge nominatif délivré en accueil.

Règles de sécurité obligatoires :
• Port du casque de protection en zone de panneaux
• Chaussures de sécurité obligatoires à partir de la grille B
• Interdiction formelle de toucher les installations photovoltaïques
• Téléphones portables éteints dans la salle des onduleurs

En cas d'accident ou d'incident, activer immédiatement l'alarme générale et composer le 3 sur le téléphone interne. Ne pas tenter d'intervenir soi-même sur une installation sous tension.`;

const DOC_NOTE_SOCIO =
`NOTE D'ENQUÊTE — Département de Sociologie
Objet : Résultats préliminaires de l'enquête sur la mobilité sociale intergénérationnelle

L'enquête menée auprès de 1 240 ménages révèle que la mobilité sociale ascendante reste significativement corrélée au niveau de diplôme des parents. Les enfants de cadres supérieurs ont quatre fois plus de probabilité d'accéder eux-mêmes à une position de cadre que les enfants d'ouvriers.

Toutefois, des signes de convergence apparaissent dans les cohortes nées après 1990 : l'accès généralisé à l'enseignement supérieur et le développement des formations professionnalisantes semblent atténuer légèrement l'effet du déterminisme social.

Ces résultats seront présentés lors du colloque national de sociologie du 15 mars.`;

/* ── Articles de presse Q33-40 ── */
const ART_EAU_JUSTICE =
`L'ACCÈS À L'EAU POTABLE : UN DROIT FONDAMENTAL INÉGALEMENT DISTRIBUÉ

L'eau potable, reconnue comme droit fondamental de l'être humain par l'ONU en 2010, reste inaccessible pour plusieurs centaines de millions de personnes dans le monde. Les inégalités d'accès à cette ressource vitale constituent l'un des défis humanitaires les plus urgents du XXIe siècle, exacerbé par les effets du changement climatique.

En Afrique subsaharienne, des populations entières dépendent encore de points d'eau collectifs contaminés ou de porteurs d'eau, engendrant des maladies hydriques qui tuent chaque année des dizaines de milliers d'enfants de moins de cinq ans. Les femmes et les filles consacrent des heures quotidiennes à la corvée d'eau, au détriment de leur éducation et de leur émancipation économique.

La justice climatique ajoute une dimension supplémentaire à cette inégalité : les populations qui contribuent le moins aux émissions de gaz à effet de serre sont souvent les premières à souffrir de la raréfaction et de la contamination des ressources en eau. Les sécheresses prolongées en Afrique de l'Est, les inondations en Asie du Sud et les ouragans dans les Caraïbes frappent des populations déjà vulnérables.

Des solutions existent : gestion intégrée des bassins versants, collecte des eaux de pluie, traitement des eaux usées, technologies de dessalement. Mais leur déploiement nécessite des investissements massifs et une volonté politique internationale que la communauté mondiale peine à mobiliser.`;

const ART_SLAM =
`LE SLAM POÉTIQUE : D'UNE SOUS-CULTURE URBAINE À UN ART RECONNU

Né dans les bars de Chicago dans les années 1980, le slam a parcouru un chemin remarquable pour s'imposer comme une forme d'expression artistique à part entière, reconnue et institutionnalisée dans de nombreux pays. En France, des figures comme Grand Corps Malade ont contribué à populariser cet art de la parole auprès d'un public bien au-delà des cercles poétiques initiaux.

Le slam se distingue des autres formes de poésie par son rapport direct au public et son refus des hiérarchies littéraires. N'importe qui peut monter sur scène lors d'une soirée « open mic » et déclamer ses textes. Les règles sont minimalistes : pas d'accessoires, pas de musique instrumentale, juste la voix et les mots. Les performances sont souvent notées par le public, ce qui crée une atmosphère de compétition conviviale.

Sociologiquement, le slam est né dans des quartiers populaires urbains comme une réponse à l'exclusion des circuits culturels traditionnels. Il porte souvent des messages politiques et sociaux, traitant du racisme, des inégalités, de l'amour ou de la mémoire collective. Cette dimension contestataire reste présente même lorsque le mouvement gagne les scènes institutionnelles.

Les débats sur l'institutionnalisation du slam sont vifs : certains craignent qu'une trop grande reconnaissance officielle ne dilue son énergie subversive originelle. D'autres voient dans les festivals, les résidences artistiques et l'enseignement du slam à l'école une opportunité de démocratiser l'accès à la poésie.`;

const ART_AVIATION_CARBONE =
`AVIATION ET BILAN CARBONE : VERS UNE INDUSTRIE PLUS VERTE ?

L'aviation civile représente environ 2 à 3 % des émissions mondiales de CO2 d'origine humaine — un chiffre en apparence modeste mais trompeur, car l'impact climatique total du secteur, incluant les traînées de condensation et les émissions à haute altitude, est estimé à deux à quatre fois supérieur à celui du seul CO2.

Face à la pression réglementaire et à la demande croissante de voyageurs soucieux de leur empreinte écologique, les compagnies aériennes multiplient les initiatives. Les carburants d'aviation durables (SAF), fabriqués à partir de déchets agricoles ou de CO2 capturé, sont présentés comme l'une des solutions les plus prometteuses à court terme. Mais leur coût de production reste deux à cinq fois supérieur à celui du kérosène conventionnel.

L'hydrogène représente une piste à plus long terme. Airbus a annoncé des programmes de recherche sur des avions à hydrogène pour 2035, mais les défis techniques liés au stockage et à la distribution de l'hydrogène liquide restent considérables. Les avions à batterie électrique, eux, ne peuvent à ce stade couvrir que des distances très courtes.

Pour de nombreux environnementalistes, la seule solution réellement efficace à court terme reste la réduction du trafic aérien, notamment des vols court-courriers qui peuvent être remplacés par le train. Une position que l'industrie du transport aérien rejette, invoquant l'importance économique du secteur et les millions d'emplois qu'il génère.`;

const ART_TRANSITION_ENERGETIQUE =
`TRANSITION ÉNERGÉTIQUE ET SOUVERAINETÉ : LES ENJEUX GÉOPOLITIQUES DES ÉNERGIES RENOUVELABLES

La transition vers les énergies renouvelables est souvent présentée comme un gage d'indépendance énergétique pour les pays importateurs de pétrole et de gaz fossiles. La réalité est plus complexe : les technologies vertes créent de nouvelles dépendances et de nouveaux rapports de force géopolitiques.

La fabrication des panneaux solaires, des éoliennes et des batteries électriques requiert des métaux rares — lithium, cobalt, terres rares, nickel — dont les gisements sont concentrés dans quelques pays : la République démocratique du Congo pour le cobalt, la Bolivie et le Chili pour le lithium, la Chine pour les terres rares. Ces nouvelles dépendances pourraient reproduire, dans un autre registre, les vulnérabilités liées au pétrole.

La Chine a pris conscience très tôt de cet enjeu stratégique et investit massivement depuis deux décennies dans l'ensemble de la chaîne de valeur des technologies vertes, des mines aux usines de fabrication. Elle détient aujourd'hui une position dominante dans la production de panneaux solaires, de batteries et de véhicules électriques, ce qui lui confère un levier géopolitique considérable.

Les pays européens cherchent à sécuriser leurs approvisionnements en métaux critiques via des accords bilatéraux avec les pays producteurs et le développement du recyclage. La question de la souveraineté industrielle dans la transition énergétique est désormais au cœur des stratégies de défense économique des grandes puissances.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche festival slam poésie
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL NATIONAL DU SLAM ET DE LA POÉSIE VIVANTE

3e édition — Du 22 au 26 mars
Maison de la Poésie de Bordeaux

Au programme :
• Compétition nationale de slam (quartiers de finale au mercredi)
• Ateliers d'écriture ouverts à tous (sur inscription)
• Tables rondes : « La poésie comme acte politique »
• Soirées open mic chaque soir à partir de 20 h 30

Entrée libre pour les ateliers | Compétition : 8 €/soirée
Renseignements : festslam-bordeaux.fr`,
    question: "D'après cette affiche, les ateliers d'écriture sont…",
    optionA: "réservés aux participants à la compétition.",
    optionB: "payants et sur réservation obligatoire.",
    optionC: "ouverts à tous et gratuits.",
    optionD: "animés uniquement par des professeurs.",
    correctAnswer: 'C',
  }));

  // Q2 — Programme visite centrale solaire
  qs.push(q(2, 'Q1-7', null, {
    longText:
`VISITE GUIDÉE — CENTRALE SOLAIRE LUMEX

Horaires des visites :
• Samedi et dimanche : 10 h, 14 h et 16 h
• Groupes scolaires (sur rendez-vous) : mardi et jeudi matin

Durée de la visite : 1 h 30
Nombre de participants : 15 personnes maximum par groupe
Tarifs : adulte 6 € | enfant (moins de 12 ans) 3 € | groupes scolaires gratuits

Équipements de sécurité fournis sur place (casques, gilets)
Réservation obligatoire : lumex-visite@energie-verte.fr`,
    question: "Ce document indique que les groupes scolaires…",
    optionA: "paient un tarif réduit de 3 €.",
    optionB: "peuvent visiter gratuitement sur rendez-vous.",
    optionC: "visitent les week-ends uniquement.",
    optionD: "doivent apporter leur propre équipement de sécurité.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement régie eau potable
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÉGIE MUNICIPALE DE L'EAU — Tarification 2025

Abonnement mensuel de base : 8,50 €/mois (toutes consommations)

Tranches de consommation :
• 0 à 30 m³/an : 1,20 €/m³
• 31 à 120 m³/an : 1,55 €/m³
• Au-delà de 120 m³/an : 2,10 €/m³

Taxes et redevances (obligatoires) : TVA 5,5 % + redevance agence de l'eau 0,18 €/m³

Facturation bimestrielle. Le relevé du compteur est effectué par un agent de la régie.
Réclamations : regie-eau@commune-valmont.fr`,
    question: "D'après ce document, la facturation de l'eau est effectuée…",
    optionA: "chaque mois.",
    optionB: "tous les deux mois.",
    optionC: "tous les trimestres.",
    optionD: "une fois par an.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce initiation cuisine indienne
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE CUISINE INDIENNE — Initiation et perfectionnement

Chef cuisinier originaire de Mumbai propose des cours de cuisine indienne authentique à domicile ou dans votre cuisine.

Menus proposés :
• Initiation : curry de poulet, dal, riz basmati, chapati
• Perfectionnement : biryani, samossas maison, lassi et desserts indiens

Groupes de 2 à 6 personnes maximum
Durée : 3 h incluant préparation et dégustation
Tarif : 45 €/personne — matières premières incluses
Disponible le week-end et certains soirs de semaine
Contact : chef.raj@cuisineindienne.fr`,
    question: "Ce document est…",
    optionA: "une publicité pour un restaurant indien.",
    optionB: "une annonce de cours de cuisine indienne.",
    optionC: "un menu de restaurant à domicile.",
    optionD: "une invitation à un festival gastronomique.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi panneau solaire
  qs.push(q(5, 'Q1-7', null, {
    longText:
`PANNEAU SOLAIRE PORTABLE SOLARTREK 120W — INSTALLATION

Étape 1 : Choisir l'emplacement — Orientez le panneau vers le sud avec une inclinaison de 30 à 45° par rapport à l'horizontale pour maximiser la production en France métropolitaine.

Étape 2 : Connexion — Raccordez le câble MC4 (fourni) au contrôleur de charge solaire (non fourni, à acquérir séparément).

Étape 3 : Mise en service — Connectez la batterie au contrôleur avant le panneau. Ne jamais inverser l'ordre de connexion.

⚠ Ne pas installer sous des arbres ou dans une zone d'ombre portée. Nettoyer la surface toutes les 4 à 6 semaines avec un chiffon humide.`,
    question: "Selon ce document, pour maximiser la production solaire en France, le panneau doit être…",
    optionA: "orienté vers le nord avec une inclinaison de 90°.",
    optionB: "orienté vers le sud avec une inclinaison de 30 à 45°.",
    optionC: "installé à plat sur le sol.",
    optionD: "orienté vers l'est pour capter le soleil matinal.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué compagnie aérienne
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — AéroConnect

AéroConnect annonce l'ouverture de 5 nouvelles liaisons directes à compter du 1er juin prochain :

• Paris-Orly ↔ Dakar : 4 vols/semaine (lundi, mercredi, vendredi, dimanche)
• Lyon ↔ Montréal : 3 vols/semaine (mardi, jeudi, samedi)
• Marseille ↔ Casablanca : quotidien
• Bordeaux ↔ Porto : 5 vols/semaine
• Toulouse ↔ Berlin : quotidien

Les réservations sont ouvertes dès aujourd'hui sur aeroconnect.com. Les passagers bénéficiant du statut Platine bénéficient d'un accès prioritaire à la billetterie.`,
    question: "Selon ce communiqué, la liaison Marseille-Casablanca sera proposée…",
    optionA: "3 fois par semaine.",
    optionB: "4 fois par semaine.",
    optionC: "5 fois par semaine.",
    optionD: "tous les jours.",
    correctAnswer: 'D',
  }));

  // Q7 — Invitation conférence sociologie urbaine
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Université Paris-Nanterre
Laboratoire de Sociologie Urbaine

Vous êtes invité(e) à la conférence publique

« SÉGRÉGATION SPATIALE ET MOBILITÉ SOCIALE : NOUVELLES PERSPECTIVES »

Mercredi 5 novembre — 18 h 00
Amphithéâtre B (bâtiment principal)

Intervenants :
• Pr. Sophie Durand, sociologue (CNRS)
• Dr. Karim Benali, urbaniste (Ville de Paris)

Entrée libre — inscription recommandée sur sociologie-urbaine.univ-paris.fr
Questions et débat ouvert au public en fin de séance`,
    question: "Quel est le but de ce document ?",
    optionA: "Annoncer la soutenance d'une thèse de doctorat.",
    optionB: "Inviter le public à une conférence sur la sociologie urbaine.",
    optionC: "Promouvoir un livre de sociologie.",
    optionD: "Recruter des étudiants pour un laboratoire de recherche.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les sociologues distinguent les différentes ___ sociales selon les niveaux de revenus, de diplômes et de capital culturel de leurs membres.",
    question: PHRASE_Q,
    optionA: "catégories",
    optionB: "classes",
    optionC: "couches",
    optionD: "groupes",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le chef ajoute une généreuse ___ de cardamome à la préparation pour parfumer le riz basmati de façon typiquement indienne.",
    question: PHRASE_Q,
    optionA: "pincée",
    optionB: "goutte",
    optionC: "tranche",
    optionD: "touche",
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'avion a amorcé sa ___ vers la piste d'atterrissage après avoir reçu l'autorisation du contrôle aérien.",
    question: PHRASE_Q,
    optionA: "croisière",
    optionB: "décollage",
    optionC: "approche",
    optionD: "montée",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ phréatique, principale réserve d'eau douce souterraine, se recharge lentement et doit être préservée de toute contamination.",
    question: PHRASE_Q,
    optionA: "source",
    optionB: "nappe",
    optionC: "rivière",
    optionD: "retenue",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'énergie ___ est produite par des turbines entraînées par les courants marins sous-marins, de manière analogue aux éoliennes dans l'air.",
    question: PHRASE_Q,
    optionA: "marémotrice",
    optionB: "houlomotrice",
    optionC: "hydrolienne",
    optionD: "thermique",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le poète slam s'est distingué lors du festival par la qualité de son ___ spontanée sur le thème de la mémoire collective.",
    question: PHRASE_Q,
    optionA: "lecture",
    optionB: "improvisation",
    optionC: "composition",
    optionD: "récitation",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Un panneau solaire photovoltaïque produit de l'électricité grâce à l'effet photoélectrique. Sa puissance maximale est exprimée en [14] (Wc), qui correspond à la puissance produite dans des conditions d'ensoleillement standard. Le [15] d'un panneau moderne dépasse aujourd'hui 22 %, contre seulement 6 % pour les premières cellules solaires des années 1950.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'énergie solaire photovoltaïque",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "volt-ampère",
    optionB: "kilowattheure",
    optionC: "watt-crête",
    optionD: "joule",
    correctAnswer: 'C',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'énergie solaire photovoltaïque",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "rendement",
    optionB: "voltage",
    optionC: "courant",
    optionD: "poids",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "Le slam est né dans des quartiers populaires comme forme de [16] poétique contre les élites culturelles et les inégalités sociales. Aujourd'hui institutionnalisé, il conserve néanmoins son énergie originelle lors des soirées de [17] où chacun peut monter sur scène sans invitation préalable.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le slam comme expression sociale",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "contestation",
    optionB: "célébration",
    optionC: "formation",
    optionD: "récitation",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le slam comme expression sociale",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "compétition",
    optionB: "scène ouverte",
    optionC: "formation",
    optionD: "répétition",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit une forme d'énergie marine extraite du mouvement des vagues en surface des océans ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit une cuisine végétarienne épicée du sud de l'Inde utilisant le riz, la noix de coco et les lentilles ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit une classe sociale disposant d'un patrimoine significatif mais ne faisant pas partie des ultra-riches ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit un poème japonais de 3 vers de 5-7-5 syllabes évoquant un instant de nature ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  // Q22 : Line chart
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La région A a enregistré la plus forte croissance de production solaire entre 2019 et 2023 avec une multiplication par 4,5 de sa capacité installée. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement du service public de l'eau potable",
    longText: DOC_CONTRAT_EAU,
    question: "Ce document concerne principalement…",
    optionA: "les règles d'économie d'eau en période de sécheresse.",
    optionB: "les obligations et droits des abonnés au service de l'eau potable.",
    optionC: "les procédures de raccordement au réseau d'eau.",
    optionD: "la qualité de l'eau potable et ses normes sanitaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement du service public de l'eau potable",
    longText: DOC_CONTRAT_EAU,
    question: "Selon ce règlement, qui est responsable des fuites d'eau en aval du compteur ?",
    optionA: "L'agence régionale de l'eau.",
    optionB: "La mairie.",
    optionC: "L'abonné.",
    optionD: "Le plombier agréé.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Pilote de ligne",
    longText: DOC_OFFRE_PILOTE,
    question: "Quel diplôme est obligatoirement requis pour ce poste de pilote de ligne ?",
    optionA: "Un BTS aéronautique.",
    optionB: "Une licence ATPL en état de validité.",
    optionC: "Un master en navigation aérienne.",
    optionD: "Un brevet de pilote privé.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Pilote de ligne",
    longText: DOC_OFFRE_PILOTE,
    question: "Parmi les avantages listés dans cette offre, on trouve…",
    optionA: "un logement de fonction.",
    optionB: "une voiture de service.",
    optionC: "un plan épargne retraite.",
    optionD: "une prime de déménagement.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de poète en résidence",
    longText: DOC_CONVENTION_POETE,
    question: "Cette convention engage le poète résident à…",
    optionA: "publier un recueil de poèmes pendant la résidence.",
    optionB: "animer des ateliers et participer à des lectures publiques.",
    optionC: "enseigner la poésie dans les écoles primaires.",
    optionD: "rédiger des articles pour la presse locale.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de poète en résidence",
    longText: DOC_CONVENTION_POETE,
    question: "Quelle est la durée de la résidence artistique prévue par cette convention ?",
    optionA: "2 semaines.",
    optionB: "3 semaines.",
    optionC: "4 semaines.",
    optionD: "2 mois.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement d'accès à la centrale solaire LUMEX",
    longText: DOC_REGLEMENT_SOLAIRE,
    question: "Selon ce règlement, que doit faire toute personne en cas d'accident sur le site ?",
    optionA: "Appeler directement les pompiers au 18.",
    optionB: "Intervenir immédiatement sur l'installation en cause.",
    optionC: "Activer l'alarme générale et composer le 3.",
    optionD: "Évacuer le site et attendre les secours à l'extérieur.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement d'accès à la centrale solaire LUMEX",
    longText: DOC_REGLEMENT_SOLAIRE,
    question: "Quel équipement est obligatoire à partir de la grille B ?",
    optionA: "Un gilet de sécurité.",
    optionB: "Des lunettes de protection.",
    optionC: "Des chaussures de sécurité.",
    optionD: "Un casque de protection.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note d'enquête — Mobilité sociale intergénérationnelle",
    longText: DOC_NOTE_SOCIO,
    question: "Cette note d'enquête porte principalement sur…",
    optionA: "les inégalités de salaire entre hommes et femmes.",
    optionB: "la mobilité sociale et son lien avec le niveau de diplôme des parents.",
    optionC: "l'accès à l'enseignement supérieur dans les quartiers populaires.",
    optionD: "les politiques d'intégration des immigrants dans l'emploi.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note d'enquête — Mobilité sociale intergénérationnelle",
    longText: DOC_NOTE_SOCIO,
    question: "Selon les résultats présentés, les enfants de cadres supérieurs ont combien de fois plus de probabilité d'accéder à un poste de cadre ?",
    optionA: "Deux fois.",
    optionB: "Trois fois.",
    optionC: "Quatre fois.",
    optionD: "Cinq fois.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "L'accès à l'eau potable : un droit fondamental inégalement distribué",
    longText: ART_EAU_JUSTICE,
    question: "Selon cet article, quand l'ONU a-t-elle reconnu l'accès à l'eau potable comme droit fondamental ?",
    optionA: "En 2000.",
    optionB: "En 2010.",
    optionC: "En 2015.",
    optionD: "En 2020.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "L'accès à l'eau potable : un droit fondamental inégalement distribué",
    longText: ART_EAU_JUSTICE,
    question: "L'auteur mentionne que la corvée d'eau affecte principalement…",
    optionA: "les enfants en bas âge et les personnes âgées.",
    optionB: "les femmes et les filles au détriment de leur éducation.",
    optionC: "les agriculteurs qui manquent d'eau pour irriguer.",
    optionD: "les populations urbaines défavorisées.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le slam poétique : d'une sous-culture urbaine à un art reconnu",
    longText: ART_SLAM,
    question: "Selon cet article, où le slam est-il né dans les années 1980 ?",
    optionA: "Dans les banlieues parisiennes.",
    optionB: "Dans les universités américaines.",
    optionC: "Dans les bars de Chicago.",
    optionD: "Dans les studios de rap new-yorkais.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le slam poétique : d'une sous-culture urbaine à un art reconnu",
    longText: ART_SLAM,
    question: "Selon l'article, quel débat entoure l'institutionnalisation du slam ?",
    optionA: "La question des droits d'auteur dans les performances slam.",
    optionB: "La crainte que la reconnaissance officielle dilue son énergie subversive.",
    optionC: "Le financement public des festivals de slam.",
    optionD: "L'introduction du slam dans les programmes scolaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Aviation et bilan carbone : vers une industrie plus verte ?",
    longText: ART_AVIATION_CARBONE,
    question: "Selon cet article, l'impact climatique total de l'aviation est estimé à combien de fois son seul impact en CO2 ?",
    optionA: "Deux à quatre fois supérieur.",
    optionB: "Cinq à dix fois supérieur.",
    optionC: "Dix à vingt fois supérieur.",
    optionD: "Équivalent au seul CO2.",
    correctAnswer: 'A',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Aviation et bilan carbone : vers une industrie plus verte ?",
    longText: ART_AVIATION_CARBONE,
    question: "Quel est le principal problème des carburants d'aviation durables (SAF) mentionné dans l'article ?",
    optionA: "Ils produisent plus de CO2 que le kérosène conventionnel.",
    optionB: "Leur coût de production est deux à cinq fois supérieur au kérosène.",
    optionC: "Ils ne sont pas compatibles avec les moteurs actuels.",
    optionD: "Leur fabrication nécessite de l'eau en grande quantité.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Transition énergétique et souveraineté : les enjeux géopolitiques",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "Selon cet article, quel pays détient une position dominante dans la production de panneaux solaires et de batteries ?",
    optionA: "Les États-Unis.",
    optionB: "L'Allemagne.",
    optionC: "La Chine.",
    optionD: "Le Japon.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Transition énergétique et souveraineté : les enjeux géopolitiques",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "Quel métal critique est principalement produit en Bolivie et au Chili selon l'article ?",
    optionA: "Le cobalt.",
    optionB: "Le nickel.",
    optionC: "Le lithium.",
    optionD: "Les terres rares.",
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
    console.log(`\n✅ ${created} questions créées pour CE 31.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
