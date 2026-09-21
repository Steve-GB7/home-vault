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

-- Allow businesses to read files tied to complaints assigned to them
create policy "hv_docs_business_read" on storage.objects for select
  using (
    bucket_id = 'homevault-docs'
    and exists (
      select 1 from public.complaint_media cm
      join public.complaints c on c.id = cm.complaint_id
      where cm.file_path = name
        and c.assigned_business_id in (select public.my_business_ids())
    )
  );
