-- ============================================================
-- Migracja 005 — wyjścia 1:1 (spacer, kawa, sport, rozmowa)
-- Wklej do: Supabase → SQL Editor → New query → Run
-- ============================================================

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
