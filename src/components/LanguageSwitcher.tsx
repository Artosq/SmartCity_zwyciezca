import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { useLang } from '../i18n/LanguageContext'
import { LANGS } from '../i18n/translations'

// Segmentowy przełącznik języka (PL / EN) — pigułka jak na makiecie.
export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <Box
      role="group"
      aria-label="Język / Language"
      sx={{
        display: 'inline-flex',
        gap: 0.5,
        p: 0.5,
        borderRadius: 999,
        bgcolor: 'rgba(17,17,17,0.06)',
      }}
    >
      {LANGS.map((code) => {
        const active = code === lang
        return (
          <ButtonBase
            key={code}
            onClick={() => setLang(code)}
            aria-pressed={active}
            sx={{
              px: 2,
              minHeight: 36,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '0.9rem',
              color: active ? 'primary.contrastText' : 'text.secondary',
              bgcolor: active ? 'primary.main' : 'transparent',
              boxShadow: active ? '0 2px 8px rgba(75,59,240,0.3)' : 'none',
              transition: 'background-color .2s ease, color .2s ease',
            }}
          >
            {code.toUpperCase()}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
