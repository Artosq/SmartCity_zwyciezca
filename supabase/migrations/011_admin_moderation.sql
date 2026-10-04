-- ============================================================
-- Migracja 011 — panel administratora i moderacja
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (wymaga migracji 005, 006, 008 i 009)
--
-- PO URUCHOMIENIU nadaj sobie uprawnienia pierwszego administratora — jedno z dwóch:
--   insert into admins (user_id) select id from auth.users where email = 'twoj@email.pl';
--   insert into admins (user_id) values ('identyfikator-z-tabeli-profiles');   -- np. konto demo
-- Kolejnych administratorów nadaje się już w panelu (/admin → Użytkownicy).
-- ============================================================

-- ---------- 1. ADMINISTRATORZY ----------

create table if not exists admins (
  user_id    uuid primary key references profiles(id) on delete cascade,
  added_by   uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Czy zalogowany użytkownik jest administratorem. Na tej funkcji opierają się wszystkie
-- uprawnienia moderacji — z aplikacji nie da się ich sobie nadać.
create or replace function is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table admins enable row level security;

drop policy if exists "admins_select" on admins;
create policy "admins_select" on admins for select using (is_admin());
drop policy if exists "admins_insert" on admins;
create policy "admins_insert" on admins for insert with check (is_admin());
drop policy if exists "admins_delete" on admins;
create policy "admins_delete" on admins for delete using (is_admin());

grant select, insert, delete on admins to authenticated;
grant all on admins to service_role;
grant execute on function is_admin() to anon, authenticated;


-- ---------- 2. BANY ----------

create table if not exists bans (
  user_id    uuid primary key references profiles(id) on delete cascade,
  reason     text not null check (char_length(reason) between 3 and 500),
  until      timestamptz,                       -- null = bezterminowo
  banned_by  uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Czy dana osoba ma aktywnego bana (zwraca tylko tak/nie, bez powodu).
create or replace function user_banned(p_user uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from bans where user_id = p_user and (until is null or until > now())
  );
$$;

create or replace function is_banned()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select user_banned(auth.uid());
$$;

alter table bans enable row level security;

-- Powód i termin widzi zbanowany (żeby mógł się odwołać) oraz administratorzy.
drop policy if exists "bans_select" on bans;
create policy "bans_select" on bans for select using (user_id = auth.uid() or is_admin());
drop policy if exists "bans_insert" on bans;
create policy "bans_insert" on bans for insert with check (is_admin());
drop policy if exists "bans_update" on bans;
create policy "bans_update" on bans for update using (is_admin()) with check (is_admin());
drop policy if exists "bans_delete" on bans;
create policy "bans_delete" on bans for delete using (is_admin());

grant select, insert, update, delete on bans to authenticated;
grant all on bans to service_role;
grant execute on function user_banned(uuid) to anon, authenticated;
grant execute on function is_banned() to anon, authenticated;


-- ---------- 3. UKRYWANIE TREŚCI ----------

alter table events  add column if not exists is_hidden boolean not null default false;
alter table events  add column if not exists hidden_reason text;
alter table meetups add column if not exists is_hidden boolean not null default false;
alter table meetups add column if not exists hidden_reason text;

-- Polityki OGRANICZAJĄCE (restrictive) działają dodatkowo do wszystkich istniejących:
-- ukryta treść i treść zbanowanej osoby znika dla innych; autor nadal widzi swoją
-- (razem z powodem ukrycia), a administrator widzi wszystko.
drop policy if exists "mod_events_visible" on events;
create policy "mod_events_visible" on events as restrictive for select
  using ((not is_hidden and not user_banned(organizer_id)) or organizer_id = auth.uid() or is_admin());

drop policy if exists "mod_meetups_visible" on meetups;
create policy "mod_meetups_visible" on meetups as restrictive for select
  using ((not is_hidden and not user_banned(host_id)) or auth.uid() in (host_id, guest_id) or is_admin());

drop policy if exists "mod_messages_visible" on messages;
create policy "mod_messages_visible" on messages as restrictive for select
  using (not user_banned(user_id) or user_id = auth.uid() or is_admin());

drop policy if exists "mod_presence_visible" on live_presence;
create policy "mod_presence_visible" on live_presence as restrictive for select
  using (not user_banned(user_id) or user_id = auth.uid() or is_admin());

-- Zbanowany może przeglądać, ale niczego nie doda: wydarzenia, zapisu, wiadomości,
-- spotkania, położenia na żywo ani oceny.
drop policy if exists "mod_no_banned_insert" on events;
create policy "mod_no_banned_insert" on events as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on rsvps;
create policy "mod_no_banned_insert" on rsvps as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on messages;
create policy "mod_no_banned_insert" on messages as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on meetups;
create policy "mod_no_banned_insert" on meetups as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on live_presence;
create policy "mod_no_banned_insert" on live_presence as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_update" on live_presence;
create policy "mod_no_banned_update" on live_presence as restrictive for update with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on live_joins;
create policy "mod_no_banned_insert" on live_joins as restrictive for insert with check (not is_banned());
drop policy if exists "mod_no_banned_insert" on ratings;
create policy "mod_no_banned_insert" on ratings as restrictive for insert with check (not is_banned());

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
  if is_banned() then
    raise exception 'Twoje konto jest zablokowane.';
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

-- Administrator ukrywa i przywraca treści.
drop policy if exists "events_update_admin" on events;
create policy "events_update_admin" on events for update using (is_admin()) with check (is_admin());

grant update on meetups to authenticated;
drop policy if exists "meetups_update_admin" on meetups;
create policy "meetups_update_admin" on meetups for update using (is_admin()) with check (is_admin());

drop policy if exists "messages_update_admin" on messages;
create policy "messages_update_admin" on messages for update using (is_admin()) with check (is_admin());

-- Organizator może edytować swoje wydarzenie, ale nie cofnie ukrycia przez moderację.
create or replace function protect_moderation_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.is_hidden is distinct from old.is_hidden
      or new.hidden_reason is distinct from old.hidden_reason)
     and not is_admin() then
    raise exception 'Widoczność treści może zmienić tylko moderator.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_moderation on events;
create trigger protect_moderation before update on events
  for each row execute function protect_moderation_fields();


-- ---------- 4. ZGŁOSZENIA OD UŻYTKOWNIKÓW ----------

create table if not exists reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  target_type      text not null
                     check (target_type in ('message', 'event', 'meetup', 'user', 'meetup_chat')),
  target_id        text not null,                 -- id wiadomości / wydarzenia / spotkania / osoby
  reported_user_id uuid references profiles(id) on delete set null,
  reason           text not null check (char_length(reason) between 3 and 1000),
  status           text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by      uuid references profiles(id) on delete set null,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_reports_status on reports(status, created_at);

alter table reports enable row level security;

-- Prywatną rozmowę „We dwoje" może zgłosić tylko jedna z dwóch osób, które w niej uczestniczą.
drop policy if exists "reports_insert_own" on reports;
create policy "reports_insert_own" on reports for insert
  with check (
    auth.uid() = reporter_id
    and (
      target_type <> 'meetup_chat'
      or exists (select 1 from meetups m
                 where m.id::text = reports.target_id
                   and auth.uid() in (m.host_id, m.guest_id))
    )
  );

drop policy if exists "reports_select" on reports;
create policy "reports_select" on reports for select using (reporter_id = auth.uid() or is_admin());
drop policy if exists "reports_update_admin" on reports;
create policy "reports_update_admin" on reports for update using (is_admin()) with check (is_admin());

grant select, insert, update on reports to authenticated;
grant all on reports to service_role;

-- Administrator czyta czaty wydarzeń zawsze, a prywatny czat „We dwoje" TYLKO wtedy,
-- gdy zgłosiła go jedna z dwóch osób. Widzi też wiadomości ukryte.
drop policy if exists "messages_select_admin" on messages;
create policy "messages_select_admin" on messages for select
  using (
    is_admin()
    and (
      scope <> 'meetup'
      or exists (select 1 from reports r
                 where r.target_type = 'meetup_chat' and r.target_id = messages.scope_id)
    )
  );


-- ---------- 5. ODPOWIEDZI NA WIADOMOŚCI Z POMOCY ----------

alter table support_messages add column if not exists reply text;
alter table support_messages add column if not exists replied_by uuid references profiles(id) on delete set null;
alter table support_messages add column if not exists replied_at timestamptz;
alter table support_messages add column if not exists status text not null default 'open';
alter table support_messages drop constraint if exists support_messages_status_check;
alter table support_messages add constraint support_messages_status_check
  check (status in ('open', 'answered', 'closed'));

-- Zalogowany widzi własne zgłoszenia razem z odpowiedzią; administrator widzi wszystkie.
drop policy if exists "support_select" on support_messages;
create policy "support_select" on support_messages for select
  using (user_id = auth.uid() or is_admin());
drop policy if exists "support_update_admin" on support_messages;
create policy "support_update_admin" on support_messages for update
  using (is_admin()) with check (is_admin());

grant select, update on support_messages to authenticated;


-- ---------- 6. DZIENNIK DZIAŁAŃ ADMINISTRATORÓW ----------

create table if not exists admin_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references profiles(id) on delete set null,
  action      text not null,          -- np. 'ban', 'unban', 'hide', 'restore', 'reply', 'grant_admin'
  target_type text,
  target_id   text,
  details     text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_admin_log_created on admin_log(created_at desc);

alter table admin_log enable row level security;

drop policy if exists "admin_log_select" on admin_log;
create policy "admin_log_select" on admin_log for select using (is_admin());
drop policy if exists "admin_log_insert" on admin_log;
create policy "admin_log_insert" on admin_log for insert
  with check (is_admin() and admin_id = auth.uid());

grant select, insert on admin_log to authenticated;
grant all on admin_log to service_role;


-- ---------- 7. FILTR WULGARYZMÓW ----------

-- Sąsiedzko to rodzinna, sąsiedzka przestrzeń: wydarzenia, spotkania i notki „Pokaż się"
-- z wulgaryzmami nie dają się zapisać. Sprawdza to baza, więc filtra nie da się obejść,
-- pomijając aplikację. Lista rdzeni jest też w src/lib/profanity.ts (komunikat przed wysłaniem).
create or replace function contains_profanity(p_text text)
returns boolean
language sql
immutable
as $$
  select p_text is not null and (
    -- rdzenie wulgarne w dowolnym miejscu wyrazu (np. „wkurw…", „spierdal…")
    lower(p_text) ~ '(kurw|kurew|pierdol|pierdal|pizd|jeban|jebać|jebac|jebie|skurwysyn|skurwiel)'
    -- rdzenie liczone tylko od początku wyrazu, żeby nie łapać zwykłych słów
    or lower(p_text) ~ '(^|[^a-ząćęłńóśźż])(chuj|huj|jeb|zajeb|wyjeb|pojeb|rozjeb|przejeb|najeb|ujeb|kutas|fiut|cwel|dziwk|cip[aąęyk]|gówn|fuck|shit|bitch|cunt|asshole)'
  );
$$;

create or replace function block_profanity()
returns trigger
language plpgsql
as $$
declare
  content text;
  previous text;
begin
  if tg_table_name = 'events' then
    -- wydarzenia importowane przez bota pochodzą z miejskiego kalendarza — nie blokujemy ich
    if new.source is not null then
      return new;
    end if;
    content := concat_ws(' ', new.title, new.description, new.place_name);
  elsif tg_table_name = 'meetups' then
    content := concat_ws(' ', new.title, new.description, new.place_name, array_to_string(new.tags, ' '));
  elsif tg_table_name = 'live_presence' then
    content := new.note;
  end if;

  -- Przy zmianie wiersza sprawdzamy tylko wtedy, gdy zmienił się sam tekst. Dzięki temu moderator
  -- może ukryć starą, wulgarną treść, a aktualizacje położenia nie są sprawdzane za każdym razem.
  if tg_op = 'UPDATE' then
    if tg_table_name = 'events' then
      previous := concat_ws(' ', old.title, old.description, old.place_name);
    elsif tg_table_name = 'meetups' then
      previous := concat_ws(' ', old.title, old.description, old.place_name, array_to_string(old.tags, ' '));
    else
      previous := old.note;
    end if;
    if previous is not distinct from content then
      return new;
    end if;
  end if;

  if contains_profanity(content) then
    raise exception 'Treść zawiera wulgaryzmy. Sąsiedzko to rodzinna przestrzeń - zmień sformułowanie.';
  end if;
  return new;
end;
$$;

drop trigger if exists no_profanity on events;
create trigger no_profanity before insert or update on events
  for each row execute function block_profanity();
drop trigger if exists no_profanity on meetups;
create trigger no_profanity before insert or update on meetups
  for each row execute function block_profanity();
drop trigger if exists no_profanity on live_presence;
create trigger no_profanity before insert or update on live_presence
  for each row execute function block_profanity();


-- ---------- 8. WGLĄD ADMINISTRATORA W TREŚCI DLA DOROSŁYCH ----------

-- Spotkania „We dwoje" i położenia na żywo normalnie widzą tylko pełnoletni użytkownicy.
-- Administrator musi je widzieć, żeby móc je moderować, niezależnie od własnej daty urodzenia.
drop policy if exists "meetups_select_admin" on meetups;
create policy "meetups_select_admin" on meetups for select using (is_admin());

drop policy if exists "presence_select_admin" on live_presence;
create policy "presence_select_admin" on live_presence for select using (is_admin());
