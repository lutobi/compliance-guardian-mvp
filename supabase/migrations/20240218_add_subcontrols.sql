-- Create subcontrols table
CREATE TABLE IF NOT EXISTS public.subcontrols (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE,
    subcontrol_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(control_id, subcontrol_id)
);

-- Add RLS policies
ALTER TABLE public.subcontrols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read subcontrols"
    ON public.subcontrols
    FOR SELECT
    TO authenticated
    USING (true);

-- Add indexes
CREATE INDEX subcontrols_control_id_idx ON public.subcontrols(control_id);
CREATE INDEX subcontrols_subcontrol_id_idx ON public.subcontrols(subcontrol_id);
