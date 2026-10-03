import { useEffect, useState } from 'react'
import type { City } from '../data/cities'
import { supabase } from '../lib/supabase'
import type { Category, EventItem, EventWithStats, Organizer } from '../lib/types'

export type EventsStatus = 'loading' | 'ready' | 'error'

type EventRow = EventItem & {
  categories: Pick<Category, 'slug' | 'name'> | null
  organizer?: Organizer | null
  rsvps: { count: number }[]
}

const SELECT_WITH_RATING =
  '*, categories(slug, name), organizer:profiles(name, rating_avg, rating_count), rsvps(count)'
// zapas dla bazy bez migracji 006 (brak kolumn z oceną) — aplikacja działa, tylko bez ocen
const SELECT_BASIC = '*, categories(slug, name), organizer:profiles(name), rsvps(count)'

// Nadchodzące wydarzenia miasta (współrzędne w jego prostokącie),
// z kategorią i liczbą zapisanych. Wspólne dla strony głównej i mapy.
export function useCityEvents(city: City) {
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [status, setStatus] = useState<EventsStatus>('loading')

  useEffect(() => {
    let cancelled = false
    const [[south, west], [north, east]] = city.bounds
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const query = (select: string) =>
      supabase
        .from('events')
        .select(select)
        .gte('lat', south)
        .lte('lat', north)
        .gte('lng', west)
        .lte('lng', east)
        .gte('starts_at', today.toISOString())
        .order('starts_at')

    setStatus('loading')
    query(SELECT_WITH_RATING)
      .then((result) => (result.error ? query(SELECT_BASIC) : result))
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setEvents([])
          setStatus('error')
          return
        }
        setEvents(
          (data as unknown as EventRow[]).map(({ categories, organizer, rsvps, ...event }) => ({
            ...event,
            category: categories,
            organizer: organizer ?? null,
            attendees: rsvps[0]?.count ?? 0,
          })),
        )
        setStatus('ready')
      })

    return () => {
      cancelled = true
    }
  }, [city])

  return { events, status }
}
