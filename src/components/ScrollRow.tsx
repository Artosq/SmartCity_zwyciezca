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
      }}
    >
      {children}
    </Stack>
  )
}
