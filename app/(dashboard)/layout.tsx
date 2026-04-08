import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ScrollRestorer } from '@/components/layout/scroll-restorer'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <MobileHeader />
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-y-auto bg-white p-4 lg:p-6">
        <ScrollRestorer />
        {children}
      </main>
    </div>
  )
}
