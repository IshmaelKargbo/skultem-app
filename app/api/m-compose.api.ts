// M-Compose, the document engine, through Skultem's own server (/m-compose). The browser never talks to the engine
// and never sees its key: the server renders the PDFs and signs the designer link.
export type DocumentServiceStatus = { enabled: boolean, reportCards: boolean, externalExams: boolean }

// What "Check connection" found (platform staff).
export type DocumentServiceCheck = {
  configured: boolean, reachable: boolean, keyAccepted: boolean, message: string,
  designer: boolean, reportCards: boolean, externalExams: boolean
}

export const MComposeApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Which documents the server makes. Any failure reads as "off", so the app keeps drawing PDFs itself.
    status: async (): Promise<DocumentServiceStatus> => {
      try {
        const res = await $api('/m-compose/status') as any
        return { enabled: !!res?.data?.enabled, reportCards: !!res?.data?.reportCards, externalExams: !!res?.data?.externalExams }
      } catch {
        return { enabled: false, reportCards: false, externalExams: false }
      }
    },

    // Platform staff: is the engine running, does it accept Skultem's key, what is on.
    check: async (): Promise<DocumentServiceCheck | undefined> => {
      try {
        const res = await $api('/m-compose/check') as any
        return res?.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Platform staff: is sign-in to the designer set up?
    designerAvailable: async (): Promise<boolean> => {
      try {
        const res = await $api('/m-compose/designer-link') as any
        return !!res?.data?.enabled
      } catch {
        return false
      }
    },

    // Platform staff: a one-time, 5-minute link that signs them in to the designer.
    designerLink: async (): Promise<string | undefined> => {
      try {
        const res = await $api('/m-compose/designer-link', { method: 'POST' }) as any
        return res?.data?.url
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}

// Fetches a file from the API with the access token, for showing in the page (no download).
export async function fetchApiFile(path: string, fallbackName: string): Promise<{ blob: Blob, filename: string }> {
  const { accessToken } = useAuthCookies()
  const res = await fetchOrExplain(`${apiBaseUrl()}${path}`, {
    headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
  })
  if (!res.ok) throw await downloadError(res, 'Failed to make the document')
  const disposition = res.headers.get('content-disposition') || ''
  const filename = disposition.includes('filename=')
    ? disposition.split('filename=')[1]!.replace(/"/g, '').trim()
    : fallbackName
  return { blob: await res.blob(), filename }
}

// Fetches a file from the API with the access token and saves it under the server's name.
export async function downloadApiFile(path: string, fallbackName: string) {
  const { accessToken } = useAuthCookies()
  const res = await fetchOrExplain(`${apiBaseUrl()}${path}`, {
    headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
  })
  if (!res.ok) throw await downloadError(res, 'Failed to download the file')

  const disposition = res.headers.get('content-disposition') || ''
  const filename = disposition.includes('filename=')
    ? disposition.split('filename=')[1]!.replace(/"/g, '').trim()
    : fallbackName
  downloadBlob(await res.blob(), filename)
}
