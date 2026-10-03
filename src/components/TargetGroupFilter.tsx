import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import { ALL_GROUP_SLUGS, TARGET_GROUPS } from '../data/targetGroups'

interface Props {
  legend: string
  selected: string[]
  onChange: (slugs: string[]) => void
}

export function GroupDot({ color }: { color: string }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: 18,
        height: 18,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: color,
        border: '1px solid rgba(0,0,0,0.3)',
      }}
    />
  )
}

// Checkboxy grup docelowych z kolorami — używane w filtrze mapy i w formularzu wydarzenia.
export default function TargetGroupFilter({ legend, selected, onChange }: Props) {
  const toggle = (slug: string) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug])

  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
        {legend}
      </FormLabel>

      <FormGroup>
        {TARGET_GROUPS.map((group) => (
          <FormControlLabel
            key={group.slug}
            control={
              <Checkbox checked={selected.includes(group.slug)} onChange={() => toggle(group.slug)} />
            }
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <GroupDot color={group.color} />
                <span>{group.name}</span>
              </Stack>
            }
            sx={{ minHeight: 46 }}
          />
        ))}
      </FormGroup>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button variant="outlined" size="small" fullWidth onClick={() => onChange(ALL_GROUP_SLUGS)}>
          Wszystkie
        </Button>
        <Button variant="outlined" size="small" fullWidth onClick={() => onChange([])}>
          Wyczyść
        </Button>
      </Stack>
    </FormControl>
  )
}
