-- ============================================================
-- Migracja 008 — „Pokaż się": położenie na żywo z krótką notką
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (wymaga migracji 006_age_and_ratings.sql — funkcja is_adult())
-- ============================================================

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
