import Stack from '@mui/material/Stack'
import StarIcon from '@mui/icons-material/Star'

interface Props {
  avg: number | null | undefined
  count: number | null | undefined
}

// Średnia ocen organizatora: „★ 4,5 (3)". Bez ocen — „Nowy organizator".
export default function RatingBadge({ avg, count }: Props) {
  if (!count || avg === null || avg === undefined) {
    return (
      <Stack component="span" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.secondary' }}>
        Nowy organizator
      </Stack>
    )
  }

  const value = Number(avg).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <Stack
      component="span"
      direction="row"
      spacing={0.25}
      aria-label={`Ocena organizatora: ${value} na 5, liczba ocen: ${count}`}
      sx={{ alignItems: 'center', fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap' }}
    >
      <StarIcon sx={{ fontSize: 18, color: '#d97706' }} />
      <span>{value}</span>
      <span style={{ fontWeight: 600, opacity: 0.7 }}>({count})</span>
    </Stack>
  )
}
