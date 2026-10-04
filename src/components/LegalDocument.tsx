import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { LEGAL, type LegalSection } from '../data/legal'
import { useLang } from '../i18n/LanguageContext'

interface Props {
  title: string
  sections: LegalSection[]
}

// Wspólny układ Regulaminu i Polityki prywatności: tytuł, data obowiązywania, numerowane sekcje.
// Wiążąca jest wersja polska — przy języku angielskim pokazujemy o tym informację.
export default function LegalDocument({ title, sections }: Props) {
  const { lang } = useLang()

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper
        component="article"
        elevation={0}
        className="stagger"
        sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '24px', boxShadow: '0 4px 20px rgba(17,17,17,0.07)' }}
      >
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {LEGAL.serviceName} · obowiązuje od {LEGAL.effectiveDate}
        </Typography>

        {lang !== 'pl' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This document is available in Polish only. The Polish version is legally binding.
          </Alert>
        )}

        {sections.map((section) => (
          <Box component="section" key={section.title} sx={{ mt: 3 }}>
            <Typography variant="h2" sx={{ fontSize: '1.2rem', mb: 1 }}>
              {section.title}
            </Typography>
            {section.blocks.map((block, index) =>
              typeof block === 'string' ? (
                <Typography key={index} sx={{ mb: 1.25, lineHeight: 1.65 }}>
                  {block}
                </Typography>
              ) : (
                <Box component="ul" key={index} sx={{ pl: 3, mt: 0, mb: 1.25 }}>
                  {block.map((item) => (
                    <Typography component="li" key={item} sx={{ mb: 0.5, lineHeight: 1.6 }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              ),
            )}
          </Box>
        ))}
      </Paper>
    </Container>
  )
}
