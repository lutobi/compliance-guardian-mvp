-- 0) Remove duplicated frameworks by (name, version)
WITH dupes AS (
  SELECT name, version, MIN(id::text)::uuid AS keep_id
  FROM public.frameworks
  GROUP BY name, version
  HAVING COUNT(*) > 1
)
DELETE FROM public.frameworks f
USING dupes d
WHERE f.name = d.name
  AND f.version = d.version
  AND f.id <> d.keep_id;

-- 1) Add unique constraint on (name, version)
ALTER TABLE public.frameworks
  ADD CONSTRAINT uq_frameworks_name_version UNIQUE (name, version);

-- 2) Upsert frameworks (omit id)
INSERT INTO public.frameworks (name, version, description, categories)
VALUES
  ('CSA STAR','4.0','Cloud Security Alliance STAR program',ARRAY['Cloud','Security']),
  ('ISO 27017','2015','InfoSec controls for cloud',ARRAY['Cloud']),
  ('ISO 27018','2019','PII controls in public clouds',ARRAY['Privacy']),
  ('ISO/IEC 27001','2022','ISMS requirements',ARRAY['Security','Management']),
  ('GDPR','2016/679','EU Data Protection Reg',ARRAY['Privacy']),
  ('HIPAA','2013','US Health Privacy',ARRAY['Healthcare']),
  ('SOC 2','2017','Service Org Controls',ARRAY['Security']),
  ('NIST AI RMF','1.0','AI Risk Management',ARRAY['AI']),
  ('NIST 800-53','Rev. 5','Security & Privacy Controls',ARRAY['Security']),
  ('PCI DSS','4.0','Payment Card Data Sec',ARRAY['Payment'])
ON CONFLICT (name, version) DO UPDATE
  SET description = EXCLUDED.description,
      categories  = EXCLUDED.categories;

-- 3) Upsert controls via subquery join
INSERT INTO public.controls (framework_id, name, description)
SELECT f.id, ctrl.name, ctrl.description
FROM public.frameworks f
JOIN (VALUES
  ('CSA STAR','App & Interface Security','Controls for apps/interfaces'),
  ('CSA STAR','Audit & Compliance','Audit planning & checks'),
  ('ISO/IEC 27001','A.5 Info Security Policies','Policy management'),
  ('ISO/IEC 27001','A.6 Org Security','Org & telework controls'),
  ('ISO/IEC 27001','A.7 HR Security','Employee security')
) AS ctrl(framework_name,name,description)
  ON f.name = ctrl.framework_name
ON CONFLICT (framework_id, name) DO UPDATE
  SET description = EXCLUDED.description;

-- 4) Upsert subcontrols via subquery join
INSERT INTO public.subcontrols (control_id, name, description)
SELECT c.id, sub.name, sub.description
FROM public.controls c
JOIN (VALUES
  ('A.5 Info Security Policies','Policy Review','Review policies monthly'),
  ('A.5 Info Security Policies','Policy Comm','Communicate to staff'),
  ('A.6 Org Security','Role Defs','Define security roles')
) AS sub(control_name,name,description)
  ON c.name = sub.control_name
ON CONFLICT (control_id, name) DO UPDATE
  SET description = EXCLUDED.description;
