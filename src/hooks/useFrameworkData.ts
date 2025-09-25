'use client';

import { useEffect, useState } from 'react';
import { FrameworkData } from '@/types/framework';
import { frameworkData, frameworks as staticFrameworks } from '@/data/frameworks';
import { supabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Known alias mapping for DB names -> static slugs
const NAME_ALIASES: Record<string, string> = {
  'iso/iec 27001': 'iso-27001',
  'iso 27001': 'iso-27001',
  'iso27001': 'iso-27001',
  'iso27001:2022': 'iso-27001',
  'iso 27017': 'iso-27017',
  'iso/iec 27017': 'iso-27017',
  'iso 27018': 'iso-27018',
  'iso/iec 27018': 'iso-27018',
  'nist 800-53': 'nist-800-53',
  'nist sp 800-53': 'nist-800-53',
  'pci dss': 'pci-dss',
  'csa star': 'csa-star',
  'iso 42001': 'iso-42001',
  'soc 2': 'soc2',
  'gdpr': 'gdpr',
  'nist ai rmf': 'nist-ai-rmf',
};

function normalizeNameToSlug(name: string): string {
  const lower = name.toLowerCase().trim();
  if (NAME_ALIASES[lower]) return NAME_ALIASES[lower];
  return lower
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

export function useFrameworkData(frameworkId: string) {
  const [data, setData] = useState<FrameworkData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fast path: incoming is already a static slug
        let slug = frameworkId;

        // If we received a UUID, resolve it to the DB name then map to static slug
        if (UUID_RE.test(frameworkId)) {
          const { data: rows, error: selErr } = await supabase
            .from('frameworks')
            .select('name')
            .eq('id', frameworkId)
            .limit(1);
          if (selErr) throw selErr;
          const dbName = Array.isArray(rows) && rows.length > 0 ? rows[0].name as string : '';
          if (!dbName) {
            throw new Error(`Framework ${frameworkId} not found in DB`);
          }

          // Try alias map first, then normalized slug, then exact name match
          const byAlias = NAME_ALIASES[dbName.toLowerCase()];
          const byNormalized = normalizeNameToSlug(dbName);

          const nameToId = Object.fromEntries(staticFrameworks.map(sf => [sf.name.toLowerCase(), sf.id]));
          const byExact = nameToId[dbName.toLowerCase()];

          slug = byAlias || byExact || byNormalized;
        }

        let framework = frameworkData[slug];
        // ISO 27001 special-case: support both slugs
        if (!framework && slug === 'iso-27001') {
          framework = frameworkData['iso27001-2022'];
        }

        if (!framework) {
          setError(new Error(`Framework ${slug} not found`));
          return;
        }
        setData(framework);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [frameworkId]);

  return { data, error, loading };
}
