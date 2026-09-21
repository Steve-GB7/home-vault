create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null default 'HomeVault User',
  email          text not null,
  phone          text,
  avatar_url     text,
  default_role   user_role not null default 'household',
  timezone       text not null default 'Asia/Kolkata',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table households (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  owner_id       uuid not null references profiles(id) on delete restrict,
  address_line   text,
  city           text,
  state          text,
  pincode        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table household_members (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete cascade,
  member_role    member_role not null default 'adult',
  joined_at      timestamptz not null default now(),
  unique (household_id, user_id)
);

create table businesses (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  btype             business_type not null default 'service_center',
  contact_email     text not null,
  contact_phone     text,
  city              text,
  service_categories asset_category[] not null default '{}',
  tier              subscription_tier not null default 'pro',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table business_members (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references businesses(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete cascade,
  is_admin       boolean not null default false,
  display_name   text not null,
  created_at     timestamptz not null default now(),
  unique (business_id, user_id)
);

create table assets (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references households(id) on delete cascade,
  category            asset_category not null,
  brand               text not null,
  model               text not null,
  serial_number       text,
  nickname            text,
  purchase_date       date,
  purchase_price      numeric(12,2),
  seller_name         text,
  location_in_home    text,
  capacity_spec       text,
  status              asset_status not null default 'active',
  qr_token            text not null default encode(gen_random_bytes(12), 'hex'),
  provenance_asset_id uuid references assets(id) on delete set null,
  image_url           text,
  created_by          uuid not null references profiles(id) on delete restrict,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index assets_qr_token_key on assets(qr_token);
create unique index assets_unique_serial_per_household
  on assets (household_id, lower(serial_number))
  where serial_number is not null and deleted_at is null;
create index assets_household_idx on assets(household_id) where deleted_at is null;
create index assets_brand_trgm on assets using gin (brand gin_trgm_ops);

create table documents (
  id             uuid primary key default gen_random_uuid(),
  asset_id       uuid references assets(id) on delete cascade,
  household_id   uuid not null references households(id) on delete cascade,
  doc_type       document_type not null default 'other',
  file_path      text not null,
  file_name      text not null,
  mime_type      text not null,
  size_bytes     bigint not null default 0,
  status         document_status not null default 'pending',
  ocr_json       jsonb,
  uploaded_by    uuid not null references profiles(id) on delete restrict,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index documents_asset_idx on documents(asset_id);

create table warranties_amcs (
  id                  uuid primary key default gen_random_uuid(),
  asset_id            uuid not null references assets(id) on delete cascade,
  coverage_type       coverage_type not null,
  provider_name       text not null,
  provider_business_id uuid references businesses(id) on delete set null,
  start_date          date not null,
  end_date            date not null,
  cost                numeric(12,2) not null default 0,
  terms               text,
  document_id         uuid references documents(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint coverage_dates_valid check (end_date >= start_date)
);
create index coverage_asset_idx on warranties_amcs(asset_id, end_date desc);

create table complaints (
  id                    uuid primary key default gen_random_uuid(),
  ticket_no             text not null unique,
  asset_id              uuid not null references assets(id) on delete cascade,
  household_id          uuid not null references households(id) on delete cascade,
  raised_by             uuid not null references profiles(id) on delete restrict,
  assigned_business_id  uuid references businesses(id) on delete set null,
  assigned_technician_id uuid references business_members(id) on delete set null,
  title                 text not null,
  description           text not null,
  status                complaint_status not null default 'new',
  priority              complaint_priority not null default 'medium',
  under_warranty        boolean not null default false,
  resolved_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index complaints_business_idx on complaints(assigned_business_id, status);
create index complaints_asset_idx on complaints(asset_id, created_at desc);

create table complaint_media (
  id             uuid primary key default gen_random_uuid(),
  complaint_id   uuid not null references complaints(id) on delete cascade,
  file_path      text not null,
  mtype          media_type not null default 'image',
  caption        text,
  uploaded_by    uuid not null references profiles(id) on delete restrict,
  created_at     timestamptz not null default now()
);

create table service_logs (
  id                uuid primary key default gen_random_uuid(),
  asset_id          uuid not null references assets(id) on delete restrict,
  complaint_id      uuid references complaints(id) on delete set null,
  business_id       uuid references businesses(id) on delete set null,
  technician_name   text not null,
  stype             service_type not null default 'repair',
  service_date      date not null default current_date,
  work_performed    text not null,
  parts_replaced    jsonb not null default '[]'::jsonb,
  labour_cost       numeric(12,2) not null default 0,
  parts_cost        numeric(12,2) not null default 0,
  total_cost        numeric(12,2) generated always as (labour_cost + parts_cost) stored,
  covered_by_warranty boolean not null default false,
  next_service_date date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index service_logs_asset_idx on service_logs(asset_id, service_date desc);

create table asset_transfers (
  id                 uuid primary key default gen_random_uuid(),
  source_asset_id    uuid not null references assets(id) on delete restrict,
  target_asset_id    uuid references assets(id) on delete set null,
  from_household_id  uuid not null references households(id) on delete restrict,
  to_household_id    uuid references households(id) on delete set null,
  transfer_price     numeric(12,2),
  transferred_at     timestamptz not null default now(),
  initiated_by       uuid not null references profiles(id) on delete restrict
);
