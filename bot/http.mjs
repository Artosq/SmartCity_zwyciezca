// Wspólne pobieranie stron: przedstawiamy się jako bot i nie zasypujemy serwisów zapytaniami.
const USER_AGENT = 'SasiedzkoBot/0.1 (HackYeah 2026; mapa wydarzen sasiedzkich)'
const DELAY_MS = 1000

let lastRequest = 0

export async function fetchText(url) {
  const wait = lastRequest + DELAY_MS - Date.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastRequest = Date.now()

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pl' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${url}`)
  return response.text()
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  oacute: 'ó',
  Oacute: 'Ó',
  hellip: '…',
  bdquo: '„',
  rdquo: '”',
  ldquo: '“',
}

// Tekst z fragmentu HTML: bez znaczników, z rozwiniętymi encjami.
export function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => ENTITIES[name] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
}

// Czas polski (Europe/Warsaw) → ISO w UTC, z uwzględnieniem czasu letniego.
export function warsawToIso(year, month, day, hour = 12, minute = 0) {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute)
  const offsetName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(asUtc)
    .find((part) => part.type === 'timeZoneName').value
  const offsetHours = Number(offsetName.replace('GMT', '') || 0)
  return new Date(asUtc - offsetHours * 3600000).toISOString()
}
