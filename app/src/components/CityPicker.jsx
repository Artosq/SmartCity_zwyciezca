import { useState } from 'react'
import CitySelect from './CitySelect'

// Ekran startowy: wybór miasta przed pokazaniem mapy.
export default function CityPicker({ onSelect }) {
  const [slug, setSlug] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (slug) onSelect(slug)
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-teal-700 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900">Sąsiedzko</h1>
        <p className="mt-1 text-base text-gray-700">Mapa sąsiedzkich wydarzeń w Twoim mieście.</p>

        <label htmlFor="start-city" className="mt-6 block text-base font-semibold text-gray-900">
          Twoje miasto
        </label>
        <CitySelect id="start-city" value={slug} onChange={setSlug} className="mt-2 w-full" />

        <button
          type="submit"
          disabled={!slug}
          className="mt-4 min-h-12 w-full rounded-lg bg-teal-700 px-4 text-lg font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          Pokaż mapę
        </button>
      </form>
    </main>
  )
}
