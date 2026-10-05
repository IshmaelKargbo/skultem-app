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
    getCount: async () => {
      try {
        const res = await $api('/school/count') as any

        if (!res)
          throw new Error('Failed to fetch school count')

        return res.data as { count: number }
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
    update: async (payload: { name: string, domain: string, region: string, district: string, chiefdom: string, city: string, street: string, attendanceThreshold?: number, attendanceWindowDays?: number, attendanceMinDays?: number, attendanceStreakDays?: number, gradeApprover?: string, genderComposition?: string }) => {
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
    // Pass a level to get that level's management section's own branding (falling back to the
    // school's) - reports about one class/level should. Omit it for the school-wide branding.
    // A string is a level; an object can name a student (their current class), a staff member
    // (teacherId), a receipt (referenceNo) instead, and `inline: false` returns the plain URLs
    // (cheap, for on-screen display) rather than the data: URIs a PDF capture needs.
    getBrandingAssets: async (target?: string | BrandingTarget | null) => {
      try {
        const query = typeof target === 'string' ? { level: target } : target ? { ...target } : undefined
        const res = await $api('/school/branding/assets', { query }) as any

        if (!res)
          throw new Error('Failed to fetch school branding assets')

        return res.data as {
          logo: string | null
          principalSignature: string | null
          principalName: string | null
          address: SectionAddress | null
          // Whether the principal / address are the section's own (vs inherited from the school).
          ownPrincipal: boolean
          ownAddress: boolean
          phone: string | null
        }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Same reason as getBrandingAssets above (R2's public bucket sends no CORS headers, which
    // breaks html2canvas's PDF/print capture) but for any single R2 URL - a student/staff photo
    // on the ID card, say, rather than only the school's logo/signature.
    getAssetDataUri: async (url: string) => {
      try {
        const res = await $api(`/school/asset-as-data-uri?url=${encodeURIComponent(url)}`) as any

        if (!res)
          throw new Error('Failed to fetch asset')

        return res.data?.dataUri as string | null
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Levels offered + management model/sections - see utils/schoolStructure.ts.
    // One management section's own logo / principal / signature / location (multipart, like the
    // school-wide updateBranding). Returns the whole refreshed structure.
    // One management section's own attendance rules. An empty/null value clears that override so the
    // section uses the school's again. Returns the whole refreshed structure.
    updateSectionAttendanceRules: async (sectionId: string, payload: {
      attendanceThreshold: number | null
      attendanceWindowDays: number | null
      attendanceMinDays: number | null
      attendanceStreakDays: number | null
    }) => {
      try {
        const res = await $api(`/school/structure/sections/${sectionId}/attendance-rules`, {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update section attendance rules')

        return res.data as SchoolStructure
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Who approves grades in one section ('CLASS_MASTER' | 'ADMIN'); null = use the school's choice.
    updateSectionGradeApprover: async (sectionId: string, gradeApprover: 'CLASS_MASTER' | 'ADMIN' | null) => {
      try {
        const res = await $api(`/school/structure/sections/${sectionId}/grade-approver`, {
          method: 'PUT',
          body: { gradeApprover }
        }) as any

        if (!res)
          throw new Error('Failed to update section grade approver')

        return res.data as SchoolStructure
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateSectionBranding: async (sectionId: string, payload: FormData) => {
      try {
        const res = await $api(`/school/structure/sections/${sectionId}/branding`, {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update section branding')

        return res.data as SchoolStructure
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getStructure: async () => {
      try {
        const res = await $api('/school/structure') as any

        if (!res)
          throw new Error('Failed to fetch school structure')

        return res.data as SchoolStructure
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateStructure: async (payload: SchoolStructurePayload) => {
      try {
        const res = await $api('/school/structure', {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update school structure')

        return res.data as SchoolStructure
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
