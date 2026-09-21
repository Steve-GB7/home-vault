insert into storage.buckets (id, name, public)
values ('homevault-docs', 'homevault-docs', false)
on conflict (id) do nothing;

create policy "hv_docs_household_read" on storage.objects for select
  using (
    bucket_id = 'homevault-docs'
    and is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "hv_docs_household_write" on storage.objects for insert
  with check (
    bucket_id = 'homevault-docs'
    and is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "hv_docs_household_delete" on storage.objects for delete
  using (
    bucket_id = 'homevault-docs'
    and is_household_member(((storage.foldername(name))[1])::uuid)
  );
