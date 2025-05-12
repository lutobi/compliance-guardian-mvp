-- Paste this into your Supabase SQL editor and run to seed frameworks, controls, and subcontrols.

-- 1) Upsert frameworks
INSERT INTO public.frameworks (id, name, version, description, categories)
VALUES
  ('csa-star', 'CSA STAR', '1.0', 'Cloud Security Alliance STAR program', ARRAY['Cloud']),
  ('iso-27017', 'ISO 27017', '1.0', 'Cloud security controls', ARRAY['Cloud']),
  ('iso-27018', 'ISO 27018', '1.0', 'Cloud PII security', ARRAY['Privacy']),
  ('iso-27001', 'ISO 27001 Enhanced', '2022', 'Information security management', ARRAY['Security']),
  ('iso27001-2022', 'ISO 27001 Enhanced', '2022', 'Information security management', ARRAY['Security']),
  ('gdpr', 'GDPR', '1.0', 'European data protection', ARRAY['Privacy']),
  ('hipaa', 'HIPAA', '1.0', 'US health privacy', ARRAY['Healthcare']),
  ('iso-42001', 'ISO 42001', '1.0', 'Security management systems', ARRAY['Security']),
  ('soc2', 'SOC 2', '1.0', 'Service organization controls', ARRAY['Security']),
  ('nist-ai-rmf', 'NIST AI RMF', '1.0', 'Risk management framework for AI', ARRAY['AI','Security']),
  ('nist-800-53', 'NIST SP 800-53', '1.0', 'Security and privacy controls', ARRAY['Security','Privacy']),
  ('pci-dss', 'PCI DSS', '3.2.1', 'Payment card industry controls', ARRAY['Payment'])
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      version = EXCLUDED.version,
      description = EXCLUDED.description,
      categories = EXCLUDED.categories;

-- 2) Upsert controls
INSERT INTO public.controls (id, framework_id, name, description)
VALUES
  -- Example: replace with your actual control IDs/names
  ('ctrl-1', 'csa-star', 'Control A', 'Description for Control A'),
  ('ctrl-2', 'csa-star', 'Control B', 'Description for Control B')
ON CONFLICT (id) DO UPDATE
  SET framework_id = EXCLUDED.framework_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description;

-- 3) Upsert subcontrols
INSERT INTO public.subcontrols (id, control_id, name, description)
VALUES
  -- Example: replace with your actual subcontrol IDs/names
  ('sub-1', 'ctrl-1', 'Subcontrol A1', 'Description for Subcontrol A1'),
  ('sub-2', 'ctrl-1', 'Subcontrol A2', 'Description for Subcontrol A2')
ON CONFLICT (id) DO UPDATE
  SET control_id = EXCLUDED.control_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description;
