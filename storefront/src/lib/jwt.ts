export function isTokenExpired(token: string | null | undefined, skewMs = 0): boolean {
  if (!token) return true
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const exp = (JSON.parse(atob(payload)) as { exp?: number }).exp
    return typeof exp !== 'number' || exp * 1000 - skewMs <= Date.now()
  } catch {
    return true
  }
}
