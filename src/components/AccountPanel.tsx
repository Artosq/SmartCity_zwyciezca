import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LogoutIcon from '@mui/icons-material/Logout'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { BRAND } from '../theme'
import ActivityCalendar from './ActivityCalendar'
import HiddenContentNotice from './HiddenContentNotice'
import PendingRatings from './PendingRatings'
import SectionCard from './SectionCard'

// Panel zalogowanego: awatar i ocena na górze, niżej kalendarz aktywności, data urodzenia i lista „Do oceny".
export default function AccountPanel() {
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

  const name = (user.user_metadata?.name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Sąsiad'
  const value = draft ?? birthDate ?? ''
  const today = new Date().toISOString().slice(0, 10)
  const hasRatings = rating.count > 0 && rating.avg !== null
  const average = Number(rating.avg ?? 0)

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
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2.5} className="stagger">
        {/* Wizytówka: awatar, imię i ocena jako organizatora */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            pt: 7,
            pb: 3,
            px: 2.5,
            textAlign: 'center',
            borderRadius: '28px',
            boxShadow: '0 6px 24px rgba(17,17,17,0.09)',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 96,
              background: `linear-gradient(120deg, ${BRAND.violet} 0%, #8b5cf6 55%, #ec4899 100%)`,
            }}
          />
          <Avatar
            sx={{
              position: 'relative',
              width: 104,
              height: 104,
              mx: 'auto',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: BRAND.ink,
              bgcolor: 'secondary.main',
              border: '5px solid #ffffff',
              boxShadow: '0 8px 22px rgba(17,17,17,0.2)',
              animation: 'popIn 0.4s ease 0.1s backwards',
            }}
          >
            {name.slice(0, 2).toUpperCase()}
          </Avatar>

          <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', alignItems: 'center', mt: 1.5 }}>
            <Typography variant="h1">{name}</Typography>
            {isAdult && (
              <VerifiedIcon
                titleAccess="Konto osoby pełnoletniej"
                sx={{ color: 'primary.main', fontSize: 26 }}
              />
            )}
          </Stack>
          <Typography color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {user.email ?? 'Konto demo (tymczasowe)'}
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 2,
              px: 3,
              py: 1.5,
              borderRadius: '20px',
              bgcolor: '#fffbeb',
            }}
          >
            <Rating
              readOnly
              size="large"
              precision={0.5}
              value={hasRatings ? average : 0}
              getLabelText={(stars) => `${stars} na 5 gwiazdek`}
              sx={{ fontSize: '2.4rem', color: '#d97706' }}
            />
            <Typography sx={{ fontWeight: 800, mt: 0.25 }}>
              {hasRatings
                ? `${average.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`
                : 'Nowy organizator'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasRatings ? `średnia z ${rating.count} ocen` : 'Pierwsza ocena pojawi się po Twoim wydarzeniu.'}
            </Typography>
          </Box>
        </Paper>

        <HiddenContentNotice userId={user.id} />

        <SectionCard
          icon={<CalendarMonthIcon />}
          title="Twój kalendarz"
          hint="Wydarzenia, na które idziesz lub które organizujesz, i spotkania we dwoje."
        >
          <ActivityCalendar userId={user.id} />
        </SectionCard>

        <SectionCard icon={<CakeOutlinedIcon />} title="Data urodzenia">
          <Stack component="form" onSubmit={handleSave} spacing={1.5}>
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
        </SectionCard>

        <SectionCard icon={<RateReviewOutlinedIcon />} title="Do oceny">
          <PendingRatings userId={user.id} />
        </SectionCard>

        <Button
          variant="outlined"
          size="large"
          startIcon={<LogoutIcon />}
          onClick={() => supabase.auth.signOut()}
        >
          Wyloguj się
        </Button>
      </Stack>
    </Container>
  )
}
