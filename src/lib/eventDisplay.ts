import type { LatLngTuple } from 'leaflet'
import type { EventWithStats } from './types'

const CATEGORY_IMAGES = [
  'sasiedzkie',
  'dzieci',
  'seniorzy',
  'kultura',
  'sport',
  'edukacja',
  'impreza',
  'inne',
]

// Zdjęcie wydarzenia; gdy organizator go nie podał — ilustracja kategorii.
export function getEventImage(event: EventWithStats) {
  if (event.image_url) return event.image_url
  const slug = event.category?.slug
  return `/img/events/${slug && CATEGORY_IMAGES.includes(slug) ? slug : 'inne'}.svg`
}

const shortDate = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const longDate = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))
export const formatLongDate = (iso: string) => longDate.format(new Date(iso))

// Odległość w linii prostej (wzór haversine), w kilometrach.
export function distanceKm([lat1, lng1]: LatLngTuple, [lat2, lng2]: LatLngTuple) {
  const rad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

const timeOnly = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' })
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

// „Dziś, 18:00", „Jutro, 10:30", a dalej krótka data.
export function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86400000)
  if (dayKey(date) === dayKey(today)) return `Dziś, ${timeOnly.format(date)}`
  if (dayKey(date) === dayKey(tomorrow)) return `Jutro, ${timeOnly.format(date)}`
  return formatShortDate(iso)
}
