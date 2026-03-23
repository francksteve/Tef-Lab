'use strict';
/**
 * seed-ce-serie47.js
 * Peuple la série CE 47 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie47.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyomei00170wxls0uxhk11';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART, données trimestrielles arrêts maladie ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [20, 18, 22, 19], color: '#E30613' },
    { label: 'Graphique 2', data: [15, 20, 25, 22], color: '#E30613' },
    { label: 'Graphique 3', data: [30, 28, 35, 32], color: '#E30613' },
    { label: 'Graphique 4', data: [18, 22, 28, 34], color: '#003087' }, // CORRECT
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['T1', 'T2', 'T3', 'T4'];
  const maxVal = 40;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const step = plotW / (g.data.length - 1);
    const gridLines = [0, 10, 20, 30, 40].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');
    const points = g.data.map((v, i) => {
      const px = (plotX + i * step).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return { px, py, v, label: labels[i] };
    });
    const polyline = points.map(p => `${p.px},${p.py}`).join(' ');
    const dots = points.map(p =>
      `<circle cx="${p.px}" cy="${p.py}" r="4" fill="${g.color}"/>` +
      `<text x="${p.px}" y="${(parseFloat(p.py) - 8).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${p.v}</text>` +
      `<text x="${p.px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${p.label}</text>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines +
           `<polyline points="${polyline}" fill="none" stroke="${g.color}" stroke-width="2"/>` +
           dots +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Arrêts maladie (indice)</text>`;
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
  { title: 'Maladie 1', content: "Asthme professionnel : maladie respiratoire chronique déclenchée par l'exposition répétée à des allergènes ou substances irritantes sur le lieu de travail (poussières de bois, produits chimiques, farines). Reconnue tableau 66 des maladies professionnelles. Indemnisation possible si exposition documentée." },
  { title: 'Maladie 2', content: "Silicose : maladie professionnelle des mineurs et carriers causée par l'inhalation prolongée de poussières de silice cristalline. Entraîne une fibrose pulmonaire progressive et irréversible. Tableau 25 des maladies professionnelles. Aucun traitement curatif — prévention par port de masques et aspiration à la source." },
  { title: 'Maladie 3', content: "Troubles musculo-squelettiques (TMS) : ensemble d'affections touchant muscles, tendons et nerfs, causées par des gestes répétitifs, des postures contraignantes ou des efforts excessifs. Première cause de maladie professionnelle reconnue en France. Tableaux 57 et 98. Prévention ergonomique obligatoire." },
  { title: 'Maladie 4', content: "Dermatite de contact allergique : réaction cutanée due à l'exposition professionnelle à des substances sensibilisantes (ciment, latex, colorants, métaux). Apparaît après une phase de sensibilisation souvent asymptomatique. Tableau 65. Peut nécessiter un reclassement professionnel définitif." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Cuisine 1', content: "Cuisine guadeloupéenne : cuisine caribéenne créole mêlant influences africaines, indiennes et européennes. Spécialités : colombo de poulet, accras de morue, boudin créole, chatrou (poulpe). Utilisation massive du piment, du citron vert et des herbes tropicales comme la ciboule et le persil plat." },
  { title: 'Cuisine 2', content: "Cuisine martiniquaise : cuisine caribéenne française intégrant l'igname, le colombo (curry créole), le blaff (poisson au court-bouillon épicé) et les féroces d'avocat à la morue. Influences africaines, indiennes (colombo) et européennes marquées. Rhum agricole omniprésent en cuisine comme à table." },
  { title: 'Cuisine 3', content: "Cuisine haïtienne : cuisine créole combinant influences africaines, françaises et espagnoles. Plat national : riz et pois (haricots rouges). Spécialités : griot (porc frit mariné), tassot (viande séchée), legume (ragoût de légumes). Piment scotch bonnet très utilisé. Cuisine familiale généreuse." },
  { title: 'Cuisine 4', content: "Cuisine réunionnaise : cuisine métissée réunissant influences malgache, indienne, africaine, créole et européenne. Plat emblématique : le rougail saucisses (saucisses braisées en sauce tomate épicée). Carri (curry local), rougails de fruits et achards de légumes constituent la base culinaire quotidienne." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Procédure 1', content: "Liquidation judiciaire : procédure collective prononcée lorsqu'une entreprise est en état de cessation des paiements et que son redressement est manifestement impossible. Entraîne la vente des actifs et la fin de l'activité. Les salariés bénéficient de la garantie AGS pour leurs créances salariales impayées." },
  { title: 'Procédure 2', content: "Redressement judiciaire : procédure permettant à une entreprise en difficulté de restructurer ses dettes tout en maintenant l'activité, en préservant l'emploi et en apurant le passif. Un administrateur judiciaire est désigné par le tribunal pour assister ou remplacer le dirigeant pendant la période d'observation." },
  { title: 'Procédure 3', content: "Sauvegarde : procédure préventive ouverte à la demande du dirigeant avant la cessation des paiements, lorsque des difficultés prévisibles menacent la pérennité de l'entreprise. Permet de négocier un plan avec les créanciers sous protection judiciaire sans dessaisissement de la direction." },
  { title: 'Procédure 4', content: "Mandat ad hoc : procédure amiable et confidentielle de prévention des difficultés, dans laquelle un mandataire désigné par le tribunal aide le dirigeant à négocier avec ses principaux créanciers. Aucune publicité, aucun dessaisissement. Solution choisie quand l'entreprise n'est pas encore en cessation des paiements." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Sport 1', content: "Luge : sport de glisse sur traîneau à faible hauteur de sol sur piste de glace artificielle. Le lugeur est allongé sur le dos, pieds en avant, dirigeant le traîneau par pression des épaules et des jambes. Épreuve olympique depuis 1964. Vitesses pouvant atteindre 140 km/h sur les pistes homologuées." },
  { title: 'Sport 2', content: "Bobsleigh : sport collectif de glisse sur bob à ossature rigide pour 2 ou 4 personnes sur piste de glace. Le pilote guide l'engin à grande vitesse dans des virages en forme de U, assisté d'un freineur. Épreuve olympique depuis 1924. Vitesses de pointe jusqu'à 150 km/h sur les meilleures pistes mondiales." },
  { title: 'Sport 3', content: "Skeleton : sport de glisse sur luge frontale à tête première sur piste de bob à grande vitesse. Le compétiteur s'élance en courant, se jette à plat ventre sur la luge tête en avant et dirige avec ses épaules. Épreuve olympique aux JO d'hiver depuis 2002. Vitesses atteignant 130 km/h." },
  { title: 'Sport 4', content: "Patinage de vitesse sur courte piste (short track) : discipline olympique sur patinoire standard de 111 mètres. Les patineurs s'affrontent en groupe sur des circuits ovales délimités par des cônes. Épreuve individuelle et relais. Vitesses de 50 km/h en ligne droite. Aux JO depuis 1992 pour femmes et hommes." },
]);

/* ── Documents Q23-32 ── */
const DOC_MEDECINE_TRAVAIL =
`PROTOCOLE DE MÉDECINE DU TRAVAIL — VISITE D'APTITUDE PÉRIODIQUE

Le présent protocole définit les modalités des visites médicales périodiques organisées par le Service de Santé au Travail (SST) à destination des salariés de l'entreprise.

Fréquence des visites :
- Travailleurs sans risque particulier : tous les 5 ans
- Travailleurs exposés à des risques spécifiques (bruit, produits chimiques, travail en hauteur) : tous les 2 ans ou annuellement selon l'évaluation des risques
- Salariés reconnus travailleur handicapé (RQTH) : visites adaptées à leur situation

Déroulement : le médecin du travail évalue l'aptitude du salarié à occuper son poste, propose des aménagements si nécessaire et oriente vers un spécialiste en cas de pathologie détectée. L'avis d'aptitude, d'inaptitude ou d'aptitude avec restrictions est consigné dans le dossier médical confidentiel.

L'employeur ne peut accéder au contenu médical du dossier du salarié.`;

const DOC_ARCHIVISTE =
`OFFRE D'EMPLOI — ARCHIVISTE NUMÉRIQUE SENIOR
Ministère de la Culture — Direction des Archives Nationales

Nous recrutons un(e) archiviste numérique pour prendre en charge la numérisation et la valorisation des fonds documentaires historiques.

Missions principales :
- Pilotage des projets de numérisation de masse (manuscrits, registres paroissiaux, plans cadastraux)
- Gestion des métadonnées selon les standards internationaux (EAD, Dublin Core, IIIF)
- Mise en ligne sur la plateforme nationale d'accès aux archives
- Formation des équipes aux outils de gestion électronique des documents (GED)
- Veille technologique sur la pérennisation des formats numériques

Profil requis : diplôme en archivistique (master) ou en sciences de l'information, expérience en GED, maîtrise de XML et des formats d'archivage pérenne (PDF/A, TIFF).

Poste : fonctionnaire catégorie A ou contractuel. Télétravail partiel possible.`;

const DOC_COMPAGNIE_OPERETTE =
`CONTRAT DE COPRODUCTION — Compagnie Lyrique des Deux Rives / Théâtre Municipal de Beaumont

Article 1 — Objet
La Compagnie Lyrique des Deux Rives (ci-après « la Compagnie ») et le Théâtre Municipal de Beaumont (ci-après « le Théâtre ») s'engagent à coproduire la reprise de l'opérette « La Veuve Joyeuse » de Franz Lehár pour la saison 2025-2026.

Article 2 — Répartition des charges
Le Théâtre prend en charge les coûts de location de salle et de billetterie. La Compagnie assume les frais artistiques (cachets, costumes, décors, répétitions). Les recettes de billetterie sont partagées à 60 % pour la Compagnie et 40 % pour le Théâtre.

Article 3 — Calendrier
Les représentations se dérouleront du 15 janvier au 2 février 2026, à raison de quatre représentations par semaine (mercredis, vendredis, samedis, dimanches).

Article 4 — Droits et obligations
Chaque partie s'engage à respecter les engagements pris envers les artistes et techniciens. Toute modification du programme nécessite l'accord écrit des deux parties.`;

const DOC_REDRESSEMENT =
`INFORMATION DU COMITÉ SOCIAL ET ÉCONOMIQUE — Procédure de redressement judiciaire

Madame, Monsieur,

Conformément aux dispositions légales, nous vous informons que le Tribunal de Commerce a ouvert ce jour une procédure de redressement judiciaire à l'égard de notre société.

Cette procédure est ouverte pour une période d'observation initiale de six mois, renouvelable. Elle a pour objectif de permettre à l'entreprise de trouver une solution viable : plan de continuation, plan de cession partielle ou totale d'activités.

Vos droits en tant que salariés :
- Vos contrats de travail sont maintenus pendant toute la durée de la procédure.
- Les salaires et indemnités dus jusqu'à l'ouverture de la procédure sont garantis par l'AGS (Association pour la Gestion du régime de garantie des créances des Salariés).
- Vous pouvez vous faire assister par un délégué syndical ou un représentant du personnel lors des consultations du CSE.

Un administrateur judiciaire a été désigné pour superviser la gestion de la société.`;

const DOC_CUISINE_CREOLE =
`GUIDE DU RESTAURANT CRÉOLE CERTIFIÉ — Charte qualité et authenticité

La certification « Restaurant Créole Authentique » est délivrée par l'Association des Cuisiniers des Antilles françaises aux établissements répondant aux critères suivants :

1. Authenticité des recettes : les plats emblématiques (accras, boudin créole, colombo, court-bouillon) doivent être préparés selon les recettes traditionnelles documentées. L'utilisation d'épices industrielles prémélangées est limitée à 20 %.

2. Provenance des produits : minimum 40 % de produits issus de la production locale antillaise ou de filières labellisées françaises. La morue utilisée pour les accras doit être dessalée sur place.

3. Personnel : au moins un cuisinier par établissement doit être titulaire d'un CAP ou BEP cuisine et d'une formation spécifique à la cuisine antillaise.

4. Carte : obligatoirement rédigée en français avec mention de l'origine géographique des spécialités proposées.`;

/* ── Articles de presse Q33-40 ── */
const ART_BURNOUT =
`BURN-OUT ET RÉFORME DU DROIT DU TRAVAIL : VERS UNE RECONNAISSANCE PLEINE ET ENTIÈRE

Le syndrome d'épuisement professionnel, communément appelé burn-out, touche chaque année des centaines de milliers de travailleurs en France. Pourtant, malgré une prise de conscience croissante et des travaux parlementaires répétés, ce syndrome n'est toujours pas reconnu comme maladie professionnelle à part entière dans le droit français. Les victimes doivent emprunter la difficile voie de la reconnaissance individuelle, prouvant le lien direct entre leurs conditions de travail et leur état de santé — un parcours épuisant pour des personnes déjà fragilisées.

Les experts en santé au travail s'accordent sur les facteurs favorisant le burn-out : surcharge de travail chronique, perte de sens, manque d'autonomie, conflits de valeurs, isolement. Ces facteurs sont souvent organisationnels et non individuels, ce qui devrait justifier une approche collective de prévention plutôt qu'une gestion cas par cas.

Des pays comme la Suède, la Finlande ou les Pays-Bas ont intégré le stress professionnel chronique dans leur système de protection sociale, avec des résultats positifs sur la réduction de l'absentéisme et l'amélioration du bien-être au travail. L'approche scandinave mise sur la prévention primaire — agir sur l'organisation du travail — plutôt que sur la réparation après le dommage.

En France, les discussions autour d'une réforme du Code du travail incluant la reconnaissance du burn-out comme maladie professionnelle butent sur des résistances patronales et des questions complexes de définition médicale et juridique. La loi évolue lentement, pendant que les tribunaux des affaires sociales sont submergés de recours individuels.`;

const ART_PATRIMOINE_MUSICAL =
`LE PATRIMOINE MUSICAL DES ANTILLES : ENTRE MÉMOIRE ET RENAISSANCE

La musique des Antilles françaises constitue l'un des patrimoines culturels immatériels les plus riches et les plus singuliers de l'espace francophone. Du biguine à la valse créole, du gwoka guadeloupéen au bèlè martiniquais, ces musiques portent en elles des siècles d'histoire — esclavage, syncrétisme culturel, résistance et créolisation. Le gwoka de Guadeloupe a été inscrit au patrimoine culturel immatériel de l'UNESCO en 2014, reconnaissance symbolique forte de cette tradition vivante.

Pourtant, ces musiques traditionnelles font face à des défis considérables. La mondialisation culturelle et la domination des industries musicales anglo-saxonnes exercent une pression croissante sur les pratiques locales. Les jeunes générations, attirées par le hip-hop, l'électro et la pop internationale, s'éloignent parfois des formes musicales héritées de leurs ancêtres.

Des initiatives de transmission se multiplient néanmoins. Des conservatoires proposent désormais des cursus en musiques traditionnelles antillaises. Des festivals comme le Festival Gwoka en Guadeloupe ou le Festival de Bèlè en Martinique attirent des dizaines de milliers de visiteurs et créent des espaces de rencontre intergénérationnels.

Le défi est de permettre à ces musiques d'évoluer, de se hybridiser avec des influences contemporaines, sans perdre leur essence identitaire. L'exemple du zouk, né dans les années 80 de la rencontre entre la biguine martiniquaise et les musiques africaines, montre que la créolisation musicale peut être un formidable moteur d'innovation et de rayonnement international.`;

const ART_DROIT_COMMERCIAL =
`DROIT COMMERCIAL ET ÉCOSYSTÈME DES START-UPS : ADAPTER LE CADRE LÉGAL À L'INNOVATION

L'explosion de l'économie numérique et la multiplication des start-ups ont mis en lumière les inadéquations d'un droit commercial conçu pour des structures économiques traditionnelles. Les jeunes entreprises technologiques évoluent à une vitesse que le droit peine parfois à suivre, créant des zones grises juridiques préjudiciables tant aux entrepreneurs qu'aux investisseurs.

L'une des difficultés majeures concerne le financement. Les outils classiques — actions, obligations, prêts bancaires — s'adaptent mal aux spécificités des start-ups, dont la valorisation repose souvent sur des actifs immatériels (brevets, algorithmes, données) et des projections de croissance incertaines. Le développement des obligations convertibles, des bons de souscription d'actions (BSA) et plus récemment des tokens numériques illustre cette recherche permanente d'instruments juridiques flexibles.

La France a fait des efforts notables pour moderniser son cadre réglementaire : création du statut de Jeune Entreprise Innovante (JEI), simplification des procédures de création d'entreprise, développement du statut d'auto-entrepreneur. Le dispositif French Tech s'est révélé attractif pour les startups étrangères cherchant un environnement européen favorable.

Mais des défis demeurent : la protection de la propriété intellectuelle dans un environnement numérique mondial, la réglementation des données personnelles (RGPD), la fiscalité des plateformes numériques. L'enjeu est de créer un cadre juridique suffisamment souple pour encourager l'innovation tout en garantissant une concurrence loyale et une protection efficace des utilisateurs.`;

const ART_ARCHIVES =
`ARCHIVES NUMÉRIQUES ET MÉMOIRE COLLECTIVE : LES ENJEUX D'UNE TRANSITION SILENCIEUSE

La transition vers l'archivage numérique des documents publics et privés représente un défi civilisationnel souvent sous-estimé. Si la numérisation de millions de documents — registres paroissiaux, actes notariés, cartes postales, archives militaires — rend la mémoire collective accessible à tous depuis n'importe quel point du globe, elle soulève simultanément des questions fondamentales sur la pérennité des supports et des formats numériques.

Les archives papier bien conservées peuvent durer des siècles, voire des millénaires — les papyrus égyptiens en témoignent. Un fichier numérique, en revanche, peut devenir illisible en quelques années si son format n'est plus supporté par les logiciels disponibles ou si le support de stockage se dégrade. Les archivistes parlent d' « obsolescence numérique » pour désigner ce risque majeur.

Les institutions qui ont le mieux réussi leur transition numérique sont celles qui ont investi simultanément dans trois domaines : la standardisation des formats (PDF/A, TIFF, XML-EAD), la redondance des sauvegardes géographiquement dispersées, et la formation continue des professionnels. La Bibliothèque nationale de France avec Gallica ou les Archives nationales avec leur portail en ligne ont réussi à rendre des millions de documents accessibles tout en garantissant leur intégrité à long terme.

La question de l'accès reste cependant centrale. Numériser sans indexer ne suffit pas. Les métadonnées — ces informations qui décrivent et organisent les documents — sont la clé de l'accessibilité. Un document non indexé est un document perdu dans un océan numérique, techniquement accessible mais pratiquement introuvable.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche spectacle opérette
  qs.push(q(1, 'Q1-7', null, {
    longText:
`THÉÂTRE LYRIQUE DE LA VILLE — Saison 2025-2026

GRANDE OPÉRETTE
« LA VEUVE JOYEUSE »
Musique de Franz Lehár
Livret de Viktor Léon et Leo Stein

Distribution :
Hanna Glawari — Marie-Sophie Renard (soprano)
Le Comte Danilo — Étienne Moreau (baryton)
Direction musicale : Chef d'orchestre Yann Leblanc
Orchestre Philharmonique de la Ville (42 musiciens)
Chœur de chambre (20 choristes)

Représentations : du 10 au 30 janvier 2026
Mardi, jeudi, vendredi à 20 h | Dimanche à 15 h
Tarifs : 35 € à 75 € selon catégorie | Abonnés : -20 %
Réservations : billetterie@theatre-lyrique.fr`,
    question: "Ce document est…",
    optionA: "une critique musicale de l'opérette.",
    optionB: "le programme d'un spectacle lyrique avec distribution et tarifs.",
    optionC: "une publicité pour une émission télévisée musicale.",
    optionD: "un contrat d'engagement pour des musiciens.",
    correctAnswer: 'B',
  }));

  // Q2 — Programme compétition bobsleigh
  qs.push(q(2, 'Q1-7', null, {
    longText:
`COUPE D'EUROPE DE BOBSLEIGH — Station de la Plagne

Programme des épreuves — week-end du 18-19 janvier 2026

SAMEDI 18 JANVIER :
9 h 00 — Entraînements officiels (bob à 2, toutes catégories)
13 h 00 — Qualification bob à 2 dames
15 h 30 — Qualification bob à 2 messieurs

DIMANCHE 19 JANVIER :
9 h 00 — Finale bob à 2 dames (2 manches)
11 h 30 — Finale bob à 2 messieurs (2 manches)
14 h 00 — Finale bob à 4 (2 manches — hommes uniquement)
16 h 30 — Remise des médailles et cérémonie

Piste : La Plagne — 1 507 m, dénivelé 114 m, 19 virages
Accès spectateurs : tribunes gratuites au départ et à l'arrivée`,
    question: "D'après ce document, quelle épreuve a lieu le dimanche matin ?",
    optionA: "Les entraînements officiels pour toutes les catégories.",
    optionB: "Les qualifications du bob à 2 messieurs.",
    optionC: "Les finales du bob à 2 dames et messieurs.",
    optionD: "La remise des médailles et la cérémonie officielle.",
    correctAnswer: 'C',
  }));

  // Q3 — Règlement archives nationales
  qs.push(q(3, 'Q1-7', null, {
    longText:
`ARCHIVES NATIONALES — RÈGLEMENT D'ACCÈS ET DE CONSULTATION

Conditions d'accès :
Tout chercheur majeur peut accéder aux salles de lecture sur présentation d'une pièce d'identité en cours de validité et d'une justification de sa recherche (formulaire en ligne à remplir avant la première visite).

Documents communicables :
- Documents de moins de 25 ans : soumis à autorisation préalable du service producteur
- Documents de 25 à 50 ans : librement communicables sauf exceptions légales
- Documents de plus de 50 ans : librement communicables sans restriction

Règles de consultation :
• Reproduction par photographie personnelle autorisée sans flash
• Toute reproduction commerciale nécessite une demande écrite
• Les documents en mauvais état sont consultables uniquement en reproduction numérique
• Stylos interdits — crayons de papier exclusivement en salle de lecture

Horaires : lundi-vendredi 9 h-17 h | Fermé jours fériés`,
    question: "D'après ce document, quels documents sont librement consultables sans aucune restriction ?",
    optionA: "Tous les documents déposés aux Archives Nationales.",
    optionB: "Les documents de moins de 25 ans sur demande.",
    optionC: "Les documents de 25 à 50 ans sans exceptions.",
    optionD: "Les documents de plus de 50 ans.",
    correctAnswer: 'D',
  }));

  // Q4 — Petite annonce cours cuisine créole
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE CUISINE CRÉOLE ANTILLAISE
avec Chef Marie-Ange Beaumont — originaire de Martinique

Découvrez les saveurs authentiques des Antilles françaises !

Au programme de vos ateliers (3 h chacun) :
• Accras de morue et boudins créoles
• Colombo de poulet ou de cabri
• Court-bouillon de poisson antillais
• Féroce d'avocat à la morue
• Desserts : tourment d'amour, gâteau patate douce

Groupes de 6 à 10 personnes maximum
Tous les samedis de 10 h à 13 h
Tarif : 45 €/personne par atelier (repas inclus)

Réservation obligatoire : chefmarieange@cuisine-creole.fr
ou au 06 45 78 12 36`,
    question: "Ce document est…",
    optionA: "un menu de restaurant antillais.",
    optionB: "une petite annonce proposant des cours de cuisine créole.",
    optionC: "un article sur la gastronomie martiniquaise.",
    optionD: "un guide touristique des Antilles.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi logiciel gestion archives
  qs.push(q(5, 'Q1-7', null, {
    longText:
`ARCHIVPRO 5.0 — GUIDE DE PRISE EN MAIN RAPIDE

PREMIÈRE CONNEXION :
1. Saisissez votre identifiant et votre mot de passe provisoire fournis par l'administrateur.
2. Créez immédiatement un mot de passe personnel (min. 12 caractères, dont 1 majuscule et 1 chiffre).
3. Activez l'authentification à deux facteurs dans les Paramètres > Sécurité.

CRÉATION D'UN FONDS DOCUMENTAIRE :
1. Cliquer sur « Nouveau fonds » dans le menu principal.
2. Renseigner les métadonnées obligatoires (producteur, dates extrêmes, niveau de description).
3. Importer les documents via glisser-déposer ou import batch CSV.
4. Valider et publier le fonds pour le rendre visible aux utilisateurs autorisés.

EXPORT : possible en formats XML-EAD, Dublin Core ou PDF/A selon les besoins.

⚠ Sauvegarde automatique toutes les 10 minutes. Ne pas fermer le navigateur pendant un import.`,
    question: "D'après ce document, que doit faire l'utilisateur lors de sa première connexion ?",
    optionA: "Importer immédiatement ses premiers documents d'archives.",
    optionB: "Contacter l'administrateur pour créer un fonds documentaire.",
    optionC: "Créer un mot de passe personnel et activer l'authentification à deux facteurs.",
    optionD: "Exporter ses documents en format XML-EAD avant toute utilisation.",
    correctAnswer: 'C',
  }));

  // Q6 — Communiqué médecine du travail
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — Service de Santé au Travail Interprofessionnel (SSTI)

Objet : Campagne de sensibilisation aux risques professionnels liés à la sédentarité

Le SSTI lance une campagne nationale de sensibilisation auprès des entreprises sur les risques de santé liés à la sédentarité prolongée au travail.

Les données épidémiologiques récentes montrent que les travailleurs passant plus de 8 heures par jour en position assise présentent des risques accrus de pathologies cardiovasculaires, de troubles musculo-squelettiques et de diabète de type 2.

Le SSTI recommande aux employeurs de :
• Mettre à disposition des postes de travail réglables (assis-debout)
• Encourager les pauses actives de 5 minutes toutes les heures
• Intégrer des exercices de mobilité dans les formations sécurité

Des fiches pratiques et un guide d'auto-évaluation sont disponibles sur ssti-prevention.fr`,
    question: "Ce communiqué a pour objectif principal de…",
    optionA: "annoncer une nouvelle réglementation obligatoire sur les postures au travail.",
    optionB: "sensibiliser les entreprises aux risques de santé liés à la sédentarité.",
    optionC: "informer les salariés de leurs droits en matière de visites médicales.",
    optionD: "promouvoir un équipement ergonomique vendu par le SSTI.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation formation intelligence émotionnelle
  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — FORMATION PROFESSIONNELLE

« Intelligence émotionnelle et leadership bienveillant »
Module de 2 jours — Présentiel

Dates : jeudi 6 et vendredi 7 mars 2026
Lieu : Centre de Formation Euler — Salle Aristote — 3e étage
Horaires : 9 h à 17 h 30 (pauses café et déjeuner inclus)

Objectifs :
• Comprendre les composantes de l'intelligence émotionnelle (IE)
• Développer l'empathie et la régulation émotionnelle en situation professionnelle
• Adopter un style de leadership qui valorise l'humain tout en maintenant la performance

Public cible : managers, chefs d'équipe, responsables RH
Formateur : Dr Philippe Ancel, psychologue du travail (10 ans d'expérience)

Inscription obligatoire avant le 20 février auprès de votre service RH.
Prise en charge possible par votre OPCO.`,
    question: "Quel est le but de ce document ?",
    optionA: "Promouvoir un livre sur le leadership écrit par le Dr Ancel.",
    optionB: "Inviter des professionnels à une formation sur l'intelligence émotionnelle.",
    optionC: "Annoncer la création d'un nouveau service RH dans l'entreprise.",
    optionD: "Informer les salariés d'un changement dans leur planning de travail.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin du travail a conclu à l'___ du salarié à son poste habituel et a recommandé un reclassement dans un emploi adapté à son état de santé.",
    question: PHRASE_Q,
    optionA: "aptitude",
    optionB: "inaptitude",
    optionC: "disponibilité",
    optionD: "compétence",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans cet opéra, le rôle du ténor est le plus exigeant vocalement, tandis que celui du ___ est confié à un chanteur à la voix grave et puissante.",
    question: PHRASE_Q,
    optionA: "soprano",
    optionB: "mezzo",
    optionC: "bariton",
    optionD: "contre-ténor",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Lorsqu'une entreprise ne peut plus faire face à ses dettes, le tribunal de commerce peut prononcer sa mise en ___ judiciaire afin de vendre les actifs et rembourser les créanciers.",
    question: PHRASE_Q,
    optionA: "suspension",
    optionB: "sauvegarde",
    optionC: "redressement",
    optionD: "liquidation",
    correctAnswer: 'D',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les ___ de morue frits sont l'une des spécialités les plus populaires de la cuisine antillaise, servis en apéritif ou en entrée.",
    question: PHRASE_Q,
    optionA: "bouillons",
    optionB: "accras",
    optionC: "colombos",
    optionD: "rougails",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "En bobsleigh, les virages sont conçus en forme de U pour permettre aux pilotes de maintenir leur vitesse grâce à la force centrifuge, qui peut atteindre plusieurs ___ lors des passages les plus serrés.",
    question: PHRASE_Q,
    optionA: "kilomètres",
    optionB: "G-force",
    optionC: "décibels",
    optionD: "rotations",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La salle de lecture des Archives Nationales conserve l'___ des fonds qui permet aux chercheurs de repérer les documents disponibles par ordre chronologique et thématique.",
    question: PHRASE_Q,
    optionA: "catalogue",
    optionB: "inventaire",
    optionC: "répertoire",
    optionD: "fichier",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La transition vers l'archivage numérique représente un défi majeur pour les institutions patrimoniales. La [14] des documents papier en formats numériques standardisés permet un accès élargi, mais soulève des questions de [15] des données sur le long terme, certains formats devenant illisibles en quelques décennies.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La gestion des archives numériques',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "destruction",
    optionB: "classification",
    optionC: "numérisation",
    optionD: "restauration",
    correctAnswer: 'C',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La gestion des archives numériques',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "pérennité",
    optionB: "confidentialité",
    optionC: "rapidité",
    optionD: "originalité",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "L'intelligence émotionnelle est aujourd'hui reconnue comme une compétence essentielle du leadership efficace. Elle repose notamment sur l'[16], la capacité à comprendre et partager les émotions d'autrui, et sur la [17] émotionnelle, qui permet de gérer ses propres réactions dans des situations de stress ou de conflit.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Intelligence émotionnelle en management',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "autorité",
    optionB: "empathie",
    optionC: "intuition",
    optionD: "persévérance",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Intelligence émotionnelle en management',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "stimulation",
    optionB: "projection",
    optionC: "régulation",
    optionD: "inhibition",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle maladie est causée par l'inhalation de poussières de silice et entraîne une fibrose pulmonaire irréversible ?",
    optionA: "Maladie 1",
    optionB: "Maladie 2",
    optionC: "Maladie 3",
    optionD: "Maladie 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle cuisine intègre l'igname, le colombo et le blaff comme éléments caractéristiques ?",
    optionA: "Cuisine 1",
    optionB: "Cuisine 2",
    optionC: "Cuisine 3",
    optionD: "Cuisine 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle procédure permet à une entreprise en difficulté de restructurer ses dettes tout en maintenant l'activité ?",
    optionA: "Procédure 1",
    optionB: "Procédure 2",
    optionC: "Procédure 3",
    optionD: "Procédure 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel sport consiste à dévaler une piste de bob sur une luge frontale, tête la première, en position allongée sur le ventre ?",
    optionA: "Sport 1",
    optionB: "Sport 2",
    optionC: "Sport 3",
    optionD: "Sport 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le secteur de la logistique a enregistré la plus forte augmentation des arrêts maladie liés aux troubles musculo-squelettiques avec +34 % au 4e trimestre. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Protocole de médecine du travail — Visite d'aptitude périodique",
    longText: DOC_MEDECINE_TRAVAIL,
    question: "Ce document présente principalement…",
    optionA: "les conditions de licenciement pour inaptitude médicale.",
    optionB: "les modalités des visites médicales périodiques au travail.",
    optionC: "les tarifs des consultations médicales en entreprise.",
    optionD: "les droits des salariés à accéder à leur dossier médical.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Protocole de médecine du travail — Visite d'aptitude périodique",
    longText: DOC_MEDECINE_TRAVAIL,
    question: "Selon ce document, à quelle fréquence les travailleurs exposés à des risques spécifiques doivent-ils passer une visite médicale ?",
    optionA: "Tous les 5 ans comme les travailleurs sans risque particulier.",
    optionB: "Tous les 2 ans ou annuellement selon l'évaluation des risques.",
    optionC: "Tous les mois pendant la première année de travail.",
    optionD: "À leur demande, sans fréquence imposée par le protocole.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Archiviste numérique senior",
    longText: DOC_ARCHIVISTE,
    question: "Cette offre d'emploi est publiée par…",
    optionA: "une entreprise privée de numérisation de documents.",
    optionB: "un cabinet de conseil en gestion de l'information.",
    optionC: "le Ministère de la Culture — Direction des Archives Nationales.",
    optionD: "une bibliothèque universitaire spécialisée.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Archiviste numérique senior",
    longText: DOC_ARCHIVISTE,
    question: "Quelle compétence technique est explicitement mentionnée dans le profil requis ?",
    optionA: "La maîtrise du logiciel Photoshop pour la retouche d'images.",
    optionB: "La connaissance du droit administratif et des marchés publics.",
    optionC: "La maîtrise de XML et des formats d'archivage pérenne (PDF/A, TIFF).",
    optionD: "La certification en sécurité informatique (CISSP ou équivalent).",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de coproduction — Compagnie Lyrique / Théâtre Municipal",
    longText: DOC_COMPAGNIE_OPERETTE,
    question: "Ce contrat porte sur…",
    optionA: "l'achat d'équipements scéniques pour le Théâtre Municipal.",
    optionB: "la coproduction d'une opérette pour la saison 2025-2026.",
    optionC: "le recrutement de chanteurs pour la Compagnie Lyrique.",
    optionD: "la location permanente de la salle de spectacle à la Compagnie.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de coproduction — Compagnie Lyrique / Théâtre Municipal",
    longText: DOC_COMPAGNIE_OPERETTE,
    question: "Comment les recettes de billetterie sont-elles réparties entre les deux parties ?",
    optionA: "50 % pour chaque partie à parts égales.",
    optionB: "60 % pour le Théâtre et 40 % pour la Compagnie.",
    optionC: "60 % pour la Compagnie et 40 % pour le Théâtre.",
    optionD: "70 % pour la Compagnie et 30 % pour le Théâtre.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Information du Comité Social et Économique — Redressement judiciaire",
    longText: DOC_REDRESSEMENT,
    question: "Ce document informe les salariés…",
    optionA: "de la liquidation définitive et de la fermeture de l'entreprise.",
    optionB: "de l'ouverture d'une procédure de redressement judiciaire.",
    optionC: "d'une augmentation générale des salaires décidée par la direction.",
    optionD: "d'un plan de restructuration entraînant des licenciements immédiats.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Information du Comité Social et Économique — Redressement judiciaire",
    longText: DOC_REDRESSEMENT,
    question: "Selon ce document, que garantit l'AGS aux salariés ?",
    optionA: "Le maintien de leur emploi pendant toute la durée de la procédure.",
    optionB: "Le paiement des créances salariales impayées jusqu'à l'ouverture de la procédure.",
    optionC: "Une indemnité de licenciement majorée en cas de liquidation.",
    optionD: "Le droit de racheter l'entreprise à prix préférentiel.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide du restaurant créole certifié — Charte qualité",
    longText: DOC_CUISINE_CREOLE,
    question: "Ce document décrit principalement…",
    optionA: "les recettes traditionnelles des plats antillais emblématiques.",
    optionB: "les critères pour obtenir la certification de restaurant créole authentique.",
    optionC: "les prix pratiqués par les restaurants antillais certifiés.",
    optionD: "les formations disponibles pour les cuisiniers créoles.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide du restaurant créole certifié — Charte qualité",
    longText: DOC_CUISINE_CREOLE,
    question: "Quelle exigence particulière concerne la morue utilisée dans les accras ?",
    optionA: "Elle doit être importée exclusivement de Norvège.",
    optionB: "Elle doit être bio et certifiée pêche durable.",
    optionC: "Elle doit être dessalée sur place dans l'établissement.",
    optionD: "Elle doit être congelée à -18 °C pendant 72 heures avant utilisation.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Burn-out et réforme du droit du travail : vers une reconnaissance pleine et entière",
    longText: ART_BURNOUT,
    question: "Selon cet article, pourquoi le parcours de reconnaissance du burn-out est-il difficile pour les victimes ?",
    optionA: "Parce que les médecins du travail refusent de diagnostiquer le burn-out.",
    optionB: "Parce qu'elles doivent prouver individuellement le lien entre travail et état de santé.",
    optionC: "Parce que les caisses d'assurance maladie rejettent systématiquement les dossiers.",
    optionD: "Parce que le burn-out n'est pas encore connu du grand public.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Burn-out et réforme du droit du travail : vers une reconnaissance pleine et entière",
    longText: ART_BURNOUT,
    question: "Quelle approche des pays scandinaves l'auteur présente-t-il comme exemplaire ?",
    optionA: "La création de tribunaux spéciaux pour les affaires de burn-out.",
    optionB: "L'augmentation des indemnités versées aux victimes d'épuisement professionnel.",
    optionC: "La prévention primaire agissant sur l'organisation du travail plutôt que la réparation.",
    optionD: "La limitation légale du temps de travail à 35 heures pour tous les secteurs.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le patrimoine musical des Antilles : entre mémoire et renaissance",
    longText: ART_PATRIMOINE_MUSICAL,
    question: "Quelle musique traditionnelle antillaise a été inscrite au patrimoine culturel immatériel de l'UNESCO en 2014 ?",
    optionA: "Le bèlè martiniquais.",
    optionB: "La biguine des Antilles.",
    optionC: "Le zouk caribéen.",
    optionD: "Le gwoka de Guadeloupe.",
    correctAnswer: 'D',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le patrimoine musical des Antilles : entre mémoire et renaissance",
    longText: ART_PATRIMOINE_MUSICAL,
    question: "Quel exemple musical l'auteur cite-t-il pour montrer que la créolisation peut être un moteur d'innovation ?",
    optionA: "Le reggae jamaïcain issu de la soul américaine.",
    optionB: "Le zouk né de la rencontre entre la biguine et les musiques africaines.",
    optionC: "Le calypso trinidadien influencé par le jazz américain.",
    optionD: "La valse créole enrichie par l'accordéon européen.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Droit commercial et écosystème des start-ups : adapter le cadre légal à l'innovation",
    longText: ART_DROIT_COMMERCIAL,
    question: "Selon cet article, quelle est la principale difficulté du financement des start-ups ?",
    optionA: "Le refus systématique des banques d'accorder des prêts aux jeunes entreprises.",
    optionB: "Les outils classiques s'adaptent mal aux start-ups dont la valorisation repose sur des actifs immatériels.",
    optionC: "L'obligation légale de publier leurs comptes financiers dès la création.",
    optionD: "L'interdiction d'investissements étrangers dans les start-ups françaises.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Droit commercial et écosystème des start-ups : adapter le cadre légal à l'innovation",
    longText: ART_DROIT_COMMERCIAL,
    question: "Parmi les dispositifs français mentionnés dans l'article pour soutenir les start-ups, on trouve…",
    optionA: "La création d'un tribunal commercial spécialisé dans les litiges numériques.",
    optionB: "L'exonération totale d'impôts pour les cinq premières années d'activité.",
    optionC: "Le statut de Jeune Entreprise Innovante (JEI) et le dispositif French Tech.",
    optionD: "Le financement direct par l'État de tous les projets technologiques innovants.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Archives numériques et mémoire collective : les enjeux d'une transition silencieuse",
    longText: ART_ARCHIVES,
    question: "Selon cet article, quel est le risque principal lié à l'archivage numérique ?",
    optionA: "Le coût très élevé de la numérisation qui limite l'accès aux fonds.",
    optionB: "La facilité de falsification des documents numériques par des tiers.",
    optionC: "L'obsolescence numérique rendant les fichiers illisibles en quelques années.",
    optionD: "Le piratage des serveurs et la perte totale des données archivées.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Archives numériques et mémoire collective : les enjeux d'une transition silencieuse",
    longText: ART_ARCHIVES,
    question: "L'auteur identifie les métadonnées comme…",
    optionA: "la solution technique aux problèmes d'obsolescence des formats numériques.",
    optionB: "la clé de l'accessibilité des documents numérisés.",
    optionC: "un outil permettant de protéger les documents contre la falsification.",
    optionD: "une contrainte légale imposée par la réglementation européenne.",
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
    console.log(`\n✅ ${created} questions créées pour CE 47.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
