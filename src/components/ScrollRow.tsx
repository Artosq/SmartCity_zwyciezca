import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

// Jedno kliknięcie strzałki przewija o tyle szerokości rzędu.
const PAGE_FRACTION = 0.8

const arrowSx = {
  display: { xs: 'none', md: 'flex' },
  position: 'absolute',
  top: '50%',
  zIndex: 2,
  width: 48,
  height: 48,
  mt: '-28px',
  bgcolor: 'background.paper',
  color: 'text.primary',
  boxShadow: '0 4px 14px rgba(17,17,17,0.25)',
  opacity: 0,
  transition: 'opacity .2s ease, transform .15s ease, background-color .2s ease',
  '&:hover': { bgcolor: 'secondary.main', transform: 'scale(1.1)' },
  '&:focus-visible': { opacity: 1 },
} as const

// Poziomo przewijany rząd (karty, chipy) — wychodzi poza marginesy strony jak na makiecie.
// Telefon: swobodne przewijanie palcem. Komputer: strzałki po bokach, widoczne po najechaniu
// na rząd i tylko wtedy, gdy w daną stronę jest jeszcze co przewijać.
export default function ScrollRow({ children, label }: { children: ReactNode; label: string }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    setCanLeft(row.scrollLeft > 4)
    setCanRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 4)
  }, [])

  // Stan strzałek odświeżamy po zmianie rozmiaru rzędu i jego zawartości (np. po doczytaniu kart).
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    update()
    const observer = new ResizeObserver(update)
    observer.observe(row)
    for (const child of row.children) observer.observe(child)
    return () => observer.disconnect()
  }, [update, children])

  const scrollByPage = (direction: 1 | -1) => {
    const row = rowRef.current
    row?.scrollBy({ left: direction * row.clientWidth * PAGE_FRACTION, behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative', '&:hover .scroll-arrow': { opacity: 1 } }}>
      {canLeft && (
        <IconButton
          className="scroll-arrow"
          aria-label="Przewiń w lewo"
          onClick={() => scrollByPage(-1)}
          sx={{ ...arrowSx, left: 8 }}
        >
          <ChevronLeftIcon sx={{ fontSize: 32 }} />
        </IconButton>
      )}
      {canRight && (
        <IconButton
          className="scroll-arrow"
          aria-label="Przewiń w prawo"
          onClick={() => scrollByPage(1)}
          sx={{ ...arrowSx, right: 8 }}
        >
          <ChevronRightIcon sx={{ fontSize: 32 }} />
        </IconButton>
      )}

      <Stack
        ref={rowRef}
        direction="row"
        role="group"
        aria-label={label}
        onScroll={update}
        sx={{
          gap: 2,
          px: 2,
          pt: 1,
          pb: 2,
          overflowX: 'auto',
          // pasek przewijania ukryty — na telefonie przewija się palcem, na komputerze strzałkami
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Dzieci (karty / chipy) „wpływają" po kolei — płynne wejście.
          '& > *': { animation: 'fadeInUp 0.5s ease backwards' },
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
    </Box>
  )
}
