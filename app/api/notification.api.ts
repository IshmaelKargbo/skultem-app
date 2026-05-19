export const NotificationApi = () => {
  const { $api } = useNuxtApp()

  return {
    markAsRead: async (id: string) => {
      try {
        await $api(`/notifications/open/${id}`) as any
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
