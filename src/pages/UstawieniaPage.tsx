import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLang } from '../i18n/LanguageContext'

// Ustawienia aplikacji — m.in. język.
export default function UstawieniaPage() {
  const { t } = useLang()
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 3 }}>
        {t('settings.title')}
      </Typography>
      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 700 }}>{t('settings.language')}</Typography>
        <LanguageSwitcher />
      </Stack>
    </Container>
  )
}
