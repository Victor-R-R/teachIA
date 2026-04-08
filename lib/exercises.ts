// Banque d'exercices CAPES d'espagnol
// Générée à partir du rapport du jury 2025 (Christine Lavail) et du guide Ellipses (Elvire Diaz, Marjorie Janer)

export type ExerciseType =
  | 'composition'
  | 'version'
  | 'theme'
  | 'grammaire'
  | 'civilisation'
  | 'didactique'
  | 'lecon'
  | 'entretien'

export type Level = 'A' | 'B' | 'C'

export interface Exercise {
  id: string
  type: ExerciseType
  niveau: Level
  titre: string
  enonce: string
  indications?: string
  pointsEvaluation?: string[]
  source?: string
}

export const EXERCISES: Exercise[] = [

  // ══════════════════════════════════════
  // COMPOSITION
  // ══════════════════════════════════════

  {
    id: 'comp-a1',
    type: 'composition',
    niveau: 'A',
    titre: 'Présentation du doc 1 — Dossier 2025',
    enonce: `Document 1 : Antonio de Capmany y de Montpalau, Centinela contra franceses (1808), derniers paragraphes de la première partie, rédigés pendant l'été 1808.

Quels sont les 5 éléments que le jury attend obligatoirement dans la présentation de ce document ? Pour chacun, rédigez 1 à 2 phrases de présentation en espagnol.`,
    indications: 'Pensez : auteur + contexte biographique, nature du texte, date et contexte historique, thème/idée principale, destinataires.',
    pointsEvaluation: [
      'Mention de Capmany (1742-1813), secrétaire de la Real Academia de la Historia, censor de libros, opposant à Godoy',
      'Nature du texte : pamphlet / discours pragmatique à visée de mobilisation',
      'Date de rédaction : été 1808, pendant la Guerra de la Independencia (pas "guerra de Independencia" sans article)',
      'Fragment situé à la fin de la première partie de l'œuvre — synthèse des idées exposées',
      'Destinataires : tous les Espagnols, appel aux Provinces via les juntas provinciales',
    ],
    source: 'Rapport du jury 2025, p. 6-7',
  },

  {
    id: 'comp-a2',
    type: 'composition',
    niveau: 'A',
    titre: 'Évaluation de problématiques — Dossier 2025',
    enonce: `Pour le dossier de la session 2025 (Capmany / Blanco White / Prim — thème "dominations et insoumissions"), évaluez ces trois problématiques. Pour chacune, dites si elle est recevable, partiellement recevable ou non recevable, et justifiez en 2-3 phrases.

A) "¿Qué piensan estos tres autores sobre la guerra?"
B) "¿En qué medida estos documentos, que denuncian situaciones de dominación y legitiman la insumisión, consiguen superar la retórica de la violencia y del rechazo, en las circunstancias que motivan su publicación, para proyectar una identidad y un proyecto político común?"
C) "¿Cómo se refleja la identidad española en los documentos del dossier?"`,
    pointsEvaluation: [
      'A) Non recevable : trop générale, ne tient pas compte de la thématique "dominations/insoumissions", ne permet pas un développement progressif',
      'B) Recevable : formulation du jury 2025, interroge le degré de violence, l'identité, le projet politique — problématique ouverte et progressive',
      'C) Partiellement recevable : pertinente mais trop vague, risque d'être réductrice, ne mentionne pas la dialectique domination/insoumission',
    ],
    source: 'Rapport du jury 2025, p. 9',
  },

  {
    id: 'comp-a3',
    type: 'composition',
    niveau: 'A',
    titre: 'Exercice plan — Dossier 2025',
    enonce: `Pour le dossier de la session 2025, vous avez retenu la problématique suivante :
"¿En qué medida la evolución de las ideas presentes en los documentos es representativa de los debates y avances de la época en relación con el cuestionamiento sobre la legitimidad del poder y de la identidad española, destacando cómo las opresiones llevan a la revuelta y a la ruptura?"

Proposez un plan en 3 parties avec 2 sous-parties chacune. Pour chaque partie, rédigez l'intitulé et indiquez quels documents y seront mobilisés.

Critères : le plan doit être progressif (pas chronologique doc par doc), chaque partie doit mobiliser les 3 documents, le plan doit répondre à la problématique.`,
    pointsEvaluation: [
      'Plan ne sépare pas les documents (1 doc = 1 partie est sévèrement sanctionné)',
      'Plan progressif et argumenté (ex: I. la dénonciation / II. l'identité / III. le projet politique)',
      'Les 3 documents mobilisés dans chaque partie',
      'Parties clairement articulées entre elles',
    ],
    source: 'Rapport du jury 2025, p. 9-10 + corrigé Ellipses p. 11-16',
  },

  {
    id: 'comp-b1',
    type: 'composition',
    niveau: 'B',
    titre: 'Rédaction de l\'introduction — Dossier 2025',
    enonce: `Rédigez en espagnol l'introduction complète du dossier de la session 2025 (Capmany / Blanco White / Prim).

L'introduction doit comprendre :
1. La présentation approfondie des 3 documents (auteur, nature, date, thème)
2. La mise en relation des documents entre eux (points communs, divergences)
3. Le lien avec la thématique "dominations et insoumissions"
4. Une problématique claire et rédigée en espagnol
5. L'annonce explicite du plan en 3 parties

Durée suggérée : 45 minutes. Longueur attendue : 250-350 mots.`,
    pointsEvaluation: [
      'Présentation de chaque document dépasse le simple paratexte',
      'Doc 1 situé dans l'économie de l'œuvre Centinela contra franceses',
      'Doc 2 : identification de Blanco White comme libéral en exil à Londres, presse d'opposition',
      'Doc 3 : identification du pronunciamiento comme genre discursif, La Gloriosa 1868',
      'Dissonances entre les 3 docs relevées (Capmany conservateur-national vs Blanco White libéral-éclairé)',
      'Problématique ouverte, en espagnol, répondant à la thématique',
      'Plan annoncé explicitement avec transitions logiques',
    ],
    source: 'Rapport du jury 2025, p. 5-9',
  },

  {
    id: 'comp-b2',
    type: 'composition',
    niveau: 'B',
    titre: 'Rédaction d\'une sous-partie — Légitimation de l\'insurrection',
    enonce: `À partir des trois documents du dossier 2025, rédigez en espagnol une sous-partie complète sur le thème : "La légitimation du recours à la violence comme moyen d'insurrection".

Consignes :
- Rédigez un paragraphe de 150-200 mots
- Citez et analysez au moins 2 extraits de documents différents (avec références de lignes)
- Utilisez des connecteurs logiques variés
- Évitez la paraphrase : toute citation doit être analysée
- Rédigez une phrase-bilan en fin de paragraphe`,
    pointsEvaluation: [
      'Mobilisation des 3 documents (pas seulement le doc 1)',
      'Citations exactes avec références de lignes entre guillemets',
      'Analyse des citations (ne pas se contenter de résumer)',
      'Connecteurs logiques variés : sin embargo, por otra parte, en efecto, de este modo...',
      'Phrase-bilan qui répond à la sous-partie et prépare la transition',
      'Langue correcte : accentuation, conjugaisons, accords',
    ],
    source: 'Rapport du jury 2025, p. 10 + corrigé p. 12-15',
  },

  {
    id: 'comp-b3',
    type: 'composition',
    niveau: 'B',
    titre: 'Dossier fictif — Chirbes et la mémoire',
    enonce: `Vous disposez d'un dossier fictif avec les éléments suivants :
- Doc 1 : Rafael Chirbes, La caída de Madrid (2000), chapitre final — mort de Franco, novembre 1975
- Doc 2 : Julio Llamazares, Luna de lobos (1985), extrait sur la maquis et la résistance
- Doc 3 : Photographie de foule place d'Oriente, Madrid, 20 novembre 1975 (manifestation franquiste)

Axe : "Mémoire(s) : écrire l'histoire, écrire son histoire" (programme spécialité LLCE 2026)

1. Rédigez une problématique en espagnol pour ce dossier.
2. Proposez un plan en 3 parties.
3. Rédigez la mise en relation des 3 documents (100 mots en espagnol).`,
    pointsEvaluation: [
      'Problématique mettant en tension mémoire collective / mémoire individuelle',
      'Plan évitant la séparation fond/forme et le plan chronologique doc par doc',
      'Mise en relation : points communs (mémoire de la résistance), divergences (point de vue, genre)',
      'Mention du contexte de la Transition démocratique espagnole',
    ],
    source: 'Programme officiel CAPES 2026, œuvres Chirbes',
  },

  {
    id: 'comp-c1',
    type: 'composition',
    niveau: 'C',
    titre: 'Simulation complète — Dossier sur le libéralisme espagnol',
    enonce: `Simulation d'épreuve complète (durée : 3h30).

Dossier "Discours et projets politiques dans l'Espagne du XIXe siècle" :
- Doc 1 : Antonio de Capmany, Centinela contra franceses (1808), extrait du chapitre 4 — appel aux juntas provinciales [imaginez un extrait de 30 lignes sur ce thème]
- Doc 2 : José María Blanco White, El Español n°1 (30 avril 1810) — analyse de la situation politique espagnole depuis Londres [imaginez un extrait de 25 lignes]
- Doc 3 : Proclamation du général Prim, Gaceta de Madrid, 19 septembre 1868 — appel au soulèvement libéral [imaginez un extrait de 20 lignes]

Thématique imposée : "Révolutions et ruptures"

Rédigez la composition complète en espagnol (introduction + développement en 3 parties + conclusion). Durée conseillée : 3h30.`,
    pointsEvaluation: [
      'Introduction complète avec les 5 étapes',
      'Développement de chaque partie avec sous-parties identifiables',
      'Tous les documents mobilisés dans chaque partie',
      'Citations analysées et référencées',
      'Conclusion : synthèse + réponse à la problématique + ouverture pertinente',
      'Langue : niveau C1/C2, accentuation parfaite, richesse lexicale',
    ],
  },

  // ══════════════════════════════════════
  // VERSION ES → FR
  // ══════════════════════════════════════

  {
    id: 'vers-a1',
    type: 'version',
    niveau: 'A',
    titre: 'Phrases avec pièges — aquel / volver a / nadie',
    enonce: `Traduisez ces phrases en français en évitant les pièges signalés par le jury 2025.

1. "Aquel verano, todos se echaban de menos en aquel pueblo perdido del sur."
2. "Volvió a leer la carta tres veces antes de responder."
3. "No había nadie que pudiera detenerlos en su camino."
4. "Le dijo a ella que viniera cuanto antes, aunque no le importara demasiado."
5. "Aunque supiera la verdad, nunca la revelaría."`,
    indications: '1. aquel = distance temporelle/affective en récit rétrospectif → ces... de l'époque / echarse de menos = manquer. 2. volver a + inf = de nouveau. 3. nadie que + subj → personne qui puisse. 4. COI féminin = lui (pas le). 5. aunque + subjonctif imparfait = même si / bien que (valeur hypothétique).',
    source: 'Rapport du jury 2025, section VERSION, pièges récurrents',
  },

  {
    id: 'vers-a2',
    type: 'version',
    niveau: 'A',
    titre: 'Phrases avec pièges — pronoms relatifs et COD/COI',
    enonce: `Traduisez en français :

1. "El escritor del que te hablé acaba de publicar una novela sobre la guerra."
2. "La mujer a quien le dio el libro no la conocía de antes."
3. "Es un asunto del que prefiero no hablar."
4. "Las ideas cuyo origen se remonta al liberalismo ilustrado..."
5. "El hombre que te vio ayer no era quien creías."`,
    indications: '1. del que = dont (relatif de complément prépositionnel). 2. COI féminin → lui / ne pas confondre avec le. 3. del que → dont (ne pas laisser "de lequel"). 4. cuyo = dont (possession). 5. quien = celui qui (relatif sans antécédent).',
  },

  {
    id: 'vers-b1',
    type: 'version',
    niveau: 'B',
    titre: 'Extrait de prose — El cuarto de atrás (style Carmen Martín Gaite)',
    enonce: `Traduisez ce passage en français. Soyez attentif au registre, aux temps verbaux et aux pièges lexicaux.

"Aquella tarde, cuando mi madre cerró la puerta del cuarto trasero, me puse a pensar en todas las cosas que nunca le había dicho. Era difícil empezar. Los recuerdos se echaban unos encima de otros, como ropa arrugada en un cajón que nadie se había molestado en ordenar desde hacía años. Aunque hubiera querido contárselo todo, no sabía por dónde empezar ni cómo hacerle entender que aquellos años no habían sido tan sencillos como ella recordaba."`,
    indications: 'Pièges : aquella tarde (ce soir-là / ce soir de jadis), ponerse a (se mettre à), echarse encima (s'entasser / se superposer), aunque + plus-que-parfait du subjonctif (même si elle avait voulu), hacerle entender (lui faire comprendre — COI féminin lui).',
    source: 'Inspiré du style de Carmen Martín Gaite (texte du corrigé 2025)',
  },

  {
    id: 'vers-b2',
    type: 'version',
    niveau: 'B',
    titre: 'Extrait de prose — Javier Cercas, mémoire et histoire',
    enonce: `Traduisez ce passage en français (style Javier Cercas, Soldados de Salamina) :

"Aunque Sánchez Mazas hubiera muerto en aquel bosque, nadie lo habría sabido nunca. El miliciano le miró a los ojos durante unos instantes que a él se le antojaron eternos, y no dijo nada. Luego se dio la vuelta y se alejó entre los árboles. Sánchez Mazas comprendió entonces que ese hombre anónimo había decidido salvarle la vida, sin que nada le obligara a ello, sin que nadie pudiera saberlo jamás."`,
    indications: 'Pièges : aunque + plus-que-parfait du subj (bien que / même si), antojarse = sembler / paraître (registre littéraire), darse la vuelta = se retourner, alejarse = s'éloigner, sin que + subjonctif = sans que.',
  },

  {
    id: 'vers-c1',
    type: 'version',
    niveau: 'C',
    titre: 'Passage complet — niveau concours (200 mots)',
    enonce: `Traduisez ce passage en français. Soignez le style, respectez le registre littéraire et évitez tout barbarisme.

"En aquella ciudad del sur, donde la vida transcurría lenta y silenciosa como las aguas del río en verano, vivía un hombre al que todos conocían pero con el que nadie hablaba. Se decía que había vuelto de la guerra con los ojos vacíos de quien ha visto demasiado, y que ya no era el mismo que se había marchado a los veinte años lleno de ilusiones y de proyectos. Su madre, que seguía esperándole cada tarde en la misma ventana desde la que le había visto partir, se preguntaba a veces si el hombre que volvió era realmente su hijo o tan sólo un fantasma que llevaba su nombre y su cara. No le preguntó nunca. Hay cosas que es mejor no saber para poder seguir viviendo."`,
    indications: 'Pièges : al que = que (relatif COD), se decía = on disait, haber vuelto = être revenu, el mismo que = le même que, se había marchado = il était parti, se preguntaba si = se demandait si, mejor no saber = mieux vaut ne pas savoir.',
  },

  // ══════════════════════════════════════
  // THÈME FR → ES
  // ══════════════════════════════════════

  {
    id: 'them-a1',
    type: 'theme',
    niveau: 'A',
    titre: 'Phrases — traduction du "on" et périphrases verbales',
    enonce: `Traduisez ces phrases en espagnol en choisissant la bonne construction.

1. "On frappa trois fois à la porte avant que quelqu'un réponde."
2. "On dit que la guerre allait bientôt finir."
3. "On nous avait prévenus trop tard pour changer quoi que ce soit."
4. "Dans ce quartier, on parle espagnol depuis des générations."
5. "Il venait d'arriver quand la nouvelle éclata."
6. "Elle était en train de lire lorsque le téléphone sonna."
7. "Il avait de nouveau relu ses notes avant l'examen."`,
    indications: '1-4 : on impersonnel = se + verbe 3e p.s. / 3e p. plur. / uno/una — JAMAIS nosotros si le narrateur est externe. 5 : venir de + inf = acabar de + inf. 6 : être en train de = estar + gérondif. 7 : de nouveau = volver a + inf.',
    source: 'Rapport du jury 2025, section THÈME, erreurs récurrentes',
  },

  {
    id: 'them-a2',
    type: 'theme',
    niveau: 'A',
    titre: 'Phrases — traduction du "dont" et des conditionnelles',
    enonce: `Traduisez en espagnol :

1. "L'auteur dont je t'ai parlé vient de publier un nouveau roman."
2. "Le livre dont il avait besoin n'était plus disponible."
3. "L'homme dont la femme est historienne travaille à l'université."
4. "Si tu viens demain, je t'expliquerai tout."
5. "Si j'étais libre, je partirais immédiatement."
6. "Si elle avait su la vérité, elle n'aurait rien dit."
7. "Même s'il avait voulu partir, il n'aurait pas pu."`,
    indications: '1 : del que / de quien + verbe parler de. 2 : que + necesitar (pas de préposition visible en ES). 3 : cuya mujer (possession, même sujet). 4 : si + présent ind → futur/présent. 5 : si + imparfait subj → conditionnel. 6-7 : si + plus-que-parfait subj → cond. passé.',
  },

  {
    id: 'them-b1',
    type: 'theme',
    niveau: 'B',
    titre: 'Extrait de prose — Le Roi des Aulnes (style Tournier)',
    enonce: `Traduisez ce passage en espagnol. Respectez le registre littéraire et évitez les calques du français.

"La forêt était silencieuse. On n'entendait plus que le craquement des branches sous le poids de la neige et, par instants, le cri lointain d'un oiseau que la nuit semblait avoir oublié. Il venait de refermer la porte derrière lui quand il remarqua que quelqu'un l'avait précédé sur ce chemin. Des empreintes fraîches s'enfonçaient dans la neige, si légères qu'on les aurait prises pour celles d'un enfant, bien qu'elles conduisissent trop profondément dans les ténèbres pour appartenir à un être humain."`,
    indications: 'Pièges : on n'entendait plus que = ya no se oía más que / solo se oía, le cri = el grito/chant selon contexte, venir de refermer = acabar de cerrar, remarquer = darse cuenta de / notar, des empreintes = huellas, on les aurait prises pour = se las habría tomado por, bien que + subj → aunque + subj imparfait.',
    source: 'Inspiré de Michel Tournier, Le Roi des Aulnes (texte THÈME 2025)',
  },

  {
    id: 'them-b2',
    type: 'theme',
    niveau: 'B',
    titre: 'Passage littéraire — concordance des temps et discours indirect',
    enonce: `Traduisez ce passage en espagnol :

"Il lui avait dit qu'il viendrait la voir dès que possible, mais elle savait bien qu'il ne viendrait pas. Elle se demandait pourquoi elle avait encore confiance en ses promesses. Les hommes comme lui ne changeaient jamais vraiment, même quand ils affirmaient le contraire. Elle décida qu'elle ne l'attendrait plus."`,
    indications: 'Concordance des temps au passé : il lui avait dit que → le dijo que + imparfait du subj (dijera) ou conditionnel (vendría). elle se demandait pourquoi = se preguntaba por qué. même quand = incluso cuando + indicatif (réalité répétée). elle décida = decidió + imparfait du subj ou infinitif.',
  },

  {
    id: 'them-c1',
    type: 'theme',
    niveau: 'C',
    titre: 'Passage complet — niveau concours (180 mots)',
    enonce: `Traduisez ce passage en espagnol. Soignez la langue, l'accentuation et le registre.

"Lorsqu'il prit conscience de ce qui s'était passé, il était trop tard pour revenir en arrière. On lui avait volé quelque chose d'irremplaçable, quelque chose dont il n'avait jamais mesuré la valeur tant qu'il l'avait possédé. Il se dit qu'il aurait dû faire plus attention, qu'il aurait pu éviter tout cela s'il avait voulu. Mais à quoi bon se lamenter sur ce qui aurait pu être différent ? La vérité, c'est qu'on ne sait jamais vraiment ce qu'on a jusqu'au moment où on le perd. Et cette leçon-là, si cruelle fût-elle, valait peut-être bien tous les livres qu'il avait lus."`,
    indications: 'Pièges : prit conscience = se dio cuenta de, tant qu'il l'avait possédé = mientras lo había poseído, à quoi bon = ¿de qué sirve?, si cruelle fût-elle = por muy cruel que fuera (concession au subjonctif), valait peut-être bien = quizás valía / tal vez valiera.',
  },

  // ══════════════════════════════════════
  // GRAMMAIRE
  // ══════════════════════════════════════

  {
    id: 'gram-a1',
    type: 'grammaire',
    niveau: 'A',
    titre: 'Ser / Estar — discrimination',
    enonce: `Complétez avec ser ou estar et justifiez votre choix :

1. La situación ___ muy complicada desde hace meses.
2. Los documentos ___ firmados por el general Prim.
3. El libro ___ de Capmany, publicado en 1808.
4. La reunión de las Cortes ___ en Cádiz.
5. Capmany ___ diputado por Cataluña.
6. La obra ___ dirigida a todos los españoles.
7. Juan Prim ___ muerto en diciembre de 1870.
8. El texto ___ muy difícil de interpretar sin conocer el contexto.`,
    indications: 'Ser : identité/définition, nationalité, matière, agent passif (ser + participé = voix passive). Estar : état/position, résultat d'une action (estar + participé = état résultant), lieu d'un événement (estar = localisation d'un fait).',
  },

  {
    id: 'gram-a2',
    type: 'grammaire',
    niveau: 'A',
    titre: 'Conditionnelles avec si — tableau et exercice',
    enonce: `1. Complétez ce tableau des conditionnelles avec si :

| Type | Protase (si + ...) | Apodose |
|------|-------------------|---------|
| Réelle (probable) | si + ___ indicatif | présent / futur / ___ |
| Potentielle (peu probable) | si + ___ subjonctif | ___ simple |
| Irréelle passée | si + ___ subjonctif | ___ passé |

2. Conjuguez correctement :
a) Si (tener, yo) tiempo, (leer) más.
b) Si (haber tenido, yo) tiempo, (leer) más.
c) Si (venir, tú) mañana, te lo (explicar, yo).
d) Si (poder, él) habría venido.
e) Si el pueblo (unirse) a la causa, la revolución (triunfar).`,
    indications: 'Type 1 : si + présent ind → présent/futur/impératif. Type 2 : si + imparfait subj (-ra/-se) → conditionnel simple. Type 3 : si + plus-que-parfait subj → conditionnel passé. JAMAIS si + futur / si + conditionnel.',
  },

  {
    id: 'gram-b1',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Bien qu\'avancer — aunque indicatif vs subjonctif',
    enonce: `Pour chaque phrase, choisissez entre indicatif et subjonctif après "aunque" et expliquez pourquoi.

1. "Aunque ___ (llover) todos los días, seguiremos trabajando." [fait habituel/prévu]
2. "Aunque ___ (saber) la verdad, no lo dirá nunca." [hypothèse — il ne sait pas forcément]
3. "Aunque me ___ (decir) que es verdad, no me lo creo." [fait constaté]
4. "Aunque ___ (poder) haberlo evitado, no hizo nada." [fait passé hypothétique]
5. "Aunque la guerra ___ (terminar) en 1814, sus consecuencias duraron décadas." [fait historique avéré]

Puis traduisez chaque phrase en français en choisissant entre "même si", "bien que", "quoique", "même s'il/elle avait...".`,
  },

  {
    id: 'gram-b2',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Traduction du "dont" — cuyo / de quien / del que',
    enonce: `Choisissez entre cuyo/cuya, de quien/de quienes, del que/de la que/de los que/de las que et justifiez :

1. "Es el escritor ___ te hablé ayer."
2. "Son los documentos ___ el jurado tiene en cuenta."
3. "El general ___ proclama fue decisiva para la revolución..."
4. "La mujer ___ hablamos no estará en la reunión."
5. "Los argumentos ___ depende toda su tesis son cuestionables."
6. "Es un problema ___ no me ocupo habitualmente."
7. "Las ideas ___ se nutre su pensamiento vienen del liberalismo."

Règle à retenir : cuyo = possession, accord avec le nom possédé, JAMAIS si un verbe les sépare. de quien/del que = complément prépositionnel d'un verbe ou d'un nom.`,
  },

  {
    id: 'gram-b3',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Périphrases verbales — valeurs aspectuelles',
    enonce: `Expliquez la valeur aspectuelle de chaque périphrase et traduisez en français :

1. "Acaba de publicar un artículo sobre la Revolución de 1868."
2. "Está escribiendo su tesis sobre Capmany desde hace tres años."
3. "Va a presentarse al concurso en junio."
4. "Lleva tres horas estudiando sin descanso."
5. "Volvió a leer el texto antes de entregar la copia."
6. "Había de ser una larga y penosa travesía." [registre littéraire]
7. "Dejó de resistir cuando las fuerzas le abandonaron."`,
    indications: 'acabar de = venir de (accompli récent) / estar + gér = être en train de (progressif) / ir a = aller (prospectif) / llevar + gér = faire... depuis (duratif) / volver a = faire à nouveau (réitératif) / haber de = devoir / être censé (obligation atténuée, registre soutenu) / dejar de = arrêter de.',
  },

  {
    id: 'gram-a3',
    type: 'grammaire',
    niveau: 'A',
    titre: 'Déictiques spatiaux en récit rétrospectif',
    enonce: `Dans un récit à la 3e personne au passé (narration rétrospective), choisissez le déictique correct et justifiez.

1. "Estaba sentado (aquí / allí) en la misma silla de siempre."
2. "Corrió hacia (este / aquel) edificio que aún humeaba."
3. "Todo (aquello / esto) había ocurrido hacía más de treinta años."
4. "Volvió a (aquella / esta) ciudad que tanto había amado en su juventud."
5. "(Aquellos / estos) tiempos ya no volverían."

Règle : Dans un récit rétrospectif (passé, distance temporelle ou affective), on utilise allí/allá, aquel/aquella/aquellos pour exprimer l'éloignement. Este/aquí renvoient au présent du narrateur ou à une proximité affective.`,
  },

  {
    id: 'gram-c1',
    type: 'grammaire',
    niveau: 'C',
    titre: 'Analyse grammaticale complète — passage du rapport 2025',
    enonce: `Analysez les phénomènes grammaticaux dans ce passage (inspiré du corrigé du jury 2025) :

"Si aquellos hombres hubieran podido prever lo que iba a ocurrir, habrían actuado de otro modo. Pero la historia no se deja domesticar fácilmente: aunque se conozcan bien los documentos del pasado, siempre hay algo que se escapa a la comprensión del presente. De ahí que sea tan importante releer estos textos con ojos nuevos, sin dejarse guiar únicamente por los prejuicios de la época."

Identifiez et expliquez :
1. Le type de conditionnelle et ses temps
2. La valeur de "aunque + subjonctif présent" (se conozcan)
3. "De ahí que + subjonctif" — construction et valeur
4. "sin dejarse guiar" — construction et traduction
5. La valeur de "se" dans "la historia no se deja" et "se conozcan"`,
  },

  // ══════════════════════════════════════
  // CIVILISATION
  // ══════════════════════════════════════

  {
    id: 'civ-a1',
    type: 'civilisation',
    niveau: 'A',
    titre: 'Chronologie — Espagne XIXe siècle',
    enonce: `Remettez dans l'ordre chronologique ces événements de l'histoire espagnole du XIXe siècle. Pour chacun, donnez la date exacte et une phrase d'explication (en espagnol si possible) :

A) La Gloriosa (Revolución de Septiembre)
B) Début de la Guerra de la Independencia contra Francia
C) Promulgation de la Constitution de Cádiz
D) Motín de Aranjuez
E) Désastre de 1898 (perte des dernières colonies)
F) Restauration bourbonienne (retour d'Alphonse XII)
G) Sexenio democrático (1ère République)
H) Règne d'Isabelle II`,
    pointsEvaluation: [
      'D) 1808 — Motín de Aranjuez (abdication Carlos IV en faveur de Fernando VII)',
      'B) Mai 1808 — Début de la Guerra de la Independencia',
      'C) 1812 — Constitution de Cádiz (première constitution libérale espagnole)',
      'H) 1833-1868 — Règne d'Isabelle II',
      'A) Septembre 1868 — La Gloriosa (pronunciamiento de Prim et alii)',
      'G) 1873-1874 — Sexenio démocratique, 1ère République',
      'F) 1875 — Restauration',
      'E) 1898 — Désastre (perte Cuba, Puerto Rico, Philippines)',
    ],
  },

  {
    id: 'civ-a2',
    type: 'civilisation',
    niveau: 'A',
    titre: 'QCM — XIXe siècle espagnol',
    enonce: `Répondez à ces questions à choix multiples. Pour chaque mauvaise réponse, expliquez pourquoi elle est incorrecte.

1. La Constitution de Cádiz (1812) est :
   a) La première constitution espagnole
   b) Une constitution conservatrice rédigée sous l'influence de l'Église
   c) Rédigée pendant l'occupation napoléonienne
   d) Signée par Fernando VII

2. José María Blanco White était :
   a) Un général de l'armée napoléonienne
   b) Un libéral espagnol exilé à Londres, fondateur du journal El Español
   c) Le président de la Junta Central de Cádiz
   d) Un prêtre conservateur opposé à la Constitution de 1812

3. La "Gloriosa" de 1868 mit fin au règne de :
   a) Fernando VII
   b) Carlos IV
   c) Isabel II
   d) Amadeo de Saboya

4. Le Pronunciamiento est :
   a) Un discours politique prononcé au Parlement
   b) Une déclaration d'indépendance
   c) Un soulèvement militaire destiné à provoquer un changement politique
   d) Un manifeste littéraire romantique`,
  },

  {
    id: 'civ-b1',
    type: 'civilisation',
    niveau: 'B',
    titre: 'Capmany — contextualisation approfondie',
    enonce: `Répondez à ces questions en espagnol (5-8 lignes chacune) :

1. Qui est Antonio de Capmany (1742-1813) ? Quelle est son idéologie politique ? En quoi est-elle contradictoire ?

2. Pourquoi le titre "Centinela contra franceses" est-il significatif ? Que signifie "centinela" dans le contexte de 1808 ? (Le jury valorisait l'identification et le commentaire de ce terme.)

3. Quels sont les deux destinataires principaux de Centinela contra franceses ? Comment Capmany adapte-t-il son discours selon le destinataire ?`,
    pointsEvaluation: [
      'Capmany : conservateur mais défenseur de la souveraineté nationale, secrétaire Real Academia de Historia, opposant à Godoy, élu aux Cortes de Cádiz',
      'Contradiction : défend les libertés mais avec une rhétorique conservatrice/nationale (pas libérale)',
      'Centinela : sentinelle — métaphore militaire et médiévale, gardien de la nation contre l'envahisseur',
      'Destinataires : tous les Espagnols (los compatriotas, los centinelas) + les Provinces (juntas provinciales)',
    ],
  },

  {
    id: 'civ-b2',
    type: 'civilisation',
    niveau: 'B',
    titre: 'El caso Padilla — Cuba et la liberté artistique',
    enonce: `Répondez en français (8-10 lignes chacune) :

1. Qui est Heberto Padilla ? Quel événement de 1971 déclenche "l'affaire Padilla" ?

2. Quelles ont été les réactions des intellectuels occidentaux (García Márquez, Vargas Llosa, Sartre, Semprun...) ? Pourquoi cet événement est-il un tournant dans les rapports entre la gauche intellectuelle et la Révolution cubaine ?

3. En quoi El caso Padilla (film de Pavel Giroud, 2022) renouvelle-t-il le regard sur cet événement ? Quel angle documentaire adopte-t-il ?`,
  },

  {
    id: 'civ-b3',
    type: 'civilisation',
    niveau: 'B',
    titre: 'La Transition démocratique — Chirbes et la mémoire',
    enonce: `À partir de vos connaissances sur Rafael Chirbes et La caída de Madrid (2000), répondez en espagnol :

1. Quel événement historique est au cœur du roman ? Quelle est la date précise et sa signification ?
2. Comment Chirbes représente-t-il différentes classes sociales face à la mort de Franco ?
3. En quoi ce roman s'inscrit-il dans le courant de la "novela de la memoria histórica" ? Citez 2 autres auteurs qui s'inscrivent dans ce courant.`,
  },

  {
    id: 'civ-c1',
    type: 'civilisation',
    niveau: 'C',
    titre: 'Analyse croisée — Capmany, La caída de Madrid et la mémoire nationale',
    enonce: `Question de synthèse (niveau C, 400 mots en espagnol) :

"Del Centinela contra franceses (1808) de Capmany a La caída de Madrid (2000) de Chirbes, ¿en qué medida la literatura española ha servido como espacio de construcción y de cuestionamiento de la identidad nacional?"

Organisez votre réponse en 3 parties. Mobilisez au minimum : Capmany (1808), un auteur de la Generación del 98 (Unamuno ou Machado), Chirbes (2000). Ajoutez des références à El caso Padilla si pertinent.`,
  },

  // ══════════════════════════════════════
  // DIDACTIQUE (EEDA)
  // ══════════════════════════════════════

  {
    id: 'did-a1',
    type: 'didactique',
    niveau: 'A',
    titre: 'Identification d\'un fait de langue',
    enonce: `Identifiez le fait de langue souligné dans chaque phrase et expliquez sa nature grammaticale (5 lignes maximum).

1. "Si el mar pudiera hablar, contaría siglos de travesías y de muertes." [el mar pudiera hablar]
2. "Aunque se conozcan los documentos, siempre hay algo que escapa." [se conozcan]
3. "Lleva tres años estudiando sin obtener resultados." [Lleva... estudiando]
4. "De ahí que sea tan importante releer estos textos." [De ahí que sea]

Pour chaque fait de langue : a) Identifiez le temps et le mode, b) Expliquez sa valeur dans le contexte, c) Indiquez quel niveau CECRL serait approprié pour l'enseigner.`,
  },

  {
    id: 'did-b1',
    type: 'didactique',
    niveau: 'B',
    titre: 'Analyse complète d\'un fait de langue — format EEDA B2',
    enonce: `Corpus de phrases extraites de documents sur la mer (thème EEDA 2025 "Territoire et mémoire") :

A) "Si el mar no hubiera existido, estas culturas nunca habrían nacido."
B) "Si pudieras volver al mar de tu infancia, ¿lo reconocerías?"
C) "Si el viento viene del norte, los pescadores no salen."

Rédigez l'analyse complète du fait de langue (format B2 de l'EEDA) :
1. Identification du fait de langue et de son contexte syntaxique
2. Description morphosyntaxique précise (tableau si nécessaire)
3. Valeurs sémantiques en contexte pour chaque phrase
4. Intégration pédagogique : pour quel niveau (A2/B1/B2), dans quelle activité langagière dominante, avec quelle tâche finale ?`,
    pointsEvaluation: [
      'Identification : subordonnées conditionnelles avec si (types 1, 2, 3)',
      'Tableau clair des 3 types avec modes/temps',
      'Valeurs : A = irréelle passée (hypothèse contrefactuelle), B = potentielle (peu probable), C = réelle (habituelle)',
      'Niveau B1-B2 selon le type ; approche progressive : type 1 → 2 → 3',
      'Activité sugérée : production orale (EOC) ou écrite à partir de situation réelle',
    ],
    source: 'Rapport du jury 2025, EEDA section B2, p. 40',
  },

  {
    id: 'did-b2',
    type: 'didactique',
    niveau: 'B',
    titre: 'Conception d\'objectifs pédagogiques — séquence sur Puan',
    enonce: `Pour une séquence de 5 séances sur le film Puan (Argentine, 2023) en classe de Terminale (niveau B2), niveau spécialité LLCE, axe "Identités et échanges" :

1. Formulez 2 objectifs culturels (savoirs civilisationnels mobilisés)
2. Formulez 2 objectifs linguistiques (faits de langue ou compétences)
3. Formulez 1 objectif pragmatique (compétence de communication)
4. Proposez une tâche finale réaliste (60 mots max)

Critères : les objectifs doivent être précis, mesurables et adaptés au niveau B2 Terminale.`,
    pointsEvaluation: [
      'Objectifs culturels : crise UBA/universités publiques sous Milei + transmission du savoir, héritage intellectuel',
      'Objectifs linguistiques : voseo rioplatense + subordonnées conditionnelles ou discours rapporté',
      'Objectif pragmatique : argumenter une position sur la valeur de l'éducation publique',
      'Tâche finale réaliste : pas de scénario irréaliste (conférence internationale...) mais débat, lettre, article de blog...',
    ],
  },

  {
    id: 'did-c1',
    type: 'didactique',
    niveau: 'C',
    titre: 'Séquence complète — El caso Padilla (5 séances)',
    enonce: `Rédigez le plan d'une séquence pédagogique complète de 5 séances (55 min chacune) sur El caso Padilla (film de Pavel Giroud, 2022), pour une classe de Terminale spécialité LLCE espagnol (niveau B2-C1), axe "Identités et échanges — liberté artistique et censure".

Pour chaque séance, précisez :
- Le titre et la problématique de la séance
- Le(s) document(s) support(s)
- L'activité langagière dominante (CO/CE/EOC/EOI/EE/médiation)
- Une activité concrète avec consigne opérationnelle
- Les objectifs linguistiques et culturels

Séance 5 : évaluation sommative — précisez le type et les critères CECRL.`,
  },

  // ══════════════════════════════════════
  // ÉPREUVE DE LEÇON
  // ══════════════════════════════════════

  {
    id: 'lecon-a1',
    type: 'lecon',
    niveau: 'A',
    titre: 'Identification de la variété linguistique — Puan',
    enonce: `Pour le film Puan (Argentine, 2023), répondez à ces questions :

1. Quelle est la variété linguistique parlée dans ce film ? Donnez son nom précis.
2. Identifiez et expliquez 3 marqueurs phonétiques caractéristiques de cette variété.
3. Expliquez le phénomène du voseo : quelle est la conjugaison de "vos" au présent de l'indicatif pour les verbes en -ar, -er, -ir ? Donnez 3 exemples tirés du contexte du film.
4. Quel est l'intérêt pédagogique de travailler sur cette variété avec des lycéens ?`,
    pointsEvaluation: [
      'Espagnol rioplatense (Argentine/Uruguay)',
      '3 marqueurs : yeísmo rehilado ([ʒ] ou [ʃ] pour ll/y), seseo (pas de distinction c/s/z), voseo (vos au lieu de tú)',
      'Voseo : vos hablás / vos tenés / vos vivís (accent sur la dernière syllabe)',
      'Intérêt pédagogique : diversité du monde hispanophone, norme vs variétés, conscience linguistique',
    ],
    source: 'Rapport du jury 2025, séance modèle Puan, p. 53-57',
  },

  {
    id: 'lecon-a2',
    type: 'lecon',
    niveau: 'A',
    titre: 'Auto-évaluation — erreurs dans une introduction audiovisuelle',
    enonce: `Lisez cette introduction d'analyse de document audiovisuel (rédigée par un candidat fictif). Identifiez toutes les erreurs méthodologiques et expliquez comment les corriger.

---
"Ce document est un extrait du film Puan, un film argentin. Dans cet extrait, on peut voir plusieurs procédés cinématographiques intéressants : un plan d'ensemble, un gros plan sur le personnage principal, une musique de fond mélancolique et des dialogues rapides. Le film parle de l'université. Il est réalisé par deux réalisateurs. La langue utilisée est l'espagnol."
---`,
    pointsEvaluation: [
      'Erreur 1 : pas de date, pas de réalisateurs nommés, pas de contexte de production',
      'Erreur 2 : "plan d'ensemble, gros plan..." = catalogue de procédés sans analyse du sens',
      'Erreur 3 : "le film parle de..." = paraphrase, pas d'analyse',
      'Erreur 4 : "la langue utilisée est l'espagnol" = insuffisant — il faut identifier la variété (rioplatense), le voseo, le yeísmo rehilado',
      'Erreur 5 : pas de problématique',
      'Erreur 6 : rédigée en français alors que la partie 1 doit être en espagnol',
    ],
  },

  {
    id: 'lecon-b1',
    type: 'lecon',
    niveau: 'B',
    titre: 'Introduction d\'analyse audiovisuelle — La Singla',
    enonce: `Rédigez en espagnol l'introduction de l'analyse du document audiovisuel suivant (durée suggérée : 10 min / 150-200 mots) :

Document : Extrait du documentaire La Singla (Paloma Zapero, Espagne, 2023). La Singla était une danseuse de flamenco gitane, sourde de naissance, qui devint célèbre dans les années 1960-70 avant de tomber dans l'oubli. Le documentaire retrace son histoire à travers des témoignages et des archives.

L'introduction doit comprendre :
- La nature et les caractéristiques formelles du document
- L'identification de la variété linguistique
- Le contexte culturel (flamenco, peuple gitan, mémoire)
- Une problématique en espagnol
- L'annonce du plan`,
    pointsEvaluation: [
      'Nature : documentaire biographique, témoignages + archives',
      'Variété : espagnol péninsulaire standard + traces de l'andalou si présent (seseo)',
      'Contexte : histoire du flamenco gitan, discrimination du peuple gitan, figures oubliées',
      'Problématique : mémoire des artistes minorés / rapport au corps et à la transmission',
      'Plan annoncé en 2-3 parties cohérentes',
    ],
  },

  {
    id: 'lecon-b2',
    type: 'lecon',
    niveau: 'B',
    titre: 'Séance pédagogique — El hoyo (Partie 2 épreuve de leçon)',
    enonce: `À partir du film El hoyo (Galder Gaztelu-Urrutia, Espagne, 2019) — prison verticale où les détenus ne mangent qu'en fonction de leur étage, métaphore des inégalités sociales —

Rédigez en français la partie 2 de l'épreuve de leçon (séance pédagogique, max 20 min d'exposé) :

Niveau : Seconde générale (A2+/B1), axe "Vivre entre générations" OU Terminale (B2), axe "Identités et échanges"
Durée de la séance : 55 min

Développez :
- Objectifs (culturels, linguistiques, pragmatiques)
- Phase 1 : compréhension globale (10 min)
- Phase 2 : compréhension fine (15 min)
- Phase 3 : production (20 min)
- Trace écrite (5 min)
- Gestion du temps (minutage précis)`,
  },

  {
    id: 'lecon-c1',
    type: 'lecon',
    niveau: 'C',
    titre: 'Simulation complète — Casa de Bernarda Alba (film)',
    enonce: `Simulation d'épreuve de leçon complète (3h de préparation + 1h d'oral).

Document audiovisuel central : Extrait de 4 min d'une adaptation filmique de La casa de Bernarda Alba (Lorca) — scène de confrontation entre Bernarda et Adela. Espagnol péninsulaire, variété castillane standard.

Dossier complémentaire imaginaire :
- Doc 2 : Photo de Federico García Lorca (1936)
- Doc 3 : Extrait de presse sur les femmes sous le franquisme (El País, 2022)
- Doc 4 : Chronologie de la condition féminine en Espagne (1936-2022)

Axe programme lycée : "Mémoire(s) : écrire l'histoire" (spécialité LLCE) OU "Identités et échanges"

PARTIE 1 (30 min) : Rédigez en espagnol l'analyse complète du document audiovisuel.
PARTIE 2 (30 min) : Rédigez en français la séance pédagogique pour une classe de 1ère spécialité (B2), incluant le document audiovisuel.`,
  },

  // ══════════════════════════════════════
  // ENTRETIEN
  // ══════════════════════════════════════

  {
    id: 'entr-a1',
    type: 'entretien',
    niveau: 'A',
    titre: 'Partie 1 — Structure de l\'exposé "parcours et motivations"',
    enonce: `La partie 1 de l'entretien dure 5 min d'exposé + 10 min d'échange.

1. Quels sont les 4 éléments à impérativement inclure dans votre exposé de 5 min ? Listez-les et donnez un exemple de formulation pour chacun.

2. Quelles sont les 4 erreurs classiques sanctionnées par le jury selon le rapport 2025 ? Reformulez chacune en une règle positive.

3. Rédigez votre accroche d'ouverture (2-3 phrases) pour cet exposé, en vous projetant clairement dans le métier d'enseignant d'espagnol.`,
    pointsEvaluation: [
      'Éléments obligatoires : parcours de formation, expériences significatives (stages, voyages...), motivations pour l'enseignement, projection concrète dans le métier',
      'Erreurs à éviter : CV oralisé sans analyse, liste de textes officiels sans lien, ton monocorde, registre familier',
      'Accroche : personnalisée, anecdote concrète, lien avec la discipline',
    ],
    source: 'Rapport du jury 2025, section Entretien, p. 58-64',
  },

  {
    id: 'entr-b1',
    type: 'entretien',
    niveau: 'B',
    titre: 'Mise en situation — Laïcité et prosélytisme',
    enonce: `Situation professionnelle (type session 2025) :

Un élève de 3e distribue des tracts à caractère religieux prosélyte dans la cour de récréation. Plusieurs élèves se plaignent de pression. L'élève affirme que c'est son droit fondamental à la liberté d'expression.

1. Quelle est votre première réaction immédiate ?
2. Sur quels textes officiels vous appuyez-vous ? (Citez-en au moins 3 avec leur référence exacte)
3. Comment gérez-vous la relation avec les parents ?
4. Quelles suites donnez-vous à cet incident ?

Structurez votre réponse en 3-4 minutes d'exposé oral.`,
    pointsEvaluation: [
      'Textes : Charte de la laïcité (2013), Code de l'éducation (art. L141-5-1), Circulaire Chatel 2012, BO 2004 sur les signes religieux',
      'Distinction : liberté de conscience (privé) vs manifestation ostentatoire (interdit à l'école)',
      'Dialogue avec l'élève : expliquer sans punir d'emblée',
      'Information du CPE et du chef d'établissement',
      'Communication avec les parents : information neutre, pas d'accusation',
    ],
    source: 'Rapport du jury 2025, thèmes des mises en situation, p. 60-64',
  },

  {
    id: 'entr-b2',
    type: 'entretien',
    niveau: 'B',
    titre: 'Mise en situation — Harcèlement LGBTphobe',
    enonce: `Situation professionnelle (thème récurrent session 2025) :

Vous êtes professeur principal d'une classe de 2nde. Un élève vient vous voir discrètement pour vous signaler que son camarade subit des moqueries et des insultes à caractère LGBTphobe depuis plusieurs semaines. Il a peur de parler car les auteurs des insultes sont populaires dans la classe.

1. Comment évaluez-vous la gravité de la situation ?
2. Quelles étapes concrètes mettez-vous en place ? (Protocole de prise en charge)
3. Quel(s) dispositif(s) institutionnel(s) mobilisez-vous ?
4. Comment impliquez-vous les élèves dans une démarche de prévention ?`,
    pointsEvaluation: [
      'Dispositif pHARe (programme de lutte contre le harcèlement scolaire)',
      'Circulaire de février 2024 sur le harcèlement LGBTphobe',
      'Rôle du CPE, de l'infirmier scolaire, du psychologue EN',
      'Signalement au chef d'établissement',
      'Information bienveillante des parents (des deux parties)',
      'Travail en classe sur le respect et la diversité (sans exposer la victime)',
    ],
    source: 'Rapport du jury 2025, mises en situation, p. 61-64',
  },

  {
    id: 'entr-c1',
    type: 'entretien',
    niveau: 'C',
    titre: 'Simulation complète — Entretien session 2025',
    enonce: `Simulation complète de l'épreuve d'entretien (35 min).

PARTIE 1 (15 min) :
Rédigez votre exposé de 5 min (parcours et motivations) puis préparez 10 questions-réponses anticipées sur : votre conception de l'enseignement de l'espagnol, votre rapport à la culture hispanique, votre vision du futur professeur des lycées.

PARTIE 2 (20 min) :

Situation 1 (discipline) : Un élève de Terminale refuse de travailler en espagnol pendant votre cours, affirmant que "l'espagnol ne sert à rien" et que "c'est une matière inutile". Les autres élèves semblent acquiescer. Comment réagissez-vous et comment transformez-vous cette situation en opportunité pédagogique ?

Situation 2 (vie scolaire) : Vous apprenez qu'un de vos élèves de 1ère a plagié une composition en ligne (ChatGPT ou site de résumés). Ses parents contestent la décision du conseil de discipline. Quels sont vos arguments ? Sur quels textes vous appuyez-vous ?`,
    pointsEvaluation: [
      'Partie 1 : structure en 3 temps (passé/présent/futur), projection dans le métier, exemples concrets d'expériences',
      'Situation 1 : valoriser les langues vivantes (BO 2019, CECRL), exemples concrets de débouchés, médiation culturelle',
      'Situation 2 : fraude scolaire — règlement intérieur, BO sur l'intégrité académique, rôle formateur (apprendre à citer, à utiliser les sources)',
    ],
  },

  // ══════════════════════════════════════
  // COMPOSITION — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'comp-a4',
    type: 'composition',
    niveau: 'A',
    titre: 'Évaluer un plan — recevable ou non ?',
    enonce: `Pour le dossier 2025 (Capmany / Blanco White / Prim, thème "dominations et insoumissions"), évaluez ces deux plans. Pour chacun, dites s'il est acceptable selon les critères du jury, et justifiez.

PLAN 1 :
I. Capmany dénonce l'occupation française (doc 1)
II. Blanco White analyse la situation depuis Londres (doc 2)
III. Prim appelle à la révolution de 1868 (doc 3)

PLAN 2 :
I. La dénonciation d'un pouvoir illégitime comme déclencheur de l'insurrection
II. La construction d'une identité nationale espagnole dans la résistance
III. Les projets politiques portés par les insurgés

Puis proposez votre propre plan alternatif en 3 parties, en justifiant chaque intitulé.`,
    pointsEvaluation: [
      'Plan 1 : non recevable — un document par partie, sévèrement sanctionné par le jury (rapport 2025 p.10)',
      'Plan 2 : recevable — progressif, les 3 docs mobilisables dans chaque partie, répond à la thématique',
      'Plan alternatif : doit éviter le plan chronologique et le plan fond/forme',
    ],
    source: 'Rapport du jury 2025, section "Annonce du plan", p. 10',
  },

  {
    id: 'comp-a5',
    type: 'composition',
    niveau: 'A',
    titre: 'Rédiger une conclusion type',
    enonce: `À partir du plan suivant :
I. La violence comme argument politique légitime
II. La nation espagnole, sujet et enjeu des révolutions du XIXe siècle
III. Du soulèvement à la construction d'un projet politique commun

Et de la problématique :
"¿En qué medida estos documentos, que denuncian situaciones de dominación y legitiman la insumisión, consiguen superar la retórica de la violencia y del rechazo para proyectar una identidad y un proyecto político común?"

Rédigez en espagnol une conclusion complète (100-130 mots) comprenant :
1. La synthèse des 3 parties (reformulée, pas répétée)
2. La réponse directe à la problématique
3. Une ouverture pertinente et justifiée (pas de rapprochement approximatif)`,
    pointsEvaluation: [
      'Synthèse : reformule sans répéter les intitulés des parties',
      'Réponse à la problématique : répond directement à la question posée en introduction',
      'Ouverture : lien avec un autre auteur, une autre période ou une question contemporaine pertinente (ex : mémoire démocratique en Espagne aujourd'hui, Loi de 2022)',
      'Langue : niveau C1, accentuation correcte, connecteurs logiques (así pues, en definitiva, en suma...)',
    ],
  },

  {
    id: 'comp-b4',
    type: 'composition',
    niveau: 'B',
    titre: 'Dossier fictif — El caso Padilla (axe "Identités et échanges")',
    enonce: `Vous disposez d'un dossier fictif :
- Doc 1 : Heberto Padilla, poème "Fuera del juego" (1968), recueil censuré à Cuba
- Doc 2 : Déclaration d'intellectuels européens (Sartre, Vargas Llosa, Cortázar...) condamnant l'arrestation de Padilla (avril 1971)
- Doc 3 : Discours de Fidel Castro aux intellectuels cubains, Biblioteca Nacional (1961) : "Dentro de la Revolución, todo; fuera de la Revolución, nada."

Axe : "Identités et échanges — liberté artistique et pouvoir politique"

Travail demandé :
1. Rédigez en espagnol la présentation approfondie de chaque document (10 lignes/doc)
2. Rédigez la mise en relation des 3 documents (8-10 lignes en espagnol)
3. Proposez une problématique en espagnol
4. Proposez un plan en 3 parties avec sous-parties`,
    pointsEvaluation: [
      'Doc 1 : Padilla — contexte prix UNEAC 1968, censure du recueil, arrestation 1971, "autocritique" forcée',
      'Doc 2 : Lettre ouverte — rupture des compagnons de route de la Révolution, position de Vargas Llosa, García Márquez',
      'Doc 3 : discours fondateur de la politique culturelle castriste — "Palabras a los intelectuales"',
      'Mise en relation : tension liberté/engagement, révolution comme utopie trahie, rôle de l'intellectuel',
      'Problématique doit interroger la dialectique liberté artistique / engagement révolutionnaire',
    ],
  },

  {
    id: 'comp-b5',
    type: 'composition',
    niveau: 'B',
    titre: 'Mise en relation de documents — La Guerre Civile et la mémoire',
    enonce: `Exercice ciblé sur la mise en relation (étape 2 de la composition).

Imaginez un dossier sur la mémoire de la Guerre Civile espagnole :
- Doc 1 : Rafael Chirbes, La caída de Madrid (2000), scène finale — mort de Franco, novembre 1975
- Doc 2 : Extrait de presse, El País, 20 novembre 2022 — commémorations de la mort de Franco, débats sur la Loi de mémoire démocratique
- Doc 3 : Photo de la Valle de los Caídos (monument franquiste) avec grues de démantèlement (2023)

Rédigez uniquement la partie "mise en relation des documents" (150-200 mots en espagnol) en :
- Identifiant 3 points communs entre les documents
- Identifiant 2 divergences (nature, registre, époque, point de vue)
- Reliant l'ensemble à l'axe "Mémoire(s) : écrire l'histoire"`,
    pointsEvaluation: [
      'Points communs : mémoire de Franco / débat sur l'héritage franquiste / question de la réconciliation nationale',
      'Divergences : doc 1 = fiction littéraire / doc 2 = presse / doc 3 = document iconographique ; passé vs présent',
      'Lien avec l'axe : comment la mémoire historique se construit et se conteste dans le temps',
      'Langue : connecteurs de similarité (asimismo, de igual modo) et de différence (sin embargo, en cambio, por el contrario)',
    ],
  },

  {
    id: 'comp-c2',
    type: 'composition',
    niveau: 'C',
    titre: 'Simulation complète — Dossier Amérique latine',
    enonce: `Simulation d'épreuve complète (durée : 3h30).

Dossier "Mémoire, résistance et identité en Amérique latine" :
- Doc 1 : Javier Cercas, El impostor (2014), extrait sur la mémoire et le mensonge de soi (imaginez 25 lignes sur ce thème)
- Doc 2 : Déclaration de la Commission Vérité et Réconciliation du Chili (1991) — extrait sur les disparitions sous Pinochet
- Doc 3 : Photographie des Mères de la Place de Mai (Argentine, 1983) — silhouettes blanches, rassemblement hebdomadaire

Thématique imposée : "Mémoire(s) : écrire l'histoire, écrire son histoire"

Instructions : Rédigez la composition complète en espagnol (introduction + 3 parties développées + conclusion).
Gestion du temps suggérée : 30 min lecture/réflexion — 30 min introduction — 2h développement — 30 min conclusion + relecture.`,
    pointsEvaluation: [
      'Introduction : présentation de chaque doc sans paraphrase + mise en relation + problématique + plan',
      'Développement : 3 parties avec sous-parties, chaque doc mobilisé dans chaque partie',
      'Citations analysées avec lignes de référence',
      'Conclusion : synthèse + réponse + ouverture pertinente (ex : loi argentine sur les disparus, débats actuels)',
      'Langue : niveau C1/C2, richesse lexicale, accentuation parfaite',
    ],
  },

  // ══════════════════════════════════════
  // VERSION — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'vers-a3',
    type: 'version',
    niveau: 'A',
    titre: 'Phrases — temps verbaux et passé simple',
    enonce: `Traduisez en français en choisissant soigneusement les temps (passé simple vs imparfait, plus-que-parfait) :

1. "Cuando llegó, todos dormían."
2. "Había vivido allí durante veinte años antes de que la guerra lo obligara a huir."
3. "Mientras el general hablaba, los soldados escuchaban en silencio."
4. "Se dio cuenta de que había cometido un error irreparable."
5. "Lo que había empezado como una protesta se convirtió en revolución."
6. "Nunca supo por qué lo habían elegido a él."
7. "Apenas hubo terminado de hablar, estalló el tumulto."`,
    indications: '1. llegó = passé simple (action ponctuelle) / dormían = imparfait (état). 2. había vivido = plus-que-parfait (antériorité). 4. se dio cuenta = passé simple / había cometido = plus-que-parfait. 7. apenas hubo terminado = passé antérieur (rare en français moderne : à peine eut-il fini que...).',
  },

  {
    id: 'vers-a4',
    type: 'version',
    niveau: 'A',
    titre: 'Phrases — subjonctif espagnol → équivalents français',
    enonce: `Traduisez ces phrases contenant un subjonctif espagnol. Choisissez le meilleur équivalent français (subjonctif, infinitif, conditionnel, indicatif) :

1. "Quería que todos supieran la verdad."
2. "Era imposible que volviera."
3. "Buscaba un lugar donde pudiera descansar."
4. "Lo haré cuando llegues."
5. "Le pidió que no dijera nada."
6. "Aunque lo hubiera sabido, no habría actuado de otro modo."
7. "El hecho de que lo hubieran elegido sorprendió a todos."`,
    indications: '1. quería que + subj → voulait que + subjonctif. 2. era imposible que + subj → il était impossible qu'il revienne. 3. donde + subj (valeur hypothétique) → où il puisse. 4. cuando + subj futur → quand + indicatif futur. 5. le pidió que + subj → lui demanda de + inf (même sujet → inf). 6. aunque + ppq subj → même s'il l'avait su.',
  },

  {
    id: 'vers-b3',
    type: 'version',
    niveau: 'B',
    titre: 'Extrait — registre politique XIXe siècle (style Capmany)',
    enonce: `Traduisez ce passage en français en préservant le registre solennel et la rhétorique de combat :

"¿Qué somos sin patria? Sombras errantes, hojas secas que el viento arrastra sin rumbo. El pueblo que renuncia a su tierra renuncia a sí mismo. Y sin embargo, hay quienes prefieren doblar la cerviz ante el extranjero antes que empuñar las armas en defensa de lo que les pertenece por derecho de nacimiento y de historia. A estos hombres sin honra, a estos traidores de su propia sangre, no les pregunto qué harán cuando la victoria llegue: les pregunto qué dirán cuando sus hijos les pregunten qué hicieron cuando la patria los llamó."`,
    indications: 'Registre : rhétorique de combat, harangue, style élevé. Pièges : hojas secas = feuilles mortes/sèches ; arrastra sin rumbo = emporte sans direction ; doblar la cerviz = courber la tête/s'incliner ; empuñar = saisir/brandir ; por derecho de nacimiento = de droit de naissance ; lo que dirán = ce qu'ils diront (futur → futur).',
  },

  {
    id: 'vers-b4',
    type: 'version',
    niveau: 'B',
    titre: 'Extrait — registre contemporain (style Chirbes)',
    enonce: `Traduisez ce passage en français (style Rafael Chirbes, La caída de Madrid) :

"Esteban sabía que aquello iba a terminar, aunque nadie se atreviera a decirlo en voz alta. Llevaba semanas observando las caras de sus compañeros, leyendo en ellas el miedo mezclado con algo parecido al alivio. Él también lo sentía, ese alivio extraño que daba vergüenza reconocer. Como si todo lo que habían construido juntos durante cuarenta años hubiera sido una mentira conveniente de la que todos necesitaban despertar pero ninguno sabía cómo."`,
    indications: 'Pièges : aquello iba a terminar = cela allait finir (périphrase ir a + inf au passé) ; aunque nadie se atreviera = bien que personne n'ose / même si personne n'osait ; llevaba semanas observando = il passait des semaines à observer / cela faisait des semaines qu'il observait ; eso que daba vergüenza reconocer = cette chose qu'on avait honte de reconnaître ; hubiera sido = avait été (ppq subj).',
  },

  {
    id: 'vers-c2',
    type: 'version',
    niveau: 'C',
    titre: 'Passage complet — style Cervantes (registre classique)',
    enonce: `Traduisez ce passage en français en respectant le registre classique du XVIIe siècle. Ne modernisez pas la syntaxe.

"No hay cosa en la vida más peligrosa que la memoria, porque la memoria es la que nos hace sentir el peso de los años y la amargura de lo perdido. El hombre que recuerda demasiado no puede vivir en el presente; queda atrapado en un laberinto de sombras que él mismo ha construido con la argamasa de sus propios deseos y de sus propios miedos. Y sin embargo, ¿quién podría vivir sin memoria? ¿Quién sería capaz de abandonar todos sus recuerdos como se abandona una ciudad destruida, sin volver la vista atrás?"`,
    indications: 'Registre : style classique espagnol. Pièges : la argamasa = le mortier / le ciment (métaphore) ; queda atrapado = demeure emprisonné / reste prisonnier ; sin volver la vista atrás = sans se retourner / sans regarder en arrière (allusion à Loth) ; ¿quién sería capaz? = qui serait capable? (conditionnel de politesse).',
  },

  // ══════════════════════════════════════
  // THÈME — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'them-a3',
    type: 'theme',
    niveau: 'A',
    titre: 'Phrases — plus-que-parfait et antériorité',
    enonce: `Traduisez en espagnol en choisissant les bons temps pour exprimer l'antériorité :

1. "Elle n'avait jamais vu quelque chose d'aussi beau."
2. "Quand il arriva, la réunion avait déjà commencé."
3. "Il regretta de ne pas lui avoir dit la vérité."
4. "C'était la première fois qu'il entendait ce nom."
5. "Dès qu'elle eut lu la lettre, elle la brûla."
6. "Il avait espéré qu'elle reviendrait, mais il s'était trompé."
7. "Tout ce qu'il avait construit s'effondra en un instant."`,
    indications: '1. nunca había visto. 2. la reunión ya había empezado. 3. lamentó no haberle dicho (même sujet → inf passé). 4. era la primera vez que oía (oír au ppq si l'on accentue l'antériorité : había oído). 5. En cuanto hubo leído = passé antérieur ou nada más leer + ind. 6. había esperado que volviera (subj imparfait). 7. todo lo que había construido se derrumbó.',
  },

  {
    id: 'them-a4',
    type: 'theme',
    niveau: 'A',
    titre: 'Phrases — infinitif français vs subjonctif espagnol',
    enonce: `En espagnol, l'infinitif français se traduit souvent par un subjonctif. Traduisez ces phrases :

1. "Il voulait partir avant que la guerre éclate."
2. "Elle l'a appelé pour qu'il comprenne la situation."
3. "J'ai peur qu'il ne vienne pas."
4. "Il est parti sans que personne le sache."
5. "Attends qu'il finisse avant de parler."
6. "Il est nécessaire que tu relises ta copie."
7. "Je suis surpris qu'il ait accepté cette décision."`,
    indications: '1. quería irse antes de que (mismo sujeto: antes de + inf si même sujet) → antes de que estallara la guerra. 2. para que entendiera. 3. temo que no venga. 4. sin que nadie lo supiera. 5. Espera a que termine. 6. Es necesario que releas. 7. Me sorprende que haya aceptado (subj présent si temps relatif au présent).',
  },

  {
    id: 'them-b3',
    type: 'theme',
    niveau: 'B',
    titre: 'Passage littéraire — Flaubert (style XIXe, concordance des temps)',
    enonce: `Traduisez ce passage en espagnol en respectant la concordance des temps et le registre littéraire :

"Elle ne savait pas comment lui expliquer ce qu'elle ressentait. Les mots lui manquaient, ou plutôt ils lui semblaient trop pauvres, trop ordinaires pour contenir ce qu'elle voulait lui dire. Elle avait espéré que le moment venu, quelque chose se produirait — une illumination, une clarté soudaine — qui lui permettrait enfin de parler. Mais rien ne vint, et elle se tut, comme elle s'était tue tant de fois avant."`,
    indications: 'Pièges : elle ne savait pas comment → no sabía cómo ; il lui semblaient → le parecían (parecerle) ; elle avait espéré que → había esperado que + subj imparfait (esperaba que se produjera) ; quelque chose se produirait → algo ocurriera (concordance au passé) ; qui lui permettrait → que le permitiera (subj imparfait) ; elle se tut → calló / guardó silencio.',
  },

  {
    id: 'them-b4',
    type: 'theme',
    niveau: 'B',
    titre: 'Dialogue au discours indirect — passage de roman',
    enonce: `Traduisez ce passage en espagnol en restituant correctement le discours indirect au passé :

"Il lui avait dit qu'il ne reviendrait plus, que tout était fini entre eux et qu'il valait mieux oublier ce qui s'était passé. Elle lui avait répondu qu'elle comprenait, mais qu'elle ne pouvait pas l'oublier aussi facilement qu'il semblait le croire. Il n'avait rien ajouté. Le silence qui suivit fut plus long et plus douloureux que toutes les paroles qu'ils auraient pu échanger."`,
    indications: 'Discours indirect au passé — concordance : il lui avait dit que + conditionnel → le había dicho que no volvería más / que todo había terminado. elle lui avait répondu que → le había respondido que entendía, pero que no podía olvidarlo. que toutes les paroles qu'ils auraient pu → que todas las palabras que habrían podido intercambiar.',
  },

  {
    id: 'them-c2',
    type: 'theme',
    niveau: 'C',
    titre: 'Passage complet — Camus / Sartre (registre philosophique)',
    enonce: `Traduisez ce passage en espagnol. Conservez le registre philosophique et la densité stylistique.

"La liberté n'est pas un état auquel on parvient une fois pour toutes : c'est un combat permanent contre soi-même et contre les forces qui cherchent à nous réduire au silence. Celui qui renonce à lutter sous prétexte que la lutte est vaine ne mérite pas le nom d'homme libre. Car la liberté ne s'hérite pas : elle se conquiert chaque jour, dans les petits actes autant que dans les grands gestes, dans le refus de mentir autant que dans le courage de dire la vérité, même quand cette vérité dérange."`,
    indications: 'Pièges : à laquelle on parvient = a la que se llega ; une fois pour toutes = de una vez para siempre / definitivamente ; sous prétexte que = so pretexto de que + ind/subj ; ne mérite pas = no merece ; elle se conquiert = se conquista (réfléchi passif) ; même quand cette vérité dérange = aunque esta verdad incomode (subj présent).',
  },

  // ══════════════════════════════════════
  // GRAMMAIRE — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'gram-a4',
    type: 'grammaire',
    niveau: 'A',
    titre: 'Subjonctif présent — conjugaison et emploi',
    enonce: `1. Conjuguez au subjonctif présent (toutes les personnes) :
   a) hablar   b) tener   c) ser   d) ir   e) saber   f) poner

2. Complétez avec l'indicatif ou le subjonctif présent et justifiez :
   a) Espero que (venir, tú) ____ pronto.
   b) Creo que (tener, él) ____ razón.
   c) No creo que (tener, él) ____ razón.
   d) Es importante que (estudiar, vosotros) ____ cada día.
   e) Está claro que (ser) ____ un problema grave.
   f) Dudo que (poder, nosotros) ____ terminar a tiempo.
   g) Me alegro de que (haber) ____ llegado sanos y salvos.`,
    indications: 'Règle générale : verbes de volonté/émotion/doute/jugement + que → subjonctif. Verbes de certitude/opinion affirmative (creer, estar claro) → indicatif. Négation du verbe principal → bascule souvent vers le subjonctif.',
  },

  {
    id: 'gram-a5',
    type: 'grammaire',
    niveau: 'A',
    titre: 'Por / Para — discrimination',
    enonce: `Complétez avec por ou para et justifiez votre choix :

1. Este libro fue escrito ___ Capmany en 1808.
2. Lo hizo todo ___ salvar a su familia.
3. Lucharon ___ la libertad durante años.
4. Salgo ___ Madrid mañana por la tarde.
5. Gracias ___ tu ayuda, todo salió bien.
6. ___ ser tan joven, escribe con una madurez sorprendente.
7. Te doy diez euros ___ ese libro viejo.
8. El general fue reconocido ___ sus tropas como un héroe.
9. Aún no estoy ___ tomar esa decisión.
10. Trabaja ___ una empresa barcelonesa desde hace años.`,
    indications: 'POR : agente passif, durée, échange/prix, cause, mouvement à travers, au nom de. PARA : but/finalité, destination, bénéficiaire, date limite, opinion personnelle (para mí), concession (para + inf = "pour quelqu'un qui").',
  },

  {
    id: 'gram-b4',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Subjonctif dans les subordonnées relatives',
    enonce: `Le subjonctif est obligatoire dans les relatives quand l'antécédent est indéfini/hypothétique ou nié. Choisissez le mode correct et expliquez :

1. Busco un colaborador que ___ (hablar) varios idiomas. [existence incertaine]
2. Encontré un colaborador que ___ (hablar) varios idiomas. [existence certaine]
3. No hay nadie que ___ (poder) resolverlo. [négation totale]
4. ¿Conoces a alguien que ___ (saber) tocar la guitarra?
5. El primero que ___ (llegar) recibirá el premio.
6. Sea quien ___ (ser), dile que no estoy.
7. Quiero leer el libro que ___ (escribir, tú) sobre la Transición.

Puis rédigez 3 exemples originaux illustrant cette règle dans le contexte du CAPES (dossier, séquence pédagogique, etc.).`,
  },

  {
    id: 'gram-b5',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Ser / Estar avec adjectifs — changement de sens',
    enonce: `Certains adjectifs changent de sens selon qu'ils sont construits avec ser ou estar. Expliquez la différence et traduisez en français :

1. a) "Es malo."   b) "Está malo."
2. a) "Es bueno."  b) "Está bueno."
3. a) "Es listo."  b) "Está listo."
4. a) "Es seguro." b) "Está seguro."
5. a) "Es vivo."   b) "Está vivo."
6. a) "Es aburrido." b) "Está aburrido."
7. a) "Es rico."   b) "Está rico."

Ensuite, traduisez ces phrases en espagnol :
a) "Ce film est ennuyeux mais les élèves ont l'air ennuyés quand même."
b) "Mon grand-père est encore vivant et en pleine forme."
c) "Es-tu sûr de ta réponse ?"`,
  },

  {
    id: 'gram-b6',
    type: 'grammaire',
    niveau: 'B',
    titre: 'Voseo rioplatense — conjugaison et usage',
    enonce: `Le voseo (usage de "vos" à la place de "tú") est caractéristique de l'espagnol rioplatense (Argentine, Uruguay). Crucal pour l'épreuve de leçon si le document est argentin.

1. Conjuguez "vos" au présent de l'indicatif pour : hablar / tener / ir / ser / poder / decir
2. Conjuguez "vos" au présent du subjonctif pour : hablar / tener
3. Conjuguez "vos" à l'impératif pour : hablar / tener / ir / ser
4. Identifiez les formes voseo dans ce dialogue et traduisez en espagnol péninsulaire standard :
   "— ¿Vos sabés lo que está pasando en la universidad?
   — Sí, te lo cuento si querés. Pero primero decime vos qué pensás hacer.
   — No sé. Estoy esperando que alguien me diga qué tengo que hacer."`,
    indications: 'Voseo présent : -ás/-és/-ís (hablás, tenés, vivís) — accent sur la dernière syllabe. Impératif : -á/-é/-í (hablá, tené, viví). Subjonctif : identique à "tú" (hables, tengas). Pas de diptongaison : poder → vos podés (pas *puedés).',
    source: 'Rapport du jury 2025, séance modèle Puan, p. 53-57',
  },

  {
    id: 'gram-c2',
    type: 'grammaire',
    niveau: 'C',
    titre: 'Analyse grammaticale complète — extrait de Capmany',
    enonce: `Analysez tous les phénomènes grammaticaux remarquables dans ce passage (inspiré de Centinela contra franceses) :

"¡Compatriotas! Si los traidores hubieran logrado sus propósitos, hoy seríamos esclavos de una potencia extranjera que no reconoce más ley que la de la fuerza. Pero el pueblo español, cuya identidad forjaron siglos de resistencia, no se ha dejado domesticar. Aunque haya quienes duden de la victoria, los que aún creemos en la patria sabemos que, mientras quede un solo español en pie, la lucha continuará."

Identifiez et expliquez (avec terminologie précise) :
1. Le type de conditionnelle et ses temps/modes
2. La valeur de "cuya identidad forjaron siglos..."
3. "no se ha dejado domesticar" — construction et valeur aspectuelle
4. "Aunque haya quienes duden" — double subjonctif, expliquez
5. "los que aún creemos" — relatif sans antécédent exprimé
6. "mientras quede un solo español" — subjonctif temporel, expliquez`,
  },

  // ══════════════════════════════════════
  // CIVILISATION — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'civ-a3',
    type: 'civilisation',
    niveau: 'A',
    titre: 'QCM — Amérique latine et Boom littéraire',
    enonce: `Répondez aux questions suivantes. Pour chaque mauvaise réponse, expliquez pourquoi.

1. Le "Boom" littéraire latino-américain se caractérise principalement par :
   a) Le réalisme social et la dénonciation de la misère
   b) Le réalisme magique et l'expérimentation formelle, dans les années 1960-70
   c) La poésie engagée et les manifestes politiques
   d) La littérature de science-fiction et d'anticipation

2. Qui a écrit Cien años de soledad (1967) ?
   a) Mario Vargas Llosa    b) Julio Cortázar    c) Gabriel García Márquez    d) Jorge Luis Borges

3. La Révolution cubaine est datée de :
   a) 1956   b) 1959   c) 1962   d) 1968

4. Les "Mères de la Place de Mai" (Argentine) sont :
   a) Un mouvement féministe pour le droit à l'avortement
   b) Des femmes réclamant des nouvelles de leurs enfants disparus sous la dictature
   c) Un parti politique de gauche fondé après 1983
   d) Un groupe de théâtre militant des années 1970

5. Quel pays a vécu le coup d'état de Pinochet le 11 septembre 1973 ?
   a) Argentine   b) Uruguay   c) Chili   d) Bolivie`,
  },

  {
    id: 'civ-b4',
    type: 'civilisation',
    niveau: 'B',
    titre: 'La Generación del 98 — contexte et auteurs',
    enonce: `Répondez en espagnol (8-10 lignes chacune) :

1. Qu'est-ce que le "Desastre del 98" ? Quelles sont ses conséquences politiques, économiques et culturelles pour l'Espagne ?

2. Pourquoi parle-t-on d'une "Generación del 98" ? Quels sont les 3-4 auteurs les plus représentatifs ? En quoi leur vision de l'Espagne est-elle différente de celle de Capmany (1808) ?

3. Miguel de Unamuno développe dans Del sentimiento trágico de la vida (1913) le concept de "intrahistoria". Expliquez ce concept. En quoi est-il pertinent pour analyser La caída de Madrid de Chirbes ?`,
    pointsEvaluation: [
      '98 : perte Cuba/Philippines/Puerto Rico → crise identitaire profonde + remise en question du "régénérationnisme"',
      'Auteurs : Unamuno (Niebla, Del sentimiento trágico...), Machado (Campos de Castilla), Azorín (Castilla), Baroja (La busca)',
      'Intrahistoria : histoire vécue par les gens ordinaires vs Histoire officielle des grands événements — connexion avec Chirbes (histoires personnelles dans un contexte historique)',
    ],
  },

  {
    id: 'civ-b5',
    type: 'civilisation',
    niveau: 'B',
    titre: 'La Guerre Civile et la culture — témoignages et répression',
    enonce: `Répondez en français (8-10 lignes chacune) :

1. Quelles sont les principales causes de la Guerre Civile espagnole (1936-1939) ? Distinguez les causes profondes (sociales, économiques) et le déclencheur immédiat.

2. Comment les artistes et intellectuels espagnols ont-ils réagi face à la Guerre Civile ? Donnez 4 exemples précis (peintres, poètes, écrivains).

3. Qu'est-ce que la "Ley de memoria democrática" (2022) ? Quels débats suscite-t-elle en Espagne aujourd'hui ? En quoi est-elle pertinente pour analyser les œuvres au programme (Chirbes) ?`,
  },

  {
    id: 'civ-b6',
    type: 'civilisation',
    niveau: 'B',
    titre: 'Le flamenco et le peuple gitan — histoire et représentations',
    enonce: `Répondez en espagnol (6-8 lignes chacune) :

1. Quelles sont les origines du flamenco ? Pourquoi dit-on qu'il est une synthèse de cultures (arabe, juive, gitane, andalouse) ?

2. Qui est Carmen Amaya (1913-1963) ? Pourquoi est-elle une figure fondatrice du flamenco féminin ? Quel lien avec La Singla (documentaire 2023) ?

3. Comment le peuple gitan (pueblo gitano) est-il représenté dans la culture espagnole contemporaine ? Distinguez la figure romantique/stéréotypée et la réalité sociale (discrimination, pauvreté, exclusion).`,
    source: 'Rapport du jury 2025, sujets audiovisuels : La Singla, peuple gitan',
  },

  {
    id: 'civ-c2',
    type: 'civilisation',
    niveau: 'C',
    titre: 'Synthèse — Mémoire historique en Espagne (1975-2022)',
    enonce: `Question de synthèse (400-500 mots en espagnol) :

"¿En qué medida la cuestión de la memoria histórica en España, desde la Transición democrática (1975) hasta la Ley de Memoria Democrática (2022), sigue siendo un champ de batalla político e identitario?"

Organisez votre réponse en 3 parties. Vous pouvez mobiliser :
- La Transición et le "pacte d'oubli"
- Les exhumations des fosses communes (depuis les années 2000)
- La Ley de Memoria Histórica (2007) de Zapatero et la Ley de Memoria Democrática (2022) de Sánchez
- Le cas de La Valle de los Caídos (renommé Valle de Cuelgamuros, exhumation de Franco 2019)
- Les œuvres de Rafael Chirbes, Javier Cercas, Almudena Grandes comme espaces de mémoire`,
  },

  // ══════════════════════════════════════
  // DIDACTIQUE — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'did-a2',
    type: 'didactique',
    niveau: 'A',
    titre: 'Identifier les activités langagières',
    enonce: `Pour chaque activité proposée dans une séquence pédagogique, identifiez l'activité langagière dominante (CO, CE, EOC, EOI, EE, médiation) et le niveau CECRL ciblé.

1. Les élèves regardent un extrait de Puan (3 min) et cochent les informations qu'ils ont comprises sur une fiche.
2. Les élèves lisent un article en espagnol sur la crise de l'UBA et répondent à des questions de compréhension.
3. En binômes, les élèves débattent : "¿Debe el Estado financiar la universidad pública?" (5 min)
4. Chaque élève rédige un paragraphe d'opinion sur la valeur de l'éducation publique (150 mots).
5. Un élève explique en français à un camarade le contenu d'un document espagnol.
6. Les élèves participent à un débat de classe en espagnol sur Milei et les universités.
7. Les élèves lisent à voix haute des extraits de Chirbes et les commentent.

Précisez pour chacun : l'activité langagière + le niveau CECRL le plus adapté (A2/B1/B2/C1).`,
  },

  {
    id: 'did-a3',
    type: 'didactique',
    niveau: 'A',
    titre: 'Formuler des objectifs CECRL précis',
    enonce: `Voici des objectifs mal formulés. Reformulez-les de façon précise, mesurable et adaptée au niveau indiqué.

Niveau B1 (2nde) :
1. ❌ "Les élèves vont comprendre le film."
   ✅ Reformulez.

2. ❌ "Les élèves vont parler de la culture gitane."
   ✅ Reformulez.

Niveau B2 (Terminale) :
3. ❌ "Les élèves vont apprendre le voseo."
   ✅ Reformulez.

4. ❌ "Les élèves vont comprendre la politique de Milei."
   ✅ Reformulez.

Règle à mémoriser : un bon objectif CECRL commence par "L'élève sera capable de..." + verbe d'action (identifier, décrire, argumenter, expliquer, rédiger...) + contenu précis + condition ou critère de réussite.`,
  },

  {
    id: 'did-b3',
    type: 'didactique',
    niveau: 'B',
    titre: 'Analyse complète d\'un fait de langue — aunque indicatif/subjonctif',
    enonce: `Corpus de phrases extraites d'un dossier sur la résistance et la mémoire :

A) "Aunque la guerra terminó en 1939, sus heridas tardarían décadas en cerrarse." [fait avéré]
B) "Aunque no lo crean, muchas familias siguen buscando a sus desaparecidos." [doute implicite]
C) "Aunque hubieran querido olvidar, la memoria se imponía." [fait irréel/hypothétique passé]

Rédigez l'analyse complète au format EEDA (B2 de l'épreuve) :
1. Identification du fait de langue et de sa nature (1 paragraphe)
2. Description morphosyntaxique avec tableau (modes/temps/valeurs)
3. Valeur sémantique de chaque phrase du corpus
4. Proposition d'intégration pédagogique : niveau, activité langagière, consigne opérationnelle, tâche`,
    pointsEvaluation: [
      'Identification : conjonction de concession "aunque" + indicatif (fait réel/avéré) vs subjonctif (hypothèse/doute)',
      'Tableau : aunque + ind présent (réalité acceptée) / aunque + subj présent (doute/hypothèse) / aunque + subj imparfait (irréel présent) / aunque + subj ppq (irréel passé)',
      'Niveau : B1 pour le type indicatif / B2 pour le subjonctif avec opposition',
      'Consigne opérationnelle précise, pas "expliquez la différence" mais tâche concrète',
    ],
  },

  {
    id: 'did-b4',
    type: 'didactique',
    niveau: 'B',
    titre: 'Concevoir une activité de compréhension écrite (cycle 4)',
    enonce: `Vous utilisez ce court texte en classe de 4e (niveau A2+) dans le cadre du thème "Rencontres avec d'autres cultures" :

"Mi abuela llegó a Argentina desde España en 1950, huyendo de la posguerra. Trajo consigo una maleta, unas fotos y el recuerdo de un país que ya no existía. Nunca volvió, pero siempre habló español en casa. Gracias a ella, yo soy bilingüe."

Concevez :
1. Une activité de compréhension globale (5 min) avec consigne en français
2. Une activité de compréhension fine (10 min) avec 3 questions précises
3. Une mini-activité de réemploi linguistique ciblant un fait de langue du texte (5 min)
4. Une consigne de production (EOC ou EE, 10 min) en lien avec le thème "Rencontres avec d'autres cultures"`,
    pointsEvaluation: [
      'Compréhension globale : question ouverte sur le sens global (qui, quoi, où) — pas de questionnaire fermé en première lecture',
      'Compréhension fine : questions précises sur les informations importantes (pas triviales)',
      'Fait de langue pertinent : le passé composé vs le prétérit / l'imparfait de narration',
      'Production : tâche réaliste pour A2+ (parler de ses origines, de sa famille, d'un voyage)',
    ],
  },

  {
    id: 'did-c2',
    type: 'didactique',
    niveau: 'C',
    titre: 'Séquence complète — La caída de Madrid (1ère spécialité LLCE)',
    enonce: `Rédigez le plan d'une séquence pédagogique complète (6 séances de 55 min) sur La caída de Madrid de Rafael Chirbes (2000), pour une classe de 1ère spécialité LLCE espagnol (B2), axe "Mémoire(s) : écrire l'histoire, écrire son histoire".

Documents support possibles (à répartir dans la séquence) :
- Extrait du roman (mort de Franco, chapitre final)
- Photo historique de la foule place d'Oriente, Madrid, 20 novembre 1975
- Extrait d'une chanson de la Movida madrilène (années 1980)
- Article de presse sur les lois de mémoire historique (2007-2022)
- Interview de Rafael Chirbes sur son œuvre

Pour chaque séance :
- Titre et problématique de séance
- Document(s) support(s)
- Activité langagière dominante
- Consigne principale (opérationnelle)
- Objectif linguistique ou culturel

Séance 6 : évaluation sommative avec grille CECRL niveau B2.`,
  },

  // ══════════════════════════════════════
  // ÉPREUVE DE LEÇON — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'lecon-a3',
    type: 'lecon',
    niveau: 'A',
    titre: 'Comparaison de variétés linguistiques',
    enonce: `Comparez les variétés linguistiques dans ces deux contextes audiovisuels de la session 2025 :

Contexte A : Puan (Argentine, 2023) — deux professeurs de philosophie dialoguent à Buenos Aires
Contexte B : La casa de Bernarda Alba (adaptation filmique, Espagne) — Bernarda interpelle ses filles à Grenade

Pour chaque contexte, identifiez :
1. La variété linguistique et son nom précis
2. Les traits phonétiques caractéristiques (minimum 3 par variété)
3. Les traits morphosyntaxiques spécifiques (minimum 1)
4. L'intérêt pédagogique de confronter ces deux variétés dans une séquence

Puis : expliquez en 5 lignes pourquoi l'identification de la variété est une compétence évaluée à l'épreuve de leçon.`,
    pointsEvaluation: [
      'A : rioplatense — voseo, yeísmo rehilado [ʒ]/[ʃ], seseo, intonation distincte',
      'B : espagnol péninsulaire andalou ou castillan standard — distinction c/s/z (fricative interdentale [θ]), aspiration du -s en andalou, tuteo',
      'Intérêt pédagogique : conscience de la diversité du monde hispanophone, norme vs variation',
    ],
    source: 'Rapport du jury 2025, section épreuve de leçon, p. 49-52',
  },

  {
    id: 'lecon-a4',
    type: 'lecon',
    niveau: 'A',
    titre: 'Checklist — les 10 critères d\'une bonne introduction audiovisuelle',
    enonce: `Le jury de la session 2025 a listé les éléments attendus et non recevables dans l'introduction de l'analyse audiovisuelle.

Complétez cette checklist en indiquant pour chaque élément s'il est "attendu", "valorisé" ou "non recevable" :

1. Donner le titre, la date et le nom du réalisateur
2. Résumer l'histoire du film en détail
3. Identifier la nature du document (documentaire, fiction, reportage, extrait de film...)
4. Identifier la variété linguistique avec marqueurs phonétiques précis
5. Proposer une problématique rédigée en espagnol
6. Annoncer le plan en deux ou trois parties
7. Faire un catalogue de procédés filmiques (plan américain, gros plan...) sans les analyser
8. Contextualiser le document dans son contexte culturel/historique
9. Situer le film dans la filmographie du réalisateur
10. Commencer directement par l'analyse sans introduction

Puis : rédigez en 3 lignes la "règle d'or" de l'introduction audiovisuelle selon le rapport 2025.`,
    source: 'Rapport du jury 2025, section épreuve de leçon partie 1, p. 49-51',
  },

  {
    id: 'lecon-b3',
    type: 'lecon',
    niveau: 'B',
    titre: 'Analyse audiovisuelle complète — La Singla (développement)',
    enonce: `Document audiovisuel : La Singla (Paloma Zapero, Espagne, 2023), documentaire biographique sur Carmen Amaya "La Singla", danseuse de flamenco gitane née sourde en 1948, icône des années 1960 tombée dans l'oubli.

Rédigez en espagnol le développement complet de l'analyse audiovisuelle (parties I et II, après l'introduction) :

PARTIE I : "La Singla, figure d'exception dans le monde du flamenco" (analyse du fond)
- Identité artistique et corporelle
- Rapport à la surdité comme contrainte et comme force créatrice
- Inscription dans la tradition gitane et dans la mémoire collective

PARTIE II : "Une figure de l'oubli et de la mémoire" (analyse de la forme documentaire)
- Choix formels du documentaire : archives, témoignages, reconstruction
- La voix des témoins : qui parle, quelle légitimité ?
- Ce que le documentaire dit sur la mémoire des artistes minorés

Durée suggérée : 20 min de rédaction.`,
  },

  {
    id: 'lecon-c2',
    type: 'lecon',
    niveau: 'C',
    titre: 'Simulation épreuve de leçon — El caso Padilla (documentaire)',
    enonce: `Simulation d'épreuve de leçon complète (3h de préparation + 1h d'oral simulé).

Document audiovisuel central : Extrait de 4 min du documentaire El caso Padilla (Pavel Giroud, Cuba/Espagne/USA, 2022). L'extrait montre des images d'archives de l'arrestation de Padilla en 1971 et des extraits de sa "confession" publique forcée. Espagnol cubain (seseo, aspiration des consonnes finales, rythme différent du castillan).

Dossier complémentaire :
- Doc 2 : Lettre ouverte de 62 intellectuels à Fidel Castro (1971) — extrait
- Doc 3 : Poème de Heberto Padilla, "Fuera del juego" (1968)
- Doc 4 : Photo de la Biblioteca Nacional de Cuba (1961, discours Castro aux intellectuels)
- Doc 5 : Extrait de presse, El País (2022) — sortie du film

Axe programme : "Identités et échanges — liberté artistique et pouvoirs politiques"

PARTIE 1 (30 min en espagnol) : Analysez le document audiovisuel.
PARTIE 2 (30 min en français) : Concevez la séance pédagogique pour une classe de Terminale (B2-C1).`,
    pointsEvaluation: [
      'Partie 1 : identification espagnol cubain (seseo, aspiration -s final, intonation caraïbe), contextualisation historique précise',
      'Partie 2 : objectifs précis, progression globale → fine → production, consignes opérationnelles, trace écrite',
      'Lien entre les docs du dossier exploité dans la séance',
    ],
  },

  // ══════════════════════════════════════
  // ENTRETIEN — exercices supplémentaires
  // ══════════════════════════════════════

  {
    id: 'entr-a2',
    type: 'entretien',
    niveau: 'A',
    titre: 'Connaître les textes officiels — associer texte et contenu',
    enonce: `Associez chaque texte officiel à sa description. C'est une compétence évaluée dans les mises en situation.

TEXTES :
A. Référentiel de compétences des métiers du professorat (BO n°30, 25 juillet 2013)
B. Charte de la laïcité à l'École (2013)
C. Loi du 15 mars 2004 (signes religieux ostensibles)
D. Dispositif pHARe (Programme de lutte contre le Harcèlement scolaire)
E. Circulaire de février 2024 sur le harcèlement LGBTphobe
F. Guide de l'évaluation des apprentissages (novembre 2023)
G. Programmes officiels de langues vivantes (BO Spécial 2019)
H. CECRL — Cadre européen commun de référence pour les langues

DESCRIPTIONS :
1. Définit les compétences attendues d'un enseignant, organisées en 14 compétences communes et spécifiques.
2. Précise que les agents du service public doivent respecter le principe de neutralité religieuse.
3. Interdit le port de signes ou tenues manifestant ostensiblement une appartenance religieuse dans les écoles publiques.
4. Programme national de prévention du harcèlement scolaire, déployé dans tous les établissements depuis 2021.
5. Renforce le cadre de prise en charge des violences à caractère LGBTphobe en milieu scolaire.
6. Fournit des orientations sur l'évaluation formative et sommative dans les disciplines.
7. Définit les thèmes, axes d'étude et compétences pour l'enseignement des LVE.
8. Décrit les niveaux de langue A1 à C2 et les descripteurs de compétences.`,
    source: 'Rapport du jury 2025, épreuve d'entretien, p. 58-64',
  },

  {
    id: 'entr-a3',
    type: 'entretien',
    niveau: 'A',
    titre: 'Questions fréquentes du jury — préparer ses réponses',
    enonce: `Voici 8 questions que le jury pose fréquemment lors de la partie 1 de l'entretien (5 min exposé + 10 min échange). Pour chacune, préparez une réponse structurée de 3-4 phrases, en évitant les réponses vagues.

1. "Pourquoi avez-vous choisi d'enseigner l'espagnol plutôt qu'une autre langue ?"
2. "Quelle expérience vous a le plus marqué dans votre apprentissage de l'espagnol ?"
3. "Comment concevez-vous le rôle du professeur de langues vivantes au lycée ?"
4. "Que pensez-vous de l'utilisation du numérique dans l'enseignement des langues ?"
5. "Comment gérez-vous la diversité des niveaux dans une classe de lycée ?"
6. "Que signifie pour vous 'enseigner la culture hispanique' ?"
7. "Comment articulerez-vous votre enseignement avec les programmes officiels ?"
8. "Quelle est selon vous la principale difficulté de l'enseignement de l'espagnol en France ?"

Important : les réponses doivent être concrètes, ancrées dans des expériences réelles, et refléter une vraie réflexion sur le métier. Évitez les réponses génériques ("l'espagnol c'est une belle langue").`,
  },

  {
    id: 'entr-b3',
    type: 'entretien',
    niveau: 'B',
    titre: 'Mise en situation — Usage de l\'IA et plagiat numérique',
    enonce: `Situation professionnelle (thème émergent pour les sessions 2025-2026) :

Un élève de 1ère vous rend une composition sur un poème de Lorca. En la lisant, vous constatez que le style est incompatible avec son niveau habituel. Vous utilisez un outil de détection et obtenez un fort indice de probabilité de génération par IA (ChatGPT). L'élève nie avoir triché et affirme que "ChatGPT c'est comme Google, c'est de la recherche".

Questions :
1. Comment réagissez-vous immédiatement ? (sans accuser, sans ignorer)
2. Sur quels textes réglementaires vous appuyez-vous pour qualifier la situation ?
3. Quelle distinction établissez-vous entre "utilisation pédagogique de l'IA" et "fraude scolaire" ?
4. Quelle procédure disciplinaire pouvez-vous enclencher ?
5. Comment transformez-vous cet incident en opportunité pédagogique (apprendre à utiliser l'IA comme outil, pas comme substitut) ?`,
    pointsEvaluation: [
      'Textes : règlement intérieur, circulaire sur la fraude scolaire, BO sur l'intégrité académique',
      'Distinction : utilisation de l'IA pour s'aider (autorisée si déclarée) vs substitution du travail (fraude)',
      'Procédure : avertissement / rapport au CPE / conseil de classe / conseil de discipline selon la gravité',
      'Pédagogie : formation à la source, à la citation, au "prompt literacy" — enjeu 2025-2030',
    ],
  },

  {
    id: 'entr-c2',
    type: 'entretien',
    niveau: 'C',
    titre: 'Simulation complète — Questions sur le mémoire MEEF et le projet professionnel',
    enonce: `Simulation d'une partie 1 complète de l'entretien (15 min).

Préparez votre exposé de 5 min et des réponses aux questions de suivi suivantes (le jury pose ces questions dans les 10 min d'échange) :

1. "Vous avez mentionné votre stage en lycée. Quel moment précis vous a convaincu que l'enseignement était fait pour vous ? Ou au contraire, quel moment vous a fait douter ?"

2. "Si vous deviez citer un seul auteur ou une seule œuvre hispanophone qui vous a changé, lequel et pourquoi ?"

3. "Comment votre mémoire de master s'articule-t-il avec votre futur métier d'enseignant ?" [si pas de mémoire : "Quel aspect de votre formation vous sera le plus utile en classe ?"]

4. "Dans 5 ans, quel type de professeur d'espagnol voulez-vous être ?"

5. "Que pensez-vous des épreuves du CAPES ? Estimez-vous qu'elles évaluent bien les qualités requises pour enseigner ?"

Pour chaque question : structurez une réponse de 2-3 min, avec une position claire (pas de "d'un côté d'un autre côté" sans conclusion), des exemples concrets et un lien avec la pratique de classe.`,
    pointsEvaluation: [
      'Réponses situées dans des expériences concrètes (pas de généralités)',
      'Cohérence entre le discours et la posture corporelle (projection dans le métier)',
      'Capacité à se positionner sans dogmatisme (nuance ≠ indécision)',
      'Référence au rapport 2025 : qualités attendues = langue excellente + culture hispanique + projection dans le métier',
    ],
  },
]

// Index par type
export function getExercisesByType(type: ExerciseType): Exercise[] {
  return EXERCISES.filter(e => e.type === type)
}

// Index par niveau
export function getExercisesByLevel(niveau: Level): Exercise[] {
  return EXERCISES.filter(e => e.niveau === niveau)
}

// Exercice par ID
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id)
}

// Stats
export const EXERCISE_STATS = {
  total: EXERCISES.length,
  byType: {
    composition: EXERCISES.filter(e => e.type === 'composition').length,
    version: EXERCISES.filter(e => e.type === 'version').length,
    theme: EXERCISES.filter(e => e.type === 'theme').length,
    grammaire: EXERCISES.filter(e => e.type === 'grammaire').length,
    civilisation: EXERCISES.filter(e => e.type === 'civilisation').length,
    didactique: EXERCISES.filter(e => e.type === 'didactique').length,
    lecon: EXERCISES.filter(e => e.type === 'lecon').length,
    entretien: EXERCISES.filter(e => e.type === 'entretien').length,
  },
  byLevel: {
    A: EXERCISES.filter(e => e.niveau === 'A').length,
    B: EXERCISES.filter(e => e.niveau === 'B').length,
    C: EXERCISES.filter(e => e.niveau === 'C').length,
  },
}
