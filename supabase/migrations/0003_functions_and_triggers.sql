create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','households','businesses','assets','documents',
    'warranties_amcs','complaints','service_logs'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- Ticket number: HV-YYYYMM-XXXX
create sequence if not exists ticket_seq start 1001;

create or replace function gen_ticket_no() returns trigger
language plpgsql as $$
begin
  if new.ticket_no is null or new.ticket_no = '' then
    new.ticket_no := 'HV-' || to_char(now(), 'YYYYMM') || '-' || nextval('ticket_seq');
  end if;
  return new;
end;
$$;

create trigger trg_complaint_ticket before insert on complaints
for each row execute function gen_ticket_no();

-- Enforce legal complaint status transitions
create or replace function enforce_complaint_transition() returns trigger
language plpgsql as $$
declare ok boolean;
begin
  if new.status = old.status then return new; end if;
  ok := case
    when old.status = 'new'         and new.status in ('assigned','closed')            then true
    when old.status = 'assigned'    and new.status in ('in_progress','new','closed')   then true
    when old.status = 'in_progress' and new.status in ('resolved','assigned')          then true
    when old.status = 'resolved'    and new.status in ('closed','in_progress')         then true
    else false
  end;
  if not ok then
    raise exception 'Illegal complaint transition: % -> %', old.status, new.status;
  end if;
  if new.status = 'resolved' then new.resolved_at := now(); end if;
  if new.status = 'in_progress' then new.resolved_at := null; end if;
  return new;
end;
$$;

create trigger trg_complaint_transition before update of status on complaints
for each row execute function enforce_complaint_transition();

-- Flip asset status while a repair is live
create or replace function sync_asset_status() returns trigger
language plpgsql as $$
begin
  if new.status = 'in_progress' then
    update assets set status = 'under_repair' where id = new.asset_id and status = 'active';
  elsif new.status in ('resolved','closed') then
    update assets set status = 'active' where id = new.asset_id and status = 'under_repair';
  end if;
  return new;
end;
$$;

create trigger trg_sync_asset_status after update of status on complaints
for each row execute function sync_asset_status();

-- Stamp warranty coverage onto the ticket at creation time
create or replace function stamp_warranty_flag() returns trigger
language plpgsql as $$
begin
  new.under_warranty := exists (
    select 1 from warranties_amcs w
    where w.asset_id = new.asset_id and current_date between w.start_date and w.end_date
  );
  return new;
end;
$$;

create trigger trg_stamp_warranty before insert on complaints
for each row execute function stamp_warranty_flag();

-- RLS helper functions (security definer)
create or replace function is_household_member(hid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

create or replace function is_household_owner(hid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid() and member_role = 'owner'
  );
$$;

create or replace function is_business_member(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from business_members
    where business_id = bid and user_id = auth.uid()
  );
$$;

create or replace function my_business_ids() returns setof uuid
language sql security definer stable set search_path = public as $$
  select business_id from business_members where user_id = auth.uid();
$$;

-- Ticket-scoped, time-boxed cross-tenant read bridge
create or replace function business_can_see_asset(aid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from complaints c
    where c.asset_id = aid
      and c.assigned_business_id in (select my_business_ids())
      and (c.status <> 'closed' or c.resolved_at > now() - interval '90 days')
  );
$$;

-- Auto-provision profile on signup
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'HomeVault User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();
