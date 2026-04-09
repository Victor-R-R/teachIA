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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
            <div className="text-sm text-slate-600">
              {session.user.name && <p>{session.user.name}</p>}
              {session.user.email && <p className="text-xs text-slate-500">{session.user.email}</p>}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Admin Sidebar Navigation */}
        <nav className="w-56 border-r border-slate-200 bg-white p-4">
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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
