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
      <div className={`flex items-center gap-2 text-sm font-medium ${correct ? 'text-green-600' : 'text-red-600'}`}>
        {correct
          ? <><CheckCircle className="h-5 w-5" /> Correct !</>
          : <><XCircle className="h-5 w-5" /> Incorrect</>
        }
      </div>

      {!correct && (
        <p className="text-sm text-slate-500">
          Bonne réponse : <span className="text-slate-800 font-medium">{correctAnswer}</span>
        </p>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
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
