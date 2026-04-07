import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const EXERCISES = [
  // --- LANGUE ---
  {
    theme: 'subjonctif',
    domain: 'langue',
    type: 'qcm',
    question: 'Choisissez la forme correcte : "Quiero que tú ___ aquí."',
    options: ['estás', 'estés', 'estarás', 'estuvieras'],
    answer: 'estés',
    explanation: 'Après "querer que", on utilise le subjonctif présent. La 2e personne du singulier du subjonctif de "estar" est "estés".',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'ser_estar',
    domain: 'langue',
    type: 'qcm',
    question: '"La sopa ___ fría." — ser ou estar ?',
    options: ['es', 'está', 'sea', 'esté'],
    answer: 'está',
    explanation: '"Estar" exprime un état temporaire ou une condition perçue. La soupe n\'est pas froide par nature — elle l\'est dans cette situation précise. On utilise donc "está".',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'por_para',
    domain: 'langue',
    type: 'vrai_faux',
    question: '"Estudio español por trabajar en Madrid" est correct pour exprimer un but.',
    options: ['Vrai', 'Faux'],
    answer: 'Faux',
    explanation: '"Por" exprime la cause, l\'échange ou la durée. Pour exprimer un but, on utilise "para" : "Estudio español para trabajar en Madrid".',
    level: 'B',
    source: 'curated',
  },
  {
    theme: 'preterito_imperfecto',
    domain: 'langue',
    type: 'lacunaire',
    question: 'Cuando era niño, ___ (jugar) todos los días en el parque.',
    options: null,
    answer: 'jugaba',
    explanation: 'L\'imparfait (pretérito imperfecto) s\'utilise pour une action habituelle dans le passé. "Jugar" → "jugaba" (1e personne du singulier).',
    level: 'A',
    source: 'curated',
  },
  // --- CIVILISATION ESPAGNE ---
  {
    theme: 'guerra_civil',
    domain: 'civi_espagne',
    type: 'qcm',
    question: 'La guerre civile espagnole s\'est terminée en :',
    options: ['1936', '1939', '1941', '1945'],
    answer: '1939',
    explanation: 'La guerre civile espagnole a duré du 17 juillet 1936 au 1er avril 1939, date de la victoire de Franco et de la fin de la résistance républicaine.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'siglo_de_oro',
    domain: 'civi_espagne',
    type: 'association',
    question: 'Associez l\'auteur à son œuvre : Cervantes',
    options: ['Don Quijote de la Mancha', 'La Celestina', 'Lazarillo de Tormes', 'Fuenteovejuna'],
    answer: 'Don Quijote de la Mancha',
    explanation: 'Miguel de Cervantes Saavedra est l\'auteur de "Don Quijote de la Mancha" (1605/1615), considérée comme la première œuvre du roman moderne occidental.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'transicion_democratica',
    domain: 'civi_espagne',
    type: 'chronologie',
    question: 'Remettez ces événements dans l\'ordre chronologique.',
    options: ['Mort de Franco (1975)', 'Premières élections libres (1977)', 'Constitution espagnole (1978)', 'Adhésion à la CEE (1986)'],
    answer: 'Mort de Franco (1975)|Premières élections libres (1977)|Constitution espagnole (1978)|Adhésion à la CEE (1986)',
    explanation: 'La Transition démocratique espagnole : mort de Franco (novembre 1975), élections de juin 1977, Constitution de décembre 1978, adhésion à la CEE en 1986.',
    level: 'B',
    source: 'curated',
  },
  // --- CIVILISATION AMÉRIQUE LATINE ---
  {
    theme: 'boom_literario',
    domain: 'civi_latam',
    type: 'qcm',
    question: '"Cien años de soledad" est l\'œuvre de :',
    options: ['Jorge Luis Borges', 'Mario Vargas Llosa', 'Gabriel García Márquez', 'Julio Cortázar'],
    answer: 'Gabriel García Márquez',
    explanation: '"Cien años de soledad" (1967) est le roman majeur de Gabriel García Márquez (Colombie), figure centrale du Boom latinoaméricain et prix Nobel de littérature 1982.',
    level: 'A',
    source: 'curated',
  },
  {
    theme: 'revolucion_cubana',
    domain: 'civi_latam',
    type: 'vrai_faux',
    question: 'Fidel Castro est arrivé au pouvoir à Cuba en 1959 après avoir renversé le régime de Batista.',
    options: ['Vrai', 'Faux'],
    answer: 'Vrai',
    explanation: 'La révolution cubaine aboutit le 1er janvier 1959 avec la fuite de Fulgencio Batista. Les forces de Fidel Castro entrent à La Havane le 8 janvier 1959.',
    level: 'A',
    source: 'curated',
  },
  // --- DIDACTIQUE ---
  {
    theme: 'approche_actionnelle',
    domain: 'didactique',
    type: 'qcm',
    question: 'L\'approche actionnelle, introduite par le CECRL, considère l\'apprenant avant tout comme :',
    options: ['Un récepteur passif de règles grammaticales', 'Un acteur social accomplissant des tâches', 'Un imitateur de locuteurs natifs', 'Un décodeur de textes authentiques'],
    answer: 'Un acteur social accomplissant des tâches',
    explanation: 'Le CECRL (2001) définit l\'approche actionnelle : l\'apprenant est un "acteur social" qui mobilise ses compétences pour accomplir des "tâches" en contexte réel.',
    level: 'B',
    source: 'curated',
  },
]

async function seed() {
  console.log(`Seeding ${EXERCISES.length} exercises...`)

  for (const ex of EXERCISES) {
    await sql.query(
      `INSERT INTO exercises (theme, domain, type, question, options, answer, explanation, level, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [ex.theme, ex.domain, ex.type, ex.question,
       ex.options ? JSON.stringify(ex.options) : null,
       ex.answer, ex.explanation, ex.level, ex.source]
    )
  }

  console.log('✓ Seed complete')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
