-- Add control_ref column to assessment_controls table
ALTER TABLE public.assessment_controls
ADD COLUMN IF NOT EXISTS control_ref TEXT;

-- Update existing assessment_controls to set control_ref from control_id
UPDATE public.assessment_controls
SET control_ref = COALESCE(control_id::text, id::text)
WHERE control_ref IS NULL;

-- Create index on control_ref for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_controls_control_ref
ON public.assessment_controls(control_ref);
