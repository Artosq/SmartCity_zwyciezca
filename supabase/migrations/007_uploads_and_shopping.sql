-- ============================================================
-- Migracja 007 — zdjęcia wydarzeń z pliku + rodzaj spotkania „Pomoc z zakupami"
-- Wklej do: Supabase → SQL Editor → New query → Run
-- (wymaga migracji 005_meetups.sql)
-- ============================================================

-- ---------- 1. ZDJĘCIA WYDARZEŃ ----------

-- Publiczny magazyn zdjęć: do 5 MB, tylko obrazy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Zdjęcia ogląda każdy; przesyła i usuwa zalogowany, wyłącznie we własnym folderze
-- (ścieżka pliku zaczyna się od jego identyfikatora: <user_id>/<plik>).
drop policy if exists "event_images_read" on storage.objects;
create policy "event_images_read" on storage.objects for select
  using (bucket_id = 'event-images');

drop policy if exists "event_images_upload_own" on storage.objects;
create policy "event_images_upload_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "event_images_delete_own" on storage.objects;
create policy "event_images_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'event-images' and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------- 2. NOWY RODZAJ SPOTKANIA WE DWOJE ----------

alter table meetups drop constraint if exists meetups_type_check;
alter table meetups add constraint meetups_type_check
  check (type in ('spacer', 'kawa', 'sport', 'rozmowa', 'zakupy', 'inne'));
