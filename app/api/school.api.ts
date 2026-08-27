export const SchoolApi = () => {
  const { $api } = useNuxtApp()

  return {
    checkTenant: async (domain: string) => {
      try {
        const res = await $api(`/auth/tenant?domain=${domain}`) as any

        if (!res)
          throw new Error('Failed to fetch auth')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    get: async (id: string) => {
      try {
        const res = await $api(`/school/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch school')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    update: async (payload: { name: string, domain: string, region: string, district: string, chiefdom: string, city: string, street: string }) => {
      try {
        const res = await $api('/school', {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update school')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Logo and principal signature are uploaded to a dedicated Cloudflare R2
    // bucket on the backend - this just sends whichever fields changed.
    updateBranding: async (payload: FormData) => {
      try {
        const res = await $api('/school/branding', {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update school branding')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Logo/signature as ready-to-embed data: URIs, not the raw R2 URL - R2's
    // public bucket sends no CORS headers, which breaks html2canvas's PDF
    // capture of those images on the ID card. Use this (not `logo`/
    // `principalSignature` from `get`) anywhere an image gets captured to canvas.
    getBrandingAssets: async () => {
      try {
        const res = await $api('/school/branding/assets') as any

        if (!res)
          throw new Error('Failed to fetch school branding assets')

        return res.data as { logo: string | null, principalSignature: string | null }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
