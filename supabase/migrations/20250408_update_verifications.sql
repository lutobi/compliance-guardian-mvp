-- Add new columns to verifications table
ALTER TABLE verifications 
ADD COLUMN IF NOT EXISTS total_checks INTEGER,
ADD COLUMN IF NOT EXISTS passed_checks INTEGER,
ADD COLUMN IF NOT EXISTS pending_checks INTEGER,
ADD COLUMN IF NOT EXISTS failed_checks INTEGER,
ADD COLUMN IF NOT EXISTS completion_rate NUMERIC,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for verifications
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verifications" ON verifications
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create verifications" ON verifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update verifications" ON verifications
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

CREATE TRIGGER update_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
