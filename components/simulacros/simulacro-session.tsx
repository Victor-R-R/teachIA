'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, Clock, ChevronDown, ChevronUp } from 'lucide-react'

type Criterion = {
  note: number
  commentaire: string
  points_forts: string[]
  points_faibles: string[]
}

type Feedback = {
  score: number
  appreciation: string
  langue: Criterion
  methodologie: Criterion
  contenu: Criterion
  conseil_prioritaire: string
}

const APPRECIATION_LABELS: Record<string, string> = {
  insuffisant: 'Insuffisant',
  passable: 'Passable',
  assez_bien: 'Assez bien',
  bien: 'Bien',
  tres_bien: 'Très bien',
}

const APPRECIATION_COLORS: Record<string, string> = {
  insuffisant: 'bg-red-50 border-red-200 text-red-700',
  passable: 'bg-orange-50 border-orange-200 text-orange-700',
  assez_bien: 'bg-amber-50 border-amber-200 text-amber-700',
  bien: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  tres_bien: 'bg-violet-50 border-violet-200 text-violet-700',
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function CriterionCard({
  label,
  note,
  max,
  criterion,
}: {
  label: string
  note: number
  max: number
  criterion: Criterion
}) {
  const [open, setOpen] = useState(false)
  const pct = note / max
  const barColor = pct >= 0.7 ? 'bg-emerald-500' : pct >= 0.5 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <span className="text-sm font-semibold text-slate-900 shrink-0">
              {note}/{max}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${(note / max) * 100}%` }}
            />
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{criterion.commentaire}</p>

          {criterion.points_forts.length > 0 && (
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1">Points forts</div>
              <ul className="space-y-1">
                {criterion.points_forts.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                    <span className="text-emerald-500 shrink-0">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {criterion.points_faibles.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-600 mb-1">À améliorer</div>
              <ul className="space-y-1">
                {criterion.points_faibles.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                    <span className="text-red-400 shrink-0">−</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FeedbackPanel({
  feedback,
  type,
}: {
  feedback: Feedback
  type: string
}) {
  const scoreColor =
    feedback.score >= 14
      ? 'text-emerald-600'
      : feedback.score >= 10
        ? 'text-amber-600'
        : 'text-red-600'

  const isTranslation = type === 'theme' || type === 'version'

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-center">
          <div className={`text-4xl font-bold ${scoreColor}`}>{feedback.score}</div>
          <div className="text-xs text-slate-400">/20</div>
        </div>
        <div>
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              APPRECIATION_COLORS[feedback.appreciation] ?? 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {APPRECIATION_LABELS[feedback.appreciation] ?? feedback.appreciation}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isTranslation
              ? 'Langue · Fidélité · Style'
              : 'Langue · Méthodo · Contenu'}
          </p>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-2">
        <CriterionCard
          label="Langue"
          note={feedback.langue.note}
          max={isTranslation ? 8 : 7}
          criterion={feedback.langue}
        />
        <CriterionCard
          label={isTranslation ? 'Fidélité sémantique' : 'Méthodologie'}
          note={feedback.methodologie.note}
          max={isTranslation ? 6 : 7}
          criterion={feedback.methodologie}
        />
        <CriterionCard
          label={isTranslation ? 'Qualité stylistique' : 'Contenu'}
          note={feedback.contenu.note}
          max={6}
          criterion={feedback.contenu}
        />
      </div>

      {/* Priority advice */}
      <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
        <div className="text-xs font-medium text-violet-700 mb-1">Conseil prioritaire</div>
        <p className="text-sm text-violet-800 leading-relaxed">{feedback.conseil_prioritaire}</p>
      </div>
    </div>
  )
}

interface Props {
  id: number
  type: string
  initialContent: string
  initialFeedback: string | null
  initialScore: number | null
}

export function SimulacroSession({
  id,
  type,
  initialContent,
  initialFeedback,
  initialScore,
}: Props) {
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(
    initialFeedback ? (JSON.parse(initialFeedback) as Feedback) : null
  )
  const [score, setScore] = useState<number | null>(initialScore)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer — only runs while not yet submitted
  useEffect(() => {
    if (feedback !== null) return
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [feedback])

  async function handleSubmit() {
    if (!content.trim() || submitting) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    setSubmitting(true)
    try {
      const res = await fetch('/api/simulacros/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content }),
      })
      if (!res.ok) return
      const data = await res.json() as { feedback: Feedback; score: number }
      setFeedback(data.feedback)
      setScore(data.score)
    } finally {
      setSubmitting(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-4">
      {/* Timer + word count */}
      {feedback === null && (
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsed)}
          </span>
          <span>{wordCount} mot{wordCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {feedback !== null ? (
        /* Feedback view */
        <FeedbackPanel feedback={feedback} type={type} />
      ) : (
        /* Writing view */
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Rédigez votre réponse ici…"
            className="w-full min-h-[320px] text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl p-4 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent leading-relaxed font-mono"
            disabled={submitting}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Soumettre déclenche la correction IA — l&apos;action est définitive.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Correction…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Soumettre</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
