import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LIVE_MINUTES, LIVE_NOTE_MAX, useLive } from '../../context/LiveContext'

const SUGGESTIONS = ['Biegam, dołącz!', 'Spacer z psem, zapraszam', 'Mam czas na kawę', 'Gram w kosza, brakuje jednej osoby']

// Duży biały przycisk z czerwoną kropką na dole mapy. „Pokaż się" otwiera okno z notką;
// gdy jestem live, przez przycisk przepływa czerwona fala i służy on do ukrycia się.
export default function ShowUpButton() {
  const { available, userId, live, show, hide } = useLive()
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
        onClick={() => (live ? hide() : setOpen(true))}
        aria-label={live ? 'Jesteś live. Ukryj się' : 'Pokaż się'}
        sx={{
          position: 'absolute',
          zIndex: 1000,
          left: '50%',
          bottom: 20,
          ml: '-100px',
          width: 200,
          height: 56,
          gap: 1.25,
          overflow: 'hidden',
          bgcolor: '#ffffff',
          color: '#111111',
          border: '2px solid',
          borderColor: live ? '#dc2626' : 'transparent',
          boxShadow: live ? '0 6px 20px rgba(239,68,68,0.45)' : '0 6px 20px rgba(17,17,17,0.25)',
          animation: 'popIn 0.3s ease 0.2s backwards',
          '&:hover': { bgcolor: '#ffffff' },
          // gdy jestem live, przez przycisk przepływa czerwona fala
          '&::after': live
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '45%',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.38) 50%, transparent 100%)',
                animation: 'liveSweep 1.8s ease-in-out infinite',
                pointerEvents: 'none',
              }
            : undefined,
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: '#dc2626',
            animation: live ? 'liveDot 1.4s ease-in-out infinite' : 'none',
          }}
        />
        <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
          {live ? 'Ukryj się' : 'Pokaż się'}
        </Box>
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
