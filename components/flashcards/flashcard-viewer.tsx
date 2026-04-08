'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, RotateCcw, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import type { Flashcard, FlashcardReviewStat } from '@/lib/db'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Amér. latine',
  didactique: 'Didactique',
}

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-50 text-red-600 border-red-200',
  B: 'bg-amber-50 text-amber-600 border-amber-200',
  C: 'bg-green-50 text-green-600 border-green-200',
}

type SessionResult = { known: boolean }

async function postReview(flashcard_id: number, known: boolean) {
  await fetch('/api/flashcards/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flashcard_id, known }),
  })
}

export function FlashcardViewer({
  cards,
  initialStats,
}: {
  cards: Flashcard[]
  initialStats: Map<number, FlashcardReviewStat>
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [session, setSession] = useState<Map<number, SessionResult>>(new Map())
  const [done, setDone] = useState(false)

  const card = cards[index]
  const total = cards.length
  const reviewedCount = session.size
  const knownCount = [...session.values()].filter(r => r.known).length
  const dbStat = card ? initialStats.get(card.id) : undefined

  const flip = useCallback(() => setFlipped(f => !f), [])

  const handleReview = useCallback(async (known: boolean) => {
    if (!card) return
    setSession(prev => new Map(prev).set(card.id, { known }))
    await postReview(card.id, known)

    if (index < total - 1) {
      setFlipped(false)
      setTimeout(() => setIndex(i => i + 1), 120)
    } else {
      setDone(true)
    }
  }, [card, index, total])

  const goTo = useCallback((next: number) => {
    setFlipped(false)
    setTimeout(() => setIndex(next), 120)
  }, [])

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-base">Aucune carte pour ce filtre.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
          <Trophy className="h-7 w-7 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Session terminée</h2>
          <p className="text-slate-500 text-sm">
            {knownCount} / {total} cartes connues
            {knownCount === total && ' — parfait !'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-300 text-slate-600"
            onClick={() => { setIndex(0); setFlipped(false); setSession(new Map()); setDone(false) }}
          >
            Recommencer
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => {
              const toReview = cards
                .map((c, i) => ({ c, i }))
                .filter(({ c }) => session.get(c.id)?.known === false)
              if (toReview.length > 0) {
                setIndex(toReview[0].i)
                setFlipped(false)
                setSession(new Map())
                setDone(false)
              }
            }}
            disabled={knownCount === total}
          >
            Revoir les ratées ({total - knownCount})
          </Button>
        </div>
      </div>
    )
  }

  const sessionResult = session.get(card.id)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-violet-500 rounded-full h-full transition-all duration-300"
            style={{ width: total > 0 ? `${(reviewedCount / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0 tabular-nums">
          {index + 1} / {total}
        </span>
        {knownCount > 0 && (
          <span className="text-xs text-green-600 shrink-0 tabular-nums">
            ✓ {knownCount}
          </span>
        )}
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none mb-6"
        style={{ perspective: '1200px', minHeight: '280px' }}
        onClick={flip}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-2xl border border-slate-200 bg-violet-50 flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-auto">
              <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[card.level]}`}>
                {card.level}
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                {DOMAIN_LABELS[card.domain] ?? card.domain}
              </Badge>
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-slate-900 text-xl font-medium text-center leading-snug">
                {card.front}
              </p>
            </div>
            <p className="text-slate-400 text-xs text-center mt-auto">
              Cliquer pour retourner
            </p>
          </div>

          {/* Back */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-2xl border border-slate-200 bg-white flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[card.level]}`}>
                {card.level}
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                {DOMAIN_LABELS[card.domain] ?? card.domain}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {card.back}
              </p>
            </div>
            {dbStat && dbStat.total > 0 && (
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Historique : {dbStat.known_count}/{dbStat.total} fois correct
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Review buttons — visible only when flipped */}
      <div
        className="flex gap-3 mb-4 transition-opacity duration-200"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}
      >
        <Button
          onClick={() => handleReview(false)}
          variant="outline"
          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
          disabled={!!sessionResult}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          À revoir
        </Button>
        <Button
          onClick={() => handleReview(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={!!sessionResult}
        >
          <Check className="h-4 w-4 mr-2" />
          Connu
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="text-slate-400 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        <div className="flex gap-1">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index
                  ? 'bg-violet-500 w-3'
                  : session.get(c.id)?.known === true
                    ? 'bg-green-400'
                    : session.get(c.id)?.known === false
                      ? 'bg-amber-400'
                      : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => index < total - 1 ? goTo(index + 1) : setDone(true)}
          className="text-slate-400 hover:text-slate-700"
        >
          {index < total - 1 ? 'Suivant' : 'Terminer'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
