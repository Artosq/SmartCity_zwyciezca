import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import AccountPanel from '../components/AccountPanel'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// Konto demo: losowe imię i pełnoletnia data urodzenia.
const DEMO_NAMES = ['Ola', 'Kuba', 'Maja', 'Antek', 'Zuza', 'Franek', 'Hania', 'Staś']
const DEMO_BIRTH_DATE = '1990-01-01'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [demoBusy, setDemoBusy] = useState(false)
  const [demoError, setDemoError] = useState('')

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

  // TYMCZASOWE — konto demo na prezentację i testy. Usunąć przed prawdziwym uruchomieniem.
  // Tworzy osobne, anonimowe konto bez e-maila (omija link logowania i limit wysyłki maili)
  // i od razu wpisuje pełnoletnią datę urodzenia (omija ograniczenie 18+ dla „We dwoje" i „Pokaż się").
  // Wymaga włączenia w Supabase: Authentication → Sign In / Providers → Allow anonymous sign-ins.
  async function handleDemo() {
    setDemoBusy(true)
    setDemoError('')

    const demoName = `${DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)]} (demo)`
    const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { name: demoName } } })
    if (error || !data.user) {
      setDemoError(
        error?.message.toLowerCase().includes('anonymous')
          ? 'Konto demo jest wyłączone. Włącz w Supabase: Authentication → Sign In / Providers → Allow anonymous sign-ins.'
          : (error?.message ?? 'Nie udało się utworzyć konta demo.'),
      )
      setDemoBusy(false)
      return
    }

    await supabase.from('profile_private').upsert({ id: data.user.id, birth_date: DEMO_BIRTH_DATE })
    // pełne przeładowanie: cała aplikacja od razu widzi nowe konto i jego wiek
    window.location.assign('/')
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  // w trakcie zakładania konta demo zostajemy na ekranie logowania aż do przeładowania
  if (user && !demoBusy) return <AccountPanel />

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2} className="stagger">
        <Typography variant="h1">Zaloguj się</Typography>
        <Typography color="text.secondary">
          Bez hasła. Podaj imię i e-mail, a wyślemy Ci link do logowania.
        </Typography>

        {status === 'sent' ? (
          <Alert severity="success">
            <strong>Sprawdź swoją skrzynkę ✉️</strong>
            <br />
            Wysłaliśmy link logowania na <strong>{email}</strong>. Kliknij go, aby wejść do
            aplikacji.
          </Alert>
        ) : (
          <Stack component="form" onSubmit={handleSubmit} spacing={2} className="stagger">
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

        <Divider sx={{ pt: 1 }}>albo</Divider>

        <Paper
          elevation={0}
          sx={{ p: 2.5, borderRadius: '24px', border: '2px dashed', borderColor: 'secondary.dark', bgcolor: 'rgba(200,255,0,0.14)' }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h2" sx={{ fontSize: '1.2rem' }}>
              Konto demo
            </Typography>
            <Typography color="text.secondary">
              Tymczasowe konto do prezentacji i sprawdzania funkcji: bez e-maila, od razu z dostępem do
              wszystkiego, także „We dwoje" i „Pokaż się".
            </Typography>
            {demoError && <Alert severity="warning">{demoError}</Alert>}
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ScienceOutlinedIcon />}
              disabled={demoBusy}
              onClick={handleDemo}
            >
              {demoBusy ? 'Tworzenie konta…' : 'Wejdź na konto demo'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
