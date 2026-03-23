'use strict';
/**
 * seed-ce-serie23.js
 * Peuple la série CE 23 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie23.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyohtg000j0wxlg5wxuxsp';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART (créations d'entreprises par secteur) correctAnswer='A' ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [67, 35, 22, 18], color: '#003087' }, // CORRECT — secteur numérique +67%
    { label: 'Graphique 2', data: [28, 42, 55, 30], color: '#E30613' },
    { label: 'Graphique 3', data: [15, 25, 40, 60], color: '#E30613' },
    { label: 'Graphique 4', data: [45, 20, 38, 52], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Numérique', 'Commerce', 'Industrie', 'Services'];
  const maxVal = 80;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 20, 40, 60, 80].map(v => {
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Croissance 2019-2023</text>`;
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
  { title: 'Film 1', content: "Le film de fiction est une œuvre cinématographique qui raconte une histoire inventée, avec des acteurs professionnels interprétant des personnages fictifs. Les genres sont multiples : drame, comédie, thriller, science-fiction, romance. Ce type de film représente la majorité de la production mondiale et constitue le cœur de l'industrie hollywoodienne et des grandes cinématographies nationales." },
  { title: 'Film 2', content: "Le film documentaire est une œuvre cinématographique fondée sur des faits réels, sans acteurs professionnels jouant des rôles fictifs. Il peut suivre des personnes réelles dans leur vie quotidienne, explorer des événements historiques ou présenter des enjeux sociaux et environnementaux. Le cinéma direct, le cinéma vérité et le documentaire d'investigation en sont les principales formes. Des réalisateurs comme Michael Moore ou Frederick Wiseman en ont fait leur spécialité." },
  { title: 'Film 3', content: "Le film d'animation est une œuvre cinématographique créée image par image sans prise de vue en continu du réel. Les techniques incluent l'animation 2D traditionnelle (Disney), la 3D numérique (Pixar), le stop-motion avec des marionnettes ou des figurines, et l'animation en volume. Ce genre, longtemps associé au public enfantin, a conquis tous les âges grâce à des œuvres comme Miyazaki ou Aardman." },
  { title: 'Film 4', content: "Le film expérimental est une forme cinématographique qui remet en question les conventions narratives et visuelles du cinéma mainstream. Il privilégie l'exploration formelle, la fragmentation du récit et l'abstraction visuelle. Diffusé principalement dans les festivals d'art et d'essai et les musées d'art contemporain, ce genre de niche s'adresse à un public connaisseur de l'histoire du cinéma et des arts visuels." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Certification 1', content: "Le label Rouge est une certification française qui distingue des produits agricoles et alimentaires de qualité supérieure. Il garantit que le produit est notablement différent des produits similaires courants, notamment en termes de goût et de conditions de production. Il concerne principalement les volailles de Bresse, les charcuteries artisanales et certaines viandes bovines élevées en plein air." },
  { title: 'Certification 2', content: "Le label AB (Agriculture Biologique) est la certification officielle française de l'agriculture biologique. Il garantit que le produit a été cultivé ou élevé selon les cahiers des charges de l'agriculture biologique : sans pesticides de synthèse, sans OGM, avec respect du bien-être animal. Ce label est encadré par le règlement européen CE 834/2007 et contrôlé par des organismes certificateurs agréés." },
  { title: 'Certification 3', content: "L'Appellation d'Origine Protégée (AOP) est une certification européenne qui garantit qu'un produit est produit, transformé et élaboré dans une aire géographique déterminée, selon un savoir-faire reconnu. Elle concerne les fromages (Camembert de Normandie, Comté), les vins, les olives et huiles d'olive, et de nombreuses spécialités régionales. L'AOP remplace en Europe l'ancienne AOC française." },
  { title: 'Certification 4', content: "Le label Demeter est une certification internationale pour les produits issus de l'agriculture biodynamique, une approche qui va au-delà du bio conventionnel en intégrant les rythmes cosmiques et la vision holistique de la ferme comme organisme vivant. Initié par Rudolf Steiner, ce label est présent dans plus de 50 pays et concerne principalement les vins biodynamiques, les fromages et les légumes de spécialités." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Statut 1', content: "L'auto-entrepreneur (ou micro-entrepreneur) est un statut simplifié permettant à une personne physique d'exercer une activité commerciale, artisanale ou libérale sous un régime fiscal et social allégé. Les formalités de création sont réduites à une simple déclaration en ligne. Les cotisations sociales sont proportionnelles au chiffre d'affaires réalisé. Ce statut est limité par des plafonds de chiffre d'affaires annuels." },
  { title: 'Statut 2', content: "La SARL (Société à Responsabilité Limitée) est une forme juridique d'entreprise associant au minimum 2 associés (maximum 100) dont la responsabilité est limitée à leurs apports. Le capital social minimum est d'1 euro. La SARL est gérée par un ou plusieurs gérants, qui peuvent être associés ou non. Elle est particulièrement adaptée aux petites et moyennes entreprises familiales ou entre partenaires de confiance." },
  { title: 'Statut 3', content: "La SAS (Société par Actions Simplifiée) offre une grande liberté dans la rédaction des statuts et l'organisation de la gouvernance. Elle peut être constituée par un seul actionnaire (SASU) ou plusieurs. La responsabilité des actionnaires est limitée à leurs apports. La SAS est particulièrement appréciée des start-ups et des entreprises à forte croissance en raison de sa flexibilité statutaire et de sa facilité à lever des fonds." },
  { title: 'Statut 4', content: "La SA (Société Anonyme) est une forme juridique réservée aux grandes entreprises, nécessitant au minimum 7 actionnaires et un capital de 37 000 euros. Elle peut être cotée en Bourse et émettre des actions librement négociables. Son fonctionnement complexe implique un conseil d'administration, une assemblée générale et des commissaires aux comptes obligatoires. Les grandes entreprises et les multinationales adoptent généralement ce statut." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Langue 1', content: "Le breton est une langue celtique appartenant à la même branche linguistique que le gallois et le cornique. Parlée par environ 200 000 personnes en Bretagne, elle est la seule langue celtique encore vivante sur le continent européen. Malgré un déclin démographique dû à la politique de francisation du XIXe et XXe siècles, elle connaît un renouveau grâce aux écoles Diwan et aux émissions de radio-télévision en langue bretonne." },
  { title: 'Langue 2', content: "L'occitan est une langue romane parlée dans la moitié sud de la France, de la Catalogne espagnole aux vallées occitanes d'Italie. Elle est reconnue comme langue régionale par la loi Molac et compte environ 200 000 locuteurs actifs. Divisée en plusieurs dialectes (gascon, languedocien, provençal), elle est la langue des troubadours médiévaux et d'un patrimoine littéraire exceptionnel. Son enseignement est assuré dans les écoles Calandretas." },
  { title: 'Langue 3', content: "L'alsacien est un ensemble de dialectes alémaniques (germaniques) parlés en Alsace et dans une partie de la Moselle. Compréhensible par les germanophones, il présente des variantes locales marquées entre le nord et le sud de la région. L'alsacien compte environ 500 000 locuteurs, principalement les générations âgées. Son statut juridique est celui d'une langue régionale reconnue, mais son usage public et son enseignement restent limités." },
  { title: 'Langue 4', content: "Le basque (euskara) est une langue isolée, sans parenté connue avec aucune autre langue du monde. Parlée au Pays Basque français et espagnol par environ 750 000 personnes, elle est considérée comme l'une des plus anciennes langues d'Europe. Son origine reste mystérieuse pour les linguistes. L'euskara est co-officielle en Communauté autonome basque espagnole et fait l'objet d'un enseignement bilingue intensif." },
]);

/* ── Documents Q23-32 ── */
const DOC_CONTRAT_FRANCHISE =
`CONTRAT DE FRANCHISE — RESTAURATION RAPIDE BIO

Entre la société BISTROT NATURE SARL (franchiseur) et M. Pierre Mercier (franchisé), il est convenu :

OBJET : Attribution d'une franchise exclusive pour l'exploitation d'un restaurant Bistrot Nature dans la ville de Nantes, zone commerciale Saint-Herblain.

DROITS ET OBLIGATIONS DU FRANCHISÉ :
• Utilisation exclusive des recettes, du concept et de la marque Bistrot Nature
• Respect strict de la charte qualité et des normes d'approvisionnement bio certifiés
• Redevance mensuelle : 6% du chiffre d'affaires hors taxes
• Participation obligatoire aux formations annuelles organisées par le franchiseur

DURÉE ET RENOUVELLEMENT :
Contrat initial de 7 ans, renouvelable par accord mutuel. En cas de résiliation anticipée par le franchisé, une pénalité de 30 000 € sera due.`;

const DOC_OFFRE_URBANISME =
`OFFRE D'EMPLOI — CHEF DE PROJET URBANISME
Direction de l'Aménagement et de l'Urbanisme — Mairie de Lyon

La Mairie de Lyon recrute un chef de projet urbanisme pour piloter les opérations de rénovation urbaine dans les quartiers prioritaires.

MISSIONS :
Coordination des études d'aménagement, suivi des procédures de permis de construire, concertation avec les habitants et les élus, pilotage des marchés publics et suivi budgétaire des opérations.

PROFIL :
Diplôme d'urbaniste ou architecte DPLG, 5 ans d'expérience minimum en collectivité ou bureau d'études. Maîtrise des outils SIG, connaissance du droit de l'urbanisme et des procédures administratives.

CONTRAT : Titulaire de la fonction publique territoriale (grade ingénieur) ou CDD 3 ans. Rémunération indiciaire + primes selon expérience.`;

const DOC_CAHIER_BIO =
`CAHIER DES CHARGES — LABEL AGRICULTURE BIOLOGIQUE
Marché Paysan Bio de Lyon

Pour obtenir l'autorisation de vendre sur notre marché, chaque producteur doit satisfaire aux critères suivants :

CERTIFICATION :
• Être titulaire d'un certificat AB (Agriculture Biologique) en cours de validité, délivré par un organisme certificateur agréé
• Présenter le rapport de contrôle annuel lors de l'inscription

PRODUCTION :
• Interdiction d'utiliser des pesticides et engrais chimiques de synthèse
• Semences non OGM obligatoires
• Respect du bien-être animal pour les élevages (accès au plein air exigé)

TRAÇABILITÉ :
Chaque lot vendu doit être accompagné d'une fiche de traçabilité indiquant l'origine, la parcelle de production et la date de récolte.`;

const DOC_MEDIATEUR =
`RÈGLEMENT DE LITIGES CONSOMMATEURS
Service de Médiation — Commission Nationale

Vous avez un litige avec un professionnel ? La médiation est une procédure gratuite, rapide et confidentielle pour résoudre votre différend à l'amiable.

COMMENT SAISIR LE MÉDIATEUR :
1. Vous devez d'abord avoir adressé une réclamation écrite au professionnel
2. Si vous n'avez pas obtenu de réponse satisfaisante dans un délai de 2 mois, vous pouvez saisir le médiateur
3. Déposez votre dossier sur mediateur-consommateurs.fr avec les pièces justificatives

DÉLAI DE TRAITEMENT : 90 jours maximum à compter de la réception du dossier complet

EFFET : La décision du médiateur s'impose au professionnel si vous l'acceptez. Vous restez libre de saisir la justice.`;

const DOC_CONVENTION_LANGUE =
`CONVENTION DE PARTENARIAT CULTUREL
Pour la Promotion de la Langue Française en Afrique Francophone

Entre l'Agence pour l'Enseignement Français à l'Étranger (AEFE) et l'Institut Français (IF), la présente convention vise à renforcer la diffusion et la vitalité de la langue française dans les pays d'Afrique subsaharienne francophone.

ACTIONS PRÉVUES :
• Formation de 500 enseignants de français par an dans 10 pays partenaires
• Dotation de 200 bibliothèques scolaires en ouvrages en langue française
• Organisation annuelle d'un Festival de la Francophonie dans 5 capitales
• Développement de plateformes d'apprentissage numérique en français

DURÉE : Convention triennale 2025-2028, renouvelable.
BUDGET TOTAL : 8 millions d'euros cofinancés par les deux parties.`;

/* ── Articles Q33-40 ── */
const ART_CINEMA =
`LE RENOUVEAU DU CINÉMA D'AUTEUR FRANÇAIS : ENTRE HÉRITAGE ET RUPTURE

Le cinéma d'auteur français traverse une période de profond renouvellement. Une nouvelle génération de cinéastes, nés dans les années 1980 et 1990, s'empare de la caméra avec des histoires résolument contemporaines, des esthétiques hybrides mêlant documentaire et fiction, et une attention particulière aux marges de la société. Ces jeunes réalisateurs héritent d'une tradition forte, celle de la Nouvelle Vague, tout en cherchant à s'en émanciper.

Ce renouveau s'exprime notamment à travers la diversification des regards. Des réalisatrices comme Céline Sciamma ou Alice Diop apportent des perspectives féministes et postcoloniales qui réinventent les codes narratifs du cinéma hexagonal. Des cinéastes d'origine africaine ou maghrébine introduisent des questionnements identitaires inédits dans le paysage cinématographique français.

Le financement reste cependant un défi majeur. Le système français de soutien au cinéma via le CNC (Centre National du Cinéma) est envié dans le monde entier pour sa capacité à financer des films exigeants qui n'auraient aucune chance dans un système purement commercial. Mais les budgets se resserrent et la concurrence des plateformes de streaming pour l'attention du spectateur s'intensifie.

Les festivals continuent de jouer un rôle central dans la reconnaissance du cinéma d'auteur. Cannes, Berlin, Venise représentent des vitrines mondiales inestimables. Un Palme d'Or ou un Ours d'Or transforme la carrière d'un réalisateur et assure à son film une distribution internationale. Ce système de légitimation culturelle, propre au cinéma européen, constitue un contrepoids précieux face à la domination commerciale des studios américains.`;

const ART_AGRIBIO =
`AGRICULTURE BIOLOGIQUE ET SOUVERAINETÉ ALIMENTAIRE : UN MODÈLE EN QUÊTE D'ÉCHELLE

L'agriculture biologique a connu une croissance spectaculaire en France ces dix dernières années : la surface agricole bio a plus que doublé et dépasse aujourd'hui 2,7 millions d'hectares, soit 10% de la surface agricole totale. Portée par une demande croissante des consommateurs et des politiques publiques favorables, elle est souvent présentée comme un modèle d'agriculture durable. Mais peut-elle nourrir la France — et le monde ?

Ses défenseurs font valoir qu'elle préserve la biodiversité, améliore la qualité des sols sur le long terme, protège les nappes phréatiques des pesticides et produit des aliments plus sains. Des études récentes suggèrent que les régimes alimentaires bio réduiraient l'exposition aux perturbateurs endocriniens et à certains résidus de pesticides.

Ses critiques soulignent en revanche des rendements globalement inférieurs de 20 à 30% par rapport à l'agriculture conventionnelle intensive, ce qui soulève la question de la capacité à nourrir une population mondiale en croissance. Le prix plus élevé des produits bio reste un frein à leur démocratisation : ils sont souvent hors de portée des ménages à faibles revenus.

La transition agroécologique proposée par de nombreux chercheurs représente une voie médiane : réduire massivement les intrants chimiques tout en maintenant des rendements viables, en combinant des pratiques agro-écologiques (rotation des cultures, haies bocagères, légumineuses) avec les acquis de la sélection végétale. Cette approche pragmatique cherche à concilier impératifs écologiques et réalités économiques.`;

const ART_GENTRIF =
`GENTRIFICATION ET DROIT AU LOGEMENT : QUAND LA RÉNOVATION URBAINE EXCLUT LES PLUS PAUVRES

La gentrification est un phénomène urbain qui consiste en la transformation progressive d'un quartier populaire en un espace résidentiel attirant des populations plus aisées, entraînant une hausse des loyers et l'éviction des habitants d'origine. Ce processus, observable dans de nombreuses métropoles mondiales, pose des questions fondamentales sur le droit au logement et la mixité sociale.

À Paris, Marseille, Lyon ou Bordeaux, des quartiers historiquement ouvriers ont été profondément transformés par des opérations de rénovation urbaine. Si ces réhabilitations améliorent souvent le cadre bâti et réduisent l'insalubrité, elles s'accompagnent fréquemment d'une explosion des prix immobiliers qui contraint les locataires modestes à s'éloigner vers des périphéries de plus en plus lointaines.

Les politiques publiques cherchent à limiter ces effets pervers à travers différents outils. La loi SRU impose aux communes de disposer d'un minimum de 25% de logements sociaux. Les dispositifs d'encadrement des loyers, expérimentés à Paris et dans plusieurs grandes villes, visent à contenir la hausse des loyers dans les secteurs tendus. Mais ces mesures se heurtent aux mécanismes du marché immobilier et aux intérêts des promoteurs.

Le débat politique autour du logement révèle des tensions profondes entre le droit à la ville pour tous et les logiques économiques qui gouvernent le marché immobilier. Certains militants du droit au logement plaident pour une plus grande intervention publique, voire la réquisition de logements vacants dans les zones tendues, tandis que les libéraux prônent une libéralisation du marché pour stimuler la construction et faire baisser les prix.`;

const ART_FRANCO =
`FRANCOPHONIE ET DIVERSITÉ LINGUISTIQUE : UNE ALLIANCE PARADOXALE

La Francophonie internationale rassemble aujourd'hui 300 millions de locuteurs répartis sur cinq continents et dans 88 États et gouvernements membres de l'Organisation Internationale de la Francophonie (OIF). Si le français est la cinquième langue la plus parlée dans le monde et la deuxième langue la plus apprise, son avenir suscite des débats contrastés selon les régions.

En Afrique subsaharienne, qui concentre déjà plus de la moitié des francophones mondiaux et où la croissance démographique est la plus forte, le français joue un rôle ambigu. D'un côté, il est la langue de l'administration, de l'enseignement supérieur et du commerce international, offrant un passeport économique précieux. De l'autre, il reste perçu par certains comme l'héritage d'une colonisation culturelle qui a marginalisé des centaines de langues africaines locales.

La question de la place des langues africaines dans les systèmes éducatifs nationaux est de plus en plus posée. Des pays comme le Rwanda ont choisi l'anglais comme première langue d'enseignement, abandonnant le français. D'autres expérimentent des modèles bilingues où les langues nationales cohabitent avec le français dès les premières années de scolarité.

Pour rester pertinente, la Francophonie doit évoluer vers un modèle qui valorise le plurilinguisme plutôt que la seule promotion du français. L'OIF a développé ces dernières années une doctrine qui reconnaît que la francophonie n'est pas synonyme de monolinguisme français, mais peut s'épanouir dans un espace de dialogue entre le français et les langues partenaires.`;

function buildQuestions() {
  const qs = [];

  qs.push(q(1, 'Q1-7', null, {
    longText:
`CINÉMA LE LUMIÈRE — Programme de la semaine
Du 8 au 14 novembre 2025

LES SAISONS DE L'ÂME (France, 2025) — Film d'auteur — 1h52
Drame intime sur la reconstruction après le deuil.
Réal. : Claire Morin | Avec : Léa Martin, Simon Dupré
Séances : Mer 14h, Sam 20h30, Dim 17h | Tarif : 9,50 € | Étudiant : 6 €

LE DERNIER PASSAGER (Thriller, 2025) — 2h05
Séances : Jeu-Ven-Sam-Dim 18h et 21h | Tarif : 9,50 €

Carte fidélité : 10e séance offerte | Réservations : cinema-lumiere.fr`,
    question: "Ce document est…",
    optionA: "une critique cinématographique.",
    optionB: "un programme de cinéma avec horaires et tarifs.",
    optionC: "une publicité pour un festival de cinéma.",
    optionD: "un contrat de distribution de films.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`GUIDE DE LA CRÉATION D'ENTREPRISE EN FRANCE
Chambre de Commerce et d'Industrie — Édition 2025

ÉTAPES CLÉS :
1. Choisir votre statut juridique (SARL, SAS, auto-entrepreneur...)
2. Rédiger vos statuts avec l'aide d'un notaire ou d'un avocat
3. Déposer votre capital social à la banque
4. Publier une annonce légale de création dans un journal habilité
5. Immatriculer votre société au Registre du Commerce et des Sociétés (RCS) via le guichet unique

DÉLAI MOYEN : 5 à 10 jours ouvrés pour une société
COÛT MOYEN : 100 à 500 € selon le statut choisi

Consultez votre CCI pour un accompagnement personnalisé gratuit.`,
    question: "Ce document a pour but principal de…",
    optionA: "promouvoir les produits des entreprises locales.",
    optionB: "guider les entrepreneurs dans les étapes de création d'entreprise.",
    optionC: "présenter les avantages fiscaux des entreprises françaises.",
    optionD: "informer sur les aides financières disponibles pour les start-ups.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT DU MARCHÉ PAYSAN BIO DE LYON
Place Carnot — Chaque samedi de 7h à 13h

CONDITIONS D'ACCÈS AUX PRODUCTEURS :
• Être titulaire d'un certificat AB (Agriculture Biologique) en cours de validité
• Vendre exclusivement des produits issus de sa propre exploitation
• La revente de produits achetés à d'autres producteurs est strictement interdite

LABELS ACCEPTÉS : AB, Demeter, Nature & Progrès

EMPLACEMENT :
Attribution sur liste d'attente. Emplacement 4 m² : 25 €/marché.

RÈGLES DE COMPORTEMENT :
Tenue correcte exigée. Il est interdit de fumer sur le marché. Les animaux domestiques ne sont pas admis dans l'espace de vente.`,
    question: "Selon ce règlement, un producteur peut vendre sur ce marché uniquement s'il…",
    optionA: "est membre d'une coopérative agricole.",
    optionB: "possède un certificat d'agriculture biologique valide.",
    optionC: "vend des produits importés certifiés bio.",
    optionD: "a plus de 5 ans d'expérience en agriculture.",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`À LOUER — Local commercial — Quartier des Halles, Lyon 1er
Surface : 85 m² en rez-de-chaussée
Devanture commerciale 6 ml sur rue piétonne très fréquentée
Arrière-boutique 20 m², réserve, WC
Électricité triphasée, extraction cuisine possible
Loyer mensuel : 2 800 € HT HC | Charges : 350 €/mois
Dépôt de garantie : 3 mois de loyer
Bail commercial 3-6-9, disponible au 1er décembre
Contact : Agence Commerciale Immobilière — 04 72 00 55 99`,
    question: "Ce document est…",
    optionA: "une offre de vente d'un appartement.",
    optionB: "une petite annonce de location d'un local commercial.",
    optionC: "un contrat de bail commercial signé.",
    optionD: "un plan d'aménagement d'un local professionnel.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`SEMAINE DE LA LANGUE FRANÇAISE ET DE LA FRANCOPHONIE 2025
Du 15 au 25 mars — Partout en France et dans le monde

PROGRAMME NATIONAL :
• Dictée géante en direct sur France 2 — Samedi 22 mars à 14h30
• Concours « Dis-moi dix mots » pour les écoliers et lycéens
• Ateliers d'écriture créative dans les médiathèques partenaires
• Slam et poésie dans les établissements scolaires et culturels
• Exposition itinérante « Les mots voyageurs » dans 50 villes

THÈME 2025 : « Les mots du quotidien »
Organisé par la Délégation Générale à la Langue Française et aux Langues de France (DGLFLF)`,
    question: "Ce document présente…",
    optionA: "des cours de français langue étrangère.",
    optionB: "le programme d'une semaine dédiée à la langue française.",
    optionC: "les résultats d'un concours de dictée national.",
    optionD: "une campagne de recrutement d'enseignants de français.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`COURRIER DE RÉCLAMATION

À l'attention du Service Clients,
Société BioMob SARL

Madame, Monsieur,

Le 3 octobre 2025, j'ai commandé via votre site internet un vélo électrique pliable (réf. VEL-2025-BIO) au prix de 1 249 €. À réception le 10 octobre, j'ai constaté que l'écran de bord était fissuré et que la batterie ne se charge pas.

J'ai tenté de vous contacter par téléphone à trois reprises sans succès. Je vous mets donc en demeure, par le présent courrier recommandé, de procéder au remplacement de l'appareil défectueux ou à son remboursement intégral dans un délai de 15 jours.

À défaut, je me réserve le droit de saisir le médiateur de la consommation.

Cordialement,
Marc Lefort`,
    question: "Quel est le but principal de ce courrier ?",
    optionA: "Commander un nouveau vélo électrique.",
    optionB: "Formuler une réclamation pour un produit défectueux.",
    optionC: "Annuler une commande avant la livraison.",
    optionD: "Demander une facture pour sa comptabilité.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — INAUGURATION DU NOUVEAU QUARTIER CRÉATIF
Quartier des Arts — Saint-Étienne

La Ville de Saint-Étienne a le plaisir de vous convier à l'inauguration officielle du nouveau Quartier des Arts, fruit de 4 années de travaux de réhabilitation.

DATE ET LIEU : Samedi 29 novembre 2025 de 11h à 18h
Place centrale du Quartier des Arts, 8 rue des Fonderies

AU PROGRAMME :
Discours des élus, visites guidées des nouvelles installations, expositions d'artistes locaux, concerts, foodtrucks bio, ateliers de création pour les enfants.

L'événement est ouvert à tous, gratuit, sans inscription préalable.

Mairie de Saint-Étienne — Direction de l'Urbanisme et de l'Architecture`,
    question: "Ce document est…",
    optionA: "un article de presse sur la rénovation urbaine.",
    optionB: "une invitation à une inauguration officielle.",
    optionC: "un programme culturel mensuel de la ville.",
    optionD: "un appel d'offres pour des travaux d'urbanisme.",
    correctAnswer: 'B',
  }));

  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La mairie a accordé le ___ de construire pour ce projet résidentiel après examen du dossier technique.",
    question: PHRASE_Q,
    optionA: "plan",
    optionB: "permis",
    optionC: "droit",
    optionD: "accord",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'entrepreneur a présenté son ___ aux investisseurs pour obtenir les fonds nécessaires au lancement de son projet.",
    question: PHRASE_Q,
    optionA: "bilan",
    optionB: "contrat",
    optionC: "business plan",
    optionD: "devis",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le réalisateur a supervisé personnellement le ___ du film pendant trois semaines en salle de montage numérique.",
    question: PHRASE_Q,
    optionA: "scénario",
    optionB: "montage",
    optionC: "tournage",
    optionD: "casting",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'agronome a analysé la composition du ___ pour déterminer les amendements nécessaires à une bonne récolte.",
    question: PHRASE_Q,
    optionA: "terrain",
    optionB: "sol",
    optionC: "champ",
    optionD: "paysage",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Conformément à la loi sur la consommation, le client bénéficie d'une ___ légale de deux ans pour tout défaut de conformité.",
    question: PHRASE_Q,
    optionA: "assurance",
    optionB: "garantie",
    optionC: "promesse",
    optionD: "certification",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En Occitanie, de nombreux panneaux de signalisation sont bilingues, en français et en ___ occitan.",
    question: PHRASE_Q,
    optionA: "langue",
    optionB: "dialecte",
    optionC: "patois",
    optionD: "argot",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_1 =
    "L'agriculture biologique se distingue par l'utilisation d'un [14] officiel garantissant l'absence de produits chimiques de synthèse. Chaque exploitation bio est soumise à un [15] régulier par un organisme indépendant pour s'assurer du respect des cahiers des charges.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'agriculture biologique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "label",
    optionB: "prix",
    optionC: "brevet",
    optionD: "statut",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — L'agriculture biologique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "suivi",
    optionB: "contrôle",
    optionC: "rapport",
    optionD: "bilan",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La gentrification se produit lorsque la [16] d'un quartier populaire attire de nouveaux résidents plus aisés, entraînant une hausse des loyers. Les anciens [17] à faibles revenus sont alors contraints de quitter leurs logements pour s'installer dans des zones périphériques moins chères.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La gentrification urbaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "rénovation",
    optionB: "construction",
    optionC: "démolition",
    optionD: "expansion",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La gentrification urbaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "propriétaires",
    optionB: "locataires",
    optionC: "commerçants",
    optionD: "touristes",
    correctAnswer: 'B',
  }));

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel type de film est une œuvre basée sur des faits réels sans acteurs professionnels ?",
    optionA: "Film 1",
    optionB: "Film 2",
    optionC: "Film 3",
    optionD: "Film 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle certification est la certification officielle de l'agriculture biologique en France ?",
    optionA: "Certification 1",
    optionB: "Certification 2",
    optionC: "Certification 3",
    optionD: "Certification 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel statut d'entreprise est une société à responsabilité limitée avec au moins 2 associés ?",
    optionA: "Statut 1",
    optionB: "Statut 2",
    optionC: "Statut 3",
    optionD: "Statut 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle langue régionale est une langue romane parlée dans le sud de la France et reconnue comme langue régionale ?",
    optionA: "Langue 1",
    optionB: "Langue 2",
    optionC: "Langue 3",
    optionD: "Langue 4",
    correctAnswer: 'B',
  }));

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le secteur numérique a connu la plus forte croissance de créations d'entreprises entre 2019 et 2023 avec une augmentation de 67%. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Contrat de franchise — Bistrot Nature",
    longText: DOC_CONTRAT_FRANCHISE,
    question: "Ce document est principalement…",
    optionA: "un contrat de location de local commercial.",
    optionB: "un contrat de franchise pour exploiter un restaurant.",
    optionC: "un accord de partenariat entre deux restaurateurs.",
    optionD: "un règlement intérieur de restaurant.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Contrat de franchise — Bistrot Nature",
    longText: DOC_CONTRAT_FRANCHISE,
    question: "Selon ce contrat, quelle redevance mensuelle le franchisé doit-il verser au franchiseur ?",
    optionA: "Un montant fixe de 1 000 € par mois.",
    optionB: "6% du chiffre d'affaires hors taxes.",
    optionC: "10% des bénéfices nets mensuels.",
    optionD: "Une redevance annuelle de 30 000 €.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chef de projet urbanisme",
    longText: DOC_OFFRE_URBANISME,
    question: "Pour ce poste de chef de projet urbanisme, l'employeur exige…",
    optionA: "Un BTS en travaux publics et 2 ans d'expérience.",
    optionB: "Un diplôme d'urbaniste ou architecte et 5 ans d'expérience minimum.",
    optionC: "Un master en géographie et aucune expérience préalable.",
    optionD: "Un doctorat en droit de l'urbanisme uniquement.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Chef de projet urbanisme",
    longText: DOC_OFFRE_URBANISME,
    question: "Ce poste est proposé par…",
    optionA: "Un cabinet d'architecture privé.",
    optionB: "La Direction de l'Aménagement de la Mairie de Lyon.",
    optionC: "Une entreprise de construction nationale.",
    optionD: "Un organisme de logement social.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Label Agriculture Biologique",
    longText: DOC_CAHIER_BIO,
    question: "Ce document présente principalement…",
    optionA: "Les tarifs des emplacements au marché bio.",
    optionB: "Les critères à satisfaire pour vendre sur le marché bio.",
    optionC: "Les recettes de produits biologiques.",
    optionD: "Le règlement de sécurité alimentaire européen.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Label Agriculture Biologique",
    longText: DOC_CAHIER_BIO,
    question: "Selon ce cahier des charges, qu'est-il strictement interdit aux vendeurs du marché ?",
    optionA: "De vendre des produits transformés.",
    optionB: "De revendre des produits achetés à d'autres producteurs.",
    optionC: "De tenir un stand sans assistance.",
    optionD: "D'utiliser des emballages plastiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement de litiges consommateurs — Service de Médiation",
    longText: DOC_MEDIATEUR,
    question: "Ce document explique principalement…",
    optionA: "La procédure pour porter plainte devant un tribunal.",
    optionB: "La procédure gratuite de médiation pour régler un litige consommateur.",
    optionC: "Les droits des consommateurs lors d'un achat en ligne.",
    optionD: "Les sanctions pour les entreprises qui refusent les remboursements.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement de litiges consommateurs — Service de Médiation",
    longText: DOC_MEDIATEUR,
    question: "Avant de saisir le médiateur, le consommateur doit obligatoirement…",
    optionA: "Payer une caution de garantie.",
    optionB: "Avoir adressé une réclamation écrite au professionnel sans réponse satisfaisante.",
    optionC: "Obtenir l'accord d'un avocat spécialisé.",
    optionD: "Déposer une plainte au commissariat.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Convention de partenariat culturel — Promotion de la langue française",
    longText: DOC_CONVENTION_LANGUE,
    question: "Cette convention de partenariat a été conclue entre…",
    optionA: "Le Ministère des Affaires Étrangères et l'UNESCO.",
    optionB: "L'AEFE et l'Institut Français.",
    optionC: "La France et l'Union Africaine.",
    optionD: "L'OIF et les ambassades de France en Afrique.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Convention de partenariat culturel — Promotion de la langue française",
    longText: DOC_CONVENTION_LANGUE,
    question: "Selon la convention, combien d'enseignants de français seront formés chaque année ?",
    optionA: "200 enseignants.",
    optionB: "500 enseignants.",
    optionC: "1 000 enseignants.",
    optionD: "2 000 enseignants.",
    correctAnswer: 'B',
  }));

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Le renouveau du cinéma d'auteur français : entre héritage et rupture",
    longText: ART_CINEMA,
    question: "Selon cet article, de quelle tradition les nouveaux cinéastes français héritent-ils tout en cherchant à s'en émanciper ?",
    optionA: "Le cinéma américain hollywoodien.",
    optionB: "La Nouvelle Vague.",
    optionC: "Le néoréalisme italien.",
    optionD: "Le cinéma expressionniste allemand.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Le renouveau du cinéma d'auteur français : entre héritage et rupture",
    longText: ART_CINEMA,
    question: "D'après l'article, quel est le rôle des festivals comme Cannes, Berlin et Venise pour le cinéma d'auteur ?",
    optionA: "Financer directement les films indépendants.",
    optionB: "Constituer des vitrines mondiales qui transforment la carrière des réalisateurs.",
    optionC: "Former de nouveaux réalisateurs et scénaristes.",
    optionD: "Distribuer les films dans les salles commerciales.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Agriculture biologique et souveraineté alimentaire",
    longText: ART_AGRIBIO,
    question: "Selon cet article, quelle part de la surface agricole française est désormais en agriculture biologique ?",
    optionA: "5%",
    optionB: "10%",
    optionC: "20%",
    optionD: "30%",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Agriculture biologique et souveraineté alimentaire",
    longText: ART_AGRIBIO,
    question: "Selon les critiques cités dans l'article, quel est le principal inconvénient de l'agriculture biologique ?",
    optionA: "Elle produit des aliments de moins bonne qualité.",
    optionB: "Ses rendements sont inférieurs de 20 à 30% à l'agriculture conventionnelle.",
    optionC: "Elle nécessite plus d'eau que l'agriculture conventionnelle.",
    optionD: "Elle est subventionnée de manière injuste par les pouvoirs publics.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Gentrification et droit au logement",
    longText: ART_GENTRIF,
    question: "Selon cet article, quel pourcentage de logements sociaux la loi SRU impose-t-elle aux communes ?",
    optionA: "15%",
    optionB: "20%",
    optionC: "25%",
    optionD: "30%",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Gentrification et droit au logement",
    longText: ART_GENTRIF,
    question: "D'après l'article, l'encadrement des loyers est expérimenté notamment dans…",
    optionA: "Toutes les communes de France simultanément.",
    optionB: "Paris et plusieurs grandes villes.",
    optionC: "Uniquement les quartiers historiquement ouvriers.",
    optionD: "Les zones rurales à faible densité.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Francophonie et diversité linguistique",
    longText: ART_FRANCO,
    question: "Selon cet article, combien de locuteurs rassemble la Francophonie internationale aujourd'hui ?",
    optionA: "100 millions",
    optionB: "200 millions",
    optionC: "300 millions",
    optionD: "500 millions",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Francophonie et diversité linguistique",
    longText: ART_FRANCO,
    question: "D'après l'auteur, vers quel modèle la Francophonie doit-elle évoluer pour rester pertinente ?",
    optionA: "La promotion exclusive du français comme unique langue internationale.",
    optionB: "Un modèle valorisant le plurilinguisme et le dialogue avec les langues partenaires.",
    optionC: "Le remplacement de l'anglais par le français dans les organisations internationales.",
    optionD: "L'abandon des langues africaines au profit du français standard.",
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
    console.log(`\n✅ ${created} questions créées pour CE 23.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
