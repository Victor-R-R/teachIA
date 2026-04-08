# Dashboard gamifié — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter au dashboard : niveau XP de jeu, niveaux A/B/C par domaine mis à jour dynamiquement, objectif quotidien configurable, et liste des exercices/simulations en cours.

**Architecture:** Extension de la table singleton `user_profile` (3 colonnes XP/level/daily_goal), enrichissement de `saveAttempt` pour mettre à jour XP et niveaux A/B/C en temps réel, Server Components sur le dashboard qui lisent ces données. Un Client Component isolé (`DailyGoalEditor`) gère le popover de modification de l'objectif.

**Tech Stack:** Next.js 16 App Router, Neon Postgres, shadcn/ui (Progress, Popover, Input), Lucide React, Vitest

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `scripts/migrate.sql` | Modifier | Nouvelles colonnes + tables |
| `lib/levels.ts` | Créer | Fonctions pures XP/niveau/messages |
| `lib/db.ts` | Modifier | Nouvelles fonctions DB + extension saveAttempt |
| `lib/db.test.ts` | Modifier | Tests des nouvelles fonctions |
| `app/(dashboard)/exercices/[id]/page.tsx` | Modifier | Passer domain/level à saveAttempt |
| `app/(dashboard)/actions.ts` | Créer | Server Action setDailyGoal |
| `components/dashboard/xp-level-card.tsx` | Créer | Widget niveau XP |
| `components/dashboard/domain-levels-card.tsx` | Créer | Widget niveaux A/B/C par domaine |
| `components/dashboard/daily-goal-card.tsx` | Créer | Widget objectif quotidien (Server Component) |
| `components/dashboard/daily-goal-editor.tsx` | Créer | Popover modifier objectif (Client Component) |
| `components/dashboard/in-progress-list.tsx` | Créer | Liste exercices/simulations en cours |
| `app/(dashboard)/page.tsx` | Réécrire | Dashboard complet |

---

## Task 1 : Migration DB

**Files:**
- Modify: `scripts/migrate.sql`

- [ ] **Étape 1 : Ajouter au bas de `scripts/migrate.sql`**

```sql
-- Dashboard gamification
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS xp             INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_xp       INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS daily_goal_min INTEGER DEFAULT 60;

CREATE TABLE IF NOT EXISTS study_sessions (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  domain          TEXT NOT NULL,
  duration_min    INTEGER DEFAULT 0,
  exercises_done  INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  UNIQUE (date, domain)
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL,
  content     TEXT NOT NULL,
  ai_feedback TEXT,
  score       NUMERIC(4,1),
  timestamp   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
```

- [ ] **Étape 2 : Lancer la migration**

```bash
npm run db:migrate
```

Résultat attendu : `Migration complete`

- [ ] **Étape 3 : Commit**

```bash
git add scripts/migrate.sql
git commit -m "feat: add gamification columns and study/exam session tables"
```

---

## Task 2 : Fonctions pures XP (`lib/levels.ts`)

**Files:**
- Create: `lib/levels.ts`

- [ ] **Étape 1 : Créer `lib/levels.ts`**

```ts
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Débutant',
  2: 'Apprenti',
  3: 'Explorateur',
  4: 'Érudit',
  5: 'Lettré',
  6: 'Expert',
  7: 'Savant',
  8: 'Maître',
  9: 'Virtuose',
}

/** Titre du niveau (10+ → 'Professeur') */
export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? 'Professeur'
}

/** XP minimum pour atteindre le niveau n */
export function getXpThreshold(level: number): number {
  return level * level * 100
}

/** Message motivant selon le pourcentage d'objectif atteint (0–100) */
export function getDailyMessage(pct: number): string {
  if (pct === 0) return "C'est parti ! 💪"
  if (pct < 34) return 'Bon début, continue !'
  if (pct < 67) return 'Tu es lancé·e, reste focus !'
  if (pct < 100) return 'Plus que quelques minutes ! 🔥'
  return "Objectif atteint aujourd'hui ! 🏆"
}

/** XP gagné par réponse correcte selon le niveau de l'exercice */
// Pas de XP_GAIN exporté ici — géré dans lib/db.ts (concern DB)
```

- [ ] **Étape 2 : Commit**

```bash
git add lib/levels.ts
git commit -m "feat: add XP level utility functions"
```

---

## Task 3 : Nouvelles fonctions DB (lecture)

**Files:**
- Modify: `lib/db.ts`
- Modify: `lib/db.test.ts`

- [ ] **Étape 1 : Écrire les tests dans `lib/db.test.ts`** (ajouter à la fin du fichier existant)

```ts
describe('gamification helpers', () => {
  it('getUserProfile returns null when table empty', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getUserProfile } = await import('./db')
    const result = await getUserProfile()
    expect(result).toBeNull()
  })

  it('getUserProfile returns profile when exists', async () => {
    vi.resetModules()
    const profile = { id: 1, xp: 420, level_xp: 3, daily_goal_min: 60 }
    const mockSql = vi.fn().mockResolvedValue([profile]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getUserProfile } = await import('./db')
    const result = await getUserProfile()
    expect(result).toEqual(profile)
  })

  it('getTodayMinutes returns 0 when no sessions', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([{ total_min: null }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getTodayMinutes } = await import('./db')
    const result = await getTodayMinutes()
    expect(result).toBe(0)
  })

  it('getTodayMinutes sums duration_min for today', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([{ total_min: 37 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getTodayMinutes } = await import('./db')
    const result = await getTodayMinutes()
    expect(result).toBe(37)
  })

  it('getInProgressExercises returns exercises with attempts but no correct', async () => {
    vi.resetModules()
    const row = { id: 5, question: 'Q?', type: 'qcm', domain: 'langue', level: 'B', attempt_count: 2 }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getInProgressExercises } = await import('./db')
    const result = await getInProgressExercises()
    expect(result).toEqual([row])
  })

  it('getInProgressSimulations returns exam_sessions without ai_feedback', async () => {
    vi.resetModules()
    const row = { id: 1, type: 'traduction', content: '...', ai_feedback: null, score: null, timestamp: '' }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getInProgressSimulations } = await import('./db')
    const result = await getInProgressSimulations()
    expect(result).toEqual([row])
  })
})
```

- [ ] **Étape 2 : Vérifier que les tests échouent**

```bash
npm test
```

Résultat attendu : `getUserProfile is not a function` (ou similaire)

- [ ] **Étape 3 : Ajouter les types et fonctions dans `lib/db.ts`** (à la fin du fichier existant)

```ts
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

export type InProgressExercise = {
  id: number
  question: string
  type: string
  domain: string
  level: 'A' | 'B' | 'C'
  attempt_count: number
}

export type ExamSession = {
  id: number
  type: string
  content: string
  ai_feedback: string | null
  score: number | null
  timestamp: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const rows = await sql.query('SELECT * FROM user_profile LIMIT 1')
  return (rows[0] as UserProfile) ?? null
}

export async function getTodayMinutes(): Promise<number> {
  const rows = await sql.query(
    `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min
     FROM study_sessions WHERE date = CURRENT_DATE`
  )
  return (rows[0] as { total_min: number | null }).total_min ?? 0
}

export async function getInProgressExercises(): Promise<InProgressExercise[]> {
  const rows = await sql.query(
    `WITH stats AS (
       SELECT exercise_id,
              COUNT(*)::int AS attempt_count,
              bool_or(correct) AS has_correct,
              MAX(timestamp) AS last_attempt
       FROM exercise_attempts
       GROUP BY exercise_id
     )
     SELECT e.id, e.question, e.type, e.domain, e.level, s.attempt_count
     FROM stats s
     JOIN exercises e ON e.id = s.exercise_id
     WHERE NOT s.has_correct
     ORDER BY s.last_attempt DESC
     LIMIT 5`
  )
  return rows as InProgressExercise[]
}

export async function getInProgressSimulations(): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT * FROM exam_sessions WHERE ai_feedback IS NULL ORDER BY timestamp DESC LIMIT 3`
  )
  return rows as ExamSession[]
}

export async function updateDailyGoal(minutes: number): Promise<void> {
  await sql.query('UPDATE user_profile SET daily_goal_min = $1', [minutes])
}
```

- [ ] **Étape 4 : Vérifier que les tests passent**

```bash
npm test
```

Résultat attendu : tous les tests `gamification helpers` en PASS

- [ ] **Étape 5 : Commit**

```bash
git add lib/db.ts lib/db.test.ts
git commit -m "feat: add gamification DB read functions (getUserProfile, getTodayMinutes, getInProgressExercises)"
```

---

## Task 4 : Extension de `saveAttempt`

**Files:**
- Modify: `lib/db.ts`
- Modify: `lib/db.test.ts`

- [ ] **Étape 1 : Ajouter les tests dans `lib/db.test.ts`** (à la fin du describe `gamification helpers`)

```ts
  it('saveAttempt does not update XP on incorrect answer', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt({ exercise_id: 1, correct: false, time_spent: null, exercise_level: 'B', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('UPDATE user_profile') && q.includes('xp'))).toBe(false)
  })

  it('saveAttempt increments XP on correct answer', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([])  // INSERT attempt
      .mockResolvedValueOnce([])  // upsert study_sessions (time_spent null → skipped, but we mock anyway)
      .mockResolvedValueOnce([{ xp: 20, level_xp: 1 }]) // UPDATE xp RETURNING
      .mockResolvedValue([{ total: 1, correct_count: 1 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt({ exercise_id: 1, correct: true, time_spent: null, exercise_level: 'B', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('UPDATE user_profile') && q.includes('xp = xp +'))).toBe(true)
  })

  it('saveAttempt upserts study_sessions when time_spent is set', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([]) // INSERT attempt
      .mockResolvedValueOnce([]) // upsert study_sessions
      .mockResolvedValue([{ xp: 10, level_xp: 1 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt({ exercise_id: 1, correct: true, time_spent: 120, exercise_level: 'C', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('INSERT INTO study_sessions'))).toBe(true)
  })
```

- [ ] **Étape 2 : Vérifier que les tests échouent**

```bash
npm test
```

Résultat attendu : tests `saveAttempt` échouent (mauvaise signature ou XP non mis à jour)

- [ ] **Étape 3 : Remplacer la fonction `saveAttempt` dans `lib/db.ts`**

Remplacer la fonction existante :

```ts
export async function saveAttempt(attempt: {
  exercise_id: number
  correct: boolean
  time_spent: number | null
  exercise_level: 'A' | 'B' | 'C'
  exercise_domain: string
}): Promise<void> {
  const { exercise_id, correct, time_spent, exercise_level, exercise_domain } = attempt

  // 1. Enregistrer la tentative
  await sql.query(
    'INSERT INTO exercise_attempts (exercise_id, correct, time_spent) VALUES ($1, $2, $3)',
    [exercise_id, correct, time_spent]
  )

  // 2. Mettre à jour study_sessions (toujours, si durée > 0)
  if (time_spent !== null) {
    const durationMin = Math.floor(time_spent / 60)
    if (durationMin > 0) {
      await sql.query(
        `INSERT INTO study_sessions (date, domain, duration_min, exercises_done, correct_count)
         VALUES (CURRENT_DATE, $1, $2, 1, $3)
         ON CONFLICT (date, domain) DO UPDATE SET
           duration_min = study_sessions.duration_min + EXCLUDED.duration_min,
           exercises_done = study_sessions.exercises_done + 1,
           correct_count = study_sessions.correct_count + EXCLUDED.correct_count`,
        [exercise_domain, durationMin, correct ? 1 : 0]
      )
    }
  }

  // 3. Arrêt si réponse incorrecte (pas d'XP, pas de mise à jour niveau)
  if (!correct) return

  // 4. Incrémenter XP
  const xpGain: Record<'A' | 'B' | 'C', number> = { A: 30, B: 20, C: 10 }
  const gain = xpGain[exercise_level]
  const rows = await sql.query(
    'UPDATE user_profile SET xp = xp + $1 RETURNING xp, level_xp',
    [gain]
  )
  if (rows.length === 0) return // pas encore de profil

  const { xp: newXp, level_xp: currentLevel } = rows[0] as { xp: number; level_xp: number }
  const nextThreshold = (currentLevel + 1) * (currentLevel + 1) * 100
  if (newXp >= nextThreshold) {
    await sql.query('UPDATE user_profile SET level_xp = level_xp + 1')
  }

  // 5. Recalculer le niveau A/B/C du domaine concerné
  const domainGroup =
    exercise_domain === 'langue'
      ? ['langue']
      : exercise_domain === 'civi_espagne' || exercise_domain === 'civi_latam'
        ? ['civi_espagne', 'civi_latam']
        : ['didactique']

  const levelColumn =
    exercise_domain === 'langue'
      ? 'level_langue'
      : exercise_domain === 'civi_espagne' || exercise_domain === 'civi_latam'
        ? 'level_civi'
        : 'level_didactique'

  const statRows = await sql.query(
    `SELECT COUNT(*)::int AS total,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM (
       SELECT ea.correct
       FROM exercise_attempts ea
       JOIN exercises e ON e.id = ea.exercise_id
       WHERE e.domain = ANY($1)
       ORDER BY ea.timestamp DESC
       LIMIT 20
     ) ea`,
    [domainGroup]
  )

  const { total, correct_count } = statRows[0] as { total: number; correct_count: number }
  if (total >= 5) {
    const pct = correct_count / total
    const newLevel = pct >= 0.8 ? 'C' : pct >= 0.5 ? 'B' : 'A'
    await sql.query(`UPDATE user_profile SET ${levelColumn} = $1`, [newLevel])
  }
}
```

- [ ] **Étape 4 : Vérifier que les tests passent**

```bash
npm test
```

Résultat attendu : tous les tests en PASS

- [ ] **Étape 5 : Commit**

```bash
git add lib/db.ts lib/db.test.ts
git commit -m "feat: extend saveAttempt with XP, domain level, and study_sessions tracking"
```

---

## Task 5 : Mettre à jour le call site de `saveAttempt`

**Files:**
- Modify: `app/(dashboard)/exercices/[id]/page.tsx`

- [ ] **Étape 1 : Modifier `handleComplete` dans `app/(dashboard)/exercices/[id]/page.tsx`**

Remplacer :

```ts
  async function handleComplete(correct: boolean) {
    'use server'
    await saveAttempt({ exercise_id: exercise!.id, correct, time_spent: null })
  }
```

Par :

```ts
  async function handleComplete(correct: boolean, timeSpent?: number) {
    'use server'
    await saveAttempt({
      exercise_id: exercise!.id,
      correct,
      time_spent: timeSpent ?? null,
      exercise_level: exercise!.level,
      exercise_domain: exercise!.domain,
    })
  }
```

- [ ] **Étape 2 : Vérifier que le build TypeScript passe**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 3 : Commit**

```bash
git add "app/(dashboard)/exercices/[id]/page.tsx"
git commit -m "feat: pass exercise level and domain to saveAttempt"
```

---

## Task 6 : Server Action `setDailyGoal`

**Files:**
- Create: `app/(dashboard)/actions.ts`

- [ ] **Étape 1 : Créer `app/(dashboard)/actions.ts`**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { updateDailyGoal } from '@/lib/db'

export async function setDailyGoal(minutes: number): Promise<void> {
  const clamped = Math.min(240, Math.max(10, minutes))
  await updateDailyGoal(clamped)
  revalidatePath('/')
}
```

- [ ] **Étape 2 : Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 3 : Commit**

```bash
git add "app/(dashboard)/actions.ts"
git commit -m "feat: add setDailyGoal server action"
```

---

## Task 7 : Composants du dashboard

**Files:**
- Create: `components/dashboard/xp-level-card.tsx`
- Create: `components/dashboard/domain-levels-card.tsx`
- Create: `components/dashboard/daily-goal-editor.tsx`
- Create: `components/dashboard/daily-goal-card.tsx`
- Create: `components/dashboard/in-progress-list.tsx`

- [ ] **Étape 1 : Créer `components/dashboard/xp-level-card.tsx`**

```tsx
import { Zap, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getLevelTitle, getXpThreshold } from '@/lib/levels'
import type { UserProfile } from '@/lib/db'

export function XPLevelCard({ profile }: { profile: UserProfile }) {
  const { xp, level_xp } = profile
  const currentThreshold = getXpThreshold(level_xp)
  const nextThreshold = getXpThreshold(level_xp + 1)
  const xpInLevel = xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  const Icon = level_xp >= 6 ? Trophy : Zap

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-sm font-medium text-slate-900">
            Niveau {level_xp} — {getLevelTitle(level_xp)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 text-right">
          {xp} / {nextThreshold} XP · +{nextThreshold - xp} pour le niveau {level_xp + 1}
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Étape 2 : Créer `components/dashboard/domain-levels-card.tsx`**

```tsx
import { Card, CardContent } from '@/components/ui/card'
import type { UserProfile } from '@/lib/db'

const DOMAIN_ROWS = [
  { label: 'Langue', key: 'level_langue' },
  { label: 'Civilisation', key: 'level_civi' },
  { label: 'Didactique', key: 'level_didactique' },
] as const

const LEVEL_COLORS: Record<'A' | 'B' | 'C', string> = {
  A: 'bg-red-50 text-red-600 border-red-200',
  B: 'bg-amber-50 text-amber-600 border-amber-200',
  C: 'bg-green-50 text-green-600 border-green-200',
}

const LEVEL_DOTS: Record<'A' | 'B' | 'C', number> = { A: 1, B: 2, C: 3 }

export function DomainLevelsCard({ profile }: { profile: UserProfile }) {
  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          Niveaux par domaine
        </p>
        <div className="space-y-2.5">
          {DOMAIN_ROWS.map(({ label, key }) => {
            const level = profile[key] as 'A' | 'B' | 'C' | null
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          level && i <= LEVEL_DOTS[level]
                            ? 'bg-violet-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </span>
                  {level ? (
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${LEVEL_COLORS[level]}`}>
                      {level}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Étape 3 : Créer `components/dashboard/daily-goal-editor.tsx`** (Client Component)

```tsx
'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setDailyGoal } from '@/app/(dashboard)/actions'

export function DailyGoalEditor({ currentGoal }: { currentGoal: number }) {
  const [value, setValue] = useState(String(currentGoal))
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSave() {
    const minutes = parseInt(value, 10)
    if (isNaN(minutes) || minutes < 10 || minutes > 240) return
    setPending(true)
    await setDailyGoal(minutes)
    setPending(false)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-xs text-violet-600 hover:underline cursor-pointer">
          Modifier
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <p className="text-xs text-slate-500 mb-2">Objectif (10–240 min)</p>
        <Input
          type="number"
          min={10}
          max={240}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="mb-2 h-8 text-sm"
        />
        <Button
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Étape 4 : Créer `components/dashboard/daily-goal-card.tsx`**

```tsx
import { Timer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getDailyMessage } from '@/lib/levels'
import { DailyGoalEditor } from './daily-goal-editor'

interface DailyGoalCardProps {
  todayMinutes: number
  goalMinutes: number
}

export function DailyGoalCard({ todayMinutes, goalMinutes }: DailyGoalCardProps) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-violet-500 shrink-0" />
            <span className="text-sm font-medium text-slate-900">Objectif du jour</span>
          </div>
          <DailyGoalEditor currentGoal={goalMinutes} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{todayMinutes} / {goalMinutes} min</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-violet-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{getDailyMessage(pct)}</p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Étape 5 : Créer `components/dashboard/in-progress-list.tsx`**

```tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, FileText } from 'lucide-react'
import type { InProgressExercise, ExamSession } from '@/lib/db'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Amér. latine',
  didactique: 'Didactique',
}

const TYPE_LABELS: Record<string, string> = {
  composition: 'Composition',
  traduction: 'Traduction',
  explication: 'Explication de texte',
}

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-50 text-red-600 border-red-200',
  B: 'bg-amber-50 text-amber-600 border-amber-200',
  C: 'bg-green-50 text-green-600 border-green-200',
}

interface InProgressListProps {
  exercises: InProgressExercise[]
  simulations: ExamSession[]
}

export function InProgressList({ exercises, simulations }: InProgressListProps) {
  if (exercises.length === 0 && simulations.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-violet-500" />
        À reprendre
      </h2>
      <div className="grid gap-2">
        {exercises.map(ex => (
          <Link key={ex.id} href={`/exercices/${ex.id}`}>
            <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 line-clamp-1 mb-1">{ex.question}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {DOMAIN_LABELS[ex.domain] ?? ex.domain}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-amber-600">
                      {ex.attempt_count} tentative{ex.attempt_count > 1 ? 's' : ''} sans succès
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-xs ${LEVEL_COLORS[ex.level]}`}>{ex.level}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {simulations.map(sim => (
          <Link key={sim.id} href={`/simulacros/${sim.id}`}>
            <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-900">
                      Simulation — {TYPE_LABELS[sim.type] ?? sim.type}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Commencée le{' '}
                    {new Date(sim.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Étape 6 : Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 7 : Commit**

```bash
git add components/dashboard/
git commit -m "feat: add dashboard gamification components (XP, domain levels, daily goal, in-progress)"
```

---

## Task 8 : Réécrire `app/(dashboard)/page.tsx`

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Étape 1 : Réécrire `app/(dashboard)/page.tsx`**

```tsx
import Link from 'next/link'
import { Target } from 'lucide-react'
import { getUserProfile, getTodayMinutes, getInProgressExercises, getInProgressSimulations } from '@/lib/db'
import { XPLevelCard } from '@/components/dashboard/xp-level-card'
import { DomainLevelsCard } from '@/components/dashboard/domain-levels-card'
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card'
import { InProgressList } from '@/components/dashboard/in-progress-list'

export default async function DashboardPage() {
  const [profile, todayMin, inProgressExercises, inProgressSims] = await Promise.all([
    getUserProfile(),
    getTodayMinutes(),
    getInProgressExercises(),
    getInProgressSimulations(),
  ])

  // Onboarding CTA
  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Tableau de bord</h1>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-6 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
            <Target className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Commence par évaluer ton niveau</p>
            <p className="text-sm text-slate-500">
              Fais le test de niveau pour personnaliser ton parcours de révision.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Passer le test →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>

      {/* Zone 2 — Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <XPLevelCard profile={profile} />
        <DomainLevelsCard profile={profile} />
      </div>

      {/* Zone 3 — Objectif du jour */}
      <DailyGoalCard
        todayMinutes={todayMin}
        goalMinutes={profile.daily_goal_min}
      />

      {/* Zone 4 — En cours */}
      <InProgressList
        exercises={inProgressExercises}
        simulations={inProgressSims}
      />
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier le build complet**

```bash
npm run build
```

Résultat attendu : build sans erreurs ni warnings TypeScript

- [ ] **Étape 3 : Vérifier en dev**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` et vérifier :
- Si `user_profile` vide → carte onboarding avec bouton
- Si profil existe → 4 zones visibles, barre XP, niveaux domaines, objectif quotidien
- Clic "Modifier" → popover avec input minutes
- Exercices en cours apparaissent dans la zone 4

- [ ] **Étape 4 : Commit final**

```bash
git add "app/(dashboard)/page.tsx"
git commit -m "feat: gamified dashboard — XP level, domain levels, daily goal, in-progress list"
```

---

## Checklist de couverture spec

| Exigence spec | Tâche |
|---|---|
| Migration 3 colonnes user_profile | Task 1 |
| Tables study_sessions + exam_sessions | Task 1 |
| getUserProfile, getTodayMinutes, getInProgressExercises, getInProgressSimulations | Task 3 |
| updateDailyGoal | Task 3 |
| saveAttempt → XP incrémenté sur réponse correcte | Task 4 |
| saveAttempt → level_xp recalculé si seuil atteint | Task 4 |
| saveAttempt → niveau A/B/C domaine recalculé (≥5 tentatives) | Task 4 |
| saveAttempt → upsert study_sessions si time_spent non null | Task 4 |
| Call site exercice mis à jour (domain + level) | Task 5 |
| Server Action setDailyGoal | Task 6 |
| XPLevelCard avec barre et titre de niveau | Task 7 |
| DomainLevelsCard avec 3 domaines et badge couleur | Task 7 |
| DailyGoalCard avec barre progressive et message | Task 7 |
| DailyGoalEditor (popover client component) | Task 7 |
| InProgressList (exercices + simulations) | Task 7 |
| Dashboard page avec 4 zones + CTA onboarding | Task 8 |
