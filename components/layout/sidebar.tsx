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
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Professeur IA', icon: MessageCircle },
  { href: '/conversations', label: 'Conversations', icon: History },
  { href: '/exercices', label: 'Exercices', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/simulacros', label: 'Simulacros', icon: Target },
  { href: '/stats', label: 'Statistiques', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white border-r border-slate-200 h-full">
      <div className="px-4 py-5 border-b border-slate-100">
        <span className="text-violet-600 font-semibold text-lg tracking-tight">teachIA</span>
      </div>
      <nav aria-label="Navigation principale" className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
              pathname === href || (href === '/chat' && pathname.startsWith('/chat'))
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
