export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getLessons, getUserLessons } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookMarked, ArrowRight } from 'lucide-react'
import { DOMAIN_LABELS, DOMAIN_COLORS, LEVEL_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { GenerateLessonButton } from '@/components/lessons/generate-lesson-button'

const DOMAIN_ORDER = ['langue', 'civi_espagne', 'civi_latam', 'didactique'] as const

function LessonCard({ lesson, href }: { lesson: { id: number; title: string; level: string; exercise_count?: number }; href: string }) {
  return (
    <Link href={href} className="block w-full">
      <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-50 border border-violet-100 shrink-0">
                <BookMarked className="h-4 w-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 text-sm font-medium truncate">{lesson.title}</p>
                {lesson.exercise_count ? (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lesson.exercise_count} exercice{lesson.exercise_count > 1 ? 's' : ''} liés
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={cn('text-xs', LEVEL_COLORS[lesson.level])}>
                {lesson.level}
              </Badge>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function LeconsPage() {
  const userId = await getEffectiveUserId()
  const [catalogLessons, userLessons] = await Promise.all([
    getLessons(),
    getUserLessons(userId),
  ])

  const byDomain = catalogLessons.reduce<Record<string, typeof catalogLessons>>((acc, lesson) => {
    if (!acc[lesson.domain]) acc[lesson.domain] = []
    acc[lesson.domain].push(lesson)
    return acc
  }, {})

  const totalCatalog = catalogLessons.length

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Leçons</h1>
        <p className="text-slate-500 text-sm">
          {totalCatalog} leçon{totalCatalog > 1 ? 's' : ''} catalogue — étudie la théorie avant les exercices
        </p>
      </div>

      {/* Create button */}
      <div className="mb-6">
        <GenerateLessonButton />
      </div>

      {/* User's own lessons */}
      {userLessons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Mes leçons ({userLessons.length})
          </h2>
          <div className="grid gap-3">
            {userLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} href={`/lecons/${lesson.id}`} />
            ))}
          </div>
        </div>
      )}

      {/* Catalogue lessons by domain */}
      {totalCatalog === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <BookMarked className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p>Aucune leçon catalogue disponible.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {DOMAIN_ORDER.map((domain) => {
            const domainLessons = byDomain[domain]
            if (!domainLessons || domainLessons.length === 0) return null
            return (
              <div key={domain}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', DOMAIN_COLORS[domain])} />
                  {DOMAIN_LABELS[domain] ?? domain} ({domainLessons.length})
                </h2>
                <div className="grid gap-3">
                  {domainLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} href={`/lecons/${lesson.id}`} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
