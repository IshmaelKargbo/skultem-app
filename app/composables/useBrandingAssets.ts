// The logo / principal signature to print for a level, student, staff member or receipt, in the two
// shapes a page needs:
//   * getPlain(target)  - the plain image URLs plus principal / address. A cheap database lookup
//                         (no image download), fine for anything painted on screen.
//   * get(target)       - the same with the images as same-origin data: URIs, which is what a PDF /
//                         print capture needs (R2 sends no CORS headers). Served from the browser
//                         cache when this exact image has been fetched before, else fetched once
//                         and cached - see utils/imageDataCache.ts.
// Only a school run in management sections has anything that differs between them, so for every
// other school the target is ignored and it's one school-wide result. reset() after the school's
// branding is edited.
type Assets = NonNullable<Awaited<ReturnType<ReturnType<typeof SchoolApi>['getBrandingAssets']>>>

export function useBrandingAssets() {
  const plainCache = useState<Record<string, Assets>>('branding-plain', () => ({}))
  const dataCache = useState<Record<string, Assets>>('branding-data', () => ({}))

  async function scopeKey(target?: BrandingTarget): Promise<{ key: string, target?: BrandingTarget }> {
    let sectionBased = false
    try {
      sectionBased = (await useSchoolStructure().load())?.managementModel === 'SECTION_BASED'
    } catch {
      // Can't tell - treat as not section-based (the school-wide branding).
    }
    if (!sectionBased || !target) return { key: '' }
    const { level, studentId, teacherId, referenceNo } = target
    return { key: JSON.stringify([level ?? '', studentId ?? '', teacherId ?? '', referenceNo ?? '']), target }
  }

  async function getPlain(target?: BrandingTarget): Promise<Assets | undefined> {
    const { key, target: t } = await scopeKey(target)
    if (plainCache.value[key]) return plainCache.value[key]
    const res = await SchoolApi().getBrandingAssets({ ...t, inline: false })
    if (res) plainCache.value = { ...plainCache.value, [key]: res }
    return res
  }

  async function get(target?: BrandingTarget): Promise<Assets | undefined> {
    const { key, target: t } = await scopeKey(target)
    if (dataCache.value[key]) return dataCache.value[key]

    const plain = await getPlain(target)
    if (!plain) return undefined

    // Everything already in the browser cache: no request for the images at all.
    const logo = readCachedDataUri(plain.logo)
    const signature = readCachedDataUri(plain.principalSignature)
    let result: Assets | undefined
    if ((!plain.logo || logo) && (!plain.principalSignature || signature)) {
      result = { ...plain, logo: logo || null, principalSignature: signature || null }
    } else {
      result = await SchoolApi().getBrandingAssets(t)
      if (result) {
        writeCachedDataUri(plain.logo, result.logo)
        writeCachedDataUri(plain.principalSignature, result.principalSignature)
      }
    }

    // Only remember a result that actually has the images: a slow R2 can leave one out (the plain URL
    // keeps showing meanwhile), and caching that gap would hide it for the rest of the session.
    const complete = !!result && (!plain.logo || !!result.logo) && (!plain.principalSignature || !!result.principalSignature)
    if (result && complete) dataCache.value = { ...dataCache.value, [key]: result }
    return result
  }

  function reset() {
    plainCache.value = {}
    dataCache.value = {}
  }

  return { get, getPlain, reset }
}
