-- Migration: Create user_profiles table for multi-tenant auth
-- ===========================================================
-- Run with Supabase CLI: supabase db push
-- ===========================================================

-- -------------------------------
-- UP
-- -------------------------------

-- 1. Table definition
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  user_type text default 'customer', -- 'system' | 'customer'
  workspace_id uuid,                -- current workspace reference (nullable)
  role_name text default 'member',  -- e.g. owner/admin/member
  features jsonb default '[]'::jsonb,
  access jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row-Level Security
alter table public.user_profiles enable row level security;

-- 3. RLS policies
create policy "Users can read their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -------------------------------
-- DOWN
-- -------------------------------
-- drop table if exists public.user_profiles;
