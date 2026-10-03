import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Placeholder — polityka prywatności.
export default function PrywatnoscPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
        Prywatność 🔒
      </Typography>
      <Typography color="text.secondary">
        Szanujemy Twoją prywatność. Dokładny adres wydarzenia widoczny jest dopiero po zapisaniu
        się, a Twoje dane chronione są regułami bezpieczeństwa bazy. Pełna polityka prywatności
        pojawi się wkrótce.
      </Typography>
    </Container>
  )
}
