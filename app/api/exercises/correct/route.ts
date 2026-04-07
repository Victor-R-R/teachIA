import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { exerciseId, userAnswer, correctAnswer } = await req.json()

  const exercise = await getExerciseById(exerciseId)
  if (!exercise) return NextResponse.json({ explanation: '' }, { status: 404 })

  const { text } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `Tu es un professeur expert du CAPES d'espagnol. Tu donnes des explications pédagogiques claires et bienveillantes en français. Sois précis, concis (2-3 phrases maximum), et toujours encourage l'apprenant.`,
    prompt: `L'apprenant a répondu "${userAnswer}" à la question suivante : "${exercise.question}". La bonne réponse est "${correctAnswer}". Explique pourquoi sa réponse est incorrecte et pourquoi la bonne réponse est "${correctAnswer}".`,
    maxOutputTokens: 200,
  })

  return NextResponse.json({ explanation: text })
}
