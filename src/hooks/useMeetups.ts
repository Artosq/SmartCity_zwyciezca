import { useCallback, useEffect, useState } from 'react'
import type { City } from '../data/cities'
import { supabase } from '../lib/supabase'
import type { MeetupWithHost } from '../lib/types'
import type { EventsStatus } from './useCityEvents'

// Nadchodzące spotkania we dwoje w mieście, z imieniem i oceną osoby proponującej.
// Baza zwraca je tylko zalogowanym dorosłym — pozostali dostają pustą listę.
export function useMeetups(city: City) {
  const [meetups, setMeetups] = useState<MeetupWithHost[]>([])
  const [status, setStatus] = useState<EventsStatus>('loading')

  const reload = useCallback(async () => {
    // dwie relacje do profiles (host i gość) — wskazujemy, o którą chodzi
    const query = (host: string) =>
      supabase
        .from('meetups')
        .select(`*, host:profiles!meetups_host_id_fkey(${host})`)
        .eq('city', city.slug)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')

    let { data, error } = await query('name, avatar, rating_avg, rating_count')
    // zapas dla bazy bez migracji 006 (brak kolumn z oceną)
    if (error) ({ data, error } = await query('name'))
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
