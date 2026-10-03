import { useCallback, useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatShortDate } from '../lib/eventDisplay'
import { supabase } from '../lib/supabase'

interface Pending {
  scope: 'event' | 'meetup'
  scopeId: string
  title: string
  startsAt: string
  rateeId: string
  rateeName: string
}

interface Props {
  userId: string
  // po wystawieniu oceny (np. żeby odświeżyć dane na stronie Konto)
  onRated?: () => void
}

// „Do oceny": zakończone wydarzenia, na które użytkownik był zapisany, i odbyte spotkania we dwoje.
// Wydarzenie = ocena organizatora; spotkanie we dwoje = ocena drugiej osoby.
export default function PendingRatings({ userId, onRated }: Props) {
  const [items, setItems] = useState<Pending[] | null>(null)
  const [stars, setStars] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const now = new Date().toISOString()
    const [rsvps, meetups, rated] = await Promise.all([
      supabase
        .from('rsvps')
        .select('events(id, title, starts_at, organizer_id, source, organizer:profiles(name))')
        .eq('user_id', userId),
      supabase
        .from('meetups')
        .select(
          'id, title, starts_at, host_id, guest_id, host:profiles!meetups_host_id_fkey(name), guest:profiles!meetups_guest_id_fkey(name)',
        )
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
        .not('guest_id', 'is', null)
        .lt('starts_at', now),
      supabase.from('ratings').select('scope, scope_id').eq('rater_id', userId),
    ])

    const done = new Set((rated.data ?? []).map((row) => `${row.scope}:${row.scope_id}`))
    const pending: Pending[] = []

    for (const row of (rsvps.data ?? []) as any[]) {
      const event = row.events
      // bez własnych wydarzeń, wydarzeń z bota i tych, które jeszcze się nie odbyły
      if (!event || event.organizer_id === userId || event.source || event.starts_at >= now) continue
      pending.push({
        scope: 'event',
        scopeId: event.id,
        title: event.title,
        startsAt: event.starts_at,
        rateeId: event.organizer_id,
        rateeName: event.organizer?.name ?? 'Organizator',
      })
    }
    for (const meetup of (meetups.data ?? []) as any[]) {
      const iAmHost = meetup.host_id === userId
      pending.push({
        scope: 'meetup',
        scopeId: meetup.id,
        title: `We dwoje · ${meetup.title}`,
        startsAt: meetup.starts_at,
        rateeId: iAmHost ? meetup.guest_id : meetup.host_id,
        rateeName: (iAmHost ? meetup.guest?.name : meetup.host?.name) ?? 'Sąsiad',
      })
    }

    setItems(
      pending
        .filter((item) => !done.has(`${item.scope}:${item.scopeId}`))
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    )
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function submit(item: Pending) {
    setError('')
    const { error } = await supabase.from('ratings').insert({
      rater_id: userId,
      ratee_id: item.rateeId,
      scope: item.scope,
      scope_id: item.scopeId,
      stars: stars[item.scopeId],
    })
    if (error) return setError('Nie udało się zapisać oceny.')
    await load()
    onRated?.()
  }

  if (items === null) return <Typography color="text.secondary">Ładowanie…</Typography>
  if (items.length === 0) {
    return (
      <Typography color="text.secondary">
        Nic nie czeka na ocenę. Ocenić można po terminie wydarzenia, na które byłeś(-aś) zapisany(-a).
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {items.map((item) => (
        <Paper key={`${item.scope}:${item.scopeId}`} variant="outlined" sx={{ p: 2, borderRadius: '20px' }}>
          <Typography variant="h3">{item.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatShortDate(item.startsAt)} · {item.scope === 'event' ? 'organizator' : 'osoba'}:{' '}
            <strong>{item.rateeName}</strong>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
            <Rating
              size="large"
              precision={0.5}
              value={stars[item.scopeId] ?? null}
              onChange={(_, value) => setStars((prev) => ({ ...prev, [item.scopeId]: value ?? 0 }))}
              getLabelText={(value) => `${value} na 5 gwiazdek`}
            />
            <Button variant="contained" disabled={!stars[item.scopeId]} onClick={() => submit(item)}>
              Oceń
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
