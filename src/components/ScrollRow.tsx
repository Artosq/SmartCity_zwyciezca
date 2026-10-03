import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'

// Poziomo przewijany rząd (karty, chipy) — wychodzi poza marginesy strony jak na makiecie.
export default function ScrollRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={{
        gap: 2,
        px: 2,
        pt: 1,
        pb: 2,
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
        scrollPaddingLeft: 16,
        scrollbarWidth: { xs: 'none', md: 'thin' },
        '&::-webkit-scrollbar': { display: { xs: 'none', md: 'block' } },
        // Dzieci (karty / chipy) „wpływają" po kolei — płynne wejście.
        '& > *': { animation: 'fadeInUp 0.5s ease both' },
        '& > *:nth-of-type(1)': { animationDelay: '0.04s' },
        '& > *:nth-of-type(2)': { animationDelay: '0.1s' },
        '& > *:nth-of-type(3)': { animationDelay: '0.16s' },
        '& > *:nth-of-type(4)': { animationDelay: '0.22s' },
        '& > *:nth-of-type(5)': { animationDelay: '0.28s' },
        '& > *:nth-of-type(6)': { animationDelay: '0.34s' },
        '& > *:nth-of-type(n+7)': { animationDelay: '0.4s' },
      }}
    >
      {children}
    </Stack>
  )
}
