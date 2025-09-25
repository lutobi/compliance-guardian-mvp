-- Create evidence table
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subcontrol_id TEXT NOT NULL,
    framework_id TEXT NOT NULL,
    files JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    FOREIGN KEY (framework_id) REFERENCES frameworks(id) ON DELETE CASCADE
);
