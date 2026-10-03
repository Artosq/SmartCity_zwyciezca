-- ============================================================
-- Migracja 003 — import wydarzeń przez bota (npm run bot)
-- Wklej do: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Skąd pochodzi wydarzenie. Wydarzenia dodane ręcznie mają tu null.
alter table events add column if not exists source text;        -- np. 'karnet', 'eventbrite', 'facebook'
alter table events add column if not exists source_url text;    -- link do oryginału
alter table events add column if not exists external_id text;   -- identyfikator w serwisie źródłowym

-- To samo wydarzenie ze źródła trafia do bazy tylko raz (bot robi upsert po tej parze).
create unique index if not exists idx_events_source_external
  on events (source, external_id);

-- Konto bota — organizator zaimportowanych wydarzeń. Nie da się na nie zalogować.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000b071',
   'authenticated', 'authenticated', 'bot@sasiedzko.example', '', now(),
   '{"provider":"email","providers":["email"]}', '{"name":"Bot Sąsiedzko"}',
   now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- profil zwykle tworzy trigger on_auth_user_created; to zabezpieczenie, gdyby go nie było
insert into profiles (id, name, email)
values ('00000000-0000-4000-8000-00000000b071', 'Bot Sąsiedzko', 'bot@sasiedzko.example')
on conflict (id) do nothing;
