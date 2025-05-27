-- 2025-05-27: Add assessment_id to evidence for assessment-scoped queries
ALTER TABLE public.evidence
  ADD COLUMN IF NOT EXISTS assessment_id uuid REFERENCES public.assessments(id);
