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

🔗 Demo na żywo: _(link Vercel pojawi się tutaj po pierwszym deployu)_

---

## Produkt — co robi aplikacja

- **Strona główna** z propozycjami wydarzeń w mieście: najbliższe terminy,
  dopasowane do preferencji (grupy docelowe) i „lubiane przez innych" (najwięcej zapisanych).
  Karty ze zdjęciem wydarzenia, liczbą zapisanych, odległością od centrum i terminem.
- **Zasięg: Kraków.** Kolejne miasta są przygotowane w `src/data/cities.ts`, ale na razie wyłączone.
- **Mapa miasta**: pinezki wydarzeń łączą się w grupy z liczbą
  i rozwijają po przybliżeniu; filtr grup docelowych (chipy nad mapą):
  małe dzieci, starsze dzieci, młodzież, dorośli, seniorzy, niepełnosprawni — każda grupa ma swój kolor.
- **Dodawanie wydarzenia**: tytuł, opis, kategoria, grupy docelowe, miejsce na mapie,
  termin, limit miejsc, opcjonalny link do zdjęcia. Wszystkie wydarzenia są publiczne — każdy może dołączyć.
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
| Hosting      | **Vercel**                                            |
| PWA          | manifest + ikony (instalacja na telefonie); bez trybu offline |

**Jak to działa:** aplikacja React (SPA budowana przez Vite) działa w przeglądarce,
dane leżą w Postgresie Supabase. Dostęp do danych pilnuje **Row Level Security** (RLS)
— adres prywatny nie wycieka do nieuprawnionych. Czat korzysta z Supabase Realtime
(subskrypcja zmian w tabeli `messages`). Sekrety trzymamy wyłącznie w zmiennych
środowiskowych.

### Wymagania produktowe

Mobile-first, interfejs po polsku, duże i czytelne elementy (korzystają też seniorzy),
dobry kontrast, pełna obsługa klawiaturą.

### Model danych

```
profiles        — id (=auth.users.id), name, email, created_at
categories      — id, slug, name, color, icon
events          — id, organizer_id→profiles, title, description, category_id→categories,
                  city, lat, lng, place_name, starts_at, capacity, target_groups[],
                  image_url, involves_children, source, source_url, external_id, created_at
event_addresses — event_id→events, address_private
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
| `/`                | Strona główna: chipy preferencji + karuzele wydarzeń (najbliższe, preferencje, lubiane przez innych) |
| `/mapa`            | Mapa wybranego miasta z grupowanymi pinezkami, chipy filtra, rozwijana karta wydarzenia (szczegóły, zapis, licznik miejsc) |
| `/dodaj`           | Dodawanie wydarzenia (wybór miejsca na mapie)               |
| `/login`           | Logowanie bez hasła (imię + e-mail / magic link), konto     |
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
```

Baza: w Supabase → SQL Editor uruchom `supabase/schema.sql` (świeża baza) albo migracje
z `supabase/migrations/` (baza ze starszego schematu), a potem `supabase/seed.sql`.
Bot: po migracji `003_bot_import.sql` i dodaniu `SUPABASE_SERVICE_ROLE_KEY` uruchom `npm run bot`
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
