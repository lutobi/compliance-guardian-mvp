-- Option 1: Name-based upserts using UUID auto-gen

-- Ensure unique or exclusion constraints exist for ON CONFLICT
ALTER TABLE public.frameworks
  ADD CONSTRAINT frameworks_name_unique UNIQUE (name);

ALTER TABLE public.controls
  ADD CONSTRAINT controls_framework_name_unique UNIQUE (framework_id, name);

ALTER TABLE public.subcontrols
  ADD CONSTRAINT subcontrols_control_name_unique UNIQUE (control_id, name);

-- 1) Upsert frameworks (omit id)
INSERT INTO public.frameworks (name, version, description, categories)
VALUES
  ('CSA STAR',      '4.0',   'Cloud Security Alliance STAR …', ARRAY['Cloud Security Controls','Risk Management','Security Operations','Data Security']),
  ('ISO 27017',     '2015',  'Code of practice for info security controls for cloud services', ARRAY['Cloud Service Provider Controls','Cloud Customer Controls','Shared Controls']),
  ('ISO 27018',     '2019',  'PII protection in public clouds', ARRAY['Consent and Choice','Purpose Legitimacy','Data Minimization','Use Limitation']),
  ('ISO/IEC 27001', '2022',  'Information Security Management System Requirements', ARRAY['Information Security Policies','Organization of Info Security','Human Resource Security','Asset Management','Access Control','Cryptography','Physical and Environmental Security','Operations Security','Communications Security','System Acquisition, Development and Maintenance','Supplier Relationships','Incident Management','Business Continuity Management','Compliance']),
  ('GDPR',          '2016/679','General Data Protection Regulation', ARRAY['Data Protection Principles','Data Subject Rights','Controller and Processor Obligations','Security Requirements','Data Transfer Requirements']),
  ('HIPAA',         '2013',  'US healthcare privacy & security', ARRAY['Privacy Rule','Security Rule','Breach Notification Rule','Enforcement Rule']),
  ('ISO 42001',     '2023',  'AI Management System Requirements', ARRAY['AI Governance','Risk Management','Ethical Considerations','Transparency Requirements']),
  ('SOC 2',         '2017',  'Service Organization Control 2 trust criteria', ARRAY['Security','Availability','Processing Integrity','Confidentiality','Privacy']),
  ('NIST AI RMF',   '1.0',   'NIST AI Risk Management Framework', ARRAY['Govern','Map','Measure','Manage']),
  ('NIST 800-53',   'Rev. 5','Security & Privacy Controls', ARRAY['Access Control','Audit & Accountability','Configuration Management','Contingency Planning','Identification & Authentication','Incident Response','System & Communications Protection','System & Information Integrity','etc.']),
  ('PCI DSS',       '4.0',   'Payment Card Industry Data Security Standard', ARRAY['Build and Maintain Secure Network','Protect Cardholder Data','Maintain Vulnerability Management','Strong Access Control','Monitor & Test Networks','Maintain Info Security Policy'])
ON CONFLICT (name) DO UPDATE
  SET version     = EXCLUDED.version,
      description = EXCLUDED.description,
      categories  = EXCLUDED.categories;

-- 2) Upsert controls (by framework name)
INSERT INTO public.controls (framework_id, name, description)
VALUES
  ((SELECT id FROM public.frameworks WHERE name='CSA STAR'), 'Application & Interface Security', 'Controls for app security & interfaces'),
  ((SELECT id FROM public.frameworks WHERE name='CSA STAR'), 'Audit Assurance & Compliance', 'Controls for audit & compliance'),
  ((SELECT id FROM public.frameworks WHERE name='CSA STAR'), 'Business Continuity Management', 'Controls for business continuity'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27017'), 'Cloud Service Provider Controls', 'Provider-specific controls'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27017'), 'Cloud Customer Controls', 'Customer-specific controls'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27017'), 'Shared Controls', 'Controls shared provider/customer'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27018'), 'Consent and Choice', 'Controls for consent management'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27018'), 'Purpose Legitimacy', 'Controls for legitimate purposes'),
  ((SELECT id FROM public.frameworks WHERE name='ISO 27018'), 'Data Minimization', 'Controls for data minimization'),
  ((SELECT id FROM public.frameworks WHERE name='ISO/IEC 27001'), 'A.5 Information Security Policies', 'Management direction for info security'),
  ((SELECT id FROM public.frameworks WHERE name='ISO/IEC 27001'), 'A.6 Organization of Info Security', 'Org structure & teleworking'),
  ((SELECT id FROM public.frameworks WHERE name='ISO/IEC 27001'), 'A.7 Human Resource Security', 'Security for employees & contractors'),
  ((SELECT id FROM public.frameworks WHERE name='ISO/IEC 27001'), 'A.8 Asset Management', 'Identify & protect assets')
ON CONFLICT (framework_id, name) DO UPDATE
  SET description = EXCLUDED.description;

-- 3) Upsert subcontrols (by control name)
INSERT INTO public.subcontrols (control_id, name, description)
VALUES
  ((SELECT id FROM public.controls WHERE name='A.5 Information Security Policies'), 'Policy Review', 'Regular review of security policies'),
  ((SELECT id FROM public.controls WHERE name='A.5 Information Security Policies'), 'Policy Communication', 'Communicate policies to staff'),
  ((SELECT id FROM public.controls WHERE name='A.6 Organization of Info Security'), 'Role Definitions', 'Define security roles & responsibilities')
ON CONFLICT (control_id, name) DO UPDATE
  SET description = EXCLUDED.description;

-- Repeat control/subcontrol blocks similarly for all remaining items
