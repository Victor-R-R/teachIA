import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-6">
        {children}
      </main>
    </div>
  )
}
