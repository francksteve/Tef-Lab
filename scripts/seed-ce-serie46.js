'use strict';
/**
 * seed-ce-serie46.js
 * Peuple la série CE 46 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie46.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyom8r00160wxl0550lg2e';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts (audience presse par format) ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [72, 45, 38, 55], color: '#E30613' },
    { label: 'Graphique 2', data: [55, 40, 70, 48], color: '#E30613' },
    { label: 'Graphique 3', data: [30, 45, 61, 42], color: '#003087' }, // CORRECT
    { label: 'Graphique 4', data: [80, 60, 35, 20], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Print', 'Web', 'Mobile', 'TV'];
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Audience (%)</text>`;
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
  { title: 'Jardin 1', content: "Roseraie municipale du Parc des Bruyères : plus de 2 000 variétés de roses cultivées en pleine terre. Ouvert au public de mai à octobre, entrée libre. Les rosiers sont étiquetés selon leur origine géographique. Visites guidées les dimanches de 10 h à 12 h." },
  { title: 'Jardin 2', content: "Arboretum de la Vallée Verte : collection de 350 espèces ligneuses — arbres et arbustes — d'origines diverses, maintenues à des fins scientifiques et pédagogiques. Accès chercheurs sur accréditation. Ouvert au public les samedis de mai à septembre." },
  { title: 'Jardin 3', content: "Jardin médiéval de l'Abbaye Saint-Pierre : plantes médicinales et aromatiques cultivées selon les méthodes du Moyen Âge. Atelier de phytothérapie les mercredis après-midi. Entrée : 5 € adulte. Fermé en janvier et février." },
  { title: 'Jardin 4', content: "Serre tropicale du Jardin des Sciences : espace climatisé abritant 500 espèces de plantes exotiques. Température maintenue à 28 °C toute l'année. Animations scolaires sur réservation. Tarif famille : 12 €." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Spécialité 1', content: "Macaron parisien : confiserie légère composée de deux coques en meringue à base de poudre d'amande et de blanc d'œuf, garnies de ganache, crème ou confiture. Emblème de la haute pâtisserie française, disponible en de nombreuses saveurs." },
  { title: 'Spécialité 2', content: "Kouign-amann : gâteau breton feuilleté caramélisé à base de pâte levée, de beurre salé et de sucre. La cuisson fait remonter le beurre et le sucre qui caramélisent en surface. Spécialité de Douarnenez créée en 1860." },
  { title: 'Spécialité 3', content: "Mille-feuille : pâtisserie composée de trois couches de pâte feuilletée alternées avec de la crème pâtissière à la vanille, le tout recouvert d'un glaçage au fondant blanc et chocolat. Dessert classique des boulangeries françaises." },
  { title: 'Spécialité 4', content: "Opéra : gâteau rectangulaire élaboré, composé de couches de biscuit Joconde imbibé de café, de crème au beurre au café et de ganache au chocolat noir, le tout nappé d'un miroir chocolat brillant." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Statut 1', content: "Statut de réfugié reconnu : accordé aux personnes fuyant leur pays en raison de persécutions fondées sur la race, la religion, la nationalité, l'appartenance à un groupe social ou les opinions politiques, conformément à la Convention de Genève de 1951." },
  { title: 'Statut 2', content: "Protection subsidiaire : statut accordé aux personnes ne pouvant être renvoyées dans leur pays en raison de risques graves — peine de mort, torture, violence aveugle en conflit armé — sans remplir strictement les critères de réfugié de la Convention." },
  { title: 'Statut 3', content: "Visa humanitaire : titre de séjour provisoire accordé pour des raisons exceptionnelles de santé ou de danger immédiat. Durée limitée à 6 mois, renouvelable une fois sous conditions médicales ou sécuritaires dûment justifiées." },
  { title: 'Statut 4', content: "Autorisation provisoire de séjour (APS) : document délivré en attente de la décision définitive sur une demande de titre de séjour. Permet de résider légalement et de travailler temporairement sur le territoire pendant l'instruction du dossier." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Discipline 1', content: "Lutte gréco-romaine : sport olympique consistant à projeter l'adversaire au sol en n'utilisant que la partie supérieure du corps. Les prises de jambes sont interdites. Les combattants s'affrontent sur un tapis circulaire de 9 mètres de diamètre." },
  { title: 'Discipline 2', content: "Judo : art martial japonais devenu sport olympique en 1964 basé sur les projections, les immobilisations et les soumissions. L'ippon, projection parfaite ou immobilisation de 20 secondes, donne la victoire immédiate. Pratiqué par 40 millions de personnes." },
  { title: 'Discipline 3', content: "Taekwondo : art martial coréen olympique depuis 2000, privilégiant les techniques de jambes et les coups de pied sautés et pivotés. Les compétitions par catégories de poids utilisent un système de protections électroniques pour comptabiliser les points." },
  { title: 'Discipline 4', content: "Karaté : art martial japonais basé sur les coups de poing, de pied, de genou et de coude. A été sport olympique uniquement aux Jeux de Tokyo 2020. Deux disciplines : le kata (formes codifiées) et le kumite (combat contrôlé avec protection)." },
]);

/* ── Documents Q23-32 ── */
const DOC_ASILE =
`GUIDE DU DEMANDEUR D'ASILE — PROCÉDURE DE PREMIÈRE INSTANCE

La demande d'asile doit être déposée auprès de l'Office de Protection des Réfugiés et Apatrides (OPRA) dans les 90 jours suivant l'entrée sur le territoire national. Passé ce délai, la demande sera traitée selon une procédure accélérée.

Le demandeur doit se présenter en personne au guichet d'enregistrement, muni d'une pièce d'identité ou de tout document prouvant son identité et sa nationalité. Un formulaire de demande sera remis lors de cette première visite, accompagné d'une convocation pour l'entretien individuel.

L'entretien avec un officier de protection est confidentiel. Le demandeur peut se faire accompagner d'un avocat ou d'un représentant d'une association agréée. Un interprète est mis à disposition gratuitement si nécessaire.

La décision est notifiée par courrier recommandé dans un délai de six mois à compter de l'enregistrement du dossier complet.`;

const DOC_JOURNALISTE =
`OFFRE D'EMPLOI — JOURNALISTE D'INVESTIGATION
Rédaction nationale — CDI statut journaliste

Notre groupe de presse indépendant recrute un(e) journaliste d'investigation confirmé(e) pour renforcer sa cellule enquêtes.

Missions : mener des enquêtes de fond sur des sujets politiques, économiques et sociaux ; recouper les sources, protéger les lanceurs d'alerte ; rédiger des articles longs formats ; participer aux conférences de rédaction hebdomadaires.

Profil : diplôme d'école de journalisme ou équivalent reconnu, minimum 5 ans d'expérience en investigation, maîtrise des outils OSINT, sens éthique irréprochable, résistance au stress.

Rémunération : grille conventionnelle journaliste + prime enquête. Mutuelle prise en charge à 100 %. Congés supplémentaires pour reportages longue durée.

Candidatures à adresser à recrutement@presseinvestigation.fr avant le 30 du mois en cours.`;

const DOC_JARDIN_BOTANIQUE =
`CONVENTION DE PARTENARIAT SCIENTIFIQUE
Entre le Jardin Botanique National et l'Université des Sciences du Vivant

Article 1 — Objet
Le présent accord établit un partenariat de recherche pour la conservation ex-situ d'espèces végétales menacées. Le Jardin Botanique met à disposition ses installations et sa banque de graines ; l'Université apporte son expertise génomique.

Article 2 — Durée
La convention est conclue pour une durée de trois ans, renouvelable par tacite reconduction, à compter de la date de signature.

Article 3 — Obligations des parties
Le Jardin Botanique s'engage à maintenir les collections vivantes dans des conditions optimales et à documenter chaque accession. L'Université s'engage à publier les résultats de recherche en accès ouvert et à former des étudiants sur site.

Article 4 — Propriété intellectuelle
Les résultats de recherche sont la propriété conjointe des deux institutions. Toute valorisation commerciale nécessite l'accord écrit préalable des deux directeurs.`;

const DOC_JUDO =
`RÈGLEMENT GÉNÉRAL DE LA FÉDÉRATION NATIONALE DE JUDO

Article 12 — Catégories de compétition
Les compétitions sont organisées par catégories de poids et d'âge. Les benjamins (10-12 ans) participent uniquement aux compétitions régionales. Les juniors et seniors peuvent accéder aux championnats nationaux et internationaux sous réserve d'une licence valide et d'un certificat médical de non-contre-indication daté de moins d'un an.

Article 13 — Déroulement des combats
La durée réglementaire d'un combat est de 4 minutes pour les seniors. L'arbitre central est assisté de deux juges de table. L'ippon met fin immédiatement au combat. En cas d'égalité, une prolongation de type golden score est disputée sans limite de temps jusqu'à la première marque.

Article 14 — Sanctions et suspensions
Tout comportement antisportif, doping avéré ou fraude documentaire entraîne une suspension minimum de 6 mois. Les récidives sont sanctionnées par une exclusion définitive de toute compétition fédérale.`;

const DOC_PATISSERIE =
`CAHIER DES CHARGES — LABEL PÂTISSERIE ARTISANALE CERTIFIÉE

Le label « Pâtisserie Artisanale Certifiée » (PAC) est décerné aux établissements respectant l'ensemble des critères suivants :

1. Fabrication : tous les produits sont fabriqués sur place par un artisan titulaire du CAP Pâtissier ou d'un diplôme équivalent. L'utilisation de préparations industrielles semi-finies est interdite pour les produits phares (tartes, entremets, viennoiseries).

2. Matières premières : minimum 80 % de produits frais et locaux (rayon de 150 km). Les œufs sont issus d'élevages en plein air. Le beurre utilisé est de qualité AOP.

3. Hygiène : les locaux sont soumis à une inspection trimestrielle par un organisme certificateur agréé. Température de conservation des crèmes : 0 à 4 °C en permanence.

4. Affichage : les allergènes sont obligatoirement mentionnés pour chaque produit exposé.`;

/* ── Articles de presse Q33-40 ── */
const ART_DESINFORMATION =
`DÉSINFORMATION NUMÉRIQUE ET DÉMOCRATIE : UN DÉFI SANS PRÉCÉDENT

La prolifération des fausses informations sur les réseaux sociaux constitue aujourd'hui l'une des menaces les plus sérieuses pesant sur le fonctionnement démocratique des sociétés modernes. Des études menées dans plusieurs pays européens révèlent qu'une information erronée se propage six fois plus vite sur les plateformes numériques qu'une information vérifiée. Ce phénomène s'explique par les mécanismes algorithmiques qui favorisent le contenu suscitant des réactions émotionnelles fortes — indignation, peur, colère — au détriment de la nuance factuelle.

Face à cette réalité, plusieurs approches coexistent. Certains gouvernements misent sur la régulation des plateformes, les contraignant à retirer rapidement les contenus manifestement faux sous peine d'amendes significatives. D'autres privilégient l'éducation aux médias, intégrant des cours de vérification des sources dès le collège. Les plateformes elles-mêmes développent des systèmes de fact-checking automatisé et de signalement communautaire, dont l'efficacité reste débattue.

Le paradoxe est que la lutte contre la désinformation soulève à son tour des questions fondamentales sur la liberté d'expression. Qui décide de ce qui est vrai ? Quel organisme peut légitimement arbitrer entre faits et opinions ? Ces questions n'ont pas de réponse simple dans des sociétés où la confiance dans les institutions médiatiques et politiques est en baisse constante.

La solution réside probablement dans une combinaison de mesures : renforcement de la transparence algorithmique, développement de l'esprit critique individuel, et soutien public à un journalisme de qualité indépendant capable de jouer son rôle de contre-pouvoir.`;

const ART_JARDINS_BIO =
`JARDINS BOTANIQUES ET CRISE DE LA BIODIVERSITÉ : DES ARCHES DE NOÉ VÉGÉTALES

Alors que le rapport de l'IPBES estime qu'un million d'espèces végétales et animales sont menacées d'extinction à l'échelle planétaire, les jardins botaniques s'imposent comme des acteurs incontournables de la conservation. Ces institutions, longtemps perçues comme de simples lieux de promenade, ont profondément transformé leur mission au cours des trois dernières décennies.

La conservation ex-situ — c'est-à-dire hors du milieu naturel — constitue désormais une priorité absolue. Les jardins botaniques du réseau mondial Botanic Gardens Conservation International (BGCI) maintiennent des collections vivantes représentant près de 40 % des espèces végétales connues. Leurs banques de graines conservées à très basse température (-20 °C) constituent des réserves génétiques précieuses pour les programmes de réintroduction future dans des habitats restaurés.

Mais la conservation ex-situ ne suffit pas. Les scientifiques insistent sur la nécessité de protéger également les milieux naturels — forêts tropicales, zones humides, prairies — qui constituent les seuls espaces où les écosystèmes complexes peuvent fonctionner pleinement. La conservation in-situ et ex-situ sont complémentaires et non substituables l'une à l'autre.

Les jardins botaniques jouent également un rôle d'éducation publique irremplaçable : en rendant tangible la diversité du vivant, ils sensibilisent des millions de visiteurs à l'urgence de la crise écologique et créent les conditions d'un soutien populaire aux politiques de conservation.`;

const ART_MIGRATION =
`POLITIQUES D'ACCUEIL DES MIGRANTS : ENTRE HUMANITÉ ET CONTRAINTES INSTITUTIONNELLES

La question migratoire est au cœur des débats politiques européens depuis plus d'une décennie, oscillant entre exigences humanitaires et contraintes institutionnelles réelles. Le droit international, incarné par la Convention de Genève de 1951 et ses protocoles additionnels, impose aux États signataires des obligations claires envers les personnes persécutées. Pourtant, la mise en œuvre concrète de ces obligations varie considérablement d'un pays à l'autre.

Certains États ont développé des politiques d'intégration ambitieuses incluant des cours de langue gratuits et intensifs, des programmes de reconnaissance des qualifications étrangères et un accompagnement vers l'emploi. L'Allemagne, face à sa pénurie démographique et à ses besoins en main-d'œuvre qualifiée, a fait le choix d'investir massivement dans l'accueil et l'intégration des réfugiés depuis 2015. Les résultats, bien qu'inégaux, montrent qu'une politique volontariste peut transformer un défi humanitaire en opportunité économique.

D'autres pays, sous la pression de mouvements nationalistes, ont durci leurs législations d'accueil, allongeant les délais de traitement des demandes d'asile, réduisant les aides sociales ou externalisant les contrôles aux frontières. Ces approches soulèvent des préoccupations sérieuses sur le plan du respect des droits fondamentaux.

La réalité est que ni la politique du « tout accueillir » ni celle du « tout refuser » ne constitue une réponse viable à long terme. Une approche équilibrée, fondée sur des critères clairs, des procédures rapides et équitables, et un engagement sincère des États à partager les responsabilités, reste la voie la plus prometteuse.`;

const ART_ARTS_MARTIAUX =
`ARTS MARTIAUX ET VALEURS ÉDUCATIVES : AU-DELÀ DU SPORT DE COMBAT

Les arts martiaux — judo, karaté, taekwondo, aïkido — connaissent un essor remarquable dans les systèmes éducatifs de nombreux pays, portés par une conviction croissante : leur pratique régulière développe chez les jeunes des qualités qui dépassent largement le cadre sportif. Discipline, respect de l'adversaire, maîtrise de soi, persévérance face à l'échec — ces valeurs, constitutives des arts martiaux, répondent à des besoins éducatifs que l'école peine parfois à satisfaire.

Des études menées au Japon et en France montrent que les enfants pratiquant un art martial à l'école présentent de meilleures aptitudes à la gestion des conflits interpersonnels. La codification des techniques et des rituels — saluts, ceintures progressives, kata — crée un cadre rassurant et structurant pour des enfants qui manquent parfois de repères. La progression visible à travers les grades constitue un système motivationnel efficace, particulièrement bénéfique pour les élèves en difficulté scolaire.

Cependant, certains pédagogues alertent sur les dérives possibles : une pratique axée uniquement sur la compétition et la performance peut générer pression et anxiété, contredisant les valeurs originelles de ces disciplines. Le succès éducatif des arts martiaux dépend largement de la formation et de l'éthique des enseignants.

Dans un contexte de préoccupations croissantes sur la violence scolaire et le harcèlement, l'intégration des arts martiaux dans les programmes sportifs scolaires apparaît comme une piste prometteuse, à condition d'en respecter l'esprit philosophique originel.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche salon pâtisserie artisanale
  qs.push(q(1, 'Q1-7', null, {
    longText:
`SALON DE LA PÂTISSERIE ARTISANALE — Édition 2025

Du vendredi 14 au dimanche 16 novembre
Palais des Expositions — Hall B — Paris

Au programme :
• Concours national du meilleur croissant artisanal (samedi 10 h)
• Démonstrations de pâtissiers MOF en direct (toutes les 2 h)
• Dégustations gratuites de 14 h à 16 h chaque jour
• Espace jeunes : initiation pâtisserie pour enfants (sur inscription)

Tarif entrée : 15 € / Gratuit moins de 12 ans
Renseignements : salon-patisserie.fr`,
    question: "Ce document est…",
    optionA: "une recette de pâtisserie artisanale.",
    optionB: "le programme d'un salon professionnel avec concours et dégustations.",
    optionC: "une publicité pour une école de pâtisserie.",
    optionD: "un compte rendu de compétition culinaire.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme jardin botanique
  qs.push(q(2, 'Q1-7', null, {
    longText:
`JARDIN BOTANIQUE DES QUATRE-SAISONS — Programme 2025

PRINTEMPS (mars–mai) : Floraison des cerisiers — visites guidées gratuites les week-ends
ÉTÉ (juin–août) : Roseraie en fleurs — ateliers jardinage pour enfants le mercredi
AUTOMNE (sept–nov) : Couleurs des érables — exposition champignons et lichens
HIVER (déc–fév) : Serres tropicales accessibles — nocturnes illuminées en décembre

Tarifs : Adulte 8 € | Réduit 5 € | Gratuit moins de 6 ans
Abonnement annuel famille : 45 €
Ouvert tous les jours de 9 h à 19 h (été) et de 9 h à 17 h (hiver)`,
    question: "D'après ce document, quand peut-on voir les cerisiers en fleurs ?",
    optionA: "En hiver, lors des nocturnes illuminées.",
    optionB: "En été, pendant les ateliers jardinage.",
    optionC: "Au printemps, lors de visites guidées gratuites.",
    optionD: "En automne, à l'exposition champignons.",
    correctAnswer: 'C',
  }));

  // Q3 — Règlement association migrants
  qs.push(q(3, 'Q1-7', null, {
    longText:
`ASSOCIATION SOLIDARITÉ MIGRANTS — Règlement intérieur

Services proposés aux bénéficiaires :
• Aide administrative (remplissage formulaires, traduction)
• Cours de français niveaux A1 à B2 — lundis, mercredis, vendredis 18 h à 20 h
• Permanences juridiques : jeudis de 14 h à 18 h sur rendez-vous
• Accès espace informatique : mardis et jeudis 10 h à 12 h

Conditions d'accès : présenter un titre de séjour ou une attestation de demande d'asile en cours. Inscription obligatoire à l'accueil avant toute participation.

L'association est ouverte du lundi au vendredi de 9 h à 20 h.
Contact : accueil@solidarite-migrants.org`,
    question: "D'après ce document, les permanences juridiques ont lieu…",
    optionA: "tous les jours de la semaine sur présentation d'une pièce d'identité.",
    optionB: "les lundis, mercredis et vendredis de 18 h à 20 h.",
    optionC: "les jeudis de 14 h à 18 h sur rendez-vous.",
    optionD: "les mardis et jeudis de 10 h à 12 h sans réservation.",
    correctAnswer: 'C',
  }));

  // Q4 — Petite annonce cours judo adultes
  qs.push(q(4, 'Q1-7', null, {
    longText:
`CLUB DE JUDO OLYMPIQUE — Cours adultes saison 2025-2026

Vous souhaitez découvrir ou reprendre le judo ?
Notre club affilié à la Fédération Nationale vous accueille !

• Cours débutants adultes : mardis et jeudis 19 h – 20 h 30
• Cours avancés (ceinture orange et plus) : mardis et samedis 20 h 30 – 22 h
• Stage intensif vacances scolaires : nous contacter

Tarif annuel : 280 € (licence fédérale incluse)
Équipement : kimono obligatoire dès le 2e cours (location possible la 1ère séance)

Contactez Maître Dupont : 06 12 34 56 78 ou judo-olympique@club.fr`,
    question: "Ce document est…",
    optionA: "un règlement de compétition de judo.",
    optionB: "une petite annonce proposant des cours de judo pour adultes.",
    optionC: "un article sur l'histoire du judo.",
    optionD: "un programme de championnat régional.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi balance de précision pâtisserie
  qs.push(q(5, 'Q1-7', null, {
    longText:
`BALANCE DE PRÉCISION PÂTISSERIE PRO — GUIDE D'UTILISATION

MISE EN MARCHE : Appuyez 2 secondes sur le bouton ON/TARE. L'écran affiche « 0,0 g ».

PESÉE :
1. Posez votre récipient vide sur le plateau.
2. Appuyez sur TARE pour remettre à zéro (la tare du récipient est soustraite).
3. Versez l'ingrédient à peser. Le poids s'affiche en temps réel.
4. Précision : ± 0,1 g. Capacité maximale : 5 000 g.

CHANGEMENT D'UNITÉ : appuyer brièvement sur MODE pour basculer entre g / oz / ml.

ENTRETIEN : ne jamais immerger dans l'eau. Nettoyer avec un chiffon légèrement humide.

⚠ Ne pas dépasser la charge maximale de 5 000 g.`,
    question: "D'après ce document, pour peser un ingrédient sans compter le poids du récipient, il faut…",
    optionA: "retirer le récipient avant la pesée.",
    optionB: "appuyer sur TARE après avoir posé le récipient vide.",
    optionC: "soustraire manuellement le poids du récipient.",
    optionD: "changer l'unité de mesure avec le bouton MODE.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué presse (liberté information)
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE — Syndicat National des Journalistes

Paris, le 3 mai 2025 — À l'occasion de la Journée Mondiale de la Liberté de la Presse, le Syndicat National des Journalistes (SNJ) tient à rappeler que la liberté d'informer est un droit fondamental, constitutif de toute démocratie vivante.

Le SNJ exprime sa vive préoccupation face à la multiplication des poursuites judiciaires visant des journalistes d'investigation en Europe. En 2024, 47 journalistes ont été poursuivis dans des pays membres de l'Union Européenne pour des articles d'intérêt public.

Le SNJ demande aux gouvernements européens de renforcer les protections légales des journalistes et des lanceurs d'alerte, et d'adopter sans délai une directive anti-SLAPP contraignante.

Contact presse : communication@snj.fr`,
    question: "Ce communiqué de presse exprime principalement…",
    optionA: "la satisfaction du syndicat face aux progrès de la liberté de presse.",
    optionB: "une préoccupation face aux poursuites judiciaires contre des journalistes.",
    optionC: "une annonce de grève nationale des journalistes.",
    optionD: "une demande d'augmentation salariale pour la profession.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation conférence droits humains migrations
  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — CONFÉRENCE INTERNATIONALE

« Droits humains et migrations : défis contemporains »
Vendredi 23 mai 2025 — 9 h à 18 h
Amphithéâtre Victor Hugo — Université Paris-Centre

Programme :
9 h 00 — Ouverture par le Doyen de la Faculté de Droit
9 h 30 — Conférence inaugurale : Pr. Amina Diallo (HCR)
11 h 00 — Table ronde : juristes, ONG, représentants gouvernementaux
14 h 00 — Ateliers thématiques (mineurs isolés, femmes migrantes, droit d'asile)
17 h 00 — Synthèse et perspectives

Participation gratuite sur inscription obligatoire avant le 15 mai.
Inscription : colloques@univ-paris-centre.fr`,
    question: "Quel est le but principal de ce document ?",
    optionA: "Annoncer des modifications dans la loi sur l'asile.",
    optionB: "Inviter des personnes à une conférence sur les droits humains et les migrations.",
    optionC: "Informer les migrants de leurs droits administratifs.",
    optionD: "Présenter le programme d'un cours universitaire.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les études en sociologie numérique montrent que les ___ en ligne ont profondément modifié nos habitudes de communication quotidienne.",
    question: PHRASE_Q,
    optionA: "équipements",
    optionB: "pratiques",
    optionC: "règlements",
    optionD: "formations",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La technique du ___ consiste à étaler la pâte et le beurre en couches alternées pour obtenir un feuilletage croustillant et aéré.",
    question: PHRASE_Q,
    optionA: "pétrissage",
    optionB: "garnissage",
    optionC: "laminage",
    optionD: "dressage",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Toute personne qui fuit son pays en raison de persécutions peut déposer une demande d'___ auprès des autorités compétentes du pays d'accueil.",
    question: PHRASE_Q,
    optionA: "immigration",
    optionB: "naturalisation",
    optionC: "extradition",
    optionD: "asile",
    correctAnswer: 'D',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En judo, l'___ est la marque maximale accordée pour une projection parfaite ou une immobilisation de vingt secondes, mettant fin immédiatement au combat.",
    question: PHRASE_Q,
    optionA: "waza-ari",
    optionB: "yuko",
    optionC: "koka",
    optionD: "ippon",
    correctAnswer: 'D',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les géologues ont découvert un immense ___ météoritique dans cette région désertique, preuve d'un impact cosmique survenu il y a plusieurs millions d'années.",
    question: PHRASE_Q,
    optionA: "glacier",
    optionB: "volcan",
    optionC: "canyon",
    optionD: "cratère",
    correctAnswer: 'D',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La baisse du ___ des journaux imprimés a conduit de nombreux éditeurs à développer des offres d'abonnement numérique pour maintenir leurs revenus.",
    question: PHRASE_Q,
    optionA: "contenu",
    optionB: "personnel",
    optionC: "tirage",
    optionD: "format",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "À l'ère numérique, la presse traditionnelle fait face à une concurrence accrue des réseaux sociaux qui diffusent souvent des informations sans vérification. Ce phénomène favorise la propagation de la [14], qui peut influencer l'opinion publique et nuire à la démocratie. C'est pourquoi les journalistes professionnels insistent sur l'importance de la [15] systématique des faits avant toute publication.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La presse numérique et les réseaux sociaux',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "publicité",
    optionB: "désinformation",
    optionC: "communication",
    optionD: "réglementation",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La presse numérique et les réseaux sociaux',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "censure",
    optionB: "diffusion",
    optionC: "vérification",
    optionD: "sélection",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Les jardins botaniques jouent un rôle essentiel dans la conservation ex-situ des espèces végétales menacées. Leurs [16] conservent à très basse température des milliers de variétés végétales, constituant ainsi une réserve génétique précieuse. Sans ces institutions, de nombreuses plantes risqueraient l'[17] définitive en raison de la destruction de leurs habitats naturels.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Jardins botaniques et conservation ex-situ',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "expositions",
    optionB: "banques de graines",
    optionC: "collections vivantes",
    optionD: "laboratoires",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Jardins botaniques et conservation ex-situ',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "multiplication",
    optionB: "migration",
    optionC: "adaptation",
    optionD: "extinction",
    correctAnswer: 'D',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel jardin est principalement dédié à une collection scientifique d'arbres et d'arbustes de diverses espèces ?",
    optionA: "Jardin 1",
    optionB: "Jardin 2",
    optionC: "Jardin 3",
    optionD: "Jardin 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle spécialité est un gâteau breton feuilleté caramélisé à base de pâte levée, beurre salé et sucre ?",
    optionA: "Spécialité 1",
    optionB: "Spécialité 2",
    optionC: "Spécialité 3",
    optionD: "Spécialité 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel statut est accordé aux personnes ne pouvant être renvoyées dans leur pays en raison de risques graves, sans remplir les critères de réfugié ?",
    optionA: "Statut 1",
    optionB: "Statut 2",
    optionC: "Statut 3",
    optionD: "Statut 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle discipline est un art martial japonais olympique depuis 1964, basé sur les projections et immobilisations ?",
    optionA: "Discipline 1",
    optionB: "Discipline 2",
    optionC: "Discipline 3",
    optionD: "Discipline 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La presse numérique sur mobile représente désormais le mode de consultation dominant avec 61 % des lectures quotidiennes, dépassant tous les autres formats. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Guide du demandeur d'asile — Procédure de première instance",
    longText: DOC_ASILE,
    question: "Ce document présente principalement…",
    optionA: "les droits politiques des réfugiés reconnus.",
    optionB: "la procédure pour déposer une demande d'asile.",
    optionC: "les conditions d'obtention d'un visa touristique.",
    optionD: "les étapes pour obtenir la nationalité française.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Guide du demandeur d'asile — Procédure de première instance",
    longText: DOC_ASILE,
    question: "Selon ce document, dans quel délai la décision sur la demande d'asile est-elle notifiée ?",
    optionA: "Dans les 30 jours suivant le dépôt de la demande.",
    optionB: "Dans les 90 jours suivant l'entrée sur le territoire.",
    optionC: "Dans les six mois suivant l'enregistrement du dossier complet.",
    optionD: "Dans les deux ans suivant l'entretien individuel.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Journaliste d'investigation",
    longText: DOC_JOURNALISTE,
    question: "Cette offre d'emploi est destinée à…",
    optionA: "un journaliste débutant cherchant sa première expérience.",
    optionB: "un journaliste d'investigation confirmé avec au moins 5 ans d'expérience.",
    optionC: "un rédacteur en chef pour superviser l'ensemble de la rédaction.",
    optionD: "un photographe de presse spécialisé en reportage.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Journaliste d'investigation",
    longText: DOC_JOURNALISTE,
    question: "Parmi les avantages mentionnés dans cette offre, on trouve…",
    optionA: "un logement de fonction à Paris.",
    optionB: "une voiture de service pour les reportages.",
    optionC: "une mutuelle prise en charge à 100 % et des congés supplémentaires.",
    optionD: "un abonnement à toutes les bases de données journalistiques.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de partenariat scientifique — Jardin Botanique et Université",
    longText: DOC_JARDIN_BOTANIQUE,
    question: "L'objet principal de cette convention est…",
    optionA: "la commercialisation de plantes rares issues du jardin botanique.",
    optionB: "un partenariat de recherche pour la conservation de végétaux menacés.",
    optionC: "l'organisation de visites guidées pour le public scolaire.",
    optionD: "la création d'un nouveau jardin botanique universitaire.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de partenariat scientifique — Jardin Botanique et Université",
    longText: DOC_JARDIN_BOTANIQUE,
    question: "Selon la convention, qui possède les résultats de la recherche ?",
    optionA: "Uniquement le Jardin Botanique National.",
    optionB: "Uniquement l'Université des Sciences du Vivant.",
    optionC: "Les deux institutions conjointement.",
    optionD: "L'État qui finance la convention.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement général de la Fédération Nationale de Judo",
    longText: DOC_JUDO,
    question: "Ce document présente principalement…",
    optionA: "les techniques de projection autorisées en compétition.",
    optionB: "les conditions de participation aux compétitions et les sanctions disciplinaires.",
    optionC: "l'histoire du judo et ses origines japonaises.",
    optionD: "le programme des championnats internationaux de l'année.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement général de la Fédération Nationale de Judo",
    longText: DOC_JUDO,
    question: "Selon ce règlement, que se passe-t-il en cas d'égalité à la fin du temps réglementaire ?",
    optionA: "Les juges désignent le vainqueur selon les techniques utilisées.",
    optionB: "Le combat est annulé et rejoué ultérieurement.",
    optionC: "Une prolongation golden score est disputée jusqu'à la première marque.",
    optionD: "Un tirage au sort désigne le vainqueur.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Label Pâtisserie Artisanale Certifiée",
    longText: DOC_PATISSERIE,
    question: "Ce document décrit principalement…",
    optionA: "les recettes traditionnelles des pâtisseries labellisées.",
    optionB: "les critères pour obtenir le label de pâtisserie artisanale certifiée.",
    optionC: "les tarifs pratiqués par les pâtisseries artisanales.",
    optionD: "les formations disponibles pour les artisans pâtissiers.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Cahier des charges — Label Pâtisserie Artisanale Certifiée",
    longText: DOC_PATISSERIE,
    question: "Selon le cahier des charges, quelle proportion minimale de produits locaux est requise ?",
    optionA: "50 % de produits frais dans un rayon de 200 km.",
    optionB: "80 % de produits frais et locaux dans un rayon de 150 km.",
    optionC: "100 % de matières premières françaises.",
    optionD: "60 % de produits bio certifiés.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Désinformation numérique et démocratie : un défi sans précédent",
    longText: ART_DESINFORMATION,
    question: "Selon cet article, pourquoi les fausses informations se propagent-elles plus vite que les vraies ?",
    optionA: "Parce que les journalistes ne vérifient pas suffisamment leurs sources.",
    optionB: "Parce que les algorithmes favorisent les contenus provoquant des réactions émotionnelles fortes.",
    optionC: "Parce que les internautes préfèrent les informations négatives.",
    optionD: "Parce que les gouvernements ne régulent pas suffisamment les médias.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Désinformation numérique et démocratie : un défi sans précédent",
    longText: ART_DESINFORMATION,
    question: "L'auteur de l'article souligne que la lutte contre la désinformation soulève un paradoxe lié à…",
    optionA: "la difficulté technique de détecter les fausses informations.",
    optionB: "la liberté d'expression et la question de qui arbitre la vérité.",
    optionC: "le coût élevé des systèmes de fact-checking automatisé.",
    optionD: "l'impossibilité de former suffisamment de journalistes.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Jardins botaniques et crise de la biodiversité : des arches de Noé végétales",
    longText: ART_JARDINS_BIO,
    question: "Selon cet article, quelle proportion d'espèces végétales connues est représentée dans les jardins botaniques du réseau BGCI ?",
    optionA: "Environ 10 % des espèces végétales connues.",
    optionB: "Environ 25 % des espèces végétales connues.",
    optionC: "Près de 40 % des espèces végétales connues.",
    optionD: "Plus de 60 % des espèces végétales connues.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Jardins botaniques et crise de la biodiversité : des arches de Noé végétales",
    longText: ART_JARDINS_BIO,
    question: "L'auteur de l'article affirme que la conservation ex-situ et in-situ sont…",
    optionA: "concurrentes et ne peuvent pas coexister.",
    optionB: "complémentaires et non substituables l'une à l'autre.",
    optionC: "identiques dans leurs objectifs et méthodes.",
    optionD: "inutiles face à l'ampleur de la crise de biodiversité.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Politiques d'accueil des migrants : entre humanité et contraintes institutionnelles",
    longText: ART_MIGRATION,
    question: "Selon cet article, quel pays a choisi d'investir massivement dans l'accueil des réfugiés depuis 2015 ?",
    optionA: "La France.",
    optionB: "L'Espagne.",
    optionC: "L'Allemagne.",
    optionD: "La Suède.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Politiques d'accueil des migrants : entre humanité et contraintes institutionnelles",
    longText: ART_MIGRATION,
    question: "Quelle approche l'auteur présente-t-il comme la plus prometteuse face à la question migratoire ?",
    optionA: "La fermeture totale des frontières pour protéger les emplois nationaux.",
    optionB: "L'accueil illimité de tous les migrants sans conditions.",
    optionC: "Une approche équilibrée avec des critères clairs et un partage des responsabilités.",
    optionD: "La délégation de la gestion migratoire à des organisations privées.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Arts martiaux et valeurs éducatives : au-delà du sport de combat",
    longText: ART_ARTS_MARTIAUX,
    question: "Selon cet article, quelle qualité des arts martiaux est particulièrement bénéfique pour les élèves en difficulté scolaire ?",
    optionA: "La pratique intensive du combat qui développe la résistance physique.",
    optionB: "La progression visible à travers les grades qui constitue un système motivationnel.",
    optionC: "La compétition régulière qui habitue les élèves à la pression.",
    optionD: "Les voyages à l'étranger pour les compétitions internationales.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Arts martiaux et valeurs éducatives : au-delà du sport de combat",
    longText: ART_ARTS_MARTIAUX,
    question: "L'auteur met en garde contre une dérive possible des arts martiaux à l'école, qui serait…",
    optionA: "une pratique trop axée sur la compétition générant pression et anxiété.",
    optionB: "un manque de professeurs qualifiés dans les établissements scolaires.",
    optionC: "le risque de blessures graves pendant les entraînements.",
    optionD: "la difficulté d'adapter les techniques aux différentes morphologies.",
    correctAnswer: 'A',
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
    console.log(`\n✅ ${created} questions créées pour CE 46.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
