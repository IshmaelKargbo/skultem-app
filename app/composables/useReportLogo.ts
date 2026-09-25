// The school logo lives on Cloudflare R2, whose public bucket sends no CORS headers. A plain
// <img :src="school.logo"> displays fine on screen - browsers don't need CORS just to paint pixels -
// but html2canvas (every report's PDF export, via $generatePdf) can't read cross-origin pixel data
// without it, so the logo would come out as blank space in the exported PDF.
//
// So a report shows the logo in two steps: the plain URL straight away (a cheap lookup, and the
// image itself comes from the browser's HTTP cache), then swaps in the same-origin data: URI the
// PDF needs as soon as it's ready (see useBrandingAssets - cached in the browser, so after the
// first time it's instant). A page's PDF button calls `await ready()` first so the export never
// runs before the data: URI is there.
//
// A school run in management sections can give each section its own logo, so the logo depends on
// which level the report is about: loadLogo(level) resolves that level's section logo (falling back
// to the school's). With no level, a section-limited user gets their own section's logo and
// everyone else the school's.
export function useReportLogo() {
  const brandingAssets = useBrandingAssets()

  // Which level this page shows. Local to the page, unlike the caches inside useBrandingAssets.
  const level = ref<string>('')
  const explicit = ref(false)
  const plainSrc = ref('')
  const dataSrc = ref('')
  let readyPromise: Promise<void> = Promise.resolve()
  let generation = 0

  const logoSrc = computed(() => dataSrc.value || plainSrc.value)

  async function resolveTarget(asked: string | null | undefined): Promise<string | undefined> {
    // Only a school run in management sections has a logo that differs by level.
    let sectionBased = true
    try {
      sectionBased = (await useSchoolStructure().load())?.managementModel === 'SECTION_BASED'
    } catch { /* can't tell - keep the level */ }
    if (!sectionBased) return ''

    let target = asked || ''
    if (!target) {
      const scope = await useMyScope().load()
      if (scope && !scope.wholeSchool) target = scope.levels[0] ?? ''
    }
    return target
  }

  // level: a string picks that level's section logo; null/'' means "no level picked" (the viewer's
  // own section if they're limited to one, else the school's); undefined (no argument) is the
  // page's initial default and never overrides a level the page has already asked for.
  async function loadLogo(asked?: string | null) {
    const isAsked = asked !== undefined
    if (!isAsked && explicit.value) return
    if (isAsked) explicit.value = true

    const mine = ++generation
    const target = await resolveTarget(asked)
    // A newer call (another class picked meanwhile) or an explicit level wins over this one.
    if (mine !== generation || (!isAsked && explicit.value) || target === undefined) return

    level.value = target
    const t: BrandingTarget | undefined = target ? { level: target } : undefined

    try {
      const plain = await brandingAssets.getPlain(t)
      if (mine !== generation) return
      plainSrc.value = plain?.logo || ''
      if (!plain?.logo) dataSrc.value = ''
    } catch {
      return
    }

    // Background: the print-safe copy. Not awaited here - the page is already showing the logo.
    readyPromise = brandingAssets.get(t)
      .then((full) => {
        if (mine === generation) dataSrc.value = full?.logo || ''
      })
      .catch(() => { /* the plain logo is still showing */ })
  }

  // Resolves once the print-safe logo is in (or has failed) - await before generating a PDF.
  // Gives up after a while so a very slow connection can't hang the export forever.
  async function ready(timeoutMs = 45000) {
    await Promise.race([readyPromise, new Promise<void>(resolve => setTimeout(resolve, timeoutMs))])
  }

  function reset() {
    brandingAssets.reset()
    dataSrc.value = ''
  }

  return { logoSrc, loadLogo, ready, reset }
}
