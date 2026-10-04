import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export type ReportTarget = 'message' | 'event' | 'meetup' | 'user' | 'meetup_chat'

interface Props {
  targetType: ReportTarget
  targetId: string
  // kogo dotyczy zgłoszenie (autor wiadomości, organizator…), jeśli wiadomo
  reportedUserId?: string | null
  label?: string
  // mały przycisk tekstowy, np. pod wiadomością na czacie
  compact?: boolean
}

const TITLES: Record<ReportTarget, string> = {
  message: 'Zgłoś wiadomość',
  event: 'Zgłoś wydarzenie',
  meetup: 'Zgłoś spotkanie',
  user: 'Zgłoś osobę',
  meetup_chat: 'Zgłoś rozmowę',
}

const MAX_REASON = 1000

// Przycisk „Zgłoś": zgłoszenie trafia do kolejki w panelu administratora.
// Zgłaszać mogą zalogowani; niezalogowany nie widzi przycisku.
export default function ReportButton({ targetType, targetId, reportedUserId, label = 'Zgłoś', compact }: Props) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!user) return null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('reports').insert({
      reporter_id: user!.id,
      target_type: targetType,
      target_id: targetId,
      reported_user_id: reportedUserId ?? null,
      reason: reason.trim(),
    })
    setStatus(error ? 'error' : 'sent')
  }

  const close = () => {
    setOpen(false)
    setReason('')
    setStatus('idle')
  }

  return (
    <>
      <Button
        size="small"
        color="inherit"
        startIcon={<FlagOutlinedIcon fontSize="small" />}
        onClick={() => setOpen(true)}
        sx={{
          minHeight: compact ? 28 : 40,
          px: compact ? 0.75 : 1.5,
          fontSize: compact ? '0.75rem' : '0.9rem',
          color: 'text.secondary',
          alignSelf: 'flex-start',
        }}
      >
        {label}
      </Button>

      <Dialog open={open} onClose={close} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '28px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{TITLES[targetType]}</DialogTitle>
        {status === 'sent' ? (
          <>
            <DialogContent>
              <Alert severity="success">Dziękujemy. Zgłoszenie trafiło do zespołu, który je sprawdzi.</Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="contained" onClick={close}>
                Zamknij
              </Button>
            </DialogActions>
          </>
        ) : (
          <form onSubmit={submit}>
            <DialogContent>
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  {targetType === 'meetup_chat'
                    ? 'Opisz, co jest nie tak. Po zgłoszeniu zespół będzie mógł przeczytać tę rozmowę.'
                    : 'Opisz, co jest nie tak. Zgłoszenie zobaczy tylko zespół Sąsiedzko.'}
                </Typography>
                <TextField
                  label="Powód zgłoszenia"
                  multiline
                  minRows={3}
                  required
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
                />
                <Typography variant="body2" color="text.secondary">
                  Jeśli ktoś jest w niebezpieczeństwie, zadzwoń pod numer alarmowy 112.
                </Typography>
                {status === 'error' && (
                  <Alert severity="error">Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.</Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={close}>Anuluj</Button>
              <Button type="submit" variant="contained" disabled={reason.trim().length < 3 || status === 'sending'}>
                {status === 'sending' ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </>
  )
}
