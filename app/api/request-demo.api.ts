export const RequestDemoApi = () => {
  const { $api } = useNuxtApp()

  return {
    list: async (page: number, size: number) => {
      try {
        const res = await $api(`/demos?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch demo requests')

        return { ...res, data: res.data, meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateRequestDemoPayload) => {
      try {
        const res = await $api('/demos', {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to submit demo request')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
