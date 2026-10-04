import Avatar from '@mui/material/Avatar'
import type { SxProps, Theme } from '@mui/material/styles'
import { avatarEmoji } from '../data/avatars'

interface Props {
  // kod wybranego awatara (emoji) albo null → pokazujemy inicjały imienia
  avatar?: string | null
  name?: string | null
  // średnica w px — steruje też rozmiarem emoji i inicjałów
  size: number
  // tło dla wariantu z inicjałami (emoji dostaje jasne, neutralne tło)
  bgcolor?: string
  // dodatkowe style (obramowanie, cień, animacja, kolor tekstu)
  sx?: SxProps<Theme>
}

// Awatar użytkownika: wybrane emoji (kotek/piesek…) albo inicjały imienia jako zapas.
export default function ProfileAvatar({ avatar, name, size, bgcolor, sx }: Props) {
  const emoji = avatarEmoji(avatar)
  const initials = (name?.trim() || 'Sąsiad').slice(0, 2).toUpperCase()
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * (emoji ? 0.6 : 0.4),
        fontWeight: 800,
        color: 'text.primary',
        ...sx,
        // tło emoji wygrywa z sx, żeby ikonka była zawsze czytelna
        bgcolor: emoji ? '#eef2ff' : (bgcolor ?? 'secondary.main'),
      }}
    >
      {emoji ?? initials}
    </Avatar>
  )
}
