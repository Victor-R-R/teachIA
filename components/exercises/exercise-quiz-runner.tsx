'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { QuestionItem } from '@/lib/db'

type Phase = 'answering' | 'feedback' | 'saving' | 'results'

type Props = {
  title: string
  questions: QuestionItem[]
  onComplete: (correct: boolean, timeSpent: number, scoreCorrect: number, scoreTotal: number) => Promise<void>
}

export function ExerciseQuizRunner({ title, questions, onComplete }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState('')
  const [lastCorrect, setLastCorrect] = useState(false)
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 })
  const [saveError, setSaveError] = useState(false)
  const answersRef = useRef<boolean[]>([])
  const startRef = useRef(Date.now())

  const q = questions[index]
  const total = questions.length

  function isCorrect(): boolean {
    if (q.type === 'lacunaire') return selected.trim().toLowerCase() === q.answer.toLowerCase()
    return selected === q.answer
  }

  function handleSubmit() {
    if (!selected.trim()) return
    const correct = isCorrect()
    setLastCorrect(correct)
    answersRef.current = [...answersRef.current, correct]
    setPhase('feedback')
  }

  async function handleNext() {
    if (index < total - 1) {
      setIndex(i => i + 1)
      setSelected('')
      setPhase('answering')
    } else {
      setPhase('saving')
      const correctCount = answersRef.current.filter(Boolean).length
      const timeSpent = Math.floor((Date.now() - startRef.current) / 1000)
      const passed = correctCount / total >= 0.6
      try {
        await onComplete(passed, timeSpent, correctCount, total)
      } catch (e) {
        console.error('Failed to save exercise result:', e)
        setSaveError(true)
      } finally {
        setFinalScore({ correct: correctCount, total })
        setPhase('results')
      }
    }
  }

  function handleRetry() {
    setIndex(0)
    setSelected('')
    setPhase('answering')
    setLastCorrect(false)
    setSaveError(false)
    answersRef.current = []
    startRef.current = Date.now()
  }

  if (phase === 'saving') {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Enregistrement...</span>
      </div>
    )
  }

  if (phase === 'results') {
    const pct = finalScore.correct / finalScore.total
    const passed = pct >= 0.6
    return (
      <div className="space-y-6 text-center py-2">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${passed ? 'bg-green-100' : 'bg-amber-100'}`}>
          <span className={`text-2xl font-bold ${passed ? 'text-green-700' : 'text-amber-700'}`}>
            {finalScore.correct}/{finalScore.total}
          </span>
        </div>
        <div>
          <p className={`text-lg font-semibold ${passed ? 'text-green-700' : 'text-amber-700'}`}>
            {passed ? '¡ Bravo !' : 'Continue à t\'entraîner'}
          </p>
          <p className="text-slate-500 text-sm mt-1">{Math.round(pct * 100)}% de bonnes réponses</p>
        </div>
        {saveError && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            Résultats non sauvegardés (problème réseau). Tes réponses sont affichées ci-dessus.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Réessayer
          </Button>
          <Button onClick={() => router.push('/exercices')} className="bg-violet-600 hover:bg-violet-700 gap-2">
            Retour aux exercices <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <ProgressBar current={index + 1} total={total} />
        <div className={`flex items-center gap-2 text-sm font-semibold ${lastCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {lastCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {lastCorrect ? 'Correct !' : 'Incorrect'}
        </div>
        {!lastCorrect && (
          <p className="text-sm text-slate-500">
            Bonne réponse : <span className="font-medium text-slate-800">{q.answer}</span>
          </p>
        )}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
        </div>
        <Button onClick={handleNext} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
          {index === total - 1 ? 'Voir les résultats' : 'Question suivante'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Answering phase
  const lacunaireparts = q.type === 'lacunaire' ? q.question.split('___') : null

  return (
    <div className="space-y-4">
      <ProgressBar current={index + 1} total={total} />

      {q.type === 'qcm' && (
        <>
          <p className="text-slate-900 text-base font-medium leading-relaxed">{q.question}</p>
          <div className="space-y-2">
            {(q.options ?? []).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  selected === opt
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'vrai_faux' && (
        <>
          <p className="text-slate-900 text-base font-medium leading-relaxed">{q.question}</p>
          <div className="flex gap-3">
            {['Vrai', 'Faux'].map(choice => (
              <button
                key={choice}
                type="button"
                onClick={() => setSelected(choice)}
                className={`flex-1 py-4 rounded-lg border text-sm font-medium transition-colors ${
                  selected === choice
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'lacunaire' && (
        <div className="space-y-3">
          {lacunaireparts && lacunaireparts.length === 2 ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-medium text-slate-900 leading-relaxed">
              <span>{lacunaireparts[0]}</span>
              <Input
                value={selected}
                onChange={e => setSelected(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="inline-block w-36 h-8 px-2 text-sm"
                placeholder="votre réponse"
                autoFocus
              />
              <span>{lacunaireparts[1]}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-900 text-base font-medium leading-relaxed">{q.question}</p>
              <Input
                value={selected}
                onChange={e => setSelected(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full text-sm"
                placeholder="votre réponse"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selected.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
      >
        Valider
      </Button>
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Question {current}/{total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
