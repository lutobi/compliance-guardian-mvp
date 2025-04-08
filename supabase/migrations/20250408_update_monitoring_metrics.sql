-- Add new columns to monitoring_metrics table
ALTER TABLE monitoring_metrics 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('compliance', 'risk', 'performance', 'custom')),
ADD COLUMN IF NOT EXISTS value NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for monitoring_metrics
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view monitoring metrics" ON monitoring_metrics
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM monitoring 
        WHERE monitoring.id = monitoring_metrics.monitoring_id
    ));

CREATE POLICY "Admins can create monitoring metrics" ON monitoring_metrics
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update monitoring metrics" ON monitoring_metrics
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

CREATE TRIGGER update_monitoring_metrics_updated_at
    BEFORE UPDATE ON monitoring_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
