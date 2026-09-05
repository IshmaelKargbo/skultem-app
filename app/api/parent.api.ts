export const ParentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/parent?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch parents')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudent: async (page: number, size: number) => {
      try {
        const res = await $api(`/parent/students?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch parent students')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateParentDto) => {
      try {
        return await $api('/parent', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
