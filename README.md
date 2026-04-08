# teachIA

Plateforme personnelle de préparation au CAPES d'espagnol.

## Fonctionnalités (Phase 1 MVP)

- **Exercices tipos test** — QCM, Vrai/Faux, Texte lacunaire avec feedback IA immédiat
- **Génération d'exercices par IA** — Génère des exercices sur n'importe quel thème (domaine, type, niveau)
- **Professeur IA** — Chat streaming avec un professeur expert CAPES (grammaire, civilisation, littérature, didactique)
- **Auth solo** — Protection par mot de passe unique + cookie JWT signé

## Stack

- Next.js 16 App Router + TypeScript
- Neon Postgres (`@neondatabase/serverless`)
- Vercel AI SDK v6 + AI Gateway (OIDC) — modèle `anthropic/claude-sonnet-4.6`
- shadcn/ui + Tailwind CSS (thème dark zinc/violet)
- AI Elements pour le rendu du chat

## Lancer en local

```bash
npm install
vercel link          # lie au projet Vercel
vercel env pull      # récupère DATABASE_URL + OIDC token
npm run dev
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon Postgres |
| `APP_PASSWORD` | Mot de passe de connexion |
| `AUTH_SECRET` | Secret JWT (32+ caractères) |

L'AI Gateway est auto-provisionné via OIDC sur Vercel — pas de clé API à gérer.

## Base de données

```bash
# Appliquer le schéma
psql $DATABASE_URL < scripts/migrate.sql

# Seed des exercices initiaux (10 exercices curés)
npx tsx scripts/seed-exercises.ts
```

## Domaines couverts

- Langue (grammaire, lexique, traduction FR↔ES)
- Civilisation Espagne
- Civilisation Amérique latine
- Didactique (CECRL, approche actionnelle)
