import { ALL_GROUP_SLUGS, TARGET_GROUPS } from '../data/targetGroups'

export default function TargetGroupFilter({ selected, onChange }) {
  const toggle = (slug) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug])

  return (
    <fieldset>
      <legend className="text-lg font-bold text-gray-900">Dla kogo?</legend>

      <ul className="mt-2">
        {TARGET_GROUPS.map((group) => (
          <li key={group.slug}>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 text-base text-gray-900 hover:bg-gray-100">
              <input
                type="checkbox"
                className="h-6 w-6 shrink-0 accent-teal-700"
                checked={selected.includes(group.slug)}
                onChange={() => toggle(group.slug)}
              />
              <span
                className="h-5 w-5 shrink-0 rounded-full border border-black/30"
                style={{ backgroundColor: group.color }}
                aria-hidden="true"
              />
              {group.name}
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(ALL_GROUP_SLUGS)}
          className="min-h-11 flex-1 rounded-lg border border-gray-400 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          Zaznacz wszystkie
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="min-h-11 flex-1 rounded-lg border border-gray-400 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          Odznacz wszystkie
        </button>
      </div>
    </fieldset>
  )
}
