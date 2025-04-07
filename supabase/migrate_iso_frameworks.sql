-- Add new columns
ALTER TABLE frameworks 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Generate slugs for ISO frameworks
UPDATE frameworks 
SET 
  slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g')),
  categories = ARRAY['international', 'security', 'management'],
  description = 
    CASE 
      WHEN name ILIKE '%27001%' THEN 'Information Security Management System (ISMS)'
      WHEN name ILIKE '%27017%' THEN 'Security Controls for Cloud Services'
      WHEN name ILIKE '%27018%' THEN 'Protection of Personal Information in Public Clouds'
      ELSE 'ISO Security Standard'
    END;

-- Add NIST and CMMC frameworks if they don't exist
INSERT INTO frameworks (name, version, description, slug, categories)
SELECT * FROM (
  VALUES 
    (
      'NIST SP 800-171',
      'Rev. 2',
      'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
      'nist-800-171',
      ARRAY['government', 'security', 'compliance']
    ),
    (
      'CMMC',
      '2.0',
      'Department of Defense Cybersecurity Requirements',
      'cmmc',
      ARRAY['government', 'defense', 'security']
    )
) AS new_frameworks(name, version, description, slug, categories)
WHERE NOT EXISTS (
  SELECT 1 FROM frameworks 
  WHERE name IN ('NIST SP 800-171', 'CMMC')
);

-- Make slug unique and not null
ALTER TABLE frameworks
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT frameworks_slug_key UNIQUE (slug);
