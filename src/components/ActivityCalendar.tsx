import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { supabase } from '../lib/supabase'

type Kind = 'joined' | 'organized' | 'meetup'

interface Activity {
  key: string
  kind: Kind
  title: string
  startsAt: Date
  place: string | null
  // dokąd prowadzi kliknięcie
  to: string
}

const KINDS: Record<Kind, { label: string; color: string }> = {
  joined: { label: 'Zapisany(-a)', color: '#4b3bf0' },
  organized: { label: 'Organizujesz', color: '#f59e0b' },
  meetup: { label: 'We dwoje', color: '#ec4899' },
}

const WEEKDAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd']
const monthTitle = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
const dayTitle = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
const timeOnly = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' })

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// Kalendarz miesiąca na stronie Konto: wydarzenia, na które użytkownik się zapisał,
// te, które sam organizuje, oraz jego spotkania we dwoje.
export default function ActivityCalendar({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selected, setSelected] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('rsvps').select('events(id, title, starts_at, place_name, organizer_id)').eq('user_id', userId),
      supabase.from('events').select('id, title, starts_at, place_name').eq('organizer_id', userId),
      supabase
        .from('meetups')
        .select('id, title, starts_at, place_name')
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`),
    ]).then(([rsvps, organized, meetups]) => {
      if (cancelled) return
      const list: Activity[] = []
      for (const row of (organized.data ?? []) as any[]) {
        list.push({
          key: `organized:${row.id}`,
          kind: 'organized',
          title: row.title,
          startsAt: new Date(row.starts_at),
          place: row.place_name,
          to: `/mapa/?event=${row.id}`,
        })
      }
      for (const row of (rsvps.data ?? []) as any[]) {
        const event = row.events
        // własne wydarzenie jest już na liście jako „Organizujesz"
        if (!event || event.organizer_id === userId) continue
        list.push({
          key: `joined:${event.id}`,
          kind: 'joined',
          title: event.title,
          startsAt: new Date(event.starts_at),
          place: event.place_name,
          to: `/mapa/?event=${event.id}`,
        })
      }
      for (const row of (meetups.data ?? []) as any[]) {
        list.push({
          key: `meetup:${row.id}`,
          kind: 'meetup',
          title: row.title,
          startsAt: new Date(row.starts_at),
          place: row.place_name,
          to: '/?widok=1na1',
        })
      }
      setActivities(list.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()))
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  // Dni siatki: od poniedziałku przed pierwszym dniem miesiąca; null = puste pole.
  const days = useMemo(() => {
    const leading = (month.getDay() + 6) % 7
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ]
  }, [month])

  const inMonth = useMemo(
    () =>
      (activities ?? []).filter(
        (item) => item.startsAt.getFullYear() === month.getFullYear() && item.startsAt.getMonth() === month.getMonth(),
      ),
    [activities, month],
  )
  const listed = selected ? inMonth.filter((item) => sameDay(item.startsAt, selected)) : inMonth
  const today = new Date()

  const shiftMonth = (delta: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
    setSelected(null)
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={() => shiftMonth(-1)} aria-label="Poprzedni miesiąc">
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', textTransform: 'capitalize' }} aria-live="polite">
          {monthTitle.format(month)}
        </Typography>
        <IconButton onClick={() => shiftMonth(1)} aria-label="Następny miesiąc">
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {WEEKDAYS.map((name) => (
          <Typography
            key={name}
            variant="caption"
            sx={{ textAlign: 'center', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}
          >
            {name}
          </Typography>
        ))}

        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />
          const items = inMonth.filter((item) => sameDay(item.startsAt, day))
          const isToday = sameDay(day, today)
          const isSelected = selected !== null && sameDay(day, selected)
          const kinds = [...new Set(items.map((item) => item.kind))]

          return (
            <ButtonBase
              key={day.getDate()}
              onClick={() => setSelected(isSelected ? null : day)}
              aria-pressed={isSelected}
              aria-label={`${dayTitle.format(day)}${items.length ? `, aktywności: ${items.length}` : ''}`}
              sx={{
                flexDirection: 'column',
                gap: '3px',
                aspectRatio: '1',
                minHeight: 40,
                borderRadius: '14px',
                fontWeight: items.length ? 800 : 600,
                fontSize: '0.95rem',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                // dzień z aktywnością ma limonkowe tło; zaznaczony — fioletowe
                backgroundColor: isSelected ? '#4b3bf0' : items.length ? '#e4ff80' : 'transparent',
                border: '2px solid',
                borderColor: isToday ? 'primary.main' : 'transparent',
                transition: 'transform .15s ease, background-color .2s ease',
                '&:hover': { transform: 'scale(1.06)', backgroundColor: isSelected ? '#4b3bf0' : items.length ? '#d6fa4d' : '#ecebfd' },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              {day.getDate()}
              <Stack direction="row" spacing="3px" sx={{ height: 6 }} aria-hidden>
                {kinds.map((kind) => (
                  <Box
                    key={kind}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: isSelected ? '#ffffff' : KINDS[kind].color,
                    }}
                  />
                ))}
              </Stack>
            </ButtonBase>
          )
        })}
      </Box>

      <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
        {(Object.keys(KINDS) as Kind[]).map((kind) => (
          <Stack key={kind} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: KINDS[kind].color }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {KINDS[kind].label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>
          {selected ? dayTitle.format(selected) : 'W tym miesiącu'}
        </Typography>
        {activities === null ? (
          <Typography color="text.secondary">Ładowanie…</Typography>
        ) : listed.length === 0 ? (
          <Typography color="text.secondary">
            {selected ? 'Tego dnia nic nie masz w planach.' : 'W tym miesiącu nie masz jeszcze żadnych aktywności.'}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {listed.map((item) => (
              <ButtonBase
                key={item.key}
                component={RouterLink}
                to={item.to}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: '16px',
                  textAlign: 'left',
                  backgroundColor: '#f4f4f5',
                  borderLeft: '5px solid',
                  borderColor: KINDS[item.kind].color,
                  transition: 'transform .15s ease, background-color .2s ease',
                  '&:hover': { transform: 'translateX(4px)', backgroundColor: '#e4e4e7' },
                }}
              >
                <Box sx={{ flexShrink: 0, width: 54, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '1.2rem' }}>
                    {item.startsAt.getDate()}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {timeOnly.format(item.startsAt)}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 800 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {KINDS[item.kind].label}
                    {item.place ? ` · ${item.place}` : ''}
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
