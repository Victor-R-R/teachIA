<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# teachIA — Contexte projet pour agents IA

## Stack

- **Next.js 16.2** App Router + TypeScript
- **Auth.js v5** (`next-auth@^5.0.0-beta.30`) + `@auth/pg-adapter@^1.11` + Google OAuth
- **Neon Postgres** via `@neondatabase/serverless` (driver HTTP, pas de WebSocket)
- **Vercel AI SDK v6** + AI Gateway OIDC (`anthropic/claude-sonnet-4-6`)
- **shadcn/ui** + Tailwind CSS
- **Vitest** pour les tests

## Architecture multi-tenant

Toutes les tables de données ont une colonne `user_id TEXT REFERENCES users(id)`.

**Règle absolue** : toutes les fonctions dans `lib/db.ts` prennent `userId: string` comme premier paramètre. Ne jamais interroger la base sans filtrer par `user_id`.

```ts
// Correct
export async function getUserProfile(userId: string) {
  const sql = neon(process.env.DATABASE_URL!)
  return await sql`SELECT * FROM user_profile WHERE user_id = ${userId}`
}

// Interdit — fuite de données entre utilisateurs
export async function getUserProfile() {
  return await sql`SELECT * FROM user_profile`
}
```

**Catalogue partagé** (exercices/flashcards sans propriétaire) : `WHERE user_id IS NULL`.

## Récupérer l'userId dans les routes/pages

```ts
import { auth } from '@/lib/auth'
import { getEffectiveUserId } from '@/lib/auth'

// Dans un Server Component ou Route Handler
const session = await auth()
if (!session?.user?.id) redirect('/login')
const userId = await getEffectiveUserId(session) // gère l'impersonation superadmin
```

`getEffectiveUserId` retourne l'ID de l'utilisateur impersonné si un cookie `impersonate_user_id` est présent, sinon l'ID de la session courante.

## Auth.js — points critiques

- **`proxy.ts`** (pas `middleware.ts`) : guard Auth.js pour Next.js 16. Toujours exclure `/login`, `/api/auth`, `/_next`, `/favicon.ico` des redirections.
- **Sessions DB** (`strategy: 'database'`) via `@auth/pg-adapter`. Les colonnes doivent être en camelCase entre guillemets : `"sessionToken"`, `"userId"`, `"providerAccountId"`, `"emailVerified"`.
- Les tables `users`, `accounts`, `sessions` doivent avoir une colonne `id TEXT DEFAULT gen_random_uuid()::text` — l'adapter fait `RETURNING id` sur chaque INSERT.
- **Promotion superadmin** : dans le callback `session` de `lib/auth.ts`, comparer `token.email` à `process.env.SUPERADMIN_EMAIL`.

## Neon HTTP driver

`neon()` retourne un tag function SQL. Il **ne supporte pas** plusieurs instructions dans un seul appel.

```ts
// Interdit — crash "cannot insert multiple commands into a prepared statement"
await sql.query('CREATE TABLE a (...); CREATE TABLE b (...)')

// Correct — une instruction par appel
await sql.query('CREATE TABLE a (...)')
await sql.query('CREATE TABLE b (...)')
```

Pour les scripts de migration, utiliser le runner `scripts/migrate-multitenant.ts` qui split le SQL par `;`.

## Structure des fichiers clés

```
lib/
  auth.ts          # Config Auth.js (provider, adapter, callbacks rôle)
  db.ts            # Toutes les fonctions DB métier (userId requis)
  admin-db.ts      # Fonctions réservées superadmin (listUsers, getAppSettings…)
  constants.ts     # Domaines, niveaux, types partagés

app/
  (auth)/login/    # Page connexion Google OAuth
  (dashboard)/     # Routes utilisateur (exercices, chat, stats…)
  admin/           # Routes superadmin uniquement
  api/
    auth/[...nextauth]/  # Handler Auth.js
    admin/impersonate/   # Cookie impersonation

components/
  impersonation-banner.tsx  # Affiché quand superadmin impersonne un user

proxy.ts           # Auth guard Next.js 16 (exclure /login !)
```

## Commandes utiles

```bash
npm run dev                    # Démarrer en local
npm run test                   # Vitest
npm run db:migrate             # Schéma initial
npm run db:migrate-multitenant # Migration Auth.js + user_id
npm run db:seed                # Seed exercices
npm run db:seed-flashcards     # Seed flashcards
```

## Variables d'environnement requises

```
DATABASE_URL          # Neon connection string
DIRECT_URL            # Neon direct (sans pooler)
AUTH_SECRET           # Secret Auth.js (32+ chars)
AUTH_URL              # http://localhost:3000 en local
GOOGLE_CLIENT_ID      # OAuth Google
GOOGLE_CLIENT_SECRET  # OAuth Google
SUPERADMIN_EMAIL      # Email du compte superadmin
```

## Prompts IA — règles de formatage

Tous les system prompts utilisent du **markdown riche** et des **emojis thématiques**. Toujours respecter ces conventions quand tu modifies ou crées un prompt.

### Emojis par domaine

| Emoji | Domaine |
|-------|---------|
| 🇪🇸 | Civilisation espagnole |
| 🌎 | Civilisation latino-américaine |
| 📝 | Langue / Grammaire / Traduction |
| 🎓 | Didactique / Pédagogie |
| 📖 | Œuvres au programme |
| ⚠️ | Piège du jury / Erreur fréquente |
| ✅ | Bonne pratique / Élément valorisé |
| ❌ | Erreur à éviter |
| 💡 | Astuce / Conseil |
| 🎯 | Objectif / Point clé |
| 📊 | Statistiques / Données du jury |
| 🟢🟡🔴 | Niveaux A / B / C |

### Structure par type de réponse

- **Exercices** : `🎯 **Objectif** + niveau (🟢/🟡/🔴)` → consigne → `💡 **Conseil**`
- **Corrections** : `✅` points réussis · `❌` erreur + POURQUOI · `💡` conseil prioritaire
- **Notions** : `🏗️` analogie → `📏` règle → `📝` exemple → `⚠️` piège
- **Accueil** : bloc stats jury + tableau markdown des épreuves disponibles

### Règle de position des instructions de formatage

Les règles de formatage doivent être placées **en tête du system prompt** (avant toute autre section) pour être correctement suivies par les modèles llama/Groq. Les instructions de formatage enfouies en milieu de prompt sont ignorées.

### Fichiers de prompts

| Fichier | Modèle | Rôle |
|---------|--------|------|
| `app/api/chat/route.ts` | Groq llama-3.3-70b | Chat principal (Professeur IA) |
| `app/api/exercises/generate/route.ts` | anthropic/claude-sonnet-4.6 | Génération d'exercices QCM/vrai-faux/lacunaire |
| `app/api/exercises/correct/route.ts` | anthropic/claude-sonnet-4.6 | Correction avec ❌/✅/💡 |
| `app/api/flashcards/generate/route.ts` | anthropic/claude-sonnet-4.6 | Flashcards avec emojis de domaine |
| `app/api/simulacros/generate/route.ts` | anthropic/claude-sonnet-4.6 | Génération de sujets d'examen |
| `app/api/simulacros/submit/route.ts` | anthropic/claude-sonnet-4.6 | Évaluation des copies |
| `app/api/plan/generate/route.ts` | anthropic/claude-sonnet-4.6 | Plan de révision personnalisé |
