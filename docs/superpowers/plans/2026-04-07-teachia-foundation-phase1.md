# teachIA — Foundation + Phase 1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working MVP of teachIA — project setup, auth, layout, exercises tipos test (QCM/vrai-faux/lacunaire), and the Professeur IA streaming chat.

**Architecture:** Next.js 16 App Router, single-user auth via password + signed JWT cookie (`proxy.ts`), Neon Postgres for exercises and attempt history, Vercel AI SDK v6 with AI Gateway for all AI features. No user management. Phases 2–4 (plan de révision, flashcards, simulacros) have separate plans.

**Tech Stack:** Next.js 16, shadcn/ui, Tailwind CSS, Geist, `@neondatabase/serverless`, Vercel AI SDK v6 (`ai`, `@ai-sdk/react`), AI Elements, `jose` (JWT), Vitest, Lucide React

---

## File Map

```
teachIA/
├── app/
│   ├── (auth)/login/page.tsx           # Login form (Server Component + Server Action)
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + main wrapper
│   │   ├── page.tsx                    # Dashboard home (placeholder for Phase 2)
│   │   ├── chat/page.tsx               # Professeur IA interface
│   │   └── exercices/
│   │       ├── page.tsx                # Exercise list + filters
│   │       └── [id]/page.tsx           # Single exercise + feedback
│   └── api/
│       ├── chat/route.ts               # POST — streaming AI chat
│       ├── exercises/generate/route.ts # POST — generate exercise via AI
│       └── exercises/correct/route.ts  # POST — get AI explanation for wrong answer
├── components/
│   ├── ui/                             # shadcn components (Button, Card, Badge, etc.)
│   ├── layout/
│   │   └── sidebar.tsx                 # Nav sidebar (dark zinc-900)
│   ├── exercises/
│   │   ├── exercise-qcm.tsx            # QCM variant
│   │   ├── exercise-vrai-faux.tsx      # Vrai/Faux variant
│   │   ├── exercise-lacunaire.tsx      # Texte lacunaire variant
│   │   └── exercise-feedback.tsx       # Post-attempt feedback + explanation
│   └── chat/
│       └── chat-interface.tsx          # useChat wrapper + AI Elements
├── lib/
│   ├── db.ts                           # Neon client + typed query helpers
│   ├── auth.ts                         # createSession / validateSession (jose JWT)
│   └── constants.ts                    # Domains, levels, exercise types
├── scripts/
│   └── seed-exercises.ts               # Seed initial curated exercises to Neon
├── proxy.ts                            # Auth guard (runs on every request)
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Init Next.js project**

```bash
cd /Users/victorrubia/teachIA
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install \
  ai @ai-sdk/react \
  @neondatabase/serverless \
  jose \
  lucide-react \
  recharts \
  @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  tailwind-merge \
  next-themes

npm install --save-dev \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  @types/node
```

- [ ] **Step 3: Init shadcn/ui**

```bash
npx shadcn@latest init
```

Select: Dark style, zinc base color, CSS variables: yes.

Then add core components:

```bash
npx shadcn@latest add button card badge input label progress tabs dialog sheet separator skeleton tooltip
```

- [ ] **Step 4: Install Geist font**

```bash
npm install geist
```

Update `app/layout.tsx`:

```tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create `.env.local.example`**

```bash
# Neon Postgres
DATABASE_URL=postgresql://...

# Auth
APP_PASSWORD=your_password_here
AUTH_SECRET=your_32_char_secret_here

# Vercel AI Gateway (provisioned via: vercel env pull)
# VERCEL_OIDC_TOKEN is auto-injected — do not add manually
```

- [ ] **Step 7: Create `lib/constants.ts`**

```ts
export const DOMAINS = ['langue', 'civi_espagne', 'civi_latam', 'didactique'] as const
export type Domain = typeof DOMAINS[number]

export const LEVELS = ['A', 'B', 'C'] as const
export type Level = typeof LEVELS[number]

export const EXERCISE_TYPES = ['qcm', 'vrai_faux', 'lacunaire', 'chronologie', 'association'] as const
export type ExerciseType = typeof EXERCISE_TYPES[number]
```

- [ ] **Step 8: Verify the app starts**

```bash
npm run dev
```

Expected: Next.js dev server on `http://localhost:3000` with no errors.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 16 project with shadcn/ui and Vitest"
```

---

## Task 2: Database Setup

**Files:**
- Create: `lib/db.ts`
- Create: `scripts/migrate.sql`
- Test: `lib/db.test.ts`

- [ ] **Step 1: Set up Neon project**

1. Go to [neon.tech](https://neon.tech), create a project named `teachia`
2. Copy the connection string
3. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:pass@host/teachia?sslmode=require
   ```

- [ ] **Step 2: Create `scripts/migrate.sql`**

```sql
CREATE TABLE IF NOT EXISTS user_profile (
  id SERIAL PRIMARY KEY,
  exam_date DATE NOT NULL,
  level_langue TEXT CHECK (level_langue IN ('A','B','C')),
  level_civi TEXT CHECK (level_civi IN ('A','B','C')),
  level_didactique TEXT CHECK (level_didactique IN ('A','B','C')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  theme TEXT NOT NULL,
  domain TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('qcm','vrai_faux','lacunaire','chronologie','association')),
  question TEXT NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A','B','C')),
  source TEXT NOT NULL DEFAULT 'curated',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_domain ON exercises(domain);
CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
CREATE INDEX IF NOT EXISTS idx_attempts_timestamp ON exercise_attempts(timestamp);
```

- [ ] **Step 3: Run migration**

```bash
npx dotenv -e .env.local -- node -e "
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const sql = neon(process.env.DATABASE_URL);
const migration = fs.readFileSync('./scripts/migrate.sql', 'utf8');
sql.transaction([sql(migration)]).then(() => console.log('Migration complete')).catch(console.error);
"
```

Expected output: `Migration complete`

- [ ] **Step 4: Create `lib/db.ts`**

```ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export type Exercise = {
  id: number
  theme: string
  domain: string
  type: 'qcm' | 'vrai_faux' | 'lacunaire' | 'chronologie' | 'association'
  question: string
  options: string[] | null
  answer: string
  explanation: string
  level: 'A' | 'B' | 'C'
  source: string
  created_at: string
}

export type ExerciseAttempt = {
  id: number
  exercise_id: number
  correct: boolean
  time_spent: number | null
  timestamp: string
}

export async function getExercises(filters: {
  domain?: string
  level?: string
  type?: string
  limit?: number
} = {}): Promise<Exercise[]> {
  const { domain, level, type, limit = 20 } = filters
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }
  if (type) { conditions.push(`type = $${i++}`); params.push(type) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = await sql(
    `SELECT * FROM exercises ${where} ORDER BY RANDOM() LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Exercise[]
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const rows = await sql('SELECT * FROM exercises WHERE id = $1', [id])
  return (rows[0] as Exercise) ?? null
}

export async function saveAttempt(attempt: Omit<ExerciseAttempt, 'id' | 'timestamp'>): Promise<void> {
  await sql(
    'INSERT INTO exercise_attempts (exercise_id, correct, time_spent) VALUES ($1, $2, $3)',
    [attempt.exercise_id, attempt.correct, attempt.time_spent]
  )
}

export async function saveExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
  const rows = await sql(
    `INSERT INTO exercises (theme, domain, type, question, options, answer, explanation, level, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [exercise.theme, exercise.domain, exercise.type, exercise.question,
     JSON.stringify(exercise.options), exercise.answer, exercise.explanation,
     exercise.level, exercise.source]
  )
  return rows[0] as Exercise
}
```

- [ ] **Step 5: Write tests for `lib/db.ts`**

Create `lib/db.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock neon before importing db
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn()),
}))

describe('db helpers', () => {
  it('getExercises builds query without filters', async () => {
    const { neon } = await import('@neondatabase/serverless')
    const mockSql = vi.fn().mockResolvedValue([])
    vi.mocked(neon).mockReturnValue(mockSql as any)

    const { getExercises } = await import('./db')
    await getExercises()

    expect(mockSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM exercises'),
      expect.any(Array)
    )
  })

  it('getExerciseById queries by id', async () => {
    const { neon } = await import('@neondatabase/serverless')
    const mockExercise = { id: 1, question: 'Test?', answer: 'A' }
    const mockSql = vi.fn().mockResolvedValue([mockExercise])
    vi.mocked(neon).mockReturnValue(mockSql as any)

    const { getExerciseById } = await import('./db')
    const result = await getExerciseById(1)

    expect(result).toEqual(mockExercise)
    expect(mockSql).toHaveBeenCalledWith(
      'SELECT * FROM exercises WHERE id = $1',
      [1]
    )
  })
})
```

- [ ] **Step 6: Run tests**

```bash
npm test lib/db.test.ts
```

Expected: 2 passing tests

- [ ] **Step 7: Commit**

```bash
git add lib/db.ts lib/db.test.ts scripts/migrate.sql lib/constants.ts
git commit -m "feat: add Neon DB schema and typed query helpers"
```

---

## Task 3: Auth (proxy.ts + login page)

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/auth.test.ts`
- Create: `proxy.ts`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Write failing tests for `lib/auth.ts`**

Create `lib/auth.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createSession, validateSession } from './auth'

// auth.ts uses jose JWT with a secret from env
process.env.AUTH_SECRET = 'test-secret-32-characters-minimum!!'

describe('auth helpers', () => {
  it('createSession returns a JWT string', async () => {
    const token = await createSession()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
  })

  it('validateSession returns true for a valid token', async () => {
    const token = await createSession()
    const valid = await validateSession(token)
    expect(valid).toBe(true)
  })

  it('validateSession returns false for a garbage string', async () => {
    const valid = await validateSession('not-a-jwt')
    expect(valid).toBe(false)
  })

  it('validateSession returns false for empty string', async () => {
    const valid = await validateSession('')
    expect(valid).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test lib/auth.test.ts
```

Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 3: Create `lib/auth.ts`**

```ts
import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function createSession(): Promise<string> {
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test lib/auth.test.ts
```

Expected: 4 passing tests

- [ ] **Step 5: Create `proxy.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './lib/auth'

const PUBLIC_PATHS = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('auth_session')
  const valid = sessionCookie ? await validateSession(sessionCookie.value) : false

  if (!valid) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/chat).*)'],
}
```

- [ ] **Step 6: Create `app/(auth)/login/page.tsx`**

```tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession, validateSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

async function login(formData: FormData) {
  'use server'
  const password = formData.get('password') as string

  if (password !== process.env.APP_PASSWORD) {
    redirect('/login?error=1')
  }

  const token = await createSession()
  const cookieStore = await cookies()
  cookieStore.set('auth_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  redirect('/')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams

  // If already authenticated, redirect to dashboard
  const cookieStore = await cookies()
  const session = cookieStore.get('auth_session')
  if (session && await validateSession(session.value)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">teachIA</CardTitle>
          <CardDescription className="text-zinc-400">
            Préparation CAPES d'espagnol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoFocus
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                placeholder="••••••••"
              />
            </div>
            {params.error && (
              <p className="text-sm text-red-400">Mot de passe incorrect.</p>
            )}
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
              Accéder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Verify auth flow works**

```bash
npm run dev
```

1. Visit `http://localhost:3000` — should redirect to `/login`
2. Enter wrong password — should show error message
3. Enter correct `APP_PASSWORD` from `.env.local` — should redirect to `/`

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts proxy.ts app/\(auth\)/
git commit -m "feat: add password auth with JWT cookie and proxy guard"
```

---

## Task 4: Dashboard Layout & Sidebar

**Files:**
- Create: `components/layout/sidebar.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create `components/layout/sidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  CreditCard,
  Target,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Professeur IA', icon: MessageCircle },
  { href: '/exercices', label: 'Exercices', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/simulacros', label: 'Simulacros', icon: Target },
  { href: '/stats', label: 'Statistiques', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="px-4 py-5 border-b border-zinc-800">
        <span className="text-violet-400 font-semibold text-lg tracking-tight">teachIA</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create `app/(dashboard)/layout.tsx`**

```tsx
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(dashboard)/page.tsx`**

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Tableau de bord</h1>
      <p className="text-zinc-400">Bienvenue sur teachIA. Le dashboard complet arrive en Phase 2.</p>
    </div>
  )
}
```

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000` after login. Expected: sidebar visible with all 6 nav links, active state on Dashboard.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/\(dashboard\)/
git commit -m "feat: add dark sidebar layout with nav"
```

---

## Task 5: Exercise Seed Data

**Files:**
- Create: `scripts/seed-exercises.ts`

- [ ] **Step 1: Create `scripts/seed-exercises.ts`**

```ts
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const EXERCISES = [
  // --- LANGUE ---
  {
    theme: 'subjonctif',
    domain: 'langue',
    type: 'qcm',
    question: 'Choisissez la forme correcte : "Quiero que tú ___ aquí."',
    options: ['estás', 'estés', 'estarás', 'estuvieras'],
    answer: 'estés',
    explanation: 'Après "querer que", on utilise le subjonctif présent. La 2e personne du singulier du subjonctif de "estar" est "estés".',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'ser_estar',
    domain: 'langue',
    type: 'qcm',
    question: '"La sopa ___ fría." — ser ou estar ?',
    options: ['es', 'está', 'sea', 'esté'],
    answer: 'está',
    explanation: '"Estar" exprime un état temporaire ou une condition perçue. La soupe n\'est pas froide par nature — elle l\'est dans cette situation précise. On utilise donc "está".',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'por_para',
    domain: 'langue',
    type: 'vrai_faux',
    question: '"Estudio español por trabajar en Madrid" est correct pour exprimer un but.',
    options: ['Vrai', 'Faux'],
    answer: 'Faux',
    explanation: '"Por" exprime la cause, l\'échange ou la durée. Pour exprimer un but, on utilise "para" : "Estudio español para trabajar en Madrid".',
    level: 'B',
    source: 'curated',
  },
  {
    theme: 'preterito_imperfecto',
    domain: 'langue',
    type: 'lacunaire',
    question: 'Cuando era niño, ___ (jugar) todos los días en el parque.',
    options: null,
    answer: 'jugaba',
    explanation: 'L\'imparfait (pretérito imperfecto) s\'utilise pour une action habituelle dans le passé. "Jugar" → "jugaba" (1e personne du singulier).',
    level: 'A',
    source: 'curated',
  },
  // --- CIVILISATION ESPAGNE ---
  {
    theme: 'guerra_civil',
    domain: 'civi_espagne',
    type: 'qcm',
    question: 'La guerre civile espagnole s\'est terminée en :',
    options: ['1936', '1939', '1941', '1945'],
    answer: '1939',
    explanation: 'La guerre civile espagnole a duré du 17 juillet 1936 au 1er avril 1939, date de la victoire de Franco et de la fin de la résistance républicaine.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'siglo_de_oro',
    domain: 'civi_espagne',
    type: 'association',
    question: 'Associez l\'auteur à son œuvre : Cervantes',
    options: ['Don Quijote de la Mancha', 'La Celestina', 'Lazarillo de Tormes', 'Fuenteovejuna'],
    answer: 'Don Quijote de la Mancha',
    explanation: 'Miguel de Cervantes Saavedra (1547-1616) est l\'auteur de "Don Quijote de la Mancha" (1605/1615), considérée comme la première œuvre du roman moderne occidental.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'transicion_democratica',
    domain: 'civi_espagne',
    type: 'chronologie',
    question: 'Remettez ces événements dans l\'ordre chronologique : Mort de Franco | Constitution espagnole | Premières élections libres | Adhésion à la CEE',
    options: ['Mort de Franco (1975)', 'Premières élections libres (1977)', 'Constitution espagnole (1978)', 'Adhésion à la CEE (1986)'],
    answer: 'Mort de Franco (1975)|Premières élections libres (1977)|Constitution espagnole (1978)|Adhésion à la CEE (1986)',
    explanation: 'La Transition démocratique espagnole suit cette séquence clé : mort de Franco (novembre 1975), élections de juin 1977 (premières élections libres depuis 1936), Constitution de décembre 1978, adhésion à la CEE en 1986.',
    level: 'B',
    source: 'curated',
  },
  // --- CIVILISATION AMÉRIQUE LATINE ---
  {
    theme: 'boom_literario',
    domain: 'civi_latam',
    type: 'qcm',
    question: '"Cien años de soledad" est l\'œuvre de :',
    options: ['Jorge Luis Borges', 'Mario Vargas Llosa', 'Gabriel García Márquez', 'Julio Cortázar'],
    answer: 'Gabriel García Márquez',
    explanation: '"Cien años de soledad" (1967) est le roman majeur de Gabriel García Márquez (Colombie), figure centrale du Boom latinoaméricain et prix Nobel de littérature 1982. C\'est l\'œuvre canonique du réalisme magique.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'revolucion_cubana',
    domain: 'civi_latam',
    type: 'vrai_faux',
    question: 'Fidel Castro est arrivé au pouvoir à Cuba en 1959 après avoir renversé le régime de Batista.',
    options: ['Vrai', 'Faux'],
    answer: 'Vrai',
    explanation: 'La révolution cubaine aboutit le 1er janvier 1959 avec la fuite de Fulgencio Batista. Les forces guérilleras de Fidel Castro entrent à La Havane le 8 janvier 1959.',
    level: 'A',
    source: 'curated',
  },
  // --- DIDACTIQUE ---
  {
    theme: 'approche_actionnelle',
    domain: 'didactique',
    type: 'qcm',
    question: 'L\'approche actionnelle, introduite par le CECRL, considère l\'apprenant avant tout comme :',
    options: ['Un récepteur passif de règles grammaticales', 'Un acteur social accomplissant des tâches', 'Un imitateur de locuteurs natifs', 'Un décodeur de textes authentiques'],
    answer: 'Un acteur social accomplissant des tâches',
    explanation: 'Le CECRL (2001) définit l\'approche actionnelle : l\'apprenant est un "acteur social" qui mobilise ses compétences pour accomplir des "tâches" en contexte réel. C\'est une évolution de l\'approche communicative.',
    level: 'B',
    source: 'curated',
  },
]

async function seed() {
  console.log(`Seeding ${EXERCISES.length} exercises...`)

  for (const ex of EXERCISES) {
    await sql(
      `INSERT INTO exercises (theme, domain, type, question, options, answer, explanation, level, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [ex.theme, ex.domain, ex.type, ex.question,
       ex.options ? JSON.stringify(ex.options) : null,
       ex.answer, ex.explanation, ex.level, ex.source]
    )
  }

  console.log('✓ Seed complete')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
```

Add to `package.json` scripts:

```json
"db:seed": "npx tsx scripts/seed-exercises.ts"
```

- [ ] **Step 2: Install tsx**

```bash
npm install --save-dev tsx dotenv
```

- [ ] **Step 3: Run seed**

```bash
npm run db:seed
```

Expected output: `Seeding 10 exercises... ✓ Seed complete`

- [ ] **Step 4: Verify in Neon console**

In Neon dashboard, run: `SELECT COUNT(*) FROM exercises;`
Expected: `10`

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-exercises.ts package.json
git commit -m "feat: add 10 curated exercises seed script"
```

---

## Task 6: Exercise List Page

**Files:**
- Create: `app/(dashboard)/exercices/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/exercices/page.tsx`**

```tsx
import Link from 'next/link'
import { getExercises } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock } from 'lucide-react'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civilisation Espagne',
  civi_latam: 'Amérique latine',
  didactique: 'Didactique',
}

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-500/20 text-red-400 border-red-500/30',
  B: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  C: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const TYPE_LABELS: Record<string, string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai / Faux',
  lacunaire: 'Texte lacunaire',
  chronologie: 'Chronologie',
  association: 'Association',
}

export default async function ExercicesPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; level?: string }>
}) {
  const params = await searchParams
  const exercises = await getExercises({
    domain: params.domain,
    level: params.level,
    limit: 20,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Exercices</h1>
        <p className="text-zinc-400 text-sm">{exercises.length} exercice(s) disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['langue', 'civi_espagne', 'civi_latam', 'didactique'].map(domain => (
          <Link
            key={domain}
            href={params.domain === domain ? '/exercices' : `/exercices?domain=${domain}`}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              params.domain === domain
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {DOMAIN_LABELS[domain]}
          </Link>
        ))}
        <span className="border-l border-zinc-700 mx-1" />
        {['A', 'B', 'C'].map(level => (
          <Link
            key={level}
            href={params.level === level ? '/exercices' : `/exercices?level=${level}`}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              params.level === level
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            Niveau {level}
          </Link>
        ))}
      </div>

      {/* Exercise cards */}
      <div className="grid gap-3">
        {exercises.map(ex => (
          <Link key={ex.id} href={`/exercices/${ex.id}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-medium line-clamp-2 mb-2">
                      {ex.question}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                        {DOMAIN_LABELS[ex.domain] ?? ex.domain}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                        {TYPE_LABELS[ex.type] ?? ex.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`text-xs shrink-0 ${LEVEL_COLORS[ex.level]}`}>
                    {ex.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <BookOpen className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p>Aucun exercice trouvé pour ces filtres.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify exercise list renders**

```bash
npm run dev
```

Visit `http://localhost:3000/exercices`. Expected: list of 10 exercises with filter badges for domain and level.

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/exercices/page.tsx
git commit -m "feat: add exercise list page with domain and level filters"
```

---

## Task 7: Exercise Components (QCM, Vrai/Faux, Lacunaire)

**Files:**
- Create: `components/exercises/exercise-qcm.tsx`
- Create: `components/exercises/exercise-vrai-faux.tsx`
- Create: `components/exercises/exercise-lacunaire.tsx`
- Create: `components/exercises/exercise-feedback.tsx`
- Create: `app/(dashboard)/exercices/[id]/page.tsx`
- Create: `app/api/exercises/correct/route.ts`

- [ ] **Step 1: Create `components/exercises/exercise-feedback.tsx`**

```tsx
'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Props = {
  correct: boolean
  correctAnswer: string
  explanation: string
  aiExplanation?: string
  onNext: () => void
}

export function ExerciseFeedback({ correct, correctAnswer, explanation, aiExplanation, onNext }: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className={`flex items-center gap-2 text-sm font-medium ${correct ? 'text-green-400' : 'text-red-400'}`}>
        {correct
          ? <><CheckCircle className="h-5 w-5" /> Correct !</>
          : <><XCircle className="h-5 w-5" /> Incorrect</>
        }
      </div>

      {!correct && (
        <p className="text-sm text-zinc-400">
          Bonne réponse : <span className="text-zinc-200 font-medium">{correctAnswer}</span>
        </p>
      )}

      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {aiExplanation ?? explanation}
          </p>
        </CardContent>
      </Card>

      <Button onClick={onNext} className="w-full bg-violet-600 hover:bg-violet-700">
        Exercice suivant →
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/exercises/exercise-qcm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string
  options: string[]
  answer: string
  explanation: string
  onComplete: (correct: boolean) => void
}

export function ExerciseQCM({ id, question, options, answer, explanation, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()

  async function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    const correct = selected === answer
    onComplete(correct)

    if (!correct) {
      const res = await fetch('/api/exercises/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: id, userAnswer: selected, correctAnswer: answer }),
      })
      const data = await res.json()
      setAiExplanation(data.explanation)
    }
  }

  if (submitted && selected) {
    return (
      <ExerciseFeedback
        correct={selected === answer}
        correctAnswer={answer}
        explanation={explanation}
        aiExplanation={aiExplanation}
        onNext={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-zinc-100 text-base font-medium leading-relaxed">{question}</p>
      <div className="space-y-2 mt-4">
        {options.map(option => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
              selected === option
                ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full mt-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/exercises/exercise-vrai-faux.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string
  answer: string
  explanation: string
  onComplete: (correct: boolean) => void
}

export function ExerciseVraiFaux({ id, question, answer, explanation, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()

  async function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    const correct = selected === answer
    onComplete(correct)

    if (!correct) {
      const res = await fetch('/api/exercises/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: id, userAnswer: selected, correctAnswer: answer }),
      })
      const data = await res.json()
      setAiExplanation(data.explanation)
    }
  }

  if (submitted && selected) {
    return (
      <ExerciseFeedback
        correct={selected === answer}
        correctAnswer={answer}
        explanation={explanation}
        aiExplanation={aiExplanation}
        onNext={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-zinc-100 text-base font-medium leading-relaxed">{question}</p>
      <div className="flex gap-3 mt-4">
        {['Vrai', 'Faux'].map(choice => (
          <button
            key={choice}
            onClick={() => setSelected(choice)}
            className={`flex-1 py-4 rounded-lg border text-sm font-medium transition-colors ${
              selected === choice
                ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full mt-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/exercises/exercise-lacunaire.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string  // Contains "___" as placeholder
  answer: string
  explanation: string
  onComplete: (correct: boolean) => void
}

export function ExerciseLacunaire({ id, question, answer, explanation, onComplete }: Props) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()

  const parts = question.split('___')

  async function handleSubmit() {
    if (!value.trim()) return
    setSubmitted(true)
    const correct = value.trim().toLowerCase() === answer.toLowerCase()
    onComplete(correct)

    if (!correct) {
      const res = await fetch('/api/exercises/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: id, userAnswer: value, correctAnswer: answer }),
      })
      const data = await res.json()
      setAiExplanation(data.explanation)
    }
  }

  if (submitted) {
    return (
      <ExerciseFeedback
        correct={value.trim().toLowerCase() === answer.toLowerCase()}
        correctAnswer={answer}
        explanation={explanation}
        aiExplanation={aiExplanation}
        onNext={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-zinc-100 text-base font-medium leading-relaxed flex flex-wrap items-center gap-2">
        {parts[0]}
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="inline-block w-40 bg-zinc-800 border-zinc-600 text-zinc-100 h-8 px-2 text-sm"
          placeholder="votre réponse"
          autoFocus
        />
        {parts[1]}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/api/exercises/correct/route.ts`**

```ts
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { exerciseId, userAnswer, correctAnswer } = await req.json()

  const exercise = await getExerciseById(exerciseId)
  if (!exercise) return NextResponse.json({ explanation: '' }, { status: 404 })

  const { text } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `Tu es un professeur expert du CAPES d'espagnol. Tu donnes des explications pédagogiques claires et bienveillantes en français. Sois précis, concis (2-3 phrases maximum), et toujours encourage l'apprenant.`,
    prompt: `L'apprenant a répondu "${userAnswer}" à la question suivante : "${exercise.question}". La bonne réponse est "${correctAnswer}". Explique pourquoi sa réponse est incorrecte et pourquoi la bonne réponse est "${correctAnswer}".`,
    maxTokens: 200,
  })

  return NextResponse.json({ explanation: text })
}
```

- [ ] **Step 6: Create `app/(dashboard)/exercices/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getExerciseById, saveAttempt } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExerciseQCM } from '@/components/exercises/exercise-qcm'
import { ExerciseVraiFaux } from '@/components/exercises/exercise-vrai-faux'
import { ExerciseLacunaire } from '@/components/exercises/exercise-lacunaire'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civilisation Espagne',
  civi_latam: 'Amérique latine',
  didactique: 'Didactique',
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = await getExerciseById(Number(id))
  if (!exercise) notFound()

  async function handleComplete(correct: boolean) {
    'use server'
    await saveAttempt({ exercise_id: exercise!.id, correct, time_spent: null })
  }

  const sharedProps = {
    id: exercise.id,
    question: exercise.question,
    answer: exercise.answer,
    explanation: exercise.explanation,
    onComplete: handleComplete,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/exercices"
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux exercices
      </Link>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
              {DOMAIN_LABELS[exercise.domain] ?? exercise.domain}
            </Badge>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
              {exercise.theme}
            </Badge>
            <Badge className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
              Niveau {exercise.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {exercise.type === 'qcm' && exercise.options && (
            <ExerciseQCM {...sharedProps} options={exercise.options as string[]} />
          )}
          {exercise.type === 'vrai_faux' && (
            <ExerciseVraiFaux {...sharedProps} />
          )}
          {exercise.type === 'lacunaire' && (
            <ExerciseLacunaire {...sharedProps} />
          )}
          {!['qcm', 'vrai_faux', 'lacunaire'].includes(exercise.type) && (
            <p className="text-zinc-400 text-sm">
              Type d'exercice "{exercise.type}" — interface à venir.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Verify exercise flow end-to-end**

```bash
npm run dev
```

1. Go to `/exercices`
2. Click a QCM exercise → renders question + options
3. Select wrong answer → click Valider → see red feedback + AI explanation
4. Select correct answer → click Valider → see green feedback

- [ ] **Step 8: Commit**

```bash
git add components/exercises/ app/\(dashboard\)/exercices/\[id\]/ app/api/exercises/
git commit -m "feat: add QCM, vrai/faux, lacunaire exercise components with AI feedback"
```

---

## Task 8: Exercise Generation via AI

**Files:**
- Create: `app/api/exercises/generate/route.ts`
- Modify: `app/(dashboard)/exercices/page.tsx` (add "Générer" button)

- [ ] **Step 1: Create `app/api/exercises/generate/route.ts`**

```ts
import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { saveExercise } from '@/lib/db'
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
  const { theme, domain, type, level } = await req.json()

  const { object } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    output: Output.object({ schema: ExerciseSchema }),
    system: `Tu es un expert du CAPES d'espagnol. Tu génères des exercices rigoureux, culturellement précis et pédagogiquement pertinents pour des candidats préparant le concours.`,
    prompt: `Génère un exercice de type "${type}" sur le thème "${theme}" dans le domaine "${domain}" pour un candidat de niveau "${level}".

Pour un QCM : 4 options dont une seule correcte.
Pour un vrai/faux : une affirmation avec réponse "Vrai" ou "Faux".
Pour un lacunaire : une phrase avec "___" pour le mot manquant.

L'explication doit être pédagogique (2-3 phrases), jamais condescendante.`,
  })

  const saved = await saveExercise({ ...object, source: 'ai_generated' })
  return NextResponse.json(saved)
}
```

- [ ] **Step 2: Install zod**

```bash
npm install zod
```

- [ ] **Step 3: Add "Générer" button to exercises page**

Add this section above the exercise grid in `app/(dashboard)/exercices/page.tsx`:

```tsx
// Add this import at top:
import { GenerateExerciseButton } from '@/components/exercises/generate-exercise-button'

// Add this just before the exercise grid:
<div className="flex justify-end mb-4">
  <GenerateExerciseButton />
</div>
```

Create `components/exercises/generate-exercise-button.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2 } from 'lucide-react'

const DOMAINS = [
  { value: 'langue', label: 'Langue' },
  { value: 'civi_espagne', label: 'Civilisation Espagne' },
  { value: 'civi_latam', label: 'Amérique latine' },
  { value: 'didactique', label: 'Didactique' },
]

const TYPES = [
  { value: 'qcm', label: 'QCM' },
  { value: 'vrai_faux', label: 'Vrai / Faux' },
  { value: 'lacunaire', label: 'Texte lacunaire' },
]

export function GenerateExerciseButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    theme: '',
    domain: 'langue',
    type: 'qcm',
    level: 'B',
  })

  async function handleGenerate() {
    if (!form.theme.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const exercise = await res.json()
      setOpen(false)
      router.push(`/exercices/${exercise.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:border-violet-500 hover:text-violet-300">
          <Sparkles className="h-4 w-4 mr-2" />
          Générer un exercice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Générer un exercice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-zinc-300 text-sm">Thème</Label>
            <Input
              value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
              placeholder="ex: subjonctif, guerre civile, boom literario…"
              className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-zinc-300 text-sm">Domaine</Label>
              <select
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Type</Label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Niveau</Label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {['A', 'B', 'C'].map(l => <option key={l} value={l}>Niveau {l}</option>)}
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!form.theme.trim() || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
          >
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération…</> : 'Générer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Set up AI Gateway OIDC locally**

```bash
# Link project to Vercel (creates .vercel/project.json)
vercel link

# Enable AI Gateway in Vercel Dashboard → AI tab
# Then pull env vars including OIDC token:
vercel env pull .env.local
```

- [ ] **Step 5: Verify exercise generation**

```bash
npm run dev
```

1. Click "Générer un exercice"
2. Type theme: "subjonctif", domain: "Langue", type: "QCM", level: B
3. Click "Générer" → loading spinner → redirects to new exercise page

- [ ] **Step 6: Commit**

```bash
git add app/api/exercises/generate/ components/exercises/generate-exercise-button.tsx
git commit -m "feat: add AI exercise generation with domain/type/level params"
```

---

## Task 9: Professeur IA Chat

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `components/chat/chat-interface.tsx`
- Create: `app/(dashboard)/chat/page.tsx`

- [ ] **Step 1: Install AI Elements**

```bash
npx ai-elements@latest
```

Follow prompts to install components to `components/ai-elements/`.

- [ ] **Step 2: Install `@ai-sdk/react`**

```bash
npm install @ai-sdk/react
```

- [ ] **Step 3: Create `app/api/chat/route.ts`**

```ts
import { streamText, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `Tu es le professeur IA intégré à teachIA, une plateforme de préparation au CAPES d'espagnol. Tu incarnes un professeur passionné, exigeant et bienveillant, expert en langue espagnole ET en civilisation hispanique dans toute sa diversité (Espagne + Amérique latine).

TON RÔLE
Tu aides l'utilisateur à réussir le CAPES d'espagnol en couvrant tous les domaines du concours : grammaire, lexique, traduction, littérature, histoire, arts, cinéma, société, et didactique.

TES RÈGLES ABSOLUES
- Tu ne donnes JAMAIS la réponse directement. Tu guides par des sous-questions, des indices progressifs, des analogies. La réponse doit toujours venir de l'utilisateur.
- Pour chaque notion complexe, tu utilises une analogie concrète et mémorable avant d'expliquer.
- Tu corriges toujours en expliquant POURQUOI, jamais sèchement.
- Tu varies les formats : questions ouvertes, QCM oraux, mises en situation, comparaisons, débats guidés.
- Tu fais des ponts entre les domaines : un fait historique lié à une œuvre littéraire, une règle de grammaire illustrée par un texte authentique, etc.

DOMAINES MAÎTRISÉS
Langue : grammaire approfondie, subjonctif, ser/estar, por/para, concordance des temps, pronoms, périphrases, lexique, registres, traduction FR↔ES.
Civilisation Espagne : Reconquista, Siècle d'Or, guerre civile, franquisme, Transition démocratique, régions et langues co-officielles, littérature (Cervantes, Lorca, Machado, Generación del 98 y del 27), arts (Velázquez, Goya, Dalí, Picasso, Gaudí), cinéma (Buñuel, Almodóvar), société contemporaine.
Civilisation Amérique latine : civilisations précolombiennes, Conquista, colonisation, indépendances, dictatures du XXe siècle, boom littéraire (García Márquez, Borges, Neruda, Vargas Llosa, Allende), muralisme mexicain, révolution cubaine, mouvements sociaux contemporains, diversité ethnique et linguistique.
Didactique : approche actionnelle, interculturelle, conception de séquences pédagogiques, compétences du CECRL.

Tu commences chaque session en proposant de continuer là où l'utilisateur en est, ou en lui demandant ce qu'il veut travailler aujourd'hui.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    maxTokens: 1024,
  })

  return result.toUIMessageStreamResponse()
}
```

- [ ] **Step 4: Create `components/chat/chat-interface.tsx`**

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
// AI Elements components — installed via `npx ai-elements@latest`
import { Message } from '@/components/ai-elements/message'

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status, input, setInput } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isStreaming = status === 'streaming' || status === 'submitted'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">¡Hola! Je suis ton professeur IA.</p>
            <p className="text-sm">Pose-moi une question sur la grammaire, la civilisation, la littérature ou la didactique.</p>
          </div>
        )}
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-zinc-800">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pose une question à ton professeur…"
          disabled={isStreaming}
          className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 px-3"
        >
          {isStreaming
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/(dashboard)/chat/page.tsx`**

```tsx
import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-zinc-100">Professeur IA</h1>
        <p className="text-zinc-400 text-sm">Pose n'importe quelle question sur le CAPES d'espagnol.</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify chat works end-to-end**

```bash
npm run dev
```

1. Go to `/chat`
2. Type "Explique-moi la différence entre por et para"
3. Expected: streaming response from the professor AI, formatted with markdown

- [ ] **Step 7: Commit**

```bash
git add app/api/chat/ components/chat/ app/\(dashboard\)/chat/
git commit -m "feat: add Professeur IA streaming chat with AI Elements"
```

---

## Task 10: Deploy to Vercel

**Files:**
- Create: `.gitignore` additions
- Create: `vercel.json` (optional, for env var documentation)

- [ ] **Step 1: Ensure .gitignore is correct**

Verify `.gitignore` contains:

```
.env.local
.env*.local
.vercel
.superpowers/
node_modules/
.next/
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/<username>/teachia.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel --prod
```

When prompted:
- Link to existing project (created earlier with `vercel link`)
- Confirm settings

- [ ] **Step 4: Set environment variables in Vercel dashboard**

In Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `APP_PASSWORD` | Your chosen password |
| `AUTH_SECRET` | 32+ character random string |

AI Gateway OIDC token is auto-provisioned — no manual key needed.

- [ ] **Step 5: Verify production deployment**

Visit the production URL:
1. Should redirect to `/login`
2. Login with `APP_PASSWORD`
3. `/exercices` shows the 10 seeded exercises
4. `/chat` works with streaming

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: production deployment config"
git push
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| Next.js 16 App Router | Task 1 |
| Neon Postgres | Task 2 |
| Auth (proxy.ts + cookie) | Task 3 |
| Dark sidebar layout | Task 4 |
| Seed curated exercises | Task 5 |
| Exercise list with filters | Task 6 |
| QCM component | Task 7 |
| Vrai/Faux component | Task 7 |
| Lacunaire component | Task 7 |
| AI feedback on wrong answer | Task 7 |
| AI exercise generation | Task 8 |
| AI Gateway OIDC setup | Task 8 |
| Professeur IA streaming chat | Task 9 |
| AI Elements for chat UI | Task 9 |
| Deploy to Vercel | Task 10 |
| Chronologie + Association types | ⚠️ Placeholder in exercise page — full interactive components in Phase 2 |

**Gaps noted and handled:** Chronologie and Association exercise types are wired in the DB seed but render a "à venir" message in the exercise page. They'll be implemented as dedicated components in Phase 2 (when more exercise types are added alongside the study plan).

**Type consistency:**
- `Exercise.options` typed as `string[] | null` in `lib/db.ts` — used consistently in all exercise components ✓
- `saveAttempt` accepts `{ exercise_id, correct, time_spent }` — matches `exercise_attempts` schema ✓
- `DefaultChatTransport` imported from `ai` (v6) — consistent with `useChat` from `@ai-sdk/react` ✓
- `convertToModelMessages` used in API route — correct v6 pattern ✓

---

*Plans 2–4 (Plan de révision + Dashboard / Flashcards / Simulacros) seront rédigés au début de chaque phase.*
