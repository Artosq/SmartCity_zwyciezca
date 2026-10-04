import { useSearchParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import MeetupForm from '../components/meetups/MeetupForm'
import ModeToggle, { type Mode } from '../components/ModeToggle'
import type { City } from '../data/cities'
import AddEventPage from './AddEventPage'

// Strona „Dodaj": wybór między wydarzeniem a spotkaniem we dwoje (?typ=1na1).
export default function AddPage({ city }: { city: City }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: Mode = searchParams.get('typ') === '1na1' ? '1na1' : 'wydarzenia'

  return (
    <>
      <Container maxWidth="sm" sx={{ pt: 2 }}>
        <ModeToggle
          label="Co chcesz dodać?"
          value={mode}
          onChange={(next) => setSearchParams(next === '1na1' ? { typ: '1na1' } : {}, { replace: true })}
        />
      </Container>

      {mode === '1na1' ? (
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Zaproponuj spotkanie we dwoje
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Jedna osoba, publiczne miejsce, bez presji.
          </Typography>
          <MeetupForm city={city} />
        </Container>
      ) : (
        <AddEventPage city={city} />
      )}
    </>
  )
}
