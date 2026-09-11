// A single reactive, app-wide "what school is this" value, backed by useSchoolCache. Every place
// that shows the school's name/logo (the sidebar, the login page, the splash screen) reads the
// same useState singleton, so whichever spot happens to fetch fresh data first (see useBranding's
// applyAndCache, which calls setSchool once a fetch resolves) updates all of them at once - a
// first-ever visit (empty cache) no longer leaves some of them stuck on the Skultem fallback for
// the rest of the session just because they read the cache once, synchronously, before it existed.
export function useSchoolInfo() {
  const school = useState<CachedSchool | null>('school-info', () => null)

  function currentDomain(): string {
    if (typeof window === 'undefined') return ''
    return resolveTenantSlug(window.location.hostname)
  }

  // Cheap and idempotent - safe to call from every component that wants the school's info, not
  // just the one place that happens to run first.
  function hydrateFromCache() {
    if (school.value) return

    const { getCachedSchool } = useSchoolCache()
    const domain = currentDomain()
    if (!domain) return

    const cached = getCachedSchool(domain)
    if (cached) school.value = cached
  }

  function setSchool(data: CachedSchool) {
    school.value = data
  }

  return { school, hydrateFromCache, setSchool, currentDomain }
}
