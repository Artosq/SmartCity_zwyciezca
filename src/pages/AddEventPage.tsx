import { useEffect, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditNoteIcon from '@mui/icons-material/EditNote'
import EventIcon from '@mui/icons-material/Event'
import GroupsIcon from '@mui/icons-material/Groups'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import GroupChip from '../components/GroupChip'
import ImageUpload from '../components/ImageUpload'
import LocationPicker, { type Pos } from '../components/LocationPicker'
import OneSentenceEvent, { type ParsedEvent } from '../components/OneSentenceEvent'
import SectionCard from '../components/SectionCard'
import { sortCategories } from '../data/categories'
import type { City } from '../data/cities'
import { TARGET_GROUPS } from '../data/targetGroups'
import { useAuth } from '../hooks/useAuth'
import { containsProfanity, explainDbError, PROFANITY_MESSAGE } from '../lib/profanity'
import { supabase } from '../lib/supabase'
import type { Category } from '../lib/types'

const toggle = (list: string[], slug: string) =>
  list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug]

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
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('id')
      .then(({ data }) => setCategories(sortCategories((data as Category[] | null) ?? [])))
  }, [])

  const canSubmit = Boolean(
    title.trim() && categoryId && targetGroups.length > 0 && pos && startsAt,
  )

  // AI wypełnia pola ze zdania — nadpisujemy tylko te, które coś zwróciły.
  const applyParsed = (f: ParsedEvent) => {
    if (f.title) setTitle(f.title)
    if (f.description) setDescription(f.description)
    const cat = categories.find((c) => c.slug === f.category_slug)
    if (cat) setCategoryId(String(cat.id))
    const groups = (f.target_groups ?? []).filter((g) => TARGET_GROUPS.some((tg) => tg.slug === g))
    if (groups.length) setTargetGroups(groups)
    if (f.starts_at) setStartsAt(f.starts_at.slice(0, 16))
    if (f.place_name) setPlaceName(f.place_name)
    if (f.capacity != null) setCapacity(String(f.capacity))
  }

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
    if (containsProfanity(title, description, placeName)) {
      setError(PROFANITY_MESSAGE)
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
        image_url: imageUrl,
        lat: pos.lat,
        lng: pos.lng,
        place_name: placeName.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        capacity: capacity ? Number(capacity) : null,
      })
      .select()
      .single()

    if (insertError || !event) {
      setError(insertError ? explainDbError(insertError.message) : 'Nie udało się dodać wydarzenia.')
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
        <Stack spacing={2} className="stagger">
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
        <Stack spacing={2} className="stagger">
          <Typography variant="h1">Wydarzenie dodane! 🎉</Typography>
          <Typography color="text.secondary">
            Jest już widoczne na stronie głównej i na mapie. Sąsiedzi mogą do niego dołączyć.
          </Typography>
          <Button component={RouterLink} to="/mapa" variant="contained" size="large">
            Zobacz na mapie
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>
        Dodaj wydarzenie
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Zaproś sąsiadów w minutę. Pola z gwiazdką są wymagane.
      </Typography>

      <Stack component="form" onSubmit={handleSubmit} spacing={2.5} className="stagger">
        <OneSentenceEvent categories={categories} onFilled={applyParsed} />

        <SectionCard icon={<EditNoteIcon />} title="Co się dzieje?">
          <Stack spacing={2}>
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

            <div role="group" aria-label="Kategoria">
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Kategoria *</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {categories.map((category) => {
                  const active = categoryId === String(category.id)
                  return (
                    <ButtonBase
                      key={category.id}
                      onClick={() => setCategoryId(String(category.id))}
                      aria-pressed={active}
                      sx={{
                        gap: 0.75,
                        px: 2,
                        minHeight: 44,
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        border: '2px solid',
                        borderColor: active ? 'primary.main' : 'grey.300',
                        bgcolor: active ? 'primary.main' : 'background.paper',
                        color: active ? 'primary.contrastText' : 'text.primary',
                        transition: 'transform .15s ease, background-color .2s ease, border-color .2s ease',
                        '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
                        '&:active': { transform: 'scale(0.95)' },
                      }}
                    >
                      <span aria-hidden>{category.icon}</span>
                      {category.name}
                    </ButtonBase>
                  )
                })}
              </Stack>
            </div>
          </Stack>
        </SectionCard>

        <SectionCard icon={<GroupsIcon />} title="Dla kogo? *" hint="Wybierz co najmniej jedną grupę.">
          <Stack direction="row" role="group" aria-label="Grupy docelowe" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {TARGET_GROUPS.map((group) => (
              <GroupChip
                key={group.slug}
                group={group}
                active={targetGroups.includes(group.slug)}
                onClick={() => setTargetGroups(toggle(targetGroups, group.slug))}
              />
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          icon={<PlaceOutlinedIcon />}
          title="Gdzie? *"
          hint={`Kliknij na mapie, aby wskazać miejsce (${city.name}).`}
        >
          <Stack spacing={2}>
            <div>
              <LocationPicker city={city} value={pos} onChange={setPos} />
              <Typography
                variant="body2"
                sx={{ mt: 0.75, fontWeight: 600, color: pos ? 'success.main' : 'text.secondary' }}
              >
                {pos ? 'Miejsce zaznaczone na mapie.' : 'Miejsce nie jest jeszcze zaznaczone.'}
              </Typography>
            </div>
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
          </Stack>
        </SectionCard>

        <SectionCard icon={<EventIcon />} title="Kiedy i dla ilu osób?">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
          </Stack>
        </SectionCard>

        <SectionCard icon={<ImageOutlinedIcon />} title="Zdjęcie" hint="Opcjonalnie.">
          <ImageUpload userId={user.id} value={imageUrl} onChange={setImageUrl} />
        </SectionCard>

        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
          {submitting ? 'Dodawanie…' : 'Dodaj wydarzenie'}
        </Button>
      </Stack>
    </Container>
  )
}
