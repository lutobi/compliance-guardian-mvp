-- Add new columns to automations table
ALTER TABLE automations 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('workflow', 'notification', 'report', 'custom')),
ADD COLUMN IF NOT EXISTS trigger_type TEXT CHECK (trigger_type IN ('time', 'event', 'condition')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for automations
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automations" ON automations
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create automations" ON automations
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update automations" ON automations
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

CREATE TRIGGER update_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
