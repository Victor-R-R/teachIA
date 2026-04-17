'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Wand2 } from 'lucide-react'

type SeedResult = {
  created: number
  skipped: number
  errors: number
  results: { title: string; status: 'created' | 'skipped' | 'error'; error?: string }[]
}

export function SeedLessonsButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeedResult | null>(null)

  async function handleSeed() {
    if (!confirm('Générer les leçons catalogue pour tous les exercices ? Cela peut prendre 1-2 minutes.')) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/lessons/seed', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 disabled:opacity-50 transition-colors font-medium"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Génération en cours…</>
          : <><Wand2 className="h-4 w-4" /> Seed leçons catalogue</>}
      </button>

      {loading && (
        <p className="text-xs text-slate-400">
          Génération des leçons via l&apos;IA pour chaque exercice catalogue… (~1-2 min)
        </p>
      )}

      {result && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
          <p className="font-medium text-slate-700">
            ✅ {result.created} créées · ⏭️ {result.skipped} ignorées · ❌ {result.errors} erreurs
          </p>
          {result.results.length > 0 && (
            <ul className="space-y-0.5 text-xs text-slate-500 max-h-40 overflow-y-auto">
              {result.results.map((r, i) => (
                <li key={i}>
                  {r.status === 'created' ? '✅' : r.status === 'skipped' ? '⏭️' : '❌'}{' '}
                  {r.title}
                  {r.error && <span className="text-red-500 ml-1">({r.error})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
