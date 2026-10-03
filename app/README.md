# Sąsiedzko — aplikacja (frontend)

Vite + React (JS) + Tailwind CSS + Leaflet (react-leaflet).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Co jest zrobione

- Strona główna z mapą (Leaflet + kafelki OpenStreetMap).
- Wybór miasta: ekran startowy + lista rozwijana w nagłówku (zapamiętywany w `localStorage`).
- Mapa ograniczona do wybranego miasta, z zaznaczonym obrysem (prostokąt z `src/data/cities.js`).
- Filtr wydarzeń po grupach docelowych (`src/data/targetGroups.js`), każda grupa ma swój kolor.
- Dummy wydarzenia w `src/data/dummyEvents.js` — do zastąpienia danymi z Supabase.
- Szkielet PWA: `public/manifest.webmanifest` (bez service workera).
