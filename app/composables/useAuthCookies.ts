// Single source of truth for auth cookie options so every read/write site
// gets `secure` + `sameSite` consistently instead of relying on each of the
// ~10 call sites to remember to set them.
const AUTH_COOKIE_OPTS = { sameSite: 'lax' as const, secure: true }

export function useAuthCookies() {
  const accessToken = useCookie<string | null>('access_token', AUTH_COOKIE_OPTS)
  const refreshToken = useCookie<string | null>('refresh_token', AUTH_COOKIE_OPTS)
  const activeRole = useCookie<string | null>('active_role', { ...AUTH_COOKIE_OPTS, default: () => null })

  return { accessToken, refreshToken, activeRole }
}
