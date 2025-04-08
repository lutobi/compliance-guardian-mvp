-- Add new columns to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS compliance_frequency TEXT CHECK (compliance_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS notification_threshold INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view settings" ON settings
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update settings" ON settings
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

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
