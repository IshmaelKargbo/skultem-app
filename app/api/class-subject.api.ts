export const ClassSubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, classId?: string, mandatory?: boolean, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (classId) params.set('classId', classId)
        if (mandatory !== undefined) params.set('mandatory', String(mandatory))
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/class-subject?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch class subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByClass: async (id: string, stream: string, page: number, size: number) => {
      try {
        const res = await $api(`/class-subject/${id}?stream=${stream}&page=${page}&size=${size}`) as any
        if (!res)
          throw new Error('Failed to fetch class subjects by class')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateClassSubjectDto) => {
      try {
        return await $api(`/subject-assignment/class/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
