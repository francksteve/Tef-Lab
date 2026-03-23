'use strict';
/**
 * seed-ce-serie9.js
 * Peuple la série CE 9 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie9.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyof2100050wxlykm5h983';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : courbe de températures — amplitude < 2°C (île tropicale) ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [-10,-8,-2,5,12,18,21,19,13,6,-1,-7],   minY: -15, maxY: 25, color: '#E30613' },
    { label: 'Graphique 2', data: [4,5,9,13,17,21,24,23,18,13,7,4],        minY: 0,   maxY: 28, color: '#E30613' },
    { label: 'Graphique 3', data: [28,30,33,36,38,35,32,31,30,28,26,27],   minY: 24,  maxY: 42, color: '#E30613' },
    { label: 'Graphique 4', data: [26,26,27,27,27,26,25,25,25,26,26,26],   minY: 23,  maxY: 30, color: '#003087' }, // CORRECT
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 52, plotY = cy + 35, plotW = 310, plotH = 110;
    const sx = i => (plotX + (i / 11) * plotW).toFixed(1);
    const sy = t => (plotY + plotH - ((t - g.minY) / (g.maxY - g.minY)) * plotH).toFixed(1);
    const pts = g.data.map((t, i) => `${sx(i)},${sy(t)}`).join(' ');
    const grid = [0, 1, 2, 3].map(i => {
      const t = g.minY + i * (g.maxY - g.minY) / 3;
      const yv = parseFloat(sy(t));
      return `<line x1="${plotX}" y1="${yv.toFixed(1)}" x2="${plotX + plotW}" y2="${yv.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(yv + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${t.toFixed(0)}°</text>`;
    }).join('');
    const xlab = months.map((m, i) =>
      `<text x="${sx(i)}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${m}</text>`
    ).join('');
    const dots = g.data.map((t, i) =>
      `<circle cx="${sx(i)}" cy="${sy(t)}" r="3" fill="${g.color}"/>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
      `<text x="${cx + 195}" y="${cy + 23}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
      `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      grid + xlab +
      `<polyline points="${pts}" fill="none" stroke="${g.color}" stroke-width="2.5" stroke-linejoin="round"/>` +
      dots;
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
  { title: 'Mutuelle 1', content: "Mutuelle Santé Plus — Cotisation : 45 €/mois. Remboursement soins courants : 100 % base SS. Dentaire : 150 % base SS, plafond 500 €/an. Optique : forfait 100 € par an (verres + monture). Hospitalisation : 250 % base SS. Bonne couverture générale." },
  { title: 'Mutuelle 2', content: "Mutuelle Optima — Cotisation : 68 €/mois. Remboursement soins courants : 125 % base SS. Dentaire : 200 % base SS, plafond 800 €/an. Optique : prise en charge intégrale des frais optiques sans plafond annuel. Hospitalisation : 300 % base SS. Idéale pour les porteurs de lunettes." },
  { title: 'Mutuelle 3', content: "Mutuelle Économique — Cotisation : 28 €/mois. Remboursement soins courants : 100 % base SS uniquement. Dentaire : 100 % base SS. Optique : forfait 60 € tous les 2 ans. Hospitalisation : 200 % base SS. Formule économique pour budgets serrés." },
  { title: 'Mutuelle 4', content: "Mutuelle Premium — Cotisation : 95 €/mois. Remboursement soins courants : 150 % base SS. Dentaire : 300 % base SS, plafond 1 500 €/an. Optique : forfait 200 € par an. Hospitalisation : 400 % base SS, chambre individuelle garantie. Médecine douce remboursée (ostéopathie, acupuncture)." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Projet 1', content: "Résidence La Canopée — Bordeaux Mérignac. 42 appartements neufs du T2 au T4. Prix à partir de 189 000 € (T2, 48 m²). Livraison prévue en septembre 2025, soit dans environ 6 mois. Éligible loi Pinel et PTZ. Parking en sous-sol inclus. Contact : 05 56 88 00 11." },
  { title: 'Projet 2', content: "Les Terrasses du Lac — Annecy Cran-Gevrier. 28 appartements du T2 au T5. Prix à partir de 320 000 € (T2, 52 m²). Vue lac garantie pour 60 % des logements. Livraison : décembre 2026. Gardien sur place. Programme BBC RT2020. Contact : 04 50 00 33 44." },
  { title: 'Projet 3', content: "Green Village — Lyon Confluence. 56 logements sociaux et privés du T1 au T4. Prix privés à partir de 215 000 € (T2, 45 m²). Livraison décembre 2025 (dans 9 mois). Bâtiment à énergie positive, vélos cargo en partage. Contact : 04 72 00 55 66." },
  { title: 'Projet 4', content: "Le Domaine des Pins — Toulon La Seyne. 72 appartements du T2 au T5 avec terrasse. Prix à partir de 165 000 € (T2, 50 m²). Piscine résidentielle et espace de co-working inclus. Livraison mars 2027. Éligible loi Pinel. Contact : 04 94 00 77 88." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Stage 1', content: "Stage Marketing Digital — Durée : 6 mois. Paris 2e. Rémunération : 800 €/mois (gratification légale minimale). Missions : gestion réseaux sociaux, création de contenus, reporting. Niveau Bac+3 minimum. Démarrage : 1er septembre. Contact : stage@agence-digital.fr." },
  { title: 'Stage 2', content: "Stage Communication interne — Durée : 4 mois. Lyon. Rémunération : 700 €/mois. Missions : rédaction newsletter, organisation d'événements internes, intranet. Niveau Bac+2 minimum. Démarrage : 1er juin. Contact : rh@groupeenergy.fr." },
  { title: 'Stage 3', content: "Stage Ressources Humaines — Durée : 5 mois. Marseille. Rémunération : 1 200 €/mois (bien au-dessus du minimum légal). Missions : recrutement, formation, gestion administrative. Niveau Bac+4 minimum. Démarrage : 1er mars. Contact : rh@societe-marseille.fr." },
  { title: 'Stage 4', content: "Stage Développement Commercial — Durée : 6 mois. Bordeaux. Rémunération : 750 €/mois. Missions : prospection clients, suivi portefeuille, analyse concurrentielle. Permis B requis. Niveau Bac+3. Démarrage : 15 septembre. Contact : commercial@vinpro.fr." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Voyage 1', content: "Circuit Grèce classique — 10 jours. Athènes, Santorin, Mykonos. Vols Paris-Athènes A/R inclus dans le prix. Hôtels 4 étoiles, demi-pension. Prix : 1 590 €/personne. Départ tous les lundis de mai à octobre. Assurance voyage incluse." },
  { title: 'Voyage 2', content: "Séjour Marrakech — 7 nuits. Riad 4 étoiles, petit-déjeuner inclus. Activités : visite des souks, excursion désert en option (+150 €). Prix hôtel seul : 690 €. Vols à réserver séparément. Départ possible toute l'année. Visa non requis." },
  { title: 'Voyage 3', content: "Tour du Portugal — 14 jours en minibus. Lisbonne, Porto, Sintra, Algarve. Hôtels 3 étoiles, demi-pension. Guide francophone tout au long du séjour. Prix : 2 150 €/personne, vols non inclus. Paiement en 3 fois sans frais possible." },
  { title: 'Voyage 4', content: "Croisière Méditerranée — 8 jours. Escales : Barcelone, Marseille, Gênes, Rome, Naples. Prix tout compris : 1 200 €/personne en cabine intérieure. Vols non inclus. Repas à bord inclus. Excursions en option. Départ de Barcelone." },
]);

/* ── Documents Q23-32 ── */
const DOC_CLUB_SPORT =
`RÈGLEMENT DU CLUB SPORTIF D'ENTREPRISE — DYNAMO

Adhésion : ouverte à tous les salariés de l'entreprise et à leurs ayants droit directs (conjoint et enfants). Cotisation : 5 €/mois prélevés sur le bulletin de salaire.

Équipements : accès aux salles de sport, courts de tennis et piscine du centre Aqua-Forme, partenaire officiel du club. Réservation en ligne via l'intranet.

Invités : chaque membre peut inviter un non-salarié deux fois par mois au maximum, sur présentation de la carte membre.

Règles de bonne conduite : tenue de sport adaptée obligatoire. Respect des créneaux de réservation. Signalement de tout dysfonctionnement au référent sport : sport@entreprise.fr.`;

const DOC_CHARTE_ACHATS =
`CHARTE ÉTHIQUE DES ACHATS

Notre politique d'achats repose sur quatre principes fondamentaux :

Priorité aux fournisseurs locaux : à qualité et prix équivalents, la préférence est donnée aux fournisseurs implantés dans un rayon de 100 km du site de production, afin de réduire l'impact environnemental des transports.

Traçabilité : tout fournisseur doit pouvoir justifier l'origine de ses matières premières et le respect des droits sociaux tout au long de sa chaîne d'approvisionnement.

Anti-corruption : il est formellement interdit d'offrir ou d'accepter tout avantage susceptible d'influencer une décision d'achat. Tout cadeau d'une valeur supérieure à 30 € doit être déclaré.

Évaluation annuelle : les fournisseurs sont évalués chaque année sur la base de grilles multicritères (qualité, délai, prix, RSE).`;

const DOC_CONVENTION_STAGE =
`CONVENTION DE STAGE EN ENTREPRISE

Entre : la société NEXTECH SOLUTIONS (entreprise d'accueil) et l'Université Paris-Saclay (établissement d'enseignement).

Objet du stage : participation aux projets de développement logiciel du service R&D, sous la responsabilité de M. François Gagnon, tuteur désigné.

Durée : 6 mois, du 1er mars au 31 août 2025. Horaires : 35 h/semaine, du lundi au vendredi.

Gratification : 700 € par mois, versée le dernier jour ouvré de chaque mois.

Obligations du stagiaire : respecter le règlement intérieur, assurer la confidentialité des informations, remettre un rapport de stage à son tuteur 3 semaines avant la fin.`;

const DOC_REGLEMENT_DEPLACEMENTS =
`RÈGLEMENT DES DÉPLACEMENTS PROFESSIONNELS

Transport : les déplacements doivent être effectués par le moyen le plus économique compatible avec les contraintes du voyage. Le train 2e classe est le mode de déplacement de référence pour les trajets de moins de 3 heures. L'avion est autorisé pour les trajets de plus de 500 km ou à l'étranger.

Hébergement : les hôtels 3 étoiles maximum sont pris en charge. Plafond : 100 € par nuit en province, 160 € à Paris, 200 € pour les déplacements à l'étranger.

Location de véhicule : autorisée sur demande préalable, pour des déplacements en zone non desservie par les transports en commun. Véhicule de catégorie économique uniquement.

Frais de repas : plafond de 20 € le midi et 35 € le soir, sur présentation d'une facture originale.`;

const DOC_NOTE_EVENEMENT =
`NOTE D'ORGANISATION — SÉMINAIRE ANNUEL D'ENTREPRISE 2025

Date et lieu : 18-19 septembre 2025, Domaine de la Fontaine, Châteauroux.

Comité d'organisation : Mme Sandrine Poirier (RH), M. Thomas Lebrun (Communication), Mme Élise Vidal (Logistique).

Budget prévisionnel : 45 000 € TTC (hébergement 18 000 €, restauration 12 000 €, activités team-building 8 000 €, transport 7 000 €).

Communications internes prévues : courriel d'invitation 3 mois à l'avance, rappels à J-30 et J-7, programme définitif à J-3.

Contact pour questions : seminaire2025@entreprise.fr`;

/* ── Articles Q33-40 ── */
const ART_IA_CREATION =
`L'IA ET LA CRÉATION ARTISTIQUE : QUAND LES MACHINES DISPUTENT LE TERRAIN AUX HUMAINS

En quelques années, les outils d'intelligence artificielle générative ont envahi le champ de la création artistique. Des programmes comme Midjourney, DALL-E ou Stable Diffusion permettent à n'importe qui de générer en quelques secondes des images d'une qualité visuelle stupéfiante à partir de simples descriptions textuelles. Dans le domaine musical, des IA composent des mélodies indiscernables de celles d'un musicien humain. En littérature, les grands modèles de langage rédigent des textes cohérents et parfois émouvants.

Ces avancées soulèvent des questions profondes. La première est économique : quel est l'avenir des illustrateurs, graphistes, compositeurs et auteurs face à des outils capables de produire pour quelques centimes ce qui demandait auparavant des heures de travail ? Les premières victimes sont les artistes qui travaillaient sur commande pour des contenus standardisés — couvertures de livres, jingles publicitaires, articles de fond.

La deuxième question est éthique et juridique : les IA ont été entraînées sur des millions d'œuvres créées par des humains, souvent sans leur consentement et sans rémunération. Des procès sont en cours aux États-Unis et en Europe pour déterminer si cet apprentissage constitue une violation du droit d'auteur.

Mais la question la plus fondamentale est peut-être philosophique : qu'est-ce que la création artistique ? Est-elle réductible à la combinaison de patterns existants, ou implique-t-elle quelque chose d'irréductible — intention, émotion, expérience vécue — que les machines ne pourront jamais vraiment simuler ?`;

const ART_DETTE_PUBLIQUE =
`LA DETTE PUBLIQUE ET SES CONSÉQUENCES SUR LES GÉNÉRATIONS FUTURES

La dette publique mondiale a atteint des niveaux records après la pandémie de Covid-19, qui a contraint la plupart des gouvernements à dépenser massivement pour soutenir leurs économies. En France, la dette représente désormais plus de 110 % du produit intérieur brut. Cette situation inquiète les économistes libéraux qui y voient une bombe à retardement, tandis que d'autres économistes estiment que cette vision est excessivement alarmiste.

La question centrale est celle du fardeau intergénérationnel. Une dette publique est en effet remboursée par les contribuables futurs — c'est-à-dire les générations qui n'ont pas bénéficié des dépenses qu'elle a financées. Certains économistes soulignent cependant que la dette publique finance aussi des investissements — infrastructures, éducation, recherche — dont les générations futures bénéficieront directement. La dette pour financer un plan de relance économique n'est pas équivalente à la dette pour couvrir des dépenses de fonctionnement courantes.

Le niveau soutenable d'une dette publique dépend de plusieurs facteurs : le taux de croissance de l'économie, les taux d'intérêt auxquels l'État peut emprunter, et la confiance des marchés financiers dans la capacité de remboursement du pays. La France bénéficie jusqu'ici de taux d'emprunt raisonnables grâce à la stabilité de son cadre institutionnel et à la solidarité européenne.

Néanmoins, les économistes s'accordent sur un point : une trajectoire de dette incontrôlée finit par contraindre les marges de manœuvre budgétaires et rend un pays vulnérable aux chocs extérieurs. La question n'est pas de savoir s'il faut s'endetter, mais pour quoi.`;

const ART_SMART_CITIES =
`LES SMART CITIES : VILLE INTELLIGENTE OU VILLE SURVEILLÉE ?

Le concept de « smart city » — ville intelligente — est devenu l'horizon indépassable de l'urbanisme contemporain. Des capteurs connectés en temps réel, des algorithmes qui optimisent la gestion des déchets, du trafic et de la consommation énergétique, des applications mobiles qui mettent en relation les habitants et les services publics... La ville intelligente promet plus d'efficacité, moins de gaspillage et une meilleure qualité de vie pour ses habitants.

Mais derrière ce tableau séduisant se cachent des questions politiques et éthiques considérables. La smart city génère des données massives sur les habitudes, les déplacements et les comportements de ses habitants. Qui collecte ces données ? Qui y a accès ? À quelles fins peuvent-elles être utilisées ? Les scandales liés à la surveillance de masse — des révélations d'Edward Snowden aux dérives des systèmes de reconnaissance faciale déployés en Chine — ont rendu les populations européennes plus sensibles à ces enjeux.

La gouvernance de ces données est au cœur du débat. Dans certains modèles, ce sont des multinationales technologiques — Google, IBM, Huawei — qui fournissent les infrastructures et détiennent de facto le contrôle des données urbaines. Dans d'autres, les collectivités locales tentent de maintenir leur souveraineté en développant des solutions open-source ou en exigeant des contrats garantissant la propriété publique des données.

L'enjeu n'est pas de refuser la technologie, mais de définir collectivement les conditions de son déploiement pour qu'elle serve l'intérêt général plutôt que des intérêts privés.`;

const ART_METAVERS =
`LE MÉTAVERS : RÉVOLUTION SOCIALE OU GADGET TECHNOLOGIQUE ?

Le métavers — cet espace numérique tridimensionnel dans lequel des avatars représentent des personnes réelles qui interagissent, travaillent et se divertissent — a fait l'objet d'un battage médiatique considérable lorsque Meta (anciennement Facebook) a annoncé en 2021 qu'il serait l'avenir de l'internet. Des milliards de dollars ont été investis dans son développement par les géants technologiques.

Quelques années plus tard, le bilan est pour le moins mitigé. L'Horizon Worlds de Meta, censé être le fer de lance de cette révolution, affiche des graphismes rudimentaires et une fréquentation décevante. Les casques de réalité virtuelle restent inconfortables, coûteux et peu adaptés à un usage prolongé. Nombreux sont les observateurs qui ont reclassé le métavers de « révolution imminente » à « promesse lointaine ».

Et pourtant, l'idée n'est pas sans fondements. Des espaces numériques comme Roblox ou Fortnite rassemblent déjà des centaines de millions d'utilisateurs dans des univers virtuels où ils socialise, créent et commercent. Des entreprises utilisent des jumeaux numériques de leurs usines pour simuler des processus de production. Des universités expérimentent l'enseignement en réalité virtuelle avec des résultats encourageants pour certains types d'apprentissage.

La question n'est peut-être pas tant de savoir si le métavers existera, mais sous quelle forme et pour quels usages. Une révolution sociale implique un changement profond des pratiques quotidiennes — or rien ne garantit que la majorité des individus souhaite vivre une partie significative de leur existence sociale dans un espace numérique.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Mode d'emploi imprimante
  qs.push(q(1, 'Q1-7', null, {
    longText:
`IMPRIMANTE PIXMA G3560 — INSTALLATION DES CARTOUCHES

1. Ouvrez le capot supérieur de l'imprimante et attendez que la tête d'impression se positionne au centre.
2. Retirez la cartouche usagée en appuyant légèrement vers le bas, puis en la tirant vers vous.
3. Retirez le film protecteur orange de la nouvelle cartouche sans toucher les contacts électriques.
4. Insérez la nouvelle cartouche dans son emplacement en appuyant jusqu'au déclic.
5. Fermez le capot et attendez le message « Impression de test » à l'écran.

⚠ Utilisez uniquement des cartouches d'origine. Les cartouches compatibles peuvent endommager les têtes d'impression.`,
    question: "Ce document est…",
    optionA: "une publicité pour des cartouches d'encre.",
    optionB: "une notice d'installation de cartouches d'imprimante.",
    optionC: "un bon de garantie pour une imprimante.",
    optionD: "un rapport de panne d'un service informatique.",
    correctAnswer: 'B',
  }));

  // Q2 — Invitation officielle d'une maire
  qs.push(q(2, 'Q1-7', null, {
    longText:
`MAIRIE DE VILLEFRANCHE-SUR-SAÔNE

Madame la Maire a l'honneur de vous inviter à la cérémonie officielle
de remise des médailles du travail

Le vendredi 4 avril 2025 à 18 h 30
à la Salle des Fêtes de l'Hôtel de Ville, 390 rue de Thizy

Tenue de ville exigée.
Réponse souhaitée avant le 28 mars à : protocole@ville-villefranche.fr

Un cocktail sera offert à l'issue de la cérémonie.`,
    question: "Ce document est…",
    optionA: "un rapport de réunion du conseil municipal.",
    optionB: "une annonce d'une manifestation culturelle.",
    optionC: "une invitation officielle à une cérémonie de remise de médailles.",
    optionD: "un communiqué de presse de la mairie.",
    correctAnswer: 'C',
  }));

  // Q3 — Règlement club de tennis
  qs.push(q(3, 'Q1-7', null, {
    longText:
`TENNIS CLUB DE LA VALLÉE — Règlement intérieur

Inscription : se faire enregistrer à l'accueil lors de la première venue. Présenter sa licence ou sa carte journalière à chaque entrée.

Réservation des courts : en ligne sur l'application TCV ou par téléphone, 7 jours à l'avance maximum. Annulation possible jusqu'à 2 h avant le début de la séance.

Code vestimentaire : tenue de sport propre obligatoire. Chaussures de tennis à semelle blanche requises (pas de chaussures de running). Tenue de ville interdite sur les courts.

Comportement : respect des autres joueurs exigé. Tout comportement irrespectueux pourra entraîner l'exclusion du club.`,
    question: "Ce document présente principalement…",
    optionA: "les tarifs d'adhésion au club de tennis.",
    optionB: "les règles de fonctionnement du club de tennis.",
    optionC: "le programme des tournois du club de tennis.",
    optionD: "les conditions d'inscription aux cours collectifs.",
    correctAnswer: 'B',
  }));

  // Q4 — Affiche parc naturel régional
  qs.push(q(4, 'Q1-7', null, {
    longText:
`PARC NATUREL RÉGIONAL DU VERCORS

Bienvenue dans notre espace naturel protégé !

Activités : randonnée pédestre (300 km de sentiers balisés), VTT, escalade, raquettes en hiver. Refuges disponibles sur réservation.

Faune à observer : chamois, marmottes, aigles royaux, faucons pèlerins.

Règles de respect : ne pas quitter les sentiers balisés. Chiens tenus en laisse obligatoirement. Ramassage de plantes interdit. Feux en forêt strictement interdits toute l'année.

Accès : depuis Grenoble — route D1532 puis D531. Pas de transport en commun direct.`,
    question: "Ce document est…",
    optionA: "un guide de randonnée avec itinéraires détaillés.",
    optionB: "un panneau d'information d'un parc naturel régional.",
    optionC: "une brochure touristique sur les sports d'hiver.",
    optionD: "un règlement de chasse dans une réserve naturelle.",
    correctAnswer: 'B',
  }));

  // Q5 — Horaires bus interurbain
  qs.push(q(5, 'Q1-7', null, {
    longText:
`LIGNE 52 — Clermont-Ferrand / Issoire / Brioude

LUNDI AU VENDREDI :
Clermont-Ferrand (Jaude) départ : 06 h 55 | 08 h 10 | 12 h 00 | 17 h 30
Issoire (centre) : 07 h 40 | 09 h 00 | 12 h 45 | 18 h 15
Brioude (gare) arrivée : 08 h 10 | 09 h 35 | 13 h 20 | 18 h 55

SAMEDI ET DIMANCHE : service réduit — 1 aller-retour par jour.

Tarifs : plein tarif 8,50 € | abonné mensuel 65 € | gratuit -6 ans`,
    question: "Ce document est…",
    optionA: "une publicité pour une compagnie de transport.",
    optionB: "un horaire de bus interurbain.",
    optionC: "un bon de réservation de transport.",
    optionD: "un règlement d'utilisation des transports en commun.",
    correctAnswer: 'B',
  }));

  // Q6 — Menu cafétéria universitaire
  qs.push(q(6, 'Q1-7', null, {
    longText:
`CAFÉTÉRIA UNIVERSITAIRE — Menu du jour — Mercredi 19 mars

Formule du jour (1 entrée + 1 plat + 1 dessert + 1 boisson) :
• Étudiant (carte Izly) : 3,30 €
• Personnel de l'université : 5,50 €
• Visiteur extérieur : 8,00 €

Plat du jour : Dos de cabillaud, riz basmati et légumes de saison (végétarien : gratin d'aubergines).
Entrée : salade de mâche aux noix | Dessert : yaourt aux fruits ou fromage blanc.

Horaires : 11 h 30 – 14 h 00 (service continu)`,
    question: "Ce document présente principalement…",
    optionA: "le règlement de la cafétéria universitaire.",
    optionB: "les horaires d'ouverture de la cafétéria.",
    optionC: "le menu et les tarifs de la cafétéria universitaire.",
    optionD: "une publicité pour un restaurant universitaire.",
    correctAnswer: 'C',
  }));

  // Q7 — Courriel administration aux locataires
  qs.push(q(7, 'Q1-7', null, {
    longText:
`De : bailleurs-sociaux@habitat-provence.fr
À : Résidents — Bâtiment C

Objet : Travaux de ravalement de façade

Madame, Monsieur,

Nous vous informons que des travaux de ravalement de la façade principale du bâtiment C débuteront le lundi 7 avril et se termineront le vendredi 23 mai, soit environ 7 semaines de travaux.

Pendant cette période, des échafaudages seront installés devant les fenêtres des appartements du 1er au 5e étage. Nous nous excusons par avance des nuisances sonores (de 8 h à 17 h en semaine) et de la réduction de luminosité.

Pour toute question : 04 13 00 55 66 ou travaux@habitat-provence.fr`,
    question: "Ce courriel informe les locataires principalement de…",
    optionA: "la hausse prochaine des loyers dans la résidence.",
    optionB: "travaux de ravalement et des désagréments associés.",
    optionC: "l'organisation d'une réunion de copropriétaires.",
    optionD: "la fermeture temporaire des parties communes.",
    correctAnswer: 'B',
  }));

  // Q8-13
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Tous les participants doivent ___ les consignes de sécurité avant de commencer l'activité.",
    question: PHRASE_Q,
    optionA: "ignorer",
    optionB: "critiquer",
    optionC: "respecter",
    optionD: "contourner",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le directeur a ___ une réunion d'urgence pour discuter des résultats du troisième trimestre.",
    question: PHRASE_Q,
    optionA: "annulé",
    optionB: "convoqué",
    optionC: "remplacé",
    optionD: "oublié",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour obtenir ce poste, il faut ___ une expérience d'au moins trois ans dans le domaine.",
    question: PHRASE_Q,
    optionA: "inventer",
    optionB: "justifier",
    optionC: "oublier",
    optionD: "négliger",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La société a décidé d'___ ses activités à l'international afin d'augmenter son chiffre d'affaires.",
    question: PHRASE_Q,
    optionA: "restreindre",
    optionB: "éliminer",
    optionC: "étendre",
    optionD: "cacher",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le projet de rénovation a été ___ par le comité de direction en raison des coûts trop élevés.",
    question: PHRASE_Q,
    optionA: "accepté",
    optionB: "félicité",
    optionC: "retardé",
    optionD: "rejeté",
    correctAnswer: 'D',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'entreprise souhaite ___ ses émissions de CO₂ de 30 % d'ici 2030 grâce à des énergies renouvelables.",
    question: PHRASE_Q,
    optionA: "augmenter",
    optionB: "maintenir",
    optionC: "réduire",
    optionD: "calculer",
    correctAnswer: 'C',
  }));

  // Q14-17
  const TEXTE_LAC_1 =
    "Le sport est bénéfique non seulement pour la [14] physique, mais aussi pour le bien-être mental. Des études scientifiques montrent qu'une activité physique régulière réduit le stress, améliore le sommeil et contribue à [15] la dépression et l'anxiété.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Les bienfaits du sport",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "fragilité",
    optionB: "forme",
    optionC: "limite",
    optionD: "douleur",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Les bienfaits du sport",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "provoquer",
    optionB: "développer",
    optionC: "prévenir",
    optionD: "ignorer",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "L'intelligence artificielle [16] de nombreux secteurs économiques, de la médecine à la finance en passant par les transports. Si elle [17] de grandes opportunités, elle soulève également des questions éthiques importantes qui nécessitent un cadre réglementaire adapté.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'intelligence artificielle",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "ignore",
    optionB: "transforme",
    optionC: "détruit",
    optionD: "rejette",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'intelligence artificielle",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "refuse",
    optionB: "cache",
    optionC: "offre",
    optionD: "détruit",
    correctAnswer: 'C',
  }));

  // Q18-21
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle mutuelle rembourse intégralement les frais optiques sans plafond annuel ?",
    optionA: "Mutuelle 1",
    optionB: "Mutuelle 2",
    optionC: "Mutuelle 3",
    optionD: "Mutuelle 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel projet immobilier sera livré dans les 6 prochains mois ?",
    optionA: "Projet 1",
    optionB: "Projet 2",
    optionC: "Projet 3",
    optionD: "Projet 4",
    correctAnswer: 'A',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel stage propose une rémunération au-dessus du minimum légal ?",
    optionA: "Stage 1",
    optionB: "Stage 2",
    optionC: "Stage 3",
    optionD: "Stage 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel voyage inclut le transport aérien dans le prix affiché ?",
    optionA: "Voyage 1",
    optionB: "Voyage 2",
    optionC: "Voyage 3",
    optionD: "Voyage 4",
    correctAnswer: 'A',
  }));

  // Q22
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La température dans cette ville varie de moins de deux degrés Celsius sur l'ensemble de l'année. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement du club sportif d'entreprise — Dynamo",
    longText: DOC_CLUB_SPORT,
    question: "Ce document présente principalement…",
    optionA: "les tarifs des abonnements de sport pour les salariés.",
    optionB: "les règles de fonctionnement du club sportif d'entreprise.",
    optionC: "le programme des compétitions sportives de l'entreprise.",
    optionD: "les équipements sportifs disponibles dans les locaux de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement du club sportif d'entreprise — Dynamo",
    longText: DOC_CLUB_SPORT,
    question: "Selon ce règlement, un membre du club peut inviter un non-salarié…",
    optionA: "une fois par semaine maximum.",
    optionB: "deux fois par mois maximum.",
    optionC: "sans limite de fréquence.",
    optionD: "uniquement lors des événements officiels du club.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Charte éthique des achats",
    longText: DOC_CHARTE_ACHATS,
    question: "Cette charte décrit principalement…",
    optionA: "les procédures de commande de fournitures de bureau.",
    optionB: "les valeurs et règles guidant la politique d'achats de l'entreprise.",
    optionC: "les critères de sélection des clients de l'entreprise.",
    optionD: "les tarifs négociés avec les fournisseurs habituels.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Charte éthique des achats",
    longText: DOC_CHARTE_ACHATS,
    question: "Selon cette charte, un cadeau d'une valeur supérieure à 30 € doit obligatoirement…",
    optionA: "être refusé et renvoyé au fournisseur.",
    optionB: "être partagé entre tous les membres de l'équipe.",
    optionC: "être déclaré à la direction des achats.",
    optionD: "être offert à une association caritative.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de stage en entreprise",
    longText: DOC_CONVENTION_STAGE,
    question: "Ce document est principalement…",
    optionA: "un contrat de travail entre l'entreprise et le stagiaire.",
    optionB: "une convention encadrant un stage entre une entreprise et une université.",
    optionC: "un règlement intérieur applicable aux stagiaires.",
    optionD: "une offre de stage publiée par l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de stage en entreprise",
    longText: DOC_CONVENTION_STAGE,
    question: "Selon cette convention, quelle est la gratification mensuelle du stagiaire ?",
    optionA: "500 €/mois",
    optionB: "600 €/mois",
    optionC: "700 €/mois",
    optionD: "800 €/mois",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement des déplacements professionnels",
    longText: DOC_REGLEMENT_DEPLACEMENTS,
    question: "Ce document décrit principalement…",
    optionA: "les avantages accordés aux salariés qui voyagent souvent.",
    optionB: "les règles et plafonds de prise en charge des déplacements professionnels.",
    optionC: "les procédures de réservation des billets d'avion.",
    optionD: "les conditions d'utilisation des véhicules de service.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement des déplacements professionnels",
    longText: DOC_REGLEMENT_DEPLACEMENTS,
    question: "Selon ce règlement, quel est le plafond de remboursement d'une nuit d'hôtel à Paris ?",
    optionA: "100 € TTC",
    optionB: "120 € TTC",
    optionC: "160 € TTC",
    optionD: "200 € TTC",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note d'organisation — Séminaire annuel d'entreprise 2025",
    longText: DOC_NOTE_EVENEMENT,
    question: "Ce document présente principalement…",
    optionA: "un bilan du séminaire de l'année précédente.",
    optionB: "les modalités d'organisation d'un séminaire d'entreprise.",
    optionC: "les objectifs stratégiques de l'entreprise pour 2025.",
    optionD: "un appel à candidatures pour des intervenants extérieurs.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note d'organisation — Séminaire annuel d'entreprise 2025",
    longText: DOC_NOTE_EVENEMENT,
    question: "Quel est le budget prévisionnel total du séminaire ?",
    optionA: "35 000 € TTC",
    optionB: "40 000 € TTC",
    optionC: "45 000 € TTC",
    optionD: "50 000 € TTC",
    correctAnswer: 'C',
  }));

  // Q33-40
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "L'IA et la création artistique : quand les machines disputent le terrain aux humains",
    longText: ART_IA_CREATION,
    question: "Selon cet article, quels artistes sont les premières victimes des IA génératives ?",
    optionA: "Les artistes de renom reconnus sur les marchés internationaux.",
    optionB: "Les artistes qui travaillaient sur commande pour des contenus standardisés.",
    optionC: "Les artistes qui refusent d'utiliser les nouveaux outils numériques.",
    optionD: "Les artistes qui enseignent dans les écoles d'art traditionnelles.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "L'IA et la création artistique : quand les machines disputent le terrain aux humains",
    longText: ART_IA_CREATION,
    question: "L'auteur pose comme question fondamentale…",
    optionA: "si l'IA peut générer des œuvres plus rapidement que les humains.",
    optionB: "si la création artistique implique quelque chose que les machines ne peuvent simuler.",
    optionC: "si les droits d'auteur doivent être étendus aux œuvres générées par IA.",
    optionD: "si les gouvernements doivent interdire l'usage des IA génératives.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "La dette publique et ses conséquences sur les générations futures",
    longText: ART_DETTE_PUBLIQUE,
    question: "Selon cet article, quel est le niveau actuel de la dette publique française par rapport au PIB ?",
    optionA: "Environ 60 % du PIB.",
    optionB: "Environ 80 % du PIB.",
    optionC: "Plus de 110 % du PIB.",
    optionD: "Environ 150 % du PIB.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "La dette publique et ses conséquences sur les générations futures",
    longText: ART_DETTE_PUBLIQUE,
    question: "Sur quel point les économistes s'accordent-ils selon l'auteur ?",
    optionA: "Une dette publique élevée est toujours bénéfique pour la croissance économique.",
    optionB: "Une trajectoire de dette incontrôlée réduit les marges de manœuvre budgétaires.",
    optionC: "Les générations futures ne seront jamais affectées par la dette actuelle.",
    optionD: "La France doit immédiatement rembourser l'intégralité de sa dette.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Les smart cities : ville intelligente ou ville surveillée ?",
    longText: ART_SMART_CITIES,
    question: "Selon cet article, quelle est la principale préoccupation éthique liée aux smart cities ?",
    optionA: "Le coût trop élevé des infrastructures technologiques.",
    optionB: "La collecte et l'utilisation des données massives sur les habitants.",
    optionC: "L'exclusion des personnes âgées des services numériques.",
    optionD: "La dépendance aux énergies fossiles pour alimenter les capteurs connectés.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Les smart cities : ville intelligente ou ville surveillée ?",
    longText: ART_SMART_CITIES,
    question: "L'auteur conclut que l'enjeu principal concernant les smart cities est de…",
    optionA: "refuser toute technologie pour protéger la vie privée des citoyens.",
    optionB: "définir collectivement les conditions de déploiement des technologies pour l'intérêt général.",
    optionC: "confier la gestion des villes à des experts en technologie.",
    optionD: "interdire aux multinationales de participer aux infrastructures urbaines.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le métavers : révolution sociale ou gadget technologique ?",
    longText: ART_METAVERS,
    question: "Selon l'article, quel est le bilan du développement du métavers quelques années après l'annonce de Meta ?",
    optionA: "Un succès fulgurant avec des centaines de millions d'utilisateurs actifs.",
    optionB: "Un bilan mitigé, avec des graphismes rudimentaires et une fréquentation décevante.",
    optionC: "Une révolution complète des pratiques sociales et professionnelles.",
    optionD: "Un abandon total du projet par Meta après des pertes colossales.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le métavers : révolution sociale ou gadget technologique ?",
    longText: ART_METAVERS,
    question: "L'auteur souligne que pour qu'une technologie constitue une révolution sociale, il faut…",
    optionA: "qu'elle soit accessible à tous gratuitement dès son lancement.",
    optionB: "qu'elle soit adoptée par les gouvernements comme infrastructure officielle.",
    optionC: "qu'elle entraîne un changement profond des pratiques quotidiennes d'une majorité de personnes.",
    optionD: "qu'elle génère des profits importants pour ses créateurs.",
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
    console.log(`\n✅ ${created} questions créées pour CE 9.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
