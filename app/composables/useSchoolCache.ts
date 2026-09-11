// A small localStorage cache of each school's branding/basics, keyed by tenant subdomain (a
// device can have more than one school's portal open across visits, so schools don't clobber each
// other's cached entry). This is what lets the login page (and the app on boot) apply brand colors
// - and, later, show the school's own name/logo - instantly on repeat visits instead of waiting on
// a network round trip, and keeps working when there's no network at all (the PWA shell itself is
// already precached; this fills in the one bit of school-specific data that isn't).
export type CachedSchool = {
  id: string
  name: string | null
  motto: string | null
  domain: string
  logo: string | null
  principalName: string | null
  primaryColor: string | null
  secondaryColor: string | null
}

const STORAGE_PREFIX = 'skultem:school:'

export function useSchoolCache() {
  function storageKey(domain: string) {
    return `${STORAGE_PREFIX}${domain}`
  }

  function getCachedSchool(domain: string): CachedSchool | null {
    if (!domain || typeof localStorage === 'undefined') return null

    try {
      const raw = localStorage.getItem(storageKey(domain))
      return raw ? (JSON.parse(raw) as CachedSchool) : null
    } catch {
      // Corrupt entry, or localStorage unavailable (private browsing can throw on access, not
      // just on write) - treat exactly like a cache miss.
      return null
    }
  }

  function setCachedSchool(domain: string, school: Partial<CachedSchool> & { id: string }) {
    if (!domain || typeof localStorage === 'undefined') return

    const entry: CachedSchool = {
      id: school.id,
      name: school.name ?? null,
      motto: school.motto ?? null,
      domain,
      logo: school.logo ?? null,
      principalName: school.principalName ?? null,
      primaryColor: school.primaryColor ?? null,
      secondaryColor: school.secondaryColor ?? null,
    }

    try {
      localStorage.setItem(storageKey(domain), JSON.stringify(entry))
    } catch {
      // Storage full or blocked (quota, private browsing) - caching is a nice-to-have, never
      // worth failing the caller over.
    }
  }

  return { getCachedSchool, setCachedSchool }
}
