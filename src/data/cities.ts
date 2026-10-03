import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet'

export interface City {
  slug: string
  name: string
  center: LatLngTuple
  // [[południe, zachód], [północ, wschód]] — przybliżony prostokąt obejmujący miasto.
  bounds: LatLngBoundsLiteral
}

// Miasta dostępne w liście rozwijanej. Wydarzenie należy do miasta,
// jeśli jego współrzędne mieszczą się w `bounds`.
export const CITIES: City[] = [
  {
    slug: 'krakow',
    name: 'Kraków',
    center: [50.0614, 19.9366],
    bounds: [[49.967, 19.792], [50.126, 20.217]],
  },
  {
    slug: 'warszawa',
    name: 'Warszawa',
    center: [52.2297, 21.0122],
    bounds: [[52.098, 20.851], [52.368, 21.271]],
  },
  {
    slug: 'wroclaw',
    name: 'Wrocław',
    center: [51.1079, 17.0385],
    bounds: [[51.042, 16.807], [51.211, 17.176]],
  },
  {
    slug: 'gdansk',
    name: 'Gdańsk',
    center: [54.352, 18.6466],
    bounds: [[54.275, 18.429], [54.447, 18.951]],
  },
  {
    slug: 'poznan',
    name: 'Poznań',
    center: [52.4064, 16.9252],
    bounds: [[52.292, 16.731], [52.509, 17.072]],
  },
  {
    slug: 'lodz',
    name: 'Łódź',
    center: [51.7592, 19.456],
    bounds: [[51.687, 19.32], [51.86, 19.64]],
  },
  {
    slug: 'katowice',
    name: 'Katowice',
    center: [50.2649, 19.0238],
    bounds: [[50.13, 18.89], [50.297, 19.124]],
  },
]

export const getCity = (slug: string | null) =>
  CITIES.find((city) => city.slug === slug) ?? null
