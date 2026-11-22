-- ============================================================================
-- NEEL HAIR REVIEW & QR PLATFORM - PRODUCTION SECURITY MIGRATION
-- Run this migration in Supabase SQL Editor
-- ============================================================================

-- 1. Ensure extensions
create extension if not exists "uuid-ossp";

-- 2. Businesses table: ensure columns exist
alter table public.businesses add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.businesses add column if not exists owner_email text;
alter table public.businesses add column if not exists google_review_url text;

-- 3. Create missing table: admin_profiles
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('owner', 'admin')),
  status text not null default 'active' check (status in ('active', 'deactivated')),
  business_id uuid references public.businesses(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4. Create missing table: admin_invitations
create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  role text not null check (role in ('owner', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_admin_profiles_email on public.admin_profiles(email);
create index if not exists idx_admin_invitations_email on public.admin_invitations(email);

-- 5. Helper Functions: is_admin() and is_owner()
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and role = 'owner'
      and status = 'active'
  );
$$;

-- 6. Function: claim_owner()
-- If no owner exists in admin_profiles, provisions caller as active owner and binds to business.
create or replace function public.claim_owner()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_user_name text;
  v_owner_exists boolean;
  v_biz_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  -- Check if an active owner already exists
  select exists (
    select 1
    from public.admin_profiles
    where role = 'owner'
      and status = 'active'
  ) into v_owner_exists;

  if v_owner_exists then
    return false;
  end if;

  select email, coalesce(raw_user_meta_data->>'full_name', 'Salon Owner')
  into v_user_email, v_user_name
  from auth.users
  where id = v_user_id;

  select id into v_biz_id from public.businesses limit 1;

  insert into public.admin_profiles (id, email, full_name, role, status, business_id, created_at)
  values (v_user_id, v_user_email, v_user_name, 'owner', 'active', v_biz_id, now())
  on conflict (id) do update
  set role = 'owner', status = 'active';

  if v_biz_id is not null then
    update public.businesses
    set owner_id = v_user_id,
        owner_email = v_user_email
    where id = v_biz_id;
  end if;

  return true;
end;
$$;

-- 7. Function: accept_invitation()
-- Allows an authenticated invited email to claim an active profile matching their pending invitation.
create or replace function public.accept_invitation()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_user_name text;
  v_invite record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  select email, coalesce(raw_user_meta_data->>'full_name', 'Administrator')
  into v_user_email, v_user_name
  from auth.users
  where id = v_user_id;

  if v_user_email is null then
    return false;
  end if;

  select * into v_invite
  from public.admin_invitations
  where lower(email) = lower(v_user_email)
    and status = 'pending'
    and expires_at > now()
  order by created_at desc
  limit 1;

  if not found then
    return false;
  end if;

  insert into public.admin_profiles (id, email, full_name, role, status, business_id, created_at)
  values (
    v_user_id,
    v_user_email,
    coalesce(v_invite.full_name, v_user_name),
    v_invite.role,
    'active',
    v_invite.business_id,
    now()
  )
  on conflict (id) do update
  set role = v_invite.role,
      status = 'active';

  update public.admin_invitations
  set status = 'accepted'
  where id = v_invite.id;

  return true;
end;
$$;

-- Grant execution permissions
grant execute on function public.is_admin() to public, anon, authenticated;
grant execute on function public.is_owner() to public, anon, authenticated;
grant execute on function public.claim_owner() to authenticated;
grant execute on function public.accept_invitation() to authenticated;

-- 8. Enable Row Level Security (RLS) on all 5 tables
alter table public.businesses enable row level security;
alter table public.feedback enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.admin_invitations enable row level security;

-- 9. Drop ALL existing policies cleanly on the 5 tables
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('businesses', 'feedback', 'analytics_events', 'admin_profiles', 'admin_invitations')
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end;
$$;

-- 10. Create new locked-down policies

-- Table: businesses
-- Anyone can view salon details
create policy "businesses_public_select"
on public.businesses
for select
using (true);

-- Only active admins/owners can update salon settings
create policy "businesses_admin_update"
on public.businesses
for update
using (public.is_admin())
with check (public.is_admin());

-- No client INSERT / DELETE on businesses

-- Table: feedback
-- Public customers can insert feedback only if rating is 1..5 and text <= 500 chars
create policy "feedback_public_insert"
on public.feedback
for insert
with check (
  rating >= 1 and rating <= 5
  and length(coalesce(feedback_text, '')) <= 500
);

-- Only active admins/owners can view, update or delete feedback
create policy "feedback_admin_select"
on public.feedback
for select
using (public.is_admin());

create policy "feedback_admin_update"
on public.feedback
for update
using (public.is_admin())
with check (public.is_admin());

create policy "feedback_admin_delete"
on public.feedback
for delete
using (public.is_admin());

-- Table: analytics_events
-- Public can record telemetry only for valid event types
create policy "analytics_public_insert"
on public.analytics_events
for insert
with check (
  event_type in ('qr_scan', 'google_click', 'feedback_submitted')
);

-- Only active admins/owners can view or reset analytics
create policy "analytics_admin_select"
on public.analytics_events
for select
using (public.is_admin());

create policy "analytics_admin_delete"
on public.analytics_events
for delete
using (public.is_admin());

-- Table: admin_profiles
-- Users can view their own profile row
create policy "admin_profiles_self_select"
on public.admin_profiles
for select
using (auth.uid() = id);

-- Owners can view all admin profiles
create policy "admin_profiles_owner_select"
on public.admin_profiles
for select
using (public.is_owner());

-- Owners can update admin profiles (activate/deactivate)
create policy "admin_profiles_owner_update"
on public.admin_profiles
for update
using (public.is_owner())
with check (public.is_owner());

-- Owners can delete admin profiles
create policy "admin_profiles_owner_delete"
on public.admin_profiles
for delete
using (public.is_owner());

-- No client direct INSERT on admin_profiles (must use claim_owner() or accept_invitation())

-- Table: admin_invitations
-- Only owners can view, invite, update or revoke invitations
create policy "admin_invitations_owner_select"
on public.admin_invitations
for select
using (public.is_owner());

create policy "admin_invitations_owner_insert"
on public.admin_invitations
for insert
with check (public.is_owner());

create policy "admin_invitations_owner_update"
on public.admin_invitations
for update
using (public.is_owner())
with check (public.is_owner());

create policy "admin_invitations_owner_delete"
on public.admin_invitations
for delete
using (public.is_owner());
