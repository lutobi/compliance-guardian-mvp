create extension if not exists "pgcrypto";

-- Migration: create feature tables for Team, Notification Rules, Integrations, and Billing

-- Team Members Table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references public.settings(workspace_id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  status text not null default 'pending' check (status in ('pending','active')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Notification Rules Table
create table if not exists public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references public.settings(workspace_id) on delete cascade,
  event_type text not null check (event_type in ('framework_update','control_violation','evidence_uploaded','threshold_breach')),
  filters jsonb,
  channels text[] not null default '{}',
  frequency text not null check (frequency in ('immediate','daily_digest','weekly_digest')),
  threshold_days int,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Integrations Table
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references public.settings(workspace_id) on delete cascade,
  type text not null check (type in ('slack','email','webhook','jira')),
  config jsonb not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions Table
create table if not exists public.subscriptions (
  workspace_id text primary key references public.settings(workspace_id) on delete cascade,
  subscription_plan text not null default 'free' check (subscription_plan in ('free','pro','enterprise')),
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz
);

-- Invoices Table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references public.settings(workspace_id) on delete cascade,
  invoice_url text not null,
  date timestamptz not null default now(),
  amount numeric not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
