export const TermApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res: any = await $api(`/term?page=${page}&size=${size}`)

        if (!res)
          throw new Error('Failed to fetch terms')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getActive: async () => {
      try {
        const res: any = await $api('/term/active')

        if (!res)
          throw new Error('Failed to fetch active term')

        return res.data
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
    },

    activate: async (id: string) => {
      try {
        return await $api(`/term/${id}/activate`, {
          method: 'PUT'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
