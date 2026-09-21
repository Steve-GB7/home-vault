create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create type user_role as enum ('household', 'business');
create type member_role as enum ('owner', 'adult', 'viewer');
create type business_type as enum ('brand', 'service_center', 'amc_provider', 'retailer');
create type subscription_tier as enum ('free', 'starter', 'pro', 'enterprise');

create type asset_category as enum (
  'air_conditioner', 'refrigerator', 'washing_machine', 'television',
  'ro_water_purifier', 'microwave', 'geyser', 'dishwasher', 'other'
);

create type asset_status as enum ('active', 'under_repair', 'retired', 'transferred');

create type coverage_type as enum ('manufacturer_warranty', 'extended_warranty', 'amc');

create type document_type as enum (
  'invoice', 'warranty_certificate', 'amc_contract', 'manual',
  'installation_report', 'service_receipt', 'evidence', 'other'
);

create type document_status as enum ('pending', 'ready', 'failed');

create type complaint_status as enum ('new', 'assigned', 'in_progress', 'resolved', 'closed');
create type complaint_priority as enum ('low', 'medium', 'high', 'urgent');

create type service_type as enum ('installation', 'preventive_maintenance', 'repair', 'amc_visit', 'inspection');
create type media_type as enum ('image', 'video', 'audio', 'document');
