-- Add new columns to controls table
ALTER TABLE controls 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for controls
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view controls" ON controls
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create controls" ON controls
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update controls" ON controls
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_controls_updated_at
    BEFORE UPDATE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
