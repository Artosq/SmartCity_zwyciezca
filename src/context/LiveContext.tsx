import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useProfile } from '../hooks/useProfile'
import { distanceKm } from '../lib/eventDisplay'
import { supabase } from '../lib/supabase'
import type { LiveJoin, LivePresence } from '../lib/types'

// Jak długo jedno „Pokaż się" jest widoczne, jeśli ktoś zapomni się ukryć.
export const LIVE_MINUTES = 60
export const LIVE_NOTE_MAX = 80

// Położenie wysyłamy po przejściu tylu metrów albo po tylu sekundach — nie przy każdym odczycie GPS.
const MIN_MOVE_METERS = 10
const MAX_SILENCE_MS = 15000
// Zapasowe odświeżanie, gdyby powiadomienia na żywo nie działały.
const POLL_MS = 12000

interface LiveContextValue {
  // funkcja dostępna tylko dla zalogowanych dorosłych
  available: boolean
  userId: string | undefined
  // osoby widoczne teraz na mapie (także ja, jeśli się pokazuję)
  people: LivePresence[]
  // moje własne „Pokaż się" (null = jestem ukryty)
  mine: LivePresence | null
  // kto idzie do mnie — z położeniem widocznym tylko dla mnie
  incoming: LiveJoin[]
  // do kogo ja idę (identyfikator osoby) albo null
  joinedTargetId: string | null
  error: string
  clearError: () => void
  show: (note: string) => void
  hide: () => Promise<void>
  join: (targetId: string) => Promise<void>
  leave: () => Promise<void>
  dismiss: (joinerId: string) => Promise<void>
}

const LiveContext = createContext<LiveContextValue | null>(null)

// „Pokaż się" działa w całej aplikacji: położenie jest wysyłane, dopóki aplikacja jest otwarta,
// aż do kliknięcia „Ukryj się" albo upływu LIVE_MINUTES.
export function LiveProvider({ children }: { children: ReactNode }) {
  const { user, isAdult } = useProfile()
  const userId = user?.id
  const available = Boolean(userId && isAdult)

  const [people, setPeople] = useState<LivePresence[]>([])
  const [joins, setJoins] = useState<LiveJoin[]>([])
  const [error, setError] = useState('')

  // stan potrzebny w wywołaniach zwrotnych GPS — w refach, żeby nie zakładać obserwatora od nowa
  const watchId = useRef<number | null>(null)
  const sharing = useRef<{ note: string; expiresAt: string } | null>(null)
  const joinedTarget = useRef<string | null>(null)
  const lastSent = useRef<{ lat: number; lng: number; at: number } | null>(null)
  // czy użytkownik już sam coś włączył/wyłączył albo wznowiliśmy stan po odświeżeniu strony
  const settled = useRef(false)

  const reload = useCallback(async () => {
    if (!available || !userId) {
      setPeople([])
      setJoins([])
      return
    }
    const [presence, joinRows] = await Promise.all([
      supabase
        .from('live_presence')
        .select('*, profile:profiles(name, rating_avg, rating_count)')
        .gt('expires_at', new Date().toISOString()),
      supabase
        .from('live_joins')
        .select('*, joiner:profiles!live_joins_joiner_id_fkey(name)')
        .or(`target_id.eq.${userId},joiner_id.eq.${userId}`),
    ])
    setPeople((presence.data as unknown as LivePresence[] | null) ?? [])
    setJoins((joinRows.data as unknown as LiveJoin[] | null) ?? [])
  }, [available, userId])

  const stopWatchIfIdle = useCallback(() => {
    if (sharing.current || joinedTarget.current) return
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
    lastSent.current = null
  }, [])

  const hide = useCallback(async () => {
    settled.current = true
    sharing.current = null
    stopWatchIfIdle()
    if (userId) await supabase.from('live_presence').delete().eq('user_id', userId)
    await reload()
  }, [userId, reload, stopWatchIfIdle])

  const leave = useCallback(async () => {
    settled.current = true
    const target = joinedTarget.current
    joinedTarget.current = null
    stopWatchIfIdle()
    if (userId && target) {
      await supabase.from('live_joins').delete().eq('target_id', target).eq('joiner_id', userId)
    }
    await reload()
  }, [userId, reload, stopWatchIfIdle])

  // Jeden obserwator GPS obsługuje oba przypadki: „pokazuję się" i „idę do kogoś".
  const ensureWatch = useCallback(() => {
    if (watchId.current !== null || !userId) return
    if (!('geolocation' in navigator)) {
      setError('To urządzenie nie udostępnia lokalizacji.')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const now = Date.now()
        const last = lastSent.current
        const movedMeters = last
          ? distanceKm([last.lat, last.lng], [coords.latitude, coords.longitude]) * 1000
          : Infinity
        if (last && movedMeters < MIN_MOVE_METERS && now - last.at < MAX_SILENCE_MS) return
        lastSent.current = { lat: coords.latitude, lng: coords.longitude, at: now }
        const stamp = new Date(now).toISOString()

        if (sharing.current) {
          // po upływie czasu udostępnianie kończy się samo
          if (new Date(sharing.current.expiresAt).getTime() < now) {
            await hide()
          } else {
            const { error } = await supabase.from('live_presence').upsert({
              user_id: userId,
              note: sharing.current.note,
              lat: coords.latitude,
              lng: coords.longitude,
              updated_at: stamp,
              expires_at: sharing.current.expiresAt,
            })
            if (error) {
              setError('Nie udało się udostępnić położenia. Jeśli to świeża baza, uruchom migrację 008.')
              await hide()
            }
          }
        }
        if (joinedTarget.current) {
          await supabase
            .from('live_joins')
            .update({ lat: coords.latitude, lng: coords.longitude, updated_at: stamp })
            .eq('target_id', joinedTarget.current)
            .eq('joiner_id', userId)
        }
        reload()
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Brak zgody na lokalizację. Włącz ją w ustawieniach przeglądarki.'
            : 'Nie udało się ustalić położenia. Spróbuj ponownie na zewnątrz.',
        )
        hide()
        leave()
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
  }, [userId, reload, hide, leave])

  const show = useCallback(
    (note: string) => {
      settled.current = true
      setError('')
      sharing.current = { note, expiresAt: new Date(Date.now() + LIVE_MINUTES * 60000).toISOString() }
      lastSent.current = null // pierwszy odczyt wysyłamy od razu
      ensureWatch()
    },
    [ensureWatch],
  )

  const join = useCallback(
    async (targetId: string) => {
      if (!userId) return
      settled.current = true
      setError('')
      // idzie się do jednej osoby naraz
      if (joinedTarget.current && joinedTarget.current !== targetId) await leave()
      const { error } = await supabase.from('live_joins').upsert({ target_id: targetId, joiner_id: userId })
      if (error) {
        setError('Nie udało się dołączyć. Możliwe, że ta osoba już się ukryła.')
        return
      }
      joinedTarget.current = targetId
      lastSent.current = null
      ensureWatch()
      await reload()
    },
    [userId, ensureWatch, leave, reload],
  )

  const dismiss = useCallback(
    async (joinerId: string) => {
      if (!userId) return
      await supabase.from('live_joins').delete().eq('target_id', userId).eq('joiner_id', joinerId)
      await reload()
    },
    [userId, reload],
  )

  // dane innych osób: na żywo + zapasowo co kilkanaście sekund
  useEffect(() => {
    if (!available) {
      setPeople([])
      setJoins([])
      return
    }
    reload()
    const timer = setInterval(reload, POLL_MS)
    const channel = supabase
      .channel('live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_presence' }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_joins' }, reload)
      .subscribe()
    return () => {
      clearInterval(timer)
      supabase.removeChannel(channel)
    }
  }, [available, reload])

  const myJoin = joins.find((row) => row.joiner_id === userId) ?? null

  // osoba, do której szedłem, ukryła się (wiersz zniknął razem z nią) — przestaję wysyłać położenie
  useEffect(() => {
    if (joinedTarget.current && !myJoin) {
      joinedTarget.current = null
      stopWatchIfIdle()
    }
  }, [myJoin, stopWatchIfIdle])

  const mine = people.find((person) => person.user_id === userId) ?? null

  // Po odświeżeniu strony wpis w bazie nadal istnieje — wznawiamy wysyłanie położenia,
  // żeby pinezka nie stała w starym miejscu. Pasek „Jesteś widoczny" pozwala się ukryć.
  useEffect(() => {
    if (settled.current || (!mine && !myJoin)) return
    settled.current = true
    if (mine) sharing.current = { note: mine.note, expiresAt: mine.expires_at }
    if (myJoin) joinedTarget.current = myJoin.target_id
    ensureWatch()
  }, [mine, myJoin, ensureWatch])

  // Zamknięcie aplikacji kończy wysyłanie położenia; wpis wygasa sam po LIVE_MINUTES.
  useEffect(() => {
    const cleanup = () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    }
    return cleanup
  }, [])

  const value: LiveContextValue = {
    available,
    userId,
    people,
    mine,
    incoming: joins.filter((row) => row.target_id === userId),
    joinedTargetId: myJoin?.target_id ?? null,
    error,
    clearError: () => setError(''),
    show,
    hide,
    join,
    leave,
    dismiss,
  }

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
}

export function useLive() {
  const value = useContext(LiveContext)
  if (!value) throw new Error('useLive musi być użyte wewnątrz LiveProvider')
  return value
}
