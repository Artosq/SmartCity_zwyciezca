import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { supabase } from '../../lib/supabase'
import { BAN_DURATIONS, banUser, hideContent, restoreContent, when, who } from './adminApi'

// Jeden wiersz listy w panelu: biała karta z treścią i przyciskami pod spodem.
export function Row({ children, actions, muted }: { children: ReactNode; actions?: ReactNode; muted?: boolean }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '18px', opacity: muted ? 0.65 : 1 }}>
      {children}
      {actions && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {actions}
        </Stack>
      )}
    </Paper>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <Typography color="text.secondary">{children}</Typography>
}

interface ReasonDialogProps {
  title: string
  label?: string
  // ban: dodatkowo wybór czasu trwania
  withDuration?: boolean
  confirmLabel: string
  onClose: () => void
  // zwraca komunikat błędu albo null
  onSubmit: (reason: string, hours: number | null) => Promise<string | null>
}

// Okno z powodem decyzji (ukrycie treści, ban). Powód zobaczy osoba, której decyzja dotyczy.
export function ReasonDialog({ title, label = 'Powód', withDuration, confirmLabel, onClose, onSubmit }: ReasonDialogProps) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const message = await onSubmit(reason.trim(), withDuration ? BAN_DURATIONS[duration].hours : null)
    setBusy(false)
    if (message) setError(message)
    else onClose()
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label={label}
              helperText="Zobaczy go osoba, której dotyczy decyzja."
              multiline
              minRows={2}
              required
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {withDuration && (
              <TextField select label="Na jak długo" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {BAN_DURATIONS.map((item, index) => (
                  <MenuItem key={item.label} value={index}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Anuluj</Button>
          <Button type="submit" variant="contained" color="error" disabled={reason.trim().length < 3 || busy}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// Przycisk „Zbanuj" z oknem powodu i czasu trwania.
export function BanButton({ adminId, userId, onDone }: { adminId: string; userId: string; onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="small" color="error" variant="outlined" onClick={() => setOpen(true)}>
        Zbanuj osobę
      </Button>
      {open && (
        <ReasonDialog
          title="Zbanuj osobę"
          label="Powód bana"
          withDuration
          confirmLabel="Zbanuj"
          onClose={() => setOpen(false)}
          onSubmit={async (reason, hours) => {
            const error = await banUser(adminId, userId, reason, hours)
            if (!error) onDone?.()
            return error
          }}
        />
      )}
    </>
  )
}

interface HideButtonProps {
  adminId: string
  table: 'events' | 'meetups' | 'messages'
  id: string
  hidden: boolean
  onDone?: () => void
}

// Przycisk „Ukryj" / „Przywróć" dla wydarzenia, spotkania albo wiadomości.
export function HideButton({ adminId, table, id, hidden, onDone }: HideButtonProps) {
  const [open, setOpen] = useState(false)

  if (hidden) {
    return (
      <Button
        size="small"
        variant="outlined"
        onClick={async () => {
          await restoreContent(adminId, table, id)
          onDone?.()
        }}
      >
        Przywróć
      </Button>
    )
  }

  return (
    <>
      <Button size="small" color="error" variant="outlined" onClick={() => setOpen(true)}>
        Ukryj
      </Button>
      {open && (
        <ReasonDialog
          title="Ukryj treść"
          label="Powód ukrycia"
          confirmLabel="Ukryj"
          onClose={() => setOpen(false)}
          onSubmit={async (reason) => {
            const error = await hideContent(adminId, table, id, reason)
            if (!error) onDone?.()
            return error
          }}
        />
      )}
    </>
  )
}

// Podgląd rozmowy: czat wydarzenia albo zgłoszona rozmowa „We dwoje".
// Przy każdej wiadomości można ją ukryć lub przywrócić oraz zbanować autora.
export function ChatViewer({ adminId, scope, scopeId }: { adminId: string; scope: 'event' | 'meetup'; scopeId: string }) {
  const [messages, setMessages] = useState<any[] | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('id, content, created_at, is_hidden, user_id, profiles(id, name)')
      .eq('scope', scope)
      .eq('scope_id', scopeId)
      .order('created_at')
    setMessages(data ?? [])
  }, [scope, scopeId])

  useEffect(() => {
    setMessages(null)
    load()
  }, [load])

  if (messages === null) return <Empty>Ładowanie rozmowy…</Empty>
  if (messages.length === 0) {
    return (
      <Empty>
        {scope === 'meetup'
          ? 'Brak wiadomości albo ta rozmowa nie została zgłoszona przez żadną z dwóch osób.'
          : 'W tej rozmowie nie ma jeszcze wiadomości.'}
      </Empty>
    )
  }

  return (
    <Stack spacing={1}>
      {messages.map((message) => (
        <Row
          key={message.id}
          muted={message.is_hidden}
          actions={
            <>
              <HideButton adminId={adminId} table="messages" id={message.id} hidden={message.is_hidden} onDone={load} />
              <BanButton adminId={adminId} userId={message.user_id} />
            </>
          }
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 800 }}>{who(message.profiles, message.user_id)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {when(message.created_at)}
            </Typography>
            {message.is_hidden && <Chip size="small" label="ukryta" />}
          </Stack>
          <Box sx={{ mt: 0.5, wordBreak: 'break-word' }}>{message.content}</Box>
        </Row>
      ))}
    </Stack>
  )
}
