// Wspólne typy danych — używane przez cały zespół.
// Odpowiadają tabelom z supabase/schema.sql.

export interface Category {
  id: number
  slug: string
  name: string
  color: string | null
  icon: string | null
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  // publiczna średnia ocen (0,5–5) i ich liczba; null = brak ocen
  rating_avg: number | null
  rating_count: number
  created_at: string
}

// Organizator pokazywany przy wydarzeniu albo spotkaniu: imię i ocena.
export type Organizer = Pick<Profile, 'name'> & Partial<Pick<Profile, 'rating_avg' | 'rating_count'>>

export interface EventItem {
  id: string
  organizer_id: string
  title: string
  description: string | null
  category_id: number | null
  lat: number
  lng: number
  place_name: string | null
  starts_at: string
  capacity: number | null
  target_groups: string[]
  city: string | null
  image_url: string | null
  // Wydarzenia zaimportowane przez bota: nazwa serwisu i link do oryginału (ręcznie dodane: null).
  source: string | null
  source_url: string | null
  created_at: string
}

// Wydarzenie z danymi do kart i mapy: kategoria + liczba zapisanych.
export interface EventWithStats extends EventItem {
  category: Pick<Category, 'slug' | 'name'> | null
  organizer: Organizer | null
  attendees: number
}

export interface Rsvp {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface Message {
  id: string
  scope: 'category' | 'event'
  scope_id: string
  user_id: string
  content: string
  is_hidden: boolean
  created_at: string
}

export interface Announcement {
  id: string
  author_id: string
  category_id: number | null
  title: string
  body: string | null
  lat: number | null
  lng: number | null
  place_name: string | null
  created_at: string
}

// Wyjście 1:1: jedna osoba proponuje (host), jedna dołącza (guest).
export interface Meetup {
  id: string
  host_id: string
  guest_id: string | null
  type: string
  title: string
  description: string | null
  city: string | null
  lat: number
  lng: number
  place_name: string
  starts_at: string
  duration_min: number | null
  tags: string[]
  created_at: string
}

export interface MeetupWithHost extends Meetup {
  host: Organizer | null
}
