import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useAdmin } from '../../hooks/useModeration'
import { ChatsTab, ContentTab, FlagsTab, LogTab, ReportsTab, SupportTab, UsersTab } from './AdminTabs'

const TABS = ['Zgłoszenia', 'Flagi', 'Czaty', 'Treści', 'Użytkownicy', 'Pomoc', 'Dziennik']

// Panel administratora (/admin, bez linku w aplikacji). Dostęp mają tylko konta z tabeli admins;
// baza odrzuca działania pozostałych, a tutaj dodatkowo nie pokazujemy im panelu.
export default function AdminPage() {
  const { user, isAdmin, loading } = useAdmin()
  const [tab, setTab] = useState(0)

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  if (!user || !isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h1">Panel administratora</Typography>
          <Alert severity="warning">
            {user ? 'To konto nie ma uprawnień administratora.' : 'Zaloguj się na konto administratora.'}
          </Alert>
          {!user && (
            <Button component={RouterLink} to="/login/" variant="contained" size="large">
              Zaloguj się
            </Button>
          )}
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h1" sx={{ mb: 1 }}>
        Panel administratora
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {TABS.map((label) => (
          <Tab key={label} label={label} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} />
        ))}
      </Tabs>

      <Box role="tabpanel">
        {tab === 0 && <ReportsTab adminId={user.id} />}
        {tab === 1 && <FlagsTab adminId={user.id} />}
        {tab === 2 && <ChatsTab adminId={user.id} />}
        {tab === 3 && <ContentTab adminId={user.id} />}
        {tab === 4 && <UsersTab adminId={user.id} />}
        {tab === 5 && <SupportTab adminId={user.id} />}
        {tab === 6 && <LogTab />}
      </Box>
    </Container>
  )
}
