'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string
  options: string[]
  answer: string
  explanation: string
  onComplete: (correct: boolean, timeSpent: number) => void | Promise<void>
}

export function ExerciseQCM({ id, question, options, answer, explanation, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()
  const startRef = useRef(Date.now())

  async function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    const correct = selected === answer
    const timeSpent = Math.floor((Date.now() - startRef.current) / 1000)
    await onComplete(correct, timeSpent)

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
    <div className="space-y-3">
      <p className="text-slate-900 text-base font-medium leading-relaxed">{question}</p>
      <div className="space-y-2 mt-4">
        {options.map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={selected === option}
            onClick={() => setSelected(option)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
              selected === option
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full mt-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
