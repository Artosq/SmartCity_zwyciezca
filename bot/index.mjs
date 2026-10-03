// Bot Sąsiedzko — codziennie dodaje do bazy kilka losowych wydarzeń z Karnetu
// (miejski kalendarz wydarzeń Krakowa), których jeszcze u nas nie ma.
//
//   npm run bot                 losuje i zapisuje do Supabase
//   npm run bot -- --dry        tylko losuje i wypisuje, nic nie zapisuje
//   npm run bot -- --count=3    ile wydarzeń dodać (domyślnie BOT_DAILY_COUNT albo 5)
//
// Zapis wymaga w .env.local klucza SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API Keys →
// secret key). To klucz z pełnym dostępem do bazy: nie może trafić do repo ani do przeglądarki
// (dlatego nie ma przedrostka VITE_). Bez niego bot działa w trybie --dry.
import { createClient } from '@supabase/supabase-js'
import { classify } from './classify.mjs'
import { fetchFacebook } from './sources/facebook.mjs'
import { fetchKarnet } from './sources/karnet.mjs'

// Konto bota — tworzy je migracja 003_bot_import.sql.
const BOT_PROFILE_ID = '00000000-0000-4000-8000-00000000b071'
// Na ten moment tylko Kraków: [[południe, zachód], [północ, wschód]], jak w src/data/cities.ts.
const KRAKOW_BOUNDS = [[49.967, 19.792], [50.126, 20.217]]
// Bierzemy pod uwagę tylko wydarzenia zaczynające się w najbliższych dniach.
const DAYS_AHEAD = 3
const DEFAULT_DAILY_COUNT = 5
const MAX_DESCRIPTION = 600

// Facebook działa tylko po skonfigurowaniu dostępu do stron (patrz sources/facebook.mjs).
const SOURCES = [
  ['Karnet', fetchKarnet],
  ['Facebook', fetchFacebook],
]

try {
  process.loadEnvFile('.env.local')
} catch {
  // brak pliku — zmienne pochodzą ze środowiska (np. z harmonogramu GitHub Actions)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const readKey = serviceKey || process.env.VITE_SUPABASE_ANON_KEY
const dryRun = process.argv.includes('--dry') || !supabaseUrl || !serviceKey
const countArg = process.argv.find((arg) => arg.startsWith('--count='))?.split('=')[1]
const dailyCount = Number(countArg ?? process.env.BOT_DAILY_COUNT ?? DEFAULT_DAILY_COUNT)

function inKrakow({ lat, lng }) {
  const [[south, west], [north, east]] = KRAKOW_BOUNDS
  return lat >= south && lat <= north && lng >= west && lng <= east
}

// Losowe `count` elementów (tasowanie Fishera-Yatesa).
function pickRandom(items, count) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

const now = new Date()
const window = {
  from: now.toISOString(),
  to: new Date(now.getTime() + DAYS_AHEAD * 86400000).toISOString(),
}

const collected = []
for (const [name, fetchSource] of SOURCES) {
  try {
    const events = await fetchSource(window)
    if (events === null) continue // źródło nieskonfigurowane
    const local = events.filter((event) => event.title && event.external_id && inKrakow(event))
    console.log(`${name}: ${local.length} nadchodzących wydarzeń w Krakowie (${DAYS_AHEAD} dni)`)
    collected.push(...local)
  } catch (error) {
    // jedno zepsute źródło nie zatrzymuje pozostałych
    console.error(`${name}: błąd — ${error.message}`)
  }
}

// to samo wydarzenie potrafi wystąpić na liście źródła dwa razy
let candidates = [
  ...new Map(collected.map((event) => [`${event.source}:${event.external_id}`, event])).values(),
]

const supabase =
  supabaseUrl && readKey
    ? createClient(supabaseUrl, readKey, { auth: { persistSession: false } })
    : null

// Losujemy tylko spośród wydarzeń, których jeszcze nie zaimportowaliśmy.
if (supabase) {
  const { data: imported, error } = await supabase
    .from('events')
    .select('source, external_id')
    .not('source', 'is', null)
  if (error) {
    // brak kolumny `source` → migracja 003; "permission denied" → migracja 004
    const message = `Nie udało się sprawdzić zaimportowanych wydarzeń (${error.message}). Uruchom w Supabase migracje 003_bot_import.sql i 004_service_role_grants.sql.`
    if (!dryRun) throw new Error(message)
    console.warn(message)
  } else {
    const known = new Set(imported.map((row) => `${row.source}:${row.external_id}`))
    candidates = candidates.filter((event) => !known.has(`${event.source}:${event.external_id}`))
    console.log(`Już w bazie: ${known.size}, nowych do wylosowania: ${candidates.length}`)
  }
}

const picked = pickRandom(candidates, dailyCount).map((event) => ({ ...event, ...classify(event) }))

console.log(`\nWylosowano ${picked.length}:`)
for (const event of picked) {
  const when = new Date(event.starts_at).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
  console.log(`- ${when} | ${event.title} | ${event.place_name}`)
  console.log(`    ${event.category} | ${event.target_groups.join(', ')} | ${event.source_url}`)
}

if (dryRun) {
  const reason = serviceKey ? 'na życzenie' : 'brak SUPABASE_SERVICE_ROLE_KEY'
  console.log(`\nTryb --dry (${reason}) — nic nie zapisuję.`)
  process.exit(0)
}
if (picked.length === 0) {
  console.log('\nNie ma nic nowego do dodania.')
  process.exit(0)
}

const { data: categories, error: categoriesError } = await supabase
  .from('categories')
  .select('id, slug')
if (categoriesError) throw new Error(`Nie udało się pobrać kategorii: ${categoriesError.message}`)
const categoryIds = Object.fromEntries(categories.map((category) => [category.slug, category.id]))

const rows = picked.map((event) => ({
  organizer_id: BOT_PROFILE_ID,
  title: event.title,
  description: event.description?.slice(0, MAX_DESCRIPTION) ?? null,
  category_id: categoryIds[event.category] ?? null,
  target_groups: event.target_groups,
  city: 'krakow',
  lat: event.lat,
  lng: event.lng,
  place_name: event.place_name || null,
  starts_at: event.starts_at,
  capacity: null,
  image_url: event.image_url,
  source: event.source,
  source_url: event.source_url,
  external_id: String(event.external_id),
}))

// (source, external_id) jest unikalne w bazie — to samo wydarzenie nie wejdzie dwa razy.
const { error } = await supabase.from('events').insert(rows)
if (error) throw new Error(`Zapis nie powiódł się: ${error.message}`)

console.log(`\nDodano ${rows.length} wydarzeń.`)
