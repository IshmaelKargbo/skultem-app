export const SectionApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/section?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch sections')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateSectionDto) => {
      try {
        return await $api('/section', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
