import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Rectangle, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import type { City } from '../../data/cities'
import { getGroups } from '../../data/targetGroups'
import type { EventItem } from '../../lib/types'
import { BRAND } from '../../theme'
import { getClusterIcon, getEventIcon } from './eventIcon'

// Od tego przybliżenia pinezki nie łączą się już w grupy.
const UNCLUSTER_ZOOM = 16

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
    // Start: miasto wypełnia cały ekran (na telefonie widać jego środkową część);
    // oddalić można najwyżej do widoku całego prostokąta miasta.
    map.setView(city.center, map.getBoundsZoom(bounds, true), { animate: false })
    map.setMinZoom(map.getBoundsZoom(bounds))
  }, [map, city])

  return null
}

// Przybliża mapę do wybranego wydarzenia (kliknięta pinezka albo karta ze strony głównej),
// na tyle blisko, żeby pinezka wyszła z grupy.
// Pinezka ląduje w górnej części mapy, bo dół zasłania karta wydarzenia.
function FocusSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    const zoom = Math.max(map.getZoom(), UNCLUSTER_ZOOM)
    const target = map.project([lat, lng], zoom).add([0, map.getSize().y * 0.2])
    map.setView(map.unproject(target, zoom), zoom)
  }, [map, lat, lng])

  return null
}

// Kliknięcie w pustą mapę zamyka kartę wydarzenia.
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
      maxZoom={18}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
      />
      <CityBounds city={city} />
      {selected && <FocusSelected lat={selected.lat} lng={selected.lng} />}
      <MapClick onClick={() => onSelectEvent(null)} />
      <Rectangle
        key={city.slug}
        bounds={city.bounds}
        interactive={false}
        pathOptions={{ color: BRAND.violet, weight: 3, dashArray: '8 8', fill: false }}
      />
      {/* Pobliskie pinezki łączą się w grupę z liczbą; kliknięcie albo przybliżenie ją rozwija. */}
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        maxClusterRadius={56}
        disableClusteringAtZoom={UNCLUSTER_ZOOM}
        iconCreateFunction={(cluster: { getChildCount(): number }) =>
          getClusterIcon(cluster.getChildCount())
        }
      >
        {events.map((event) => {
          // Środek pinezki ma kolor pierwszej grupy pasującej do filtra.
          const groups = getGroups(event.target_groups)
          const group = groups.find((g) => selectedGroups.includes(g.slug)) ?? groups[0]
          return (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={getEventIcon(group, event.id === selectedEventId)}
              title={event.title}
              eventHandlers={{ click: () => onSelectEvent(event.id) }}
            />
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
