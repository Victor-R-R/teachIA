# 🎓 teachIA

> Plateforme de préparation au **CAPES d'espagnol** — exercices, révision et professeur IA disponible 24h/24.

---

## ✨ Fonctionnalités

| | Fonctionnalité | Description |
|---|---|---|
| 📝 | **182 exercices** | 15 quiz interactifs (QCM/Vrai-Faux/Lacunaire) + 82 exercices CAPES ouverts (composition, version, thème, grammaire, civilisation, didactique, leçon, entretien) |
| ⚡ | **Génération par IA** | Crée un exercice sur n'importe quel thème en quelques secondes |
| 🤖 | **Professeur IA** | Chat streaming avec un expert CAPES. Bouton "Démarrer" sur chaque exercice pour lancer directement avec l'IA |
| 💬 | **Conversations persistantes** | Sessions sauvegardées en DB, restaurables via `/chat?id=xxx` |
| 📋 | **Historique `/conversations`** | Liste toutes les sessions avec titre IA, date et suppression |
| 🏆 | **Dashboard gamifié** | XP (Débutant → Professeur), niveaux A/B/C par domaine, objectif quotidien configurable |
| 🃏 | **Flashcards CAPES** | 53 cartes curées + génération IA par thème, flip 3D, tracking Connu/À revoir, filtres domaine/niveau |
| 🎯 | **Simulacros CAPES** | Sujets IA conformes au jury 2025 — chronométré, correction structurée avec score /20 |
| 📊 | **Statistiques `/stats`** | KPIs globaux, graphique 7 jours, performance par domaine, flashcards et simulacros |
| 🔒 | **Auth multi-tenant** | Google OAuth (Auth.js v5), sessions DB, isolation par `user_id`, rôles `student`/`superadmin` |
| 🛡️ | **Panel admin `/admin`** | Dashboard stats, gestion utilisateurs, impersonation, catalogue partagé, réglages globaux |
| 📱 | **Responsive** | Sidebar sur desktop, header + drawer sur mobile (< 1024px) |

---

## 🗂️ Domaines couverts

- 🗣️ **Langue** — grammaire, subjonctif, ser/estar, por/para, traduction FR↔ES
- 🏰 **Civilisation Espagne** — guerre civile, franquisme, Transition, Lorca, Goya, Almodóvar…
- 🌎 **Civilisation Amérique latine** — boom littéraire, révolution cubaine, muralisme mexicain…
- 📚 **Didactique** — approche actionnelle, CECRL, conception de séquences pédagogiques

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 App Router + TypeScript |
| UI | shadcn/ui + Tailwind CSS (light mode violet) |
| Base de données | Neon Postgres (`@neondatabase/serverless`) |
| Auth | Auth.js v5 (`next-auth@^5`) + `@auth/pg-adapter` + Google OAuth |
| IA | Vercel AI SDK v6 + AI Gateway OIDC |
| Modèle | `anthropic/claude-sonnet-4-6` |
| Chat UI | AI Elements |
| Déploiement | Vercel |

---

## 🚀 Lancer en local

```bash
npm install
vercel link          # lie au projet Vercel
vercel env pull      # récupère DATABASE_URL, AUTH_SECRET, GOOGLE_* + token OIDC AI Gateway
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon Postgres |
| `DIRECT_URL` | Connection directe Neon (sans pooler) |
| `AUTH_SECRET` | Secret signé Auth.js (32+ caractères aléatoires) |
| `AUTH_URL` | URL de base de l'app (`http://localhost:3000` en local) |
| `GOOGLE_CLIENT_ID` | Client ID OAuth Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth Google Cloud Console |
| `SUPERADMIN_EMAIL` | Email qui reçoit le rôle `superadmin` à la première connexion |

> L'AI Gateway est auto-provisionné via OIDC sur Vercel — aucune clé API à gérer.

---

## 🗄️ Base de données

```bash
# Appliquer le schéma initial
psql $DATABASE_URL < scripts/migrate.sql

# Seed des exercices (15 quiz, 100 questions)
npx tsx scripts/seed-exercises.ts

# Migration multi-tenant (Auth.js + user_id sur toutes les tables)
npm run db:migrate-multitenant
```

---

## 📁 Structure du projet

```
teachIA/
├── app/
│   ├── (auth)/login/          # Page de connexion Google OAuth
│   ├── (dashboard)/
│   │   ├── page.tsx           # Dashboard principal
│   │   ├── exercices/         # Liste + exercice individuel
│   │   ├── flashcards/        # Révision par cartes
│   │   ├── simulacro/         # Sujets CAPES chronométrés
│   │   ├── stats/             # Statistiques globales
│   │   └── chat/              # Professeur IA
│   ├── admin/
│   │   ├── page.tsx           # Stats superadmin
│   │   ├── users/             # Gestion + impersonation
│   │   ├── catalog/           # Catalogue partagé
│   │   └── settings/          # Réglages globaux (XP, objectif)
│   └── api/
│       ├── auth/[...nextauth]/ # Auth.js handler
│       ├── chat/              # Streaming chat
│       ├── exercises/         # Génération + correction IA
│       └── admin/impersonate/ # API impersonation
├── components/
│   ├── exercises/             # QCM, Vrai/Faux, Lacunaire, Feedback
│   ├── flashcards/            # Flip card, filtres
│   ├── layout/                # Sidebar, MobileHeader
│   ├── impersonation-banner.tsx
│   └── ai-elements/           # Composants IA (AI Elements)
├── lib/
│   ├── auth.ts                # Config Auth.js (Google, pg-adapter, rôles)
│   ├── db.ts                  # Client Neon + helpers multi-tenant
│   ├── admin-db.ts            # Fonctions admin (users, settings)
│   ├── constants.ts           # Domaines, niveaux, types
│   └── exercises.ts           # 82 exercices CAPES structurés
├── proxy.ts                   # Auth guard Next.js 16
└── scripts/
    ├── migrate.sql            # Schéma initial
    ├── migrate-multitenant.sql # Migration Auth.js + user_id
    ├── migrate-multitenant.ts  # Runner tsx (Neon HTTP)
    └── seed-exercises.ts      # Seed exercices curés
```
