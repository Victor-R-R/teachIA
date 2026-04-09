# Multi-tenant & Superadmin — Design Spec

**Date :** 2026-04-09
**Statut :** Approuvé

---

## Contexte

teachIA est actuellement une application mono-utilisateur : une seule `user_profile`, un mot de passe partagé, aucune notion de compte. Ce document spécifie la migration vers une architecture multi-tenant avec :

- Authentification Google OAuth (Auth.js v5)
- Comptes étudiants auto-inscrits
- Un superadmin identifié par email (env var)
- Un panneau d'administration complet

---

## 1. Authentification

### Librairie choisie : Auth.js v5 (ex-NextAuth) + Google Provider

**Justification :** Standard de facto pour Next.js App Router, adapter Neon Postgres disponible (`@auth/pg-adapter`), gestion des sessions JWT/DB éprouvée, refresh token automatique.

### Flow de connexion

1. L'utilisateur arrive sur `/login` → bouton unique "Continuer avec Google"
2. Redirection vers Google OAuth consent screen
3. Callback Auth.js → crée ou met à jour la ligne dans `users`
4. Si `user.email === process.env.SUPERADMIN_EMAIL` → `role = 'superadmin'` (appliqué à chaque login via callback `signIn`)
5. Cookie de session httpOnly posé par Auth.js
6. Redirection vers `/` (ou `/onboarding` si `user_profile` inexistant)

### Variables d'environnement

```env
AUTH_SECRET=<random 32+ chars>
GOOGLE_CLIENT_ID=<depuis Google Cloud Console>
GOOGLE_CLIENT_SECRET=<depuis Google Cloud Console>
SUPERADMIN_EMAIL=admin@example.com
```

### Suppression du système actuel

- `APP_PASSWORD` env var → supprimé
- `lib/auth.ts` (SignJWT/jwtVerify maison) → remplacé par `lib/auth.ts` Auth.js
- Page `/login` formulaire mot de passe → remplacée par bouton Google
- Cookie `auth_session` → remplacé par cookie Auth.js

### proxy.ts

Remplacé par le middleware Auth.js natif. Routes publiques : `/login`, `/api/auth/**`. Routes admin : `/admin/**` → vérification `role === 'superadmin'`.

---

## 2. Schéma de base de données

### Nouvelles tables

```sql
-- Gérées par @auth/pg-adapter
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Auth.js UUID
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'superadmin')),
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE sessions (
  session_token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Paramètres globaux gérés par le superadmin
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Valeurs initiales `app_settings` :**

| key | value |
|---|---|
| `xp_gain_A` | `30` |
| `xp_gain_B` | `20` |
| `xp_gain_C` | `10` |
| `xp_decay_per_day` | `10` |
| `default_daily_goal_min` | `60` |

### Modifications des tables existantes

**Ajout de `user_id` (nullable pour migration, puis NOT NULL après purge) :**

```sql
ALTER TABLE user_profile     ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exercise_attempts ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE study_sessions   ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exam_sessions     ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE conversations     ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcard_reviews ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Contrainte UNIQUE mise à jour pour study_sessions
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_date_domain_key;
ALTER TABLE study_sessions ADD CONSTRAINT study_sessions_date_domain_user_key UNIQUE (date, domain, user_id);
```

**Contenu partagé vs privé (exercises, flashcards) :**

```sql
ALTER TABLE exercises  ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcards ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
-- NULL = catalogue partagé (visible par tous)
-- NOT NULL = contenu privé de l'utilisateur
```

**Index :**

```sql
CREATE INDEX idx_user_profile_user_id      ON user_profile(user_id);
CREATE INDEX idx_exercise_attempts_user_id ON exercise_attempts(user_id);
CREATE INDEX idx_study_sessions_user_id    ON study_sessions(user_id);
CREATE INDEX idx_exam_sessions_user_id     ON exam_sessions(user_id);
CREATE INDEX idx_conversations_user_id     ON conversations(user_id);
CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_exercises_user_id         ON exercises(user_id);
CREATE INDEX idx_flashcards_user_id        ON flashcards(user_id);
```

### Migration des données existantes

- `exercises` et `flashcards` actuels → `user_id = NULL` (intègrent le catalogue partagé)
- `user_profile`, `exercise_attempts`, `study_sessions`, `exam_sessions`, `conversations`, `conversation_messages`, `flashcard_reviews` → **purgés** (fresh start, aucun utilisateur réel n'existe encore)

---

## 3. Couche d'accès aux données (`lib/db.ts`)

### Principe

Toutes les fonctions reçoivent `userId: string` en premier paramètre. Le pattern `LIMIT 1` sans filtre est supprimé.

### Helper d'impersonation

```ts
// lib/session.ts
export async function getEffectiveUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Superadmin en mode impersonation
  if (session.user.role === 'superadmin') {
    const cookieStore = await cookies()
    const impersonated = cookieStore.get('impersonate_user_id')
    if (impersonated?.value) return impersonated.value
  }

  return session.user.id
}
```

### Signatures modifiées (exemples)

```ts
getUserProfile(userId: string): Promise<UserProfile | null>
saveAttempt(userId: string, attempt: {...}): Promise<void>
getConversations(userId: string): Promise<ConversationSummary[]>
getTodayMinutes(userId: string): Promise<number>
applyXpDecay(userId: string): Promise<number>
updateDailyGoal(userId: string, minutes: number): Promise<void>

// Exercices : catalogue + privés
getExercises(userId: string, filters: {...}): Promise<Exercise[]>
// WHERE (user_id IS NULL OR user_id = $userId)

// Exercices : catalogue seul (admin)
getCatalogExercises(filters: {...}): Promise<Exercise[]>
// WHERE user_id IS NULL
```

---

## 4. Panneau Superadmin (`/admin`)

Toutes les routes `/admin/**` vérifient `role === 'superadmin'` dans le middleware. Un non-superadmin est redirigé vers `/`.

### Routes

| Route | Description |
|---|---|
| `/admin` | Dashboard : users actifs, stats agrégées |
| `/admin/users` | Liste des utilisateurs, actions |
| `/admin/users/[id]` | Profil détaillé, progression par domaine |
| `/admin/catalog` | CRUD exercices/flashcards partagés |
| `/admin/settings` | Paramètres globaux (`app_settings`) |

### Fonctionnalités par route

**`/admin/users`**
- Tableau : avatar, email, nom, date inscription, XP, rôle, statut (actif/bloqué)
- Actions : Bloquer/débloquer, Supprimer (avec confirmation), Impersonner

**`/admin/users/[id]`**
- Niveaux A/B/C par domaine
- XP et level_xp actuels
- Tentatives totales, taux de réussite
- Activité récente (study_sessions)

**`/admin/catalog`**
- Liste des exercices (`user_id IS NULL`) avec filtres domaine/niveau/type
- Ajout, édition, suppression
- Liste des flashcards catalogue idem

**`/admin/settings`**
- Formulaire clé/valeur pour `app_settings`
- Sauvegarde immédiate

### Navigation

Le superadmin voit un lien "Administration" en bas de la sidebar existante (visible uniquement si `role === 'superadmin'`).

---

## 5. Impersonation

Permet au superadmin de naviguer l'app comme un étudiant donné pour débugger.

**Activation :**
- Bouton "Impersonner" dans `/admin/users`
- POST `/api/admin/impersonate` → pose le cookie `impersonate_user_id` (httpOnly, 1h)

**Navigation en mode impersonation :**
- Bannière jaune en haut de page : "Mode impersonation — Tu navigues en tant que [email] — [Quitter]"
- Le `getEffectiveUserId()` retourne l'ID impersonné
- Toutes les lectures de données utilisent l'ID impersonné

**Désactivation :**
- Bouton "Quitter" dans la bannière
- POST `/api/admin/impersonate/stop` → supprime le cookie

---

## 6. Ordre d'implémentation

1. **Auth.js setup** — `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `proxy.ts`, page `/login`
2. **Migration SQL** — script `scripts/migrate-multitenant.sql`
3. **`lib/db.ts`** — toutes les fonctions avec `userId`, nouveau `lib/session.ts`
4. **Pages existantes** — passer `userId` depuis `getEffectiveUserId()` partout
5. **Onboarding** — lier le `user_profile` créé à `session.user.id`
6. **Panneau `/admin`** — 4 routes dans l'ordre : users → users/[id] → catalog → settings
7. **Impersonation** — cookie + bannière + API routes
8. **Sidebar** — lien Admin conditionnel

---

## 7. Ce qui ne change pas

- URLs de toutes les pages existantes
- Composants UI (sidebar, exercices, flashcards, simulacros, chat)
- Logique métier (calcul XP, niveaux A/B/C, décroissance XP)
- Stack technique (Neon Postgres, Next.js App Router, shadcn/ui)
