import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { MEETUP_TYPES } from '../../data/meetupTypes'
import { TARGET_GROUPS } from '../../data/targetGroups'
import { useLang } from '../../i18n/LanguageContext'
import GroupChip from '../GroupChip'

// „niepelnosprawni" to nie wiek, tylko dostępność — w menu ma osobną sekcję.
const ACCESSIBLE_GROUP = 'niepelnosprawni'
const AGE_GROUPS = TARGET_GROUPS.filter((group) => group.slug !== ACCESSIBLE_GROUP)
const ACCESSIBLE = TARGET_GROUPS.find((group) => group.slug === ACCESSIBLE_GROUP)!

export interface MapFilterValues {
  // grupy docelowe wydarzeń (wiek + dostępność)
  groups: string[]
  // cel wydarzenia = kategoria
  categories: string[]
  // spotkania we dwoje widzą tylko pełnoletni (data urodzenia w profilu)
  showMeetups: boolean
  // cel spotkania we dwoje = jego rodzaj
  meetupTypes: string[]
}

export const EMPTY_FILTERS: MapFilterValues = {
  groups: [],
  categories: [],
  showMeetups: true,
  meetupTypes: [],
}

export const countActiveFilters = (values: MapFilterValues) =>
  values.groups.length + values.categories.length + values.meetupTypes.length

interface Props {
  open: boolean
  onClose: () => void
  values: MapFilterValues
  onChange: (values: MapFilterValues) => void
  // kategorie występujące wśród wydarzeń w mieście
  categories: { slug: string; name: string }[]
  // pełnoletność z profilu — bez niej sekcji „We dwoje" nie da się włączyć
  adult: boolean
  resultCount: number
}

const toggle = (list: string[], slug: string) =>
  list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        gap: 1,
        px: 2,
        minHeight: 44,
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.95rem',
        border: '2px solid',
        borderColor: active ? 'primary.main' : 'grey.300',
        bgcolor: active ? 'primary.main' : 'background.paper',
        color: active ? 'primary.contrastText' : 'text.primary',
        transition: 'transform 0.15s ease, background-color 0.2s ease, border-color 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      {children}
    </ButtonBase>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Box component="section">
      <Typography variant="h3">{title}</Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {children}
      </Stack>
    </Box>
  )
}

// Menu filtrów mapy: wiek, cel wydarzenia oraz spotkania we dwoje (tylko dla dorosłych).
// Na telefonie wysuwa się od dołu, na szerszym ekranie z prawej.
export default function MapFilters({
  open,
  onClose,
  values,
  onChange,
  categories,
  adult,
  resultCount,
}: Props) {
  const { t, td } = useLang()
  const desktop = useMediaQuery(useTheme().breakpoints.up('md'))
  const set = (patch: Partial<MapFilterValues>) => onChange({ ...values, ...patch })

  return (
    <Drawer
      anchor={desktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { md: 400 },
            maxHeight: { xs: '85dvh', md: 'none' },
            borderRadius: { xs: '28px 28px 0 0', md: 0 },
          },
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', px: 3, pt: 2 }}>
        <Typography variant="h2" sx={{ flex: 1 }}>
          {t('filters.title')}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('filters.close')}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Stack spacing={3} sx={{ px: 3, py: 2, overflowY: 'auto' }}>
        <Section title={t('filters.age')} hint={t('filters.ageHint')}>
          {AGE_GROUPS.map((group) => (
            <GroupChip
              key={group.slug}
              group={group}
              active={values.groups.includes(group.slug)}
              onClick={() => set({ groups: toggle(values.groups, group.slug) })}
            />
          ))}
        </Section>

        <Section title={t('filters.accessibility')}>
          <GroupChip
            group={ACCESSIBLE}
            label={t('filters.accessibleLabel')}
            active={values.groups.includes(ACCESSIBLE_GROUP)}
            onClick={() => set({ groups: toggle(values.groups, ACCESSIBLE_GROUP) })}
          />
        </Section>

        <Section title={t('filters.purpose')}>
          {categories.length === 0 && (
            <Typography color="text.secondary">{t('filters.noCategories')}</Typography>
          )}
          {categories.map((category) => (
            <Chip
              key={category.slug}
              active={values.categories.includes(category.slug)}
              onClick={() => set({ categories: toggle(values.categories, category.slug) })}
            >
              {td('cat', category.slug, category.name)}
            </Chip>
          ))}
        </Section>

        <Box component="section">
          <Typography variant="h3">{t('filters.meetups')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('filters.meetupsHint')}
          </Typography>
          {adult ? (
            <>
              <FormControlLabel
                sx={{ mt: 0.5 }}
                control={
                  <Switch
                    checked={values.showMeetups}
                    onChange={(e) => set({ showMeetups: e.target.checked })}
                  />
                }
                label={t('filters.showMeetups')}
              />
              {values.showMeetups && (
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {MEETUP_TYPES.map((type) => (
                    <Chip
                      key={type.slug}
                      active={values.meetupTypes.includes(type.slug)}
                      onClick={() => set({ meetupTypes: toggle(values.meetupTypes, type.slug) })}
                    >
                      <span aria-hidden>{type.emoji}</span>
                      {td('mtype', type.slug, type.name)}
                    </Chip>
                  ))}
                </Stack>
              )}
            </>
          ) : (
            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              {t('filters.meetupsLocked')}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={() => onChange({ ...values, groups: [], categories: [], meetupTypes: [] })}
        >
          {t('filters.clear')}
        </Button>
        <Button variant="contained" fullWidth onClick={onClose}>
          {t('filters.show', { count: resultCount })}
        </Button>
      </Stack>
    </Drawer>
  )
}
