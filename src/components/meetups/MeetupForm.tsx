import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { City } from '../../data/cities'
import { MEETUP_TYPES } from '../../data/meetupTypes'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import LocationPicker, { type Pos } from '../LocationPicker'

const DURATIONS = [30, 45, 60, 90, 120]
const MAX_TAGS = 3

// Krótki formularz propozycji wyjścia 1:1. Proponować mogą tylko zalogowani dorośli,
// a miejsce spotkania musi być publiczne.
export default function MeetupForm({ city }: { city: City }) {
  const { user, loading: loadingAuth } = useAuth()

  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [duration, setDuration] = useState('45')
  const [pos, setPos] = useState<Pos | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [adult, setAdult] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  const canSubmit = Boolean(type && title.trim() && startsAt && pos && placeName.trim() && adult)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !pos) return
    setError('')
    setSubmitting(true)

    const { error } = await supabase.from('meetups').insert({
      host_id: user.id,
      type,
      title: title.trim(),
      description: description.trim() || null,
      city: city.slug,
      lat: pos.lat,
      lng: pos.lng,
      place_name: placeName.trim(),
      starts_at: new Date(startsAt).toISOString(),
      duration_min: Number(duration),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, MAX_TAGS),
    })

    setSubmitting(false)
    if (error) setError(error.message)
    else setCreated(true)
  }

  if (loadingAuth) return <Typography color="text.secondary">Ładowanie…</Typography>

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography color="text.secondary">Aby zaproponować wyjście 1:1, najpierw się zaloguj.</Typography>
        <Button component={RouterLink} to="/login/" variant="contained" size="large">
          Przejdź do logowania
        </Button>
      </Stack>
    )
  }

  if (created) {
    return (
      <Stack spacing={2}>
        <Typography variant="h2">Propozycja dodana! 🎉</Typography>
        <Typography color="text.secondary">
          Gdy ktoś kliknie „Idę", rozmowa pojawi się w zakładce Czat.
        </Typography>
        <Button component={RouterLink} to="/?widok=1na1" variant="contained" size="large">
          Zobacz wyjścia 1:1
        </Button>
      </Stack>
    )
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
      <Alert severity="info">
        Wyjście 1:1 to spotkanie z jedną osobą. Wybierz miejsce publiczne — park, kawiarnię, boisko.
      </Alert>

      <TextField select label="Rodzaj" required value={type} onChange={(e) => setType(e.target.value)}>
        {MEETUP_TYPES.map((item) => (
          <MenuItem key={item.slug} value={item.slug}>
            {item.emoji} {item.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Tytuł"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="np. Spacer z psem po Błoniach"
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <TextField
          label="Termin"
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField select label="Czas trwania" value={duration} onChange={(e) => setDuration(e.target.value)}>
          {DURATIONS.map((minutes) => (
            <MenuItem key={minutes} value={String(minutes)}>
              {minutes} min
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box>
        <Typography sx={{ fontWeight: 700 }}>Miejsce spotkania *</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Kliknij na mapie, aby wskazać miejsce ({city.name}).
        </Typography>
        <LocationPicker city={city} value={pos} onChange={setPos} />
      </Box>

      <TextField
        label="Nazwa miejsca publicznego"
        required
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="np. Błonia, wejście od ul. Piastowskiej"
      />

      <TextField
        label="Opis"
        multiline
        minRows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Kilka słów o sobie i o tym, na co masz ochotę."
      />

      <TextField
        label="Tagi"
        helperText={`Opcjonalnie, do ${MAX_TAGS}, oddzielone przecinkami — np. Z psem, Bezpłatnie`}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <FormControlLabel
        control={<Checkbox checked={adult} onChange={(e) => setAdult(e.target.checked)} />}
        label="Oświadczam, że mam ukończone 18 lat."
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
        {submitting ? 'Dodawanie…' : 'Zaproponuj wyjście'}
      </Button>
    </Stack>
  )
}
