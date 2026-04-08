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
