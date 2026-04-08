# 🎓 teachIA

> Plateforme personnelle de préparation au **CAPES d'espagnol** — exercices, révision et professeur IA disponible 24h/24.

---

## ✨ Fonctionnalités

| | Fonctionnalité | Description |
|---|---|---|
| 📝 | **182 exercices unifiés** | 15 quiz interactifs (100 questions QCM/Vrai-Faux/Lacunaire, 6-7 questions par quiz) + 82 exercices CAPES ouverts (composition, version, thème, grammaire, civilisation, didactique, leçon, entretien) |
| ⚡ | **Génération par IA** | Crée un exercice sur n'importe quel thème en quelques secondes |
| 🤖 | **Professeur IA** | Chat streaming avec un expert CAPES. Bouton "Démarrer" sur chaque exercice CAPES pour lancer l'exercice directement avec l'IA |
| 💬 | **Conversations persistantes** | Chaque session de chat est sauvegardée en DB, restaurable via `/chat?id=xxx` |
| 📋 | **Historique `/conversations`** | Liste toutes les sessions passées avec titre généré par IA, date et suppression |
| 🔒 | **Auth solo** | Protection par mot de passe unique + cookie JWT signé |
| 🎨 | **Thème clair** | Interface light mode avec accent violet, sidebar blanche et cartes épurées |
| 📱 | **Responsive mobile/tablette** | Navigation par header + drawer sur mobile, layout adaptatif < 1024px |
| 🏆 | **Dashboard gamifié** | Niveau XP (Débutant → Professeur) + niveaux A/B/C par domaine mis à jour dynamiquement, objectif quotidien configurable, exercices en cours |
| 🃏 | **Flashcards CAPES** | 53 cartes curées (Langue, Civi Espagne, Civi Latam, Didactique) + génération IA par thème, flip 3D animé, tracking Connu/À revoir en DB, filtres domaine et niveau |

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

# Seed des exercices (15 quiz, 100 questions)
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
│   ├── constants.ts           # Domaines, niveaux, types
│   └── exercises.ts           # Banque de 82 exercices structurés (TypeScript)
├── proxy.ts                   # Auth guard (Next.js 16)
└── scripts/
    ├── migrate.sql            # Schéma BDD
    └── seed-exercises.ts      # 10 exercices curés
```
