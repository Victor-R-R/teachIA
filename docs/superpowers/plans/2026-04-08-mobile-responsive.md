# Mobile / Tablet Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the teachIA dashboard fully usable on mobile and tablet by replacing the fixed sidebar with a top header + Sheet drawer below 1024px, and fixing responsive issues across all pages.

**Architecture:** New `MobileHeader` client component handles hamburger + Sheet drawer (uses existing shadcn `Sheet`). Sidebar gets `hidden lg:flex`. Dashboard layout switches from `flex-row` to `flex-col` on mobile. Page-level tweaks fix chat height and exercises button width.

**Tech Stack:** Next.js App Router, Tailwind CSS, shadcn/ui (`Sheet`, `Button`), lucide-react

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `components/layout/mobile-header.tsx` | Hamburger button + Sheet drawer with nav links |
| Modify | `components/layout/sidebar.tsx` | Hide on mobile (`hidden lg:flex`) |
| Modify | `app/(dashboard)/layout.tsx` | `flex-col lg:flex-row`, insert MobileHeader, reduce padding |
| Modify | `components/chat/chat-interface.tsx` | Fix height calc for mobile header + virtual keyboard |
| Modify | `components/exercises/generate-exercise-button.tsx` | Accept optional `className` prop |
| Modify | `app/(dashboard)/exercices/page.tsx` | Full-width generate button on mobile |

---

## Task 1: Create MobileHeader component

**Files:**
- Create: `components/layout/mobile-header.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, LayoutDashboard, MessageCircle, BookOpen, CreditCard, Target, BarChart2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Professeur IA', icon: MessageCircle },
  { href: '/exercices', label: 'Exercices', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/simulacros', label: 'Simulacros', icon: Target },
  { href: '/stats', label: 'Statistiques', icon: BarChart2 },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="mx-auto text-violet-600 font-semibold text-lg tracking-tight">teachIA</span>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-52 p-0">
          <SheetHeader className="px-4 py-5 border-b border-slate-100">
            <SheetTitle className="text-violet-600 font-semibold text-lg tracking-tight text-left">
              teachIA
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Navigation principale" className="px-2 py-4 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                  pathname === href
                    ? 'bg-violet-50 text-violet-700 font-medium'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors on the new file.

- [ ] **Step 3: Commit**

```bash
git add components/layout/mobile-header.tsx
git commit -m "feat: add MobileHeader component with Sheet drawer"
```

---

## Task 2: Hide sidebar on mobile

**Files:**
- Modify: `components/layout/sidebar.tsx:28`

- [ ] **Step 1: Update the `<aside>` className**

In `components/layout/sidebar.tsx`, change line 28:

```tsx
// Before
<aside className="w-52 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">

// After
<aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white border-r border-slate-200 h-full">
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: hide sidebar below lg breakpoint"
```

---

## Task 3: Update dashboard layout

**Files:**
- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Rewrite the layout**

```tsx
import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Visual check — start dev server and open on mobile width**

```bash
npm run dev
```

Open `http://localhost:3000` in browser, resize to 375px wide (iPhone). Expected:
- Header bar visible with hamburger + centered "teachIA" logo
- No sidebar visible
- Tap hamburger → Sheet slides in from left with all 6 nav links
- Active link highlighted in violet
- Tap a link → drawer closes, page navigates

Resize to 1024px+. Expected:
- Header bar disappears
- Sidebar visible on the left as before

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/layout.tsx
git commit -m "feat: responsive dashboard layout with mobile header"
```

---

## Task 4: Fix chat height for mobile

**Files:**
- Modify: `components/chat/chat-interface.tsx:46`

- [ ] **Step 1: Update height class**

In `components/chat/chat-interface.tsx`, change line 46:

```tsx
// Before
<div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">

// After
<div className="flex flex-col h-full max-h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100vh-6rem)]">
```

`100dvh` = dynamic viewport height — shrinks automatically when the mobile virtual keyboard appears, so the input stays visible. `3.5rem` = `h-14` mobile header. `6rem` = existing desktop offset.

- [ ] **Step 2: Visual check on mobile**

With dev server running, open `http://localhost:3000/chat` at 375px wide. Expected:
- Messages area scrollable
- Tap the input field → keyboard appears → input bar stays visible above keyboard (not hidden behind it)

- [ ] **Step 3: Commit**

```bash
git add components/chat/chat-interface.tsx
git commit -m "fix: chat height uses dvh for mobile virtual keyboard"
```

---

## Task 5: Full-width generate button on mobile

**Files:**
- Modify: `components/exercises/generate-exercise-button.tsx`
- Modify: `app/(dashboard)/exercices/page.tsx`

- [ ] **Step 1: Add `className` prop to GenerateExerciseButton**

In `components/exercises/generate-exercise-button.tsx`, update the component signature and the `DialogTrigger` render:

```tsx
// Change line 26 — add className prop
export function GenerateExerciseButton({ className }: { className?: string }) {

// Change the DialogTrigger render prop — add className to Button
<DialogTrigger
  render={
    <Button
      size="sm"
      variant="outline"
      className={cn(
        'border-slate-300 text-slate-600 hover:border-violet-500 hover:text-violet-600',
        className
      )}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Générer un exercice
    </Button>
  }
/>
```

Add the missing import at the top (cn is not yet imported in this file):

```tsx
import { cn } from '@/lib/utils'
```

- [ ] **Step 2: Update the exercises page wrapper**

In `app/(dashboard)/exercices/page.tsx`, change lines 79–81:

```tsx
// Before
<div className="flex justify-end mb-4">
  <GenerateExerciseButton />
</div>

// After
<div className="flex justify-end mb-4">
  <GenerateExerciseButton className="w-full sm:w-auto" />
</div>
```

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/exercices` at 375px wide. Expected:
- "Générer un exercice" button spans full width
- At ≥640px (sm), button is auto-width and right-aligned

- [ ] **Step 4: Commit**

```bash
git add components/exercises/generate-exercise-button.tsx app/(dashboard)/exercices/page.tsx
git commit -m "feat: full-width generate button on mobile"
```

---

## Task 6: Final verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 2: Full responsive smoke test**

With dev server running (`npm run dev`), test each page at 375px (mobile), 768px (tablet), 1280px (desktop):

| Page | Mobile check |
|------|-------------|
| `/` | Header visible, no sidebar, padding reduced |
| `/chat` | Chat fills screen, input stays above keyboard |
| `/exercices` | Button full-width, filters wrap correctly |
| `/exercices/[id]` | Card readable, max-w-2xl centered on tablet |
| `/login` | Unchanged, already responsive |

- [ ] **Step 3: Check drawer closes on navigation**

On mobile, open drawer → click "Exercices" → drawer closes → `/exercices` loads. ✅
