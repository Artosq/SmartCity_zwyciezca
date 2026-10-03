import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GroupIcon from '@mui/icons-material/Group'
import PlaceIcon from '@mui/icons-material/Place'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { getGroups } from '../../data/targetGroups'
import { supabase } from '../../lib/supabase'
import { formatLongDate, getEventImage } from '../../lib/eventDisplay'
import type { EventWithStats } from '../../lib/types'
import { GroupDot } from '../TargetGroupFilter'

interface Props {
  event: EventWithStats
  user: User | null
  // Rozwinięty od razu — gdy użytkownik przyszedł z karty na stronie głównej.
  defaultExpanded?: boolean
  onClose: () => void
}

// Pasek wydarzenia nad nawigacją: zwinięty pokazuje tytuł i termin,
// po rozwinięciu — opis, grupy, licznik miejsc i zapis.
export default function EventSheet({ event, user, defaultExpanded = false, onClose }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [attendees, setAttendees] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadAttendees = useCallback(async () => {
    const { data, error } = await supabase.from('rsvps').select('user_id').eq('event_id', event.id)
    if (error) setError('Nie udało się pobrać listy zapisanych.')
    else setAttendees(data.map((row) => row.user_id as string))
  }, [event.id])

  useEffect(() => {
    loadAttendees()
  }, [loadAttendees])

  const joined = Boolean(user && attendees?.includes(user.id))
  const count = attendees?.length ?? 0
  const full = event.capacity !== null && count >= event.capacity

  async function toggleRsvp() {
    if (!user) return
    setBusy(true)
    setError('')
    const { error } = joined
      ? await supabase.from('rsvps').delete().eq('event_id', event.id).eq('user_id', user.id)
      : await supabase.from('rsvps').insert({ event_id: event.id, user_id: user.id })
    if (error) setError(joined ? 'Nie udało się wypisać.' : 'Nie udało się zapisać.')
    await loadAttendees()
    setBusy(false)
  }

  const places =
    attendees === null
      ? 'Sprawdzanie miejsc…'
      : event.capacity === null
        ? `Zapisanych: ${count} (bez limitu miejsc)`
        : `Wolne miejsca: ${Math.max(event.capacity - count, 0)} z ${event.capacity}`

  return (
    <Paper
      component="section"
      aria-label={`Wydarzenie: ${event.title}`}
      elevation={12}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        bottom: { xs: 0, md: 16 },
        left: { xs: 0, md: 16 },
        right: { xs: 0, md: 'auto' },
        width: { md: 420 },
        maxHeight: '75%',
        overflowY: 'auto',
        borderRadius: { xs: '28px 28px 0 0', md: '28px' },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'stretch' }}>
        <ButtonBase
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="event-sheet-details"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'block',
            textAlign: 'left',
            p: 2,
            pt: 1,
            borderRadius: 'inherit',
          }}
        >
          <Box
            aria-hidden
            sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'grey.400', mx: 'auto', mb: 1 }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h2" noWrap={!expanded}>
                {event.title}
              </Typography>
              <Typography color="text.secondary" noWrap={!expanded}>
                {formatLongDate(event.starts_at)}
              </Typography>
            </Box>
            {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </Stack>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, mt: 0.5 }}>
            {expanded ? 'Zwiń' : 'Rozwiń szczegóły'}
          </Typography>
        </ButtonBase>
        <IconButton onClick={onClose} aria-label="Zamknij" sx={{ alignSelf: 'flex-start', m: 1 }}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Collapse in={expanded} id="event-sheet-details">
        <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
          <Box
            component="img"
            src={getEventImage(event)}
            alt=""
            sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: '28px' }}
          />
          {event.category && (
            <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>{event.category.name}</Typography>
          )}
          {event.description && <Typography>{event.description}</Typography>}

          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ScheduleIcon color="action" />
              <Typography>{formatLongDate(event.starts_at)}</Typography>
            </Stack>
            {event.place_name && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PlaceIcon color="action" />
                <Typography>{event.place_name}</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <GroupIcon color="action" />
              <Typography aria-live="polite">{places}</Typography>
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {getGroups(event.target_groups).map((group) => (
              <Chip
                key={group.slug}
                variant="outlined"
                icon={<GroupDot color={group.color} />}
                label={group.name}
                sx={{ pl: 0.5 }}
              />
            ))}
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {!user ? (
            <Button component={RouterLink} to="/login" variant="contained" size="large">
              Zaloguj się, aby dołączyć
            </Button>
          ) : joined ? (
            <Button variant="outlined" size="large" disabled={busy} onClick={toggleRsvp}>
              Wypisz się
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              disabled={busy || full || attendees === null}
              onClick={toggleRsvp}
            >
              {full ? 'Brak wolnych miejsc' : 'Dołącz'}
            </Button>
          )}
          {joined && <Alert severity="success">Jesteś zapisany(-a) na to wydarzenie.</Alert>}
        </Stack>
      </Collapse>
    </Paper>
  )
}
