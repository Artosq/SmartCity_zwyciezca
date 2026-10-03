import { useMemo, useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import EventCard from '../components/EventCard'
import { GroupDot } from '../components/TargetGroupFilter'
import type { City } from '../data/cities'
import { TARGET_GROUPS } from '../data/targetGroups'
import { useCityEvents } from '../hooks/useCityEvents'
import { distanceKm } from '../lib/eventDisplay'
import { isSupabaseConfigured } from '../lib/supabase'
import type { EventWithStats } from '../lib/types'

const PREFERENCES_STORAGE_KEY = 'sasiedzko.preferences'
const CAROUSEL_LIMIT = 10

function readPreferences(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((slug) => typeof slug === 'string') : []
  } catch {
    return []
  }
}

// Poziomo przewijany rząd (karty, chipy) — wychodzi poza marginesy strony jak na makiecie.
function ScrollRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={{
        gap: 2,
        px: 2,
        pt: 1,
        pb: 2,
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
        scrollPaddingLeft: 16,
        scrollbarWidth: { xs: 'none', md: 'thin' },
        '&::-webkit-scrollbar': { display: { xs: 'none', md: 'block' } },
      }}
    >
      {children}
    </Stack>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 2 }}>
      <Typography variant="h2" sx={{ px: 2, textDecoration: 'underline', textUnderlineOffset: 4 }}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export default function HomePage({ city }: { city: City }) {
  const { events, status } = useCityEvents(city)
  const [preferences, setPreferences] = useState(readPreferences)

  const togglePreference = (slug: string) => {
    const next = preferences.includes(slug)
      ? preferences.filter((s) => s !== slug)
      : [...preferences, slug]
    setPreferences(next)
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // brak dostępu do localStorage — preferencje działają tylko do odświeżenia strony
    }
  }

  // events są posortowane po terminie, więc „najbliższe" to po prostu początek listy.
  const upcoming = events.slice(0, CAROUSEL_LIMIT)
  const preferred = useMemo(
    () =>
      events
        .filter((event) => event.target_groups.some((group) => preferences.includes(group)))
        .slice(0, CAROUSEL_LIMIT),
    [events, preferences],
  )
  const popular = useMemo(
    () => [...events].sort((a, b) => b.attendees - a.attendees).slice(0, CAROUSEL_LIMIT),
    [events],
  )

  const cards = (list: EventWithStats[], size: 'large' | 'medium') =>
    list.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        size={size}
        distanceKm={distanceKm(city.center, [event.lat, event.lng])}
      />
    ))

  const skeletons = (size: 'large' | 'medium') =>
    [0, 1, 2].map((i) => (
      <Skeleton
        key={i}
        variant="rounded"
        sx={{
          flexShrink: 0,
          width: size === 'large' ? { xs: '84vw', sm: 420 } : { xs: 210, sm: 250 },
          height: size === 'large' ? 250 : 210,
          borderRadius: '36px',
        }}
      />
    ))

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 12 }}>
      <Typography variant="h1" sx={{ position: 'absolute', left: -9999 }}>
        Wydarzenia — {city.name}
      </Typography>

      <ScrollRow label="Twoje preferencje: dla kogo szukasz wydarzeń">
        {TARGET_GROUPS.map((group) => {
          const selected = preferences.includes(group.slug)
          return (
            <ButtonBase
              key={group.slug}
              onClick={() => togglePreference(group.slug)}
              aria-pressed={selected}
              sx={{
                flexShrink: 0,
                gap: 1,
                px: 2,
                minHeight: 44,
                borderRadius: 999,
                fontWeight: 700,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                bgcolor: selected ? 'primary.main' : 'background.paper',
                color: selected ? 'primary.contrastText' : 'text.primary',
                boxShadow: '0 2px 10px rgba(17,17,17,0.18)',
              }}
            >
              <GroupDot color={group.color} />
              {group.name}
            </ButtonBase>
          )
        })}
      </ScrollRow>

      {status === 'error' && (
        <Alert severity="error" sx={{ mx: 2 }}>
          {isSupabaseConfigured
            ? 'Nie udało się pobrać wydarzeń. Spróbuj ponownie za chwilę.'
            : 'Brak połączenia z bazą — uzupełnij klucze Supabase w pliku .env.local.'}
        </Alert>
      )}

      {status === 'ready' && events.length === 0 && (
        <Alert
          severity="info"
          sx={{ mx: 2 }}
          action={
            <Button component={RouterLink} to="/dodaj" color="inherit" size="small">
              Dodaj
            </Button>
          }
        >
          W tym mieście nie ma jeszcze nadchodzących wydarzeń. Dodaj pierwsze!
        </Alert>
      )}

      {(status === 'loading' || events.length > 0) && (
        <>
          <ScrollRow label="Najbliższe wydarzenia">
            {status === 'loading' ? skeletons('large') : cards(upcoming, 'large')}
          </ScrollRow>

          <Section title="Preferencje">
            {status === 'loading' ? (
              <ScrollRow label="Preferencje">{skeletons('medium')}</ScrollRow>
            ) : preferred.length > 0 ? (
              <ScrollRow label="Wydarzenia dopasowane do Twoich preferencji">
                {cards(preferred, 'medium')}
              </ScrollRow>
            ) : (
              <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
                {preferences.length === 0
                  ? 'Zaznacz powyżej, dla kogo szukasz wydarzeń, a dopasujemy propozycje.'
                  : 'Brak nadchodzących wydarzeń dla wybranych grup.'}
              </Typography>
            )}
          </Section>

          <Section title="Lubiane przez innych">
            <ScrollRow label="Wydarzenia z największą liczbą zapisanych">
              {status === 'loading' ? skeletons('medium') : cards(popular, 'medium')}
            </ScrollRow>
          </Section>
        </>
      )}

      <Fab
        component={RouterLink}
        to="/mapa"
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
        Mapa
        <MapOutlinedIcon sx={{ ml: 1 }} />
      </Fab>
    </Box>
  )
}
