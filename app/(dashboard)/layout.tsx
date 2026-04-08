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
