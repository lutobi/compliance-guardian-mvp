-- Add new columns to monitoring table
ALTER TABLE monitoring 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for monitoring
ALTER TABLE monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view monitoring" ON monitoring
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create monitoring" ON monitoring
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update monitoring" ON monitoring
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

CREATE TRIGGER update_monitoring_updated_at
    BEFORE UPDATE ON monitoring
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
