import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom' // Added useNavigate
import type { User } from '@supabase/supabase-js'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
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
import { EventMeta } from '../EventCard'
import { GroupDot } from '../TargetGroupFilter'

// External services from which the bot imports events
const SOURCE_NAMES: Record<string, string> = {
  karnet: 'Karnet Kraków',
  facebook: 'Facebook',
}

interface Props {
  event: EventWithStats
  user: User | null
  // One of the most frequently chosen events in the city - gets the "Popular" badge.
  popular: boolean
  distanceKm: number
  // Expanded by default - when the user came from the card on the home page.
  defaultExpanded?: boolean
  onClose: () => void
}

export default function EventSheet({
  event,
  user,
  popular,
  distanceKm,
  defaultExpanded = false,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [attendees, setAttendees] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate() // Initialize navigation hook

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
    
    // Check if the user is joining or leaving
    if (joined) {
        // Leave the event
        const { error } = await supabase.from('rsvps').delete().eq('event_id', event.id).eq('user_id', user.id)
        if (error) setError('Nie udało się wypisać.')
    } else {
        // Join the event
        const { error } = await supabase.from('rsvps').insert({ event_id: event.id, user_id: user.id })
        if (error) {
            setError('Nie udało się zapisać.')
        } else {
            // Successfully joined, navigate to the chat page
            navigate('/czat')
        }
    }
    
    await loadAttendees()
    setBusy(false)
  }

  const places =
    attendees === null
      ? 'Sprawdzanie miejsc…'
      : event.capacity === null
        ? `Brak limitu miejsc · zapisanych: ${count}`
        : full
          ? `Brak wolnych miejsc (limit ${event.capacity})`
          : `Wolne miejsca: ${event.capacity - count} z ${event.capacity}`

  return (
    <Paper
      component="section"
      aria-label={`Wydarzenie: ${event.title}`}
      elevation={12}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        bottom: { xs: 10, md: 16 },
        left: { xs: 10, md: 16 },
        right: { xs: 10, md: 'auto' },
        width: { md: 420 },
        maxHeight: 'calc(100% - 24px)',
        overflowY: 'auto',
        borderRadius: '24px',
      }}
    >
      {popular && (
        <Box
          sx={{
            display: 'inline-block',
            ml: 2,
            mt: 1.5,
            px: 2.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: 'secondary.main',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          Popularne
        </Box>
      )}
      <Stack direction="row" sx={{ alignItems: 'flex-start' }}>
        <ButtonBase
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="event-sheet-details"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textAlign: 'left',
            p: 2,
            pt: popular ? 1 : 2,
            borderRadius: '24px',
          }}
        >
          <Box
            component="img"
            src={getEventImage(event)}
            alt=""
            sx={{ width: 64, height: 64, flexShrink: 0, objectFit: 'cover', borderRadius: '18px' }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" noWrap={!expanded} sx={{ textDecoration: 'underline' }}>
              {event.title}
            </Typography>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {event.category?.name ?? 'Event'}
            </Typography>
            <EventMeta event={event} distanceKm={distanceKm} />
          </Box>
          {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </ButtonBase>
        <IconButton onClick={onClose} aria-label="Zamknij" sx={{ mt: 1, mr: 1 }}>
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

          {event.source_url && (
            <Typography variant="body2" color="text.secondary">
              Zaimportowane automatycznie.{' '}
              <Link href={event.source_url} target="_blank" rel="noopener noreferrer">
                Zobacz oryginał ({SOURCE_NAMES[event.source ?? ''] ?? event.source})
              </Link>
            </Typography>
          )}

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