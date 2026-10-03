import ButtonBase from '@mui/material/ButtonBase'
import { TARGET_GROUPS } from '../data/targetGroups'
import ScrollRow from './ScrollRow'
import { GroupDot } from './TargetGroupFilter'

interface Props {
  label: string
  selected: string[]
  onChange: (slugs: string[]) => void
}

// Przewijany rząd chipów grup docelowych — preferencje na stronie głównej i filtr na mapie.
export default function GroupChips({ label, selected, onChange }: Props) {
  const toggle = (slug: string) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug])

  return (
    <ScrollRow label={label}>
      {TARGET_GROUPS.map((group) => {
        const active = selected.includes(group.slug)
        return (
          <ButtonBase
            key={group.slug}
            onClick={() => toggle(group.slug)}
            aria-pressed={active}
            sx={{
              flexShrink: 0,
              gap: 1,
              px: 2,
              minHeight: 44,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              bgcolor: active ? 'primary.main' : 'background.paper',
              color: active ? 'primary.contrastText' : 'text.primary',
              boxShadow: '0 2px 10px rgba(17,17,17,0.18)',
            }}
          >
            <GroupDot color={group.color} />
            {group.name}
          </ButtonBase>
        )
      })}
    </ScrollRow>
  )
}
