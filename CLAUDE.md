# CLAUDE.md — Tef-Lab
> Ce fichier est le document de référence du projet. Claude Code doit le lire
> intégralement au début de chaque session avant d'effectuer toute action.

---

## 🧭 CONTEXTE DU PROJET

**Tef-Lab** est une plateforme web fullstack de préparation au **TEF Canada**
(Test d'Évaluation de Français), destinée aux candidats camerounais souhaitant
immigrer au Canada via le programme Entrée Express (IRCC).

- **Propriétaire** : tifuzzied@gmail.com | WhatsApp : +237 683 008 287
- **NotchPay account email** : kamdemfrancksteve@gmail.com
- **Public cible** : Camerounais préparant le TEF Canada
- **Langue** : Français exclusivement
- **Devises** : FCFA (prix de référence admin) + USD (converti dynamiquement à l'affichage)
- **Paiement** : Automatisé via NotchPay (XAF) et PayPal (USD) + fallback manuel Orange Money / MTN MoMo

---

## 🗂️ STRUCTURE DU PROJET

```
tef-lab/
├── app/                        # Next.js 14 App Router
│   ├── (public)/               # Pages visiteur
│   │   ├── page.tsx            # Accueil
│   │   ├── packs/page.tsx      # Catalogue packs avec paiement intégré
│   │   ├── entrainement-gratuit/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/                 # Authentification
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx          # Inscription publique (compte gratuit)
│   │   ├── mot-de-passe-oublie/page.tsx
│   │   └── reinitialiser-mot-de-passe/page.tsx
│   ├── dashboard/              # Espace abonné (protégé)
│   │   ├── page.tsx            # Dashboard : modules + séries + verrouillage accès
│   │   └── serie/[id]/
│   │       ├── page.tsx        # CE et CO (QCM)
│   │       ├── ee/page.tsx     # Expression Écrite
│   │       └── eo/page.tsx     # Expression Orale
│   ├── admin/                  # Espace admin (protégé + rôle ADMIN)
│   │   ├── page.tsx            # Dashboard admin
│   │   ├── utilisateurs/page.tsx
│   │   ├── packs/page.tsx      # CRUD packs + nouveaux champs
│   │   ├── series/page.tsx
│   │   ├── questions/page.tsx
│   │   ├── commandes/page.tsx
│   │   └── parametres/page.tsx # Paramètres plateforme (nom, email, tél, taux, remise)
│   └── api/                    # Routes API
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/register/route.ts        # Inscription publique
│       ├── auth/forgot-password/route.ts
│       ├── auth/reset-password/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/validate/route.ts
│       ├── orders/[id]/reject/route.ts
│       ├── packs/route.ts
│       ├── series/route.ts
│       ├── questions/route.ts
│       ├── attempts/route.ts
│       ├── scoring/ee/route.ts           # Vérifie quota IA avant correction
│       ├── scoring/eo/route.ts           # Vérifie quota IA avant correction
│       ├── settings/route.ts             # GET/PATCH paramètres plateforme
│       ├── upload/route.ts               # Upload Supabase Storage
│       ├── ai-usage/route.ts             # Vérifier/incrémenter quota IA journalier
│       ├── subscription/route.ts         # GET abonnement actif de l'utilisateur
│       ├── payment/notchpay/route.ts     # Initialiser paiement NotchPay
│       └── payment/notchpay/webhook/route.ts  # Webhook confirmation NotchPay
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppButton.tsx
│   ├── ui/
│   │   ├── Timer.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── WordCounter.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── OrderModal.tsx       # Modale commande manuelle (fallback)
│   │   ├── UpgradeModal.tsx     # Modale upgrade — liste des packs + boutons paiement
│   │   ├── InactivityWarning.tsx
│   │   └── PaymentModal.tsx     # Sélection méthode paiement + formulaire
│   └── admin/
│       ├── StatsCard.tsx
│       └── FileUpload.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── email.ts                 # 5 templates email
│   ├── whatsapp.ts
│   ├── scoring.ts
│   └── access.ts                # Logique accès séries selon abonnement
├── hooks/
│   └── useInactivityTimeout.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── .env.example
└── CLAUDE.md
```

---

## 🔐 AUTHENTIFICATION ET RÔLES

### Rôles utilisateurs
| Rôle | Description | Accès |
|------|-------------|-------|
| `VISITOR` | Non connecté | Pages publiques uniquement |
| `SUBSCRIBER` | Compte créé (gratuit ou payant) | Dashboard, séries selon abonnement |
| `ADMIN` | Rôle admin | Tout + dashboard admin complet |

### Niveaux d'accès aux séries (dépend du pack actif)
| Niveau | Séries accessibles |
|--------|-------------------|
| `FREE` | Séries CE et CO marquées `isFree = true` (pas de pack requis, juste un compte) |
| `EE_EO` | Toutes les séries EE et EO disponibles (pack Special) |
| `ALL` | Toutes les séries de tous les modules (Essai, Bronze, Silver, Gold, Gold Plus, Partenaire, Entreprise) |

> **Règle** : les séries verrouillées sont **visibles** dans le dashboard mais **non accessibles** — un clic affiche la modale d'upgrade.

### Inscription publique
L'inscription est **ouverte à tous** via `/inscription`. Champs requis :
- Nom complet
- Ville de résidence
- Code de parrainage (optionnel)
- Adresse email
- Mot de passe (min 8 caractères, au moins 1 chiffre et 1 caractère spécial)
- Confirmation du mot de passe

À l'inscription, le compte est créé avec le rôle `SUBSCRIBER` et **aucun pack actif** (accès FREE).

### Compte admin par défaut (seed)
```
Email    : tifuzzied@gmail.com
Password : admin@tef-lab
Role     : ADMIN
```
À la première connexion avec ce mot de passe, afficher un **bandeau rouge obligatoire**
et rediriger vers `/admin/changer-mot-de-passe` avant tout accès au dashboard.

---

## 💳 PACKS ET ABONNEMENTS

### Pack Gratuit (FREE — aucun achat)
- Accès : séries CE et CO marquées `isFree = true`
- Sessions simultanées : illimité
- IA : 0 correction/jour
- Durée : illimitée

### Packs payants

| Pack | Prix FCFA | Accès modules | Sessions max | IA/jour | Durée |
|------|-----------|---------------|-------------|---------|-------|
| **Special** | 5 000 | EE + EO uniquement | 1 | 10 | 30 jours |
| **Essai** | 5 000 | Tous modules | 1 | 2 | 30 jours |
| **Bronze** | 10 000 | Tous modules | 2 | 3 | 30 jours |
| **Silver** ⭐ | 25 000 | Tous modules | 4 | 10 | 30 jours |
| **Gold** | 35 000 | Tous modules | 6 | 15 | 30 jours |
| **Gold Plus** | 65 000 | Tous modules | 6 | 25 | 30 jours |
| **Partenaire** | 100 000 | Tous modules | 10 | 30 | 30 jours |
| **Entreprise** | 250 000 | Tous modules | 10 | 25 | 30 jours |

⭐ Silver est le pack **recommandé** (`isRecommended = true`).

### Règles métier packs
- Le **prix en USD** est calculé dynamiquement : `prixFCFA × usdExchangeRate` (taux stocké dans `PlatformSettings`)
- La **remise globale** est appliquée à tous les packs : `prixAffiché = prix × (1 - discountRate / 100)` — définie par l'admin dans Paramètres
- L'admin peut **modifier tout pack existant** et **créer des packs personnalisés**
- Les champs admin-configurables par pack : `name`, `price` (FCFA), `description`, `moduleAccess`, `maxSessions`, `aiUsagePerDay`, `durationDays`, `isActive`, `isRecommended`

---

## 🛒 FLUX DE COMMANDE ET PAIEMENT

### Paiement automatisé (NotchPay ou PayPal)

```
UTILISATEUR connecté clique "Mettre à niveau" sur un pack verrouillé
  OU visite /packs et clique "S'abonner"
         ↓
[PaymentModal] Choix méthode : NotchPay (XAF) | PayPal (USD)
         ↓ NotchPay                        ↓ PayPal
POST /api/payment/notchpay           [PayPal JS SDK]
  → Initialise paiement NotchPay       → Crée order PayPal
  → Retourne payment_url               → Capture côté serveur
  → Redirige vers NotchPay checkout
         ↓
[Webhook NotchPay] POST /api/payment/notchpay/webhook
  OU [PayPal capture] POST /api/payment/paypal/capture
         ↓
  → Vérifie signature/statut
  → Crée Order (VALIDATED) en DB
  → Met à jour expiresAt utilisateur (aujourd'hui + durationDays)
  → Envoie email confirmation (template: paiement_confirme)
  → Redirige vers /dashboard
```

### Paiement manuel (fallback Orange Money / MTN MoMo)
Le flux manuel historique reste disponible via `OrderModal` pour les utilisateurs sans accès internet bancaire :
```
Formulaire commande → POST /api/orders → Email admin + lien WhatsApp
→ Admin valide manuellement dans /admin/commandes
→ PATCH /api/orders/[id]/validate → active abonnement + email client
```

### Identifiants paiement
- **NotchPay sandbox** : `pk_test.apwM14UInxS0r2MG72hToccDchGiq9DTLZWMTHq0Q9dqIAx4bUFX8dhU24BdOAbWHQkYSRpS7LuateMEeOZXN7RqMZBGVOdw0Qf5VT6bcOd9tqBtD8Kiqhn9y5Fsc`
- **NotchPay email** : kamdemfrancksteve@gmail.com
- **PayPal** : utiliser le compte email du site (tifuzzied@gmail.com) — clés dans `.env`

---

## 📊 SCHÉMA BASE DE DONNÉES

### Tables principales

| Table | Champs clés |
|-------|-------------|
| `User` | id, name, email, password (bcrypt), role, accountStatus, mustChangePassword, **cityOfResidence?**, **referenceCode?**, createdAt |
| `Pack` | id, name, price (FCFA), description, **moduleAccess**, **maxSessions**, **aiUsagePerDay**, **isRecommended**, durationDays, isActive |
| `Order` | id, reference, visitorName, visitorEmail, visitorPhone, visitorMessage?, userId?, packId, status, activatedAt?, expiresAt?, **paymentMethod?**, **paymentReference?** |
| `Module` | id, name, code (CE/CO/EE/EO), description, duration (min), nbQuestions |
| `Series` | id, title, moduleId, isFree |
| `PackSeries` | packId + seriesId |
| `Question` | id, moduleId, seriesId, questionOrder, taskTitle?, category?, longText?, imageUrl?, audioUrl?, question, optionA-D?, correctAnswer?, explanation? |
| `Attempt` | id, userId, seriesId, moduleCode, answers (JSON), writtenTask1?, writtenTask2?, audioTask1?, audioTask2?, score?, aiScore?, cecrlLevel?, timeTaken? |
| `Result` | id, userId, moduleCode, avgScore, cecrlLevel |
| `PasswordResetToken` | id, email, token (unique), expiresAt, used |
| `PlatformSettings` | id="default", siteName, adminEmail, whatsappNumber, orangeMoneyNumber, mtnMomoNumber, **usdExchangeRate**, **discountRate** |
| **`AIUsageLog`** | id, userId, date (YYYY-MM-DD), count — @@unique([userId, date]) |

### Enums
```prisma
enum Role         { VISITOR SUBSCRIBER ADMIN }
enum Status       { ACTIVE SUSPENDED }
enum OrderStatus  { PENDING VALIDATED REJECTED }
enum ModuleAccess { FREE EE_EO ALL }
enum PaymentMethod { NOTCHPAY PAYPAL ORANGE_MONEY MTN_MOMO MANUAL }
```

### Logique d'accès (`lib/access.ts`)
```typescript
// Récupère le niveau d'accès actif d'un utilisateur
async function getUserAccessLevel(userId: string): Promise<'FREE' | 'EE_EO' | 'ALL'>

// Vérifie si userId peut accéder à seriesId
async function canAccessSeries(userId: string, seriesId: string): Promise<boolean>

// Récupère l'abonnement actif (Order VALIDATED non expiré)
async function getActiveSubscription(userId: string): Promise<Order & { pack: Pack } | null>

// Vérifie et incrémente le quota IA journalier
async function checkAndIncrementAIUsage(userId: string): Promise<{ allowed: boolean; remaining: number }>
```

**Règles d'accès séries :**
- `FREE` → uniquement séries avec `isFree = true` ET module CE ou CO
- `EE_EO` → toutes séries EE et EO (pack Special)
- `ALL` → toutes séries de tous modules

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

### MODULE 2 — Compréhension Orale (CO)
- **Durée** : 40 min | **Questions** : 40 QCM + fichiers audio
- ⚠️ **Audio ne se joue qu'UNE SEULE FOIS** (grisé après lecture)
- **CO auto-advance** : 10s après fin audio → question suivante automatique (avec bannière countdown + bouton Annuler)

### MODULE 3 — Expression Écrite (EE)
- **Durée** : 60 min (Tâche 1 : 25 min · Tâche 2 : 35 min)
- **Tâche 1** : Suite d'article — **80 mots minimum**
- **Tâche 2** : Lettre au journal — **200 mots minimum**
- Compteur mots temps réel (rouge/vert), soumission bloquée si sous minimum
- **Correction IA** : `claude-sonnet-4-5` → soumise au quota `aiUsagePerDay` du pack

### MODULE 4 — Expression Orale (EO)
- **Durée** : 15 min | 2 sections via MediaRecorder API
- **Section A** : 5 min, formel (vouvoiement), ~10 questions
- **Section B** : 10 min, informel (tutoiement), présenter + convaincre
- **Correction IA** : optionnelle, soumise au quota `aiUsagePerDay` du pack

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

### EE — Correction IA (Anthropic claude-sonnet-4-5)
Retour JSON :
```json
{
  "task1": { "wordCount": 0, "score": 0, "cecrlLevel": "", "feedback": "", "strengths": [], "improvements": [], "improvedText": "" },
  "task2": { "wordCount": 0, "score": 0, "cecrlLevel": "", "feedback": "", "strengths": [], "improvements": [], "improvedText": "" },
  "globalCecrlLevel": "",
  "globalScore": 0
}
```
`improvedText` : réécriture au niveau CECRL supérieur (`null` si C2). Affiché dans bloc indigo collapsible.

### EO — Auto-évaluation + IA optionnelle
Grille checklist après réécoute. Correction IA via transcription (Web Speech API ou Whisper).

---

## 📧 SERVICE EMAIL (lib/email.ts)

5 templates Nodemailer :

| Template | Déclencheur | Destinataire |
|----------|-------------|--------------|
| `nouvelle_commande` | POST /api/orders (manuel) | Admin |
| `compte_active` | PATCH /api/orders/[id]/validate | Client |
| `commande_rejetee` | PATCH /api/orders/[id]/reject | Client |
| `reinitialisation_mdp` | POST /api/auth/forgot-password | Client |
| `paiement_confirme` | Webhook NotchPay / PayPal capture | Client |

---

## 💬 SERVICE WHATSAPP (lib/whatsapp.ts)

- **Visiteur → Admin** : `wa.me/237683008287?text=[message_encodé]`
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
| Typographie | Inter ou Poppins |
| Logo | `<img src="/logo.png" alt="Tef-Lab" className="h-5 w-auto object-contain" />` + texte "TefLab" à côté |

**Composants permanents** :
- Navbar logo+texte + liens + bouton Connexion / Inscription
- Bouton WhatsApp vert flottant bas-droite
- Footer : Accueil · Packs · Contact · Mentions légales · © 2025 Tef-Lab

---

## 🔌 VARIABLES D'ENVIRONNEMENT REQUISES (.env)

```env
DATABASE_URL=                          # PostgreSQL (Supabase)
NEXTAUTH_SECRET=                       # Secret JWT
NEXTAUTH_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tifuzzied@gmail.com
SMTP_PASS=                             # App password Gmail
SMTP_FROM="Tef-Lab <tifuzzied@gmail.com>"

ADMIN_EMAIL=tifuzzied@gmail.com
ADMIN_WHATSAPP=237683008287

ANTHROPIC_API_KEY=                     # Correction EE/EO IA

NEXT_PUBLIC_SUPABASE_URL=              # Supabase Storage
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NotchPay
NOTCHPAY_PUBLIC_KEY=pk_test.apwM14UInxS0r2MG72hToccDchGiq9DTLZWMTHq0Q9dqIAx4bUFX8dhU24BdOAbWHQkYSRpS7LuateMEeOZXN7RqMZBGVOdw0Qf5VT6bcOd9tqBtD8Kiqhn9y5Fsc
NOTCHPAY_WEBHOOK_HASH=                 # Hash secret webhook NotchPay

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=          # Client ID PayPal
PAYPAL_CLIENT_SECRET=                  # Secret PayPal
PAYPAL_MODE=sandbox                    # sandbox | live
```

---

## 🚦 RÈGLES DE DÉVELOPPEMENT

### Priorités absolues
1. **Ne jamais exposer les routes admin** à un non-admin
2. **Ne jamais exposer les routes abonné** à un visiteur non connecté
3. **Toujours hasher les mots de passe** avec bcrypt (saltRounds: 12)
4. **Toujours valider les inputs** avec Zod sur toutes les routes API
5. **Vérifier le quota IA** avant chaque appel Anthropic dans scoring/ee et scoring/eo
6. **Ne pas casser le flux de commande manuel** — il reste disponible en parallèle du flux automatisé

### Conventions de code
- TypeScript strict (`strict: true`)
- Composants React en PascalCase, fichiers en kebab-case
- Variables d'environnement accédées uniquement via `lib/config.ts`
- Gestion d'erreurs systématique (try/catch + codes HTTP corrects)
- Tout le texte affiché en **français**

### Contraintes UX critiques
- **Minuterie CE/CO** : visible en permanence, soumission auto à 0, pas de pause
- **CO auto-advance** : 10s après fin audio → question suivante (bannière countdown + bouton Annuler)
- **Audio CO** : lecture unique — grisé après écoute
- **Compteur mots EE** : rouge si sous minimum, vert si atteint, soumission bloquée
- **Enregistrement EO** : indicateur visuel onde sonore, bouton terminer avant la fin
- **Mobile-first** : responsive, optimisé mobile (cible principale Cameroun)
- **Séries verrouillées** : visibles mais non accessibles, clic → UpgradeModal
- **Déconnexion inactivité** : 30 min sans action → avertissement à 25 min → déconnexion auto

---

## 📋 PAGES ET ROUTES

### Publiques (visiteur)
| Route | Description |
|-------|-------------|
| `/` | Accueil : hero, modules, packs, séries gratuites, contact |
| `/packs` | Catalogue packs avec prix FCFA + USD, remise éventuelle, boutons paiement |
| `/entrainement-gratuit` | Séries gratuites CE et CO |
| `/contact` | Formulaire + email + WhatsApp |
| `/connexion` | Login + lien "Mot de passe oublié" |
| `/inscription` | Inscription publique (compte gratuit) |
| `/mot-de-passe-oublie` | Demande reset mot de passe |
| `/reinitialiser-mot-de-passe` | Reset avec token URL |

### Abonné (protégées)
| Route | Description |
|-------|-------------|
| `/dashboard` | Modules + séries (verrouillées selon pack) + historique |
| `/dashboard/serie/[id]` | Passer une série CE ou CO |
| `/dashboard/serie/[id]/ee` | Expression Écrite |
| `/dashboard/serie/[id]/eo` | Expression Orale |

### Admin (protégées + rôle ADMIN)
| Route | Description |
|-------|-------------|
| `/admin` | Stats globales + commandes PENDING |
| `/admin/utilisateurs` | CRUD utilisateurs |
| `/admin/packs` | CRUD packs + champs moduleAccess, maxSessions, aiUsagePerDay, isRecommended |
| `/admin/series` | CRUD séries |
| `/admin/questions` | CRUD questions |
| `/admin/commandes` | Valider/Rejeter commandes manuelles |
| `/admin/parametres` | Nom site, email, téléphones, taux USD, remise globale |

---

## 🌱 SEED INITIAL (prisma/seed.ts)

Doit créer :
1. Les **4 modules** : CE (60 min, 40 q), CO (40 min, 40 q), EE (60 min, 2 tâches), EO (15 min, 2 sections)
2. Le **compte admin** : `tifuzzied@gmail.com` / `admin@tef-lab` (bcrypt)
3. Les **8 packs par défaut** : Special, Essai, Bronze, Silver (recommended), Gold, Gold Plus, Partenaire, Entreprise

---

## ⚠️ POINTS D'ATTENTION POUR CLAUDE CODE

- Se référer à ce fichier avant toute action — ne jamais inventer de logique métier non décrite
- Toujours mettre à jour ce fichier si une décision architecturale importante est prise
- Le schéma Prisma fait autorité sur toute autre description de la base de données
- Les prompts IA sont définis dans `lib/scoring.ts` — ne pas modifier sans validation
- **Les flux manuel et automatisé coexistent** — ne pas supprimer le flux manuel

---

## 🛠️ ENVIRONNEMENT TECHNIQUE (DÉCOUVERT EN SESSION)

### Prisma 7 — Incompatibilités critiques
- `datasourceUrl` **supprimé** du constructeur `PrismaClient` — utilise `@prisma/adapter-pg`
- `url = env("DATABASE_URL")` **supprimé** du bloc `datasource` dans schema.prisma
- `prisma.config.ts` est **pour le CLI uniquement** — pas le runtime
- `lib/prisma.ts` instancie `PrismaPg` avec `connectionString` et passe `adapter` au constructeur
- Zod v4 : `error.errors` → `error.issues` ; `errorMap` supprimé de `z.enum`
- **Après toute modif schema.prisma** : `prisma db push --accept-data-loss` puis `prisma generate`
- **`--accept-data-loss`** : obligatoire quand on rend des colonnes nullable
- **Port migrations** : `prisma.config.ts` remplace `:6543/` par `:5432/`
- **`pg.Pool as any`** : conflit types `@types/pg` — contourner avec `as any`

### Commandes CLI sur Windows (npm absent du PATH)
- Dev server : `node node_modules/next/dist/bin/next dev` (configuré dans `.claude/launch.json`)
- Prisma generate : `node node_modules/prisma/build/index.js generate`
- TypeScript check : `node node_modules/typescript/bin/tsc --noEmit`
- npm install : `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" install <pkg>`
- Bash : éviter les chemins avec `(` dans git — utiliser `git add -u`
- Vider le cache : `rm -rf .next` — obligatoire si serveur plante (exit code 1)

### Architecture Layout
- `app/layout.tsx` — minimal (html/body/Providers)
- `app/(public)/layout.tsx` — Navbar + Footer + WhatsApp
- `app/admin/layout.tsx` — sidebar admin autonome
- **Ne pas recréer** `app/page.tsx` — accueil = `app/(public)/page.tsx`

### ESLint (.eslintrc.json)
- `react/no-unescaped-entities` : désactivé (apostrophes françaises)
- `@typescript-eslint/no-unused-vars` : `argsIgnorePattern: "^_"`
- `Array.isArray(data) && setter(data)` → `if (Array.isArray(data)) setter(data)`

### NextAuth `withAuth` middleware
- **Toujours** spécifier `pages: { signIn: '/connexion' }` dans les options de `withAuth`

### Supabase Storage
- Bucket : `tef-lab-media` (public)
- Headers requis pour `sb_secret_` key : **BOTH** `apikey: serviceKey` ET `Authorization: Bearer ${serviceKey}`
- Variables : `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Route upload : `app/api/upload/route.ts` — admin uniquement, max 20 Mo audio / 5 Mo image

### Scoring IA
- Stripper balises markdown avant `JSON.parse()` : `rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()`
- Grille CECRL obligatoire dans le prompt (A1:0–24, A2:25–44, B1:45–59, B2:60–74, C1:75–89, C2:90–100)
- `improvedText` EE : réécriture au niveau supérieur

### CO Auto-advance
- Après fin audio : compteur 10s → question suivante automatique
- Bannière bleue avec barre de progression + bouton "Annuler"
- Annulé par : "← Précédent", "Suivant →", "Passer", clic grille, bouton "Annuler"
- Implémenté via `autoAdvanceCountdown` state + `useEffect` setTimeout dans `app/dashboard/serie/[id]/page.tsx`

### Inactivité / Déconnexion
- Hook `useInactivityTimeout` dans `hooks/useInactivityTimeout.ts`
- Composant `InactivityWarning` modal avec countdown MM:SS
- Intégré dans `app/dashboard/layout.tsx` et `app/admin/layout.tsx`
- Avertissement à 25 min, déconnexion à 30 min

### Réinitialisation mot de passe
- Token : `crypto.randomBytes(32).toString('hex')`, expiry 1h, table `PasswordResetToken`
- Prévention énumération : même réponse que l'email existe ou non
- Page `/reinitialiser-mot-de-passe` utilise `useSearchParams` wrappé dans `<Suspense>`

### Paramètres plateforme (PlatformSettings)
- Singleton `id="default"`, upsert systématique
- Champs : `siteName`, `adminEmail`, `whatsappNumber`, `orangeMoneyNumber`, `mtnMomoNumber`, `usdExchangeRate`, `discountRate`
- Admin page : `/admin/parametres` — 3 sections (Général, Contact, Paiements) + taux USD + remise globale
- Route : `GET /api/settings` (public) + `PATCH /api/settings` (admin uniquement)

### Tests preview_eval / preview_fill
- `preview_fill` pour les `<textarea>` React (pas le setter natif)
- IIFE `(() => { ... })()` pour JS multi-instructions
- Cliquer bouton par texte : `Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('...'))`

### Questions admin
- `optionA-D` et `correctAnswer` : `String?` (optionnel pour EE/EO)
- `isQCM = CE || CO` → formulaire QCM ; `isTask = EE || EO` → formulaire tâche
- EE/EO : max 2 sections par série
- `GET /api/series/[id]/questions` — public

### NotchPay
- Base URL : `https://api.notchpay.co`
- Auth : header `Authorization: {PUBLIC_KEY}` (pas Bearer)
- Initialiser : `POST /payments` avec `{ email, amount, currency: "XAF", description, reference, callback, return_url }`
- Réponse : `{ transaction: { reference, status }, authorization_url }`
- Webhook : vérifier hash HMAC-SHA256 avant traitement
- Sandbox key : voir variable `NOTCHPAY_PUBLIC_KEY` dans `.env`
