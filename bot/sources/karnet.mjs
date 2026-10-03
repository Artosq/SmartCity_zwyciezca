import { fetchText, htmlToText, warsawToIso } from '../http.mjs'

// Karnet — miejski kalendarz wydarzeń Krakowa (Krakowskie Biuro Festiwalowe).
// Lista jest posortowana po dacie rozpoczęcia; każda pozycja ma współrzędne w atrybutach data-*.
const BASE = 'https://karnet.krakowculture.pl'
const MAX_PAGES = 25

// "03.10.2026, 20:00" albo "01.10.2026 - 04.10.2026" → początek i koniec
function parseDates(text) {
  const [start, end] = text.split(' - ').map((part) => {
    const match = part.match(/(\d{2})\.(\d{2})\.(\d{4})(?:, (\d{2}):(\d{2}))?/)
    if (!match) return null
    const [, day, month, year, hour, minute] = match
    return warsawToIso(
      Number(year),
      Number(month),
      Number(day),
      hour ? Number(hour) : 12,
      minute ? Number(minute) : 0,
    )
  })
  return { start, end: end ?? null }
}

function parseItem(html) {
  const attr = (name) => html.match(new RegExp(`${name}="([^"]*)"`))?.[1]
  const inner = (pattern) => {
    const match = html.match(pattern)
    return match ? htmlToText(match[1]) : null
  }
  const link = html.match(/href="(\/\d+-[^"]+)"/)?.[1]
  const dateText = inner(/class='event-date'>([\s\S]*?)<\/a>/)
  if (!link || !dateText) return null

  const { start, end } = parseDates(dateText)
  if (!start) return null

  return {
    source: 'karnet',
    external_id: attr('data-id'),
    source_url: BASE + link,
    title: htmlToText(attr('data-name') ?? ''),
    description: inner(/class='event-text'>([\s\S]*?)<\/p>/),
    type: inner(/class="event-type">([\s\S]*?)<\/span>/),
    place_name: inner(/class='event-location'>([\s\S]*?)<\/p>/),
    lat: Number(attr('data-latitude')),
    lng: Number(attr('data-longitude')),
    starts_at: start,
    ends_at: end,
    // zdjęcia są podawane po http — na stronie https przeglądarka by je zablokowała
    image_url: html.match(/<img[^>]*src="([^"]+)"/)?.[1]?.replace(/^http:/, 'https:') ?? null,
  }
}

// Zwraca wydarzenia zaczynające się w oknie [from, to].
export async function fetchKarnet({ from, to }) {
  const events = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchText(`${BASE}/wydarzenia?Item_page=${page}`)
    const items = html
      .split("<div class='event-item'")
      .slice(1)
      .map(parseItem)
      .filter(Boolean)
    if (items.length === 0) break

    events.push(...items.filter((item) => item.starts_at >= from && item.starts_at <= to))
    // lista rośnie po dacie startu — dalej są już tylko wydarzenia spoza okna
    if (items.every((item) => item.starts_at > to)) break
  }
  return events
}
