'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Amér. Latine',
  didactique: 'Didactique',
}

export default function EditLeconPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [domain, setDomain] = useState('langue')
  const [level, setLevel] = useState('A')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setDomain(data.domain ?? 'langue')
        setLevel(data.level ?? 'A')
        setLoading(false)
      })
      .catch(() => setError('Erreur de chargement'))
  }, [id])

  async function save() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error('Échec de la sauvegarde')
      router.push(`/lecons/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded animate-pulse w-48 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-100 rounded animate-pulse" />
          <div className="h-64 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/lecons/${id}`}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la leçon
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Modifier ma leçon</h1>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Domain + Level (display only for user lessons) */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-xs text-slate-500 mb-1 block font-medium">Domaine</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              {Object.entries(DOMAIN_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block font-medium">Niveau</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="A">A — Débutant</option>
              <option value="B">B — Intermédiaire</option>
              <option value="C">C — Avancé</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block font-medium">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block font-medium">Contenu (markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full text-sm font-mono border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            href={`/lecons/${id}`}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            onClick={save}
            disabled={saving || !title.trim() || !content.trim()}
            className="px-5 py-2 text-sm bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
