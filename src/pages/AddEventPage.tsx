import { useEffect, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LocationPicker, { type Pos } from '../components/LocationPicker'
import TargetGroupFilter from '../components/TargetGroupFilter'
import type { City } from '../data/cities'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Category } from '../lib/types'

export default function AddEventPage({ city }: { city: City }) {
  const { user, loading: loadingAuth } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])

  // pola formularza
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [targetGroups, setTargetGroups] = useState<string[]>([])
  const [pos, setPos] = useState<Pos | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [addressPrivate, setAddressPrivate] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('id')
      .then(({ data }) => setCategories((data as Category[] | null) ?? []))
  }, [])

  const canSubmit = Boolean(
    title.trim() && categoryId && targetGroups.length > 0 && pos && startsAt,
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) {
      setError('Musisz być zalogowany, aby dodać wydarzenie.')
      return
    }
    if (!pos) {
      setError('Wskaż miejsce na mapie.')
      return
    }

    setSubmitting(true)

    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category_id: Number(categoryId),
        target_groups: targetGroups,
        city: city.slug,
        image_url: imageUrl.trim() || null,
        lat: pos.lat,
        lng: pos.lng,
        place_name: placeName.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        capacity: capacity ? Number(capacity) : null,
      })
      .select()
      .single()

    if (insertError || !event) {
      setError(insertError?.message ?? 'Nie udało się dodać wydarzenia.')
      setSubmitting(false)
      return
    }

    // dokładny adres prywatny (opcjonalny) — do osobnej, chronionej tabeli
    if (addressPrivate.trim()) {
      await supabase.from('event_addresses').insert({
        event_id: event.id,
        address_private: addressPrivate.trim(),
      })
    }

    setCreated(true)
    setSubmitting(false)
  }

  if (loadingAuth) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h1">Dodaj wydarzenie</Typography>
          <Typography color="text.secondary">Aby dodać wydarzenie, najpierw się zaloguj.</Typography>
          <Button component={RouterLink} to="/login" variant="contained" size="large">
            Przejdź do logowania
          </Button>
        </Stack>
      </Container>
    )
  }

  if (created) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h1">Wydarzenie dodane! 🎉</Typography>
          <Typography color="text.secondary">
            Jest już widoczne na stronie głównej i na mapie — sąsiedzi mogą do niego dołączyć.
          </Typography>
          <Button component={RouterLink} to="/mapa" variant="contained" size="large">
            Zobacz na mapie
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ mb: 3 }}>
        Dodaj wydarzenie
      </Typography>

      <Stack component="form" onSubmit={handleSubmit} spacing={3}>
        <TextField
          label="Tytuł"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Kiermasz ciast w parku"
        />

        <TextField
          label="Opis"
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Krótko opisz, co się wydarzy."
        />

        <TextField
          select
          label="Kategoria"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.icon} {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TargetGroupFilter
          legend="Dla kogo? * (wybierz co najmniej jedną grupę)"
          selected={targetGroups}
          onChange={setTargetGroups}
        />

        <Box>
          <Typography sx={{ fontWeight: 700 }}>Miejsce na mapie *</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Kliknij na mapie, aby wskazać miejsce ({city.name}).
          </Typography>
          <LocationPicker city={city} value={pos} onChange={setPos} />
          {pos && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Wybrano: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </Typography>
          )}
        </Box>

        <TextField
          label="Nazwa miejsca (publiczna)"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="np. Park Jordana"
        />

        <TextField
          label="Dokładny adres (prywatny)"
          helperText="Widoczny dopiero po zapisie na wydarzenie."
          value={addressPrivate}
          onChange={(e) => setAddressPrivate(e.target.value)}
          placeholder="np. ul. Przykładowa 5/10"
        />

        <TextField
          label="Termin"
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Limit miejsc"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="puste = bez limitu"
          slotProps={{ htmlInput: { min: 1 }, inputLabel: { shrink: true } }}
        />

        <TextField
          label="Link do zdjęcia"
          type="url"
          helperText="Opcjonalnie. Bez zdjęcia pokażemy ilustrację kategorii."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
          {submitting ? 'Dodawanie…' : 'Dodaj wydarzenie'}
        </Button>
      </Stack>
    </Container>
  )
}
