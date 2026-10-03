import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

export type Mode = 'wydarzenia' | '1na1'

interface Props {
  value: Mode
  onChange: (mode: Mode) => void
  label: string
}

// Przełącznik „Wydarzenia / Wyjścia 1:1" — na stronie głównej i przy dodawaniu.
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
        bgcolor: 'grey.100',
        borderRadius: '999px',
        '& .MuiToggleButton-root': {
          border: 0,
          borderRadius: '999px !important',
          minHeight: 44,
          fontWeight: 800,
          fontSize: '1rem',
          textTransform: 'none',
          color: 'text.primary',
          '&.Mui-selected, &.Mui-selected:hover': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          },
        },
      }}
    >
      <ToggleButton value="wydarzenia">Wydarzenia</ToggleButton>
      <ToggleButton value="1na1">Wyjścia 1:1</ToggleButton>
    </ToggleButtonGroup>
  )
}
