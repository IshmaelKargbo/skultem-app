export const WidgetApi = () => {
  const { $api } = useNuxtApp()

  return {
    runAnalytics: async (payload: any, page: number = 1, size: number = 5) => {
      try {
        const res = await $api(`/widget/run?page=${page}&size=${size}`, {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to fetch admin report')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
