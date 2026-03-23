'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const EO_MODULE_ID = 'cmmrh9hx00003gsxls5ylk8sb';

const CONSIGNE_A = "Vous téléphonez pour avoir plus d'informations sur cette annonce. Posez une dizaine de questions à votre interlocuteur(trice). Utilisez le vouvoiement.";
const CONSIGNE_B = "Vous en parlez à un(e) ami(e). Présentez ce document et essayez de le / la convaincre d'y participer. Utilisez le tutoiement.";

/* ─────────────────────────────────────────────────────────────────────────────
   50 series data — EO 3 to EO 52
   Each entry: { title, sectionA: { taskTitle, longText }, sectionB: { taskTitle, longText } }
───────────────────────────────────────────────────────────────────────────── */
const SERIES_DATA = [
  {
    title: 'EO 3',
    sectionA: {
      taskTitle: 'Appartement à vendre',
      longText: `Au 4e étage d'un immeuble ancien en plein centre-ville.
Appartement rénové et très clair. Beaucoup de charme.
Réf. : 03-01103 - Tél : (514) 984-1212 - www.lux-immo.com`,
    },
    sectionB: {
      taskTitle: 'Studio meublé à louer',
      longText: `STUDIO MEUBLÉ – CENTRE-VILLE
18 m² au 2e étage, idéal étudiant ou jeune actif.
Cuisine équipée, douche, Internet inclus.
Disponible dès le 1er du mois.
Contact : 06 12 34 56 78 – studio-location.fr`,
    },
  },
  {
    title: 'EO 4',
    sectionA: {
      taskTitle: 'Appartement à louer',
      longText: `À 5 min du métro Corentin Celton et des commerces, 2 pièces de 58
m2 rénové dans un bel immeuble années 30. Situé au 8e et dernier
étage avec ascenseur comprenant une entrée, salon, salle à manger,
chambre, chauffage et eau chaude collectifs. Parquet. Présence d'un
gardien. Provision sur charges 180 €/mois, régularisation annuelle.
Dépôt de garantie 1 450 €. Honoraires de 696 € TTC à la charge du
locataire. Loyer 1630 €.`,
    },
    sectionB: {
      taskTitle: 'Chambre en colocation',
      longText: `COLOCATION SYMPA – 3 COLOCATAIRES
Chambre meublée de 14 m² dans appartement de 90 m², Paris 11e.
Salon commun, cuisine équipée, fibre optique.
Ambiance étudiante et conviviale.
Loyer charges comprises : 650 €/mois.
Dépôt de garantie : 650 €.
Contact : coloc-paris11@gmail.com`,
    },
  },
  {
    title: 'EO 5',
    sectionA: {
      taskTitle: 'Maison à vendre',
      longText: `BAGNOLS SUR CEZE
LE DOMAINE DES PINS
Dernière maison accolée à vendre avec jardin privatif
Livraison en septembre
HORIZONS - Promoteur/constructeur - 04 66 665011`,
    },
    sectionB: {
      taskTitle: 'Villa à louer pour les vacances',
      longText: `VILLA MER ET SOLEIL – CÔTE D'AZUR
Superbe villa de 120 m², 4 chambres, piscine privée.
Vue mer panoramique, à 300 m de la plage.
Disponible juillet et août.
Tarif : 2 500 €/semaine.
Réservations : 04 93 45 67 89 – villa-mer-soleil.fr`,
    },
  },
  {
    title: 'EO 6',
    sectionA: {
      taskTitle: 'Meubles à vendre',
      longText: `VENTE - Occasion à saisir – Vends meubles à prix très intéressants –
Téléphonez vite au 14 543 212`,
    },
    sectionB: {
      taskTitle: 'Électroménager d\'occasion',
      longText: `VENTE ÉLECTROMÉNAGER – BON ÉTAT
Lave-linge 7 kg – 150 €
Réfrigérateur combiné – 120 €
Four à micro-ondes – 40 €
Aspirateur robot – 80 €
Tout vendu séparément ou lot à négocier.
Disponible weekend uniquement.
Tél : 06 87 65 43 21`,
    },
  },
  {
    title: 'EO 7',
    sectionA: {
      taskTitle: 'Échange d\'appartement',
      longText: `(75) Paris 12e - 3 pièces - De particulier à particulier – Échange
juillet-août 3 pièces – 57 mètres carré, très bien situé – Lumineux
proche toutes commodités, excellent état contre 2 pièces - Standing,
balcon, proximité mer, mêmes conditions 06 28 00 20 75`,
    },
    sectionB: {
      taskTitle: 'Location saisonnière bord de mer',
      longText: `APPARTEMENT BORD DE MER – BRETAGNE
T2 entièrement équipé, 45 m², vue sur port.
À 50 m de la plage, toutes commodités à pied.
Idéal couple ou famille avec 1 enfant.
Disponible de juin à septembre.
Tarif semaine : 600 € à 900 € selon période.
Contact : 02 98 12 34 56`,
    },
  },
  {
    title: 'EO 8',
    sectionA: {
      taskTitle: 'Location de vélo',
      longText: `BICYTOUR
Pour des vacances sereines et détendues,
nous vous proposons de louer des vélos !
1 vélo : 50 €/semaine, 10 €/jour
2 vélos : 90 €/semaine, 15 €/jour
Propositions de parcours de promenade
Location 7 jours sur 7
Pour nous contacter : 06.00.40.02.03`,
    },
    sectionB: {
      taskTitle: 'Location de trottinette électrique',
      longText: `SCOOT'CITY – MOBILITÉ VERTE
Louez une trottinette électrique et explorez la ville !
Tarifs : 5 €/heure – 20 €/journée – 80 €/semaine
Casque fourni – Assistance technique disponible
Station principale : Place de la République
Ouvert 7j/7 de 8h à 20h
Tél : 01 23 45 67 89 – scootcity.fr`,
    },
  },
  {
    title: 'EO 9',
    sectionA: {
      taskTitle: 'Musée du Louvre',
      longText: `S'AMUSER AU MUSÉE DU LOUVRE - À LA DÉCOUVERTE DES ANIMAUX
Les collections du Louvre sont peuplées d'animaux réels et
fantastiques : lions, chevaux, ou encore dragons...
Proposez à vos enfants de partir à une découverte étonnante
dans les salles du musée. Plusieurs activités sont proposées.
Informations : 01 40 20 50 03`,
    },
    sectionB: {
      taskTitle: 'Exposition Sciences et Découvertes',
      longText: `PALAIS DE LA DÉCOUVERTE – PARIS
Nouvelle exposition temporaire : « Le Corps Humain »
Une plongée fascinante dans le fonctionnement de notre corps.
Ateliers interactifs pour petits et grands.
Durée de visite conseillée : 2h
Tarifs : Adultes 12 € – Enfants (jusqu'à 12 ans) 8 € – Gratuit moins de 5 ans
Réservation conseillée : 01 56 43 20 20`,
    },
  },
  {
    title: 'EO 10',
    sectionA: {
      taskTitle: 'Camp d\'été pour enfants',
      longText: `Centre de vacances d'été - Pour enfants de 6 à 12 ans
– Situé au coeur du village de St Bauzilla - à 500 m de la plage -
Nombreuses Activités Chambres avec 4 à 8 lits - Repas préparés sur place.`,
    },
    sectionB: {
      taskTitle: 'Séjour sportif pour adolescents',
      longText: `AVENTURE JEUNES – 13-17 ANS
Stage multisports en montagne : escalade, VTT, canoë.
Une semaine pour se dépasser et se faire des amis.
Encadrement professionnel, matériel fourni.
Dates : juillet et août, départ chaque lundi.
Tarif : 650 €/semaine pension complète.
Inscriptions : aventure-jeunes.fr – 04 76 00 12 34`,
    },
  },
  {
    title: 'EO 11',
    sectionA: {
      taskTitle: 'La fête des voisins',
      longText: `Immeuble en fête - La fête des voisins mardi.
Une fête est organisée dans l'immeuble.
Au programme, apéritif, buffet, musique.
Si vous êtes intéressé(e), téléphonez-nous au 08 73 21 40 33 Mme Aurore.`,
    },
    sectionB: {
      taskTitle: 'Repas de quartier solidaire',
      longText: `ASSOCIATION DU QUARTIER DES LILAS
GRAND REPAS SOLIDAIRE DU QUARTIER
Samedi 15 juin de 12h à 16h – Place des Lilas
Venez partager un repas convivial et gratuit !
Chacun apporte un plat à partager.
Animations musicales et jeux pour enfants.
Entrée libre – ouvert à tous.
Contact : quartierdeslilas@mairie.fr`,
    },
  },
  {
    title: 'EO 12',
    sectionA: {
      taskTitle: 'Atelier Musique et Spectacles',
      longText: `ATELIERS MUSIQUE & SPECTACLES
Audition
Les ateliers musique et spectacles proposent à vingt jeunes
de participer à une sélection en vue de faire la première partie
du concert d'un artiste connu.
Écriture, chant, travail vocal, danse, répétitions, scène, studio
d'enregistrement…
Les auditions ont lieu le 14 juin dans les locaux de A.M.S.
Renseignements et inscriptions : 048 256 768`,
    },
    sectionB: {
      taskTitle: 'Auditions Théâtre Amateur',
      longText: `COMPAGNIE DU MASQUE D'OR
AUDITIONS OUVERTES – SAISON PROCHAINE
La compagnie du Masque d'Or recherche de nouveaux comédiens
pour sa prochaine création théâtrale.
Aucune expérience préalable requise, juste de l'enthousiasme !
Auditions : samedi 22 juin à partir de 10h00
Lieu : Salle des Arts, 25 rue Victor Hugo
Renseignements : 06 78 90 12 34`,
    },
  },
  {
    title: 'EO 13',
    sectionA: {
      taskTitle: 'Centre Sport et Forme',
      longText: `45 % des Français se réveillent fatigués, même après une bonne nuit de sommeil.
Le nouveau Centre Sport et Forme ouvre ses portes et vous offre
une importante réduction sur votre premier abonnement,
ainsi qu'un cadeau de bienvenue !
Pour en savoir plus, appelez le 01 42 67 08 56.`,
    },
    sectionB: {
      taskTitle: 'Fitness en plein air',
      longText: `PARK FIT – COURS COLLECTIFS EN PLEIN AIR
Rejoignez nos séances de fitness dans les parcs de la ville !
Cardio, renforcement musculaire, stretching…
Pour tous niveaux, débutant à confirmé.
Horaires : mardi et jeudi à 7h30, samedi à 9h00.
Lieu : Parc municipal (grille principale).
Premier cours gratuit ! Tél : 06 55 44 33 22`,
    },
  },
  {
    title: 'EO 14',
    sectionA: {
      taskTitle: 'Soutien scolaire',
      longText: `Soutien scolaire ajusté à votre budget
Vos avantages :
La transparence : consultez les profils des professeurs avant les cours
La réussite des élèves : nous suivons vos progrès
Budget maîtrisé : aucuns frais d'inscription ni cours prépayés
L'efficacité : cours par Internet en complément des cours à domicile
Notre offre est destinée aux :
Élèves du primaire et du secondaire
Adultes cherchant à apprendre les langues étrangères`,
    },
    sectionB: {
      taskTitle: 'Préparation aux examens',
      longText: `ACADÉMIE DES RÉUSSITES
Stage intensif de préparation au baccalauréat
Du 24 au 28 juin, de 9h à 17h
Toutes les matières : maths, français, langues, sciences
Professeurs diplômés et expérimentés
Groupes de 6 à 8 élèves maximum
Tarif : 380 € la semaine. Repas non inclus.
Inscriptions avant le 15 juin : 01 45 78 90 12`,
    },
  },
  {
    title: 'EO 15',
    sectionA: {
      taskTitle: 'Cours de cuisine',
      longText: `Soirée « COURS DE CUISINE » Animée par notre chef / Nombre de
places limité à 12 personnes / Informations et inscription par
téléphone au 418 6814123 / Restaurant « Les saveurs » Québec,
Canada, GI K 9C8 / Menus complets / Dégustation et vins /
Des recettes pour chaque participant.`,
    },
    sectionB: {
      taskTitle: 'Atelier chocolat et pâtisserie',
      longText: `CHOCOLATERIE LEBRUN – ATELIER GOURMAND
Découvrez les secrets du chocolat avec notre maître chocolatier !
Atelier pratique de 3h : fabrication de truffes, bonbons et tablettes.
Maximum 8 participants par session.
Tarif : 55 € par personne, tout le matériel fourni.
Vous repartez avec vos créations.
Réservation obligatoire : 03 45 67 89 01`,
    },
  },
  {
    title: 'EO 16',
    sectionA: {
      taskTitle: 'Cours de jardinage',
      longText: `En octobre et en novembre
Rendez-vous aux ateliers d'automne
dans les magasins « Au paradis des jardins »
Participez aux ateliers pratiques animés par
« Les jardiniers en herbe » portants sur :
- L'eau au jardin – Comment arroser et éviter les pertes d'eau ?
- Le compostage – Comment nourrir les plantes avec les déchets de son jardin et de sa cuisine.
Renseignements au 04.50.25.00.01`,
    },
    sectionB: {
      taskTitle: 'Marché aux plantes et fleurs',
      longText: `MARCHÉ AUX PLANTES – PRINTEMPS
Place du marché – Samedi 18 mai de 8h à 14h
Des centaines de variétés de plantes, fleurs et bulbes.
Conseils de jardiniers professionnels.
Concours du plus beau balcon fleuri.
Entrée libre.
Organisé par l'association « Jardins en Fête ».
Contact : 05 61 23 45 67`,
    },
  },
  {
    title: 'EO 17',
    sectionA: {
      taskTitle: 'Cours de yoga',
      longText: `Nous vous offrons des cours sur inscription variés qui vous
permettront d'acquérir des bases solides pour pouvoir ensuite
prendre part à nos cours ouverts. Ces cours vous garantissent un suivi plus
linéaire et offrent un cadre stabilisant pour l'esprit.
Introduction au Natha Yoga – Lundi 19h30
Yoga enfants (5 à 8 ans)
Yoga ados (9 à 14 ans)
Pour prendre part à ces classes, veuillez communiquer avec nous.
Tel : 514.499.1726 Pour réserver votre place.`,
    },
    sectionB: {
      taskTitle: 'Cours de pilates et méditation',
      longText: `STUDIO ZEN – PILATES & MÉDITATION
Des cours pour harmoniser corps et esprit.
Pilates débutant : mardi et jeudi 18h30
Pilates avancé : lundi et mercredi 19h00
Méditation guidée : vendredi 12h30 et dimanche 10h00
Premier cours d'essai offert.
Abonnement mensuel : 80 €
54, rue de la Paix – Tél : 01 66 77 88 99`,
    },
  },
  {
    title: 'EO 18',
    sectionA: {
      taskTitle: 'Cours de piano',
      longText: `École de piano - Enfants & adultes
113, rue du Faubourg Poissonnière 75009 Paris
01 53 20 98 97 - ecoleclassicpiano@orange.fr
Depuis 2009, au coeur du 9e arrondissement de Paris,
l'école ClassicPiano propose des cours de piano
tous niveaux du débutant au plus confirmé
à partir de 5 ans ½ et sans limites d'âge.`,
    },
    sectionB: {
      taskTitle: 'Cours de guitare',
      longText: `ÉCOLE DE MUSIQUE « LES CORDES »
Cours de guitare acoustique, électrique et classique.
Pour tous les âges, tous niveaux – débutants bienvenus !
Cours individuels (30 ou 45 min) ou en petit groupe.
Premier cours d'essai offert.
Instrument non obligatoire pour le premier cours.
Informations et inscriptions : 04 72 34 56 78 – lesCordes-musique.fr`,
    },
  },
  {
    title: 'EO 19',
    sectionA: {
      taskTitle: 'École de danse',
      longText: `Studio de danse BENNET – 7 rue de hourque
Loisirs ou compétition – Enfants à partir de 4 ans
Ados/adultes – Hip-hop – salsa – danse africaine – Rock'n roll
APPELEZ VITE ! 06 98 55 73 78`,
    },
    sectionB: {
      taskTitle: 'Atelier théâtre et improvisation',
      longText: `ATELIER THÉÂTRE « SCÈNE LIBRE »
Venez vous exprimer, jouer, créer !
Ateliers d'initiation à l'improvisation et au jeu scénique.
Tous les samedis de 14h à 17h.
Ouvert aux débutants à partir de 16 ans.
Les séances se déroulent dans une ambiance chaleureuse et bienveillante.
Tarif mensuel : 60 €. Essai gratuit.
Renseignements : 06 11 22 33 44`,
    },
  },
  {
    title: 'EO 20',
    sectionA: {
      taskTitle: 'Cours de pilotage',
      longText: `Venez vous faire plaisir sur le circuit de Bresse – Testez vos limites !
Cours de pilotage avec un moniteur professionnel
Sport – Classique – Pour les passionnés d'automobile
Renseignement et inscriptions sur cours-pilotage.com`,
    },
    sectionB: {
      taskTitle: 'Stage de karting',
      longText: `KARTING VITESSE+ – CIRCUIT HOMOLOGUÉ
Venez vivre une expérience de conduite inoubliable !
Stages de karting pour débutants et confirmés.
Demi-journée (3h) : 120 € – Journée complète : 200 €
Équipement fourni : combinaison, casque, gants.
Groupes de 6 à 10 personnes.
Réservations : 04 74 56 78 90 – kart-vitesse.fr`,
    },
  },
  {
    title: 'EO 21',
    sectionA: {
      taskTitle: 'Cours de langues étrangères',
      longText: `Apprenez une langue étrangère !
En soirée, de 19 heures à 21 heures, en semaine (hors congés)
- Efficacité et exigence
- Selon votre niveau de langue
- Apprentissage accéléré : devenez un expert en seulement deux ans !
À partir de : 350 € / 4 mois`,
    },
    sectionB: {
      taskTitle: 'Programme d\'échange linguistique',
      longText: `LINGUO-ÉCHANGE – PARTENARIATS INTERNATIONAUX
Perfectionner votre anglais, espagnol ou allemand en échangeant
avec un locuteur natif de votre région !
Séances en duo de 1h chaque semaine.
Vous enseignez votre langue maternelle, vous apprenez la sienne.
Inscription gratuite sur notre plateforme.
Plus de 500 paires actives dans toute la France.
linguo-echange.fr – Tél : 09 87 65 43 21`,
    },
  },
  {
    title: 'EO 22',
    sectionA: {
      taskTitle: 'Cours de journalisme',
      longText: `Licence Professionnelle – formation sur 9 mois – Journaliste
multimédias – École supérieure de journalisme de Lille
– Inscriptions du 10 avril au 30 juin –
Renseignements : journalisme-lille.com`,
    },
    sectionB: {
      taskTitle: 'Atelier d\'écriture créative',
      longText: `ATELIER « LA PLUME LIBRE »
Explorez votre créativité littéraire !
Nouvelles, romans, poésie, essais…
Séances bimensuelles le samedi après-midi (14h-17h).
Animation par un auteur publié.
Groupe de 8 à 12 participants.
Tarif : 30 € par séance ou 100 €/mois.
Informations : laplume-libre@gmail.com`,
    },
  },
  {
    title: 'EO 23',
    sectionA: {
      taskTitle: 'Hôtel Méribourg',
      longText: `Hôtel Méribourg - Manoir des Neiges
Forfait ski d'1 nuitée 1 petit-déjeuner 1 journée de ski
au Mont Orford ou à Owl's Head
Activités gratuites sur place à partir de 102 dollars par personne.
Des idées vacances sur cantonsdelest.com ou au 1800 300-5557`,
    },
    sectionB: {
      taskTitle: 'Location de chalet en montagne',
      longText: `CHALET LES SOMMETS – ALPES DU NORD
Chalet familial 6 personnes, vue sur les pistes.
Ski aux pieds, sauna, jacuzzi, coin feu.
À 5 min des remontées mécaniques.
Tarifs hiver : 1 200 €/semaine (basse saison) – 1 800 €/semaine (haute saison).
Draps et serviettes fournis.
Réservations : chaletlessommets.fr – 04 79 45 67 89`,
    },
  },
  {
    title: 'EO 24',
    sectionA: {
      taskTitle: 'Hôtel Boissière',
      longText: `Hôtel BOISSIÈRE
Hôtel de tourisme
À 10 minutes de Lausanne
Vous propose ses formules tout compris et de nombreux services
Téléphone : 21 613 73 29`,
    },
    sectionB: {
      taskTitle: 'Gîte à la campagne',
      longText: `GÎTE DE LA FERME DES COLLINES
Séjour authentique au cœur du Périgord.
Gîte 4 personnes avec terrasse et jardin privatif.
Piscine partagée, animaux de la ferme, produits locaux.
Calme et verdure garantis.
Tarif semaine : 700 € à 1 000 € selon saison.
Ouvert d'avril à octobre.
Contact : 05 53 12 34 56 – ferme-des-collines.fr`,
    },
  },
  // ──────────────────────────────────────────────────────
  // EO 25 – 52 : both sections created fresh
  // ──────────────────────────────────────────────────────
  {
    title: 'EO 25',
    sectionA: {
      taskTitle: 'Voiture d\'occasion à vendre',
      longText: `À VENDRE – RENAULT CLIO 5 – 2020
Couleur : Gris acier – 42 000 km
Climatisation, GPS, Bluetooth, régulateur de vitesse.
Contrôle technique OK, carnet d'entretien complet.
Prix demandé : 12 500 € – Négociable.
Tél : 06 34 56 78 90`,
    },
    sectionB: {
      taskTitle: 'Location de voiture',
      longText: `AUTO-ÉVASION – LOCATION DE VÉHICULES
Citadines, berlines, SUV, utilitaires.
Tarifs à partir de 35 €/jour.
Kilométrage illimité sur tous nos forfaits.
Disponible 7j/7 – Livraison à domicile possible.
Réservation en ligne : auto-evasion.fr
ou par téléphone : 04 91 23 45 67`,
    },
  },
  {
    title: 'EO 26',
    sectionA: {
      taskTitle: 'Offre d\'emploi – Assistant(e) de direction',
      longText: `SOCIÉTÉ DUPONT ASSOCIÉS – PARIS 8e
Recrute ASSISTANT(E) DE DIRECTION (H/F)
CDI – Temps plein
Missions : gestion agenda, traitement courriers, accueil téléphonique.
Profil : Bac+2, expérience 2 ans min., parfaite maîtrise du français,
bon niveau en anglais.
Salaire : selon profil.
CV + lettre de motivation : recrutement@dupont-associes.fr`,
    },
    sectionB: {
      taskTitle: 'Formation bureautique et secrétariat',
      longText: `CENTRE DE FORMATION PRO-COMPÉTENCES
FORMATION BUREAUTIQUE & SECRÉTARIAT
Durée : 3 mois – Temps plein ou partiel
Contenu : Word, Excel, PowerPoint, gestion administrative, accueil.
Certification reconnue par l'État.
Financement possible par CPF.
Prochaine session : 2 septembre.
Renseignements : 01 55 66 77 88 – procompetences.fr`,
    },
  },
  {
    title: 'EO 27',
    sectionA: {
      taskTitle: 'Cours de natation',
      longText: `AQUA-CLUB – PISCINE OLYMPIQUE
Cours de natation pour adultes et enfants
- Bébés nageurs (6-36 mois)
- Initiation enfants (4-7 ans)
- Perfectionnement (tous âges)
- Préparation compétition
Saison septembre–juin. Inscriptions à partir d'août.
Tarif mensuel : 45 € – Famille : 120 €.
Renseignements : 03 21 45 67 89`,
    },
    sectionB: {
      taskTitle: 'Club de plongée sous-marine',
      longText: `BLEU PROFOND – CLUB DE PLONGÉE
Initiez-vous à la plongée sous-marine !
Stages de découverte en piscine et en mer.
Formations PADI et CMAS proposées.
Tous niveaux, à partir de 10 ans.
Sorties club chaque weekend en mer.
Matériel en location disponible.
Contact : 04 94 56 78 90 – bleuprofond-plongee.fr`,
    },
  },
  {
    title: 'EO 28',
    sectionA: {
      taskTitle: 'Restaurant gastronomique',
      longText: `RESTAURANT « L'OLIVIER »
Cuisine méditerranéenne raffinée
Menu déjeuner : 38 € – Menu dégustation : 75 €
Carte des vins sélection régionale
Terrasse ombragée – Privatisation possible
Réservations conseillées : 04 67 89 01 23
12, place de la Fontaine – Ouvert mardi–samedi`,
    },
    sectionB: {
      taskTitle: 'Service traiteur pour événements',
      longText: `TRAITEUR « SAVEURS & PRESTIGE »
Pour vos réceptions, mariages, baptêmes et événements d'entreprise.
Menu sur mesure, adapté à votre budget.
Personnel de service professionnel inclus.
Vaisselle et matériel loués ou fournis.
Dégustation préalable gratuite.
Devis gratuit sous 48h : 06 45 67 89 01 – saveurs-prestige.fr`,
    },
  },
  {
    title: 'EO 29',
    sectionA: {
      taskTitle: 'Circuit touristique en Provence',
      longText: `VOYAGES MISTRAL – CIRCUIT PROVENCE AUTHENTIQUE
7 jours / 6 nuits – Départ Paris
Au programme : Avignon, les Baux-de-Provence, Arles, la Camargue.
Visites guidées, hébergement 3 étoiles, demi-pension.
Transport en car climatisé.
Tarif : 890 € par personne.
Départs mai, juin et septembre.
Réservations : 01 48 90 12 34 – voyages-mistral.fr`,
    },
    sectionB: {
      taskTitle: 'Agence de voyages sur mesure',
      longText: `HORIZON VOYAGES – VOYAGES SUR MESURE
Partez où vous voulez, quand vous voulez !
Nos conseillers construisent votre voyage idéal.
Vols, hôtels, location de voitures, activités…
Destinations : Europe, Amérique, Asie, Afrique.
Consultation gratuite en agence ou par téléphone.
Agence principale : 45, avenue du Maréchal-Joffre
Tél : 02 40 56 78 90`,
    },
  },
  {
    title: 'EO 30',
    sectionA: {
      taskTitle: 'Festival de jazz',
      longText: `FESTIVAL JAZZ EN VILLE – 18e ÉDITION
Du 12 au 16 juillet – Place de la République
Plus de 50 concerts gratuits en plein air !
Grands noms du jazz national et international.
Restauration et buvette sur place.
Programme complet sur jazzEnVille.fr
Renseignements mairie : 03 56 78 90 12`,
    },
    sectionB: {
      taskTitle: 'Concert de musique classique',
      longText: `ORCHESTRE PHILHARMONIQUE DE LA RÉGION
Concert de gala – Grande salle des fêtes
Programme : Beethoven, Ravel, Debussy
Samedi 25 octobre à 20h30
Tarifs : Catégorie A : 45 € – Catégorie B : 30 € – Moins de 26 ans : 15 €
Billets en vente à l'Office de Tourisme et sur philharmonique-region.fr
Tél : 03 67 89 01 23`,
    },
  },
  {
    title: 'EO 31',
    sectionA: {
      taskTitle: 'Exposition de peinture',
      longText: `GALERIE D'ART CONTEMPORAIN « LES HORIZONS »
Exposition : « Couleurs du Monde »
Peintures, sculptures, photographies d'artistes de 12 pays.
Du 5 mars au 30 avril – Du mardi au dimanche 10h–19h.
Entrée libre – Visites guidées samedi à 15h.
Ateliers créatifs pour enfants les mercredis.
5, rue des Artistes – Tél : 01 34 56 78 90`,
    },
    sectionB: {
      taskTitle: 'Vente aux enchères',
      longText: `MAISON DE VENTES AUX ENCHÈRES « PRESTIGE »
Vacation mobilier, tableaux et objets d'art
Exposition publique : vendredi 14 juin de 14h à 19h
                       samedi 15 juin de 10h à 12h
Vente : samedi 15 juin à 14h30
Catalogue disponible sur prestige-encheres.fr
Renseignements : 01 45 67 89 23`,
    },
  },
  {
    title: 'EO 32',
    sectionA: {
      taskTitle: 'Pension pour animaux',
      longText: `PENSION « LES AMIS À PATTES »
Garderie et pension pour chiens et chats.
Accueil dans un cadre familial et sécurisé.
Chaque animal a sa propre chambre et un espace de jeu.
Tarif chien : 22 €/nuit – Tarif chat : 15 €/nuit.
Vétérinaire partenaire disponible.
Réservation obligatoire : 06 78 90 12 34`,
    },
    sectionB: {
      taskTitle: 'École de dressage pour chiens',
      longText: `CYNOPHILE ACADEMY
Dressage et éducation pour tous les chiens.
Cours collectifs : dimanche matin, 9h à 11h.
Cours particuliers sur rendez-vous.
Spécialité : chiens difficiles et chiens de travail.
Éducateurs diplômés ACACED.
Tarif cours collectif : 15 €/séance.
Renseignements : 07 56 78 90 12`,
    },
  },
  {
    title: 'EO 33',
    sectionA: {
      taskTitle: 'Jardin communautaire',
      longText: `JARDINS PARTAGÉS DE LA VILLE
Rejoignez notre communauté de jardiniers urbains !
Parcelles de 20 m² disponibles à la location : 40 €/an.
Eau, outils et compost fournis.
Animations et ateliers tout au long de l'année.
Ouvert à tous, débutants bienvenus.
Dossier de candidature : service.espaces-verts@mairie.fr
Tél : 03 45 67 89 01`,
    },
    sectionB: {
      taskTitle: 'Pépinière et jardinerie',
      longText: `PÉPINIÈRE « LE JARDIN DE SOPHIE »
Vente de plantes d'intérieur et d'extérieur.
Arbres fruitiers, rosiers, haies, arbustes.
Conseils personnalisés par nos horticulteurs.
Ateliers mensuels gratuits : rempotage, taille, plantation.
Ouvert du lundi au samedi 8h30–18h30.
Dimanche matin 9h–12h.
Route de la Campagne – Tél : 02 34 56 78 90`,
    },
  },
  {
    title: 'EO 34',
    sectionA: {
      taskTitle: 'Médiathèque municipale',
      longText: `MÉDIATHÈQUE CENTRALE – SERVICES ET HORAIRES
Livres, DVD, magazines, jeux vidéo, ressources numériques.
Accès Internet gratuit – Impression 0,10 €/page.
Inscription gratuite avec justificatif de domicile.
Heures d'ouverture : mardi-vendredi 10h–19h, samedi 9h–17h.
Ateliers lecture pour enfants : mercredi 14h30.
Club lecture adulte : premier jeudi du mois 18h.
Tél : 03 23 45 67 89`,
    },
    sectionB: {
      taskTitle: 'Librairie indépendante',
      longText: `LIBRAIRIE « LE LIVRE OUVERT »
Votre librairie de quartier depuis 1985.
Sélection soigneuse de romans, essais, BD, livres jeunesse.
Commande possible en 48h si non disponible en rayon.
Club des lecteurs : réductions et rencontres avec les auteurs.
Dédicaces et événements littéraires réguliers.
12, rue des Écoles – Tél : 01 56 78 90 23
livreouvert-librairie.fr`,
    },
  },
  {
    title: 'EO 35',
    sectionA: {
      taskTitle: 'Cinéma en plein air',
      longText: `CINÉ ÉTOILES – CINÉMA EN PLEIN AIR
Chaque vendredi soir de juillet et août au Parc Municipal.
Projection à la tombée de la nuit (vers 21h30).
Séances gratuites et ouvertes à tous.
Apportez votre tapis ou votre chaise !
Programme sur cine-etoiles.fr
Buvette et snacks sur place.
Renseignements : 04 56 78 90 12`,
    },
    sectionB: {
      taskTitle: 'Théâtre municipal – nouvelle saison',
      longText: `THÉÂTRE DE LA VILLE – SAISON 2025-2026
Abonnements ouverts dès maintenant !
Au programme : comédies, drames, spectacles jeune public, danse.
Abonnement découverte (4 spectacles) : 80 €
Abonnement fidèle (8 spectacles) : 150 €
Tarif réduit : étudiants, demandeurs d'emploi, moins de 18 ans.
Billetterie : 03 45 67 89 01 – theatre-ville.fr`,
    },
  },
  {
    title: 'EO 36',
    sectionA: {
      taskTitle: 'Cabinet médical – nouveaux patients',
      longText: `DR MARTIN – MÉDECIN GÉNÉRALISTE
Accepte de nouveaux patients
Consultation sur rendez-vous et en urgence
Secteur 1 – Carte Vitale acceptée
Horaires : lundi-vendredi 8h–12h et 14h–18h
Rendez-vous en ligne : doctolib.fr
ou par téléphone : 01 45 67 89 23
13, avenue des Fleurs`,
    },
    sectionB: {
      taskTitle: 'Pharmacie de garde',
      longText: `PHARMACIE CENTRALE – INFORMATIONS
Pharmacie de garde ce weekend.
Samedi et dimanche 9h–20h
Médicaments, conseils pharmaceutiques, matériel médical.
Livraison à domicile disponible pour les personnes à mobilité réduite.
Prise en charge des ordonnances électroniques.
Tél : 01 78 90 12 34 – pharmaciecentrale.fr`,
    },
  },
  {
    title: 'EO 37',
    sectionA: {
      taskTitle: 'Salon de coiffure – ouverture',
      longText: `SALON « COIFF & STYLE » – OUVERTURE
Venez découvrir notre nouveau salon de coiffure mixte !
Coupes tendance, colorations naturelles, soins capillaires.
Produits bio et éco-responsables.
Tarifs : Coupe femme à partir de 35 € – Coupe homme : 25 €.
Ouvert du mardi au samedi 9h–19h.
Rendez-vous au 06 78 90 12 34.
15, rue de la Paix`,
    },
    sectionB: {
      taskTitle: 'Institut de beauté',
      longText: `INSTITUT BEAUTÉ « ÉCLAT NATUREL »
Vos soins beauté dans un cadre apaisant.
Soins du visage, épilation, manucure, massage.
Nouveauté : soins au fil de plantes et gommages naturels.
Forfaits découverte dès 60 € – Carte fidélité offerte.
Prise de rendez-vous : 06 90 12 34 56
ou en ligne : eclat-naturel-beaute.fr`,
    },
  },
  {
    title: 'EO 38',
    sectionA: {
      taskTitle: 'Boulangerie artisanale',
      longText: `BOULANGERIE DESNOYERS – ARTISAN BOULANGER
Pains au levain, baguettes tradition, pains spéciaux.
Viennoiseries et pâtisseries maison.
Ouvert du mardi au dimanche de 7h à 13h30.
Fermeture le lundi.
Commandes spéciales pour fêtes sur devis.
4, place du Marché – Tél : 02 34 56 78 90`,
    },
    sectionB: {
      taskTitle: 'Épicerie fine et produits régionaux',
      longText: `« LE TERROIR EN VILLE » – ÉPICERIE FINE
Fromages, charcuteries, huiles, vins de régions de France.
Coffrets cadeaux sur mesure pour toutes occasions.
Livraison à domicile possible.
Dégustation gratuite le samedi 11h–13h.
Commandes en ligne : leterroir-enville.fr
Ouvert du lundi au samedi 9h–20h.
Tél : 05 67 89 01 23`,
    },
  },
  {
    title: 'EO 39',
    sectionA: {
      taskTitle: 'Service de garde d\'enfants',
      longText: `HALTE-GARDERIE « LES PETITS MALINS »
Accueil d'enfants de 6 mois à 3 ans
Du lundi au vendredi, de 7h30 à 19h00
Personnel qualifié – Activités d'éveil
Repas biologiques préparés sur place
Tarif horaire calculé selon revenus des familles
Inscription sur dossier – Liste d'attente possible
Contactez-nous : 01 67 89 01 23`,
    },
    sectionB: {
      taskTitle: 'Crèche parentale coopérative',
      longText: `CRÈCHE PARENTALE « LES BOUT'CHOUX »
Structure associative gérée par les parents.
Accueil de 15 enfants de 3 mois à 3 ans.
Parents impliqués : 2 demi-journées de participation par mois.
Pédagogie bienveillante et activités artistiques.
Tarifs selon barème CAF.
Réunion d'information : premier mardi de chaque mois.
Contact : boutchoux-creche@gmail.com`,
    },
  },
  {
    title: 'EO 40',
    sectionA: {
      taskTitle: 'Déménagement professionnel',
      longText: `DÉMÉNAGEMENTS RAPIDE & SOIGNÉS
Service professionnel de déménagement
Emballage, chargement, livraison, déballage.
Camions toutes dimensions. Assurance tous risques incluse.
Devis gratuit à domicile sous 24h.
Disponible 7j/7, week-ends et jours fériés.
Tél : 04 78 90 12 34 – demenagement-rs.fr`,
    },
    sectionB: {
      taskTitle: 'Location de box de stockage',
      longText: `STOCK'ESPACE – GARDE-MEUBLES & BOX
Stockage sécurisé pour particuliers et professionnels.
Boxes de 1 m² à 50 m², accessibles 24h/24.
Surveillance vidéo, alarme individuelle.
Tarifs à partir de 29 €/mois.
Contrat sans engagement.
4 sites dans la ville.
Renseignements : 04 90 12 34 56 – stock-espace.fr`,
    },
  },
  {
    title: 'EO 41',
    sectionA: {
      taskTitle: 'Réparation informatique',
      longText: `TECHNO-FIX – DÉPANNAGE & RÉPARATION INFORMATIQUE
Ordinateurs, tablettes, smartphones – Toutes marques.
Diagnostic gratuit. Réparation sous 24-48h.
Remplacement d'écrans, claviers, batteries.
Récupération de données.
Logiciels, antivirus, installation Windows/Mac.
Ouvert du lundi au samedi 9h–18h.
Tél : 06 01 23 45 67 – technofix.fr`,
    },
    sectionB: {
      taskTitle: 'Cours d\'informatique pour seniors',
      longText: `ESPACE NUMÉRIQUE « CLIQUEZ SEREIN »
Cours d'informatique spécialement conçus pour les seniors.
Apprenez à utiliser votre ordinateur, tablette, smartphone.
Internet, messagerie, réseaux sociaux, achats en ligne…
Groupes de 5 maximum pour un suivi personnalisé.
Tarif : 20 € la séance de 2h.
Lundi, mercredi et vendredi matin.
Contact : 03 12 34 56 78`,
    },
  },
  {
    title: 'EO 42',
    sectionA: {
      taskTitle: 'Auto-école',
      longText: `AUTO-ÉCOLE « PREMIÈRE VOIE »
Permis B, permis A, code en ligne.
Moniteurs diplomés, véhicules récents.
Formule accélérée disponible (permis en 3 semaines).
Financement en plusieurs fois sans frais.
Premier cours offert pour les nouveaux inscrits !
48, rue des Ecoles – Tél : 01 23 45 67 89
premiereVoie-autoecole.fr`,
    },
    sectionB: {
      taskTitle: 'Stage de conduite accompagnée',
      longText: `STAGE CONDUITE ACCOMPAGNÉE (AAC)
Votre enfant a 15 ans ? Préparez-le en avance !
Stage de 2 jours pour démarrer la conduite accompagnée.
Code de la route, équilibres, freinage d'urgence, manœuvres.
8 à 10 élèves max par stage.
Prochaines dates : 20-21 juin et 18-19 juillet.
Tarif : 250 € le stage.
Réservations : 01 34 56 78 90`,
    },
  },
  {
    title: 'EO 43',
    sectionA: {
      taskTitle: 'Club de lecture',
      longText: `CLUB DES LECTEURS PASSIONNÉS
Rejoignez notre club de lecture mensuel !
Un livre par mois, des échanges enrichissants.
Rencontre le dernier jeudi du mois à 19h30.
À la Médiathèque – Salle des associations.
Ouverts aux nouveaux membres toute l'année.
Inscription gratuite à l'accueil de la médiathèque.
Contact : lecteurs-passionnes@gmail.com`,
    },
    sectionB: {
      taskTitle: 'Atelier d\'écriture pour jeunes',
      longText: `ATELIER ÉCRITURE JEUNES – 14-18 ANS
Tu aimes écrire ? Rejoins notre atelier !
Nouvelles, poèmes, scripts, journaux intimes…
Séances hebdomadaires le mercredi 15h–17h.
Animation par un auteur jeunesse.
Participation aux prix littéraires régionaux.
Gratuit – Places limitées à 10.
Inscription : Maison des Jeunes, Tél : 04 67 89 01 23`,
    },
  },
  {
    title: 'EO 44',
    sectionA: {
      taskTitle: 'Randonnée en montagne',
      longText: `CLUB ALPIN LOCAL – RANDONNÉES GUIDÉES
Découvrez la montagne avec un guide diplômé !
Sorties chaque weekend de mai à octobre.
Niveaux : facile, intermédiaire, sportif.
Matériel conseillé : chaussures de marche, gourde, lunettes de soleil.
Adhésion annuelle : 35 €. Participation sorties : 15 €.
Réunion d'information : mardi 18h30 au Club.
Tél : 04 50 23 45 67`,
    },
    sectionB: {
      taskTitle: 'Camping nature 4 étoiles',
      longText: `CAMPING « LES PINS BLEUS » – ARDÈCHE
Ouvert d'avril à octobre.
250 emplacements ombragés au bord de l'Ardèche.
Piscine, épicerie, restaurant, animations estivales.
Mobil-homes et chalets à louer (4 à 6 personnes).
Tarifs camping : 20 €/nuit (2 pers + tente).
Réservation en ligne : camping-pinsbleus.fr
Tél : 04 75 34 56 78`,
    },
  },
  {
    title: 'EO 45',
    sectionA: {
      taskTitle: 'Location de salle événementielle',
      longText: `LE DOMAINE DES CERISIERS
Location de salles et espaces pour tous vos événements.
Mariages, anniversaires, séminaires d'entreprise.
Capacité : 50 à 300 personnes.
Salle de réunion, grande salle de réception, parc.
Parking privatif 100 places.
Devis personnalisé gratuit.
Tél : 03 80 56 78 90 – domainedescerisiers.fr`,
    },
    sectionB: {
      taskTitle: 'Organisation de mariages sur mesure',
      longText: `WEDDING PLANNER « JOUR DE FÊTE »
Confiez l'organisation de votre mariage à notre équipe.
Coordination complète ou partielle selon vos besoins.
Décoration, fleuriste, photographe, traiteur, animations…
Carnet d'adresses de prestataires de confiance.
Premier entretien de conseil gratuit.
Notre engagement : votre jour parfait, sans stress.
Contact : 06 12 34 56 78 – jouradefete.fr`,
    },
  },
  {
    title: 'EO 46',
    sectionA: {
      taskTitle: 'Cours de dessin et aquarelle',
      longText: `ATELIER DES ARTS – COURS DE DESSIN & AQUARELLE
Pour adultes et enfants à partir de 8 ans.
Cours hebdomadaires de 2h, tous niveaux.
Technique du dessin au crayon, encre, aquarelle.
Matériel disponible sur place.
Expositions de fin d'année des élèves.
Tarif mensuel : 70 €.
Renseignements : 05 56 78 90 12 – atelierdesarts.fr`,
    },
    sectionB: {
      taskTitle: 'Atelier de poterie et céramique',
      longText: `TERRE & FEUX – ATELIER CÉRAMIQUE
Initiez-vous à la poterie au tour et à la sculpture.
Séances de 3h le samedi et dimanche matin.
Maximum 8 participants par atelier.
Le matériel et la cuisson des pièces sont inclus.
Vous repartez avec vos créations.
Abonnement mensuel (4 séances) : 120 €.
Réservations : 06 90 12 34 56`,
    },
  },
  {
    title: 'EO 47',
    sectionA: {
      taskTitle: 'Conférence sur le développement durable',
      longText: `CYCLE DE CONFÉRENCES « VIVRE AUTREMENT »
Développement durable et modes de vie écoresponsables
Conférence n°3 : Zéro déchet au quotidien
Jeudi 17 octobre à 19h00 – Maison des associations
Intervenante : Dr Sophie Legrand, docteure en environnement.
Entrée libre sur inscription.
Inscription : vivreautrement@association.fr`,
    },
    sectionB: {
      taskTitle: 'Séminaire professionnel – management',
      longText: `FORMATION MANAGEMENT – LEADERSHIP POSITIF
1 journée intensive pour managers et chefs d'équipe.
Thème : Motiver et fédérer une équipe dans la durée.
Prochaine session : vendredi 8 novembre – 9h à 17h30.
Lieu : Hôtel des Congrès, salle Horizon.
Tarif : 390 € HT (déjeuner inclus).
Nombre de places limité : 20 participants.
Inscription : management-leadership.fr – 01 89 01 23 45`,
    },
  },
  {
    title: 'EO 48',
    sectionA: {
      taskTitle: 'Club de bridge',
      longText: `CLUB DE BRIDGE « LES AS »
Rejoignez notre club convivial !
Séances de jeu : mardi soir 19h30 et dimanche 14h30.
Cours d'initiation et de perfectionnement.
Tournois mensuels ouverts à tous.
Cotisation annuelle : 80 €. Séances libres : 5 €.
Tout niveaux – Débutants bienvenus !
Contact : clubbridge-lesAs@gmail.com`,
    },
    sectionB: {
      taskTitle: 'Tournoi d\'échecs',
      longText: `TOURNOI D'ÉCHECS OPEN – TOUTES CATÉGORIES
Organisé par le Club des Rois
Samedi 30 novembre de 9h à 19h – Salle des Sports
Catégories : Minimes, Juniors, Adultes (open et classifié).
Inscription avant le 25 novembre : 15 €/participant.
Lots et trophées pour les 3 premiers de chaque catégorie.
Arbitre officiel FIDE présent.
club-des-rois-echecs.fr`,
    },
  },
  {
    title: 'EO 49',
    sectionA: {
      taskTitle: 'Location de voilier',
      longText: `NAUTI-ÉVASION – LOCATION DE BATEAUX DE PLAISANCE
Voiliers de 7 à 14 m, avec ou sans skipper.
Départ du port de La Rochelle.
Location à la journée ou à la semaine.
Permis cotier ou hauturier requis (sans skipper).
Cours de voile disponibles sur demande.
Tarif semaine voilier 9m : 1 200 €.
Tél : 05 46 78 90 12 – nauti-evasion.fr`,
    },
    sectionB: {
      taskTitle: 'Croisière en Méditerranée',
      longText: `COMPAGNIE AZUR CROISIÈRES
Croisière en Méditerranée – 7 nuits
Départ Marseille – Escales : Barcelone, Palma, Gênes, Nice.
Cabine double intérieure à partir de 850 €/personne.
Pension complète, animations à bord, accès piscine.
Réductions enfants et seniors.
Prochains départs : juin, juillet, août, septembre.
Réservations : 04 91 45 67 89 – azur-croisieres.fr`,
    },
  },
  {
    title: 'EO 50',
    sectionA: {
      taskTitle: 'Association sportive – Football',
      longText: `AS SPORTING CLUB – RECRUTEMENT
L'association sportive de football recrute !
Catégories U8 à U18 et équipe seniors.
Entraînements : mardi et jeudi soir, match le samedi.
Licence FFF, assurance incluse.
Cotisation annuelle : 150 € seniors – 80 € jeunes.
Premier entraînement d'essai gratuit.
Stade municipal – Tél : 06 23 45 67 89`,
    },
    sectionB: {
      taskTitle: 'Tournoi de tennis amateur',
      longText: `TENNIS CLUB DU SOLEIL – OPEN ESTIVAL
Tournoi ouvert à tous les niveaux amateurs
Du 5 au 12 juillet – Courts couverts et extérieurs
Simple et double hommes, dames et mixte.
Inscriptions avant le 28 juin : 25 €/participant.
Lots pour les finalistes, repas de gala samedi soir.
Inscriptions : tennisclubdusoleil.fr
Renseignements : 04 34 56 78 90`,
    },
  },
  {
    title: 'EO 51',
    sectionA: {
      taskTitle: 'Location de matériel de ski',
      longText: `SKI CONFORT – LOCATION MATÉRIEL DE SKI
Skis, chaussures, casques, bâtons.
Tarifs dégressifs à partir de 3 jours.
Formule familiale très avantageuse.
Cartes de fidélité pour les habitués.
Service réglage et affûtage inclus.
Ouvert 7j/7 en saison (décembre–avril), 9h–19h.
Place des Remontées – Tél : 04 79 12 34 56`,
    },
    sectionB: {
      taskTitle: 'Forfaits remontées mécaniques',
      longText: `DOMAINE SKIABLE DES GRANDES PISTES
Forfaits ski 2025-2026 – Tarifs préférentiels
Demi-journée : 28 € adulte – 22 € enfant
Journée : 45 € adulte – 35 € enfant
Semaine (6 jours) : 190 € adulte – 145 € enfant
Débutants : cours collectifs ESF inclus dans certains forfaits.
Réduction 10 % pour réservation en ligne avant le 1er décembre.
grandespistesSki.fr – Tél : 04 79 56 78 90`,
    },
  },
  {
    title: 'EO 52',
    sectionA: {
      taskTitle: 'Cours de photographie',
      longText: `PHOTO ACADÉMIE – COURS POUR TOUS
Apprenez la photographie avec des professionnels !
Initiation au reflex et hybride – Tous niveaux.
Modules : composition, lumière, retouche, portrait, paysage.
Cours en groupe (8 pers. max) ou individuels.
Sorties photo en ville et en nature.
Tarif mensuel (4 cours de 2h) : 95 €.
Inscriptions : 01 78 90 12 34 – photoacademie.fr`,
    },
    sectionB: {
      taskTitle: 'Concours de photographie',
      longText: `CONCOURS PHOTO « REGARDS SUR MA VILLE »
Ouvert à tous – Amateurs et semi-professionnels.
Thème : « La vie quotidienne en ville »
Catégories : Noir & Blanc, Couleur, Reportage.
1 à 3 photos par participant (format numérique).
Date limite de dépôt : 30 septembre.
Exposition des œuvres sélectionnées en novembre.
Lots : matériel photo et stages. Inscription gratuite.
concours-photo-maville.fr`,
    },
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function main() {
  const connectionString = (process.env.DATABASE_URL || '')
    .replace('sslmode=require', 'sslmode=no-verify')
    .replace(':6543/', ':5432/');
  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  let createdSeries = 0;
  let createdQuestions = 0;
  let skipped = 0;

  try {
    for (const data of SERIES_DATA) {
      // Check if series already exists
      const existing = await prisma.series.findFirst({
        where: { title: data.title, moduleId: EO_MODULE_ID },
      });

      let seriesId;
      if (existing) {
        seriesId = existing.id;
        console.log(`⏭  ${data.title} déjà existante (id=${seriesId}) — mise à jour des sections`);
        skipped++;
        // Delete existing questions for this series to re-create
        await prisma.question.deleteMany({ where: { seriesId } });
      } else {
        // Create the series
        const newSeries = await prisma.series.create({
          data: {
            title: data.title,
            moduleId: EO_MODULE_ID,
            isFree: false,
          },
        });
        seriesId = newSeries.id;
        createdSeries++;
        process.stdout.write(`   ✔ Série créée : ${data.title}\r`);
      }

      // Create Section A
      await prisma.question.create({
        data: {
          moduleId:      EO_MODULE_ID,
          seriesId:      seriesId,
          questionOrder: 1,
          category:      'SECTION_A',
          taskTitle:     data.sectionA.taskTitle,
          longText:      data.sectionA.longText,
          question:      CONSIGNE_A,
          audioUrl:      null,
          imageUrl:      null,
        },
      });

      // Create Section B
      await prisma.question.create({
        data: {
          moduleId:      EO_MODULE_ID,
          seriesId:      seriesId,
          questionOrder: 2,
          category:      'SECTION_B',
          taskTitle:     data.sectionB.taskTitle,
          longText:      data.sectionB.longText,
          question:      CONSIGNE_B,
          audioUrl:      null,
          imageUrl:      null,
        },
      });
      createdQuestions += 2;
    }

    console.log(`\n✅ Terminé !`);
    console.log(`   Séries créées   : ${createdSeries}`);
    console.log(`   Séries mises à jour : ${skipped}`);
    console.log(`   Questions créées : ${createdQuestions}`);

    // Summary check
    const total = await prisma.series.count({ where: { moduleId: EO_MODULE_ID } });
    console.log(`📊 Total séries EO en base : ${total}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
