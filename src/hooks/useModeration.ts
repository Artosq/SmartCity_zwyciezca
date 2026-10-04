import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Ban {
  user_id: string
  reason: string
  // null = bezterminowo
  until: string | null
  created_at: string
}

// Czy zalogowany jest administratorem. O uprawnieniach decyduje baza (funkcja is_admin);
// ta wartość służy tylko do pokazania albo ukrycia panelu.
export function useAdmin() {
  const { user, loading: loadingAuth } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (loadingAuth) return
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }
    let cancelled = false
    supabase.rpc('is_admin').then(({ data }) => {
      if (cancelled) return
      setIsAdmin(data === true)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user, loadingAuth])

  return { user, isAdmin, loading: loadingAuth || loading }
}

// Aktywny ban zalogowanego użytkownika (z powodem i terminem) albo null.
export function useMyBan() {
  const { user } = useAuth()
  const [ban, setBan] = useState<Ban | null>(null)

  useEffect(() => {
    if (!user) return setBan(null)
    let cancelled = false
    supabase
      .from('bans')
      .select('user_id, reason, until, created_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const row = data as Ban | null
        setBan(row && (row.until === null || new Date(row.until) > new Date()) ? row : null)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  return ban
}
