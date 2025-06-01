// Next.js API route to sync frameworks spec to Supabase tables and log updates
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const specPath = path.join(process.cwd(), 'public', 'framework-spec.json');
  const raw = await fs.promises.readFile(specPath, 'utf8');
  const { frameworks: specFrameworks } = JSON.parse(raw);
  const logs: any[] = [];

  for (const fw of specFrameworks) {
    // upsert framework meta
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
      logs.push({ framework: fw.name, action: 'created', details: fw });
    } else if (existing.version !== fw.version) {
      await supabase
        .from('frameworks')
        .update({ version: fw.version, description: fw.description, last_synced_at: new Date().toISOString() })
        .eq('id', frameworkId);
      logs.push({ framework: fw.name, action: 'updated', from: existing.version, to: fw.version });
    }

    // upsert controls
    for (const ctrl of fw.controls) {
      await supabase
        .from('controls')
        .upsert({ framework_id: frameworkId, control_id: ctrl.control_id, name: ctrl.name, description: ctrl.description, subcontrols: ctrl.subcontrols })
        .eq('framework_id', frameworkId)
        .eq('control_id', ctrl.control_id);
    }

    // log update events
    if (logs.length) {
      await supabase
        .from('framework_update_logs')
        .insert({ framework_id: frameworkId, changes: logs });
    }
  }

  return NextResponse.json({ success: true, logs });
}
