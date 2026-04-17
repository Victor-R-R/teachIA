'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOMAINS = [
  { value: 'langue',       label: 'Langue' },
  { value: 'civi_espagne', label: 'Civilisation Espagne' },
  { value: 'civi_latam',   label: 'Amérique latine' },
  { value: 'didactique',   label: 'Didactique' },
]

export function GenerateLessonButton({ className }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:  '',
    domain: 'langue',
    level:  'B',
  })

  async function handleGenerate() {
    setLoading(true)
    try {
      // 1. Générer le contenu via l'IA
      const genRes = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: form.domain,
          level:  form.level,
          title:  form.title || undefined,
        }),
      })
      if (!genRes.ok) return

      const { title, content } = await genRes.json()

      // 2. Sauvegarder la leçon
      const saveRes = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, domain: form.domain, level: form.level }),
      })
      if (!saveRes.ok) return

      const lesson = await saveRes.json()
      if (typeof lesson.id === 'number') {
        setOpen(false)
        router.push(`/lecons/${lesson.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className={cn('border-slate-300 text-slate-600 hover:border-violet-500 hover:text-violet-600', className)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Générer une leçon
          </Button>
        }
      />
      <DialogContent className="bg-white border-slate-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Générer une leçon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-700 text-sm">Titre (optionnel)</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ex : Le subjonctif présent, La Guerra Civil…"
              className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700 text-sm">Domaine</Label>
              <select
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="mt-1 w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900"
              >
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-slate-700 text-sm">Niveau</Label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="mt-1 w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900"
              >
                {['A', 'B', 'C'].map(l => <option key={l} value={l}>Niveau {l}</option>)}
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération…</>
              : 'Générer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
