-- ============================================================
-- Migracja 010 — adres e-mail nie trafia do publicznego profilu
-- Wklej do: Supabase → SQL Editor → New query → Run
-- ============================================================
-- Tabela profiles jest czytelna dla wszystkich (imię i ocena organizatora są publiczne),
-- a dotąd kopiowaliśmy do niej także adres e-mail — każdy mógł go odczytać przez API.
-- E-mail zostaje wyłącznie w auth.users, do którego aplikacja nie daje dostępu.

-- Nowe konta: profil dostaje tylko imię.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Istniejące konta: usuwamy skopiowane adresy.
update profiles set email = null where email is not null;
