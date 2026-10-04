import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useMyBan } from '../hooks/useModeration'
import { formatLongDate } from '../lib/eventDisplay'

// Informacja dla zbanowanego: powód, termin końca blokady i jak się odwołać.
// Widoczna na każdym ekranie, pod nagłówkiem.
export default function BanBanner() {
  const ban = useMyBan()
  if (!ban) return null

  return (
    <Alert
      severity="error"
      square
      sx={{ position: 'relative', zIndex: 1 }}
      action={
        <Button component={RouterLink} to="/pomoc/" color="inherit" size="small">
          Odwołaj się
        </Button>
      }
    >
      <strong>Twoje konto jest zablokowane {ban.until ? `do: ${formatLongDate(ban.until)}` : 'bezterminowo'}.</strong>{' '}
      Powód: {ban.reason} Możesz przeglądać aplikację, ale nie dodasz treści, nie zapiszesz się i nie napiszesz
      na czacie. Odwołanie złożysz przez „Napisz do nas" na stronie Pomoc.
    </Alert>
  )
}
