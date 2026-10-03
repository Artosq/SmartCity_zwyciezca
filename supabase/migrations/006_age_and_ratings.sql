-- ============================================================
-- Migracja 006 — wiek użytkowników i oceny organizatorów
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (wymaga migracji 005_meetups.sql)
-- ============================================================

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
