export const SystemApi = () => {
  const { $api } = useNuxtApp()

  return {
    getStats: async () => {
      try {
        const res = await $api('/system/stats') as any

        if (!res)
          throw new Error('Failed to fetch system stats')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    listSchools: async (page: number, size: number, query?: string) => {
      try {
        let params = ''
        if (query) params += `&query=${encodeURIComponent(query)}`
        const res = await $api(`/school?page=${page}&size=${size}${params}`) as any

        if (!res)
          throw new Error('Failed to fetch schools')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateSchoolStatus: async (schoolId: string, status: string) => {
      try {
        const res = await $api(`/system/school/${schoolId}/status?status=${status}`, {
          method: 'PUT'
        }) as any

        if (!res)
          throw new Error('Failed to update school status')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    searchUsers: async (query: string, page: number, size: number) => {
      try {
        const res = await $api(`/system/users?query=${encodeURIComponent(query)}&page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to search users')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
