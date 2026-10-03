import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Placeholder — warunki korzystania (regulamin).
export default function RegulaminPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
        Warunki korzystania 📄
      </Typography>
      <Typography color="text.secondary">
        Pełna treść regulaminu pojawi się wkrótce. Sąsiedzko to aplikacja do organizowania i
        znajdowania sąsiedzkich wydarzeń — korzystając z niej, zgadzasz się na kulturalne i zgodne z
        prawem zachowanie wobec innych mieszkańców.
      </Typography>
    </Container>
  )
}
