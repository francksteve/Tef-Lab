'use strict';
/**
 * seed-ce-serie3.js
 * Peuple la série CE 3 avec les 40 questions officielles TEF Canada.
 * Usage : node scripts/seed-ce-serie3.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }        = require('pg');
const { PrismaPg }    = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmvz673j000ensxl6h5lux5h';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG : 4 graphiques de températures pour Q22
───────────────────────────────────────────────────────────────────────────── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [15,17,22,26,30,35,34,30,24,18,13,11], minY: 10, maxY: 38 },
    { label: 'Graphique 2', data: [26.5,26.9,26.7,26.3,25.8,25.2,24.8,24.4,24.6,25.0,25.6,26.1], minY: 23, maxY: 28 },
    { label: 'Graphique 3', data: [24,25,26.5,28,30,31,31.5,30,28,26,24.5,24], minY: 22, maxY: 34 },
    { label: 'Graphique 4', data: [9,11,14,18,22,27,31,30,25,18,12,9], minY: 5, maxY: 34 },
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
      `<circle cx="${sx(i)}" cy="${sy(t)}" r="3" fill="#003087"/>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
      `<text x="${cx+195}" y="${cy+23}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
      `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY+plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      `<line x1="${plotX}" y1="${plotY+plotH}" x2="${plotX+plotW}" y2="${plotY+plotH}" stroke="#d1d5db" stroke-width="1"/>` +
      grid + xlab +
      `<polyline points="${pts}" fill="none" stroke="#003087" stroke-width="2.5" stroke-linejoin="round"/>` +
      dots;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g,i) => drawChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Textes des documents réutilisés (paires Q23-32, Q33-40)
───────────────────────────────────────────────────────────────────────────── */

const DOC_SANTE_VOYAGE =
`IMPORTANT

Le voyageur est responsable de sa propre sécurité. Ne vous attendez pas à ce que les services médicaux soient les mêmes que ceux offerts au Canada, en particulier si vous vous rendez dans des zones éloignées des grands centres urbains ou dans des pays en développement.

EAU / ALIMENTS

La diarrhée du voyageur, très fréquente, se transmet par la consommation d'eau ou d'aliments contaminés. Le traitement le plus important est la réhydratation : buvez beaucoup de liquides et apportez des sels spécifiques. N'ingérez rien qui n'ait été bouilli ou cuit !`;

const DOC_UDEM =
`Certains programmes exigent la réussite de cours préalables ou de l'expérience pertinente dans le domaine. D'autres ne sont pas offerts aux candidates ou candidats étrangers, c'est le cas de plusieurs formations du domaine de la santé.

Pour être admissible, le candidat ou la candidate doit prouver que sa connaissance du français correspond aux exigences des études convoitées. L'UdeM a lancé un programme intensif de francisation universitaire.

Afin de permettre aux talents de tous les pays de concrétiser leur projet, l'UdeM propose plusieurs avantages, dont des bourses et des aides pour trouver un emploi étudiant.`;

const DOC_TRANSPARENCE_SANTE =
`Pour développer leurs produits, les entreprises de santé sont amenées à nouer des relations avec des experts, des journalistes et des acteurs publics. Cette complémentarité permet le progrès scientifique et thérapeutique, mais il faut que ces liens soient connus de tous et disponibles aisément.

Pilotée par le ministère de la Santé, la base de données Transparence – Santé permet à chaque citoyen d'apprécier en toute objectivité la nature de ces relations, leur objet et les montants exacts concernés.

Trois types sont distingués :
• les conventions impliquent des obligations réciproques, par exemple l'intervention lors d'un congrès moyennant la prise en charge des frais de déplacement ;
• les avantages recouvrent tout ce qui est alloué ou versé sans contrepartie ;
• les rémunérations sont les sommes versées en contrepartie d'un travail ou d'une prestation.

Les informations sont mises à jour deux fois par an par les entreprises. Leur déclaration fait foi.`;

const DOC_AREC =
`Ce projet de l'École supérieure des agricultures visait à accompagner les agriculteurs de la région Pays-de-la-Loire vers des pratiques plus respectueuses de l'environnement et à les communiquer auprès des consommateurs. Les équipes de recherche ont mené plusieurs actions :

• intégration d'indicateurs de la biodiversité dans l'évaluation des impacts environnementaux ;
• analyses sociologiques de la perception de la qualité des produits et des attentes des consommateurs ;
• identification des modalités de communication pour valoriser les pratiques environnementales ;
• étude de l'évolution agroécologique dans le cadre du changement climatique et impact sur la qualité des produits.`;

const DOC_EDUCATION_GREVE =
`Partout en France les actions locales se multiplient, démontrant la vigueur de la mobilisation pour l'abrogation des réformes lancées par le ministre Galtier depuis sa nomination :
• refonte du lycée et du baccalauréat ;
• loi relative à la réussite scolaire et à l'information sur l'orientation scolaire.

Puis vint la refonte de la voie professionnelle, diminuant les horaires des enseignements généraux. Ainsi s'empilent des réformes qui poursuivent la casse du service public d'éducation.

Les personnels de l'éducation, les familles et de nombreux(ses) élu(e)s refusent ces transformations radicales de notre école.

Nous refusons aussi la remise en question de la liberté d'expression des personnels comme le prévoit l'article 1 de la loi Galtier.

La CSE et le SNP Éducation considèrent qu'il faut tout mettre en œuvre pour empêcher le gouvernement de poursuivre sa politique, et appellent tous les personnels de l'Éducation nationale à se mettre en grève le jeudi 21 mai.`;

const ART_COTE_IVOIRE =
`« Le message, c'est : attention à la fraude, attention au racket, l'État vous voit », a déclaré la ministre en charge de la fonction publique.

Selon l'ONG Transparency International, la Côte d'Ivoire a amélioré sa performance ces dernières années. Mais « la perception des Ivoiriens en matière de corruption s'est peu améliorée », a reconnu la ministre. Propos étayés par une récente enquête réalisée par Afrobaromètre, selon laquelle un Ivoirien sur trois déclarait y avoir recours pour éviter des problèmes ou se faire délivrer des documents ; et deux tiers avouaient craindre des représailles en cas de dénonciation.

Plusieurs secteurs ont déjà été visés par des opérations visant à recueillir des preuves de corruption. La police et la gendarmerie sont dans le collimateur, notamment pour les pots-de-vin prélevés aux vendeurs de produits vivriers sur les routes de Côte d'Ivoire. « Ces pratiques ont un lien direct avec la vie chère ! », a martelé la ministre, alors que la population se plaint des prix des denrées alimentaires.

L'éducation, la santé et la justice sont également suivies de près. À la suite de ces opérations, le commissaire du gouvernement a été saisi.`;

const ART_EMOTIONS =
`Avouez que, ces dernières années, les envies de tout raser à la tractopelle ou de servir une descente du coude à certaines têtes à claques se sont multipliées. Ces émotions teintées de haine, parfois cultivées à l'échelle collective, devraient-elles nous inquiéter ? Pas nécessairement, répond la Dre Garibian, psychologue à Montréal, pour qui « les conditions de vie modernes font que nous sommes en situation de stress chronique, ce qui nous rend beaucoup plus intolérants et irritables ». À ses yeux, il faut tout d'abord accepter ce ressenti, car l'émotion réprimée pourrait provoquer d'autres ennuis de santé. Il faut cependant veiller aux conditions et aux conséquences de cette expression, qui peut causer des torts irréversibles en se tournant vers quelqu'un qui ne le mérite pas : « l'hostilité ouvre la porte au clivage et à la radicalisation ».

L'énergie négative peut être évacuée grâce à la dépense sportive, très efficace, mais aussi l'écriture ou encore le dialogue avec des gens en qui on a confiance. Et se défouler sur les réseaux sociaux ? Mauvaise idée. « Il y a un risque de déshumanisation, et on s'expose aussi à l'effet d'entraînement », prévient la psychologue.`;

const ART_CAMBODGE =
`Pays du sourire, le Cambodge est un pays attachant, généreux et les Cambodgiens un peuple dont on ne peut qu'admirer l'optimisme et la résilience. Quand on évoque son nom, c'est l'image d'Angkor qui s'impose à nous, ses ruines monumentales qui ont inspiré tant de voyageurs, d'archéologues et d'artistes, ses danseuses suspendues, majestueuses. Côté face, la période des Khmers rouges (1975-1979) fut celle d'une horreur mortifère, d'une négation humaine qu'on ne sait pas comment dire ni guérir. Entre ces extrêmes d'histoire simplifiée, quelles grilles de lecture seraient à même de nous aider à déceler la complexité du pays, sans l'enfermer dans des boîtes conceptuelles ?

Il est, en effet, frappant de constater que les Cambodgiens se réfèrent en permanence au mythe prestigieux de l'Empire khmer disparu depuis 600 ans et occultent complètement l'histoire récente plus troublée, par peur ou gêne : protectorat français, occupation vietnamienne, présence des casques bleus…

Quant à la réalité du Cambodge aujourd'hui, c'est celle d'un État assisté : la moitié du budget national est financée par l'aide internationale ; ce sont des écarts de richesse d'autant plus choquants qu'ils sont le résultat de passe-droits abusivement décernés à des milieux d'affaires débridés ; c'est un espace de concurrence entre d'encombrants voisins. C'est enfin une société obligée de fonctionner sur de nouvelles bases peu conformes à ses aspirations.`;

const ART_QUEBEC =
`On aura beau actionner tous les recyclages, la société québécoise est et sera aux prises avec une pénurie de main-d'œuvre chronique aussi loin que l'on puisse voir dans l'avenir. La plupart des entreprises québécoises y font face présentement, et la situation n'est pas meilleure dans le secteur public. Il est inexact de prétendre que la situation est identique dans toutes les provinces du Canada. La différence se situe dans la croissance démographique attendue d'ici 2050 : par exemple, la population de l'Ontario, notre voisin et principal partenaire économique, totalisera 20 millions de personnes (+ 35 %), la nôtre, un peu moins de 10 millions.

La proportion des 65 ans et plus croîtra progressivement pour totaliser 2,6 millions de Québécois. De quelle main-d'œuvre aurons-nous besoin alors pour offrir à ces aînés les services à domicile ou institutionnels exigés par leur situation ? Quelles sont les masses critiques de citoyens requises d'ici 2050 pour que chaque région demeure viable, dynamique et attrayante ?

Faisons aussi l'examen honnête des causes du départ massif des immigrants venus au Québec après les dix-huit premiers mois de leur arrivée, et la révision de nos systèmes d'accueil, y compris l'offre de francisation qui doit devenir, en quantité et en qualité, l'une de nos politiques les plus avancées.

Le Québec doit conforter sa première richesse, sa richesse humaine. Le temps est donc venu de créer une commission d'enquête comme on l'a fait dans le passé, et avec succès, quand il nous a fallu éclairer notre avenir en matière d'éducation, de santé et de bien-être social, de politique linguistique, de relation entre les autochtones et certains services publics, de liberté syndicale, etc. Car si rien n'est entrepris, il faut craindre l'affadissement d'une société et l'effondrement de son modèle social.`;

/* ─────────────────────────────────────────────────────────────────────────────
   Textes JSON pour Q18-21
───────────────────────────────────────────────────────────────────────────── */
const TEXTS_Q18 = JSON.stringify([
  { title: 'Reportage 1', content: "Du 16 septembre au 16 octobre se tient la nouvelle édition de « Nourrir Bruxelles », le festival de la transition alimentaire, écologique et sociale en région bruxelloise. Plus d'une centaine d'activités sont proposées sur un mois !" },
  { title: 'Reportage 2', content: "Le 10 octobre dernier, la marche #ClimateBrussels a une fois de plus démontré l'engagement des jeunes. Car ils étaient présents en nombre et parlaient d'une même voix, qu'ils soient francophones ou flamands." },
  { title: 'Reportage 3', content: "La voiture est encore et toujours notre mode de transport privilégié. Il y en a presque six millions en Belgique, ce qui représente plus d'une voiture pour deux habitants. Pourquoi ne pas la partager ?" },
  { title: 'Reportage 4', content: "Pollution, recyclage, sobriété énergétique, biodiversité… des sujets au cœur d'une expérimentation à Namur, où l'éducation au développement durable dans toutes les écoles a été mise en pratique." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Compte bancaire 1', content: "Pour qui : toute personne physique (sans condition d'âge, de nationalité ou de résidence). Frais d'ouverture : 5 €. Pas de versement initial minimum. Retrait d'argent possible à tout moment et sans frais. Rémunération de 1 % net garantie par l'État." },
  { title: 'Compte bancaire 2', content: "Pour qui : toute personne physique ou morale. Versements libres jusqu'à un plafond de 12 000 €. Rémunération : 2 % net exonérée d'impôts. Possibilité de verser un ou plusieurs dons à l'une des 17 associations appartenant au domaine de l'économie sociale et solidaire." },
  { title: 'Compte bancaire 3', content: "Pour qui : toute personne physique dont le revenu est inférieur à une limite fixée par l'État. Aucun frais d'ouverture. Versement initial minimum de 30 €. Rémunération fixée réglementairement et garantie. Retraits possibles à tout moment et sans frais, au guichet uniquement." },
  { title: 'Compte bancaire 4', content: "Pour qui : toute personne physique âgée de 12 à 25 ans. Aucun frais d'ouverture. Versement initial minimum de 10 €. Carte de retrait gratuite. Retraits possibles à tout moment et sans frais. Durée : jusqu'au 31 décembre de l'année de votre 25e anniversaire." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Parcours professionnel 1', content: "J'ai commencé dans un tout autre métier puisque je viens du monde de la petite enfance. Puis un jour j'ai dû poser de la faïence dans ma salle de bains, ça m'a plu et je me suis dit « pourquoi pas ? » J'ai demandé à faire un apprentissage dans l'entreprise où je suis aujourd'hui, et j'ai obtenu mon diplôme." },
  { title: 'Parcours professionnel 2', content: "J'ai fait un apprentissage, c'est-à-dire qu'on varie entre école et entreprise. C'est vrai que je n'avais pas envie de faire des études longues, mais surtout le gros avantage c'est qu'on est payé comme un salarié normal. Ensuite, j'ai été embauché par les travaux publics, et depuis ce jour je ne regrette rien." },
  { title: 'Parcours professionnel 3', content: "J'ai commencé l'apprentissage de la maçonnerie à 14 ans, et c'est quelque chose de motivant, de valorisant puisqu'à la fin du mois on a un salaire alors qu'on se forme. Et puis quand on tombe sur les bonnes personnes – et c'est souvent le cas – on apprend très vite et dans de bonnes conditions." },
  { title: 'Parcours professionnel 4', content: "Je faisais de l'escalade dans un club, et un jour j'ai observé des artisans couvreurs sur un toit, et je me suis dit que je pourrais allier ma passion à un métier. J'ai passé mon diplôme en alternance. Et je confirme, j'ai retrouvé certains gestes de l'escalade, et les notions de sécurité, de solidarité." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Critique 1', content: "En renouant avec ses origines maliennes, Abderrahmane Sissako livre un beau film consacré à la force du lien, malgré l'exil. Entre documentaire et fiction, politique et poésie, chaque nouveau plan naît du précédent et enrichit le suivant. Le film, qui s'ouvre et se clôt sur l'envoi d'une lettre, mêle avec brio l'écrit et l'image." },
  { title: 'Critique 2', content: "Ponctué par des citations d'Aimé Césaire, La Vie sur terre saisit dans une attention extrême la vie quotidienne du petit village, Sokolo, dans lequel Sissako se fond dès son arrivée en quittant ses vêtements d'Européen et en enfourchant un vélo. C'est d'ailleurs ainsi qu'il croisera le chemin de Nana, personnage féminin par qui la fiction s'introduit." },
  { title: 'Critique 3', content: "Que Sissako filme un arbre à l'horizon, un mur en torchis ocre ou évoque un soleil implacable, dévorant et désertifiant les terres, par les déplacements successifs d'hommes assis acculés contre une maison à mesure que l'ombre se consume, ses plans sont de toute beauté et riches de sens. La caméra interroge le passé, le présent, le futur du continent." },
  { title: 'Critique 4', content: "Abderrahmane Sissako livre ici un film sur le déplacement, qu'il soit intérieur, géographique ou cinématographique. Sissako a tourné sans scénario, mû par le désir de saisir les opportunités offertes par le hasard, en laissant l'Afrique s'imposer à lui et impressionner la pellicule de sa lumière, de ses gestes, et de son rapport au temps." },
]);

/* ─────────────────────────────────────────────────────────────────────────────
   Helper
───────────────────────────────────────────────────────────────────────────── */
const q = (order, cat, sub, data) => ({
  moduleId: MODULE_ID, seriesId: SERIES_ID, questionOrder: order, category: cat,
  subCategory: sub ?? null,
  taskTitle: data.taskTitle ?? null, longText: data.longText ?? null,
  consigne: data.consigne ?? null,   comment: data.comment ?? null,
  imageUrl: data.imageUrl ?? null,   audioUrl: null,
  question: data.question,
  optionA: data.optionA, optionB: data.optionB, optionC: data.optionC, optionD: data.optionD,
  correctAnswer: data.correctAnswer,
  explanation: data.explanation ?? null,
});

/* ─────────────────────────────────────────────────────────────────────────────
   Questions 1 – 7 : Documents divers
───────────────────────────────────────────────────────────────────────────── */
function buildQuestions() {
  const qs = [];

  // Q1 – programme TV
  qs.push(q(1,'Q1-7',null,{
    longText:`Soirée

18 h 02  Bigfoot Junior
Grand public  FILM

19 h 44  Grizzly et les lemmings
6 à 8 ans  ÉMISSION

20 h 02  Cette année-là
Grand public  ÉMISSION

21 h 02  De garde 24/7
Grand public  DOCUMENTAIRE`,
    question:'Ce document est…',
    optionA:'un ticket de caisse.',optionB:'une petite annonce.',
    optionC:'un programme télé.',optionD:"un courrier d'invitation.",
    correctAnswer:'C',
  }));

  // Q2 – étiquette confiture
  qs.push(q(2,'Q1-7',null,{
    longText:`Confiture extra : Fruits tropicaux

Ingrédients : banane (20 %), mangue (20 %), maracudja (10 %), sucre, pectine de fruits, acide citrique.

Préparé en Guadeloupe par Exotic'food.
À conserver au frais après ouverture.`,
    question:'On peut lire cette information…',
    optionA:'sur un livre pour enfants.',optionB:'sur une porte de magasin.',
    optionC:'sur un produit alimentaire.',optionD:"sur une étiquette de vêtement.",
    correctAnswer:'C',
  }));

  // Q3 – courriel professionnel
  qs.push(q(3,'Q1-7',null,{
    longText:`De : c.squillacci@esa-tech.com
À : Moi, 6 autres

À toute l'équipe marketing,

Je vous informe que, malgré le contexte économique actuel, la Direction maintient les objectifs de notre service. À ce jour, aucune suppression de poste n'est donc envisagée.

Encore merci pour votre implication quotidienne ! Ensemble, nous réussirons à passer cette période difficile.

Bien à vous,
Célia Squillacci
Responsable Marketing`,
    question:"L'auteur de ce courriel…",
    optionA:'critique une décision.',optionB:'propose une réunion.',
    optionC:'rassure ses collègues.',optionD:'annonce des changements.',
    correctAnswer:'C',
  }));

  // Q4 – journée ODD Cotonou
  qs.push(q(4,'Q1-7',null,{
    longText:`Mercredi 3 mars, la mairie de Cotonou a organisé une journée de sensibilisation et d'échanges sur les Objectifs du Développement Durable (ODD). Une visite guidée de l'exposition « La recherche au service du développement » a permis au public de comprendre le rôle de la recherche dans l'atteinte des ODD.

L'exposition restera visible pendant trois semaines.`,
    question:'Ce document annonce…',
    optionA:'une performance artistique.',optionB:'un changement de politique.',
    optionC:"un bilan sur l'environnement.",optionD:"une action de communication.",
    correctAnswer:'D',
  }));

  // Q5 – Prix Santé Entrepreneurs
  qs.push(q(5,'Q1-7',null,{
    longText:`Le Prix Santé Entrepreneurs valorise des actions originales pour la santé et le bien-être dans l'entreprise. Le dernier lauréat est l'entreprise familiale Natur'Aliments, qui réunit une fois par an ses salariés pour décider en commun de projets à mener, par exemple un jardin partagé sur le toit ou la construction d'une cantine autogérée.`,
    question:"L'entreprise Natur'Aliments…",
    optionA:"a été récompensée pour ses initiatives.",
    optionB:"a financé la reconversion de ses salariés.",
    optionC:"a reçu un label qualité pour ses produits.",
    optionD:"a créé un espace santé pour le personnel.",
    correctAnswer:'A',
  }));

  // Q6 – roman Les yeux rouges
  qs.push(q(6,'Q1-7',null,{
    longText:`LES YEUX ROUGES

Une animatrice radio reçoit un message d'un admirateur sur Facebook. Elle ne répond pas, il insiste. C'est l'amorce d'un piège suffocant...

Superbe récit sur les méfaits des réseaux sociaux. Myriam Leroy relate les discussions stériles, méchantes et agressives qui foisonnent sur Internet. Elle dénonce la misogynie, la violence, la haine que l'être humain est capable de développer.

Myriam Leroy est journaliste et écrivain belge. Les yeux rouges est son deuxième roman.`,
    question:"Dans ce roman, l'auteure décrit…",
    optionA:"une histoire d'amour qui finit mal.",
    optionB:"le travail quotidien d'une journaliste.",
    optionC:"le sexisme dans le monde de la radio.",
    optionD:"une situation de harcèlement numérique.",
    correctAnswer:'D',
  }));

  // Q7 – association Bouqu'1
  qs.push(q(7,'Q1-7',null,{
    longText:`QUI SOMMES-NOUS ?

L'association Bouqu'1 propose un service gratuit de récupération de livres d'occasion qui seront valorisés par la revente sur Internet et le don aux bibliothèques associatives.

Nous employons des personnes hébergées en centre d'urgence. L'idée est de les aider à rebondir grâce à ce nouveau job et de les accompagner vers une solution de logement autonome.

Les postes proposés sont de deux types :
• collecte : chauffeur, livreur ;
• logistique : préparation des commandes.

Votre appui est précieux !`,
    question:'Cette association…',
    optionA:"donne une seconde vie aux livres usagés.",
    optionB:"héberge des personnes en situation précaire.",
    optionC:"distribue des livres aux familles à faible revenu.",
    optionD:"forme des chômeurs au métier de bibliothécaire.",
    correctAnswer:'A',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Questions 8 – 13 : Phrases lacunaires
  ─────────────────────────────────────────────────────────────────────────── */
  const PHRASE_Q = 'Dans cette phrase, indiquez le mot ou le groupe de mots manquant.';

  qs.push(q(8,'Q8-17','Phrases',{
    longText:'Vancouver et Toronto sont des ................ du Canada.',
    question:PHRASE_Q,
    optionA:'pays',optionB:'villes',optionC:'origines',optionD:'nationalités',
    correctAnswer:'B',
  }));
  qs.push(q(9,'Q8-17','Phrases',{
    longText:'Je suis très en retard, je vous demande ................ .',
    question:PHRASE_Q,
    optionA:'merci',optionB:'désolé',optionC:'pardon',optionD:'excuses',
    correctAnswer:'C',
  }));
  qs.push(q(10,'Q8-17','Phrases',{
    longText:'Sorti en 1998, Déserts est le premier film ................ par Malcom J. Reilly.',
    question:PHRASE_Q,
    optionA:'édité',optionB:'publié',optionC:'réalisé',optionD:'procédé',
    correctAnswer:'C',
  }));
  qs.push(q(11,'Q8-17','Phrases',{
    longText:"Bruder, le roman culte de Karlie Schwitz, ressort dans une nouvelle ........................ en français.",
    question:PHRASE_Q,
    optionA:'traduction',optionB:'translation',optionC:'conversion',optionD:'interprétation',
    correctAnswer:'A',
  }));
  qs.push(q(12,'Q8-17','Phrases',{
    longText:"À quelle heure serais-tu ................ demain matin ? C'est pour une réunion avec l'équipe informatique.",
    question:PHRASE_Q,
    optionA:'adapté',optionB:'concerné',optionC:'accessible',optionD:'disponible',
    correctAnswer:'D',
  }));
  qs.push(q(13,'Q8-17','Phrases',{
    longText:"Le Salon de l'hôtellerie est une formidable ................ de rencontrer des professionnels d'un secteur qui embauche.",
    question:PHRASE_Q,
    optionA:'alternative',optionB:'éventualité',optionC:'opportunité',optionD:'circonstance',
    correctAnswer:'C',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Questions 14 – 17 : Textes lacunaires
  ─────────────────────────────────────────────────────────────────────────── */
  const TEXT_BIENVENUE =
`En poursuivant votre ...................... (14) sur notre site Web, vous acceptez l'utilisation de fichiers témoins (« cookies »). Le musée d'art contemporain de Montréal, sa fondation et ses partenaires se servent de ceux-ci afin de bonifier votre expérience de visite et de vous recommander des services adaptés, ...................... (15) nos conditions d'utilisation.`;

  qs.push(q(14,'Q8-17','Textes',{
    taskTitle:'Bienvenue !',
    longText:TEXT_BIENVENUE,
    question:'Dans ce texte, indiquez le mot ou le groupe de mots manquant en (14).',
    optionA:'voyage',optionB:'conduite',optionC:'direction',optionD:'navigation',
    correctAnswer:'D',
  }));
  qs.push(q(15,'Q8-17','Textes',{
    taskTitle:'Bienvenue !',
    longText:TEXT_BIENVENUE,
    question:'Dans ce texte, indiquez le mot ou le groupe de mots manquant en (15).',
    optionA:'suite à',optionB:'permis par',optionC:"au besoin de",optionD:'conformément à',
    correctAnswer:'D',
  }));

  const TEXT_VISA =
`Les politiques en matière de visa reflètent les rapports de force. Les pays qui se regardent en chiens de faïence ont ......................... (16) exiger un visa. Avec des résultats parfois paradoxaux. La frontière terrestre est fermée entre l'Algérie et le Maroc mais les ......................... (17) des deux pays n'ont pas besoin de visa pour se rendre chez leur voisin.`;

  qs.push(q(16,'Q8-17','Textes',{
    longText:TEXT_VISA,
    question:'Dans ce texte, indiquez le mot ou le groupe de mots manquant en (16).',
    optionA:'affaire à',optionB:'vocation à',optionC:'tendance à',optionD:'autorisation à',
    correctAnswer:'C',
  }));
  qs.push(q(17,'Q8-17','Textes',{
    longText:TEXT_VISA,
    question:'Dans ce texte, indiquez le mot ou le groupe de mots manquant en (17).',
    optionA:'visiteurs',optionB:'détenteurs',optionC:'immigrants',optionD:'ressortissants',
    correctAnswer:'D',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Questions 18 – 21 : Lecture rapide de textes (JSON 4×)
  ─────────────────────────────────────────────────────────────────────────── */
  qs.push(q(18,'Q18-21',null,{
    longText:TEXTS_Q18,
    question:"Quel reportage parle d'un projet avec des enfants ?",
    optionA:'Reportage 1.',optionB:'Reportage 2.',optionC:'Reportage 3.',optionD:'Reportage 4.',
    correctAnswer:'D',
  }));
  qs.push(q(19,'Q18-21',null,{
    longText:TEXTS_Q19,
    question:'Quel compte bancaire est accessible sous conditions de ressources ?',
    optionA:'Compte bancaire 1.',optionB:'Compte bancaire 2.',
    optionC:'Compte bancaire 3.',optionD:'Compte bancaire 4.',
    correctAnswer:'C',
  }));
  qs.push(q(20,'Q18-21',null,{
    longText:TEXTS_Q20,
    question:'Quel parcours correspond à une reconversion professionnelle ?',
    optionA:'Parcours professionnel 1.',optionB:'Parcours professionnel 2.',
    optionC:'Parcours professionnel 3.',optionD:'Parcours professionnel 4.',
    correctAnswer:'A',
  }));
  qs.push(q(21,'Q18-21',null,{
    longText:TEXTS_Q21,
    question:"Quelle critique évoque l'improvisation comme parti pris du réalisateur ?",
    optionA:'Critique 1.',optionB:'Critique 2.',optionC:'Critique 3.',optionD:'Critique 4.',
    correctAnswer:'D',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Question 22 : Lecture rapide de graphiques
  ─────────────────────────────────────────────────────────────────────────── */
  qs.push(q(22,'Q22',null,{
    consigne:'Observez les quatre graphiques et répondez à la question.',
    imageUrl:generateQ22SVG(),
    question:'Quel graphique correspond au commentaire ?',
    comment:'« Le climat dominant de Douala est de type tropical, avec une faible amplitude thermique : les températures moyennes varient de 2,5 degrés sur l\'année. Février culmine à 26,9 °C, tandis qu\'août est le mois le plus frais avec 24,4 °C. »',
    optionA:'Graphique 1.',optionB:'Graphique 2.',optionC:'Graphique 3.',optionD:'Graphique 4.',
    correctAnswer:'B',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Questions 23 – 32 : Documents administratifs et professionnels
  ─────────────────────────────────────────────────────────────────────────── */
  const CONSIGNE_DOC = 'Lisez ce document et répondez aux questions.';

  // Q23-24 : conseils de santé aux voyageurs
  qs.push(q(23,'Q23-32',null,{
    consigne:CONSIGNE_DOC, longText:DOC_SANTE_VOYAGE,
    question:'Ce document donne…',
    optionA:'des conseils de santé aux futurs voyageurs.',
    optionB:"le contact des hôpitaux canadiens à l'étranger.",
    optionC:'des consignes aux voyageurs arrivant au Canada.',
    optionD:'la liste des maladies tropicales les plus courantes.',
    correctAnswer:'A',
  }));
  qs.push(q(24,'Q23-32',null,{
    consigne:CONSIGNE_DOC, longText:DOC_SANTE_VOYAGE,
    question:'Selon ce document, …',
    optionA:"l'eau est le meilleur des médicaments.",
    optionB:'le sel limite les contaminations alimentaires.',
    optionC:"la consommation d'aliments crus est à proscrire.",
    optionD:"la déshydratation est fréquente après un long vol.",
    correctAnswer:'C',
  }));

  // Q25-26 : Guide UdeM
  qs.push(q(25,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:"Extrait du Guide d'admission à l'Université de Montréal (UdeM)",
    longText:DOC_UDEM,
    question:'Selon ce document, …',
    optionA:'certains programmes sont réservés aux étrangers.',
    optionB:"l'expérience professionnelle est toujours nécessaire.",
    optionC:'les critères de sélection varient selon les programmes.',
    optionD:'les professionnels de la santé sont dispensés des formalités.',
    correctAnswer:'C',
  }));
  qs.push(q(26,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:"Extrait du Guide d'admission à l'Université de Montréal (UdeM)",
    longText:DOC_UDEM,
    question:'Ce document précise…',
    optionA:'que les candidatures doivent être rédigées en français.',
    optionB:'que la maîtrise de la langue française est un prérequis.',
    optionC:'que les étudiants étrangers ne peuvent travailler au Québec.',
    optionD:"que l'université propose des bourses pour étudier à l'étranger.",
    correctAnswer:'B',
  }));

  // Q27-28 : TRANSPARENCE – SANTÉ
  qs.push(q(27,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:'TRANSPARENCE – SANTÉ',
    longText:DOC_TRANSPARENCE_SANTE,
    question:"L'initiative du ministère de la Santé a pour objectif…",
    optionA:'de poursuivre en justice les auteurs de corruption.',
    optionB:'de rendre publics les liens entre les acteurs de la santé.',
    optionC:'de mettre un terme aux pratiques tarifaires abusives.',
    optionD:'de clarifier ses relations avec les entreprises de santé.',
    correctAnswer:'B',
  }));
  qs.push(q(28,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:'TRANSPARENCE – SANTÉ',
    longText:DOC_TRANSPARENCE_SANTE,
    question:"D'après ce document, les entreprises de santé…",
    optionA:'recourent abusivement à des compétences externes.',
    optionB:'rechignent à publier les coûts réels de leurs produits.',
    optionC:'ont une obligation de transparence sur leur situation financière.',
    optionD:'alimentent à leur discrétion la base de données du ministère.',
    correctAnswer:'D',
  }));

  // Q29-30 : AREC
  qs.push(q(29,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:'Séminaire de restitution du projet AREC',
    longText:DOC_AREC,
    question:'Le projet AREC avait pour objectif…',
    optionA:'de certifier « bio » les agriculteurs les plus vertueux.',
    optionB:'de mesurer les effets du dérèglement climatique.',
    optionC:'de fédérer les acteurs du secteur agroécologique.',
    optionD:'de fournir des outils pour la transition écologique.',
    correctAnswer:'D',
  }));
  qs.push(q(30,'Q23-32',null,{
    consigne:CONSIGNE_DOC,
    taskTitle:'Séminaire de restitution du projet AREC',
    longText:DOC_AREC,
    question:'Il a notamment permis…',
    optionA:"de développer des produits éco-responsables.",
    optionB:"de définir les régions les plus exposées à la crise.",
    optionC:"de comprendre le point de vue des consommateurs.",
    optionD:"de renforcer la biodiversité dans les zones agricoles.",
    correctAnswer:'C',
  }));

  // Q31-32 : appel à la grève
  qs.push(q(31,'Q23-32',null,{
    consigne:CONSIGNE_DOC, longText:DOC_EDUCATION_GREVE,
    question:'Les auteurs de ce document…',
    optionA:"appellent à la grève générale en France.",
    optionB:"invitent les autres syndicats à les rejoindre.",
    optionC:"annoncent leurs revendications pour l'école.",
    optionD:"alertent sur la destruction de l'Éducation nationale.",
    correctAnswer:'C',
  }));
  qs.push(q(32,'Q23-32',null,{
    consigne:CONSIGNE_DOC, longText:DOC_EDUCATION_GREVE,
    question:'Ils dénoncent notamment…',
    optionA:'la mise au pas de la profession.',
    optionB:'la vision court-termiste du ministre.',
    optionC:'la dégradation des conditions de travail.',
    optionD:"l'absence de concertation sur les réformes.",
    correctAnswer:'A',
  }));

  /* ───────────────────────────────────────────────────────────────────────────
     Questions 33 – 40 : Articles de presse
  ─────────────────────────────────────────────────────────────────────────── */
  const CONSIGNE_ART = 'Lisez cet article et répondez aux questions.';

  // Q33-34 : Côte d'Ivoire
  qs.push(q(33,'Q33-40',null,{
    consigne:CONSIGNE_ART,
    taskTitle:"En Côte d'Ivoire, des opérations « coup de poing » dans les services publics",
    longText:ART_COTE_IVOIRE,
    question:'Selon cet article, la corruption…',
    optionA:'a dramatiquement augmenté depuis 10 ans.',
    optionB:'fait chuter le prix des produits de consommation.',
    optionC:"est systématiquement dénoncée par la population.",
    optionD:"est notamment présente dans les forces de l'ordre.",
    correctAnswer:'D',
  }));
  qs.push(q(34,'Q33-40',null,{
    consigne:CONSIGNE_ART,
    taskTitle:"En Côte d'Ivoire, des opérations « coup de poing » dans les services publics",
    longText:ART_COTE_IVOIRE,
    question:'Les résultats des investigations…',
    optionA:'ont entraîné des représailles.',
    optionB:'ont été transmis aux autorités.',
    optionC:'ont donné lieu à des arrestations.',
    optionD:"sont en cours d'analyse par des ONG.",
    correctAnswer:'B',
  }));

  // Q35-36 : émotions négatives
  qs.push(q(35,'Q33-40',null,{
    consigne:CONSIGNE_ART, longText:ART_EMOTIONS,
    question:"D'après cet article, …",
    optionA:'les émotions négatives sont liées au mode de vie.',
    optionB:"l'humanité s'est construite dans la peur de l'autre.",
    optionC:'les réseaux sociaux exacerbent les tensions sociales.',
    optionD:"la société est de plus en plus intolérante à la différence.",
    correctAnswer:'A',
  }));
  qs.push(q(36,'Q33-40',null,{
    consigne:CONSIGNE_ART, longText:ART_EMOTIONS,
    question:'Selon la psychologue, …',
    optionA:'déverser sa colère sur ses proches est naturel.',
    optionB:'refouler nos émotions protège notre entourage.',
    optionC:'identifier les personnalités toxiques est essentiel.',
    optionD:"s'exprimer sans filtre peut nuire à autrui.",
    correctAnswer:'D',
  }));

  // Q37-38 : Cambodge
  qs.push(q(37,'Q33-40',null,{
    consigne:CONSIGNE_ART, longText:ART_CAMBODGE,
    question:'Selon cet article, …',
    optionA:'les Cambodgiens cultivent sciemment leur propre légende.',
    optionB:'les historiens du Cambodge manquent de sources récentes.',
    optionC:'les traditions cambodgiennes disparaissent inexorablement.',
    optionD:"la documentation sur le Cambodge est empreinte d'idéologie.",
    correctAnswer:'A',
  }));
  qs.push(q(38,'Q33-40',null,{
    consigne:CONSIGNE_ART, longText:ART_CAMBODGE,
    question:"L'auteur met en lumière…",
    optionA:"l'influence culturelle des puissances voisines.",
    optionB:'les paradoxes qui rendent le pays insaisissable.',
    optionC:"la prédation de l'aide internationale par les élites.",
    optionD:'la perte du capital sympathie dont jouissait le pays.',
    correctAnswer:'B',
  }));

  // Q39-40 : Construire l'avenir (Québec)
  qs.push(q(39,'Q33-40',null,{
    consigne:CONSIGNE_ART,
    taskTitle:"Construire l'avenir",
    longText:ART_QUEBEC,
    question:'Selon cet article, le Québec…',
    optionA:"connaît sa première véritable crise d'identité.",
    optionB:"peine à retenir à long terme sa population immigrée.",
    optionC:"possède la main-d'œuvre la plus vieillissante du Canada.",
    optionD:"voit sa jeunesse enlisée dans les emplois précaires.",
    correctAnswer:'B',
  }));
  qs.push(q(40,'Q33-40',null,{
    consigne:CONSIGNE_ART,
    taskTitle:"Construire l'avenir",
    longText:ART_QUEBEC,
    question:"L'auteur de cet article préconise…",
    optionA:"de simplifier les procédures d'immigration.",
    optionB:"de revaloriser l'emploi dans le service public.",
    optionC:"de réduire la dépendance stratégique à l'Ontario.",
    optionD:"de définir d'urgence une politique démographique.",
    correctAnswer:'D',
  }));

  return qs;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function main() {
  const rawUrl = process.env.DATABASE_URL ?? '';
  const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify');
  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  try {
    // Supprimer les questions existantes de cette série
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
    console.log(`\n✅ ${created} questions créées pour CE 3.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
