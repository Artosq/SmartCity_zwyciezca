-- ============================================================
-- Sąsiedzko — schemat bazy danych (Supabase / Postgres)
-- Wklej całość do: Supabase → SQL Editor → New query → Run
-- Zawiera: tabele, RLS (bezpieczeństwo), trigger profilu, dane kategorii
-- ============================================================

-- ---------- 1. TABELE ----------

-- Profil użytkownika (tworzony automatycznie po rejestracji)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz not null default now()
);

-- Kategorie (filtry na mapie + kanały czatu)
create table if not exists categories (
  id    bigint generated always as identity primary key,
  slug  text unique not null,
  name  text not null,
  color text,
  icon  text
);

-- Wydarzenia (dane publiczne — bez dokładnego adresu)
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  organizer_id      uuid not null references profiles(id) on delete cascade,
  title             text not null,
  description       text,
  category_id       bigint references categories(id),
  lat               double precision not null,
  lng               double precision not null,
  place_name        text,                               -- nazwa publiczna, np. "Park Jordana"
  starts_at         timestamptz not null,
  capacity          int,                                -- null = bez limitu
  -- grupy docelowe (filtr i kolory pinezek na mapie); slugi jak w src/data/targetGroups.ts
  target_groups     text[] not null default '{}'
                      constraint events_target_groups_valid check (
                        target_groups <@ array['male-dzieci','starsze-dzieci','mlodziez',
                                               'dorosli','seniorzy','niepelnosprawni']::text[]
                      ),
  city              text,                               -- slug miasta (src/data/cities.ts)
  image_url         text,                               -- zdjęcie; null = ilustracja kategorii
  involves_children boolean not null default false,
  -- import przez bota (npm run bot); wydarzenia dodane ręcznie mają tu null
  source            text,                               -- np. 'karnet', 'eventbrite', 'facebook'
  source_url        text,                               -- link do oryginału
  external_id       text,                               -- identyfikator w serwisie źródłowym
  created_at      timestamptz not null default now()
);

-- Dokładny adres prywatny — osobna tabela, widoczny dopiero po zapisie
create table if not exists event_addresses (
  event_id        uuid primary key references events(id) on delete cascade,
  address_private text not null
);

-- Zapisy na wydarzenie (licznik miejsc = count)
create table if not exists rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- Czat (kanały: po kategorii lub po wydarzeniu)
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  scope      text not null check (scope in ('category','event')),
  scope_id   text not null,                              -- id kategorii lub wydarzenia
  user_id    uuid not null references profiles(id) on delete cascade,
  content    text not null,
  is_hidden  boolean not null default false,             -- po moderacji
  created_at timestamptz not null default now()
);

-- Zgłoszenia wiadomości
create table if not exists message_reports (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references messages(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now()
);

-- Tablica ogłoszeń
create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references profiles(id) on delete cascade,
  category_id bigint references categories(id),
  title       text not null,
  body        text,
  lat         double precision,
  lng         double precision,
  place_name  text,
  created_at  timestamptz not null default now()
);

-- Indeksy pod częste zapytania
create index if not exists idx_events_category on events(category_id);
create index if not exists idx_events_starts_at on events(starts_at);
create unique index if not exists idx_events_source_external on events(source, external_id);
create index if not exists idx_rsvps_event on rsvps(event_id);
create index if not exists idx_messages_scope on messages(scope, scope_id);


-- ---------- 2. AUTOMATYCZNY PROFIL PO REJESTRACJI ----------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ---------- 3. RLS (Row Level Security) ----------

alter table profiles        enable row level security;
alter table categories      enable row level security;
alter table events          enable row level security;
alter table event_addresses enable row level security;
alter table rsvps           enable row level security;
alter table messages        enable row level security;
alter table message_reports enable row level security;
alter table announcements   enable row level security;

-- PROFILES: każdy widzi podstawowe profile; użytkownik edytuje swój
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);

-- CATEGORIES: słownik tylko do odczytu dla wszystkich
create policy "categories_select_all" on categories for select using (true);

-- EVENTS: wszystkie wydarzenia są publiczne — każdy może czytać i dołączyć.
--         Dodaje tylko zalogowany, jako własne. Edytuje/usuwa organizator.
create policy "events_select_all" on events for select using (true);
create policy "events_insert_own" on events for insert
  with check (auth.uid() = organizer_id);
create policy "events_update_own" on events for update
  using (auth.uid() = organizer_id);
create policy "events_delete_own" on events for delete
  using (auth.uid() = organizer_id);

-- EVENT_ADDRESSES: dokładny adres widoczny TYLKO dla organizatora i zapisanych
create policy "addr_select_organizer_or_attendee" on event_addresses for select
  using (
    exists (select 1 from events e
            where e.id = event_addresses.event_id and e.organizer_id = auth.uid())
    or exists (select 1 from rsvps r
            where r.event_id = event_addresses.event_id and r.user_id = auth.uid())
  );
create policy "addr_insert_organizer" on event_addresses for insert
  with check (
    exists (select 1 from events e
            where e.id = event_addresses.event_id and e.organizer_id = auth.uid())
  );

-- RSVPS: odczyt dla wszystkich (potrzebny do licznika miejsc);
--        zapisuje/wypisuje się tylko sam użytkownik
create policy "rsvps_select_all" on rsvps for select using (true);
create policy "rsvps_insert_self" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_delete_self" on rsvps for delete using (auth.uid() = user_id);

-- MESSAGES: widać nieukryte; pisze zalogowany jako sam siebie
create policy "messages_select_visible" on messages for select
  using (is_hidden = false);
create policy "messages_insert_self" on messages for insert
  with check (auth.uid() = user_id);

-- MESSAGE_REPORTS: zgłasza zalogowany
create policy "reports_insert_self" on message_reports for insert
  with check (auth.uid() = reporter_id);

-- ANNOUNCEMENTS: czyta każdy; dodaje zalogowany jako autor
create policy "ann_select_all" on announcements for select using (true);
create policy "ann_insert_own" on announcements for insert
  with check (auth.uid() = author_id);
create policy "ann_delete_own" on announcements for delete
  using (auth.uid() = author_id);


-- ---------- 4. DANE: KATEGORIE ----------

insert into categories (slug, name, color, icon) values
  ('sasiedzkie', 'Sąsiedzkie',  '#16a34a', '🏘️'),
  ('dzieci',     'Dla dzieci',  '#f59e0b', '🧒'),
  ('seniorzy',   'Seniorzy',    '#0ea5e9', '👵'),
  ('kultura',    'Kultura',     '#8b5cf6', '🎭'),
  ('sport',      'Sport',       '#ef4444', '⚽'),
  ('edukacja',   'Edukacja',    '#14b8a6', '📚'),
  ('impreza',    'Imprezy',     '#ec4899', '🎉'),
  ('inne',       'Inne',        '#64748b', '📌')
on conflict (slug) do nothing;

-- ---------- 5. UPRAWNIENIA (GRANT) ----------
-- Data API działa przez role 'anon' (klucz publishable) i 'authenticated'.
-- RLS powyżej pilnuje DOSTĘPU DO WIERSZY; te GRANT-y dają dostęp do tabel.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Bot (npm run bot) łączy się kluczem secret, czyli rolą service_role.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Gotowe. Tabele + bezpieczeństwo RLS + uprawnienia + kategorie są utworzone.
