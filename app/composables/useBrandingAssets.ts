// The logo / principal signature (as data: URIs, for PDF capture) to print for a level, student,
// staff member or receipt. Only a school run in management sections has anything that differs
// between them, so for every other school this returns one school-wide result fetched once per
// session instead of a fresh image download per receipt / payslip / card. reset() after the
// school's branding is edited.
export function useBrandingAssets() {
  const cache = useState<Awaited<ReturnType<ReturnType<typeof SchoolApi>['getBrandingAssets']>> | null>(
    'school-wide-branding-assets', () => null)

  async function get(target?: BrandingTarget) {
    let sectionBased = false
    try {
      sectionBased = (await useSchoolStructure().load())?.managementModel === 'SECTION_BASED'
    } catch {
      // Can't tell - treat as not section-based (the school-wide branding).
    }

    if (sectionBased) return SchoolApi().getBrandingAssets(target)

    if (!cache.value) cache.value = (await SchoolApi().getBrandingAssets()) ?? null
    return cache.value ?? undefined
  }

  function reset() {
    cache.value = null
  }

  return { get, reset }
}
