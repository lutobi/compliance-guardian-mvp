#!/usr/bin/env tsx
/**
 * Sync frameworks from src/data/frameworks.ts into the database using the
 * Supabase service role key. This bypasses API constraints and is idempotent.
 */
import path from 'path';
import dotenv from 'dotenv';
// Load .env.local first (if present), then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import { frameworkData } from '@/data/frameworks';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  // Simple retry wrapper for Supabase calls
  async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 3, baseDelayMs = 400): Promise<T> {
    let lastErr: any = null;
    for (let i = 1; i <= attempts; i++) {
      try {
        const res: any = await fn();
        // Supabase responses have { data, error }
        if (res && typeof res === 'object' && 'error' in res && res.error) throw res.error;
        return res;
      } catch (err: any) {
        lastErr = err;
        const isFetch = /fetch failed/i.test(String(err?.message || err));
        const is429 = /429/.test(String(err?.message || ''));
        if (i < attempts && (isFetch || is429)) {
          const wait = baseDelayMs * i;
          console.warn(`[retry] ${label} attempt ${i} failed: ${err?.message || err}. Retrying in ${wait}ms`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        break;
      }
    }
    throw lastErr;
  }
  // Helper to robustly upsert a control across differing schemas
  async function upsertControl(frameworkId: string, ctrl: any) {
    const base = {
      framework_id: frameworkId,
      control_id: ctrl.id || ctrl.control_id,
      description: ctrl.description,
    } as any;

    const variants: any[] = [
      { ...base, name: ctrl.name, subcontrols: (ctrl.subcontrols || []).map((s: any) => ({ id: s.id, name: s.name, description: s.description })) },
      { ...base, title: ctrl.name, subcontrols: (ctrl.subcontrols || []).map((s: any) => ({ id: s.id, name: s.name, description: s.description })) },
      { ...base, name: ctrl.name },
      { ...base, title: ctrl.name },
    ];

    let lastErr: any = null;
    for (const payload of variants) {
      const { error } = await supabase
        .from('controls')
        .upsert(payload)
        .eq('framework_id', frameworkId)
        .eq('control_id', base.control_id);
      if (!error) return;
      lastErr = error;
    }
    throw lastErr;
  }
  const entries = Object.entries(frameworkData);
  console.log(`[sync] Starting import of ${entries.length} frameworks`);

  for (const [, fw] of entries) {
    console.log(`[sync] Upserting framework: ${fw.name} (v${fw.version})`);

    // Upsert framework
    const existingRes: any = await withRetry(
      () => supabase.from('frameworks').select('id,version').eq('name', fw.name).limit(1),
      `select framework ${fw.name}`
    );
    const existingRows = existingRes.data as any[];
    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    let frameworkId = existing?.id as string | undefined;
    if (!existing) {
      const createdRes: any = await withRetry(
        () => supabase.from('frameworks')
          .insert({ name: fw.name, description: fw.description, version: fw.version })
          .select('id')
          .single(),
        `insert framework ${fw.name}`
      );
      frameworkId = createdRes.data!.id as string;
      console.log(`[sync] Created framework '${fw.name}' -> ${frameworkId}`);
    } else if (existing.version !== fw.version) {
      await withRetry(
        () => supabase.from('frameworks')
          .update({ version: fw.version, description: fw.description })
          .eq('id', frameworkId!),
        `update framework ${fw.name}`
      );
      console.log(`[sync] Updated framework '${fw.name}' to v${fw.version}`);
    }

    // Upsert controls using robust schema handling
    for (const ctrl of fw.controls || []) {
      try {
        await upsertControl(frameworkId!, ctrl);
      } catch (err: any) {
        console.error(`[sync] Control upsert failed for ${fw.name} -> ${ctrl.name}:`, err?.message || err);
        // continue with next control
      }
    }
  }

  console.log('[sync] Completed.');
}

main().catch((err) => {
  console.error('[sync] Failed:', err?.message || err);
  process.exit(1);
});
