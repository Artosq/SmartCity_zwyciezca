# Sąsiedzko 🗺️

> Mapa miasta z wydarzeniami organizowanymi przez mieszkańców.
> Projekt na **HackYeah 2026**, kategoria otwarta **Smart City**.

Sąsiedzko to instalowalna aplikacja webowa (PWA), w której mieszkańcy dodają
sąsiedzkie wydarzenia na mapie: szkolny kiermasz ciast, urodziny seniora, studencka
impreza, spotkanie w domu kultury. Sąsiedzi je znajdują, zapisują się jednym
kliknięciem i rozmawiają na tematycznych czatach.

**Dlaczego Smart City:** pokazujemy, gdzie w mieście tętni życie sąsiedzkie, a gdzie
go brakuje, i obniżamy barierę wejścia dla oddolnych inicjatyw — wydarzenie powstaje
w minutę, także z jednego zdania napisanego lub podyktowanego przez AI.

---

## Status

🚧 Hackathon w toku (3–4.10.2026). Termin zgłoszenia: **niedziela 4.10, 11:00**.
Wersja online jest wdrażana od pierwszej godziny pracy.

🔗 Demo na żywo: https://smartcity-zwyciezca.onrender.com

---

## Produkt — co robi aplikacja

- **Strona główna** z propozycjami wydarzeń w mieście: najbliższe terminy,
  dopasowane do preferencji (grupy docelowe) i „lubiane przez innych" (najwięcej zapisanych).
  Karty ze zdjęciem wydarzenia, liczbą zapisanych, odległością i terminem. Odległość liczy się
  od użytkownika, jeśli zgodził się na lokalizację (pytamy dopiero po kliknięciu); inaczej od centrum miasta.
- **We dwoje** (przełącznik na stronie głównej): spacer, kawa, sport, rozmowa albo pomoc z zakupami z jedną osobą
  w miejscu publicznym. Ktoś proponuje, pierwsza chętna osoba klika „Idę" i obie dostają prywatny
  czat. Tylko dla zalogowanych dorosłych: wiek wynika z daty urodzenia w profilu, a baza nie
  zwraca spotkań osobom niepełnoletnim ani niezalogowanym.
- **„Pokaż się"** (przycisk na mapie): osoba wpisuje krótką notkę (do 80 znaków, np. „Biegam po
  Błoniach, dołącz!") i jej dokładne położenie staje się widoczne na mapie na żywo — do 60 minut
  albo do kliknięcia „Ukryj się". Kliknięcie osoby pokazuje notkę i przycisk „Dołączam": ta osoba
  dostaje komunikat i widzi położenie dołączającego, żeby mogli się odnaleźć. Tylko dla zalogowanych
  dorosłych (pilnuje baza); pasek „Jesteś live" jest na każdym ekranie. Osoby live mają na mapie
  czerwone, pulsujące pinezki z inicjałami i etykietą LIVE, a własna pinezka („TY") idzie za GPS.
- **Oceny organizatorów**: po terminie wydarzenia każda zapisana osoba może ocenić organizatora
  (0,5–5 gwiazdek, co pół), a po spotkaniu we dwoje obie osoby oceniają się nawzajem. Średnia jest
  widoczna na kartach wydarzeń i spotkań oraz na stronie Konto; bez ocen — „Nowy organizator".
- **Zasięg: Kraków.** Kolejne miasta są przygotowane w `src/data/cities.ts`, ale na razie wyłączone.
- **Mapa miasta**: pinezki wydarzeń łączą się w grupy z liczbą i rozwijają po przybliżeniu.
  Jeden przycisk „Filtry" otwiera menu: wiek (małe dzieci, starsze dzieci, młodzież, dorośli,
  seniorzy), dostępność dla osób z niepełnosprawnościami, cel wydarzenia (kategoria) oraz
  spotkania we dwoje z podziałem na rodzaje. Spotkania we dwoje widzą na mapie tylko
  zalogowani dorośli.
- **Dodawanie wydarzenia**: tytuł, opis, kategoria, grupy docelowe, miejsce na mapie,
  termin, limit miejsc, opcjonalne zdjęcie przesyłane z pliku (Supabase Storage, do 5 MB). Wszystkie wydarzenia są publiczne — każdy może dołączyć.
- **Szczegóły i zapis** jednym kliknięciem, licznik wolnych miejsc.
- **Bot importujący wydarzenia** (`npm run bot`): raz dziennie losuje kilka wydarzeń z Karnetu
  (miejski kalendarz Krakowa) zaczynających się w ciągu 3 dni, dobiera kategorię i grupy docelowe
  regułami słów kluczowych i dodaje je do bazy bez duplikatów, z linkiem do oryginału.
  Harmonogram: GitHub Actions (`.github/workflows/bot.yml`).
  Facebook — tylko przez oficjalne API, dla stron, które dadzą dostęp.
- **Logowanie bez haseł** (imię + e-mail / magic link).
- **PWA** — instalacja na ekranie głównym telefonu.
- **Czat w czasie rzeczywistym** — kanał dla każdej kategorii i każdego wydarzenia.
- **Tablica ogłoszeń** — krótkie wpisy z kategorią i lokalizacją.

### Wyróżniki (robimy po domknięciu podstaw 1–5)

1. **Wydarzenie z jednego zdania** — „urodziny babci w sobotę o 15 w parku Jordana,
   do 10 osób" → AI wypełnia formularz.
2. **Podpowiedź miejsca** — lista bezpłatnych przestrzeni miejskich (biblioteki,
   domy kultury, kluby seniora) pasujących do wydarzenia.
3. **Widok dla miasta** — mapa aktywności dzielnic.

### Poza zakresem (świadomie)

Płatności, powiadomienia push, aplikacje natywne, rozbudowane profile, panel admina.

---

## Architektura

Prosty, możliwy do obrony stack — bez zbędnych warstw.

| Warstwa      | Technologia                                           |
|--------------|-------------------------------------------------------|
| Frontend     | **React + Vite + TypeScript + MUI (Material UI)**     |
| Mapa         | **Leaflet + OpenStreetMap**, grupowanie pinezek       |
| Backend/dane | **Supabase** — Postgres, Auth (magic link), Realtime  |
| Hosting      | **Render** (Static Site); build kopiuje `index.html` do folderów podstron, żeby odświeżenie `/mapa/` działało bez reguł serwera |
| PWA          | manifest + ikony (instalacja na telefonie); bez trybu offline |

**Jak to działa:** aplikacja React (SPA budowana przez Vite) działa w przeglądarce,
dane leżą w Postgresie Supabase. Dostęp do danych pilnuje **Row Level Security** (RLS)
— adres prywatny nie wycieka do nieuprawnionych. Czat korzysta z Supabase Realtime
(subskrypcja zmian w tabeli `messages`). Sekrety trzymamy wyłącznie w zmiennych
środowiskowych.

### Wymagania produktowe

Mobile-first, interfejs po polsku, duże i czytelne elementy (korzystają też seniorzy),
dobry kontrast, pełna obsługa klawiaturą. Nawigacja: dolny pasek na telefonie, górny na komputerze
(same ikony na średnich ekranach). Karuzele: na telefonie swobodne przewijanie palcem, na komputerze
strzałki po bokach. Grupy docelowe mają własne ikony i kolory (rozróżnialne nie tylko barwą).
Płynne przejścia między ekranami, wejścia elementów po kolei i subtelne animacje przycisków,
wyłączane przy systemowym ustawieniu ograniczenia ruchu.

### Model danych

```
profiles        — id (=auth.users.id), name, email, rating_avg, rating_count, created_at
profile_private — id→profiles, birth_date (widoczna tylko dla właściciela)
live_presence   — user_id→profiles (PK), note, lat, lng, updated_at, expires_at
live_joins      — target_id→live_presence, joiner_id→profiles, lat, lng, updated_at  [PK(target, joiner)]
ratings         — id, rater_id→profiles, ratee_id→profiles, scope(event|meetup), scope_id, stars,
                  created_at  [UNIQUE(rater_id, scope, scope_id)]
categories      — id, slug, name, color, icon
events          — id, organizer_id→profiles, title, description, category_id→categories,
                  city, lat, lng, place_name, starts_at, capacity, target_groups[],
                  image_url, involves_children, source, source_url, external_id, created_at
event_addresses — event_id→events, address_private
meetups         — id, host_id→profiles, guest_id→profiles (null = wolne), type, title, description,
                  city, lat, lng, place_name, starts_at, duration_min, tags[], created_at
rsvps           — id, event_id→events, user_id→profiles, created_at  [UNIQUE(event_id,user_id)]
messages        — id, scope(category|event), scope_id, user_id→profiles, content,
                  created_at, is_hidden
message_reports — id, message_id→messages, reporter_id→profiles, reason, created_at
announcements   — id, author_id→profiles, category_id→categories, title, body,
                  lat, lng, place_name, created_at
```

Relacje: `profiles` 1—N `events`/`rsvps`/`messages`/`announcements`;
`categories` 1—N `events`/`announcements`/(kanał) `messages`;
`events` 1—N `rsvps`/(kanał) `messages`; `messages` 1—N `message_reports`.

### Ekrany

| Trasa              | Ekran                                                        |
|--------------------|-------------------------------------------------------------|
| `/`                | Strona główna z przełącznikiem: wydarzenia (chipy preferencji + karuzele) albo „We dwoje" (`?widok=1na1`) |
| `/mapa`            | Mapa miasta z grupowanymi pinezkami wydarzeń i spotkań we dwoje (18+), menu filtrów, rozwijana karta wydarzenia |
| `/dodaj`           | Dodawanie wydarzenia albo propozycji spotkania we dwoje (wybór miejsca na mapie) |
| `/login`           | Logowanie bez hasła (imię + e-mail / magic link); Konto: data urodzenia, własna ocena, lista „Do oceny" |
| `/czat`            | Czat w czasie rzeczywistym _(w budowie)_                    |
| `/ogloszenia`      | Tablica ogłoszeń _(w budowie)_                              |
| `/miasto`          | _(wyróżnik)_ mapa aktywności dzielnic                        |

---

## Bezpieczeństwo i dane

- **Brak prawdziwych danych osobowych.** Wymyślone wydarzenia demo (`supabase/seed.sql`)
  osadzone w prawdziwych miejscach.
- **Wszystkie wydarzenia są publiczne** — widoczne na mapie, każdy zalogowany może dołączyć.
- **Dokładny adres prywatny** widoczny dopiero po zapisie (egzekwowane przez RLS).
- **Czat**: zgłaszanie wiadomości + prosty filtr wulgaryzmów.
- **Sekrety** wyłącznie w zmiennych środowiskowych, nigdy w repozytorium.

---

## Podział pracy (4 osoby, równolegle)

Każda osoba jest właścicielem osobnych folderów — minimalizujemy konflikty w gicie.

- **A (lead / fundament)** — szkielet, deploy Vercel, schemat Supabase + migracje + RLS,
  logowanie, PWA, wspólne typy i komponenty UI (`src/lib`, `supabase`, `src/components`).
- **B (mapa)** — Leaflet, pinezki, filtry, `/` i pasek wydarzenia (`src/components/map`).
- **C (wydarzenia)** — formularz `/dodaj`, zapisy (RSVP), licznik, widoczność/adres.
- **D (społeczność)** — czat realtime `/czat`, ogłoszenia `/ogloszenia`, moderacja.

---

## Kamienie milowe

- **18:00** — mapa, dodawanie wydarzenia i zapis działają pod publicznym linkiem.
- **21:30** — czat i ogłoszenia.
- **23:30** — jeden wyróżnik, dane demo, koniec nowych funkcji.
- **Niedziela rano** — tylko slajdy i krytyczne poprawki.

---

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env.local   # uzupełnij klucze Supabase
npm run dev                  # http://localhost:5173
npm run typecheck            # sprawdzenie typów (build go nie uruchamia, żeby nie blokować wdrożeń)
```

Baza: w Supabase → SQL Editor uruchom `supabase/schema.sql` (świeża baza) albo migracje
z `supabase/migrations/` (baza ze starszego schematu), a potem `supabase/seed.sql`.
Bot: po migracjach `003_bot_import.sql` i `004_service_role_grants.sql` oraz dodaniu `SUPABASE_SERVICE_ROLE_KEY` uruchom `npm run bot`
(`npm run bot -- --dry` tylko wypisuje wylosowane wydarzenia, `-- --count=3` ustawia ich liczbę).
Codzienne uruchamianie: dodaj sekrety `VITE_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY`
w GitHub → Settings → Secrets and variables → Actions.
Seed sam tworzy 12 kont demo, 25 wydarzeń i zapisy — nie wymaga wcześniejszego logowania.

Zmienne środowiskowe (`.env.local`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=       # klucz publishable (publiczny)
SUPABASE_SERVICE_ROLE_KEY=    # tylko dla bota (npm run bot) — tajny, nigdy w repo
FACEBOOK_PAGE_IDS=            # opcjonalnie: strony, które dały botowi dostęp
FACEBOOK_ACCESS_TOKEN=        # opcjonalnie: token do Graph API
```

---

## Użyte narzędzia AI, biblioteki i źródła danych

_(utrzymujemy tę listę na bieżąco — wymóg regulaminu: rozumiemy i bronimy każdej decyzji)_

**Narzędzia AI**
- Claude Code (Anthropic) — wsparcie przy pisaniu kodu.
- _(do uzupełnienia)_ model LLM do funkcji „wydarzenie z jednego zdania".

**Główne biblioteki**
- React, Vite, TypeScript, MUI (Material UI), React Router
- Leaflet + react-leaflet, react-leaflet-cluster (grupowanie pinezek)
- @supabase/supabase-js

**Źródła danych**
- OpenStreetMap — kafelki mapy.
- Dane wydarzeń: wymyślone na potrzeby demo, osadzone w prawdziwych lokalizacjach.
- Wydarzenia importowane przez bota: Karnet (karnet.krakowculture.pl, Krakowskie Biuro Festiwalowe)
  — publiczna lista wydarzeń, każde z linkiem do oryginału.
- Ilustracje kategorii (`public/img/events/`): własne grafiki SVG, używane gdy wydarzenie nie ma zdjęcia.

---

## Zespół

HackYeah 2026 — 4-osobowy zespół, kategoria Smart City.
