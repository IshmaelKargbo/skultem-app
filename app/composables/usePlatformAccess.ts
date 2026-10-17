// What the signed-in system admin may do on the platform, loaded once. The menu uses it to show only what they can
// open; the server still checks every request.
export function usePlatformAccess() {
  const access = useState<PlatformAccess | null>('platform-access', () => null)

  async function load(force = false) {
    if (access.value && !force) return
    try {
      access.value = (await PlatformApi().me()) ?? null
    } catch {
      access.value = null
    }
  }

  // Until the permissions are known (or if they can't be fetched) everything is shown rather than hiding the whole
  // menu - hiding is only a convenience, and the server refuses whatever this admin may not do.
  const can = (permission?: string) =>
    !permission || !access.value || access.value.permissions.includes(permission as PlatformPermission)

  return { access, load, can }
}
