'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ImpersonateButton({ userId, email }: { userId: string; email: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function impersonate() {
    setLoading(true)
    await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    })
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={impersonate}
      disabled={loading}
      className="text-xs px-2 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded"
    >
      {loading ? '...' : 'Impersonner'}
    </button>
  )
}
