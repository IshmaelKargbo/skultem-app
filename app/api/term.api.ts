export const TermApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/term?page=${page}&size=${size}`)

        if (!res)
          throw new Error('Failed to fetch terms')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateTermDto) => {
      try {
        return await $api('/term', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
