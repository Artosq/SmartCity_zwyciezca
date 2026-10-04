import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CityPicker from './components/CityPicker'
import { useCity } from './context/CityContext'
import { LiveProvider } from './context/LiveContext'
import AddPage from './pages/AddPage'
import ChatPage from './pages/ChatPage'
import HelpPage from './pages/HelpPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import PrywatnoscPage from './pages/PrywatnoscPage'
import RegulaminPage from './pages/RegulaminPage'
import UstawieniaPage from './pages/UstawieniaPage'

export default function App() {
  const { city, selectCity } = useCity()
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  // Podstrony mają adres z ukośnikiem na końcu (/mapa/). Hosting statyczny serwuje wtedy
  // skopiowany przy buildzie plik mapa/index.html (scripts/spa-fallback.mjs), więc odświeżenie
  // strony działa bez reguł przekierowań po stronie serwera.
  // Ukośnik dopisujemy w efekcie, nie zamiast renderowania — inaczej cała rama aplikacji
  // (nagłówek, nawigacja) znikałaby na moment i jej animacje zaczynały się od nowa.
  useEffect(() => {
    if (!pathname.endsWith('/')) navigate(`${pathname}/${search}${hash}`, { replace: true })
  }, [pathname, search, hash, navigate])

  // Najpierw wybór miasta — dopiero potem reszta aplikacji.
  if (!city) return <CityPicker onSelect={selectCity} />

  return (
    <LiveProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage city={city} />} />
          <Route path="/mapa" element={<MapPage city={city} />} />
          <Route path="/dodaj" element={<AddPage city={city} />} />
          <Route path="/czat" element={<ChatPage />} />
          <Route path="/pomoc" element={<HelpPage />} />
          <Route path="/ogloszenia" element={<Navigate to="/pomoc/" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/regulamin" element={<RegulaminPage />} />
          <Route path="/prywatnosc" element={<PrywatnoscPage />} />
          <Route path="/ustawienia" element={<UstawieniaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LiveProvider>
  )
}
