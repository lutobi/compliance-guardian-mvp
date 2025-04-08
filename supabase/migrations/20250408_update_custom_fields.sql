-- Add new columns to custom_fields table
ALTER TABLE custom_fields 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('text', 'number', 'date', 'select', 'multiselect', 'checkbox')),
ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS options TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for custom_fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view custom fields" ON custom_fields
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create custom fields" ON custom_fields
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update custom fields" ON custom_fields
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

CREATE TRIGGER update_custom_fields_updated_at
    BEFORE UPDATE ON custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
