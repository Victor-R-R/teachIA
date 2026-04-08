'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type SimulacroType = 'composition' | 'theme' | 'version'

interface Props {
  type: SimulacroType
  label: string
}

export function StartSimulacroButton({ type, label }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch('/api/simulacros/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) return
      const data = await res.json() as { id: number }
      router.push(`/simulacros/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm"
    >
      {loading
        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Génération du sujet…</>
        : label}
    </Button>
  )
}
