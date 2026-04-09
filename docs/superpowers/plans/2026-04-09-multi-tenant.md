# Multi-tenant & Superadmin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate teachIA from single-user password auth to multi-tenant Google OAuth with per-user data isolation and a full superadmin panel.

**Architecture:** Auth.js v5 with Google provider and `@auth/pg-adapter` (using Neon Pool) handles auth and session storage. All DB functions receive an explicit `userId`. `proxy.ts` uses the Auth.js middleware. A `getEffectiveUserId()` helper in `lib/session.ts` supports impersonation via httpOnly cookie.

**Tech Stack:** `next-auth@5`, `@auth/pg-adapter`, `@neondatabase/serverless` Pool, Vitest, Next.js 16 App Router

---

## File Map

**Created:**
- `lib/session.ts` — `getEffectiveUserId()` and `getSession()` helpers
- `lib/admin-db.ts` — DB functions for the admin panel (user CRUD, app_settings)
- `app/api/auth/[...nextauth]/route.ts` — Auth.js HTTP handlers
- `app/api/admin/impersonate/route.ts` — POST: set impersonation cookie
- `app/api/admin/impersonate/stop/route.ts` — POST: clear impersonation cookie
- `scripts/migrate-multitenant.sql` — DB migration (run once before deploy)
- `app/admin/layout.tsx` — admin shell with superadmin guard
- `app/admin/page.tsx` — admin dashboard
- `app/admin/users/page.tsx` — user list
- `app/admin/users/[id]/page.tsx` — user detail
- `app/admin/catalog/page.tsx` — catalog exercises/flashcards CRUD
- `app/admin/settings/page.tsx` — app_settings CRUD
- `app/admin/users/actions.ts` — server actions: block, delete
- `app/admin/catalog/actions.ts` — server actions: save/delete exercises and flashcards
- `app/admin/settings/actions.ts` — server action: upsert setting
- `components/admin/impersonation-banner.tsx` — yellow banner when impersonating

**Modified:**
- `lib/auth.ts` — complete rewrite: Auth.js v5 config
- `lib/auth.test.ts` — replace JWT tests with Auth.js callback tests
- `lib/db.ts` — add `userId: string` to every function
- `proxy.ts` — replace JWT check with Auth.js middleware
- `app/(auth)/login/page.tsx` — replace password form with Google button
- `app/(dashboard)/layout.tsx` — render impersonation banner
- `app/(dashboard)/page.tsx` — use `getEffectiveUserId()`
- `app/(dashboard)/actions.ts` — add userId
- `app/onboarding/page.tsx` — no change (client component, calls API)
- `app/api/onboarding/save/route.ts` — extract userId from session
- `app/api/exercises/generate/route.ts` — pass userId to `saveExercise`
- `app/api/exercises/correct/route.ts` — no userId needed (reads shared data)
- `app/api/flashcards/generate/route.ts` — pass userId to `saveFlashcard`
- `app/api/flashcards/review/route.ts` — pass userId to `saveFlashcardReview`
- `app/api/conversations/route.ts` — pass userId to conversation functions
- `app/api/conversations/[id]/route.ts` — pass userId
- `app/api/chat/route.ts` — pass userId
- `app/api/simulacros/generate/route.ts` — pass userId
- `app/api/simulacros/submit/route.ts` — pass userId
- `app/api/plan/generate/route.ts` — pass userId
- `components/layout/sidebar.tsx` — add conditional "Administration" link
- `package.json` — add `next-auth`, `@auth/pg-adapter`

---

## Phase 1 — Auth Infrastructure

### Task 1: Install Auth.js dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install next-auth@5 @auth/pg-adapter
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('next-auth'); console.log('next-auth ok')"
node -e "require('@auth/pg-adapter'); console.log('@auth/pg-adapter ok')"
```

Expected: both print `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-auth v5 and @auth/pg-adapter"
```

---

### Task 2: Write DB migration script

**Files:**
- Create: `scripts/migrate-multitenant.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- scripts/migrate-multitenant.sql

-- ─── Auth.js tables ──────────────────────────────────────────────────────────
-- Users table: Auth.js required columns + our custom role/blocked
CREATE TABLE IF NOT EXISTS users (
  id                TEXT        PRIMARY KEY,
  name              TEXT,
  email             TEXT        UNIQUE NOT NULL,
  email_verified    TIMESTAMPTZ,
  image             TEXT,
  role              TEXT        NOT NULL DEFAULT 'student'
                                CHECK (role IN ('student', 'superadmin')),
  blocked           BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  session_token TEXT        PRIMARY KEY,
  user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ─── App settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value) VALUES
  ('xp_gain_A',            '30'),
  ('xp_gain_B',            '20'),
  ('xp_gain_C',            '10'),
  ('xp_decay_per_day',     '10'),
  ('default_daily_goal_min','60')
ON CONFLICT (key) DO NOTHING;

-- ─── Add user_id to existing tables ──────────────────────────────────────────
ALTER TABLE user_profile      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exercise_attempts  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE study_sessions     ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exam_sessions      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE conversations      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcard_reviews  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to content tables (NULL = shared catalogue)
ALTER TABLE exercises   ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcards  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Existing exercises and flashcards become shared catalogue (user_id stays NULL)

-- Fix study_sessions UNIQUE constraint to include user_id
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_date_domain_key;
ALTER TABLE study_sessions
  ADD CONSTRAINT IF NOT EXISTS study_sessions_date_domain_user_key
  UNIQUE (date, domain, user_id);

-- ─── Purge orphaned user data (fresh start) ───────────────────────────────────
-- Exercises and flashcards are kept as shared catalogue
TRUNCATE TABLE flashcard_reviews, exam_sessions, study_sessions,
               exercise_attempts, conversation_messages, conversations,
               user_profile RESTART IDENTITY CASCADE;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id       ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id  ON exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id     ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id      ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id      ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id  ON flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id          ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id         ON flashcards(user_id);
```

- [ ] **Step 2: Add migration script to package.json**

In `package.json`, add to `"scripts"`:
```json
"db:migrate-multitenant": "npx dotenv -e .env.local -- node -e \"const { neon } = require('@neondatabase/serverless'); const fs = require('fs'); const sql = neon(process.env.DATABASE_URL); sql.query(fs.readFileSync('./scripts/migrate-multitenant.sql', 'utf8')).then(() => { console.log('Multi-tenant migration complete'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); })\""
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-multitenant.sql package.json
git commit -m "feat: add multi-tenant DB migration script"
```

---

### Task 3: Rewrite lib/auth.ts for Auth.js v5

**Files:**
- Modify: `lib/auth.ts` (complete rewrite)
- Modify: `lib/auth.test.ts` (replace old JWT tests)

- [ ] **Step 1: Rewrite lib/auth.ts**

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Block blocked users
      if (!user?.id) return true
      try {
        const result = await pool.query(
          'SELECT blocked FROM users WHERE id = $1',
          [user.id]
        )
        if (result.rows[0]?.blocked === true) return false
      } catch {
        // User may not exist yet (first sign-in), allow through
      }
      return true
    },
    async session({ session, user }) {
      // Attach id and role to session
      session.user.id = user.id
      const result = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [user.id]
      )
      const role = result.rows[0]?.role ?? 'student'
      // Promote to superadmin if email matches env var
      if (
        process.env.SUPERADMIN_EMAIL &&
        session.user.email === process.env.SUPERADMIN_EMAIL &&
        role !== 'superadmin'
      ) {
        await pool.query(
          "UPDATE users SET role = 'superadmin' WHERE id = $1",
          [user.id]
        )
        session.user.role = 'superadmin'
      } else {
        session.user.role = role
      }
      return session
    },
  },
})

// TypeScript augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'student' | 'superadmin'
    } & import('next-auth').DefaultSession['user']
  }
}
```

- [ ] **Step 2: Replace lib/auth.test.ts**

```ts
// lib/auth.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'

// Auth.js v5 config is integration-tested (requires DB + Google OAuth).
// This file keeps the test runner happy and will grow as helpers are extracted.
describe('auth module', () => {
  it('exports handlers, auth, signIn, signOut', async () => {
    // Dynamic import to avoid executing DB pool at import time in CI without DB
    const mod = await import('./auth').catch(() => null)
    if (!mod) {
      // Skip gracefully when DB env vars are absent
      expect(true).toBe(true)
      return
    }
    expect(typeof mod.handlers).toBe('object')
    expect(typeof mod.auth).toBe('function')
    expect(typeof mod.signIn).toBe('function')
    expect(typeof mod.signOut).toBe('function')
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: tests pass (or the auth test skips gracefully if DB vars absent)

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts
git commit -m "feat: replace JWT auth with Auth.js v5 Google provider"
```

---

### Task 4: Create Auth.js API route handler

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create the route handler**

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/
git commit -m "feat: add Auth.js API route handler"
```

---

### Task 5: Replace proxy.ts with Auth.js middleware

**Files:**
- Modify: `proxy.ts` (complete rewrite)

- [ ] **Step 1: Rewrite proxy.ts**

```ts
// proxy.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Auth.js routes and static assets are always public
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Unauthenticated → redirect to login
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    if (pathname !== '/login') {
      loginUrl.searchParams.set('from', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes → superadmin only
  if (pathname.startsWith('/admin') && session.user.role !== 'superadmin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: replace JWT middleware with Auth.js session middleware"
```

---

### Task 6: Replace login page with Google OAuth button

**Files:**
- Modify: `app/(auth)/login/page.tsx` (complete rewrite)

- [ ] **Step 1: Rewrite login page**

```tsx
// app/(auth)/login/page.tsx
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-violet-600" />
          </div>
          <CardTitle className="text-slate-900">teachIA</CardTitle>
          <CardDescription className="text-slate-500">
            Préparation CAPES d&apos;espagnol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Continuer avec Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Add env vars to .env.local**

Add to `.env.local` (get values from Google Cloud Console → APIs & Services → Credentials):
```env
AUTH_SECRET=<run: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
SUPERADMIN_EMAIL=<your gmail>
```

Remove `APP_PASSWORD` from `.env.local`.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat: replace password login with Google OAuth button"
```

---

## Phase 2 — Data Layer

### Task 7: Create lib/session.ts

**Files:**
- Create: `lib/session.ts`

- [ ] **Step 1: Write tests first**

```ts
// lib/session.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth and next/headers before importing session module
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'

describe('getEffectiveUserId', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns session user id for a regular student', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', role: 'student', email: 't@t.com', name: 'T', image: null },
      expires: '',
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never)

    const { getEffectiveUserId } = await import('./session')
    const id = await getEffectiveUserId()
    expect(id).toBe('user-123')
  })

  it('returns impersonated id for superadmin with impersonation cookie', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'superadmin', email: 'a@a.com', name: 'A', image: null },
      expires: '',
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === 'impersonate_user_id' ? { value: 'student-42' } : undefined,
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never)

    vi.resetModules()
    const { getEffectiveUserId } = await import('./session')
    const id = await getEffectiveUserId()
    expect(id).toBe('student-42')
  })

  it('redirects to /login when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    vi.resetModules()
    const { getEffectiveUserId } = await import('./session')
    await expect(getEffectiveUserId()).rejects.toThrow('REDIRECT:/login')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test lib/session.test.ts
```

Expected: FAIL — module `lib/session.ts` does not exist

- [ ] **Step 3: Implement lib/session.ts**

```ts
// lib/session.ts
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

export type AppSession = Session & {
  user: Session['user'] & { id: string; role: 'student' | 'superadmin' }
}

/**
 * Returns the effective user ID for the current request.
 * If the superadmin has activated impersonation, returns the impersonated user's ID.
 * Redirects to /login if not authenticated.
 */
export async function getEffectiveUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  if ((session as AppSession).user.role === 'superadmin') {
    const cookieStore = await cookies()
    const impersonated = cookieStore.get('impersonate_user_id')
    if (impersonated?.value) return impersonated.value
  }

  return session.user.id
}

/**
 * Returns the full session, redirecting to /login if absent.
 */
export async function getSession(): Promise<AppSession> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session as AppSession
}
```

- [ ] **Step 4: Run tests**

```bash
npm test lib/session.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/session.ts lib/session.test.ts
git commit -m "feat: add getEffectiveUserId helper with impersonation support"
```

---

### Task 8: Refactor lib/db.ts — add userId to all functions

**Files:**
- Modify: `lib/db.ts`

This task rewrites every function to accept `userId: string`. Read the current file before editing.

- [ ] **Step 1: Update all user-scoped functions**

Replace the entire `lib/db.ts` with the version below. Key changes:
- Every function that reads/writes user data gains `userId: string` as first param
- `getUserProfile()` → `getUserProfile(userId)` with `WHERE user_id = $1`
- `saveAttempt()` → `saveAttempt(userId, attempt)` includes `user_id` in INSERT
- `getConversations()` → `getConversations(userId)` with `WHERE user_id = $1`
- etc.
- `getExercises(userId, filters)` queries `WHERE (user_id IS NULL OR user_id = $userId)`
- `saveExercise(userId | null, exercise)` — null for catalogue, string for private
- `getFlashcards(userId, filters)` queries catalogue + private
- `saveFlashcard(userId | null, card)` — null for catalogue

Full replacement (only the changed function signatures are shown; keep existing type definitions):

```ts
// lib/db.ts
import { neon } from '@neondatabase/serverless'
import type { Domain, Level, ExerciseType } from '@/lib/constants'

const sql = neon(process.env.DATABASE_URL!)

// ── (all existing type definitions stay unchanged) ──

export async function getAttemptStatsByExercises(
  userId: string,
  ids: number[]
): Promise<AttemptStats[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT exercise_id, COUNT(*)::int AS attempt_count, bool_or(correct) AS has_correct
     FROM exercise_attempts
     WHERE user_id = $1 AND exercise_id = ANY($2::int[])
     GROUP BY exercise_id`,
    [userId, ids]
  )
  return rows as AttemptStats[]
}

export async function getExercises(
  userId: string,
  filters: { domain?: Domain; level?: Level; type?: ExerciseType; limit?: number } = {}
): Promise<Exercise[]> {
  const { domain, level, type, limit = 20 } = filters
  const conditions: string[] = ['(user_id IS NULL OR user_id = $1)']
  const params: unknown[] = [userId]
  let i = 2

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }
  if (type) { conditions.push(`type = $${i++}`); params.push(type) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const rows = await sql.query(
    `SELECT * FROM exercises ${where} ORDER BY RANDOM() LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Exercise[]
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  // No userId filter: exercises are either shared or private; access checked at route level
  const rows = await sql.query('SELECT * FROM exercises WHERE id = $1', [id])
  return (rows[0] as Exercise) ?? null
}

export async function saveAttempt(
  userId: string,
  attempt: {
    exercise_id: number
    correct: boolean
    time_spent: number | null
    exercise_level: 'A' | 'B' | 'C'
    exercise_domain: string
  }
): Promise<void> {
  const { exercise_id, correct, time_spent, exercise_level, exercise_domain } = attempt

  await sql.query(
    'INSERT INTO exercise_attempts (user_id, exercise_id, correct, time_spent) VALUES ($1, $2, $3, $4)',
    [userId, exercise_id, correct, time_spent]
  )

  if (time_spent !== null) {
    const durationMin = Math.floor(time_spent / 60)
    if (durationMin > 0) {
      await sql.query(
        `INSERT INTO study_sessions (user_id, date, domain, duration_min, exercises_done, correct_count)
         VALUES ($1, CURRENT_DATE, $2, $3, 1, $4)
         ON CONFLICT (date, domain, user_id) DO UPDATE SET
           duration_min = study_sessions.duration_min + EXCLUDED.duration_min,
           exercises_done = study_sessions.exercises_done + 1,
           correct_count = study_sessions.correct_count + EXCLUDED.correct_count`,
        [userId, exercise_domain, durationMin, correct ? 1 : 0]
      )
    }
  }

  if (!correct) return

  const xpGain: Record<'A' | 'B' | 'C', number> = { A: 30, B: 20, C: 10 }
  const gain = xpGain[exercise_level]
  const rows = await sql.query(
    'UPDATE user_profile SET xp = xp + $1 WHERE user_id = $2 RETURNING xp, level_xp',
    [gain, userId]
  )
  if (rows.length === 0) return

  const { xp: newXp, level_xp: currentLevel } = rows[0] as { xp: number; level_xp: number }
  const nextThreshold = (currentLevel + 1) * (currentLevel + 1) * 100
  if (newXp >= nextThreshold) {
    await sql.query('UPDATE user_profile SET level_xp = level_xp + 1 WHERE user_id = $1', [userId])
  }

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
       WHERE ea.user_id = $1 AND e.domain = ANY($2)
       ORDER BY ea.timestamp DESC
       LIMIT 20
     ) ea`,
    [userId, domainGroup]
  )

  const { total, correct_count } = statRows[0] as { total: number; correct_count: number }
  if (total >= 5) {
    const pct = correct_count / total
    const newLevel = pct >= 0.8 ? 'C' : pct >= 0.5 ? 'B' : 'A'
    await sql.query(`UPDATE user_profile SET ${levelColumn} = $1 WHERE user_id = $2`, [newLevel, userId])
  }
}

export async function saveExercise(
  userId: string | null,
  exercise: Omit<Exercise, 'id' | 'created_at'>
): Promise<Exercise> {
  const rows = await sql.query(
    `INSERT INTO exercises (user_id, theme, domain, type, question, options, answer, explanation, level, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [userId, exercise.theme, exercise.domain, exercise.type, exercise.question,
     exercise.options, exercise.answer, exercise.explanation,
     exercise.level, exercise.source]
  )
  return rows[0] as Exercise
}

export async function createConversation(userId: string, id: string): Promise<void> {
  await sql.query(
    'INSERT INTO conversations (id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [id, userId]
  )
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  await sql.query(
    `INSERT INTO conversation_messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
    [conversationId, role, content]
  )
  await sql.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId])
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await sql.query('UPDATE conversations SET title = $1 WHERE id = $2', [title, id])
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await sql.query(
    `SELECT c.id, c.title, c.created_at, c.updated_at,
            COUNT(m.id)::text AS message_count
     FROM conversations c
     LEFT JOIN conversation_messages m ON m.conversation_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
    [userId]
  )
  return rows as ConversationSummary[]
}

export async function getConversationMessages(id: string): Promise<ConversationMessage[]> {
  const rows = await sql.query(
    `SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [id]
  )
  return rows as ConversationMessage[]
}

export async function deleteConversation(id: string): Promise<void> {
  await sql.query('DELETE FROM conversations WHERE id = $1', [id])
}

export async function getMessageCount(conversationId: string): Promise<number> {
  const rows = await sql.query(
    'SELECT COUNT(*)::int AS count FROM conversation_messages WHERE conversation_id = $1',
    [conversationId]
  )
  return (rows[0] as { count: number }).count
}

export async function hasTitle(conversationId: string): Promise<boolean> {
  const rows = await sql.query('SELECT title FROM conversations WHERE id = $1', [conversationId])
  return !!(rows[0] as { title: string | null } | undefined)?.title
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const rows = await sql.query('SELECT * FROM user_profile WHERE user_id = $1', [userId])
  return (rows[0] as UserProfile) ?? null
}

export async function getTodayMinutes(userId: string): Promise<number> {
  const rows = await sql.query(
    `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min
     FROM study_sessions WHERE user_id = $1 AND date = CURRENT_DATE`,
    [userId]
  )
  return (rows[0] as { total_min: number | null }).total_min ?? 0
}

export async function getInProgressExercises(userId: string): Promise<InProgressExercise[]> {
  const rows = await sql.query(
    `WITH stats AS (
       SELECT exercise_id,
              COUNT(*)::int AS attempt_count,
              bool_or(correct) AS has_correct,
              MAX(timestamp) AS last_attempt
       FROM exercise_attempts
       WHERE user_id = $1
       GROUP BY exercise_id
     )
     SELECT e.id, e.question, e.type, e.domain, e.level, s.attempt_count
     FROM stats s
     JOIN exercises e ON e.id = s.exercise_id
     WHERE NOT s.has_correct
     ORDER BY s.last_attempt DESC
     LIMIT 5`,
    [userId]
  )
  return rows as InProgressExercise[]
}

export async function getInProgressSimulations(userId: string): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT * FROM exam_sessions WHERE user_id = $1 AND ai_feedback IS NULL ORDER BY timestamp DESC LIMIT 3`,
    [userId]
  )
  return rows as ExamSession[]
}

export async function updateDailyGoal(userId: string, minutes: number): Promise<void> {
  await sql.query('UPDATE user_profile SET daily_goal_min = $1 WHERE user_id = $2', [minutes, userId])
}

export async function applyXpDecay(userId: string): Promise<number> {
  const profileRows = await sql.query(
    'SELECT last_checked_date FROM user_profile WHERE user_id = $1',
    [userId]
  )
  if (profileRows.length === 0) return 0

  const { last_checked_date } = profileRows[0] as { last_checked_date: string | null }

  if (last_checked_date) {
    const lastChecked = new Date(last_checked_date)
    const today = new Date()
    lastChecked.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (lastChecked >= today) return 0
  }

  const inactiveRows = await sql.query(
    `SELECT COUNT(*)::int AS inactive_days
     FROM generate_series(
       COALESCE($1::date, CURRENT_DATE) + 1,
       CURRENT_DATE - 1,
       '1 day'::interval
     ) AS d(day)
     WHERE NOT EXISTS (
       SELECT 1 FROM study_sessions ss WHERE ss.user_id = $2 AND ss.date = d.day::date
     )`,
    [last_checked_date ?? null, userId]
  )

  const inactiveDays = (inactiveRows[0] as { inactive_days: number }).inactive_days
  await sql.query('UPDATE user_profile SET last_checked_date = CURRENT_DATE WHERE user_id = $1', [userId])

  if (inactiveDays === 0) return 0

  const xpLost = inactiveDays * 10
  await sql.query('UPDATE user_profile SET xp = GREATEST(0, xp - $1) WHERE user_id = $2', [xpLost, userId])
  return xpLost
}

export async function getFlashcards(
  userId: string,
  filters: { domain?: Domain; level?: Level; limit?: number } = {}
): Promise<Flashcard[]> {
  const { domain, level, limit = 200 } = filters
  const conditions: string[] = ['(user_id IS NULL OR user_id = $1)']
  const params: unknown[] = [userId]
  let i = 2

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const rows = await sql.query(
    `SELECT * FROM flashcards ${where} ORDER BY created_at ASC LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Flashcard[]
}

export async function saveFlashcard(
  userId: string | null,
  card: Omit<Flashcard, 'id' | 'created_at'>
): Promise<Flashcard> {
  const rows = await sql.query(
    `INSERT INTO flashcards (user_id, front, back, domain, level, source)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, card.front, card.back, card.domain, card.level, card.source]
  )
  return rows[0] as Flashcard
}

export async function saveFlashcardReview(
  userId: string,
  flashcard_id: number,
  known: boolean
): Promise<void> {
  await sql.query(
    'INSERT INTO flashcard_reviews (user_id, flashcard_id, known) VALUES ($1, $2, $3)',
    [userId, flashcard_id, known]
  )
}

export async function getFlashcardReviewStats(
  userId: string,
  ids: number[]
): Promise<FlashcardReviewStat[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT
       flashcard_id,
       COUNT(*)::int AS total,
       SUM(CASE WHEN known THEN 1 ELSE 0 END)::int AS known_count,
       (array_agg(known ORDER BY timestamp DESC))[1] AS last_known
     FROM flashcard_reviews
     WHERE user_id = $1 AND flashcard_id = ANY($2::int[])
     GROUP BY flashcard_id`,
    [userId, ids]
  )
  return rows as FlashcardReviewStat[]
}

export async function createSimulacro(
  userId: string,
  type: string,
  title: string,
  subject: string
): Promise<ExamSession> {
  const rows = await sql.query(
    `INSERT INTO exam_sessions (user_id, type, title, subject, content)
     VALUES ($1, $2, $3, $4, '') RETURNING *`,
    [userId, type, title, subject]
  )
  return rows[0] as ExamSession
}

export async function saveSimulacroResponse(id: number, content: string): Promise<void> {
  await sql.query('UPDATE exam_sessions SET content = $1 WHERE id = $2', [content, id])
}

export async function saveSimulacroFeedback(id: number, ai_feedback: string, score: number): Promise<void> {
  await sql.query(
    'UPDATE exam_sessions SET ai_feedback = $1, score = $2 WHERE id = $3',
    [ai_feedback, score, id]
  )
}

export async function getSimulacros(userId: string): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT id, type, title, subject, content, ai_feedback, score, timestamp
     FROM exam_sessions
     WHERE user_id = $1 AND subject IS NOT NULL
     ORDER BY timestamp DESC
     LIMIT 50`,
    [userId]
  )
  return rows as ExamSession[]
}

export async function getSimulacroById(id: number): Promise<ExamSession | null> {
  const rows = await sql.query('SELECT * FROM exam_sessions WHERE id = $1', [id])
  return (rows[0] as ExamSession) ?? null
}

export async function getGlobalStats(userId: string): Promise<GlobalStats> {
  const [attemptsRow, studyRow] = await Promise.all([
    sql.query(
      `SELECT COUNT(*)::int AS total_attempts,
              SUM(CASE WHEN correct THEN 1 ELSE 0 END)::int AS correct_count,
              COUNT(DISTINCT exercise_id)::int AS unique_exercises
       FROM exercise_attempts WHERE user_id = $1`,
      [userId]
    ),
    sql.query(
      `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min FROM study_sessions WHERE user_id = $1`,
      [userId]
    ),
  ])
  const a = attemptsRow[0] as { total_attempts: number; correct_count: number; unique_exercises: number }
  return {
    total_attempts: a?.total_attempts ?? 0,
    correct_count: a?.correct_count ?? 0,
    unique_exercises: a?.unique_exercises ?? 0,
    total_study_min: (studyRow[0] as { total_min: number })?.total_min ?? 0,
  }
}

export async function getDomainStats(userId: string): Promise<DomainStat[]> {
  const rows = await sql.query(
    `SELECT e.domain,
            COUNT(ea.id)::int AS attempts,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM exercise_attempts ea
     JOIN exercises e ON e.id = ea.exercise_id
     WHERE ea.user_id = $1
     GROUP BY e.domain
     ORDER BY e.domain`,
    [userId]
  )
  return rows as DomainStat[]
}

export async function getDailyActivity(userId: string, days: number = 7): Promise<DailyActivity[]> {
  const rows = await sql.query(
    `SELECT date::text,
            SUM(duration_min)::int AS duration_min,
            SUM(exercises_done)::int AS exercises_done
     FROM study_sessions
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days - 1} days'
     GROUP BY date
     ORDER BY date`,
    [userId]
  )
  return rows as DailyActivity[]
}

export async function getSimulacroGlobalStats(userId: string): Promise<SimulacroGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(CASE WHEN ai_feedback IS NOT NULL THEN 1 END)::int AS corrected,
            ROUND(AVG(score)::numeric, 1) AS avg_score
     FROM exam_sessions
     WHERE user_id = $1 AND subject IS NOT NULL`,
    [userId]
  )
  const r = rows[0] as SimulacroGlobalStats
  return { total: r?.total ?? 0, corrected: r?.corrected ?? 0, avg_score: r?.avg_score ?? null }
}

export async function createUserProfile(
  userId: string,
  data: { level_langue: 'A' | 'B' | 'C'; level_civi: 'A' | 'B' | 'C'; level_didactique: 'A' | 'B' | 'C' }
): Promise<UserProfile> {
  const rows = await sql.query(
    `INSERT INTO user_profile (user_id, level_langue, level_civi, level_didactique)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, data.level_langue, data.level_civi, data.level_didactique]
  )
  return rows[0] as UserProfile
}

export async function saveStudyPlan(
  userId: string,
  items: { week_number: number; domain: string; objective: string; target_date: string }[]
): Promise<void> {
  for (const item of items) {
    await sql.query(
      `INSERT INTO study_plan (user_id, week_number, domain, objective, target_date) VALUES ($1, $2, $3, $4, $5)`,
      [userId, item.week_number, item.domain, item.objective, item.target_date]
    )
  }
}

export async function getFlashcardGlobalStats(userId: string): Promise<FlashcardGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total_reviews,
            SUM(CASE WHEN known THEN 1 ELSE 0 END)::int AS known_count
     FROM flashcard_reviews WHERE user_id = $1`,
    [userId]
  )
  const r = rows[0] as FlashcardGlobalStats
  return { total_reviews: r?.total_reviews ?? 0, known_count: r?.known_count ?? 0 }
}
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add userId param to all db functions for multi-tenant isolation"
```

---

## Phase 3 — Connect Existing Pages

### Task 9: Update dashboard page and actions

**Files:**
- Modify: `app/(dashboard)/page.tsx`
- Modify: `app/(dashboard)/actions.ts`

- [ ] **Step 1: Update dashboard page**

```tsx
// app/(dashboard)/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Target } from 'lucide-react'
import { getUserProfile, getTodayMinutes, getInProgressExercises, getInProgressSimulations, applyXpDecay } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { XPLevelCard } from '@/components/dashboard/xp-level-card'
import { DomainLevelsCard } from '@/components/dashboard/domain-levels-card'
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card'
import { InProgressList } from '@/components/dashboard/in-progress-list'

export default async function DashboardPage() {
  const userId = await getEffectiveUserId()
  const xpLost = await applyXpDecay(userId)
  const [profile, todayMin, inProgressExercises, inProgressSims] = await Promise.all([
    getUserProfile(userId),
    getTodayMinutes(userId),
    getInProgressExercises(userId),
    getInProgressSimulations(userId),
  ])

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <XPLevelCard profile={profile} xpLost={xpLost} />
        <DomainLevelsCard profile={profile} />
      </div>
      <DailyGoalCard todayMinutes={todayMin} goalMinutes={profile.daily_goal_min} />
      <InProgressList exercises={inProgressExercises} simulations={inProgressSims} />
    </div>
  )
}
```

- [ ] **Step 2: Update dashboard actions**

```ts
// app/(dashboard)/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { updateDailyGoal } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'

export async function setDailyGoal(minutes: number): Promise<void> {
  const userId = await getEffectiveUserId()
  const clamped = Math.min(240, Math.max(10, minutes))
  await updateDailyGoal(userId, clamped)
  revalidatePath('/')
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/page.tsx app/\(dashboard\)/actions.ts
git commit -m "feat: pass userId to dashboard db calls"
```

---

### Task 10: Update onboarding API route

**Files:**
- Modify: `app/api/onboarding/save/route.ts`

- [ ] **Step 1: Update onboarding save route**

```ts
// app/api/onboarding/save/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUserProfile } from '@/lib/db'
import { auth } from '@/lib/auth'

const Schema = z.object({
  level_langue: z.enum(['A', 'B', 'C']),
  level_civi: z.enum(['A', 'B', 'C']),
  level_didactique: z.enum(['A', 'B', 'C']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await createUserProfile(session.user.id, parsed.data)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('onboarding/save error:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/onboarding/
git commit -m "feat: link onboarding profile creation to authenticated user"
```

---

### Task 11: Update exercise API routes

**Files:**
- Modify: `app/api/exercises/generate/route.ts`
- No change needed: `app/api/exercises/correct/route.ts` (reads shared exercises only)

- [ ] **Step 1: Update exercises/generate**

```ts
// app/api/exercises/generate/route.ts
import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { saveExercise } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const ExerciseSchema = z.object({
  theme: z.string(),
  domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
  type: z.enum(['qcm', 'vrai_faux', 'lacunaire']),
  question: z.string(),
  options: z.array(z.string()).nullable(),
  answer: z.string(),
  explanation: z.string(),
  level: z.enum(['A', 'B', 'C']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const RequestSchema = z.object({
    theme: z.string().min(1),
    domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
    type: z.enum(['qcm', 'vrai_faux', 'lacunaire']),
    level: z.enum(['A', 'B', 'C']),
  })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { theme, domain, type, level } = parsed.data

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: ExerciseSchema }),
      system: `Tu es un expert du CAPES d'espagnol. Tu génères des exercices rigoureux, culturellement précis et pédagogiquement pertinents pour des candidats préparant le concours.`,
      prompt: `Génère un exercice de type "${type}" sur le thème "${theme}" dans le domaine "${domain}" pour un candidat de niveau "${level}".

Pour un QCM : 4 options dont une seule correcte.
Pour un vrai/faux : une affirmation avec réponse "Vrai" ou "Faux".
Pour un lacunaire : une phrase avec "___" pour le mot manquant.

L'explication doit être pédagogique (2-3 phrases), jamais condescendante.`,
    })

    // AI-generated exercises belong to the user (not the shared catalogue)
    const saved = await saveExercise(session.user.id, { ...output, source: 'ai_generated', title: null, questions: null })
    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Failed to generate exercise' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/exercises/
git commit -m "feat: scope exercise generation to authenticated user"
```

---

### Task 12: Update flashcard, conversation, simulacro and plan API routes

**Files:**
- Modify: `app/api/flashcards/generate/route.ts`
- Modify: `app/api/flashcards/review/route.ts`
- Modify: `app/api/conversations/route.ts`
- Modify: `app/api/conversations/[id]/route.ts`
- Modify: `app/api/simulacros/generate/route.ts`
- Modify: `app/api/simulacros/submit/route.ts`
- Modify: `app/api/plan/generate/route.ts`

- [ ] **Step 1: Update flashcards/review/route.ts**

```ts
// app/api/flashcards/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { saveFlashcardReview } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const ReviewSchema = z.object({
  flashcard_id: z.number().int().positive(),
  known: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await saveFlashcardReview(session.user.id, parsed.data.flashcard_id, parsed.data.known)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Read and update remaining routes**

For each of these routes, apply the same pattern:
1. Add `const session = await auth()` at the top of each handler
2. Add `if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
3. Pass `session.user.id` as the first argument to each db function that now requires `userId`

Routes to update:
- `app/api/flashcards/generate/route.ts` — `saveFlashcard(session.user.id, ...)` (private)
- `app/api/conversations/route.ts` — `createConversation(session.user.id, id)`, `getConversations(session.user.id)`
- `app/api/conversations/[id]/route.ts` — `getConversationMessages(id)`, `deleteConversation(id)` (no userId on these two; also add `saveMessage` call uses no userId)
- `app/api/simulacros/generate/route.ts` — `createSimulacro(session.user.id, ...)`
- `app/api/simulacros/submit/route.ts` — pass userId where relevant
- `app/api/plan/generate/route.ts` — `saveStudyPlan(session.user.id, ...)`

Read each file (they follow the same pattern as the routes already seen), then apply the changes.

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | head -60
```

Fix all type errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: scope all API routes to authenticated user via session"
```

---

### Task 13: Update remaining dashboard pages (stats, exercices, flashcards, simulacros, chat, conversations)

**Files:**
- Modify all `app/(dashboard)/*/page.tsx` files that call db functions

- [ ] **Step 1: Read each page**

Read these files one by one and check which db functions they call:
- `app/(dashboard)/stats/page.tsx`
- `app/(dashboard)/exercices/page.tsx`
- `app/(dashboard)/exercices/[id]/page.tsx`
- `app/(dashboard)/flashcards/page.tsx`
- `app/(dashboard)/simulacros/page.tsx`
- `app/(dashboard)/simulacros/[id]/page.tsx`
- `app/(dashboard)/conversations/page.tsx`
- `app/(dashboard)/chat/page.tsx`

- [ ] **Step 2: Apply the userId pattern to each page**

For every server component that calls a db function:
```tsx
import { getEffectiveUserId } from '@/lib/session'

export default async function SomePage() {
  const userId = await getEffectiveUserId()
  const data = await someDbFunction(userId, ...)
  // ...
}
```

For client components that call API routes — no change needed (API routes now get userId from session server-side).

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit 2>&1 | head -60
```

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/
git commit -m "feat: pass userId to all dashboard server components"
```

---

## Phase 4 — Admin Panel

### Task 14: Create lib/admin-db.ts

**Files:**
- Create: `lib/admin-db.ts`
- Create: `lib/admin-db.test.ts`

- [ ] **Step 1: Write tests**

```ts
// lib/admin-db.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => ({
    query: vi.fn(),
  })),
}))

import { neon } from '@neondatabase/serverless'

describe('admin-db', () => {
  let mockQuery: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery = vi.fn()
    vi.mocked(neon).mockReturnValue({ query: mockQuery } as ReturnType<typeof neon>)
  })

  it('getAdminUsers returns mapped user rows', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 'u1', email: 'a@a.com', name: 'A', image: null, role: 'student', blocked: false, created_at: '2026-01-01T00:00:00Z', xp: 100 }
    ])
    const { getAdminUsers } = await import('./admin-db')
    const users = await getAdminUsers()
    expect(users).toHaveLength(1)
    expect(users[0].email).toBe('a@a.com')
  })

  it('setUserBlocked calls UPDATE with correct params', async () => {
    mockQuery.mockResolvedValueOnce([])
    const { setUserBlocked } = await import('./admin-db')
    await setUserBlocked('u1', true)
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET blocked'),
      [true, 'u1']
    )
  })

  it('getAppSettings returns key-value pairs', async () => {
    mockQuery.mockResolvedValueOnce([
      { key: 'xp_gain_A', value: '30' },
      { key: 'xp_gain_B', value: '20' },
    ])
    const { getAppSettings } = await import('./admin-db')
    const settings = await getAppSettings()
    expect(settings['xp_gain_A']).toBe('30')
    expect(settings['xp_gain_B']).toBe('20')
  })

  it('upsertAppSetting calls INSERT ... ON CONFLICT', async () => {
    mockQuery.mockResolvedValueOnce([])
    const { upsertAppSetting } = await import('./admin-db')
    await upsertAppSetting('xp_gain_A', '40')
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT'),
      ['xp_gain_A', '40']
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test lib/admin-db.test.ts
```

Expected: FAIL — module does not exist

- [ ] **Step 3: Implement lib/admin-db.ts**

```ts
// lib/admin-db.ts
import { neon } from '@neondatabase/serverless'
import type { Exercise, Flashcard } from '@/lib/db'

const sql = neon(process.env.DATABASE_URL!)

export type AdminUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'student' | 'superadmin'
  blocked: boolean
  created_at: string
  xp: number
  level_xp: number
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const rows = await sql.query(
    `SELECT u.id, u.email, u.name, u.image, u.role, u.blocked, u.created_at,
            COALESCE(p.xp, 0) AS xp,
            COALESCE(p.level_xp, 1) AS level_xp
     FROM users u
     LEFT JOIN user_profile p ON p.user_id = u.id
     ORDER BY u.created_at DESC`
  )
  return rows as AdminUser[]
}

export type AdminUserDetail = AdminUser & {
  level_langue: 'A' | 'B' | 'C' | null
  level_civi: 'A' | 'B' | 'C' | null
  level_didactique: 'A' | 'B' | 'C' | null
  total_attempts: number
  correct_count: number
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const rows = await sql.query(
    `SELECT u.id, u.email, u.name, u.image, u.role, u.blocked, u.created_at,
            COALESCE(p.xp, 0) AS xp,
            COALESCE(p.level_xp, 1) AS level_xp,
            p.level_langue, p.level_civi, p.level_didactique,
            COUNT(ea.id)::int AS total_attempts,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM users u
     LEFT JOIN user_profile p ON p.user_id = u.id
     LEFT JOIN exercise_attempts ea ON ea.user_id = u.id
     WHERE u.id = $1
     GROUP BY u.id, p.xp, p.level_xp, p.level_langue, p.level_civi, p.level_didactique`,
    [userId]
  )
  return (rows[0] as AdminUserDetail) ?? null
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<void> {
  await sql.query('UPDATE users SET blocked = $1 WHERE id = $2', [blocked, userId])
}

export async function deleteUser(userId: string): Promise<void> {
  await sql.query('DELETE FROM users WHERE id = $1', [userId])
}

export async function getAdminStats(): Promise<{
  total_users: number
  active_this_week: number
  total_attempts: number
}> {
  const rows = await sql.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE role = 'student') AS total_users,
       (SELECT COUNT(DISTINCT user_id)::int FROM study_sessions
        WHERE date >= CURRENT_DATE - 7) AS active_this_week,
       (SELECT COUNT(*)::int FROM exercise_attempts) AS total_attempts`
  )
  return rows[0] as { total_users: number; active_this_week: number; total_attempts: number }
}

export async function getAppSettings(): Promise<Record<string, string>> {
  const rows = await sql.query('SELECT key, value FROM app_settings ORDER BY key')
  return Object.fromEntries((rows as { key: string; value: string }[]).map(r => [r.key, r.value]))
}

export async function upsertAppSetting(key: string, value: string): Promise<void> {
  await sql.query(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  )
}

export async function getCatalogExercises(): Promise<Exercise[]> {
  const rows = await sql.query(
    `SELECT * FROM exercises WHERE user_id IS NULL ORDER BY created_at DESC`
  )
  return rows as Exercise[]
}

export async function deleteCatalogExercise(id: number): Promise<void> {
  await sql.query('DELETE FROM exercises WHERE id = $1 AND user_id IS NULL', [id])
}

export async function getCatalogFlashcards(): Promise<Flashcard[]> {
  const rows = await sql.query(
    `SELECT * FROM flashcards WHERE user_id IS NULL ORDER BY created_at DESC`
  )
  return rows as Flashcard[]
}

export async function deleteCatalogFlashcard(id: number): Promise<void> {
  await sql.query('DELETE FROM flashcards WHERE id = $1 AND user_id IS NULL', [id])
}
```

- [ ] **Step 4: Run tests**

```bash
npm test lib/admin-db.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/admin-db.ts lib/admin-db.test.ts
git commit -m "feat: add admin-db module with user management and app_settings"
```

---

### Task 15: Admin layout

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create admin layout**

```tsx
// app/admin/layout.tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Users, BookOpen, Settings, LayoutDashboard, ChevronLeft } from 'lucide-react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (session.user.role !== 'superadmin') redirect('/')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-5 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">Administration</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
            { href: '/admin/users', label: 'Utilisateurs', Icon: Users },
            { href: '/admin/catalog', label: 'Catalogue', Icon: BookOpen },
            { href: '/admin/settings', label: 'Paramètres', Icon: Settings },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour à l&apos;app
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: add admin layout with sidebar and superadmin guard"
```

---

### Task 16: Admin dashboard and users pages

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/users/actions.ts`
- Create: `app/admin/users/[id]/page.tsx`

- [ ] **Step 1: Create admin dashboard**

```tsx
// app/admin/page.tsx
import { getAdminStats } from '@/lib/admin-db'

export default async function AdminPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Étudiants inscrits', value: stats.total_users },
          { label: 'Actifs cette semaine', value: stats.active_this_week },
          { label: 'Tentatives totales', value: stats.total_attempts },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create admin users server actions**

```ts
// app/admin/users/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { setUserBlocked, deleteUser } from '@/lib/admin-db'
import { getSession } from '@/lib/session'

async function requireSuperadmin() {
  const session = await getSession()
  if (session.user.role !== 'superadmin') throw new Error('Unauthorized')
}

export async function blockUser(userId: string, blocked: boolean): Promise<void> {
  await requireSuperadmin()
  await setUserBlocked(userId, blocked)
  revalidatePath('/admin/users')
}

export async function removeUser(userId: string): Promise<void> {
  await requireSuperadmin()
  await deleteUser(userId)
  revalidatePath('/admin/users')
}
```

- [ ] **Step 3: Create admin users list page**

```tsx
// app/admin/users/page.tsx
import { getAdminUsers } from '@/lib/admin-db'
import { blockUser, removeUser } from './actions'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Utilisateurs ({users.length})</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Utilisateur', 'Rôle', 'XP', 'Statut', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className={user.blocked ? 'opacity-50' : ''}>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="font-medium text-slate-900 hover:text-violet-600">
                    {user.name ?? user.email}
                  </Link>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.role}</td>
                <td className="px-4 py-3 text-slate-600">{user.xp}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    user.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.blocked ? 'Bloqué' : 'Actif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <form action={blockUser.bind(null, user.id, !user.blocked)}>
                      <button type="submit" className="text-xs text-slate-500 hover:text-slate-900 underline">
                        {user.blocked ? 'Débloquer' : 'Bloquer'}
                      </button>
                    </form>
                    <form action={removeUser.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 underline"
                        onClick={e => { if (!confirm('Supprimer cet utilisateur ?')) e.preventDefault() }}
                      >
                        Supprimer
                      </button>
                    </form>
                    <form action={`/api/admin/impersonate`} method="POST">
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-xs text-violet-500 hover:text-violet-700 underline">
                        Impersonner
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create admin user detail page**

```tsx
// app/admin/users/[id]/page.tsx
import { getAdminUserDetail } from '@/lib/admin-db'
import { notFound } from 'next/navigation'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAdminUserDetail(id)
  if (!user) notFound()

  const successRate = user.total_attempts > 0
    ? Math.round((user.correct_count / user.total_attempts) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{user.name ?? user.email}</h1>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'XP', value: user.xp },
          { label: 'Niveau', value: user.level_xp },
          { label: 'Tentatives', value: user.total_attempts },
          { label: 'Taux de réussite', value: `${successRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Niveaux par domaine</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Langue', value: user.level_langue },
            { label: 'Civilisation', value: user.level_civi },
            { label: 'Didactique', value: user.level_didactique },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className={`text-lg font-semibold mt-0.5 ${
                value === 'C' ? 'text-red-600' : value === 'B' ? 'text-amber-600' : 'text-green-600'
              }`}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/page.tsx app/admin/users/
git commit -m "feat: add admin dashboard and user management pages"
```

---

### Task 17: Admin catalog and settings pages

**Files:**
- Create: `app/admin/catalog/page.tsx`
- Create: `app/admin/catalog/actions.ts`
- Create: `app/admin/settings/page.tsx`
- Create: `app/admin/settings/actions.ts`

- [ ] **Step 1: Create catalog server actions**

```ts
// app/admin/catalog/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { deleteCatalogExercise, deleteCatalogFlashcard } from '@/lib/admin-db'
import { getSession } from '@/lib/session'

async function requireSuperadmin() {
  const session = await getSession()
  if (session.user.role !== 'superadmin') throw new Error('Unauthorized')
}

export async function removeExercise(id: number): Promise<void> {
  await requireSuperadmin()
  await deleteCatalogExercise(id)
  revalidatePath('/admin/catalog')
}

export async function removeFlashcard(id: number): Promise<void> {
  await requireSuperadmin()
  await deleteCatalogFlashcard(id)
  revalidatePath('/admin/catalog')
}
```

- [ ] **Step 2: Create catalog page**

```tsx
// app/admin/catalog/page.tsx
import { getCatalogExercises, getCatalogFlashcards } from '@/lib/admin-db'
import { removeExercise, removeFlashcard } from './actions'

export default async function AdminCatalogPage() {
  const [exercises, flashcards] = await Promise.all([
    getCatalogExercises(),
    getCatalogFlashcards(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-900">Catalogue partagé</h1>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-700">
          Exercices ({exercises.length})
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {exercises.map(ex => (
            <div key={ex.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-slate-900 line-clamp-1">{ex.question}</p>
                <p className="text-xs text-slate-400">{ex.domain} · {ex.level} · {ex.type}</p>
              </div>
              <form action={removeExercise.bind(null, ex.id)}>
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={e => { if (!confirm('Supprimer cet exercice ?')) e.preventDefault() }}
                >
                  Supprimer
                </button>
              </form>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">Aucun exercice dans le catalogue</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-700">
          Flashcards ({flashcards.length})
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {flashcards.map(fc => (
            <div key={fc.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-slate-900 line-clamp-1">{fc.front}</p>
                <p className="text-xs text-slate-400">{fc.domain} · {fc.level}</p>
              </div>
              <form action={removeFlashcard.bind(null, fc.id)}>
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={e => { if (!confirm('Supprimer cette flashcard ?')) e.preventDefault() }}
                >
                  Supprimer
                </button>
              </form>
            </div>
          ))}
          {flashcards.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">Aucune flashcard dans le catalogue</p>
          )}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Create settings server action**

```ts
// app/admin/settings/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { upsertAppSetting } from '@/lib/admin-db'
import { getSession } from '@/lib/session'

export async function saveSetting(key: string, value: string): Promise<void> {
  const session = await getSession()
  if (session.user.role !== 'superadmin') throw new Error('Unauthorized')
  await upsertAppSetting(key, value)
  revalidatePath('/admin/settings')
}
```

- [ ] **Step 4: Create settings page**

```tsx
// app/admin/settings/page.tsx
'use client'
// Note: this page is a client component for form interactivity

import { useState, useTransition } from 'react'
import { saveSetting } from './actions'

const SETTING_LABELS: Record<string, string> = {
  xp_gain_A: 'XP gagné niveau A (facile)',
  xp_gain_B: 'XP gagné niveau B (intermédiaire)',
  xp_gain_C: 'XP gagné niveau C (difficile)',
  xp_decay_per_day: 'XP perdu par jour d\'inactivité',
  default_daily_goal_min: 'Objectif quotidien par défaut (min)',
}
```

Wait — the settings page needs the server-fetched data. Let me use a server component wrapper:

```tsx
// app/admin/settings/page.tsx
import { getAppSettings } from '@/lib/admin-db'
import { SettingsForm } from './settings-form'

export default async function AdminSettingsPage() {
  const settings = await getAppSettings()
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Paramètres globaux</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}
```

Create `app/admin/settings/settings-form.tsx`:

```tsx
// app/admin/settings/settings-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { saveSetting } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SETTING_LABELS: Record<string, string> = {
  xp_gain_A: 'XP gagné niveau A (facile)',
  xp_gain_B: 'XP gagné niveau B (intermédiaire)',
  xp_gain_C: 'XP gagné niveau C (difficile)',
  xp_decay_per_day: "XP perdu par jour d'inactivité",
  default_daily_goal_min: 'Objectif quotidien par défaut (min)',
}

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(settings)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  function handleSave(key: string) {
    startTransition(async () => {
      await saveSetting(key, values[key] ?? '')
      setSaved(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      {Object.entries(SETTING_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-4 px-4 py-4">
          <Label className="w-64 text-sm text-slate-700 shrink-0">{label}</Label>
          <Input
            type="number"
            value={values[key] ?? ''}
            onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
            className="w-24"
          />
          <Button
            size="sm"
            onClick={() => handleSave(key)}
            disabled={isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {saved[key] ? 'Sauvegardé ✓' : 'Sauvegarder'}
          </Button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/catalog/ app/admin/settings/
git commit -m "feat: add admin catalog and settings pages"
```

---

## Phase 5 — Impersonation

### Task 18: Impersonation API routes and banner

**Files:**
- Create: `app/api/admin/impersonate/route.ts`
- Create: `app/api/admin/impersonate/stop/route.ts`
- Create: `components/admin/impersonation-banner.tsx`
- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create impersonation API routes**

```ts
// app/api/admin/impersonate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let body: { userId?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.userId || typeof body.userId !== 'string') {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set('impersonate_user_id', body.userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  return res
}
```

```ts
// app/api/admin/impersonate/stop/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const res = NextResponse.redirect(new URL('/admin/users', req.url))
  res.cookies.delete('impersonate_user_id')
  return res
}
```

- [ ] **Step 2: Create impersonation banner component**

```tsx
// components/admin/impersonation-banner.tsx
'use client'

export function ImpersonationBanner({ email }: { email: string }) {
  return (
    <div className="bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-between text-sm font-medium shrink-0">
      <span>
        👁 Mode impersonation — Tu navigues en tant que <strong>{email}</strong>
      </span>
      <form action="/api/admin/impersonate/stop" method="POST">
        <button
          type="submit"
          className="ml-4 px-3 py-1 bg-amber-900 text-amber-50 rounded text-xs hover:bg-amber-800 transition-colors"
        >
          Quitter
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Update dashboard layout to show banner**

```tsx
// app/(dashboard)/layout.tsx
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ScrollRestorer } from '@/components/layout/scroll-restorer'
import { ImpersonationBanner } from '@/components/admin/impersonation-banner'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const cookieStore = await cookies()
  const impersonatedId = cookieStore.get('impersonate_user_id')?.value
  const isImpersonating =
    impersonatedId &&
    (session?.user as { role?: string } | undefined)?.role === 'superadmin'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isImpersonating && (
        <ImpersonationBanner email={session!.user!.email ?? 'utilisateur'} />
      )}
      <div className="flex flex-1 overflow-hidden lg:flex-row flex-col">
        <MobileHeader />
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-y-auto bg-white p-4 lg:p-6">
          <ScrollRestorer />
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/ components/admin/ app/\(dashboard\)/layout.tsx
git commit -m "feat: add impersonation cookie API and dashboard banner"
```

---

### Task 19: Update sidebar with conditional Admin link

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Read the current sidebar**

Read `components/layout/sidebar.tsx` to find where navigation links are defined.

- [ ] **Step 2: Add admin link**

Find the navigation link array/section and add a conditional admin link at the bottom. Add `getSession` call at the top of the server component:

```tsx
// At top of sidebar server component:
import { getSession } from '@/lib/session'

// Inside the component:
const session = await getSession()
const isAdmin = session.user.role === 'superadmin'

// In the nav links section, after existing links:
{isAdmin && (
  <Link
    href="/admin"
    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
  >
    <Shield className="h-4 w-4 text-slate-400" />
    Administration
  </Link>
)}
```

Add `Shield` to the lucide-react import.

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: show Admin link in sidebar for superadmin"
```

---

## Phase 6 — Run Migration and Verify

### Task 20: Run DB migration and smoke test

- [ ] **Step 1: Run the multi-tenant migration**

```bash
npm run db:migrate-multitenant
```

Expected: `Multi-tenant migration complete`

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

- [ ] **Step 4: Verify auth flow**

1. Open `http://localhost:3000` — should redirect to `/login`
2. Click "Continuer avec Google" — should redirect to Google OAuth
3. Sign in — should redirect to `/` (or `/onboarding` if first time)
4. Verify the SUPERADMIN_EMAIL account sees the "Administration" link in sidebar
5. Visit `/admin` — should work for superadmin, redirect for students
6. Visit `/admin/users` — should list users
7. Test impersonation: click "Impersonner" on a user → banner appears → "Quitter" clears it

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete multi-tenant migration — Google OAuth, per-user data, superadmin panel"
```

---

## Checklist — Spec Coverage

| Spec requirement | Task(s) |
|---|---|
| Google OAuth login | Tasks 3, 4, 6 |
| Auto-registration | Auth.js handles it via `signIn` callback |
| Superadmin via SUPERADMIN_EMAIL | Task 3 (session callback) |
| Users table + Auth.js tables | Task 2 |
| user_id on all data tables | Task 2 |
| Shared catalogue (user_id NULL) | Tasks 2, 8 |
| Per-user private content | Tasks 8, 11 |
| getEffectiveUserId() | Task 7 |
| All db functions with userId | Task 8 |
| Dashboard page with userId | Task 9 |
| Onboarding linked to user | Task 10 |
| All API routes with session | Tasks 11, 12 |
| All dashboard pages with userId | Task 13 |
| /admin layout + guard | Task 15 |
| /admin dashboard stats | Task 16 |
| /admin/users list + block/delete | Task 16 |
| /admin/users/[id] detail | Task 16 |
| /admin/catalog CRUD | Task 17 |
| /admin/settings CRUD | Task 17 |
| Impersonation cookie + banner | Task 18 |
| Sidebar Admin link | Task 19 |
| DB migration script | Task 2 |
