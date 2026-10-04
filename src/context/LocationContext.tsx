import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { LatLngTuple } from 'leaflet'

// 'granted' — mamy zgodę; 'prompt' — można zapytać; 'denied' — użytkownik odmówił;
// 'unsupported' — urządzenie nie udostępnia lokalizacji.
type LocationStatus = 'granted' | 'prompt' | 'denied' | 'unsupported'

interface LocationContextValue {
  // położenie użytkownika albo null, gdy go nie znamy
  position: LatLngTuple | null
  status: LocationStatus
  // pyta przeglądarkę o zgodę (tylko po kliknięciu użytkownika) i pobiera położenie
  request: () => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

// Położenie użytkownika do liczenia odległości na kartach.
// Bez pytania pobieramy je tylko wtedy, gdy zgoda na lokalizację została już wcześniej udzielona
// (np. przy „Pokaż się"). W przeciwnym razie odległości liczą się od centrum miasta.
export function LocationProvider({ children }: { children: ReactNode }) {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [position, setPosition] = useState<LatLngTuple | null>(null)
  const [status, setStatus] = useState<LocationStatus>(supported ? 'prompt' : 'unsupported')

  const locate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition([coords.latitude, coords.longitude])
        setStatus('granted')
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setStatus('denied')
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 },
    )
  }, [])

  useEffect(() => {
    if (!supported || !navigator.permissions) return
    let permission: PermissionStatus | undefined
    const sync = () => {
      if (!permission) return
      if (permission.state === 'granted') locate()
      else {
        setStatus(permission.state)
        setPosition(null)
      }
    }
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        permission = result
        sync()
        // zgoda udzielona albo cofnięta w innym miejscu aplikacji (np. „Pokaż się")
        result.addEventListener('change', sync)
      })
      .catch(() => {
        // starsze przeglądarki bez Permissions API — zostaje przycisk „Użyj mojej lokalizacji"
      })
    return () => permission?.removeEventListener('change', sync)
  }, [supported, locate])

  const request = useCallback(() => {
    if (supported) locate()
  }, [supported, locate])

  return (
    <LocationContext.Provider value={{ position, status, request }}>{children}</LocationContext.Provider>
  )
}

export function useUserLocation() {
  const value = useContext(LocationContext)
  if (!value) throw new Error('useUserLocation musi być użyte wewnątrz LocationProvider')
  return value
}
