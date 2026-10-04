import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { containsProfanity } from '../../lib/profanity'
import { supabase } from '../../lib/supabase'
import {
  closeSupport,
  replyToSupport,
  resolveReport,
  setAdmin,
  unbanUser,
  when,
  who,
  type AdminProfile,
} from './adminApi'
import { BanButton, ChatViewer, Empty, HideButton, Row } from './adminShared'

interface TabProps {
  adminId: string
}

const norm = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

const REPORT_TYPES: Record<string, string> = {
  message: 'Wiadomość',
  event: 'Wydarzenie',
  meetup: 'Spotkanie we dwoje',
  user: 'Osoba',
  meetup_chat: 'Rozmowa we dwoje',
}

// ---------- Zgłoszenia od użytkowników ----------
export function ReportsTab({ adminId }: TabProps) {
  const [reports, setReports] = useState<any[] | null>(null)
  const [targets, setTargets] = useState<Record<string, any>>({})
  const [showResolved, setShowResolved] = useState(false)
  const [openChat, setOpenChat] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('reports')
      .select(
        '*, reporter:profiles!reports_reporter_id_fkey(id, name), reported:profiles!reports_reported_user_id_fkey(id, name)',
      )
      .order('created_at', { ascending: false })
      .limit(200)
    const rows = data ?? []
    setReports(rows)

    // treść, której dotyczą zgłoszenia — jednym zapytaniem na rodzaj
    const ids = (type: string) => rows.filter((row) => row.target_type === type).map((row) => row.target_id)
    const [events, meetups, messages] = await Promise.all([
      ids('event').length ? supabase.from('events').select('id, title, is_hidden').in('id', ids('event')) : null,
      ids('meetup').length ? supabase.from('meetups').select('id, title, is_hidden').in('id', ids('meetup')) : null,
      ids('message').length ? supabase.from('messages').select('id, content, is_hidden').in('id', ids('message')) : null,
    ])
    const found: Record<string, any> = {}
    for (const row of events?.data ?? []) found[`event:${row.id}`] = row
    for (const row of meetups?.data ?? []) found[`meetup:${row.id}`] = row
    for (const row of messages?.data ?? []) found[`message:${row.id}`] = row
    setTargets(found)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (reports === null) return <Empty>Ładowanie zgłoszeń…</Empty>
  const visible = reports.filter((report) => showResolved || report.status === 'open')

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={<Switch checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />}
        label="Pokaż także zamknięte"
      />
      {visible.length === 0 && <Empty>Brak otwartych zgłoszeń.</Empty>}
      {visible.map((report) => {
        const target = targets[`${report.target_type}:${report.target_id}`]
        const table = report.target_type === 'event' ? 'events' : report.target_type === 'meetup' ? 'meetups' : 'messages'
        const hideable = ['event', 'meetup', 'message'].includes(report.target_type) && target
        return (
          <Row
            key={report.id}
            muted={report.status !== 'open'}
            actions={
              <>
                {hideable && (
                  <HideButton adminId={adminId} table={table} id={report.target_id} hidden={target.is_hidden} onDone={load} />
                )}
                {report.target_type === 'meetup_chat' && (
                  <Button size="small" variant="outlined" onClick={() => setOpenChat(openChat === report.id ? null : report.id)}>
                    {openChat === report.id ? 'Zwiń rozmowę' : 'Pokaż rozmowę'}
                  </Button>
                )}
                {report.reported_user_id && <BanButton adminId={adminId} userId={report.reported_user_id} onDone={load} />}
                {report.status === 'open' && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={async () => {
                      await resolveReport(adminId, report.id, report.reason)
                      load()
                    }}
                  >
                    Zamknij zgłoszenie
                  </Button>
                )}
              </>
            }
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size="small" color="primary" label={REPORT_TYPES[report.target_type] ?? report.target_type} />
              <Typography variant="body2" color="text.secondary">
                {when(report.created_at)} · zgłasza: {who(report.reporter, report.reporter_id)}
              </Typography>
              {report.status !== 'open' && <Chip size="small" label="zamknięte" />}
            </Stack>
            <Typography sx={{ mt: 1, fontWeight: 700 }}>{report.reason}</Typography>
            {target && (
              <Typography color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                Dotyczy: „{target.title ?? target.content}"{target.is_hidden ? ' (ukryte)' : ''}
              </Typography>
            )}
            {report.reported && (
              <Typography color="text.secondary">Osoba: {who(report.reported, report.reported_user_id)}</Typography>
            )}
            {openChat === report.id && (
              <Stack sx={{ mt: 1.5 }}>
                <ChatViewer adminId={adminId} scope="meetup" scopeId={report.target_id} />
              </Stack>
            )}
          </Row>
        )
      })}
    </Stack>
  )
}

// ---------- Automatyczne flagi ----------
const BURST_WINDOW_MS = 10 * 60 * 1000
const BURST_MESSAGES = 10
const LOW_RATING = 2.5

export function FlagsTab({ adminId }: TabProps) {
  const [messages, setMessages] = useState<any[] | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [profiles, setProfiles] = useState<AdminProfile[]>([])

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 24 * 3600000).toISOString()
    const [recent, allReports, people] = await Promise.all([
      supabase
        .from('messages')
        .select('id, content, created_at, is_hidden, user_id, profiles(id, name)')
        .gte('created_at', since)
        .order('created_at'),
      supabase.from('reports').select('reported_user_id, status'),
      supabase.from('profiles').select('id, name, rating_avg, rating_count, created_at'),
    ])
    setMessages(recent.data ?? [])
    setReports(allReports.data ?? [])
    setProfiles((people.data as AdminProfile[] | null) ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flags = useMemo(() => {
    const list = messages ?? []
    const nameOf = (id: string) => who(profiles.find((profile) => profile.id === id), id)

    const vulgar = list.filter((message) => !message.is_hidden && containsProfanity(message.content))

    // osoby, które w dowolnych 10 minutach z ostatniej doby napisały bardzo dużo wiadomości
    const byUser = new Map<string, number[]>()
    for (const message of list) {
      const times = byUser.get(message.user_id) ?? []
      times.push(new Date(message.created_at).getTime())
      byUser.set(message.user_id, times)
    }
    const bursts: { userId: string; count: number }[] = []
    for (const [userId, times] of byUser) {
      let best = 0
      for (let start = 0, end = 0; end < times.length; end++) {
        while (times[end] - times[start] > BURST_WINDOW_MS) start++
        best = Math.max(best, end - start + 1)
      }
      if (best >= BURST_MESSAGES) bursts.push({ userId, count: best })
    }

    const reportCounts = new Map<string, number>()
    for (const report of reports) {
      if (report.reported_user_id) reportCounts.set(report.reported_user_id, (reportCounts.get(report.reported_user_id) ?? 0) + 1)
    }
    const reported = [...reportCounts].filter(([, count]) => count >= 2).map(([userId, count]) => ({ userId, count }))

    const lowRated = profiles.filter(
      (profile) => profile.rating_count >= 2 && profile.rating_avg !== null && Number(profile.rating_avg) <= LOW_RATING,
    )

    return { vulgar, bursts, reported, lowRated, nameOf }
  }, [messages, reports, profiles])

  if (messages === null) return <Empty>Ładowanie…</Empty>
  const nothing = !flags.vulgar.length && !flags.bursts.length && !flags.reported.length && !flags.lowRated.length

  return (
    <Stack spacing={2.5}>
      <Typography color="text.secondary">
        Flagi wylicza panel na podstawie ostatnich 24 godzin czatów, zgłoszeń i ocen. To podpowiedzi do sprawdzenia, nie wyroki.
      </Typography>
      {nothing && <Empty>Nic podejrzanego.</Empty>}

      {flags.vulgar.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="h3">Wulgaryzmy na czacie ({flags.vulgar.length})</Typography>
          {flags.vulgar.map((message) => (
            <Row
              key={message.id}
              actions={
                <>
                  <HideButton adminId={adminId} table="messages" id={message.id} hidden={false} onDone={load} />
                  <BanButton adminId={adminId} userId={message.user_id} />
                </>
              }
            >
              <Typography sx={{ fontWeight: 800 }}>
                {who(message.profiles, message.user_id)} · {when(message.created_at)}
              </Typography>
              <Typography sx={{ wordBreak: 'break-word' }}>{message.content}</Typography>
            </Row>
          ))}
        </Stack>
      )}

      {flags.bursts.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="h3">Bardzo dużo wiadomości w 10 minut</Typography>
          {flags.bursts.map((item) => (
            <Row key={item.userId} actions={<BanButton adminId={adminId} userId={item.userId} />}>
              <Typography>
                <strong>{flags.nameOf(item.userId)}</strong>: {item.count} wiadomości w ciągu 10 minut
              </Typography>
            </Row>
          ))}
        </Stack>
      )}

      {flags.reported.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="h3">Osoby zgłoszone co najmniej 2 razy</Typography>
          {flags.reported.map((item) => (
            <Row key={item.userId} actions={<BanButton adminId={adminId} userId={item.userId} />}>
              <Typography>
                <strong>{flags.nameOf(item.userId)}</strong>: {item.count} zgłoszeń
              </Typography>
            </Row>
          ))}
        </Stack>
      )}

      {flags.lowRated.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="h3">Organizatorzy z niską oceną</Typography>
          {flags.lowRated.map((profile) => (
            <Row key={profile.id} actions={<BanButton adminId={adminId} userId={profile.id} />}>
              <Typography>
                <strong>{who(profile)}</strong>: średnia {Number(profile.rating_avg).toFixed(1)} z {profile.rating_count} ocen
              </Typography>
            </Row>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

// ---------- Czaty wydarzeń ----------
export function ChatsTab({ adminId }: TabProps) {
  const [events, setEvents] = useState<any[] | null>(null)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, starts_at, source')
      .is('source', null)
      .order('starts_at', { ascending: false })
      .limit(300)
      .then(({ data }) => setEvents(data ?? []))
  }, [])

  if (events === null) return <Empty>Ładowanie…</Empty>
  const visible = events.filter((event) => norm(event.title).includes(norm(query)))

  return (
    <Stack spacing={1.5}>
      <Typography color="text.secondary">
        Czaty wydarzeń dodanych przez użytkowników. Prywatne rozmowy „We dwoje" są dostępne tylko po zgłoszeniu, w zakładce Zgłoszenia.
      </Typography>
      <TextField size="small" placeholder="Szukaj wydarzenia…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {visible.length === 0 && <Empty>Brak wydarzeń.</Empty>}
      {visible.map((event) => (
        <Row
          key={event.id}
          actions={
            <Button size="small" variant="outlined" onClick={() => setOpenId(openId === event.id ? null : event.id)}>
              {openId === event.id ? 'Zwiń rozmowę' : 'Pokaż rozmowę'}
            </Button>
          }
        >
          <Typography sx={{ fontWeight: 800 }}>{event.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {when(event.starts_at)}
          </Typography>
          {openId === event.id && (
            <Stack sx={{ mt: 1.5 }}>
              <ChatViewer adminId={adminId} scope="event" scopeId={event.id} />
            </Stack>
          )}
        </Row>
      ))}
    </Stack>
  )
}

// ---------- Wydarzenia i spotkania ----------
export function ContentTab({ adminId }: TabProps) {
  const [kind, setKind] = useState<'events' | 'meetups'>('events')
  const [rows, setRows] = useState<any[] | null>(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    const { data } =
      kind === 'events'
        ? await supabase
            .from('events')
            .select('id, title, starts_at, is_hidden, hidden_reason, source, organizer_id, person:profiles(id, name)')
            .order('created_at', { ascending: false })
            .limit(300)
        : await supabase
            .from('meetups')
            .select('id, title, starts_at, is_hidden, hidden_reason, host_id, person:profiles!meetups_host_id_fkey(id, name)')
            .order('created_at', { ascending: false })
            .limit(300)
    setRows(data ?? [])
  }, [kind])

  useEffect(() => {
    setRows(null)
    load()
  }, [load])

  const visible = (rows ?? []).filter((row) => norm(row.title).includes(norm(query)))

  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup exclusive size="small" value={kind} onChange={(_, value) => value && setKind(value)}>
        <ToggleButton value="events">Wydarzenia</ToggleButton>
        <ToggleButton value="meetups">We dwoje</ToggleButton>
      </ToggleButtonGroup>
      <TextField size="small" placeholder="Szukaj po tytule…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {rows === null ? <Empty>Ładowanie…</Empty> : visible.length === 0 && <Empty>Brak wyników.</Empty>}
      {visible.map((row) => {
        const ownerId = row.organizer_id ?? row.host_id
        return (
          <Row
            key={row.id}
            muted={row.is_hidden}
            actions={
              <>
                <HideButton adminId={adminId} table={kind} id={row.id} hidden={row.is_hidden} onDone={load} />
                {!row.source && <BanButton adminId={adminId} userId={ownerId} />}
              </>
            }
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800 }}>{row.title}</Typography>
              {row.is_hidden && <Chip size="small" color="error" label="ukryte" />}
              {row.source && <Chip size="small" label={`z bota: ${row.source}`} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {when(row.starts_at)} · {who(row.person, ownerId)}
            </Typography>
            {row.is_hidden && row.hidden_reason && (
              <Typography variant="body2" color="error">
                Powód ukrycia: {row.hidden_reason}
              </Typography>
            )}
          </Row>
        )
      })}
    </Stack>
  )
}

// ---------- Użytkownicy: bany i uprawnienia ----------
export function UsersTab({ adminId }: TabProps) {
  const [profiles, setProfiles] = useState<AdminProfile[] | null>(null)
  const [bans, setBans] = useState<Record<string, any>>({})
  const [admins, setAdmins] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [people, banRows, adminRows] = await Promise.all([
      supabase.from('profiles').select('id, name, rating_avg, rating_count, created_at').order('created_at', { ascending: false }),
      supabase.from('bans').select('*'),
      supabase.from('admins').select('user_id'),
    ])
    setProfiles((people.data as AdminProfile[] | null) ?? [])
    const now = new Date()
    setBans(
      Object.fromEntries(
        (banRows.data ?? [])
          .filter((ban) => ban.until === null || new Date(ban.until) > now)
          .map((ban) => [ban.user_id, ban]),
      ),
    )
    setAdmins((adminRows.data ?? []).map((row) => row.user_id))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (profiles === null) return <Empty>Ładowanie…</Empty>
  const q = norm(query)
  const visible = profiles.filter((profile) => norm(`${profile.name ?? ''} ${profile.id}`).includes(q)).slice(0, 100)

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        placeholder="Szukaj po imieniu albo identyfikatorze…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Typography variant="body2" color="text.secondary">
        Adresy e-mail są prywatne, dlatego osoby rozpoznaje się po imieniu i początku identyfikatora.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {visible.map((profile) => {
        const ban = bans[profile.id]
        const isAdmin = admins.includes(profile.id)
        return (
          <Row
            key={profile.id}
            actions={
              <>
                {ban ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      setError((await unbanUser(adminId, profile.id)) ?? '')
                      load()
                    }}
                  >
                    Zdejmij bana
                  </Button>
                ) : (
                  profile.id !== adminId && <BanButton adminId={adminId} userId={profile.id} onDone={load} />
                )}
                {profile.id !== adminId && (
                  <Button
                    size="small"
                    onClick={async () => {
                      setError((await setAdmin(adminId, profile.id, !isAdmin)) ?? '')
                      load()
                    }}
                  >
                    {isAdmin ? 'Odbierz uprawnienia admina' : 'Nadaj uprawnienia admina'}
                  </Button>
                )}
              </>
            }
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800 }}>{who(profile)}</Typography>
              {isAdmin && <Chip size="small" color="primary" label="admin" />}
              {ban && <Chip size="small" color="error" label={ban.until ? `ban do ${when(ban.until)}` : 'ban bezterminowy'} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              konto od {when(profile.created_at)} ·{' '}
              {profile.rating_count > 0 ? `ocena ${Number(profile.rating_avg).toFixed(1)} (${profile.rating_count})` : 'brak ocen'}
            </Typography>
            {ban && (
              <Typography variant="body2" color="error">
                Powód: {ban.reason}
              </Typography>
            )}
          </Row>
        )
      })}
    </Stack>
  )
}

// ---------- Wiadomości z Pomocy ----------
export function SupportTab({ adminId }: TabProps) {
  const [rows, setRows] = useState<any[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [showClosed, setShowClosed] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('*, author:profiles!support_messages_user_id_fkey(id, name)')
      .order('created_at', { ascending: false })
      .limit(200)
    setRows(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (rows === null) return <Empty>Ładowanie…</Empty>
  const visible = rows.filter((row) => showClosed || row.status === 'open')

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={<Switch checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
        label="Pokaż także załatwione"
      />
      {visible.length === 0 && <Empty>Brak nowych wiadomości.</Empty>}
      {visible.map((row) => (
        <Row key={row.id} muted={row.status !== 'open'}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip size="small" color={row.kind === 'bug' ? 'error' : 'primary'} label={row.kind === 'bug' ? 'Błąd' : 'Pytanie'} />
            <Typography variant="body2" color="text.secondary">
              {when(row.created_at)} · {row.user_id ? who(row.author, row.user_id) : 'niezalogowany'}
              {row.page ? ` · ${row.page}` : ''}
            </Typography>
            {row.status !== 'open' && <Chip size="small" label={row.status === 'answered' ? 'odpowiedziano' : 'zamknięte'} />}
          </Stack>
          <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.message}</Typography>
          {row.contact && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              E-mail do odpowiedzi: <Link href={`mailto:${row.contact}`}>{row.contact}</Link>
            </Typography>
          )}
          {row.reply && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Odpowiedź: {row.reply}
            </Alert>
          )}
          {row.status === 'open' && (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <TextField
                size="small"
                multiline
                minRows={2}
                label={row.user_id ? 'Odpowiedź (użytkownik zobaczy ją na stronie Pomoc)' : 'Notatka (osoba niezalogowana - odpisz e-mailem)'}
                value={drafts[row.id] ?? ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!(drafts[row.id] ?? '').trim()}
                  onClick={async () => {
                    await replyToSupport(adminId, row.id, drafts[row.id].trim())
                    load()
                  }}
                >
                  Wyślij odpowiedź
                </Button>
                <Button
                  size="small"
                  onClick={async () => {
                    await closeSupport(adminId, row.id)
                    load()
                  }}
                >
                  Zamknij bez odpowiedzi
                </Button>
              </Stack>
            </Stack>
          )}
        </Row>
      ))}
    </Stack>
  )
}

// ---------- Dziennik działań administratorów ----------
const ACTIONS: Record<string, string> = {
  hide: 'ukrył(a) treść',
  restore: 'przywrócił(a) treść',
  ban: 'zbanował(a) osobę',
  unban: 'zdjął(-ęła) bana',
  grant_admin: 'nadał(a) uprawnienia admina',
  revoke_admin: 'odebrał(a) uprawnienia admina',
  resolve_report: 'zamknął(-ęła) zgłoszenie',
  reply: 'odpowiedział(a) na wiadomość',
  close_support: 'zamknął(-ęła) wiadomość bez odpowiedzi',
}

export function LogTab() {
  const [rows, setRows] = useState<any[] | null>(null)

  useEffect(() => {
    supabase
      .from('admin_log')
      .select('*, admin:profiles!admin_log_admin_id_fkey(id, name)')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => setRows(data ?? []))
  }, [])

  if (rows === null) return <Empty>Ładowanie…</Empty>
  if (rows.length === 0) return <Empty>Dziennik jest pusty.</Empty>

  return (
    <Stack spacing={1}>
      {rows.map((row) => (
        <Row key={row.id}>
          <Typography>
            <strong>{who(row.admin, row.admin_id)}</strong> {ACTIONS[row.action] ?? row.action}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {when(row.created_at)} · {row.target_type} {String(row.target_id ?? '').slice(0, 8)}
            {row.details ? ` · ${row.details}` : ''}
          </Typography>
        </Row>
      ))}
    </Stack>
  )
}
