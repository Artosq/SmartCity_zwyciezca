import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune'
import EventMap from '../components/map/EventMap'
import EventSheet from '../components/map/EventSheet'
import MapFilters, {
  countActiveFilters,
  EMPTY_FILTERS,
  type MapFilterValues,
} from '../components/map/MapFilters'
import MeetupDialog from '../components/meetups/MeetupDialog'
import type { City } from '../data/cities'
import { useAuth } from '../hooks/useAuth'
import { useCityEvents } from '../hooks/useCityEvents'
import { useMeetups } from '../hooks/useMeetups'
import { distanceKm } from '../lib/eventDisplay'
import { isSupabaseConfigured } from '../lib/supabase'

// Tyle najchętniej wybieranych wydarzeń w mieście dostaje znaczek „Popularne".
const POPULAR_COUNT = 3
// Oświadczenie o pełnoletności zapamiętujemy na urządzeniu — bez niego wyjść 1:1 nie ma na mapie.
const ADULT_STORAGE_KEY = 'sasiedzko.adult'

function readAdult() {
  try {
    return localStorage.getItem(ADULT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function MapPage({ city }: { city: City }) {
  const { user } = useAuth()
  const { events, status } = useCityEvents(city)
  const { meetups, reload: reloadMeetups } = useMeetups(city)
  // Wybrane wydarzenie trzymamy w adresie (?event=id), żeby karty ze strony głównej mogły je otworzyć.
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const [linkedEventId] = useState(selectedEventId)
  const setSelectedEventId = (id: string | null) =>
    setSearchParams(id ? { event: id } : {}, { replace: true })

  const [filters, setFilters] = useState<MapFilterValues>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [adult, setAdult] = useState(readAdult)
  const [openMeetupId, setOpenMeetupId] = useState<string | null>(null)

  const confirmAdult = () => {
    setAdult(true)
    try {
      localStorage.setItem(ADULT_STORAGE_KEY, '1')
    } catch {
      // brak dostępu do localStorage — oświadczenie działa do odświeżenia strony
    }
  }

  // Kategorie występujące wśród wydarzeń w mieście — z nich budujemy filtr „Cel wydarzenia".
  const categories = useMemo(() => {
    const bySlug = new Map<string, string>()
    for (const event of events) if (event.category) bySlug.set(event.category.slug, event.category.name)
    return [...bySlug].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, 'pl'))
  }, [events])

  // Pusty filtr = bez ograniczeń. Wydarzenie bez przypisanych grup przechodzi filtr wieku zawsze.
  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (filters.groups.length === 0 ||
            event.target_groups.length === 0 ||
            event.target_groups.some((group) => filters.groups.includes(group))) &&
          (filters.categories.length === 0 ||
            (event.category !== null && filters.categories.includes(event.category.slug))),
      ),
    [events, filters.groups, filters.categories],
  )

  // Wyjścia 1:1: tylko dla pełnoletnich, tylko wolne (albo własne) i pasujące do wybranych rodzajów.
  const visibleMeetups = useMemo(
    () =>
      adult && filters.showMeetups
        ? meetups.filter(
            (meetup) =>
              (meetup.guest_id === null ||
                meetup.host_id === user?.id ||
                meetup.guest_id === user?.id) &&
              (filters.meetupTypes.length === 0 || filters.meetupTypes.includes(meetup.type)),
          )
        : [],
    [adult, filters.showMeetups, filters.meetupTypes, meetups, user?.id],
  )

  const popularIds = useMemo(
    () =>
      [...events]
        .filter((event) => event.attendees > 0)
        .sort((a, b) => b.attendees - a.attendees)
        .slice(0, POPULAR_COUNT)
        .map((event) => event.id),
    [events],
  )

  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId)
  const openMeetup = meetups.find((meetup) => meetup.id === openMeetupId)
  const resultCount = visibleEvents.length + visibleMeetups.length
  const activeFilters = countActiveFilters(filters)

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Typography variant="h1" sx={{ position: 'absolute', left: -9999 }}>
        Mapa wydarzeń — {city.name}
      </Typography>

      <EventMap
        city={city}
        events={visibleEvents}
        meetups={visibleMeetups}
        selectedGroups={filters.groups}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        onSelectMeetup={setOpenMeetupId}
      />

      {/* Jeden przycisk otwiera całe menu filtrów; liczba = ile filtrów jest włączonych. */}
      <Box sx={{ position: 'absolute', zIndex: 1000, top: 12, right: 12 }}>
        <Badge badgeContent={activeFilters} color="primary" overlap="circular">
          <Fab
            variant="extended"
            color="secondary"
            onClick={() => setFiltersOpen(true)}
            aria-label={`Filtry, włączonych: ${activeFilters}`}
          >
            <TuneIcon sx={{ mr: 1 }} />
            Filtry
          </Fab>
        </Badge>
      </Box>

      <MapFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        values={filters}
        onChange={setFilters}
        categories={categories}
        adult={adult}
        onConfirmAdult={confirmAdult}
        resultCount={resultCount}
      />

      <Box
        sx={{
          position: 'absolute',
          zIndex: 1000,
          top: 72,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {status === 'loading' && (
          <Paper elevation={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
            <CircularProgress size={20} />
            <Typography>Ładowanie wydarzeń…</Typography>
          </Paper>
        )}
        {status === 'error' && (
          <Alert severity="error" elevation={4} sx={{ pointerEvents: 'auto' }}>
            {isSupabaseConfigured
              ? 'Nie udało się pobrać wydarzeń. Spróbuj ponownie za chwilę.'
              : 'Brak połączenia z bazą — uzupełnij klucze Supabase w pliku .env.local.'}
          </Alert>
        )}
        {status === 'ready' && resultCount === 0 && (
          <Alert severity="info" elevation={4} sx={{ pointerEvents: 'auto' }}>
            {events.length === 0
              ? 'W tym mieście nie ma jeszcze nadchodzących wydarzeń. Dodaj pierwsze!'
              : 'Nic nie pasuje do wybranych filtrów.'}
          </Alert>
        )}
      </Box>

      {selectedEvent && (
        <EventSheet
          key={selectedEvent.id}
          event={selectedEvent}
          user={user}
          popular={popularIds.includes(selectedEvent.id)}
          distanceKm={distanceKm(city.center, [selectedEvent.lat, selectedEvent.lng])}
          defaultExpanded={selectedEvent.id === linkedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {openMeetup && (
        <MeetupDialog
          meetup={openMeetup}
          user={user}
          onClose={() => setOpenMeetupId(null)}
          onChanged={reloadMeetups}
        />
      )}
    </Box>
  )
}
