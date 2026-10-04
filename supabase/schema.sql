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


-- ---------- 6. WYJŚCIA 1:1 ----------

-- Wyjście 1:1: jedna osoba proponuje (host), jedna dołącza (guest).
create table if not exists meetups (
  id           uuid primary key default gen_random_uuid(),
  host_id      uuid not null references profiles(id) on delete cascade,
  guest_id     uuid references profiles(id) on delete set null,   -- null = wolne
  type         text not null
                 check (type in ('spacer','kawa','sport','rozmowa','inne')),
  title        text not null,
  description  text,
  city         text,                                -- slug miasta (src/data/cities.ts)
  lat          double precision not null,
  lng          double precision not null,
  place_name   text not null,                       -- miejsce publiczne, np. "Błonia"
  starts_at    timestamptz not null,
  duration_min int,
  tags         text[] not null default '{}',        -- np. {"Z psem","Bezpłatnie"}
  created_at   timestamptz not null default now(),
  constraint meetups_guest_not_host check (guest_id is null or guest_id <> host_id)
);

create index if not exists idx_meetups_starts_at on meetups(starts_at);
create index if not exists idx_meetups_city on meetups(city);

alter table meetups enable row level security;

-- Listę widzi każdy; proponuje zalogowany jako on sam; usuwa tylko autor.
-- Brak polityki UPDATE: dołączenie i rezygnacja idą wyłącznie przez funkcje poniżej.
drop policy if exists "meetups_select_all" on meetups;
create policy "meetups_select_all" on meetups for select using (true);
drop policy if exists "meetups_insert_own" on meetups;
create policy "meetups_insert_own" on meetups for insert
  with check (auth.uid() = host_id and guest_id is null);
drop policy if exists "meetups_delete_own" on meetups;
create policy "meetups_delete_own" on meetups for delete using (auth.uid() = host_id);

grant select on meetups to anon, authenticated;
grant insert, delete on meetups to authenticated;
grant all on meetups to service_role;

-- Dołączenie: zajmuje wolne miejsce jednym zapytaniem, więc dwie osoby naraz się nie zapiszą.
-- Zwraca false, gdy miejsce jest już zajęte, wyjście minęło albo to własna propozycja.
create or replace function join_meetup(p_meetup_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Musisz być zalogowany.';
  end if;
  update meetups
     set guest_id = auth.uid()
   where id = p_meetup_id
     and guest_id is null
     and host_id <> auth.uid()
     and starts_at > now();
  return found;
end;
$$;

-- Rezygnacja gościa: zwalnia miejsce.
create or replace function leave_meetup(p_meetup_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update meetups set guest_id = null
   where id = p_meetup_id and guest_id = auth.uid();
  return found;
end;
$$;

revoke execute on function join_meetup(uuid) from public, anon;
revoke execute on function leave_meetup(uuid) from public, anon;
grant execute on function join_meetup(uuid) to authenticated;
grant execute on function leave_meetup(uuid) to authenticated;

-- Czat wyjścia 1:1: wiadomości ze scope = 'meetup' widzą i piszą tylko dwie osoby z tego wyjścia.
alter table messages drop constraint if exists messages_scope_check;
alter table messages add constraint messages_scope_check
  check (scope in ('category','event','meetup'));

drop policy if exists "messages_select_visible" on messages;
create policy "messages_select_visible" on messages for select
  using (
    is_hidden = false
    and (
      scope <> 'meetup'
      or exists (select 1 from meetups m
                 where m.id::text = messages.scope_id
                   and auth.uid() in (m.host_id, m.guest_id))
    )
  );

drop policy if exists "messages_insert_self" on messages;
create policy "messages_insert_self" on messages for insert
  with check (
    auth.uid() = user_id
    and (
      scope <> 'meetup'
      or exists (select 1 from meetups m
                 where m.id::text = messages.scope_id
                   and auth.uid() in (m.host_id, m.guest_id))
    )
  );


-- ---------- 7. WIEK I OCENY ----------

-- ---------- 1. WIEK ----------

-- Data urodzenia jest daną wrażliwą, więc leży poza publiczną tabelą profiles:
-- każdy widzi i zmienia tylko swój wiersz.
create table if not exists profile_private (
  id         uuid primary key references profiles(id) on delete cascade,
  birth_date date not null check (birth_date > date '1900-01-01')
);

alter table profile_private enable row level security;

drop policy if exists "private_select_own" on profile_private;
create policy "private_select_own" on profile_private for select using (auth.uid() = id);
drop policy if exists "private_insert_own" on profile_private;
create policy "private_insert_own" on profile_private for insert with check (auth.uid() = id);
drop policy if exists "private_update_own" on profile_private;
create policy "private_update_own" on profile_private for update using (auth.uid() = id);

grant select, insert, update on profile_private to authenticated;
grant all on profile_private to service_role;

-- Czy zalogowany użytkownik ma ukończone 18 lat. Bez podanej daty urodzenia — nie.
create or replace function is_adult()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from profile_private
     where id = auth.uid()
       and birth_date <= (current_date - interval '18 years')
  );
$$;

grant execute on function is_adult() to anon, authenticated;

-- Spotkania we dwoje: widzą, proponują i dołączają wyłącznie zalogowani dorośli.
-- Pilnuje tego baza, więc ominięcie aplikacji nic nie da.
drop policy if exists "meetups_select_all" on meetups;
drop policy if exists "meetups_select_adults" on meetups;
create policy "meetups_select_adults" on meetups for select using (is_adult());

drop policy if exists "meetups_insert_own" on meetups;
create policy "meetups_insert_own" on meetups for insert
  with check (auth.uid() = host_id and guest_id is null and is_adult());

create or replace function join_meetup(p_meetup_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Musisz być zalogowany.';
  end if;
  if not is_adult() then
    raise exception 'Spotkania we dwoje są dostępne od 18 lat.';
  end if;
  update meetups
     set guest_id = auth.uid()
   where id = p_meetup_id
     and guest_id is null
     and host_id <> auth.uid()
     and starts_at > now();
  return found;
end;
$$;


-- ---------- 2. OCENY ----------

-- Średnia i liczba ocen są publiczne (widać je przy wydarzeniach i spotkaniach).
alter table profiles add column if not exists rating_avg numeric(3,2);
alter table profiles add column if not exists rating_count int not null default 0;

-- Użytkownik może zmieniać w swoim profilu tylko imię — nie własną średnią ocen.
revoke insert, update on profiles from authenticated;
grant insert (id, name, email) on profiles to authenticated;
grant update (name) on profiles to authenticated;

-- Pojedyncza ocena: od 0,5 do 5 gwiazdek, co pół.
--   scope = 'event'  → uczestnik ocenia organizatora wydarzenia
--   scope = 'meetup' → dwie osoby ze spotkania we dwoje oceniają się nawzajem
create table if not exists ratings (
  id         uuid primary key default gen_random_uuid(),
  rater_id   uuid not null references profiles(id) on delete cascade,
  ratee_id   uuid not null references profiles(id) on delete cascade,
  scope      text not null check (scope in ('event','meetup')),
  scope_id   uuid not null,
  stars      numeric(2,1) not null
               check (stars between 0.5 and 5 and stars * 2 = floor(stars * 2)),
  created_at timestamptz not null default now(),
  constraint ratings_once unique (rater_id, scope, scope_id),
  constraint ratings_not_self check (rater_id <> ratee_id)
);

create index if not exists idx_ratings_ratee on ratings(ratee_id);

alter table ratings enable row level security;

-- Kto komu wystawił jaką ocenę, widzi tylko wystawiający; publiczna jest sama średnia.
drop policy if exists "ratings_select_own" on ratings;
create policy "ratings_select_own" on ratings for select using (auth.uid() = rater_id);

-- Ocenić można dopiero po terminie i tylko, gdy było się zapisanym / uczestnikiem.
drop policy if exists "ratings_insert_participant" on ratings;
create policy "ratings_insert_participant" on ratings for insert
  with check (
    auth.uid() = rater_id
    and (
      (scope = 'event' and exists (
         select 1 from events e
           join rsvps r on r.event_id = e.id
          where e.id = ratings.scope_id
            and r.user_id = auth.uid()
            and e.organizer_id = ratings.ratee_id
            and e.starts_at < now()))
      or
      (scope = 'meetup' and exists (
         select 1 from meetups m
          where m.id = ratings.scope_id
            and m.starts_at < now()
            and m.guest_id is not null
            and ((m.host_id = auth.uid() and m.guest_id = ratings.ratee_id)
              or (m.guest_id = auth.uid() and m.host_id = ratings.ratee_id))))
    )
  );

grant select, insert on ratings to authenticated;
grant all on ratings to service_role;

-- Po każdej zmianie ocen przeliczamy średnią ocenianej osoby.
create or replace function refresh_profile_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.ratee_id, old.ratee_id);
begin
  update profiles p
     set rating_avg   = (select round(avg(stars), 2) from ratings where ratee_id = target),
         rating_count = (select count(*) from ratings where ratee_id = target)
   where p.id = target;
  return null;
end;
$$;

drop trigger if exists on_rating_change on ratings;
create trigger on_rating_change
  after insert or update or delete on ratings
  for each row execute function refresh_profile_rating();


-- ---------- 8. ZDJĘCIA Z PLIKU I NOWY RODZAJ SPOTKANIA ----------

-- ---------- 1. ZDJĘCIA WYDARZEŃ ----------

-- Publiczny magazyn zdjęć: do 5 MB, tylko obrazy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Zdjęcia ogląda każdy; przesyła i usuwa zalogowany, wyłącznie we własnym folderze
-- (ścieżka pliku zaczyna się od jego identyfikatora: <user_id>/<plik>).
drop policy if exists "event_images_read" on storage.objects;
create policy "event_images_read" on storage.objects for select
  using (bucket_id = 'event-images');

drop policy if exists "event_images_upload_own" on storage.objects;
create policy "event_images_upload_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "event_images_delete_own" on storage.objects;
create policy "event_images_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'event-images' and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------- 2. NOWY RODZAJ SPOTKANIA WE DWOJE ----------

alter table meetups drop constraint if exists meetups_type_check;
alter table meetups add constraint meetups_type_check
  check (type in ('spacer', 'kawa', 'sport', 'rozmowa', 'zakupy', 'inne'));


-- ---------- 9. „POKAŻ SIĘ": POŁOŻENIE NA ŻYWO ----------

-- ---------- 1. KTO JEST TERAZ WIDOCZNY ----------

-- Jeden wiersz na osobę: gdzie teraz jest i co chce robić („Biegam po Błoniach, dołącz!").
-- Wiersz znika, gdy osoba kliknie „Ukryj się"; po czasie expires_at przestaje być widoczny.
create table if not exists live_presence (
  user_id    uuid primary key references profiles(id) on delete cascade,
  note       text not null check (char_length(note) between 1 and 80),
  lat        double precision not null,
  lng        double precision not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table live_presence enable row level security;

-- Położenie na żywo to dana wrażliwa: pokazywać się i widzieć innych mogą wyłącznie
-- zalogowani dorośli, a wygasłe wpisy nie są zwracane nikomu poza właścicielem.
drop policy if exists "presence_select_adults" on live_presence;
create policy "presence_select_adults" on live_presence for select
  using (auth.uid() = user_id or (is_adult() and expires_at > now()));

drop policy if exists "presence_insert_own" on live_presence;
create policy "presence_insert_own" on live_presence for insert
  with check (auth.uid() = user_id and is_adult());

drop policy if exists "presence_update_own" on live_presence;
create policy "presence_update_own" on live_presence for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id and is_adult());

drop policy if exists "presence_delete_own" on live_presence;
create policy "presence_delete_own" on live_presence for delete using (auth.uid() = user_id);

grant select, insert, update, delete on live_presence to authenticated;
grant all on live_presence to service_role;


-- ---------- 2. KTO DO KOGO IDZIE („Dołączam") ----------

-- Dołączający zgłasza „idę do Ciebie" i udostępnia swoje położenie WYŁĄCZNIE tej jednej osobie,
-- żeby mogły się odnaleźć. Wiersz znika razem z wpisem osoby docelowej (ukrycie się, usunięcie).
create table if not exists live_joins (
  target_id  uuid not null references live_presence(user_id) on delete cascade,
  joiner_id  uuid not null references profiles(id) on delete cascade,
  lat        double precision,
  lng        double precision,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (target_id, joiner_id),
  constraint live_joins_not_self check (target_id <> joiner_id)
);

alter table live_joins enable row level security;

drop policy if exists "joins_select_parties" on live_joins;
create policy "joins_select_parties" on live_joins for select
  using (auth.uid() in (target_id, joiner_id));

drop policy if exists "joins_insert_own" on live_joins;
create policy "joins_insert_own" on live_joins for insert
  with check (auth.uid() = joiner_id and is_adult());

drop policy if exists "joins_update_own" on live_joins;
create policy "joins_update_own" on live_joins for update
  using (auth.uid() = joiner_id) with check (auth.uid() = joiner_id);

-- zrezygnować może dołączający; odrzucić może osoba, do której ktoś idzie
drop policy if exists "joins_delete_parties" on live_joins;
create policy "joins_delete_parties" on live_joins for delete
  using (auth.uid() in (target_id, joiner_id));

grant select, insert, update, delete on live_joins to authenticated;
grant all on live_joins to service_role;


-- ---------- 3. NA ŻYWO ----------

-- Zmiany trafiają do przeglądarek od razu (Supabase Realtime).
-- Bez tego aplikacja i tak odświeża dane co kilkanaście sekund.
do $$
begin
  alter publication supabase_realtime add table live_presence;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table live_joins;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
