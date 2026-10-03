-- ============================================================
-- Sąsiedzko — dane demo (wymyślone osoby i wydarzenia w prawdziwych miejscach)
-- Wklej całość do: Supabase → SQL Editor → New query → Run
--
-- Tworzy: 12 kont demo (demo1…12@sasiedzko.example, bez możliwości logowania),
--         25 wydarzeń w 7 miastach oraz zapisy (rsvps) o różnej liczebności,
--         żeby sekcja „Lubiane przez innych" miała co sortować.
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
      ('krakow', 'Poranek z bajkami dla maluchów', 'Wspólne czytanie bajek i zabawy ruchowe na trawie.', 'dzieci', 50.0625, 19.9170, 'Park Jordana', 2, time '10:00', 15, array['male-dzieci'], 9),
      ('krakow', 'Sąsiedzki turniej piłkarski', 'Mecze 5 na 5, drużyny losujemy na miejscu.', 'sport', 50.0597, 19.9120, 'Błonia', 2, time '15:00', 30, array['starsze-dzieci','mlodziez'], 12),
      ('krakow', 'Klub książki: kryminały', 'Rozmawiamy o ulubionych kryminałach przy herbacie.', 'edukacja', 50.0638, 19.9290, 'Wojewódzka Biblioteka Publiczna, ul. Rajska', 4, time '18:00', 12, array['dorosli','seniorzy'], 5),
      ('krakow', 'Potańcówka dla seniorów', 'Muzyka na żywo, kawa i ciasto.', 'seniorzy', 50.0718, 20.0370, 'Nowohuckie Centrum Kultury', 3, time '16:00', 40, array['seniorzy'], 11),
      ('krakow', 'Spacer bez barier po Plantach', 'Trasa dostępna dla wózków, z przewodnikiem i tłumaczem PJM.', 'sasiedzkie', 50.0655, 19.9416, 'Planty, okolice Barbakanu', 9, time '11:00', 20, array['niepelnosprawni','seniorzy','dorosli'], 7),
      ('krakow', 'Wieczór planszówek', 'Przynieś swoją grę albo zagraj w nasze.', 'sasiedzkie', 50.0445, 19.9545, 'Centrum Kultury Podgórza', 1, time '18:30', 24, array['mlodziez','dorosli'], 10),
      ('krakow', 'Rodzinny piknik z latawcami', 'Robimy i puszczamy latawce. Materiały na miejscu.', 'dzieci', 50.0410, 19.9470, 'Park Bednarskiego', 10, time '12:00', 25, array['male-dzieci','starsze-dzieci','dorosli'], 8),
      ('krakow', 'Joga o poranku', 'Spokojna praktyka dla początkujących. Weź matę.', 'sport', 50.0530, 19.9330, 'Bulwary Wiślane pod Wawelem', 3, time '08:00', 20, array['dorosli'], 4),
      ('krakow', 'Warsztaty graffiti', 'Podstawy malowania sprayem na legalnej ścianie.', 'kultura', 50.0790, 20.0480, 'Zalew Nowohucki', 16, time '14:00', 10, array['mlodziez'], 6),
      ('krakow', 'Podchody w parku', 'Gra terenowa z zagadkami dla dzieci ze szkoły podstawowej.', 'dzieci', 50.0690, 19.9250, 'Park Krakowski', 9, time '15:00', 18, array['starsze-dzieci'], 3),
      ('krakow', 'Sąsiedzka potańcówka pod chmurką', 'DJ z osiedla, parkiet na trawie, lemoniada.', 'impreza', 50.0560, 19.9560, 'Bulwar Kurlandzki', 5, time '19:00', 60, array['mlodziez','dorosli'], 12),
      ('krakow', 'Koncert chóru osiedlowego', 'Piosenki z dawnych lat, wspólne śpiewanie.', 'kultura', 50.0870, 19.9300, 'Park Krowoderski', 6, time '17:00', 50, array['seniorzy','dorosli'], 2),
      -- Warszawa
      ('warszawa', 'Piknik sąsiedzki', 'Każdy przynosi coś do jedzenia, koce mile widziane.', 'sasiedzkie', 52.2130, 21.0000, 'Pole Mokotowskie', 2, time '13:00', 50, array['dorosli','male-dzieci'], 10),
      ('warszawa', 'Nordic walking dla seniorów', 'Spokojne tempo, kijki do wypożyczenia.', 'seniorzy', 52.2152, 21.0355, 'Łazienki Królewskie', 5, time '10:00', 15, array['seniorzy'], 6),
      ('warszawa', 'Kino plenerowe', 'Polska komedia na dużym ekranie, leżaki na miejscu.', 'kultura', 52.2400, 21.0300, 'Bulwary Wiślane', 4, time '20:00', 80, array['mlodziez','dorosli'], 12),
      -- Wrocław
      ('wroclaw', 'Koncert akustyczny na wyspie', 'Lokalne zespoły, wstęp wolny.', 'impreza', 51.1160, 17.0370, 'Wyspa Słodowa', 8, time '19:00', 80, array['mlodziez','dorosli'], 11),
      ('wroclaw', 'Zabawy sensoryczne dla maluchów', 'Zajęcia przyjazne dzieciom z niepełnosprawnościami.', 'dzieci', 51.1130, 17.0800, 'Park Szczytnicki', 3, time '11:00', 12, array['male-dzieci','niepelnosprawni'], 5),
      -- Gdańsk
      ('gdansk', 'Plener malarski', 'Malujemy jesienny park. Sztalugi zapewniamy.', 'kultura', 54.4105, 18.5610, 'Park Oliwski', 10, time '11:00', 15, array['dorosli','seniorzy'], 7),
      ('gdansk', 'Bieg na orientację', 'Mapa, kompas i punkty kontrolne w parku.', 'sport', 54.4080, 18.6190, 'Park Reagana', 16, time '10:00', 30, array['starsze-dzieci','mlodziez'], 9),
      -- Poznań
      ('poznan', 'Wspólne sadzenie krokusów', 'Cebulki i łopatki na miejscu.', 'sasiedzkie', 52.4215, 16.9350, 'Park Cytadela', 9, time '10:00', 40, array['starsze-dzieci','dorosli','seniorzy'], 8),
      ('poznan', 'Rolki nad Maltą', 'Wspólna przejażdżka dookoła jeziora.', 'sport', 52.4020, 16.9700, 'Jezioro Maltańskie', 3, time '16:00', 25, array['mlodziez'], 4),
      -- Łódź
      ('lodz', 'Wymiana roślin doniczkowych', 'Przynieś sadzonkę, weź sadzonkę.', 'sasiedzkie', 51.7795, 19.4480, 'Manufaktura, rynek', 2, time '12:00', 60, array['dorosli'], 10),
      ('lodz', 'Gimnastyka na krzesłach', 'Ćwiczenia dla osób o ograniczonej sprawności ruchowej.', 'seniorzy', 51.7640, 19.4850, 'Park Źródliska', 6, time '10:30', 16, array['seniorzy','niepelnosprawni'], 6),
      -- Katowice
      ('katowice', 'Rodzinna wycieczka rowerowa', 'Łatwa trasa wokół stawów, tempo dziecięce.', 'sport', 50.2420, 19.0420, 'Dolina Trzech Stawów', 10, time '11:00', 20, array['starsze-dzieci','dorosli'], 7),
      ('katowice', 'Teatrzyk kukiełkowy', 'Krótkie przedstawienie i warsztat robienia kukiełek.', 'dzieci', 50.2640, 19.0280, 'Strefa Kultury', 17, time '12:00', 30, array['male-dzieci'], 9)
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
end $$;
