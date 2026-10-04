import { useState, type FormEvent, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Icons
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PaletteIcon from '@mui/icons-material/Palette'
import SchoolIcon from '@mui/icons-material/School'
import CelebrationIcon from '@mui/icons-material/Celebration'
import ComputerIcon from '@mui/icons-material/Computer'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import { AVATARS } from '../data/avatars'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { BRAND } from '../theme'
import ActivityCalendar from './ActivityCalendar'
import HiddenContentNotice from './HiddenContentNotice'
import PendingRatings from './PendingRatings'
import ProfileAvatar from './ProfileAvatar'
import SectionCard from './SectionCard'

const AVAILABLE_INTERESTS = [
  { id: 'Sport', label: 'Sport i rekreacja', icon: <FitnessCenterIcon />, color: '#ef4444' },
  { id: 'Kultura', label: 'Kultura i Sztuka', icon: <PaletteIcon />, color: '#f59e0b' },
  { id: 'Edukacja', label: 'Rozwój i Edukacja', icon: <SchoolIcon />, color: '#10b981' },
  { id: 'Rozrywka', label: 'Rozrywka i Gry', icon: <CelebrationIcon />, color: '#8b5cf6' },
  { id: 'Technologia', label: 'IT i Technologia', icon: <ComputerIcon />, color: '#3b82f6' },
  { id: 'Muzyka', label: 'Koncerty i Muzyka', icon: <MusicNoteIcon />, color: '#ec4899' },
  { id: 'Networking', label: 'Spotkania i Biznes', icon: <PeopleIcon />, color: '#14b8a6' },
]

export default function AccountPanel() {
  const { 
    user, loading, birthDate, phone, bio, interests, 
    isAdult, ageCategory, rating, avatar, 
    saveBirthDate, saveAdditionalData, saveAvatar 
  } = useProfile()
  
  const [draftDate, setDraftDate] = useState<string | null>(null)
  const [savedDate, setSavedDate] = useState(false)
  const [errorDate, setErrorDate] = useState('')
  const [avatarError, setAvatarError] = useState('')

  const [phoneCode, setPhoneCode] = useState('+48')
  const [draftPhone, setDraftPhone] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [draftInterests, setDraftInterests] = useState<string[]>([])
  const [savedProfile, setSavedProfile] = useState(false)
  const [errorProfile, setErrorProfile] = useState('')

  useEffect(() => {
    if (!loading) {
      if (phone) {
        if (phone.startsWith('+380')) { setPhoneCode('+380'); setDraftPhone(phone.slice(4).trim()); }
        else if (phone.startsWith('+1')) { setPhoneCode('+1'); setDraftPhone(phone.slice(2).trim()); }
        else if (phone.startsWith('+48')) { setPhoneCode('+48'); setDraftPhone(phone.slice(3).trim()); }
        else { setPhoneCode('+48'); setDraftPhone(phone); }
      }
      setDraftBio(bio)
      setDraftInterests(interests)
    }
  }, [loading, phone, bio, interests])

  if (!user || loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="text.secondary">Ładowanie…</Typography>
      </Container>
    )
  }

  const name = (user.user_metadata?.name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Sąsiad'
  const dateValue = draftDate ?? birthDate ?? ''
  const today = new Date().toISOString().slice(0, 10)
  const hasRatings = rating.count > 0 && rating.avg !== null
  const average = Number(rating.avg ?? 0)
  const needsOnboarding = !phone || interests.length === 0

  const fullDraftPhone = draftPhone.trim() ? `${phoneCode} ${draftPhone.trim()}` : ''
  const isProfileChanged = fullDraftPhone !== phone || draftBio !== bio || JSON.stringify(draftInterests) !== JSON.stringify(interests)

  async function handleSaveDate(e: FormEvent) {
    e.preventDefault()
    setSavedDate(false)
    const message = await saveBirthDate(dateValue)
    setErrorDate(message ?? '')
    if (!message) {
      setSavedDate(true)
      setDraftDate(null)
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSavedProfile(false)
    const message = await saveAdditionalData(fullDraftPhone, draftInterests, draftBio)
    setErrorProfile(message ?? '')
    if (!message) {
      setSavedProfile(true)
    }
  }

  async function pickAvatar(id: string) {
    const next = avatar === id ? null : id
    const message = await saveAvatar(next)
    setAvatarError(message ?? '')
  }

  const toggleInterest = (interestId: string) => {
    setDraftInterests(prev => 
      prev.includes(interestId) ? prev.filter(i => i !== interestId) : [...prev, interestId]
    )
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Оставляем только цифры и ограничиваем длину до 15 символов
    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 15)
    setDraftPhone(onlyNums)
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2.5} className="stagger">
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            pt: 7,
            pb: 3,
            px: 2.5,
            textAlign: 'center',
            borderRadius: '28px',
            boxShadow: '0 6px 24px rgba(17,17,17,0.09)',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 96,
              background: `linear-gradient(120deg, ${BRAND.violet} 0%, #8b5cf6 55%, #ec4899 100%)`,
            }}
          />
          <ProfileAvatar
            avatar={avatar}
            name={name}
            size={104}
            sx={{
              position: 'relative',
              mx: 'auto',
              color: BRAND.ink,
              border: '5px solid #ffffff',
              boxShadow: '0 8px 22px rgba(17,17,17,0.2)',
              animation: 'popIn 0.4s ease 0.1s backwards',
            }}
          />

          <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', alignItems: 'center', mt: 1.5 }}>
            <Typography variant="h1">{name}</Typography>
            {isAdult && (
              <VerifiedIcon
                titleAccess="Konto osoby pełnoletniej"
                sx={{ color: 'primary.main', fontSize: 26 }}
              />
            )}
          </Stack>
          <Typography color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {user.email ?? 'Konto demo (tymczasowe)'}
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 2,
              px: 3,
              py: 1.5,
              borderRadius: '20px',
              bgcolor: '#fffbeb',
            }}
          >
            <Rating
              readOnly
              size="large"
              precision={0.5}
              value={hasRatings ? average : 0}
              getLabelText={(stars) => `${stars} na 5 gwiazdek`}
              sx={{ fontSize: '2.4rem', color: '#d97706' }}
            />
            <Typography sx={{ fontWeight: 800, mt: 0.25 }}>
              {hasRatings
                ? `${average.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`
                : 'Nowy organizator'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasRatings ? `średnia z ${rating.count} ocen` : 'Pierwsza ocena pojawi się po Twoim wydarzeniu.'}
            </Typography>
          </Box>
        </Paper>

        <HiddenContentNotice userId={user.id} />

        {/* Секция выбора аватара от коллеги */}
        <SectionCard
          icon={<EmojiEmotionsOutlinedIcon />}
          title="Twój awatar"
          hint="Wybierz zwierzaka — zobaczą go sąsiedzi na czacie i przy spotkaniach. Kliknij ponownie, by wrócić do inicjałów."
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            {AVATARS.map((a) => {
              const selected = avatar === a.id
              return (
                <ButtonBase
                  key={a.id}
                  onClick={() => pickAvatar(a.id)}
                  aria-label={a.label}
                  aria-pressed={selected}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    fontSize: '1.9rem',
                    bgcolor: selected ? 'primary.main' : '#eef2ff',
                    border: '2px solid',
                    borderColor: selected ? 'primary.main' : 'transparent',
                    boxShadow: selected ? '0 4px 14px rgba(17,17,17,0.18)' : 'none',
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  {a.emoji}
                </ButtonBase>
              )
            })}
          </Box>
          {avatarError && <Alert severity="error" sx={{ mt: 1.5 }}>{avatarError}</Alert>}
        </SectionCard>

        {needsOnboarding && (
          <Alert severity="warning" sx={{ borderRadius: '12px', fontWeight: 'bold' }}>
            Uzupełnij swój profil (telefon i zainteresowania), abyśmy mogli dopasować wydarzenia do Ciebie!
          </Alert>
        )}

        {/* Твоя секция настройки профиля */}
        <SectionCard icon={<AccountCircleOutlinedIcon />} title="O Tobie">
          <Stack component="form" onSubmit={handleSaveProfile} spacing={2.5}>
            <TextField
              label="Krótki opis (O mnie)"
              multiline
              rows={3}
              placeholder="Napisz kilka słów o sobie, co lubisz robić..."
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Numer telefonu"
              type="tel"
              placeholder="123 456 789"
              value={draftPhone}
              onChange={handlePhoneChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      variant="standard"
                      disableUnderline
                      sx={{ 
                        mr: 1, 
                        fontWeight: 'bold', 
                        color: 'text.secondary',
                        '& .MuiSelect-select': { py: 0 }
                      }}
                    >
                      <MenuItem value="+48">🇵🇱 +48</MenuItem>
                      <MenuItem value="+380">🇺🇦 +380</MenuItem>
                      <MenuItem value="+1">🇺🇸 +1</MenuItem>
                    </Select>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
                Wybierz swoje zainteresowania:
              </Typography>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {AVAILABLE_INTERESTS.map((item) => {
                  const isSelected = draftInterests.includes(item.id)
                  return (
                    <ListItemButton
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      sx={{
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'grey.200',
                        bgcolor: isSelected ? 'primary.50' : 'white',
                        transition: 'all 0.2s',
                        py: 1,
                        px: 2,
                        '&:hover': { bgcolor: isSelected ? 'primary.100' : 'grey.50' }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: isSelected ? 'primary.main' : `${item.color}15`, 
                          color: isSelected ? 'white' : item.color, 
                          mr: 2,
                          width: 40,
                          height: 40
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ fontWeight: isSelected ? 800 : 500, color: isSelected ? 'primary.main' : 'text.primary' }} 
                      />
                      {isSelected ? (
                        <CheckCircleIcon color="primary" />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: 'grey.300' }} />
                      )}
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>

            {errorProfile && <Alert severity="error">{errorProfile}</Alert>}
            {savedProfile && <Alert severity="success">Dane profilowe zostały zapisane.</Alert>}
            
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!isProfileChanged}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}
            >
              Zapisz dane
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard
          icon={<CalendarMonthIcon />}
          title="Twój kalendarz"
          hint="Wydarzenia, na które idziesz lub które organizujesz, i spotkania we dwoje."
        >
          <ActivityCalendar userId={user.id} />
        </SectionCard>

        <SectionCard icon={<CakeOutlinedIcon />} title="Wiek i data urodzenia">
          <Stack component="form" onSubmit={handleSaveDate} spacing={2}>
            <Typography color="text.secondary">
              Potrzebna do spotkań we dwoje, które są dostępne od 18 lat. Widzisz ją tylko Ty.
            </Typography>
            
            {birthDate && (
              <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Twoja kategoria wiekowa: <Typography component="span" color="primary.main" fontWeight="bold">{ageCategory}</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">Obliczona automatycznie na podstawie daty urodzenia.</Typography>
              </Box>
            )}

            <TextField
              label="Data urodzenia"
              type="date"
              required
              value={dateValue}
              onChange={(e) => setDraftDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: '1900-01-02', max: today } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            {errorDate && <Alert severity="error">{errorDate}</Alert>}
            {savedDate && (
              <Alert severity="success">
                Zapisano.{' '}
                {isAdult
                  ? 'Spotkania we dwoje są już dla Ciebie dostępne.'
                  : 'Spotkania we dwoje będą dostępne po ukończeniu 18 lat.'}
              </Alert>
            )}
            <Button type="submit" variant="contained" disabled={!dateValue || dateValue === birthDate} sx={{ py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}>
              Zapisz datę urodzenia
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard icon={<RateReviewOutlinedIcon />} title="Do oceny">
          <PendingRatings userId={user.id} />
        </SectionCard>

        <Button
          variant="outlined"
          size="large"
          startIcon={<LogoutIcon />}
          onClick={() => supabase.auth.signOut()}
          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold' }}
        >
          Wyloguj się
        </Button>
      </Stack>
    </Container>
  )
}