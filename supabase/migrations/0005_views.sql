-- Businesses must never see purchase_price or seller_name.
create or replace view asset_service_context
with (security_invoker = true) as
select
  a.id, a.household_id, a.category, a.brand, a.model, a.serial_number,
  a.nickname, a.purchase_date, a.location_in_home, a.capacity_spec, a.status,
  h.name as household_name, h.city, h.pincode
from assets a
join households h on h.id = a.household_id
where a.deleted_at is null;

create or replace view asset_coverage_status
with (security_invoker = true) as
select
  a.id as asset_id,
  max(w.end_date) filter (where w.coverage_type in ('manufacturer_warranty','extended_warranty')) as warranty_end,
  max(w.end_date) filter (where w.coverage_type = 'amc') as amc_end,
  max(w.end_date) filter (where w.coverage_type in ('manufacturer_warranty','extended_warranty'))
    - current_date as warranty_days_left,
  max(w.end_date) filter (where w.coverage_type = 'amc') - current_date as amc_days_left
from assets a
left join warranties_amcs w on w.asset_id = a.id
where a.deleted_at is null
group by a.id;

create or replace view asset_spend_summary
with (security_invoker = true) as
select
  a.id as asset_id,
  a.brand, a.model,
  coalesce(a.purchase_price, 0) as purchase_price,
  coalesce(sum(s.total_cost), 0) as total_service_spend,
  count(s.id) as service_count,
  max(s.service_date) as last_service_date,
  min(s.next_service_date) filter (where s.next_service_date >= current_date) as next_service_date
from assets a
left join service_logs s on s.asset_id = a.id
where a.deleted_at is null
group by a.id, a.brand, a.model, a.purchase_price;
