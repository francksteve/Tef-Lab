'use strict';
/**
 * seed-ce-serie51.js
 * Peuple la série CE 51 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie51.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyon6w001b0wxlrgvcivi0';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 bar-charts médailles aux Jeux Olympiques ── */
function generateQ22SVG() {
  const medals = ['Or','Arg','Bro'];
  const graphs = [
    { label: 'Graphique 1', data: [25, 25, 25], color: '#E30613' },
    { label: 'Graphique 2', data: [10, 20, 40], color: '#E30613' },
    { label: 'Graphique 3', data: [38, 28, 18], color: '#003087' }, // CORRECT : décroissant or > arg > bro
    { label: 'Graphique 4', data: [15, 30, 20], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 50;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 70;

    const gridLines = [0, 10, 20, 30, 40, 50].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 5}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const bars = g.data.map((v, i) => {
      const bx = (plotX + i * 103 + 5).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (plotX + i * 103 + 5 + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" opacity="0.8"/>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280">${medals[i]}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.color}">— Nombre de médailles</text>`;
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
  { title: 'Sport 1', content: "Le basketball est un sport collectif opposant deux équipes de 5 joueurs sur un terrain rectangulaire. Le but est de lancer le ballon dans le panier adverse (hoop). Inventé en 1891 par James Naismith, il est aujourd'hui l'un des sports les plus populaires au monde, notamment via la NBA américaine." },
  { title: 'Sport 2', content: "Le rugby à XV oppose deux équipes de 15 joueurs. L'objectif est de porter ou faire rebondir l'ovale derrière la ligne d'en-but adverse (essai) ou de le faire passer entre les poteaux. Le contact physique est central : placages et mêlées caractérisent ce sport né en Angleterre au XIXe siècle." },
  { title: 'Sport 3', content: "L'athlétisme regroupe les disciplines sportives de course (vitesse, fond, haies, relais), de saut (hauteur, longueur, perche, triple saut) et de lancer (disque, javelot, marteau, poids). C'est la discipline olympique historique par excellence, présente depuis les premiers Jeux de l'Antiquité." },
  { title: 'Sport 4', content: "Le handball est un sport collectif à 7 joueurs (dont un gardien de but) qui consiste à lancer un ballon dans le but adverse. Pratiqué en salle sur un terrain de 40 × 20 m, il est particulièrement populaire en Europe centrale et dans les pays scandinaves. La France est championne du monde à plusieurs reprises." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Économie 1', content: "Le PIB (Produit Intérieur Brut) mesure la valeur totale des biens et services produits dans un pays sur une période donnée (généralement un an). C'est l'indicateur économique le plus utilisé pour comparer la taille des économies mondiales et évaluer leur croissance." },
  { title: 'Économie 2', content: "L'inflation désigne la hausse générale et durable du niveau des prix dans une économie. Elle se mesure par l'Indice des Prix à la Consommation (IPC). Une inflation modérée (2 %) est considérée comme saine par les banques centrales. Une inflation trop forte érode le pouvoir d'achat des ménages." },
  { title: 'Économie 3', content: "Le taux de chômage représente la proportion d'actifs (personnes en âge de travailler et cherchant un emploi) qui n'ont pas d'emploi. Il est calculé par les instituts statistiques nationaux selon des critères définis par le Bureau International du Travail (BIT)." },
  { title: 'Économie 4', content: "La balance commerciale est la différence entre la valeur des exportations et des importations d'un pays. Quand les exportations dépassent les importations, la balance est excédentaire ; dans le cas inverse, elle est déficitaire. La France présente généralement un déficit de sa balance commerciale en biens." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Histoire 1', content: "La Révolution française débute en 1789 avec la prise de la Bastille le 14 juillet. Elle met fin à l'Ancien Régime (monarchie absolue) et établit les principes de liberté, d'égalité et de fraternité. Elle aboutit après une période tumultueuse (Terreur, Directoire) à l'avènement de Napoléon Bonaparte au pouvoir en 1799." },
  { title: 'Histoire 2', content: "La Première Guerre mondiale (1914-1918) oppose les Alliés (France, Royaume-Uni, Russie, États-Unis) aux Empires centraux (Allemagne, Autriche-Hongrie). Déclenchée par l'assassinat de l'archiduc François-Ferdinand à Sarajevo, elle fait plus de 17 millions de morts et se termine par le Traité de Versailles." },
  { title: 'Histoire 3', content: "La colonisation africaine atteint son apogée à la fin du XIXe siècle avec la Conférence de Berlin (1884-1885), qui partage le continent africain entre les puissances européennes sans consultation des populations. Ce processus d'occupation, d'exploitation et de domination culturelle laissera des traces profondes qui se font encore sentir aujourd'hui." },
  { title: 'Histoire 4', content: "La chute du mur de Berlin, le 9 novembre 1989, marque la fin de la Guerre Froide et symbolise l'effondrement des régimes communistes d'Europe de l'Est. Elle est suivie de la réunification allemande en 1990 et de la dissolution de l'URSS en 1991, redessinant entièrement la carte politique du monde." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Agriculture 1', content: "L'agriculture biologique exclut l'utilisation de pesticides de synthèse, d'engrais chimiques et d'organismes génétiquement modifiés. Elle repose sur des pratiques respectueuses de l'environnement : rotation des cultures, compostage, lutte biologique contre les parasites. En France, elle représente environ 12 % de la surface agricole utilisée." },
  { title: 'Agriculture 2', content: "L'agroforesterie associe sur une même parcelle des arbres et des cultures agricoles ou de l'élevage. Cette pratique ancestrale réduit l'érosion des sols, améliore la biodiversité, fixe le carbone et crée des microclimates favorables. Elle est de plus en plus promue comme une solution d'adaptation au changement climatique." },
  { title: 'Agriculture 3', content: "L'agriculture de précision utilise des technologies numériques (drones, satellites, capteurs) pour optimiser les interventions (semis, fertilisation, irrigation, traitements) au plus près des besoins réels de chaque parcelle. Elle permet de réduire les intrants, les coûts et l'impact environnemental tout en maintenant les rendements." },
  { title: 'Agriculture 4', content: "La permaculture est une approche de conception de systèmes agricoles et d'habitats humains inspirée des écosystèmes naturels. Elle cherche à créer des systèmes productifs, durables et autonomes en mimant la diversité et les interactions de la nature. Elle valorise les plantes vivaces, les associations bénéfiques et le minimum d'intervention humaine." },
]);

/* ── Documents Q23-32 ── */
const DOC_CONTRAT_SPONSORING =
`CONTRAT DE PARTENARIAT SPORTIF

PARTENAIRE : Société SPORTMAX SA
CLUB BÉNÉFICIAIRE : Association Sportive Olympique de Bordeaux (ASOB) — Section Athlétisme

OBJET : Soutien financier et matériel pour la saison 2025-2026.

ENGAGEMENTS DE SPORTMAX :
- Versement de 15 000 € à la signature du présent contrat
- Fourniture de 200 tenues sportives complètes aux couleurs du club
- Mise à disposition d'un stand d'exposition lors de 3 compétitions à domicile

CONTREPARTIES DE L'ASOB :
- Affichage du logo SPORTMAX sur les tenues officielles et la signalétique du stade
- Présence du responsable SPORTMAX lors des remises de prix
- Diffusion de 5 publications promotionnelles SPORTMAX sur les réseaux sociaux officiels du club

DURÉE : Du 1er septembre 2025 au 31 août 2026 (renouvelable par accord mutuel).`;

const DOC_PROGRAMME_SPORT_ECOLE =
`PROGRAMME SCOLAIRE — SPORT ET CITOYENNETÉ
Collège Pierre de Coubertin — Strasbourg

PRÉSENTATION DU PROGRAMME :
Dans le cadre du dispositif national « Sport à l'École », notre établissement propose aux élèves de 5e et 4e un programme d'activités sportives extrascolaires, axé sur les valeurs olympiques : excellence, respect et amitié.

ACTIVITÉS PROPOSÉES :
- Athlétisme (mardi 16h30-18h00) — ouvert à tous niveaux
- Basketball (jeudi 16h30-18h00) — débutants et confirmés
- Judo (mercredi 14h00-16h00) — uniquement pour les 5e
- Natation (samedi 9h00-11h00) — sur inscription, places limitées

MODALITÉS D'INSCRIPTION :
Formulaire d'inscription disponible auprès de la vie scolaire.
Participation aux frais : 30 € par trimestre (gratuit pour les élèves boursiers).
Assurance sportive individuelle obligatoire.`;

const DOC_LETTRE_REFUS =
`LETTRE DE REFUS D'EMBAUCHE

Madame KOUNDI Esther,
12 avenue des Lilas — 33000 Bordeaux

Bordeaux, le 18 novembre 2025

Madame,

Nous avons bien reçu votre candidature pour le poste de Chargée de Communication que nous avons proposé au sein de notre établissement. Nous vous remercions de l'intérêt que vous portez à notre structure et du temps consacré à l'élaboration de votre dossier.

Après examen attentif de votre candidature et entretien avec notre équipe de direction, nous avons le regret de vous informer que votre profil ne correspond pas au niveau d'expérience que nous recherchons pour ce poste. La personne retenue justifie en effet d'une expérience de 5 ans minimum dans le secteur sportif, critère que votre parcours n'atteint pas encore.

Nous conserverons néanmoins votre dossier dans notre fichier de candidatures pour une durée de 6 mois.

En vous souhaitant bonne chance dans vos recherches, nous vous prions d'agréer, Madame, l'expression de nos salutations distinguées.

Le Directeur des Ressources Humaines
M. LEFRANÇOIS Antoine`;

const DOC_RAPPORT_SPORT =
`RAPPORT ANNUEL — PRATIQUE SPORTIVE EN FRANCE
Ministère des Sports — Édition 2025

CHIFFRES CLÉS :
• 67 % des Français déclarent pratiquer une activité physique ou sportive régulière (au moins une fois par semaine)
• Sports les plus pratiqués : natation (9,7 M), cyclisme (8,8 M), football (6,1 M), randonnée pédestre (6,0 M), fitness/musculation (5,5 M)
• Licenciés dans des fédérations sportives : 18 millions (données 2024)

TENDANCES :
• Forte progression des sports de nature (+23 % en 5 ans)
• Croissance des pratiques libres non fédérées (running, yoga, sports urbains)
• Légère baisse des licenciés dans les sports collectifs traditionnels (-5 %)

PRATIQUE FÉMININE :
Pour la première fois, le taux de pratique sportive régulière des femmes (64 %) se rapproche de celui des hommes (70 %).

ENJEUX : Réduction des inégalités d'accès au sport (géographiques, sociales), augmentation de la pratique chez les seniors et dans les quartiers prioritaires.`;

const DOC_BAIL_COMMERCIAL =
`EXTRAIT DE BAIL COMMERCIAL

BAILLEUR : SCI LES ACACIAS
PRENEUR : SPORT ET FORME SARL (M. ABISSOU Théodore, gérant)
OBJET : Local commercial de 280 m² situé au rez-de-chaussée du 45, rue de la République, 69001 Lyon
DESTINATION : Salle de sport et de fitness exclusivement

DURÉE : 9 ans à compter du 1er janvier 2026 (bail 3-6-9)
LOYER ANNUEL : 42 000 € HT (3 500 €/mois), révisable annuellement selon l'Indice des Loyers Commerciaux (ILC)
CHARGES : Taxe foncière et charges de copropriété à la charge du Preneur

CLAUSE PARTICULIÈRE : Le Preneur s'engage à ne pas modifier la destination des lieux sans accord écrit préalable du Bailleur. Toute sous-location est strictement interdite.

DROIT AU BAIL : Néant (entrée dans les lieux libre).`;

/* ── Articles de presse Q33-40 ── */
const ART_SPORT_SANTE =
`SPORT ET SANTÉ : LES BÉNÉFICES D'UNE ACTIVITÉ PHYSIQUE RÉGULIÈRE

Les données scientifiques sur les bénéfices de l'activité physique pour la santé sont aujourd'hui d'une robustesse remarquable. Trente minutes d'activité physique modérée par jour, cinq fois par semaine, réduisent de 35 % le risque de maladies cardiovasculaires, de 30 à 50 % le risque de diabète de type 2, et de 20 à 30 % le risque de certains cancers (côlon, sein). Ces bénéfices ne dépendent pas du type d'activité mais de son intensité et de sa régularité.

Pourtant, l'inactivité physique est qualifiée par l'Organisation Mondiale de la Santé de « quatrième facteur de risque de mortalité mondiale ». En France, 28 % des adultes ne pratiquent aucune activité physique suffisante, et ce chiffre monte à 45 % chez les personnes de plus de 65 ans. Les jeunes générations, malgré leur accès à davantage d'équipements sportifs, sont aussi touchées par la sédentarité liée aux écrans.

Le « sport sur ordonnance », dispositif permettant aux médecins de prescrire une activité physique adaptée à des patients atteints de maladies chroniques, représente une avancée considérable. En France, ce dispositif est en cours de déploiement mais se heurte à des obstacles pratiques : manque de structures d'accueil, coût pour les patients, et insuffisante formation des médecins.

Au-delà de la santé physique, les bénéfices sur la santé mentale sont tout aussi documentés : l'activité physique régulière réduit les symptômes dépressifs et anxieux, améliore la qualité du sommeil et renforce l'estime de soi. Ces effets passent notamment par la libération d'endorphines et la stimulation de la neurogenèse hippocampique.`;

const ART_ECONOMIE_SPORT =
`L'ÉCONOMIE DU SPORT : UN SECTEUR POIDS LOURD EN PLEINE MUTATION

L'économie mondiale du sport représente aujourd'hui plus de 700 milliards de dollars de revenus annuels, si l'on intègre les droits télévisés, les équipements sportifs, le tourisme sportif, les paris en ligne et les revenus des clubs professionnels. Ce chiffre masque une concentration croissante de la valeur autour de quelques sports rois — football, basketball, sports automobiles — et une concurrence féroce entre territoires pour accueillir les grands événements sportifs.

Les droits télévisés constituent le moteur financier du sport professionnel. En Europe, la Premier League anglaise a généré plus de 3 milliards de livres sterling de droits TV pour la saison 2023-2024. Ces sommes colossales alimentent une inflation des salaires des joueurs (le salaire moyen d'un joueur de Premier League dépasse le million de livres par an) et creusent un fossé financier croissant entre les grandes ligues et le sport amateur.

La question de la durabilité de ce modèle économique se pose. La dépendance au financement télévisé crée une vulnérabilité structurelle : si les audiences baissent ou si les modèles de consommation évoluent vers le streaming non linéaire, tout l'édifice financier du sport professionnel peut vaciller. Les jeunes générations regardent de moins en moins la télévision linéaire, ce qui fragilise les recettes publicitaires.

Les nouvelles sources de revenus — NFT, métavers sportif, paris sportifs légalisés, e-sport — représentent des opportunités mais aussi des risques éthiques et réglementaires. La régulation du secteur sportif face à ces nouveaux enjeux est un défi majeur pour les gouvernements et les fédérations internationales.`;

const ART_JO_PARIS =
`LES JEUX OLYMPIQUES DE PARIS 2024 : BILAN D'UN ÉVÉNEMENT HISTORIQUE

Les Jeux Olympiques de Paris 2024 ont constitué l'un des événements sportifs et médiatiques les plus importants de l'histoire. Avec 10 714 athlètes représentant 206 délégations nationales, 32 sports et 329 épreuves, ils ont tenu toutes leurs promesses sportives. La France a réalisé sa meilleure performance historique avec 16 médailles d'or, se classant 5e au tableau des médailles.

Au-delà des performances sportives, les JO de Paris ont mis en scène une ville et une ambition : celle d'organiser des Jeux durables, ouverts sur la ville et accessibles à un large public. La cérémonie d'ouverture sur la Seine, inédite dans l'histoire olympique, a réuni 6 milliards de téléspectateurs dans le monde et a été saluée comme un chef-d'œuvre de mise en scène.

Sur le plan environnemental, l'organisation a tenu plusieurs engagements : construction de seulement deux nouveaux sites (le Stade Aquatique Saint-Denis et le Village des Athlètes d'Aubervilliers-Saint-Denis), recours à 100 % d'électricité renouvelable, empreinte carbone divisée par deux par rapport aux Jeux de Tokyo.

Sur le plan économique, le bilan est plus nuancé. Si les Jeux ont généré des retombées économiques directes estimées à 11 milliards d'euros pour l'Île-de-France, certains quartiers ont connu une hausse des loyers et une muséification qui interroge sur les bénéfices réels pour les populations locales les moins favorisées.`;

const ART_SPORT_FEMININ =
`LE SPORT FÉMININ : VISIBILITÉ EN HAUSSE, ÉGALITÉ ENCORE LOINTAINE

Le sport féminin a connu une décennie de progression spectaculaire en termes de visibilité médiatique et de pratique. La Coupe du Monde féminine de football 2023 en Australie et Nouvelle-Zélande a attiré 2 milliards de téléspectateurs, record absolu pour un événement sportif féminin. Les audiences des championnats nationaux féminins de football ont été multipliées par cinq en France depuis 2018.

Cette progression de la visibilité ne s'est pas encore traduite par une égalité économique. Les salaires moyens des footballeuses professionnelles restent entre 50 et 100 fois inférieurs à ceux de leurs homologues masculins. Les droits télévisés et les revenus des sponsorings suivent la même disproportion, même si les écarts se réduisent progressivement.

Les investissements dans les structures du sport féminin — clubs, centres de formation, infrastructures — accusent un retard considérable. Pendant des décennies, le sport féminin s'est développé comme une annexe du sport masculin, avec des budgets résiduels et une organisation professionnelle insuffisante.

Le changement de paradigme est néanmoins perceptible. Les grandes marques sportives misent de plus en plus sur les athlètes féminines comme ambassadrices. Des clubs professionnels masculins créent ou soutiennent des sections féminines de haut niveau. Les jeunes filles de la génération Z sont les premières pour lesquelles le sport de haut niveau féminin représente un modèle identificatoire aussi fort que le sport masculin.`;

/* ── Textes lacunaires Q14-17 ── */
const TEXTE_LACUNAIRE_P =
`Le sport de haut niveau exige des athlètes des [14] considérables, tant sur le plan physique que mental. Les champions olympiques s'entraînent pendant de longues années avant d'atteindre leur [15] de forme. La médaille d'or représente pour beaucoup le [16] d'une vie entière de sacrifices et de détermination.`;

const TEXTE_LACUNAIRE_Q =
`L'économie mondiale traverse une période de [17] profonds liés à la numérisation des échanges et à la mondialisation. Ces transformations créent de nouvelles opportunités d'emploi dans les secteurs technologiques, mais [17b] également des emplois traditionnels qui ne résistent pas à la concurrence des algorithmes et de l'automatisation.`;

function buildQuestions() {
  const qs = [];

  // ── Q1-7 ──
  qs.push(q(1, 'Q1-7', null, {
    longText: `PROGRAMME TV — CHAÎNE L'ÉQUIPE
Samedi 15 novembre 2025

06h00 — Magazine « Les Années Tour » (cyclisme, rediffusion)
09h30 — Handball Starligue EN DIRECT : Paris SG vs Montpellier
11h30 — Running — Résultats Marathon de Paris
13h00 — Football D1 féminine EN DIRECT : Lyon vs PSG
15h00 — Documentaire « Muhammad Ali, le plus grand » (60 min)
16h15 — Tennis WTA Finals — Demi-finale EN DIRECT
19h00 — Rugby TOP14 EN DIRECT : Toulouse vs Stade Français
21h30 — Bilan sportif — Plateau live avec les consultants
23h00 — Rediffusion handball`,
    question: 'Ce document est…',
    optionA: 'Une grille de programmes d\'une chaîne sportive pour un samedi',
    optionB: 'Un catalogue de droits télévisés sportifs',
    optionC: 'Un guide touristique des événements sportifs à Paris',
    optionD: 'Une invitation à un gala sportif télévisé',
    correctAnswer: 'A',
  }));

  qs.push(q(2, 'Q1-7', null, {
    longText: `RÈGLEMENT INTÉRIEUR — SALLE DE MUSCULATION OLYMPE FITNESS

ACCÈS ET HORAIRES
La salle est ouverte du lundi au vendredi de 6h30 à 22h00, le samedi de 8h00 à 20h00 et le dimanche de 9h00 à 18h00. L'accès est réservé aux membres munis d'une carte valide.

UTILISATION DES ÉQUIPEMENTS
Les membres doivent essuyer les appareils après utilisation (lingettes fournies). La durée d'utilisation d'un appareil est limitée à 30 minutes en période de forte affluence. Les téléphones en mode haut-parleur sont interdits dans la zone de musculation.

HYGIÈNE
Tenue sportive propre et chaussures de sport obligatoires. Les serviettes personnelles sont fortement recommandées.

SÉCURITÉ
Les membres s'exercent sous leur propre responsabilité. La salle décline toute responsabilité en cas d'accident lié à une mauvaise utilisation des équipements. Tout incident doit être signalé immédiatement au personnel.`,
    question: 'Ce document est…',
    optionA: 'Un contrat d\'abonnement à une salle de sport',
    optionB: 'Le règlement intérieur d\'une salle de musculation',
    optionC: 'Un programme d\'entraînement en salle',
    optionD: 'Une brochure publicitaire d\'une salle de fitness',
    correctAnswer: 'B',
  }));

  qs.push(q(3, 'Q1-7', null, {
    longText: `PETITE ANNONCE — VENTE DE MATÉRIEL SPORTIF

Particulier vend lot de matériel de randonnée, suite au changement de pratique sportive.

CONTENU DU LOT :
• 2 paires de bâtons de randonnée télescopiques LEKI (acier inox) — très bon état
• 1 sac à dos 45 L Osprey Aether — quelques rayures extérieures, intérieur impeccable
• 1 tente 2 places MSR Hubba Hubba — utilisée 5 fois, complète avec sardines et hauban
• 1 réchaud à gaz Coleman — cartouche neuve incluse
• 1 GPS Garmin GPSMAP 64st — toutes cartes France incluses

PRIX : 450 € le lot, non négociable (valeur d'achat > 1 200 €).
Remise en main propre uniquement — Bordeaux (33).
Contact : 06 XX XX XX XX (appels uniquement, pas de SMS)`,
    question: 'Ce document est…',
    optionA: 'Un catalogue de vente de matériel de sport en magasin',
    optionB: 'Une petite annonce de vente de matériel de randonnée entre particuliers',
    optionC: 'Un guide d\'achat de matériel pour randonneurs débutants',
    optionD: 'Une annonce de location de matériel de plein air',
    correctAnswer: 'B',
  }));

  qs.push(q(4, 'Q1-7', null, {
    longText: `BULLETIN D'INFORMATION — MAIRIE DE NANTES
Service des Sports

INSCRIPTIONS OUVERTES — COURS MUNICIPAUX DE SPORT 2025-2026

La Ville de Nantes propose une large gamme de cours sportifs dans ses équipements municipaux à des tarifs accessibles à tous, selon le quotient familial.

SPORTS DISPONIBLES :
Natation, tennis, judo, danse (classique, contemporaine, hip-hop), gymnastique, arts martiaux, yoga, pilates, basketball.

CONDITIONS D'INSCRIPTION :
• Résider sur la commune de Nantes
• Fournir un certificat médical de non contre-indication au sport
• Payer les frais d'inscription selon le barème affiché

DATES D'INSCRIPTION :
Du 15 août au 5 septembre en ligne sur nantes.fr/sports
Du 6 au 15 septembre en présentiel dans les équipements sportifs

Renseignements : 02 40 XX XX XX`,
    question: 'Ce document est un…',
    optionA: 'Bulletin d\'information sur les inscriptions aux cours municipaux de sport',
    optionB: 'Programme des compétitions sportives municipales',
    optionC: 'Règlement intérieur des piscines municipales de Nantes',
    optionD: 'Rapport annuel des équipements sportifs de Nantes',
    correctAnswer: 'A',
  }));

  qs.push(q(5, 'Q1-7', null, {
    longText: `CRITIQUE — ROMAN

« LA LIGNE D'ARRIVÉE » de Marc TESSIER
Éditions Gallimard — 312 pages — 19,90 €

Dans ce premier roman haletant, Marc Tessier raconte l'ascension et la chute d'un champion cycliste africain, Kouamé Allain, qui débarque en Europe avec le rêve de disputer le Tour de France. L'auteur, lui-même ancien coureur amateur, décrit avec une précision saisissante l'univers impitoyable du cyclisme professionnel : la solitude des montagnes, les nuits dans les bus d'équipe, les tentations du dopage.

Ce qui distingue ce roman d'un simple roman de sport, c'est la dimension humaine et politique : Kouamé est aussi un exilé, porteur des espoirs de tout un village. Le roman questionne avec finesse ce que signifie « réussir » quand les dés sont pipés dès le départ.

À recommander vivement. ★★★★★`,
    question: 'Ce document est…',
    optionA: 'La quatrième de couverture d\'un roman',
    optionB: 'La critique d\'un roman sur le cyclisme',
    optionC: 'Un article de presse sur un coureur cycliste africain',
    optionD: 'Une publicité pour une maison d\'édition',
    correctAnswer: 'B',
  }));

  qs.push(q(6, 'Q1-7', null, {
    longText: `CONVOCATION — COMITÉ DIRECTEUR

Association Sportive Olympique de Bordeaux (ASOB)
Section Athlétisme

Objet : Convocation à la réunion du comité directeur

Monsieur DIALLO Ibrahima, membre du comité,

Vous êtes convoqué à la réunion mensuelle du comité directeur qui se tiendra le :
Mardi 25 novembre 2025 à 20h00
Salle de réunion du stade municipal Chaban-Delmas, avenue d'Eysines, Bordeaux

ORDRE DU JOUR :
1. Approbation du compte-rendu de la réunion du 28 octobre
2. Point financier — bilan des cotisations et charges
3. Préparation de la réunion de la Fédération régionale
4. Questions diverses

La présence de chaque membre est indispensable pour le quorum. En cas d'absence, merci de prévenir le secrétaire au plus tôt.

Le Président, M. MONNIN Jean-Paul`,
    question: 'Ce document est…',
    optionA: 'Un règlement intérieur d\'une association sportive',
    optionB: 'Une convocation à une réunion du comité directeur d\'un club sportif',
    optionC: 'Un contrat de bénévolat pour une association sportive',
    optionD: 'Un rapport financier d\'une fédération sportive',
    correctAnswer: 'B',
  }));

  qs.push(q(7, 'Q1-7', null, {
    longText: `EXTRAIT DU SITE DE LA FÉDÉRATION FRANÇAISE D'ATHLÉTISME

CHAMPIONNATS DE FRANCE EN SALLE 2026
Paris Bercy — Accor Arena — 14 et 15 février 2026

ÉPREUVES AU PROGRAMME : 60m, 60m haies, 200m, 400m, 800m, 1500m, 3000m, 5000m marche, hauteur, perche, longueur, triple saut, poids, pentathlon, heptathlon.

QUALIFICATION : Seuls les athlètes ayant réalisé les minima de qualification (publiés sur ffa.fr) ou ayant été sélectionnés par leur ligue régionale peuvent participer.

BILLETTERIE : Tarif plein : 15 € | Tarif réduit (- 18 ans, étudiants, demandeurs d'emploi) : 8 € | Pass 2 jours : 25 € | Gratuit pour les moins de 10 ans.

Achat en ligne : billetterie.ffa.fr ou sur place dans la limite des disponibilités.`,
    question: 'Ce document est…',
    optionA: 'Un calendrier des compétitions d\'athlétisme en France',
    optionB: 'Une présentation des Championnats de France en salle d\'athlétisme',
    optionC: 'Un règlement de qualification pour les Jeux Olympiques',
    optionD: 'Un guide pour les athlètes amateurs souhaitant progresser',
    correctAnswer: 'B',
  }));

  // ── Q8-13 : Phrases lacunaires ──
  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Le footballeur a signé un contrat de trois ans avec le club parisien pour une ___ annuelle de 4 millions d\'euros.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'rémunération',
    optionB: 'pension',
    optionC: 'allocation',
    optionD: 'cotisation',
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La récolte de blé a été ___ par les pluies abondantes du printemps, dépassant les prévisions des agriculteurs.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'favorisée',
    optionB: 'gênée',
    optionC: 'ignorée',
    optionD: 'annulée',
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Malgré une blessure au genou, l\'athlète a réussi à ___ sa médaille d\'or aux championnats du monde.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'défendre',
    optionB: 'perdre',
    optionC: 'oublier',
    optionD: 'ignorer',
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: 'La crise économique a fortement ___ les recettes des clubs sportifs professionnels, forçant plusieurs d\'entre eux à réduire leur masse salariale.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'réduit',
    optionB: 'augmenté',
    optionC: 'stabilisé',
    optionD: 'ignoré',
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: 'L\'équipe nationale de handball a remporté le titre mondial pour la ___ fois de son histoire.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'troisième',
    optionB: 'première',
    optionC: 'unique',
    optionD: 'dernière',
    correctAnswer: 'A',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: 'Les techniques d\'agriculture de précision permettent de ___ significativement la quantité d\'eau utilisée pour l\'irrigation.',
    question: 'Quel mot complète correctement la phrase ?',
    optionA: 'diminuer',
    optionB: 'augmenter',
    optionC: 'mesurer',
    optionD: 'oublier',
    correctAnswer: 'A',
  }));

  // ── Q14-17 : Textes lacunaires ──
  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le sport de haut niveau',
    longText: TEXTE_LACUNAIRE_P,
    question: 'Quel mot convient pour le blanc [14] ?',
    optionA: 'sacrifices',
    optionB: 'privilèges',
    optionC: 'vacances',
    optionD: 'récompenses',
    correctAnswer: 'A',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le sport de haut niveau',
    longText: TEXTE_LACUNAIRE_P,
    question: 'Quel mot convient pour le blanc [15] ?',
    optionA: 'pic',
    optionB: 'manque',
    optionC: 'début',
    optionD: 'déclin',
    correctAnswer: 'A',
  }));

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Le sport de haut niveau',
    longText: TEXTE_LACUNAIRE_P,
    question: 'Quel mot convient pour le blanc [16] ?',
    optionA: 'couronnement',
    optionB: 'début',
    optionC: 'échec',
    optionD: 'hasard',
    correctAnswer: 'A',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — L\'économie mondiale',
    longText: TEXTE_LACUNAIRE_Q,
    question: 'Quel mot convient pour le blanc [17] ?',
    optionA: 'bouleversements',
    optionB: 'succès',
    optionC: 'traditions',
    optionD: 'stabilisations',
    correctAnswer: 'A',
  }));

  // ── Q18-21 ──
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: 'Quel sport est qualifié de « discipline olympique historique » présente depuis l\'Antiquité ?',
    optionA: 'Sport 1',
    optionB: 'Sport 2',
    optionC: 'Sport 3',
    optionD: 'Sport 4',
    correctAnswer: 'C',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: 'Quel indicateur économique mesure la différence entre exportations et importations d\'un pays ?',
    optionA: 'Économie 1',
    optionB: 'Économie 2',
    optionC: 'Économie 3',
    optionD: 'Économie 4',
    correctAnswer: 'D',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: 'Quel événement historique a eu lieu le 9 novembre 1989 et a marqué la fin de la Guerre Froide ?',
    optionA: 'Histoire 1',
    optionB: 'Histoire 2',
    optionC: 'Histoire 3',
    optionD: 'Histoire 4',
    correctAnswer: 'D',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: 'Quel type d\'agriculture utilise des drones et des satellites pour optimiser les interventions sur chaque parcelle ?',
    optionA: 'Agriculture 1',
    optionB: 'Agriculture 2',
    optionC: 'Agriculture 3',
    optionD: 'Agriculture 4',
    correctAnswer: 'C',
  }));

  // ── Q22 ──
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: 'Quel graphique correspond à la phrase suivante : « Le nombre de médailles d\'or est le plus élevé et décroît de l\'or vers le bronze » ?',
    optionA: 'Graphique 1',
    optionB: 'Graphique 2',
    optionC: 'Graphique 3',
    optionD: 'Graphique 4',
    correctAnswer: 'C',
  }));

  // ── Q23-32 ──
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: 'Contrat de partenariat sportif — SPORTMAX / ASOB',
    longText: DOC_CONTRAT_SPONSORING,
    question: 'Ce document est un…',
    optionA: 'Contrat d\'assurance pour une association sportive',
    optionB: 'Contrat de partenariat (sponsoring) entre une entreprise et un club sportif',
    optionC: 'Accord de cession de joueur entre deux clubs',
    optionD: 'Contrat de location de stade pour une compétition',
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: 'Contrat de partenariat sportif — SPORTMAX / ASOB',
    longText: DOC_CONTRAT_SPONSORING,
    question: 'Selon ce contrat, quelles sont les contreparties offertes par l\'ASOB à SPORTMAX ?',
    optionA: 'Un versement financier annuel et des billets pour les compétitions',
    optionB: 'L\'affichage du logo et des publications sur les réseaux sociaux du club',
    optionC: 'La formation de jeunes athlètes aux couleurs de la marque',
    optionD: 'La co-organisation de tournois régionaux',
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: 'Programme scolaire — Sport et Citoyenneté',
    longText: DOC_PROGRAMME_SPORT_ECOLE,
    question: 'Ce programme est destiné aux élèves de…',
    optionA: 'CE2 et CM1',
    optionB: 'Sixième et cinquième',
    optionC: 'Cinquième et quatrième',
    optionD: 'Seconde et première',
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: 'Programme scolaire — Sport et Citoyenneté',
    longText: DOC_PROGRAMME_SPORT_ECOLE,
    question: 'Selon ce programme, quelle activité est réservée aux élèves de cinquième uniquement ?',
    optionA: 'Athlétisme',
    optionB: 'Basketball',
    optionC: 'Judo',
    optionD: 'Natation',
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: 'Lettre de refus d\'embauche',
    longText: DOC_LETTRE_REFUS,
    question: 'Ce document est…',
    optionA: 'Une lettre de licenciement',
    optionB: 'Une lettre de refus d\'embauche après candidature et entretien',
    optionC: 'Une lettre de demande de recommandation',
    optionD: 'Un courrier de rupture de période d\'essai',
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: 'Lettre de refus d\'embauche',
    longText: DOC_LETTRE_REFUS,
    question: 'Selon cette lettre, pour quelle raison principale la candidature a-t-elle été refusée ?',
    optionA: 'Le dossier de candidature était incomplet',
    optionB: 'Le profil manque d\'expérience (5 ans requis dans le secteur sportif)',
    optionC: 'Le poste a finalement été supprimé',
    optionD: 'La candidate était trop qualifiée pour le poste',
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: 'Rapport annuel — Pratique sportive en France 2025',
    longText: DOC_RAPPORT_SPORT,
    question: 'Selon ce rapport, quel sport est le plus pratiqué en France ?',
    optionA: 'Le football',
    optionB: 'La randonnée pédestre',
    optionC: 'La natation',
    optionD: 'Le cyclisme',
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: 'Rapport annuel — Pratique sportive en France 2025',
    longText: DOC_RAPPORT_SPORT,
    question: 'Selon ce rapport, quelle tendance est observée chez les licenciés des sports collectifs ?',
    optionA: 'Une forte progression de +23 %',
    optionB: 'Une légère baisse de 5 %',
    optionC: 'Une stabilisation sans changement notable',
    optionD: 'Un doublement du nombre de licenciés',
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: 'Bail commercial — Salle de sport SPORT ET FORME',
    longText: DOC_BAIL_COMMERCIAL,
    question: 'Selon ce bail, quelle est la destination contractuelle des lieux loués ?',
    optionA: 'Restaurant et salle de réception',
    optionB: 'Bureau et espace de coworking',
    optionC: 'Salle de sport et de fitness exclusivement',
    optionD: 'Commerce de vente de matériel sportif',
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: 'Bail commercial — Salle de sport SPORT ET FORME',
    longText: DOC_BAIL_COMMERCIAL,
    question: 'Selon ce bail, qui prend en charge la taxe foncière et les charges de copropriété ?',
    optionA: 'Le Bailleur (SCI LES ACACIAS)',
    optionB: 'Le Preneur (SPORT ET FORME SARL)',
    optionC: 'Les deux parties à parts égales',
    optionD: 'La Ville de Lyon',
    correctAnswer: 'B',
  }));

  // ── Q33-40 ──
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: 'Article — Sport et santé : les bénéfices de l\'activité physique',
    longText: ART_SPORT_SANTE,
    question: 'Selon cet article, l\'inactivité physique est qualifiée par l\'OMS de…',
    optionA: 'Problème de santé publique mineur',
    optionB: 'Quatrième facteur de risque de mortalité mondiale',
    optionC: 'Principale cause des maladies infectieuses',
    optionD: 'Facteur aggravant des maladies génétiques',
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: 'Article — Sport et santé : les bénéfices de l\'activité physique',
    longText: ART_SPORT_SANTE,
    question: 'D\'après l\'article, le « sport sur ordonnance » se heurte notamment à…',
    optionA: 'L\'opposition des patients à pratiquer une activité physique',
    optionB: 'Le manque de structures d\'accueil et l\'insuffisante formation des médecins',
    optionC: 'L\'absence de remboursement par la Sécurité sociale',
    optionD: 'La résistance des clubs sportifs à accueillir des patients',
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: 'Article — L\'économie du sport en mutation',
    longText: ART_ECONOMIE_SPORT,
    question: 'Selon cet article, quelle est la principale vulnérabilité structurelle du sport professionnel ?',
    optionA: 'La fraude fiscale des clubs sportifs',
    optionB: 'La dépendance au financement télévisé',
    optionC: 'Le manque de talent dans les académies de formation',
    optionD: 'La corruption dans les instances dirigeantes',
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: 'Article — L\'économie du sport en mutation',
    longText: ART_ECONOMIE_SPORT,
    question: 'L\'auteur soulève la question de l\'impact des nouvelles générations sur le modèle économique du sport, car…',
    optionA: 'Elles pratiquent moins de sport que les générations précédentes',
    optionB: 'Elles regardent de moins en moins la télévision linéaire',
    optionC: 'Elles dépensent moins d\'argent en équipements sportifs',
    optionD: 'Elles privilégient l\'e-sport au détriment du sport traditionnel',
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: 'Article — Les Jeux Olympiques de Paris 2024',
    longText: ART_JO_PARIS,
    question: 'Selon cet article, quelle nouveauté de la cérémonie d\'ouverture des JO de Paris a été saluée mondialement ?',
    optionA: 'L\'utilisation de drones lumineux pour dessiner les anneaux olympiques',
    optionB: 'La cérémonie organisée sur la Seine, unique dans l\'histoire olympique',
    optionC: 'La participation record de 206 délégations nationales',
    optionD: 'La performance record de la France avec 16 médailles d\'or',
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: 'Article — Les Jeux Olympiques de Paris 2024',
    longText: ART_JO_PARIS,
    question: 'Sur le plan économique, l\'article présente un bilan nuancé car…',
    optionA: 'Les JO ont coûté deux fois plus que prévu au budget de l\'État',
    optionB: 'Certains quartiers ont connu des hausses de loyers défavorables aux populations locales',
    optionC: 'Les retombées touristiques ont été inférieures aux prévisions',
    optionD: 'Les sponsors internationaux ont retiré leur soutien à la dernière minute',
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: 'Article — Le sport féminin : visibilité et inégalités',
    longText: ART_SPORT_FEMININ,
    question: 'Selon cet article, quelle progression illustre la hausse de la visibilité du sport féminin ?',
    optionA: 'La Coupe du Monde féminine 2023 a attiré 2 milliards de téléspectateurs',
    optionB: 'Les salaires des footballeuses ont été multipliés par cinq en France',
    optionC: 'Les droits télévisés du sport féminin dépassent désormais ceux du masculin',
    optionD: 'La moitié des athlètes olympiques sont désormais des femmes',
    correctAnswer: 'A',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: 'Article — Le sport féminin : visibilité et inégalités',
    longText: ART_SPORT_FEMININ,
    question: 'L\'auteur décrit le changement de paradigme pour la génération Z en indiquant que…',
    optionA: 'Les jeunes femmes pratiquent davantage le sport individuel que collectif',
    optionB: 'Le sport de haut niveau féminin représente un modèle identificatoire aussi fort que le masculin',
    optionC: 'Les jeunes femmes préfèrent regarder le sport à la télévision plutôt que le pratiquer',
    optionD: 'La génération Z refuse les stéréotypes de genre dans le sport',
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
    console.log(`\n✅ 40 questions créées pour CE 51.`);
    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(err => { console.error('❌', err.message); process.exit(1); });
