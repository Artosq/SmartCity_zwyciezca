// Grupy docelowe wydarzeń. Kolejność = kolejność w filtrze (od najmłodszych).
// Kolory z palety Okabe-Ito — rozróżnialne także przy zaburzeniach widzenia barw.
export const TARGET_GROUPS = [
  { slug: 'male-dzieci', name: 'Małe dzieci', color: '#E69F00' },
  { slug: 'starsze-dzieci', name: 'Starsze dzieci', color: '#009E73' },
  { slug: 'mlodziez', name: 'Młodzież', color: '#56B4E9' },
  { slug: 'dorosli', name: 'Dorośli', color: '#0072B2' },
  { slug: 'seniorzy', name: 'Seniorzy', color: '#CC79A7' },
  { slug: 'niepelnosprawni', name: 'Niepełnosprawni', color: '#D55E00' },
]

export const ALL_GROUP_SLUGS = TARGET_GROUPS.map((group) => group.slug)

const GROUPS_BY_SLUG = Object.fromEntries(TARGET_GROUPS.map((group) => [group.slug, group]))

export const getGroup = (slug) => GROUPS_BY_SLUG[slug]
