-- Add new columns to workflows table
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('compliance', 'risk', 'audit', 'custom')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'inactive', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows" ON workflows
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.id = workflows.created_by
    ));

CREATE POLICY "Admins can view all workflows" ON workflows
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can create workflows" ON workflows
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update workflows" ON workflows
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

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
