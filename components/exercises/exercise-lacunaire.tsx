'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExerciseFeedback } from './exercise-feedback'

type Props = {
  id: number
  question: string  // Contains "___" as placeholder
  answer: string
  explanation: string
  onComplete: (correct: boolean) => void | Promise<void>
}

export function ExerciseLacunaire({ id, question, answer, explanation, onComplete }: Props) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string>()

  const parts = question.split('___')

  async function handleSubmit() {
    if (!value.trim()) return
    setSubmitted(true)
    const correct = value.trim().toLowerCase() === answer.toLowerCase()
    await onComplete(correct)

    if (!correct) {
      try {
        const res = await fetch('/api/exercises/correct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseId: id, userAnswer: value, correctAnswer: answer }),
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

  if (submitted) {
    return (
      <ExerciseFeedback
        correct={value.trim().toLowerCase() === answer.toLowerCase()}
        correctAnswer={answer}
        explanation={explanation}
        aiExplanation={aiExplanation}
        onNext={() => window.location.reload()}
      />
    )
  }

  if (parts.length !== 2) {
    return <p className="text-red-400 text-sm">Format de question invalide.</p>
  }

  return (
    <div className="space-y-4">
      <div className="text-slate-900 text-base font-medium leading-relaxed flex flex-wrap items-center gap-2">
        {parts[0]}
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="inline-block w-40 bg-white border-slate-300 text-slate-900 h-8 px-2 text-sm"
          placeholder="votre réponse"
          autoFocus
        />
        {parts[1]}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}
