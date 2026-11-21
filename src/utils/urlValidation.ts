/**
 * Safe URL validation utilities to block unsafe URI schemes (javascript:, data:, vbscript:)
 */
export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  return isSafeHttpUrl(rawUrl) ? rawUrl.trim() : undefined;
}
