export interface MeetupType {
  slug: string
  name: string
  emoji: string
  // tło karty
  gradient: string
}

// Rodzaje wyjść 1:1. Slugi muszą się zgadzać z ograniczeniem kolumny meetups.type w bazie.
export const MEETUP_TYPES: MeetupType[] = [
  { slug: 'spacer', name: 'Spacer', emoji: '🐕', gradient: 'linear-gradient(180deg, #14532d 0%, #22c55e 100%)' },
  { slug: 'kawa', name: 'Kawa', emoji: '☕', gradient: 'linear-gradient(180deg, #6b21a8 0%, #fb923c 100%)' },
  { slug: 'sport', name: 'Sport', emoji: '🏃', gradient: 'linear-gradient(180deg, #1e3a8a 0%, #38bdf8 100%)' },
  { slug: 'rozmowa', name: 'Rozmowa', emoji: '💬', gradient: 'linear-gradient(180deg, #9d174d 0%, #f9a8d4 100%)' },
  { slug: 'inne', name: 'Inne', emoji: '✨', gradient: 'linear-gradient(180deg, #3527c4 0%, #a78bfa 100%)' },
]

export const getMeetupType = (slug: string) =>
  MEETUP_TYPES.find((type) => type.slug === slug) ?? MEETUP_TYPES[MEETUP_TYPES.length - 1]
