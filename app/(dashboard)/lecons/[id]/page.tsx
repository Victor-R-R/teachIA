export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonById } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { DOMAIN_LABELS, LEVEL_COLORS } from '@/lib/constants'
import { SimpleMarkdown } from '@/components/lessons/simple-markdown'
import { LessonOwnerActions } from '@/components/lessons/lesson-owner-actions'
import { cn } from '@/lib/utils'

export default async function LeconPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [lesson, userId] = await Promise.all([
    getLessonById(Number(id)),
    getEffectiveUserId(),
  ])
  if (!lesson) notFound()

  const isOwner = lesson.user_id !== null && lesson.user_id === userId

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/lecons"
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux leçons
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              {DOMAIN_LABELS[lesson.domain] ?? lesson.domain}
            </Badge>
            <Badge className={cn('text-xs', LEVEL_COLORS[lesson.level])}>
              {lesson.level}
            </Badge>
            {lesson.user_id !== null && (
              <Badge variant="outline" className="text-xs text-violet-600 border-violet-200 bg-violet-50">
                Ma leçon
              </Badge>
            )}
          </div>
          {isOwner && (
            <LessonOwnerActions
              lessonId={lesson.id}
              editHref={`/lecons/${lesson.id}/edit`}
            />
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <SimpleMarkdown content={lesson.content} />
      </div>

      {/* Linked exercises */}
      {lesson.exercises.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Exercices pour pratiquer ({lesson.exercises.length})
          </h2>
          <div className="grid gap-2">
            {lesson.exercises.map((ex) => (
              <Link key={ex.id} href={`/exercices/${ex.id}`}>
                <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-700 line-clamp-1">
                        {ex.title ?? ex.question}
                      </p>
                      <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
