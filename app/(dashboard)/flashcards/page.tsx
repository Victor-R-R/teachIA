export const dynamic = 'force-dynamic'

import { getFlashcards, getFlashcardReviewStats } from '@/lib/db'
import type { Domain, Level } from '@/lib/constants'
import { DOMAINS, LEVELS } from '@/lib/constants'
import { FlashcardViewer } from '@/components/flashcards/flashcard-viewer'
import { GenerateFlashcardButton } from '@/components/flashcards/generate-flashcard-button'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Amér. latine',
  didactique: 'Didactique',
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; level?: string }>
}) {
  const params = await searchParams
  const domain = DOMAINS.includes(params.domain as Domain) ? (params.domain as Domain) : undefined
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined

  const cards = await getFlashcards({ domain, level })
  const stats = await getFlashcardReviewStats(cards.map(c => c.id))
  const statsMap = new Map(stats.map(s => [s.flashcard_id, s]))

  const knownTotal = stats.filter(s => s.last_known === true).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Flashcards</h1>
        <p className="text-slate-500 text-sm">
          {cards.length} carte{cards.length > 1 ? 's' : ''}
          {knownTotal > 0 && (
            <span className="text-slate-400"> — {knownTotal} connues au dernier passage</span>
          )}
        </p>
      </div>

      {/* Filters + generate */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Domain filter */}
        <Link
          href={buildHref({ domain: undefined, level: params.level })}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            !domain
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600'
          }`}
        >
          Tous
        </Link>
        {DOMAINS.map(d => (
          <Link
            key={d}
            href={buildHref({ domain: domain === d ? undefined : d, level: params.level })}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              domain === d
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600'
            }`}
          >
            {DOMAIN_LABELS[d]}
          </Link>
        ))}

        {/* Level filter */}
        <div className="w-px h-4 bg-slate-200 mx-1" />
        {LEVELS.map(l => (
          <Link
            key={l}
            href={buildHref({ domain: params.domain, level: level === l ? undefined : l })}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              level === l
                ? 'bg-slate-700 border-slate-700 text-white'
                : 'border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700'
            }`}
          >
            Niv. {l}
          </Link>
        ))}

        <div className="ml-auto">
          <GenerateFlashcardButton />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CreditCard className="mx-auto h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm">Aucune carte pour ce filtre.</p>
          <p className="text-xs mt-1">Générez des cartes avec le bouton ci-dessus.</p>
        </div>
      ) : (
        <FlashcardViewer cards={cards} initialStats={statsMap} />
      )}
    </div>
  )
}

function buildHref({
  domain,
  level,
}: {
  domain?: string
  level?: string
}): string {
  const params = new URLSearchParams()
  if (domain) params.set('domain', domain)
  if (level) params.set('level', level)
  const qs = params.toString()
  return `/flashcards${qs ? `?${qs}` : ''}`
}
