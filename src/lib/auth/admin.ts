export function isPlatformAdmin(email?: string | null): boolean {
  if (!email) return false;
  // Prefer public var for client-side visibility; also support server var
  const listPublic = (process.env.NEXT_PUBLIC_PLATFORM_ADMINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const listServer = (process.env.PLATFORM_ADMINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const allowlist = new Set([...listPublic, ...listServer]);
  return allowlist.has(email.toLowerCase());
}
