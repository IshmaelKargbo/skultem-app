export const StreamApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/stream?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch streams')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateStreamDto) => {
      try {
        return await $api('/stream', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/stream/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch stream')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
