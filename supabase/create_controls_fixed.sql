-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create controls table
CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'not-started',
  reference_links TEXT[],
  dependency_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(framework_id, slug)
);

-- Add RLS policies
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
  ON controls
  FOR SELECT
  TO anon
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_controls_updated_at
  BEFORE UPDATE ON controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX controls_framework_id_idx ON controls(framework_id);
CREATE INDEX controls_parent_id_idx ON controls(parent_id);
CREATE INDEX controls_slug_idx ON controls(slug);

-- Create view for control hierarchy
CREATE OR REPLACE VIEW control_hierarchy AS
WITH RECURSIVE control_tree AS (
  -- Base case: controls without parents
  SELECT 
    c.id,
    c.framework_id,
    c.parent_id,
    c.slug,
    c.name,
    c.description,
    c.category,
    c.status,
    c.reference_links,
    c.dependency_ids,
    0 as level,
    ARRAY[c.id] as path,
    c.created_at,
    c.updated_at
  FROM controls c
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: controls with parents
  SELECT 
    c.id,
    c.framework_id,
    c.parent_id,
    c.slug,
    c.name,
    c.description,
    c.category,
    c.status,
    c.reference_links,
    c.dependency_ids,
    ct.level + 1,
    ct.path || c.id,
    c.created_at,
    c.updated_at
  FROM controls c
  INNER JOIN control_tree ct ON c.parent_id = ct.id
  WHERE NOT c.id = ANY(ct.path) -- Prevent cycles
)
SELECT * FROM control_tree;

-- Insert sample controls for ISO 27001
WITH iso27001 AS (
  SELECT id FROM frameworks WHERE slug = 'iso27001'
)
INSERT INTO controls (framework_id, slug, name, description, category) VALUES
  ((SELECT id FROM iso27001), 'a5', 'A.5 Information security policies', 'Management direction for information security', 'Policies'),
  ((SELECT id FROM iso27001), 'a5.1', 'A.5.1 Management direction for information security', 'To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.', 'Policies'),
  ((SELECT id FROM iso27001), 'a5.1.1', 'A.5.1.1 Policies for information security', 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.', 'Policies'),
  ((SELECT id FROM iso27001), 'a5.1.2', 'A.5.1.2 Review of the policies for information security', 'The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.', 'Policies')
ON CONFLICT DO NOTHING;

-- Update parent_id for hierarchical relationships
WITH iso27001 AS (
  SELECT id FROM frameworks WHERE slug = 'iso27001'
),
a5 AS (
  SELECT id FROM controls WHERE framework_id = (SELECT id FROM iso27001) AND slug = 'a5'
),
a5_1 AS (
  SELECT id FROM controls WHERE framework_id = (SELECT id FROM iso27001) AND slug = 'a5.1'
)
UPDATE controls c
SET parent_id = 
  CASE 
    WHEN c.slug = 'a5.1' THEN (SELECT id FROM a5)
    WHEN c.slug IN ('a5.1.1', 'a5.1.2') THEN (SELECT id FROM a5_1)
    ELSE c.parent_id
  END
WHERE c.framework_id = (SELECT id FROM iso27001);
