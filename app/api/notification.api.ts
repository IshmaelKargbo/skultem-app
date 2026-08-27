export const NotificationApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number = 1, size: number = 10) => {
      try {
        const res = await $api(`/notifications?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch notifications')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    markAsRead: async (id: string) => {
      try {
        await $api(`/notifications/open/${id}`) as any
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
