import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { CityProvider } from './context/CityContext'
import { LocationProvider } from './context/LocationContext'
import { LanguageProvider } from './i18n/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <BrowserRouter>
        <LanguageProvider>
          <CityProvider>
            <LocationProvider>
              <App />
            </LocationProvider>
          </CityProvider>
        </LanguageProvider>
      </BrowserRouter>
    </AccessibilityProvider>
  </StrictMode>,
)
