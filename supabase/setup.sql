-- Drop existing table if it exists
DROP TABLE IF EXISTS frameworks;

-- Create frameworks table
CREATE TABLE frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  categories TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data
INSERT INTO frameworks (slug, name, description, version, categories)
VALUES 
  (
    'nist-800-171',
    'NIST SP 800-171',
    'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
    'Rev. 2',
    ARRAY['government', 'security', 'compliance']
  ),
  (
    'iso-27001',
    'ISO/IEC 27001',
    'Information Security Management System (ISMS)',
    '2013',
    ARRAY['international', 'security', 'management']
  ),
  (
    'cmmc',
    'Cybersecurity Maturity Model Certification',
    'Department of Defense Cybersecurity Requirements',
    '2.0',
    ARRAY['government', 'defense', 'security']
  );
