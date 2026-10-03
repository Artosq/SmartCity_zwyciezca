// Wspólne typy danych — używane przez cały zespół.
// Odpowiadają tabelom z supabase/schema.sql.

export type Visibility = "public" | "link_only";

export interface Category {
  id: number;
  slug: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  category_id: number | null;
  lat: number;
  lng: number;
  place_name: string | null;
  starts_at: string;
  capacity: number | null;
  visibility: Visibility;
  involves_children: boolean;
  share_token: string;
  created_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  scope: "category" | "event";
  scope_id: string;
  user_id: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  category_id: number | null;
  title: string;
  body: string | null;
  lat: number | null;
  lng: number | null;
  place_name: string | null;
  created_at: string;
}
