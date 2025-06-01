-- Migration: create frameworks, controls, and update logs tables

-- Ensure pgcrypto for gen_random_uuid
create extension if not exists "pgcrypto";

-- Frameworks Table
create table if not exists public.frameworks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  version text not null,
  last_synced_at timestamptz not null default now()
);

-- Controls Table
create table if not exists public.controls (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  control_id text not null,
  name text not null,
  description text,
  subcontrols jsonb not null,
  created_at timestamptz not null default now(),
  unique(framework_id, control_id)
);

-- Framework Update Logs Table
create table if not exists public.framework_update_logs (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  updated_at timestamptz not null default now(),
  changes jsonb not null
);
