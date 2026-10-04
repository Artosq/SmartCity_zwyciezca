import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { supabase } from '../lib/supabase'

interface HiddenItem {
  id: string
  title: string
  hidden_reason: string | null
  kind: string
}

// Informacja dla autora na stronie Konto: które jego wydarzenia lub spotkania
// zostały ukryte przez moderację i dlaczego (regulamin obiecuje podanie powodu).
export default function HiddenContentNotice({ userId }: { userId: string }) {
  const [items, setItems] = useState<HiddenItem[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('events').select('id, title, hidden_reason').eq('organizer_id', userId).eq('is_hidden', true),
      supabase.from('meetups').select('id, title, hidden_reason').eq('host_id', userId).eq('is_hidden', true),
    ]).then(([events, meetups]) => {
      if (cancelled) return
      setItems([
        ...((events.data ?? []) as Omit<HiddenItem, 'kind'>[]).map((row) => ({ ...row, kind: 'Wydarzenie' })),
        ...((meetups.data ?? []) as Omit<HiddenItem, 'kind'>[]).map((row) => ({ ...row, kind: 'Spotkanie we dwoje' })),
      ])
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (items.length === 0) return null

  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <Alert key={item.id} severity="warning">
          <strong>
            {item.kind} „{item.title}" zostało ukryte przez moderację.
          </strong>{' '}
          Powód: {item.hidden_reason ?? 'nie podano'}. Jeśli się nie zgadzasz, napisz do nas przez stronę Pomoc.
        </Alert>
      ))}
    </Stack>
  )
}
