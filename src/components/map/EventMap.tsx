import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Rectangle, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { City } from '../../data/cities'
import { getGroups } from '../../data/targetGroups'
import type { EventItem } from '../../lib/types'
import { getEventIcon } from './eventIcon'

interface Props {
  city: City
  events: EventItem[]
  selectedGroups: string[]
  selectedEventId: string | null
  onSelectEvent: (id: string | null) => void
}

// Ogranicza mapę do wybranego miasta: przesuwanie, minimalne oddalenie i widok startowy.
function CityBounds({ city }: { city: City }) {
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

// Przybliża mapę do wybranego wydarzenia (kliknięta pinezka albo karta ze strony głównej).
// Pinezka ląduje w górnej części mapy, bo dół zasłania pasek wydarzenia.
function FocusSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    const zoom = Math.max(map.getZoom(), 14)
    const target = map.project([lat, lng], zoom).add([0, map.getSize().y * 0.25])
    map.setView(map.unproject(target, zoom), zoom)
  }, [map, lat, lng])

  return null
}

// Kliknięcie w pustą mapę zamyka pasek wydarzenia.
function MapClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

export default function EventMap({
  city,
  events,
  selectedGroups,
  selectedEventId,
  onSelectEvent,
}: Props) {
  const selected = events.find((event) => event.id === selectedEventId)

  return (
    <MapContainer
      bounds={city.bounds}
      maxBoundsViscosity={1}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CityBounds city={city} />
      {selected && <FocusSelected lat={selected.lat} lng={selected.lng} />}
      <MapClick onClick={() => onSelectEvent(null)} />
      <Rectangle
        key={city.slug}
        bounds={city.bounds}
        interactive={false}
        pathOptions={{ color: '#4b3bf0', weight: 3, dashArray: '8 8', fill: false }}
      />
      {events.map((event) => {
        // Wybrane w filtrze grupy idą pierwsze, żeby pinezka miała kolor pasujący do filtra.
        const groups = getGroups(event.target_groups).sort(
          (a, b) =>
            Number(selectedGroups.includes(b.slug)) - Number(selectedGroups.includes(a.slug)),
        )
        return (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={getEventIcon(groups, event.id === selectedEventId)}
            title={event.title}
            eventHandlers={{ click: () => onSelectEvent(event.id) }}
          />
        )
      })}
    </MapContainer>
  )
}
