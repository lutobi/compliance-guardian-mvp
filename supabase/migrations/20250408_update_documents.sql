-- Add new columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS compliance_check_id UUID REFERENCES compliance_checks(id),
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('policy', 'procedure', 'record', 'evidence')),
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents" ON documents
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create documents" ON documents
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update documents" ON documents
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
