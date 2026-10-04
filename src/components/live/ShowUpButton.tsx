import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SensorsIcon from '@mui/icons-material/Sensors'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { LIVE_MINUTES, LIVE_NOTE_MAX, useLive } from '../../context/LiveContext'

const SUGGESTIONS = ['Biegam, dołącz!', 'Spacer z psem, zapraszam', 'Mam czas na kawę', 'Gram w kosza, brakuje jednej osoby']

// Duży przycisk na dole mapy. „Pokaż się" otwiera okno z notką; gdy jestem widoczny — „Ukryj się".
export default function ShowUpButton() {
  const { available, userId, mine, show, hide } = useLive()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = note.trim()
    if (!trimmed) return
    show(trimmed)
    setOpen(false)
  }

  return (
    <>
      <Fab
        variant="extended"
        color={mine ? 'default' : 'secondary'}
        onClick={() => (mine ? hide() : setOpen(true))}
        sx={{
          position: 'absolute',
          zIndex: 1000,
          left: '50%',
          bottom: 20,
          ml: '-96px',
          width: 192,
          height: 56,
          animation: 'popIn 0.3s ease 0.2s backwards',
          ...(mine && { bgcolor: '#111111', color: '#ffffff', '&:hover': { bgcolor: '#27272a' } }),
        }}
      >
        {mine ? <VisibilityOffIcon sx={{ mr: 1 }} /> : <SensorsIcon sx={{ mr: 1 }} />}
        {mine ? 'Ukryj się' : 'Pokaż się'}
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: '28px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Pokaż się na mapie</DialogTitle>

        {!available ? (
          <>
            <DialogContent>
              <Alert severity="info">
                {userId
                  ? 'Pokazywać się mogą osoby pełnoletnie. Uzupełnij datę urodzenia na stronie Konto.'
                  : 'Pokazywać się na mapie mogą zalogowane osoby pełnoletnie.'}
              </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)}>Zamknij</Button>
              <Button component={RouterLink} to="/login/" variant="contained">
                {userId ? 'Przejdź do Konta' : 'Zaloguj się'}
              </Button>
            </DialogActions>
          </>
        ) : (
          <form onSubmit={submit}>
            <DialogContent>
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  Inni dorośli zobaczą na mapie, gdzie teraz jesteś, i Twoją notkę. Znikniesz po{' '}
                  {LIVE_MINUTES} minutach albo gdy klikniesz „Ukryj się".
                </Typography>
                <TextField
                  label="Co teraz robisz?"
                  autoFocus
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, LIVE_NOTE_MAX))}
                  placeholder="np. Biegam po Błoniach, dołącz!"
                  helperText={`${note.length}/${LIVE_NOTE_MAX} znaków`}
                  slotProps={{ htmlInput: { maxLength: LIVE_NOTE_MAX } }}
                />
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {SUGGESTIONS.map((text) => (
                    <Button key={text} size="small" variant="outlined" onClick={() => setNote(text)} sx={{ minHeight: 36 }}>
                      {text}
                    </Button>
                  ))}
                </Stack>
                <Alert severity="warning">
                  Udostępniasz dokładne położenie na żywo. Pokazuj się w miejscach publicznych.
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)}>Anuluj</Button>
              <Button type="submit" variant="contained" color="secondary" disabled={!note.trim()}>
                Pokaż się
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </>
  )
}
