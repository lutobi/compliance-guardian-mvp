// Shared helper to convert framework slug to UUID
import { frameworkData } from '@/data/frameworks';

export async function resolveFrameworkUuid(
  supabaseClient: any,
  input: string | null
): Promise<string> {
  if (!input) {
    throw new Error('frameworkId is required');
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(input)) {
    return input;
  }

  // 1) Try slug column if it exists
  try {
    const { data: fwBySlug, error: slugErr } = await supabaseClient
      .from('frameworks')
      .select('id')
      .eq('slug', input)
      .limit(1);
    if (!slugErr && Array.isArray(fwBySlug) && fwBySlug.length > 0) {
      return fwBySlug[0].id;
    }
  } catch {
    // ignore, fall back to name-based resolution
  }

  // 2) Map static slug -> static name, then look up by name (case-insensitive)
  const staticEntry = frameworkData[input];
  const staticName = staticEntry?.name;
  if (staticName) {
    const { data: fwByName, error: nameErr } = await supabaseClient
      .from('frameworks')
      .select('id, name')
      .ilike('name', staticName);
    if (!nameErr && Array.isArray(fwByName) && fwByName.length > 0) {
      return fwByName[0].id;
    }
    // Try exact lowercased equals as a fallback
    const { data: fwByNameEq } = await supabaseClient
      .from('frameworks')
      .select('id, name')
      .eq('name', staticName)
      .limit(1);
    if (Array.isArray(fwByNameEq) && fwByNameEq.length > 0) {
      return fwByNameEq[0].id;
    }
  }

  // 3) As a last resort, return the original input (may be a slug used by API that can handle it)
  return input;
}
