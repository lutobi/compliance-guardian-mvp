import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { frameworkData } from '@/data/frameworks';
import { Framework } from '@/types/framework';

// Cache for framework slug to UUID mapping
let frameworkUuidCache: Record<string, string> = {};
let syncPromise: Promise<Record<string, string>> | null = null;

export async function syncFrameworks() {
  // If sync is already in progress, wait for it
  if (syncPromise) {
    console.log('Sync already in progress, waiting...');
    return syncPromise;
  }

  // If cache is already populated, return it
  if (Object.keys(frameworkUuidCache).length > 0) {
    console.log('Cache already populated:', frameworkUuidCache);
    return frameworkUuidCache;
  }

  // Start new sync
  syncPromise = (async () => {
  console.log('Starting framework sync...');
  const supabase = createClientComponentClient();
  
  for (const [slug, data] of Object.entries(frameworkData)) {
    console.log('Syncing framework:', { slug, data });
    // Check if framework exists
    const { data: existing, error: lookupError } = await supabase
      .from('frameworks')
      .select('id')
      .eq('slug', slug)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error(`Error looking up framework ${slug}:`, lookupError);
      continue;
    }

    if (existing) {
      // Framework exists, cache its UUID
      console.log('Framework exists:', { slug, id: existing.id });
      frameworkUuidCache[slug] = existing.id;
    } else {
      // Insert new framework
      const { data: inserted, error: insertError } = await supabase
        .from('frameworks')
        .insert({
          slug,
          name: data.name,
          version: data.version,
          description: data.description
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`Error inserting framework ${slug}:`, insertError);
        continue;
      }

      if (inserted) {
        console.log('Framework inserted:', { slug, id: inserted.id });
        frameworkUuidCache[slug] = inserted.id;
      }
    }
  }

    return frameworkUuidCache;
  })();

  return syncPromise;
}

export async function getFrameworkUuid(slug: string): Promise<string | undefined> {
  // Ensure sync is complete before returning UUID
  await syncFrameworks();
  console.log('Framework sync complete, cache:', frameworkUuidCache);
  console.log('Getting framework UUID for slug:', { slug, cache: frameworkUuidCache });
  return frameworkUuidCache[slug];
}

// Initialize cache on module load
syncFrameworks().catch(console.error);

// Export sync state for loading indicators
export function isSyncComplete(): boolean {
  return Object.keys(frameworkUuidCache).length > 0;
}
