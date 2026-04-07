# teachIA — Design Spec

**Date:** 2026-04-07
**Projet:** teachIA — Plateforme de préparation au CAPES d'espagnol
**Usage:** Personnel (solo, un seul utilisateur)
**Stack:** Next.js 16 App Router + Neon Postgres + Vercel AI SDK v6 + AI Gateway

---

## 1. Contexte & objectif

teachIA est une plateforme personnelle de préparation au CAPES d'espagnol. Elle couvre les 4 domaines du concours : langue, civilisation Espagne, civilisation Amérique latine, et didactique. L'application est conçue pour un usage exclusivement solo — pas de gestion multi-utilisateurs, pas de communauté.

L'objectif est de centraliser : exercices tipos test, révision par flashcards, plan de révision personnalisé, simulation d'épreuves, et un professeur IA disponible à tout moment.

---

## 2. Scope — 4 phases de développement

### Phase 1 — MVP utilisable
- **Professeur IA** : chat streaming avec un professeur expert CAPES, génération d'exercices à la demande
- **Exercices tipos test** : QCM, vrai/faux, texte lacunaire, chronologie, association — contenu curé + variations IA

### Phase 2 — Progression
- **Plan de révision** : onboarding → calendrier semaine par semaine basé sur le niveau détecté et la date du concours
- **Analytics dashboard** : graphiques par domaine, heatmap des sessions, score "prêt pour le concours"

### Phase 3 — Mémorisation
- **Flashcards** : algorithme de répétition espacée SM-2, fiches par thème (grammaire, histoire, littérature, arts, cinéma)

### Phase 4 — Simulation examen
- **Simulacros** : épreuves complètes (composition, traduction, explication de texte), correction IA avec notation

### Hors scope
- Forum communautaire, classements, live quiz multijoueur (non pertinents pour usage solo)

---

## 3. Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 App Router |
| UI | shadcn/ui + Tailwind CSS + Geist font |
| Chat IA UI | AI Elements (`npx ai-elements`) |
| Base de données | Neon Postgres (via Vercel Marketplace) |
| IA | Vercel AI SDK v6 + AI Gateway |
| Modèle IA | `anthropic/claude-sonnet-4-6` via AI Gateway |
| Auth | Mot de passe unique via `proxy.ts` + cookie signé |
| Analytics UI | Recharts |
| Déploiement | Vercel |

---

## 4. Routes de l'application

| Route | Description |
|-------|-------------|
| `/onboarding` | Test de niveau initial + date du concours → génération du plan |
| `/` | Dashboard — progression du jour, plan de la semaine, score global |
| `/chat` | Professeur IA — chat streaming, génération d'exercices à la demande |
| `/exercices` | Exercices tipos test — QCM, vrai/faux, lacunaire, chronologie |
| `/exercices/[id]` | Exercice individuel avec feedback IA immédiat |
| `/plan` | Calendrier de révision semaine par semaine |
| `/flashcards` | Session de flashcards (spaced repetition SM-2) |
| `/flashcards/[theme]` | Flashcards par thème |
| `/simulacros` | Liste des types d'épreuves |
| `/simulacros/[type]` | Épreuve complète + correction IA |
| `/stats` | Heatmap, graphiques par domaine, score de préparation |
| `/api/chat` | Route Handler — streaming Professeur IA |
| `/api/exercises/generate` | Route Handler — génération d'exercices par IA |
| `/api/exercises/correct` | Route Handler — correction d'exercice par IA |
| `/api/exam/correct` | Route Handler — correction simulacro par IA |
| `/api/plan/generate` | Route Handler — génération du plan de révision par IA |

---

## 5. Modèle de données (Neon Postgres)

### `user_profile`
```sql
id          SERIAL PRIMARY KEY,
exam_date   DATE NOT NULL,
level_langue      TEXT CHECK (level_langue IN ('A','B','C')),
level_civi        TEXT CHECK (level_civi IN ('A','B','C')),
level_didactique  TEXT CHECK (level_didactique IN ('A','B','C')),
created_at  TIMESTAMP DEFAULT NOW()
```
> Table singleton — une seule ligne. L'onboarding est déclenché si cette table est vide.

### `exercises`
```sql
id          SERIAL PRIMARY KEY,
theme       TEXT NOT NULL,         -- ex: 'grammaire', 'guerre_civile', 'boom_literario'
type        TEXT NOT NULL,         -- 'qcm' | 'vrai_faux' | 'lacunaire' | 'chronologie' | 'association'
question    TEXT NOT NULL,
options     JSONB,                 -- array de strings pour QCM/association
answer      TEXT NOT NULL,
explanation TEXT NOT NULL,
level       TEXT CHECK (level IN ('A','B','C')),
source      TEXT,                  -- 'curated' | 'ai_generated'
created_at  TIMESTAMP DEFAULT NOW()
```

### `exercise_attempts`
```sql
id          SERIAL PRIMARY KEY,
exercise_id INTEGER REFERENCES exercises(id),
correct     BOOLEAN NOT NULL,
time_spent  INTEGER,               -- en secondes
timestamp   TIMESTAMP DEFAULT NOW()
```

### `cards`
```sql
id           SERIAL PRIMARY KEY,
front        TEXT NOT NULL,
back         TEXT NOT NULL,
theme        TEXT NOT NULL,
ease_factor  FLOAT DEFAULT 2.5,    -- algorithme SM-2
interval     INTEGER DEFAULT 1,    -- jours jusqu'à prochaine révision
next_review  DATE DEFAULT NOW(),
created_at   TIMESTAMP DEFAULT NOW()
```

### `study_plan`
```sql
id           SERIAL PRIMARY KEY,
week_number  INTEGER NOT NULL,
domain       TEXT NOT NULL,        -- 'langue' | 'civi_espagne' | 'civi_latam' | 'didactique'
objective    TEXT NOT NULL,
completed    BOOLEAN DEFAULT FALSE,
target_date  DATE NOT NULL
```

### `study_sessions`
```sql
id              SERIAL PRIMARY KEY,
date            DATE NOT NULL,
domain          TEXT NOT NULL,
duration_min    INTEGER,
exercises_done  INTEGER DEFAULT 0,
correct_count   INTEGER DEFAULT 0
```

### `exam_sessions`
```sql
id          SERIAL PRIMARY KEY,
type        TEXT NOT NULL,          -- 'composition' | 'traduction' | 'explication'
content     TEXT NOT NULL,          -- réponse de l'utilisateur
ai_feedback TEXT,                   -- correction IA
score       NUMERIC(4,1),           -- note sur 20
timestamp   TIMESTAMP DEFAULT NOW()
```

---

## 6. Flux onboarding

Déclenché uniquement si `user_profile` est vide (première ouverture).

1. **Étape 1 — Date du concours** : saisie de la date → calcul des semaines restantes → détermine l'intensité du plan (< 8 semaines : intensif, > 16 semaines : progressif)
2. **Étape 2 — Test de niveau** : 15 questions rapides (5 langue + 5 civilisation + 5 didactique) → score A/B/C par domaine
3. **Étape 3 — Plan généré** : appel à `/api/plan/generate` avec les niveaux détectés et le temps restant → plan semaine par semaine stocké dans `study_plan` → priorité aux domaines de niveau A
4. **Redirect vers `/`** (dashboard)

---

## 7. Intégration IA

### Professeur IA (`/chat` → `/api/chat`)
- `streamText` + `useChat` (AI SDK v6)
- Transport : `DefaultChatTransport`
- Modèle : `anthropic/claude-sonnet-4-6` via AI Gateway (OIDC)
- Rendu : composant `<Message>` d'AI Elements
- Système prompt : professeur passionné, expert CAPES, guide par questions sans donner directement la réponse, adapte son niveau au profil utilisateur
- Contexte injecté : niveaux A/B/C, domaine en cours dans le plan, historique récent

### Génération d'exercices (`/api/exercises/generate`)
- `generateText` + `Output.object()` — retourne un exercice structuré JSON
- Paramètres : `theme`, `type`, `level`
- Résultat sauvegardé dans `exercises` avec `source: 'ai_generated'`

### Correction d'exercice (`/api/exercises/correct`)
- `generateText` — retourne une explication textuelle personnalisée
- Déclenché après chaque tentative incorrecte

### Correction simulacro (`/api/exam/correct`)
- `generateText` + `Output.object()` — retourne `{ score, feedback, points_forts, points_faibles }`
- Rendu du feedback : `<MessageResponse>` d'AI Elements

### Génération du plan (`/api/plan/generate`)
- `generateText` + `Output.object()` — retourne un tableau de semaines
- Appelé une seule fois à la fin de l'onboarding

---

## 8. Auth (usage solo)

Protection minimaliste via `proxy.ts` (Next.js 16) :
- Variable d'environnement : `APP_PASSWORD`
- À la première visite, formulaire de mot de passe → si correct, cookie `auth_session` signé (httpOnly, sameSite strict, expiration 30 jours)
- `proxy.ts` vérifie le cookie sur chaque requête — redirige vers `/login` si absent ou invalide
- Routes publiques : `/login` uniquement

---

## 9. Direction visuelle

- **Thème** : dark (zinc-950 fond, zinc-900 sidebar, zinc-800 cards)
- **Accent** : violet/indigo (`#7c3aed` / `#6366f1`)
- **Typographie** : Geist Sans (interface) + Geist Mono (code, métriques, IDs)
- **Composants** : shadcn/ui (Card, Button, Badge, Progress, Tabs, Dialog, Sheet)
- **Charts** : Recharts (LineChart pour progression, CalendarHeatmap pour sessions)
- **Icônes** : Lucide React

---

## 10. Structure des fichiers (Next.js App Router)

```
teachIA/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # sidebar + nav
│   │   ├── page.tsx              # dashboard
│   │   ├── chat/page.tsx
│   │   ├── exercices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── plan/page.tsx
│   │   ├── flashcards/
│   │   │   ├── page.tsx
│   │   │   └── [theme]/page.tsx
│   │   ├── simulacros/
│   │   │   ├── page.tsx
│   │   │   └── [type]/page.tsx
│   │   └── stats/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── exercises/
│       │   ├── generate/route.ts
│       │   └── correct/route.ts
│       ├── exam/correct/route.ts
│       └── plan/generate/route.ts
├── components/
│   ├── ai-elements/              # npx ai-elements
│   ├── exercises/
│   ├── flashcards/
│   ├── stats/
│   └── ui/                       # shadcn components
├── lib/
│   ├── db.ts                     # Neon client
│   ├── sm2.ts                    # Algorithme spaced repetition
│   └── auth.ts                   # Cookie helpers
├── proxy.ts                      # Auth guard
└── docs/
    └── superpowers/specs/
        └── 2026-04-07-teachia-design.md
```

---

## 11. Décisions clés

| Décision | Choix | Raison |
|----------|-------|--------|
| Auth | Mot de passe unique + cookie | Overkill d'utiliser Clerk pour usage solo |
| DB | Neon Postgres | Données structurées nécessaires pour plan, progression, SM-2 |
| IA | AI Gateway OIDC | Pas de clé API à gérer, failover automatique |
| Communauté | Hors scope | Usage solo, pas pertinent |
| Spaced repetition | SM-2 maison | Simple à implémenter, algorithme bien documenté |
| Contenu | Hybride curé + IA | Fiabilité du contenu curé + flexibilité de l'IA |
