-- Add new columns to timeline_events table
ALTER TABLE timeline_events 
ADD COLUMN IF NOT EXISTS compliance_check_id UUID REFERENCES compliance_checks(id),
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('created', 'updated', 'reviewed', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for timeline_events
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline events" ON timeline_events
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create timeline events" ON timeline_events
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_timeline_events_created_at
    BEFORE INSERT ON timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
