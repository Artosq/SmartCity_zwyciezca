import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CityPicker from './components/CityPicker'
import { useCity } from './context/CityContext'
import AddEventPage from './pages/AddEventPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'

export default function App() {
  const { city, selectCity } = useCity()

  // Najpierw wybór miasta — dopiero potem reszta aplikacji.
  if (!city) return <CityPicker onSelect={selectCity} />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage city={city} />} />
        <Route path="/mapa" element={<MapPage city={city} />} />
        <Route path="/dodaj" element={<AddEventPage city={city} />} />
        <Route path="/czat" element={<ChatPage />} />
        <Route path="/ogloszenia" element={<AnnouncementsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
