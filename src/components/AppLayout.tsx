import { useEffect, useState, type MouseEvent } from 'react'
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import GavelIcon from '@mui/icons-material/Gavel'
import HomeIcon from '@mui/icons-material/Home'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import HelpIcon from '@mui/icons-material/Help'
import MapIcon from '@mui/icons-material/Map'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import SearchIcon from '@mui/icons-material/Search'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useAccessibility } from '../context/AccessibilityContext'

import { useCity } from '../context/CityContext'
import { CITIES } from '../data/cities'
import { useLang } from '../i18n/LanguageContext'
import { BRAND } from '../theme'
import BanBanner from './BanBanner'
import LanguageSwitcher from './LanguageSwitcher'
import LiveBanner from './live/LiveBanner'
import SeniorModeSwitch from './SeniorModeSwitch'

// `bottom: false` = pozycja tylko w menu i w nagłówku na desktopie (na telefonie mapa ma swój przycisk).
const NAV = [
  { to: '/', labelKey: 'nav.start', icon: <HomeIcon />, bottom: true },
  { to: '/mapa', labelKey: 'nav.map', icon: <MapIcon />, bottom: false },
  { to: '/czat', labelKey: 'nav.chat', icon: <ChatIcon />, bottom: true },
  { to: '/dodaj', labelKey: 'nav.add', icon: <AddCircleIcon />, bottom: true },
  { to: '/pomoc', labelKey: 'nav.help', icon: <HelpIcon />, bottom: true },
  { to: '/login', labelKey: 'nav.account', icon: <PersonIcon />, bottom: true },
]

// Menu dodatkowe (hamburger) — NIE powiela głównej nawigacji; linki pomocnicze.
const MORE = [
  { to: '/bezpieczna-siec', labelKey: 'menu.safety', icon: <ShieldOutlinedIcon /> },
  { to: '/regulamin', labelKey: 'menu.terms', icon: <GavelIcon /> },
  { to: '/prywatnosc', labelKey: 'menu.privacy', icon: <LockOutlinedIcon /> },
  { to: '/ustawienia', labelKey: 'menu.settings', icon: <SettingsOutlinedIcon /> },
]

// Wspólna rama stron: nagłówek (miasto + menu) i nawigacja
// (telefon: dolny pasek, od md: linki w nagłówku).
export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useLang()
  const { city, selectCity } = useCity()
  const { senior } = useAccessibility()
  // W trybie dla seniorów nawigacja ma podpisy i jest szersza, więc wyszukiwarka mieści się
  // w nagłówku dopiero na dużych ekranach; na średnich schodzi do osobnego wiersza.
  const wide = senior ? 'lg' : 'md'
  const [cityAnchor, setCityAnchor] = useState<HTMLElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  // Wyszukiwanie żyje w adresie (?q=…), a wyniki pokazuje strona główna.
  const runSearch = (value: string) => {
    setQuery(value)
    const trimmed = value.trim()
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/', { replace: pathname === '/' })
  }

  const active = NAV.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )?.to

  const bottomNav = NAV.filter((item) => item.bottom)
  const activeBottom = bottomNav.findIndex((item) => item.to === active)

  // Tytuł karty przeglądarki mówi, na którym ekranie jest użytkownik (WCAG 2.4.2).
  const screen = [...NAV, ...MORE].find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))
  useEffect(() => {
    document.title = screen && screen.to !== '/' ? `${t(screen.labelKey)} · Sąsiedzko` : 'Sąsiedzko: mapa sąsiedzkich wydarzeń'
  }, [screen, t])

  // Wyszukiwarka wydarzeń tylko na stronie głównej (Pomoc ma własną).
  const showSearch = pathname === '/'

  // Jedno pole wyszukiwania — w nagłówku na desktopie, osobnym paskiem na telefonie.
  const searchField = (
    <TextField
      size="small"
      placeholder={t('search.placeholder')}
      value={query}
      onChange={(e) => runSearch(e.target.value)}
      aria-label={t('search.label')}
      fullWidth
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: 'background.paper' } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('search.clear')}
                size="small"
                edge="end"
                onClick={() => runSearch('')}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  )

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#faf9ff',
      }}
    >
      <a href="#tresc" className="skip-link">
        {t('a11y.skip')}
      </a>
      {/* Ożywione, markowe tło: miękkie poświaty (fiolet + limonka + róż), które delikatnie „oddychają". */}
      <Box
        aria-hidden
        className="ambient-bg"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(900px 520px at 6% -8%, rgba(75,59,240,0.16), transparent 60%),' +
            'radial-gradient(820px 520px at 98% -6%, rgba(200,255,0,0.20), transparent 55%),' +
            'radial-gradient(760px 640px at 86% 110%, rgba(236,72,153,0.12), transparent 55%)',
          animation: 'ambientFloat 20s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
      <Box
        component="header"
        className="app-bar"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(14px)',
          boxShadow: { md: '0 1px 0 rgba(17,17,17,0.06), 0 6px 20px rgba(17,17,17,0.04)' },
        }}
      >
        {pathname !== '/' && (
          <IconButton
            component={RouterLink}
            to="/"
            aria-label={t('header.back')}
            edge="start"
            sx={{ color: BRAND.ink, width: 48, height: 48 }}
          >
            <ArrowBackIcon sx={{ fontSize: 32 }} />
          </IconButton>
        )}
        <ButtonBase
          onClick={(e: MouseEvent<HTMLElement>) => setCityAnchor(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(cityAnchor)}
          aria-label={
            CITIES.length > 1
              ? t('header.cityChange', { city: city?.name ?? '' })
              : t('header.city', { city: city?.name ?? '' })
          }
          disabled={CITIES.length === 1}
          sx={{ gap: 0.75, minHeight: 48, borderRadius: 2, pr: 1 }}
        >
          <PlaceOutlinedIcon sx={{ fontSize: 28 }} />
          <Typography
            component="span"
            sx={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: senior ? BRAND.limeTextStrong : BRAND.limeText,
              textDecoration: 'underline',
              textDecorationColor: BRAND.lime,
              textDecorationThickness: 3,
              textUnderlineOffset: 4,
            }}
          >
            {city?.name}
          </Typography>
        </ButtonBase>
        <Menu anchorEl={cityAnchor} open={Boolean(cityAnchor)} onClose={() => setCityAnchor(null)}>
          {CITIES.map((item) => (
            <MenuItem
              key={item.slug}
              selected={item.slug === city?.slug}
              onClick={() => {
                selectCity(item.slug)
                setCityAnchor(null)
              }}
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>

        {showSearch && (
          <Box sx={{ display: { xs: 'none', [wide]: 'flex' }, flex: 1, maxWidth: 520, mx: 2 }}>
            {searchField}
          </Box>
        )}

        <Box
          component="nav"
          aria-label="Główna"
          sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto' }}
        >
          {NAV.map((item) => {
            const selected = item.to === active
            return (
              <ButtonBase
                key={item.to}
                component={RouterLink}
                to={item.to}
                title={t(item.labelKey)}
                aria-label={t(item.labelKey)}
                aria-current={selected ? 'page' : undefined}
                sx={{
                  position: 'relative',
                  gap: 1,
                  px: 1.5,
                  height: 46,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  whiteSpace: 'nowrap',
                  color: selected ? 'primary.main' : 'text.primary',
                  transition: 'background-color .2s ease, color .2s ease, transform .15s ease',
                  '&:hover': { bgcolor: 'rgba(75,59,240,0.08)', transform: 'translateY(-1px)' },
                  '&:active': { transform: 'scale(0.96)' },
                  '& svg': { transition: 'transform .25s ease', transform: selected ? 'scale(1.12)' : 'none' },
                  // limonkowa kreska wysuwa się pod aktywną pozycją
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 3,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    transform: selected ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
                  },
                }}
              >
                {item.icon}
                <Box component="span" sx={{ display: senior ? 'inline' : { md: 'none', lg: 'inline' } }}>
                  {t(item.labelKey)}
                </Box>
              </ButtonBase>
            )
          })}
        </Box>

        <IconButton
          onClick={() => setMenuOpen(true)}
          aria-label={t('menu.more')}
          sx={{
            ml: { xs: 'auto', md: 0 },
            width: 52,
            height: 52,
            borderRadius: '18px',
            color: BRAND.ink,
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
          }}
        >
          <MenuIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Box>

      {/* Pasek wyszukiwania na telefonie — osobny wiersz pod nagłówkiem. */}
      {showSearch && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: { xs: 'block', [wide]: 'none' },
            px: 2,
            pb: 1,
            bgcolor: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 6px 16px rgba(17,17,17,0.05)',
          }}
        >
          {searchField}
        </Box>
      )}

      <BanBanner />
      <LiveBanner />

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box component="nav" aria-label={t('menu.more')} sx={{ width: 280, pt: 2 }}>
          <Typography variant="h2" sx={{ px: 3, pb: 0.5 }}>
            Sąsiedzko
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 1 }}>
            {t('menu.more')}
          </Typography>

          {/* Przełącznik języka */}
          <Box sx={{ px: 3, pt: 1, pb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontWeight: 700 }}>
              {t('menu.language')}
            </Typography>
            <LanguageSwitcher />
          </Box>

          <Box sx={{ px: 3, pb: 1.5 }}>
            <SeniorModeSwitch />
          </Box>

          <List>
            {MORE.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={pathname.startsWith(item.to)}
                onClick={() => setMenuOpen(false)}
                sx={{ minHeight: 56, px: 3 }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 44 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={t(item.labelKey)}
                  slotProps={{ primary: { sx: { fontWeight: 700 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        id="tresc"
        tabIndex={-1}
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          // Tło zapewnia ożywiona warstwa poświat pod spodem — tu zostawiamy przezroczyste.
          bgcolor: 'transparent',
        }}
      >
        {/* key = ścieżka: przy zmianie ekranu zawartość pojawia się płynnie.
            Sama przezroczystość, bez przesuwania — transform zepsułby pływające przyciski i mapę. */}
        <Box key={pathname.replace(/\/$/, '')} sx={{ height: '100%', animation: 'pageIn 0.28s ease both' }}>
          <Outlet />
        </Box>
      </Box>

      <Paper
        component="nav"
        aria-label="Główna"
        className="app-bar"
        elevation={0}
        square
        sx={{
          display: { md: 'none' },
          position: 'relative',
          zIndex: 1100,
          pb: 'env(safe-area-inset-bottom)',
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 -6px 20px rgba(17,17,17,0.07)',
          borderRadius: '22px 22px 0 0',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${bottomNav.length}, 1fr)`,
            height: 66,
          }}
        >
          {activeBottom >= 0 && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: 8,
                left: 0,
                width: `${100 / bottomNav.length}%`,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
                transform: `translateX(${activeBottom * 100}%)`,
                transition: 'transform .38s cubic-bezier(.2,.8,.2,1)',
              }}
            >
              <Box sx={{ width: 58, height: 32, borderRadius: '999px', bgcolor: 'secondary.main' }} />
            </Box>
          )}
          {bottomNav.map((item) => {
            const selected = item.to === active
            return (
              <ButtonBase
                key={item.to}
                component={RouterLink}
                to={item.to}
                aria-current={selected ? 'page' : undefined}
                sx={{
                  position: 'relative',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  pt: '11px',
                  gap: '5px',
                  minWidth: 0,
                  color: selected ? BRAND.ink : 'primary.main',
                  transition: 'color .25s ease',
                  '& svg': {
                    fontSize: 26,
                    transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
                    transform: selected ? 'scale(1.08)' : 'none',
                  },
                  '&:active svg': { transform: 'scale(0.85)' },
                }}
              >
                {item.icon}
                <Box
                  component="span"
                  sx={{
                    maxWidth: '100%',
                    px: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.72rem',
                    lineHeight: 1,
                    fontWeight: selected ? 800 : 600,
                    color: selected ? 'text.primary' : 'text.secondary',
                    transition: 'color .25s ease',
                  }}
                >
                  {t(item.labelKey)}
                </Box>
              </ButtonBase>
            )
          })}
        </Box>
      </Paper>
    </Box>
  )
}
