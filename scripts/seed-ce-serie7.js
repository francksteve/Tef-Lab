'use strict';
/**
 * seed-ce-serie7.js
 * Peuple la série CE 7 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie7.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoenp00030wxlmqz99qx0';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : courbe précipitations mensuelles — pic en août ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [20,18,22,30,45,10,5,8,25,40,35,25],  minY: 0, maxY: 50,  color: '#E30613' },
    { label: 'Graphique 2', data: [80,70,65,60,65,55,50,55,70,85,90,85], minY: 40, maxY: 100, color: '#E30613' },
    { label: 'Graphique 3', data: [30,25,40,60,90,110,140,130,100,60,35,25], minY: 20, maxY: 150, color: '#003087' }, // CORRECT
    { label: 'Graphique 4', data: [40,35,40,50,65,70,60,55,50,45,50,42], minY: 30, maxY: 80,  color: '#E30613' },
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
             `<text x="${plotX - 5}" y="${(yv + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${t.toFixed(0)}</text>`;
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
  { title: 'Restaurant 1', content: "Le Jardin Méditérranéen — Cuisine provençale. Ambiance chaleureuse en terrasse. Spécialités : bouillabaisse, ratatouille, tapenade maison. Prix moyen : 35 €/personne. Réservation conseillée le week-end. Ouvert du mardi au dimanche." },
  { title: 'Restaurant 2', content: "Sakura Sushi Bar — Cuisine japonaise authentique. Cadre épuré et moderne. Spécialités : plateau de sushis, ramens, tempuras. Prix moyen : 28 €/personne. Service rapide, idéal pour les repas d'affaires. Ouvert tous les jours midi et soir." },
  { title: 'Restaurant 3', content: "Wok de Chine — Cuisine asiatique fusion. Ambiance animée. Spécialités : canard laqué, dim sum, nouilles sautées. Menu dégustation 7 plats à 45 €. Prix moyen : 30 €/personne. Fermé le lundi." },
  { title: 'Restaurant 4', content: "La Ferme du Terroir — Cuisine du Sud-Ouest. Ambiance rustique et conviviale. Spécialités : magret de canard, foie gras maison, cassoulet. Prix moyen : 42 €/personne. Vins régionaux sélectionnés. Réservation obligatoire." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Musée 1', content: "Exposition 'L'Art Roman en Provence' — Musée Archéologique, Arles. Du 15 mars au 30 juin. Tarif plein : 10 €, tarif réduit : 7 €. Gratuit le premier dimanche du mois. Visite guidée disponible sur réservation." },
  { title: 'Musée 2', content: "Exposition 'Lumières d'Afrique' — Galerie Moderne, Lyon. Du 1er avril au 15 mai. Gratuit pour les moins de 18 ans sur présentation d'une pièce d'identité. Tarif adulte : 8 €. Ateliers enfants le samedi matin." },
  { title: 'Musée 3', content: "Exposition 'Impressionnistes et nature' — Musée des Beaux-Arts, Bordeaux. Du 10 mai au 31 août. Tarif plein : 12 €, tarif réduit : 9 €. Carte Bordeaux Métropole : gratuit. Nocturnes le jeudi jusqu'à 21 h." },
  { title: 'Musée 4', content: "Exposition 'Sciences et découvertes' — Cité des Sciences, Paris. Permanente. Tarif plein : 15 €, tarif réduit : 12 €. Abonnement annuel : 50 €. Forfait famille (2 adultes + 2 enfants) : 40 €. Ouvert 7j/7." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Club 1', content: "Club Aquatique Neptune — Sport : natation et water-polo. Adhésion annuelle : 120 €. Entraînements : lundi, mercredi, vendredi. Équipements : piscine 25 m, bassin d'apprentissage. Compétitions régionales et nationales. Ouvert aux adultes et enfants dès 6 ans." },
  { title: 'Club 2', content: "Tennis Club des Pins — Sport : tennis en salle et en plein air. Adhésion annuelle : 180 €. Courts disponibles 7j/7. Cours collectifs inclus. Pas de piscine. Tournois internes chaque trimestre. Vestiaires modernes." },
  { title: 'Club 3', content: "Fitness Center Olympia — Sport : musculation, cardio, yoga. Adhésion mensuelle : 40 €. Cours collectifs illimités. Accès sauna vapeur uniquement avec abonnement Premium (60 €/mois). Ouvert 6 h – 23 h du lundi au samedi." },
  { title: 'Club 4', content: "Centre Nautique des Champions — Sport : natation, plongeon, natation artistique. Piscine olympique (50 m) + bassin de plongeon. Adhésion annuelle : 150 €. Entraînements quotidiens. Compétitions nationales et internationales. Accessible PMR." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Livre 1', content: "L'Écho des Étoiles — Roman de science-fiction. Auteur : Karim Aldabek. Synopsis : en 2187, une humanité divisée explore les confins de la galaxie à la recherche de ressources vitales. Une saga épique sur la survie et la solidarité. Prix : 22 €." },
  { title: 'Livre 2', content: "Les Saisons du Bonheur — Roman sentimental. Auteure : Isabelle Morand. Synopsis : l'histoire d'un amour impossible entre deux êtres que la vie a séparés et que le destin réunit trente ans plus tard dans la campagne normande. Prix : 19 €." },
  { title: 'Livre 3', content: "Enquête sur la dette — Essai économique. Auteur : Marc Léonard. L'auteur décortique les mécanismes de l'endettement public et ses conséquences sur les générations futures. Préface du Prix Nobel d'économie. Prix : 24 €." },
  { title: 'Livre 4', content: "La Forêt des Secrets — Roman policier. Auteure : Élise Vauban. Synopsis : une inspectrice de police découvre dans une forêt isolée des indices qui rouvrent une affaire classée vingt ans plus tôt. Thriller haletant. Prix : 20 €." },
]);

/* ── Documents Q23-32 ── */
const DOC_CONVENTION_PARTENARIAT =
`CONVENTION DE PARTENARIAT

Entre l'Association Jeunesse Citoyenne (partie A) et la Maison de Quartier des Fleurs (partie B) :

Objet : mise en place d'activités culturelles et sportives pour les jeunes de 10 à 18 ans résidant dans le quartier.

Engagements de la partie A : fournir les animateurs qualifiés et les supports pédagogiques nécessaires à l'animation des activités.

Engagements de la partie B : mettre à disposition ses locaux et équipements trois soirs par semaine, assurer la communication locale sur les activités proposées.

Durée : un an, renouvelable par accord exprès des deux parties avant le 30 novembre de chaque année.`;

const DOC_GUIDE_ACCUEIL =
`GUIDE D'ACCUEIL — NOUVEAUX SALARIÉS

Bienvenue dans notre entreprise ! Ce guide vous accompagnera pendant vos premières semaines.

Présentation de l'entreprise : fondée en 1992, notre société conçoit et commercialise des solutions logicielles pour les PME dans 15 pays. Nous employons 280 personnes sur 4 sites.

Procédures internes : badgez à chaque entrée et sortie. Votre identifiant informatique vous sera remis le premier jour par le service informatique. Les tickets restaurant sont distribués chaque lundi par la DRH.

Contacts clés : accueil général (poste 100), service informatique (poste 200), DRH (poste 300), médecin du travail (poste 400).

Votre responsable de service est votre premier interlocuteur pour toute question professionnelle.`;

const DOC_NOTICE_MACHINE =
`NOTICE DE SÉCURITÉ — PRESSE HYDRAULIQUE PH-500

Avant toute utilisation, l'opérateur doit impérativement :
• Porter les équipements de protection individuelle (EPI) : lunettes de sécurité, gants anti-coupures, chaussures de sécurité.
• Vérifier l'état du circuit hydraulique (absence de fuite visible).
• S'assurer que la zone de travail est dégagée de tout obstacle.

Interdictions absolues :
• Ne jamais faire fonctionner la machine sans les protections de sécurité en place.
• Ne jamais dépasser la pression maximale de 500 bars.

En cas d'incident ou d'accident : appuyer immédiatement sur l'arrêt d'urgence (bouton rouge) et alerter le responsable de production.`;

const DOC_MUTUELLE_SANTE =
`RÈGLEMENT DE LA MUTUELLE SANTÉ D'ENTREPRISE

Bénéficiaires : le salarié et ses ayants droit (conjoint et enfants à charge) peuvent bénéficier de la mutuelle collective, sous réserve d'être déclarés à la Sécurité Sociale.

Niveaux de remboursement :
• Soins courants : 100 % de la base Sécurité Sociale
• Hospitalisation : 200 % de la base, sans avance de frais dans les établissements partenaires
• Dentaire : 150 % de la base, forfait prothèse 600 €/an
• Optique : forfait annuel 150 € (verres + monture)

Résiliation : la mutuelle prend fin à la date de rupture du contrat de travail. Un maintien provisoire peut être accordé sous conditions.`;

const DOC_CHARTE_RGPD =
`CHARTE RGPD INTERNE — PROTECTION DES DONNÉES PERSONNELLES

Notre entreprise traite des données personnelles des salariés dans le cadre de la gestion des ressources humaines (paie, formation, évaluation).

Données collectées : état civil, coordonnées bancaires, diplômes, informations de santé (arrêts maladie uniquement), données de connexion aux systèmes informatiques.

Finalités : uniquement la gestion administrative du personnel. Ces données ne sont jamais cédées à des tiers commerciaux.

Droits des salariés : chaque salarié dispose d'un droit d'accès, de rectification et d'effacement de ses données personnelles. Les demandes sont à adresser au DPO (Délégué à la Protection des Données) : dpo@entreprise.fr.

Durée de conservation : 5 ans après la fin du contrat de travail, conformément à la loi.`;

/* ── Articles de presse Q33-40 ── */
const ART_NEUROSCIENCES =
`LES NEUROSCIENCES AU SERVICE DE L'APPRENTISSAGE : NOUVELLES PRATIQUES PÉDAGOGIQUES

Les neurosciences cognitives ont profondément modifié notre compréhension des mécanismes de l'apprentissage. Des chercheurs comme Stanislas Dehaene, directeur de l'unité de neuroimagerie cognitive à l'INSERM, ont identifié les conditions optimales dans lesquelles le cerveau humain mémorise et retient l'information. Ces découvertes bouleversent progressivement les pratiques pédagogiques traditionnelles.

Parmi les principes les mieux établis figure celui du « testing effect » ou effet de récupération : réviser une information en se l'interrogeant soi-même est beaucoup plus efficace que de simplement la relire. Le cerveau consolide les apprentissages chaque fois qu'il doit « chercher » une information en mémoire. D'où l'intérêt des exercices pratiques, des quiz et des dictées — des méthodes longtemps dévaluées par les pédagogies centrées sur la compréhension globale.

Le sommeil joue également un rôle crucial dans la mémorisation. Les recherches montrent que les apprentissages réalisés avant une nuit de sommeil sont mieux retenus que ceux effectués après. Les enseignants sont donc encouragés à planifier les nouveaux apprentissages en début de journée, en laissant au cerveau le temps de les consolider pendant la nuit.

L'attention est l'autre grande variable : sans attention, aucun apprentissage durable n'est possible. Les pédagogies actives — débat, jeux de rôle, expériences pratiques — favorisent davantage l'engagement cognitif des élèves que le cours magistral traditionnel. Ces apports des neurosciences ne signifient pas qu'il faut révolutionner l'école du jour au lendemain, mais ils offrent des pistes concrètes pour améliorer l'efficacité pédagogique.`;

const ART_TRANSITION_ENERGETIQUE =
`LA TRANSITION ÉNERGÉTIQUE : ENJEUX ÉCONOMIQUES ET RÉSISTANCES POLITIQUES

La transition vers des sources d'énergie renouvelables est présentée comme une nécessité absolue pour limiter le réchauffement climatique à 1,5 °C, tel qu'il est visé par l'accord de Paris. Pourtant, malgré des décennies de négociations internationales et des progrès technologiques réels dans le domaine solaire et éolien, la part des énergies fossiles dans le mix énergétique mondial n'a pas diminué de façon significative.

Les obstacles sont à la fois économiques et politiques. Sur le plan économique, le coût de la transition est colossal : l'Agence Internationale de l'Énergie estime qu'il faudrait investir 4 000 milliards de dollars par an d'ici 2030 pour décarboner l'économie mondiale. Ces investissements doivent être répartis entre pays développés et pays en développement, ce qui soulève des questions de justice climatique.

Sur le plan politique, les résistances sont multiples. Les industries fossiles disposent de lobbies puissants capables d'influencer les législateurs. Dans de nombreux pays, les gouvernements hésitent à taxer fortement le carbone de peur de provoquer des mouvements sociaux — la crise des Gilets Jaunes en France, déclenchée en 2018 par une taxe sur les carburants, illustre parfaitement ce risque politique.

Des signes d'accélération existent néanmoins. L'effondrement des coûts de l'énergie solaire, les engagements pris par les grandes économies mondiales, et l'émergence de coalitions d'acteurs privés déterminés à agir constituent des signaux encourageants. La question n'est plus de savoir si la transition aura lieu, mais à quelle vitesse et dans quelles conditions.`;

const ART_FRACTURE_NUMERIQUE =
`LES INÉGALITÉS NUMÉRIQUES : QUAND LE FOSSÉ TECHNOLOGIQUE CREUSE LES FRACTURES SOCIALES

L'accélération de la numérisation de la société crée un paradoxe inquiétant : alors que les technologies numériques promettent plus d'accès et d'égalité, elles risquent d'aggraver les inégalités entre ceux qui maîtrisent ces outils et ceux qui en sont exclus. Ce phénomène, désigné par l'expression « fracture numérique », touche de manière disproportionnée les populations âgées, peu qualifiées, rurales ou à faibles revenus.

En France, si le taux de pénétration d'internet dépasse 90 % de la population, les usages restent très inégaux. Une étude du Credoc montre que plus d'un tiers des Français éprouve des difficultés à effectuer des démarches administratives en ligne, tandis que 13 millions de personnes se trouvent en situation d'illectronisme — incapacité à utiliser les outils numériques de base.

Les conséquences sont concrètes et croissantes. La dématérialisation des services publics — déclaration de revenus, demande d'allocations, prise de rendez-vous médicaux — pénalise ceux qui n'ont pas les compétences ou l'équipement nécessaire. L'accès à l'emploi est également concerné : les recruteurs utilisent des plateformes en ligne, les candidatures se font par internet, et certains secteurs exigent des compétences numériques de base que beaucoup ne possèdent pas.

Des politiques publiques existent pour réduire cette fracture : les « conseillers numériques » déployés par le gouvernement depuis 2021, les espaces France Services, les programmes de formation aux seniors. Ces initiatives restent insuffisantes face à l'ampleur du défi, d'autant que le rythme de la numérisation s'accélère plus vite que celui de la formation.`;

const ART_PATRIMOINE =
`LA SAUVEGARDE DU PATRIMOINE CULTUREL IMMATÉRIEL : LANGUES MENACÉES ET SAVOIRS ANCESTRAUX

L'UNESCO estime qu'une langue disparaît dans le monde toutes les deux semaines. Ce chiffre vertigineux illustre l'urgence d'une situation que les spécialistes désignent comme une crise silencieuse : la disparition des langues minoritaires entraîne avec elle des systèmes de connaissance, des visions du monde et des savoirs écologiques irremplaçables.

Les langues ne meurent pas de mort naturelle. Elles disparaissent sous l'effet de politiques éducatives qui imposent une langue nationale unique, de migrations vers les villes où les langues minoritaires sont socialement dévalorisées, et de la pression économique qui pousse les locuteurs à adopter des langues à plus forte valeur marchande comme l'anglais, l'espagnol ou le mandarin.

Les initiatives de revitalisation linguistique se multiplient pourtant. Au Pays de Galles, une politique volontariste d'enseignement obligatoire du gallois dans toutes les écoles a permis de doubler le nombre de locuteurs en trente ans. En Nouvelle-Zélande, les « nids linguistiques » maori offrent aux enfants une immersion totale dans leur langue d'origine dès le plus jeune âge. Ces succès montrent qu'il est possible de renverser la tendance, à condition d'une volonté politique forte et d'un soutien communautaire.

Au-delà des langues, c'est tout un patrimoine de savoirs traditionnels qui est en péril : techniques agricoles adaptées aux écosystèmes locaux, médecines naturelles, pratiques de gestion durable des forêts. Ces savoirs ancestraux représentent une ressource inestimable pour faire face aux défis du changement climatique et de la perte de biodiversité.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Attestation de travail
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ATTESTATION DE TRAVAIL

Je soussigné, M. Jean-Paul Renard, Directeur Général de la société IMMO CONSEIL SERVICES,
certifie que Madame Amina Coulibaly est employée en qualité de Responsable Administrative
depuis le 1er mars 2021, en contrat à durée indéterminée, à temps plein (35 h/semaine).

La présente attestation est délivrée à l'intéressée pour faire valoir ce que de droit.

Fait à Grenoble, le 15 janvier 2025
Signature et cachet de l'entreprise`,
    question: "Ce document est…",
    optionA: "un contrat de travail signé.",
    optionB: "une fiche de paye mensuelle.",
    optionC: "une attestation certifiant qu'une personne est employée.",
    optionD: "une lettre de recommandation professionnelle.",
    correctAnswer: 'C',
  }));

  // Q2 — Programme sortie scolaire
  qs.push(q(2, 'Q1-7', null, {
    longText:
`ÉCOLE PRIMAIRE JEAN MOULIN — Programme sortie scolaire

Destination : Écomusée de la Camargue
Date : jeudi 17 avril 2025
Départ : 8 h 00 (bus scolaire devant l'école) | Retour prévu : 17 h 30

Tarif participation : 12 € par élève (transport + entrée inclus)
Matériel à apporter : pique-nique, vêtements chauds, casquette, gourde.

Les parents accompagnateurs (2 bénévoles) sont attendus à 7 h 45.
Règlement du formulaire de participation avant le 8 avril.`,
    question: "Ce document est…",
    optionA: "une affiche publicitaire pour un musée.",
    optionB: "un programme de sortie scolaire avec informations pratiques.",
    optionC: "un règlement intérieur d'école primaire.",
    optionD: "une liste de fournitures scolaires.",
    correctAnswer: 'B',
  }));

  // Q3 — Affiche concert de musique classique
  qs.push(q(3, 'Q1-7', null, {
    longText:
`PHILHARMONIE DE BORDEAUX — Concert Exceptionnel

Vendredi 28 mars 2025 — 20 h 30
NUIT BEETHOVEN

Orchestre Symphonique de Bordeaux
Direction : Maestro Klaus Steinberg
Programme : Symphonie n°5 et Symphonie n°9 (Ode à la Joie)

Tarifs : Catégorie A 55 € | Catégorie B 38 € | Jeunes (-26 ans) 18 €
Billetterie : philharmonie-bordeaux.fr | Tél. : 05 56 00 77 88`,
    question: "Ce document est…",
    optionA: "un programme de concert de musique classique.",
    optionB: "une critique musicale dans un journal.",
    optionC: "une publicité pour une école de musique.",
    optionD: "un formulaire de réservation de concert.",
    correctAnswer: 'A',
  }));

  // Q4 — Horaires cinéma multiplex
  qs.push(q(4, 'Q1-7', null, {
    longText:
`CINÉMA PATHÉ HORIZON — Programme semaine du 24 au 30 mars

LA FORÊT DES SECRETS (Drame — 1 h 52) : 14 h 00 | 16 h 30 | 19 h 00 | 21 h 30
ÉVASION TOTALE (Action — 2 h 05) : 13 h 30 | 16 h 00 | 18 h 45 | 21 h 15
LE VOYAGE D'ÉMILE (Animation — 1 h 28) : 11 h 00 | 13 h 00 | 15 h 00 (version 3D +1,50 €)

Tarifs : Plein 12 € | Réduit 9,50 € | Carte 5 séances 42 €
Moins de 14 ans : 7 € (tous films, toutes séances)`,
    question: "Ce document présente…",
    optionA: "une critique de films en salle.",
    optionB: "les horaires et tarifs d'un cinéma.",
    optionC: "un abonnement à une plateforme de streaming.",
    optionD: "un bon de réduction pour le cinéma.",
    correctAnswer: 'B',
  }));

  // Q5 — Communiqué de presse mairie sur travaux
  qs.push(q(5, 'Q1-7', null, {
    longText:
`MAIRIE DE SAINT-MARC — Communiqué de presse

Travaux de réfection de la chaussée — Rue des Acacias et avenue de la Gare

Du lundi 7 au vendredi 18 avril, des travaux de réfection de la chaussée seront réalisés rue des Acacias (n° 1 à 45) et avenue de la Gare (n° 10 à 60).

Ces axes seront fermés à la circulation. Une déviation sera mise en place via la rue de la Paix et le boulevard du Nord.

Des difficultés de stationnement sont à prévoir. Nous vous remercions de votre compréhension.
Renseignements : service voirie 04 75 00 12 34`,
    question: "Ce document informe les habitants…",
    optionA: "d'une modification définitive du plan de circulation.",
    optionB: "de travaux de voirie et des déviations prévues.",
    optionC: "d'une fermeture permanente de rues commerçantes.",
    optionD: "d'une inauguration de nouvelles infrastructures routières.",
    correctAnswer: 'B',
  }));

  // Q6 — Petite annonce meubles occasion
  qs.push(q(6, 'Q1-7', null, {
    longText:
`VENTE DE MEUBLES D'OCCASION — Déménagement obligé

Canapé 3 places en tissu gris clair, très bon état, 2 ans : 180 €
Table à manger en bois massif (160×80), 6 chaises incluses : 250 €
Bibliothèque en pin, 5 étagères, H 180 cm : 60 €
Lampe de salon design, abat-jour blanc : 25 €

Tout est à vendre au prix affiché, pas de négociation.
Enlèvement sur place à Toulouse 31000.
Contact : aurelieD@mail.fr ou SMS au 06 11 44 77 88`,
    question: "Ce document est…",
    optionA: "une publicité pour un magasin de meubles.",
    optionB: "une petite annonce de vente de meubles d'occasion.",
    optionC: "un inventaire de biens à donner.",
    optionD: "un catalogue d'un vide-grenier.",
    correctAnswer: 'B',
  }));

  // Q7 — Facture d'un restaurant
  qs.push(q(7, 'Q1-7', null, {
    longText:
`RESTAURANT LE BOUCHON LYONNAIS — Reçu n° 2025-0892

Table 7 — 2 couverts — Serveur : Marc

2 × Salade lyonnaise : 2 × 9,50 € = 19,00 €
2 × Quenelle de brochet sauce Nantua : 2 × 18,50 € = 37,00 €
1 × Tarte aux pralines : 7,50 €
1 × Carafe d'eau : gratuit
1 × Bouteille de Beaujolais Villages 50 cl : 14,00 €

Sous-total : 77,50 €
Service (10 %) : 7,75 €
TOTAL : 85,25 €
Paiement : carte bancaire`,
    question: "Ce document est…",
    optionA: "un menu affiché à l'entrée d'un restaurant.",
    optionB: "un bon de commande envoyé à un fournisseur.",
    optionC: "une facture détaillée d'un repas au restaurant.",
    optionD: "une invitation à dîner dans un restaurant étoilé.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le projet de construction sera ___ d'ici la fin de l'année, selon le calendrier initial prévu.",
    question: PHRASE_Q,
    optionA: "commencé",
    optionB: "abandonné",
    optionC: "achevé",
    optionD: "modifié",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Nous vous ___ de nous retourner le formulaire signé dans les meilleurs délais.",
    question: PHRASE_Q,
    optionA: "déconseillons",
    optionB: "prions",
    optionC: "empêchons",
    optionD: "oublions",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'entreprise ___ une croissance de 15 % de son chiffre d'affaires au cours du dernier trimestre.",
    question: PHRASE_Q,
    optionA: "a perdu",
    optionB: "a enregistré",
    optionC: "a rejeté",
    optionD: "a évité",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour postuler, les candidats doivent transmettre leur CV et une lettre de ___ avant la date limite.",
    question: PHRASE_Q,
    optionA: "réclamation",
    optionB: "commande",
    optionC: "motivation",
    optionD: "démission",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce rapport financier doit rester ___ et ne peut être communiqué à des personnes extérieures à l'entreprise.",
    question: PHRASE_Q,
    optionA: "public",
    optionB: "accessible",
    optionC: "diffusé",
    optionD: "confidentiel",
    correctAnswer: 'D',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin a prescrit un traitement et conseillé à son patient de ___ une alimentation équilibrée.",
    question: PHRASE_Q,
    optionA: "négliger",
    optionB: "éviter",
    optionC: "adopter",
    optionD: "refuser",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La forêt amazonienne est souvent [14] comme le « poumon de la planète » en raison de sa capacité à absorber le dioxyde de carbone atmosphérique. Sa [15] représente une menace directe pour l'équilibre climatique mondial et la biodiversité de notre planète.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La forêt amazonienne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "critiquée",
    optionB: "désignée",
    optionC: "oubliée",
    optionD: "construite",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La forêt amazonienne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "protection",
    optionB: "expansion",
    optionC: "déforestation",
    optionD: "fertilisation",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Les voyages en train [16] de plus en plus populaires en Europe grâce à leur faible impact environnemental et à l'amélioration du réseau ferroviaire à grande vitesse. Nombreux sont les voyageurs qui [17] désormais le train à l'avion pour les trajets de moins de cinq heures.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le retour du train",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "sont devenus",
    optionB: "sont perdus",
    optionC: "sont interdits",
    optionD: "sont terminés",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le retour du train",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "refusent",
    optionB: "préfèrent",
    optionC: "craignent",
    optionD: "détestent",
    correctAnswer: 'B',
  }));

  // Q18-21
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel restaurant propose de la cuisine asiatique ?",
    optionA: "Restaurant 1",
    optionB: "Restaurant 2",
    optionC: "Restaurant 3",
    optionD: "Restaurant 4",
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle exposition est accessible gratuitement aux moins de 18 ans ?",
    optionA: "Musée 1",
    optionB: "Musée 2",
    optionC: "Musée 3",
    optionD: "Musée 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel club sportif dispose d'une piscine olympique ?",
    optionA: "Club 1",
    optionB: "Club 2",
    optionC: "Club 3",
    optionD: "Club 4",
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel livre est classé dans la catégorie science-fiction ?",
    optionA: "Livre 1",
    optionB: "Livre 2",
    optionC: "Livre 3",
    optionD: "Livre 4",
    correctAnswer: 'A',
  }));

  // Q22
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les précipitations dans cette région atteignent leur niveau le plus élevé au mois d'août. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Convention de partenariat entre deux associations",
    longText: DOC_CONVENTION_PARTENARIAT,
    question: "Ce document présente principalement…",
    optionA: "un règlement intérieur d'association de jeunesse.",
    optionB: "un accord de coopération entre deux associations.",
    optionC: "un contrat de travail pour un animateur jeunesse.",
    optionD: "un programme d'activités culturelles pour adultes.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Convention de partenariat entre deux associations",
    longText: DOC_CONVENTION_PARTENARIAT,
    question: "La Maison de Quartier s'engage notamment à…",
    optionA: "fournir les animateurs qualifiés pour les activités.",
    optionB: "mettre à disposition ses locaux trois soirs par semaine.",
    optionC: "financer intégralement le programme d'activités.",
    optionD: "recruter des bénévoles pour accompagner les jeunes.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Guide d'accueil — Nouveaux salariés",
    longText: DOC_GUIDE_ACCUEIL,
    question: "Ce document a pour but principal de…",
    optionA: "présenter les objectifs commerciaux de l'entreprise.",
    optionB: "accompagner les nouveaux salariés dans leur intégration.",
    optionC: "définir les critères d'évaluation annuelle des salariés.",
    optionD: "informer les clients sur les services de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Guide d'accueil — Nouveaux salariés",
    longText: DOC_GUIDE_ACCUEIL,
    question: "Selon ce guide, les tickets restaurant sont distribués…",
    optionA: "chaque jour à la cafétéria de l'entreprise.",
    optionB: "chaque semaine par la DRH, le lundi.",
    optionC: "chaque mois avec le bulletin de salaire.",
    optionD: "directement par le responsable de service.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Notice de sécurité — Presse hydraulique PH-500",
    longText: DOC_NOTICE_MACHINE,
    question: "Ce document a pour objectif principal de…",
    optionA: "décrire les performances techniques de la machine.",
    optionB: "informer les utilisateurs sur les règles de sécurité.",
    optionC: "former les opérateurs à la maintenance de la machine.",
    optionD: "présenter le processus de fabrication de la machine.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Notice de sécurité — Presse hydraulique PH-500",
    longText: DOC_NOTICE_MACHINE,
    question: "En cas d'incident lors de l'utilisation de la presse, l'opérateur doit…",
    optionA: "continuer à travailler pour ne pas perdre de temps.",
    optionB: "contacter immédiatement le fabricant de la machine.",
    optionC: "appuyer sur l'arrêt d'urgence et alerter le responsable.",
    optionD: "évacuer tous les collègues du bâtiment.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement de la mutuelle santé d'entreprise",
    longText: DOC_MUTUELLE_SANTE,
    question: "Ce document présente principalement…",
    optionA: "les conditions d'accès au remboursement par la Sécurité Sociale.",
    optionB: "les garanties et niveaux de remboursement de la mutuelle d'entreprise.",
    optionC: "les procédures de recrutement dans le secteur de la santé.",
    optionD: "les tarifs pratiqués par les médecins partenaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement de la mutuelle santé d'entreprise",
    longText: DOC_MUTUELLE_SANTE,
    question: "Selon ce règlement, la mutuelle prend fin…",
    optionA: "au départ à la retraite du salarié.",
    optionB: "à la date de rupture du contrat de travail.",
    optionC: "au bout de deux ans d'ancienneté dans l'entreprise.",
    optionD: "dès que le salarié atteint le plafond annuel de remboursement.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Charte RGPD interne — Protection des données personnelles",
    longText: DOC_CHARTE_RGPD,
    question: "Ce document informe les salariés principalement sur…",
    optionA: "les sanctions encourues en cas de vol de données.",
    optionB: "la façon dont leurs données personnelles sont traitées par l'entreprise.",
    optionC: "les obligations fiscales liées à la collecte de données.",
    optionD: "les technologies utilisées pour sécuriser les données en ligne.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Charte RGPD interne — Protection des données personnelles",
    longText: DOC_CHARTE_RGPD,
    question: "Selon cette charte, combien de temps les données personnelles des salariés sont-elles conservées ?",
    optionA: "1 an après la fin du contrat.",
    optionB: "3 ans après la fin du contrat.",
    optionC: "5 ans après la fin du contrat.",
    optionD: "10 ans après la fin du contrat.",
    correctAnswer: 'C',
  }));

  // Q33-40
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Les neurosciences au service de l'apprentissage : nouvelles pratiques pédagogiques",
    longText: ART_NEUROSCIENCES,
    question: "Selon cet article, quel principe les neurosciences ont-elles identifié pour améliorer la mémorisation ?",
    optionA: "Il faut relire plusieurs fois les leçons pour mieux les retenir.",
    optionB: "Le « testing effect » : se tester soi-même est plus efficace que relire.",
    optionC: "Les cours magistraux favorisent davantage la rétention que les jeux.",
    optionD: "L'apprentissage est plus efficace l'après-midi qu'en matinée.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Les neurosciences au service de l'apprentissage : nouvelles pratiques pédagogiques",
    longText: ART_NEUROSCIENCES,
    question: "D'après l'article, pourquoi les pédagogies actives sont-elles préférables au cours magistral ?",
    optionA: "Elles permettent aux élèves de rester assis plus longtemps.",
    optionB: "Elles réduisent les coûts de formation des enseignants.",
    optionC: "Elles favorisent davantage l'engagement cognitif des élèves.",
    optionD: "Elles éliminent le besoin d'évaluation formelle.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "La transition énergétique : enjeux économiques et résistances politiques",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "Selon l'Agence Internationale de l'Énergie citée dans l'article, quel montant annuel est nécessaire pour décarboner l'économie mondiale d'ici 2030 ?",
    optionA: "400 millions de dollars",
    optionB: "400 milliards de dollars",
    optionC: "4 000 milliards de dollars",
    optionD: "40 000 milliards de dollars",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "La transition énergétique : enjeux économiques et résistances politiques",
    longText: ART_TRANSITION_ENERGETIQUE,
    question: "L'auteur cite la crise des Gilets Jaunes en France comme exemple de…",
    optionA: "la résistance populaire au changement climatique.",
    optionB: "l'échec des politiques de transport en commun.",
    optionC: "du risque politique d'une forte taxation du carbone.",
    optionD: "de la réussite d'une politique de réduction des émissions.",
    correctAnswer: 'C',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Les inégalités numériques : quand le fossé technologique creuse les fractures sociales",
    longText: ART_FRACTURE_NUMERIQUE,
    question: "Selon une étude citée dans l'article, combien de millions de Français sont en situation d'illectronisme ?",
    optionA: "3 millions",
    optionB: "8 millions",
    optionC: "13 millions",
    optionD: "20 millions",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Les inégalités numériques : quand le fossé technologique creuse les fractures sociales",
    longText: ART_FRACTURE_NUMERIQUE,
    question: "L'auteur souligne que la fracture numérique touche de manière disproportionnée…",
    optionA: "les jeunes diplômés dans les grandes métropoles.",
    optionB: "les populations âgées, peu qualifiées, rurales ou à faibles revenus.",
    optionC: "les travailleurs des secteurs industriels uniquement.",
    optionD: "les enfants en milieu scolaire défavorisé.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La sauvegarde du patrimoine culturel immatériel : langues menacées et savoirs ancestraux",
    longText: ART_PATRIMOINE,
    question: "Selon l'UNESCO, à quelle fréquence une langue disparaît-elle dans le monde ?",
    optionA: "Une par jour",
    optionB: "Une par semaine",
    optionC: "Une par mois",
    optionD: "Une par an",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La sauvegarde du patrimoine culturel immatériel : langues menacées et savoirs ancestraux",
    longText: ART_PATRIMOINE,
    question: "Quel exemple de revitalisation linguistique réussie est cité dans l'article ?",
    optionA: "La politique québécoise de protection du français.",
    optionB: "La promotion du latin dans les écoles européennes.",
    optionC: "L'enseignement obligatoire du gallois au Pays de Galles.",
    optionD: "Les cours d'occitan dans les écoles du sud de la France.",
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
    console.log(`\n✅ ${created} questions créées pour CE 7.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
