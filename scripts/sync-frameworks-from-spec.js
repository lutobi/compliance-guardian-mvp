#!/usr/bin/env node
/*
  Sync frameworks from src/data/frameworks.ts directly into the database using
  the Supabase service role key. This bypasses API constraints for quick bootstrap.
*/

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load envs
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Import TS data via ts-node transpile bypass using ts-node/register? Not necessary.
// The aggregated JS build may not exist; we will require the compiled TS at runtime via ts-node/register/transpile-only
try {
  require('ts-node/register/transpile-only');
} catch {}

let frameworkModule;
try {
  frameworkModule = require(path.resolve(process.cwd(), 'src/data/frameworks.ts'));
} catch (e) {
  try {
    frameworkModule = require(path.resolve(process.cwd(), 'src/data/frameworks'));
  } catch (e2) {
    console.error('Failed to load src/data/frameworks.ts', e2.message || e2);
    process.exit(1);
  }
}

const frameworkData = frameworkModule.frameworkData || {};

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  console.log(`[sync] Starting import of ${Object.keys(frameworkData).length} frameworks`);

  for (const [slug, fw] of Object.entries(frameworkData)) {
    console.log(`[sync] Upserting framework: ${fw.name} (v${fw.version})`);

    // Upsert framework
    const { data: existing, error: getErr } = await supabase
      .from('frameworks')
      .select('id,version')
      .eq('name', fw.name)
      .maybeSingle();
    if (getErr) throw getErr;

    let frameworkId = existing?.id;
    if (!existing) {
      const { data: created, error: creErr } = await supabase
        .from('frameworks')
        .insert({ name: fw.name, description: fw.description, version: fw.version })
        .select('id')
        .single();
      if (creErr) throw creErr;
      frameworkId = created.id;
      console.log(`[sync] Created framework '${fw.name}' -> ${frameworkId}`);
    } else if (existing.version !== fw.version) {
      const { error: updErr } = await supabase
        .from('frameworks')
        .update({ version: fw.version, description: fw.description, last_synced_at: new Date().toISOString() })
        .eq('id', frameworkId);
      if (updErr) throw updErr;
      console.log(`[sync] Updated framework '${fw.name}' to v${fw.version}`);
    }

    // Upsert controls (jsonb subcontrols per migration)
    for (const ctrl of fw.controls || []) {
      const payload = {
        framework_id: frameworkId,
        control_id: ctrl.id || ctrl.control_id, // support both fields
        name: ctrl.name,
        description: ctrl.description,
        subcontrols: Array.isArray(ctrl.subcontrols) ? ctrl.subcontrols.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description
        })) : [],
      };
      const { error: upErr } = await supabase
        .from('controls')
        .upsert(payload)
        .eq('framework_id', frameworkId)
        .eq('control_id', payload.control_id);
      if (upErr) throw upErr;
    }
  }

  console.log('[sync] Completed.');
}

main().catch((err) => {
  console.error('[sync] Failed:', err?.message || err);
  process.exit(1);
});
