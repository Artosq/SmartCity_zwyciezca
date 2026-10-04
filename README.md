# Sąsiedzko 🗺️

> Mapa miasta z wydarzeniami organizowanymi przez mieszkańców.
> Projekt na **HackYeah 2026**, kategoria otwarta **Smart City**.

Sąsiedzko to instalowalna aplikacja webowa (PWA), w której mieszkańcy dodają
sąsiedzkie wydarzenia na mapie: szkolny kiermasz ciast, urodziny seniora, studencka
impreza, spotkanie w domu kultury. Sąsiedzi je znajdują, zapisują się jednym
kliknięciem i rozmawiają na tematycznych czatach.

**Dlaczego Smart City:** pokazujemy, gdzie w mieście tętni życie sąsiedzkie, a gdzie
go brakuje, i obniżamy barierę wejścia dla oddolnych inicjatyw — wydarzenie powstaje
w minutę. W planach: tworzenie wydarzenia z jednego zdania przez AI (opis niżej, jeszcze niewdrożone).

---

## Status

🚧 Hackathon w toku (3–4.10.2026). Termin zgłoszenia: **niedziela 4.10, 11:00**.
Wersja online jest wdrażana od pierwszej godziny pracy.

🔗 Demo na żywo: https://smartcity-zwyciezca.onrender.com

---

## Produkt — co robi aplikacja

- **Strona główna** z propozycjami wydarzeń w mieście: najbliższe terminy,
  dopasowane do preferencji (grupy docelowe) i „lubiane przez innych" (najwięcej zapisanych).
  Wydarzenie znika ze strony głównej i z mapy 3 godziny po rozpoczęciu (baza nie przechowuje godziny zakończenia).
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
- **Pomoc** (w nawigacji zamiast tablicy ogłoszeń): najczęstsze pytania z rozwijanymi odpowiedziami,
  wyszukiwarka oraz formularze „Napisz do nas" i „Zgłoś błąd" zapisywane w bazie.
- **Bezpieczna sieć** (`/bezpieczna-siec`, w menu „Więcej" i na stronie Pomoc): sekcja edukacyjna dla seniorów
  oraz dzieci i młodzieży. Trzy kroki przed kliknięciem, sposoby działania oszustów z przykładowymi zdaniami,
  lista danych, których nie wolno podawać, krótkie lekcje krok po kroku z zapamiętywanym postępem,
  quiz „Sprawdź swoją czujność" oraz plan „Co zrobić, gdy coś się stało" z numerami alarmowymi.
  Treści w trzech wariantach (wszyscy, seniorzy, dzieci i młodzież) w `src/data/safety.ts`.
- **Panel administratora** (`/admin`, bez linku w aplikacji): kolejka zgłoszeń od użytkowników,
  automatyczne flagi (wulgaryzmy na czacie, zalew wiadomości, wielokrotnie zgłaszane osoby, niskie oceny),
  wgląd w czaty wydarzeń, ukrywanie i przywracanie treści, bany czasowe i bezterminowe z powodem,
  odpowiedzi na wiadomości z Pomocy, nadawanie uprawnień i dziennik działań. Uprawnień pilnuje baza.
  Prywatne czaty „We dwoje" są dostępne dla admina tylko po zgłoszeniu przez jedną z dwóch osób.
- **Filtr wulgaryzmów**: wydarzenia, spotkania i notki „Pokaż się" z wulgaryzmami są odrzucane
  w formularzu i dodatkowo przez bazę, więc filtra nie da się obejść.
- **Zgłaszanie**: przycisk „Zgłoś" przy wiadomościach, wydarzeniach, spotkaniach i osobach na mapie.
- **Konto demo** (tymczasowe, na prezentację): przycisk na ekranie logowania tworzy anonimowe konto
  bez e-maila, od razu pełnoletnie — do sprawdzania wszystkich funkcji. Wymaga włączenia
  anonimowych logowań w Supabase; przed prawdziwym uruchomieniem do usunięcia.
- **Logowanie bez haseł** (imię + e-mail / magic link).
- **PWA** — instalacja na ekranie głównym telefonu.
- **Czat w czasie rzeczywistym** — kanał dla każdej kategorii i każdego wydarzenia.

### Wyróżniki (zaplanowane — jeszcze niewdrożone)

1. **Wydarzenie z jednego zdania** — „urodziny babci w sobotę o 15 w parku Jordana,
   do 10 osób" → AI wypełnia formularz.
2. **Podpowiedź miejsca** — lista bezpłatnych przestrzeni miejskich (biblioteki,
   domy kultury, kluby seniora) pasujących do wydarzenia.
3. **Widok dla miasta** — mapa aktywności dzielnic.

### Poza zakresem (świadomie)

Płatności, powiadomienia push, aplikacje natywne, rozbudowane profile.

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

**Dostępność (WCAG 2.1).** Zwykły wygląd spełnia poziom AA: kontrast tekstu co najmniej 4,5:1, ikon
i obramowań pól 3:1, widoczny fokus, łącze „Przejdź do treści", tytuł karty zależny od ekranu, brak
wymuszonej orientacji. **Tryb dla seniorów** (Ustawienia albo menu „Więcej") dodaje: tekst i ikony
większe o 25%, kontrast na poziomie AAA (7:1), podkreślone linki, większe odstępy, brak animacji
i podpisy przy ikonach nawigacji.

Mobile-first, interfejs po polsku, duże i czytelne elementy (korzystają też seniorzy),
dobry kontrast, pełna obsługa klawiaturą. Nawigacja: dolny pasek na telefonie, górny na komputerze
(same ikony na średnich ekranach). Karuzele: na telefonie swobodne przewijanie palcem, na komputerze
strzałki po bokach. Grupy docelowe mają własne ikony i kolory (rozróżnialne nie tylko barwą).
Płynne przejścia między ekranami, wejścia elementów po kolei i subtelne animacje przycisków,
wyłączane przy systemowym ustawieniu ograniczenia ruchu.

### Model danych

```
profiles        — id (=auth.users.id), name, rating_avg, rating_count, created_at (publiczny; e-mail zostaje tylko w auth.users)
profile_private — id→profiles, birth_date (widoczna tylko dla właściciela)
live_presence   — user_id→profiles (PK), note, lat, lng, updated_at, expires_at
live_joins      — target_id→live_presence, joiner_id→profiles, lat, lng, updated_at  [PK(target, joiner)]
support_messages — id, user_id→profiles (opcjonalnie), kind(contact|bug), message, contact, page, created_at
admins          — user_id→profiles (PK), added_by, created_at
bans            — user_id→profiles (PK), reason, until (null = bezterminowo), banned_by, created_at
reports         — id, reporter_id, target_type(message|event|meetup|user|meetup_chat), target_id,
                  reported_user_id, reason, status(open|resolved), resolved_by, resolved_at, created_at
admin_log       — id, admin_id, action, target_type, target_id, details, created_at
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
| `/login`           | Logowanie bez hasła (imię + e-mail / magic link); Konto: kalendarz miesiąca z aktywnościami (zapisy, własne wydarzenia, spotkania we dwoje), data urodzenia, własna ocena, lista „Do oceny" |
| `/czat`            | Czat w czasie rzeczywistym: kanał dla każdego wydarzenia, lista uczestników, nieprzeczytane wiadomości, separatory dni, zgłaszanie |
| `/admin`           | Panel administratora: zgłoszenia, flagi, czaty, treści, użytkownicy, Pomoc, dziennik (tylko dla kont z tabeli `admins`) |
| `/pomoc`           | Pomoc: wyszukiwarka i FAQ z rozwijanymi odpowiedziami, „Napisz do nas", „Zgłoś błąd", linki do regulaminu i polityki prywatności |
| `/bezpieczna-siec` | Bezpieczna sieć: porady, lekcje i quiz o bezpieczeństwie w internecie dla seniorów oraz dzieci i młodzieży |
| `/miasto`          | _(wyróżnik — zaplanowany, jeszcze niewdrożony)_ mapa aktywności dzielnic |

---

## Bezpieczeństwo i dane

- **Brak prawdziwych danych osobowych.** Wymyślone wydarzenia demo (`supabase/seed.sql`)
  osadzone w prawdziwych miejscach.
- **Wszystkie wydarzenia są publiczne** — widoczne na mapie, każdy zalogowany może dołączyć.
- **Dokładny adres prywatny** widoczny dopiero po zapisie (egzekwowane przez RLS).
- **Czat**: zgłaszanie wiadomości + prosty filtr wulgaryzmów.
- **Sekrety** wyłącznie w zmiennych środowiskowych, nigdy w repozytorium.
- **Regulamin i Polityka prywatności** (`/regulamin`, `/prywatnosc`): pełne dokumenty opisujące faktyczny
  zakres danych; treść w `src/data/legal.ts`. Przed prawdziwym uruchomieniem trzeba uzupełnić dane
  usługodawcy (nazwa, adres, e-mail) i dać dokumenty do przejrzenia prawnikowi.
- **Adres e-mail** użytkownika nie trafia do publicznego profilu (migracja 010).

---

## Podział pracy (4 osoby, równolegle)

Każda osoba jest właścicielem osobnych folderów — minimalizujemy konflikty w gicie.

- **A (lead / fundament)** — szkielet, deploy Render, schemat Supabase + migracje + RLS,
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
- Claude Code (Anthropic) — asystent przy pisaniu kodu; większość implementacji powstała we współpracy z nim
  (każdą decyzję rozumiemy i potrafimy obronić).
- **W samej aplikacji nie używamy jeszcze modelu LLM.** Klasyfikację wydarzeń importowanych przez bota
  (kategoria + grupy docelowe) robią reguły słów kluczowych, nie AI — świadomie, bo jest przewidywalna i darmowa.
- Planowana funkcja „wydarzenie z jednego zdania" (LLM wypełniający formularz) nie została jeszcze wdrożona.

**Główne biblioteki**
- React, Vite, TypeScript, MUI (Material UI), React Router
- Leaflet + react-leaflet, react-leaflet-cluster (grupowanie pinezek)
- @supabase/supabase-js (Postgres, Auth, Realtime, Storage na zdjęcia)
- Wielojęzyczność (PL/EN) i animacje: własne, bez dodatkowych zależności (lekki kontekst + CSS).

**Źródła danych**
- OpenStreetMap — kafelki mapy.
- Dane wydarzeń: wymyślone na potrzeby demo, osadzone w prawdziwych lokalizacjach.
- Wydarzenia importowane przez bota: Karnet (karnet.krakowculture.pl, Krakowskie Biuro Festiwalowe)
  — publiczna lista wydarzeń, każde z linkiem do oryginału.
- Ilustracje kategorii (`public/img/events/`): własne grafiki SVG, używane gdy wydarzenie nie ma zdjęcia.

---

## Zespół

HackYeah 2026 — 4-osobowy zespół, kategoria Smart City.
