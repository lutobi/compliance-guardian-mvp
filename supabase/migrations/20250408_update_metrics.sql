-- Add new columns to metrics table
ALTER TABLE metrics 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('compliance', 'risk', 'performance', 'custom')),
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS threshold NUMERIC,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for metrics
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics" ON metrics
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can create metrics" ON metrics
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update metrics" ON metrics
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

CREATE TRIGGER update_metrics_updated_at
    BEFORE UPDATE ON metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
