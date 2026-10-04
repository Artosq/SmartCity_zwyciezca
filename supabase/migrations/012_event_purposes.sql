-- ============================================================
-- Migracja 012: cele wydarzenia zamiast kategorii pokrywających się z grupami docelowymi
-- Wklej do: Supabase → SQL Editor → New query → Run
--
-- Nowa lista: edukacyjne, sportowe, kulturalne, rekreacyjne, integracyjne, celebracyjne, inne.
-- Znikają „Dla dzieci" i „Seniorzy" (to grupy docelowe, a nie cel wydarzenia).
-- Istniejące wydarzenia zostają i dostają najbliższy nowy cel. Można uruchomić wielokrotnie.
-- ============================================================

-- stare kategorie zmieniają nazwę (wydarzenia zostają przy nich)
update categories set slug = 'integracja', name = 'Integracyjne', icon = '🤝'
 where slug = 'sasiedzkie' and not exists (select 1 from categories where slug = 'integracja');
update categories set slug = 'celebracja', name = 'Celebracyjne', icon = '🎉'
 where slug = 'impreza' and not exists (select 1 from categories where slug = 'celebracja');
update categories set slug = 'rekreacja', name = 'Rekreacyjne', icon = '🌳'
 where slug = 'dzieci' and not exists (select 1 from categories where slug = 'rekreacja');

update categories set name = 'Edukacyjne' where slug = 'edukacja';
update categories set name = 'Sportowe'   where slug = 'sport';
update categories set name = 'Kulturalne' where slug = 'kultura';

-- gdyby którejś brakowało (np. baza bez danych startowych)
insert into categories (slug, name, color, icon) values
  ('edukacja',   'Edukacyjne',   '#14b8a6', '📚'),
  ('sport',      'Sportowe',     '#ef4444', '⚽'),
  ('kultura',    'Kulturalne',   '#8b5cf6', '🎭'),
  ('rekreacja',  'Rekreacyjne',  '#f59e0b', '🌳'),
  ('integracja', 'Integracyjne', '#16a34a', '🤝'),
  ('celebracja', 'Celebracyjne', '#ec4899', '🎉'),
  ('inne',       'Inne',         '#64748b', '📌')
on conflict (slug) do nothing;

-- wydarzenia i ogłoszenia z usuwanych kategorii przechodzą do „Integracyjne"
update events
   set category_id = (select id from categories where slug = 'integracja')
 where category_id in (select id from categories where slug in ('seniorzy', 'sasiedzkie', 'impreza', 'dzieci'));
update announcements
   set category_id = (select id from categories where slug = 'integracja')
 where category_id in (select id from categories where slug in ('seniorzy', 'sasiedzkie', 'impreza', 'dzieci'));

delete from categories where slug in ('seniorzy', 'sasiedzkie', 'impreza', 'dzieci');
