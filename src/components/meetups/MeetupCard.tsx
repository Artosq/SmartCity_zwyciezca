import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlaceIcon from '@mui/icons-material/Place'
import { getMeetupType } from '../../data/meetupTypes'
import { formatRelativeDate } from '../../lib/eventDisplay'
import type { MeetupWithHost, Organizer } from '../../lib/types'
import RatingBadge from '../RatingBadge'

interface Props {
  meetup: MeetupWithHost
  distanceKm: number
  // „Twoja propozycja" / „Idziesz" — gdy zalogowany jest hostem albo gościem
  badge?: string
  onOpen: () => void
}

const pill = {
  position: 'absolute',
  bottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '0.9rem',
} as const

export function MeetupTags({ meetup }: { meetup: MeetupWithHost }) {
  const tags = [...meetup.tags, ...(meetup.duration_min ? [`${meetup.duration_min} min`] : [])]
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      {tags.map((tag) => (
        <Box
          key={tag}
          component="span"
          sx={{ px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: 'grey.100', fontWeight: 700, fontSize: '0.85rem' }}
        >
          {tag}
        </Box>
      ))}
    </Stack>
  )
}

export function HostLine({ host }: { host: Organizer | null }) {
  const name = host?.name ?? 'Sąsiad'
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', fontWeight: 800, bgcolor: '#7dd3fc', color: 'text.primary' }}>
        {name.slice(0, 2).toUpperCase()}
      </Avatar>
      <Typography sx={{ fontWeight: 700, flex: 1 }}>{name}</Typography>
      <RatingBadge avg={host?.rating_avg} count={host?.rating_count} />
    </Stack>
  )
}

// Karta spotkania we dwoje: kolorowe tło z symbolem rodzaju, odległość i termin, pod spodem tytuł i osoba.
export default function MeetupCard({ meetup, distanceKm, badge, onOpen }: Props) {
  const type = getMeetupType(meetup.type)

  return (
    <ButtonBase
      onClick={onOpen}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: '32px',
        transition: 'transform 0.2s ease',
        '&:hover, &:focus-visible': { transform: 'translateY(-6px)' },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 150,
          borderRadius: '32px',
          background: type.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(17,17,17,0.16)',
        }}
      >
        <Box component="span" aria-hidden sx={{ fontSize: 64, lineHeight: 1 }}>
          {type.emoji}
        </Box>
        {badge && (
          <Box sx={{ ...pill, bottom: 'auto', top: 12, left: 12, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {badge}
          </Box>
        )}
        <Box sx={{ ...pill, left: 12, bgcolor: 'secondary.main' }} aria-label={`${distanceKm.toFixed(1)} km od centrum miasta`}>
          <PlaceIcon sx={{ fontSize: 16, color: 'error.main' }} />
          {distanceKm.toFixed(1)} km
        </Box>
        <Box sx={{ ...pill, right: 12, bgcolor: 'background.paper' }}>
          {formatRelativeDate(meetup.starts_at)}
        </Box>
      </Box>

      <Stack spacing={1} sx={{ px: 0.5, pt: 1.5 }}>
        <Typography variant="h3" sx={{ fontSize: '1.15rem' }}>
          {meetup.title}
        </Typography>
        <HostLine host={meetup.host} />
        <MeetupTags meetup={meetup} />
      </Stack>
    </ButtonBase>
  )
}
