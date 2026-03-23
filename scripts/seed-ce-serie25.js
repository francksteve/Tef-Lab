'use strict';
/**
 * seed-ce-serie25.js
 * Peuple la série CE 25 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie25.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoi4u000l0wxlw6s12by8';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART (fréquentation stations de ski 4 courbes annuelles) correctAnswer='D' ── */
function generateQ22SVG() {
  const years = ['2018','2019','2020','2021','2022','2023'];
  const graphDefs = [
    {
      label: 'Graphique 1',
      lines: [
        { color: '#E30613', data: [950, 920, 600, 750, 870, 830] },
        { color: '#003087', data: [1200, 1180, 700, 900, 1050, 980] },
        { color: '#16a34a', data: [700, 680, 400, 550, 640, 600] },
        { color: '#f59e0b', data: [500, 520, 300, 400, 460, 440] },
      ]
    },
    {
      label: 'Graphique 2',
      lines: [
        { color: '#E30613', data: [1100, 950, 600, 780, 860, 820] },
        { color: '#003087', data: [800, 820, 500, 650, 700, 680] },
        { color: '#16a34a', data: [600, 580, 350, 450, 500, 490] },
        { color: '#f59e0b', data: [400, 420, 250, 350, 390, 380] },
      ]
    },
    {
      label: 'Graphique 3',
      lines: [
        { color: '#E30613', data: [900, 930, 580, 720, 860, 840] },
        { color: '#003087', data: [700, 720, 450, 580, 660, 650] },
        { color: '#16a34a', data: [1200, 1100, 700, 950, 1050, 1020] },
        { color: '#f59e0b', data: [500, 510, 320, 420, 470, 460] },
      ]
    },
    {
      label: 'Graphique 4',
      lines: [
        { color: '#E30613', data: [920, 900, 580, 730, 870, 850] },
        { color: '#003087', data: [600, 620, 380, 500, 560, 550] },
        { color: '#16a34a', data: [700, 720, 460, 600, 680, 670] },
        { color: '#f59e0b', data: [850, 845, 860, 840, 855, 850] }, // CORRECT — station D stable ~850k
      ]
    },
  ];

  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];

  function drawLineChart(gDef, cx, cy) {
    const plotX = cx + 45, plotY = cy + 30, plotW = 310, plotH = 130;
    const minVal = 0, maxVal = 1400;
    const n = years.length;
    const step = plotW / (n - 1);

    const gridLines = [0, 400, 800, 1200].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const polylines = gDef.lines.map(line => {
      const pts = line.data.map((v, i) => {
        const x = (plotX + i * step).toFixed(1);
        const y = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
        return `${x},${y}`;
      }).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${line.color}" stroke-width="2.5"/>`;
    }).join('');

    const xLabels = years.map((yr, i) => {
      const x = (plotX + i * step).toFixed(1);
      return `<text x="${x}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${yr}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="195" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 20}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${gDef.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + polylines + xLabels +
           `<text x="${cx + 195}" y="${cy + 190}" text-anchor="middle" font-size="8" fill="#9ca3af">Skieurs (milliers)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="428">` +
    `<rect width="820" height="428" fill="#f9fafb" rx="8"/>` +
    graphDefs.map((g, i) => drawLineChart(g, positions[i].cx, positions[i].cy)).join('') +
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
  { title: 'Révolution 1', content: "La Révolution française de 1789 est l'un des événements les plus marquants de l'histoire mondiale. Elle a renversé la monarchie absolue et établi les principes de liberté, d'égalité et de fraternité. La Déclaration des Droits de l'Homme et du Citoyen, adoptée en 1789, a posé les fondements du droit moderne. Cette révolution politique a inspiré de nombreux mouvements démocratiques à travers le monde au XIXe siècle." },
  { title: 'Révolution 2', content: "La révolution industrielle est une transformation radicale de l'économie qui s'est produite en Grande-Bretagne à la fin du XVIIIe siècle avant de se répandre en Europe et en Amérique du Nord au XIXe siècle. Elle a remplacé le travail artisanal manuel par la mécanisation et la production en usine, grâce à l'invention de la machine à vapeur. Cette révolution a profondément transformé les structures sociales, urbanisant les populations et créant une nouvelle classe ouvrière." },
  { title: 'Révolution 3', content: "La révolution russe de 1917 est composée de deux phases distinctes. La révolution de Février a renversé le tsar Nicolas II et établi un gouvernement provisoire. La révolution d'Octobre, menée par les bolcheviks de Lénine, a instauré le premier régime communiste au monde. Cet événement a profondément marqué l'histoire du XXe siècle et influencé des dizaines de mouvements révolutionnaires dans le monde entier." },
  { title: 'Révolution 4', content: "La révolution numérique désigne la transformation profonde des sociétés et des économies mondiales par l'informatique, internet et les technologies de l'information depuis les années 1970. Elle a révolutionné les communications, le commerce, les médias et les modes de travail. Contrairement aux révolutions politiques, elle se déroule de manière continue et progressive, sans événement fondateur unique, rendant son impact difficile à mesurer avec précision." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Sport 1', content: "La natation en eau vive est un sport nautique qui consiste à descendre des rapides de rivières en canoë ou kayak. Les compétitions se disputent sur des parcours naturels ou artificiels avec des portes à franchir. Les athlètes sont classés selon leurs temps et les pénalités reçues pour les portes manquées ou touchées. Ce sport combine technique, puissance physique et lecture rapide du courant." },
  { title: 'Sport 2', content: "Le kitesurf est un sport nautique qui utilise un cerf-volant de grande taille (kite) comme moteur de traction pour glisser sur l'eau sur une planche de surf ou wake. Le kitesurfeur contrôle le kite avec une barre reliée à des lignes et dirige sa planche avec ses pieds et son poids. Ce sport, né dans les années 1990, est pratiqué dans les endroits venteux et offre des sensations de glisse extrêmes." },
  { title: 'Sport 3', content: "La planche à voile ou windsurf est un sport nautique combinant les principes de la voile et du surf. Le pratiquant se tient debout sur une planche et contrôle une voile reliée à un mât articulé. Ce sport olympique depuis 1984 permet des vitesses impressionnantes, les recordmans dépassant les 50 nœuds. Il se pratique sur mer, lac ou rivière selon les conditions de vent et d'eau." },
  { title: 'Sport 4', content: "Le wakeboard est un sport nautique de glisse où le pratiquant se tient sur une petite planche et est tracté par un bateau à moteur. Le câble crée une traction permettant des sauts, figures et rotations spectaculaires. Le wakeboard dérivé du ski nautique et du surf des neiges est très populaire auprès des jeunes en Europe et aux États-Unis. Des parcs de câbles fixes (wake parks) permettent de pratiquer sans bateau." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Régime 1', content: "Le régime méditerranéen traditionnel est caractérisé par une consommation abondante de légumes, fruits, légumineuses et céréales complètes, avec l'huile d'olive comme principale source de matières grasses. La viande rouge est consommée rarement, le poisson plusieurs fois par semaine. Le vin rouge avec modération aux repas est un élément culturel. Ce régime est reconnu par l'UNESCO comme patrimoine culturel immatériel de l'humanité." },
  { title: 'Régime 2', content: "Le régime crétois est la forme la plus pure du régime méditerranéen, observé dans l'île de Crète en Grèce. Riche en huile d'olive extra-vierge, légumes frais, herbes aromatiques, légumineuses, poisson et fruits de mer locaux, il inclut peu de viande et peu de produits laitiers. L'étude des Sept Pays menée dans les années 1950-1960 a démontré que les Crétois présentaient les taux les plus bas de maladies cardiovasculaires au monde, révélant les bienfaits exceptionnels de ce mode alimentaire." },
  { title: 'Régime 3', content: "Le régime DASH (Dietary Approaches to Stop Hypertension) a été développé spécifiquement par des chercheurs américains pour combattre l'hypertension artérielle. Il préconise une forte réduction du sodium, une augmentation des potassium, calcium et magnésium via des fruits, légumes, produits laitiers allégés et céréales complètes. Ce régime médical est souvent prescrit par les cardiologues en complément d'un traitement médicamenteux." },
  { title: 'Régime 4', content: "Le régime paléolithique ou paléo cherche à reproduire l'alimentation supposée de nos ancêtres chasseurs-cueilleurs du Paléolithique : viandes maigres, poissons, fruits, légumes, noix et graines. Il exclut les céréales, légumineuses, produits laitiers et sucres raffinés, supposés être des inventions de l'agriculture néolithique que notre organisme ne serait pas adapté à digérer. Très débattu par les nutritionnistes, il est associé à une perte de poids initiale souvent spectaculaire." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Station 1', content: "Les stations balnéaires de la Côte d'Azur, comme Nice, Cannes et Saint-Tropez, attirent une clientèle internationale fortunée en été grâce à leurs plages, leur mer turquoise et leur art de vivre méditerranéen. La saison principale s'étend de juin à septembre avec un pic en juillet-août. En dehors de cette période, ces stations misent sur les congrès, les festivals et le tourisme haut de gamme pour maintenir leur activité économique." },
  { title: 'Station 2', content: "Les stations thermales comme Vichy, Évian ou Dax accueillent des curistes venant soigner leurs rhumatismes, affections digestives ou problèmes de peau avec les eaux minérales. La saison thermale s'étend généralement d'avril à octobre. Ces stations ont diversifié leur offre vers le thermalisme de bien-être et le spa pour attirer une clientèle plus jeune et réduire leur dépendance aux remboursements de l'Assurance Maladie." },
  { title: 'Station 3', content: "Les stations de ski des Alpes françaises, comme Chamonix, Méribel ou Val d'Isère, constituent des destinations hivernales mondiales de premier plan. Leur altitude, généralement entre 1 500 et 3 300 mètres, garantit l'enneigement de décembre à avril ou mai. Elles se transforment en stations de randonnée et VTT en été. Le changement climatique représente cependant une menace existentielle pour celles situées en dessous de 1 800 mètres." },
  { title: 'Station 4', content: "Les stations d'altitude sont des stations de ski implantées au-dessus de 1 800 mètres d'altitude, ce qui leur garantit un enneigement naturel fiable de décembre à avril sur la majorité de leurs pistes. Des stations comme Tignes (2 100 m), Les Arcs (1 600-3 226 m) ou Val Thorens (2 300 m, la plus haute d'Europe) bénéficient d'une neige de qualité supérieure et d'une saison plus longue. Cette altitude constitue leur principal atout face au réchauffement climatique." },
]);

/* ── Documents Q23-32 ── */
const DOC_FORFAIT_SKI =
`CONDITIONS GÉNÉRALES — FORFAIT SKI SAISON 2025-2026
Station Les Grandes Alpes

VALIDITÉ ET UTILISATION :
Le forfait ski donne accès aux 220 km de pistes balisées de la station du premier enneigement jusqu'à la fermeture officielle du domaine. Il est strictement personnel et nominatif, avec photo obligatoire.

TARIFS SAISON :
Adulte (18-64 ans) : 650 € | Senior (65+) : 520 € | Enfant (-12 ans) : 390 €
Famille (2 adultes + 2 enfants) : 1 800 €

CONDITIONS DE REMBOURSEMENT :
En cas de fermeture partielle du domaine due à la météo, un avoir proportionnel sera appliqué. Aucun remboursement en cas de blessure du titulaire sans assurance optionnelle souscrite au moment de l'achat.

ASSURANCE OPTION : 45 € — couvre blessure, maladie, hospitalisations.`;

const DOC_OFFRE_DESIGNER =
`OFFRE D'EMPLOI — DESIGNER DE MODE
Maison de Couture ÉLÉGANCE PARIS

Notre maison de couture de prêt-à-porter haut de gamme recherche un(e) designer créatif(ve) pour rejoindre son studio de création.

MISSIONS :
Conception des collections saisonnières (automne-hiver et printemps-été), réalisation de croquis et prototypes, sélection des matières et coloris, suivi de la fabrication avec les ateliers partenaires, veille des tendances internationales.

PROFIL REQUIS :
Diplôme d'une école de mode reconnue (ESMOD, La Cambre, Central Saint Martins...), portfolio créatif solide, maîtrise des logiciels Adobe Illustrator et Photoshop, sensibilité esthétique affirmée, anglais courant.

CONTRAT : CDI, 39h. Salaire : 32 000 à 42 000 € selon expérience et portfolio.
Portfolio à envoyer à : creation@elegance-paris.fr`;

const DOC_REGLEMENT_REGATE =
`RÈGLEMENT — RÉGATE VOILE AMATEUR CÔTE ATLANTIQUE

PARTICIPANTS :
La régate est ouverte à tous les équipages amateurs possédant une licence de la Fédération Française de Voile en cours de validité. Chaque bateau doit être assuré et en conformité avec les normes de sécurité maritime.

DÉROULEMENT :
• Départ : dimanche 15 juin à 10h00 depuis le port de La Rochelle
• Parcours : aller-retour île de Ré, distance approximative 28 milles nautiques
• Classes : Monotypes, bateaux de croisière, multicoques
• Résultats calculés selon les temps compensés (coefficient IRC)

SÉCURITÉ OBLIGATOIRE :
Gilets de sauvetage homologués pour chaque équipier, VHF bord, fusées de détresse, ancre et amarre de sécurité.`;

const DOC_GUIDE_PENAL =
`GUIDE PRATIQUE — VOS DROITS EN MATIÈRE PÉNALE

Vous faites l'objet d'une garde à vue, d'une mise en examen ou d'une comparution devant le tribunal correctionnel ? Ce guide vous informe sur vos droits fondamentaux.

LORS DE LA GARDE À VUE :
• Droit d'être informé des faits reprochés dès le début
• Droit de garder le silence — rien ne vous oblige à répondre aux questions
• Droit à un avocat commis d'office si vous n'en avez pas
• Droit à un interprète si vous ne parlez pas français

LORS DU PROCÈS :
La présomption d'innocence s'applique jusqu'à condamnation définitive. Vous avez le droit de contester les preuves, de faire appel des décisions et de vous faire représenter par un avocat de votre choix.`;

const DOC_CAHIER_RECETTES =
`GUIDE DES SAVEURS MÉDITERRANÉENNES
Restaurant Le Bord de Mer — Montpellier

Notre chef vous propose ce guide pour reproduire chez vous les plats emblématiques de notre carte.

RECETTE DU GASPACHO MAISON :
Mixez 1 kg de tomates mûres, 1 concombre, 1 poivron rouge, 1 gousse d'ail, 4 cuillères d'huile d'olive extra-vierge, vinaigre de Xérès. Assaisonnez sel et poivre. Réfrigérez 2h minimum. Servez bien frais garni de dés de légumes crus.

RECETTE DE LA TAPENADE :
Mixez 200 g d'olives noires dénoyautées, 50 g de câpres, 4 filets d'anchois, 1 gousse d'ail, 8 cuillères d'huile d'olive. Servez sur pain grillé.

BON APPÉTIT !`;

/* ── Articles Q33-40 ── */
const ART_ROBOTIQUE =
`ROBOTIQUE ET FUTUR DU TRAVAIL INDUSTRIEL : ENTRE CRAINTE ET OPPORTUNITÉ

L'automatisation robotique des usines s'accélère à une vitesse sans précédent. Selon l'International Federation of Robotics, plus de 500 000 robots industriels sont installés chaque année dans le monde, un chiffre qui double tous les cinq ans. La Chine, le Japon, la Corée du Sud, l'Allemagne et les États-Unis concentrent 70% du parc mondial de robots industriels.

Dans les secteurs de l'automobile, de l'électronique et de la logistique, la robotisation a transformé radicalement les conditions de production. Des tâches répétitives, pénibles ou dangereuses sont désormais effectuées par des robots collaboratifs, capables de travailler aux côtés des humains sans cage de sécurité. Cette évolution améliore la sécurité au travail et la précision de fabrication, tout en soulevant des questions cruciales sur l'emploi.

Les économistes débattent de l'impact net sur l'emploi. Si certaines études prédisent la disparition de millions de postes d'ouvriers peu qualifiés d'ici 2030, d'autres soulignent que la robotisation crée de nouveaux emplois dans la maintenance, la programmation et la supervision des systèmes automatisés. En France, les industries les plus robotisées ont paradoxalement maintenu ou développé leurs effectifs grâce à des gains de compétitivité.

La reconversion professionnelle constitue le défi social majeur de cette transition. Former un soudeur à devenir technicien de maintenance robotique nécessite des programmes d'apprentissage adaptés et un investissement substantiel dans la formation continue. Les régions industrielles traditionnelles qui ne s'adaptent pas à cette transformation courent le risque d'un décrochage économique durable.`;

const ART_MODE =
`MODE ÉTHIQUE ET FAST FASHION : LA RÉVOLUTION LENTE DU TEXTILE

L'industrie textile est la deuxième industrie la plus polluante au monde après le pétrole. Chaque année, 100 milliards de vêtements sont produits, dont 60% sont jetés dans les douze mois suivant leur fabrication. La fast fashion, modèle économique inventé par Zara et H&M dans les années 1990, a démocratisé l'accès à des vêtements bon marché mais a généré une crise environnementale et sociale majeure : pollution des cours d'eau, conditions de travail déplorables dans les usines asiatiques, montagne de déchets textiles.

En réaction, un mouvement de mode éthique et durable se développe. Des marques comme Patagonia, Veja ou Sézane fondent leur modèle sur des principes de traçabilité, d'utilisation de matières bio ou recyclées et de rémunération équitable des travailleurs. Ces marques ont démontré qu'il était possible de conjuguer esthétique, qualité et responsabilité, séduisant une clientèle croissante sensibilisée aux enjeux environnementaux.

La réglementation évolue également. L'Union européenne a adopté une directive obligeant les marques à fournir un passeport numérique de durabilité pour chaque produit textile à partir de 2026, incluant la composition des matières, les conditions de fabrication et les possibilités de recyclage en fin de vie.

Le véritable changement culturel reste cependant à accomplir. Tant que le consommateur privilégiera systématiquement le prix le plus bas sans considérer le coût social et environnemental réel de sa consommation, la fast fashion conservera son avantage économique structurel. L'éducation et la transparence semblent plus efficaces que la seule réglementation pour transformer les comportements d'achat.`;

const ART_TOURISME_SKI =
`TOURISME HIVERNAL ET CHANGEMENT CLIMATIQUE : LES STATIONS DE SKI À LA CROISÉE DES CHEMINS

Le changement climatique menace directement la viabilité économique des stations de ski de basse et moyenne altitude en Europe. Les scientifiques estiment que d'ici 2050, dans un scénario de réchauffement de +2°C, 40% des stations de ski alpines actuellement enneigées de manière naturelle et fiable ne le seront plus. Les stations situées entre 900 et 1 500 mètres d'altitude sont les plus vulnérables.

Face à cette menace, les réponses des acteurs du secteur sont multiples et souvent contradictoires. La fabrication de neige artificielle représente la réponse technique immédiate adoptée par la quasi-totalité des stations : une solution qui permet de maintenir l'activité à court terme mais consomme des quantités d'eau et d'énergie considérables, creusant paradoxalement l'empreinte carbone du secteur.

La diversification saisonnière apparaît comme la voie durable. De nombreuses stations investissent dans des activités estivales : randonnée pédestre, VTT de descente, parcours aventure, lacs de montagne aménagés. Certaines ont transformé leurs remontées mécaniques en accès aux sommets pour les randonneurs et cyclistes, générant des revenus significatifs en dehors de la saison neigeuse.

Le vrai défi est d'ordre psychologique et économique : convaincre les habitants et les investisseurs locaux d'accepter une transformation profonde de l'identité de leur territoire, de « station de ski » à « destination montagne quatre saisons ». Cette transition, nécessaire, implique des investissements importants et une vision à long terme difficile à concilier avec les impératifs économiques immédiats.`;

const ART_REGIME_MED =
`ALIMENTATION MÉDITERRANÉENNE ET LONGÉVITÉ : LES SECRETS D'UNE ALIMENTATION MILLÉNAIRE

Le régime méditerranéen est considéré par la communauté scientifique comme le modèle alimentaire le mieux documenté en termes de bénéfices pour la santé. Depuis l'étude pionnière de Seven Countries Study d'Ancel Keys dans les années 1950-60, des centaines de recherches ont confirmé son impact positif sur la réduction des maladies cardiovasculaires, du diabète de type 2, de certains cancers et des maladies neurodégénératives.

La récente étude PREDIMED (Prevención con Dieta Mediterránea) réalisée sur 7 447 personnes à haut risque cardiovasculaire en Espagne a démontré une réduction de 30% des accidents cardiovasculaires majeurs chez les participants suivant un régime méditerranéen enrichi en huile d'olive extra-vierge ou en noix, comparativement à un régime pauvre en graisses.

Les mécanismes biologiques explicatifs sont multiples. L'huile d'olive extra-vierge est riche en polyphénols anti-inflammatoires et en acides gras mono-insaturés qui protègent les vaisseaux sanguins. Les légumineuses et les céréales complètes maintiennent une glycémie stable. Le poisson apporte des acides gras oméga-3 qui réduisent les triglycérides et l'inflammation systémique.

Au-delà de la nutrition, les chercheurs insistent sur la dimension culturelle et sociale du régime méditerranéen, inscrit au patrimoine immatériel de l'UNESCO en 2013. Le repas partagé en famille ou entre amis, pris sans précipitation, contribue au bien-être psychologique et à la longévité. La Sardaigne, le Péloponnèse grec et l'île d'Okinawa au Japon, toutes trois zones bleues à forte concentration de centenaires, associent une alimentation végétale dominante à des liens sociaux forts.`;

function buildQuestions() {
  const qs = [];

  qs.push(q(1, 'Q1-7', null, {
    longText:
`SEMAINE DE LA MODE DE PARIS — Autumn/Winter 2026
Calendrier Officiel des Défilés — 27 février au 7 mars 2026

CRÉATEURS INVITÉS :
• Jacquemus — Palais Royal — 28 fév. 20h
• Isabel Marant — Grand Palais — 1er mars 18h30
• Valentino — Opéra Garnier — 2 mars 19h
• Chanel — Salon d'Honneur — 4 mars 15h et 20h
• Saint Laurent — Esplanade Trocadéro — 6 mars 19h30

ACCRÉDITATIONS PRESSE :
Demandes à adresser avant le 15 janvier à presse@modeaparis.com
Accès public sur certains défilés : places limitées, tirage au sort sur le site officiel`,
    question: "Ce document est…",
    optionA: "un article sur l'histoire de la mode française.",
    optionB: "un calendrier officiel de défilés de mode avec créateurs et dates.",
    optionC: "une publicité pour acheter des vêtements de luxe.",
    optionD: "un guide d'accès aux boutiques de mode parisiennes.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`DOMAINE SKIABLE LES GRANDES ALPES — Saison 2025-2026
220 km de pistes | Altitude : 1 200 m – 3 400 m | 65 remontées mécaniques

TARIFS JOURNALIERS 2025-2026 :
Adulte : 58 € | Senior (65+) : 46 € | Enfant (-12 ans) : 35 €
Demi-journée (à partir de 12h30) : adulte 42 €

FORFAITS :
Semaine (7 jours) adulte : 295 € | Saison : 650 €

ACCÈS :
Route D902 depuis Bourg-Saint-Maurice. Parking gratuit navettes incluses.
Réservation en ligne : domainegrandesalpes.fr — 10% de réduction`,
    question: "D'après ce document, quelle réduction obtient-on en réservant en ligne ?",
    optionA: "5% de réduction.",
    optionB: "10% de réduction.",
    optionC: "15% de réduction.",
    optionD: "20% de réduction.",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`FÉDÉRATION FRANÇAISE DE VOILE — Règlement des Compétitions Amateurs

CONDITIONS D'INSCRIPTION :
Tout participant à une compétition officielle doit être titulaire d'une licence fédérale valide pour la saison en cours. La licence inclut l'assurance responsabilité civile obligatoire.

ÉQUIPEMENTS DE SÉCURITÉ OBLIGATOIRES :
• Gilet de sauvetage homologué pour chaque membre d'équipage
• VHF marine canal 16
• Fusées de détresse (3 minimum)
• Matériel de pompage et d'épuisement d'urgence

RÈGLES DE COURSE :
En cas d'abordage, le bateau en infraction doit effectuer une pénalité (360°) ou se retirer. En cas de danger immédiat pour un autre équipage, l'assistance est obligatoire quelle que soit la conséquence sur le classement.`,
    question: "Selon ce règlement, que doit faire un équipage en cas de danger pour un autre équipage ?",
    optionA: "Continuer la course et signaler l'incident après.",
    optionB: "Porter assistance obligatoirement, même au détriment du classement.",
    optionC: "Contacter la capitainerie par VHF uniquement.",
    optionD: "Effectuer une pénalité de 360 degrés.",
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — Robot aspirateur dernière génération
Vends iRobot Roomba i7+ (modèle 2024), état parfait, boîte et accessoires d'origine.
Fonctionnalités : cartographie intelligente 3D, vidage automatique du bac (Clean Base incluse), contrôle par application et assistant vocal, programmation hebdomadaire.
Utilisé seulement 6 mois — déménagement contraint à la vente.
Acheté 899 €, vendu 550 € (ferme).
Photos sur demande. Remise en main propre à Paris 15ème uniquement.
Contact : julien.martin75@mail.com`,
    question: "D'après cette annonce, pourquoi le vendeur se sépare-t-il de cet appareil ?",
    optionA: "L'appareil est défectueux.",
    optionB: "Il déménage et est contraint à la vente.",
    optionC: "Il achète un modèle plus récent.",
    optionD: "Il n'est pas satisfait du produit.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`MACHINE À PAIN SAVEUR MAISON — GUIDE DE PRÉPARATION

RECETTE DU PAIN BLANC CLASSIQUE (750 g) :
1. Versez dans la cuve dans l'ordre suivant : 280 ml d'eau tiède, 1,5 c.c. de sel, 1 c.s. de sucre, 2 c.s. d'huile
2. Ajoutez 500 g de farine type 65
3. Formez un puits au centre et déposez 1,5 c.c. de levure sèche instantanée
4. Sélectionnez le programme Pain Blanc (programme 1), taille 750 g, croûte selon préférence
5. Appuyez sur Démarrer — temps total : 3h15

⚠ Ne jamais ouvrir le couvercle pendant le pétrissage. La farine doit être à température ambiante.`,
    question: "Ce document est…",
    optionA: "un catalogue de recettes de pain artisanal.",
    optionB: "un guide de préparation pour une machine à pain.",
    optionC: "une publicité pour une boulangerie artisanale.",
    optionD: "un contrat de garantie d'appareil électroménager.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — Comité National de Commémoration Historique

À l'occasion du 80e anniversaire de la fin de la Seconde Guerre mondiale en Europe, le Comité National organise une série de commémorations officielles dans toute la France du 7 au 15 mai 2025.

PROGRAMME NATIONAL :
• 7 mai : Cérémonie officielle à l'Arc de Triomphe, Paris — en présence du Président de la République
• 8 mai : Cérémonies dans les 36 000 communes françaises — dépôt de gerbes aux monuments aux morts
• 8-15 mai : Expositions temporaires dans 120 musées sur la Libération

Le Comité appelle à la mobilisation de tous les citoyens pour honorer la mémoire des soldats et des civils victimes du conflit.`,
    question: "Quel est le but principal de ce communiqué ?",
    optionA: "Présenter le bilan historique de la Seconde Guerre mondiale.",
    optionB: "Annoncer des commémorations du 80e anniversaire de la fin de la guerre.",
    optionC: "Informer sur les nouvelles découvertes archéologiques de la guerre.",
    optionD: "Recruter des volontaires pour des activités de mémoire.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — SOIRÉE DÎNER MÉDITERRANÉEN

L'association Les Saveurs du Monde vous convie à sa soirée annuelle sur le thème de la gastronomie méditerranéenne.

DATE : Vendredi 20 mars 2026 — 19h30
LIEU : Salle des Fêtes du Château de la Gaude, Aix-en-Provence

AU MENU :
Mezze libanais en entrée collective, tajine d'agneau ou pastilla de légumes, desserts orientaux assortis.
Vins de Provence et Côtes du Rhône sélectionnés par notre sommelier.

TARIF : 65 € par personne (entrées, plat, dessert, vins inclus)
Inscription avant le 10 mars : saveursdumonde13@mail.fr
Places limitées à 80 convives.`,
    question: "Ce document est…",
    optionA: "un article sur la gastronomie libanaise.",
    optionB: "une invitation à un dîner thématique sur la gastronomie méditerranéenne.",
    optionC: "le programme d'un festival de gastronomie régionale.",
    optionD: "une offre promotionnelle d'un restaurant méditerranéen.",
    correctAnswer: 'B',
  }));

  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La révolution industrielle a conduit à une ___ rapide des sociétés rurales vers les grandes villes industrielles au XIXe siècle.",
    question: PHRASE_Q,
    optionA: "migration",
    optionB: "transition",
    optionC: "évolution",
    optionD: "transformation",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le robot industriel est équipé d'un ___ de proximité qui lui permet de détecter la présence humaine et de ralentir automatiquement.",
    question: PHRASE_Q,
    optionA: "moteur",
    optionB: "capteur",
    optionC: "programme",
    optionD: "contrôle",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La créatrice a présenté sa nouvelle ___ automne-hiver lors du défilé officiel de la Semaine de la Mode de Paris.",
    question: PHRASE_Q,
    optionA: "gamme",
    optionB: "collection",
    optionC: "série",
    optionD: "ligne",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'avocat de la défense a demandé au tribunal de prendre en compte le passé irréprochable du ___ avant de rendre son verdict.",
    question: PHRASE_Q,
    optionA: "témoin",
    optionB: "prévenu",
    optionC: "plaignant",
    optionD: "juriste",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La tapenade marseillaise se caractérise par une saveur intense d'olives noires, d'anchois et d'huile d'olive aux notes fruitées de ___ méditerranéenne.",
    question: PHRASE_Q,
    optionA: "saveur",
    optionB: "tradition",
    optionC: "terroir",
    optionD: "richesse",
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le skipper a corrigé sa trajectoire en agissant sur la ___ du voilier pour contrer l'effet du vent de travers.",
    question: PHRASE_Q,
    optionA: "voile",
    optionB: "barre",
    optionC: "quille",
    optionD: "proue",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_1 =
    "La robotisation des usines soulève la question de l'[14] des emplois industriels. De nombreux travailleurs dont les tâches sont automatisées doivent suivre des programmes de [15] pour acquérir de nouvelles compétences adaptées aux besoins du marché du travail numérique.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La robotisation industrielle",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "automatisation",
    optionB: "création",
    optionC: "protection",
    optionD: "réduction",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La robotisation industrielle",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "retraite",
    optionB: "reconversion",
    optionC: "sélection",
    optionD: "promotion",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La mode éthique privilégie des [16] naturelles ou recyclées dont l'impact environnemental est minimal. Ces vêtements sont souvent fabriqués dans des ateliers respectueux des droits humains avant d'être valorisés par le [17] des textiles usagés en fin de vie.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La mode éthique",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "couleurs",
    optionB: "matières",
    optionC: "marques",
    optionD: "formes",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La mode éthique",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "nettoyage",
    optionB: "recyclage",
    optionC: "stockage",
    optionD: "lavage",
    correctAnswer: 'B',
  }));

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle révolution est une transformation radicale de l'économie par la mécanisation et la vapeur au XIXe siècle ?",
    optionA: "Révolution 1",
    optionB: "Révolution 2",
    optionC: "Révolution 3",
    optionD: "Révolution 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel sport nautique utilise un cerf-volant de traction pour glisser sur l'eau sur une planche ?",
    optionA: "Sport 1",
    optionB: "Sport 2",
    optionC: "Sport 3",
    optionD: "Sport 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel régime méditerranéen est l'alimentation traditionnelle de Crète, riche en huile d'olive, légumes et poisson ?",
    optionA: "Régime 1",
    optionB: "Régime 2",
    optionC: "Régime 3",
    optionD: "Régime 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel type de station de ski est implantée au-dessus de 1 800 m, garantissant l'enneigement de décembre à avril ?",
    optionA: "Station 1",
    optionB: "Station 2",
    optionC: "Station 3",
    optionD: "Station 4",
    correctAnswer: 'D',
  }));

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La station D a maintenu une fréquentation stable autour de 850 000 skieurs par an entre 2018 et 2023 malgré le réchauffement climatique. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Forfait ski — Les Grandes Alpes",
    longText: DOC_FORFAIT_SKI,
    question: "Ce document présente principalement…",
    optionA: "Les horaires des pistes de ski de la station.",
    optionB: "Les conditions générales et tarifs du forfait ski saison.",
    optionC: "Les règles de sécurité sur les pistes de ski.",
    optionD: "Le programme des animations de la station.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Forfait ski — Les Grandes Alpes",
    longText: DOC_FORFAIT_SKI,
    question: "Selon ce document, dans quel cas n'y a-t-il aucun remboursement possible ?",
    optionA: "En cas de fermeture totale du domaine pour avalanche.",
    optionB: "En cas de blessure du titulaire sans assurance optionnelle souscrite.",
    optionC: "En cas d'annulation de réservation plus de 30 jours avant.",
    optionD: "En cas de mauvaises conditions météorologiques ponctuelles.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Designer de mode",
    longText: DOC_OFFRE_DESIGNER,
    question: "Cette offre d'emploi de designer de mode exige…",
    optionA: "Uniquement un portfolio créatif sans diplôme.",
    optionB: "Un diplôme d'une école de mode reconnue et un portfolio solide.",
    optionC: "Un master en arts visuels et 10 ans d'expérience.",
    optionD: "La maîtrise exclusive du dessin traditionnel à la main.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Designer de mode",
    longText: DOC_OFFRE_DESIGNER,
    question: "Parmi les missions du designer, on trouve…",
    optionA: "La vente directe aux clients en boutique.",
    optionB: "La conception de collections et la sélection des matières.",
    optionC: "La gestion de la communication sur les réseaux sociaux.",
    optionD: "La supervision des usines de fabrication à l'étranger.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement — Régate voile amateur",
    longText: DOC_REGLEMENT_REGATE,
    question: "Ce règlement concerne…",
    optionA: "Une compétition de natation en mer ouverte.",
    optionB: "Une régate de voile pour amateurs sur la côte atlantique.",
    optionC: "Un championnat professionnel de voile offshore.",
    optionD: "Des exercices de sécurité maritime pour plaisanciers.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement — Régate voile amateur",
    longText: DOC_REGLEMENT_REGATE,
    question: "Selon ce règlement, comment sont calculés les résultats de la régate ?",
    optionA: "Par ordre d'arrivée brut.",
    optionB: "Selon les temps compensés avec un coefficient IRC.",
    optionC: "Par le plus grand nombre de milles parcourus.",
    optionD: "Par vote des capitaines participants.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Guide pratique — Vos droits en matière pénale",
    longText: DOC_GUIDE_PENAL,
    question: "Ce document présente principalement…",
    optionA: "Les obligations du citoyen lors d'une arrestation.",
    optionB: "Les droits fondamentaux d'une personne face à la justice pénale.",
    optionC: "Les tarifs des avocats commis d'office en France.",
    optionD: "Les procédures de recours en appel devant la Cour de cassation.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Guide pratique — Vos droits en matière pénale",
    longText: DOC_GUIDE_PENAL,
    question: "Selon ce guide, quel est l'un des droits fondamentaux lors d'une garde à vue ?",
    optionA: "Le droit de quitter les locaux à tout moment.",
    optionB: "Le droit de garder le silence face aux questions.",
    optionC: "Le droit d'exiger la présence d'un proche.",
    optionD: "Le droit de consulter le dossier complet dès la première heure.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide des saveurs méditerranéennes — Restaurant Le Bord de Mer",
    longText: DOC_CAHIER_RECETTES,
    question: "Ce document est principalement…",
    optionA: "Une présentation de la cuisine méditerranéenne dans le monde.",
    optionB: "Un guide de recettes méditerranéennes proposé par un restaurant.",
    optionC: "Un menu de restaurant avec les prix des plats.",
    optionD: "Un manuel de formation pour les cuisiniers professionnels.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide des saveurs méditerranéennes — Restaurant Le Bord de Mer",
    longText: DOC_CAHIER_RECETTES,
    question: "Selon la recette du gaspacho, combien de temps minimum doit-on réfrigérer la préparation avant de servir ?",
    optionA: "30 minutes.",
    optionB: "1 heure.",
    optionC: "2 heures.",
    optionD: "4 heures.",
    correctAnswer: 'C',
  }));

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Robotique et futur du travail industriel",
    longText: ART_ROBOTIQUE,
    question: "Selon cet article, combien de robots industriels sont installés chaque année dans le monde ?",
    optionA: "100 000",
    optionB: "250 000",
    optionC: "500 000",
    optionD: "1 million",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Robotique et futur du travail industriel",
    longText: ART_ROBOTIQUE,
    question: "D'après l'article, en France, les industries les plus robotisées ont…",
    optionA: "Réduit fortement leurs effectifs humains.",
    optionB: "Maintenu ou développé leurs effectifs grâce aux gains de compétitivité.",
    optionC: "Licencié tous leurs ouvriers non qualifiés.",
    optionD: "Délocalisé leur production en Asie.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Mode éthique et fast fashion",
    longText: ART_MODE,
    question: "Selon cet article, combien de vêtements sont produits chaque année dans le monde ?",
    optionA: "10 milliards",
    optionB: "50 milliards",
    optionC: "100 milliards",
    optionD: "200 milliards",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Mode éthique et fast fashion",
    longText: ART_MODE,
    question: "Selon l'article, quelle obligation l'Union européenne impose-t-elle aux marques à partir de 2026 ?",
    optionA: "Utiliser uniquement des matières recyclées.",
    optionB: "Fournir un passeport numérique de durabilité pour chaque produit textile.",
    optionC: "Réduire leur production de 50% par rapport à 2020.",
    optionD: "Rapatrier toute la fabrication en Europe.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Tourisme hivernal et changement climatique",
    longText: ART_TOURISME_SKI,
    question: "Selon les scientifiques cités dans l'article, quel pourcentage des stations alpines risque de ne plus être naturellement enneigé d'ici 2050 ?",
    optionA: "20%",
    optionB: "30%",
    optionC: "40%",
    optionD: "60%",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Tourisme hivernal et changement climatique",
    longText: ART_TOURISME_SKI,
    question: "D'après l'article, quelle voie durable est présentée pour les stations de ski ?",
    optionA: "L'augmentation de la fabrication de neige artificielle.",
    optionB: "La fermeture programmée des stations non rentables.",
    optionC: "La diversification saisonnière avec des activités estivales.",
    optionD: "La fusion des petites stations en grands domaines.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Alimentation méditerranéenne et longévité",
    longText: ART_REGIME_MED,
    question: "Selon l'étude PREDIMED citée dans l'article, le régime méditerranéen réduit de combien le risque d'accidents cardiovasculaires majeurs ?",
    optionA: "10%",
    optionB: "20%",
    optionC: "30%",
    optionD: "50%",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Alimentation méditerranéenne et longévité",
    longText: ART_REGIME_MED,
    question: "Selon l'article, en quelle année le régime méditerranéen a-t-il été inscrit au patrimoine immatériel de l'UNESCO ?",
    optionA: "2005",
    optionB: "2010",
    optionC: "2013",
    optionD: "2018",
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
    console.log(`\n✅ ${created} questions créées pour CE 25.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
