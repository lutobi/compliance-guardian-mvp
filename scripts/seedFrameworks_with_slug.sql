-- Seed frameworks with slug column to satisfy NOT NULL constraint

-- 1) Upsert frameworks with slug
INSERT INTO public.frameworks (name, slug, version, description, categories)
VALUES
  ('CSA STAR',      'csa-star',      '4.0', 'Cloud Security Alliance STAR program', ARRAY['Cloud','Security']),
  ('ISO 27017',     'iso-27017',     '2015', 'InfoSec controls for cloud', ARRAY['Cloud']),
  ('ISO 27018',     'iso-27018',     '2019', 'PII controls in public clouds', ARRAY['Privacy']),
  ('ISO/IEC 27001', 'iso-iec-27001', '2022', 'ISMS requirements', ARRAY['Security','Management']),
  ('GDPR',          'gdpr',          '2016/679','EU Data Protection Reg',ARRAY['Privacy']),
  ('HIPAA',         'hipaa',         '2013', 'US Health Privacy',ARRAY['Healthcare']),
  ('SOC 2',         'soc-2',         '2017', 'Service Org Controls',ARRAY['Security']),
  ('NIST AI RMF',   'nist-ai-rmf',   '1.0', 'AI Risk Management',ARRAY['AI']),
  ('NIST 800-53',   'nist-800-53',   'Rev. 5','Security & Privacy Controls',ARRAY['Security']),
  ('PCI DSS',       'pci-dss',       '4.0', 'Payment Card Data Sec',ARRAY['Payment'])
ON CONFLICT (slug) DO UPDATE
  SET name        = EXCLUDED.name,
      version     = EXCLUDED.version,
      description = EXCLUDED.description,
      categories  = EXCLUDED.categories;

-- 2) Upsert controls
INSERT INTO public.controls (framework_id, name, description)
SELECT f.id, ctrl.name, ctrl.description
FROM public.frameworks f
JOIN (VALUES
  ('csa-star','App & Interface Security','Controls for apps/interfaces'),
  ('csa-star','Audit & Compliance','Audit planning & checks'),
  ('iso-iec-27001','A.5 Info Security Policies','Policy management'),
  ('iso-iec-27001','A.6 Org Security','Org & telework controls'),
  ('iso-iec-27001','A.7 HR Security','Employee security')
) AS ctrl(slug, name, description)
  ON f.slug = ctrl.slug
ON CONFLICT (framework_id, name) DO UPDATE
  SET description = EXCLUDED.description;

-- 3) Upsert subcontrols
INSERT INTO public.subcontrols (control_id, name, description)
SELECT c.id, sub.name, sub.description
FROM public.controls c
JOIN (VALUES
  ('A.5 Info Security Policies','Policy Review','Review policies monthly'),
  ('A.5 Info Security Policies','Policy Communication','Communicate to staff'),
  ('A.6 Org Security','Role Definitions','Define roles & responsibilities')
) AS sub(control_name, name, description)
  ON c.name = sub.control_name
ON CONFLICT (control_id, name) DO UPDATE
  SET description = EXCLUDED.description;
