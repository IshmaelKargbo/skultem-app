export const AuditApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, academicYearId?: string) => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size)
        })

        if (academicYearId) {
          params.set('academicYearId', academicYearId)
        }

        const res = await $api(`/audit?${params.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch audit logs')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
