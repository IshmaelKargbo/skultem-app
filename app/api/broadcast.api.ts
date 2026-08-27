export const BroadcastApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number = 1, size: number = 100) => {
      try {
        const res = await $api(`/broadcast?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch broadcasts')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getAudienceSize: async (audience: Audience) => {
      try {
        const res = await $api(`/broadcast/audience-size?audience=${audience}`) as any
        return res.data as number
      } catch (err: any) {
        useHandleError(err)
      }
    },

    compose: async (payload: ComposeBroadcastDto) => {
      try {
        const res = await $api('/broadcast', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
