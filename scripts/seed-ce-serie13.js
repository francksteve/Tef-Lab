'use strict';
/**
 * seed-ce-serie13.js
 * Peuple la série CE 13 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie13.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyofx700090wxl0gyy436z';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts ventes livres par région ── */
function generateQ22SVG() {
  // Graphique correct = C (région Ouest 42%)
  const graphs = [
    { label: 'Graphique 1', data: [28, 35, 20, 17], color: '#E30613' },
    { label: 'Graphique 2', data: [38, 25, 22, 15], color: '#E30613' },
    { label: 'Graphique 3', data: [20, 22, 42, 16], color: '#003087' }, // CORRECT: Ouest = 42%
    { label: 'Graphique 4', data: [25, 30, 28, 17], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Nord', 'Est', 'Ouest', 'Sud'];
  const maxVal = 50;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 10, 20, 30, 40, 50].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}%</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${v}%</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Ventes livres (%)</text>`;
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
  { title: 'Régime 1', content: "Le régime végétarien exclut la consommation de viande et de poisson, mais autorise les produits dérivés des animaux tels que les œufs, le lait, le fromage et le miel. Il est adopté pour des raisons éthiques, environnementales ou sanitaires." },
  { title: 'Régime 2', content: "Le régime végétalien (ou vegan) exclut tout produit d'origine animale sans exception : viande, poisson, crustacés, œufs, produits laitiers, miel. Les personnes végétaliennes adoptent souvent ce mode de vie pour des raisons éthiques liées au bien-être animal." },
  { title: 'Régime 3', content: "Le régime flexitarien est une alimentation essentiellement végétale qui tolère une consommation occasionnelle de viande ou de poisson. Il ne comporte pas de règle stricte et vise à réduire progressivement la part des protéines animales dans l'alimentation." },
  { title: 'Régime 4', content: "Le régime méditerranéen valorise les huiles végétales (surtout l'huile d'olive), les légumes, les légumineuses, les céréales complètes et le poisson. La viande rouge est consommée avec modération. Ce régime est reconnu pour ses bienfaits cardiovasculaires." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Genre 1', content: "Le roman de science-fiction explore des univers futuristes ou alternatifs, souvent fondés sur des avancées technologiques ou scientifiques hypothétiques. Les thèmes récurrents incluent l'intelligence artificielle, les voyages spatiaux, les dystopies et les contacts extraterrestres." },
  { title: 'Genre 2', content: "Le roman historique se déroule dans une période passée reconstituée avec soin. L'auteur mêle des personnages fictifs à des événements et personnages historiques réels. Ce genre permet d'explorer des époques révolues à travers une intrigue narrative." },
  { title: 'Genre 3', content: "Le roman policier met en scène une enquête criminelle menée par un détective, un inspecteur ou un amateur éclairé. L'intrigue tourne autour d'un crime à résoudre, avec des indices, des suspects et des rebondissements jusqu'à la révélation finale du coupable." },
  { title: 'Genre 4', content: "Le roman sentimental se concentre sur les relations amoureuses et émotionnelles entre les personnages. L'histoire suit généralement l'évolution d'une histoire d'amour à travers des obstacles, des séparations et des retrouvailles. Il vise à susciter l'émotion du lecteur." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Commerce 1', content: "La boutique indépendante est un commerce appartenant à un propriétaire unique qui gère librement son enseigne, ses prix et sa politique commerciale. Elle n'est affiliée à aucun réseau et peut se spécialiser dans des produits de niche ou artisanaux." },
  { title: 'Commerce 2', content: "La coopérative commerciale est une structure détenue collectivement par ses membres (producteurs ou consommateurs) qui participent aux décisions et partagent les bénéfices. Les prix sont souvent plus équitables car la marge des intermédiaires est réduite." },
  { title: 'Commerce 3', content: "La franchise est un système commercial dans lequel un franchisé utilise l'enseigne, le savoir-faire et les produits d'un franchiseur sous licence, moyennant le paiement de redevances. Le franchisé bénéficie d'une marque connue mais doit respecter le cahier des charges du réseau." },
  { title: 'Commerce 4', content: "Le commerce en ligne (ou e-commerce) permet la vente de produits via une plateforme internet, sans nécessité de magasin physique. Les commandes sont passées et payées en ligne, puis expédiées au domicile du client. Il connaît une croissance rapide depuis dix ans." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Spécialité 1', content: "La pneumologie est la spécialité médicale dédiée aux maladies de l'appareil respiratoire : poumons, bronches, trachée. Elle traite l'asthme, la bronchite chronique, la pneumonie, le cancer du poumon et les troubles du sommeil liés à la respiration." },
  { title: 'Spécialité 2', content: "La neurologie s'intéresse aux maladies du système nerveux central et périphérique : cerveau, moelle épinière, nerfs. Elle traite l'épilepsie, la sclérose en plaques, la maladie de Parkinson, les AVC et les migraines chroniques." },
  { title: 'Spécialité 3', content: "La cardiologie est la branche de la médecine consacrée à l'étude et au traitement des maladies du cœur et du système cardiovasculaire. Elle prend en charge l'insuffisance cardiaque, l'infarctus du myocarde, les troubles du rythme et l'hypertension artérielle." },
  { title: 'Spécialité 4', content: "La dermatologie traite les maladies de la peau, des cheveux et des ongles. Parmi les pathologies fréquentes : eczéma, psoriasis, acné, mélanome et infections cutanées. Le dermatologue réalise aussi des actes esthétiques comme l'ablation de grains de beauté." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_SYNDIC =
`RÈGLEMENT INTÉRIEUR — SYNDICAT DE COPROPRIÉTÉ RÉSIDENCE DES PINS

ARTICLE 1 — PARTIES COMMUNES
Les halls d'entrée, escaliers, couloirs et espaces verts sont des parties communes. Leur entretien est assuré par le syndic. Il est interdit d'y déposer des objets personnels ou d'y garer des véhicules.

ARTICLE 2 — NUISANCES SONORES
Toute activité générant des nuisances sonores est interdite entre 22 h et 7 h les jours ouvrables, et entre 23 h et 8 h les week-ends et jours fériés. Les travaux bruyants sont autorisés uniquement de 8 h à 12 h et de 14 h à 18 h en semaine.

ARTICLE 3 — ANIMAUX
Les animaux domestiques sont autorisés à condition de ne pas causer de nuisances. Ils doivent être tenus en laisse dans les parties communes.`;

const DOC_OFFRE_EMPLOI_ARCHI =
`OFFRE D'EMPLOI — ARCHITECTE JUNIOR (H/F)

Cabinet d'architecture renommé, spécialisé dans la rénovation de bâtiments historiques et l'éco-construction, recrute un(e) architecte junior pour son agence parisienne.

MISSIONS : Élaboration des plans et permis de construire, suivi de chantier, coordination avec les artisans et ingénieurs, relation avec la maîtrise d'ouvrage.

PROFIL RECHERCHÉ : Diplôme d'État d'architecte (HMONP apprécié), maîtrise des logiciels AutoCAD et Revit indispensable, première expérience en rénovation souhaitée. Sens du détail, rigueur et goût pour le patrimoine.

CONDITIONS : CDI, salaire selon grille conventionnelle + prime de bilan. Mutuelle et tickets restaurant.`;

const DOC_NOTICE_MEDICAMENT =
`NOTICE D'UTILISATION — IBUPROFÈNE 400 mg COMPRIMÉS

INDICATIONS : Traitement symptomatique des douleurs d'intensité légère à modérée et/ou des états fébriles.

POSOLOGIE : Adultes et adolescents de plus de 15 ans : 1 comprimé toutes les 6 heures si nécessaire. Ne pas dépasser 3 comprimés par jour. Prendre pendant les repas avec un grand verre d'eau.

CONTRE-INDICATIONS : Ne pas utiliser en cas d'allergie aux AINS, d'ulcère gastrique actif, d'insuffisance rénale sévère, pendant le 3e trimestre de grossesse.

EFFETS INDÉSIRABLES : Troubles digestifs possibles. En cas d'effets graves, consulter immédiatement un médecin.`;

const DOC_CONTRAT_SALLE_SPORT =
`CONTRAT D'ABONNEMENT — FIT CLUB PREMIUM

Abonné : Mme Sophie MARTIN
Formule : Pack Annuel — Accès illimité toutes salles
Durée : 12 mois à compter du 1er mars
Tarif : 60 €/mois prélevé le 1er de chaque mois

CONDITIONS DE RÉSILIATION : La résiliation est possible après les 3 premiers mois, moyennant un préavis d'un mois par courrier recommandé. En cas de résiliation anticipée durant la période minimale, des frais de rupture de contrat correspondant aux 3 mois restants seront facturés.

SERVICES INCLUS : Accès salle de musculation, cours collectifs, sauna, piscine. Bilan forme offert à l'inscription.`;

const DOC_CHARTE_ECO =
`CHARTE D'ÉCO-RESPONSABILITÉ — ENTREPRISE VERTE SOLUTIONS

Dans le cadre de notre politique RSE (Responsabilité Sociétale des Entreprises), nous nous engageons à :

ENVIRONNEMENT : Réduire notre empreinte carbone de 30 % d'ici 2027 en optimisant les déplacements professionnels et en recourant aux énergies renouvelables pour nos locaux.

DÉCHETS : Mettre en place le tri sélectif dans tous nos bureaux, viser zéro déchet plastique à usage unique d'ici 2025.

FOURNISSEURS : Privilégier les fournisseurs locaux et certifiés ISO 14001 pour nos achats de fournitures et de services.

COLLABORATEURS : Former l'ensemble du personnel aux éco-gestes et intégrer des critères environnementaux dans les évaluations annuelles.`;

/* ── Articles de presse Q33-40 ── */
const ART_REFORME_EDUC =
`LA RÉFORME DU SYSTÈME ÉDUCATIF FRANÇAIS : ENJEUX ET CONTROVERSES

La réforme du système éducatif français, amorcée ces dernières années, vise à adapter l'école aux réalités du XXIe siècle. Les priorités affichées sont claires : renforcer les fondamentaux (lire, écrire, compter), réduire les inégalités entre établissements et développer les compétences numériques des élèves. Mais entre les annonces politiques et la réalité des classes, un fossé persiste.

Les enseignants se trouvent au cœur de ces transformations, souvent sans les formations et les ressources nécessaires pour les mettre en œuvre. De nombreux professeurs déplorent une succession de réformes mal coordonnées qui complexifient leur travail sans améliorer les résultats des élèves. Les enquêtes internationales PISA confirment une stagnation, voire un recul, des performances françaises dans plusieurs domaines clés.

Pourtant, certaines initiatives portent leurs fruits. Les dédoublements de classes en CP et CE1 dans les zones d'éducation prioritaire ont montré des effets positifs mesurables sur les apprentissages fondamentaux. Les expériences d'autonomie accordées à certains établissements permettent une meilleure adaptation aux besoins locaux.

Le débat de fond reste entier : faut-il réformer les programmes, les méthodes pédagogiques, la formation des enseignants, ou tout cela simultanément ? La réponse exige un consensus politique et social durable, difficile à obtenir dans un contexte de polarisation croissante des positions idéologiques sur l'éducation.`;

const ART_BIOTECH_ALIMENTAIRE =
`LES BIOTECHNOLOGIES ALIMENTAIRES : ENTRE INNOVATION ET MÉFIANCE DU CONSOMMATEUR

Les biotechnologies alimentaires transforment en profondeur les modes de production agricole et les caractéristiques des aliments que nous consommons. Des organismes génétiquement modifiés (OGM) aux nouvelles techniques génomiques (NGT) comme CRISPR-Cas9, en passant par la fermentation de précision qui permet de produire des protéines animales sans élevage, le champ des possibles s'est considérablement élargi.

Les arguments en faveur de ces technologies sont substantiels : amélioration de la résistance des cultures aux maladies et aux conditions climatiques extrêmes, réduction de l'utilisation des pesticides, production d'aliments à valeur nutritionnelle renforcée, réponse à la demande alimentaire mondiale croissante. Les tenants des biotechnologies voient en elles un levier essentiel pour nourrir une planète de dix milliards d'habitants d'ici 2050.

Les opposants, eux, soulèvent des questions fondamentales. Les effets à long terme des aliments issus de la biotechnologie sur la santé humaine sont insuffisamment documentés. Les risques de contamination des espèces sauvages par des variétés génétiquement modifiées sont réels. Par ailleurs, la concentration du pouvoir économique entre les mains de quelques grandes firmes semencières soulève des enjeux de souveraineté alimentaire.

L'encadrement réglementaire, particulièrement strict en Europe, tente de concilier innovation et précaution. Mais le débat public reste vif, influencé autant par la science que par des considérations éthiques, culturelles et économiques.`;

const ART_PATRIMOINE_CULTUREL =
`LE PATRIMOINE CULTUREL IMMATÉRIEL : UN TRÉSOR À PRÉSERVER POUR LES GÉNÉRATIONS FUTURES

Le patrimoine culturel immatériel (PCI) regroupe l'ensemble des pratiques, représentations, expressions, connaissances et savoir-faire que les communautés reconnaissent comme faisant partie de leur héritage culturel. Contrairement aux monuments et aux objets, il vit dans les gestes des artisans, les paroles des conteurs, les pas des danseurs et les recettes des cuisinières.

Depuis l'adoption de la Convention pour la sauvegarde du PCI par l'UNESCO en 2003, plus de 170 pays se sont engagés à identifier, documenter et promouvoir cet héritage vivant. La liste représentative du PCI de l'humanité compte aujourd'hui plus de 600 éléments : du carnaval de Binche en Belgique à la flûte de roseau turque, en passant par la cérémonie du thé japonaise et la cuisine gastronomique française.

Les défis sont multiples. La mondialisation culturelle et l'urbanisation accélérée fragilisent des traditions séculaires. Quand les jeunes générations migrent vers les villes, les porteurs de traditions restent de moins en moins nombreux. La transmission intergénérationnelle, essence même du PCI, se fragilise.

Des programmes innovants tentent d'inverser cette tendance : ateliers de transmission dans les écoles, résidences d'artisans traditionnels, documentation audiovisuelle des pratiques menacées, valorisation économique par le tourisme culturel responsable. La sauvegarde du PCI n'est pas qu'une affaire de nostalgie : c'est un enjeu de diversité culturelle et d'identité collective.`;

const ART_MOBILITE_ELECTRIQUE =
`LA MOBILITÉ ÉLECTRIQUE : ACCÉLÉRATION HISTORIQUE ET DÉFIS STRUCTURELS

La transition vers la mobilité électrique s'accélère à un rythme sans précédent. En Europe, les ventes de véhicules électriques ont bondi de 55 % en 2023, portées par les incitations fiscales, le renforcement des normes d'émissions et la baisse progressive des prix des batteries. Plusieurs constructeurs automobiles ont annoncé la fin de la production de véhicules thermiques avant 2035, se conformant aux exigences réglementaires européennes.

Les avantages environnementaux sont réels mais nuancés. Un véhicule électrique rechargé avec de l'électricité produite à partir d'énergies renouvelables émet deux à quatre fois moins de CO2 sur l'ensemble de son cycle de vie qu'un véhicule thermique équivalent. Mais dans les pays où la production électrique repose encore massivement sur le charbon, le bilan est moins favorable.

Les obstacles restent nombreux. Le réseau de bornes de recharge est insuffisant, particulièrement en zone rurale et dans les pays d'Europe de l'Est. L'autonomie réelle des véhicules par grand froid ou sur autoroute à vitesse soutenue déçoit encore certains utilisateurs. La question du recyclage des batteries et de l'approvisionnement en métaux rares (lithium, cobalt) soulève des préoccupations géopolitiques et environnementales croissantes.

La mobilité électrique n'est pas une solution miracle mais une pièce essentielle du puzzle de la décarbonation des transports. Son succès dépendra autant des choix technologiques que des politiques publiques d'infrastructure et des évolutions des comportements de mobilité.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Menu gastronomique
  qs.push(q(1, 'Q1-7', null, {
    longText:
`RESTAURANT L'ATELIER DU CHEF — Menu Gastronomique — 55 €

ENTRÉES :
• Velouté de homard, crème légère au cognac
• Foie gras de canard, chutney de figues et brioche grillée

PLATS :
• Filet de bœuf Rossini, sauce périgueux et pommes sarladaises
• Saint-Jacques poêlées, risotto à l'encre de seiche, émulsion au champagne

FROMAGES : Sélection affinée de notre crémier

DESSERTS :
• Soufflé au Grand Marnier, glace vanille Bourbon
• Tarte fine aux fruits de saison, sorbet citron vert

Accord mets-vins disponible : +35 €`,
    question: "Ce document est…",
    optionA: "une critique gastronomique parue dans un magazine.",
    optionB: "un menu de restaurant avec les plats et les prix.",
    optionC: "une recette de cuisine professionnelle.",
    optionD: "une liste de courses pour un repas de fête.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche festival cinéma
  qs.push(q(2, 'Q1-7', null, {
    longText:
`FESTIVAL INTERNATIONAL DU FILM FRANCOPHONE
17e ÉDITION — Du 5 au 12 octobre

Sélection officielle : 48 films de 22 pays
Compétition longs métrages | Courts métrages | Documentaires

SOIRÉES SPÉCIALES :
• Ouverture : Cinéma en plein air — Parc de la Ville — 20 h 30 (entrée libre)
• Hommage à Jacques Demy — samedi 8 octobre

TARIFS : 8 € la séance | Pass 5 films : 30 € | Pass festival illimité : 55 €
Renseignements : festivalfilm.fr | billetterie@festivalfilm.fr`,
    question: "Selon ce document, la soirée d'ouverture est…",
    optionA: "payante et réservée aux acheteurs de pass festival.",
    optionB: "accessible gratuitement au parc de la ville.",
    optionC: "organisée dans une grande salle de cinéma.",
    optionD: "réservée aux professionnels du cinéma.",
    correctAnswer: 'B',
  }));

  // Q3 — Guide touristique architectural
  qs.push(q(3, 'Q1-7', null, {
    longText:
`GUIDE DU VISITEUR — CATHÉDRALE SAINT-ÉTIENNE

Joyau de l'art gothique médiéval, la cathédrale Saint-Étienne a été construite entre le XIIIe et le XVe siècle. Sa façade occidentale, ornée de trois portails sculptés, est considérée comme l'une des plus belles d'Europe.

À L'INTÉRIEUR : vitraux du XIIIe siècle classés monument historique, orgue du XVIIIe siècle, crypte romane accessible sur visite guidée.

VISITES GUIDÉES : tous les jours à 10 h et 15 h — durée 1 h — gratuit le dimanche
CONCERTS D'ORGUE : premier vendredi du mois à 18 h 30 — entrée libre`,
    question: "D'après ce guide, les vitraux de la cathédrale sont…",
    optionA: "des ajouts modernes du XXe siècle.",
    optionB: "classés monument historique depuis le XIIIe siècle.",
    optionC: "uniquement visibles lors des visites nocturnes.",
    optionD: "en cours de restauration et non accessibles.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce librairie
  qs.push(q(4, 'Q1-7', null, {
    longText:
`LIBRAIRIE LE BOUQUINISTE — VENTE ET REPRISE DE LIVRES D'OCCASION

Nous achetons et revendons des livres d'occasion en bon état dans toutes les catégories : romans, essais, livres d'art, bandes dessinées, livres scolaires.

REPRISE : Apportez vos livres du lundi au samedi. Estimation gratuite et immédiate. Paiement en espèces ou en bon d'achat majoré de 20 %.

VENTE : Des milliers de titres à partir de 1 €. Remise de 10 % sur tout achat supérieur à 20 €.

25, rue de la Paix — Ouvert 10 h-19 h du lundi au samedi — Fermé le dimanche`,
    question: "Cette annonce propose…",
    optionA: "l'édition et la vente de livres neufs.",
    optionB: "la reprise et la vente de livres d'occasion.",
    optionC: "des cours de lecture et d'écriture.",
    optionD: "l'abonnement à un club de lecture mensuel.",
    correctAnswer: 'B',
  }));

  // Q5 — Communiqué musée (exposition temporaire)
  qs.push(q(5, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — MUSÉE DES BEAUX-ARTS

EXPOSITION TEMPORAIRE : « Couleurs du Monde — Peintures contemporaines africaines »
Du 15 novembre au 28 février

Le Musée des Beaux-Arts a le plaisir d'annoncer l'ouverture d'une exposition exceptionnelle rassemblant 85 œuvres d'artistes africains contemporains issus de 18 pays.

Cette exposition itinérante, déjà présentée à Berlin et Amsterdam, explore les thèmes de l'identité, de la mémoire et du territoire à travers des techniques mixtes et des formats monumentaux.

Vernissage : jeudi 14 novembre à 18 h — sur invitation
Ouvert au public à partir du 15 novembre. Tarif inclus dans le billet du musée.`,
    question: "Selon ce communiqué, cette exposition…",
    optionA: "est présentée pour la première fois dans le monde.",
    optionB: "a déjà été présentée à Berlin et Amsterdam.",
    optionC: "nécessite un billet supplémentaire.",
    optionD: "réunit uniquement des artistes français d'origine africaine.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi purificateur d'air
  qs.push(q(6, 'Q1-7', null, {
    longText:
`PURIFICATEUR D'AIR FRESHAIR PRO — GUIDE D'UTILISATION

1. Placez l'appareil dans une pièce fermée, loin des murs (min. 30 cm) et des sources de chaleur.
2. Branchez sur une prise 220 V et appuyez sur le bouton ON.
3. Sélectionnez la vitesse souhaitée : I (silencieux), II (standard), III (puissant).
4. Pour les nuits, activez le mode SLEEP : ventilation minimale, écran éteint.
5. Nettoyage du filtre HEPA : tous les 3 mois. Remplacement : tous les 12 mois.

⚠ Ne jamais couvrir les grilles d'aération. Ne pas utiliser en présence de gaz inflammables.`,
    question: "Ce document est…",
    optionA: "une publicité pour un purificateur d'air.",
    optionB: "un guide d'utilisation d'un appareil électroménager.",
    optionC: "un rapport sur la qualité de l'air intérieur.",
    optionD: "un contrat de garantie pour un appareil.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation vernissage
  qs.push(q(7, 'Q1-7', null, {
    longText:
`La Galerie Espace Art & Lumière
a le plaisir de vous convier au vernissage de l'exposition

« FRAGMENTS »
œuvres récentes de l'artiste peintre Naomi CHEN

Le jeudi 20 mars à 18 h 30
11, rue des Artistes — Paris 11e

En présence de l'artiste
Verre de bienvenue offert

RSVP avant le 15 mars : contact@galerieartlumiere.fr
L'exposition sera visible jusqu'au 15 avril
Du mardi au samedi, 11 h-19 h — Entrée libre`,
    question: "Cette invitation est pour…",
    optionA: "l'inauguration d'une nouvelle galerie d'art.",
    optionB: "un vernissage d'exposition de peinture.",
    optionC: "une vente aux enchères d'œuvres d'art.",
    optionD: "un atelier de peinture ouvert au public.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ d'une viande avant cuisson permet d'attendrir les fibres musculaires et d'en intensifier la saveur grâce aux aromates et aux acides utilisés.",
    question: PHRASE_Q,
    optionA: "congélation",
    optionB: "marinade",
    optionC: "cuisson",
    optionD: "conservation",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ d'un bâtiment, qu'elle soit en pierre, en verre ou en bois, définit son identité visuelle et protège la structure des intempéries.",
    question: PHRASE_Q,
    optionA: "toiture",
    optionB: "fondation",
    optionC: "façade",
    optionD: "charpente",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ d'un film est l'étape créative qui transforme une idée en récit structuré destiné à être tourné par le réalisateur.",
    question: PHRASE_Q,
    optionA: "projection",
    optionB: "distribution",
    optionC: "réalisation",
    optionD: "scénarisation",
    correctAnswer: 'D',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant le début de chaque saison, le responsable du magasin procède à un ___ complet des articles disponibles pour ajuster les commandes fournisseurs.",
    question: PHRASE_Q,
    optionA: "inventaire",
    optionB: "budget",
    optionC: "catalogue",
    optionD: "bilan",
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Face aux ___ présentés par le patient, le médecin a prescrit une série d'analyses biologiques avant de poser un diagnostic définitif.",
    question: PHRASE_Q,
    optionA: "antécédents",
    optionB: "symptômes",
    optionC: "résultats",
    optionD: "traitements",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ d'un sol contaminé par des hydrocarbures nécessite l'intervention de spécialistes utilisant des techniques biologiques et chimiques avancées.",
    question: PHRASE_Q,
    optionA: "analyse",
    optionB: "surveillance",
    optionC: "dépollution",
    optionD: "irrigation",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "L'essor de l'alimentation biologique s'explique par une prise de conscience croissante des consommateurs. En [14] biologique, on renonce à l'utilisation de produits chimiques de synthèse. Cette démarche vise à protéger l'environnement et à produire des aliments sans résidus de [15] potentiellement nocifs pour la santé.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'alimentation biologique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "industrie",
    optionB: "agriculture",
    optionC: "élevage",
    optionD: "commerce",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'alimentation biologique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "vitamines",
    optionB: "additifs",
    optionC: "pesticides",
    optionD: "conservateurs",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le développement durable en entreprise se mesure notamment par le [16] carbone annuel, qui évalue l'impact environnemental des activités. Les sociétés sont de plus en plus nombreuses à publier leur [17] écologique afin de rendre compte de leur consommation d'énergie, d'eau et de leurs émissions de gaz à effet de serre.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le développement durable en entreprise",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "budget",
    optionB: "rapport",
    optionC: "bilan",
    optionD: "audit",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le développement durable en entreprise",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "empreinte",
    optionB: "politique",
    optionC: "stratégie",
    optionD: "performance",
    correctAnswer: 'A',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel régime alimentaire exclut tout produit d'origine animale sans exception ?",
    optionA: "Régime 1",
    optionB: "Régime 2",
    optionC: "Régime 3",
    optionD: "Régime 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel genre littéraire met en scène une enquête criminelle ?",
    optionA: "Genre 1",
    optionB: "Genre 2",
    optionC: "Genre 3",
    optionD: "Genre 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel type de commerce utilise une enseigne sous licence d'un réseau ?",
    optionA: "Commerce 1",
    optionB: "Commerce 2",
    optionC: "Commerce 3",
    optionD: "Commerce 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle spécialité médicale traite les maladies du cœur ?",
    optionA: "Spécialité 1",
    optionB: "Spécialité 2",
    optionC: "Spécialité 3",
    optionD: "Spécialité 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La région Ouest représente le plus grand marché pour la littérature francophone avec 42 % des ventes nationales. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Syndicat de copropriété Résidence des Pins",
    longText: DOC_REGLEMENT_SYNDIC,
    question: "Ce règlement traite principalement…",
    optionA: "des procédures de vente des appartements.",
    optionB: "des droits de vote à l'assemblée générale.",
    optionC: "des règles de vie commune dans la résidence.",
    optionD: "des travaux de rénovation prévus.",
    correctAnswer: 'C',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Syndicat de copropriété Résidence des Pins",
    longText: DOC_REGLEMENT_SYNDIC,
    question: "Selon le règlement, les travaux bruyants sont autorisés…",
    optionA: "uniquement le samedi matin.",
    optionB: "de 8 h à 12 h et de 14 h à 18 h en semaine.",
    optionC: "à toute heure avec accord du syndic.",
    optionD: "uniquement pendant les vacances scolaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Architecte junior",
    longText: DOC_OFFRE_EMPLOI_ARCHI,
    question: "Ce cabinet d'architecture est spécialisé dans…",
    optionA: "la construction de logements sociaux neufs.",
    optionB: "la rénovation de bâtiments historiques et l'éco-construction.",
    optionC: "l'urbanisme et les projets d'infrastructure publique.",
    optionD: "la décoration intérieure et l'aménagement d'espaces.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Architecte junior",
    longText: DOC_OFFRE_EMPLOI_ARCHI,
    question: "Parmi les logiciels requis pour ce poste, on trouve…",
    optionA: "Photoshop et Illustrator.",
    optionB: "AutoCAD et Revit.",
    optionC: "Excel et PowerPoint.",
    optionD: "SketchUp et 3ds Max.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Notice médicament — Ibuprofène 400 mg",
    longText: DOC_NOTICE_MEDICAMENT,
    question: "Ce médicament est indiqué pour…",
    optionA: "les infections bactériennes et les maladies chroniques.",
    optionB: "les douleurs légères à modérées et les états fébriles.",
    optionC: "les maladies cardiovasculaires uniquement.",
    optionD: "la prévention des allergies saisonnières.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Notice médicament — Ibuprofène 400 mg",
    longText: DOC_NOTICE_MEDICAMENT,
    question: "Selon la notice, ce médicament est contre-indiqué…",
    optionA: "chez les personnes âgées de plus de 65 ans.",
    optionB: "lors du 3e trimestre de grossesse.",
    optionC: "en cas de rhume sans fièvre.",
    optionD: "après un repas copieux.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Contrat d'abonnement — Fit Club Premium",
    longText: DOC_CONTRAT_SALLE_SPORT,
    question: "Ce contrat d'abonnement est d'une durée de…",
    optionA: "6 mois renouvelables.",
    optionB: "12 mois à compter du 1er mars.",
    optionC: "1 mois avec reconduction tacite.",
    optionD: "3 mois avec option de prolongation.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Contrat d'abonnement — Fit Club Premium",
    longText: DOC_CONTRAT_SALLE_SPORT,
    question: "Selon le contrat, la résiliation anticipée durant la période minimale…",
    optionA: "est gratuite si elle est faite par courrier recommandé.",
    optionB: "entraîne des frais correspondant aux 3 mois restants.",
    optionC: "est impossible et non prévue au contrat.",
    optionD: "donne droit à un remboursement partiel.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Charte d'éco-responsabilité — Verte Solutions",
    longText: DOC_CHARTE_ECO,
    question: "Cette charte présente principalement…",
    optionA: "les objectifs financiers de l'entreprise pour 2027.",
    optionB: "les engagements environnementaux et sociaux de l'entreprise.",
    optionC: "les règles d'utilisation des équipements informatiques.",
    optionD: "les procédures de recrutement éco-responsable.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Charte d'éco-responsabilité — Verte Solutions",
    longText: DOC_CHARTE_ECO,
    question: "Selon cette charte, l'objectif concernant le plastique est…",
    optionA: "de réduire de 50 % les emballages plastique d'ici 2030.",
    optionB: "d'atteindre zéro déchet plastique à usage unique d'ici 2025.",
    optionC: "de remplacer tous les plastiques par du verre en 2026.",
    optionD: "de recycler 80 % des déchets plastiques produits.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La réforme du système éducatif français : enjeux et controverses",
    longText: ART_REFORME_EDUC,
    question: "Selon cet article, les enquêtes PISA concernant la France indiquent…",
    optionA: "une amélioration significative des résultats en mathématiques.",
    optionB: "une stagnation voire un recul dans plusieurs domaines clés.",
    optionC: "que la France est désormais première en Europe.",
    optionD: "que les élèves français lisent mieux que la moyenne européenne.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La réforme du système éducatif français : enjeux et controverses",
    longText: ART_REFORME_EDUC,
    question: "Quelle mesure est présentée dans l'article comme ayant montré des effets positifs ?",
    optionA: "La suppression des devoirs à domicile.",
    optionB: "Le dédoublement des classes en CP et CE1 en zones prioritaires.",
    optionC: "L'introduction de tablettes numériques dans toutes les classes.",
    optionD: "L'allongement de la durée scolaire hebdomadaire.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Les biotechnologies alimentaires : entre innovation et méfiance",
    longText: ART_BIOTECH_ALIMENTAIRE,
    question: "Selon cet article, parmi les avantages avancés des biotechnologies alimentaires, on trouve…",
    optionA: "la réduction du prix des aliments dans les supermarchés.",
    optionB: "la résistance améliorée des cultures aux maladies et aux conditions climatiques.",
    optionC: "l'élimination totale de l'utilisation des pesticides.",
    optionD: "la suppression des allergies alimentaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Les biotechnologies alimentaires : entre innovation et méfiance",
    longText: ART_BIOTECH_ALIMENTAIRE,
    question: "D'après l'article, quelle critique est formulée envers les grandes firmes semencières ?",
    optionA: "Elles vendent des semences à des prix trop élevés pour les agriculteurs.",
    optionB: "Leur concentration du pouvoir économique soulève des enjeux de souveraineté alimentaire.",
    optionC: "Elles refusent de partager leurs recherches avec les pays en développement.",
    optionD: "Elles ignorent délibérément les normes de sécurité alimentaire.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Le patrimoine culturel immatériel : un trésor à préserver",
    longText: ART_PATRIMOINE_CULTUREL,
    question: "Selon cet article, la Convention de l'UNESCO pour la sauvegarde du PCI a été adoptée en…",
    optionA: "1972.",
    optionB: "1989.",
    optionC: "2003.",
    optionD: "2010.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Le patrimoine culturel immatériel : un trésor à préserver",
    longText: ART_PATRIMOINE_CULTUREL,
    question: "D'après l'article, quel facteur fragilise principalement la transmission du patrimoine immatériel ?",
    optionA: "Le manque de financement des gouvernements.",
    optionB: "La migration des jeunes générations vers les villes.",
    optionC: "La disparition des langues régionales.",
    optionD: "Le désintérêt des touristes pour les traditions locales.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La mobilité électrique : accélération historique et défis structurels",
    longText: ART_MOBILITE_ELECTRIQUE,
    question: "Selon cet article, les ventes de véhicules électriques en Europe en 2023 ont…",
    optionA: "diminué de 10 % par rapport à l'année précédente.",
    optionB: "stagné en raison du manque de bornes de recharge.",
    optionC: "bondi de 55 %.",
    optionD: "atteint 100 % des nouvelles immatriculations.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La mobilité électrique : accélération historique et défis structurels",
    longText: ART_MOBILITE_ELECTRIQUE,
    question: "L'article mentionne comme préoccupation géopolitique et environnementale…",
    optionA: "l'augmentation du prix du pétrole.",
    optionB: "l'approvisionnement en métaux rares pour les batteries.",
    optionC: "la dépendance aux constructeurs asiatiques.",
    optionD: "la saturation du réseau électrique lors des recharges.",
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
    console.log(`\n✅ ${created} questions créées pour CE 13.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
