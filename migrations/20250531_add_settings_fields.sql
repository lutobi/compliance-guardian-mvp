-- Migration: add enhanced fields to settings table
alter table public.settings
  add column if not exists workspace_name text,
  add column if not exists default_compliance_framework text,
  add column if not exists locale text,
  add column if not exists timezone text,
  add column if not exists date_format text default 'MM/dd/yyyy',
  add column if not exists time_format text default '24h',
  add column if not exists notifications_enabled boolean default true;

-- Add constraints for date/time formats
alter table public.settings
  add constraint chk_date_format check (date_format in ('MM/dd/yyyy','dd/MM/yyyy','yyyy-MM-dd'));

alter table public.settings
  add constraint chk_time_format check (time_format in ('12h','24h'));
