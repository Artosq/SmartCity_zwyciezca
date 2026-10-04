import { useRef, useState, type ChangeEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { supabase } from '../lib/supabase'

// Bucket i jego limity tworzy migracja 007_uploads_and_shopping.sql.
const BUCKET = 'event-images'
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface Props {
  userId: string
  // publiczny adres przesłanego zdjęcia albo null
  value: string | null
  onChange: (url: string | null) => void
}

// Wybór zdjęcia z pliku: przesyła je do Supabase Storage (folder użytkownika) i pokazuje podgląd.
export default function ImageUpload({ userId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // ten sam plik można wybrać ponownie
    if (!file) return

    setError('')
    if (!ACCEPTED.includes(file.type)) return setError('Wybierz zdjęcie w formacie JPG, PNG, WebP albo GIF.')
    if (file.size > MAX_BYTES) return setError('Zdjęcie jest za duże — maksymalnie 5 MB.')

    setUploading(true)
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
    })
    setUploading(false)

    if (uploadError) {
      return setError(
        `Nie udało się przesłać zdjęcia (${uploadError.message}). Jeśli to świeża baza, uruchom migrację 007.`,
      )
    }
    onChange(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
  }

  return (
    <Stack spacing={1.5}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFile}
        hidden
        aria-hidden
        tabIndex={-1}
      />

      {value ? (
        <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', animation: 'popIn 0.25s ease' }}>
          <Box
            component="img"
            src={value}
            alt="Podgląd zdjęcia wydarzenia"
            sx={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }}
          />
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', right: 12, bottom: 12 }}>
            <Button variant="contained" color="secondary" size="small" onClick={() => inputRef.current?.click()}>
              Zmień
            </Button>
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<DeleteOutlinedIcon />}
              onClick={() => onChange(null)}
              sx={{ bgcolor: 'background.paper' }}
            >
              Usuń
            </Button>
          </Stack>
        </Box>
      ) : (
        <ButtonBase
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          sx={{
            flexDirection: 'column',
            gap: 1,
            width: '100%',
            py: 4,
            px: 2,
            borderRadius: '24px',
            border: '2px dashed',
            borderColor: 'primary.main',
            bgcolor: 'rgba(75,59,240,0.05)',
            color: 'primary.main',
            transition: 'background-color .2s ease, transform .15s ease',
            '&:hover': { bgcolor: 'rgba(75,59,240,0.1)', transform: 'translateY(-2px)' },
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          {uploading ? <CircularProgress size={36} /> : <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 44 }} />}
          <Typography sx={{ fontWeight: 800 }}>
            {uploading ? 'Przesyłanie…' : 'Wybierz zdjęcie z urządzenia'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            JPG, PNG, WebP lub GIF, do 5 MB. Bez zdjęcia pokażemy ilustrację kategorii.
          </Typography>
        </ButtonBase>
      )}

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  )
}
