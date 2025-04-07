-- First, let's check existing data
SELECT * FROM frameworks;

-- Add new columns
ALTER TABLE frameworks 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Generate slugs based on existing names
UPDATE frameworks 
SET slug = 
  CASE 
    WHEN name ILIKE '%NIST%800%171%' THEN 'nist-800-171'
    WHEN name ILIKE '%ISO%27001%' THEN 'iso-27001'
    WHEN name ILIKE '%CMMC%' THEN 'cmmc'
    ELSE LOWER(REGEXP_REPLACE(REPLACE(name, ' ', '-'), '[^a-zA-Z0-9\-]', '', 'g'))
  END;

-- Update categories based on framework type
UPDATE frameworks 
SET categories = 
  CASE 
    WHEN name ILIKE '%NIST%800%171%' THEN ARRAY['government', 'security', 'compliance']
    WHEN name ILIKE '%ISO%27001%' THEN ARRAY['international', 'security', 'management']
    WHEN name ILIKE '%CMMC%' THEN ARRAY['government', 'defense', 'security']
    ELSE ARRAY['security', 'compliance']
  END;

-- Update descriptions if they're NULL
UPDATE frameworks 
SET description = 
  CASE 
    WHEN name ILIKE '%NIST%800%171%' THEN 'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations'
    WHEN name ILIKE '%ISO%27001%' THEN 'Information Security Management System (ISMS)'
    WHEN name ILIKE '%CMMC%' THEN 'Department of Defense Cybersecurity Requirements'
    ELSE description
  END
WHERE description IS NULL;

-- Make slug unique and not null
UPDATE frameworks 
SET slug = slug || '-' || id::text 
WHERE slug IN (
  SELECT slug 
  FROM frameworks 
  GROUP BY slug 
  HAVING COUNT(*) > 1
);

-- Add unique constraint and make slug not null
ALTER TABLE frameworks
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT frameworks_slug_key UNIQUE (slug);
