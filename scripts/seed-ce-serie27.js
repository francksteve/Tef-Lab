'use strict';
/**
 * seed-ce-serie27.js
 * Peuple la série CE 27 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie27.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoig8000n0wxlkmz7h5vn';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART (performances cyclistes vitesse km/h) correctAnswer='C' ── */
function generateQ22SVG() {
  const stages = ['Ét.1','Ét.2','Ét.3','Ét.4','Ét.5','Ét.6','Ét.7'];
  const graphDefs = [
    {
      label: 'Graphique 1',
      lines: [
        { color: '#E30613', data: [42, 38, 31, 35, 40, 37, 36] },
        { color: '#003087', data: [41, 36, 29, 33, 38, 35, 34] },
        { color: '#16a34a', data: [40, 35, 28, 32, 37, 34, 33] },
        { color: '#f59e0b', data: [39, 34, 27, 31, 36, 33, 32] },
      ]
    },
    {
      label: 'Graphique 2',
      lines: [
        { color: '#E30613', data: [40, 37, 33, 36, 41, 38, 37] },
        { color: '#003087', data: [39, 35, 30, 33, 39, 36, 35] },
        { color: '#16a34a', data: [38, 34, 29, 32, 38, 34, 34] },
        { color: '#f59e0b', data: [37, 33, 27, 30, 36, 32, 32] },
      ]
    },
    {
      label: 'Graphique 3',
      lines: [
        { color: '#E30613', data: [41, 38, 32, 35, 40, 37, 36] },
        { color: '#003087', data: [40, 36, 30, 33, 38, 35, 34] },
        { color: '#16a34a', data: [42, 38, 35, 38, 41, 39, 39] }, // CORRECT: C maintient ~39.2 sur 3 dernières
        { color: '#f59e0b', data: [38, 34, 28, 31, 36, 33, 33] },
      ]
    },
    {
      label: 'Graphique 4',
      lines: [
        { color: '#E30613', data: [43, 40, 33, 36, 41, 38, 37] },
        { color: '#003087', data: [42, 38, 31, 34, 39, 36, 35] },
        { color: '#16a34a', data: [40, 37, 30, 33, 38, 35, 34] },
        { color: '#f59e0b', data: [38, 35, 28, 31, 36, 33, 32] },
      ]
    },
  ];

  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];

  function drawLineChart(gDef, cx, cy) {
    const plotX = cx + 40, plotY = cy + 30, plotW = 320, plotH = 130;
    const minVal = 20, maxVal = 50;
    const n = stages.length;
    const step = plotW / (n - 1);

    const gridLines = [20, 30, 40, 50].map(v => {
      const yv = (plotY + plotH - ((v - minVal) / (maxVal - minVal)) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const polylines = gDef.lines.map(line => {
      const pts = line.data.map((v, i) => {
        const x = (plotX + i * step).toFixed(1);
        const y = (plotY + plotH - ((v - minVal) / (maxVal - minVal)) * plotH).toFixed(1);
        return `${x},${y}`;
      }).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${line.color}" stroke-width="2.5"/>`;
    }).join('');

    const xLabels = stages.map((s, i) => {
      const x = (plotX + i * step).toFixed(1);
      return `<text x="${x}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${s}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="195" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 20}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${gDef.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + polylines + xLabels +
           `<text x="${cx + 195}" y="${cy + 190}" text-anchor="middle" font-size="8" fill="#9ca3af">Vitesse (km/h)</text>`;
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
  { title: 'Technique 1', content: "La photographie en haute vitesse (high-speed photography) utilise un temps d'obturation extrêmement court, de l'ordre du millième de seconde, pour figer des mouvements imperceptibles à l'œil nu : une goutte d'eau éclatant, une balle traversant une pomme, une flamme qui se tord. Cette technique nécessite un éclairage très puissant pour compenser l'infime durée d'exposition. Elle est utilisée en science, en sport et en publicité." },
  { title: 'Technique 2', content: "La photographie en longue exposition consiste à maintenir l'obturateur ouvert pendant plusieurs secondes, minutes ou heures pour capturer le mouvement ou accumuler la lumière dans des conditions de faible éclairage. Elle permet de photographier les traînées lumineuses des étoiles (filé d'étoiles), les flux de voitures sur une route de nuit, les chutes d'eau en soie laiteuse. Un trépied est indispensable pour éviter le flou dû aux vibrations de l'appareil." },
  { title: 'Technique 3', content: "La photographie HDR (High Dynamic Range) combine plusieurs prises de vue d'une même scène à des expositions différentes pour restituer toute la plage dynamique de la lumière, des ombres les plus sombres aux hautes lumières les plus vives. Cette technique, populaire dans la photographie de paysage et d'architecture, permet d'obtenir des images aux détails visibles dans toutes les zones, évitant les zones brûlées ou bouchées. Elle est réalisée en post-traitement logiciel." },
  { title: 'Technique 4', content: "La macro-photographie consiste à photographier des sujets à très courte distance pour obtenir une image de taille identique ou supérieure à celle du sujet réel. Elle révèle les détails invisibles à l'œil nu : les yeux à facettes d'un insecte, les écailles d'un papillon, les gouttes de rosée sur un pétale. Des objectifs macro spécialisés ou des bagues allonge permettent cette mise au point à quelques centimètres du sujet. La profondeur de champ est extrêmement réduite." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Cuisine 1', content: "La cuisine japonaise est reconnue mondialement pour sa finesse et son équilibre. Le sushi, le sashimi, le ramen et le tempura en sont les ambassadeurs internationaux. La philosophie culinaire japonaise (washoku) valorise la saisonnalité, la fraîcheur des produits et la beauté de la présentation. La sauce soja, le miso, le saké de cuisine et le dashi (bouillon d'umami) constituent les fondements aromatiques de cette cuisine. Elle a été inscrite au patrimoine culturel immatériel de l'UNESCO en 2013." },
  { title: 'Cuisine 2', content: "La cuisine coréenne se distingue par ses fermentations emblématiques, au premier rang desquelles le kimchi, un chou pimenté fermenté qui accompagne tous les repas. Le doenjang (pâte de soja fermentée), le ganjang (sauce soja coréenne) et le gochujang (pâte de piment fermentée) constituent la trilogie aromatique fondamentale. Les banchan, petits plats d'accompagnement servis collectivement, et le bibimbap, riz aux légumes sautés, sont des plats incontournables." },
  { title: 'Cuisine 3', content: "La cuisine thaïlandaise est connue pour son équilibre des cinq saveurs fondamentales : pimenté, acide, sucré, salé et umami. La citronnelle, le galanga, les feuilles de combava, la pâte de crevettes et le lait de coco en sont les ingrédients signature. Le pad thaï (nouilles sautées), le curry vert, la soupe tom yum et la salade som tam constituent les plats les plus connus à l'international. Cette cuisine fait un usage abondant d'herbes fraîches et d'épices." },
  { title: 'Cuisine 4', content: "La cuisine indienne est l'une des plus riches et des plus variées au monde, reflétant la diversité des régions, des religions et des cultures du sous-continent. Le curry, terme générique désignant une préparation épicée en sauce, se décline en centaines de variantes régionales. Les tandoori, biryanis, dals et samosas sont connus mondialement. La cuisine végétarienne y occupe une place prépondérante, liée aux traditions hindoues et jaïnes. Les épices comme le curcuma, le cumin et la cardamome définissent son identité aromatique." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Course 1', content: "Le Tour d'Espagne (Vuelta a España) est l'un des trois grands tours cyclistes sur route avec le Tour de France et le Giro d'Italia. Créée en 1935, la Vuelta se déroule en septembre sur 21 étapes couvrant environ 3 200 km. Elle est connue pour ses arrivées en altitude dans les montagnes espagnoles (Sierra Nevada, Picos de Europa, Angliru) qui la rendent particulièrement redoutable. Des coureurs comme Roberto Heras, Chris Froome et Primož Roglič l'ont dominée à plusieurs reprises." },
  { title: 'Course 2', content: "Le Tour de France est la course cycliste professionnelle la plus célèbre au monde. Créée en 1903 par Henri Desgranges pour booster les ventes du journal L'Auto, elle se déroule en juillet sur 21 étapes couvrant environ 3 500 kilomètres à travers la France. Les différents maillots distinctifs (jaune, vert, à pois, blanc) récompensent les leaders au classement général, aux points, en montagne et chez les jeunes. Des légendes comme Eddy Merckx, Bernard Hinault et Jacques Anquetil l'ont remportée cinq fois." },
  { title: 'Course 3', content: "Le Tour d'Italie (Giro d'Italia) est l'une des trois grandes courses cyclistes mondiales. Fondé en 1909, il se dispute en mai sur 21 étapes traversant l'Italie du nord au sud, souvent avec des arrivées épiques sur les Dolomites ou l'Etna. Le maillot rose est porté par le leader. Les montées légendaires du Mortirolo, du Stelvio et du Zoncolan font la réputation de la course. Eddy Merckx, Fausto Coppi et Bernard Hinault figurent parmi ses vainqueurs les plus illustres." },
  { title: 'Course 4', content: "Paris-Roubaix est une course cycliste classique d'un jour créée en 1896, surnommée « l'Enfer du Nord » en raison des 55 km de pavés (secteurs en pavés) qui constituent son passage le plus redouté entre Compiègne et la vélodrome de Roubaix. Ces pavés, souvent boueux et instables, provoquent chutes, crevaisons et défaillances mécaniques, faisant de cette course l'une des plus dures et des plus imprévisibles du calendrier professionnel. Roger De Vlaeminck l'a remportée quatre fois." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Médecine 1', content: "La phytothérapie est l'utilisation des plantes médicinales et de leurs extraits à des fins thérapeutiques. Elle représente la forme la plus ancienne de médecine connue, pratiquée depuis des millénaires dans toutes les civilisations. Certaines plantes comme l'échinacée, le millepertuis, la valériane et le ginseng font l'objet d'études cliniques qui confirment certaines de leurs propriétés. La phytothérapie est reconnue par l'OMS comme partie intégrante de la médecine traditionnelle." },
  { title: 'Médecine 2', content: "L'acupuncture est une technique médicale traditionnelle chinoise vieille de plus de 2 500 ans qui consiste à insérer de fines aiguilles en des points précis du corps appelés points d'acupuncture ou méridiens. Selon la médecine traditionnelle chinoise, cette stimulation rééquilibre le flux d'énergie vitale (qi) dans le corps. Des études scientifiques ont montré son efficacité pour soulager certaines douleurs chroniques, les nausées et les maux de tête. Elle est reconnue par l'OMS pour certaines indications." },
  { title: 'Médecine 3', content: "L'ostéopathie est une approche thérapeutique manuelle qui considère le corps humain comme un tout fonctionnel. L'ostéopathe utilise ses mains pour diagnostiquer et traiter les tensions, blocages et déséquilibres dans les structures du corps (muscles, articulations, organes, fascias). Elle est principalement utilisée pour les douleurs musculo-squelettiques, les maux de dos, les troubles du sommeil et les tensions crâniennes. En France, l'ostéopathie est une profession réglementée depuis 2002." },
  { title: 'Médecine 4', content: "L'homéopathie est une pratique thérapeutique fondée par Samuel Hahnemann au XVIIIe siècle, basée sur deux principes : la similitude (une substance provoquant des symptômes peut les guérir à dose infinitésimale) et la dilution (plus une substance est diluée, plus elle serait puissante). Les médicaments homéopathiques sont préparés par dilutions successives. Son efficacité au-delà de l'effet placebo est très contestée par la communauté scientifique, et la Haute Autorité de Santé française a recommandé le déremboursement des médicaments homéopathiques." },
]);

/* ── Documents Q23-32 ── */
const DOC_CONTRAT_IMMO =
`COMPROMIS DE VENTE IMMOBILIÈRE

Entre M. et Mme Bernard (vendeurs) et M. Karim Ndiaye (acquéreur), il est convenu :

BIEN : Appartement de 78 m², 3ème étage avec ascenseur, 2 chambres, garage et cave, résidence Parc de la Colline, 38000 Grenoble.

PRIX : 285 000 € (deux cent quatre-vingt-cinq mille euros).

CONDITIONS SUSPENSIVES :
La vente est soumise à l'obtention par l'acquéreur d'un prêt immobilier d'au moins 220 000 € au taux maximum de 4,5% sur 20 ans, dans un délai de 45 jours à compter de la signature.

DÉLAI DE RÉTRACTATION : L'acquéreur dispose de 10 jours pour se rétracter sans motif ni pénalité.

DATE DE SIGNATURE DE L'ACTE AUTHENTIQUE : au plus tard le 15 mars 2026.`;

const DOC_OFFRE_PHOTO =
`OFFRE D'EMPLOI — PHOTOGRAPHE JOURNALISTE
Agence de Presse Médiaworld

L'agence Médiaworld recherche un photographe journaliste pour couvrir l'actualité nationale et internationale.

MISSIONS :
Couverture photographique d'événements d'actualité (politique, culture, sport, société), réalisation de reportages photo, légendes et courtes dépêches texte, archivage et transmission des clichés.

PROFIL :
Formation en photojournalisme ou arts visuels, 3 ans d'expérience minimum en presse, maîtrise des appareils reflex et mirrorless professionnels, Adobe Lightroom et Photoshop, permis B obligatoire. Disponibilité week-ends et nuits.

CONTRAT : CDI, salaire 2 400 à 3 000 € selon expérience. Carte de presse fournie. Véhicule de service et matériel professionnel mis à disposition.`;

const DOC_REGLEMENT_MED =
`RÈGLEMENT — ASSOCIATION DE MÉDECINE DOUCE ET BIEN-ÊTRE

L'Association Bien-Être Naturel (ABN) regroupe des praticiens en médecines douces : acupuncture, ostéopathie, naturopathie, phytothérapie, sophrologie.

ADHÉSION DES PRATICIENS :
• Justifier d'une formation certifiée d'au moins 3 ans dans la discipline
• Souscrire à une assurance responsabilité civile professionnelle
• Respecter le code de déontologie de l'association
• Cotisation annuelle : 250 €

OBLIGATIONS ÉTHIQUES :
Les membres s'engagent à ne pas se substituer à la médecine conventionnelle pour les pathologies graves, à orienter les patients vers un médecin en cas de doute diagnostique et à ne pas faire de promesses thérapeutiques non fondées.`;

const DOC_REGLEMENT_CYCLO =
`RÈGLEMENT — CYCLOSPORTIVE GRAND TOUR DES ALPILLES
Édition 2025 — Saint-Rémy-de-Provence

PARTICIPANTS :
Ouverte aux licenciés FFC et UFOLEP ainsi qu'aux non-licenciés sur présentation d'un certificat médical de non-contre-indication à la pratique sportive de moins de 3 mois. Âge minimum : 18 ans.

PARCOURS :
• Long : 145 km — D+ 2 800 m — départ 7h00
• Moyen : 98 km — D+ 1 800 m — départ 8h00
• Court : 55 km — D+ 900 m — départ 9h00

SÉCURITÉ :
Port du casque obligatoire pour tous les participants. Ravitaillements tous les 30 km. Voiture balai et assistance médicale sur tout le parcours. Abandon possible sur tous les postes de ravitaillement.`;

const DOC_GUIDE_CUISINE =
`GUIDE DES TECHNIQUES DE CUISINE ASIATIQUE
Restaurant Saveurs d'Asie — Guide du Chef

LE WOK : L'OUTIL ESSENTIEL
Le wok, poêle à fond bombé, est l'ustensile central de la cuisine asiatique. Sa forme permet une chauffe très rapide et uniforme sur feu vif. La technique de cuisson au wok exige une flamme très haute et des mouvements rapides pour saisir les aliments sans les cuire trop longtemps.

TECHNIQUE DU FOND DE SAUCE ASIATIQUE :
Faites revenir ail, gingembre et ciboule 30 secondes, ajoutez sauce soja, huile de sésame et une touche de vinaigre de riz. Ce fond aromatique de base s'adapte à tous les sautés de légumes et protéines.

CONSEILS DU CHEF :
Tous les ingrédients doivent être préparés et découpés avant de commencer la cuisson car tout va très vite.`;

/* ── Articles Q33-40 ── */
const ART_PHOTO =
`PHOTOGRAPHIE ET MANIPULATION DE L'IMAGE : LA VÉRITÉ À L'ÈRE DU NUMÉRIQUE

La photographie a longtemps été perçue comme le témoin objectif de la réalité. Mais depuis les années 1980, la numérisation des images et l'émergence de logiciels de retouche de plus en plus performants ont profondément remis en question cette présomption d'authenticité. Aujourd'hui, avec les outils d'intelligence artificielle génératives, il est devenu possible de créer des photographies entièrement synthétiques, indiscernables du réel à l'œil nu.

Le photojournalisme est la discipline la plus directement touchée par ces enjeux éthiques. Des cas de manipulation d'images de presse ont provoqué des scandales retentissants et des renvois de photographes. Les agences de presse internationales comme Reuters, AP et AFP ont adopté des chartes strictes interdisant toute modification substantielle des clichés : seuls les ajustements de contraste, luminosité et cadrage dans des limites définies sont tolérés.

La mode, la publicité et les réseaux sociaux ont développé une culture de l'image idéalisée qui soulève d'autres questions sociétales. Des études scientifiques établissent un lien entre l'exposition prolongée à des images de corps retouchés et la dégradation de l'image corporelle, particulièrement chez les adolescentes. Plusieurs pays ont introduit des obligations légales d'étiquetage des images publicitaires comportant des modifications significatives.

L'émergence des deepfakes, vidéos et images ultra-réalistes générées par IA représentant des personnes disant ou faisant des choses qu'elles n'ont jamais faites, constitue une menace sérieuse pour la démocratie et la vérité. Les chercheurs développent des outils de détection, mais la course entre manipulateurs et détecteurs semble perpétuelle.`;

const ART_LITT_AFRIQUE =
`LITTÉRATURE AFRICAINE CONTEMPORAINE ET RECONNAISSANCE INTERNATIONALE

La littérature africaine de langue française a connu ces dernières années une reconnaissance internationale sans précédent. Des auteurs comme Abdourahman Waberi (Djibouti), Scholastique Mukasonga (Rwanda), Gaël Faye (Rwanda-Burundi) ou Fatou Diome (Sénégal) sont lus et traduits dans des dizaines de langues. Le prix Nobel de littérature accordé à Abdulrazak Gurnah (Tanzanie, d'expression anglaise) en 2021 a signalé l'attention croissante portée aux voix africaines par le monde éditorial international.

Cette visibilité croissante ne doit cependant pas masquer les inégalités structurelles du marché littéraire. La grande majorité des maisons d'édition de référence pour la littérature africaine sont situées à Paris, ce qui crée une forme de filtrage éditorial où les textes doivent plaire à des éditeurs européens pour être publiés et distribués. Des voix s'élèvent pour réclamer le développement d'un écosystème éditorial africain autonome.

Les thèmes abordés par la littérature africaine contemporaine dépassent largement les questions postcoloniales qui dominaient les décennies précédentes. Les auteurs africains d'aujourd'hui explorent l'urbanité africaine, les migrations, la quête identitaire dans un monde mondialisé, les amours et les désirs ordinaires, sans nécessairement s'inscrire dans un rapport à l'Occident ou à l'histoire coloniale.

Les prix littéraires jouent un rôle ambigu dans cette reconnaissance. Le Prix Renaudot, le Prix Goncourt ou le Booker Prize constituent des tremplins considérables pour la diffusion internationale d'un auteur africain. Mais ils obéissent aussi à des logiques éditoriales et commerciales qui ne reflètent pas nécessairement la richesse de toute la production littéraire du continent.`;

const ART_MED_ALT =
`MÉDECINES ALTERNATIVES ET MÉDECINE CONVENTIONNELLE : VERS UNE INTÉGRATION ?

La relation entre médecines alternatives et médecine conventionnelle évolue progressivement vers une coexistence plus nuancée. Si la méfiance réciproque a longtemps caractérisé ces deux univers, certains hôpitaux et centres de soins intègrent désormais des approches complémentaires dans la prise en charge de leurs patients, notamment dans le domaine de l'oncologie, de la gestion de la douleur chronique et des soins palliatifs.

L'acupuncture et l'ostéopathie ont acquis une reconnaissance institutionnelle significative dans de nombreux pays occidentaux. En France, l'ostéopathie est reconnue comme profession de santé réglementée. Des études randomisées contrôlées ont établi l'efficacité de l'acupuncture pour certaines douleurs chroniques et les nausées chimio-induites. Ces résultats ont conduit certaines Caisses Primaires d'Assurance Maladie à expérimenter des remboursements partiels.

À l'inverse, l'homéopathie illustre les limites du dialogue entre médecines alternatives et scientifiques. Malgré une popularité persistante en France, les méta-analyses systématiques n'ont pas démontré d'efficacité au-delà de l'effet placebo. Cette conclusion scientifique a conduit à son déremboursement en 2021. Le cas de l'homéopathie illustre comment la popularité et l'efficacité prouvée ne coïncident pas nécessairement.

L'enjeu central reste celui de la recherche rigoureuse. Les praticiens de médecines alternatives sont souvent réticents aux essais cliniques qui évaluent leurs pratiques hors de leur contexte holistique habituel. Les scientifiques peinent à adapter leurs méthodologies à des approches individualisées qui ne se prêtent pas facilement à la randomisation. Ce dialogue méthodologique reste le principal obstacle à une intégration rationnelle.`;

const ART_CYCLISME =
`CYCLISME PROFESSIONNEL ET DOPAGE : UN SPORT QUI SE CHERCHE

Le cyclisme professionnel porte un lourd héritage de scandales dopants. L'affaire Festina en 1998, puis les aveux d'Lance Armstrong en 2013, ont entaché l'image d'un sport déjà fragilisé par des décennies de suspicion. Ces révélations ont conduit à une réforme profonde du contrôle antidopage, avec la création de l'USADA et du programme biologique du passeport d'athlète par l'AMA.

Le passeport biologique de l'athlète constitue l'innovation antidopage la plus significative de ces vingt dernières années. Ce suivi longitudinal des paramètres hématologiques et stéroïdiens de chaque coureur permet de détecter des variations anormales qui peuvent indiquer un usage de produits dopants, même sans identifier le produit précis. Cette approche indirecte a permis plusieurs suspensions là où les contrôles urinaires classiques n'avaient rien détecté.

Pour autant, la course entre les substances dopantes et leur détection reste une réalité. Des sportifs continuent de tester de nouvelles molécules, souvent issues de la pharmacopée thérapeutique, avant que les laboratoires antidopage n'aient développé des tests fiables. La transfusion sanguine autologue, pourtant interdite, reste techniquement difficile à prouver.

Le cyclisme contemporain tente de reconstruire sa crédibilité sur plusieurs fronts. La génération de coureurs actuels comme Tadej Pogačar, Jonas Vingegaard ou Remco Evenepoel bénéficie d'un bénéfice du doute accordé par les amateurs, las d'être déçus. Les équipes investissent dans l'aérodynamisme, la nutrition, la préparation mentale et la récupération comme leviers légaux de performance. Mais la vigilance doit rester de mise.`;

function buildQuestions() {
  const qs = [];

  qs.push(q(1, 'Q1-7', null, {
    longText:
`GALERIE D'ART CONTEMPORAIN — LUMIÈRE ET OMBRE
Exposition collective — 12 photographes internationaux

Du 15 janvier au 28 février 2026
Galerie Prisme, 42 rue du Faubourg Saint-Antoine, Paris 12e

ARTISTE INVITÉ : Marc Fontaine
« Instants Gelés » — 40 tirages grand format (80 x 120 cm)
Photographies de sports extrêmes et de nature sauvage

VERNISSAGE : Vendredi 14 janvier 2026 à 19h — Entrée libre
HORAIRES : Mar-Sam 11h-19h | Dim 14h-18h | Fermé lundi
TARIF : Adulte 8 € | Étudiant 4 € | Gratuit -12 ans`,
    question: "Ce document est…",
    optionA: "une critique de l'œuvre d'un photographe.",
    optionB: "une affiche d'exposition photographique avec informations pratiques.",
    optionC: "un article sur l'histoire de la photographie contemporaine.",
    optionD: "un catalogue de vente d'œuvres photographiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText:
`TOUR CYCLISTE DES ALPES — Programme officiel 2026
5 étapes — Du 18 au 22 juin 2026

ÉTAPE 1 — 18 juin : Grenoble → Chambéry — 148 km — Plaine
ÉTAPE 2 — 19 juin : Chambéry → Méribel — 112 km — Montagne (D+ 3 200 m)
ÉTAPE 3 — 20 juin : Bourg-Saint-Maurice → Val d'Isère — 98 km — Montagne (D+ 2 800 m)
ÉTAPE 4 — 21 juin : Modane → Briançon — 130 km — Montagne (D+ 3 500 m)
ÉTAPE 5 — 22 juin : Gap → Gap (CLM) — 35 km — Contre-la-montre

Suivi en direct sur tour-des-alpes.fr | Application mobile disponible`,
    question: "D'après ce programme, combien d'étapes de montagne comporte ce tour cycliste ?",
    optionA: "2 étapes",
    optionB: "3 étapes",
    optionC: "4 étapes",
    optionD: "5 étapes",
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText:
`RESTAURANT SAVEURS D'ASIE — Menu Découverte
42 rue de la République — Lyon 2e

ENTRÉES :
• Rouleaux de printemps frais (x4) au poulet et légumes croquants — 9 €
• Soupe pho bœuf traditionnelle, bouillon 12h, herbes fraîches — 11 €
• Salade coréenne au kimchi maison et sésame — 8 €

PLATS :
• Canard laqué façon Beijing servi avec crêpes et sauce hoisin — 22 €
• Curry thaï vert au lait de coco, poulet ou tofu — 18 €
• Bœuf sauté au wok, sauce aux huîtres, riz parfumé — 19 €
• Ramen coréen au kimchi et porc fondant (gyoza offerts) — 17 €

DESSERTS : Mochi glacé (x3) — 7 € | Soupe de fruits lychee-mangue — 6 €`,
    question: "D'après ce menu, quel plat inclut un accompagnement offert ?",
    optionA: "Le canard laqué.",
    optionB: "Le curry thaï vert.",
    optionC: "Le ramen coréen.",
    optionD: "La soupe pho bœuf.",
    correctAnswer: 'C',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — Appartement à vendre
Lyon 6e — Proche Parc de la Tête d'Or

F3 de 68 m² — 2ème étage sans ascenseur
Séjour lumineux 22 m², 2 chambres (12 et 10 m²), cuisine équipée, salle de bains rénovée
Parquet ancien + double vitrage récent | DPE : D
Cave privative | Accès vélos en rez-de-chaussée
CHARGES DE COPROPRIÉTÉ : 180 €/mois
PRIX : 395 000 € (honoraires charge vendeur inclus)
Disponible fin mai 2026
Contact exclusif : Agence Lyon Prestige — 04 78 52 00 33`,
    question: "D'après cette annonce, l'appartement est…",
    optionA: "Situé au rez-de-chaussée avec jardin privatif.",
    optionB: "Au 2ème étage sans ascenseur, avec cave.",
    optionC: "Entièrement rénové avec cuisine neuve.",
    optionD: "Disponible immédiatement à la location.",
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText:
`APPAREIL PHOTO REFLEX NUMÉRIQUE NIKON D7500
Manuel de démarrage rapide

MISE EN MARCHE :
1. Insérez une carte mémoire SD dans le logement situé sur le côté droit
2. Fixez un objectif compatible en alignant les repères rouges et tournez dans le sens des aiguilles d'une montre
3. Basculez l'interrupteur principal en position ON

RÉGLER L'EXPOSITION :
• Mode Auto (vert) : l'appareil gère tout automatiquement
• Mode Av (priorité ouverture) : choisissez le diaphragme, l'appareil adapte la vitesse
• Mode M (manuel) : contrôle total ouverture ET vitesse d'obturation

MISE AU POINT AUTOMATIQUE :
Appuyez à mi-course sur le déclencheur pour activer l'autofocus. Un bip sonore confirme la mise au point.`,
    question: "Ce document est…",
    optionA: "Un article comparatif d'appareils photo professionnels.",
    optionB: "Un manuel de démarrage rapide pour un appareil photo.",
    optionC: "Une liste de conseils pour améliorer ses photos.",
    optionD: "Un bon de garantie pour appareil photo.",
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — ASSOCIATION DE MÉDECINE CHINOISE TRADITIONNELLE DE FRANCE

L'Association de Médecine Chinoise Traditionnelle de France (AMCTF) organise une journée portes ouvertes pour faire découvrir au grand public les bénéfices de l'acupuncture.

DATE : Samedi 22 mars 2026 de 10h à 17h
LIEU : Centre de Santé Intégratif, 15 avenue Montaigne, Paris 8e

AU PROGRAMME :
• Consultations découverte d'acupuncture (20 min, sur inscription)
• Conférences sur les principes de la médecine traditionnelle chinoise
• Ateliers pratiques de digitopuncture (auto-massage des points d'acupuncture)
• Exposition de planches d'acupuncture et matériel

Entrée libre — Inscription aux consultations sur amctf.fr`,
    question: "Quel est le but principal de ce communiqué ?",
    optionA: "Promouvoir l'abandon de la médecine conventionnelle.",
    optionB: "Organiser une journée de découverte gratuite de l'acupuncture.",
    optionC: "Recruter de nouveaux étudiants en médecine chinoise.",
    optionD: "Annoncer l'ouverture d'un nouveau cabinet d'acupuncture.",
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — SOIRÉE LITTÉRAIRE AFRICAINE
La Maison des Écrivains du Monde — Paris

La Maison des Écrivains du Monde vous invite à sa soirée mensuelle consacrée à la littérature africaine contemporaine.

AUTEURS INVITÉS :
• Fatou Diome (Sénégal) — « Celles qui attendent »
• Alain Mabanckou (Congo) — « Black Bazar »
• Léonora Miano (Cameroun) — « Contours du jour qui vient »

DATE : Jeudi 19 février 2026 — 19h30
LIEU : Salle Simone de Beauvoir, 50 rue Saint-Maur, Paris 11e

PROGRAMME : Lectures, table ronde, séance de dédicaces
Entrée libre, dans la limite des places disponibles
Réservation conseillée : maison-ecrivains.fr`,
    question: "D'après ce document, quelle nationalité a l'auteure Fatou Diome ?",
    optionA: "Camerounaise.",
    optionB: "Congolaise.",
    optionC: "Sénégalaise.",
    optionD: "Ivoirienne.",
    correctAnswer: 'C',
  }));

  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'ouverture du ___ de l'appareil photo détermine la quantité de lumière atteignant le capteur et la profondeur de champ de l'image.",
    question: PHRASE_Q,
    optionA: "obturateur",
    optionB: "diaphragme",
    optionC: "zoom",
    optionD: "flash",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "La banque a refusé le prêt en raison de l'___ inscrite sur le bien immobilier par le créancier précédent, qui n'avait pas encore été levée.",
    question: PHRASE_Q,
    optionA: "assurance",
    optionB: "hypothèque",
    optionC: "garantie",
    optionD: "caution",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "La soupe pho vietnamienne doit sa profondeur aromatique à la présence de l'___, cinquième saveur fondamentale qui donne la sensation de plénitude en bouche.",
    question: PHRASE_Q,
    optionA: "acidité",
    optionB: "douceur",
    optionC: "umami",
    optionD: "piquant",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans la dernière étape de montagne, le coureur a pris le risque de partir seul du ___ pour tenter de récupérer du temps sur ses adversaires.",
    question: PHRASE_Q,
    optionA: "groupe",
    optionB: "peloton",
    optionC: "convoi",
    optionD: "train",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les contes de tradition africaine sont transmis par le ___, figure centrale de la mémoire collective chargé de préserver et transmettre l'histoire du peuple.",
    question: PHRASE_Q,
    optionA: "gardien",
    optionB: "griot",
    optionC: "sorcier",
    optionD: "sage",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'homéopathe prépare ses remèdes par ___ successives de la substance de base dans de l'eau ou de l'alcool, affirmant que plus la dilution est forte, plus l'effet thérapeutique est puissant.",
    question: PHRASE_Q,
    optionA: "concentration",
    optionB: "extraction",
    optionC: "dilution",
    optionD: "distillation",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_1 =
    "La photographie numérique a révolutionné les possibilités de [14] des images après la prise de vue. Cependant, l'utilisation abusive de ces outils dans les médias soulève des questions éthiques sur l'[15] des photographies publiées dans la presse.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La photographie numérique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "stockage",
    optionB: "retouche",
    optionC: "diffusion",
    optionD: "classification",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La photographie numérique",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "authenticité",
    optionB: "qualité",
    optionC: "pertinence",
    optionD: "lisibilité",
    correctAnswer: 'A',
  }));

  const TEXTE_LAC_2 =
    "Dans de nombreuses sociétés africaines, le [16] joue un rôle essentiel en transmettant oralement l'histoire, les valeurs et les traditions du groupe. Cette [17] collective, préservée dans les chants, les contes et les généalogies récitées, constitue un patrimoine culturel vivant irremplaçable.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La transmission orale africaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "chef",
    optionB: "griot",
    optionC: "prêtre",
    optionD: "conteur",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La transmission orale africaine",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "mémoire",
    optionB: "langue",
    optionC: "culture",
    optionD: "identité",
    correctAnswer: 'A',
  }));

  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quelle technique photographique utilise un temps de pose long pour capturer le mouvement ou la lumière ?",
    optionA: "Technique 1",
    optionB: "Technique 2",
    optionC: "Technique 3",
    optionD: "Technique 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle cuisine inclut le kimchi comme plat fermenté traditionnel incontournable ?",
    optionA: "Cuisine 1",
    optionB: "Cuisine 2",
    optionC: "Cuisine 3",
    optionD: "Cuisine 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle course cycliste a été créée en 1903 et couvre environ 3 500 km en juillet ?",
    optionA: "Course 1",
    optionB: "Course 2",
    optionC: "Course 3",
    optionD: "Course 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle technique médicale chinoise utilise des aiguilles insérées en des points précis du corps ?",
    optionA: "Médecine 1",
    optionB: "Médecine 2",
    optionC: "Médecine 3",
    optionD: "Médecine 4",
    correctAnswer: 'B',
  }));

  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le coureur C a maintenu la vitesse moyenne la plus élevée sur les 3 dernières étapes de montagne avec une moyenne de 39,2 km/h. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Compromis de vente immobilière — Grenoble",
    longText: DOC_CONTRAT_IMMO,
    question: "Ce document est principalement…",
    optionA: "Un contrat de location d'appartement.",
    optionB: "Un compromis de vente immobilière avec conditions suspensives.",
    optionC: "Une offre d'achat non contractuelle.",
    optionD: "Un état des lieux d'un appartement.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Compromis de vente immobilière — Grenoble",
    longText: DOC_CONTRAT_IMMO,
    question: "Selon ce document, dans quel délai l'acquéreur doit-il obtenir son prêt immobilier ?",
    optionA: "30 jours.",
    optionB: "45 jours.",
    optionC: "60 jours.",
    optionD: "90 jours.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Photographe journaliste",
    longText: DOC_OFFRE_PHOTO,
    question: "Cette offre d'emploi de photographe journaliste exige…",
    optionA: "Aucune expérience préalable.",
    optionB: "3 ans d'expérience minimum en presse.",
    optionC: "Un doctorat en arts visuels.",
    optionD: "La maîtrise exclusive de la photographie de studio.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Photographe journaliste",
    longText: DOC_OFFRE_PHOTO,
    question: "Parmi les avantages proposés dans cette offre, on trouve…",
    optionA: "Un logement de fonction fourni par l'agence.",
    optionB: "Une carte de presse et un véhicule de service.",
    optionC: "Un abonnement à tous les musées de France.",
    optionD: "Des déplacements exclusivement nationaux.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement — Association de Médecine Douce",
    longText: DOC_REGLEMENT_MED,
    question: "Ce règlement présente principalement…",
    optionA: "Les tarifs des consultations en médecine douce.",
    optionB: "Les conditions d'adhésion et obligations des praticiens de l'association.",
    optionC: "La liste des maladies traitées par les médecines douces.",
    optionD: "Les diplômes reconnus par l'État en médecines alternatives.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement — Association de Médecine Douce",
    longText: DOC_REGLEMENT_MED,
    question: "Selon ce règlement, que doivent faire les membres en cas de pathologie grave chez un patient ?",
    optionA: "Le traiter exclusivement avec les thérapies de l'association.",
    optionB: "L'orienter vers un médecin conventionnel.",
    optionC: "Consulter d'abord les autres membres de l'association.",
    optionD: "Rembourser immédiatement les honoraires déjà perçus.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement — Cyclosportive Grand Tour des Alpilles",
    longText: DOC_REGLEMENT_CYCLO,
    question: "Cette cyclosportive propose combien de parcours différents ?",
    optionA: "2 parcours.",
    optionB: "3 parcours.",
    optionC: "4 parcours.",
    optionD: "5 parcours.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement — Cyclosportive Grand Tour des Alpilles",
    longText: DOC_REGLEMENT_CYCLO,
    question: "Selon ce règlement, à quelle fréquence sont prévus les ravitaillements sur le parcours ?",
    optionA: "Tous les 15 km.",
    optionB: "Tous les 30 km.",
    optionC: "Tous les 45 km.",
    optionD: "Tous les 50 km.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide des techniques de cuisine asiatique",
    longText: DOC_GUIDE_CUISINE,
    question: "Ce document présente principalement…",
    optionA: "L'histoire de la cuisine asiatique en France.",
    optionB: "Des techniques de cuisine asiatique et des conseils pratiques.",
    optionC: "Le menu complet du restaurant Saveurs d'Asie.",
    optionD: "Une comparaison entre les cuisines japonaise et chinoise.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide des techniques de cuisine asiatique",
    longText: DOC_GUIDE_CUISINE,
    question: "Selon ce guide, pourquoi faut-il préparer tous les ingrédients avant de commencer la cuisson au wok ?",
    optionA: "Pour respecter les traditions culinaires asiatiques.",
    optionB: "Parce que la cuisson au wok va très vite.",
    optionC: "Pour éviter que les légumes ne noircissent à l'air.",
    optionD: "Parce que le wok chauffe très lentement.",
    correctAnswer: 'B',
  }));

  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Photographie et manipulation de l'image",
    longText: ART_PHOTO,
    question: "Selon cet article, qu'ont adopté les agences de presse comme Reuters et AP pour lutter contre la manipulation d'images ?",
    optionA: "L'interdiction totale de toute retouche numérique.",
    optionB: "Des chartes strictes n'autorisant que des ajustements mineurs.",
    optionC: "L'utilisation exclusive de photographies argentiques.",
    optionD: "Un système de double vérification par deux photographes.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Photographie et manipulation de l'image",
    longText: ART_PHOTO,
    question: "D'après l'article, quelle menace les deepfakes représentent-ils principalement ?",
    optionA: "Une menace pour le marché de la photographie artistique.",
    optionB: "Une menace sérieuse pour la démocratie et la vérité.",
    optionC: "Un danger exclusivement pour les personnalités politiques.",
    optionD: "Un problème limité aux plateformes de divertissement.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Littérature africaine contemporaine et reconnaissance internationale",
    longText: ART_LITT_AFRIQUE,
    question: "Selon cet article, quel prix Nobel de littérature a signalé l'attention croissante portée aux voix africaines ?",
    optionA: "Celui accordé à Léopold Sédar Senghor.",
    optionB: "Celui accordé à Abdulrazak Gurnah en 2021.",
    optionC: "Celui accordé à Wole Soyinka en 1986.",
    optionD: "Celui accordé à Nadine Gordimer en 1991.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Littérature africaine contemporaine et reconnaissance internationale",
    longText: ART_LITT_AFRIQUE,
    question: "D'après l'auteur, quelle inégalité structurelle subsiste dans le marché littéraire africain ?",
    optionA: "L'absence de traducteurs qualifiés pour les langues africaines.",
    optionB: "La majorité des maisons d'édition de référence sont situées à Paris.",
    optionC: "Le manque d'écoles d'écriture créative en Afrique.",
    optionD: "L'impossibilité pour les auteurs africains d'être lus en Occident.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Médecines alternatives et médecine conventionnelle",
    longText: ART_MED_ALT,
    question: "Selon cet article, quelle a été la conséquence scientifique pour l'homéopathie en France ?",
    optionA: "Sa reconnaissance officielle comme médecine complémentaire.",
    optionB: "Son déremboursement en 2021 après les conclusions scientifiques.",
    optionC: "L'obligation de prescription médicale pour tout produit homéopathique.",
    optionD: "Son interdiction complète sur le territoire français.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Médecines alternatives et médecine conventionnelle",
    longText: ART_MED_ALT,
    question: "D'après l'article, qu'est-ce qui constitue le principal obstacle à une intégration rationnelle des médecines alternatives ?",
    optionA: "Le refus des assurances maladie de toute prise en charge.",
    optionB: "Le dialogue méthodologique entre évaluation clinique et approches holistiques.",
    optionC: "L'hostilité des médecins conventionnels envers les praticiens alternatifs.",
    optionD: "L'insuffisance des formations en médecines alternatives.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Cyclisme professionnel et dopage",
    longText: ART_CYCLISME,
    question: "Selon cet article, quelle est l'innovation antidopage la plus significative des vingt dernières années ?",
    optionA: "Les analyses urinaires dans les 24 heures suivant la compétition.",
    optionB: "Le passeport biologique de l'athlète.",
    optionC: "Les contrôles inopinés à domicile des coureurs.",
    optionD: "L'interdiction de toute substance médicamenteuse pendant la course.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Cyclisme professionnel et dopage",
    longText: ART_CYCLISME,
    question: "D'après l'auteur, sur quels leviers légaux le cyclisme contemporain investit-il pour améliorer les performances ?",
    optionA: "Exclusivement sur l'entraînement en altitude.",
    optionB: "L'aérodynamisme, la nutrition, la préparation mentale et la récupération.",
    optionC: "Le recours à de nouveaux médicaments thérapeutiques non contrôlés.",
    optionD: "La sélection génétique des meilleurs profils physiologiques.",
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
    console.log(`\n✅ ${created} questions créées pour CE 27.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
