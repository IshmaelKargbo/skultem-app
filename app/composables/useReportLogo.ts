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
// Shared, session-wide state (useState, not a per-call ref): the logo doesn't change between one
// report page and the next, so only the first page visited this session actually fetches it -
// every report after that reads the already-resolved data URI instantly instead of repeating a
// full R2 round trip + base64 re-encode on every mount.
export function useReportLogo() {
  const logoSrc = useState<string>('report-logo-src', () => '')
  const loading = useState<boolean>('report-logo-loading', () => false)
  const loaded = useState<boolean>('report-logo-loaded', () => false)

  async function loadLogo() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const assets = await SchoolApi().getBrandingAssets()
      logoSrc.value = assets?.logo || ''
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return { logoSrc, loadLogo }
}
