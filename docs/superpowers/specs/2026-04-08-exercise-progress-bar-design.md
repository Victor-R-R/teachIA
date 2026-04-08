# Design : Barre de progression des exercices

**Date** : 2026-04-08
**Scope** : Page liste `/exercices` + page détail `/exercices/[id]`

---

## Objectif

Afficher visuellement l'état de progression pour chaque exercice :
- **Pas commencé** : aucune tentative enregistrée
- **En cours** : au moins une tentative, aucune correcte
- **Réussi** : au moins une tentative correcte

Donner aussi une vue globale du nombre d'exercices réussis sur la page liste.

---

## Couche données

### Nouvelle fonction `getAttemptStatsByExercises`

Fichier : `lib/db.ts`

```ts
export type AttemptStats = {
  exercise_id: number
  attempt_count: number
  has_correct: boolean
}

export async function getAttemptStatsByExercises(
  ids: number[]
): Promise<AttemptStats[]>
```

Requête SQL :
```sql
SELECT
  exercise_id,
  COUNT(*)::int AS attempt_count,
  bool_or(correct) AS has_correct
FROM exercise_attempts
WHERE exercise_id = ANY($1)
GROUP BY exercise_id
```

- Une seule requête pour toute la page (pas de N+1)
- Retourne seulement les exercices avec au moins une tentative
- Les exercices absents du résultat = pas commencés

### Logique d'état (helper)

```ts
type ExerciseStatus = 'not_started' | 'in_progress' | 'completed'

function getStatus(stats: AttemptStats | undefined): ExerciseStatus {
  if (!stats || stats.attempt_count === 0) return 'not_started'
  if (stats.has_correct) return 'completed'
  return 'in_progress'
}
```

---

## Page `/exercices`

### Barre globale

Sous le compteur `X exercice(s) disponibles`, ajouter :

```
[████████░░░░░░░░░░░░] 4 / 12 réussis
```

- Barre `w-full`, hauteur 6px, arrondie (`rounded-full`)
- Fond : `bg-slate-100`
- Remplissage : `bg-violet-500` (couleur accent du projet)
- Texte "X / Y réussis" aligné à droite, `text-xs text-slate-500`
- Masquée si aucun exercice réussi (0/Y)

### Barre par carte

Fine barre de 3px en bas de chaque `CardContent` :

| État | Couleur barre | Largeur |
|---|---|---|
| Pas commencé | aucune barre | — |
| En cours | `bg-amber-400` | 50% |
| Réussi | `bg-green-500` | 100% |

Implémentée comme un `div` absolu en bas de la carte, dans un conteneur `relative` sur `CardContent`.

---

## Page `/exercices/[id]`

### Indicateur dans `CardHeader`

Après les badges existants ([Domaine] [Thème] [Niveau]), ajouter une ligne de statut conditionnelle :

| État | Affichage |
|---|---|
| Pas commencé | rien |
| En cours | `● En cours · X tentative(s)` en orange |
| Réussi | `● Réussi · X tentative(s)` en vert |

Suivi d'une barre fine (4px) sous cette ligne, même logique couleur.

### Données

Appel à `getAttemptStatsByExercises([exercise.id])` dans le Server Component de la page.

---

## Composant partagé

Extraire `ExerciseProgressBar` dans `components/exercises/exercise-progress-bar.tsx` :

```ts
interface ExerciseProgressBarProps {
  status: ExerciseStatus
  height?: number  // default: 3
}
```

Utilisé à la fois dans les cartes de la liste et dans la page détail.

---

## Ce qui ne change pas

- Logique `saveAttempt` / `handleComplete` inchangée
- Composants `ExerciseQCM`, `ExerciseVraiFaux`, `ExerciseLacunaire` inchangés
- Aucun state client ajouté — tout est Server Component
- Le statut se met à jour au rechargement de page après une tentative

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `lib/db.ts` | Ajouter `getAttemptStatsByExercises` |
| `app/(dashboard)/exercices/page.tsx` | Barre globale + stats par carte |
| `app/(dashboard)/exercices/[id]/page.tsx` | Indicateur statut dans header |
| `components/exercises/exercise-progress-bar.tsx` | Nouveau composant partagé |
