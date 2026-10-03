import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountPanel from '../components/AccountPanel'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

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

  if (user) return <AccountPanel />

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2} className="stagger">
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
      </Stack>
    </Container>
  )
}
