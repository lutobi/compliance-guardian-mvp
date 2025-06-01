-- Migration: create team_members table
create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id text references public.settings(workspace_id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  status text not null default 'pending' check (status in ('pending','active')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);
