import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import EventCard from '../components/EventCard'
import GroupChips from '../components/GroupChips'
import MeetupsView from '../components/meetups/MeetupsView'
import ModeToggle, { type Mode } from '../components/ModeToggle'
import ScrollRow from '../components/ScrollRow'
import { useUserLocation } from '../context/LocationContext'
import type { City } from '../data/cities'
import { useCityEvents } from '../hooks/useCityEvents'
import { useLang } from '../i18n/LanguageContext'
import { distanceKm } from '../lib/eventDisplay'
import { isSupabaseConfigured } from '../lib/supabase'
import type { EventWithStats } from '../lib/types'

// Dodany import useProfile zeby zaciagac zainteresowania usera
import { useProfile } from '../hooks/useProfile'

const PREFERENCES_STORAGE_KEY = 'sasiedzko.preferences'
const CAROUSEL_LIMIT = 10

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

function readPreferences(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((slug) => typeof slug === 'string') : []
  } catch {
    return []
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 2 }}>
      <Typography
        variant="h2"
        sx={{
          px: 2,
          animation: 'fadeInUp 0.5s ease both',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export default function HomePage({ city }: { city: City }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: Mode =
    searchParams.get('widok') === '1na1' && !searchParams.get('q') ? '1na1' : 'wydarzenia'

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 12 }}>
      <Box sx={{ px: 2, pt: 1, pb: 1, maxWidth: 480 }}>
        <ModeToggle
          label="Co chcesz zobaczyć?"
          value={mode}
          onChange={(next) => setSearchParams(next === '1na1' ? { widok: '1na1' } : {}, { replace: true })}
        />
      </Box>
      <DistanceHint />
      {mode === '1na1' ? <MeetupsView city={city} /> : <EventsView city={city} />}
    </Box>
  )
}

function DistanceHint() {
  const { position, status, request } = useUserLocation()
  if (status === 'unsupported') return null

  return (
    <Box sx={{ px: 2, pb: 0.5, minHeight: 36, display: 'flex', alignItems: 'center' }}>
      {position ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          📍 Odległości liczone od Twojej lokalizacji.
        </Typography>
      ) : status === 'denied' ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Odległości liczone od centrum miasta (lokalizacja jest zablokowana w przeglądarce).
        </Typography>
      ) : (
        <Button size="small" startIcon={<MyLocationIcon />} onClick={request} sx={{ minHeight: 36 }}>
          Pokaż odległość ode mnie
        </Button>
      )}
    </Box>
  )
}

function EventsView({ city }: { city: City }) {
  const { t } = useLang()
  const origin = useUserLocation().position ?? city.center
  const { events, status } = useCityEvents(city)
  
  // Zaciagamy dane z profilu
  const { interests: profileInterests, loading: profileLoading } = useProfile()
  
  const [preferences, setPreferences] = useState<string[]>([])
  const [hasManuallyChanged, setHasManuallyChanged] = useState(false)
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  // Inicjalizacja preferencji: profil usera (jesli sa) -> localStorage -> []
  useEffect(() => {
    if (!profileLoading && !hasManuallyChanged) {
      if (profileInterests && profileInterests.length > 0) {
        setPreferences(profileInterests)
      } else {
        setPreferences(readPreferences())
      }
    }
  }, [profileInterests, profileLoading, hasManuallyChanged])

  const savePreferences = (next: string[]) => {
    setPreferences(next)
    setHasManuallyChanged(true)
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const upcoming = events.slice(0, CAROUSEL_LIMIT)
  const preferred = useMemo(
    () =>
      events
        .filter((event) => {
          // .some() гарантирует логику ИЛИ (достаточно совпадения хотя бы одного интереса)
          return preferences.some((pref) => {
            const prefLower = pref.toLowerCase()
            
            const inGroups = event.target_groups?.some(g => g.toLowerCase() === prefLower)
            
            const inCategory = 
              event.category?.name?.toLowerCase() === prefLower || 
              event.category?.slug?.toLowerCase() === prefLower
              
            return inGroups || inCategory
          })
        })
        .slice(0, CAROUSEL_LIMIT),
    [events, preferences],
  )
  const popular = useMemo(
    () => [...events].sort((a, b) => b.attendees - a.attendees).slice(0, CAROUSEL_LIMIT),
    [events],
  )

  const matches = useMemo(() => {
    if (!query) return []
    const q = normalize(query)
    return events.filter((event) =>
      normalize(
        `${event.title} ${event.description ?? ''} ${event.place_name ?? ''} ${event.category?.name ?? ''}`,
      ).includes(q),
    )
  }, [events, query])

  const cards = (list: EventWithStats[], size: 'large' | 'medium') =>
    list.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        size={size}
        distanceKm={distanceKm(origin, [event.lat, event.lng])}
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
    <Box>
      <Typography variant="h1" sx={{ position: 'absolute', left: -9999 }}>
        {t('home.heading', { city: city.name })}
      </Typography>

      <GroupChips label={t('home.prefsChips')} selected={preferences} onChange={savePreferences} />

      {status === 'error' && (
        <Alert severity="error" sx={{ mx: 2 }}>
          {isSupabaseConfigured ? t('home.errorFetch') : t('home.errorNoDb')}
        </Alert>
      )}

      {status === 'ready' && !query && events.length === 0 && (
        <Alert
          severity="info"
          sx={{ mx: 2 }}
          action={
            <Button component={RouterLink} to="/dodaj" color="inherit" size="small">
              {t('home.add')}
            </Button>
          }
        >
          {t('home.cityEmpty')}
        </Alert>
      )}

      {query ? (
        <Box component="section" sx={{ mt: 2 }}>
          <Typography
            variant="h2"
            sx={{ px: 2 }}
          >
            {t('search.results', { query })}
          </Typography>
          {status === 'loading' ? (
            <ScrollRow label={t('search.searching')}>{skeletons('medium')}</ScrollRow>
          ) : matches.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, px: 2, pt: 1 }}>
              {cards(matches, 'medium')}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
              {t('search.empty', { query })}
            </Typography>
          )}
        </Box>
      ) : (
        (status === 'loading' || events.length > 0) && (
        <>
          <ScrollRow label={t('home.upcoming')}>
            {status === 'loading' ? skeletons('large') : cards(upcoming, 'large')}
          </ScrollRow>

          <Section title={t('home.prefsSection')}>
            {status === 'loading' ? (
              <ScrollRow label={t('home.prefsSection')}>{skeletons('medium')}</ScrollRow>
            ) : preferred.length > 0 ? (
              <ScrollRow label={t('home.prefsMatched')}>{cards(preferred, 'medium')}</ScrollRow>
            ) : (
              <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
                {preferences.length === 0
                  ? t('home.prefsEmptyNone')
                  : t('home.prefsEmptySelected')}
              </Typography>
            )}
          </Section>

          <Section title={t('home.liked')}>
            <ScrollRow label={t('home.likedRow')}>
              {status === 'loading' ? skeletons('medium') : cards(popular, 'medium')}
            </ScrollRow>
          </Section>
        </>
        )
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
        {t('home.fabMap')}
        <MapOutlinedIcon sx={{ ml: 1 }} />
      </Fab>
    </Box>
  )
}