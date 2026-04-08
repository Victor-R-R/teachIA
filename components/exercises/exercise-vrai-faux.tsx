'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string
  answer: string
  explanation: string
  onComplete: (correct: boolean) => void | Promise<void>
}

export function ExerciseVraiFaux({ id, question, answer, explanation, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()

  async function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    const correct = selected === answer
    await onComplete(correct)

    if (!correct) {
      try {
        const res = await fetch('/api/exercises/correct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseId: id, userAnswer: selected, correctAnswer: answer }),
        })
        if (res.ok) {
          const data = await res.json()
          setAiExplanation(data.explanation)
        }
      } catch {
        // AI explanation unavailable — static explanation shown as fallback
      }
    }
  }

  if (submitted && selected) {
    return (
      <ExerciseFeedback
        correct={selected === answer}
        correctAnswer={answer}
        explanation={explanation}
        aiExplanation={aiExplanation}
        onNext={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-900 text-base font-medium leading-relaxed">{question}</p>
      <div className="flex gap-3 mt-4">
        {['Vrai', 'Faux'].map(choice => (
          <button
            key={choice}
            type="button"
            aria-pressed={selected === choice}
            onClick={() => setSelected(choice)}
            className={`flex-1 py-4 rounded-lg border text-sm font-medium transition-colors ${
              selected === choice
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full mt-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
