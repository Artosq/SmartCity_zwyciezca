import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Collapse from '@mui/material/Collapse'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  AUDIENCES,
  emergencyFor,
  FORBIDDEN,
  LESSON_CATEGORIES,
  LESSONS,
  matches,
  quizFor,
  SAFE_NOTE,
  SCAMS,
  STEPS,
  type Audience,
  type Lesson,
  type LessonCategory,
  type Scam,
} from '../data/safety'
import { BRAND } from '../theme'

const AUDIENCE_STORAGE_KEY = 'sasiedzko.safety.audience'
const PROGRESS_STORAGE_KEY = 'sasiedzko.safety.lessons'
const CARD_BG = '#f4f4f5'
const DANGER = '#b91c1c'
const HERO = `linear-gradient(135deg, ${BRAND.violet} 0%, #7c3aed 100%)`

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // brak dostępu do localStorage: wybór działa do odświeżenia strony
  }
}

// Okrągły chip wyboru (grupa odbiorców, kategoria lekcji).
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        gap: 0.75,
        px: 2,
        minHeight: 44,
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
        bgcolor: active ? 'secondary.main' : 'background.paper',
        boxShadow: '0 2px 10px rgba(17,17,17,0.14)',
        transition: 'transform .15s ease, background-color .2s ease',
        '&:hover': { transform: 'translateY(-2px)' },
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      {children}
    </ButtonBase>
  )
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="h2">{children}</Typography>
      {hint && <Typography color="text.secondary">{hint}</Typography>}
    </Box>
  )
}

// Jeden sposób działania oszusta: po rozwinięciu wyjaśnienie, typowe zdanie i „co robię".
function ScamItem({ scam }: { scam: Scam }) {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ borderRadius: '22px', bgcolor: CARD_BG, overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1,
          minHeight: 56,
          textAlign: 'left',
          fontWeight: 700,
          fontSize: '1rem',
          '&:hover': { bgcolor: '#e9e9ec' },
        }}
      >
        <span>
          <span aria-hidden>{scam.emoji}</span> {scam.title}
        </span>
        <Box component="span" aria-hidden sx={{ display: 'flex', color: 'primary.main' }}>
          {open ? <RemoveIcon /> : <AddIcon />}
        </Box>
      </ButtonBase>
      <Collapse in={open}>
        <Stack spacing={1.5} sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Typography sx={{ lineHeight: 1.6 }}>{scam.text}</Typography>
          <Box
            sx={{
              alignSelf: 'flex-start',
              px: 1.5,
              py: 0.5,
              borderRadius: '999px',
              border: `2px dashed ${DANGER}`,
              bgcolor: 'background.paper',
              color: DANGER,
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            „{scam.example}"
          </Box>
          <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'secondary.main', fontWeight: 700 }}>
            ✓ Co robię: {scam.action}
          </Box>
        </Stack>
      </Collapse>
    </Box>
  )
}

interface LessonCardProps {
  lesson: Lesson
  // ile kroków użytkownik już przeszedł
  done: number
  onOpen: () => void
}

function LessonCard({ lesson, done, onOpen }: LessonCardProps) {
  const total = lesson.steps.length
  const finished = done >= total
  const label = finished ? 'Gotowe' : done > 0 ? 'Dalej' : 'Start'

  return (
    <ButtonBase
      onClick={onOpen}
      sx={{
        width: '100%',
        gap: 1.5,
        p: 1.5,
        borderRadius: '22px',
        textAlign: 'left',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 16px rgba(17,17,17,0.08)',
        transition: 'transform .15s ease',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: '18px',
          background: lesson.gradient,
          fontSize: 28,
        }}
      >
        {lesson.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800 }}>{lesson.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {lesson.minutes} min · dla początkujących
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(Math.min(done, total) / total) * 100}
          aria-label={`Postęp lekcji: ${Math.min(done, total)} z ${total}`}
          sx={{
            mt: 0.75,
            height: 6,
            borderRadius: 3,
            bgcolor: '#e4e4e7',
            '& .MuiLinearProgress-bar': { bgcolor: '#65a30d', borderRadius: 3 },
          }}
        />
      </Box>
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          px: 1.75,
          py: 0.75,
          borderRadius: '999px',
          fontWeight: 800,
          fontSize: '0.9rem',
          bgcolor: finished ? '#e4e4e7' : 'secondary.main',
        }}
      >
        {label}
      </Box>
    </ButtonBase>
  )
}

interface LessonDialogProps {
  lesson: Lesson
  start: number
  onProgress: (done: number) => void
  onClose: () => void
}

// Lekcja krok po kroku. Każde „Dalej" zapisuje postęp, więc można wrócić w dowolnej chwili.
function LessonDialog({ lesson, start, onProgress, onClose }: LessonDialogProps) {
  const total = lesson.steps.length
  const [index, setIndex] = useState(start >= total ? 0 : start)
  const step = lesson.steps[index]
  const last = index === total - 1

  const next = () => {
    onProgress(Math.max(start, index + 1))
    if (last) onClose()
    else setIndex(index + 1)
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '28px' } } }}>
      <Box aria-hidden sx={{ height: 96, background: lesson.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
        {lesson.emoji}
      </Box>
      <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>{lesson.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }} aria-live="polite">
          Krok {index + 1} z {total}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {step.title}
        </Typography>
        <Typography sx={{ lineHeight: 1.65 }}>{step.text}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {index > 0 && <Button onClick={() => setIndex(index - 1)}>Wstecz</Button>}
        <Button onClick={onClose}>Zamknij</Button>
        <Button variant="contained" color="secondary" onClick={next}>
          {last ? 'Zakończ lekcję' : 'Dalej'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Quiz „Czy to wiadomość od oszusta?": pięć sytuacji, po każdej odpowiedzi krótkie wyjaśnienie.
function Quiz({ audience }: { audience: Audience }) {
  const questions = quizFor(audience)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const finished = index >= questions.length
  const answered = answers.length > index
  const question = questions[Math.min(index, questions.length - 1)]
  const score = answers.filter(Boolean).length

  const restart = () => {
    setIndex(0)
    setAnswers([])
  }

  return (
    <Box sx={{ p: 2.5, borderRadius: '28px', background: HERO, color: '#ffffff' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontWeight: 700 }} aria-live="polite">
          {finished ? 'Koniec quizu' : `Pytanie ${index + 1} z ${questions.length}`}
        </Typography>
        <Box sx={{ px: 1.5, py: 0.25, borderRadius: '999px', bgcolor: 'secondary.main', color: BRAND.ink, fontWeight: 800, fontSize: '0.85rem' }}>
          Quiz
        </Box>
      </Stack>

      {finished ? (
        <Stack spacing={1.5}>
          <Typography variant="h2" sx={{ color: '#ffffff' }}>
            Twój wynik: {score} z {questions.length}
          </Typography>
          <Typography>
            {score === questions.length
              ? 'Brawo, oszust nie miałby z Tobą łatwo.'
              : 'Dobra robota. Przeczytaj jeszcze raz sekcję o rozpoznawaniu oszustów i spróbuj ponownie.'}
          </Typography>
          <Button variant="contained" color="secondary" onClick={restart} sx={{ alignSelf: 'flex-start', borderRadius: '999px' }}>
            Zagraj jeszcze raz
          </Button>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Typography variant="h2" sx={{ color: '#ffffff' }}>
            Co robisz?
          </Typography>
          <Box sx={{ p: 2, borderRadius: '18px', bgcolor: '#ffffff', color: BRAND.ink }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.04em' }}>
              {question.sender}
            </Typography>
            <Typography sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{question.message}</Typography>
          </Box>

          {answered ? (
            <>
              <Alert severity={answers[index] ? 'success' : 'warning'} sx={{ borderRadius: '16px' }}>
                <strong>{answers[index] ? 'Dobrze!' : 'To pułapka.'}</strong> {question.explanation}
              </Alert>
              <Button variant="contained" color="secondary" onClick={() => setIndex(index + 1)} sx={{ borderRadius: '999px' }}>
                {index === questions.length - 1 ? 'Zobacz wynik' : 'Następne pytanie'}
              </Button>
            </>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {question.options.map((option, optionIndex) => (
                <Button
                  key={option.label}
                  fullWidth
                  variant={optionIndex === 0 ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => setAnswers([...answers, option.correct])}
                  sx={{
                    borderRadius: '999px',
                    ...(optionIndex !== 0 && { color: '#ffffff', borderColor: '#ffffff', borderWidth: 2, '&:hover': { borderColor: '#ffffff', borderWidth: 2 } }),
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      )}

      <Stack direction="row" spacing={0.75} sx={{ mt: 2 }} aria-hidden>
        {questions.map((_, step) => (
          <Box
            key={step}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: step < answers.length ? 'secondary.main' : 'rgba(255,255,255,0.35)' }}
          />
        ))}
      </Stack>
    </Box>
  )
}

// Strona „Bezpieczna sieć": jak korzystać z technologii, rozpoznać oszusta i nie oddać nikomu swoich danych.
export default function SafetyPage() {
  const [audience, setAudienceState] = useState<Audience>(() => readStored<Audience>(AUDIENCE_STORAGE_KEY, 'all'))
  const [category, setCategory] = useState<LessonCategory | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>(() => readStored(PROGRESS_STORAGE_KEY, {}))
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null)
  const [shared, setShared] = useState('')

  const setAudience = (next: Audience) => {
    setAudienceState(next)
    store(AUDIENCE_STORAGE_KEY, next)
  }

  const saveProgress = (lessonId: string, done: number) => {
    const next = { ...progress, [lessonId]: done }
    setProgress(next)
    store(PROGRESS_STORAGE_KEY, next)
  }

  const lessons = LESSONS.filter((lesson) => matches(lesson, audience) && (category === null || lesson.category === category))
  const emergency = emergencyFor(audience)

  async function share() {
    const data = {
      title: 'Bezpieczna sieć · Sąsiedzko',
      text: 'Jak rozpoznać oszusta w internecie i nie oddać nikomu swoich danych. Prosto i bez żargonu.',
      url: `${window.location.origin}/bezpieczna-siec/`,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(data.url)
        setShared('Link skopiowany. Możesz go wkleić w wiadomości do bliskich.')
      }
    } catch {
      // użytkownik zamknął okno udostępniania, nic się nie stało
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3.5} className="stagger">
        <Box>
          <Typography variant="h1">Bezpieczna sieć</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Jak korzystać z technologii, rozpoznać oszusta i nie oddać nikomu swoich danych. Prosto i bez żargonu.
          </Typography>
          <Stack direction="row" role="group" aria-label="Dla kogo są porady" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {AUDIENCES.map((item) => (
              <Pill key={item.id} active={audience === item.id} onClick={() => setAudience(item.id)}>
                <span aria-hidden>{item.emoji}</span>
                {item.label}
              </Pill>
            ))}
          </Stack>
        </Box>

        <Box component="section">
          <Box sx={{ p: 2.5, borderRadius: '28px', background: HERO, color: '#ffffff' }}>
            <Typography sx={{ fontWeight: 700 }}>Zanim klikniesz, odpowiesz lub zapłacisz</Typography>
            <Typography component="p" sx={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, color: 'secondary.main' }}>
              3 kroki
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>które chronią Twoje pieniądze i dane</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25, mt: 1.25 }}>
            {STEPS.map((step) => (
              <Box key={step.title} sx={{ p: 1.5, borderRadius: '20px', bgcolor: step.color, color: BRAND.ink }}>
                <Box aria-hidden sx={{ fontSize: 28, lineHeight: 1.2 }}>
                  {step.emoji}
                </Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.5 }}>{step.title}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.35 }}>
                  {step.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="section">
          <SectionTitle>Jak rozpoznać oszusta</SectionTitle>
          <Stack spacing={1.25}>
            {SCAMS.filter((scam) => matches(scam, audience)).map((scam) => (
              <ScamItem key={scam.title} scam={scam} />
            ))}
          </Stack>
        </Box>

        <Box component="section">
          <SectionTitle hint="Nigdy, nikomu, nigdzie. Ani w czacie, ani przez telefon, ani w wiadomości.">
            Jakich danych nie podawać
          </SectionTitle>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderRadius: '22px', bgcolor: CARD_BG, overflow: 'hidden' }}>
            {FORBIDDEN.filter((item) => matches(item, audience)).map((item, index) => (
              <Stack
                component="li"
                key={item.title}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', p: 1.5, borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
              >
                <Box
                  aria-hidden
                  sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', bgcolor: item.color, fontSize: 22 }}
                >
                  {item.emoji}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </Box>
                <Box
                  role="img"
                  aria-label="Nie podawaj"
                  sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', bgcolor: '#dc2626', color: '#ffffff' }}
                >
                  <CloseIcon fontSize="small" />
                </Box>
              </Stack>
            ))}
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 1.25, p: 1.5, borderRadius: '20px', bgcolor: 'secondary.main' }}>
            <Box aria-hidden sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', bgcolor: BRAND.ink, color: '#ffffff' }}>
              <CheckIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>{SAFE_NOTE}</Typography>
          </Stack>
        </Box>

        <Box component="section">
          <SectionTitle>Jak korzystać z technologii</SectionTitle>
          <Stack direction="row" role="group" aria-label="Temat lekcji" sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            <Pill active={category === null} onClick={() => setCategory(null)}>
              Wszystkie
            </Pill>
            {LESSON_CATEGORIES.map((item) => (
              <Pill key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
                {item.label}
              </Pill>
            ))}
          </Stack>
          <Stack spacing={1.25}>
            {lessons.length === 0 && <Typography color="text.secondary">W tym temacie nie ma jeszcze lekcji dla wybranej grupy.</Typography>}
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} done={progress[lesson.id] ?? 0} onOpen={() => setOpenLesson(lesson)} />
            ))}
          </Stack>
        </Box>

        <Box component="section">
          <SectionTitle>Sprawdź swoją czujność</SectionTitle>
          {/* key: zmiana grupy odbiorców zaczyna quiz od nowa, z innymi pytaniami */}
          <Quiz key={audience === 'kids' ? 'kids' : 'adults'} audience={audience} />
        </Box>

        <Box component="section">
          <SectionTitle
            hint={
              audience === 'kids'
                ? 'Nie jesteś z tym sam(a). Im szybciej powiesz dorosłemu, tym łatwiej to zatrzymać.'
                : 'Działaj szybko. Im wcześniej zareagujesz, tym większa szansa na odzyskanie pieniędzy.'
            }
          >
            Co zrobić, gdy coś się stało
          </SectionTitle>
          <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, borderRadius: '22px', bgcolor: CARD_BG, overflow: 'hidden' }}>
            {emergency.map((step, index) => (
              <Stack
                component="li"
                key={step.title}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', p: 1.5, borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
              >
                <Box
                  aria-hidden
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    fontWeight: 800,
                    bgcolor: step.urgent ? '#dc2626' : 'secondary.main',
                    color: step.urgent ? '#ffffff' : BRAND.ink,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.text}
                  </Typography>
                </Box>
                {step.phone && (
                  <Button
                    component="a"
                    // 8080 to numer, na który przesyła się SMS; pozostałe to numery do zadzwonienia
                    href={`${step.phone === '8080' ? 'sms' : 'tel'}:${step.phone.replace(/\s/g, '')}`}
                    variant="contained"
                    size="small"
                    aria-label={`${step.phone === '8080' ? 'Wyślij SMS na' : 'Zadzwoń pod'} ${step.phone}`}
                    sx={{ flexShrink: 0, minHeight: 44, borderRadius: '999px', bgcolor: 'background.paper', color: BRAND.ink, fontWeight: 800, boxShadow: '0 2px 8px rgba(17,17,17,0.14)', '&:hover': { bgcolor: '#ffffff' } }}
                  >
                    {step.phone}
                  </Button>
                )}
              </Stack>
            ))}
          </Box>
          {audience === 'kids' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Gdy ktoś jest w niebezpieczeństwie, od razu zadzwoń pod 112.
            </Typography>
          )}
        </Box>

        <Stack spacing={1.5}>
          {shared && <Alert severity="success">{shared}</Alert>}
          <Button variant="contained" color="secondary" size="large" onClick={share} sx={{ borderRadius: '999px', minHeight: 56 }}>
            Udostępnij bliskim
          </Button>
          <Button
            component={RouterLink}
            to="/pomoc/?napisz=1"
            variant="outlined"
            size="large"
            sx={{ borderRadius: '999px', minHeight: 56, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            Zgłoś podejrzaną osobę lub wiadomość
          </Button>
        </Stack>
      </Stack>

      {openLesson && (
        <LessonDialog
          lesson={openLesson}
          start={progress[openLesson.id] ?? 0}
          onProgress={(done) => saveProgress(openLesson.id, done)}
          onClose={() => setOpenLesson(null)}
        />
      )}
    </Container>
  )
}
