// Edge Function: „wydarzenie z jednego zdania".
// Odbiera zdanie (po polsku), prosi Claude o wypełnienie pól wydarzenia i zwraca JSON.
// Klucz ANTHROPIC_API_KEY trzyma się w sekretach funkcji (nigdy we froncie ani w repo):
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy parse-event
//
// Front woła ją przez supabase.functions.invoke('parse-event', { body: { sentence, now, categories } }).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Dozwolone grupy docelowe (slugi jak w src/data/targetGroups.ts).
const GROUPS = ['male-dzieci', 'starsze-dzieci', 'mlodziez', 'dorosli', 'seniorzy', 'niepelnosprawni']

// Model: domyślnie Opus 4.8. Dla szybszego/tańszego demo można zmienić na 'claude-haiku-4-5'.
const MODEL = 'claude-opus-4-8'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return json({ error: 'Brak ANTHROPIC_API_KEY w sekretach funkcji.' }, 500)
    }

    const { sentence, now, categories } = await req.json()
    if (!sentence || typeof sentence !== 'string') {
      return json({ error: 'Brak zdania.' }, 400)
    }

    // Lista dostępnych kategorii (slug) przychodzi z frontu — enum trzyma się realnej bazy.
    const catSlugs: string[] =
      Array.isArray(categories) && categories.length
        ? categories.map((c: { slug: string }) => c.slug)
        : ['edukacja', 'sport', 'kultura', 'rekreacja', 'integracja', 'celebracja', 'inne']

    const nowText = typeof now === 'string' ? now : new Date().toISOString()

    const tool = {
      name: 'fill_event',
      description: 'Wypełnia pola formularza wydarzenia sąsiedzkiego na podstawie zdania użytkownika.',
      input_schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string', description: 'Krótki, konkretny tytuł (bez daty). Np. „Kiermasz ciast w parku".' },
          description: { type: 'string', description: 'Jedno–dwa zdania opisu. Pusty string, jeśli brak informacji.' },
          category_slug: { type: 'string', enum: catSlugs, description: 'Najlepiej pasująca kategoria.' },
          target_groups: {
            type: 'array',
            items: { type: 'string', enum: GROUPS },
            description: 'Grupy docelowe. Np. „dla seniorów" → ["seniorzy"]; urodziny dziecka → ["male-dzieci"].',
          },
          starts_at: {
            type: 'string',
            description:
              'Data i godzina rozpoczęcia w formacie YYYY-MM-DDTHH:mm (czas lokalny, bez strefy), np. 2026-10-05T15:00. Pusty string, jeśli nie podano.',
          },
          place_name: { type: 'string', description: 'Publiczna nazwa miejsca, np. „Park Jordana". Pusty string, jeśli brak.' },
          capacity: { type: ['integer', 'null'], description: 'Limit miejsc albo null, jeśli nie podano.' },
        },
        required: ['title', 'description', 'category_slug', 'target_groups', 'starts_at', 'place_name', 'capacity'],
      },
    }

    const system =
      `Jesteś asystentem aplikacji „Sąsiedzko". Z jednego zdania po polsku wyodrębniasz pola wydarzenia sąsiedzkiego i wywołujesz narzędzie fill_event. ` +
      `Aktualny moment (strefa Europe/Warsaw): ${nowText}. Daty względne ("w sobotę o 15", "jutro", "za tydzień") rozwiązuj względem tego momentu, zawsze w przyszłości. ` +
      `Jeśli jakiejś informacji nie ma w zdaniu, zostaw pusty string lub null — nie zgaduj adresu ani godziny, jeśli ich nie podano. Zawsze dobierz przynajmniej jedną grupę docelową.`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'fill_event' },
        messages: [{ role: 'user', content: sentence }],
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return json({ error: `Błąd Claude: ${resp.status}`, detail: text }, 502)
    }

    const data = await resp.json()
    const block = (data.content ?? []).find((b: { type: string }) => b.type === 'tool_use')
    if (!block) return json({ error: 'Model nie zwrócił pól.' }, 502)

    return json({ fields: block.input }, 200)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  })
}
