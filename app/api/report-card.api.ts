export const ReportCardApi = () => {
  const { $api } = useNuxtApp()

  return {
    generate: async (payload: { classId: string, termId: string, includeAttendance: boolean, includeRanking: boolean }) => {
      try {
        const res = await $api('/report-card/generate', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    byStudent: async (studentId: string) => {
      try {
        const res = await $api(`/report-card/student/${studentId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    fetchAll: async (page: number, size: number, filters?: { classId?: string, termId?: string, search?: string }) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.classId) query.set('classId', filters.classId)
        if (filters?.termId) query.set('termId', filters.termId)
        if (filters?.search) query.set('search', filters.search)

        const res = await $api(`/report-card?${query.toString()}`) as any
        const meta = useMeta(res.meta)
        return { data: res.data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    stats: async () => {
      try {
        const res = await $api('/report-card/stats') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    get: async (id: string) => {
      try {
        const res = await $api(`/report-card/${id}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    updateRemark: async (id: string, remark: string) => {
      try {
        const res = await $api(`/report-card/${id}/remark`, {
          method: 'PATCH',
          body: { remark }
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    trackDownload: async (id: string) => {
      try {
        await $api(`/report-card/${id}/download`, { method: 'POST' })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
