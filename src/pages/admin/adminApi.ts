import { supabase } from '../../lib/supabase'

// Wspólne operacje panelu administratora. Uprawnienia sprawdza baza (polityki is_admin()),
// więc wywołanie przez osobę bez uprawnień po prostu się nie powiedzie.
// Każde działanie trafia do dziennika (tabela admin_log).

export type ContentTable = 'events' | 'meetups' | 'messages'

export interface AdminProfile {
  id: string
  name: string | null
  rating_avg: number | null
  rating_count: number
  created_at: string
}

export const BAN_DURATIONS = [
  { label: '24 godziny', hours: 24 },
  { label: '7 dni', hours: 24 * 7 },
  { label: 'Bezterminowo', hours: null },
] as const

async function log(adminId: string, action: string, targetType: string, targetId: string, details?: string) {
  await supabase.from('admin_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details ?? null,
  })
}

// Ukrycie treści: znika dla użytkowników, zostaje w bazie i można ją przywrócić.
export async function hideContent(adminId: string, table: ContentTable, id: string, reason: string) {
  const patch = table === 'messages' ? { is_hidden: true } : { is_hidden: true, hidden_reason: reason }
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (!error) await log(adminId, 'hide', table, id, reason)
  return error?.message ?? null
}

export async function restoreContent(adminId: string, table: ContentTable, id: string) {
  const patch = table === 'messages' ? { is_hidden: false } : { is_hidden: false, hidden_reason: null }
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (!error) await log(adminId, 'restore', table, id)
  return error?.message ?? null
}

export async function banUser(adminId: string, userId: string, reason: string, hours: number | null) {
  const until = hours === null ? null : new Date(Date.now() + hours * 3600000).toISOString()
  const { error } = await supabase
    .from('bans')
    .upsert({ user_id: userId, reason, until, banned_by: adminId, created_at: new Date().toISOString() })
  if (!error) await log(adminId, 'ban', 'user', userId, `${reason} (${until ?? 'bezterminowo'})`)
  return error?.message ?? null
}

export async function unbanUser(adminId: string, userId: string) {
  const { error } = await supabase.from('bans').delete().eq('user_id', userId)
  if (!error) await log(adminId, 'unban', 'user', userId)
  return error?.message ?? null
}

export async function setAdmin(adminId: string, userId: string, on: boolean) {
  const { error } = on
    ? await supabase.from('admins').insert({ user_id: userId, added_by: adminId })
    : await supabase.from('admins').delete().eq('user_id', userId)
  if (!error) await log(adminId, on ? 'grant_admin' : 'revoke_admin', 'user', userId)
  return error?.message ?? null
}

export async function resolveReport(adminId: string, reportId: string, note: string) {
  const { error } = await supabase
    .from('reports')
    .update({ status: 'resolved', resolved_by: adminId, resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (!error) await log(adminId, 'resolve_report', 'report', reportId, note)
  return error?.message ?? null
}

export async function replyToSupport(adminId: string, messageId: string, reply: string) {
  const { error } = await supabase
    .from('support_messages')
    .update({ reply, replied_by: adminId, replied_at: new Date().toISOString(), status: 'answered' })
    .eq('id', messageId)
  if (!error) await log(adminId, 'reply', 'support_message', messageId)
  return error?.message ?? null
}

export async function closeSupport(adminId: string, messageId: string) {
  const { error } = await supabase.from('support_messages').update({ status: 'closed' }).eq('id', messageId)
  if (!error) await log(adminId, 'close_support', 'support_message', messageId)
  return error?.message ?? null
}

const shortDate = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
export const when = (iso: string) => shortDate.format(new Date(iso))

// Imię z krótkim fragmentem identyfikatora — imiona się powtarzają, a e-maile są prywatne.
export const who = (profile: { id?: string; name: string | null } | null | undefined, id?: string | null) =>
  `${profile?.name ?? 'Bez imienia'} (${(profile?.id ?? id ?? '').slice(0, 6) || '?'})`
