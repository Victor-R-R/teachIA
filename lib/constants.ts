export const DOMAINS = ['langue', 'civi_espagne', 'civi_latam', 'didactique'] as const
export type Domain = typeof DOMAINS[number]

export const LEVELS = ['A', 'B', 'C'] as const
export type Level = typeof LEVELS[number]

export const EXERCISE_TYPES = ['qcm', 'vrai_faux', 'lacunaire', 'chronologie', 'association'] as const
export type ExerciseType = typeof EXERCISE_TYPES[number]
