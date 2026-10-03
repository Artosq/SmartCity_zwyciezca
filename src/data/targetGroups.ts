export interface TargetGroup {
  slug: string
  name: string
  color: string
}

// Grupy docelowe wydarzeń. Kolejność = kolejność w filtrze (od najmłodszych).
// Slugi muszą się zgadzać z ograniczeniem `events_target_groups_valid` w bazie.
// Kolory z palety Okabe-Ito — rozróżnialne także przy zaburzeniach widzenia barw.
export const TARGET_GROUPS: TargetGroup[] = [
  { slug: 'male-dzieci', name: 'Małe dzieci', color: '#E69F00' },
  { slug: 'starsze-dzieci', name: 'Starsze dzieci', color: '#009E73' },
  { slug: 'mlodziez', name: 'Młodzież', color: '#56B4E9' },
  { slug: 'dorosli', name: 'Dorośli', color: '#0072B2' },
  { slug: 'seniorzy', name: 'Seniorzy', color: '#CC79A7' },
  { slug: 'niepelnosprawni', name: 'Niepełnosprawni', color: '#D55E00' },
]

export const ALL_GROUP_SLUGS = TARGET_GROUPS.map((group) => group.slug)

// Zwraca grupy w kolejności podanych slugów; nieznane slugi pomija.
export const getGroups = (slugs: string[]) =>
  slugs.flatMap((slug) => TARGET_GROUPS.find((group) => group.slug === slug) ?? [])
