import type { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ScrollRestorer } from '@/components/layout/scroll-restorer'
import { ImpersonationBanner } from '@/components/impersonation-banner'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const userRole = session?.user?.role || 'student'
  const userName = session?.user?.name ?? null
  const userEmail = session?.user?.email ?? null
  const userImage = session?.user?.image ?? null

  return (
    <>
      <ImpersonationBanner />
      <div className="flex flex-col lg:flex-row h-screen h-[100dvh] overflow-hidden">
        <MobileHeader userRole={userRole} userName={userName} userEmail={userEmail} userImage={userImage} />
        <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} userImage={userImage} />
        <main id="main-content" className="flex-1 overflow-y-auto bg-white p-4 lg:p-6 flex flex-col">
          <ScrollRestorer />
          {children}
        </main>
      </div>
    </>
  )
}
