-- ============================================================
-- Migracja 002 — zdjęcie wydarzenia i miasto
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (seed.sql dodaje te kolumny sam, więc przed seedem nie trzeba jej uruchamiać)
-- ============================================================

-- Zdjęcie na karcie wydarzenia (strona główna). null = ilustracja kategorii.
alter table events add column if not exists image_url text;

-- Slug miasta (src/data/cities.ts) — zapisywany przy dodawaniu wydarzenia.
alter table events add column if not exists city text;
create index if not exists idx_events_city on events(city);
