import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useLang } from '../i18n/LanguageContext'

// Warunki korzystania (regulamin).
export default function RegulaminPage() {
  const { t } = useLang()
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
        {t('terms.title')}
      </Typography>
      <Typography color="text.secondary">{t('terms.body')}</Typography>
    </Container>
  )
}
