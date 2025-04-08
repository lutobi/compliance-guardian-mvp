-- Add new columns to evidence table
ALTER TABLE evidence 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('document', 'image', 'video', 'audio', 'text')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for evidence
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence" ON evidence
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM monitoring_points 
        WHERE monitoring_points.id = evidence.monitoring_point_id
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.id = ANY(monitoring_points.reviewers)
        )
    ));

CREATE POLICY "Admins can view all evidence" ON evidence
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create evidence" ON evidence
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update evidence" ON evidence
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evidence_updated_at
    BEFORE UPDATE ON evidence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
