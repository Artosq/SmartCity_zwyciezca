import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { CITIES } from '../data/cities'

interface Props {
  value: string
  onChange: (slug: string) => void
  label: string
}

export default function CitySelect({ value, onChange, label }: Props) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {CITIES.map((city) => (
        <MenuItem key={city.slug} value={city.slug}>
          {city.name}
        </MenuItem>
      ))}
    </TextField>
  )
}
