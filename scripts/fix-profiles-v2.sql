
-- Add onboarding_completed column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles
UPDATE public.user_profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;