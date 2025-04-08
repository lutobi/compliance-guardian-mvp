-- Add new columns to frameworks table
ALTER TABLE frameworks 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for frameworks
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view frameworks" ON frameworks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create frameworks" ON frameworks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update frameworks" ON frameworks
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

CREATE TRIGGER update_frameworks_updated_at
    BEFORE UPDATE ON frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
