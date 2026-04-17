'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/lib/db'

// La génération IA initiale se fait via GenerateLessonButton (même pattern que les exercices).
// Cet éditeur sert à modifier le contenu et lier les exercices APRÈS création.

interface LessonEditorProps {
  lesson?: {
    id: number
    title: string
    content: string
    domain: string
    level: string
    exercises: Exercise[]
  }
  catalogExercises: Exercise[]
}

export function LessonEditor({ lesson, catalogExercises }: LessonEditorProps) {
  const router = useRouter()
  const isNew = !lesson

  const [title, setTitle] = useState(lesson?.title ?? '')
  const [content, setContent] = useState(lesson?.content ?? '')
  const [domain, setDomain] = useState(lesson?.domain ?? 'langue')
  const [level, setLevel] = useState(lesson?.level ?? 'A')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(lesson?.exercises.map((e) => e.id) ?? [])
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError(null)
    try {
      const exerciseIds = Array.from(selectedIds)
      if (isNew) {
        const res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, domain, level }),
        })
        if (!res.ok) throw new Error('Échec de la création')
        const saved = await res.json()
        await fetch(`/api/lessons/${saved.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exercise_ids: exerciseIds }),
        })
        router.push('/admin/lecons')
      } else {
        const res = await fetch(`/api/lessons/${lesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, exercise_ids: exerciseIds }),
        })
        if (!res.ok) throw new Error('Échec de la sauvegarde')
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  async function deleteLesson() {
    if (!lesson) return
    if (!confirm('Supprimer cette leçon ? Les exercices liés seront déliés.')) return
    await fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' })
    router.push('/admin/lecons')
  }

  const filteredExercises = catalogExercises.filter(
    (e) => e.domain === domain && e.level === level
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isNew ? 'Nouvelle leçon' : 'Modifier la leçon'}
        </h1>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={deleteLesson}
              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          )}
          <button
            onClick={save}
            disabled={saving || !title.trim() || !content.trim()}
            className="px-4 py-1.5 text-sm bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 border border-red-200">
          {error}
        </p>
      )}

      {/* Domain + Level */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-xs text-slate-500 mb-1 block font-medium">Domaine</label>
          <select
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setSelectedIds(new Set()) }}
            className="text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option value="langue">Langue</option>
            <option value="civi_espagne">Civi. Espagne</option>
            <option value="civi_latam">Amér. Latine</option>
            <option value="didactique">Didactique</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block font-medium">Niveau</label>
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setSelectedIds(new Set()) }}
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
          placeholder="Titre de la leçon..."
          className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block font-medium">
          Contenu (Markdown)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full text-sm font-mono border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-y"
          placeholder="Contenu de la leçon en markdown..."
        />
      </div>

      {/* Link exercises */}
      <div>
        <h2 className="text-base font-medium text-slate-900 mb-1">
          Exercices liés
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Exercices du catalogue pour {domain} · Niveau {level} ({filteredExercises.length})
        </p>
        {filteredExercises.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Aucun exercice catalogue pour ce domaine/niveau.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto border border-slate-200 rounded-md p-3 bg-slate-50">
            {filteredExercises.map((ex) => (
              <label key={ex.id} className="flex items-start gap-2 cursor-pointer hover:bg-white rounded-md px-1 py-0.5 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.has(ex.id)}
                  onChange={(e) => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev)
                      if (e.target.checked) next.add(ex.id)
                      else next.delete(ex.id)
                      return next
                    })
                  }}
                  className="mt-0.5 accent-violet-600"
                />
                <span className="text-sm text-slate-700 leading-snug">
                  <span className="font-mono text-xs text-slate-400 mr-1">#{ex.id}</span>
                  {(ex.title ?? ex.question).slice(0, 100)}
                  <span className="ml-1 text-xs text-slate-400">({ex.type})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
