import { createTheme } from '@mui/material/styles'

// Kolory z makiety: fiolet (akcje, nawigacja) + limonka (wyróżnione przyciski).
export const BRAND = {
  violet: '#4B3BF0',
  violetDark: '#3527C4',
  lime: '#C8FF00',
  limeDark: '#A6D900',
  // limonka jest za jasna na tekst — do linków używamy ciemnej oliwki z limonkowym podkreśleniem
  limeText: '#4D7C0F',
  ink: '#111111',
}

// Duże, czytelne elementy i mocny kontrast — z aplikacji korzystają też seniorzy.
export const theme = createTheme({
  palette: {
    primary: { main: BRAND.violet, dark: BRAND.violetDark, contrastText: '#ffffff' },
    secondary: { main: BRAND.lime, dark: BRAND.limeDark, contrastText: BRAND.ink },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: BRAND.ink, secondary: '#52525b' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 15,
    h1: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.05rem', fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 48, borderRadius: 16 } },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiFab: {
      styleOverrides: { root: { fontWeight: 800, fontSize: '1rem', borderRadius: 20 } },
    },
  },
})
