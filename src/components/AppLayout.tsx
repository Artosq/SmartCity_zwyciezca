import { useState, type MouseEvent } from 'react'
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import HomeIcon from '@mui/icons-material/Home'
import MailIcon from '@mui/icons-material/Mail'
import MapIcon from '@mui/icons-material/Map'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useCity } from '../context/CityContext'
import { CITIES } from '../data/cities'
import { BRAND } from '../theme'

// `bottom: false` = pozycja tylko w menu i w nagłówku na desktopie (na telefonie mapa ma swój przycisk).
const NAV = [
  { to: '/', label: 'Start', icon: <HomeIcon />, bottom: true },
  { to: '/mapa', label: 'Mapa', icon: <MapIcon />, bottom: false },
  { to: '/czat', label: 'Czat', icon: <ChatIcon />, bottom: true },
  { to: '/ogloszenia', label: 'Ogłoszenia', icon: <MailIcon />, bottom: true },
  { to: '/dodaj', label: 'Dodaj', icon: <AddCircleIcon />, bottom: true },
  { to: '/login', label: 'Konto', icon: <PersonIcon />, bottom: true },
]

// Wspólna rama stron: nagłówek (miasto + menu) i nawigacja
// (telefon: dolny pasek, od md: linki w nagłówku).
export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { city, selectCity } = useCity()
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

  // Jedno pole wyszukiwania — w nagłówku na desktopie, osobnym paskiem na telefonie.
  const searchField = (
    <TextField
      size="small"
      placeholder="Szukaj wydarzeń…"
      value={query}
      onChange={(e) => runSearch(e.target.value)}
      aria-label="Szukaj wydarzeń"
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
                aria-label="Wyczyść wyszukiwanie"
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
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: 'background.paper',
          borderBottom: { md: '1px solid' },
          borderColor: { md: 'divider' },
        }}
      >
        {pathname !== '/' && (
          <IconButton
            component={RouterLink}
            to="/"
            aria-label="Wróć na stronę główną"
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
          aria-label={CITIES.length > 1 ? `Miasto: ${city?.name}. Zmień miasto` : `Miasto: ${city?.name}`}
          disabled={CITIES.length === 1}
          sx={{ gap: 0.75, minHeight: 48, borderRadius: 2, pr: 1 }}
        >
          <PlaceOutlinedIcon sx={{ fontSize: 28 }} />
          <Typography
            component="span"
            sx={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: BRAND.limeText,
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

        <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, maxWidth: 520, mx: 2 }}>
          {searchField}
        </Box>

        <Box
          component="nav"
          aria-label="Główna"
          sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto' }}
        >
          {NAV.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              startIcon={item.icon}
              aria-current={item.to === active ? 'page' : undefined}
              sx={{
                color: item.to === active ? 'primary.main' : 'text.primary',
                bgcolor: item.to === active ? 'rgba(75,59,240,0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <IconButton
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          sx={{
            display: { md: 'none' },
            ml: 'auto',
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
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: 2,
          pb: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {searchField}
      </Box>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box component="nav" aria-label="Menu" sx={{ width: 280, pt: 2 }}>
          <Typography variant="h2" sx={{ px: 3, pb: 1 }}>
            Sąsiedzko
          </Typography>
          <List>
            {NAV.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={item.to === active}
                onClick={() => setMenuOpen(false)}
                sx={{ minHeight: 56, px: 3 }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 44 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.to === '/dodaj' ? 'Dodaj wydarzenie' : item.label}
                  slotProps={{ primary: { sx: { fontWeight: 700 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Outlet />
      </Box>

      <Paper
        component="nav"
        aria-label="Główna"
        elevation={0}
        square
        sx={{
          display: { md: 'none' },
          pb: 'env(safe-area-inset-bottom)',
          zIndex: 1100,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <BottomNavigation showLabels value={active ?? false} sx={{ height: 68 }}>
          {NAV.filter((item) => item.bottom).map((item) => (
            <BottomNavigationAction
              key={item.to}
              component={RouterLink}
              to={item.to}
              value={item.to}
              label={item.label}
              icon={item.icon}
              sx={{
                minWidth: 0,
                px: 0.5,
                color: 'primary.main',
                opacity: 0.75,
                '&.Mui-selected': { opacity: 1 },
                // limonkowa kreska pod aktywną pozycją, jak na makiecie
                '&.Mui-selected::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 2,
                  width: 36,
                  height: 5,
                  borderRadius: 3,
                  bgcolor: 'secondary.main',
                },
                '& .MuiSvgIcon-root': { fontSize: item.to === '/dodaj' ? 40 : 30 },
                '& .MuiBottomNavigationAction-label': { fontWeight: 700 },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
