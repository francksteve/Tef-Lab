'use strict';
/**
 * seed-ce-serie4.js
 * Peuple la série CE 4 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie4.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyodzv00000wxl73ryw625';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts trimestriels ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [85, 70, 55, 38], color: '#E30613' },
    { label: 'Graphique 2', data: [50, 88, 52, 48], color: '#E30613' },
    { label: 'Graphique 3', data: [60, 40, 75, 45], color: '#E30613' },
    { label: 'Graphique 4', data: [38, 55, 72, 90], color: '#003087' }, // CORRECT
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
  { title: 'Logement 1', content: "Studio non meublé, 20 m², rez-de-chaussée, sans ascenseur. Loyer 400 €/mois hors charges. Caution d'un mois. Disponible à partir du 1er octobre. Contact agence ImmoPlus au 04 78 00 12 34." },
  { title: 'Logement 2', content: "Appartement 2 pièces entièrement meublé, 35 m², cuisine équipée, séjour lumineux. Loyer 750 €/mois charges comprises. Disponible immédiatement. Bail d'un an renouvelable. Contacter le propriétaire au 06 55 44 33 22." },
  { title: 'Logement 3', content: "Maison 4 pièces avec jardin, garage double. Loyer 1 200 €/mois hors charges. Animaux acceptés. Minimum 2 ans de bail. Libre en novembre prochain. Visites sur rendez-vous uniquement. Agence Côté Maison." },
  { title: 'Logement 4', content: "Chambre en colocation, 14 m², non meublée. Loyer 320 €/mois charges incluses. Accès cuisine et salle de bains communes. Recherche étudiant(e) sérieux(se). Préavis d'un mois requis. Contacter Marie au 07 00 11 22 33." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Activité 1', content: "Soirée jazz au Blue Note Café, tous les jeudis soir à 21 h. Entrée : 12 € par personne. Réservation conseillée par téléphone ou en ligne. Consommation non incluse. Programme complet sur jazz-bluenote.fr." },
  { title: 'Activité 2', content: "Visite guidée du musée des Beaux-Arts, samedi 22 mars à 15 h. Tarif adulte : 9 €, tarif réduit : 5 €. Réservation obligatoire en ligne. Durée : 1 h 30. Accès personnes à mobilité réduite." },
  { title: 'Activité 3', content: "Journée Portes Ouvertes au Jardin Botanique, dimanche 6 avril de 9 h à 18 h. Entrée entièrement gratuite pour tous les visiteurs. Ateliers nature pour enfants, promenades commentées. Accès en tramway ligne 2." },
  { title: 'Activité 4', content: "Cours de salsa initiation, chaque mardi de 19 h à 20 h 30. Tarif : 25 € par séance ou forfait 10 séances à 200 €. Aucun prérequis. Chaussures adaptées conseillées. Inscriptions sur salsanantes.fr." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Offre 1', content: "Agent de caisse polyvalent(e) — CDI, temps partiel 24 h/semaine. Aucune expérience requise, formation interne assurée. Sens du service et ponctualité essentiels. Travail le week-end obligatoire. Postuler en magasin ou sur jobmarket.fr." },
  { title: 'Offre 2', content: "Responsable de rayon — CDI, temps plein. Expérience de 2 ans minimum en grande distribution exigée. Management d'équipe, suivi des stocks, relation fournisseurs. Rémunération : 2 200 €/mois. CV à envoyer à rh@supercenter.fr." },
  { title: 'Offre 3', content: "Directeur(trice) des Achats — CDI statut cadre. Profil : Bac+5 école de commerce, 8 ans d'expérience dont 3 ans en direction. Maîtrise de l'anglais indispensable. Déplacements fréquents en Europe. Salaire selon profil." },
  { title: 'Offre 4', content: "Infirmier(ère) diplômé(e) — CDD 6 mois, hôpital public. Diplôme d'État exigé, inscription à l'Ordre obligatoire. Expérience en service de médecine interne appréciée. Rémunération grille indiciaire FPH. Dossier à adresser à la DRH." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Abonnement 1', content: "Pack Essentiel — 39 €/mois. Accès piscine olympique et salle de cardio tous les jours de 7 h à 22 h. Cours collectifs : 2 par semaine inclus. Pas d'accès aux équipements bien-être. Sans engagement, résiliation à tout moment." },
  { title: 'Abonnement 2', content: "Pack Confort — 55 €/mois. Accès illimité à toutes les salles de sport du réseau (15 clubs). Cours collectifs illimités. Accès vestiaires premium. Spa non inclus. Engagement 3 mois minimum, résiliation avec préavis d'un mois." },
  { title: 'Abonnement 3', content: "Pack Sport+ — 70 €/mois. Accès total : piscine, musculation, squash. Cours collectifs illimités incluant yoga et pilates. Coach personnel : 2 séances offertes à l'inscription. Parking gratuit. Engagement 6 mois." },
  { title: 'Abonnement 4', content: "Pack Premium — 95 €/mois. Accès complet à tous les espaces : musculation, piscine, cours collectifs, sauna, hammam et jacuzzi inclus. Serviettes et casier privatif fournis. 1 bilan fitness offert. Engagement 12 mois." },
]);

/* ── Documents Q23-32 ── */
const DOC_AIDE_LOGEMENT_ETU =
`PROGRAMME D'AIDE AU LOGEMENT ÉTUDIANT

Ce programme est destiné aux étudiants inscrits dans un établissement d'enseignement supérieur reconnu par l'État, dont les ressources du foyer n'excèdent pas le plafond fixé annuellement par le ministère chargé du logement.

Pour en bénéficier, l'étudiant doit résider dans un logement distinct du domicile de ses parents, situé dans la commune ou l'agglomération de son établissement. La demande doit être déposée en ligne avant le 30 novembre de chaque année universitaire.

Le montant mensuel de l'aide est calculé selon le loyer acquitté et les ressources déclarées. Il est versé directement sur le compte bancaire de l'étudiant bénéficiaire, chaque mois.`;

const DOC_OFFRE_EMPLOI_ADM =
`OFFRE D'EMPLOI — ASSISTANT(E) DE DIRECTION

Notre société spécialisée dans la gestion documentaire recherche pour son siège social un(e) assistant(e) de direction.

Missions : gestion du courrier entrant et sortant, organisation des réunions et des déplacements, rédaction de comptes rendus, accueil téléphonique et physique des visiteurs.

Profil : BTS secrétariat ou gestion, maîtrise de la suite Office, sens de l'organisation et discrétion professionnelle absolue. Une première expérience est souhaitée mais non rédhibitoire.

Contrat : CDI, 35 h/semaine. Rémunération selon profil. Avantages : mutuelle prise en charge à 80 %, tickets restaurant, prime annuelle de résultats.

Candidatures à envoyer avant le 15 du mois à rh@docusolutions.fr`;

const DOC_NOTE_TELETRAVAIL =
`NOTE DE SERVICE — Direction des Ressources Humaines
Objet : Mise en place du télétravail partiel

À compter du 1er avril prochain, tout salarié en CDI ou CDD d'une durée supérieure à six mois pourra demander à bénéficier de deux jours de télétravail par semaine. Cette mesure ne s'applique pas aux postes nécessitant une présence physique permanente (accueil, production, logistique).

La demande doit être soumise au responsable hiérarchique direct, qui dispose de quinze jours ouvrables pour répondre. En cas d'accord, un avenant au contrat de travail sera signé par les deux parties.

Le salarié en télétravail reste soumis aux mêmes exigences de disponibilité et de confidentialité qu'en présentiel.`;

const DOC_CHARTE_INFO =
`CHARTE D'UTILISATION DES RESSOURCES INFORMATIQUES

Les équipements informatiques mis à disposition par l'entreprise (ordinateurs, téléphones, accès internet) sont réservés à un usage strictement professionnel. Toute utilisation personnelle doit rester exceptionnelle et ne pas nuire à l'activité.

Il est strictement interdit de :
• télécharger ou installer des logiciels non autorisés par le service informatique ;
• transmettre des données confidentielles à des tiers non habilités ;
• consulter des sites à caractère illicite ou contraire à l'éthique de l'entreprise.

Tout manquement à cette charte est susceptible d'entraîner des sanctions disciplinaires, pouvant aller jusqu'au licenciement pour faute grave.`;

const DOC_REGLEMENT_MEDIA =
`RÈGLEMENT INTÉRIEUR — MÉDIATHÈQUE DU GRAND PARC

La médiathèque est ouverte à tous les résidents de la communauté de communes sur présentation d'une pièce d'identité. L'inscription est gratuite et renouvelable chaque année.

Les abonnés peuvent emprunter jusqu'à cinq documents simultanément pour une durée de trois semaines, renouvelable une fois en ligne ou sur place. Les DVD et CD sont limités à deux exemplaires, pour une durée d'une semaine non renouvelable.

Tout document rendu en retard est soumis à une pénalité de 0,10 € par document et par jour calendaire. En cas de perte ou de dégradation, l'emprunteur est tenu de rembourser le coût de remplacement intégral.`;

/* ── Articles de presse Q33-40 ── */
const ART_IA_EMPLOI =
`L'INTELLIGENCE ARTIFICIELLE ET LE MARCHÉ DE L'EMPLOI : TRANSFORMATION PLUTÔT QUE DISPARITION

Depuis plusieurs années, l'essor de l'intelligence artificielle (IA) suscite des craintes quant à l'avenir de l'emploi. Certains économistes prévoient la disparition de millions de postes dans les prochaines décennies, particulièrement dans les secteurs administratifs, logistiques et financiers. Pourtant, une analyse plus nuancée révèle que la réalité est plus complexe.

Les études menées par l'OCDE et plusieurs universités européennes indiquent que si l'IA détruit effectivement certains emplois routiniers, elle en crée simultanément de nouveaux dans des domaines émergents : ingénierie des données, éthique algorithmique, maintenance des systèmes automatisés. Le solde net serait globalement équilibré à moyen terme, à condition d'investir massivement dans la formation professionnelle.

Ce qui change, en revanche, c'est la nature des compétences requises. Les métiers de demain valorisent davantage la créativité, l'empathie, le jugement critique et les capacités d'adaptation — autant de qualités difficilement reproductibles par une machine. Les travailleurs peu qualifiés, qui occupaient des postes répétitifs, sont ceux qui courent le plus grand risque d'être laissés pour compte si aucune politique de reconversion sérieuse n'est mise en place.

Les gouvernements et les entreprises ont donc une responsabilité partagée : anticiper les mutations sectorielles, financer la montée en compétences et garantir que la transition numérique profite au plus grand nombre. L'IA n'est ni un monstre ni un sauveur — c'est un outil dont l'impact dépend des choix politiques et sociaux que les sociétés décideront de faire.`;

const ART_IMMIGRATION_QUEBEC =
`L'IMMIGRATION QUALIFIÉE AU QUÉBEC : INTÉGRATION ET PÉNURIE DE MAIN-D'ŒUVRE

Le Québec fait face à une contradiction structurelle : d'un côté, une pénurie chronique de main-d'œuvre qui menace la viabilité économique de nombreux secteurs ; de l'autre, un système d'accueil des immigrants jugé défaillant par de nombreux observateurs. Chaque année, des milliers de professionnels qualifiés arrivent au Québec avec l'espoir d'y trouver un emploi correspondant à leurs compétences. Or, beaucoup repartent après dix-huit mois, découragés par les obstacles administratifs, la non-reconnaissance des diplômes étrangers et les difficultés d'intégration sociale.

Le paradoxe est flagrant : des ingénieurs africains ou des médecins latinos sont contraints d'exercer comme chauffeurs ou agents de sécurité, faute d'équivalence reconnue. Cette situation représente un gâchis considérable de capital humain, tant pour les individus concernés que pour la société québécoise.

Des solutions existent pourtant. Plusieurs provinces canadiennes ont mis en place des passerelles d'équivalence accélérée permettant aux professionnels étrangers d'intégrer le marché du travail dans leur domaine en quelques mois. Le Québec expérimente timidement ce modèle, avec des résultats encourageants dans certains secteurs comme la santé et le génie.

Pour que l'immigration qualifiée devienne un véritable levier de développement, il faut une volonté politique claire, des investissements dans les services d'accueil et de francisation, et surtout une meilleure coordination entre les ordres professionnels, les employeurs et les pouvoirs publics.`;

const ART_REFORME_EDUC =
`LA RÉFORME DE L'ÉDUCATION NATIONALE : ENTRE AMBITION PÉDAGOGIQUE ET RÉSULTATS DÉCEVANTS

La réforme du système éducatif français, engagée depuis plusieurs années, visait des objectifs ambitieux : réduire les inégalités scolaires, améliorer le niveau de maîtrise des fondamentaux et mieux préparer les élèves aux exigences du XXIe siècle. Force est de constater, au regard des évaluations internationales comme PISA, que les résultats tardent à se manifester.

Les partisans de la réforme plaident pour la patience : toute transformation profonde d'un système aussi complexe que l'éducation nationale prend du temps. Les nouveaux programmes, centrés sur les compétences plutôt que sur la mémorisation, nécessitent une formation des enseignants qui ne peut s'improviser. Les premières cohortes formées selon ces méthodes n'atteindront le lycée que dans plusieurs années.

Les détracteurs, eux, pointent des résultats concrets alarmants : les enquêtes nationales révèlent qu'une fraction significative des élèves de CM2 ne maîtrise toujours pas correctement la lecture. La surcharge administrative imposée aux enseignants réduirait le temps réel d'enseignement. Et les classes restent surchargées dans les zones d'éducation prioritaire.

Au fond, le débat révèle une tension ancienne dans l'institution : entre une vision libérale centrée sur l'autonomie de l'élève et une approche plus directive insistant sur les fondamentaux. Trouver le bon équilibre reste le défi central d'une réforme qui n'a pas encore livré tous ses effets.`;

const ART_SANTE_NUM =
`LA SANTÉ NUMÉRIQUE : PROMESSES TECHNOLOGIQUES ET INÉGALITÉS D'ACCÈS AUX SOINS

La révolution numérique transforme en profondeur le secteur de la santé. La télémédecine, les objets connectés de surveillance médicale, les algorithmes d'aide au diagnostic et les dossiers médicaux électroniques partagés promettent un système de soins plus efficace, plus réactif et potentiellement plus équitable. Les expériences menées pendant la pandémie de Covid-19 ont démontré que la consultation vidéo peut, dans certains contextes, remplacer avantageusement la visite en cabinet.

Pourtant, la réalité est plus nuancée. Si les grandes métropoles bénéficient pleinement de ces innovations, les zones rurales et les populations défavorisées risquent d'en être exclues. Le fossé numérique — inégal accès à internet haut débit, faible maîtrise des outils technologiques, impossibilité financière d'acquérir des appareils connectés — reproduit et amplifie les inégalités de santé préexistantes.

Des études menées aux États-Unis et au Royaume-Uni montrent que les patients âgés, peu diplômés ou à faibles revenus utilisent beaucoup moins les outils de santé numérique, non par manque d'intérêt, mais par manque de compétences ou d'accès. Le risque est donc de créer un système de santé à deux vitesses : high-tech pour les uns, dégradé pour les autres.

Pour que la santé numérique tienne ses promesses, il est indispensable d'investir simultanément dans les infrastructures, la formation des patients et des soignants, et la protection des données personnelles. L'innovation technologique ne peut se substituer à une politique de santé publique ambitieuse et inclusive.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche de spectacle de théâtre
  qs.push(q(1, 'Q1-7', null, {
    longText:
`THÉÂTRE DE LA CITÉ — Saison 2025-2026

VENDREDI 14 NOVEMBRE — 20 H 30
LE SONGE D'UNE NUIT D'ÉTÉ
Comédie de William Shakespeare
Mise en scène : Élise Morand
Durée : 2 h 10 avec entracte

Tarifs : Plein 22 € | Réduit 14 € (étudiants, demandeurs d'emploi)
Réservations : billetterie@theatre-cite.fr | 05 61 00 44 55`,
    question: "Ce document est…",
    optionA: "une critique de spectacle.",
    optionB: "un programme de théâtre.",
    optionC: "une publicité télévisée.",
    optionD: "un article de presse culturelle.",
    correctAnswer: 'B',
  }));

  // Q2 — Menu du jour d'un restaurant
  qs.push(q(2, 'Q1-7', null, {
    longText:
`RESTAURANT LA TABLE DU MARCHÉ — Menu du jour : 13,50 €

Entrée au choix :
• Soupe de légumes du marché
• Salade de chèvre chaud et noix

Plat au choix :
• Pavé de saumon, purée maison
• Poulet rôti aux herbes et gratin dauphinois

Dessert : Tarte Tatin ou yaourt

Boisson non comprise • Service compris`,
    question: "D'après ce document, le menu du jour comprend…",
    optionA: "un plat unique imposé chaque jour.",
    optionB: "trois courses à prix fixe avec choix.",
    optionC: "la boisson incluse dans le tarif.",
    optionD: "uniquement des plats végétariens.",
    correctAnswer: 'B',
  }));

  // Q3 — Annonce immobilière de vente
  qs.push(q(3, 'Q1-7', null, {
    longText:
`À VENDRE — Appartement T3 — Lyon 6e arrondissement

Surface : 72 m² | 4e étage avec ascenseur
2 chambres, grand séjour, cuisine équipée ouverte
Balcon 8 m² plein sud | Cave et parking en sous-sol
Charges copropriété : 135 €/mois | DPE : C
Prix : 349 000 € (honoraires à la charge de l'acquéreur)
Contact : Agence Prestige Immobilier — 04 72 00 33 44`,
    question: "Ce document est…",
    optionA: "une annonce de location d'appartement.",
    optionB: "un contrat de vente signé.",
    optionC: "une annonce de vente immobilière.",
    optionD: "une fiche de diagnostics techniques.",
    correctAnswer: 'C',
  }));

  // Q4 — Bulletin météo régional
  qs.push(q(4, 'Q1-7', null, {
    longText:
`MÉTÉO RÉGIONALE — Dimanche 8 décembre

Matin : ciel très nuageux sur l'ensemble de la région. Quelques flocons possibles au-dessus de 800 m d'altitude. Températures : 2 à 5 °C en plaine.

Après-midi : éclaircies sur les reliefs, nuages persistants en plaine. Vent de nord-ouest modéré, rafales jusqu'à 60 km/h en altitude. Maximum : 7 °C.

Soir : dégagement général progressif. Gelée possible en zone rurale dès 23 h. Minimales nocturnes : -1 °C.`,
    question: "D'après ce bulletin météo, dans la matinée…",
    optionA: "il fera ensoleillé sur tout le territoire.",
    optionB: "des chutes de neige sont possibles en altitude.",
    optionC: "des orages seront attendus en plaine.",
    optionD: "les températures dépasseront 10 °C.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi d'une cafetière espresso
  qs.push(q(5, 'Q1-7', null, {
    longText:
`CAFETIÈRE ESPRESSO CAFÉ PRESTIGE — MISE EN SERVICE

1. Remplissez le réservoir d'eau froide jusqu'au niveau MAX (1,8 L maximum).
2. Insérez le porte-filtre contenant le café moulu (7 g par tasse) et fixez-le en tournant vers la droite.
3. Placez votre tasse sous le bec verseur.
4. Appuyez sur le bouton ESPRESSO et attendez 25 secondes.

⚠ Ne jamais utiliser d'eau chaude. Ne pas laisser l'appareil sans surveillance lors du fonctionnement.`,
    question: "Ce document est…",
    optionA: "une recette de café artisanal.",
    optionB: "un bon de garantie d'appareil.",
    optionC: "une notice d'utilisation d'appareil.",
    optionD: "une publicité pour une cafétéria.",
    correctAnswer: 'C',
  }));

  // Q6 — Invitation pour un anniversaire
  qs.push(q(6, 'Q1-7', null, {
    longText:
`Chère Sophie, cher Antoine,

Clara et moi avons le plaisir de vous inviter à fêter les 40 ans de Pierre
le samedi 21 juin prochain à partir de 19 h 00.
La soirée se déroulera dans notre jardin, sous le thème « Voyage autour du monde ».
Tenue de voyage conseillée !

Merci de confirmer votre présence avant le 10 juin.
Au plaisir de vous retrouver !
Isabelle et Julien — 06 78 90 12 34`,
    question: "Quel est le but de ce document ?",
    optionA: "Annoncer un mariage.",
    optionB: "Remercier des invités après une fête.",
    optionC: "Inviter des amis à un anniversaire.",
    optionD: "Informer d'un changement de domicile.",
    correctAnswer: 'C',
  }));

  // Q7 — Carte d'abonnement de bibliothèque
  qs.push(q(7, 'Q1-7', null, {
    longText:
`BIBLIOTHÈQUE UNIVERSITAIRE — Carte d'abonné

Titulaire : Marc Lefebvre
Validité : du 01/09/2025 au 31/08/2026

Conditions d'utilisation :
• Présentez cette carte à chaque emprunt.
• La carte est personnelle et strictement non transférable.
• En cas de perte, signalez-le immédiatement à l'accueil.
• Retards : pénalité de 0,15 €/jour/document.
• Renouvellement gratuit sur présentation de la carte étudiante.`,
    question: "Ce document indique que la carte d'abonnement est…",
    optionA: "valable dans toutes les bibliothèques de la région.",
    optionB: "payante et renouvelable chaque semestre.",
    optionC: "personnelle et non transférable à un tiers.",
    optionD: "acceptée dans les librairies partenaires.",
    correctAnswer: 'C',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les candidats sont invités à ___ leur dossier complet avant la date limite de candidature.",
    question: PHRASE_Q,
    optionA: "corriger",
    optionB: "récupérer",
    optionC: "soumettre",
    optionD: "préparer",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce médicament est ___ uniquement sur prescription médicale valide et ne peut être acheté librement.",
    question: PHRASE_Q,
    optionA: "vendu",
    optionB: "refusé",
    optionC: "conseillé",
    optionD: "délivré",
    correctAnswer: 'D',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "En raison d'un incident technique sur la voie ferrée, ce train accusera un ___ d'environ quinze minutes.",
    question: PHRASE_Q,
    optionA: "avance",
    optionB: "retard",
    optionC: "arrêt",
    optionD: "détour",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La bibliothèque sera ___ exceptionnellement le lundi de Pâques en raison du jour férié.",
    question: PHRASE_Q,
    optionA: "ouverte",
    optionB: "complète",
    optionC: "fermée",
    optionD: "déplacée",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Avant de signer ce contrat, veuillez lire attentivement les ___ générales de vente et de service.",
    question: PHRASE_Q,
    optionA: "informations",
    optionB: "conditions",
    optionC: "factures",
    optionD: "demandes",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce produit contient des traces de noix ; les personnes ___ à ces fruits doivent l'éviter absolument.",
    question: PHRASE_Q,
    optionA: "âgées",
    optionB: "sportives",
    optionC: "allergiques",
    optionD: "minces",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Les téléphones intelligents font désormais partie intégrante de notre quotidien. Cet [14] nous permet de communiquer, de nous informer et de nous divertir à tout moment. Toutefois, de nombreux spécialistes alertent sur les [15] d'une utilisation excessive, notamment les troubles du sommeil et la dépendance numérique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le téléphone intelligent',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "logiciel",
    optionB: "réseau",
    optionC: "service",
    optionD: "appareil",
    correctAnswer: 'D',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le téléphone intelligent',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "avantages",
    optionB: "risques",
    optionC: "bienfaits",
    optionD: "résultats",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La gastronomie française est reconnue dans le monde entier pour sa [16]. Chaque région possède ses propres spécialités, des fromages normands aux vins de Bourgogne. Cette [17] culinaire est inscrite au patrimoine culturel immatériel de l'UNESCO depuis 2010.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La gastronomie française',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "simplicité",
    optionB: "modernité",
    optionC: "richesse",
    optionD: "rapidité",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — La gastronomie française',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "tendance",
    optionB: "industrie",
    optionC: "science",
    optionD: "tradition",
    correctAnswer: 'D',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel logement est entièrement meublé et disponible immédiatement ?",
    optionA: "Logement 1",
    optionB: "Logement 2",
    optionC: "Logement 3",
    optionD: "Logement 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle activité peut-on pratiquer sans payer d'entrée ?",
    optionA: "Activité 1",
    optionB: "Activité 2",
    optionC: "Activité 3",
    optionD: "Activité 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle offre d'emploi accepte les candidats sans expérience professionnelle ?",
    optionA: "Offre 1",
    optionB: "Offre 2",
    optionC: "Offre 3",
    optionD: "Offre 4",
    correctAnswer: 'A',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel abonnement inclut l'accès au sauna ?",
    optionA: "Abonnement 1",
    optionB: "Abonnement 2",
    optionC: "Abonnement 3",
    optionD: "Abonnement 4",
    correctAnswer: 'D',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les ventes de cette entreprise progressent chaque trimestre et atteignent leur maximum au quatrième trimestre. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Programme d'aide au logement étudiant",
    longText: DOC_AIDE_LOGEMENT_ETU,
    question: "Ce document présente principalement…",
    optionA: "un programme de bourses scolaires.",
    optionB: "une aide financière pour le logement des étudiants.",
    optionC: "un service d'hébergement universitaire.",
    optionD: "un règlement intérieur de résidence.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Programme d'aide au logement étudiant",
    longText: DOC_AIDE_LOGEMENT_ETU,
    question: "Pour bénéficier de cette aide, l'étudiant doit obligatoirement…",
    optionA: "être inscrit dans une école privée.",
    optionB: "ne pas habiter chez ses parents.",
    optionC: "avoir obtenu son baccalauréat avec mention.",
    optionD: "habiter dans une résidence universitaire officielle.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Assistant(e) de direction",
    longText: DOC_OFFRE_EMPLOI_ADM,
    question: "Cette entreprise recherche principalement un(e) candidat(e) pour…",
    optionA: "gérer la comptabilité de l'entreprise.",
    optionB: "assurer des tâches administratives et d'organisation.",
    optionC: "animer des réunions commerciales.",
    optionD: "superviser la livraison de documents.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Assistant(e) de direction",
    longText: DOC_OFFRE_EMPLOI_ADM,
    question: "Parmi les avantages mentionnés dans cette offre, on trouve…",
    optionA: "un logement de fonction.",
    optionB: "une voiture de service.",
    optionC: "une mutuelle prise en charge à 80 %.",
    optionD: "des congés supplémentaires.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Note de service — Télétravail partiel",
    longText: DOC_NOTE_TELETRAVAIL,
    question: "Cette note de service annonce…",
    optionA: "la suppression du travail à domicile.",
    optionB: "la mise en place du télétravail partiel pour certains salariés.",
    optionC: "une réorganisation complète des services.",
    optionD: "l'obligation de travailler cinq jours au bureau.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Note de service — Télétravail partiel",
    longText: DOC_NOTE_TELETRAVAIL,
    question: "Selon ce document, qui ne peut pas accéder au télétravail ?",
    optionA: "Les salariés en CDI depuis moins d'un an.",
    optionB: "Les salariés dont le poste exige une présence physique permanente.",
    optionC: "Les salariés travaillant à temps partiel.",
    optionD: "Les cadres supérieurs de l'entreprise.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte d'utilisation des ressources informatiques",
    longText: DOC_CHARTE_INFO,
    question: "L'objectif principal de cette charte est de…",
    optionA: "promouvoir l'achat de nouveaux équipements.",
    optionB: "encadrer l'utilisation professionnelle des outils informatiques.",
    optionC: "interdire tout accès à internet pendant le travail.",
    optionD: "former les employés à la cybersécurité.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte d'utilisation des ressources informatiques",
    longText: DOC_CHARTE_INFO,
    question: "Selon la charte, installer un logiciel non autorisé est…",
    optionA: "toléré si cela reste occasionnel.",
    optionB: "autorisé après accord du manager.",
    optionC: "strictement interdit et passible de sanction.",
    optionD: "permis uniquement pour les cadres.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Médiathèque du Grand Parc",
    longText: DOC_REGLEMENT_MEDIA,
    question: "Ce document décrit principalement…",
    optionA: "les horaires d'ouverture de la médiathèque.",
    optionB: "le catalogue des ouvrages disponibles.",
    optionC: "les conditions d'inscription et d'emprunt de la médiathèque.",
    optionD: "les tarifs des abonnements annuels.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Médiathèque du Grand Parc",
    longText: DOC_REGLEMENT_MEDIA,
    question: "Quelle est la durée maximale d'emprunt pour un livre ordinaire ?",
    optionA: "Une semaine, non renouvelable.",
    optionB: "Deux semaines, renouvelables deux fois.",
    optionC: "Trois semaines, renouvelables une fois.",
    optionD: "Un mois sans renouvellement possible.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "L'IA et le marché de l'emploi : transformation plutôt que disparition",
    longText: ART_IA_EMPLOI,
    question: "Selon cet article, l'intelligence artificielle…",
    optionA: "fera disparaître tous les emplois d'ici dix ans.",
    optionB: "crée autant d'emplois qu'elle en détruit à moyen terme.",
    optionC: "profite uniquement aux grandes entreprises technologiques.",
    optionD: "ne menace pas les travailleurs peu qualifiés.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "L'IA et le marché de l'emploi : transformation plutôt que disparition",
    longText: ART_IA_EMPLOI,
    question: "L'auteur de l'article souligne que les emplois de demain valoriseront davantage…",
    optionA: "la vitesse d'exécution et la précision technique.",
    optionB: "la créativité, l'empathie et l'esprit critique.",
    optionC: "la maîtrise des langages de programmation.",
    optionD: "la capacité à travailler en horaires décalés.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "L'immigration qualifiée au Québec : intégration et pénurie de main-d'œuvre",
    longText: ART_IMMIGRATION_QUEBEC,
    question: "Selon cet article, quelle est la principale difficulté rencontrée par les immigrants qualifiés au Québec ?",
    optionA: "L'hostilité de la population locale envers les étrangers.",
    optionB: "La non-reconnaissance de leurs diplômes et compétences.",
    optionC: "Le coût élevé de la vie dans les grandes villes.",
    optionD: "L'absence de cours de français accessibles.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "L'immigration qualifiée au Québec : intégration et pénurie de main-d'œuvre",
    longText: ART_IMMIGRATION_QUEBEC,
    question: "L'auteur de l'article propose notamment comme solution…",
    optionA: "de limiter l'immigration aux seuls médecins.",
    optionB: "de créer des passerelles d'équivalence accélérée pour les professionnels étrangers.",
    optionC: "d'obliger les immigrants à s'installer en dehors des grandes métropoles.",
    optionD: "de supprimer les ordres professionnels qui bloquent l'intégration.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "La réforme de l'éducation nationale : entre ambition pédagogique et résultats décevants",
    longText: ART_REFORME_EDUC,
    question: "Selon cet article, les partisans de la réforme éducative estiment que…",
    optionA: "les résultats sont déjà visibles dans les évaluations internationales.",
    optionB: "la réforme a été trop rapidement abandonnée.",
    optionC: "les transformations d'un système complexe prennent du temps à se manifester.",
    optionD: "les enseignants résistent sciemment aux nouvelles méthodes.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "La réforme de l'éducation nationale : entre ambition pédagogique et résultats décevants",
    longText: ART_REFORME_EDUC,
    question: "Les détracteurs de la réforme mentionnent comme problème concret…",
    optionA: "l'absence de nouveaux programmes dans les lycées.",
    optionB: "la difficulté à recruter de nouveaux enseignants.",
    optionC: "une fraction significative d'élèves de CM2 qui ne maîtrise pas la lecture.",
    optionD: "la fermeture de nombreuses écoles en zones rurales.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "La santé numérique : promesses technologiques et inégalités d'accès aux soins",
    longText: ART_SANTE_NUM,
    question: "Selon cet article, quel est le principal risque lié à la santé numérique ?",
    optionA: "La divulgation des données médicales aux assureurs.",
    optionB: "Le remplacement des médecins par des algorithmes.",
    optionC: "La création d'un système de santé à deux vitesses, inégal.",
    optionD: "L'augmentation du coût des consultations médicales.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "La santé numérique : promesses technologiques et inégalités d'accès aux soins",
    longText: ART_SANTE_NUM,
    question: "L'auteur de l'article conclut que la santé numérique nécessite…",
    optionA: "d'être entièrement gérée par le secteur privé.",
    optionB: "un investissement simultané dans les infrastructures, la formation et la protection des données.",
    optionC: "de supprimer les consultations physiques pour réduire les coûts.",
    optionD: "d'être réservée aux établissements hospitaliers publics.",
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
    console.log(`\n✅ ${created} questions créées pour CE 4.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
