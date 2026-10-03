"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Prosta pinezka jako emoji — omija problem z brakującymi obrazkami ikon Leaflet.
const pinIcon = L.divIcon({
  html: '<div style="font-size:28px;line-height:28px">📍</div>',
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Środek Krakowa (Rynek Główny)
const KRAKOW: [number, number] = [50.0617, 19.9373];

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
};

function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300">
      <MapContainer
        center={value ?? KRAKOW}
        zoom={13}
        scrollWheelZoom
        style={{ height: 260, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}
