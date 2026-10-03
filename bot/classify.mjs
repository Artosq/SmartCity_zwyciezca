// Proste reguły słów kluczowych: kategoria i grupy docelowe na podstawie tytułu, opisu i typu.
// Świadomie bez AI — każdą decyzję bota da się wyjaśnić.

// Słowo musi się zaczynać od podanego rdzenia („bieg" pasuje do „biegu", ale nie do „przebieg").
const words = (...stems) => new RegExp(`(?<![a-ząćęłńóśźż])(?:${stems.join('|')})`)

const GROUP_RULES = [
  ['male-dzieci', words('maluch', 'najmłodsz', 'przedszkol', 'bajk', 'rodzinn', 'familijn', 'dziec')],
  ['starsze-dzieci', words('dziec', 'rodzinn', 'familijn', 'uczni', 'szkoln')],
  ['mlodziez', words('młodzież', 'nastolat', 'student', 'licealist')],
  ['seniorzy', words('senior', '60\\+', 'emeryt')],
  ['niepelnosprawni', words('niepełnospraw', 'pjm', 'migow', 'audiodeskrypc', 'bez barier')],
]

// Kolejność ma znaczenie — wygrywa pierwsza pasująca kategoria.
const CATEGORY_RULES = [
  ['dzieci', words('dziec', 'maluch', 'rodzinn', 'familijn', 'bajk')],
  ['seniorzy', words('senior', '60\\+', 'emeryt')],
  [
    'kultura',
    words('koncert', 'spektakl', 'wystaw', 'film', 'festiwal', 'teatr', 'muzy', 'kino', 'galeri', 'muzeum', 'kabaret', 'stand-up'),
  ],
  ['sport', words('sport', 'bieg', 'turniej', 'joga', 'rower', 'mecz', 'trening', 'nordic')],
  [
    'edukacja',
    words('warsztat', 'wykład', 'kurs', 'spotkanie autorskie', 'literatur', 'bibliotek', 'lekcj', 'debat'),
  ],
  ['impreza', words('potańców', 'impreza', 'party', 'pub crawl', 'karaoke')],
  ['sasiedzkie', words('sąsiedzk', 'piknik', 'osiedl', 'kiermasz', 'wymian')],
]

export function classify(event) {
  const text = [event.title, event.description, event.type].filter(Boolean).join(' ').toLowerCase()

  const target_groups = GROUP_RULES.filter(([, pattern]) => pattern.test(text)).map(
    ([slug]) => slug,
  )
  // bez wyraźnej wskazówki zakładamy wydarzenie dla dorosłych
  if (target_groups.length === 0) target_groups.push('dorosli')

  const category = CATEGORY_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? 'inne'
  return { target_groups, category }
}
