alter table profiles          enable row level security;
alter table households        enable row level security;
alter table household_members enable row level security;
alter table businesses        enable row level security;
alter table business_members  enable row level security;
alter table assets            enable row level security;
alter table documents         enable row level security;
alter table warranties_amcs   enable row level security;
alter table complaints        enable row level security;
alter table complaint_media   enable row level security;
alter table service_logs      enable row level security;
alter table asset_transfers   enable row level security;

-- profiles
create policy profiles_self_read on profiles for select using (id = auth.uid());
create policy profiles_self_write on profiles for update using (id = auth.uid());

-- households
create policy households_member_read on households for select
  using (is_household_member(id));
create policy households_owner_update on households for update
  using (is_household_owner(id));
create policy households_insert on households for insert
  with check (owner_id = auth.uid());

-- household_members
create policy hm_read on household_members for select
  using (user_id = auth.uid() or is_household_member(household_id));
create policy hm_owner_manage on household_members for all
  using (is_household_owner(household_id))
  with check (is_household_owner(household_id));

-- businesses / business_members
create policy biz_read on businesses for select using (is_business_member(id));
create policy bm_read on business_members for select
  using (user_id = auth.uid() or is_business_member(business_id));

-- assets
create policy assets_household_read on assets for select
  using (deleted_at is null and is_household_member(household_id));
create policy assets_business_read on assets for select
  using (deleted_at is null and business_can_see_asset(id));
create policy assets_insert on assets for insert
  with check (is_household_member(household_id) and created_by = auth.uid());
create policy assets_update on assets for update
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
create policy assets_delete on assets for delete
  using (is_household_owner(household_id));

-- documents
create policy documents_household_all on documents for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
create policy documents_business_read on documents for select
  using (
    asset_id is not null
    and doc_type in ('invoice','warranty_certificate','amc_contract','service_receipt')
    and business_can_see_asset(asset_id)
  );

-- warranties_amcs
create policy coverage_household_all on warranties_amcs for all
  using (exists (select 1 from assets a where a.id = asset_id and is_household_member(a.household_id)))
  with check (exists (select 1 from assets a where a.id = asset_id and is_household_member(a.household_id)));
create policy coverage_business_read on warranties_amcs for select
  using (business_can_see_asset(asset_id));

-- complaints
create policy complaints_household_read on complaints for select
  using (is_household_member(household_id));
create policy complaints_household_insert on complaints for insert
  with check (is_household_member(household_id) and raised_by = auth.uid());
create policy complaints_business_read on complaints for select
  using (assigned_business_id in (select my_business_ids()));
create policy complaints_business_update on complaints for update
  using (assigned_business_id in (select my_business_ids()))
  with check (assigned_business_id in (select my_business_ids()));

-- complaint_media
create policy media_household_all on complaint_media for all
  using (exists (select 1 from complaints c where c.id = complaint_id and is_household_member(c.household_id)))
  with check (exists (select 1 from complaints c where c.id = complaint_id and is_household_member(c.household_id)));
create policy media_business_read on complaint_media for select
  using (exists (
    select 1 from complaints c
    where c.id = complaint_id and c.assigned_business_id in (select my_business_ids())
  ));

-- service_logs
create policy svc_household_read on service_logs for select
  using (exists (select 1 from assets a where a.id = asset_id and is_household_member(a.household_id)));
create policy svc_business_read on service_logs for select
  using (business_id in (select my_business_ids()));
create policy svc_business_write on service_logs for insert
  with check (business_id in (select my_business_ids()) and business_can_see_asset(asset_id));
create policy svc_business_update on service_logs for update
  using (business_id in (select my_business_ids()));

-- asset_transfers
create policy transfers_read on asset_transfers for select
  using (is_household_member(from_household_id)
      or (to_household_id is not null and is_household_member(to_household_id)));
create policy transfers_insert on asset_transfers for insert
  with check (is_household_owner(from_household_id) and initiated_by = auth.uid());
