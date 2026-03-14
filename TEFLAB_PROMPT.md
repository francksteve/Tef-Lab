# PROMPT COMPLET — PLATEFORME Tef-Lab
> À coller directement dans **Claude Code** (claude.ai/code) pour générer le projet fullstack

---

## 🎯 OBJECTIF

Crée une plateforme web fullstack complète appelée **Tef-Lab** — site de préparation
au TEF Canada destiné aux candidats camerounais.

---

## 🔐 COMPTE ADMINISTRATEUR PAR DÉFAUT

Lors de l'initialisation de la base de données (seed), créer automatiquement
un compte administrateur avec les identifiants suivants :

```
Email    : tifuzzied@gmail.com
Password : admin@tef-lab
Role     : ADMIN
```

**Important** : À la première connexion, l'admin est redirigé vers une page
obligatoire de changement de mot de passe avant d'accéder au dashboard.
Un bandeau d'avertissement rouge s'affiche : "⚠️ Vous utilisez le mot de passe
par défaut. Veuillez le modifier immédiatement pour sécuriser votre compte."

---

## 🛒 PROCESSUS DE COMMANDE D'UN PACK (VISITEUR → ABONNÉ)

Le processus de commande est **entièrement manuel et piloté par l'admin**.
Il n'y a pas de paiement en ligne automatique. Voici le flux exact :

### Étape 1 — Le visiteur clique sur "Commander" sur un pack
Sur la page d'accueil ou `/packs`, chaque pack affiche un bouton **"Commander"**.
En cliquant dessus, une **modale** s'ouvre avec un formulaire :

```
Champs du formulaire de commande :
- Prénom et Nom (obligatoire)
- Email (obligatoire)
- Numéro de téléphone WhatsApp (obligatoire, format +237XXXXXXXXX)
- Pack sélectionné (pré-rempli, non modifiable)
- Prix affiché (en FCFA, non modifiable)
- Message optionnel (ex: "Je paye par Orange Money")
```

### Étape 2 — Soumission du formulaire → notifications automatiques à l'admin

À la soumission du formulaire, le système déclenche **simultanément** :

#### A) Envoi d'un email à l'admin (`tifuzzied@gmail.com`)
Via Nodemailer (SMTP Gmail ou Resend.dev). Contenu de l'email :

```
Objet : 🆕 Nouvelle commande Tef-Lab — [Nom du pack] — [Nom du client]

Corps :
Une nouvelle commande vient d'être passée sur Tef-Lab.

📋 DÉTAILS DE LA COMMANDE
──────────────────────────
Référence     : TEFLAB-[timestamp]
Pack          : [Nom du pack]
Prix          : [Prix] FCFA
Date          : [Date et heure]

👤 INFORMATIONS CLIENT
──────────────────────
Nom           : [Prénom Nom]
Email         : [email]
WhatsApp      : [numéro]
Message       : [message optionnel]

📲 PROCHAINES ÉTAPES
──────────────────────
1. Contactez le client sur WhatsApp pour recevoir la preuve de paiement
2. Une fois le paiement confirmé, validez la commande dans le dashboard admin :
   → https://tef-lab.com/admin/commandes

Lien direct WhatsApp client :
https://wa.me/[numéro_sans_+]?text=Bonjour%20[Prénom]%2C%20nous%20avons%20bien%20reçu%20votre%20commande%20pour%20le%20pack%20[NomPack]%20sur%20Tef-Lab.%20Veuillez%20nous%20envoyer%20la%20preuve%20de%20paiement%20de%20[Prix]%20FCFA.%20Merci%20!
```

#### B) Ouverture automatique d'un lien WhatsApp vers l'admin
Dès la soumission, le navigateur ouvre dans un nouvel onglet :

```
https://wa.me/237683008287?text=Bonjour%2C%20je%20souhaite%20commander%20le%20pack%20[NomPack]%20sur%20Tef-Lab.%20Mon%20nom%20est%20[PrénomNom]%2C%20mon%20email%20est%20[email].%20Référence%20commande%20%3A%20TEFLAB-[timestamp].%20Montant%20%3A%20[Prix]%20FCFA.
```

Ce message est **pré-rempli automatiquement** avec les infos de la commande.

#### C) Confirmation affichée au visiteur
Après soumission, la modale affiche un message de succès :

```
✅ Votre demande a bien été enregistrée !

Référence : TEFLAB-[timestamp]

📲 Un message WhatsApp a été ouvert vers notre équipe.
   Si le lien ne s'est pas ouvert, contactez-nous directement :
   → WhatsApp : +237 683 008 287
   → Email : tifuzzied@gmail.com

💳 Modes de paiement acceptés :
   • Orange Money : +237 683 008 287
   • MTN MoMo : +237 683 008 287

⏱️ Votre compte sera activé sous 24h après confirmation du paiement.
```

### Étape 3 — L'admin valide la commande dans le dashboard

Dans `/admin/commandes`, l'admin voit la commande avec le statut `PENDING`.
Il peut cliquer sur **"Valider"**, ce qui :

1. Change le statut de la commande en `VALIDATED`
2. **Crée automatiquement le compte utilisateur** avec :
   - Email et nom fournis dans le formulaire de commande
   - Mot de passe temporaire généré automatiquement (8 caractères alphanumériques)
   - Rôle : `SUBSCRIBER`
   - Pack associé avec date d'expiration calculée (aujourd'hui + durée du pack en jours)
3. **Envoie un email au client** avec ses identifiants de connexion :

```
Objet : 🎉 Votre compte Tef-Lab est activé !

Corps :
Bonjour [Prénom],

Votre paiement a été confirmé et votre compte Tef-Lab est maintenant actif !

🔑 VOS IDENTIFIANTS DE CONNEXION
──────────────────────────────────
Email        : [email]
Mot de passe : [mot_de_passe_temporaire]

🔗 Connectez-vous ici : https://tef-lab.com/connexion

📦 VOTRE PACK
──────────────
Pack         : [Nom du pack]
Validité     : [date_debut] → [date_expiration]
Modules      : [liste des modules inclus]

⚠️ Pour votre sécurité, pensez à changer votre mot de passe après connexion.

Bonne préparation ! 💪
L'équipe Tef-Lab
```

4. **Si l'admin clique sur "Rejeter"** : le statut passe à `REJECTED` et un email
   est envoyé au client pour l'informer que sa commande n'a pas pu être confirmée.

### Statuts de commande
```
PENDING   → Commande reçue, en attente de paiement
VALIDATED → Paiement confirmé, compte créé et activé
REJECTED  → Commande annulée (paiement non reçu ou litige)
```

---

## 🎨 IDENTITÉ VISUELLE

- **Nom** : Tef-Lab
- **Palette** : Bleu `#003087` | Blanc `#FFFFFF` | Rouge `#E30613`
- **Accents** : Bleu clair `#0055B3` pour les hover, Gris `#F5F5F5` pour les fonds
- **Typographie** : Inter ou Poppins (Google Fonts)
- **Logo** : "TEF CAN" en bleu gras + "237" en rouge gras
- **Style** : Professionnel, moderne, mobile-first (majorité des utilisateurs sur mobile au Cameroun)
- **Bouton WhatsApp flottant** en bas à droite, lié au `+237683008287`

---

## 🧱 STACK TECHNIQUE

- **Frontend** : Next.js 14 (App Router) + TailwindCSS
- **Backend** : API Routes Next.js ou Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL (Supabase ou Railway)
- **Auth** : NextAuth.js ou JWT maison
- **Stockage fichiers** : Supabase Storage ou Cloudinary (images + audio mp3)
- **IA scoring EE** : Appel API Anthropic Claude (claude-sonnet-4-5) pour corriger l'expression écrite
- **Emails transactionnels** : Nodemailer + SMTP Gmail ou Resend.dev
  - Email admin à chaque nouvelle commande
  - Email client à l'activation du compte (avec identifiants)
  - Email client au rejet de commande
- **WhatsApp** : Liens `wa.me` pré-remplis (pas d'API payante, ouverture navigateur)
- **Génération mot de passe temporaire** : crypto.randomBytes ou nanoid

---

## 👥 TYPES D'UTILISATEURS

### 1. VISITEUR (non connecté)
Accès à :
- Page d'accueil complète
- Informations TEF Canada
- Liste des packs et tarifs (en FCFA)
- Séries d'entraînement gratuites (3 par module, définies par l'admin)
- Page contact

### 2. ABONNÉ (connecté + pack actif)
Accès à :
- Tout ce que voit le visiteur
- Dashboard personnel
- Séries payantes débloquées selon le pack souscrit
- Les 4 modules de pratique complets
- Historique de ses résultats et scores

### 3. ADMIN (connecté + rôle `ADMIN`)
Accès à :
- Tableau de bord admin complet
- CRUD packs, modules, séries, questions
- Gestion des utilisateurs
- Gestion des commandes
- Statistiques globales

---

## 🗂️ BASE DE DONNÉES — SCHÉMA PRISMA

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(SUBSCRIBER)
  accountStatus Status    @default(ACTIVE)
  createdAt     DateTime  @default(now())
  orders        Order[]
  attempts      Attempt[]
  results       Result[]
}

enum Role {
  VISITOR
  SUBSCRIBER
  ADMIN
}

enum Status {
  ACTIVE
  SUSPENDED
}

model Pack {
  id              String   @id @default(cuid())
  name            String
  price           Int      // en FCFA
  description     String
  nbModules       Int      // 1 à 4
  nbSeriesPerModule Int
  durationDays    Int      // durée en jours
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  orders          Order[]
  series          PackSeries[]
}

model Order {
  id              String      @id @default(cuid())
  reference       String      @unique  // format: TEFLAB-[timestamp]
  // Informations visiteur (avant création de compte)
  visitorName     String
  visitorEmail    String
  visitorPhone    String      // numéro WhatsApp +237XXXXXXXXX
  visitorMessage  String?
  // Relations
  userId          String?     // null jusqu'à validation
  packId          String
  status          OrderStatus @default(PENDING)
  activatedAt     DateTime?   // date de validation
  expiresAt       DateTime?   // date d'expiration du pack
  createdAt       DateTime    @default(now())
  user            User?       @relation(fields: [userId], references: [id])
  pack            Pack        @relation(fields: [packId], references: [id])
}

enum OrderStatus {
  PENDING
  VALIDATED
  REJECTED
}

model Module {
  id          String   @id @default(cuid())
  name        String   // "Compréhension Écrite" etc.
  code        String   // CE | CO | EE | EO
  description String
  duration    Int      // en minutes
  nbQuestions Int
  series      Series[]
}

model Series {
  id          String   @id @default(cuid())
  title       String
  moduleId    String
  difficulty  String   // Facile | Moyen | Difficile
  isFree      Boolean  @default(false)
  createdAt   DateTime @default(now())
  module      Module   @relation(fields: [moduleId], references: [id])
  questions   Question[]
  packs       PackSeries[]
  attempts    Attempt[]
}

model PackSeries {
  packId   String
  seriesId String
  pack     Pack   @relation(fields: [packId], references: [id])
  series   Series @relation(fields: [seriesId], references: [id])
  @@id([packId, seriesId])
}

model Question {
  id            String   @id @default(cuid())
  moduleId      String
  seriesId      String
  questionOrder Int      // numéro de la question dans la série (1 à 40)
  category      String?  // catégorie selon le numéro (ex: "Documents quotidiens")
  longText      String?  // texte long optionnel (CE)
  imageUrl      String?  // image optionnelle (CE)
  audioUrl      String?  // fichier audio (CO obligatoire)
  question      String
  optionA       String
  optionB       String
  optionC       String
  optionD       String
  correctAnswer String   // "A" | "B" | "C" | "D"
  explanation   String?  // correction expliquée
  series        Series   @relation(fields: [seriesId], references: [id])
}

model Attempt {
  id          String   @id @default(cuid())
  userId      String
  seriesId    String
  moduleCode  String   // CE | CO | EE | EO
  answers     Json     // { questionId: "A", ... }
  writtenTask1 String? // EE tâche 1
  writtenTask2 String? // EE tâche 2
  audioTask1  String?  // EO enregistrement URL tâche 1
  audioTask2  String?  // EO enregistrement URL tâche 2
  score       Int?     // score brut (nb bonnes réponses pour CE/CO)
  aiScore     Float?   // note IA pour EE
  cecrlLevel  String?  // A1 | A2 | B1 | B2 | C1 | C2
  timeTaken   Int?     // temps en secondes
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  series      Series   @relation(fields: [seriesId], references: [id])
}

model Result {
  id         String   @id @default(cuid())
  userId     String
  moduleCode String
  avgScore   Float
  cecrlLevel String
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}
```

---

## 🔌 API BACKEND — ROUTES À CRÉER

```
POST   /api/auth/register          → inscription
POST   /api/auth/login             → connexion (retourne JWT)
GET    /api/auth/me                → profil connecté
POST   /api/auth/change-password   → changer mot de passe

GET    /api/users                  → liste users (admin)
PATCH  /api/users/:id              → modifier statut / reset password (admin)

GET    /api/modules                → liste des 4 modules
GET    /api/modules/:code/series   → séries d'un module

GET    /api/series                 → toutes les séries
POST   /api/series                 → créer une série (admin)
PATCH  /api/series/:id             → modifier (admin)
DELETE /api/series/:id             → supprimer (admin)

GET    /api/series/:id/questions   → questions d'une série
POST   /api/questions              → créer question (admin)
PATCH  /api/questions/:id          → modifier (admin)
DELETE /api/questions/:id          → supprimer (admin)

GET    /api/packs                  → liste packs actifs
POST   /api/packs                  → créer pack (admin)
PATCH  /api/packs/:id              → modifier (admin)
DELETE /api/packs/:id              → supprimer (admin)

POST   /api/orders                 → créer commande (visiteur) :
                                     - enregistre la commande en base (statut PENDING)
                                     - envoie email à l'admin (tifuzzied@gmail.com)
                                     - retourne le lien WhatsApp pré-rempli à ouvrir côté client
                                     - retourne la référence de commande
GET    /api/orders                 → liste commandes (admin)
PATCH  /api/orders/:id/validate    → valider commande (admin) :
                                     - crée le compte utilisateur avec mot de passe temporaire
                                     - associe le pack avec date d'expiration
                                     - envoie email au client avec ses identifiants
                                     - passe statut à VALIDATED
PATCH  /api/orders/:id/reject      → rejeter commande (admin) :
                                     - envoie email au client
                                     - passe statut à REJECTED

POST   /api/attempts               → soumettre une tentative
GET    /api/attempts/me            → historique de l'utilisateur connecté

POST   /api/scoring/ee             → envoyer EE à l'IA pour notation
POST   /api/scoring/eo             → envoyer transcription EO à l'IA pour notation
```

---

## 📄 PAGES DU SITE

### PAGES PUBLIQUES

#### `/` — Page d'accueil
Sections dans l'ordre :
1. **Hero** : "Réussis ton TEF Canada depuis le Cameroun 🇨🇲" — CTA "Essai gratuit" + "Voir les packs"
2. **Présentation TEF Canada** :
   - Reconnu par IRCC depuis 2002
   - 4 modules obligatoires notés de 0 à 699 points chacun
   - Résultats valables 2 ans
   - Score converti en niveaux NCLC (pour immigration) et CECRL (A1→C2)
   - Niveau minimum requis pour Entrée Express : NCLC 7
3. **Les 4 modules** : 4 cartes avec icône, titre, durée, nb questions, description
4. **Nos packs** : cartes avec nom, prix FCFA, durée, modules inclus, bouton "S'abonner"
5. **Entraînement gratuit** : 3 séries par module accessibles sans inscription
6. **Contact** :
   - Email : tifuzzied@gmail.com
   - WhatsApp : +237683008287
   - Formulaire : nom, email, message

#### `/packs` — Détail des packs
#### `/entrainement-gratuit` — Séries gratuites classées par module
#### `/contact` — Page contact complète
#### `/inscription` — Formulaire d'inscription
#### `/connexion` — Formulaire de connexion

---

### PAGES ABONNÉ (protégées)

#### `/dashboard` — Tableau de bord utilisateur
Afficher :
- Modules disponibles selon le pack
- Séries accessibles
- Essais gratuits restants
- Historique des résultats

Tableau historique :
| Module | Série | Score | Niveau CECRL | Date |

#### `/dashboard/serie/[id]` — Passer une série (CE ou CO)
- Minuterie visible et non contournable
- Navigation question par question
- Bouton "Passer" si pas de réponse
- Soumission à la fin → score immédiat + correction détaillée

#### `/dashboard/serie/[id]/ee` — Expression Écrite
- Tâche 1 (25 min) : amorce affichée + zone saisie + compteur mots (min 80)
- Tâche 2 (35 min) : sujet affiché + zone saisie + compteur mots (min 200)
- Soumission → correction par IA (voir scoring EE)

#### `/dashboard/serie/[id]/eo` — Expression Orale
- Tâche 1 : sujet affiché → temps préparation (30s) → enregistrement (5 min max)
- Tâche 2 : sujet affiché → temps préparation (60s) → enregistrement (10 min max)
- API MediaRecorder du navigateur → upload mp3 vers Supabase Storage
- Lecture de l'enregistrement pour auto-évaluation

---

### PAGES ADMIN (protégées + rôle ADMIN)

#### `/admin` — Dashboard admin
Statistiques :
- Nombre d'utilisateurs inscrits
- Nombre de tests passés (par module)
- Score moyen par module
- Packs vendus (nombre + revenus estimés)
- Commandes en attente

#### `/admin/utilisateurs` — Gestion utilisateurs
- Liste : nom, email, rôle, statut, pack actif, date inscription
- Actions : modifier statut (actif/suspendu), reset password, voir ses résultats

#### `/admin/packs` — Gestion des packs
CRUD complet. Formulaire de création/édition :
```
- Nom du pack
- Prix (FCFA)
- Description courte
- Nombre de modules inclus
- Nombre de séries par module
- Sélection des séries incluses (liste multi-select)
- Durée en jours
- Statut (actif/inactif)
```

#### `/admin/series` — Gestion des séries
CRUD complet. Formulaire :
```
- Titre de la série
- Module associé (CE | CO | EE | EO)
- Niveau de difficulté (Facile | Moyen | Difficile)
- Statut (gratuite / payante)
```
Interface spéciale : choisir exactement **3 séries gratuites par module** (limiteur visuel)

#### `/admin/questions` — Gestion des questions
CRUD complet.

**Pour CE (Compréhension Écrite) :**
- Numéro de question (1→40) + catégorie auto-assignée :
  - Q1→7 : Documents de la vie quotidienne
  - Q8→17 : Phrases et textes lacunaires
  - Q18→22 : Lecture rapide / graphiques
  - Q23→32 : Documents administratifs et professionnels
  - Q33→40 : Articles de presse
- Texte long (optionnel, textarea)
- Image (upload, optionnelle)
- Énoncé de la question (obligatoire)
- Options A / B / C / D
- Bonne réponse
- Explication/correction (optionnel)

**Pour CO (Compréhension Orale) :**
- Numéro de question + catégorie auto-assignée :
  - Q1→4 : Conversations avec dessins
  - Q5→20 : Annonces / messages courts
  - Q21→30 : Chroniques radio / interviews
  - Q31→40 : Documents audio divers
- Fichier audio (upload mp3, obligatoire)
- Image optionnelle (pour les questions avec dessins, Q1→4)
- Énoncé, Options A/B/C/D, Bonne réponse

**Pour EE (Expression Écrite) :**
- Tâche 1 : amorce de l'article (texte de départ)
- Tâche 2 : affirmation extraite d'un journal (sujet de dissertation)
- Exemples de sujets Tâche 1 : "Mariages au sommet", "Un lion sème la panique", etc.
- Exemples de sujets Tâche 2 : "Il faut supprimer la publicité à la télévision", etc.

**Pour EO (Expression Orale) :**

Section A :
- Titre de l'annonce
- Type d'annonce (offre_emploi / loisirs / services / logement / autre)
- Texte de l'annonce (contenu)
- Image de l'annonce (upload optionnel)
- Consigne spécifique
- Durée préparation (défaut 30s)
- Durée enregistrement (défaut 300s = 5 min)

Section B :
- Titre de l'annonce
- Type d'annonce
- Texte de l'annonce
- Image de l'annonce (upload optionnel)
- Consigne spécifique (ex: "Vous en parlez à un(e) ami(e) qui cherche une idée pour ses vacances")
- Objet de la conviction (ex: "de faire ce voyage avec vous")
- Durée préparation (défaut 60s)
- Durée enregistrement (défaut 600s = 10 min)

#### `/admin/commandes` — Gestion des commandes
Tableau des commandes avec :
- Référence, nom client, email, téléphone WhatsApp, pack, statut, date
- Filtre par statut (PENDING / VALIDATED / REJECTED)
- Actions sur chaque commande PENDING :
  - **"Valider"** → crée le compte, envoie les identifiants par email, active le pack
  - **"Rejeter"** → envoie un email au client, archive la commande
  - **"WhatsApp"** → bouton raccourci qui ouvre `wa.me/[numéro_client]` pour discussion directe
- Badge rouge sur l'icône du menu si commandes PENDING en attente

---

## 📊 SCORING AUTOMATIQUE

### CE et CO (QCM 40 questions)

| Bonnes réponses | Niveau CECRL |
|-----------------|--------------|
| 0 – 6           | A1           |
| 7 – 15          | A2           |
| 16 – 21         | B1           |
| 22 – 28         | B2           |
| 29 – 34         | C1           |
| 35 – 40         | C2           |

Afficher immédiatement après soumission :
- Score brut (ex: 24/40)
- Niveau CECRL correspondant
- Correction détaillée question par question (bonne réponse + explication)
- Temps utilisé

### EE (Expression Écrite) — Correction par IA

Après soumission des 2 tâches, appeler l'API Anthropic Claude avec ce prompt système :

```
Tu es un correcteur certifié du TEF Canada (Test d'Évaluation de Français),
expert en didactique des langues. Tu évalues les productions écrites selon la
grille officielle du CECRL.

Évalue les deux textes soumis selon ces critères :

TÂCHE 1 (suite d'article, minimum 80 mots) :
- Respect de la consigne (suite cohérente de l'amorce)
- Organisation et paragraphes
- Clarté et cohérence du récit
- Richesse lexicale
- Maîtrise syntaxique
- Orthographe

TÂCHE 2 (lettre au journal, minimum 200 mots) :
- Respect de la consigne (format lettre, point de vue exprimé)
- 3 arguments minimum développés
- Organisation et structure
- Clarté de l'argumentation
- Richesse lexicale
- Maîtrise syntaxique
- Orthographe

Retourne UNIQUEMENT un JSON valide avec ce format :
{
  "task1": {
    "wordCount": number,
    "score": number (0-100),
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "feedback": "commentaire détaillé en français",
    "strengths": ["point fort 1", "point fort 2"],
    "improvements": ["axe d'amélioration 1", "axe d'amélioration 2"]
  },
  "task2": {
    "wordCount": number,
    "score": number (0-100),
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "feedback": "commentaire détaillé en français",
    "strengths": ["point fort 1"],
    "improvements": ["axe d'amélioration 1"]
  },
  "globalCecrlLevel": "A1|A2|B1|B2|C1|C2",
  "globalScore": number (0-100)
}
```

Afficher le résultat dans une page de correction avec :
- Score global + niveau CECRL
- Feedback tâche 1 et tâche 2
- Points forts et axes d'amélioration

---

## 🎙️ MODULE EXPRESSION ORALE (EO) — SPÉCIFICATIONS OFFICIELLES

### Structure officielle de l'épreuve
- **Durée totale** : 15 minutes
- **2 sections** : Section A (5 min) + Section B (10 min)
- **Type de support** : une publicité ou annonce de la vie quotidienne
  (offre d'emploi, offre de services, loisirs, logement, annonce publique, etc.)
- Support affiché sous forme de carte visuelle (image de l'annonce + texte)

---

### SECTION A — Obtenir des informations (5 minutes)
**Objectif** : l'utilisateur lit une annonce et doit poser une dizaine de questions
pour obtenir plus d'informations sur cette annonce.

**Consigne officielle affichée** :
> "Vous avez lu cette annonce et vous êtes intéressé(e).
> Vous téléphonez pour avoir plus d'informations.
> → Posez une dizaine de questions."

**Exemples de sujets Section A (à charger en base par l'admin)** :
- Offre d'emploi : aide à domicile pour dame âgée (rémunération attractive, horaires variables)
- Randonnée : itinéraires 3-5 jours, tous niveaux, groupes 8-12 personnes avec guide
- Spectacle : recherche d'acteurs figurants pour comédie musicale, rémunération en cadeaux
- Vente de meubles : occasion, cause départ à l'étranger

**Interface Section A** :
1. Affichage de l'annonce (image + texte de l'annonce)
2. Consigne visible en permanence
3. Décompte de préparation : **30 secondes** (lire et préparer ses questions)
4. Lancement de l'enregistrement automatique après préparation
5. Minuterie : **5 minutes** d'enregistrement
6. Indicateur visuel : onde sonore animée (microphone actif)
7. Bouton "Terminer" (avant la fin si l'utilisateur a posé ses questions)
8. Lecture de l'enregistrement pour vérification
9. Bouton "Passer à la Section B"

**Critères d'auto-évaluation affichés après** :
- Ai-je posé une dizaine de questions ?
- Mes questions permettent-elles d'obtenir des informations précises ?
- Ai-je utilisé un registre formel (vouvoiement) ?
- Mes questions sont-elles claires et naturelles ?

---

### SECTION B — Présenter et argumenter (10 minutes)
**Objectif** : l'utilisateur lit une annonce, la présente à un ami imaginaire
et argumente pour le convaincre d'y participer.

**Consigne officielle affichée** :
> "Vous avez lu cette annonce. Vous en parlez à un(e) ami(e).
> → Présentez-lui ce document ;
> → Essayez de le (la) convaincre de participer."

**Exemples de sujets Section B (à charger en base par l'admin)** :
- Circuit touristique Québec 8j/7n pension complète à partir de 300$ (hôtel***, guide francophone)
- Offre d'emploi professeurs à domicile (souplesse, toutes matières, bonne rémunération)
- Association bénévole SOS Amitié (aide personnes isolées, formation assurée, horaires flexibles)
- École de langues en ligne (toutes langues, cours online, tarifs imbattables, formules variées)

**Interface Section B** :
1. Affichage de la nouvelle annonce (image + texte)
2. Consigne visible en permanence
3. Décompte de préparation : **60 secondes** (lire et préparer sa présentation)
4. Lancement de l'enregistrement automatique après préparation
5. Minuterie : **10 minutes** d'enregistrement
6. Indicateur visuel : onde sonore animée (microphone actif)
7. Bouton "Terminer" (avant la fin)
8. Lecture de l'enregistrement pour vérification
9. Bouton "Soumettre l'épreuve complète"

**Critères d'auto-évaluation affichés après** :
- Ai-je présenté clairement le document ?
- Ai-je développé des arguments convaincants ?
- Ai-je utilisé un registre informel (tutoiement, ton amical) ?
- Mon discours est-il fluide et naturel ?

---

### GRILLE D'ÉVALUATION EO (affichée pour auto-évaluation)

#### Qualité du discours
| Critère | Section A | Section B |
|---------|-----------|-----------|
| Adaptation à la situation | S'informer, vouvoiement | Convaincre, tutoiement |
| Précision des propos | Questions ciblées | Arguments développés |
| Réactivité / naturel | Relances et précisions | Fluidité du récit |
| Clarté | Énoncés sans ambiguïté | Présentation structurée |

#### Maîtrise de la langue
| Critère | Description |
|---------|-------------|
| Lexique | Vocabulaire juste, précis, adéquat |
| Syntaxe | Phrases simples à complexes, temps et modes corrects |
| Prononciation | Claire, naturelle, intelligible |

#### Niveaux CECRL pour l'EO
| Niveau | Description |
|--------|-------------|
| A1 | Très limité, difficultés majeures |
| A2 | Communication simple, vocabulaire restreint |
| B1 | Communication fonctionnelle, quelques erreurs |
| B2 | Aisance relative, argumentation efficace |
| C1 | Fluidité, richesse lexicale, argumentation nuancée |
| C2 | Maîtrise quasi-native |

---

### GESTION DES SUJETS EO EN BASE DE DONNÉES

Chaque sujet EO (une série EO = une paire Section A + Section B) contient :

**Pour Section A** :
```
- titre (ex: "Offre d'emploi — Aide à domicile")
- typeAnnonce (ex: "offre_emploi" | "loisirs" | "services" | "logement" | "autre")
- texteAnnonce (contenu textuel de l'annonce)
- imageAnnonce (URL image optionnelle)
- consigneSpecifique (ex: "Vous êtes intéressé(e) par ce poste...")
- dureePreparation (secondes, défaut: 30)
- dureeEnregistrement (secondes, défaut: 300)
```

**Pour Section B** :
```
- titre (ex: "Circuit touristique au Québec")
- typeAnnonce
- texteAnnonce
- imageAnnonce (URL image optionnelle)
- consigneSpecifique (ex: "Vous en parlez à un(e) ami(e) qui cherche une idée pour ses vacances")
- objetConviction (ex: "de faire ce voyage avec vous")
- dureePreparation (secondes, défaut: 60)
- dureeEnregistrement (secondes, défaut: 600)
```

---

### INTERFACE COMPLÈTE EO — FLUX UTILISATEUR

```
Page EO série sélectionnée
       ↓
[Écran intro] : Présentation de l'épreuve (2 sections, durées, objectifs)
       ↓
[SECTION A]
  → Affichage annonce + consigne
  → Décompte préparation (30s)
  → Enregistrement (5 min max) avec onde sonore
  → Arrêt + lecture de vérification
  → Confirmation soumission Section A
       ↓
[Pause entre sections] : 10 secondes + message "Préparez-vous pour la Section B"
       ↓
[SECTION B]
  → Affichage nouvelle annonce + consigne
  → Décompte préparation (60s)
  → Enregistrement (10 min max) avec onde sonore
  → Arrêt + lecture de vérification
  → Bouton "Soumettre l'épreuve complète"
       ↓
[Page résultats EO]
  → "Vos enregistrements ont été sauvegardés"
  → Lecteurs audio Section A et Section B pour réécoute
  → Grille d'auto-évaluation interactive (checklist)
  → Score d'auto-évaluation calculé à partir de la checklist
  → Conseils personnalisés selon les cases cochées
```

---

### CORRECTION IA POUR L'EO (optionnel, via API Claude)

Si l'admin active la correction IA pour une série EO, après soumission :
- Transcription audio via Web Speech API (navigateur) ou Whisper API
- Envoi de la transcription à l'API Claude avec ce prompt système :

```
Tu es un correcteur certifié du TEF Canada, spécialisé en expression orale.
Évalue la transcription suivante selon la grille officielle CECRL.

SECTION A (5 min — obtenir des informations) :
Annonce : [texte de l'annonce]
Transcription : [texte transcrit]
Évalue : s'informer, précision des questions, registre formel, naturel

SECTION B (10 min — présenter et convaincre) :
Annonce : [texte de l'annonce]
Transcription : [texte transcrit]
Évalue : présentation, argumentation, registre informel, fluidité

Retourne UNIQUEMENT ce JSON :
{
  "sectionA": {
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "score": number (0-100),
    "feedback": "commentaire en français",
    "nbQuestionsDetectees": number,
    "registreAdapte": boolean,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "sectionB": {
    "cecrlLevel": "A1|A2|B1|B2|C1|C2",
    "score": number (0-100),
    "feedback": "commentaire en français",
    "argumentsDetectes": number,
    "registreAdapte": boolean,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "globalCecrlLevel": "A1|A2|B1|B2|C1|C2",
  "globalScore": number (0-100),
  "pronunciation": "commentaire sur la prononciation si détectable",
  "lexique": "commentaire sur le vocabulaire utilisé"
}
```

---

## 📦 MODULES DU TEF CANADA — DÉTAIL

### MODULE 1 — Compréhension Écrite (CE)
- **Durée** : 60 minutes
- **Questions** : 40 QCM
- **Structure** :
  | Questions | Type | Compétence |
  |-----------|------|-----------|
  | 1–7 | Documents quotidiens | Comprendre des documents courants |
  | 8–17 | Phrases/textes lacunaires | Sens général, textes à trous |
  | 18–22 | Lecture rapide / graphiques | Documents visuels |
  | 23–32 | Documents administratifs | Comprendre docs pro |
  | 33–40 | Articles de presse | Comprendre la presse |
- Chaque question peut avoir : texte long (optionnel) + image (optionnelle) + énoncé + 4 options

### MODULE 2 — Compréhension Orale (CO)
- **Durée** : 40 minutes
- **Questions** : 40 QCM
- **Audio** : ne se joue qu'une seule fois par question (conditions réelles)
- **Structure** :
  | Questions | Type | Compétence |
  |-----------|------|-----------|
  | 1–4 | Conversations avec dessins | Dialogues |
  | 5–20 | Annonces / répondeurs / micros-trottoirs | Messages courts |
  | 21–30 | Chroniques radio, interviews | Compréhension longue |
  | 31–40 | Documents audio divers | Vie quotidienne |

### MODULE 3 — Expression Écrite (EE)
- **Durée** : 60 minutes (25 min Tâche 1 + 35 min Tâche 2)
- **Tâche 1** : Suite d'un article de presse — minimum **80 mots**
  - Amorce fournie (ex: "Mariages au sommet — Arequipa, Pérou…")
  - Consigne : "Terminez cet article en ajoutant un texte de 80 mots min, en plusieurs paragraphes"
- **Tâche 2** : Lettre au journal — minimum **200 mots**
  - Affirmation fournie (ex: "Les réseaux sociaux représentent un danger pour les enfants")
  - Consigne : "Écrivez une lettre au journal — exprimez votre point de vue avec 3 arguments min"
- Compteur de mots en temps réel dans la zone de saisie

### MODULE 4 — Expression Orale (EO)
- **Durée** : 15 minutes (Section A : 5 min + Section B : 10 min)
- **Support** : Publicités et annonces de la vie quotidienne (offres d'emploi, loisirs, services, logement)
- **Section A** (5 min) : Lire une annonce → poser ~10 questions pour s'informer — préparation 30s — registre **formel**
- **Section B** (10 min) : Lire une annonce → présenter + convaincre un ami — préparation 60s — registre **informel**
- Enregistrement audio via navigateur (MediaRecorder API → upload Supabase Storage)
- Page résultats : réécoute audio + grille auto-évaluation + correction IA optionnelle

---

## 📋 FONCTIONNALITÉS SPÉCIALES

### Minuterie non contournable
- Visible en permanence en haut de l'écran
- À la fin du temps : soumission automatique des réponses
- Pas de possibilité de mettre en pause

### Audio une seule fois (CO)
- L'icône audio devient grisée après lecture
- Message "Vous avez déjà écouté cet audio" si tentative de relecture
- Conforme aux conditions réelles du TEF Canada

### Compteur de mots (EE)
- Temps réel pendant la saisie
- Couleur rouge si sous le minimum, vert si atteint
- Bloquage de soumission si minimum non atteint

### Bouton WhatsApp flottant
- Affiché sur toutes les pages
- Position fixe bas-droite
- Lien : `https://wa.me/237683008287`
- Icône WhatsApp verte

---

## 🌐 CONTENU PAGE D'ACCUEIL (textes)

**Hero** :
> "Prépare ton TEF Canada et réussis ton immigration au Canada 🍁
> La première plateforme de préparation au TEF Canada dédiée pour nous."

**Section TEF Canada** :
> Le Test d'Évaluation de Français (TEF Canada) est le test linguistique officiel
> reconnu par Immigration, Réfugiés et Citoyenneté Canada (IRCC) depuis 2002.
> Il évalue votre niveau de français sur 4 compétences et attribue des scores
> convertis en niveaux NCLC (Niveaux de Compétence Linguistique Canadien).
> Un minimum de NCLC 7 est requis pour le programme Entrée Express.
> Les résultats sont valables 2 ans.

**Contact** :
- Email : tifuzzied@gmail.com
- Téléphone/WhatsApp : +237 683 008 287

---

## ⚙️ PARAMÈTRES GÉNÉRAUX

- Tout le site est **en français**
- Devise : **FCFA** (Francs CFA d'Afrique Centrale)
- Paiement : Manuel via Orange Money / MTN MoMo (+237683008287)
  → Pas de passerelle automatique — l'admin valide après preuve de paiement WhatsApp
- Responsive mobile-first
- Mentions légales en pied de page
- Footer : liens Accueil | Packs | Contact | Mentions légales | © 2025 Tef-Lab

---

## 🚀 INSTRUCTIONS POUR CLAUDE CODE

Tu dois générer **l'intégralité du projet** dans le répertoire courant. Voici l'ordre d'exécution :

1. **Initialiser le projet Next.js 14** avec TypeScript, TailwindCSS, ESLint
2. **Installer les dépendances** :
   ```bash
   npm install prisma @prisma/client next-auth bcryptjs nodemailer nanoid
   npm install @types/nodemailer @types/bcryptjs
   ```
3. **Créer le schéma Prisma** complet (`prisma/schema.prisma`)
4. **Créer le fichier seed** (`prisma/seed.ts`) avec :
   - Les 4 modules (CE, CO, EE, EO)
   - Le compte admin par défaut (`tifuzzied@gmail.com` / `admin@tef-lab`)
5. **Créer le fichier `.env.example`** avec toutes les variables nécessaires :
   ```
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   SMTP_HOST=
   SMTP_PORT=
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=
   ADMIN_EMAIL=tifuzzied@gmail.com
   ADMIN_WHATSAPP=237683008287
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_SITE_URL=
   ```
6. **Générer toutes les pages** dans l'ordre : publiques → abonné → admin
7. **Créer tous les composants UI** réutilisables (Navbar, Footer, Modal, Timer, AudioPlayer, etc.)
8. **Créer toutes les routes API** avec gestion d'erreurs et validation Zod
9. **Créer le service email** (`lib/email.ts`) avec les 3 templates :
   - Email admin (nouvelle commande)
   - Email client (activation + identifiants)
   - Email client (rejet commande)
10. **Créer le service WhatsApp** (`lib/whatsapp.ts`) qui génère les liens `wa.me` encodés
11. **Créer le middleware** de protection des routes (abonné + admin)
12. **Tester** que `npm run dev` démarre sans erreur

Génère **tous les fichiers nécessaires**, ne saute aucune étape, et assure-toi que
le projet est **fonctionnel dès le premier lancement** après `npm install` et
`npx prisma db push && npx prisma db seed`.
