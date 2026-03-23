'use strict';
/**
 * seed-ce-serie20.js
 * Peuple la série CE 20 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie20.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyoh5y000g0wxl8ikw9b02';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts fréquentation mensuelle cinéma ── */
function generateQ22SVG() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const graphs = [
    { label: 'Graphique 1', data: [120,140,160,180,200,250,310,320,190,170,150,130], color: '#E30613' },
    { label: 'Graphique 2', data: [200,180,160,140,130,120,110,120,140,160,190,210], color: '#E30613' },
    { label: 'Graphique 3', data: [130,120,150,160,170,220,290,300,175,155,140,125], color: '#003087' }, // CORRECT : pic été + décembre
    { label: 'Graphique 4', data: [150,150,150,200,200,200,150,150,200,200,150,150], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 350;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = plotW / months.length - 2;

    const gridLines = [0, 100, 200, 300].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx = (plotX + i * (plotW / months.length) + 1).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW.toFixed(1)}" height="${bh}" fill="${g.color}" opacity="0.8"/>`;
    }).join('');

    const xLabels = months.map((m, i) => {
      const px = (plotX + i * (plotW / months.length) + barW / 2 + 1).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${m}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars + xLabels +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Entrées (milliers)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawBarChart(g, positions[i].cx, positions[i].cy)).join('') +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/* ── Helper ── */
const q = (order, cat, sub, data) => ({
  moduleId: MODULE_ID, seriesId: SERIES_ID, questionOrder: order,
  category: cat, subCategory: sub ?? null,
  taskTitle: data.taskTitle ?? null, longText: data.longText ?? null,
  consigne: data.consigne ?? null, comment: data.comment ?? null,
  imageUrl: data.imageUrl ?? null, audioUrl: null,
  question: data.question,
  optionA: data.optionA, optionB: data.optionB,
  optionC: data.optionC, optionD: data.optionD,
  correctAnswer: data.correctAnswer, explanation: data.explanation ?? null,
});

/* ── Textes Q18-21 ── */
const TEXTS_Q18 = JSON.stringify([
  { title: 'Genre 1', content: "Le jazz est né aux États-Unis à la fin du XIXe siècle, dans les communautés afro-américaines de La Nouvelle-Orléans. Il se caractérise par l'improvisation, les syncopes rythmiques et l'utilisation de gammes blues. Ses sous-genres incluent le bebop, le cool jazz, le jazz fusion et le jazz manouche." },
  { title: 'Genre 2', content: "La musique classique européenne s'étend de la période baroque (XVIIe siècle) au XXe siècle. Elle est caractérisée par des formes compositionnelles rigoureuses (sonate, symphonie, opéra), une notation précise et une interprétation par des orchestres et solistes formés selon une tradition académique stricte." },
  { title: 'Genre 3', content: "Le reggae est une musique jamaïcaine née dans les années 1960. Il se distingue par son rythme syncopé sur le contretemps (le 'skank'), sa basse profonde et ses textes souvent engagés, liés au mouvement rastafari. Bob Marley en est la figure emblématique mondiale." },
  { title: 'Genre 4', content: "La musique électronique se construit exclusivement à partir de sons synthétisés ou enregistrés, produits et arrangés avec des logiciels et machines. Elle regroupe des genres comme la techno, la house, le drum and bass ou la musique ambiante. Les DJ et producteurs en sont les principaux artistes." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Ville 1', content: "Tokyo est la capitale du Japon et l'une des plus grandes métropoles mondiales avec environ 37 millions d'habitants dans son aire urbaine. Elle combine technologie de pointe, tradition culturelle ancestrale et gastronomie raffinée. Son réseau de transports en commun est considéré comme le plus efficace au monde." },
  { title: 'Ville 2', content: "Montréal est la deuxième plus grande ville du Canada et la capitale culturelle du Québec francophone. Ville cosmopolite bilingue, elle est reconnue pour sa scène musicale et artistique dynamique, ses festivals internationaux (jazz, humour, cinéma) et son architecture mêlant édifices historiques et modernisme." },
  { title: 'Ville 3', content: "Nairobi est la capitale et la plus grande ville du Kenya, avec une population d'environ 5 millions d'habitants. Hub économique et diplomatique de l'Afrique de l'Est, elle abrite de nombreuses organisations internationales. Ses contrastes entre quartiers d'affaires modernes et bidonvilles en font un symbole des inégalités africaines." },
  { title: 'Ville 4', content: "Buenos Aires est la capitale de l'Argentine et l'une des métropoles les plus peuplées d'Amérique du Sud. Surnommée le Paris de l'Amérique du Sud pour son architecture européenne, elle est le berceau du tango. Sa vie culturelle intense, ses cafés littéraires et son cinéma en font une ville de référence culturelle." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Sport 1', content: "L'escalade sportive consiste à grimper des parois naturelles ou artificielles à l'aide de prises. Elle comprend plusieurs disciplines : la difficulté (voies longues), la vitesse (compétition chronométrée) et le bloc (circuits courts sans corde). Elle a intégré les Jeux Olympiques en 2020 à Tokyo." },
  { title: 'Sport 2', content: "Le triathlon est une épreuve d'endurance combinant natation, cyclisme et course à pied, enchaînés sans interruption. La distance olympique comprend 1,5 km de nage, 40 km de vélo et 10 km de course. L'Ironman, version longue, triple chaque segment. Le triathète ne peut pas s'arrêter entre les épreuves." },
  { title: 'Sport 3', content: "La lutte gréco-romaine est l'une des plus anciennes disciplines sportives, présente aux Jeux Olympiques modernes depuis 1896. Elle interdit tout usage des jambes pour attaquer ou saisir l'adversaire sous la ceinture. Le but est de projeter l'adversaire dos au sol ('tomber') ou de marquer le plus de points." },
  { title: 'Sport 4', content: "Le curling est un sport d'hiver pratiqué sur glace, opposant deux équipes qui font glisser des pierres de granit vers une cible circulaire (la maison). Des balayeurs orientent les trajectoires en frottant la glace. Très populaire au Canada et en Écosse, il est surnommé 'les échecs sur glace' pour sa dimension stratégique." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Art 1', content: "La peinture à l'huile utilise des pigments broyés dans une huile siccative (lin, noix, pavot) qui polymérise au contact de l'air. Elle permet des glacis translucides, des textures épaisses (empâtement) et de longues corrections. Maîtrisée par Van Eyck au XVe siècle, elle est encore la technique picturale dominante." },
  { title: 'Art 2', content: "La gravure est un procédé d'impression qui consiste à inciser un motif sur une plaque (métal, bois, pierre) et à en tirer des épreuves sur papier. Les techniques principales incluent la taille-douce, la lithographie et la sérigraphie. Chaque tirage est numéroté et signé par l'artiste." },
  { title: 'Art 3', content: "La sculpture sur bois est l'une des plus anciennes formes d'expression artistique humaine. Elle peut être en ronde-bosse (tout en relief) ou en bas-relief (motif découpé dans une surface plane). Les essences utilisées varient selon les régions : tilleul et lime en Europe, ébène et palissandre en Afrique." },
  { title: 'Art 4', content: "La fresque est une technique de peinture murale exécutée sur un enduit de plâtre frais. Les pigments, mélangés à l'eau, pénètrent dans l'enduit et s'y fixent chimiquement en séchant, rendant l'œuvre très durable. La chapelle Sixtine de Michel-Ange est l'exemple le plus célèbre de cette technique." },
]);

/* ── Documents Q23-32 ── */
const DOC_OFFRE_EMPLOI_IT =
`OFFRE D'EMPLOI — DÉVELOPPEUR WEB FULLSTACK (H/F)

Entreprise spécialisée en solutions e-commerce recrute pour son équipe technique.

MISSIONS : Développement et maintenance d'applications web (React, Node.js), participation à la conception technique des nouveaux projets, collaboration avec les équipes design et produit, revue de code et mentorat des développeurs juniors.

PROFIL REQUIS : Diplôme en informatique (Bac+3 minimum). 3 ans d'expérience en développement web fullstack. Maîtrise de JavaScript/TypeScript, React, Node.js, bases de données SQL et NoSQL. Anglais professionnel requis.

CONDITIONS : CDI, poste basé à Lyon (télétravail 3 jours/semaine possible). Rémunération : 38 000 à 46 000 €/an selon expérience. Tickets restaurant, mutuelle, participation aux bénéfices.`;

const DOC_BAIL_APPARTEMENT =
`CONTRAT DE BAIL D'HABITATION — EXTRAIT

BAILLEUR : SCI DUPONT IMMOBILIER
LOCATAIRE : Mme FADIGA Aminata
BIEN LOUÉ : Appartement T2, 48 m², 3e étage, 15 rue des Acacias, 69003 Lyon

DURÉE : 3 ans à compter du 1er octobre 2025 (renouvelable tacitement)
LOYER MENSUEL : 750 € charges comprises (charges forfaitaires : 80 €)
DÉPÔT DE GARANTIE : 1 340 € (deux mois de loyer hors charges)

CONDITIONS PARTICULIÈRES :
- Animaux domestiques autorisés sous réserve d'assurance spécifique
- Travaux de personnalisation interdits sans accord écrit préalable du bailleur
- Sous-location interdite
- Révision annuelle du loyer selon l'Indice de Référence des Loyers (IRL)`;

const DOC_CATALOGUE_CINEMA =
`PROGRAMME — CINÉMA LE LUMIÈRE — SEMAINE DU 3 AU 9 NOVEMBRE

FILM 1 : « Les Chemins du Silence » — Drame français, 1h52, V.O. sous-titrée
Séances : lun-mer-ven à 14h00 et 20h30 | Prix plein : 9,50 € | Tarif réduit : 7,50 €
⚠ Interdit aux moins de 12 ans

FILM 2 : « À travers les étoiles » — Science-fiction américaine, 2h18, V.F.
Séances : tous les jours à 11h00, 16h30 et 21h00 | Tarif unique : 9,50 €

FILM 3 : « Le Festin de mai » — Comédie italienne, 1h38, V.O. sous-titrée
Séances : jeu-sam-dim à 18h00 | Tarif réduit jeune (-26 ans) : 6,50 €
Carte illimitée acceptée

RÉSERVATION : Sur notre site ou au 04 72 XX XX XX (9h-19h du lundi au samedi)`;

const DOC_CHARTE_RESTAURANT =
`RÈGLEMENT INTÉRIEUR — RESTAURANT UNIVERSITAIRE CAMPUS NORD

1. CONDITIONS D'ACCÈS : Le restaurant est réservé aux étudiants, enseignants et personnels administratifs titulaires d'une carte universitaire valide. L'accès est limité aux heures de service (11h45-14h00 et 18h30-20h00).

2. TARIFICATION : Le repas complet (entrée + plat + dessert + boisson) est facturé 3,30 € pour les étudiants boursiers et 5,10 € pour les autres usagers sur présentation de la carte universitaire.

3. RÈGLES D'HYGIÈNE : Les plateaux et couverts doivent être déposés aux emplacements prévus après le repas. Il est interdit de sortir des aliments ou boissons de la salle.

4. RÉSERVATION : Aucune réservation de table n'est possible. Les places sont attribuées selon l'ordre d'arrivée. Les groupes de plus de 8 personnes sont invités à se présenter en dehors des heures de pointe (12h00-13h30).`;

const DOC_NOTE_INTERNE =
`NOTE DE SERVICE — DIRECTION DES RESSOURCES HUMAINES

À : Ensemble du personnel
De : Direction des Ressources Humaines
Date : 15 octobre 2025
Objet : Mise à jour du système de gestion des congés

À compter du 1er novembre 2025, la procédure de déclaration et de validation des congés payés évoluera.

NOUVEAU PROCESSUS :
- Toutes les demandes de congé doivent être soumises via l'application RH en ligne (accessible sur l'intranet) au moins 15 jours ouvrables avant la date de départ souhaitée.
- Les formulaires papier ne seront plus acceptés.
- Les validations se feront exclusivement par voie électronique (notification par e-mail).

Les responsables d'équipe disposent de 5 jours ouvrables pour répondre à chaque demande. En l'absence de réponse dans ce délai, la demande sera automatiquement considérée comme approuvée.

Une formation en ligne de 30 minutes est disponible sur l'intranet pour prendre en main le nouveau système.`;

/* ── Articles de presse Q33-40 ── */
const ART_IA_CREATIVE =
`L'INTELLIGENCE ARTIFICIELLE CRÉATIVE : MENACE OU OPPORTUNITÉ POUR LES ARTISTES ?

L'essor des outils d'intelligence artificielle générative — capables de produire en quelques secondes des images, des textes ou des musiques sur simple description textuelle — bouscule profondément les secteurs créatifs. Des plateformes comme Midjourney, DALL·E ou Stable Diffusion permettent à n'importe quel utilisateur de générer des œuvres visuelles d'une qualité époustouflante, sans aucune formation artistique.

Pour de nombreux artistes professionnels, illustrateurs, compositeurs et auteurs, cette révolution est vécue comme une menace existentielle. Ces outils ont été entraînés sur des millions d'œuvres humaines sans consentement ni rémunération des créateurs originaux, soulevant des questions juridiques et éthiques fondamentales sur la propriété intellectuelle à l'ère numérique.

Les défenseurs de l'IA créative avancent au contraire qu'il s'agit d'un nouveau médium, comparable à l'apparition de la photographie au XIXe siècle. Loin de tuer la peinture, la photographie a libéré les peintres du réalisme descriptif pour les pousser vers l'impressionnisme et l'abstraction. De même, l'IA pourrait libérer les créateurs des tâches répétitives pour se concentrer sur la vision artistique.

La réalité est probablement plus nuancée : certains métiers (illustration commerciale, production musicale de masse, rédaction de contenus standardisés) seront profondément transformés, tandis que la création originale, ancrée dans une expérience humaine authentique, conservera une valeur irremplaçable.`;

const ART_MOBILITE_URBAINE =
`MOBILITÉ URBAINE : LA RÉVOLUTION DES TRANSPORTS DOUX S'ACCÉLÈRE

Les grandes métropoles mondiales repensent en profondeur leur organisation des déplacements, sous la double pression des objectifs climatiques et de la congestion chronique. Après des décennies de domination de l'automobile, le paradigme de la mobilité urbaine bascule progressivement vers des solutions alternatives : vélos, trottinettes, transports en commun renforcés et zones piétonnes étendues.

Paris constitue un exemple emblématique de cette transition. En quinze ans, le réseau cyclable a été multiplié par cinq, le nombre de voies réservées aux bus et taxis considérablement étendu, et plusieurs axes historiquement dédiés aux voitures — les berges de la Seine, la rue de Rivoli — ont été reconvertis en espaces piétons ou cyclables. Le résultat est saisissant : la part modale du vélo a triplé, mais les embouteillages automobiles n'ont pas diminué dans les mêmes proportions, révélant la difficulté du transfert modal.

Car le défi est moins technique que comportemental et social. La voiture individuelle reste associée, dans l'imaginaire collectif, à la liberté, au statut social et à la praticité, particulièrement pour les déplacements périurbains ou les familles avec enfants. Les ménages modestes habitant en banlieue dépendent souvent de l'automobile faute d'alternative viable.

Les solutions émergentes — covoiturage dynamique, vélos cargo, navettes autonomes, offres multimodales intégrées — pourraient combler ces lacunes. Mais leur déploiement à grande échelle nécessite des investissements publics considérables et une coordination entre collectivités qui reste difficile à organiser.`;

const ART_GASTRONOMIE_MONDIALE =
`LA GASTRONOMIE MONDIALE : ENTRE MONDIALISATION ET RETOUR AUX ORIGINES

La cuisine est à la fois l'un des marqueurs culturels les plus profonds et l'un des champs les plus dynamiques de la mondialisation. Alors que les grandes chaînes de restauration rapide ont imposé leurs standards gustatifs aux quatre coins de la planète, on observe paradoxalement un puissant mouvement de revalorisation des cuisines locales, traditionnelles et terroir.

Ce mouvement de valorisation a été institutionnalisé par l'inscription de plusieurs pratiques gastronomiques au Patrimoine Culturel Immatériel de l'UNESCO. La diète méditerranéenne, le repas gastronomique français, la cuisine mexicaine traditionnelle ou le pain azerbaïdjanais lavash font désormais partie du patrimoine culturel immatériel de l'humanité. Cette reconnaissance reflète la prise de conscience que les savoir-faire culinaires, porteurs d'histoire et d'identité, méritent d'être préservés.

Le paradoxe de la gastronomie contemporaine est que les chefs les plus innovants et les plus célébrés mondialement — ceux dont les restaurants occupent les premières places des classements internationaux — sont précisément ceux qui plongent le plus profondément dans leurs racines culinaires locales. Le Danois René Redzepi, le Péruvien Gastón Acurio ou le Japonais Yoshihiro Narisawa ont construit leur réputation mondiale sur une cuisine profondément enracinée dans leur territoire.

La gastronomie devient ainsi un vecteur de soft power pour les nations. La diplomatie culinaire, ou gastrodiplomatie, est aujourd'hui une stratégie assumée par des pays comme la Thaïlande, la Corée du Sud ou le Pérou pour promouvoir leur image et attirer les touristes.`;

const ART_EDUCATION_NUMERIQUE =
`L'ÉCOLE À L'HEURE DU NUMÉRIQUE : ENTRE PROMESSES ET DÉSILLUSIONS

L'intégration du numérique dans l'éducation fait l'objet d'un débat vif et contrasté. D'un côté, ses partisans vantent la personnalisation de l'apprentissage, l'accès équitable aux ressources pédagogiques pour les zones rurales, la motivation accrue des élèves et la préparation à un marché du travail désormais entièrement numérisé. De l'autre, des études scientifiques récentes tempèrent cet enthousiasme.

Une méta-analyse portant sur des dizaines de pays et des millions d'élèves, publiée en 2023, a montré que la distribution de tablettes ou d'ordinateurs en classe n'améliore pas les résultats scolaires en lecture et en mathématiques, et peut même les dégrader dans certains contextes. La corrélation entre taux d'équipement numérique et performances aux tests PISA est négative dans plusieurs pays développés.

Les spécialistes de l'éducation nuancent ces résultats : c'est moins l'outil que son usage pédagogique qui détermine l'efficacité. Un enseignant formé à exploiter le numérique de façon active et critique — pour analyser, créer et collaborer — obtient de bien meilleurs résultats qu'un simple passage du manuel papier à la tablette.

La question de la distraction numérique en classe est désormais prise au sérieux. Plusieurs pays scandinaves, longtemps fer de lance de l'école numérique, font marche arrière et réintroduisent les cahiers et manuels papier, notamment pour l'apprentissage de l'écriture et de la lecture.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_1 =
`La gastronomie française est reconnue dans le monde entier pour [14] de ses techniques culinaires et la qualité de ses ingrédients. Les chefs français ont [15] une cuisine raffinée qui allie tradition et créativité. Chaque région possède ses spécialités propres, des fruits de mer bretons aux fromages normands, en passant par les vins de Bordeaux et les truffes du Périgord. Cette diversité culinaire constitue un véritable [16] culturel que les Français sont fiers de partager avec le monde entier.`;

const TEXTE_LACUNAIRE_2 =
`Les réseaux sociaux ont profondément [17] notre façon de communiquer et de nous informer. Chaque jour, des milliards de personnes partagent photos, vidéos et opinions sur des plateformes numériques. Si ces outils favorisent les échanges et le lien social, ils soulèvent également des questions sur la protection de la vie privée et la [17b] des informations qui y circulent. Les gouvernements cherchent à encadrer ces plateformes tout en préservant la liberté d'expression.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 : Documents de la vie quotidienne ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `PROGRAMME DE CONCERTS — FESTIVAL MUSIQUE EN FÊTE

VENDREDI 14 NOVEMBRE — 20h00
ORCHESTRE PHILHARMONIQUE DE LYON
Œuvres de Beethoven et Debussy
Salle principale (2 000 places) — Tarif : 25 à 75 €

SAMEDI 15 NOVEMBRE — 18h00
TRIO JAZZ MANOUCHE — scène libre, entrée gratuite
Suivi à 21h00 : CONCERT ELECTRO « NOVA » — Tarif : 15 €

DIMANCHE 16 NOVEMBRE — 15h00
RÉCITAL DE PIANO — Mélanie FONTAN, lauréate du Concours Ravel
Salle de chambre (350 places) — Tarif : 12 €

Billetterie en ligne : www.festivalmusique.fr — Téléphone : 04 XX XX XX XX`,
    question: 'Ce document est un…',
    optionA: 'Menu de restaurant',
    optionB: 'Programme de festival musical',
    optionC: 'Catalogue de vente de disques',
    optionD: 'Règlement intérieur d\'une salle de spectacle',
    correctAnswer: 'B',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `MENU DU JOUR — BRASSERIE DU MARCHÉ

ENTRÉES (au choix)
• Soupe de potiron au lait de coco
• Salade niçoise (thon, olives, anchois, œuf dur)
• Velouté de champignons à la crème fraîche

PLATS (au choix)
• Filet de saumon grillé, riz basmati et légumes de saison
• Poulet rôti, pommes de terre sarladaises
• Risotto aux champignons et parmesan (végétarien)

DESSERTS (au choix)
• Tarte Tatin maison
• Mousse au chocolat noir
• Assortiment de fromages affinés

Formule entrée + plat : 16 € | Formule plat + dessert : 16 € | Menu complet : 22 €
Boissons non comprises. Service de 12h à 14h30.`,
    question: 'Ce document est un…',
    optionA: 'Programme de festival gastronomique',
    optionB: 'Règlement d\'un restaurant universitaire',
    optionC: 'Menu du jour d\'une brasserie',
    optionD: 'Guide des restaurants de la ville',
    correctAnswer: 'C',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `BULLETIN MÉTÉO — RÉGION RHÔNE-ALPES
Mercredi 12 novembre

MATIN : Brouillard givrant persistant en plaine jusqu\'à 10h00. Températures négatives : -2°C à Lyon, -5°C à Grenoble. Prudence sur les routes (verglas possible).

APRÈS-MIDI : Dégagement progressif de l\'ouest. Soleil en montagne au-dessus de 800 m. Températures remontant à 6°C en plaine.

SOIRÉE ET NUIT : Retour des nuages. Risque de gelée nocturne sur les hauteurs.

PRÉVISIONS WEEKEND : Perturbation atlantique attendue samedi soir. Pluie en plaine, neige dès 600 m dimanche.

VIGILANCE : Département 73 en vigilance orange « verglas » jusqu\'à 11h00.`,
    question: 'Ce document est un…',
    optionA: 'Bulletin météorologique régional',
    optionB: 'Guide touristique de la région',
    optionC: 'Article de presse sur le changement climatique',
    optionD: 'Rapport annuel sur les catastrophes naturelles',
    correctAnswer: 'A',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `MODE D\'EMPLOI — CAFETIÈRE À CAPSULES EXPRESSA 500

AVANT LA PREMIÈRE UTILISATION
1. Retirez tous les emballages et autocollants de protection.
2. Remplissez le réservoir d\'eau (capacité max : 1,2 L) uniquement avec de l\'eau froide du robinet ou filtrée.
3. Branchez l\'appareil et appuyez sur le bouton de mise en chauffe (voyant orange).
4. Attendez que le voyant devienne vert (2 min environ) avant la première utilisation.

PRÉPARATION D\'UN CAFÉ
1. Placez une tasse sous le bec verseur.
2. Insérez une capsule compatible dans le logement prévu.
3. Fermez le couvercle jusqu\'au déclic.
4. Sélectionnez la taille de boisson (Espresso 40 ml ou Long 110 ml).

⚠ Ne jamais utiliser de capsules endommagées ou gonflées.
⚠ Détartrage obligatoire tous les 3 mois (voyant rouge clignotant).`,
    question: 'Ce document est un…',
    optionA: 'Catalogue de vente d\'appareils électroménagers',
    optionB: 'Mode d\'emploi d\'une cafetière',
    optionC: 'Règlement de sécurité électrique',
    optionD: 'Recette pour préparer un café',
    correctAnswer: 'B',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `INVITATION — ASSOCIATION DES ANCIENS ÉLÈVES DU LYCÉE MICHELET

Monsieur, Madame,

L\'Association des Anciens Élèves du Lycée Michelet a le plaisir de vous inviter à sa

SOIRÉE DE RETROUVAILLES ANNUELLE
Samedi 22 novembre 2025 à partir de 19h30
Salle des Fêtes de la Mairie du 8e arrondissement
58, avenue Mermoz — Lyon 8e

Au programme : cocktail dînatoire, remise des prix d\'excellence aux lauréats du baccalauréat 2025, témoignages de diplômés et musique live.

Tenue correcte exigée.
RSVP avant le 10 novembre : anciensmichelet@gmail.com ou 06 XX XX XX XX
Participation aux frais : 25 € par personne (chèque à l\'ordre de l\'Association)`,
    question: 'Ce document est…',
    optionA: 'Un règlement intérieur d\'association',
    optionB: 'Un communiqué de presse',
    optionC: 'Une invitation à une soirée de retrouvailles',
    optionD: 'Un programme de spectacle scolaire',
    correctAnswer: 'C',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `ORDONNANCE MÉDICALE

Dr. Sophie MARCHAND — Médecin Généraliste
Cabinet médical du Parc — 12 rue des Tilleuls, 69006 Lyon
Tél : 04 78 XX XX XX — RPPS : 10XXXXXXXXX

Patient : M. KONÉ Ibrahima, né le 12/04/1988
Date : 8 novembre 2025

Médicaments prescrits :
1. AMOXICILLINE 1g — 1 comprimé matin et soir pendant 7 jours
   (À prendre au cours des repas)
2. IBUPROFÈNE 400mg — 1 comprimé toutes les 8h si douleurs
   (Ne pas dépasser 3 comprimés par jour — À éviter à jeun)

⚠ Allergie déclarée : pénicilline → INFORMATION PHARMACIEN

Ordonnance valable 3 mois. Non renouvelable.`,
    question: 'Ce document est…',
    optionA: 'Une fiche médicale de consultation',
    optionB: 'Une ordonnance médicale',
    optionC: 'Une notice de médicament',
    optionD: 'Un bon de prise en charge de mutuelle',
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `PETITE ANNONCE — LOCATION DE VACANCES

Bel appartement T3 (65 m²) — CALANQUES DE MARSEILLE
Disponible : juillet et août 2026

DESCRIPTION : Appartement entièrement rénové, situé à 200 m de la plage. Séjour avec canapé-lit (2 personnes), 2 chambres (1 lit double + 2 lits simples). Cuisine équipée (lave-vaisselle, micro-ondes, cafetière). Salle de bain + WC séparés.

ÉQUIPEMENTS : Climatisation réversible, TV 55\', Wifi fibre, terrasse privée (20 m²) avec vue mer, place de parking couverte.

CAPACITÉ : 4 à 6 personnes
TARIF : 850 €/semaine en juillet | 1 100 €/semaine en août
Caution : 600 € — Ménage de fin de séjour inclus

Contact : vacances.calanques@gmail.com — WhatsApp : 06 XX XX XX XX`,
    question: 'Ce document est…',
    optionA: 'Un guide touristique sur Marseille',
    optionB: 'Une annonce de vente immobilière',
    optionC: 'Une petite annonce de location de vacances',
    optionD: 'Un contrat de bail saisonnier',
    correctAnswer: 'C',
  }));

  // ── Q8-13 : Phrases lacunaires ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le chef étoilé a ___ une nouvelle recette à base de truffes noires pour son menu de Noël.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'composé',
    optionB: 'composée',
    optionC: 'composer',
    optionD: 'composant',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les spectateurs ont accueilli la pièce de théâtre avec un ___ d\'applaudissements prolongés.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'tonnerre',
    optionB: 'bruit',
    optionC: 'son',
    optionD: 'écho',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La municipalité a décidé de ___ la ligne de tramway jusqu\'au nouveau quartier résidentiel.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'prolonger',
    optionB: 'allonger',
    optionC: 'étendre',
    optionD: 'agrandir',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Pour réussir cette recette, il est ___ de respecter scrupuleusement les temps de cuisson indiqués.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'indispensable',
    optionB: 'utile',
    optionC: 'possible',
    optionD: 'agréable',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le film a remporté la Palme d\'Or malgré les ___ de certains critiques qui le trouvaient trop long.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'réserves',
    optionB: 'applaudissements',
    optionC: 'louanges',
    optionD: 'descriptions',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La nouvelle application de transport permet de ___ un taxi ou un VTC en moins de deux minutes.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'commander',
    optionB: 'conduire',
    optionC: 'louer',
    optionD: 'guider',
    correctAnswer: 'A',
  }));

  // ── Q14-17 : Textes lacunaires ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Gastronomie française',
    longText: TEXTE_LACUNAIRE_1,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'la renommée',
    optionB: 'la simplicité',
    optionC: 'l\'absence',
    optionD: 'la rareté',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Gastronomie française',
    longText: TEXTE_LACUNAIRE_1,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'développé',
    optionB: 'détruit',
    optionC: 'ignoré',
    optionD: 'importé',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Gastronomie française',
    longText: TEXTE_LACUNAIRE_1,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'patrimoine',
    optionB: 'problème',
    optionC: 'obstacle',
    optionD: 'défaut',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Réseaux sociaux',
    longText: TEXTE_LACUNAIRE_2,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'transformé',
    optionB: 'construit',
    optionC: 'oublié',
    optionD: 'simplifié',
    correctAnswer: 'A',
  }));

  // ── Q18-21 : Lecture rapide ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quel genre musical est né en Jamaïque dans les années 1960 ?',
    optionA: 'Genre 1',
    optionB: 'Genre 2',
    optionC: 'Genre 3',
    optionD: 'Genre 4',
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quelle ville est décrite comme un hub diplomatique de l\'Afrique de l\'Est ?',
    optionA: 'Ville 1',
    optionB: 'Ville 2',
    optionC: 'Ville 3',
    optionD: 'Ville 4',
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quel sport est pratiqué sur glace avec des pierres de granit ?',
    optionA: 'Sport 1',
    optionB: 'Sport 2',
    optionC: 'Sport 3',
    optionD: 'Sport 4',
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quelle technique picturale utilise des pigments dans une huile siccative ?',
    optionA: 'Art 1',
    optionB: 'Art 2',
    optionC: 'Art 3',
    optionD: 'Art 4',
    correctAnswer: 'A',
  }));

  // ── Q22 : Graphique ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « La fréquentation est maximale en juillet-août et présente un creux marqué en janvier » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'C',
  }));

  // ── Q23-32 : Documents administratifs/professionnels ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Offre d\'emploi — Développeur web fullstack',
    longText: DOC_OFFRE_EMPLOI_IT,
    question: 'Ce poste est proposé dans quel secteur ?',
    optionA: 'Le secteur de la santé numérique',
    optionB: 'Le secteur du e-commerce et des solutions informatiques',
    optionC: 'Le secteur bancaire et financier',
    optionD: 'Le secteur de l\'enseignement supérieur',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Offre d\'emploi — Développeur web fullstack',
    longText: DOC_OFFRE_EMPLOI_IT,
    question: 'Parmi les avantages proposés, on trouve…',
    optionA: 'Un logement de fonction',
    optionB: 'Une voiture de société',
    optionC: 'Des tickets restaurant et une participation aux bénéfices',
    optionD: 'Un abonnement téléphonique professionnel',
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Contrat de bail d\'habitation',
    longText: DOC_BAIL_APPARTEMENT,
    question: 'Ce document est…',
    optionA: 'Un contrat de vente immobilière',
    optionB: 'Un extrait de contrat de bail d\'habitation',
    optionC: 'Un règlement de copropriété',
    optionD: 'Un état des lieux d\'entrée',
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Contrat de bail d\'habitation',
    longText: DOC_BAIL_APPARTEMENT,
    question: 'Selon ce contrat, quelle activité est interdite au locataire ?',
    optionA: 'Avoir des animaux domestiques',
    optionB: 'Sous-louer l\'appartement',
    optionC: 'Décorer l\'appartement',
    optionD: 'Faire des travaux avec autorisation',
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Programme de cinéma — Le Lumière',
    longText: DOC_CATALOGUE_CINEMA,
    question: 'Ce document présente principalement…',
    optionA: 'Les horaires d\'un cinéma pour une semaine',
    optionB: 'La critique de nouveaux films',
    optionC: 'Le catalogue d\'un distributeur de films',
    optionD: 'La réglementation des salles de cinéma',
    correctAnswer: 'A',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Programme de cinéma — Le Lumière',
    longText: DOC_CATALOGUE_CINEMA,
    question: 'Quel film est accessible tous les jours à plusieurs horaires ?',
    optionA: '« Les Chemins du Silence »',
    optionB: '« À travers les étoiles »',
    optionC: '« Le Festin de mai »',
    optionD: 'Aucun des trois films',
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Règlement — Restaurant universitaire Campus Nord',
    longText: DOC_CHARTE_RESTAURANT,
    question: 'Selon ce règlement, qui peut accéder au restaurant universitaire ?',
    optionA: 'Toute personne souhaitant y déjeuner',
    optionB: 'Les étudiants, enseignants et personnels administratifs avec une carte universitaire',
    optionC: 'Les étudiants boursiers uniquement',
    optionD: 'Les résidents du campus uniquement',
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Règlement — Restaurant universitaire Campus Nord',
    longText: DOC_CHARTE_RESTAURANT,
    question: 'Selon ce règlement, les groupes de plus de 8 personnes sont invités à…',
    optionA: 'Réserver une table à l\'avance',
    optionB: 'Venir en dehors des heures de pointe',
    optionC: 'Payer un supplément de groupe',
    optionD: 'Présenter une autorisation du directeur',
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Note de service — Gestion des congés',
    longText: DOC_NOTE_INTERNE,
    question: 'Selon cette note, à partir de quand le nouveau système entrera-t-il en vigueur ?',
    optionA: 'Au 1er octobre 2025',
    optionB: 'Au 1er novembre 2025',
    optionC: 'Au 1er décembre 2025',
    optionD: 'Immédiatement après la note',
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Note de service — Gestion des congés',
    longText: DOC_NOTE_INTERNE,
    question: 'Selon cette note, que se passe-t-il si un responsable ne répond pas dans le délai imparti ?',
    optionA: 'La demande est automatiquement refusée',
    optionB: 'La demande est transmise à la direction',
    optionC: 'La demande est automatiquement approuvée',
    optionD: 'Le salarié doit relancer manuellement',
    correctAnswer: 'C',
  }));

  // ── Q33-40 : Articles de presse ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — L\'IA créative : menace ou opportunité ?',
    longText: ART_IA_CREATIVE,
    question: 'Selon cet article, pourquoi certains artistes vivent-ils l\'IA créative comme une menace ?',
    optionA: 'Parce qu\'elle produit des œuvres de mauvaise qualité',
    optionB: 'Parce que leurs œuvres ont servi à entraîner ces outils sans consentement ni rémunération',
    optionC: 'Parce que les outils d\'IA sont trop coûteux',
    optionD: 'Parce que l\'IA ne peut pas reproduire les styles artistiques',
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — L\'IA créative : menace ou opportunité ?',
    longText: ART_IA_CREATIVE,
    question: 'L\'auteur compare l\'apparition de l\'IA créative à celle de la photographie pour illustrer…',
    optionA: 'L\'idée que toute technologie détruit les métiers artistiques',
    optionB: 'L\'idée qu\'une nouvelle technologie peut libérer les créateurs plutôt que les remplacer',
    optionC: 'Le fait que l\'IA produit des images aussi réalistes que la photographie',
    optionD: 'Le fait que la peinture a disparu avec la photographie',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — Mobilité urbaine et transports doux',
    longText: ART_MOBILITE_URBAINE,
    question: 'Selon cet article, quelle est la principale difficulté du transfert modal à Paris ?',
    optionA: 'Le manque de pistes cyclables',
    optionB: 'Le coût trop élevé des transports en commun',
    optionC: 'La résistance comportementale et sociale à abandonner la voiture',
    optionD: 'L\'absence de volonté politique de la municipalité',
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — Mobilité urbaine et transports doux',
    longText: ART_MOBILITE_URBAINE,
    question: 'D\'après l\'article, quelles populations sont particulièrement dépendantes de la voiture ?',
    optionA: 'Les touristes et visiteurs des centres-villes',
    optionB: 'Les ménages modestes habitant en banlieue',
    optionC: 'Les chefs d\'entreprise et cadres supérieurs',
    optionD: 'Les étudiants et jeunes actifs',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — Gastronomie mondiale entre mondialisation et terroir',
    longText: ART_GASTRONOMIE_MONDIALE,
    question: 'Selon cet article, qu\'ont en commun les chefs les plus célébrés mondialement ?',
    optionA: 'Ils utilisent uniquement des ingrédients importés',
    optionB: 'Ils ont construit leur réputation sur une cuisine enracinée dans leur territoire local',
    optionC: 'Ils travaillent exclusivement dans des restaurants de grandes chaînes internationales',
    optionD: 'Ils rejettent toute forme de cuisine traditionnelle',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — Gastronomie mondiale entre mondialisation et terroir',
    longText: ART_GASTRONOMIE_MONDIALE,
    question: 'L\'auteur explique que certains pays utilisent leur gastronomie comme…',
    optionA: 'Un outil de diplomatie et de promotion internationale (gastrodiplomatie)',
    optionB: 'Un moyen d\'exporter leurs produits agricoles',
    optionC: 'Une façon d\'attirer des investissements étrangers',
    optionD: 'Un outil pour lutter contre la malnutrition mondiale',
    correctAnswer: 'A',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — L\'école à l\'heure du numérique',
    longText: ART_EDUCATION_NUMERIQUE,
    question: 'Selon la méta-analyse citée dans cet article, la distribution de tablettes en classe…',
    optionA: 'Améliore significativement les résultats en lecture',
    optionB: 'N\'améliore pas, voire peut dégrader, les résultats scolaires',
    optionC: 'Motive davantage les élèves en difficulté',
    optionD: 'Réduit les inégalités entre élèves riches et pauvres',
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — L\'école à l\'heure du numérique',
    longText: ART_EDUCATION_NUMERIQUE,
    question: 'L\'article mentionne comme tendance récente dans les pays scandinaves…',
    optionA: 'L\'équipement massif en tablettes de toutes les écoles primaires',
    optionB: 'Le retour aux cahiers et manuels papier dans certains établissements',
    optionC: 'L\'interdiction totale des smartphones en classe',
    optionD: 'La formation obligatoire des enseignants au codage',
    correctAnswer: 'B',
  }));

  return qs;
}

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
    console.log('📝 Insertion de 40 questions…');
    const questions = buildQuestions();
    for (const data of questions) {
      await prisma.question.create({ data });
      console.log(`   ✓ Q${data.questionOrder} insérée`);
    }
    console.log(`\n✅ 40 questions créées pour CE 20.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
