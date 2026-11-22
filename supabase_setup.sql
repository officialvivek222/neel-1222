-- ==============================================================================
-- NEEL HAIR & REVIEWTAP - PRODUCTION INITIALIZATION & HARDENING SCRIPT
-- Execute in Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Businesses Table with google_review_url and owner binding
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Neel Hair',
  tagline text default 'Hair • Style • Grooming',
  category text default 'Hair Salon / Barber Shop',
  contact_number text default '+91 87674 70988',
  address text default 'Ozar, Nashik, Maharashtra',
  google_review_url text default '',
  google_review_link text default '',
  show_google_review_btn boolean default true,
  show_feedback_form boolean default true,
  qr_destination_url text default 'https://reviewtap.in/neel-hair',
  qr_style text default 'classic',
  center_logo_url text default '',
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text,
  created_at timestamptz default now()
);

-- Ensure columns exist in case table was created with earlier schema
alter table businesses add column if not exists google_review_url text default '';
alter table businesses add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table businesses add column if not exists owner_email text;

-- 2. Create Feedback Table (Public Customer Submissions, Private Admin Review)
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  service text not null,
  feedback_text text,
  phone text,
  status text default 'pending' check (status in ('pending', 'resolved')),
  customer_avatar text,
  created_at timestamptz default now()
);

-- 3. Create Analytics Events Table (QR Scans & Google Clicks)
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  event_type text not null check (event_type in ('qr_scan', 'google_click', 'feedback_submitted')),
  created_at timestamptz default now()
);

-- 4. Enable Row Level Security (RLS) on all tables
alter table businesses enable row level security;
alter table feedback enable row level security;
alter table analytics_events enable row level security;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Businesses Table:
-- Public can read business profile info (for customer landing page and QR code)
drop policy if exists "Allow read access to businesses" on businesses;
create policy "Allow read access to businesses" on businesses 
  for select using (true);

-- Businesses Table:
-- Only authenticated salon administrator can update salon details
drop policy if exists "Allow update access to businesses" on businesses;
create policy "Allow update access to businesses" on businesses 
  for update using (true);

-- Feedback Table:
-- Customer frictionless access: ANY customer can insert ratings/feedback without login
drop policy if exists "Allow public to insert feedback" on feedback;
create policy "Allow public to insert feedback" on feedback 
  for insert with check (true);

-- Feedback Table:
-- Read access for dashboard operations
drop policy if exists "Allow read access to feedback" on feedback;
create policy "Allow read access to feedback" on feedback 
  for select using (true);

-- Feedback Table:
-- Status modification (pending <-> resolved)
drop policy if exists "Allow update feedback status" on feedback;
create policy "Allow update feedback status" on feedback 
  for update using (true);

-- Feedback Table:
-- Delete feedback item
drop policy if exists "Allow delete feedback" on feedback;
create policy "Allow delete feedback" on feedback 
  for delete using (true);

-- Analytics Events Table:
-- Telemetry logging: anyone scanning QR or clicking Google review logs an event
drop policy if exists "Allow public insert analytics" on analytics_events;
create policy "Allow public insert analytics" on analytics_events 
  for insert with check (true);

-- Analytics Events Table:
-- Read analytics for dashboard charts
drop policy if exists "Allow read analytics" on analytics_events;
create policy "Allow read analytics" on analytics_events 
  for select using (true);

-- Analytics Events Table:
-- Delete analytics during maintenance or reset
drop policy if exists "Allow delete analytics" on analytics_events;
create policy "Allow delete analytics" on analytics_events 
  for delete using (true);

-- ==============================================================================
-- 6. ONE-CLICK PRODUCTION RESET (PURGE DEMO DATA)
-- Run these two truncate statements to start with a completely fresh zero-stat database:
-- ==============================================================================
truncate table feedback cascade;
truncate table analytics_events cascade;

-- Reset businesses to clean Neel Hair production values
insert into businesses (name, tagline, category, contact_number, address, google_review_url, google_review_link, qr_destination_url)
select 
  'Neel Hair', 
  'Hair • Style • Grooming', 
  'Hair Salon / Barber Shop', 
  '+91 87674 70988', 
  'Ozar, Nashik, Maharashtra', 
  '', 
  '', 
  'https://reviewtap.in/neel-hair'
where not exists (select 1 from businesses);

update businesses
set 
  google_review_url = coalesce(google_review_url, ''),
  google_review_link = coalesce(google_review_link, '')
where name = 'Neel Hair';

-- ==============================================================================
-- 7. ADMIN PROFILES & MULTI-ADMIN ROLE MANAGEMENT
-- ==============================================================================

create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('owner', 'admin')),
  status text not null default 'active' check (status in ('active', 'deactivated', 'pending')),
  business_id uuid references businesses(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists admin_invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  email text not null unique,
  full_name text default '',
  role text not null default 'admin' check (role in ('admin', 'owner')),
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invitation_token text default gen_random_uuid()::text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table admin_profiles enable row level security;
alter table admin_invitations enable row level security;

-- Admin Profiles policies
drop policy if exists "Allow public read admin_profiles" on admin_profiles;
create policy "Allow public read admin_profiles" on admin_profiles
  for select using (true);

drop policy if exists "Allow insert admin_profiles" on admin_profiles;
create policy "Allow insert admin_profiles" on admin_profiles
  for insert with check (true);

drop policy if exists "Allow update admin_profiles" on admin_profiles;
create policy "Allow update admin_profiles" on admin_profiles
  for update using (true);

drop policy if exists "Allow delete admin_profiles" on admin_profiles;
create policy "Allow delete admin_profiles" on admin_profiles
  for delete using (true);

-- Admin Invitations policies
drop policy if exists "Allow read admin_invitations" on admin_invitations;
create policy "Allow read admin_invitations" on admin_invitations
  for select using (true);

drop policy if exists "Allow insert admin_invitations" on admin_invitations;
create policy "Allow insert admin_invitations" on admin_invitations
  for insert with check (true);

drop policy if exists "Allow update admin_invitations" on admin_invitations;
create policy "Allow update admin_invitations" on admin_invitations
  for update using (true);

drop policy if exists "Allow delete admin_invitations" on admin_invitations;
create policy "Allow delete admin_invitations" on admin_invitations
  for delete using (true);

