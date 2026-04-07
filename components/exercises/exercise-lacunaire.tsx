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
    onComplete(correct)

    if (!correct) {
      const res = await fetch('/api/exercises/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: id, userAnswer: value, correctAnswer: answer }),
      })
      const data = await res.json()
      setAiExplanation(data.explanation)
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

  return (
    <div className="space-y-4">
      <div className="text-zinc-100 text-base font-medium leading-relaxed flex flex-wrap items-center gap-2">
        {parts[0]}
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="inline-block w-40 bg-zinc-800 border-zinc-600 text-zinc-100 h-8 px-2 text-sm"
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
