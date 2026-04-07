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

const DOMAINS = [
  { value: 'langue', label: 'Langue' },
  { value: 'civi_espagne', label: 'Civilisation Espagne' },
  { value: 'civi_latam', label: 'Amérique latine' },
  { value: 'didactique', label: 'Didactique' },
]

const TYPES = [
  { value: 'qcm', label: 'QCM' },
  { value: 'vrai_faux', label: 'Vrai / Faux' },
  { value: 'lacunaire', label: 'Texte lacunaire' },
]

export function GenerateExerciseButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    theme: '',
    domain: 'langue',
    type: 'qcm',
    level: 'B',
  })

  async function handleGenerate() {
    if (!form.theme.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const exercise = await res.json()
      setOpen(false)
      router.push(`/exercices/${exercise.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:border-violet-500 hover:text-violet-300">
            <Sparkles className="h-4 w-4 mr-2" />
            Générer un exercice
          </Button>
        }
      />
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Générer un exercice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-zinc-300 text-sm">Thème</Label>
            <Input
              value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
              placeholder="ex: subjonctif, guerre civile, boom literario…"
              className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-zinc-300 text-sm">Domaine</Label>
              <select
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Type</Label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Niveau</Label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                {['A', 'B', 'C'].map(l => <option key={l} value={l}>Niveau {l}</option>)}
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!form.theme.trim() || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
          >
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération…</> : 'Générer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
