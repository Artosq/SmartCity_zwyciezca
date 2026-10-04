import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditNoteIcon from '@mui/icons-material/EditNote'
import EventIcon from '@mui/icons-material/Event'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import type { City } from '../../data/cities'
import { MEETUP_TYPES } from '../../data/meetupTypes'
import { useProfile } from '../../hooks/useProfile'
import { containsProfanity, explainDbError, PROFANITY_MESSAGE } from '../../lib/profanity'
import { supabase } from '../../lib/supabase'
import LocationPicker, { type Pos } from '../LocationPicker'
import SectionCard from '../SectionCard'

const DURATIONS = [30, 45, 60, 90, 120]
const MAX_TAGS = 3

// Krótki formularz propozycji spotkania we dwoje. Proponować mogą tylko zalogowani dorośli (wiek z profilu),
// a miejsce spotkania musi być publiczne.
export default function MeetupForm({ city }: { city: City }) {
  const { user, loading: loadingAuth, birthDate, isAdult } = useProfile()

  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [duration, setDuration] = useState('45')
  const [pos, setPos] = useState<Pos | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  const canSubmit = Boolean(type && title.trim() && startsAt && pos && placeName.trim())

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !pos) return
    if (containsProfanity(title, description, placeName, tags)) {
      setError(PROFANITY_MESSAGE)
      return
    }
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
    if (error) {
      // nowy rodzaj spotkania, którego baza jeszcze nie zna — brakuje migracji
      setError(
        error.message.includes('meetups_type_check')
          ? 'Baza nie zna jeszcze tego rodzaju spotkania. Uruchom migrację 007_uploads_and_shopping.sql.'
          : explainDbError(error.message),
      )
    } else setCreated(true)
  }

  if (loadingAuth) return <Typography color="text.secondary">Ładowanie…</Typography>

  if (!user) {
    return (
      <Stack spacing={2} className="stagger">
        <Typography color="text.secondary">Aby zaproponować spotkanie we dwoje, najpierw się zaloguj.</Typography>
        <Button component={RouterLink} to="/login/" variant="contained" size="large">
          Przejdź do logowania
        </Button>
      </Stack>
    )
  }

  if (!isAdult) {
    return (
      <Stack spacing={2} className="stagger">
        <Alert severity="info">
          {birthDate
            ? 'Spotkania we dwoje są dostępne od 18 lat.'
            : 'Spotkania we dwoje są dostępne od 18 lat. Uzupełnij datę urodzenia na stronie Konto.'}
        </Alert>
        {!birthDate && (
          <Button component={RouterLink} to="/login/" variant="contained" size="large">
            Przejdź do Konta
          </Button>
        )}
      </Stack>
    )
  }

  if (created) {
    return (
      <Stack spacing={2} className="stagger">
        <Typography variant="h2">Propozycja dodana! 🎉</Typography>
        <Typography color="text.secondary">
          Gdy ktoś kliknie „Idę", rozmowa pojawi się w zakładce Czat.
        </Typography>
        <Button component={RouterLink} to="/?widok=1na1" variant="contained" size="large">
          Zobacz spotkania we dwoje
        </Button>
      </Stack>
    )
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5} className="stagger">
      <SectionCard icon={<CategoryOutlinedIcon />} title="Na co masz ochotę? *">
        {/* Kafelki zamiast listy rozwijanej: od razu widać wszystkie rodzaje. */}
        <Box
          role="radiogroup"
          aria-label="Rodzaj spotkania"
          sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}
        >
          {MEETUP_TYPES.map((item) => {
            const active = type === item.slug
            return (
              <ButtonBase
                key={item.slug}
                role="radio"
                aria-checked={active}
                onClick={() => setType(item.slug)}
                sx={{
                  position: 'relative',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0.5,
                  minHeight: 104,
                  p: 1.5,
                  borderRadius: '22px',
                  color: '#ffffff',
                  background: item.gradient,
                  fontWeight: 800,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  // zaznaczony kafelek: limonkowa obwódka; pozostałe lekko przygaszone
                  outline: active ? '4px solid' : '0 solid',
                  outlineColor: 'secondary.main',
                  outlineOffset: 2,
                  opacity: type && !active ? 0.6 : 1,
                  boxShadow: active ? '0 10px 24px rgba(17,17,17,0.28)' : '0 4px 12px rgba(17,17,17,0.14)',
                  transform: active ? 'translateY(-3px)' : 'none',
                  transition: 'transform .2s ease, opacity .2s ease, box-shadow .2s ease',
                  '&:hover': { transform: 'translateY(-3px)', opacity: 1 },
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                {active && (
                  <CheckCircleIcon
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'secondary.main', fontSize: 24 }}
                  />
                )}
                <Box component="span" aria-hidden sx={{ fontSize: 34, lineHeight: 1 }}>
                  {item.emoji}
                </Box>
                <span className="tile-label">{item.name}</span>
              </ButtonBase>
            )
          })}
        </Box>
      </SectionCard>

      <SectionCard icon={<EditNoteIcon />} title="Opisz spotkanie">
        <Stack spacing={2}>
          <TextField
            label="Tytuł"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Spacer z psem po Błoniach"
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
            helperText={`Opcjonalnie, do ${MAX_TAGS}, oddzielone przecinkami, np. Z psem, Bezpłatnie`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Stack>
      </SectionCard>

      <SectionCard icon={<EventIcon />} title="Kiedy?">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
      </SectionCard>

      <SectionCard
        icon={<PlaceOutlinedIcon />}
        title="Gdzie? *"
        hint="Tylko miejsce publiczne: park, kawiarnia, boisko, targ."
      >
        <Stack spacing={2}>
          <div>
            <LocationPicker city={city} value={pos} onChange={setPos} />
            <Typography
              variant="body2"
              sx={{ mt: 0.75, fontWeight: 600, color: pos ? 'success.main' : 'text.secondary' }}
            >
              {pos ? 'Miejsce zaznaczone na mapie.' : `Kliknij na mapie, aby wskazać miejsce (${city.name}).`}
            </Typography>
          </div>
          <TextField
            label="Nazwa miejsca publicznego"
            required
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="np. Błonia, wejście od ul. Piastowskiej"
          />
        </Stack>
      </SectionCard>

      {error && <Alert severity="error">{error}</Alert>}

      <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
        {submitting ? 'Dodawanie…' : 'Zaproponuj spotkanie'}
      </Button>
    </Stack>
  )
}
