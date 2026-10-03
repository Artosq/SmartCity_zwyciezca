import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import GroupChips from '../components/GroupChips'
import EventMap from '../components/map/EventMap'
import EventSheet from '../components/map/EventSheet'
import type { City } from '../data/cities'
import { useAuth } from '../hooks/useAuth'
import { useCityEvents } from '../hooks/useCityEvents'
import { distanceKm } from '../lib/eventDisplay'
import { isSupabaseConfigured } from '../lib/supabase'

// Tyle najchętniej wybieranych wydarzeń w mieście dostaje znaczek „Popularne".
const POPULAR_COUNT = 3

export default function MapPage({ city }: { city: City }) {
  const { user } = useAuth()
  const { events, status } = useCityEvents(city)
  // Wybrane wydarzenie trzymamy w adresie (?event=id), żeby karty ze strony głównej mogły je otworzyć.
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const [linkedEventId] = useState(selectedEventId)
  const setSelectedEventId = (id: string | null) =>
    setSearchParams(id ? { event: id } : {}, { replace: true })
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // Bez zaznaczonych chipów widać wszystko; wydarzenie bez przypisanych grup jest widoczne zawsze.
  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          selectedGroups.length === 0 ||
          event.target_groups.length === 0 ||
          event.target_groups.some((group) => selectedGroups.includes(group)),
      ),
    [events, selectedGroups],
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h1" sx={{ position: 'absolute', left: -9999 }}>
        Mapa wydarzeń — {city.name}
      </Typography>

      <GroupChips
        label="Filtr: dla kogo są wydarzenia"
        selected={selectedGroups}
        onChange={setSelectedGroups}
      />

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <EventMap
          city={city}
          events={visibleEvents}
          selectedGroups={selectedGroups}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

        <Box
          sx={{
            position: 'absolute',
            zIndex: 1000,
            top: 12,
            left: 60,
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
          {status === 'ready' && visibleEvents.length === 0 && (
            <Alert severity="info" elevation={4} sx={{ pointerEvents: 'auto' }}>
              {events.length === 0
                ? 'W tym mieście nie ma jeszcze nadchodzących wydarzeń. Dodaj pierwsze!'
                : 'Brak wydarzeń dla wybranych grup.'}
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
      </Box>
    </Box>
  )
}
