'use strict';
/**
 * seed-ce-serie49.js
 * Peuple la série CE 49 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie49.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyompt00190wxleqmsd5hm';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : LINE CHART, hauteur vagues par mois ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [3.5, 4.0, 3.8, 2.5, 1.8, 1.2, 1.0, 1.5, 2.0, 2.8, 3.2, 3.8], color: '#003087' }, // CORRECT
    { label: 'Graphique 2', data: [1.5, 1.8, 2.0, 3.5, 4.2, 3.8, 3.5, 3.2, 2.5, 2.0, 1.5, 1.2], color: '#E30613' },
    { label: 'Graphique 3', data: [2.0, 2.2, 2.5, 2.8, 2.6, 2.4, 2.2, 2.3, 2.5, 2.7, 2.4, 2.1], color: '#E30613' },
    { label: 'Graphique 4', data: [4.5, 3.8, 2.5, 1.8, 1.2, 0.8, 0.9, 1.2, 1.8, 2.5, 3.2, 4.0], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const maxVal = 5;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const step = plotW / (g.data.length - 1);
    const gridLines = [0, 1, 2, 3, 4, 5].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}m</text>`;
    }).join('');
    const points = g.data.map((v, i) => {
      const px = (plotX + i * step).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return { px, py, v, label: monthLabels[i] };
    });
    const polyline = points.map(p => `${p.px},${p.py}`).join(' ');
    const dots = points.map(p =>
      `<circle cx="${p.px}" cy="${p.py}" r="3" fill="${g.color}"/>` +
      `<text x="${p.px}" y="${(plotY + plotH + 12).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${p.label}</text>`
    ).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines +
           `<polyline points="${polyline}" fill="none" stroke="${g.color}" stroke-width="2"/>` +
           dots +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Hauteur vagues (m)</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="418">` +
    `<rect width="820" height="418" fill="#f9fafb" rx="8"/>` +
    graphs.map((g, i) => drawLineChart(g, positions[i].cx, positions[i].cy)).join('') +
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
  { title: 'Type 1', content: "Cyclone tropical : système météorologique de basses pressions à rotation cyclonique se formant au-dessus des eaux océaniques chaudes (supérieures à 26 °C). Vents soutenus dépassant 120 km/h dans les cas les plus intenses (catégories 4 et 5). Surtout dangereux par les pluies torrentielles et les submersions côtières." },
  { title: 'Type 2', content: "Supercellule orageuse : système orageux rotatif — le plus dangereux — formé lorsqu'un orage standard développe une rotation atmosphérique (mésocyclone) en son sein. Peut produire des tornades, de la grêle massive et des vents violents sur de larges territoires. Détectée par radars météo Doppler." },
  { title: 'Type 3', content: "Front froid actif : limite entre une masse d'air froid avançant et une masse d'air chaud. Provoque des orages brefs et intenses, une baisse rapide des températures et des vents de nord-ouest tourbillonnants. Passage visible par un changement brutal des nuages et une forte chute barométrique en quelques heures." },
  { title: 'Type 4', content: "Dépression tropicale : perturbation atmosphérique organisée sur les eaux tropicales avec des vents inférieurs à 63 km/h, stade précédant la tempête tropicale. Ne génère pas de tornade mais peut provoquer des pluies importantes. Suivie par les centres nationaux de météorologie tropicale pour anticiper son éventuelle intensification." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Type 1', content: "Cuisine suédoise : cuisine nordique sobre et saisonnière valorisant le hareng mariné (sill), les boulettes de viande (köttbullar) et les crevettes fraîches. Le smörgåsbord (buffet scandinave) et la présentation soignée sont caractéristiques. Pain crispbread (knäckebröd) quotidien. Canneberges et airelles comme condiments essentiels." },
  { title: 'Type 2', content: "Cuisine islandaise : cuisine basée sur l'agneau de montagne élevé en liberté, le poisson séché (hardfiskur), le skyr (produit laitier fermenté naturel) et les produits géothermaux comme le pain de seigle cuit dans la terre. Traditions Viking conservées. Peu d'épices, saveurs naturelles et produits locaux biologiques." },
  { title: 'Type 3', content: "Cuisine finlandaise : cuisine subarctique utilisant baies sauvages, champignons, poissons des lacs (perche, brochet, sandre) et renne. Pain au seigle dense (ruisleipä) quotidien. Spécialité : karjalanpiirakka (chaussons de seigle garnis de riz au lait). Saunas et gastronomie intimement liés à la culture culinaire finlandaise." },
  { title: 'Type 4', content: "Cuisine norvégienne : cuisine atlantique maritime centrée sur le saumon d'élevage, la morue (klippfisk), les crevettes et la baleine. Fromage brun (brunost) emblématique. Traditions de conservation par fumage, séchage et salaison très développées. Cuisine contemporaine nordique (New Nordic Food) internationalement reconnue depuis les années 2000." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Type 1', content: "Crédit à la consommation : prêt octroyé par un établissement financier pour financer des dépenses personnelles (achats, voyages, travaux). Taux fixe ou variable. Durée de 3 mois à 7 ans. Soumis à la réglementation sur le crédit à la consommation : droit de rétractation de 14 jours, information précontractuelle obligatoire." },
  { title: 'Type 2', content: "Titrisation : opération financière complexe transformant des créances bancaires illiquides (prêts hypothécaires, crédits auto) en titres financiers négociables sur les marchés de capitaux. Permet aux banques de libérer leurs bilans et de disposer de nouvelles liquidités. Technique au cœur de la crise des subprimes de 2008." },
  { title: 'Type 3', content: "Nantissement : constitution d'une garantie sur un bien meuble (portefeuille de titres, fonds de commerce, créances) au profit d'un créancier. Le débiteur conserve généralement la possession du bien. En cas de défaillance, le créancier peut se faire attribuer le bien ou le vendre pour récupérer sa créance." },
  { title: 'Type 4', content: "Cautionnement : engagement pris par un tiers (la caution) de payer la dette d'un débiteur principal en cas de défaillance de celui-ci envers un créancier. Mécanisme très courant dans les prêts immobiliers et les baux commerciaux. La caution peut être solidaire (payable immédiatement) ou simple (recours préalable contre le débiteur)." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Type 1', content: "Wakeboard : sport nautique de glisse où le pratiquant, debout sur une planche, est tracté par un bateau motorisé ou un câble de téléski nautique. Tricks acrobatiques : rotations, sauts, slides. Dérivé du ski nautique et du skateboard. Compétition olympique aux JO de Paris 2024 sous la forme de wakeboard sur câble." },
  { title: 'Type 2', content: "Surf des neiges (snowboard) : discipline olympique depuis 1998 pratiquée sur des pentes enneigées sur une planche unique fixée aux deux pieds. Disciplines : slalom géant parallèle, halfpipe, slopestyle, big air, cross. Très populaire chez les jeunes depuis les années 90. Ambiance culture indépendante distincte du ski." },
  { title: 'Type 3', content: "Bodysurf : pratique consistant à surfer les vagues en utilisant uniquement son corps comme planche, sans aucun équipement flottant. Les bodysurfeurs s'élancent à la nage au bon moment, bras étendus, pour prendre la vague naturellement. Art ancestral polynésien, précurseur de tous les sports de glisse sur vague." },
  { title: 'Type 4', content: "SUP (Stand Up Paddle) : discipline de pagayage debout sur une large planche, en eau calme ou en surf de vagues. Pagaie longue à manche coudé pour avancer efficacement. Pratique accessible à tous les âges et niveaux. Courses longue distance, surf de vague en SUP et yoga sur board sont les trois grands formats de compétition." },
]);

/* ── Documents Q23-32 ── */
const DOC_PRET_BANCAIRE =
`CONTRAT DE PRÊT IMMOBILIER
Établissement prêteur : Caisse Régionale du Crédit Populaire
Emprunteur : M. et Mme Fernandez

Montant du prêt : 220 000 €
Durée : 240 mois (20 ans)
Taux d'intérêt annuel fixe : 3,45 %
Taux annuel effectif global (TAEG) : 3,82 %
Mensualité hors assurance : 1 264,80 €
Assurance décès-invalidité : 45,20 €/mois
Mensualité totale : 1 310,00 €
Coût total du crédit (intérêts + assurance) : 94 400 €

Garanties :
- Hypothèque de premier rang sur le bien financé
- Nantissement du contrat d'assurance vie n° 78452-A

Conditions suspensives :
Le présent contrat est conclu sous réserve de l'obtention d'un permis de construire valide et de l'achèvement de la vente par acte authentique chez le notaire.`;

const DOC_ARCHEOLOGUE =
`OFFRE D'EMPLOI — ARCHÉOLOGUE SOUS-MARIN(E)
DRASSM — Département des Recherches Archéologiques Subaquatiques et Sous-Marines

Le DRASSM recrute pour ses programmes de recherche sur le patrimoine submergé méditerranéen et atlantique.

Missions :
- Participation aux fouilles subaquatiques d'épaves (Bronze final, Antiquité, époque moderne)
- Relevé photogrammétrique et cartographie 3D des sites sous-marins
- Traitement et étude du mobilier archéologique issu des fouilles
- Rédaction des rapports d'opération et des publications scientifiques
- Formation des étudiants en archéologie subaquatique

Profil : doctorat en archéologie préhistorique ou historique, certificat de plongée professionnelle SCAPHANDRIER N2 minimum, permis bateau côtier, expérience de terrain archéologique (3 fouilles documentées minimum).

Poste de chercheur contractuel — 2 ans renouvelables. Déplacements fréquents (Méditerranée, côtes atlantiques). Permis de conduire B indispensable.`;

const DOC_THEATRE_JEUNE =
`CONVENTION DE MISE À DISPOSITION ARTISTIQUE
Entre le Théâtre de la Marelle (compagnie) et le Rectorat de l'Académie

Article 1 — Objet
La présente convention organise la tournée scolaire de la pièce « Le Petit Prince et les Étoiles » (adaptation pour le jeune public) dans les écoles primaires et collèges du département.

Article 2 — Nombre de représentations
La compagnie s'engage à assurer 25 représentations entre le 5 janvier et le 30 mars 2026. Chaque représentation accueille 100 à 150 élèves. Format : 45 minutes de spectacle + 20 minutes d'échange avec les comédiens.

Article 3 — Responsabilités
L'établissement scolaire fournit la salle de spectacle (podium ou scène) et assure l'encadrement des élèves. La compagnie apporte la totalité du matériel scénique (décors, son, lumières).

Article 4 — Tarification
Tarif par représentation : 850 € TTC, payable à 30 jours fin de mois à réception de la facture.

Article 5 — Annulation
Toute annulation moins de 15 jours avant la représentation entraîne le paiement de 50 % du tarif.`;

const DOC_SURF =
`RÈGLEMENT DE SÉCURITÉ — CHAMPIONNAT RÉGIONAL DE SURF CÔTE BASQUE

Article 1 — Conditions météorologiques
Les épreuves se déroulent uniquement si la hauteur des vagues est comprise entre 0,8 m et 4 m. En cas de conditions jugées dangereuses par le directeur de compétition (vents > 50 km/h, brouillard épais, danger de courant), les séries sont suspendues ou reportées.

Article 2 — Équipement obligatoire
Tout compétiteur doit porter un leash (attache cheville-planche) homologué, ainsi qu'une combinaison de néoprène lors des compétitions hivernales. Les bodyboarders portent des palmes homologuées. Casque recommandé pour les moins de 16 ans.

Article 3 — Système de points
Deux juges évaluent simultanément chaque vague sur une échelle de 0 à 10. Le meilleur score et le second meilleur score sont additionnés pour le total de la session (maximum 20 points). Les 4 meilleurs surfeurs de chaque manche se qualifient pour le tour suivant.

Article 4 — Sécurité en eau
Un responsable de sécurité nautique (RSN) est positionné en permanence dans l'eau pendant toutes les sessions de compétition.`;

const DOC_DESIGN_INTERIEUR =
`GUIDE PROFESSIONNEL — CERTIFICATION DÉCORATEUR D'INTÉRIEUR BIOPHILIQUE

La certification « Design Biophilique Certifié » (DBC) est attribuée par l'Association des Décorateurs d'Intérieur Responsables (ADIR) aux professionnels maîtrisant les principes de design qui intègrent la nature dans les espaces de vie et de travail.

Critères de certification :

1. Formation : justifier d'une formation en design intérieur (minimum Bac+3) et d'une formation spécifique au design biophilique de 40 heures validée par un organisme agréé ADIR.

2. Réalisations : présenter un portfolio de 5 projets réalisés intégrant au moins 3 éléments biophiliques parmi : végétalisation verticale ou horizontale, matériaux naturels bruts (pierre, bois non traité, bambou), lumière naturelle optimisée, vues sur la nature, présence d'eau, systèmes de ventilation naturelle.

3. Éthique : souscrire à la charte ADIR imposant l'utilisation de peintures sans COV et de matériaux à faible impact environnemental.

4. Formation continue : 15 heures de formation par an pour maintenir la certification.`;

/* ── Articles de presse Q33-40 ── */
const ART_METEO =
`PRÉVISION MÉTÉOROLOGIQUE ET CATASTROPHES NATURELLES : SAUVER DES VIES PAR L'ANTICIPATION

Les progrès spectaculaires réalisés dans les technologies de prévision météorologique au cours des trente dernières années ont transformé la gestion des risques liés aux catastrophes naturelles. Là où les météorologues des années 1970 peinaient à prévoir le temps à 24 heures avec une précision raisonnable, les modèles numériques actuels permettent des prévisions fiables à 10 jours et détectent les perturbations majeures deux à trois semaines à l'avance.

Cette révolution est fondée sur trois piliers. La puissance de calcul des supercalculateurs, qui doublent de capacité tous les deux ans, permet de résoudre des équations atmosphériques de plus en plus complexes. Le réseau mondial d'observations — satellites géostationnaires, radars Doppler, bouées océaniques, radiosondages — fournit des données en temps réel d'une densité sans précédent. Enfin, les algorithmes d'apprentissage machine commencent à supplanter les modèles physiques déterministes pour certains paramètres locaux.

L'impact sur la gestion des catastrophes naturelles est considérable. Les cyclones tropicaux, dont les trajectoires sont désormais connues trois à cinq jours à l'avance avec une précision de l'ordre de 150 km, permettent des évacuations préventives massives. Le nombre de victimes de cyclones bien prévenus a chuté de 80 % en cinquante ans, même si la vulnérabilité des populations pauvres des côtes demeure préoccupante.

La météorologie reste cependant une science des probabilités, non des certitudes. L'attribution de cyclones ou d'inondations exceptionnelles au changement climatique, si elle est scientifiquement robuste sur le plan statistique, reste difficile à communiquer clairement au grand public habitué à des prévisions déterministes.`;

const ART_ARCHEOLOGIE_MARINE =
`ARCHÉOLOGIE SOUS-MARINE ET PATRIMOINE IMMERGÉ : LES TRÉSORS CACHÉS DES FONDS MARINS

Les océans et les lacs du monde abritent un patrimoine archéologique d'une richesse extraordinaire et encore largement inexploré. On estime que plus de trois millions d'épaves de navires jonchent les fonds marins, des pirogues préhistoriques aux sous-marins de la Seconde Guerre mondiale, en passant par les galions espagnols chargés d'or américain. À ces épaves s'ajoutent des cités englouties par la montée des eaux — comme la ville antique de Pavlopetri en Grèce, submergée il y a 3 500 ans — et des paysages terrestres préhistoriques, inondés lors des grandes transgressions marines postglaciaires.

L'archéologie sous-marine est une discipline exigeante qui combine les compétences de l'archéologue traditionnel avec celles du plongeur expert. Les conditions de travail — visibilité réduite, courants, pression, froid — imposent des protocoles stricts et des équipements spécialisés. Les technologies modernes ont cependant révolutionné la discipline : les ROV (véhicules télécommandés), les sonar à balayage latéral et la photogrammétrie sous-marine permettent de cartographier et d'étudier des sites à des profondeurs inaccessibles aux plongeurs.

La conservation des épaves pose des défis particuliers. En milieu anaérobie (sans oxygène), certains matériaux organiques comme le bois ou le cuir sont exceptionnellement bien conservés pendant des millénaires. Dès l'extraction, ils doivent subir des traitements de conservation complexes, souvent longs de plusieurs décennies.

La question de la propriété des épaves est internationale et complexe. La Convention de l'UNESCO de 2001 sur la protection du patrimoine culturel subaquatique affirme le principe que ce patrimoine doit rester in situ autant que possible, favorisant l'étude archéologique sur place plutôt que l'extraction.`;

const ART_CRISE_BANCAIRE =
`CRISES BANCAIRES MONDIALES ET NOUVELLES RÉGULATIONS : TIRER LES LEÇONS DE 2008

La crise financière mondiale de 2008, déclenchée par l'effondrement du marché des subprimes américains, a mis en lumière les dangereuses interconnexions d'un système bancaire mondial insuffisamment régulé. Des institutions réputées « too big to fail » — trop importantes pour faire faillite — se sont révélées fragiles comme du cristal, entraînant dans leur chute l'économie mondiale et nécessitant des plans de sauvetage publics colossaux.

La réponse réglementaire internationale, coordonnée notamment par le G20 et le Comité de Bâle, a abouti à un renforcement substantiel des exigences de fonds propres des banques (accords de Bâle III puis IV), à une surveillance accrue des établissements systémiques et à l'introduction de procédures de résolution bancaire ordonnée évitant que les contribuables aient à payer les erreurs des actionnaires.

Quinze ans après, le bilan est contrasté. Les grandes banques sont globalement mieux capitalisées qu'en 2008. Mais la complexité croissante des produits financiers dérivés, la montée en puissance des cryptomonnaies et le développement du shadow banking (finance de l'ombre, hors réglementation bancaire classique) créent de nouvelles zones de risque potentiel.

Les économistes débattent de la prochaine crise : viendra-t-elle des marchés immobiliers surchauffés de certains pays, de l'insolvabilité de quelques États très endettés, ou d'une disruption technologique imprévisible dans le système de paiement mondial ? La vigilance des régulateurs et la diversification des superviseurs — BCE, FED, BRI — constituent le filet de sécurité d'un système qui reste fondamentalement fragile.`;

const ART_SURF =
`LE SURF ET LA CULTURE POLYNÉSIENNE : AUX ORIGINES D'UN SPORT MONDIAL

Le surf, devenu en un demi-siècle l'un des sports de glisse les plus pratiqués au monde avec près de 40 millions de pratiquants, est l'héritier direct d'une tradition polynésienne millénaire. Les habitants des archipels du Pacifique — Hawaï, Tahiti, Samoa — pratiquaient le he'e nalu (glisse sur vague) bien avant l'arrivée des Européens, non seulement comme activité sportive mais comme pratique rituelle et sociale profondément ancrée dans leur vision du monde.

Lorsque les premiers missionnaires protestants et catholiques débarquèrent dans les îles du Pacifique au XIXe siècle, ils perçurent le surf comme une activité frivole et potentiellement immorale — les surfeurs hawaïens pratiquant souvent nus — et contribuèrent à son déclin. La « renaissance » du surf au début du XXe siècle est largement associée au nageur olympique hawaïen Duke Kahanamoku, qui popularisa la discipline lors de ses tournées de démonstration en Australie et en Californie.

La diffusion mondiale du surf s'est accompagnée d'une complexification culturelle ambivalente. D'un côté, l'héritage polynésien est célébré : le terme hawaïen « aloha » est devenu synonyme de l'esprit du surf, l'usage des colliers de fleurs et des tatouages polynésiens s'est répandu. De l'autre, une industrie multimilliardaire s'est approprié cette culture en la transformant en marque commerciale, souvent au détriment des communautés polynésiennes d'origine.

L'intégration du surf aux Jeux Olympiques de Tokyo 2020, sur un site artificiel à Chiba, puis aux JO de Paris 2024 à Tahiti sur les vagues mythiques de Teahupo'o, constitue une reconnaissance mondiale de ce sport et un retour symbolique aux sources pour une discipline qui n'a jamais oublié ses racines océaniennes.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme théâtre jeune public
  qs.push(q(1, 'Q1-7', null, {
    longText:
`THÉÂTRE DE LA MARELLE — Saison Jeune Public 2025-2026

Spectacles pour enfants et adolescents :

• « Le Voyage de Luna » (4-7 ans) — 35 min
  Jeudis et vendredis à 14 h 30 | Samedis à 10 h 30
  Thème : découverte des émotions et gestion de la peur

• « Les Aventures de Marco Polo » (8-12 ans) — 55 min
  Mercredis et samedis à 15 h 30
  Thème : cultures du monde, découvertes géographiques

• « L'Été de nos vies » (12-16 ans) — 1 h 15
  Vendredis à 20 h | Samedis à 17 h
  Thème : adolescence, amitié, premiers choix de vie

Réservations groupes scolaires : 02 38 00 12 34
Tarifs : 8 € plein | 5 € réduit | 70 € groupe (20 élèves min.)`,
    question: "D'après ce programme, quel spectacle convient à des enfants de 10 ans ?",
    optionA: "« Le Voyage de Luna » (4-7 ans).",
    optionB: "« Les Aventures de Marco Polo » (8-12 ans).",
    optionC: "« L'Été de nos vies » (12-16 ans).",
    optionD: "Tous les spectacles sont adaptés à tous les âges.",
    correctAnswer: 'B',
  }));

  // Q2 — Affiche compétition surf
  qs.push(q(2, 'Q1-7', null, {
    longText:
`CHAMPIONNATS RÉGIONAUX DE SURF — CÔTE BASQUE
Samedi 4 et dimanche 5 octobre 2025 — Plage de Lafitenia, Saint-Jean-de-Luz

CATÉGORIES EN COMPÉTITION :
• Open hommes (18 ans et plus)
• Open dames (18 ans et plus)
• Junior hommes (15-17 ans)
• Junior dames (15-17 ans)
• Masters (40 ans et plus)

Programme journalier : 8 h 00 — briefing sécurité | 8 h 30 — premières séries
Remise des trophées : dimanche à 17 h 30

Inscriptions (clôturées le 25 septembre) : surf-basque-federation.fr
Entrée spectateurs : gratuite
Restauration locale sur place`,
    question: "Ce document est…",
    optionA: "un règlement officiel de la compétition.",
    optionB: "une affiche de championnats régionaux de surf avec catégories et programme.",
    optionC: "un article de presse sur les résultats du championnat.",
    optionD: "une publicité pour une école de surf basque.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement musée archéologie
  qs.push(q(3, 'Q1-7', null, {
    longText:
`MUSÉE RÉGIONAL D'ARCHÉOLOGIE SOUS-MARINE — RÈGLEMENT DES EXPOSITIONS

Conditions de visite :
Les collections permanentes sont accessibles au public du mardi au dimanche de 10 h à 18 h. Fermé les lundis et jours fériés. Dernier accès à 17 h 30.

Conditions de conservation :
Afin de préserver les objets exposés, la photographie au flash est strictement interdite. La photographie sans flash est autorisée pour un usage personnel uniquement. Les sacs à dos doivent être déposés aux vestiaires (gratuit). Les boissons et aliments sont interdits dans les salles d'exposition.

Accès aux expositions temporaires :
Les expositions temporaires font l'objet d'un billet séparé. Le billet combiné (permanente + temporaire) est disponible à l'accueil avec une réduction de 20 %.

Visites guidées :
Sur réservation uniquement, les visites guidées sont disponibles pour les groupes de 10 personnes minimum. Tarif groupe : 7 €/personne. Audioguide disponible en 6 langues : 3 €.`,
    question: "Selon ce règlement, que doit faire un visiteur qui souhaite photographier une pièce exposée ?",
    optionA: "Demander une autorisation écrite à l'accueil.",
    optionB: "Utiliser son appareil photo sans flash pour un usage personnel uniquement.",
    optionC: "Payer un droit de photographie supplémentaire.",
    optionD: "Attendre les horaires de visite photographique spécialement autorisés.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce cours design intérieur
  qs.push(q(4, 'Q1-7', null, {
    longText:
`FORMATION PROFESSIONNELLE — DESIGN D'INTÉRIEUR BIOPHILIQUE

Vous êtes décorateur(trice), architecte d'intérieur ou passionné(e) de design ?
Découvrez la tendance du moment : intégrer la nature dans les espaces de vie !

Contenu de la formation (3 jours) :
• Principes du design biophilique et bénéfices prouvés sur le bien-être
• Végétalisation intérieure : murs végétaux, jardins suspendus, terrarium
• Matériaux naturels : bois, pierre, bambou, lin, ratan
• Lumière naturelle : optimisation et compléments d'éclairage warm
• Projets pratiques : transformation d'un espace de bureau et d'un appartement

Formateur : Arnaud Lecomte, architecte DPLG certifié DBC
Dates : 14, 15 et 16 avril 2026 — Atelier Design, Paris 11e
Tarif : 990 € HT (financement CPF accepté)

Renseignements : formation@designbiophilique.fr`,
    question: "Ce document est…",
    optionA: "une publicité pour des plantes d'intérieur.",
    optionB: "une petite annonce pour une formation en design d'intérieur biophilique.",
    optionC: "un article sur les tendances décoration de l'année.",
    optionD: "une offre d'emploi pour un architecte d'intérieur.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi station météo personnelle
  qs.push(q(5, 'Q1-7', null, {
    longText:
`STATION MÉTÉO CONNECTÉE WEATHERPRO 7 — MISE EN SERVICE

INSTALLATION :
1. Placez le capteur extérieur à l'ombre, à 1,5 m minimum du sol, hors des courants d'air directs.
2. Branchez la console intérieure sur secteur ou insérez 4 piles AA.
3. La console et le capteur se synchronisent automatiquement en 5 minutes (LED clignote).

LECTURES DISPONIBLES :
• Température intérieure et extérieure (°C/°F)
• Humidité relative (%)
• Pression atmosphérique (hPa) avec tendance (flèches)
• Prévisions locales 24 h (icônes météo automatiques)
• Aube et crépuscule selon votre géolocalisation

CONNEXION WI-FI : configurez via l'application WeatherPro (iOS/Android) pour accéder à l'historique 30 jours et aux alertes météo personnalisées.

⚠ Ne pas exposer la console au soleil direct. Recalibrer après chaque changement de pile.`,
    question: "D'après ce document, comment la console et le capteur se connectent-ils entre eux ?",
    optionA: "En les reliant par un câble fourni dans la boîte.",
    optionB: "En les configurant manuellement via l'application smartphone.",
    optionC: "Automatiquement en 5 minutes, indiqué par une LED clignotante.",
    optionD: "En entrant un code d'appairage unique imprimé sous la console.",
    correctAnswer: 'C',
  }));

  // Q6 — Communiqué banque centrale
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — BANQUE CENTRALE EUROPÉENNE (BCE)
Décision de politique monétaire — Réunion du Conseil des gouverneurs

À l'issue de sa réunion de politique monétaire, le Conseil des gouverneurs de la BCE a décidé de maintenir ses taux directeurs inchangés pour le sixième mois consécutif :
• Taux de dépôt : 3,25 %
• Taux de refinancement principal : 3,40 %
• Taux de prêt marginal : 3,65 %

Cette décision s'appuie sur l'analyse selon laquelle l'inflation dans la zone euro se rapproche durablement de l'objectif de 2 % à moyen terme, tout en tenant compte des incertitudes persistantes sur la croissance économique mondiale.

La BCE continue de surveiller attentivement l'évolution de l'inflation, des conditions de financement et de la transmission de la politique monétaire dans l'économie. Elle reste prête à ajuster ses instruments si nécessaire pour garantir le retour durable de l'inflation à sa cible.

Prochaine réunion de politique monétaire : dans six semaines.`,
    question: "Ce communiqué annonce principalement…",
    optionA: "une hausse des taux directeurs pour lutter contre l'inflation.",
    optionB: "le maintien des taux directeurs de la BCE inchangés.",
    optionC: "une baisse des taux pour stimuler la croissance économique.",
    optionD: "la création d'un nouveau fonds de soutien aux banques en difficulté.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation fouille archéologique subaquatique
  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — JOURNÉE PORTES OUVERTES ARCHÉOLOGIE SOUS-MARINE

Le DRASSM (Département des Recherches Archéologiques Subaquatiques) vous invite à découvrir ses activités lors d'une journée exceptionnelle.

Samedi 7 juin 2025 — Port de La Ciotat — Quai des Archéologues

Programme :
• 10 h — Présentation des fouilles en cours (épave du XVIIe siècle)
• 11 h — Démonstration de plongée archéologique en bassin (gratuite)
• 14 h — Exposition : « 5 000 ans de navigation en Méditerranée »
• 15 h — Conférence : « Les nouvelles technologies au service du patrimoine immergé »
• 16 h — Visite du laboratoire de conservation des objets submergés

Entrée gratuite sur inscription : drassm.fr
Transport maritime depuis le quai central toutes les 30 minutes`,
    question: "Quel est le but principal de ce document ?",
    optionA: "Annoncer le recrutement de plongeurs archéologues.",
    optionB: "Inviter le public à une journée de découverte de l'archéologie sous-marine.",
    optionC: "Présenter les résultats scientifiques des fouilles de l'année.",
    optionD: "Promouvoir des cours de plongée pour le grand public.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "En météorologie, un ___ est une zone de hautes pressions atmosphériques associée à un temps stable et ensoleillé, contrairement à la ___ qui apporte pluies et perturbations.",
    question: PHRASE_Q,
    optionA: "anticyclone → dépression",
    optionB: "cyclone → perturbation",
    optionC: "front chaud → front froid",
    optionD: "alizé → mousson",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Au théâtre, un acteur spécialisé dans les personnages comiques muets est un ___, tandis qu'un comédien portant un nez rouge jouant sur le comique de situation est un ___ de cirque ou de théâtre.",
    question: PHRASE_Q,
    optionA: "tragédien → bouffon",
    optionB: "mime → clown",
    optionC: "marionnettiste → funambule",
    optionD: "illusionniste → magicien",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "En droit bancaire, un ___ immobilier est garanti par une ___ sur le bien financé, ce qui permet à la banque de saisir le bien en cas de non-remboursement.",
    question: PHRASE_Q,
    optionA: "prêt → hypothèque",
    optionB: "crédit → cautionnement",
    optionC: "emprunt → nantissement",
    optionD: "financement → saisie",
    correctAnswer: 'A',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le ___ est un poisson d'eau douce ou de mer fumé et tranché, considéré comme une spécialité emblématique de la cuisine scandinave, notamment consommé avec de l'___ et du pain croustillant.",
    question: PHRASE_Q,
    optionA: "gravlax → aneth",
    optionB: "hareng → citron",
    optionC: "saumon → crème",
    optionD: "maquereau → moutarde",
    correctAnswer: 'A',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "En surf de compétition, un ___ est une vague dont la lèvre se referme en formant un cylindre d'eau creux autour du surfeur, offrant la sensation la plus intense et la plus cotée par les juges.",
    question: PHRASE_Q,
    optionA: "floater",
    optionB: "barrel",
    optionC: "snap",
    optionD: "cutback",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "En archéologie, la ___ est la méthode qui consiste à étudier les couches successives de terrain pour établir une ___ relative des objets découverts, les couches les plus profondes étant généralement les plus anciennes.",
    question: PHRASE_Q,
    optionA: "photogrammétrie → cartographie",
    optionB: "dendrochronologie → datation",
    optionC: "stratigraphie → chronologie",
    optionD: "prospection → classification",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "L'archéologie sous-marine connaît une révolution technologique grâce au développement du [14] à balayage latéral, qui permet de cartographier le fond marin et de détecter des épaves à grande profondeur sans plongée. Les sites découverts sont ensuite étudiés dans leur milieu [15], car l'absence d'oxygène a souvent préservé des matériaux organiques pendant des millénaires.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Épaves et archéologie sous-marine',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "radar",
    optionB: "sonar",
    optionC: "télescope",
    optionD: "satellite",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Épaves et archéologie sous-marine',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "artificiel",
    optionB: "marin",
    optionC: "anaérobie",
    optionD: "profond",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Le design biophilique répond à un besoin fondamental de l'être humain : maintenir un lien avec la nature même en milieu urbain. L'intégration de murs végétaux, de matériaux naturels et de la [16] d'espaces verts dans les bureaux améliore significativement la [17] des employés, selon plusieurs études menées dans des entreprises du secteur technologique.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Design biophilique et bien-être en entreprise',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "destruction",
    optionB: "végétalisation",
    optionC: "numérisation",
    optionD: "climatisation",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Design biophilique et bien-être en entreprise',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "rémunération",
    optionB: "présence",
    optionC: "productivité",
    optionD: "ancienneté",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel phénomène météorologique est un système orageux rotatif pouvant produire des tornades et de la grêle massive ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quelle cuisine nordique est basée sur l'agneau, le poisson séché et les produits géothermaux comme le skyr ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel procédé bancaire transforme des créances bancaires en titres financiers négociables sur les marchés ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quelle pratique consiste à surfer les vagues en utilisant uniquement son corps comme planche, sans aucun équipement flottant ?",
    optionA: "Type 1",
    optionB: "Type 2",
    optionC: "Type 3",
    optionD: "Type 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Le spot A présente les conditions optimales pour le surf de compétition de novembre à mars avec des vagues régulièrement supérieures à 3 mètres. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Contrat de prêt immobilier — Caisse Régionale du Crédit Populaire",
    longText: DOC_PRET_BANCAIRE,
    question: "Ce contrat de prêt immobilier concerne…",
    optionA: "un prêt à la consommation pour financer des travaux de rénovation.",
    optionB: "un crédit immobilier sur 20 ans à taux fixe avec hypothèque.",
    optionC: "un prêt professionnel pour l'achat d'un local commercial.",
    optionD: "un microcrédit accordé à une association.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Contrat de prêt immobilier — Caisse Régionale du Crédit Populaire",
    longText: DOC_PRET_BANCAIRE,
    question: "Quelle condition doit être remplie pour que ce contrat de prêt prenne effet ?",
    optionA: "L'emprunteur doit ouvrir un compte courant dans l'établissement prêteur.",
    optionB: "Le bien doit être assuré avant le déblocage des fonds.",
    optionC: "Un permis de construire valide et l'acte authentique chez le notaire doivent être obtenus.",
    optionD: "L'emprunteur doit justifier de deux années de revenus stables.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Archéologue sous-marin(e) — DRASSM",
    longText: DOC_ARCHEOLOGUE,
    question: "Quel diplôme de plongée est exigé dans cette offre d'emploi ?",
    optionA: "Brevet de plongée loisir niveau 1.",
    optionB: "Certificat de plongée professionnelle SCAPHANDRIER N2 minimum.",
    optionC: "Diplôme de moniteur fédéral de plongée.",
    optionD: "Aucune qualification de plongée n'est mentionnée.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Archéologue sous-marin(e) — DRASSM",
    longText: DOC_ARCHEOLOGUE,
    question: "Quel type de contrat est proposé pour ce poste ?",
    optionA: "CDI statut fonctionnaire titulaire.",
    optionB: "CDD de 6 mois renouvelable une fois.",
    optionC: "Poste de chercheur contractuel de 2 ans renouvelables.",
    optionD: "Mission de conseil en prestation de service indépendant.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de mise à disposition artistique — Théâtre de la Marelle / Rectorat",
    longText: DOC_THEATRE_JEUNE,
    question: "Cette convention organise principalement…",
    optionA: "la création d'une nouvelle pièce de théâtre par des élèves.",
    optionB: "une tournée scolaire de spectacle jeune public dans les établissements.",
    optionC: "la formation des enseignants aux arts du spectacle vivant.",
    optionD: "l'achat de matériel scénique pour les écoles du département.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de mise à disposition artistique — Théâtre de la Marelle / Rectorat",
    longText: DOC_THEATRE_JEUNE,
    question: "Que se passe-t-il si un établissement annule la représentation moins de 15 jours avant ?",
    optionA: "La représentation est reportée à la date suivante disponible.",
    optionB: "L'établissement paie 50 % du tarif de la représentation.",
    optionC: "La compagnie n'est pas dédommagée pour les annulations tardives.",
    optionD: "L'établissement paye la totalité du tarif à titre pénalité.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement de sécurité — Championnat régional de surf Côte Basque",
    longText: DOC_SURF,
    question: "Ce règlement présente principalement…",
    optionA: "les résultats et classements du dernier championnat.",
    optionB: "les conditions météo, équipements obligatoires et système de notation.",
    optionC: "les qualifications requises pour participer à une compétition de surf.",
    optionD: "le programme des compétitions pour la saison entière.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement de sécurité — Championnat régional de surf Côte Basque",
    longText: DOC_SURF,
    question: "Comment le score d'une session est-il calculé selon ce règlement ?",
    optionA: "La moyenne de toutes les vagues surfées pendant la session.",
    optionB: "Le score le plus élevé multiplié par un coefficient de difficulté.",
    optionC: "Le meilleur score et le second meilleur score additionnés (maximum 20 points).",
    optionD: "Le total de toutes les vagues évaluées divisé par le nombre de juges.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide professionnel — Certification Décorateur d'Intérieur Biophilique",
    longText: DOC_DESIGN_INTERIEUR,
    question: "Ce document décrit principalement…",
    optionA: "les tendances du design intérieur pour la saison actuelle.",
    optionB: "les critères pour obtenir la certification de design biophilique.",
    optionC: "les tarifs pratiqués par les décorateurs d'intérieur certifiés.",
    optionD: "les formations disponibles pour devenir décorateur d'intérieur.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide professionnel — Certification Décorateur d'Intérieur Biophilique",
    longText: DOC_DESIGN_INTERIEUR,
    question: "Combien d'heures de formation continue faut-il suivre annuellement pour maintenir la certification DBC ?",
    optionA: "5 heures par an.",
    optionB: "15 heures par an.",
    optionC: "40 heures par an.",
    optionD: "Les heures ne sont pas précisées dans le guide.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Prévision météorologique et catastrophes naturelles : sauver des vies par l'anticipation",
    longText: ART_METEO,
    question: "Selon cet article, quels sont les trois piliers de la révolution en prévision météorologique ?",
    optionA: "Les satellites, les bulletins météo télévisés et les stations automatiques.",
    optionB: "La puissance de calcul, le réseau d'observations mondial et l'apprentissage machine.",
    optionC: "Les modèles physiques, les données historiques et les prévisions saisonnières.",
    optionD: "Les météorologues, les radiosondages et les bouées océaniques.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Prévision météorologique et catastrophes naturelles : sauver des vies par l'anticipation",
    longText: ART_METEO,
    question: "De combien le nombre de victimes de cyclones bien prévenus a-t-il chuté en cinquante ans ?",
    optionA: "De 40 %.",
    optionB: "De 60 %.",
    optionC: "De 80 %.",
    optionD: "De 90 %.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Archéologie sous-marine et patrimoine immergé : les trésors cachés des fonds marins",
    longText: ART_ARCHEOLOGIE_MARINE,
    question: "Selon cet article, quelle convention internationale affirme que le patrimoine sous-marin doit rester in situ ?",
    optionA: "La Convention de Genève sur la haute mer de 1958.",
    optionB: "Le Traité de Montego Bay sur le droit de la mer de 1982.",
    optionC: "La Convention de l'UNESCO de 2001 sur la protection du patrimoine culturel subaquatique.",
    optionD: "La Directive européenne sur la préservation des épaves historiques de 2005.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Archéologie sous-marine et patrimoine immergé : les trésors cachés des fonds marins",
    longText: ART_ARCHEOLOGIE_MARINE,
    question: "Pourquoi les matériaux organiques sont-ils parfois exceptionnellement bien conservés dans les épaves ?",
    optionA: "Parce que la pression de l'eau les cristallise et les durcit naturellement.",
    optionB: "Parce que le sel marin agit comme un conservateur naturel très puissant.",
    optionC: "Parce que le milieu anaérobie (sans oxygène) empêche leur décomposition.",
    optionD: "Parce que les courants froids des profondeurs ralentissent la dégradation.",
    correctAnswer: 'C',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Crises bancaires mondiales et nouvelles régulations : tirer les leçons de 2008",
    longText: ART_CRISE_BANCAIRE,
    question: "Selon cet article, quelle expression désigne les banques jugées trop importantes pour être laissées faire faillite ?",
    optionA: "« Banques systémiques d'importance mondiale ».",
    optionB: "« Too big to fail » (trop importantes pour faire faillite).",
    optionC: "« Établissements financiers d'intérêt général ».",
    optionD: "« Banques de référence à capital garanti ».",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Crises bancaires mondiales et nouvelles régulations : tirer les leçons de 2008",
    longText: ART_CRISE_BANCAIRE,
    question: "Quelles nouvelles zones de risque potentiel sont mentionnées dans l'article comme préoccupations actuelles ?",
    optionA: "Les guerres commerciales et les sanctions économiques internationales.",
    optionB: "Les cryptomonnaies, le shadow banking et les marchés immobiliers surchauffés.",
    optionC: "Les faillites d'États souverains et les crises de change émergentes.",
    optionD: "La pénurie de liquidités et le retrait des investisseurs institutionnels.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le surf et la culture polynésienne : aux origines d'un sport mondial",
    longText: ART_SURF,
    question: "Selon cet article, qui est à l'origine de la renaissance du surf au début du XXe siècle ?",
    optionA: "Les premières compétitions organisées en Californie par des surfeurs australiens.",
    optionB: "Le nageur olympique hawaïen Duke Kahanamoku lors de tournées de démonstration.",
    optionC: "Les marins français qui ont redécouvert la pratique à Tahiti en 1905.",
    optionD: "L'industrie du cinéma californien qui a popularisé l'image du surfeur.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le surf et la culture polynésienne : aux origines d'un sport mondial",
    longText: ART_SURF,
    question: "L'auteur décrit la diffusion mondiale du surf comme « ambivalente ». Pourquoi ?",
    optionA: "Parce que le surf est devenu un sport olympique tout en perdant son caractère compétitif.",
    optionB: "Parce que l'héritage polynésien est célébré mais aussi commercialisé au détriment des communautés d'origine.",
    optionC: "Parce que les surfeurs professionnels rejettent les traditions polynésiennes pour des raisons commerciales.",
    optionD: "Parce que le surf s'est développé en Europe au détriment de sa pratique dans le Pacifique.",
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
    console.log(`\n✅ ${created} questions créées pour CE 49.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
