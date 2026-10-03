import L from 'leaflet'
import type { TargetGroup } from '../../data/targetGroups'
import { BRAND } from '../../theme'

const iconCache = new Map<string, L.DivIcon>()

// Limonkowa pinezka z makiety; środek w kolorze grupy docelowej, wybrana — czarna.
export function getEventIcon(group: TargetGroup | undefined, selected: boolean) {
  const key = `${group?.slug}:${selected}`
  const cached = iconCache.get(key)
  if (cached) return cached

  const icon = L.divIcon({
    className: 'event-marker',
    html: `
      <svg width="38" height="48" viewBox="0 0 38 48" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55))">
        <path d="M19 2C9.6 2 2 9.6 2 19c0 12.500 17 27 17 27s17-14.500 17-27C36 9.600 28.400 2 19 2z" fill="${selected ? BRAND.ink : BRAND.lime}" stroke="${selected ? BRAND.lime : BRAND.ink}" stroke-width="2"/>
        <circle cx="19" cy="19" r="7.500" fill="${group?.color ?? '#ffffff'}" stroke="${selected ? '#ffffff' : BRAND.ink}" stroke-width="2"/>
      </svg>`,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
  })

  iconCache.set(key, icon)
  return icon
}

// Grupa pobliskich pinezek: limonkowe kółko z liczbą wydarzeń.
export function getClusterIcon(count: number) {
  const size = count < 10 ? 44 : 52
  return L.divIcon({
    className: 'event-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${BRAND.lime};border:3px solid ${BRAND.ink};box-shadow:0 2px 6px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font:800 17px system-ui,sans-serif;color:${BRAND.ink}">${count}</div>`,
    iconSize: [size, size],
  })
}

// Wyjście 1:1: fioletowa pinezka z symbolem rodzaju (spacer, kawa…), żeby odróżniała się od wydarzeń.
export function getMeetupIcon(emoji: string) {
  const key = `meetup:${emoji}`
  const cached = iconCache.get(key)
  if (cached) return cached

  const icon = L.divIcon({
    className: 'event-marker',
    html: `
      <svg width="38" height="48" viewBox="0 0 38 48" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55))">
        <path d="M19 2C9.6 2 2 9.6 2 19c0 12.500 17 27 17 27s17-14.500 17-27C36 9.600 28.400 2 19 2z" fill="${BRAND.violet}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="19" cy="19" r="11" fill="#ffffff"/>
        <text x="19" y="24.500" text-anchor="middle" font-size="14">${emoji}</text>
      </svg>`,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
  })

  iconCache.set(key, icon)
  return icon
}
