import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CelebrationIcon from '@mui/icons-material/Celebration'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'

// '1na1' to wewnętrzny identyfikator (także w adresie ?widok=1na1); użytkownik widzi „We dwoje".
export type Mode = 'wydarzenia' | '1na1'

interface Props {
  value: Mode
  onChange: (mode: Mode) => void
  label: string
}

// Przełącznik „Wydarzenia / We dwoje" — na stronie głównej i przy dodawaniu.
export default function ModeToggle({ value, onChange, label }: Props) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={value}
      onChange={(_, mode: Mode | null) => mode && onChange(mode)}
      aria-label={label}
      sx={{
        p: 0.5,
        bgcolor: 'grey.200',
        borderRadius: '999px',
        '& .MuiToggleButton-root': {
          gap: 1,
          border: 0,
          borderRadius: '999px !important',
          minHeight: 48,
          fontWeight: 800,
          fontSize: '1rem',
          textTransform: 'none',
          color: 'text.secondary',
          '&.Mui-selected, &.Mui-selected:hover': {
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            boxShadow: '0 2px 8px rgba(17,17,17,0.2)',
          },
        },
      }}
    >
      <ToggleButton value="wydarzenia">
        <CelebrationIcon />
        Wydarzenia
      </ToggleButton>
      <ToggleButton value="1na1">
        <PeopleAltIcon />
        We dwoje
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
