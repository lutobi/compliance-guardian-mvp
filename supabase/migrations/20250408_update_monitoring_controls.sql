-- Add new columns to monitoring_controls table
ALTER TABLE monitoring_controls 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewers TEXT[],
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for monitoring_controls
ALTER TABLE monitoring_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view monitoring controls" ON monitoring_controls
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM monitoring 
        WHERE monitoring.id = monitoring_controls.monitoring_id
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.id = ANY(monitoring_controls.reviewers)
        )
    ));

CREATE POLICY "Admins can view all monitoring controls" ON monitoring_controls
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create monitoring controls" ON monitoring_controls
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update monitoring controls" ON monitoring_controls
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

CREATE TRIGGER update_monitoring_controls_updated_at
    BEFORE UPDATE ON monitoring_controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
