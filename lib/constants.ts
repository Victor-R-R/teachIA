export const DOMAINS = ['langue', 'civi_espagne', 'civi_latam', 'didactique'] as const
export type Domain = typeof DOMAINS[number]

export const LEVELS = ['A', 'B', 'C'] as const
export type Level = typeof LEVELS[number]

export const EXERCISE_TYPES = ['qcm', 'vrai_faux', 'lacunaire', 'chronologie', 'association'] as const
export type ExerciseType = typeof EXERCISE_TYPES[number]

export const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Amér. latine',
  didactique: 'Didactique',
}

export const DOMAIN_COLORS: Record<string, string> = {
  langue: 'bg-violet-500',
  civi_espagne: 'bg-blue-500',
  civi_latam: 'bg-emerald-500',
  didactique: 'bg-amber-500',
}

export const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-green-50 text-green-600 border-green-200',
  B: 'bg-amber-50 text-amber-600 border-amber-200',
  C: 'bg-red-50 text-red-600 border-red-200',
}
