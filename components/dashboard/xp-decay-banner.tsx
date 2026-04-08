'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function XpDecayBanner({ xpLost }: { xpLost: number }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const days = Math.round(xpLost / 10)

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <span className="mt-0.5 shrink-0">⚠️</span>
      <p className="flex-1 leading-relaxed">
        Tu as perdu <strong>{xpLost} XP</strong> pour {days} jour{days > 1 ? 's' : ''} sans activité.
        Travaille chaque jour pour conserver ta progression !
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        className="shrink-0 rounded p-0.5 hover:bg-amber-100 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
