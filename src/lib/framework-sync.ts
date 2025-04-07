import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { frameworkData } from '@/data/frameworks';
import { Framework } from '@/types/framework';

// Cache for framework slug to UUID mapping
let frameworkUuidCache: Record<string, string> = {};

export async function syncFrameworks() {
  const supabase = createClientComponentClient();
  
  for (const [slug, data] of Object.entries(frameworkData)) {
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
        frameworkUuidCache[slug] = inserted.id;
      }
    }
  }

  return frameworkUuidCache;
}

export function getFrameworkUuid(slug: string): string | undefined {
  return frameworkUuidCache[slug];
}

// Initialize cache on module load
if (typeof window !== 'undefined') {
  syncFrameworks().catch(console.error);
}
