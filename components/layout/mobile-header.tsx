'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, LayoutDashboard, MessageCircle, BookOpen, CreditCard, Target, BarChart2, History, Shield, User } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

  return (
    <>
      <header className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="mx-auto text-center leading-none">
          {userName && (
            <p className="text-xs text-slate-500 font-medium truncate max-w-40 mx-auto">{userName}</p>
          )}
          {userEmail && (
            <p className="text-xs text-slate-400 truncate max-w-40 mx-auto">{userEmail}</p>
          )}
          <span className="text-violet-600 font-semibold text-lg tracking-tight">teachIA</span>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-52 p-0">
          <SheetHeader className="px-4 py-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {userImage ? (
                <img src={userImage} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 text-left">
                {userName && <p className="text-sm font-medium text-slate-800 truncate leading-tight">{userName}</p>}
                {userEmail && <p className="text-xs text-slate-400 truncate leading-tight">{userEmail}</p>}
              </div>
            </div>
            <SheetTitle className="text-violet-600 font-semibold text-lg tracking-tight text-left">
              teachIA
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Navigation principale" className="px-2 py-4 space-y-0.5 flex flex-col h-full">
            <div className="space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                    pathname === href ||
                    (href === '/chat' && pathname.startsWith('/chat')) ||
                    (href === '/exercices' && pathname.startsWith('/exercices'))
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-auto pt-4 space-y-0.5">
              <Link
                href="/compte"
                onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
