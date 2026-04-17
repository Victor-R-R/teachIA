import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/db'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ explanation: '' }, { status: 400 })
  }

  const { exerciseId, userAnswer, correctAnswer } = body as {
    exerciseId: unknown
    userAnswer: unknown
    correctAnswer: unknown
  }

  if (typeof exerciseId !== 'number' || typeof userAnswer !== 'string' || typeof correctAnswer !== 'string') {
    return NextResponse.json({ explanation: '' }, { status: 400 })
  }

  const exercise = await getExerciseById(exerciseId)
  if (!exercise) return NextResponse.json({ explanation: '' }, { status: 404 })

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `Tu es un professeur expert du CAPES d'espagnol. Tu donnes des explications pédagogiques claires et bienveillantes en français.

Formate ta réponse ainsi :
❌ **Pourquoi cette réponse est incorrecte** : [explication concise du POURQUOI]
✅ **La bonne réponse** : [réponse correcte + justification de la règle]
💡 **Retiens ceci** : [astuce de mémorisation ou règle clé]

Sois précis, concis (4-5 phrases max), et toujours encourage l'apprenant.`,
      prompt: `L'apprenant a répondu "${userAnswer}" à la question suivante : "${exercise.question}". La bonne réponse est "${correctAnswer}". Explique pourquoi sa réponse est incorrecte et pourquoi la bonne réponse est "${correctAnswer}".`,
      maxOutputTokens: 300,
    })
    return NextResponse.json({ explanation: text })
  } catch {
    return NextResponse.json({ explanation: '' }, { status: 200 })
  }
}
