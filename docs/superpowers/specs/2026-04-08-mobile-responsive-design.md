# Mobile / Tablet Responsive Design

**Date:** 2026-04-08
**Scope:** All dashboard pages + auth
**Breakpoint:** `< 1024px` → mobile/tablet layout ; `≥ 1024px` → desktop layout

---

## Problem

The app currently has no responsive behavior. The fixed `w-52` sidebar takes too much space on mobile/tablet and there are no breakpoints on any page. Navigation is inaccessible below 1024px.

---

## Approach: MobileHeader + Sheet drawer (Option B)

Keep the layout as a Server Component. Extract mobile-specific interactivity into a dedicated Client Component (`MobileHeader`). Use the existing `Sheet` shadcn component for the drawer — no new dependencies.

---

## Architecture

### New file: `components/layout/mobile-header.tsx`

- **Type:** Client Component (`'use client'`)
- **Visibility:** `lg:hidden` — renders only below 1024px
- **Structure:**
  - Fixed top bar, `h-14`, white background, `border-b border-slate-200`
  - Left: `Menu` icon button (lucide) — toggles `open` state
  - Center: `teachIA` logo in violet (same as sidebar)
  - Right: empty (reserved for future avatar/profile)
- **Drawer:** `Sheet` with `side="left"`, contains the same `NAV_ITEMS` as the sidebar, with identical active-state styling
- **State:** `useState<boolean>(false)` for `open` — local to this component

### Modified: `components/layout/sidebar.tsx`

- Add `hidden lg:flex` to the `<aside>` — sidebar disappears entirely below 1024px
- No other changes

### Modified: `app/(dashboard)/layout.tsx`

- Add `<MobileHeader />` above `<main>`
- Change outer div: `flex h-screen overflow-hidden` → `flex flex-col lg:flex-row h-screen overflow-hidden`
- Change `<main>` padding: `p-6` → `p-4 lg:p-6`

### Modified: `components/chat/chat-interface.tsx`

- Change height: `max-h-[calc(100vh-6rem)]` → `max-h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100vh-6rem)]`
- `100dvh` accounts for the mobile browser's dynamic viewport (virtual keyboard shrinks it automatically)
- `3.5rem` = `h-14` mobile header height

### Modified: `app/(dashboard)/exercices/page.tsx`

- "Générer un exercice" button wrapper: `flex justify-end mb-4` → `flex justify-end mb-4` with button getting `w-full sm:w-auto`
- Filters already use `flex-wrap` — no change needed
- Exercise cards already full-width — no change needed

### Modified: `app/(dashboard)/exercices/[id]/page.tsx`

- `max-w-2xl mx-auto` already provides good centering on tablet ✅
- Benefits automatically from the reduced layout padding on mobile — no direct changes needed

### Login page (`app/(auth)/login/page.tsx`)

- Already responsive (`max-w-sm`, `p-4`, centered flex) ✅ — no changes

---

## Files changed

| File | Change |
|------|--------|
| `components/layout/mobile-header.tsx` | **New** — hamburger + Sheet drawer |
| `components/layout/sidebar.tsx` | `hidden lg:flex` on `<aside>` |
| `app/(dashboard)/layout.tsx` | flex-col on mobile, insert MobileHeader, reduce padding |
| `components/chat/chat-interface.tsx` | Fix height calc for mobile header + dvh |
| `app/(dashboard)/exercices/page.tsx` | Full-width generate button on mobile |

---

## Out of scope

- Exercise components (`exercise-qcm.tsx`, `exercise-vrai-faux.tsx`, `exercise-lacunaire.tsx`) — their internal layout is already simple enough for mobile
- Dashboard page (`/`) — placeholder content, nothing to adapt
- Pages not yet implemented (flashcards, simulacros, stats)
