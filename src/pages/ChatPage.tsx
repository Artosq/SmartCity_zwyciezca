import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Placeholder — moduł czatu realizuje Dev 3 (Supabase Realtime).
export default function ChatPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="h1">Czaty 💬</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Ten moduł jest w budowie.
      </Typography>
    </Container>
  )
}
