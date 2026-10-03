import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import GroupIcon from '@mui/icons-material/Group'
import PlaceIcon from '@mui/icons-material/Place'
import ScheduleIcon from '@mui/icons-material/Schedule'
import type { ReactNode } from 'react'
import { formatShortDate, getEventImage } from '../lib/eventDisplay'
import type { EventWithStats } from '../lib/types'
import RatingBadge from './RatingBadge'

interface Props {
  event: EventWithStats
  distanceKm: number
  size?: 'large' | 'medium'
}

function Meta({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      aria-label={label}
      sx={{ alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      {icon}
      <span>{children}</span>
    </Stack>
  )
}

// Wiersz liczb pod tytułem: zapisani, odległość od centrum, termin.
export function EventMeta({ event, distanceKm }: { event: EventWithStats; distanceKm: number }) {
  return (
    <Stack direction="row" sx={{ mt: 0.75, columnGap: 1.5, rowGap: 0.25, flexWrap: 'wrap' }}>
      <Meta
        label={`Zapisanych osób: ${event.attendees}, ${
          event.capacity === null ? 'bez limitu miejsc' : `limit miejsc: ${event.capacity}`
        }`}
        icon={<GroupIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
      >
        {/* brak limitu (np. wydarzenia z bota) pokazujemy wprost, żeby nie wyglądał jak „0 miejsc" */}
        {event.capacity === null
          ? `${event.attendees} · bez limitu`
          : `${event.attendees}/${event.capacity}`}
      </Meta>
      <Meta
        label={`${distanceKm.toFixed(1)} km od centrum miasta`}
        icon={<PlaceIcon sx={{ fontSize: 18, color: 'error.main' }} />}
      >
        {distanceKm.toFixed(1)} km
      </Meta>
      <Meta
        label={`Termin: ${formatShortDate(event.starts_at)}`}
        icon={<ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
      >
        {formatShortDate(event.starts_at)}
      </Meta>
    </Stack>
  )
}

// Kto organizuje i jak jest oceniany. Wydarzenia z bota nie mają organizatora-osoby.
export function OrganizerLine({ event }: { event: EventWithStats }) {
  if (event.source || !event.organizer) return null
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5, minWidth: 0 }}>
      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
        {event.organizer.name ?? 'Organizator'}
      </Typography>
      <RatingBadge avg={event.organizer.rating_avg} count={event.organizer.rating_count} />
    </Stack>
  )
}

// Karta wydarzenia z karuzeli: zdjęcie jako tło przycisku, pod nim tytuł, kategoria i liczby.
// Kliknięcie otwiera wydarzenie na mapie.
export default function EventCard({ event, distanceKm, size = 'medium' }: Props) {
  const large = size === 'large'

  return (
    <ButtonBase
      component={RouterLink}
      to={`/mapa?event=${event.id}`}
      sx={{
        display: 'block',
        flexShrink: 0,
        width: large ? { xs: '84vw', sm: 420 } : { xs: 210, sm: 250 },
        maxWidth: large ? 420 : undefined,
        textAlign: 'left',
        borderRadius: 6,
        transition: 'transform 0.2s ease',
        '&:hover, &:focus-visible': { transform: 'translateY(-6px)' },
        '&:hover img, &:focus-visible img': { transform: 'scale(1.06)' },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover, &:focus-visible': { transform: 'none' },
        },
      }}
    >
      <Box
        sx={{
          height: large ? 180 : 140,
          overflow: 'hidden',
          borderRadius: large ? '44px' : '36px',
          bgcolor: 'grey.200',
          boxShadow: '0 6px 16px rgba(17,17,17,0.16)',
        }}
      >
        <Box
          component="img"
          src={getEventImage(event)}
          alt=""
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.25s',
          }}
        />
      </Box>

      <Box sx={{ px: 1.5, pt: 1.25 }}>
        <Typography variant="h3" noWrap>
          {event.title}
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {event.category?.name ?? 'Wydarzenie'}
        </Typography>
        <OrganizerLine event={event} />
        <EventMeta event={event} distanceKm={distanceKm} />
      </Box>
    </ButtonBase>
  )
}
