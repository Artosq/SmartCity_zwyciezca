-- 012: wybór awatara (emoji) na profilu.
-- Kod awatara (np. 'cat', 'dog') trzyma się publicznie w profiles.avatar
-- i jest widoczny w czacie oraz przy spotkaniach we dwoje. Pusty = inicjały imienia.

alter table profiles add column if not exists avatar text;

-- Użytkownik może zmieniać w swoim profilu imię i awatar (nie własną średnią ocen).
grant update (name, avatar) on profiles to authenticated;
