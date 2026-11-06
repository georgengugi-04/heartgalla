-- EartGalla Journeys — Phase 2 schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Principle: no invented data. Price/availability/rating columns are nullable and carry a status + verified_at.

create extension if not exists pgcrypto;

create type journeys_role as enum ('super_admin','destination_manager','tour_operator','accommodation_partner','local_guide');
create type content_status as enum ('draft','reviewed','published','archived');
create type price_status as enum ('quote_on_request','indicative','confirmed');
create type inquiry_status as enum ('new','in_review','quoted','accepted','declined','closed');

create table journeys_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role journeys_role not null,
  display_name text,
  partner_org text,
  created_at timestamptz not null default now()
);

create table counties (id serial primary key, name text unique not null, region text not null);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  county_id int references counties(id),
  tagline text, summary text, culture text,
  lat double precision, lng double precision,
  categories text[] not null default '{}',
  suggested_nights_min int, suggested_nights_max int,
  best_time text, transport_info text,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table attractions (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null, kind text, note text, lat double precision, lng double precision,
  status content_status not null default 'draft'
);

create table operators (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),
  kind text not null check (kind in ('tour_operator','guide','transport','accommodation_partner')),
  name text not null, contact_email text, website text, whatsapp text,
  verified_at timestamptz, status content_status not null default 'draft'
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  operator_id uuid references operators(id),
  title text not null, description text, interest text,
  cultural_protocol text,                -- permissions / conduct guidance shown to visitors
  community_partner text,
  status content_status not null default 'draft'
);

create table accommodation (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id),
  operator_id uuid references operators(id),
  name text not null, type text, budget_category text check (budget_category in ('budget','mid','luxury')),
  description text, facilities text[] default '{}', max_guests int,
  lat double precision, lng double precision,
  price_from numeric, price_currency text, price_status price_status not null default 'quote_on_request',
  price_verified_at timestamptz,
  external_url text,                     -- clearly-labelled outbound booking link
  availability_source text,              -- named provider/API, or null
  status content_status not null default 'draft'
);

create table packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  tier text not null check (tier in ('budget','comfort','premium')),
  name text not null, accommodation_category text,
  included text[] default '{}', excluded text[] default '{}',
  price_amount numeric, price_currency text, price_basis text check (price_basis in ('per_person','per_group')),
  price_status price_status not null default 'quote_on_request', price_verified_at timestamptz,
  operator_id uuid references operators(id),
  status content_status not null default 'draft'
);

create table package_stops (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references packages(id) on delete cascade,
  destination_id uuid not null references destinations(id),
  position int not null, nights int not null check (nights > 0)
);

create table package_inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  user_id uuid references auth.users(id),
  full_name text not null, email text not null, country text not null,
  travel_from date, travel_to date, travelers int not null check (travelers between 1 and 50),
  days int, destinations text[] not null default '{}',
  stops jsonb,                           -- ordered [{slug, nights}] from the planner
  accommodation_pref text, budget_band text, budget_note text,
  experiences text[] default '{}', special_requests text,
  base_package_id uuid references packages(id),
  status inquiry_status not null default 'new',
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table quotations (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references package_inquiries(id) on delete cascade,
  author_id uuid references auth.users(id),
  itinerary jsonb not null, total_amount numeric, currency text, valid_until date,
  message text, visitor_response text check (visitor_response in ('accepted','changes_requested','declined')),
  created_at timestamptz not null default now()
);

create table booking_requests (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references quotations(id), status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null, subject_id uuid not null,
  author_name text, rating int check (rating between 1 and 5), body text,
  status content_status not null default 'draft', created_at timestamptz not null default now()
);

-- ───────── Row Level Security ─────────
create or replace function journeys_role_of(uid uuid) returns journeys_role language sql stable security definer as
$$ select role from journeys_profiles where user_id = uid $$;

create or replace function is_staff() returns boolean language sql stable as
$$ select journeys_role_of(auth.uid()) in ('super_admin','destination_manager') $$;

alter table journeys_profiles enable row level security;
alter table counties enable row level security;
alter table destinations enable row level security;
alter table attractions enable row level security;
alter table experiences enable row level security;
alter table operators enable row level security;
alter table accommodation enable row level security;
alter table packages enable row level security;
alter table package_stops enable row level security;
alter table package_inquiries enable row level security;
alter table quotations enable row level security;
alter table booking_requests enable row level security;
alter table reviews enable row level security;

-- Public read of published content only
create policy pub_counties on counties for select using (true);
create policy pub_dest on destinations for select using (status = 'published');
create policy pub_attr on attractions for select using (status = 'published');
create policy pub_exp on experiences for select using (status = 'published');
create policy pub_acc on accommodation for select using (status = 'published');
create policy pub_pkg on packages for select using (status = 'published');
create policy pub_stops on package_stops for select using (exists (select 1 from packages p where p.id = package_id and p.status = 'published'));
create policy pub_rev on reviews for select using (status = 'published');
create policy pub_ops on operators for select using (status = 'published');

-- Staff manage everything
create policy staff_all_dest on destinations for all using (is_staff()) with check (is_staff());
create policy staff_all_attr on attractions for all using (is_staff()) with check (is_staff());
create policy staff_all_exp on experiences for all using (is_staff()) with check (is_staff());
create policy staff_all_acc on accommodation for all using (is_staff()) with check (is_staff());
create policy staff_all_pkg on packages for all using (is_staff()) with check (is_staff());
create policy staff_all_stops on package_stops for all using (is_staff()) with check (is_staff());
create policy staff_all_ops on operators for all using (is_staff()) with check (is_staff());
create policy staff_all_rev on reviews for all using (is_staff()) with check (is_staff());
create policy staff_all_counties on counties for all using (is_staff()) with check (is_staff());
create policy staff_profiles on journeys_profiles for all using (journeys_role_of(auth.uid()) = 'super_admin') with check (journeys_role_of(auth.uid()) = 'super_admin');
create policy own_profile on journeys_profiles for select using (user_id = auth.uid());

-- Partners manage only rows they own
create policy partner_acc on accommodation for all
  using (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()))
  with check (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()));
create policy partner_exp on experiences for all
  using (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()))
  with check (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()));
create policy partner_pkg on packages for all
  using (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()))
  with check (exists (select 1 from operators o where o.id = operator_id and o.owner_user_id = auth.uid()));
create policy partner_own_op on operators for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- Inquiries: inserted only by the server (service role bypasses RLS). Visitors read their own; staff read/manage all.
create policy own_inquiry on package_inquiries for select using (user_id = auth.uid());
create policy staff_inquiry on package_inquiries for all using (is_staff()) with check (is_staff());
create policy own_quote on quotations for select using (exists (select 1 from package_inquiries i where i.id = inquiry_id and i.user_id = auth.uid()));
create policy own_quote_reply on quotations for update using (exists (select 1 from package_inquiries i where i.id = inquiry_id and i.user_id = auth.uid()));
create policy staff_quote on quotations for all using (is_staff()) with check (is_staff());
create policy staff_booking on booking_requests for all using (is_staff()) with check (is_staff());

insert into counties (name, region) values
 ('Nairobi','Central Kenya'),('Nakuru','Rift Valley'),('Mombasa','Coast'),('Lamu','Coast'),('Kwale','Coast'),
 ('Kilifi','Coast'),('Laikipia','Central Kenya'),('Kisumu','Western Kenya'),('Nyeri','Central Kenya')
on conflict do nothing;
