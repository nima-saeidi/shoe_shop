/**
 * Upload paths come back as `/static/...`. They are kept relative (identically on server and
 * client) and served by the `/static` rewrite in next.config.ts, so next/image can optimise them
 * and there is no hydration mismatch.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return path.replace(/^https?:\/\/[^/]+(?=\/static\/)/, '')
}
