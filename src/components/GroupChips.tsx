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
              transition:
                'transform .15s ease, box-shadow .15s ease, background-color .2s ease, color .2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(17,17,17,0.22)' },
              '&:active': { transform: 'scale(0.96)' },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover, &:active': { transform: 'none' },
              },
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
