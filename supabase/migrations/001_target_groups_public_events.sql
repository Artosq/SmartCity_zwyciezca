-- ============================================================
-- Migracja 001 — dla bazy utworzonej wcześniejszą wersją schema.sql
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (świeża baza z aktualnego schema.sql tej migracji nie potrzebuje)
-- ============================================================

-- 1. Grupy docelowe wydarzenia (filtr i kolory pinezek na mapie).
alter table events
  add column if not exists target_groups text[] not null default '{}';

alter table events drop constraint if exists events_target_groups_valid;
alter table events
  add constraint events_target_groups_valid check (
    target_groups <@ array['male-dzieci','starsze-dzieci','mlodziez',
                           'dorosli','seniorzy','niepelnosprawni']::text[]
  );

-- 2. Wszystkie wydarzenia są publiczne — usuwamy widoczność „tylko z linkiem".
alter table events drop column if exists visibility;
alter table events drop column if exists share_token;
