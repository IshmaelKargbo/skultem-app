export const RequestDemoApi = () => {
  const { $api } = useNuxtApp()

  return {
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
