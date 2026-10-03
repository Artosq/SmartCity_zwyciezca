import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import FilterListIcon from '@mui/icons-material/FilterList'
import EventMap from '../components/map/EventMap'
import EventSheet from '../components/map/EventSheet'
import TargetGroupFilter from '../components/TargetGroupFilter'
import type { City } from '../data/cities'
import { ALL_GROUP_SLUGS } from '../data/targetGroups'
import { useAuth } from '../hooks/useAuth'
import { useCityEvents } from '../hooks/useCityEvents'
import { isSupabaseConfigured } from '../lib/supabase'

export default function MapPage({ city }: { city: City }) {
  const { user } = useAuth()
  const { events, status } = useCityEvents(city)
  // Wybrane wydarzenie trzymamy w adresie (?event=id), żeby karty ze strony głównej mogły je otworzyć.
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const [linkedEventId] = useState(selectedEventId)
  const setSelectedEventId = (id: string | null) =>
    setSearchParams(id ? { event: id } : {}, { replace: true })
  const [selectedGroups, setSelectedGroups] = useState(ALL_GROUP_SLUGS)
  const [filterOpen, setFilterOpen] = useState(false)

  // Wydarzenie bez przypisanych grup jest widoczne zawsze.
  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.target_groups.length === 0 ||
          event.target_groups.some((group) => selectedGroups.includes(group)),
      ),
    [events, selectedGroups],
  )

  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId)

  const filter = (
    <>
      <TargetGroupFilter legend="Dla kogo?" selected={selectedGroups} onChange={setSelectedGroups} />
      <Typography color="text.secondary" sx={{ mt: 2 }} aria-live="polite">
        Wydarzenia na mapie: <strong>{visibleEvents.length}</strong>
      </Typography>
    </>
  )

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* Od md: stały panel boczny. Na telefonie filtr otwiera się w szufladzie od dołu. */}
      <Paper
        component="aside"
        square
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 300,
          flexShrink: 0,
          p: 3,
          overflowY: 'auto',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        {filter}
      </Paper>

      <Drawer
        anchor="bottom"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        sx={{ display: { md: 'none' } }}
        slotProps={{ paper: { sx: { borderRadius: '20px 20px 0 0', p: 3, pb: 4 } } }}
      >
        {filter}
        <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={() => setFilterOpen(false)}>
          Pokaż mapę
        </Button>
      </Drawer>

      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <EventMap
          city={city}
          events={visibleEvents}
          selectedGroups={selectedGroups}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

        <Fab
          variant="extended"
          color="secondary"
          onClick={() => setFilterOpen(true)}
          sx={{ display: { md: 'none' }, position: 'absolute', top: 12, right: 12, zIndex: 1000 }}
        >
          <FilterListIcon sx={{ mr: 1 }} />
          Filtry ({selectedGroups.length}/{ALL_GROUP_SLUGS.length})
        </Fab>

        <Box
          sx={{
            position: 'absolute',
            zIndex: 1000,
            top: { xs: 72, md: 12 },
            left: { xs: 12, md: 60 },
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
          {status === 'ready' && events.length === 0 && (
            <Alert severity="info" elevation={4} sx={{ pointerEvents: 'auto' }}>
              W tym mieście nie ma jeszcze nadchodzących wydarzeń. Dodaj pierwsze!
            </Alert>
          )}
        </Box>

        {selectedEvent && (
          <EventSheet
            key={selectedEvent.id}
            event={selectedEvent}
            user={user}
            defaultExpanded={selectedEvent.id === linkedEventId}
            onClose={() => setSelectedEventId(null)}
          />
        )}
      </Box>
    </Box>
  )
}
