# Design : Dashboard gamifié — Niveau, progression quotidienne & exercices en cours

**Date** : 2026-04-08
**Scope** : Page `/` (dashboard) + extensions `user_profile` + `saveAttempt`

---

## Objectif

Transformer le dashboard vide en hub de motivation :
- Test de niveau (onboarding) intégré comme point d'entrée si non complété
- Double système de progression : XP/niveau de jeu + niveaux A/B/C de compétence par domaine
- Objectif quotidien configurable (défaut : 60 min) avec barre de progression
- Liste des exercices commencés mais non réussis + simulations en cours

---

## 1. Schéma de données

### Extensions de `user_profile` (table singleton existante)

```sql
ALTER TABLE user_profile
  ADD COLUMN xp             INTEGER DEFAULT 0,
  ADD COLUMN level_xp       INTEGER DEFAULT 1,
  ADD COLUMN daily_goal_min INTEGER DEFAULT 60;
```

Les colonnes `level_langue`, `level_civi`, `level_didactique` (A/B/C) existaient déjà — elles sont maintenant mises à jour dynamiquement.

---

## 2. Logique XP

### Calcul au moment d'une réponse correcte (`saveAttempt`)

| Niveau exercice | XP gagné |
|---|---|
| A (difficile) | 30 XP |
| B (intermédiaire) | 20 XP |
| C (facile) | 10 XP |
| Simulation complétée | 100 XP |

XP incrémenté uniquement sur réponse **correcte**. Pas de XP pour les mauvaises réponses.

### Seuils de niveau

Niveau `n` est atteint quand `xp >= n² × 100`.

| Niveau | XP requis | Titre |
|---|---|---|
| 1 | 0 | Débutant |
| 2 | 400 | Apprenti |
| 3 | 900 | Explorateur |
| 4 | 1 600 | Érudit |
| 5 | 2 500 | Lettré |
| 6 | 3 600 | Expert |
| 7 | 4 900 | Savant |
| 8 | 6 400 | Maître |
| 9 | 8 100 | Virtuose |
| 10+ | 10 000+ | Professeur |

Calcul du prochain seuil : `next_level_xp = level_xp² × 100`, `xp_needed = next_level_xp - xp`.

### Mise à jour du level_xp

Après chaque incrément d'XP dans `saveAttempt`, recalculer et mettre à jour `level_xp` si le seuil suivant est atteint.

---

## 3. Mise à jour des niveaux A/B/C par domaine

Recalculé à chaque `saveAttempt` pour le domaine de l'exercice soumis.

**Requête** : 20 dernières tentatives sur les exercices du même domaine.

| Taux de réussite | Nouveau niveau |
|---|---|
| ≥ 80% | C (maîtrisé) |
| 50–79% | B (intermédiaire) |
| < 50% | A (à travailler) |

Si moins de 5 tentatives pour ce domaine → pas de mise à jour (données insuffisantes).

---

## 4. Temps quotidien

Lu depuis la table `study_sessions` (déjà dans le design original) :

```sql
SELECT COALESCE(SUM(duration_min), 0) AS total_min
FROM study_sessions
WHERE date = CURRENT_DATE
```

La table `study_sessions` est mise à jour à chaque `saveAttempt` via un upsert sur `(date, domain)` : incrémente `duration_min` du `time_spent` de la tentative (converti de secondes en minutes, arrondi à l'entier inférieur). Si `time_spent` est `null`, l'upsert est ignoré pour `study_sessions` (pas de durée à enregistrer).

---

## 5. Exercices en cours

```sql
SELECT DISTINCT e.id, e.question, e.type, e.domain, e.level,
  COUNT(ea.id) AS attempt_count
FROM exercise_attempts ea
JOIN exercises e ON e.id = ea.exercise_id
WHERE ea.exercise_id NOT IN (
  SELECT exercise_id FROM exercise_attempts WHERE correct = true
)
GROUP BY e.id, e.question, e.type, e.domain, e.level
ORDER BY MAX(ea.timestamp) DESC
LIMIT 5
```

Retourne les exercices avec au moins une tentative incorrecte et aucune tentative correcte.

Fonction : `getInProgressExercises(): Promise<InProgressExercise[]>` dans `lib/db.ts`.

---

## 6. Simulations en cours

```sql
SELECT * FROM exam_sessions
WHERE ai_feedback IS NULL
ORDER BY timestamp DESC
LIMIT 3
```

Une simulation "en cours" = entrée dans `exam_sessions` sans correction IA (`ai_feedback IS NULL`).

Fonction : `getInProgressSimulations(): Promise<ExamSession[]>` dans `lib/db.ts`.

---

## 7. Interface du dashboard (`/`)

### Zone 1 — Appel à l'action onboarding (conditionnel)

Affiché si `user_profile` est vide.

```
┌─────────────────────────────────────────────────┐
│ 🎯  Commence par évaluer ton niveau             │
│     Fais le test de niveau pour personnaliser   │
│     ton parcours de révision.                   │
│                  [Passer le test →]             │
└─────────────────────────────────────────────────┘
```

Carte violet accent, disparaît après l'onboarding.

---

### Zone 2 — Progression (grille 2 colonnes sur desktop, 1 sur mobile)

**Colonne gauche — Niveau XP**

```
⚡ Niveau 3 — Explorateur
[████████████░░░░░░░░]  920 / 900 XP
+380 XP pour le Niveau 4
```

- Icône ⚡ ou 🏆 selon le niveau
- Titre de niveau sous le numéro
- Barre `bg-violet-500`, fond `bg-slate-100`
- Texte `X / Y XP` + message motivant sous la barre

**Colonne droite — Niveaux par domaine**

```
Langue           ●●○  [B]
Civilisation     ●○○  [A]
Didactique       ●●○  [B]
```

3 lignes correspondant aux 3 colonnes de `user_profile` (`level_langue`, `level_civi`, `level_didactique`). `level_civi` regroupe `civi_espagne` et `civi_latam` — les tentatives des deux domaines alimentent le même niveau.

- 3 ronds (●●○) : pleins = niveaux atteints
- Badge couleur : rouge A / amber B / vert C
- Si `user_profile` vide → afficher `—` pour chaque domaine

---

### Zone 3 — Objectif du jour

```
⏱  Aujourd'hui — 23 / 60 min
[████░░░░░░░░░░░░░░░░]  38%   "Bon début, continue !"
                                          [Modifier →]
```

Messages contextuels :
- 0% → "C'est parti ! 💪"
- 1–33% → "Bon début, continue !"
- 34–66% → "Tu es lancé·e, reste focus !"
- 67–99% → "Plus que quelques minutes ! 🔥"
- 100% → "Objectif atteint aujourd'hui ! 🏆"

`[Modifier →]` ouvre un `Popover` shadcn avec un `Input` de type `number` (min 10, max 240). Changement sauvegardé via Server Action → `UPDATE user_profile SET daily_goal_min = $1`.

---

### Zone 4 — À reprendre (conditionnel)

Visible seulement s'il y a des items en cours.

```
📚 À reprendre

┌──────────────────────────────────────────────────┐
│ Exercice #42 · QCM · Langue         Niveau B    │
│ "¿Cuál de las siguientes opciones..."            │
│ 3 tentatives sans succès              [→]        │
├──────────────────────────────────────────────────┤
│ Simulation · Traduction                          │
│ Commencée le 6 avril                  [→]        │
└──────────────────────────────────────────────────┘
```

- Lien vers `/exercices/[id]` ou `/simulacros/[id]`
- Maximum 5 exercices + 3 simulations affichés
- Section entière masquée si aucun item en cours

---

## 8. Nouvelle fonction DB

Fichier : `lib/db.ts`

```ts
// Profil utilisateur avec XP et niveaux
export type UserProfile = {
  id: number
  exam_date: string | null
  level_langue: 'A' | 'B' | 'C' | null
  level_civi: 'A' | 'B' | 'C' | null
  level_didactique: 'A' | 'B' | 'C' | null
  xp: number
  level_xp: number
  daily_goal_min: number
  created_at: string
}

export async function getUserProfile(): Promise<UserProfile | null>
export async function updateDailyGoal(minutes: number): Promise<void>
export async function getInProgressExercises(): Promise<InProgressExercise[]>
export async function getInProgressSimulations(): Promise<ExamSession[]>
export async function getTodayMinutes(): Promise<number>
```

`saveAttempt` est étendue pour :
1. Incrémenter `xp` si `correct = true`
2. Recalculer et mettre à jour `level_xp`
3. Recalculer le niveau A/B/C du domaine concerné
4. Upsert dans `study_sessions` pour le temps du jour

---

## 9. Nouveaux composants

| Composant | Fichier |
|---|---|
| Widget niveau XP | `components/dashboard/xp-level-card.tsx` |
| Widget niveaux domaines | `components/dashboard/domain-levels-card.tsx` |
| Widget objectif quotidien | `components/dashboard/daily-goal-card.tsx` |
| Liste exercices en cours | `components/dashboard/in-progress-list.tsx` |
| Server Action objectif | `app/(dashboard)/actions.ts` |

---

## 10. Fichiers impactés

| Fichier | Action |
|---|---|
| `lib/db.ts` | Ajouter `getUserProfile`, `getInProgressExercises`, `getInProgressSimulations`, `getTodayMinutes`, `updateDailyGoal` ; étendre `saveAttempt` |
| `app/(dashboard)/page.tsx` | Réécrire avec les 4 zones |
| `app/(dashboard)/actions.ts` | Server Action `setDailyGoal` |
| `components/dashboard/xp-level-card.tsx` | Nouveau |
| `components/dashboard/domain-levels-card.tsx` | Nouveau |
| `components/dashboard/daily-goal-card.tsx` | Nouveau |
| `components/dashboard/in-progress-list.tsx` | Nouveau |
| Migration SQL | `ALTER TABLE user_profile ADD COLUMN ...` (3 colonnes) |

---

## Ce qui ne change pas

- Composants d'exercices (`ExerciseQCM`, `ExerciseVraiFaux`, `ExerciseLacunaire`) inchangés
- Route `/exercices` et `/exercices/[id]` inchangées
- Logique de chat et conversations inchangée
- Aucune auth ajoutée — app reste solo
