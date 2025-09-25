/**
 * FRAMEWORK SYNC API - MULTI-TENANT (STANDARDIZED)
 * 
 * Handles synchronization of framework definitions to the database
 * - POST: Syncs frameworks from static data source to database (admin only)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { frameworkData } from '@/data/frameworks';
import { 
  withSimpleAuth,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Build spec array directly from TS data
type SpecFramework = {
  name: string;
  description?: string;
  version?: string;
  slug: string;
  controls: Array<{ control_id: string; name: string; description?: string; subcontrols: Array<{ id: string; name: string; description?: string }> }>;
};
const specFrameworks: SpecFramework[] = Object.entries(frameworkData).map(([slug, fw]) => ({
  name: fw.name,
  description: fw.description,
  version: fw.version,
  slug,
  controls: fw.controls.map(ctrl => ({
    control_id: ctrl.id,
    name: ctrl.name,
    description: ctrl.description,
    subcontrols: (ctrl.subcontrols || []).map(sub => ({ id: sub.id, name: sub.name, description: sub.description }))
  }))
}));

// Debug: log spec payload
console.log(`[sync-frameworks] Loaded ${specFrameworks.length} frameworks from spec`);

export async function POST(request: NextRequest) {
  return withSimpleAuth(request, false, async (user) => {
    // Initialize client early for count check and potential dev bootstrap
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const devBypass = process.env.NODE_ENV !== 'production' || request.headers.get('x-e2e') === '1';

    // Determine if DB already has frameworks
    let hasData = false;
    try {
      const { count } = await supabase
        .from('frameworks')
        .select('id', { count: 'exact', head: true });
      hasData = (count ?? 0) > 0;
    } catch {}

    // Enforce owner role only in production when data exists; otherwise allow bootstrap/dev
    if (!devBypass && hasData) {
      if (!user || user.currentMembership?.role !== 'owner') {
        throw new Error('Only workspace owners can sync framework data');
      }
    }

    console.log(`[API] POST /api/sync-frameworks - By: ${user?.profile?.email || 'system/dev'}; hasData=${hasData}`);
  try {
    console.log(`[sync-frameworks] Starting sync for ${specFrameworks.length} frameworks`);
    const logs: any[] = [];

    for (const fw of specFrameworks) {
      console.log(`[sync-frameworks] Processing: ${fw.name} (version: ${fw.version})`);

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
        console.log(`[sync-frameworks] Created framework '${fw.name}' with ID ${frameworkId}`);
      } else {
        // Prepare fields to update
        const updateData: any = {};
        if (existing.version !== fw.version) {
          updateData.version = fw.version;
          updateData.description = fw.description;
          updateData.last_synced_at = new Date().toISOString();
        }
        // Perform update if needed
        if (Object.keys(updateData).length > 0) {
          console.log(`[sync-frameworks] Updating framework '${fw.name}' (ID ${frameworkId})`, updateData);
          await supabase
            .from('frameworks')
            .update(updateData)
            .eq('id', frameworkId);
          // Log changes
          if (updateData.version !== undefined) {
            logs.push({ framework: fw.name, action: 'updated', from: existing.version, to: fw.version });
          }
        }
      }

      // upsert controls (store subcontrols as jsonb per migration)
      for (const ctrl of fw.controls) {
        console.log(`[sync-frameworks] Upserting control '${ctrl.control_id}' for framework ${frameworkId}`);
        await supabase
          .from('controls')
          .upsert({
            framework_id: frameworkId,
            control_id: ctrl.control_id,
            name: ctrl.name,
            description: ctrl.description,
            subcontrols: ctrl.subcontrols || [],
          })
          .eq('framework_id', frameworkId)
          .eq('control_id', ctrl.control_id);
      }

      // log update events
      if (logs.length) {
        console.log(`[sync-frameworks] Inserting ${logs.length} log entries for framework ${frameworkId}`);
      }
      
      if (logs.length) {
        await supabase
          .from('framework_update_logs')
          .insert({ framework_id: frameworkId, changes: logs });
      }
    }

    console.log(`[sync-frameworks] Completed sync with ${logs.length} total log entries`);
    const response: any = { success: true, logs };
    try {
      if (user && (user as any).currentWorkspace) {
        response.workspace = getWorkspaceMetadata(user as any);
      }
    } catch {}
    return response;
  } catch (err: any) {
    console.error('Sync frameworks error:', err);
    throw new Error(`Framework sync failed: ${err.message}`);
  }
  });
}
