import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

type Q = {
  type: 'qcm' | 'vrai_faux' | 'lacunaire'
  question: string
  options: string[] | null
  answer: string
  explanation: string
}

type SeedExercise = {
  title: string
  theme: string
  domain: string
  level: 'A' | 'B' | 'C'
  questions: Q[]
}

const EXERCISES: SeedExercise[] = [
  // ──────────────────────────────────────────────
  // LANGUE
  // ──────────────────────────────────────────────
  {
    title: 'Le subjonctif présent',
    theme: 'subjonctif',
    domain: 'langue',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: 'Choisissez la forme correcte : "Quiero que tú ___ aquí mañana."',
        options: ['estás', 'estés', 'estarás', 'estuvieras'],
        answer: 'estés',
        explanation: 'Après "querer que", le verbe subordonné est au subjonctif présent. "Estar" → 2e sg. subjonctif = "estés".',
      },
      {
        type: 'qcm',
        question: 'Quel connecteur déclenche obligatoirement le subjonctif ?',
        options: ['porque', 'cuando (présent)', 'para que', 'aunque (fait certain)'],
        answer: 'para que',
        explanation: '"Para que" exprime le but et requiert toujours le subjonctif. "Porque" prend l\'indicatif ; "aunque" peut prendre l\'un ou l\'autre selon le sens.',
      },
      {
        type: 'vrai_faux',
        question: '"Espero que viene pronto" est grammaticalement correct en espagnol standard.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: '"Esperar que" exprime un souhait incertain → subjonctif obligatoire. La forme correcte est "Espero que venga pronto".',
      },
      {
        type: 'lacunaire',
        question: '"No creo que él ___ (tener) razón."',
        options: null,
        answer: 'tenga',
        explanation: '"No creer que" + doute → subjonctif. "Tener" → 3e sg. subjonctif présent = "tenga".',
      },
      {
        type: 'qcm',
        question: 'Dans quelle phrase le subjonctif est-il incorrectement utilisé ?',
        options: ['Es importante que estudies.', 'Creo que venga mañana.', 'Ojalá tengas suerte.', 'Dudo que sea verdad.'],
        answer: 'Creo que venga mañana.',
        explanation: '"Creer que" à la forme affirmative introduit l\'indicatif : "Creo que viene mañana". À la forme négative on utilise le subjonctif.',
      },
      {
        type: 'qcm',
        question: '"Busco un apartamento que ___ cerca del centro." — quelle forme est correcte ?',
        options: ['está', 'esté', 'estará', 'estaría'],
        answer: 'esté',
        explanation: 'La relative porte sur un référent indéfini (inexistant dans l\'expérience du locuteur) → subjonctif.',
      },
      {
        type: 'lacunaire',
        question: '"Aunque ___ (llover) mañana, iré al partido."',
        options: null,
        answer: 'llueva',
        explanation: '"Aunque" + événement futur non confirmé → subjonctif. "Llover" → 3e sg. subjonctif présent = "llueva".',
      },
    ],
  },
  {
    title: 'Ser et Estar',
    theme: 'ser_estar',
    domain: 'langue',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: '"La paella ___ muy rica." → ser ou estar ?',
        options: ['es', 'está', 'sea', 'esté'],
        answer: 'está',
        explanation: '"Estar" exprime un état perçu dans une situation donnée. La richesse d\'un plat est appréciée au moment de l\'énoncé, pas une propriété inhérente.',
      },
      {
        type: 'vrai_faux',
        question: '"El cielo está azul" et "El cielo es azul" ont exactement le même sens.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: '"Es azul" → propriété permanente. "Está azul" → état situationnel appréciable au moment de l\'énonciation.',
      },
      {
        type: 'lacunaire',
        question: '"La reunión ___ en la sala de conferencias." (lieu d\'un événement)',
        options: null,
        answer: 'es',
        explanation: 'Pour les événements (réunions, fêtes, concerts), on utilise "ser". "Estar" est réservé à la localisation d\'objets et de personnes.',
      },
      {
        type: 'qcm',
        question: '"Está muerto" vs "Es muerto" — laquelle est correcte en espagnol moderne ?',
        options: ['"Estar muerto" seulement', '"Ser muerto" seulement', 'Les deux', 'Aucune'],
        answer: '"Estar muerto" seulement',
        explanation: 'En espagnol moderne, "estar muerto" est la forme standard. "Ser muerto" est archaïque (passif résultatif médiéval).',
      },
      {
        type: 'vrai_faux',
        question: '"El examen es mañana" est correctement construit avec ser.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Les événements et rendez-vous utilisent "ser" : "La fiesta es el viernes", "El examen es mañana".',
      },
      {
        type: 'qcm',
        question: '"Esos mangos ___ verdes — no los comas." → quel verbe et pourquoi ?',
        options: ['son (couleur permanente)', 'están (état temporaire : pas mûrs)', 'son (propriété inhérente)', 'están (couleur toujours avec estar)'],
        answer: 'están (état temporaire : pas mûrs)',
        explanation: '"Verde" au sens d\'immature → état temporaire → "estar". "Las hojas son verdes" (couleur naturelle) utiliserait "ser".',
      },
      {
        type: 'vrai_faux',
        question: '"Juan es de médico en el hospital" est une phrase correcte pour indiquer sa fonction temporaire.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Pour une fonction temporaire on dit "Juan está de médico". "Ser de" signifie la provenance ("Es de Madrid") ou la matière ("Es de madera").',
      },
    ],
  },
  {
    title: 'Por et Para',
    theme: 'por_para',
    domain: 'langue',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: '"Salgo ___ Madrid mañana." (destination)',
        options: ['por', 'para'],
        answer: 'para',
        explanation: '"Para" indique la destination finale d\'un déplacement. "Por" indiquerait le passage à travers un lieu.',
      },
      {
        type: 'vrai_faux',
        question: '"Lo hice por ti" exprime un but.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: '"Por" ici exprime la cause/motivation (à cause de toi, en raison de toi). Pour le but on utilise "para" : "Lo hice para ayudarte".',
      },
      {
        type: 'qcm',
        question: '"Pagué veinte euros ___ este libro."',
        options: ['por', 'para'],
        answer: 'por',
        explanation: 'L\'échange commercial utilise "por" : on donne X euros en contrepartie (por) d\'un livre.',
      },
      {
        type: 'vrai_faux',
        question: '"Para ser tan joven, habla muy bien" exprime une attente par rapport à une norme.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: '"Para + infinitif/sustantivo" exprime une attente ou une norme par rapport à laquelle on juge : "Étant donné qu\'il est si jeune, il parle très bien."',
      },
      {
        type: 'qcm',
        question: '"Llamé ___ saber si estabas bien."',
        options: ['por', 'para'],
        answer: 'para',
        explanation: '"Para" exprime le but d\'une action. "Por" indiquerait la cause.',
      },
      {
        type: 'lacunaire',
        question: '"Estudio ___ aprender, no ___ aprobar." — même préposition dans les deux blancs.',
        options: null,
        answer: 'para',
        explanation: 'Les deux blancs expriment un but → "para" dans les deux cas.',
      },
    ],
  },
  {
    title: 'Les temps du passé',
    theme: 'preterito_imperfecto',
    domain: 'langue',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: '"Je lisais quand le téléphone a sonné." → traduction correcte ?',
        options: [
          'Leí cuando el teléfono sonó.',
          'Leía cuando el teléfono sonó.',
          'Leería cuando el teléfono sonó.',
          'Leí cuando el teléfono sonaba.',
        ],
        answer: 'Leía cuando el teléfono sonó.',
        explanation: 'Action en cours (imparfait = leía) interrompue par une action ponctuelle (pretérito indefinido = sonó).',
      },
      {
        type: 'lacunaire',
        question: 'Ayer, nosotros ___ (comer) demasiado en el restaurante.',
        options: null,
        answer: 'comimos',
        explanation: 'Action ponctuelle datée ("ayer") → pretérito indefinido. "Comer" → 1e pl. = "comimos".',
      },
      {
        type: 'vrai_faux',
        question: 'Le "pretérito perfecto compuesto" (he comido) s\'utilise de la même façon en Espagne et en Amérique latine.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'En Espagne castillane, "he comido" exprime un passé récent. En Amérique latine, on préfère "comí" même pour des faits récents. Variation diatopique importante pour le CAPES.',
      },
      {
        type: 'qcm',
        question: '"Cuando ___ a Madrid, te llamaré." → quel temps ?',
        options: ['llegué', 'llegaré', 'llegue', 'llegaba'],
        answer: 'llegue',
        explanation: '"Cuando" + sens futur → subjonctif présent. L\'action n\'est pas encore accomplie au moment de l\'énonciation.',
      },
      {
        type: 'qcm',
        question: '"Hacía tres años que no lo ___ cuando me lo encontré en la calle."',
        options: ['veía', 'vi', 'había visto', 'vería'],
        answer: 'había visto',
        explanation: '"Hacía X tiempo que + pluscuamperfecto" exprime une durée antérieure à un moment passé. "Había visto" marque l\'antériorité par rapport à "me lo encontré".',
      },
      {
        type: 'vrai_faux',
        question: '"Siempre llegaba tarde" décrit une habitude passée.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'L\'imparfait avec "siempre" exprime une habitude révolue dans le passé.',
      },
      {
        type: 'lacunaire',
        question: 'Para cuando llegaron los invitados, María ya ___ (preparar) la cena.',
        options: null,
        answer: 'había preparado',
        explanation: 'Préparer le dîner est antérieur à l\'arrivée des invités (elle-même au passé) → pluscuamperfecto : "había preparado".',
      },
    ],
  },
  {
    title: 'Les pronoms clitiques',
    theme: 'pronoms_clitiques',
    domain: 'langue',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: '"¿Le diste el libro a María?" → réponse avec pronoms corrects :',
        options: ['Sí, le lo di.', 'Sí, se lo di.', 'Sí, la le di.', 'Sí, lo le di.'],
        answer: 'Sí, se lo di.',
        explanation: 'Quand "le/les" (COI) précède "lo/la/los/las" (COD), "le" devient "se" pour des raisons phonétiques. D\'où "se lo di".',
      },
      {
        type: 'lacunaire',
        question: '"No me lo ___ (decir, impératif négatif, tú)."',
        options: null,
        answer: 'digas',
        explanation: 'Impératif négatif = subjonctif. "Decir" → 2e sg. subjonctif = "digas". Les clitiques se placent avant le verbe à l\'impératif négatif.',
      },
      {
        type: 'vrai_faux',
        question: 'On peut dire "Cómpramelo" pour "Achète-le-moi".',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'À l\'impératif affirmatif, les clitiques s\'enclisent : "cómpra" + "me" + "lo" = "cómpramelo". L\'accent tonique se maintient sur la syllabe originale.',
      },
      {
        type: 'qcm',
        question: 'Qu\'illustre le "leísmo" ?',
        options: [
          'Utiliser "le" pour le COD masculin animé',
          'Dupliquer le COI avec un pronom',
          'Omettre "se" devant "lo"',
          'Utiliser "lo" pour le féminin',
        ],
        answer: 'Utiliser "le" pour le COD masculin animé',
        explanation: 'Le "leísmo" : employer "le" à la place de "lo" pour un COD masculin animé humain ("le vi" au lieu de "lo vi"). Marque dialectale castillane tolérée par la RAE.',
      },
      {
        type: 'qcm',
        question: '"Se me cayó el vaso." — quel rôle joue "me" ?',
        options: ['COD', 'COI', 'Datif d\'intérêt (afectación)', 'Sujet'],
        answer: 'Datif d\'intérêt (afectación)',
        explanation: '"Se me cayó" est une construction accidentelle : "me" = datif d\'intérêt marquant que l\'action m\'est arrivée contre ma volonté.',
      },
      {
        type: 'vrai_faux',
        question: '"La vi a ella" est incorrecte en espagnol.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'La "duplicación del objeto directo" est grammaticalement correcte et stylistiquement utile pour insister. Elle est particulièrement fréquente en Amérique latine.',
      },
    ],
  },

  // ──────────────────────────────────────────────
  // CIVILISATION ESPAGNE
  // ──────────────────────────────────────────────
  {
    title: 'La Guerre Civile espagnole (1936-1939)',
    theme: 'guerra_civil',
    domain: 'civi_espagne',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: 'La Guerre Civile espagnole a commencé le :',
        options: ['18 juillet 1936', '14 avril 1931', '1er avril 1939', '17 juillet 1937'],
        answer: '18 juillet 1936',
        explanation: 'Le soulèvement militaire débute le 17 juillet au Maroc espagnol et s\'étend à la péninsule le 18 juillet 1936.',
      },
      {
        type: 'vrai_faux',
        question: 'La Légion Condor était une unité militaire soviétique qui combattait du côté républicain.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'La Légion Condor était une unité allemande nazie (Luftwaffe/Wehrmacht) combattant aux côtés des nationalistes. Elle a notamment bombardé Guernica (26 avril 1937).',
      },
      {
        type: 'qcm',
        question: 'Quel pays n\'a PAS soutenu militairement le camp républicain ?',
        options: ['URSS', 'Mexique', 'France', 'Toutes ces réponses sont fausses'],
        answer: 'France',
        explanation: 'La France a officiellement adopté la non-intervention sous pression britannique. L\'URSS (Staline) et le Mexique (Cárdenas) ont activement soutenu la République.',
      },
      {
        type: 'qcm',
        question: 'Les Brigades Internationales étaient composées de :',
        options: ['Soldats de l\'URSS', 'Volontaires étrangers antifascistes', 'Mercenaires allemands', 'Légionnaires marocains'],
        answer: 'Volontaires étrangers antifascistes',
        explanation: 'Les Brigades Internationales (1936-1938) : ~35 000 volontaires de 53 pays, militants antifascistes. Elles sont dissoutes en 1938.',
      },
      {
        type: 'vrai_faux',
        question: 'Le Pacte de Non-Intervention de Londres a effectivement empêché l\'aide étrangère aux deux camps.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Le Comité de non-intervention (1936) était inefficace : l\'Allemagne, l\'Italie et l\'URSS ont continué à intervenir. C\'était une façade diplomatique.',
      },
      {
        type: 'qcm',
        question: 'Guernica est connue pour :',
        options: [
          'Avoir été le siège du gouvernement républicain',
          'Son bombardement par la Légion Condor en 1937',
          'La capitulation nationaliste',
          'Le débarquement des Brigades Internationales',
        ],
        answer: 'Son bombardement par la Légion Condor en 1937',
        explanation: 'Le 26 avril 1937, Guernica est bombardée, causant des centaines de morts civils. Picasso immortalise cet événement dans son tableau éponyme.',
      },
      {
        type: 'lacunaire',
        question: 'La guerre civile espagnole se termine le ___ avril 1939.',
        options: null,
        answer: '1er',
        explanation: 'Le 1er avril 1939, Franco proclame la fin de la guerre. La résistance républicaine s\'effondre après la chute de Madrid.',
      },
    ],
  },
  {
    title: 'La Transition Démocratique espagnole',
    theme: 'transicion_democratica',
    domain: 'civi_espagne',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: 'Franco meurt le :',
        options: ['20 novembre 1975', '18 juillet 1976', '23 février 1981', '6 décembre 1978'],
        answer: '20 novembre 1975',
        explanation: 'Francisco Franco Bahamonde décède le 20 novembre 1975, mettant fin à 36 ans de dictature.',
      },
      {
        type: 'qcm',
        question: 'Adolfo Suárez est connu pour :',
        options: [
          'Avoir maintenu le franquisme',
          'Avoir négocié la Transition démocratique',
          'Avoir mené le coup d\'État du 23-F',
          'Avoir été le premier président socialiste',
        ],
        answer: 'Avoir négocié la Transition démocratique',
        explanation: 'Nommé président par Juan Carlos Ier en 1976, Suárez orchestre la Transition depuis l\'intérieur du système franquiste via la Ley para la Reforma Política.',
      },
      {
        type: 'vrai_faux',
        question: 'La Constitution espagnole de 1978 a été approuvée par référendum avec plus de 87% de votes favorables.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Référendum du 6 décembre 1978 : 87,87% de oui. La Constitution établit une monarchie parlementaire et l\'État des autonomies.',
      },
      {
        type: 'qcm',
        question: 'Le "23-F" désigne :',
        options: [
          'La signature de la Constitution',
          'La tentative de coup d\'État de Tejero',
          'L\'adhésion à l\'OTAN',
          'Les premières élections du PSOE',
        ],
        answer: 'La tentative de coup d\'État de Tejero',
        explanation: 'Le 23 février 1981, Tejero prend d\'assaut le Congrès des Députés. Le discours du roi Juan Carlos Ier en uniforme militaire condamnant le putsch y met fin.',
      },
      {
        type: 'qcm',
        question: 'Les Pactes de la Moncloa (1977) étaient :',
        options: [
          'Un accord militaire avec l\'OTAN',
          'Des accords économiques et politiques de concertation nationale',
          'Le traité d\'adhésion à la CEE',
          'Un accord entre le PC et le PSOE',
        ],
        answer: 'Des accords économiques et politiques de concertation nationale',
        explanation: 'Signés en octobre 1977, les Pactes de la Moncloa réunissent partis et syndicats pour stabiliser l\'économie et consolider la démocratie naissante.',
      },
      {
        type: 'vrai_faux',
        question: 'L\'Espagne a adhéré à la CEE en 1982.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'L\'Espagne adhère à la CEE le 1er janvier 1986, sous Felipe González. 1982 est l\'année de la victoire électorale du PSOE.',
      },
      {
        type: 'lacunaire',
        question: 'Les premières élections libres de la Transition ont eu lieu le ___ juin 1977.',
        options: null,
        answer: '15',
        explanation: 'Les élections du 15 juin 1977 sont les premières élections libres depuis 1936. L\'UCD de Suárez arrive en tête.',
      },
    ],
  },
  {
    title: 'Le Siècle d\'Or espagnol',
    theme: 'siglo_de_oro',
    domain: 'civi_espagne',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: 'Le Siècle d\'Or espagnol s\'étend approximativement :',
        options: ['Du XIVe au XVe siècle', 'De 1492 à 1681', 'Du XVIIIe au XIXe siècle', 'Du XIe au XIIIe siècle'],
        answer: 'De 1492 à 1681',
        explanation: 'Le Siglo de Oro : de 1492 (découverte de l\'Amérique, grammaire de Nebrija) à 1681 (mort de Calderón de la Barca).',
      },
      {
        type: 'qcm',
        question: 'Associez l\'auteur à son œuvre → Lope de Vega :',
        options: ['Fuenteovejuna', 'Don Quijote de la Mancha', 'La vida es sueño', 'Lazarillo de Tormes'],
        answer: 'Fuenteovejuna',
        explanation: 'Lope de Vega (1562-1635) est l\'auteur de "Fuenteovejuna". Calderón écrit "La vida es sueño", Cervantes "Don Quijote", et "Lazarillo" est anonyme.',
      },
      {
        type: 'vrai_faux',
        question: '"Don Quijote de la Mancha" est considéré comme la première œuvre du roman moderne occidental.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Publié en deux parties (1605/1615), "Don Quijote" est reconnu comme le premier roman moderne pour sa réflexivité narrative et l\'évolution psychologique des personnages.',
      },
      {
        type: 'qcm',
        question: 'La "picaresque" se caractérise par :',
        options: [
          'La vie d\'un héros noble',
          'L\'autobiographie fictive d\'un anti-héros d\'origine modeste',
          'Des aventures de chevaliers',
          'La poésie mystique',
        ],
        answer: 'L\'autobiographie fictive d\'un anti-héros d\'origine modeste',
        explanation: 'Le roman picaresque (né avec "Lazarillo de Tormes", 1554) met en scène un "pícaro" qui narre ses péripéties. C\'est une critique sociale déguisée.',
      },
      {
        type: 'qcm',
        question: 'Qui est l\'auteur de "La vida es sueño" ?',
        options: ['Quevedo', 'Góngora', 'Calderón de la Barca', 'Lope de Vega'],
        answer: 'Calderón de la Barca',
        explanation: '"La vida es sueño" (v. 1635) de Pedro Calderón de la Barca pose la question philosophique de la distinction entre rêve et réalité.',
      },
      {
        type: 'vrai_faux',
        question: 'Le "conceptismo" et le "culteranismo" sont deux courants opposés du baroque espagnol.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: '"Conceptismo" (Quevedo) : densité conceptuelle. "Culteranismo/gongorismo" (Góngora) : virtuosité formelle et néologismes latins. Deux faces du baroque espagnol.',
      },
      {
        type: 'lacunaire',
        question: 'El Greco, peintre du Siècle d\'Or établi à Tolède, était originaire de ___ (île grecque).',
        options: null,
        answer: 'Crète',
        explanation: 'Doménikos Theotokópoulos, dit "El Greco" (1541-1614), est né en Crète (alors vénitienne). Il s\'installe à Tolède et y développe son style expressionniste.',
      },
    ],
  },
  {
    title: 'L\'Espagne contemporaine (1982-aujourd\'hui)',
    theme: 'espana_contemporanea',
    domain: 'civi_espagne',
    level: 'C',
    questions: [
      {
        type: 'qcm',
        question: 'Quel parti a gouverné l\'Espagne de 1982 à 1996 ?',
        options: ['PP', 'UCD', 'PSOE', 'Ciudadanos'],
        answer: 'PSOE',
        explanation: 'Le PSOE de Felipe González remporte les élections de 1982 et gouverne jusqu\'en 1996 (4 mandats). Première alternance de gauche en démocratie.',
      },
      {
        type: 'vrai_faux',
        question: 'L\'Espagne est entrée dans l\'OTAN sous le gouvernement de Felipe González.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'L\'Espagne entre dans l\'OTAN en 1982 sous Calvo-Sotelo (UCD). González organise un référendum en 1986 et les Espagnols votent pour le maintien.',
      },
      {
        type: 'qcm',
        question: 'L\'ETA a officiellement annoncé la fin de sa lutte armée en :',
        options: ['2003', '2011', '2018', '1998'],
        answer: '2011',
        explanation: 'L\'ETA dépose définitivement les armes en octobre 2011, après avoir causé ~850 morts depuis 1959. L\'organisation se dissout en 2018.',
      },
      {
        type: 'lacunaire',
        question: 'Le mouvement des "Indignados" du ___ mai 2011 a profondément marqué la vie politique espagnole.',
        options: null,
        answer: '15',
        explanation: 'Le 15-M (15 mai 2011) rassemble des milliers de citoyens sur la Puerta del Sol pour dénoncer corruption et austérité. Il préfigure l\'émergence de Podemos.',
      },
      {
        type: 'qcm',
        question: 'La crise catalane de 2017 débute avec :',
        options: [
          'La crise économique de 2008',
          'Le référendum illégal du 1er octobre 2017',
          'Une réforme de la loi électorale',
          'La mort de Carles Puigdemont',
        ],
        answer: 'Le référendum illégal du 1er octobre 2017',
        explanation: 'Après le référendum du 1er octobre malgré l\'interdiction du gouvernement, le Parlement catalan proclame l\'indépendance le 27 octobre. Madrid applique l\'article 155.',
      },
      {
        type: 'vrai_faux',
        question: 'L\'Espagne a une économie essentiellement agricole en marge des grandes économies européennes.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'L\'Espagne est la 4e économie de la zone euro, puissance touristique, industrielle et de services. Son PIB la place parmi les 15 premières économies mondiales.',
      },
    ],
  },

  // ──────────────────────────────────────────────
  // CIVILISATION AMÉRIQUE LATINE
  // ──────────────────────────────────────────────
  {
    title: 'Le Boom Littéraire latinoaméricain',
    theme: 'boom_literario',
    domain: 'civi_latam',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: 'Le Boom latinoaméricain désigne :',
        options: [
          'Un mouvement politique révolutionnaire',
          'Un mouvement littéraire des années 1960-1970',
          'Une vague d\'émigration',
          'Un essor économique',
        ],
        answer: 'Un mouvement littéraire des années 1960-1970',
        explanation: 'Le Boom est un phénomène littéraire et éditorial des années 1960-70 qui propulse des romanciers latino-américains sur la scène mondiale.',
      },
      {
        type: 'qcm',
        question: 'Gabriel García Márquez est de nationalité :',
        options: ['Mexicaine', 'Argentine', 'Colombienne', 'Péruvienne'],
        answer: 'Colombienne',
        explanation: 'García Márquez (1927-2014) est né à Aracataca, Colombie. Prix Nobel 1982, auteur de "Cien años de soledad" (1967).',
      },
      {
        type: 'qcm',
        question: 'Le "réalisme magique" consiste à :',
        options: [
          'Décrire uniquement des faits historiques',
          'Intégrer le merveilleux dans le réel sans étonnement',
          'Utiliser exclusivement la science-fiction',
          'S\'opposer à toute description du réel',
        ],
        answer: 'Intégrer le merveilleux dans le réel sans étonnement',
        explanation: 'Dans le réalisme magique, les éléments fantastiques font naturellement partie du quotidien sans que les personnages s\'en étonnent.',
      },
      {
        type: 'vrai_faux',
        question: 'Mario Vargas Llosa est péruvien et a reçu le prix Nobel de littérature en 2010.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Vargas Llosa (né en 1936) reçoit le Nobel en 2010. Œuvres : "La ciudad y los perros", "La casa verde", "Conversación en La Catedral".',
      },
      {
        type: 'qcm',
        question: 'Julio Cortázar, auteur de "Rayuela" (1963), est de nationalité :',
        options: ['Mexicaine', 'Chilienne', 'Argentine', 'Cubaine'],
        answer: 'Argentine',
        explanation: 'Cortázar (1914-1984) est argentin, exilé à Paris. "Rayuela" est une œuvre majeure par sa structure non-linéaire et son innovation formelle.',
      },
      {
        type: 'vrai_faux',
        question: '"La casa de los espíritus" d\'Isabel Allende fait partie du Boom des années 1960-70.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: '"La casa de los espíritus" est publié en 1982, appartenant à la génération post-Boom. Allende est chilienne, exilée après le coup d\'État de 1973.',
      },
      {
        type: 'lacunaire',
        question: '"Pedro Páramo" (1955) de Juan Rulfo est une œuvre ___ (nationalité).',
        options: null,
        answer: 'mexicaine',
        explanation: '"Pedro Páramo" de Rulfo (1917-1986) est mexicain, récit fragmenté des voix des morts du village de Comala. Il a profondément influencé García Márquez.',
      },
    ],
  },
  {
    title: 'Les grandes révolutions du XXe siècle en Amérique latine',
    theme: 'revoluciones_latam',
    domain: 'civi_latam',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: 'La révolution mexicaine commence avec la destitution du président :',
        options: ['Zapata', 'Díaz', 'Madero', 'Cárdenas'],
        answer: 'Díaz',
        explanation: 'La révolution débute en 1910 contre la dictature de Porfirio Díaz. Madero lance l\'appel à l\'insurrection avec le Plan de San Luis (octobre 1910).',
      },
      {
        type: 'vrai_faux',
        question: 'Emiliano Zapata et Pancho Villa combattaient du même côté pendant toute la révolution mexicaine.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Zapata (Plan d\'Ayala, réforme agraire, Sud) et Villa (División del Norte, Nord) avaient des objectifs distincts et ont eu des moments d\'alliance mais aussi de divergence.',
      },
      {
        type: 'qcm',
        question: 'La révolution cubaine de 1959 renverse :',
        options: ['Machado', 'Batista', 'Prío Socarrás', 'Grau San Martín'],
        answer: 'Batista',
        explanation: 'Fulgencio Batista (dictateur depuis 1952) fuit Cuba le 1er janvier 1959. Fidel Castro, Raúl Castro et le Che Guevara mènent les forces révolutionnaires.',
      },
      {
        type: 'qcm',
        question: 'Le "Che" Guevara est de nationalité :',
        options: ['Cubaine', 'Argentine', 'Bolivienne', 'Mexicaine'],
        answer: 'Argentine',
        explanation: 'Ernesto "Che" Guevara (1928-1967) est né à Rosario, Argentine. Il tente d\'exporter la révolution au Congo puis en Bolivie, où il est exécuté le 9 octobre 1967.',
      },
      {
        type: 'vrai_faux',
        question: 'Salvador Allende a été renversé par un coup d\'État militaire le 11 septembre 1973 au Chili.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Le général Pinochet dirige le coup d\'État. Allende meurt lors de la prise du Palacio de La Moneda à Santiago.',
      },
      {
        type: 'qcm',
        question: 'La révolution sandiniste (1979) a eu lieu dans quel pays ?',
        options: ['El Salvador', 'Guatemala', 'Nicaragua', 'Honduras'],
        answer: 'Nicaragua',
        explanation: 'Le FSLN renverse la dictature de Somoza au Nicaragua le 19 juillet 1979. Les sandinistes gouvernent jusqu\'en 1990, résistant à la "contra" soutenue par les États-Unis.',
      },
      {
        type: 'lacunaire',
        question: 'Le mouvement zapatiste (EZLN) s\'est soulevé dans l\'État du ___, au Mexique, le 1er janvier 1994.',
        options: null,
        answer: 'Chiapas',
        explanation: 'L\'EZLN se soulève au Chiapas le jour de l\'entrée en vigueur de l\'ALENA, pour défendre les droits des peuples indigènes.',
      },
    ],
  },
  {
    title: 'Géographie et identités latinoaméricaines',
    theme: 'identidades_latam',
    domain: 'civi_latam',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: 'Combien de pays d\'Amérique ont l\'espagnol comme langue officielle principale ?',
        options: ['15', '18', '21', '12'],
        answer: '18',
        explanation: '18 pays d\'Amérique ont l\'espagnol comme langue officielle : du Mexique à l\'Argentine, incluant Cuba et la République Dominicaine.',
      },
      {
        type: 'vrai_faux',
        question: 'Le Brésil est le seul pays d\'Amérique du Sud à ne pas avoir l\'espagnol comme langue officielle.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Le Guyana (anglais), le Suriname (néerlandais) et la Guyane française (territoire français) ne sont pas hispanophones. Le Brésil est le plus grand pays non hispanophone.',
      },
      {
        type: 'qcm',
        question: 'La "Pachamama" est un concept central dans les cosmovisions de :',
        options: [
          'Les peuples mayas du Mexique',
          'Les peuples andins (Quechua, Aymara)',
          'Les peuples guaranis du Paraguay',
          'Les peuples caribéens',
        ],
        answer: 'Les peuples andins (Quechua, Aymara)',
        explanation: '"Pachamama" (Mère Terre en quechua) est une divinité centrale des cosmovisions andines (Pérou, Bolivie, Équateur). Elle incarne la fertilité et la nature.',
      },
      {
        type: 'lacunaire',
        question: 'Le "___ " désigne le métissage entre populations européennes et indigènes en Amérique latine.',
        options: null,
        answer: 'mestizaje',
        explanation: 'Le "mestizaje" est le processus de métissage biologique et culturel entre colonisateurs européens et peuples indigènes, thème central de l\'identité latinoaméricaine.',
      },
      {
        type: 'vrai_faux',
        question: 'Le guaraní est co-langue officielle du Paraguay avec l\'espagnol.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Le Paraguay est le seul pays où une langue indigène (guaraní) est co-officielle et parlée au quotidien par plus de 90% de la population.',
      },
      {
        type: 'qcm',
        question: 'Buenos Aires est surnommée "la Paris de l\'Amérique du Sud" principalement pour :',
        options: [
          'Ses traditions indigènes',
          'Ses influences architecturales et culturelles européennes',
          'Ses carnavals tropicaux',
          'Ses influences africaines',
        ],
        answer: 'Ses influences architecturales et culturelles européennes',
        explanation: 'Buenos Aires a reçu de massives vagues d\'immigration européenne (Italiens, Espagnols, Français) à la fin du XIXe - début XXe siècle.',
      },
    ],
  },

  // ──────────────────────────────────────────────
  // DIDACTIQUE
  // ──────────────────────────────────────────────
  {
    title: 'Le CECRL : cadre, niveaux et compétences',
    theme: 'cecrl',
    domain: 'didactique',
    level: 'A',
    questions: [
      {
        type: 'qcm',
        question: 'Le CECRL a été publié par :',
        options: ['L\'Académie Française', 'Le Conseil de l\'Europe', 'L\'Union Européenne', 'L\'UNESCO'],
        answer: 'Le Conseil de l\'Europe',
        explanation: 'Le CECRL (Cadre Européen Commun de Référence pour les Langues) est publié par le Conseil de l\'Europe en 2001. Un volume complémentaire paraît en 2018-2020.',
      },
      {
        type: 'qcm',
        question: 'Le niveau B2 correspond à :',
        options: ['Utilisateur élémentaire avancé', 'Utilisateur indépendant avancé', 'Utilisateur expérimenté', 'Utilisateur indépendant intermédiaire'],
        answer: 'Utilisateur indépendant avancé',
        explanation: 'A (élémentaire : A1, A2), B (indépendant : B1 intermédiaire, B2 avancé), C (expérimenté : C1, C2). B2 est requis pour les études universitaires en langue.',
      },
      {
        type: 'vrai_faux',
        question: 'L\'approche actionnelle du CECRL considère l\'apprenant comme un "acteur social" accompissant des tâches.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'Le CECRL définit l\'apprenant comme un "acteur social" qui mobilise des compétences pour accomplir des "tâches" dans des domaines d\'action réels.',
      },
      {
        type: 'qcm',
        question: 'La compétence communicative, selon le CECRL, comprend :',
        options: [
          'Uniquement la compétence linguistique',
          'Compétences linguistique, sociolinguistique et pragmatique',
          'Grammaire et vocabulaire seulement',
          'Compétences écrites uniquement',
        ],
        answer: 'Compétences linguistique, sociolinguistique et pragmatique',
        explanation: 'Le CECRL définit 3 composantes : linguistique (phonologie, lexique, grammaire), sociolinguistique (registres, normes culturelles), pragmatique (cohérence, fonctions du langage).',
      },
      {
        type: 'lacunaire',
        question: 'Le CECRL distingue 5 activités langagières : production orale, production écrite, réception orale, réception écrite et ___.',
        options: null,
        answer: 'interaction',
        explanation: 'Les 5 activités langagières du CECRL incluent l\'interaction (orale et/ou écrite), qui implique l\'alternance de rôles producteur/récepteur.',
      },
      {
        type: 'vrai_faux',
        question: 'Le Portfolio Européen des Langues (PEL) est un outil d\'évaluation destiné uniquement aux enseignants.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Le PEL est un outil d\'auto-évaluation destiné aux apprenants. Il comprend un passeport de langues, une biographie langagière et un dossier.',
      },
      {
        type: 'qcm',
        question: 'Un apprenant A1 peut :',
        options: [
          'Comprendre des textes longs et complexes',
          'Se débrouiller dans la plupart des situations',
          'Utiliser des expressions familières et se présenter',
          'Produire des textes clairs et bien structurés',
        ],
        answer: 'Utiliser des expressions familières et se présenter',
        explanation: 'A1 ("découverte") : expressions familières, se présenter, poser des questions basiques à condition que l\'interlocuteur parle lentement.',
      },
    ],
  },
  {
    title: 'Approches et méthodes d\'enseignement des langues',
    theme: 'approches_pedagogiques',
    domain: 'didactique',
    level: 'B',
    questions: [
      {
        type: 'qcm',
        question: 'La méthode audio-orale (MAO) est associée à :',
        options: ['La théorie de Chomsky', 'Le behaviorisme de Skinner', 'L\'approche constructiviste', 'La didactique intégrée'],
        answer: 'Le behaviorisme de Skinner',
        explanation: 'La MAO s\'appuie sur le béhaviorisme : stimulus-réponse-renforcement. L\'apprentissage passe par la répétition de patterns (drills).',
      },
      {
        type: 'vrai_faux',
        question: 'Dans la méthode grammaire-traduction, la langue cible est le principal moyen d\'instruction.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'Dans la grammaire-traduction, la langue maternelle est le médium d\'instruction. C\'est la méthode directe qui bannit la langue maternelle.',
      },
      {
        type: 'qcm',
        question: 'L\'hypothèse de l\'"input compréhensible" (i+1) a été formulée par :',
        options: ['Dell Hymes', 'Stephen Krashen', 'Noam Chomsky', 'Jim Cummins'],
        answer: 'Stephen Krashen',
        explanation: 'Krashen (Monitor Model, 1982) : l\'acquisition se fait par exposition à un input légèrement supérieur au niveau actuel. L\'enseignement doit minimiser l\'"anxiété".',
      },
      {
        type: 'qcm',
        question: 'La "compétence de communication" a été théorisée par :',
        options: ['Chomsky', 'Dell Hymes', 'Krashen', 'Piaget'],
        answer: 'Dell Hymes',
        explanation: 'Dell Hymes (1972) introduit la "communicative competence" : savoir quand, comment et à qui parler est aussi important que connaître la grammaire.',
      },
      {
        type: 'lacunaire',
        question: 'L\'approche par tâches (TBLT) place la "___ " au cœur de l\'apprentissage.',
        options: null,
        answer: 'tâche',
        explanation: 'Le TBLT (Task-Based Language Teaching) : la tâche a un but communicatif réel, un processus et un résultat observable. La forme est apprise au service du sens.',
      },
      {
        type: 'vrai_faux',
        question: 'La méthode SGAV a été développée pour l\'enseignement du français langue étrangère.',
        options: ['Vrai', 'Faux'],
        answer: 'Vrai',
        explanation: 'La méthode SGAV (Guberina/Rivenc, années 1950-60) est d\'abord conçue pour le FLE ("Voix et Images de France", 1962). Elle combine structure, perception globale et support audiovisuel.',
      },
      {
        type: 'qcm',
        question: 'L\'approche communicative est née en réaction à :',
        options: ['La méthode directe', 'La méthode audio-orale et le SGAV', 'L\'approche actionnelle', 'La grammaire générative'],
        answer: 'La méthode audio-orale et le SGAV',
        explanation: 'L\'approche communicative (années 1970-80) critique les méthodes structurales (MAO, SGAV) pour leur focalisation sur la forme au détriment du sens et de l\'usage réel.',
      },
    ],
  },
  {
    title: 'Évaluation et compétences en ELE',
    theme: 'evaluation_ele',
    domain: 'didactique',
    level: 'C',
    questions: [
      {
        type: 'qcm',
        question: 'L\'évaluation "formative" a pour but de :',
        options: [
          'Certifier un niveau final',
          'Classer les apprenants',
          'Réguler le processus d\'apprentissage en cours',
          'Sélectionner les candidats',
        ],
        answer: 'Réguler le processus d\'apprentissage en cours',
        explanation: 'L\'évaluation formative intervient pendant le processus d\'apprentissage pour identifier les difficultés et ajuster la pédagogie. Elle s\'oppose à l\'évaluation sommative.',
      },
      {
        type: 'vrai_faux',
        question: 'Au CAPES d\'espagnol, la leçon se prépare sans documents.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'La leçon au CAPES se prépare en 3 heures avec accès à une documentation (manuels, dossiers). Le candidat construit une séquence pédagogique.',
      },
      {
        type: 'qcm',
        question: 'La "différenciation pédagogique" consiste à :',
        options: [
          'Traiter tous les élèves de la même façon',
          'Adapter objectifs, méthodes et supports aux besoins individuels',
          'Mettre les élèves en groupes de niveau permanent',
          'Supprimer les évaluations',
        ],
        answer: 'Adapter objectifs, méthodes et supports aux besoins individuels',
        explanation: 'La différenciation pédagogique (Meirieu, Przesmycki) adapte les pratiques d\'enseignement pour que chaque élève puisse progresser selon ses besoins et son rythme.',
      },
      {
        type: 'lacunaire',
        question: 'Le socle commun de connaissances, de compétences et de culture est organisé en ___ domaines.',
        options: null,
        answer: '5',
        explanation: 'Le socle commun (2015) : 5 domaines — (1) langages pour penser et communiquer, (2) méthodes et outils pour apprendre, (3) formation de la personne et du citoyen, (4) systèmes naturels et techniques, (5) représentations du monde.',
      },
      {
        type: 'qcm',
        question: 'Qu\'est-ce qu\'une "tâche" dans le sens du CECRL ?',
        options: [
          'Un exercice grammatical répétitif',
          'Une action finalisée qui mobilise des ressources pour atteindre un résultat',
          'Un test noté',
          'Un jeu de rôle sans objectif',
        ],
        answer: 'Une action finalisée qui mobilise des ressources pour atteindre un résultat',
        explanation: 'Le CECRL définit la tâche comme "toute visée actionnelle que l\'acteur se représente comme devant parvenir à un résultat donné en fonction d\'un problème à résoudre".',
      },
      {
        type: 'vrai_faux',
        question: 'L\'évaluation "diagnostique" se réalise en fin de séquence pour évaluer les acquis.',
        options: ['Vrai', 'Faux'],
        answer: 'Faux',
        explanation: 'L\'évaluation diagnostique se réalise en DÉBUT de séquence pour identifier les connaissances préalables et adapter les objectifs. L\'évaluation de fin de séquence est sommative.',
      },
    ],
  },
]

async function seed() {
  console.log('Truncating exercises and attempts...')
  await sql.query('TRUNCATE exercises RESTART IDENTITY CASCADE')

  console.log(`Seeding ${EXERCISES.length} exercises...`)

  for (const ex of EXERCISES) {
    const first = ex.questions[0]
    await sql.query(
      `INSERT INTO exercises
         (title, theme, domain, type, question, options, answer, explanation, level, source, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        ex.title,
        ex.theme,
        ex.domain,
        first.type,
        first.question,
        first.options ? JSON.stringify(first.options) : null,
        first.answer,
        first.explanation,
        ex.level,
        'curated',
        JSON.stringify(ex.questions),
      ]
    )
    const qCount = ex.questions.length
    console.log(`  ✓ [${ex.domain}] "${ex.title}" — ${qCount} questions`)
  }

  const total = EXERCISES.reduce((acc, ex) => acc + ex.questions.length, 0)
  console.log(`\n✓ Seed complete: ${EXERCISES.length} exercises, ${total} questions total`)
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
