-- Migration: Allow users to insert their own profile into user_profiles
-- ===================================================================
-- Run with Supabase CLI: supabase db push

-- Grant insert rights via RLS policy
create policy "Users can create their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);
