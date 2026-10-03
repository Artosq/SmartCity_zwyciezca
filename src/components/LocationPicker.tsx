import { MapContainer, Marker, Rectangle, TileLayer, useMapEvents } from 'react-leaflet'
import Box from '@mui/material/Box'
import type { City } from '../data/cities'
import { getEventIcon } from './map/eventIcon'

export interface Pos {
  lat: number
  lng: number
}

interface Props {
  city: City
  value: Pos | null
  onChange: (pos: Pos) => void
}

function ClickHandler({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Mała mapa do wskazania miejsca wydarzenia — w granicach wybranego miasta.
export default function LocationPicker({ city, value, onChange }: Props) {
  return (
    <Box sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <MapContainer
        key={city.slug}
        bounds={city.bounds}
        maxBounds={city.bounds}
        maxBoundsViscosity={1}
        scrollWheelZoom
        style={{ height: 280, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Rectangle
          bounds={city.bounds}
          interactive={false}
          pathOptions={{ color: '#4b3bf0', weight: 3, dashArray: '8 8', fill: false }}
        />
        <ClickHandler onChange={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={getEventIcon([], true)} />}
      </MapContainer>
    </Box>
  )
}
