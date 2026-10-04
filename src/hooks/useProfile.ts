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

export function getAgeCategory(birthDate: string | null) {
  if (!birthDate) return 'Brak danych'
  const age = Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 3.15576e+10)
  if (age < 18) return 'Poniżej 18 lat'
  if (age <= 25) return '18-25 lat'
  if (age <= 35) return '26-35 lat'
  if (age <= 45) return '36-45 lat'
  return '46+ lat'
}

export function useProfile() {
  const { user, loading: loadingAuth } = useAuth()
  const [birthDate, setBirthDate] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [phone, setPhone] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [interests, setInterests] = useState<string[]>([])
  const [rating, setRating] = useState<{ avg: number | null; count: number }>({ avg: null, count: 0 })
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setBirthDate(null)
      setAvatar(null)
      setPhone('')
      setBio('')
      setInterests([])
      setLoading(false)
      return
    }
    const [privateRow, publicRow] = await Promise.all([
      supabase.from('profile_private').select('birth_date').eq('id', user.id).maybeSingle(),
      supabase.from('profiles').select('avatar, rating_avg, rating_count, phone, bio, interests').eq('id', user.id).maybeSingle(),
    ])
    setBirthDate((privateRow.data?.birth_date as string | undefined) ?? null)
    setAvatar((publicRow.data?.avatar as string | null | undefined) ?? null)
    setPhone((publicRow.data?.phone as string) ?? '')
    setBio((publicRow.data?.bio as string) ?? '')
    setInterests((publicRow.data?.interests as string[]) ?? [])
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

  async function saveAvatar(value: string | null) {
    if (!user) return 'Musisz być zalogowany.'
    const { error } = await supabase.from('profiles').update({ avatar: value }).eq('id', user.id)
    if (error) return error.message
    setAvatar(value)
    return null
  }

  async function saveAdditionalData(newPhone: string, newInterests: string[], newBio: string) {
    if (!user) return 'Musisz być zalogowany.'
    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id,
      phone: newPhone, 
      interests: newInterests, 
      bio: newBio 
    })
    if (error) return error.message
    setPhone(newPhone)
    setInterests(newInterests)
    setBio(newBio)
    return null
  }

  return {
    user,
    loading: loadingAuth || loading,
    birthDate,
    avatar,
    phone,
    bio,
    interests,
    isAdult: isAdultOn(birthDate),
    ageCategory: getAgeCategory(birthDate),
    rating,
    saveBirthDate,
    saveAvatar,
    saveAdditionalData
  }
}