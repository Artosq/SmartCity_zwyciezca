import { createClient } from '@supabase/supabase-js'

// Klient Supabase dla przeglądarki.
// Klucze pochodzą ze zmiennych środowiskowych (.env.local) — nigdy z kodu.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Bez kluczy createClient rzuca wyjątek przy imporcie — podstawiamy atrapę,
// żeby aplikacja wstała i mogła pokazać czytelny komunikat.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseKey || 'brak-klucza',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
