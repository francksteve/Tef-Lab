'use strict';
/**
 * seed-ce-serie29.js
 * Peuple la série CE 29 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie29.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoixe000p0wxli0z6xyv3';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts exportations par trimestre ── */
function generateQ22SVG() {
  const quarters = ['T1','T2','T3','T4'];
  const graphs = [
    { label: 'Graphique 1', data: [120, 130, 125, 140], color: '#E30613' },
    { label: 'Graphique 2', data: [150, 145, 140, 135], color: '#E30613' },
    { label: 'Graphique 3', data: [100, 120, 145, 170], color: '#003087' }, // CORRECT : croissance constante
    { label: 'Graphique 4', data: [180, 160, 140, 120], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 200;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;

    const gridLines = [0, 50, 100, 150, 200].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx = (plotX + i * 78 + 5).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (plotX + i * 78 + 5 + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" opacity="0.8"/>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${quarters[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Millions d'euros</text>`;
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
  { title: 'Pays 1', content: "Le Maroc est un pays d'Afrique du Nord, bordé par l'Atlantique à l'ouest et la Méditerranée au nord. Sa capitale administrative est Rabat, tandis que Casablanca est son principal centre économique. Le pays est connu pour ses médinas millénaires, le désert du Sahara et la chaîne de l'Atlas." },
  { title: 'Pays 2', content: "Le Brésil est le plus grand pays d'Amérique du Sud par la superficie et la population. Sa capitale est Brasília, ville moderniste construite de toutes pièces dans les années 1950. São Paulo est sa métropole économique. Le pays est célèbre pour la forêt amazonienne, le carnaval et le football." },
  { title: 'Pays 3', content: "Le Vietnam est un pays d'Asie du Sud-Est en forme de S, bordé par la mer de Chine méridionale. Sa capitale est Hanoï, tandis que Hô Chi Minh-Ville (anciennement Saïgon) est son centre commercial. Le pays est réputé pour sa gastronomie, ses paysages de rizières en terrasses et la baie d'Halong." },
  { title: 'Pays 4', content: "La Norvège est un pays scandinave dont la côte est entaillée de milliers de fjords. Sa capitale Oslo abrite le siège de nombreuses organisations internationales. Riche de ses ressources pétrolières, la Norvège possède l'un des niveaux de vie les plus élevés au monde et un fonds souverain colossal." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Période 1', content: "La Renaissance est une période culturelle et artistique qui débute en Italie au XIVe siècle et se répand en Europe jusqu'au XVIIe siècle. Elle se caractérise par le retour aux sources gréco-latines, l'humanisme, les progrès scientifiques et artistiques. Léonard de Vinci, Michel-Ange et Raphaël en sont les figures emblématiques." },
  { title: 'Période 2', content: "Les Lumières désignent un mouvement intellectuel et philosophique du XVIIIe siècle, principalement en France, en Angleterre et en Allemagne. Ce courant prône la raison, la liberté et l'égalité contre l'obscurantisme et l'absolutisme. Voltaire, Rousseau, Diderot et l'Encyclopédie en sont les symboles majeurs." },
  { title: 'Période 3', content: "La Révolution industrielle commence en Grande-Bretagne dans la seconde moitié du XVIIIe siècle. Elle transforme profondément les modes de production (machine à vapeur, mécanisation), les structures sociales (urbanisation, naissance du prolétariat) et les conditions de vie. Elle se diffuse en Europe continentale au XIXe siècle." },
  { title: 'Période 4', content: "La Belle Époque désigne la période allant de 1871 à 1914 en France et en Europe occidentale. Elle se caractérise par une forte croissance économique, le développement des arts et des loisirs bourgeois, les premières automobiles et l'expansion coloniale. La Première Guerre mondiale mettra fin à cette période d'insouciance." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Roman 1', content: "Le roman policier (ou polar) met en scène une enquête menée pour résoudre un crime ou un mystère. L'intrigue repose sur la découverte progressive d'indices, la déduction et la révélation finale du coupable. Ses sous-genres incluent le roman noir, le thriller et le roman d'espionnage." },
  { title: 'Roman 2', content: "Le roman historique reconstitue une époque passée à travers une intrigue fictive intégrée dans un contexte historique documenté. Personnages fictifs et personnages réels peuvent y coexister. Le genre vise à faire vivre l'histoire au lecteur tout en s'appuyant sur une documentation rigoureuse." },
  { title: 'Roman 3', content: "La science-fiction imagine des sociétés et des technologies du futur, souvent pour questionner le présent. Ses thèmes favoris sont l'exploration spatiale, l'intelligence artificielle, la dystopie et les voyages temporels. Jules Verne, H.G. Wells, Isaac Asimov et Philip K. Dick en sont les figures fondatrices." },
  { title: 'Roman 4', content: "Le roman épistolaire est entièrement composé de lettres, de journaux intimes ou d'échanges écrits entre personnages. Cette forme narrative permet de multiplier les points de vue et de révéler progressivement l'information. Les Liaisons dangereuses de Laclos et Clarissa de Richardson sont des exemples classiques." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Énergie 1', content: "L'énergie hydroélectrique est produite par la force de l'eau en mouvement, captée par des turbines dans des barrages ou des centrales au fil de l'eau. C'est une énergie renouvelable et pilotable (on peut moduler la production selon la demande), qui représente environ 16 % de la production mondiale d'électricité." },
  { title: 'Énergie 2', content: "L'énergie éolienne exploite la force du vent à travers des éoliennes. Les turbines terrestres (onshore) sont les plus répandues ; les éoliennes offshore, installées en mer, sont plus coûteuses mais captent des vents plus constants. L'éolien est intermittent : il ne produit que lorsque le vent souffle suffisamment." },
  { title: 'Énergie 3', content: "L'énergie nucléaire est produite par la fission de noyaux d'atomes d'uranium ou de plutonium dans des réacteurs. Elle produit très peu de CO2 directement mais génère des déchets radioactifs à longue durée de vie. Elle est pilotable et fournit une électricité à faible coût variable sur le long terme." },
  { title: 'Énergie 4', content: "La géothermie exploite la chaleur interne de la Terre pour produire de l'électricité ou de la chaleur. Elle est disponible 24h/24, sans émissions de CO2, mais sa mise en œuvre nécessite des conditions géologiques favorables (zones volcaniques, nappes phréatiques profondes). L'Islande couvre 30 % de ses besoins électriques grâce à la géothermie." },
]);

/* ── Documents Q23-32 ── */
const DOC_VISA_TOURISTE =
`GUIDE DES DÉMARCHES — VISA TOURISTE POUR LA FRANCE

PUBLIC CONCERNÉ : Ressortissants de pays non membres de l'espace Schengen souhaitant visiter la France pour une durée inférieure à 90 jours.

DOCUMENTS REQUIS :
- Passeport valide (au moins 3 mois après la date de départ prévue)
- Formulaire de demande de visa Schengen rempli et signé
- 2 photos d'identité récentes conformes aux normes biométriques
- Justificatif d'hébergement (réservation hôtel ou attestation d'accueil)
- Preuve de ressources financières (relevés bancaires des 3 derniers mois)
- Assurance médicale de voyage couvrant au minimum 30 000 €
- Billet d'avion aller-retour ou itinéraire de voyage

DÉLAI DE TRAITEMENT : 15 jours ouvrables en moyenne (jusqu'à 45 jours en haute saison).
FRAIS : 80 € (non remboursables en cas de refus).`;

const DOC_PROGRAMME_FORMATION =
`PROGRAMME DE FORMATION — MANAGEMENT D'ÉQUIPE
Centre de Formation Professionnelle Continue AVENIR

OBJECTIFS : Développer les compétences managériales des participants : leadership, communication, gestion des conflits, conduite du changement.

PUBLIC : Managers en poste ou en prise de responsabilités (aucun prérequis diplômant).

PROGRAMME (5 jours — 35 heures) :
Jour 1 : Postures et styles de management — diagnostic personnel
Jour 2 : Communication managériale — feedback, entretien individuel
Jour 3 : Gestion des conflits et des personnalités difficiles
Jour 4 : Conduite du changement et motivation des équipes
Jour 5 : Mise en situation — études de cas réels + bilan de formation

MODALITÉS : Présentiel, groupe de 8 à 12 participants maximum.
COÛT : 1 950 € HT par participant (financement OPCO possible).`;

const DOC_CHARTE_BIBLIOTHEQUE =
`RÈGLEMENT DE LA MÉDIATHÈQUE MUNICIPALE VICTOR HUGO

ARTICLE 1 — INSCRIPTION : L'inscription est gratuite pour tous les habitants de la commune, sur présentation d'une pièce d'identité et d'un justificatif de domicile de moins de 3 mois.

ARTICLE 2 — PRÊT : Les abonnés peuvent emprunter jusqu'à 5 documents simultanément (livres, DVD, CD, jeux vidéo) pour une durée de 3 semaines, renouvelable une fois en ligne.

ARTICLE 3 — RETARDS : Tout retard entraîne la suspension du droit de prêt jusqu'au retour des documents. Aucune amende financière n'est appliquée.

ARTICLE 4 — DÉTÉRIORATION : Tout document perdu ou détérioré doit être remplacé par l'emprunteur à valeur identique ou remboursé selon le barème affiché en accueil.

ARTICLE 5 — SALLE SILENCE : La salle de lecture (niveau 2) est réservée au travail individuel silencieux. Les téléphones doivent être en mode silencieux.`;

const DOC_LETTRE_ADMIN =
`LETTRE DE RÉCLAMATION

Madame, Monsieur,

Je me permets de vous adresser la présente afin de signaler une anomalie concernant ma facture de téléphonie mobile du mois d'octobre 2025 (référence client : FR-457892).

En effet, j'ai constaté sur ma facture une surfacturation de 47,50 € correspondant à des appels internationaux que je n'ai pas effectués, ainsi qu'un abonnement à un service de streaming (9,99 €/mois) que je n'ai jamais souscrit.

Je vous demande donc, dans les meilleurs délais, de bien vouloir :
1. Vérifier l'origine de ces frais dans vos systèmes
2. Émettre un avoir ou un remboursement des sommes indûment prélevées
3. Me confirmer par écrit les mesures prises

Dans l'attente de votre réponse, que j'espère rapide, je me tiens à votre disposition pour tout renseignement complémentaire.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

M. TAGNE Paul`;

const DOC_CONTRAT_FREELANCE =
`CONTRAT DE PRESTATION DE SERVICES

ENTRE :
- La société MEDIAPROD SARL, représentée par sa gérante Mme LEFEVRE Claire (ci-après « le Client »)
- M. NKOLO Bertrand, consultant indépendant, SIRET : XXX XXX XXX XXXXX (ci-après « le Prestataire »)

OBJET : Réalisation d'un reportage photo pour le catalogue produits 2026.

MISSION : Prise de vues de 120 produits en studio, retouche et livraison des fichiers HD en format .RAW et .JPEG.

DÉLAI DE LIVRAISON : Les fichiers retouchés seront livrés au plus tard le 20 janvier 2026.

RÉMUNÉRATION : 3 500 € HT, payables en deux versements :
- 50 % à la signature du présent contrat
- 50 % à la livraison finale

DROITS D'AUTEUR : Le Client obtient une licence exclusive d'utilisation des clichés pour ses supports de communication commerciale. Toute utilisation en dehors de ce cadre nécessitera un accord écrit du Prestataire.`;

/* ── Articles de presse Q33-40 ── */
const ART_TOURISME_DURABLE =
`LE TOURISME DURABLE : ENTRE ENGAGEMENT ET GREENWASHING

Le tourisme représente environ 8 % des émissions mondiales de gaz à effet de serre, si l'on intègre les transports aériens, les hébergements et les activités sur place. Face à cette réalité, le concept de tourisme durable s'est imposé dans le discours des acteurs du secteur — mais sa mise en œuvre reste largement insuffisante au regard des enjeux.

Le tourisme durable repose sur trois piliers : minimiser l'impact environnemental, respecter et valoriser les cultures locales, et générer des retombées économiques pour les communautés d'accueil. Ces principes sont aujourd'hui au cœur des chartes de nombreuses destinations et opérateurs touristiques. Le label Clef Verte, le tourisme de terroir, l'écotourisme et les certifications B Corp pour les agences de voyages en sont des expressions concrètes.

La critique principale adressée au tourisme durable est celle du greenwashing : de nombreuses entreprises affichent des engagements environnementaux de façade sans modifier substantiellement leurs pratiques. Un hôtel qui propose le tri sélectif des déchets tout en servant des buffets quotidiens avec des produits importés par avion ne peut pas se prévaloir d'une démarche écologique cohérente.

La question la plus difficile reste celle de la mobilité. La réduction de l'empreinte carbone du tourisme passe nécessairement par une remise en question du transport aérien, qui représente la part la plus importante des émissions. Or, aucun opérateur ni aucune destination n'est prête à encourager ses clients à voler moins — contradiction fondamentale du tourisme durable.`;

const ART_POLITIQUE_JEUNES =
`PARTICIPATION POLITIQUE DES JEUNES : MYTHE DE L'APATHIE ET RÉALITÉ DES NOUVELLES FORMES D'ENGAGEMENT

L'image du jeune électeur désengagé, bouder les urnes pour se réfugier dans l'abstention, est devenue un lieu commun du discours politique. Les taux d'abstention élevés chez les 18-25 ans aux élections traditionnelles semblent confirmer ce tableau sombre. Pourtant, une lecture plus attentive de la réalité nuance profondément ce diagnostic.

Les jeunes ne se désengagent pas de la politique : ils en changent les formes. Les manifestations pour le climat, le mouvement Black Lives Matter, les mobilisations contre les violences de genre ou les luttes pour les droits LGBTQ+ ont été massivement portées par des jeunes adultes. Ces engagements, souvent horizontaux et décentralisés, ne passent pas par les partis politiques traditionnels mais constituent des formes d'action politique aussi légitimes et souvent plus efficaces pour mettre des sujets à l'agenda.

La défiance envers les institutions politiques traditionnelles est réelle et documentée : partis politiques, syndicats, parlement suscitent des taux de confiance historiquement bas chez les moins de 30 ans. Mais cette défiance n'est pas synonyme d'indifférence au bien commun. Elle reflète davantage une déception face à des institutions perçues comme lentes, peu représentatives et incapables d'apporter des réponses à l'urgence climatique, aux inégalités sociales ou à la crise du logement.

La réponse à cette crise de représentation ne peut venir que d'une réforme profonde des pratiques politiques : rajeunissement des élus, recours à des formes de démocratie participative, et surtout, une capacité à agir concrètement sur les sujets qui préoccupent les nouvelles générations.`;

const ART_ARCHITECTURE_VERTE =
`L'ARCHITECTURE VERTE : QUAND LES BÂTIMENTS DEVIENNENT DES ACTEURS CLIMATIQUES

Le secteur du bâtiment est responsable de près de 40 % de la consommation d'énergie mondiale et d'un tiers des émissions de CO2. Face à cette réalité, l'architecture bioclimatique et les bâtiments à énergie positive (BEPOS) ne sont plus de simples expériences marginales : ils deviennent progressivement la norme imposée par les réglementations.

La réglementation environnementale RE2020, entrée en vigueur en France en 2022, oblige désormais toutes les nouvelles constructions à atteindre des niveaux de performance énergétique très élevés, et intègre pour la première fois l'empreinte carbone des matériaux de construction. Elle favorise le recours au bois, au chanvre, à la paille et aux matériaux biosourcés, au détriment du béton et de l'acier conventionnels.

Les innovations architecturales vont bien au-delà de l'isolation thermique. Les toitures et façades végétalisées régulent la température en été et favorisent la biodiversité urbaine. Les bâtiments intelligents adaptent en temps réel leur consommation d'énergie grâce à des capteurs et des algorithmes. Certains bâtiments produisent même plus d'énergie qu'ils n'en consomment, grâce à des panneaux solaires et des systèmes de récupération de chaleur.

Le défi pour les décennies à venir est celui de la rénovation du parc immobilier existant. En France, 7 millions de logements sont classés en catégorie G ou F (passoires thermiques). Rénover ce parc représente un investissement colossal mais aussi une opportunité industrielle considérable pour les entreprises du bâtiment.`;

const ART_LITTERATURE_AFRICAINE =
`LA LITTÉRATURE AFRICAINE FRANCOPHONE : UNE RENAISSANCE MONDIALE

La littérature africaine francophone connaît depuis deux décennies une visibilité internationale sans précédent. Les prix littéraires français et internationaux se succèdent pour des auteurs d'origine africaine : Alain Mabanckou (Congo), Léonora Miano (Cameroun), Mohamed Mbougar Sarr (Sénégal, Prix Goncourt 2021), Marie NDiaye ou Gaël Faye illustrent la diversité et la vitalité de cette scène littéraire.

Cette reconnaissance n'est pas nouvelle : Aimé Césaire, Léopold Sédar Senghor et Frantz Fanon avaient, dès les années 1950-1960, imposé des voix africaines et caribéennes au cœur du champ littéraire et intellectuel francophone. Mais la génération contemporaine se distingue par sa liberté de ton vis-à-vis de l'héritage colonial et de la négritude : elle revendique une appartenance à la littérature mondiale sans avoir à se justifier de ses origines.

Les thèmes de cette littérature sont d'une richesse immense : mémoire coloniale et décolonisation, migrations et identités transnationales, condition féminine, urbanisation africaine, mais aussi tout simplement des récits intimes et universels sur l'amour, la famille et la quête de soi. La littérature africaine francophone ne se réduit plus à un prisme identitaire ou politique.

Le développement de l'édition africaine indépendante (maisons d'édition basées à Dakar, Abidjan, Yaoundé, Kinshasa) constitue un enjeu stratégique pour que les auteurs africains puissent publier sur leur continent, être distribués dans leurs pays et ne plus dépendre exclusivement des éditeurs parisiens pour exister littérairement.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_A =
`Le tourisme est devenu l'une des industries les plus importantes au monde, représentant des milliards de dollars de [14] chaque année. Cette activité permet à des millions de personnes de découvrir de nouvelles cultures et de [15] leur horizon. Cependant, le développement excessif du tourisme de masse peut avoir des conséquences [16] sur les écosystèmes fragiles et le patrimoine culturel des destinations les plus fréquentées.`;

const TEXTE_LACUNAIRE_B =
`La lecture est une activité fondamentale qui [17] non seulement les connaissances mais aussi la capacité à comprendre et à analyser le monde. Les études montrent que les enfants qui lisent régulièrement développent un vocabulaire plus riche et des compétences en raisonnement plus [17b] que leurs pairs moins lecteurs.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `AFFICHE — EXPOSITION TEMPORAIRE
MUSÉE DES ARTS ET MÉTIERS — PARIS

« LES GRANDES INVENTIONS DU XIXe SIÈCLE »
Du 15 janvier au 30 avril 2026

Découvrez les inventions qui ont changé le monde : la machine à vapeur, le télégraphe, l'imprimerie industrielle, la locomotive et les premières automobiles.
Reconstitutions grandeur nature, objets originaux, documents d'époque.

🕐 Ouvert du mardi au dimanche, 10h00–18h00 (fermeture nocturne le jeudi à 21h00)
🎟 Tarif plein : 14 € | Gratuit pour les moins de 18 ans et les bénéficiaires du RSA
♿ Accès adapté pour les personnes à mobilité réduite

Réservation recommandée : www.arts-et-metiers.net`,
    question: 'Ce document est…',
    optionA: 'Un catalogue de vente d\'objets anciens',
    optionB: 'Une affiche d\'exposition au musée',
    optionC: 'Un programme de conférence scientifique',
    optionD: 'Un guide touristique de Paris',
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `RÈGLEMENT D\'UTILISATION — PISCINE MUNICIPALE JEAN BOUIN

CONDITIONS D\'ACCÈS
- Maillot de bain obligatoire (shorts et bermudas interdits dans le bassin)
- Bonnet de bain obligatoire pour les cheveux longs
- Douche obligatoire avant l\'entrée dans le bassin
- Interdiction de courir dans l\'enceinte de la piscine

TARIFS
Entrée simple : 4,20 € | Carnet 10 entrées : 35 €
Abonnement annuel : 180 € (accès illimité)
Tarif enfant (-12 ans) : 2,80 €

HORAIRES
Lun / Mer / Ven : 7h00 – 21h30
Mar / Jeu : 12h00 – 21h30
Sam / Dim : 8h00 – 18h00

Téléphone renseignements : 01 XX XX XX XX`,
    question: 'Ce document est un…',
    optionA: 'Règlement intérieur d\'une piscine municipale',
    optionB: 'Catalogue d\'équipements de natation',
    optionC: 'Programme de cours de natation',
    optionD: 'Article sur les bienfaits de la natation',
    correctAnswer: 'A',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `COMMUNIQUÉ DE PRESSE

La mairie de Bordeaux annonce la fermeture temporaire du Pont de Pierre pour travaux de rénovation structurelle à partir du 3 mars 2026.

La fermeture concernera l\'ensemble de la circulation automobile et cycliste du lundi au vendredi de 8h00 à 18h00, et ce pendant 6 semaines. L\'accès piéton sera maintenu. Des itinéraires de déviation sont mis en place via le Pont François-Mitterrand et le Pont d\'Aquitaine.

La ligne de bus C2 sera temporairement déviée via la rue Sainte-Catherine. Des renforts de fréquence sont prévus sur les lignes A et B du tramway.

Pour toute information : bordeaux.fr ou 3114 (service municipal)`,
    question: 'Ce document est un…',
    optionA: 'Article de presse sur l\'état des ponts français',
    optionB: 'Communiqué officiel annonçant une fermeture de pont',
    optionC: 'Rapport technique sur les travaux du pont',
    optionD: 'Horaire de bus de la ville de Bordeaux',
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `GUIDE TOURISTIQUE — VISITE DU CHÂTEAU DE VERSAILLES

INFORMATIONS PRATIQUES
Adresse : Place d\'Armes, 78000 Versailles (RER C, station Versailles-Château)

HORAIRES
Château : mar-dim, 9h00-17h30 (fermé le lundi et certains jours fériés)
Jardins : ouverture toute l\'année (accès gratuit hors jours de Grandes Eaux)

TARIFS
Passeport (château + jardins + Trianon) : 27 € | -18 ans : gratuit
Billet château seul : 21 € | Audioguide : +5 €

CONSEILS
- Réserver en ligne évite les files d\'attente (entrée prioritaire)
- Prévoir 4 à 5 heures pour une visite complète
- Éviter le mardi (nombreux groupes scolaires)
- Restaurants et cafétérias disponibles dans les jardins`,
    question: 'Ce document est un…',
    optionA: 'Brochure de visite du château de Versailles',
    optionB: 'Manuel d\'histoire sur l\'Ancien Régime',
    optionC: 'Publicité pour des séjours touristiques en Île-de-France',
    optionD: 'Règlement de visite d\'un monument historique',
    correctAnswer: 'A',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `BIOGRAPHIE

Aimé CÉSAIRE (1913–2008)

Poète, dramaturge et homme politique martiniquais, Aimé Césaire est l\'une des figures intellectuelles et littéraires les plus marquantes du XXe siècle. Né à Basse-Pointe (Martinique) dans une famille modeste, il effectue ses études supérieures à Paris, où il co-fonde avec Léopold Sédar Senghor le mouvement de la Négritude — affirmation de l\'identité et de la culture africaine face au colonialisme.

Son œuvre majeure, le Cahier d\'un retour au pays natal (1939), est considérée comme l\'un des textes fondateurs de la poésie noire moderne. Homme politique engagé, il fut maire de Fort-de-France pendant 56 ans et député de la Martinique.`,
    question: 'Ce document est…',
    optionA: 'Une critique littéraire d\'un roman martiniquais',
    optionB: 'La biographie d\'un écrivain et homme politique martiniquais',
    optionC: 'Un article sur le mouvement de la Négritude en général',
    optionD: 'Un extrait du Cahier d\'un retour au pays natal',
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `COURRIER PROFESSIONNEL

Objet : Convocation à un entretien individuel annuel

Madame OUEDRAOGO,

Je vous informe que votre entretien individuel annuel d\'évaluation est programmé le mardi 18 novembre 2025 à 14h30, dans mon bureau (salle 204, 2e étage).

Cet entretien aura pour objet de faire le bilan de l\'année écoulée, d\'évaluer l\'atteinte de vos objectifs 2025 et de définir ensemble vos objectifs pour 2026. Il sera également l\'occasion d\'évoquer vos souhaits d\'évolution professionnelle et vos besoins en formation.

Je vous invite à préparer cet entretien en complétant le formulaire d\'autoévaluation disponible sur l\'intranet RH et à le transmettre avant le 15 novembre.

Cordialement,
M. DUPONT Frédéric — Responsable de département`,
    question: 'Ce document est…',
    optionA: 'Un rapport d\'évaluation annuel',
    optionB: 'Une convocation à un entretien individuel d\'évaluation',
    optionC: 'Un formulaire d\'autoévaluation à compléter',
    optionD: 'Un règlement intérieur sur les entretiens professionnels',
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `EXTRAIT DE SITE UNIVERSITAIRE

UNIVERSITÉ PARIS-SACLAY
MASTER DROIT INTERNATIONAL ET EUROPÉEN — PARCOURS DROITS FONDAMENTAUX

Conditions d\'admission :
- Être titulaire d\'une Licence en droit (mention assez bien minimum)
- Justifier d\'un niveau B2 en anglais (TOEIC, IELTS ou équivalent)
- Dossier de candidature incluant CV, lettre de motivation, relevés de notes L3

Débouchés professionnels :
Magistrature internationale, ONG, diplomatie, conseil juridique d\'entreprises multinationales, organisations européennes et internationales.

Candidatures en ligne du 1er mars au 15 avril sur : admissions.universite-paris-saclay.fr
Résultats publiés le 10 mai.
Renseignements : master.droit-international@u-psaclay.fr`,
    question: 'Ce document est un…',
    optionA: 'Formulaire de candidature à un master',
    optionB: 'Extrait du site d\'une université présentant un master',
    optionC: 'Règlement intérieur d\'un établissement universitaire',
    optionD: 'Rapport d\'accréditation d\'une filière universitaire',
    correctAnswer: 'B',
  }));

  // ── Q8-13 : Phrases lacunaires ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les délégués ont adopté la résolution à l\'___ lors de la session plénière de l\'Assemblée générale.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'unanimité',
    optionB: 'unité',
    optionC: 'unanime',
    optionD: 'accord',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le gouvernement a annoncé une série de mesures pour ___ le chômage des jeunes dans les zones rurales.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'réduire',
    optionB: 'augmenter',
    optionC: 'mesurer',
    optionD: 'calculer',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La découverte archéologique a permis de ___ la date de fondation de la cité antique de plusieurs siècles.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'reculer',
    optionB: 'avancer',
    optionC: 'choisir',
    optionD: 'calculer',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'L\'architecte a conçu un bâtiment ___ qui s\'intègre parfaitement dans le paysage naturel environnant.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'bioclimatique',
    optionB: 'historique',
    optionC: 'coûteux',
    optionD: 'traditionnel',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le romancier a reçu le Prix Goncourt pour un livre qui ___ avec force la mémoire coloniale.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'interroge',
    optionB: 'ignore',
    optionC: 'efface',
    optionD: 'répète',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les négociations climatiques ont abouti à un accord ___ après plusieurs nuits de discussions intenses.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'historique',
    optionB: 'banal',
    optionC: 'partiel',
    optionD: 'provisoire',
    correctAnswer: 'A',
  }));

  // ── Q14-17 : Textes lacunaires ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le tourisme mondial',
    longText: TEXTE_LACUNAIRE_A,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'recettes',
    optionB: 'pertes',
    optionC: 'dépenses',
    optionD: 'emprunts',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le tourisme mondial',
    longText: TEXTE_LACUNAIRE_A,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'élargir',
    optionB: 'réduire',
    optionC: 'fermer',
    optionD: 'ignorer',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le tourisme mondial',
    longText: TEXTE_LACUNAIRE_A,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'néfastes',
    optionB: 'bénéfiques',
    optionC: 'positives',
    optionD: 'neutres',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La lecture',
    longText: TEXTE_LACUNAIRE_B,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'enrichit',
    optionB: 'détruit',
    optionC: 'remplace',
    optionD: 'limite',
    correctAnswer: 'A',
  }));

  // ── Q18-21 : Lecture rapide ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quel pays possède l\'un des fonds souverains les plus importants au monde grâce à ses ressources pétrolières ?',
    optionA: 'Pays 1',
    optionB: 'Pays 2',
    optionC: 'Pays 3',
    optionD: 'Pays 4',
    correctAnswer: 'D',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quelle période historique est associée aux philosophes Voltaire et Rousseau ?',
    optionA: 'Période 1',
    optionB: 'Période 2',
    optionC: 'Période 3',
    optionD: 'Période 4',
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quel type de roman est entièrement composé de lettres et de journaux intimes ?',
    optionA: 'Roman 1',
    optionB: 'Roman 2',
    optionC: 'Roman 3',
    optionD: 'Roman 4',
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quelle source d\'énergie est à la fois renouvelable et pilotable (production modulable) ?',
    optionA: 'Énergie 1',
    optionB: 'Énergie 2',
    optionC: 'Énergie 3',
    optionD: 'Énergie 4',
    correctAnswer: 'A',
  }));

  // ── Q22 : Graphique ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « Les exportations augmentent de façon constante et régulière de T1 à T4 » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'C',
  }));

  // ── Q23-32 : Documents administratifs/professionnels ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Guide — Visa touriste pour la France',
    longText: DOC_VISA_TOURISTE,
    question: 'Ce document s\'adresse à…',
    optionA: 'Aux Français souhaitant voyager à l\'étranger',
    optionB: 'Aux ressortissants non Schengen souhaitant visiter la France',
    optionC: 'Aux étudiants étrangers demandant un visa d\'études',
    optionD: 'Aux travailleurs frontaliers de l\'espace Schengen',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Guide — Visa touriste pour la France',
    longText: DOC_VISA_TOURISTE,
    question: 'Selon ce guide, les frais de visa sont…',
    optionA: 'Remboursables si la demande est accordée',
    optionB: 'Non remboursables en cas de refus',
    optionC: 'Gratuits pour certaines nationalités',
    optionD: 'Variables selon la durée du séjour',
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Programme de formation — Management d\'équipe',
    longText: DOC_PROGRAMME_FORMATION,
    question: 'Ce programme de formation est destiné à…',
    optionA: 'Des étudiants en licence de management',
    optionB: 'Des managers en poste ou en prise de responsabilités',
    optionC: 'Des chefs d\'entreprise souhaitant créer leur société',
    optionD: 'Des recruteurs RH en entreprise',
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Programme de formation — Management d\'équipe',
    longText: DOC_PROGRAMME_FORMATION,
    question: 'Selon le programme, le financement de cette formation peut être pris en charge par…',
    optionA: 'Le Pôle Emploi uniquement',
    optionB: 'L\'OPCO (Opérateur de Compétences)',
    optionC: 'Le Conseil Régional',
    optionD: 'L\'entreprise exclusivement',
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Règlement — Médiathèque Victor Hugo',
    longText: DOC_CHARTE_BIBLIOTHEQUE,
    question: 'Selon ce règlement, combien de documents un abonné peut-il emprunter simultanément ?',
    optionA: '3 documents',
    optionB: '5 documents',
    optionC: '10 documents',
    optionD: 'Aucune limite n\'est précisée',
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Règlement — Médiathèque Victor Hugo',
    longText: DOC_CHARTE_BIBLIOTHEQUE,
    question: 'Selon ce règlement, que se passe-t-il en cas de retard dans le retour d\'un document ?',
    optionA: 'Une amende financière est appliquée',
    optionB: 'Le droit de prêt est suspendu jusqu\'au retour du document',
    optionC: 'L\'abonné est radié définitivement',
    optionD: 'Le document est facturé automatiquement',
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Lettre de réclamation téléphonie',
    longText: DOC_LETTRE_ADMIN,
    question: 'Ce document est…',
    optionA: 'Une demande de résiliation de contrat téléphonique',
    optionB: 'Une lettre de réclamation pour une surfacturation',
    optionC: 'Une demande de remboursement d\'un téléphone défectueux',
    optionD: 'Un formulaire de signalement de fraude bancaire',
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Lettre de réclamation téléphonie',
    longText: DOC_LETTRE_ADMIN,
    question: 'Selon cette lettre, le montant total des frais contestés s\'élève à…',
    optionA: '9,99 €',
    optionB: '47,50 €',
    optionC: '57,49 €',
    optionD: '600 €',
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Contrat de prestation de services photographiques',
    longText: DOC_CONTRAT_FREELANCE,
    question: 'Selon ce contrat, quel est l\'objet de la mission du prestataire ?',
    optionA: 'La conception d\'un site web pour un catalogue',
    optionB: 'La réalisation d\'un reportage photo pour un catalogue produits',
    optionC: 'La rédaction de textes publicitaires pour une campagne',
    optionD: 'La création de vidéos promotionnelles pour les réseaux sociaux',
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Contrat de prestation de services photographiques',
    longText: DOC_CONTRAT_FREELANCE,
    question: 'Selon ce contrat, comment la rémunération est-elle versée ?',
    optionA: 'En totalité à la signature du contrat',
    optionB: 'En deux versements : 50 % à la signature, 50 % à la livraison',
    optionC: 'En trois mensualités égales',
    optionD: 'À la livraison finale uniquement',
    correctAnswer: 'B',
  }));

  // ── Q33-40 : Articles de presse ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — Tourisme durable : engagement ou greenwashing ?',
    longText: ART_TOURISME_DURABLE,
    question: 'Selon cet article, quelle est la principale critique adressée au tourisme durable tel qu\'il est pratiqué ?',
    optionA: 'Il coûte trop cher pour les voyageurs',
    optionB: 'Il s\'agit souvent de greenwashing sans changement réel des pratiques',
    optionC: 'Il favorise les grandes chaînes hôtelières au détriment des petits acteurs',
    optionD: 'Il est impossible à mettre en œuvre dans les pays en développement',
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — Tourisme durable : engagement ou greenwashing ?',
    longText: ART_TOURISME_DURABLE,
    question: 'L\'auteur identifie la contradiction fondamentale du tourisme durable dans le fait que…',
    optionA: 'Les certifications environnementales sont trop coûteuses pour les petits hôtels',
    optionB: 'Personne n\'est prêt à encourager les clients à prendre moins l\'avion',
    optionC: 'Les voyageurs ne sont pas sensibilisés aux enjeux écologiques',
    optionD: 'Les gouvernements n\'imposent pas de taxe carbone sur les voyages',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — Participation politique des jeunes',
    longText: ART_POLITIQUE_JEUNES,
    question: 'Selon cet article, comment les jeunes expriment-ils leur engagement politique aujourd\'hui ?',
    optionA: 'En rejoignant massivement les partis politiques traditionnels',
    optionB: 'Par des mobilisations horizontales sur des causes comme le climat ou les droits sociaux',
    optionC: 'En participant davantage aux élections locales qu\'aux nationales',
    optionD: 'En créant de nouveaux partis politiques',
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — Participation politique des jeunes',
    longText: ART_POLITIQUE_JEUNES,
    question: 'D\'après cet article, la défiance des jeunes envers les institutions politiques reflète…',
    optionA: 'Une indifférence totale au bien commun',
    optionB: 'Une déception face à des institutions perçues comme lentes et peu représentatives',
    optionC: 'Un manque d\'éducation civique dans les écoles',
    optionD: 'Un rejet de la démocratie comme système de gouvernement',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — L\'architecture verte et les bâtiments acteurs climatiques',
    longText: ART_ARCHITECTURE_VERTE,
    question: 'Selon cet article, la réglementation RE2020 introduit comme nouveauté…',
    optionA: 'L\'obligation de panneaux solaires sur tous les nouveaux bâtiments',
    optionB: 'La prise en compte de l\'empreinte carbone des matériaux de construction',
    optionC: 'L\'interdiction du béton dans les nouvelles constructions',
    optionD: 'La réduction de la surface habitable autorisée par logement',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — L\'architecture verte et les bâtiments acteurs climatiques',
    longText: ART_ARCHITECTURE_VERTE,
    question: 'L\'auteur présente la rénovation des passoires thermiques comme…',
    optionA: 'Un obstacle pour les propriétaires bailleurs',
    optionB: 'À la fois un investissement colossal et une opportunité industrielle',
    optionC: 'Une priorité secondaire face aux nouvelles constructions',
    optionD: 'Un projet irréalisable sur le plan technique',
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — La littérature africaine francophone',
    longText: ART_LITTERATURE_AFRICAINE,
    question: 'Selon cet article, en quoi la génération contemporaine d\'écrivains africains se distingue-t-elle de la génération Césaire-Senghor ?',
    optionA: 'Elle écrit uniquement en anglais pour toucher un public mondial',
    optionB: 'Elle revendique une appartenance à la littérature mondiale sans devoir se justifier de ses origines',
    optionC: 'Elle abandonne totalement les thèmes liés à l\'Afrique',
    optionD: 'Elle refuse les prix littéraires français',
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — La littérature africaine francophone',
    longText: ART_LITTERATURE_AFRICAINE,
    question: 'L\'article présente le développement de l\'édition africaine indépendante comme…',
    optionA: 'Une menace pour les éditeurs parisiens',
    optionB: 'Un enjeu stratégique pour que les auteurs africains puissent publier sur leur continent',
    optionC: 'Un phénomène commercial sans intérêt culturel',
    optionD: 'Un obstacle à la diffusion internationale des auteurs africains',
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
    console.log(`\n✅ 40 questions créées pour CE 29.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
