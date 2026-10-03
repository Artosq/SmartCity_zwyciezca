import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getGroup } from '../../data/targetGroups'
import { getEventIcon } from './eventIcon'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

// Ogranicza mapę do wybranego miasta: przesuwanie, minimalne oddalenie i widok startowy.
function CityBounds({ city }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds(city.bounds)
    map.setMinZoom(0)
    map.setMaxBounds(bounds.pad(0.25))
    map.fitBounds(bounds, { animate: false })
    map.setMinZoom(map.getBoundsZoom(bounds))
  }, [map, city])

  return null
}

function EventMarker({ event, selectedGroups }) {
  // Wybrane w filtrze grupy idą pierwsze, żeby pinezka miała kolor pasujący do filtra.
  const groups = event.target_groups
    .map(getGroup)
    .sort((a, b) => selectedGroups.includes(b.slug) - selectedGroups.includes(a.slug))

  return (
    <Marker position={[event.lat, event.lng]} icon={getEventIcon(groups)} title={event.title}>
      <Popup minWidth={220} maxWidth={280}>
        <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
        <p className="my-1! text-gray-700">{dateFormatter.format(new Date(event.starts_at))}</p>
        <p className="my-1! text-gray-700">{event.place_name}</p>
        <ul className="my-2 flex flex-wrap gap-1.5">
          {event.target_groups.map(getGroup).map((group) => (
            <li
              key={group.slug}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-2 py-0.5 text-sm text-gray-900"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: group.color }}
                aria-hidden="true"
              />
              {group.name}
            </li>
          ))}
        </ul>
        {/* Placeholder — trasa szczegółów wydarzenia powstanie później. */}
        <button
          type="button"
          disabled
          title="Wkrótce"
          className="mt-1 min-h-11 w-full rounded-lg bg-teal-700 px-4 text-base font-semibold text-white disabled:opacity-60"
        >
          Szczegóły
        </button>
      </Popup>
    </Marker>
  )
}

export default function EventMap({ city, events, selectedGroups }) {
  return (
    <MapContainer bounds={city.bounds} maxBoundsViscosity={1} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CityBounds city={city} />
      <Rectangle
        key={city.slug}
        bounds={city.bounds}
        interactive={false}
        pathOptions={{ color: '#0f766e', weight: 3, dashArray: '8 8', fill: false }}
      />
      {events.map((event) => (
        <EventMarker key={event.id} event={event} selectedGroups={selectedGroups} />
      ))}
    </MapContainer>
  )
}
