import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useLang } from '../i18n/LanguageContext'

// Polityka prywatności.
export default function PrywatnoscPage() {
  const { t } = useLang()
  return (
    <Container maxWidth="md" className="stagger" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
        {t('privacy.title')}
      </Typography>
      <Typography color="text.secondary">{t('privacy.body')}</Typography>
    </Container>
  )
}
