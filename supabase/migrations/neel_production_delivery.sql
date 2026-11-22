-- ============================================================================
-- NEEL HAIR REVIEW & QR PLATFORM - FINAL PRODUCTION DELIVERY MIGRATION
-- Database: Supabase PostgreSQL
-- Purpose:
--   1. Clean all test/demo data (feedback, analytics, test admins)
--   2. Reset owner lock so Neel Hair owner can create their initial account
--   3. Create customer_enquiries table for WhatsApp Quotation Management
--   4. Enable RLS and establish strict security policies
-- ============================================================================

-- 1. Ensure required extensions
create extension if not exists "uuid-ossp";

-- 2. Ensure customer_enquiries table exists
create table if not exists public.customer_enquiries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  customer_name text not null,
  phone text not null,
  service text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'quoted', 'completed', 'cancelled')),
  quotation_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  final_amount numeric not null default 0,
  notes text,
  quoted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Performance indices
create index if not exists idx_customer_enquiries_created on public.customer_enquiries(created_at desc);
create index if not exists idx_customer_enquiries_status on public.customer_enquiries(status);
create index if not exists idx_customer_enquiries_phone on public.customer_enquiries(phone);

-- 3. Enable RLS on customer_enquiries
alter table public.customer_enquiries enable row level security;

-- Drop any previous enquiry policies to prevent duplicates
drop policy if exists "customer_enquiries_public_insert" on public.customer_enquiries;
drop policy if exists "customer_enquiries_admin_select" on public.customer_enquiries;
drop policy if exists "customer_enquiries_admin_update" on public.customer_enquiries;
drop policy if exists "customer_enquiries_admin_delete" on public.customer_enquiries;

-- Public customers can submit enquiries without sign-in
create policy "customer_enquiries_public_insert"
on public.customer_enquiries
for insert
with check (
  length(trim(customer_name)) >= 2
  and length(trim(phone)) >= 8
);

-- Only verified admins / owners can view, quote, update or delete enquiries
create policy "customer_enquiries_admin_select"
on public.customer_enquiries
for select
using (public.is_admin());

create policy "customer_enquiries_admin_update"
on public.customer_enquiries
for update
using (public.is_admin())
with check (public.is_admin());

create policy "customer_enquiries_admin_delete"
on public.customer_enquiries
for delete
using (public.is_admin());

-- 4. Clean all demo and test records (Preserving table schema, structures & relations)
delete from public.feedback;
delete from public.analytics_events;
delete from public.customer_enquiries;
delete from public.admin_invitations;
delete from public.admin_profiles;

-- 5. Reset owner lock on businesses table
-- Allows the genuine Neel Hair salon owner to register fresh through the Admin portal
update public.businesses
set owner_id = null,
    owner_email = null,
    name = 'Neel Hair',
    tagline = 'Hair • Style • Grooming',
    category = 'Hair Salon / Barber Shop',
    contact_number = '+91 99223 44401',
    address = 'Balad Road, Jalgaon, Maharashtra',
    google_review_link = 'https://g.page/r/Cb2mn9IvOR_1EAE/review',
    google_review_url = 'https://g.page/r/Cb2mn9IvOR_1EAE/review',
    show_google_review_btn = true,
    show_feedback_form = true,
    qr_destination_url = 'https://reviewtap.in/neel-hair',
    qr_style = 'classic',
    center_logo_url = ''
where true;

-- 6. Verification query
select 
  (select count(*) from public.feedback) as feedback_count,
  (select count(*) from public.analytics_events) as analytics_count,
  (select count(*) from public.customer_enquiries) as enquiries_count,
  (select count(*) from public.admin_profiles) as admin_count,
  (select owner_id from public.businesses limit 1) as owner_id,
  (select name from public.businesses limit 1) as business_name;
