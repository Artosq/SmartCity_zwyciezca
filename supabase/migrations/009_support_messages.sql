-- ============================================================
-- Migracja 009 — strona Pomoc: „Napisz do nas" i „Zgłoś błąd"
-- Wklej do: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Wiadomości od użytkowników do zespołu. Zespół czyta je w Supabase → Table Editor.
create table if not exists support_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,   -- null = niezalogowany
  kind       text not null check (kind in ('contact', 'bug')),
  message    text not null check (char_length(message) between 5 and 2000),
  contact    text check (contact is null or char_length(contact) <= 200),  -- opcjonalny e-mail do odpowiedzi
  page       text,                                               -- z jakiego ekranu wysłano
  created_at timestamptz not null default now()
);

alter table support_messages enable row level security;

-- Napisać może każdy, także niezalogowany (np. gdy nie działa logowanie).
-- Brak polityki SELECT: z aplikacji nikt nie odczyta cudzych zgłoszeń.
drop policy if exists "support_insert_anyone" on support_messages;
create policy "support_insert_anyone" on support_messages for insert
  with check (user_id is null or user_id = auth.uid());

grant insert on support_messages to anon, authenticated;
grant all on support_messages to service_role;
