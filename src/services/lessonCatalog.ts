import type { Language } from '../i18n/translations'

export type LessonTopic = 'systemSolar' | 'stars' | 'planets' | 'satellites' | 'astronomyBasics'

export interface LessonResource {
  title: string
  source: string
  url: string
}

export interface QuizQuestion {
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
  correction: string
}

export interface LessonContent {
  title: string
  summary: string
  sections: { heading: string; paragraphs: string[] }[]
  takeaway: string
  resources: LessonResource[]
  quiz: QuizQuestion[]
}

export interface Lesson {
  id: string
  topic: LessonTopic
  estimatedMinutes: number
  content: Record<Language, LessonContent>
}

const nasaSpacePlace = {
  fr: 'NASA Space Place (anglais)',
  en: 'NASA Space Place',
}

export const lessons: Lesson[] = [
  {
    id: 'solar-system',
    topic: 'systemSolar',
    estimatedMinutes: 5,
    content: {
      fr: {
        title: 'Notre système solaire',
        summary: 'Découvre le Soleil, les planètes et les autres objets qui voyagent autour de notre étoile.',
        sections: [
          {
            heading: 'Une étoile au centre',
            paragraphs: [
              'Le système solaire est un ensemble formé par le Soleil et les objets qui restent liés à lui par la gravité. Le Soleil est une étoile : il produit sa propre lumière et sa propre chaleur.',
              'Autour de lui se déplacent huit planètes, leurs lunes, des planètes naines, des astéroïdes et des comètes. Ces mondes sont très différents, mais ils partagent une même étoile.',
            ],
          },
          {
            heading: 'Des mondes variés',
            paragraphs: [
              'Les quatre planètes les plus proches du Soleil sont rocheuses. Plus loin se trouvent les géantes gazeuses et glacées. Entre ces familles, la taille, la composition et l’atmosphère changent beaucoup.',
              'Les orbites ne sont pas des rails matériels : ce sont des trajectoires décrites par la gravité et le mouvement. Les objets restent en orbite parce qu’ils avancent tout en étant attirés par le Soleil.',
            ],
          },
        ],
        takeaway: 'Le système solaire est un ensemble gravitationnel organisé autour du Soleil, mais composé de mondes très différents.',
        resources: [
          { title: 'Explore le système solaire', source: nasaSpacePlace.fr, url: 'https://spaceplace.nasa.gov/menu/solar-system/' },
          { title: 'Vue d’ensemble du système solaire', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/' },
        ],
        quiz: [
          {
            prompt: 'Qu’est-ce qui se trouve au centre du système solaire ?',
            options: ['La Terre', 'Le Soleil', 'La Lune', 'Jupiter'],
            answerIndex: 1,
            explanation: 'Le Soleil est l’étoile autour de laquelle les planètes et de nombreux autres objets orbitent.',
            correction: 'Les planètes orbitent autour du Soleil. La Terre et Jupiter sont des planètes, et la Lune orbite autour de la Terre.',
          },
          {
            prompt: 'Pourquoi les planètes restent-elles en orbite autour du Soleil ?',
            options: ['Parce qu’elles sont attachées à des câbles', 'Grâce à la gravité et à leur mouvement', 'Parce qu’elles ne bougent pas', 'À cause de la lumière du Soleil'],
            answerIndex: 1,
            explanation: 'La gravité attire les planètes vers le Soleil tandis que leur mouvement les fait avancer : ensemble, ils forment une orbite.',
            correction: 'Une orbite résulte de l’attraction gravitationnelle et du mouvement de l’objet, pas d’un câble ni de l’absence de mouvement.',
          },
          {
            prompt: 'Quel objet est une étoile ?',
            options: ['Mars', 'Le Soleil', 'La Lune', 'Un astéroïde'],
            answerIndex: 1,
            explanation: 'Le Soleil produit sa propre lumière et sa propre chaleur, comme les autres étoiles.',
            correction: 'Mars est une planète, la Lune est un satellite naturel et un astéroïde est un petit corps rocheux.',
          },
        ],
      },
      en: {
        title: 'Our solar system',
        summary: 'Meet the Sun, the planets and the other objects that travel around our star.',
        sections: [
          {
            heading: 'A star at the centre',
            paragraphs: [
              'The solar system is made up of the Sun and objects held to it by gravity. The Sun is a star: it produces its own light and heat.',
              'Eight planets, their moons, dwarf planets, asteroids and comets move around it. These worlds are very different, but they share the same star.',
            ],
          },
          {
            heading: 'A variety of worlds',
            paragraphs: [
              'The four planets closest to the Sun are rocky. Farther away are the gas and ice giants. Across these groups, size, composition and atmosphere vary greatly.',
              'Orbits are not physical tracks: they are paths shaped by gravity and motion. Objects stay in orbit because they move forward while being pulled toward the Sun.',
            ],
          },
        ],
        takeaway: 'The solar system is a gravitational family organised around the Sun and made up of very different worlds.',
        resources: [
          { title: 'Explore the solar system', source: nasaSpacePlace.en, url: 'https://spaceplace.nasa.gov/menu/solar-system/' },
          { title: 'Solar system overview', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/' },
        ],
        quiz: [
          {
            prompt: 'What is at the centre of our solar system?',
            options: ['Earth', 'The Sun', 'The Moon', 'Jupiter'],
            answerIndex: 1,
            explanation: 'The Sun is the star that planets and many other objects orbit.',
            correction: 'The planets orbit the Sun. Earth and Jupiter are planets, and the Moon orbits Earth.',
          },
          {
            prompt: 'Why do planets stay in orbit around the Sun?',
            options: ['They are attached by cables', 'Gravity and their motion work together', 'They do not move', 'Because of sunlight'],
            answerIndex: 1,
            explanation: 'Gravity pulls planets toward the Sun while their motion carries them forward; together, these create an orbit.',
            correction: 'An orbit comes from gravitational attraction and an object’s motion, not a cable or a lack of movement.',
          },
          {
            prompt: 'Which object is a star?',
            options: ['Mars', 'The Sun', 'The Moon', 'An asteroid'],
            answerIndex: 1,
            explanation: 'The Sun produces its own light and heat, just like other stars.',
            correction: 'Mars is a planet, the Moon is a natural satellite, and an asteroid is a small rocky body.',
          },
        ],
      },
    },
  },
  {
    id: 'stars',
    topic: 'stars',
    estimatedMinutes: 5,
    content: {
      fr: {
        title: 'Les étoiles, des soleils lointains',
        summary: 'Apprends ce qui fait briller une étoile et comment elle change au fil du temps.',
        sections: [
          {
            heading: 'Une boule de gaz très chaud',
            paragraphs: [
              'Une étoile est une immense sphère de gaz chaud. Dans son cœur, des réactions de fusion nucléaire libèrent de l’énergie qui traverse l’étoile et finit par rayonner dans l’espace.',
              'La couleur d’une étoile donne des indices sur sa température de surface. Les étoiles bleutées sont généralement plus chaudes que les étoiles rougeâtres.',
            ],
          },
          {
            heading: 'Une vie qui évolue',
            paragraphs: [
              'Les étoiles naissent dans de grands nuages de gaz et de poussière. Elles passent ensuite une grande partie de leur existence à produire de l’énergie dans leur cœur.',
              'Leur évolution dépend notamment de leur masse. Les étoiles ne terminent donc pas toutes leur vie de la même façon.',
            ],
          },
        ],
        takeaway: 'Les étoiles produisent leur propre lumière grâce à des processus qui se déroulent en leur cœur.',
        resources: [
          { title: 'Les étoiles', source: nasaSpacePlace.fr, url: 'https://spaceplace.nasa.gov/sun-compare/en/' },
          { title: 'Étoiles et évolution stellaire', source: 'NASA Universe', url: 'https://science.nasa.gov/universe/stars/' },
        ],
        quiz: [
          {
            prompt: 'Comment une étoile produit-elle l’essentiel de son énergie ?',
            options: ['En réfléchissant la lumière d’une planète', 'Par la fusion nucléaire dans son cœur', 'En brûlant du bois', 'En tournant autour d’une planète'],
            answerIndex: 1,
            explanation: 'La fusion nucléaire au cœur d’une étoile libère l’énergie qui la fait rayonner.',
            correction: 'Une étoile n’est pas éclairée par une planète et ne brûle pas comme un feu : son énergie vient de la fusion nucléaire.',
          },
          {
            prompt: 'Que peut indiquer la couleur d’une étoile ?',
            options: ['Sa température de surface', 'Le nombre de ses planètes', 'Sa distance exacte à la Terre', 'Son âge exact'],
            answerIndex: 0,
            explanation: 'La couleur est liée à la température de surface : le bleu correspond généralement à une température plus élevée que le rouge.',
            correction: 'La couleur renseigne notamment sur la température, mais ne donne pas directement le nombre de planètes, la distance exacte ou l’âge exact.',
          },
          {
            prompt: 'Où les étoiles naissent-elles souvent ?',
            options: ['Dans des nuages de gaz et de poussière', 'À la surface des planètes', 'Dans les océans', 'À l’intérieur des comètes'],
            answerIndex: 0,
            explanation: 'Les étoiles se forment dans des régions denses de gaz et de poussière, souvent appelées pouponnières stellaires.',
            correction: 'Les étoiles se forment dans l’espace à partir de nuages de gaz et de poussière, pas sur des planètes ou dans des océans.',
          },
        ],
      },
      en: {
        title: 'Stars, distant suns',
        summary: 'Learn what makes a star shine and how it changes over time.',
        sections: [
          {
            heading: 'A sphere of hot gas',
            paragraphs: [
              'A star is an enormous sphere of hot gas. In its core, nuclear fusion reactions release energy that travels through the star and eventually radiates into space.',
              'A star’s colour gives clues about its surface temperature. Blue stars are generally hotter than reddish stars.',
            ],
          },
          {
            heading: 'A changing life',
            paragraphs: [
              'Stars form in large clouds of gas and dust. They then spend much of their lives producing energy in their cores.',
              'A star’s evolution depends in part on its mass. Stars do not all end their lives in the same way.',
            ],
          },
        ],
        takeaway: 'Stars produce their own light through processes that take place in their cores.',
        resources: [
          { title: 'Stars', source: nasaSpacePlace.en, url: 'https://spaceplace.nasa.gov/sun-compare/en/' },
          { title: 'Stars and stellar evolution', source: 'NASA Universe', url: 'https://science.nasa.gov/universe/stars/' },
        ],
        quiz: [
          {
            prompt: 'How does a star produce most of its energy?',
            options: ['By reflecting a planet’s light', 'Through nuclear fusion in its core', 'By burning wood', 'By orbiting a planet'],
            answerIndex: 1,
            explanation: 'Nuclear fusion in a star’s core releases the energy that makes it shine.',
            correction: 'A star is not lit by a planet and does not burn like a fire; its energy comes from nuclear fusion.',
          },
          {
            prompt: 'What can a star’s colour tell us?',
            options: ['Its surface temperature', 'How many planets it has', 'Its exact distance from Earth', 'Its exact age'],
            answerIndex: 0,
            explanation: 'Colour is related to surface temperature: blue generally indicates a higher temperature than red.',
            correction: 'Colour can give clues about temperature, but it does not directly tell us a star’s planet count, exact distance or exact age.',
          },
          {
            prompt: 'Where do stars often form?',
            options: ['In clouds of gas and dust', 'On planet surfaces', 'In oceans', 'Inside comets'],
            answerIndex: 0,
            explanation: 'Stars form in dense regions of gas and dust, often called stellar nurseries.',
            correction: 'Stars form in space from clouds of gas and dust, not on planets or in oceans.',
          },
        ],
      },
    },
  },
  {
    id: 'planets',
    topic: 'planets',
    estimatedMinutes: 5,
    content: {
      fr: {
        title: 'Les planètes et leurs familles',
        summary: 'Compare les mondes rocheux aux géantes et découvre ce qui rend chaque planète unique.',
        sections: [
          {
            heading: 'Deux grandes familles',
            paragraphs: [
              'Dans le système solaire, les planètes intérieures sont principalement rocheuses. Les planètes extérieures comprennent des géantes composées surtout de gaz ou de matières volatiles.',
              'Ces catégories aident à comparer les planètes, mais chaque monde possède ses propres caractéristiques : atmosphère, température, relief et histoire.',
            ],
          },
          {
            heading: 'Des mondes à comparer',
            paragraphs: [
              'Les scientifiques étudient les planètes avec des télescopes et des sondes spatiales. Ils observent la lumière, les surfaces, les atmosphères et les lunes pour mieux comprendre leur formation.',
              'Comparer ne veut pas dire classer en « meilleur » ou « pire » : chaque planète nous apprend quelque chose sur la diversité des mondes.',
            ],
          },
        ],
        takeaway: 'Les planètes diffèrent par leur composition et leur environnement ; les comparer révèle la diversité du système solaire.',
        resources: [
          { title: 'Les planètes', source: nasaSpacePlace.fr, url: 'https://spaceplace.nasa.gov/planetary-orbits/en/' },
          { title: 'Planètes du système solaire', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/planets/' },
        ],
        quiz: [
          {
            prompt: 'Quelle description correspond aux planètes intérieures ?',
            options: ['Principalement rocheuses', 'Toutes composées de gaz', 'Elles n’ont pas de surface', 'Elles sont toutes des étoiles'],
            answerIndex: 0,
            explanation: 'Les planètes intérieures sont principalement des mondes rocheux.',
            correction: 'Les planètes intérieures ne sont pas des étoiles ni des géantes gazeuses ; elles sont principalement rocheuses.',
          },
          {
            prompt: 'Comment les scientifiques étudient-ils les planètes ?',
            options: ['Uniquement en devinant', 'Avec des télescopes et des sondes spatiales', 'En les visitant toutes à pied', 'En écoutant le son dans le vide'],
            answerIndex: 1,
            explanation: 'Les télescopes observent les planètes à distance et les sondes peuvent recueillir des mesures près d’elles.',
            correction: 'Les planètes sont étudiées avec des observations et des instruments scientifiques, pas par supposition ou par des sons dans le vide.',
          },
          {
            prompt: 'Pourquoi comparer les planètes ?',
            options: ['Pour trouver la planète « meilleure »', 'Pour comprendre la diversité des mondes', 'Pour prouver qu’elles sont identiques', 'Pour arrêter leurs orbites'],
            answerIndex: 1,
            explanation: 'La comparaison aide à comprendre comment les mondes diffèrent et comment ils se sont formés.',
            correction: 'La comparaison scientifique met en évidence la diversité ; elle ne désigne pas une planète comme meilleure et ne modifie pas les orbites.',
          },
        ],
      },
      en: {
        title: 'Planets and their families',
        summary: 'Compare rocky worlds with giant planets and discover what makes each one unique.',
        sections: [
          {
            heading: 'Two broad families',
            paragraphs: [
              'In the solar system, the inner planets are mostly rocky. The outer planets include giants made mainly of gas or volatile materials.',
              'These groups help us compare planets, but each world has its own features: atmosphere, temperature, landscape and history.',
            ],
          },
          {
            heading: 'Worlds to compare',
            paragraphs: [
              'Scientists study planets with telescopes and spacecraft. They observe light, surfaces, atmospheres and moons to better understand how planets formed.',
              'Comparing does not mean choosing a “best” or “worst” planet: every planet can teach us about the diversity of worlds.',
            ],
          },
        ],
        takeaway: 'Planets differ in composition and environment; comparing them reveals the diversity of the solar system.',
        resources: [
          { title: 'Planets', source: nasaSpacePlace.en, url: 'https://spaceplace.nasa.gov/planetary-orbits/en/' },
          { title: 'Solar system planets', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/planets/' },
        ],
        quiz: [
          {
            prompt: 'Which description fits the inner planets?',
            options: ['Mostly rocky', 'All made of gas', 'They have no surface', 'They are all stars'],
            answerIndex: 0,
            explanation: 'The inner planets are mostly rocky worlds.',
            correction: 'The inner planets are not stars or gas giants; they are mostly rocky.',
          },
          {
            prompt: 'How do scientists study planets?',
            options: ['Only by guessing', 'With telescopes and spacecraft', 'By walking on all of them', 'By listening to sound in space'],
            answerIndex: 1,
            explanation: 'Telescopes observe planets from a distance, and spacecraft can collect measurements near them.',
            correction: 'Planets are studied with observations and scientific instruments, not guesses or sounds travelling through a vacuum.',
          },
          {
            prompt: 'Why compare planets?',
            options: ['To find the “best” planet', 'To understand the variety of worlds', 'To prove they are identical', 'To stop their orbits'],
            answerIndex: 1,
            explanation: 'Comparison helps us understand how worlds differ and how they formed.',
            correction: 'Scientific comparison reveals variety; it does not choose a best planet or change orbits.',
          },
        ],
      },
    },
  },
  {
    id: 'natural-satellites',
    topic: 'satellites',
    estimatedMinutes: 4,
    content: {
      fr: {
        title: 'Lunes et satellites naturels',
        summary: 'Découvre comment les lunes accompagnent les planètes et ce qu’elles peuvent révéler.',
        sections: [
          {
            heading: 'Qu’est-ce qu’un satellite naturel ?',
            paragraphs: [
              'Un satellite naturel est un objet céleste qui orbite autour d’un autre corps plus grand. La Lune est le satellite naturel de la Terre.',
              'Les lunes ne se ressemblent pas toutes : certaines sont rocheuses, d’autres sont couvertes de glace, et plusieurs possèdent des reliefs ou des atmosphères très différents.',
            ],
          },
          {
            heading: 'Observer les lunes',
            paragraphs: [
              'Les lunes peuvent aider les scientifiques à comprendre l’histoire de leur planète et les conditions présentes dans le système solaire.',
              'Le mot « satellite » désigne aussi un objet construit par les humains et placé en orbite. Pour éviter la confusion, on précise « naturel » ou « artificiel ».',
            ],
          },
        ],
        takeaway: 'Une lune est un satellite naturel en orbite autour d’une planète ou d’un autre corps.',
        resources: [
          { title: 'La Lune et son exploration', source: nasaSpacePlace.fr, url: 'https://science.nasa.gov/moon/' },
          { title: 'Lunes du système solaire', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/moons/' },
        ],
        quiz: [
          {
            prompt: 'Qu’est-ce qu’un satellite naturel ?',
            options: ['Un objet qui orbite autour d’un corps plus grand', 'Un télescope sur Terre', 'Une étoile très petite', 'Un véhicule qui vole dans l’atmosphère'],
            answerIndex: 0,
            explanation: 'Un satellite naturel, comme une lune, orbite autour d’une planète ou d’un autre corps.',
            correction: 'Un satellite naturel n’est pas un télescope, une étoile ou un avion : il orbite naturellement autour d’un autre corps.',
          },
          {
            prompt: 'Quel est le satellite naturel de la Terre ?',
            options: ['Le Soleil', 'La Lune', 'Mars', 'Une station spatiale'],
            answerIndex: 1,
            explanation: 'La Lune est le satellite naturel qui orbite autour de la Terre.',
            correction: 'Le Soleil est une étoile, Mars est une planète et une station spatiale est un satellite artificiel.',
          },
          {
            prompt: 'Pourquoi dit-on parfois « satellite artificiel » ?',
            options: ['Pour parler d’un objet construit par les humains et mis en orbite', 'Pour parler d’une lune glacée', 'Pour nommer une étoile', 'Pour décrire une comète'],
            answerIndex: 0,
            explanation: 'Un satellite artificiel est construit par les humains puis placé en orbite.',
            correction: 'Une lune est naturelle. Le terme artificiel désigne un objet fabriqué par les humains et mis en orbite.',
          },
        ],
      },
      en: {
        title: 'Moons and natural satellites',
        summary: 'Discover how moons travel with planets and what they can reveal.',
        sections: [
          {
            heading: 'What is a natural satellite?',
            paragraphs: [
              'A natural satellite is a celestial object that orbits a larger body. The Moon is Earth’s natural satellite.',
              'Moons are not all alike: some are rocky, others are covered in ice, and many have very different landscapes or atmospheres.',
            ],
          },
          {
            heading: 'Observing moons',
            paragraphs: [
              'Moons can help scientists understand the history of their planets and conditions in the solar system.',
              'The word “satellite” also describes a human-made object placed in orbit. To avoid confusion, we specify “natural” or “artificial”.',
            ],
          },
        ],
        takeaway: 'A moon is a natural satellite orbiting a planet or another body.',
        resources: [
          { title: 'The Moon and its exploration', source: nasaSpacePlace.en, url: 'https://science.nasa.gov/moon/' },
          { title: 'Solar system moons', source: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/moons/' },
        ],
        quiz: [
          {
            prompt: 'What is a natural satellite?',
            options: ['An object orbiting a larger body', 'A telescope on Earth', 'A very small star', 'A vehicle flying in the atmosphere'],
            answerIndex: 0,
            explanation: 'A natural satellite, such as a moon, orbits a planet or another body.',
            correction: 'A natural satellite is not a telescope, star or aircraft: it naturally orbits another body.',
          },
          {
            prompt: 'What is Earth’s natural satellite?',
            options: ['The Sun', 'The Moon', 'Mars', 'A space station'],
            answerIndex: 1,
            explanation: 'The Moon is the natural satellite that orbits Earth.',
            correction: 'The Sun is a star, Mars is a planet, and a space station is an artificial satellite.',
          },
          {
            prompt: 'Why do we sometimes say “artificial satellite”?',
            options: ['For a human-made object placed in orbit', 'For an icy moon', 'For a star', 'For a comet'],
            answerIndex: 0,
            explanation: 'An artificial satellite is built by people and then placed in orbit.',
            correction: 'A moon is natural. Artificial describes an object made by people and placed in orbit.',
          },
        ],
      },
    },
  },
]

export function getLesson(id: string | undefined) {
  return lessons.find((lesson) => lesson.id === id)
}

export function getLessonContent(lesson: Lesson, language: Language) {
  return lesson.content[language]
}

