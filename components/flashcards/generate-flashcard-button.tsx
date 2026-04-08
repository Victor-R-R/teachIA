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

export function GenerateFlashcardButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    theme: '',
    domain: 'langue',
    level: 'B',
    count: 5,
  })

  async function handleGenerate() {
    if (!form.theme.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, count: Number(form.count) }),
      })
      if (!res.ok) return
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="border-slate-300 text-slate-600 hover:border-violet-500 hover:text-violet-600">
            <Sparkles className="h-4 w-4 mr-2" />
            Générer des cartes
          </Button>
        }
      />
      <DialogContent className="bg-white border-slate-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Générer des flashcards</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-700 text-sm">Thème</Label>
            <Input
              value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
              placeholder="ex: subjonctif, Lorca, révolution cubaine, CECRL…"
              className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <Label className="text-slate-700 text-sm">Nb cartes</Label>
              <select
                value={form.count}
                onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))}
                className="mt-1 w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900"
              >
                {[3, 5, 8, 10].map(n => <option key={n} value={n}>{n} cartes</option>)}
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!form.theme.trim() || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Génération en cours…</>
              : 'Générer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
