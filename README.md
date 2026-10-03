# Sąsiedzko 🗺️

> Mapa Krakowa z wydarzeniami organizowanymi przez mieszkańców.
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

- **Mapa miasta** z pinezkami wydarzeń, filtry: kategoria i data.
- **Dodawanie wydarzenia**: tytuł, opis, kategoria, miejsce na mapie, termin,
  limit miejsc, widoczność (publiczne / tylko z linkiem).
- **Szczegóły i zapis** jednym kliknięciem, licznik wolnych miejsc.
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
| Frontend     | **Next.js (App Router) + TypeScript + Tailwind CSS**  |
| Mapa         | **Leaflet + OpenStreetMap**                           |
| Backend/dane | **Supabase** — Postgres, Auth (magic link), Realtime  |
| Hosting      | **Vercel**                                            |
| PWA          | manifest + service worker (instalacja, offline shell) |

**Jak to działa:** Next.js renderuje interfejs, dane leżą w Postgresie Supabase.
Dostęp do danych pilnuje **Row Level Security** (RLS) — adres prywatny i wydarzenia
„tylko z linkiem" nie wyciekają do nieuprawnionych. Czat korzysta z Supabase Realtime
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
                  lat, lng, place_name, address_private, starts_at, capacity,
                  visibility(public|link_only), involves_children, share_token, created_at
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
| `/`                | Mapa Krakowa z pinezkami + filtry (kategoria, data)         |
| `/w/[id]`          | Szczegóły wydarzenia, zapis, licznik miejsc, czat wydarzenia |
| `/dodaj`           | Dodawanie wydarzenia (wybór miejsca na mapie)               |
| `/login`           | Logowanie bez hasła (imię + e-mail / magic link)            |
| `/czat`, `/czat/[kanal]` | Lista kanałów + czat w czasie rzeczywistym            |
| `/ogloszenia`      | Tablica ogłoszeń + dodawanie                                |
| `/miasto`          | _(wyróżnik)_ mapa aktywności dzielnic                        |

---

## Bezpieczeństwo i dane

- **Brak prawdziwych danych osobowych.** ~25 wymyślonych wydarzeń demo osadzonych
  w prawdziwych miejscach Krakowa.
- Wydarzenia **z udziałem dzieci** domyślnie „tylko z linkiem".
- **Dokładny adres prywatny** widoczny dopiero po zapisie (egzekwowane przez RLS).
- **Czat**: zgłaszanie wiadomości + prosty filtr wulgaryzmów.
- **Sekrety** wyłącznie w zmiennych środowiskowych, nigdy w repozytorium.

---

## Podział pracy (4 osoby, równolegle)

Każda osoba jest właścicielem osobnych folderów — minimalizujemy konflikty w gicie.

- **A (lead / fundament)** — szkielet, deploy Vercel, schemat Supabase + migracje + RLS,
  logowanie, PWA, wspólne typy i komponenty UI (`/lib`, `/db`, `/components/ui`).
- **B (mapa)** — Leaflet, pinezki, filtry, `/` i `/w/[id]` (`/components/map`).
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
npm run dev                  # http://localhost:3000
```

Zmienne środowiskowe (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # tylko po stronie serwera
```

---

## Użyte narzędzia AI, biblioteki i źródła danych

_(utrzymujemy tę listę na bieżąco — wymóg regulaminu: rozumiemy i bronimy każdej decyzji)_

**Narzędzia AI**
- Claude Code (Anthropic) — wsparcie przy pisaniu kodu.
- _(do uzupełnienia)_ model LLM do funkcji „wydarzenie z jednego zdania".

**Główne biblioteki**
- Next.js, React, TypeScript, Tailwind CSS
- Leaflet + react-leaflet
- @supabase/supabase-js

**Źródła danych**
- OpenStreetMap — kafelki mapy.
- Dane wydarzeń: wymyślone na potrzeby demo, osadzone w prawdziwych lokalizacjach Krakowa.

---

## Zespół

HackYeah 2026 — 4-osobowy zespół, kategoria Smart City.
