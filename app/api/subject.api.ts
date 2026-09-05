export const SubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/subject?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateSubjectDto) => {
      try {
        return await $api('/subject', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/subject/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch subject')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
