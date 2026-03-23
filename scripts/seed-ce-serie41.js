'use strict';
/**
 * seed-ce-serie41.js
 * Peuple la série CE 41 avec 40 questions TEF Canada officielles.
 * Thèmes : biologie marine, bande dessinée, coopération internationale,
 *          alimentation fermentée, sport cérébral (échecs), gestion de projet, urbanisme tactique
 * Usage : node scripts/seed-ce-serie41.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyol5700110wxloe1qqo7a';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : BAR CHART — publications scientifiques domaines marins ── */
function generateQ22SVG() {
  const graphs = [
    { label: 'Graphique 1', data: [2340, 1890, 1560, 980], color: '#003087' }, // CORRECT — biologie des abysses
    { label: 'Graphique 2', data: [1200, 2100, 1800, 950], color: '#E30613' },
    { label: 'Graphique 3', data: [1800, 900, 2200, 1100], color: '#E30613' },
    { label: 'Graphique 4', data: [900, 1500, 1200, 2000], color: '#E30613' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const labels = ['Abysses', 'Coraux', 'Pêche', 'Pollut.'];
  const maxVal = 2500;

  function drawBarChart(g, cx, cy) {
    const plotX = cx + 50, plotY = cy + 32, plotW = 310, plotH = 120;
    const barW = 48;
    const gap = (plotW - 4 * barW) / 5;
    const gridLines = [0, 500, 1000, 1500, 2000, 2500].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');
    const bars = g.data.map((v, i) => {
      const bx = (plotX + gap + i * (barW + gap)).toFixed(1);
      const bh = ((v / maxVal) * plotH).toFixed(1);
      const by = (plotY + plotH - parseFloat(bh)).toFixed(1);
      const lx = (parseFloat(bx) + barW / 2).toFixed(1);
      return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="${g.color}" rx="3" opacity="0.85"/>` +
             `<text x="${lx}" y="${(parseFloat(by) - 3).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${g.color}">${v}</text>` +
             `<text x="${lx}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#6b7280">${labels[i]}</text>`;
    }).join('');
    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + bars +
           `<text x="${cx + 195}" y="${cy + 185}" text-anchor="middle" font-size="8" fill="#9ca3af">Publications (2023)</text>`;
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
  { title: 'Texte 1', content: "Les anglerfish (baudroies abyssales) sont des poissons des grandes profondeurs dotés d'une excroissance lumineuse sur la tête qui leur sert d'appât pour attirer leurs proies dans l'obscurité totale. La femelle est bien plus grande que le mâle, qui se fixe définitivement sur elle après la reproduction." },
  { title: 'Texte 2', content: "Les dinoflagellés sont des micro-organismes planctoniques unicellulaires qui illuminent la mer la nuit par oxydation chimique, un phénomène appelé bioluminescence. Ce phénomène, observé dans les eaux chaudes et calmes, colore les vagues d'un bleu électrique fantomatique. Certaines espèces produisent des toxines dangereuses pour les mollusques et les humains." },
  { title: 'Texte 3', content: "Les méduses bioluminescentes, comme Pelagia noctiluca, produisent leur propre lumière grâce à des protéines fluorescentes. Cette luminescence peut servir à effrayer les prédateurs ou à attirer des proies. La méduse cristal (Aequorea victoria) est à l'origine de la découverte de la GFP, protéine fluorescente verte devenue un outil indispensable en biologie cellulaire." },
  { title: 'Texte 4', content: "Les céphalopodes, comme les calmars et les pieuvres, sont capables de produire des flashs de lumière en contrôlant des cellules spécialisées appelées photophores. Ils utilisent cette bioluminescence pour communiquer entre eux, se camoufler ou attirer des proies. Le calmar géant (Architeuthis dux) possède les plus grands yeux du règne animal." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Texte 1', content: "La bande dessinée franco-belge, née au début du XXe siècle avec Hergé et ses Aventures de Tintin, a dominé le marché européen pendant des décennies. Elle se caractérise par un dessin clair, dit « ligne claire », et des récits d'aventure ou d'humour destinés à tous les âges. Asterix et Lucky Luke en sont des représentants emblématiques." },
  { title: 'Texte 2', content: "Le roman graphique est une bande dessinée de long format destinée en priorité aux adultes, traitant de sujets sérieux — autobiographie, histoire, politique, philosophie — avec une ambition littéraire affirmée. Maus d'Art Spiegelman, prix Pulitzer 1992, et Persepolis de Marjane Satrapi ont contribué à légitimer ce genre dans les cercles culturels académiques." },
  { title: 'Texte 3', content: "Le manga est la bande dessinée japonaise, lue de droite à gauche, caractérisée par un style graphique reconnaissable et des genres très diversifiés : shonen (adolescents garçons), shojo (adolescentes filles), seinen (adultes). Des œuvres comme Dragon Ball, Naruto ou One Piece ont conquis un public mondial et généré des adaptations animées (anime) célèbres." },
  { title: 'Texte 4', content: "Le comics américain est né dans les années 1930 avec l'essor des super-héros. Superman, Batman et Spider-Man sont les icônes d'un genre qui a dominé l'imaginaire populaire américain pendant des décennies. Les maisons Marvel et DC Comics restent les éditeurs les plus influents, avec des franchises cinématographiques générant des milliards de dollars." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Texte 1', content: "Le backgammon est l'un des plus anciens jeux de société connus, avec des origines remontant à plus de 5 000 ans en Mésopotamie. Il oppose deux joueurs qui déplacent leurs pions sur un plateau selon des lancers de dés. La part du hasard est significative, mais la stratégie joue un rôle important pour exploiter au mieux les résultats des dés." },
  { title: 'Texte 2', content: "Le go est un jeu de stratégie abstrait d'origine chinoise datant de plus de 2 500 ans, joué sur un damier de 19×19 intersections. Deux joueurs posent alternativement des pierres noires et blanches pour contrôler le territoire. Malgré une règle simple, sa profondeur combinatoire est considérée comme supérieure à celle des échecs." },
  { title: 'Texte 3', content: "Les échecs sont un jeu de stratégie pour deux joueurs né en Inde au VIe siècle, se jouant sur un échiquier de 64 cases. Chaque pièce dispose de règles de déplacement spécifiques. Les échecs sont reconnus par le Comité International Olympique comme un sport de l'esprit et font l'objet de compétitions mondiales depuis 1851." },
  { title: 'Texte 4', content: "Le bridge est un jeu de cartes de stratégie et de communication pour quatre joueurs répartis en deux paires. Il nécessite une excellente mémoire, un sens aigu de la probabilité et une communication codée avec son partenaire. Le bridge est le seul jeu de cartes reconnu par le Comité International Olympique." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Texte 1', content: "La choucroute est une préparation de chou fermenté d'origine alsacienne et germanique, obtenue par lacto-fermentation naturelle. Riche en probiotiques et en vitamine C, elle était jadis emportée par les marins pour prévenir le scorbut. Sa fermentation dure de 4 à 6 semaines dans des conditions anoxiques." },
  { title: 'Texte 2', content: "Le kéfir est une boisson fermentée à base de lait ou d'eau sucrée, produite par des grains de kéfir contenant des bactéries lactiques et des levures en symbiose. Originaire du Caucase, il est consommé pour ses propriétés probiotiques bénéfiques à la flore intestinale. Sa légère teneur en alcool varie de 0,5 à 2 %." },
  { title: 'Texte 3', content: "Le miso est une pâte japonaise fermentée à base de soja, parfois additionnée de riz ou d'orge, produite par fermentation avec le champignon Aspergillus oryzae. Il est utilisé pour les soupes, marinades et sauces. Sa teneur en sel et sa durée de fermentation variable donnent des misos aux profils gustatifs très différents, du blanc doux au rouge intense." },
  { title: 'Texte 4', content: "Le kombucha est une boisson fermentée à base de thé sucré, produite grâce à une culture symbiotique de bactéries et levures (SCOBY). Il a une légère acidité, une effervescence naturelle et contient des acides organiques et des probiotiques. Son origine est attribuée à la Chine ancienne il y a plus de 2 000 ans." },
]);

/* ── Documents Q23-32 ── */
const DOC_ACCORD_ONG =
`ACCORD-CADRE DE COOPÉRATION INTERNATIONALE
Entre : ONG HumanitAction et le Ministère des Affaires Sociales de la République de Tambali

Article 1 — Objet : Le présent accord définit le cadre des activités d'HumanitAction dans les zones prioritaires définies par les Objectifs de Développement Durable (ODD) de l'ONU pour la période 2025-2028.

Article 3 — Zones d'intervention : Les activités se concentreront exclusivement dans les régions rurales des provinces Nord et Centre. Toute extension à d'autres zones nécessite un amendement signé par les deux parties.

Article 5 — Rapportage : HumanitAction s'engage à produire un rapport trimestriel d'activités transmis au Ministère dans les 30 jours suivant la fin de chaque trimestre.`;

const DOC_OFFRE_BIOLOGISTE =
`OFFRE D'EMPLOI — BIOLOGISTE MARIN(E) (H/F)

L'Institut Océanographique National recrute un(e) biologiste marin(e) spécialisé(e) dans les écosystèmes des grandes profondeurs.

Profil requis :
• Doctorat en biologie marine ou océanographie
• Expérience de plongée scientifique (certification CMAS 3 étoiles minimum)
• Maîtrise des techniques d'analyse génétique en environnement marin (eDNA)
• Publications dans des revues à comité de lecture exigées (au moins 3)

Missions : campagnes océanographiques (4 à 6 semaines par an en mer), analyses en laboratoire, rédaction d'articles scientifiques, encadrement de doctorants.

Type de poste : CDI — Ingénieur de recherche. Rémunération selon grille CNRS.`;

const DOC_CONTRAT_BD =
`CONTRAT D'AUTEUR — Festival International de la Bande Dessinée

Entre : La Société de Gestion du Festival BD (ci-après « le Festival ») et M./Mme ___, auteur(e) de bande dessinée.

Article 1 — Participation : L'Auteur s'engage à être présent sur le stand dédié pendant les 4 jours du festival et à participer à 2 dédicaces publiques d'une durée de 2 heures chacune.

Article 2 — Rémunération : L'Auteur perçoit une indemnité de présence de 400 €/jour. Les frais de déplacement sont remboursés sur justificatifs dans la limite de 300 €. L'hébergement est pris en charge par le Festival.

Article 3 — Droits dérivés : Le Festival est autorisé à utiliser l'image et le nom de l'Auteur pour la promotion de l'édition dans laquelle il/elle figure.`;

const DOC_CHARTE_JEU =
`CHARTE DU JEU RESPONSABLE — Fédération Nationale des Jeux de Stratégie

La pratique des jeux de stratégie en compétition doit se dérouler dans un esprit de fair-play, de respect mutuel et de loyauté sportive.

Les participants s'engagent à :
• Ne pas utiliser d'aide extérieure (livres, applications, conseils) pendant les parties
• Respecter les délais de réflexion impartis par la pendule
• Signaler immédiatement au juge arbitre tout comportement suspect d'un adversaire
• Accepter les décisions arbitrales sans contestation agressive

Sanctions : tout manquement est passible d'une pénalité de temps, d'une perte de partie ou d'une exclusion du tournoi selon la gravité. Les sanctions sont prononcées par le juge arbitre et consignées dans le registre de discipline.`;

const DOC_GUIDE_PROJET_URBAIN =
`GUIDE DE GESTION DE PROJET URBAIN PARTICIPATIF
Phase 1 — Diagnostic territorial

Un projet d'urbanisme tactique réussi commence par un diagnostic territorial approfondi impliquant tous les acteurs concernés : riverains, commerçants, associations, élus et services techniques municipaux.

Étapes du diagnostic :
1. Cartographie participative : invitation des habitants à identifier les espaces problématiques et les ressources inexploitées
2. Observations de terrain : comptages de flux piétons, recensement des usages existants
3. Ateliers de co-conception : sessions créatives avec les parties prenantes pour imaginer des interventions
4. Synthèse et priorisation : classement des interventions selon leur faisabilité et leur impact attendu

Le diagnostic doit être validé par le conseil municipal avant de passer à la phase de prototypage.`;

/* ── Articles de presse Q33-40 ── */
const ART_BIODIVERSITE_MARIN =
`LA BIODIVERSITÉ DES GRANDS FONDS MARINS : UN TRÉSOR MENACÉ ENCORE MAL CONNU

Les océans couvrent plus de 70 % de la surface terrestre et les grandes profondeurs — au-delà de 200 mètres — représentent le plus grand habitat de la planète. Pourtant, ces environnements restent parmi les moins explorés de la Terre. On estime que plus de 95 % des fonds marins n'ont jamais été observés directement par l'être humain.

Les expéditions scientifiques des dernières décennies ont révélé une biodiversité stupéfiante dans ces zones extrêmes : des espèces adaptées à l'obscurité totale, à des pressions écrasantes et à des températures proches de zéro. Certaines formes de vie, comme les organismes vivant autour des fumeurs hydrothermaux, ont même remis en question les limites de l'habitabilité telles que nous les concevions.

Cette biodiversité est aujourd'hui menacée par de nouvelles formes d'exploitation humaine. L'intérêt croissant pour l'extraction minière des fonds marins — pour des nodules polymétalliques riches en cobalt, manganèse et nickel — inquiète profondément les scientifiques. Ces nodules se sont formés sur des millions d'années et les écosystèmes qui se sont développés autour d'eux ne pourraient pas se reconstituer à l'échelle humaine.

La communauté scientifique plaide pour un moratoire sur l'exploitation minière des fonds marins jusqu'à ce qu'une évaluation rigoureuse des impacts environnementaux soit réalisée. Mais les intérêts économiques en jeu sont considérables et la gouvernance internationale des fonds marins reste fragmentée.`;

const ART_BD_INSTITUTIONNEL =
`LA BANDE DESSINÉE : DU NEUVIÈME ART À LA RECONNAISSANCE INSTITUTIONNELLE

La bande dessinée, longtemps considérée comme une forme d'expression mineure destinée aux enfants, a parcouru un chemin remarquable vers la légitimité culturelle. Aujourd'hui, des musées lui consacrent des expositions permanentes, des universités l'étudient dans des cursus académiques, et le Festival International de la Bande Dessinée d'Angoulême est devenu l'un des événements culturels les plus importants d'Europe.

Ce parcours vers la reconnaissance n'a pas été linéaire. Dans les années 1950 et 1960, des mouvements de censure aux États-Unis ont failli éradiquer le comics adulte, forçant l'industrie à s'autocensurer pendant des décennies. En France, une loi de 1949 encadrant les publications destinées à la jeunesse a longtemps pesé sur la créativité des auteurs en leur imposant des contraintes morales strictes.

C'est le roman graphique qui a définitivement changé la perception publique du médium. En traitant de la Shoah, de l'exil, de la maladie ou de la guerre, des auteurs comme Art Spiegelman, Marjane Satrapi et Joe Sacco ont démontré que la bande dessinée pouvait être un outil d'exploration du réel aussi puissant que la littérature ou le cinéma.

La numérisation pose aujourd'hui de nouveaux défis : comment préserver la dimension physique et l'expérience tactile de la lecture d'une bande dessinée à l'ère des tablettes et des webtoons ? Comment rémunérer équitablement des auteurs dans un modèle économique qui se numérise à grande vitesse ?`;

const ART_AIDE_SOUVERAINETE =
`AIDE INTERNATIONALE ET SOUVERAINETÉ : LES NOUVELLES EXIGENCES DES PAYS BÉNÉFICIAIRES

La relation entre pays donateurs et pays bénéficiaires de l'aide internationale connaît une transformation profonde. Pendant des décennies, l'aide au développement a fonctionné selon un modèle asymétrique : les pays riches définissaient les priorités et les modalités d'intervention, et les pays bénéficiaires recevaient l'aide en contrepartie de l'adoption de réformes économiques ou institutionnelles prescrites par les donateurs.

Ce modèle est de plus en plus contesté. Des gouvernements africains, asiatiques et latino-américains réclament la définition de leurs propres priorités de développement, une aide qui renforce leurs capacités institutionnelles plutôt que de les contourner, et une diminution de la conditionnalité qui les prive de marges de manœuvre politiques.

La montée en puissance des pays émergents comme la Chine, qui offre une aide sans conditionnalité politique, a modifié les rapports de force. Les pays bénéficiaires ont désormais davantage d'options, ce qui affaiblit le levier des donateurs traditionnels pour imposer des réformes.

Des organisations comme l'OCDE et le PNUD reconnaissent cette évolution et plaident pour un nouveau paradigme de l'aide au développement : une coopération entre égaux, respectueuse des choix souverains des pays partenaires, centrée sur le transfert de connaissances et le renforcement des institutions plutôt que sur l'injection de fonds sans lendemain.`;

const ART_URBANISME_POST_COVID =
`L'URBANISME TACTIQUE ET LES VILLES POST-COVID : REPENSER L'ESPACE PUBLIC

La pandémie de Covid-19 a agi comme un révélateur brutal des fragilités de nos espaces urbains. Le confinement a mis en lumière la rareté des espaces verts de proximité dans certains quartiers denses, l'inadaptation des transports en commun à des situations d'urgence sanitaire, et la dépendance excessive de nos villes à la voiture individuelle.

L'urbanisme tactique — ensemble d'interventions légères, temporaires et réversibles dans l'espace public — a connu un essor spectaculaire pendant et après la pandémie. Des villes comme Paris, Barcelone, Bogotá et Auckland ont transformé des voies de circulation en pistes cyclables, aménagé des terrasses de restaurant sur des places de parking, planté des arbres dans des rues autrefois dédiées aux voitures.

Ces expérimentations ont démontré qu'il était possible de transformer rapidement et à moindre coût l'usage des espaces urbains. Elles ont aussi révélé l'importance de l'appropriation par les habitants : les interventions tactiques qui correspondent aux désirs et aux pratiques réels des usagers perdurent, tandis que celles qui sont imposées sans concertation sont souvent abandonnées ou dégradées.

La question de la pérennisation se pose désormais. Comment passer de l'expérimentation temporaire à la transformation durable ? Comment faire participer équitablement tous les habitants d'un quartier, et pas seulement les plus diplômés ou les plus mobiles, à la redéfinition de leur espace public ? Ces défis définissent l'agenda de l'urbanisme du XXIe siècle.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Affiche festival bande dessinée
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FESTIVAL INTERNATIONAL DE LA BANDE DESSINÉE
42e édition — Angoulême — 30 janvier au 2 février

PROGRAMME HIGHLIGHTS :
• Grand Prix du Festival : cérémonie vendredi soir
• 300 expositions dans toute la ville (entrée libre)
• Dédicaces avec plus de 600 auteurs et autrices
• Conférences et tables rondes : samedi et dimanche
• Espace jeunesse et ateliers BD pour enfants (5-14 ans)
• Marché de la BD : achat/vente d'albums neufs et d'occasion

Accès : navettes depuis la gare SNCF toutes les 15 minutes
Pass 4 jours : 35 € | Journée : 12 € | Gratuit – 12 ans`,
    question: "D'après ce programme, les expositions pendant le festival sont…",
    optionA: "réservées aux détenteurs d'un pass 4 jours.",
    optionB: "accessibles uniquement sur réservation.",
    optionC: "gratuites pour tous dans toute la ville.",
    optionD: "payantes pour les adultes.",
    correctAnswer: 'C',
  }));

  // Q2 — Programme tournoi échecs
  qs.push(q(2, 'Q1-7', null, {
    longText:
`TOURNOI OPEN D'ÉCHECS DE LA VILLE — 15e édition

Samedi 18 mai — Salle des sports municipale

CATÉGORIES :
• Vétérans (+ 60 ans) : 9 h – 12 h | 7 rondes suisses
• Seniors (18-59 ans) : 10 h – 17 h | 9 rondes suisses
• Juniors (12-17 ans) : 10 h – 15 h | 7 rondes suisses
• Poussins (-12 ans) : 14 h – 17 h | 5 rondes suisses

Inscription : 10 € adultes | 5 € enfants | Gratuit licenciés club hôte
Remise des prix : 18 h 30
Renseignements : echecs-tournoi@ville-marennes.fr`,
    question: "Selon ce programme, quelle catégorie joue le plus grand nombre de rondes ?",
    optionA: "La catégorie Vétérans.",
    optionB: "La catégorie Seniors.",
    optionC: "La catégorie Juniors.",
    optionD: "La catégorie Poussins.",
    correctAnswer: 'B',
  }));

  // Q3 — Règlement coopération ONG
  qs.push(q(3, 'Q1-7', null, {
    longText:
`RÈGLEMENT INTERNE — ONG HumanitAction
Activités dans les pays partenaires

Article 8 — Zones d'intervention prioritaires
Conformément aux accords-cadres signés avec les gouvernements partenaires, les activités de terrain sont limitées aux zones géographiques définies dans les annexes de chaque accord. Toute intervention dans une zone non prévue doit faire l'objet d'une autorisation préalable du Siège.

Article 9 — Personnel expatrié
Le personnel expatrié doit respecter scrupuleusement les législations locales en vigueur et ne peut, en aucun cas, participer à des activités politiques dans le pays d'accueil.

Article 12 — Reporting
Chaque mission produit un rapport mensuel d'activités comprenant un état financier et un bilan des bénéficiaires atteints.`,
    question: "Selon ce règlement, une intervention dans une zone non prévue nécessite…",
    optionA: "l'accord du gouvernement local uniquement.",
    optionB: "une autorisation préalable du Siège de l'ONG.",
    optionC: "une décision du Conseil d'administration.",
    optionD: "une simple notification aux autorités locales.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce jeux de société stratégie
  qs.push(q(4, 'Q1-7', null, {
    longText:
`À VENDRE — Lot jeux de société stratégie

Particulier vend lot de 6 jeux de société stratégie, état excellent, très peu utilisés :
• Catan (édition 2022) avec extension Marins
• Terraforming Mars
• Wingspan (édition européenne)
• 7 Wonders Duel
• Scythe
• Puerto Rico (édition anniversaire)

Prix lot complet : 120 € ferme (valeur neuve : 280 €)
Vente en lot uniquement, pas à la pièce
Remise en main propre uniquement sur Paris 14e

Contact : 06 99 88 77 66`,
    question: "D'après cette annonce, le vendeur accepte-t-il de vendre les jeux séparément ?",
    optionA: "Oui, pour certains jeux seulement.",
    optionB: "Oui, à un prix majoré.",
    optionC: "Non, seulement en lot complet.",
    optionD: "Oui, sur demande par email.",
    correctAnswer: 'C',
  }));

  // Q5 — Mode d'emploi fermenteur kombucha
  qs.push(q(5, 'Q1-7', null, {
    longText:
`FERMENTEUR À KOMBUCHA BREWMASTER 5L — GUIDE DE DÉMARRAGE

Préparation du thé de base :
1. Faites bouillir 4 litres d'eau filtrée. Retirez du feu.
2. Ajoutez 8 sachets de thé noir (ou 16 g de thé en vrac) et laissez infuser 10 minutes.
3. Retirez le thé et dissolvez 300 g de sucre blanc dans le thé chaud. Laissez refroidir à 25 °C.
4. Versez dans le fermenteur. Ajoutez votre SCOBY et 200 ml de kombucha de démarrage.
5. Couvrez avec le tissu respirant fourni et fixez avec l'élastique.
6. Laissez fermenter 7 à 14 jours à température ambiante (18-25 °C).

⚠ Ne jamais fermer hermétiquement le fermenteur pendant la fermentation.`,
    question: "Selon ce guide, combien de jours dure la fermentation du kombucha ?",
    optionA: "1 à 3 jours.",
    optionB: "3 à 7 jours.",
    optionC: "7 à 14 jours.",
    optionD: "14 à 21 jours.",
    correctAnswer: 'C',
  }));

  // Q6 — Communiqué biologie marine découverte espèces
  qs.push(q(6, 'Q1-7', null, {
    longText:
`COMMUNIQUÉ SCIENTIFIQUE
Institut Océanographique National — Département biologie marine

Une expédition scientifique conduite dans les fosses abyssales du Pacifique Sud à -4 500 mètres de profondeur a permis d'identifier 23 nouvelles espèces marines inconnues de la science.

Parmi les découvertes : 7 espèces de crustacés des genres Tanaidacea et Amphipoda, 12 espèces de polychètes (vers marins), 3 espèces d'holothuries (concombres de mer) et 1 poisson bioluminescent d'une espèce non répertoriée.

L'équipe scientifique dirigée par le Dr. Marina Vega utilisait un submersible téléguidé équipé de caméras 4K et d'un bras manipulateur pour prélever des échantillons. Les résultats seront publiés dans Marine Biology Letters.`,
    question: "Ce communiqué annonce principalement…",
    optionA: "la mise à jour d'un catalogue d'espèces marines connues.",
    optionB: "la découverte de 23 nouvelles espèces marines dans les abysses du Pacifique Sud.",
    optionC: "une technique nouvelle de plongée en eaux profondes.",
    optionD: "les résultats d'une analyse chimique de l'eau abyssale.",
    correctAnswer: 'B',
  }));

  // Q7 — Invitation semaine de l'urbanisme
  qs.push(q(7, 'Q1-7', null, {
    longText:
`Ville de Grenoble — Direction de l'Urbanisme

SEMAINE DE L'URBANISME PARTICIPATIF
Du lundi 10 au vendredi 14 juin

Venez co-construire l'avenir de votre quartier !

Programme :
• Lundi : Marche exploratoire commentée (départ Place de la Mairie, 18 h)
• Mardi : Atelier cartographie participative (Médiathèque, 18 h – 21 h)
• Mercredi : Conférence « Urbanisme tactique et villes durables » (18 h 30)
• Jeudi : Atelier maquette — dessinez votre rue idéale (tous publics, 16 h – 20 h)
• Vendredi : Restitution des propositions au Maire (Hôtel de Ville, 18 h)

Tous les ateliers sont gratuits et ouverts sans inscription.`,
    question: "D'après ce programme, quelle activité a lieu à la Médiathèque ?",
    optionA: "La marche exploratoire commentée.",
    optionB: "L'atelier cartographie participative.",
    optionC: "La conférence sur l'urbanisme tactique.",
    optionD: "La restitution des propositions au Maire.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ cellulaire est le processus par lequel une cellule se divise pour donner naissance à deux cellules filles avec un matériel génétique identique.",
    question: PHRASE_Q,
    optionA: "mitose",
    optionB: "méiose",
    optionC: "reproduction",
    optionD: "symbiose",
    correctAnswer: 'A',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Dans une bande dessinée, chaque ___ est un cadre délimité contenant une image ou une scène, et l'ensemble de ces cadres sur une page forme une planche.",
    question: PHRASE_Q,
    optionA: "case",
    optionB: "bulle",
    optionC: "phylactère",
    optionD: "vignette",
    correctAnswer: 'A',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "Un ___ de coopération international définit le cadre juridique dans lequel deux parties s'engagent à travailler ensemble sur des objectifs communs définis.",
    question: PHRASE_Q,
    optionA: "traité",
    optionB: "accord",
    optionC: "mémorandum",
    optionD: "protocole",
    correctAnswer: 'B',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ lactique est un processus biochimique qui transforme les sucres en acide lactique grâce à des bactéries, permettant de conserver les aliments et d'en modifier le goût.",
    question: PHRASE_Q,
    optionA: "distillation",
    optionB: "fermentation",
    optionC: "oxydation",
    optionD: "macération",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "Aux échecs, une ___ est une suite de coups calculés à l'avance visant à prendre un avantage décisif sur l'adversaire, souvent au prix d'un sacrifice de pièce.",
    question: PHRASE_Q,
    optionA: "gambit",
    optionB: "combinaison",
    optionC: "défense",
    optionD: "ouverture",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'urbanisme tactique cherche à transformer l'espace urbain par des interventions légères et ___ qui peuvent être modifiées ou supprimées facilement selon les retours des usagers.",
    question: PHRASE_Q,
    optionA: "permanentes",
    optionB: "monumentales",
    optionC: "réversibles",
    optionD: "décoratives",
    correctAnswer: 'C',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "La bioluminescence marine est produite par des organismes qui génèrent leur propre lumière grâce à une réaction chimique impliquant la [14], une protéine oxydée par une enzyme spécifique. Cette [15] est utilisée par les organismes pour communiquer, attirer des proies ou se défendre contre les prédateurs dans l'obscurité des profondeurs.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La bioluminescence marine",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "chlorophylle",
    optionB: "luciférine",
    optionC: "mélanine",
    optionD: "carotène",
    correctAnswer: 'B',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — La bioluminescence marine",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "fluorescence",
    optionB: "phosphorescence",
    optionC: "oxydation",
    optionD: "luminescence",
    correctAnswer: 'D',
  }));

  const TEXTE_LAC_2 =
    "L'urbanisme tactique repose sur la notion d'[16] temporaire de l'espace public, permettant de tester des usages nouveaux avant de décider d'interventions pérennes. Cette [17] progressive de l'espace par les habitants est au cœur de la philosophie de la ville participative.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Urbanisme tactique et espace public",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "transformation",
    optionB: "aménagement temporaire",
    optionC: "destruction",
    optionD: "construction",
    correctAnswer: 'B',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — Urbanisme tactique et espace public",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "détérioration",
    optionB: "occupation",
    optionC: "appropriation",
    optionD: "rénovation",
    correctAnswer: 'C',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel texte décrit des micro-organismes planctoniques qui illuminent la mer la nuit par oxydation chimique ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel texte décrit une bande dessinée de long format destinée aux adultes traitant de sujets sérieux avec ambition littéraire ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel texte décrit un jeu de stratégie d'origine chinoise joué sur un damier de 19×19 intersections ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'B',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel texte décrit une pâte japonaise fermentée à base de soja utilisée pour les soupes et marinades ?",
    optionA: "Texte 1",
    optionB: "Texte 2",
    optionC: "Texte 3",
    optionD: "Texte 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphique
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La biologie des abysses représente le domaine le plus actif de la recherche marine avec 2 340 publications en 2023, une augmentation de 45% par rapport à 2019. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Accord-cadre de coopération internationale — ONG HumanitAction",
    longText: DOC_ACCORD_ONG,
    question: "Selon cet accord, dans quelles zones les activités de l'ONG sont-elles concentrées ?",
    optionA: "Dans toutes les régions du pays partenaire.",
    optionB: "Exclusivement dans les régions rurales des provinces Nord et Centre.",
    optionC: "Dans les zones urbaines définies par l'ONU.",
    optionD: "Dans les zones frontalières prioritaires.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Accord-cadre de coopération internationale — ONG HumanitAction",
    longText: DOC_ACCORD_ONG,
    question: "Quel délai l'ONG a-t-elle pour transmettre ses rapports trimestriels d'activités ?",
    optionA: "15 jours après la fin du trimestre.",
    optionB: "30 jours après la fin du trimestre.",
    optionC: "45 jours après la fin du trimestre.",
    optionD: "60 jours après la fin du trimestre.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Biologiste marin(e)",
    longText: DOC_OFFRE_BIOLOGISTE,
    question: "Quelle certification de plongée est exigée pour ce poste ?",
    optionA: "PADI Open Water.",
    optionB: "CMAS 1 étoile.",
    optionC: "CMAS 3 étoiles minimum.",
    optionD: "Brevet national de plongée scientifique.",
    correctAnswer: 'C',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Biologiste marin(e)",
    longText: DOC_OFFRE_BIOLOGISTE,
    question: "Combien de publications dans des revues à comité de lecture sont exigées minimum ?",
    optionA: "1 publication.",
    optionB: "2 publications.",
    optionC: "3 publications.",
    optionD: "5 publications.",
    correctAnswer: 'C',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat d'auteur — Festival International de la Bande Dessinée",
    longText: DOC_CONTRAT_BD,
    question: "Quelle est l'indemnité journalière versée à l'auteur lors du festival ?",
    optionA: "200 €/jour.",
    optionB: "300 €/jour.",
    optionC: "400 €/jour.",
    optionD: "500 €/jour.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat d'auteur — Festival International de la Bande Dessinée",
    longText: DOC_CONTRAT_BD,
    question: "Quel est le plafond de remboursement des frais de déplacement selon ce contrat ?",
    optionA: "200 €.",
    optionB: "300 €.",
    optionC: "400 €.",
    optionD: "500 €.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Charte du jeu responsable — Fédération Nationale des Jeux de Stratégie",
    longText: DOC_CHARTE_JEU,
    question: "Selon cette charte, que doit faire un participant qui observe un comportement suspect de son adversaire ?",
    optionA: "Arrêter la partie immédiatement.",
    optionB: "Signaler le comportement immédiatement au juge arbitre.",
    optionC: "Protester verbalement auprès de l'adversaire.",
    optionD: "Demander à changer d'adversaire.",
    correctAnswer: 'B',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Charte du jeu responsable — Fédération Nationale des Jeux de Stratégie",
    longText: DOC_CHARTE_JEU,
    question: "Où les sanctions prononcées par le juge arbitre sont-elles consignées ?",
    optionA: "Dans les résultats officiels du tournoi.",
    optionB: "Dans le registre de discipline.",
    optionC: "Dans le dossier personnel du joueur.",
    optionD: "Sur le site web de la fédération.",
    correctAnswer: 'B',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Guide de gestion de projet urbain participatif",
    longText: DOC_GUIDE_PROJET_URBAIN,
    question: "Quelle est la première étape du diagnostic territorial selon ce guide ?",
    optionA: "Les ateliers de co-conception.",
    optionB: "Les observations de terrain.",
    optionC: "La cartographie participative avec les habitants.",
    optionD: "La validation par le conseil municipal.",
    correctAnswer: 'C',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Guide de gestion de projet urbain participatif",
    longText: DOC_GUIDE_PROJET_URBAIN,
    question: "Quelle étape précède obligatoirement le passage à la phase de prototypage ?",
    optionA: "La synthèse et priorisation des interventions.",
    optionB: "La validation du diagnostic par le conseil municipal.",
    optionC: "La consultation des commerçants du quartier.",
    optionD: "L'accord du préfet de région.",
    correctAnswer: 'B',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "La biodiversité des grands fonds marins : un trésor menacé encore mal connu",
    longText: ART_BIODIVERSITE_MARIN,
    question: "Selon cet article, quel pourcentage des fonds marins n'a jamais été observé directement ?",
    optionA: "Plus de 50 %.",
    optionB: "Plus de 75 %.",
    optionC: "Plus de 95 %.",
    optionD: "La totalité des fonds marins.",
    correctAnswer: 'C',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "La biodiversité des grands fonds marins : un trésor menacé encore mal connu",
    longText: ART_BIODIVERSITE_MARIN,
    question: "Pour quoi les nodules polymétalliques des fonds marins sont-ils convoités ?",
    optionA: "Pour leur richesse en pétrole.",
    optionB: "Pour leur richesse en cobalt, manganèse et nickel.",
    optionC: "Pour leur richesse en or et diamants.",
    optionD: "Pour leurs propriétés pharmaceutiques.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "La bande dessinée : du neuvième art à la reconnaissance institutionnelle",
    longText: ART_BD_INSTITUTIONNEL,
    question: "Quel festival est présenté comme l'un des événements culturels les plus importants d'Europe ?",
    optionA: "Le festival de Cannes.",
    optionB: "Le festival d'Avignon.",
    optionC: "Le Festival International de la Bande Dessinée d'Angoulême.",
    optionD: "Le Salon du livre de Paris.",
    correctAnswer: 'C',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "La bande dessinée : du neuvième art à la reconnaissance institutionnelle",
    longText: ART_BD_INSTITUTIONNEL,
    question: "Quel auteur et quelle œuvre sont cités comme ayant reçu le prix Pulitzer ?",
    optionA: "Marjane Satrapi et Persepolis.",
    optionB: "Art Spiegelman et Maus.",
    optionC: "Joe Sacco et Palestine.",
    optionD: "Alan Moore et Watchmen.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "Aide internationale et souveraineté : les nouvelles exigences des pays bénéficiaires",
    longText: ART_AIDE_SOUVERAINETE,
    question: "Selon l'article, comment la montée en puissance de la Chine a-t-elle modifié le rapport de force dans l'aide internationale ?",
    optionA: "Elle a augmenté la conditionnalité imposée par les donateurs occidentaux.",
    optionB: "Elle a donné plus d'options aux pays bénéficiaires, affaiblissant le levier des donateurs traditionnels.",
    optionC: "Elle a réduit les flux totaux d'aide internationale.",
    optionD: "Elle a encouragé les pays bénéficiaires à refuser toute aide extérieure.",
    correctAnswer: 'B',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "Aide internationale et souveraineté : les nouvelles exigences des pays bénéficiaires",
    longText: ART_AIDE_SOUVERAINETE,
    question: "Quel nouveau paradigme de l'aide au développement les organisations comme l'OCDE et le PNUD défendent-elles selon l'article ?",
    optionA: "Une aide uniquement sous forme de prêts remboursables.",
    optionB: "Une coopération entre égaux respectant les choix souverains des pays partenaires.",
    optionC: "Une aide conditionnée à l'adoption de réformes démocratiques.",
    optionD: "Une aide gérée directement par les Nations Unies.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'urbanisme tactique et les villes post-Covid",
    longText: ART_URBANISME_POST_COVID,
    question: "Selon l'article, quelles villes sont citées comme exemples d'urbanisme tactique post-Covid ?",
    optionA: "Tokyo, Séoul et Singapour.",
    optionB: "New York, Chicago et Los Angeles.",
    optionC: "Paris, Barcelone, Bogotá et Auckland.",
    optionD: "Berlin, Amsterdam et Copenhague.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'urbanisme tactique et les villes post-Covid",
    longText: ART_URBANISME_POST_COVID,
    question: "Selon l'article, quelle condition favorise la pérennisation des interventions d'urbanisme tactique ?",
    optionA: "Le financement public suffisant des interventions.",
    optionB: "Qu'elles correspondent aux désirs et pratiques réels des usagers.",
    optionC: "Qu'elles soient validées par des experts urbanistes.",
    optionD: "Qu'elles soient promues par les médias locaux.",
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
    console.log(`\n✅ ${created} questions créées pour CE 41.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
