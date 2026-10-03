import { useMemo, useState } from 'react'
import CityPicker from './components/CityPicker'
import CitySelect from './components/CitySelect'
import TargetGroupFilter from './components/TargetGroupFilter'
import EventMap from './components/map/EventMap'
import { getCity } from './data/cities'
import { DUMMY_EVENTS } from './data/dummyEvents'
import { ALL_GROUP_SLUGS } from './data/targetGroups'

const CITY_STORAGE_KEY = 'sasiedzko.city'

function readStoredCity() {
  try {
    return getCity(localStorage.getItem(CITY_STORAGE_KEY))?.slug ?? ''
  } catch {
    return ''
  }
}

export default function App() {
  const [citySlug, setCitySlug] = useState(readStoredCity)
  const [selectedGroups, setSelectedGroups] = useState(ALL_GROUP_SLUGS)
  const [filterOpen, setFilterOpen] = useState(false)

  const city = getCity(citySlug)

  const selectCity = (slug) => {
    setCitySlug(slug)
    try {
      localStorage.setItem(CITY_STORAGE_KEY, slug)
    } catch {
      // brak dostępu do localStorage — wybór po prostu nie zostanie zapamiętany
    }
  }

  // TODO: zastąpić DUMMY_EVENTS danymi z Supabase.
  const visibleEvents = useMemo(
    () =>
      DUMMY_EVENTS.filter(
        (event) =>
          event.city === citySlug &&
          event.target_groups.some((group) => selectedGroups.includes(group)),
      ),
    [citySlug, selectedGroups],
  )

  if (!city) return <CityPicker onSelect={selectCity} />

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 bg-teal-700 px-3 py-2 text-white">
        <h1 className="mr-auto text-xl font-bold">Sąsiedzko</h1>
        <label htmlFor="header-city" className="sr-only">
          Miasto
        </label>
        <CitySelect id="header-city" value={citySlug} onChange={selectCity} />
        <button
          type="button"
          onClick={() => setFilterOpen((open) => !open)}
          aria-expanded={filterOpen}
          aria-controls="filter-panel"
          className="min-h-12 rounded-lg bg-white px-3 text-base font-semibold text-teal-900 md:hidden"
        >
          Filtry ({selectedGroups.length}/{ALL_GROUP_SLUGS.length})
        </button>
      </header>

      <main className="relative flex min-h-0 flex-1">
        {/* Telefon: panel wysuwany od dołu. Od md: stały panel boczny. */}
        <aside
          id="filter-panel"
          className={`${filterOpen ? 'block' : 'hidden'} absolute inset-x-0 bottom-0 z-1000 max-h-[75%] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.25)] md:static md:block md:max-h-none md:w-72 md:shrink-0 md:rounded-none md:border-r md:border-gray-300 md:shadow-none`}
        >
          <TargetGroupFilter selected={selectedGroups} onChange={setSelectedGroups} />
          <p className="mt-3 text-base text-gray-700" aria-live="polite">
            Wydarzenia na mapie: <strong>{visibleEvents.length}</strong>
          </p>
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            className="mt-3 min-h-12 w-full rounded-lg bg-teal-700 px-4 text-base font-semibold text-white md:hidden"
          >
            Pokaż mapę
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <EventMap city={city} events={visibleEvents} selectedGroups={selectedGroups} />
        </div>
      </main>
    </div>
  )
}
