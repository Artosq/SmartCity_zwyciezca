export interface MeetupType {
  slug: string
  name: string
  emoji: string
  // tło karty
  gradient: string
}

// Rodzaje spotkań we dwoje. Slugi muszą się zgadzać z ograniczeniem kolumny meetups.type w bazie.
export const MEETUP_TYPES: MeetupType[] = [
  { slug: 'spacer', name: 'Spacer', emoji: '🐕', gradient: 'linear-gradient(180deg, #14532d 0%, #15803d 100%)' },
  { slug: 'kawa', name: 'Kawa', emoji: '☕', gradient: 'linear-gradient(180deg, #6b21a8 0%, #c2410c 100%)' },
  { slug: 'sport', name: 'Sport', emoji: '🏃', gradient: 'linear-gradient(180deg, #1e3a8a 0%, #0369a1 100%)' },
  { slug: 'rozmowa', name: 'Rozmowa', emoji: '💬', gradient: 'linear-gradient(180deg, #9d174d 0%, #be185d 100%)' },
  { slug: 'zakupy', name: 'Pomoc z zakupami', emoji: '🛒', gradient: 'linear-gradient(180deg, #9a3412 0%, #b45309 100%)' },
  { slug: 'inne', name: 'Inne', emoji: '✨', gradient: 'linear-gradient(180deg, #3527c4 0%, #6d28d9 100%)' },
]

export const getMeetupType = (slug: string) =>
  MEETUP_TYPES.find((type) => type.slug === slug) ?? MEETUP_TYPES[MEETUP_TYPES.length - 1]
