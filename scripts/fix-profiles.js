#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SQL to fix user_profiles
const sql = `
-- Drop and recreate user_profiles table
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  default_workspace_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'fix-profiles.sql'), sql);
console.log('SQL written to fix-profiles.sql');
console.log('\nTo apply the fix:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/fix-profiles.sql');
console.log('3. Click "Run" to apply changes');

// Copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'fix-profiles.sql')}" | pbcopy`);
console.log('\nSQL has been copied to your clipboard');
