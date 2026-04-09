'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ImpersonationBanner() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const match = document.cookie.split(';').find(c => c.trim().startsWith('impersonate_user_email='))
    if (match) {
      const value = decodeURIComponent(match.split('=')[1].trim())
      if (value) setEmail(value)
    }
  }, [])

  if (!email) return null

  async function stop() {
    setLoading(true)
    await fetch('/api/admin/impersonate/stop', { method: 'POST' })
    router.push('/admin/users')
    router.refresh()
  }

  return (
    <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>Mode impersonation — Tu navigues en tant que <strong>{email}</strong></span>
      <button
        onClick={stop}
        disabled={loading}
        className="ml-4 px-3 py-1 bg-amber-950 text-amber-50 rounded text-xs hover:bg-amber-800 disabled:opacity-50"
      >
        {loading ? 'Quitter...' : 'Quitter'}
      </button>
    </div>
  )
}
