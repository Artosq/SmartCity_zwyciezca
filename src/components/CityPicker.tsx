import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlaceIcon from '@mui/icons-material/Place'
import CitySelect from './CitySelect'

// Ekran startowy: wybór miasta przed pokazaniem mapy.
export default function CityPicker({ onSelect }: { onSelect: (slug: string) => void }) {
  const [slug, setSlug] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (slug) onSelect(slug)
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(160deg, #2a1a8a 0%, #4b3bf0 55%, #ec4899 100%)',
      }}
    >
      <Paper component="form" onSubmit={submit} elevation={8} sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PlaceIcon color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h1">Sąsiedzko</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Sąsiedzkie wydarzenia w Twoim mieście.
            </Typography>
          </Box>

          <CitySelect label="Twoje miasto" value={slug} onChange={setSlug} />

          <Button type="submit" variant="contained" color="secondary" size="large" disabled={!slug}>
            Pokaż wydarzenia
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
