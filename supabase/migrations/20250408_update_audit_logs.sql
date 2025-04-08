-- Add new columns to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('create', 'update', 'delete', 'login', 'logout')),
ADD COLUMN IF NOT EXISTS target_type TEXT,
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS old_value JSONB,
ADD COLUMN IF NOT EXISTS new_value JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their audit logs" ON audit_logs
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.id = audit_logs.user_id
    ));

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ));

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audit_logs_created_at
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
