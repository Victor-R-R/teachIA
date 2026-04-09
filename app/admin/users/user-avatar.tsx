import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const FEMALE_NAMES = new Set([
  'marie', 'sophie', 'julie', 'elise', 'élise', 'laura', 'emma', 'claire',
  'lucie', 'camille', 'alice', 'léa', 'lea', 'sarah', 'charlotte', 'manon',
  'inès', 'ines', 'chloé', 'chloe', 'amandine', 'aurelie', 'aurélie',
  'pauline', 'emilie', 'émilie', 'isabelle', 'nathalie', 'anne', 'sandrine',
  'florence', 'mathilde', 'céline', 'celine', 'virginie', 'laurence',
  'valerie', 'valérie', 'nadine', 'sylvie', 'carole', 'caroline', 'agnes',
  'agnès', 'beatrice', 'béatrice', 'melanie', 'mélanie', 'jessica', 'jennifer',
  'lisa', 'julia', 'eva', 'marina', 'elena', 'victoria', 'anna', 'clara',
  'margot', 'clémence', 'clemence', 'axelle', 'constance', 'diane', 'estelle',
  'marine', 'océane', 'oceane', 'elodie', 'élodie', 'laure', 'laetitia',
  'ambre', 'jade', 'juliette', 'anaïs', 'anais', 'noémie', 'noemie',
  'roxane', 'solène', 'solene', 'zoe', 'zoé', 'léonie', 'leonie',
  'salomé', 'salome', 'yasmine',
])

function guessGender(name: string | null): 'female' | 'male' {
  if (!name) return 'male'
  const firstName = name.trim().split(/\s+/)[0].toLowerCase()
  return FEMALE_NAMES.has(firstName) ? 'female' : 'male'
}

function FemaleIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <circle cx="16" cy="11" r="5" fill="currentColor" fillOpacity="0.9" />
      <path d="M11 11 Q10 5 16 4 Q22 5 21 11" fill="currentColor" fillOpacity="0.5" />
      <path d="M9 28 Q9 20 11 18 Q13 16 16 16 Q19 16 21 18 Q23 20 23 28Z" fill="currentColor" fillOpacity="0.9" />
    </svg>
  )
}

function MaleIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <circle cx="16" cy="11" r="5" fill="currentColor" fillOpacity="0.9" />
      <path d="M8 28 L8 22 Q8 16 16 16 Q24 16 24 22 L24 28Z" fill="currentColor" fillOpacity="0.9" />
    </svg>
  )
}

export function UserAvatar({ name }: { name: string | null }) {
  const isFemale = guessGender(name) === 'female'

  return (
    <Avatar size="sm">
      <AvatarFallback
        className={
          isFemale
            ? 'bg-gradient-to-b from-rose-400 to-pink-500 text-white'
            : 'bg-gradient-to-b from-blue-400 to-blue-600 text-white'
        }
      >
        {isFemale ? <FemaleIcon /> : <MaleIcon />}
      </AvatarFallback>
    </Avatar>
  )
}
