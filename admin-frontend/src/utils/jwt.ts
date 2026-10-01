/** Returns the `exp` claim of a JWT in milliseconds since epoch, or null if unreadable. */
export function getTokenExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const exp = (JSON.parse(json) as { exp?: number }).exp
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

/** True when the token is missing, unreadable, or expires within `skewMs`. */
export function isTokenExpired(token: string | null | undefined, skewMs = 0): boolean {
  const exp = getTokenExpiryMs(token)
  return exp === null || exp - skewMs <= Date.now()
}
