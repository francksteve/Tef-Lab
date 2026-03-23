'use strict';
/**
 * seed-ce-serie50.js
 * Peuple la série CE 50 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie50.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyomyc001a0wxle3t22z17';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART, fréquentation médiathèques ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [90, 65, 40, 30], color: '#E30613' },
    { label: 'Graphique 2', data: [55, 70, 60, 50], color: '#E30613' },
    { label: 'Graphique 3', data: [75, 55, 68, 45], color: '#E30613' },
    { label: 'Graphique 4', data: [85, 60, 45, 78], color: '#003087' }, // CORRECT
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Livres', 'Médias', 'Internet', 'Ateliers'];
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
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Fréquentation (indice)</text>`;
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
  { title: 'Système 1', content: "Régime présidentiel : système politique où le président est élu directement par le peuple et dispose de l'essentiel du pouvoir exécutif. Il nomme et révoque les membres du gouvernement sans approbation parlementaire obligatoire. Séparation stricte des pouvoirs entre exécutif et législatif. Exemple : États-Unis, Mexique, Brésil." },
  { title: 'Système 2', content: "Régime semi-présidentiel : système politique où le président élu au suffrage universel direct détient des pouvoirs exécutifs partagés avec un premier ministre issu de la majorité parlementaire. En cas de cohabitation, le premier ministre dirige le gouvernement. Exemples : France, Portugal, Finlande, Roumanie." },
  { title: 'Système 3', content: "Régime parlementaire : système dans lequel le gouvernement est responsable devant le parlement, qui peut le renverser par un vote de censure. Le chef de gouvernement (premier ministre ou chancelier) est issu de la majorité parlementaire. Le chef d'État (monarque ou président) a un rôle essentiellement symbolique. Exemples : Royaume-Uni, Allemagne, Italie." },
  { title: 'Système 4', content: "Régime d'assemblée : système dans lequel l'assemblée législative concentre la quasi-totalité des pouvoirs, contrôlant étroitement l'exécutif qui ne peut agir sans son approbation continue. Le gouvernement est un simple comité exécutif de l'assemblée. Rarissime dans les démocraties modernes. Exemple historique : Troisième République française." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Style 1', content: "Origami traditionnel (Nihon no origami) : technique japonaise classique de pliage de papier carré en une seule feuille, sans coupures ni colle. Modèles emblématiques : grue (tsuru), grenouille, fleur de lotus. Pratique millénaire codifiée au XIXe siècle. Apprentissage par transmission orale et visuelle des diagrammes." },
  { title: 'Style 2', content: "Origami modulaire : technique avancée créant des formes tridimensionnelles complexes par assemblage de multiples unités pliées identiques (modules). Chaque module est plié séparément selon un schéma simple, puis assemblé sans colle dans une structure géométrique. Boules kusudama, polyèdres de Sonobe sont des exemples caractéristiques." },
  { title: 'Style 3', content: "Kirigami : art japonais dérivé de l'origami intégrant des découpes au ciseau dans le papier plié pour créer des effets tridimensionnels à l'ouverture. Utilisé dans les cartes pop-up, les décorations de Noël et les livres animés pour enfants. Le mot kirigami vient de kiru (couper) et kami (papier)." },
  { title: 'Style 4', content: "Wet folding : technique d'origami développée par le maître Akira Yoshizawa consistant à humidifier légèrement le papier avant le pliage pour permettre des courbes organiques et des formes sculptées réalistes. Utilisé pour créer des animaux avec des poses naturelles. Nécessite du papier épais de qualité artistique." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Certification 1', content: "Label Agriculture Biologique (AB) : label officiel français et européen garantissant que les produits ont été cultivés sans pesticides de synthèse, sans engrais chimiques et sans OGM. Contrôle par organisme certificateur agréé. Au moins 95 % des ingrédients agricoles doivent être biologiques pour utiliser le logo." },
  { title: 'Certification 2', content: "Label AOC (Appellation d'Origine Contrôlée) : appellation d'origine contrôlée garantissant que la production, la transformation et l'élaboration d'un produit se réalisent dans une aire géographique déterminée selon un savoir-faire reconnu. Exemples : vin de Bordeaux, camembert de Normandie, Roquefort. Protégée par l'AOP au niveau européen." },
  { title: 'Certification 3', content: "Label Rouge : signe officiel français attestant qu'un produit alimentaire (volaille, jambon, charcuterie, poisson) possède des caractéristiques spécifiques qui l'distinguent des produits similaires en termes de qualité gustative supérieure. Contrôle régulier par un organisme indépendant. Environ 500 produits certifiés." },
  { title: 'Certification 4', content: "Indication Géographique Protégée (IGP) : signe européen désignant un produit dont la production, la transformation ou l'élaboration a lieu dans une région spécifique, lui conférant une qualité ou réputation liée à cette origine. Moins contraignant que l'AOP car seule une partie du processus doit être locale." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Risque 1', content: "Risque industriel majeur : accident susceptible de provoquer une catastrophe à grande échelle sur un site industriel (explosion, incendie, émission toxique). Réglementé par la directive Seveso en Europe. Les établissements Seveso seuil haut sont soumis à plans de prévention, études de dangers et information obligatoire des riverains." },
  { title: 'Risque 2', content: "Risque naturel : aléa naturel pouvant causer des dommages humains et matériaux importants (séisme, inondation, glissement de terrain, avalanche, cyclone). Cartographié par les Plans de Prévention des Risques Naturels (PPRN). Les communes exposées ont des obligations d'information et de construction parasismique ou antiinondation." },
  { title: 'Risque 3', content: "Risque NRBC (Nucléaire, Radiologique, Biologique, Chimique) : risque d'attentat ou d'accident impliquant des agents de destruction massive — virus dangereux, agents chimiques, matières radioactives ou nucléaires. Nécessite des protocoles de sécurité spéciaux et des équipements de protection individuels renforcés pour les secouristes." },
  { title: 'Risque 4', content: "Risque cyber : menace liée aux cyberattaques pouvant paralyser des infrastructures critiques (hôpitaux, centrales électriques, systèmes de transport). En augmentation constante depuis 2015. L'ANSSI coordonne la réponse française. Les entreprises opérant des infrastructures critiques ont des obligations de sécurité renforcées et de signalement d'incidents." },
]);

/* ── Documents Q23-32 ── */
const DOC_MEDIATHEQUE =
`MÉDIATHÈQUE NUMÉRIQUE DU GRAND BASSIN — CONDITIONS D'ACCÈS

L'accès à la médiathèque numérique est réservé aux résidents du Grand Bassin intercommunal inscrits à la médiathèque physique ou en ligne.

ABONNEMENT NUMÉRIQUE :
- Formule gratuite : 5 livres numériques + 2 films en streaming par mois
- Formule Premium (4,90 €/mois) : accès illimité livres, films, presse numérique et musique
- Accès presse (1,50 €/mois) : 200 titres de presse nationale et internationale

CONDITIONS D'UTILISATION :
Les contenus téléchargés sont accessibles 21 jours après emprunt numérique. Chaque contenu peut être lu sur 3 appareils maximum liés au compte. La revente ou le partage hors famille est interdit et constitue une violation des droits d'auteur.

APPLI DISPONIBLE : téléchargeable sur App Store et Google Play (médiathèque-grdbas)

Toute réclamation : serviceclient@mediatheque-grdbas.fr`;

const DOC_PILOTE =
`OFFRE D'EMPLOI — PILOTE COMMERCIAL LONG COURRIER
Compagnie AéroCap — Base Paris-Charles de Gaulle

AéroCap, compagnie aérienne européenne en forte croissance, recrute des pilotes commandants de bord (CDB) et copilotes pour ses lignes long courrier.

QUALIFICATIONS REQUISES POUR LE POSTE DE CDB :
- Licence ATPL(A) en cours de validité
- Minimum 5 000 heures de vol en ligne (dont 1 500 heures en qualité de commandant de bord)
- Qualification de type sur A330 ou A350 (ou formation de conversion prise en charge)
- Visite médicale Classe 1 valide
- Maîtrise de l'anglais aéronautique (ICAO niveau 4 minimum)
- Aptitude au travail en équipe et gestion des ressources de l'équipage (CRM)

AVANTAGES :
Salaire de base : 9 500 € à 13 000 €/mois selon expérience. Indemnités de déplacement, logement à l'escale, mutuelle famille prise en charge à 90 %.

Candidatures sur aerocap-recrutement.fr`;

const DOC_MARCHE_LOCAL =
`CONVENTION DE MARCHÉ LOCAL — COMMUNE DE SAINT-AUBIN-LES-PRÉS
ET GROUPEMENT DE PRODUCTEURS LOCAUX « TERROIR DIRECT »

Article 1 — Objet
La commune de Saint-Aubin-les-Prés autorise le groupement Terroir Direct à organiser un marché de producteurs locaux chaque samedi matin de 8 h à 13 h sur la Place de la Mairie, du 1er mars au 30 novembre de chaque année.

Article 2 — Conditions d'accès pour les producteurs
Peuvent participer uniquement les producteurs dont l'exploitation est située à moins de 80 km de la commune. Chaque producteur doit présenter ses productions en direct (pas de revendeurs). Maximum 30 stands par marché.

Article 3 — Redevance
Une redevance de 15 €/stand/marché est versée à la commune pour l'utilisation de l'espace public.

Article 4 — Obligations de la commune
La commune assure la mise à disposition de l'espace, le nettoyage après chaque marché et la signalétique routière directionnelle.`;

const DOC_HANDBALL =
`RÈGLEMENT TECHNIQUE — CHAMPIONNAT NATIONAL DE HANDBALL

Article 8 — Règles d'arbitrage et de comportement
Les deux arbitres officiels ont autorité exclusive pendant le temps de jeu. Leurs décisions sont finales et non contestables pendant la rencontre. Toute protestation verbale ou gestuelle envers les arbitres est sanctionnée par un avertissement progressif (carton jaune, exclusion 2 minutes, disqualification).

Article 9 — Système de points
Une victoire donne 2 points, un match nul donne 1 point, une défaite donne 0 point. En cas d'égalité au classement, le critère de départage est : 1) confrontations directes, 2) différence de buts, 3) meilleure attaque.

Article 10 — Suspension des joueurs
Tout joueur cumulant 3 suspensions de 2 minutes dans la même rencontre est définitivement exclu (carton rouge) et ne peut être remplacé pour les 5 dernières minutes de jeu si l'exclusion intervient dans ce laps de temps. Une exclusion définitive entraîne une suspension automatique de 1 match.`;

const DOC_AMDEC =
`NOTE TECHNIQUE — MÉTHODE D'ANALYSE DES RISQUES AMDEC
Direction Qualité et Sécurité Industrielle

L'AMDEC (Analyse des Modes de Défaillances, de leurs Effets et de leur Criticité) est une méthode systématique d'analyse préventive des risques dans les systèmes industriels.

PRINCIPE :
Pour chaque composant ou processus, l'équipe d'analyse identifie :
1. Les modes de défaillance possibles (comment le composant peut-il tomber en panne ?)
2. Les effets de chaque défaillance sur le système global
3. Les causes probables de défaillance
4. Les mesures de détection en place

CALCUL DE LA CRITICITÉ :
Criticité = Fréquence (1-10) × Gravité (1-10) × Non-détection (1-10)
Une criticité supérieure à 100 déclenche obligatoirement un plan d'action correctif.

DOCUMENTATION :
Les résultats sont consignés dans un tableau AMDEC mis à jour à chaque révision du système. Document vivant, révisable lors de toute modification significative de l'équipement ou du processus.`;

/* ── Articles de presse Q33-40 ── */
const ART_REFORME_CONSTITUTIONNELLE =
`RÉFORME CONSTITUTIONNELLE ET DÉMOCRATIE : LES LIMITES DU POUVOIR CONSTITUANT

Les réformes constitutionnelles font partie de la vie politique normale des démocraties. Mais leur fréquence, leur ampleur et les procédures employées révèlent souvent la santé des institutions et la vigueur de la culture démocratique d'un pays. Quand un gouvernement modifie la constitution pour consolider son propre pouvoir plutôt que pour renforcer les droits des citoyens, les garde-fous institutionnels deviennent essentiels.

Les constitutionnalistes distinguent deux grandes catégories de réformes. Les premières visent à adapter les institutions à des réalités nouvelles — révolutions technologiques, évolutions sociétales, défis environnementaux — en préservant ou renforçant les équilibres démocratiques fondamentaux. Les secondes, plus problématiques, visent à contourner les contre-pouvoirs, à étendre la durée des mandats ou à réduire l'indépendance de la justice.

La France, qui a révisé sa constitution une trentaine de fois depuis 1958, illustre cette tension. La plupart des révisions ont été techniques ou institutionnelles (loi organique sur le quinquennat, introduction de la question prioritaire de constitutionnalité). Mais certaines propositions récentes, notamment sur le référendum d'initiative partagée ou la réforme du Sénat, ont soulevé des controverses sur l'équilibre des pouvoirs entre les institutions.

La démocratie directe, sous forme de référendum, est souvent présentée comme un antidote aux dérives représentatives. Mais les expériences récentes — Brexit en 2016, référendums hongrois ou polonais — montrent que cet instrument peut aussi être utilisé de manière plébiscitaire, transformant une consultation démocratique en outil de légitimation d'un pouvoir autoritaire.`;

const ART_CIRCUITS_COURTS =
`CIRCUITS COURTS ALIMENTAIRES ET EMPLOI RURAL : UNE FILIÈRE EN PLEINE EXPANSION

La demande croissante des consommateurs pour des produits frais, locaux et traçables a donné un élan considérable aux circuits courts alimentaires au cours de la dernière décennie. Ces canaux de commercialisation, qui limitent les intermédiaires entre producteur et consommateur à un seul au maximum, représentent aujourd'hui près de 20 % des achats alimentaires en France selon les dernières données de FranceAgriMer.

L'impact sur l'emploi rural est particulièrement significatif. Contrairement aux filières longues où la valeur ajoutée se concentre dans la transformation et la grande distribution, les circuits courts permettent aux agriculteurs de capter une part beaucoup plus importante du prix de vente final. Des études économiques montrent qu'un euro dépensé dans un circuit court génère 1,8 fois plus d'emplois locaux qu'un euro dépensé en grande surface.

Les formes prises par ces circuits sont multiples : marchés de producteurs, AMAP (Associations pour le Maintien d'une Agriculture Paysanne), vente directe à la ferme, paniers livrés à domicile, épiceries coopératives. La crise sanitaire de 2020 a provoqué un bond spectaculaire de la vente directe en ligne, avec une progression de +80 % en quelques mois pour certains producteurs.

Des défis demeurent cependant. La logistique représente un coût important pour les petits producteurs qui ne peuvent pas assurer eux-mêmes la livraison à domicile. Les plateformes numériques de mise en relation producteurs-consommateurs ont partiellement résolu ce problème, mais leur modèle économique reste précaire. La question de l'accessibilité sociale des circuits courts — souvent plus chers que la grande distribution — est également posée avec acuité.`;

const ART_AVIATION_DURABLE =
`AVIATION DURABLE ET CARBURANTS ALTERNATIFS : UNE RÉVOLUTION EN MARCHE

Le transport aérien mondial représente environ 2,5 % des émissions mondiales de CO2, un chiffre modeste en valeur absolue mais croissant à mesure que le trafic aérien mondial double tous les quinze ans. Sous la pression des réglementations environnementales et des attentes sociétales croissantes, l'industrie aéronautique s'est engagée dans une transformation profonde visant la neutralité carbone d'ici 2050.

Plusieurs technologies concurrentes émergent simultanément. Les carburants d'aviation durables (SAF — Sustainable Aviation Fuels), produits à partir de déchets agricoles, d'huiles usagées ou de biomasse, peuvent être utilisés directement dans les moteurs actuels sans modification. Leur empreinte carbone est réduite de 50 à 80 % par rapport au kérosène fossile, mais leur coût de production reste deux à cinq fois supérieur. L'Union Européenne a fixé des quotas obligatoires croissants de SAF dans les aéroports européens : 2 % en 2025, 6 % en 2030, 70 % en 2050.

L'aviation à hydrogène, portée notamment par Airbus avec son projet ZEROe, promet des avions à zéro émission directe mais nécessite une révolution technique (nouveaux moteurs, réservoirs cryogéniques) et infrastructurelle (production et distribution d'hydrogène vert). Les premiers vols commerciaux sont espérés pour 2035 sur des liaisons court et moyen courrier.

L'aviation électrique, déjà opérationnelle pour des vols très courts (moins de 500 km) avec les modèles actuels de batteries, pourrait révolutionner les liaisons régionales d'ici 2030. Plusieurs startups européennes et américaines développent des modèles commerciaux de 9 à 19 passagers.`;

const ART_HANDBALL =
`LE HANDBALL FRANÇAIS ET LE FINANCEMENT DU SPORT COLLECTIF

L'équipe de France de handball, multiple championne du monde et d'Europe, est souvent citée comme l'exemple par excellence de la réussite d'un modèle sportif fondé sur la formation, la cohésion d'équipe et l'investissement public massif dans les clubs amateurs. Les « Experts », comme on surnomme les handballeurs tricolores, ont remporté 7 championnats du monde et 3 championnats d'Europe entre 1995 et 2021.

Pourtant, le modèle économique du handball professionnel français reste fragile. Les clubs de première division peinent à attirer des sponsors comparables à ceux du football, du rugby ou même du basketball. La Lidl Starligue (championnat professionnel français) génère des revenus télévisuels et de billetterie significativement inférieurs aux championnats espagnol (Liga ASOBAL) ou allemand (Handball-Bundesliga).

Ce paradoxe — excellence sportive malgré des financements limités — s'explique en partie par le rôle central des collectivités territoriales. Les communes et les agglomérations financent les salles de sport, soutiennent les clubs de formation et contribuent parfois directement aux budgets de fonctionnement des clubs professionnels. Cette dépendance aux financements publics rend les clubs vulnérables aux arbitrages budgétaires locaux et limite leur capacité à investir dans des infrastructures modernes.

La Fédération Française de Handball a lancé en 2023 un plan de développement ambitieux visant à doubler les revenus commerciaux du handball professionnel d'ici 2028, en développant notamment l'image du sport à l'international et en multipliant les partenariats avec des entreprises de taille intermédiaire.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Programme médiathèque
  qs.push(q(1, 'Q1-7', null, {
    longText:
`MÉDIATHÈQUE DU GRAND BASSIN — Programme des animations — Printemps 2026

ATELIERS NUMÉRIQUES (sur inscription) :
• Initiation iPad seniors — mercredis 14 h-16 h (à partir du 4 mars)
• Imprimante 3D : initiation — samedis 10 h-12 h (places limitées à 8)
• Création de podcast — vendredis 18 h-20 h (niveau intermédiaire)

CLUB DE LECTURE :
• Club adultes : 1er jeudi du mois à 19 h — Salle Aragon
• Club ados (13-17 ans) : 2e samedi à 14 h 30 — Salle Jeunesse

EXPOSITIONS :
• « Planète en mouvement » (photographies de voyages) — jusqu'au 30 avril
• « L'art du livre illustré » — à partir du 15 mai

CONCERTS (entrée libre) :
• Jazz acoustique : samedi 22 mars à 16 h
• Musiques du monde : dimanche 12 avril à 15 h

Inscription aux ateliers : accueil ou mediatheque-grdbas.fr`,
    question: "D'après ce document, quel atelier numérique est destiné aux seniors ?",
    optionA: "L'atelier de création de podcast.",
    optionB: "L'initiation à l'imprimante 3D.",
    optionC: "L'initiation iPad.",
    optionD: "Le club de lecture adultes.",
    correctAnswer: 'C',
  }));

  // Q2 — Affiche match handball
  qs.push(q(2, 'Q1-7', null, {
    longText:
`LIDL STARLIGUE — HANDBALL PROFESSIONNEL
SAMEDI 8 MARS 2026 — 20 H 30

PARIS HANDBALL vs MONTPELLIER HB

Palais des Sports de Paris — Porte de Pantin

Enjeu : match au sommet pour la tête du classement
Paris : 1er (32 pts) | Montpellier : 2e (30 pts)

BILLETTERIE :
• Tribune latérale : 25 € | Tribune face : 35 € | Carré d'Or : 55 €
• Tarif famille (2 adultes + 2 enfants) : 75 €
• Abonnés : accès gratuit sur présentation de la carte

Portes ouvertes à 19 h 30 | Parking gardé disponible
Animations d'avant-match dès 19 h 45`,
    question: "Ce document est…",
    optionA: "un article de presse relatant les résultats d'un match.",
    optionB: "une affiche de match de handball professionnel avec informations pratiques.",
    optionC: "un règlement de compétition officielle de handball.",
    optionD: "un communiqué du club de Paris Handball.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement circuit court
  qs.push(q(3, 'Q1-7', null, {
    longText:
`MARCHÉ DE PRODUCTEURS LOCAUX — TERROIR DIRECT
Règlement intérieur des exposants

Conditions d'adhésion :
Toute exploitation agricole ou artisanale alimentaire dont le site de production est situé à moins de 80 km du marché peut demander une place d'exposant permanent ou occasionnel.

Obligations des exposants :
• Vente directe uniquement : chaque exposant vend exclusivement ses propres productions. La revente de produits d'autres producteurs est strictement interdite.
• Étiquetage obligatoire : nom et adresse de l'exploitation, dénomination du produit, prix/kg ou prix unitaire clairement affichés.
• Hygiène : respect impératif des normes sanitaires (chaîne du froid pour les produits frais, protections pour les produits en vrac).

Tarif stand : 15 € par marché pour un emplacement standard (3 m × 3 m).

Résiliation : toute infraction aux règles de vente directe entraîne une exclusion immédiate et définitive du marché.`,
    question: "Selon ce règlement, quelle règle de vente est strictement obligatoire ?",
    optionA: "Vendre uniquement des produits issus de l'agriculture biologique.",
    optionB: "Accepter uniquement les paiements par carte bancaire.",
    optionC: "Chaque exposant vend exclusivement ses propres productions.",
    optionD: "Proposer obligatoirement au moins cinq produits différents par stand.",
    correctAnswer: 'C',
  }));

  // Q4 — Petite annonce atelier origami
  qs.push(q(4, 'Q1-7', null, {
    longText:
`ATELIER ORIGAMI ET KIRIGAMI
avec Maître Yuki Tanaka — artiste d'origine japonaise

Découvrez l'art du pliage japonais dans ses différentes formes !

Ateliers proposés (2 h) :
• Origami traditionnel : débutants (grue, poisson, boîte)
• Origami modulaire : niveau intermédiaire (boules kusudama)
• Kirigami : cartes pop-up et décorations
• Origami méditation : séance relaxation et mindfulness

Groupes de 6 à 12 personnes
Tous les dimanches de 10 h à 12 h ou de 14 h à 16 h
Tarif : 25 €/personne (matériel inclus)
Espace Culturel Japon — 45 rue du Louvre, Paris

Renseignements : origami-yuki@ateliers-japon.fr`,
    question: "Ce document est…",
    optionA: "un article sur l'histoire de l'origami au Japon.",
    optionB: "une petite annonce proposant des ateliers d'origami.",
    optionC: "un programme de festival d'art japonais.",
    optionD: "une offre d'emploi pour un animateur d'atelier.",
    correctAnswer: 'B',
  }));

  // Q5 — Mode d'emploi GPS portable aéronautique
  qs.push(q(5, 'Q1-7', null, {
    longText:
`GPS PORTABLE AÉRONAUTIQUE SKYMAP 4 — GUIDE DE DÉMARRAGE RAPIDE

MISE EN ROUTE :
1. Maintenez le bouton POWER 3 secondes pour allumer l'appareil.
2. Attendez l'acquisition GPS (entre 30 secondes et 3 minutes selon les conditions).
3. Vérifiez la date et l'heure UTC affichées — elles se synchronisent automatiquement.

BASES DE DONNÉES :
• Téléchargez les mises à jour des cartes aéronautiques (AIRAC 28 jours) via l'app SkyMap sur votre ordinateur.
• Les bases de données expirent automatiquement : l'appareil affiche une alerte rouge.

NAVIGATION :
• Mode Direct (D→): trajet direct vers un waypoint
• Mode FPL (plan de vol): route définie par étapes
• Altimètre barométrique à calibrer à la pression QNH locale avant chaque vol

⚠ Cet appareil est un outil d'aide à la navigation. Ne constitue pas un substitut aux équipements de bord réglementaires.`,
    question: "D'après ce document, à quelle fréquence les cartes aéronautiques doivent-elles être mises à jour ?",
    optionA: "Annuellement, lors de la révision de l'appareil.",
    optionB: "Tous les 28 jours (AIRAC cycle).",
    optionC: "Uniquement quand une alerte rouge s'affiche sur l'écran.",
    optionD: "La fréquence dépend du pays dans lequel on vole.",
    correctAnswer: 'B',
  }));

  // Q6 — Communiqué politique (réforme constitutionnelle)
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ — CONSEIL CONSTITUTIONNEL

À la suite de la saisine par soixante parlementaires, le Conseil Constitutionnel a rendu sa décision sur la conformité à la Constitution du projet de loi constitutionnelle relatif à l'organisation des pouvoirs locaux.

Le Conseil déclare conformes à la Constitution les articles relatifs au renforcement des compétences des régions en matière de développement économique et de formation professionnelle.

En revanche, le Conseil censure l'article 7 du projet, qui permettait au Président de la République de dissoudre les conseils régionaux sans contre-signature du Premier ministre. Cette disposition portait atteinte au principe d'équilibre des pouvoirs constitutionnellement garanti.

Le projet de loi constitutionnelle, amputé de l'article 7, peut donc être soumis au Congrès pour adoption définitive.

Contact presse : conseil-constitutionnel.fr`,
    question: "Ce communiqué annonce principalement…",
    optionA: "l'adoption complète et sans modification d'une réforme constitutionnelle.",
    optionB: "la censure d'un article d'un projet constitutionnel et la conformité des autres dispositions.",
    optionC: "le rejet total d'une réforme constitutionnelle par le Conseil.",
    optionD: "la convocation d'un référendum sur la réforme des pouvoirs locaux.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation séance publique référendum
  qs.push(q(7, 'Q1-7', null, {
    longText:
`INVITATION — SÉANCE PUBLIQUE D'INFORMATION
Référendum local sur le projet d'aménagement du centre-bourg

Madame, Monsieur,

Dans le cadre du projet de réaménagement de la Place du Marché et des rues adjacentes, la Mairie vous invite à une séance publique d'information et de consultation.

Jeudi 20 mars 2026 à 19 h 00
Salle polyvalente de la Mairie — entrée libre, sans réservation

Au programme :
• Présentation du projet par le cabinet d'architectes (45 min)
• Questions-réponses avec les élus et les techniciens (45 min)
• Vote consultatif par vote secret (bulletins fournis)

Le résultat du vote consultatif guidera la décision finale du Conseil Municipal lors de sa séance du 15 avril.

Tous les habitants de la commune sont invités à participer.
Le Maire — Jean-Pierre Duvallon`,
    question: "Quel est le but principal de cette séance publique ?",
    optionA: "Élire les membres du prochain Conseil Municipal.",
    optionB: "Informer les habitants et recueillir leur avis sur un projet d'aménagement.",
    optionC: "Approuver officiellement le budget municipal de l'année.",
    optionD: "Annoncer les résultats d'un référendum déjà organisé.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "En droit constitutionnel, un ___ est une modification de la loi fondamentale d'un État qui doit généralement être ___ par le parlement à une majorité qualifiée ou par référendum.",
    question: PHRASE_Q,
    optionA: "décret → validé",
    optionB: "traité → signé",
    optionC: "amendement → ratifié",
    optionD: "règlement → approuvé",
    correctAnswer: 'C',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "En origami, chaque ___ de la feuille suit un schéma précis qui définit le ___ final de la création, qu'il s'agisse d'un animal, d'une fleur ou d'une forme géométrique.",
    question: PHRASE_Q,
    optionA: "coupe → résultat",
    optionB: "pliage → modèle",
    optionC: "collage → design",
    optionD: "découpe → patron",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Les marchés de producteurs locaux valorisent les circuits ___, permettant aux consommateurs d'acheter directement auprès des agriculteurs, réduisant ainsi le nombre d'___ dans la chaîne alimentaire.",
    question: PHRASE_Q,
    optionA: "longs → distributeurs",
    optionB: "courts → intermédiaires",
    optionC: "verts → grossistes",
    optionD: "directs → revendeurs",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En handball, le ___ est le joueur qui se poste près du but adverse pour servir de relais aux tirs en pivot, utilisant son gabarit pour créer des décalages dans la défense adverse.",
    question: PHRASE_Q,
    optionA: "ailier",
    optionB: "gardien",
    optionC: "pivot",
    optionD: "demi-centre",
    correctAnswer: 'C',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "En aéronautique, le ___ d'atterrissage doit être sorti et verrouillé avant l'approche finale, le pilote vérifiant son état par les indicateurs de tableau de bord avant de toucher la ___ d'atterrissage.",
    question: PHRASE_Q,
    optionA: "volet → rampe",
    optionB: "carénage → zone",
    optionC: "train → piste",
    optionD: "frein → surface",
    correctAnswer: 'C',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "La méthode de gestion des risques AMDEC identifie les ___ possibles d'un système et évalue leur ___ sur le fonctionnement global, permettant de prioriser les actions préventives.",
    question: PHRASE_Q,
    optionA: "défaillances → impact",
    optionB: "pannes → coût",
    optionC: "anomalies → gravité",
    optionD: "incidents → fréquence",
    correctAnswer: 'A',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La souveraineté alimentaire passe par la relocalisation de la production et la valorisation des produits locaux, souvent désignée par l'expression [14] pour des circuits sans transport sur de longues distances. Cette approche garantit une meilleure [15] des aliments, permettant aux consommateurs de connaître l'origine précise de ce qu'ils achètent.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Souveraineté alimentaire et circuits courts',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "bio et local",
    optionB: "km zéro",
    optionC: "circuit direct",
    optionD: "produit frais",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 1 — Souveraineté alimentaire et circuits courts',
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "fraîcheur",
    optionB: "disponibilité",
    optionC: "traçabilité",
    optionD: "diversité",
    correctAnswer: 'C',
  }));

  const TEXTE_LAC_2 =
    "Dans une démocratie directe, le [16] permet aux citoyens de se prononcer directement sur une question politique ou legislative importante, sans passer par leurs représentants élus. L'[17] populaire, quant à elle, permet à un nombre déterminé de citoyens de proposer directement l'examen d'un texte par le parlement.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Démocratie directe et participation citoyenne',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "suffrage",
    optionB: "référendum",
    optionC: "plébiscite",
    optionD: "scrutin",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: 'Texte lacunaire 2 — Démocratie directe et participation citoyenne',
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "pétition",
    optionB: "candidature",
    optionC: "initiative",
    optionD: "consultation",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel système politique partage le pouvoir exécutif entre un président élu directement et un premier ministre issu du parlement ?",
    optionA: "Système 1",
    optionB: "Système 2",
    optionC: "Système 3",
    optionD: "Système 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel style d'origami crée des formes complexes par assemblage de multiples unités pliées identiques ?",
    optionA: "Style 1",
    optionB: "Style 2",
    optionC: "Style 3",
    optionD: "Style 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quelle certification garantit que la production, la transformation et l'élaboration d'un produit ont lieu dans une aire géographique déterminée selon un savoir-faire reconnu ?",
    optionA: "Certification 1",
    optionB: "Certification 2",
    optionC: "Certification 3",
    optionD: "Certification 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel type de risque implique des agents nucléaires, radiologiques, biologiques et chimiques nécessitant des protocoles de sécurité spéciaux ?",
    optionA: "Risque 1",
    optionB: "Risque 2",
    optionC: "Risque 3",
    optionD: "Risque 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « Les ateliers numériques en médiathèque ont connu la plus forte croissance de fréquentation avec +78 % entre 2020 et 2023, devenant le service le plus demandé après l'emprunt de livres. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'D',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Médiathèque numérique du Grand Bassin — Conditions d'accès",
    longText: DOC_MEDIATHEQUE,
    question: "Ce document présente principalement…",
    optionA: "le catalogue des livres disponibles en format numérique.",
    optionB: "les conditions d'abonnement et d'utilisation de la médiathèque numérique.",
    optionC: "les horaires d'ouverture de la médiathèque physique.",
    optionD: "le règlement intérieur de la médiathèque pour les utilisateurs.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Médiathèque numérique du Grand Bassin — Conditions d'accès",
    longText: DOC_MEDIATHEQUE,
    question: "Combien de temps un contenu téléchargé reste-t-il accessible après l'emprunt numérique ?",
    optionA: "7 jours.",
    optionB: "14 jours.",
    optionC: "21 jours.",
    optionD: "30 jours.",
    correctAnswer: 'C',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Pilote commercial long courrier — AéroCap",
    longText: DOC_PILOTE,
    question: "Cette offre d'emploi concerne des pilotes pour…",
    optionA: "des vols d'entraînement sur simulateur.",
    optionB: "des lignes long courrier d'une compagnie aérienne européenne.",
    optionC: "des activités d'aviation d'affaires pour des clients privés.",
    optionD: "des vols cargo de nuit dans l'Union Européenne.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Pilote commercial long courrier — AéroCap",
    longText: DOC_PILOTE,
    question: "Quel avantage social est mentionné dans cette offre d'emploi ?",
    optionA: "Un logement de fonction fourni par la compagnie à Paris.",
    optionB: "Une voiture de service pour les trajets entre domicile et aéroport.",
    optionC: "Une mutuelle famille prise en charge à 90 %.",
    optionD: "Des vols gratuits pour la famille du pilote deux fois par an.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Convention de marché local — Commune de Saint-Aubin / Terroir Direct",
    longText: DOC_MARCHE_LOCAL,
    question: "Cette convention autorise l'organisation d'un marché de producteurs…",
    optionA: "toute l'année, 7 jours sur 7, sur la place de la mairie.",
    optionB: "du 1er mars au 30 novembre, chaque samedi matin.",
    optionC: "uniquement pendant les mois d'été, du lundi au vendredi.",
    optionD: "les dimanches de mai à septembre, avec 50 stands maximum.",
    correctAnswer: 'B',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Convention de marché local — Commune de Saint-Aubin / Terroir Direct",
    longText: DOC_MARCHE_LOCAL,
    question: "Quelle obligation la commune assume-t-elle selon cette convention ?",
    optionA: "Financer les stands et l'équipement des producteurs.",
    optionB: "Garantir un minimum de 500 visiteurs par marché.",
    optionC: "Assurer la mise à disposition de l'espace, le nettoyage et la signalétique.",
    optionD: "Sélectionner et contrôler les produits vendus par les exposants.",
    correctAnswer: 'C',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement technique — Championnat national de handball",
    longText: DOC_HANDBALL,
    question: "Ce document présente principalement…",
    optionA: "les règles techniques du jeu de handball.",
    optionB: "les règles d'arbitrage, de notation et de suspension des joueurs.",
    optionC: "le programme et le calendrier du championnat national.",
    optionD: "les conditions d'inscription des clubs au championnat.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement technique — Championnat national de handball",
    longText: DOC_HANDBALL,
    question: "Quel est le premier critère de départage en cas d'égalité au classement ?",
    optionA: "La différence de buts sur l'ensemble de la saison.",
    optionB: "Le résultat des confrontations directes entre les équipes concernées.",
    optionC: "La meilleure attaque (nombre de buts marqués).",
    optionD: "Le tirage au sort organisé par la fédération.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note technique — Méthode d'analyse des risques AMDEC",
    longText: DOC_AMDEC,
    question: "Ce document décrit principalement…",
    optionA: "les procédures d'urgence en cas d'accident industriel.",
    optionB: "la méthode AMDEC d'analyse préventive des risques industriels.",
    optionC: "les normes de sécurité obligatoires pour les usines Seveso.",
    optionD: "les formations requises pour les responsables qualité industriels.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note technique — Méthode d'analyse des risques AMDEC",
    longText: DOC_AMDEC,
    question: "Quel seuil de criticité déclenche obligatoirement un plan d'action correctif selon ce document ?",
    optionA: "Une criticité supérieure à 50.",
    optionB: "Une criticité supérieure à 75.",
    optionC: "Une criticité supérieure à 100.",
    optionD: "Toute criticité supérieure à 0.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "Réforme constitutionnelle et démocratie : les limites du pouvoir constituant",
    longText: ART_REFORME_CONSTITUTIONNELLE,
    question: "Selon cet article, quelle distinction les constitutionnalistes font-ils entre deux grandes catégories de réformes ?",
    optionA: "Entre les réformes votées par référendum et celles votées au parlement.",
    optionB: "Entre les réformes qui renforcent les équilibres démocratiques et celles qui contournent les contre-pouvoirs.",
    optionC: "Entre les réformes sociales et les réformes institutionnelles.",
    optionD: "Entre les réformes approuvées par le Conseil Constitutionnel et les autres.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "Réforme constitutionnelle et démocratie : les limites du pouvoir constituant",
    longText: ART_REFORME_CONSTITUTIONNELLE,
    question: "L'auteur présente quel risque associé à l'usage du référendum ?",
    optionA: "Le coût trop élevé de l'organisation des référendums.",
    optionB: "La faible participation des citoyens aux consultations directes.",
    optionC: "Son utilisation plébiscitaire pour légitimer un pouvoir autoritaire.",
    optionD: "La difficulté technique de formuler des questions simples et claires.",
    correctAnswer: 'C',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Circuits courts alimentaires et emploi rural : une filière en pleine expansion",
    longText: ART_CIRCUITS_COURTS,
    question: "Selon cet article, quelle part des achats alimentaires en France représentent les circuits courts ?",
    optionA: "Environ 5 % des achats alimentaires.",
    optionB: "Environ 10 % des achats alimentaires.",
    optionC: "Près de 20 % des achats alimentaires.",
    optionD: "Plus de 30 % des achats alimentaires.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Circuits courts alimentaires et emploi rural : une filière en pleine expansion",
    longText: ART_CIRCUITS_COURTS,
    question: "Quel défi des circuits courts est mentionné comme frein à leur développement ?",
    optionA: "Le manque de qualité des produits vendus directement.",
    optionB: "La réticence des consommateurs à acheter hors grandes surfaces.",
    optionC: "Les coûts logistiques importants pour les petits producteurs.",
    optionD: "L'absence de réglementation sanitaire adaptée aux ventes directes.",
    correctAnswer: 'C',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Aviation durable et carburants alternatifs : une révolution en marche",
    longText: ART_AVIATION_DURABLE,
    question: "Selon cet article, de combien les SAF (carburants durables) réduisent-ils l'empreinte carbone par rapport au kérosène fossile ?",
    optionA: "De 20 à 40 %.",
    optionB: "De 50 à 80 %.",
    optionC: "De 85 à 95 %.",
    optionD: "De 30 à 50 %.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Aviation durable et carburants alternatifs : une révolution en marche",
    longText: ART_AVIATION_DURABLE,
    question: "Quel objectif de quota obligatoire de SAF l'Union Européenne a-t-elle fixé pour 2050 ?",
    optionA: "20 % de SAF dans les aéroports européens.",
    optionB: "50 % de SAF dans les aéroports européens.",
    optionC: "70 % de SAF dans les aéroports européens.",
    optionD: "100 % de SAF dans les aéroports européens.",
    correctAnswer: 'C',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "Le handball français et le financement du sport collectif",
    longText: ART_HANDBALL,
    question: "Selon cet article, pourquoi l'équipe de France de handball est-elle surnommée « les Experts » ?",
    optionA: "À cause de leurs techniques de jeu révolutionnaires.",
    optionB: "En raison de leurs nombreux titres de champions du monde et d'Europe.",
    optionC: "Pour leur professionnalisme reconnu par les médias internationaux.",
    optionD: "Suite à un documentaire télévisé qui leur a donné ce surnom.",
    correctAnswer: 'B',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "Le handball français et le financement du sport collectif",
    longText: ART_HANDBALL,
    question: "L'auteur identifie quelle vulnérabilité principale dans le modèle économique du handball professionnel français ?",
    optionA: "La dépendance excessive aux droits télévisuels qui fluctuent chaque saison.",
    optionB: "La difficulté à former des joueurs compétitifs sans académies suffisamment financées.",
    optionC: "La dépendance aux financements publics des collectivités territoriales.",
    optionD: "L'impossibilité de recruter des joueurs étrangers en raison du règlement fédéral.",
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
    console.log(`\n✅ ${created} questions créées pour CE 50.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
