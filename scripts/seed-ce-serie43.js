'use strict';
/**
 * seed-ce-serie43.js
 * Peuple la série CE 43 avec 40 questions TEF Canada officielles.
 * Thèmes : psychologie positive, cuisine méditerranéenne orientale, droit numérique,
 *          équitation, océanographie, jardinage biodynamique, festivals de musique
 * Usage : node scripts/seed-ce-serie43.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyolm200130wxl2nkcdxhs';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART — fréquentation festivals musique par genre ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [4.1, 2.3, 1.8, 1.2], color: '#E30613' },
    { label: 'Graphique 2', data: [3.5, 2.3, 1.5, 0.8], color: '#003087' }, // CORRECT — électronique 2e + forte croissance
    { label: 'Graphique 3', data: [4.1, 1.2, 2.3, 1.8], color: '#E30613' },
    { label: 'Graphique 4', data: [1.8, 2.3, 4.1, 1.2], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Rock', 'Électro', 'Jazz', 'Folk'];
  const maxVal = 5;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 48, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 1, 2, 3, 4, 5].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}M</text>`;
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Festivaliers (millions)</text>`;
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
  { title: 'Texte 1', content: "La cuisine turque est l'héritière de la grande tradition culinaire ottomane. Elle associe des ingrédients méditerranéens (aubergines, poivrons, agneau, yaourt) à des techniques de cuisson raffinées. Le mezze turc, servi en guise d'entrée, comprend de nombreuses petites assiettes : cacık (yaourt concombre), patlıcan (aubergine fumée), börek (feuilletés au fromage)." },
  { title: 'Texte 2', content: "La cuisine libanaise est la quintessence de la gastronomie du Levant. Elle est célèbre pour ses mezzés partagés : houmous (purée de pois chiches), taboulé (persil, boulgour, citron), kebbé (boulettes de viande et de boulgour) et fatouche (salade de légumes au pain grillé). Le pain pita et l'huile d'olive sont omniprésents. Elle est reconnue pour son équilibre nutritionnel et ses saveurs fraîches." },
  { title: 'Texte 3', content: "La cuisine grecque est l'une des plus anciennes de la Méditerranée, fondée sur la triade huile d'olive, pain et vin. La moussaka (gratin d'aubergines et d'agneau), la souvlaki (brochettes grillées) et la salade grecque (tomates, concombre, olives, feta) en sont les représentants mondiaux les plus connus. La cuisine des îles grecques diffère légèrement de celle du continent." },
  { title: 'Texte 4', content: "La cuisine palestinienne partage de nombreux points communs avec les cuisines voisines du Levant mais conserve ses spécificités régionales. La mansaf (agneau mijoté dans du lait fermenté de brebis servi sur du riz) est le plat emblématique des fêtes. Le maqluba (ragoût de riz renversé) et le musakhan (poulet aux oignons et sumac sur pain taboon) font partie du patrimoine culinaire quotidien." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "Le concours hippique de saut d'obstacles consiste à franchir une série d'obstacles (haies, oxers, combinaisons) dans un ordre précis et sans pénalité. Chaque barre renversée coûte 4 points de pénalité, et chaque refus de franchissement 4 points supplémentaires. Le chronomètre détermine le classement à égalité de points." },
  { title: 'Texte 2', content: "Le dressage équestre est une discipline olympique qui note la précision des mouvements exécutés par le cheval et la qualité de l'harmonie entre le cavalier et sa monture. Les juges notent des figures imposées (piaffer, passage, pirouette) sur une échelle de 0 à 10. Le Grand Prix Spécial est l'épreuve suprême du dressage international." },
  { title: 'Texte 3', content: "Le cross équestre, ou concours complet, est l'épreuve la plus exigeante de l'équitation olympique. Elle combine le dressage, le cross-country (parcours en pleine nature avec obstacles naturels) et le saut d'obstacles. Elle teste la polyvalence du cheval et du cavalier sur trois journées consécutives et représente l'ultime défi de l'équitation." },
  { title: 'Texte 4', content: "La voltige équestre est une discipline acrobatique où les performers effectuent des exercices gymnastico-acrobatiques sur le dos d'un cheval en mouvement circulaire (galop). Elle se pratique en individuel, en binôme ou en équipe de 6 à 8 personnes. Les figures sont notées sur leur amplitude, leur précision et l'harmonie avec le cheval." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "La biodynamie est une approche agricole holistique développée par Rudolf Steiner dans les années 1920. Elle va au-delà de l'agriculture biologique en intégrant les cycles cosmiques (phases lunaires, positions planétaires) dans les décisions culturales. Des préparations à base de plantes et de matières organiques renforcent la vie du sol et la vitalité des plantes." },
  { title: 'Texte 2', content: "L'agroforesterie consiste à associer des arbres ou des arbustes avec des cultures agricoles ou de l'élevage dans un même espace. Cette approche imite les systèmes naturels et permet de limiter l'érosion, d'améliorer la fertilité des sols, de séquestrer du carbone et de diversifier les productions. Elle est considérée comme une technique clé de l'agroécologie." },
  { title: 'Texte 3', content: "L'agriculture de conservation, également appelée agriculture sans labour ou semis direct, préserve la structure du sol en évitant les labours profonds qui détruisent les réseaux de champignons et de vers de terre. Le sol est maintenu couvert en permanence par des couverts végétaux. Cette approche réduit l'érosion et la consommation d'eau." },
  { title: 'Texte 4', content: "L'hydroponique est une technique de culture hors-sol dans laquelle les plantes poussent dans une solution nutritive aquatique sans terre. Les racines sont directement en contact avec l'eau enrichie en nutriments. Cette méthode permet une production intensive en milieu urbain ou dans des régions arides, avec une consommation d'eau réduite de 90 % par rapport à l'agriculture conventionnelle." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "La psychologie comportementale (behaviorisme) étudie le comportement observable des individus sans s'intéresser aux états mentaux internes. Pavlov et Skinner en sont les fondateurs. Elle a donné naissance aux thérapies cognitivo-comportementales (TCC), aujourd'hui parmi les psychothérapies les plus validées scientifiquement pour traiter l'anxiété et la dépression." },
  { title: 'Texte 2', content: "La psychanalyse est une théorie et une pratique thérapeutique fondée par Sigmund Freud au début du XXe siècle. Elle postule que les conflits inconscients, issus de l'histoire personnelle et notamment de l'enfance, déterminent le comportement adulte. La cure analytique utilise la parole libre, l'analyse des rêves et le transfert comme outils thérapeutiques." },
  { title: 'Texte 3', content: "La psychologie humaniste, représentée par Abraham Maslow et Carl Rogers, place l'être humain au centre et s'intéresse à son potentiel de croissance et d'épanouissement. La hiérarchie des besoins de Maslow (pyramide) est l'un des modèles psychologiques les plus cités. Rogers a développé la thérapie centrée sur la personne." },
  { title: 'Texte 4', content: "La psychologie positive est une branche de la psychologie fondée par Martin Seligman à la fin des années 1990, qui étudie scientifiquement le bonheur, le bien-être, les forces de caractère et les facteurs qui permettent aux individus et aux communautés de s'épanouir. Elle se distingue de la psychologie traditionnelle qui se focalise sur les pathologies." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_RGPD =
`RÈGLEMENT INTERNE DE PROTECTION DES DONNÉES PERSONNELLES
Entreprise TechSolutions SAS — Mise en conformité RGPD

Conformément au Règlement Général sur la Protection des Données (RGPD, UE 2016/679), notre entreprise s'engage à :

Article 3 — Finalités du traitement
Les données personnelles collectées (nom, email, téléphone) sont traitées exclusivement aux fins de gestion de la relation client et de communication commerciale. Aucune utilisation à des fins incompatibles n'est autorisée.

Article 4 — Droits des personnes
Toute personne dispose d'un droit d'accès, de rectification, d'effacement et d'opposition au traitement de ses données. Ces droits s'exercent par email à dpo@techsolutions.fr ou par courrier postal.

Article 7 — Durée de conservation
Les données clients actifs sont conservées pendant la durée de la relation commerciale + 3 ans. Les données de prospects sont supprimées après 2 ans sans contact.`;

const DOC_OFFRE_OCEANO =
`OFFRE D'EMPLOI — OCÉANOGRAPHE OPÉRATIONNEL(LE)

Météo-Marine recrute un(e) océanographe opérationnel(le) pour son Centre de Prévision Océanique de Brest.

Profil requis :
• Master 2 ou doctorat en océanographie physique ou chimique
• Maîtrise des modèles numériques de circulation océanique (NEMO, HYCOM)
• Compétences en programmation (Python, R, MATLAB)
• Expérience en assimilation de données satellitaires appréciée

Missions : production de prévisions océaniques opérationnelles (température, salinité, courants), analyse de données de bouées dérivantes et de satellites altimétriques, rédaction de bulletins météo-marins.

CDI — Ingénieur classe B. Statut EPIC. Déplacements possibles sur campagnes océanographiques.`;

const DOC_CONTRAT_FESTIVAL =
`CONTRAT DE CESSION DE DROITS VOISINS
Festival de Musique Les Nuits du Sud

Entre : Le Festival Les Nuits du Sud (ci-après « l'Organisateur ») et M./Mme ___, artiste-interprète.

Article 1 — Objet : L'Artiste cède à l'Organisateur le droit d'enregistrer sa prestation lors du festival et de la diffuser dans le cadre des activités de promotion du festival.

Article 2 — Contreparties : L'Artiste perçoit un cachet de 2 500 € pour sa prestation. Les droits voisins liés aux enregistrements réalisés pendant le festival sont gérés par la SPEDIDAM.

Article 3 — Exploitation autorisée : Les enregistrements peuvent être diffusés sur les réseaux sociaux du festival, son site web et dans les médias partenaires, sans limitation de durée, à titre non commercial.`;

const DOC_REGLEMENT_EQUESTRE =
`RÈGLEMENT — SOCIÉTÉ ÉQUESTRE DE LA PLAINE
Membres et licences — Saison 2025

Conditions d'adhésion :
• Toute personne souhaitant pratiquer l'équitation au sein de la société doit être licenciée à la Fédération Française d'Équitation (FFE).
• La licence FFE inclut l'assurance responsabilité civile obligatoire.
• Le renouvellement de la licence doit être effectué avant le 31 octobre de chaque année.

Équipements obligatoires :
• Bombe ou casque homologué (norme CE EN 1384) : obligatoire dès le premier cours
• Bottes ou chaussures montantes à talon : obligatoires pour monter à cheval
• Gilet de protection recommandé pour le cross et le saut d'obstacles

Accès aux boxes et aux chevaux de propriétaires uniquement sur autorisation préalable.`;

const DOC_GUIDE_BIODYN =
`CALENDRIER BIODYNAMIQUE — JARDIN BIORHYTHME
Guide pratique d'utilisation

Le calendrier biodynamique classe chaque jour en 4 types selon l'influence des constellations du Zodiaque :
• Jours RACINE (constellation Terre) : favorables aux légumes-racines (carottes, betteraves, pommes de terre)
• Jours FLEUR (constellation Air) : propices aux plantes à fleurs et aux aromates
• Jours FEUILLE (constellation Eau) : adaptés aux légumes-feuilles (salades, choux, épinards)
• Jours FRUIT (constellation Feu) : recommandés pour cultiver les tomates, courges, haricots

Certifications : la biodynamie est certifiée par le label Demeter, le plus exigeant du bio.
Usage : consultez le calendrier avant toute intervention au jardin (semis, plantation, taille, récolte).`;

/* ── Articles de presse Q33-40 ── */
const ART_PSYCHO_POSITIVE =
`LA PSYCHOLOGIE POSITIVE ET LA PERFORMANCE : QUAND LA SCIENCE DU BONHEUR RENCONTRE LE MONDE DU TRAVAIL

La psychologie positive, fondée il y a moins de trente ans par le chercheur américain Martin Seligman, a rapidement trouvé des applications pratiques bien au-delà des cabinets de thérapeutes. Aujourd'hui, ses concepts — résilience, engagement, épanouissement, forces de caractère — sont intégrés dans les programmes de formation des entreprises, les politiques de ressources humaines et les systèmes éducatifs de nombreux pays.

Le modèle PERMA développé par Seligman identifie cinq piliers du bien-être durable : les émotions Positives, l'Engagement dans des activités, des Relations sociales de qualité, le sens (Meaning) et les Accomplissements. Des études longitudinales montrent que les individus qui présentent des scores élevés sur ces cinq dimensions sont non seulement plus heureux mais aussi plus productifs, plus créatifs et plus résistants au stress.

Les entreprises qui adoptent des pratiques inspirées de la psychologie positive — reconnaissance des forces plutôt que correction des faiblesses, culture de la gratitude, espaces de travail favorisant les interactions sociales positives — constatent des effets mesurables sur l'engagement des employés et la réduction de l'absentéisme.

Ses détracteurs pointent néanmoins le risque d'une dérive individualiste : en mettant l'accent sur la responsabilité personnelle dans la construction du bonheur, la psychologie positive risquerait d'occulter les conditions structurelles — inégalités, organisation du travail, politiques sociales — qui déterminent largement le bien-être. Le « think positive » obligatoire dans certaines entreprises peut devenir une forme de pression normative qui aggrave le malaise des personnes qui n'y parviennent pas.`;

const ART_OCEAN_PECHE =
`RÉCHAUFFEMENT DES OCÉANS ET PÊCHE DURABLE : ADAPTER LES PRATIQUES À UN MONDE QUI CHANGE

Le réchauffement climatique modifie profondément les écosystèmes marins, avec des conséquences directes sur les ressources halieutiques mondiales. La hausse des températures de surface pousse de nombreuses espèces à migrer vers des eaux plus froides, modifiant les zones de pêche historiques et perturbant les économies côtières qui en dépendent.

En Méditerranée, les changements sont déjà perceptibles : des espèces tropicales comme le poisson-lapin et le poisson-lion, originaires de la mer Rouge, envahissent progressivement les zones de pêche côtières, concurrençant les espèces locales et perturbant les écosystèmes méditerranéens. Les pêcheurs constatent la disparition d'espèces autrefois abondantes et l'apparition de nouvelles prises inconnues.

La surpêche aggrave la situation. Les stocks de nombreuses espèces commerciales sont exploités au-delà de leur capacité de renouvellement naturel, rendant les écosystèmes plus vulnérables aux perturbations climatiques. L'Union européenne a mis en place des quotas de pêche et des zones marines protégées pour permettre la régénération des stocks, mais leur application reste inégale.

Des initiatives de pêche durable émergent, combinant certifications éco-responsables, pratiques de pêche sélectives réduisant les captures accessoires, et coopération entre scientifiques et pêcheurs pour adapter les techniques aux nouvelles réalités écologiques. La transition vers une pêche durable représente un défi économique et culturel considérable pour des communautés dont l'identité est intimement liée à la mer.`;

const ART_DONNEES_PERSO =
`LES DONNÉES PERSONNELLES ET L'ÉCONOMIE NUMÉRIQUE : LA VALEUR DU NOUVEAU PÉTROLE

L'expression « les données sont le nouveau pétrole » est devenue une formule galvaudée, mais elle capture une réalité économique fondamentale : les données personnelles des utilisateurs constituent le carburant de l'économie numérique. Les plateformes comme Google, Meta, Amazon et TikTok ont construit des empires financiers colossaux en collectant, analysant et monétisant les informations que leurs utilisateurs partagent souvent sans en avoir pleinement conscience.

Le modèle économique dominant du web gratuit repose sur un échange implicite : les utilisateurs cèdent leurs données comportementales (habitudes de navigation, préférences, localisation, contacts) en échange d'accès gratuit à des services. Ces données permettent une publicité ciblée d'une précision redoutable, dont la valeur commerciale se compte en dizaines de milliards de dollars.

L'entrée en vigueur du RGPD (Règlement Général sur la Protection des Données) en Europe en 2018 a constitué un premier cadre juridique contraignant pour les pratiques de collecte de données. Les amendes infligées à plusieurs géants du numérique ont démontré que la régulation était possible. Mais les critiques soulignent que les sanctions restent trop faibles par rapport aux chiffres d'affaires des entreprises concernées.

Des voix s'élèvent pour une reconception plus radicale du modèle économique : paiement des utilisateurs pour leurs données, propriété personnelle inaliénable des données biométriques, interdiction du ciblage publicitaire basé sur le comportement. Ces propositions se heurtent à des résistances économiques et politiques considérables, mais elles dessinent un futur numérique différent où les individus retrouveraient le contrôle sur leur identité numérique.`;

const ART_EQUITATION_AUTISME =
`L'ÉQUITHÉRAPIE ET L'AUTISME : LES PROMESSES D'UNE MÉDIATION ANIMALE CONTROVERSÉE

L'équithérapie — thérapie utilisant le cheval comme médiateur thérapeutique — connaît un intérêt croissant dans la prise en charge des enfants et adultes autistes. Des praticiens et des familles témoignent de progrès remarquables : amélioration de la communication, réduction des comportements répétitifs, développement de l'empathie et de la confiance en soi chez des individus pour qui les interactions sociales classiques sont difficiles.

La relation avec le cheval présente des caractéristiques qui la distinguent des thérapies humaines classiques. L'animal communique de façon non verbale, sans jugement ni attente sociale, ce qui peut être plus accessible pour des personnes autistes qui éprouvent des difficultés avec les codes sociaux humains. La chaleur corporelle, le mouvement rythmique de la marche et la texture du pelage exercent également des effets sensoriels qui peuvent favoriser la régulation émotionnelle.

La recherche scientifique sur l'équithérapie reste cependant limitée et ses résultats sont mitigés. Si plusieurs études montrent des effets positifs sur certains indicateurs comportementaux et sociaux, les méthodologies utilisées sont souvent critiquées pour leur manque de groupes témoins, leurs échantillons réduits ou leurs durées d'observation trop courtes. Les mécanismes précis par lesquels le cheval produit des effets thérapeutiques restent mal compris.

Des praticiens plaident pour une distinction entre équithérapie proprement dite, exercée par des professionnels de santé qualifiés qui utilisent le cheval comme outil thérapeutique dans le cadre d'un projet de soin, et les activités équestres adaptées, qui ont des bénéfices éducatifs et récréatifs sans prétention thérapeutique. Cette clarification est nécessaire pour protéger les familles d'attentes thérapeutiques non fondées.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme festival musique
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL LES NUITS DU SUD — 18e édition
7-10 juillet — Scènes en plein air — Montpellier

VENDREDI 7 JUILLET
• Grande Scène (20 h 30) : ARTURO & THE BAND — Rock méditerranéen
• Scène Village (19 h) : DJ Selena — Sets électro ambient

SAMEDI 8 JUILLET
• Grande Scène (21 h) : SŒURS LUMIÈRE — Pop éclectique | Invité surprise annoncé à 22 h
• Scène Village (18 h) : Trio Jazzissimo — Jazz manouche

DIMANCHE 9 JUILLET
• Grande Scène (19 h) : Clôture — Tous les artistes réunis — Concert exceptionnel
• Scène Village (17 h) : Ateliers jam session ouverts au public

Pass 3 jours : 65 € | Journée : 28 €`,
    question: "D'après ce programme, quelle activité est ouverte au public le dimanche à la Scène Village ?",
    optionA: "Un concert de rock méditerranéen.",
    optionB: "Des ateliers jam session.",
    optionC: "Un concert de clôture de tous les artistes.",
    optionD: "Un set électro ambient.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche concours hippique
  qs.push(q(2, 'Q1-7', null, {
    longText:
`CONCOURS HIPPIQUE RÉGIONAL — CLASSE B
Société Équestre de la Plaine — 24-25 mai

ÉPREUVES :
• Samedi 9 h : Mise en selle Club — poneys (3 à 7 ans)
• Samedi 11 h : Dressage Club et Amateur 1
• Samedi 14 h : Saut d'obstacles — Amateur 1 (90 cm) et Amateur 2 (1 m)
• Dimanche 9 h : Grand Prix — obstacles 1,10 m et 1,20 m
• Dimanche 14 h : Remise des prix — championnat régional

Entrée gratuite pour les spectateurs
Buvette et restauration sur place
Renseignements : equestresoplaine@mail.fr`,
    question: "D'après cette affiche, l'entrée pour les spectateurs est…",
    optionA: "payante pour les adultes.",
    optionB: "gratuite pour tous.",
    optionC: "gratuite pour les enfants uniquement.",
    optionD: "incluse dans le prix du parking.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement jardin biodynamique
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT DU JARDIN BIODYNAMIQUE COLLECTIF
Association TERRE VIVANTE

Admission :
• Tout membre souhaitant obtenir une parcelle doit s'inscrire sur liste d'attente.
• Une parcelle est attribuée pour un an renouvelable, sous condition d'entretien conforme aux principes biodynamiques.
• L'usage de pesticides, herbicides et engrais chimiques est strictement interdit.

Entretien :
• Chaque jardinier doit consacrer au moins 2 h par semaine à son entretien et 2 h par mois aux parties communes.
• Le calendrier biodynamique (semis, plantation selon les jours lune) doit être respecté.
• Les récoltes excédentaires sont partagées avec les autres membres lors des distributions du vendredi.`,
    question: "Selon ce règlement, que doit faire un membre avec ses récoltes excédentaires ?",
    optionA: "Les vendre au marché local.",
    optionB: "Les composter pour fertiliser sa parcelle.",
    optionC: "Les partager avec les autres membres lors des distributions du vendredi.",
    optionD: "Les conserver pour la saison suivante.",
    correctAnswer: 'C',
  }));

  // Q4 — Petite annonce cours équitation débutant
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS D'ÉQUITATION POUR DÉBUTANTS — ADULTES

Centre équestre « Galop Libre » propose des cours d'initiation à l'équitation pour adultes débutants (à partir de 16 ans).

Programme découverte (5 séances) :
• Séance 1 : Approche du cheval, prise en main, sécurité
• Séances 2-3 : Premiers exercices au pas et au trot
• Séances 4-5 : Introduction au galop et à la pratique en extérieur

Matériel prêté pour les 5 séances (casque et bottes)
Effectif limité : 4 participants maximum par cours
Tarif : 180 € les 5 séances | 40 € la séance individuelle
Disponibilités : mercredi 10 h-12 h et samedi 9 h-11 h
Renseignements : galoplibre@equitation.fr | Tél. 05 67 00 12 34`,
    question: "D'après cette annonce, le matériel (casque et bottes) est prêté…",
    optionA: "uniquement pour la première séance.",
    optionB: "pour toutes les séances du programme découverte.",
    optionC: "si l'élève achète le forfait 5 séances.",
    optionD: "uniquement pour les séances extérieures.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi composteur biodynamique
  qs.push(q(5, 'Q1-7', null, {
    longText:
`COMPOSTEUR BIODYNAMIQUE BIORHYTHME — GUIDE D'UTILISATION

Constitution du tas :
1. Alternez les couches : 1 couche de matières brunes (feuilles mortes, carton) + 1 couche de matières vertes (épluchures, tontes de gazon).
2. Ajoutez les préparations biodynamiques 500 (bouse de vache silicifiée) et 502-507 (préparations florales) selon les recommandations du calendrier.
3. Arrosez légèrement si le tas semble trop sec.

Retournement :
Retournez le compost tous les 21 jours de préférence lors d'un jour RACINE (favorable à la vie microbienne du sol).

Maturité : Le compost est prêt en 3 à 6 mois selon la saison. Il doit avoir une odeur de terre forestière et une couleur brun foncé uniforme.`,
    question: "Selon ce guide, à quelle fréquence faut-il retourner le compost ?",
    optionA: "Tous les 7 jours.",
    optionB: "Tous les 14 jours.",
    optionC: "Tous les 21 jours.",
    optionD: "Tous les 30 jours.",
    correctAnswer: 'C',
  }));

  // Q6 — Communiqué droit numérique RGPD
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — Commission Nationale de l'Informatique et des Libertés (CNIL)

La CNIL a prononcé une sanction de 12 millions d'euros à l'encontre de la société DataMarket SAS pour violation du RGPD.

Les manquements constatés :
• Collecte de données sensibles (orientation politique, santé) sans consentement explicite
• Absence de registre des traitements exigé par l'article 30 du RGPD
• Non-respect du droit d'accès de 48 personnes ayant exercé leurs droits

La société dispose de 3 mois pour se mettre en conformité, sous peine d'une astreinte de 50 000 € par jour de retard. La décision est publique et consultable sur cnil.fr.

Contact presse : communication@cnil.fr`,
    question: "Ce communiqué présente principalement…",
    optionA: "une nouvelle loi sur la protection des données en France.",
    optionB: "une sanction prononcée par la CNIL contre une entreprise pour violation du RGPD.",
    optionC: "des recommandations aux entreprises pour se conformer au RGPD.",
    optionD: "les résultats d'une enquête sur les pratiques des plateformes numériques.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation atelier psychologie positive
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Maison du Mieux-Être — Centre de développement personnel

Vous invite à l'atelier

« DÉCOUVRIR LA PSYCHOLOGIE POSITIVE »

Samedi 29 mars — 10 h à 17 h (pause déjeuner incluse)
12, boulevard de la Paix — Nantes

Au programme :
• Matin : Les fondements de la psychologie positive (théorie + exercices)
• Après-midi : Identifier vos forces de caractère et construire votre plan de bien-être

Animé par Chloé Marchand, psychologue certifiée en psychologie positive (UPenn)
Nombre de places limité : 12 participants maximum

Tarif : 95 € | 75 € tarif réduit (étudiants et demandeurs d'emploi)
Inscriptions : atelierpp@maisonmieuxetre.fr`,
    question: "D'après cette invitation, l'animatrice de l'atelier est…",
    optionA: "une coach de vie non diplômée.",
    optionB: "une psychologue certifiée en psychologie positive.",
    optionC: "une professeure de l'Université de Nantes.",
    optionD: "une thérapeute spécialisée en thérapies cognitivo-comportementales.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ est une compétence centrale de la psychologie positive qui désigne la capacité d'un individu à surmonter les épreuves difficiles et à rebondir après un échec.",
    question: PHRASE_Q,
    optionA: "persévérance",
    optionB: "résilience",
    optionC: "gratitude",
    optionD: "optimisme",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La cuisine libanaise est célèbre pour ses ___, un ensemble de petites assiettes variées servi en entrée et partagé entre convives.",
    question: PHRASE_Q,
    optionA: "tapas",
    optionB: "antipasti",
    optionC: "mezze",
    optionD: "starters",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le RGPD impose aux entreprises de recueillir le ___ explicite des utilisateurs avant de traiter leurs données personnelles à des fins de marketing.",
    question: PHRASE_Q,
    optionA: "contrat",
    optionB: "consentement",
    optionC: "accord",
    optionD: "mandat",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En équitation, l'___ désigne la vitesse de déplacement du cheval selon ses allures naturelles : le pas, le trot, le galop.",
    question: PHRASE_Q,
    optionA: "allure",
    optionB: "cadence",
    optionC: "rythme",
    optionD: "mouvement",
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___, zone de transition entre deux masses d'eau de températures différentes, crée une barrière verticale qui limite les échanges entre les couches profondes et de surface.",
    question: PHRASE_Q,
    optionA: "halocline",
    optionB: "thermocline",
    optionC: "pycnocline",
    optionD: "oxycline",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En agriculture ___, le calendrier lunaire guide les interventions au jardin : semis, plantation, taille et récolte selon le type de jour (racine, fleur, feuille, fruit).",
    question: PHRASE_Q,
    optionA: "biologique",
    optionB: "biodynamique",
    optionC: "naturelle",
    optionD: "permacole",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Le RGPD impose que les données personnelles soient collectées pour une [14] déterminée, explicite et légitime. Le [15] des personnes concernées est nécessaire pour toute collecte de données sensibles et doit être libre, éclairé et révocable à tout moment.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Le RGPD et collecte de données",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "raison",
    optionB: "finalité",
    optionC: "utilisation",
    optionD: "destination",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Le RGPD et collecte de données",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "accord",
    optionB: "autorisation",
    optionC: "consentement",
    optionD: "approbation",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "L'équithérapie utilise le cheval comme outil de [16] entre le thérapeute et le patient, permettant de créer un espace thérapeutique moins chargé des codes sociaux humains. Le développement de l'[17] entre l'enfant et l'animal constitue souvent la première étape vers une ouverture relationnelle plus large.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Équithérapie et bien-être",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "transport",
    optionB: "communication",
    optionC: "médiation",
    optionD: "facilitation",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Équithérapie et bien-être",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "contrôle",
    optionB: "habitude",
    optionC: "discipline",
    optionD: "attachement",
    correctAnswer: 'D',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit la cuisine du Levant célèbre pour le houmous, le taboulé et les mezzés partagés ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit une discipline équestre notant la précision et l'harmonie entre cheval et cavalier lors de figures imposées ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit une agriculture basée sur les cycles lunaires et les préparations végétales pour renforcer le sol ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'A',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit une branche de la psychologie fondée par Seligman étudiant le bonheur et les forces humaines ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'D',
  }));

  // Q22 : Bar chart
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les festivals de musique électronique attirent le second plus grand public avec 2,3 millions de festivaliers annuels mais présentent la plus forte croissance avec +28% en 5 ans. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement interne de protection des données personnelles — TechSolutions",
    longText: DOC_REGLEMENT_RGPD,
    question: "Selon ce document, à quelles seules fins les données personnelles collectées sont-elles traitées ?",
    optionA: "À des fins de sécurité informatique.",
    optionB: "À des fins de gestion de la relation client et de communication commerciale.",
    optionC: "À des fins de recherche et développement.",
    optionD: "À des fins de partage avec les partenaires commerciaux.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement interne de protection des données personnelles — TechSolutions",
    longText: DOC_REGLEMENT_RGPD,
    question: "Combien de temps les données de prospects sans contact sont-elles conservées avant suppression ?",
    optionA: "1 an.",
    optionB: "2 ans.",
    optionC: "3 ans.",
    optionD: "5 ans.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Océanographe opérationnel(le)",
    longText: DOC_OFFRE_OCEANO,
    question: "Quels modèles numériques de circulation océanique sont mentionnés dans cette offre ?",
    optionA: "MATLAB et Python.",
    optionB: "NEMO et HYCOM.",
    optionC: "COPERNICUS et ARGO.",
    optionD: "GFS et ECMWF.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Océanographe opérationnel(le)",
    longText: DOC_OFFRE_OCEANO,
    question: "Parmi les missions décrites, laquelle est mentionnée dans cette offre ?",
    optionA: "La plongée scientifique en eaux profondes.",
    optionB: "La rédaction de bulletins météo-marins.",
    optionC: "L'enseignement en école d'ingénieurs.",
    optionD: "La supervision de campagnes sous-marines.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de cession de droits voisins — Festival Les Nuits du Sud",
    longText: DOC_CONTRAT_FESTIVAL,
    question: "Quel est le cachet perçu par l'artiste pour sa prestation selon ce contrat ?",
    optionA: "1 500 €.",
    optionB: "2 000 €.",
    optionC: "2 500 €.",
    optionD: "3 000 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de cession de droits voisins — Festival Les Nuits du Sud",
    longText: DOC_CONTRAT_FESTIVAL,
    question: "Selon ce contrat, les enregistrements peuvent être diffusés sur les réseaux sociaux du festival…",
    optionA: "pendant 1 an seulement.",
    optionB: "pendant 5 ans.",
    optionC: "sans limitation de durée.",
    optionD: "seulement pendant l'édition du festival.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement — Société équestre de la Plaine",
    longText: DOC_REGLEMENT_EQUESTRE,
    question: "Avant quelle date le renouvellement de licence doit-il être effectué selon ce règlement ?",
    optionA: "Le 31 août.",
    optionB: "Le 30 septembre.",
    optionC: "Le 31 octobre.",
    optionD: "Le 30 novembre.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement — Société équestre de la Plaine",
    longText: DOC_REGLEMENT_EQUESTRE,
    question: "Quel équipement est simplement recommandé (non obligatoire) selon ce règlement ?",
    optionA: "La bombe ou casque homologué.",
    optionB: "Les bottes montantes à talon.",
    optionC: "La licence FFE.",
    optionD: "Le gilet de protection.",
    correctAnswer: 'D',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Calendrier biodynamique — Jardin Biorhythme",
    longText: DOC_GUIDE_BIODYN,
    question: "Ce document présente principalement…",
    optionA: "les techniques de compostage biodynamique.",
    optionB: "un guide d'utilisation du calendrier biodynamique pour planifier les travaux au jardin.",
    optionC: "les principes de la certification Demeter.",
    optionD: "un programme de formation en agriculture biodynamique.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Calendrier biodynamique — Jardin Biorhythme",
    longText: DOC_GUIDE_BIODYN,
    question: "Selon ce guide, quel type de jour est favorable aux légumes-feuilles comme les salades ?",
    optionA: "Jour RACINE.",
    optionB: "Jour FLEUR.",
    optionC: "Jour FEUILLE.",
    optionD: "Jour FRUIT.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La psychologie positive et la performance",
    longText: ART_PSYCHO_POSITIVE,
    question: "Quel modèle développé par Seligman est présenté dans l'article ?",
    optionA: "Le modèle SMART des objectifs.",
    optionB: "Le modèle PERMA des cinq piliers du bien-être.",
    optionC: "La hiérarchie des besoins de Maslow.",
    optionD: "La théorie de l'autodétermination de Deci et Ryan.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La psychologie positive et la performance",
    longText: ART_PSYCHO_POSITIVE,
    question: "Quelle critique de la psychologie positive est évoquée dans l'article ?",
    optionA: "Elle serait trop coûteuse à mettre en œuvre dans les entreprises.",
    optionB: "Elle risquerait d'occulter les conditions structurelles qui déterminent le bien-être.",
    optionC: "Ses résultats scientifiques ne seraient pas validés.",
    optionD: "Elle ne serait applicable qu'aux personnes déjà heureuses.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Réchauffement des océans et pêche durable",
    longText: ART_OCEAN_PECHE,
    question: "Quelle espèce invasive est mentionnée dans l'article comme envahissant la Méditerranée ?",
    optionA: "Le saumon atlantique et la morue.",
    optionB: "Le poisson-lapin et le poisson-lion.",
    optionC: "Le bar et le poulpe.",
    optionD: "Le thon rouge et l'espadon.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Réchauffement des océans et pêche durable",
    longText: ART_OCEAN_PECHE,
    question: "Quel mécanisme l'UE a-t-elle mis en place pour permettre la régénération des stocks de poissons ?",
    optionA: "Des subventions pour moderniser les flottes de pêche.",
    optionB: "Des quotas de pêche et des zones marines protégées.",
    optionC: "Des taxes sur les importations de poissons.",
    optionD: "Des programmes d'aquaculture intensive.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Les données personnelles et l'économie numérique",
    longText: ART_DONNEES_PERSO,
    question: "Selon l'article, en quoi consiste le modèle économique dominant du web gratuit ?",
    optionA: "En une publicité de masse non ciblée.",
    optionB: "En un échange implicite : accès gratuit contre données comportementales.",
    optionC: "En un abonnement mensuel optionnel.",
    optionD: "En des partenariats entre États et plateformes numériques.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Les données personnelles et l'économie numérique",
    longText: ART_DONNEES_PERSO,
    question: "Quelle année le RGPD est-il entré en vigueur en Europe selon l'article ?",
    optionA: "2016.",
    optionB: "2017.",
    optionC: "2018.",
    optionD: "2020.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'équithérapie et l'autisme",
    longText: ART_EQUITATION_AUTISME,
    question: "Quelle caractéristique de la relation avec le cheval est présentée comme potentiellement bénéfique pour les personnes autistes ?",
    optionA: "La rapidité d'apprentissage que le cheval permet.",
    optionB: "La communication non verbale et sans jugement de l'animal.",
    optionC: "La structure rigide des sessions d'équithérapie.",
    optionD: "La taille imposante du cheval qui développe le courage.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'équithérapie et l'autisme",
    longText: ART_EQUITATION_AUTISME,
    question: "Selon l'article, quelle distinction les praticiens défendent-ils pour protéger les familles ?",
    optionA: "Entre équithérapie pour enfants et équithérapie pour adultes.",
    optionB: "Entre équithérapie exercée par des professionnels de santé et activités équestres adaptées.",
    optionC: "Entre séances individuelles et séances en groupe.",
    optionD: "Entre centres équestres agréés et non agréés.",
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
    console.log(`\n✅ ${created} questions créées pour CE 43.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
