import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Placeholder — ustawienia aplikacji.
export default function UstawieniaPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
        Ustawienia ⚙️
      </Typography>
      <Typography color="text.secondary">
        Ustawienia aplikacji pojawią się wkrótce.
      </Typography>
    </Container>
  )
}
