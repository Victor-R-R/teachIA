import { getAppSettings } from '@/lib/admin-db'
import { saveSettingsAction } from './actions'

const SETTING_LABELS: Record<string, { label: string; description: string }> = {
  xp_gain_A: { label: 'XP gain niveau A', description: 'XP accordé pour un exercice niveau A (facile)' },
  xp_gain_B: { label: 'XP gain niveau B', description: 'XP accordé pour un exercice niveau B (intermédiaire)' },
  xp_gain_C: { label: 'XP gain niveau C', description: 'XP accordé pour un exercice niveau C (difficile)' },
  xp_decay_per_day: { label: 'Pénalité XP / jour', description: 'XP perdu par jour d\'inactivité' },
  default_daily_goal_min: { label: 'Objectif quotidien (min)', description: 'Durée d\'étude journalière par défaut en minutes' },
}

const ORDERED_KEYS = [
  'xp_gain_A',
  'xp_gain_B',
  'xp_gain_C',
  'xp_decay_per_day',
  'default_daily_goal_min',
]

export default async function SettingsPage() {
  const settings = await getAppSettings()

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold">Paramètres globaux</h1>
      <p className="text-sm text-muted-foreground">
        Ces paramètres s&apos;appliquent à tous les utilisateurs de la plateforme.
      </p>

      <form action={saveSettingsAction} className="space-y-5">
        {ORDERED_KEYS.map((key) => {
          const meta = SETTING_LABELS[key]
          return (
            <div key={key} className="space-y-1">
              <label htmlFor={key} className="block text-sm font-medium">
                {meta?.label ?? key}
              </label>
              {meta?.description && (
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              )}
              <input
                id={key}
                name={key}
                type="number"
                defaultValue={settings[key] ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          )
        })}

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  )
}
