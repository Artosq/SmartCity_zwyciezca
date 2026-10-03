// Facebook — wyłącznie przez oficjalne Graph API, dla stron, które dały nam dostęp
// (np. domy kultury, biblioteki). Facebook nie udostępnia wyszukiwania publicznych wydarzeń,
// a automatyczne czytanie jego stron (scraping) łamie regulamin — dlatego go tu nie ma.
//
// Konfiguracja w .env.local:
//   FACEBOOK_PAGE_IDS=123456789,987654321     (identyfikatory stron)
//   FACEBOOK_ACCESS_TOKEN=...                 (token strony z dostępem do wydarzeń)
const GRAPH = 'https://graph.facebook.com'

// Zwraca null, gdy źródło nie jest skonfigurowane.
export async function fetchFacebook({ from, to }) {
  const pageIds = (process.env.FACEBOOK_PAGE_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const token = process.env.FACEBOOK_ACCESS_TOKEN
  if (pageIds.length === 0 || !token) return null

  const events = []
  for (const pageId of pageIds) {
    const url = new URL(`${GRAPH}/${pageId}/events`)
    url.searchParams.set('fields', 'id,name,description,start_time,end_time,place,cover')
    url.searchParams.set('time_filter', 'upcoming')
    url.searchParams.set('access_token', token)

    const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
    const body = await response.json()
    if (!response.ok) {
      throw new Error(`Facebook (${pageId}): ${body.error?.message ?? response.status}`)
    }

    for (const event of body.data ?? []) {
      const location = event.place?.location
      if (!location?.latitude) continue // bez współrzędnych nie umiemy postawić pinezki
      const starts_at = new Date(event.start_time).toISOString()
      if (starts_at < from || starts_at > to) continue

      events.push({
        source: 'facebook',
        external_id: event.id,
        source_url: `https://www.facebook.com/events/${event.id}`,
        title: event.name,
        description: event.description ?? null,
        type: null,
        place_name: [event.place.name, location.street].filter(Boolean).join(', '),
        lat: location.latitude,
        lng: location.longitude,
        starts_at,
        ends_at: event.end_time ? new Date(event.end_time).toISOString() : null,
        image_url: event.cover?.source ?? null,
      })
    }
  }
  return events
}
