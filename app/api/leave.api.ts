export const LeaveApi = () => {
  const { $api } = useNuxtApp()

  return {
    createForMe: async (payload: { type: string, startDate: string, endDate: string, reason: string }) => {
      try {
        const res = await $api('/leave/me', { method: 'POST', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    listMine: async (page: number, size: number) => {
      try {
        const res = await $api(`/leave/me?page=${page}&size=${size}`) as any
        const meta = useMeta(res.meta)
        return { ...res, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: { teacherId: string, type: string, startDate: string, endDate: string, reason: string }) => {
      try {
        const res = await $api('/leave', { method: 'POST', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    list: async (page: number, size: number, filters: { status?: string, type?: string, search?: string } = {}) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters.status) params.set('status', filters.status)
        if (filters.type) params.set('type', filters.type)
        if (filters.search) params.set('search', filters.search)

        const res = await $api(`/leave?${params.toString()}`) as any
        const meta = useMeta(res.meta)
        return { ...res, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    summary: async () => {
      try {
        const res = await $api('/leave/summary') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getById: async (id: string) => {
      try {
        const res = await $api(`/leave/${id}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    review: async (id: string, approve: boolean, note?: string) => {
      try {
        const res = await $api(`/leave/${id}/review`, { method: 'PATCH', body: { approve, note } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
