export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getExerciseById, saveAttempt, getAttemptStatsByExercises, getExerciseStatus } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExerciseProgressBar } from '@/components/exercises/exercise-progress-bar'
import { ExerciseQCM } from '@/components/exercises/exercise-qcm'
import { ExerciseVraiFaux } from '@/components/exercises/exercise-vrai-faux'
import { ExerciseLacunaire } from '@/components/exercises/exercise-lacunaire'
import { ExerciseQuizRunner } from '@/components/exercises/exercise-quiz-runner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DOMAIN_LABELS } from '@/lib/constants'

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [exercise, statsRows] = await Promise.all([
    getExerciseById(Number(id)),
    getAttemptStatsByExercises([Number(id)]),
  ])
  if (!exercise) notFound()
  const status = getExerciseStatus(statsRows[0])
  const attemptCount = statsRows[0]?.attempt_count ?? 0

  async function handleComplete(correct: boolean, timeSpent?: number) {
    'use server'
    await saveAttempt({
      exercise_id: exercise!.id,
      correct,
      time_spent: timeSpent ?? null,
      exercise_level: exercise!.level,
      exercise_domain: exercise!.domain,
    })
  }

  const questions = exercise.questions
  const isMultiQuestion = questions && questions.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/exercices"
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux exercices
      </Link>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-slate-500 border-slate-200 text-xs">
              {DOMAIN_LABELS[exercise.domain] ?? exercise.domain}
            </Badge>
            <Badge variant="outline" className="text-slate-500 border-slate-200 text-xs">
              {exercise.title ?? exercise.theme}
            </Badge>
            <Badge className="text-xs bg-violet-50 text-violet-600 border-violet-200">
              Niveau {exercise.level}
            </Badge>
            {isMultiQuestion && (
              <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs">
                {questions.length} questions
              </Badge>
            )}
          </div>
          {status !== 'not_started' && (
            <div className="mt-2 space-y-1.5">
              <div className={`text-xs font-medium flex items-center gap-1.5 ${
                status === 'completed' ? 'text-green-600' : 'text-amber-600'
              }`}>
                <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-current" />
                {status === 'completed' ? 'Réussi' : 'En cours'}
                {' · '}{attemptCount} tentative{attemptCount > 1 ? 's' : ''}
              </div>
              <ExerciseProgressBar status={status} height={4} />
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isMultiQuestion ? (
            <ExerciseQuizRunner
              title={exercise.title ?? exercise.theme}
              questions={questions}
              onComplete={handleComplete}
            />
          ) : (
            <>
              {exercise.type === 'qcm' && exercise.options && (
                <ExerciseQCM
                  id={exercise.id}
                  question={exercise.question}
                  options={exercise.options as string[]}
                  answer={exercise.answer}
                  explanation={exercise.explanation}
                  onComplete={handleComplete}
                />
              )}
              {exercise.type === 'vrai_faux' && (
                <ExerciseVraiFaux
                  id={exercise.id}
                  question={exercise.question}
                  answer={exercise.answer}
                  explanation={exercise.explanation}
                  onComplete={handleComplete}
                />
              )}
              {exercise.type === 'lacunaire' && (
                <ExerciseLacunaire
                  id={exercise.id}
                  question={exercise.question}
                  answer={exercise.answer}
                  explanation={exercise.explanation}
                  onComplete={handleComplete}
                />
              )}
              {!['qcm', 'vrai_faux', 'lacunaire'].includes(exercise.type) && (
                <p className="text-slate-500 text-sm">
                  Type d&apos;exercice &quot;{exercise.type}&quot; — interface à venir.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
