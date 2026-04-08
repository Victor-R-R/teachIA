'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ChevronRight, Loader2, Globe, GraduationCap, Languages, BookOpen } from 'lucide-react'

// ─── Questions du test de niveau ─────────────────────────────────────────────

type Question = {
  id: number
  domain: 'langue' | 'civi' | 'didactique'
  question: string
  options: string[]
  answer: string
}

const QUESTIONS: Question[] = [
  // Langue (5)
  {
    id: 1, domain: 'langue',
    question: 'Quelle est la forme correcte du subjonctif imparfait de "hablar" (3ème personne singulier) ?',
    options: ['hablara', 'hablare', 'hablaria', 'hablaría'],
    answer: 'hablara',
  },
  {
    id: 2, domain: 'langue',
    question: 'Sélectionne la préposition correcte : "Este regalo es ___ ti"',
    options: ['por', 'para', 'de', 'en'],
    answer: 'para',
  },
  {
    id: 3, domain: 'langue',
    question: '"La sopa ___ fría" — quel verbe utiliser ?',
    options: ['es', 'está', 'sea', 'esté'],
    answer: 'está',
  },
  {
    id: 4, domain: 'langue',
    question: 'Complète : "El libro ___ te presté es de Borges"',
    options: ['que', 'quien', 'cual', 'cuyo'],
    answer: 'que',
  },
  {
    id: 5, domain: 'langue',
    question: 'Comment exprime-t-on le superlatif relatif "le plus grand" en espagnol ?',
    options: ['el más grande', 'el mayor', 'el grande más', 'el grandísimo'],
    answer: 'el más grande',
  },
  // Civilisation (5)
  {
    id: 6, domain: 'civi',
    question: 'Quel général a mené le coup d\'état du 18 juillet 1936 en Espagne ?',
    options: ['Primo de Rivera', 'Francisco Franco', 'Manuel Azaña', 'José Antonio Primo'],
    answer: 'Francisco Franco',
  },
  {
    id: 7, domain: 'civi',
    question: 'En quelle année l\'Espagne a-t-elle adopté sa Constitution actuelle ?',
    options: ['1975', '1977', '1978', '1980'],
    answer: '1978',
  },
  {
    id: 8, domain: 'civi',
    question: 'Federico García Lorca appartient à quel mouvement littéraire ?',
    options: ['Modernismo', 'Generación del 27', 'Generación del 98', 'Romanticismo'],
    answer: 'Generación del 27',
  },
  {
    id: 9, domain: 'civi',
    question: 'Le mouvement zapatiste de 1994 a eu lieu dans quel État mexicain ?',
    options: ['Oaxaca', 'Guerrero', 'Chiapas', 'Yucatán'],
    answer: 'Chiapas',
  },
  {
    id: 10, domain: 'civi',
    question: 'Qui a écrit "Cien años de soledad" ?',
    options: ['Julio Cortázar', 'Mario Vargas Llosa', 'Gabriel García Márquez', 'Carlos Fuentes'],
    answer: 'Gabriel García Márquez',
  },
  // Didactique (5)
  {
    id: 11, domain: 'didactique',
    question: 'L\'approche communicative en ELE vise principalement à :',
    options: [
      'Mémoriser la grammaire',
      'Développer la compétence de communication',
      'Traduire des textes',
      'Apprendre le vocabulaire par listes',
    ],
    answer: 'Développer la compétence de communication',
  },
  {
    id: 12, domain: 'didactique',
    question: 'Selon le CECRL, combien de niveaux de compétence linguistique y a-t-il ?',
    options: ['4', '5', '6', '8'],
    answer: '6',
  },
  {
    id: 13, domain: 'didactique',
    question: 'Quelle est la différence entre évaluation formative et sommative ?',
    options: [
      'La formative note, la sommative oriente',
      'La formative oriente l\'apprentissage, la sommative mesure les acquis',
      'Elles sont identiques',
      'La formative est orale, la sommative écrite',
    ],
    answer: 'La formative oriente l\'apprentissage, la sommative mesure les acquis',
  },
  {
    id: 14, domain: 'didactique',
    question: 'L\'utilisation de documents authentiques en classe d\'ELE vise à :',
    options: [
      'Simplifier la langue',
      'Exposer les élèves à la langue réelle',
      'Éviter les erreurs',
      'Structurer la grammaire',
    ],
    answer: 'Exposer les élèves à la langue réelle',
  },
  {
    id: 15, domain: 'didactique',
    question: 'La compétence interculturelle en ELE comprend principalement :',
    options: [
      'La connaissance des règles grammaticales',
      'La capacité à interagir avec des locuteurs d\'autres cultures',
      'La mémorisation du vocabulaire',
      'La maîtrise de la phonétique',
    ],
    answer: 'La capacité à interagir avec des locuteurs d\'autres cultures',
  },
]

// ─── Calcul des niveaux ───────────────────────────────────────────────────────

function calcLevel(correct: number, total: number): 'A' | 'B' | 'C' {
  const pct = correct / total
  if (pct >= 0.8) return 'C'
  if (pct >= 0.6) return 'B'
  return 'A'
}

function calcLevels(answers: Record<number, string>) {
  const score = {
    langue: { correct: 0, total: 0 },
    civi: { correct: 0, total: 0 },
    didactique: { correct: 0, total: 0 },
  }
  for (const q of QUESTIONS) {
    score[q.domain].total++
    if (answers[q.id] === q.answer) score[q.domain].correct++
  }
  return {
    level_langue: calcLevel(score.langue.correct, score.langue.total),
    level_civi: calcLevel(score.civi.correct, score.civi.total),
    level_didactique: calcLevel(score.didactique.correct, score.didactique.total),
  }
}

// ─── Icônes et labels par domaine ────────────────────────────────────────────

const DOMAIN_META = {
  langue: { label: 'Langue', Icon: Languages },
  civi: { label: 'Civilisation', Icon: Globe },
  didactique: { label: 'Didactique', Icon: GraduationCap },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Step = 'test' | 'saving' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('test')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleNext() {
    if (!selected) return
    const q = QUESTIONS[currentQ]
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(currentQ + 1)
      return
    }

    // Toutes les questions répondues → sauvegarder
    setStep('saving')
    const levels = calcLevels(newAnswers)
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levels),
      })
      if (!res.ok) throw new Error()
      setStep('done')
      setTimeout(() => router.push('/'), 1500)
    } catch {
      setError('Une erreur est survenue. Réessaie.')
      setStep('test')
      setCurrentQ(QUESTIONS.length - 1)
      setSelected(newAnswers[QUESTIONS[QUESTIONS.length - 1].id] ?? null)
    }
  }

  const progress = ((currentQ) / QUESTIONS.length) * 100
  const q = QUESTIONS[currentQ]
  const { label, Icon } = DOMAIN_META[q?.domain ?? 'langue']

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-violet-600" />
            <span className="font-semibold text-slate-900">teachIA</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Test de niveau — CAPES d&apos;espagnol</p>
        </div>

        {/* Test */}
        {step === 'test' && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-base text-slate-900">Évalue ton niveau</CardTitle>
                <span className="text-sm text-slate-400 font-mono tabular-nums">
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>
              {/* Barre de progression */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Badge domaine */}
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
              </Badge>

              {/* Question */}
              <p className="text-slate-900 font-medium leading-snug">{q.question}</p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelected(option)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selected === option
                        ? 'border-violet-500 bg-violet-50 text-violet-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                onClick={handleNext}
                disabled={!selected}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
              >
                {currentQ + 1 === QUESTIONS.length ? 'Terminer' : 'Suivant'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sauvegarde */}
        {step === 'saving' && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center text-center gap-3 py-12">
              <Loader2 className="h-7 w-7 text-violet-600 animate-spin" />
              <p className="text-sm text-slate-500">Enregistrement de ton niveau…</p>
            </CardContent>
          </Card>
        )}

        {/* Terminé */}
        {step === 'done' && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center text-center gap-3 py-12">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Niveau enregistré !</p>
                <p className="text-sm text-slate-500 mt-1">Redirection vers le tableau de bord…</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
