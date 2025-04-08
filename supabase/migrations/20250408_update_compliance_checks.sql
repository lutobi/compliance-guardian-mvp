-- Add new columns to compliance_checks table
ALTER TABLE compliance_checks 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'rejected')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for compliance_checks
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance checks" ON compliance_checks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create compliance checks" ON compliance_checks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update compliance checks" ON compliance_checks
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

CREATE TRIGGER update_compliance_checks_updated_at
    BEFORE UPDATE ON compliance_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
