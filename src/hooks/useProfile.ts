import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const ADULT_AGE = 18

export function isAdultOn(birthDate: string | null) {
  if (!birthDate) return false
  const limit = new Date()
  limit.setFullYear(limit.getFullYear() - ADULT_AGE)
  return new Date(birthDate) <= limit
}

// Profil zalogowanego: data urodzenia (prywatna) i publiczna średnia ocen.
export function useProfile() {
  const { user, loading: loadingAuth } = useAuth()
  const [birthDate, setBirthDate] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [rating, setRating] = useState<{ avg: number | null; count: number }>({ avg: null, count: 0 })
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setBirthDate(null)
      setAvatar(null)
      setLoading(false)
      return
    }
    const [privateRow, publicRow] = await Promise.all([
      supabase.from('profile_private').select('birth_date').eq('id', user.id).maybeSingle(),
      supabase.from('profiles').select('avatar, rating_avg, rating_count').eq('id', user.id).maybeSingle(),
    ])
    setBirthDate((privateRow.data?.birth_date as string | undefined) ?? null)
    setAvatar((publicRow.data?.avatar as string | null | undefined) ?? null)
    setRating({
      avg: (publicRow.data?.rating_avg as number | null | undefined) ?? null,
      count: (publicRow.data?.rating_count as number | undefined) ?? 0,
    })
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!loadingAuth) reload()
  }, [loadingAuth, reload])

  async function saveBirthDate(value: string) {
    if (!user) return 'Musisz być zalogowany.'
    const { error } = await supabase.from('profile_private').upsert({ id: user.id, birth_date: value })
    if (error) return error.message
    setBirthDate(value)
    return null
  }

  // Zapis wybranego awatara (kod emoji albo null = inicjały). Odświeżamy lokalnie od razu.
  async function saveAvatar(value: string | null) {
    if (!user) return 'Musisz być zalogowany.'
    const { error } = await supabase.from('profiles').update({ avatar: value }).eq('id', user.id)
    if (error) return error.message
    setAvatar(value)
    return null
  }

  return {
    user,
    loading: loadingAuth || loading,
    birthDate,
    avatar,
    isAdult: isAdultOn(birthDate),
    rating,
    saveBirthDate,
    saveAvatar,
  }
}
