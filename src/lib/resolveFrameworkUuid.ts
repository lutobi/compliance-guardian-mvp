// Shared helper to convert framework slug to UUID
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
  const { data: fw, error } = await supabaseClient
    .from('frameworks')
    .select('id')
    .eq('slug', input)
    .single();
  if (error || !fw) {
    throw new Error('Invalid frameworkId');
  }
  return fw.id;
}
