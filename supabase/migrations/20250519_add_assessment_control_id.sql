-- Add assessment_control_id column to evidence table
ALTER TABLE public.evidence
ADD COLUMN IF NOT EXISTS assessment_control_id UUID REFERENCES public.assessment_controls(id) ON DELETE CASCADE;

-- Update RLS policies to include assessment_control_id
DROP POLICY IF EXISTS "Users can read own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can insert own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can update own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can delete own evidence" ON public.evidence;

-- Allow users to read evidence for assessments they have access to
CREATE POLICY "Users can read own evidence"
  ON public.evidence
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assessment_controls ac
      JOIN public.assessments a ON ac.assessment_id = a.id
      WHERE ac.id = evidence.assessment_control_id
      AND a.created_by = auth.uid()
    )
  );

-- Allow users to insert evidence for assessments they have access to
CREATE POLICY "Users can insert own evidence"
  ON public.evidence
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assessment_controls ac
      JOIN public.assessments a ON ac.assessment_id = a.id
      WHERE ac.id = evidence.assessment_control_id
      AND a.created_by = auth.uid()
    )
  );

-- Allow users to update evidence for assessments they have access to
CREATE POLICY "Users can update own evidence"
  ON public.evidence
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assessment_controls ac
      JOIN public.assessments a ON ac.assessment_id = a.id
      WHERE ac.id = evidence.assessment_control_id
      AND a.created_by = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assessment_controls ac
      JOIN public.assessments a ON ac.assessment_id = a.id
      WHERE ac.id = evidence.assessment_control_id
      AND a.created_by = auth.uid()
    )
  );

-- Allow users to delete evidence for assessments they have access to
CREATE POLICY "Users can delete own evidence"
  ON public.evidence
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assessment_controls ac
      JOIN public.assessments a ON ac.assessment_id = a.id
      WHERE ac.id = evidence.assessment_control_id
      AND a.created_by = auth.uid()
    )
  );
