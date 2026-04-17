'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  BookMarked,
  CreditCard,
  Target,
  BarChart2,
  History,
  Shield,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Professeur IA', icon: MessageCircle },
  { href: '/conversations', label: 'Conversations', icon: History },
  { href: '/lecons', label: 'Leçons', icon: BookMarked },
  { href: '/exercices', label: 'Exercices', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/simulacros', label: 'Simulacros', icon: Target },
  { href: '/stats', label: 'Statistiques', icon: BarChart2 },
]

interface SidebarProps {
  userRole?: string
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}

export function Sidebar({ userRole = 'student', userName, userEmail, userImage }: SidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = userRole === 'superadmin'

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white border-r border-slate-200 h-full">
      <div className="px-4 py-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {userImage ? (
            <img src={userImage} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            {userName && <p className="text-sm font-medium text-slate-800 truncate leading-tight">{userName}</p>}
            {userEmail && <p className="text-xs text-slate-400 truncate leading-tight">{userEmail}</p>}
          </div>
        </div>
        <span className="text-violet-600 font-semibold text-lg tracking-tight block">teachIA</span>
      </div>
      <nav aria-label="Navigation principale" className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
              pathname === href ||
              (href === '/chat' && pathname.startsWith('/chat')) ||
              (href === '/exercices' && pathname.startsWith('/exercices')) ||
              (href === '/lecons' && pathname.startsWith('/lecons')) ||
              (href === '/simulacros' && pathname.startsWith('/simulacros'))
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-100 px-2 py-3 space-y-0.5">
        <Link
          href="/compte"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
            pathname === '/compte'
              ? 'bg-violet-50 text-violet-700 font-medium'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          Mon compte
        </Link>
        {isSuperAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
              pathname.startsWith('/admin')
                ? 'bg-amber-50 text-amber-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Administration
          </Link>
        )}
      </div>
    </aside>
  )
}
