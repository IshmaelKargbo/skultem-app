export const NoticeApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number = 1, size: number = 100) => {
      try {
        const res = await $api(`/notice?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch notices')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateNoticeDto) => {
      try {
        const res = await $api('/notice', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    update: async (id: string, payload: CreateNoticeDto) => {
      try {
        const res = await $api(`/notice/${id}`, {
          method: 'PUT',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    togglePin: async (id: string) => {
      try {
        const res = await $api(`/notice/${id}/pin`, {
          method: 'PATCH'
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    remove: async (id: string) => {
      try {
        await $api(`/notice/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
