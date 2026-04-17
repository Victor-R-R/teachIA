'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'

interface LessonOwnerActionsProps {
  lessonId: number
  editHref: string
}

export function LessonOwnerActions({ lessonId, editHref }: LessonOwnerActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer cette leçon ? Cette action est irréversible.')) return
    setDeleting(true)
    try {
      await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
      router.push('/lecons')
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={editHref}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
        Modifier
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {deleting ? 'Suppression...' : 'Supprimer'}
      </button>
    </div>
  )
}
