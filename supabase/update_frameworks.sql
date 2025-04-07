-- Drop existing unique constraint
ALTER TABLE frameworks DROP CONSTRAINT IF EXISTS frameworks_slug_key;

-- Add categories column if it doesn't exist
ALTER TABLE frameworks 
  ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Update existing ISO frameworks
UPDATE frameworks 
SET 
  slug = CASE
    WHEN name ILIKE '%27001:2022%' THEN 'iso27001-2022'
    WHEN name ILIKE '%27001%' THEN 'iso27001'
    WHEN name ILIKE '%27017%' THEN 'iso27017'
    WHEN name ILIKE '%27018%' THEN 'iso27018'
    ELSE LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
  END,
  categories = ARRAY['international', 'security', 'management'],
  description = CASE 
    WHEN name ILIKE '%27001%' THEN 'Information Security Management System (ISMS)'
    WHEN name ILIKE '%27017%' THEN 'Security Controls for Cloud Services'
    WHEN name ILIKE '%27018%' THEN 'Protection of Personal Information in Public Clouds'
    ELSE 'ISO Security Standard'
  END
WHERE name ILIKE '%ISO%';

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

-- Make slug not null and add unique constraint
ALTER TABLE frameworks
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT frameworks_slug_key UNIQUE (slug);

-- Show updated frameworks
SELECT id, name, version, slug, description, categories
FROM frameworks
ORDER BY name;
