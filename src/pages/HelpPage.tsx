import { useMemo, useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Collapse from '@mui/material/Collapse'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RemoveIcon from '@mui/icons-material/Remove'
import SearchIcon from '@mui/icons-material/Search'
import { FAQ } from '../data/faq'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type Kind = 'contact' | 'bug'

const FORMS: Record<Kind, { title: string; label: string; placeholder: string }> = {
  contact: {
    title: 'Napisz do nas',
    label: 'Twoja wiadomość',
    placeholder: 'W czym możemy pomóc?',
  },
  bug: {
    title: 'Zgłoś błąd',
    label: 'Co nie działa?',
    placeholder: 'Opisz, co zrobiłeś(-aś), co się stało i czego się spodziewałeś(-aś).',
  },
}

const MIN_MESSAGE = 5
const MAX_MESSAGE = 2000

// Porównanie bez wielkości liter i polskich znaków, żeby „zapisac" znajdowało „zapisać".
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

// Jedno pytanie: szara pigułka z plusem; kliknięcie rozwija odpowiedź.
function Question({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ borderRadius: '22px', bgcolor: '#f4f4f5', overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          minHeight: 52,
          py: 1,
          textAlign: 'left',
          fontWeight: 700,
          fontSize: '1rem',
          transition: 'background-color .2s ease',
          '&:hover': { bgcolor: '#e9e9ec' },
        }}
      >
        {question}
        <Box component="span" aria-hidden sx={{ display: 'flex', color: 'primary.main' }}>
          {open ? <RemoveIcon /> : <AddIcon />}
        </Box>
      </ButtonBase>
      <Collapse in={open}>
        <Typography sx={{ px: 2, pb: 2, pt: 0.5, color: 'text.secondary', lineHeight: 1.6 }}>{answer}</Typography>
      </Collapse>
    </Box>
  )
}

// Okno „Napisz do nas" / „Zgłoś błąd": wiadomość trafia do tabeli support_messages.
function SupportDialog({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState(user?.email ?? '')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const form = FORMS[kind]

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('support_messages').insert({
      user_id: user?.id ?? null,
      kind,
      message: message.trim(),
      contact: contact.trim() || null,
      page: pathname,
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '28px' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{form.title}</DialogTitle>
      {status === 'sent' ? (
        <>
          <DialogContent>
            <Alert severity="success">Dziękujemy! Wiadomość dotarła do zespołu.</Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button variant="contained" onClick={onClose}>
              Zamknij
            </Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label={form.label}
                multiline
                minRows={4}
                required
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                placeholder={form.placeholder}
                helperText={`${message.length}/${MAX_MESSAGE} znaków`}
              />
              <TextField
                label="E-mail do odpowiedzi"
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                helperText="Opcjonalnie. Podaj, jeśli chcesz dostać odpowiedź."
              />
              {status === 'error' && (
                <Alert severity="error">
                  Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose}>Anuluj</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={message.trim().length < MIN_MESSAGE || status === 'sending'}
            >
              {status === 'sending' ? 'Wysyłanie…' : 'Wyślij'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}

const LINKS = [
  { to: '/regulamin/', label: 'Regulamin' },
  { to: '/prywatnosc/', label: 'Polityka prywatności' },
]

// Strona Pomoc: wyszukiwarka, najczęstsze pytania z rozwijanymi odpowiedziami i kontakt z zespołem.
export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<Kind | null>(null)

  // Bez wpisanego hasła — cztery popularne pytania; z hasłem — szukamy we wszystkich.
  const visible = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return FAQ.filter((item) => item.popular)
    return FAQ.filter((item) => normalize(`${item.question} ${item.answer}`).includes(q))
  }, [query])

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2.5} className="stagger">
        <Typography variant="h1">Pomoc</Typography>

        <TextField
          placeholder="Szukaj w pomocy…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Szukaj w pomocy"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 16px rgba(17,17,17,0.1)',
              '& fieldset': { border: 'none' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box component="section">
          <Typography variant="h2" sx={{ mb: 1.5 }} aria-live="polite">
            {query.trim() ? `Wyniki: ${visible.length}` : 'Popularne pytania'}
          </Typography>
          {visible.length === 0 ? (
            <Typography color="text.secondary">
              Nie znaleźliśmy odpowiedzi na „{query.trim()}". Napisz do nas, pomożemy.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {visible.map((item) => (
                <Question key={item.question} question={item.question} answer={item.answer} />
              ))}
            </Stack>
          )}
        </Box>

        <Box component="section">
          <Typography variant="h2" sx={{ mb: 1.5 }}>
            Nadal potrzebujesz pomocy?
          </Typography>
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => setDialog('contact')}
              sx={{ borderRadius: '999px', minHeight: 54 }}
            >
              Napisz do nas
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setDialog('bug')}
              sx={{ borderRadius: '999px', minHeight: 54, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Zgłoś błąd
            </Button>
          </Stack>
        </Box>

        <Box component="nav" aria-label="Dokumenty" sx={{ borderRadius: '22px', bgcolor: '#f4f4f5', overflow: 'hidden' }}>
          {LINKS.map((link, index) => (
            <ButtonBase
              key={link.to}
              component={RouterLink}
              to={link.to}
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                px: 2,
                minHeight: 52,
                fontWeight: 700,
                fontSize: '1rem',
                borderTop: index > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
                transition: 'background-color .2s ease',
                '&:hover': { bgcolor: '#e9e9ec' },
              }}
            >
              {link.label}
              <ChevronRightIcon />
            </ButtonBase>
          ))}
        </Box>
      </Stack>

      {dialog && <SupportDialog kind={dialog} onClose={() => setDialog(null)} />}
    </Container>
  )
}
