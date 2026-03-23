'use strict';
/**
 * seed-ce-serie15.js
 * Peuple la série CE 15 avec 40 questions TEF Canada officielles.
 * Usage : node scripts/seed-ce-serie15.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SERIES_ID = 'cmmzyogec000b0wxlfxak94xb';
const MODULE_ID = 'cmmrh9gdw0000gsxl3k8uc9ht';

/* ── SVG Q22 : 4 line-charts précipitations 3 régions ── */
function generateQ22SVG() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  // Graphique correct = A (région Nord > 80mm en décembre)
  const graphs = [
    { label: 'Graphique 1', dataNord: [55,50,60,70,75,65,55,50,60,70,75,85], dataEst: [40,38,45,55,60,50,45,42,50,58,62,65], dataSud: [30,28,35,45,55,60,65,62,50,40,32,28], colorA: '#003087', colorB: '#E30613', colorC: '#10b981' }, // CORRECT
    { label: 'Graphique 2', dataNord: [65,60,55,50,45,40,38,42,50,58,62,60], dataEst: [70,65,60,55,50,45,42,48,55,62,68,72], dataSud: [30,32,40,50,60,70,75,72,60,48,35,28], colorA: '#003087', colorB: '#E30613', colorC: '#10b981' },
    { label: 'Graphique 3', dataNord: [35,38,42,50,55,60,65,62,55,48,40,35], dataEst: [50,48,52,58,62,55,50,48,55,60,65,68], dataSud: [80,75,65,55,45,35,30,32,42,55,68,78], colorA: '#003087', colorB: '#E30613', colorC: '#10b981' },
    { label: 'Graphique 4', dataNord: [20,22,28,35,42,55,60,58,48,38,28,22], dataEst: [25,28,32,40,48,58,62,60,50,40,30,24], dataSud: [45,42,50,58,65,70,72,68,60,52,48,44], colorA: '#003087', colorB: '#E30613', colorC: '#10b981' },
  ];
  const positions = [
    { cx: 10, cy: 15 }, { cx: 420, cy: 15 },
    { cx: 10, cy: 218 }, { cx: 420, cy: 218 },
  ];
  const maxVal = 90;

  function drawLineChart(g, cx, cy) {
    const plotX = cx + 45, plotY = cy + 32, plotW = 310, plotH = 120;
    const stepX = plotW / (months.length - 1);

    const gridLines = [0, 30, 60, 90].map(v => {
      const yv = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `<line x1="${plotX}" y1="${yv}" x2="${plotX + plotW}" y2="${yv}" stroke="#e5e7eb" stroke-width="1"/>` +
             `<text x="${plotX - 6}" y="${(parseFloat(yv) + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#6b7280">${v}</text>`;
    }).join('');

    const makePoints = (data) => data.map((v, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      const py = (plotY + plotH - (v / maxVal) * plotH).toFixed(1);
      return `${px},${py}`;
    }).join(' ');

    const xLabels = months.map((m, i) => {
      const px = (plotX + i * stepX).toFixed(1);
      return `<text x="${px}" y="${(plotY + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="7" fill="#6b7280">${m}</text>`;
    }).join('');

    return `<rect x="${cx}" y="${cy}" width="390" height="190" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>` +
           `<text x="${cx + 195}" y="${cy + 22}" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">${g.label}</text>` +
           `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           `<line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="#d1d5db" stroke-width="1"/>` +
           gridLines + xLabels +
           `<polyline points="${makePoints(g.dataNord)}" fill="none" stroke="${g.colorA}" stroke-width="2"/>` +
           `<polyline points="${makePoints(g.dataEst)}" fill="none" stroke="${g.colorB}" stroke-width="2"/>` +
           `<polyline points="${makePoints(g.dataSud)}" fill="none" stroke="${g.colorC}" stroke-width="2"/>` +
           `<text x="${cx + 60}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorA}">— Nord</text>` +
           `<text x="${cx + 160}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorB}">— Est</text>` +
           `<text x="${cx + 260}" y="${cy + 185}" text-anchor="middle" font-size="7" fill="${g.colorC}">— Sud</text>`;
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
  { title: 'Visa 1', content: "Le visa touristique permet de séjourner dans un pays étranger pour une durée limitée (généralement 90 jours maximum) à des fins de tourisme, de visites familiales ou de voyages d'agrément. Il ne permet pas d'exercer une activité professionnelle rémunérée." },
  { title: 'Visa 2', content: "Le visa étudiant est délivré aux personnes souhaitant suivre des études supérieures dans un établissement reconnu par l'État d'accueil. Il est valable pour la durée des études et peut inclure une autorisation de travail à temps partiel selon les pays." },
  { title: 'Visa 3', content: "Le visa de travail est accordé aux personnes ayant obtenu un contrat d'emploi auprès d'un employeur étranger. Il est lié à un poste précis et à un employeur spécifique. Sa durée correspond généralement à celle du contrat de travail." },
  { title: 'Visa 4', content: "Le visa de transit aéroportuaire permet de passer en zone internationale d'un aéroport sans entrer sur le territoire du pays. Il est requis par certains ressortissants lors de vols avec correspondance. Sa durée est généralement limitée à 24 heures." },
]);

const TEXTS_Q19 = JSON.stringify([
  { title: 'Instrument 1', content: "Le violon est un instrument à cordes frottées de la famille des cordes. Il est le plus aigu des instruments de sa famille (violon, alto, violoncelle, contrebasse) et joue les parties mélodiques les plus aiguës de l'orchestre symphonique." },
  { title: 'Instrument 2', content: "Le violoncelle est un instrument à cordes de taille moyenne dans la famille des cordes frottées. Il joue des parties harmoniques et mélodiques graves et est souvent utilisé en musique de chambre. Il se joue assis, l'instrument posé au sol sur une pique." },
  { title: 'Instrument 3', content: "La contrebasse est le plus grand et le plus grave des instruments à cordes de l'orchestre. Elle fournit la base harmonique et rythmique de l'ensemble orchestral. En jazz, elle est souvent jouée en pizzicato (pincement des cordes)." },
  { title: 'Instrument 4', content: "L'alto est un instrument à cordes frottées légèrement plus grand que le violon, produisant un son plus grave et plus sombre. Il joue les parties intermédiaires dans l'orchestre, entre le violon et le violoncelle." },
]);

const TEXTS_Q20 = JSON.stringify([
  { title: 'Régime 1', content: "L'économie de marché est un système dans lequel les décisions économiques (production, prix, distribution) sont prises par les entreprises privées et les consommateurs selon la loi de l'offre et de la demande, sans intervention gouvernementale directe." },
  { title: 'Régime 2', content: "L'économie planifiée (ou socialiste) est un système dans lequel l'État contrôle et planifie l'ensemble de l'activité économique : production, prix et distribution des biens et services. Les entreprises privées y ont peu ou pas de place." },
  { title: 'Régime 3', content: "L'économie mixte est un système qui combine des éléments d'économie de marché et d'économie planifiée. Le secteur privé y coexiste avec un secteur public significatif, et l'État intervient pour corriger les défaillances du marché et assurer certains services publics." },
  { title: 'Régime 4', content: "L'économie collaborative est un modèle basé sur le partage de ressources, de services et de biens entre particuliers, facilité par des plateformes numériques. Elle transforme les modes de consommation traditionnels sans pour autant constituer un système économique global." },
]);

const TEXTS_Q21 = JSON.stringify([
  { title: 'Transport 1', content: "Le métro est un réseau de transport en commun qui circule principalement en souterrain, sur des rails dédiés entièrement séparés de la voirie. Rapide et à haute fréquence, il dessert les grandes agglomérations. Il ne circule pas en hauteur sur des rails surélevés." },
  { title: 'Transport 2', content: "Le tramway est un véhicule électrique qui circule sur des rails intégrés à la chaussée urbaine au niveau du sol. Il partage l'espace avec les autres usagers et dessert des arrêts à intervalles réguliers. Sa vitesse est modérée et son impact visuel important." },
  { title: 'Transport 3', content: "Le métro aérien est un système de transport en commun électrique qui circule sur des rails surélevés, perchés sur des piliers au-dessus des rues. Ce type d'infrastructure évite les contraintes d'un tunnel souterrain tout en isolant le trafic ferroviaire du trafic routier." },
  { title: 'Transport 4', content: "Le monorail est un système de transport guidé circulant sur un rail unique, souvent suspendu ou posé sur une poutre surélevée. Il est utilisé dans certains aéroports, parcs d'attractions ou villes asiatiques pour relier des zones spécifiques avec peu d'infrastructure au sol." },
]);

/* ── Documents Q23-32 ── */
const DOC_GUIDE_NATURALISATION =
`GUIDE DE LA PROCÉDURE DE NATURALISATION — Ministère de l'Intérieur

La naturalisation permet à un ressortissant étranger d'acquérir la nationalité française. Elle est accordée par décret après instruction du dossier.

CONDITIONS PRINCIPALES :
• Résider régulièrement en France depuis au moins 5 ans (réduit à 2 ans pour certains profils)
• Parler français à un niveau B1 minimum (justifié par un diplôme ou un test agréé)
• S'être intégré à la société française (emploi, respect des lois)
• Ne pas avoir été condamné pour certaines infractions

DOSSIER : Déposé en préfecture. Délai d'instruction : 12 à 18 mois.
Toute décision négative peut faire l'objet d'un recours administratif.`;

const DOC_OFFRE_EMPLOI_TRADUCTEUR =
`OFFRE D'EMPLOI — TRADUCTEUR / TRADUCTRICE SPÉCIALISÉ(E) (H/F)

Cabinet de traduction et d'interprétariat recherche un(e) traducteur(trice) pour son pôle juridique et institutionnel.

LANGUES : Français ↔ Anglais (obligatoire) + une troisième langue parmi : arabe, espagnol, chinois ou allemand.

MISSIONS : Traduction de documents juridiques (contrats, jugements), institutionnels (rapports officiels) et techniques. Relecture et certification de traductions. Interprétation en conférence (selon profil).

PROFIL : Master en traduction ou langues étrangères appliquées. Expérience de 2 ans minimum. Rigueur, respect des délais, confidentialité absolue.

CONDITIONS : CDI, télétravail possible 3 jours/semaine. Rémunération : 2 400-2 800 €/mois.`;

const DOC_CONTRAT_ASSURANCE =
`CONTRAT D'ASSURANCE HABITATION — ASSUR'PLUS
Assuré : M. Jean-Pierre KAMDEM
Adresse du bien : 12, allée des Roses, 69007 Lyon

GARANTIES INCLUSES :
• Incendie et explosion : valeur de reconstruction à neuf
• Dégâts des eaux : fuite, rupture de canalisation
• Vol et vandalisme : franchise de 200 €
• Responsabilité civile : 1 500 000 € maximum

EXCLUSIONS : Catastrophes naturelles non déclarées, dommages intentionnels, usure normale.
COTISATION : 28,50 €/mois prélevée le 5 de chaque mois.
RÉSILIATION : Possible à chaque anniversaire avec préavis de 2 mois.`;

const DOC_REGLEMENT_RESIDENCE =
`RÈGLEMENT INTÉRIEUR — RÉSIDENCE UNIVERSITAIRE JEAN-ZAY

Accès réservé aux étudiants inscrits dans un établissement d'enseignement supérieur conventionné.

HORAIRES : Entrée libre 24h/24 avec badge. Accueil administratif : lundi-vendredi 9h-17h.
SILENCE : Silence absolu de 22h à 7h. Les rassemblements dans les couloirs sont interdits après 21h.
CUISINE COMMUNE : Chaque résident doit nettoyer après utilisation. Les aliments laissés plus de 72h dans le réfrigérateur commun seront jetés.
VISITEURS : Autorisés entre 9h et 22h. Hébergement de tiers interdit sauf autorisation préalable écrite.
ANIMAUX : Strictement interdits dans l'ensemble de la résidence.`;

const DOC_NOTE_RH =
`NOTE INTERNE — Direction des Ressources Humaines
Objet : Restructuration du service RH — nouvelles attributions

Suite à la revue organisationnelle du premier trimestre, le service RH sera restructuré à compter du 1er juin selon le nouveau schéma suivant :

• Pôle Recrutement & Mobilité : gestion des annonces, sélection des candidats, entretiens et intégration des nouveaux collaborateurs. Responsable : Mme Delacour.
• Pôle Administration du Personnel : gestion des contrats, paie, congés, DPAE et déclarations sociales. Responsable : M. Nguyen.
• Pôle Formation & Développement : plan de formation, bilans de compétences, gestion des OPCO. Responsable : Mme Osei.

Toute demande devra désormais être adressée au pôle concerné. Les coordonnées sont disponibles sur l'intranet.`;

/* ── Articles de presse Q33-40 ── */
const ART_IMMIGRATION_ECONOMIE =
`L'IMPACT DE L'IMMIGRATION SUR L'ÉCONOMIE LOCALE : UNE RÉALITÉ PLUS NUANCÉE QU'IL N'Y PARAÎT

Le débat sur l'immigration est souvent dominé par des arguments politiques et émotionnels qui occultent une réalité économique plus complexe. Les études économiques disponibles suggèrent que l'impact de l'immigration sur les économies des pays d'accueil est globalement positif, mais avec des nuances importantes selon les secteurs et les niveaux de qualification.

Les immigrants contribuent à l'économie locale de plusieurs façons. Ils comblent des pénuries de main-d'œuvre dans des secteurs essentiels (santé, construction, agriculture, services à la personne) que les travailleurs natifs refusent souvent. Ils créent des entreprises, paient des impôts et des cotisations sociales, et consomment des biens et services locaux. Des études menées aux États-Unis et au Canada montrent que les immigrants représentent une part disproportionnellement élevée des créateurs d'entreprises et des dépôts de brevets.

L'argument selon lequel les immigrants « volent les emplois » des travailleurs natifs est largement réfuté par les économistes. Les marchés du travail ne sont pas fixes : créer de l'emploi dans un secteur génère de la demande et donc de l'emploi dans d'autres secteurs. La concurrence salariale existe surtout pour les travailleurs peu qualifiés natifs en compétition directe avec des immigrants de même niveau, mais cet effet est marginal.

Les défis réels concernent davantage l'intégration : coût des services d'accueil et de formation linguistique, pression sur les systèmes de logement et d'éducation à court terme, et délai nécessaire pour que les immigrants atteignent leur plein potentiel économique.`;

const ART_SANTE_NUMERIQUE =
`LES APPLICATIONS DE SANTÉ NUMÉRIQUE : RÉVOLUTION DES SOINS OU GADGET TECHNOLOGIQUE ?

Le marché des applications de santé numérique est en explosion. Des millions de personnes utilisent désormais des applications pour surveiller leur fréquence cardiaque, calculer leurs calories, gérer leur sommeil ou même consulter un médecin en vidéo. Cette révolution numérique de la santé promet d'améliorer l'accessibilité aux soins, de responsabiliser les patients et de réduire les coûts pour les systèmes de santé.

Certaines applications ont fait leurs preuves. Les outils de suivi du diabète permettent aux patients d'ajuster leur traitement en temps réel grâce à des capteurs de glycémie connectés. Les applications de santé mentale offrent des thérapies cognitivo-comportementales accessibles 24h/24, réduisant les délais d'attente pour les personnes en souffrance psychologique. Les plateformes de télémédecine ont démontré leur efficacité pour les consultations de suivi et les situations non urgentes.

Mais les risques sont réels. La qualité médicale de la grande majorité des applications disponibles n'est pas vérifiée. Des données de santé sensibles sont collectées et parfois revendues à des fins commerciales sans que les utilisateurs en soient pleinement conscients. Par ailleurs, les populations les plus fragiles — personnes âgées, peu diplômées ou à faibles revenus — accèdent moins à ces outils, creusant les inégalités de santé.

La santé numérique a un avenir indéniable, mais son déploiement doit s'accompagner d'une réglementation stricte, d'une formation des professionnels de santé et d'une attention particulière aux inégalités d'accès.`;

const ART_MUSIQUE_STREAMING =
`L'INDUSTRIE MUSICALE À L'ÈRE DU STREAMING : ADAPTATION OU DISRUPTION ?

La révolution du streaming a radicalement transformé l'industrie musicale en moins d'une décennie. Des plateformes comme Spotify, Apple Music et Deezer comptent aujourd'hui des centaines de millions d'abonnés dans le monde, ayant quasiment éradiqué le marché du CD physique et redéfini les modes d'écoute musicale. Pour la première fois depuis l'avènement du piratage numérique dans les années 2000, les revenus de l'industrie musicale sont en croissance positive.

Mais cette croissance profite-t-elle équitablement à tous ? Les grandes maisons de disques et les artistes majeurs bénéficient largement du streaming. Mais pour les artistes indépendants et les musiciens de niche, le modèle économique reste problématique. Une écoute génère en moyenne 0,003 à 0,005 € de revenus pour l'artiste. Il faut donc plusieurs millions d'écoutes pour générer un revenu décent, ce qui est hors de portée de la grande majorité des musiciens.

Le streaming a également modifié les comportements créatifs. Les artistes créent davantage de courtes chansons pour maximiser les écoutes, modifiant parfois leurs choix artistiques pour coller aux algorithmes des plateformes. La culture de la playlist a supplanté celle de l'album, fragmentant l'écoute et réduisant la portée des œuvres conçues comme des ensembles cohérents.

L'avenir de la musique passe sans doute par un modèle hybride, combinant streaming, concerts en direct, merchandising et nouvelles formes de monétisation directe entre artistes et fans.`;

const ART_AGRICULTURE_URBAINE =
`L'AGRICULTURE URBAINE : VERS UNE VILLE QUI SE NOURRIT ELLE-MÊME ?

L'agriculture urbaine connaît un essor remarquable dans les grandes villes du monde. Des toits transformés en potagers, des friches industrielles reconverties en fermes maraîchères, des façades végétalisées, des jardins partagés dans les squares : les expériences se multiplient, portées par la volonté de reconnecter les citadins à leur alimentation et de réduire l'empreinte carbone des circuits alimentaires.

Paris compte aujourd'hui plus de 300 jardins partagés. Amsterdam et New York ont développé des fermes urbaines à grande échelle sur leurs toits. Singapour, dont la superficie est limitée, a fait de l'agriculture urbaine high-tech un axe de sa politique d'autonomie alimentaire, avec des tours agricoles verticales utilisant l'hydroponie.

Les bénéfices sont multiples : création de lien social dans les quartiers, éducation alimentaire des enfants, végétalisation des villes (réduction des îlots de chaleur), réduction des déchets organiques par le compostage. Certaines explorations montrent que des légumes cultivés en ville peuvent être produits à des coûts compétitifs lorsque les rendements sont optimisés par les nouvelles technologies.

Les limites sont néanmoins réelles. L'agriculture urbaine ne peut nourrir qu'une fraction infime de la population d'une grande ville. Les surfaces disponibles sont insuffisantes, les coûts fonciers élevés et les rendements limités par rapport aux exploitations rurales. Elle est davantage un complément symbolique et pédagogique qu'une solution structurelle à l'alimentation urbaine.`;

function buildQuestions() {
  const qs = [];

  // Q1 — Formulaire demande visa
  qs.push(q(1, 'Q1-7', null, {
    longText:
`FORMULAIRE DE DEMANDE DE VISA TOURISTIQUE
Ambassade de France en Côte d'Ivoire

DOCUMENTS REQUIS :
• Passeport valide 6 mois après la date de retour prévue
• 2 photos d'identité récentes (format 35×45 mm)
• Justificatif d'hébergement (réservation hôtel ou attestation d'accueil)
• Preuve de ressources suffisantes (relevés bancaires des 3 derniers mois)
• Assurance voyage couvrant tout le séjour (minimum 30 000 €)

DÉLAI DE TRAITEMENT : 15 jours ouvrables à compter du dépôt du dossier complet.
FRAIS DE DOSSIER : 80 € (non remboursables en cas de refus).`,
    question: "D'après ce formulaire, les frais de dossier sont…",
    optionA: "remboursables si le visa est accordé.",
    optionB: "gratuits pour les moins de 18 ans.",
    optionC: "non remboursables même en cas de refus.",
    optionD: "à payer uniquement après obtention du visa.",
    correctAnswer: 'C',
  }));

  // Q2 — Horaires transports en commun
  qs.push(q(2, 'Q1-7', null, {
    longText:
`RÉSEAU DE TRANSPORTS URBAINS — HORAIRES LIGNE 7

Direction : Gare Centrale → Aéroport International

JOURS OUVRABLES :
Premier départ : 5 h 15 | Dernier départ : 23 h 45
Fréquence : toutes les 12 minutes (heures de pointe) / 20 minutes (heures creuses)

WEEK-ENDS ET JOURS FÉRIÉS :
Premier départ : 6 h 30 | Dernier départ : 23 h 00
Fréquence : toutes les 25 minutes

TARIFS : Ticket unitaire 1,90 € | Carnet 10 tickets 15 € | Pass mensuel 72 €
Validité des tickets : 1 h 30 après compostage, correspondances incluses.`,
    question: "Selon ce document, le premier départ du week-end est à…",
    optionA: "5 h 15.",
    optionB: "6 h 00.",
    optionC: "6 h 30.",
    optionD: "7 h 00.",
    correctAnswer: 'C',
  }));

  // Q3 — Affiche concert musical
  qs.push(q(3, 'Q1-7', null, {
    longText:
`GRAND CONCERT DE GALA — ORCHESTRE PHILHARMONIQUE NATIONAL

VENDREDI 28 JUIN — 20 H 00
PALAIS DES ARTS — Grande Salle (2 800 places)

Programme :
• Beethoven — Symphonie n° 5 en ut mineur
• Ravel — Boléro
• Berlioz — Ouverture du Carnaval Romain

Direction : Maestro Carlos VIDAL
Soliste invité : Leïla AHANU (violon)

Tarifs : Catégorie A 85 € | Catégorie B 55 € | Catégorie C 30 €
Étudiants : 50 % de réduction sur présentation de la carte.`,
    question: "Ce document est…",
    optionA: "un programme de cours de musique classique.",
    optionB: "une affiche de concert avec programme et tarifs.",
    optionC: "une critique musicale publiée après le concert.",
    optionD: "un contrat d'engagement pour musiciens.",
    correctAnswer: 'B',
  }));

  // Q4 — Petite annonce cours de langue
  qs.push(q(4, 'Q1-7', null, {
    longText:
`COURS DE FRANÇAIS LANGUE ÉTRANGÈRE — Tous niveaux

L'Institut Langue et Culture propose des cours individuels et en petit groupe (max. 6 personnes).

FORMULES DISPONIBLES :
• Intensif : 4 h/jour, 5 jours/semaine
• Semi-intensif : 2 h/jour, 3 jours/semaine
• Cours du soir : 1 h 30 deux soirs par semaine

TEST DE NIVEAU : Gratuit, en ligne ou sur place — sans obligation d'inscription.
TARIFS : À partir de 12 €/h en groupe | 35 €/h en individuel.

Préparation aux certifications : DELF, DALF, TCF.
Contact : 04 91 22 33 44 | info@institut-langueculture.fr`,
    question: "D'après cette annonce, le test de niveau est…",
    optionA: "payant et obligatoire avant toute inscription.",
    optionB: "gratuit et sans obligation d'inscription.",
    optionC: "réservé aux candidats aux certifications DELF/DALF.",
    optionD: "uniquement disponible en ligne.",
    correctAnswer: 'B',
  }));

  // Q5 — Programme diététique
  qs.push(q(5, 'Q1-7', null, {
    longText:
`PROGRAMME ALIMENTAIRE — PLAN SANTÉ 12 SEMAINES
Diététicienne : Dr Sophie MARTIN, nutritionniste

SEMAINE 1-4 (Phase détox légère) :
• Petit-déjeuner : fruits frais + céréales complètes + yaourt nature
• Déjeuner : protéines maigres + légumes vapeur + légumineuses
• Dîner : soupe de légumes + pain complet

PRINCIPES CLÉS :
• Hydratation : 1,5 L d'eau minimum par jour
• Éviter : sucres raffinés, graisses saturées, alcool
• Activité physique : 30 min marche rapide minimum par jour

Suivi mensuel en consultation — adaptation selon les résultats.`,
    question: "Ce document est…",
    optionA: "un livre de recettes de cuisine légère.",
    optionB: "un programme alimentaire suivi par une diététicienne.",
    optionC: "une publicité pour des compléments alimentaires.",
    optionD: "un régime amaigrissant non médical.",
    correctAnswer: 'B',
  }));

  // Q6 — Mode d'emploi tensiomètre
  qs.push(q(6, 'Q1-7', null, {
    longText:
`TENSIOMÈTRE AUTOMATIQUE BRAS — GUIDE RAPIDE

AVANT LA MESURE :
• Éviter l'effort physique, le café et le tabac 30 min avant
• Rester assis au calme pendant 5 minutes
• Vider la vessie si nécessaire

PROCÉDURE :
1. Enfilez le brassard sur le bras gauche, 2 cm au-dessus du coude.
2. Bras posé sur la table, au niveau du cœur.
3. Appuyez sur le bouton START — le brassard se gonfle automatiquement.
4. Attendez la fin du cycle (environ 30 secondes).
5. Lisez les valeurs affichées : systolique / diastolique / pouls.

Normale : < 120/80 mmHg. Consultez un médecin si > 140/90 mmHg régulièrement.`,
    question: "Selon le guide, avant la mesure, il faut…",
    optionA: "boire un grand verre d'eau pour l'hydratation.",
    optionB: "effectuer des étirements pour détendre les muscles.",
    optionC: "rester assis au calme pendant 5 minutes.",
    optionD: "positionner le brassard sur le bras droit.",
    correctAnswer: 'C',
  }));

  // Q7 — Courrier convocation administrative
  qs.push(q(7, 'Q1-7', null, {
    longText:
`PRÉFECTURE DE RÉGION — Service des étrangers

Objet : Convocation pour instruction de votre demande de titre de séjour

Madame, Monsieur,

Nous vous prions de bien vouloir vous présenter à nos services le jeudi 15 mai à 9 h 30, muni(e) des pièces suivantes :
• Votre passeport original et une copie de toutes les pages
• Votre contrat de travail ou promesse d'embauche
• Trois derniers bulletins de salaire
• Justificatif de domicile de moins de 3 mois

Tout dossier incomplet entraînera le report de votre convocation.
Accueil : Bâtiment B, rez-de-chaussée, guichet 4.`,
    question: "Selon ce courrier, que se passera-t-il si le dossier est incomplet ?",
    optionA: "La demande sera définitivement rejetée.",
    optionB: "La convocation sera reportée à une date ultérieure.",
    optionC: "Les documents manquants pourront être envoyés par courrier.",
    optionD: "Une amende administrative sera appliquée.",
    correctAnswer: 'B',
  }));

  // Q8-13 : Phrases lacunaires
  const PHRASE_Q = 'Quel mot complète correctement la phrase ?';

  qs.push(q(8, 'Q8-17', 'Phrases lacunaires', {
    longText: "La procédure de ___ permet à un ressortissant étranger d'acquérir la nationalité d'un pays après avoir satisfait à des critères d'intégration et de résidence.",
    question: PHRASE_Q,
    optionA: "rapatriement",
    optionB: "naturalisation",
    optionC: "résidence",
    optionD: "régularisation",
    correctAnswer: 'B',
  }));

  qs.push(q(9, 'Q8-17', 'Phrases lacunaires', {
    longText: "Pour maximiser son ___ financier, un investisseur doit diversifier ses placements et évaluer soigneusement les risques associés à chaque actif.",
    question: PHRASE_Q,
    optionA: "capital",
    optionB: "rendement",
    optionC: "budget",
    optionD: "emprunt",
    correctAnswer: 'B',
  }));

  qs.push(q(10, 'Q8-17', 'Phrases lacunaires', {
    longText: "L'ergonomie d'une application mobile repose sur la qualité de son ___, qui détermine la facilité avec laquelle l'utilisateur peut naviguer et accomplir ses tâches.",
    question: PHRASE_Q,
    optionA: "contenu",
    optionB: "sécurité",
    optionC: "interface",
    optionD: "stockage",
    correctAnswer: 'C',
  }));

  qs.push(q(11, 'Q8-17', 'Phrases lacunaires', {
    longText: "En musique, le ___ désigne la vitesse d'exécution d'un morceau, mesurée en battements par minute et indiquée par des termes italiens comme andante ou allegro.",
    question: PHRASE_Q,
    optionA: "timbre",
    optionB: "tempo",
    optionC: "rythme",
    optionD: "accord",
    correctAnswer: 'B',
  }));

  qs.push(q(12, 'Q8-17', 'Phrases lacunaires', {
    longText: "La ___ est la meilleure façon de se protéger contre certaines maladies infectieuses en stimulant le système immunitaire sans exposer l'organisme à un danger réel.",
    question: PHRASE_Q,
    optionA: "quarantaine",
    optionB: "vaccination",
    optionC: "médication",
    optionD: "chirurgie",
    correctAnswer: 'B',
  }));

  qs.push(q(13, 'Q8-17', 'Phrases lacunaires', {
    longText: "Le transport de ___ par voie ferrée est en plein essor car il permet de réduire le nombre de camions sur les routes et donc les émissions de CO2 liées au transport.",
    question: PHRASE_Q,
    optionA: "passagers",
    optionB: "fret",
    optionC: "matières",
    optionD: "véhicules",
    correctAnswer: 'B',
  }));

  // Q14-17 : Textes lacunaires
  const TEXTE_LAC_1 =
    "Le commerce en ligne a profondément transformé nos habitudes d'achat. Grâce aux [14] numériques, les consommateurs peuvent acheter des produits du monde entier depuis leur domicile. La sécurisation des transactions est assurée par des protocoles de [15] en ligne qui protègent les données bancaires des acheteurs.";

  qs.push(q(14, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Le commerce en ligne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [14] ?",
    optionA: "boutiques",
    optionB: "catalogues",
    optionC: "plateformes",
    optionD: "applications",
    correctAnswer: 'C',
  }));

  qs.push(q(15, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 1 — Le commerce en ligne",
    longText: TEXTE_LAC_1,
    question: "Quel mot convient pour le blanc [15] ?",
    optionA: "connexion",
    optionB: "paiement",
    optionC: "livraison",
    optionD: "remboursement",
    correctAnswer: 'B',
  }));

  const TEXTE_LAC_2 =
    "La gestion des déchets alimentaires représente un défi environnemental majeur. Le [16] des restes organiques permet de les transformer en engrais naturel qui enrichit les sols. Ce processus de [17] est favorisé par des micro-organismes qui décomposent la matière organique en quelques semaines.";

  qs.push(q(16, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La gestion des déchets alimentaires",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [16] ?",
    optionA: "tri",
    optionB: "stockage",
    optionC: "brûlage",
    optionD: "compostage",
    correctAnswer: 'D',
  }));

  qs.push(q(17, 'Q8-17', 'Textes lacunaires', {
    taskTitle: "Texte lacunaire 2 — La gestion des déchets alimentaires",
    longText: TEXTE_LAC_2,
    question: "Quel mot convient pour le blanc [17] ?",
    optionA: "fermentation",
    optionB: "décomposition",
    optionC: "purification",
    optionD: "transformation",
    correctAnswer: 'B',
  }));

  // Q18-21 : Lecture rapide
  qs.push(q(18, 'Q18-21', null, {
    longText: TEXTS_Q18,
    question: "Quel visa permet de suivre des études supérieures à l'étranger ?",
    optionA: "Visa 1",
    optionB: "Visa 2",
    optionC: "Visa 3",
    optionD: "Visa 4",
    correctAnswer: 'B',
  }));

  qs.push(q(19, 'Q18-21', null, {
    longText: TEXTS_Q19,
    question: "Quel instrument à cordes est le plus grave de l'orchestre ?",
    optionA: "Instrument 1",
    optionB: "Instrument 2",
    optionC: "Instrument 3",
    optionD: "Instrument 4",
    correctAnswer: 'C',
  }));

  qs.push(q(20, 'Q18-21', null, {
    longText: TEXTS_Q20,
    question: "Quel régime économique combine secteur public et privé ?",
    optionA: "Régime 1",
    optionB: "Régime 2",
    optionC: "Régime 3",
    optionD: "Régime 4",
    correctAnswer: 'C',
  }));

  qs.push(q(21, 'Q18-21', null, {
    longText: TEXTS_Q21,
    question: "Quel transport circule en hauteur sur des rails surélevés ?",
    optionA: "Transport 1",
    optionB: "Transport 2",
    optionC: "Transport 3",
    optionD: "Transport 4",
    correctAnswer: 'C',
  }));

  // Q22 : Graphiques
  qs.push(q(22, 'Q22', null, {
    imageUrl: generateQ22SVG(),
    question: "Quel graphique correspond au commentaire suivant : « La région Nord reçoit plus de 80 mm de précipitations en décembre, son mois le plus pluvieux. » ?",
    optionA: "Graphique 1",
    optionB: "Graphique 2",
    optionC: "Graphique 3",
    optionD: "Graphique 4",
    correctAnswer: 'A',
  }));

  // Q23-32 : Documents administratifs
  qs.push(q(23, 'Q23-32', null, {
    taskTitle: "Guide de la procédure de naturalisation",
    longText: DOC_GUIDE_NATURALISATION,
    question: "Ce document présente principalement…",
    optionA: "les droits politiques des citoyens français.",
    optionB: "la procédure pour acquérir la nationalité française.",
    optionC: "les conditions pour obtenir un visa de long séjour.",
    optionD: "les règles d'expulsion des étrangers en situation irrégulière.",
    correctAnswer: 'B',
  }));

  qs.push(q(24, 'Q23-32', null, {
    taskTitle: "Guide de la procédure de naturalisation",
    longText: DOC_GUIDE_NATURALISATION,
    question: "Selon ce guide, le niveau de français requis pour la naturalisation est…",
    optionA: "A2 minimum.",
    optionB: "B1 minimum.",
    optionC: "B2 minimum.",
    optionD: "C1 minimum.",
    correctAnswer: 'B',
  }));

  qs.push(q(25, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Traducteur spécialisé",
    longText: DOC_OFFRE_EMPLOI_TRADUCTEUR,
    question: "Cette offre d'emploi concerne la traduction dans quel domaine principal ?",
    optionA: "La traduction littéraire et éditoriale.",
    optionB: "La traduction juridique et institutionnelle.",
    optionC: "La traduction médicale et pharmaceutique.",
    optionD: "La traduction technique et scientifique.",
    correctAnswer: 'B',
  }));

  qs.push(q(26, 'Q23-32', null, {
    taskTitle: "Offre d'emploi — Traducteur spécialisé",
    longText: DOC_OFFRE_EMPLOI_TRADUCTEUR,
    question: "Selon l'offre, le poste propose…",
    optionA: "un contrat CDD de 6 mois avec possibilité de CDI.",
    optionB: "un CDI avec possibilité de télétravail 3 jours par semaine.",
    optionC: "un statut freelance avec facturation à la page.",
    optionD: "un poste en présentiel uniquement au siège.",
    correctAnswer: 'B',
  }));

  qs.push(q(27, 'Q23-32', null, {
    taskTitle: "Contrat d'assurance habitation — Assur'Plus",
    longText: DOC_CONTRAT_ASSURANCE,
    question: "Selon ce contrat, quelle garantie est incluse avec une franchise de 200 € ?",
    optionA: "Les dégâts des eaux.",
    optionB: "L'incendie et l'explosion.",
    optionC: "Le vol et le vandalisme.",
    optionD: "La responsabilité civile.",
    correctAnswer: 'C',
  }));

  qs.push(q(28, 'Q23-32', null, {
    taskTitle: "Contrat d'assurance habitation — Assur'Plus",
    longText: DOC_CONTRAT_ASSURANCE,
    question: "D'après le contrat, la résiliation est possible…",
    optionA: "à tout moment sans préavis.",
    optionB: "à chaque anniversaire du contrat avec un préavis de 2 mois.",
    optionC: "uniquement après 3 ans de souscription.",
    optionD: "en cas de déménagement uniquement.",
    correctAnswer: 'B',
  }));

  qs.push(q(29, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Résidence universitaire Jean-Zay",
    longText: DOC_REGLEMENT_RESIDENCE,
    question: "Selon le règlement, les visiteurs sont autorisés dans la résidence…",
    optionA: "24h/24 comme les résidents.",
    optionB: "uniquement le week-end de 10h à 20h.",
    optionC: "entre 9h et 22h.",
    optionD: "uniquement sur rendez-vous avec le gardien.",
    correctAnswer: 'C',
  }));

  qs.push(q(30, 'Q23-32', null, {
    taskTitle: "Règlement intérieur — Résidence universitaire Jean-Zay",
    longText: DOC_REGLEMENT_RESIDENCE,
    question: "D'après le règlement, concernant les animaux domestiques…",
    optionA: "les petits animaux (chats, lapins) sont tolérés.",
    optionB: "ils sont autorisés dans les chambres uniquement.",
    optionC: "ils sont strictement interdits dans toute la résidence.",
    optionD: "leur présence est soumise à autorisation préalable.",
    correctAnswer: 'C',
  }));

  qs.push(q(31, 'Q23-32', null, {
    taskTitle: "Note interne — Restructuration du service RH",
    longText: DOC_NOTE_RH,
    question: "Cette note interne annonce…",
    optionA: "la fusion du service RH avec le service comptabilité.",
    optionB: "une restructuration du service RH avec de nouveaux pôles.",
    optionC: "des licenciements économiques au sein du service RH.",
    optionD: "le recrutement de nouveaux collaborateurs RH.",
    correctAnswer: 'B',
  }));

  qs.push(q(32, 'Q23-32', null, {
    taskTitle: "Note interne — Restructuration du service RH",
    longText: DOC_NOTE_RH,
    question: "Selon la note, le Pôle Formation & Développement est responsable de…",
    optionA: "la gestion des contrats de travail et de la paie.",
    optionB: "la sélection des candidats et les entretiens.",
    optionC: "le plan de formation et les bilans de compétences.",
    optionD: "les déclarations sociales et les DPAE.",
    correctAnswer: 'C',
  }));

  // Q33-40 : Articles de presse
  qs.push(q(33, 'Q33-40', null, {
    taskTitle: "L'impact de l'immigration sur l'économie locale",
    longText: ART_IMMIGRATION_ECONOMIE,
    question: "Selon cet article, les études économiques indiquent que l'impact de l'immigration est…",
    optionA: "globalement négatif sur les économies des pays d'accueil.",
    optionB: "globalement positif mais avec des nuances selon les secteurs.",
    optionC: "nul car les immigrants dépensent tout leur argent dans leur pays d'origine.",
    optionD: "uniquement positif pour les secteurs de haute technologie.",
    correctAnswer: 'B',
  }));

  qs.push(q(34, 'Q33-40', null, {
    taskTitle: "L'impact de l'immigration sur l'économie locale",
    longText: ART_IMMIGRATION_ECONOMIE,
    question: "L'article réfute l'argument que les immigrants volent les emplois en expliquant que…",
    optionA: "les immigrants occupent uniquement des postes que les natifs refusent.",
    optionB: "les marchés du travail ne sont pas fixes et la création d'emploi génère de la demande.",
    optionC: "les immigrants créent toujours plus d'emplois qu'ils n'en occupent.",
    optionD: "les gouvernements limitent le nombre d'immigrants pour protéger l'emploi local.",
    correctAnswer: 'B',
  }));

  qs.push(q(35, 'Q33-40', null, {
    taskTitle: "Les applications de santé numérique",
    longText: ART_SANTE_NUMERIQUE,
    question: "Selon cet article, les applications de suivi du diabète permettent…",
    optionA: "de remplacer les consultations médicales régulières.",
    optionB: "d'ajuster le traitement en temps réel grâce à des capteurs connectés.",
    optionC: "de guérir le diabète de type 2 sans médicaments.",
    optionD: "de diagnostiquer le diabète sans test biologique.",
    correctAnswer: 'B',
  }));

  qs.push(q(36, 'Q33-40', null, {
    taskTitle: "Les applications de santé numérique",
    longText: ART_SANTE_NUMERIQUE,
    question: "L'article identifie comme risque principal des applications de santé…",
    optionA: "leur coût prohibitif pour les patients.",
    optionB: "la collecte et la vente de données de santé sensibles.",
    optionC: "leur tendance à décourager les consultations médicales.",
    optionD: "leur manque d'ergonomie pour les utilisateurs.",
    correctAnswer: 'B',
  }));

  qs.push(q(37, 'Q33-40', null, {
    taskTitle: "L'industrie musicale à l'ère du streaming",
    longText: ART_MUSIQUE_STREAMING,
    question: "Selon l'article, combien génère environ une écoute en streaming pour un artiste ?",
    optionA: "Entre 0,05 et 0,10 €.",
    optionB: "Entre 0,01 et 0,02 €.",
    optionC: "Entre 0,003 et 0,005 €.",
    optionD: "Entre 0,50 et 1,00 €.",
    correctAnswer: 'C',
  }));

  qs.push(q(38, 'Q33-40', null, {
    taskTitle: "L'industrie musicale à l'ère du streaming",
    longText: ART_MUSIQUE_STREAMING,
    question: "L'article mentionne comme changement créatif lié au streaming…",
    optionA: "une augmentation de la durée moyenne des chansons.",
    optionB: "la création de davantage de courtes chansons pour maximiser les écoutes.",
    optionC: "un retour à la culture de l'album long.",
    optionD: "une réduction de la production musicale globale.",
    correctAnswer: 'B',
  }));

  qs.push(q(39, 'Q33-40', null, {
    taskTitle: "L'agriculture urbaine : vers une ville qui se nourrit elle-même ?",
    longText: ART_AGRICULTURE_URBAINE,
    question: "Selon cet article, combien Paris compte-t-il de jardins partagés ?",
    optionA: "Plus de 100.",
    optionB: "Plus de 200.",
    optionC: "Plus de 300.",
    optionD: "Plus de 500.",
    correctAnswer: 'C',
  }));

  qs.push(q(40, 'Q33-40', null, {
    taskTitle: "L'agriculture urbaine : vers une ville qui se nourrit elle-même ?",
    longText: ART_AGRICULTURE_URBAINE,
    question: "L'article conclut que l'agriculture urbaine est davantage…",
    optionA: "une solution structurelle à l'alimentation des grandes villes.",
    optionB: "un complément symbolique et pédagogique qu'une solution structurelle.",
    optionC: "une activité économique rentable pour les agriculteurs urbains.",
    optionD: "une pratique réservée aux pays disposant de grands espaces.",
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
    console.log(`\n✅ ${created} questions créées pour CE 15.`);

    const total = await prisma.question.count({ where: { seriesId: SERIES_ID } });
    console.log(`📊 Total en base : ${total}/40`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
