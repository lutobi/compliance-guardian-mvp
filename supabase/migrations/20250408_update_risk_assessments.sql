-- Add new columns to risk_assessments table
ALTER TABLE risk_assessments 
ADD COLUMN IF NOT EXISTS geographic_risk TEXT,
ADD COLUMN IF NOT EXISTS supply_chain_risk TEXT,
ADD COLUMN IF NOT EXISTS supplier_risk TEXT,
ADD COLUMN IF NOT EXISTS product_risk TEXT,
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for risk_assessments
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk assessments" ON risk_assessments
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create risk assessments" ON risk_assessments
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update risk assessments" ON risk_assessments
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

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
