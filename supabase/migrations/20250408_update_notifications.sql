-- Add new columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('review_required', 'compliance_due', 'approval_required', 'system_alert')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('unread', 'read', 'dismissed')) DEFAULT 'unread',
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.id = notifications.user_id
    ));

CREATE POLICY "Admins can view all notifications" ON notifications
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

CREATE TRIGGER update_notifications_created_at
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
