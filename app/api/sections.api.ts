export const SectionApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, query?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (query) params.set('query', query)

        const res = await $api(`/section?${params}`) as any

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
