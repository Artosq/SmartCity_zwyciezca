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
import { useLang } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabase'
import { formatLongDate, getEventImage } from '../../lib/eventDisplay'
import type { EventWithStats } from '../../lib/types'
import { EventMeta, OrganizerLine } from '../EventCard'
import ReportButton from '../ReportButton'
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
  const { t, td } = useLang()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [attendees, setAttendees] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate() // Initialize navigation hook

  const loadAttendees = useCallback(async () => {
    const { data, error } = await supabase.from('rsvps').select('user_id').eq('event_id', event.id)
    if (error) setError(t('event.loadErr'))
    else setAttendees(data.map((row) => row.user_id as string))
  }, [event.id, t])

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
        if (error) setError(t('event.leaveErr'))
    } else {
        // Join the event
        const { error } = await supabase.from('rsvps').insert({ event_id: event.id, user_id: user.id })
        if (error) {
            setError(t('event.joinErr'))
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
      ? t('event.checking')
      : event.capacity === null
        ? t('event.noLimit', { count })
        : full
          ? t('event.full', { cap: event.capacity })
          : t('event.free', { count: event.capacity - count, cap: event.capacity })

  return (
    <Paper
      component="section"
      aria-label={t('event.ariaLabel', { title: event.title })}
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
        animation: 'sheetIn 0.32s cubic-bezier(.2,.8,.2,1) backwards',
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
          {t('event.popular')}
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
            <Typography variant="h3" noWrap={!expanded}>
              {event.title}
            </Typography>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {event.category ? td('cat', event.category.slug, event.category.name) : t('event.fallbackCategory')}
            </Typography>
            <EventMeta event={event} distanceKm={distanceKm} />
          </Box>
          {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </ButtonBase>
        <IconButton onClick={onClose} aria-label={t('event.close')} sx={{ mt: 1, mr: 1 }}>
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
          <OrganizerLine event={event} />
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
              {t('event.imported')}{' '}
              <Link href={event.source_url} target="_blank" rel="noopener noreferrer">
                {t('event.seeOriginal', { source: SOURCE_NAMES[event.source ?? ''] ?? event.source ?? '' })}
              </Link>
            </Typography>
          )}

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {getGroups(event.target_groups).map((group) => (
              <Chip
                key={group.slug}
                variant="outlined"
                icon={<GroupDot color={group.color} />}
                label={td('group', group.slug, group.name)}
                sx={{ pl: 0.5 }}
              />
            ))}
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {!user ? (
            <Button component={RouterLink} to="/login" variant="contained" size="large">
              {t('event.loginToJoin')}
            </Button>
          ) : joined ? (
            <Button variant="outlined" size="large" disabled={busy} onClick={toggleRsvp}>
              {t('event.leave')}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              disabled={busy || full || attendees === null}
              onClick={toggleRsvp}
            >
              {full ? t('event.noSpots') : t('event.join')}
            </Button>
          )}
          {joined && <Alert severity="success">{t('event.joined')}</Alert>}
          {/* własnego wydarzenia ani wydarzenia z miejskiego kalendarza się nie zgłasza */}
          {!event.source && event.organizer_id !== user?.id && (
            <ReportButton targetType="event" targetId={event.id} reportedUserId={event.organizer_id} label={t('event.report')} />
          )}
        </Stack>
      </Collapse>
    </Paper>
  )
}