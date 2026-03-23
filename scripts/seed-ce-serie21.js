'use strict';
/**
 * seed-ce-serie21.js
 * Peuple la série CE 21 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie21.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyohcf000h0wxlal1wv308';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts (fréquentation parc d'attractions par saison) ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [120, 180, 90, 60], color: '#E30613' },
    { label: 'Graphique 2', data: [80, 180, 100, 40], color: '#003087' }, // CORRECT
    { label: 'Graphique 3', data: [60, 90, 150, 100], color: '#E30613' },
    { label: 'Graphique 4', data: [100, 120, 110, 70], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Printemps', 'Été', 'Automne', 'Hiver'];
  const maxVal = 200;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 50;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 50, 100, 150, 200].map(v => {
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
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Visiteurs (milliers)</text>`;
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
  { title: 'Cuisine 1', content: "La cuisine bretonne se distingue par l'utilisation du sarrasin, avec sa célèbre galette de blé noir garnie de jambon, fromage et œuf. Le beurre salé est omniprésent, tout comme les fruits de mer, huîtres et homards pêchés sur les côtes atlantiques. Le kouign-amann, gâteau au beurre caramélisé, représente une spécialité incontournable." },
  { title: 'Cuisine 2', content: "La cuisine alsacienne témoigne de l'influence germanique dans ses recettes emblématiques : la choucroute garnie de charcuterie et de pommes de terre, la tarte flambée (flammekueche) à la crème fraîche et aux lardons, le baeckeoffe mijoté au vin blanc. La bière artisanale locale accompagne naturellement ces plats roboratifs, parfaits pour les hivers rigoureux du Rhin." },
  { title: 'Cuisine 3', content: "La cuisine provençale exalte les saveurs méditerranéennes : la bouillabaisse marseillaise, soupe de poissons rocailleux au safran, la ratatouille de légumes d'été mijotés à l'huile d'olive, et l'aïoli, sauce à l'ail emblématique. Les herbes de Provence, thym, romarin, lavande, parfument les viandes grillées et les fromages de chèvre affinés." },
  { title: 'Cuisine 4', content: "La cuisine lyonnaise, considérée comme la capitale gastronomique française, se construit autour des bouchons, ces restaurants traditionnels servant quenelles de brochet, tablier de sapeur et andouillettes. Les charcuteries artisanales, rosette et saucisson de Lyon, côtoient les gratins dauphinois et les volailles de Bresse aux labels d'excellence reconnus mondialement." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Architecture 1', content: "L'architecture romane, développée du Xe au XIIe siècle, se caractérise par des murs épais, des voûtes en berceau semi-circulaires et de petites fenêtres. Les clochers massifs et les piliers robustes confèrent une impression de solidité et de permanence. Les abbatiales de Cluny et Vézelay illustrent parfaitement ce style austère et majestueux." },
  { title: 'Architecture 2', content: "L'architecture gothique, née au XIIe siècle en Île-de-France, révolutionne la construction religieuse grâce aux arcs brisés, aux voûtes en croisée d'ogives et aux arcs-boutants. Ces innovations techniques permettent d'élever des cathédrales vertigineuses percées de vitraux lumineux, comme Notre-Dame de Paris et la cathédrale de Chartres, chefs-d'œuvre de lumière et de verticalité." },
  { title: 'Architecture 3', content: "L'architecture baroque du XVIIe siècle exprime magnificence et mouvement à travers ses façades ornementées, ses colonnes torsadées et ses trompe-l'œil spectaculaires. Née en Italie, cette esthétique de l'excès et de la théâtralité s'est répandue en Europe, laissant des palais grandioses comme Versailles et des églises richement décorées aux stucs dorés." },
  { title: 'Architecture 4', content: "L'architecture Art nouveau, florissant entre 1890 et 1910, célèbre les formes organiques inspirées de la nature. Lignes courbes sinueuses, motifs floraux, façades asymétriques et matériaux industriels comme le fer et le verre caractérisent ce style. Le métro parisien de Guimard, les immeubles bruxellois d'Horta et les créations de Gaudí à Barcelone en sont les exemples majeurs." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Application 1', content: "Le logiciel CRM (Customer Relationship Management) est spécialement conçu pour gérer les relations avec les clients : suivi des prospects, historique des contacts, relances automatiques et rapports de ventes. Il permet aux équipes commerciales de centraliser toutes les interactions clients et d'optimiser les processus de vente. Salesforce et HubSpot sont des solutions CRM leaders du marché." },
  { title: 'Application 2', content: "L'ERP (Enterprise Resource Planning) est un progiciel intégrant l'ensemble des fonctions de gestion d'une entreprise : comptabilité, ressources humaines, production, logistique, achats et ventes. Il centralise les données dans une base unique, éliminant les silos d'information et assurant la cohérence des processus. SAP et Oracle ERP sont les références mondiales de ce type de solution." },
  { title: 'Application 3', content: "Le logiciel de gestion de projet comme Microsoft Project ou Trello permet de planifier, organiser et suivre l'avancement de projets complexes. Il intègre des fonctionnalités de diagramme de Gantt, d'allocation de ressources humaines et matérielles, de gestion des délais et de suivi budgétaire. Ces outils facilitent la collaboration entre équipes et la communication avec les parties prenantes." },
  { title: 'Application 4', content: "Le logiciel de comptabilité type Sage ou QuickBooks automatise la saisie des écritures comptables, la gestion des factures clients et fournisseurs, et la production des états financiers réglementaires. Il permet le suivi en temps réel de la trésorerie, le calcul automatique de la TVA et la génération des déclarations fiscales. Ces outils réduisent les erreurs et accélèrent la clôture des comptes." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Trouble 1', content: "La dépression est un trouble de l'humeur caractérisé par une tristesse persistante, une perte d'intérêt pour les activités quotidiennes, des troubles du sommeil et de l'appétit. Elle affecte la capacité de concentration et peut conduire à un sentiment de désespoir durable. La dépression touche environ 300 millions de personnes dans le monde et nécessite un traitement médical adapté." },
  { title: 'Trouble 2', content: "Le burnout ou épuisement professionnel résulte d'un surmenage chronique au travail. Il se manifeste par un épuisement physique et émotionnel intense, un sentiment de désengagement professionnel et une perte d'efficacité. Ce syndrome touche particulièrement les professions aidantes et les cadres soumis à une pression excessive. La prévention passe par la gestion du stress et l'équilibre vie professionnelle-vie personnelle." },
  { title: 'Trouble 3', content: "Le trouble anxieux généralisé se caractérise par une inquiétude excessive et incontrôlable concernant de nombreux aspects de la vie quotidienne. Les symptômes incluent tension musculaire, difficultés de concentration, irritabilité et troubles du sommeil. Ce trouble chronique peut significativement altérer la qualité de vie et les relations sociales. Les thérapies cognitivo-comportementales constituent le traitement de première intention." },
  { title: 'Trouble 4', content: "Le trouble du stress post-traumatique (TSPT) survient après l'exposition à un événement traumatisant : accident grave, violence, catastrophe naturelle. Il se manifeste par des reviviscences intrusives, des cauchemars, une hypervigilance et un évitement des situations rappelant le trauma. Ce trouble peut persister des années sans traitement approprié. La thérapie EMDR et la thérapie d'exposition constituent des approches thérapeutiques validées." },
]);

/* ── Documents Q23-32 ── */
const DOC_REGLEMENT_PARC =
`RÈGLEMENT DE SÉCURITÉ — PARC D'ATTRACTIONS ADVENTURE LAND

Pour garantir la sécurité et le plaisir de tous nos visiteurs, les règles suivantes s'appliquent dans l'enceinte du parc.

RESTRICTIONS D'ACCÈS AUX ATTRACTIONS :
• Taille minimale requise : 1,20 m pour les montagnes russes et attractions à grande vitesse
• Les enfants de moins de 12 ans doivent être accompagnés d'un adulte sur toutes les attractions
• Les personnes souffrant de problèmes cardiaques, de vertiges ou d'épilepsie sont déconseillées sur les attractions à sensations fortes
• Les femmes enceintes sont interdites d'accès aux attractions mécaniques

COMPORTEMENT DANS LE PARC :
• Il est strictement interdit d'apporter de la nourriture ou des boissons extérieures dans le parc
• Les animaux domestiques ne sont pas admis, à l'exception des chiens guides
• Le port d'objets volumineux ou de sacs à dos de grande taille est interdit dans les attractions`;

const DOC_OFFRE_DEV_WEB =
`OFFRE D'EMPLOI — DÉVELOPPEUR WEB FULL STACK

Notre agence digitale en pleine croissance recherche un développeur web expérimenté pour rejoindre son équipe technique.

MISSIONS PRINCIPALES :
Développement et maintenance d'applications web (front-end et back-end), participation à la conception technique des projets, collaboration avec les équipes design et product owners, revue de code et mentorat des développeurs juniors.

PROFIL RECHERCHÉ :
Bac+3 à Bac+5 en informatique, 3 ans d'expérience minimum en développement web, maîtrise de JavaScript, React, Node.js et SQL. La connaissance de Docker et des architectures cloud est un plus. Capacité à travailler en méthodes agiles (Scrum).

CONTRAT ET AVANTAGES :
CDI, 39 h/semaine. Salaire : 38 000 à 50 000 € selon profil. Télétravail 3 jours/semaine, mutuelle premium, tickets restaurant, RTT.

Candidatures : rh@agencedigitale.fr avant le 30 du mois`;

const DOC_CONTRAT_ARCHI =
`CONTRAT DE PRESTATION — CABINET D'ARCHITECTURE MODERNE

Entre le Cabinet Architecture & Design (prestataire) et la Société Immobilière Horizon (client), il est convenu ce qui suit :

OBJET DE LA PRESTATION :
Conception architecturale complète d'un immeuble de bureaux de 6 étages, incluant les plans d'exécution, le suivi de chantier et la coordination avec les entreprises de construction.

DÉLAIS ET LIVRABLES :
• Phase études préliminaires : 6 semaines à compter de la signature
• Plans d'exécution définitifs : 3 mois après validation des études
• Suivi de chantier : 18 mois

RÉMUNÉRATION :
Honoraires calculés sur la base de 8% du coût total de construction estimé à 4 millions d'euros, soit 320 000 € HT, versés selon un échéancier précisé en annexe.`;

const DOC_ACCORD_TRAVAIL =
`ACCORD COLLECTIF — DROITS DES SALARIÉS ET CONDITIONS DE TRAVAIL

Conclu entre la Direction générale et les représentants syndicaux majoritaires, le présent accord vise à améliorer les conditions de travail et renforcer les droits des salariés.

TEMPS DE TRAVAIL ET CONGÉS :
• Durée hebdomadaire : 35 heures, avec possibilité de modulation annuelle
• Congés payés : 25 jours ouvrés auxquels s'ajoutent 10 jours de RTT annuels
• Congé parental étendu : 6 mois pour le second parent (au-delà du minimum légal)

RÉMUNÉRATION ET AVANTAGES :
• Revalorisation salariale annuelle minimum indexée sur l'inflation
• Participation aux bénéfices : 5% du résultat net distribué aux salariés
• Indemnité de licenciement : majoration de 20% par rapport au minimum légal

FORMATION PROFESSIONNELLE :
Chaque salarié bénéficie d'un entretien annuel de développement et d'un crédit formation de 40 heures/an.`;

const DOC_GUIDE_SANTE =
`GUIDE DE PRÉVENTION — SANTÉ MENTALE AU TRAVAIL

Ce guide a été élaboré par le service de santé au travail en partenariat avec les représentants du personnel pour prévenir les risques psychosociaux dans notre entreprise.

RECONNAÎTRE LES SIGNES D'ALERTE :
• Fatigue persistante ne disparaissant pas avec le repos
• Irritabilité, difficultés de concentration, perte de motivation
• Absences répétées ou présentéisme (présence physique mais désinvestissement mental)
• Troubles du sommeil liés au travail

RESSOURCES DISPONIBLES :
• Médecin du travail : consultation confidentielle sur rendez-vous
• Psychologue du travail : 6 séances gratuites par an pour tout salarié
• Numéro d'écoute anonyme : 0800 000 000 (gratuit, 24h/24)
• Référent bien-être : personne désignée dans chaque service

ACTIONS COLLECTIVES :
Formations gestion du stress, ateliers de pleine conscience et réunions d'équipe régulières sur le bien-être font partie du plan annuel de prévention.`;

/* ── Articles de presse Q33-40 ── */
const ART_TELETRAVAIL =
`TÉLÉTRAVAIL ET SANTÉ MENTALE : LE DOUBLE TRANCHANT DE LA RÉVOLUTION NUMÉRIQUE

La généralisation du télétravail, accélérée par la pandémie de Covid-19, a profondément transformé l'organisation du travail dans de nombreuses entreprises. Si cette modalité offre des avantages indéniables — suppression des trajets fatigants, meilleure concentration, flexibilité des horaires — ses effets sur la santé mentale des travailleurs s'avèrent plus ambivalents que prévu.

Des études conduites par l'Institut national de la santé et de la recherche médicale révèlent que le travail à domicile à temps plein multiplie par trois le risque d'isolement professionnel. La frontière floue entre espace privé et espace professionnel génère une hyperconnexion permanente : répondre aux emails le soir, assister à des visioconférences le week-end, travailler depuis le lit ou la salle à manger. Ce brouillage des repères spatiaux et temporels fragilise l'équilibre psychologique.

Les personnes les plus vulnérables sont paradoxalement celles qui semblaient profiter le plus du télétravail : les jeunes travailleurs isolés géographiquement, les parents de jeunes enfants en surcharge logistique, et les introvertis qui, privés d'interactions sociales minimales, glissent vers un repli anxieux.

À l'inverse, pour certains profils, notamment les personnes souffrant d'anxiété sociale ou vivant loin de leur lieu de travail, le télétravail constitue une véritable bouffée d'oxygène. La clé semble résider dans une organisation hybride bien pensée, qui préserve le lien social tout en offrant la flexibilité recherchée. Les entreprises qui réussissent cette transition investissent massivement dans l'animation d'équipe, la formation des managers et la mise en place de rituels collectifs maintenant la cohésion.`;

const ART_PATRIMOINE =
`PATRIMOINE ARCHITECTURAL ET RÉNOVATION : CONCILIER HISTOIRE ET MODERNITÉ

La France possède l'un des patrimoines architecturaux les plus riches du monde, avec plus de 43 000 monuments historiques classés ou inscrits. Châteaux médiévaux, cathédrales gothiques, abbayes romanes, hôtels particuliers haussmanniens : ces témoins du passé constituent à la fois un trésor culturel inestimable et un défi permanent de conservation.

La rénovation du patrimoine bâti soulève des questions complexes à l'intersection de l'histoire, de la technique et de la politique culturelle. Faut-il restaurer à l'identique, au risque de créer des copies sans âme ? Ou accepter une réinterprétation contemporaine qui dialogue avec l'existant tout en assumant son époque ? L'incendie de Notre-Dame de Paris en 2019 a brutalement posé cette question devant le monde entier.

Les architectes des Bâtiments de France, gardiens officiels du patrimoine, défendent une doctrine de la réversibilité : toute intervention doit pouvoir être défaite sans abîmer l'original. Cette exigence entre parfois en tension avec les impératifs énergétiques modernes. Isoler thermiquement un bâtiment ancien sans dénaturer son caractère représente un défi technique et esthétique considérable.

Les fonds disponibles pour la restauration demeurent chroniquement insuffisants. Les collectivités locales, l'État, les fondations privées et le mécénat d'entreprise s'associent de plus en plus pour financer ces opérations coûteuses. L'enjeu dépasse la simple conservation : le patrimoine architectural est un moteur économique majeur, attirant chaque année des millions de touristes et générant des dizaines de milliers d'emplois.`;

const ART_IA_EMPLOI_CE21 =
`INTELLIGENCE ARTIFICIELLE ET EMPLOI : UNE MUTATION SANS PRÉCÉDENT

L'intelligence artificielle générative bouleverse le marché du travail à une vitesse que peu d'experts avaient anticipée. En l'espace de deux années, des outils comme les grands modèles de langage ont démontré leur capacité à rédiger, analyser, coder et créer à un niveau parfois comparable à celui de professionnels expérimentés. Cette disruption soulève des questions fondamentales sur l'avenir de métiers entiers.

Les secteurs les plus exposés sont ceux qui reposent sur le traitement d'informations structurées et reproductibles : comptabilité, traduction, rédaction publicitaire, assistance juridique de premier niveau, service client. Des études récentes estiment qu'entre 20 et 30% des tâches actuellement réalisées par des humains pourraient être automatisées d'ici 2030. Ce n'est pas tant la disparition d'emplois en bloc qui est redoutée, mais une recomposition profonde des compétences requises.

Paradoxalement, l'IA crée de nouveaux besoins : ingénieurs en machine learning, spécialistes de l'éthique algorithmique, formateurs en compétences numériques, experts en cybersécurité des systèmes d'IA. Des métiers encore inexistants il y a cinq ans représentent aujourd'hui des gisements d'emplois qualifiés.

Le véritable enjeu est celui de la vitesse d'adaptation. Les systèmes éducatifs traditionnels, conçus pour des trajectoires professionnelles stables sur plusieurs décennies, peinent à former des travailleurs capables de se réinventer tous les cinq ans. Les entreprises qui réussiront seront celles qui investissent dans la formation continue et qui considèrent leurs salariés non comme des ressources interchangeables, mais comme des partenaires dans la transition technologique.`;

const ART_GASTRONOMIE =
`GASTRONOMIE RÉGIONALE ET TOURISME : LE GOÛT COMME PASSEPORT IDENTITAIRE

La France, longtemps considérée comme la première destination touristique mondiale, mise de plus en plus sur sa gastronomie régionale comme levier d'attractivité. Loin des circuits standardisés, les voyageurs d'aujourd'hui cherchent des expériences authentiques, des saveurs ancrées dans un terroir, des rencontres avec des producteurs passionnés. Ce tourisme gastronomique représente désormais un marché considérable, estimé à plus de 30 milliards d'euros annuels.

Chaque région française développe sa propre identité culinaire, reflet de son histoire, de son climat et de ses ressources naturelles. La Bourgogne et ses vins aux appellations mondialement connues, la Normandie et ses fromages AOP, la Bretagne et ses fruits de mer, le Périgord et sa truffe noire : ces produits sont devenus de véritables ambassadeurs culturels qui font voyager bien avant l'arrivée physique.

Les labels et certifications jouent un rôle croissant dans cette dynamique. Les Appellations d'Origine Protégée (AOP) et les Indications Géographiques Protégées (IGP) garantissent l'authenticité des produits et constituent une protection contre les imitations. Mais ils représentent surtout un formidable outil marketing qui transforme un produit agricole en récit culturel.

Le défi pour les acteurs du tourisme gastronomique est de préserver l'authenticité tout en s'adaptant aux nouvelles attentes des visiteurs. Les jeunes touristes, notamment, recherchent des expériences participatives : cours de cuisine chez un chef étoilé, visite de caves avec dégustation, cueillette de truffes avec les producteurs. L'avenir de ce secteur passe par une alliance réussie entre tradition et innovation, entre transmission du savoir-faire ancestral et adaptation aux goûts contemporains.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme parc d'attractions
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ADVENTURE LAND — PARC D'ATTRACTIONS
Saison estivale 2025 : 15 juin – 15 septembre

ATTRACTIONS PHARES :
• Tornado Express — Montagnes russes XXL (taille min. 1,40 m)
• Aqua Splash — Descente en radeau (taille min. 1,20 m)
• Kids Paradise — Zone enfants (gratuit pour les moins de 3 ans)
• Fantasy Castle — Attraction tout public

TARIFS :
Adulte : 38 € | Enfant (4–12 ans) : 28 € | Famille (2+2) : 120 €
Ouverture : 10h00 – 20h00 (nocturnes le vendredi jusqu'à 23h00)`,
    question: "Ce document est…",
    optionA: "un règlement de sécurité du parc.",
    optionB: "un programme de visite avec tarifs et horaires.",
    optionC: "un article sur les parcs d'attractions.",
    optionD: "une publicité télévisée pour un parc.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche conférence architecture
  qs.push(q(2, 'Q1-7', null, {
    longText:
`CONFÉRENCE INTERNATIONALE D'ARCHITECTURE DURABLE
Palais des Congrès de Lyon — 18 et 19 octobre 2025

PROGRAMME :
• Vendredi 18 : Architecture bioclimatique et efficacité énergétique
• Samedi 19 : Matériaux biosourcés et construction écologique

INTERVENANTS :
Architectes, ingénieurs et urbanistes de 15 pays
Inscription obligatoire : conférence-archi-durable.fr
Tarif : 95 € / 2 jours | 65 € / 1 journée | Gratuit pour les étudiants`,
    question: "D'après ce document, l'entrée est gratuite pour…",
    optionA: "tous les professionnels de l'architecture.",
    optionB: "les visiteurs du vendredi uniquement.",
    optionC: "les étudiants.",
    optionD: "les intervenants internationaux.",
    correctAnswer: 'C',
  }));

  // Q3 — Courrier d'invitation voyage d'affaires
  qs.push(q(3, 'Q1-7', null, {
    longText:
`Objet : Invitation — Voyage d'affaires à Montréal

Madame Durand,

Nous avons le plaisir de vous inviter à représenter notre société lors du Forum économique franco-canadien qui se tiendra du 3 au 7 novembre 2025 à Montréal.

Votre participation comprend : vol aller-retour Paris-Montréal en classe affaires, hébergement à l'Hôtel Le Centre (4 étoiles) pour 4 nuits, accès à l'ensemble des séances plénières et ateliers.

Merci de confirmer votre participation avant le 10 octobre en retournant le formulaire ci-joint.

Cordialement,
Direction des Relations Internationales`,
    question: "Quel est le but principal de ce courrier ?",
    optionA: "Annoncer l'annulation d'un voyage d'affaires.",
    optionB: "Inviter une collaboratrice à un forum international.",
    optionC: "Demander un remboursement de frais de voyage.",
    optionD: "Confirmer la réservation d'un hôtel.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce emploi informatique
  qs.push(q(4, 'Q1-7', null, {
    longText:
`OFFRE D'EMPLOI — TECHNICIEN SUPPORT INFORMATIQUE

Entreprise de services numériques, 150 salariés, recherche technicien support niveau 1/2.

Missions : assistance utilisateurs sur site et à distance, installation et configuration de postes de travail, gestion du parc matériel, résolution des incidents courants.

Profil : BTS informatique ou équivalent, bonnes qualités relationnelles, permis B exigé.

Contrat : CDI, 35h. Salaire : 24 000 – 28 000 € brut/an selon profil.
Envoyer CV et lettre de motivation à recrutement@esnumerique.fr`,
    question: "Ce document est…",
    optionA: "un contrat de travail signé.",
    optionB: "une petite annonce pour un poste en informatique.",
    optionC: "un descriptif de formation informatique.",
    optionD: "un règlement intérieur d'entreprise.",
    correctAnswer: 'B',
  }));

  // Q5 — Menu gastronomie régionale
  qs.push(q(5, 'Q1-7', null, {
    longText:
`RESTAURANT AU TERROIR ALSACIEN
Menu Découverte — 42 € par personne

ENTRÉE : Tarte flambée traditionnelle aux lardons et crème fraîche
               ou Salade de choucroute aux pommes et noix

PLAT : Baeckeoffe de porc et agneau mijoté au Riesling avec pommes de terre
          ou Carpe farcie à l'alsacienne, garniture de légumes du potager

FROMAGES : Munster fermier accompagné de cumin et confiture de mirabelles

DESSERT : Kougelhopf aux raisins secs et amandes ou Coupe glacée Alsacienne

Vins d'Alsace au verre sur recommandation de notre sommelier`,
    question: "D'après ce menu, quelle est l'influence culinaire principale de ce restaurant ?",
    optionA: "La cuisine méditerranéenne.",
    optionB: "La cuisine bretonne.",
    optionC: "La gastronomie alsacienne.",
    optionD: "La cuisine parisienne.",
    correctAnswer: 'C',
  }));

  // Q6 — Mode d'emploi logiciel comptabilité
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMPTA PRO 2025 — GUIDE DE DÉMARRAGE RAPIDE

INSTALLATION :
1. Insérez le DVD ou téléchargez le logiciel depuis notre site web sécurisé
2. Lancez le fichier d'installation et suivez l'assistant
3. Entrez votre numéro de licence (figurant sur votre bon de commande)

PREMIÈRE UTILISATION :
• Créez votre dossier entreprise avec votre numéro SIRET et exercice comptable
• Importez votre plan comptable ou utilisez le modèle standard fourni
• Paramétrez vos modes de règlement et comptes bancaires

ASSISTANCE : support@compta-pro.fr | 09 70 00 12 34 (lun-ven 9h-18h)`,
    question: "Ce document est…",
    optionA: "une publicité pour un cabinet comptable.",
    optionB: "un formulaire de déclaration fiscale.",
    optionC: "une notice d'utilisation d'un logiciel de comptabilité.",
    optionD: "un contrat de maintenance informatique.",
    correctAnswer: 'C',
  }));

  // Q7 — Communiqué association santé mentale
  qs.push(q(7, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ DE PRESSE
Association Bien-Être et Santé Mentale (APSM)

Dans le cadre de la Semaine Nationale de Prévention du Suicide (du 3 au 9 février), l'APSM organise une série d'actions de sensibilisation dans toute la France.

Au programme : conférences publiques dans 20 villes, stands d'information dans les universités et les entreprises, formation aux gestes de premiers secours psychologiques pour le grand public.

L'APSM rappelle que parler de santé mentale sans tabou sauve des vies. Tout le monde peut être touché, et des solutions existent.

Numéro national de prévention du suicide : 3114 (gratuit, 24h/24, 7j/7)
Plus d'informations : www.apsm-france.org`,
    question: "Quel est le but principal de ce communiqué ?",
    optionA: "Annoncer la création d'une nouvelle clinique psychiatrique.",
    optionB: "Promouvoir des actions de sensibilisation à la santé mentale.",
    optionC: "Informer sur les remboursements des soins psychologiques.",
    optionD: "Recruter des bénévoles pour une association.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le vol Paris-Tokyo a dû faire une ___ technique à Moscou en raison d'un problème de carburant imprévu.",
    question: PHRASE_Q,
    optionA: "déviation",
    optionB: "escale",
    optionC: "traversée",
    optionD: "connexion",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'ingénieur a vérifié que la ___ du bâtiment repose sur des pieux en béton armé enfoncés dans le sol rocheux.",
    question: PHRASE_Q,
    optionA: "toiture",
    optionB: "façade",
    optionC: "structure",
    optionD: "fondation",
    correctAnswer: 'D',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Suite à la fermeture de l'usine, les employés ont reçu une ___ correspondant à deux mois de salaire par année d'ancienneté.",
    question: PHRASE_Q,
    optionA: "prime",
    optionB: "subvention",
    optionC: "indemnité",
    optionD: "allocation",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Ce fromage bénéficie d'une ___ d'origine protégée qui garantit qu'il est fabriqué exclusivement dans cette région.",
    question: PHRASE_Q,
    optionA: "marque",
    optionB: "appellation",
    optionC: "certification",
    optionD: "licence",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Notre site web est hébergé sur un ___ sécurisé qui garantit une disponibilité de 99,9% et protège vos données personnelles.",
    question: PHRASE_Q,
    optionA: "réseau",
    optionB: "terminal",
    optionC: "serveur",
    optionD: "routeur",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le médecin a recommandé une ___ cognitivo-comportementale pour aider le patient à gérer ses crises d'anxiété.",
    question: PHRASE_Q,
    optionA: "intervention",
    optionB: "opération",
    optionC: "thérapie",
    optionD: "consultation",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La cybersécurité en entreprise est devenue une priorité absolue. Chaque salarié doit utiliser un [14] robuste, combinant lettres, chiffres et caractères spéciaux, pour protéger ses accès aux systèmes informatiques. Sans ces précautions, l'entreprise s'expose à des risques de [15] qui peuvent paralyser ses activités pendant plusieurs jours.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La cybersécurité en entreprise',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "identifiant",
    optionB: "mot de passe",
    optionC: "programme",
    optionD: "logiciel",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La cybersécurité en entreprise',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "piratage",
    optionB: "contrôle",
    optionC: "formation",
    optionD: "maintenance",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "L'architecture bioclimatique optimise le confort thermique en tenant compte de l'[16] du bâtiment par rapport au soleil et aux vents dominants. Une bonne [17] des murs et des toitures permet de réduire significativement les besoins en chauffage en hiver et en climatisation en été.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'architecture bioclimatique",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "orientation",
    optionB: "décoration",
    optionC: "superficie",
    optionD: "hauteur",
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'architecture bioclimatique",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "ventilation",
    optionB: "isolation",
    optionC: "structure",
    optionD: "fondation",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle cuisine régionale est influencée par l'Allemagne et inclut la choucroute et la flammekueche ?",
    optionA: "Cuisine 1",
    optionB: "Cuisine 2",
    optionC: "Cuisine 3",
    optionD: "Cuisine 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel style architectural est caractérisé par les arcs brisés, les voûtes en croisée d'ogives et les grandes cathédrales ?",
    optionA: "Architecture 1",
    optionB: "Architecture 2",
    optionC: "Architecture 3",
    optionD: "Architecture 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel logiciel intègre toutes les fonctions de gestion d'une entreprise dans une base de données unique ?",
    optionA: "Application 1",
    optionB: "Application 2",
    optionC: "Application 3",
    optionD: "Application 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel trouble psychologique est lié à l'épuisement professionnel causé par le surmenage au travail ?",
    optionA: "Trouble 1",
    optionB: "Trouble 2",
    optionC: "Trouble 3",
    optionD: "Trouble 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphique
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le parc enregistre sa fréquentation maximale en été avec 180 000 visiteurs, représentant 45% de sa fréquentation annuelle totale. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'B',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Règlement de sécurité — Adventure Land",
    longText: DOC_REGLEMENT_PARC,
    question: "Ce document présente principalement…",
    optionA: "les tarifs d'entrée du parc.",
    optionB: "les règles de sécurité et restrictions d'accès aux attractions.",
    optionC: "le programme des animations de la saison.",
    optionD: "les horaires d'ouverture du parc.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Règlement de sécurité — Adventure Land",
    longText: DOC_REGLEMENT_PARC,
    question: "Selon ce règlement, qui est formellement interdit d'accès aux attractions mécaniques ?",
    optionA: "Les enfants de moins de 10 ans.",
    optionB: "Les personnes mesurant moins de 1,40 m.",
    optionC: "Les femmes enceintes.",
    optionD: "Les personnes de plus de 70 ans.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Développeur web full stack",
    longText: DOC_OFFRE_DEV_WEB,
    question: "Cette offre d'emploi est destinée à un candidat ayant…",
    optionA: "aucune expérience mais une forte motivation.",
    optionB: "au moins 3 ans d'expérience en développement web.",
    optionC: "un diplôme de niveau bac uniquement.",
    optionD: "une spécialisation exclusive en intelligence artificielle.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Développeur web full stack",
    longText: DOC_OFFRE_DEV_WEB,
    question: "Parmi les avantages proposés dans cette offre, on trouve…",
    optionA: "un véhicule de service et un logement.",
    optionB: "le télétravail 3 jours par semaine.",
    optionC: "des déplacements fréquents à l'étranger.",
    optionD: "un contrat CDD de 6 mois renouvelable.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat de prestation — Cabinet d'architecture",
    longText: DOC_CONTRAT_ARCHI,
    question: "Ce document est principalement…",
    optionA: "un permis de construire officiel.",
    optionB: "un contrat de prestation pour la conception d'un bâtiment.",
    optionC: "un devis estimatif de travaux de construction.",
    optionD: "une convention de partenariat immobilier.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat de prestation — Cabinet d'architecture",
    longText: DOC_CONTRAT_ARCHI,
    question: "Selon ce contrat, les honoraires du cabinet d'architecture représentent…",
    optionA: "un montant forfaitaire de 400 000 euros.",
    optionB: "8% du coût total de construction, soit 320 000 euros HT.",
    optionC: "10% du prix de vente final de l'immeuble.",
    optionD: "un tarif journalier sur toute la durée du chantier.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Accord collectif — Droits des salariés",
    longText: DOC_ACCORD_TRAVAIL,
    question: "Cet accord collectif a pour objectif principal de…",
    optionA: "réduire les effectifs de l'entreprise.",
    optionB: "améliorer les conditions de travail et renforcer les droits des salariés.",
    optionC: "augmenter la durée hebdomadaire de travail.",
    optionD: "supprimer les jours de RTT existants.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Accord collectif — Droits des salariés",
    longText: DOC_ACCORD_TRAVAIL,
    question: "Selon cet accord, l'indemnité de licenciement est…",
    optionA: "réduite de moitié par rapport au minimum légal.",
    optionB: "identique au minimum légal sans modification.",
    optionC: "majorée de 20% par rapport au minimum légal.",
    optionD: "supprimée pour les salariés en CDD.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide de prévention — Santé mentale au travail",
    longText: DOC_GUIDE_SANTE,
    question: "Ce guide a pour but principal de…",
    optionA: "informer sur les maladies chroniques en entreprise.",
    optionB: "prévenir les risques psychosociaux dans l'entreprise.",
    optionC: "présenter les nouveaux avantages sociaux de l'entreprise.",
    optionD: "former les managers à la gestion des conflits.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide de prévention — Santé mentale au travail",
    longText: DOC_GUIDE_SANTE,
    question: "Selon ce guide, combien de séances de psychologue du travail un salarié peut-il obtenir gratuitement par an ?",
    optionA: "2 séances.",
    optionB: "4 séances.",
    optionC: "6 séances.",
    optionD: "10 séances.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Télétravail et santé mentale : le double tranchant de la révolution numérique",
    longText: ART_TELETRAVAIL,
    question: "Selon cet article, le télétravail à temps plein…",
    optionA: "améliore systématiquement la santé mentale de tous les travailleurs.",
    optionB: "multiplie par trois le risque d'isolement professionnel.",
    optionC: "est recommandé par tous les spécialistes de la santé au travail.",
    optionD: "n'a aucun effet sur l'équilibre psychologique des salariés.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Télétravail et santé mentale : le double tranchant de la révolution numérique",
    longText: ART_TELETRAVAIL,
    question: "D'après l'article, quelle solution semble la plus efficace pour préserver la santé mentale ?",
    optionA: "Revenir entièrement au travail en présentiel.",
    optionB: "Interdire totalement le télétravail dans les grandes entreprises.",
    optionC: "Mettre en place une organisation hybride bien pensée.",
    optionD: "Imposer le télétravail 5 jours par semaine à tous.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Patrimoine architectural et rénovation : concilier histoire et modernité",
    longText: ART_PATRIMOINE,
    question: "Selon cet article, combien la France possède-t-elle de monuments historiques classés ou inscrits ?",
    optionA: "Plus de 10 000.",
    optionB: "Plus de 43 000.",
    optionC: "Environ 5 000.",
    optionD: "Plus de 100 000.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Patrimoine architectural et rénovation : concilier histoire et modernité",
    longText: ART_PATRIMOINE,
    question: "Selon l'article, quelle est la doctrine défendue par les architectes des Bâtiments de France ?",
    optionA: "La démolition des bâtiments dégradés pour construire du neuf.",
    optionB: "La réversibilité : toute intervention doit pouvoir être défaite sans abîmer l'original.",
    optionC: "La modernisation systématique des façades historiques.",
    optionD: "La privatisation du patrimoine pour mieux le financer.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Intelligence artificielle et emploi : une mutation sans précédent",
    longText: ART_IA_EMPLOI_CE21,
    question: "Selon cet article, entre 20 et 30% des tâches humaines actuelles pourraient être automatisées…",
    optionA: "d'ici l'année prochaine.",
    optionB: "d'ici 2030.",
    optionC: "d'ici 2050.",
    optionD: "d'ici 10 ans seulement dans les pays développés.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Intelligence artificielle et emploi : une mutation sans précédent",
    longText: ART_IA_EMPLOI_CE21,
    question: "D'après l'auteur, quel est le véritable enjeu de la transition vers l'IA ?",
    optionA: "L'achat massif de technologies par les gouvernements.",
    optionB: "La vitesse d'adaptation des travailleurs et des systèmes éducatifs.",
    optionC: "La réglementation internationale du développement de l'IA.",
    optionD: "L'interdiction des outils d'IA dans les secteurs sensibles.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Gastronomie régionale et tourisme : le goût comme passeport identitaire",
    longText: ART_GASTRONOMIE,
    question: "Selon cet article, le tourisme gastronomique en France représente annuellement…",
    optionA: "Plus de 30 milliards d'euros.",
    optionB: "Environ 5 milliards d'euros.",
    optionC: "Plus de 100 milliards d'euros.",
    optionD: "Moins d'un milliard d'euros.",
    correctAnswer: 'A',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Gastronomie régionale et tourisme : le goût comme passeport identitaire",
    longText: ART_GASTRONOMIE,
    question: "D'après l'article, quel rôle jouent les labels AOP et IGP dans le tourisme gastronomique ?",
    optionA: "Ils fixent les prix des produits locaux dans les marchés.",
    optionB: "Ils garantissent l'authenticité et servent d'outil marketing transformant un produit en récit culturel.",
    optionC: "Ils interdisent l'exportation des produits régionaux hors de France.",
    optionD: "Ils remplacent les formations culinaires traditionnelles.",
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
    console.log(`\n✅ ${created} questions créées pour CE 21.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
