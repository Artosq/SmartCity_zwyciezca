// Wspólne pobieranie stron: przedstawiamy się jako bot i nie zasypujemy serwisów zapytaniami.
const USER_AGENT = 'SasiedzkoBot/0.1 (HackYeah 2026; mapa wydarzen sasiedzkich)'
const DELAY_MS = 1000

const ATTEMPTS = 3

let lastRequest = 0

async function fetchOnce(url) {
  const wait = lastRequest + DELAY_MS - Date.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastRequest = Date.now()

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pl' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

// Chwilowe błędy sieci (zerwane połączenie, timeout) zdarzają się — próbujemy kilka razy.
export async function fetchText(url) {
  let lastError
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await fetchOnce(url)
    } catch (error) {
      lastError = error
    }
  }
  const reason = lastError.cause?.code ?? lastError.cause?.message ?? lastError.message
  throw new Error(`${reason} — ${url}`)
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
