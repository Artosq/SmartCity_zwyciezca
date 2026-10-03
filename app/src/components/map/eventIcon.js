import L from 'leaflet'

const iconCache = new Map()

// Pinezka w kolorze pierwszej grupy; pozostałe grupy wydarzenia jako kropki pod spodem.
export function getEventIcon(groups) {
  const key = groups.map((group) => group.slug).join('|')
  if (iconCache.has(key)) return iconCache.get(key)

  const [primary, ...rest] = groups
  const dots = rest
    .map(
      (group) =>
        `<span style="width:10px;height:10px;border-radius:50%;background:${group.color};border:1.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`,
    )
    .join('')

  const icon = L.divIcon({
    className: 'event-marker',
    html: `
      <svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">
        <path d="M18 1C8.6 1 1 8.6 1 18c0 12.5 17 27 17 27s17-14.500 17-27C35 8.6 27.4 1 18 1z" fill="${primary.color}" stroke="#fff" stroke-width="2"/>
        <circle cx="18" cy="18" r="6.5" fill="#fff"/>
      </svg>
      <div style="display:flex;justify-content:center;gap:2px;margin-top:1px">${dots}</div>`,
    iconSize: [36, 58],
    iconAnchor: [18, 46],
    popupAnchor: [0, -44],
  })

  iconCache.set(key, icon)
  return icon
}
