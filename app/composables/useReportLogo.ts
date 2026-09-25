// The school logo lives on Cloudflare R2, whose public bucket sends no CORS headers (see the
// backend's R2StorageService.downloadAsDataUri). A plain <img :src="school.logo"> displays fine
// on screen - browsers don't need CORS just to paint pixels - but html2canvas (every report's
// PDF export, via $generatePdf) can't read cross-origin pixel data without it, so the logo always
// comes out as blank space in the exported PDF regardless of how the rest of the page renders.
//
// The ID card export already solved this by having the backend fetch the bytes itself (a
// server-to-server request isn't subject to browser CORS at all) and hand back a same-origin
// data: URI instead of the raw R2 URL - this is that same fetch, for report pages.
//
// A school run in management sections can give each section its own logo, so the logo depends on
// which level the report is about: loadLogo(level) fetches that level's section logo (falling back
// to the school's). With no level, a section-limited user gets their own section's logo and
// everyone else the school's.
//
// Cached session-wide (useState, not a per-call ref), one entry per level: the logo doesn't change
// between one report page and the next, so only the first visit for a level actually fetches it -
// every report after that reads the already-resolved data URI instantly instead of repeating a
// full R2 round trip + base64 re-encode on every mount. reset() drops the cache after branding is edited.
const inflight = new Map<string, Promise<void>>()

export function useReportLogo() {
  const cache = useState<Record<string, string>>('report-logo-cache', () => ({}))
  // Which cache entry this page shows. Local to the page, unlike the cache itself.
  const key = ref('')
  const explicit = ref(false)

  const logoSrc = computed(() => cache.value[key.value] ?? '')

  async function fetchFor(level: string) {
    if (level in cache.value) return
    let pending = inflight.get(level)
    if (!pending) {
      pending = (async () => {
        try {
          const assets = await SchoolApi().getBrandingAssets(level || undefined)
          cache.value = { ...cache.value, [level]: assets?.logo || '' }
        } finally {
          inflight.delete(level)
        }
      })()
      inflight.set(level, pending)
    }
    return pending
  }

  // level: a string picks that level's section logo; null/'' means "no level picked" (the viewer's
  // own section if they're limited to one, else the school's); undefined (no argument) is the
  // page's initial default and never overrides a level the page has already asked for.
  async function loadLogo(level?: string | null) {
    const asked = level !== undefined
    if (!asked && explicit.value) return
    if (asked) explicit.value = true

    // Only a school run in management sections has a logo that differs by level - for any other
    // school every level shares the one school logo, so don't fetch (and cache) it once per level.
    let sectionBased = true
    try {
      sectionBased = (await useSchoolStructure().load())?.managementModel === 'SECTION_BASED'
    } catch { /* can't tell - keep the level */ }

    let target = sectionBased ? level || '' : ''
    if (!target && sectionBased) {
      const scope = await useMyScope().load()
      if (scope && !scope.wholeSchool) target = scope.levels[0] ?? ''
      // A report that named its level while the scope was loading wins over this default.
      if (!asked && explicit.value) return
    }
    key.value = target
    return fetchFor(target)
  }

  function reset() {
    cache.value = {}
    useBrandingAssets().reset()
  }

  return { logoSrc, loadLogo, reset }
}
