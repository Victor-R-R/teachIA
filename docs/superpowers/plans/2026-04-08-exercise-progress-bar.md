# Exercise Progress Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher l'état de progression (pas commencé / en cours / réussi) sur chaque carte d'exercice dans `/exercices` et dans la page `/exercices/[id]`, avec une barre globale en haut de la liste.

**Architecture:** Nouvelle fonction DB `getAttemptStatsByExercises` + helper `getExerciseStatus` dans `lib/db.ts`. Composant `ExerciseProgressBar` partagé. Les deux pages sont des Server Components — aucun état client ajouté.

**Tech Stack:** Next.js App Router (Server Components), Neon Postgres (`@neondatabase/serverless`), Tailwind CSS, shadcn/ui

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `lib/db.ts` | Modifier | Ajouter `AttemptStats`, `ExerciseStatus`, `getAttemptStatsByExercises`, `getExerciseStatus` |
| `components/exercises/exercise-progress-bar.tsx` | Créer | Composant barre de progression réutilisable |
| `app/(dashboard)/exercices/page.tsx` | Modifier | Barre globale + barre par carte |
| `app/(dashboard)/exercices/[id]/page.tsx` | Modifier | Indicateur de statut dans le header |

---

## Task 1 : Couche données — `lib/db.ts`

**Files:**
- Modify: `lib/db.ts`

- [ ] **Step 1 : Ajouter les types et la fonction dans `lib/db.ts`**

Ouvrir `lib/db.ts` et ajouter après la définition de `ExerciseAttempt` (ligne ~26) :

```ts
export type AttemptStats = {
  exercise_id: number
  attempt_count: number
  has_correct: boolean
}

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed'

export function getExerciseStatus(stats: AttemptStats | undefined): ExerciseStatus {
  if (!stats || stats.attempt_count === 0) return 'not_started'
  if (stats.has_correct) return 'completed'
  return 'in_progress'
}

export async function getAttemptStatsByExercises(ids: number[]): Promise<AttemptStats[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT exercise_id, COUNT(*)::int AS attempt_count, bool_or(correct) AS has_correct
     FROM exercise_attempts
     WHERE exercise_id = ANY($1::int[])
     GROUP BY exercise_id`,
    [ids]
  )
  return rows as AttemptStats[]
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
cd /Users/victorrubia/teachIA && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur sur `lib/db.ts`

- [ ] **Step 3 : Commit**

```bash
git add lib/db.ts
git commit -m "feat: add getAttemptStatsByExercises and getExerciseStatus to db layer"
```

---

## Task 2 : Composant `ExerciseProgressBar`

**Files:**
- Create: `components/exercises/exercise-progress-bar.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
// components/exercises/exercise-progress-bar.tsx
import type { ExerciseStatus } from '@/lib/db'

interface ExerciseProgressBarProps {
  status: ExerciseStatus
  height?: number
}

const STATUS_COLOR: Record<ExerciseStatus, string> = {
  not_started: '',
  in_progress: 'bg-amber-400',
  completed: 'bg-green-500',
}

const STATUS_WIDTH: Record<ExerciseStatus, string> = {
  not_started: '0%',
  in_progress: '50%',
  completed: '100%',
}

export function ExerciseProgressBar({ status, height = 3 }: ExerciseProgressBarProps) {
  if (status === 'not_started') return null

  return (
    <div
      className="w-full bg-slate-100 rounded-full overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div
        className={`${STATUS_COLOR[status]} h-full rounded-full transition-all`}
        style={{ width: STATUS_WIDTH[status] }}
      />
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
cd /Users/victorrubia/teachIA && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur

- [ ] **Step 3 : Commit**

```bash
git add components/exercises/exercise-progress-bar.tsx
git commit -m "feat: add ExerciseProgressBar component"
```

---

## Task 3 : Page liste `/exercices`

**Files:**
- Modify: `app/(dashboard)/exercices/page.tsx`

- [ ] **Step 1 : Mettre à jour les imports**

En haut de `app/(dashboard)/exercices/page.tsx`, remplacer la ligne d'import de `@/lib/db` :

```ts
// avant
import { getExercises } from '@/lib/db'

// après
import { getExercises, getAttemptStatsByExercises, getExerciseStatus } from '@/lib/db'
import { ExerciseProgressBar } from '@/components/exercises/exercise-progress-bar'
```

- [ ] **Step 2 : Récupérer les stats dans le Server Component**

Dans `ExercicesPage`, après `const exercises = await getExercises(...)`, ajouter :

```ts
const statsRows = await getAttemptStatsByExercises(exercises.map(e => e.id))
const statsMap = new Map(statsRows.map(s => [s.exercise_id, s]))
const completedCount = statsRows.filter(s => s.has_correct).length
```

- [ ] **Step 3 : Ajouter la barre globale**

Dans le JSX, remplacer le bloc `<div className="mb-6">` (titre + compteur) par :

```tsx
<div className="mb-6">
  <h1 className="text-2xl font-semibold text-slate-900 mb-1">Exercices</h1>
  <p className="text-slate-500 text-sm">{exercises.length} exercice(s) disponibles</p>
  {completedCount > 0 && (
    <div className="mt-3">
      <div className="flex justify-end mb-1">
        <span className="text-xs text-slate-400">{completedCount} / {exercises.length} réussis</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full" style={{ height: '6px' }}>
        <div
          className="bg-violet-500 rounded-full h-full transition-all"
          style={{ width: `${(completedCount / exercises.length) * 100}%` }}
        />
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 4 : Ajouter la barre par carte**

Dans le `.map(ex => ...)`, remplacer le `<CardContent>` par la version avec barre :

```tsx
<Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
  <CardContent className="p-4 pb-3">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 text-sm font-medium line-clamp-2 mb-2">
          {ex.question}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
            {DOMAIN_LABELS[ex.domain] ?? ex.domain}
          </Badge>
          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
            {TYPE_LABELS[ex.type] ?? ex.type}
          </Badge>
        </div>
      </div>
      <Badge className={`text-xs shrink-0 ${LEVEL_COLORS[ex.level]}`}>
        {ex.level}
      </Badge>
    </div>
    {(() => {
      const status = getExerciseStatus(statsMap.get(ex.id))
      return status !== 'not_started' ? (
        <div className="mt-3">
          <ExerciseProgressBar status={status} height={3} />
        </div>
      ) : null
    })()}
  </CardContent>
</Card>
```

- [ ] **Step 5 : Vérifier TypeScript**

```bash
cd /Users/victorrubia/teachIA && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur

- [ ] **Step 6 : Vérifier visuellement dans le navigateur**

Démarrer le serveur de dev :
```bash
cd /Users/victorrubia/teachIA && npm run dev
```

Ouvrir `http://localhost:3000/exercices`. Vérifier :
- La barre globale apparaît si des exercices ont été réussis (sinon absente)
- Les cartes d'exercices déjà tentés montrent la barre colorée en bas
- Les cartes pas commencées n'ont pas de barre

- [ ] **Step 7 : Commit**

```bash
git add app/(dashboard)/exercices/page.tsx
git commit -m "feat: add global and per-card progress bars to exercises list"
```

---

## Task 4 : Page détail `/exercices/[id]`

**Files:**
- Modify: `app/(dashboard)/exercices/[id]/page.tsx`

- [ ] **Step 1 : Mettre à jour les imports**

En haut de `app/(dashboard)/exercices/[id]/page.tsx`, remplacer la ligne d'import `@/lib/db` :

```ts
// avant
import { getExerciseById, saveAttempt } from '@/lib/db'

// après
import { getExerciseById, saveAttempt, getAttemptStatsByExercises, getExerciseStatus } from '@/lib/db'
import { ExerciseProgressBar } from '@/components/exercises/exercise-progress-bar'
```

- [ ] **Step 2 : Récupérer les stats en parallèle**

Dans `ExercisePage`, remplacer :

```ts
// avant
const exercise = await getExerciseById(Number(id))
if (!exercise) notFound()
```

par :

```ts
// après
const [exercise, statsRows] = await Promise.all([
  getExerciseById(Number(id)),
  getAttemptStatsByExercises([Number(id)]),
])
if (!exercise) notFound()
const status = getExerciseStatus(statsRows[0])
const attemptCount = statsRows[0]?.attempt_count ?? 0
```

- [ ] **Step 3 : Ajouter l'indicateur de statut dans le `CardHeader`**

Dans le JSX, après le bloc des badges dans `<CardHeader>`, ajouter :

```tsx
{status !== 'not_started' && (
  <div className="mt-2 space-y-1.5">
    <span className={`text-xs font-medium flex items-center gap-1.5 ${
      status === 'completed' ? 'text-green-600' : 'text-amber-600'
    }`}>
      <span className="inline-block w-2 h-2 rounded-full bg-current" />
      {status === 'completed' ? 'Réussi' : 'En cours'}
      {' · '}{attemptCount} tentative{attemptCount > 1 ? 's' : ''}
    </span>
    <ExerciseProgressBar status={status} height={4} />
  </div>
)}
```

Le `CardHeader` complet doit ressembler à :

```tsx
<CardHeader className="pb-3">
  <div className="flex items-center gap-2 flex-wrap">
    <Badge variant="outline" className="text-slate-500 border-slate-200 text-xs">
      {DOMAIN_LABELS[exercise.domain] ?? exercise.domain}
    </Badge>
    <Badge variant="outline" className="text-slate-500 border-slate-200 text-xs">
      {exercise.theme}
    </Badge>
    <Badge className="text-xs bg-violet-50 text-violet-600 border-violet-200">
      Niveau {exercise.level}
    </Badge>
  </div>
  {status !== 'not_started' && (
    <div className="mt-2 space-y-1.5">
      <span className={`text-xs font-medium flex items-center gap-1.5 ${
        status === 'completed' ? 'text-green-600' : 'text-amber-600'
      }`}>
        <span className="inline-block w-2 h-2 rounded-full bg-current" />
        {status === 'completed' ? 'Réussi' : 'En cours'}
        {' · '}{attemptCount} tentative{attemptCount > 1 ? 's' : ''}
      </span>
      <ExerciseProgressBar status={status} height={4} />
    </div>
  )}
</CardHeader>
```

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/victorrubia/teachIA && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur

- [ ] **Step 5 : Vérifier visuellement**

Ouvrir un exercice déjà tenté dans `http://localhost:3000/exercices/<id>`. Vérifier :
- L'indicateur "Réussi" (vert) ou "En cours" (orange) apparaît sous les badges
- La barre de progression est visible avec la bonne couleur
- Pour un exercice pas commencé : aucun indicateur

- [ ] **Step 6 : Commit final**

```bash
git add app/(dashboard)/exercices/[id]/page.tsx
git commit -m "feat: add attempt status indicator to exercise detail page"
```
