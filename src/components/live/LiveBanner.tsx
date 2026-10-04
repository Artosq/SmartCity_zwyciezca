import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLive } from '../../context/LiveContext'

const dot = {
  flexShrink: 0,
  width: 12,
  height: 12,
  borderRadius: '50%',
  bgcolor: '#ffffff',
  animation: 'liveDot 1.4s ease-in-out infinite',
} as const

// Pasek pod nagłówkiem, widoczny na każdym ekranie: przypomina, że położenie jest udostępniane,
// i pozwala je wyłączyć jednym kliknięciem. Pokazuje też, kto do mnie idzie.
export default function LiveBanner() {
  const { mine, incoming, joinedTargetId, people, error, clearError, hide, leave, dismiss } = useLive()
  const target = people.find((person) => person.user_id === joinedTargetId)

  if (!mine && !joinedTargetId && !error) return null

  return (
    <Stack sx={{ position: 'relative', zIndex: 1 }}>
      {error && (
        <Alert severity="error" onClose={clearError} square>
          {error}
        </Alert>
      )}

      {mine && (
        <Stack
          direction="row"
          spacing={1.5}
          role="status"
          sx={{ alignItems: 'center', px: 2, py: 1, bgcolor: 'error.dark', color: '#ffffff', animation: 'fadeInUp 0.3s ease' }}
        >
          <Box aria-hidden sx={dot} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Jesteś live na mapie</Typography>
            <Typography variant="body2" noWrap sx={{ opacity: 0.95 }}>
              „{mine.note}"
            </Typography>
          </Box>
          <Button
            onClick={hide}
            size="small"
            variant="contained"
            sx={{ minHeight: 40, bgcolor: '#ffffff', color: '#111111', '&:hover': { bgcolor: '#f4f4f5' } }}
          >
            Ukryj się
          </Button>
        </Stack>
      )}

      {incoming.map((row) => (
        <Stack
          key={row.joiner_id}
          direction="row"
          spacing={1.5}
          role="status"
          sx={{ alignItems: 'center', px: 2, py: 0.75, bgcolor: 'success.dark', color: '#ffffff', animation: 'fadeInUp 0.3s ease' }}
        >
          <Typography sx={{ flex: 1, fontWeight: 700 }}>
            🏃 {row.joiner?.name ?? 'Ktoś'} do Ciebie idzie
          </Typography>
          <Button onClick={() => dismiss(row.joiner_id)} size="small" sx={{ minHeight: 36, color: '#ffffff' }}>
            Odrzuć
          </Button>
        </Stack>
      ))}

      {joinedTargetId && (
        <Stack
          direction="row"
          spacing={1.5}
          role="status"
          sx={{ alignItems: 'center', px: 2, py: 0.75, bgcolor: 'primary.main', color: '#ffffff', animation: 'fadeInUp 0.3s ease' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Idziesz do: {target?.profile?.name ?? 'sąsiada'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Ta osoba widzi Twoje położenie.
            </Typography>
          </Box>
          <Button onClick={leave} size="small" sx={{ minHeight: 36, color: '#ffffff' }}>
            Rezygnuję
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
