import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useAccessibility } from '../context/AccessibilityContext'
import { useLang } from '../i18n/LanguageContext'

// Przełącznik trybu dla seniorów — na stronie Ustawienia i w menu „Więcej".
export default function SeniorModeSwitch() {
  const { senior, setSenior } = useAccessibility()
  const { t } = useLang()

  return (
    <FormControlLabel
      control={<Switch checked={senior} onChange={(e) => setSenior(e.target.checked)} />}
      label={t('settings.senior')}
      sx={{ ml: 0, gap: 1, '& .MuiFormControlLabel-label': { fontWeight: 700 } }}
    />
  )
}
