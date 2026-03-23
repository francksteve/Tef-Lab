'use strict';
/**
 * seed-ce-serie14.js
 * Peuple la série CE 14 avec les 40 questions officielles TEF Canada.
 * Usage : node scripts/seed-ce-serie14.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyog5q000a0wxlu93qm5bk';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de températures mensuelles pour Q22
   Commentaire : "Cette ville connaît quatre saisons bien marquées avec des hivers froids sous zéro et des étés chauds."
   Graphique correct : Graphique 2 → réponse B
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [-25,-22,-15,-5,3,10,14,12,6,-2,-12,-20], minY: -28, maxY: 18, color: '#E30613' },
    { label: 'Graphique 2', data: [-5,-3,4,10,16,20,23,22,16,9,2,-3], minY: -8, maxY: 26, color: '#003087' },
    { label: 'Graphique 3', data: [27,27,27,26,26,25,24,24,25,26,27,27], minY: 22, maxY: 30, color: '#E30613' },
    { label: 'Graphique 4', data: [7,8,11,14,17,20,22,22,19,14,10,7], minY: 4, maxY: 25, color: '#E30613' },
  ];
  const positions = [{cx:10,cy:15},{cx:420,cy:15},{cx:10,cy:218},{cx:420,cy:218}];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  function drawChart(g, cx, cy) {
    const plotX = cx+52, plotY = cy+35, plotW = 310, plotH = 110;
    const sx = i => (plotX + (i/11)*plotW).toFixed(1);
    const sy = t => (plotY + plotH - ((t-g.minY)/(g.maxY-g.minY))*plotH).toFixed(1);
    const pts = g.data.map((t,i) => `${sx(i)},${sy(t)}`).join(' ');
    const grid = [0,1,2,3].map(i => {
      const t = g.minY + i*(g.maxY-g.minY)/3;
      const yv = parseFloat(sy(t));
      return `<line x1="${plotX}" y1="${yv.toFixed(1)}" x2="${plotX+plotW}" y2="${yv.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX-5}" y="${(yv+4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${t.toFixed(0)}&#xB0;</text>`;
    }).join('');
    const xlab = months.map((m,i) =>
      `<text x="${sx(i)}" y="${(plotY+plotH+14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${m}</text>`
    ).join('');
    const dots = g.data.map((t,i) =>
      `<circle cx="${sx(i)}" cy="${sy(t)}" r="3" fill="${g.color}"/>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
      `<text x="${cx+195}" y="${cy+23}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
      `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY+plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      `<line x1="${plotX}" y1="${plotY+plotH}" x2="${plotX+plotW}" y2="${plotY+plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      grid + xlab +
      `<polyline points="${pts}" fill="none" stroke="${g.color}" stroke-width="2.5" stroke-linejoin="round"/>` +
      dots;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g,i) => drawChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Textes JSON pour Q18-21
───────────────────────────────────────────────────────────────────────────── */
const TEXTS_Q18 = JSON.stringify([
  { title: 'Restaurant 1', content: "Le Jardin de Provence : cuisine méditerranéenne aux saveurs du Sud. Spécialités : bouillabaisse, ratatouille, tapenade maison. Cadre provençal chaleureux, terrasse ombragée. Menu midi à 18 €, carte le soir. Ouvert du mardi au dimanche." },
  { title: 'Restaurant 2', content: "Saveurs d'Afrique de l'Ouest : plongez dans les traditions culinaires sénégalaises et ivoiriennes. Thiéboudienne, poulet yassa, mafé et attiéké préparés selon les recettes originales. Ambiance festive, musique live le vendredi soir. Formule découverte à 22 €." },
  { title: 'Restaurant 3', content: "Tokyo Fusion : le meilleur de la cuisine japonaise revisitée à la française. Sushis, ramens, tempuras et gyozas dans un cadre épuré et moderne. Menu dégustation 5 services à 45 €. Réservation recommandée en semaine." },
  { title: 'Restaurant 4', content: "La Bodega del Sol : tapas espagnoles et vins de la Rioja dans une ambiance colorée. Paella valenciana le week-end, charcuteries ibériques, fromages manchego. Happy hour de 18 h à 20 h. Privatisation possible pour groupes de plus de 20 personnes." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Spectacle 1', content: "Jazz & Blues Festival — Vendredi 14 juin, 20 h. Scène ouverte à tous les amateurs de jazz et blues. Entrée : 12 €. Convient à toute la famille. Bar et restauration sur place. Durée : 2 h 30." },
  { title: 'Spectacle 2', content: "Ballet contemporain : « Fragments » — Compagnie Danse Urbaine. Samedi 15 juin, 19 h 30. Un spectacle poétique et acrobatique mêlant hip-hop et danse classique. Tarif unique : 20 €. Accessible dès 6 ans. Durée : 1 h 45." },
  { title: 'Spectacle 3', content: "Cabaret érotique « La Nuit des Sirènes » — Vendredi et samedi, 22 h 30. Spectacle de variétés adultes avec tableaux burlesques et numéros de magie noire. Interdit aux moins de 12 ans. Entrée : 35 €. Tenue correcte exigée. Durée : 2 h." },
  { title: 'Spectacle 4', content: "Concert symphonique — Orchestre Philharmonique Régional. Dimanche 16 juin, 16 h. Programme : Beethoven, Brahms, Debussy. Tarifs : 25 € / réduit 15 € (étudiants, seniors). Durée : 2 h avec entracte. Enfants de moins de 5 ans non admis." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Abonnement 1', content: "MusiStream Basic : accès à 40 millions de titres en qualité standard (128 kbps). Écoute hors connexion sur 1 appareil. Prix : 4,99 €/mois. Publicités incluses en version gratuite. Idéal pour les auditeurs occasionnels." },
  { title: 'Abonnement 2', content: "SoundMax Premium : bibliothèque de 60 millions de titres avec qualité HD (320 kbps). Podcast et livres audio inclus. Écoute hors connexion sur 3 appareils simultanément. Prix : 9,99 €/mois. Essai gratuit 30 jours." },
  { title: 'Abonnement 3', content: "ArtistFirst : plateforme indépendante valorisant les artistes émergents. 25 millions de titres, qualité standard. Abonnement : 6,99 €/mois dont 50 % reversés directement aux artistes. Découverte musicale personnalisée par algorithme éditorial." },
  { title: 'Abonnement 4', content: "HiFiElite : la qualité audio la plus haute du marché — format lossless FLAC 24 bits/192 kHz. 50 millions de titres dont des enregistrements studio exclusifs. Compatible avec systèmes hi-fi haut de gamme. Prix : 19,99 €/mois. Idéal pour audiophiles exigeants." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Forfait 1', content: "Évasion Thaïlande — 10 jours / 9 nuits. Bangkok et îles du Sud. Hébergement 3 étoiles, petits-déjeuners inclus, visites guidées. Prix tout compris : 1 490 € par personne. Transferts aéroport inclus dans le tarif. Départs tous les samedis." },
  { title: 'Forfait 2', content: "Maroc Impérial — 8 jours / 7 nuits. Casablanca, Fès, Marrakech. Pension complète, guide francophone, transport en minibus climatisé. Prix : 1 190 € par personne. Vols non inclus. Assurance voyage en option." },
  { title: 'Forfait 3', content: "Croisière Méditerranée — 7 nuits au départ de Marseille. Escales à Barcelone, Rome, Athènes. Cabine intérieure, pension complète bord. Prix : 999 € par personne. Taxes portuaires en sus. Transferts non inclus." },
  { title: 'Forfait 4', content: "Canada Nature & Villes — 14 jours. Montréal, Québec, Parc de la Mauricie. Hébergement en auberges de charme, demi-pension. Activités plein air guidées. Prix : 2 190 € par personne. Vols et taxes non inclus." },
]);

/* ─────────────────────────────────────────────────────────────────────────────
   Documents administratifs (Q23-32)
───────────────────────────────────────────────────────────────────────────── */
const DOC_PROTOCOLE_SANITAIRE =
`PROTOCOLE SANITAIRE — ENTREPRISE LOGIMED
Mise à jour : janvier 2023

Dans le cadre de la politique de prévention sanitaire de l'entreprise, les mesures suivantes restent en vigueur dans l'ensemble de nos locaux.

Distanciation et espaces communs : une distance minimale d'un mètre est maintenue dans toutes les zones partagées. La cafétéria accueille 50 % de sa capacité habituelle par roulement.

Port du masque : obligatoire dans les zones d'accueil, les salles de réunion et les espaces de circulation. Masques chirurgicaux fournis à l'accueil sur demande.

Réunions et rassemblements : les réunions en présentiel de plus de 10 personnes doivent être validées par le responsable de site. Le recours à la visioconférence est fortement encouragé.

Tests et déclarations : tout salarié présentant des symptômes doit rester chez lui et effectuer un test avant tout retour sur site.`;

const DOC_RESTRUCTURATION_RH =
`NOTE INTERNE — DIRECTION DES RESSOURCES HUMAINES
Objet : Restructuration du pôle commercial — Information préalable

Suite aux résultats du dernier exercice et à la réorganisation stratégique du groupe, la Direction a décidé de procéder à une restructuration partielle du pôle commercial.

Cette opération entraîne la suppression de 12 postes dans les équipes de vente terrain, dont 8 postes de commerciaux régionaux et 4 postes de chefs de secteur.

Les salariés concernés seront reçus individuellement dès la semaine prochaine. Des solutions de reclassement en interne seront proposées en priorité, notamment dans les fonctions support et les équipes marketing digital.

Un accompagnement personnalisé (bilan de compétences, formation, aide à la mobilité géographique) sera proposé à chaque salarié affecté. Le comité d'entreprise a été informé et ses membres peuvent être contactés par les salariés pour tout renseignement.`;

const DOC_CHARTE_PARENTALITE =
`CHARTE PARENTALITÉ — GROUPE TECHNOVISION

Notre groupe s'engage à soutenir ses collaborateurs dans leur rôle de parents à travers les mesures suivantes :

Congé parental renforcé : au-delà du congé légal, l'entreprise offre deux semaines supplémentaires rémunérées à 100 % pour chaque naissance ou adoption, accessible aux deux parents.

Télétravail pour les parents : les parents d'enfants de moins de 8 ans bénéficient d'un droit prioritaire au télétravail jusqu'à 3 jours par semaine, sous réserve de compatibilité avec le poste.

Crèche partenaire : un accord a été signé avec la crèche interentreprises Les Petits Explorateurs, permettant la réservation prioritaire de places pour les enfants du personnel.

Horaires aménagés : possibilité de décaler le début ou la fin de journée d'une heure pour accompagner les enfants à l'école, après accord du responsable.`;

const DOC_REGLEMENT_CANTINE =
`RÈGLEMENT DE LA CANTINE SCOLAIRE — ÉCOLE PRIMAIRE JEAN MOULIN

Accès et tarification : la cantine est accessible à tous les élèves de l'école. Les tarifs sont calculés en fonction du quotient familial et révisés chaque année scolaire. Trois tranches existent : moins de 400 €, de 400 à 800 €, et au-delà de 800 €.

Allergies et régimes : tout régime alimentaire particulier (allergie, régime religieux ou médical) doit être signalé en début d'année via le formulaire de déclaration, accompagné d'un certificat médical si nécessaire.

Comportement : les élèves sont attendus à l'heure dans le réfectoire. Le bruit excessif, les jeux et la course sont interdits dans la salle à manger. Les enfants participent au débarrassage de leur plateau.

Absences : toute absence à la cantine doit être signalée avant 9 h le matin. Passé ce délai, le repas reste dû.`;

const DOC_DEPART_SALARIE =
`PROCÉDURE DE DÉPART DU SALARIÉ — GUIDE RH

Préavis : la durée du préavis est définie par la convention collective applicable et le contrat de travail. Elle débute à la date de notification du licenciement ou de réception de la lettre de démission.

Entretien de sortie : un entretien de fin de carrière avec le responsable RH est proposé systématiquement. Il permet de recueillir les retours du salarié sur son expérience dans l'entreprise et de transmettre les informations utiles à son successeur.

Documents remis lors du départ :
• Certificat de travail
• Solde de tout compte (à signer avec délai de contestation de 6 mois)
• Attestation Pôle emploi (remise dans les 8 jours)
• Récapitulatif des droits formation acquis (CPF)

Matériel restitué : l'ensemble du matériel fourni (badge, ordinateur, téléphone, véhicule de société) doit être restitué au service RH le dernier jour ouvré.`;

/* ─────────────────────────────────────────────────────────────────────────────
   Articles de presse (Q33-40)
───────────────────────────────────────────────────────────────────────────── */
const ART_MONDIALISATION_CULTURELLE =
`Depuis plusieurs décennies, la mondialisation culturelle suscite un débat de fond : est-elle un formidable vecteur d'échanges et d'enrichissement mutuel entre les peuples, ou au contraire une machine à uniformiser les cultures sous l'hégémonie de quelques géants économiques ?

D'un côté, les partisans de l'homogénéisation culturelle pointent la domination des industries culturelles américaines — films, séries, musique, fast-food — qui grignotent chaque année un peu plus de terrain sur les cultures locales. Les jeunes du monde entier portent les mêmes vêtements, regardent les mêmes séries et consomment les mêmes marques, au détriment des traditions et des identités régionales.

De l'autre, de nombreux chercheurs soulignent les phénomènes de « glocalisation » : les cultures locales ne disparaissent pas mais se réinventent en intégrant des éléments extérieurs. Le cinéma indien de Bollywood, la pop coréenne ou les littératures africaines francophones en sont des exemples éclatants.

La réalité est sans doute plus nuancée : si la mondialisation crée des risques réels d'appauvrissement culturel, elle génère aussi des dynamiques créatrices inédites. La diversité culturelle reste un combat à mener, mais elle dispose aujourd'hui d'alliés inattendus : le numérique, qui permet à des artistes du monde entier de diffuser leur travail sans intermédiaire.`;

const ART_LITTERATURE_NUMERIQUE =
`Le livre numérique existe depuis plus de trente ans, mais c'est avec l'avènement des tablettes et des liseuses que la lecture numérique s'est véritablement imposée dans les usages. Au-delà du simple format ePub qui reproduit le texte imprimé, de nouvelles formes d'écriture exploitent les possibilités propres au numérique : hypertexte, multimédia, interactivité, narrations non linéaires.

Ces nouvelles formes littéraires, parfois regroupées sous le terme de « littérature ergodique », posent de nouvelles questions aux lecteurs comme aux institutions. Qui est l'auteur d'une œuvre collaborative construite en temps réel par une communauté ? Comment conserver et archiver des œuvres dont le code informatique est au cœur de l'expérience ?

Les éditeurs traditionnels restent prudents face à ces expérimentations. Les formats numériques originaux peinent encore à trouver leur public, habitué aux codes du livre papier. Pourtant, une nouvelle génération de lecteurs, nés avec les réseaux sociaux et les jeux vidéo, s'approprie naturellement ces nouvelles formes narratives.

La littérature numérique ouvre ainsi un territoire d'exploration fascinant, mais son développement dépend autant de l'imagination des auteurs que de la capacité des institutions culturelles à reconnaître et à soutenir ces nouvelles pratiques.`;

const ART_ARCHITECTURE_VERTE =
`Bâtiments à énergie positive, toits végétalisés, façades en bois massif certifié, récupération des eaux pluviales : l'architecture verte est aujourd'hui au cœur des discours sur la ville durable. Mais entre les promesses des promoteurs et la réalité des chantiers, l'écart reste parfois saisissant.

La construction dite « écologique » représente un surcoût moyen de 10 à 20 % par rapport à la construction conventionnelle, selon les experts du secteur. Ce surcoût s'explique par le coût des matériaux biosourcés, la formation spécialisée des artisans et la complexité des certifications environnementales (HQE, BREEAM, LEED).

Pourtant, les défenseurs de l'architecture verte arguent que ce surcoût initial est largement compensé sur le long terme par les économies d'énergie et la meilleure qualité de vie des occupants. Des études montrent que les bâtiments certifiés HQE affichent des consommations énergétiques inférieures de 30 à 50 % à celles des bâtiments standards.

Le principal défi reste l'accès : les logements écologiques sont encore massivement réservés aux classes aisées ou aux programmes institutionnels, laissant de côté une grande partie de la population. L'enjeu pour les prochaines décennies sera de démocratiser ces standards de construction pour en faire la norme plutôt que l'exception.`;

const ART_CINEMA_IA =
`L'intelligence artificielle s'invite dans le septième art avec une force qui divise la profession. D'un côté, les studios et les techniciens enthousiastes voient dans l'IA un outil révolutionnaire capable de réduire les coûts de production, de générer des décors virtuels photoréalistes ou de décomposer le travail de post-production. De l'autre, les scénaristes, les acteurs et les réalisateurs s'inquiètent pour la survie de leur métier.

La grève des scénaristes hollywoodiens en 2023 a mis cette tension au premier plan. Parmi les revendications centrales : l'interdiction d'utiliser des textes générés par IA comme base de scénario sans rémunération des auteurs humains, et la protection des œuvres existantes contre l'entraînement des modèles sans consentement.

Au-delà des questions économiques, c'est la nature même de la création artistique qui est en jeu. L'IA peut-elle écrire une histoire qui touche, qui surprend, qui interroge notre humanité ? Les partisans de l'outil créatif répondent que l'IA ne remplace pas l'auteur mais l'amplifie, comme la photographie n'a pas tué la peinture.

La vraie question n'est peut-être pas technologique mais éthique : qui contrôle l'IA, qui en bénéficie, et comment garantir que l'innovation technologique serve la diversité des voix plutôt que la concentration du pouvoir créatif entre quelques mains ?`;

/* ─────────────────────────────────────────────────────────────────────────────
   Helper
───────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   Construction des 40 questions
───────────────────────────────────────────────────────────────────────────── */
function buildQuestions() {
  const qs = [];

  /* ── Q1-7 : Documents de la vie quotidienne ──────────────────────────── */

  // Q1 — Règlement d'une bibliothèque universitaire
  qs.push(q(1, 'Q1-7', null, {
    longText:
`RÈGLEMENT DE LA BIBLIOTHÈQUE UNIVERSITAIRE JEAN-JAURÈS

Emprunt : les étudiants inscrits peuvent emprunter jusqu'à 8 ouvrages simultanément pour une durée de 3 semaines, renouvelable en ligne une fois.

Accès numérique : les ressources numériques (bases de données, revues en ligne) sont accessibles depuis le campus ou via le VPN universitaire avec vos identifiants étudiants.

Silence : les niveaux sonores doivent rester compatibles avec le travail de vos voisins. Les espaces de travail collaboratif au 2e étage sont prévus pour les discussions en groupe.

Retards : tout retard entraîne une pénalité de 0,20 € par document et par jour. Au-delà de 30 jours de retard, le compte est bloqué.`,
    question: "D'après ce règlement, le renouvellement d'emprunt se fait…",
    optionA: "uniquement sur place, au comptoir d'accueil.",
    optionB: "en ligne, une fois possible par emprunt.",
    optionC: "par téléphone, sur rendez-vous.",
    optionD: "automatiquement à la date d'échéance.",
    correctAnswer: 'B',
  }));

  // Q2 — Carte de visite professionnelle
  qs.push(q(2, 'Q1-7', null, {
    longText:
`MARTIN LEFEBVRE
Consultant en Transformation Digitale

Spécialités :
• Conduite du changement et management de projets SI
• Audit des processus métier et optimisation
• Formation des équipes techniques et dirigeants

Cabinet MLConsulting — 12 rue de la Paix, 75002 Paris
Tél. : +33 6 45 23 78 90
Email : martin.lefebvre@mlconsulting.fr
LinkedIn : linkedin.com/in/martinlefebvre-conseil`,
    question: "Ce document est…",
    optionA: "une offre d'emploi dans le secteur numérique.",
    optionB: "une carte de visite professionnelle.",
    optionC: "un curriculum vitae abrégé.",
    optionD: "une publicité pour une formation.",
    correctAnswer: 'B',
  }));

  // Q3 — Programme d'une conférence internationale
  qs.push(q(3, 'Q1-7', null, {
    longText:
`CONFÉRENCE INTERNATIONALE SUR L'INNOVATION DURABLE
Paris — Palais des Congrès — 18-19 octobre

PROGRAMME DU 18 OCTOBRE
09 h 00 : Accueil et inscription des participants
09 h 30 : Discours d'ouverture — Pr. Anne Dumont (CNRS)
10 h 00 : Session 1 — Énergie renouvelable : défis et opportunités
12 h 30 : Déjeuner-networking (sur inscription)
14 h 00 : Ateliers thématiques (3 salles parallèles)
17 h 00 : Table ronde plénière — Financer la transition écologique

Inscription obligatoire sur : www.conf-innovation-durable.fr`,
    question: "D'après ce programme, les ateliers thématiques ont lieu…",
    optionA: "le matin, avant le déjeuner.",
    optionB: "en soirée, après la table ronde.",
    optionC: "l'après-midi, à partir de 14 h.",
    optionD: "pendant le déjeuner-networking.",
    correctAnswer: 'C',
  }));

  // Q4 — Horaires d'une pharmacie de garde
  qs.push(q(4, 'Q1-7', null, {
    longText:
`PHARMACIE DE GARDE — SECTEUR NORD
Valable du samedi 14 au dimanche 15 octobre

SAMEDI 14 OCTOBRE
Pharmacie des Lilas — 23 avenue Victor Hugo
Ouverte de 9 h à 19 h 30

DIMANCHE 15 OCTOBRE et JOURS FÉRIÉS
Pharmacie Centrale — Place du Marché
Ouverte de 10 h à 18 h

URGENCES PHARMACEUTIQUES (nuit et dimanche soir) :
Composer le 15 (SAMU) ou le 3237 pour obtenir la liste des pharmacies de garde nocturne.`,
    question: "En cas d'urgence pharmaceutique la nuit, il faut…",
    optionA: "se rendre directement à la Pharmacie Centrale.",
    optionB: "appeler le 15 ou le 3237.",
    optionC: "contacter la Pharmacie des Lilas.",
    optionD: "attendre l'ouverture du lendemain matin.",
    correctAnswer: 'B',
  }));

  // Q5 — Affiche d'un concert gratuit en plein air
  qs.push(q(5, 'Q1-7', null, {
    longText:
`CONCERT EN PLEIN AIR — ENTRÉE LIBRE !

SUMMER SOUNDS FESTIVAL
Samedi 22 juillet — À partir de 16 h
Parc de la Citadelle — Bordeaux

ARTISTES AU PROGRAMME :
• 16 h : Les Cousins Groove (jazz manouche)
• 18 h : Djely Sara (afrobeat & soul)
• 20 h 30 : Los Madrugadores (flamenco fusion)

Animations : food trucks, marché artisanal, espace enfants
Accès : tram ligne A (arrêt Citadelle) — Parking gratuit
Renseignements : mairie@bordeaux-culture.fr`,
    question: "Ce festival est…",
    optionA: "payant avec tarif réduit pour les enfants.",
    optionB: "réservé aux abonnés de la mairie.",
    optionC: "gratuit et ouvert à tous.",
    optionD: "accessible sur invitation uniquement.",
    correctAnswer: 'C',
  }));

  // Q6 — Bulletin d'information syndicale
  qs.push(q(6, 'Q1-7', null, {
    longText:
`BULLETIN D'INFORMATION — SYNDICAT CGT TECHNOPARTS
Numéro 47 — Octobre 2025

ACTUALITÉ SOCIALE
Les négociations annuelles obligatoires (NAO) ont débuté la semaine dernière. La direction propose une augmentation générale de 1,5 %, largement insuffisante au regard de l'inflation (3,8 % sur un an).

NOS REVENDICATIONS
Le syndicat exige :
• Une augmentation minimum de 4 % pour tous les salariés
• La revalorisation des primes d'ancienneté gelées depuis 2019
• La création de 15 postes permanents pour mettre fin au recours excessif à l'intérim

PROCHAINE RÉUNION D'INFORMATION
Mardi 28 octobre, 12 h 30, salle B2 — Participez nombreux !`,
    question: "Ce document est un…",
    optionA: "rapport annuel d'entreprise.",
    optionB: "communiqué de presse de la direction.",
    optionC: "bulletin d'information syndical.",
    optionD: "compte rendu de réunion du comité d'entreprise.",
    correctAnswer: 'C',
  }));

  // Q7 — Programme d'une colonie de vacances
  qs.push(q(7, 'Q1-7', null, {
    longText:
`COLONIE DE VACANCES — LES EXPLORATEURS
Centre de loisirs du Lac Bleu — Annecy

POUR QUI : Enfants de 7 à 14 ans
QUAND : Du 14 au 25 juillet (12 jours)

ACTIVITÉS : voile, escalade, randonnée, veillées, ateliers créatifs

ENCADREMENT : 1 animateur pour 8 enfants. Tous titulaires du BAFA.
Infirmière présente sur site 24 h/24.

TARIFS :
• 890 € / enfant (pension complète)
• Réduction de 10 % pour le 2e enfant de la même famille

INSCRIPTION : avant le 30 mai sur www.explorateurs-vacances.fr
Places limitées — Priorité aux premières inscriptions`,
    question: "D'après ce document, le ratio encadrement/enfants est de…",
    optionA: "1 animateur pour 5 enfants.",
    optionB: "1 animateur pour 8 enfants.",
    optionC: "1 animateur pour 10 enfants.",
    optionD: "1 animateur pour 12 enfants.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 : Phrases lacunaires ───────────────────────────────────────── */
  const PHRASE_Q = 'Dans cette phrase, indiquez le mot ou le groupe de mots manquant.';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le directeur a ___ une réunion d'urgence pour discuter des nouveaux objectifs de l'équipe.",
    question: PHRASE_Q,
    optionA: "annulé",
    optionB: "convoqué",
    optionC: "accepté",
    optionD: "convenu",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce médicament doit être conservé à l'abri de la chaleur et dans un endroit ___ .",
    question: PHRASE_Q,
    optionA: "chaud",
    optionB: "humide",
    optionC: "sec",
    optionD: "ouvert",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les candidats sont invités à ___ leur dossier complet avant la date limite de dépôt.",
    question: PHRASE_Q,
    optionA: "retirer",
    optionB: "soumettre",
    optionC: "lire",
    optionD: "recevoir",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le vol a été ___ en raison de conditions météorologiques défavorables sur l'aéroport de Lyon.",
    question: PHRASE_Q,
    optionA: "avancé",
    optionB: "maintenu",
    optionC: "retardé",
    optionD: "supprimé",
    correctAnswer: 'D',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour obtenir ce remboursement, vous devez fournir une ___ originale de vos frais médicaux.",
    question: PHRASE_Q,
    optionA: "demande",
    optionB: "copie",
    optionC: "facture",
    optionD: "photo",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La réunion du conseil municipal a été ___ à la semaine prochaine en raison du manque de quorum.",
    question: PHRASE_Q,
    optionA: "annulée",
    optionB: "reportée",
    optionC: "avancée",
    optionD: "prolongée",
    correctAnswer: 'B',
  }));

  /* ── Q14-17 : Textes lacunaires (2 textes × 2 questions) ─────────────── */

  // Texte 1 (Q14-15) — Transition numérique
  const TEXTE_LACUNAIRE_1 =
    "La [14] numérique transforme en profondeur notre façon de travailler et de communiquer. Des millions d'emplois sont amenés à évoluer sous l'effet de l'automatisation et de l'intelligence artificielle. Pour y faire face, la formation continue devient un outil [15] pour maintenir l'employabilité des travailleurs face aux mutations technologiques.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La transition numérique',
    longText: TEXTE_LACUNAIRE_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "révolution",
    optionB: "crise",
    optionC: "pause",
    optionD: "régression",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La transition numérique',
    longText: TEXTE_LACUNAIRE_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "inutile",
    optionB: "suffisant",
    optionC: "indispensable",
    optionD: "coûteux",
    correctAnswer: 'C',
  }));

  // Texte 2 (Q16-17) — Alimentation et santé
  const TEXTE_LACUNAIRE_2 =
    "Une alimentation [16] et diversifiée est la clé d'une bonne santé à long terme. Les nutritionnistes recommandent de réduire la consommation de produits ultra-transformés et de privilégier les aliments [17], comme les fruits, les légumes, les céréales complètes et les légumineuses.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Alimentation et santé',
    longText: TEXTE_LACUNAIRE_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "excessive",
    optionB: "équilibrée",
    optionC: "rapide",
    optionD: "industrielle",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Alimentation et santé',
    longText: TEXTE_LACUNAIRE_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "congelés",
    optionB: "importés",
    optionC: "bruts",
    optionD: "sucrés",
    correctAnswer: 'C',
  }));

  /* ── Q18-21 : Lecture rapide de textes (4 annonces) ──────────────────── */

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel restaurant propose une cuisine d'Afrique de l'Ouest ?",
    optionA: "Restaurant 1",
    optionB: "Restaurant 2",
    optionC: "Restaurant 3",
    optionD: "Restaurant 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel spectacle est déconseillé aux enfants de moins de 12 ans ?",
    optionA: "Spectacle 1",
    optionB: "Spectacle 2",
    optionC: "Spectacle 3",
    optionD: "Spectacle 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel abonnement propose la qualité audio la plus haute ?",
    optionA: "Abonnement 1",
    optionB: "Abonnement 2",
    optionC: "Abonnement 3",
    optionD: "Abonnement 4",
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel forfait inclut les transferts aéroport dans le prix ?",
    optionA: "Forfait 1",
    optionB: "Forfait 2",
    optionC: "Forfait 3",
    optionD: "Forfait 4",
    correctAnswer: 'A',
  }));

  /* ── Q22 : Graphique ─────────────────────────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    consigne: 'Observez les quatre graphiques et répondez à la question.',
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond au commentaire ?',
    comment: "« Cette ville connaît quatre saisons bien marquées avec des hivers froids sous zéro et des étés chauds. »",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  /* ── Q23-32 : Documents administratifs et professionnels ─────────────── */
  const CONSIGNE_DOC = 'Lisez ce document et répondez aux questions.';

  // Doc 1 (Q23-24) — Protocole sanitaire
  qs.push(q(23, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Protocole sanitaire — Entreprise Logimed",
    longText: DOC_PROTOCOLE_SANITAIRE,
    question: "Ce document présente principalement…",
    optionA: "les consignes de sécurité incendie de l'entreprise.",
    optionB: "les mesures sanitaires en vigueur dans les locaux.",
    optionC: "les règles de télétravail obligatoire pour tous.",
    optionD: "le programme de vaccination du personnel.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Protocole sanitaire — Entreprise Logimed",
    longText: DOC_PROTOCOLE_SANITAIRE,
    question: "Selon ce document, les réunions en présentiel de plus de 10 personnes…",
    optionA: "sont totalement interdites dans l'entreprise.",
    optionB: "doivent être validées par le responsable de site.",
    optionC: "nécessitent la présence obligatoire d'un infirmier.",
    optionD: "se tiennent uniquement dans la grande salle du rez-de-chaussée.",
    correctAnswer: 'B',
  }));

  // Doc 2 (Q25-26) — Restructuration RH
  qs.push(q(25, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Note interne — Restructuration du pôle commercial",
    longText: DOC_RESTRUCTURATION_RH,
    question: "Cette note interne annonce principalement…",
    optionA: "l'ouverture de nouveaux postes dans le pôle commercial.",
    optionB: "la suppression de postes dans les équipes de vente terrain.",
    optionC: "une hausse des objectifs de vente pour le prochain trimestre.",
    optionD: "le déménagement du siège social de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Note interne — Restructuration du pôle commercial",
    longText: DOC_RESTRUCTURATION_RH,
    question: "Selon ce document, les salariés concernés par la restructuration…",
    optionA: "seront licenciés sans aucune proposition alternative.",
    optionB: "pourront bénéficier d'un reclassement interne prioritaire.",
    optionC: "devront quitter l'entreprise dans un délai d'une semaine.",
    optionD: "ont déjà été informés individuellement de la décision.",
    correctAnswer: 'B',
  }));

  // Doc 3 (Q27-28) — Charte parentalité
  qs.push(q(27, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Charte parentalité — Groupe Technovision",
    longText: DOC_CHARTE_PARENTALITE,
    question: "La charte parentalité de cette entreprise propose notamment…",
    optionA: "un congé parental légal étendu de deux semaines supplémentaires rémunérées.",
    optionB: "une garderie gratuite intégrée dans les locaux de l'entreprise.",
    optionC: "un télétravail à temps plein pour tous les parents.",
    optionD: "des horaires aménagés sans condition d'accord du responsable.",
    correctAnswer: 'A',
  }));

  qs.push(q(28, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Charte parentalité — Groupe Technovision",
    longText: DOC_CHARTE_PARENTALITE,
    question: "D'après ce document, le droit au télétravail renforcé est accessible…",
    optionA: "à tous les salariés de l'entreprise sans distinction.",
    optionB: "aux parents d'enfants de moins de 8 ans, selon compatibilité du poste.",
    optionC: "uniquement aux mères après leur congé maternité.",
    optionD: "aux parents d'enfants handicapés uniquement.",
    correctAnswer: 'B',
  }));

  // Doc 4 (Q29-30) — Règlement cantine scolaire
  qs.push(q(29, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Règlement de la cantine scolaire — École primaire Jean Moulin",
    longText: DOC_REGLEMENT_CANTINE,
    question: "D'après ce règlement, les tarifs de la cantine sont calculés en fonction…",
    optionA: "de l'âge de l'enfant et de son niveau scolaire.",
    optionB: "du quotient familial des parents.",
    optionC: "du nombre d'enfants inscrits dans l'établissement.",
    optionD: "du type de repas choisi chaque jour.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Règlement de la cantine scolaire — École primaire Jean Moulin",
    longText: DOC_REGLEMENT_CANTINE,
    question: "Selon ce document, une absence à la cantine non signalée avant 9 h…",
    optionA: "entraîne l'exclusion définitive de l'enfant.",
    optionB: "est remboursée intégralement en fin de mois.",
    optionC: "reste due financièrement malgré l'absence.",
    optionD: "est automatiquement reportée au lendemain.",
    correctAnswer: 'C',
  }));

  // Doc 5 (Q31-32) — Procédure départ salarié
  qs.push(q(31, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Procédure de départ du salarié — Guide RH",
    longText: DOC_DEPART_SALARIE,
    question: "Ce document décrit principalement…",
    optionA: "les droits des salariés en cas de licenciement abusif.",
    optionB: "la procédure à suivre lors du départ d'un salarié de l'entreprise.",
    optionC: "les démarches pour obtenir des indemnités chômage.",
    optionD: "les conditions de retraite anticipée dans l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    consigne: CONSIGNE_DOC,
    taskTitle: "Procédure de départ du salarié — Guide RH",
    longText: DOC_DEPART_SALARIE,
    question: "D'après ce document, l'attestation Pôle emploi doit être remise…",
    optionA: "immédiatement à la notification du licenciement.",
    optionB: "dans les 8 jours suivant la fin du contrat.",
    optionC: "dans les 30 jours après le solde de tout compte.",
    optionD: "uniquement sur demande expresse du salarié.",
    correctAnswer: 'B',
  }));

  /* ── Q33-40 : Articles de presse ─────────────────────────────────────── */
  const CONSIGNE_ART = 'Lisez cet article et répondez aux questions.';

  // Art 1 (Q33-34) — Mondialisation culturelle
  qs.push(q(33, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "La mondialisation culturelle : homogénéisation ou enrichissement des identités ?",
    longText: ART_MONDIALISATION_CULTURELLE,
    question: "Selon cet article, la mondialisation culturelle…",
    optionA: "a définitivement détruit les cultures locales.",
    optionB: "est exclusivement portée par les industries américaines.",
    optionC: "génère à la fois des risques d'uniformisation et des dynamiques créatrices.",
    optionD: "est un phénomène récent lié à l'essor d'internet.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "La mondialisation culturelle : homogénéisation ou enrichissement des identités ?",
    longText: ART_MONDIALISATION_CULTURELLE,
    question: "L'auteur cite le numérique comme…",
    optionA: "principal facteur d'appauvrissement des cultures.",
    optionB: "allié inattendu de la diversité culturelle.",
    optionC: "outil de propagande des industries dominantes.",
    optionD: "menace pour les cultures traditionnelles.",
    correctAnswer: 'B',
  }));

  // Art 2 (Q35-36) — Littérature numérique
  qs.push(q(35, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "La littérature numérique : nouveaux formats, nouvelles lectures, nouveaux lecteurs ?",
    longText: ART_LITTERATURE_NUMERIQUE,
    question: "D'après cet article, les éditeurs traditionnels face à la littérature numérique originale sont…",
    optionA: "très enthousiastes et investissent massivement.",
    optionB: "encore prudents car les formats peinent à trouver leur public.",
    optionC: "totalement opposés à ces nouvelles formes d'écriture.",
    optionD: "contraints par la loi de publier ces nouvelles formes.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "La littérature numérique : nouveaux formats, nouvelles lectures, nouveaux lecteurs ?",
    longText: ART_LITTERATURE_NUMERIQUE,
    question: "Selon l'auteur, le développement de la littérature numérique dépend notamment de…",
    optionA: "la suppression des droits d'auteur pour les œuvres en ligne.",
    optionB: "la capacité des institutions à reconnaître ces nouvelles pratiques.",
    optionC: "l'abandon du format papier par les lecteurs.",
    optionD: "l'investissement des grandes plateformes technologiques.",
    correctAnswer: 'B',
  }));

  // Art 3 (Q37-38) — Architecture verte
  qs.push(q(37, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "L'architecture verte : bâtiments durables entre ambition écologique et coût réel",
    longText: ART_ARCHITECTURE_VERTE,
    question: "D'après cet article, la construction écologique représente par rapport à la construction conventionnelle…",
    optionA: "un surcoût moyen de 10 à 20 %.",
    optionB: "une économie immédiate de 30 %.",
    optionC: "un coût identique grâce aux subventions.",
    optionD: "un surcoût impossible à évaluer précisément.",
    correctAnswer: 'A',
  }));

  qs.push(q(38, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "L'architecture verte : bâtiments durables entre ambition écologique et coût réel",
    longText: ART_ARCHITECTURE_VERTE,
    question: "Selon l'auteur, le principal défi de l'architecture verte est…",
    optionA: "de convaincre les architectes d'adopter ces méthodes.",
    optionB: "de trouver des matériaux biosourcés en quantité suffisante.",
    optionC: "de démocratiser ces standards pour les rendre accessibles à tous.",
    optionD: "d'obtenir les certifications environnementales nécessaires.",
    correctAnswer: 'C',
  }));

  // Art 4 (Q39-40) — Cinéma et IA
  qs.push(q(39, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "Le cinéma à l'ère de l'IA : scénaristes menacés ou nouveaux outils créatifs ?",
    longText: ART_CINEMA_IA,
    question: "D'après cet article, la grève des scénaristes hollywoodiens en 2023 portait notamment sur…",
    optionA: "l'interdiction totale de l'IA dans le cinéma.",
    optionB: "la protection des œuvres contre l'utilisation non rémunérée par l'IA.",
    optionC: "la réduction des heures de travail dans les studios.",
    optionD: "le financement public du cinéma indépendant.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    consigne: CONSIGNE_ART,
    taskTitle: "Le cinéma à l'ère de l'IA : scénaristes menacés ou nouveaux outils créatifs ?",
    longText: ART_CINEMA_IA,
    question: "Selon l'auteur, la vraie question soulevée par l'IA dans le cinéma est…",
    optionA: "de nature technologique : peut-on créer une IA plus performante ?",
    optionB: "de nature éthique : qui contrôle l'IA et au profit de qui ?",
    optionC: "économique : comment réduire les coûts de production ?",
    optionD: "artistique : l'IA peut-elle réaliser un film primé ?",
    correctAnswer: 'B',
  }));

  return qs;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function main() {
  const rawUrl = process.env.DATABASE_URL ?? '';
  const connectionString = rawUrl
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
    console.log(`\n✅ ${created} questions créées pour CE 14.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
