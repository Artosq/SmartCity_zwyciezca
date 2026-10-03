import { useEffect, useState } from 'react'
import type { City } from '../data/cities'
import { supabase } from '../lib/supabase'
import type { Category, EventItem, EventWithStats } from '../lib/types'

export type EventsStatus = 'loading' | 'ready' | 'error'

type EventRow = EventItem & {
  categories: Pick<Category, 'slug' | 'name'> | null
  rsvps: { count: number }[]
}

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

    setStatus('loading')
    supabase
      .from('events')
      .select('*, categories(slug, name), rsvps(count)')
      .gte('lat', south)
      .lte('lat', north)
      .gte('lng', west)
      .lte('lng', east)
      .gte('starts_at', today.toISOString())
      .order('starts_at')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setEvents([])
          setStatus('error')
          return
        }
        setEvents(
          (data as unknown as EventRow[]).map(({ categories, rsvps, ...event }) => ({
            ...event,
            category: categories,
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
