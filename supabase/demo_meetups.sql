-- ============================================================
-- Demo: spotkania we dwoje (We dwoje) — do wklejenia raz w Supabase → SQL Editor → Run.
-- Samowystarczalny: tworzy własne konta-hosty (mhost1..8@sasiedzko.example), jeśli ich nie ma,
-- i dodaje kilka wolnych propozycji 1:1 z datami w najbliższych dniach. Nie rusza innych kont.
-- Można uruchamiać wielokrotnie. Wymaga migracji 005/006/007.
-- Widoczne na mapie/stronie „We dwoje" tylko dla zalogowanych dorosłych
-- (konto demo z ekranu logowania jest od razu pełnoletnie).
-- ============================================================

do $$
declare
  host_names text[] := array['Anna','Piotr','Kasia','Marek','Zofia','Tomek','Ewa','Jan'];
  host_ids uuid[] := '{}';
  uid uuid;
  i int;
begin
  -- 1) Konta-hosty: twórz tylko brakujące (trigger on_auth_user_created zakłada profil).
  for i in 1..array_length(host_names, 1) loop
    select id into uid from auth.users where email = 'mhost' || i || '@sasiedzko.example';
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
         confirmation_token, recovery_token, email_change, email_change_token_new)
      values
        ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
         'mhost' || i || '@sasiedzko.example', '', now(),
         '{"provider":"email","providers":["email"]}', jsonb_build_object('name', host_names[i]),
         now(), now(), '', '', '', '');
      -- zabezpieczenie, gdyby triggera nie było
      insert into profiles (id, name) values (uid, host_names[i]) on conflict (id) do nothing;
    end if;
    host_ids := host_ids || uid;
  end loop;

  -- 2) Czyścimy poprzednie demo-spotkania, żeby skrypt można było uruchamiać wielokrotnie.
  delete from meetups where description like '[demo]%';

  -- 3) Propozycje 1:1 (wszystkie wolne — czekają na chętną osobę).
  insert into meetups
    (host_id, type, title, description, city, lat, lng, place_name, starts_at, duration_min, tags)
  select
    host_ids[v.host], v.type, v.title, '[demo] ' || v.description, 'krakow', v.lat, v.lng, v.place_name,
    (date_trunc('day', now() at time zone 'Europe/Warsaw')
      + v.day_offset * interval '1 day' + v.start_time::interval) at time zone 'Europe/Warsaw',
    v.duration_min, v.tags
  from (values
    (1, 'spacer', 'Spacer z psem po Błoniach', 'Chodzę z Fafikiem codziennie, chętnie w towarzystwie.', 50.0597, 19.9120, 'Błonia, wejście od ul. Piastowskiej', 1, time '18:00', 45, array['Z psem','Bezpłatnie']),
    (2, 'kawa', 'Wspólna kawa na Kazimierzu', 'Nowa w okolicy, szukam kogoś do pogadania przy kawie.', 50.0515, 19.9460, 'Plac Nowy', 1, time '10:30', 60, array['Kawiarnia']),
    (3, 'sport', 'Bieganie wokół Błoń', 'Spokojne tempo, jedno okrążenie, czyli około 3,5 km.', 50.0590, 19.9150, 'Błonia, przy Cichym Kąciku', 2, time '07:00', 45, array['Początkujący','Bezpłatnie']),
    (4, 'rozmowa', 'Rozmowa na ławce na Plantach', 'Emerytowana nauczycielka, lubię rozmawiać o książkach.', 50.0655, 19.9416, 'Planty, okolice Barbakanu', 2, time '11:00', 60, array['Bezpłatnie']),
    (5, 'spacer', 'Spacer po Lasku Wolskim', 'Trasa do Kopca Piłsudskiego i z powrotem.', 50.0560, 19.8520, 'Lasek Wolski, parking przy ZOO', 3, time '10:00', 90, array['Bezpłatnie']),
    (6, 'kawa', 'Herbata i planszówka w Nowej Hucie', 'Mam ze sobą Carcassonne, szukam drugiej osoby do gry.', 50.0718, 20.0370, 'Nowohuckie Centrum Kultury, kawiarnia', 3, time '17:00', 90, array['Planszówki']),
    (7, 'sport', 'Ping-pong w Parku Jordana', 'Mam dwie rakietki i piłeczki, stoły są na miejscu.', 50.0625, 19.9170, 'Park Jordana, stoły do ping-ponga', 4, time '16:00', 60, array['Bezpłatnie']),
    (8, 'zakupy', 'Wspólne zakupy na Starym Kleparzu', 'Pokażę, gdzie są najlepsze warzywa, i pomogę nieść torby.', 50.0672, 19.9395, 'Stary Kleparz, wejście od ul. Basztowej', 5, time '09:00', 45, array['Pomoc sąsiedzka'])
  ) as v(host, type, title, description, lat, lng, place_name, day_offset, start_time, duration_min, tags);
end $$;

-- Sprawdzenie:
select type, title, place_name, starts_at from meetups where description like '[demo]%' order by starts_at;
