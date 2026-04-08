import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const FLASHCARDS = [
  // ─── LANGUE ──────────────────────────────────────────────────────────────
  {
    front: 'Le subjonctif présent — quand l\'utiliser ?',
    back: 'Après des verbes de volonté (querer que, pedir que), de sentiment (alegrarse de que, temer que), de doute/négation (dudar que, no creer que), et les conjonctions : para que, antes de que, aunque (hypothétique), a menos que, sin que.',
    domain: 'langue', level: 'A',
  },
  {
    front: 'SER vs ESTAR — distinction fondamentale',
    back: 'SER : identité, caractéristiques intrinsèques, profession, origine, matière, heure, possession, événements.\nESTAR : état temporaire ou perçu, localisation, résultat d\'une action (participiale), états d\'âme.\nEx. : "La sopa es caliente" (propriété) ≠ "La sopa está caliente" (état actuel).',
    domain: 'langue', level: 'A',
  },
  {
    front: 'POR vs PARA — distinction clé',
    back: 'POR : cause/motif (gracias por), échange (lo compré por 10€), durée (estudié por dos horas), moyen (por teléfono), agent du passif (fue escrito por), espace parcouru (pasé por Madrid).\nPARA : destination/but (salgo para Madrid, estudio para aprender), délai (para el lunes), opinion (para mí), bénéficiaire (esto es para ti).',
    domain: 'langue', level: 'A',
  },
  {
    front: 'Pretérito Indefinido vs Imperfecto — opposition aspectuelle',
    back: 'INDEFINIDO (passé simple) : action achevée, délimitée dans le temps, rupture ou séquence narrative.\nIMPERFECTO : action habituelle passée (antes comía aquí), description de cadre, action en cours interrompue (llovía cuando llegué), valeur de politesse.\nClé : le prétérit avance la narration, l\'imparfait la décrit.',
    domain: 'langue', level: 'A',
  },
  {
    front: 'Le subjonctif imparfait en espagnol — formation',
    back: 'Deux terminaisons équivalentes (-ra/-se) issues du plus-que-parfait latin.\nFormation : base de la 3e personne du pluriel du pretérito indefinido + terminaisons.\nEx. : hablar → hablaron → hablara/hablase\nUsage : subordonnées après verbe au passé, phrases hypothétiques (si + subj. imp.).',
    domain: 'langue', level: 'B',
  },
  {
    front: 'Les valeurs de SE en espagnol',
    back: '1. Réfléchi : se lava (il se lave)\n2. Réciproque : se quieren (ils s\'aiment)\n3. Passif réfléchi : se venden pisos\n4. Impersonnel : se come bien aquí\n5. SE dativique (datif d\'intérêt) : se me olvidó\n6. Neutralisation de l\'opposition ser/estar avec certains adjectifs : se puso rojo.',
    domain: 'langue', level: 'B',
  },
  {
    front: 'La phrase hypothétique en espagnol — les 3 types',
    back: 'Type 1 (réalisable) : Si + indicatif présent → indicatif présent/futur\n"Si tienes tiempo, llámame."\nType 2 (peu probable) : Si + subjonctif imparfait → conditionnel présent\n"Si tuviera dinero, viajaría."\nType 3 (irréel passé) : Si + subjonctif plus-que-parfait → conditionnel composé\n"Si hubiera sabido, no habría venido."',
    domain: 'langue', level: 'B',
  },
  {
    front: 'Comment traduire "dont" en espagnol ?',
    back: '"Dont" a plusieurs équivalents selon la fonction :\n• Relatif sujet/objet : cuyo/cuya/cuyos/cuyas (accord avec le nom qui suit, marque la possession)\n• Après préposition : del que / de la que / de quien\n• "dont je parle" → del que hablo\n• "dont le père" → cuyo padre\nPiège : cuyo est adjectif et s\'accorde avec le possédé.',
    domain: 'langue', level: 'B',
  },
  {
    front: 'Comment traduire "on" en espagnol ?',
    back: '4 stratégies selon le contexte :\n1. SE impersonnel : Se dice que… (on dit que)\n2. 3e personne du pluriel : Llaman a la puerta (on frappe)\n3. Passif : Los soldados fueron enviados (on envoya)\n4. UNO/UNA (registre soutenu) : Uno no sabe qué pensar\nPréférer se impersonnel en contexte didactique.',
    domain: 'langue', level: 'A',
  },
  {
    front: 'Les périphrases verbales essentielles',
    back: 'Aspectuelles :\n• IR A + inf. → futur immédiat / intention\n• ESTAR + gérondif → action en cours\n• ACABAR DE + inf. → passé récent\n• LLEVAR + gérondif → durée d\'une action en cours\n• DEJAR DE + inf. → cessation\n• VOLVER A + inf. → répétition\n• SEGUIR + gérondif → continuité\nModales : TENER QUE, HABER QUE, DEBER (DE)',
    domain: 'langue', level: 'A',
  },
  {
    front: 'Le discours indirect en espagnol — concordance des temps',
    back: 'Verbe introducteur au PRÉSENT → pas de changement temporel\n"Dice que viene mañana."\nVerbe introducteur au PASSÉ → décalage :\n• présent → imparfait\n• futur → conditionnel\n• prétérit → plus-que-parfait\n• subj. présent → subj. imparfait\nEx. : "Dijo que vendría al día siguiente."',
    domain: 'langue', level: 'B',
  },
  {
    front: 'Les pronoms relatifs en espagnol',
    back: 'QUE : relatif universel (sujet ou objet, personnes et choses)\nQUIEN/QUIENES : personnes uniquement, surtout après préposition\nEL QUE / LA QUE / LOS QUE / LAS QUE : après prépositions, relatif substantivé\nLO QUE : neutre (ce que) → "Lo que dices es interesante"\nCUYO/A : possessif relatif (s\'accorde avec le nom possédé)',
    domain: 'langue', level: 'B',
  },
  {
    front: 'Traduction de "faire faire" — causative',
    back: 'HACER + infinitif (causative factitive) :\n"Le hizo trabajar" = Il lui fit travailler\n"Hizo construir la casa" = Il fit construire la maison\nLe sujet du verbe subordonné est COI si le verbe subordonné a un COD, COD sinon.\nVariante littéraire : MANDAR + infinitif\nEx. : "Le mandó callar."',
    domain: 'langue', level: 'C',
  },
  {
    front: 'L\'accentuation en espagnol — règles générales',
    back: 'Règle générale (sans accent) :\n• Mots terminés en voyelle, N ou S → accent sur avant-dernière syllabe (llanas)\n• Mots terminés en consonne ≠ N/S → accent sur dernière syllabe (agudas)\nAccent graphique si la règle est brisée : café, árbol, examen\nAccent diacritique : distingue homophones (sí/si, tú/tu, él/el, más/mas, sé/se…)',
    domain: 'langue', level: 'A',
  },
  {
    front: 'Le CECRL — niveaux et descripteurs clés (langue)',
    back: 'A1-A2 : utilisateur élémentaire (survie communicative)\nB1-B2 : utilisateur indépendant (interaction spontanée, argumentation)\nC1-C2 : utilisateur expérimenté (maîtrise, précision, nuance)\nPour l\'espagnol au lycée : A2→B1 (collège), B1→B2 (lycée), objectif B2/C1 (terminale)\nLe CAPES exige du candidat un niveau C1-C2.',
    domain: 'langue', level: 'A',
  },

  // ─── CIVILISATION ESPAGNE ────────────────────────────────────────────────
  {
    front: 'La Guerre civile espagnole (1936-1939) — causes et enjeux',
    back: 'Causes : tensions sociales (réforme agraire), polarisation politique (Front populaire vs droite), montée des nationalismes régionaux, instabilité de la IIe République.\nDéclenchement : soulèvement militaire du 17-18 juillet 1936 mené par Franco, Mola, Queipo de Llano.\nEnjenx : affrontement République (soutenue par l\'URSS et les Brigades internationales) vs Nationalistes (soutenus par l\'Allemagne nazie et l\'Italie fasciste).',
    domain: 'civi_espagne', level: 'A',
  },
  {
    front: 'Le régime franquiste (1939-1975) — caractéristiques',
    back: 'Dictature autoritaire, nationaliste, catholique et anticommuniste.\nPiliers : Église catholique, armée, Phalange espagnole, Opus Dei (tardif).\nRépression : exil de 500 000 personnes, emprisonnements, exécutions (Lorca en 1936).\nÉvolution : autarcie (40s) → ouverture économique et "Plan de estabilización" (1959) → technocratie de l\'Opus Dei → boom économique des années 60.',
    domain: 'civi_espagne', level: 'A',
  },
  {
    front: 'La Transition démocratique espagnole (1975-1982)',
    back: 'Mort de Franco : 20 novembre 1975. Juan Carlos Ier roi d\'Espagne.\nActeurs clés : Adolfo Suárez (président du gouvernement), Santiago Carrillo (PCE), Felipe González (PSOE).\nÉtapes : Loi pour la Réforme politique (1976), légalisation des partis (1977), Pactes de la Moncloa (1977), Constitution de 1978 (référendum), 1er gouvernement socialiste (González, 1982).\n23-F (1981) : tentative de coup d\'État de Tejero, repoussée par le roi.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'Federico García Lorca — vie et œuvres majeures',
    back: 'Né en 1898 à Fuente Vaqueros (Grenade), fusillé en août 1936 par les franquistes.\nGénération de 27. Influences : Góngora, surréalisme, culture gitane, tradition populaire andalouse.\nThéâtre : Bodas de sangre (1932), Yerma (1934), La casa de Bernarda Alba (1936).\nPoésie : Romancero gitano (1928), Poeta en Nueva York (1940), Llanto por Ignacio Sánchez Mejías.\nThèmes : désir, mort, liberté, marginalité, condition féminine.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'Francisco Goya (1746-1828) — périodes et œuvres',
    back: 'Peintre aragonais, figure majeure entre Ancien Régime et modernité.\n4 périodes :\n1. Cartons de tapisseries (fêtes populaires, lumineuses)\n2. Portraits de cour : Charles IV et sa famille (critique voilée)\n3. Désastres de la guerre (1808-1814) : témoignage de l\'horreur, El 3 de mayo\n4. Peintures noires (1820-23) : Saturne dévorant son fils, angoisse existentielle\nPrécurseur de l\'expressionnisme et du surréalisme.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'La Movida madrileña (années 1980)',
    back: 'Explosion culturelle et contre-culturelle post-franquiste à Madrid (et Barcelone, Vigo).\nContexte : Transition démocratique, liberté retrouvée, hédonisme revendicatif.\nFigures : Pedro Almodóvar (cinéma), Alaska, Mecano, Radio Futura (musique), Ceesepe, El Hortelano (arts visuels).\nCaractéristiques : transgression, humour, sexualité libérée, mélange de pop culture et avant-garde.\nHéritage : repositionne l\'Espagne comme puissance culturelle en Europe.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'La Génération de 98',
    back: 'Groupe d\'écrivains espagnols nés vers 1870, marqués par la perte des dernières colonies (Cuba, Philippines, Porto Rico) en 1898 — "désastre" national.\nThème central : régénération morale et intellectuelle de l\'Espagne, identité nationale, "problème espagnol".\nAuteurs : Miguel de Unamuno (Niebla, Del sentimiento trágico de la vida), Antonio Machado (Campos de Castilla), Pío Baroja (El árbol de la ciencia), Azorín, Ramiro de Maeztu.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'La Génération de 27',
    back: 'Groupe poétique espagnol dont le nom commémore le tricentenaire de Góngora (1927).\nSynthèse entre tradition (Góngora, Bécquer, romancero) et avant-garde (surréalisme, ultraïsme).\nAuteurs : Federico García Lorca, Rafael Alberti, Jorge Guillén, Pedro Salinas, Luis Cernuda, Vicente Aleixandre (Nobel 1977), Gerardo Diego, Dámaso Alonso.\nLa guerre civile brise le groupe : exil, mort (Lorca), emprisonnement.',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'Guernica de Pablo Picasso (1937)',
    back: 'Huile sur toile (349 × 776 cm), commandée pour le Pavillon espagnol de l\'Exposition universelle de Paris.\nRéalisée après le bombardement de Guernica par la Légion Condor nazie (26 avril 1937, 150-1600 morts).\nSymbolisme : noir/blanc/gris (presse, deuil), cheval (peuple), taureau (brutalité), femme à l\'enfant mort, lampe électrique (œil froid), flamme de la liberté.\nConservée au Reina Sofía (Madrid) depuis 1992 (après 1939-1981 au MoMA).',
    domain: 'civi_espagne', level: 'A',
  },
  {
    front: 'La IIe République espagnole (1931-1939)',
    back: 'Proclamée le 14 avril 1931 après la fuite du roi Alphonse XIII.\nRéformes : séparation Église/État, suffrage féminin (1931), réforme agraire, autonomies régionales (Catalogne, Pays basque).\nInstabilité : alternance gauche/droite, "deux années noires" (Bienio negro, 1933-35), Révolution des Asturies (1934).\nFin : victoire du Front populaire (février 1936) → soulèvement militaire (juillet 1936) → guerre civile → fin de la République (1939).',
    domain: 'civi_espagne', level: 'B',
  },
  {
    front: 'Le Siècle d\'Or espagnol (XVIe-XVIIe siècle)',
    back: 'Apogée politique (Empire de Charles Quint et Philippe II) et culturelle.\nLittérature : Cervantes (Don Quijote, 1605-1615), Lope de Vega (dramaturge prolifique), Calderón de la Barca (La vida es sueño), Quevedo, Góngora (conceptisme vs culteranisme), Sor Juana Inés de la Cruz (Mexique).\nPeinture : El Greco, Velázquez (Las Meninas), Murillo, Zurbarán.\nParadoxe : déclin économique et géopolitique simultané à l\'essor artistique.',
    domain: 'civi_espagne', level: 'C',
  },

  // ─── CIVILISATION AMÉRIQUE LATINE ────────────────────────────────────────
  {
    front: 'Le Boom littéraire latino-américain (années 1960-70)',
    back: 'Explosion de la littérature hispano-américaine reconnue mondialement.\nContexte : révolution cubaine (1959), maisons d\'édition barcelonaises (Seix Barral), lecture internationale.\nAuteurs : Gabriel García Márquez (Colombie), Mario Vargas Llosa (Pérou), Julio Cortázar (Argentine), Carlos Fuentes (Mexique), José Donoso (Chili).\nCaractéristiques : réalisme magique, techniques narratives innovantes, engagement politique, rupture avec le réalisme traditionnel.',
    domain: 'civi_latam', level: 'A',
  },
  {
    front: 'Gabriel García Márquez — Cien años de soledad (1967)',
    back: 'Roman colombien, chef-d\'œuvre du réalisme magique. Prix Nobel de littérature 1982.\nSynopsis : l\'histoire de la famille Buendía à Macondo, ville fictive, sur 6 générations.\nThèmes : temps cyclique, solitude comme condition humaine, mémoire et oubli, déclin d\'une civilisation, colonialisme.\nTechnique : mélange du merveilleux et du quotidien présenté comme naturel, polyphonie narrative, hyperbolisme.\nIncipit célèbre : "Muchos años después, frente al pelotón de fusilamiento…"',
    domain: 'civi_latam', level: 'A',
  },
  {
    front: 'Le réalisme magique — définition et caractéristiques',
    back: 'Courant littéraire (et pictural) hispano-américain : intégration d\'éléments surnaturels dans une réalité quotidienne présentée comme normale.\nConcept théorisé par Alejo Carpentier ("lo real maravilloso") et Ángel Asturias.\nCaractéristiques : narrateur neutre face au merveilleux, ancrage dans cultures populaires/indigènes, critique sociale voilée, temporalité cyclique.\nAuteurs : García Márquez, Asturias (Nobel 1967), Rulfo (Pedro Páramo), Isabel Allende.',
    domain: 'civi_latam', level: 'B',
  },
  {
    front: 'La révolution cubaine (1959)',
    back: 'Renversement du dictateur Fulgencio Batista par Fidel Castro, Raúl Castro et Che Guevara (1er janvier 1959).\nÉtapes : débarquement du Granma (1956) → guérilla sierra → entrée à La Havane (1959).\nConséquences : nationalisation, réforme agraire, embargo américain (1960), Baie des Cochons (1961), crise des missiles (1962).\nImpact culturel : "Casa de las Américas", exportation du modèle révolutionnaire, figure du Che.',
    domain: 'civi_latam', level: 'A',
  },
  {
    front: 'Pablo Neruda — vie et poésie',
    back: 'Chilien (1904-1973), prix Nobel 1971. Nom de plume de Neftalí Reyes.\nŒuvres majeures :\n• Veinte poemas de amor y una canción desesperada (1924) : lyrisme amoureux\n• Residencia en la tierra (1933-35) : surréalisme, angoisse\n• Canto general (1950) : épopée de l\'Amérique latine, engagement communiste\n• Odas elementales (1954) : célébration des objets simples\nMort suspecte 12 jours après le coup de Pinochet (11 sept. 1973).',
    domain: 'civi_latam', level: 'B',
  },
  {
    front: 'Frida Kahlo (1907-1954) — vie et œuvre',
    back: 'Peintre mexicaine, icône féministe et figure du surréalisme mexicain (qu\'elle refusait).\nVie : accident de bus à 18 ans → 35 opérations, douleur chronique. Épouse de Diego Rivera (tumultueuse).\nThèmes : autoportraits (un tiers de l\'œuvre), corps et souffrance, identité mexicaine et indigène, maternité, mort, politique (militante communiste).\nŒuvres : Las dos Fridas (1939), La columna rota (1944), Autorretrato con monos.\nMise en lumière internationale par André Breton (1938).',
    domain: 'civi_latam', level: 'A',
  },
  {
    front: 'Le muralisme mexicain — contexte et figures',
    back: 'Mouvement artistique post-révolution mexicaine (1920s-50s), commandité par le gouvernement pour éduquer un peuple majoritairement analphabète.\n"Los tres grandes" :\n• Diego Rivera : fresques épiques, histoire du Mexique, marxisme (Palacio Nacional)\n• José Clemente Orozco : vision tragique, humanisme sombre\n• David Alfaro Siqueiros : technique expérimentale, activisme\nThèmes : histoire précolombienne, conquête espagnole, révolution, lutte des classes, identité mexicaine.',
    domain: 'civi_latam', level: 'B',
  },
  {
    front: 'Jorge Luis Borges — thèmes et œuvres majeures',
    back: 'Argentin (1899-1986), l\'un des écrivains les plus influents du XXe siècle.\nGenre : "fiction intellectuelle", contes philosophiques, labyrinthes mentaux.\nThèmes : infini, temps cyclique, identité, miroirs, bibliothèques, rêve/réalité, érudition fictive.\nŒuvres : Ficciones (1944, contient "La Biblioteca de Babel", "El jardín de senderos que se bifurcan"), El Aleph (1949), Laberintos.\nInfluence majeure sur la littérature mondiale (Calvino, Eco, Saramago).',
    domain: 'civi_latam', level: 'B',
  },
  {
    front: 'Julio Cortázar — la littérature fantastique',
    back: 'Argentin (1914-1984), figure du Boom. Vit à Paris dès 1951.\nCaractéristique : irruption du fantastique dans le quotidien banal.\nŒuvres :\n• Bestiario (1951), Las armas secretas (1959) : nouvelles fantastiques\n• Rayuela (1963) : roman-jeu, chapitres lisibles dans plusieurs ordres, métaroman\n• Cronopios y famas (1962) : humour absurde\n"La noche boca arriba", "Casa tomada" : nouvelles emblématiques.\nEngagement politique : soutien à Cuba, Nicaragua.',
    domain: 'civi_latam', level: 'C',
  },
  {
    front: 'Les civilisations précolombienne — Aztèques, Mayas, Incas',
    back: 'AZTÈQUES (Mexica) : Empire (1325-1521), capitale Tenochtitlan, religion sacrificielle, calendrier solaire de 365 jours. Conquis par Hernán Cortés.\nMAYAS : Mésoamérique (Mexique, Guatemala, Belize), apogée classique (250-900 ap. J.-C.), écriture glyphique, astronomie, calendrier de 365 et 260 jours.\nINCAS : Empire andin (1438-1533), capitale Cuzco, réseau routier (Qhapaq Ñan), quipus (comptabilité par nœuds). Conquis par Pizarro.',
    domain: 'civi_latam', level: 'A',
  },
  {
    front: 'Les dictatures militaires en Amérique latine (1960-1980)',
    back: 'Vague de régimes militaires en contexte de Guerre froide : soutien américain (doctrine Monroe, École des Amériques).\nPrincipaux régimes :\n• Chili : Pinochet (1973-1990), coup contre Allende\n• Argentine : Proceso (1976-1983), 30 000 disparus\n• Uruguay : régime militaire (1973-1985)\n• Brésil : dictature (1964-1985)\n• Paraguay : Stroessner (1954-1989)\nOpération Condor : coordination internationale des régimes pour éliminer opposants.',
    domain: 'civi_latam', level: 'B',
  },
  {
    front: 'Mario Vargas Llosa — vie et œuvres',
    back: 'Péruvien (né 1936), prix Nobel 2010. Parcours idéologique : de la gauche castriste au libéralisme.\nŒuvres majeures :\n• La ciudad y los perros (1963) : académie militaire, violence institutionnelle\n• La casa verde (1965) : structure narrative complexe\n• Conversación en La Catedral (1969) : dictature d\'Odría au Pérou\n• La fiesta del Chivo (2000) : dictature de Trujillo (République Dominicaine)\n• La guerra del fin del mundo (1981)\nCandidat à la présidence du Pérou en 1990 (battu par Fujimori).',
    domain: 'civi_latam', level: 'C',
  },

  // ─── DIDACTIQUE ──────────────────────────────────────────────────────────
  {
    front: 'Le CECRL — structure et utilité pour l\'enseignant',
    back: 'Cadre Européen Commun de Référence pour les Langues (Conseil de l\'Europe, 2001 ; complété en 2020).\nDimensions : 6 niveaux (A1→C2), 5 activités langagières (réception, production, interaction, médiation), compétences (communicative, plurilingue, interculturelle).\nOutilité : référentiel de progression, base des programmes, outil d\'évaluation et de certification (DELE, DELF).\nVolume complémentaire (2020) : ajout de la médiation, du plurilinguisme, de la compétence en ligne.',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'L\'approche actionnelle — définition et principes',
    back: 'Paradigme didactique central du CECRL : l\'apprenant est un "acteur social" qui réalise des tâches dans des contextes réels.\nPrincipes :\n• La langue est un outil d\'action, pas seulement de communication\n• L\'apprentissage s\'organise autour de tâches communicatives finales\n• Les activités de langue sont des moyens, la tâche est le but\n• Dimension collective et collaborative\nDifférence avec l\'approche communicative : la tâche a un résultat non linguistique (produit, action, décision).',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'La tâche communicative — caractéristiques',
    back: 'Définition CECRL : "toute visée actionnelle que l\'acteur se représente comme devant parvenir à un résultat donné".\nCaractéristiques d\'une tâche valide :\n1. Objectif non linguistique (résultat concret : document, décision, production)\n2. Contexte réel ou simulé vraisemblable\n3. Ressources linguistiques nécessaires mais pas suffisantes\n4. Évaluation du résultat ET de la langue\nEx. : "Organise un voyage en Espagne en négociant avec des partenaires espagnols."',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'La compétence communicative — modèle de Canale et Swain',
    back: 'Canale et Swain (1980), développé depuis Hymes (1972) :\n1. Compétence grammaticale : maîtrise du code linguistique\n2. Compétence sociolinguistique : adéquation au contexte social\n3. Compétence discursive : cohérence et cohésion textuelle\n4. Compétence stratégique : stratégies de compensation des manques\nLe CECRL y ajoute : compétence interculturelle, compétence plurilingue, compétence en médiation.',
    domain: 'didactique', level: 'B',
  },
  {
    front: 'La séquence didactique — structure type',
    back: 'Organisation pédagogique d\'une unité d\'enseignement :\n1. Mise en route / sensibilisation (activation des pré-requis, motivation)\n2. Compréhension globale → sélective → détaillée (document déclencheur)\n3. Travail sur la langue (grammaire, lexique en contexte)\n4. Production intermédiaire (tâche d\'entraînement)\n5. Production finale (tâche communicative évaluée)\nPrincipe : des activités de compréhension vers les activités de production, du global au détail.',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'Évaluation formative vs évaluation sommative',
    back: 'FORMATIVE (évaluation POUR l\'apprentissage) :\n• Continue, pendant l\'apprentissage\n• Diagnostic des difficultés → remédiation immédiate\n• Non notée ou indicative\n• Ex. : auto-évaluation, portfolio, quiz formatif\nSOMMATIVE (évaluation DE l\'apprentissage) :\n• En fin de séquence/période\n• Certification du niveau atteint, notation\n• Ex. : contrôle, baccalauréat, DELE\nTendance actuelle : intégrer des modalités formatives dans l\'évaluation sommative (évaluation certificative par compétences).',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'La différenciation pédagogique',
    back: 'Adapter l\'enseignement à la diversité des élèves sans différencier les objectifs finaux.\nLevier d\'action :\n• Contenus : documents variés selon niveau\n• Processus : étayage, aide méthodologique\n• Productions : tâches à plusieurs entrées possibles\n• Structure : groupes de compétences, tutorat pair\nDistinctions :\n• Différenciation successive : alterner les approches pour tous\n• Différenciation simultanée : activités parallèles selon profils\nRisque à éviter : stigmatisation, réduction des exigences pour certains.',
    domain: 'didactique', level: 'B',
  },
  {
    front: 'Les documents authentiques en classe de langue',
    back: 'Documents produits par et pour des locuteurs natifs, sans visée pédagogique initiale.\nAvantages : exposition à la langue réelle, motivation, compétence culturelle et interculturelle.\nLimites : difficulté parfois inadaptée, longueur, références culturelles opaques.\nVs documents fabriqués : écrits pour la classe, langue simplifiée mais dénaturée.\nTendance actuelle : privilégier l\'authentique mais adapter la tâche (pas le document) ; notion de "document semi-authentique" (extrait, adaptation).',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'La médiation linguistique et culturelle (CECRL 2020)',
    back: 'Grande nouveauté du Volume complémentaire du CECRL (2020).\nDéfinition : "créer les conditions pour communiquer et/ou coopérer" entre personnes qui ne partagent pas la même langue ou culture.\nNiveaux B2-C2 au CAPES.\nActivités de médiation :\n• Médiation de texte (résumer, paraphraser, reformuler)\n• Médiation conceptuelle (expliquer des données, faciliter la compréhension)\n• Médiation de communication (faciliter les échanges entre interlocuteurs)\nDistinction avec interprétation/traduction professionnelles.',
    domain: 'didactique', level: 'C',
  },
  {
    front: 'La grammaire en classe de langue : implicite vs explicite',
    back: 'EXPLICITE : règle énoncée puis appliquée (démarche déductive). Rapide, efficace pour adultes/adolescents avancés.\nIMPLICITE : règle induite par l\'exposition puis la pratique (démarche inductive). Plus longue mais mémorisation durable.\nGrammaire inductive : observation d\'exemples → conceptualisation → systématisation → entraînement.\nConsensu actuel : combiner les deux selon l\'item grammatical, le niveau et l\'âge des élèves. Éviter la "grammaire-leçon" isolée du sens.',
    domain: 'didactique', level: 'B',
  },
  {
    front: 'L\'intercompréhension entre langues romanes',
    back: 'Approche didactique : utiliser les parentés entre langues (espagnol, français, italien, portugais, catalan…) pour développer des compétences de compréhension réciproque.\nStratégies : identification des cognats, transferts morphologiques, conscience métalinguistique.\nProjet EuRom5 : lire 5 langues romanes simultanément.\nIntérêt pour l\'enseignement de l\'espagnol en France : exploiter les transferts FR→ES, identifier les faux amis (embarazada ≠ embarrassée).\nDimension plurilingue du CECRL.',
    domain: 'didactique', level: 'C',
  },
  {
    front: 'L\'étayage (scaffolding) en didactique des langues',
    back: 'Concept de Bruner (1983), issu de Vygotski (Zone Proximale de Développement).\nDéfinition : aide temporaire et ajustée apportée par l\'enseignant (ou les pairs) pour permettre à l\'élève d\'accomplir une tâche hors de portée seul.\nFormes : reformulation, modélisation, questions guidées, aide lexicale, grille de relance.\nPrincipe clé : l\'étayage doit être progressivement retiré ("fade-out") pour favoriser l\'autonomie.\nEn classe d\'espagnol : fiches lexicales, amorces de phrases, modèles de production.',
    domain: 'didactique', level: 'B',
  },
  {
    front: 'La progression spiralaire en didactique',
    back: 'Organisation des contenus en spirale : les mêmes notions sont revisitées régulièrement avec une complexité croissante.\nOpposée à la progression linéaire (notions vues une fois, en bloc, puis abandonnées).\nAvantages : mémorisation à long terme, réactivation, mise en relation des savoirs.\nEx. pour le subjonctif espagnol : A2 (quiero que + subj.), B1 (relances avec comme si, bien que), B2 (valeurs aspectuelles fines).\nRéférence théorique : Bruner (The Process of Education, 1960).',
    domain: 'didactique', level: 'B',
  },
  {
    front: 'La production orale en classe d\'espagnol — types d\'activités',
    back: 'Le CECRL distingue :\n• Production orale en continu (monologue préparé ou spontané)\n• Interaction orale (dialogue, débat, jeu de rôle)\n• Médiation orale (restituer, reformuler, interpréter)\nActivités types : jeu de rôle, débat structuré, exposé, simulation, interview, description d\'image.\nConditions de réussite : sécurité affective, objectif langagier clair, étayage, rétroaction différée (ne pas interrompre la production pour corriger).',
    domain: 'didactique', level: 'A',
  },
  {
    front: 'Le portfolio européen des langues (PEL)',
    back: 'Outil du Conseil de l\'Europe, déclinaison pratique du CECRL.\n3 composantes :\n1. Passeport de langues : bilan des compétences, certifications\n2. Biographie langagière : parcours, expériences, objectifs\n3. Dossier : productions représentatives de l\'élève\nFonctions :\n• Formative : réflexivité, auto-évaluation, motivation\n• Sommative/certificative : valoriser les acquis informels\nIntérêt didactique : développer la compétence métacognitive et l\'autonomie de l\'apprenant.',
    domain: 'didactique', level: 'B',
  },
]

async function seed() {
  console.log(`Seeding ${FLASHCARDS.length} flashcards…`)

  for (const card of FLASHCARDS) {
    await sql.query(
      `INSERT INTO flashcards (front, back, domain, level, source)
       VALUES ($1, $2, $3, $4, 'curated')
       ON CONFLICT DO NOTHING`,
      [card.front, card.back, card.domain, card.level]
    )
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
