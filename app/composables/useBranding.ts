// Applies the current school's brand colors as live CSS variable overrides (see utils/theme.ts),
// backed by useSchoolCache so the right colors show instantly - before the network request even
// resolves, and even if it never does (offline) - and keeps the shared useSchoolInfo state (name/
// logo, read by the sidebar, login page, splash screen, ...) up to date at the same time. Three
// entry points feed into this:
//   - plugins/auth.ts: app boot, when a session cookie already exists
//   - pages/login.vue (post-login): a fresh login within the same SPA session, which a Nuxt
//     plugin doesn't rerun for
//   - pages/login.vue (pre-login): the tenant is known from the subdomain alone, before anyone
//     has signed in
export function useBranding() {
  const { getCachedSchool, setCachedSchool } = useSchoolCache()
  const { school, hydrateFromCache, setSchool, currentDomain } = useSchoolInfo()

  function applyFromCache(domain: string) {
    const cached = getCachedSchool(domain)
    if (cached) applyBrandColors(cached.primaryColor, cached.secondaryColor)
  }

  // Shared by both fetch paths below: apply whatever's cached immediately, fetch fresh data in
  // the background, and only then update the cache + re-apply (in case the colors changed since
  // last cached). A fetch failure (offline, or e.g. a SYSTEM_ADMIN with no school role 403ing)
  // just leaves the cached-or-default colors already applied - never worth surfacing as an error.
  async function applyAndCache(domain: string, fetchSchool: () => Promise<any>) {
    if (domain) applyFromCache(domain)
    hydrateFromCache()

    try {
      const fetched = await fetchSchool()
      if (!fetched) return null

      applyBrandColors(fetched.primaryColor, fetched.secondaryColor)

      const entry: CachedSchool = {
        id: fetched.id,
        name: fetched.name,
        motto: fetched.motto,
        domain,
        logo: fetched.logo,
        principalName: fetched.principalName,
        primaryColor: fetched.primaryColor,
        secondaryColor: fetched.secondaryColor,
      }

      if (domain) setCachedSchool(domain, entry)
      setSchool(entry)

      return fetched
    } catch (error) {
      console.error(error)
      return null
    }
  }

  function applyBrandColorsForCurrentSchool() {
    return applyAndCache(currentDomain(), () => SchoolApi().get('current'))
  }

  function applyBrandColorsForTenant(domain: string) {
    return applyAndCache(domain, () => SchoolApi().checkTenant(domain))
  }

  function clearBrandColors() {
    applyBrandColors(null, null)
    school.value = null
  }

  return { applyBrandColorsForCurrentSchool, applyBrandColorsForTenant, clearBrandColors }
}
