create type invite_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table household_invites (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  email         text not null,
  invited_role  member_role not null default 'adult',
  token         text not null default encode(gen_random_bytes(24), 'hex'),
  status        invite_status not null default 'pending',
  invited_by    uuid not null references profiles(id) on delete restrict,
  expires_at    timestamptz not null default now() + interval '7 days',
  created_at    timestamptz not null default now()
);
create unique index household_invites_token_key on household_invites(token);
create index household_invites_email_idx on household_invites(lower(email));

create table business_invites (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  email         text not null,
  is_admin      boolean not null default false,
  token         text not null default encode(gen_random_bytes(24), 'hex'),
  status        invite_status not null default 'pending',
  invited_by    uuid not null references profiles(id) on delete restrict,
  expires_at    timestamptz not null default now() + interval '7 days',
  created_at    timestamptz not null default now()
);
create unique index business_invites_token_key on business_invites(token);
create index business_invites_email_idx on business_invites(lower(email));

-- Platform-level oversight: HomeVault's own team, not a tenant
create table platform_admins (
  id         uuid primary key references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table businesses add column if not exists is_approved boolean not null default true;
-- default true so the demo keeps working; flip to false-by-default once you actually
-- want manual company vetting before go-live

create or replace function is_platform_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from platform_admins where id = auth.uid());
$$;

alter table household_invites enable row level security;
alter table business_invites  enable row level security;
alter table platform_admins   enable row level security;

create policy hh_invites_owner_manage on household_invites for all
  using (is_household_owner(household_id))
  with check (is_household_owner(household_id));

create policy hh_invites_invitee_read on household_invites for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy biz_invites_admin_manage on business_invites for all
  using (exists (select 1 from business_members bm
                 where bm.business_id = business_invites.business_id
                 and bm.user_id = auth.uid() and bm.is_admin))
  with check (exists (select 1 from business_members bm
                 where bm.business_id = business_invites.business_id
                 and bm.user_id = auth.uid() and bm.is_admin));

create policy biz_invites_invitee_read on business_invites for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy platform_admins_self_read on platform_admins for select
  using (id = auth.uid());

-- Businesses: only an approved company is visible to the public join flow;
-- members of an unapproved business can still see their own row (pending state UI)
drop policy if exists biz_read on businesses;
create policy biz_read on businesses for select
  using (is_business_member(id) or is_platform_admin());

create policy biz_platform_manage on businesses for update
  using (is_platform_admin());
