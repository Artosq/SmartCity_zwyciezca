import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface Props {
  icon: ReactNode
  title: string
  // krótka podpowiedź pod tytułem
  hint?: string
  children: ReactNode
}

// Sekcja formularza albo panelu: biała karta z ikoną i tytułem.
export default function SectionCard({ icon, title, hint, children }: Props) {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ p: 2.5, borderRadius: '24px', boxShadow: '0 4px 20px rgba(17,17,17,0.07)' }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: '14px',
            bgcolor: 'rgba(75,59,240,0.1)',
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.2rem' }}>
            {title}
          </Typography>
          {hint && (
            <Typography variant="body2" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </Paper>
  )
}
