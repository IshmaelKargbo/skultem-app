export const ParentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/parent?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch parents')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudent: async (page: number, size: number) => {
      try {
        const res = await $api(`/parent/students?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch parent students')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllNotifications: async (page: number, size: number) => {
      try {
        const res = await $api(`/parent/notifications?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch parent notifications')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateParentDto) => {
      try {
        return await $api('/parent', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
