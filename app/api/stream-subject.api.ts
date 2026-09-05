export const StreamSubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, streamId?: string, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (streamId) params.set('streamId', streamId)
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/stream/subject?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch stream subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByStream: async (id: string, page: number, size: number) => {
      try {
        const res = await $api(`/stream/subject/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch stream subjects by class')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateClassSubjectDto) => {
      try {
        return await $api(`/subject-assignment/stream/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
