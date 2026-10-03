import { CITIES } from '../data/cities'

export default function CitySelect({ id, value, onChange, className = '' }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-12 rounded-lg border border-gray-400 bg-white px-3 text-base font-semibold text-gray-900 ${className}`}
    >
      <option value="" disabled>
        Wybierz miasto…
      </option>
      {CITIES.map((city) => (
        <option key={city.slug} value={city.slug}>
          {city.name}
        </option>
      ))}
    </select>
  )
}
