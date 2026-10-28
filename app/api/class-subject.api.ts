export const ClassSubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, classId?: string, mandatory?: boolean, query?: string, sortBy?: string, direction?: string, streamId?: string, sectionId?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (classId) params.set('classId', classId)
        if (mandatory !== undefined) params.set('mandatory', String(mandatory))
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)
        if (streamId) params.set('streamId', streamId)
        if (sectionId) params.set('sectionId', sectionId)

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
    // `section` (optional) picks that section's teacher when a stream runs in several sections.
    getAllByClass: async (id: string, stream: string, page: number, size: number, section?: string) => {
      try {
        const params = new URLSearchParams({ stream: stream || '', page: String(page), size: String(size) })
        if (section) params.set('section', section)
        const res = await $api(`/class-subject/${id}?${params}`) as any
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
    },
    duplicate: async (sourceClassId: string, targetClassIds: string[]) => {
      try {
        return await $api(`/subject-assignment/class/${sourceClassId}/duplicate`, {
          method: 'POST',
          body: { targetClassIds }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
