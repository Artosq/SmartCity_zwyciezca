// Cele wydarzenia w kolejności, w jakiej pokazujemy je w filtrach i w formularzu.
// Same kategorie (nazwa, ikona) są w bazie, w tabeli categories.
export const CATEGORY_ORDER = ['edukacja', 'sport', 'kultura', 'rekreacja', 'integracja', 'celebracja', 'inne']

// Slugi sprzed migracji 012. Dzięki temu baza bez tej migracji nadal dostaje ilustracje.
export const LEGACY_CATEGORY: Record<string, string> = {
  sasiedzkie: 'integracja',
  impreza: 'celebracja',
  dzieci: 'rekreacja',
  seniorzy: 'integracja',
}

const rank = (slug: string) => {
  const index = CATEGORY_ORDER.indexOf(LEGACY_CATEGORY[slug] ?? slug)
  return index === -1 ? CATEGORY_ORDER.length : index
}

export const sortCategories = <T extends { slug: string }>(categories: T[]) =>
  [...categories].sort((a, b) => rank(a.slug) - rank(b.slug))
