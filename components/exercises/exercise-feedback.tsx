'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Props = {
  correct: boolean
  correctAnswer: string
  explanation: string
  aiExplanation?: string
  onNext: () => void
}

export function ExerciseFeedback({ correct, correctAnswer, explanation, aiExplanation, onNext }: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className={`flex items-center gap-2 text-sm font-medium ${correct ? 'text-green-400' : 'text-red-400'}`}>
        {correct
          ? <><CheckCircle className="h-5 w-5" /> Correct !</>
          : <><XCircle className="h-5 w-5" /> Incorrect</>
        }
      </div>

      {!correct && (
        <p className="text-sm text-zinc-400">
          Bonne réponse : <span className="text-zinc-200 font-medium">{correctAnswer}</span>
        </p>
      )}

      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {aiExplanation ?? explanation}
          </p>
        </CardContent>
      </Card>

      <Button onClick={onNext} className="w-full bg-violet-600 hover:bg-violet-700">
        Exercice suivant →
      </Button>
    </div>
  )
}
