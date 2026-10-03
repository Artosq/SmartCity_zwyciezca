import { createContext, useContext, useState, type ReactNode } from 'react'
import { CITIES, getCity, type City } from '../data/cities'

const CITY_STORAGE_KEY = 'sasiedzko.city'

interface CityContextValue {
  city: City | null
  selectCity: (slug: string) => void
}

const CityContext = createContext<CityContextValue | null>(null)

// Jedyne dostępne miasto wybieramy od razu, bez pytania.
const DEFAULT_CITY = CITIES.length === 1 ? CITIES[0] : null

function readStoredCity() {
  try {
    return getCity(localStorage.getItem(CITY_STORAGE_KEY)) ?? DEFAULT_CITY
  } catch {
    return DEFAULT_CITY
  }
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<City | null>(readStoredCity)

  const selectCity = (slug: string) => {
    setCity(getCity(slug))
    try {
      localStorage.setItem(CITY_STORAGE_KEY, slug)
    } catch {
      // brak dostępu do localStorage — wybór po prostu nie zostanie zapamiętany
    }
  }

  return <CityContext.Provider value={{ city, selectCity }}>{children}</CityContext.Provider>
}

export function useCity() {
  const value = useContext(CityContext)
  if (!value) throw new Error('useCity musi być użyte wewnątrz CityProvider')
  return value
}
