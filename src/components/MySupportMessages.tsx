import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatShortDate } from '../lib/eventDisplay'
import { supabase } from '../lib/supabase'

interface SupportRow {
  id: string
  kind: 'contact' | 'bug'
  message: string
  reply: string | null
  status: 'open' | 'answered' | 'closed'
  created_at: string
}

const STATUS: Record<SupportRow['status'], string> = {
  open: 'czeka na odpowiedź',
  answered: 'odpowiedziano',
  closed: 'zamknięte',
}

interface Props {
  userId: string
  // zmiana wartości odświeża listę (np. po wysłaniu nowej wiadomości)
  refreshKey: number
}

// „Moje zgłoszenia" na stronie Pomoc: wiadomości wysłane do zespołu i odpowiedzi na nie.
export default function MySupportMessages({ userId, refreshKey }: Props) {
  const [rows, setRows] = useState<SupportRow[]>([])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('support_messages')
      .select('id, kind, message, reply, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled) setRows((data as SupportRow[] | null) ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

  if (rows.length === 0) return null

  return (
    <Box component="section">
      <Typography variant="h2" sx={{ mb: 1.5 }}>
        Moje zgłoszenia
      </Typography>
      <Stack spacing={1.25}>
        {rows.map((row) => (
          <Box key={row.id} sx={{ p: 2, borderRadius: '22px', bgcolor: '#f4f4f5' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                {row.kind === 'bug' ? 'Zgłoszenie błędu' : 'Wiadomość'} · {formatShortDate(row.created_at)}
              </Typography>
              <Chip size="small" color={row.status === 'answered' ? 'success' : 'default'} label={STATUS[row.status]} />
            </Stack>
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.message}</Typography>
            {row.reply && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <strong>Odpowiedź zespołu:</strong> {row.reply}
              </Alert>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
