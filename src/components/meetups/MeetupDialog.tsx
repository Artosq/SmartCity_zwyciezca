import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlaceIcon from '@mui/icons-material/Place'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { getMeetupType } from '../../data/meetupTypes'
import { formatLongDate } from '../../lib/eventDisplay'
import { supabase } from '../../lib/supabase'
import type { MeetupWithHost } from '../../lib/types'
import { HostLine, MeetupTags } from './MeetupCard'

interface Props {
  meetup: MeetupWithHost
  user: User | null
  onClose: () => void
  // po dołączeniu, rezygnacji albo usunięciu lista wymaga odświeżenia
  onChanged: () => void
}

// Szczegóły wyjścia 1:1 z przyciskiem „Idę". Dołączać mogą tylko zalogowani dorośli.
export default function MeetupDialog({ meetup, user, onClose, onChanged }: Props) {
  const navigate = useNavigate()
  const [adult, setAdult] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const type = getMeetupType(meetup.type)
  const isHost = user?.id === meetup.host_id
  const isGuest = user?.id === meetup.guest_id
  const taken = meetup.guest_id !== null

  async function join() {
    setBusy(true)
    setError('')
    const { data: joined, error } = await supabase.rpc('join_meetup', { p_meetup_id: meetup.id })
    setBusy(false)
    if (error || !joined) {
      setError(error ? 'Nie udało się dołączyć.' : 'Ktoś był szybszy — to wyjście jest już zajęte.')
      onChanged()
      return
    }
    // po dołączeniu od razu do rozmowy z osobą proponującą
    navigate('/czat/')
  }

  async function leave() {
    setBusy(true)
    const { error } = await supabase.rpc('leave_meetup', { p_meetup_id: meetup.id })
    setBusy(false)
    if (error) return setError('Nie udało się zrezygnować.')
    onChanged()
    onClose()
  }

  async function remove() {
    setBusy(true)
    const { error } = await supabase.from('meetups').delete().eq('id', meetup.id)
    setBusy(false)
    if (error) return setError('Nie udało się usunąć propozycji.')
    onChanged()
    onClose()
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '28px' } } }}>
      <Box
        aria-hidden
        sx={{ height: 120, background: type.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}
      >
        {type.emoji}
      </Box>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{meetup.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <HostLine name={meetup.host?.name ?? 'Sąsiad'} />
          {meetup.description && <Typography>{meetup.description}</Typography>}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleIcon color="action" />
            <Typography>
              {formatLongDate(meetup.starts_at)}
              {meetup.duration_min ? ` · ${meetup.duration_min} min` : ''}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PlaceIcon color="action" />
            <Typography>{meetup.place_name}</Typography>
          </Stack>
          <MeetupTags meetup={meetup} />

          <Alert severity="info">
            Spotykaj się w miejscu publicznym i daj znać komuś bliskiemu, dokąd idziesz.
          </Alert>

          {isHost && (
            <Alert severity={taken ? 'success' : 'info'}>
              {taken
                ? 'Ktoś dołączył do Twojego wyjścia. Rozmowę znajdziesz w zakładce Czat.'
                : 'To Twoja propozycja. Czeka na chętną osobę.'}
            </Alert>
          )}
          {isGuest && <Alert severity="success">Idziesz na to wyjście. Rozmowa jest w zakładce Czat.</Alert>}
          {!isHost && !isGuest && taken && <Alert severity="warning">To wyjście jest już zajęte.</Alert>}

          {user && !isHost && !isGuest && !taken && (
            <FormControlLabel
              control={<Checkbox checked={adult} onChange={(e) => setAdult(e.target.checked)} />}
              label="Oświadczam, że mam ukończone 18 lat."
            />
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose}>Zamknij</Button>
        {!user ? (
          <Button component={RouterLink} to="/login/" variant="contained">
            Zaloguj się, aby iść
          </Button>
        ) : isHost ? (
          <Button color="error" variant="outlined" disabled={busy} onClick={remove}>
            Usuń propozycję
          </Button>
        ) : isGuest ? (
          <Button variant="outlined" disabled={busy} onClick={leave}>
            Rezygnuję
          </Button>
        ) : (
          <Button variant="contained" color="secondary" disabled={busy || taken || !adult} onClick={join}>
            Idę
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
