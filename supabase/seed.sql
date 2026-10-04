-- ============================================================
-- Sąsiedzko — dane demo (wymyślone osoby i wydarzenia w prawdziwych miejscach)
-- Wklej całość do: Supabase → SQL Editor → New query → Run
--
-- Tworzy: 12 kont demo (demo1…12@sasiedzko.example, bez możliwości logowania),
--         25 wydarzeń w 7 miastach oraz zapisy (rsvps) o różnej liczebności,
--         żeby sekcja „Lubiane przez innych" miała co sortować,
--         oraz 8 spotkań we dwoje w Krakowie i przykładowe oceny organizatorów
--         (wymaga migracji 005_meetups.sql i 006_age_and_ratings.sql).
-- Skrypt można uruchamiać wielokrotnie: najpierw usuwa poprzednie konta demo,
-- a razem z nimi (kaskadowo) ich wydarzenia i zapisy.
-- Terminy są liczone względem dnia uruchomienia, godziny w czasie polskim.
-- ============================================================

-- Kolumny, których seed potrzebuje (bezpieczne, jeśli już istnieją).
alter table events add column if not exists target_groups text[] not null default '{}';
alter table events add column if not exists city text;
alter table events add column if not exists image_url text;

do $$
declare
  names text[] := array['Anna','Piotr','Kasia','Marek','Zofia','Tomek',
                        'Ewa','Jan','Ola','Michał','Halina','Staszek'];
  demo_ids uuid[] := '{}';
  uid uuid;
  eid uuid;
  i int;
  n int := 0;
  r record;
begin
  delete from auth.users where email like 'demo%@sasiedzko.example';

  for i in 1..array_length(names, 1) loop
    uid := gen_random_uuid();
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
       confirmation_token, recovery_token, email_change, email_change_token_new)
    values
      ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
       'demo' || i || '@sasiedzko.example', '', now(),
       '{"provider":"email","providers":["email"]}', jsonb_build_object('name', names[i]),
       now(), now(), '', '', '', '');
    -- profil zwykle tworzy trigger on_auth_user_created; to zabezpieczenie, gdyby go nie było
    insert into profiles (id, name, email)
    values (uid, names[i], 'demo' || i || '@sasiedzko.example')
    on conflict (id) do nothing;
    demo_ids := demo_ids || uid;
  end loop;

  for r in
    select * from (values
      -- Kraków
      ('krakow', 'Poranek z bajkami dla maluchów', 'Wspólne czytanie bajek i zabawy ruchowe na trawie.', 'kulturaundefined
      ('krakow', 'Sąsiedzki turniej piłkarski', 'Mecze 5 na 5, drużyny losujemy na miejscu.', 'sport', 50.0597, 19.9120, 'Błonia', 2, time '15:00', 30, array['starsze-dzieci','mlodziez'], 12),
      ('krakow', 'Klub książki: kryminały', 'Rozmawiamy o ulubionych kryminałach przy herbacie.', 'edukacja', 50.0638, 19.9290, 'Wojewódzka Biblioteka Publiczna, ul. Rajska', 4, time '18:00', 12, array['dorosli','seniorzy'], 5),
      ('krakow', 'Potańcówka dla seniorów', 'Muzyka na żywo, kawa i ciasto.', 'celebracjaundefined
      ('krakow', 'Spacer bez barier po Plantach', 'Trasa dostępna dla wózków, z przewodnikiem i tłumaczem PJM.', 'rekreacjaundefined
      ('krakow', 'Wieczór planszówek', 'Przynieś swoją grę albo zagraj w nasze.', 'rekreacjaundefined
      ('krakow', 'Rodzinny piknik z latawcami', 'Robimy i puszczamy latawce. Materiały na miejscu.', 'rekreacjaundefined
      ('krakow', 'Joga o poranku', 'Spokojna praktyka dla początkujących. Weź matę.', 'sport', 50.0530, 19.9330, 'Bulwary Wiślane pod Wawelem', 3, time '08:00', 20, array['dorosli'], 4),
      ('krakow', 'Warsztaty graffiti', 'Podstawy malowania sprayem na legalnej ścianie.', 'kultura', 50.0790, 20.0480, 'Zalew Nowohucki', 16, time '14:00', 10, array['mlodziez'], 6),
      ('krakow', 'Podchody w parku', 'Gra terenowa z zagadkami dla dzieci ze szkoły podstawowej.', 'rekreacjaundefined
      ('krakow', 'Sąsiedzka potańcówka pod chmurką', 'DJ z osiedla, parkiet na trawie, lemoniada.', 'celebracjaundefined
      ('krakow', 'Koncert chóru osiedlowego', 'Piosenki z dawnych lat, wspólne śpiewanie.', 'kultura', 50.0870, 19.9300, 'Park Krowoderski', 6, time '17:00', 50, array['seniorzy','dorosli'], 2),
      -- Warszawa
      ('warszawa', 'Piknik sąsiedzki', 'Każdy przynosi coś do jedzenia, koce mile widziane.', 'integracjaundefined
      ('warszawa', 'Nordic walking dla seniorów', 'Spokojne tempo, kijki do wypożyczenia.', 'sportundefined
      ('warszawa', 'Kino plenerowe', 'Polska komedia na dużym ekranie, leżaki na miejscu.', 'kultura', 52.2400, 21.0300, 'Bulwary Wiślane', 4, time '20:00', 80, array['mlodziez','dorosli'], 12),
      -- Wrocław
      ('wroclaw', 'Koncert akustyczny na wyspie', 'Lokalne zespoły, wstęp wolny.', 'kulturaundefined
      ('wroclaw', 'Zabawy sensoryczne dla maluchów', 'Zajęcia przyjazne dzieciom z niepełnosprawnościami.', 'rekreacjaundefined
      -- Gdańsk
      ('gdansk', 'Plener malarski', 'Malujemy jesienny park. Sztalugi zapewniamy.', 'kultura', 54.4105, 18.5610, 'Park Oliwski', 10, time '11:00', 15, array['dorosli','seniorzy'], 7),
      ('gdansk', 'Bieg na orientację', 'Mapa, kompas i punkty kontrolne w parku.', 'sport', 54.4080, 18.6190, 'Park Reagana', 16, time '10:00', 30, array['starsze-dzieci','mlodziez'], 9),
      -- Poznań
      ('poznan', 'Wspólne sadzenie krokusów', 'Cebulki i łopatki na miejscu.', 'integracjaundefined
      ('poznan', 'Rolki nad Maltą', 'Wspólna przejażdżka dookoła jeziora.', 'sport', 52.4020, 16.9700, 'Jezioro Maltańskie', 3, time '16:00', 25, array['mlodziez'], 4),
      -- Łódź
      ('lodz', 'Wymiana roślin doniczkowych', 'Przynieś sadzonkę, weź sadzonkę.', 'integracjaundefined
      ('lodz', 'Gimnastyka na krzesłach', 'Ćwiczenia dla osób o ograniczonej sprawności ruchowej.', 'sportundefined
      -- Katowice
      ('katowice', 'Rodzinna wycieczka rowerowa', 'Łatwa trasa wokół stawów, tempo dziecięce.', 'sport', 50.2420, 19.0420, 'Dolina Trzech Stawów', 10, time '11:00', 20, array['starsze-dzieci','dorosli'], 7),
      ('katowice', 'Teatrzyk kukiełkowy', 'Krótkie przedstawienie i warsztat robienia kukiełek.', 'kulturaundefined
    ) as v(city, title, description, category, lat, lng, place_name, day_offset, start_time, capacity, target_groups, signups)
  loop
    n := n + 1;
    insert into events
      (organizer_id, title, description, category_id, city, lat, lng, place_name,
       starts_at, capacity, target_groups)
    values
      (demo_ids[1 + n % array_length(demo_ids, 1)], r.title, r.description,
       (select id from categories where slug = r.category),
       r.city, r.lat, r.lng, r.place_name,
       (date_trunc('day', now() at time zone 'Europe/Warsaw')
         + r.day_offset * interval '1 day' + r.start_time::interval) at time zone 'Europe/Warsaw',
       r.capacity, r.target_groups)
    returning id into eid;

    -- zapisy: pierwszych `signups` kont demo
    insert into rsvps (event_id, user_id)
    select eid, unnest(demo_ids[1:r.signups]);
  end loop;

  -- Spotkania we dwoje (wymaga migracji 005_meetups.sql). Wszystkie wolne — czekają na chętną osobę.
  insert into meetups
    (host_id, type, title, description, city, lat, lng, place_name, starts_at, duration_min, tags)
  select
    demo_ids[v.host], v.type, v.title, '[demo] ' || v.description, 'krakow', v.lat, v.lng, v.place_name,
    (date_trunc('day', now() at time zone 'Europe/Warsaw')
      + v.day_offset * interval '1 day' + v.start_time::interval) at time zone 'Europe/Warsaw',
    v.duration_min, v.tags
  from (values
    (6, 'spacer', 'Spacer z psem po Błoniach', 'Chodzę z Fafikiem codziennie, chętnie w towarzystwie.', 50.0597, 19.9120, 'Błonia, wejście od ul. Piastowskiej', 1, time '18:00', 45, array['Z psem','Bezpłatnie']),
    (3, 'kawa', 'Wspólna kawa na Kazimierzu', 'Nowa w okolicy, szukam kogoś do pogadania przy kawie.', 50.0515, 19.9460, 'Plac Nowy', 1, time '10:30', 60, array['Kawiarnia']),
    (4, 'sport', 'Bieganie wokół Błoń', 'Spokojne tempo, jedno okrążenie, czyli około 3,5 km.', 50.0590, 19.9150, 'Błonia, przy Cichym Kąciku', 2, time '07:00', 45, array['Początkujący','Bezpłatnie']),
    (5, 'rozmowa', 'Rozmowa na ławce na Plantach', 'Emerytowana nauczycielka, lubię rozmawiać o książkach.', 50.0655, 19.9416, 'Planty, okolice Barbakanu', 2, time '11:00', 60, array['Bezpłatnie']),
    (8, 'spacer', 'Spacer po Lasku Wolskim', 'Trasa do Kopca Piłsudskiego i z powrotem.', 50.0560, 19.8520, 'Lasek Wolski, parking przy ZOO', 3, time '10:00', 90, array['Bezpłatnie']),
    (9, 'kawa', 'Herbata i planszówka w Nowej Hucie', 'Mam ze sobą Carcassonne, szukam drugiej osoby do gry.', 50.0718, 20.0370, 'Nowohuckie Centrum Kultury, kawiarnia', 3, time '17:00', 90, array['Planszówki']),
    (10, 'sport', 'Ping-pong w Parku Jordana', 'Mam dwie rakietki i piłeczki, stoły są na miejscu.', 50.0625, 19.9170, 'Park Jordana, stoły do ping-ponga', 4, time '16:00', 60, array['Bezpłatnie']),
    (11, 'inne', 'Wspólne zakupy na Starym Kleparzu', 'Pokażę, gdzie są najlepsze warzywa, i pomogę nieść torby.', 50.0672, 19.9395, 'Stary Kleparz, wejście od ul. Basztowej', 5, time '09:00', 45, array['Pomoc sąsiedzka'])
  ) as v(host, type, title, description, lat, lng, place_name, day_offset, start_time, duration_min, tags);

  -- Przykładowe oceny organizatorów (wymaga migracji 006_age_and_ratings.sql):
  -- każdy zapisany uczestnik demo ocenia organizatora na 3,5–5 gwiazdek.
  -- Średnie w profilach przelicza trigger on_rating_change.
  insert into ratings (rater_id, ratee_id, scope, scope_id, stars)
  select r.user_id, e.organizer_id, 'event', e.id,
         (array[3.5, 4, 4.5, 5, 5])[1 + abs(hashtext(r.user_id::text || e.id::text)) % 5]
    from rsvps r
    join events e on e.id = r.event_id
   where e.description like '[demo]%'
     and r.user_id <> e.organizer_id;
end $$;
