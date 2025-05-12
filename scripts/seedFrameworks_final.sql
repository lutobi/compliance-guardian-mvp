-- Final SQL seeder: use explicit constraint names for ON CONFLICT

-- 0) Create unique constraints (run once)
ALTER TABLE public.frameworks
  ADD CONSTRAINT fk_frameworks_name_version UNIQUE (name, version);
ALTER TABLE public.controls
  ADD CONSTRAINT fk_controls_fw_name UNIQUE (framework_id, name);
ALTER TABLE public.subcontrols
  ADD CONSTRAINT fk_subcontrols_ctrl_name UNIQUE (control_id, name);

-- 1) Upsert frameworks
INSERT INTO public.frameworks (name, version, description, categories)
VALUES
  ('CSA STAR', '4.0', 'Cloud Security Alliance STAR program', ARRAY['Cloud Security Controls','Risk Management','Security Operations','Data Security']),
  ('ISO 27017', '2015', 'Code of practice for cloud security', ARRAY['Cloud Provider Controls','Cloud Customer Controls','Shared Controls']),
  ('ISO 27018', '2019', 'PII protection in clouds', ARRAY['Consent','Legitimate Purpose','Data Minimization','Use Limitation']),
  ('ISO/IEC 27001', '2022', 'Information Security Management System', ARRAY['Policies','Org Security','Asset Management','Access Control','Ops Security']),
  ('GDPR', '2016/679', 'EU Data Protection Regulation', ARRAY['Principles','Rights','Obligations','Security','Transfer']),
  ('HIPAA', '2013', 'US Health Privacy Act', ARRAY['Privacy Rule','Security Rule','Breach Notification','Enforcement']),
  ('SOC 2', '2017', 'Service Org Control 2', ARRAY['Security','Availability','Integrity','Confidentiality','Privacy']),
  ('NIST AI RMF', '1.0', 'AI Risk Management Framework', ARRAY['Govern','Map','Measure','Manage']),
  ('NIST 800-53', 'Rev. 5', 'Security & Privacy Controls', ARRAY['Access Control','Audit & Accountability','Risk Assessment','System Integrity']),
  ('PCI DSS', '4.0', 'Payment Card Data Security Standard', ARRAY['Network','Data Protection','Vuln Mgmt','Access Control','Monitoring'])
ON CONFLICT ON CONSTRAINT fk_frameworks_name_version
DO UPDATE SET description = EXCLUDED.description, categories = EXCLUDED.categories;

-- 2) Upsert controls
INSERT INTO public.controls (framework_id, name, description)
SELECT f.id, c.name, c.description
FROM public.frameworks f
JOIN (VALUES
  ('CSA STAR','Application & Interface Security','App & interface controls'),
  ('CSA STAR','Audit Assurance & Compliance','Audit & compliance planning'),
  ('ISO/IEC 27001','A.5 Info Security Policies','Directive policies'),
  ('ISO/IEC 27001','A.6 Org Of Info Security','Org & teleworking'),
  ('ISO/IEC 27001','A.7 HR Security','Employee & contractor security')
) AS c(framework_name, name, description)
ON (f.name = c.framework_name)
ON CONFLICT ON CONSTRAINT fk_controls_fw_name
DO UPDATE SET description = EXCLUDED.description;

-- 3) Upsert subcontrols
INSERT INTO public.subcontrols (control_id, name, description)
SELECT ctrl.id, s.name, s.description
FROM public.controls ctrl
JOIN (VALUES
  ('A.5 Info Security Policies','Policy Review','Regular review of policies'),
  ('A.5 Info Security Policies','Policy Communication','Staff communication'),
  ('A.6 Org Of Info Security','Role Definitions','Define roles & responsibilities')
) AS s(control_name, name, description)
ON (ctrl.name = s.control_name)
ON CONFLICT ON CONSTRAINT fk_subcontrols_ctrl_name
DO UPDATE SET description = EXCLUDED.description;
