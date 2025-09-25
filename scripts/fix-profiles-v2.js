#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SQL to fix user_profiles
const sql = `
-- Add onboarding_completed column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles
UPDATE public.user_profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'fix-profiles-v2.sql'), sql);
console.log('SQL written to fix-profiles-v2.sql');
console.log('\nTo apply the fix:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/fix-profiles-v2.sql');
console.log('3. Click "Run" to apply changes');

// Copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'fix-profiles-v2.sql')}" | pbcopy`);
console.log('\nSQL has been copied to your clipboard');
