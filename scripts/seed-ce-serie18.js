'use strict';
/**
 * seed-ce-serie18.js
 * Peuple la série CE 18 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie18.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoguh000e0wxlq3eigdzo';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts admissions hospitalières par trimestre ── */
function generateQ22SVG() {
  // Graphique correct = C (T3 = pic avec hausse de 23%)
  const graphs = [
    { label: 'Graphique 1', data: [820, 790, 850, 810], color: '#E30613' },
    { label: 'Graphique 2', data: [750, 820, 780, 850], color: '#E30613' },
    { label: 'Graphique 3', data: [780, 810, 960, 830], color: '#003087' }, // CORRECT: T3=960 (hausse 23%)
    { label: 'Graphique 4', data: [900, 880, 840, 870], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['T1', 'T2', 'T3', 'T4'];
  const maxVal = 1000;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 250, 500, 750, 1000].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Admissions/semaine</text>`;
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
  { title: 'Commerce 1', content: "Le marché alimentaire traditionnel propose des produits frais locaux (fruits, légumes, viandes, fromages) vendus directement par des producteurs ou des revendeurs. Il se tient généralement en plein air plusieurs jours par semaine. Les prix sont négociables et les produits varient selon les saisons." },
  { title: 'Commerce 2', content: "Le supermarché de grande surface propose une large gamme de produits alimentaires et non alimentaires, de marques nationales et de marques distributeur. Les produits sont conditionnés et étiquetés. Il est ouvert tous les jours avec des horaires étendus. Aucun produit d'agriculture biologique certifié n'est exclusif." },
  { title: 'Commerce 3', content: "L'épicerie bio certifiée est un commerce spécialisé qui vend uniquement des produits issus de l'agriculture biologique certifiée par des organismes agréés (AB, Ecocert). Tous les produits portent le logo officiel attestant l'absence de pesticides chimiques de synthèse et d'OGM." },
  { title: 'Commerce 4', content: "La supérette de proximité est un petit commerce alimentaire de quartier, ouvert 7 jours/7 avec des horaires souvent étendus. Elle propose un assortiment limité de produits courants à prix légèrement supérieurs aux hypermarchés. Pratique pour les achats d'appoint, elle ne se spécialise pas dans le bio." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Genre 1', content: "L'album illustré (ou livre d'images) est un ouvrage destiné aux très jeunes enfants, où l'image domine et raconte une histoire simple. Le texte est minimal ou absent. Il favorise l'éveil au langage et à la lecture. Le format cartonné est courant pour résister aux manipulations des tout-petits." },
  { title: 'Genre 2', content: "Le roman d'aventure pour enfants met en scène des personnages jeunes confrontés à des péripéties, des voyages et des défis. L'intrigue est rythmée et les rebondissements fréquents. Il encourage la lecture autonome et nourrit l'imagination. La série des Club des Cinq en est un exemple classique." },
  { title: 'Genre 3', content: "Le conte philosophique est un récit court, souvent illustré, qui, sous une forme narrative accessible à un jeune public, développe une réflexion morale ou philosophique. Il se termine généralement par une morale explicite ou implicite. Le Petit Prince de Saint-Exupéry en est l'exemple le plus connu." },
  { title: 'Genre 4', content: "La bande dessinée pour la jeunesse raconte une histoire à travers une succession de cases illustrées avec des bulles de dialogue. Elle conjugue image et texte de façon complémentaire. Très populaire chez les enfants et adolescents, elle couvre tous les genres : humour, aventure, science-fiction." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Musée 1', content: "Le musée des Beaux-Arts présente des collections de peintures, sculptures et arts graphiques de différentes époques, des antiquités à l'art moderne. Ses collections permanentes sont complétées par des expositions temporaires thématiques. Tarifs : adulte 8 €, réduit 5 €." },
  { title: 'Musée 2', content: "Le musée des sciences et techniques présente l'histoire des inventions et des technologies, des machines à vapeur aux ordinateurs. Il propose des démonstrations interactives pour tous les âges. Des ateliers pratiques permettent aux visiteurs d'expérimenter des phénomènes scientifiques." },
  { title: 'Musée 3', content: "L'écomusée est un musée en plein air qui préserve et présente le patrimoine rural vivant dans son contexte naturel et social d'origine. Des bâtiments agricoles, des outils, des savoir-faire artisanaux et des animaux de race ancienne y sont conservés dans un cadre authentique." },
  { title: 'Musée 4', content: "Le musée d'art contemporain présente des œuvres d'artistes vivants ou récents, souvent expérimentales ou conceptuelles. Les installations, performances et œuvres multimédias y côtoient la peinture et la sculpture. Il organise régulièrement des rencontres avec les artistes." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Examen 1', content: "La radiographie (radio) est un examen d'imagerie médicale utilisant des rayons X pour visualiser les structures osseuses et certains organes internes. Elle expose le patient à de faibles doses de rayonnements ionisants. L'irradiation, quoique minime, est réelle." },
  { title: 'Examen 2', content: "Le scanner (ou tomodensitométrie) est un examen d'imagerie qui utilise des rayons X en rotation autour du corps pour produire des images en coupe. Plus précis que la radio, il est particulièrement indiqué pour les explorations abdominales et thoraciques. Il expose à plus de rayonnements ionisants." },
  { title: 'Examen 3', content: "L'IRM (Imagerie par Résonance Magnétique) produit des images très détaillées des tissus mous, muscles, cerveau et articulations grâce à des ondes magnétiques et des radiofréquences. Contrairement aux rayons X, elle n'utilise aucun rayonnement ionisant, ce qui la rend particulièrement sûre pour les examens répétés." },
  { title: 'Examen 4', content: "L'échographie utilise des ultrasons (ondes sonores) pour visualiser en temps réel les organes internes, les vaisseaux sanguins et le fœtus pendant la grossesse. Elle est totalement indolore et sans rayonnement ionisant. Très utilisée en obstétrique et cardiologie." },
]);

/* ── Documents Q23-32 ── */
const DOC_GUIDE_PATIENT =
`GUIDE DU PATIENT — Centre Hospitalier Sainte-Croix

VOS DROITS :
• Être informé de votre état de santé et des soins proposés, en termes accessibles.
• Participer aux décisions médicales vous concernant.
• Accéder à votre dossier médical sur demande écrite (délai légal : 8 jours).
• Désigner une personne de confiance qui sera consultée si vous ne pouvez exprimer votre volonté.

VOS OBLIGATIONS :
• Respecter le règlement intérieur de l'établissement.
• Vous identifier correctement à chaque acte de soins.
• Informer les équipes médicales de tout changement de traitement ou d'allergie.
• Régler votre part des frais dans les délais prévus.`;

const DOC_OFFRE_EMPLOI_INFIRMIER =
`OFFRE D'EMPLOI — INFIRMIER(ÈRE) SPÉCIALISÉ(E) DE BLOC OPÉRATOIRE (H/F)

Le Centre Hospitalier Régional recrute un(e) infirmier(ère) pour son bloc opératoire polyvalent.

MISSIONS : Préparation du matériel chirurgical stérile, assistance technique aux chirurgiens, surveillance per-opératoire du patient, traçabilité des instruments.

PROFIL : Diplôme d'État d'infirmier + Diplôme d'Infirmier de Bloc Opératoire (IBODE). Expérience de 2 ans en bloc opératoire souhaitée. Rigueur absolue, résistance au stress, travail en équipe pluridisciplinaire.

CONDITIONS : CDI, temps plein, grille FPH. Gardes et astreintes rémunérées selon convention. Accès aux formations continues du CHR.`;

const DOC_REGLEMENT_BIBLIO =
`RÈGLEMENT — BIBLIOTHÈQUE MUNICIPALE DES SOURCES

INSCRIPTION : Gratuite pour tous les résidents de la commune. Présentation d'un justificatif de domicile et d'une pièce d'identité.

EMPRUNTS :
• Livres adultes et jeunesse : 5 documents maximum, 3 semaines, renouvelables une fois en ligne.
• DVD : 2 maximum, 1 semaine, non renouvelable.
• Revues : consultation sur place uniquement, pas d'emprunt.

RETARDS : 0,15 € par document et par jour calendaire de retard.

ACCÈS NUMÉRIQUE : Les abonnés peuvent accéder aux ressources numériques (presse, e-books, cours en ligne) via leur espace personnel sur le site de la bibliothèque.`;

const DOC_CONTRAT_ABONNEMENT_MUSEE =
`CONTRAT D'ABONNEMENT ANNUEL — MUSÉE CITÉ DES ARTS

Abonné(e) : Mme Claire BEAUMONT
Formule : Pass Annuel Liberté
Durée de validité : 12 mois à compter de la date d'activation

AVANTAGES :
• Accès illimité à toutes les expositions permanentes
• Entrée aux expositions temporaires : -50 % sur le tarif habituel
• Invitations aux vernissages sur réservation
• Tarif préférentiel à la boutique : -10 %
• 1 accompagnateur gratuit par visite (hors expositions temporaires)

TARIF : 75 €/an — paiement unique à l'adhésion
NON CESSIBLE — Valable uniquement pour le titulaire nommé.`;

const DOC_NOTE_PHARMACIE =
`NOTE INTERNE — Responsable Pharmacie
Objet : Procédure de gestion des stocks — médicaments à risque

Afin de prévenir tout risque de rupture de stock ou de confusion entre médicaments, les procédures suivantes sont désormais obligatoires :

RÉCEPTION : Tout lot entrant doit être contrôlé (DLC, intégrité de l'emballage, correspondance avec le bon de commande) avant rangement.

RANGEMENT : Les médicaments à risque (anticoagulants, chimiothérapies, insulines) sont stockés dans l'armoire sécurisée, séparément des autres produits. Accès limité aux pharmaciens diplômés.

DISPENSATION : Double vérification obligatoire pour les médicaments à marge thérapeutique étroite (deux professionnels présents à la validation).

PÉREMPTION : Contrôle mensuel des DLC — tout produit périmé est retiré et détruit selon la filière réglementaire.`;

/* ── Articles de presse Q33-40 ── */
const ART_DESERTS_MEDICAUX =
`LES DÉSERTS MÉDICAUX EN ZONE RURALE : UNE INÉGALITÉ SANITAIRE CRIANTE

La notion de désert médical s'est imposée dans le débat public pour désigner les territoires où l'accès aux soins primaires est devenu problématique faute de médecins généralistes en nombre suffisant. En France, environ 6 millions de personnes vivent dans une zone caractérisée par une faible densité médicale, principalement dans les zones rurales, les petites villes en déclin démographique et certains quartiers périurbains.

Les causes sont multiples et bien identifiées. La démographie médicale joue un rôle central : la génération de médecins qui avait massivement intégré la profession dans les années 1970-1980 est aujourd'hui en âge de partir à la retraite. Les jeunes médecins, eux, choisissent massivement les zones urbaines ou péri-urbaines pour des raisons professionnelles (accès aux spécialistes, plateaux techniques) et personnelles (qualité de vie, emploi du conjoint, offre culturelle et éducative).

Les conséquences sanitaires sont documentées. Les patients en désert médical retardent leurs consultations, recourent davantage aux urgences hospitalières pour des pathologies qui auraient pu être traitées en ambulatoire, et présentent des indicateurs de santé moins favorables que les habitants des zones mieux pourvues.

Les solutions expérimentées sont variées. Les maisons de santé pluriprofessionnelles, qui regroupent médecins, infirmiers, kinésithérapeutes et autres professionnels de santé, ont montré leur efficacité pour maintenir une offre de soins de qualité. Les incitations financières à l'installation dans les zones sous-dotées existent mais restent insuffisantes. La télémédecine apporte un complément utile mais ne saurait se substituer à une présence physique pour de nombreux actes.`;

const ART_CULTURE_MONDIALISATION =
`L'INDUSTRIE CULTURELLE FACE À LA MONDIALISATION : DIVERSITÉ OU UNIFORMISATION ?

La mondialisation culturelle est un phénomène paradoxal. D'un côté, elle permet à des œuvres, des artistes et des cultures de toucher un public mondial sans précédent : un film coréen peut gagner l'Oscar du meilleur film, une série turque peut être regardée dans 70 pays, un artiste nigérian peut remplir des stades en Europe. La diversité culturelle n'a jamais été aussi accessible, au moins sur les plateformes numériques.

De l'autre, la mondialisation culturelle favorise une concentration économique qui menace cette diversité. Les grandes plateformes de streaming (Netflix, Spotify, Disney+) captent une part croissante des revenus culturels et orientent les productions vers des formats standardisés susceptibles de plaire au plus grand nombre à l'échelle globale. La culture locale, la langue minoritaire, le genre artistique de niche ont du mal à trouver leur place dans des algorithmes de recommandation optimisés pour maximiser les temps de visionnage.

La question de la souveraineté culturelle se pose avec acuité. L'Europe a développé le concept d'exception culturelle, qui exclut la culture des négociations commerciales classiques et autorise les États à subventionner leur cinéma, leur musique et leur littérature. Cette politique a montré son efficacité : le cinéma français et le cinéma scandinave restent dynamiques et reconnus mondialement grâce à un système de soutien public robuste.

La diversité culturelle est un bien public mondial. Sa préservation nécessite des politiques volontaristes qui ne peuvent être laissées aux seules forces du marché.`;

const ART_TRANSPORTS_URBAINS =
`LA GESTION DES TRANSPORTS URBAINS : VERS LA VILLE DES MOBILITÉS DURABLES

La congestion des grandes agglomérations est devenue l'un des défis majeurs de l'urbanisme contemporain. Les heures de pointe font perdre des milliers d'heures productives aux navetteurs, dégradent la qualité de l'air et alimentent le stress des habitants. Les villes cherchent à réduire la place de la voiture individuelle sans pour autant pénaliser la mobilité de leurs habitants.

Les stratégies adoptées varient selon les contextes. Certaines villes ont misé sur l'extension des réseaux de transports en commun : prolongement des lignes de métro, développement du tramway, création de voies réservées aux bus. D'autres ont restreint la circulation automobile dans les centres-villes par des péages urbains (Londres, Stockholm) ou des zones à faibles émissions (Paris, Amsterdam). La tarification dynamique du stationnement, plus chère aux heures de pointe, incite également à changer ses habitudes.

Les nouvelles formes de mobilité font leur entrée dans ce paysage. Le vélo, longtemps marginal en dehors des Pays-Bas et du Danemark, connaît une renaissance spectaculaire grâce aux pistes cyclables sécurisées et aux vélos à assistance électrique. Le covoiturage, facilité par les applications mobiles, réduit le nombre de véhicules en circulation. Les trottinettes électriques et autres nouvelles mobilités douces complètent le panel.

La ville des mobilités durables n'est pas une utopie, mais elle exige une vision à long terme, des investissements massifs dans les infrastructures et un changement culturel profond dans le rapport des citadins à l'automobile.`;

const ART_CHIRURGIE_NOUVELLES_TECH =
`LES NOUVELLES TECHNOLOGIES EN CHIRURGIE : QUAND LA PRÉCISION DEVIENT ABSOLUE

La chirurgie est en train de vivre une révolution technologique silencieuse mais profonde. Depuis l'introduction de la chirurgie laparoscopique dans les années 1980, qui a remplacé les grandes incisions par des petites ouvertures et des caméras, les techniques opératoires n'ont cessé d'évoluer vers davantage de précision, de miniaturisation et de contrôle.

La chirurgie robotique, incarnée par le système Da Vinci, permet au chirurgien d'opérer avec des instruments à 7 degrés de liberté contrôlés depuis une console, avec une vision 3D haute résolution et des gestes filtrés pour éliminer les tremblements naturels. Les résultats sont remarquables en chirurgie urologique, gynécologique et digestive : temps de récupération réduits, moins de douleurs post-opératoires, saignements diminués.

L'impression 3D transforme également la chirurgie reconstructrice. Des prothèses osseuses et des guides de coupe chirurgicaux parfaitement adaptés à l'anatomie de chaque patient peuvent désormais être fabriqués en quelques heures à partir de données d'imagerie médicale. Certains centres expérimentent même l'impression de tissus biologiques (bio-impression), ouvrant la voie à la fabrication d'organes à transplanter.

L'intelligence artificielle s'invite aussi dans le bloc opératoire. Des algorithmes analysent en temps réel les données du patient pendant l'opération, alertent sur les risques potentiels et guident la planification chirurgicale. La chirurgie de demain sera probablement une coopération étroite entre le savoir-faire humain du chirurgien et les capacités augmentées offertes par ces technologies.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche musée
  qs.push(q(1, 'Q1-7', null, {
    longText:
`MUSÉE D'ART ET D'HISTOIRE — INFORMATIONS PRATIQUES

HORAIRES :
Mardi–Vendredi : 10 h – 18 h
Samedi–Dimanche : 10 h – 20 h
Fermé le lundi et les jours fériés

TARIFS :
Adulte : 10 € | Étudiant : 6 € | Enfant (-12 ans) : 4 € | Gratuit le 1er dimanche du mois

EXPOSITIONS EN COURS :
• Permanent : Collections d'art médiéval et Renaissance (salles 1-8)
• Temporaire : « La photographie au XXe siècle » jusqu'au 30 mars (salle 9)

Audioguide disponible à l'accueil : 3 € supplémentaires`,
    question: "D'après ce document, le musée est fermé…",
    optionA: "tous les week-ends.",
    optionB: "le dimanche et les jours fériés.",
    optionC: "le lundi et les jours fériés.",
    optionD: "le vendredi soir uniquement.",
    correctAnswer: 'C',
  }));

  // Q2 — Horaires gare routière
  qs.push(q(2, 'Q1-7', null, {
    longText:
`GARE ROUTIÈRE CENTRALE — TABLEAU DES DÉPARTS

DESTINATIONS | DÉPART | ARRIVÉE | PRIX ALLER

Yaoundé        | 06:00  | 14:00   | 8 500 FCFA
Yaoundé        | 22:00  | 06:00   | 8 500 FCFA
Bafoussam      | 07:30  | 13:00   | 6 000 FCFA
Bafoussam      | 15:00  | 20:30   | 6 000 FCFA
Kribi          | 09:00  | 15:30   | 5 500 FCFA
Garoua         | 05:00  | 23:00   | 14 000 FCFA

Réservations : guichets ouverts 5 h 00 – 23 h 00
Arrivée conseillée 30 min avant le départ`,
    question: "D'après ce tableau, quel est le trajet le plus cher ?",
    optionA: "Yaoundé.",
    optionB: "Bafoussam.",
    optionC: "Kribi.",
    optionD: "Garoua.",
    correctAnswer: 'D',
  }));

  // Q3 — Mode d'emploi glucomètre
  qs.push(q(3, 'Q1-7', null, {
    longText:
`GLUCOMÈTRE ACCU-CHECK COMPACT — MODE D'EMPLOI RAPIDE

1. Insérez une bandelette réactive dans l'appareil.
2. Utilisez le stylo autopiqueur sur le côté du doigt (éviter le bout).
3. Déposez immédiatement une goutte de sang sur la zone de dépôt de la bandelette.
4. Lisez le résultat en 5 secondes sur l'écran.
5. Notez le résultat dans votre carnet de glycémie avec l'heure.

VALEURS DE RÉFÉRENCE :
• À jeun : 0,70 – 1,10 g/L (normal)
• Après repas (2h) : < 1,40 g/L (normal)
• > 2,00 g/L : consultez votre médecin immédiatement.`,
    question: "Selon ce guide, où doit-on effectuer la piqûre ?",
    optionA: "Au bout du doigt pour plus de précision.",
    optionB: "Sur le côté du doigt.",
    optionC: "Dans le pli du coude.",
    optionD: "Sur le lobe de l'oreille.",
    correctAnswer: 'B',
  }));

  // Q4 — Programme festival culturel
  qs.push(q(4, 'Q1-7', null, {
    longText:
`FESTIVAL CULTUREL DES PEUPLES — 10e ÉDITION
Du 18 au 22 juillet — Place de la Nation

PROGRAMME :
Vendredi 18 : Cérémonie d'ouverture — Défilé des nations — 19 h 00
Samedi 19 : Journée des arts visuels — Expositions, démonstrations de peinture
Dimanche 20 : Festival gastronomique — 50 stands de cuisines du monde — 11 h–22 h
Lundi 21 : Journée musicale — Concerts scènes principale et secondaire
Mardi 22 : Clôture — Grand spectacle son et lumière — 21 h 00 (gratuit)

Entrée générale : 5 € | Pass 5 jours : 18 € | Enfants –12 ans gratuits`,
    question: "Selon ce programme, quel événement est gratuit ?",
    optionA: "Le défilé des nations du vendredi.",
    optionB: "L'exposition d'arts visuels du samedi.",
    optionC: "Le spectacle son et lumière de clôture.",
    optionD: "Le festival gastronomique du dimanche.",
    correctAnswer: 'C',
  }));

  // Q5 — Petite annonce vente livres jeunesse
  qs.push(q(5, 'Q1-7', null, {
    longText:
`VENTE LIVRES JEUNESSE — Très bon état

Suite au tri de notre bibliothèque familiale, nous vendons un ensemble de livres pour enfants :
• Albums illustrés (2-5 ans) : 30 titres — 1 € à 2 € pièce
• Romans jeunesse (8-12 ans) : 45 titres (Roald Dahl, R.L. Stine, Charlotte Bousquet) — 2 € à 3 € pièce
• Bandes dessinées (Astérix, Tintin, Lucky Luke) : 20 albums — 3 € pièce
• Encyclopédies illustrées (sciences, nature, histoire) : 8 volumes — 5 € pièce

Vente en lot possible avec remise. Pas d'envoi postal — enlèvement uniquement.
Contact : Mme Renard — 06 77 88 99 00 — Photos sur demande`,
    question: "Cette annonce propose des livres jeunesse…",
    optionA: "à la location pour l'été.",
    optionB: "à la vente, uniquement en enlèvement.",
    optionC: "en échange contre d'autres livres.",
    optionD: "à la vente avec livraison à domicile.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué santé publique (vaccination)
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — DIRECTION RÉGIONALE DE SANTÉ PUBLIQUE
Campagne de vaccination contre la grippe saisonnière 2025-2026

La campagne de vaccination antigrippale est ouverte du 15 octobre au 31 janvier.

POPULATIONS PRIORITAIRES (vaccin gratuit sur ordonnance) :
• Personnes âgées de 65 ans et plus
• Femmes enceintes (quel que soit le trimestre)
• Personnes atteintes de maladies chroniques (diabète, insuffisance cardiaque, BPCO)
• Professionnels de santé en contact avec des patients

VACCINATION : Disponible chez votre médecin généraliste, en pharmacie habilitée ou dans les centres de vaccination.

La grippe cause chaque année entre 8 000 et 14 000 décès en France. Se vacciner protège aussi les personnes fragiles de son entourage.`,
    question: "Selon ce communiqué, le vaccin grippe est gratuit pour…",
    optionA: "toute personne qui le demande.",
    optionB: "uniquement les personnes de plus de 75 ans.",
    optionC: "les populations prioritaires sur ordonnance.",
    optionD: "les enfants de moins de 6 ans uniquement.",
    correctAnswer: 'C',
  }));

  // Q7 — Courrier d'excuse professionnelle
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Objet : Excuses pour le retard de livraison — Commande n° 2025-4872

Madame, Monsieur,

Nous tenons à vous présenter nos sincères excuses pour le retard de livraison de votre commande, initialement prévue le 10 mars.

En raison d'une défaillance technique chez notre transporteur partenaire, votre colis a subi un retard de 5 jours ouvrables. Nous avons résolu le problème et votre commande vous parviendra au plus tard le 18 mars.

En compensation de ce désagrément, nous vous offrons un bon d'achat de 15 € valable sur votre prochain achat, sans minimum de commande.

Veuillez accepter, Madame, Monsieur, nos excuses renouvelées.
Service Client — ButikOnline`,
    question: "L'objet de ce courrier est de…",
    optionA: "confirmer la réception d'une commande.",
    optionB: "annoncer l'annulation d'une livraison.",
    optionC: "s'excuser pour un retard de livraison.",
    optionD: "demander de retourner un colis endommagé.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin a prescrit un antibiotique après avoir identifié la ___ responsable de l'infection pulmonaire du patient.",
    question: PHRASE_Q,
    optionA: "virus",
    optionB: "bactérie",
    optionC: "fièvre",
    optionD: "allergie",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La galerie a organisé un ___ pour présenter les nouvelles œuvres de l'artiste avant l'ouverture officielle de l'exposition au grand public.",
    question: PHRASE_Q,
    optionA: "concert",
    optionB: "vernissage",
    optionC: "défilé",
    optionD: "atelier",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Durant la période des ___, les commerçants proposent des réductions importantes pour écouler leurs stocks de la saison écoulée.",
    question: PHRASE_Q,
    optionA: "promotions",
    optionB: "fêtes",
    optionC: "soldes",
    optionD: "ventes",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ du roman policier, avec ses rebondissements inattendus, maintient le lecteur en haleine jusqu'à la révélation finale.",
    question: PHRASE_Q,
    optionA: "prose",
    optionB: "narration",
    optionC: "intrigue",
    optionD: "structure",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les voyageurs doivent se présenter au quai de départ 15 minutes avant l'heure prévue pour ne pas rater leur bus en ___ vers Paris.",
    question: PHRASE_Q,
    optionA: "direction",
    optionB: "partance",
    optionC: "route",
    optionD: "correspondance",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le patient a reçu une ___ générale avant l'opération pour ne ressentir aucune douleur pendant l'intervention chirurgicale.",
    question: PHRASE_Q,
    optionA: "injection",
    optionB: "anesthésie",
    optionC: "perfusion",
    optionD: "sédation",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La médecine préventive repose sur le [14] précoce des maladies avant l'apparition des symptômes. Des examens réguliers permettent d'identifier les personnes à risque et d'agir avant la progression de la maladie. Les principaux [15] de risque identifiés sont l'alimentation déséquilibrée, le tabagisme, l'inactivité physique et le stress chronique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La médecine préventive",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "diagnostic",
    optionB: "dépistage",
    optionC: "traitement",
    optionD: "contrôle",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La médecine préventive",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "indicateurs",
    optionB: "symptômes",
    optionC: "facteurs",
    optionD: "signes",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "La politique culturelle municipale joue un rôle essentiel dans l'accessibilité des arts. Les associations culturelles bénéficient de [16] publiques pour financer leurs projets. En parallèle, le développement du [17] privé permet à des entreprises de soutenir la culture en échange d'avantages fiscaux.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La politique culturelle municipale",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "dons",
    optionB: "subventions",
    optionC: "prêts",
    optionD: "recettes",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La politique culturelle municipale",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "bénévolat",
    optionB: "commerce",
    optionC: "mécénat",
    optionD: "financement",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel commerce vend uniquement des produits issus de l'agriculture biologique certifiée ?",
    optionA: "Commerce 1",
    optionB: "Commerce 2",
    optionC: "Commerce 3",
    optionD: "Commerce 4",
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel genre littéraire pour enfants contient une morale et est souvent illustré ?",
    optionA: "Genre 1",
    optionB: "Genre 2",
    optionC: "Genre 3",
    optionD: "Genre 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel type de musée préserve le patrimoine rural vivant en plein air ?",
    optionA: "Musée 1",
    optionB: "Musée 2",
    optionC: "Musée 3",
    optionD: "Musée 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel examen médical utilise des ondes magnétiques sans rayonnement ionisant ?",
    optionA: "Examen 1",
    optionB: "Examen 2",
    optionC: "Examen 3",
    optionD: "Examen 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le service des urgences a enregistré le plus grand nombre d'admissions au 3e trimestre avec une hausse de 23 % liée aux accidents estivaux. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Guide du patient — Centre Hospitalier Sainte-Croix",
    longText: DOC_GUIDE_PATIENT,
    question: "Selon ce guide, un patient peut accéder à son dossier médical…",
    optionA: "Immédiatement sur simple demande verbale.",
    optionB: "Sur demande écrite dans un délai légal de 8 jours.",
    optionC: "Uniquement après sa sortie de l'hôpital.",
    optionD: "Uniquement avec l'accord du médecin traitant.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Guide du patient — Centre Hospitalier Sainte-Croix",
    longText: DOC_GUIDE_PATIENT,
    question: "Parmi les obligations du patient, on trouve…",
    optionA: "Payer l'intégralité des soins avant chaque acte.",
    optionB: "Informer les équipes de tout changement de traitement ou d'allergie.",
    optionC: "Signer un formulaire de consentement pour chaque visite.",
    optionD: "Respecter une alimentation prescrite par l'établissement.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Infirmier(ère) spécialisé(e) de bloc opératoire",
    longText: DOC_OFFRE_EMPLOI_INFIRMIER,
    question: "En plus du Diplôme d'État d'infirmier, quel diplôme spécifique est requis pour ce poste ?",
    optionA: "Diplôme de cadre de santé.",
    optionB: "Diplôme d'Infirmier de Bloc Opératoire (IBODE).",
    optionC: "Diplôme de puéricultrice.",
    optionD: "Master en sciences infirmières.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Infirmier(ère) spécialisé(e) de bloc opératoire",
    longText: DOC_OFFRE_EMPLOI_INFIRMIER,
    question: "Parmi les avantages mentionnés dans cette offre, on trouve…",
    optionA: "Un logement de fonction proche de l'hôpital.",
    optionB: "Un accès aux formations continues du CHR.",
    optionC: "Une voiture de service pour les visites à domicile.",
    optionD: "Un intéressement aux résultats financiers.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement — Bibliothèque municipale des Sources",
    longText: DOC_REGLEMENT_BIBLIO,
    question: "Selon le règlement, les revues à la bibliothèque…",
    optionA: "Peuvent être empruntées pour 1 semaine.",
    optionB: "Sont accessibles uniquement sur consultation sur place.",
    optionC: "Sont disponibles en version numérique pour l'emprunt.",
    optionD: "Peuvent être empruntées avec un abonnement premium.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement — Bibliothèque municipale des Sources",
    longText: DOC_REGLEMENT_BIBLIO,
    question: "Selon le règlement, quelle est la pénalité en cas de retard ?",
    optionA: "0,10 € par document et par jour.",
    optionB: "0,15 € par document et par jour calendaire.",
    optionC: "1 € par semaine de retard.",
    optionD: "5 € de forfait après 7 jours de retard.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Contrat d'abonnement annuel — Musée Cité des Arts",
    longText: DOC_CONTRAT_ABONNEMENT_MUSEE,
    question: "Selon ce contrat, l'accompagnateur gratuit par visite est valable…",
    optionA: "Pour toutes les expositions, permanentes et temporaires.",
    optionB: "Hors expositions temporaires.",
    optionC: "Uniquement pour les vernissages.",
    optionD: "Pour les visites guidées uniquement.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Contrat d'abonnement annuel — Musée Cité des Arts",
    longText: DOC_CONTRAT_ABONNEMENT_MUSEE,
    question: "Selon le contrat, cet abonnement est…",
    optionA: "Transférable à un membre de la famille.",
    optionB: "Valable dans tous les musées partenaires.",
    optionC: "Non cessible et valable uniquement pour le titulaire.",
    optionD: "Remboursable dans les 14 jours suivant l'adhésion.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note interne — Gestion des stocks pharmacie",
    longText: DOC_NOTE_PHARMACIE,
    question: "Selon cette note, qui a accès à l'armoire des médicaments à risque ?",
    optionA: "Tous les membres du personnel soignant.",
    optionB: "Les pharmaciens diplômés uniquement.",
    optionC: "Les infirmiers de nuit uniquement.",
    optionD: "Le responsable de pharmacie et les médecins prescripteurs.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note interne — Gestion des stocks pharmacie",
    longText: DOC_NOTE_PHARMACIE,
    question: "Pour les médicaments à marge thérapeutique étroite, la note exige…",
    optionA: "Une prescription systématique du médecin-chef.",
    optionB: "Une double vérification par deux professionnels.",
    optionC: "Un stockage dans un réfrigérateur sécurisé.",
    optionD: "Une traçabilité numérique par code-barres.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Les déserts médicaux en zone rurale",
    longText: ART_DESERTS_MEDICAUX,
    question: "Selon cet article, combien de personnes vivent en zone de faible densité médicale en France ?",
    optionA: "Environ 2 millions.",
    optionB: "Environ 4 millions.",
    optionC: "Environ 6 millions.",
    optionD: "Environ 10 millions.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Les déserts médicaux en zone rurale",
    longText: ART_DESERTS_MEDICAUX,
    question: "L'article mentionne comme solution ayant montré son efficacité…",
    optionA: "L'obligation légale d'installation en zone rurale.",
    optionB: "Les maisons de santé pluriprofessionnelles.",
    optionC: "La formation spécialisée des médecins ruraux.",
    optionD: "Le remboursement intégral des soins en zone sous-dotée.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'industrie culturelle face à la mondialisation",
    longText: ART_CULTURE_MONDIALISATION,
    question: "Selon l'article, quel mécanisme européen protège la culture de la concurrence commerciale mondiale ?",
    optionA: "Le droit d'auteur renforcé.",
    optionB: "L'exception culturelle.",
    optionC: "Le label culturel européen.",
    optionD: "La taxe sur les plateformes numériques.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'industrie culturelle face à la mondialisation",
    longText: ART_CULTURE_MONDIALISATION,
    question: "L'auteur conclut que la diversité culturelle…",
    optionA: "Peut être entièrement préservée par les forces du marché.",
    optionB: "Nécessite des politiques volontaristes qui ne peuvent être laissées au marché.",
    optionC: "Est menacée uniquement par les plateformes américaines.",
    optionD: "Est en plein essor grâce à internet et au streaming.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La gestion des transports urbains",
    longText: ART_TRANSPORTS_URBAINS,
    question: "Selon l'article, quelles villes ont mis en place des péages urbains ?",
    optionA: "Paris et Berlin.",
    optionB: "Londres et Stockholm.",
    optionC: "Amsterdam et Tokyo.",
    optionD: "New York et Singapour.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La gestion des transports urbains",
    longText: ART_TRANSPORTS_URBAINS,
    question: "D'après l'article, le vélo connaît une renaissance grâce à…",
    optionA: "La suppression des voies automobiles dans les centres.",
    optionB: "Les pistes cyclables sécurisées et les vélos à assistance électrique.",
    optionC: "Les campagnes de sensibilisation environnementales.",
    optionD: "La hausse du prix de l'essence.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Les nouvelles technologies en chirurgie",
    longText: ART_CHIRURGIE_NOUVELLES_TECH,
    question: "Selon l'article, quelle innovation la chirurgie robotique Da Vinci permet-elle ?",
    optionA: "Des opérations entièrement automatisées sans chirurgien.",
    optionB: "Des instruments à 7 degrés de liberté avec filtrage des tremblements.",
    optionC: "La chirurgie à distance via internet.",
    optionD: "Des opérations sans anesthésie générale.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Les nouvelles technologies en chirurgie",
    longText: ART_CHIRURGIE_NOUVELLES_TECH,
    question: "L'article mentionne l'impression 3D en chirurgie pour…",
    optionA: "La fabrication de médicaments sur mesure.",
    optionB: "La production de prothèses et guides adaptés à l'anatomie du patient.",
    optionC: "L'impression des dossiers médicaux en 3D.",
    optionD: "La simulation virtuelle des opérations avant intervention.",
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
    console.log(`\n✅ ${created} questions créées pour CE 18.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
