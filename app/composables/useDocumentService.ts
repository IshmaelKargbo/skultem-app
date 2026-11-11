// Whether the server makes PDFs with M-Compose (see MComposeApi). Asked once per visit and shared; while it is
// unknown, or if asking fails, it reads as off and pages keep drawing their PDFs in the browser.
export function useDocumentService() {
  const status = useState<DocumentServiceStatus | null>('document-service-status', () => null)
  const pending = useState<Promise<DocumentServiceStatus> | null>('document-service-pending', () => null)

  async function ensureLoaded(): Promise<DocumentServiceStatus> {
    if (status.value) return status.value
    if (!pending.value) {
      pending.value = MComposeApi().status().then((s) => {
        status.value = s
        return s
      }).finally(() => {
        pending.value = null
      })
    }
    return pending.value
  }

  return {
    status,
    ensureLoaded,
    reportCards: computed(() => !!status.value?.reportCards)
  }
}
