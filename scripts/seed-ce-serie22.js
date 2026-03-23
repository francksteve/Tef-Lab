'use strict';
/**
 * seed-ce-serie22.js
 * Peuple la série CE 22 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie22.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyohkw000i0wxlul280hdh';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART (températures océaniques 3 zones) ── */
function generateQ22SVG() {
  // 3 polylines pour Graphique 3 (zone équatoriale stable 26-28°C) CORRECT = C
  // Each graph shows 3 zones monthly
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  const graphDefs = [
    {
      label: 'Graphique 1',
      lines: [
        { color: '#E30613', data: [10,12,15,18,22,26,28,27,24,19,14,11] },
        { color: '#003087', data: [5,6,8,11,15,19,22,21,17,12,8,6] },
        { color: '#16a34a', data: [2,2,4,7,10,14,17,16,12,8,4,2] },
      ]
    },
    {
      label: 'Graphique 2',
      lines: [
        { color: '#E30613', data: [20,21,23,26,28,30,31,30,28,25,22,20] },
        { color: '#003087', data: [15,16,18,20,23,26,27,26,24,21,18,15] },
        { color: '#16a34a', data: [8,9,11,14,17,20,22,21,18,14,10,8] },
      ]
    },
    {
      label: 'Graphique 3',
      lines: [
        { color: '#E30613', data: [27,27,27,26,27,28,28,28,27,27,26,27] }, // CORRECT: équatorial stable
        { color: '#003087', data: [18,19,21,23,25,27,28,27,25,22,20,18] },
        { color: '#16a34a', data: [12,13,15,17,19,22,23,22,20,17,14,12] },
      ]
    },
    {
      label: 'Graphique 4',
      lines: [
        { color: '#E30613', data: [14,15,17,19,22,25,26,25,22,19,16,14] },
        { color: '#003087', data: [8,9,11,14,17,21,23,22,18,14,10,8] },
        { color: '#16a34a', data: [4,4,6,9,12,16,18,17,13,9,6,4] },
      ]
    },
  ];

  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];

  function drawLineChart(gDef, cx, cy) {
    const plotX = cx + 40, plotY = cy + 30, plotW = 320, plotH = 130;
    const minVal = 0, maxVal = 35;
    const n = months.length;
    const step = plotW / (n - 1);

    const gridLines = [0, 10, 20, 30].map(v => {
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

    const xLabels = months.map((m, i) => {
      const x = (plotX + i * step).toFixed(1);
      return `<text x="${x}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${m}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="195" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 20}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${gDef.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + polylines + xLabels +
           `<text x="${cx + 195}" y="${cy + 190}" text-anchor="middle" font-size="8" fill="#9ca3af">Température (°C)</text>`;
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
  { title: 'Espèce 1', content: "Le grand dauphin (Tursiops truncatus) est un mammifère marin très répandu dans les océans tempérés et tropicaux. Réputé pour son intelligence et sa sociabilité, il vit en groupes appelés pods. Sa taille varie de 2 à 4 mètres, avec un poids allant jusqu'à 300 kg. Bien qu'il ne soit pas directement menacé d'extinction, il souffre des captures accidentelles et de la pollution marine." },
  { title: 'Espèce 2', content: "La baleine bleue (Balaenoptera musculus) est le plus grand animal ayant jamais existé sur Terre, pouvant mesurer jusqu'à 30 mètres et peser 180 tonnes. Se nourrissant exclusivement de krill, elle consomme jusqu'à 4 tonnes de ces crustacés par jour. Classée en danger d'extinction depuis la chasse baleinière intensive du XXe siècle, sa population mondiale ne dépasse pas 15 000 individus." },
  { title: 'Espèce 3', content: "Le mérou géant de l'Atlantique (Epinephelus itajara) peut atteindre 2,5 mètres et peser 360 kg. Ce poisson territorial vit dans les récifs coralliens et les mangroves côtières des Caraïbes et de Floride. Sa reproduction lente et sa longévité (jusqu'à 37 ans) le rendent extrêmement vulnérable à la surpêche. Il est actuellement classé espèce vulnérable par l'UICN." },
  { title: 'Espèce 4', content: "La tortue luth (Dermochelys coriacea) est la plus grande tortue marine du monde, avec une longueur pouvant dépasser 2 mètres et un poids de 900 kg. Elle se distingue par sa carapace molle et coriace, dépourvue d'écailles. Grande voyageuse, elle parcourt des milliers de kilomètres entre ses zones d'alimentation et ses plages de ponte. Sa population a diminué de 80% en 50 ans, la plaçant en danger critique d'extinction." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Instrument 1', content: "Le piano est un instrument à cordes frappées dont les touches actionnent des marteaux recouverts de feutre qui frappent des cordes métalliques. Avec ses 88 touches couvrant plus de 7 octaves, il est l'instrument solo le plus polyvalent de la musique classique. Inventé au début du XVIIIe siècle par Bartolomeo Cristofori, il est devenu central dans la musique classique, romantique et contemporaine." },
  { title: 'Instrument 2', content: "Le violoncelle est un instrument à cordes grave joué en position assise, l'archet tenu à la main droite. Plus grave que le violon et l'alto, mais plus aigu que la contrebasse, il possède 4 cordes accordées en quintes. Son timbre riche et chaleureux, proche de la voix humaine, en fait l'un des instruments les plus expressifs de l'orchestre. Bach et Dvořák lui ont consacré des œuvres emblématiques." },
  { title: 'Instrument 3', content: "La clarinette est un instrument à vent de la famille des bois, jouée avec une anche simple fixée sur un bec. Son étendue de plus de 4 octaves et sa grande agilité en font un instrument soliste redoutable autant qu'un pilier de l'orchestre classique. Mozart lui a consacré son Quintette et son Concerto, parmi les plus beaux de la littérature pour clarinette." },
  { title: 'Instrument 4', content: "La trompette est l'instrument à vent de la famille des cuivres produit les sons les plus aigus. Jouée par vibration des lèvres dans le bec, elle utilise trois pistons pour modifier les hauteurs de son. Son timbre brillant et puissant lui confère un rôle de premier plan dans la fanfare et l'orchestre. Haydn et Hummel ont composé des concertos qui restent des incontournables du répertoire." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Régime 1', content: "Le végétarisme exclut la consommation de viande et de poisson, mais autorise les produits d'origine animale comme les œufs, les produits laitiers et le miel. Ce régime, pratiqué par environ 8% de la population française, est motivé par des raisons éthiques, environnementales ou de santé. Bien équilibré, il n'entraîne aucune carence si l'apport en protéines végétales est suffisant." },
  { title: 'Régime 2', content: "L'alimentation végétalienne (ou végane) exclut absolument tous les produits d'origine animale : viande, poisson, produits laitiers, œufs et miel. Les végétaliens rejettent toute exploitation animale pour des raisons éthiques et environnementales. Ce régime nécessite une supplémentation en vitamine B12, absente des végétaux, et une attention particulière aux apports en protéines, calcium et oméga-3." },
  { title: 'Régime 3', content: "Le régime flexitarien adopte une alimentation principalement végétale tout en incluant occasionnellement de la viande et du poisson, généralement une à deux fois par semaine maximum. Cette approche flexible vise à réduire l'impact environnemental de l'alimentation sans contraintes absolues. C'est actuellement le régime alternatif le plus répandu en France, adopté par environ 25% des consommateurs." },
  { title: 'Régime 4', content: "Le régime pescétarien exclut la viande rouge et la volaille mais autorise la consommation de poisson et de fruits de mer, ainsi que tous les produits laitiers et œufs. Cette alimentation est souvent adoptée pour des raisons de santé, le poisson apportant des oméga-3 essentiels. Elle représente un compromis entre la réduction de la consommation de viande et les besoins nutritionnels en protéines complètes." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Objet 1', content: "Une comète est un petit corps glacé du système solaire, composé de glaces, de poussières et de roches. En s'approchant du Soleil, la chaleur sublime ses glaces et forme une chevelure gazeuse lumineuse et une queue caractéristique pointant à l'opposé du Soleil. Les comètes, vestiges de la formation du système solaire il y a 4,6 milliards d'années, proviennent du nuage d'Oort ou de la ceinture de Kuiper." },
  { title: 'Objet 2', content: "Un pulsar est une étoile à neutrons en rotation très rapide qui émet des faisceaux de rayonnement électromagnétique comme un phare cosmique. Ces émissions périodiques, extrêmement régulières, peuvent atteindre des centaines de rotations par seconde. Les pulsars sont parmi les objets les plus denses de l'univers : une cuillère à café de leur matière pèserait des milliards de tonnes. Ils sont utilisés comme horloges cosmiques pour tester les théories de la relativité." },
  { title: 'Objet 3', content: "Une nébuleuse est un immense nuage de gaz et de poussières interstellaires. Certaines nébuleuses sont des zones de naissance d'étoiles (nébuleuses d'émission), d'autres sont les restes d'étoiles mortes (nébuleuses planétaires). La nébuleuse d'Orion, visible à l'œil nu, est l'une des plus célèbres et se trouve à 1 344 années-lumière de la Terre. Sa beauté en fait l'un des objets préférés des astronomes amateurs." },
  { title: 'Objet 4', content: "Un astéroïde est un petit corps rocheux orbitant autour du Soleil, principalement localisé dans la ceinture d'astéroïdes entre Mars et Jupiter. Ils varient en taille de quelques mètres à plusieurs centaines de kilomètres. Céres, le plus grand, est aujourd'hui classé planète naine. Les astéroïdes sont étudiés avec attention car certains suivent des trajectoires les rapprochant dangereusement de la Terre." },
]);

/* ── Documents Q23-32 ── */
const DOC_CHARTE_OCEAN =
`CHARTE DE PROTECTION DE L'ENVIRONNEMENT MARIN
Port de Marseille — Zone industrialo-portuaire

La présente charte engage les opérateurs portuaires et armateurs dans une démarche volontaire de protection des écosystèmes marins méditerranéens.

ENGAGEMENTS DES SIGNATAIRES :
• Réduction de 30% des rejets d'eaux usées traitées dans le port d'ici 2027
• Interdiction de tout rejet d'hydrocarbures dans les eaux du port
• Tri sélectif obligatoire des déchets générés à bord des navires
• Formation annuelle de l'équipage aux gestes éco-responsables

CONTRÔLES ET SANCTIONS :
Des inspections inopinées seront réalisées trimestriellement par les services du port. Tout manquement grave entraîne une suspension temporaire des droits d'accostage.`;

const DOC_OFFRE_OCEAN =
`OFFRE D'EMPLOI — OCÉANOGRAPHE — IFREMER

L'Institut Français de Recherche pour l'Exploitation de la Mer (IFREMER) recherche un(e) océanographe biologiste pour son centre de Brest.

MISSIONS :
Participation aux campagnes de recherche en mer, collecte et analyse d'échantillons biologiques, contribution à des programmes d'étude de la biodiversité marine, rédaction de publications scientifiques et rapports.

PROFIL :
Doctorat en océanographie ou biologie marine, expérience en plongée scientifique appréciée, maîtrise de l'anglais scientifique. Disponibilité pour des missions en mer de 3 à 6 semaines.

CONTRAT : CDI cadre. Salaire : selon grille IFREMER. Avantages : logement de mission, indemnité de mer, participation aux conférences internationales.
Candidatures : recrutement@ifremer.fr`;

const DOC_CONSERVATOIRE =
`RÈGLEMENT DU CONSERVATOIRE RÉGIONAL DE MUSIQUE

ADMISSION :
L'admission dans les cycles d'enseignement est soumise à un test d'aptitude musical réalisé en septembre. Pour les débutants, aucun pré-requis n'est exigé pour les classes d'éveil (3-6 ans) et d'initiation (6-9 ans).

COURS ET PRÉSENCE :
La présence aux cours est obligatoire. Toute absence doit être signalée 24h à l'avance. Trois absences injustifiées consécutives peuvent entraîner l'exclusion du cours.

INSTRUMENTS :
Le conservatoire met à disposition des instruments pour les élèves ne pouvant en acquérir. Une caution de 200 € est demandée, remboursable en fin d'année en bon état.

COTISATIONS :
Les tarifs sont calculés sur la base du quotient familial. Réductions accordées aux fratries et aux bénéficiaires de la CAF.`;

const DOC_CONVENTION_EDU =
`CONVENTION DE PARTENARIAT — ÉDUCATION INCLUSIVE

Entre le Rectorat de l'Académie et l'Association Handicap & Réussite, il est conclu la présente convention de partenariat pour la période 2025-2028.

OBJECTIFS :
Améliorer l'accompagnement des élèves en situation de handicap dans les établissements scolaires publics de l'académie, former les enseignants aux pratiques pédagogiques inclusives, développer les aides techniques et humaines nécessaires.

ENGAGEMENTS DU RECTORAT :
• Formation de 200 enseignants par an aux pratiques inclusives
• Financement de 50 postes d'AESH (Accompagnants des Élèves en Situation de Handicap) supplémentaires
• Mise à disposition de matériel adapté dans 100 établissements

ENGAGEMENTS DE L'ASSOCIATION :
Expertise technique, formation des AESH, suivi individuel de 500 élèves par an.`;

const DOC_CONTRAT_TRAIN =
`CARTE FAMILLE — CONDITIONS GÉNÉRALES D'ABONNEMENT

La Carte Famille vous permet de bénéficier de réductions sur vos voyages en train pour toute la famille.

AVANTAGES :
• Titulaire de la carte : 30% de réduction sur tous les trajets
• Conjoint(e) ou partenaire de PACS : 30% de réduction
• Enfants de 4 à 11 ans : 50% de réduction
• Enfants de 0 à 3 ans : voyage gratuit (1 enfant par adulte)

CONDITIONS :
La Carte Famille est valable 1 an. Elle est nominative et non cessible. Tous les membres de la famille doivent voyager ensemble pour bénéficier des réductions. Valable sur l'ensemble du réseau national, hors trajets internationaux.

Tarif annuel de la carte : 75 € pour 3 enfants, 15 € par enfant supplémentaire.`;

/* ── Articles Q33-40 ── */
const ART_ACIDIFICATION =
`ACIDIFICATION DES OCÉANS : LA MENACE SILENCIEUSE SUR LA BIODIVERSITÉ MARINE

Depuis la révolution industrielle, les océans ont absorbé environ 30% du dioxyde de carbone (CO₂) émis par les activités humaines. Si ce phénomène a temporairement limité le réchauffement climatique, il a en contrepartie déclenché une transformation chimique profonde des eaux marines : l'acidification. Depuis 1850, le pH moyen des océans est passé de 8,2 à 8,1 — ce qui peut sembler modeste mais représente une augmentation de 26% de l'acidité.

Les conséquences sur la biodiversité marine sont profondes et alarmantes. Les organismes à coquille calcaire — huîtres, moules, oursins, coraux — peinent à former et maintenir leur squelette dans des eaux plus acides. Les récifs coralliens, qui abritent 25% des espèces marines malgré leur couverture de moins de 1% des fonds océaniques, sont particulièrement menacés. Une acidification trop importante pourrait conduire à leur dissolution pure et simple.

Au bas de la chaîne alimentaire marine, les ptéropodes, minuscules mollusques planctoniques, constituent la base de l'alimentation de nombreux poissons et cétacés. Or leur coquille s'avère extrêmement sensible à l'acidification. Toute perturbation de cette population pourrait déstabiliser des écosystèmes entiers.

Les solutions passent nécessairement par une réduction massive des émissions de CO₂. Certains chercheurs explorent des solutions de géo-ingénierie comme l'alcalinisation locale des eaux ou la fertilisation au fer pour stimuler les algues absorbant le CO₂. Ces approches restent cependant controversées en raison des risques d'effets secondaires imprévisibles sur les écosystèmes.`;

const ART_MUSIQUE =
`LE RAYONNEMENT DE LA MUSIQUE CLASSIQUE CONTEMPORAINE : ENTRE TRADITION ET RENOUVEAU

La musique classique souffre depuis plusieurs décennies d'une image austère et élitiste qui effraie de nouveaux publics. Pourtant, une réalité plus nuancée s'impose : les salles de concert affichent des taux de remplissage supérieurs à 85% dans les grandes métropoles mondiales, et des artistes comme Yuja Wang, Gustavo Dudamel ou Lang Lang attirent des foules dignes des stars de la pop.

La révolution numérique a profondément transformé les modes d'accès à la musique classique. Les plateformes de streaming comme Apple Music Classical, Spotify Classical ou Idagio permettent désormais d'écouter l'intégralité du répertoire mondial pour quelques euros par mois. YouTube a démocratisé l'accès aux grandes interprétations historiques et aux concerts des meilleures salles du monde. Certains musiciens classiques comptent des millions d'abonnés sur TikTok et Instagram.

La question de la création contemporaine reste toutefois épineuse. La musique contemporaine savante, héritière des expérimentations du XXe siècle, peine parfois à trouver son public en dehors des cercles spécialisés. Les compositeurs d'aujourd'hui naviguent entre l'héritage tonal de la tradition et les exigences d'un langage musical en perpétuel renouvellement.

L'enjeu pour les institutions musicales est d'attirer de nouveaux publics sans trahir l'exigence artistique. Des initiatives comme les concerts participatifs, les découvertes commentées ou les partenariats avec des artistes de musiques actuelles témoignent d'une vitalité créatrice encourageante.`;

const ART_DROIT_FAMILLE =
`RÉFORME DU DROIT DE LA FAMILLE : VERS UNE MEILLEURE PROTECTION DES ENFANTS

Le droit de la famille français a connu plusieurs réformes majeures ces dernières décennies, cherchant à adapter les règles juridiques à l'évolution des structures familiales. L'augmentation des divorces, la multiplication des familles recomposées et l'émergence de nouvelles formes de parentalité ont nécessité une refonte profonde du code civil.

La réforme la plus récente s'attache particulièrement à renforcer la protection des enfants dans les procédures de séparation. Désormais, l'intérêt supérieur de l'enfant constitue le principe directeur de toute décision judiciaire en matière de garde. Les juges sont invités à prendre en compte la parole de l'enfant, quelle que soit son âge, dès lors qu'il est capable de discernement.

La résidence alternée, longtemps controversée, s'est imposée comme la modalité de garde la plus répandue en France. Des études récentes suggèrent qu'elle favorise le maintien du lien avec les deux parents et s'avère bénéfique pour l'équilibre psychologique de l'enfant, à condition que les parents puissent communiquer sereinement.

Les situations de violence conjugale posent cependant des difficultés spécifiques. Comment concilier la continuité du lien père-enfant avec la protection de la victime de violences ? La réforme a introduit de nouvelles mesures d'urgence permettant de suspendre rapidement les droits de visite du parent violent, mais leur application reste parfois lente et insuffisante selon les associations de défense des victimes.`;

const ART_VEGETAL =
`RÉGIMES VÉGÉTAUX ET SANTÉ CARDIOVASCULAIRE : LES DONNÉES DE LA SCIENCE

L'intérêt pour les régimes à base de plantes a explosé ces dernières années, porté par une prise de conscience environnementale croissante et par un corpus scientifique de plus en plus solide sur leurs bénéfices pour la santé. Les études épidémiologiques menées sur des populations d'Amérique du Nord et d'Europe convergent vers une même conclusion : réduire la consommation de viande rouge et de produits ultra-transformés au profit d'aliments végétaux diminue significativement le risque de maladies cardiovasculaires.

Une méta-analyse publiée dans le Journal of the American Heart Association, portant sur plus de 400 000 participants suivis pendant 20 ans, a démontré que les végétariens présentent un risque d'infarctus inférieur de 25% à celui des omnivores, et un risque d'accident vasculaire cérébral réduit de 13%. Les mécanismes explicatifs incluent une pression artérielle plus basse, un taux de cholestérol LDL réduit et un indice de masse corporelle plus favorable.

Il convient cependant de nuancer ces résultats. Tous les régimes végétaux ne se valent pas sur le plan nutritionnel. Un végétarien qui se nourrit principalement de pizzas au fromage et de biscuits industriels n'obtiendra pas les mêmes bénéfices cardiovasculaires qu'un végétarien consommant légumes, légumineuses, graines et fruits à coque en abondance. C'est la qualité intrinsèque des aliments végétaux choisis qui détermine l'impact sur la santé.

Les nutritionnistes recommandent une transition progressive, associant réduction de la viande rouge et augmentation des légumineuses, oléagineux et légumes verts. Une telle approche, compatible avec les habitudes alimentaires françaises, représente un compromis réaliste entre idéal nutritionnel et plaisir gustatif.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche concert orchestre
  qs.push(q(1, 'Q1-7', null, {
    longText:
`ORCHESTRE PHILHARMONIQUE DE BORDEAUX
Saison 2025-2026 — Grand Théâtre

VENDREDI 7 NOVEMBRE — 20H00
CONCERT SYMPHONIQUE GALA
Direction : Maestro Éric Belluard
Soliste : Hana Yamamoto, violoncelle (premier prix international)

AU PROGRAMME :
• Beethoven : Ouverture Egmont
• Dvořák : Concerto pour violoncelle en si mineur
• Brahms : Symphonie n°4

Tarifs : Orchestre 55 € | Mezzanine 35 € | Galerie 18 €
Étudiants : 10 € sur présentation de carte | Réservations : 05 56 00 85 95`,
    question: "D'après ce document, quel instrument Hana Yamamoto joue-t-elle ?",
    optionA: "Le violon.",
    optionB: "Le piano.",
    optionC: "Le violoncelle.",
    optionD: "La trompette.",
    correctAnswer: 'C',
  }));

  // Q2 — Horaires TGV
  qs.push(q(2, 'Q1-7', null, {
    longText:
`HORAIRES TGV — PARIS MONTPARNASSE → BORDEAUX SAINT-JEAN
Valables du 1er juin au 31 août 2025

Départ 06h15 → Arrivée 08h28 | Tarif Prem's : à partir de 25 €
Départ 08h00 → Arrivée 10h11 | Tarif Standard : à partir de 49 €
Départ 12h30 → Arrivée 14h41 | Tarif Standard : à partir de 49 €
Départ 17h00 → Arrivée 19h11 | Tarif Standard : à partir de 52 €
Départ 19h30 → Arrivée 21h43 | Tarif Prem's : à partir de 29 €

Durée de trajet : 2h11 | Réservation obligatoire
Cartes de réduction acceptées sur tous les trains`,
    question: "Ce document est…",
    optionA: "un horaire de bus régional.",
    optionB: "un tableau des horaires et tarifs de trains TGV.",
    optionC: "une offre promotionnelle de location de voiture.",
    optionD: "un règlement des conditions de voyage en train.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement école inclusive
  qs.push(q(3, 'Q1-7', null, {
    longText:
`ÉCOLE PRIMAIRE LES HIRONDELLES — RÈGLEMENT INCLUSION

Notre école est engagée dans une démarche d'éducation inclusive pour accueillir tous les élèves, y compris ceux présentant des besoins éducatifs particuliers.

ACCOMPAGNEMENT :
• Chaque élève bénéficiant d'un Plan d'Accompagnement Personnalisé (PAP) est suivi par un AESH dédié
• Des aménagements pédagogiques sont proposés selon les besoins : tiers-temps, supports adaptés, mobilier spécifique
• Des réunions d'équipe de suivi sont organisées chaque trimestre avec les parents

COMMUNICATION :
Les familles sont informées de tout changement dans le dispositif d'accompagnement de leur enfant. Un cahier de liaison quotidien assure le lien école-famille.`,
    question: "Ce document concerne principalement…",
    optionA: "les tarifs de la cantine scolaire.",
    optionB: "les règles d'accueil et d'accompagnement des élèves handicapés.",
    optionC: "les horaires des activités périscolaires.",
    optionD: "les conditions d'inscription à l'école primaire.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce télescope
  qs.push(q(4, 'Q1-7', null, {
    longText:
`PETITE ANNONCE — Télescope astronome amateur
Vends télescope réfracteur CELESTRON AstroMaster 70EQ
État : excellent, utilisé 15 fois maximum.
Ouverture 70 mm, focale 900 mm, monture équatoriale manuelle.
Accessoires inclus : 2 oculaires (10 mm et 20 mm), chercheur étoile, trépied aluminium.
Idéal pour observer lune, planètes et nébuleuses.
Prix demandé : 145 € (prix neuf 240 €). Possible de voir avant achat.
Contact : marc.dupont@mail.fr ou SMS au 06 45 12 78 93`,
    question: "D'après cette annonce, le vendeur accepte…",
    optionA: "uniquement le paiement par virement bancaire.",
    optionB: "que l'acheteur vienne voir le télescope avant l'achat.",
    optionC: "uniquement les offres supérieures au prix demandé.",
    optionD: "l'échange contre un autre instrument d'astronomie.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi éplucheur légumes
  qs.push(q(5, 'Q1-7', null, {
    longText:
`ÉPLUCHEUR SPIRALISEUR MULTIFONCTION — GUIDE D'UTILISATION

Votre appareil permet de réaliser des spaghettis de légumes, des rubans et des tranches fines pour une cuisine végétale créative et équilibrée.

UTILISATION :
1. Choisissez la lame adaptée : lame fine (spaghetti), lame large (rubans) ou mandoline (tranches)
2. Fixez le légume (courgette, carotte, betterave, concombre) entre le pique et la ventouse
3. Tournez la manivelle en maintenant une pression constante
4. Récupérez vos préparations dans le bol fourni

ENTRETIEN : Lavez les lames à la main uniquement. Ne pas utiliser au lave-vaisselle.
⚠ Lames très tranchantes — tenir hors de portée des enfants.`,
    question: "Ce document est…",
    optionA: "une recette de cuisine végétarienne.",
    optionB: "une notice d'utilisation d'un appareil de cuisine.",
    optionC: "un catalogue de produits végétaux.",
    optionD: "une publicité pour un restaurant végétalien.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué ONG protection océans
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — ONG OCEAN DEFENDERS FRANCE

À l'occasion de la Journée Mondiale des Océans (8 juin), Ocean Defenders France lance sa campagne annuelle « Mer Propre 2025 ».

Cette année, nous organisons des opérations de nettoyage de plages dans 45 sites côtiers en France métropolitaine et dans les DOM-TOM. Plus de 8 000 bénévoles sont attendus.

Nos objectifs : collecter et recycler les déchets plastiques avant qu'ils n'atteignent la mer, sensibiliser le grand public à la pollution marine, et interpeller les pouvoirs publics sur la nécessité d'interdire les plastiques à usage unique d'ici 2026.

Pour participer ou faire un don : www.oceandefenders.fr`,
    question: "Quel est le but principal de ce communiqué ?",
    optionA: "Présenter les résultats d'une étude scientifique sur la pollution.",
    optionB: "Annoncer et promouvoir une campagne de nettoyage des plages.",
    optionC: "Critiquer les politiques environnementales du gouvernement.",
    optionD: "Recruter des chercheurs en biologie marine.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation réunion parents d'élèves
  qs.push(q(7, 'Q1-7', null, {
    longText:
`École Primaire Jules Ferry — Toulouse

Madame, Monsieur,

Nous avons le plaisir de vous convier à la réunion de parents d'élèves du premier trimestre.

Date : Jeudi 3 octobre 2025 à 18h00
Lieu : Salle polyvalente de l'école, bâtiment B

À l'ordre du jour :
• Présentation des programmes et méthodes pédagogiques de l'année
• Organisation de la classe et projets en cours
• Questions diverses

Votre présence est très importante pour le suivi de la scolarité de votre enfant. En cas d'impossibilité, nous vous remercions de nous en informer au préalable.

L'équipe enseignante`,
    question: "Quel est l'objectif principal de ce document ?",
    optionA: "Informer les parents d'une sortie scolaire.",
    optionB: "Inviter les parents à une réunion de début d'année.",
    optionC: "Annoncer les résultats du premier trimestre.",
    optionD: "Demander une contribution financière aux familles.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le biologiste a prélevé des échantillons d'eau pour analyser l'état de santé du ___ corallien de la baie.",
    question: PHRASE_Q,
    optionA: "fond",
    optionB: "récif",
    optionC: "littoral",
    optionD: "courant",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le chef d'orchestre a demandé aux musiciens de relire attentivement leur ___ avant la répétition générale de ce soir.",
    question: PHRASE_Q,
    optionA: "programme",
    optionB: "partition",
    optionC: "répertoire",
    optionD: "contrat",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Après le jugement de divorce, le tribunal a confié la ___ des enfants aux deux parents en alternance hebdomadaire.",
    question: PHRASE_Q,
    optionA: "protection",
    optionB: "responsabilité",
    optionC: "garde",
    optionD: "tutelle",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les lentilles corail sont une excellente source de ___ végétale, idéale pour les personnes suivant un régime sans viande.",
    question: PHRASE_Q,
    optionA: "vitamine",
    optionB: "minéral",
    optionC: "protéine",
    optionD: "glucide",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La SNCF a attribué un ___ horaire supplémentaire à cette compagnie ferroviaire privée pour ses trains Lyon-Paris.",
    question: PHRASE_Q,
    optionA: "trajet",
    optionB: "sillon",
    optionC: "passage",
    optionD: "couloir",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les astronomes ont découvert que cette ___ est en réalité une étoile en formation entourée de poussières et de gaz interstellaires.",
    question: PHRASE_Q,
    optionA: "planète",
    optionB: "galaxie",
    optionC: "nébuleuse",
    optionD: "comète",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La pollution plastique des océans est devenue une catastrophe environnementale mondiale. Des millions de tonnes de déchets plastiques se fragmentent en [14] invisibles à l'œil nu, qui contaminent l'eau, les sédiments et les organismes marins. Ces particules entrent ensuite dans la [15] et finissent par atteindre l'assiette des consommateurs humains.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La pollution plastique des océans',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "microplastiques",
    optionB: "substances",
    optionC: "déchets",
    optionD: "molécules",
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — La pollution plastique des océans',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "mer",
    optionB: "chaîne alimentaire",
    optionC: "biodiversité",
    optionD: "nature",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "L'inclusion scolaire des élèves en situation de handicap nécessite des [16] spécifiques dans les salles de classe et les espaces communs. Chaque élève bénéficie de l'aide d'un [17] des élèves en situation de handicap (AESH) qui l'accompagne tout au long de la journée scolaire.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'inclusion scolaire",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "cours",
    optionB: "décisions",
    optionC: "aménagements",
    optionD: "formations",
    correctAnswer: 'C',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — L'inclusion scolaire",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "directeur",
    optionB: "professeur",
    optionC: "accompagnateur",
    optionD: "médecin",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel animal est décrit comme le plus grand animal existant sur Terre, pouvant mesurer jusqu'à 30 mètres ?",
    optionA: "Espèce 1",
    optionB: "Espèce 2",
    optionC: "Espèce 3",
    optionD: "Espèce 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel instrument à cordes est grave, joué assis avec un archet, et plus grave que le violon ?",
    optionA: "Instrument 1",
    optionB: "Instrument 2",
    optionC: "Instrument 3",
    optionD: "Instrument 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel régime alimentaire exclut absolument tout produit d'origine animale, y compris le miel et les œufs ?",
    optionA: "Régime 1",
    optionB: "Régime 2",
    optionC: "Régime 3",
    optionD: "Régime 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel objet astronomique est une étoile à neutrons émettant des radiations périodiques régulières ?",
    optionA: "Objet 1",
    optionB: "Objet 2",
    optionC: "Objet 3",
    optionD: "Objet 4",
    correctAnswer: 'B',
  }));

  // Q22 : Graphique
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La zone équatoriale maintient une température océanique constante entre 26 et 28°C toute l'année, favorisant le développement des récifs coralliens. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'C',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Charte de protection de l'environnement marin — Port de Marseille",
    longText: DOC_CHARTE_OCEAN,
    question: "Cette charte engage principalement les opérateurs portuaires à…",
    optionA: "payer des taxes environnementales supplémentaires.",
    optionB: "adopter des pratiques volontaires de protection des écosystèmes marins.",
    optionC: "arrêter toute activité maritime dans la zone.",
    optionD: "financer la recherche océanographique.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Charte de protection de l'environnement marin — Port de Marseille",
    longText: DOC_CHARTE_OCEAN,
    question: "Selon la charte, quelles sanctions sont prévues en cas de manquement grave ?",
    optionA: "Une amende financière immédiate.",
    optionB: "Une suspension temporaire des droits d'accostage.",
    optionC: "Une interdiction définitive d'accès au port.",
    optionD: "Une plainte déposée devant le tribunal maritime.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Océanographe IFREMER",
    longText: DOC_OFFRE_OCEAN,
    question: "Quel est le niveau d'études requis pour ce poste d'océanographe ?",
    optionA: "Un master en sciences de la mer.",
    optionB: "Un BTS environnement marin.",
    optionC: "Un doctorat en océanographie ou biologie marine.",
    optionD: "Une licence en physique appliquée.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Océanographe IFREMER",
    longText: DOC_OFFRE_OCEAN,
    question: "Parmi les avantages proposés dans cette offre, on trouve…",
    optionA: "Un logement de fonction permanent à Brest.",
    optionB: "Une indemnité de mer lors des missions en bateau.",
    optionC: "Un véhicule de service pour les déplacements.",
    optionD: "Une prime annuelle de 3 mois de salaire.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Règlement du Conservatoire régional de musique",
    longText: DOC_CONSERVATOIRE,
    question: "Ce document présente principalement…",
    optionA: "le programme des concerts de la saison.",
    optionB: "les règles d'admission, de présence et de cotisation au conservatoire.",
    optionC: "la liste des instruments enseignés au conservatoire.",
    optionD: "les critères de sélection des enseignants.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Règlement du Conservatoire régional de musique",
    longText: DOC_CONSERVATOIRE,
    question: "Selon ce règlement, combien d'absences injustifiées consécutives peut entraîner l'exclusion d'un cours ?",
    optionA: "Deux absences.",
    optionB: "Trois absences.",
    optionC: "Cinq absences.",
    optionD: "Une seule absence.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Éducation inclusive",
    longText: DOC_CONVENTION_EDU,
    question: "Cette convention de partenariat a été conclue entre…",
    optionA: "Le ministère de l'Éducation et les parents d'élèves.",
    optionB: "Le Rectorat de l'Académie et l'Association Handicap & Réussite.",
    optionC: "La mairie et les établissements scolaires privés.",
    optionD: "Les enseignants et les médecins scolaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Convention de partenariat — Éducation inclusive",
    longText: DOC_CONVENTION_EDU,
    question: "Selon cette convention, combien de postes d'AESH supplémentaires le Rectorat s'engage-t-il à financer ?",
    optionA: "20 postes.",
    optionB: "50 postes.",
    optionC: "100 postes.",
    optionD: "200 postes.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Carte Famille — Conditions générales d'abonnement",
    longText: DOC_CONTRAT_TRAIN,
    question: "Ce document présente principalement…",
    optionA: "les horaires des trains pour les familles nombreuses.",
    optionB: "les avantages et conditions de la Carte Famille SNCF.",
    optionC: "les tarifs réduits pour les seniors voyageant en famille.",
    optionD: "les règles de remboursement en cas d'annulation.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Carte Famille — Conditions générales d'abonnement",
    longText: DOC_CONTRAT_TRAIN,
    question: "Selon ce document, à quelle réduction ont droit les enfants de 4 à 11 ans avec la Carte Famille ?",
    optionA: "30% de réduction.",
    optionB: "40% de réduction.",
    optionC: "50% de réduction.",
    optionD: "Voyage gratuit.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Acidification des océans : la menace silencieuse sur la biodiversité marine",
    longText: ART_ACIDIFICATION,
    question: "Selon cet article, depuis 1850, de combien a augmenté l'acidité des océans ?",
    optionA: "De 10%.",
    optionB: "De 26%.",
    optionC: "De 50%.",
    optionD: "De 100%.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Acidification des océans : la menace silencieuse sur la biodiversité marine",
    longText: ART_ACIDIFICATION,
    question: "Selon l'article, quelle proportion des espèces marines les récifs coralliens abritent-ils malgré leur faible superficie ?",
    optionA: "5% des espèces marines.",
    optionB: "10% des espèces marines.",
    optionC: "25% des espèces marines.",
    optionD: "50% des espèces marines.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Le rayonnement de la musique classique contemporaine",
    longText: ART_MUSIQUE,
    question: "Selon cet article, dans les grandes métropoles mondiales, les salles de concert classique affichent…",
    optionA: "Des taux de remplissage inférieurs à 50%.",
    optionB: "Des taux de remplissage supérieurs à 85%.",
    optionC: "Des salles à moitié vides depuis la pandémie.",
    optionD: "Une fréquentation en baisse constante depuis 10 ans.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Le rayonnement de la musique classique contemporaine",
    longText: ART_MUSIQUE,
    question: "D'après l'auteur, quel est le principal défi pour les institutions musicales ?",
    optionA: "Financer de nouveaux concerts sans aide publique.",
    optionB: "Attirer de nouveaux publics sans trahir l'exigence artistique.",
    optionC: "Former plus de musiciens classiques dans les conservatoires.",
    optionD: "Interdire l'accès aux plateformes de streaming.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Réforme du droit de la famille : vers une meilleure protection des enfants",
    longText: ART_DROIT_FAMILLE,
    question: "Selon cet article, quel est le principe directeur de toute décision judiciaire en matière de garde ?",
    optionA: "Le maintien du lien avec le père.",
    optionB: "La stabilité financière du foyer.",
    optionC: "L'intérêt supérieur de l'enfant.",
    optionD: "La préférence de la mère dans la jurisprudence.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Réforme du droit de la famille : vers une meilleure protection des enfants",
    longText: ART_DROIT_FAMILLE,
    question: "D'après l'article, quelle est la condition pour que la résidence alternée soit bénéfique pour l'enfant ?",
    optionA: "Que l'enfant soit âgé de moins de 5 ans.",
    optionB: "Que les deux parents habitent dans la même ville.",
    optionC: "Que les parents puissent communiquer sereinement.",
    optionD: "Que le juge l'impose systématiquement.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Régimes végétaux et santé cardiovasculaire : les données de la science",
    longText: ART_VEGETAL,
    question: "Selon la méta-analyse citée dans l'article, les végétariens présentent un risque d'infarctus inférieur de…",
    optionA: "10% par rapport aux omnivores.",
    optionB: "25% par rapport aux omnivores.",
    optionC: "50% par rapport aux omnivores.",
    optionD: "75% par rapport aux omnivores.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Régimes végétaux et santé cardiovasculaire : les données de la science",
    longText: ART_VEGETAL,
    question: "Selon l'auteur, quel facteur détermine réellement l'impact d'un régime végétal sur la santé ?",
    optionA: "L'absence totale de produits animaux.",
    optionB: "La qualité intrinsèque des aliments végétaux choisis.",
    optionC: "La durée pendant laquelle on suit le régime.",
    optionD: "La prise de compléments alimentaires.",
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
    console.log(`\n✅ ${created} questions créées pour CE 22.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
