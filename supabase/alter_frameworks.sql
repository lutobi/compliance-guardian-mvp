-- Add new columns
ALTER TABLE frameworks 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Add unique constraint to slug after ensuring no duplicates
UPDATE frameworks SET slug = 
  CASE 
    WHEN name ILIKE '%NIST%' THEN 'nist-800-171'
    WHEN name ILIKE '%ISO%' THEN 'iso-27001'
    WHEN name ILIKE '%CMMC%' THEN 'cmmc'
    ELSE LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
  END
WHERE slug IS NULL;

ALTER TABLE frameworks
  ADD CONSTRAINT frameworks_slug_key UNIQUE (slug);

-- Update existing frameworks with descriptions and categories
UPDATE frameworks 
SET 
  description = 'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
  categories = ARRAY['government', 'security', 'compliance']
WHERE slug = 'nist-800-171';

UPDATE frameworks 
SET 
  description = 'Information Security Management System (ISMS)',
  categories = ARRAY['international', 'security', 'management']
WHERE slug = 'iso-27001';

UPDATE frameworks 
SET 
  description = 'Department of Defense Cybersecurity Requirements',
  categories = ARRAY['government', 'defense', 'security']
WHERE slug = 'cmmc';

-- Make slug not null after data is migrated
ALTER TABLE frameworks
  ALTER COLUMN slug SET NOT NULL;
