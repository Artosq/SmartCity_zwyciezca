import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import PendingRatings from '../components/PendingRatings'
import RatingBadge from '../components/RatingBadge'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'

// Strona zalogowanego: dane konta, data urodzenia, własna średnia ocen i lista „Do oceny".
function Account() {
  const { user, loading, birthDate, isAdult, rating, saveBirthDate } = useProfile()
  const [draft, setDraft] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!user || loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  const value = draft ?? birthDate ?? ''
  const today = new Date().toISOString().slice(0, 10)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    const message = await saveBirthDate(value)
    setError(message ?? '')
    if (!message) {
      setSaved(true)
      setDraft(null)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h1">Konto</Typography>
          <Typography>
            Zalogowano jako <strong>{user.email}</strong>.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography>Twoja ocena jako organizatora:</Typography>
            <RatingBadge avg={rating.avg} count={rating.count} />
          </Stack>
        </Stack>

        <Stack component="form" onSubmit={handleSave} spacing={1.5}>
          <Typography variant="h2">Data urodzenia</Typography>
          <Typography color="text.secondary">
            Potrzebna do spotkań we dwoje, które są dostępne od 18 lat. Widzisz ją tylko Ty.
          </Typography>
          <TextField
            label="Data urodzenia"
            type="date"
            required
            value={value}
            onChange={(e) => setDraft(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: '1900-01-02', max: today } }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          {saved && (
            <Alert severity="success">
              Zapisano.{' '}
              {isAdult
                ? 'Spotkania we dwoje są już dla Ciebie dostępne.'
                : 'Spotkania we dwoje będą dostępne po ukończeniu 18 lat.'}
            </Alert>
          )}
          <Button type="submit" variant="contained" disabled={!value || value === birthDate}>
            Zapisz datę urodzenia
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h2">Do oceny</Typography>
          <PendingRatings userId={user.id} />
        </Stack>

        <Button variant="outlined" size="large" onClick={() => supabase.auth.signOut()}>
          Wyloguj się
        </Button>
      </Stack>
    </Container>
  )
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  if (user) return <Account />

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h1">Zaloguj się</Typography>
        <Typography color="text.secondary">
          Bez hasła. Podaj imię i e-mail — wyślemy Ci link do logowania.
        </Typography>

        {status === 'sent' ? (
          <Alert severity="success">
            <strong>Sprawdź swoją skrzynkę ✉️</strong>
            <br />
            Wysłaliśmy link logowania na <strong>{email}</strong>. Kliknij go, aby wejść do
            aplikacji.
          </Alert>
        ) : (
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <TextField
              label="Imię"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Anna"
              autoComplete="given-name"
            />
            <TextField
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anna@example.com"
              autoComplete="email"
            />

            {status === 'error' && <Alert severity="error">Błąd: {errorMsg}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wysyłanie…' : 'Wyślij link logowania'}
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
