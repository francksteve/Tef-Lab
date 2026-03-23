'use strict';
/**
 * seed-ce-serie12.js
 * Peuple la série CE 12 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie12.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyofri00080wxlf9n34why';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts températures mensuelles 2 villes ── */
function generateQ22SVG() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  // Graphique correct = B (ville B dépasse 30°C en juillet/août)
  const graphs = [
    { label: 'Graphique 1', dataA: [5,7,10,14,18,22,24,23,19,14,9,5], dataB: [8,9,12,15,17,20,22,21,18,13,10,7], colorA: '#E30613', colorB: '#6b7280' },
    { label: 'Graphique 2', dataA: [3,5,9,13,17,21,24,23,18,13,7,4], dataB: [8,10,14,18,23,28,32,31,25,18,12,8], colorA: '#E30613', colorB: '#003087' }, // CORRECT
    { label: 'Graphique 3', dataA: [12,14,17,20,24,27,29,28,24,19,15,12], dataB: [10,11,13,16,19,22,25,24,20,16,12,10], colorA: '#E30613', colorB: '#6b7280' },
    { label: 'Graphique 4', dataA: [2,3,6,10,14,18,20,19,15,10,5,2], dataB: [1,2,5,9,13,17,19,18,14,9,4,1], colorA: '#E30613', colorB: '#6b7280' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 35, minVal = 0;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const stepX = plotW / (months.length - 1);

    const gridLines = [0, 10, 20, 30].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const pointsA = g.dataA.map((v, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `${px},${py}`;
    }).join(' ');

    const pointsB = g.dataB.map((v, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `${px},${py}`;
    }).join(' ');

    const xLabels = months.map((m, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${m}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + xLabels +
           `<polyline points="${pointsA}" fill="none" stroke="${g.colorA}" stroke-width="2"/>` +
           `<polyline points="${pointsB}" fill="none" stroke="${g.colorB}" stroke-width="2"/>` +
           `<text x="${cx + 90}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorA}">— Ville A</text>` +
           `<text x="${cx + 200}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorB}">— Ville B</text>`;
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
  { title: 'Musée 1', content: "Le Musée d'histoire naturelle propose une collection permanente de fossiles, minéraux et espèces animales naturalisées. Des expositions temporaires sur la préhistoire et l'évolution sont organisées chaque trimestre. Tarif adulte : 8 €. Ouvert du mardi au dimanche." },
  { title: 'Musée 2', content: "Le Musée d'art moderne présente exclusivement des œuvres contemporaines réalisées après 1970. Peintures abstraites, installations vidéo, sculptures conceptuelles. Les collections permanentes sont renouvelées chaque année avec de nouvelles acquisitions d'artistes vivants." },
  { title: 'Musée 3', content: "Le Musée archéologique régional réunit des vestiges de civilisations antiques : poteries, bijoux, outils en pierre et en métal issus de fouilles locales. Visite guidée disponible chaque samedi à 15 h. Entrée gratuite le premier dimanche du mois." },
  { title: 'Musée 4', content: "Le Musée de la Marine retrace l'histoire de la navigation depuis l'Antiquité jusqu'à l'ère moderne. Maquettes de bateaux, cartes nautiques anciennes, instruments de navigation. Situé au bord du port, accessible en bus ligne 7." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Sport 1', content: "Le ski de fond est une discipline nordique qui se pratique sur des pistes balisées en forêt ou en plaine enneigée. Les skieurs se propulsent eux-mêmes sans aide mécanique. Accessible à tous, idéal pour les familles et les débutants." },
  { title: 'Sport 2', content: "Le ski alpin se pratique sur des pentes damées reliées par des remontées mécaniques (télésièges, téléphériques, tapis roulants). Les skieurs descendent depuis le sommet vers la vallée. La station dispose de pistes de différents niveaux : verte, bleue, rouge et noire." },
  { title: 'Sport 3', content: "Le biathlon combine le ski de fond et le tir à la carabine. Les athlètes parcourent des distances à ski et s'arrêtent sur des pas de tir pour viser des cibles. Discipline olympique très exigeante, elle requiert une grande endurance et une précision absolue." },
  { title: 'Sport 4', content: "Le snowboard est une discipline de glisse sur neige utilisant une planche unique fixée aux deux pieds. Il se pratique en freestyle dans les snowparks, en freeride hors-piste, ou sur des pistes régulières. Très populaire chez les jeunes, il se pratique sans remontées mécaniques dédiées." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Transport 1', content: "Le bus urbain circule sur des voies publiques partagées avec les autres véhicules. Il s'arrête à des arrêts définis selon un horaire régulier. Alimenté au diesel ou au gaz naturel, il peut transporter jusqu'à 90 passagers selon le modèle." },
  { title: 'Transport 2', content: "Le tramway est un véhicule électrique qui circule sur des rails intégrés à la chaussée en milieu urbain. Il dessert des arrêts fixes avec une fréquence élevée. Silencieux et sans émissions directes, il constitue une alternative écologique au bus." },
  { title: 'Transport 3', content: "Le métro est un transport en commun souterrain ou aérien qui circule sur des rails dans un couloir dédié, entièrement séparé du trafic routier. Fréquence très élevée, capacité importante. Le réseau est généralement limité aux grandes agglomérations." },
  { title: 'Transport 4', content: "Le BRT (Bus à Haut Niveau de Service) circule sur des voies réservées en surface, avec des arrêts modernes, un paiement avant embarquement et des priorités aux feux. Moins coûteux qu'un tramway, il offre une fréquence et un confort améliorés." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Contrat 1', content: "Le CDD (Contrat à Durée Déterminée) est un contrat de travail conclu pour une mission ou une période précise, avec une date de fin clairement stipulée. Il ne peut être renouvelé que deux fois. À l'échéance, le salarié reçoit une indemnité de précarité." },
  { title: 'Contrat 2', content: "Le contrat d'intérim (ou de travail temporaire) est conclu entre une agence d'intérim, une entreprise utilisatrice et un salarié. Il est utilisé pour des missions ponctuelles et spécifiques. Sa durée maximale est de 18 mois. Le salarié est rémunéré par l'agence." },
  { title: 'Contrat 3', content: "Le CDI (Contrat à Durée Indéterminée) est la forme normale et générale du contrat de travail. Il ne comporte pas de date de fin déterminée et peut être rompu à tout moment par l'une ou l'autre des parties, sous réserve de respecter un préavis." },
  { title: 'Contrat 4', content: "Le contrat d'apprentissage est un contrat de travail en alternance destiné aux jeunes de 16 à 29 ans. Il associe formation pratique en entreprise et enseignement théorique en centre de formation d'apprentis (CFA). Sa durée varie de 1 à 3 ans." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_COPRO =
`RÈGLEMENT DE COPROPRIÉTÉ — RÉSIDENCE LES LILAS

Le présent règlement fixe les droits et obligations des copropriétaires de la résidence.

CHARGES : Les charges communes comprennent l'entretien des parties communes, l'éclairage, le jardinage et les frais d'assurance collective. Chaque copropriétaire contribue proportionnellement à ses tantièmes.

ASSEMBLÉE GÉNÉRALE : Une assemblée générale ordinaire est convoquée une fois par an. Les décisions relatives aux travaux d'amélioration requièrent un vote à la majorité absolue des copropriétaires présents ou représentés.

RÈGLES DE VIE : Il est interdit de déposer des objets dans les parties communes, de faire du bruit entre 22 h et 7 h, et de laisser des animaux sans laisse dans les espaces verts.`;

const DOC_OFFRE_EMPLOI_ING =
`OFFRE D'EMPLOI — INGÉNIEUR CHIMISTE (H/F)

Notre laboratoire pharmaceutique, leader dans la recherche sur les molécules actives, recrute un(e) ingénieur chimiste.

MISSIONS : Conception et optimisation de procédés de synthèse chimique, contrôle qualité des matières premières et produits finis, rédaction de rapports techniques, veille scientifique et réglementaire.

PROFIL : Diplôme d'ingénieur en chimie ou master 2 chimie organique, 3 ans d'expérience minimum en industrie pharmaceutique. Maîtrise des normes BPF (Bonnes Pratiques de Fabrication). Anglais scientifique courant.

CONDITIONS : CDI, cadre, rémunération selon profil. Tickets restaurant, mutuelle, intéressement aux résultats. Poste basé à Lyon.`;

const DOC_NOTE_DEMENAGEMENT =
`NOTE DE SERVICE — Direction Générale
Objet : Déménagement des bureaux — 15 janvier

Nous vous informons que les bureaux de la société seront transférés au nouveau siège social sis au 45, avenue Victor-Hugo, à compter du lundi 15 janvier.

Le déménagement sera effectué durant le week-end des 13 et 14 janvier par une société prestataire. Chaque collaborateur est prié d'emballer ses affaires personnelles dans des cartons fournis par le service logistique avant le vendredi 12 janvier à 17 h.

Les accès informatiques et téléphoniques seront opérationnels dès le lundi 15 janvier au matin. Pour toute question, contacter l'équipe logistique à l'adresse : logistique@societe.fr`;

const DOC_CONTRAT_LOCATION_VOITURE =
`CONTRAT DE LOCATION DE VÉHICULE — AutoLocation Express

Véhicule : Peugeot 308, immatriculation AB-123-CD
Durée : du 10 au 17 mars inclus (7 jours)
Kilométrage : illimité inclus dans le forfait
Tarif : 280 € TTC (assurance tous risques comprise)

CONDITIONS D'UTILISATION : Le conducteur doit être âgé de 21 ans minimum et titulaire du permis B depuis au moins 2 ans. Tout dommage non couvert par l'assurance sera facturé au locataire. Le véhicule doit être restitué avec le même niveau de carburant qu'à la prise en charge.

CAUTION : Une empreinte bancaire de 800 € sera bloquée sur la carte du locataire durant toute la durée de la location.`;

const DOC_PROGRAMME_FORMATION =
`PROGRAMME DE FORMATION CONTINUE — Institut ProForm

FORMATION : Management de projet — Certification PMI
DURÉE : 5 jours (35 heures)
DATES : Session 1 — du 10 au 14 mars | Session 2 — du 7 au 11 avril
LIEU : Salle de conférence A, bâtiment principal

OBJECTIFS : Maîtriser les fondamentaux du management de projet selon les standards internationaux, préparer la certification PMP (Project Management Professional), développer des compétences en planification, gestion des risques et communication.

PARTICIPANTS : Chefs de projet débutants ou confirmés, managers opérationnels.
TARIF : 1 800 € HT par participant (prise en charge OPCO possible).
INSCRIPTION : formation@institut-proform.fr avant le 28 février.`;

/* ── Articles de presse Q33-40 ── */
const ART_IA_MEDICALE =
`L'INTELLIGENCE ARTIFICIELLE AU SERVICE DE LA MÉDECINE : RÉVOLUTION OU SIMPLE OUTIL ?

L'essor de l'intelligence artificielle dans le domaine médical suscite autant d'enthousiasme que d'interrogations. Les applications sont nombreuses et prometteuses : détection précoce de cancers sur des images radiologiques, prédiction des septicémies en réanimation, aide au diagnostic différentiel, optimisation des parcours de soins. Des études publiées dans les plus grandes revues médicales montrent que certains algorithmes égalent ou dépassent les médecins spécialistes dans des tâches de reconnaissance d'images.

Pourtant, les professionnels de santé tempèrent cet enthousiasme. La médecine ne se réduit pas à l'analyse de données : elle implique une relation humaine, une prise en compte du contexte social et émotionnel du patient, une capacité à naviguer dans l'incertitude que les algorithmes maîtrisent encore mal. Par ailleurs, les biais présents dans les données d'entraînement des modèles peuvent conduire à des diagnostics moins fiables pour certaines populations sous-représentées.

Les enjeux réglementaires sont également considérables. Comment certifier un algorithme médical ? Qui est responsable en cas d'erreur ? Ces questions restent en partie sans réponse dans la plupart des législations nationales. L'Union européenne travaille à un cadre réglementaire spécifique, mais son adoption prend du temps.

L'IA médicale sera probablement un outil puissant d'aide à la décision, mais elle ne remplacera pas le médecin. L'avenir appartient à une collaboration étroite entre l'humain et la machine, où chacun apporte ce que l'autre ne peut pas offrir.`;

const ART_TOURISME_DURABLE =
`LE TOURISME DURABLE : ENTRE BONNE VOLONTÉ ET RÉALITÉS ÉCONOMIQUES

Le tourisme durable est devenu un concept incontournable dans le secteur du voyage. Face à l'explosion du tourisme de masse et à ses effets dévastateurs sur les écosystèmes fragiles — surpopulation des sites naturels, pollution des littoraux, destruction des patrimoines locaux —, de nombreuses destinations cherchent à réorienter leur offre vers un tourisme plus responsable.

Les initiatives se multiplient : labels écotouristiques, limites de fréquentation sur les sites sensibles, développement des circuits courts avec les producteurs locaux, taxation des nuitées pour financer la préservation des ressources naturelles. Des destinations pionnières comme la Costa Rica ou la Nouvelle-Zélande ont bâti leur attractivité précisément sur leur engagement environnemental.

Mais la réalité économique vient souvent tempérer les ambitions. Le tourisme représente pour de nombreux pays en développement une part considérable des recettes en devises et de l'emploi. Réduire les flux touristiques pour préserver l'environnement peut signifier une baisse de revenus que ces économies ne peuvent pas se permettre. Le défi est donc de concilier viabilité économique et sobriété écologique.

Des solutions innovantes émergent pourtant. La valorisation de l'authenticité locale, le tourisme de niche (randonnée, agrotourisme, tourisme culturel immersif) attire des visiteurs moins nombreux mais plus dépensiers et moins impactants. Le voyage responsable n'est pas une utopie, mais il requiert une transformation profonde des comportements des voyageurs et des acteurs du secteur.`;

const ART_CRISE_LOGEMENT =
`LA CRISE DU LOGEMENT URBAIN : UNE FRACTURE SOCIALE EN EXPANSION

Dans les grandes métropoles françaises et européennes, la crise du logement atteint des proportions alarmantes. Les prix à l'achat comme à la location ont progressé bien plus vite que les revenus ces vingt dernières années, repoussant les ménages à revenus modestes et moyens toujours plus loin des centres-villes. Ce phénomène, connu sous le nom de gentrification, recompose profondément la géographie sociale des villes.

Les facteurs structurels sont multiples : insuffisance de la construction neuve, rareté du foncier disponible, spéculation immobilière, développement des plateformes de location touristique à court terme qui soustraient des milliers de logements au marché locatif résidentiel. À Paris, il est estimé que plus de 30 000 logements sont destinés à la location touristique, réduisant d'autant l'offre pour les résidents.

Les pouvoirs publics tentent de réagir. Certaines villes ont instauré l'encadrement des loyers, d'autres ont mis en place des droits de préemption pour acquérir des biens destinés à la location touristique, d'autres encore ont accéléré les procédures de permis de construire. Ces mesures restent insuffisantes face à l'ampleur des besoins.

La crise du logement n'est pas qu'une question économique : elle est un révélateur de l'incapacité des sociétés à garantir un droit fondamental à leurs citoyens. Elle alimente les inégalités, fragilise les liens sociaux et pousse les travailleurs essentiels à fuir les centres urbains. Sans politique du logement ambitieuse et cohérente, le visage social des métropoles continuera de se transformer au détriment des plus vulnérables.`;

const ART_ENERGIE_SOLAIRE =
`L'ÉNERGIE SOLAIRE : L'ESSOR INCONTESTABLE D'UNE RÉVOLUTION ÉNERGÉTIQUE

L'énergie solaire photovoltaïque connaît depuis dix ans une croissance exponentielle qui surprend même les analystes les plus optimistes. Le coût de production de l'électricité solaire a chuté de plus de 90 % entre 2010 et 2023, faisant du solaire la source d'énergie nouvelle la moins chère dans la grande majorité des régions du monde. Cette chute des prix s'explique par les économies d'échelle réalisées dans la fabrication des panneaux, majoritairement en Chine, et par les progrès constants des rendements.

Les installations se multiplient à toutes les échelles : fermes solaires de plusieurs centaines de mégawatts dans les déserts, panneaux sur les toitures résidentielles et commerciales, centrales flottantes sur les lacs et les réservoirs. Plusieurs pays ont atteint des seuils où l'énergie solaire fournit une fraction significative de leur consommation électrique : l'Espagne dépasse 15 %, l'Australie approche 25 % dans certains États.

Les défis restent cependant importants. L'intermittence de la production solaire — nulle la nuit, variable selon la météo — exige des solutions de stockage ou de flexibilité du réseau. Les batteries lithium, les stations de pompage-turbinage et l'hydrogène vert sont les principales pistes explorées. Par ailleurs, la fin de vie des panneaux et leur recyclage représentent un enjeu environnemental que l'industrie doit anticiper dès maintenant.

L'avenir énergétique sera certainement multipolaire et décarboné, avec le solaire comme pierre angulaire d'un système énergétique radicalement différent de celui du XXe siècle.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Règlement zoo
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ZOO PARC DE LA FORÊT — RÈGLEMENT ET INFORMATIONS

Horaires : 9 h – 18 h (été) | 9 h – 17 h (hiver) — fermé le mardi

Tarifs : Adulte 18 € | Enfant (3-12 ans) 11 € | Gratuit – 3 ans
Animaux phares : lions, éléphants, girafes, reptiles tropicaux

RÈGLES DE VISITE :
• Ne pas nourrir les animaux — aliments fournis par le zoo uniquement
• Ne pas franchir les barrières de sécurité
• Tenir les enfants par la main dans les enclos de contact
• Animaux de compagnie non admis`,
    question: "D'après ce document, les enfants de moins de 3 ans…",
    optionA: "paient le tarif réduit de 11 €.",
    optionB: "doivent être accompagnés d'un adulte payant.",
    optionC: "entrent gratuitement au zoo.",
    optionD: "ne sont pas admis dans les enclos.",
    correctAnswer: 'C',
  }));

  // Q2 — Affiche bibliothèque
  qs.push(q(2, 'Q1-7', null, {
    longText:
`BIBLIOTHÈQUE MUNICIPALE JEAN-MOULIN — NOUVEAUTÉS

ACQUISITION : Plus de 500 nouveaux ouvrages disponibles dès le 1er septembre.
Thèmes : romans, essais, bandes dessinées, livres jeunesse, revues scientifiques.

ATELIERS DE RENTRÉE :
• Atelier lecture enfants (5-8 ans) : mercredis 10 h-11 h
• Cercle littéraire adultes : jeudis 18 h 30-20 h
• Initiation au numérique : samedis 14 h-16 h (inscription obligatoire)

RAPPEL : Emprunt gratuit sur présentation de la carte d'abonné.`,
    question: "Selon ce document, l'inscription est obligatoire pour…",
    optionA: "l'atelier lecture enfants.",
    optionB: "le cercle littéraire adultes.",
    optionC: "l'initiation au numérique.",
    optionD: "l'emprunt de nouveaux ouvrages.",
    correctAnswer: 'C',
  }));

  // Q3 — Courrier professionnel (invitation conférence scientifique)
  qs.push(q(3, 'Q1-7', null, {
    longText:
`Objet : Invitation à la Conférence Internationale des Sciences Appliquées

Madame, Monsieur,

Nous avons l'honneur de vous inviter à participer à la 12e Conférence Internationale des Sciences Appliquées, qui se tiendra du 18 au 20 novembre prochain au Centre des Congrès de Lyon.

Cette édition sera consacrée aux avancées en intelligence artificielle, en chimie des matériaux et en bioingénierie. Des intervenants de renom issus de 30 pays sont attendus.

Merci de confirmer votre participation avant le 31 octobre via le formulaire en ligne sur notre site.

Cordialement,
Dr. Claire Fontaine, Présidente du Comité Scientifique`,
    question: "Le but de ce courrier est d'…",
    optionA: "annoncer les résultats d'une recherche scientifique.",
    optionB: "inviter à une conférence scientifique internationale.",
    optionC: "recruter des chercheurs pour un laboratoire.",
    optionD: "informer de l'annulation d'un congrès.",
    correctAnswer: 'B',
  }));

  // Q4 — Programme visite musée sciences
  qs.push(q(4, 'Q1-7', null, {
    longText:
`MUSÉE DES SCIENCES ET TECHNOLOGIES — Programme des visites guidées

SAMEDI 12 OCTOBRE
10 h 00 : Visite guidée « Les grandes inventions du XXe siècle » (1 h 30)
14 h 00 : Atelier expérimental « Électricité et magnétisme » — 8-14 ans (2 h)
15 h 30 : Conférence « L'espace à portée de main » — tout public (1 h)

Réservation en ligne conseillée — Accueil 30 min avant le début
Tarif atelier enfants : 6 € (en plus du droit d'entrée)`,
    question: "L'atelier expérimental du samedi est destiné…",
    optionA: "aux adultes uniquement.",
    optionB: "aux enfants de 8 à 14 ans.",
    optionC: "à tous les publics sans restriction.",
    optionD: "aux groupes scolaires sur réservation.",
    correctAnswer: 'B',
  }));

  // Q5 — Bulletin météo maritime
  qs.push(q(5, 'Q1-7', null, {
    longText:
`BULLETIN MÉTÉO MARITIME — Zone Golfe de Gascogne

Validité : jeudi 9 novembre, 6 h – 18 h

VENT : Sud-ouest 4 à 5 Beaufort en matinée, renforçant à 6-7 Beaufort l'après-midi. Rafales possibles jusqu'à 65 km/h.
MER : Agitée à très agitée, houle de 2 à 3,5 mètres.
VISIBILITÉ : Bonne, réduisant à modérée en fin de journée avec l'arrivée de bruines.

⚠ AVIS DE FORT COUP DE VENT émis pour les navires de plaisance. Navigation déconseillée aux petites embarcations.`,
    question: "Selon ce bulletin, les petites embarcations…",
    optionA: "peuvent naviguer en matinée uniquement.",
    optionB: "doivent rester au port en raison des conditions.",
    optionC: "n'ont aucune restriction de navigation.",
    optionD: "peuvent sortir l'après-midi si le vent faiblit.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi microscope
  qs.push(q(6, 'Q1-7', null, {
    longText:
`MICROSCOPE OPTIQUE BILAB 400 — GUIDE D'UTILISATION

1. Placez la lame préparée sur la platine et fixez-la avec les valets de maintien.
2. Commencez toujours à l'objectif le plus faible (×4).
3. Utilisez la vis macrométrique pour la mise au point grossière.
4. Passez ensuite à la vis micrométrique pour affiner l'image.
5. Montez progressivement vers les objectifs plus forts (×10, ×40).

⚠ Ne jamais utiliser l'objectif ×100 sans huile à immersion.
⚠ Nettoyer les lentilles uniquement avec un chiffon optique fourni.`,
    question: "Selon ce guide, on doit toujours commencer l'observation avec…",
    optionA: "l'objectif le plus puissant pour plus de détails.",
    optionB: "l'objectif le plus faible (×4).",
    optionC: "l'huile à immersion pour une meilleure qualité.",
    optionD: "la vis micrométrique pour la précision.",
    correctAnswer: 'B',
  }));

  // Q7 — Petite annonce équipement sportif
  qs.push(q(7, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — MATÉRIEL SPORTIF À VENDRE

Vélo de course Decathlon — cadre aluminium, 21 vitesses — très bon état
Prix : 180 € (prix d'achat : 350 €)

Rameur électronique ergonomique — utilisé 3 fois — comme neuf
Prix : 220 €

Kit musculation : haltères 10 kg (×2), barre + disques — utilisé régulièrement
Prix ensemble : 90 €

Contact : M. Bertrand — 06 22 33 44 55 — Disponible le week-end uniquement
Photos disponibles sur demande — Vente en mains propres uniquement`,
    question: "Ce document est…",
    optionA: "une publicité pour un magasin de sport.",
    optionB: "une offre d'emploi dans le secteur sportif.",
    optionC: "une annonce de vente de matériel sportif d'occasion.",
    optionD: "un programme d'entraînement sportif.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "En chimie, lorsqu'un ___ entre en contact avec une base, il se produit une réaction de neutralisation qui génère un sel et de l'eau.",
    question: PHRASE_Q,
    optionA: "métal",
    optionB: "réactif",
    optionC: "acide",
    optionD: "gaz",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour progresser en sport, il est essentiel de respecter les phases de ___ afin de permettre à l'organisme de récupérer et de s'adapter aux efforts.",
    question: PHRASE_Q,
    optionA: "compétition",
    optionB: "musculation",
    optionC: "récupération",
    optionD: "nutrition",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "À la bibliothèque, tout document emprunté doit être ___ dans les délais impartis sous peine de pénalités journalières.",
    question: PHRASE_Q,
    optionA: "acheté",
    optionB: "renouvelé",
    optionC: "retourné",
    optionD: "signalé",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans un régime démocratique, les représentants élus exercent leur ___ pendant une période définie avant d'être soumis à de nouvelles élections.",
    question: PHRASE_Q,
    optionA: "pouvoir",
    optionB: "mandat",
    optionC: "budget",
    optionD: "statut",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "En géographie, l'___ d'un sommet montagneux détermine les conditions climatiques qui y règnent, notamment la température et les précipitations.",
    question: PHRASE_Q,
    optionA: "orientation",
    optionB: "altitude",
    optionC: "étendue",
    optionD: "inclinaison",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La démarche scientifique consiste à formuler une hypothèse, puis à concevoir une expérience pour la ___ ou l'infirmer.",
    question: PHRASE_Q,
    optionA: "publier",
    optionB: "financer",
    optionC: "vérifier",
    optionD: "présenter",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "L'exploration spatiale a connu une accélération remarquable grâce au développement des [14] artificiels, qui permettent d'observer la Terre, de relayer les communications et de collecter des données scientifiques précieuses. Ces engins placés en [15] autour de notre planète sont devenus indispensables à la météorologie, à la navigation et aux télécommunications mondiales.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — L\'exploration spatiale',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "avions",
    optionB: "satellites",
    optionC: "sondes",
    optionD: "télescopes",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — L\'exploration spatiale',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "orbite",
    optionB: "trajectoire",
    optionC: "altitude",
    optionD: "rotation",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "Le recyclage des matériaux repose sur un processus rigoureux qui commence par le [16] sélectif des déchets à la source. Une fois collectés, les matériaux sont traités dans des centres spécialisés où s'effectue leur [17], c'est-à-dire leur transformation en nouvelles matières premières utilisables par l'industrie.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le recyclage des matériaux',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "triage",
    optionB: "broyage",
    optionC: "stockage",
    optionD: "lavage",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Le recyclage des matériaux',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "destruction",
    optionB: "valorisation",
    optionC: "commercialisation",
    optionD: "exportation",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel musée expose uniquement des œuvres contemporaines ?",
    optionA: "Musée 1",
    optionB: "Musée 2",
    optionC: "Musée 3",
    optionD: "Musée 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel sport d'hiver nécessite des remontées mécaniques ?",
    optionA: "Sport 1",
    optionB: "Sport 2",
    optionC: "Sport 3",
    optionD: "Sport 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel transport urbain circule sur des rails intégrés à la chaussée en ville ?",
    optionA: "Transport 1",
    optionB: "Transport 2",
    optionC: "Transport 3",
    optionD: "Transport 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel contrat de travail ne comporte pas de date de fin déterminée ?",
    optionA: "Contrat 1",
    optionB: "Contrat 2",
    optionC: "Contrat 3",
    optionD: "Contrat 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La ville B enregistre les températures les plus élevées en été, dépassant 30 °C en juillet et août. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Les Lilas",
    longText: DOC_REGLEMENT_COPRO,
    question: "Ce document présente principalement…",
    optionA: "les plans de rénovation de la résidence.",
    optionB: "les droits et obligations des copropriétaires.",
    optionC: "les tarifs des charges locatives.",
    optionD: "les modalités de vente des appartements.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de copropriété — Résidence Les Lilas",
    longText: DOC_REGLEMENT_COPRO,
    question: "Selon le règlement, les décisions concernant des travaux d'amélioration requièrent…",
    optionA: "l'accord unanime de tous les copropriétaires.",
    optionB: "un vote à la majorité absolue lors de l'assemblée générale.",
    optionC: "la signature du syndic uniquement.",
    optionD: "une demande individuelle écrite.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Ingénieur chimiste",
    longText: DOC_OFFRE_EMPLOI_ING,
    question: "Ce poste est proposé dans quel secteur d'activité ?",
    optionA: "L'agroalimentaire.",
    optionB: "L'industrie pharmaceutique.",
    optionC: "La recherche académique universitaire.",
    optionD: "Le traitement des eaux.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Ingénieur chimiste",
    longText: DOC_OFFRE_EMPLOI_ING,
    question: "Parmi les critères exigés pour ce poste, on trouve…",
    optionA: "un doctorat en chimie organique.",
    optionB: "la maîtrise des Bonnes Pratiques de Fabrication (BPF).",
    optionC: "une expérience de 5 ans minimum.",
    optionD: "la connaissance d'une troisième langue étrangère.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Note de service — Déménagement des bureaux",
    longText: DOC_NOTE_DEMENAGEMENT,
    question: "Selon cette note, que doivent faire les collaborateurs avant le vendredi 12 janvier ?",
    optionA: "Valider leur nouvelle adresse professionnelle.",
    optionB: "Emballer leurs affaires personnelles dans des cartons.",
    optionC: "Commander leur nouveau matériel informatique.",
    optionD: "Contacter la société de déménagement directement.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Note de service — Déménagement des bureaux",
    longText: DOC_NOTE_DEMENAGEMENT,
    question: "D'après la note, les accès informatiques seront opérationnels…",
    optionA: "dès le vendredi soir avant le déménagement.",
    optionB: "le lundi 15 janvier au matin.",
    optionC: "une semaine après l'emménagement.",
    optionD: "uniquement après une demande spéciale.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Contrat de location de véhicule — AutoLocation Express",
    longText: DOC_CONTRAT_LOCATION_VOITURE,
    question: "Selon ce contrat, quelle condition doit remplir le conducteur ?",
    optionA: "Être âgé de 18 ans minimum.",
    optionB: "Avoir le permis B depuis au moins 2 ans.",
    optionC: "Posséder une assurance personnelle.",
    optionD: "Avoir déjà loué un véhicule auparavant.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Contrat de location de véhicule — AutoLocation Express",
    longText: DOC_CONTRAT_LOCATION_VOITURE,
    question: "Selon ce contrat, le véhicule doit être restitué…",
    optionA: "vide de carburant pour des raisons de sécurité.",
    optionB: "avec le même niveau de carburant qu'à la prise en charge.",
    optionC: "plein d'essence quelle que soit la consommation.",
    optionD: "sans obligation concernant le carburant.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Programme de formation continue — Institut ProForm",
    longText: DOC_PROGRAMME_FORMATION,
    question: "Cette formation prépare à…",
    optionA: "un concours de la fonction publique.",
    optionB: "une certification internationale en management de projet.",
    optionC: "un diplôme universitaire de niveau master.",
    optionD: "un brevet professionnel en gestion d'équipe.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Programme de formation continue — Institut ProForm",
    longText: DOC_PROGRAMME_FORMATION,
    question: "Selon le programme, la prise en charge financière de cette formation est possible via…",
    optionA: "une bourse de l'État.",
    optionB: "un financement OPCO.",
    optionC: "un crédit bancaire professionnel.",
    optionD: "une subvention de la mairie.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "L'intelligence artificielle au service de la médecine",
    longText: ART_IA_MEDICALE,
    question: "Selon cet article, certains algorithmes d'IA médicale…",
    optionA: "sont encore incapables de traiter des images médicales.",
    optionB: "peuvent égaler ou dépasser les spécialistes dans la reconnaissance d'images.",
    optionC: "remplacent déjà les médecins généralistes dans les consultations.",
    optionD: "sont réservés à la recherche académique et non clinique.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "L'intelligence artificielle au service de la médecine",
    longText: ART_IA_MEDICALE,
    question: "L'auteur conclut que l'avenir de l'IA médicale réside dans…",
    optionA: "le remplacement complet des médecins par des algorithmes.",
    optionB: "une collaboration étroite entre l'humain et la machine.",
    optionC: "l'interdiction des algorithmes dans les soins cliniques.",
    optionD: "le développement exclusif par les hôpitaux publics.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le tourisme durable : entre bonne volonté et réalités économiques",
    longText: ART_TOURISME_DURABLE,
    question: "Selon cet article, quels pays sont cités comme pionniers du tourisme durable ?",
    optionA: "La France et l'Espagne.",
    optionB: "Le Canada et l'Australie.",
    optionC: "La Costa Rica et la Nouvelle-Zélande.",
    optionD: "Le Japon et la Suède.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le tourisme durable : entre bonne volonté et réalités économiques",
    longText: ART_TOURISME_DURABLE,
    question: "D'après l'article, quel type de tourisme est présenté comme une solution prometteuse ?",
    optionA: "Le tourisme de masse organisé en circuits tout inclus.",
    optionB: "Le tourisme de niche (randonnée, agrotourisme, culturel immersif).",
    optionC: "Le tourisme d'aventure extrême en zones protégées.",
    optionD: "Le tourisme balnéaire sur les côtes méditerranéennes.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La crise du logement urbain : une fracture sociale en expansion",
    longText: ART_CRISE_LOGEMENT,
    question: "Selon cet article, les plateformes de location touristique à court terme…",
    optionA: "contribuent à réduire les inégalités de logement.",
    optionB: "soustraient des milliers de logements au marché résidentiel.",
    optionC: "sont bénéfiques pour l'économie locale des quartiers.",
    optionD: "n'ont aucun impact sur les prix de l'immobilier.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La crise du logement urbain : une fracture sociale en expansion",
    longText: ART_CRISE_LOGEMENT,
    question: "L'auteur présente la crise du logement comme…",
    optionA: "un problème temporaire lié à la croissance économique.",
    optionB: "un révélateur de l'incapacité à garantir un droit fondamental.",
    optionC: "une conséquence inévitable de l'urbanisation moderne.",
    optionD: "un phénomène limité aux villes françaises.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'énergie solaire : l'essor incontestable d'une révolution énergétique",
    longText: ART_ENERGIE_SOLAIRE,
    question: "Selon cet article, le coût de production de l'électricité solaire a…",
    optionA: "doublé entre 2010 et 2023 en raison de la demande.",
    optionB: "stagné malgré les progrès technologiques.",
    optionC: "chuté de plus de 90 % entre 2010 et 2023.",
    optionD: "augmenté légèrement à cause des matières premières.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'énergie solaire : l'essor incontestable d'une révolution énergétique",
    longText: ART_ENERGIE_SOLAIRE,
    question: "L'article mentionne comme principal défi de l'énergie solaire…",
    optionA: "le coût encore trop élevé des panneaux photovoltaïques.",
    optionB: "l'intermittence de la production et la nécessité de stockage.",
    optionC: "le manque de terrains disponibles pour les installations.",
    optionD: "la résistance des gouvernements aux énergies renouvelables.",
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
    console.log(`\n✅ ${created} questions créées pour CE 12.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
