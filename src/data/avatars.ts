// Gotowe awatary (emoji) do wyboru na profilu — bez wgrywania plików.
// Kod (id) trzyma się w kolumnie profiles.avatar i jest widoczny publicznie:
// na profilu, w czacie i przy spotkaniach we dwoje. Pusty = inicjały imienia.

export interface AvatarChoice {
  id: string
  emoji: string
  label: string
}

export const AVATARS: AvatarChoice[] = [
  { id: 'cat', emoji: '🐱', label: 'Kotek' },
  { id: 'dog', emoji: '🐶', label: 'Piesek' },
  { id: 'fox', emoji: '🦊', label: 'Lisek' },
  { id: 'rabbit', emoji: '🐰', label: 'Króliczek' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'lion', emoji: '🦁', label: 'Lew' },
  { id: 'frog', emoji: '🐸', label: 'Żabka' },
  { id: 'koala', emoji: '🐨', label: 'Koala' },
  { id: 'owl', emoji: '🦉', label: 'Sowa' },
  { id: 'penguin', emoji: '🐧', label: 'Pingwin' },
]

// Emoji dla danego kodu albo null, jeśli kod nieznany/pusty (wtedy pokazujemy inicjały).
export function avatarEmoji(id: string | null | undefined): string | null {
  if (!id) return null
  return AVATARS.find((a) => a.id === id)?.emoji ?? null
}
