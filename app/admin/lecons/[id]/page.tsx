import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonById, getCatalogExercises } from '@/lib/db'
import { LessonEditor } from './lesson-editor'

export default async function AdminLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const [lesson, catalogExercises] = await Promise.all([
    isNew ? null : getLessonById(Number(id)),
    getCatalogExercises(),
  ])

  if (!isNew && !lesson) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link href="/admin/lecons" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
          ← Retour aux leçons
        </Link>
      </div>
      <LessonEditor lesson={lesson ?? undefined} catalogExercises={catalogExercises} />
    </div>
  )
}
