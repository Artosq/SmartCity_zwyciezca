import { createTheme } from '@mui/material/styles'

// Kolory z makiety: fiolet (akcje, nawigacja) + limonka (wyróżnione przyciski).
export const BRAND = {
  violet: '#4B3BF0',
  violetDark: '#3527C4',
  lime: '#C8FF00',
  limeDark: '#A6D900',
  // limonka jest za jasna na tekst — do linków używamy ciemnej oliwki z limonkowym podkreśleniem
  limeText: '#4D7C0F',
  // to samo w trybie dla seniorów: kontrast co najmniej 7:1 (WCAG AAA)
  limeTextStrong: '#365314',
  ink: '#111111',
}

// Motyw aplikacji. Wersja zwykła spełnia kontrasty WCAG 2.1 AA (4,5:1 dla tekstu, 3:1 dla ikon
// i obramowań pól). `senior` = tryb dla seniorów: kontrast AAA (7:1), grubsze obramowania,
// podkreślone linki, bez ruchu przy najechaniu. Powiększenie tekstu robi CSS (index.css).
function buildTheme(senior: boolean) {
  // ruch elementu przy najechaniu/naciśnięciu — w trybie dla seniorów wyłączony
  const motion = <T extends object>(styles: T) => (senior ? {} : styles)

  return createTheme({
    palette: {
      primary: {
        main: senior ? BRAND.violetDark : BRAND.violet,
        dark: senior ? '#261c94' : BRAND.violetDark,
        contrastText: '#ffffff',
      },
      secondary: { main: BRAND.lime, dark: BRAND.limeDark, contrastText: BRAND.ink },
      // ciemne odcienie pod biały tekst na paskach (np. „Jesteś live", „ktoś do Ciebie idzie")
      error: { main: '#dc2626', dark: senior ? '#7f1d1d' : '#b91c1c' },
      success: { main: '#15803d', dark: senior ? '#14532d' : '#15803d' },
      background: { default: '#ffffff', paper: '#ffffff' },
      text: {
        primary: senior ? '#000000' : BRAND.ink,
        secondary: senior ? '#27272a' : '#52525b',
      },
      divider: senior ? '#52525b' : 'rgba(17,17,17,0.12)',
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      fontSize: 15,
      h1: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: senior ? 0 : '-0.02em' },
      h2: { fontSize: '1.4rem', fontWeight: 800, letterSpacing: senior ? 0 : '-0.01em' },
      h3: { fontSize: '1.05rem', fontWeight: 800 },
      button: { textTransform: 'none', fontWeight: 700, fontSize: '1rem' },
      // większe odstępy w tekście (WCAG 1.4.12)
      ...(senior && {
        body1: { lineHeight: 1.7 },
        body2: { lineHeight: 1.65 },
      }),
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: senior ? 56 : 48,
            borderRadius: 16,
            transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease',
            ...motion({
              '&:hover': { transform: 'translateY(-2px)' },
              '&:active': { transform: 'translateY(0) scale(0.97)' },
            }),
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover, &:active': { transform: 'none' },
            },
          },
          contained: {
            '&:hover': { boxShadow: '0 8px 20px rgba(75,59,240,0.28)' },
          },
          outlined: senior ? { borderWidth: 2, '&:hover': { borderWidth: 2 } } : {},
        },
      },
      // Ikony-przyciski, przełączniki i pozycje list reagują na dotyk tak jak zwykłe przyciski.
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'transform .15s ease, background-color .2s ease',
            ...motion({
              '&:hover': { transform: 'scale(1.08)' },
              '&:active': { transform: 'scale(0.92)' },
            }),
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            transition: 'transform .15s ease, background-color .25s ease, color .25s ease, box-shadow .25s ease',
            ...motion({ '&:active': { transform: 'scale(0.97)' } }),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: 'transform .15s ease, background-color .2s ease',
            ...motion({
              '&:hover': { transform: 'translateX(4px)' },
              '&:active': { transform: 'scale(0.98)' },
            }),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: { root: { transition: 'background-color .2s ease' } },
      },
      MuiTextField: {
        defaultProps: { fullWidth: true },
      },
      // Podpowiedź w pustym polu: domyślna jest zbyt blada (poniżej 4,5:1).
      MuiInputBase: {
        styleOverrides: {
          input: {
            '&::placeholder': { color: senior ? '#27272a' : '#5b5b66', opacity: 1 },
          },
        },
      },
      // Obramowanie pola musi odróżniać się od tła (WCAG 1.4.11: co najmniej 3:1).
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: senior
            ? { borderColor: '#000000', borderWidth: 2 }
            : { borderColor: '#8a8a94' },
        },
      },
      MuiLink: {
        defaultProps: { underline: senior ? 'always' : 'hover' },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            fontWeight: 800,
            fontSize: '1rem',
            borderRadius: 20,
            transition: 'transform .18s ease, box-shadow .18s ease',
            ...motion({
              '&:hover': { transform: 'translateY(-2px) scale(1.04)' },
              '&:active': { transform: 'scale(0.96)' },
            }),
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover, &:active': { transform: 'none' },
            },
          },
        },
      },
    },
  })
}

export const theme = buildTheme(false)
export const seniorTheme = buildTheme(true)
