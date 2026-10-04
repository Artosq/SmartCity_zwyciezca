import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import TranslateIcon from '@mui/icons-material/Translate'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SectionCard from '../components/SectionCard'
import SeniorModeSwitch from '../components/SeniorModeSwitch'
import { useLang } from '../i18n/LanguageContext'

// Ustawienia aplikacji: tryb dla seniorów (dostępność) i język.
export default function UstawieniaPage() {
  const { t } = useLang()
  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h1" sx={{ mb: 2.5 }}>
        {t('settings.title')}
      </Typography>
      <Stack spacing={2.5} className="stagger">
        <SectionCard icon={<AccessibilityNewIcon />} title={t('settings.seniorTitle')}>
          <SeniorModeSwitch />
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('settings.seniorHint')}
          </Typography>
        </SectionCard>

        <SectionCard icon={<TranslateIcon />} title={t('settings.language')}>
          <LanguageSwitcher />
        </SectionCard>
      </Stack>
    </Container>
  )
}
