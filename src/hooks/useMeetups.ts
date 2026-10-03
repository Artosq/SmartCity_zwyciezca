import { useCallback, useEffect, useState } from 'react'
import type { City } from '../data/cities'
import { supabase } from '../lib/supabase'
import type { MeetupWithHost } from '../lib/types'
import type { EventsStatus } from './useCityEvents'

// Nadchodzące wyjścia 1:1 w mieście, z imieniem osoby proponującej.
export function useMeetups(city: City) {
  const [meetups, setMeetups] = useState<MeetupWithHost[]>([])
  const [status, setStatus] = useState<EventsStatus>('loading')

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('meetups')
      // dwie relacje do profiles (host i gość) — wskazujemy, o którą chodzi
      .select('*, host:profiles!meetups_host_id_fkey(name)')
      .eq('city', city.slug)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
    if (error) {
      setMeetups([])
      setStatus('error')
      return
    }
    setMeetups(data as unknown as MeetupWithHost[])
    setStatus('ready')
  }, [city.slug])

  useEffect(() => {
    setStatus('loading')
    reload()
  }, [reload])

  return { meetups, status, reload }
}
