'use strict';
/**
 * seed-ce-serie2.js
 * Peuple la série CE 2 avec les 31 questions manquantes (Q1-19, Q21-32).
 * Les Q20 et Q33-40 déjà présentes en base sont conservées.
 * Usage : node scripts/seed-ce-serie2.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmvz3pr4000bnsxlnewdu99g';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de ventes trimestrielles pour Q22
   Commentaire (15 mots) : « Les ventes progressent chaque trimestre et
   atteignent leur maximum au quatrième trimestre. »
   Graphique correct : Graphique 4 → réponse D
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  // 4 bar-chart datasets (Q1→Q4)
  const graphs = [
    { label: 'Graphique 1', data: [85, 72, 58, 40], color: '#E30613' },   // déclin
    { label: 'Graphique 2', data: [50, 85, 52, 55], color: '#E30613' },   // pic Q2
    { label: 'Graphique 3', data: [60, 40, 72, 45], color: '#E30613' },   // irrégulier
    { label: 'Graphique 4', data: [38, 55, 72, 90], color: '#003087' },   // CORRECT: croissance
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const quarters = ['T1', 'T2', 'T3', 'T4'];
  const maxVal   = 100;
  const minVal   = 0;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW  = 50;
    const gap   = (plotW - 4 * barW) / 5;

    // horizontal grid lines (0, 25, 50, 75, 100)
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#6b7280">${v}</text>`;
    }).join('');

    // bars
    const bars = g.data.map((v, i) => {
      const bx  = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh  = ((v / maxVal) * plotH).toFixed(1);
      const by  = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx  = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${quarters[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Ventes (unités)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawBarChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Textes JSON pour Q18, Q19, Q21
───────────────────────────────────────────────────────────────────────────── */

// Q18 — 4 annonces de location : trouver le logement meublé disponible de suite
const TEXTS_Q18 = JSON.stringify([
  { title: 'Logement 1', content: "Studio non meublé, 22 m², 3e étage sans ascenseur. Loyer 430 €/mois, charges non comprises. Caution d'un mois. Disponible à partir du 1er septembre. Idéal pour étudiant. Contact : M. Durand, agence Habitat Plus." },
  { title: 'Logement 2', content: "Appartement 2 pièces entièrement meublé, 38 m², cuisine équipée, salle de bains rénovée. Loyer 780 €/mois, charges comprises. Disponible immédiatement. Bail d'un an renouvelable. Contacter directement le propriétaire au 06 12 34 56 78." },
  { title: 'Logement 3', content: "Grande maison 4 pièces, jardin privatif, garage. Loyer 1 100 €/mois hors charges. Animaux acceptés. Bail de deux ans minimum. Libre en octobre prochain. Visites sur rendez-vous uniquement. Agence Immo Confort." },
  { title: 'Logement 4', content: "Chambre en colocation dans appartement partagé, 12 m², non meublée. Loyer 300 €/mois, charges incluses. Accès cuisine et salle de bains communes. Priorité aux étudiants. Préavis d'un mois." },
]);

// Q19 — 4 activités culturelles : trouver celle à entrée libre
const TEXTS_Q19 = JSON.stringify([
  { title: 'Activité 1', content: "Concert de jazz au Café de la Paix, tous les vendredis soir à 20 h 30. Entrée : 15 € par personne. Réservation conseillée en ligne ou au guichet. Boissons non comprises. Programme complet sur notre site." },
  { title: 'Activité 2', content: "Vernissage de l'exposition « Lumières d'Afrique » à la Galerie du Pont. Ouverture le samedi 14 juin de 18 h à 21 h. Entrée libre et gratuite pour tous. Présence de l'artiste et visite commentée à 19 h." },
  { title: 'Activité 3', content: "Festival International du Film Documentaire — du 8 au 11 mai. Forfait 4 jours : 45 € (tarif réduit : 30 €). Séances individuelles : 10 €. Accréditation presse sur demande. Programme disponible à l'office du tourisme." },
  { title: 'Activité 4', content: "Atelier de poterie initiation, chaque mercredi de 14 h à 16 h, à l'Espace Artisanal du quartier Vieux-Port. Tarif : 28 € par séance, matériel fourni. Inscriptions ouvertes sur le site ou par téléphone au 04 91 00 11 22." },
]);

// Q21 — 4 offres d'emploi : trouver celle qui accepte les débutants
const TEXTS_Q21 = JSON.stringify([
  { title: 'Offre 1', content: "Comptable confirmé(e) — CDI, temps plein. Exigences : diplôme en comptabilité (BTS ou licence), minimum 5 ans d'expérience en cabinet ou entreprise. Maîtrise de Sage et Excel indispensable. Envoi CV + lettre de motivation à recrutement@fiduciaire-est.fr." },
  { title: 'Offre 2', content: "Assistant(e) administratif(ve) junior — CDD 6 mois, temps plein. Aucune expérience exigée, débutants bienvenus. Formation interne assurée. Bonne maîtrise du français écrit requise. Poste à pourvoir immédiatement. CV à envoyer à rh@groupesolaire.com." },
  { title: 'Offre 3', content: "Directeur(trice) Commercial(e) — CDI, statut cadre. Profil recherché : Bac+5 en commerce, 10 ans d'expérience minimum dont 3 ans en management d'équipe. Excellent réseau professionnel attendu. Rémunération attractive selon profil." },
  { title: 'Offre 4', content: "Médecin généraliste — poste libéral à reprendre, secteur rural. Expérience clinique de 3 ans minimum après obtention du diplôme. Patientèle fidélisée, locaux équipés. Collaboration avec hôpital de proximité possible. Renseignements : ARS régionale." },
]);

/* ─────────────────────────────────────────────────────────────────────────────
   Textes des documents administratifs / professionnels (Q23-32)
───────────────────────────────────────────────────────────────────────────── */

const DOC_AIDE_LOGEMENT =
`Le programme d'aide au logement étudiant est destiné aux étudiants inscrits dans un établissement d'enseignement supérieur reconnu, dont les ressources du foyer ne dépassent pas le plafond fixé chaque année par le ministère.

Pour en bénéficier, l'étudiant doit occuper un logement distinct de celui de ses parents, situé dans la commune ou l'agglomération de son établissement. La demande se fait exclusivement en ligne, avant la date limite du 30 novembre de l'année en cours.

Le montant de l'aide est calculé en fonction du loyer et des ressources déclarées. Elle est versée mensuellement, directement sur le compte bancaire du bénéficiaire.`;

const DOC_OFFRE_EMPLOI_ADM =
`Notre entreprise, spécialisée dans la gestion documentaire, recherche un(e) assistant(e) de direction pour son siège social.

Missions principales : gestion du courrier entrant et sortant, organisation des réunions et déplacements, rédaction de comptes rendus, accueil téléphonique.

Profil requis : BTS secrétariat ou gestion, bonne maîtrise de la suite Office, sens de l'organisation et discrétion. Une première expérience est souhaitée mais non obligatoire.

Poste en CDI, 35 h/semaine, salaire selon profil. Avantages : mutuelle prise en charge à 80 %, tickets restaurant, prime annuelle.

Candidatures à adresser avant le 15 du mois à : direction@docu-solutions.fr`;

const DOC_NOTE_SERVICE =
`NOTE DE SERVICE — Direction des Ressources Humaines
Objet : Mise en place du télétravail partiel

À compter du 1er avril, tout salarié en CDI ou CDD d'une durée supérieure à six mois pourra demander à bénéficier de deux jours de télétravail par semaine. Cette mesure ne concerne pas les postes nécessitant une présence physique permanente (accueil, production, logistique).

La demande doit être adressée au responsable hiérarchique direct, qui dispose de quinze jours ouvrables pour y répondre. En cas d'accord, un avenant au contrat de travail sera signé.

Tout salarié en télétravail reste soumis aux mêmes obligations de confidentialité et de disponibilité qu'en présentiel.`;

const DOC_CHARTE_INFO =
`CHARTE D'UTILISATION DES RESSOURCES INFORMATIQUES

Les équipements informatiques mis à disposition par l'entreprise (ordinateurs, téléphones, connexion internet) sont destinés exclusivement à un usage professionnel. Toute utilisation à des fins personnelles doit rester exceptionnelle et ne pas perturber le travail.

Il est strictement interdit de :
• télécharger ou installer des logiciels non autorisés par le service informatique ;
• transmettre des données confidentielles à des tiers sans habilitation ;
• accéder à des sites à caractère illicite ou contraire à l'éthique de l'entreprise.

Tout manquement à cette charte peut entraîner des sanctions disciplinaires pouvant aller jusqu'au licenciement.`;

const DOC_REGLEMENT_BIBLIO =
`RÈGLEMENT INTÉRIEUR — MÉDIATHÈQUE DU GRAND PARC

La médiathèque est ouverte à tous les résidents de la communauté de communes sur simple présentation d'une pièce d'identité. L'inscription est gratuite.

Les emprunteurs peuvent emprunter jusqu'à cinq documents simultanément pour une durée de trois semaines, renouvelable une fois en ligne ou sur place. Les CD et DVD sont limités à deux par emprunt, pour une durée d'une semaine non renouvelable.

Tout document rendu en retard fait l'objet d'une pénalité de 0,10 € par document et par jour calendaire. En cas de perte ou de détérioration, l'emprunteur est tenu de rembourser le coût de remplacement.`;

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
   Construction des 31 questions manquantes
───────────────────────────────────────────────────────────────────────────── */
function buildQuestions() {
  const qs = [];

  /* ── Q1-7 : Documents de la vie quotidienne ──────────────────────────── */

  // Q1 — Affiche de spectacle / programme de soirée
  qs.push(q(1, 'Q1-7', null, {
    longText:
`THÉÂTRE DES LUMIÈRES

Vendredi 7 juin — 20 h 30
CABARET DE L'ESPOIR
Chansons françaises et humour
Durée : 1 h 45 (sans entracte)

Tarifs : 18 € / réduit 12 € (étudiants, seniors)
Réservation : billetterie@theatrelumières.fr
ou au 04 67 00 12 34`,
    question: 'Ce document est…',
    optionA: 'une critique de spectacle.',
    optionB: 'un programme de théâtre.',
    optionC: "un article de journal.",
    optionD: "une publicité pour un cinéma.",
    correctAnswer: 'B',
  }));

  // Q2 — Menu de restaurant
  qs.push(q(2, 'Q1-7', null, {
    longText:
`RESTAURANT LE SAVOYARD — Menu du jour 14 €

Entrée au choix :
• Salade verte au chèvre chaud
• Soupe à l'oignon gratinée

Plat au choix :
• Tartiflette savoyarde (végétarien)
• Escalope de veau à la crème

Dessert : Mousse au chocolat maison
Boisson non comprise`,
    question: "D'après ce document, ce restaurant propose…",
    optionA: "une carte fixe sans menu du jour.",
    optionB: "un repas complet à prix fixe.",
    optionC: "uniquement des plats végétariens.",
    optionD: "un menu incluant la boisson.",
    correctAnswer: 'B',
  }));

  // Q3 — Annonce immobilière
  qs.push(q(3, 'Q1-7', null, {
    longText:
`À VENDRE — Appartement T3 — Bordeaux Chartrons

Surface : 68 m² — 3e étage avec ascenseur
2 chambres, séjour lumineux, cuisine ouverte équipée
Balcon 6 m² plein sud — Cave et parking en sous-sol
DPE : B — Charges de copropriété : 120 €/mois
Prix : 298 000 € (négociable)
Visite sur RDV : 06 45 78 23 10`,
    question: "Ce document est…",
    optionA: "une annonce de location.",
    optionB: "un contrat de vente.",
    optionC: "une annonce de vente immobilière.",
    optionD: "un avis d'imposition.",
    correctAnswer: 'C',
  }));

  // Q4 — Règlement de bibliothèque / carte
  qs.push(q(4, 'Q1-7', null, {
    longText:
`MÉDIATHÈQUE MUNICIPALE — Carte d'abonné

Conditions d'utilisation :
Présentez cette carte à chaque emprunt.
En cas de perte, signalez-le immédiatement à l'accueil.
La carte est personnelle et non transférable.
Validité : 1 an — Renouvellement gratuit sur place ou en ligne.

Retards : 0,10 €/jour/document
Renseignements : 03 20 11 44 55`,
    question: "Ce document précise que la carte est…",
    optionA: "valable dans plusieurs communes.",
    optionB: "payante chaque année.",
    optionC: "personnelle et non cessible.",
    optionD: "acceptée dans les librairies partenaires.",
    correctAnswer: 'C',
  }));

  // Q5 — Bulletin météo
  qs.push(q(5, 'Q1-7', null, {
    longText:
`MÉTÉO RÉGIONALE — Samedi 22 mars

Matin : ciel couvert, quelques averses possibles sur le littoral. Températures fraîches : 8 à 12 °C.

Après-midi : éclaircies progressives de l'ouest vers l'est. Vent modéré de 30 à 50 km/h. Maximum : 15 °C.

Soir : retour de la pluie sur l'ensemble de la région. Minimales nocturnes : 6 °C.`,
    question: "D'après ce bulletin météo, dans l'après-midi…",
    optionA: "il neigera sur tout le territoire.",
    optionB: "le temps sera ensoleillé toute la journée.",
    optionC: "des éclaircies apparaîtront progressivement.",
    optionD: "les températures dépasseront 20 °C.",
    correctAnswer: 'C',
  }));

  // Q6 — Mode d'emploi / instructions produit
  qs.push(q(6, 'Q1-7', null, {
    longText:
`MACHINE À CAFÉ EXPRESSO — MISE EN ROUTE

1. Remplissez le réservoir d'eau (max. 1,5 L) avec de l'eau froide du robinet.
2. Insérez une capsule compatible dans le compartiment prévu.
3. Placez votre tasse sous le bec verseur.
4. Appuyez sur le bouton MARCHE et attendez le signal sonore.

⚠ Ne jamais utiliser d'eau chaude. Ne pas dépasser la dose maximale indiquée.`,
    question: "Ce document est…",
    optionA: "une recette de boisson chaude.",
    optionB: "une notice d'utilisation d'appareil.",
    optionC: "une publicité pour une cafétéria.",
    optionD: "un bon de garantie.",
    correctAnswer: 'B',
  }));

  // Q7 — Courrier personnel (carte d'invitation)
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Chers amis,

Nous avons la joie de vous annoncer que notre fils Théo fêtera ses 18 ans le samedi 5 juillet prochain.

Pour marquer cet événement, nous vous invitons à nous rejoindre pour un dîner dans notre jardin à partir de 19 h 30.

Merci de confirmer votre présence avant le 25 juin.
À très bientôt !
Martine et Bertrand`,
    question: "Quel est le but de ce courrier ?",
    optionA: "Annoncer un mariage.",
    optionB: "Inviter des amis à un anniversaire.",
    optionC: "Remercier des invités après une fête.",
    optionD: "Informer d'un changement d'adresse.",
    correctAnswer: 'B',
  }));

  /* ── Q8-13 : Phrases lacunaires (vocabulaire) ───────────────────────── */

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les candidats sont priés de ___ leur dossier de candidature avant la date limite indiquée.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "préparer",
    optionB: "soumettre",
    optionC: "récupérer",
    optionD: "corriger",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce médicament est ___ uniquement sur présentation d'une ordonnance médicale valide.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "vendu",
    optionB: "refusé",
    optionC: "délivré",
    optionD: "conseillé",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "En raison d'une panne sur la ligne, le train accusera un ___ d'environ vingt minutes.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "avance",
    optionB: "pause",
    optionC: "retard",
    optionD: "arrêt",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le musée sera ___ exceptionnellement ce lundi 14 juillet pour cause de jour férié.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "ouvert",
    optionB: "fermé",
    optionC: "complet",
    optionD: "déplacé",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant de signer le contrat, veuillez lire attentivement les ___ générales de vente.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "informations",
    optionB: "factures",
    optionC: "conditions",
    optionD: "demandes",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce produit contient des traces de noix : les personnes ___ doivent éviter de le consommer.",
    question: "Quel mot complète correctement la phrase ?",
    optionA: "minces",
    optionB: "allergiques",
    optionC: "sportives",
    optionD: "âgées",
    correctAnswer: 'B',
  }));

  /* ── Q14-17 : Textes lacunaires (2 textes × 2 questions) ────────────── */

  // Texte 1 (Q14-15) — Usage du smartphone
  const TEXTE_LACUNAIRE_1 =
    "Les téléphones intelligents font désormais partie de notre vie quotidienne. Cet [14] nous permet de communiquer, de nous informer et de nous divertir en permanence. Toutefois, de nombreux spécialistes alertent sur les [15] d'une utilisation excessive, notamment les troubles du sommeil et la dépendance numérique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le téléphone intelligent',
    longText: TEXTE_LACUNAIRE_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "logiciel",
    optionB: "appareil",
    optionC: "réseau",
    optionD: "service",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le téléphone intelligent',
    longText: TEXTE_LACUNAIRE_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "bienfaits",
    optionB: "avantages",
    optionC: "risques",
    optionD: "résultats",
    correctAnswer: 'C',
  }));

  // Texte 2 (Q16-17) — Gastronomie française
  const TEXTE_LACUNAIRE_2 =
    "La cuisine française est reconnue dans le monde entier pour sa [16]. Chaque région possède ses propres spécialités, des fromages normands aux vins bordelais. Cette [17] culinaire est même inscrite au patrimoine culturel immatériel de l'UNESCO depuis l'année 2010.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La gastronomie française',
    longText: TEXTE_LACUNAIRE_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "simplicité",
    optionB: "richesse",
    optionC: "rapidité",
    optionD: "modernité",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La gastronomie française',
    longText: TEXTE_LACUNAIRE_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "tradition",
    optionB: "tendance",
    optionC: "industrie",
    optionD: "science",
    correctAnswer: 'A',
  }));

  /* ── Q18-21 : Lecture rapide de textes (4 séries) ──────────────────── */

  // Q18 — logements : lequel est meublé et disponible immédiatement ?
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel logement est entièrement meublé et disponible immédiatement ?",
    optionA: "Logement 1",
    optionB: "Logement 2",
    optionC: "Logement 3",
    optionD: "Logement 4",
    correctAnswer: 'B',
  }));

  // Q19 — activités culturelles : laquelle est gratuite ?
  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle activité peut-on pratiquer sans payer d'entrée ?",
    optionA: "Activité 1",
    optionB: "Activité 2",
    optionC: "Activité 3",
    optionD: "Activité 4",
    correctAnswer: 'B',
  }));

  // Q20 already exists in DB — skip

  // Q21 — offres d'emploi : laquelle accepte les débutants ?
  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle offre d'emploi s'adresse aux candidats sans expérience professionnelle ?",
    optionA: "Offre 1",
    optionB: "Offre 2",
    optionC: "Offre 3",
    optionD: "Offre 4",
    correctAnswer: 'B',
  }));

  /* ── Q22 : Lecture rapide de graphiques ─────────────────────────────── */

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question:
      "Quel graphique correspond à la phrase suivante : " +
      "« Les ventes progressent chaque trimestre et atteignent leur maximum au quatrième trimestre. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  /* ── Q23-32 : Documents administratifs et professionnels ────────────── */

  // Doc 1 (Q23-24) — Programme d'aide au logement étudiant
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Aide au logement étudiant",
    longText: DOC_AIDE_LOGEMENT,
    question: "Ce document présente principalement…",
    optionA: "un programme de bourses scolaires.",
    optionB: "une aide financière pour le logement des étudiants.",
    optionC: "un service d'hébergement universitaire.",
    optionD: "un règlement intérieur de résidence étudiante.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Aide au logement étudiant",
    longText: DOC_AIDE_LOGEMENT,
    question: "Pour bénéficier de cette aide, l'étudiant doit obligatoirement…",
    optionA: "être inscrit dans une école privée.",
    optionB: "habiter chez ses parents.",
    optionC: "ne pas dépasser le plafond de ressources fixé.",
    optionD: "avoir obtenu son baccalauréat avec mention.",
    correctAnswer: 'C',
  }));

  // Doc 2 (Q25-26) — Offre d'emploi : assistant(e) de direction
  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Assistant(e) de direction",
    longText: DOC_OFFRE_EMPLOI_ADM,
    question: "Cette entreprise recherche principalement un(e) candidat(e) pour…",
    optionA: "gérer la comptabilité de l'entreprise.",
    optionB: "assurer des tâches administratives et d'organisation.",
    optionC: "animer des réunions commerciales.",
    optionD: "assurer la livraison de documents clients.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Assistant(e) de direction",
    longText: DOC_OFFRE_EMPLOI_ADM,
    question: "Parmi les avantages mentionnés dans l'offre, on trouve…",
    optionA: "un logement de fonction.",
    optionB: "une voiture de service.",
    optionC: "une mutuelle prise en charge à 80 %.",
    optionD: "des congés supplémentaires.",
    correctAnswer: 'C',
  }));

  // Doc 3 (Q27-28) — Note de service sur le télétravail
  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Note de service — Télétravail partiel",
    longText: DOC_NOTE_SERVICE,
    question: "Cette note de service annonce…",
    optionA: "la suppression du travail à domicile.",
    optionB: "la mise en place du télétravail partiel pour certains salariés.",
    optionC: "une réorganisation complète des services de l'entreprise.",
    optionD: "l'obligation de travailler cinq jours par semaine au bureau.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Note de service — Télétravail partiel",
    longText: DOC_NOTE_SERVICE,
    question: "Selon ce document, qui ne peut pas accéder au télétravail ?",
    optionA: "Les salariés en CDI depuis moins d'un an.",
    optionB: "Les salariés dont le poste exige une présence physique permanente.",
    optionC: "Les salariés travaillant à temps partiel.",
    optionD: "Les cadres supérieurs de l'entreprise.",
    correctAnswer: 'B',
  }));

  // Doc 4 (Q29-30) — Charte d'utilisation informatique
  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte d'utilisation des ressources informatiques",
    longText: DOC_CHARTE_INFO,
    question: "L'objectif principal de cette charte est de…",
    optionA: "promouvoir l'achat de nouveaux équipements.",
    optionB: "encadrer l'utilisation professionnelle des outils informatiques.",
    optionC: "interdire tout accès à Internet pendant les heures de travail.",
    optionD: "former les employés à la cybersécurité.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte d'utilisation des ressources informatiques",
    longText: DOC_CHARTE_INFO,
    question: "Selon la charte, installer un logiciel non autorisé est…",
    optionA: "toléré si cela reste occasionnel.",
    optionB: "autorisé après accord du responsable.",
    optionC: "strictement interdit et passible de sanction.",
    optionD: "permis uniquement pour les managers.",
    correctAnswer: 'C',
  }));

  // Doc 5 (Q31-32) — Règlement intérieur médiathèque
  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Médiathèque du Grand Parc",
    longText: DOC_REGLEMENT_BIBLIO,
    question: "Ce document décrit principalement…",
    optionA: "les horaires d'ouverture de la médiathèque.",
    optionB: "les conditions d'inscription et d'emprunt de la médiathèque.",
    optionC: "le catalogue des ouvrages disponibles.",
    optionD: "les tarifs des abonnements annuels.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Médiathèque du Grand Parc",
    longText: DOC_REGLEMENT_BIBLIO,
    question: "Quelle est la durée maximale d'emprunt pour un livre ?",
    optionA: "Une semaine, non renouvelable.",
    optionB: "Deux semaines, renouvelables deux fois.",
    optionC: "Trois semaines, renouvelables une fois.",
    optionD: "Un mois sans renouvellement.",
    correctAnswer: 'C',
  }));

  return qs;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function main() {
  const connectionString = (process.env.DATABASE_URL || '')
    .replace('sslmode=require', 'sslmode=no-verify')
    .replace(':6543/', ':5432/');

  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  try {
    // Supprime UNIQUEMENT les questions manquantes (préserve Q20 et Q33-40)
    const KEEP_ORDERS = [20, 33, 34, 35, 36, 37, 38, 39, 40];
    const deleted = await prisma.question.deleteMany({
      where: {
        seriesId:      SERIES_ID,
        questionOrder: { notIn: KEEP_ORDERS },
      },
    });
    console.log(`🗑  ${deleted.count} ancienne(s) question(s) supprimée(s).`);

    const questions = buildQuestions();
    console.log(`📝 Insertion de ${questions.length} questions…`);

    let inserted = 0;
    for (const data of questions) {
      await prisma.question.create({ data });
      process.stdout.write(`   ✔ Q${data.questionOrder}\r`);
      inserted++;
    }

    console.log(`\n✅ ${inserted} questions insérées avec succès dans CE Série 2.`);

    // Vérification finale
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total questions CE Série 2 en base : ${total}/40`);

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
