'use strict';
/**
 * seed-ce-serie8.js
 * Peuple la série CE 8 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie8.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoetw00040wxl09snqo9k';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : bar-chart — chute brutale au T4 ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [88, 82, 78, 20], color: '#003087' }, // CORRECT
    { label: 'Graphique 2', data: [40, 55, 72, 90], color: '#E30613' }, // croissance
    { label: 'Graphique 3', data: [60, 58, 62, 60], color: '#E30613' }, // stable
    { label: 'Graphique 4', data: [50, 88, 52, 50], color: '#E30613' }, // pic T2
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['T1', 'T2', 'T3', 'T4'];
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Ventes (unités)</text>`;
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
  { title: 'Appartement 1', content: "T3 en colocation — 90 m², 3 chambres. Loyer par chambre : 450 €/mois charges comprises. Accès internet très haut débit. Station de métro ligne 4 à 10 minutes à pied. Disponible le 1er mars. Contact : coloc-lyon@mail.fr." },
  { title: 'Appartement 2', content: "Studio meublé — 28 m², 4e étage avec ascenseur. Loyer 720 €/mois charges comprises. Cuisine équipée, salle de bains rénovée. À 2 minutes à pied de la station de métro Bellecour. Disponible immédiatement. Contact agence : 04 78 22 11 00." },
  { title: 'Appartement 3', content: "T2 non meublé — 45 m², rez-de-chaussée, jardin partagé. Loyer 590 €/mois hors charges. Bus ligne 25 à 5 minutes. Parking inclus. Disponible le 1er avril. Visites week-end uniquement. Contact : 06 33 44 55 66." },
  { title: 'Appartement 4', content: "Chambre dans appartement partagé — 15 m², non meublée. Loyer 320 €/mois charges incluses. Cuisine et salon communs. Tramway ligne 2 à 8 minutes à pied. Disponible sous 15 jours. Préférence étudiant(e). Contact : 07 88 99 00 11." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Compagnie 1', content: "EasyJet — Vols Paris-Madrid : 3 vols par semaine (lundi, mercredi, vendredi). Prix à partir de 39 €. Bagage en soute payant (18 €). Un bagage cabine 55×40×20 cm inclus dans tous les tarifs. Enregistrement en ligne obligatoire." },
  { title: 'Compagnie 2', content: "Ryanair — Vols Paris-Madrid : 5 vols par semaine. Prix à partir de 25 €. Bagage cabine petit format uniquement inclus. Bagage en soute (15 kg) : 28 €. Priority boarding : 8 €. Attention aux frais cachés à l'enregistrement." },
  { title: 'Compagnie 3', content: "Vueling — Vols Paris-Madrid : 4 vols par semaine. Prix à partir de 55 €. Un bagage cabine 55×40×20 cm inclus dans le tarif de base. Repas à bord disponible (supplément). Service client en français disponible 7j/7." },
  { title: 'Compagnie 4', content: "Air France — Vols Paris-Madrid : 7 vols par jour (quotidien). Prix à partir de 149 €. Bagage en soute 23 kg inclus. Repas inclus sur vols de plus de 2 h. Accès lounge Premium possible. Programme de fidélité Flying Blue." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Plan 1', content: "Livret A — Taux : 3 % net, garanti par l'État. Plafond : 22 950 €. Disponibilité : retrait possible à tout moment sans pénalité. Aucuns frais d'ouverture. Exonéré d'impôts et de prélèvements sociaux. Ouvert à tous." },
  { title: 'Plan 2', content: "PEA (Plan d'Épargne en Actions) — Taux : variable selon les marchés financiers. Plafond : 150 000 €. Disponibilité : retrait libre après 5 ans (avant 5 ans : clôture du plan). Avantage fiscal au-delà de 5 ans. Réservé aux résidents fiscaux français." },
  { title: 'Plan 3', content: "Assurance-vie fonds en euros — Taux moyen : 2,5 % nets. Plafond : illimité. Disponibilité : rachats partiels ou totaux possibles à tout moment. Fiscalité avantageuse après 8 ans. Transmission du capital hors succession." },
  { title: 'Plan 4', content: "Compte à terme — Taux : 3 % brut fixe sur 12 mois. Plafond : selon établissement bancaire. Disponibilité : fonds bloqués pendant toute la durée du contrat. Pénalité en cas de retrait anticipé. Idéal pour épargne de court terme." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Cours 1', content: "Français intensif — 1 semaine (lundi au vendredi, 8 h par jour). Niveau : tous niveaux, de A1 à C2. Cours individuels ou petits groupes (max 6 personnes). Certification DELF/DALF préparée. Prix : 800 €/semaine. Disponible toute l'année à Paris." },
  { title: 'Cours 2', content: "Espagnol en ligne — 3 mois, 2 séances de 45 min par semaine. Niveau débutant à intermédiaire. Format 100 % vidéo avec professeur natif. Pas de certification. Prix : 240 € pour les 3 mois. Horaires flexibles selon disponibilité." },
  { title: 'Cours 3', content: "Anglais des affaires — 6 semaines, 3 séances de 1 h par semaine. Format hybride (présentiel + en ligne). Niveau B1 minimum requis. Certificat de fin de formation délivré. Prix : 420 €. Sessions disponibles à Lyon, Bordeaux et en ligne." },
  { title: 'Cours 4', content: "Mandarin niveau débutant — 10 semaines, 2 h par semaine. Format présentiel uniquement, Paris 13e. Groupe max 12 personnes. Introduction à l'écriture des caractères. Aucun prérequis. Prix : 350 €. Inscriptions ouvertes en septembre et janvier." },
]);

/* ── Documents Q23-32 ── */
const DOC_PROGRAMME_INTEGRATION =
`PROGRAMME D'INTÉGRATION DES NOUVELLES RECRUES

Toute nouvelle recrue bénéficie d'une semaine d'intégration structurée dès son premier jour.

Lundi : accueil par la DRH, remise du guide du salarié, visite des locaux et présentation des équipes.
Mardi-mercredi : immersion dans les principaux services (commercial, production, informatique) avec un accompagnateur dédié.
Jeudi : formation sur les outils informatiques internes et les procédures de sécurité.
Vendredi : réunion de synthèse avec le responsable hiérarchique direct et définition des objectifs des 3 premiers mois.

À l'issue de la semaine, la nouvelle recrue complète un questionnaire de satisfaction pour permettre l'amélioration continue du programme.`;

const DOC_NOTE_PROJET =
`NOTE D'AVANCEMENT — PROJET TRANSFORMATION DIGITALE (PTD)

Date : 15 janvier 2025 | Responsable de projet : Mme Aurélie Tissot

Phases réalisées :
• Phase 1 (audit des processus existants) : achevée en octobre 2024.
• Phase 2 (choix des solutions logicielles) : achevée en décembre 2024.

Jalons à venir :
• Déploiement du nouveau CRM : prévu mars 2025.
• Formation des équipes commerciales : avril 2025.
• Mise en production complète : juin 2025.

Risques identifiés : résistance au changement des équipes terrain ; dépendance vis-à-vis du prestataire externe pour le paramétrage. Un plan de communication interne est en cours de rédaction.`;

const DOC_REGLEMENT_STAGIAIRES =
`RÈGLEMENT APPLICABLE AUX STAGIAIRES

Accueil : le stagiaire est accueilli par son tuteur le premier jour et se voit remettre un badge et un accès informatique provisoire valable pour la durée du stage.

Confidentialité : le stagiaire est tenu à la même obligation de discrétion que les salariés permanents concernant les informations commerciales, techniques et financières de l'entreprise.

Horaires : les horaires du stagiaire suivent ceux de l'équipe d'accueil, soit 8 h 30 à 17 h 30 du lundi au vendredi.

Rapport de stage : un rapport de 15 à 25 pages, rédigé par le stagiaire, doit être remis à son tuteur trois semaines avant la fin du stage pour relecture et validation.`;

const DOC_GUIDE_MOBILITE =
`GUIDE DE MOBILITÉ INTERNE

La mobilité interne permet à tout salarié de postuler à un poste vacant dans un autre service ou site de l'entreprise, avant qu'il soit proposé en externe.

Conditions d'éligibilité : avoir au moins 18 mois d'ancienneté dans le poste actuel et avoir obtenu une évaluation annuelle satisfaisante (note ≥ 3/5).

Processus de candidature : adresser sa candidature (CV actualisé + lettre de motivation) au service RH via l'intranet dans les 10 jours ouvrés suivant la publication du poste.

Décision : le service RH informe le candidat de la suite donnée à sa candidature dans un délai maximum de 30 jours ouvrés.`;

const DOC_NOTE_REMBOURSEMENT =
`NOTE SUR LE REMBOURSEMENT DES FRAIS PROFESSIONNELS

Tout déplacement professionnel donne lieu à remboursement sur justificatifs originaux.

Transports : remboursement intégral des billets de train (2e classe) et d'avion (tarif économique). L'utilisation du véhicule personnel est remboursée au barème kilométrique en vigueur.

Hébergement : plafond de 120 € TTC par nuit en province, 180 € TTC à Paris.

Repas : plafond de 25 € TTC par repas, avec justificatif (ticket de restaurant ou facture).

Les notes de frais doivent être transmises au service comptabilité dans les 30 jours suivant le déplacement, accompagnées de tous les justificatifs. Tout dossier incomplet sera retourné sans traitement.`;

/* ── Articles Q33-40 ── */
const ART_DOPAGE =
`LE DOPAGE DANS LE SPORT DE HAUT NIVEAU : ENTRE TOLÉRANCE TACITE ET RÉPRESSION SYMBOLIQUE

Le dopage sportif est vieux comme le sport lui-même. Les athlètes grecs de l'Antiquité consommaient déjà des préparations à base de plantes pour améliorer leurs performances. Mais c'est depuis les années 1960, avec la professionnalisation du sport et l'explosion des enjeux financiers, que le phénomène a pris une dimension systémique.

Les affaires qui ont ébranlé le cyclisme, l'athlétisme ou le tennis ces vingt dernières années ont révélé une réalité souvent plus sombre que les institutions sportives ne voulaient l'admettre. L'affaire Lance Armstrong, le scandale de dopage d'État russe révélé à l'occasion des Jeux de Sotchi, les révélations sur les pratiques dans certaines fédérations d'athlétisme — tout cela dessine un tableau d'une contamination profonde du sport de haut niveau.

Les institutions semblent partagées entre deux logiques contradictoires. D'un côté, des contrôles antidopage de plus en plus sophistiqués, des sanctions renforcées et une rhétorique de tolérance zéro. De l'autre, des médias qui valorisent les performances exceptionnelles sans questionner leur origine, des droits télévisés qui dépendent d'une certaine conception spectaculaire du sport, et des fédérations dont la crédibilité serait menacée par trop de révélations.

La question n'est pas tant de savoir si le dopage existera toujours — il existera probablement — que de décider collectivement quel type de sport nous voulons : un sport spectaculaire mais artificiel, ou un sport plus humain mais moins héroïque.`;

const ART_BIO =
`L'ALIMENTATION BIOLOGIQUE : RÉALITÉ NUTRITIONNELLE ET MYTHE MARKETING

Le marché du bio a connu une croissance spectaculaire en France, passant de quelques dizaines de millions d'euros dans les années 1990 à plus de 13 milliards d'euros en 2023. Ce succès commercial repose sur une promesse simple : manger bio, c'est meilleur pour la santé et pour l'environnement. Mais que dit vraiment la science ?

Sur le plan nutritionnel, les études sont mitigées. Certaines méta-analyses indiquent que les produits biologiques contiennent davantage de certains antioxydants et moins de résidus de pesticides. Mais elles ne trouvent pas de différences significatives en termes de vitamines et de minéraux entre produits bio et conventionnels. La promesse d'une meilleure santé grâce au seul recours au bio n'est donc pas solidement étayée par la recherche.

Sur le plan environnemental, la réalité est plus nuancée que ne le laisse croire l'argument écologique. L'agriculture biologique utilise certes moins de pesticides de synthèse, mais elle est souvent moins productive à surface égale, ce qui implique que l'alimentation de la même population nécessiterait davantage de terres agricoles si elle était entièrement bio. La question de l'efficacité environnementale globale reste donc ouverte.

Ce qui est certain, c'est que le label bio s'est progressivement transformé en argument marketing puissant, exploité par les grandes surfaces et les industriels de l'agroalimentaire. Un produit ultratransformé estampillé « bio » n'est pas nécessairement plus sain qu'un légume cultivé avec soin par un petit agriculteur en agriculture conventionnelle raisonnée.`;

const ART_INTELLIGENCE_COLLECTIVE =
`L'INTELLIGENCE COLLECTIVE DANS LES ORGANISATIONS : UTOPIE MANAGÉRIALE OU LEVIER D'INNOVATION ?

L'intelligence collective est devenue l'un des concepts managériaux les plus en vogue dans le monde de l'entreprise. L'idée centrale est séduisante : un groupe bien organisé peut produire des décisions et des innovations supérieures à celles que produirait n'importe lequel de ses membres individuellement. Des exemples comme Wikipedia, les logiciels libres open-source ou les projets d'innovation participative semblent confirmer cette intuition.

La mise en pratique est cependant plus délicate que la théorie. Les recherches en psychologie sociale identifient plusieurs biais qui peuvent parasiter la délibération collective : la pensée de groupe, qui pousse les individus à se conformer à l'opinion dominante pour éviter les conflits ; la polarisation de groupe, qui tend à radicaliser les positions de départ ; et l'effet de diffusion de responsabilité, qui réduit l'engagement individuel dans les décisions collectives.

Pour que l'intelligence collective tienne ses promesses, elle nécessite des conditions précises : diversité réelle des profils et des perspectives, processus structurés de délibération, culture organisationnelle favorable à la prise de risque et à l'expression des désaccords. Ces conditions ne se décrètent pas — elles se construisent sur des années.

Certaines entreprises y parviennent et en tirent un avantage compétitif réel. D'autres adoptent des formes de participation qui ne sont que cosmétiques, créant une illusion de co-décision sans en avoir les effets. La frontière entre intelligence collective authentique et manipulation managériale n'est pas toujours évidente à tracer.`;

const ART_SOLITUDE =
`LA SOLITUDE MODERNE : ÉPIDÉMIE SILENCIEUSE DANS LES SOCIÉTÉS HYPERCONNECTÉES

La solitude est paradoxalement l'un des maux les plus répandus dans nos sociétés où les individus n'ont jamais été aussi connectés numériquement. Des études récentes menées dans plusieurs pays développés indiquent qu'entre 20 et 30 % de la population se sent chroniquement seule, avec des taux particulièrement élevés chez les jeunes adultes de 18 à 34 ans — une génération pourtant considérée comme native du numérique.

Les conséquences sur la santé sont documentées et préoccupantes. La solitude chronique est associée à un risque accru de maladies cardiovasculaires, de troubles anxieux et dépressifs, de démence et même de mortalité prématurée. Des chercheurs comme Julianne Holt-Lunstad de l'Université Brigham Young ont établi que la solitude représente un facteur de risque pour la santé comparable au tabagisme de 15 cigarettes par jour.

Les causes de cette épidémie silencieuse sont multiples. L'urbanisation et la mobilité géographique fragilisent les réseaux sociaux traditionnels. Les structures familiales se sont transformées, avec une augmentation des ménages unipersonnels. Et paradoxalement, les réseaux sociaux numériques, qui promettaient de rapprocher les individus, semblent parfois contribuer à un sentiment d'isolement en remplaçant les interactions en face à face par des interactions virtuelles superficielles.

Des politiques publiques commencent à prendre la mesure du problème. Au Royaume-Uni, un ministère de la Solitude a été créé en 2018. Des programmes de « prescription sociale » permettent aux médecins généralistes d'orienter leurs patients isolés vers des activités communautaires et des groupes de soutien.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme TV
  qs.push(q(1, 'Q1-7', null, {
    longText:
`GUIDE TV — Lundi 24 mars

TF1 :  20 h 50 — Capitaine Marleau (Policier - Tous publics)
       22 h 55 — Infos du soir

France 2 : 20 h 55 — Les Secrets de l'Histoire (Documentaire - Tous publics)
           22 h 30 — Élise Lucet — Envoyé Spécial

M6 :   20 h 45 — Pékin Express (Jeu/Aventure - Déconseillé -10 ans)
       22 h 50 — 100 % Mag`,
    question: "Ce document est…",
    optionA: "un abonnement à une chaîne de télévision.",
    optionB: "un programme de télévision pour la soirée.",
    optionC: "une critique télévisuelle d'un journaliste.",
    optionD: "une publicité pour une émission télévisée.",
    correctAnswer: 'B',
  }));

  // Q2 — Bulletin météo maritime
  qs.push(q(2, 'Q1-7', null, {
    longText:
`MÉTÉO MARINE — Bulletin pour les plaisanciers et professionnels

Zone FINISTÈRE SUD — Samedi 29 mars 2025

Vent : nord-ouest 5 à 7 Beaufort (25 à 55 km/h), rafales à 65 km/h en pointe.
État de la mer : agitée à forte. Houle de secteur ouest, 2 à 3 mètres.
Visibilité : bonne, localement réduite par des averses en fin de journée.
Températures : air 10 °C / mer 12 °C.

Sortie en mer déconseillée pour les embarcations de moins de 10 mètres.
Prochain bulletin : 06 h 00 dimanche.`,
    question: "Ce document est…",
    optionA: "un article de presse sur une tempête.",
    optionB: "un bulletin météo maritime pour les navigateurs.",
    optionC: "un règlement de sécurité pour les plages.",
    optionD: "une alerte de protection civile nationale.",
    correctAnswer: 'B',
  }));

  // Q3 — Brochure agence de voyages
  qs.push(q(3, 'Q1-7', null, {
    longText:
`MAROC IMPÉRIAL — Circuit 8 jours / 7 nuits

Découvrez Marrakech, Fès, Meknès et Casablanca !
Départ tous les samedis depuis Paris (vols directs Royal Air Maroc inclus).
Hébergement : hôtels 4 étoiles en demi-pension.
Guide francophone tout au long du séjour.

Inclus : vols A/R, transferts, hébergement DP, visites des sites.
Non inclus : assurance voyage, visa, repas libres, dépenses personnelles.

Prix tout compris à partir de 1 190 € par personne (base chambre double).
Réservation et renseignements : www.voyages-soleil.fr | 01 44 00 55 66`,
    question: "Ce document est…",
    optionA: "un article sur le tourisme au Maroc.",
    optionB: "une offre de voyage tout compris pour le Maroc.",
    optionC: "un guide de voyage à télécharger.",
    optionD: "une facture de séjour touristique.",
    correctAnswer: 'B',
  }));

  // Q4 — Lettre de réclamation client
  qs.push(q(4, 'Q1-7', null, {
    longText:
`Madame, Monsieur,

Suite à ma commande n° 2025-4412 passée le 5 mars dernier sur votre site, je me permets de vous contacter car je n'ai toujours pas reçu ma livraison à ce jour, alors que le délai annoncé était de 5 jours ouvrés.

J'ai tenté de contacter votre service client par téléphone à trois reprises sans succès. Je vous demande donc de bien vouloir m'indiquer où en est ma commande et d'organiser sa livraison dans les meilleurs délais, ou à défaut, de procéder au remboursement intégral.

Dans l'attente de votre réponse, je vous adresse mes cordiales salutations.
Pierre Morin`,
    question: "Ce document est…",
    optionA: "une confirmation de commande en ligne.",
    optionB: "une lettre de réclamation à une entreprise.",
    optionC: "un témoignage de client satisfait.",
    optionD: "une publicité pour un service de livraison.",
    correctAnswer: 'B',
  }));

  // Q5 — Faire-part de naissance
  qs.push(q(5, 'Q1-7', null, {
    longText:
`Thomas et Camille Lefebvre
ont la joie de vous annoncer la naissance de leur fille

ANAÏS

née le jeudi 20 mars 2025 à 9 h 47
pesant 3,420 kg pour 50 cm

Anaïs, sa grande sœur Emma (4 ans) et ses parents
remercient chaleureusement le personnel de la maternité de Nantes.

Adresse : 14 allée des Lilas, 44000 Nantes`,
    question: "Quel est le but de ce document ?",
    optionA: "Annoncer un mariage.",
    optionB: "Informer d'un décès.",
    optionC: "Annoncer une naissance.",
    optionD: "Inviter à une fête de famille.",
    correctAnswer: 'C',
  }));

  // Q6 — Règlement résidence étudiante
  qs.push(q(6, 'Q1-7', null, {
    longText:
`RÉSIDENCE UNIVERSITAIRE VICTOR HUGO — Règlement

Accès : la carte d'accès nominative doit être présentée à chaque entrée. Elle ne peut être prêtée ou cédée.
Visiteurs : les visiteurs sont autorisés de 8 h à 22 h. Ils ne peuvent séjourner la nuit dans les chambres.
Bruit : le silence est obligatoire après 22 h. La musique forte et les rassemblements bruyants sont interdits.
Parties communes : la cuisine et les salles de repos doivent être laissées propres après usage.
Dégradations : tout dommage causé au mobilier ou aux équipements sera facturé à son auteur.`,
    question: "Ce document présente principalement…",
    optionA: "les tarifs de location dans une résidence universitaire.",
    optionB: "les règles de vie en résidence universitaire.",
    optionC: "le programme d'activités pour les résidents.",
    optionD: "les services proposés par la résidence aux étudiants.",
    correctAnswer: 'B',
  }));

  // Q7 — Menu traiteur événements
  qs.push(q(7, 'Q1-7', null, {
    longText:
`TRAITEUR LA BELLE TABLE — Formules événementielles

Formule Cocktail (min. 30 personnes) : canapés variés, mise en bouche chaudes/froides.
À partir de 18 €/personne HT.

Formule Buffet assis (min. 20 personnes) : 3 entrées + 2 plats + 3 desserts.
À partir de 38 €/personne HT.

Formule Repas gastronomique (min. 15 personnes) : 5 services avec accord mets-vins.
À partir de 75 €/personne HT.

Commande minimum 7 jours à l'avance. Livraison incluse dans un rayon de 30 km.
Contact : contact@labelle-table.fr | 05 56 00 44 33`,
    question: "Ce document est…",
    optionA: "le menu d'un restaurant gastronomique.",
    optionB: "une offre de services traiteur pour événements.",
    optionC: "un bon de commande pour un repas d'affaires.",
    optionD: "un règlement intérieur d'une salle de réception.",
    correctAnswer: 'B',
  }));

  // Q8-13
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le rapport annuel doit être ___ à tous les actionnaires avant la tenue de l'assemblée générale.",
    question: PHRASE_Q,
    optionA: "dissimulé",
    optionB: "transmis",
    optionC: "retiré",
    optionD: "annulé",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Suite à une erreur de facturation, le client a ___ un remboursement intégral de la somme trop perçue.",
    question: PHRASE_Q,
    optionA: "refusé",
    optionB: "oublié",
    optionC: "obtenu",
    optionD: "perdu",
    correctAnswer: 'C',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le nouveau règlement entre en ___ à compter du 1er janvier prochain pour tous les salariés.",
    question: PHRASE_Q,
    optionA: "retard",
    optionB: "vigueur",
    optionC: "pause",
    optionD: "question",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'accès au bâtiment est ___ en dehors des heures ouvrables, sauf pour le personnel de sécurité.",
    question: PHRASE_Q,
    optionA: "illimité",
    optionB: "facilité",
    optionC: "interdit",
    optionD: "encouragé",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce chantier doit ___ impérativement aux normes de sécurité imposées par la réglementation en vigueur.",
    question: PHRASE_Q,
    optionA: "négliger",
    optionB: "contester",
    optionC: "se soustraire",
    optionD: "se conformer",
    correctAnswer: 'D',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La réunion prévue ce vendredi est ___ à la semaine prochaine en raison d'un déplacement du directeur.",
    question: PHRASE_Q,
    optionA: "avancée",
    optionB: "reportée",
    optionC: "annulée",
    optionD: "prolongée",
    correctAnswer: 'B',
  }));

  // Q14-17
  const TEXTE_LAC_1 =
    "Pour lutter contre le gaspillage alimentaire, de nombreuses villes françaises ont mis en place des [14] de partage des invendus. Ces initiatives permettent aux commerçants et restaurateurs de distribuer leurs surplus à des associations caritatives plutôt que de les [15].";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La lutte contre le gaspillage alimentaire",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "obstacles",
    optionB: "réseaux",
    optionC: "marchés",
    optionD: "règlements",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La lutte contre le gaspillage alimentaire",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "vendre",
    optionB: "cuisiner",
    optionC: "jeter",
    optionD: "recycler",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le télétravail, largement [16] pendant la pandémie de Covid-19, est depuis devenu une pratique courante dans de nombreuses entreprises. Il offre aux salariés une plus grande [17] dans l'organisation de leur journée de travail, tout en réduisant le temps passé dans les transports.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le télétravail",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "interdit",
    optionB: "critiqué",
    optionC: "expérimenté",
    optionD: "abandonné",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Le télétravail",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "rigidité",
    optionB: "autonomie",
    optionC: "dépendance",
    optionD: "contrainte",
    correctAnswer: 'B',
  }));

  // Q18-21
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel logement est situé à seulement 2 minutes d'une station de métro ?",
    optionA: "Appartement 1",
    optionB: "Appartement 2",
    optionC: "Appartement 3",
    optionD: "Appartement 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle compagnie inclut un bagage cabine standard dans son tarif de base ?",
    optionA: "Compagnie 1",
    optionB: "Compagnie 2",
    optionC: "Compagnie 3",
    optionD: "Compagnie 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel plan d'épargne propose le taux d'intérêt fixe le plus élevé ?",
    optionA: "Plan 1",
    optionB: "Plan 2",
    optionC: "Plan 3",
    optionD: "Plan 4",
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel cours de langue propose une formule intensive sur une semaine ?",
    optionA: "Cours 1",
    optionB: "Cours 2",
    optionC: "Cours 3",
    optionD: "Cours 4",
    correctAnswer: 'A',
  }));

  // Q22
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les ventes de cette boutique s'effondrent brutalement au quatrième trimestre après avoir été stables. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Programme d'intégration des nouvelles recrues",
    longText: DOC_PROGRAMME_INTEGRATION,
    question: "Ce document présente principalement…",
    optionA: "les objectifs annuels de l'entreprise pour ses salariés.",
    optionB: "le déroulement de la semaine d'intégration des nouvelles recrues.",
    optionC: "les critères d'évaluation des candidats en période d'essai.",
    optionD: "un programme de formation continue pour les managers.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Programme d'intégration des nouvelles recrues",
    longText: DOC_PROGRAMME_INTEGRATION,
    question: "Quel est l'objectif de la réunion du vendredi lors de la semaine d'intégration ?",
    optionA: "Présenter les locaux à la nouvelle recrue.",
    optionB: "Former la recrue aux outils informatiques.",
    optionC: "Définir les objectifs des 3 premiers mois avec le responsable.",
    optionD: "Introduire la recrue aux équipes de production.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Note d'avancement — Projet Transformation Digitale",
    longText: DOC_NOTE_PROJET,
    question: "Selon cette note, qu'est-ce qui a déjà été réalisé dans le projet PTD ?",
    optionA: "Le déploiement du nouveau CRM et la formation des équipes.",
    optionB: "L'audit des processus et le choix des solutions logicielles.",
    optionC: "La mise en production complète et la communication interne.",
    optionD: "La formation des équipes commerciales et le paramétrage du système.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Note d'avancement — Projet Transformation Digitale",
    longText: DOC_NOTE_PROJET,
    question: "Parmi les risques identifiés dans la note, on trouve…",
    optionA: "un budget insuffisant et des retards de livraison.",
    optionB: "la résistance au changement des équipes et la dépendance au prestataire.",
    optionC: "un manque de formation des responsables de projet.",
    optionD: "des problèmes de compatibilité avec les systèmes existants.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement applicable aux stagiaires",
    longText: DOC_REGLEMENT_STAGIAIRES,
    question: "Ce document présente principalement…",
    optionA: "les critères de sélection des candidats à un stage.",
    optionB: "les règles applicables aux stagiaires dans l'entreprise.",
    optionC: "les avantages financiers accordés aux stagiaires.",
    optionD: "les procédures de validation des rapports de stage.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement applicable aux stagiaires",
    longText: DOC_REGLEMENT_STAGIAIRES,
    question: "Selon ce règlement, le rapport de stage doit être remis au tuteur…",
    optionA: "le dernier jour du stage.",
    optionB: "une semaine avant la fin du stage.",
    optionC: "trois semaines avant la fin du stage.",
    optionD: "dans les 30 jours après la fin du stage.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide de mobilité interne",
    longText: DOC_GUIDE_MOBILITE,
    question: "Ce document présente principalement…",
    optionA: "les procédures de recrutement externe de l'entreprise.",
    optionB: "les règles permettant à un salarié de changer de poste en interne.",
    optionC: "les conditions de départ anticipé à la retraite.",
    optionD: "les modalités de mutation géographique internationale.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide de mobilité interne",
    longText: DOC_GUIDE_MOBILITE,
    question: "Pour être éligible à la mobilité interne, un salarié doit notamment…",
    optionA: "avoir l'accord de son responsable hiérarchique direct.",
    optionB: "avoir au moins 18 mois d'ancienneté dans son poste actuel.",
    optionC: "être en CDI depuis plus de 3 ans dans l'entreprise.",
    optionD: "ne pas avoir eu d'avertissement disciplinaire récent.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note sur le remboursement des frais professionnels",
    longText: DOC_NOTE_REMBOURSEMENT,
    question: "Ce document informe les salariés principalement sur…",
    optionA: "les conditions d'attribution des primes de déplacement.",
    optionB: "les règles et plafonds de remboursement des frais professionnels.",
    optionC: "les procédures de réservation des billets de transport.",
    optionD: "les obligations fiscales liées aux indemnités de déplacement.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note sur le remboursement des frais professionnels",
    longText: DOC_NOTE_REMBOURSEMENT,
    question: "Selon cette note, quel est le plafond de remboursement d'un repas ?",
    optionA: "18 € TTC",
    optionB: "25 € TTC",
    optionC: "35 € TTC",
    optionD: "50 € TTC",
    correctAnswer: 'B',
  }));

  // Q33-40
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Le dopage dans le sport de haut niveau",
    longText: ART_DOPAGE,
    question: "Selon cet article, depuis quand le dopage a-t-il pris une dimension systémique ?",
    optionA: "Depuis les Jeux Olympiques antiques.",
    optionB: "Depuis les années 1960, avec la professionnalisation du sport.",
    optionC: "Depuis l'affaire Lance Armstrong dans les années 2000.",
    optionD: "Depuis les Jeux de Sotchi en 2014.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Le dopage dans le sport de haut niveau",
    longText: ART_DOPAGE,
    question: "Selon l'auteur, les institutions sportives semblent partagées entre…",
    optionA: "le soutien aux athlètes dopés et la défense du fair-play.",
    optionB: "des politiques de tolérance zéro et des logiques commerciales contradictoires.",
    optionC: "la transparence totale et la protection des droits des athlètes.",
    optionD: "des contrôles trop stricts et une réglementation insuffisante.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'alimentation biologique : réalité nutritionnelle et mythe marketing",
    longText: ART_BIO,
    question: "Selon les études citées dans l'article, les produits biologiques…",
    optionA: "contiennent significativement plus de vitamines que les produits conventionnels.",
    optionB: "présentent moins de résidus de pesticides mais pas nécessairement plus de vitamines.",
    optionC: "sont prouvés plus efficaces pour prévenir les maladies cardiovasculaires.",
    optionD: "ont exactement la même composition nutritionnelle que les produits conventionnels.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'alimentation biologique : réalité nutritionnelle et mythe marketing",
    longText: ART_BIO,
    question: "Concernant l'impact environnemental de l'agriculture biologique, l'auteur affirme que…",
    optionA: "elle est toujours plus respectueuse de l'environnement que l'agriculture conventionnelle.",
    optionB: "sa moindre productivité implique potentiellement davantage de terres agricoles nécessaires.",
    optionC: "elle réduit de 50 % les émissions de gaz à effet de serre par rapport au conventionnel.",
    optionD: "son impact est nul car elle n'utilise aucun intrant chimique.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "L'intelligence collective dans les organisations",
    longText: ART_INTELLIGENCE_COLLECTIVE,
    question: "Parmi les biais identifiés par la psychologie sociale, lequel est mentionné dans l'article ?",
    optionA: "Le biais de confirmation qui rend les individus résistants à tout changement.",
    optionB: "La pensée de groupe qui pousse à se conformer à l'opinion dominante.",
    optionC: "Le biais de supériorité qui incite chacun à surestimer ses compétences.",
    optionD: "L'effet de halo qui favorise les individus les plus charismatiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "L'intelligence collective dans les organisations",
    longText: ART_INTELLIGENCE_COLLECTIVE,
    question: "L'auteur conclut que la frontière entre intelligence collective authentique et manipulation managériale est…",
    optionA: "clairement définie par les recherches en management.",
    optionB: "pas toujours évidente à tracer.",
    optionC: "facilement identifiable grâce à des indicateurs mesurables.",
    optionD: "uniquement déterminée par les résultats financiers de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La solitude moderne : épidémie silencieuse dans les sociétés hyperconnectées",
    longText: ART_SOLITUDE,
    question: "Selon les études citées dans l'article, quelle tranche d'âge présente les taux de solitude chronique les plus élevés ?",
    optionA: "Les personnes de plus de 75 ans vivant seules.",
    optionB: "Les adultes de 35 à 50 ans en milieu de carrière.",
    optionC: "Les jeunes adultes de 18 à 34 ans.",
    optionD: "Les retraités des zones rurales.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La solitude moderne : épidémie silencieuse dans les sociétés hyperconnectées",
    longText: ART_SOLITUDE,
    question: "Selon le chercheur Julianne Holt-Lunstad cité dans l'article, la solitude chronique est comparable en termes de risque pour la santé à…",
    optionA: "une consommation excessive d'alcool.",
    optionB: "un manque total d'activité physique.",
    optionC: "fumer 15 cigarettes par jour.",
    optionD: "une alimentation déséquilibrée pendant 10 ans.",
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
    console.log(`\n✅ ${created} questions créées pour CE 8.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
