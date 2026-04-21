'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, LayoutDashboard, MessageCircle, BookOpen, BookMarked, CreditCard, Target, BarChart2, History, Shield, User } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

interface MobileHeaderProps {
  userRole?: string
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}

export function MobileHeader({ userRole = 'student', userName, userEmail, userImage }: MobileHeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isSuperAdmin = userRole === 'superadmin'

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const isActive = (href: string) =>
    pathname === href ||
    (href === '/chat' && pathname.startsWith('/chat')) ||
    (href === '/exercices' && pathname.startsWith('/exercices')) ||
    (href === '/lecons' && pathname.startsWith('/lecons')) ||
    (href === '/simulacros' && pathname.startsWith('/simulacros'))

  const navLinkClass = (href: string) =>
    cn(
      'flex items-center gap-3 py-2 pr-3 pl-2.5 rounded-lg text-sm transition-colors cursor-pointer border-l-2',
      isActive(href)
        ? 'bg-violet-50 text-violet-700 font-medium border-violet-500'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
    )

  return (
    <>
      <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-lg tracking-tight select-none">
          <span className="text-violet-600">teach</span><span className="text-slate-900">IA</span>
        </span>
        {/* Avatar */}
        <div className="w-8 h-8 flex items-center justify-center">
          {userImage ? (
            <img src={userImage} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center ring-2 ring-slate-100">
              {initials}
            </div>
          )}
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-52 p-0 flex flex-col">
          {/* Logo */}
          <SheetHeader className="px-4 h-14 flex flex-row items-center border-b border-slate-100 shrink-0 space-y-0">
            <SheetTitle className="font-bold text-xl tracking-tight select-none">
              <span className="text-violet-600">teach</span><span className="text-slate-900">IA</span>
            </SheetTitle>
          </SheetHeader>

          {/* Nav */}
          <nav aria-label="Navigation principale" className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={navLinkClass(href)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Bottom: Mon compte + Admin + User */}
          <div className="border-t border-slate-100 px-2 py-2 space-y-0.5 shrink-0">
            <Link
              href="/compte"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 py-2 pr-3 pl-2.5 rounded-lg text-sm transition-colors cursor-pointer border-l-2',
                pathname === '/compte'
                  ? 'bg-violet-50 text-violet-700 font-medium border-violet-500'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              )}
            >
              <User className="h-4 w-4 shrink-0" />
              Mon compte
            </Link>
            {isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 py-2 pr-3 pl-2.5 rounded-lg text-sm transition-colors cursor-pointer border-l-2',
                  pathname.startsWith('/admin')
                    ? 'bg-amber-50 text-amber-700 font-medium border-amber-500'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                Administration
              </Link>
            )}
            <div className="px-3 pt-2 pb-1 flex items-center gap-2.5 min-w-0">
              {userImage ? (
                <img src={userImage} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover ring-2 ring-slate-100" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center shrink-0 ring-2 ring-slate-100">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                {userName && <p className="text-xs font-medium text-slate-700 truncate leading-tight">{userName}</p>}
                {userEmail && <p className="text-xs text-slate-400 truncate leading-tight">{userEmail}</p>}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
