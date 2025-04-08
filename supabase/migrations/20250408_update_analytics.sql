-- Add new columns to analytics table
ALTER TABLE analytics 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('compliance', 'risk', 'performance', 'user')),
ADD COLUMN IF NOT EXISTS period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS data JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics" ON analytics
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create analytics" ON analytics
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update analytics" ON analytics
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

CREATE TRIGGER update_analytics_updated_at
    BEFORE UPDATE ON analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
