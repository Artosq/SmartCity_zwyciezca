// Po buildzie kopiuje index.html do folderu każdej podstrony (dist/mapa/index.html itd.).
// Dzięki temu hosting statyczny bez reguł przekierowań (Render) nie zwraca 404
// po odświeżeniu strony pod adresem /mapa/. Lista musi odpowiadać trasom w src/App.tsx.
import { copyFileSync, mkdirSync } from 'node:fs'

const ROUTES = [
  'mapa',
  'dodaj',
  'czat',
  'pomoc',
  'ogloszenia',
  'login',
  'regulamin',
  'prywatnosc',
  'ustawienia',
  'admin',
]

for (const route of ROUTES) {
  mkdirSync(`dist/${route}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${route}/index.html`)
}
// część hostingów pokazuje ten plik przy nieznanym adresie
copyFileSync('dist/index.html', 'dist/404.html')

console.log(`spa-fallback: skopiowano index.html dla ${ROUTES.length} podstron`)
