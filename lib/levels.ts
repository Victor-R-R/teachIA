export const LEVEL_TITLES: Record<number, string> = {
  1: 'Débutant',
  2: 'Apprenti',
  3: 'Explorateur',
  4: 'Érudit',
  5: 'Lettré',
  6: 'Expert',
  7: 'Savant',
  8: 'Maître',
  9: 'Virtuose',
}

/** Titre du niveau (10+ → 'Professeur') */
export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? 'Professeur'
}

/** XP minimum pour atteindre le niveau n */
export function getXpThreshold(level: number): number {
  return level * level * 100
}

/** Message motivant selon le pourcentage d'objectif atteint (0–100) */
export function getDailyMessage(pct: number): string {
  if (pct === 0) return "C'est parti ! 💪"
  if (pct < 34) return 'Bon début, continue !'
  if (pct < 67) return 'Tu es lancé·e, reste focus !'
  if (pct < 100) return 'Plus que quelques minutes ! 🔥'
  return "Objectif atteint aujourd'hui ! 🏆"
}
