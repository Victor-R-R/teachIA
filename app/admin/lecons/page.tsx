import Link from 'next/link'
import { getLessons } from '@/lib/db'
import { DOMAIN_LABELS, LEVEL_COLORS } from '@/lib/constants'
import { GenerateLessonButton } from '@/components/lessons/generate-lesson-button'
import { SeedLessonsButton } from './seed-button'

export default async function AdminLeconsPage() {
  const lessons = await getLessons()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leçons ({lessons.length})</h1>
        <div className="flex items-center gap-3">
          <SeedLessonsButton />
          <GenerateLessonButton />
        </div>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune leçon. Créez-en une pour la lier aux exercices.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">Titre</th>
                <th className="px-3 py-2 text-left font-medium">Domaine</th>
                <th className="px-3 py-2 text-left font-medium">Niveau</th>
                <th className="px-3 py-2 text-left font-medium">Exercices</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-muted/50">
                  <td className="px-3 py-2 text-muted-foreground">{lesson.id}</td>
                  <td className="px-3 py-2 font-medium max-w-xs truncate">{lesson.title}</td>
                  <td className="px-3 py-2">{DOMAIN_LABELS[lesson.domain] ?? lesson.domain}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${LEVEL_COLORS[lesson.level]}`}>
                      {lesson.level}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{lesson.exercise_count ?? 0}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/lecons/${lesson.id}`}
                      className="text-violet-600 hover:underline text-xs"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
