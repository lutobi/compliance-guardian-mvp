-- Create evidence table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcontrol_id TEXT NOT NULL,
  framework_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view evidence" ON public.evidence
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create evidence" ON public.evidence
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own evidence" ON public.evidence
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own evidence" ON public.evidence
  FOR DELETE
  USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_evidence_updated_at
BEFORE UPDATE ON public.evidence
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
