# 🎓 teachIA

> Plateforme personnelle de préparation au **CAPES d'espagnol** — exercices, révision et professeur IA disponible 24h/24.

---

## ✨ Fonctionnalités

| | Fonctionnalité | Description |
|---|---|---|
| 📝 | **Exercices tipos test** | QCM, Vrai/Faux, Texte lacunaire avec feedback IA immédiat |
| ⚡ | **Génération par IA** | Crée un exercice sur n'importe quel thème en quelques secondes |
| 🤖 | **Professeur IA** | Chat streaming avec un expert CAPES (grammaire, civi, littérature, didactique) |
| 🔒 | **Auth solo** | Protection par mot de passe unique + cookie JWT signé |
| 🎨 | **Thème clair** | Interface light mode avec accent violet, sidebar blanche et cartes épurées |

---

## 🗂️ Domaines couverts

- 🗣️ **Langue** — grammaire approfondie, subjonctif, ser/estar, por/para, traduction FR↔ES
- 🏰 **Civilisation Espagne** — guerre civile, franquisme, Transition, Lorca, Goya, Almodóvar…
- 🌎 **Civilisation Amérique latine** — boom littéraire, révolution cubaine, muralisme mexicain…
- 📚 **Didactique** — approche actionnelle, CECRL, conception de séquences pédagogiques

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 App Router + TypeScript |
| UI | shadcn/ui + Tailwind CSS (dark theme zinc/violet) |
| Base de données | Neon Postgres (`@neondatabase/serverless`) |
| IA | Vercel AI SDK v6 + AI Gateway OIDC |
| Modèle | `anthropic/claude-sonnet-4.6` |
| Chat UI | AI Elements |
| Auth | `jose` JWT + cookie httpOnly |

---

## 🚀 Lancer en local

```bash
npm install
vercel link          # lie au projet Vercel
vercel env pull      # récupère DATABASE_URL + token OIDC AI Gateway
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon Postgres |
| `APP_PASSWORD` | Mot de passe de connexion |
| `AUTH_SECRET` | Secret JWT (32+ caractères) |

> L'AI Gateway est auto-provisionné via OIDC sur Vercel — aucune clé API à gérer.

---

## 🗄️ Base de données

```bash
# Appliquer le schéma
psql $DATABASE_URL < scripts/migrate.sql

# Seed des exercices initiaux (10 exercices curés)
npx tsx scripts/seed-exercises.ts
```

---

## 📁 Structure du projet

```
teachIA/
├── app/
│   ├── (auth)/login/          # Page de login
│   ├── (dashboard)/
│   │   ├── exercices/         # Liste + exercice individuel
│   │   └── chat/              # Professeur IA
│   └── api/
│       ├── chat/              # Streaming chat
│       └── exercises/         # Génération + correction IA
├── components/
│   ├── exercises/             # QCM, Vrai/Faux, Lacunaire, Feedback
│   ├── chat/                  # Interface chat
│   └── ai-elements/           # Composants IA (AI Elements)
├── lib/
│   ├── db.ts                  # Client Neon + helpers
│   ├── auth.ts                # JWT helpers
│   └── constants.ts           # Domaines, niveaux, types
├── proxy.ts                   # Auth guard (Next.js 16)
└── scripts/
    ├── migrate.sql            # Schéma BDD
    └── seed-exercises.ts      # 10 exercices curés
```
