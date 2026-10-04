import { useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import SectionCard from './SectionCard'
import type { Category } from '../lib/types'
import { supabase } from '../lib/supabase'

// Pola, które AI wyodrębnia ze zdania (odpowiadają formularzowi dodawania wydarzenia).
export interface ParsedEvent {
  title: string
  description: string
  category_slug: string
  target_groups: string[]
  starts_at: string
  place_name: string
  capacity: number | null
}

// Rozpoznawanie mowy jest tylko w części przeglądarek (Chrome/Safari) — wykrywamy je.
const SpeechRecognitionCtor: (new () => {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void
  onend: () => void
  onerror: () => void
  start: () => void
  stop: () => void
}) | undefined =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || undefined

interface Props {
  categories: Category[]
  onFilled: (fields: ParsedEvent) => void
}

// „Wydarzenie z jednego zdania": napisz albo podyktuj zdanie, a AI wypełni formularz.
export default function OneSentenceEvent({ categories, onFilled }: Props) {
  const [sentence, setSentence] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const voiceSupported = Boolean(SpeechRecognitionCtor)

  const toggleVoice = () => {
    if (!SpeechRecognitionCtor) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    setError('')
    const rec = new SpeechRecognitionCtor()
    rec.lang = 'pl-PL'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => setSentence(e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  const fill = async () => {
    const text = sentence.trim()
    if (!text) return
    setLoading(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-event', {
        body: {
          sentence: text,
          now: new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
          categories: categories.map((c) => ({ slug: c.slug })),
        },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)
      if (!data?.fields) throw new Error('Brak odpowiedzi.')
      onFilled(data.fields as ParsedEvent)
    } catch (e) {
      setError('Nie udało się odczytać zdania. Uzupełnij formularz ręcznie. (' + String((e as Error).message ?? e) + ')')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      icon={<AutoAwesomeIcon />}
      title="Opisz jednym zdaniem ✨"
      hint="Napisz albo podyktuj, a resztę wypełnimy za Ciebie. Np. „urodziny babci w sobotę o 15 w parku Jordana, do 10 osób, dla seniorów”."
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="np. kiermasz ciast w sobotę o 12 w parku Jordana, dla rodzin z dziećmi"
          multiline
          minRows={2}
          slotProps={{
            input: voiceSupported
              ? {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <IconButton
                        onClick={toggleVoice}
                        color={listening ? 'error' : 'primary'}
                        aria-label={listening ? 'Zatrzymaj dyktowanie' : 'Dyktuj głosem'}
                      >
                        {listening ? <StopIcon /> : <MicIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              : undefined,
          }}
        />
        {listening && (
          <Alert severity="info" sx={{ py: 0 }}>
            Słucham… mów po polsku.
          </Alert>
        )}
        {error && <Alert severity="warning">{error}</Alert>}
        <Button
          variant="contained"
          onClick={fill}
          disabled={loading || !sentence.trim()}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Czytam…' : 'Wypełnij formularz'}
        </Button>
      </Box>
    </SectionCard>
  )
}
