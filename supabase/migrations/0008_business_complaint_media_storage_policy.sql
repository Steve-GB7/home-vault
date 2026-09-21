-- 0008_business_complaint_media_storage_policy.sql
-- Allow businesses to read files tied to complaints assigned to them

create policy if not exists "hv_docs_business_read" on storage.objects for select
  using (
    bucket_id = 'homevault-docs'
    and exists (
      select 1 from public.complaint_media cm
      join public.complaints c on c.id = cm.complaint_id
      where cm.file_path = name
        and c.assigned_business_id in (select public.my_business_ids())
    )
  );
