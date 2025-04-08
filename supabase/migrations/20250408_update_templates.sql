-- Add new columns to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('compliance_check', 'report', 'notification', 'email')),
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their templates" ON templates
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.id = templates.created_by
    ));

CREATE POLICY "Admins can view all templates" ON templates
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create templates" ON templates
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update templates" ON templates
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

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
