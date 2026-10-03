import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App'
import { CityProvider } from './context/CityContext'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <CityProvider>
          <App />
        </CityProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
