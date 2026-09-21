-- Demo auth users (password for all: HomeVault@2026)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated',
 'priya@homevault.demo', crypt('HomeVault@2026', gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}','{"full_name":"Priya Nair"}', now(), now()),
('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated',
 'arun@homevault.demo', crypt('HomeVault@2026', gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}','{"full_name":"Arun Nair"}', now(), now()),
('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated',
 'desk@coolcare.demo', crypt('HomeVault@2026', gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}','{"full_name":"Rahul Menon"}', now(), now())
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id, id, id::text,
  json_build_object('sub', id::text, 'email', email)::jsonb,
  'email', now(), now(), now()
from auth.users
where email in ('priya@homevault.demo','arun@homevault.demo','desk@coolcare.demo')
on conflict do nothing;

update profiles set default_role = 'business' where id = '33333333-3333-3333-3333-333333333333';

-- Household
insert into households (id, name, owner_id, address_line, city, state, pincode) values
('aaaaaaaa-0000-0000-0000-000000000001','Nair Residence','11111111-1111-1111-1111-111111111111',
 'Flat 4B, Green Meadows','Pathanamthitta','Kerala','689645');

insert into household_members (household_id, user_id, member_role) values
('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','owner'),
('aaaaaaaa-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','adult');

-- Business
insert into businesses (id, name, btype, contact_email, contact_phone, city, service_categories, tier) values
('bbbbbbbb-0000-0000-0000-000000000001','CoolCare Authorized Service','service_center',
 'desk@coolcare.demo','+91-9447-112233','Pathanamthitta',
 '{air_conditioner,refrigerator,washing_machine}','pro');

insert into business_members (id, business_id, user_id, is_admin, display_name) values
('cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',
 '33333333-3333-3333-3333-333333333333', true, 'Rahul Menon');

-- Assets
insert into assets (id, household_id, category, brand, model, serial_number, nickname,
                    purchase_date, purchase_price, seller_name, location_in_home,
                    capacity_spec, created_by) values
('dddddddd-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','air_conditioner',
 'LG','PS-Q19YNZE','311KRPZ4D827','Living Room AC',
 date '2023-04-18', 42990.00, 'Bismi Appliances, Pathanamthitta','Living Room',
 '1.5 Ton 5 Star Dual Inverter','11111111-1111-1111-1111-111111111111'),
('dddddddd-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001','refrigerator',
 'Samsung','RT34C4522S8','SMSNRF2022X91','Kitchen Fridge',
 date '2022-11-02', 33500.00, 'Reliance Digital','Kitchen',
 '301 L Double Door','11111111-1111-1111-1111-111111111111'),
('dddddddd-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001','ro_water_purifier',
 'Kent','Grand Plus','KNTGP8841','RO Purifier',
 date '2024-06-10', 17900.00, 'Kent Dealer Store','Kitchen',
 '9 L Storage','11111111-1111-1111-1111-111111111111');

-- Documents
insert into documents (id, asset_id, household_id, doc_type, file_path, file_name, mime_type,
                       size_bytes, status, ocr_json, uploaded_by) values
('eeeeeeee-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000001','invoice',
 'aaaaaaaa-0000-0000-0000-000000000001/dddddddd-0000-0000-0000-000000000001/invoice-lg-ac.pdf',
 'invoice-lg-ac.pdf','application/pdf', 284512, 'ready',
 '{"brand":"LG","model":"PS-Q19YNZE","serial_number":"311KRPZ4D827","purchase_date":"2023-04-18","purchase_price":42990,"seller_name":"Bismi Appliances, Pathanamthitta","warranty_months":12,"compressor_warranty_months":120,"confidence":{"brand":0.98,"model":0.95,"serial_number":0.91,"purchase_date":0.97,"purchase_price":0.99}}'::jsonb,
 '11111111-1111-1111-1111-111111111111'),
('eeeeeeee-0000-0000-0000-000000000002','dddddddd-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000001','amc_contract',
 'aaaaaaaa-0000-0000-0000-000000000001/dddddddd-0000-0000-0000-000000000001/amc-2026.pdf',
 'amc-2026.pdf','application/pdf', 118300, 'ready', null,
 '11111111-1111-1111-1111-111111111111');

-- Coverage
insert into warranties_amcs (asset_id, coverage_type, provider_name, provider_business_id,
                             start_date, end_date, cost, terms, document_id) values
('dddddddd-0000-0000-0000-000000000001','manufacturer_warranty','LG Electronics India', null,
 date '2023-04-18', date '2033-04-17', 0,
 '1 year comprehensive; 5 years PCB; 10 years Dual Inverter compressor.',
 'eeeeeeee-0000-0000-0000-000000000001'),
('dddddddd-0000-0000-0000-000000000001','amc','CoolCare Authorized Service',
 'bbbbbbbb-0000-0000-0000-000000000001',
 current_date - 324, current_date + 41, 3500,
 'Two preventive services, gas top-up excluded, free labour on breakdown calls.',
 'eeeeeeee-0000-0000-0000-000000000002'),
('dddddddd-0000-0000-0000-000000000002','manufacturer_warranty','Samsung India', null,
 date '2022-11-02', date '2032-11-01', 0, '1 year product, 10 years digital inverter compressor.', null),
('dddddddd-0000-0000-0000-000000000003','manufacturer_warranty','Kent RO Systems', null,
 date '2024-06-10', date '2025-06-09', 0, '1 year onsite warranty.', null);

-- Historical services (pre-existing passport depth)
insert into service_logs (asset_id, business_id, technician_name, stype, service_date,
                          work_performed, parts_replaced, labour_cost, parts_cost,
                          covered_by_warranty, next_service_date) values
('dddddddd-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Rahul Menon',
 'installation', date '2023-04-20','Indoor and outdoor unit installation, copper piping, vacuum test.',
 '[{"part":"Copper pipe 3m","qty":1,"cost":1200}]'::jsonb, 800, 1200, false, date '2023-10-20'),
('dddddddd-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Sajid K',
 'preventive_maintenance', date '2024-03-11','Deep cleaning of coil and blower, drain flush, gas pressure check.',
 '[]'::jsonb, 1400, 0, false, date '2024-09-11'),
('dddddddd-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Sajid K',
 'repair', date '2025-05-22','Replaced faulty capacitor on outdoor unit; verified compressor start current.',
 '[{"part":"Run capacitor 45uF","qty":1,"cost":900}]'::jsonb, 600, 900, false, date '2025-11-22'),
('dddddddd-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','Rahul Menon',
 'repair', date '2024-08-05','Door gasket replacement, thermostat recalibration.',
 '[{"part":"Door gasket","qty":1,"cost":1450}]'::jsonb, 500, 1450, false, null);

-- One open ticket so the business dashboard is never empty
insert into complaints (id, asset_id, household_id, raised_by, assigned_business_id,
                        title, description, status, priority) values
('ffffffff-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
 'bbbbbbbb-0000-0000-0000-000000000001',
 'RO purifier leaking from bottom',
 'Water pooling under the unit since yesterday morning. Filter light is green.',
 'assigned','high');
