import { createClient } from "@supabase/supabase-js";

// Klient Supabase dla przeglądarki.
// Klucze pochodzą ze zmiennych środowiskowych (.env.local) — nigdy z kodu.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
