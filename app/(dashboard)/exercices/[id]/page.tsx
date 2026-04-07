import { notFound } from 'next/navigation'
import { getExerciseById, saveAttempt } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExerciseQCM } from '@/components/exercises/exercise-qcm'
import { ExerciseVraiFaux } from '@/components/exercises/exercise-vrai-faux'
import { ExerciseLacunaire } from '@/components/exercises/exercise-lacunaire'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civilisation Espagne',
  civi_latam: 'Amérique latine',
  didactique: 'Didactique',
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = await getExerciseById(Number(id))
  if (!exercise) notFound()

  async function handleComplete(correct: boolean) {
    'use server'
    await saveAttempt({ exercise_id: exercise!.id, correct, time_spent: null })
  }

  const sharedProps = {
    id: exercise.id,
    question: exercise.question,
    answer: exercise.answer,
    explanation: exercise.explanation,
    onComplete: handleComplete,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/exercices"
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux exercices
      </Link>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
              {DOMAIN_LABELS[exercise.domain] ?? exercise.domain}
            </Badge>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
              {exercise.theme}
            </Badge>
            <Badge className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
              Niveau {exercise.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {exercise.type === 'qcm' && exercise.options && (
            <ExerciseQCM {...sharedProps} options={exercise.options as string[]} />
          )}
          {exercise.type === 'vrai_faux' && (
            <ExerciseVraiFaux {...sharedProps} />
          )}
          {exercise.type === 'lacunaire' && (
            <ExerciseLacunaire {...sharedProps} />
          )}
          {!['qcm', 'vrai_faux', 'lacunaire'].includes(exercise.type) && (
            <p className="text-zinc-400 text-sm">
              Type d&apos;exercice &quot;{exercise.type}&quot; — interface à venir.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
