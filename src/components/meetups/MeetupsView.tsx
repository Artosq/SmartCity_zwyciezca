import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import type { City } from '../../data/cities'
import { MEETUP_TYPES } from '../../data/meetupTypes'
import { useProfile } from '../../hooks/useProfile'
import { useMeetups } from '../../hooks/useMeetups'
import { distanceKm } from '../../lib/eventDisplay'
import { isSupabaseConfigured } from '../../lib/supabase'
import ScrollRow from '../ScrollRow'
import MeetupCard from './MeetupCard'
import MeetupDialog from './MeetupDialog'

// Widok „We dwoje" na stronie głównej (tylko dla zalogowanych dorosłych): chipy rodzajów i lista kart od najbliższych centrum.
export default function MeetupsView({ city }: { city: City }) {
  const { user, loading: loadingProfile, birthDate, isAdult } = useProfile()
  const { meetups, status, reload } = useMeetups(city)
  const [type, setType] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  // Wolne wyjścia oraz te, w których zalogowany bierze udział; zajęte przez innych znikają z listy.
  const visible = useMemo(
    () =>
      meetups
        .filter(
          (meetup) =>
            meetup.guest_id === null || meetup.host_id === user?.id || meetup.guest_id === user?.id,
        )
        .filter((meetup) => type === null || meetup.type === type)
        .map((meetup) => ({ meetup, km: distanceKm(city.center, [meetup.lat, meetup.lng]) }))
        .sort((a, b) => a.km - b.km),
    [meetups, type, user?.id, city.center],
  )

  const open = meetups.find((meetup) => meetup.id === openId)

  const chip = (slug: string | null, label: string) => {
    const active = type === slug
    return (
      <ButtonBase
        key={label}
        onClick={() => setType(slug)}
        aria-pressed={active}
        sx={{
          flexShrink: 0,
          px: 2.5,
          minHeight: 44,
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.95rem',
          whiteSpace: 'nowrap',
          bgcolor: active ? 'secondary.main' : 'background.paper',
          boxShadow: '0 2px 10px rgba(17,17,17,0.18)',
          transition: 'transform 0.15s ease, background-color 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)' },
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        {label}
      </ButtonBase>
    )
  }

  return (
    <Box>
      <Box sx={{ px: 2, pt: 1 }}>
        <Typography variant="h1">We dwoje</Typography>
        <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
          Spacer, kawa albo rozmowa. Jedna osoba, publiczne miejsce, bez presji.
        </Typography>
      </Box>

      {!loadingProfile && !isAdult && (
        <Alert
          severity="info"
          sx={{ m: 2 }}
          action={
            (!user || !birthDate) && (
              <Button component={RouterLink} to="/login/" color="inherit" size="small">
                {user ? 'Konto' : 'Zaloguj'}
              </Button>
            )
          }
        >
          {!user
            ? 'Spotkania we dwoje widzą tylko zalogowane osoby pełnoletnie. Zaloguj się.'
            : !birthDate
              ? 'Spotkania we dwoje są dostępne od 18 lat. Uzupełnij datę urodzenia na stronie Konto.'
              : 'Spotkania we dwoje są dostępne od 18 lat.'}
        </Alert>
      )}

      {isAdult && (
        <>
      <ScrollRow label="Rodzaj spotkania">
        {chip(null, 'Wszystkie')}
        {MEETUP_TYPES.map((item) => chip(item.slug, `${item.emoji} ${item.name}`))}
      </ScrollRow>

      <Typography variant="h2" sx={{ px: 2, mt: 1 }}>
        Najbliżej centrum
      </Typography>

      {status === 'error' && (
        <Alert severity="error" sx={{ m: 2 }}>
          {isSupabaseConfigured
            ? 'Nie udało się pobrać spotkań. Jeśli to świeża baza, uruchom migracje 005 i 006.'
            : 'Brak połączenia z bazą — uzupełnij klucze Supabase w pliku .env.local.'}
        </Alert>
      )}
      {status === 'ready' && visible.length === 0 && (
        <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
          {type === null
            ? 'Nikt jeszcze nie zaproponował spotkania. Zaproponuj pierwsze!'
            : 'Brak wolnych spotkań tego rodzaju.'}
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          px: 2,
          pt: 2,
        }}
      >
        {status === 'loading'
          ? [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={250} sx={{ borderRadius: '32px' }} />)
          : visible.map(({ meetup, km }) => (
              <MeetupCard
                key={meetup.id}
                meetup={meetup}
                distanceKm={km}
                badge={
                  meetup.host_id === user?.id
                    ? 'Twoja propozycja'
                    : meetup.guest_id === user?.id
                      ? 'Idziesz'
                      : undefined
                }
                onOpen={() => setOpenId(meetup.id)}
              />
            ))}
      </Box>

      {open && (
        <MeetupDialog meetup={open} user={user} isAdult={isAdult} onClose={() => setOpenId(null)} onChanged={reload} />
      )}

        </>
      )}

      <Fab
        component={RouterLink}
        to="/dodaj/?typ=1na1"
        variant="extended"
        color="secondary"
        sx={{
          position: 'fixed',
          zIndex: 1050,
          right: 16,
          bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 24 },
          px: 3,
          height: 56,
        }}
      >
        <AddIcon sx={{ mr: 0.5 }} />
        Zaproponuj
      </Fab>
    </Box>
  )
}
