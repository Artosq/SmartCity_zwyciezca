-- ============================================================
-- Migracja 004 — uprawnienia dla bota (klucz secret / rola service_role)
-- Wklej do: Supabase → SQL Editor → New query → Run
-- ============================================================
-- schema.sql nadawał dostęp do tabel tylko rolom anon i authenticated.
-- Bot łączy się kluczem secret (rola service_role) i bez tych uprawnień
-- dostaje błąd "permission denied for table events".
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
