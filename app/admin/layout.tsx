import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  // Defense in depth: reject non-superadmin users
  if (session.user.role !== 'superadmin') {
    redirect('/')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/catalog', label: 'Catalogue' },
    { href: '/admin/settings', label: 'Paramètres' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">Administration</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                ← Retour à l&apos;app
              </Link>
              <div className="text-right text-sm text-slate-600">
                {session.user.name && <p className="font-medium">{session.user.name}</p>}
                {session.user.email && (
                  <p className="hidden text-xs text-slate-500 sm:block">{session.user.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: horizontal scrollable nav */}
      <nav className="border-b border-slate-200 bg-white md:hidden">
        <div className="flex overflow-x-auto px-4 py-2 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex md:h-[calc(100vh-73px)]">
        {/* Desktop: sidebar navigation */}
        <nav className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
