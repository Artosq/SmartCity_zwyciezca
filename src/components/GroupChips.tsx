import { TARGET_GROUPS } from '../data/targetGroups'
import GroupChip from './GroupChip'
import ScrollRow from './ScrollRow'

interface Props {
  label: string
  selected: string[]
  onChange: (slugs: string[]) => void
}

// Przewijany rząd chipów grup docelowych — preferencje na stronie głównej.
export default function GroupChips({ label, selected, onChange }: Props) {
  const toggle = (slug: string) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug])

  return (
    <ScrollRow label={label}>
      {TARGET_GROUPS.map((group) => (
        <GroupChip
          key={group.slug}
          group={group}
          active={selected.includes(group.slug)}
          onClick={() => toggle(group.slug)}
        />
      ))}
    </ScrollRow>
  )
}
