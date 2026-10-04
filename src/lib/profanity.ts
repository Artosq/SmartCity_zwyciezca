// Filtr wulgaryzmów — ta sama lista rdzeni co funkcja contains_profanity() w bazie
// (supabase/migrations/011_admin_moderation.sql). Tutaj służy do pokazania komunikatu
// przed wysłaniem i do flag w panelu administratora; ostatecznie i tak pilnuje baza.

// rdzenie wulgarne w dowolnym miejscu wyrazu (np. „wkurw…", „spierdal…")
const ANYWHERE = /(kurw|kurew|pierdol|pierdal|pizd|jeban|jebać|jebac|jebie|skurwysyn|skurwiel)/
// rdzenie liczone tylko od początku wyrazu, żeby nie łapać zwykłych słów
const WORD_START =
  /(^|[^a-ząćęłńóśźż])(chuj|huj|jeb|zajeb|wyjeb|pojeb|rozjeb|przejeb|najeb|ujeb|kutas|fiut|cwel|dziwk|cip[aąęyk]|gówn|fuck|shit|bitch|cunt|asshole)/

export function containsProfanity(...texts: (string | null | undefined)[]) {
  const text = texts.filter(Boolean).join(' ').toLowerCase()
  return ANYWHERE.test(text) || WORD_START.test(text)
}

export const PROFANITY_MESSAGE =
  'Treść zawiera wulgaryzmy. Sąsiedzko to rodzinna, sąsiedzka przestrzeń - zmień sformułowanie.'

// Błąd z bazy (trigger block_profanity) zamieniamy na ten sam, zrozumiały komunikat.
export const explainDbError = (message: string) =>
  message.toLowerCase().includes('wulgaryzm') ? PROFANITY_MESSAGE : message
