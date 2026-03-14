# CLAUDE.md — Tef-Lab
> Ce fichier est le document de référence du projet. Claude Code doit le lire
> intégralement au début de chaque session avant d'effectuer toute action.

---

## 🧭 CONTEXTE DU PROJET

**Tef-Lab** est une plateforme web fullstack de préparation au **TEF Canada**
(Test d'Évaluation de Français), destinée aux candidats camerounais souhaitant
immigrer au Canada via le programme Entrée Express (IRCC).

- **Propriétaire** : tifuzzied@gmail.com | WhatsApp : +237 683 008 287
- **Public cible** : Camerounais préparant le TEF Canada
- **Langue** : Français exclusivement
- **Devise** : FCFA (Francs CFA d'Afrique Centrale)
- **Paiement** : Manuel — Orange Money / MTN MoMo, validé par l'admin

---

## 🗂️ STRUCTURE DU PROJET

```
tef-lab/
├── app/                        # Next.js 14 App Router
│   ├── (public)/               # Pages visiteur
│   │   ├── page.tsx            # Accueil
│   │   ├── packs/page.tsx
│   │   ├── entrainement-gratuit/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/                 # Authentification
│   │   ├── connexion/page.tsx
│   │   └── inscription/page.tsx  # Non utilisé (comptes créés par admin)
│   ├── dashboard/              # Espace abonné (protégé)
│   │   ├── page.tsx            # Dashboard utilisateur
│   │   └── serie/[id]/
│   │       ├── page.tsx        # CE et CO (QCM)
│   │       ├── ee/page.tsx     # Expression Écrite
│   │       └── eo/page.tsx     # Expression Orale
│   ├── admin/                  # Espace admin (protégé + rôle ADMIN)
│   │   ├── page.tsx            # Dashboard admin
│   │   ├── utilisateurs/page.tsx
│   │   ├── packs/page.tsx
│   │   ├── series/page.tsx
│   │   ├── questions/page.tsx
│   │   └── commandes/page.tsx
│   └── api/                    # Routes API
│       ├── auth/[...nextauth]/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/validate/route.ts
│       ├── orders/[id]/reject/route.ts
│       ├── packs/route.ts
│       ├── series/route.ts
│       ├── questions/route.ts
│       ├── attempts/route.ts
│       ├── scoring/ee/route.ts
│       └── scoring/eo/route.ts
├── components/                 # Composants UI réutilisables
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppButton.tsx  # Bouton flottant permanent
│   ├── ui/
│   │   ├── Timer.tsx           # Minuterie non contournable
│   │   ├── AudioPlayer.tsx     # Lecture unique (CO)
│   │   ├── WordCounter.tsx     # Compteur mots (EE)
│   │   ├── AudioRecorder.tsx   # Enregistrement micro (EO)
│   │   └── OrderModal.tsx      # Modale commande pack
│   └── admin/
│       └── StatsCard.tsx
├── lib/
│   ├── prisma.ts               # Client Prisma singleton
│   ├── auth.ts                 # Config NextAuth
│   ├── email.ts                # Service Nodemailer (3 templates)
│   ├── whatsapp.ts             # Générateur de liens wa.me
│   └── scoring.ts              # Logique scoring CE/CO
├── prisma/
│   ├── schema.prisma           # Schéma complet
│   └── seed.ts                 # Données initiales
├── middleware.ts               # Protection des routes
├── .env.example                # Variables d'environnement requises
└── CLAUDE.md                   # Ce fichier
```

---

## 🔐 AUTHENTIFICATION ET RÔLES

### Rôles utilisateurs
| Rôle | Description | Accès |
|------|-------------|-------|
| `VISITOR` | Non connecté | Pages publiques, séries gratuites, modale commande |
| `SUBSCRIBER` | Connecté + pack actif | Dashboard, séries payantes, 4 modules |
| `ADMIN` | Connecté + rôle admin | Tout + dashboard admin complet |

### Compte admin par défaut (seed)
```
Email    : tifuzzied@gmail.com
Password : admin@tef-lab
Role     : ADMIN
```
À la première connexion avec ce mot de passe, afficher un **bandeau rouge obligatoire**
et rediriger vers `/admin/changer-mot-de-passe` avant tout accès au dashboard.

### Important — Création de comptes abonnés
Les abonnés n'ont **pas** de formulaire d'inscription public. Leur compte est
**créé automatiquement par l'admin** lors de la validation d'une commande.
Le mot de passe temporaire (8 caractères alphanumériques) est envoyé par email.

---

## 🛒 FLUX DE COMMANDE (CRITIQUE — NE PAS MODIFIER SANS VALIDATION)

```
VISITEUR clique "Commander" sur un pack
         ↓
[Modale] Formulaire : Nom · Email · WhatsApp · Message optionnel
         ↓
POST /api/orders
  → Sauvegarde commande (statut: PENDING)
  → Génère référence TEFLAB-[timestamp]
  → Envoie email à tifuzzied@gmail.com (template: nouvelle_commande)
  → Retourne lien WhatsApp pré-rempli vers +237683008287
         ↓
[Côté client] Ouvre wa.me dans nouvel onglet + affiche confirmation avec référence
         ↓
ADMIN reçoit email + message WhatsApp → discute paiement avec le client
         ↓
ADMIN dans /admin/commandes → clique "Valider"
         ↓
PATCH /api/orders/[id]/validate
  → Crée compte User (email + nom du formulaire, mot de passe temporaire, rôle SUBSCRIBER)
  → Associe le pack + calcule expiresAt (aujourd'hui + durationDays)
  → Envoie email au client avec identifiants (template: compte_active)
  → Statut → VALIDATED
         ↓
ADMIN clique "Rejeter"
         ↓
PATCH /api/orders/[id]/reject
  → Envoie email au client (template: commande_rejetee)
  → Statut → REJECTED
```

**Modes de paiement acceptés** : Orange Money (+237683008287) | MTN MoMo (+237683008287)

---

## 📊 SCHÉMA BASE DE DONNÉES

### Tables principales
| Table | Description |
|-------|-------------|
| `User` | id, name, email, password (hashé bcrypt), role, accountStatus, createdAt |
| `Pack` | id, name, price (FCFA), description, nbModules, nbSeriesPerModule, durationDays, isActive |
| `Order` | id, reference, visitorName, visitorEmail, visitorPhone, visitorMessage, userId?, packId, status, activatedAt?, expiresAt? |
| `Module` | id, name, code (CE/CO/EE/EO), description, duration (min), nbQuestions |
| `Series` | id, title, moduleId, difficulty, isFree |
| `PackSeries` | packId + seriesId (table de jonction) |
| `Question` | id, moduleId, seriesId, questionOrder, category, longText?, imageUrl?, audioUrl?, question, optionA-D, correctAnswer, explanation? |
| `Attempt` | id, userId, seriesId, moduleCode, answers (JSON), writtenTask1?, writtenTask2?, audioTask1?, audioTask2?, score?, aiScore?, cecrlLevel?, timeTaken? |
| `Result` | id, userId, moduleCode, avgScore, cecrlLevel |

### Enums
```prisma
enum Role         { VISITOR SUBSCRIBER ADMIN }
enum Status       { ACTIVE SUSPENDED }
enum OrderStatus  { PENDING VALIDATED REJECTED }
```

---

## 📦 LES 4 MODULES TEF CANADA

### MODULE 1 — Compréhension Écrite (CE)
- **Durée** : 60 min | **Questions** : 40 QCM
- Structure des questions :
  - Q1–7 : Documents de la vie quotidienne
  - Q8–17 : Phrases et textes lacunaires (textes à trous)
  - Q18–22 : Lecture rapide / graphiques
  - Q23–32 : Documents administratifs et professionnels
  - Q33–40 : Articles de presse
- Chaque question : `longText?` + `imageUrl?` + énoncé + 4 options (tous les champs optionnels sauf énoncé et options)

### MODULE 2 — Compréhension Orale (CO)
- **Durée** : 40 min | **Questions** : 40 QCM + fichiers audio
- ⚠️ **Audio ne se joue qu'UNE SEULE FOIS** (grisé après lecture)
- Structure :
  - Q1–4 : Conversations avec dessins (image possible)
  - Q5–20 : Annonces / répondeurs / micros-trottoirs
  - Q21–30 : Chroniques radio / interviews
  - Q31–40 : Documents audio divers

### MODULE 3 — Expression Écrite (EE)
- **Durée** : 60 min (Tâche 1 : 25 min · Tâche 2 : 35 min)
- **Tâche 1** : Suite d'article de presse — **80 mots minimum**
  - Consigne : "Terminez cet article en ajoutant un texte de 80 mots min, en plusieurs paragraphes"
  - Sujets ex. : "Un lion sème la panique", "Mariages au sommet", "Une mamie en colère"
- **Tâche 2** : Lettre au journal — **200 mots minimum**
  - Consigne : "Écrivez une lettre au journal (200 mots min) avec 3 arguments min"
  - Sujets ex. : "Il faut supprimer la pub à la TV", "Les réseaux sociaux sont dangereux pour les enfants"
- Compteur de mots temps réel : rouge si sous minimum, vert si atteint
- Soumission bloquée si minimum non atteint
- **Correction par IA** : API Anthropic `claude-sonnet-4-5` → JSON avec score, niveau CECRL, feedback, points forts, axes d'amélioration

### MODULE 4 — Expression Orale (EO)
- **Durée** : 15 min | **2 sections** via MediaRecorder API
- **Section A — Obtenir des informations** (5 min)
  - Support : annonce/publicité de la vie quotidienne
  - Objectif : poser ~10 questions pour s'informer
  - Registre : **formel** (vouvoiement)
  - Préparation : 30s → Enregistrement : 5 min max
  - Consigne : "Vous téléphonez pour avoir plus d'informations → Posez une dizaine de questions"
  - Sujets ex. : offre d'emploi aide à domicile, randonnée Rando Loisirs, figurants comédie musicale, meubles à vendre
- **Section B — Présenter et convaincre** (10 min)
  - Support : nouvelle annonce/publicité
  - Objectif : présenter + convaincre un ami
  - Registre : **informel** (tutoiement)
  - Préparation : 60s → Enregistrement : 10 min max
  - Consigne : "Vous en parlez à un(e) ami(e) → Présentez ce document → Essayez de le convaincre"
  - Sujets ex. : circuit Québec 8j/7n, cours à domicile Dométudes, bénévolat SOS Amitié, cours de langues MEDIA Langues
- Page résultats : lecteurs audio + grille auto-évaluation (checklist) + correction IA optionnelle (transcription → Claude)

---

## 📊 SCORING

### CE et CO — Automatique après soumission
| Bonnes réponses | Niveau CECRL |
|-----------------|--------------|
| 0 – 6 | A1 |
| 7 – 15 | A2 |
| 16 – 21 | B1 |
| 22 – 28 | B2 |
| 29 – 34 | C1 |
| 35 – 40 | C2 |

Afficher : score brut (ex: 24/40) + niveau CECRL + correction détaillée + temps utilisé.

### EE — Correction IA (Anthropic claude-sonnet-4-5)
Retour JSON :
```json
{
  "task1": { "wordCount": 0, "score": 0, "cecrlLevel": "", "feedback": "", "strengths": [], "improvements": [] },
  "task2": { "wordCount": 0, "score": 0, "cecrlLevel": "", "feedback": "", "strengths": [], "improvements": [] },
  "globalCecrlLevel": "",
  "globalScore": 0
}
```

### EO — Auto-évaluation + IA optionnelle
Grille checklist après réécoute. Correction IA via transcription (Web Speech API ou Whisper).

---

## 📧 SERVICE EMAIL (lib/email.ts)

3 templates à implémenter via Nodemailer :

| Template | Déclencheur | Destinataire |
|----------|-------------|--------------|
| `nouvelle_commande` | POST /api/orders | Admin (tifuzzied@gmail.com) |
| `compte_active` | PATCH /api/orders/[id]/validate | Client (email du formulaire) |
| `commande_rejetee` | PATCH /api/orders/[id]/reject | Client (email du formulaire) |

L'email `nouvelle_commande` doit inclure un **lien WhatsApp direct** vers le numéro du client pré-rempli.

---

## 💬 SERVICE WHATSAPP (lib/whatsapp.ts)

Générer des liens `wa.me` avec messages pré-remplis et encodés (`encodeURIComponent`).

- **Visiteur → Admin** : `wa.me/237683008287?text=[message_commande_encodé]`
- **Admin → Client** : `wa.me/[numéro_client]?text=[message_encodé]`

---

## 🎨 IDENTITÉ VISUELLE

| Élément | Valeur |
|---------|--------|
| Couleur principale | Bleu `#003087` |
| Couleur secondaire | Rouge `#E30613` |
| Fond | Blanc `#FFFFFF` |
| Hover / accents | Bleu clair `#0055B3` |
| Fond sections alternées | Gris `#F5F5F5` |
| Typographie | Inter ou Poppins (Google Fonts) |
| Logo | "TEF CAN" bleu gras + "237" rouge gras |

**Composants permanents** :
- Navbar avec logo + liens + bouton Connexion
- Bouton WhatsApp vert flottant bas-droite → `wa.me/237683008287`
- Footer : Accueil · Packs · Contact · Mentions légales · © 2025 Tef-Lab

---

## 🔌 VARIABLES D'ENVIRONNEMENT REQUISES (.env)

```env
DATABASE_URL=                        # PostgreSQL (Supabase ou Railway)
NEXTAUTH_SECRET=                     # Secret JWT aléatoire
NEXTAUTH_URL=http://localhost:3000   # URL du site

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tifuzzied@gmail.com
SMTP_PASS=                           # App password Gmail
SMTP_FROM="Tef-Lab <tifuzzied@gmail.com>"

ADMIN_EMAIL=tifuzzied@gmail.com
ADMIN_WHATSAPP=237683008287

ANTHROPIC_API_KEY=                   # Pour correction EE/EO par IA

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚦 RÈGLES DE DÉVELOPPEMENT

### Priorités absolues
1. **Ne jamais casser le flux de commande** — c'est le cœur du business
2. **Ne jamais exposer les routes admin** à un non-admin (middleware strict)
3. **Ne jamais exposer les routes abonné** à un visiteur non connecté
4. **Toujours hasher les mots de passe** avec bcrypt (saltRounds: 12)
5. **Toujours valider les inputs** avec Zod sur toutes les routes API

### Conventions de code
- TypeScript strict partout (`strict: true` dans tsconfig)
- Composants React en PascalCase, fichiers en kebab-case
- Variables d'environnement accédées uniquement via `lib/config.ts`
- Gestion d'erreurs systématique sur chaque route API (try/catch + codes HTTP corrects)
- Tout le texte affiché en **français** (pas de mélange anglais/français dans l'UI)

### Contraintes UX critiques
- **Minuterie CE/CO** : visible en permanence, soumission automatique à 0, pas de pause
- **Audio CO** : lecture unique — grisé + bloqué après la première écoute
- **Compteur mots EE** : rouge si sous minimum, vert si atteint, soumission bloquée
- **Enregistrement EO** : indicateur visuel d'onde sonore animée, bouton terminer avant la fin
- **Mobile-first** : toutes les pages responsive, optimisées mobile (cible principale Cameroun)

---

## 📋 PAGES ET ROUTES

### Publiques (visiteur)
| Route | Description |
|-------|-------------|
| `/` | Accueil : hero, présentation TEF, 4 modules, packs, séries gratuites, contact |
| `/packs` | Détail des packs avec bouton "Commander" → modale |
| `/entrainement-gratuit` | 3 séries gratuites par module |
| `/contact` | Formulaire + email + WhatsApp |
| `/connexion` | Login |

### Abonné (protégées)
| Route | Description |
|-------|-------------|
| `/dashboard` | Modules dispo, séries accessibles, historique résultats |
| `/dashboard/serie/[id]` | Passer une série CE ou CO |
| `/dashboard/serie/[id]/ee` | Expression Écrite |
| `/dashboard/serie/[id]/eo` | Expression Orale |

### Admin (protégées + rôle ADMIN)
| Route | Description |
|-------|-------------|
| `/admin` | Stats globales + commandes PENDING en attente |
| `/admin/utilisateurs` | CRUD utilisateurs |
| `/admin/packs` | CRUD packs |
| `/admin/series` | CRUD séries + sélection 3 gratuites/module |
| `/admin/questions` | CRUD questions (CE, CO, EE, EO) |
| `/admin/commandes` | Valider/Rejeter commandes + badge si PENDING |

---

## 🌱 SEED INITIAL (prisma/seed.ts)

Doit créer au minimum :
1. Les **4 modules** : CE (60 min, 40 q), CO (40 min, 40 q), EE (60 min, 2 tâches), EO (15 min, 2 sections)
2. Le **compte admin** : `tifuzzied@gmail.com` / `admin@tef-lab` (mot de passe hashé bcrypt)

Commande de démarrage complète :
```bash
npm install
cp .env.example .env
# Remplir .env avec les vraies valeurs
npx prisma db push
npx prisma db seed
npm run dev
```

---

## ⚠️ POINTS D'ATTENTION POUR CLAUDE CODE

- Si une fonctionnalité n'est pas claire, se référer à ce fichier avant de demander
- Ne jamais inventer une logique métier non décrite ici — signaler le manque et demander
- Toujours mettre à jour ce fichier si une décision architecturale importante est prise
- Le schéma Prisma fait autorité sur toute autre description de la base de données
- Les prompts IA (EE et EO) sont définis dans `lib/scoring.ts` — ne pas les modifier sans validation
- La gestion des commandes est **manuelle** — ne pas implémenter de passerelle de paiement automatique
