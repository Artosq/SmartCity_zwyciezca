import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { seniorTheme, theme } from '../theme'

const STORAGE_KEY = 'sasiedzko.senior'

interface AccessibilityContextValue {
  // tryb dla seniorów: większy tekst i ikony, kontrast AAA, bez animacji, podkreślone linki
  senior: boolean
  setSenior: (on: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

function readSenior() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Trzyma wybór trybu dla seniorów (zapamiętany na urządzeniu), podaje odpowiedni motyw
// i oznacza dokument atrybutem data-senior, na którym opierają się reguły w index.css.
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [senior, setSeniorState] = useState(readSenior)

  useEffect(() => {
    document.documentElement.dataset.senior = senior ? 'on' : 'off'
  }, [senior])

  const setSenior = (on: boolean) => {
    setSeniorState(on)
    try {
      localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
    } catch {
      // brak dostępu do localStorage — wybór działa do odświeżenia strony
    }
  }

  return (
    <AccessibilityContext.Provider value={{ senior, setSenior }}>
      <ThemeProvider theme={senior ? seniorTheme : theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const value = useContext(AccessibilityContext)
  if (!value) throw new Error('useAccessibility musi być użyte wewnątrz AccessibilityProvider')
  return value
}
