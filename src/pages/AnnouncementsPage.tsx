import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Placeholder — tablicę ogłoszeń realizuje Dev 3.
export default function AnnouncementsPage() {
  return (
    <Container maxWidth="sm" className="stagger" sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="h1">Ogłoszenia 📌</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Ten moduł jest w budowie.
      </Typography>
    </Container>
  )
}
